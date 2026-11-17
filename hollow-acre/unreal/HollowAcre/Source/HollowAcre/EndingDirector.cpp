#include "EndingDirector.h"

#include "DriverArms.h"
#include "PhysicsEngine/BodySetup.h"
#include "Sound/SoundBase.h"
#include "EngineUtils.h"

#include "Camera/CameraActor.h"
#include "Camera/CameraComponent.h"
#include "Camera/PlayerCameraManager.h"
#include "Components/BoxComponent.h"
#include "Components/StaticMeshComponent.h"
#include "GlassBurst.h"
#include "Components/CapsuleComponent.h"
#include "Components/InstancedStaticMeshComponent.h"
#include "Engine/StaticMeshActor.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "PhysicalMaterials/PhysicalMaterial.h"
#include "Engine/World.h"
#include "Kismet/GameplayStatics.h"
#include "Misc/CommandLine.h"
#include "Misc/Parse.h"
#include "Algo/BinarySearch.h"
#include "Animation/AnimSequence.h"
#include "Animation/SkeletalMeshActor.h"
#include "Components/SkeletalMeshComponent.h"
#include "Engine/SkeletalMesh.h"
#include "Husk.h"
#include "TimerManager.h"

AEndingDirector::AEndingDirector()
{
	PrimaryActorTick.bCanEverTick = true;
}

void AEndingDirector::BeginPlay()
{
	Super::BeginPlay();

	if (Car)
	{
		CarStart = Car->GetActorTransform();
	}
	PathDist.Reset();
	float Acc = 0.f;
	for (int32 i = 0; i < Path.Num(); ++i)
	{
		Acc += i > 0 ? FVector::Dist(Path[i - 1], Path[i]) : 0.f;
		PathDist.Add(Acc);
	}
	FParse::Value(FCommandLine::Get(), TEXT("-drivesecs="), DriveSeconds);
	{
		float StartM = -1.f;
		if (FParse::Value(FCommandLine::Get(), TEXT("-startm="), StartM) && StartM >= 0.f)
		{
			StartDistance = StartM * 100.f;           // (testing: the drive starts this far along the road)
		}
	}
	if (FParse::Param(FCommandLine::Get(), TEXT("crash")))
	{
		bCrash = true;
	}
	auto ParseVec = [](const TCHAR* Key, FVector& Out)
	{
		FString S;
		if (FParse::Value(FCommandLine::Get(), Key, S, false))
		{
			TArray<FString> P;
			S.ParseIntoArray(P, TEXT(","));
			if (P.Num() == 3)
			{
				Out = FVector(FCString::Atof(*P[0]), FCString::Atof(*P[1]), FCString::Atof(*P[2]));
			}
		}
	};
	ParseVec(TEXT("-crashvel="), ImpactVelocity);
	ParseVec(TEXT("-crashspin="), ImpactSpin);
	ParseVec(TEXT("-crashtree="), StopTreeAt);
	FParse::Value(FCommandLine::Get(), TEXT("-crashgrip="), GroundGrip);
	FParse::Value(FCommandLine::Get(), TEXT("-snowdrag="), SnowDrag);
	FParse::Value(FCommandLine::Get(), TEXT("-triptime="), TripTime);
	FParse::Value(FCommandLine::Get(), TEXT("-tripacross="), TripAcross);
	FParse::Value(FCommandLine::Get(), TEXT("-triproll="), TripRoll);
	if (Car)
	{
		TArray<AActor*> On;
		Car->GetAttachedActors(On, true, true);
		for (AActor* A : On)
		{
			if (A && A->IsA(ACameraActor::StaticClass()))
			{
				Camera = A;
				CamRest = A->GetRootComponent()->GetRelativeLocation();
				CamRestRot = A->GetRootComponent()->GetRelativeRotation();
				break;
			}
		}
	}
	if (bCrash && Car)
	{
		// the glass the crash breaks: the windshield (cracks, stays) and the side windows (gone)
		TArray<AActor*> On;
		Car->GetAttachedActors(On, true, true);
		for (AActor* A : On)
		{
			TArray<UStaticMeshComponent*> Comps;
			A->GetComponents(Comps);
			for (UStaticMeshComponent* C : Comps)
			{
				const TArray<FName> Slots = C->GetMaterialSlotNames();
				for (int32 i = 0; i < Slots.Num(); ++i)
				{
					const FString S = Slots[i].ToString().ToLower();
					if (S.StartsWith(TEXT("windshield")) && !S.Contains(TEXT("out")) && !WindshieldMID)
					{
						WindshieldMID = C->CreateDynamicMaterialInstance(i);
					}
					else if (S.StartsWith(TEXT("sideglass")) && !SideGlassMID)
					{
						SideGlassMID = C->CreateDynamicMaterialInstance(i);
					}
				}
			}
		}
		UE_LOG(LogTemp, Display, TEXT("EndingDirector: crash glass: windshield %s, side windows %s"), WindshieldMID ? TEXT("found") : TEXT("missing"),
			SideGlassMID ? TEXT("found") : TEXT("missing"));
		// the spruce that stops the car: the forest's own tree (its materials from the forest), with a trunk that blocks
		if (!StopTreeMesh)
		{
			StopTreeMesh = LoadObject<UStaticMesh>(nullptr, TEXT("/Game/HollowAcre/Mountain/Spruce_5.Spruce_5"));
		}
		if (!StopTreeAt.IsNearlyZero() && StopTreeMesh)
		{
			// stood on the ground where it is (the slope's own height there)
			FHitResult H;
			if (GetWorld()->LineTraceSingleByChannel(H, FVector(StopTreeAt.X, StopTreeAt.Y, 300000.f), FVector(StopTreeAt.X, StopTreeAt.Y, -300000.f), ECC_WorldStatic))
			{
				StopTreeAt.Z = H.ImpactPoint.Z - 30.f;
			}
			UE_LOG(LogTemp, Display, TEXT("EndingDirector: the stopping spruce at %s"), *StopTreeAt.ToString());
			AStaticMeshActor* Tree = GetWorld()->SpawnActor<AStaticMeshActor>(AStaticMeshActor::StaticClass(), FTransform(FRotator(0.f, 40.f, 0.f), StopTreeAt));
			Tree->SetMobility(EComponentMobility::Movable);
			Tree->GetStaticMeshComponent()->SetStaticMesh(StopTreeMesh);
			Tree->GetStaticMeshComponent()->SetCollisionEnabled(ECollisionEnabled::NoCollision);
			for (TActorIterator<AActor> It(GetWorld()); It; ++It)
			{
				TArray<UInstancedStaticMeshComponent*> Ism;
				It->GetComponents(Ism);
				for (UInstancedStaticMeshComponent* I : Ism)
				{
					if (I->GetStaticMesh() == StopTreeMesh)
					{
						for (int32 m = 0; m < I->GetNumMaterials(); ++m)
						{
							Tree->GetStaticMeshComponent()->SetMaterial(m, I->GetMaterial(m));
						}
					}
				}
			}
			UCapsuleComponent* Trunk = NewObject<UCapsuleComponent>(Tree, TEXT("Trunk"));
			Trunk->SetupAttachment(Tree->GetRootComponent());
			Trunk->SetCapsuleSize(38.f, 650.f);
			Trunk->SetRelativeLocation(FVector(0.f, 0.f, 600.f));
			Trunk->SetCollisionProfileName(TEXT("BlockAll"));
			Trunk->RegisterComponent();
		}
	}
	if (bCrash)
	{
		// Part 2 opens on black and fades into the drive already under way; no end card (the crash ends in black)
		bHoldBlack = !FParse::Param(FCommandLine::Get(), TEXT("nofade"));
		if (bHoldBlack)
		{
			FTimerHandle T;
			GetWorldTimerManager().SetTimer(T, [this]()
			{
				bHoldBlack = false;
				if (APlayerCameraManager* Cam = UGameplayStatics::GetPlayerCameraManager(this, 0))
				{
					Cam->StartCameraFade(1.f, 0.f, 3.f, FLinearColor::Black, false, false);
				}
			}, 4.8f, false);
		}
		UE_LOG(LogTemp, Display, TEXT("EndingDirector: crash mode from %.0f m along the road, impact at %.1f s"), StartDistance / 100.f, ImpactTime);
	}
	if (DriveSound && !bCrash)
	{
		UGameplayStatics::PlaySound2D(this, DriveSound);
	}
	// the wipers turn about the windshield's normal at their spindles (the glass rakes back about 33 degrees from
	// horizontal-forward: up the glass is (-0.84, 0, 0.54)); a positive sweep carries the parked arm (along -Y, the
	// driver's left) up the glass
	const FVector UpGlass = FVector(-0.841f, 0.f, 0.542f);
	WiperAxis = FVector(0.542f, 0.f, 0.841f);
	WiperSign = FVector::DotProduct(FQuat(WiperAxis, 0.1f).RotateVector(FVector(0.f, -1.f, 0.f)), UpGlass) > 0.f ? 1.f : -1.f;
	WiperBase.Reset();
	for (AActor* W : Wipers)
	{
		WiperBase.Add(W && W->GetRootComponent() ? W->GetRootComponent()->GetRelativeRotation().Quaternion() : FQuat::Identity);
	}
	if (!Arms)
	{
		for (TActorIterator<ADriverArms> It(GetWorld()); It; ++It)
		{
			Arms = *It;
			break;
		}
	}
	// the driver (the farmer from Part 1) in winter: gloves, and the sleeves of their flannel shirt
	if (Arms && GloveMaterial)
	{
		TArray<USkinnedMeshComponent*> Skins;
		Arms->GetComponents(Skins);
		for (USkinnedMeshComponent* C : Skins)
		{
			for (int32 i = 0; i < C->GetNumMaterials(); ++i)
			{
				C->SetMaterial(i, GloveMaterial);
			}
		}
	}
	if (bCrash)
	{
		BeginCrashScene();
	}

	if (bCrash)
	{
		return;
	}
	// Screenshots for the work log skip the opening fade (-nofade) so the frame isn't black
	if (FParse::Param(FCommandLine::Get(), TEXT("nofade")))
	{
		GetWorldTimerManager().SetTimer(Timer, this, &AEndingDirector::StartFadeOut, FMath::Max(DriveSeconds, 0.01f), false);
		return;
	}
	// the opening black is held every frame until the fade in (the camera manager may not exist yet at BeginPlay, and
	// a fade started then never showed: the first moments of the drive were visible before the black)
	bHoldBlack = true;
	GetWorldTimerManager().SetTimer(Timer, this, &AEndingDirector::StartFadeIn, FMath::Max(HoldBlack, 0.01f), false);
}

