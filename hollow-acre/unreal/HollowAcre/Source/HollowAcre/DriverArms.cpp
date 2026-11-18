#include "DriverArms.h"
#include "Animation/AnimSequence.h"
#include "Animation/Skeleton.h"

#include "Components/PointLightComponent.h"
#include "Misc/CommandLine.h"
#include "Misc/Parse.h"
#include "Components/PoseableMeshComponent.h"
#include "ControlRigComponent.h"
#include "ControlRig.h"
#include "Components/SkeletalMeshComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Engine/SkeletalMesh.h"
#include "Engine/StaticMesh.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Misc/Compression.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#if WITH_EDITORONLY_DATA
#include "Rendering/SkeletalMeshLODModel.h"
#include "Rendering/SkeletalMeshModel.h"
#endif

namespace
{
	constexpr float SkinAllow = -0.1f;   // skin may press a millimetre into the wheel's leather, never further
	constexpr float PalmGap = 0.05f;     // the palm rests on the rim

	// which part of the hand a bone moves: 0 palm, 1-4 index..pinky, 5 thumb (-1: not the hand); its finger segment
	int32 HandPart(const FString& Name, int32& Side, uint8& Seg)
	{
		Seg = 0;
		if (Name.EndsWith(TEXT("_l"))) { Side = 0; }
		else if (Name.EndsWith(TEXT("_r"))) { Side = 1; }
		else { return -1; }
		if (Name.StartsWith(TEXT("hand_")) || Name.Contains(TEXT("metacarpal")) || Name.StartsWith(TEXT("wrist")))
		{
			return 0;
		}
		static const TCHAR* Fingers[5] = { TEXT("index_"), TEXT("middle_"), TEXT("ring_"), TEXT("pinky_"), TEXT("thumb_") };
		for (int32 F = 0; F < 5; ++F)
		{
			if (Name.StartsWith(Fingers[F]))
			{
				Seg = Name.Contains(TEXT("_03")) ? 2 : Name.Contains(TEXT("_02")) ? 1 : 0;
				return F + 1;
			}
		}
		return -1;
	}
}

ADriverArms::ADriverArms()
{
	PrimaryActorTick.bCanEverTick = true;
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
	Mesh = CreateDefaultSubobject<UPoseableMeshComponent>(TEXT("Mesh"));
	Mesh->SetupAttachment(RootComponent);
	Mesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	Clothes = CreateDefaultSubobject<USkeletalMeshComponent>(TEXT("Clothes"));
	Clothes->SetupAttachment(Mesh);
	Clothes->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	// the bounds are the reference pose's: an arm reaching far from it (down to the buckle) left them, and the skin was
	// culled while the clothes still drew (an empty sleeve); a bigger box keeps both drawn
	Mesh->SetBoundsScale(4.f);
	Clothes->SetBoundsScale(4.f);
	// (the blood and dirt decals on the lining project through everything in their box: not onto the body lying on them)
	Mesh->SetReceivesDecals(false);
	Clothes->SetReceivesDecals(false);
	// Epic's MetaHuman body rig, run on a hidden copy of the body: it solves the arms for the keyed poses (RigSolveArm)
	RigBody = CreateDefaultSubobject<USkeletalMeshComponent>(TEXT("RigBody"));
	RigBody->SetupAttachment(RootComponent);
	RigBody->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	RigBody->SetVisibility(false);
	RigBody->SetHiddenInGame(true);
	ArmRig = CreateDefaultSubobject<UControlRigComponent>(TEXT("ArmRig"));
	ArmRig->bUpdateRigOnTick = false;

	Left.Clock = -63.f;              // 10 o'clock, the left a little lower
	Left.BackAngle = 52.f;
	Left.Yaw = 42.f;
	Left.Roll = 14.f;
	Left.ElbowPole = FVector2D(1.8f, -0.7f);   // the left forearm comes in low from outside (35-45 degrees on screen)
	Right.Clock = 58.f;              // 2 o'clock
	Right.BackAngle = 55.f;
	Right.Yaw = 45.f;
	Right.Roll = 10.f;
	Right.ElbowPole = FVector2D(0.8f, -1.f);   // the right forearm rises more steeply (70-80 degrees)
	Right.Index = FVector(84.f, 98.f, 66.f);   // limits; never mirror copies
	Right.Middle = FVector(90.f, 102.f, 70.f);
	Right.Ring = FVector(92.f, 104.f, 72.f);
	Right.Pinky = FVector(95.f, 106.f, 75.f);
}

FTransform ADriverArms::BoneCS(FName Bone) const
{
	return Mesh->GetBoneTransformByName(Bone, EBoneSpaces::ComponentSpace);
}

void ADriverArms::SetBoneCS(FName Bone, const FQuat& Rot)
{
	FTransform T = BoneCS(Bone);
	T.SetRotation(Rot.GetNormalized());
	Mesh->SetBoneTransformByName(Bone, T, EBoneSpaces::ComponentSpace);
}

void ADriverArms::ApplyOutfit()
{
	// Part 1's outfits (2d/src/custom.js) by their sleeves: long (each with its own cuff), short, or none (bare arms)
	FString Outfit = TEXT("hoodie"), Shirt = TEXT("4f7a3e"), Pattern = TEXT("plain");
	FParse::Value(FCommandLine::Get(), TEXT("-outfit="), Outfit);
	FParse::Value(FCommandLine::Get(), TEXT("-shirt="), Shirt);
	FParse::Value(FCommandLine::Get(), TEXT("-pattern="), Pattern);
	struct FKind { const TCHAR* Name; int32 Sleeve; int32 Cuff; float Out; };   // sleeve: 0 none, 1 short, 2 long; cuff: 0 woven, 1 knit, 2 hoodie, 3 jacket, 4 coat
	static const FKind Kinds[] = {{TEXT("shirt"), 2, 0, 0.35f}, {TEXT("openshirt"), 2, 0, 0.35f}, {TEXT("sweater"), 2, 1, 0.55f},
		{TEXT("turtleneck"), 2, 1, 0.5f}, {TEXT("cardigan"), 2, 1, 0.55f}, {TEXT("hoodie"), 2, 2, 1.0f}, {TEXT("jacket"), 2, 3, 1.0f},
		{TEXT("longcoat"), 2, 4, 1.15f}, {TEXT("tee"), 1, 0, 0.3f}, {TEXT("tank"), 0, 0, 0.3f}, {TEXT("vest"), 0, 0, 0.3f},
		{TEXT("overalls"), 0, 0, 0.3f}, {TEXT("skirt"), 0, 0, 0.3f}, {TEXT("dress"), 0, 0, 0.3f}};
	FKind K = Kinds[5];
	for (const FKind& Ki : Kinds)
	{
		if (Outfit.Equals(Ki.Name, ESearchCase::IgnoreCase))
		{
			K = Ki;
		}
	}
	const int32 Pat = Pattern.Equals(TEXT("plaid")) ? 1 : Pattern.Equals(TEXT("stripes")) ? 2 : Pattern.Equals(TEXT("dots")) ? 3 : 0;
	const FLinearColor Col = FLinearColor::FromSRGBColor(FColor::FromHex(Shirt));
	// where the arm's joints are across the body in its reference pose (the material cuts and cuffs by that distance)
	USkeletalMesh* SM = Body;
	FVector Sh(20.3f, -2.f, 155.f), El(38.8f, -1.2f, 130.8f), Wr(53.6f, 17.f, 113.f);
	if (SM)
	{
		const FReferenceSkeleton& Rs = SM->GetRefSkeleton();
		const TArray<FTransform>& RefPose = Rs.GetRefBonePose();
		auto RefCS = [&](const TCHAR* Name)
		{
			int32 i = Rs.FindBoneIndex(FName(Name));
			FTransform T = FTransform::Identity;
			while (i != INDEX_NONE)
			{
				T = T * RefPose[i];
				i = Rs.GetParentIndex(i);
			}
			return T.GetLocation();
		};
		if (Rs.FindBoneIndex(TEXT("hand_l")) != INDEX_NONE)
		{
			auto Abs = [](FVector V) { V.X = FMath::Abs(V.X); return V; };
			Sh = Abs(RefCS(TEXT("upperarm_l")));
			El = Abs(RefCS(TEXT("lowerarm_l")));
			Wr = Abs(RefCS(TEXT("hand_l")));
			UE_LOG(LogTemp, Display, TEXT("DriverArms: reference pose: shoulder %s, elbow %s, wrist %s"), *RefCS(TEXT("upperarm_l")).ToString(),
				*RefCS(TEXT("lowerarm_l")).ToString(), *RefCS(TEXT("hand_l")).ToString());
		}
	}
	// (along the arm from the shoulder: a T-shirt's sleeve ends ~45% down the upper arm; with none, bare from the armhole)
	const FVector ArmDir = (El - Sh).GetSafeNormal();
	const float UpperLen = (float)FVector::Dist(Sh, El);
	const float Cut = K.Sleeve == 2 ? 9999.f : K.Sleeve == 1 ? 0.45f * UpperLen : -1.5f;
	OutfitName = FString::Printf(TEXT("%s, %s, #%s; sleeves %s; jeans, boots; bare hands"), *Outfit, *Pattern, *Shirt,
		K.Sleeve == 2 ? TEXT("long") : K.Sleeve == 1 ? TEXT("short") : TEXT("none"));
	if (ClothesMID)
	{
		ClothesMID->SetVectorParameterValue(TEXT("ShirtColor"), Col);
		ClothesMID->SetScalarParameterValue(TEXT("Pattern"), (float)Pat);
		ClothesMID->SetScalarParameterValue(TEXT("CuffKind"), (float)K.Cuff);
		ClothesMID->SetScalarParameterValue(TEXT("ClothOut"), K.Out);
		ClothesMID->SetVectorParameterValue(TEXT("ArmS"), FLinearColor(Sh));
		ClothesMID->SetVectorParameterValue(TEXT("ArmDir"), FLinearColor(ArmDir));
		ClothesMID->SetVectorParameterValue(TEXT("WristP"), FLinearColor(Wr));
		ClothesMID->SetVectorParameterValue(TEXT("ForeDir"), FLinearColor((Wr - El).GetSafeNormal()));
		ClothesMID->SetVectorParameterValue(TEXT("ElbowP"), FLinearColor(El));
		ClothesMID->SetScalarParameterValue(TEXT("ArmZ"), 100.f);     // (the arm lies above the hips in the reference pose)
		ClothesMID->SetScalarParameterValue(TEXT("SleeveD"), Cut);
	}
}

bool ADriverArms::AnimArm(int32 Side, float Time)
{
	if (!ArmAnim || !ArmAnim->GetSkeleton())
	{
		return false;
	}
	const TCHAR* Sx = Side == 0 ? TEXT("l") : TEXT("r");
	const FReferenceSkeleton& Rs = ArmAnim->GetSkeleton()->GetReferenceSkeleton();
	const FAnimExtractContext Ctx((double)FMath::Clamp(Time, 0.f, ArmAnim->GetPlayLength()));
	for (int32 b = 0; b < Mesh->GetNumBones(); ++b)
	{
		const FName Bn = Mesh->GetBoneName(b);
		const FString S = Bn.ToString();
		if (!S.EndsWith(FString::Printf(TEXT("_%s"), Sx)))
		{
			continue;
		}
		if (S.StartsWith(TEXT("clavicle")) || S.StartsWith(TEXT("upperarm")) || S.StartsWith(TEXT("lowerarm")) || S.Equals(FString::Printf(TEXT("hand_%s"), Sx)))
		{
			const int32 Si = Rs.FindBoneIndex(Bn);
			if (Si == INDEX_NONE)
			{
				continue;
			}
			FTransform L;
			ArmAnim->GetBoneTransform(L, FSkeletonPoseBoneIndex(Si), Ctx, false);
			L.SetScale3D(FVector::OneVector);
			Mesh->BoneSpaceTransforms[b] = L;
		}
	}
	return true;
}

FTransform ADriverArms::CarToRig() const
{
	if (!bRigReady || !ArmRig)
	{
		return FTransform::Identity;
	}
	const FTransform S5Rig = ArmRig->GetInitialBoneTransform(TEXT("spine_05"), EControlRigComponentSpace::RigSpace);
	return Mesh->GetRelativeTransform().Inverse() * BoneCS(TEXT("spine_05")).Inverse() * S5Rig;
}

bool ADriverArms::RigSolveArm(int32 Side, const FTransform& HandCar, const FVector& PoleDirCar)
{
	if (!bRigReady || !ArmRig)
	{
		return false;
	}
	const TCHAR* Sx = Side == 0 ? TEXT("l") : TEXT("r");
	// the rig's body stands in its reference pose; ours lies however the scene has it: the hand is carried across relative
	// to the chest (spine_05), which both share
	const FTransform MeshRel = Mesh->GetRelativeTransform();
	const FTransform S5Ours = BoneCS(TEXT("spine_05"));
	const FTransform S5Rig = ArmRig->GetInitialBoneTransform(TEXT("spine_05"), EControlRigComponentSpace::RigSpace);
	auto ToRig = [&](const FTransform& Car) { return (Car * MeshRel.Inverse()) * S5Ours.Inverse() * S5Rig; };
	const FTransform HandRig = ToRig(HandCar);
	const FVector PoleRig = (S5Rig.GetRotation() * S5Ours.GetRotation().Inverse() * MeshRel.GetRotation().Inverse()).RotateVector(PoleDirCar).GetSafeNormal();
	const FVector ShRig = ArmRig->GetInitialBoneTransform(FName(*FString::Printf(TEXT("upperarm_%s"), Sx)), EControlRigComponentSpace::RigSpace).GetLocation();
	ArmRig->SetControlBool(FName(*FString::Printf(TEXT("arm_%s_fk_ik_switch"), Sx)), true);
	RigLastCtrl[Side] = RigCtrlOffset[Side] * HandRig;
	ArmRig->SetControlTransform(FName(*FString::Printf(TEXT("hand_%s_ik_ctrl"), Sx)), RigLastCtrl[Side], EControlRigComponentSpace::RigSpace);
	const FVector Mid = (ShRig + HandRig.GetLocation()) * 0.5f;
	RigLastPv[Side] = Mid + PoleRig * 40.f;
	ArmRig->SetControlTransform(FName(*FString::Printf(TEXT("arm_%s_pv_ik_ctrl"), Sx)), FTransform(RigLastPv[Side]), EControlRigComponentSpace::RigSpace);
	ArmRig->Update(0.f);
	// the arm's bones, local to their parents, onto the body (the clavicle down to the hand, the twist bones with them;
	// the fingers are posed after, as before)
	for (int32 b = 0; b < Mesh->GetNumBones(); ++b)
	{
		const FString Bn = Mesh->GetBoneName(b).ToString();
		if (!Bn.EndsWith(FString::Printf(TEXT("_%s"), Sx)))
		{
			continue;
		}
		if (Bn.StartsWith(TEXT("clavicle")) || Bn.StartsWith(TEXT("upperarm")) || Bn.StartsWith(TEXT("lowerarm")) || Bn.Equals(FString::Printf(TEXT("hand_%s"), Sx)))
		{
			FTransform L = ArmRig->GetBoneTransform(Mesh->GetBoneName(b), EControlRigComponentSpace::LocalSpace);
			L.SetScale3D(FVector::OneVector);
			Mesh->BoneSpaceTransforms[b] = L;
		}
	}
	RigMiss[Side] = (float)FVector::Dist(MeshRel.TransformPosition(BoneCS(FName(*FString::Printf(TEXT("hand_%s"), Sx))).GetLocation()), HandCar.GetLocation());
	return true;
}

