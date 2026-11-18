#include "Part2Character.h"

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
			if (D < 28.f && D < Best && Hit.Distance <= U->Reach)
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
		Camera->PostProcessSettings.bOverride_MotionBlurAmount = false;
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
	float Cd = bFlashlightOn ? BeamCd * Dim : 0.f;
	if (GetWorld() && GetWorld()->GetTimeSeconds() < StutterUntil)
	{
		const float Tt = GetWorld()->GetTimeSeconds();
		Cd *= FMath::Sin(Tt * 41.f) + FMath::Sin(Tt * 17.f) > 0.4f ? 0.04f : 0.85f;
	}
	if (HeldBeam)
	{
		HeldBeam->SetIntensity(Cd);
		Beam->SetIntensity(0.f);
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
	Camera->PostProcessSettings.bOverride_AutoExposureSpeedDown = true;
	Camera->PostProcessSettings.AutoExposureSpeedDown = 1.5f;
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
	Arms->FreeChest = Arms->ChestForEye(FTransform(FRotationMatrix::MakeFromXZ(Tip.RotateVector(Hf), Tip.RotateVector(FVector::UpVector)).ToQuat(), Eye.GetLocation()));
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
		if (GetWorld()->LineTraceSingleByChannel(Hit, E, E + L * 3000.f, ECC_Visibility, Q) && Hit.Distance > 150.f)
		{
			AimAt = Me.InverseTransformPosition(Hit.ImpactPoint);
		}
		else if (L.Z > -0.12f)
		{
			// (nothing near along the gaze: the light where it looks, far, a little low)
			AimAt = Me.InverseTransformPosition(E + L * 1500.f - FVector(0.f, 0.f, 120.f));
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
	}
	// a jolt (a hit on the wall beside them): a hard shake, settling in half a second
	if (JoltT >= 0.f)
	{
		JoltT += Dt;
		const float K = JoltK * FMath::Exp(-JoltT * 7.f);
		Camera->SetRelativeRotation(FRotator(K * 2.2f * FMath::Sin(JoltT * 61.f), K * 1.6f * FMath::Sin(JoltT * 47.f + 1.f), K * 2.6f * FMath::Sin(JoltT * 53.f + 2.f)));
		if (JoltT > 0.8f)
		{
			JoltT = -1.f;
			Camera->SetRelativeRotation(FRotator::ZeroRotator);
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
	GetCharacterMovement()->MaxWalkSpeed = bRunning ? RunSpeed : WalkSpeed * (bWinded ? 0.8f : 1.f);
	if (Battery < 0.12f || (GetWorld()->GetTimeSeconds() < StutterUntil + 0.1f))
	{
		ApplyLight();
	}
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
				TurnRate = StepT > 0.15f ? 260.f : 0.f;
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
			const TCHAR* Want = StoryStep == 8 ? TEXT("Matches") : TEXT("Stove");
			FVector Aim = EyesAt() + LookDir() * 100.f;
			for (TActorIterator<AStaticMeshActor> It(GetWorld()); It; ++It)
			{
				if (It->GetActorLabel() == Want)
				{
					Aim = It->GetActorLocation() + FVector(0.f, 0.f, StoryStep == 8 ? 1.f : 55.f);
				}
			}
			const FRotator Ta = (Aim - EyesAt()).Rotation();
			WantYaw = Ta.Yaw;
			WantPitch = Ta.Pitch;
			TurnRate = 70.f;
			if (StoryStep == 10 && FVector::Dist2D(Aim, GetActorLocation()) > 150.f)
			{
				bWalk = true;
			}
			if (StepT > 2.5f && Focus.IsValid())
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
		case 11:     // by the fire, warming
			WantPitch = -12.f;
			break;
		default:
			break;
		}
	}
	// the husk: in the beam, held; charging, watched a moment, then a run for it
	if (Hh && Hh->Husk && !Hh->Husk->IsHidden() && StoryStep >= 6 && Hh->State != AHuskHunter::EState::Peer && Hh->State != AHuskHunter::EState::Investigate && Hh->State != AHuskHunter::EState::Retreat)
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
		AddMovementInput(FRotationMatrix(FRotator(0.f, Controller->GetControlRotation().Yaw, 0.f)).GetUnitAxis(EAxis::X), 1.f);
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
		Camera->SetRelativeRotation(FRotator(0.35f * K * FMath::Sin(ShiverT * 37.f), 0.25f * K * FMath::Sin(ShiverT * 29.f + 1.f), 0.3f * K * FMath::Sin(ShiverT * 41.f + 2.f)));
	}
}