void AEndingDirector::StartFadeIn()
{
	bHoldBlack = false;
	if (APlayerCameraManager* Cam = UGameplayStatics::GetPlayerCameraManager(this, 0))
	{
		Cam->StartCameraFade(1.f, 0.f, FadeIn, FLinearColor::Black, false, false);
	}
	GetWorldTimerManager().SetTimer(Timer, this, &AEndingDirector::StartFadeOut, FMath::Max(FadeIn + DriveSeconds, 0.01f), false);
}

void AEndingDirector::StartFadeOut()
{
	if (APlayerCameraManager* Cam = UGameplayStatics::GetPlayerCameraManager(this, 0))
	{
		Cam->StartCameraFade(0.f, 1.f, FadeOut, FLinearColor::Black, false, /*bHoldWhenFinished*/ true);
	}
	GetWorldTimerManager().SetTimer(Timer, this, &AEndingDirector::ShowEndCard, FMath::Max(FadeOut + EndCardDelay, 0.01f), false);
}

void AEndingDirector::ShowEndCard()
{
	EndCardTime = Time;
}

float AEndingDirector::GetEndCardAlpha() const
{
	if (EndCardTime < 0.f)
	{
		return 0.f;
	}
	const float A = FMath::Clamp((Time - EndCardTime) / FMath::Max(EndCardFadeIn, 0.01f), 0.f, 1.f);
	return A * A * (3.f - 2.f * A); // smoothstep
}

