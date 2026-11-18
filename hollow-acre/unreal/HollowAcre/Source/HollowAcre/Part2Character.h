// The player in Part 2 (milestone 2, "waking at the bottom"): first person on foot in the snow. Written networked from
// its first version (owner: "Multiplayer needs to be a thing for part 2 as well"): the movement is the engine's own
// replicated character movement, the host decides stamina and warmth, every player sees each other's flashlight.
//
// In the snow: walking is slow and heavy (deep snow), running costs stamina and stops when it runs out until the breath
// comes back, crouching is slower and quieter. The flashlight (an old two D-cell one) is toggled, its battery runs down.
// The cold: outside, the body's warmth falls; shelter and fire (later) bring it back.
//
// What the player sees of themselves (for now, until the motion-captured body): the driver's arms (DriverArms, free of
// the seat), the right hand holding the flashlight in front of the chest, its beam swaying a little behind the eyes; the
// breath in the cold. The wake (EndingWakeBeats.cpp) hands over to this with no cut: TakeOverFrom puts the eyes where
// the cutscene's are and takes the arms and the flashlight.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "Part2Character.generated.h"

class ADriverArms;
class AStaticMeshActor;
class UCameraComponent;
class UInputAction;
class UInputMappingContext;
class USpotLightComponent;
struct FInputActionValue;

UCLASS()
class HOLLOWACRE_API APart2Character : public ACharacter
{
	GENERATED_BODY()

public:
	APart2Character();
	virtual void Tick(float DeltaSeconds) override;
	virtual void SetupPlayerInputComponent(UInputComponent* PlayerInputComponent) override;
	virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;
	virtual void PawnClientRestart() override;

	/** From the wake: the eyes where the cutscene's camera is (world), the arms and the flashlight (with its beam) taken over. */
	void TakeOverFrom(const FTransform& EyeWorld, ADriverArms* InArms, AStaticMeshActor* InFlashlight, USpotLightComponent* InBeam,
		const FPostProcessSettings& Grade);

	/** Walking (deep snow), running, crouched (cm/s). */
	UPROPERTY(EditAnywhere, Category = "Part 2")
	float WalkSpeed = 150.f;
	UPROPERTY(EditAnywhere, Category = "Part 2")
	float RunSpeed = 360.f;
	/** An armful of split wood (from the woodpile, for the stove): slower, no running, the light held low over it. */
	bool bCarryingWood = false;
	int32 WoodLeg = 0;
	UPROPERTY(EditAnywhere, Category = "Part 2")
	float CrouchSpeed = 85.f;
	/** Seconds of running on full stamina; seconds to get it all back (standing, walking a little slower). */
	UPROPERTY(EditAnywhere, Category = "Part 2")
	float RunFor = 7.f;
	UPROPERTY(EditAnywhere, Category = "Part 2")
	float RecoverIn = 11.f;
	/** The flashlight's beam (candelas) and how long its batteries last on (s). */
	UPROPERTY(EditAnywhere, Category = "Part 2")
	float BeamCd = 330.f;
	UPROPERTY(EditAnywhere, Category = "Part 2")
	float BatterySeconds = 1500.f;
	/** Outside in the night: how fast the body's warmth falls (per s, of 100). */
	UPROPERTY(EditAnywhere, Category = "Part 2")
	float ColdRate = 0.18f;

	/** 0..1 (owner sees it): stamina, the batteries, warmth. */
	UPROPERTY(Replicated)
	float Stamina = 1.f;
	UPROPERTY(Replicated)
	float Battery = 1.f;
	UPROPERTY(Replicated)
	float Warmth = 0.6f;                       // (out of the wreck into the snow: already chilled)
	/** What the husk reads off the player (HuskHunter): the eyes, where they look, the beam, running. */
	FVector EyesAt() const;
	FVector LookDir() const;
	FVector BeamFrom() const;
	FVector BeamDir() const;
	bool IsLightOn() const { return bFlashlightOn && Battery > 0.f; }
	bool IsRunningNow() const { return bRunning; }
	bool IsDead() const { return bDead; }
	/** Caught by the husk: the eyes go to it, black, and back at the last checkpoint. */
	void Caught(AActor* By);
	/** The flashlight stutters (a bad contact jarred) for Secs. */
	void Stutter(float Secs);
	/** A hit felt through the body: the eyes jolt and settle. */
	void Jolt(float Strength);
	float JoltT = -1.f, JoltK = 0.f;
	/** For the HUD: what can be used where the eyes look (its prompt); the page being read (and which of how many). */
	bool GetPrompt(FString& Out) const;
	bool GetReading(FString& Page, int32& Index, int32& Count) const;
	bool IsReading() const { return Reading.IsValid(); }

