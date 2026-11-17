// The driver's arms in first person: the player's MetaHuman body (built from the character in
// Content/HollowAcre/Driver), posed with both hands on the steering wheel at 10 and 2.
//
// The pose follows the measured 10-and-2 targets in 2d/tools/b3d/LESSONS.md: each hand is a relaxed fist round the
// rim with the back of the hand toward the eye and the knuckle row along the rim, the hand turned about 43 degrees
// toward twelve; the thumb lies along the rim's driver face pointing toward twelve; the index curls like the other
// fingers; the forearms come in from low and outside; the two hands are never mirror copies.
//
// Everything is solved in the car's frame (this actor sits at the car's origin, attached to it), so the pose holds as
// the car drives. Only the arms are seen: the legs and neck are hidden.
//
// Collision: the hands and arms collide with the car. The solver skins the MetaHuman's own vertices (the real skin, not
// the bone lines) and tests them against the modelled wheel (the rim's oval tube, the spokes, exactly) and against
// everything else in the cabin (a signed distance field baked from the car's parts by tools/blender/cabin_sdf.py: the
// dash, column, door card, seat, glass): the palm rests on the rim, each finger joint curls until that finger's skin
// meets the rim, and the elbow swings clear of the door or anything else the arm would pass through.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "DriverArms.generated.h"

class UPoseableMeshComponent;
class USkeletalMesh;

/** One hand vertex for the collision test: its position in up to four bones' reference frames, with weights. */
struct FHandSkinPoint
{
	FVector3f Local[4];
	int32 Bone[4];
	float Weight[4];
	int32 Num = 0;
	uint8 Seg = 0;        // finger segment (0 proximal .. 2 distal) of the dominant bone
};

USTRUCT()
struct FHandGrip
{
	GENERATED_BODY()

	/** Clock angle on the rim, degrees from twelve, clockwise as the driver sees it (10 o'clock = -60). */
	UPROPERTY(EditAnywhere) float Clock = -60.f;
	/** Back of the hand: degrees from "straight outward" toward the driver. */
	UPROPERTY(EditAnywhere) float BackAngle = 52.f;
	/** The hand turned toward twelve about the back-of-hand axis (degrees). */
	UPROPERTY(EditAnywhere) float Yaw = 43.f;
	/** Roll about the finger direction (degrees). */
	UPROPERTY(EditAnywhere) float Roll = 12.f;
	/** Most each finger joint may bend (MCP, PIP, DIP), degrees; the fingers stop where they touch the rim. */
	UPROPERTY(EditAnywhere) FVector Index = FVector(82.f, 96.f, 64.f);
	UPROPERTY(EditAnywhere) FVector Middle = FVector(88.f, 100.f, 68.f);
	UPROPERTY(EditAnywhere) FVector Ring = FVector(90.f, 102.f, 70.f);
	UPROPERTY(EditAnywhere) FVector Pinky = FVector(93.f, 104.f, 73.f);
	/** Elbow direction: outward, down (car frame weights). */
	UPROPERTY(EditAnywhere) FVector2D ElbowPole = FVector2D(0.7f, -1.f);
};

UCLASS()
class HOLLOWACRE_API ADriverArms : public AActor
{
	GENERATED_BODY()

public:
	ADriverArms();

	/** The driver's MetaHuman body mesh. */
	UPROPERTY(EditAnywhere, Category = "Driver")
	TObjectPtr<USkeletalMesh> Body;

	/** Where the shoulders' midpoint sits in the car (cm). */
	UPROPERTY(EditAnywhere, Category = "Driver")
	FVector ShoulderMid = FVector(4.f, 0.f, 96.f);

	/** The steering wheel (car frame, cm): centre, tilt from upright, rim centre-line radius, rim tube radius. */
	UPROPERTY(EditAnywhere, Category = "Driver")
	FVector WheelCentre = FVector(55.f, 0.f, 86.f);
	UPROPERTY(EditAnywhere, Category = "Driver")
	float WheelTilt = 25.f;
	UPROPERTY(EditAnywhere, Category = "Driver")
	float RimRadius = 19.f;
	UPROPERTY(EditAnywhere, Category = "Driver")
	float RimTube = 1.9f;
	/** The rim's tube as modelled (an oval): half-thickness across the rim (outer edge, inner edge with its finger
	 *  ridges) and half-depth front to back. */
	UPROPERTY(EditAnywhere, Category = "Driver")
	FVector RimTubeOval = FVector(1.75f, 1.97f, 2.05f);

	UPROPERTY(EditAnywhere, Category = "Driver")
	FHandGrip Left;
	UPROPERTY(EditAnywhere, Category = "Driver")
	FHandGrip Right;