void AEndingDirector::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	Time += DeltaSeconds;
	const float Dilation = GetWorldSettings() ? GetWorldSettings()->GetEffectiveTimeDilation() : 1.f;
	const float RealDt = DeltaSeconds / FMath::Max(Dilation, 0.01f);
	RealTime += RealDt;
	if (bHoldBlack)
	{
		if (APlayerCameraManager* Cam = UGameplayStatics::GetPlayerCameraManager(this, 0))
		{
			Cam->SetManualCameraFade(1.f, FLinearColor::Black, false);
		}
	}
	if (!Car)
	{
		return;
	}

	float Speed = SpeedKmh * 100000.f / 3600.f; // cm/s
	float Dist = Speed * Time;
	if (bCrash)
	{
		// it comes out ahead: the driver comes off the gas and brakes hard (about 0.4 g on packed snow) to a stop,
		// watches it, waits, then creeps on at walking pace
		if (bStall)
		{
			// the engine dies out of nowhere a few car lengths short of the break in the rail: coasting (in gear, on
			// packed snow, about 0.19 g) to a stop beside it; then still, the key turned and turned
			const float Left = PeerStopAt - StartDistance - DistNow;
			if (StallT < 0.f && Left <= StallCoast)
			{
				StallT = Time;
				StallV = FMath::Max(Speed, 1.f);
				Event(TEXT("stall"));
			}
			if (StallT >= 0.f)
			{
				const float A = StallV * StallV / (2.f * StallCoast);
				Speed = FMath::Min(StallV, FMath::Sqrt(2.f * A * FMath::Max(0.f, Left)));
				if (Speed < 4.f)
				{
					Speed = 0.f;
				}
			}
			if (!bStopped && StallT >= 0.f && Speed <= 0.f)
			{
				bStopped = true;
				StopT = Time;
				ImpactTime = StopT + StallHitAfter;
				Event(TEXT("stopped"));
			}
		}
		else if (bHoodReveal && Time >= SightTime)
		{
			const float Cruise = Speed;
			float V = DropT >= 0.f ? FMath::Max(0.f, Speed - 480.f * (Time - DropT - 0.25f)) : Cruise;   // ~0.5 g, it on the bonnet
			if (DropT >= 0.f && Time < DropT + 0.25f)
			{
				V = Cruise;
			}
			if (bHoodAttack && DropT >= 0.f)
			{
				// it on the bonnet: driven on, swerving to throw it off; then the brakes, hard (about 0.85 g on packed snow)
				V = FMath::Max(0.f, Cruise - 830.f * FMath::Max(0.f, Time - DropT - HoodBrakeAt));
			}
			if (Time > CreepTime)
			{
				V = FMath::Min(150.f, 60.f * (Time - CreepTime));                          // creeping on, at walking pace
				V = FMath::Min(V, FMath::Max(0.f, (PeerStopAt - StartDistance - DistNow) * 1.1f));
				if (PeerT0 >= 0.f && Time > PeerT0 + 0.3f)
				{
					V = FMath::Min(V, FMath::Max(0.f, PeerV - 700.f * (Time - PeerT0 - 0.3f)));   // its face: the brake, hard
				}
				if (HaltT < 0.f && Time > CreepTime + 2.f && V < 2.f)
				{
					HaltT = Time;
					Event(TEXT("halt2"));
				}
			}
			Speed = V;
			if (!bStopped && DropT >= 0.f && Speed <= 0.f)
			{
				bStopped = true;
				Event(TEXT("stopped"));
			}
			if (!bCreeping && Time > CreepTime)
			{
				bCreeping = true;
				Event(TEXT("creep"));
			}
		}
		else if (Time >= SightTime + 0.35f)
		{
			const float Vb = FMath::Max(0.f, Speed - 400.f * (Time - SightTime - 0.35f));
			float Vc = Time > CreepTime ? FMath::Min(150.f, 60.f * (Time - CreepTime)) : 0.f;    // creeping, at walking pace
			if (bHoodReveal && Time > CreepTime)
			{
				Vc = FMath::Min(Vc, FMath::Max(0.f, (PeerStopAt - StartDistance - DistNow) * 1.1f));   // ...stopping by the break in the rail
				if (HaltT < 0.f && Time > CreepTime + 2.f && Vc < 2.f)
				{
					HaltT = Time;
					Event(TEXT("halt2"));
				}
			}
			Speed = FMath::Max(Vb, Vc);
			if (!bStopped && Speed <= 0.f)
			{
				bStopped = true;
				Event(TEXT("stopped"));
			}
			if (!bCreeping && Time > CreepTime)
			{
				bCreeping = true;
				Event(TEXT("creep"));
			}
		}
		if (!bImpacted)
		{
			SpeedNow = Speed;
			DistNow += Speed * DeltaSeconds;
		}
		Dist = StartDistance + DistNow;
		if (!bStall && !bSighted && Time >= SightTime)
		{
			bSighted = true;
			Event(TEXT("sight"));
		}
		if (!bStall && !bBraked && (bHoodAttack && bHoodReveal ? DropT >= 0.f && Time >= DropT + HoodBrakeAt : Time >= SightTime + (bHoodReveal ? 0.2f : 0.35f)))
		{
			bBraked = true;
			Event(TEXT("brake"));
		}
		const float Stride = 28.f / 60.f;
		CreSwitchAt = SightTime + SwitchLead;
		if (!bStall && !bHoodReveal && !bCrossed && Time >= CreSwitchAt - 2.f * Stride)
		{
			// the sighting: two strides up from below the road on the right and over the rail, then the take from
			// where it stops in the road, HaltSide left of the middle, CrossAhead on from where the car is at SightTime
			bCrossed = true;
			const float D = Dist + Speed * FMath::Max(0.f, SightTime - Time) + CrossAhead;
			const FVector T = (PathAt(D + 300.f) - PathAt(D - 300.f)).GetSafeNormal2D();
			CreRight = FVector::CrossProduct(FVector::UpVector, T);
			CreRoadD = D;
			CreCentre = PathAt(D) - CreRight * 175.f;           // the car's path runs 1.75 m right of the middle
			const FVector Halt = CreCentre - CreRight * HaltSide;
			CreDir = -CreRight;
			const FVector Left = FVector::CrossProduct(CreDir, FVector::UpVector);
			// the take's path carries it 5.31 m on and 0.47 m to its left before it stops (at its model's size)
			CreSwitch = Halt - CreDir * 530.8f * HuskScale - Left * 47.3f * HuskScale;
			CreFrom = CreSwitch - CreDir * (CreatureSpeed * HuskScale * 2.f * Stride);
			CreHop0 = 380.f;                  // the bound over the guardrail (4.6 m right of the middle)
			CreHop1 = 720.f;
			CreT0 = Time;
			CreS = 0.f;
			CreStage = 1;
			Creature = SpawnHusk(TEXT("GallopLookL"));
			Event(TEXT("creature"));
		}
		if (!bStall && !bHoodReveal && !bCharged && Time >= ImpactTime - ChargeLead && Car)
		{
			// the charge: out of the dark on the driver's side, straight at the door, to arrive with the blow
			bCharged = true;
			bCharging = true;
			CreStage = 4;
			if (Creature)
			{
				Creature->Destroy();
			}
			const FTransform C = Car->GetActorTransform();
			const FVector F = C.GetUnitAxis(EAxis::X).GetSafeNormal2D();
			CreRight = FVector::CrossProduct(FVector::UpVector, F);
			const FVector Contact = C.GetLocation() + F * (SpeedNow * ChargeLead + 20.f) - CreRight * 225.f;
			CreDir = CreRight;
			CreLen = CreatureSpeed * HuskScale * 0.85f * ChargeLead;
			CreFrom = Contact - CreDir * CreLen;
			CreHop0 = CreHop1 = -1.f;
			CreT0 = Time;
			CreS = 0.f;
			Creature = SpawnHusk(TEXT("Gallop"));
			Event(TEXT("charge"));
		}
		if (Creature)
		{
			MoveCreature(DeltaSeconds);
		}
		if (bHoodReveal || bStall)
		{
			RevealBeats(DeltaSeconds);
		}
		CrashBeats(DeltaSeconds);
		LookWant(DeltaSeconds);
		if (!bImpacted)
		{
			PlaceCamera();
		}
		if (!bImpacted && Time >= ImpactTime)
		{
			Impact();
		}
		if (bImpacted)
		{
			if (!bPhysics && Body)
			{
				const float t = Time - ImpactTime;
				if (t < TripTime)
				{
					Body->SetActorTransform(TripPose(t));
				}
				else
				{
					HandToPhysics();
				}
			}
			CrashCamera(DeltaSeconds);
			if (Arms)
			{
				const float k = FMath::Exp(-(Time - ImpactTime) * 1.4f);
				Arms->Steer = SteerNow + 70.f * k * FMath::Sin((Time - ImpactTime) * 13.f);   // the wheel is torn round
				Arms->KeyReach = FMath::Max(0.f, Arms->KeyReach - DeltaSeconds * 4.f);      // (the hand back to the wheel, grabbing)
				Arms->KeyTurn = 0.f;
			}
			if (bPhysics && !bDeep && BodyBox && Body && ImpactPose.GetLocation().Z - Body->GetActorLocation().Z > 9000.f)
			{
				// where the chute eases off, the avalanche snow lies deep: the car ploughs in
				FHitResult H;
				FCollisionQueryParams Q(TEXT("DeepSnow"), true, Body);
				Q.AddIgnoredActor(Car);
				if (SolidHolder)
				{
					Q.AddIgnoredActor(SolidHolder);
				}
				const FVector At = Body->GetActorLocation();
				if (GetWorld()->LineTraceSingleByChannel(H, At, At - FVector(0.f, 0.f, 1500.f), ECC_WorldStatic, Q) && H.ImpactNormal.Z > 0.8f)
				{
					bDeep = true;
					BodyBox->SetLinearDamping(1.4f);
					BodyBox->SetAngularDamping(2.2f);
					Event(TEXT("deep"), ImpactPose.GetLocation().Z - At.Z);
				}
			}
			if (bPhysics && !bRested && BodyBox && Time > ImpactTime + 1.5f)
			{
				// at rest: barely moving or turning for half a second (not just the top of a bounce)
				const bool bStill = BodyBox->GetPhysicsLinearVelocity().Size() < 30.f && BodyBox->GetPhysicsAngularVelocityInDegrees().Size() < 15.f;
				StillFor = bStill ? StillFor + DeltaSeconds : 0.f;
				if (StillFor > 0.5f)
				{
					bRested = true;
					RestTime = Time;
					Event(TEXT("rest"), ImpactPose.GetLocation().Z - Body->GetActorLocation().Z);
				}
			}
			if (Body)
			{
				SolidNear(Body->GetActorLocation(), 1200.f);
			}
			if (bClipCheck)
			{
				ShellCheck();
			}
			AfterTheFall(RealDt);
			return;
		}
	}
	FVector Loc;
	FQuat Rot;
	if (Path.Num() >= 2)
	{
		// Follow the road; heading and pitch from points 3 m behind and ahead, so curves and the climb feel smooth
		Loc = PathAt(Dist);
		const FVector Fwd = (PathAt(Dist + 300.f) - PathAt(Dist - 300.f)).GetSafeNormal();
		Rot = FRotationMatrix::MakeFromXZ(Fwd, FVector::UpVector).ToQuat();
	}
	else
	{
		Loc = CarStart.GetLocation() + CarStart.GetRotation().GetForwardVector() * Dist;
		Rot = CarStart.GetRotation();
	}
	if (bCrash && bHoodAttack && DropT >= 0.f)
	{
		// the swerves (it on the bonnet): shifted across the road, turned the way it is going, leaning out of each turn
		const float s = Time - DropT, h = 0.03f;
		const float O = SwerveOff(s), dO = (SwerveOff(s + h) - SwerveOff(s - h)) / (2.f * h);
		const float aO = (SwerveOff(s + h) - 2.f * O + SwerveOff(s - h)) / (h * h);
		const FVector Fh = Rot.GetForwardVector().GetSafeNormal2D();
		Loc += FVector::CrossProduct(FVector::UpVector, Fh) * O;
		const float Yaw = FMath::RadiansToDegrees(FMath::Atan2(dO, FMath::Max(Speed, 150.f)));
		const float Roll = FMath::Clamp(-aO * 0.0035f, -3.5f, 3.5f);
		Rot = FQuat(FVector::UpVector, FMath::DegreesToRadians(Yaw)) * Rot * FRotator(0.f, 0.f, Roll).Quaternion();
	}
	// Low, uneven bumps and a slow roll, never mirrored or periodic-looking
	Loc.Z += 0.8f * FMath::Sin(Time * 7.1f) + 0.5f * FMath::Sin(Time * 11.3f + 1.7f);
	const FRotator Sway(SwayDeg * 0.4f * FMath::Sin(Time * 1.9f + 0.4f) + (bCrash ? CarDip() : 0.f), 0.f,
		SwayDeg * FMath::Sin(Time * 1.3f) + (bCrash ? StallRock() : 0.f));
	Car->SetActorLocationAndRotation(Loc, Rot * Sway.Quaternion());
	if (bCrash && WheelPts.Num() > 0)
	{
		// its tyres on the snow, not in it: lifted by however far the deepest of them would sink
		const FTransform CT = Car->GetActorTransform();
		float Sink = 0.f;
		for (const FVector& W : WheelPts)
		{
			const FVector P = CT.TransformPosition(W);
			Sink = FMath::Max(Sink, GroundBelow(P, 80.f) - P.Z);
		}
		Car->AddActorWorldOffset(FVector(0.f, 0.f, Sink));
	}

	// Wipers: out and back, easing at each end like the real linkage, resting parked a moment between sweeps
	{
		const float Cycle = WiperPeriod + WiperRest;
		const float Ph = FMath::Fmod(Time + 0.4f, Cycle);
		const float A = Ph < WiperPeriod ? 0.5f * (1.f - FMath::Cos(2.f * PI * Ph / WiperPeriod)) : 0.f;
		const FQuat Q(WiperAxis, WiperSign * FMath::DegreesToRadians(WiperSweep * A));
		for (int32 i = 0; i < Wipers.Num() && i < WiperBase.Num(); ++i)
		{
			if (Wipers[i])
			{
				Wipers[i]->SetActorRelativeRotation(Q * WiperBase[i]);
			}
		}
	}

	// The key (stalled, stopped by the break in the rail): the right hand off the wheel to it; three tries, turned against
	// its spring and held as the starter grinds, let go; the last frantic, short, again and again (when it hits)
	if (bCrash && bStall && Arms && StopT >= 0.f)
	{
		const float k = Time - StopT;
		auto Sm = [](float x) { x = FMath::Clamp(x, 0.f, 1.f); return x * x * (3.f - 2.f * x); };
		// each try: this car won't crank again from on (its lock wants it back at off first): back to off, round past on to
		// start, held while the starter grinds (the wrist straining), let go (it springs back to on); the last ones fast
		struct FTry
		{
			float At, Hold, Pace;
		};
		static const FTry Tries[] = {{1.7f, 1.1f, 1.f}, {3.35f, 1.25f, 1.f}, {4.95f, 0.25f, 0.6f}, {5.55f, 0.45f, 0.6f}};
		float Turn = 0.f;
		for (const FTry& Tr : Tries)
		{
			const float u = k - Tr.At;
			if (u < -0.42f * Tr.Pace || u > Tr.Hold + 0.08f)
			{
				continue;
			}
			const float Back = -40.f * Sm((u + 0.42f * Tr.Pace) / (0.12f * Tr.Pace));
			const float Round = 78.f * Sm((u + 0.16f * Tr.Pace) / (0.16f * Tr.Pace));
			const float Let = 38.f * Sm((u - Tr.Hold) / 0.07f);
			Turn = Back + Round - Let + (u > 0.f && u < Tr.Hold ? 1.3f * FMath::Sin(u * 57.f) : 0.f);
		}
		float Reach = Sm((k - 0.7f) / 0.55f);
		if (SmashT >= 0.f)
		{
			Reach *= 1.f - Sm((Time - SmashT) / 0.22f);   // (torn off the key by the burst glass: a flinch)
		}
		Arms->KeyReach = Reach;
		Arms->KeyTurn = Turn * Reach;
		static const float CrankAt[] = {1.7f, 3.35f, 4.95f, 5.55f};
		while (KeyBeat < (int32)UE_ARRAY_COUNT(CrankAt) && k >= CrankAt[KeyBeat] && SmashT < 0.f)
		{
			Event(TEXT("crank"), (float)KeyBeat);
			if (KeyBeat == 2)
			{
				Event(TEXT("frantic"));
			}
			++KeyBeat;
		}
	}
	// Steering: the road's curvature a moment ahead (the driver turns into a bend before reaching it), as the front
	// wheels' angle for this wheelbase, times the steering ratio; plus the small, constant corrections of holding a
	// lane on a snowy road. Eased, never snapped.
	static const bool bNoSteer = FParse::Param(FCommandLine::Get(), TEXT("nosteer"));   // testing: wheel held straight
	if (Arms && Path.Num() >= 2 && !bNoSteer)
	{
		const float Ahead = Dist + Speed * SteerLead;
		float dH = HeadingAt(Ahead + 300.f) - HeadingAt(Ahead - 300.f);
		dH = FMath::UnwindRadians(dH);
		const float Kappa = dH / 600.f;                                            // 1/cm
		const float Wheels = FMath::Atan(Wheelbase * Kappa);
		float Want = SteerRatio * FMath::RadiansToDegrees(Wheels);
		Want += 1.4f * FMath::Sin(Time * 0.63f + 0.5f) + 0.7f * FMath::Sin(Time * 1.71f + 2.1f) + 0.3f * FMath::Sin(Time * 3.9f);
		float SteerRate = 3.f;
		if (bCrash && bHoodAttack && DropT >= 0.f)
		{
			// (the swerves: the wheel wrenched round a moment ahead of the car's turning, fast)
			const float s = Time - DropT + 0.12f, h = 0.03f;
			const float aO = (SwerveOff(s + h) - 2.f * SwerveOff(s) + SwerveOff(s - h)) / (h * h);
			Want += SteerRatio * FMath::RadiansToDegrees(FMath::Atan(Wheelbase * aO / FMath::Max(Speed * Speed, 150.f * 150.f)));
			SteerRate = 14.f;
		}
		SteerNow = FMath::FInterpTo(SteerNow, FMath::Clamp(Want, -150.f, 150.f), DeltaSeconds, SteerRate);
		Arms->Steer = SteerNow;
	}
}