	/** Where the player comes back after a death. */
	FTransform Checkpoint = FTransform::Identity;
	FRotator CheckpointLook = FRotator::ZeroRotator;

	/** The flashlight on (everyone sees it). */
	UPROPERTY(ReplicatedUsing = OnRep_Flashlight)
	bool bFlashlightOn = true;

protected:
	virtual void BeginPlay() override;

	UPROPERTY(VisibleAnywhere)
	TObjectPtr<UCameraComponent> Camera;
	/** The beam other players see (and this one's own, until it holds the wake's flashlight). */
	UPROPERTY(VisibleAnywhere)
	TObjectPtr<USpotLightComponent> Beam;

	UPROPERTY()
	TObjectPtr<ADriverArms> Arms;
	UPROPERTY()
	TObjectPtr<AStaticMeshActor> HeldLight;
	UPROPERTY()
	TObjectPtr<USpotLightComponent> HeldBeam;

	UPROPERTY()
	TObjectPtr<UInputAction> MoveAction;
	UPROPERTY()
	TObjectPtr<UInputAction> LookAction;
	UPROPERTY()
	TObjectPtr<UInputAction> MouseLookAction;
	UPROPERTY()
	TObjectPtr<UInputAction> JumpAction;
	UPROPERTY()
	TObjectPtr<UInputAction> SprintAction;
	UPROPERTY()
	TObjectPtr<UInputAction> CrouchAction;
	UPROPERTY()
	TObjectPtr<UInputAction> FlashlightAction;
	UPROPERTY()
	TObjectPtr<UInputAction> InteractAction;
	UPROPERTY()
	TArray<TObjectPtr<UInputMappingContext>> Contexts;

	void Move(const FInputActionValue& V);
	void Look(const FInputActionValue& V);
	void RunStart();
	void RunStop();
	void CrouchToggle();
	void FlashlightToggle();
	void Interact();
	void UpdateFocus();
	TWeakObjectPtr<class UP2UseComponent> Focus;
	TWeakObjectPtr<class UP2UseComponent> Reading;
	int32 Page = 0;
	float StutterUntil = -1.f;
	float StoryAutoT = 0.f;
	int32 StoryStep = 0;
	float StepT = 0.f;
	float PeerSeenT = 0.f, GoneT = 0.f;
	void StoryAutopilot(float Dt);

	UFUNCTION(Server, Reliable)
	void ServerSetRunning(bool bOn);
	UFUNCTION(Server, Reliable)
	void ServerSetFlashlight(bool bOn);
	UFUNCTION()
	void OnRep_Flashlight();

	bool bWantsRun = false;
	bool bRunning = false;
	bool bWinded = false;            // (ran out: no running until it comes back past a third)
	FTransform HoldAim = FTransform::Identity;
	bool bHold = false;
	float Bob = 0.f;
	float AutoT = 0.f;                        // (the -p2walk test autopilot's clock)
	bool bDead = false;
	float ChaseSeenT = 0.f;                   // (the autopilot: how long it has watched the charge)
	float DeadT = 0.f;
	TWeakObjectPtr<AActor> CaughtBy;
	float NoiseT = 0.f;
	FPostProcessSettings BaseGrade;
	void ShowCold(float Dt);
	float ShiverT = 0.f;
	bool bUnderRoof = false;
	float NightBias = 0.f;
	UPROPERTY()
	TObjectPtr<UStaticMeshComponent> Armful;
	UPROPERTY()
	TObjectPtr<class UPointLightComponent> ArmfulFill;
	float RoofCheckedAt = -1.f;
	FRotator ShiverRot = FRotator::ZeroRotator, JoltRot = FRotator::ZeroRotator;
	// the breath in the cold: each breath out a puff of vapour from under the eyes, drifting out and up and spreading
	// thin, seen where a light catches it (the beam, the fire); quicker and heavier winded; none by a lit fire
	void UpdateBreath(float Dt);
	// the attention closing in: holding the beam on its face (at the doorway, its hand at the window) the view narrows
	// slowly, as the eyes fix on it; it opens again when the eyes leave it
	void UpdateAttention(float Dt);
	float BaseFov = 78.f;
	float FixedK = 0.f;
	float BreathT = 1.5f;
	struct FPuff
	{
		TWeakObjectPtr<UStaticMeshComponent> C;
		TWeakObjectPtr<class UMaterialInstanceDynamic> M;
		FVector V;
		float Age, Life, R0, R1, Peak;
		bool bOut;
	};
	TArray<FPuff> Puffs;
	float AimDist = 3000.f, NearSmoothed = 3000.f;
	TWeakObjectPtr<class AEndingDirector> Director;
	void ReportNoise(float Carries);
	void TickDeath(float Dt);
	float EyeHeight = 162.f;
	void UpdateBody(float Dt);
	void ApplyLight();
};
