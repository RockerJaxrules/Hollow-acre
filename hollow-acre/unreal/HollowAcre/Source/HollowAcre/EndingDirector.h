// Runs the realistic half of the ending drive. Part 1 (pixel) ends with the car driving up the mountain into the blizzard
// and the screen fading to black; this scene opens on that black, fades in to the driver's seat with the car already
// moving, drives on, then fades back to black and shows "To be continued" (the chapter break into Part 2).
//
// Command line (testing and work-log screenshots):
//   -nofade           skip the opening fade (the frame is never black)
//   -drivesecs=<s>    override how long the drive lasts before the fade out
//   -crash            Part 2's opening instead: the drive picks up further on and the creature rams the car off the
//                     mountain (-crashvel=x,y,z cm/s and -crashspin=x,y,z deg/s, car frame, tune the blow)

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "EndingDirector.generated.h"

UCLASS()
class HOLLOWACRE_API AEndingDirector : public AActor
{
	GENERATED_BODY()

public:
	AEndingDirector();

	/** The car root: the body, wheel, headlights and the driver's camera are attached to it. */
	UPROPERTY(EditAnywhere, Category = "Ending")
	TObjectPtr<AActor> Car;

	/** Seconds of held black at the start (the cut from the pixel game). */
	UPROPERTY(EditAnywhere, Category = "Ending")
	float HoldBlack = 1.5f;

	/** Seconds for the fade from black into the realistic view. */
	UPROPERTY(EditAnywhere, Category = "Ending")
	float FadeIn = 3.5f;

	/** Seconds of driving after the fade in, before the fade out. */
	UPROPERTY(EditAnywhere, Category = "Ending")
	float DriveSeconds = 30.f;

	/** Seconds for the fade back to black at the end. */
	UPROPERTY(EditAnywhere, Category = "Ending")
	float FadeOut = 3.f;

	/** Pause on black before the words appear, then how long they take to fade in. */
	UPROPERTY(EditAnywhere, Category = "Ending")
	float EndCardDelay = 1.f;

	UPROPERTY(EditAnywhere, Category = "Ending")
	float EndCardFadeIn = 2.5f;

	UPROPERTY(EditAnywhere, Category = "Ending")
	FText EndCardText = NSLOCTEXT("HollowAcre", "ToBeContinued", "To be continued");

	/** Car speed in km/h. */
	UPROPERTY(EditAnywhere, Category = "Ending")
	float SpeedKmh = 35.f;

	/** The road the car follows (world positions, cm, in driving order). Empty: drive straight ahead. */
	UPROPERTY(EditAnywhere, Category = "Ending")
	TArray<FVector> Path;

	/** The drive's sound, from the first frame (tools/make_ending_audio.py: the black, the cabin opening up as the
	 *  picture fades in, engine, road, blizzard, wipers in time with these wipers, the end card). */
	UPROPERTY(EditAnywhere, Category = "Ending")
	TObjectPtr<class USoundBase> DriveSound;

	/** The driver's arms: the director steers (their Steer turns the wheel and the hands). Found in the level if unset. */
	UPROPERTY(EditAnywhere, Category = "Ending")
	TObjectPtr<class ADriverArms> Arms;

	/** Steering: wheel turns per road-wheel turn, the car's wheelbase (cm), how far ahead (s) the driver steers. */
	UPROPERTY(EditAnywhere, Category = "Ending")
	float SteerRatio = 16.f;
	UPROPERTY(EditAnywhere, Category = "Ending")
	float Wheelbase = 266.5f;
	UPROPERTY(EditAnywhere, Category = "Ending")
	float SteerLead = 0.4f;

	/** The windshield wipers (each pivoting on its spindle, parked along the bottom of the glass). */
	UPROPERTY(EditAnywhere, Category = "Ending")
	TArray<TObjectPtr<AActor>> Wipers;

	/** Wiper sweep: seconds per out-and-back, how far they sweep (degrees), how long they rest parked between sweeps. */
	UPROPERTY(EditAnywhere, Category = "Ending")
	float WiperPeriod = 1.35f;
	UPROPERTY(EditAnywhere, Category = "Ending")
	float WiperSweep = 92.f;
	UPROPERTY(EditAnywhere, Category = "Ending")
	float WiperRest = 0.25f;

