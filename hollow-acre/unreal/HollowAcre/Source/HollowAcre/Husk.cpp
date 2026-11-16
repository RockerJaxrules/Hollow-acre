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
#include "Engine/OverlapResult.h"
#include "Engine/World.h"
#include "PhysicsEngine/PhysicsAsset.h"
#include "PhysicsEngine/SkeletalBodySetup.h"
#include "TwoBoneIK.h"
#if WITH_EDITORONLY_DATA
#include "Rendering/SkeletalMeshLODModel.h"
#include "Rendering/SkeletalMeshModel.h"
#endif
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
	Shown = CreateDefaultSubobject<UPoseableMeshComponent>(TEXT("Shown"));
	Shown->SetupAttachment(Body);
	FangsUpper = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("FangsUpper"));
	FangsLower = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("FangsLower"));
	for (int32 l = 0; l < 4; ++l)
	{
		Chain[l][0] = Chain[l][1] = Chain[l][2] = INDEX_NONE;
	}
	for (UPrimitiveComponent* C : {static_cast<UPrimitiveComponent*>(Body), static_cast<UPrimitiveComponent*>(Face),
		static_cast<UPrimitiveComponent*>(Shown), static_cast<UPrimitiveComponent*>(FangsUpper), static_cast<UPrimitiveComponent*>(FangsLower)})
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
	for (const TCHAR* T : {TEXT("Gallop"), TEXT("GallopLookL"), TEXT("Sighting"), TEXT("Stalk"), TEXT("Rise"), TEXT("Peer"), TEXT("Perch")})
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
	// what is drawn is Shown: the same body, its take's pose copied each frame, its hands, feet and face then put on what
	// they touch (ContactIK); Body animates unseen
	Shown->SetSkinnedAssetAndUpdate(BodyMesh, true);
	Shown->SetBoundsScale(2.f);
	Shown->SetCastShadow(true);
	for (int32 i = 0; i < Body->GetNumMaterials(); ++i)
	{
		Shown->SetMaterial(i, Body->GetMaterial(i));
	}
	Body->SetVisibility(false);
	{
		const FReferenceSkeleton& BR = BodyMesh->GetRefSkeleton();
		const TCHAR* Names[4][3] = {{TEXT("upperarm_l"), TEXT("lowerarm_l"), TEXT("hand_l")}, {TEXT("upperarm_r"), TEXT("lowerarm_r"), TEXT("hand_r")},
			{TEXT("thigh_l"), TEXT("calf_l"), TEXT("foot_l")}, {TEXT("thigh_r"), TEXT("calf_r"), TEXT("foot_r")}};
		for (int32 l = 0; l < 4; ++l)
		{
			for (int32 k = 0; k < 3; ++k)
			{
				Chain[l][k] = BR.FindBoneIndex(Names[l][k]);
			}
		}
		NeckBone = BR.FindBoneIndex(TEXT("neck_01"));
		HeadBone = BR.FindBoneIndex(TEXT("head"));
	}

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
	BuildSurface();
	bReady = true;
	return true;
}