void AEndingDirector::Impact()
{
	bImpacted = true;
	const FTransform CarT = Car->GetActorTransform();
	const FQuat R = CarT.GetRotation();
	// the car's body for the physics: its real shell (sampled: ShellPts) in slabs, the body below the windows and the
	// cabin in three layers up to the roof, so nothing of it sinks into the snow as it rolls (else a 4.5 x 1.7 x 1.2 m box
	// round it); car frame: the driver's eye is at x 0, the car's centre line 37 cm to the right of it; 1250 kg, its
	// weight carried low (where it was with the one box: 56 cm up on the centre line); packed snow is slippery
	FBox Slab[4] = {FBox(ForceInit), FBox(ForceInit), FBox(ForceInit), FBox(ForceInit)};
	const float Cut[3] = {97.f, 112.f, 127.f};
	for (const FVector& L : ShellPts)
	{
		Slab[L.Z < Cut[0] ? 0 : L.Z < Cut[1] ? 1 : L.Z < Cut[2] ? 2 : 3] += L;
	}
	const bool bShellBody = Slab[0].IsValid && Slab[3].IsValid;
	const FVector Low = bShellBody ? Slab[0].GetCenter() : FVector(-25.f, 37.f, 74.f);
	const FVector Centre = CarT.TransformPosition(Low);
	AActor* B = GetWorld()->SpawnActor<AActor>(AActor::StaticClass(), FTransform(R, Centre));
	UBoxComponent* Box = NewObject<UBoxComponent>(B, TEXT("CarBody"));
	B->SetRootComponent(Box);
	Box->SetBoxExtent(bShellBody ? Slab[0].GetExtent() : FVector(225.f, 86.f, 60.f));
	Box->SetWorldTransform(FTransform(R, Centre));
	Box->RegisterComponent();
	UPhysicalMaterial* Snow = NewObject<UPhysicalMaterial>(this);
	Snow->Friction = GroundGrip;
	Snow->Restitution = 0.15f;
	Box->SetPhysMaterialOverride(Snow);
	Box->SetCollisionProfileName(TEXT("PhysicsActor"));
	Box->SetNotifyRigidBodyCollision(true);
	Box->OnComponentHit.AddDynamic(this, &AEndingDirector::OnBodyHit);
	Box->SetMassOverrideInKg(NAME_None, 1250.f, true);
	Box->SetCenterOfMass(FVector(-25.f, 37.f, 56.f) - Low);
	Box->SetLinearDamping(SnowDrag);
	Box->SetAngularDamping(SnowDrag + 0.05f);   // enough to keep it rolling over and over, not sliding on its side
	for (int32 k = 1; bShellBody && k < 4; ++k)
	{
		if (!Slab[k].IsValid)
		{
			continue;
		}
		// the cabin's layers, welded to the body: one rigid body
		UBoxComponent* Cab = NewObject<UBoxComponent>(B);
		Cab->SetupAttachment(Box);
		Cab->SetBoxExtent(Slab[k].GetExtent());
		Cab->SetCollisionProfileName(TEXT("PhysicsActor"));
		Cab->SetPhysMaterialOverride(Snow);
		Cab->SetMassOverrideInKg(NAME_None, 1.f, true);
		Cab->RegisterComponent();
		Cab->SetWorldTransform(FTransform(R, CarT.TransformPosition(Slab[k].GetCenter())));
		Cab->WeldTo(Box);
	}
	UE_LOG(LogTemp, Display, TEXT("EndingDirector: the car's physics body: %s (body %s, cabin %s / %s / %s)"), bShellBody ? TEXT("its shell") : TEXT("one box"),
		*Slab[0].ToString(), *Slab[1].ToString(), *Slab[2].ToString(), *Slab[3].ToString());
	// everything on the car rides along without colliding with its own body; the guardrail gives way (it is torn)
	TArray<AActor*> On;
	Car->GetAttachedActors(On, true, true);
	On.Add(Car);
	for (AActor* A : On)
	{
		TArray<UPrimitiveComponent*> Prims;
		A->GetComponents(Prims);
		for (UPrimitiveComponent* P : Prims)
		{
			if (P && !CarParts.Contains(P))
			{
				P->SetCollisionEnabled(ECollisionEnabled::NoCollision);
			}
		}
	}
	for (TActorIterator<AActor> It(GetWorld()); It; ++It)
	{
		if (It->ActorHasTag(TEXT("Guardrail")))
		{
			// it gives way to the car's body (it is torn), but stays measurable
			TArray<UStaticMeshComponent*> Rails;
			It->GetComponents(Rails);
			for (UStaticMeshComponent* Rc : Rails)
			{
				Rc->SetCollisionEnabled(ECollisionEnabled::QueryOnly);
				Rc->SetCollisionResponseToAllChannels(ECR_Ignore);
				if (!It->ActorHasTag(TEXT("GuardrailBreak")))
				{
					RailParts.Add(Rc);
				}
			}
		}
		// far scenery collides only on its own surface (without that Unreal would wrap the range in one hull round the
		// road: Scripts/far_terrain_collision.py gives it its triangles)
		TArray<UStaticMeshComponent*> Comps;
		It->GetComponents(Comps);
		for (UStaticMeshComponent* C : Comps)
		{
			UStaticMesh* SM = C->GetStaticMesh();
			if (SM && SM->GetName().StartsWith(TEXT("Terrain_Far")) && !(SM->GetBodySetup() && SM->GetBodySetup()->CollisionTraceFlag == CTF_UseComplexAsSimple))
			{
				C->SetCollisionEnabled(ECollisionEnabled::NoCollision);
			}
		}
	}
	Car->AttachToActor(B, FAttachmentTransformRules::KeepWorldTransform);
	Body = B;
	BodyBox = Box;
	// the blow: the trip is authored from here (TripPose), physics takes over at the edge
	ImpactPose = B->GetActorTransform();
	PrevPos = ImpactPose.GetLocation();
	PrevVel = R.GetForwardVector() * SpeedNow;
	Jolt = 1.f;
	HeadOff = FVector(0.f, -StallYank(), 0.f);    // (the stall: where its grip had the head; no jump between the cameras)
	BurstWindow(true);
	if (SlowMoT0 < 0.f)
	{
		SlowMoT0 = RealTime;
		UGameplayStatics::SetGlobalTimeDilation(this, SlowMo);
	}
	for (TActorIterator<AActor> It(GetWorld()); It; ++It)
	{
		if (It->ActorHasTag(TEXT("GuardrailBreak")))
		{
			It->SetActorHiddenInGame(true);
			It->SetActorEnableCollision(false);
		}
	}
	UE_LOG(LogTemp, Display, TEXT("EndingDirector: impact at %.1f s, %.0f m along the road, %.1f km/h"), Time, (StartDistance + DistNow) / 100.f, SpeedNow * 0.036f);
	Event(TEXT("impact"));
}

void AEndingDirector::Event(const TCHAR* Kind, float Value)
{
	UE_LOG(LogTemp, Display, TEXT("CrashEvent %.3f %s %.0f"), bCrash ? RealTime : Time, Kind, Value);
	if (FCString::Strcmp(Kind, TEXT("title")) == 0)
	{
		ClipSummary();
	}
	if (!EventReal.Contains(FName(Kind)))
	{
		EventReal.Add(FName(Kind), RealTime);
	}
}

