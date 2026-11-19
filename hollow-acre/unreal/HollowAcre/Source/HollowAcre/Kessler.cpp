#include "Kessler.h"
#include "Part2Story.h"

#include "Animation/AnimSequence.h"
#include "Components/PointLightComponent.h"
#include "Components/PoseableMeshComponent.h"
#include "AnimationRuntime.h"
#include "Engine/SkeletalMesh.h"
#include "Misc/CommandLine.h"
#include "TwoBoneIK.h"
#include "Components/SkeletalMeshComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "Engine/World.h"
#include "GameFramework/PlayerController.h"
#include "Camera/PlayerCameraManager.h"
#include "Kismet/GameplayStatics.h"
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
		LanternLight->SetTemperature(2250.f);
		LanternLight->SetSourceRadius(4.f);
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
	Rim = NewObject<UPointLightComponent>(this, TEXT("Rim"));
	Rim->SetupAttachment(GetRootComponent());
	Rim->SetRelativeLocation(FVector(-120.f, 30.f, 240.f));
	Rim->SetIntensityUnits(ELightUnits::Candelas);
	Rim->SetIntensity(2.5f);
	Rim->SetAttenuationRadius(320.f);
	Rim->SetUseTemperature(true);
	Rim->SetTemperature(9000.f);
	Rim->SetCastShadows(false);
	Rim->SetVolumetricScatteringIntensity(0.f);
	Rim->RegisterComponent();
	UE_LOG(LogTemp, Display, TEXT("Kessler: up (body %s, take %s, lantern %d, rifle %d)"), Body.IsValid() ? TEXT("found") : TEXT("MISSING"), *Clip,
		(int32)(Lantern != nullptr), (int32)(Rifle != nullptr));
}