FVector ADriverArms::ToCS(const FVector& CarPos) const
{
	return Mesh->GetRelativeTransform().InverseTransformPosition(CarPos);
}

FVector ADriverArms::DirToCS(const FVector& CarDir) const
{
	return Mesh->GetRelativeTransform().InverseTransformVectorNoScale(CarDir).GetSafeNormal();
}

void ADriverArms::Place()
{
	USkeletalMesh* SM = Cast<USkeletalMesh>(Mesh->GetSkinnedAsset());
	if (!SM)
	{
		return;
	}
	// start from the reference pose
	Mesh->BoneSpaceTransforms = SM->GetRefSkeleton().GetRefBonePose();
	// which way the body faces (heel to toe), and turn it to face along the car
	FVector Fwd(0.f, -1.f, 0.f);
	if (Mesh->GetBoneIndex(TEXT("ball_l")) != INDEX_NONE && Mesh->GetBoneIndex(TEXT("foot_l")) != INDEX_NONE)
	{
		FVector D = BoneCS(TEXT("ball_l")).GetLocation() - BoneCS(TEXT("foot_l")).GetLocation();
		D.Z = 0.f;
		if (D.SizeSquared() > 1.f)
		{
			Fwd = D.GetSafeNormal();
		}
	}
	const FRotator Yaw(0.f, -FMath::RadiansToDegrees(FMath::Atan2(Fwd.Y, Fwd.X)), 0.f);
	const FVector Mid = (BoneCS(TEXT("upperarm_l")).GetLocation() + BoneCS(TEXT("upperarm_r")).GetLocation()) * 0.5f;
	Mesh->SetRelativeTransform(FTransform(Yaw, ShoulderMid - Yaw.RotateVector(Mid)));
	// only the arms are seen: fold the legs and the neck away
	for (const TCHAR* B : { TEXT("thigh_l"), TEXT("thigh_r"), TEXT("neck_01") })
	{
		const int32 I = Mesh->GetBoneIndex(B);
		if (I != INDEX_NONE)
		{
			Mesh->BoneSpaceTransforms[I].SetScale3D(FVector(0.001f));
		}
	}
	UE_LOG(LogTemp, Display, TEXT("DriverArms: body faces %s, shoulders at %s"), *Fwd.ToString(), *ShoulderMid.ToString());
}

float ADriverArms::RimDistCS(const FVector& PCS) const
{
	// distance from a point (component space) to the rim's surface (car frame torus)
	const FVector P = Mesh->GetRelativeTransform().TransformPosition(PCS);
	if (GraspDist)
	{
		return GraspDist(P);                     // (making a grip: the handle instead)
	}
	const float Tilt = FMath::DegreesToRadians(WheelTilt);
	const FVector Nw(-FMath::Cos(Tilt), 0.f, FMath::Sin(Tilt));
	const FVector D = P - WheelCentre;
	const float Hn = FVector::DotProduct(D, Nw);
	const float Rad = (D - Nw * Hn).Size();
	return FMath::Sqrt(FMath::Square(Rad - RimRadius) + Hn * Hn) - RimTube;
}

void ADriverArms::GatherSkin()
{
	for (int32 Side = 0; Side < 2; ++Side)
	{
		ArmBones[Side].Reset();
		for (int32 P = 0; P < 7; ++P)
		{
			Skin[Side][P].Reset();
		}
	}
	USkeletalMesh* SM = Body;
	if (!SM)
	{
		return;
	}
	const FReferenceSkeleton& Ref = SM->GetRefSkeleton();
	const int32 NB = Ref.GetNum();
	// the reference pose in component space, and which bones belong to each arm
	TArray<FTransform> RefCS;
	RefCS.SetNum(NB);
	for (int32 B = 0; B < NB; ++B)
	{
		const int32 Pa = Ref.GetParentIndex(B);
		RefCS[B] = Pa == INDEX_NONE ? Ref.GetRefBonePose()[B] : Ref.GetRefBonePose()[B] * RefCS[Pa];
	}
	for (int32 Side = 0; Side < 2; ++Side)
	{
		const int32 Top = Ref.FindBoneIndex(Side == 0 ? TEXT("upperarm_l") : TEXT("upperarm_r"));
		for (int32 B = 0; B < NB && Top != INDEX_NONE; ++B)
		{
			for (int32 X = B; X != INDEX_NONE; X = Ref.GetParentIndex(X))
			{
				if (X == Top)
				{
					ArmBones[Side].Add(B);
					break;
				}
			}
		}
	}
	TArray<int32> PartOf, SideOf;
	TArray<uint8> SegOf;
	PartOf.SetNum(NB);
	SideOf.SetNum(NB);
	SegOf.SetNum(NB);
	for (int32 B = 0; B < NB; ++B)
	{
		PartOf[B] = HandPart(Ref.GetBoneName(B).ToString().ToLower(), SideOf[B], SegOf[B]);
	}
	// the rest of each arm (upper arm, forearm and their twist bones) collides too
	for (int32 Side = 0; Side < 2; ++Side)
	{
		for (int32 B : ArmBones[Side])
		{
			if (PartOf[B] < 0)
			{
				PartOf[B] = 6;
				SideOf[B] = Side;
				SegOf[B] = 0;
			}
		}
	}
	int32 Total = 0;
#if WITH_EDITORONLY_DATA
	// the skin as built (positions and skin weights), from the mesh's LOD 0
	const FSkeletalMeshModel* Model = SM->GetImportedModel();
	if (Model && Model->LODModels.Num() > 0)
	{
		for (const FSkelMeshSection& Sec : Model->LODModels[0].Sections)
		{
			for (const FSoftSkinVertex& V : Sec.SoftVertices)
			{
				// strongest influences first
				TArray<TPair<float, int32>, TInlineAllocator<12>> Inf;
				for (int32 K = 0; K < MAX_TOTAL_INFLUENCES; ++K)
				{
					if (V.InfluenceWeights[K] > 0 && Sec.BoneMap.IsValidIndex(V.InfluenceBones[K]))
					{
						Inf.Add(TPair<float, int32>((float)V.InfluenceWeights[K], (int32)Sec.BoneMap[V.InfluenceBones[K]]));
					}
				}
				if (Inf.Num() == 0)
				{
					continue;
				}
				Inf.Sort([](const TPair<float, int32>& A, const TPair<float, int32>& B) { return A.Key > B.Key; });
				const int32 Dom = Inf[0].Value;
				if (!PartOf.IsValidIndex(Dom) || PartOf[Dom] < 0)
				{
					continue;
				}
				FHandSkinPoint Pt;
				Pt.Num = FMath::Min(Inf.Num(), 4);
				float Sum = 0.f;
				for (int32 K = 0; K < Pt.Num; ++K)
				{
					Sum += Inf[K].Key;
				}
				for (int32 K = 0; K < Pt.Num; ++K)
				{
					Pt.Bone[K] = Inf[K].Value;
					Pt.Weight[K] = Inf[K].Key / Sum;
					Pt.Local[K] = FVector3f(RefCS[Pt.Bone[K]].InverseTransformPosition(FVector(V.Position)));
				}
				Pt.Seg = SegOf[Dom];
				Skin[SideOf[Dom]][PartOf[Dom]].Add(Pt);
				++Total;
			}
		}
	}
#endif
	for (int32 Side = 0; Side < 2; ++Side)
	{
		const int32 B2 = Ref.FindBoneIndex(Side == 0 ? TEXT("thumb_02_l") : TEXT("thumb_02_r"));
		const int32 B3 = Ref.FindBoneIndex(Side == 0 ? TEXT("thumb_03_l") : TEXT("thumb_03_r"));
		if (B2 == INDEX_NONE || B3 == INDEX_NONE)
		{
			continue;
		}
		const FVector P3 = RefCS[B3].GetLocation();
		const FVector Ax = (P3 - RefCS[B2].GetLocation()).GetSafeNormal();
		FVector Sum(0.f);
		int32 Cnt = 0;
		for (const FHandSkinPoint& Pt : Skin[Side][5])
		{
			if (Pt.Seg == 2)
			{
				FVector P(0.f);
				for (int32 K = 0; K < Pt.Num; ++K)
				{
					P += RefCS[Pt.Bone[K]].TransformPosition(FVector(Pt.Local[K])) * Pt.Weight[K];
				}
				Sum += P;
				++Cnt;
			}
		}
		if (Cnt > 0)
		{
			FVector Off = Sum / Cnt - P3;
			Off -= Ax * FVector::DotProduct(Off, Ax);
			ThumbPadLocal[Side] = RefCS[B3].InverseTransformVectorNoScale(Off.GetSafeNormal());
		}
	}
	UE_LOG(LogTemp, Display, TEXT("DriverArms: skin for collision: %d vertices (left palm %d, left arm %d, right palm %d, right arm %d)"),
		Total, Skin[0][0].Num(), Skin[0][6].Num(), Skin[1][0].Num(), Skin[1][6].Num());
	if (Total == 0)
	{
		UE_LOG(LogTemp, Warning, TEXT("DriverArms: no CPU skin data; falling back to bone-line contact"));
	}
}

bool ADriverArms::LoadCabin()
{
	Cabin.Reset();
	const FString Path = FPaths::Combine(FPaths::ProjectDir(), TEXT("Data/CabinSDF.bin"));
	TArray<uint8> File;
	if (!FFileHelper::LoadFileToArray(File, *Path) || File.Num() < 44 || FMemory::Memcmp(File.GetData(), "HSDF", 4) != 0)
	{
		UE_LOG(LogTemp, Warning, TEXT("DriverArms: no cabin collision field at %s (only the wheel collides)"), *Path);
		return false;
	}
	auto U32 = [&](int32 At) { uint32 V; FMemory::Memcpy(&V, File.GetData() + At, 4); return V; };
	auto F32 = [&](int32 At) { float V; FMemory::Memcpy(&V, File.GetData() + At, 4); return V; };
	CabinDim = FIntVector((int32)U32(8), (int32)U32(12), (int32)U32(16));
	CabinLo = FVector(F32(20), F32(24), F32(28));
	CabinCell = F32(32);
	CabinUnit = F32(36);
	const int32 Raw = (int32)U32(40), Packed = (int32)U32(44);
	if (Raw != CabinDim.X * CabinDim.Y * CabinDim.Z || 48 + Packed > File.Num())
	{
		UE_LOG(LogTemp, Warning, TEXT("DriverArms: cabin collision field is damaged"));
		return false;
	}
	Cabin.SetNumUninitialized(Raw);
	if (!FCompression::UncompressMemory(NAME_Zlib, Cabin.GetData(), Raw, File.GetData() + 48, Packed))
	{
		Cabin.Reset();
		UE_LOG(LogTemp, Warning, TEXT("DriverArms: could not unpack the cabin collision field"));
		return false;
	}
	UE_LOG(LogTemp, Display, TEXT("DriverArms: cabin collision field %dx%dx%d, %.1f cm cells"), CabinDim.X, CabinDim.Y, CabinDim.Z, CabinCell);
	return true;
}

float ADriverArms::CabinDist(const FVector& P) const
{
	if (Cabin.Num() == 0)
	{
		return 1e3f;
	}
	const FVector G = (P - CabinLo) / CabinCell;
	const int32 X0 = FMath::FloorToInt(G.X), Y0 = FMath::FloorToInt(G.Y), Z0 = FMath::FloorToInt(G.Z);
	if (X0 < 0 || Y0 < 0 || Z0 < 0 || X0 + 1 >= CabinDim.X || Y0 + 1 >= CabinDim.Y || Z0 + 1 >= CabinDim.Z)
	{
		return 1e3f;                                                   // outside the baked box: nothing to hit
	}
	const float Fx = G.X - X0, Fy = G.Y - Y0, Fz = G.Z - Z0;
	auto At = [&](int32 X, int32 Y, int32 Z) { return (float)Cabin[(Z * CabinDim.Y + Y) * CabinDim.X + X]; };
	const float C00 = FMath::Lerp(At(X0, Y0, Z0), At(X0 + 1, Y0, Z0), Fx);
	const float C10 = FMath::Lerp(At(X0, Y0 + 1, Z0), At(X0 + 1, Y0 + 1, Z0), Fx);
	const float C01 = FMath::Lerp(At(X0, Y0, Z0 + 1), At(X0 + 1, Y0, Z0 + 1), Fx);
	const float C11 = FMath::Lerp(At(X0, Y0 + 1, Z0 + 1), At(X0 + 1, Y0 + 1, Z0 + 1), Fx);
	return FMath::Lerp(FMath::Lerp(C00, C10, Fy), FMath::Lerp(C01, C11, Fy), Fz) * CabinUnit;
}

void ADriverArms::ResetArm(int32 Side)
{
	const TArray<FTransform>& RefPose = Mesh->GetSkinnedAsset()->GetRefSkeleton().GetRefBonePose();
	for (int32 B : ArmBones[Side])
	{
		Mesh->BoneSpaceTransforms[B] = RefPose[B];
	}
}

FTransform ADriverArms::CurCS(int32 Bone, TMap<int32, FTransform>& Cache) const
{
	if (const FTransform* Hit = Cache.Find(Bone))
	{
		return *Hit;
	}
	const int32 Pa = Mesh->GetSkinnedAsset()->GetRefSkeleton().GetParentIndex(Bone);
	const FTransform T = Pa == INDEX_NONE ? Mesh->BoneSpaceTransforms[Bone] : Mesh->BoneSpaceTransforms[Bone] * CurCS(Pa, Cache);
	Cache.Add(Bone, T);
	return T;
}

