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

protected:
	virtual void BeginPlay() override;
	virtual void Tick(float DeltaSeconds) override;

private:
	UPROPERTY(VisibleAnywhere)
	TObjectPtr<UPoseableMeshComponent> Mesh;

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
	FQuat GripHandRot[2] = { FQuat::Identity, FQuat::Identity };
	FQuat WheelBaseRot = FQuat::Identity;
	float SteerSign = 1.f;
};
