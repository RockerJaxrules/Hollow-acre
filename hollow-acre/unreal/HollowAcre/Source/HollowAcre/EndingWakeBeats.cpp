// Part 2's opening: the wake in the wreck (-wake). The owner chose a short first-person cutscene that hands over to play
// standing beside the car, and approved this plan (about 30 s, all through the driver's own eyes, no creature):
//   1. hanging upside down in the belt: breath fogging, blood dripping onto the roof lining below; a hand braced on the
//      lining, the other at the buckle: it sticks (the body's weight on it); push up off the roof, and it lets go
//   2. the drop onto the roof: hard, glass crunching, a dark blink; dazed on one side
//   3. pushed up on an elbow: the glovebox spilled across the lining; the flashlight glints in it; the hand closes on it,
//      the thumb finds the switch: it flickers, then catches
//   4. a false scare: something thumps on the car; the head and the beam snap round to the rear window: snow sliding off
//      the upturned car, falling past the glass into the snow. The car ticking.
//   5. turned over to the smashed driver's window; out through it on the belly, into the snow
//   6. up onto the knees, slowly standing beside the car; a look back up the long chute it fell down, into the dark.
// Everything is in the car's frame (the car lies still, on its roof): +X its front, +Y its right (the passenger's side),
// +Z its roof, which is the world's down now. The roof lining (now the floor) is at Z 135.6; the driver's window runs
// from the lining (Z 134) up to the door's sill (Z 99) at Y -35; the snow beside it is at WakeGroundZ.
// The sound is mixed afterwards from the events logged here (tools/make_wake_audio.py), as the crash's is.

#include "EndingDirector.h"

#include "BloodFX.h"
#include "Camera/CameraActor.h"
#include "Camera/CameraComponent.h"
#include "Camera/PlayerCameraManager.h"
#include "Components/BoxComponent.h"
#include "Components/InstancedStaticMeshComponent.h"
#include "Components/PointLightComponent.h"
#include "Components/SpotLightComponent.h"
#include "Components/StaticMeshComponent.h"
#include "DriverArms.h"
#include "Engine/StaticMesh.h"
#include "Engine/StaticMeshActor.h"
#include "Engine/World.h"
#include "Kismet/GameplayStatics.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "GameFramework/PlayerController.h"
#include "Misc/CommandLine.h"
#include "Misc/Parse.h"
#include "Part2Character.h"

namespace
{
	float WSmooth(float x)
	{
		x = FMath::Clamp(x, 0.f, 1.f);
		return x * x * (3.f - 2.f * x);
	}

	// 0 before a, 1 after b, eased between
	float WRamp(float t, float a, float b)
	{
		return WSmooth((t - a) / FMath::Max(b - a, 1e-4f));
	}

	// piecewise linear through (t, v) keys
	float WKeys(float t, std::initializer_list<FVector2D> K)
	{
		const FVector2D* Prev = nullptr;
		for (const FVector2D& k : K)
		{
			if (t <= k.X)
			{
				return Prev ? FMath::Lerp(Prev->Y, k.Y, (t - Prev->X) / FMath::Max(k.X - Prev->X, 1e-4f)) : k.Y;
			}
			Prev = &k;
		}
		return Prev ? Prev->Y : 0.f;
	}

	// the eye: where it is and what it looks at (car frame), which way is the top of the head
	struct FWakeEyeKey
	{
		float T;
		FVector At, Look, Up;
	};

	FQuat WakeKeyQuat(const FWakeEyeKey& K)
	{
		return FRotationMatrix::MakeFromXZ((K.Look - K.At).GetSafeNormal(), K.Up.GetSafeNormal()).ToQuat();
	}

	FQuat WakeNear(const FQuat& Q, const FQuat& To)
	{
		return (Q | To) < 0.f ? FQuat(-Q.X, -Q.Y, -Q.Z, -Q.W) : Q;
	}

	// through the keys: the position on a Catmull-Rom spline in time, the turn by Squad; a key repeated is a pause
	FTransform WakeEvalEye(float t, const TArray<FWakeEyeKey>& K)
	{
		const int32 N = K.Num();
		if (t <= K[0].T)
		{
			return FTransform(WakeKeyQuat(K[0]), K[0].At);
		}
		if (t >= K[N - 1].T)
		{
			return FTransform(WakeKeyQuat(K[N - 1]), K[N - 1].At);
		}
		int32 i = 0;
		while (i < N - 2 && t >= K[i + 1].T)
		{
			++i;
		}
		const FWakeEyeKey& B = K[i];
		const FWakeEyeKey& C = K[i + 1];
		const FWakeEyeKey& A = K[FMath::Max(i - 1, 0)];
		const FWakeEyeKey& D = K[FMath::Min(i + 2, N - 1)];
		const float Span = FMath::Max(C.T - B.T, 1e-4f);
		const float a = FMath::Clamp((t - B.T) / Span, 0.f, 1.f);
		const float T0 = i > 0 ? A.T : B.T - Span, T3 = i + 2 < N ? D.T : C.T + Span;
		const FVector P = FMath::CubicCRSplineInterpSafe(A.At, B.At, C.At, D.At, T0, B.T, C.T, T3, t);
		const FQuat QA = WakeKeyQuat(A);
		const FQuat QB = WakeNear(WakeKeyQuat(B), QA);
		const FQuat QC = WakeNear(WakeKeyQuat(C), QB);
		const FQuat QD = WakeNear(WakeKeyQuat(D), QC);
		FQuat TB, TC;
		FQuat::CalcTangents(QA, QB, QC, 0.f, TB);
		FQuat::CalcTangents(QB, QC, QD, 0.f, TC);
		return FTransform(FQuat::Squad(QB, TB, QC, TC, a).GetNormalized(), P);
	}

	void WakeTint(AStaticMeshActor* A, int32 Slot, const FLinearColor& C, float Metal, float Rough)
	{
		if (!A)
		{
			return;
		}
		UStaticMeshComponent* M = A->GetStaticMeshComponent();
		if (Slot >= M->GetNumMaterials())
		{
			return;
		}
		// (from the parts material itself: the props came in with the engine's grey grid in their slots, and a tint on that
		// does nothing)
		static UMaterialInterface* Part = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Car/Keys/M_KeyPart.M_KeyPart"));
		UMaterialInstanceDynamic* D = Part ? UMaterialInstanceDynamic::Create(Part, M) : nullptr;
		if (D)
		{
			M->SetMaterial(Slot, D);
			D->SetVectorParameterValue(TEXT("Color"), C);
			D->SetScalarParameterValue(TEXT("Metallic"), Metal);
			D->SetScalarParameterValue(TEXT("Roughness"), Rough);
		}
	}
}

bool AEndingDirector::WakeOnce(const TCHAR* Kind, float At, float w)
{
	if (w < At || WakeFired.Contains(FName(Kind)))
	{
		return false;
	}
	WakeFired.Add(FName(Kind));
	Event(Kind);
	return true;
}

void AEndingDirector::WakeJump()
{
	// straight to the bottom: the car's glass as the attack and the fall left it, the car's body made (without the trip
	// or the fall), and left on its roof in the black (AfterTheFall places it, WakeSetup dresses it)
	if (APlayerCameraManager* Cm = UGameplayStatics::GetPlayerCameraManager(this, 0))
	{
		Cm->SetManualCameraFade(1.f, FLinearColor::Black, false);
	}
	bDriverBurst = true;                          // (its hand broke the driver's window; no burst now)
	if (SideGlassMID)
	{
		SideGlassMID->SetScalarParameterValue(TEXT("Gone"), 1.f);
		bSideGlassGone = true;
	}
	if (WindshieldMID)
	{
		WindshieldMID->SetScalarParameterValue(TEXT("Crash"), 1.f);
	}
	bCracked = true;
	SpeedNow = 0.f;
	ImpactTime = Time;
	Impact();
	UGameplayStatics::SetGlobalTimeDilation(this, 1.f);
	SlowMo = 1.f;
	bPhysics = true;
	if (BodyBox)
	{
		BodyBox->SetSimulatePhysics(false);
	}
	bRested = true;
	RestTime = Time;
	Jolt = 0.f;
	UE_LOG(LogTemp, Display, TEXT("EndingDirector: the wake: straight to the car on its roof at the bottom"));
}

