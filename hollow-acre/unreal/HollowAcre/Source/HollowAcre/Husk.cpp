#include "Husk.h"

#include "Animation/AnimSequence.h"
#include "Components/PoseableMeshComponent.h"
#include "Components/SkeletalMeshComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Engine/SkeletalMesh.h"
#include "Engine/StaticMesh.h"
#include "Materials/MaterialInterface.h"
#include "Animation/AnimInstance.h"
#include "Misc/CommandLine.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "TimerManager.h"

namespace
{
	struct FHuskFacePoseRow
	{
		const TCHAR* Name;
		float Open[7];           // move x y z (cm, in its parent's frame), turn x y z w (in its own frame)
		float Scream[7];
	};
#include "HuskFacePoses.inl"
}

namespace
{
	const TCHAR* GameDir = TEXT("/Game/HollowAcre/Creature/HuskGame/");

	FTransform RefCS(const FReferenceSkeleton& R, int32 i)
	{
		FTransform T = FTransform::Identity;
		for (; i != INDEX_NONE; i = R.GetParentIndex(i))
		{
			T = T * R.GetRefBonePose()[i];
		}
		return T;
	}

	UMaterialInterface* Mat(const TCHAR* Name)
	{
		return LoadObject<UMaterialInterface>(nullptr, *FString::Printf(TEXT("%s%s.%s"), GameDir, Name, Name));
	}
}

AHusk::AHusk()
{
	PrimaryActorTick.bCanEverTick = true;
	PrimaryActorTick.TickGroup = TG_PostUpdateWork;     // after the body's animation: the face copies the result
	Body = CreateDefaultSubobject<USkeletalMeshComponent>(TEXT("Body"));
	RootComponent = Body;
	Face = CreateDefaultSubobject<UPoseableMeshComponent>(TEXT("Face"));
	Face->SetupAttachment(Body);
	FangsUpper = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("FangsUpper"));
	FangsLower = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("FangsLower"));
	for (UPrimitiveComponent* C : {static_cast<UPrimitiveComponent*>(Body), static_cast<UPrimitiveComponent*>(Face),
		static_cast<UPrimitiveComponent*>(FangsUpper), static_cast<UPrimitiveComponent*>(FangsLower)})
	{
		C->SetCollisionEnabled(ECollisionEnabled::NoCollision);
		C->SetMobility(EComponentMobility::Movable);
	}
}

