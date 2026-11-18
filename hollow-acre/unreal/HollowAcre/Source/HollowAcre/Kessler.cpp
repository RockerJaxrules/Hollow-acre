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
