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

	/** Play a take (a real-motion clip, "CMU:<clip>") from At (s) at Rate, anchored: its pelvis put over this actor's
	 *  place and turned to face this actor's way as it is at At (the clip's own place and heading in the capture room
	 *  taken out); its moves from there are its own. */
	void PlayClip(const TCHAR* Take, float At, float Rate, bool bLoop);

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

	/** Where its head is as it is drawn (its clip, and any bend on top of it). */
	FVector HeadAt() const { return Pose()->GetSocketLocation(TEXT("head")); }
	/** Where the middle of its face is as it is drawn (its eyes, nose, mouth: the face's own points, a few of them). */
	FVector FaceAt() const;
	/** The point of its face nearest a plane (through At, Normal pointing away from the face): where its face touches
	 *  glass it is pressed to. */
	FVector FaceNearest(const FVector& At, const FVector& Normal) const;
	/** Where one of its bones is as it is drawn. */
	FVector DrawnAt(FName Bone) const { return Pose()->GetSocketLocation(Bone); }

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

	/** How far (cm) its lowest visible points (whatever it stands or crouches on: feet, hands, knees) are above what is
	 *  under each (SurfaceAt(point) high): 0 touching, < 0 in it, large when nothing of it rests on anything. */
	float SupportGap(TFunctionRef<float(const FVector&)> SurfaceAt) const;

	/** A layer on top of its clip: its spine, neck and head bent down toward what is in front of it (0 none, 1 about 85
	 *  degrees through them all), and its head tilted over (degrees): to bring its face down to a windshield, peering. */
	float PeerDown = 0.f, PeerTilt = 0.f, PeerMaxDeg = 85.f;

	/** Its eyes on its prey, on top of its clip (as The Quarry's werewolves and Until Dawn's wendigos never look away from
	 *  who they are after): its neck and head turned so its face points at GlareAt (world), GlareW of the way (0 off), at
	 *  most 75 degrees; then Twitch (degrees: yaw about up, pitch across, roll about the gaze) on top, for the sudden
	 *  jerks of its head. */
	FVector GlareAt = FVector::ZeroVector;
	float GlareW = 0.f;
	FRotator Twitch = FRotator::ZeroRotator;

	/** Hanging its head down over an edge (the roof's front, the owner's reveal), on top of its clip: its lower spine bent
	 *  down and its upper spine, neck and head curled about its own side-to-side axis, solved each frame so that its head
	 *  is at HangHead (world) with its face turned (upside down) toward HangLook; its body slid along what it is on as
	 *  much as that takes; its hands put on HangGrip (world: left, right). HangW: how much of all of it (0: its clip as it
	 *  is); HangCurl: how far round its face has turned (0..1); HangGripW: how far its hands are on their holds. */
	float HangW = 0.f, HangCurl = 0.f, HangGripW = 0.f;
	/** The hang's bends and slide as they are drawn: following what the solve asks for on springs (never a pop), with
	 *  its breathing in them. */
	float HangSpineS = 0.f, HangSpineV = 0.f, HangCurlS = 0.f, HangCurlV = 0.f;
	FVector HangSlideS = FVector::ZeroVector, HangSlideV = FVector::ZeroVector, HangPrevSlide = FVector::ZeroVector;
	float HangPrevSpine = 0.f, HangPrevCurl = 0.f;
	/** Lunging, striking (0..1): its body held where it is on what it lies on, its spine and neck throwing its head
	 *  (nodding into the blow) rather than its whole body sliding with it. */
	float HangHoldSlide = 0.f;
	FVector HangHeldSlide = FVector::ZeroVector;
	float HangHeldSpine = 0.f;
	/** (checking: the surface point found deepest in what it was tested against, last time) */
	mutable FVector LastWorstAt = FVector::ZeroVector, LastWorstHit = FVector::ZeroVector;
	bool bHangSlideHeld = false;
	bool bHangSprung = false;
	/** How far it has lain down flat on what it is on (0..1): its legs stretched out behind it; gravity brings it down. */
	float HangLie = 0.f;
	FVector HangHead = FVector::ZeroVector, HangLook = FVector::ZeroVector;
	FVector HangGrip[2] = {FVector::ZeroVector, FVector::ZeroVector};
	/** An extra turn (world) for each hand on its hold: a claw struck onto sloping glass rather than the flat roof. */
	FQuat HangGripTurn[2] = {FQuat::Identity, FQuat::Identity};
	/** Which way (world) each elbow should point, away from what its hand is on (0: up and out to its side). */
	FVector HangElbow[2] = {FVector::ZeroVector, FVector::ZeroVector};
	/** What the solve came to this frame (for the checks): degrees in the lower spine, degrees curled above, the slide (world). */
	float HangSpineDeg = 0.f, HangCurlDeg = 0.f;
	/** How far (cm, up) it was moved after the hang was solved last frame (gravity, pushes out): the next is aimed against it. */
	float HangActorZ = 0.f, HangAfter = 0.f;
	FVector HangSlide = FVector::ZeroVector, HangAimed = FVector::ZeroVector, HangGot = FVector::ZeroVector;

	/** Gravity (the owner: it floated): how far it has dropped onto what it rests on (cm) and how fast it is falling. */
	float SettleDrop = 0.f, SettleSpeed = 0.f;

protected:
	virtual void BeginPlay() override;
	virtual void Tick(float DeltaSeconds) override;

private:
	UPROPERTY(VisibleAnywhere)
	TObjectPtr<USkeletalMeshComponent> Body;
	UPROPERTY(VisibleAnywhere)
	TObjectPtr<USceneComponent> Root;          // its place; Body under it, shifted and turned for an anchored clip
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
		bool bFur = false;         // a lock of its fur (bends against what it touches: it never holds it up)
	};
	TArray<FSurf> BodySurf, FaceSurf;
	TArray<uint8> ArmOfBone;    // per bone: 1 its left arm, 2 its right (upper arm and all below it), 0 neither
	void BuildSurface();

	// the body that is drawn: the take's pose each frame (from Body, which animates unseen), then its contacts (ContactIK)
	UPROPERTY(VisibleAnywhere)
	TObjectPtr<UPoseableMeshComponent> Shown;
	const class USkinnedMeshComponent* Pose() const;
	void CopyPose();
	void UpdateFace();
	int32 Chain[4][3];            // upper arm, forearm, hand; thigh, calf, foot (bone indices)
	int32 NeckBone = INDEX_NONE, HeadBone = INDEX_NONE;
	FVector ClipFacing = FVector::ZeroVector;      // which way it faces in its clip (component space; 0: its mesh's own way)
	void BendToPeer();
	void Glare();
	FVector HeadFwdLocal = FVector::ZeroVector;
	void Hang(const FVector& Facing, const FVector& Side);
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