	/** Part 2's opening: the same drive picks up further up the road, and the creature rams the car off it. */
	UPROPERTY(EditAnywhere, Category = "Crash")
	bool bCrash = false;
	/** How far along Path the drive picks up (cm). */
	UPROPERTY(EditAnywhere, Category = "Crash")
	float StartDistance = 0.f;
	/** When something crosses the road ahead (the driver brakes), when it hits, when the view goes black (s). */
	UPROPERTY(EditAnywhere, Category = "Crash")
	float SightTime = 11.f;
	UPROPERTY(EditAnywhere, Category = "Crash")
	float ImpactTime = 21.f;
	/** After it has gone, the driver waits, then creeps on at walking pace from this time. */
	UPROPERTY(EditAnywhere, Category = "Crash")
	float CreepTime = 17.2f;
	/** The black comes this long after the car has finally come to rest at the bottom (or at ImpactTime + MaxFall). */
	UPROPERTY(EditAnywhere, Category = "Crash")
	float BlackAfterRest = 0.9f;
	UPROPERTY(EditAnywhere, Category = "Crash")
	float MaxFall = 26.f;
	/** Deep snow's drag on the tumbling car (linear damping; the angular damping a little more). */
	UPROPERTY(EditAnywhere, Category = "Crash")
	float SnowDrag = 0.15f;
	/** The blow, in the car's frame: the shove (cm/s; +Y is right, toward the drop) and the roll it starts (deg/s). */
	UPROPERTY(EditAnywhere, Category = "Crash")
	FVector ImpactVelocity = FVector(100.f, 750.f, 160.f);
	UPROPERTY(EditAnywhere, Category = "Crash")
	FVector ImpactSpin = FVector(170.f, 0.f, -20.f);
	/** The trip: how long the authored shove lasts (s), how far it carries the car across (cm) and how far it rolls
	 *  it (degrees) before physics takes over at the edge. */
	UPROPERTY(EditAnywhere, Category = "Crash")
	float TripTime = 0.8f;
	UPROPERTY(EditAnywhere, Category = "Crash")
	float TripAcross = 560.f;
	UPROPERTY(EditAnywhere, Category = "Crash")
	float TripRoll = 80.f;
	/** How the ground grips the car as it goes (snow over frozen soil: the wheels and the roof dig in, so it trips
	 *  and rolls rather than sledging). */
	UPROPERTY(EditAnywhere, Category = "Crash")
	float GroundGrip = 0.6f;
	/** The big spruce on the slope that stops the car (world cm, the trunk's foot; zero: none), and its mesh. */
	UPROPERTY(EditAnywhere, Category = "Crash")
	FVector StopTreeAt = FVector::ZeroVector;
	UPROPERTY(EditAnywhere, Category = "Crash")
	TObjectPtr<class UStaticMesh> StopTreeMesh;
	// the creature itself is AHusk (Husk.h): its meshes and takes are its own
	/** Where in the road it stops (cm left of the road's middle), and when (after SightTime) it starts the take. */
	UPROPERTY(EditAnywhere, Category = "Creature")
	float HaltSide = 150.f;
	UPROPERTY(EditAnywhere, Category = "Creature")
	float SwitchLead = 0.1f;
	/** The sighting: how far ahead of the car (cm, along the road, from where the car is at SightTime) it crosses, and
	 *  how long before SightTime it sets off from below the road. */
	UPROPERTY(EditAnywhere, Category = "Creature")
	float CrossAhead = 2800.f;
	UPROPERTY(EditAnywhere, Category = "Creature")
	float CrossLead = 0.75f;
	/** How much bigger than its model the husk is in the game (about 2.9 m standing). */
	UPROPERTY(EditAnywhere, Category = "Creature")
	float HuskScale = 1.3f;
	/** Its gallop (cm/s, at its model's size): the takes are keyed for 800 with no sliding. */
	UPROPERTY(EditAnywhere, Category = "Creature")
	float CreatureSpeed = 800.f;
	/** The charge: how long before the blow it comes out of the dark at the driver's side. */
	UPROPERTY(EditAnywhere, Category = "Creature")
	float ChargeLead = 0.6f;

	/** The pebbles of broken side glass. */
	UPROPERTY(EditAnywhere, Category = "Crash")
	TObjectPtr<UMaterialInterface> GranuleMaterial;

	/** Gentle body sway from the rough, snowy road (degrees). */
	UPROPERTY(EditAnywhere, Category = "Ending")
	float SwayDeg = 0.6f;