void AEndingDirector::WakeSetup()
{
	const FTransform CT = Car->GetActorTransform();
	const FVector WUp = CT.InverseTransformVectorNoScale(FVector::UpVector).GetSafeNormal();
	// the snow's height beside the driver's door (car frame)
	{
		FHitResult H;
		FCollisionQueryParams Q(TEXT("WakeGround"), true, Body);
		Q.AddIgnoredActor(Car);
		if (SolidHolder)
		{
			Q.AddIgnoredActor(SolidHolder);
		}
		TArray<AActor*> On;
		Car->GetAttachedActors(On, true, true);
		Q.AddIgnoredActors(On);
		const FVector P = CT.TransformPosition(FVector(0.f, -110.f, 60.f));
		if (GetWorld()->LineTraceSingleByChannel(H, P + FVector(0.f, 0.f, 400.f), P - FVector(0.f, 0.f, 1500.f), ECC_WorldStatic, Q))
		{
			WakeGroundZ = CT.InverseTransformPosition(H.ImpactPoint).Z;
		}
		UE_LOG(LogTemp, Display, TEXT("EndingDirector: wake: the snow beside the driver's door at car z %.1f (the roof lining at 135.6); world up in the car's frame %s"),
			WakeGroundZ, *WUp.ToString());
	}
	// the camera as it was framed for the crash, at its own field of view
	if (CamComp)
	{
		CamComp->SetFieldOfView(BaseFov);
	}
	// the driver's arms back, the body free of the seat (DriverArmsFree.cpp), moved after this each frame
	if (Arms)
	{
		Arms->SetActorHiddenInGame(false);
		Arms->bFree = true;
		Arms->bSeatedLegs = true;
		Arms->AddTickPrerequisiteActor(this);
		// no finger or knuckle through the roof lining (inside the cabin; through the driver's window they're free)
		Arms->bFloorGuard = true;
		Arms->FloorAt = FVector(0.f, 0.f, 135.6f);
		Arms->FloorN = FVector(0.f, 0.f, -1.f);
		Arms->FloorBox = FBox2D(FVector2D(-110.f, -34.f), FVector2D(50.f, 108.f));
	}
	// the blood: from the cut in the hairline, dripping onto the roof lining (the car's parts catch it)
	if (!Blood)
	{
		Blood = GetWorld()->SpawnActor<ABloodFX>(ABloodFX::StaticClass(), CT);
	}
	if (Blood)
	{
		Blood->Ignore.Reset();
		Blood->Ignore.Add(Arms.Get());
		Blood->Ignore.Add(Body.Get());
		for (UPrimitiveComponent* P : CarParts)
		{
			if (P)
			{
				P->SetCollisionResponseToChannel(ECC_Camera, ECR_Block);
			}
		}
	}
	// the spill from the glovebox across the lining, on the passenger's side (the glovebox burst open as it rolled)
	auto Prop = [&](const TCHAR* Name, const FTransform& Rel) -> AStaticMeshActor*
	{
		UStaticMesh* SM = LoadObject<UStaticMesh>(nullptr, *FString::Printf(TEXT("/Game/HollowAcre/Wake/%s.%s"), Name, Name));
		if (!SM)
		{
			UE_LOG(LogTemp, Warning, TEXT("EndingDirector: wake: no %s"), Name);
			return nullptr;
		}
		FActorSpawnParameters P;
		P.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
		AStaticMeshActor* A = GetWorld()->SpawnActor<AStaticMeshActor>(AStaticMeshActor::StaticClass(), Rel * CT, P);
		if (!A)
		{
			return nullptr;
		}
		A->SetMobility(EComponentMobility::Movable);
		A->GetStaticMeshComponent()->SetStaticMesh(SM);
		A->GetStaticMeshComponent()->SetCollisionEnabled(ECollisionEnabled::NoCollision);
		A->AttachToActor(Car, FAttachmentTransformRules::KeepWorldTransform);
		WakeProps.Add(A);
		return A;
	};
	const float Zf = 135.6f;
	auto Flat = [&](const FVector& At, float YawDeg)
	{
		// lying flat on the lining, its top up (the world's up), turned by YawDeg about it
		const FVector X = FQuat(WUp, FMath::DegreesToRadians(YawDeg)).RotateVector(FVector(1.f, 0.f, 0.f) - WUp * WUp.X).GetSafeNormal();
		return FTransform(FRotationMatrix::MakeFromXZ(X, WUp).ToQuat(), At);
	};
	AStaticMeshActor* Manual = Prop(TEXT("Wake_Manual"), Flat(FVector(44.f, 66.f, Zf) + WUp * 0.46f, 24.f));
	WakeTint(Manual, 0, FLinearColor(0.03f, 0.035f, 0.045f), 0.f, 0.55f);
	WakeTint(Manual, 1, FLinearColor(0.6f, 0.58f, 0.52f), 0.f, 0.85f);
	AStaticMeshActor* Papers = Prop(TEXT("Wake_Papers"), Flat(FVector(25.f, 76.f, Zf) + WUp * 0.04f, -38.f));
	WakeTint(Papers, 0, FLinearColor(0.68f, 0.67f, 0.62f), 0.f, 0.8f);
	// what else was loose in the car, fallen onto the roof with it: a cassette out of the tape deck, the ashtray's coins, a pen
	if (AStaticMeshActor* Cs = Prop(TEXT("Wake_Cassette"), Flat(FVector(30.f, 30.f, Zf) + WUp * 0.6f, 115.f)))
	{
		WakeTint(Cs, 0, FLinearColor(0.025f, 0.025f, 0.03f), 0.f, 0.28f);
		WakeTint(Cs, 1, FLinearColor(0.62f, 0.58f, 0.48f), 0.f, 0.8f);
		WakeTint(Cs, 2, FLinearColor(0.008f, 0.008f, 0.01f), 0.f, 0.12f);
	}
	for (const FVector& C : {FVector(38.f, 40.f, Zf), FVector(-4.f, 54.f, Zf), FVector(34.f, 62.f, Zf), FVector(2.f, 66.f, Zf)})
	{
		if (AStaticMeshActor* Co = Prop(TEXT("Wake_Coin"), FTransform(FRotationMatrix::MakeFromX(WUp).ToQuat(), C)))
		{
			WakeTint(Co, 0, FLinearColor(0.72f, 0.6f, 0.42f), 1.f, 0.38f);
		}
	}
	if (AStaticMeshActor* Pn = Prop(TEXT("Wake_Pen"), Flat(FVector(30.f, 14.f, Zf) + WUp * 0.45f, 32.f)))
	{
		WakeTint(Pn, 0, FLinearColor(0.02f, 0.02f, 0.024f), 0.f, 0.35f);
		WakeTint(Pn, 1, FLinearColor(0.75f, 0.75f, 0.76f), 1.f, 0.2f);
	}
	// the letter that lay on the passenger seat has fallen with everything else onto the lining
	if (Letter)
	{
		const FTransform Lf = Flat(FVector(12.f, 86.f, Zf) + WUp * 0.06f, 70.f);
		Letter->SetActorRelativeTransform(FTransform(Lf.GetRotation(), Lf.GetLocation(), FVector(0.279f, 0.216f, 1.f)));
	}
	// the flashlight on its side among them, its head toward the driver; the head (wider) on the lining, the barrel just off it
	{
		FVector X = FVector(0.95f, 0.3f, 0.f);   // (lying across the view on a diagonal, as the remote in the owner's footage)
		{
			float Yaw = 0.f;                       // (checking: -wakeflashyaw=degrees turns how it lies; the grab adapts)
			FParse::Value(FCommandLine::Get(), TEXT("-wakeflashyaw="), Yaw);
			X = FQuat(FVector(0.f, 0.f, 1.f), FMath::DegreesToRadians(Yaw)).RotateVector(X);
		}
		X = (X - WUp * FVector::DotProduct(X, WUp)).GetSafeNormal();
		X = (X + WUp * 0.039f).GetSafeNormal();
		FlashRest = FTransform(FRotationMatrix::MakeFromXZ(X, WUp).ToQuat(), FVector(8.f, 42.f, Zf) + WUp * 1.985f);   // (clear of the rear-view mirror, which hangs ~10 cm off the lining)
		Flashlight = Prop(TEXT("Wake_Flashlight"), FlashRest);
		WakeTint(Flashlight, 0, FLinearColor(0.012f, 0.012f, 0.014f), 1.f, 0.32f);
		WakeTint(Flashlight, 1, FLinearColor(0.86f, 0.86f, 0.88f), 1.f, 0.06f);
		WakeTint(Flashlight, 2, FLinearColor(0.92f, 0.88f, 0.75f), 0.f, 0.2f);
		WakeTint(Flashlight, 3, FLinearColor(0.018f, 0.018f, 0.018f), 0.f, 0.7f);
		if (Flashlight)
		{
			// its beam (an old incandescent bulb in a chrome reflector: a warm hot spot, a wide dim spill), off for now
			FlashBeam = NewObject<USpotLightComponent>(Flashlight, TEXT("Beam"));
			FlashBeam->SetupAttachment(Flashlight->GetRootComponent());
			FlashBeam->SetRelativeLocation(FVector(24.8f, 0.f, 0.f));
			FlashBeam->SetIntensityUnits(ELightUnits::Candelas);
			FlashBeam->SetIntensity(0.f);
			FlashBeam->SetInnerConeAngle(11.f);
			FlashBeam->SetOuterConeAngle(30.f);
			FlashBeam->SetAttenuationRadius(4500.f);
			FlashBeam->SetUseTemperature(true);
			FlashBeam->SetTemperature(2850.f);
			FlashBeam->SetSourceRadius(1.2f);
			FlashBeam->SetCastShadows(true);
			FlashBeam->SetVolumetricScatteringIntensity(2.5f);
			FlashBeam->RegisterComponent();
			FlashSpill = NewObject<UPointLightComponent>(Flashlight, TEXT("Spill"));
			FlashSpill->SetupAttachment(Flashlight->GetRootComponent());
			FlashSpill->SetRelativeLocation(FVector(26.5f, 0.f, 0.f));
			FlashSpill->SetIntensityUnits(ELightUnits::Candelas);
			FlashSpill->SetIntensity(0.f);
			FlashSpill->SetAttenuationRadius(35.f);
			FlashSpill->SetUseTemperature(true);
			FlashSpill->SetTemperature(2850.f);
			FlashSpill->SetCastShadows(false);
			FlashSpill->RegisterComponent();
		}
	}
	// the side windows' tempered glass, as it lies in photos of wrecked interiors: thousands of crumbs, 5-9 mm, slightly
	// irregular, glassy (dark, faintly green, glinting where light catches them), piled thick along the doors and under the
	// windshield's top edge, thinly strewn between
	{
		UMaterialInterface* Part = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Car/Keys/M_KeyPart.M_KeyPart"));
		FActorSpawnParameters P;
		P.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
		AActor* G = GetWorld()->SpawnActor<AActor>(AActor::StaticClass(), CT, P);
		USceneComponent* Root = NewObject<USceneComponent>(G, TEXT("Root"));
		G->SetRootComponent(Root);
		Root->RegisterComponent();
		Root->SetWorldTransform(CT);
		G->AttachToActor(Car, FAttachmentTransformRules::KeepWorldTransform);
		UMaterialInstanceDynamic* Gm = Part ? UMaterialInstanceDynamic::Create(Part, G) : nullptr;
		if (Gm)
		{
			Gm->SetVectorParameterValue(TEXT("Color"), FLinearColor(0.05f, 0.068f, 0.062f));
			Gm->SetScalarParameterValue(TEXT("Metallic"), 0.f);
			Gm->SetScalarParameterValue(TEXT("Roughness"), 0.035f);
		}
		TArray<UInstancedStaticMeshComponent*> Isms;
		for (int32 k = 0; k < 4; ++k)
		{
			UStaticMesh* SM = LoadObject<UStaticMesh>(nullptr, *FString::Printf(TEXT("/Game/HollowAcre/Wake/Wake_Pebble%d.Wake_Pebble%d"), k, k));
			if (!SM)
			{
				continue;
			}
			UInstancedStaticMeshComponent* Ism = NewObject<UInstancedStaticMeshComponent>(G);
			Ism->SetupAttachment(Root);
			Ism->SetStaticMesh(SM);
			Ism->SetMobility(EComponentMobility::Movable);
			Ism->SetCollisionEnabled(ECollisionEnabled::NoCollision);
			Ism->SetCastShadow(false);
			if (GranuleMaterial && k < 2)
			{
				Ism->SetMaterial(0, GranuleMaterial);      // (half as the crash's tempered glass: pale green, glinting; half dark
			}                                              // green and glossy, as crumbs lying in shadow look)
			else if (Gm)
			{
				Ism->SetMaterial(0, Gm);
			}
			Ism->RegisterComponent();
			Isms.Add(Ism);
		}
		FRandomStream R(9311);
		int32 n = 0;
		auto Lay = [&](const FVector& At, float S)
		{
			if (Isms.Num() == 0)
			{
				return;
			}
			// (none where a hand or the flashlight will lie on the lining: they'd show through the skin)
			for (const FVector2D& Clear : {FVector2D(16.f, 20.f), FVector2D(-6.f, 28.f), FVector2D(-12.f, 26.f), FVector2D(15.f, 52.f), FVector2D(2.f, 39.f), FVector2D(22.f, 62.f), FVector2D(26.f, -20.f)})
			{
				if (FVector2D::Distance(FVector2D(At.X, At.Y), Clear) < 9.f)
				{
					return;
				}
			}
			const FQuat Q = FQuat(WUp, R.FRandRange(0.f, 2.f * PI)) * FRotationMatrix::MakeFromXZ(FVector(1.f, 0.f, 0.f) - WUp * WUp.X, WUp).ToQuat() *
				FQuat(FVector(1.f, 0.f, 0.f), R.FRandRange(-0.3f, 0.3f));
			Isms[R.RandRange(0, Isms.Num() - 1)]->AddInstance(FTransform(Q, At + WUp * (S * 0.33f), FVector(S)));
			++n;
		};
		for (int32 i = 0; i < 2600; ++i)
		{
			const float u = R.FRand();
			const float S = FMath::Lerp(0.38f, 1.15f, FMath::Pow(R.FRand(), 1.6f));   // (mostly small, a few big)
			const float Off = FMath::Pow(R.FRand(), 2.2f);            // (a pile thins out from the door)
			if (u < 0.42f)
			{
				Lay(FVector(R.FRandRange(-48.f, 46.f), -34.f + Off * 34.f, 135.6f), S);                    // the driver's door
			}
			else if (u < 0.66f)
			{
				Lay(FVector(R.FRandRange(-100.f, 46.f), 108.f - Off * 34.f, 135.6f), S);                   // the passenger's
			}
			else if (u < 0.76f)
			{
				Lay(FVector(41.f - Off * 18.f, R.FRandRange(-30.f, 104.f), 135.6f), S);                   // under the windshield's head
			}
			else if (u < 0.86f)
			{
				Lay(FVector(R.FRandRange(-100.f, -50.f), R.FRandRange(-34.f, 108.f), 135.6f), S);         // the rear doors'
			}
			else if (u < 0.92f)
			{
				Lay(FVector(R.FRandRange(-60.f, 40.f), R.FRandRange(-30.f, 104.f), 135.6f), S);           // strewn
			}
		}
		// the crumbs the fall kicks up (drawn while they fly)
		CrumbIsm = NewObject<UInstancedStaticMeshComponent>(G);
		CrumbIsm->SetupAttachment(Root);
		CrumbIsm->SetStaticMesh(LoadObject<UStaticMesh>(nullptr, TEXT("/Game/HollowAcre/Wake/Wake_Pebble1.Wake_Pebble1")));
		CrumbIsm->SetMobility(EComponentMobility::Movable);
		CrumbIsm->SetCollisionEnabled(ECollisionEnabled::NoCollision);
		CrumbIsm->SetCastShadow(false);
		if (Gm)
		{
			CrumbIsm->SetMaterial(0, Gm);
		}
		CrumbIsm->RegisterComponent();
		WakeProps.Add(G);
		UE_LOG(LogTemp, Display, TEXT("EndingDirector: wake: %d crumbs of glass on the lining"), n);
	}
	// the seatbelt: its webbing in lengths along the body
	if (UStaticMesh* Strap = LoadObject<UStaticMesh>(nullptr, TEXT("/Game/HollowAcre/Wake/Wake_Strap.Wake_Strap")))
	{
		UMaterialInterface* Part = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Car/Keys/M_KeyPart.M_KeyPart"));
		UMaterialInstanceDynamic* Wm = Part ? UMaterialInstanceDynamic::Create(Part, this) : nullptr;
		if (Wm)
		{
			Wm->SetVectorParameterValue(TEXT("Color"), FLinearColor(0.03f, 0.031f, 0.034f));      // (grey-black nylon webbing)
			Wm->SetScalarParameterValue(TEXT("Metallic"), 0.f);
			Wm->SetScalarParameterValue(TEXT("Roughness"), 0.62f);
		}
		for (int32 i = 0; i < 44; ++i)
		{
			UStaticMeshComponent* C = NewObject<UStaticMeshComponent>(Car);
			C->SetupAttachment(Car->GetRootComponent());
			C->SetStaticMesh(Strap);
			C->SetMobility(EComponentMobility::Movable);
			C->SetCollisionEnabled(ECollisionEnabled::NoCollision);
			if (Wm)
			{
				C->SetMaterial(0, Wm);
			}
			C->RegisterComponent();
			BeltStraps.Add(C);
		}
	}
	// the snow that will slide off the car's underside (now its top) past the rear window on the passenger's side
	SnowSlab = Prop(TEXT("Wake_SnowSlab"), FTransform(FVector(18.f, 126.f, 8.f)));
	SnowLump = Prop(TEXT("Wake_SnowLump"), FTransform(FVector(30.f, 124.f, 6.f)));
	for (AStaticMeshActor* S : {SnowSlab.Get(), SnowLump.Get()})
	{
		if (S)
		{
			S->SetActorHiddenInGame(true);
		}
	}
	BuckleActor = Prop(TEXT("Wake_Buckle"), FTransform::Identity);
	WakeTint(BuckleActor, 0, FLinearColor(0.02f, 0.02f, 0.022f), 0.f, 0.45f);
	WakeTint(BuckleActor, 1, FLinearColor(0.005f, 0.005f, 0.005f), 0.f, 0.8f);
	WakeTint(BuckleActor, 2, FLinearColor(0.75f, 0.035f, 0.02f), 0.f, 0.3f);      // (the red release button, glossy, catching the moon)
	if (BuckleActor)
	{
		const TArray<FName> Names = BuckleActor->GetStaticMeshComponent()->GetMaterialSlotNames();
		FString L;
		for (const FName& Nm : Names)
		{
			L += Nm.ToString() + TEXT(" ");
		}
		UE_LOG(LogTemp, Display, TEXT("EndingDirector: wake: the buckle's slots: %s"), *L);
	}
	if (Flashlight)
	{
		FString L;
		for (const FName& Nm : Flashlight->GetStaticMeshComponent()->GetMaterialSlotNames())
		{
			L += Nm.ToString() + TEXT(" ");
		}
		UE_LOG(LogTemp, Display, TEXT("EndingDirector: wake: the flashlight's slots: %s"), *L);
	}
	LatchActor = Prop(TEXT("Wake_Latch"), FTransform::Identity);
	WakeTint(LatchActor, 0, FLinearColor(0.62f, 0.62f, 0.64f), 1.f, 0.25f);
	WakeTint(LatchActor, 1, FLinearColor(0.02f, 0.02f, 0.022f), 0.f, 0.45f);
	// the night's own light in through the gone windows and the cracked windshield: the snow outside lit by the moon, a
	// faint cold glow across the lining (no shadows of its own; the spill by the windshield a little brighter)
	for (const FVector4& L : {FVector4(-10.f, 40.f, 100.f, 0.22f), FVector4(46.f, 56.f, 118.f, 0.1f)})
	{
		UPointLightComponent* Moon = NewObject<UPointLightComponent>(Car, NAME_None);
		Moon->SetupAttachment(Car->GetRootComponent());
		Moon->SetRelativeLocation(FVector(L.X, L.Y, L.Z));
		Moon->SetIntensityUnits(ELightUnits::Candelas);
		Moon->SetIntensity(L.W);
		Moon->SetAttenuationRadius(L.W > 0.15f ? 320.f : 90.f);
		Moon->SetUseTemperature(true);
		Moon->SetTemperature(8000.f);
		Moon->SetCastShadows(false);
		Moon->SetSourceRadius(40.f);
		Moon->SetSpecularScale(0.f);           // (the rear-view mirror shone a flat white in their highlight)
		Moon->RegisterComponent();
	}
	{
		// (the snow outside bright under the moon: its light in through the windshield, soft, onto the driver's lap and chest)
		UPointLightComponent* Bounce = NewObject<UPointLightComponent>(Car, TEXT("WakeSnowBounce"));
		Bounce->SetupAttachment(Car->GetRootComponent());
		Bounce->SetRelativeLocation(FVector(62.f, 8.f, 96.f));
		Bounce->SetIntensityUnits(ELightUnits::Candelas);
		Bounce->SetIntensity(0.35f);
		Bounce->SetAttenuationRadius(160.f);
		Bounce->SetUseTemperature(true);
		Bounce->SetTemperature(7800.f);
		Bounce->SetSourceRadius(25.f);
		Bounce->SetSpecularScale(0.2f);
		Bounce->SetCastShadows(false);
		Bounce->RegisterComponent();
		if (FParse::Param(FCommandLine::Get(), TEXT("wakework")))
		{
			// (checking only: a bright work light in the cabin to see the body and the belt)
			UPointLightComponent* Work = NewObject<UPointLightComponent>(Car, TEXT("WakeWorkLight"));
			Work->SetupAttachment(Car->GetRootComponent());
			Work->SetRelativeLocation(FVector(40.f, 30.f, 70.f));
			Work->SetIntensityUnits(ELightUnits::Candelas);
			Work->SetIntensity(25.f);
			Work->SetAttenuationRadius(400.f);
			Work->SetCastShadows(false);
			Work->RegisterComponent();
		}
	}
	{
		// (from outside and high on the driver's side, through the gone window, across the lining: the window frame's
		// shadow on it, the crumbs glinting in it, the braced hand lit cold)
		MoonShaft = NewObject<USpotLightComponent>(Car, TEXT("WakeMoonShaft"));
		MoonShaft->SetupAttachment(Car->GetRootComponent());
		const FVector From(-20.f, -170.f, 30.f), To(18.f, 10.f, 135.6f);
		MoonShaft->SetRelativeLocationAndRotation(From, (To - From).Rotation());
		MoonShaft->SetIntensityUnits(ELightUnits::Candelas);
		MoonShaft->SetIntensity(2.2f);
		MoonShaft->SetInnerConeAngle(14.f);
		MoonShaft->SetOuterConeAngle(26.f);
		MoonShaft->SetAttenuationRadius(700.f);
		MoonShaft->SetUseTemperature(true);
		MoonShaft->SetTemperature(7600.f);
		MoonShaft->SetSourceRadius(1.f);
		MoonShaft->SetCastShadows(true);
		MoonShaft->SetVolumetricScatteringIntensity(1.5f);
		MoonShaft->RegisterComponent();
		// (and a softer slab through the passenger's front window onto the driver's lap: the buckle, the hand on it, the
		// thighs, so the struggle with the belt is seen, cold, against the dark seats)
		USpotLightComponent* LapMoon = NewObject<USpotLightComponent>(Car, TEXT("WakeLapMoon"));
		LapMoon->SetupAttachment(Car->GetRootComponent());
		const FVector LFrom(30.f, 150.f, 125.f), LTo(14.f, 22.f, 64.f);
		LapMoon->SetRelativeLocationAndRotation(LFrom, (LTo - LFrom).Rotation());
		LapMoon->SetIntensityUnits(ELightUnits::Candelas);
		LapMoon->SetIntensity(1.6f);
		LapMoon->SetInnerConeAngle(6.f);
		LapMoon->SetOuterConeAngle(16.f);
		LapMoon->SetAttenuationRadius(400.f);
		LapMoon->SetUseTemperature(true);
		LapMoon->SetTemperature(7600.f);
		LapMoon->SetSourceRadius(2.f);
		LapMoon->SetCastShadows(true);
		LapMoon->SetSpecularScale(0.6f);
		LapMoon->SetVolumetricScatteringIntensity(0.f);
		LapMoon->RegisterComponent();
	}
	// the breath: soft puffs (Scripts/make_breath.py), lit only by what light there is; a pool of small spheres, each with
	// its own fade
	UStaticMesh* Sphere = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Sphere.Sphere"));
	UMaterialInterface* BreathMat = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Materials/M_Breath.M_Breath"));
	for (int32 i = 0; Sphere && BreathMat && i < 28; ++i)
	{
		UStaticMeshComponent* C = NewObject<UStaticMeshComponent>(this);
		C->SetStaticMesh(Sphere);
		C->SetMobility(EComponentMobility::Movable);
		C->SetCollisionEnabled(ECollisionEnabled::NoCollision);
		C->SetCastShadow(false);
		C->RegisterComponent();
		C->SetAbsolute(true, true, true);
		UMaterialInstanceDynamic* D = UMaterialInstanceDynamic::Create(BreathMat, C);
		D->SetScalarParameterValue(TEXT("Fade"), 0.f);
		C->SetMaterial(0, D);
		C->SetVisibility(false);
		BreathPool.Add(C);
		BreathMID.Add(D);
	}
	UE_LOG(LogTemp, Display, TEXT("EndingDirector: wake: %d puffs of breath ready (%s)"), BreathPool.Num(), BreathMat ? *BreathMat->GetName() : TEXT("no material"));
	UE_LOG(LogTemp, Display, TEXT("EndingDirector: wake: dressed (flashlight %s, %d props)"), Flashlight ? TEXT("in the spill") : TEXT("missing"), WakeProps.Num());
}

