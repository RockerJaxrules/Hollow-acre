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
	float SightTime = 31.f;
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
	float HaltSide = -110.f;            // in the car's lane, straight ahead in the headlights
	UPROPERTY(EditAnywhere, Category = "Creature")
	float SwitchLead = 0.1f;
	/** The sighting: how far ahead of the car (cm, along the road, from where the car is at SightTime) it crosses, and
	 *  how long before SightTime it sets off from below the road. */
	UPROPERTY(EditAnywhere, Category = "Creature")
	float CrossAhead = 2330.f;          // it stops in the road about 8 m short of the car (its head under the roof's edge as it rears up)
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

	// ---- the rebuilt crash cut (unreal/CUTSCENE_CRASH.md): Supermassive's horror language through the driver's eyes
	/** The driver's arms dressed for winter: leather gloves, the farmer's flannel sleeves (Scripts/build_drive.py). */
	UPROPERTY(EditAnywhere, Category = "Ending")
	TObjectPtr<UMaterialInterface> GloveMaterial;
	/** Eyes in the dark catching the headlights, and Kessler's letter on the passenger seat. */
	UPROPERTY(EditAnywhere, Category = "Crash")
	TObjectPtr<UMaterialInterface> EyeShineMaterial;
	UPROPERTY(EditAnywhere, Category = "Crash")
	TObjectPtr<UMaterialInterface> LetterMaterial;
	/** The beats before the creature (s): the glance down at the letter, the smashed gap going by on the right (the
	 *  head follows its tyre tracks, the decal at the gap), the eyes in the trees. */
	UPROPERTY(EditAnywhere, Category = "Crash")
	float LetterTime = 8.5f;
	UPROPERTY(EditAnywhere, Category = "Crash")
	float GapTime = 17.f;
	UPROPERTY(EditAnywhere, Category = "Crash")
	float EyesTime = 24.f;
	/** The stare: its sighting take slowed to this rate while it turns to face the car and stands looking at it. */
	UPROPERTY(EditAnywhere, Category = "Crash")
	float StareRate = 1.f;               // the take's stare is its own length now: real speed
	/** ...and the turn to face the car before it, a little slowed. */
	UPROPERTY(EditAnywhere, Category = "Crash")
	float StareTurnRate = 1.f;
	/** After it has gone: the creep starts this long after, and the blow comes this long into the creep. */
	UPROPERTY(EditAnywhere, Category = "Crash")
	float CreepAfterBolt = 1.6f;
	UPROPERTY(EditAnywhere, Category = "Crash")
	float ImpactAfterCreep = 9.2f;
	/** The blow in slow motion: the time dilation, and how long it holds (real seconds). */
	UPROPERTY(EditAnywhere, Category = "Crash")
	float SlowMo = 0.22f;
	UPROPERTY(EditAnywhere, Category = "Crash")
	float SlowMoSeconds = 2.3f;          // from the lunge: about a second before the blow, 1.3 s after it
	/** The lunge: the slow motion starts this long (game seconds) before the blow, as it leaps at the door. */
	UPROPERTY(EditAnywhere, Category = "Crash")
	float LungeLead = 0.22f;
	/** The headlights through the cut, as a share of the level's (the snow and the creature keep their detail). */
	UPROPERTY(EditAnywhere, Category = "Crash")
	float HeadlightShare = 0.4f;
	/** The stare: the view narrows to this field of view as the eyes fix on it, widening again at the scream. */
	UPROPERTY(EditAnywhere, Category = "Crash")
	float StareFov = 56.f;
	/** The eyes adjusting to it in the headlights (EV): everything round it goes dark while it is near in the road. */
	UPROPERTY(EditAnywhere, Category = "Crash")
	float GlareEv = -3.6f;               // at 5.5 m from the headlights; less the further it is (the light falls off with distance squared)
	/** After the fall (real seconds): the black before waking; from waking, the silhouette and the eyes closing. */
	UPROPERTY(EditAnywhere, Category = "Crash")
	float WakeAfterRest = 3.f;
	UPROPERTY(EditAnywhere, Category = "Crash")
	float SilhouetteAfterWake = 3.4f;
	UPROPERTY(EditAnywhere, Category = "Crash")
	float CloseAfterWake = 10.5f;
	/** The words over the black: where and when at the start, the title at the end. */
	UPROPERTY(EditAnywhere, Category = "Crash")
	FText PlaceText = NSLOCTEXT("HollowAcre", "CrashPlace", "The Hollow Mountains");
	UPROPERTY(EditAnywhere, Category = "Crash")
	FText WhenText = NSLOCTEXT("HollowAcre", "CrashWhen", "November");
	UPROPERTY(EditAnywhere, Category = "Crash")
	FText TitleText = NSLOCTEXT("HollowAcre", "CrashTitle", "HOLLOW ACRE");
	UPROPERTY(EditAnywhere, Category = "Crash")
	FText SubtitleText = NSLOCTEXT("HollowAcre", "CrashSubtitle", "PART TWO");

	/** For the HUD: the words on screen now (a line and a smaller line), their alpha, the first line's size as a
	 *  fraction of the screen's height. False when there are none. */
	bool GetCaption(FString& Line1, FString& Line2, float& Alpha, float& Size) const;
	/** The reveal over the bonnet and the face at the driver's window (CUTSCENE_CRASH.md): a shape darts across the
	 *  headlights; the car stops; the empty road; the car dips as it takes hold of the bonnet and rises into the
	 *  windshield, stares, screams, springs away over the roof. The creep stops by the break in the rail, and it is at
	 *  the window. Off: the old crossing in the road and the charge out of the dark. */
	UPROPERTY(EditAnywhere, Category = "Crash")
	bool bHoodReveal = true;
	UPROPERTY(EditAnywhere, Category = "Crash")
	float DipAfterStop = 3.6f;
	/** Where it stands against the car (cm, car frame: x ahead of the driver's eye, y to the right), as its takes are
	 *  made (tools/blender/husk_body.py: HOOD_*, PEER_*). */
	UPROPERTY(EditAnywhere, Category = "Crash")
	FVector2D HoodStand = FVector2D(292.f, 20.f);
	UPROPERTY(EditAnywhere, Category = "Crash")
	FVector2D PeerStand = FVector2D(15.f, -186.f);
	/** Where its feet land on the bonnet (cm, car frame; tools/blender/husk_body.py: Perch). */
	UPROPERTY(EditAnywhere, Category = "Crash")
	FVector PerchAt = FVector(205.f, 20.f, 95.f);
	/** The attack on the bonnet (the owner's choice, after Dying Light: The Beast's infected on the hood): it lands on the
	 *  bonnet while the car drives on, clings, is thrown about as the driver swerves, slams its head into the glass, and is
	 *  flung off the front when the driver brakes hard. -roofattack: the version on the roof instead. */
	bool bHoodAttack = true;
	/** The stall (the owner's choice, in place of the attacks on the bonnet and the roof): the engine dies out of nowhere,
	 *  the car rolls to a stop beside the break in the rail, the key won't start it, and it hits the driver's door out of
	 *  the dark (nothing of it seen before). -roofattack / -hoodattack: those attacks instead. */
	bool bStall = true;
	float StallT = -1.f, StallV = 0.f, StallCoast = 2600.f;
	int32 KeyBeat = 0;
	/** When it hits (s after the car has stopped): during the third, frantic turn of the key. */
	float StallHitAfter = 7.0f;
	/** When it is at the driver's door (s after the car has stopped; the eyes on the key): its hand bursts the window
	 *  1.3-1.5 s later, the blow 1.75 s after it gets there. When the glass went (-1: not yet). */
	float StallPeerAt = 4.3f, SmashT = -1.f;
	/** (the stall) From the glass going to the blow (s): its face in the hole, its arm in at the driver. */
	float StallHold = 0.99f;
	/** (the stall) How long its face is in the hole, shrieking, before it drives its arm in at the driver (s). */
	float StallFace = 0.6f;
	/** (the stall) How long it keeps shoving the car after the blow (game s; the car is carried across the road meanwhile),
	 *  and how many heaves; which heave it is on. */
	float StallPushFor = 0.42f;
	/** (the stall) The ram (husk_body.py's Ram take): how far it backs off the window into its coil (m at the model's
	 *  size: x HuskScale), when in the take it meets the door (the blow). */
	float StallRamBack = 110.f, StallRamHit = 0.62f;
	/** (the stall) The ram played quick (The Quarry, Until Dawn: bursts, dead still between): game seconds for its take's
	 *  back-off (0-0.28), its coil (0.28-0.46) and its spring (0.46-0.62). */
	FVector StallRamPace = FVector(0.16f, 0.12f, 0.11f);
	float RamTakeAt(float GameT) const;
	bool bLaunched = false;
	/** Blood as a liquid (BloodFX): sprayed from its mouth as it shrieks, dripping from its chin and claws, pooling where
	 *  it stands, smeared by its hands on the car. */
	UPROPERTY()
	TObjectPtr<class ABloodFX> Blood;
	float NextDrip = 0.f;
	bool bCoilPool = false, bSmeared = false;
	void BleedHand(class AHusk* H, FName Bone, const FVector& Toward);
	void SprayFrame(class AHusk* H, int32 Count, float Speed);
	int32 StallHeaves = 3, HeaveBeat = 0;
	/** (the stall) Its head's jerks at the window (Until Dawn's wendigos): from, to, now (degrees), when the last began and
	 *  when the next comes (s after the glass went). */
	FRotator TwitchFrom = FRotator::ZeroRotator, TwitchTo = FRotator::ZeroRotator, TwitchNow = FRotator::ZeroRotator;
	float TwitchT0 = 0.f, TwitchNext = 0.f;
	FRandomStream TwitchRand = FRandomStream(4127);
	/** (the stall) The car rocked on its springs by it (degrees of roll, + away from it), and the driver's head yanked
	 *  toward the window by its grip (cm, car frame -Y). */
	float StallRock() const;
	float StallYank() const;
	/** The bonnet attack's timing (s after it lands): the swerves, the blow on the glass, the brakes. */
	float HoodStrikeAt = 2.9f, HoodBrakeAt = 3.9f;
	/** Where its hips are as it lies on the bonnet (cm, car frame): its head out over the scuttle at the foot of the glass, its
	 *  legs off the front. */
	FVector HoodLie = FVector(175.f, 10.f, 96.f);
	/** Its slide across the bonnet (cm, + right) and its lunge at the glass (cm, + forward), each on a spring; flung off. */
	float HoodSlideY = 0.f, HoodSlideV = 0.f, HoodLungeX = 0.f, HoodLungeV = 0.f;
	FVector ThrowP = FVector::ZeroVector, ThrowV = FVector::ZeroVector;
	float ThrowT = -1.f, ThrowSpin = 0.f, ThrowSpinV = 0.f;
	int32 HoodBeat = 0;
	/** The driver's swerves (cm, + right of the car's path) t seconds after it lands on the bonnet. */
	float SwerveOff(float t) const;
	/** Where its hips are on the roof (cm, car frame): it crouches there facing forward, its head near the roof's front edge. */
	UPROPERTY(EditAnywhere, Category = "Crash")
	FVector RoofPerch = FVector(-40.f, -5.f, 141.f);
	/** Where its head comes down to, hanging upside down over the roof's front edge (cm, car frame; its y is the driver's
	 *  eye's): out past the glass, a little above the eye line. */
	UPROPERTY(EditAnywhere, Category = "Crash")
	FVector RoofHangHead = FVector(116.f, 0.f, 138.f);
	/** Where the car is left after the fall (cm, world): on its roof at the head of the abandoned town's street, facing
	 *  down it (Scripts/build_town.py sets these; zero: the flattest snow near where it stopped). */
	UPROPERTY(EditAnywhere, Category = "Crash")
	FVector TownRestAt = FVector::ZeroVector;
	UPROPERTY(EditAnywhere, Category = "Crash")
	float TownRestYaw = 0.f;
	/** Where its claw strikes the windshield (cm, car frame: a point on the glass). */
	UPROPERTY(EditAnywhere, Category = "Crash")
	FVector RoofClawAt = FVector(82.f, 68.f, 111.7f);     // (out to its side: its arm reaching, not folded up under its shoulder)
	/** The real-motion clip on the roof (CMU 111_03, crawling): from where (s) and how fast. */
	UPROPERTY(EditAnywhere, Category = "Ending|Crash")
	float PerchClipAt = 7.f;
	UPROPERTY(EditAnywhere, Category = "Ending|Crash")
	float PerchClipRate = 0.65f;
	UPROPERTY(EditAnywhere, Category = "Crash")
	float CreepAfterGone = 1.8f;
	/** cm along the road: the creep stops here, by the stretch of rail the car is shoved through. */
	UPROPERTY(EditAnywhere, Category = "Crash")
	float PeerStopAt = 52900.f;
	/** The exposure while it is at the bonnet (its face lit by the snow's bounce, out of the beams). */
	UPROPERTY(EditAnywhere, Category = "Crash")
	float HoodEv = -0.4f;

	/** For the HUD: the driver's line now (a caption: the driver is not voiced), and its alpha. False when silent. */
	bool GetLine(FString& Line, float& Alpha) const;

	/** Gentle body sway from the rough, snowy road (degrees). */
	UPROPERTY(EditAnywhere, Category = "Ending")
	float SwayDeg = 0.6f;

	/** 0 until the end card shows, then rises to 1 as the words fade in (read by the HUD). */
	UFUNCTION(BlueprintPure, Category = "Ending")
	float GetEndCardAlpha() const;
	/** The wake's eyelids: 0 open .. 1 shut (the HUD draws them closing from above and below, soft-edged). */
	float GetLids() const { return WakeLids; }
	float WakeLids = 0.f;

