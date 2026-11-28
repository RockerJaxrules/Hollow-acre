// Act I's closing cutscene, "Kessler" (the owner approved the shot plan: GAMEPLAY_ACT1.md). First person, the player's
// own eyes, captions only, in the tool shed by the stove, staged the way Supermassive stages theirs (Until Dawn, The
// Quarry): faces lit from below by one warm source, long holds on a face, silence as a beat, the dread left in the last
// frame. On "Get inside.": a cut (a blink) to the player sat by the stove; he pushes in behind, his lantern swinging over
// the walls, and bars the door with a plank; he crouches at the stove and feeds it, the fire flaring on his face; the
// question, the answer, the road; her journal in his hands, then in the player's; he sits against the barred door with
// the rifle across his knees and turns the lantern down; the player's eyes go to the gap in the boards where the hand came
// through; a slow blink, black, "Morning."

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "KesslerScene.generated.h"

class AP2Story;
class AKessler;
class APart2Character;
class AStaticMeshActor;

UCLASS()
class HOLLOWACRE_API AKesslerScene : public AActor
{
	GENERATED_BODY()

public:
	AKesslerScene();
	virtual void Tick(float DeltaSeconds) override;
	void Start(AP2Story* InStory);
	bool IsOver() const { return bOver; }

protected:
	TWeakObjectPtr<AP2Story> Story;
	TWeakObjectPtr<AKessler> K;
	TWeakObjectPtr<APart2Character> P;
	FTransform ShedT;
	float T = 0.f;
	float SpeakEnd = -1.f;
	bool bOver = false;
	UPROPERTY()
	TObjectPtr<AStaticMeshActor> Plank;
	UPROPERTY()
	TObjectPtr<AStaticMeshActor> Split;
	UPROPERTY()
	TArray<TObjectPtr<AStaticMeshActor>> Brackets;
	TSet<FName> Done;
	bool Once(const TCHAR* Beat);
	/** A point in the shed's own frame (front wall at x 0 facing +x, the back at -370, the sides at y +-185), on its floor
	 * plus Z. */
	FVector At(float X, float Y, float Z = 0.f) const;
	/** A walk in two legs: to Via first, then on to the goal; the shed is small and the player sits by the stove, so her
	 *  ways round the room go wide of them (the owner: the body clipped through things; she walked through the view). */
	FVector Via = FVector::ZeroVector, ViaGoal = FVector::ZeroVector;
	void WalkVia(const FVector& ViaPoint, const FVector& Goal);
	/** The plank leant on the front wall by the door, and where its middle is. */
	FQuat PlankLean() const;
	FVector PlankRest() const;
	FVector Floor = FVector::ZeroVector;
	float FloorZ = 0.f;
	void Line(const FString& Text, float Secs);
	void Look(const FVector& At, float Rate = 2.5f);
	AStaticMeshActor* Prop(UStaticMesh* Mesh, UMaterialInterface* Mat, const FTransform& Xf);
	/** Seconds into a beat that starts at T0 (negative before it). */
	float Since(float T0) const { return T - T0; }
};