void AEndingDirector::WakeBreath(float w, float RealDt, const FTransform& EyeW)
{
	static const bool bNoBreath = FParse::Param(FCommandLine::Get(), TEXT("wakenobreath"));    // (checking: without it)
	if (BreathPool.Num() == 0 || bNoBreath)
	{
		return;
	}
	// out through the mouth every few seconds: calm, then quick after the scare, laboured crawling out
	const float Period = w < 15.6f ? 3.6f : w < 19.f ? 1.9f : w < 27.f ? 2.4f : 3.0f;
	if (w >= NextPuff)
	{
		NextPuff = w + Period * FMath::FRandRange(0.9f, 1.1f);
		const FVector Mouth = EyeW.TransformPosition(FVector(13.f, 0.f, -9.f));     // (out of the mouth, in front of the eyes, never round them)
		const FVector Out = EyeW.GetRotation().RotateVector(FVector(1.f, 0.f, -0.25f)).GetSafeNormal();
		for (int32 k = 0; k < 7; ++k)
		{
			FPuff P;
			P.P = Mouth + FMath::VRand() * 0.8f;
			P.V = (Out * FMath::FRandRange(28.f, 45.f) + FMath::VRand() * 6.f);
			P.Age = -k * 0.06f;                                // (one breath out over about 0.4 s)
			P.Life = FMath::FRandRange(1.5f, 2.2f);
			P.Size = FMath::FRandRange(0.8f, 1.2f);
			Puffs.Add(P);
		}
	}
	int32 Used = 0;
	for (int32 i = Puffs.Num() - 1; i >= 0; --i)
	{
		FPuff& P = Puffs[i];
		P.Age += RealDt;
		if (P.Age > P.Life)
		{
			Puffs.RemoveAtSwap(i);
			continue;
		}
		if (P.Age < 0.f)
		{
			continue;
		}
		P.V *= FMath::Exp(-2.4f * RealDt);                     // (slowing in the still air)
		P.P += (P.V + FVector(0.f, 0.f, 4.f)) * RealDt;          // (warm: rising a little)
		const float a = P.Age / P.Life;
		const float R = (1.5f + 6.f * FMath::Sqrt(a)) * P.Size;
		if (Used < BreathPool.Num())
		{
			BreathPool[Used]->SetWorldLocationAndRotation(P.P, FQuat::Identity);
			BreathPool[Used]->SetWorldScale3D(FVector(R / 50.f));
			BreathPool[Used]->SetVisibility(true);
			BreathMID[Used]->SetScalarParameterValue(TEXT("Fade"), WSmooth(P.Age / 0.15f) * (1.f - WSmooth((a - 0.35f) / 0.65f)));
			++Used;
		}
	}
	for (int32 i = Used; i < BreathPool.Num(); ++i)
	{
		BreathPool[i]->SetVisibility(false);
	}
}