	/** 0 until the end card shows, then rises to 1 as the words fade in (read by the HUD). */
	UFUNCTION(BlueprintPure, Category = "Ending")
	float GetEndCardAlpha() const;

protected:
	virtual void BeginPlay() override;
	virtual void Tick(float DeltaSeconds) override;

private:
	void StartFadeIn();
	void StartFadeOut();
	void ShowEndCard();

	/** Position along Path at a distance (cm) from its start. */
	FVector PathAt(float Dist) const;
	/** The road's heading (radians, Unreal yaw: positive turns right) at a distance along it. */
	float HeadingAt(float Dist) const;
	float SteerNow = 0.f;
	// crash mode
	void Impact();
	UFUNCTION()
	void OnBodyHit(UPrimitiveComponent* HitComp, AActor* Other, UPrimitiveComponent* OtherComp, FVector NormalImpulse, const FHitResult& Hit);
	int32 HitsLogged = 0;
	void BurstWindow(bool bDriver);
	UPROPERTY()
	TObjectPtr<class UMaterialInstanceDynamic> WindshieldMID;
	UPROPERTY()
	TObjectPtr<class UMaterialInstanceDynamic> SideGlassMID;
	bool bCracked = false;
	void CrashCamera(float DeltaSeconds);
	float DistNow = 0.f;
	float SpeedNow = 0.f;
	bool bImpacted = false;
	bool bBlack = false;
	bool bBlinking = false;
	// the creature
	UPROPERTY()
	TObjectPtr<class AHusk> Creature;
	class AHusk* SpawnHusk(const TCHAR* Take);
	FVector CrePos = FVector::ZeroVector, CreDir0 = FVector::ForwardVector;
	float CreTakeYaw = 0.f;
	bool bScreamed = false;
	float CreLift = 0.f, CreLiftMax = 0.f, CreLiftLogAt = 0.f;
	float CreRoadD = 0.f;          // how far along the road it crossed (to bolt away up the road from)   // lifting it clear of the real snow (AHusk::GroundLift)
	void MoveCreature(float DeltaSeconds);
	float CreatureGround(const FVector& At) const;
	float CreatureYawFix = 0.f;
	FVector CreFrom = FVector::ZeroVector, CreDir = FVector::ForwardVector, CreRight = FVector::RightVector;
	float CreT0 = 0.f, CreLen = 0.f, CreHop0 = -1.f, CreHop1 = -1.f, CrePitch = 0.f, CreS = 0.f;
	bool bCrossed = false, bCharged = false, bCharging = false;
	int32 CreStage = 0;       // 1 running in, 2 the sighting take, 3 bolting, 4 the charge
	float CreTakeT0 = 0.f, CreSwitchAt = 0.f, CreBolt = 0.f;
	FVector CreSwitch = FVector::ZeroVector, CreCentre = FVector::ZeroVector;
	bool bStopped = false, bCreeping = false, bDeep = false;
	// the driver's head turning (degrees, + to the right)
	float LookYaw = 0.f;
	float LookWant(float DeltaSeconds);
	void PlaceCamera();
	UPROPERTY()
	TObjectPtr<AActor> Body;
	UPROPERTY()
	TObjectPtr<class UBoxComponent> BodyBox;
	UPROPERTY()
	TObjectPtr<AActor> Camera;
	FVector CamRest = FVector::ZeroVector;
	FRotator CamRestRot = FRotator::ZeroRotator;
	FVector PrevVel = FVector::ZeroVector;
	FVector HeadOff = FVector::ZeroVector;
	FRotator HeadRot = FRotator::ZeroRotator;
	float Jolt = 0.f;
	FTransform ImpactPose;
	FVector PrevPos = FVector::ZeroVector;
	bool bPhysics = false;
	void Event(const TCHAR* Kind, float Value = 0.f);
	float LastHitEvent = -1.f;
	bool bRested = false;
	float RestTime = 0.f;
	float StillFor = 0.f;
	bool bSighted = false;
	bool bBraked = false;
	FTransform TripPose(float t) const;
	void HandToPhysics();
	bool bHoldBlack = false;
	TArray<FQuat> WiperBase;
	FVector WiperAxis = FVector::UpVector;
	float WiperSign = 1.f;

	FTransform CarStart;
	TArray<float> PathDist;
	float Time = 0.f;
	float EndCardTime = -1.f;
	FTimerHandle Timer;
};