bool AHusk::Setup()
{
	USkeletalMesh* BodyMesh = LoadObject<USkeletalMesh>(nullptr, TEXT("/Game/HollowAcre/Creature/HuskGame/Husk.Husk"));
	USkeletalMesh* FaceMesh = LoadObject<USkeletalMesh>(nullptr, TEXT("/Game/HollowAcre/Creature/Husk/Built/Husk/Face/SKM_MHC_Husk_FaceMesh.SKM_MHC_Husk_FaceMesh"));
	if (!BodyMesh || !FaceMesh)
	{
		UE_LOG(LogTemp, Warning, TEXT("Husk: meshes missing (body %d, face %d)"), BodyMesh != nullptr, FaceMesh != nullptr);
		return false;
	}
	for (const TCHAR* T : {TEXT("Gallop"), TEXT("GallopLookL"), TEXT("Sighting"), TEXT("Stalk")})
	{
		const FString P = FString::Printf(TEXT("%sHusk_Anim_root_%s.Husk_Anim_root_%s"), GameDir, T, T);
		if (UAnimSequence* A = LoadObject<UAnimSequence>(nullptr, *P))
		{
			Takes.Add(FName(T), A);
		}
	}
	Body->SetSkeletalMesh(BodyMesh);
	Body->SetBoundsScale(2.f);
	Body->VisibilityBasedAnimTickOption = EVisibilityBasedAnimTickOption::AlwaysTickPoseAndRefreshBones;
	Body->bEnableUpdateRateOptimizations = false;
	Body->SetAnimationMode(EAnimationMode::AnimationSingleNode);
	Body->SetCastShadow(true);
	// its collision bodies (the physics asset the import makes): for measuring only, nothing collides with them
	Body->SetCollisionResponseToAllChannels(ECR_Ignore);
	Body->SetCollisionEnabled(ECollisionEnabled::QueryOnly);
	// its materials by slot (the import's own assignment does not always stick)
	Body->SetMaterialByName(TEXT("MI_Body_Baked_VT"), Mat(TEXT("M_HuskSkin")));
	Body->SetMaterialByName(TEXT("Claw"), Mat(TEXT("M_HuskClaw")));
	Body->SetMaterialByName(TEXT("Hair"), Mat(TEXT("M_HuskHair")));

	Face->SetSkinnedAssetAndUpdate(FaceMesh, true);
	Face->SetBoundsScale(2.f);
	Face->SetCastShadow(true);
	UMaterialInterface* Teeth = Mat(TEXT("MI_HuskTeeth"));
	const TArray<FName> Slots = Face->GetMaterialSlotNames();
	for (int32 i = 0; i < Slots.Num(); ++i)
	{
		const FString S = Slots[i].ToString();
		UMaterialInterface* M = nullptr;
		if (S.StartsWith(TEXT("head")))
		{
			M = Mat(TEXT("M_HuskFaceSkin"));
		}
		else if (S.StartsWith(TEXT("teeth")))
		{
			M = Teeth;                                   // its own gums and teeth, yellowed
		}
		else if (S.StartsWith(TEXT("eyelashes")))
		{
			M = Mat(TEXT("M_HuskHide"));
		}
		else if (S.StartsWith(TEXT("eyeLeft")) || S.StartsWith(TEXT("eyeRight")))
		{
			M = Mat(TEXT("M_HuskEye"));
		}
		if (M)
		{
			Face->SetMaterial(i, M);
		}
	}

	// the face follows the body: every bone both have (the trunk, the neck, the head), from the body's pose, the
	// difference of their reference poses carried along
	const FReferenceSkeleton& FR = FaceMesh->GetRefSkeleton();
	const FReferenceSkeleton& BR = BodyMesh->GetRefSkeleton();
	Copies.Reset();
	for (int32 i = 0; i < FR.GetNum(); ++i)
	{
		const FName N = FR.GetBoneName(i);
		const int32 b = BR.FindBoneIndex(N);
		if (b != INDEX_NONE && !N.ToString().StartsWith(TEXT("FACIAL_")))
		{
			Copies.Add({i, b, RefCS(FR, i) * RefCS(BR, b).Inverse()});
		}
	}
	// the mouth's joints, as the face rig moves them
	PoseJoints.Reset();
	for (const FHuskFacePoseRow& Row : GHuskFacePoses)
	{
		const int32 i = FR.FindBoneIndex(Row.Name);
		if (i == INDEX_NONE)
		{
			continue;
		}
		PoseJoints.Add({i, FR.GetRefBonePose()[i], FVector(Row.Open[0], Row.Open[1], Row.Open[2]),
			FVector(Row.Scream[0], Row.Scream[1], Row.Scream[2]), FQuat(Row.Open[3], Row.Open[4], Row.Open[5], Row.Open[6]),
			FQuat(Row.Scream[3], Row.Scream[4], Row.Scream[5], Row.Scream[6])});
	}
	UE_LOG(LogTemp, Display, TEXT("Husk: %d face bones follow the body, %d move with its mouth, teeth %s"), Copies.Num(),
		PoseJoints.Num(), Teeth ? TEXT("loaded") : TEXT("MISSING"));

	// the canines, made in the face's own reference space: hung on its teeth bones
	for (TPair<UStaticMeshComponent*, const TCHAR*> F : {TPair<UStaticMeshComponent*, const TCHAR*>(FangsUpper, TEXT("Upper")),
		TPair<UStaticMeshComponent*, const TCHAR*>(FangsLower, TEXT("Lower"))})
	{
		const FString MeshPath = FString::Printf(TEXT("%sSM_Fangs%s.SM_Fangs%s"), GameDir, F.Value, F.Value);
		const FName Bone(*FString::Printf(TEXT("FACIAL_C_Teeth%s"), F.Value));
		const int32 bi = FR.FindBoneIndex(Bone);
		if (UStaticMesh* SM = LoadObject<UStaticMesh>(nullptr, *MeshPath))
		{
			F.Key->SetStaticMesh(SM);
			F.Key->SetMaterial(0, Mat(TEXT("M_HuskFang")));
			F.Key->AttachToComponent(Face, FAttachmentTransformRules::KeepRelativeTransform, Bone);
			F.Key->SetRelativeTransform(bi != INDEX_NONE ? RefCS(FR, bi).Inverse() : FTransform::Identity);
		}
	}
	bReady = true;
	return true;
}

