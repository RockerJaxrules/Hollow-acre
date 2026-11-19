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
	/** How near to it the gaze must land (cm): a small thing a hand's width, a woodpile anywhere on it. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Use")
	float Near = 28.f;
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
	friend class AKesslerScene;
	friend class AP2Audio;

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
	/** The kill's blood (owner-approved: the exit wound, the spray on the snow behind it, the pool spreading under it). */
	UPROPERTY()
	TObjectPtr<class ABloodFX> KillBlood;
	FVector KillDir = FVector::ZeroVector;
	float BleedT = 0.f;
	float BangAt = -1.f, ShriekAt = -1.f, DarkAt = -1.f;
	/** The truck (owner-approved): her journal fallen from the glovebox onto the crushed headliner; taken, the driver's
	 *  door swings and bangs behind the player. */
	UPROPERTY()
	TObjectPtr<AActor> TruckJournal;
	UPROPERTY()
	TObjectPtr<AActor> ShedJournal;
	UPROPERTY()
	TArray<TObjectPtr<AActor>> TruckPages;
	bool bHasJournal = false;
	float DarkClock = -1.f, JournalTakenAt = -1.f, DoorBangT = -1.f;
	void TickTruckDoor(float Dt);
	bool bCrossInHeadlight = false;
	void SpawnCrosser();
	/** Snow and dust sifting down from above (off the roof boards, jarred by a hit), Count flakes over Radius. */
	void SiftSnow(const FVector& Above, float Radius, int32 Count);
	/** Snow thrown up from the ground here (a body going down at speed), outward and along Dir. */
	void SnowBurst(const FVector& At, const FVector& Dir, int32 Count);
	void TickSift(float Dt);
	struct FSift
	{
		TObjectPtr<UStaticMeshComponent> C;
		FVector V;
		float Delay;
		float Born;
		bool bThrown = false;
	};
	TArray<FSift> Sift;

	/** The tool shed (where she sheltered): its inside made real (plank floor, boards on the walls), a table, her journal,
	 *  a box of matches, a pot-belly stove. */
	void FurnishShed();
	/** Grandmother's truck (tools/blender/make_truck.py), on its roof in the trees behind the camp. */
	void SpawnTruck();
	/** Snow drifts banked against the camp's walls (tools/blender/make_drift.py). */
	void DriftAgainstWalls();
	/** The camp dressed with the Megascans props (the owner approved the downloads; Scripts/import_megascans_props.py):
	 *  barrels, crates, firewood and debris against its buildings, stumps of the timber the camp was built from, fallen
	 *  trees and snow piles round its edges; clear of the ways the night's scenes walk. */
	void DressCamp();
	UPROPERTY()
	TObjectPtr<AActor> Truck;
	UPROPERTY()
	TObjectPtr<UStaticMeshComponent> TruckDoor;

public:
	/** The stove lit, and this point near enough to it to be warmed. */
	bool IsNearFire(const FVector& P) const;
	/** The window beat: seconds since it began (-1 before), and the point in the window's gap where its hand comes in. */
	float WindowT() const { return WindowAt < 0.f ? -1.f : Clock - WindowAt; }
	FVector WindowPoint() const { return WindowGap; }
	bool WindowHandIn() const { return WindowHusk != nullptr && WindowReach > 0.3f; }
	AActor* GetWoodPile() const { return WoodPile; }
	AActor* GetTruck() const { return Truck; }
	/** Where the shed's stove stands (for its fire's sound). */
	FVector ShedStove() const { return ShedT.TransformPosition(FVector(-290.f, -115.f, 60.f)); }
	/** Her journal in the truck (taken: hidden), and where a player stands to reach in for it (outside the driver's door). */
	AActor* GetTruckJournal() const { return TruckJournal; }
	FVector GetTruckStand() const;
	bool HasJournal() const { return bHasJournal; }
	FVector GetShedAt() const { return ShedT.GetLocation(); }
	/** The lantern scene: 0 not yet; 1 a light in the trees; 2 he has stopped and holds it up to them; 3 the rifle comes
	 * up at them (run); 4 it breaks from the dark at their heels; 5 the shot, it drops; 6 he comes, the light to their
	 * face. And seconds in the stage. */
	int32 LanternStage() const { return LStage; }
	float LanternStageT() const { return Clock - LStageAt; }
	class AKessler* GetKessler() const { return Kessler; }
	AHuskHunter* GetHunter() const { return Hunter; }
	bool IsFed() const { return FedAt > 0.f; }
