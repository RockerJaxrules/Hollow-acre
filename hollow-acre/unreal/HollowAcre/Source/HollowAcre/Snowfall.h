// Blizzard snowfall around a moving target (the car): flakes live in a box that travels with the target and wrap
// around its edges, so the snow never runs out however far you drive. Flakes are world-space, so driving through them
// makes them stream at the windshield. PC first; phones get a lower flake count via scalability later.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Snowfall.generated.h"

class UInstancedStaticMeshComponent;

UCLASS()
class HOLLOWACRE_API ASnowfall : public AActor
{
	GENERATED_BODY()

public:
	ASnowfall();

	/** The snow box follows this actor (the car). */
	UPROPERTY(EditAnywhere, Category = "Snow")
	TObjectPtr<AActor> Follow;

	/** Box size around the target, centred ahead of it (cm). */
	UPROPERTY(EditAnywhere, Category = "Snow")
	FVector Extent = FVector(3000.f, 1800.f, 900.f);

	/** How far the box centre sits ahead of the target (cm). */
	UPROPERTY(EditAnywhere, Category = "Snow")
	float Ahead = 1800.f;

	UPROPERTY(EditAnywhere, Category = "Snow")
	int32 Flakes = 6000;

	/** Fall speed (cm/s) and wind (cm/s, world space). */
	UPROPERTY(EditAnywhere, Category = "Snow")
	float FallSpeed = 140.f;

	UPROPERTY(EditAnywhere, Category = "Snow")
	FVector Wind = FVector(-250.f, 420.f, 0.f);

	/** Flake diameter range (cm). */
	UPROPERTY(EditAnywhere, Category = "Snow")
	FVector2D Size = FVector2D(0.5f, 1.3f);

	UPROPERTY(VisibleAnywhere, Category = "Snow")
	TObjectPtr<UInstancedStaticMeshComponent> Mesh;

	/** Places the snow doesn't fall in (under roofs: the shed's inside), world boxes; a flake in one is hidden. */
	TArray<FBox> NoSnow;

protected:
	virtual void BeginPlay() override;
	virtual void Tick(float DeltaSeconds) override;

private:
	FVector Centre() const;

	TArray<FVector> Pos;
	TArray<FVector> Drift;  // per-flake flutter amplitude and phase
	TArray<float> Scale;
	TArray<FTransform> Xf;
	float Time = 0.f;
};
