#include "Part2Character.h"

#include "Camera/CameraComponent.h"
#include "Components/CapsuleComponent.h"
#include "Components/SpotLightComponent.h"
#include "DriverArms.h"
#include "EnhancedInputComponent.h"
#include "EnhancedInputSubsystems.h"
#include "Engine/LocalPlayer.h"
#include "Engine/StaticMeshActor.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "GameFramework/PlayerController.h"
#include "InputAction.h"
#include "InputActionValue.h"
#include "InputMappingContext.h"
#include "Net/UnrealNetwork.h"

APart2Character::APart2Character()
{
	PrimaryActorTick.bCanEverTick = true;
	bReplicates = true;
	GetCapsuleComponent()->InitCapsuleSize(34.f, 92.f);
	Camera = CreateDefaultSubobject<UCameraComponent>(TEXT("Eyes"));
	Camera->SetupAttachment(GetCapsuleComponent());
	Camera->SetRelativeLocation(FVector(0.f, 0.f, EyeHeight - 92.f));
	Camera->bUsePawnControlRotation = true;
	Camera->SetFieldOfView(78.f);
	Beam = CreateDefaultSubobject<USpotLightComponent>(TEXT("Beam"));
	Beam->SetupAttachment(Camera);
	Beam->SetRelativeLocation(FVector(28.f, 14.f, -28.f));
	Beam->SetIntensityUnits(ELightUnits::Candelas);
	Beam->SetIntensity(0.f);
	Beam->SetInnerConeAngle(11.f);
	Beam->SetOuterConeAngle(30.f);
	Beam->SetAttenuationRadius(4500.f);
	Beam->SetUseTemperature(true);
	Beam->SetTemperature(2850.f);
	Beam->SetVolumetricScatteringIntensity(2.5f);
	UCharacterMovementComponent* M = GetCharacterMovement();
	M->MaxWalkSpeed = WalkSpeed;
	M->MaxWalkSpeedCrouched = CrouchSpeed;
	M->GetNavAgentPropertiesRef().bCanCrouch = true;
	M->SetCrouchedHalfHeight(58.f);
	M->BrakingDecelerationWalking = 900.f;          // (snow: heavy to start, quick to stop)
	M->MaxAcceleration = 900.f;
	M->JumpZVelocity = 300.f;                       // (out of deep snow: barely)
	M->AirControl = 0.1f;
	M->bCanWalkOffLedgesWhenCrouching = false;
	bUseControllerRotationYaw = true;
}

void APart2Character::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
	Super::GetLifetimeReplicatedProps(OutLifetimeProps);
	DOREPLIFETIME_CONDITION(APart2Character, Stamina, COND_OwnerOnly);
	DOREPLIFETIME_CONDITION(APart2Character, Battery, COND_OwnerOnly);
	DOREPLIFETIME_CONDITION(APart2Character, Warmth, COND_OwnerOnly);
	DOREPLIFETIME(APart2Character, bFlashlightOn);
}

void APart2Character::BeginPlay()
{
	Super::BeginPlay();
	auto IA = [](const TCHAR* Path) { return LoadObject<UInputAction>(nullptr, Path); };
	MoveAction = IA(TEXT("/Game/Input/Actions/IA_Move.IA_Move"));
	LookAction = IA(TEXT("/Game/Input/Actions/IA_Look.IA_Look"));
	MouseLookAction = IA(TEXT("/Game/Input/Actions/IA_MouseLook.IA_MouseLook"));
	JumpAction = IA(TEXT("/Game/Input/Actions/IA_Jump.IA_Jump"));
	SprintAction = IA(TEXT("/Game/Variant_Horror/Input/IA_Sprint.IA_Sprint"));
	CrouchAction = IA(TEXT("/Game/HollowAcre/Input/IA_Crouch.IA_Crouch"));
	FlashlightAction = IA(TEXT("/Game/HollowAcre/Input/IA_Flashlight.IA_Flashlight"));
	for (const TCHAR* P : {TEXT("/Game/Input/IMC_Default.IMC_Default"), TEXT("/Game/Input/IMC_MouseLook.IMC_MouseLook"),
		TEXT("/Game/Variant_Horror/Input/IMC_Horror.IMC_Horror"), TEXT("/Game/HollowAcre/Input/IMC_Part2.IMC_Part2")})
	{
		if (UInputMappingContext* C = LoadObject<UInputMappingContext>(nullptr, P))
		{
			Contexts.Add(C);
		}
	}
	ApplyLight();
}