protected:
	bool bHasMatches = false;
	bool bStoveLit = false;
	float StoveLitAt = -1.f;
	UPROPERTY()
	TObjectPtr<AActor> Stove;
	UPROPERTY()
	TObjectPtr<class UPointLightComponent> FireLight;
	UPROPERTY()
	TObjectPtr<class USpotLightComponent> DoorSpill;
	UPROPERTY()
	TObjectPtr<class UMaterialInstanceDynamic> FireGlow;
	UPROPERTY()
	TObjectPtr<class UMaterialInstanceDynamic> FireBox;
	UPROPERTY()
	TObjectPtr<class UMaterialInstanceDynamic> FireCoal;
	UPROPERTY()
	TObjectPtr<class UMaterialInstanceDynamic> StoveHeat;
	UPROPERTY()
	TObjectPtr<class UMaterialInstanceDynamic> FlameMID;
	UPROPERTY()
	TObjectPtr<UStaticMeshComponent> Flames;
	UPROPERTY()
	TObjectPtr<class UPointLightComponent> MatchLight;
	UPROPERTY()
	TObjectPtr<class UPointLightComponent> MatchHand;
	UPROPERTY()
	TObjectPtr<UStaticMeshComponent> MatchFlame;
	UPROPERTY()
	TObjectPtr<class UMaterialInstanceDynamic> MatchFlameMID;
	// (the moon behind cloud once the headlight dies: the street near black beyond the flashlight)
	float MoonBase = -1.f, MoonDimFrom = -1.f;
	TWeakObjectPtr<class ULightComponent> Moon;
	float MatchAt = -1.f;
	float PassAt = -1.f;
	void TickFire(float Dt);

	bool Once(const TCHAR* Beat);
	void Event(const TCHAR* Kind) const;
	float GroundAt(const FVector& At) const;
	void Beats(float Dt);
	void TickCrosser(float Dt);
	// the window (later, by the fire): a scrape along the back wall, another, then its hand through the gap in the
	// boarded window over the bench, feeling along the inside of the boards; the light on it and it is gone
	void BeginWindow();
	// the wood (after the window): the stove burns down (its light, its warmth); the woodpile behind the next cabin, an
	// armful of wood; back to feed the stove
	void BeginWood();
	float FireFuel = 1.f, FireDyingFrom = -1.f, FedAt = -1.f;
	/** The shed's door leaf (Town_ShedDoor, hinged at its origin, hung open 75 degrees inward); SetShedDoor(1) open as
	 *  it hangs .. 0 shut. */
	UPROPERTY()
	TObjectPtr<AActor> ShedDoor;
	void SetShedDoor(float Open);
	/** The fire as a cutscene sets it (flared, or its door shut on it); negative: as it burns. */
	float FuelOverride = -1.f;
	UPROPERTY()
	TObjectPtr<class AKesslerScene> Scene;
	UPROPERTY()
	TObjectPtr<AActor> WoodPile;
	bool bCrossDash = false;
	float WoodTakenAt = -1.f;
	void TickWindow(float Dt);
	// the lantern (after the fire is fed): a light among the spruces behind the camp, someone walking with it; it
	// stops and is held up to the player; a rifle comes up at them; they run, it breaks from the dark at their heels,
	// the rifle goes off behind them and it drops; the lantern comes up to their face: "Get inside."
	void BeginLantern();
	void TickLantern(float Dt);
	void LStageTo(int32 S, const TCHAR* Why);
	/** A point in the street's frame from the shed (m): u along the street (+ into the camp), v across (+ behind the
	 * shed's row, toward the trees). */
	FVector ShedAt(float U, float V) const;
	bool InShed(const FVector& P) const;
	/** The player can see this point (within MaxDist cm, inside a cone of this cosine about their look, nothing between). */
	bool PlayerSees(const FVector& P, float MaxDist, float Cone) const;
	UPROPERTY()
	TObjectPtr<class AKessler> Kessler;
	int32 LStage = 0;
	float LStageAt = 0.f;
	FTransform ShedT;
	FVector KWay[3];
	FVector ChargeSide = FVector::ZeroVector;
	int32 KLeg = 0;
	UPROPERTY()
	TObjectPtr<AHusk> WindowHusk;
	float WindowAt = -1.f, WindowGoneAt = -1.f, WindowReach = 0.f, WindowLitAt = -1.f;
	FVector WindowGap = FVector::ZeroVector, WindowIn = FVector::ZeroVector, WindowSide = FVector::ZeroVector;
};
