// Part 2's story in play (Act I, The Bottom; GAMEPLAY_ACT1.md): what the player is after (a short objective, shown a
// while when it changes), what the player says (captions: the game has no voices), the things that can be used (look at
// one and press E: a prompt; some open, some are read page by page), and the story's beats, each fired once by where the
// player is or what they have just done: scripted, not random.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "GameFramework/Actor.h"
#include "Part2Story.generated.h"

class AEndingDirector;
class APart2Character;
class AHusk;
class AHuskHunter;
class UStaticMeshComponent;

/** A thing the player can use: looked at within reach, its prompt shows; E uses it (reads its pages, if any). */
UCLASS(ClassGroup = (HollowAcre), meta = (BlueprintSpawnableComponent))
class HOLLOWACRE_API UP2UseComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UPROPERTY(EditAnywhere, Category = "Part 2")
	FName Id;
	UPROPERTY(EditAnywhere, Category = "Part 2")
	FString Prompt = TEXT("Use");
	/** Read page by page (E for the next), if any. */
	UPROPERTY(EditAnywhere, Category = "Part 2")
	TArray<FString> Pages;
	UPROPERTY(EditAnywhere, Category = "Part 2")
	float Reach = 230.f;
	UPROPERTY(EditAnywhere, Category = "Part 2")
	bool bOnce = false;
	bool bUsed = false;
	bool bEnabled = true;
};

/** A footprint pressed into the snow under At (its toe along Yaw, degrees), Size cm long; Bare: the husk's. Kept to the
 *  last few hundred. */
HOLLOWACRE_API void P2Footprint(UWorld* World, const FVector& At, float Yaw, float Size, bool bBare);

/** Its eyes catching the light (a glint at each eye, as an animal's eyes shine back in a beam): shown while bOn. */
HOLLOWACRE_API void P2EyeShine(AHusk* H, bool bOn);

UCLASS()
class HOLLOWACRE_API AP2Story : public AActor
{
	GENERATED_BODY()

public:
	AP2Story();
	virtual void Tick(float DeltaSeconds) override;

	/** Act I begins (at the handover from the wake). */
	void Begin(AEndingDirector* InDirector, float InHuskScale);

	/** The player used one of the story's things. */
	void OnUse(UP2UseComponent* Use);

	/** For the HUD: the objective and how visible it is; the player's line now and how visible. */
	bool GetObjective(FString& Out, float& Alpha) const;
	bool GetSaid(FString& Out, float& Alpha) const;

	/** The player says this (a caption), after Delay seconds, shown for Secs. */
	void Say(const FString& Line, float Delay = 0.f, float Secs = 3.2f);
	void SetObjective(const FString& Text);

protected:
	UPROPERTY()
	TObjectPtr<AEndingDirector> Director;
	TWeakObjectPtr<APart2Character> Player;
	float Clock = 0.f;
	float HuskScale = 1.3f;

	FString Objective;
	float ObjectiveAt = -100.f;
	struct FLine
	{
		FString Text;
		float At;
		float Secs;
	};
	TArray<FLine> Lines;
	TSet<FName> Done;

	/** The street's head (by the car) and its way into the camp (town.json); the shed's door. */
	FVector StreetHead = FVector::ZeroVector;
	FVector StreetU = FVector(1.f, 0.f, 0.f);

	// the first sighting: a husk crossing the far end of the street, out of reach, and gone
	UPROPERTY()
	TObjectPtr<AHusk> Crosser;
	FVector CrossFrom, CrossTo;
	float CrossT = -1.f;

	UPROPERTY()
	TObjectPtr<AHuskHunter> Hunter;
	float BangAt = -1.f, ShriekAt = -1.f, DarkAt = -1.f;
	bool bCrossInHeadlight = false;
	void SpawnCrosser();
	/** Snow and dust sifting down from above (off the roof boards, jarred by a hit), Count flakes over Radius. */
	void SiftSnow(const FVector& Above, float Radius, int32 Count);
	void TickSift(float Dt);
	struct FSift
	{
		TObjectPtr<UStaticMeshComponent> C;
		FVector V;
		float Delay;
		float Born;
	};
	TArray<FSift> Sift;

	/** The tool shed (where she sheltered): its inside made real (plank floor, boards on the walls), a table, her journal,
	 *  a box of matches, a pot-belly stove. */
	void FurnishShed();

public:
	/** The stove lit, and this point near enough to it to be warmed. */
	bool IsNearFire(const FVector& P) const;
protected:
	bool bHasMatches = false;
	bool bStoveLit = false;
	float StoveLitAt = -1.f;
	UPROPERTY()
	TObjectPtr<AActor> Stove;
	UPROPERTY()
	TObjectPtr<class UPointLightComponent> FireLight;
	UPROPERTY()
	TObjectPtr<class UMaterialInstanceDynamic> FireGlow;
	UPROPERTY()
	TObjectPtr<class UPointLightComponent> MatchLight;
	UPROPERTY()
	TObjectPtr<UStaticMeshComponent> MatchFlame;
	float MatchAt = -1.f;
	float PassAt = -1.f;
	void TickFire(float Dt);

	bool Once(const TCHAR* Beat);
	void Event(const TCHAR* Kind) const;
	float GroundAt(const FVector& At) const;
	void Beats(float Dt);
	void TickCrosser(float Dt);
};