protected:
	virtual void BeginPlay() override;
	virtual void Tick(float DeltaSeconds) override;

	/** How far (cm) the driver's eye is kept off the car's surfaces (the camera's near plane is 5). */
	UPROPERTY(EditAnywhere, Category = "Ending|Crash")
	float EyeRoom = 8.f;

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
	// the driver's head turning (degrees, + to the right), tipping (+ up), leaning in (cm), and the shake of the scream
	float LookYaw = 0.f;
	float LookPitch = 0.f, HeadPush = 0.f, RoarShake = 0.f;
	/** The head leaned over to the right and down (cm), to see the key past the arm turning it. */
	float HeadSide = 0.f, HeadDrop = 0.f;
	/** The eyes on the key (this frame), and how far the view closes in on it then (degrees of field of view). */
	bool bOnKey = false;
	float KeyFov = 58.f;
	// ---- Part 2's opening, the wake in the wreck (EndingWakeBeats.cpp; -wake): straight to the car on its roof where the
	// fall left it; the eyes open hanging in the belt; the buckle, the drop, the flashlight, the thump, out of the window
	bool bWake = false;
	float WakeT0 = -1.f;                     // (real time) the eyes begin to open
	/** Where the car is left at the bottom (as the crash leaves it, -notown) and the way it faces (degrees). */
	FVector WakeRestAt = FVector(9646.003f, 46709.351f, 0.f);
	float WakeRestYaw = 351.f;
	/** Up the chute it fell down: where the fall stopped (world), for the last look back up. */
	FVector WakeChuteAt = FVector(18646.003f, 40709.351f, -6285.836f);
	void WakeJump();
	void WakeSetup();
	void WakeBeats(float RealDt);
	void WakeBreath(float w, float RealDt, const FTransform& Eye);
	UPROPERTY()
	TObjectPtr<class AStaticMeshActor> Flashlight;
	UPROPERTY()
	TObjectPtr<class USpotLightComponent> FlashBeam;
	UPROPERTY()
	TObjectPtr<class UPointLightComponent> FlashSpill;
	UPROPERTY()
	TArray<TObjectPtr<AActor>> WakeProps;
	UPROPERTY()
	TObjectPtr<class AStaticMeshActor> SnowSlab;
	UPROPERTY()
	TObjectPtr<class AStaticMeshActor> SnowLump;
	UPROPERTY()
	TArray<TObjectPtr<class UStaticMeshComponent>> BreathPool;
	UPROPERTY()
	TArray<TObjectPtr<class UMaterialInstanceDynamic>> BreathMID;
	struct FPuff
	{
		FVector P, V;
		float Age, Life, Size;
	};
	TArray<FPuff> Puffs;
	float NextPuff = 0.f, WakeNextDrip = 0.f, FlashOn = 0.f;
	FTransform FlashRest = FTransform::Identity;   // (car frame) where it lies in the spill
	FTransform BodyEye = FTransform::Identity;      // (car frame) the eye's frame the chest hangs under (lags the head)
	FTransform HoldAim = FTransform::Identity;       // (car frame) the flashlight's held frame, swaying behind the eyes
	bool bFlashHeld = false, bBodyEye = false, bWakeHandedOver = false;
	FTransform FlashInHandAtGrab = FTransform::Identity;   // the flashlight in the hand's frame as the fingers first closed on it
	float FlashGrabW = 0.f;
	bool bFlashUpHigh = false;                       // (held up high, the light forward: its head lay back toward the body)
	bool bFlashReversed = false;                     // (held overhand: the head past the little finger)
	float FlashTurnSecs = 0.35f;                     // (how long it takes to turn in the fingers into the ready grip)
	bool bWakeTakeSet = false;                       // (the hand's pose on the flashlight at contact, found once)
	FTransform WakeTakeHand;
	FVector WakePoleTake = FVector::ZeroVector;
	float WakeTakeSwing = 0.f;
	struct FWakeHold { bool bSet = false; float Swing = 0.f, Psi = 0.f, Flex = -15.f, Dev = 8.f; };
	FWakeHold WakeShowHold, WakeChestHold;              // (the flashlight held as a body holds it: found once, then kept)
	FVector WakePoleHold = FVector::ZeroVector;
	FTransform WakeArmHold(FWakeHold& C, const FTransform& Eye, const FVector& WantWrist, const FVector& Lamp, FVector& PoleOut, const TCHAR* Name, float BackToEyes = 0.35f);
	int32 WakeWristLogged = -1;
	int32 WakeCamLogged = -1;
	int32 WakeRollSeg = -1;
	float WakeRollAng = 0.f;
	float WakeLiftRoll = 0.f;
	bool WakeLiftRollSet = false;
	float WakeGroundZ = 141.f;                       // (car frame) the snow's height beside the car
	TSet<FName> WakeFired;
	bool WakeOnce(const TCHAR* Kind, float At, float w);
	// the seatbelt: the shoulder belt from the pillar's ring over the left shoulder and across the chest, the lap belt across
	// the hips, both to the latch in the buckle at the right hip; webbing laid in short lengths along the body
	void WakeBelt(float w, float RealDt);
	UPROPERTY()
	TArray<TObjectPtr<class UStaticMeshComponent>> BeltStraps;
	UPROPERTY()
	TObjectPtr<class AStaticMeshActor> BuckleActor;
	UPROPERTY()
	TObjectPtr<class AStaticMeshActor> LatchActor;
	TArray<FVector> BeltShoulder, BeltLap;     // (car frame) as it was when it let go
	FTransform BuckleAt = FTransform::Identity;
	// glass kicked across the lining by the fall
	struct FCrumb
	{
		FVector P, V;
		FQuat R;
		float S;
		bool bRest;
	};
	TArray<FCrumb> Crumbs;
	UPROPERTY()
	TObjectPtr<class UInstancedStaticMeshComponent> CrumbIsm;
	UPROPERTY()
	TObjectPtr<class USpotLightComponent> MoonShaft;
	float WakeShake = 0.f;

	// the rebuilt cut (EndingCrashBeats.cpp)
	void BeginCrashScene();
	void CrashBeats(float DeltaSeconds);
	void AfterTheFall(float RealDt);
	void SetFocus(float Cm);
	void LookAt(const FVector& World, float Share, float& Yaw, float& Pitch) const;
	float RealTime = 0.f;          // undilated (the capture's frame clock): the events are logged on it
	float FocusCm = 1500.f;
	UPROPERTY()
	TObjectPtr<class UCameraComponent> CamComp;
	FVector GapAt = FVector::ZeroVector, EyesAt = FVector::ZeroVector, MirrorAt = FVector::ZeroVector;
	UPROPERTY()
	TArray<TObjectPtr<AActor>> EyeActors;
	bool bLetterLooked = false, bGapPassed = false, bEyesShown = false, bEyesGone = false, bGrowled = false;
	float CreTakeClock = 0.f, BoltTime = -1.f, SlowMoT0 = -1.f, EdgeReal = -1.f, RestReal = -1.f, WakeReal = -1.f;
	bool bUpsideDown = false, bWoke = false, bSilhouette = false, bClosed = false, bTitled = false;
	float CloseReal = -1.f;
	UPROPERTY()
	TArray<TObjectPtr<class USpotLightComponent>> Headlights;
	TArray<float> HeadlightBase;
	UPROPERTY()
	TObjectPtr<class AHusk> Walker;
	FVector WalkFrom = FVector::ZeroVector, WalkDir = FVector::ForwardVector;
	float WalkReal = 0.f, WalkS = 0.f;
	FVector LetterAt = FVector::ZeroVector;
	UPROPERTY()
	TObjectPtr<AActor> Letter;
	bool bShook = false;
	float BaseFov = 78.f;
	bool bLunged = false;
	// the reveal over the bonnet and the window (EndingCrashBeats.cpp)
	void RevealBeats(float DeltaSeconds);
	float CarDip() const;
	float StopT = -1.f, RiseT0 = -1.f, LeapT0 = -1.f, GoneT = -1.f, PeerT0 = -1.f, HaltT = -1.f, DartT0 = -1.f;
	float DropT = -1.f, JumpT0 = -1.f, PeerV = 0.f;
	// the roof reveal's attack (EndingCrashBeats.cpp): when its face dropped in; its two blows on the windshield (its
	// head, then its claw: when, and where on the glass, car frame); the cracks spread from each (UpdateWindshieldHits)
	float HangInT = -1.f;
	float BlowT[2] = {-1.f, -1.f};
	FVector BlowAt[2] = {FVector::ZeroVector, FVector::ZeroVector};
	int32 AttackBeat = 0;
	// (its head and its claw, car frame: each on a spring after where it is driven, stopped by the glass when it hits
	// it; how hard each blow struck, cm/s)
	FVector AtkHeadP = FVector::ZeroVector, AtkHeadV = FVector::ZeroVector, AtkClawP = FVector::ZeroVector, AtkClawV = FVector::ZeroVector;
	bool bAtkInit = false;
	float SwingA = 0.f, SwingV = 0.f;      // (its head's swing down over the edge: the angle about its neck, on a spring)
	float BlowS[2] = {0.f, 0.f};
	void UpdateWindshieldHits();
	void ChipWindshield(const FVector& AtCar, int32 Seed);
	FVector HuntC = FVector::ZeroVector, ArcFrom = FVector::ZeroVector, DartTo = FVector::ZeroVector;
	int32 Waypoint = 0;
	UPROPERTY()
	TArray<TObjectPtr<class UPrimitiveComponent>> CarParts;     // the car's own surfaces, for the creature to collide with
	float CarClear(class AHusk* H, const FVector& Dir, FString* What = nullptr);
	TArray<FVector> WheelPts;               // the tyres' lowest points (car frame): kept on the snow, not in it
	// everything collides (the owner: "make everything have collision so clipping never happens"): the forest's trunks
	// and the roadside's posts and poles, made solid near whatever moves; the creature kept out of the car, them and the
	// ground; the car's shell measured against the ground and them; the eye kept off the car's surfaces
	struct FSolid
	{
		FTransform T;
		FVector Ext = FVector::ZeroVector;
		float R = 0.f, H = 0.f;
		bool bTrunk = false, bMade = false;
	};
	TArray<FSolid> Solids;
	UPROPERTY()
	TObjectPtr<AActor> SolidHolder;
	void GatherSolids();
	void SolidNear(const FVector& At, float Radius);
	void KeepOut(class AHusk* H, const FVector& CarDir, const TCHAR* Who);
	TArray<FVector> ShellPts;               // the car's outer shell, sampled (car frame)
	void SampleShell();
	void ShellCheck();
	/** The snow right under At: the first ground (terrain or road) from Above over it down (not a cliff top far above). */
	float GroundBelow(const FVector& At, float Above = 250.f) const;
	FTransform PrevShellT;
	bool bPrevShell = false;
	int32 ShellTick = 0;
	UPROPERTY()
	TArray<TObjectPtr<class UPrimitiveComponent>> RailParts;
	FVector ClearEye(const FVector& Want);
	bool bSideGlassGone = false, bDriverBurst = false;
	// measuring (-clipcheck): the worst each thing went into another
	struct FClip
	{
		float Worst = 0.f, At = 0.f, NextLog = 0.f;
		FString What;
	};
	TMap<FString, FClip> Clips;
	bool bClipCheck = false, bClipSummed = false;
	void NoteClip(const FString& Pair, float Depth, const FString& What);
	void ClipSummary();
	virtual void EndPlay(const EEndPlayReason::Type Reason) override;
	bool bDarted = false;
	int32 RiseBeat = 0, PeerBeat = 0;
	FVector DartFrom = FVector::ZeroVector, DartDir = FVector::ForwardVector, LeapFrom = FVector::ZeroVector;
	UPROPERTY()
	TObjectPtr<class AHusk> Darter;
	UPROPERTY()
	TObjectPtr<class UPointLightComponent> FaceLight;
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
	TMap<FName, float> EventReal;          // when each beat happened (real seconds), for the captions
	float LastHitEvent = -1.f;
	bool bRested = false;
	float RestTime = 0.f;
	float StillFor = 0.f;
	bool bSighted = false;
	bool bBraked = false;
	FTransform TripPose(float t) const;
	void StallTrip(float t, float& Y, float& Roll) const;
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
