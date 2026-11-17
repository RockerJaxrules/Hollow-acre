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
#include "Components/CapsuleComponent.h"
#include "Components/InstancedStaticMeshComponent.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "PhysicsEngine/BodySetup.h"
#include "Misc/CommandLine.h"
#include "Misc/Parse.h"
#include "Scatter.h"
#include "Components/DecalComponent.h"
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
#include "GlassBurst.h"
#include "Husk.h"
#include "Kismet/GameplayStatics.h"
#include "UnrealClient.h"

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
	// (-roofattack: the attack from the roof, its face hanging into the windshield, instead of the one on the bonnet)
	if (FParse::Param(FCommandLine::Get(), TEXT("roofattack")))
	{
		bHoodAttack = false;
		bStall = false;
	}
	if (FParse::Param(FCommandLine::Get(), TEXT("hoodattack")))
	{
		bStall = false;
	}
	if (bStall)
	{
		bHoodReveal = false;               // (nothing of it seen before the blow)
	}
	// (-notown: the abandoned town left out, while it is being built: its buildings hidden, the car left as before)
	if (FParse::Param(FCommandLine::Get(), TEXT("notown")))
	{
		for (TActorIterator<AActor> It(GetWorld()); It; ++It)
		{
			if (It->ActorHasTag(TEXT("Town")))
			{
				It->SetActorHiddenInGame(true);
				It->SetActorEnableCollision(false);
			}
		}
		TownRestAt = FVector::ZeroVector;
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
		BaseFov = CamComp->FieldOfView;
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
				S->SetIntensity(S->Intensity * HeadlightShare);
				Headlights.Add(S);
				HeadlightBase.Add(S->Intensity);
			}
		}
	}
	// the smashed gap: its tyre tracks (the decal the level build laid over the edge)
	ADecalActor* Tracks = nullptr;
	for (TActorIterator<ADecalActor> It(GetWorld()); It; ++It)
	{
		GapAt = It->GetActorLocation();
		Tracks = *It;
		break;
	}
	// beside the tracks, a blood trail dragged to the edge (whoever went over did not go quietly): the same projection,
	// 1.7 m to one side (Scripts/make_gore.py, tools/make_blood_trail_tex.py)
	if (Tracks)
	{
		if (UMaterialInterface* Blood = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Materials/Blockout/M_BloodTrail.M_BloodTrail")))
		{
			FActorSpawnParameters P;
			P.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
			ADecalActor* B = GetWorld()->SpawnActor<ADecalActor>(Tracks->GetActorLocation() + Tracks->GetActorRightVector() * 170.f,
				Tracks->GetActorRotation(), P);
			if (B)
			{
				B->SetDecalMaterial(Blood);
				B->GetDecal()->DecalSize = FVector(300.f, 62.f, 250.f);
				B->GetDecal()->SortOrder = 1;
				UE_LOG(LogTemp, Display, TEXT("EndingDirector: blood trail at the gap, %s"), *B->GetActorLocation().ToString());
			}
		}
	}
	// the car's own surfaces (its body, glass, bonnet, roof: every mesh on it), queryable, so the creature collides with
	// them (AHusk::PushClear) instead of passing through
	if (Car)
	{
		TArray<AActor*> On;
		Car->GetAttachedActors(On, true, true);
		On.Add(Car);
		for (AActor* A : On)
		{
			if (!A || A == Arms || A == Camera)
			{
				continue;
			}
			TArray<UStaticMeshComponent*> Meshes;
			A->GetComponents(Meshes);
			for (UStaticMeshComponent* M : Meshes)
			{
				if (M && M->GetStaticMesh())
				{
					M->SetCollisionEnabled(ECollisionEnabled::QueryOnly);
					M->SetCollisionResponseToAllChannels(ECR_Ignore);
					CarParts.Add(M);
				}
			}
		}
		UE_LOG(LogTemp, Display, TEXT("EndingDirector: the creature collides with %d of the car's parts"), CarParts.Num());
		SampleShell();
		if (Camera && Camera->GetRootComponent()->GetAttachParent())
		{
			// is the eye clear of the car where it rests?
			const FVector Eye = Camera->GetRootComponent()->GetAttachParent()->GetComponentTransform().TransformPosition(CamRest);
			for (UPrimitiveComponent* P : CarParts)
			{
				FHitResult H;
				if (P && P->SweepComponent(H, Eye, Eye + FVector(0.f, 0.f, 0.1f), FQuat::Identity, FCollisionShape::MakeSphere(EyeRoom), true) && H.bStartPenetrating)
				{
					UE_LOG(LogTemp, Warning, TEXT("EndingDirector: the eye at rest is within %.0f cm of %s"), EyeRoom, *P->GetName());
				}
			}
		}
	}
	bClipCheck = FParse::Param(FCommandLine::Get(), TEXT("clipcheck"));
	GatherSolids();
	// the far terrain (the valley the car falls into) collides on its own surface, when it has that collision
	// (Scripts/far_terrain_collision.py): the car lands on its snow instead of falling through it
	for (TActorIterator<AStaticMeshActor> It(GetWorld()); It; ++It)
	{
		UStaticMeshComponent* M = It->GetStaticMeshComponent();
		UStaticMesh* SM = M ? M->GetStaticMesh() : nullptr;
		if (SM && SM->GetName().StartsWith(TEXT("Terrain_Far")) && SM->GetBodySetup() && SM->GetBodySetup()->CollisionTraceFlag == CTF_UseComplexAsSimple)
		{
			M->SetCollisionProfileName(TEXT("BlockAll"));
			UE_LOG(LogTemp, Display, TEXT("EndingDirector: the far terrain collides (on its own surface)"));
		}
	}
	// the radio's faint glow across the passenger seat (the only light in the cabin but the dials)
	if (Car)
	{
		UPointLightComponent* Glow = NewObject<UPointLightComponent>(Car, TEXT("RadioGlow"));
		Glow->SetupAttachment(Car->GetRootComponent());
		Glow->RegisterComponent();
		Glow->SetIntensityUnits(ELightUnits::Candelas);
		Glow->SetIntensity(0.6f);
		Glow->SetLightColor(FLinearColor(0.45f, 0.85f, 1.f));
		Glow->SetAttenuationRadius(110.f);
		Glow->SetCastShadows(false);
		Glow->SetRelativeLocation(CamRest + FVector(45.f, 38.f, -40.f));
		const FVector From = CamRest + FVector(-10.f, 150.f, 75.f), To = CamRest + FVector(12.f, 70.f, -58.f);
		USpotLightComponent* Moon = NewObject<USpotLightComponent>(Car, TEXT("SeatMoon"));
		Moon->SetupAttachment(Car->GetRootComponent());
		Moon->RegisterComponent();
		Moon->SetIntensityUnits(ELightUnits::Candelas);
		Moon->SetIntensity(3.f);
		Moon->SetLightColor(FLinearColor(0.62f, 0.74f, 1.f));
		Moon->SetInnerConeAngle(9.f);
		Moon->SetOuterConeAngle(19.f);
		Moon->SetAttenuationRadius(260.f);
		Moon->SetCastShadows(true);
		Moon->SetRelativeLocationAndRotation(From, (To - From).Rotation());
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

void AEndingDirector::UpdateWindshieldHits()
{
	// the creature's blows on the windshield: each a spider web spreading out from where it struck (laminated glass: it
	// cracks and holds, and stays cracked); kept where they are on the glass as the car moves (the material places them
	// in the world)
	if (!WindshieldMID || !Car || BlowT[0] < 0.f)
	{
		return;
	}
	const FTransform C = Car->GetActorTransform();
	WindshieldMID->SetVectorParameterValue(TEXT("GlassU"), FLinearColor(FVector3f(C.TransformVectorNoScale(FVector(0.f, 1.f, 0.f)))));
	WindshieldMID->SetVectorParameterValue(TEXT("GlassV"), FLinearColor(FVector3f(C.TransformVectorNoScale(FVector(0.838f, 0.f, -0.545f)))));
	static const TCHAR* Pos[2] = {TEXT("HitA"), TEXT("HitB")};
	static const TCHAR* Rad[2] = {TEXT("HitAR"), TEXT("HitBR")};
	static const TCHAR* Dent[2] = {TEXT("HitAD"), TEXT("HitBD")};
	WindshieldMID->SetVectorParameterValue(TEXT("GlassN"), FLinearColor(FVector3f(C.TransformVectorNoScale(FVector(0.545f, 0.f, 0.838f)))));
	for (int32 k = 0; k < 2; ++k)
	{
		if (BlowT[k] < 0.f)
		{
			continue;
		}
		// nearly all of it at once (a crack runs through glass faster than a frame), then a little more creeping out
		const float d = FMath::Max(0.f, Time - BlowT[k]);
		const float Hard = FMath::Clamp(BlowS[k] / 500.f, 0.5f, 1.4f);
		const float R = Hard * ((k == 0 ? 34.f : 22.f) * (1.f - FMath::Exp(-d / 0.035f)) + (k == 0 ? 7.f : 5.f) * (1.f - FMath::Exp(-d / 1.2f)));
		WindshieldMID->SetVectorParameterValue(Pos[k], FLinearColor(FVector3f(C.TransformPosition(BlowAt[k]))));
		WindshieldMID->SetScalarParameterValue(Rad[k], R);
		// and pushed in round it (a shallow cone: it stays so), ringing for a moment
		const float D = Hard * (k == 0 ? 2.4f : 1.1f);
		WindshieldMID->SetScalarParameterValue(Dent[k], D * (1.f - FMath::Exp(-d / 0.02f)) * (1.f + 0.35f * FMath::Exp(-d / 0.09f) * FMath::Sin(d * 60.f)));
	}
}

void AEndingDirector::ChipWindshield(const FVector& AtCar, int32 Seed)
{
	// laminated glass struck hard: it holds, but flakes come off its inner face and fall onto the dash
	AGlassBurst* G = Car ? GetWorld()->SpawnActor<AGlassBurst>(AGlassBurst::StaticClass(), Car->GetActorTransform()) : nullptr;
	if (!G)
	{
		return;
	}
	G->AttachToActor(Car, FAttachmentTransformRules::KeepWorldTransform);
	for (UPrimitiveComponent* P : CarParts)
	{
		G->Solids.Add(P);
	}
	if (APlayerCameraManager* Cam = UGameplayStatics::GetPlayerCameraManager(this, 0))
	{
		G->Head = Car->GetActorTransform().InverseTransformPosition(Cam->GetCameraLocation()) + FVector(-7.f, 0.f, -2.f);
		G->HeadRadius = 13.f;
	}
	const FVector In(-0.545f, 0.f, -0.838f);           // into the car, through the glass
	// (from just inside its inner face, never outside it: a thin patch along the glass)
	const FVector At = AtCar + In * 6.f;
	G->Burst(FBox(At - FVector(1.f, 4.f, 1.f), At + FVector(1.f, 4.f, 1.f)), In, 120.f, Seed == 1 ? 26 : 14, GranuleMaterial, 40 + Seed);
}

void AEndingDirector::CrashBeats(float DeltaSeconds)
{
	RoarShake = FMath::Max(0.f, RoarShake - DeltaSeconds * 0.9f);
	UpdateWindshieldHits();
	if (bStall && StallT >= 0.f && !bImpacted)
	{
		// the lights on the battery alone: a stutter as the engine dies, a little dimmer after; sagging hard each time the
		// starter turns (it draws the battery down), brightening again when the key is let go
		const float s = Time - StallT;
		float K = s < 0.7f ? (FMath::Sin(s * 61.f) > -0.2f ? 0.9f : 0.45f) : 0.86f;
		if (Arms && Arms->KeyTurn > 8.f)
		{
			K *= 0.5f + 0.06f * FMath::Sin(RealTime * 47.f);
		}
		for (int32 i = 0; i < Headlights.Num() && i < HeadlightBase.Num(); ++i)
		{
			if (Headlights[i])
			{
				Headlights[i]->SetIntensity(HeadlightBase[i] * K);
			}
		}
	}
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
	// eyes low in the tree line at the edge of the beams on the left, catching the light a moment, then gone
	if (!bEyesShown && Time >= EyesTime && EyeShineMaterial)
	{
		bEyesShown = true;
		const FTransform C = Car->GetActorTransform();
		const FVector Eye = C.TransformPosition(CamRest);
		const FVector Fwd = C.GetUnitAxis(EAxis::X).GetSafeNormal2D();
		FCollisionQueryParams Q(TEXT("EyesSight"), true, Car);
		if (Body)
		{
			Q.AddIgnoredActor(Body);
		}
		EyesAt = FVector::ZeroVector;
		float Ang = 0.f, Far = 0.f;
		for (float Dist : {1600.f, 1900.f, 1350.f})
		{
			for (float A : {-21.f, -27.f, -16.f, -33.f})
			{
				FVector P = Eye + FRotator(0.f, A, 0.f).RotateVector(Fwd) * Dist;
				P.Z = FMath::Max(CreatureGround(P) + 110.f, Eye.Z - 80.f);     // standing in the trees, or peering over the edge
				// from just beyond the bonnet (the glass, the arms and the car's other parts are not in the way)
				FHitResult H;
				const FVector From = Eye + (P - Eye).GetSafeNormal() * 350.f;
				if (GetWorld()->LineTraceSingleByChannel(H, From, P, ECC_Visibility, Q))
				{
					UE_LOG(LogTemp, Display, TEXT("EndingDirector: eyes %.0f m, %.0f deg: blocked by %s at %.0f m"), Dist / 100.f, A,
						H.GetActor() ? *H.GetActor()->GetName() : TEXT("?"), FVector::Dist(Eye, H.ImpactPoint) / 100.f);
				}
				else
				{
					EyesAt = P;
					Ang = A;
					Far = Dist;
					break;
				}
			}
			if (!EyesAt.IsZero())
			{
				break;
			}
		}
		if (EyesAt.IsZero())
		{
			EyesAt = Eye + FRotator(0.f, -21.f, 0.f).RotateVector(Fwd) * 1600.f;
		}
		UE_LOG(LogTemp, Display, TEXT("EndingDirector: eyes at %s (%.0f m, %.0f deg (- is left)%s)"), *EyesAt.ToString(), Far / 100.f, Ang,
			Far > 0.f ? TEXT("") : TEXT(", no clear sight line found"));
		const FVector Across = FVector::CrossProduct(FVector::UpVector, (EyesAt - Car->GetActorLocation()).GetSafeNormal2D());
		UStaticMesh* Ball = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Sphere.Sphere"));
		for (float s : {-1.f, 1.f})
		{
			AStaticMeshActor* E = GetWorld()->SpawnActor<AStaticMeshActor>(AStaticMeshActor::StaticClass(), FTransform(EyesAt + Across * 6.f * s));
			E->SetMobility(EComponentMobility::Movable);
			E->GetStaticMeshComponent()->SetStaticMesh(Ball);
			E->GetStaticMeshComponent()->SetMaterial(0, EyeShineMaterial);
			E->GetStaticMeshComponent()->SetCollisionEnabled(ECollisionEnabled::NoCollision);
			E->GetStaticMeshComponent()->SetCastShadow(false);
			E->SetActorScale3D(FVector(0.06f));
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
				E->SetActorScale3D(FVector(0.06f, 0.06f, 0.06f * FMath::Max(Lid, 0.02f)));
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
	if (!bLunged && LungeLead > 0.f && Time >= ImpactTime - LungeLead && SlowMoT0 < 0.f)
	{
		bLunged = true;
		SlowMoT0 = RealTime;
		UGameplayStatics::SetGlobalTimeDilation(this, SlowMo);
		Event(TEXT("lunge"));
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
			if (SolidHolder)
			{
				Q.AddIgnoredActor(SolidHolder);
			}
			// (NaN where there is no ground under it at all: never a place to leave it)
			return GetWorld()->LineTraceSingleByChannel(H, P + FVector(0.f, 0.f, 20000.f), P - FVector(0.f, 0.f, 20000.f), ECC_WorldStatic, Q) ? H.ImpactPoint.Z : NAN;
		};
		FVector At = Rest;
		float Best = 1e9f;
		const float Here = GroundAt(Rest);
		if (!FMath::IsNaN(Here))
		{
			At.Z = Here;
		}
		// (within 120 m: where it comes to rest may be on the valley's steep side; it is left on the level snow below)
		for (float dx = -12000.f; dx <= 12000.f; dx += 750.f)
		{
			for (float dy = -12000.f; dy <= 12000.f; dy += 750.f)
			{
				const FVector P = Rest + FVector(dx, dy, 0.f);
				// how much the ground falls away over 10 m ahead in the car's direction and either side
				const float g = GroundAt(P);
				if (FMath::IsNaN(g))
				{
					continue;
				}
				float Slope = 0.f;
				for (const FVector& o : {F * 1000.f, -F * 1000.f, FVector(-F.Y, F.X, 0.f) * 600.f, FVector(F.Y, -F.X, 0.f) * 600.f})
				{
					const float go = GroundAt(P + o);
					Slope = FMath::Max(Slope, FMath::IsNaN(go) ? 1e6f : FMath::Abs(go - g) / o.Size());
				}
				const float Score = Slope + FVector::Dist2D(P, Rest) * 0.000004f;
				if (Score < Best)
				{
					Best = Score;
					At = FVector(P.X, P.Y, g);
				}
			}
		}
		// on its roof, its nose propped up on a drift (so, hanging in the belt, the driver sees the snow above and the night
		// below through the glass, and anything standing out there whole, upside down)
		float FaceYaw = Yaw, Rise = -1e9f;
		if (!FMath::IsNaN(GroundAt(At)))
		{
			const float g0 = GroundAt(At);
			for (int32 k = 0; k < 16; ++k)
			{
				const float a = Yaw + 22.5f * k;
				const FVector D = FRotator(0.f, a, 0.f).Vector();
				float r = 0.f;
				int32 n = 0;
				for (const float d : {900.f, 1400.f, 2000.f})
				{
					const float g = GroundAt(At + D * d);
					if (!FMath::IsNaN(g))
					{
						r += FMath::Clamp((g - g0) / d, -0.3f, 0.3f);
						++n;
					}
				}
				r = n ? r / n : -1.f;
				// (open snow ahead, rising only a little: the beam reaches out across it, and whatever crosses it is seen)
				r = -FMath::Abs(r - 0.03f) - 0.02f * FMath::Abs(FMath::FindDeltaAngleDegrees(a, Yaw)) / 180.f;
				if (r > Rise)
				{
					Rise = r;
					FaceYaw = a;
				}
			}
		}
		if (!TownRestAt.IsNearlyZero())
		{
			// (the owner: it ends up at the edge of an abandoned town, not by another road: at the head of its street,
			// looking down it, the beam across the buildings; moved there in the black, where the fall left it near)
			const float g = GroundAt(TownRestAt);
			At = FVector(TownRestAt.X, TownRestAt.Y, FMath::IsNaN(g) ? TownRestAt.Z : g);
			FaceYaw = TownRestYaw;
			UE_LOG(LogTemp, Display, TEXT("EndingDirector: left at the head of the town's street, %.0f m from where it stopped"), FVector::Dist2D(At, Rest) / 100.f);
		}
		Body->SetActorLocationAndRotation(At + FVector(0.f, 0.f, 63.f), FRotator(-5.f, FaceYaw, 178.f));
		UE_LOG(LogTemp, Display, TEXT("EndingDirector: on its roof facing %.0f deg (the snow ahead off level by %.0f%%), nose a little down"), FaceYaw, -Rise * 100.f);
		if (ShellPts.Num() > 0 && Car)
		{
			// rested on the snow: raised or lowered so that its lowest point (of its real shell) just touches it
			const FTransform CT = Car->GetActorTransform();
			float Lift = -1e9f;
			for (const FVector& L : ShellPts)
			{
				const FVector P = CT.TransformPosition(L);
				Lift = FMath::Max(Lift, GroundBelow(P, 400.f) - P.Z);
			}
			Body->AddActorWorldOffset(FVector(0.f, 0.f, Lift));
			// what is above and below where it was left (anything at all, whatever its collision)
			TArray<FHitResult> Hs;
			FCollisionQueryParams Qg(TEXT("RestOn"), true, Body);
			Qg.AddIgnoredActor(Car);
			FCollisionObjectQueryParams Og(FCollisionObjectQueryParams::AllObjects);
			FHitResult Hd, Hu;
			if (GetWorld()->LineTraceSingleByObjectType(Hd, Rest, Rest - FVector(0.f, 0.f, 100000.f), Og, Qg))
			{
				Hs.Add(Hd);
			}
			if (GetWorld()->LineTraceSingleByObjectType(Hu, Rest, Rest + FVector(0.f, 0.f, 100000.f), Og, Qg))
			{
				Hs.Add(Hu);
			}
			for (const FHitResult& Hg : Hs)
			{
				UE_LOG(LogTemp, Display, TEXT("EndingDirector:   over/under where it stopped: %s of %s at z %.0f"), *GetNameSafe(Hg.GetComponent()), *GetNameSafe(Hg.GetActor()), Hg.ImpactPoint.Z);
			}
			UE_LOG(LogTemp, Display, TEXT("EndingDirector:   it stopped at %s"), *Rest.ToString());
			UE_LOG(LogTemp, Display, TEXT("EndingDirector: on its roof, moved %.1f cm up to rest on the snow"), Lift);
		}
		if (Arms)
		{
			Arms->SetActorHiddenInGame(true);          // the hands fall away from the wheel, out of sight
		}
		UE_LOG(LogTemp, Display, TEXT("EndingDirector: left on its roof at %s (%.0f m from where it stopped, the ground falling %.0f%%)"),
			*At.ToString(), FVector::Dist2D(At, Rest) / 100.f, Best * 100.f);
		PrevPos = Body->GetActorLocation();
		bPrevShell = false;                        // (moved there in the black: not a path it travelled)
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
	// (checking: what the eyes see once they are open, across the picture: each thing, how far, its material)
	// (checking, without a whole capture: a few stills of what the eyes see after they open, and the walker crossing)
	static int32 StillsTaken = 0;
	static const bool bStills = FParse::Param(FCommandLine::Get(), TEXT("viewstills"));
	if (bStills && bWoke && StillsTaken < 7 && RealTime >= WakeReal + 1.5f + 2.f * StillsTaken)
	{
		FScreenshotRequest::RequestScreenshot(FPaths::Combine(FPaths::ProjectSavedDir(), TEXT("Capture"), TEXT("viewstills"),
			FString::Printf(TEXT("still_%d.png"), StillsTaken)), false, false);
		++StillsTaken;
	}
	static bool bViewProbed = false;
	if (bClipCheck && bWoke && !bViewProbed && Cam && RealTime >= WakeReal + 1.5f)
	{
		bViewProbed = true;
		const FVector E = Cam->GetCameraLocation();
		const FRotator Rv = Cam->GetCameraRotation();
		const float Hh = FMath::Tan(FMath::DegreesToRadians(Cam->GetFOVAngle() * 0.5f)), Vh = Hh * 9.f / 16.f;
		const FVector F = Rv.Vector(), Rt = FRotationMatrix(Rv).GetScaledAxis(EAxis::Y), Up = FRotationMatrix(Rv).GetScaledAxis(EAxis::Z);
		UE_LOG(LogTemp, Display, TEXT("ViewProbe eye %s looking %s (fov %.0f)"), *E.ToString(), *Rv.ToString(), Cam->GetFOVAngle());
		FCollisionQueryParams Q(TEXT("ViewProbe"), true, Body);
		Q.bReturnFaceIndex = true;
		Q.bReturnPhysicalMaterial = false;
		// (past the car itself and everything riding on it: what is out there)
		if (Car)
		{
			Q.AddIgnoredActor(Car);
			TArray<AActor*> On;
			Car->GetAttachedActors(On, true, true);
			Q.AddIgnoredActors(On);
		}
		if (SolidHolder)
		{
			Q.AddIgnoredActor(SolidHolder);
		}
		for (TActorIterator<AActor> It(GetWorld()); It; ++It)
		{
			for (AActor* Up2 = It->GetAttachParentActor(); Up2; Up2 = Up2->GetAttachParentActor())
			{
				if (Up2 == Body || Up2 == Car)
				{
					Q.AddIgnoredActor(*It);
					break;
				}
			}
		}
		for (int32 j = 0; j < 5; ++j)
		{
			for (int32 i = 0; i < 7; ++i)
			{
				// (picture x from its left, y from its top, -1..1)
				const float px = -1.f + 2.f * i / 6.f, py = -1.f + 2.f * j / 4.f;
				const FVector D = (F + Rt * px * Hh - Up * py * Vh).GetSafeNormal();
				FHitResult Hp;
				if (GetWorld()->LineTraceSingleByObjectType(Hp, E, E + D * 6000.f, FCollisionObjectQueryParams(FCollisionObjectQueryParams::AllObjects), Q))
				{
					FString Mat = TEXT("?");
					if (UPrimitiveComponent* Pc = Hp.GetComponent())
					{
						int32 Sec = 0;
						if (UMaterialInterface* Mi = Pc->GetMaterialFromCollisionFaceIndex(Hp.FaceIndex, Sec))
						{
							Mat = Mi->GetName();
						}
					}
					UE_LOG(LogTemp, Display, TEXT("ViewProbe (%+.2f, %+.2f) %s %s at %.0f cm, material %s"), px, py, *GetNameSafe(Hp.GetActor()),
						Hp.GetComponent() ? *Hp.GetComponent()->GetName() : TEXT(""), Hp.Distance, *Mat);
				}
				else
				{
					UE_LOG(LogTemp, Display, TEXT("ViewProbe (%+.2f, %+.2f) nothing"), px, py);
				}
			}
		}
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
			Headlights[i]->SetIntensity(HeadlightBase[i] * 0.35f * Dip * (0.62f + 0.38f * (0.5f + 0.5f * FMath::Sin(RealTime * 37.f))));
		}
	}
	// a tall shape walking slowly across the beam, out in the snow
	if (bWoke && !bSilhouette && RealTime >= WakeReal + SilhouetteAfterWake && Body)
	{
		bSilhouette = true;
		const FVector F = Body->GetActorForwardVector().GetSafeNormal2D();
		const FVector R = FVector::CrossProduct(FVector::UpVector, F);
		WalkDir = R;
		WalkFrom = Body->GetActorLocation() + F * 1200.f - R * 1150.f;   // out of sight to begin with: it walks into the beam
		if (!TownRestAt.IsNearlyZero())
		{
			// (in the town: out of the alley between the saloon and the store, across the street in the beam, into the gap
			// between the shed and the cabin; tools/make_town.py's street, the car 3 m above its head)
			WalkFrom = Body->GetActorLocation() + F * 1450.f - R * 1400.f;
		}
		WalkS = 0.f;
		FActorSpawnParameters P;
		P.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
		Walker = GetWorld()->SpawnActor<AHusk>(AHusk::StaticClass(), FTransform(WalkFrom), P);
		if (Walker && Walker->Setup())
		{
			Walker->SetActorScale3D(FVector(HuskScale));
			Walker->Play(TEXT("Stalk"), true);
			Walker->GetBody()->SetPlayRate(1.f);
			Walker->JawOpen = 5.f;
			WalkReal = RealTime;
			Walker->KeepOutLate = [this](AHusk* Me) { KeepOut(Me, FVector::ZeroVector, TEXT("the walker")); };
			if (!TownRestAt.IsNearlyZero())
			{
				// (in the town's own moonlight as well: build_town.py's 'Town moon' lights lighting channel 1)
				TArray<UPrimitiveComponent*> Ps;
				Walker->GetComponents<UPrimitiveComponent>(Ps);
				for (UPrimitiveComponent* Pc : Ps)
				{
					Pc->SetLightingChannels(true, true, false);
				}
			}
			Event(TEXT("silhouette"));
		}
	}
	if (Walker)
	{
		// its stalk (0.67 m/s at its model's size); it stops a moment in the light, as if listening, then goes on
		const float w = RealTime - WalkReal;
		const float Rate = FMath::Lerp(1.f, 0.08f, Smooth((w - 3.6f) / 0.6f) * (1.f - Smooth((w - 6.f) / 0.7f)));
		Walker->GetBody()->SetPlayRate(Rate * 1.2f);
		WalkS += 67.f * HuskScale * Rate * 1.2f * RealDt;
		FVector P = WalkFrom + WalkDir * WalkS;
		P.Z = CreatureGround(P);
		const float Yaw = FMath::RadiansToDegrees(FMath::Atan2(WalkDir.Y, WalkDir.X));
		Walker->SetActorLocationAndRotation(P, FRotator(0.f, Yaw, 0.f).Quaternion() * FRotator(0.f, -Walker->MeshForwardYaw(), 0.f).Quaternion());
		if (!Walker->HasSurface())
		{
			Walker->AddActorWorldOffset(FVector(0.f, 0.f, Walker->GroundLift([this](const FVector& At) { return CreatureGround(At); })));
		}
		if (w > 14.f)
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

float AEndingDirector::SwerveOff(float t) const
{
	// the driver wrenching the wheel to throw it off: hard left, hard right, a smaller one back, straightened; each turn
	// eased in and out (the car's side-shift, cm, + right of its path), 0 before and after
	static const FVector2D K[] = {FVector2D(0.f, 0.f), FVector2D(0.7f, 0.f), FVector2D(1.35f, -48.f), FVector2D(2.15f, 52.f),
		FVector2D(2.9f, -18.f), FVector2D(3.55f, 0.f)};
	if (t <= K[0].X || t >= K[UE_ARRAY_COUNT(K) - 1].X)
	{
		return 0.f;
	}
	for (int32 i = 1; i < (int32)UE_ARRAY_COUNT(K); ++i)
	{
		if (t <= K[i].X)
		{
			const float u = (t - K[i - 1].X) / (K[i].X - K[i - 1].X);
			return FMath::Lerp(K[i - 1].Y, K[i].Y, u * u * (3.f - 2.f * u));
		}
	}
	return 0.f;
}

float AEndingDirector::CarDip() const
{
	// the car's nose (degrees, + up): jolted as it lands on the roof (its weight a little forward of the middle, more so as
	// it creeps to the front edge) and held down a little; kicked up as it springs off the back; its feet on the roof as it goes
	float p = 0.f;
	if (RiseT0 >= 0.f)
	{
		const float g = Time - RiseT0;
		if (g > 0.f)
		{
			p += -1.5f * FMath::Exp(-4.f * g) * FMath::Sin(10.f * g + 0.4f);
			p += -0.5f * Smooth(g / 0.4f) * (LeapT0 < 0.f ? 1.f : FMath::Exp(-6.f * FMath::Max(0.f, Time - LeapT0)));
		}
	}
	// each blow on the windshield: the nose shoved down on its springs and rocking back (as hard as it struck)
	for (int32 k = 0; k < 2; ++k)
	{
		if (BlowT[k] >= 0.f && Time > BlowT[k])
		{
			const float g = Time - BlowT[k];
			const float A = FMath::Clamp(BlowS[k] / 500.f, 0.4f, 1.4f) * (k == 0 ? 1.8f : 0.8f);
			p += -A * FMath::Exp(-5.f * g) * FMath::Sin(13.f * g);
		}
	}
	if (LeapT0 >= 0.f)
	{
		const float l = Time - LeapT0;
		p += 1.6f * FMath::Exp(-4.f * l) * FMath::Sin(10.f * l);
		for (const float k : {0.35f, 0.5f})
		{
			const float q = l - k;
			if (q > 0.f)
			{
				p += -0.7f * FMath::Exp(-6.f * q) * FMath::Sin(14.f * q);
			}
		}
	}
	return p;
}

float AEndingDirector::CarClear(AHusk* H, const FVector& Dir, FString* What)
{
	TArray<UPrimitiveComponent*> Parts;
	const FBox Near = H->GetComponentsBoundingBox(true).ExpandBy(60.f);
	for (UPrimitiveComponent* P : CarParts)
	{
		if (P && P->Bounds.GetBox().Intersect(Near))
		{
			Parts.Add(P);
		}
	}
	const UMaterialInterface* Skip = bSideGlassGone ? SideGlassMID.Get() : nullptr;
	// its visible surface (skin, claws, fur, face), and its collision bodies for anything the surface points miss
	FString Ws;
	FName Wb;
	// (its simplified collision bodies are fatter than its limbs: they only stand in when its surface is not known)
	const bool bSurface = H->HasSurface();
	const float Surf = bSurface ? H->PushClearSurface(Parts, Dir, 300.f, Skip, &Ws) : 0.f;
	const float Bodies = bSurface ? 0.f : H->PushClear(Parts, Dir, 300.f, Skip, &Wb);
	if (What)
	{
		*What = bSurface ? Ws : FString::Printf(TEXT("its %s (collision body)"), *Wb.ToString());
	}
	const float Push = FMath::Min(FMath::Max(Surf, Bodies), 80.f);
	if (bClipCheck && Push > 10.f && Car)
	{
		const FTransform C = Car->GetActorTransform();
		const FVector Pp = C.InverseTransformPosition(H->LastWorstAt), Hh = C.InverseTransformPosition(H->LastWorstHit);
		UE_LOG(LogTemp, Display, TEXT("CarClearWorst %.2f: %s at car (%.0f, %.0f, %.0f), under the car's surface at (%.0f, %.0f, %.0f): %.1f cm"), Time - RiseT0, What ? **What : TEXT(""), Pp.X, Pp.Y, Pp.Z, Hh.X, Hh.Y, Hh.Z, Push);
	}
	if (Push > 0.f)
	{
		H->AddActorWorldOffset(Dir.GetSafeNormal() * (Push + 0.3f));
	}
	return Push;
}

void AEndingDirector::GatherSolids()
{
	// the forest's trunks (the spruces' own, tapering from about a 70th of the tree's height across at the foot) and the
	// roadside's posts and poles (their meshes' boxes); not the posts of the stretch of rail that gives way
	Solids.Reset();
	int32 Trunks = 0, Props = 0;
	for (TActorIterator<AScatter> It(GetWorld()); It; ++It)
	{
		if (It->ActorHasTag(TEXT("GuardrailBreak")) || It->GetActorNameOrLabel().Contains(TEXT("reflector")))
		{
			continue;
		}
		TArray<UInstancedStaticMeshComponent*> Ism;
		It->GetComponents(Ism);
		for (UInstancedStaticMeshComponent* I : Ism)
		{
			UStaticMesh* M = I ? I->GetStaticMesh() : nullptr;
			if (!M)
			{
				continue;
			}
			const FBox LB = M->GetBoundingBox();
			const bool bTree = M->GetName().StartsWith(TEXT("Spruce"));
			for (int32 i = 0; i < I->GetInstanceCount(); ++i)
			{
				FTransform T;
				if (!I->GetInstanceTransform(i, T, true))
				{
					continue;
				}
				const FVector Sc = T.GetScale3D().GetAbs();
				FSolid S;
				if (bTree)
				{
					const float Hm = LB.Max.Z - LB.Min.Z;
					S.bTrunk = true;
					S.R = FMath::Max(4.f, Hm / 70.f) * Sc.X;
					S.H = FMath::Min(Hm * Sc.Z, 600.f);
					S.T = FTransform(T.GetLocation() + FVector(0.f, 0.f, LB.Min.Z * Sc.Z));
					++Trunks;
				}
				else
				{
					S.Ext = LB.GetExtent() * Sc;
					if (S.Ext.GetMax() < 8.f)
					{
						continue;
					}
					S.T = FTransform(T.GetRotation(), T.TransformPosition(LB.GetCenter()));
					++Props;
				}
				Solids.Add(S);
			}
		}
	}
	UE_LOG(LogTemp, Display, TEXT("EndingDirector: solid things: %d trunks, %d posts and poles"), Trunks, Props);
}

void AEndingDirector::SolidNear(const FVector& At, float Radius)
{
	for (FSolid& S : Solids)
	{
		if (S.bMade || FVector::DistSquared2D(S.T.GetLocation(), At) > FMath::Square(Radius + S.R + S.Ext.Size()))
		{
			continue;
		}
		if (!SolidHolder)
		{
			FActorSpawnParameters P;
			P.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
			SolidHolder = GetWorld()->SpawnActor<AActor>(AActor::StaticClass(), FTransform::Identity, P);
			USceneComponent* Root = NewObject<USceneComponent>(SolidHolder, TEXT("Root"));
			SolidHolder->SetRootComponent(Root);
			Root->RegisterComponent();
		}
		S.bMade = true;
		UShapeComponent* C = nullptr;
		if (S.bTrunk)
		{
			UCapsuleComponent* Cap = NewObject<UCapsuleComponent>(SolidHolder);
			Cap->SetCapsuleSize(S.R, 0.5f * S.H);
			C = Cap;
		}
		else
		{
			UBoxComponent* Box = NewObject<UBoxComponent>(SolidHolder);
			Box->SetBoxExtent(S.Ext);
			C = Box;
		}
		C->SetupAttachment(SolidHolder->GetRootComponent());
		C->SetCollisionProfileName(TEXT("BlockAll"));
		C->RegisterComponent();
		C->SetWorldTransform(S.bTrunk ? FTransform(S.T.GetLocation() + FVector(0.f, 0.f, 0.5f * S.H)) : S.T);
	}
}

void AEndingDirector::KeepOut(AHusk* H, const FVector& CarDir, const TCHAR* Who)
{
	if (!H || !H->GetBody())
	{
		return;
	}
	SolidNear(H->GetActorLocation(), 800.f);
	TArray<const AActor*> Ignore = {Car.Get(), Body.Get(), Camera.Get(), Letter.Get(), Creature.Get(), Walker.Get()};
	if (Arms)
	{
		Ignore.Add(Arms.Get());
	}
	if (Car)
	{
		TArray<AActor*> On;
		Car->GetAttachedActors(On, true, true);
		for (AActor* A : On)
		{
			Ignore.Add(A);
		}
	}
	auto Ground = [this](const FVector& At) { return GroundBelow(At); };
	auto IsGround = [](const UPrimitiveComponent* P)
	{
		// (the ground is kept under it by GroundIn, not pushed out of sideways; the rail's own simple collision is one
		// hull round its whole run, so it is left out)
		const UStaticMeshComponent* S = Cast<UStaticMeshComponent>(P);
		const FString N = S && S->GetStaticMesh() ? S->GetStaticMesh()->GetName() : FString();
		return N.StartsWith(TEXT("Terrain")) || N == TEXT("Road") || N == TEXT("Town_Ground") || (P->GetOwner() && P->GetOwner()->ActorHasTag(TEXT("Guardrail")));
	};
	const FString W(Who);
	// gravity (the owner: it floated, "add physics"): unless it is in the air (dropping onto the bonnet, leaping off it),
	// it falls, at g, until its lowest points rest on what is under them (the bonnet, the roof, the snow)
	float Settled = 0.f;
	{
		const bool bAir = H == Creature && (CreStage == 51 || CreStage == 60);
		if (bAir)
		{
			H->SettleDrop = H->SettleSpeed = 0.f;
		}
		else
		{
			TArray<UPrimitiveComponent*> Under;
			const FBox Around = H->GetComponentsBoundingBox(true).ExpandBy(80.f);
			for (UPrimitiveComponent* P : CarParts)
			{
				if (P && P->Bounds.GetBox().Intersect(Around))
				{
					Under.Add(P);
				}
			}
			auto SurfaceAt = [this, &Under](const FVector& At)
			{
				float Z = GroundBelow(At, 60.f);
				FCollisionQueryParams Q(TEXT("RestsOn"), true);
				for (UPrimitiveComponent* P : Under)
				{
					FHitResult Hh;
					if (P->LineTraceComponent(Hh, At + FVector(0.f, 0.f, 60.f), At - FVector(0.f, 0.f, 400.f), Q))
					{
						Z = FMath::Max(Z, Hh.ImpactPoint.Z);
					}
				}
				return Z;
			};
			const float Dt = FMath::Max(GetWorld()->GetDeltaSeconds(), 1e-3f);
			const float Want = FMath::Clamp(H->SupportGap(SurfaceAt), 0.f, 300.f);     // down to resting on it, never into it
			if (Want > H->SettleDrop + 0.1f)
			{
				H->SettleSpeed += 980.f * Dt;
				H->SettleDrop = FMath::Min(Want, H->SettleDrop + H->SettleSpeed * Dt);
				if (H->SettleDrop >= Want)
				{
					H->SettleSpeed = 0.f;         // landed
				}
			}
			else
			{
				H->SettleDrop = Want;
				H->SettleSpeed = 0.f;
			}
			H->AddActorWorldOffset(FVector(0.f, 0.f, -H->SettleDrop));
			Settled = H->SettleDrop;
		}
	}
	// first its hands, feet and face are put on what they touch (contact IK, on the body that is drawn); only what is
	// left over moves it as a whole
	FString IKWhat;
	float IKMove = 0.f;
	{
		TArray<UPrimitiveComponent*> Near;
		if (!CarDir.IsNearlyZero())
		{
			const FBox Around = H->GetComponentsBoundingBox(true).ExpandBy(60.f);
			for (UPrimitiveComponent* P : CarParts)
			{
				if (P && P->Bounds.GetBox().Intersect(Around))
				{
					Near.Add(P);
				}
			}
		}
		const UMaterialInterface* Skip = bSideGlassGone ? SideGlassMID.Get() : nullptr;
		IKMove = H->ContactIK(Near, CarDir, Skip, Ground, &IKWhat);
	}
	FString What;
	const float WorldIn = H->PushOutOfWorld(Ignore, IsGround, true, &What);
	// the ground under its collision bodies and under its lowest visible points (claws, toes)
	const float GroundIn = H->HasSurface() ? H->GroundInSurface(Ground) : H->GroundIn(Ground);   // (its real surface: its collision shapes are fatter than its legs)
	if (GroundIn > 0.f)
	{
		H->AddActorWorldOffset(FVector(0.f, 0.f, GroundIn + 0.3f));
	}
	FString CarWhat;
	const float CarIn = CarDir.IsNearlyZero() ? 0.f : CarClear(H, CarDir, &CarWhat);
	// (hanging its head: how far all that moved it after the hang was solved, for the next frame's aim)
	H->HangAfter = H->HangW > 0.f ? H->GetActorLocation().Z - H->HangActorZ : 0.f;
	static float NextProbe = 0.f;
	if (bClipCheck && Car && H == Creature && CreStage == 6 && RealTime >= NextProbe)
	{
		// (checking the check: where its head is, in the car's frame, and what a ray down onto it meets)
		NextProbe = RealTime + 1.f;
		const FTransform CT = Car->GetActorTransform();
		const FVector Head = H->GetBody()->GetBoneTransform(H->GetBody()->GetBoneIndex(TEXT("head"))).GetLocation();
		TArray<AHusk::FShape> Sh;
		H->Shapes(Sh);
		UE_LOG(LogTemp, Display, TEXT("Probe %.2f: it at %s, head at %s (car frame); %d shapes, %d car parts"), RealTime,
			*CT.InverseTransformPosition(H->GetActorLocation()).ToString(), *CT.InverseTransformPosition(Head).ToString(), Sh.Num(), CarParts.Num());
		for (UPrimitiveComponent* P : CarParts)
		{
			FHitResult Hd, Hf;
			FCollisionQueryParams Qp(TEXT("Probe"), true);
			const bool bD = P && P->LineTraceComponent(Hd, Head + FVector(0.f, 0.f, 300.f), Head, Qp);
			const bool bF = P && P->LineTraceComponent(Hf, Head + CT.GetUnitAxis(EAxis::X) * 300.f, Head, Qp);
			UE_LOG(LogTemp, Display, TEXT("Probe   %s: down onto the head %s (z %.0f), from ahead %s (x %.0f); collision %d, bounds %s"), *GetNameSafe(P ? P->GetOwner() : nullptr),
				bD ? TEXT("HIT") : TEXT("nothing"), bD ? CT.InverseTransformPosition(Hd.ImpactPoint).Z : 0.f, bF ? TEXT("HIT") : TEXT("nothing"),
				bF ? CT.InverseTransformPosition(Hf.ImpactPoint).X : 0.f, P ? (int32)P->GetCollisionEnabled() : -1,
				P ? *P->Bounds.GetBox().ToString() : TEXT(""));
		}
		if (Sh.Num() > 0)
		{
			UE_LOG(LogTemp, Display, TEXT("Probe   shape 0 %s (%s) r %.0f"), *Sh[0].Bone.ToString(), *CT.InverseTransformPosition(Sh[0].A).ToString(), Sh[0].R);
		}
	}
	// (where its head is, as it will be drawn this frame)
	if (bClipCheck && Car && H == Creature && ((CreStage == 6 && Time - RiseT0 > 3.3f && Time - RiseT0 < 5.2f) || CreStage == 73))
	{
		const FTransform C = Car->GetActorTransform();
		const FVector Hd = C.InverseTransformPosition(H->HeadAt()), Sh = C.InverseTransformPosition(H->DrawnAt(TEXT("spine_05")));
		UE_LOG(LogTemp, Display, TEXT("PoseLog %.3f spine %.2f curl %.2f slide %.1f %.1f head %.1f %.1f %.1f chest %.1f %.1f %.1f"), Time - RiseT0,
			H->HangSpineDeg, H->HangCurlDeg, H->HangSlide.X, H->HangSlide.Y, Hd.X, Hd.Y, Hd.Z, Sh.X, Sh.Y, Sh.Z);
	}
	static float NextHeadLog = 0.f;
	if (bClipCheck && Car && H == Creature && CreStage == 6 && RealTime >= NextHeadLog)
	{
		NextHeadLog = RealTime + 0.5f;
		const FTransform C = Car->GetActorTransform();
		const float r = Time - RiseT0;
		const FVector Hd = C.InverseTransformPosition(H->HeadAt()), Fc = C.InverseTransformPosition(H->FaceAt()), Pl = C.InverseTransformPosition(H->GetBody()->GetSocketLocation(TEXT("pelvis")));
		const FVector Want = C.InverseTransformPosition(H->HangHead), Sl = C.Rotator().UnrotateVector(H->HangSlide);
		const FVector Aim = C.InverseTransformPosition(H->HangAimed), Got = C.InverseTransformPosition(H->HangGot);
		if (Camera)
		{
			const FVector Cm = C.InverseTransformPosition(Camera->GetActorLocation()), Cf = C.InverseTransformVectorNoScale(Camera->GetActorForwardVector());
			const FVector Hj = C.InverseTransformPosition(H->HeadAt());
			UE_LOG(LogTemp, Display, TEXT("HeadProbe   eye at car (%.0f, %.0f, %.0f) looking %.0f deg up; its head joint %.0f deg up from the eye; car scale %s"), Cm.X, Cm.Y, Cm.Z,
				FMath::RadiansToDegrees(FMath::Asin(FMath::Clamp(Cf.Z, -1.f, 1.f))), FMath::RadiansToDegrees(FMath::Atan2(Hj.Z - Cm.Z, FMath::Max(1.f, Hj.X - Cm.X))), *C.GetScale3D().ToString());
		}
		{
			auto Cf = [&C, H](const TCHAR* B) { return C.InverseTransformPosition(H->DrawnAt(B)); };
			const FVector Shl = Cf(TEXT("upperarm_l")), El = Cf(TEXT("lowerarm_l")), Hl = Cf(TEXT("hand_l")), Sr = Cf(TEXT("upperarm_r")), Er = Cf(TEXT("lowerarm_r")), Hr = Cf(TEXT("hand_r"));
			UE_LOG(LogTemp, Display, TEXT("HeadProbe   arms (car): left shoulder (%.0f %.0f %.0f) elbow (%.0f %.0f %.0f) hand (%.0f %.0f %.0f); right shoulder (%.0f %.0f %.0f) elbow (%.0f %.0f %.0f) hand (%.0f %.0f %.0f)"),
				Shl.X, Shl.Y, Shl.Z, El.X, El.Y, El.Z, Hl.X, Hl.Y, Hl.Z, Sr.X, Sr.Y, Sr.Z, Er.X, Er.Y, Er.Z, Hr.X, Hr.Y, Hr.Z);
		}
		UE_LOG(LogTemp, Display, TEXT("HeadProbe   solve aimed its head at car (%.0f, %.0f, %.0f), got (%.0f, %.0f, %.0f) right after; settle %.1f (this frame %.1f), contact IK %.1f (%s), out of the car %.1f (%s), out of the ground %.1f"), Aim.X, Aim.Y, Aim.Z, Got.X, Got.Y, Got.Z, H->SettleDrop, Settled, IKMove, *IKWhat, CarIn, *CarWhat, GroundIn);
		UE_LOG(LogTemp, Display, TEXT("HeadProbe %.2f: hang %.2f curl %.2f (spine %.0f deg, curl %.0f deg, slide %.0f %.0f), head at car (%.0f, %.0f, %.0f) want (%.0f, %.0f, %.0f), face (%.0f, %.0f, %.0f) [%.0f deg up from the eye], pelvis (%.0f, %.0f, %.0f)"), r, H->HangW, H->HangCurl,
			H->HangSpineDeg, H->HangCurlDeg, Sl.X, Sl.Y, Hd.X, Hd.Y, Hd.Z, Want.X, Want.Y, Want.Z, Fc.X, Fc.Y, Fc.Z,
			FMath::RadiansToDegrees(FMath::Atan2(Fc.Z - CamRest.Z, FMath::Max(1.f, Fc.X - CamRest.X))), Pl.X, Pl.Y, Pl.Z);
	}
	if (!bClipCheck)
	{
		return;
	}
	NoteClip(W + TEXT(" placed on what it touches by contact IK"), IKMove, FString::Printf(TEXT("its %s, stage %d"), *IKWhat, CreStage));
	NoteClip(W + TEXT(" dropped onto what it rests on (gravity)"), Settled, FString::Printf(TEXT("stage %d"), CreStage));
	if (!(H == Creature && (CreStage == 51 || CreStage == 60)))
	{
		// what is left: hovering over what it should rest on (after everything that moved it this frame)
		TArray<UPrimitiveComponent*> Under;
		const FBox Around = H->GetComponentsBoundingBox(true).ExpandBy(80.f);
		for (UPrimitiveComponent* P : CarParts)
		{
			if (P && P->Bounds.GetBox().Intersect(Around))
			{
				Under.Add(P);
			}
		}
		const float Hover = H->SupportGap([this, &Under](const FVector& At)
		{
			float Z = GroundBelow(At, 60.f);
			FCollisionQueryParams Q(TEXT("RestsOn"), true);
			for (UPrimitiveComponent* P : Under)
			{
				FHitResult Hh;
				if (P->LineTraceComponent(Hh, At + FVector(0.f, 0.f, 60.f), At - FVector(0.f, 0.f, 400.f), Q))
				{
					Z = FMath::Max(Z, Hh.ImpactPoint.Z);
				}
			}
			return Z;
		});
		NoteClip(W + TEXT(" FLOATING over what it rests on"), FMath::Min(Hover, 300.f), FString::Printf(TEXT("stage %d"), CreStage));
	}
	NoteClip(W + TEXT(" pushed out of solid things"), WorldIn, What);
	NoteClip(W + TEXT(" lifted out of the ground"), GroundIn, TEXT("terrain"));
	NoteClip(W + TEXT(" pushed out of the car"), CarIn, FString::Printf(TEXT("%s, stage %d"), *CarWhat, CreStage));
	// what is left after the pushes: the clipping that would show
	FString Left;
	NoteClip(W + TEXT(" STILL in solid things"), H->PushOutOfWorld(Ignore, IsGround, false, &Left), Left);
	NoteClip(W + TEXT(" STILL in the ground"), H->HasSurface() ? H->GroundInSurface(Ground) : H->GroundIn(Ground), TEXT("terrain"));
	if (Car && CarParts.Num() > 0)
	{
		TArray<UPrimitiveComponent*> Parts;
		const FBox Near = H->GetComponentsBoundingBox(true).ExpandBy(60.f);
		for (UPrimitiveComponent* P : CarParts)
		{
			if (P && P->Bounds.GetBox().Intersect(Near))
			{
				Parts.Add(P);
			}
		}
		if (Parts.Num() > 0)
		{
			const UMaterialInterface* Skip = bSideGlassGone ? SideGlassMID.Get() : nullptr;
			const FTransform CT = Car->GetActorTransform();
			// its collision bodies, and its visible surface (with no margin: any point of it inside the car at all)
			float In = 1e9f, Seen = 1e9f;
			FString SeenWhat;
			for (const EAxis::Type Ax : {EAxis::X, EAxis::Y, EAxis::Z})
			{
				for (const float Sg : {1.f, -1.f})
				{
					if (Ax == EAxis::Z && Sg < 0.f)
					{
						continue;
					}
					const FVector D = CT.GetUnitAxis(Ax) * Sg;
					In = FMath::Min(In, H->PushClear(Parts, D, 300.f, Skip));
					FString Wd;
					const float Sd = H->PushClearSurface(Parts, D, 300.f, Skip, &Wd, 0.f);
					if (Sd < Seen)
					{
						Seen = Sd;
						SeenWhat = Wd;
					}
				}
			}
			NoteClip(W + TEXT(" STILL in the car (collision bodies)"), In, TEXT("car"));
			NoteClip(W + TEXT(" STILL in the car (what is seen: skin, claws, fur, face)"), Seen, SeenWhat);
		}
	}
}

void AEndingDirector::SampleShell()
{
	// the car's outer surface: rays from outside along its three axes, 12 cm apart, the first surface each meets
	ShellPts.Reset();
	if (!Car || CarParts.Num() == 0)
	{
		return;
	}
	const FTransform CT = Car->GetActorTransform();
	FBox LB(ForceInit);
	for (UPrimitiveComponent* P : CarParts)
	{
		if (!P)
		{
			continue;
		}
		const FBox WB = P->Bounds.GetBox();
		for (int32 c = 0; c < 8; ++c)
		{
			LB += CT.InverseTransformPosition(FVector(c & 1 ? WB.Max.X : WB.Min.X, c & 2 ? WB.Max.Y : WB.Min.Y, c & 4 ? WB.Max.Z : WB.Min.Z));
		}
	}
	LB = LB.ExpandBy(10.f);
	FCollisionQueryParams Q(TEXT("Shell"), true);
	TSet<FIntVector> Seen;
	const float Step = 12.f;
	for (int32 a = 0; a < 3; ++a)
	{
		const int32 b = (a + 1) % 3, c = (a + 2) % 3;
		for (float u = LB.Min[b]; u <= LB.Max[b]; u += Step)
		{
			for (float v = LB.Min[c]; v <= LB.Max[c]; v += Step)
			{
				for (int32 sd = 0; sd < 2; ++sd)
				{
					FVector A0(0.f), A1(0.f);
					A0[b] = A1[b] = u;
					A0[c] = A1[c] = v;
					A0[a] = sd ? LB.Max[a] : LB.Min[a];
					A1[a] = sd ? LB.Min[a] : LB.Max[a];
					const FVector W0 = CT.TransformPosition(A0), W1 = CT.TransformPosition(A1);
					float BestD = 1e18f;
					FVector BestP = FVector::ZeroVector;
					for (UPrimitiveComponent* P : CarParts)
					{
						FHitResult H;
						if (P && P->LineTraceComponent(H, W0, W1, Q))
						{
							const float Dd = FVector::DistSquared(W0, H.ImpactPoint);
							if (Dd < BestD)
							{
								BestD = Dd;
								BestP = H.ImpactPoint;
							}
						}
					}
					if (BestD < 1e17f)
					{
						const FVector L = CT.InverseTransformPosition(BestP);
						const FIntVector K(FMath::FloorToInt(L.X / 8.f), FMath::FloorToInt(L.Y / 8.f), FMath::FloorToInt(L.Z / 8.f));
						if (!Seen.Contains(K))
						{
							Seen.Add(K);
							ShellPts.Add(L);
						}
					}
				}
			}
		}
	}
	UE_LOG(LogTemp, Display, TEXT("EndingDirector: the car's shell: %d points within %s (car frame)"), ShellPts.Num(), *LB.ToString());
	if (FParse::Param(FCommandLine::Get(), TEXT("carprofile")))
	{
		// the car's real surfaces where the creature touches them (car frame, cm), for its poses (tools/blender/husk_body.py):
		// the bonnet and windshield seen from above along lines down its length; the door and window seen from the left
		FCollisionQueryParams Qp(TEXT("Profile"), true);
		auto First = [&](const FVector& A, const FVector& B, FString& Part)
		{
			float Best = 1e18f;
			FVector At(NAN);
			for (UPrimitiveComponent* P : CarParts)
			{
				FHitResult H;
				if (P && P->LineTraceComponent(H, CT.TransformPosition(A), CT.TransformPosition(B), Qp) && FVector::DistSquared(CT.TransformPosition(A), H.ImpactPoint) < Best)
				{
					Best = FVector::DistSquared(CT.TransformPosition(A), H.ImpactPoint);
					At = CT.InverseTransformPosition(H.ImpactPoint);
					Part = GetNameSafe(Cast<UStaticMeshComponent>(P) ? Cast<UStaticMeshComponent>(P)->GetStaticMesh() : nullptr);
				}
			}
			return At;
		};
		for (const float Y : {-20.f, 0.f, 20.f, 40.f, 60.f})
		{
			FString Row;
			for (float X = 260.f; X >= -60.f; X -= 10.f)
			{
				FString Part;
				const FVector At = First(FVector(X, Y, 300.f), FVector(X, Y, 0.f), Part);
				Row += FString::Printf(TEXT(" %.0f:%.0f%s"), X, At.Z, Part.Contains(TEXT("Glass")) ? TEXT("g") : TEXT(""));
			}
			UE_LOG(LogTemp, Display, TEXT("CarProfile top y %.0f:%s"), Y, *Row);
		}
		for (const float X : {60.f, 30.f, 15.f, 0.f, -30.f})
		{
			FString Row;
			for (float Z = 160.f; Z >= 40.f; Z -= 8.f)
			{
				FString Part;
				const FVector At = First(FVector(X, -300.f, Z), FVector(X, 100.f, Z), Part);
				Row += FString::Printf(TEXT(" %.0f:%.0f%s"), Z, At.Y, Part.Contains(TEXT("Glass")) ? TEXT("g") : TEXT(""));
			}
			UE_LOG(LogTemp, Display, TEXT("CarProfile left x %.0f:%s"), X, *Row);
		}
	}
	WheelPts.Reset();
	if (ShellPts.Num() > 0)
	{
		float MinZ = 1e9f;
		FVector Mid = FVector::ZeroVector;
		for (const FVector& L : ShellPts)
		{
			MinZ = FMath::Min(MinZ, L.Z);
			Mid += L;
		}
		Mid /= ShellPts.Num();
		FVector Low[4];
		bool bHas[4] = {false, false, false, false};
		for (const FVector& L : ShellPts)
		{
			if (L.Z > MinZ + 15.f)
			{
				continue;
			}
			const int32 q = (L.X > Mid.X ? 1 : 0) + (L.Y > Mid.Y ? 2 : 0);
			if (!bHas[q] || L.Z < Low[q].Z)
			{
				Low[q] = L;
				bHas[q] = true;
			}
		}
		for (int32 q = 0; q < 4; ++q)
		{
			if (bHas[q])
			{
				WheelPts.Add(Low[q]);
				UE_LOG(LogTemp, Display, TEXT("EndingDirector:   tyre contact %s"), *Low[q].ToString());
			}
		}
	}
	for (UPrimitiveComponent* P : CarParts)
	{
		if (P)
		{
			FBox B(ForceInit);
			const FBox WB = P->Bounds.GetBox();
			for (int32 c = 0; c < 8; ++c)
			{
				B += CT.InverseTransformPosition(FVector(c & 1 ? WB.Max.X : WB.Min.X, c & 2 ? WB.Max.Y : WB.Min.Y, c & 4 ? WB.Max.Z : WB.Min.Z));
			}
			UE_LOG(LogTemp, Display, TEXT("EndingDirector:   car part %s of %s (%s): %s"), *P->GetName(), *GetNameSafe(P->GetOwner()),
				*GetNameSafe(Cast<UStaticMeshComponent>(P) ? Cast<UStaticMeshComponent>(P)->GetStaticMesh() : nullptr), *B.ToString());
		}
	}
}

float AEndingDirector::GroundBelow(const FVector& At, float Above) const
{
	TArray<FHitResult> Hits;
	FCollisionQueryParams Q(TEXT("GroundBelow"), true);
	if (Body)
	{
		Q.AddIgnoredActor(Body);
	}
	if (SolidHolder)
	{
		Q.AddIgnoredActor(SolidHolder);
	}
	GetWorld()->LineTraceMultiByChannel(Hits, At + FVector(0.f, 0.f, Above), At - FVector(0.f, 0.f, 6000.f), ECC_WorldStatic, Q);
	for (const FHitResult& H : Hits)
	{
		const UStaticMeshComponent* S = Cast<UStaticMeshComponent>(H.GetComponent());
		const FString N = S && S->GetStaticMesh() ? S->GetStaticMesh()->GetName() : FString();
		if (N.StartsWith(TEXT("Terrain")) || N == TEXT("Road") || N == TEXT("Town_Ground") ||
			(S && S->Bounds.SphereRadius > 5000.f && !(S->GetOwner() && S->GetOwner()->ActorHasTag(TEXT("Guardrail")))))
		{
			return H.ImpactPoint.Z;
		}
	}
	return At.Z - 6000.f;
}

void AEndingDirector::ShellCheck()
{
	// the car's shell against the ground, the trunks, posts and poles, and the rail (crossing it since the last look)
	if (!Car || ShellPts.Num() == 0)
	{
		return;
	}
	const FTransform CT = Car->GetActorTransform();
	TArray<const FSolid*, TInlineAllocator<64>> Near;
	for (const FSolid& S : Solids)
	{
		if (FVector::DistSquared2D(S.T.GetLocation(), CT.GetLocation()) < FMath::Square(800.f))
		{
			Near.Add(&S);
		}
	}
	float G = 0.f, So = 0.f, Rl = 0.f;
	FString What;
	FVector Deep = FVector::ZeroVector;
	FCollisionQueryParams Q(TEXT("ShellRail"), true);
	for (const FVector& L : ShellPts)
	{
		const FVector P = CT.TransformPosition(L);
		const float Gi = GroundBelow(P) - P.Z;
		if (Gi > G)
		{
			G = Gi;
			Deep = L;
		}
		for (const FSolid* S : Near)
		{
			float In = 0.f;
			if (S->bTrunk)
			{
				const FVector B = S->T.GetLocation();
				if (P.Z > B.Z - 20.f && P.Z < B.Z + S->H)
				{
					In = S->R - FVector::Dist2D(P, B);
				}
			}
			else
			{
				const FVector Lc = S->T.InverseTransformPosition(P);
				const FVector Qd = S->Ext - Lc.GetAbs();
				In = Qd.X > 0.f && Qd.Y > 0.f && Qd.Z > 0.f ? Qd.GetMin() : 0.f;
			}
			if (In > So)
			{
				So = In;
				What = S->bTrunk ? TEXT("a spruce's trunk") : TEXT("a post or pole");
			}
		}
		if (bPrevShell)
		{
			const FVector P0 = PrevShellT.TransformPosition(L);
			for (UPrimitiveComponent* Rc : RailParts)
			{
				FHitResult H;
				if (Rc && Rc->Bounds.GetBox().ExpandBy(50.f).IsInside(P) && Rc->LineTraceComponent(H, P0, P, Q))
				{
					Rl = FMath::Max(Rl, FVector::Dist(H.ImpactPoint, P));
				}
			}
		}
	}
	PrevShellT = CT;
	bPrevShell = true;
	NoteClip(TEXT("the car's shell in the ground"), G, FString::Printf(TEXT("its point at %.0f %.0f %.0f, car frame"), Deep.X, Deep.Y, Deep.Z));
	NoteClip(TEXT("the car's shell in trees, posts or poles"), So, What);
	NoteClip(TEXT("the car's shell through the guardrail"), Rl, TEXT("rail"));
}

FVector AEndingDirector::ClearEye(const FVector& Want)
{
	// the eye (a ball EyeRoom round) moved from where it rests toward where the head wants it, stopping at the car's
	// surfaces (its pillars, roof, door, glass)
	USceneComponent* Parent = Camera ? Camera->GetRootComponent()->GetAttachParent() : nullptr;
	if (!Parent || CarParts.Num() == 0)
	{
		return Want;
	}
	const FTransform PT = Parent->GetComponentTransform();
	const FVector From = PT.TransformPosition(CamRest), To = PT.TransformPosition(Want);
	if (FVector::DistSquared(From, To) < 0.01f)
	{
		return Want;
	}
	const FCollisionShape Ball = FCollisionShape::MakeSphere(EyeRoom);
	float Best = 1.f;
	FString What;
	for (UPrimitiveComponent* P : CarParts)
	{
		FHitResult H;
		if (P && P->SweepComponent(H, From, To, FQuat::Identity, Ball, true) && !H.bStartPenetrating && H.Time < Best)
		{
			Best = H.Time;
			What = P->GetName();
		}
	}
	if (Best >= 1.f)
	{
		return Want;
	}
	const FVector Got = FMath::Lerp(CamRest, Want, FMath::Max(0.f, Best - 0.02f));
	if (bClipCheck)
	{
		NoteClip(TEXT("the eye held off the car"), FVector::Dist(Got, Want), What);
	}
	return Got;
}

void AEndingDirector::NoteClip(const FString& Pair, float Depth, const FString& What)
{
	FClip& C = Clips.FindOrAdd(Pair);
	if (Depth <= 0.05f)
	{
		return;
	}
	if (Depth > C.Worst)
	{
		C.Worst = Depth;
		C.At = RealTime;
		C.What = What;
	}
	if (Depth > 0.5f && RealTime >= C.NextLog)
	{
		C.NextLog = RealTime + 0.25f;
		UE_LOG(LogTemp, Display, TEXT("Clip %.2f %s: %.1f cm (%s)"), RealTime, *Pair, Depth, *What);
	}
}

void AEndingDirector::ClipSummary()
{
	if (!bClipCheck || bClipSummed)
	{
		return;
	}
	bClipSummed = true;
	Clips.KeySort([](const FString& A, const FString& B) { return A < B; });
	for (const TPair<FString, FClip>& KV : Clips)
	{
		UE_LOG(LogTemp, Display, TEXT("ClipSummary %s: worst %.1f cm at %.2f s (%s)"), *KV.Key, KV.Value.Worst, KV.Value.At, *KV.Value.What);
	}
}

void AEndingDirector::EndPlay(const EEndPlayReason::Type Reason)
{
	ClipSummary();
	Super::EndPlay(Reason);
}

void AEndingDirector::RevealBeats(float DeltaSeconds)
{
	if (!Car)
	{
		return;
	}
	if (bClipCheck && ++ShellTick % 5 == 0)
	{
		ShellCheck();
	}
	const FTransform C = Car->GetActorTransform();
	const FVector F = C.GetUnitAxis(EAxis::X).GetSafeNormal2D();
	const FVector R = FVector::CrossProduct(FVector::UpVector, F);
	auto Ground = [this](const FVector& At) { return CreatureGround(At); };
	auto Face = [](AHusk* H, const FVector& P, const FVector& Dir)
	{
		const float Yaw = FMath::RadiansToDegrees(FMath::Atan2(Dir.Y, Dir.X));
		H->SetActorLocationAndRotation(P, FRotator(0.f, Yaw, 0.f).Quaternion() * FRotator(0.f, -H->MeshForwardYaw(), 0.f).Quaternion());
	};
	auto OnSnow = [&](AHusk* H, FVector P, const FVector& Dir)
	{
		P.Z = CreatureGround(P);
		Face(H, P, Dir);
		if (!H->HasSurface())
		{
			H->AddActorWorldOffset(FVector(0.f, 0.f, H->GroundLift(Ground)));    // (with its surface known, KeepOut keeps it on the snow)
		}
	};
	auto Take = [](AHusk* H, const TCHAR* Name, bool bLoop, float Rate, float At = 0.f)
	{
		H->Play(Name, bLoop);
		H->GetBody()->SetPlayRate(Rate);
		H->GetBody()->SetPosition(At, false);
		H->PoseNow();
	};
	AHusk* H = Creature;

	// suddenly: it drops onto the bonnet from the rock above as the car drives on (no warning: it is there)
	if (!bStall && bHoodAttack && !bDarted && Time >= SightTime)
	{
		bDarted = true;
		ArcFrom = PerchAt + FVector(60.f, -40.f, 420.f);
		const FVector From = C.TransformPosition(ArcFrom);
		FActorSpawnParameters P;
		P.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
		H = GetWorld()->SpawnActor<AHusk>(AHusk::StaticClass(), FTransform(From), P);
		if (H && H->Setup())
		{
			H->SetActorScale3D(FVector(HuskScale));
			Take(H, TEXT("Perch"), false, 0.f, 7.45f);      // (springing: stretched out as it comes down)
			H->JawOpen = 14.f;
			Creature = H;
			CreStage = 71;
			JumpT0 = Time;
			Face(H, From, -F);
			H->KeepOutLate = [this](AHusk* Me)
			{
				if (Me != Creature || CreStage == 0 || !Car)
				{
					return;
				}
				KeepOut(Me, FVector::UpVector, TEXT("the creature"));
			};
			Event(TEXT("drop"));
		}
		else if (H)
		{
			H->Destroy();
			H = nullptr;
		}
	}
	// suddenly: it drops onto the roof from above (out of sight: only heard, and felt)
	if (!bStall && !bHoodAttack && !bDarted && Time >= SightTime)
	{
		bDarted = true;
		// (onto the roof, the owner's choice: at its size its face can't be seen through the windshield from the bonnet)
		const FVector From = C.TransformPosition(RoofPerch + FVector(0.f, 0.f, 420.f));
		FActorSpawnParameters P;
		P.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
		H = GetWorld()->SpawnActor<AHusk>(AHusk::StaticClass(), FTransform(From), P);
		if (H && H->Setup())
		{
			H->SetActorScale3D(FVector(HuskScale));
			// (real motion: a person crawling, from where they are down on all fours and nearly still, held as it falls)
			H->PlayClip(TEXT("CMU:111_03"), PerchClipAt, 0.f, false);
			H->JawOpen = 14.f;
			Creature = H;
			CreStage = 51;
			JumpT0 = Time;
			ArcFrom = RoofPerch + FVector(0.f, 0.f, 420.f);
			Face(H, From, F);
			// kept out of the car (the way that suits what it is doing), the solid things and the ground, each frame
			// once its body is animated
			H->KeepOutLate = [this](AHusk* Me)
			{
				if (Me != Creature || CreStage == 0 || !Car)
				{
					return;
				}
				const FTransform Ct = Car->GetActorTransform();
				const FVector Fw = Ct.GetUnitAxis(EAxis::X).GetSafeNormal2D();
				const FVector Rt = FVector::CrossProduct(FVector::UpVector, Fw);
				const FVector Dir = CreStage == 51 || CreStage == 6 || CreStage == 60 ? FVector::UpVector : CreStage == 61 ? -Fw : -Rt;
				KeepOut(Me, Dir, TEXT("the creature"));
			};
			Event(TEXT("drop"));
		}
		else if (H)
		{
			H->Destroy();
			H = nullptr;
		}
	}
	// the stall: out of the dark at the driver's door while the eyes are on the key (not seen until its hand comes
	// through the glass); reaching, then the blow
	if (bStall && !bDarted && StopT >= 0.f && Time >= StopT + StallPeerAt)
	{
		bDarted = true;
		const FVector At = C.TransformPosition(FVector(PeerStand.X, PeerStand.Y, 0.f));
		FActorSpawnParameters P;
		P.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
		H = GetWorld()->SpawnActor<AHusk>(AHusk::StaticClass(), FTransform(At), P);
		if (H && H->Setup())
		{
			H->SetActorScale3D(FVector(HuskScale));
			Creature = H;
			CreStage = 7;
			PeerT0 = Time;
			PeerV = 0.f;
			ImpactTime = PeerT0 + 1.75f;
			Take(H, TEXT("Peer"), false, 1.f, 0.f);
			OnSnow(H, At, R);
			H->KeepOutLate = [this](AHusk* Me)
			{
				if (Me != Creature || CreStage == 0 || !Car)
				{
					return;
				}
				const FVector Fw = Car->GetActorTransform().GetUnitAxis(EAxis::X).GetSafeNormal2D();
				KeepOut(Me, -FVector::CrossProduct(FVector::UpVector, Fw), TEXT("the creature"));
			};
			FaceLight = NewObject<UPointLightComponent>(Car, TEXT("FaceGlow"));
			FaceLight->SetupAttachment(Car->GetRootComponent());
			FaceLight->RegisterComponent();
			FaceLight->SetIntensityUnits(ELightUnits::Candelas);
			FaceLight->SetLightColor(FLinearColor(0.55f, 0.7f, 1.f));
			FaceLight->SetRelativeLocation(FVector(48.f, -6.f, 104.f));     // the dials' cold glow, out at the window
			FaceLight->SetIntensity(3.f);
			FaceLight->SetAttenuationRadius(260.f);
			FaceLight->SetLightingChannels(false, false, true);
			TInlineComponentArray<UPrimitiveComponent*> Prims(H);
			for (UPrimitiveComponent* Pc : Prims)
			{
				Pc->SetLightingChannels(true, false, true);
			}
			FaceLight->SetCastShadows(false);
			Event(TEXT("peer"));
		}
		else if (H)
		{
			H->Destroy();
			H = nullptr;
		}
	}
	if (!H)
	{
		return;
	}
	const float Dt = DeltaSeconds;
	if (false)
	{
	}
	else if (CreStage == 71)
	{
		// falling onto the bonnet (in the car's own frame: it is moving), quickening as it falls
		const float u = FMath::Clamp((Time - JumpT0) / 0.22f, 0.f, 1.f);
		Face(H, C.TransformPosition(FMath::Lerp(ArcFrom, HoodLie, u * u)), -F);
		if (u >= 1.f)
		{
			CreStage = 73;
			RiseT0 = DropT = HangInT = Time;               // (the eyes on its face at once: it is right in front of them)
			HoodBeat = 0;
			HoodSlideY = HoodSlideV = HoodLungeX = HoodLungeV = 0.f;
			// (generated motion, NVIDIA Kimodo: flat on its belly, clinging with its hands spread wide; its head and chest up,
			// screaming; its head slammed down at 2.8-3.0 s)
			H->PlayClip(TEXT("KIM:KimodoKimodo_kimodo_hood_cling_Husk"), 0.f, 1.f, false);
			RoarShake = FMath::Max(RoarShake, 0.9f);
			Event(TEXT("land"));
			FaceLight = NewObject<UPointLightComponent>(Car, TEXT("FaceGlow"));
			FaceLight->SetupAttachment(Car->GetRootComponent());
			FaceLight->RegisterComponent();
			FaceLight->SetIntensityUnits(ELightUnits::Candelas);
			FaceLight->SetIntensity(3.f);
			FaceLight->SetLightColor(FLinearColor(0.55f, 0.85f, 1.f));   // the dials' glow, up through the glass onto its face
			FaceLight->SetAttenuationRadius(200.f);
			FaceLight->SetCastShadows(false);
			FaceLight->SetRelativeLocation(FVector(38.f, 10.f, 98.f));
		}
	}
	else if (CreStage == 73)
	{
		// on the bonnet as the car drives on: clinging; thrown across it as the driver swerves (gripping back, on a spring);
		// its face brought down to the glass, it draws back and slams its head into it; flung off the front by the brakes
		const float r = Time - RiseT0;
		if (HoodBeat == 0 && r >= 1.3f)
		{
			HoodBeat = 1;                                  // (its head coming up off the bonnet)
			Event(TEXT("rise"));
		}
		if (HoodBeat == 1 && r >= 1.95f && RiseBeat == 0)
		{
			RiseBeat = 1;                                  // (reset for the throw below)
			Event(TEXT("jaw"));                            // the shriek, at the glass
		}
		// the car's sideways acceleration (cm/s^2, + right) from the swerves: it is thrown the other way
		const float hh = 0.03f;
		const float aL = (SwerveOff(r + hh) - 2.f * SwerveOff(r) + SwerveOff(r - hh)) / (hh * hh);
		{
			const float Om = 6.5f, Ze = 0.45f;
			for (int32 i = 0; i < 3; ++i)
			{
				const float h = Dt / 3.f;
				HoodSlideV += (-aL * 0.85f - Om * Om * HoodSlideY - 2.f * Ze * Om * HoodSlideV) * h;
				HoodSlideY = FMath::Clamp(HoodSlideY + HoodSlideV * h, -55.f, 55.f);
			}
		}
		// the blow: drawn back, then its head thrown into the glass (a stiff spring, overshooting into it, stopped by it)
		float Tgt = 0.f, Om = 9.f, Ze = 0.7f;
		if (r >= HoodStrikeAt - 0.3f && r < HoodStrikeAt)
		{
			Tgt = 10.f;
		}
		else if (r >= HoodStrikeAt && r < HoodStrikeAt + 0.25f)
		{
			Tgt = -14.f;
			Om = 16.f;
			Ze = 0.35f;
		}
		for (int32 i = 0; i < 3; ++i)
		{
			const float h = Dt / 3.f;
			HoodLungeV += (Om * Om * (Tgt - HoodLungeX) - 2.f * Ze * Om * HoodLungeV) * h;
			HoodLungeX += HoodLungeV * h;
		}
		if (HoodBeat == 1 && r >= HoodStrikeAt + 0.06f)
		{
			HoodBeat = 2;
			const FVector Hd = C.InverseTransformPosition(H->HeadAt());
			const FVector N(0.545f, 0.f, 0.838f);
			BlowT[0] = Time;
			BlowS[0] = FMath::Max(300.f, -HoodLungeV);
			BlowAt[0] = Hd - N * FVector::DotProduct(Hd - FVector(100.f, 0.f, 100.f), N);   // (the glass in front of its face)
			ChipWindshield(BlowAt[0], 1);
			RoarShake = FMath::Max(RoarShake, 1.1f);
			Event(TEXT("slam"), BlowS[0]);
		}
		H->JawOpen = r < 1.0f ? 14.f * (1.f - Smooth(r / 0.5f)) + 6.f
			: 6.f + 38.f * Smooth((r - 1.9f) / 0.3f) * (1.f - 0.6f * Smooth((r - 2.85f) / 0.1f)) * (1.f - Smooth((r - HoodBrakeAt) / 0.3f))
			+ 2.f * FMath::Sin(r * 23.f) * Smooth((r - 2.0f) / 0.2f);
		const FVector Pc = HoodLie + FVector(-HoodLungeX, HoodSlideY, 0.f);
		const FVector Dir = (-F).RotateAngleAxis(FMath::Clamp(HoodSlideY * 0.35f, -18.f, 18.f), FVector::UpVector);
		Face(H, C.TransformPosition(Pc), Dir);
		// the brakes: it goes on as the car stops, flung forward off the bonnet
		if (r >= HoodBrakeAt + 0.18f)
		{
			CreStage = 72;
			ThrowT = LeapT0 = Time;
			ThrowP = H->GetActorLocation();
			ThrowV = F * FMath::Max(SpeedNow + 830.f * 0.18f, 600.f) + R * HoodSlideY * 3.f + FVector(0.f, 0.f, 260.f);
			ThrowSpin = 0.f;
			ThrowSpinV = -420.f;                           // (tumbling head over heels, forward)
			RiseBeat = 0;
			Take(H, TEXT("Gallop"), true, 1.4f);
			if (FaceLight)
			{
				FaceLight->SetIntensity(0.f);
			}
			Event(TEXT("leap"));
		}
	}
	else if (CreStage == 72)
	{
		// flung off: through the air ahead of the car, tumbling; down on the snow, rolling, skidding; then up and off the
		// road into the dark, out of the headlights
		const float l = Time - ThrowT;
		ThrowV.Z -= 980.f * Dt;
		ThrowP += ThrowV * Dt;
		ThrowSpin += ThrowSpinV * Dt;
		const float G = CreatureGround(ThrowP);
		if (ThrowP.Z < G)
		{
			ThrowP.Z = G;
			if (ThrowV.Z < -150.f)
			{
				Event(TEXT("roof"));                          // (a thud on the snow)
			}
			ThrowV.Z = FMath::Max(0.f, -ThrowV.Z * 0.25f);
			ThrowV.X *= FMath::Pow(0.25f, Dt);
			ThrowV.Y *= FMath::Pow(0.25f, Dt);
			ThrowSpinV *= FMath::Pow(0.08f, Dt);
		}
		const FRotator Spin(FMath::Fmod(ThrowSpin, 360.f) * Smooth(1.f - (l - 1.1f) / 0.4f), 0.f, 0.f);
		const float Yaw = FMath::RadiansToDegrees(FMath::Atan2(F.Y, F.X));
		H->SetActorLocationAndRotation(ThrowP, FRotator(0.f, Yaw, 0.f).Quaternion() * Spin.Quaternion() * FRotator(0.f, -H->MeshForwardYaw(), 0.f).Quaternion());
		if (l >= 1.5f && RiseBeat == 0)
		{
			// up, and off the road to the right, into the dark
			RiseBeat = 1;
			ThrowV = R * 900.f * HuskScale + F * 200.f;
		}
		if (l >= 2.4f)
		{
			CreStage = 61;
			GoneT = Time;
			CreepTime = Time + CreepAfterGone;
			HuntC = FVector(-650.f, -40.f, 0.f);
			Take(H, TEXT("Stalk"), true, 0.f);
			Event(TEXT("gone"));
		}
	}
	else if (CreStage == 51)
	{
		// falling onto the roof (in the car's own frame: it is moving), quickening as it falls, out of sight above
		const float u = FMath::Clamp((Time - JumpT0) / 0.22f, 0.f, 1.f);
		const FVector Pc = FMath::Lerp(ArcFrom, RoofPerch, u * u);
		Face(H, C.TransformPosition(Pc), F);
		if (u >= 1.f)
		{
			CreStage = 6;
			RiseT0 = DropT = Time;
			// on all fours on the roof, nearly still: the crawl, slowed right down (then it lies down: the hang below)
			H->PlayClip(TEXT("CMU:111_03"), PerchClipAt, 0.3f, false);    // (slowed right down: just its breathing, its weight shifting)
			Event(TEXT("land"));
			FaceLight = NewObject<UPointLightComponent>(Car, TEXT("FaceGlow"));
			FaceLight->SetupAttachment(Car->GetRootComponent());
			FaceLight->RegisterComponent();
			FaceLight->SetIntensityUnits(ELightUnits::Candelas);
			FaceLight->SetIntensity(2.6f);
			FaceLight->SetLightColor(FLinearColor(0.55f, 0.85f, 1.f));   // the dials' glow, up through the glass onto its face
			FaceLight->SetAttenuationRadius(140.f);     // (its face, not its shoulders up at the top of the glass)
			FaceLight->SetCastShadows(false);
			FaceLight->SetRelativeLocation(FVector(50.f, 0.f, 102.f));
		}
	}
	else if (CreStage == 6)
	{
		// on the roof as the car brakes: lies flat, out of sight; then its face swings down into the windshield, upside
		// down, all at once; it slams its head into the glass, shrieks at the driver through the cracks, strikes the glass
		// with its claw; pulls up and springs off the back
		Face(H, C.TransformPosition(RoofPerch), F);      // on the roof, facing the way the car goes
		const float r = Time - RiseT0;
		static const struct { float At; const TCHAR* Kind; } Beats[] = {{2.4f, TEXT("rise")}, {4.75f, TEXT("jaw")}, {7.6f, TEXT("leap")}};
		// (the attack: its face drops in; its head hits the glass; its claw hits the glass)
		static const float HangAt = 3.6f, SlamAt = 4.58f, ClawAt = 6.04f;     // (when it drops in; when it lunges; when it strikes)
		const FVector N(0.545f, 0.f, 0.838f);         // the windshield's outward normal (car frame: up and forward)
		auto OnGlass = [&N](const FVector& P)          // the point of the glass nearest P (car frame)
		{
			return P - N * (FVector::DotProduct(P - FVector(100.f, 0.f, 100.f), N));
		};
		if (AttackBeat == 0 && r >= HangAt)
		{
			AttackBeat = 1;
			HangInT = Time;
			Event(TEXT("hang"));
		}
		while (RiseBeat < (int32)UE_ARRAY_COUNT(Beats) && r >= Beats[RiseBeat].At)
		{
			Event(Beats[RiseBeat].Kind);
			if (RiseBeat == 2)
			{
				LeapT0 = Time;
				Take(H, TEXT("Gallop"), true, 1.2f);       // (stretched out through the air over the roof)
				CreStage = 60;
				ArcFrom = C.InverseTransformPosition(H->GetActorLocation());     // (from where it is: crept to the edge)
				H->PeerDown = H->PeerTilt = 0.f;
				H->HangW = H->HangCurl = H->HangGripW = H->HangLie = 0.f;
			}
			++RiseBeat;
		}
		// on the roof, out of sight: it lies down at the front edge, its hands on the edge, its head curling down and round
		// above the windshield. Then all at once its face swings down into the glass, upside down, to the driver's eye line
		// (falling, overshooting a little and settling); it stares a moment; draws its head back and slams it into the
		// glass (it cracks); shrieks at the driver through the cracks, its head shaking; its claw comes down and strikes the
		// glass, dragging; it pulls its face off the glass, snarling, and is gone up over the edge as it coils to spring
		// (not once it has sprung: the beat above has just let go of all of it)
		if (CreStage == 6)
		{
			auto Snap = [](float x) { return FMath::SmoothStep(0.f, 0.08f, x); };
			auto Ease = [](float a, float b, float x) { return FMath::SmoothStep(a, b, x); };
			const FVector Low(RoofHangHead.X, CamRest.Y, RoofHangHead.Z);
			// (its head swings down over the edge like a weight on its neck: about where its neck leaves the roof, from up
			// and behind, out over the bonnet and down, overshooting a little and settling)
			const FVector Pivot(Low.X - 6.f, Low.Y, Low.Z + 48.f);
			const float A0 = FMath::DegreesToRadians(105.f), A1 = FMath::DegreesToRadians(-82.f);
			auto OnSwing = [&Pivot](float A) { return Pivot + FVector(FMath::Cos(A), 0.f, FMath::Sin(A)) * 48.f; };
			const FVector Hidden = OnSwing(A0);
			// where its head is driven (car frame), and how hard: it drops in (a heavy swing, overshooting a little); draws
			// back; lunges at the driver, through where the glass is (the glass stops it); presses against it shrieking,
			// head shaking; pulls off it; is gone up over the edge
			const FVector Lunge = FVector(-0.92f, 0.f, -0.38f).GetSafeNormal();     // at the driver, a little down
			const float Shriek = Ease(4.75f, 4.85f, r) * (1.f - Ease(5.7f, 5.95f, r));
			FVector Tgt = Hidden;
			float W = 12.f, Z = 0.7f;
			if (r < HangAt)
			{
				SwingA = A0;
				SwingV = 0.f;
			}
			else
			{
				for (int32 i = 0; i < 4; ++i)
				{
					const float h = Dt / 4.f;
					SwingV += (11.f * 11.f * (A1 - SwingA) - 2.f * 0.55f * 11.f * SwingV) * h;
					SwingA += SwingV * h;
				}
				// (hanging there, never quite still: a slow tremor in its neck)
				Tgt = OnSwing(SwingA) + FVector(0.7f * FMath::PerlinNoise1D(Time * 3.f), 1.0f * FMath::PerlinNoise1D(Time * 3.f + 7.f), 0.8f * FMath::PerlinNoise1D(Time * 2.5f + 13.f));
				W = 26.f;
				Z = 0.9f;
			}
			if (r >= 4.25f && r < SlamAt)
			{
				Tgt = Low - Lunge * 14.f + FVector(0.f, 0.f, 6.f);     // drawn back, gathering itself
				W = 10.f;
				Z = 0.85f;
			}
			if (r >= SlamAt && r < 6.75f)
			{
				Tgt = Low + Lunge * (r < 4.8f ? 30.f : 24.f) + FVector(0.f, 3.f * FMath::Sin(2.f * PI * 5.5f * r) * Shriek, 0.f);
				W = r < 4.8f ? 15.f : 12.f;
				Z = r < 4.8f ? 0.45f : 0.6f;
			}
			if (r >= 6.75f)
			{
				Tgt = r < 7.0f ? Low - Lunge * 6.f : Hidden;
				W = r < 7.0f ? 12.f : 16.f;
				Z = 0.8f;
			}
			// the glass, as its face meets it: how far its face reaches out from its head toward the glass (as it is drawn)
			const FVector Nw = C.TransformVectorNoScale(N), G0 = C.TransformPosition(FVector(100.f, 0.f, 100.f));
			auto Plane = [&N](const FVector& P) { return FVector::DotProduct(P - FVector(100.f, 0.f, 100.f), N); };
			const float Reach = FVector::DotProduct(H->HeadAt() - H->FaceNearest(G0, Nw), Nw);
			if (!bAtkInit)
			{
				bAtkInit = true;
				AtkHeadP = Hidden;
				AtkHeadV = FVector::ZeroVector;
				AtkClawP = FVector(42.f, CamRest.Y + 40.f, 172.f);
				AtkClawV = FVector::ZeroVector;
			}
			const int32 Sub = 4;
			for (int32 i = 0; i < Sub; ++i)
			{
				const float h = Dt / Sub;
				AtkHeadV += (W * W * (Tgt - AtkHeadP) - 2.f * Z * W * AtkHeadV) * h;
				AtkHeadP += AtkHeadV * h;
				const float Gap = Plane(AtkHeadP) - Reach;          // its face's distance from the glass
				if (r >= HangAt && Gap < 0.3f)
				{
					AtkHeadP += N * (0.3f - Gap);
					const float Vn = FVector::DotProduct(AtkHeadV, N);
					if (Vn < 0.f)
					{
						// it hits the glass: it stops there, a little rebound, its sliding checked
						if (AttackBeat == 1 && r >= SlamAt && -Vn > 80.f)
						{
							AttackBeat = 2;
							BlowT[0] = Time;
							BlowS[0] = -Vn;
							// (where its brow meets the glass: straight in front of its head, a little down the slope, the skull
							// hanging below its neck)
							BlowAt[0] = OnGlass(AtkHeadP) + FVector(0.838f, 0.f, -0.545f) * 6.f;
							{
								const FVector Cm = Camera ? C.InverseTransformPosition(Camera->GetActorLocation()) : CamRest;
								UE_LOG(LogTemp, Display, TEXT("Blow 0 at car (%.0f, %.0f, %.0f): %.0f deg up and %.0f across from the eye; its head at (%.0f, %.0f, %.0f), %.0f cm/s"),
									BlowAt[0].X, BlowAt[0].Y, BlowAt[0].Z, FMath::RadiansToDegrees(FMath::Atan2(BlowAt[0].Z - Cm.Z, BlowAt[0].X - Cm.X)),
									FMath::RadiansToDegrees(FMath::Atan2(BlowAt[0].Y - Cm.Y, BlowAt[0].X - Cm.X)), AtkHeadP.X, AtkHeadP.Y, AtkHeadP.Z, -Vn);
							}
							ChipWindshield(BlowAt[0], 1);
							RoarShake = FMath::Clamp(-Vn / 400.f, 0.6f, 1.25f);
							Event(TEXT("slam"), -Vn);
						}
						const FVector Vt = AtkHeadV - N * Vn;
						AtkHeadV = Vt * 0.55f - N * Vn * 0.15f;
					}
				}
			}
			const FVector Hd = AtkHeadP;
			H->HangW = FMath::SmoothStep(0.5f, 1.6f, r);
			H->HangCurl = FMath::SmoothStep(0.7f, 2.6f, r);
			H->HangGripW = FMath::SmoothStep(0.9f, 2.4f, r);
			H->HangLie = FMath::SmoothStep(0.6f, 1.9f, r);
			H->HangHoldSlide = Ease(4.15f, 4.3f, r) * (1.f - Ease(6.75f, 7.0f, r));     // (its neck throws its head)
			H->HangHead = C.TransformPosition(Hd);
			H->HangLook = C.TransformPosition(CamRest);
			// its hands: out of sight on the roof's front edge (its claws are long: the hands ride high over it). Its right
			// one comes up off the edge and over, strikes down onto the glass claws first, drags down it, is lifted off
			// and goes back over the edge (the roof runs from y -35, the driver's side, to 109)
			const FVector Down(0.838f, 0.f, -0.545f);      // down the glass's slope
			const FVector RoofL(42.f, CamRest.Y - 34.f, 172.f), RoofR(42.f, CamRest.Y + 40.f, 172.f);
			const FVector ClawG = OnGlass(RoofClawAt) + N * 24.f;     // (its hand held off the glass: its long claws reach it; its forearm stays clear of it)
			// its claw, the same way: up off the edge and over; struck down through where the glass is (the glass stops it:
			// its claws on it); pressed and dragged down it; lifted off; back over the edge
			FVector CTgt = RoofR;
			float CW = 12.f, CZ = 0.8f;
			if (r >= ClawAt - 0.12f && r < ClawAt)
			{
				CTgt = ClawG + N * 30.f;           // above where it will strike
				CW = 18.f;
			}
			else if (r >= ClawAt && r < 7.15f)
			{
				CTgt = r < ClawAt + 0.16f ? ClawG - N * 18.f : ClawG - N * 6.f + Down * 7.f * Ease(ClawAt + 0.16f, 6.5f, r);
				CW = r < ClawAt + 0.16f ? 16.f : 14.f;
				CZ = r < ClawAt + 0.16f ? 0.4f : 0.7f;
			}
			else if (r >= 7.15f && r < 7.55f)
			{
				CTgt = r < 7.32f ? ClawG + N * 45.f + FVector(0.f, 0.f, 20.f) : RoofR;
				CW = 14.f;
			}
			for (int32 i = 0; i < Sub; ++i)
			{
				const float h = Dt / Sub;
				AtkClawV += (CW * CW * (CTgt - AtkClawP) - 2.f * CZ * CW * AtkClawV) * h;
				AtkClawP += AtkClawV * h;
				const float Gap = FVector::DotProduct(AtkClawP - ClawG, N);     // (its claws at the glass when its hand is at ClawG)
				if (r >= ClawAt - 0.12f && r < 7.15f && Gap < 0.f)
				{
					AtkClawP -= N * Gap;
					const float Vn = FVector::DotProduct(AtkClawV, N);
					if (Vn < 0.f)
					{
						if (AttackBeat == 2 && -Vn > 80.f)
						{
							AttackBeat = 3;
							BlowT[1] = Time;
							BlowS[1] = -Vn;
							BlowAt[1] = OnGlass(AtkClawP);
							ChipWindshield(BlowAt[1], 2);
							RoarShake = FMath::Max(RoarShake, FMath::Clamp(-Vn / 500.f, 0.4f, 0.9f));
							Event(TEXT("claw"), -Vn);
						}
						const FVector Vt = AtkClawV - N * Vn;
						AtkClawV = Vt * 0.5f - N * Vn * 0.1f;
					}
				}
			}
			FVector HandR = AtkClawP;
			const float OnG = FMath::Clamp(1.f - FVector::DotProduct(AtkClawP - ClawG, N) / 25.f, 0.f, 1.f) * (r >= ClawAt - 0.12f && r < 7.45f ? 1.f : 0.f);
			H->HangGrip[0] = C.TransformPosition(RoofL);      // (its left hand: the car's left)
			H->HangGrip[1] = C.TransformPosition(HandR);
			// (its claw flat to the glass: palm to it, fingers up it; from the clip's hand, flat on the ground, fingers ahead)
			const FQuat Src = FRotationMatrix::MakeFromXZ(C.TransformVectorNoScale(FVector::ForwardVector), FVector::UpVector).ToQuat();
			const FQuat Dst = FRotationMatrix::MakeFromXZ(C.TransformVectorNoScale(-Down), C.TransformVectorNoScale(N)).ToQuat();
			// (its elbow out over the bonnet and up, away from the glass: never folding back through the windshield)
			H->HangElbow[1] = C.TransformVectorNoScale((N * 0.5f + FVector(0.f, 0.f, 0.6f) + FVector(0.f, 0.7f, 0.f)).GetSafeNormal());
			H->HangGripTurn[0] = FQuat::Identity;
			H->HangGripTurn[1] = FQuat::Slerp(FQuat::Identity, Dst * Src.Inverse(), OnG);
			H->PeerDown = 0.f;
			H->PeerTilt = 16.f * Snap(r - 4.05f) - 16.f * Snap(r - 4.42f) + 9.f * FMath::Sin(2.f * PI * 6.f * r) * Shriek
				- 22.f * Snap(r - 6.2f) + 22.f * Snap(r - 6.95f);
		}
		// its jaw: shut but working; wide in the shriek; a snarl after; shut as it goes
		H->JawOpen = r < 4.70f ? 6.f + 3.f * FMath::Sin(r * 2.7f)
			: FMath::Lerp(FMath::Lerp(FMath::Lerp(6.f, 42.f, Smooth((r - 4.70f) / 0.12f)), 16.f, Smooth((r - 5.8f) / 0.25f)), 8.f, Smooth((r - 6.9f) / 0.3f))
				+ 1.5f * FMath::Sin(r * 23.f) * Smooth((r - 4.8f) / 0.2f) * (1.f - Smooth((r - 5.8f) / 0.2f));
	}
	if (CreStage == 60)
	{
		// up onto the roof, then off the back of it onto the road behind
		const float l = Time - LeapT0;
		const FVector Roof(-60.f, -10.f, 140.f), Behind(-650.f, -40.f, 0.f);
		FVector Pc;
		if (l < 0.35f)
		{
			const float u = l / 0.35f;
			Pc = FMath::Lerp(ArcFrom, Roof, u) + FVector(0.f, 0.f, 90.f * FMath::Sin(PI * u));
		}
		else
		{
			const float u = FMath::Clamp((l - 0.35f) / 0.6f, 0.f, 1.f);
			Pc = FMath::Lerp(Roof, Behind, u) + FVector(0.f, 0.f, 160.f * FMath::Sin(PI * u));
		}
		FVector W = C.TransformPosition(Pc);
		if (l >= 0.95f)
		{
			W.Z = CreatureGround(W);
		}
		Face(H, W, -F);
		if (l >= 0.35f && RiseBeat == 3)
		{
			Event(TEXT("roof"));
			RoarShake = FMath::Max(RoarShake, 0.6f);
			++RiseBeat;
		}
		if (l >= 0.5f && RiseBeat == 4)
		{
			Event(TEXT("roof"));
			RoarShake = FMath::Max(RoarShake, 0.4f);
			++RiseBeat;
		}
		if (l >= 0.95f)
		{
			CreStage = 61;
			GoneT = Time;
			CreepTime = Time + CreepAfterGone;
			HuntC = Behind;
			Take(H, TEXT("Stalk"), true, 0.f);
			if (FaceLight)
			{
				FaceLight->SetIntensity(0.f);
			}
			Event(TEXT("gone"));
		}
	}
	else if (CreStage == 61)
	{
		// behind the car, following it, hunched (seen in the mirror)
		const float c = Time - CreepTime - 0.6f;
		H->GetBody()->SetPlayRate(FMath::Clamp(SpeedNow / (67.f * HuskScale), 0.f, 2.f));
		OnSnow(H, C.TransformPosition(FVector(HuntC.X, HuntC.Y, 0.f)), F);
		// near the break in the rail (and after the mirror's look back), it runs up the left side: heard, then there
		if (c >= 3.4f && PeerStopAt - StartDistance - DistNow < 230.f)
		{
			CreStage = 62;
			Waypoint = 0;
			Take(H, TEXT("Gallop"), true, 1.2f);
			Event(TEXT("overtake"));
		}
	}
	else if (CreStage == 62)
	{
		// up the left side in the dark while the driver looks ahead, to the window
		// (its last stretch runs alongside the car, not in at it: its reaching hands clear the front wing and the mirror)
		const FVector Way[] = {FVector(-300.f, -260.f, 0.f), FVector(-130.f, -194.f, 0.f), FVector(PeerStand.X, PeerStand.Y, 0.f)};
		FVector To = Way[Waypoint] - HuntC;
		To.Z = 0.f;
		const float Step = 900.f * Dt;
		FVector Dir = To.GetSafeNormal();
		if (To.Size() <= Step)
		{
			HuntC = Way[Waypoint];
			if (++Waypoint >= (int32)UE_ARRAY_COUNT(Way))
			{
				CreStage = 63;
				Take(H, TEXT("Peer"), false, 0.f, 0.f);
				Dir = FVector(0.f, 1.f, 0.f);
			}
		}
		else
		{
			HuntC += Dir * Step;
		}
		OnSnow(H, C.TransformPosition(FVector(HuntC.X, HuntC.Y, 0.f)), C.TransformVectorNoScale(Dir));
	}
	else if (CreStage == 63)
	{
		// it has just reached the window, running: the driver, turned by its steps, sees it
		OnSnow(H, C.TransformPosition(FVector(PeerStand.X, PeerStand.Y, 0.f)), R);
		if (PeerT0 < 0.f)
		{
			PeerT0 = Time;
			PeerV = SpeedNow;
			ImpactTime = PeerT0 + 1.75f;
			CreStage = 7;
			Take(H, TEXT("Peer"), false, 1.f, 0.f);
			if (FaceLight)
			{
				FaceLight->SetRelativeLocation(FVector(45.f, -150.f, 175.f));   // a little cold moonlight on its face
				FaceLight->SetIntensity(1.2f);
				FaceLight->SetAttenuationRadius(200.f);
			}
		}
	}
	else if (CreStage == 7)
	{
		const float r = Time - PeerT0;
		if (!bImpacted)
		{
			OnSnow(H, C.TransformPosition(FVector(PeerStand.X, PeerStand.Y, 0.f)), R);
			if (!bDriverBurst && r > 1.3f)
			{
				// its hand reaches the glass: the window breaks then (and its arm comes in through the hole)
				TArray<UPrimitiveComponent*> Parts;
				for (UPrimitiveComponent* P : CarParts)
				{
					Parts.Add(P);
				}
				if (H->PushClear(Parts, -R) > 1.f || r >= 1.5f)
				{
					BurstWindow(true);
					SmashT = Time;
					if (bStall)
					{
						ImpactTime = Time + StallHold;    // (its face in the hole, its arm in at the driver: then the blow)
						RoarShake = FMath::Max(RoarShake, 0.8f);
					}
					Event(TEXT("smash"));
					PeerBeat = FMath::Max(PeerBeat, 2);
				}
			}
		}
		if (PeerBeat == 0 && r >= 0.45f)
		{
			Event(TEXT("face"));
			++PeerBeat;
		}

		if (bStall && SmashT >= 0.f)
		{
			// (the stall) its face in the hole the glass left, at the driver's eyes, shrieking, its head shaking; then it
			// draws back a little and drives its arm in at them, clawing at them, hauling; then the blow (the take on
			// from its shove)
			const float g = Time - SmashT;
			const float Claw = StallFace + 0.35f;
			if (!bImpacted)
			{
				float At;
				if (g < StallFace)
				{
					At = FMath::Min(SmashT - PeerT0, 1.33f) + 0.02f * FMath::Sin(g * 9.f);
				}
				else if (g < Claw)
				{
					At = 1.35f + (g - StallFace);
				}
				else
				{
					At = 1.7f - 0.05f * (1.f - FMath::Cos((g - Claw) * 12.f));
				}
				H->GetBody()->SetPlayRate(0.f);
				H->GetBody()->SetPosition(At, false);
				H->PeerTilt = g < StallFace ? 9.f * FMath::Sin(g * 23.f) * Smooth(g / 0.1f) * (1.f - Smooth((g - StallFace + 0.12f) / 0.12f)) : 0.f;
			}
			else if (PeerBeat < 3)
			{
				PeerBeat = 3;
				H->PeerTilt = 0.f;
				Take(H, TEXT("Peer"), false, 1.f, 1.75f);
			}
		}
		H->JawOpen = r < 1.35f ? 7.f + 3.f * FMath::Sin(r * 6.f) : 8.f + 26.f * Smooth((r - 1.35f) / 0.2f);
		if (bStall && SmashT >= 0.f)
		{
			H->JawOpen = (8.f + 26.f * Smooth((Time - SmashT) / 0.12f)) * (1.f + 0.06f * FMath::Sin((Time - SmashT) * 31.f));   // (the shriek at once)
		}
		if (bImpacted && Time > ImpactTime + 1.6f)
		{
			H->Destroy();                // (the car is tumbling down the mountain: it is long out of sight)
			Creature = nullptr;
			CreStage = 0;
			if (FaceLight)
			{
				FaceLight->SetIntensity(0.f);
			}
		}
	}
	// (kept out of everything in its own tick, once its body is animated: KeepOutLate)
}

bool AEndingDirector::GetLine(FString& Line, float& Alpha) const
{
	if (!bCrash)
	{
		return false;
	}
	// what the driver says, under their breath: after which beat, how long after (s), for how long
	struct FLine
	{
		const TCHAR* After;
		float Delay, Hold;
		const TCHAR* Text;
	};
	static const FLine Lines[] = {
		{TEXT("letter"), 1.3f, 2.6f, TEXT("Hang on, Grandma. I'm coming.")},
		{TEXT("gap"), 0.2f, 2.4f, TEXT("Someone went over...")},
		{TEXT("eyes"), 1.8f, 1.8f, TEXT("What was that?")},
		{TEXT("sight"), 0.6f, 1.6f, TEXT("Jesus-")},
		{TEXT("rise"), 0.8f, 1.8f, TEXT("Don't move. Don't move.")},
		{TEXT("bolt"), 1.5f, 2.3f, TEXT("Okay. Okay. Just drive.")},
		{TEXT("gone"), 1.0f, 2.3f, TEXT("Okay. Okay. Just drive.")},
		{TEXT("creep"), 2.6f, 1.9f, TEXT("Where did it go?")},
		{TEXT("wake"), 2.3f, 1.8f, TEXT("Help... somebody...")},
		{TEXT("stall"), 0.7f, 2.2f, TEXT("No. No, no, no...")},
		{TEXT("stopped"), 1.3f, 1.8f, TEXT("Come on...")},
		{TEXT("frantic"), 0.05f, 0.9f, TEXT("Come on!")},
	};
	for (const FLine& L : Lines)
	{
		const float* At = EventReal.Find(FName(L.After));
		if (!At)
		{
			continue;
		}
		const float t = RealTime - (*At + L.Delay);
		if (t >= 0.f && t < L.Hold)
		{
			Line = L.Text;
			Alpha = Smooth(t / 0.2f) * (1.f - Smooth((t - L.Hold + 0.25f) / 0.25f));
			return Alpha > 0.f;
		}
	}
	return false;
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