void AEndingDirector::WakeBeats(float RealDt)
{
	APlayerCameraManager* Cam = UGameplayStatics::GetPlayerCameraManager(this, 0);
	if (!Car || !Camera)
	{
		return;
	}
	if (WakeT0 < 0.f)
	{
		if (RealTime < RestReal + 1.4f)
		{
			return;
		}
		WakeT0 = RealTime;
		Event(TEXT("wakeup"));
	}
	const float w = RealTime - WakeT0;
	// the end of it: play, with no cut. The player's own body takes over where the eyes are, with the arms and the
	// flashlight in hand (Part2Character); from then on only the breath is left to this
	static const bool bNoPlay = FParse::Param(FCommandLine::Get(), TEXT("wakenoplay"));
	if (!bWakeHandedOver && !bNoPlay && w >= 33.0f && CamComp)
	{
		bWakeHandedOver = true;
		const FTransform EyeW = CamComp->GetComponentTransform();
		APlayerController* PC = GetWorld()->GetFirstPlayerController();
		FActorSpawnParameters P;
		P.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AdjustIfPossibleButAlwaysSpawn;
		APart2Character* Me = GetWorld()->SpawnActor<APart2Character>(APart2Character::StaticClass(), EyeW.GetLocation() - FVector(0.f, 0.f, 70.f),
			FRotator(0.f, EyeW.Rotator().Yaw, 0.f), P);
		if (Me && PC)
		{
			PC->Possess(Me);
			if (Arms)
			{
				Arms->LeaveKeysOn(Car);
			}
			Me->TakeOverFrom(EyeW, Arms, Flashlight, FlashBeam, CamComp->PostProcessSettings);
			Event(TEXT("play"));
		}
		else
		{
			UE_LOG(LogTemp, Warning, TEXT("EndingDirector: wake: could not hand over to play (%s, %s)"), Me ? TEXT("body") : TEXT("no body"), PC ? TEXT("player") : TEXT("no player"));
		}
	}
	if (bWakeHandedOver)
	{
		if (APlayerCameraManager* Pcm = UGameplayStatics::GetPlayerCameraManager(this, 0))
		{
			WakeBreath(w, RealDt, FTransform(Pcm->GetCameraRotation(), Pcm->GetCameraLocation()));
		}
		return;
	}
	const FTransform CT = Car->GetActorTransform();
	const FVector WUp = CT.InverseTransformVectorNoScale(FVector::UpVector).GetSafeNormal();
	const FVector Down = -WUp;
	const float Zf = 135.6f;
	const float Zg = WakeGroundZ;
	auto Lv = [&](float X, float Y, float H) { return FVector(X, Y, Zg) + WUp * H; };   // H above the snow outside
	const FVector Hang = CamRest + FVector(0.f, 0.f, 7.f);
	const FVector Ceil(0.f, 0.f, 1.f);                    // (hanging: the top of the head toward the roof, the world's down)
	// up the chute it fell down: the last look
	const FVector Stand = Lv(-6.f, -122.f, 163.f);
	const FVector ChuteDir = CT.InverseTransformVectorNoScale((WakeChuteAt - CT.GetLocation()).GetSafeNormal());
	const FVector ChuteLook = Stand + ChuteDir * 2500.f;

	// the buckle (by the right hip, its stalk up out of the gap between the cushion and the tunnel, leaning in toward the lap;
	// its red button toward the eyes)
	FVector BucklePt(-8.f, 21.f, 57.f);
	if (Arms && Arms->IsReady())
	{
		const FVector Pv = Arms->BoneCar(TEXT("pelvis"));
		// (car_exterior.py's driver's seat: the inboard bolster runs to y 26, up to z 54.5; the console starts at x 18. Hanging,
		// the body's weight pulls the lap belt tight toward the roof and drags the buckle on its stalk up against the side of
		// the waist, above the bolster: where the eyes can see it past the belly)
		BucklePt = FVector(Pv.X + 18.f, 24.f, Pv.Z + 10.f);
	}
	const FVector BuckleLook = BucklePt + FVector(1.f, 0.f, 2.5f);   // (the buckle itself in the middle of the frame)
	if (Arms && Arms->IsReady() && WakeOnce(TEXT("bodycheck"), 4.0f, w))
	{
		Arms->DumpBadBones(TEXT("at 4.0"));
		for (const TCHAR* B : {TEXT("pelvis"), TEXT("spine_03"), TEXT("spine_05"), TEXT("clavicle_l"), TEXT("upperarm_l"), TEXT("thigh_l"), TEXT("calf_l"),
			TEXT("foot_l"), TEXT("hand_r")})
		{
			UE_LOG(LogTemp, Display, TEXT("WakeBody %s at %s (car frame)"), B, *Arms->BoneCar(B).ToString());
		}
		UE_LOG(LogTemp, Display, TEXT("WakeBody the buckle at %s, the eye at %s"), *BucklePt.ToString(), *Hang.ToString());
	}
	if (Arms && Arms->IsReady() && WakeOnce(TEXT("cabincheck"), 6.0f, w))
	{
		// how far the buckle, the right hand and forearm are from the cabin's surfaces (negative: inside the seat)
		for (const TCHAR* B : {TEXT("hand_r"), TEXT("lowerarm_r"), TEXT("middle_01_r"), TEXT("thumb_02_r"), TEXT("index_03_r")})
		{
			UE_LOG(LogTemp, Display, TEXT("WakeCabin %s %.1f cm"), B, Arms->CabinDistCar(Arms->BoneCar(B)));
		}
		const FVector Mid = (Arms->BoneCar(TEXT("hand_r")) + Arms->BoneCar(TEXT("lowerarm_r"))) * 0.5f;
		UE_LOG(LogTemp, Display, TEXT("WakeCabin forearm middle %.1f cm, the buckle %.1f cm"), Arms->CabinDistCar(Mid), Arms->CabinDistCar(BucklePt));
		{
			// the gap between the seat and the console, traced: from the hip outward (+Y), at heights about the hip
			const FVector Pv = Arms->BoneCar(TEXT("pelvis"));
			// (against the car's own visible meshes, their triangles: its collision is one box round it all)
			TArray<UStaticMeshComponent*> Parts;
			Car->GetComponents<UStaticMeshComponent>(Parts);
			auto CarTrace = [&Parts](const FVector& A, const FVector& B, FHitResult& Best) -> bool
			{
				bool bAny = false;
				FCollisionQueryParams Cq(TEXT("WakeBuckleProbe"), true);
				for (UStaticMeshComponent* Pc : Parts)
				{
					FHitResult Hp;
					if (Pc && Pc->IsVisible() && Pc->LineTraceComponent(Hp, A, B, Cq) && (!bAny || Hp.Distance < Best.Distance))
					{
						Best = Hp;
						bAny = true;
					}
				}
				return bAny;
			};
			for (float Dz : {-16.f, -10.f, -4.f, 2.f, 8.f})
			{
				FString Row;
				for (float Dx : {-6.f, 0.f, 6.f, 12.f, 18.f})
				{
					const FVector A = CT.TransformPosition(Pv + FVector(Dx, 0.f, Dz)), B = CT.TransformPosition(Pv + FVector(Dx, 50.f, Dz));
					FHitResult Hh;
					if (CarTrace(A, B, Hh))
					{
						Row += FString::Printf(TEXT(" [x%+.0f y%.1f %s]"), Dx, Hh.Distance, Hh.GetComponent() ? *Hh.GetComponent()->GetName() : TEXT("?"));
					}
					else
					{
						Row += FString::Printf(TEXT(" [x%+.0f none]"), Dx);
					}
				}
				UE_LOG(LogTemp, Display, TEXT("WakeGap z%+.0f:%s"), Dz, *Row);
			}
			// and down from above the hip (toward the seat, the car's -Z) at a few lateral offsets: the cushion's surface
			for (float Dy : {0.f, 10.f, 16.f, 20.f, 24.f, 28.f})
			{
				FString Row;
				for (float Dx : {0.f, 8.f, 14.f})
				{
					const FVector A = CT.TransformPosition(Pv + FVector(Dx, Dy, 25.f)), B = CT.TransformPosition(Pv + FVector(Dx, Dy, -40.f));
					FHitResult Hh;
					if (CarTrace(A, B, Hh))
					{
						Row += FString::Printf(TEXT(" [x%+.0f z%.1f %s]"), Dx, 25.f - Hh.Distance, Hh.GetComponent() ? *Hh.GetComponent()->GetName() : TEXT("?"));
					}
					else
					{
						Row += FString::Printf(TEXT(" [x%+.0f none]"), Dx);
					}
				}
				UE_LOG(LogTemp, Display, TEXT("WakeSeat y%+.0f:%s"), Dy, *Row);
			}
		}
		for (float dz = -12.f; dz <= 24.f; dz += 3.f)
		{
			FString Row;
			for (float dy = -6.f; dy <= 12.f; dy += 3.f)
			{
				Row += FString::Printf(TEXT(" %5.1f"), Arms->CabinDistCar(BucklePt + FVector(0.f, dy, dz)));
			}
			UE_LOG(LogTemp, Display, TEXT("WakeCabin buckle +z %.0f (y -6..12):%s"), dz, *Row);
		}
	}
	// ---- the eyes ------------------------------------------------------------------------------------------------------
	const TArray<FWakeEyeKey> K = {
		// 1. hanging in the belt. The eyes open on the snow through the cracked windshield; a groggy turn to the smashed
		// window beside the head (its frame, the last shards, the moonlit slope outside hanging upside down); down to the lining
		// under the head, the arms hanging limp onto it, blood dripping; the left hand braces flat on it
		{0.0f, Hang, Hang + FVector(100.f, 0.f, 40.f), Ceil},
		{1.0f, Hang + FVector(0.f, 0.f, 0.4f), Hang + FVector(100.f, -8.f, 44.f), Ceil},
		{2.3f, Hang + FVector(0.f, -1.5f, 0.6f), FVector(14.f, -110.f, 120.f), FVector(0.1f, 0.f, 1.f)},
		{2.95f, Hang + FVector(0.f, -1.6f, 0.7f), FVector(16.f, -112.f, 123.f), FVector(0.1f, 0.f, 1.f)},
		{3.6f, Hang + FVector(0.f, -0.6f, 1.f), FVector(28.f, -12.f, Zf), FVector(0.25f, 0.f, 1.f)},
		{4.1f, Hang + FVector(0.f, -0.4f, 1.f), FVector(27.f, -16.f, Zf), FVector(0.22f, 0.f, 1.f)},
		// the chin tucked, the eyes down the body to the buckle by the right hip: the belt pulled tight across the chest and
		// the lap by the body's weight, the gloved thumb on the red button: it won't let go (twice); the braced arm pushes the
		// body up off the belt, and it does
		// (the head forward and over toward the right, so the eyes look down past the side of the chest; the reaching arm's
		// elbow is back out of the way)
		// (a slow heavy turn, about a second: dazed)
		{4.85f, Hang + FVector(1.2f, 3.5f, 0.f), (FVector(27.f, -16.f, Zf) + BuckleLook) * 0.5f, FVector(0.6f, 0.15f, 0.7f)},
		// (a heavy tilt down, a second and a half)
		{5.6f, Hang + FVector(2.5f, 7.f, -1.f), BuckleLook, FVector(1.f, 0.3f, 0.25f)},
		{6.3f, Hang + FVector(2.8f, 7.5f, -1.5f), BuckleLook + FVector(0.f, 1.f, 1.f), FVector(1.f, 0.3f, 0.25f)},
		{6.85f, Hang + FVector(2.8f, 7.5f, -9.f), BuckleLook + FVector(0.f, 1.f, 0.f), FVector(1.f, 0.3f, 0.25f)},
		{7.05f, Hang + FVector(2.8f, 7.5f, -9.f), BuckleLook + FVector(0.f, 1.f, 0.f), FVector(1.f, 0.3f, 0.25f)},
		// 2. the drop: the head and the left shoulder onto the roof, rolled onto the left side; lying there, the lining a few
		// centimetres from the eye, the glass on it, the left hand in front of the face
		{7.2f, Hang + FVector(2.f, 1.f, 3.f), FVector(22.f, 6.f, Zf), FVector(0.4f, -0.7f, 0.5f)},
		// (falling: the lining rushing up at the eyes, a few frames of it, rolling onto the left side as the shoulder hits)
		{7.32f, FMath::Lerp(Hang + FVector(2.f, 1.f, 3.f), FVector(-3.f, 6.f, Zf - 8.5f), 0.62f), FVector(26.f, 22.f, Zf), FVector(-0.5f, -0.5f, 0.3f)},
		{7.42f, FVector(-3.f, 6.f, Zf - 8.5f), FVector(40.f, 58.f, Zf - 2.5f), FVector(-1.f, 0.f, -0.25f)},
		{8.3f, FVector(-3.f, 6.5f, Zf - 8.8f), FVector(42.f, 62.f, Zf - 3.f), FVector(-1.f, 0.08f, -0.2f)},
		{9.0f, FVector(-3.f, 7.f, Zf - 9.5f), FVector(46.f, 70.f, Zf - 4.f), FVector(-1.f, 0.15f, -0.1f)},
		// 3. pushed up on the left elbow, looking across the lining at the spill
		{10.4f, FVector(-2.f, 10.f, Zf - 22.f), FVector(18.f, 50.f, Zf - 1.f), WUp},
		{12.4f, FVector(0.f, 12.f, Zf - 23.f), FVector(17.f, 49.f, Zf - 2.f), WUp},
		{13.4f, FVector(0.f, 11.f, Zf - 24.f), FVector(22.f, 26.f, Zf - 26.f), WUp},   // (on the flashlight in the hand as it clicks on)
		// the beam: over the spill, the dash, the keys hanging in the lock
		{14.4f, FVector(0.f, 11.f, Zf - 24.f), FVector(60.f, 70.f, Zf - 6.f), WUp},
		{15.55f, FVector(0.f, 11.f, Zf - 24.f), FVector(64.f, 22.f, Zf - 50.f), WUp},
		// 4. the thump: the head snaps round to the rear window on the passenger's side
		{15.68f, FVector(0.f, 11.f, Zf - 24.f), FVector(64.f, 22.f, Zf - 50.f), WUp},
		{15.98f, FVector(-2.f, 13.f, Zf - 23.f), FVector(16.f, 118.f, Zf - 26.f), WUp},
		{16.9f, FVector(-2.f, 13.f, Zf - 23.f), FVector(17.f, 122.f, Zf - 14.f), WUp},
		{18.2f, FVector(-2.f, 13.f, Zf - 22.f), FVector(15.f, 124.f, Zf - 8.f), WUp},
		// 5. turned over to the driver's window, on the belly; out through it
		{19.0f, FVector(-4.f, 8.f, Zf - 21.f), FVector(-60.f, 40.f, Zf - 14.f), WUp},
		{20.2f, FVector(-5.f, -10.f, Zf - 19.f), FVector(-2.f, -90.f, Zf - 8.f), WUp},
		{21.4f, FVector(-4.f, -16.f, Zf - 19.f), FVector(0.f, -110.f, Zf - 6.f), WUp},
		{23.0f, FVector(-3.f, -36.f, Zf - 18.f), FVector(2.f, -140.f, Zg - 4.f), WUp},
		{24.6f, FVector(-2.f, -60.f, Zg - 22.f), FVector(4.f, -170.f, Zg - 2.f), WUp},
		{25.8f, Lv(0.f, -84.f, 30.f), Lv(10.f, -190.f, 0.f), WUp},
		// 6. up on the hands and knees, kneeling up, standing; the look back up the chute
		{26.8f, Lv(2.f, -98.f, 72.f), Lv(30.f, -200.f, 0.f), WUp},
		{28.2f, Lv(0.f, -110.f, 112.f), Lv(80.f, -320.f, 40.f), WUp},
		{29.6f, Stand, Stand + FVector(200.f, -260.f, 0.f) + WUp * 30.f, WUp},
		{31.6f, Stand + FVector(-2.f, 1.f, 0.f), ChuteLook, WUp},
		{34.0f, Stand + FVector(-2.f, 1.f, 0.f), ChuteLook + WUp * 60.f, WUp},
	};
	FTransform Eye = WakeEvalEye(w, K);
	if (w < 7.15f)
	{
		// held in the belt the body stays put and the head turns on the neck: a look down carries the eyes forward and down,
		// out over the chest, with the eyes in their sockets taking up to ~35 degrees of it (the body's frame is the car's)
		const FVector EyeOnNeck(9.f, 0.f, 13.f);
		// (what the eyes are on stays on it as the head carries them: the point the gaze meets, re-aimed at after the move)
		const FVector GazeAt = Eye.GetLocation() + Eye.GetRotation().GetAxisX() * FMath::Max(30.f, (float)FVector::Dist(Eye.GetLocation(), BucklePt) * (w > 4.6f ? 1.f : 0.f) + (w > 4.6f ? 0.f : 120.f));
		const FVector GazeUp = Eye.GetRotation().GetAxisZ();
		const float GazeOff = FMath::RadiansToDegrees(Eye.GetRotation().AngularDistance(FQuat::Identity));
		// (the head itself bends at most ~25 degrees here: the belt holds the chest, the chin meets it)
		const float HeadAng = FMath::Min(25.f, GazeOff - FMath::Min(35.f, GazeOff * 0.45f));
		const float HeadPart = GazeOff > 1.f ? FMath::Clamp(HeadAng / GazeOff, 0.f, 1.f) : 1.f;
		const FQuat HeadTurn = FQuat::Slerp(FQuat::Identity, Eye.GetRotation(), HeadPart);
		Eye.AddToTranslation(HeadTurn.RotateVector(EyeOnNeck) - EyeOnNeck);
		// and the eyes stay out over the chest, never in it: at least 17 cm ahead of the upper spine (the breastbone is
		// ~12 cm ahead of it) whenever they're down at the chest's height
		if (Arms && Arms->IsReady())
		{
			const FVector S5 = Arms->BoneCar(TEXT("spine_05"));
			const float AtChest = FMath::Clamp((S5.Z + 30.f - Eye.GetLocation().Z) / 15.f, 0.f, 1.f);
			const float Ahead = Eye.GetLocation().X - S5.X;
			if (Ahead < 19.f)
			{
				Eye.AddToTranslation(FVector((19.f - Ahead) * AtChest, 0.f, 0.f));
			}
		}
		Eye.SetRotation(FRotationMatrix::MakeFromXZ(GazeAt - Eye.GetLocation(), GazeUp).ToQuat());
	}
	for (const FVector2D& Kick : {FVector2D(5.77f, 1.3f), FVector2D(6.32f, 1.5f), FVector2D(6.5f, 0.9f), FVector2D(7.0f, 1.2f), FVector2D(7.42f, 3.0f)})
	{
		if (w >= Kick.X && w < Kick.X + RealDt * 1.5f)
		{
			WakeShake = FMath::Max(WakeShake, Kick.Y);
		}
	}
	WakeShake *= FMath::Exp(-RealDt * 7.f);
	if (Flashlight && bFlashHeld && w < 14.2f)
	{
		// (the eyes stay on the flashlight as it comes up into view and clicks on: on its head, where the light will come from)
		const FVector Head = Flashlight->GetRootComponent()->GetRelativeTransform().TransformPosition(FVector(21.f, 0.f, 0.f));
		const float On = WRamp(w, 11.6f, 12.1f) * (1.f - WRamp(w, 13.7f, 14.2f));
		const FQuat Look = FRotationMatrix::MakeFromXZ(Head - Eye.GetLocation(), WUp).ToQuat();
		Eye.SetRotation(FQuat::Slerp(Eye.GetRotation(), Look, On * 0.85f));
	}
	if (w < 7.05f)
	{
		// (hanging: swinging a little in the belt, the head lolling, settling as the hand braces)
		const float Swing = (1.f - 0.6f * WRamp(w, 3.8f, 4.6f));
		// (and breathing hard against the belt, quicker as the struggle goes on)
		const float Breath = FMath::Sin(2.f * PI * w / FMath::Lerp(2.6f, 1.5f, WRamp(w, 4.5f, 6.3f)));
		Eye.AddToTranslation(FVector(0.f, 0.f, -0.6f * Breath));
		Eye.SetRotation(Eye.GetRotation() * FRotator(0.6f * Breath, 0.f, 0.f).Quaternion());
		Eye.AddToTranslation(FVector(0.f, 0.9f * Swing * FMath::Sin(2.f * PI * w / 2.7f), 0.f));
		Eye.SetRotation(Eye.GetRotation() * FRotator(0.8f * Swing * FMath::Sin(2.f * PI * w / 3.4f + 1.f), 0.f, 1.4f * Swing * FMath::Sin(2.f * PI * w / 2.7f)).Quaternion());
	}
	if (w >= 9.3f && w < 15.6f)
	{
		// propped on the elbow, hurting: each breath lifts and lets down the head a little, a slow unsteady sway
		const float Br = FMath::Sin(2.f * PI * w / 3.1f) * WRamp(w, 9.3f, 9.8f);
		Eye.AddToTranslation(WUp * 0.7f * Br + FVector(0.f, 0.5f * FMath::PerlinNoise1D(w * 0.7f + 3.f), 0.f));
		Eye.SetRotation(Eye.GetRotation() * FRotator(0.8f * Br, 0.6f * FMath::PerlinNoise1D(w * 0.6f), 0.5f * FMath::PerlinNoise1D(w * 0.5f + 5.f)).Quaternion());
	}
	if (WakeShake > 0.01f)
	{
		Eye.SetRotation(Eye.GetRotation() * FRotator(WakeShake * 1.6f * FMath::PerlinNoise1D(w * 17.f), WakeShake * 1.1f * FMath::PerlinNoise1D(w * 15.f + 4.f),
			WakeShake * 2.f * FMath::PerlinNoise1D(w * 13.f + 9.f)).Quaternion());
		Eye.AddToTranslation(Eye.GetRotation().GetAxisZ() * WakeShake * 0.5f * FMath::PerlinNoise1D(w * 16.f + 2.f));
	}
	// alive: breathing, a little unsteady; the drop's jolt; the thump's start
	{
		const float Shock = 0.6f * FMath::Exp(-FMath::Max(0.f, w - 15.62f) * 6.f) * (w >= 15.62f ? 1.f : 0.f);
		const float Scared = WRamp(w, 15.6f, 15.9f) * (1.f - WRamp(w, 18.f, 20.f)) * 0.6f + 0.25f;
		const FRotator Wob(FMath::PerlinNoise1D(w * 0.55f) * 0.6f * Scared * 2.f + Shock * 2.5f * FMath::Sin(w * 31.f),
			FMath::PerlinNoise1D(w * 0.43f + 7.f) * 0.7f * Scared * 2.f + Shock * 1.5f * FMath::Sin(w * 23.f + 1.f),
			FMath::PerlinNoise1D(w * 0.37f + 3.f) * 0.5f + Shock * 3.f * FMath::Sin(w * 27.f + 2.f));
		Eye.SetRotation(Eye.GetRotation() * Wob.Quaternion());
		const float Breathe = FMath::Sin(2.f * PI * w / (w < 15.6f ? 3.6f : 2.2f));
		Eye.AddToTranslation(Eye.GetRotation().GetAxisZ() * 0.35f * Breathe);
	}
	if (w < 19.f)
	{
		Eye.SetLocation(ClearEye(Eye.GetLocation()));        // (inside; out through the window the frame is passed by the path)
	}
	Camera->GetRootComponent()->SetRelativeLocationAndRotation(Eye.GetLocation(), Eye.GetRotation());
	{
		// (checking, -wakeside=X,Y,Z: the camera that far from the eye (car frame), looking at a point 25 cm below it)
		static FVector SideOff = FVector::ZeroVector;
		static bool bSideRead = false;
		if (!bSideRead)
		{
			bSideRead = true;
			FString V;
			if (FParse::Value(FCommandLine::Get(), TEXT("-wakeside="), V, false))
			{
				TArray<FString> P;
				V.ParseIntoArray(P, TEXT(","));
				if (P.Num() == 3)
				{
					SideOff = FVector(FCString::Atof(*P[0]), FCString::Atof(*P[1]), FCString::Atof(*P[2]));
				}
			}
		}
		static FVector SideAt = FVector(0.f, 0.f, 0.f);
		static bool bSideAt = false;
		if (!bSideAt)
		{
			bSideAt = true;
			FString V;
			if (FParse::Value(FCommandLine::Get(), TEXT("-wakesideat="), V, false))
			{
				TArray<FString> P;
				V.ParseIntoArray(P, TEXT(","));
				if (P.Num() == 3)
				{
					SideAt = FVector(FCString::Atof(*P[0]), FCString::Atof(*P[1]), FCString::Atof(*P[2]));
				}
			}
		}
		if (!SideOff.IsNearlyZero())
		{
			const FVector To = SideAt.IsNearlyZero() ? Eye.GetLocation() - WUp * 25.f : Eye.GetLocation() + SideAt;
			const FVector From = Eye.GetLocation() + SideOff;
			Camera->GetRootComponent()->SetRelativeLocationAndRotation(From, FRotationMatrix::MakeFromXZ((To - From).GetSafeNormal(), WUp).ToQuat());
		}
	}

	// the eyes opening (heavy, twice), the dark blink of the drop
	if (Cam)
	{
		const float Shut = WKeys(w, {FVector2D(0.f, 1.f), FVector2D(0.5f, 0.55f), FVector2D(0.75f, 0.95f), FVector2D(1.4f, 0.35f),
			FVector2D(1.7f, 0.8f), FVector2D(2.8f, 0.f)});
		const float Blink = WKeys(w, {FVector2D(7.43f, 0.f), FVector2D(7.47f, 1.f), FVector2D(7.72f, 1.f), FVector2D(8.0f, 0.15f), FVector2D(8.4f, 0.f),
			FVector2D(8.75f, 0.7f), FVector2D(8.95f, 0.1f), FVector2D(9.2f, 0.f),
			FVector2D(9.3f, 0.f)});
		// (the eyes' own lids for the heavy waking and the slow blink on the look down; the black of the hit is a fade)
		const float SlowBlink = WKeys(w, {FVector2D(4.2f, 0.f), FVector2D(4.38f, 0.8f), FVector2D(4.7f, 0.85f), FVector2D(4.95f, 0.f)});
		WakeLids = w < 7.0f ? FMath::Max(Shut, SlowBlink) : 0.f;
		Cam->SetManualCameraFade(FMath::Max(Shut * 0.4f, Blink), FLinearColor::Black, false);
	}

	// ---- the chest under the eyes: held in the seat by the belt, then free (turning after the head) ---------------------
	if (Arms)
	{
		if (w < 7.15f)
		{
			// (the hips just off the cushion, as far as the roof allows: a tall driver hanging in a compact car has the head
			// almost on the roof, the chin tucked a little; car_exterior.py's seat: cushion top 50.5, the hip joint ~9 above it)
			BodyEye = FTransform(FQuat::Identity, Hang + FVector(-9.f, 0.f, 6.f - 8.f * WRamp(w, 6.5f, 6.9f)));
			bBodyEye = false;
		}
		else
		{
			if (!bBodyEye)
			{
				BodyEye = Eye;
				bBodyEye = true;
			}
			// (lying dazed on its side the body is the head's way; otherwise the chest turns with the head about the world's up
			// and leans only a little with its nods, so the shoulders stay below and behind the eyes)
			FVector Hf = Eye.GetRotation().GetAxisX();
			Hf = (Hf - WUp * FVector::DotProduct(Hf, WUp)).GetSafeNormal();
			if (Hf.IsNearlyZero())
			{
				Hf = BodyEye.GetRotation().GetAxisX();
			}
			// how far the trunk leans forward from upright (degrees): propped on an elbow, prone through the window, on all
			// fours, kneeling up, standing; the chest then lies behind the head (prone) rather than under the eyes, as a body's
			// does, and the shoulders stay out of the way of the eyes
			const float Lean = WKeys(w, {FVector2D(9.6f, 30.f), FVector2D(10.4f, 62.f), FVector2D(18.8f, 62.f), FVector2D(20.2f, 80.f),
				FVector2D(25.8f, 82.f), FVector2D(26.8f, 74.f), FVector2D(28.2f, 28.f), FVector2D(29.6f, 4.f)});
			const FVector Side = FVector::CrossProduct(WUp, Hf).GetSafeNormal();
			const FQuat Tip(Side, FMath::DegreesToRadians(Lean));
			const FQuat Upright = FRotationMatrix::MakeFromXZ(Tip.RotateVector(Hf), Tip.RotateVector(WUp)).ToQuat();
			const float Lying = WRamp(w, 7.3f, 7.5f) * (1.f - WRamp(w, 9.4f, 10.4f));
			const FQuat Want = FQuat::Slerp(FQuat::Slerp(Upright, Eye.GetRotation(), 0.15f), Eye.GetRotation(), Lying);
			const float k = 1.f - FMath::Exp(-RealDt * (w < 7.5f ? 14.f : 3.5f));
			BodyEye.SetRotation(FQuat::Slerp(BodyEye.GetRotation(), Want, k).GetNormalized());
			// the head turns on the neck, not about the eyes: the eyes sit ~9 cm ahead of the neck's base and ~13 cm above it,
			// so a head tipped down to look at the lap carries them forward and down, out over the chest (not into the collar)
			// (the eyes themselves turn in their sockets up to ~35 degrees: the head takes only part of a look down, so the
			// head's frame is part way from the body's to the gaze's)
			const FVector EyeOnNeck(9.f, 0.f, 13.f);
			const float GazeOff = FMath::RadiansToDegrees(BodyEye.GetRotation().AngularDistance(Eye.GetRotation()));
			const float HeadPart = GazeOff > 1.f ? FMath::Clamp((GazeOff - FMath::Min(35.f, GazeOff * 0.45f)) / GazeOff, 0.f, 1.f) : 1.f;
			const FQuat HeadTurn = FQuat::Slerp(BodyEye.GetRotation(), Eye.GetRotation(), HeadPart);
			BodyEye.SetLocation(Eye.GetLocation() - HeadTurn.RotateVector(EyeOnNeck) + BodyEye.GetRotation().RotateVector(EyeOnNeck));
		}
		Arms->FreeChest = Arms->ChestForEye(BodyEye);
		if (WakeOnce(TEXT("lyingview"), 8.5f, w))
		{
			// (which parts of the arms are in front of the eyes while lying: their angle off the gaze and distance)
			const FVector Ep = Eye.GetLocation(), Gz = Eye.GetRotation().GetAxisX();
			for (const TCHAR* B : {TEXT("upperarm_l"), TEXT("lowerarm_l"), TEXT("hand_l"), TEXT("upperarm_r"), TEXT("lowerarm_r"), TEXT("hand_r")})
			{
				const FVector D = Arms->BoneCar(B) - Ep;
				UE_LOG(LogTemp, Display, TEXT("WakeLyingView %s %.0f deg off the gaze, %.0f cm away"), B,
					FMath::RadiansToDegrees(FMath::Acos(FMath::Clamp(FVector::DotProduct(D.GetSafeNormal(), Gz), -1.f, 1.f))), D.Size());
			}
		}
		if (WakeOnce(TEXT("eyechest"), 6.0f, w) || WakeOnce(TEXT("eyechest2"), 5.3f, w))
		{
			// where the eye is from the chest: ahead of the breastbone (the chest's front is ~12 cm ahead of spine_05)
			const FVector Ch = Arms->BoneCar(TEXT("spine_05")), Nk = Arms->BoneCar(TEXT("neck_01"));
			const FVector Fw = BodyEye.GetRotation().GetAxisX(), Up = BodyEye.GetRotation().GetAxisZ();
			UE_LOG(LogTemp, Display, TEXT("WakeEyeChest the eye %.1f cm ahead of spine_05, %.1f above it; %.1f ahead of the neck's base, %.1f above it"),
				FVector::DotProduct(Eye.GetLocation() - Ch, Fw), FVector::DotProduct(Eye.GetLocation() - Ch, Up),
				FVector::DotProduct(Eye.GetLocation() - Nk, Fw), FVector::DotProduct(Eye.GetLocation() - Nk, Up));
		}
	}

	// ---- the flashlight: held in front of the chest, its beam along the eyes, swaying a little behind them -----------------
	// (at the chest, low and to the right, its beam on what the eyes look at a few metres off)
	const FVector HoldAt = Eye.TransformPosition(FVector(30.f, 13.f, -29.f));
	const FVector AimAt = Eye.TransformPosition(FVector(450.f, 0.f, 0.f));
	FTransform HoldWant(FRotationMatrix::MakeFromXZ((AimAt - HoldAt).GetSafeNormal(), Eye.GetRotation().GetAxisZ()).ToQuat(), HoldAt);
	{
		// (just picked up: brought up in front of the eyes, side-on, its head to the left, so the thumb on the switch and the
		// lens are seen and the beam visibly leaves it across the lining; then down to the chest and along the eyes)
		const float Show = WRamp(w, 11.7f, 12.2f) * (1.f - WRamp(w, 13.9f, 14.6f));
		if (Show > 0.f)
		{
			const FVector ShowAt = Eye.TransformPosition(FVector(34.f, 5.f, -8.f));
			const FVector ShowDir = Eye.GetRotation().RotateVector(FVector(0.35f, -0.9f, -0.25f)).GetSafeNormal();
			// (rolled in the hand so the fingers round it face the eyes, the knuckles seen, as in the owner's footage)
			static float ShowRoll = -1000.f;
			if (ShowRoll < -999.f)
			{
				ShowRoll = 90.f;     // (chosen against the owner's footage: the fingers round it toward the eyes)
				FParse::Value(FCommandLine::Get(), TEXT("-wakeshowroll="), ShowRoll);
			}
			const FVector Up0 = Eye.GetRotation().GetAxisZ();
			const FVector ShowZ = FQuat(ShowDir, FMath::DegreesToRadians(ShowRoll)).RotateVector((Up0 - ShowDir * FVector::DotProduct(Up0, ShowDir)).GetSafeNormal());
			const FTransform ShowT(FRotationMatrix::MakeFromXZ(ShowDir, ShowZ).ToQuat(), ShowAt);
			HoldWant.Blend(HoldWant, ShowT, Show);
		}
	}
	if (!bFlashHeld)
	{
		HoldAim = HoldWant;
	}
	else
	{
		const float k = 1.f - FMath::Exp(-RealDt * 8.f);
		HoldAim.SetRotation(FQuat::Slerp(HoldAim.GetRotation(), HoldWant.GetRotation(), k).GetNormalized());
		HoldAim.SetLocation(FMath::Lerp(HoldAim.GetLocation(), HoldWant.GetLocation(), 1.f - FMath::Exp(-RealDt * 11.f)));
	}

	// ---- the hands ------------------------------------------------------------------------------------------------------
	if (Arms && Arms->IsReady())
	{
		ADriverArms::FFreeHand& L = Arms->Free[0];
		ADriverArms::FFreeHand& R = Arms->Free[1];
		L.Pole = R.Pole = FVector::ZeroVector;    // (each beat sets its own elbow way, if it needs one)
		const FVector Fwd(1.f, 0.f, 0.f);
		// the left hand: braced flat on the lining ahead of the head (hanging); then, propped on the elbow, flat beside it
		const FTransform LBrace = Arms->HandAtPalm(0, FVector(26.f, -20.f, Zf), FVector(1.f, 0.1f, 0.f), Ceil);
		// (right way up in the upturned car its +Y is on the body's left: facing the spill (+X, +Y), the left is toward -X, +Y)
		const FTransform LProp = Arms->HandAtPalm(0, FVector(-6.f, 28.f, Zf), FVector(0.6f, 0.8f, 0.f), Down);
		// the flashlight as it lies, and the hand above it (open), then on it (closed)
		const FTransform RGrab = Arms->HandOnHandle(1, FlashRest);
		FTransform RAbove = RGrab;
		RAbove.AddToTranslation(WUp * 3.f);
		// hanging limp: both arms hang down onto the roof, the knuckles resting on it, swinging a little with the body
		const float Sw = FMath::Sin(2.f * PI * w / 2.7f) * 1.5f;
		const FTransform LHang = Arms->HandAtPalm(0, FVector(16.f, -25.f + Sw, Zf - 4.f), FVector(0.25f, -0.1f, 1.f), FVector(-0.9f, 0.3f, -0.3f));
		const FTransform RHang = Arms->HandAtPalm(1, FVector(10.f, 25.f + Sw, Zf - 4.f), FVector(0.25f, 0.1f, 1.f), FVector(-0.9f, -0.3f, -0.3f));
		// lying: the left hand on the lining in front of the face
		const FTransform LLie = Arms->HandAtPalm(0, FVector(16.f, 20.f, Zf), FVector(0.85f, 0.5f, 0.f), Down);
		// lying: the right hand fallen onto the lining in front of the chest, palm down, the fingers toward the spill
		const FTransform RRest = Arms->HandAtPalm(1, FVector(-12.f, 26.f, Zf), FVector(0.55f, 0.83f, 0.f), Down);   // (below the eyes' line)
		// (a reach's speed: slow away, fast in the middle, slowing onto the target: minimum jerk)
		auto MinJerk = [](float t, float a, float b)
		{
			const float u = FMath::Clamp((t - a) / FMath::Max(b - a, 1e-4f), 0.f, 1.f);
			return u * u * u * (10.f + u * (-15.f + 6.f * u));
		};
		const float Settle = 1.f - FMath::Exp(-RealDt * 9.f);
		L.Open = R.Open = 0.f;
		if (w < 7.0f)
		{
			// (hanging limp: the fingers loose and half open, not fists)
			L.Open = 0.45f * (1.f - WRamp(w, 3.55f, 3.9f));
			R.Open = 0.45f * (1.f - WRamp(w, 4.5f, 4.9f));
			// the left hand: from hanging to braced flat on the lining (fingers spread, pressing), the arm straightening as it
			// pushes the body up off the belt
			const float b = WRamp(w, 3.55f, 4.3f);
			L.W = 1.f;
			L.Hand.SetLocation(FMath::Lerp(LHang.GetLocation(), LBrace.GetLocation(), b) + WUp * 5.f * FMath::Sin(PI * b));
			L.Hand.SetRotation(FQuat::Slerp(LHang.GetRotation(), LBrace.GetRotation(), b));
			L.Shape = b < 0.5f ? 1 : 0;
			L.Close = b < 0.5f ? 1.f : WRamp(w, 3.9f, 4.3f);
			// the right hand: up from hanging to the buckle by the hip; the thumb on the button, jabbing (twice, nothing), then
			// pressing as the body comes off the belt: it lets go
			const float r = WRamp(w, 4.5f, 5.35f);
			const FVector BX = BuckleAt.GetRotation().GetAxisX(), BZ = BuckleAt.GetRotation().GetAxisZ();
			// (two hard presses that fail, the hand straining on the second, then the press that holds as the body comes up)
			const float Jab = 1.4f * (WRamp(w, 5.75f, 5.81f) * (1.f - WRamp(w, 5.89f, 6.05f)) + WRamp(w, 6.3f, 6.35f) * (1.f - WRamp(w, 6.45f, 6.6f)) +
				WRamp(w, 6.95f, 7.0f)) + 0.25f * FMath::Sin(w * 47.f) * WRamp(w, 6.25f, 6.35f) * (1.f - WRamp(w, 6.55f, 6.65f));
			// (held like a phone: the palm behind the buckle facing the eyes, the fingers up along it, the thumb round its side
			// onto the button on its face: the buckle, the button and the thumb all seen)
			FTransform RB = Arms->HandAtPalm(1, BuckleAt.GetLocation() - BX * 3.5f - BZ * 2.6f, BX, BZ);
			if (r > 0.6f && R.Shape == 3)
			{
				// the thumb's pad on the red button (Wake_Buckle: the button at 6 of 7.5 along it, on its face), the hand
				// round the stalk below it and to the side, so the buckle, the button and the thumb on it are seen; each press
				// pushes the thumb in (the thumb's tip measured on the hand as it is posed)
				const FVector T3 = Arms->BoneCar(TEXT("thumb_03_r")), T2 = Arms->BoneCar(TEXT("thumb_02_r"));
				const FVector TipLocal = Arms->HandNow(1).InverseTransformPosition(T3 + (T3 - T2) * 0.75f);
				const FVector Button = BuckleAt.GetLocation() - BX * 1.5f + BZ * 1.7f;
				const FVector Want = Button + BZ * (0.9f - 0.6f * Jab);
				RB.SetLocation(RB.GetLocation() + FMath::Lerp(FVector::ZeroVector, Want - RB.TransformPosition(TipLocal), WRamp(r, 0.6f, 1.f)));
			}
			R.W = 1.f;
			R.Hand.SetLocation(FMath::Lerp(RHang.GetLocation(), RB.GetLocation(), r) + FVector(0.f, 0.f, -6.f) * FMath::Sin(PI * r));
			R.Hand.SetRotation(FQuat::Slerp(RHang.GetRotation(), RB.GetRotation(), r));
			R.Shape = r < 0.6f ? 1 : 3;
			R.Close = r < 0.6f ? 1.f : WRamp(w, 4.95f, 5.35f);
			// (reaching down to the hip the elbow goes back and out, beside the body, not across the eyes' line to the buckle)
			R.Pole = r > 0.05f ? FVector(-0.75f, 0.65f, 0.f) : FVector::ZeroVector;
		}
		else if (w < 9.6f)
		{
			// the drop: the left arm gives under the body and the hand slaps down in front of the face; the right flung loose
			L.W = 1.f;
			const float d = WRamp(w, 7.05f, 7.4f);
			L.Hand.SetLocation(FMath::Lerp(LBrace.GetLocation(), LLie.GetLocation(), d) + Down * -6.f * FMath::Sin(PI * d));
			L.Hand.SetRotation(FQuat::Slerp(LBrace.GetRotation(), LLie.GetRotation(), d));
			L.Shape = 0;
			L.Close = 1.f;
			// the right hand flung off the buckle as the body drops, landing on the lining in front of the chest and lying there
			R.W = 1.f;
			R.Hand.SetLocation(FMath::Lerp(R.Hand.GetLocation(), RRest.GetLocation(), Settle));
			R.Hand.SetRotation(FQuat::Slerp(R.Hand.GetRotation(), RRest.GetRotation(), Settle));
			R.Shape = 1;
			R.Close = 1.f;
			R.Pole = WUp + FVector(-0.4f, 0.f, 0.f);      // (lying on the left side: the top arm's elbow up and back over the body)
			if (w >= 9.2f)
			{
				// (on into pushing up onto the elbow)
				const float e = WRamp(w, 9.2f, 9.6f);
				L.Hand.SetLocation(FMath::Lerp(LLie.GetLocation(), LProp.GetLocation(), e));
				L.Hand.SetRotation(FQuat::Slerp(LLie.GetRotation(), LProp.GetRotation(), e));
			}
		}
		else if (w < 19.0f)
		{
			L.W = 1.f;
			L.Hand = LProp;
			L.Shape = 0;
			// the right hand, from the owner's own footage of picking a remote up off the carpet, two ways by how it lies:
			// ALONG the reach (the first clip): it slides in low, palm down, the fingers along it, curls under it as the
			// wrist rolls, and up; ACROSS the reach (the second clip): the arm out over it, the hand down over its top, the
			// fingers wrapping its far side, up, and turned in the hand to stand ready. Either way the hand takes it by
			// whichever end asks the least twist of the forearm, and turns it in the fingers to point it right
			{
				const FVector Ax = FlashRest.GetRotation().GetAxisX();                         // (along it, tail to head)
				const FVector Grip = FlashRest.GetLocation() + Ax * 12.5f;                     // (where the hand closes on it)
				FVector Rd = Grip - RRest.GetLocation();
				Rd = (Rd - WUp * FVector::DotProduct(Rd, WUp)).GetSafeNormal();               // (the reach, along the lining)
				const bool bAcross = FMath::Abs(FVector::DotProduct(Ax, Rd)) < 0.6f;
				const FQuat Natural = Arms->HandAtPalm(1, Grip, Rd, Down).GetRotation();     // (palm down, fingers out along the reach)
				// a grip on it with its top (under the thumb) toward Z, taken by the end that turns the hand least
				auto GripFrom = [&](const FVector& Z, bool& bFlipped)
				{
					const FTransform A(FRotationMatrix::MakeFromXZ(Ax, Z).ToQuat(), FlashRest.GetLocation());
					const FTransform B(FRotationMatrix::MakeFromXZ(-Ax, Z).ToQuat(), FlashRest.GetLocation() + Ax * 25.f);
					const FTransform Ha = Arms->HandOnHandle(1, A), Hb = Arms->HandOnHandle(1, B);
					bFlipped = Hb.GetRotation().AngularDistance(Natural) < Ha.GetRotation().AngularDistance(Natural);
					return bFlipped ? Hb : Ha;
				};
				FVector Side = FVector::CrossProduct(WUp, Ax).GetSafeNormal();                 // (the hand's side of it)
				if (FVector::DotProduct(Side, Eye.GetLocation() - Grip) > 0.f)
				{
					Side = -Side;                                                              // (the far side from the eyes: it stays in view)
				}
				bool bFlip = false;
				FTransform Take, Before;
				if (!bAcross)
				{
					// alongside: palm down beside it, the fingers along it the way the reach goes; then the scoop into a
					// grip whose top is turned to the far side and up, so the fingers come under it from the near side
					const FVector Fd = FVector::DotProduct(Ax, Rd) >= 0.f ? Ax : -Ax;
					Before = Arms->HandAtPalm(1, Grip - Fd * 2.f + Side * 6.5f + WUp * 0.6f, Fd, Down);
					Take = GripFrom((-Side * 0.9f + WUp * 0.45f).GetSafeNormal(), bFlip);
				}
				else
				{
					// over it: the hand above it, then down over its top, the fingers round its far side
					Take = GripFrom((WUp + Rd * 0.25f).GetSafeNormal(), bFlip);
					Before = Take;
					Before.AddToTranslation(WUp * 6.f - Rd * 3.f);
				}
				const float TReach = bAcross ? 11.2f : 11.3f;     // (out to it)
				const float TTake = 11.55f;                       // (the fingers on it; then up)
				if (w < TTake)
				{
					R.W = 1.f;
					R.Shape = 2;
					if (w < 10.6f)
					{
						R.Hand.SetLocation(FMath::Lerp(R.Hand.GetLocation(), RRest.GetLocation(), Settle));
						R.Hand.SetRotation(FQuat::Slerp(R.Hand.GetRotation(), RRest.GetRotation(), Settle));
						R.Close = 0.f;
					}
					else if (w < TReach)
					{
						// out to it (slow away, fast, slowing in): low along the lining, or lifted over it
						const float u = MinJerk(w, 10.6f, TReach);
						R.Hand.SetLocation(FMath::Lerp(RRest.GetLocation(), Before.GetLocation(), u) + WUp * (bAcross ? 5.f : 1.2f) * FMath::Sin(PI * u));
						R.Hand.SetRotation(FQuat::Slerp(RRest.GetRotation(), Before.GetRotation(), u));
						R.Close = 0.f;
						R.Open = (bAcross ? 0.45f : 0.6f) * WRamp(w, 10.65f, TReach - 0.3f);
					}
					else
					{
						// onto it: the scoop as the wrist rolls (along), or down over its top (across); the fingers closing
						const float u = MinJerk(w, TReach, TTake);
						R.Hand.SetLocation(FMath::Lerp(Before.GetLocation(), Take.GetLocation(), u));
						R.Hand.SetRotation(FQuat::Slerp(Before.GetRotation(), Take.GetRotation(), u));
						R.Close = 0.75f * u;
						R.Open = (bAcross ? 0.45f : 0.6f) * (1.f - u);
					}
				}
				else
				{
					if (!bFlashHeld)
					{
						// (it stays exactly where it lay as the fingers take it: held as it is, then turned in the fingers
						// into the ready grip as the hand lifts; taken by its other end, that turn is the whole way round)
						bFlashHeld = true;
						FlashGrabW = w;
						FlashTurnSecs = bFlip ? 0.75f : 0.35f;
						FlashInHandAtGrab = FlashRest * Arms->HandNow(1).Inverse();
						HoldAim = FlashRest;
						Event(TEXT("grab"));
					}
					R.W = 1.f;
					R.Shape = 2;
					R.Close = 0.75f + 0.25f * WRamp(w, TTake, TTake + 0.25f);
					const FTransform Held = Arms->HandOnHandle(1, HoldAim);
					const float up = MinJerk(w, TTake, TTake + 0.8f);
					R.Hand.SetLocation(FMath::Lerp(Take.GetLocation(), Held.GetLocation(), up) + WUp * 3.f * FMath::Sin(PI * up));
					R.Hand.SetRotation(FQuat::Slerp(Take.GetRotation(), Held.GetRotation(), up));
				}
			}
		}
		else if (w < 26.8f)
		{
			// crawling: the left hand reaching ahead and planting flat, the right (with the flashlight) planting its fist,
			// the flashlight along the way ahead on the lining, then the snow
			struct FPlant
			{
				float T;
				FVector At;
			};
			static const TArray<FPlant> LP = {{19.0f, FVector(-6.f, 28.f, 135.6f)}, {19.9f, FVector(12.f, -22.f, 135.6f)},
				{21.9f, FVector(14.f, -44.f, 134.5f)}, {23.6f, FVector(16.f, -74.f, 0.f)}, {25.3f, FVector(16.f, -102.f, 0.f)}};
			static const TArray<FPlant> RP = {{19.0f, FVector(0.f, 0.f, 0.f)}, {20.6f, FVector(-20.f, -10.f, 135.6f)},
				{22.7f, FVector(-20.f, -36.f, 135.6f)}, {24.4f, FVector(-20.f, -64.f, 0.f)}, {26.0f, FVector(-18.f, -94.f, 0.f)}};
			auto PlantAt = [&](const TArray<FPlant>& Ps, float t, float& Lift)
			{
				int32 i = 0;
				while (i + 1 < Ps.Num() && t >= Ps[i + 1].T)
				{
					++i;
				}
				auto Pt = [&](int32 j)
				{
					FVector P = Ps[j].At;
					if (P.Z == 0.f)
					{
						P = FVector(P.X, P.Y, Zg) + WUp * 0.f;          // (out on the snow)
					}
					return P;
				};
				if (i + 1 >= Ps.Num())
				{
					Lift = 0.f;
					return Pt(i);
				}
				const float a = WRamp(t, Ps[i + 1].T - 0.6f, Ps[i + 1].T);
				Lift = FMath::Sin(PI * a) * 7.f;
				return FMath::Lerp(Pt(i), Pt(i + 1), a);
			};
			float LL = 0.f, RL = 0.f;
			const FVector Lp = PlantAt(LP, w, LL);
			L.W = 1.f;
			L.Hand = Arms->HandAtPalm(0, Lp + WUp * LL, FVector(0.25f, -1.f, 0.f), Down);
			L.Shape = 0;
			L.Close = 1.f - 0.6f * FMath::Min(LL / 7.f, 1.f);
			if (w < 20.6f)
			{
				// (the flashlight still held up as the body turns over)
				R.Hand = Arms->HandOnHandle(1, HoldAim);
			}
			else
			{
				const FVector Rp = PlantAt(RP, w, RL);
				FVector X(0.1f, -1.f, 0.f);
				X = (X - WUp * FVector::DotProduct(X, WUp)).GetSafeNormal();
				X = (X + WUp * 0.1f).GetSafeNormal();                  // (its head a little up: the beam out ahead, not at the hands)
				const FTransform OnFloor(FRotationMatrix::MakeFromXZ(X, WUp).ToQuat(), Rp + WUp * (2.9f + RL) - X * 12.5f);
				const float a = WRamp(w, 20.0f, 20.6f);
				const FTransform Hp = Arms->HandOnHandle(1, OnFloor);
				const FTransform Hh = Arms->HandOnHandle(1, HoldAim);
				R.Hand.SetLocation(FMath::Lerp(Hh.GetLocation(), Hp.GetLocation(), a));
				R.Hand.SetRotation(FQuat::Slerp(Hh.GetRotation(), Hp.GetRotation(), a));
			}
			R.W = 1.f;
			R.Shape = 2;
			R.Close = 1.f;
		}
		else
		{
			// getting up: the left hand pushes off the snow and comes away; the flashlight held up again
			L.W = 1.f - WRamp(w, 27.2f, 28.2f);
			L.Hand = Arms->HandAtPalm(0, FVector(16.f, -104.f, Zg), FVector(0.25f, -1.f, 0.f), Down);
			L.Shape = 0;
			R.W = 1.f;
			R.Shape = 2;
			R.Close = 1.f;
			const FTransform Hh = Arms->HandOnHandle(1, HoldAim);
			const FTransform Hp = Arms->HandOnHandle(1, FTransform(FRotationMatrix::MakeFromXZ(FVector(0.1f, -1.f, 0.f), WUp).ToQuat(), Lv(-18.f, -94.f, 2.9f) - FVector(0.1f, -1.f, 0.f) * 12.5f));
			const float a = WRamp(w, 26.8f, 27.6f);
			R.Hand.SetLocation(FMath::Lerp(Hp.GetLocation(), Hh.GetLocation(), a));
			R.Hand.SetRotation(FQuat::Slerp(Hp.GetRotation(), Hh.GetRotation(), a));
		}
		// (checking: how the palms meet what they press on, and the grip)
		static float NextLog = 0.f;
		if (w >= NextLog)
		{
			NextLog = w + 1.f;
			FVector Lf;
			const FVector Lp = Arms->PalmNow(0, &Lf);
			const FVector Hn = Arms->HandNow(1).GetLocation();
			const float BeamOff = FMath::RadiansToDegrees(FMath::Acos(FMath::Clamp(FVector::DotProduct(Arms->HandleInHand(1).GetRotation().GetAxisX(), Eye.GetRotation().GetAxisX()), -1.f, 1.f)));
			UE_LOG(LogTemp, Display, TEXT("WakeLog %.1f eye %s | left palm %s (%.1f cm off the lining, facing %s) w %.2f | right hand %.1f cm off its target, w %.2f shape %d | the light %.0f deg off the eyes' line | through the lining: left %.1f->%.1f (%s), right %.1f->%.1f (%s) cm | right hand at %s, forearm at %s"),
				w, *Eye.GetLocation().ToString(), *Lp.ToString(), Zf - Lp.Z, *Lf.ToString(), L.W, FVector::Dist(Hn, R.Hand.GetLocation()), R.W, (int32)R.Shape, BeamOff,
				Arms->FloorDepthIn[0], Arms->FloorDepthOut[0], *Arms->FloorWorst[0].ToString(), Arms->FloorDepthIn[1], Arms->FloorDepthOut[1], *Arms->FloorWorst[1].ToString(),
				*Arms->BoneCar(TEXT("hand_r")).ToString(), *Arms->BoneCar(TEXT("lowerarm_r")).ToString());
		}
		if (Arms->FloorDepthOut[0] > 0.1f || Arms->FloorDepthOut[1] > 0.1f)
		{
			UE_LOG(LogTemp, Warning, TEXT("WakeClip %.2f a hand still %.1f / %.1f cm through the lining after the guard"), w, Arms->FloorDepthOut[0], Arms->FloorDepthOut[1]);
		}
	}

	// ---- the flashlight itself: lying, then in the hand; its switch, the flicker, the beam ------------------------------
	if (Flashlight)
	{
		FTransform Fl = FlashRest;
		if (bFlashHeld && Arms)
		{
			const FTransform HandIs = Arms->HandNow(1);
			const FTransform Gripped = Arms->HandleInHand(1) * HandIs.Inverse();
			FTransform InHand;
			InHand.Blend(FlashInHandAtGrab, Gripped, WRamp(w, FlashGrabW, FlashGrabW + FlashTurnSecs));
			Fl = InHand * HandIs;
		}
		Flashlight->GetRootComponent()->SetRelativeTransform(Fl);
		if (WakeOnce(TEXT("click"), 13.35f, w))
		{
			FlashOn = 0.f;
		}
		// the old bulb: a stutter as the contact catches (on, off, half, off, on), then steady
		const float On = w < 13.35f ? 0.f : WKeys(w, {FVector2D(13.35f, 0.9f), FVector2D(13.42f, 0.9f), FVector2D(13.44f, 0.f), FVector2D(13.62f, 0.f),
			FVector2D(13.64f, 0.45f), FVector2D(13.72f, 0.4f), FVector2D(13.74f, 0.f), FVector2D(13.95f, 0.f), FVector2D(13.98f, 1.f)});
		FlashOn = On;
		if (FlashBeam)
		{
			FlashBeam->SetIntensity(140.f * On);
		}
		if (FlashSpill)
		{
			FlashSpill->SetIntensity(0.02f * On);
		}
		WakeOnce(TEXT("flicker"), 13.62f, w);
		WakeOnce(TEXT("beam"), 13.98f, w);
	}

	// ---- the belt and its buckle -------------------------------------------------------------------------------------------
	{
		// (the buckle's own frame: X up its stalk to the slot, leaning toward the lap; Z, its button's face, toward the eyes)
		const FVector BX = FVector(0.68f, -0.22f, 0.7f).GetSafeNormal();   // (the stalk leaning forward ~45 degrees, as in a car: the button faces up at the eyes)
		FVector BZ = (Hang - BucklePt).GetSafeNormal();
		BZ = (BZ - BX * FVector::DotProduct(BZ, BX)).GetSafeNormal();
		if (w < 7.0f || BuckleAt.Equals(FTransform::Identity))
		{
			BuckleAt = FTransform(FRotationMatrix::MakeFromXZ(BX, BZ).ToQuat(), BucklePt);
		}
		WakeBelt(w, RealDt);
	}

	// ---- the blood: dripping from the cut in the hairline while hanging, falling past the eyes onto the lining; then from the
	// temple, lying, beside the eye --------------------------------------------------------------------------------------------
	if (Blood && ((w > 0.8f && w < 7.0f) || (w > 7.8f && w < 10.f)) && w >= WakeNextDrip)
	{
		const bool bLying = w > 7.8f;
		WakeNextDrip = w + (bLying ? FMath::FRandRange(0.9f, 1.6f) : FMath::FRandRange(0.45f, 0.85f));
		const FVector From = CT.TransformPosition(bLying ? Eye.GetLocation() + FVector(4.f, 2.f, 5.f) : Eye.TransformPosition(FVector(4.f, 1.5f, 9.5f)));
		Blood->Drip(From, bLying ? 0.55f : FMath::FRandRange(0.6f, 0.8f));
	}
	// (while the eyes are on the lining and the bracing hand, a few fat drops fall through the picture, in focus, onto it)
	if (Blood)
	{
		static const float SeenDrips[] = {3.7f, 3.98f, 4.22f};
		for (int32 i = 0; i < 3; ++i)
		{
			if (WakeOnce(*FString::Printf(TEXT("seendrip%d"), i), SeenDrips[i], w))
			{
				Blood->Drip(CT.TransformPosition(Eye.TransformPosition(FVector(24.f, 1.5f * (i - 1), 6.f))), 1.05f);
			}
		}
	}

	// ---- the glass kicked up as the body lands -----------------------------------------------------------------------------
	if (WakeOnce(TEXT("crumbs"), 7.42f, w))
	{
		FRandomStream Rc(77);
		for (int32 i = 0; i < 28; ++i)
		{
			FCrumb C;
			C.P = FVector(-2.f + Rc.FRandRange(-10.f, 10.f), 4.f + Rc.FRandRange(-10.f, 10.f), Zf - 0.5f);
			const float A = Rc.FRandRange(0.f, 2.f * PI);
			C.V = FVector(FMath::Cos(A), FMath::Sin(A), 0.f) * Rc.FRandRange(40.f, 140.f) + WUp * Rc.FRandRange(40.f, 110.f);
			C.R = FQuat(FVector(Rc.FRand(), Rc.FRand(), Rc.FRand()).GetSafeNormal(), Rc.FRandRange(0.f, 6.f));
			C.S = Rc.FRandRange(0.55f, 0.85f);
			C.bRest = false;
			Crumbs.Add(C);
		}
	}
	if (CrumbIsm && Crumbs.Num() > 0)
	{
		CrumbIsm->ClearInstances();
		for (FCrumb& C : Crumbs)
		{
			if (!C.bRest)
			{
				C.V += Down * 980.f * RealDt;
				C.V *= FMath::Exp(-1.2f * RealDt);
				C.P += C.V * RealDt;
				C.R = FQuat(FVector(0.3f, 0.8f, 0.2f).GetSafeNormal(), 12.f * RealDt) * C.R;
				const float Floor = Zf - C.S * 0.33f;
				if (C.P.Z >= Floor)
				{
					C.P.Z = Floor;
					if (C.V.Size() < 60.f)
					{
						C.bRest = true;
					}
					C.V = FVector(C.V.X * 0.35f, C.V.Y * 0.35f, -FMath::Abs(C.V.Z) * 0.25f);
				}
			}
			CrumbIsm->AddInstance(FTransform(C.R, C.P, FVector(C.S)));
		}
	}

	// ---- the scare: the thump, the snow sliding off past the rear window ---------------------------------------------------
	WakeOnce(TEXT("thump"), 15.62f, w);
	if (SnowSlab && w >= 15.86f)
	{
		// off the car's sill edge (its top, now), out and down past the window into the snow: under gravity, turning over
		const float s = FMath::Min(w - 15.86f, 0.62f);
		const FVector From(18.f, 124.f, 10.f), To(16.f, 146.f, Zg - 6.f);
		const float Fall = FMath::Min(1.f, 0.5f * 980.f * s * s / FMath::Max(1.f, (float)FVector::DotProduct(To - From, Down)));
		FVector P = FMath::Lerp(From, To, Fall);
		P.Y = From.Y + (To.Y - From.Y) * FMath::Min(1.f, s / 0.45f);
		SnowSlab->SetActorHiddenInGame(false);
		const float Squash = w > 15.86f + 0.45f ? 1.f - 0.35f * WRamp(w, 16.31f, 16.42f) : 1.f;
		SnowSlab->GetRootComponent()->SetRelativeTransform(FTransform(FQuat(FVector(1.f, 0.f, 0.f), 0.9f * Fall) * FQuat(FVector(0.f, 0.f, 1.f), 0.4f), P,
			FVector(1.f, 1.f, Squash)));
		WakeOnce(TEXT("snowslide"), 15.86f, w);
		WakeOnce(TEXT("snowland"), 16.31f, w);
	}
	if (SnowLump && w >= 16.0f)
	{
		const float s = w - 16.0f;
		const float Drop = FMath::Min(1.f, 0.5f * 980.f * s * s / 125.f);
		FVector P = FMath::Lerp(FVector(30.f, 124.f, 6.f), FVector(28.f, 150.f, Zg - 4.f), Drop);
		if (s > 0.5f)
		{
			// (it bounces once and rolls away a little)
			const float r = FMath::Min(s - 0.5f, 0.6f);
			P += FVector(-6.f * r, 30.f * r, 0.f) + WUp * (12.f * FMath::Sin(PI * FMath::Min(r / 0.3f, 1.f)));
		}
		SnowLump->SetActorHiddenInGame(false);
		SnowLump->GetRootComponent()->SetRelativeTransform(FTransform(FQuat(FVector(1.f, 0.3f, 0.f).GetSafeNormal(), 3.f * s), P));
	}

	// ---- the rest of what is heard (the sound is mixed from these) ----------------------------------------------------
	WakeOnce(TEXT("brace"), 3.9f, w);
	WakeOnce(TEXT("press1"), 5.75f, w);
	WakeOnce(TEXT("stuck"), 6.3f, w);
	WakeOnce(TEXT("push"), 6.5f, w);
	WakeOnce(TEXT("release"), 7.02f, w);
	WakeOnce(TEXT("land"), 7.43f, w);
	WakeOnce(TEXT("elbow"), 9.8f, w);
	WakeOnce(TEXT("reach"), 10.6f, w);
	WakeOnce(TEXT("turn"), 19.0f, w);
	WakeOnce(TEXT("crawl1"), 19.9f, w);
	WakeOnce(TEXT("crawl2"), 20.6f, w);
	WakeOnce(TEXT("crawl3"), 21.9f, w);
	WakeOnce(TEXT("crawl4"), 22.7f, w);
	WakeOnce(TEXT("crawl5"), 23.6f, w);
	WakeOnce(TEXT("crawl6"), 24.4f, w);
	WakeOnce(TEXT("crawl7"), 25.3f, w);
	WakeOnce(TEXT("crawl8"), 26.0f, w);
	WakeOnce(TEXT("out"), 24.6f, w);
	WakeOnce(TEXT("kneel"), 27.0f, w);
	WakeOnce(TEXT("stand"), 28.4f, w);
	WakeOnce(TEXT("chute"), 30.2f, w);
	WakeOnce(TEXT("control"), 33.0f, w);

	// ---- what the eyes focus on, and the breath -------------------------------------------------------------------------
	{
		const FVector Ew = CT.TransformPosition(Eye.GetLocation());
		const FVector Fw = CT.TransformVectorNoScale(Eye.GetRotation().GetAxisX());
		FHitResult H;
		FCollisionQueryParams Q(TEXT("WakeFocus"), true, Body);
		if (Arms)
		{
			Q.AddIgnoredActor(Arms);
		}
		if (Flashlight)
		{
			Q.AddIgnoredActor(Flashlight);
		}
		float Want = 2000.f;
		if (GetWorld()->LineTraceSingleByChannel(H, Ew, Ew + Fw * 3000.f, ECC_Camera, Q))
		{
			Want = FMath::Max(H.Distance, 8.f);
		}
		if (Arms && Arms->IsReady())
		{
			const FVector E = Eye.GetLocation();
			if (w >= 2.0f && w < 3.2f)
			{
				Want = 900.f;                                                          // (out of the window: the slope, the trees)
			}
			else if (w >= 3.4f && w < 4.6f)
			{
				Want = FVector::Dist(E, Arms->PalmNow(0));                            // (the braced hand)
			}
			else if (w >= 4.6f && w < 7.1f)
			{
				Want = FVector::Dist(E, BucklePt);                                    // (the buckle)
			}
			else if (w >= 7.45f && w < 9.4f)
			{
				Want = 16.f;                                                           // (the glass by the eye)
			}
		}
		SetFocus(FMath::Lerp(FocusCm, Want, 1.f - FMath::Exp(-RealDt * 6.f)));
		if (CamComp)
		{
			CamComp->PostProcessSettings.bOverride_DepthOfFieldFstop = true;
			CamComp->PostProcessSettings.DepthOfFieldFstop = 4.f;     // (a shallow focus, not a smear: what matters stays sharp)
			// (a little motion blur, almost none in the fall: the lining rushing up is seen, not smeared)
			CamComp->PostProcessSettings.bOverride_MotionBlurAmount = true;
			CamComp->PostProcessSettings.MotionBlurAmount = (w > 7.05f && w < 7.5f) ? 0.08f : 0.3f;
		}
		// (the struggle with the buckle pressed in on: the view narrows on the hand, then lets go on the release)
		if (CamComp)
		{
			const float Push = WRamp(w, 5.3f, 5.9f) * (1.f - WRamp(w, 7.0f, 7.2f));
			CamComp->SetFieldOfView(BaseFov * (1.f - 0.42f * Push));
		}
		WakeBreath(w, RealDt, FTransform(CT.TransformRotation(Eye.GetRotation()), Ew));
	}
}

