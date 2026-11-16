#include "GlassBurst.h"

#include "Components/InstancedStaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "Components/PrimitiveComponent.h"
#include "Materials/MaterialInterface.h"
#include "UObject/ConstructorHelpers.h"

AGlassBurst::AGlassBurst()
{
	PrimaryActorTick.bCanEverTick = true;
	Mesh = CreateDefaultSubobject<UInstancedStaticMeshComponent>(TEXT("Pebbles"));
	RootComponent = Mesh;
	Mesh->SetMobility(EComponentMobility::Movable);
	Mesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	Mesh->SetCastShadow(false);
	static ConstructorHelpers::FObjectFinder<UStaticMesh> Cube(TEXT("/Engine/BasicShapes/Cube.Cube"));
	if (Cube.Succeeded())
	{
		Mesh->SetStaticMesh(Cube.Object);
	}
}

void AGlassBurst::Burst(const FBox& Window, const FVector& InDir, float Speed, int32 Count, UMaterialInterface* Material, int32 Seed)
{
	FRandomStream R(Seed);
	if (Material)
	{
		Mesh->SetMaterial(0, Material);
	}
	const FVector In = InDir.GetSafeNormal();
	for (int32 i = 0; i < Count; ++i)
	{
		FPebble Pb;
		Pb.P = FVector(R.FRandRange(Window.Min.X, Window.Max.X), R.FRandRange(Window.Min.Y, Window.Max.Y), R.FRandRange(Window.Min.Z, Window.Max.Z));
		// most of the glass comes in with the blow; some falls straight down the door, some is flung up and across
		const float k = R.FRand();
		Pb.V = In * Speed * (0.3f + 1.1f * k) + FVector(R.FRandRange(-150.f, 150.f), R.FRandRange(-60.f, 60.f), R.FRandRange(-80.f, 220.f));
		Pb.Spin = FVector(R.FRandRange(-900.f, 900.f), R.FRandRange(-900.f, 900.f), R.FRandRange(-900.f, 900.f));
		Pb.R = FRotator(R.FRandRange(0.f, 360.f), R.FRandRange(0.f, 360.f), R.FRandRange(0.f, 360.f));
		Pb.Size = R.FRandRange(0.4f, 0.9f);
		Pebbles.Add(Pb);
		Mesh->AddInstance(FTransform(Pb.R, Pb.P, Scale(Pb)));
	}
	Age = 0.f;
}

void AGlassBurst::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	if (Pebbles.Num() == 0 || DeltaSeconds <= 0.f)
	{
		return;
	}
	Age += DeltaSeconds;
	// gravity as the car feels it (the car may be on its side or its roof); the car's own jolts are left out
	const FVector G = GetActorTransform().InverseTransformVectorNoScale(FVector(0.f, 0.f, -980.f));
	for (int32 i = 0; i < Pebbles.Num(); ++i)
	{
		FPebble& Pb = Pebbles[i];
		Pb.V += G * DeltaSeconds;
		const FVector P0 = Pb.P;
		Pb.P += Pb.V * DeltaSeconds;
		if (Solids.Num() > 0 && FVector::DistSquared(P0, Pb.P) > 0.0025f)
		{
			// off the car's real surfaces: the first one met on the way, bounced off it
			const FTransform& T = GetActorTransform();
			const FVector W0 = T.TransformPosition(P0), W1 = T.TransformPosition(Pb.P);
			const FVector Dir = (W1 - W0).GetSafeNormal();
			FCollisionQueryParams Q(TEXT("Pebble"), true);
			Q.bReturnFaceIndex = Skip.IsValid();
			bool bHit = false;
			float BestD = 0.f;
			FVector HitP = FVector::ZeroVector, HitN = FVector::UpVector;
			for (const TWeakObjectPtr<UPrimitiveComponent>& S : Solids)
			{
				UPrimitiveComponent* C = S.Get();
				if (!C)
				{
					continue;
				}
				FVector From = W0;
				for (int32 Try = 0; Try < 3; ++Try)
				{
					FHitResult H;
					if (!C->LineTraceComponent(H, From, W1, Q))
					{
						break;
					}
					int32 Sec = 0;
					if (Skip.IsValid() && H.FaceIndex != INDEX_NONE && C->GetMaterialFromCollisionFaceIndex(H.FaceIndex, Sec) == Skip.Get())
					{
						From = H.ImpactPoint + Dir * 0.05f;
						continue;
					}
					const float Dd = FVector::DistSquared(W0, H.ImpactPoint);
					if (!bHit || Dd < BestD)
					{
						bHit = true;
						BestD = Dd;
						HitP = H.ImpactPoint;
						HitN = H.ImpactNormal;
					}
					break;
				}
			}
			if (bHit)
			{
				const FVector N = T.InverseTransformVectorNoScale(HitN);
				Pb.P = T.InverseTransformPosition(HitP) + N * 0.25f;
				const float vn = FVector::DotProduct(Pb.V, N);
				if (vn < 0.f)
				{
					Pb.V -= 1.25f * vn * N;
				}
				Pb.V *= 0.55f;
				Pb.Spin *= 0.4f;
			}
		}
		for (int32 a = 0; a < 3; ++a)
		{
			// the cabin's walls, floor and roof: bounce a little, lose most of the speed, stop spinning
			if (Pb.P[a] < Cabin.Min[a] || Pb.P[a] > Cabin.Max[a])
			{
				Pb.P[a] = FMath::Clamp(Pb.P[a], Cabin.Min[a], Cabin.Max[a]);
				Pb.V[a] *= -0.25f;
				Pb.V *= 0.55f;
				Pb.Spin *= 0.4f;
			}
		}
		if (HeadRadius > 0.f)
		{
			// off the face: pushed back out to the head's surface, the speed into it reversed and mostly lost
			const FVector D = Pb.P - Head;
			const float d = D.Size();
			if (d < HeadRadius)
			{
				const FVector Nn = d > 1e-3f ? D / d : FVector(0.f, 0.f, 1.f);
				Pb.P = Head + Nn * HeadRadius;
				const float vn = FVector::DotProduct(Pb.V, Nn);
				if (vn < 0.f)
				{
					Pb.V -= 1.3f * vn * Nn;
				}
				Pb.V *= 0.5f;
				Pb.Spin *= 0.5f;
			}
		}
		Pb.R += FRotator(Pb.Spin.X, Pb.Spin.Y, Pb.Spin.Z) * DeltaSeconds;
		Mesh->UpdateInstanceTransform(i, FTransform(Pb.R, Pb.P, Scale(Pb)), /*bWorldSpace*/ false, /*bMarkRenderStateDirty*/ i == Pebbles.Num() - 1);
	}
}
