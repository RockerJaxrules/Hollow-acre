// Part 2's creature, the frozen husk: its stretched, fur-matted body (a skeletal mesh with its takes:
// tools/blender/husk_body.py) and its MetaHuman face, which follows the body's trunk, neck and head bone for bone, its
// own shape untouched. Its own gums and teeth show, yellowed and dead, with four long canines hung on its teeth bones.
// Its mouth opens as the MetaHuman face rig opens it (poses recorded off the rig: HuskFacePoses.inl), as far as JawOpen
// says (degrees, about 35 wide open; past 25 it goes on into the scream): breathing, snarling, the scream.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Husk.generated.h"

class USkeletalMeshComponent;
class UPoseableMeshComponent;
class UStaticMeshComponent;
class UAnimSequence;

UCLASS()
class HOLLOWACRE_API AHusk : public AActor
{
	GENERATED_BODY()

public:
	AHusk();

	/** Load its meshes and materials (from /Game/HollowAcre/Creature/HuskGame and the MetaHuman build). */
	bool Setup();

	/** Play one of its takes: "Gallop", "GallopLookL" or "Sighting". */
	void Play(const TCHAR* Take, bool bLoop);

	/** On a stage (L_HuskPreview): it poses itself at BeginPlay, frozen at PreviewTime (s) into PreviewTake, its jaw at
	 *  PreviewJaw degrees (if not negative), turned to face PreviewFaceYaw (degrees, world). */
	UPROPERTY(EditAnywhere, Category = "Husk")
	FName PreviewTake;
	UPROPERTY(EditAnywhere, Category = "Husk")
	float PreviewTime = 0.f;
	UPROPERTY(EditAnywhere, Category = "Husk")
	float PreviewJaw = -1.f;
	UPROPERTY(EditAnywhere, Category = "Husk")
	float PreviewFaceYaw = 0.f;

	/** How far its mouth hangs open (degrees: about 35 is wide open; past 25 it goes on into the scream). */
	float JawOpen = 6.f;

	USkeletalMeshComponent* GetBody() const { return Body; }

	/** Which way its body faces in its own mesh (yaw, degrees, of the mesh's forward about its up). */
	float MeshForwardYaw() const;

	/** How far (cm) it must be lifted so that none of its collision bodies near the floor its take stands on (its own
	 *  local z = 0: its takes are made on flat snow) sinks into the real snow, GroundAt(x, y) high, under it. */
	float GroundLift(TFunctionRef<float(const FVector&)> GroundAt) const;

protected:
	virtual void BeginPlay() override;
	virtual void Tick(float DeltaSeconds) override;

private:
	UPROPERTY(VisibleAnywhere)
	TObjectPtr<USkeletalMeshComponent> Body;
	UPROPERTY(VisibleAnywhere)
	TObjectPtr<UPoseableMeshComponent> Face;
	UPROPERTY(VisibleAnywhere)
	TObjectPtr<UStaticMeshComponent> FangsUpper;
	UPROPERTY(VisibleAnywhere)
	TObjectPtr<UStaticMeshComponent> FangsLower;
	UPROPERTY()
	TMap<FName, TObjectPtr<UAnimSequence>> Takes;

	struct FCopy
	{
		int32 FaceIndex;
		int32 BodyIndex;
		FTransform Offset;       // the body bone's reference pose to the face bone's, in the body bone's frame
	};
	TArray<FCopy> Copies;
	// the mouth: each face joint the MetaHuman face rig moves, its rest and its change from rest with the jaw open and
	// screaming (HuskFacePoses.inl, recorded off the rig by tools/husk_face_poses.py)
	struct FPoseJoint
	{
		int32 Index;
		FTransform Ref;
		FVector OpenT, ScreamT;
		FQuat OpenQ, ScreamQ;
	};
	TArray<FPoseJoint> PoseJoints;
	bool bReady = false;

	// -huskfacebake: a second face, run by the MetaHuman face rig (RigLogic) off this body playing the FaceBake take;
	// its joints at each held pose go to Saved/Generated/Husk/face_poses.json (tools/husk_face_poses.py)
	void BakeFacePoses();
	void BakeTick();
	UPROPERTY()
	TObjectPtr<USkeletalMeshComponent> BakeFace;
	FTimerHandle BakeTimer;
	int32 BakeStep = 0;
	FString BakeJson;
};
