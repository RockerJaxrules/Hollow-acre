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

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "DriverArms.generated.h"

class UPoseableMeshComponent;
class USkeletalMesh;

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
	/** Finger curl, degrees per joint (MCP, PIP, DIP) for index, middle, ring, pinky. */
	UPROPERTY(EditAnywhere) FVector Index = FVector(45.f, 65.f, 25.f);
	UPROPERTY(EditAnywhere) FVector Middle = FVector(55.f, 75.f, 30.f);
	UPROPERTY(EditAnywhere) FVector Ring = FVector(58.f, 78.f, 32.f);
	UPROPERTY(EditAnywhere) FVector Pinky = FVector(60.f, 80.f, 35.f);
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

	UPROPERTY(EditAnywhere, Category = "Driver")
	FHandGrip Left;
	UPROPERTY(EditAnywhere, Category = "Driver")
	FHandGrip Right;

	/** Steering: the wheel turns this many degrees (the hands follow along the rim); set by the drive. */
	UPROPERTY(EditAnywhere, Category = "Driver")
	float Steer = 0.f;

protected:
	virtual void BeginPlay() override;
	virtual void Tick(float DeltaSeconds) override;

private:
	UPROPERTY(VisibleAnywhere)
	TObjectPtr<UPoseableMeshComponent> Mesh;

	void Place();
	void PoseArm(bool bLeft, const FHandGrip& G);
	void CurlFinger(const FString& Finger, const FString& Sx, const FVector& Deg, const FVector& AxisCS, const FVector& PalmCS);

	FTransform BoneCS(FName Bone) const;
	void SetBoneCS(FName Bone, const FQuat& Rot);
	FVector ToCS(const FVector& CarPos) const;
	FVector DirToCS(const FVector& CarDir) const;

	FQuat RefHandRot[2] = { FQuat::Identity, FQuat::Identity };
	float LastSteer = 1e9f;
	bool bPlaced = false;
};
