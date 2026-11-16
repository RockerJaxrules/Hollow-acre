// The rebuilt crash cut (unreal/CUTSCENE_CRASH.md): the parts of AEndingDirector that make Part 2's opening play like
// a horror film through the driver's own eyes. The opening black and the words over it; a letterboxed, cold, grainy
// picture whose focus pulls with the eyes; the letter on the passenger seat; the smashed gap going by; eyes in the
// trees; the blow in slow motion; the fall seen in glimpses between blackouts; waking upside down in the belt, one
// headlight flickering, a tall shape walking past in its beam; the eyes closing, and the title.

#include "EndingDirector.h"

#include "Camera/CameraActor.h"
#include "Camera/CameraComponent.h"
#include "Camera/PlayerCameraManager.h"
#include "Components/BoxComponent.h"
#include "Components/SkeletalMeshComponent.h"
#include "Components/PointLightComponent.h"
#include "Components/SpotLightComponent.h"
#include "Components/StaticMeshComponent.h"
#include "DriverArms.h"
#include "Engine/DecalActor.h"
#include "Engine/Engine.h"
#include "Engine/StaticMesh.h"
#include "Engine/StaticMeshActor.h"
#include "Engine/World.h"
#include "EngineUtils.h"
#include "GameFramework/PlayerController.h"
#include "Husk.h"
#include "Kismet/GameplayStatics.h"

namespace
{
	float Smooth(float x)
	{
		x = FMath::Clamp(x, 0.f, 1.f);
		return x * x * (3.f - 2.f * x);
	}

	// piecewise linear through (t, v) keys
	float Keys(float t, std::initializer_list<FVector2D> K)
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
}