float ADriverArms::CollideDist(const FVector& P) const
{
	// the wheel as modelled (car frame): the rim's oval tube, and the four spokes as rounded bars
	if (GraspDist)
	{
		return GraspDist(P);                     // (making a grip: the handle instead)
	}
	const float Tilt = FMath::DegreesToRadians(WheelTilt);
	const FVector Nw(-FMath::Cos(Tilt), 0.f, FMath::Sin(Tilt));
	const FVector U(0.f, 1.f, 0.f);
	FVector Vw = FVector::CrossProduct(Nw, U);
	if (Vw.Z < 0.f)
	{
		Vw = -Vw;
	}
	const FVector D = P - WheelCentre;
	const float Hn = FVector::DotProduct(D, Nw);
	const float Dr = (D - Nw * Hn).Size() - RimRadius;
	const float A = Dr < 0.f ? RimTubeOval.Y : RimTubeOval.X;
	const float B = RimTubeOval.Z;
	const float Rho = FMath::Sqrt(Dr * Dr + Hn * Hn);
	float Best = -FMath::Min(A, B);
	if (Rho > 1e-3f)
	{
		const float C = Dr / Rho, Sn = Hn / Rho;
		Best = Rho - 1.f / FMath::Sqrt(FMath::Square(C / A) + FMath::Square(Sn / B));
	}
	for (const float Ang : { -8.f, 188.f, 244.f, 296.f })
	{
		const float Ar = FMath::DegreesToRadians(Ang);
		const FVector Dd = U * FMath::Cos(Ar) + Vw * FMath::Sin(Ar);
		const FVector P0 = WheelCentre - Vw * 1.6f + Dd * 8.f - Nw * 1.2f;
		const FVector P1 = WheelCentre + Dd * (RimRadius - 0.6f) - Nw * 1.2f;
		Best = FMath::Min(Best, (float)FMath::PointDistToSegment(P, P0, P1) - 1.5f);
	}
	return FMath::Min(Best, CabinDist(P));                             // and everything else in the cabin
}

float ADriverArms::SkinMinDist(int32 Side, int32 Part, int32 FromSeg, int32 ToSeg) const
{
	TMap<int32, FTransform> Cache;
	const FTransform& Rel = Mesh->GetRelativeTransform();
	float M = 1e9f;
	for (const FHandSkinPoint& Pt : Skin[Side][Part])
	{
		if (Pt.Seg < FromSeg || Pt.Seg > ToSeg)
		{
			continue;
		}
		FVector P(0.f);
		for (int32 K = 0; K < Pt.Num; ++K)
		{
			P += CurCS(Pt.Bone[K], Cache).TransformPosition(FVector(Pt.Local[K])) * Pt.Weight[K];
		}
		M = FMath::Min(M, CollideDist(Rel.TransformPosition(P)));
	}
	return M;
}

int32 ADriverArms::SkinInside(int32 Side, float Below, int32 FromPart, int32 ToPart) const
{
	TMap<int32, FTransform> Cache;
	const FTransform& Rel = Mesh->GetRelativeTransform();
	int32 N = 0;
	for (int32 Part = FromPart; Part <= ToPart; ++Part)
	{
		for (const FHandSkinPoint& Pt : Skin[Side][Part])
		{
			FVector P(0.f);
			for (int32 K = 0; K < Pt.Num; ++K)
			{
				P += CurCS(Pt.Bone[K], Cache).TransformPosition(FVector(Pt.Local[K])) * Pt.Weight[K];
			}
			N += CollideDist(Rel.TransformPosition(P)) < Below ? 1 : 0;
		}
	}
	return N;
}

void ADriverArms::CurlFinger(const FString& Finger, const FString& Sx, const FVector& Deg, const FVector& AxisCS, const FVector& PalmCS, bool bWrap)
{
	// Close the finger round the rim: each joint bends toward the palm a little at a time until that finger's skin
	// (from this joint out) meets the rim, then the next joint takes over. The finger wraps the rim, never enters it.
	const FName J[3] = { *FString::Printf(TEXT("%s_01_%s"), *Finger, *Sx), *FString::Printf(TEXT("%s_02_%s"), *Finger, *Sx),
		*FString::Printf(TEXT("%s_03_%s"), *Finger, *Sx) };
	for (const FName& B : J)
	{
		if (Mesh->GetBoneIndex(B) == INDEX_NONE)
		{
			return;
		}
	}
	const int32 Side = Sx == TEXT("l") ? 0 : 1;
	const int32 Part = Finger == TEXT("index") ? 1 : Finger == TEXT("middle") ? 2 : Finger == TEXT("ring") ? 3 : 4;
	const bool bSkin = Skin[Side][Part].Num() > 0;
	auto Tip = [&]() { const FVector A = BoneCS(J[1]).GetLocation(), Bp = BoneCS(J[2]).GetLocation(); return Bp + (Bp - A) * 0.85f; };
	auto Gap = [&](int From)
	{
		if (bSkin)
		{
			return SkinMinDist(Side, Part, From);
		}
		float M = 1e9f;                                   // no skin data: bone line less a finger's radius
		for (int m = From; m < 3; ++m)
		{
			const FVector A = BoneCS(J[m]).GetLocation();
			const FVector Bp = (m < 2) ? BoneCS(J[m + 1]).GetLocation() : Tip();
			for (float t : { 0.35f, 0.7f, 1.0f })
			{
				M = FMath::Min(M, RimDistCS(FMath::Lerp(A, Bp, t)) - 0.9f);
			}
		}
		return M;
	};
	const float Step = FMath::DegreesToRadians(1.f);
	const float Max[3] = { FMath::DegreesToRadians((float)Deg.X), FMath::DegreesToRadians((float)Deg.Y), FMath::DegreesToRadians((float)Deg.Z) };
	// which way each joint bends toward the palm
	float Sign[3];
	for (int k = 0; k < 3; ++k)
	{
		const FVector Child = (k < 2) ? BoneCS(J[k + 1]).GetLocation() : Tip();
		const FVector V = Child - BoneCS(J[k]).GetLocation();
		Sign[k] = FVector::DotProduct(FQuat(AxisCS, 0.2f).RotateVector(V) - V, PalmCS) >= 0.f ? 1.f : -1.f;
	}
	float Done[3] = { 0.f, 0.f, 0.f };
	auto Turn = [&](int k, float A)
	{
		A = FMath::Clamp(A, -Done[k], Max[k] - Done[k]);
		if (A != 0.f)
		{
			SetBoneCS(J[k], FQuat(AxisCS, Sign[k] * A) * BoneCS(J[k]).GetRotation());
			Done[k] += A;
		}
	};
	// A real fist closes all three joints together (about 1 : 1.4 : 0.5, from photos of hands at 10 and 2); a
	// joint-by-joint cascade leaves fingers lying straight along the rim. Close together until the finger's skin
	// meets the rim, then let the middle and end joints settle round it.
	const float Ratio[3] = { 1.f, 1.4f, 0.5f };
	for (int Open = 0; Open < 30 && Gap(0) < SkinAllow; ++Open)
	{
		SetBoneCS(J[0], FQuat(AxisCS, -Sign[0] * Step) * BoneCS(J[0]).GetRotation());
	}
	if (Gap(0) >= SkinAllow)
	{
		for (int It = 0; It < 120; ++It)
		{
			const float Before[3] = { Done[0], Done[1], Done[2] };
			for (int k = 0; k < 3; ++k)
			{
				Turn(k, Step * Ratio[k]);
			}
			if (Done[0] == Before[0] && Done[1] == Before[1] && Done[2] == Before[2])
			{
				break;                                         // every joint at its limit
			}
			if (Gap(0) < SkinAllow)
			{
				for (int k = 2; k >= 0; --k)
				{
					Turn(k, Before[k] - Done[k]);              // that step went in: take it back
				}
				break;
			}
		}
	}
	// (bWrap: each of the middle and end joints keeps bending until its own part of the finger, from that joint out, meets
	// the rim; a first segment already lying on the rim no longer stops the rest closing round it)
	for (int k = 1; k < 3; ++k)
	{
		for (int It = 0; It < 90; ++It)
		{
			const float Before = Done[k];
			Turn(k, Step);
			if (Done[k] == Before)
			{
				break;
			}
			if (Gap(bWrap ? k : 0) < SkinAllow)
			{
				Turn(k, Before - Done[k]);
				break;
			}
		}
	}
}

void ADriverArms::BendToRim(int32 Side, FName Bone, FName TipFrom, FName TipTo, float MaxDeg)
{
	// bend a thumb joint toward the rim until the thumb's skin touches (axis: across the thumb, toward the rim)
	if (Mesh->GetBoneIndex(Bone) == INDEX_NONE || Mesh->GetBoneIndex(TipFrom) == INDEX_NONE || Mesh->GetBoneIndex(TipTo) == INDEX_NONE)
	{
		return;
	}
	const bool bSkin = Skin[Side][5].Num() > 0;
	const float Step = FMath::DegreesToRadians(1.5f);
	float Done = 0.f;
	while (Done < FMath::DegreesToRadians(MaxDeg))
	{
		const FTransform T = BoneCS(Bone);
		const FVector A = BoneCS(TipFrom).GetLocation(), C = BoneCS(TipTo).GetLocation();
		const FVector TipP = C + (C - A) * 0.9f;
		// toward the rim: numeric gradient of the rim distance at the tip
		const float e = 0.3f;
		const FVector G(RimDistCS(TipP + FVector(e, 0, 0)) - RimDistCS(TipP - FVector(e, 0, 0)),
			RimDistCS(TipP + FVector(0, e, 0)) - RimDistCS(TipP - FVector(0, e, 0)),
			RimDistCS(TipP + FVector(0, 0, e)) - RimDistCS(TipP - FVector(0, 0, e)));
		const FVector Dir = (TipP - T.GetLocation()).GetSafeNormal();
		const FVector Axis = FVector::CrossProduct(Dir, -G.GetSafeNormal()).GetSafeNormal();
		if (Axis.IsNearlyZero())
		{
			break;
		}
		SetBoneCS(Bone, FQuat(Axis, Step) * T.GetRotation());
		const float Gp = bSkin ? SkinMinDist(Side, 5) : FMath::Min(RimDistCS(TipP), RimDistCS(C)) - 0.9f;
		if (Gp < SkinAllow)
		{
			SetBoneCS(Bone, T.GetRotation());                // touching: keep the last pose that was clear
			break;
		}
		Done += Step;
	}
}