	/** Steering: the wheel turns this many degrees, clockwise as the driver sees it (the hands follow along the rim);
	 *  set by the drive. */
	UPROPERTY(EditAnywhere, Category = "Driver")
	float Steer = 0.f;

	/** The steering wheel's own actor (rim, spokes, pad), its origin on the wheel's centre; turned by Steer. */
	UPROPERTY(EditAnywhere, Category = "Driver")
	TObjectPtr<AActor> WheelActor;

	/** The ignition: the right hand off the wheel to the key (0 on the rim .. 1 holding the key) and the key turned (degrees,
	 *  toward the start position); set by the director. The key sits in the lock on the right of the steering column. */
	UPROPERTY(EditAnywhere, Category = "Driver")
	float KeyReach = 0.f;
	UPROPERTY(EditAnywhere, Category = "Driver")
	float KeyTurn = 0.f;
	/** The key's bow (car frame, cm) and the axis it turns about (out of the lock toward the driver, along the column): in the
	 *  column lock just behind the rim's lower right, as on this car (seen through the wheel's lower right opening). */
	UPROPERTY(EditAnywhere, Category = "Driver")
	FVector KeyAt = FVector(70.2f, 14.f, 66.f);
	UPROPERTY(EditAnywhere, Category = "Driver")
	FVector KeyAxis = FVector(-0.94f, 0.15f, 0.3f);
	/** The instruments' glow spilling onto the key (candelas). */
	UPROPERTY(EditAnywhere, Category = "Driver")
	float KeyGlowCd = 0.12f;
	/** Leaning in to reach the key: the spine bent forward and turned toward it (degrees, at full reach). */
	UPROPERTY(EditAnywhere, Category = "Driver")
	float KeyLean = 24.f;
	UPROPERTY(EditAnywhere, Category = "Driver")
	float KeyTwist = 16.f;

	/** The driver's eye as they sit (car frame, cm), and how far it has moved with the body (leaning in to the key): the
	 *  camera follows it, so the eye stays in the head on the shoulders that carry the arms. */
	UPROPERTY(EditAnywhere, Category = "Driver")
	FVector EyeAt = FVector(0.f, 0.f, 118.f);
	FVector EyeShift = FVector::ZeroVector;
	FQuat EyeTurn = FQuat::Identity;

