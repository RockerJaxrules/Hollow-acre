// A side window bursting: tempered glass breaks all at once into small chunks (4-9 mm across, as thick as the glass). They fly in from the window,
// fall the way the car's own gravity points (the car may be rolling), knock about inside the cabin and settle, in the
// car's frame (this actor rides on the car).

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "GlassBurst.generated.h"

class UInstancedStaticMeshComponent;
class UPrimitiveComponent;
class UMaterialInterface;

UCLASS()
class HOLLOWACRE_API AGlassBurst : public AActor
{
	GENERATED_BODY()

public:
	AGlassBurst();

	/** Burst the glass of a window: a rectangle in the car's frame (cm) at the window's plane, pebbles flying inward
	 *  (InDir, car frame) at about Speed cm/s. */
	void Burst(const FBox& Window, const FVector& InDir, float Speed, int32 Count, UMaterialInterface* Material, int32 Seed);

	/** The cabin the pebbles are kept inside (car frame, cm). */
	FBox Cabin = FBox(FVector(-150.f, -35.f, 28.f), FVector(110.f, 110.f, 132.f));

	/** The car's own surfaces (its body, seats, dash, glass): the pebbles bounce off them, not through them. */
	TArray<TWeakObjectPtr<UPrimitiveComponent>> Solids;
	/** Glass that is gone (its faces are no longer there to bounce off). */
	TWeakObjectPtr<UMaterialInterface> Skip;

	/** The driver's head (car frame, cm): the glass bounces off it rather than flying through the eyes. */
	FVector Head = FVector::ZeroVector;
	float HeadRadius = 0.f;

protected:
	virtual void Tick(float DeltaSeconds) override;

private:
	UPROPERTY(VisibleAnywhere)
	TObjectPtr<UInstancedStaticMeshComponent> Mesh;
	struct FPebble
	{
		FVector P, V, Spin;
		FRotator R;
		float Size;
	};
	TArray<FPebble> Pebbles;
	/** A chunk of the 4 mm glass (the engine's cube is a metre). */
	static FVector Scale(const FPebble& Pb) { return FVector(Pb.Size, Pb.Size * 0.8f, 0.4f) / 100.f; }
	float Age = 0.f;
};