void AEndingDirector::BeginCrashScene()
{
	// no engine messages over the picture
	if (GEngine)
	{
		GEngine->bEnableOnScreenDebugMessages = false;
	}
	if (APlayerController* PC = GetWorld()->GetFirstPlayerController())
	{
		PC->ConsoleCommand(TEXT("DisableAllScreenMessages"));
	}
	// the creep and the blow are timed from when it has gone (MoveCreature sets them)
	CreepTime = ImpactTime = 1.0e9f;

	// the picture: letterboxed, graded cold (the shadows blue, the colour drained a little, contrast up), film grain, a
	// vignette, a little fringing, and a shallow focus that the eyes pull
	if (ACameraActor* CA = Cast<ACameraActor>(Camera))
	{
		CamComp = CA->GetCameraComponent();
		CamComp->SetConstraintAspectRatio(true);
		CamComp->SetAspectRatio(2.39f);
		FPostProcessSettings& PP = CamComp->PostProcessSettings;
		PP.bOverride_FilmGrainIntensity = true;
		PP.FilmGrainIntensity = 0.35f;
		PP.bOverride_VignetteIntensity = true;
		PP.VignetteIntensity = 0.65f;
		PP.bOverride_SceneFringeIntensity = true;
		PP.SceneFringeIntensity = 0.6f;
		PP.bOverride_ColorSaturation = true;
		PP.ColorSaturation = FVector4(0.86f, 0.9f, 1.f, 0.9f);
		PP.bOverride_ColorContrast = true;
		PP.ColorContrast = FVector4(1.f, 1.f, 1.f, 1.12f);
		PP.bOverride_ColorGainShadows = true;
		PP.ColorGainShadows = FVector4(0.86f, 0.95f, 1.12f, 1.f);
		PP.bOverride_DepthOfFieldFocalDistance = true;
		PP.DepthOfFieldFocalDistance = FocusCm;
		PP.bOverride_DepthOfFieldFstop = true;
		PP.DepthOfFieldFstop = 2.f;
		PP.bOverride_DepthOfFieldSensorWidth = true;
		PP.DepthOfFieldSensorWidth = 36.f;
	}

	// the headlights (to break one and flicker the other at the bottom)
	if (Car)
	{
		TArray<AActor*> On;
		Car->GetAttachedActors(On, true, true);
		On.Add(Car);
		for (AActor* A : On)
		{
			TArray<USpotLightComponent*> Spots;
			A->GetComponents(Spots);
			for (USpotLightComponent* S : Spots)
			{
				Headlights.Add(S);
				HeadlightBase.Add(S->Intensity);
			}
		}
	}
	// the smashed gap: its tyre tracks (the decal the level build laid over the edge)
	for (TActorIterator<ADecalActor> It(GetWorld()); It; ++It)
	{
		GapAt = It->GetActorLocation();
		break;
	}
	// the radio's faint glow across the passenger seat (the only light in the cabin but the dials)
	if (Car)
	{
		UPointLightComponent* Glow = NewObject<UPointLightComponent>(Car, TEXT("RadioGlow"));
		Glow->SetupAttachment(Car->GetRootComponent());
		Glow->RegisterComponent();
		Glow->SetIntensityUnits(ELightUnits::Candelas);
		Glow->SetIntensity(0.35f);
		Glow->SetLightColor(FLinearColor(0.45f, 0.85f, 1.f));
		Glow->SetAttenuationRadius(110.f);
		Glow->SetCastShadows(false);
		Glow->SetRelativeLocation(CamRest + FVector(45.f, 38.f, -40.f));
	}
	// the rear-view mirror (car frame: on its stem under the header, on the car's centre line)
	MirrorAt = FVector(36.f, 37.f, 125.f);

	// Kessler's letter on the passenger seat cushion, turned a little toward the driver
	if (LetterMaterial && Car)
	{
		if (UStaticMesh* Plane = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Plane.Plane")))
		{
			AStaticMeshActor* L = GetWorld()->SpawnActor<AStaticMeshActor>(AStaticMeshActor::StaticClass(), Car->GetActorTransform());
			L->SetMobility(EComponentMobility::Movable);
			L->GetStaticMeshComponent()->SetStaticMesh(Plane);
			L->GetStaticMeshComponent()->SetMaterial(0, LetterMaterial);
			L->GetStaticMeshComponent()->SetCollisionEnabled(ECollisionEnabled::NoCollision);
			L->AttachToActor(Car, FAttachmentTransformRules::KeepWorldTransform);
			L->SetActorRelativeTransform(FTransform(FRotator(-8.f, 90.f + 16.f, 0.f), CamRest + FVector(12.f, 70.f, -58.f), FVector(0.279f, 0.216f, 1.f)));
			LetterAt = L->GetActorLocation();
			Letter = L;
		}
	}
	UE_LOG(LogTemp, Display, TEXT("EndingDirector: crash cut: %d headlights, gap tracks %s, letter %s, eye at %s"), Headlights.Num(),
		GapAt.IsZero() ? TEXT("missing") : *GapAt.ToString(), Letter ? TEXT("on the seat") : TEXT("missing"), *CamRest.ToString());
}

void AEndingDirector::LookAt(const FVector& World, float Share, float& Yaw, float& Pitch) const
{
	// the angles to a point from the driver's eyes at rest (car frame), as much of them as the head takes (the eyes do
	// the rest)
	if (!Car)
	{
		return;
	}
	const FTransform C = Car->GetActorTransform();
	const FVector Eye = C.TransformPosition(CamRest);
	const FVector D = C.InverseTransformVectorNoScale(World - Eye);
	Yaw = FMath::RadiansToDegrees(FMath::Atan2(D.Y, D.X)) * Share;
	Pitch = FMath::RadiansToDegrees(FMath::Atan2(D.Z, FVector(D.X, D.Y, 0.f).Size())) * Share;
}

void AEndingDirector::SetFocus(float Cm)
{
	FocusCm = Cm;
	if (CamComp)
	{
		CamComp->PostProcessSettings.DepthOfFieldFocalDistance = FMath::Max(Cm, 5.f);
	}
}

void AEndingDirector::CrashBeats(float DeltaSeconds)
{
	RoarShake = FMath::Max(0.f, RoarShake - DeltaSeconds * 0.9f);
	if (!bLetterLooked && Time >= LetterTime)
	{
		bLetterLooked = true;
		Event(TEXT("letter"));
	}
	if (!bGapPassed && Time >= GapTime)
	{
		bGapPassed = true;
		Event(TEXT("gap"));
	}
	// eyes in the trees below the road on the right, catching the headlights a moment, then gone
	if (!bEyesShown && Time >= EyesTime && EyeShineMaterial)
	{
		bEyesShown = true;
		const float D = StartDistance + DistNow + 2800.f;
		const FVector T = (PathAt(D + 300.f) - PathAt(D - 300.f)).GetSafeNormal2D();
		const FVector R = FVector::CrossProduct(FVector::UpVector, T);
		EyesAt = PathAt(D) + R * 560.f;
		EyesAt.Z = CreatureGround(EyesAt) + 105.f;
		const FVector Across = FVector::CrossProduct(FVector::UpVector, (EyesAt - Car->GetActorLocation()).GetSafeNormal2D());
		UStaticMesh* Ball = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Sphere.Sphere"));
		for (float s : {-1.f, 1.f})
		{
			AStaticMeshActor* E = GetWorld()->SpawnActor<AStaticMeshActor>(AStaticMeshActor::StaticClass(), FTransform(EyesAt + Across * 5.f * s));
			E->SetMobility(EComponentMobility::Movable);
			E->GetStaticMeshComponent()->SetStaticMesh(Ball);
			E->GetStaticMeshComponent()->SetMaterial(0, EyeShineMaterial);
			E->GetStaticMeshComponent()->SetCollisionEnabled(ECollisionEnabled::NoCollision);
			E->GetStaticMeshComponent()->SetCastShadow(false);
			E->SetActorScale3D(FVector(0.09f));
			EyeActors.Add(E);
		}
		Event(TEXT("eyes"));
	}
	if (bEyesShown && !bEyesGone)
	{
		const float e = Time - EyesTime;
		const float Lid = 1.f - Smooth((e - 1.45f) / 0.12f);        // they close (or turn away), and are gone
		for (AActor* E : EyeActors)
		{
			if (E)
			{
				E->SetActorScale3D(FVector(0.09f, 0.09f, 0.09f * FMath::Max(Lid, 0.02f)));
			}
		}
		if (e > 1.62f)
		{
			bEyesGone = true;
			for (AActor* E : EyeActors)
			{
				if (E)
				{
					E->Destroy();
				}
			}
			EyeActors.Reset();
		}
	}
	if (!bGrowled && Time >= ImpactTime - 1.f)
	{
		bGrowled = true;
		Event(TEXT("growl"));
	}
	// the blow's slow motion, held, then easing back to speed
	if (SlowMoT0 >= 0.f)
	{
		const float rt = RealTime - SlowMoT0;
		const float Dil = rt < SlowMoSeconds ? SlowMo : FMath::Lerp(SlowMo, 1.f, Smooth((rt - SlowMoSeconds) / 0.4f));
		UGameplayStatics::SetGlobalTimeDilation(this, Dil);
		if (rt > SlowMoSeconds + 0.4f)
		{
			UGameplayStatics::SetGlobalTimeDilation(this, 1.f);
			SlowMoT0 = -1.f;
			Event(TEXT("speed"));
		}
	}
}

void AEndingDirector::AfterTheFall(float RealDt)
{
	APlayerCameraManager* Cam = UGameplayStatics::GetPlayerCameraManager(this, 0);
	// the fall in glimpses: a few clear moments, blacking out between them
	if (EdgeReal >= 0.f && RestReal < 0.f && Cam)
	{
		const float e = RealTime - EdgeReal;
		float Seen = 0.f;
		for (const FVector2D& W : {FVector2D(0.f, 1.6f), FVector2D(3.f, 3.9f), FVector2D(5.3f, 6.1f), FVector2D(7.6f, 8.2f)})
		{
			Seen = FMath::Max(Seen, Smooth((e - W.X) / 0.08f) * (1.f - Smooth((e - W.Y) / 0.12f)));
		}
		Cam->SetManualCameraFade(1.f - Seen, FLinearColor::Black, false);
	}
	if (RestReal < 0.f && (bRested || Time >= ImpactTime + MaxFall || (EdgeReal >= 0.f && RealTime > EdgeReal + 10.f)))
	{
		RestReal = RealTime;
		if (Cam)
		{
			Cam->SetManualCameraFade(1.f, FLinearColor::Black, false);
		}
		Event(TEXT("black"));
	}
	if (RestReal < 0.f)
	{
		return;
	}
	// in the black: the car is left on its roof in the snow where it stopped
	if (!bUpsideDown && RealTime >= RestReal + 0.3f && Body && BodyBox)
	{
		bUpsideDown = true;
		BodyBox->SetSimulatePhysics(false);
		const FVector Rest = Body->GetActorLocation();
		const FVector F = Body->GetActorForwardVector().GetSafeNormal2D();
		const float Yaw = FMath::RadiansToDegrees(FMath::Atan2(F.Y, F.X));
		// the flattest snow within 40 m (so its one headlight reaches out over open ground)
		auto GroundAt = [this](const FVector& P)
		{
			FHitResult H;
			FCollisionQueryParams Q(TEXT("Upside"), true, Body);
			Q.AddIgnoredActor(Car);
			return GetWorld()->LineTraceSingleByChannel(H, P + FVector(0.f, 0.f, 3000.f), P - FVector(0.f, 0.f, 6000.f), ECC_WorldStatic, Q) ? H.ImpactPoint.Z : P.Z;
		};
		FVector At = Rest;
		float Best = 1e9f;
		for (float dx = -4000.f; dx <= 4000.f; dx += 500.f)
		{
			for (float dy = -4000.f; dy <= 4000.f; dy += 500.f)
			{
				const FVector P = Rest + FVector(dx, dy, 0.f);
				// how much the ground falls away over 10 m ahead in the car's direction and either side
				const float g = GroundAt(P);
				float Slope = 0.f;
				for (const FVector& o : {F * 1000.f, -F * 1000.f, FVector(-F.Y, F.X, 0.f) * 600.f, FVector(F.Y, -F.X, 0.f) * 600.f})
				{
					Slope = FMath::Max(Slope, FMath::Abs(GroundAt(P + o) - g) / o.Size());
				}
				const float Score = Slope + FVector::Dist2D(P, Rest) * 0.000004f;
				if (Score < Best)
				{
					Best = Score;
					At = FVector(P.X, P.Y, g);
				}
			}
		}
		Body->SetActorLocationAndRotation(At + FVector(0.f, 0.f, 48.f), FRotator(2.f, Yaw, 178.f));
		if (Arms)
		{
			Arms->SetActorHiddenInGame(true);          // the hands fall away from the wheel, out of sight
		}
		UE_LOG(LogTemp, Display, TEXT("EndingDirector: left on its roof at %s (%.0f m from where it stopped, the ground falling %.0f%%)"),
			*At.ToString(), FVector::Dist2D(At, Rest) / 100.f, Best * 100.f);
		PrevPos = Body->GetActorLocation();
		PrevVel = FVector::ZeroVector;
		HeadOff = FVector::ZeroVector;
		LookYaw = LookPitch = HeadPush = 0.f;
		if (Headlights.Num() > 1 && Headlights[0])
		{
			Headlights[0]->SetIntensity(0.f);         // one headlight smashed
		}
		SetFocus(12.f);
		Event(TEXT("upside"));
	}
	// waking: the eyes open, close, open, the picture swimming into focus
	if (!bWoke && RealTime >= RestReal + WakeAfterRest)
	{
		bWoke = true;
		WakeReal = RealTime;
		Event(TEXT("wake"));
	}
	if (bWoke && !bClosed && Cam)
	{
		const float w = RealTime - WakeReal;
		const float Shut = Keys(w, {FVector2D(0.f, 1.f), FVector2D(0.45f, 0.5f), FVector2D(0.7f, 0.95f), FVector2D(1.35f, 0.3f),
			FVector2D(1.65f, 0.75f), FVector2D(2.7f, 0.f)});
		Cam->SetManualCameraFade(Shut, FLinearColor::Black, false);
		SetFocus(Keys(w, {FVector2D(0.f, 12.f), FVector2D(1.2f, 20.f), FVector2D(3.6f, 900.f)}));
	}
	// the one headlight left, flickering
	for (int32 i = 1; bUpsideDown && i < Headlights.Num() && i < HeadlightBase.Num(); ++i)
	{
		if (Headlights[i])
		{
			const float Dip = FMath::Sin(RealTime * 5.3f) > -0.82f ? 1.f : 0.08f;
			Headlights[i]->SetIntensity(HeadlightBase[i] * Dip * (0.62f + 0.38f * (0.5f + 0.5f * FMath::Sin(RealTime * 37.f))));
		}
	}
	// a tall shape walking slowly across the beam, out in the snow
	if (bWoke && !bSilhouette && RealTime >= WakeReal + SilhouetteAfterWake && Body)
	{
		bSilhouette = true;
		const FVector F = Body->GetActorForwardVector().GetSafeNormal2D();
		const FVector R = FVector::CrossProduct(FVector::UpVector, F);
		WalkDir = R;
		WalkFrom = Body->GetActorLocation() + F * 950.f - R * 520.f;
		FActorSpawnParameters P;
		P.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
		Walker = GetWorld()->SpawnActor<AHusk>(AHusk::StaticClass(), FTransform(WalkFrom), P);
		if (Walker && Walker->Setup())
		{
			Walker->SetActorScale3D(FVector(HuskScale));
			Walker->Play(TEXT("Stalk"), true);
			Walker->GetBody()->SetPlayRate(1.35f);
			Walker->JawOpen = 5.f;
			WalkReal = RealTime;
			Event(TEXT("silhouette"));
		}
	}
	if (Walker)
	{
		const float Speed = 67.f * HuskScale * 1.35f;                 // its stalk (0.67 m/s at its model's size), a little quicker
		FVector P = WalkFrom + WalkDir * Speed * (RealTime - WalkReal);
		P.Z = CreatureGround(P);
		const float Yaw = FMath::RadiansToDegrees(FMath::Atan2(WalkDir.Y, WalkDir.X));
		Walker->SetActorLocationAndRotation(P, FRotator(0.f, Yaw, 0.f).Quaternion() * FRotator(0.f, -Walker->MeshForwardYaw(), 0.f).Quaternion());
		Walker->AddActorWorldOffset(FVector(0.f, 0.f, Walker->GroundLift([this](const FVector& At) { return CreatureGround(At); })));
		if (RealTime - WalkReal > 11.f)
		{
			Walker->Destroy();
			Walker = nullptr;
		}
	}
	// the eyes close; the title
	if (bWoke && !bClosed && RealTime >= WakeReal + CloseAfterWake)
	{
		bClosed = true;
		CloseReal = RealTime;
		Event(TEXT("close"));
	}
	if (bClosed && Cam)
	{
		Cam->SetManualCameraFade(Smooth((RealTime - CloseReal) / 1.8f), FLinearColor::Black, false);
		if (!bTitled && RealTime >= CloseReal + 2.f)
		{
			bTitled = true;
			Event(TEXT("title"));
		}
	}
}

bool AEndingDirector::GetCaption(FString& Line1, FString& Line2, float& Alpha, float& Size) const
{
	if (!bCrash)
	{
		return false;
	}
	// where and when, over the opening black
	if (RealTime < 5.f)
	{
		Alpha = Smooth((RealTime - 1.f) / 0.9f) * (1.f - Smooth((RealTime - 3.9f) / 0.8f));
		Line1 = PlaceText.ToString();
		Line2 = WhenText.ToString();
		Size = 0.034f;
		return Alpha > 0.f;
	}
	if (CloseReal >= 0.f)
	{
		Alpha = Smooth((RealTime - CloseReal - 2.f) / 2.5f);
		Line1 = TitleText.ToString();
		Line2 = SubtitleText.ToString();
		Size = 0.07f;
		return Alpha > 0.f;
	}
	return false;
}