	// ---- Part 2's opening (the wake in the wreck): the body out of the seat (DriverArmsFree.cpp) -------------------
	/** While set, the body goes where the director puts the chest and the arms reach where it says (not the wheel). */
	bool bFree = false;
	/** Where the upper chest is (the spine_05 bone's frame, car frame). */
	FTransform FreeChest = FTransform::Identity;
	struct FFreeHand
	{
		float W = 0.f;                            // 0 hanging free under gravity .. 1 at Hand
		FTransform Hand = FTransform::Identity;  // the hand bone's frame (car frame)
		uint8 Shape = 1;                          // 0 flat (pressed on something), 1 relaxed, 2 round a handle, 3 round a buckle
		float Close = 1.f;                        // how far the fingers are into Shape (0 relaxed)
		float Open = 0.f;                         // reaching for something: the fingers opened out flat and spread (0..1), over Shape
		float Stagger = 0.f;                      // closing one after another (index first, little finger last): 0 together .. ~0.4
		FVector Pole = FVector::ZeroVector;       // the elbow's way (car frame); zero: as at the wheel, turned with the chest; shorter than 1: part way
	};
	FFreeHand Free[2];
	/** A floor the hands may not go through (the roof lining, car frame): a point on it and its normal into the cabin.
	 *  Only points inside FloorBox (car X/Y min..max) are held to it; outside (through a window) they are free. */
	bool bFloorGuard = false;
	FVector FloorAt = FVector::ZeroVector, FloorN = FVector(0.f, 0.f, -1.f);
	FBox2D FloorBox = FBox2D(FVector2D(-1e6f, -1e6f), FVector2D(1e6f, 1e6f));
	/** Each hand's deepest skin point below the floor this frame before the guard lifted it, and after (cm, 0 = clear). */
	float FloorDepthIn[2] = {0.f, 0.f}, FloorDepthOut[2] = {0.f, 0.f};
	FName FloorWorst[2];
	/** The hand bone's frame (car frame) that puts the middle of the palm's skin at PalmAt, the fingers along Finger and
	 *  the palm facing Facing (toward what it presses on). */
	FTransform HandAtPalm(int32 Side, const FVector& PalmAt, const FVector& Finger, const FVector& Facing) const;
	/** The hand bone's frame (car frame) gripping a handle (the flashlight's own frame: X along it, the switch up) as it is. */
	FTransform HandOnHandle(int32 Side, const FTransform& Handle) const;
	/** The handle (the flashlight's own frame) in the hand as the hand is now (car frame). */
	FTransform HandleInHand(int32 Side) const;
	/** The hand bone's frame now (car frame). */
	FTransform HandNow(int32 Side) const;
	/** The chest (spine_05's frame, car frame) under an eye at Eye (looking along its X), as when sitting. */
	FTransform ChestForEye(const FTransform& Eye) const { return ChestInEye * Eye; }
	/** The grip and the hands' shapes are made (the first tick). */
	bool IsReady() const { return bShapes; }
	/** The palm's skin (its middle) now, and which way it faces (car frame): for checking a hand meets what it presses on. */
	FVector PalmNow(int32 Side, FVector* Facing = nullptr) const;
	/** Seated (the wake, hanging in the belt): the legs shown, bent as they sit (thighs forward, shins down to the pedals). */
	bool bSeatedLegs = false;
	/** Heights in the body's reference pose (cm): its waist and its ankles (for the clothes, M_DriverBody). */
	float RefWaistZ = 100.f, RefAnkleZ = 12.f;
	/** A bone's place now (car frame). */
	FVector BoneCar(FName Bone) const;
	/** The top the player's Part 1 character wore, on these arms in every cutscene (DriverArms.cpp ApplyOutfit). From the
	 *  command line for now (-outfit=hoodie -shirt=4f7a3e -pattern=plain|plaid|stripes|dots), the plain green hoodie when
	 *  none is given (the test outfit). Outfits as Part 1's creator names them (2d/src/custom.js). */
	void ApplyOutfit();
	FString OutfitName;
	/** (checking) Logs every bone whose pose is broken: not finite, or scaled far from 1. */
	void DumpBadBones(const TCHAR* Why) const;
	/** Distance from a point (car frame) to the cabin's surfaces (seats, doors, dash; negative inside them). */
	float CabinDistCar(const FVector& P) const { return CabinDist(P); }
	/** Leaving the car (the player takes the arms with them): the ignition key, its lock and the dash's glow stay in the car. */
	void LeaveKeysOn(AActor* Car);
	bool bKeysLeft = false;

protected:
	virtual void BeginPlay() override;
	virtual void Tick(float DeltaSeconds) override;

private:
	UPROPERTY(VisibleAnywhere)
	TObjectPtr<UPoseableMeshComponent> Mesh;
	/** The clothes, over the skin (the owner: sleeves, bare hands, the same in every cutscene): the same body drawn again
	 *  in M_DriverClothes, following Mesh's pose; cut away over the hands. */
	UPROPERTY(VisibleAnywhere)
	TObjectPtr<class USkeletalMeshComponent> Clothes;
	UPROPERTY()
	TObjectPtr<class UMaterialInstanceDynamic> ClothesMID;

	void Place();
	void PoseArm(bool bLeft, const FHandGrip& G);
	void CurlFinger(const FString& Finger, const FString& Sx, const FVector& Deg, const FVector& AxisCS, const FVector& PalmCS);
	void BendToRim(int32 Side, FName Bone, FName TipFrom, FName TipTo, float MaxDeg);
	float RimDistCS(const FVector& PCS) const;

	// collision between the hand's skin and the wheel
	void GatherSkin();
	void ResetArm(int32 Side);
	FTransform CurCS(int32 Bone, TMap<int32, FTransform>& Cache) const;
	float CollideDist(const FVector& CarPos) const;
	/** Smallest distance from a part of the hand's skin to the wheel (negative: inside). Parts: 0 palm, 1-4 index to
	 *  pinky, 5 thumb. FromSeg skips the finger segments nearer the palm. */
	float SkinMinDist(int32 Side, int32 Part, int32 FromSeg = 0, int32 ToSeg = 2) const;
	int32 SkinInside(int32 Side, float Below, int32 FromPart = 0, int32 ToPart = 5) const;
	TArray<FHandSkinPoint> Skin[2][7];      // per side: palm, index..pinky, thumb, the arm (upper arm and forearm)

	// the cabin's signed distance field (cm, car frame; negative inside a part)
	bool LoadCabin();
	float CabinDist(const FVector& CarPos) const;
	TArray<int8> Cabin;
	FIntVector CabinDim = FIntVector::ZeroValue;
	FVector CabinLo = FVector::ZeroVector;
	float CabinCell = 1.f;
	float CabinUnit = 0.05f;
	/** Which way each thumb's pad faces, in the thumb_03 bone's frame (measured from the skin: the end bone sits on
	 *  the nail side, so the flesh lies toward the pad). */
	FVector ThumbPadLocal[2] = { FVector::ZeroVector, FVector::ZeroVector };
	TArray<int32> ArmBones[2];

