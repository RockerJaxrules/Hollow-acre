// The husk that hunts the player in Part 2 (Act I onward). Built the way Alien: Isolation's creature is (Creative
// Assembly, after Tommy Thompson's analysis "The Perfect Organism"): two brains.
//  - The director always knows where the player is. It keeps a menace gauge (rising while the husk is close, and faster
//    while the player can see or hear it); at its peak it calls the husk off into the trees for a while, and when all
//    has been quiet too long it hands the husk a hint, a place near the player to search ("psychopathic serendipity").
//  - The husk only knows what it senses: sight (a cone, out to how visible the player is: the flashlight on is seen from
//    far, a crouched player with it off only close by, blocked by buildings and the car) and hearing (running is heard
//    far, walking near, crouching barely; the flashlight's click). It roams toward the hint, investigates what it heard,
//    stalks at the edge of the light (it stops still when the beam finds it), charges at a gallop, searches where it lost
//    the player, and goes. A catch kills (the player's body handles the death and the return to the last checkpoint).
// It drives an AHusk (the crash's creature: its body, face and takes): the Stalk take walking, Gallop running, Peer
// standing to look and listen; the code moves it over the snow and round the camp's buildings.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "HuskHunter.generated.h"

class AHusk;
class APart2Character;
class AEndingDirector;

UCLASS()
class HOLLOWACRE_API AHuskHunter : public AActor
{
	GENERATED_BODY()

public:
	AHuskHunter();
	virtual void Tick(float DeltaSeconds) override;

	/** Start hunting: the husk appears out of sight of the player, this far away (cm), and begins to roam toward them. */
	void Begin(AEndingDirector* InDirector, float Scale, float StartFar = 4500.f);

	/** The player made a noise here, this loud (how far it carries, cm). */
	void HearNoise(const FVector& At, float Carries);

	enum class EState : uint8 { Away, Roam, Investigate, Stalk, Chase, Search, Retreat, Kill, Peer };

	/** Scripted: it comes to a doorway (DoorAt, outside it) and bends to look in (along Into). */
	void PeerInto(const FVector& DoorAt, const FVector& Into);
	/** Scripted: it breaks from here at a full gallop straight for the player, and keeps on (nothing calls it off, and it
	 * does not catch them: the story ends it). */
	void ChargeFrom(const FVector& From);
	/** Scripted: shot through at the gallop: down in the snow, dead. */
	void Shot(const FVector& Dir);
	bool IsDead() const { return bDead; }
	/** Scripted: kept away (out of the scene) until a scripted charge. */
	void HoldAway();
	/** Where it is (its body's middle). */
	FVector BodyAt() const;
	EState State = EState::Away;
	bool bScripted = false, bDead = false;
	float Menace = 0.f;

	UPROPERTY()
	TObjectPtr<AHusk> Husk;

protected:
	UPROPERTY()
	TObjectPtr<AEndingDirector> Director;
	TWeakObjectPtr<APart2Character> Prey;

	float Scale = 1.3f;
	float StateT = 0.f;          // seconds in this state
	float Clock = 0.f;
	float SenseT = 0.f;          // next senses update
	float Speed = 0.f;           // cm/s now (eased)
	float Yaw = 0.f;             // the way it faces (deg)
	FVector Goal = FVector::ZeroVector;
	FVector LastKnown = FVector::ZeroVector;
	float LastSeenT = -1e9f;
	float Aware = 0.f;           // 0..1: how sure it is the player is there
	bool bSeesPrey = false;
	bool bLit = false;           // the player's beam is on it
	float LitFor = 0.f;
	float QuietFor = 0.f;
	float AwayUntil = 0.f;
	FString Take;
	float TwitchT = 0.f;
	bool bToDoor = false;
	FVector DoorAt = FVector::ZeroVector, DoorInto = FVector::ForwardVector;
	float UnseenFor = 0.f;
	bool bPreyIndoors = false;
	float StepT = 0.f;
	int32 Footfalls = 0;
	float BreathT = 0.f;
	FRotator TwitchTo = FRotator::ZeroRotator;

	void SetState(EState S, const TCHAR* Why);
	void Sense(float Dt);
	void Think(float Dt);
	void Move(float Dt);
	void PlayTake(const TCHAR* T, float Rate);
	float GroundAt(const FVector& At) const;
	bool LineOfSight(const FVector& From, const FVector& To) const;
	FVector HeadAt() const;
	FVector Steer(const FVector& From, const FVector& Dir) const;
	FVector OutOfSightNear(const FVector& Around, float MinR, float MaxR) const;
	bool PreyCanSee(const FVector& P, bool* bInBeam = nullptr) const;
	void Event(const TCHAR* Kind) const;
};
