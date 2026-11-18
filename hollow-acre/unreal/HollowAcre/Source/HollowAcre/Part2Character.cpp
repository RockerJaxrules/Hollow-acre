#include "Part2Character.h"
#include "Kessler.h"

#include "Camera/CameraComponent.h"
#include "Components/CapsuleComponent.h"
#include "Components/PointLightComponent.h"
#include "Components/SpotLightComponent.h"
#include "DriverArms.h"
#include "HuskHunter.h"
#include "Part2Story.h"
#include "EndingDirector.h"
#include "Husk.h"
#include "Kismet/GameplayStatics.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "EnhancedInputComponent.h"
#include "EnhancedInputSubsystems.h"
#include "Engine/LocalPlayer.h"
#include "Engine/StaticMeshActor.h"
#include "EngineUtils.h"
#include "UObject/UObjectIterator.h"
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
	InteractAction = IA(TEXT("/Game/HollowAcre/Input/IA_Interact.IA_Interact"));
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
	if (InteractAction)
	{
		E->BindAction(InteractAction, ETriggerEvent::Started, this, &APart2Character::Interact);
	}
}

void APart2Character::Move(const FInputActionValue& V)
{
	const FVector2D In = V.Get<FVector2D>();
	if (Controller && !Reading.IsValid())
	{
		const FRotator Yaw(0.f, Controller->GetControlRotation().Yaw, 0.f);
		AddMovementInput(FRotationMatrix(Yaw).GetUnitAxis(EAxis::X), In.Y);
		AddMovementInput(FRotationMatrix(Yaw).GetUnitAxis(EAxis::Y), In.X);
	}
}

