#include "Kessler.h"

#include "Animation/AnimSequence.h"
#include "Components/PointLightComponent.h"
#include "Components/PoseableMeshComponent.h"
#include "Engine/SkeletalMesh.h"
#include "Misc/CommandLine.h"
#include "TwoBoneIK.h"
#include "Components/SkeletalMeshComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "Engine/World.h"
#include "GameFramework/PlayerController.h"
#include "Camera/PlayerCameraManager.h"
#include "Materials/MaterialInstanceDynamic.h"

namespace
{
	const TCHAR* ManClass = TEXT("/Game/HollowAcre/Kessler/Built/Kessler/BP_Kessler.BP_Kessler_C");
}

AKessler::AKessler()
{
	PrimaryActorTick.bCanEverTick = true;
	PrimaryActorTick.TickGroup = TG_PostUpdateWork;     // (after his take's pose: the drawn body copies it)
	SetRootComponent(CreateDefaultSubobject<USceneComponent>(TEXT("Root")));
}

void AKessler::Tint(UStaticMeshComponent* C, const TCHAR* Slot, const FLinearColor& Color, float Metal, float Rough)
{
	static UMaterialInterface* Part = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Car/Keys/M_KeyPart.M_KeyPart"));
	if (!C || !Part)
	{
		return;
	}
	const TArray<FName> Names = C->GetMaterialSlotNames();
	for (int32 i = 0; i < Names.Num(); ++i)
	{
		if (Names[i].ToString().StartsWith(Slot))
		{
			UMaterialInstanceDynamic* D = UMaterialInstanceDynamic::Create(Part, C);
			D->SetVectorParameterValue(TEXT("Color"), Color);
			D->SetScalarParameterValue(TEXT("Metallic"), Metal);
			D->SetScalarParameterValue(TEXT("Roughness"), Rough);
			C->SetMaterial(i, D);
		}
	}
}