void APart2Character::PawnClientRestart()
{
	Super::PawnClientRestart();
	APlayerController* PC = Cast<APlayerController>(GetController());
	if (!PC || !PC->GetLocalPlayer())
	{
		return;
	}
	if (UEnhancedInputLocalPlayerSubsystem* S = ULocalPlayer::GetSubsystem<UEnhancedInputLocalPlayerSubsystem>(PC->GetLocalPlayer()))
	{
		S->ClearAllMappings();
		for (UInputMappingContext* C : Contexts)
		{
			S->AddMappingContext(C, 0);
		}
	}
	UE_LOG(LogTemp, Display, TEXT("Part2Character: controls on (%d mapping sets)"), Contexts.Num());
}

void APart2Character::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
	Super::SetupPlayerInputComponent(PlayerInputComponent);
	UEnhancedInputComponent* E = Cast<UEnhancedInputComponent>(PlayerInputComponent);
	if (!E)
	{
		return;
	}
	if (MoveAction)
	{
		E->BindAction(MoveAction, ETriggerEvent::Triggered, this, &APart2Character::Move);
	}
	for (UInputAction* L : {LookAction.Get(), MouseLookAction.Get()})
	{
		if (L)
		{
			E->BindAction(L, ETriggerEvent::Triggered, this, &APart2Character::Look);
		}
	}
	if (JumpAction)
	{
		E->BindAction(JumpAction, ETriggerEvent::Started, this, &ACharacter::Jump);
		E->BindAction(JumpAction, ETriggerEvent::Completed, this, &ACharacter::StopJumping);
	}
	if (SprintAction)
	{
		E->BindAction(SprintAction, ETriggerEvent::Started, this, &APart2Character::RunStart);
		E->BindAction(SprintAction, ETriggerEvent::Completed, this, &APart2Character::RunStop);
	}
	if (CrouchAction)
	{
		E->BindAction(CrouchAction, ETriggerEvent::Started, this, &APart2Character::CrouchToggle);
	}
	if (FlashlightAction)
	{
		E->BindAction(FlashlightAction, ETriggerEvent::Started, this, &APart2Character::FlashlightToggle);
	}
}

void APart2Character::Move(const FInputActionValue& V)
{
	const FVector2D In = V.Get<FVector2D>();
	if (Controller)
	{
		const FRotator Yaw(0.f, Controller->GetControlRotation().Yaw, 0.f);
		AddMovementInput(FRotationMatrix(Yaw).GetUnitAxis(EAxis::X), In.Y);
		AddMovementInput(FRotationMatrix(Yaw).GetUnitAxis(EAxis::Y), In.X);
	}
}

void APart2Character::Look(const FInputActionValue& V)
{
	const FVector2D In = V.Get<FVector2D>();
	AddControllerYawInput(In.X);
	AddControllerPitchInput(In.Y);
}

void APart2Character::RunStart()
{
	bWantsRun = true;
	if (bIsCrouched)
	{
		UnCrouch();
	}
	ServerSetRunning(true);
}

void APart2Character::RunStop()
{
	bWantsRun = false;
	ServerSetRunning(false);
}

void APart2Character::ServerSetRunning_Implementation(bool bOn)
{
	bWantsRun = bOn;
}

void APart2Character::CrouchToggle()
{
	if (bIsCrouched)
	{
		UnCrouch();
	}
	else
	{
		Crouch();
	}
}

