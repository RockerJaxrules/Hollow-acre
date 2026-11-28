// Many copies of one mesh (trees, snow poles, guardrail posts and rails) drawn as instances: cheap on PC and phones.
// The transforms are filled in by Scripts/build_drive.py from the generated mountain placements.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Scatter.generated.h"

class UHierarchicalInstancedStaticMeshComponent;

UCLASS()
class HOLLOWACRE_API AScatter : public AActor
{
	GENERATED_BODY()

public:
	AScatter();

	UPROPERTY(VisibleAnywhere, Category = "Scatter")
	TObjectPtr<UHierarchicalInstancedStaticMeshComponent> Mesh;

	/** Instance transforms, relative to this actor. */
	UPROPERTY(EditAnywhere, Category = "Scatter")
	TArray<FTransform> Instances;

	/** Rebuilds the instances from Instances (called by the build script and on construction). */
	UFUNCTION(CallInEditor, BlueprintCallable, Category = "Scatter")
	void Rebuild();

	virtual void OnConstruction(const FTransform& Transform) override;

protected:
	virtual void BeginPlay() override;
};