void ADriverArms::PoseArm(bool bLeft, const FHandGrip& G)
{
	const FString Sx = bLeft ? TEXT("l") : TEXT("r");
	auto N = [&](const TCHAR* Base) { return FName(*FString::Printf(TEXT("%s_%s"), Base, *Sx)); };
	if (Mesh->GetBoneIndex(N(TEXT("hand"))) == INDEX_NONE)
	{
		return;
	}
	const FTransform& MeshRel = Mesh->GetRelativeTransform();

	// ---- the hand's own frame in the reference pose (component space): fingers, knuckle row, palm
	const FVector HandRef = BoneCS(N(TEXT("hand"))).GetLocation();
	const FVector Mid1 = BoneCS(N(TEXT("middle_01"))).GetLocation();
	const FVector Idx1 = BoneCS(N(TEXT("index_01"))).GetLocation();
	const FVector Pnk1 = BoneCS(N(TEXT("pinky_01"))).GetLocation();
	const FVector Mid3 = BoneCS(N(TEXT("middle_03"))).GetLocation();
	const float LMeta = FVector::Dist(HandRef, Mid1);
	FVector fR = (Mid1 - HandRef).GetSafeNormal();
	FVector sR = (Pnk1 - Idx1);
	sR = (sR - fR * FVector::DotProduct(sR, fR)).GetSafeNormal();
	FVector pR = FVector::CrossProduct(fR, sR);
	// the relaxed fingers bend a little toward the palm: that tells which side the palm is
	FVector Bend = (Mid3 - Mid1);
	Bend -= fR * FVector::DotProduct(Bend, fR);
	const float H = FVector::DotProduct(Bend, pR) >= 0.f ? 1.f : -1.f;
	pR *= H;

	// ---- the grip on the rim, in the car frame
	const float Tilt = FMath::DegreesToRadians(WheelTilt);
	const FVector Nw(-FMath::Cos(Tilt), 0.f, FMath::Sin(Tilt));   // faces the driver
	const FVector U(0.f, 1.f, 0.f);
	FVector Vw = FVector::CrossProduct(Nw, U);
	if (Vw.Z < 0.f)
	{
		Vw = -Vw;                                                       // twelve o'clock
	}
	const float Al = FMath::DegreesToRadians(G.Clock + Steer);
	const FVector Rad = Vw * FMath::Cos(Al) + U * FMath::Sin(Al);
	const FVector Grip = WheelCentre + Rad * RimRadius;
	const FVector T12 = bLeft ? (-Vw * FMath::Sin(Al) + U * FMath::Cos(Al)) : (Vw * FMath::Sin(Al) - U * FMath::Cos(Al));
	const float Ba = FMath::DegreesToRadians(G.BackAngle);
	// ---- the game eye's screen (the driver's camera: at the eye, looking ahead and 8 degrees down)
	const FVector Eye(0.f, 0.f, 118.f);
	const float Pitch = FMath::DegreesToRadians(8.f);
	const FVector CamF(FMath::Cos(Pitch), 0.f, -FMath::Sin(Pitch)), CamR(0.f, 1.f, 0.f), CamU(FMath::Sin(Pitch), 0.f, FMath::Cos(Pitch));
	auto Screen = [&](const FVector& P) { const FVector D = P - Eye; const float Z = FMath::Max(1.f, (float)FVector::DotProduct(D, CamF));
		return FVector2D(FVector::DotProduct(D, CamR) / Z, FVector::DotProduct(D, CamU) / Z); };
	auto ScreenAngle = [&](const FVector& A, const FVector& B) { const FVector2D D = Screen(B) - Screen(A);
		return FMath::RadiansToDegrees(FMath::Atan2(D.Y, D.X)); };
	// The hand's frame for a turn on the rim (about the back-of-hand axis, toward twelve), then rolled so the back of
	// the hand shows more to the eye. The turn is chosen so the knuckle row lies along the rim AS THE DRIVER SEES IT
	// (photos of 10 and 2: within 15 degrees), staying near the authored turn.
	FVector Back, S, P, F;
	auto Frame = [&](float YawDeg)
	{
		Back = (Rad * FMath::Cos(Ba) + Nw * FMath::Sin(Ba)).GetSafeNormal();
		S = -T12;
		S = (S - Back * FVector::DotProduct(S, Back)).GetSafeNormal();
		P = -Back;
		F = (FVector::CrossProduct(S, P) * H).GetSafeNormal();
		const float Toward12 = FVector::DotProduct(FQuat(Back, 0.17f).RotateVector(F), T12) >= FVector::DotProduct(F, T12) ? 1.f : -1.f;
		const FQuat Qy(Back, Toward12 * FMath::DegreesToRadians(YawDeg));
		F = Qy.RotateVector(F);
		S = Qy.RotateVector(S);
		const FVector E = (Eye - Grip).GetSafeNormal();
		float Rr = FMath::DegreesToRadians(G.Roll);
		if (FVector::DotProduct(FQuat(F, Rr).RotateVector(Back), E) < FVector::DotProduct(Back, E))
		{
			Rr = -Rr;
		}
		const FQuat Qr(F, Rr);
		S = Qr.RotateVector(S);
		Back = Qr.RotateVector(Back);
		P = -Back;
	};
	auto RowErr = [&]()
	{
		float R = FMath::Fmod(FMath::Abs(ScreenAngle(Grip, Grip + S) - ScreenAngle(Grip - T12, Grip + T12)), 180.f);
		return FMath::Min(R, 180.f - R);
	};
	float Yaw = G.Yaw, BestRow = 1e9f;
	for (int32 Yd = -20; Yd <= 90; Yd += 2)
	{
		Frame((float)Yd);
		const float E = RowErr() + 0.15f * FMath::Abs((float)Yd - G.Yaw);
		if (E < BestRow)
		{
			BestRow = E;
			Yaw = (float)Yd;
		}
	}
	Frame(Yaw);
	UE_LOG(LogTemp, Display, TEXT("DriverArms: %s hand turned %.0f degrees on the rim (knuckle row %.0f degrees off the rim on screen)"),
		bLeft ? TEXT("l") : TEXT("r"), Yaw, RowErr());
	// photos of 10 and 2: the left forearm slants in low from outside (about 40 degrees from horizontal on screen),
	// the right rises steeply (about 75)
	// (the owner's winter-driver photo: the left forearm about 60 degrees; the right about 70, from the other side)
	const float ForearmTarget = bLeft ? 58.f : 180.f - 70.f;

	// ---- place the arm so the knuckle row is at a point: two-bone IK (shoulder, elbow, wrist; car frame), then the
	// hand's reference frame turned onto the grip frame. Starts from the reference pose each time.
	const int32 Side = bLeft ? 0 : 1;
	float Dist = 0.f, Reach = 0.f, Swivel = 0.f;
	FVector Elbow, WristReached;
	auto PoseHand = [&](const FVector& Knuckles)
	{
		ResetArm(Side);
		const FVector Wrist = Knuckles - F * LMeta;
		const FVector Sh = MeshRel.TransformPosition(BoneCS(N(TEXT("upperarm"))).GetLocation());
		const FVector El0 = MeshRel.TransformPosition(BoneCS(N(TEXT("lowerarm"))).GetLocation());
		const float L1 = FVector::Dist(Sh, El0);
		const float L2 = FVector::Dist(El0, MeshRel.TransformPosition(HandRef));
		Reach = L1 + L2;
		const FVector D = Wrist - Sh;
		Dist = D.Size();
		const FVector Dir = D / Dist;
		if (Dist > Reach * 0.995f)
		{
			UE_LOG(LogTemp, Warning, TEXT("DriverArms: %s wrist out of reach by %.1f cm"), *Sx, Dist - Reach);
			Dist = Reach * 0.995f;
		}
		const float A = (L1 * L1 - L2 * L2 + Dist * Dist) / (2.f * Dist);
		const float Hh = FMath::Sqrt(FMath::Max(0.f, L1 * L1 - A * A));
		FVector Pole(0.f, (bLeft ? -1.f : 1.f) * G.ElbowPole.X, G.ElbowPole.Y);
		Pole = (Pole - Dir * FVector::DotProduct(Pole, Dir)).GetSafeNormal();
		Pole = FQuat(Dir, Swivel).RotateVector(Pole);                 // swung clear of the cabin if needed
		Elbow = Sh + Dir * A + Pole * Hh;
		WristReached = Sh + Dir * Dist;
		auto Aim = [&](FName Bone, FName Child, const FVector& TargetCar)
		{
			const FTransform Tb = BoneCS(Bone);
			const FVector Cur = (BoneCS(Child).GetLocation() - Tb.GetLocation()).GetSafeNormal();
			const FVector Want = (ToCS(TargetCar) - Tb.GetLocation()).GetSafeNormal();
			SetBoneCS(Bone, FQuat::FindBetweenNormals(Cur, Want) * Tb.GetRotation());
		};
		Aim(N(TEXT("upperarm")), N(TEXT("lowerarm")), Elbow);
		Aim(N(TEXT("lowerarm")), N(TEXT("hand")), WristReached);
		const FMatrix MRef(fR, sR, pR, FVector::ZeroVector);
		const FMatrix MTgt(DirToCS(F), DirToCS(S), DirToCS(P), FVector::ZeroVector);
		// (applied to the hand's reference rotation: the frame above was measured in the reference pose)
		SetBoneCS(N(TEXT("hand")), FQuat(MRef.GetTransposed() * MTgt) * RefHandRot[Side]);
	};

	// The rim lies across the base of the fingers, just past the knuckles. With the hand's skin: lift the hand off the
	// rim (along the back of the hand) until the palm and the finger bases rest on it, touching but not inside.
	// Without skin data: the measured offsets.
	const bool bSkin = Skin[Side][0].Num() > 0;
	const float Ahead = bSkin ? -1.6f : 2.4f;      // knuckles 1.6 cm past the rim (photos: the hand sits over the rim)
	float Lift = 2.6f;

	// ---- The grip, searched against the 10-and-2 photo targets (2d/tools/b3d/LESSONS.md, measured from photos of
	// hands on a wheel, seen from the driver's eye):
	//   the knuckle row lies along the rim ON SCREEN (within ~15 degrees; in 3D the hand may be turned well off it);
	//   the back of the hand faces the eye (within ~35-40 degrees);
	//   the wrist bends only a little (the hand carries on from the forearm; ~25 at most);
	//   the left forearm slants in low from outside (~40 degrees on screen), the right rises steeply (~75);
	//   the rim crosses the fingers (it runs diagonally through the hand, never along the fingers);
	//   the elbow stays below the shoulder.
	// The hand's orientation (tilt of the back toward the driver, turn on the rim, roll) and the elbow's swing are
	// searched together with plain geometry, then the best candidates are checked with the skin: the arm must clear
	// the cabin.
	ResetArm(Side);
	const FVector ShoulderCar = MeshRel.TransformPosition(BoneCS(N(TEXT("upperarm"))).GetLocation());
	const float L1 = FVector::Dist(ShoulderCar, MeshRel.TransformPosition(BoneCS(N(TEXT("lowerarm"))).GetLocation()));
	const float L2 = FVector::Dist(MeshRel.TransformPosition(BoneCS(N(TEXT("lowerarm"))).GetLocation()), MeshRel.TransformPosition(HandRef));
	const float LiftGuess = 4.2f;
	auto Orient = [&](float BaDeg, float YawDeg, float RollDeg, FVector& oF, FVector& oS, FVector& oP, FVector& oBack)
	{
		const float BaR = FMath::DegreesToRadians(BaDeg);
		oBack = (Rad * FMath::Cos(BaR) + Nw * FMath::Sin(BaR)).GetSafeNormal();
		oS = -T12;
		oS = (oS - oBack * FVector::DotProduct(oS, oBack)).GetSafeNormal();
		oP = -oBack;
		oF = (FVector::CrossProduct(oS, oP) * H).GetSafeNormal();
		const float Toward12 = FVector::DotProduct(FQuat(oBack, 0.17f).RotateVector(oF), T12) >= FVector::DotProduct(oF, T12) ? 1.f : -1.f;
		const FQuat Qy(oBack, Toward12 * FMath::DegreesToRadians(YawDeg));
		oF = Qy.RotateVector(oF);
		oS = Qy.RotateVector(oS);
		const FVector Ev = (Eye - Grip).GetSafeNormal();
		const float Toward = FVector::DotProduct(FQuat(oF, 0.17f).RotateVector(oBack), Ev) >= FVector::DotProduct(oBack, Ev) ? 1.f : -1.f;
		const FQuat Qr(oF, Toward * FMath::DegreesToRadians(RollDeg));
		oS = Qr.RotateVector(oS);
		oBack = Qr.RotateVector(oBack);
		oP = -oBack;
	};
	auto ElbowFor = [&](const FVector& Wrist, float SwivelR)
	{
		const FVector D = Wrist - ShoulderCar;
		float Dd = FMath::Min((float)D.Size(), (L1 + L2) * 0.995f);
		const FVector Dir = D.GetSafeNormal();
		const float A = (L1 * L1 - L2 * L2 + Dd * Dd) / (2.f * Dd);
		const float Hh = FMath::Sqrt(FMath::Max(0.f, L1 * L1 - A * A));
		FVector Pole(0.f, (bLeft ? -1.f : 1.f) * G.ElbowPole.X, G.ElbowPole.Y);
		Pole = (Pole - Dir * FVector::DotProduct(Pole, Dir)).GetSafeNormal();
		Pole = FQuat(Dir, SwivelR).RotateVector(Pole);
		return ShoulderCar + Dir * A + Pole * Hh;
	};
	struct FGripTry { float Ba, Yw, Rl, Sw, Cost; float Row, BackEye, Bend, Fore; };
	auto Judge = [&](float Ba_, float Yw_, float Rl_, float Sw_)
	{
		FGripTry T{ Ba_, Yw_, Rl_, Sw_, 0.f, 0.f, 0.f, 0.f, 0.f };
		FVector Fh, Sh_, Ph, Bk;
		Orient(Ba_, Yw_, Rl_, Fh, Sh_, Ph, Bk);
		const FVector Kn = Grip - Fh * Ahead + Bk * LiftGuess;
		const FVector Wr = Kn - Fh * LMeta;
		if (FVector::Dist(Wr, ShoulderCar) > (L1 + L2) * 0.995f)
		{
			T.Cost = 1e9f;
			return T;
		}
		const FVector El = ElbowFor(Wr, FMath::DegreesToRadians(Sw_));
		float Row = FMath::Fmod(FMath::Abs(ScreenAngle(Kn + Sh_ * 4.f, Kn - Sh_ * 4.f) - ScreenAngle(Grip - T12, Grip + T12)), 180.f);
		T.Row = FMath::Min(Row, 180.f - Row);
		T.BackEye = FMath::RadiansToDegrees(FMath::Acos(FMath::Clamp(FVector::DotProduct(Bk, (Eye - Kn).GetSafeNormal()), -1.f, 1.f)));
		T.Bend = FMath::RadiansToDegrees(FMath::Acos(FMath::Clamp(FVector::DotProduct((Wr - El).GetSafeNormal(), Fh), -1.f, 1.f)));
		T.Fore = ScreenAngle(El, Wr);
		const float Cross = FMath::RadiansToDegrees(FMath::Acos(FMath::Abs(FVector::DotProduct(T12, Fh))));   // rim vs fingers, 90 = across
		float C = 2.f * FMath::Max(0.f, T.Row - 10.f);
		C += 1.5f * FMath::Max(0.f, T.BackEye - 35.f);
		C += 1.f * FMath::Max(0.f, T.Bend - 15.f) + 10.f * FMath::Max(0.f, T.Bend - 32.f);
		C += 1.f * FMath::Abs(T.Fore - ForearmTarget);
		C += 0.6f * FMath::Abs(Cross - 58.f);                           // the rim runs diagonally through the hand
		// the elbow and forearm keep clear of the door and the rest of the cabin (an arm is ~5 cm thick)
		C += 20.f * FMath::Max(0.f, 5.f - CabinDist(El)) + 20.f * FMath::Max(0.f, 4.f - CabinDist((El + Wr) * 0.5f));
		C += 5.f * FMath::Max(0.f, (float)(El.Z - (ShoulderCar.Z - 8.f)));
		C += 0.02f * FMath::Abs(Sw_);
		T.Cost = C;
		return T;
	};
	TArray<FGripTry> Tries;
	for (float Ba_ = 10.f; Ba_ <= 85.f; Ba_ += 7.5f)
	{
		for (float Yw_ = -40.f; Yw_ <= 90.f; Yw_ += 10.f)
		{
			for (float Rl_ = -40.f; Rl_ <= 40.f; Rl_ += 10.f)
			{
				for (float Sw_ = -90.f; Sw_ <= 90.f; Sw_ += 10.f)
				{
					Tries.Add(Judge(Ba_, Yw_, Rl_, Sw_));
				}
			}
		}
	}
	Tries.Sort([](const FGripTry& A, const FGripTry& B) { return A.Cost < B.Cost; });
	// refine the best few on a finer grid
	TArray<FGripTry> Fine;
	for (int32 K = 0; K < FMath::Min(6, Tries.Num()); ++K)
	{
		const FGripTry& T0 = Tries[K];
		for (float dB = -5.f; dB <= 5.f; dB += 2.5f)
			for (float dY = -6.f; dY <= 6.f; dY += 3.f)
				for (float dR = -6.f; dR <= 6.f; dR += 3.f)
					for (float dS = -6.f; dS <= 6.f; dS += 3.f)
					{
						Fine.Add(Judge(T0.Ba + dB, T0.Yw + dY, T0.Rl + dR, T0.Sw + dS));
					}
	}
	Fine.Sort([](const FGripTry& A, const FGripTry& B) { return A.Cost < B.Cost; });
	// the skin decides among the best: the first whose arm clears the cabin
	float ArmGapNow = 1.f;
	FGripTry Chosen = Fine.Num() ? Fine[0] : FGripTry{ G.BackAngle, G.Yaw, G.Roll, 0.f, 0.f, 0.f, 0.f, 0.f, 0.f };
	for (int32 K = 0; K < FMath::Min(25, Fine.Num()); ++K)
	{
		const FGripTry& T = Fine[K];
		Orient(T.Ba, T.Yw, T.Rl, F, S, P, Back);
		Swivel = FMath::DegreesToRadians(T.Sw);
		Lift = LiftGuess;
		PoseHand(Grip - F * Ahead + Back * Lift);
		if (bSkin)
		{
			for (int32 It = 0; It < 12; ++It)
			{
				float Rest = SkinMinDist(Side, 0);
				for (int32 Fg = 1; Fg <= 4; ++Fg)
				{
					Rest = FMath::Min(Rest, SkinMinDist(Side, Fg, 0, 0));
				}
				if (FMath::Abs(Rest - PalmGap) < 0.03f)
				{
					break;
				}
				Lift += PalmGap - Rest;
				PoseHand(Grip - F * Ahead + Back * Lift);
			}
			ArmGapNow = SkinMinDist(Side, 6);
		}
		Chosen = T;
		if (ArmGapNow >= 0.f)
		{
			break;
		}
	}
	UE_LOG(LogTemp, Display, TEXT("DriverArms: %s grip searched: back tilted %.0f, turned %.0f, rolled %.0f, elbow swung %.0f -> knuckle row %.0f off the rim on screen, back %.0f from the eye, wrist bent %.0f, forearm %.0f on screen (photos %.0f); arm %.2f cm clear of the cabin"),
		*Sx, Chosen.Ba, Chosen.Yw, Chosen.Rl, Chosen.Sw, Chosen.Row, Chosen.BackEye, Chosen.Bend, Chosen.Fore, ForearmTarget, ArmGapNow);

	// fingers close round the rim; the thumb lies along the driver face toward twelve
	const FVector KnuckleAxis = DirToCS(S);
	const FVector Palm = DirToCS(P);
	CurlFinger(TEXT("index"), Sx, G.Index, KnuckleAxis, Palm);
	CurlFinger(TEXT("middle"), Sx, G.Middle, KnuckleAxis, Palm);
	CurlFinger(TEXT("ring"), Sx, G.Ring, KnuckleAxis, Palm);
	CurlFinger(TEXT("pinky"), Sx, G.Pinky, KnuckleAxis, Palm);
	// The thumb lies along the rim's driver face, pointing up the rim toward twelve, its pad resting on the leather
	// (not hooked round the inside of the rim): aim it a thumb's length up the rim, roll it pad-down, lower it onto
	// the rim until its skin touches, then let the tip flex onto the rim a little.
	const FName T1 = N(TEXT("thumb_01")), T2 = N(TEXT("thumb_02")), T3 = N(TEXT("thumb_03"));
	if (Mesh->GetBoneIndex(T1) != INDEX_NONE && Mesh->GetBoneIndex(T2) != INDEX_NONE && Mesh->GetBoneIndex(T3) != INDEX_NONE)
	{
		auto TipOf = [&]() { const FVector A2 = BoneCS(T2).GetLocation(), A3 = BoneCS(T3).GetLocation(); return A3 + (A3 - A2) * 0.9f; };
		auto Rotate = [&](FName Bone, const FVector& Axis, float Rad) { SetBoneCS(Bone, FQuat(Axis, Rad) * BoneCS(Bone).GetRotation()); };
		const float Up = bLeft ? 1.f : -1.f;                                // toward twelve along the rim
		// where the thumb's base sits on the rim (angle round the wheel), then a thumb's length (about 6 cm) up the rim
		const FVector Tb = MeshRel.TransformPosition(BoneCS(T1).GetLocation()) - WheelCentre;
		const float AlB = FMath::Atan2((float)FVector::DotProduct(Tb, U), (float)FVector::DotProduct(Tb, Vw));
		const float AlT = AlB + Up * (6.f / RimRadius);
		const FVector Target = WheelCentre + (Vw * FMath::Cos(AlT) + U * FMath::Sin(AlT)) * RimRadius + Nw * (RimTubeOval.Z + 0.9f);
		{
			const FTransform Tt = BoneCS(T1);
			const FVector Cur = (TipOf() - Tt.GetLocation()).GetSafeNormal();
			const FVector Want = (ToCS(Target) - Tt.GetLocation()).GetSafeNormal();
			SetBoneCS(T1, FQuat::FindBetweenNormals(Cur, Want) * Tt.GetRotation());
		}
		const FVector ToRim = DirToCS(-Nw);
		if (!ThumbPadLocal[Side].IsNearlyZero())
		{
			// roll about the thumb's own axis so the pad faces the rim
			const FVector Dir = (TipOf() - BoneCS(T1).GetLocation()).GetSafeNormal();
			FVector Pad = BoneCS(T3).TransformVectorNoScale(ThumbPadLocal[Side]);
			Pad = (Pad - Dir * FVector::DotProduct(Pad, Dir)).GetSafeNormal();
			const FVector Wp = (ToRim - Dir * FVector::DotProduct(ToRim, Dir)).GetSafeNormal();
			float Ang = FMath::Acos(FMath::Clamp(FVector::DotProduct(Pad, Wp), -1.f, 1.f));
			Ang *= FVector::DotProduct(FVector::CrossProduct(Pad, Wp), Dir) >= 0.f ? 1.f : -1.f;
			Rotate(T1, Dir, FMath::Clamp(Ang, -FMath::DegreesToRadians(60.f), FMath::DegreesToRadians(60.f)));
		}
		if (Skin[Side][5].Num() > 0)
		{
			const float Step = FMath::DegreesToRadians(1.0f);
			auto Gap = [&]() { return SkinMinDist(Side, 5, 1); };            // the thumb itself, not the ball of the thumb
			// lower the whole thumb onto the rim's face (or lift it out if it starts inside)
			const FVector Dir = (TipOf() - BoneCS(T1).GetLocation()).GetSafeNormal();
			const FVector Down = FVector::CrossProduct(Dir, ToRim).GetSafeNormal();
			for (int32 It = 0; It < 40 && Gap() < SkinAllow; ++It)
			{
				Rotate(T1, Down, -Step);
			}
			for (int32 It = 0; It < 40; ++It)
			{
				Rotate(T1, Down, Step);
				if (Gap() < SkinAllow)
				{
					Rotate(T1, Down, -Step);
					break;
				}
			}
			// the tip flexes onto the rim (toward the pad), a little at each joint
			for (const FName& J : { T2, T3 })
			{
				const FVector Pad = BoneCS(T3).TransformVectorNoScale(ThumbPadLocal[Side]);
				const FVector Jd = (TipOf() - BoneCS(J).GetLocation()).GetSafeNormal();
				const FVector Flex = FVector::CrossProduct(Jd, Pad.IsNearlyZero() ? ToRim : Pad).GetSafeNormal();
				for (int32 It = 0; It < 18; ++It)
				{
					Rotate(J, Flex, Step);
					if (Gap() < SkinAllow)
					{
						Rotate(J, Flex, -Step);
						break;
					}
				}
			}
		}
		else
		{
			BendToRim(Side, T2, T2, T3, 20.f);
		}
	}
	UE_LOG(LogTemp, Display, TEXT("DriverArms: %s grip %s wrist %s elbow %s (reach %.1f of %.1f), hand lifted %.2f cm"), *Sx,
		*Grip.ToString(), *WristReached.ToString(), *Elbow.ToString(), Dist, Reach, Lift);
	{
		// the 10-and-2 photo targets, measured on screen from the game eye
		const FVector Idx = MeshRel.TransformPosition(BoneCS(N(TEXT("index_01"))).GetLocation());
		const FVector Pnk = MeshRel.TransformPosition(BoneCS(N(TEXT("pinky_01"))).GetLocation());
		float Row = FMath::Abs(ScreenAngle(Pnk, Idx) - ScreenAngle(Grip - T12, Grip + T12));
		Row = FMath::Min(Row, FMath::Abs(360.f - Row));
		Row = FMath::Min(Row, FMath::Abs(180.f - Row));
		const float BackEye = FMath::RadiansToDegrees(FMath::Acos(FMath::Clamp(FVector::DotProduct(Back, (Eye - Grip).GetSafeNormal()), -1.f, 1.f)));
		UE_LOG(LogTemp, Display, TEXT("DriverArms: %s photo targets: knuckle row %.0f degrees off the rim (<15), back of hand %.0f degrees from the eye (<40), forearm %.0f on screen (%.0f)"),
			*Sx, Row, BackEye, ScreenAngle(Elbow, WristReached), ForearmTarget);
	}
	if (bSkin)
	{
		// the collision check: how close each part of the hand's skin is to the wheel (negative: inside)
		UE_LOG(LogTemp, Display, TEXT("DriverArms: %s skin to wheel: palm %.2f index %.2f middle %.2f ring %.2f pinky %.2f thumb %.2f cm; vertices inside >1 mm: %d, >3 mm: %d"),
			*Sx, SkinMinDist(Side, 0), SkinMinDist(Side, 1), SkinMinDist(Side, 2), SkinMinDist(Side, 3), SkinMinDist(Side, 4),
			SkinMinDist(Side, 5), SkinInside(Side, -0.1f), SkinInside(Side, -0.3f));
		UE_LOG(LogTemp, Display, TEXT("DriverArms: %s arm to cabin: %.2f cm; vertices inside >1 mm: %d, >3 mm: %d"), *Sx,
			SkinMinDist(Side, 6), SkinInside(Side, -0.1f, 6, 6), SkinInside(Side, -0.3f, 6, 6));
	}
}

