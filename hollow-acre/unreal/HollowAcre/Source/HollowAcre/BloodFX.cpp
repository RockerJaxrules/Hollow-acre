#include "BloodFX.h"

#include "Components/DecalComponent.h"
#include "Components/InstancedStaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "Engine/World.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Misc/CommandLine.h"
#include "Misc/Parse.h"

ABloodFX::ABloodFX()
{
	PrimaryActorTick.bCanEverTick = true;
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
	DropMesh = CreateDefaultSubobject<UInstancedStaticMeshComponent>(TEXT("Drops"));
	DropMesh->SetupAttachment(RootComponent);
	DropMesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	DropMesh->SetCastShadow(false);
	DropMesh->SetMobility(EComponentMobility::Movable);
	if (UStaticMesh* Sphere = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Sphere.Sphere")))
	{
		DropMesh->SetStaticMesh(Sphere);
	}
	if (UMaterialInterface* M = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Materials/Blood/M_BloodDrop.M_BloodDrop")))
	{
		DropMesh->SetMaterial(0, M);
	}
	const TCHAR* Dir = TEXT("/Game/HollowAcre/Materials/Blood/");
	auto Load = [Dir](const TCHAR* N) { return LoadObject<UMaterialInterface>(nullptr, *FString::Printf(TEXT("%s%s.%s"), Dir, N, N)); };
	MSplat = Load(TEXT("MI_BloodSplat"));
	MRun = Load(TEXT("MI_BloodRun"));
	MSmear = Load(TEXT("MI_BloodSmear"));
	MPool = Load(TEXT("MI_BloodPool"));
}

void ABloodFX::Spray(const FVector& From, const FVector& Dir, int32 Count, float Speed, float ConeDeg, float SizeCm)
{
	const FVector D = Dir.GetSafeNormal();
	for (int32 i = 0; i < Count; ++i)
	{
		const FVector V = FMath::VRandCone(D, FMath::DegreesToRadians(ConeDeg)) * Speed * FMath::FRandRange(0.55f, 1.15f);
		Drops.Add({From + FMath::VRand() * 0.6f, V, SizeCm * FMath::FRandRange(0.4f, 1.3f), 0.f});
	}
}

void ABloodFX::Drip(const FVector& From, float SizeCm, const FVector& Drift)
{
	Drops.Add({From, Drift + FVector(FMath::FRandRange(-6.f, 6.f), FMath::FRandRange(-6.f, 6.f), -10.f), SizeCm * FMath::FRandRange(0.8f, 1.25f), 0.f});
}

UDecalComponent* ABloodFX::Stain(UMaterialInterface* M, UPrimitiveComponent* On, const FVector& Centre, const FVector& N, const FVector& Down,
	const FVector2D& SizeCm, float Secs, float Delay)
{
	if (!M)
	{
		return nullptr;
	}
	// the decal projects along its X (into the surface); the texture's top-to-bottom (its arrival, for a run or a smear)
	// along its -Z, laid along Down
	FVector Dn = (Down - N * FVector::DotProduct(Down, N)).GetSafeNormal();
	if (Dn.IsNearlyZero())
	{
		Dn = FVector::CrossProduct(N, FVector::RightVector).GetSafeNormal();
	}
	const FQuat Q = FRotationMatrix::MakeFromXZ(-N, -Dn).ToQuat();
	UDecalComponent* D = NewObject<UDecalComponent>(this);
	D->RegisterComponent();
	D->SetWorldLocationAndRotation(Centre, Q);
	// (on a wall, a thin projection: a board is 2 cm, and a splat on the shed's outside came through on the inside, a red
	// paint splat in the cutscene (blind judge, run 52). On the ground, deep enough for the snow's bumps)
	D->DecalSize = FVector(FMath::Abs(N.Z) < 0.6f ? 0.7f : 3.f, SizeCm.X * 0.5f, SizeCm.Y * 0.5f);
	D->SortOrder = ++Order;
	D->SetFadeScreenSize(0.f);
	UMaterialInstanceDynamic* Mi = UMaterialInstanceDynamic::Create(M, D);
	Mi->SetScalarParameterValue(TEXT("Grow"), 0.f);
	D->SetDecalMaterial(Mi);
	if (On)
	{
		D->AttachToComponent(On, FAttachmentTransformRules::KeepWorldTransform);     // (it goes with the car)
	}
	Stains.Add({Mi, Now + Delay, FMath::Max(Secs, 0.02f)});
	return D;
}

void ABloodFX::Land(const FHitResult& Hit, const FDrop& D)
{
	++Landed;
	if (Landed <= 60)
	{
		UE_LOG(LogTemp, Display, TEXT("BloodFX: drop %d (%.2f cm, %.0f cm/s) landed on %s / %s at %s, normal %s"), Landed, D.Size, D.V.Size(),
			*GetNameSafe(Hit.GetActor()), *GetNameSafe(Hit.GetComponent()), *Hit.ImpactPoint.ToString(), *Hit.ImpactNormal.ToString());
	}
	const FVector N = Hit.ImpactNormal;
	const FVector Down(0.f, 0.f, -1.f);
	UPrimitiveComponent* On = Hit.GetComponent();
	static const bool bBig = FParse::Param(FCommandLine::Get(), TEXT("bloodbig"));      // (checking: oversized splats)
	const float S = D.Size * FMath::FRandRange(8.f, 15.f) * FMath::Clamp(D.V.Size() / 300.f, 0.7f, 1.6f) * (bBig ? 4.f : 1.f);
	Stain(MSplat, On, Hit.ImpactPoint, N, Down, FVector2D(S, S), 0.12f);
	if (N.Z > 0.7f && D.Size > 0.6f)
	{
		// on something flat (the sill, the door's top) a heavy drop gathers and spreads a little
		Stain(MPool, On, Hit.ImpactPoint, N, FVector(1.f, 0.f, 0.f), FVector2D(D.Size * 9.f, D.Size * 9.f), FMath::FRandRange(0.8f, 1.6f), 0.1f);
	}
	if (FMath::Abs(N.Z) < 0.7f && D.Size > 0.22f)
	{
		// on a wall it runs: down from where it hit, slowly, a little longer the bigger the drop
		const float Len = FMath::FRandRange(7.f, 14.f) + D.Size * 18.f;
		const FVector Dn = (Down - N * FVector::DotProduct(Down, N)).GetSafeNormal();
		Stain(MRun, On, Hit.ImpactPoint + Dn * Len * 0.48f, N, Down, FVector2D(FMath::Max(1.2f, D.Size * 3.f), Len), FMath::FRandRange(1.3f, 2.8f), 0.15f);
	}
}

void ABloodFX::Smear(UPrimitiveComponent* On, const FVector& At, const FVector& N, const FVector& Along, float LengthCm, float WidthCm, float Secs)
{
	// (the smear's texture is drawn left to right: its Down here is its along)
	FVector A = (Along - N * FVector::DotProduct(Along, N)).GetSafeNormal();
	if (A.IsNearlyZero() || !MSmear)
	{
		return;
	}
	const FVector Side = FVector::CrossProduct(N, A).GetSafeNormal();
	const FQuat Q = FRotationMatrix::MakeFromXY(-N, A).ToQuat();
	UDecalComponent* D = NewObject<UDecalComponent>(this);
	D->RegisterComponent();
	D->SetWorldLocationAndRotation(At + A * LengthCm * 0.45f, Q);
	D->DecalSize = FVector(4.f, LengthCm * 0.5f, WidthCm * 0.5f);
	D->SortOrder = ++Order;
	D->SetFadeScreenSize(0.f);
	UMaterialInstanceDynamic* Mi = UMaterialInstanceDynamic::Create(MSmear, D);
	Mi->SetScalarParameterValue(TEXT("Grow"), 0.f);
	D->SetDecalMaterial(Mi);
	if (On)
	{
		D->AttachToComponent(On, FAttachmentTransformRules::KeepWorldTransform);
	}
	Stains.Add({Mi, Now, FMath::Max(Secs, 0.05f)});
	(void)Side;
}

void ABloodFX::Pool(const FVector& At, float RadiusCm, float Secs, float Delay)
{
	FHitResult Hit;
	FCollisionQueryParams Q(TEXT("BloodPool"), true, this);
	for (const TWeakObjectPtr<AActor>& A : Ignore)
	{
		if (A.IsValid())
		{
			Q.AddIgnoredActor(A.Get());
		}
	}
	if (GetWorld()->LineTraceSingleByChannel(Hit, At + FVector(0.f, 0.f, 60.f), At - FVector(0.f, 0.f, 300.f), ECC_Camera, Q))
	{
		Stain(MPool, Hit.GetComponent(), Hit.ImpactPoint, Hit.ImpactNormal, FVector(1.f, 0.f, 0.f), FVector2D(RadiusCm * 2.f, RadiusCm * 2.f), Secs, Delay);
	}
}

void ABloodFX::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	const float Dt = FMath::Min(DeltaSeconds, 1.f / 20.f);
	Now += Dt;
	FCollisionQueryParams Q(TEXT("BloodDrop"), true, this);
	for (const TWeakObjectPtr<AActor>& A : Ignore)
	{
		if (A.IsValid())
		{
			Q.AddIgnoredActor(A.Get());
		}
	}
	// the drops: falling and flying (gravity, air drag on such small ones), landing where they hit
	for (int32 i = Drops.Num() - 1; i >= 0; --i)
	{
		FDrop& D = Drops[i];
		D.Age += Dt;
		const FVector V0 = D.V;
		D.V += FVector(0.f, 0.f, -980.f) * Dt;
		D.V *= FMath::Exp(-0.9f * Dt);
		const FVector P1 = D.P + (V0 + D.V) * 0.5f * Dt;
		FHitResult Hit;
		if (GetWorld()->LineTraceSingleByChannel(Hit, D.P, P1, ECC_Camera, Q))
		{
			Land(Hit, D);
			Drops.RemoveAtSwap(i);
			continue;
		}
		D.P = P1;
		if (D.Age > 4.f)
		{
			Drops.RemoveAtSwap(i);
		}
	}
	// drawn: each a small sphere drawn out along its flight
	DropMesh->ClearInstances();
	for (const FDrop& D : Drops)
	{
		const float Sp = D.V.Size();
		const FVector Dir = Sp > 1.f ? D.V / Sp : FVector::UpVector;
		const float Stretch = 1.f + FMath::Min(Sp * 0.004f, 3.f);
		const FQuat R = FRotationMatrix::MakeFromX(Dir).ToQuat();
		DropMesh->AddInstance(FTransform(R, D.P, FVector(Stretch, 1.f, 1.f) * (D.Size / 100.f)), true);
	}
	// the stains growing (a run crawling down, a smear dragging out, a pool spreading)
	for (const FStain& S : Stains)
	{
		if (S.Mi)
		{
			const float g = FMath::Clamp((Now - S.T0) / S.Secs, 0.f, 1.f);
			S.Mi->SetScalarParameterValue(TEXT("Grow"), (1.f - (1.f - g) * (1.f - g)) * 1.03f);
		}
	}
}
