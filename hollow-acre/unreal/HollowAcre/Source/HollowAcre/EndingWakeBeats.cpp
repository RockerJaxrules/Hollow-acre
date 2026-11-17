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
#include "Misc/CommandLine.h"
#include "Misc/Parse.h"

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
		UMaterialInstanceDynamic* D = M->CreateDynamicMaterialInstance(Slot);
		if (D)
		{
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
		Arms->AddTickPrerequisiteActor(this);
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
	// the flashlight on its side among them, its head toward the driver; the head (wider) on the lining, the barrel just off it
	{
		FVector X = FVector(0.45f, -0.89f, 0.f);
		X = (X - WUp * FVector::DotProduct(X, WUp)).GetSafeNormal();
		X = (X + WUp * 0.039f).GetSafeNormal();
		FlashRest = FTransform(FRotationMatrix::MakeFromXZ(X, WUp).ToQuat(), FVector(30.f, 36.f, Zf) + WUp * 1.985f);
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
	// the side windows' tempered glass, in pebbles all over the lining (more by the doors and under the windshield)
	if (UStaticMesh* Cube = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Cube.Cube")))
	{
		FActorSpawnParameters P;
		P.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
		AActor* G = GetWorld()->SpawnActor<AActor>(AActor::StaticClass(), CT, P);
		UInstancedStaticMeshComponent* Ism = NewObject<UInstancedStaticMeshComponent>(G, TEXT("Pebbles"));
		G->SetRootComponent(Ism);
		Ism->SetStaticMesh(Cube);
		Ism->SetMobility(EComponentMobility::Movable);
		Ism->SetCollisionEnabled(ECollisionEnabled::NoCollision);
		if (UMaterialInterface* Part = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Car/Keys/M_KeyPart.M_KeyPart")))
		{
			UMaterialInstanceDynamic* Gm = UMaterialInstanceDynamic::Create(Part, Ism);
			Gm->SetVectorParameterValue(TEXT("Color"), FLinearColor(0.035f, 0.05f, 0.045f));    // (tempered glass: dark, faintly green)
			Gm->SetScalarParameterValue(TEXT("Metallic"), 0.f);
			Gm->SetScalarParameterValue(TEXT("Roughness"), 0.04f);
			Ism->SetMaterial(0, Gm);
		}
		Ism->RegisterComponent();
		Ism->SetWorldTransform(CT);
		G->AttachToActor(Car, FAttachmentTransformRules::KeepWorldTransform);
		FRandomStream R(9311);
		int32 n = 0;
		for (int32 i = 0; i < 1400; ++i)
		{
			FVector At;
			const float u = R.FRand();
			if (u < 0.38f)
			{
				At = FVector(R.FRandRange(-45.f, 45.f), -34.f + FMath::Abs(R.FRandRange(0.f, 1.f)) * R.FRandRange(0.f, 40.f), Zf);    // the driver's door
			}
			else if (u < 0.62f)
			{
				At = FVector(R.FRandRange(-90.f, 45.f), 108.f - FMath::Abs(R.FRandRange(0.f, 1.f)) * R.FRandRange(0.f, 40.f), Zf);   // the passenger's
			}
			else if (u < 0.78f)
			{
				At = FVector(R.FRandRange(-100.f, -50.f), R.FRandRange(-34.f, 108.f), Zf);                                         // the rear doors
			}
			else
			{
				At = FVector(R.FRandRange(-60.f, 40.f), R.FRandRange(-30.f, 100.f), Zf);                                           // strewn
			}
			const float S = R.FRandRange(0.35f, 0.8f);
			const FVector Size(S, S * R.FRandRange(0.7f, 1.2f), S * R.FRandRange(0.35f, 0.6f));
			const FQuat Q = FQuat(WUp, R.FRandRange(0.f, 2.f * PI)) * FRotationMatrix::MakeFromXZ(FVector(1.f, 0.f, 0.f) - WUp * WUp.X, WUp).ToQuat();
			Ism->AddInstance(FTransform(Q, At + WUp * (Size.Z * 0.5f), Size / 100.f));
			++n;
		}
		WakeProps.Add(G);
		UE_LOG(LogTemp, Display, TEXT("EndingDirector: wake: %d pebbles of glass on the lining"), n);
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
		Moon->RegisterComponent();
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

	// ---- the eyes ------------------------------------------------------------------------------------------------------
	const TArray<FWakeEyeKey> K = {
		// 1. hanging in the belt: out through the windshield at the snow, then down at the lining below the head
		{0.0f, Hang, Hang + FVector(100.f, 0.f, 40.f), Ceil},
		{1.8f, Hang + FVector(0.f, 0.f, 0.5f), Hang + FVector(100.f, -6.f, 50.f), Ceil},
		{3.2f, Hang + FVector(0.f, -1.f, 1.f), FVector(32.f, -8.f, Zf), FVector(0.25f, 0.f, 1.f)},
		{5.0f, Hang + FVector(0.f, 0.f, 0.5f), FVector(26.f, -4.f, Zf), FVector(0.2f, 0.1f, 1.f)},
		{6.3f, Hang + FVector(0.f, 0.f, 0.5f), FVector(26.f, -2.f, Zf), FVector(0.2f, 0.1f, 1.f)},
		// pushing up off the roof to take the weight off the buckle
		{6.85f, Hang + FVector(0.f, 0.f, -4.f), FVector(26.f, -2.f, Zf), FVector(0.2f, 0.05f, 1.f)},
		{7.1f, Hang + FVector(0.f, 0.f, -4.5f), FVector(26.f, -2.f, Zf), FVector(0.2f, 0.05f, 1.f)},
		// 2. the drop: onto the head and shoulder, rolled onto the left side
		{7.28f, Hang + FVector(1.f, 3.f, 3.5f), FVector(30.f, 20.f, Zf), FVector(0.f, -0.7f, 0.7f)},
		{7.42f, FVector(-3.f, 6.f, Zf - 9.f), FVector(40.f, 62.f, Zf - 3.f), FVector(-1.f, 0.f, -0.25f)},
		{9.0f, FVector(-3.f, 7.f, Zf - 9.5f), FVector(46.f, 70.f, Zf - 4.f), FVector(-1.f, 0.15f, -0.1f)},
		// 3. pushed up on the left elbow, looking across the lining at the spill
		{10.4f, FVector(-2.f, 10.f, Zf - 22.f), FVector(34.f, 46.f, Zf - 1.f), WUp},
		{12.4f, FVector(0.f, 12.f, Zf - 23.f), FVector(32.f, 44.f, Zf - 2.f), WUp},
		{13.4f, FVector(0.f, 11.f, Zf - 24.f), FVector(38.f, 38.f, Zf - 12.f), WUp},
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
	// alive: breathing, a little unsteady; the drop's jolt; the thump's start
	{
		const float Shock = FMath::Exp(-FMath::Max(0.f, w - 7.42f) * 5.f) * (w >= 7.42f ? 1.f : 0.f) +
			0.6f * FMath::Exp(-FMath::Max(0.f, w - 15.62f) * 6.f) * (w >= 15.62f ? 1.f : 0.f);
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
		if (!SideOff.IsNearlyZero())
		{
			const FVector To = Eye.GetLocation() - WUp * 25.f;
			const FVector From = Eye.GetLocation() + SideOff;
			Camera->GetRootComponent()->SetRelativeLocationAndRotation(From, FRotationMatrix::MakeFromXZ((To - From).GetSafeNormal(), WUp).ToQuat());
		}
	}

	// the eyes opening (heavy, twice), the dark blink of the drop
	if (Cam)
	{
		const float Shut = WKeys(w, {FVector2D(0.f, 1.f), FVector2D(0.5f, 0.55f), FVector2D(0.75f, 0.95f), FVector2D(1.4f, 0.35f),
			FVector2D(1.7f, 0.8f), FVector2D(2.8f, 0.f)});
		const float Blink = WKeys(w, {FVector2D(7.38f, 0.f), FVector2D(7.45f, 0.92f), FVector2D(7.7f, 0.92f), FVector2D(8.4f, 0.25f), FVector2D(9.2f, 0.f)});
		Cam->SetManualCameraFade(FMath::Max(Shut, Blink), FLinearColor::Black, false);
	}

	// ---- the chest under the eyes: held in the seat by the belt, then free (turning after the head) ---------------------
	if (Arms)
	{
		if (w < 7.15f)
		{
			BodyEye = FTransform(FQuat::Identity, Hang + FVector(0.f, 0.f, FMath::Min(0.f, Eye.GetLocation().Z - Hang.Z) * 0.8f));
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
			BodyEye.SetLocation(Eye.GetLocation());
		}
		Arms->FreeChest = Arms->ChestForEye(BodyEye);
	}

	// ---- the flashlight: held in front of the chest, its beam along the eyes, swaying a little behind them -----------------
	// (at the chest, low and to the right, its beam on what the eyes look at a few metres off)
	const FVector HoldAt = Eye.TransformPosition(FVector(30.f, 13.f, -29.f));
	const FVector AimAt = Eye.TransformPosition(FVector(450.f, 0.f, 0.f));
	const FTransform HoldWant(FRotationMatrix::MakeFromXZ((AimAt - HoldAt).GetSafeNormal(), Eye.GetRotation().GetAxisZ()).ToQuat(), HoldAt);
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
		const FVector Fwd(1.f, 0.f, 0.f);
		// the left hand: braced flat on the lining ahead of the head (hanging); then, propped on the elbow, flat beside it
		const FTransform LBrace = Arms->HandAtPalm(0, FVector(28.f, -18.f, Zf), FVector(1.f, 0.15f, 0.f), Ceil);
		// (right way up in the upturned car its +Y is on the body's left: facing the spill (+X, +Y), the left is toward -X, +Y)
		const FTransform LProp = Arms->HandAtPalm(0, FVector(-6.f, 28.f, Zf), FVector(0.6f, 0.8f, 0.f), Down);
		// the right hand: down past the hip to the buckle (beside the right hip, on the tunnel's side of the seat)
		const float Press = 1.4f * (WRamp(w, 5.0f, 5.06f) * (1.f - WRamp(w, 5.14f, 5.3f)) + WRamp(w, 5.85f, 5.91f) * (1.f - WRamp(w, 5.99f, 6.15f)) +
			WRamp(w, 7.0f, 7.06f));
		const FTransform RBuckle = Arms->HandAtPalm(1, FVector(-12.f, 21.f, 60.f) - Ceil * Press, FVector(0.f, 0.2f, -1.f), FVector(0.f, 1.f, 0.f));
		// the flashlight as it lies, and the hand above it (open), then on it (closed)
		const FTransform RGrab = Arms->HandOnHandle(1, FlashRest);
		FTransform RAbove = RGrab;
		RAbove.AddToTranslation(WUp * 7.f);
		if (w < 7.15f)
		{
			L.W = WRamp(w, 3.0f, 4.1f);
			L.Hand = LBrace;
			L.Shape = 0;
			L.Close = WRamp(w, 3.6f, 4.1f);
			// (pushing up off the roof: the arm straightening, the palm stays)
			R.W = WRamp(w, 3.5f, 4.7f);
			R.Hand = RBuckle;
			R.Shape = 3;
			R.Close = WRamp(w, 4.3f, 4.9f);
		}
		else if (w < 9.6f)
		{
			// the drop: the hands thrown off, then the left hand finds the lining
			L.W = 1.f - WRamp(w, 7.15f, 7.4f) + WRamp(w, 8.2f, 9.4f);
			L.Hand = w < 8.f ? LBrace : LProp;
			L.Shape = 0;
			L.Close = 1.f;
			R.W = 1.f - WRamp(w, 7.12f, 7.35f);
			R.Shape = 1;
		}
		else if (w < 19.0f)
		{
			L.W = 1.f;
			L.Hand = LProp;
			L.Shape = 0;
			// the right hand: out to the flashlight (open), down onto it (closing), up with it to hold it in front
			if (w < 12.5f)
			{
				R.W = WRamp(w, 10.6f, 11.9f);
				const float down = WRamp(w, 11.9f, 12.35f);
				R.Hand.SetLocation(FMath::Lerp(RAbove.GetLocation(), RGrab.GetLocation(), down));
				R.Hand.SetRotation(RGrab.GetRotation());
				R.Shape = 2;
				R.Close = 0.15f + 0.85f * WRamp(w, 12.1f, 12.5f);
			}
			else
			{
				if (!bFlashHeld)
				{
					bFlashHeld = true;
					HoldAim = Arms->HandleInHand(1);
					Event(TEXT("grab"));
				}
				R.W = 1.f;
				R.Shape = 2;
				R.Close = 1.f;
				const FTransform Held = Arms->HandOnHandle(1, HoldAim);
				const float up = WRamp(w, 12.5f, 13.3f);
				R.Hand.SetLocation(FMath::Lerp(RGrab.GetLocation(), Held.GetLocation(), up));
				R.Hand.SetRotation(FQuat::Slerp(RGrab.GetRotation(), Held.GetRotation(), up));
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
			UE_LOG(LogTemp, Display, TEXT("WakeLog %.1f eye %s | left palm %s (%.1f cm off the lining, facing %s) w %.2f | right hand %.1f cm off its target, w %.2f shape %d | the light %.0f deg off the eyes' line"),
				w, *Eye.GetLocation().ToString(), *Lp.ToString(), Zf - Lp.Z, *Lf.ToString(), L.W, FVector::Dist(Hn, R.Hand.GetLocation()), R.W, (int32)R.Shape, BeamOff);
		}
	}

	// ---- the flashlight itself: lying, then in the hand; its switch, the flicker, the beam ------------------------------
	if (Flashlight)
	{
		const FTransform Fl = bFlashHeld && Arms ? Arms->HandleInHand(1) : FlashRest;
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

	// ---- the blood: dripping from the cut while hanging (falling past the eyes onto the lining) ---------------------------
	if (Blood && w > 1.0f && w < 7.1f && w >= WakeNextDrip)
	{
		WakeNextDrip = w + FMath::FRandRange(0.7f, 1.4f);
		const FVector From = CT.TransformPosition(Eye.TransformPosition(FVector(4.f, 1.5f, 9.5f)));
		Blood->Drip(From, 0.45f);
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
	WakeOnce(TEXT("press1"), 5.0f, w);
	WakeOnce(TEXT("stuck"), 5.85f, w);
	WakeOnce(TEXT("push"), 6.4f, w);
	WakeOnce(TEXT("release"), 7.02f, w);
	WakeOnce(TEXT("land"), 7.42f, w);
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
		SetFocus(FMath::Lerp(FocusCm, Want, 1.f - FMath::Exp(-RealDt * 6.f)));
		WakeBreath(w, RealDt, FTransform(CT.TransformRotation(Eye.GetRotation()), Ew));
	}
}