void APart2Character::FlashlightToggle()
{
	bFlashlightOn = !bFlashlightOn;          // (shown at once here; the host makes it so for everyone)
	ApplyLight();
	ServerSetFlashlight(bFlashlightOn);
}

void APart2Character::ServerSetFlashlight_Implementation(bool bOn)
{
	bFlashlightOn = bOn;
	ApplyLight();
}

void APart2Character::OnRep_Flashlight()
{
	ApplyLight();
}

void APart2Character::ApplyLight()
{
	// the old bulb browning out as the batteries die
	const float Dim = Battery > 0.12f ? 1.f : FMath::Max(0.f, Battery / 0.12f) * (0.75f + 0.25f * FMath::Sin(GetWorld() ? GetWorld()->GetTimeSeconds() * 9.f : 0.f));
	const float Cd = bFlashlightOn ? BeamCd * Dim : 0.f;
	if (HeldBeam)
	{
		HeldBeam->SetIntensity(Cd);
		Beam->SetIntensity(0.f);
	}
	else
	{
		Beam->SetIntensity(Cd);
	}
}

void APart2Character::TakeOverFrom(const FTransform& EyeWorld, ADriverArms* InArms, AStaticMeshActor* InFlashlight, USpotLightComponent* InBeam,
	const FPostProcessSettings& Grade)
{
	// the body under the eyes: the capsule's middle 70 cm below them (the wake stands the eyes 163 cm over the snow; a trace
	// down from here can catch the car beside it)
	const FVector At = EyeWorld.GetLocation() - FVector(0.f, 0.f, EyeHeight - 92.f) + FVector(0.f, 0.f, 1.f);
	SetActorLocation(At, false, nullptr, ETeleportType::TeleportPhysics);
	const FRotator R = EyeWorld.Rotator();
	SetActorRotation(FRotator(0.f, R.Yaw, 0.f));
	if (Controller)
	{
		Controller->SetControlRotation(FRotator(R.Pitch, R.Yaw, 0.f));
	}
	Camera->PostProcessSettings = Grade;
	Camera->SetConstraintAspectRatio(false);
	Arms = InArms;
	HeldLight = InFlashlight;
	HeldBeam = InBeam;
	if (Arms)
	{
		Arms->AttachToActor(this, FAttachmentTransformRules::SnapToTargetNotIncludingScale);
		Arms->SetActorRelativeTransform(FTransform::Identity);
		Arms->AddTickPrerequisiteActor(this);
		Arms->bFree = true;
	}
	if (HeldLight)
	{
		HeldLight->DetachFromActor(FDetachmentTransformRules::KeepWorldTransform);
		HoldAim = HeldLight->GetActorTransform() * GetActorTransform().Inverse();
		bHold = true;
	}
	ApplyLight();
	UE_LOG(LogTemp, Display, TEXT("Part2Character: taken over from the wake at %s, eyes %s"), *At.ToString(), *R.ToString());
}