FTransform AEndingDirector::TripPose(float t) const
{
	// shoved across: fast at first (the blow), slowing; rolling faster and faster as the wheels catch and it trips;
	// a little yaw as the back swings; the crawl forward carries on
	const float T = FMath::Max(TripTime, 0.1f);
	const float v0 = 2.f * TripAcross / T * 0.62f, a = 2.f * (v0 * T - TripAcross) / (T * T);   // across(T) = TripAcross
	const float Across = v0 * t - 0.5f * a * t * t;
	const float Roll = TripRoll * (t / T) * (t / T);
	const FVector Off(SpeedNow * t, Across, 18.f * FMath::Sin(PI * FMath::Min(1.f, t / T)));
	const FQuat Q = ImpactPose.GetRotation() * FRotator(0.f, 9.f * (t / T), Roll).Quaternion();
	FTransform P(Q, ImpactPose.TransformPosition(Off));
	// ride the ground: the lowest of the box's corners stays just above the surface
	if (BodyBox)
	{
		const FVector E = BodyBox->GetUnscaledBoxExtent();
		float Lift = 0.f;
		for (int32 c = 0; c < 8; ++c)
		{
			const FVector Corner = P.TransformPosition(FVector(c & 1 ? E.X : -E.X, c & 2 ? E.Y : -E.Y, c & 4 ? E.Z : -E.Z));
			FHitResult H;
			FCollisionQueryParams Qp(TEXT("TripGround"), true, Body);
			Qp.AddIgnoredActor(Car);
			if (GetWorld()->LineTraceSingleByChannel(H, Corner + FVector(0.f, 0.f, 300.f), Corner - FVector(0.f, 0.f, 300.f), ECC_WorldStatic, Qp))
			{
				Lift = FMath::Max(Lift, H.ImpactPoint.Z + 3.f - Corner.Z);
			}
		}
		P.AddToTranslation(FVector(0.f, 0.f, Lift));
	}
	return P;
}

void AEndingDirector::HandToPhysics()
{
	bPhysics = true;
	const float T = TripTime, dt = 1.f / 60.f;
	const FTransform A = TripPose(T - dt), Bp = TripPose(T);
	const FVector V = (Bp.GetLocation() - A.GetLocation()) / dt + FVector(0.f, 0.f, -150.f);   // over the edge, starting to drop
	const FQuat dQ = Bp.GetRotation() * A.GetRotation().Inverse();
	FVector Axis;
	float Angle;
	dQ.ToAxisAndAngle(Axis, Angle);
	BodyBox->SetSimulatePhysics(true);
	BodyBox->SetPhysicsLinearVelocity(V);
	BodyBox->SetPhysicsAngularVelocityInRadians(Axis * Angle / dt);
	UE_LOG(LogTemp, Display, TEXT("EndingDirector: over the edge at %.2f s: %.0f cm/s, rolling %.0f deg/s"), Time - ImpactTime, V.Size(), FMath::RadiansToDegrees(Angle / dt));
	EdgeReal = RealTime;
	Event(TEXT("edge"), V.Size());
}

float AEndingDirector::StallRock() const
{
	if (!bStall || SmashT < 0.f || Time < SmashT)
	{
		return 0.f;
	}
	// its hand through the glass: the body knocked away from it and back on its springs; then each time it hauls on the
	// door (its other hand on the roof's edge), the car rolled toward it
	const float g = Time - SmashT;
	float Roll = 2.2f * FMath::Exp(-4.f * g) * FMath::Sin(11.f * g);
	const float a = Time - SmashT - StallFace - 0.35f;
	if (!bImpacted && a > 0.f)
	{
		Roll -= 0.35f * (1.f - FMath::Cos(a * 12.f)) * FMath::Min(1.f, a / 0.2f);
	}
	return Roll;
}

float AEndingDirector::StallYank() const
{
	if (!bStall || SmashT < 0.f)
	{
		return 0.f;
	}
	// its hand has the driver by the collar: the head jerked toward the hole, held, then let go as it shoves
	const float g = Time - SmashT - StallFace - 0.25f;
	if (g <= 0.f)
	{
		return 0.f;
	}
	const float In = FMath::Sin(FMath::Min(g / 0.1f, 1.f) * HALF_PI);
	return 8.f * In * (0.75f + 0.25f * FMath::Exp(-6.f * g)) + 1.2f * FMath::Sin(g * 21.f) * In;
}

void AEndingDirector::BurstWindow(bool bDriver)
{
	// tempered side glass: gone at once, pebbles flying in (car frame: the driver's door glass is at y -35, the
	// passenger's at y 109; the windows run from the A pillar back to the B pillar, sill to roof)
	if (bDriver && bDriverBurst)
	{
		return;                             // (already broken: by its hand)
	}
	bDriverBurst = bDriverBurst || bDriver;
	if (SideGlassMID)
	{
		SideGlassMID->SetScalarParameterValue(TEXT("Gone"), 1.f);
		bSideGlassGone = true;
	}
	AGlassBurst* G = GetWorld()->SpawnActor<AGlassBurst>(AGlassBurst::StaticClass(), Car->GetActorTransform());
	if (!G)
	{
		return;
	}
	G->AttachToActor(Car, FAttachmentTransformRules::KeepWorldTransform);
	for (UPrimitiveComponent* P : CarParts)
	{
		G->Solids.Add(P);
	}
	G->Skip = SideGlassMID.Get();
	if (APlayerCameraManager* Cam = UGameplayStatics::GetPlayerCameraManager(this, 0))
	{
		// the head: a sphere a little behind the eyes, its front at the brow and the bridge of the nose
		G->Head = Car->GetActorTransform().InverseTransformPosition(Cam->GetCameraLocation()) + FVector(-7.f, 0.f, -2.f);
		G->HeadRadius = 13.f;
	}
	const FBox Win = bDriver ? FBox(FVector(-45.f, -36.f, 99.f), FVector(48.f, -33.f, 128.f)) : FBox(FVector(-45.f, 106.f, 99.f), FVector(48.f, 109.f, 128.f));
	G->Burst(Win, FVector(0.f, bDriver ? 1.f : -1.f, 0.f), bDriver ? 420.f : 200.f, bDriver ? 520 : 380, GranuleMaterial, bDriver ? 11 : 23);
	UE_LOG(LogTemp, Display, TEXT("EndingDirector: glass burst: actor scale %s, car scale %s, head at %s"), *G->GetActorScale3D().ToString(),
		*Car->GetActorScale3D().ToString(), *G->Head.ToString());
}

void AEndingDirector::OnBodyHit(UPrimitiveComponent* HitComp, AActor* Other, UPrimitiveComponent* OtherComp, FVector NormalImpulse, const FHitResult& Hit)
{
	// the first time the car comes down on its side or roof, the windshield cracks and the other window goes
	if (!bCracked && Body && bPhysics && Body->GetActorUpVector().Z < 0.35f)
	{
		bCracked = true;
		if (WindshieldMID)
		{
			WindshieldMID->SetScalarParameterValue(TEXT("Crash"), 1.f);
		}
		BurstWindow(false);
		Jolt = FMath::Max(Jolt, 0.8f);
		UE_LOG(LogTemp, Display, TEXT("EndingDirector: the car comes down on its side at %.2f s: the windshield cracks"), Time - ImpactTime);
		Event(TEXT("crack"));
	}
	// each hard landing as it rolls (one per contact, not one per physics step)
	if (bPhysics && NormalImpulse.Size() > 120000.f && Time - LastHitEvent > 0.12f)
	{
		LastHitEvent = Time;
		const bool bTree = OtherComp && OtherComp->GetName() == TEXT("Trunk");
		Event(bTree ? TEXT("tree") : TEXT("hit"), NormalImpulse.Size());
	}
	if (HitsLogged++ < 12)
	{
		const UStaticMeshComponent* SMC = Cast<UStaticMeshComponent>(OtherComp);
		UE_LOG(LogTemp, Display, TEXT("EndingDirector: body hit %s, mesh %s, collision %d, at %s, impulse %.0f"), Other ? *Other->GetActorNameOrLabel() : TEXT("?"),
			SMC && SMC->GetStaticMesh() ? *SMC->GetStaticMesh()->GetName() : TEXT("?"), OtherComp ? (int32)OtherComp->GetCollisionEnabled() : -1,
			*Hit.ImpactPoint.ToString(), NormalImpulse.Size());
	}
}

void AEndingDirector::CrashCamera(float DeltaSeconds)
{
	// The driver's head lags behind the car's accelerations (thrown against the belt and the door), plus the jolt of
	// the blow; eased back by the neck
	if (!BodyBox || !Camera || DeltaSeconds <= 0.f)
	{
		return;
	}
	if (bUpsideDown)
	{
		// hanging in the belt, upside down: the head hangs toward the roof, swaying a little with the breath
		HeadOff += (FVector(0.f, 0.f, 7.f) - HeadOff) * (1.f - FMath::Exp(-DeltaSeconds * 3.f));
		const FRotator Hang(5.f + 1.2f * FMath::Sin(RealTime * 0.8f), 0.f, 2.f * FMath::Sin(RealTime * 0.55f));   // (the car's up is the world's down: eyes toward the snow ahead)
		Camera->GetRootComponent()->SetRelativeLocationAndRotation(ClearEye(CamRest + HeadOff), CamRestRot + Hang);
		return;
	}
	const FVector Pos = Body->GetActorLocation();
	const FVector Vel = (Pos - PrevPos) / DeltaSeconds;     // from positions: the trip is authored, the tumble simulated
	PrevPos = Pos;
	static float NextLog = 0.f;
	if (Time >= NextLog)
	{
		NextLog = Time + 0.5f;
		UE_LOG(LogTemp, Display, TEXT("EndingDirector: crash t+%.1f body %s rot %s vel %.0f cm/s spin %s sim %d | car %s"), Time - ImpactTime,
			*Body->GetActorLocation().ToString(), *Body->GetActorRotation().ToString(), Vel.Size(), *BodyBox->GetPhysicsAngularVelocityInDegrees().ToString(),
			BodyBox->IsSimulatingPhysics() ? 1 : 0, *Car->GetActorLocation().ToString());
	}
	const FVector Acc = (Vel - PrevVel) / DeltaSeconds - FVector(0.f, 0.f, -980.f);   // what the body feels (gravity felt as up)
	PrevVel = Vel;
	const FVector Local = Body->GetActorTransform().InverseTransformVectorNoScale(Acc - FVector(0.f, 0.f, 980.f));
	FVector Want = -Local * 0.0045f;
	Want = Want.GetClampedToMaxSize(22.f);
	HeadOff += (Want - HeadOff) * (1.f - FMath::Exp(-DeltaSeconds * 12.f));
	HeadRot.Roll = FMath::FInterpTo(HeadRot.Roll, FMath::Clamp(Local.Y * 0.004f, -14.f, 14.f), DeltaSeconds, 9.f);
	HeadRot.Pitch = FMath::FInterpTo(HeadRot.Pitch, FMath::Clamp(-Local.X * 0.003f, -10.f, 10.f), DeltaSeconds, 9.f);
	Jolt = FMath::Max(0.f, Jolt - DeltaSeconds * 2.2f);
	const float J = Jolt * Jolt;
	const FVector Shake(FMath::Sin(Time * 61.f) * 3.f * J, FMath::Sin(Time * 47.f + 1.f) * 5.f * J, FMath::Sin(Time * 53.f + 2.f) * 3.f * J);
	const FRotator ShakeR(FMath::Sin(Time * 43.f) * 3.f * J, FMath::Sin(Time * 37.f + 1.f) * 4.f * J, FMath::Sin(Time * 59.f) * 5.f * J);
	const FRotator Look(LookPitch, LookYaw, 0.f);
	Camera->GetRootComponent()->SetRelativeLocationAndRotation(ClearEye(CamRest + HeadOff + Shake + Look.RotateVector(FVector(9.f, 0.f, 8.f)) - FVector(9.f, 0.f, 8.f)),
		CamRestRot + HeadRot + ShakeR + Look);
}