void ADriverArms::BeginPlay()
{
	Super::BeginPlay();
	if (Body)
	{
		Mesh->SetSkinnedAssetAndUpdate(Body);
		// the clothes over it, following its every bone
		Clothes->SetSkeletalMeshAsset(Body);
		Clothes->SetLeaderPoseComponent(Mesh);
		if (UMaterialInterface* Cloth = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Materials/Blockout/M_DriverClothes.M_DriverClothes")))
		{
			ClothesMID = UMaterialInstanceDynamic::Create(Cloth, this);
			for (int32 i = 0; i < Clothes->GetNumMaterials(); ++i)
			{
				Clothes->SetMaterial(i, ClothesMID);
			}
		}
		ApplyOutfit();
		// the rig on the hidden body (its controls' rest offsets from their bones taken now)
		ArmAnim = LoadObject<UAnimSequence>(nullptr, TEXT("/Game/HollowAcre/Wake/Anim/A_WakePickup.A_WakePickup"));
		if (UClass* RigClass = LoadClass<UControlRig>(nullptr, TEXT("/MetaHumanCharacter/Common/MetaHuman_ControlRig.MetaHuman_ControlRig_C")))
		{
			RigBody->SetSkeletalMeshAsset(Body);
			ArmRig->SetControlRigClass(RigClass);
			ArmRig->AddMappedCompleteSkeletalMesh(RigBody, EControlRigComponentMapDirection::Output);
			ArmRig->SetBoneInitialTransformsFromSkeletalMesh(Body);
			ArmRig->Initialize();
			ArmRig->Update(0.f);
			for (int32 Side = 0; Side < 2; ++Side)
			{
				const TCHAR* Sx = Side == 0 ? TEXT("l") : TEXT("r");
				const FTransform BoneRest = ArmRig->GetInitialBoneTransform(FName(*FString::Printf(TEXT("hand_%s"), Sx)), EControlRigComponentSpace::RigSpace);
				const FTransform CtrlRest = ArmRig->GetControlTransform(FName(*FString::Printf(TEXT("hand_%s_ik_ctrl"), Sx)), EControlRigComponentSpace::RigSpace);
				RigCtrlOffset[Side] = CtrlRest * BoneRest.Inverse();
			}
			bRigReady = ArmRig->GetControlRig() != nullptr;
			UE_LOG(LogTemp, Display, TEXT("DriverArms: MetaHuman Control Rig %s (right hand control's offset from its bone: %s)"),
				bRigReady ? TEXT("ready") : TEXT("FAILED"), *RigCtrlOffset[1].ToString());
		}
		UE_LOG(LogTemp, Display, TEXT("DriverArms: dressed (%s)"), ClothesMID ? *OutfitName : TEXT("no clothes material"));
		// (checking: -wakenoclothes / -wakenoskin draw only one of the two layers)
		if (FParse::Param(FCommandLine::Get(), TEXT("wakenoclothes")))
		{
			Clothes->SetVisibility(false);
		}
		if (FParse::Param(FCommandLine::Get(), TEXT("wakenoskin")))
		{
			Mesh->SetVisibility(false, false);
		}
	}
	LoadCabin();
	GatherSkin();
	Place();
	// remember each hand's reference rotation (component space) before anything moves
	RefHandRot[0] = BoneCS(TEXT("hand_l")).GetRotation();
	RefHandRot[1] = BoneCS(TEXT("hand_r")).GetRotation();
	bPlaced = true;
}

void ADriverArms::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	if (!bPlaced)
	{
		return;
	}
	if (!bGripReady)
	{
		// the full grip solve (photo targets, skin collision), once, with the wheel straight
		const float Want = Steer;
		Steer = 0.f;
		Place();
		PoseArm(true, Left);
		PoseArm(false, Right);
		Steer = Want;
		SnapshotGrip();
		bGripReady = true;
		LastSteer = 1e9f;
		MakeShapes();
	}
	if (!bKeysLeft)
	{
		MakeKey();
	}
	if (KeyPivot && !bKeysLeft)
	{
		// the key turned in its lock
		KeyPivot->SetRelativeRotation(FQuat(KeyAxis.GetSafeNormal(), -FMath::DegreesToRadians(KeyTurn)) * KeyBase);
	}
	if (KeyDangle && !bKeysLeft)
	{
		// the bunch on its ring, hanging from the key's head: a pendulum in the car's frame (gravity, less the car's own
		// jolts and braking), swinging as the key is turned; kept off the dash behind it
		const float Dt = FMath::Clamp(DeltaSeconds, 1e-4f, 1.f / 30.f);
		const FTransform Car = GetActorTransform();
		const FVector CarVel = (Car.GetLocation() - CarPrevLoc) / Dt;
		FVector CarAcc = bDangle ? (CarVel - CarPrevVel) / Dt : FVector::ZeroVector;
		CarAcc = CarAcc.GetClampedToMaxSize(1500.f);
		CarPrevLoc = Car.GetLocation();
		CarPrevVel = CarVel;
		const FVector P = Car.InverseTransformPosition(KeyDangle->GetComponentLocation());
		const FVector G = Car.InverseTransformVectorNoScale(FVector(0.f, 0.f, -980.f) - CarAcc);
		const float L = 3.2f;
		if (!bDangle)
		{
			DangleBob = DanglePrev = P - FVector(0.f, 0.f, L);
			bDangle = true;
		}
		const FVector Step = (DangleBob - DanglePrev) * FMath::Exp(-1.4f * Dt);
		DanglePrev = DangleBob;
		DangleBob = DangleBob + Step + G * Dt * Dt;
		DangleBob = P + (DangleBob - P).GetSafeNormal() * L;
		if (DangleBob.X > 74.3f)
		{
			DangleBob.X = 74.3f;                                   // (against the dash)
			DangleBob = P + (DangleBob - P).GetSafeNormal() * L;
		}
		const FVector Down = Car.TransformVectorNoScale((DangleBob - P).GetSafeNormal());
		const FVector KeyY = KeyPivot->GetComponentQuat().GetAxisY();
		KeyDangle->SetWorldRotation(FRotationMatrix::MakeFromZY(-Down, KeyY).ToQuat());
	}
	if (bFree)
	{
		// the body out of the seat (the wake): wherever the director puts it, every frame
		FreeFollow();
		Mesh->MarkRefreshTransformDirty();
		return;
	}
	if (FMath::IsNearlyEqual(Steer, LastSteer, 0.01f) && FMath::IsNearlyEqual(KeyReach, LastKeyReach, 0.0005f) && FMath::IsNearlyEqual(KeyTurn, LastKeyTurn, 0.01f))
	{
		return;
	}
	LastSteer = Steer;
	LastKeyReach = KeyReach;
	LastKeyTurn = KeyTurn;
	FollowWheel();
	Mesh->MarkRefreshTransformDirty();
}