void AKessler::BeginPlay()
{
	Super::BeginPlay();
	UClass* Bp = LoadClass<AActor>(nullptr, ManClass);
	if (!Bp)
	{
		UE_LOG(LogTemp, Warning, TEXT("Kessler: no %s"), ManClass);
		return;
	}
	// (a MetaHuman faces its +Y: turned a quarter so he faces this actor's forward)
	FActorSpawnParameters P;
	P.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
	Man = GetWorld()->SpawnActor<AActor>(Bp, FTransform(GetActorRotation() + FRotator(0.f, -90.f, 0.f), GetActorLocation()), P);
	if (!Man)
	{
		return;
	}
	Man->AttachToActor(this, FAttachmentTransformRules::KeepWorldTransform);
	TArray<USkeletalMeshComponent*> Sk;
	Man->GetComponents<USkeletalMeshComponent>(Sk);
	for (USkeletalMeshComponent* C : Sk)
	{
		if (C->GetName() == TEXT("Body"))
		{
			Body = C;
		}
	}
	if (!Clip.IsEmpty())
	{
		PlayClip(Clip, true);
	}
	if (Body.IsValid() && Body->GetSkinnedAsset())
	{
		// (the body drawn is a copy of the take's pose each frame, so his arms and head can be set over it: the lantern
		// raised, the rifle shouldered, his eyes on something; the take's own body ticks on hidden. His face follows it.)
		Shown = NewObject<UPoseableMeshComponent>(Man, TEXT("KesslerShown"));
		Shown->SetSkinnedAssetAndUpdate(Body->GetSkinnedAsset(), true);
		Shown->SetupAttachment(Body.Get());
		Shown->RegisterComponent();
		for (int32 i = 0; i < Body->GetNumMaterials(); ++i)
		{
			Shown->SetMaterial(i, Body->GetMaterial(i));
		}
		Body->VisibilityBasedAnimTickOption = EVisibilityBasedAnimTickOption::AlwaysTickPoseAndRefreshBones;
		Body->SetVisibility(false, false);
		for (USkeletalMeshComponent* C : Sk)
		{
			if (C->GetName() == TEXT("Face"))
			{
				Face = C;
				C->SetLeaderPoseComponent(Shown);
			}
		}
		const FReferenceSkeleton& Rs = Body->GetSkinnedAsset()->GetRefSkeleton();
		RefLocal = Rs.GetRefBonePose();
		auto RefCS = [&](int32 i)
		{
			FTransform X = FTransform::Identity;
			while (i != INDEX_NONE)
			{
				X = X * RefLocal[i];
				i = Rs.GetParentIndex(i);
			}
			return X;
		};
		const int32 Pi = Rs.FindBoneIndex(TEXT("pelvis")), Hi = Rs.FindBoneIndex(TEXT("head"));
		if (Pi != INDEX_NONE)
		{
			PelvisRef = RefCS(Pi).GetLocation();
		}
		if (Hi != INDEX_NONE)
		{
			// (his face looks along +Y in the reference pose: that direction in the head bone's own frame)
			FaceFwdLocal = RefCS(Hi).GetRotation().Inverse().RotateVector(FVector(0.f, 1.f, 0.f));
		}
	}
	Goal = FaceAt = GetActorLocation();
	bTest = FParse::Param(FCommandLine::Get(), TEXT("kesslertest"));
	DressUp();
	CapOn();
	// his hair and beard going grey (near sixty): the groom materials' melanin down, a little red out of it
	TArray<UMeshComponent*> Ms;
	Man->GetComponents<UMeshComponent>(Ms);
	for (UMeshComponent* M : Ms)
	{
		if (M && M->GetClass()->GetName().Contains(TEXT("Groom")))
		{
			M->SetScalarParameterValueOnMaterials(TEXT("HairMelanin"), 0.32f);
			M->SetScalarParameterValueOnMaterials(TEXT("HairRedness"), 0.08f);
		}
	}
	if (bLantern)
	{
		Lantern = NewObject<UStaticMeshComponent>(this, TEXT("Lantern"));
		Lantern->SetStaticMesh(LoadObject<UStaticMesh>(nullptr, TEXT("/Game/HollowAcre/Wake/Kessler_Lantern.Kessler_Lantern")));
		Lantern->SetCollisionEnabled(ECollisionEnabled::NoCollision);
		Lantern->SetMobility(EComponentMobility::Movable);
		Lantern->RegisterComponent();
		// (its tin red paint worn to rust; the burner's brass dark; its glass the town's old glass)
		Tint(Lantern, TEXT("tin"), FLinearColor(0.18f, 0.035f, 0.025f), 0.35f, 0.62f);
		Tint(Lantern, TEXT("rust"), FLinearColor(0.09f, 0.05f, 0.03f), 0.5f, 0.75f);
		Tint(Lantern, TEXT("wick"), FLinearColor(0.02f, 0.015f, 0.01f), 0.f, 0.9f);
		Tint(Lantern, TEXT("wood"), FLinearColor(0.1f, 0.055f, 0.03f), 0.f, 0.7f);
		if (UMaterialInterface* Glass = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Town/Materials/M_Town_Glass.M_Town_Glass")))
		{
			const TArray<FName> Names = Lantern->GetMaterialSlotNames();
			for (int32 i = 0; i < Names.Num(); ++i)
			{
				if (Names[i].ToString().StartsWith(TEXT("glass")))
				{
					Lantern->SetMaterial(i, Glass);
				}
			}
		}
		Flame = NewObject<UStaticMeshComponent>(this, TEXT("LanternFlame"));
		Flame->SetStaticMesh(LoadObject<UStaticMesh>(nullptr, TEXT("/Game/HollowAcre/Wake/Kessler_LanternFlame.Kessler_LanternFlame")));
		Flame->SetCollisionEnabled(ECollisionEnabled::NoCollision);
		Flame->SetCastShadow(false);
		Flame->SetupAttachment(Lantern);
		if (UMaterialInterface* Fm = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Materials/Play/M_Flame.M_Flame")))
		{
			FlameMID = UMaterialInstanceDynamic::Create(Fm, Flame);
			FlameMID->SetScalarParameterValue(TEXT("Seed"), 1.3f);
			Flame->SetMaterial(0, FlameMID);
		}
		Flame->RegisterComponent();
		// (a kerosene flame behind glass: warm, dim, flickering; the guard's wires throw their shadows round him)
		LanternLight = NewObject<UPointLightComponent>(this, TEXT("LanternLight"));
		LanternLight->SetupAttachment(Lantern);
		LanternLight->SetRelativeLocation(FVector(0.f, 0.f, 15.f));
		LanternLight->SetIntensityUnits(ELightUnits::Candelas);
		LanternLight->SetIntensity(9.f);
		LanternLight->SetAttenuationRadius(1500.f);
		LanternLight->SetUseTemperature(true);
		LanternLight->SetTemperature(1950.f);
		LanternLight->SetSourceRadius(2.f);
		LanternLight->SetCastShadows(true);
		LanternLight->SetVolumetricScatteringIntensity(0.4f);
		LanternLight->SetLightingChannels(true, true, true);
		LanternLight->RegisterComponent();
	}
	if (bRifle)
	{
		Rifle = NewObject<UStaticMeshComponent>(this, TEXT("Rifle"));
		Rifle->SetStaticMesh(LoadObject<UStaticMesh>(nullptr, TEXT("/Game/HollowAcre/Wake/Kessler_Rifle.Kessler_Rifle")));
		Rifle->SetCollisionEnabled(ECollisionEnabled::NoCollision);
		Rifle->SetMobility(EComponentMobility::Movable);
		Rifle->RegisterComponent();
		Tint(Rifle, TEXT("steel"), FLinearColor(0.025f, 0.025f, 0.028f), 0.6f, 0.45f);
		Tint(Rifle, TEXT("wood"), FLinearColor(0.09f, 0.045f, 0.022f), 0.f, 0.55f);
		// (a shot at night: a white-orange flash out of the muzzle that lights the snow and the trees for a frame or two)
		MuzzleLight = NewObject<UPointLightComponent>(this, TEXT("MuzzleLight"));
		MuzzleLight->SetupAttachment(Rifle);
		MuzzleLight->SetRelativeLocation(FVector(72.f, 0.f, 5.3f));
		MuzzleLight->SetIntensityUnits(ELightUnits::Candelas);
		MuzzleLight->SetIntensity(0.f);
		MuzzleLight->SetAttenuationRadius(3000.f);
		MuzzleLight->SetUseTemperature(true);
		MuzzleLight->SetTemperature(3200.f);
		MuzzleLight->SetCastShadows(true);
		MuzzleLight->SetVolumetricScatteringIntensity(2.f);
		MuzzleLight->RegisterComponent();
		MuzzleFlash = NewObject<UStaticMeshComponent>(this, TEXT("MuzzleFlash"));
		MuzzleFlash->SetStaticMesh(LoadObject<UStaticMesh>(nullptr, TEXT("/Game/HollowAcre/Wake/Kessler_LanternFlame.Kessler_LanternFlame")));
		MuzzleFlash->SetCollisionEnabled(ECollisionEnabled::NoCollision);
		MuzzleFlash->SetCastShadow(false);
		MuzzleFlash->SetupAttachment(Rifle);
		// (the flame cards stood along the barrel, out of the muzzle: their wick end at the muzzle)
		MuzzleFlash->SetRelativeTransform(FTransform(FRotator(-90.f, 0.f, 0.f), FVector(66.f - 11.f * 5.f, 0.f, 5.3f), FVector(5.f, 5.f, 5.f)));
		MuzzleFlash->SetVisibility(false);
		if (UMaterialInterface* Fm = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Materials/Play/M_Flame.M_Flame")))
		{
			MuzzleMID = UMaterialInstanceDynamic::Create(Fm, MuzzleFlash);
			MuzzleMID->SetScalarParameterValue(TEXT("Seed"), 4.1f);
			MuzzleFlash->SetMaterial(0, MuzzleMID);
		}
		MuzzleFlash->RegisterComponent();
	}
	UE_LOG(LogTemp, Display, TEXT("Kessler: up (body %s, take %s, lantern %d, rifle %d)"), Body.IsValid() ? TEXT("found") : TEXT("MISSING"), *Clip,
		(int32)(Lantern != nullptr), (int32)(Rifle != nullptr));
}

void AKessler::PlayClip(const FString& Name, bool bLoop)
{
	if (!Body.IsValid())
	{
		return;
	}
	if (UAnimSequence* A = LoadObject<UAnimSequence>(nullptr, *FString::Printf(TEXT("/Game/HollowAcre/Kessler/Mocap/%s.%s"), *Name, *Name)))
	{
		Body->PlayAnimation(A, bLoop);
	}
	else
	{
		UE_LOG(LogTemp, Warning, TEXT("Kessler: no take %s"), *Name);
	}
}

FVector AKessler::LanternAt() const
{
	return Lantern ? Lantern->GetComponentLocation() + FVector(0.f, 0.f, 15.f) : GetActorLocation() + FVector(0.f, 0.f, 90.f);
}

void AKessler::Tick(float Dt)
{
	Super::Tick(Dt);
	T += Dt;
	if (!Body.IsValid())
	{
		return;
	}
	if (bTest)
	{
		RunTest();
	}
	Locomote(Dt);
	if (Shown)
	{
		CopyPose();
		PoseUpper(Dt);
	}
	USkinnedMeshComponent* B = Shown ? static_cast<USkinnedMeshComponent*>(Shown) : static_cast<USkinnedMeshComponent*>(Body.Get());
	const float Yaw = GetActorRotation().Yaw;
	if (Lantern && B->GetBoneIndex(TEXT("hand_l")) != INDEX_NONE)
	{
		// (hung by its bail from the fist: the bail's grip at the hand, the lantern plumb under it, swinging a little as a
		// pendulum from the hand's own motion, damped)
		const FVector Hand = B->GetBoneLocation(TEXT("hand_l")) + FVector(0.f, 0.f, -4.f);
		const FVector HandV = Dt > 0.f && !HandWas.IsZero() ? (Hand - HandWas) / Dt : FVector::ZeroVector;
		HandWas = Hand;
		const FVector2D Push(-HandV.X, -HandV.Y);
		SwingV += (Push * 0.002f - Swing * 18.f) * Dt - SwingV * 2.5f * Dt;
		Swing += SwingV * Dt * 60.f;
		Swing = Swing.ClampAxes(-0.35f, 0.35f);
		const FQuat Hang = FQuat(FVector(1.f, 0.f, 0.f), Swing.Y) * FQuat(FVector(0.f, 1.f, 0.f), -Swing.X) * FRotator(0.f, Yaw, 0.f).Quaternion();
		Lantern->SetWorldLocationAndRotation(Hand - Hang.RotateVector(FVector(0.f, 0.f, 41.2f)), Hang);
		// (the flame's flicker: a kerosene flame is steadier than a fire, but it breathes and gutters in a draught)
		const float Fl = 0.86f + 0.07f * FMath::Sin(T * 7.3f) + 0.05f * FMath::Sin(T * 17.1f + 1.f) + 0.03f * FMath::Sin(T * 29.f);
		if (LanternLight)
		{
			LanternLight->SetIntensity(9.f * Fl);
		}
		if (FlameMID)
		{
			FlameMID->SetScalarParameterValue(TEXT("Intensity"), 2.2f * Fl);
		}
	}
	if (Rifle && B->GetBoneIndex(TEXT("hand_r")) != INDEX_NONE)
	{
		// (carried in the right hand at the wrist of its stock, the muzzle down along his leg; shouldered, from his
		// shoulder to what he aims at; between, eased from the one to the other)
		FTransform R = CarryRifle();
		if (AimW > 0.001f)
		{
			const FTransform A = AimRifle();
			R.SetLocation(FMath::Lerp(R.GetLocation(), A.GetLocation(), AimW));
			R.SetRotation(FQuat::Slerp(R.GetRotation(), A.GetRotation(), AimW).GetNormalized());
		}
		// (the kick: the muzzle jumps up and the butt comes back into his shoulder, settling in a quarter second)
		KickT += Dt;
		const float K = FMath::Exp(-KickT / 0.07f);
		if (K > 0.01f)
		{
			const FQuat Up(R.GetRotation().GetAxisY(), -FMath::DegreesToRadians(9.f) * K);
			R.SetRotation((Up * R.GetRotation()).GetNormalized());
			R.AddToTranslation(-R.GetRotation().GetAxisX() * 3.f * K);
		}
		Rifle->SetWorldTransform(R);
		const float Fk = FMath::Exp(-KickT / 0.022f);
		if (MuzzleLight)
		{
			MuzzleLight->SetIntensity(KickT < 0.12f ? 2200.f * Fk : 0.f);
		}
		if (MuzzleFlash)
		{
			MuzzleFlash->SetVisibility(KickT < 0.06f);
			if (MuzzleMID)
			{
				MuzzleMID->SetScalarParameterValue(TEXT("Intensity"), 30.f * Fk);
			}
		}
	}
}

FTransform AKessler::CarryRifle() const
{
	USkinnedMeshComponent* B = Shown ? static_cast<USkinnedMeshComponent*>(Shown) : static_cast<USkinnedMeshComponent*>(Body.Get());
	const FVector Hand = B->GetBoneLocation(TEXT("hand_r"));
	const FRotator Carry(-62.f, GetActorRotation().Yaw, 0.f);
	return FTransform(Carry, Hand - Carry.RotateVector(FVector(-4.f, 0.f, 0.5f)));
}

FTransform AKessler::AimRifle() const
{
	// shouldered: the butt's plate in the pocket of his right shoulder (in from the joint, a little low and forward), the
	// barrel from there to what he aims at
	if (!Shown)
	{
		return CarryRifle();
	}
	const int32 Hi = Shown->GetBoneIndex(TEXT("head"));
	if (!EyeRLocal.IsZero() && Hi != INDEX_NONE)
	{
		// (sighted: the line from his right eye to what he aims at runs down the sights; his eye 13 cm behind the
		// receiver and 10.5 above its foot, so the stock's comb is under his cheek and the butt comes back to his shoulder)
		const FVector Eye = Shown->GetBoneTransform(Hi).TransformPosition(EyeRLocal);
		const FVector Dir = (AimPoint - Eye).GetSafeNormal();
		const FQuat Q = FRotationMatrix::MakeFromXZ(Dir, FVector::UpVector).ToQuat();
		return FTransform(Q, Eye - Q.RotateVector(FVector(-13.f, 0.f, 10.5f)));
	}
	const FVector Sh = Shown->GetBoneLocation(TEXT("upperarm_r")), Ch = Shown->GetBoneLocation(TEXT("spine_05"));
	const FVector Side = (Sh - Ch).GetSafeNormal2D();
	const FVector Fwd = GetActorForwardVector();
	const FVector Pocket = Sh - Side * 5.f - FVector(0.f, 0.f, 6.f) + Fwd * 5.f;
	const FVector Dir = (AimPoint - Pocket).GetSafeNormal();
	const FQuat Q = FRotationMatrix::MakeFromXZ(Dir, FVector::UpVector).ToQuat();
	return FTransform(Q, Pocket - Q.RotateVector(FVector(-31.f, 0.f, -1.5f)));
}

FVector AKessler::EyesAt() const
{
	USkinnedMeshComponent* B = Shown ? static_cast<USkinnedMeshComponent*>(Shown) : static_cast<USkinnedMeshComponent*>(Body.Get());
	if (!B || B->GetBoneIndex(TEXT("head")) == INDEX_NONE)
	{
		return GetActorLocation() + FVector(0.f, 0.f, 168.f);
	}
	const FTransform H = B->GetBoneTransform(B->GetBoneIndex(TEXT("head")));
	return H.GetLocation() + H.GetRotation().RotateVector(FaceFwdLocal) * 9.f + FVector(0.f, 0.f, 6.f);
}

void AKessler::WalkTo(const FVector& At)
{
	Goal = At;
	bWalking = true;
	if (Body.IsValid())
	{
		Body->bPauseAnims = false;
	}
}

void AKessler::Halt()
{
	bWalking = false;
	FaceAt = GetActorLocation() + GetActorForwardVector() * 500.f;
}

void AKessler::AimAt(const FVector& At)
{
	AimPoint = At;
	AimWant = 1.f;
}

void AKessler::LowerRifle()
{
	AimWant = 0.f;
}

void AKessler::Fire(FVector& OutMuzzle, FVector& OutDir)
{
	KickT = 0.f;
	if (Rifle)
	{
		OutMuzzle = Rifle->GetComponentTransform().TransformPosition(FVector(66.f, 0.f, 5.3f));
		OutDir = Rifle->GetComponentQuat().GetAxisX();
	}
	else
	{
		OutMuzzle = EyesAt();
		OutDir = GetActorForwardVector();
	}
	UE_LOG(LogTemp, Display, TEXT("Kessler: fired from %s toward %s"), *OutMuzzle.ToCompactString(), *OutDir.ToCompactString());
}

float AKessler::GroundZ(const FVector& At) const
{
	FHitResult Hit;
	FCollisionQueryParams Q(TEXT("KesslerGround"), false, this);
	if (Man)
	{
		Q.AddIgnoredActor(Man);
	}
	if (GetWorld()->LineTraceSingleByChannel(Hit, At + FVector(0.f, 0.f, 150.f), At - FVector(0.f, 0.f, 400.f), ECC_Visibility, Q))
	{
		return Hit.ImpactPoint.Z;
	}
	return At.Z;
}

void AKessler::Locomote(float Dt)
{
	// his take walks forward in its own space; drawn where it is, he would walk off and snap back each loop. So: the
	// drift of his pelvis ahead is taken out of where his body is drawn (and the slow part of its sway to the side), and
	// he himself moves on by exactly what the take's steps moved this frame (his feet stay planted), toward his goal
	if (!Body.IsValid() || !Man)
	{
		return;
	}
	StandW = FMath::FInterpConstantTo(StandW, bWalking ? 0.f : 1.f, Dt, 2.2f);
	Body->bPauseAnims = !bWalking && StandW >= 0.999f;
	const FVector Pc = Body->GetBoneLocation(TEXT("pelvis"), EBoneSpaces::ComponentSpace);
	if (!bPelvisInit)
	{
		PelvisWas = Pc;
		bPelvisInit = true;
	}
	FVector Step = Pc - PelvisWas;
	PelvisWas = Pc;
	if (Step.Size2D() > 30.f)          // (the take looped: its pelvis jumped back to the start)
	{
		Step = StepWas;
	}
	else
	{
		StepWas = Step;
	}
	const float Walk = 1.f - StandW;
	Lat = FMath::Lerp(Lat, Pc.X - PelvisRef.X, 1.f - FMath::Exp(-Dt / 0.7f));
	const FVector OffCS(-Lat, -(Pc.Y - PelvisRef.Y), 0.f);     // (a MetaHuman's own frame: +Y ahead)
	const FVector OffW = Body->GetComponentQuat().RotateVector(OffCS) * Walk;
	FVector Loc = GetActorLocation();
	FRotator Rot = GetActorRotation();
	if (bWalking)
	{
		Loc += GetActorForwardVector() * FMath::Max(0.f, Step.Y) * Walk;
		const FVector To = (Goal - Loc).GetSafeNormal2D();
		if (!To.IsNearlyZero())
		{
			Rot.Yaw = FMath::FixedTurn(Rot.Yaw, To.Rotation().Yaw, 55.f * Dt);
		}
		if ((Goal - Loc).Size2D() < 35.f)
		{
			Halt();
		}
	}
	else if (!(FaceAt - Loc).IsNearlyZero(1.f))
	{
		// (standing: he turns where he means to face, by small steps; aiming, his body bladed a third of a turn right,
		// his left shoulder toward it, as a man shoulders a rifle)
		float Want = (FaceAt - Loc).GetSafeNormal2D().Rotation().Yaw;
		if (AimWant > 0.5f)
		{
			Want = (AimPoint - Loc).GetSafeNormal2D().Rotation().Yaw + 32.f;
		}
		Rot.Yaw = FMath::FixedTurn(Rot.Yaw, Want, 90.f * Dt);
	}
	Loc.Z = FMath::FInterpTo(Loc.Z, GroundZ(Loc), Dt, 12.f);
	SetActorLocationAndRotation(Loc, Rot);
	Man->SetActorLocation(Loc + OffW);
}

void AKessler::CopyPose()
{
	// the drawn body takes the take's pose (each bone relative to its parent), eased toward plain standing when he stops
	const TArray<FTransform>& CS = Body->GetComponentSpaceTransforms();
	const FReferenceSkeleton& R = Body->GetSkinnedAsset()->GetRefSkeleton();
	if (CS.Num() != R.GetNum() || Shown->BoneSpaceTransforms.Num() != R.GetNum() || RefLocal.Num() != R.GetNum())
	{
		return;
	}
	for (int32 i = 0; i < CS.Num(); ++i)
	{
		const int32 P = R.GetParentIndex(i);
		FTransform L = P == INDEX_NONE ? CS[i] : CS[i].GetRelativeTransform(CS[P]);
		if (StandW > 0.001f)
		{
			// (standing: every bone eased to how his body was built; Locomote eases his walk drift out with it)
			FTransform S = RefLocal[i];
			L.SetRotation(FQuat::Slerp(L.GetRotation(), S.GetRotation(), StandW).GetNormalized());
			L.SetTranslation(FMath::Lerp(L.GetTranslation(), S.GetTranslation(), StandW));
		}
		Shown->BoneSpaceTransforms[i] = L;
	}
	Shown->RefreshBoneTransforms();
}

void AKessler::SetCS(int32 Bone, const FTransform& World)
{
	Shown->SetBoneTransformByName(Shown->GetBoneName(Bone), World.GetRelativeTransform(Shown->GetComponentTransform()), EBoneSpaces::ComponentSpace);
	Shown->RefreshBoneTransforms();
}

void AKessler::ArmTo(bool bLeft, const FVector& HandAt, const FVector& Pole, float W)
{
	const int32 A = Shown->GetBoneIndex(bLeft ? TEXT("upperarm_l") : TEXT("upperarm_r"));
	const int32 Bn = Shown->GetBoneIndex(bLeft ? TEXT("lowerarm_l") : TEXT("lowerarm_r"));
	const int32 Cn = Shown->GetBoneIndex(bLeft ? TEXT("hand_l") : TEXT("hand_r"));
	if (W <= 0.001f || A == INDEX_NONE || Bn == INDEX_NONE || Cn == INDEX_NONE)
	{
		return;
	}
	FTransform Ta = Shown->GetBoneTransform(A), Tb = Shown->GetBoneTransform(Bn), Tc = Shown->GetBoneTransform(Cn);
	const FVector Target = FMath::Lerp(Tc.GetLocation(), HandAt, W);
	const FVector HandDir = Tc.GetLocation() - Tb.GetLocation();
	AnimationCore::SolveTwoBoneIK(Ta, Tb, Tc, Pole, Target, false, 1.f, 1.f);
	// (the hand turned with the forearm, its wrist as the take bent it)
	const FVector Fore = (Tc.GetLocation() - Tb.GetLocation()).GetSafeNormal();
	if (!HandDir.IsNearlyZero() && !Fore.IsNearlyZero())
	{
		const FQuat Turn = FQuat::FindBetweenNormals(HandDir.GetSafeNormal(), Fore);
		Tc.SetRotation(FQuat::Slerp(Tc.GetRotation(), Turn * Tc.GetRotation(), W).GetNormalized());
	}
	SetCS(A, Ta);
	SetCS(Bn, Tb);
	SetCS(Cn, Tc);
}

void AKessler::TurnHead(float W)
{
	// his eyes on something: the neck and head turned to it between them (a man's head turns about 70 degrees each way)
	if (W <= 0.001f || LookAtPoint.IsZero())
	{
		return;
	}
	const int32 Hi = Shown->GetBoneIndex(TEXT("head"));
	if (Hi == INDEX_NONE)
	{
		return;
	}
	const FTransform H = Shown->GetBoneTransform(Hi);
	const FVector Cur = H.GetRotation().RotateVector(FaceFwdLocal).GetSafeNormal();
	FVector Want = (LookAtPoint - H.GetLocation()).GetSafeNormal();
	const float Ang = FMath::Acos(FMath::Clamp(FVector::DotProduct(Cur, Want), -1.f, 1.f));
	const float MaxA = FMath::DegreesToRadians(70.f);
	FQuat Q = FQuat::FindBetweenNormals(Cur, Want);
	if (Ang > MaxA)
	{
		Q = FQuat::Slerp(FQuat::Identity, Q, MaxA / Ang);
	}
	struct FShare
	{
		const TCHAR* Bone;
		float Share;
	};
	static const FShare Shares[] = {{TEXT("neck_01"), 0.3f}, {TEXT("neck_02"), 0.3f}, {TEXT("head"), 0.4f}};
	for (const FShare& S : Shares)
	{
		const int32 i = Shown->GetBoneIndex(S.Bone);
		if (i == INDEX_NONE)
		{
			continue;
		}
		FTransform X = Shown->GetBoneTransform(i);
		X.SetRotation((FQuat::Slerp(FQuat::Identity, Q, S.Share * W) * X.GetRotation()).GetNormalized());
		SetCS(i, X);
	}
}

void AKessler::PoseUpper(float Dt)
{
	AimW = FMath::FInterpConstantTo(AimW, AimWant, Dt, 2.2f);
	LanternW = FMath::FInterpConstantTo(LanternW, LanternUp, Dt, 1.6f);
	HeadW = FMath::FInterpConstantTo(HeadW, LookAtPoint.IsZero() && AimWant < 0.5f ? 0.f : 1.f, Dt, 2.f);
	if (AimWant > 0.5f)
	{
		LookAtPoint = AimPoint;
	}
	TurnHead(HeadW);
	if (AimW > 0.001f)
	{
		// (his cheek down on the stock: the neck bowed forward, the head leaned toward his right shoulder)
		const float A = FMath::SmoothStep(0.f, 1.f, AimW);
		const FVector Side = GetActorRightVector();
		for (const TCHAR* N : {TEXT("neck_01"), TEXT("neck_02")})
		{
			const int32 i = Shown->GetBoneIndex(N);
			if (i != INDEX_NONE)
			{
				FTransform X = Shown->GetBoneTransform(i);
				X.SetRotation((FQuat(Side, FMath::DegreesToRadians(11.f) * A) * X.GetRotation()).GetNormalized());
				SetCS(i, X);
			}
		}
		const int32 Hi = Shown->GetBoneIndex(TEXT("head"));
		if (Hi != INDEX_NONE)
		{
			FTransform X = Shown->GetBoneTransform(Hi);
			const FVector Look = (AimPoint - X.GetLocation()).GetSafeNormal();
			X.SetRotation((FQuat(Look, -FMath::DegreesToRadians(13.f) * A) * X.GetRotation()).GetNormalized());
			SetCS(Hi, X);
		}
	}
	const FVector Up(0.f, 0.f, 1.f);
	const FVector Fwd = GetActorForwardVector(), Right = GetActorRightVector();
	const FVector ShL = Shown->GetBoneLocation(TEXT("upperarm_l")), ShR = Shown->GetBoneLocation(TEXT("upperarm_r"));
	const FVector Pel = Shown->GetBoneLocation(TEXT("pelvis"));
	// left hand: hanging at his side (standing) / the lantern held up before him / on the rifle's forend
	{
		FVector Hand = Pel - Right * 26.f + Fwd * 4.f - Up * 6.f;
		FVector Pole = ShL - Right * 14.f - Fwd * 20.f - Up * 30.f;
		float W = StandW;
		if (LanternW > 0.001f)
		{
			const FVector Dir = LanternToward.IsZero() ? Fwd : (LanternToward - ShL).GetSafeNormal2D();
			const FVector UpHand = ShL + Dir * 40.f + Up * 26.f - Right * 4.f;
			const float L = FMath::SmoothStep(0.f, 1.f, LanternW);
			Hand = FMath::Lerp(Hand, UpHand, L);
			Pole = FMath::Lerp(Pole, ShL - Right * 25.f - Up * 35.f + Dir * 5.f, L);
			W = FMath::Max(W, L);
		}
		if (AimW > 0.001f)
		{
			// (the forend, as far out along it as his arm reaches, the lantern's bail hooked on the same hand under it)
			const FTransform R = AimRifle();
			FVector Grip = R.TransformPosition(FVector(30.f, 0.f, 2.f));
			for (float X = 30.f; X > 6.f; X -= 3.f)
			{
				Grip = R.TransformPosition(FVector(X, 0.f, 2.f));
				if (FVector::Dist(Grip, ShL) < 50.f)
				{
					break;
				}
			}
			const float A = FMath::SmoothStep(0.f, 1.f, AimW);
			Hand = FMath::Lerp(Hand, Grip - Up * 3.f, A);
			Pole = FMath::Lerp(Pole, Grip - Up * 40.f - Right * 10.f - Fwd * 10.f, A);
			W = FMath::Max(W, A);
		}
		ArmTo(true, Hand, Pole, W);
	}
	// right hand: hanging with the rifle (standing) / at the stock's wrist, shouldered
	{
		FVector Hand = Pel + Right * 26.f + Fwd * 6.f - Up * 6.f;
		FVector Pole = ShR + Right * 14.f - Fwd * 20.f - Up * 30.f;
		float W = StandW;
		if (AimW > 0.001f)
		{
			const FTransform R = AimRifle();
			const FVector Grip = R.TransformPosition(FVector(-4.f, 0.f, 0.f));
			const float A = FMath::SmoothStep(0.f, 1.f, AimW);
			Hand = FMath::Lerp(Hand, Grip, A);
			Pole = FMath::Lerp(Pole, ShR + Right * 35.f - Up * 20.f - Fwd * 5.f, A);
			W = FMath::Max(W, A);
		}
		ArmTo(false, Hand, Pole, W);
	}
}

void AKessler::DressUp()
{
	// his work clothes over his own body (MetaHuman ships a T-shirt and shorts, hidden): his body drawn again under
	// M_KesslerClothes (Scripts/make_kessler_clothes.py: zones read from the reference pose against his own joints),
	// following his every bone: a duck-canvas chore coat to the upper thigh with a corduroy collar turned up, wool
	// trousers, high boots, leather gloves
	if (!Man || !Body.IsValid())
	{
		return;
	}
	TArray<USkeletalMeshComponent*> Sk;
	Man->GetComponents<USkeletalMeshComponent>(Sk);
	for (USkeletalMeshComponent* C : Sk)
	{
		const FString N = C->GetName();
		const bool bKeep = N == TEXT("Body") || N == TEXT("Face") || N.Contains(TEXT("Torso")) || N.Contains(TEXT("Legs")) || N.Contains(TEXT("Feet"));
		UE_LOG(LogTemp, Display, TEXT("Kessler: part %s (%s)%s"), *N, C->GetSkinnedAsset() ? *C->GetSkinnedAsset()->GetName() : TEXT("-"), bKeep ? TEXT("") : TEXT(": hidden"));
		if (!bKeep)
		{
			C->SetVisibility(false);
		}
	}
	USkeletalMesh* SM = Cast<USkeletalMesh>(Body->GetSkinnedAsset());
	UMaterialInterface* Cloth = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Materials/Blockout/M_KesslerClothes.M_KesslerClothes"));
	if (!SM || !Cloth)
	{
		return;
	}
	Clothes = NewObject<USkeletalMeshComponent>(Man, TEXT("KesslerClothes"));
	Clothes->SetSkeletalMeshAsset(SM);
	Clothes->SetupAttachment(Body.Get());
	Clothes->RegisterComponent();
	Clothes->SetLeaderPoseComponent(Shown ? static_cast<USkinnedMeshComponent*>(Shown) : static_cast<USkinnedMeshComponent*>(Body.Get()));
	if (FParse::Param(FCommandLine::Get(), TEXT("kesslernoskin")) && Shown)      // (debug: his clothes alone, to judge them)
	{
		Shown->SetVisibility(false, false);
	}
	UMaterialInstanceDynamic* D = UMaterialInstanceDynamic::Create(Cloth, this);
	for (int32 i = 0; i < Clothes->GetNumMaterials(); ++i)
	{
		Clothes->SetMaterial(i, D);
	}
	const FReferenceSkeleton& Rs = SM->GetRefSkeleton();
	const TArray<FTransform>& RefPose = Rs.GetRefBonePose();
	auto RefCS = [&](const TCHAR* Name)
	{
		int32 i = Rs.FindBoneIndex(FName(Name));
		FTransform T = FTransform::Identity;
		while (i != INDEX_NONE)
		{
			T = T * RefPose[i];
			i = Rs.GetParentIndex(i);
		}
		return T.GetLocation();
	};
	auto Abs = [](FVector V) { V.X = FMath::Abs(V.X); return V; };
	const FVector Sh = Abs(RefCS(TEXT("upperarm_l"))), El = Abs(RefCS(TEXT("lowerarm_l"))), Wr = Abs(RefCS(TEXT("hand_l")));
	const float PelvisZ = RefCS(TEXT("pelvis")).Z, FootZ = RefCS(TEXT("foot_l")).Z, NeckZ = RefCS(TEXT("neck_01")).Z;
	const float Hem = PelvisZ - 17.f, BootTop = FootZ + 17.f, CollarTop = NeckZ + 5.f;
	D->SetVectorParameterValue(TEXT("ArmS"), FLinearColor(Sh));
	D->SetVectorParameterValue(TEXT("ArmDir"), FLinearColor((El - Sh).GetSafeNormal()));
	D->SetVectorParameterValue(TEXT("WristP"), FLinearColor(Wr));
	D->SetVectorParameterValue(TEXT("ForeDir"), FLinearColor((Wr - El).GetSafeNormal()));
	D->SetVectorParameterValue(TEXT("ElbowP"), FLinearColor(El));
	D->SetScalarParameterValue(TEXT("ArmZ"), PelvisZ + 1.f);
	D->SetScalarParameterValue(TEXT("Hem"), Hem);                  // (a chore coat: to the upper thigh)
	D->SetScalarParameterValue(TEXT("AnkleZ"), BootTop);           // (high work boots)
	D->SetScalarParameterValue(TEXT("NeckZ"), CollarTop);          // (the collar turned up against the cold)
	// (a MetaHuman's face mesh runs down his neck to his upper chest, under where the body mesh stops: dressed the same
	// way below the collar, so no bare chest shows in the coat's front; above the collar it is cut away)
	for (USkeletalMeshComponent* C : Sk)
	{
		if (C->GetName() == TEXT("Face") && C->GetSkinnedAsset())
		{
			ClothesUpper = NewObject<USkeletalMeshComponent>(Man, TEXT("KesslerClothesUpper"));
			ClothesUpper->SetSkeletalMeshAsset(Cast<USkeletalMesh>(C->GetSkinnedAsset()));
			ClothesUpper->SetupAttachment(C);
			ClothesUpper->RegisterComponent();
			ClothesUpper->SetLeaderPoseComponent(C);
			for (int32 i = 0; i < ClothesUpper->GetNumMaterials(); ++i)
			{
				ClothesUpper->SetMaterial(i, D);
			}
		}
	}
	UE_LOG(LogTemp, Display, TEXT("Kessler: dressed (shoulder %s, elbow %s, wrist %s, pelvis %.0f, hem %.0f, boots %.0f, neck %.0f, collar %.0f)"), *Sh.ToString(), *El.ToString(), *Wr.ToString(), PelvisZ, Hem, BootTop, NeckZ, CollarTop);
}

void AKessler::CapOn()
{
	// his knit wool cap (tools/blender/make_kessler_props.py cap()) on his head, set from his own face's joints: the
	// cuff's front edge a few centimetres above his eyes, its back lower (a watch cap pulled down over the skull sits
	// tilted so); his receding hair under it hidden (the beard, brows and lashes kept)
	if (!Man)
	{
		return;
	}
	USkeletalMeshComponent* Fc = nullptr;
	TArray<USkeletalMeshComponent*> Sk;
	Man->GetComponents<USkeletalMeshComponent>(Sk);
	for (USkeletalMeshComponent* C : Sk)
	{
		if (C->GetName() == TEXT("Face"))
		{
			Fc = C;
		}
	}
	UStaticMesh* M = LoadObject<UStaticMesh>(nullptr, TEXT("/Game/HollowAcre/Wake/Kessler_Cap.Kessler_Cap"));
	if (!Fc || !M || !Fc->GetSkinnedAsset())
	{
		UE_LOG(LogTemp, Warning, TEXT("Kessler: no cap (face %d, mesh %d)"), Fc != nullptr, M != nullptr);
		return;
	}
	const FReferenceSkeleton& Rs = Fc->GetSkinnedAsset()->GetRefSkeleton();
	const TArray<FTransform>& RefPose = Rs.GetRefBonePose();
	auto RefT = [&](const TCHAR* Name)
	{
		int32 i = Rs.FindBoneIndex(FName(Name));
		FTransform T = FTransform::Identity;
		if (i == INDEX_NONE)
		{
			return TOptional<FTransform>();
		}
		while (i != INDEX_NONE)
		{
			T = T * RefPose[i];
			i = Rs.GetParentIndex(i);
		}
		return TOptional<FTransform>(T);
	};
	const TOptional<FTransform> H = RefT(TEXT("head")), L = RefT(TEXT("FACIAL_L_Eye")), R = RefT(TEXT("FACIAL_R_Eye"));
	if (!H || !L || !R)
	{
		UE_LOG(LogTemp, Warning, TEXT("Kessler: no cap (head %d, eyes %d %d)"), H.IsSet(), L.IsSet(), R.IsSet());
		return;
	}
	const FVector E = (L->GetLocation() + R->GetLocation()) * 0.5f;
	EyeRLocal = H->InverseTransformPosition(R->GetLocation());
	// (in his face's frame, Z up, facing +Y: the cap's centre 8.5 cm behind his eyes and 3 above them (the cuff to the tops of his ears), turned to face
	// his way, its brow tilted up 12 degrees)
	const FTransform CapCS(FRotator(12.f, 90.f, 0.f), E + FVector(0.f, -8.5f, 3.f));
	Cap = NewObject<UStaticMeshComponent>(Man, TEXT("KesslerCap"));
	Cap->SetStaticMesh(M);
	Cap->SetupAttachment(Fc, TEXT("head"));
	Cap->SetRelativeTransform(CapCS.GetRelativeTransform(*H));
	Cap->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	Cap->RegisterComponent();
	Tint(Cap, TEXT("wool"), FLinearColor(0.05f, 0.044f, 0.038f), 0.f, 0.96f);          // (dark heather wool)
	TArray<USceneComponent*> All;
	Man->GetComponents<USceneComponent>(All);
	for (USceneComponent* C : All)
	{
		if (C->GetClass()->GetName() == TEXT("GroomComponent"))
		{
			const bool bHide = C->GetName() == TEXT("Hair");
			UE_LOG(LogTemp, Display, TEXT("Kessler: groom %s%s"), *C->GetName(), bHide ? TEXT(": hidden (under the cap)") : TEXT(""));
			if (bHide)
			{
				C->SetVisibility(false);
			}
		}
	}
	UE_LOG(LogTemp, Display, TEXT("Kessler: cap on (eyes %s, head bone %s)"), *E.ToString(), *H->GetLocation().ToString());
}

void AKessler::RunTest()
{
	// (-kesslertest: what the story will ask of him, in order, toward the camera: walk on six metres, stop, eyes on the
	// camera, the lantern up to it, the rifle shouldered at it, a shot, the rifle down)
	const APlayerController* Pc = GetWorld()->GetFirstPlayerController();
	const FVector Cam = Pc && Pc->PlayerCameraManager ? Pc->PlayerCameraManager->GetCameraLocation() : GetActorLocation() + GetActorForwardVector() * 1000.f;
	auto At = [&](float Tm) { return T >= Tm && T - GetWorld()->GetDeltaSeconds() < Tm; };
	if (At(0.2f))
	{
		WalkTo(GetActorLocation() + GetActorForwardVector() * 600.f);
	}
	if (At(5.5f))
	{
		Halt();
		LookAtPoint = Cam;
		FaceTo(Cam);
	}
	if (At(6.5f))
	{
		LanternToward = Cam;
		LanternUp = 1.f;
	}
	if (At(9.f))
	{
		LanternUp = 0.f;
		AimAt(Cam + FVector(0.f, 0.f, -20.f));
	}
	if (At(11.f))
	{
		FVector M, D;
		Fire(M, D);
	}
	if (At(12.5f))
	{
		LowerRifle();
	}
}
