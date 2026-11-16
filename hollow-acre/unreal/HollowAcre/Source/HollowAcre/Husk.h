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

	/** Its pose from the take where it is now, at once (after a new take or a jump in it). */
	void PoseNow();

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

	/** Contact IK (the owner: nothing through the car, nothing floating): on the body that is drawn, its hands and feet
	 *  are put on what they touch, by two-bone IK (their claws and toes out of Parts along Dir, and out of the snow,
	 *  GroundAt high), and its face is kept off it by bending its neck back. Returns the largest move (cm); What says
	 *  which. Run each frame once it is animated (KeepOutLate), before it is pushed out of anything as a whole. */
	float ContactIK(const TArray<class UPrimitiveComponent*>& Parts, const FVector& Dir, const class UMaterialInterface* Skip,
		TFunctionRef<float(const FVector&)> GroundAt, FString* What = nullptr);

	/** Which way its body faces in its own mesh (yaw, degrees, of the mesh's forward about its up). */
	float MeshForwardYaw() const;

	/** How far (cm) it must be lifted so that none of its collision bodies near the floor its take stands on (its own
	 *  local z = 0: its takes are made on flat snow) sinks into the real snow, GroundAt(x, y) high, under it. */
	float GroundLift(TFunctionRef<float(const FVector&)> GroundAt) const;

	/** One of its collision bodies as it is now, in the world: a capsule from A to B, R round (A == B: a ball). */
	struct FShape
	{
		FVector A, B;
		float R;
		FName Bone;
	};
	/** Its collision bodies as they are now (its physics asset's capsules, balls and boxes, on its posed bones). */
	void Shapes(TArray<FShape>& Out) const;

	/** How far (cm) it must move along Dir so that none of its collision bodies is inside any of Parts (traced against
	 *  their own collision, complex: their real surfaces; the faces of Skip's material left out: glass that is gone),
	 *  0 if it is clear. */
	float PushClear(const TArray<class UPrimitiveComponent*>& Parts, const FVector& Dir, float Reach = 300.f,
		const class UMaterialInterface* Skip = nullptr, FName* WorstBone = nullptr) const;

	/** Out of the world's solid things (anything with collision but the actors in Ignore and what Skip says: the forest's
	 *  trunks, posts, poles, the rail): moved the shortest way out, round them (up only when it stands on one), if bApply.
	 *  Returns how deep it was in (cm); What names the deepest thing. */
	float PushOutOfWorld(const TArray<const AActor*>& Ignore, TFunctionRef<bool(const class UPrimitiveComponent*)> Skip, bool bApply,
		FString* What = nullptr);

	/** How far (cm) its lowest body is under the ground (GroundAt(x, y) high), 0 if none is. */
	float GroundIn(TFunctionRef<float(const FVector&)> GroundAt) const;

	/** Run each frame once its body is animated (its pose exactly what is drawn): whoever moves it keeps it out of
	 *  everything here. */
	TFunction<void(AHusk*)> KeepOutLate;

	/** As PushClear, but for its visible surface (points every 2.5 cm on its skin, claws, fur and face, as posed now: they
	 *  reach past its collision bodies), kept Skin (cm) off the parts' surfaces. Worst names the deepest point's bone. */
	float PushClearSurface(const TArray<class UPrimitiveComponent*>& Parts, const FVector& Dir, float Reach = 300.f,
		const class UMaterialInterface* Skip = nullptr, FString* Worst = nullptr, float Skin = 1.5f) const;

	/** How far (cm) its lowest visible points are under the ground (GroundAt(x, y) high), 0 if none is. */
	float GroundInSurface(TFunctionRef<float(const FVector&)> GroundAt) const;

	/** Whether its visible surface is known (the editor build reads it from the meshes). */
	bool HasSurface() const { return BodySurf.Num() > 0; }

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
	// its visible surface, a point every 2.5 cm, each on the bone that carries it (in that bone's space)
	struct FSurf
	{
		int32 Bone;
		FVector Local;
		int32 Limb = -1;           // 0..3: its left hand, right hand, left foot, right foot (with their claws and toes); 4: its head
	};
	TArray<FSurf> BodySurf, FaceSurf;
	void BuildSurface();

	// the body that is drawn: the take's pose each frame (from Body, which animates unseen), then its contacts (ContactIK)
	UPROPERTY(VisibleAnywhere)
	TObjectPtr<UPoseableMeshComponent> Shown;
	const class USkinnedMeshComponent* Pose() const;
	void CopyPose();
	void UpdateFace();
	int32 Chain[4][3];            // upper arm, forearm, hand; thigh, calf, foot (bone indices)
	int32 NeckBone = INDEX_NONE, HeadBone = INDEX_NONE;
	float SurfaceIn(const TArray<class UPrimitiveComponent*>& Parts, const FVector& Dir, const class UMaterialInterface* Skip, int32 Limb,
		float Skin, FString* Worst) const;
	float LimbUnder(TFunctionRef<float(const FVector&)> GroundAt, int32 Limb) const;
	void SetCS(int32 Bone, const FTransform& World);
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
