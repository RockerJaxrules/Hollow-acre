// Blood as a liquid (the owner: "blood is a liquid: it smears, it drips, it puddles"; "if the creature has blood on it it
// shouldn't just be static"). Drops are flung (sprayed from its mouth as it shrieks) or let fall (dripping from its chin
// and claws), fly under gravity and air drag, and splat where they land: a splat on whatever they hit, and on a wall a run
// that crawls down it from there. Its hands leave smears that drag out as the car is shoved under them; where it stands
// its drips pool and spread into the snow. Every stain grows (its texture's arrival channel, Scripts/make_blood.py) and
// is attached to what it landed on, so it goes with the car.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "BloodFX.generated.h"

class UDecalComponent;
class UInstancedStaticMeshComponent;
class UMaterialInstanceDynamic;
class UMaterialInterface;

UCLASS()
class HOLLOWACRE_API ABloodFX : public AActor
{
	GENERATED_BODY()

public:
	ABloodFX();
	virtual void Tick(float DeltaSeconds) override;

	/** Count drops flung from From along Dir (within ConeDeg), at Speed (cm/s, each a little different), SizeCm across. */
	void Spray(const FVector& From, const FVector& Dir, int32 Count, float Speed, float ConeDeg, float SizeCm);
	/** One drop let fall from From (a drip), with a little sideways drift. */
	void Drip(const FVector& From, float SizeCm, const FVector& Drift = FVector::ZeroVector);
	/** A smear on whatever is at At (its normal N), dragged along Along over LengthCm, WidthCm wide, drawn out over Secs. */
	void Smear(UPrimitiveComponent* On, const FVector& At, const FVector& N, const FVector& Along, float LengthCm, float WidthCm, float Secs);
	/** A pool spreading on the ground under At, out to RadiusCm over Secs. */
	void Pool(const FVector& At, float RadiusCm, float Secs, float Delay = 0.f);

	/** What drops pass through (the creature that sheds them, the driver's own arms). */
	TArray<TWeakObjectPtr<AActor>> Ignore;
	/** How many drops landed, how many stains there are (for the log). */
	int32 Landed = 0;

private:
	struct FDrop
	{
		FVector P, V;
		float Size, Age;
	};
	struct FStain
	{
		TObjectPtr<UMaterialInstanceDynamic> Mi;
		float T0, Secs;
	};
	TArray<FDrop> Drops;
	TArray<FStain> Stains;
	float Now = 0.f;
	int32 Order = 0;

	UPROPERTY()
	TObjectPtr<UInstancedStaticMeshComponent> DropMesh;
	UPROPERTY()
	TObjectPtr<UMaterialInterface> MSplat;
	UPROPERTY()
	TObjectPtr<UMaterialInterface> MRun;
	UPROPERTY()
	TObjectPtr<UMaterialInterface> MSmear;
	UPROPERTY()
	TObjectPtr<UMaterialInterface> MPool;

	UDecalComponent* Stain(UMaterialInterface* M, UPrimitiveComponent* On, const FVector& Centre, const FVector& N, const FVector& Down,
		const FVector2D& SizeCm, float Secs, float Delay = 0.f);
	void Land(const FHitResult& Hit, const FDrop& D);
};