void AEndingDirector::WakeBelt(float w, float RealDt)
{
	// The three-point belt as the body hangs in it: from the ring on the pillar behind the left shoulder, over the shoulder,
	// diagonally across the chest to the latch in the buckle by the right hip; and back across the lap to its anchor by the
	// left hip. Laid as lengths of webbing along a smooth path a little off the body's surface (car frame: seated, forward
	// +X, right +Y, up +Z). When it lets go, the latch pops out of the buckle and the retractor reels it back up toward the
	// pillar, the lap belt falling slack after it.
	if (BeltStraps.Num() == 0 || !Arms || !Arms->IsReady() || !Car)
	{
		return;
	}
	const FVector BX = BuckleAt.GetRotation().GetAxisX();
	const FVector Slot = BuckleAt.GetLocation();
	const FVector LatchTop = Slot + BX * 4.5f;
	static FVector BodyA = FVector::ZeroVector, BodyB = FVector::ZeroVector;
	if (w < 7.0f || BeltShoulder.Num() == 0)
	{
		const FVector Fwd(1.f, 0.f, 0.f), Rt(0.f, 1.f, 0.f), Up(0.f, 0.f, 1.f);
		const FVector Pel = Arms->BoneCar(TEXT("pelvis")), Sp3 = Arms->BoneCar(TEXT("spine_03")), Sp5 = Arms->BoneCar(TEXT("spine_05"));
		const FVector ShL = (Arms->BoneCar(TEXT("clavicle_l")) + Arms->BoneCar(TEXT("upperarm_l"))) * 0.5f;
		const FVector Ring(-44.f, -31.f, 108.f);
		// (on the body as it is now, whole, shirted: the breastbone ~14 cm ahead of spine_05, the belly ~17 ahead of spine_03,
		// the lap ~15 ahead of the pelvis; the webbing pulled tight into it by the body's weight)
		BeltShoulder = {Ring, ShL + Up * 7.f - Fwd * 4.f, ShL + Up * 3.f + Fwd * 9.f + Rt * 3.f, Sp5 + Fwd * 14.5f + Rt * 2.f,
			Sp3 + Fwd * 17.f + Rt * 9.f, LatchTop};
		BeltLap = {FVector(-16.f, -31.f, 42.f), Pel - Rt * 19.f + Fwd * 4.f - Up * 3.f, Pel - Rt * 8.f + Fwd * 15.f - Up * 1.f,
			Pel + Rt * 7.f + Fwd * 15.f, LatchTop};
		BodyA = Pel - Fwd * 2.f;
		BodyB = Sp5 - Fwd * 2.f;
	}
	// the release: how far the latch has been reeled back along the shoulder belt
	const float t = w - 7.0f;
	const float Reel = t <= 0.f ? 0.f : 0.72f * WSmooth(t / 0.45f);
	auto Along = [](const TArray<FVector>& Pts, float Frac)
	{
		float Total = 0.f;
		for (int32 i = 1; i < Pts.Num(); ++i)
		{
			Total += FVector::Dist(Pts[i - 1], Pts[i]);
		}
		float Want = Total * FMath::Clamp(Frac, 0.f, 1.f), Acc = 0.f;
		for (int32 i = 1; i < Pts.Num(); ++i)
		{
			const float L = FVector::Dist(Pts[i - 1], Pts[i]);
			if (Acc + L >= Want)
			{
				return FMath::Lerp(Pts[i - 1], Pts[i], (Want - Acc) / FMath::Max(L, 1e-3f));
			}
			Acc += L;
		}
		return Pts.Last();
	};
	TArray<FVector> Sh = BeltShoulder, Lap = BeltLap;
	FVector LatchAt = LatchTop;
	if (Reel > 0.f)
	{
		LatchAt = Along(BeltShoulder, 1.f - Reel);
		// (the shoulder belt: from the ring to where the latch now is)
		TArray<FVector> S2;
		float Acc = 0.f, Total = 0.f;
		for (int32 i = 1; i < BeltShoulder.Num(); ++i)
		{
			Total += FVector::Dist(BeltShoulder[i - 1], BeltShoulder[i]);
		}
		S2.Add(BeltShoulder[0]);
		for (int32 i = 1; i < BeltShoulder.Num(); ++i)
		{
			Acc += FVector::Dist(BeltShoulder[i - 1], BeltShoulder[i]);
			if (Acc >= Total * (1.f - Reel))
			{
				break;
			}
			S2.Add(BeltShoulder[i]);
		}
		S2.Add(LatchAt);
		Sh = S2;
		// (the lap belt: from its anchor to the latch, falling slack toward the roof)
		const FVector A = BeltLap[0];
		const float k = WSmooth(t / 0.5f);
		for (int32 i = 1; i + 1 < Lap.Num(); ++i)
		{
			const float u = (float)i / (float)(Lap.Num() - 1);
			const FVector Slack = FMath::Lerp(A, LatchAt, u) + FVector(0.f, 0.f, 1.f) * 14.f * FMath::Sin(PI * u);
			Lap[i] = FMath::Lerp(BeltLap[i], Slack, k);
		}
		Lap.Last() = LatchAt;
	}
	// lay the webbing along each path (a Catmull-Rom curve through it, in lengths of about 4 cm)
	int32 Used = 0;
	auto Lay = [&](const TArray<FVector>& Pts)
	{
		TArray<FVector> Dense;
		for (int32 i = 0; i + 1 < Pts.Num(); ++i)
		{
			const FVector P0 = Pts[FMath::Max(i - 1, 0)], P1 = Pts[i], P2 = Pts[i + 1], P3 = Pts[FMath::Min(i + 2, Pts.Num() - 1)];
			const int32 N = FMath::Max(1, FMath::CeilToInt(FVector::Dist(P1, P2) / 4.f));
			for (int32 j = 0; j < N; ++j)
			{
				const float u = (float)j / N, u2 = u * u, u3 = u2 * u;
				Dense.Add(0.5f * ((2.f * P1) + (-P0 + P2) * u + (2.f * P0 - 5.f * P1 + 4.f * P2 - P3) * u2 + (-P0 + 3.f * P1 - 3.f * P2 + P3) * u3));
			}
		}
		Dense.Add(Pts.Last());
		for (int32 i = 0; i + 1 < Dense.Num() && Used < BeltStraps.Num(); ++i)
		{
			const FVector D = Dense[i + 1] - Dense[i];
			const float L = D.Size();
			if (L < 0.2f)
			{
				continue;
			}
			const FVector Dir = D / L;
			const FVector Mid = (Dense[i] + Dense[i + 1]) * 0.5f;
			FVector N = Mid - FMath::ClosestPointOnSegment(Mid, BodyA, BodyB);
			N = (N - Dir * FVector::DotProduct(N, Dir)).GetSafeNormal();
			if (N.IsNearlyZero())
			{
				N = FVector(0.f, 0.f, 1.f);
			}
			UStaticMeshComponent* C = BeltStraps[Used++];
			C->SetRelativeTransform(FTransform(FRotationMatrix::MakeFromXZ(Dir, N).ToQuat(), Dense[i], FVector(L / 10.f + 0.03f, 1.f, 1.f)));
			C->SetVisibility(true);
		}
	};
	Lay(Sh);
	Lay(Lap);
	for (int32 i = Used; i < BeltStraps.Num(); ++i)
	{
		BeltStraps[i]->SetVisibility(false);
	}
	if (BuckleActor)
	{
		// (each hard press shoves it in on its stalk and it shakes; the last one holds)
		const float Press = WRamp(w, 5.75f, 5.81f) * (1.f - WRamp(w, 5.89f, 6.05f)) + WRamp(w, 6.3f, 6.35f) * (1.f - WRamp(w, 6.45f, 6.6f)) +
			WRamp(w, 6.95f, 7.0f) * (1.f - WRamp(w, 7.02f, 7.12f));
		const FVector BZn = BuckleAt.GetRotation().GetAxisZ(), BYn = BuckleAt.GetRotation().GetAxisY();
		const FQuat Shake = FQuat(BYn, Press * 0.1f * FMath::Sin(w * 70.f)) * FQuat(BX, Press * 0.06f * FMath::Sin(w * 53.f + 1.f));
		BuckleActor->GetRootComponent()->SetRelativeTransform(FTransform(Shake * BuckleAt.GetRotation(), Slot - BX * 7.5f - BZn * 0.5f * Press));
	}
	if (LatchActor)
	{
		// (in the slot, its tongue down into the buckle; then out, trailing the belt as it is reeled away)
		const FVector Tail = Sh.Num() >= 2 ? (Sh.Last() - Sh[Sh.Num() - 2]).GetSafeNormal() : BX;
		const FVector X = Reel > 0.f ? FMath::Lerp(-BX, Tail, WSmooth(t / 0.15f)).GetSafeNormal() : -BX;
		const FVector At = Reel > 0.f ? LatchAt - X * 4.5f : Slot;
		LatchActor->GetRootComponent()->SetRelativeTransform(FTransform(FRotationMatrix::MakeFromXZ(X, BuckleAt.GetRotation().GetAxisZ()).ToQuat(), At));
	}
	(void)RealDt;
}
