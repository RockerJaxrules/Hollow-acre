#include "Snowfall.h"

#include "Components/InstancedStaticMeshComponent.h"

ASnowfall::ASnowfall()
{
	PrimaryActorTick.bCanEverTick = true;
	PrimaryActorTick.TickGroup = TG_PostPhysics; // after the car has moved this frame

	Mesh = CreateDefaultSubobject<UInstancedStaticMeshComponent>(TEXT("Flakes"));
	RootComponent = Mesh;
	Mesh->SetMobility(EComponentMobility::Movable);
	Mesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	Mesh->SetCastShadow(false);
	Mesh->SetAbsolute(true, true, true); // instance transforms are world space
	Mesh->NumCustomDataFloats = 0;
}

FVector ASnowfall::Centre() const
{
	if (!Follow)
	{
		return GetActorLocation();
	}
	return Follow->GetActorLocation() + Follow->GetActorForwardVector() * Ahead + FVector(0.f, 0.f, 150.f);
}

void ASnowfall::BeginPlay()
{
	Super::BeginPlay();

	FRandomStream Rng(1234);
	const FVector C = Centre();
	Pos.SetNum(Flakes);
	Drift.SetNum(Flakes);
	Scale.SetNum(Flakes);
	Xf.SetNum(Flakes);
	for (int32 i = 0; i < Flakes; ++i)
	{
		Pos[i] = C + FVector(Rng.FRandRange(-1.f, 1.f) * Extent.X, Rng.FRandRange(-1.f, 1.f) * Extent.Y, Rng.FRandRange(-1.f, 1.f) * Extent.Z);
		Drift[i] = FVector(Rng.FRandRange(10.f, 45.f), Rng.FRandRange(0.f, 6.28f), Rng.FRandRange(0.6f, 1.6f));
		Scale[i] = Rng.FRandRange(Size.X, Size.Y) / 100.f; // the engine sphere is 100 cm across
		Xf[i] = FTransform(FQuat::Identity, Pos[i], FVector(Scale[i]));
	}
	Mesh->ClearInstances();
	Mesh->AddInstances(Xf, false, /*bWorldSpace*/ true);
}

void ASnowfall::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	Time += DeltaSeconds;

	const FVector C = Centre();
	const FVector Base = (Wind + FVector(0.f, 0.f, -FallSpeed)) * DeltaSeconds;
	for (int32 i = 0; i < Pos.Num(); ++i)
	{
		const FVector& D = Drift[i];
		const float Ph = Time * D.Z + D.Y;
		FVector P = Pos[i] + Base + FVector(FMath::Sin(Ph), FMath::Cos(Ph * 0.7f), 0.f) * D.X * DeltaSeconds;

		// Wrap around the box that travels with the car
		FVector L = P - C;
		L.X = FMath::Wrap(L.X, -Extent.X, Extent.X);
		L.Y = FMath::Wrap(L.Y, -Extent.Y, Extent.Y);
		L.Z = FMath::Wrap(L.Z, -Extent.Z, Extent.Z);
		Pos[i] = C + L;
		Xf[i].SetLocation(Pos[i]);
	}
	Mesh->BatchUpdateInstancesTransforms(0, Xf, /*bWorldSpace*/ true, /*bMarkRenderStateDirty*/ true, /*bTeleport*/ true);
}
