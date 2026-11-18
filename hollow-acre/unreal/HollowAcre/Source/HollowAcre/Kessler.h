// Kessler, the foreman who wrote to the player (Part 2, Act I's end: the lantern in the trees, the rifle, "Get inside").
// His body is his MetaHuman (Content/HollowAcre/Kessler/Built, Scripts/build_kessler_metahuman.py), spawned whole (its
// face, grooms and clothes follow its body as the MetaHuman blueprint sets them); his body plays real motion (CMU clips
// retargeted onto him, Scripts/import_mocap.py with HA_MOCAP_TARGET_NAME=Kessler), and he carries:
// - his hurricane lantern (tools/blender/make_kessler_props.py) hanging from his left hand by its bail, always plumb as a
//   hanging lantern is, swinging with his steps; its flame (M_Flame) and its light, a kerosene flame's: warm, flickering,
//   throwing the shadows of its own wire guard;
// - his carbine in his right hand, carried down along his leg.
// The story (Part2Story) moves him; this keeps what he carries with him.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Kessler.generated.h"

UCLASS()
class HOLLOWACRE_API AKessler : public AActor
{
	GENERATED_BODY()

public:
	AKessler();
	virtual void BeginPlay() override;
	virtual void Tick(float DeltaSeconds) override;

	/** The take his body plays, looping: a clip in /Game/HollowAcre/Kessler/Mocap, or "MH:<name>" for MetaHuman's own
	 * locomotion (AS_MH_Neutral_<name>: Stand_Idle_Loop, Walk_Loop_F, Run_Loop_F...). */
	UPROPERTY(EditAnywhere, Category = "Kessler")
	FString Clip = TEXT("MH:Stand_Idle_Loop");

	/** How fast his walk plays (1: MetaHuman's brisk walk, about 1.7 m/s; his steps carry him at whatever it is). */
	UPROPERTY(EditAnywhere, Category = "Kessler")
	float WalkRate = 0.8f;

	/** His lantern lit and carried in his left hand. */
	UPROPERTY(EditAnywhere, Category = "Kessler")
	bool bLantern = true;

	/** His carbine in his right hand. */
	UPROPERTY(EditAnywhere, Category = "Kessler")
	bool bRifle = true;

	/** Play another take (looping or once). */
	void PlayClip(const FString& Name, bool bLoop);

	/** Walk to a point on the ground: his take's own steps carry him (no sliding), turning toward it as he goes; he
	 * stops there, eased into standing. */
	void WalkTo(const FVector& At, bool bRun = false);
	/** Stop where he is, eased into standing (his take paused once he stands). */
	void Halt();
	bool IsWalking() const { return bWalking; }
	/** Standing, turn (feet and all) to face this point. */
	void FaceTo(const FVector& At) { FaceAt = At; }
	/** Where his eyes go: his head turns to it (zero: ahead, as the take carries it). */
	FVector LookAtPoint = FVector::ZeroVector;
	/** His lantern raised (0 at his side .. 1 held up before him, toward LanternToward, or ahead if that is zero). */
	float LanternUp = 0.f;
	FVector LanternToward = FVector::ZeroVector;
	/** The rifle brought up and shouldered, aimed at this point (his body bladed to it, his cheek on the stock). */
	void AimAt(const FVector& At);
	/** The rifle brought down, carried again. */
	void LowerRifle();
	bool IsAimed() const { return AimW > 0.95f; }
	/** A shot: the flash at the muzzle, the kick. Out: where the muzzle was and where it pointed. */
	void Fire(FVector& OutMuzzle, FVector& OutDir);
	/** Between his eyes (for the player's camera and for him to be looked at). */
	FVector EyesAt() const;