void AEndingDirector::PlaceCamera()
{
	// the head turns and nods about the neck (a little behind and below the eyes), leans in, and shakes at the scream
	if (Camera)
	{
		const FRotator Look(LookPitch, LookYaw, 0.f);
		const FVector Neck(9.f, 0.f, 8.f);
		const float S = RoarShake * RoarShake;
		const FVector Shake(FMath::Sin(Time * 53.f) * 1.2f * S, FMath::Sin(Time * 41.f + 1.f) * 1.6f * S, FMath::Sin(Time * 47.f + 2.f) * 1.2f * S);
		const FRotator ShakeR(FMath::Sin(Time * 39.f) * 1.5f * S, FMath::Sin(Time * 45.f + 1.f) * 2.f * S, FMath::Sin(Time * 51.f) * 1.5f * S);
		Camera->GetRootComponent()->SetRelativeLocationAndRotation(ClearEye(CamRest + Look.RotateVector(Neck) - Neck + FVector(HeadPush, HeadSide - StallYank(), -HeadDrop) + Shake),
			CamRestRot + Look + ShakeR);
		static const bool bSideCam = FParse::Param(FCommandLine::Get(), TEXT("sidecam"));
		if (bSideCam && Car)
		{
			// checking: the view from outside, beside the car, at the bonnet and the windshield (what touches what)
			const FTransform CT = Car->GetActorTransform();
			const FVector From = CT.TransformPosition(FVector(110.f, -430.f, 135.f)), To = CT.TransformPosition(FVector(105.f, 20.f, 105.f));
			Camera->SetActorLocationAndRotation(From, (To - From).Rotation());
		}
		static const bool bKeyCam = FParse::Param(FCommandLine::Get(), TEXT("keycam"));
		if (bKeyCam && Car && Arms)
		{
			// checking: close by the key, from the passenger's side and above (the hand on it, the pinch, the bunch)
			const FTransform CT = Car->GetActorTransform();
			const FVector To = CT.TransformPosition(Arms->KeyAt + FVector(0.f, 0.f, -1.5f));
			static float KeyCamSide = 1.f;
			FParse::Value(FCommandLine::Get(), TEXT("-keycamside="), KeyCamSide);
			// (1: from behind, right and above; 2: from in the dash, looking back out at the hand's palm side)
			const FVector From = CT.TransformPosition(Arms->KeyAt + (KeyCamSide > 1.5f ? FVector(10.f, 13.f, 5.f) : FVector(-26.f, 24.f, 16.f)));
			Camera->SetActorLocationAndRotation(From, (To - From).Rotation());
			if (UCameraComponent* Cc = Camera->FindComponentByClass<UCameraComponent>())
			{
				Cc->PostProcessSettings.bOverride_DepthOfFieldFocalDistance = true;
				Cc->PostProcessSettings.DepthOfFieldFocalDistance = FVector::Dist(From, To);
				Cc->PostProcessSettings.bOverride_DepthOfFieldFstop = true;
				Cc->PostProcessSettings.DepthOfFieldFstop = 22.f;
			}
		}
	}
}