void ADriverArms::MakeKey()
{
	if (KeyPivot)
	{
		return;
	}
	{
		// the car's own keys (tools/blender/make_keys.py, Scripts/import_keys.py): the Volvo's key in its chrome lock collar
		// in the lower dash right of the column, a split ring through its head, a brass house key and a worn leather tag on
		// the ring, hanging and swinging (Tick)
		const TCHAR* Dir = TEXT("/Game/HollowAcre/Car/Keys/");
		auto Load = [Dir](const TCHAR* N) { return LoadObject<UStaticMesh>(nullptr, *FString::Printf(TEXT("%s%s.%s"), Dir, N, N)); };
		UStaticMesh* MKey = Load(TEXT("Key_Ignition"));
		UStaticMesh* MLock = Load(TEXT("Key_Lock"));
		UStaticMesh* MRing = Load(TEXT("Key_Ring"));
		UStaticMesh* MSpare = Load(TEXT("Key_Spare"));
		UStaticMesh* MTag = Load(TEXT("Key_Tag"));
		UMaterialInterface* KeyMat = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Car/Keys/M_KeyPart.M_KeyPart"));
		if (MKey && MLock && MRing && MSpare && MTag && KeyMat)
		{
			const FVector Ax = KeyAxis.GetSafeNormal();
			KeyBase = FRotationMatrix::MakeFromXZ(Ax, FVector::UpVector).ToQuat();       // (its head standing up)
			KeyPivot = NewObject<USceneComponent>(this, TEXT("KeyPivot"));
			KeyPivot->SetupAttachment(RootComponent);
			KeyPivot->SetRelativeLocationAndRotation(KeyAt - Ax * 2.05f, KeyBase);   // (the lock's face: the head's middle at KeyAt)
			KeyPivot->RegisterComponent();
			auto Piece = [&](USceneComponent* Parent, UStaticMesh* M, const FVector& At, const FQuat& Rot, const TCHAR* Name)
			{
				UStaticMeshComponent* C = NewObject<UStaticMeshComponent>(this, Name);
				C->SetStaticMesh(M);
				C->SetupAttachment(Parent);
				C->SetRelativeLocationAndRotation(At, Rot);
				C->SetCollisionEnabled(ECollisionEnabled::NoCollision);
				C->SetCastShadow(true);
				C->RegisterComponent();
				return C;
			};
			auto Paint = [&](UStaticMeshComponent* C, const TCHAR* Slot, const FLinearColor& Col, float Metal, float Rough)
			{
				const int32 i = C->GetMaterialIndex(FName(Slot));
				if (i != INDEX_NONE)
				{
					UMaterialInstanceDynamic* Mi = UMaterialInstanceDynamic::Create(KeyMat, C);
					Mi->SetVectorParameterValue(TEXT("Color"), Col);
					Mi->SetScalarParameterValue(TEXT("Metallic"), Metal);
					Mi->SetScalarParameterValue(TEXT("Roughness"), Rough);
					C->SetMaterial(i, Mi);
				}
			};
			const FLinearColor Steel(0.56f, 0.56f, 0.58f), Chrome(0.72f, 0.72f, 0.74f);
			UStaticMeshComponent* Lock = Piece(RootComponent, MLock, KeyAt - Ax * 2.05f, KeyBase, TEXT("KeyLock"));
			Paint(Lock, TEXT("chrome"), Chrome, 1.f, 0.16f);
			Paint(Lock, TEXT("dark"), FLinearColor(0.01f, 0.01f, 0.01f), 0.f, 0.6f);
			UStaticMeshComponent* Key = Piece(KeyPivot, MKey, FVector::ZeroVector, FQuat::Identity, TEXT("KeyHead"));
			Paint(Key, TEXT("plastic"), FLinearColor(0.016f, 0.016f, 0.018f), 0.f, 0.42f);
			Paint(Key, TEXT("steel"), Steel, 1.f, 0.3f);
			KeyDangle = NewObject<USceneComponent>(this, TEXT("KeyDangle"));
			KeyDangle->SetupAttachment(KeyPivot);
			KeyDangle->SetRelativeLocation(FVector(3.f, 0.f, 0.15f));                // (the ring's hole in the key's head)
			KeyDangle->RegisterComponent();
			Paint(Piece(KeyDangle, MRing, FVector::ZeroVector, FQuat::Identity, TEXT("KeyRing")), TEXT("steel"), Steel, 1.f, 0.28f);
			const float R = 1.15f;
			auto OnRing = [R](float Phi) { return FVector(0.f, R * FMath::Sin(Phi), -R - R * FMath::Cos(Phi)); };
			Paint(Piece(KeyDangle, MSpare, OnRing(-0.45f), FQuat(FVector::ForwardVector, -0.2f), TEXT("KeySpare")), TEXT("brass"),
				FLinearColor(0.7f, 0.5f, 0.23f), 1.f, 0.36f);
			UStaticMeshComponent* Tag = Piece(KeyDangle, MTag, OnRing(0.5f), FQuat(FVector::ForwardVector, 0.22f), TEXT("KeyTag"));
			Paint(Tag, TEXT("leather"), FLinearColor(0.1f, 0.06f, 0.035f), 0.f, 0.78f);
			Paint(Tag, TEXT("steel"), Steel, 1.f, 0.3f);
			UPointLightComponent* Glow = NewObject<UPointLightComponent>(this, TEXT("KeyGlow"));
			Glow->SetupAttachment(RootComponent);
			Glow->SetRelativeLocation(KeyAt + FVector(-4.f, -9.f, 12.f));       // (from the instruments, up and left of it)
			Glow->SetIntensityUnits(ELightUnits::Candelas);
			Glow->SetIntensity(KeyGlowCd);
			Glow->SetLightColor(FLinearColor(0.6f, 0.78f, 1.f));
			Glow->SetAttenuationRadius(40.f);
			Glow->SetCastShadows(false);
			Glow->RegisterComponent();
			UE_LOG(LogTemp, Display, TEXT("DriverArms: the car's keys at %s (modelled)"), *KeyAt.ToString());
			return;
		}
		UE_LOG(LogTemp, Warning, TEXT("DriverArms: the modelled keys are missing (Scripts/import_keys.py); simple shapes instead"));
	}
	UStaticMesh* Cube = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Cube.Cube"));
	UStaticMesh* Cyl = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Cylinder.Cylinder"));
	UMaterialInterface* Base = LoadObject<UMaterialInterface>(nullptr, TEXT("/Engine/BasicShapes/BasicShapeMaterial.BasicShapeMaterial"));
	if (!Cube || !Cyl)
	{
		return;
	}
	// in its lock in the lower dash, right of the column: a chrome bezel, the key's shank and its black head standing up,
	// its ring and a worn fob hanging under it. Built along the key's own axis (local X: out of the lock toward the driver)
	const FVector Ax = KeyAxis.GetSafeNormal();
	KeyBase = FQuat::FindBetweenNormals(FVector::ForwardVector, Ax);
	KeyPivot = NewObject<USceneComponent>(this, TEXT("KeyPivot"));
	KeyPivot->SetupAttachment(RootComponent);
	KeyPivot->SetRelativeLocationAndRotation(KeyAt - Ax * 3.f, KeyBase);
	KeyPivot->RegisterComponent();
	auto Part = [&](USceneComponent* Parent, UStaticMesh* M, const FVector& At, const FQuat& Rot, const FVector& SizeCm, const FLinearColor& Col, const TCHAR* Name)
	{
		UStaticMeshComponent* C = NewObject<UStaticMeshComponent>(this, Name);
		C->SetStaticMesh(M);
		C->SetupAttachment(Parent);
		C->SetRelativeLocationAndRotation(At, Rot);
		C->SetRelativeScale3D(SizeCm / 100.f);
		C->SetCollisionEnabled(ECollisionEnabled::NoCollision);
		C->SetCastShadow(true);
		if (Base)
		{
			UMaterialInstanceDynamic* Mi = UMaterialInstanceDynamic::Create(Base, C);
			Mi->SetVectorParameterValue(TEXT("Color"), Col);
			C->SetMaterial(0, Mi);
		}
		C->RegisterComponent();
		return C;
	};
	const FQuat AlongAx = FQuat::FindBetweenNormals(FVector::UpVector, Ax);     // (a cylinder's length along the key's axis)
	Part(RootComponent, Cyl, KeyAt - Ax * 3.4f, AlongAx, FVector(2.9f, 2.9f, 0.8f), FLinearColor(0.55f, 0.56f, 0.58f), TEXT("KeyBezel"));
	// (in the key's frame: X along it, out of the lock; Y across its flat; Z up its head)
	Part(KeyPivot, Cube, FVector(1.0f, 0.f, 0.f), FQuat::Identity, FVector(2.0f, 0.35f, 0.9f), FLinearColor(0.6f, 0.6f, 0.62f), TEXT("KeyShank"));
	Part(KeyPivot, Cube, FVector(3.4f, 0.f, 0.f), FQuat::Identity, FVector(2.6f, 0.45f, 2.5f), FLinearColor(0.02f, 0.02f, 0.022f), TEXT("KeyHead"));
	Part(KeyPivot, Cyl, FVector(4.2f, 0.f, -1.9f), FQuat(FVector::RightVector, HALF_PI), FVector(1.6f, 1.6f, 0.25f), FLinearColor(0.5f, 0.5f, 0.52f), TEXT("KeyRing"));
	Part(KeyPivot, Cube, FVector(4.4f, 0.f, -4.6f), FQuat::Identity, FVector(2.6f, 1.1f, 3.6f), FLinearColor(0.09f, 0.07f, 0.06f), TEXT("KeyFob"));
	UE_LOG(LogTemp, Display, TEXT("DriverArms: the ignition key at %s"), *KeyAt.ToString());
}

void ADriverArms::SnapshotGrip()
{
	GripPose = Mesh->BoneSpaceTransforms;
	const FTransform& MeshRel = Mesh->GetRelativeTransform();
	for (int32 Side = 0; Side < 2; ++Side)
	{
		const TCHAR* Sx = Side == 0 ? TEXT("l") : TEXT("r");
		const FName Hand(*FString::Printf(TEXT("hand_%s"), Sx)), Lower(*FString::Printf(TEXT("lowerarm_%s"), Sx));
		if (Mesh->GetBoneIndex(Hand) == INDEX_NONE)
		{
			continue;
		}
		GripWrist[Side] = MeshRel.TransformPosition(BoneCS(Hand).GetLocation());
		GripElbow[Side] = MeshRel.TransformPosition(BoneCS(Lower).GetLocation());
		GripShoulder[Side] = MeshRel.TransformPosition(BoneCS(*FString::Printf(TEXT("upperarm_%s"), Sx)).GetLocation());
		if (Side == 1)
		{
			const FTransform Ut = BoneCS(TEXT("upperarm_r")), Lt = BoneCS(Lower), Ht = BoneCS(Hand);
			const FVector UD = (Lt.GetLocation() - Ut.GetLocation()).GetSafeNormal(), FD = (Ht.GetLocation() - Lt.GetLocation()).GetSafeNormal();
			const FVector Bd = FVector::CrossProduct(UD, FD).GetSafeNormal();
			UpperAlongL = Ut.GetRotation().UnrotateVector(UD);
			UpperBendL = Ut.GetRotation().UnrotateVector(Bd);
			ForeAlongL = Lt.GetRotation().UnrotateVector(FD);
			ForeBendL = Lt.GetRotation().UnrotateVector(Bd);
			HandInFore0 = Lt.GetRotation().Inverse() * Ht.GetRotation();
			const FReferenceSkeleton& Rf = Mesh->GetSkinnedAsset()->GetRefSkeleton();
			const int32 Li = Rf.FindBoneIndex(Lower);
			const float Lf = FMath::Max(1.f, (float)FVector::Dist(Lt.GetLocation(), Ht.GetLocation()));
			ForeTwist.Reset();
			for (int32 b = 0; b < Rf.GetNum(); ++b)
			{
				if (Rf.GetParentIndex(b) == Li && Rf.GetBoneName(b).ToString().Contains(TEXT("twist")))
				{
					const float Along = FVector::DotProduct(BoneCS(Rf.GetBoneName(b)).GetLocation() - Lt.GetLocation(), FD) / Lf;
					ForeTwist.Add(TPair<int32, float>(b, FMath::Clamp(Along, 0.15f, 0.9f)));
				}
			}
			UE_LOG(LogTemp, Display, TEXT("DriverArms: the right forearm's twist bones: %d"), ForeTwist.Num());
		}
		GripHandRot[Side] = MeshRel.GetRotation() * BoneCS(Hand).GetRotation();
		const FName Mid1(*FString::Printf(TEXT("middle_01_%s"), Sx));
		if (Mesh->GetBoneIndex(Mid1) != INDEX_NONE)
		{
			GripFinger[Side] = (MeshRel.TransformPosition(BoneCS(Mid1).GetLocation()) - GripWrist[Side]).GetSafeNormal();
		}
		const FName Idx1(*FString::Printf(TEXT("index_01_%s"), Sx)), Pnk1(*FString::Printf(TEXT("pinky_01_%s"), Sx));
		if (Mesh->GetBoneIndex(Idx1) != INDEX_NONE && Mesh->GetBoneIndex(Pnk1) != INDEX_NONE)
		{
			// across the knuckles, index to little finger (with the fingers' way, it fixes how the hand is turned)
			FVector A = MeshRel.TransformPosition(BoneCS(Pnk1).GetLocation()) - MeshRel.TransformPosition(BoneCS(Idx1).GetLocation());
			GripAcross[Side] = (A - GripFinger[Side] * FVector::DotProduct(A, GripFinger[Side])).GetSafeNormal();
		}
	}
	// which way a positive angle turns: twelve o'clock toward the driver's right, clockwise as the driver sees it
	const float Tilt = FMath::DegreesToRadians(WheelTilt);
	const FVector Nw(-FMath::Cos(Tilt), 0.f, FMath::Sin(Tilt));
	const FVector U(0.f, 1.f, 0.f);
	FVector Vw = FVector::CrossProduct(Nw, U);
	if (Vw.Z < 0.f)
	{
		Vw = -Vw;
	}
	SteerSign = FVector::DotProduct(FQuat(Nw, 0.1f).RotateVector(Vw), U) > 0.f ? 1.f : -1.f;
	if (WheelActor && WheelActor->GetRootComponent())
	{
		WheelBaseRot = WheelActor->GetRootComponent()->GetRelativeRotation().Quaternion();
	}
	UE_LOG(LogTemp, Display, TEXT("DriverArms: grip kept for steering (wheel %s)"), WheelActor ? *WheelActor->GetActorLabel() : TEXT("not set"));
	MakePinch();
	if (Mesh->GetBoneIndex(TEXT("spine_05")) != INDEX_NONE)
	{
		const FTransform Ch = BoneCS(TEXT("spine_05"));
		EyeInChest = Ch.InverseTransformPosition(ToCS(EyeAt));
		ChestGrip = Mesh->GetRelativeTransform().GetRotation() * Ch.GetRotation();
	}
}