	USkeletalMeshComponent* GetBody() const { return Body.Get(); }
	AActor* GetMan() const { return Man; }
	/** Where his lantern's flame is (for what it lights, and for the player's eyes to find in the trees). */
	FVector LanternAt() const;

protected:
	UPROPERTY()
	TObjectPtr<AActor> Man;
	TWeakObjectPtr<USkeletalMeshComponent> Body;
	UPROPERTY()
	TObjectPtr<UStaticMeshComponent> Lantern;
	UPROPERTY()
	TObjectPtr<UStaticMeshComponent> Flame;
	UPROPERTY()
	TObjectPtr<class UMaterialInstanceDynamic> FlameMID;
	UPROPERTY()
	TObjectPtr<class UPointLightComponent> LanternLight;
	UPROPERTY()
	TObjectPtr<UStaticMeshComponent> Rifle;

	float T = 0.f;
	/** The body drawn: a copy of the take's pose each frame (the take's own body ticks on hidden), so his arms and head
	 * can be set over it. */
	UPROPERTY()
	TObjectPtr<class UPoseableMeshComponent> Shown;
	TWeakObjectPtr<USkeletalMeshComponent> Face;
	TArray<FTransform> RefLocal;
	bool bWalking = false;
	FVector Goal = FVector::ZeroVector, FaceAt = FVector::ZeroVector;
	float StandW = 1.f;          // (0: as the take walks .. 1: standing)
	FVector PelvisRef = FVector::ZeroVector, PelvisWas = FVector::ZeroVector, StepWas = FVector::ZeroVector;
	FVector FootWas[2] = {FVector::ZeroVector, FVector::ZeroVector};
	int32 PlantWas = -1;
	FString Playing;
	/** A crossfade from the pose drawn when the take changed, over XFadeLen seconds. */
	TArray<FTransform> XFadeFrom;
	float XFadeT = 10.f, XFadeLen = 0.35f;
	bool bPelvisInit = false;
	float Lat = 0.f;
	float AimW = 0.f, AimWant = 0.f, LanternW = 0.f, HeadW = 0.f;
	FVector AimPoint = FVector::ZeroVector;
	FVector FaceFwdLocal = FVector(0.f, 1.f, 0.f);
	/** His right eye in his head bone's frame (from his face's own joints): what he sights with. */
	FVector EyeRLocal = FVector::ZeroVector;
	float KickT = 10.f;
	UPROPERTY()
	TObjectPtr<class UPointLightComponent> MuzzleLight;
	UPROPERTY()
	TObjectPtr<class UPointLightComponent> Rim;
	UPROPERTY()
	TObjectPtr<UStaticMeshComponent> MuzzleFlash;
	UPROPERTY()
	TObjectPtr<class UMaterialInstanceDynamic> MuzzleMID;
	void Locomote(float Dt);
	void CopyPose();
	void PoseUpper(float Dt);
	void TurnHead(float W);
	/** The fingers curled shut round what the hand holds (W 0..1). */
	void Grip(bool bLeft, float W);
	void Breathe(float Dt);
	struct FPuff
	{
		TWeakObjectPtr<UStaticMeshComponent> C;
		TWeakObjectPtr<class UMaterialInstanceDynamic> M;
		FVector V;
		float Age, Life, R0, R1, Peak;
	};
	TArray<FPuff> Puffs;
	float BreathT = 1.f;
	void ArmTo(bool bLeft, const FVector& HandAt, const FVector& Pole, float W);
	void SetCS(int32 Bone, const FTransform& World);
	FTransform AimRifle() const;
	FTransform CarryRifle() const;
	float GroundZ(const FVector& At) const;
	FVector Steer(const FVector& From, const FVector& Dir) const;
	bool bTest = false;
	void RunTest();
	FVector HandWas = FVector::ZeroVector;
	FVector2D Swing = FVector2D::ZeroVector, SwingV = FVector2D::ZeroVector;
	void Tint(UStaticMeshComponent* C, const TCHAR* Slot, const FLinearColor& Color, float Metal, float Rough);
	void DressUp();
	void CapOn();
	UPROPERTY()
	TObjectPtr<UStaticMeshComponent> Cap;
	UPROPERTY()
	TObjectPtr<USkeletalMeshComponent> Clothes;
	UPROPERTY()
	TObjectPtr<USkeletalMeshComponent> ClothesUpper;
	UPROPERTY()
	TObjectPtr<USkeletalMeshComponent> Coat;
};
