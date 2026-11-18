#include "Kessler.h"

#include "Animation/AnimSequence.h"
#include "Components/PointLightComponent.h"
#include "Components/SkeletalMeshComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "Engine/World.h"
#include "Materials/MaterialInstanceDynamic.h"

namespace
{
	const TCHAR* ManClass = TEXT("/Game/HollowAcre/Kessler/Built/Kessler/BP_Kessler.BP_Kessler_C");
}

AKessler::AKessler()
{
	PrimaryActorTick.bCanEverTick = true;
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
	const float Yaw = GetActorRotation().Yaw;
	if (Lantern && Body->GetBoneIndex(TEXT("hand_l")) != INDEX_NONE)
	{
		// (hung by its bail from the fist: the bail's grip at the hand, the lantern plumb under it, swinging a little as a
		// pendulum from the hand's own motion, damped)
		const FVector Hand = Body->GetBoneLocation(TEXT("hand_l")) + FVector(0.f, 0.f, -4.f);
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
	if (Rifle && Body->GetBoneIndex(TEXT("hand_r")) != INDEX_NONE)
	{
		// (carried in the right hand at the wrist of its stock, the muzzle down and forward along his leg)
		const FVector Hand = Body->GetBoneLocation(TEXT("hand_r"));
		const FRotator Carry(-62.f, Yaw, 0.f);
		Rifle->SetWorldLocationAndRotation(Hand - Carry.RotateVector(FVector(-4.f, 0.f, 0.5f)), Carry);
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
	Clothes->SetLeaderPoseComponent(Body.Get());
	if (FParse::Param(FCommandLine::Get(), TEXT("kesslernoskin")))      // (debug: his clothes alone, to judge them)
	{
		Body->VisibilityBasedAnimTickOption = EVisibilityBasedAnimTickOption::AlwaysTickPoseAndRefreshBones;
		Body->SetVisibility(false, false);
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
	USkeletalMeshComponent* Face = nullptr;
	TArray<USkeletalMeshComponent*> Sk;
	Man->GetComponents<USkeletalMeshComponent>(Sk);
	for (USkeletalMeshComponent* C : Sk)
	{
		if (C->GetName() == TEXT("Face"))
		{
			Face = C;
		}
	}
	UStaticMesh* M = LoadObject<UStaticMesh>(nullptr, TEXT("/Game/HollowAcre/Wake/Kessler_Cap.Kessler_Cap"));
	if (!Face || !M || !Face->GetSkinnedAsset())
	{
		UE_LOG(LogTemp, Warning, TEXT("Kessler: no cap (face %d, mesh %d)"), Face != nullptr, M != nullptr);
		return;
	}
	const FReferenceSkeleton& Rs = Face->GetSkinnedAsset()->GetRefSkeleton();
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
	// (in his face's frame, Z up, facing +Y: the cap's centre 8.5 cm behind his eyes and 3 above them (the cuff to the tops of his ears), turned to face
	// his way, its brow tilted up 12 degrees)
	const FTransform CapCS(FRotator(12.f, 90.f, 0.f), E + FVector(0.f, -8.5f, 3.f));
	Cap = NewObject<UStaticMeshComponent>(Man, TEXT("KesslerCap"));
	Cap->SetStaticMesh(M);
	Cap->SetupAttachment(Face, TEXT("head"));
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