void AKessler::PlayClip(const FString& Name, bool bLoop)
{
	if (!Body.IsValid() || Name == Playing)
	{
		return;
	}
	const FString Path = Name.StartsWith(TEXT("MH:"))
		? FString::Printf(TEXT("/MetaHumanCharacter/Optional/Animation/UEFNAnimPreset/Locomotion/AS_MH_Neutral_%s.AS_MH_Neutral_%s"), *Name.Mid(3), *Name.Mid(3))
		: FString::Printf(TEXT("/Game/HollowAcre/Kessler/Mocap/%s.%s"), *Name, *Name);
	if (UAnimSequence* A = LoadObject<UAnimSequence>(nullptr, *Path))
	{
		// (the drawn pose held and faded from, so the change of take doesn't jump)
		if (Shown && Shown->BoneSpaceTransforms.Num() > 0 && !Playing.IsEmpty())
		{
			XFadeFrom = Shown->BoneSpaceTransforms;
			XFadeT = 0.f;
		}
		Body->PlayAnimation(A, bLoop);
		Body->SetPlayRate(Name.Contains(TEXT("Walk")) ? WalkRate : 1.f);
		Playing = Name;
		bPelvisInit = false;
	}
	else
	{
		UE_LOG(LogTemp, Warning, TEXT("Kessler: no take %s"), *Path);
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
		PoseLower(Dt);
		PoseUpper(Dt);
		// (the scene's reaches: over whatever the upper body did, a hand to a point)
		ReachRW = FMath::FInterpTo(ReachRW, ReachRWant, Dt, 2.4f);
		ReachLW = FMath::FInterpTo(ReachLW, ReachLWant, Dt, 2.4f);
		const FVector Up(0.f, 0.f, 1.f), Fw = GetActorForwardVector(), Rt = GetActorRightVector();
		if (ReachRW > 0.001f && !ReachR.IsZero())
		{
			const FVector ShR = Shown->GetBoneLocation(TEXT("upperarm_r"));
			ArmTo(false, ReachR, ShR + Rt * 30.f - Up * 35.f - Fw * 12.f, FMath::SmoothStep(0.f, 1.f, ReachRW));
			Grip(false, 1.f);
		}
		if (ReachLW > 0.001f && !ReachL.IsZero())
		{
			const FVector ShL = Shown->GetBoneLocation(TEXT("upperarm_l"));
			ArmTo(true, ReachL, ShL - Rt * 30.f - Up * 35.f - Fw * 12.f, FMath::SmoothStep(0.f, 1.f, ReachLW));
			Grip(true, 1.f);
		}
		Breathe(Dt);
	}
	if (Shown && HeldR.IsValid() && Shown->GetBoneIndex(TEXT("hand_r")) != INDEX_NONE)
	{
		HeldR->SetWorldTransform(HeldROffset * Shown->GetBoneTransform(Shown->GetBoneIndex(TEXT("hand_r"))));
	}
	if (Shown && HeldL.IsValid() && Shown->GetBoneIndex(TEXT("hand_l")) != INDEX_NONE)
	{
		HeldL->SetWorldTransform(HeldLOffset * Shown->GetBoneTransform(Shown->GetBoneIndex(TEXT("hand_l"))));
	}
	USkinnedMeshComponent* B = Shown ? static_cast<USkinnedMeshComponent*>(Shown) : static_cast<USkinnedMeshComponent*>(Body.Get());
	const float Yaw = GetActorRotation().Yaw;
	if (Lantern && B->GetBoneIndex(TEXT("hand_l")) != INDEX_NONE)
	{
		// (hung by its bail from the fist: the bail's grip at the hand, the lantern plumb under it, swinging a little as a
		// pendulum from the hand's own motion, damped)
		FVector Hand = B->GetBoneLocation(TEXT("hand_l")) + FVector(0.f, 0.f, -4.f);
		// (with the rifle up, its bail hooked on his belt at the left hip, out of the way of the forend (blind judge,
		// round 12: hung from the forend hand it hung in front of his chest); slid there and back as the rifle comes up and
		// goes down; it lights his legs and the snow at his feet from there)
		if (AimW > 0.001f && B->GetBoneIndex(TEXT("pelvis")) != INDEX_NONE)
		{
			const FVector Belt = B->GetBoneLocation(TEXT("pelvis")) - GetActorRightVector() * 29.f + GetActorForwardVector() * 6.f + FVector(0.f, 0.f, 4.f);   // (clear of his coat: the lantern is 19 cm across)
			Hand = FMath::Lerp(Hand, Belt, FMath::SmoothStep(0.f, 1.f, AimW));
		}
		const FVector HandV = Dt > 0.f && !HandWas.IsZero() ? (Hand - HandWas) / Dt : FVector::ZeroVector;
		HandWas = Hand;
		const FVector2D Push(-HandV.X, -HandV.Y);
		SwingV += (Push * 0.002f - Swing * 18.f) * Dt - SwingV * 2.5f * Dt;
		Swing += SwingV * Dt * 60.f;
		Swing = Swing.ClampAxes(-0.35f, 0.35f);
		const FQuat Hang = FQuat(FVector(1.f, 0.f, 0.f), Swing.Y) * FQuat(FVector(0.f, 1.f, 0.f), -Swing.X) * FRotator(0.f, Yaw, 0.f).Quaternion();
		if (!LanternSetAt.IsZero())
		{
			// (set down, standing on its base where he put it)
			Lantern->SetWorldLocationAndRotation(LanternSetAt, FRotator(0.f, Yaw + 20.f, 0.f).Quaternion());
		}
		else
		{
			Lantern->SetWorldLocationAndRotation(Hand - Hang.RotateVector(FVector(0.f, 0.f, 41.2f)), Hang);
		}
		// (the flame's flicker: a kerosene flame is steadier than a fire, but it breathes and gutters in a draught)
		const float Fl = 0.86f + 0.07f * FMath::Sin(T * 7.3f) + 0.05f * FMath::Sin(T * 17.1f + 1.f) + 0.03f * FMath::Sin(T * 29.f);
		// (far off in the trees, a lantern is seen as its flame and the glow it makes in the falling snow round it, not
		// as the little lamp itself (blind judge, round 12: at 56 m it was "a speck of a few pixels"); close by, the glow
		// in the air would hang over the view as a disc, so it fades in only past 15 m)
		const APawn* Pl = UGameplayStatics::GetPlayerPawn(this, 0);
		const float Far = Pl ? FMath::Clamp((FVector::Dist(Pl->GetActorLocation(), GetActorLocation()) - 1500.f) / 3000.f, 0.f, 1.f) : 0.f;
		if (LanternLight)
		{
			LanternLight->SetIntensity(3.6f * Fl * LanternTrim);
			// (set down indoors: no glow in the air; inside the shed it hung as an orange blur over the view)
			LanternLight->SetVolumetricScatteringIntensity(LanternSetAt.IsZero() ? FMath::Lerp(0.4f, 5.f, Far) : 0.f);
		}
		if (FlameMID)
		{
			FlameMID->SetScalarParameterValue(TEXT("Intensity"), 1.2f * Fl * (1.f + 3.f * Far) * FMath::Lerp(0.35f, 1.f, LanternTrim));
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
		Rifle->SetWorldTransform(bRifleSet ? RifleSet : R);
		const float Fk = FMath::Exp(-KickT / 0.045f);
		if (MuzzleLight)
		{
			MuzzleLight->SetIntensity(KickT < 0.2f ? 7000.f * Fk : 0.f);
		}
		if (MuzzleFlash)
		{
			MuzzleFlash->SetVisibility(KickT < 0.075f);
			if (MuzzleMID)
			{
				MuzzleMID->SetScalarParameterValue(TEXT("Intensity"), 30.f * Fk);
			}
		}
	}
	FaceTick(Dt);       // (last: after her pose is set this frame)
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

void AKessler::WalkTo(const FVector& At, bool bRun)
{
	Goal = At;
	const TCHAR* Want = bRun ? TEXT("MH:Run_Loop_F") : TEXT("MH:Walk_Loop_F");
	if (!bWalking || Playing != Want)
	{
		bWalking = true;
		PlayClip(Want, true);
	}
}

void AKessler::Halt()
{
	if (bWalking)
	{
		bWalking = false;
		PlayClip(TEXT("MH:Stand_Idle_Loop"), true);
	}
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
	// (the ground under his feet: what is static, at most a half-metre step up (he has no collision of his own: a trace
	// from higher once found a shed's roof as he passed through it and he walked off into the air))
	FHitResult Hit;
	FCollisionQueryParams Q(TEXT("KesslerGround"), false, this);
	if (Man)
	{
		Q.AddIgnoredActor(Man);
	}
	FCollisionObjectQueryParams O(ECC_WorldStatic);
	if (GetWorld()->LineTraceSingleByObjectType(Hit, At + FVector(0.f, 0.f, 50.f), At - FVector(0.f, 0.f, 400.f), O, Q) && !Hit.bStartPenetrating)
	{
		return Hit.ImpactPoint.Z;
	}
	return At.Z;
}

FVector AKessler::Steer(const FVector& From, const FVector& Dir) const
{
	// round the camp's buildings and the trees (as the hunting husk goes round them): the way ahead swept at the chest;
	// if it is blocked, the nearest free way
	FCollisionQueryParams Q(TEXT("KesslerSteer"), true, this);
	if (Man)
	{
		Q.AddIgnoredActor(Man);
	}
	const FVector Chest = From + FVector(0.f, 0.f, 110.f);
	for (float Off : {0.f, 20.f, -20.f, 40.f, -40.f, 65.f, -65.f, 90.f, -90.f, 120.f, -120.f})
	{
		const FVector D = FRotator(0.f, Off, 0.f).RotateVector(Dir);
		FHitResult H;
		if (!GetWorld()->SweepSingleByChannel(H, Chest, Chest + D * 260.f, FQuat::Identity, ECC_WorldStatic, FCollisionShape::MakeSphere(40.f), Q))
		{
			return D;
		}
	}
	return Dir;
}

void AKessler::Locomote(float Dt)
{
	// where he is drawn and how he moves, from his take: the drift of his pelvis ahead (a take that walks across the
	// floor) is taken out of where his body is drawn, with the slow part of its sway to the side; he moves on by what
	// keeps his planted foot still on the ground (the pelvis's step ahead, less the planted foot's slide back: an
	// in-place loop slides the foot, a walk across the floor moves the pelvis), toward his goal
	if (!Body.IsValid() || !Man)
	{
		return;
	}
	StandW = FMath::FInterpConstantTo(StandW, bWalking ? 0.f : 1.f, Dt, 2.2f);
	const FVector Pc = Body->GetBoneLocation(TEXT("pelvis"), EBoneSpaces::ComponentSpace);
	const FVector Fc[2] = {Body->GetBoneLocation(TEXT("foot_l"), EBoneSpaces::ComponentSpace), Body->GetBoneLocation(TEXT("foot_r"), EBoneSpaces::ComponentSpace)};
	if (!bPelvisInit)
	{
		PelvisWas = Pc;
		FootWas[0] = Fc[0];
		FootWas[1] = Fc[1];
		bPelvisInit = true;
	}
	const int32 Plant = Fc[0].Z <= Fc[1].Z ? 0 : 1;
	if (bWalking && Plant != PlantWas && Shown)
	{
		// (a boot's print where the foot comes down)
		const FVector F = Shown->GetBoneLocation(Plant == 0 ? TEXT("foot_l") : TEXT("foot_r"));
		P2Footprint(GetWorld(), FVector(F.X, F.Y, GetActorLocation().Z + 15.f), GetActorRotation().Yaw, 31.f, false);
	}
	PlantWas = Plant;
	FVector Step = (Pc - PelvisWas) - (Fc[Plant] - FootWas[Plant]);
	PelvisWas = Pc;
	FootWas[0] = Fc[0];
	FootWas[1] = Fc[1];
	if (Step.Size2D() > 30.f)          // (the take looped: back to its start)
	{
		Step = StepWas;
	}
	else
	{
		StepWas = Step;
	}
	Lat = FMath::Lerp(Lat, Pc.X - PelvisRef.X, 1.f - FMath::Exp(-Dt / 0.7f));
	const FVector OffCS(-Lat, -(Pc.Y - PelvisRef.Y), 0.f);     // (a MetaHuman's own frame: +Y ahead)
	const FVector OffW = Body->GetComponentQuat().RotateVector(OffCS);
	FVector Loc = GetActorLocation();
	FRotator Rot = GetActorRotation();
	if (bWalking)
	{
		Loc += GetActorForwardVector() * FMath::Max(0.f, Step.Y);
		FVector To = (Goal - Loc).GetSafeNormal2D();
		if (!To.IsNearlyZero())
		{
			To = Steer(Loc, To);
			Rot.Yaw = FMath::FixedTurn(Rot.Yaw, To.Rotation().Yaw, 80.f * Dt);
		}
		if ((Goal - Loc).Size2D() < 35.f)
		{
			Halt();
		}
	}
	else if (!(FaceAt - Loc).IsNearlyZero(1.f))
	{
		// (standing: he turns where he means to face; aiming, his body bladed a third of a turn right, his left
		// shoulder toward it, as a man shoulders a rifle)
		float Want = (FaceAt - Loc).GetSafeNormal2D().Rotation().Yaw;
		if (AimWant > 0.5f)
		{
			Want = (AimPoint - Loc).GetSafeNormal2D().Rotation().Yaw + 14.f;
		}
		Rot.Yaw = FMath::FixedTurn(Rot.Yaw, Want, 90.f * Dt);
	}
	Loc.Z = FMath::FInterpTo(Loc.Z, GroundZ(Loc), Dt, 12.f);
	SetActorLocationAndRotation(Loc, Rot);
	Man->SetActorLocation(Loc + OffW);
}

void AKessler::CopyPose()
{
	// the drawn body takes the take's pose (each bone relative to its parent), faded in from the last take's when it
	// changed
	const TArray<FTransform>& CS = Body->GetComponentSpaceTransforms();
	const FReferenceSkeleton& R = Body->GetSkinnedAsset()->GetRefSkeleton();
	if (CS.Num() != R.GetNum() || Shown->BoneSpaceTransforms.Num() != R.GetNum())
	{
		return;
	}
	XFadeT += GetWorld()->GetDeltaSeconds();
	const float F = XFadeFrom.Num() == CS.Num() && XFadeT < XFadeLen ? FMath::SmoothStep(0.f, 1.f, XFadeT / XFadeLen) : 1.f;
	for (int32 i = 0; i < CS.Num(); ++i)
	{
		const int32 P = R.GetParentIndex(i);
		FTransform L = P == INDEX_NONE ? CS[i] : CS[i].GetRelativeTransform(CS[P]);
		if (F < 1.f)
		{
			const FTransform& A = XFadeFrom[i];
			L.SetRotation(FQuat::Slerp(A.GetRotation(), L.GetRotation(), F).GetNormalized());
			L.SetTranslation(FMath::Lerp(A.GetTranslation(), L.GetTranslation(), F));
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
	// left hand: hanging at his side (standing) / the lantern held up before him / on the rifle's forend
	{
		FVector Hand = Shown->GetBoneLocation(TEXT("hand_l"));
		FVector Pole = ShL - Right * 14.f - Fwd * 20.f - Up * 30.f;
		float W = 0.f;
		if (LanternW > 0.001f)
		{
			const FVector Dir = LanternToward.IsZero() ? Fwd : (LanternToward - ShL).GetSafeNormal2D();
			// (the fist at his head's height; held up to a face close by, higher, so the light is at their eyes)
			const bool bClose = !LanternToward.IsZero() && FVector::Dist2D(LanternToward, ShL) < 320.f;
			const float Lift = bClose ? FMath::Clamp(LanternToward.Z + 22.f - ShL.Z, -25.f, 26.f) + 2.f * FMath::Sin(T * 1.3f) : 12.f;
			const FVector UpHand = ShL + Dir * (bClose ? 58.f : 44.f) + Up * Lift - Right * 4.f;
			const float L = FMath::SmoothStep(0.f, 1.f, LanternW);
			Hand = FMath::Lerp(Hand, UpHand, L);
			Pole = FMath::Lerp(Pole, ShL - Right * 25.f - Up * 35.f + Dir * 5.f, L);
			W = FMath::Max(W, L);
		}
		if (AimW > 0.001f)
		{
			// (the forend, as far out along it as his arm reaches, the lantern's bail hooked on the same hand under it: out
			// under the barrel, plainly hanging from the rifle, not in front of his chest (blind judge, round 12))
			const FTransform R = AimRifle();
			FVector Grip = R.TransformPosition(FVector(40.f, 0.f, 2.f));
			for (float X = 40.f; X > 6.f; X -= 3.f)
			{
				Grip = R.TransformPosition(FVector(X, 0.f, 2.f));
				if (FVector::Dist(Grip, ShL) < 57.f)
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
		FVector Hand = Shown->GetBoneLocation(TEXT("hand_r"));
		FVector Pole = ShR + Right * 14.f - Fwd * 20.f - Up * 30.f;
		float W = 0.f;
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
	// (his fists: the lantern's bail in the left, the rifle's wrist in the right)
	Grip(true, Lantern && LanternSetAt.IsZero() ? 1.f : 0.25f);
	Grip(false, Rifle && !bRifleSet ? 1.f : 0.25f);
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
	// (dark: a waxed canvas coat gone olive-black with years of work; any brown under his own 2250 K lantern read as bare
	// skin (blind judges, rounds 11 and 12), so it is cooler than his skin and much darker)
	D->SetVectorParameterValue(TEXT("CoatColor"), FLinearColor(0.03f, 0.033f, 0.025f));
	D->SetVectorParameterValue(TEXT("CollarColor"), FLinearColor(0.03f, 0.02f, 0.013f));
	D->SetVectorParameterValue(TEXT("TrousersColor"), FLinearColor(0.019f, 0.019f, 0.021f));
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
	// his coat (Scripts/build_kessler_coat.py: a skinned mesh of its own from his body, with his reference pose: it stands
	// off him, falls straight from the chest, a skirt to mid-thigh, the collar up), drawn in the same material's coat zone
	if (USkeletalMesh* CoatMesh = LoadObject<USkeletalMesh>(nullptr, TEXT("/Game/HollowAcre/Kessler/Coat/SKM_Kessler_Coat.SKM_Kessler_Coat")))
	{
		Coat = NewObject<USkeletalMeshComponent>(Man, TEXT("KesslerCoat"));
		Coat->SetSkeletalMeshAsset(CoatMesh);
		Coat->SetupAttachment(Body.Get());
		Coat->RegisterComponent();
		Coat->SetLeaderPoseComponent(Shown ? static_cast<USkinnedMeshComponent*>(Shown) : static_cast<USkinnedMeshComponent*>(Body.Get()));
		Coat->SetForcedLOD(1);           // (only its first level is the coat: the copy's lower levels are still his body)
		UMaterialInstanceDynamic* Cd = UMaterialInstanceDynamic::Create(Cloth, this);
		Cd->CopyParameterOverrides(D);
		Cd->SetScalarParameterValue(TEXT("ClothOut"), 0.f);               // (it stands off him already)
		Cd->SetScalarParameterValue(TEXT("Hem"), 56.f);                   // (all coat, down to the skirt's edge; its low pockets on the skirt)
		Cd->SetScalarParameterValue(TEXT("AnkleZ"), -1000.f);
		Cd->SetScalarParameterValue(TEXT("NeckZ"), CollarTop + 4.f);      // (its stood collar coloured, nothing cut)
		Cd->SetVectorParameterValue(TEXT("WristP"), FLinearColor(Wr + (Wr - El).GetSafeNormal() * 4.f));   // (no glove on its cuff)
		for (int32 i = 0; i < Coat->GetNumMaterials(); ++i)
		{
			Coat->SetMaterial(i, Cd);
		}
		UE_LOG(LogTemp, Display, TEXT("Kessler: his coat on (%d LODs in its mesh)"), CoatMesh->GetLODNum());
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

void AKessler::Grip(bool bLeft, float W)
{
	// each finger curled about the hand's own side-to-side axis (index to little finger), toward the palm (the side the
	// thumb sits on), its three joints a little less than a fist's; the thumb's last two joints over them
	const TCHAR* Sx = bLeft ? TEXT("_l") : TEXT("_r");
	auto Idx = [&](const TCHAR* B) { return Shown->GetBoneIndex(FName(*FString::Printf(TEXT("%s%s"), B, Sx))); };
	const int32 Hd = Idx(TEXT("hand")), I1 = Idx(TEXT("index_01")), P1 = Idx(TEXT("pinky_01")), M1 = Idx(TEXT("middle_01")), T2 = Idx(TEXT("thumb_02"));
	if (W <= 0.001f || Hd == INDEX_NONE || I1 == INDEX_NONE || P1 == INDEX_NONE || M1 == INDEX_NONE || T2 == INDEX_NONE)
	{
		return;
	}
	const FVector H = Shown->GetBoneLocation(Shown->GetBoneName(Hd));
	const FVector F = (Shown->GetBoneLocation(Shown->GetBoneName(M1)) - H).GetSafeNormal();
	FVector Side = Shown->GetBoneLocation(Shown->GetBoneName(I1)) - Shown->GetBoneLocation(Shown->GetBoneName(P1));
	Side = (Side - F * FVector::DotProduct(Side, F)).GetSafeNormal();
	FVector Palm = Shown->GetBoneLocation(Shown->GetBoneName(T2)) - H;
	Palm = (Palm - F * FVector::DotProduct(Palm, F) - Side * FVector::DotProduct(Palm, Side)).GetSafeNormal();
	// (turning about Side by +a moves a fingertip along Side x F: the sign that sends it to the palm)
	const float Sgn = FVector::DotProduct(FVector::CrossProduct(Side, F), Palm) >= 0.f ? 1.f : -1.f;
	static const float Bend[3] = {62.f, 78.f, 52.f};
	for (const TCHAR* Fn : {TEXT("index"), TEXT("middle"), TEXT("ring"), TEXT("pinky")})
	{
		for (int32 j = 0; j < 3; ++j)
		{
			const int32 B = Idx(*FString::Printf(TEXT("%s_0%d"), Fn, j + 1));
			if (B == INDEX_NONE)
			{
				continue;
			}
			FTransform X = Shown->GetBoneTransform(B);
			X.SetRotation((FQuat(Side, Sgn * FMath::DegreesToRadians(Bend[j]) * W) * X.GetRotation()).GetNormalized());
			SetCS(B, X);
		}
	}
	for (int32 j = 2; j <= 3; ++j)
	{
		const int32 B = Idx(*FString::Printf(TEXT("thumb_0%d"), j));
		if (B != INDEX_NONE)
		{
			FTransform X = Shown->GetBoneTransform(B);
			X.SetRotation((FQuat(Side, Sgn * FMath::DegreesToRadians(28.f) * W) * X.GetRotation()).GetNormalized());
			SetCS(B, X);
		}
	}
}

void AKessler::Breathe(float Dt)
{
	if (!bBreathShows)
	{
		// (and those already breathed gone: left, they hung frozen in the air where he came in)
		for (FPuff& P : Puffs)
		{
			if (UStaticMeshComponent* C = P.C.Get())
			{
				C->DestroyComponent();
			}
		}
		Puffs.Reset();
		return;
	}
	// a breath out every few seconds (quicker after running), a short plume from his mouth, thin and lit only where his
	// lantern catches it (M_Breath, as the player's own)
	// (kept from the garbage collector: held only here)
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
	const int32 Hi = Shown->GetBoneIndex(TEXT("head"));
	if (!Ball || !Vapour || Hi == INDEX_NONE)
	{
		return;
	}
	const FTransform H = Shown->GetBoneTransform(Hi);
	const FVector Fw = H.GetRotation().RotateVector(FaceFwdLocal).GetSafeNormal();
	const FVector Mouth = EyesAt() - FVector(0.f, 0.f, 9.f) + Fw * 6.f;
	BreathT -= Dt;
	if (BreathT <= 0.f)
	{
		const bool bHard = Playing.Contains(TEXT("Run")) || XFadeT < 2.5f;
		BreathT = (bHard ? 1.5f : 3.6f) * FMath::FRandRange(0.85f, 1.15f);
		for (int32 i = 0; i < 4; ++i)
		{
			UStaticMeshComponent* C = NewObject<UStaticMeshComponent>(this);
			C->SetStaticMesh(Ball);
			UMaterialInstanceDynamic* M = UMaterialInstanceDynamic::Create(Vapour, C);
			M->SetScalarParameterValue(TEXT("Opacity"), 0.f);
			C->SetMaterial(0, M);
			C->SetCollisionEnabled(ECollisionEnabled::NoCollision);
			C->SetCastShadow(false);
			C->SetMobility(EComponentMobility::Movable);
			C->SetWorldLocation(Mouth);
			C->SetWorldScale3D(FVector(0.04f));
			C->RegisterComponent();
			FPuff P;
			P.C = C;
			P.M = M;
			P.V = Fw * FMath::FRandRange(45.f, 65.f) - FVector(0.f, 0.f, FMath::FRandRange(3.f, 9.f));
			P.Age = -0.14f * i;
			P.Life = FMath::FRandRange(1.4f, 1.9f);
			P.R0 = FMath::FRandRange(2.f, 3.f);
			P.R1 = FMath::FRandRange(10.f, 15.f);
			P.Peak = FMath::FRandRange(0.07f, 0.11f);
			Puffs.Add(P);
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
			C->SetWorldLocation(Mouth);
			continue;
		}
		if (P.Age > P.Life)
		{
			C->DestroyComponent();
			Puffs.RemoveAtSwap(i);
			continue;
		}
		P.V *= FMath::Max(0.f, 1.f - 1.6f * Dt);
		P.V.Z += 9.f * Dt;
		C->SetWorldLocation(C->GetComponentLocation() + P.V * Dt);
		const float R = FMath::Lerp(P.R0, P.R1, 1.f - FMath::Exp(-P.Age * 2.2f));
		C->SetWorldScale3D(FVector(R / 50.f));
		if (UMaterialInstanceDynamic* M = P.M.Get())
		{
			M->SetScalarParameterValue(TEXT("Opacity"), P.Peak * FMath::SmoothStep(0.f, 0.15f, P.Age) * FMath::Pow(1.f - P.Age / P.Life, 1.6f));
		}
	}
}

void AKessler::LitByAll()
{
	TArray<UPrimitiveComponent*> Ps;
	if (Man)
	{
		Man->GetComponents<UPrimitiveComponent>(Ps);
	}
	TArray<UPrimitiveComponent*> Mine;
	GetComponents<UPrimitiveComponent>(Mine);
	Ps.Append(Mine);
	for (UPrimitiveComponent* P : Ps)
	{
		P->SetLightingChannels(true, true, true);
	}
}

FTransform AKessler::BoneAt(const TCHAR* Bone) const
{
	USkinnedMeshComponent* B = Shown ? static_cast<USkinnedMeshComponent*>(Shown) : static_cast<USkinnedMeshComponent*>(Body.Get());
	const int32 I = B ? B->GetBoneIndex(Bone) : INDEX_NONE;
	return I == INDEX_NONE ? GetActorTransform() : B->GetBoneTransform(I);
}

void AKessler::LegTo(bool bLeft, const FVector& FootAt, const FVector& Pole, const FQuat& FootRot)
{
	const int32 A = Shown->GetBoneIndex(bLeft ? TEXT("thigh_l") : TEXT("thigh_r"));
	const int32 Bn = Shown->GetBoneIndex(bLeft ? TEXT("calf_l") : TEXT("calf_r"));
	const int32 Cn = Shown->GetBoneIndex(bLeft ? TEXT("foot_l") : TEXT("foot_r"));
	if (A == INDEX_NONE || Bn == INDEX_NONE || Cn == INDEX_NONE)
	{
		return;
	}
	FTransform Ta = Shown->GetBoneTransform(A), Tb = Shown->GetBoneTransform(Bn), Tc = Shown->GetBoneTransform(Cn);
	AnimationCore::SolveTwoBoneIK(Ta, Tb, Tc, Pole, FootAt, false, 1.f, 1.f);
	Tc.SetRotation(FootRot);
	SetCS(A, Ta);
	SetCS(Bn, Tb);
	SetCS(Cn, Tc);
}

void AKessler::PoseLower(float Dt)
{
	// (down on his heels at a stove: the pelvis down about half a metre and back over the heels, the trunk forward over
	// the knees, the feet planted where they stood; sat on the floor against the door: the pelvis down near the boards and
	// back to the wall, the trunk leaned back on it, the knees up and the feet out ahead)
	CrouchW = FMath::FInterpTo(CrouchW, CrouchWant, Dt, 1.5f);
	SitW = FMath::FInterpTo(SitW, SitWant, Dt, 1.1f);
	const float C = FMath::SmoothStep(0.f, 1.f, CrouchW), S = FMath::SmoothStep(0.f, 1.f, SitW);
	if (C < 0.002f && S < 0.002f)
	{
		return;
	}
	const int32 Pi = Shown->GetBoneIndex(TEXT("pelvis"));
	const int32 Fl = Shown->GetBoneIndex(TEXT("foot_l")), Fr = Shown->GetBoneIndex(TEXT("foot_r"));
	if (Pi == INDEX_NONE || Fl == INDEX_NONE || Fr == INDEX_NONE)
	{
		return;
	}
	const FVector Up(0.f, 0.f, 1.f), Fwd = GetActorForwardVector(), Right = GetActorRightVector();
	const FTransform FL0 = Shown->GetBoneTransform(Fl), FR0 = Shown->GetBoneTransform(Fr);
	const float FloorZ = FMath::Min(FL0.GetLocation().Z, FR0.GetLocation().Z) - 8.f;
	FTransform P = Shown->GetBoneTransform(Pi);
	const float PelvisUp = P.GetLocation().Z - FloorZ;                  // (about 95 cm standing)
	const float Drop = C * 52.f + S * FMath::Max(0.f, PelvisUp - 14.f);
	const float Back = C * 14.f + S * 18.f;
	P.AddToTranslation(-Up * Drop - Fwd * Back);
	SetCS(Pi, P);
	// (the trunk: forward over the knees crouched, back against the wall sat; shared down the spine)
	const float Pitch = FMath::DegreesToRadians(30.f * C - 14.f * S);
	FQuat Q(Right, Pitch);
	if (FVector::DotProduct(Q.RotateVector(Up), Fwd) * Pitch < 0.f)
	{
		Q = FQuat(Right, -Pitch);
	}
	for (const TCHAR* Sp : {TEXT("spine_01"), TEXT("spine_02"), TEXT("spine_03")})
	{
		const int32 I = Shown->GetBoneIndex(Sp);
		if (I == INDEX_NONE)
		{
			continue;
		}
		FTransform X = Shown->GetBoneTransform(I);
		const FQuat Part = FQuat::Slerp(FQuat::Identity, Q, 1.f / 3.f);
		X.SetRotation((Part * X.GetRotation()).GetNormalized());
		SetCS(I, X);
	}
	// (the legs: the feet where they stood, or sat, out ahead of him flat on the boards, knees up)
	const FVector Pn = Shown->GetBoneLocation(TEXT("pelvis"));
	for (int32 k = 0; k < 2; ++k)
	{
		const bool bL = k == 0;
		const FTransform F0 = bL ? FL0 : FR0;
		const float Side = bL ? -1.f : 1.f;
		const FVector Out = FVector(Pn.X, Pn.Y, FloorZ + 9.f) + Fwd * 58.f + Right * Side * 17.f;
		const FVector Foot = FMath::Lerp(F0.GetLocation(), Out, S);
		const FVector Pole = Pn + Fwd * 80.f + Up * (20.f + 40.f * S) + Right * Side * (18.f + 10.f * C);
		LegTo(bL, Foot, Pole, F0.GetRotation());
	}
}

void AKessler::FaceTick(float Dt)
{
	// her face alive (blind judge, run 52: the same face, mouth shut, in all three close-ups): the MetaHuman face's own
	// expression morphs, by name. (Found, run 54: they apply (forced to the face's finest LOD), but a MetaHuman's
	// expressions are mostly its facial joints, the morphs only small correctives on them: alone they barely show. Real
	// expressions need the face's own ABP_Face (RigLogic) evaluating, which it doesn't while it follows the body copy.) A blink every few seconds (quicker, closer together while she talks); the lips working
	// while she speaks, never in step; the scene's mood for the line eased in over a third of a second.
	USkeletalMeshComponent* F = Face.Get();
	if (!F)
	{
		return;
	}
	// (her face follows the posed copy of her body (a poseable mesh), and the engine only passes morphs on to a follower
	// whose leader is a skeletal mesh component: SetMorphTarget on it did nothing. So the weights are appended to its
	// active morphs directly, after the copy's pose (and with it the face's) has been refreshed this frame)
	// (its expressions exist only at the face's finest levels of detail; it followed the body copy's level (7, none))
	if (!F->bIgnoreLeaderPoseComponentLOD)
	{
		F->bIgnoreLeaderPoseComponentLOD = true;
		F->SetForcedLOD(1);
	}
	TMap<FName, float> Curves;
	auto M = [&Curves](const TCHAR* Name, float W)
	{
		Curves.Add(FName(*FString::Printf(TEXT("head_lod0_mesh__%s"), Name)), FMath::Clamp(W, 0.f, 1.f));
	};
	const float k = FMath::Min(1.f, Dt * 3.f);
	CurBrowDown += (ExprBrowDown - CurBrowDown) * k;
	CurSquint += (ExprSquint - CurSquint) * k;
	CurRaiseIn += (ExprBrowRaiseIn - CurRaiseIn) * k;
	CurCheek += (ExprCheek - CurCheek) * k;
	CurLids += (ExprLidsDown - CurLids) * k;
	BlinkT -= Dt;
	if (BlinkT <= 0.f)
	{
		BlinkAt = T;
		BlinkT = bTalking ? FMath::FRandRange(1.6f, 3.2f) : FMath::FRandRange(2.8f, 5.5f);
	}
	const float b = BlinkAt >= 0.f ? T - BlinkAt : 1.f;
	// (closing in 70 ms, shut 40 ms, opening over 150 ms)
	const float Blink = b < 0.07f ? b / 0.07f : b < 0.11f ? 1.f : b < 0.26f ? 1.f - (b - 0.11f) / 0.15f : 0.f;
	const float Lid = FMath::Max(Blink, CurLids * 0.35f);
	M(TEXT("eye_blink_L"), Lid);
	M(TEXT("eye_blink_R"), Lid);
	M(TEXT("brow_down_L"), CurBrowDown);
	M(TEXT("brow_down_R"), CurBrowDown * 0.92f);
	M(TEXT("brow_lateral_L"), CurBrowDown * 0.6f);
	M(TEXT("brow_lateral_R"), CurBrowDown * 0.55f);
	M(TEXT("eye_squintInner_L"), CurSquint);
	M(TEXT("eye_squintInner_R"), CurSquint * 0.9f);
	M(TEXT("brow_raiseIn_L"), CurRaiseIn);
	M(TEXT("brow_raiseIn_R"), CurRaiseIn);
	M(TEXT("eye_cheekRaise_L"), CurCheek);
	M(TEXT("eye_cheekRaise_R"), CurCheek * 0.85f);
	// (the lips while she talks: two out-of-step waves, opening and pressing, so it never reads as a loop)
	float Lo = 0.f, Up = 0.f;
	if (bTalking)
	{
		TalkPh += Dt;
		Lo = FMath::Max(0.f, 0.55f * FMath::Sin(TalkPh * 11.f) + 0.25f * FMath::Sin(TalkPh * 4.3f + 1.f) + 0.05f);
		Up = FMath::Max(0.f, 0.3f * FMath::Sin(TalkPh * 8.7f + 2.f) + 0.12f * FMath::Sin(TalkPh * 3.1f));
	}
	M(TEXT("mouth_lowerLipDepress_left"), Lo);
	M(TEXT("mouth_lowerLipDepress_right"), Lo);
	M(TEXT("mouth_upperLipRaise_left"), Up);
	M(TEXT("mouth_upperLipRaise_right"), Up);
	if (Shown)
	{
		Shown->RefreshBoneTransforms();
	}
	if (F->GetSkeletalMeshAsset() && F->MorphTargetWeights.Num() == F->GetSkeletalMeshAsset()->GetMorphTargets().Num())
	{
		FAnimationRuntime::AppendActiveMorphTargets(F->GetSkeletalMeshAsset(), Curves, F->ActiveMorphTargets, F->MorphTargetWeights);
		F->MarkRenderDynamicDataDirty();
	}
}