void ADriverArms::MakePinch()
{
	// The key grip (the right hand), as in close shots of a hand at an ignition: the key's head held between the pad of
	// the thumb and the side of the curled index finger, the other fingers tucked loosely under it, more and more toward
	// the little finger. From the hand as it holds the wheel: the fingers opened to the hand's reference pose, then
	// curled about the knuckles' axis toward the palm; the thumb laid on the index's side, a key's thickness off it.
	USkeletalMesh* SM = Cast<USkeletalMesh>(Mesh->GetSkinnedAsset());
	if (!SM || Mesh->GetBoneIndex(TEXT("index_03_r")) == INDEX_NONE || Mesh->GetBoneIndex(TEXT("thumb_03_r")) == INDEX_NONE)
	{
		return;
	}
	const TArray<FTransform>& RefPose = SM->GetRefSkeleton().GetRefBonePose();
	const TArray<FTransform> Saved = Mesh->BoneSpaceTransforms;
	auto P = [&](const FString& B) { return BoneCS(FName(*B)).GetLocation(); };
	const FVector Hd = P(TEXT("hand_r"));
	const FVector Fd = (P(TEXT("middle_01_r")) - Hd).GetSafeNormal();
	FVector Ac = P(TEXT("pinky_01_r")) - P(TEXT("index_01_r"));
	Ac = (Ac - Fd * FVector::DotProduct(Ac, Fd)).GetSafeNormal();
	FVector Palm = P(TEXT("middle_03_r")) - P(TEXT("middle_01_r"));         // (the curled fingers' tips: the palm's side)
	Palm = (Palm - Fd * FVector::DotProduct(Palm, Fd) - Ac * FVector::DotProduct(Palm, Ac)).GetSafeNormal();
	struct FCurl
	{
		const TCHAR* Name;
		FVector Deg;
	};
	static const FCurl Curls[] = {{TEXT("index"), FVector(38.f, 78.f, 32.f)}, {TEXT("middle"), FVector(60.f, 92.f, 48.f)},
		{TEXT("ring"), FVector(68.f, 94.f, 50.f)}, {TEXT("pinky"), FVector(76.f, 90.f, 46.f)}};
	TArray<int32> Bones;
	for (const FCurl& Cu : Curls)
	{
		FString J[3];
		for (int32 k = 0; k < 3; ++k)
		{
			J[k] = FString::Printf(TEXT("%s_0%d_r"), Cu.Name, k + 1);
			const int32 i = Mesh->GetBoneIndex(FName(*J[k]));
			if (i == INDEX_NONE)
			{
				Mesh->BoneSpaceTransforms = Saved;
				return;
			}
			Mesh->BoneSpaceTransforms[i].SetRotation(RefPose[i].GetRotation());
			Bones.Add(i);
		}
		for (int32 k = 0; k < 3; ++k)
		{
			const FVector Jp = P(J[k]);
			const FVector Cp = k < 2 ? P(J[k + 1]) : P(J[2]) + (P(J[2]) - P(J[1])) * 0.85f;
			const FVector V = Cp - Jp;
			const float S = FVector::DotProduct(FQuat(Ac, 0.2f).RotateVector(V) - V, Palm) >= 0.f ? 1.f : -1.f;
			SetBoneCS(FName(*J[k]), FQuat(Ac, S * FMath::DegreesToRadians((float)Cu.Deg[k])) * BoneCS(FName(*J[k])).GetRotation());
		}
	}
	// the thumb: from its reference pose, laid along the index's side (the radial side, away from the little finger),
	// a key's thickness and the two fingers' flesh off its middle bone
	const FString T1 = TEXT("thumb_01_r"), T2 = TEXT("thumb_02_r"), T3 = TEXT("thumb_03_r");
	for (const FString& B : {T1, T2, T3})
	{
		const int32 i = Mesh->GetBoneIndex(FName(*B));
		Mesh->BoneSpaceTransforms[i].SetRotation(RefPose[i].GetRotation());
		Bones.Add(i);
	}
	auto TipOf = [&]() { const FVector A2 = P(T2), A3 = P(T3); return A3 + (A3 - A2) * 0.9f; };
	const FVector IdxMid = FMath::Lerp(P(TEXT("index_02_r")), P(TEXT("index_03_r")), 0.3f);
	const FVector Target = IdxMid - Ac * 2.3f;
	for (int32 It = 0; It < 3; ++It)
	{
		const FTransform Tt = BoneCS(FName(*T1));
		const FVector Cur = (FMath::Lerp(P(T2), TipOf(), 0.6f) - Tt.GetLocation()).GetSafeNormal();
		const FVector Want = (Target - Tt.GetLocation()).GetSafeNormal();
		SetBoneCS(FName(*T1), FQuat::FindBetweenNormals(Cur, Want) * Tt.GetRotation());
	}
	const FVector Pad = FMath::Lerp(P(T2), TipOf(), 0.6f);
	const FVector IdxSide = IdxMid - Ac * 0.85f;
	const FTransform HandCS = BoneCS(TEXT("hand_r"));
	PinchAt = HandCS.InverseTransformPosition((Pad + IdxSide) * 0.5f);
	PinchFace = HandCS.InverseTransformVectorNoScale((IdxSide - Pad).GetSafeNormal());
	PinchFinger = HandCS.InverseTransformVectorNoScale(Fd);
	PinchPalm = HandCS.InverseTransformVectorNoScale(Palm);
	PinchLocal.Reset();
	for (int32 i : Bones)
	{
		PinchLocal.Add(i, Mesh->BoneSpaceTransforms[i].GetRotation());
	}
	UE_LOG(LogTemp, Display, TEXT("DriverArms: key grip: the thumb's pad %.2f cm from the index's side (the key's head 0.62 cm thick); pinch %.1f cm from the wrist"),
		FVector::Dist(Pad, IdxSide), PinchAt.Size());
	Mesh->BoneSpaceTransforms = Saved;
}