float AEndingDirector::LookWant(float DeltaSeconds)
{
	// where the driver looks (the head takes part of each look, the eyes the rest), and what the eyes focus on: the
	// road; down at the letter; the smashed gap going by on the right; the eyes in the trees; the shape in the road,
	// leaning in to it as it stares; creeping on, the dark window on the left, the drop on the right, the mirror, the
	// road; then the growl on the left and the head snaps round
	float Want = 0.f, WantPitch = -2.f, WantPush = 0.f, Rate = 5.f, Focus = 1500.f, WantSide = 0.f, WantDrop = 0.f;
	bOnKey = false;
	const float t = Time;
	auto DistTo = [this](const FVector& W) { return Camera ? FVector::Dist(Camera->GetActorLocation(), W) : 1500.f; };
	if (bImpacted && bStall && t < ImpactTime + 0.8f)
	{
		// the blow at the door: the head whipped round to it, on reflex (slowed): it is there, in the burst window, driving
		// the car over
		Want = -72.f;
		WantPitch = -4.f;
		Rate = 16.f;
		Focus = 90.f;
	}
	else if (bImpacted)
	{
		Want = 0.f;               // thrown about from here: the neck brings it back as it can
		WantPitch = 0.f;
		Rate = 1.5f;
	}
	else if (bStall && StallT >= 0.f)
	{
		// the engine gone: a glance down at the dials as it dies, back up at the road as it rolls to a stop; then down at
		// the key, the hand on it, turning it; up at the road ahead between the second try and the last (never toward the
		// side it comes from: nothing gives it away), back down for the last, frantic one
		const float s = t - StallT;
		const float k = StopT >= 0.f ? t - StopT : -1.f;
		const bool bDials = s > 0.25f && s < 1.3f;
		const bool bKey = k >= 0.55f && (k < 2.15f || (k > 3.0f && k < 3.6f) || k > 4.6f);
		if (SmashT >= 0.f)
		{
			// the glass bursts in at the left: the head whipped round to it, back from it; its face is right there
			Want = -78.f;
			WantPitch = -2.f;
			Rate = 14.f;
			Focus = 80.f;
			WantPush = -6.f;
		}
		else if (bKey && Car)
		{
			const FVector KeyW = Car->GetActorTransform().TransformPosition(Arms ? Arms->KeyAt : FVector(72.5f, 8.7f, 74.f));
			float Unused = 0.f;
			// (leaning in over it, to the right and down, to see the key and the hand on it past the forearm; the eyes on
			// the key's head and the bunch hanging under it)
			const FVector KeySee = KeyW - Car->GetActorUpVector() * 1.5f;
			LookAt(KeySee, 0.85f, Want, Unused);
			LookAt(KeySee, 0.9f, Unused, WantPitch);
			WantPitch = FMath::Clamp(WantPitch, -42.f, 0.f);
			Rate = 4.f;
			Focus = DistTo(KeySee);
			WantPush = 11.f;
			WantSide = 8.f;
			WantDrop = 5.f;
			bOnKey = true;
		}
		else if (bDials)
		{
			Want = 2.f;
			WantPitch = -16.f;
			Rate = 5.f;
			Focus = 70.f;
		}
		else
		{
			Want = -1.f + 2.f * FMath::Sin(t * 0.9f);
			WantPitch = -2.f;
			Rate = 3.f;
			Focus = 1500.f;
		}
	}
	else if (bHoodReveal && PeerT0 >= 0.f && t >= PeerT0 + 0.3f)
	{
		Want = -78.f;             // the dark window on the left: its face is there
		WantPitch = -2.f;
		Rate = 10.f;
		Focus = 80.f;
	}
	else if (bHoodReveal && bHoodAttack && LeapT0 >= 0.f && t < LeapT0 + 2.4f && Creature)
	{
		// after it as it is flung off down the road, tumbling, and as it goes off into the dark
		const FVector At = Creature->GetActorLocation() + FVector(0.f, 0.f, 60.f);
		float Unused = 0.f;
		LookAt(At, 0.8f, Want, Unused);
		LookAt(At, 0.9f, Unused, WantPitch);
		WantPitch = FMath::Clamp(WantPitch, -15.f, 10.f);
		Rate = 6.f;
		Focus = DistTo(At);
		WantPush = -3.f;
	}
	else if (bHoodReveal && LeapT0 >= 0.f && t < LeapT0 + 2.2f)
	{
		Want = 4.f;               // up after it as it springs off over the car; up at the roof as it goes over it
		WantPitch = t < LeapT0 + 0.4f ? 16.f : 12.f;
		Rate = t < LeapT0 + 0.4f ? 8.f : 3.f;
		Focus = 120.f;
	}
	else if (bHoodReveal && RiseT0 >= 0.f && LeapT0 < 0.f && Creature && Creature->GetBody())
	{
		const float r = t - RiseT0;
		// (the eyes are on the road until its face has swung into sight, and a beat after: a startle, not a search)
		if (!bHoodAttack && (HangInT < 0.f || t < HangInT + 0.32f))
		{
			// the thud overhead (no warning: the eyes were on the road): a flinch up at the roof, then back down to the road
			// and held there, frozen. The eyes don't know where it will come from (the owner: never looking ahead to
			// where it will appear), so nothing gives it away
			const bool bFlinch = r < 0.8f;
			Want = bFlinch ? 3.f : -2.f + 3.f * FMath::Sin(r * 1.3f);
			WantPitch = bFlinch ? 11.f : -3.f;
			Rate = bFlinch ? 7.f : 1.6f;
			Focus = bFlinch ? 60.f : 1500.f;
		}
		else
		{
			// it is there, all at once: the eyes snap to its face and stay on it; back into the seat from it
			const FVector At = Creature->FaceAt();
			float Unused = 0.f;
			LookAt(At, 0.75f, Want, Unused);
			LookAt(At, 0.9f, Unused, WantPitch);
			WantPitch = FMath::Clamp(WantPitch, -15.f, 16.f);           // (above that the visors and the roof hide it)
			Rate = t < HangInT + 0.7f ? 7.f : 5.f;
			Focus = DistTo(At);
			WantPush = t < HangInT + 0.8f ? -6.f : -3.f;    // (a jolt back into the seat, then held there)
		}
	}
	else if (bHoodReveal && DartT0 >= 0.f && JumpT0 < 0.f && t < DartT0 + 1.6f)
	{
		Want = -14.f;             // the flinch: the eyes after the shape gone into the dark on the left
		WantPitch = -3.f;
		Rate = 6.f;
		Focus = 1500.f;
	}
	else if (bHoodReveal && StopT >= 0.f && RiseT0 < 0.f)
	{
		const float s = t - StopT;  // the empty road: left, right, ahead
		Want = s < 0.8f ? 0.f : s < 2.0f ? -34.f : s < 3.1f ? 28.f : 0.f;
		WantPitch = -3.f;
		Rate = 3.f;
		Focus = 1500.f;
	}
	else if (bHoodReveal && GoneT >= 0.f && PeerT0 < 0.f && t >= CreepTime + 0.6f)
	{
		const float c = t - CreepTime - 0.6f;   // the creep: the drop on the right, the mirror, the road
		if (c < 1.6f)
		{
			Want = 46.f;
			WantPitch = -6.f;
			Rate = 2.6f;
			Focus = 1200.f;
		}
		else if (c < 3.4f && Car)
		{
			LookAt(Car->GetActorTransform().TransformPosition(MirrorAt), 0.92f, Want, WantPitch);
			Rate = 3.f;
			Focus = 1200.f;
		}
		else
		{
			Want = -3.f;
			Rate = 2.f;
		}
	}
	else if (t >= ImpactTime - 0.75f)
	{
		Want = -80.f;
		WantPitch = bHoodReveal ? -2.f : 7.f;
		Rate = 11.f;
		Focus = 250.f;
	}
	else if (bCrash && Letter && t >= LetterTime && t < LetterTime + 3.2f)
	{
		LookAt(Letter->GetActorLocation(), 0.75f, Want, WantPitch);
		Rate = 3.2f;
		Focus = DistTo(Letter->GetActorLocation());
	}
	else if (bCrash && !GapAt.IsZero() && t >= GapTime - 3.5f && t < GapTime + 0.5f)
	{
		LookAt(GapAt, 0.8f, Want, WantPitch);
		Want = FMath::Clamp(Want, -10.f, 42.f);
		WantPitch = FMath::Clamp(WantPitch, -14.f, 4.f);
		Rate = 3.5f;
		Focus = DistTo(GapAt);
	}
	else if (bCrash && bEyesShown && t < EyesTime + 2.3f)
	{
		LookAt(EyesAt, 0.65f, Want, WantPitch);
		Rate = 4.f;
		Focus = DistTo(EyesAt);
	}
	else if (Creature && CreStage >= 1 && CreStage <= 3 && t >= SightTime - 0.2f && t < CreepTime + 0.8f && Camera)
	{
		const FVector Head = Creature->GetBody() ? Creature->GetBody()->GetSocketLocation(TEXT("head")) : Creature->GetActorLocation() + FVector(0.f, 0.f, 210.f);
		float Unused = 0.f;
		LookAt(Head, 0.6f, Want, Unused);
		LookAt(Head, 0.9f, Unused, WantPitch);
		WantPitch = FMath::Clamp(WantPitch - 2.f, -15.f, 22.f);
		Want = FMath::Clamp(Want, -40.f, 40.f);
		Rate = 7.f;
		Focus = DistTo(Head);
		if (CreStage == 2 && !bShook)
		{
			WantPush = 5.5f;      // leaning in, without meaning to
		}
	}
	else if (t >= CreepTime + 0.6f && t < ImpactTime - 1.6f)
	{
		const float c = t - CreepTime - 0.6f;
		if (c < 2.2f)
		{
			Want = -60.f;         // the dark window on the left
			WantPitch = -3.f;
			Rate = 2.2f;
			Focus = 400.f;
		}
		else if (c < 3.9f)
		{
			Want = 46.f;          // the drop on the right
			WantPitch = -6.f;
			Rate = 2.6f;
			Focus = 1200.f;
		}
		else if (c < 6.f && Car)
		{
			LookAt(Car->GetActorTransform().TransformPosition(MirrorAt), 0.92f, Want, WantPitch);   // the mirror: the empty road behind
			Rate = 3.f;
			Focus = 1200.f;
		}
		else
		{
			Want = -4.f;
			Rate = 2.f;
		}
	}
	else if (t >= ImpactTime - 1.6f)
	{
		Want = -6.f;
		Rate = 2.5f;
	}
	if (CamComp && bCrash && Camera)
	{
		float WantEv = 0.f;
		if (Creature && CreStage == 6)
		{
			WantEv = HoodEv;
		}
		else if (Creature && CreStage >= 1 && CreStage <= 3 && !bImpacted)
		{
			const float D = FVector::Dist(Creature->GetActorLocation(), Camera->GetActorLocation());
			WantEv = FMath::Clamp(GlareEv + 2.f * FMath::Log2(FMath::Max(D, 1.f) / 550.f), GlareEv, 0.f);
		}
		FPostProcessSettings& PP = CamComp->PostProcessSettings;
		PP.bOverride_AutoExposureBias = true;
		PP.AutoExposureBias += (WantEv - PP.AutoExposureBias) * (1.f - FMath::Exp(-DeltaSeconds * (WantEv < PP.AutoExposureBias ? 1.6f : 0.6f)));
	}
	if (CamComp && bCrash)
	{
		const bool bFix = (Creature && CreStage == 2 && bStopped && !bShook && !bImpacted) ||
			false;
		// (on the key: the view closes in a little on it, as the attention does)
		const float FovRate = bFix ? 0.38f : bOnKey ? 1.8f : 5.f;
		const float FovWant = bFix ? StareFov : bOnKey ? KeyFov : BaseFov;
		CamComp->SetFieldOfView(CamComp->FieldOfView + (FovWant - CamComp->FieldOfView) * (1.f - FMath::Exp(-DeltaSeconds * FovRate)));
	}
	const float k = 1.f - FMath::Exp(-DeltaSeconds * Rate);
	LookYaw += (Want - LookYaw) * k;
	LookPitch += (WantPitch - LookPitch) * k;
	HeadPush += (WantPush - HeadPush) * (1.f - FMath::Exp(-DeltaSeconds * (WantPush > HeadPush ? 0.6f : 2.f)));
	HeadSide += (WantSide - HeadSide) * (1.f - FMath::Exp(-DeltaSeconds * 2.4f));
	HeadDrop += (WantDrop - HeadDrop) * (1.f - FMath::Exp(-DeltaSeconds * 2.4f));
	if (bCrash && !bImpacted)
	{
		SetFocus(FocusCm + (Focus - FocusCm) * (1.f - FMath::Exp(-DeltaSeconds * 3.5f)));
	}
	return Want;
}

AHusk* AEndingDirector::SpawnHusk(const TCHAR* Take)
{
	FActorSpawnParameters P;
	P.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
	AHusk* H = GetWorld()->SpawnActor<AHusk>(AHusk::StaticClass(), FTransform(CreFrom), P);
	if (!H || !H->Setup())
	{
		if (H)
		{
			H->Destroy();
		}
		return nullptr;
	}
	H->SetActorScale3D(FVector(HuskScale));
	CreatureYawFix = -H->MeshForwardYaw();
	H->Play(Take, true);
	CrePos = CreFrom;
	CreDir0 = CreDir;
	CreTakeYaw = 0.f;
	Creature = H;
	MoveCreature(0.f);
	return H;
}

float AEndingDirector::CreatureGround(const FVector& At) const
{
	// the snow it runs on: the terrain itself (not the rail, the posts or the car)
	TArray<FHitResult> Hits;
	FCollisionQueryParams Q(TEXT("CreatureGround"), true);
	if (Body)
	{
		Q.AddIgnoredActor(Body);
	}
	if (SolidHolder)
	{
		Q.AddIgnoredActor(SolidHolder);
	}
	GetWorld()->LineTraceMultiByChannel(Hits, At + FVector(0.f, 0.f, 6000.f), At - FVector(0.f, 0.f, 6000.f), ECC_WorldStatic, Q);
	for (const FHitResult& H : Hits)
	{
		const UStaticMeshComponent* S = Cast<UStaticMeshComponent>(H.GetComponent());
		const FString N = S && S->GetStaticMesh() ? S->GetStaticMesh()->GetName() : FString();
		if (N.StartsWith(TEXT("Terrain")) || N == TEXT("Road") || N == TEXT("Town_Ground"))     // (the town's snow, at the foot of the fall)
		{
			return H.ImpactPoint.Z;
		}
	}
	return At.Z;
}