void APart2Character::Look(const FInputActionValue& V)
{
	if (Reading.IsValid())
	{
		return;
	}
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

void APart2Character::UpdateFocus()
{
	// what the eyes rest on within reach, if it can be used
	Focus = nullptr;
	FHitResult Hit;
	FCollisionQueryParams Q(TEXT("UseFocus"), true, this);
	if (HeldLight)
	{
		Q.AddIgnoredActor(HeldLight);
	}
	if (Arms)
	{
		Q.AddIgnoredActor(Arms);
	}
	const FVector E = EyesAt();
	if (GetWorld()->SweepSingleByChannel(Hit, E, E + LookDir() * 260.f, FQuat::Identity, ECC_Visibility, FCollisionShape::MakeSphere(9.f), Q) && Hit.GetActor())
	{
		// (what the gaze lands on, or a usable thing within a hand's width of where it lands: a book on a table is used
		// though the eyes rest on the table's edge)
		float Best = 1e9f;
		for (TObjectIterator<UP2UseComponent> It; It; ++It)
		{
			UP2UseComponent* U = *It;
			if (!U || !U->GetOwner() || U->GetWorld() != GetWorld() || !U->bEnabled || (U->bOnce && U->bUsed))
			{
				continue;
			}
			const float D = U->GetOwner() == Hit.GetActor() ? 0.f : (float)FVector::Dist(U->GetOwner()->GetActorLocation(), Hit.ImpactPoint);
			if (D < U->Near && D < Best && Hit.Distance <= U->Reach)
			{
				Best = D;
				Focus = U;
			}
		}
	}
}

void APart2Character::Interact()
{
	AP2Story* Story = nullptr;
	for (TActorIterator<AP2Story> It(GetWorld()); It; ++It)
	{
		Story = *It;
	}
	if (Reading.IsValid())
	{
		// the next page; after the last, the book closed (and the story told)
		if (++Page >= Reading->Pages.Num())
		{
			UP2UseComponent* U = Reading.Get();
			Reading = nullptr;
			U->bUsed = true;
			if (Story)
			{
				Story->OnUse(U);
			}
		}
		UE_LOG(LogTemp, Display, TEXT("Part2Use page %d"), Page);
		return;
	}
	if (!Focus.IsValid())
	{
		return;
	}
	UP2UseComponent* U = Focus.Get();
	UE_LOG(LogTemp, Display, TEXT("Part2Use %s (%s)"), *U->Id.ToString(), *U->Prompt);
	if (U->Pages.Num() > 0)
	{
		Reading = U;
		Page = 0;
		return;
	}
	U->bUsed = true;
	if (Story)
	{
		Story->OnUse(U);
	}
}

bool APart2Character::GetPrompt(FString& Out) const
{
	if (!Focus.IsValid() || Reading.IsValid() || bDead)
	{
		return false;
	}
	Out = Focus->Prompt;
	return true;
}

bool APart2Character::GetReading(FString& Out, int32& Index, int32& Count) const
{
	if (!Reading.IsValid() || !Reading->Pages.IsValidIndex(Page))
	{
		return false;
	}
	Out = Reading->Pages[Page];
	Index = Page;
	Count = Reading->Pages.Num();
	return true;
}

void APart2Character::Jolt(float Strength)
{
	JoltT = 0.f;
	JoltK = Strength;
}

void APart2Character::Stutter(float Secs)
{
	StutterUntil = GetWorld()->GetTimeSeconds() + Secs;
	UE_LOG(LogTemp, Display, TEXT("Part2Character: the flashlight stutters"));
}

FVector APart2Character::EyesAt() const
{
	return Camera->GetComponentLocation();
}

FVector APart2Character::LookDir() const
{
	return Camera->GetForwardVector();
}

FVector APart2Character::BeamFrom() const
{
	return HeldBeam ? HeldBeam->GetComponentLocation() : Beam->GetComponentLocation();
}

FVector APart2Character::BeamDir() const
{
	return HeldBeam ? HeldBeam->GetForwardVector() : Beam->GetForwardVector();
}

void APart2Character::ReportNoise(float Carries)
{
	for (TActorIterator<AHuskHunter> It(GetWorld()); It; ++It)
	{
		It->HearNoise(GetActorLocation(), Carries);
	}
}

void APart2Character::Caught(AActor* By)
{
	if (bDead)
	{
		return;
	}
	bDead = true;
	DeadT = 0.f;
	CaughtBy = By;
	GetCharacterMovement()->DisableMovement();
	UE_LOG(LogTemp, Display, TEXT("Part2Death caught at %s"), *GetActorLocation().ToCompactString());
}

void APart2Character::TickDeath(float Dt)
{
	DeadT += Dt;
	APlayerController* PC = Cast<APlayerController>(GetController());
	// the eyes snap to its face (its head, a little above the eyes), then black
	if (DeadT <= Dt * 1.5f)
	{
		Camera->PostProcessSettings.bOverride_MotionBlurAmount = true;
		Camera->PostProcessSettings.MotionBlurAmount = 0.f;
	}
	if (CaughtBy.IsValid() && DeadT < 1.0f && Controller)
	{
		FVector Head = CaughtBy->GetActorLocation() + FVector(0.f, 0.f, 150.f * CaughtBy->GetActorScale3D().Z);
		if (const AHusk* Hk = Cast<AHusk>(CaughtBy.Get()))
		{
			if (Hk->GetBody() && Hk->GetBody()->GetBoneIndex(TEXT("head")) != INDEX_NONE)
			{
				Head = Hk->GetBody()->GetBoneLocation(TEXT("head"));
			}
		}
		const FRotator Want = (Head - EyesAt()).Rotation();
		Controller->SetControlRotation(FMath::RInterpTo(Controller->GetControlRotation(), Want, Dt, 14.f));
	}
	if (PC && PC->PlayerCameraManager && DeadT >= 0.95f && DeadT - Dt < 0.95f)
	{
		PC->PlayerCameraManager->StartCameraFade(0.f, 1.f, 0.12f, FLinearColor::Black, false, true);
	}
	if (DeadT >= 3.f)
	{
		// back at the last checkpoint, the night going on
		bDead = false;
		SetActorLocation(Checkpoint.GetLocation(), false, nullptr, ETeleportType::TeleportPhysics);
		if (Controller)
		{
			Controller->SetControlRotation(CheckpointLook);
		}
		GetCharacterMovement()->SetMovementMode(MOVE_Walking);
		Camera->PostProcessSettings.MotionBlurAmount = 0.f;
		if (PC && PC->PlayerCameraManager)
		{
			PC->PlayerCameraManager->StartCameraFade(1.f, 0.f, 1.6f, FLinearColor::Black, false, false);
		}
		UE_LOG(LogTemp, Display, TEXT("Part2Death back at the checkpoint %s"), *Checkpoint.GetLocation().ToCompactString());
	}
}

void APart2Character::FlashlightToggle()
{
	ReportNoise(700.f);                      // (the switch's click carries in the cold)
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
	// (eased off on what is close in front of it: within ~3 m of the eyes, down to a third at arm's length)
	const float Near = FMath::Clamp((NearSmoothed - 40.f) / 420.f, 0.14f, 1.f);
	float Cd = bFlashlightOn ? BeamCd * Dim * Near * (1.f - 0.45f * FixedK) : 0.f;
	if (GetWorld() && GetWorld()->GetTimeSeconds() < StutterUntil)
	{
		const float Tt = GetWorld()->GetTimeSeconds();
		Cd *= FMath::Sin(Tt * 41.f) + FMath::Sin(Tt * 17.f) > 0.4f ? 0.04f : 0.85f;
	}
	if (HeldBeam)
	{
		HeldBeam->SetIntensity(Cd);
		Beam->SetIntensity(0.f);
		// (its haze: the beam's cone seen in the falling snow outdoors; under a roof the air is clear, and the haze in
		// front of the lens, lit as the light came on with the eyes used to the dark, was a blown-out cloud over the view)
		if (GetWorld())
		{
			const float Now = GetWorld()->GetTimeSeconds();
			if (Now - RoofCheckedAt > 0.4f)
			{
				RoofCheckedAt = Now;
				FHitResult Hr;
				bUnderRoof = GetWorld()->LineTraceSingleByChannel(Hr, EyesAt(), EyesAt() + FVector(0.f, 0.f, 500.f), ECC_Visibility, FCollisionQueryParams(TEXT("Roof"), true, this));
			}
			HeldBeam->SetVolumetricScatteringIntensity(bUnderRoof ? 0.06f : 0.45f);
		}
		// (the light off the snow and the bezel's glow on the hand that holds it)
		if (HeldLight)
		{
			TArray<UPointLightComponent*> Ls;
			HeldLight->GetComponents(Ls);
			for (UPointLightComponent* Spill : Ls)
			{
				if (Spill && !Spill->IsA(USpotLightComponent::StaticClass()))
				{
					Spill->SetIntensity(0.f);       // (no glow on the fingers: the hand is lit by what the beam lights, bounced)
					Spill->SetAttenuationRadius(45.f);
				}
			}
		}
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
	FVector At = EyeWorld.GetLocation() - FVector(0.f, 0.f, EyeHeight - 92.f) + FVector(0.f, 0.f, 1.f);
	{
		// (stood on the snow itself: the ground found straight down from the eyes, past the car and anything on it, so the
		// body never starts sunk into it)
		FCollisionQueryParams Q(TEXT("Part2Stand"), true, this);
		if (InArms)
		{
			Q.AddIgnoredActor(InArms);
		}
		if (InFlashlight)
		{
			Q.AddIgnoredActor(InFlashlight);
		}
		TArray<FHitResult> Hits;
		const FVector E = EyeWorld.GetLocation();
		GetWorld()->LineTraceMultiByObjectType(Hits, E, E - FVector(0.f, 0.f, 600.f), FCollisionObjectQueryParams(ECC_WorldStatic), Q);
		for (const FHitResult& H : Hits)
		{
			const FString L = H.GetActor() ? H.GetActor()->GetActorLabel() : FString();
			if (L.StartsWith(TEXT("Terrain")) || L.StartsWith(TEXT("Town Ground")) || L == TEXT("Road"))
			{
				UE_LOG(LogTemp, Display, TEXT("Part2Character: the snow %.0f cm below the eyes (%s)"), E.Z - H.ImpactPoint.Z, *L);
				At.Z = H.ImpactPoint.Z + 92.f + 2.f;
				break;
			}
		}
	}
	SetActorLocation(At, false, nullptr, ETeleportType::TeleportPhysics);
	const FRotator R = EyeWorld.Rotator();
	SetActorRotation(FRotator(0.f, R.Yaw, 0.f));
	if (Controller)
	{
		Controller->SetControlRotation(FRotator(R.Pitch, R.Yaw, 0.f));
	}
	Camera->PostProcessSettings = Grade;
	BaseGrade = Grade;
	Camera->SetConstraintAspectRatio(false);
	// (the eyes adapt fast to a bright thing close in the beam, so it reads instead of blowing out white)
	Camera->PostProcessSettings.bOverride_AutoExposureSpeedUp = true;
	Camera->PostProcessSettings.AutoExposureSpeedUp = 4.f;
	Camera->PostProcessSettings.bOverride_MotionBlurAmount = true;
	Camera->PostProcessSettings.MotionBlurAmount = 0.f;
	// (exposed for the brightest fifth of the picture, as a torch-lit scene is: a face in the beam keeps its eyes and
	// skin instead of blowing out against the dark around it)
	// (no depth of field in play: the cutscene's f/2 came over with its grade, and the hand beside the lens, lit by the
	// beam as it came on, blurred into a big round disc over the view; the eyes see a near hand as a hand)
	Camera->PostProcessSettings.bOverride_DepthOfFieldFocalDistance = true;
	Camera->PostProcessSettings.DepthOfFieldFocalDistance = 0.f;
	Camera->PostProcessSettings.bOverride_DepthOfFieldFstop = true;
	Camera->PostProcessSettings.DepthOfFieldFstop = 16.f;
	Camera->PostProcessSettings.bOverride_AutoExposureLowPercent = true;
	Camera->PostProcessSettings.AutoExposureLowPercent = 80.f;
	Camera->PostProcessSettings.bOverride_AutoExposureHighPercent = true;
	Camera->PostProcessSettings.AutoExposureHighPercent = 99.f;
	Camera->PostProcessSettings.bOverride_AutoExposureSpeedDown = true;
	Camera->PostProcessSettings.AutoExposureSpeedDown = 0.35f;      // (the eyes slow to the dark: a light going out leaves it black)
	Arms = InArms;
	HeldLight = InFlashlight;
	HeldBeam = InBeam;
	if (Arms)
	{
		Arms->AttachToActor(this, FAttachmentTransformRules::SnapToTargetNotIncludingScale);
		Arms->SetActorRelativeTransform(FTransform::Identity);
		Arms->AddTickPrerequisiteActor(this);
		Arms->bFree = true;
		Arms->HideLegs();
	}
	if (HeldLight)
	{
		HeldLight->DetachFromActor(FDetachmentTransformRules::KeepWorldTransform);
		HoldAim = HeldLight->GetActorTransform() * GetActorTransform().Inverse();
		bHold = true;
	}
	ApplyLight();
	Checkpoint = GetActorTransform();
	CheckpointLook = FRotator(FMath::Clamp(R.Pitch, -10.f, 5.f), R.Yaw, 0.f);
	UE_LOG(LogTemp, Display, TEXT("Part2Character: taken over from the wake at %s, eyes %s"), *At.ToString(), *R.ToString());
	{
		// (what is under the feet here: the first things a trace straight down meets, and the town ground's collision)
		TArray<FHitResult> Hits;
		GetWorld()->LineTraceMultiByObjectType(Hits, At + FVector(0.f, 0.f, 300.f), At - FVector(0.f, 0.f, 3000.f), FCollisionObjectQueryParams::AllObjects, FCollisionQueryParams(NAME_None, true, this));
		for (const FHitResult& H : Hits)
		{
			UE_LOG(LogTemp, Display, TEXT("Part2Ground hit %s (%s) at z %.0f, %.0f cm below the feet, blocks pawns %d"), H.GetActor() ? *H.GetActor()->GetActorLabel() : TEXT("?"),
				H.GetComponent() ? *H.GetComponent()->GetName() : TEXT("?"), H.ImpactPoint.Z, At.Z - 92.f - H.ImpactPoint.Z,
				H.GetComponent() ? (int32)(H.GetComponent()->GetCollisionResponseToChannel(ECC_Pawn) == ECR_Block) : -1);
		}
		for (TActorIterator<AActor> It(GetWorld()); It; ++It)
		{
			if (It->GetActorLabel() == TEXT("Town Ground"))
			{
				UE_LOG(LogTemp, Display, TEXT("Part2Ground the town ground: hidden %d, collision %d, at %s, bounds %s"), (int32)It->IsHidden(), (int32)It->GetActorEnableCollision(),
					*It->GetActorLocation().ToString(), *It->GetComponentsBoundingBox().ToString());
			}
		}
	}
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
	// (looking down, the body slips back under the eyes, so the chest and shoulders don't fill the bottom of the view)
	const float Down = FMath::Clamp(-Eye.GetRotation().GetAxisX().Z / 0.8f, 0.f, 1.f);
	const FVector EyeFor = Eye.GetLocation() - Hf * (28.f * Down) + FVector(0.f, 0.f, 6.f * Down);
	Arms->FreeChest = Arms->ChestForEye(FTransform(FRotationMatrix::MakeFromXZ(Tip.RotateVector(Hf), Tip.RotateVector(FVector::UpVector)).ToQuat(), EyeFor));
	// the flashlight held at the chest, low and to the right, its beam on what the eyes look at, swaying behind them and
	// with the steps
	const float Speed = GetVelocity().Size2D();
	const float BobWas = Bob;
	Bob += Dt * (Speed / 70.f) * PI;
	// (a footfall at each low of the bob: for the sound, how it was taken)
	if (FMath::FloorToInt(Bob / PI) != FMath::FloorToInt(BobWas / PI) && Speed > 30.f)
	{
		if (!Director.IsValid())
		{
			for (TActorIterator<AEndingDirector> It(GetWorld()); It; ++It)
			{
				Director = *It;
			}
		}
		if (Director.IsValid())
		{
			Director->LogEvent(bRunning ? TEXT("step_run") : bIsCrouched ? TEXT("step_crouch") : TEXT("step_walk"), Speed);
		}
		// (its print in the snow, left and right in turn)
		const FVector V = GetVelocity().GetSafeNormal2D();
		const FVector PrintSide = FVector::CrossProduct(FVector::UpVector, V) * ((FMath::FloorToInt(Bob / PI) & 1) ? 11.f : -11.f);
		P2Footprint(GetWorld(), GetActorLocation() - FVector(0.f, 0.f, 80.f) + PrintSide, V.Rotation().Yaw, 31.f, false);
	}
	const FVector Sway(0.f, 1.2f * FMath::Sin(Bob * 0.5f), 0.9f * FMath::Abs(FMath::Sin(Bob * 0.5f))) ;
	// (low and to the right, the hand and the flashlight's head in the corner of the view, as a held light is seen)
	// (the view's lower edge is ~24 degrees below its middle at this field of view: the fist about 20 degrees down)
	// (held low right, turned so the barrel lies on a slant across the corner of the view with the fingers round it and
	// the thumb on top lit by the bezel's spill: of four tried, the one that reads as a hand holding a flashlight)
	static FVector HoldOff(36.f, 20.f, -21.f);
	static float HoldRoll = -90.f;
	static bool bHoldRead = false;
	if (!bHoldRead)
	{
		bHoldRead = true;
		FString V;
		if (FParse::Value(FCommandLine::Get(), TEXT("-p2hold="), V, false))
		{
			TArray<FString> P;
			V.ParseIntoArray(P, TEXT(","));
			if (P.Num() == 3)
			{
				HoldOff = FVector(FCString::Atof(*P[0]), FCString::Atof(*P[1]), FCString::Atof(*P[2]));
			}
		}
		FParse::Value(FCommandLine::Get(), TEXT("-p2holdroll="), HoldRoll);
	}
	const FVector HoldAt = Eye.TransformPosition(HoldOff + Sway * FMath::Min(Speed / WalkSpeed, 1.6f));
	// (aimed at what the eyes look at: the first thing along the gaze within 30 m; looking out over open snow, the path
	// a few metres ahead, as a walker holds a light)
	FVector AimAt = Eye.TransformPosition(FVector(700.f, 0.f, -120.f));
	{
		const FVector E = Camera->GetComponentLocation(), L = Camera->GetForwardVector();
		FHitResult Hit;
		FCollisionQueryParams Q(TEXT("BeamAim"), true, this);
		if (HeldLight)
		{
			Q.AddIgnoredActor(HeldLight);
		}
		if (Arms)
		{
			Q.AddIgnoredActor(Arms);
		}
		AimDist = 3000.f;
		if (GetWorld()->LineTraceSingleByChannel(Hit, E, E + L * 3000.f, ECC_Visibility, Q))
		{
			AimDist = Hit.Distance;
			// (close things too: a table looked down at, the matches on it; the hand turns the light in to the point the
			// eyes are on, not nearer than a short arm's reach along the gaze, where the wrist can still turn it)
			AimAt = Me.InverseTransformPosition(Hit.Distance > 150.f ? Hit.ImpactPoint : E + L * FMath::Max(Hit.Distance, 85.f));
		}
		else if (L.Z > -0.12f)
		{
			// (nothing near along the gaze: the light where it looks, far, a little low)
			AimAt = Me.InverseTransformPosition(E + L * 1500.f - FVector(0.f, 0.f, 120.f));
		}
		// (a husk standing in the beam counts too: it has no collision for the trace to meet)
		for (TActorIterator<AHusk> It(GetWorld()); It; ++It)
		{
			if (It->IsHidden())
			{
				continue;
			}
			const FVector Hc = It->GetActorLocation() + FVector(0.f, 0.f, 120.f * It->GetActorScale3D().Z);
			const FVector Th = Hc - E;
			if (Th.Size() < AimDist && FVector::DotProduct(Th.GetSafeNormal(), L) > FMath::Cos(FMath::DegreesToRadians(18.f)))
			{
				AimDist = Th.Size();
			}
		}
	}
	const FVector AimDir = (AimAt - HoldAt).GetSafeNormal();
	const FQuat Want = FQuat(AimDir, FMath::DegreesToRadians(HoldRoll)) * FRotationMatrix::MakeFromXZ(AimDir, Eye.GetRotation().GetAxisZ()).ToQuat();
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
		// (measured, when asked: where the eyes look, where the light was wanted, where the hand put it)
		static const bool bAimLog = FParse::Param(FCommandLine::Get(), TEXT("p2aimlog"));
		static float AimLogT = 0.f;
		AimLogT += Dt;
		if (bAimLog && AimLogT > 0.5f)
		{
			AimLogT = 0.f;
			const FVector Lw = HeldLight->GetActorForwardVector();
			const FVector Hw = Me.TransformPosition(HoldAim.GetLocation()), Got = HeldLight->GetActorLocation();
			const FVector GotEye = Camera->GetComponentTransform().InverseTransformPosition(Got);
			UE_LOG(LogTemp, Display, TEXT("P2Aim eyes pitch %.0f; wanted %.0f (aim %.0f cm off along the gaze %.0f); light pitch %.0f yaw off %.0f; hand %.0f cm from the hold, at %s in the eyes' frame; crouched %d, eyes %.0f over the capsule; step %d"),
				Camera->GetComponentRotation().Pitch, Me.TransformVector(AimDir).Rotation().Pitch, FVector::Dist(Me.TransformPosition(AimAt), Camera->GetComponentLocation()), AimDist,
				Lw.Rotation().Pitch, FRotator::NormalizeAxis(Lw.Rotation().Yaw - Camera->GetComponentRotation().Yaw), FVector::Dist(Hw, Got), *GotEye.ToCompactString(),
				(int32)bIsCrouched, Camera->GetComponentLocation().Z - GetActorLocation().Z, StoryStep);
		}
	}
	// a jolt (a hit on the wall beside them): a hard shake, settling in half a second
	if (JoltT >= 0.f)
	{
		JoltT += Dt;
		const float K = JoltK * FMath::Exp(-JoltT * 7.f);
		JoltRot = FRotator(K * 2.2f * FMath::Sin(JoltT * 61.f), K * 1.6f * FMath::Sin(JoltT * 47.f + 1.f), K * 2.6f * FMath::Sin(JoltT * 53.f + 2.f));
		if (JoltT > 0.8f)
		{
			JoltT = -1.f;
			JoltRot = FRotator::ZeroRotator;
		}
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
		// (by a lit fire it comes back; under a roof it falls slower; out in the night at its rate)
		AP2Story* St = nullptr;
		for (TActorIterator<AP2Story> It(GetWorld()); It; ++It)
		{
			St = *It;
		}
		if (St && St->IsNearFire(GetActorLocation()))
		{
			Warmth = FMath::Min(1.f, Warmth + 0.035f * DeltaSeconds);
		}
		else
		{
			FHitResult Hr;
			const bool bRoof = GetWorld()->LineTraceSingleByChannel(Hr, EyesAt(), EyesAt() + FVector(0.f, 0.f, 500.f), ECC_Visibility, FCollisionQueryParams(TEXT("Roof"), true, this));
			Warmth = FMath::Max(0.f, Warmth - ColdRate / 100.f * (bRoof ? 0.4f : 1.f) * DeltaSeconds);
		}
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
	if (bCarryingWood)
	{
		bRunning = false;
	}
	GetCharacterMovement()->MaxWalkSpeed = bRunning ? RunSpeed : WalkSpeed * (bWinded ? 0.8f : 1.f) * (bCarryingWood ? 0.75f : 1.f);
	NearSmoothed = FMath::FInterpTo(NearSmoothed, AimDist, DeltaSeconds, 4.f);
	ApplyLight();
	if (bDead)
	{
		TickDeath(DeltaSeconds);
		UpdateBody(DeltaSeconds);
		return;
	}
	// the noise the steps make in the snow: running heard far, walking near, crouched barely
	NoiseT -= DeltaSeconds;
	if (NoiseT <= 0.f && HasAuthority())
	{
		NoiseT = 0.3f;
		const float V = GetVelocity().Size2D();
		if (V > 40.f)
		{
			ReportNoise(bRunning ? 2600.f : bIsCrouched ? 280.f : 950.f);
		}
	}
	if (IsLocallyControlled())
	{
		UpdateFocus();
		ShowCold(DeltaSeconds);
		// (the breath: off for now, -p2breath to see it; as spheres close to the eyes it read as a blurred lit disc, not
		// wisps (judge round 7); to be redone as real vapour)
		static const bool bBreath = FParse::Param(FCommandLine::Get(), TEXT("p2breath"));
		if (bBreath)
		{
			UpdateBreath(DeltaSeconds);
		}
		UpdateAttention(DeltaSeconds);
		// (out under the sky the eyes are kept to the night: a darker exposure outdoors, the flashlight the main light;
		// indoors as it was. The judge's 'an even grey, like an overcast evening')
		{
			const float WantBias = bUnderRoof ? 0.f : -1.1f;
			NightBias = FMath::FInterpTo(NightBias, WantBias, DeltaSeconds, 0.8f);
			Camera->PostProcessSettings.bOverride_AutoExposureBias = true;
			Camera->PostProcessSettings.AutoExposureBias = BaseGrade.AutoExposureBias + NightBias;
		}
		// (the armful of split wood carried low in front, under the light)
		if (bCarryingWood && !Armful)
		{
			if (UStaticMesh* Am = LoadObject<UStaticMesh>(nullptr, TEXT("/Game/HollowAcre/Wake/P2_Armful.P2_Armful")))
			{
				Armful = NewObject<UStaticMeshComponent>(this, TEXT("Armful"));
				Armful->SetStaticMesh(Am);
				Armful->SetupAttachment(Camera);
				Armful->SetCollisionEnabled(ECollisionEnabled::NoCollision);
				Armful->SetCastShadow(false);
				Armful->SetRelativeLocationAndRotation(FVector(40.f, 7.f, -22.f), FRotator(-10.f, 32.f, 6.f));   // (the lower edge of the view: the vertical half-angle is ~24 degrees)
				if (UMaterialInterface* Bw = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Town/Materials/M_Town_Drywood.M_Town_Drywood")))
				{
					for (int32 Slot = 0; Slot < Armful->GetNumMaterials(); ++Slot)
					{
						Armful->SetMaterial(Slot, Bw);
					}
				}
				Armful->SetRelativeScale3D(FVector(0.62f));
				Armful->RegisterComponent();
				ArmfulFill = NewObject<UPointLightComponent>(this, TEXT("ArmfulFill"));
				ArmfulFill->SetupAttachment(Camera);
				ArmfulFill->SetIntensityUnits(ELightUnits::Candelas);
				ArmfulFill->SetIntensity(0.f);
				ArmfulFill->SetAttenuationRadius(70.f);
				ArmfulFill->SetUseTemperature(true);
				ArmfulFill->SetTemperature(3600.f);
				ArmfulFill->SetCastShadows(false);
				ArmfulFill->SetVolumetricScatteringIntensity(0.f);
				ArmfulFill->SetRelativeLocation(FVector(62.f, 10.f, -48.f));
				ArmfulFill->RegisterComponent();
			}
		}
		if (ArmfulFill)
		{
			ArmfulFill->SetIntensity(bCarryingWood && IsLightOn() ? 2.2f : 0.f);
		}
		if (Armful)
		{
			Armful->SetVisibility(bCarryingWood);
		}
		static const bool bStoryAuto = FParse::Param(FCommandLine::Get(), TEXT("p2story"));
		if (bStoryAuto && Controller)
		{
			StoryAutopilot(DeltaSeconds);
		}
		// (test autopilot for captures, -p2walk: a look round, then walking on with the head turning, a run in the middle)
		static const bool bAuto = FParse::Param(FCommandLine::Get(), TEXT("p2walk"));
		if (bAuto && Controller)
		{
			AutoT += DeltaSeconds;
			const float T = AutoT;
			// (with a husk hunting: it turns to the camp's street, walks in sweeping the light; when the husk shows it stops and
			// holds the beam on it; when it charges, it turns and runs)
			AHuskHunter* Hh = nullptr;
			for (TActorIterator<AHuskHunter> It(GetWorld()); It; ++It)
			{
				Hh = *It;
			}
			const bool bHunt = Hh && Hh->Husk && !Hh->Husk->IsHidden();
			const FVector HuskAt = bHunt ? Hh->Husk->GetActorLocation() + FVector(0.f, 0.f, 110.f * Hh->Husk->GetActorScale3D().Z) : FVector::ZeroVector;
			bool bSeeHusk = false;
			if (bHunt)
			{
				const FVector To = HuskAt - EyesAt();
				FHitResult Hb;
				FCollisionQueryParams Qb(TEXT("AutoSee"), true, this);
				Qb.AddIgnoredActor(Hh->Husk);
				bSeeHusk = To.Size() < 3000.f && FVector::DotProduct(To.GetSafeNormal(), LookDir()) > 0.5f && !GetWorld()->LineTraceSingleByChannel(Hb, EyesAt(), HuskAt, ECC_Visibility, Qb);
			}
			const FRotator Cr = Controller->GetControlRotation();
			float WantYaw = Cr.Yaw, WantPitch = -6.f, TurnRate = 40.f;
			bool bWalk = false, bRun = false;
			if (T < 3.f)
			{
				WantYaw = -150.f;
				TurnRate = 70.f;
			}
			else if (bHunt && Hh->State == AHuskHunter::EState::Chase && ChaseSeenT < 1.3f)
			{
				// (it charges: the eyes stay on it a moment, frozen)
				ChaseSeenT += DeltaSeconds;
				const FRotator At = (HuskAt - EyesAt()).Rotation();
				WantYaw = At.Yaw;
				WantPitch = FMath::Clamp(At.Pitch, -20.f, 10.f);
				TurnRate = 160.f;
			}
			else if (bHunt && Hh->State == AHuskHunter::EState::Chase && ChaseSeenT >= 1.3f && FMath::Fmod(ChaseSeenT, 3.2f) > 2.2f)
			{
				// (running, a look back over the shoulder: it is gaining)
				ChaseSeenT += DeltaSeconds;
				const FRotator At = (HuskAt - EyesAt()).Rotation();
				WantYaw = At.Yaw;
				WantPitch = FMath::Clamp(At.Pitch, -15.f, 8.f);
				TurnRate = 300.f;
				bWalk = bRun = true;
			}
			else if (bHunt && Hh->State == AHuskHunter::EState::Chase)
			{
				ChaseSeenT += DeltaSeconds;
				const FVector Away = (GetActorLocation() - HuskAt).GetSafeNormal2D();
				WantYaw = Away.Rotation().Yaw;
				TurnRate = 240.f;
				bWalk = bRun = true;
			}
			else if (bSeeHusk)
			{
				const FRotator At = (HuskAt - EyesAt()).Rotation();
				WantYaw = At.Yaw;
				WantPitch = FMath::Clamp(At.Pitch, -20.f, 10.f);
				TurnRate = 90.f;
			}
			else
			{
				WantYaw = Cr.Yaw + 14.f * FMath::Sin((T - 3.f) * 0.6f);
				bWalk = true;
			}
			Controller->SetControlRotation(FRotator(FMath::FixedTurn(FRotator::NormalizeAxis(Cr.Pitch), WantPitch, 40.f * DeltaSeconds),
				FMath::FixedTurn(Cr.Yaw, WantYaw, TurnRate * DeltaSeconds), 0.f));
			if (bWalk)
			{
				AddMovementInput(FRotationMatrix(FRotator(0.f, Controller->GetControlRotation().Yaw, 0.f)).GetUnitAxis(EAxis::X), 1.f);
			}
			if (bRun != bWantsRun)
			{
				bRun ? RunStart() : RunStop();
			}
			if (FMath::FloorToInt(T) != FMath::FloorToInt(T - DeltaSeconds))
			{
				FHitResult Hit;
				const FVector L = GetActorLocation();
				const bool bGround = GetWorld()->LineTraceSingleByChannel(Hit, L, L - FVector(0.f, 0.f, 400.f), ECC_Visibility, FCollisionQueryParams(NAME_None, false, this));
				UE_LOG(LogTemp, Display, TEXT("Part2Walk %.0f s pitch %.0f at %s, speed %.0f, the ground %.0f cm below the feet%s; stamina %.2f warmth %.2f battery %.3f"), T, FRotator::NormalizeAxis(Controller->GetControlRotation().Pitch), *L.ToCompactString(),
					GetVelocity().Size2D(), bGround ? Hit.Distance - 92.f : -1.f, bGround && Hit.GetActor() ? *FString::Printf(TEXT(" (%s)"), *Hit.GetActor()->GetActorLabel()) : TEXT(""), Stamina, Warmth, Battery);
			}
		}
		UpdateBody(DeltaSeconds);
	}
}

void APart2Character::StoryAutopilot(float Dt)
{
	// (test autopilot for captures, -p2story: plays Act I's first beats as a player would. Turns to the camp's street and
	// looks down it (the first sighting), walks to the tool shed and in, reads her journal page by page, then turns to
	// the doorway; when the husk comes it holds the beam on it, and runs when it charges)
	StoryAutoT += Dt;
	StepT += Dt;
	static const bool bLanternTest = FParse::Param(FCommandLine::Get(), TEXT("p2lantern"));
	if (bLanternTest && StoryStep < 11)
	{
		StoryStep = 11;
		StepT = 99.f;
	}
	if (!Director.IsValid())
	{
		for (TActorIterator<AEndingDirector> It(GetWorld()); It; ++It)
		{
			Director = *It;
		}
	}
	AStaticMeshActor* Shed = nullptr;
	for (TActorIterator<AStaticMeshActor> It(GetWorld()); It; ++It)
	{
		if (It->GetActorLabel() == TEXT("Town Shed"))
		{
			Shed = *It;
		}
	}
	AHuskHunter* Hh = nullptr;
	for (TActorIterator<AHuskHunter> It(GetWorld()); It; ++It)
	{
		Hh = *It;
	}
	const FRotator Cr = Controller->GetControlRotation();
	float WantYaw = Cr.Yaw, WantPitch = -6.f, TurnRate = 60.f;
	bool bWalk = false, bRun = false;
	float MoveYaw = 1e9f;          // (set: the legs go this way while the eyes look elsewhere)
	if (Shed)
	{
		const FTransform T = Shed->GetActorTransform();
		const FVector Street = T.GetRotation().GetAxisY();
		const FVector Door = T.TransformPosition(FVector(120.f, -10.f, 0.f));
		const FVector Inside = T.TransformPosition(FVector(-235.f, 30.f, 0.f));
		FVector Book = T.TransformPosition(FVector(-312.f, 30.f, 0.f)) + FVector(0.f, 0.f, 80.f);
		for (TActorIterator<AStaticMeshActor> It(GetWorld()); It; ++It)
		{
			if (It->GetActorLabel() == TEXT("Journal"))
			{
				Book = It->GetActorLocation();
			}
		}
		auto WalkTo = [&](const FVector& P, float Near) -> bool
		{
			const FVector To = (P - GetActorLocation()) * FVector(1.f, 1.f, 0.f);
			WantYaw = To.Rotation().Yaw;
			TurnRate = 120.f;
			bWalk = To.Size() > Near;
			return !bWalk;
		};
		switch (StoryStep)
		{
		case 0:      // along the car's last light, out over the snow
		{
			FVector HFrom, HDir;
			if (Director.IsValid() && Director->GetHeadlightRay(HFrom, HDir))
			{
				WantYaw = HDir.GetSafeNormal2D().Rotation().Yaw;
			}
			TurnRate = 40.f;
			if (StoryAutoT > 4.f)
			{
				StoryStep = 1;
				StepT = 0.f;
			}
			break;
		}
		case 1:      // watching what crosses it, until the light is gone and a little after
		{
			FVector HFrom, HDir;
			if (Director.IsValid() && Director->GetHeadlightRay(HFrom, HDir))
			{
				WantYaw = HDir.GetSafeNormal2D().Rotation().Yaw;
			}
			if (StepT > 14.f)
			{
				StoryStep = 2;
				StepT = 0.f;
			}
			break;
		}
		case 2:      // to the shed's doorway
			if (WalkTo(Door, 60.f))
			{
				StoryStep = 3;
				StepT = 0.f;
			}
			break;
		case 3:      // in
			if (FMath::FloorToInt(StepT) != FMath::FloorToInt(StepT - Dt))
			{
				// (what is in the way, if anything)
				FHitResult Hb;
				FCollisionQueryParams Qb(TEXT("Blocked"), true, this);
				const FVector From = GetActorLocation(), To = From + (Inside - From).GetSafeNormal2D() * 80.f;
				if (GetWorld()->SweepSingleByChannel(Hb, From, To, FQuat::Identity, ECC_Pawn, GetCapsuleComponent()->GetCollisionShape(), Qb))
				{
					UE_LOG(LogTemp, Display, TEXT("Part2Blocked by %s (%s) at %s, normal %s, %.0f cm in"), Hb.GetActor() ? *Hb.GetActor()->GetActorLabel() : TEXT("?"),
						Hb.GetComponent() ? *Hb.GetComponent()->GetName() : TEXT("?"), *Hb.ImpactPoint.ToCompactString(), *Hb.ImpactNormal.ToCompactString(), Hb.Distance);
				}
			}
			if (WalkTo(Inside, 35.f) || StepT > 8.f)
			{
				StoryStep = 4;
				StepT = 0.f;
			}
			break;
		case 4:      // to the book on the table
		{
			const FRotator To = (Book - EyesAt()).Rotation();
			WantYaw = To.Yaw;
			WantPitch = To.Pitch;
			TurnRate = 70.f;
			if (StepT > 2.f && Focus.IsValid())
			{
				Interact();
				StoryStep = 5;
				StepT = 0.f;
			}
			break;
		}
		case 5:      // reading, a page every few seconds
			if (StepT > 4.2f)
			{
				StepT = 0.f;
				Interact();
				if (!Reading.IsValid())
				{
					StoryStep = 6;
				}
			}
			break;
		case 6:      // the bang: turn to the doorway (its middle, at a man's height) and hold the light on it
		{
			const FVector Mouth = T.TransformPosition(FVector(0.f, 0.f, 0.f)) + FVector(0.f, 0.f, 150.f);
			const FRotator To = (Mouth - EyesAt()).Rotation();
			WantYaw = To.Yaw;
			WantPitch = FMath::Clamp(To.Pitch, -10.f, 8.f);
			TurnRate = StepT > 1.6f ? 150.f : 0.f;
			if (StepT < 1.5f)
			{
				// (the hit: the light swung to the wall it came through)
				const FVector Wall = T.TransformPosition(FVector(-185.f, -185.f, 0.f)) + FVector(0.f, 0.f, 130.f);
				const FRotator Tw = (Wall - EyesAt()).Rotation();
				WantYaw = Tw.Yaw;
				WantPitch = FMath::Clamp(Tw.Pitch, -10.f, 10.f);
				TurnRate = StepT > 0.15f ? 150.f : 0.f;
			}
			if (Hh && Hh->Husk && Hh->State == AHuskHunter::EState::Peer && Hh->Husk->GetBody() && Hh->Husk->GetBody()->GetBoneIndex(TEXT("head")) != INDEX_NONE)
			{
				// (its face: the eyes and the light on it)
				const FRotator Tf = (Hh->Husk->GetBody()->GetBoneLocation(TEXT("head")) - EyesAt()).Rotation();
				WantYaw = Tf.Yaw;
				WantPitch = FMath::Clamp(Tf.Pitch, -20.f, 15.f);
				TurnRate = 90.f;
			}
			if (Hh && Hh->Husk && Hh->State == AHuskHunter::EState::Peer)
			{
				PeerSeenT += Dt;
				if (PeerSeenT > 1.9f)
				{
					// (it is looking in: the light off, down in the dark, still)
					if (bFlashlightOn)
					{
						FlashlightToggle();
					}
					if (!bIsCrouched)
					{
						CrouchToggle();
					}
					StoryStep = 7;
					StepT = 0.f;
				}
			}
			break;
		}
		case 7:      // in the dark, still, until it has gone; then the light again
		{
			const FVector Mouth = T.TransformPosition(FVector(0.f, 0.f, 0.f)) + FVector(0.f, 0.f, 120.f);
			const FRotator To = (Mouth - EyesAt()).Rotation();
			WantYaw = To.Yaw;
			WantPitch = FMath::Clamp(To.Pitch, -10.f, 8.f);
			TurnRate = 40.f;
			if (Hh && (Hh->State == AHuskHunter::EState::Retreat || Hh->State == AHuskHunter::EState::Away))
			{
				GoneT += Dt;
				if (GoneT > 4.f)
				{
					if (!bFlashlightOn)
					{
						FlashlightToggle();
					}
					if (bIsCrouched)
					{
						CrouchToggle();
					}
					StoryStep = 8;
					StepT = 0.f;
				}
			}
			break;
		}
		case 8:      // the matches beside her journal
		case 10:     // the stove in the corner
		{
			// (found by what it is for, its use's id, not by an editor label)
			const FString Want = StoryStep == 8 ? TEXT("matches") : TEXT("stove");
			FVector Aim = EyesAt() + LookDir() * 100.f;
			bool bFound = false;
			for (TObjectIterator<UP2UseComponent> It; It; ++It)
			{
				if (It->GetWorld() == GetWorld() && It->Id == Want && It->GetOwner())
				{
					Aim = It->GetOwner()->GetComponentsBoundingBox().GetCenter() + FVector(0.f, 0.f, StoryStep == 8 ? 0.f : 30.f);
					bFound = true;
				}
			}
			FVector Front = FVector::ZeroVector;
			if (StoryStep == 10 && bFound)
			{
				// (to stand before the stove's open door, a long stride out from it, and look into its mouth)
				for (TObjectIterator<UP2UseComponent> It; It; ++It)
				{
					if (It->GetWorld() == GetWorld() && It->Id == Want && It->GetOwner())
					{
						// (its mouth: the stove faces the way the player comes to it from the bench, so the plain walk to it
						// ends before its open door; a walk round to its front got caught on the wood box)
						const AActor* Sv = It->GetOwner();
						Aim = Sv->GetActorLocation() + Sv->GetActorForwardVector() * 26.f + FVector(0.f, 0.f, 53.f);
					}
				}
			}
			FRotator Ta = (Aim - EyesAt()).Rotation();
			if (!Front.IsZero() && FVector::Dist2D(Front, GetActorLocation()) > 35.f)
			{
				Ta.Yaw = (Front - GetActorLocation()).Rotation().Yaw;
			}
			if (StepT <= Dt)
			{
				UE_LOG(LogTemp, Display, TEXT("Part2Story auto step %d: to the %s %s at %s, %.0f cm off, pitch %.0f"), StoryStep, *Want, bFound ? TEXT("found") : TEXT("NOT FOUND"),
					*Aim.ToCompactString(), FVector::Dist(Aim, EyesAt()), Ta.Pitch);
			}
			WantYaw = Ta.Yaw;
			WantPitch = Ta.Pitch;
			TurnRate = 70.f;
			if (StoryStep == 10 && (Front.IsZero() ? FVector::Dist2D(Aim, GetActorLocation()) > 150.f : FVector::Dist2D(Front, GetActorLocation()) > 35.f))
			{
				bWalk = true;
			}
			// (fetching wood: fed as soon as the stove is in reach and in the eyes)
			if (StepT > (bCarryingWood ? 0.6f : 2.5f) && Focus.IsValid() && (!bCarryingWood || Focus->Id == TEXT("stove")) &&
				(Front.IsZero() || FVector::Dist2D(Front, GetActorLocation()) <= 35.f))
			{
				Interact();
				StoryStep += 1;
				StepT = 0.f;
			}
			break;
		}
		case 9:
			if (StepT > 1.5f)
			{
				StoryStep = 10;
				StepT = 0.f;
			}
			break;
		case 11:     // by the fire, warming: watching it catch, then the light off, watching the doorway
		{
			if (bFlashlightOn && StepT > 0.6f)
			{
				FlashlightToggle();
			}
			if (StepT < 4.5f)
			{
				for (TActorIterator<AStaticMeshActor> It(GetWorld()); It; ++It)
				{
					if (It->GetActorLabel() == TEXT("Stove"))
					{
						const FRotator Tsv = (It->GetActorLocation() + It->GetActorForwardVector() * 26.f + FVector(0.f, 0.f, 50.f) - EyesAt()).Rotation();
						WantYaw = Tsv.Yaw;
						WantPitch = Tsv.Pitch;
						TurnRate = 60.f;
					}
				}
				break;
			}
			if (bFlashlightOn)
			{
				FlashlightToggle();
			}
			const FRotator Td = (T.TransformPosition(FVector(0.f, 0.f, 0.f)) + FVector(0.f, 0.f, 120.f) - EyesAt()).Rotation();
			WantYaw = Td.Yaw;
			WantPitch = FMath::Clamp(Td.Pitch, -12.f, 5.f);
			TurnRate = 40.f;
			if (StepT > 1.f && !bIsCrouched)
			{
				CrouchToggle();
			}
			// (a scrape along the back wall: the head round to it)
			for (TActorIterator<AP2Story> It(GetWorld()); It; ++It)
			{
				if (It->WindowT() >= 0.f && It->WindowT() < 10.f)
				{
					StoryStep = 12;
					StepT = 0.f;
				}
				// (a light out in the trees: up, the light on, out to see)
				if (It->LanternStage() >= 1)
				{
					if (bIsCrouched)
					{
						CrouchToggle();
					}
					if (!bFlashlightOn)
					{
						FlashlightToggle();
					}
					StoryStep = 14;
					StepT = 0.f;
					LanternLeg = 0;
					break;
				}
				// (the fire going down, the wood asked for: up and out to the woodpile)
				if (It->GetWoodPile() && !bCarryingWood && !It->IsFed() && StepT > 5.f)
				{
					if (bIsCrouched)
					{
						CrouchToggle();
					}
					if (!bFlashlightOn)
					{
						FlashlightToggle();
					}
					StoryStep = 13;
					StepT = 0.f;
					WoodLeg = 0;
				}
			}
			break;
		}
		case 13:     // the wood: out of the shed's door, round the next cabin to its back, to the woodpile; an armful; back
		{
			AP2Story* St = nullptr;
			for (TActorIterator<AP2Story> It(GetWorld()); It; ++It)
			{
				St = *It;
			}
			AActor* Pile = St ? St->GetWoodPile() : nullptr;
			AActor* Cabin = nullptr;
			for (TActorIterator<AStaticMeshActor> It(GetWorld()); It; ++It)
			{
				if (It->GetActorLabel() == TEXT("Town CabinA"))
				{
					Cabin = *It;
				}
			}
			if (!Pile || !Cabin)
			{
				break;
			}
			// (the way: the shed's doorway, out a stride; the cabin's back corner on the shed's side; before the pile.
			// And back the same way to the stove)
			const FTransform Tc = Cabin->GetActorTransform();
			const FVector DoorOut = T.TransformPosition(FVector(160.f, 0.f, 0.f));
			const FVector CornerA = Tc.TransformPosition(FVector(-760.f, 375.f, 0.f)), CornerB = Tc.TransformPosition(FVector(-760.f, -375.f, 0.f));
			const FVector Corner = FVector::Dist2D(CornerA, DoorOut) < FVector::Dist2D(CornerB, DoorOut) ? CornerA : CornerB;
			const FVector AtPile = Tc.TransformPosition(FVector(-610.f - 150.f, 0.f, 0.f));
			const FVector InShed = T.TransformPosition(FVector(-150.f, -40.f, 0.f));
			const FVector Legs[] = {DoorOut, Corner, AtPile, Corner, DoorOut, InShed};
			const int32 NLegs = UE_ARRAY_COUNT(Legs);
			if (WoodLeg == 2 && !bCarryingWood)
			{
				// (at the pile: look at it, take an armful)
				// (eyes on the pile; an armful as soon as it is in reach, from wherever the way came to it; nearer if not;
				// a walk to a set spot before it stuck on the drift at its foot)
				const FRotator Tp = (Pile->GetActorLocation() - EyesAt()).Rotation();
				WantYaw = Tp.Yaw;
				WantPitch = Tp.Pitch;
				TurnRate = 90.f;
				if (Focus.IsValid() && Focus->Id == TEXT("wood"))
				{
					if (StepT > 1.0f)
					{
						Interact();
						StepT = 0.f;
					}
				}
				else
				{
					bWalk = true;
				}
				break;
			}
			if (WoodLeg >= NLegs)
			{
				// (back in: feed the stove)
				StoryStep = 10;
				StepT = 0.f;
				break;
			}
			const FVector Goal = Legs[WoodLeg];
			const FRotator Tg = (Goal + FVector(0.f, 0.f, 150.f) - EyesAt()).Rotation();
			WantYaw = Tg.Yaw;
			WantPitch = -8.f;
			TurnRate = 120.f;
			bWalk = true;
			if (FVector::Dist2D(Goal, GetActorLocation()) < 60.f || (WoodLeg == 2 && bCarryingWood))
			{
				++WoodLeg;
			}
			break;
		}
		case 14:     // the lantern: eyes on the light through the boards; out of the door and round the shed's corner on the
		             // trees' side, toward it; still when he stops; the rifle up: run for the street; the shot: stop, turn,
		             // the thing in the snow, then him
		{
			AP2Story* St = nullptr;
			for (TActorIterator<AP2Story> It(GetWorld()); It; ++It)
			{
				St = *It;
			}
			AKessler* K = St ? St->GetKessler() : nullptr;
			if (!St || !K)
			{
				break;
			}
			const int32 Ls = St->LanternStage();
			const float Lt = St->LanternStageT();
			// (out round the door's leaf: it hangs open inward 75 degrees from its hinge on the doorway's -Y side, its free
			// edge 87 cm in (make_town.py door(), state 'open'); a way from the stove behind it got caught between it and
			// the wall. So: past its free edge on the +Y side, then straight out along the doorway's +Y half)
			const FVector Inner = T.TransformPosition(FVector(-125.f, 15.f, 0.f));
			const FVector DoorOut = T.TransformPosition(FVector(170.f, 12.f, 0.f));
			const FVector CornerF = T.TransformPosition(FVector(130.f, -340.f, 0.f));
			const FVector CornerB = T.TransformPosition(FVector(-500.f, -340.f, 0.f));
			const FVector Out = T.TransformPosition(FVector(-820.f, -620.f, 0.f));
			const FVector OutStreet = T.TransformPosition(FVector(700.f, -420.f, 0.f));
			if (FMath::FloorToInt(StepT) != FMath::FloorToInt(StepT - Dt))
			{
				const FVector L = T.InverseTransformPosition(GetActorLocation());
				UE_LOG(LogTemp, Display, TEXT("Part2Story auto 14: stage %d (+%.1f s), leg %d, at shed (%.0f, %.0f), %.1f m from him, moving %.0f cm/s"),
					Ls, Lt, LanternLeg, L.X, L.Y, FVector::Dist2D(GetActorLocation(), K->GetActorLocation()) / 100.f, GetVelocity().Size2D());
			}
			auto LookAt = [&](const FVector& P, float Rate)
			{
				const FRotator To = (P - EyesAt()).Rotation();
				WantYaw = To.Yaw;
				WantPitch = FMath::Clamp(To.Pitch, -25.f, 15.f);
				TurnRate = Rate;
			};
			if (Ls <= 2)
			{
				const FVector Legs[] = {Inner, DoorOut, CornerF, CornerB, Out};
				if (StepT < 2.6f)
				{
					LookAt(K->LanternAt(), 50.f);
				}
				else if (Ls == 1 && LanternLeg < (int32)UE_ARRAY_COUNT(Legs))
				{
					FVector G = Legs[LanternLeg];
					if (LanternLeg == 1)
					{
						// (through the doorway: after a point 90 cm ahead on its middle line, so the body comes onto the
						// line and stays on it; aimed at the far point it drifted off and caught the jamb)
						const FVector L = T.InverseTransformPosition(GetActorLocation());
						G = T.TransformPosition(FVector(FMath::Min(L.X + 90.f, 170.f), 12.f, 0.f));
						if (L.X > 140.f)
						{
							G = DoorOut;
						}
					}
					WantYaw = (G - GetActorLocation()).Rotation().Yaw;
					WantPitch = -6.f;
					TurnRate = 120.f;
					bWalk = true;
					if (FVector::Dist2D(G, GetActorLocation()) < 70.f)
					{
						++LanternLeg;
					}
				}
				else
				{
					LookAt(Ls == 2 ? K->EyesAt() : K->LanternAt(), 70.f);
				}
			}
			else if (Ls == 3 && Lt < 2.4f)
			{
				// (the rifle on them: held in the eyes, the muzzle and his face behind it)
				LookAt(K->EyesAt() - FVector(0.f, 0.f, 16.f), 90.f);
			}
			else if (Ls == 4 && St->GetHunter())
			{
				// (it, ahead, coming: the eyes and the light on it; the legs carry on a stride, then stop dead)
				const FVector Hh2 = St->GetHunter()->BodyAt() + FVector(0.f, 0.f, 25.f);
				LookAt(Hh2, 260.f);
				if (Lt < 0.45f)
				{
					MoveYaw = (GetActorLocation() - K->GetActorLocation()).Rotation().Yaw;
					bWalk = bRun = true;
				}
			}
			else if (Ls == 3)
			{
				// (run: out across the open ground toward the street, clear of the shed's wall)
				const FVector RunA = T.TransformPosition(FVector(250.f, -820.f, 0.f));
				const FVector G = FVector::Dist2D(RunA, GetActorLocation()) > 150.f && LanternLeg < 10 ? RunA : OutStreet;
				if (FVector::Dist2D(RunA, GetActorLocation()) <= 150.f)
				{
					LanternLeg = 10;
				}
				WantYaw = (G - GetActorLocation()).Rotation().Yaw;
				WantPitch = -4.f;
				TurnRate = 220.f;
				bWalk = bRun = true;
			}
			else if (Ls == 5 && Lt < 3.f && St->GetHunter() && St->GetHunter()->Husk)
			{
				if (Lt > 0.4f && !bIsCrouched)
				{
					CrouchToggle();          // (their knees go)
				}
				// (down at their feet: its head, the light on it)
				LookAt(St->GetHunter()->Husk->DrawnAt(TEXT("head")), 200.f);
			}
			else
			{
				LookAt(K->EyesAt(), 90.f);
				// (his lantern up between them: the flashlight lowered and off, his face in its light; up off their knees)
				if (Ls == 6 && bFlashlightOn && Lt > 0.5f)
				{
					FlashlightToggle();
				}
				if (Ls == 6 && bIsCrouched && Lt > 0.2f)
				{
					CrouchToggle();
				}
			}
			break;
		}
		case 12:     // the window: turned to the scraping, still; when its hand comes in, the light on it; then the doorway again
		{
			AP2Story* St = nullptr;
			for (TActorIterator<AP2Story> It(GetWorld()); It; ++It)
			{
				St = *It;
			}
			const float Wt = St ? St->WindowT() : -1.f;
			const FRotator Tw = St ? (St->WindowPoint() - EyesAt()).Rotation() : Cr;
			WantYaw = Tw.Yaw;
			WantPitch = FMath::Clamp(Tw.Pitch, -20.f, 20.f);
			TurnRate = Wt < 1.2f ? 30.f : 70.f;
			if (St && St->WindowHandIn() && Wt > 5.9f && !bFlashlightOn)
			{
				FlashlightToggle();
			}
			if (Wt > 9.f && bFlashlightOn)
			{
				FlashlightToggle();
			}
			if (Wt > 10.5f)
			{
				StoryStep = 11;
				StepT = 99.f;
			}
			break;
		}
		default:
			break;
		}
	}
	// the husk: in the beam, held; charging, watched a moment, then a run for it
	// (only while it is the thing to watch: once it has gone and the matches are the task, the eyes are on the task, not on
	// where it roams behind the walls; a charge is always watched)
	if (Hh && Hh->Husk && !Hh->Husk->IsHidden() && StoryStep >= 6 && StoryStep != 14 && (StoryStep < 8 || Hh->State == AHuskHunter::EState::Chase) &&
		Hh->State != AHuskHunter::EState::Peer && Hh->State != AHuskHunter::EState::Investigate && Hh->State != AHuskHunter::EState::Retreat)
	{
		const FVector HuskAt = Hh->Husk->GetActorLocation() + FVector(0.f, 0.f, 110.f * Hh->Husk->GetActorScale3D().Z);
		const FRotator At = (HuskAt - EyesAt()).Rotation();
		if (Hh->State == AHuskHunter::EState::Chase && StepT > 1.2f)
		{
			WantYaw = (GetActorLocation() - HuskAt).GetSafeNormal2D().Rotation().Yaw;
			TurnRate = 240.f;
			bWalk = bRun = true;
		}
		else if (FVector::Dist(HuskAt, EyesAt()) < 2500.f)
		{
			WantYaw = At.Yaw;
			WantPitch = FMath::Clamp(At.Pitch, -20.f, 10.f);
			TurnRate = 120.f;
		}
	}
	Controller->SetControlRotation(FRotator(FMath::FixedTurn(FRotator::NormalizeAxis(Cr.Pitch), WantPitch, 45.f * Dt), FMath::FixedTurn(Cr.Yaw, WantYaw, TurnRate * Dt), 0.f));
	if (bWalk && !Reading.IsValid())
	{
		AddMovementInput(FRotationMatrix(FRotator(0.f, MoveYaw < 1e8f ? MoveYaw : Controller->GetControlRotation().Yaw, 0.f)).GetUnitAxis(EAxis::X), 1.f);
	}
	if (bRun != bWantsRun)
	{
		bRun ? RunStart() : RunStop();
	}
	if (FMath::FloorToInt(StoryAutoT) != FMath::FloorToInt(StoryAutoT - Dt))
	{
		UE_LOG(LogTemp, Display, TEXT("Part2Story auto %.0f step %d at %s%s"), StoryAutoT, StoryStep, *GetActorLocation().ToCompactString(), Focus.IsValid() ? TEXT(" (looking at something to use)") : TEXT(""));
	}
}

void APart2Character::ShowCold(float Dt)
{
	// the cold creeping in: the edges of the view darkening and going blue-white, the colour draining, the eyes shivering;
	// gone again by the fire
	const float Cold = FMath::Clamp((0.55f - Warmth) / 0.55f, 0.f, 1.f);
	FPostProcessSettings& P = Camera->PostProcessSettings;
	P.bOverride_VignetteIntensity = true;
	P.VignetteIntensity = (BaseGrade.bOverride_VignetteIntensity ? BaseGrade.VignetteIntensity : 0.4f) + 0.55f * Cold;
	P.bOverride_ColorSaturation = true;
	const FVector4 BaseSat = BaseGrade.bOverride_ColorSaturation ? BaseGrade.ColorSaturation : FVector4(1.f, 1.f, 1.f, 1.f);
	P.ColorSaturation = FVector4(BaseSat.X, BaseSat.Y, BaseSat.Z, BaseSat.W * (1.f - 0.45f * Cold));
	P.bOverride_ColorGainShadows = true;
	const FVector4 BaseGain = BaseGrade.bOverride_ColorGainShadows ? BaseGrade.ColorGainShadows : FVector4(1.f, 1.f, 1.f, 1.f);
	P.ColorGainShadows = FMath::Lerp(BaseGain, FVector4(0.8f, 0.92f, 1.2f, 1.f), Cold * 0.8f);
	if (JoltT < 0.f && Cold > 0.05f)
	{
		ShiverT += Dt;
		const float K = Cold * Cold;
		ShiverRot = FRotator(0.35f * K * FMath::Sin(ShiverT * 37.f), 0.25f * K * FMath::Sin(ShiverT * 29.f + 1.f), 0.3f * K * FMath::Sin(ShiverT * 41.f + 2.f));
	}
	else
	{
		ShiverRot = FRotator::ZeroRotator;
	}
	// (the shiver and a jolt shake the view only, as an additive offset: set on the camera itself they took the pitch out of
	// it between view updates, so the hand, the beam and the gaze were worked out for a level head while the screen showed
	// it looking down; the flashlight rode high and lit the wall above the matches)
	Camera->ClearAdditiveOffset();
	const FRotator Shake = JoltRot + ShiverRot;
	if (!Shake.IsNearlyZero(0.001f))
	{
		Camera->AddAdditiveOffset(FTransform(Shake.Quaternion()), 0.f);
	}
}

void APart2Character::UpdateBreath(float Dt)
{
	static UStaticMesh* Ball = nullptr;
	static UMaterialInterface* Vapour = nullptr;
	if (!Ball)
	{
		Ball = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Sphere.Sphere"));
		Vapour = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Materials/Play/M_Breath.M_Breath"));
		if (Ball)
		{
			Ball->AddToRoot();
		}
		if (Vapour)
		{
			Vapour->AddToRoot();
		}
	}
	if (!Camera)
	{
		return;
	}
	const FVector Fw = Camera->GetForwardVector(), Up = Camera->GetUpVector(), Rt = Camera->GetRightVector();
	// (from the mouth: a hand under the eyes, a little in front of them)
	const FVector Mouth = Camera->GetComponentLocation() + Fw * 16.f - Up * 12.f;
	const bool bHard = bWinded || Stamina < 0.5f || bRunning;
	BreathT -= Dt;
	if (BreathT <= 0.f)
	{
		// (a breath at rest every 3.5-4 s; hard, every 1.4 s)
		BreathT = (bHard ? 1.4f : 3.7f) * FMath::FRandRange(0.85f, 1.15f);
		bool bWarmAir = bDead || !Ball || !Vapour;
		for (TActorIterator<AP2Story> It(GetWorld()); It && !bWarmAir; ++It)
		{
			bWarmAir = It->IsNearFire(GetActorLocation());
		}
		if (!bWarmAir)
		{
			const float Heavy = bHard ? 1.45f : 1.f;
			for (int32 i = 0; i < 5; ++i)
			{
				UStaticMeshComponent* C = NewObject<UStaticMeshComponent>(this);
				C->SetStaticMesh(Ball);
				UMaterialInstanceDynamic* M = UMaterialInstanceDynamic::Create(Vapour, C);
				M->SetScalarParameterValue(TEXT("Opacity"), 0.f);
				C->SetMaterial(0, M);
				C->SetCollisionEnabled(ECollisionEnabled::NoCollision);
				C->SetCastShadow(false);
				C->SetMobility(EComponentMobility::Movable);
				C->SetLightingChannels(true, true, true);
				C->SetVisibility(false);
				C->SetWorldScale3D(FVector(0.04f));
				C->RegisterComponent();
				FPuff P;
				P.C = C;
				P.M = M;
				// (out and a little down at first, as breath leaves the mouth; spread a little)
				P.V = (Fw * FMath::FRandRange(60.f, 80.f) - Up * FMath::FRandRange(2.f, 8.f) + Rt * FMath::FRandRange(-6.f, 6.f)) * Heavy;
				P.Age = -0.13f * i;                          // (the breath out takes ~0.6 s: its puffs one after another)
				P.Life = FMath::FRandRange(1.3f, 1.8f) * (bHard ? 0.85f : 1.f);
				// (thin wisps, not a cloud: small, faint, gone within a stride; near the eyes they are mostly out of sight)
				P.R0 = FMath::FRandRange(2.f, 3.f);
				P.R1 = FMath::FRandRange(9.f, 14.f) * Heavy;
				P.Peak = FMath::FRandRange(0.06f, 0.1f) * (bHard ? 1.25f : 1.f);
				P.bOut = false;
				Puffs.Add(P);
			}
		}
	}
	for (int32 i = Puffs.Num() - 1; i >= 0; --i)
	{
		FPuff& P = Puffs[i];
		UStaticMeshComponent* C = P.C.Get();
		if (!C)
		{
			Puffs.RemoveAtSwap(i);
			continue;
		}
		P.Age += Dt;
		if (P.Age < 0.f)
		{
			continue;
		}
		if (!P.bOut)
		{
			// (it leaves the mouth where the mouth is now: the head may have turned since the breath began)
			P.bOut = true;
			C->SetWorldLocation(Mouth);
			C->SetVisibility(true);
		}
		if (P.Age > P.Life)
		{
			C->DestroyComponent();
			Puffs.RemoveAtSwap(i);
			continue;
		}
		// (slowed by the air, the warm vapour rising, a drift on the wind)
		P.V *= FMath::Max(0.f, 1.f - 1.6f * Dt);
		P.V.Z += 9.f * Dt;
		P.V += FVector(2.5f, 1.5f, 0.f) * Dt;
		C->SetWorldLocation(C->GetComponentLocation() + P.V * Dt);
		const float K = P.Age / P.Life;
		const float R = FMath::Lerp(P.R0, P.R1, 1.f - FMath::Exp(-P.Age * 2.2f));
		C->SetWorldScale3D(FVector(R / 50.f));
		// (seen once it is out from the face, 25-40 cm ahead: closer it would fill the view as a blur)
		const float In = FMath::SmoothStep(0.2f, 0.45f, P.Age);
		if (UMaterialInstanceDynamic* M = P.M.Get())
		{
			M->SetScalarParameterValue(TEXT("Opacity"), P.Peak * In * FMath::Pow(1.f - K, 1.6f));
		}
	}
}

void APart2Character::UpdateAttention(float Dt)
{
	if (!Camera)
	{
		return;
	}
	FVector Fix = FVector::ZeroVector;
	for (TActorIterator<AHuskHunter> It(GetWorld()); It; ++It)
	{
		if (It->Husk && !It->Husk->IsHidden() && It->State == AHuskHunter::EState::Peer && It->Husk->GetBody() &&
			It->Husk->GetBody()->GetBoneIndex(TEXT("head")) != INDEX_NONE)
		{
			Fix = It->Husk->GetBody()->GetBoneLocation(TEXT("head"));
		}
	}
	for (TActorIterator<AP2Story> It(GetWorld()); It && Fix.IsZero(); ++It)
	{
		if (It->WindowHandIn())
		{
			Fix = It->WindowPoint();
		}
		// (the lantern scene: the thing charging at them, and down at their feet)
		const int32 Ls = It->LanternStage();
		if ((Ls == 4 || (Ls == 5 && It->LanternStageT() < 3.f)) && It->GetHunter() && It->GetHunter()->Husk)
		{
			Fix = It->GetHunter()->Husk->DrawnAt(TEXT("head"));
		}
	}
	bool bFixed = false;
	if (!Fix.IsZero() && IsLightOn())
	{
		const FVector To = Fix - EyesAt();
		bFixed = To.Size() < 800.f && FVector::DotProduct(To.GetSafeNormal(), LookDir()) > FMath::Cos(FMath::DegreesToRadians(11.f));
	}
	// (the man with the lantern, stopped out there, the light held up, then the rifle: the eyes fix on him the same way,
	// from further off (lit by his own lantern), narrowing further)
	float Narrow = 0.6f, PushRate = 0.7f;
	for (TActorIterator<AP2Story> It(GetWorld()); It && !bFixed; ++It)
	{
		const int32 Ls = It->LanternStage();
		if ((Ls == 2 || Ls == 3) && It->GetKessler())
		{
			const FVector To = It->GetKessler()->EyesAt() - FVector(0.f, 0.f, 25.f) - EyesAt();
			bFixed = To.Size() < 2600.f && FVector::DotProduct(To.GetSafeNormal(), LookDir()) > FMath::Cos(FMath::DegreesToRadians(9.f));
			Narrow = Ls == 3 ? 0.27f : 0.4f;
			PushRate = Ls == 3 ? 2.2f : 0.7f;
		}
	}
	// (narrowing slowly to about two thirds (or half), opening again quicker)
	const float Want = bFixed ? BaseFov * Narrow : BaseFov;
	FixedK = FMath::FInterpTo(FixedK, bFixed ? 1.f : 0.f, Dt, 1.2f);
	Camera->SetFieldOfView(FMath::FInterpTo(Camera->FieldOfView, Want, Dt, bFixed ? PushRate : 2.5f));
}