void ADriverArms::FollowWheel()
{
	// The hands hold the rim, so they turn with it: each hand (and its curled fingers, which ride on it) is carried
	// round the wheel's axis, the arm reaches it by two-bone IK with the elbow kept on the side it was on.
	const float Tilt = FMath::DegreesToRadians(WheelTilt);
	const FVector Nw(-FMath::Cos(Tilt), 0.f, FMath::Sin(Tilt));
	const FQuat Q(Nw, SteerSign * FMath::DegreesToRadians(Steer));
	if (GripPose.Num() == Mesh->BoneSpaceTransforms.Num())
	{
		Mesh->BoneSpaceTransforms = GripPose;
	}
	const FTransform& MeshRel = Mesh->GetRelativeTransform();
	if (KeyReach > 0.f && Mesh->GetBoneIndex(TEXT("spine_05")) != INDEX_NONE && Mesh->GetBoneIndex(TEXT("upperarm_r")) != INDEX_NONE)
	{
		// leaning in to reach the key (as anyone does for an ignition low in the dash, more so in a panic): the spine bent
		// forward and turned a little toward it, so the right shoulder comes forward and down; the left hand stays on the
		// rim (its arm is solved again below)
		const float s = FMath::Clamp(KeyReach, 0.f, 1.f), e = s * s * (3.f - 2.f * s);
		static const TCHAR* Spine[] = {TEXT("spine_03"), TEXT("spine_04"), TEXT("spine_05")};
		auto ShoulderX = [&]() { return MeshRel.TransformPosition(BoneCS(TEXT("upperarm_r")).GetLocation()).X; };
		auto Turn = [&](const FVector& AxisCar, float Deg, float By)
		{
			// (which way about the axis brings the right shoulder forward: tried a little each way)
			const FVector A = DirToCS(AxisCar);
			const FName B(TEXT("spine_04"));
			const FQuat Was = BoneCS(B).GetRotation();
			const float X0 = ShoulderX();
			SetBoneCS(B, FQuat(A, 0.05f) * Was);
			const float Sign = ShoulderX() > X0 ? 1.f : -1.f;
			SetBoneCS(B, Was);
			for (const TCHAR* Sp : Spine)
			{
				const FName Bn(Sp);
				SetBoneCS(Bn, FQuat(A, Sign * FMath::DegreesToRadians(Deg / 3.f) * By) * BoneCS(Bn).GetRotation());
			}
		};
		if (FullLeanShoulder.IsNearlyZero())
		{
			// (where the shoulder will be, fully leaned in: the grip on the key is decided for that, once)
			const TArray<FTransform> Was = Mesh->BoneSpaceTransforms;
			Turn(FVector(0.f, 1.f, 0.f), KeyLean, 1.f);
			Turn(FVector(0.f, 0.f, 1.f), KeyTwist, 1.f);
			FullLeanShoulder = MeshRel.TransformPosition(BoneCS(TEXT("upperarm_r")).GetLocation());
			Mesh->BoneSpaceTransforms = Was;
		}
		Turn(FVector(0.f, 1.f, 0.f), KeyLean, e);
		Turn(FVector(0.f, 0.f, 1.f), KeyTwist, e);
	}
	if (!EyeInChest.IsNearlyZero())
	{
		// the eye carried by the chest (leaning in with it), for the camera
		const FTransform Ch = BoneCS(TEXT("spine_05"));
		EyeShift = MeshRel.TransformPosition(Ch.TransformPosition(EyeInChest)) - EyeAt;
		EyeTurn = (MeshRel.GetRotation() * Ch.GetRotation()) * ChestGrip.Inverse();
	}
	for (int32 Side = 0; Side < 2; ++Side)
	{
		const TCHAR* Sx = Side == 0 ? TEXT("l") : TEXT("r");
		const FName Upper(*FString::Printf(TEXT("upperarm_%s"), Sx)), Lower(*FString::Printf(TEXT("lowerarm_%s"), Sx)),
			Hand(*FString::Printf(TEXT("hand_%s"), Sx));
		if (Mesh->GetBoneIndex(Hand) == INDEX_NONE)
		{
			continue;
		}
		FVector Wrist = WheelCentre + Q.RotateVector(GripWrist[Side] - WheelCentre);
		FQuat HandRot = Q * GripHandRot[Side];
		float KeyE = 0.f;
		if (Side == 1 && KeyReach > 0.f && PinchLocal.Num() > 0 && KeyPivot)
		{
			// the right hand off the rim, down past the outside of it to the key: the key's head pinched between the thumb's
			// pad and the curled index's side (the thumb on its right face), the fingers pointing in at the lock; turning
			// it is the forearm twisting about the key's axis. On its way there it swings out and back, clear of the rim.
			const FQuat KeyQ = KeyPivot->GetRelativeRotation().Quaternion();
			const FVector Head = KeyPivot->GetRelativeLocation() + KeyQ.RotateVector(FVector(2.05f, 0.f, 0.15f));
			const FQuat M1 = FRotationMatrix::MakeFromXY(PinchFace, -PinchFinger).ToQuat();
			if (!bKeyPhi)
			{
				// which way round the key's head the hand takes it (about the line from thumb to index): searched, with the
				// key unturned, for the wrist least bent and least twisted on the forearm for where the arm comes from (the
				// elbow out to the side and down, on its hinge), clear of the cabin
				const FVector KY = KeyBase.GetAxisY(), KX = KeyBase.GetAxisX();
				const FVector Head0 = KeyPivot->GetRelativeLocation() + KeyBase.RotateVector(FVector(2.05f, 0.f, 0.15f));
				const FVector ShNow = FullLeanShoulder.IsNearlyZero() ? MeshRel.TransformPosition(BoneCS(TEXT("upperarm_r")).GetLocation()) : FullLeanShoulder;
				const float L1k = FVector::Dist(GripShoulder[1], GripElbow[1]), L2k = FVector::Dist(GripElbow[1], GripWrist[1]);
				const FQuat ToCSq = MeshRel.GetRotation().Inverse();
				auto Frame = [](const FVector& A, const FVector& B) { return FRotationMatrix::MakeFromXY(A, B).ToQuat(); };
				float BestPhi = 0.f, BestCost = 1e9f, BestSide = 1.f, BestBack = 0.f;
				const FVector Eye(8.f, 6.f, 114.f);                                         // (leaning in)
				for (float Side_ : {1.f, -1.f})
				for (float Phi = -170.f; Phi <= 170.f; Phi += 2.f)
				{
					const FVector Fin = FQuat(KY, FMath::DegreesToRadians(Phi)).RotateVector(KX);
					const FQuat R = Frame(KY * Side_, Fin) * M1.Inverse();
					const FVector Wr = Head0 - R.RotateVector(PinchAt);
					const FVector Dv = Wr - ShNow;
					const float Dd = Dv.Size();
					if (Dd > (L1k + L2k) * 0.995f || UpperAlongL.IsNearlyZero())
					{
						continue;
					}
					const FVector Dn = Dv / Dd;
					FVector Pl = FVector(-0.1f, 1.f, -0.55f).GetSafeNormal();
					Pl = (Pl - Dn * FVector::DotProduct(Pl, Dn)).GetSafeNormal();
					const float Aa = (L1k * L1k - L2k * L2k + Dd * Dd) / (2.f * Dd);
					const FVector El = ShNow + Dn * Aa + Pl * FMath::Sqrt(FMath::Max(0.f, L1k * L1k - Aa * Aa));
					const FVector FD = ToCSq.RotateVector((Wr - El).GetSafeNormal()), UD = ToCSq.RotateVector((El - ShNow).GetSafeNormal());
					const FVector Bd = FVector::CrossProduct(UD, FD).GetSafeNormal();
					if (Bd.IsNearlyZero())
					{
						continue;
					}
					const FQuat Rf = Frame(FD, Bd) * Frame(ForeAlongL, ForeBendL).Inverse();
					const FQuat Rel = (Rf.Inverse() * (ToCSq * R)) * HandInFore0.Inverse();
					FQuat Sw, Tw;
					Rel.ToSwingTwist(ForeAlongL, Sw, Tw);
					const float SwingDeg = FMath::RadiansToDegrees(Sw.GetAngle());
					const float TwistDeg = FMath::RadiansToDegrees(FMath::UnwindRadians(Tw.GetAngle()));
					// (the back of the hand toward the eye, the fingers curled round the key away from it, as a hand at an
					// ignition is seen from the seat)
					const FVector Back = R.RotateVector(-PinchPalm).GetSafeNormal();
					const float BackDeg = FMath::RadiansToDegrees(FMath::Acos(FMath::Clamp(FVector::DotProduct(Back, (Eye - Head0).GetSafeNormal()), -1.f, 1.f)));
					const float Cost = SwingDeg + 0.7f * FMath::Abs(TwistDeg) + 1.5f * FMath::Max(0.f, BackDeg - 40.f) +
						30.f * FMath::Max(0.f, 4.f - CabinDist(El)) + 30.f * FMath::Max(0.f, 3.f - CabinDist((El + Wr) * 0.5f));
					if (Cost < BestCost)
					{
						BestCost = Cost;
						BestPhi = Phi;
						BestSide = Side_;
						BestBack = BackDeg;
					}
				}
				KeyPhi = BestPhi;
				KeySide = BestSide;
				bKeyPhi = true;
				static int32 PhiLogged = 0;
				if (PhiLogged++ < 1)
				{
					UE_LOG(LogTemp, Display, TEXT("DriverArms: key hand: round %.0f deg, thumb on the %s face, back of the hand %.0f deg from the eye, cost %.1f"),
						BestPhi, BestSide > 0.f ? TEXT("right") : TEXT("left"), BestBack, BestCost);
				}
			}
			const FVector FinK = FQuat(KeyQ.GetAxisY(), FMath::DegreesToRadians(KeyPhi)).RotateVector(KeyQ.GetAxisX());
			const FQuat KeyRot = FRotationMatrix::MakeFromXY(KeyQ.GetAxisY() * KeySide, FinK).ToQuat() * M1.Inverse();
			const FVector KeyWrist = Head - KeyRot.RotateVector(PinchAt);
			const float s = FMath::Clamp(KeyReach, 0.f, 1.f), e = s * s * (3.f - 2.f * s);
			KeyE = e;
			Wrist = FMath::Lerp(Wrist, KeyWrist, e) + FVector(-5.f, 7.f, -4.f) * FMath::Sin(PI * e);   // (down past the rim's outside)
			HandRot = FQuat::Slerp(HandRot, KeyRot, e);
			const float f = FMath::Clamp((s - 0.35f) / 0.65f, 0.f, 1.f);                         // (closing on it as it gets there)
			for (const TPair<int32, FQuat>& Pl : PinchLocal)
			{
				FTransform& Tb = Mesh->BoneSpaceTransforms[Pl.Key];
				Tb.SetRotation(FQuat::Slerp(Tb.GetRotation(), Pl.Value, f * f * (3.f - 2.f * f)));
			}
		}
		else if (Side == 1 && KeyReach > 0.f && !GripFinger[1].IsNearlyZero())
		{
			// the right hand off the rim, down past the outside of it to the key in the lower dash: its fingers pointing in
			// at the key's head (toward the dash, a little down), the head pinched between thumb and fingers; turning it is
			// the forearm twisting about the key's axis. On its way there it swings out and back, clear of the rim.
			const FVector Ax = KeyAxis.GetSafeNormal();
			// (as a hand takes a key in a column lock: up from below the rim on the right, its fingers in at the key's head,
			// forward and to the left, the palm toward the key and the thumb on top; the knuckles' row running down)
			const FVector Fk = FVector(0.55f, -0.62f, -0.2f).GetSafeNormal();
			FVector Ak = FVector(0.f, 0.15f, -1.f);
			Ak = (Ak - Fk * FVector::DotProduct(Ak, Fk)).GetSafeNormal();
			const FQuat Turn(Ax, -FMath::DegreesToRadians(KeyTurn));
			const FVector KeyWrist = KeyAt + Turn.RotateVector(-Fk * 8.f + Ak * 2.5f);
			FQuat KeyRot = Turn * FQuat::FindBetweenNormals(GripFinger[1], Fk) * GripHandRot[1];
			if (!GripAcross[1].IsNearlyZero())
			{
				const FQuat From = FRotationMatrix::MakeFromXY(GripFinger[1], GripAcross[1]).ToQuat();
				const FQuat To = FRotationMatrix::MakeFromXY(Fk, Ak).ToQuat();
				KeyRot = Turn * (To * From.Inverse()) * GripHandRot[1];
			}
			const float s = FMath::Clamp(KeyReach, 0.f, 1.f), e = s * s * (3.f - 2.f * s);
			Wrist = FMath::Lerp(Wrist, KeyWrist, e) + FVector(-5.f, 7.f, -2.f) * FMath::Sin(PI * e);   // (down past the rim's outside)
			HandRot = FQuat::Slerp(HandRot, KeyRot, e);
		}
		const FVector Sh = MeshRel.TransformPosition(BoneCS(Upper).GetLocation());
		const float L1 = FVector::Dist(GripShoulder[Side].IsNearlyZero() ? Sh : GripShoulder[Side], GripElbow[Side]);
		const float L2 = FVector::Dist(GripElbow[Side], GripWrist[Side]);
		const FVector D = Wrist - Sh;
		const float Dist = FMath::Min((float)D.Size(), (L1 + L2) * 0.999f);
		const FVector Dir = D.GetSafeNormal();
		FVector Pole = (GripElbow[Side] - Sh).GetSafeNormal();
		if (KeyE > 0.f)
		{
			Pole = FMath::Lerp(Pole, FVector(-0.1f, 1.f, -0.55f).GetSafeNormal(), KeyE);     // (the elbow out to the side and down)
		}
		Pole = (Pole - Dir * FVector::DotProduct(Pole, Dir)).GetSafeNormal();
		const float A = (L1 * L1 - L2 * L2 + Dist * Dist) / (2.f * Dist);
		const FVector Elbow = Sh + Dir * A + Pole * FMath::Sqrt(FMath::Max(0.f, L1 * L1 - A * A));
		auto Aim = [&](FName Bone, FName Child, const FVector& TargetCar)
		{
			const FTransform Tb = BoneCS(Bone);
			const FVector Cur = (BoneCS(Child).GetLocation() - Tb.GetLocation()).GetSafeNormal();
			const FVector Want = (ToCS(TargetCar) - Tb.GetLocation()).GetSafeNormal();
			SetBoneCS(Bone, FQuat::FindBetweenNormals(Cur, Want) * Tb.GetRotation());
		};
		Aim(Upper, Lower, Elbow);
		Aim(Lower, Hand, Sh + Dir * Dist);
		if (Side == 1 && KeyE > 0.f && !UpperAlongL.IsNearlyZero())
		{
			// (off the wheel) the elbow bent about its own hinge, never sideways at it (that folds the skin into a fin)
			const FVector UD = DirToCS(Elbow - Sh), FD = DirToCS(Sh + Dir * Dist - Elbow);
			FVector Bd = FVector::CrossProduct(UD, FD);
			Bd = Bd.SizeSquared() > 1e-4f ? Bd.GetSafeNormal() : BoneCS(Upper).GetRotation().RotateVector(UpperBendL);
			auto Frame = [](const FVector& A, const FVector& B) { return FRotationMatrix::MakeFromXY(A, B).ToQuat(); };
			const FQuat Ua = BoneCS(Upper).GetRotation(), La = BoneCS(Lower).GetRotation();
			SetBoneCS(Upper, FQuat::Slerp(Ua, Frame(UD, Bd) * Frame(UpperAlongL, UpperBendL).Inverse(), KeyE));
			SetBoneCS(Lower, FQuat::Slerp(La, Frame(FD, Bd) * Frame(ForeAlongL, ForeBendL).Inverse(), KeyE));
		}
		SetBoneCS(Hand, MeshRel.GetRotation().Inverse() * HandRot);
		static const bool bKeyLog = FParse::Param(FCommandLine::Get(), TEXT("keylog"));
		if (bKeyLog && Side == 1 && KeyReach > 0.f)
		{
			const FVector W = MeshRel.TransformPosition(BoneCS(Hand).GetLocation()), E = MeshRel.TransformPosition(BoneCS(Lower).GetLocation());
			const FRotator Hr = (MeshRel.GetRotation() * BoneCS(Hand).GetRotation()).Rotator();
			UE_LOG(LogTemp, Display, TEXT("KeyLog %.4f reach %.3f turn %.2f phi %.1f side %.0f wrist %.2f %.2f %.2f elbow %.2f %.2f %.2f hand %.1f %.1f %.1f eye %.2f %.2f %.2f"),
				GetWorld()->GetTimeSeconds(), KeyReach, KeyTurn, KeyPhi, KeySide, W.X, W.Y, W.Z, E.X, E.Y, E.Z, Hr.Pitch, Hr.Yaw, Hr.Roll,
				EyeShift.X, EyeShift.Y, EyeShift.Z);
		}
		if (Side == 1 && KeyE > 0.f && ForeTwist.Num() > 0)
		{
			// the hand's turn on the forearm (from how it sat at the wheel) shared out down the forearm's twist bones, as the
			// forearm's two bones roll over each other
			const FQuat Rel = (BoneCS(Lower).GetRotation().Inverse() * BoneCS(Hand).GetRotation()) * HandInFore0.Inverse();
			FQuat Sw, Tw;
			Rel.ToSwingTwist(ForeAlongL, Sw, Tw);
			float Ang = FMath::UnwindRadians(Tw.GetAngle());
			if (FVector::DotProduct(Tw.GetRotationAxis(), ForeAlongL) < 0.f)
			{
				Ang = -Ang;
			}
			const FQuat HandWas = BoneCS(Hand).GetRotation();
			for (const TPair<int32, float>& T : ForeTwist)
			{
				FTransform& Bt = Mesh->BoneSpaceTransforms[T.Key];
				Bt.SetRotation(FQuat(ForeAlongL, Ang * T.Value * KeyE) * Bt.GetRotation());
			}
			SetBoneCS(Hand, HandWas);
		}
		static int32 KeyLogged = 0;
		if (Side == 1 && KeyReach >= 0.999f && KeyLogged < 3)
		{
			// the key check: where the hand got to (the IK's reach), how the fingers are bent, where the pinch is vs the key
			++KeyLogged;
			auto Pc = [&](const TCHAR* B) { return MeshRel.TransformPosition(BoneCS(B).GetLocation()); };
			auto Bend = [&](const TCHAR* A, const TCHAR* B, const TCHAR* C)
			{
				const FVector U = (Pc(B) - Pc(A)).GetSafeNormal(), V = (Pc(C) - Pc(B)).GetSafeNormal();
				return FMath::RadiansToDegrees(FMath::Acos(FMath::Clamp(FVector::DotProduct(U, V), -1.f, 1.f)));
			};
			const FVector PinchNow = MeshRel.TransformPosition(BoneCS(Hand).TransformPosition(PinchAt));
			const FVector HeadNow = KeyPivot ? KeyPivot->GetRelativeLocation() + KeyPivot->GetRelativeRotation().Quaternion().RotateVector(FVector(2.05f, 0.f, 0.15f)) : KeyAt;
			UE_LOG(LogTemp, Display, TEXT("DriverArms: the hand taken round the key's head %.0f deg"), KeyPhi);
			UE_LOG(LogTemp, Display, TEXT("DriverArms: at the key: wrist %.2f cm off its target (shoulder %s, %.1f cm from it, arm %.1f); pinch %.2f cm from the key's head; index bent %.0f/%.0f, middle %.0f/%.0f, pinky %.0f/%.0f deg; %d pinch bones"),
				FVector::Dist(Pc(TEXT("hand_r")), Wrist), *Sh.ToString(), FVector::Dist(Sh, Wrist), L1 + L2, FVector::Dist(PinchNow, HeadNow),
				Bend(TEXT("index_01_r"), TEXT("index_02_r"), TEXT("index_03_r")), Bend(TEXT("hand_r"), TEXT("index_01_r"), TEXT("index_02_r")),
				Bend(TEXT("middle_01_r"), TEXT("middle_02_r"), TEXT("middle_03_r")), Bend(TEXT("hand_r"), TEXT("middle_01_r"), TEXT("middle_02_r")),
				Bend(TEXT("pinky_01_r"), TEXT("pinky_02_r"), TEXT("pinky_03_r")), Bend(TEXT("hand_r"), TEXT("pinky_01_r"), TEXT("pinky_02_r")), PinchLocal.Num());
		}
		static int32 Logged = 0;
		if (Logged < 12 && (Logged < 4 || FMath::Abs(Steer) > 3.f))
		{
			++Logged;
			const FVector WristNow = MeshRel.TransformPosition(BoneCS(Hand).GetLocation());
			const FVector ElbowNow = MeshRel.TransformPosition(BoneCS(Lower).GetLocation());
			const FQuat RotNow = MeshRel.GetRotation() * BoneCS(Hand).GetRotation();
			UE_LOG(LogTemp, Display, TEXT("DriverArms: follow %s steer %.2f: wrist off %.2f cm (moved %.2f), elbow off %.2f (moved %.2f), hand turned %.1f deg off target, %.1f from the grip"),
				Sx, Steer, FVector::Dist(WristNow, Wrist), FVector::Dist(Wrist, GripWrist[Side]), FVector::Dist(ElbowNow, Elbow),
				FVector::Dist(Elbow, GripElbow[Side]), FMath::RadiansToDegrees(RotNow.AngularDistance(Q * GripHandRot[Side])),
				FMath::RadiansToDegrees(RotNow.AngularDistance(GripHandRot[Side])));
		}
	}
	if (WheelActor)
	{
		WheelActor->SetActorRelativeRotation(Q * WheelBaseRot);
	}
}

void ADriverArms::HideLegs()
{
	for (const TCHAR* B : {TEXT("thigh_l"), TEXT("thigh_r")})
	{
		if (Mesh && Mesh->GetBoneIndex(B) != INDEX_NONE)
		{
			Mesh->HideBoneByName(B, PBO_None);
		}
		if (Clothes && Clothes->GetBoneIndex(B) != INDEX_NONE)
		{
			Clothes->HideBoneByName(B, PBO_None);
		}
	}
	UE_LOG(LogTemp, Display, TEXT("DriverArms: on foot, the legs hidden"));
}