namespace
{
	float Smooth01(float x)
	{
		x = FMath::Clamp(x, 0.f, 1.f);
		return x * x * (3.f - 2.f * x);
	}

	// the sighting take's path (as tools/blender/husk_body.py made it): speed (m/s at the model's size) and how far
	// it has turned to its left (degrees), t seconds into the take
	const float TA = 28.f / 60.f, TB = TA + 0.63f, TC = TB + 4.6f, TD = TC + 1.8f, TE = TD + 0.6f, TF = TE + 2.f * 28.f / 60.f;
	void SightingPath(float t, float& V, float& Turn)
	{
		if (t < TA) { V = 8.f; Turn = 0.f; }
		else if (t < TB) { const float u = (t - TA) / (TB - TA); V = 8.f * (1.f - u) * (1.f - u); Turn = 90.f * Smooth01(u); }
		else if (t < TC) { V = 0.f; Turn = 90.f; }
		else if (t < TD) { const float r = t - TC; V = (r > 0.1f && r < 0.4f) ? 0.5f : 0.f; Turn = 90.f; }      // the stride of the thrust
		else if (t < TE) { V = 0.f; Turn = 90.f; }
		else { const float tt = t - TE; V = 8.f * Smooth01(tt / 0.6f); Turn = 90.f - 160.f * Smooth01(tt / 0.45f); }
	}

	// its jaw through the scream (degrees): flung open with the thrust, shaking, then shut
	float ScreamJaw(float t)
	{
		if (t < TC || t > TD)
		{
			return 0.f;
		}
		const float r = t - TC;
		const float Roaring = Smooth01((r - 0.22f) / 0.08f) * (1.f - Smooth01((r - 1.4f) / 0.1f));
		return 12.f * Smooth01(r / 0.1f) + 30.f * Smooth01((r - 0.06f) / 0.16f) - 38.f * Smooth01((r - 1.45f) / 0.3f)
			+ 2.5f * FMath::Sin(r * 41.f) * Roaring;
	}
}

void AEndingDirector::MoveCreature(float DeltaSeconds)
{
	AHusk* H = Creature;
	if (!H || CreStage >= 5)
	{
		return;                   // (at the bonnet and the window it is placed by RevealBeats)
	}
	const float K = HuskScale;
	float V = CreatureSpeed * K;
	float Jaw = 7.f + 3.f * FMath::Sin(Time * 13.f);          // breathing hard through its teeth as it runs
	if (CreStage == 1 && Time >= CreSwitchAt)
	{
		// into the take where it is (it has run exactly two strides, so the gallop meets the take's first frame)
		CreStage = 2;
		CreTakeT0 = Time;
		CreTakeClock = 0.f;
		CrePos = FVector(CreSwitch.X, CreSwitch.Y, CrePos.Z);
		H->Play(TEXT("Sighting"), false);
		H->GetBody()->SetPlayRate(0.f);          // posed from its own clock (slowed for the stare)
		Event(TEXT("halt"));
	}
	if (CreStage == 2)
	{
		// the stare: from as it skids round to face the car until it rears up, the take slowed
		const float Slow = (CreTakeClock > TB && CreTakeClock < TC) ? StareRate : (CreTakeClock > TA + 0.25f && CreTakeClock <= TB) ? StareTurnRate : 1.f;
		CreTakeClock += DeltaSeconds * Slow;
		const float t = CreTakeClock;
		H->GetBody()->SetPosition(FMath::Min(t, TF), false);
		if (t >= TF)
		{
			// away up the road, at a gallop (its heading from here on follows the road: below)
			CreStage = 3;
			CreDir = FRotator(0.f, 70.f, 0.f).RotateVector(CreDir0).GetSafeNormal2D();
			CreTakeYaw = 0.f;
			CreHop0 = CreHop1 = -1.f;
			CreS = 0.f;
			H->Play(TEXT("Gallop"), true);
			H->GetBody()->SetPlayRate(1.f);
			Event(TEXT("bolt"));
			BoltTime = Time;
			CreepTime = Time + CreepAfterBolt;
			ImpactTime = CreepTime + ImpactAfterCreep;
		}
		else
		{
			float Vm, Turn;
			SightingPath(t, Vm, Turn);
			V = Vm * 100.f * K * Slow;
			CreTakeYaw = Turn;
			CreDir = FRotator(0.f, -Turn, 0.f).RotateVector(CreDir0).GetSafeNormal2D();
			if (t > TC - 0.05f && t < TD + 0.05f && !bScreamed)
			{
				bScreamed = true;
				Event(TEXT("roar"));
			}
			if (!bShook && t > TC + 0.2f)
			{
				bShook = true;           // the scream hits: the view shakes, the driver recoils
				RoarShake = 1.f;
				HeadPush = -9.f;
				Event(TEXT("scream"));
			}
			Jaw = FMath::Max(5.f, ScreamJaw(t));
		}
	}
	if (CreStage == 3)
	{
		// up the road through the headlights, keeping HaltSide left of the middle, the way the road bends
		const float Ahead = CreRoadD + CreS + 700.f;
		const FVector RoadT = (PathAt(Ahead + 300.f) - PathAt(Ahead - 300.f)).GetSafeNormal2D();
		const FVector RoadR = FVector::CrossProduct(FVector::UpVector, RoadT);
		const FVector Want = ((PathAt(Ahead) - RoadR * (175.f + HaltSide)) - CrePos).GetSafeNormal2D();
		CreDir = DeltaSeconds > 0.f ? FMath::VInterpNormalRotationTo(CreDir, Want, DeltaSeconds, 160.f).GetSafeNormal2D() : Want;
	}
	if (CreStage == 3 && CreS > 3100.f * K)
	{
		H->Destroy();             // gone into the dark up the road
		Creature = nullptr;
		return;
	}
	if (CreStage == 4)
	{
		Jaw = 24.f + 3.f * FMath::Sin(Time * 17.f);              // the snarl as it comes at the door
		USkeletalMeshComponent* M = H->GetBody();
		if (bImpacted)
		{
			// shoving the car over: it drives on behind it, slowing, and stops at the edge of the road
			const float k = FMath::Clamp((Time - ImpactTime) / FMath::Max(TripTime * 1.2f, 0.1f), 0.f, 1.f);
			V = CreatureSpeed * K * 0.55f * (1.f - k);
			M->SetPlayRate(FMath::Max(0.f, 0.7f * (1.f - k)));
		}
		else
		{
			V = CreatureSpeed * K * 0.85f;
			M->SetPlayRate(0.85f);
		}
	}
	H->JawOpen = Jaw;
	CreS += V * DeltaSeconds;
	CrePos += CreDir * V * DeltaSeconds;
	FVector P = CrePos;
	const float G = CreatureGround(P);
	const float Ga = CreatureGround(P + CreDir * 150.f), Gb = CreatureGround(P - CreDir * 150.f);
	P.Z = G;
	if (CreHop0 >= 0.f)
	{
		// the bound over the guardrail (measured from the road's middle, on the right)
		const float Off = FVector::DotProduct(P - CreCentre, CreRight);
		if (Off < CreHop1 && Off > CreHop0)
		{
			const float u = (CreHop1 - Off) / (CreHop1 - CreHop0);
			P.Z += 120.f * FMath::Sin(PI * u);
		}
	}
	CrePos.Z = P.Z;
	const float WantPitch = FMath::RadiansToDegrees(FMath::Atan2(Ga - Gb, 300.f)) * 0.6f;
	CrePitch = DeltaSeconds > 0.f ? FMath::FInterpTo(CrePitch, WantPitch, DeltaSeconds, 6.f) : WantPitch;
	const float Yaw = FMath::RadiansToDegrees(FMath::Atan2(CreDir.Y, CreDir.X));
	// turned to face its way first (the mesh's own forward), then yawed and pitched with the slope
	H->SetActorLocationAndRotation(P, FRotator(CrePitch, Yaw, 0.f).Quaternion() * FRotator(0.f, CreatureYawFix, 0.f).Quaternion());
	// none of it sunk into the snow where the ground is not as flat as the snow its takes were made on: lifted at once,
	// let down gently
	const float Lift = H->GroundLift([this](const FVector& At) { return CreatureGround(At); });
	CreLift = Lift > CreLift || DeltaSeconds <= 0.f ? Lift : FMath::FInterpTo(CreLift, Lift, DeltaSeconds, 5.f);
	H->AddActorWorldOffset(FVector(0.f, 0.f, CreLift));
	CreLiftMax = FMath::Max(CreLiftMax, Lift);
	if (Time >= CreLiftLogAt)
	{
		CreLiftLogAt = Time + 0.5f;
		UE_LOG(LogTemp, Display, TEXT("CreatureLift %.3f %.1f (most so far %.1f cm)"), Time, Lift, CreLiftMax);
	}
}

float AEndingDirector::HeadingAt(float Dist) const
{
	const FVector D = PathAt(Dist + 150.f) - PathAt(Dist - 150.f);
	return FMath::Atan2(D.Y, D.X);
}

FVector AEndingDirector::PathAt(float Dist) const
{
	if (Path.Num() == 0)
	{
		return FVector::ZeroVector;
	}
	if (Dist <= 0.f || Path.Num() == 1)
	{
		return Path[0] + (Path.Num() > 1 ? (Path[0] - Path[1]).GetSafeNormal() * -Dist : FVector::ZeroVector);
	}
	const int32 Hi = Algo::UpperBound(PathDist, Dist);
	if (Hi >= Path.Num())
	{
		return Path.Last();
	}
	const int32 Lo = Hi - 1;
	const float Seg = FMath::Max(PathDist[Hi] - PathDist[Lo], 1.f);
	return FMath::Lerp(Path[Lo], Path[Hi], (Dist - PathDist[Lo]) / Seg);
}
