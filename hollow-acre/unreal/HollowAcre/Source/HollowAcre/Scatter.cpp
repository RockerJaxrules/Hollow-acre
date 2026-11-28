#include "Scatter.h"

#include "Components/HierarchicalInstancedStaticMeshComponent.h"

AScatter::AScatter()
{
	PrimaryActorTick.bCanEverTick = false;
	Mesh = CreateDefaultSubobject<UHierarchicalInstancedStaticMeshComponent>(TEXT("Instances"));
	RootComponent = Mesh;
	Mesh->SetMobility(EComponentMobility::Static);
	Mesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
}

void AScatter::Rebuild()
{
	Mesh->ClearInstances();
	if (Instances.Num() > 0)
	{
		Mesh->AddInstances(Instances, false, /*bWorldSpace*/ false);
	}
}

void AScatter::OnConstruction(const FTransform& Transform)
{
	Super::OnConstruction(Transform);
	Rebuild();
}

void AScatter::BeginPlay()
{
	Super::BeginPlay();
	if (Mesh->GetInstanceCount() != Instances.Num())
	{
		Rebuild();
	}
}
