// Part 2's sound, played live (the owner: "sound needs alot of work"; until now it was only mixed afterwards for the
// videos). Supermassive's way (WORLD_RESEARCH.md): the ambience as a few looping layers blended live (the mountain's wind
// and the winter forest outside, the wind through the boards and the stove inside), louder than film; the creature heard
// before it is seen (its steps and breath in 3D, its shriek); a heartbeat and a low drone rising with the hunt's menace;
// the story's moments as one-shots where they happen; the player's own steps in the snow. The clips are cut by
// tools/make_game_audio.py from the CC0 recordings (SOURCES.md) and imported by Scripts/import_game_audio.py.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "P2Audio.generated.h"

class UAudioComponent;
class USoundBase;
class USoundAttenuation;
class AP2Story;

UCLASS()
class HOLLOWACRE_API AP2Audio : public AActor
{
	GENERATED_BODY()

public:
	AP2Audio();
	virtual void Tick(float DeltaSeconds) override;
	void Start(AP2Story* InStory);
	/** A story or hunt event (the director's event log): its sound, where it happens. */
	void OnEvent(const TCHAR* Kind, float Value);
	/** A clip played where something happens (Ruth's boots, a board's creak): Name is a clip in Audio/Play. */
	void PlayAt(const TCHAR* Name, const FVector& Where, float Volume = 1.f, float Pitch = 1.f);
	/** One of a numbered set (Stem_00..), picked at random, played there. */
	void PlayOneOf(const TCHAR* Stem, int32 Count, const FVector& Where, float Volume = 1.f);

protected:
	TWeakObjectPtr<AP2Story> Story;
	UPROPERTY()
	TMap<FName, TObjectPtr<USoundBase>> Clips;
	UPROPERTY()
	TObjectPtr<USoundAttenuation> Near;
	UPROPERTY()
	TObjectPtr<USoundAttenuation> Far;
	UPROPERTY()
	TObjectPtr<UAudioComponent> WindOut;
	UPROPERTY()
	TObjectPtr<UAudioComponent> Forest;
	UPROPERTY()
	TObjectPtr<UAudioComponent> WindIn;
	UPROPERTY()
	TObjectPtr<UAudioComponent> Fire;
	UPROPERTY()
	TObjectPtr<UAudioComponent> Heart;
	UPROPERTY()
	TObjectPtr<UAudioComponent> Drone;
	float Inside = 0.f, Danger = 0.f, StepDist = 0.f, HuskStepT = 0.f, HuskBreathT = 0.f;
	FVector LastFeet = FVector::ZeroVector;
	USoundBase* Clip(const TCHAR* Name);
	USoundBase* Pick(const TCHAR* Stem, int32 Count);
	UAudioComponent* Bed(const TCHAR* Name);
	void At(USoundBase* S, const FVector& Where, float Volume = 1.f, float Pitch = 1.f, bool bFar = false);
	void Flat(USoundBase* S, float Volume = 1.f);
	FVector HuskAt() const;
};