void AHusk::BeginPlay()
{
	Super::BeginPlay();
	// (checking motion on the stage: -husktake=<take, or CMU:<clip>> for every husk there, -huskplay to play it)
	FString Over;
	if (!PreviewTake.IsNone() && FParse::Value(FCommandLine::Get(), TEXT("-husktake="), Over))
	{
		PreviewTake = FName(*Over);
	}
	const bool bPlay = FParse::Param(FCommandLine::Get(), TEXT("huskplay"));
	if (!PreviewTake.IsNone() && Setup())
	{
		Play(*PreviewTake.ToString(), bPlay);
		Body->SetPosition(bPlay ? 0.f : PreviewTime, false);
		Body->SetPlayRate(bPlay ? 1.f : 0.f);
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

void AHusk::Shapes(TArray<FShape>& Out) const
{
	Out.Reset();
	const UPhysicsAsset* PA = Body ? Body->GetPhysicsAsset() : nullptr;
	if (!PA)
	{
		return;
	}
	for (const USkeletalBodySetup* BS : PA->SkeletalBodySetups)
	{
		if (!BS)
		{
			continue;
		}
		const int32 Bone = Body->GetBoneIndex(BS->BoneName);
		if (Bone == INDEX_NONE)
		{
			continue;
		}
		const FTransform BT = Pose()->GetBoneTransform(Bone);    // in the world, as drawn now (its scale included)
		const float S = BT.GetScale3D().GetAbsMax();
		for (const FKSphylElem& E : BS->AggGeom.SphylElems)
		{
			const FTransform T = E.GetTransform() * BT;
			const FVector Ax = T.GetRotation().GetAxisZ();
			const float Half = 0.5f * E.Length * S;
			Out.Add({T.GetLocation() - Ax * Half, T.GetLocation() + Ax * Half, E.Radius * S, BS->BoneName});
		}
		for (const FKSphereElem& E : BS->AggGeom.SphereElems)
		{
			const FVector C = BT.TransformPosition(E.Center);
			Out.Add({C, C, E.Radius * S, BS->BoneName});
		}
		for (const FKBoxElem& E : BS->AggGeom.BoxElems)
		{
			// a box as a capsule along its longest side, as thick as its thickest other side
			const FTransform T = E.GetTransform() * BT;
			const FVector Ext = FVector(E.X, E.Y, E.Z) * (0.5f * S);
			const int32 L = Ext.X >= Ext.Y && Ext.X >= Ext.Z ? 0 : (Ext.Y >= Ext.Z ? 1 : 2);
			const FVector Ax = T.GetUnitAxis(L == 0 ? EAxis::X : L == 1 ? EAxis::Y : EAxis::Z);
			const float R = L == 0 ? FMath::Max(Ext.Y, Ext.Z) : L == 1 ? FMath::Max(Ext.X, Ext.Z) : FMath::Max(Ext.X, Ext.Y);
			const float Half = FMath::Max(0.f, Ext[L] - R);
			Out.Add({T.GetLocation() - Ax * Half, T.GetLocation() + Ax * Half, R, BS->BoneName});
		}
	}
}

float AHusk::PushClear(const TArray<UPrimitiveComponent*>& Parts, const FVector& Dir, float Reach, const UMaterialInterface* Skip, FName* WorstBone) const
{
	// each body: from outside (along Dir) back through it, against the parts' real surfaces; where a surface is met short
	// of the body's far side, it is in by that much (glass that has burst is passed through)
	if (Parts.Num() == 0)
	{
		return 0.f;
	}
	const FVector D = Dir.GetSafeNormal();
	const FVector U = FMath::Abs(D.Z) < 0.9f ? FVector::CrossProduct(D, FVector::UpVector).GetSafeNormal() : FVector(1.f, 0.f, 0.f);
	const FVector V = FVector::CrossProduct(D, U);
	FCollisionQueryParams Q(TEXT("HuskPushClear"), true);
	Q.bReturnFaceIndex = Skip != nullptr;
	TArray<FShape> Sh;
	Shapes(Sh);
	float Push = 0.f;
	TArray<UPrimitiveComponent*, TInlineAllocator<8>> Near;
	for (const FShape& S : Sh)
	{
		const FBox SB(FVector::Min(S.A, S.B) - FVector(S.R + 2.f), FVector::Max(S.A, S.B) + FVector(S.R + 2.f));
		Near.Reset();
		for (UPrimitiveComponent* P : Parts)
		{
			if (P && P->Bounds.GetBox().Intersect(SB))
			{
				Near.Add(P);
			}
		}
		if (Near.Num() == 0)
		{
			continue;
		}
		const int32 N = FMath::Clamp(FMath::CeilToInt(FVector::Dist(S.A, S.B) / FMath::Max(S.R, 1.f)), 0, 4);
		for (int32 k = 0; k <= N; ++k)
		{
			const FVector C = N > 0 ? FMath::Lerp(S.A, S.B, float(k) / N) : S.A;
			for (const FVector2D& o : {FVector2D(0.f, 0.f), FVector2D(1.f, 0.f), FVector2D(-1.f, 0.f), FVector2D(0.f, 1.f), FVector2D(0.f, -1.f)})
			{
				const float Off = o.IsZero() ? 0.f : 0.7f * S.R;
				const float Depth = FMath::Sqrt(FMath::Max(0.f, S.R * S.R - Off * Off));
				const FVector P = C + (U * o.X + V * o.Y) * Off;
				const FVector Far = P - D * Depth;                 // its side the push has to clear
				const FVector End = Far - D * 2.f;
				for (UPrimitiveComponent* Part : Near)
				{
					FVector From = P + D * Reach;
					for (int32 Try = 0; Try < 4; ++Try)
					{
						FHitResult H;
						if (!Part->LineTraceComponent(H, From, End, Q))
						{
							break;
						}
						int32 Section = 0;
						if (Skip && H.FaceIndex != INDEX_NONE && Part->GetMaterialFromCollisionFaceIndex(H.FaceIndex, Section) == Skip)
						{
							From = H.ImpactPoint - D * 0.2f;
							continue;
						}
						const float In = FVector::DotProduct(H.ImpactPoint - Far, D);
						if (In > Push)
						{
							Push = In;
							if (WorstBone)
							{
								*WorstBone = S.Bone;
							}
						}
						break;
					}
				}
			}
		}
	}
	return Push;
}

float AHusk::PushOutOfWorld(const TArray<const AActor*>& Ignore, TFunctionRef<bool(const UPrimitiveComponent*)> Skip, bool bApply, FString* What)
{
	UWorld* W = GetWorld();
	if (!W)
	{
		return 0.f;
	}
	FCollisionQueryParams Q(TEXT("HuskWorld"), false, this);
	for (const AActor* A : Ignore)
	{
		if (A)
		{
			Q.AddIgnoredActor(A);
		}
	}
	FCollisionObjectQueryParams O;
	O.AddObjectTypesToQuery(ECC_WorldStatic);
	O.AddObjectTypesToQuery(ECC_WorldDynamic);
	O.AddObjectTypesToQuery(ECC_PhysicsBody);
	float Deepest = 0.f;
	for (int32 Pass = 0; Pass < (bApply ? 4 : 1); ++Pass)
	{
		TArray<FShape> Sh;
		Shapes(Sh);
		FVector Best = FVector::ZeroVector;
		float BestIn = 0.f;
		for (const FShape& S : Sh)
		{
			const FVector C = 0.5f * (S.A + S.B);
			const FVector Ax = S.B - S.A;
			const float Half = 0.5f * Ax.Size();
			const FQuat Rot = Half > 0.1f ? FQuat::FindBetweenNormals(FVector::UpVector, Ax / (2.f * Half)) : FQuat::Identity;
			const FCollisionShape CS = FCollisionShape::MakeCapsule(S.R, Half + S.R);
			TArray<FOverlapResult> Ov;
			W->OverlapMultiByObjectType(Ov, C, Rot, O, CS, Q);
			for (const FOverlapResult& R : Ov)
			{
				UPrimitiveComponent* P = R.GetComponent();
				if (!P || Skip(P) || P->Bounds.SphereRadius > 1500.f)
				{
					continue;             // (a mesh that big has a hull round all of it for its simple collision: no use)
				}
				FMTDResult M;
				if (!P->ComputePenetration(M, CS, C, Rot) || M.Distance <= 0.f)
				{
					continue;
				}
				FVector Out = M.Direction * M.Distance;
				const float Side = M.Direction.Size2D();
				if (M.Direction.Z < 0.7f && Side > 0.2f)
				{
					Out = FVector(M.Direction.X, M.Direction.Y, 0.f) / Side * FMath::Min(M.Distance / Side, 3.f * M.Distance);   // round it
				}
				if (M.Distance > BestIn)
				{
					BestIn = M.Distance;
					Best = Out;
					if (What)
					{
						*What = P->GetOwner() ? P->GetOwner()->GetActorNameOrLabel() + TEXT(".") + P->GetName() : P->GetName();
					}
				}
			}
		}
		Deepest = FMath::Max(Deepest, BestIn);
		if (!bApply || BestIn < 0.05f)
		{
			break;
		}
		AddActorWorldOffset(Best.GetClampedToMaxSize(80.f) + Best.GetSafeNormal() * 0.3f);
	}
	return Deepest;
}

float AHusk::GroundIn(TFunctionRef<float(const FVector&)> GroundAt) const
{
	TArray<FShape> Sh;
	Shapes(Sh);
	float In = 0.f;
	for (const FShape& S : Sh)
	{
		const FVector Lo = S.A.Z < S.B.Z ? S.A : S.B;
		In = FMath::Max(In, GroundAt(Lo) - (Lo.Z - S.R));
	}
	return In;
}

void AHusk::Play(const TCHAR* Take, bool bLoop)
{
	const FString T(Take);
	if (T.StartsWith(TEXT("CMU:")) && !Takes.Contains(FName(Take)))
	{
		// real motion (the CMU library, retargeted onto it in Unreal: Scripts/import_mocap.py)
		const FString C = T.Mid(4);
		const FString P = FString::Printf(TEXT("/Game/HollowAcre/Creature/Mocap/Husk/CMUCMU_%s_Husk.CMUCMU_%s_Husk"), *C, *C);
		if (UAnimSequence* A = LoadObject<UAnimSequence>(nullptr, *P))
		{
			Takes.Add(FName(Take), A);
		}
		else
		{
			UE_LOG(LogTemp, Warning, TEXT("Husk: no clip %s"), *P);
		}
	}
	if (const TObjectPtr<UAnimSequence>* A = Takes.Find(FName(Take)))
	{
		Body->PlayAnimation(*A, bLoop);
	}
}

void AHusk::PoseNow()
{
	// the take's pose at once (not a frame late, on the last take's pose)
	Body->TickAnimation(0.f, false);
	Body->RefreshBoneTransforms();
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
	// the body that is drawn takes the take's pose; its face follows it; then (KeepOutLate) its hands, feet and face are
	// put on what they touch and it is kept out of everything, with the pose it has this frame
	CopyPose();
	UpdateFace();
	if (KeepOutLate)
	{
		KeepOutLate(this);
	}
}

void AHusk::UpdateFace()
{
	// the trunk, neck and head from the drawn body (parents come first in the face's bone order)
	const FReferenceSkeleton& FR = Face->GetSkinnedAsset()->GetRefSkeleton();
	TMap<int32, FTransform> CS;
	CS.Reserve(Copies.Num());
	for (const FCopy& C : Copies)
	{
		const FTransform T = C.Offset * Pose()->GetBoneTransform(C.BodyIndex, FTransform::Identity);
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
	Face->RefreshBoneTransforms();
}

void AHusk::BuildSurface()
{
	// its visible surface (the body's skin, claws and fur; the face, its teeth), a point every 2.5 cm, each on the bone
	// that carries most of it, in that bone's own space (from the meshes' own vertices)
	BodySurf.Reset();
	FaceSurf.Reset();
#if WITH_EDITORONLY_DATA
	auto Gather = [](const USkeletalMesh* M, TArray<FSurf>& Out, TFunctionRef<int32(int32)> LimbOf)
	{
		const FSkeletalMeshModel* Model = M ? M->GetImportedModel() : nullptr;
		if (!Model || Model->LODModels.Num() == 0)
		{
			return;
		}
		const FSkeletalMeshLODModel& LOD = Model->LODModels[0];
		const FReferenceSkeleton& RS = M->GetRefSkeleton();
		TArray<FTransform> Ref;
		Ref.SetNum(RS.GetNum());
		for (int32 i = 0; i < RS.GetNum(); ++i)
		{
			Ref[i] = RefCS(RS, i);
		}
		TSet<FIntVector> Seen;
		for (const FSkelMeshSection& S : LOD.Sections)
		{
			for (const FSoftSkinVertex& V : S.SoftVertices)
			{
				int32 Best = 0;
				for (int32 k = 1; k < MAX_TOTAL_INFLUENCES; ++k)
				{
					if (V.InfluenceWeights[k] > V.InfluenceWeights[Best])
					{
						Best = k;
					}
				}
				if (!S.BoneMap.IsValidIndex(V.InfluenceBones[Best]))
				{
					continue;
				}
				const int32 Bone = S.BoneMap[V.InfluenceBones[Best]];
				const FVector P(V.Position);
				const FIntVector K(FMath::FloorToInt(P.X / 2.5f), FMath::FloorToInt(P.Y / 2.5f), FMath::FloorToInt(P.Z / 2.5f));
				if (Seen.Contains(K) || !Ref.IsValidIndex(Bone))
				{
					continue;
				}
				Seen.Add(K);
				Out.Add({Bone, Ref[Bone].InverseTransformPosition(P), LimbOf(Bone)});
			}
		}
		Out.Sort([](const FSurf& A, const FSurf& B) { return A.Bone < B.Bone; });
	};
	// which limb each body bone is part of: a hand or a foot and all below it (fingers, claws, toes), or the head
	const USkeletalMesh* BM = Cast<USkeletalMesh>(Body->GetSkinnedAsset());
	TArray<int32> LimbOfBone;
	if (BM)
	{
		const FReferenceSkeleton& RS = BM->GetRefSkeleton();
		LimbOfBone.Init(-1, RS.GetNum());
		for (int32 i = 0; i < RS.GetNum(); ++i)
		{
			for (int32 b = i; b != INDEX_NONE; b = RS.GetParentIndex(b))
			{
				const int32 l = b == Chain[0][2] ? 0 : b == Chain[1][2] ? 1 : b == Chain[2][2] ? 2 : b == Chain[3][2] ? 3 : b == HeadBone ? 4 : -1;
				if (l >= 0)
				{
					LimbOfBone[i] = l;
					break;
				}
			}
		}
	}
	Gather(BM, BodySurf, [&LimbOfBone](int32 Bone) { return LimbOfBone.IsValidIndex(Bone) ? LimbOfBone[Bone] : -1; });
	Gather(Cast<USkeletalMesh>(Face->GetSkinnedAsset()), FaceSurf, [](int32) { return 4; });
#endif
	UE_LOG(LogTemp, Display, TEXT("Husk: its visible surface: %d points on the body, %d on the face"), BodySurf.Num(), FaceSurf.Num());
}

float AHusk::GroundInSurface(TFunctionRef<float(const FVector&)> GroundAt) const
{
	// its lowest visible points (within 30 cm of the very lowest: feet, claws, a hand down) against the snow under each
	TArray<FVector> Pts;
	Pts.Reserve(BodySurf.Num());
	float MinZ = 1e9f;
	int32 Last = INDEX_NONE;
	FTransform BT;
	for (const FSurf& S : BodySurf)
	{
		if (S.Bone != Last)
		{
			Last = S.Bone;
			BT = Pose()->GetBoneTransform(S.Bone);
		}
		Pts.Add(BT.TransformPosition(S.Local));
		MinZ = FMath::Min(MinZ, Pts.Last().Z);
	}
	float In = 0.f;
	for (int32 i = 0; i < Pts.Num(); ++i)
	{
		if (Pts[i].Z < MinZ + 30.f)
		{
			In = FMath::Max(In, GroundAt(Pts[i]) - Pts[i].Z);
		}
	}
	return In;
}

float AHusk::PushClearSurface(const TArray<UPrimitiveComponent*>& Parts, const FVector& Dir, float Reach, const UMaterialInterface* Skip,
	FString* Worst, float Skin) const
{
	return SurfaceIn(Parts, Dir, Skip, -2, Skin, Worst);
}

float AHusk::SurfaceIn(const TArray<UPrimitiveComponent*>& Parts, const FVector& Dir, const UMaterialInterface* Skip, int32 Limb,
	float Skin, FString* Worst) const
{
	// each point of its visible surface (of one limb, or all of it: Limb -2): from outside (along Dir) back to it, against
	// the parts' real surfaces; where a surface is met short of the point (less Skin), it is in by that much (glass that
	// has burst is passed through)
	if (Parts.Num() == 0 || (BodySurf.Num() == 0 && FaceSurf.Num() == 0))
	{
		return 0.f;
	}
	const float Reach = 300.f;
	const FVector D = Dir.GetSafeNormal();
	FBox All(ForceInit);
	for (const UPrimitiveComponent* P : Parts)
	{
		if (P)
		{
			All += P->Bounds.GetBox();
		}
	}
	All = All.ExpandBy(Skin + 1.f);
	FCollisionQueryParams Q(TEXT("HuskSurface"), true);
	Q.bReturnFaceIndex = Skip != nullptr;
	float Push = 0.f;
	for (int32 c = 0; c < 2; ++c)
	{
		const USkinnedMeshComponent* C = c == 0 ? Pose() : static_cast<const USkinnedMeshComponent*>(Face.Get());
		const TArray<FSurf>& Pts = c == 0 ? BodySurf : FaceSurf;
		if (!C || (Limb >= 0 && Limb != 4 && c == 1))
		{
			continue;
		}
		int32 Last = INDEX_NONE;
		FTransform BT;
		for (const FSurf& S : Pts)
		{
			if (Limb != -2 && S.Limb != Limb)
			{
				continue;
			}
			if (S.Bone != Last)
			{
				Last = S.Bone;
				BT = C->GetBoneTransform(S.Bone);
			}
			const FVector P = BT.TransformPosition(S.Local);
			if (!All.IsInside(P))
			{
				continue;
			}
			const FVector Far = P - D * Skin;
			for (UPrimitiveComponent* Part : Parts)
			{
				if (!Part || !Part->Bounds.GetBox().ExpandBy(Skin + 1.f).IsInside(P))
				{
					continue;
				}
				FVector From = P + D * Reach;
				for (int32 Try = 0; Try < 4; ++Try)
				{
					FHitResult H;
					if (!Part->LineTraceComponent(H, From, Far - D * 0.5f, Q))
					{
						break;
					}
					int32 Section = 0;
					if (Skip && H.FaceIndex != INDEX_NONE && Part->GetMaterialFromCollisionFaceIndex(H.FaceIndex, Section) == Skip)
					{
						From = H.ImpactPoint - D * 0.2f;
						continue;
					}
					const float In = FVector::DotProduct(H.ImpactPoint - Far, D);
					if (In > Push)
					{
						Push = In;
						if (Worst)
						{
							*Worst = FString::Printf(TEXT("%s's %s in %s"), c == 0 ? TEXT("body") : TEXT("face"), *C->GetBoneName(S.Bone).ToString(),
								*GetNameSafe(Part->GetOwner()));
						}
					}
					break;
				}
			}
		}
	}
	return Push;
}

float AHusk::LimbUnder(TFunctionRef<float(const FVector&)> GroundAt, int32 Limb) const
{
	// how far the lowest of a limb's visible points (its claws, its toes) is under the snow
	float MinZ = 1e9f;
	FVector Low = FVector::ZeroVector;
	int32 Last = INDEX_NONE;
	FTransform BT;
	for (const FSurf& S : BodySurf)
	{
		if (S.Limb != Limb)
		{
			continue;
		}
		if (S.Bone != Last)
		{
			Last = S.Bone;
			BT = Pose()->GetBoneTransform(S.Bone);
		}
		const FVector P = BT.TransformPosition(S.Local);
		if (P.Z < MinZ)
		{
			MinZ = P.Z;
			Low = P;
		}
	}
	return MinZ < 1e8f ? FMath::Max(0.f, GroundAt(Low) - Low.Z) : 0.f;
}

const USkinnedMeshComponent* AHusk::Pose() const
{
	return Shown && Shown->GetSkinnedAsset() ? static_cast<const USkinnedMeshComponent*>(Shown.Get()) : static_cast<const USkinnedMeshComponent*>(Body.Get());
}

void AHusk::CopyPose()
{
	// the drawn body takes the take's pose as it is this frame (each bone relative to its parent)
	if (!Shown || !Shown->GetSkinnedAsset() || !Body->GetSkinnedAsset())
	{
		return;
	}
	const TArray<FTransform>& CS = Body->GetComponentSpaceTransforms();
	const FReferenceSkeleton& R = Body->GetSkinnedAsset()->GetRefSkeleton();
	if (CS.Num() != R.GetNum() || Shown->BoneSpaceTransforms.Num() != R.GetNum())
	{
		return;
	}
	for (int32 i = 0; i < CS.Num(); ++i)
	{
		const int32 P = R.GetParentIndex(i);
		Shown->BoneSpaceTransforms[i] = P == INDEX_NONE ? CS[i] : CS[i].GetRelativeTransform(CS[P]);
	}
	Shown->RefreshBoneTransforms();
}

void AHusk::SetCS(int32 Bone, const FTransform& World)
{
	// one bone of the drawn body set where it should be in the world (the bones under it follow)
	const FName N = Shown->GetBoneName(Bone);
	Shown->SetBoneTransformByName(N, World.GetRelativeTransform(Shown->GetComponentTransform()), EBoneSpaces::ComponentSpace);
	Shown->RefreshBoneTransforms();
}

float AHusk::ContactIK(const TArray<UPrimitiveComponent*>& Parts, const FVector& Dir, const UMaterialInterface* Skip,
	TFunctionRef<float(const FVector&)> GroundAt, FString* What)
{
	if (!Shown || !Shown->GetSkinnedAsset() || BodySurf.Num() == 0)
	{
		return 0.f;
	}
	const FVector D = Dir.GetSafeNormal();
	static const TCHAR* LimbName[5] = {TEXT("left hand"), TEXT("right hand"), TEXT("left foot"), TEXT("right foot"), TEXT("face")};
	float Most = 0.f;
	for (int32 L = 0; L < 4; ++L)
	{
		if (Chain[L][0] == INDEX_NONE || Chain[L][1] == INDEX_NONE || Chain[L][2] == INDEX_NONE)
		{
			continue;
		}
		// how far its claws (its toes) are in what they touch, along Dir; and under the snow
		FVector Move = FVector::ZeroVector;
		for (int32 Pass = 0; Pass < 2; ++Pass)
		{
			const float In = D.IsNearlyZero() ? 0.f : SurfaceIn(Parts, D, Skip, L, 0.6f, nullptr);
			const float Under = LimbUnder(GroundAt, L);
			const FVector Step = In >= Under ? D * In : FVector::UpVector * Under;
			if (Step.Size() < 0.1f)
			{
				break;
			}
			// two-bone IK: the hand (foot) moved out onto the surface, the elbow (knee) bending the way it was bending,
			// the hand keeping its turn
			FTransform A = Shown->GetBoneTransform(Chain[L][0]), B = Shown->GetBoneTransform(Chain[L][1]), C = Shown->GetBoneTransform(Chain[L][2]);
			const FVector Bend = B.GetLocation() - 0.5f * (A.GetLocation() + C.GetLocation());
			const FVector JointTarget = B.GetLocation() + (Bend.IsNearlyZero() ? FVector::UpVector : Bend.GetSafeNormal()) * 50.f;
			const FVector Target = C.GetLocation() + Step + Step.GetSafeNormal() * 0.2f;
			AnimationCore::SolveTwoBoneIK(A, B, C, JointTarget, Target, false, 1.f, 1.f);
			SetCS(Chain[L][0], A);
			SetCS(Chain[L][1], B);
			SetCS(Chain[L][2], C);
			Move += Step;
		}
		if (Move.Size() > Most)
		{
			Most = Move.Size();
			if (What)
			{
				*What = LimbName[L];
			}
		}
	}
	// its face kept off the glass: its neck bent back by as much (the face follows its head)
	if (!D.IsNearlyZero() && NeckBone != INDEX_NONE && HeadBone != INDEX_NONE)
	{
		UpdateFace();
		for (int32 Pass = 0; Pass < 3; ++Pass)
		{
			const float In = SurfaceIn(Parts, D, Skip, 4, 0.6f, nullptr);
			if (In < 0.1f)
			{
				break;
			}
			const FTransform N = Shown->GetBoneTransform(NeckBone);
			const FVector H = Shown->GetBoneTransform(HeadBone).GetLocation();
			const FVector From = H - N.GetLocation(), To = H + D * (In + 0.3f) - N.GetLocation();
			FTransform N2 = N;
			N2.SetRotation(FQuat::FindBetweenVectors(From, To) * N.GetRotation());
			SetCS(NeckBone, N2);
			UpdateFace();
			if (In > Most)
			{
				Most = In;
				if (What)
				{
					*What = LimbName[4];
				}
			}
		}
	}
	return Most;
}