void AHusk::BeginPlay()
{
	Super::BeginPlay();
	if (!PreviewTake.IsNone() && Setup())
	{
		Play(*PreviewTake.ToString(), false);
		Body->SetPosition(PreviewTime, false);
		Body->SetPlayRate(0.f);
		if (PreviewJaw >= 0.f)
		{
			JawOpen = PreviewJaw;
		}
		SetActorRotation(FRotator(0.f, PreviewFaceYaw - MeshForwardYaw(), 0.f));
		static bool bBaked = false;
		if (!bBaked && FParse::Param(FCommandLine::Get(), TEXT("huskfacebake")))
		{
			bBaked = true;
			BakeFacePoses();
		}
	}
}

void AHusk::BakeFacePoses()
{
	UAnimSequence* Seq = LoadObject<UAnimSequence>(nullptr, *FString::Printf(TEXT("%sHusk_Anim_root_FaceBake.Husk_Anim_root_FaceBake"), GameDir));
	UClass* FaceAnim = LoadClass<UAnimInstance>(nullptr, TEXT("/MetaHumanCharacter/Face/ABP_Face.ABP_Face_C"));
	USkeletalMesh* FaceMesh = Cast<USkeletalMesh>(Face->GetSkinnedAsset());
	if (!Seq || !FaceAnim || !FaceMesh)
	{
		UE_LOG(LogTemp, Warning, TEXT("HuskBake: missing (take %d, face blueprint %d, face %d)"), Seq != nullptr, FaceAnim != nullptr, FaceMesh != nullptr);
		return;
	}
	BakeFace = NewObject<USkeletalMeshComponent>(this, TEXT("BakeFace"));
	BakeFace->SetupAttachment(Body);
	BakeFace->RegisterComponent();
	BakeFace->SetSkeletalMesh(FaceMesh);
	BakeFace->SetForcedLOD(1);                           // every joint, at the face's full detail
	BakeFace->VisibilityBasedAnimTickOption = EVisibilityBasedAnimTickOption::AlwaysTickPoseAndRefreshBones;
	BakeFace->bEnableUpdateRateOptimizations = false;
	BakeFace->SetAnimationMode(EAnimationMode::AnimationBlueprint);
	BakeFace->SetAnimInstanceClass(FaceAnim);
	BakeFace->AddTickPrerequisiteComponent(Body);
	Body->SetForcedLOD(1);
	Body->PlayAnimation(Seq, false);
	Body->SetPlayRate(0.f);
	BakeStep = 0;
	BakeJson = TEXT("{");
	GetWorldTimerManager().SetTimer(BakeTimer, this, &AHusk::BakeTick, 0.5f, true, 0.5f);
}

void AHusk::BakeTick()
{
	static const TCHAR* Names[] = {TEXT("rest"), TEXT("open"), TEXT("scream")};
	const int32 Pose = BakeStep / 2;
	if (Pose >= 3)
	{
		GetWorldTimerManager().ClearTimer(BakeTimer);
		BakeJson += TEXT("}");
		const FString Out = FPaths::ConvertRelativePathToFull(FPaths::ProjectSavedDir() / TEXT("Generated/Husk/face_poses.json"));
		FFileHelper::SaveStringToFile(BakeJson, *Out);
		UE_LOG(LogTemp, Display, TEXT("HuskBake: wrote %s"), *Out);
		return;
	}
	if (BakeStep % 2 == 0)
	{
		Body->SetPosition(Pose + 0.5f, false);        // into the middle of the pose's held second
	}
	else
	{
		const FReferenceSkeleton& R = BakeFace->GetSkinnedAsset()->GetRefSkeleton();
		const TArray<FTransform> Locals = BakeFace->GetBoneSpaceTransforms();
		int32 Odd = 0;
		BakeJson += FString::Printf(TEXT("%s\"%s\": {"), Pose ? TEXT(",") : TEXT(""), Names[Pose]);
		int32 n = 0;
		for (int32 i = 0; i < R.GetNum() && i < Locals.Num(); ++i)
		{
			const FString B = R.GetBoneName(i).ToString();
			const int32 P = R.GetParentIndex(i);
			if (!B.StartsWith(TEXT("FACIAL_")) || P == INDEX_NONE)
			{
				continue;
			}
			const FTransform& L = Locals[i];
			Odd += L.GetLocation().Size() > 30.f ? 1 : 0;
			const FVector T = L.GetLocation();
			const FQuat Q = L.GetRotation();
			BakeJson += FString::Printf(TEXT("%s\"%s\": [%.5f, %.5f, %.5f, %.7f, %.7f, %.7f, %.7f]"), n ? TEXT(",") : TEXT(""), *B,
				T.X, T.Y, T.Z, Q.X, Q.Y, Q.Z, Q.W);
			++n;
		}
		BakeJson += TEXT("}");
		UE_LOG(LogTemp, Display, TEXT("HuskBake: %s, %d joints, %d far from their parents (jaw open curve %.2f)"), Names[Pose], n, Odd,
			BakeFace->GetAnimInstance() ? BakeFace->GetAnimInstance()->GetCurveValue(TEXT("CTRL_expressions_jawOpen")) : -1.f);
	}
	++BakeStep;
}