void APart2Character::UpdateBody(float Dt)
{
	if (!Arms || !Arms->IsReady())
	{
		return;
	}
	// in the character's own frame (the arms ride on it)
	const FTransform Me = GetActorTransform();
	const FTransform Eye = Camera->GetComponentTransform() * Me.Inverse();
	FVector Hf = Eye.GetRotation().GetAxisX();
	Hf.Z = 0.f;
	Hf = Hf.GetSafeNormal();
	if (Hf.IsNearlyZero())
	{
		Hf = FVector(1.f, 0.f, 0.f);
	}
	const FVector Side = FVector::CrossProduct(FVector::UpVector, Hf).GetSafeNormal();
	const FQuat Tip(Side, FMath::DegreesToRadians(4.f + (bIsCrouched ? 18.f : 0.f)));
	Arms->FreeChest = Arms->ChestForEye(FTransform(FRotationMatrix::MakeFromXZ(Tip.RotateVector(Hf), Tip.RotateVector(FVector::UpVector)).ToQuat(), Eye.GetLocation()));
	// the flashlight held at the chest, low and to the right, its beam on what the eyes look at, swaying behind them and
	// with the steps
	const float Speed = GetVelocity().Size2D();
	Bob += Dt * (Speed / 70.f) * PI;
	const FVector Sway(0.f, 1.2f * FMath::Sin(Bob * 0.5f), 0.9f * FMath::Abs(FMath::Sin(Bob * 0.5f))) ;
	const FVector HoldAt = Eye.TransformPosition(FVector(30.f, 13.f, -29.f) + Sway * FMath::Min(Speed / WalkSpeed, 1.6f));
	const FVector AimAt = Eye.TransformPosition(FVector(450.f, 0.f, 0.f));
	const FQuat Want = FRotationMatrix::MakeFromXZ((AimAt - HoldAt).GetSafeNormal(), Eye.GetRotation().GetAxisZ()).ToQuat();
	if (!bHold)
	{
		HoldAim = FTransform(Want, HoldAt);
		bHold = true;
	}
	HoldAim.SetRotation(FQuat::Slerp(HoldAim.GetRotation(), Want, 1.f - FMath::Exp(-Dt * 8.f)).GetNormalized());
	HoldAim.SetLocation(FMath::Lerp(HoldAim.GetLocation(), HoldAt, 1.f - FMath::Exp(-Dt * 11.f)));
	ADriverArms::FFreeHand& Rh = Arms->Free[1];
	Rh.W = 1.f;
	Rh.Shape = 2;
	Rh.Close = 1.f;
	Rh.Hand = Arms->HandOnHandle(1, HoldAim);
	ADriverArms::FFreeHand& Lh = Arms->Free[0];
	Lh.W = FMath::Max(0.f, Lh.W - Dt * 2.f);
	if (HeldLight)
	{
		HeldLight->SetActorTransform(Arms->HandleInHand(1) * Arms->GetActorTransform());
	}
	// the head bobbing a little with the steps in the snow
	const float B = FMath::Min(Speed / WalkSpeed, 2.f);
	Camera->SetRelativeLocation(FVector(0.f, 0.6f * B * FMath::Sin(Bob * 0.5f), (bIsCrouched ? 30.f : EyeHeight - 92.f) + 0.9f * B * FMath::Sin(Bob)));
}

void APart2Character::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	const bool bMoving = GetVelocity().Size2D() > 20.f;
	// the host decides stamina, warmth and the batteries (the owner is told)
	if (HasAuthority())
	{
		bRunning = bWantsRun && !bWinded && !bIsCrouched && bMoving;
		if (bRunning)
		{
			Stamina = FMath::Max(0.f, Stamina - DeltaSeconds / RunFor);
			if (Stamina <= 0.f)
			{
				bWinded = true;
			}
		}
		else
		{
			Stamina = FMath::Min(1.f, Stamina + DeltaSeconds / RecoverIn);
		}
		if (bWinded && Stamina > 0.33f)
		{
			bWinded = false;
		}
		Warmth = FMath::Max(0.f, Warmth - ColdRate / 100.f * DeltaSeconds);
		if (bFlashlightOn)
		{
			Battery = FMath::Max(0.f, Battery - DeltaSeconds / BatterySeconds);
		}
	}
	else if (IsLocallyControlled())
	{
		bWinded = Stamina <= 0.02f ? true : (Stamina > 0.33f ? false : bWinded);
		bRunning = bWantsRun && !bWinded && !bIsCrouched && bMoving;
	}
	GetCharacterMovement()->MaxWalkSpeed = bRunning ? RunSpeed : WalkSpeed * (bWinded ? 0.8f : 1.f);
	if (Battery < 0.12f)
	{
		ApplyLight();
	}
	if (IsLocallyControlled())
	{
		UpdateBody(DeltaSeconds);
	}
}
