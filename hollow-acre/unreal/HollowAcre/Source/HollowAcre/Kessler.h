// Kessler, the foreman who wrote to the player (Part 2, Act I's end: the lantern in the trees, the rifle, "Get inside").
// His body is his MetaHuman (Content/HollowAcre/Kessler/Built, Scripts/build_kessler_metahuman.py), spawned whole (its
// face, grooms and clothes follow its body as the MetaHuman blueprint sets them); his body plays real motion (CMU clips
// retargeted onto him, Scripts/import_mocap.py with HA_MOCAP_TARGET_NAME=Kessler), and he carries:
// - his hurricane lantern (tools/blender/make_kessler_props.py) hanging from his left hand by its bail, always plumb as a
//   hanging lantern is, swinging with his steps; its flame (M_Flame) and its light, a kerosene flame's: warm, flickering,
//   throwing the shadows of its own wire guard;
// - his carbine in his right hand, carried down along his leg.
// The story (Part2Story) moves him; this keeps what he carries with him.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Kessler.generated.h"

UCLASS()
class HOLLOWACRE_API AKessler : public AActor
{
	GENERATED_BODY()

public:
	AKessler();
	virtual void BeginPlay() override;
	virtual void Tick(float DeltaSeconds) override;

	/** The take his body plays (a clip in /Game/HollowAcre/Kessler/Mocap), looping; empty: he stands. */
	UPROPERTY(EditAnywhere, Category = "Kessler")
	FString Clip = TEXT("CMUCMU_17_03_Kessler");

	/** His lantern lit and carried in his left hand. */
	UPROPERTY(EditAnywhere, Category = "Kessler")
	bool bLantern = true;

	/** His carbine in his right hand. */
	UPROPERTY(EditAnywhere, Category = "Kessler")
	bool bRifle = true;

	/** Play another take (looping or once). */
	void PlayClip(const FString& Name, bool bLoop);

	USkeletalMeshComponent* GetBody() const { return Body.Get(); }
	/** Where his lantern's flame is (for what it lights, and for the player's eyes to find in the trees). */
	FVector LanternAt() const;

protected:
	UPROPERTY()
	TObjectPtr<AActor> Man;
	TWeakObjectPtr<USkeletalMeshComponent> Body;
	UPROPERTY()
	TObjectPtr<UStaticMeshComponent> Lantern;
	UPROPERTY()
	TObjectPtr<UStaticMeshComponent> Flame;
	UPROPERTY()
	TObjectPtr<class UMaterialInstanceDynamic> FlameMID;
	UPROPERTY()
	TObjectPtr<class UPointLightComponent> LanternLight;
	UPROPERTY()
	TObjectPtr<UStaticMeshComponent> Rifle;

	float T = 0.f;
	FVector HandWas = FVector::ZeroVector;
	FVector2D Swing = FVector2D::ZeroVector, SwingV = FVector2D::ZeroVector;
	void Tint(UStaticMeshComponent* C, const TCHAR* Slot, const FLinearColor& Color, float Metal, float Rough);
	void DressUp();
	void CapOn();
	UPROPERTY()
	TObjectPtr<UStaticMeshComponent> Cap;
	UPROPERTY()
	TObjectPtr<USkeletalMeshComponent> Clothes;
	UPROPERTY()
	TObjectPtr<USkeletalMeshComponent> ClothesUpper;
};