float AHusk::GroundLift(TFunctionRef<float(const FVector&)> GroundAt) const
{
	// the floor its take stands on: its own local z = 0, however it is turned and pitched
	const FTransform A = GetActorTransform();
	const FVector O = A.GetLocation();
	const FVector N = A.GetRotation().GetUpVector();
	auto FloorZ = [&](const FVector& At) { return N.Z > 0.1f ? O.Z - (N.X * (At.X - O.X) + N.Y * (At.Y - O.Y)) / N.Z : O.Z; };
	const float Near = 15.f * A.GetScale3D().Z;              // a body this close to the floor is on it, or nearly
	float Lift = 0.f;
	for (const FBodyInstance* BI : Body->Bodies)
	{
		if (!BI || !BI->IsValidBodyInstance())
		{
			continue;
		}
		const FBox B = BI->GetBodyBounds();
		const FVector C = B.GetCenter();
		const float Floor = FloorZ(C);
		const float Above = B.Min.Z - Floor;                   // its lowest point over the floor
		if (Above > Near)
		{
			continue;
		}
		const float Snow = GroundAt(FVector(C.X, C.Y, Floor)) - Floor;   // the real snow there, over the floor
		Lift = FMath::Max(Lift, Snow - FMath::Max(Above, 0.f));
	}
	return Lift;
}

void AHusk::Play(const TCHAR* Take, bool bLoop)
{
	if (const TObjectPtr<UAnimSequence>* A = Takes.Find(FName(Take)))
	{
		Body->PlayAnimation(*A, bLoop);
	}
}

float AHusk::MeshForwardYaw() const
{
	const USkeletalMesh* M = Body->GetSkeletalMeshAsset();
	if (!M)
	{
		return 0.f;
	}
	const FReferenceSkeleton& R = M->GetRefSkeleton();
	const int32 F = R.FindBoneIndex(TEXT("foot_l")), B = R.FindBoneIndex(TEXT("ball_l"));
	if (F == INDEX_NONE || B == INDEX_NONE)
	{
		return 0.f;
	}
	const FVector D = RefCS(R, B).GetLocation() - RefCS(R, F).GetLocation();
	return FMath::RadiansToDegrees(FMath::Atan2(D.Y, D.X));
}

void AHusk::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	if (!bReady || !Face->GetSkinnedAsset())
	{
		return;
	}
	// the trunk, neck and head from the body (parents come first in the face's bone order)
	const FReferenceSkeleton& FR = Face->GetSkinnedAsset()->GetRefSkeleton();
	TMap<int32, FTransform> CS;
	CS.Reserve(Copies.Num());
	for (const FCopy& C : Copies)
	{
		const FTransform T = C.Offset * Body->GetBoneTransform(C.BodyIndex, FTransform::Identity);
		CS.Add(C.FaceIndex, T);
		const int32 P = FR.GetParentIndex(C.FaceIndex);
		const FTransform* PT = P != INDEX_NONE ? CS.Find(P) : nullptr;
		if (C.FaceIndex < Face->BoneSpaceTransforms.Num())
		{
			Face->BoneSpaceTransforms[C.FaceIndex] = PT ? T.GetRelativeTransform(*PT) : T;
		}
	}
	// the mouth: open as far as JawOpen says, and on into the scream past 25 degrees
	const float Open = FMath::Clamp(JawOpen / 35.f, 0.f, 1.f), Scream = FMath::Clamp((JawOpen - 25.f) / 15.f, 0.f, 1.f);
	for (const FPoseJoint& J : PoseJoints)
	{
		if (J.Index < Face->BoneSpaceTransforms.Num())
		{
			const FVector DT = FMath::Lerp(J.OpenT, J.ScreamT, Scream);
			const FQuat DQ = FQuat::Slerp(J.OpenQ, J.ScreamQ, Scream);
			Face->BoneSpaceTransforms[J.Index] = FTransform(J.Ref.GetRotation() * FQuat::Slerp(FQuat::Identity, DQ, Open),
				J.Ref.GetLocation() + DT * Open, J.Ref.GetScale3D());
		}
	}
	Face->MarkRefreshTransformDirty();
}