	FTransform BoneCS(FName Bone) const;
	void SetBoneCS(FName Bone, const FQuat& Rot);
	FVector ToCS(const FVector& CarPos) const;
	FVector DirToCS(const FVector& CarDir) const;

	FQuat RefHandRot[2] = { FQuat::Identity, FQuat::Identity };
	float LastSteer = 1e9f;
	bool bPlaced = false;

	// steering: the grip as solved with the wheel straight, then followed rigidly round the wheel's axis
	void SnapshotGrip();
	void FollowWheel();
	bool bGripReady = false;
	TArray<FTransform> GripPose;
	FVector GripWrist[2] = { FVector::ZeroVector, FVector::ZeroVector };
	FVector GripElbow[2] = { FVector::ZeroVector, FVector::ZeroVector };
	FVector GripShoulder[2] = { FVector::ZeroVector, FVector::ZeroVector };
	FQuat GripHandRot[2] = { FQuat::Identity, FQuat::Identity };
	FQuat WheelBaseRot = FQuat::Identity;
	float SteerSign = 1.f;
	// the ignition key (its lock and bow, built from simple shapes on the car) and the right hand's way to it
	void MakeKey();
	UPROPERTY()
	TObjectPtr<USceneComponent> KeyPivot;
	FQuat KeyBase = FQuat::Identity;
	float LastKeyReach = -1.f, LastKeyTurn = -1e9f;
	FVector GripFinger[2] = { FVector::ZeroVector, FVector::ZeroVector };
	FVector GripAcross[2] = { FVector::ZeroVector, FVector::ZeroVector };
	// the bunch on the key's ring (a pendulum from the key's head, in the car's frame)
	UPROPERTY()
	TObjectPtr<USceneComponent> KeyDangle;
	FVector DangleBob = FVector::ZeroVector, DanglePrev = FVector::ZeroVector, CarPrevLoc = FVector::ZeroVector, CarPrevVel = FVector::ZeroVector;
	bool bDangle = false;
	// the key grip (the right hand): each finger and thumb bone's own rotation as it pinches the key's head, where the
	// pinch is in the hand's frame, the way across it (thumb to index) and where the fingers point
	void MakePinch();
	TMap<int32, FQuat> PinchLocal;
	FVector PinchAt = FVector::ZeroVector, PinchFace = FVector::ZeroVector, PinchFinger = FVector::ZeroVector;
	// the right arm as it holds the wheel, for solving it elsewhere: each bone's own way along it and the elbow's hinge
	// axis (in that bone's frame), how the hand sat on the forearm, the forearm's twist bones (how far along it)
	FVector UpperAlongL = FVector::ZeroVector, UpperBendL = FVector::ZeroVector, ForeAlongL = FVector::ZeroVector, ForeBendL = FVector::ZeroVector;
	FQuat HandInFore0 = FQuat::Identity;
	TArray<TPair<int32, float>> ForeTwist;
	/** The hand's way round the key's head (degrees about the line from thumb to index): the least bent wrist. */
	float KeyPhi = 0.f, KeySide = 1.f;
	// the eye in the upper chest's frame (as it sits), for EyeShift
	FVector EyeInChest = FVector::ZeroVector;
	// where the right shoulder is once fully leaned in (for deciding the key grip once, before the reach)
	FVector FullLeanShoulder = FVector::ZeroVector;
	FQuat ChestGrip = FQuat::Identity;
	bool bKeyPhi = false;
	/** The palm's way out of the hand (the hand's own frame), as it pinches the key. */
	FVector PinchPalm = FVector::ZeroVector;

	// the body free (DriverArmsFree.cpp)
	void FreeFollow();
	void MakeShapes();
	bool bShapes = false;
	// per side: each arm bone's own way along it and the elbow's bend axis (in that bone's frame), how the hand sat on the
	// forearm at the wheel, the forearm's twist bones (how far along it)
	FVector AlongU[2], BendU[2], AlongF[2], BendF[2];
	FQuat HandInFore[2];
	TArray<TPair<int32, float>> Twist[2];
	// the hand's own frame (hand bone): the palm's skin in its middle, which way the fingers point, the palm faces, across it
	FVector PalmSkinL[2], FingerL[2], FaceL[2], AcrossL[2];
	// each shape's finger and thumb rotations (bone index -> its own rotation)
	TMap<int32, FQuat> ShapeLocal[2][4];
	FTransform HoldInHand[2];                 // a gripped handle's frame (the flashlight's) in the hand bone's frame
	FTransform ChestInEye = FTransform::Identity;
	FTransform SitChestCS = FTransform::Identity, SitChestCar = FTransform::Identity;
	TFunction<float(const FVector&)> GraspDist;   // while making a grip: a point's distance to the handle (car frame)
};
