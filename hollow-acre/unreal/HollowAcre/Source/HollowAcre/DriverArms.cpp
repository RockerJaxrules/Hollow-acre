#include "DriverArms.h"

#include "Components/PoseableMeshComponent.h"
#include "Engine/SkeletalMesh.h"
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

void ADriverArms::CurlFinger(const FString& Finger, const FString& Sx, const FVector& Deg, const FVector& AxisCS, const FVector& PalmCS)
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
	const float Step = FMath::DegreesToRadians(1.5f);
	const float Max[3] = { (float)Deg.X, (float)Deg.Y, (float)Deg.Z };
	for (int k = 0; k < 3; ++k)
	{
		// which way bends toward the palm
		const FTransform T0 = BoneCS(J[k]);
		const FVector Child = (k < 2) ? BoneCS(J[k + 1]).GetLocation() : Tip();
		const FVector V = Child - T0.GetLocation();
		const float Sign = FVector::DotProduct(FQuat(AxisCS, 0.2f).RotateVector(V) - V, PalmCS) >= 0.f ? 1.f : -1.f;
		auto Turn = [&](float A) { SetBoneCS(J[k], FQuat(AxisCS, A) * BoneCS(J[k]).GetRotation()); };
		// already pressing in (from the joints before): open this joint until the skin clears
		for (int Open = 0; Open < 40 && Gap(k) < SkinAllow; ++Open)
		{
			Turn(-Sign * Step);
		}
		float Done = 0.f;
		while (Done < FMath::DegreesToRadians(Max[k]))
		{
			Turn(Sign * Step);
			if (Gap(k) < SkinAllow)
			{
				Turn(-Sign * Step);                       // that step went in: take it back, the finger rests here
				break;
			}
			Done += Step;
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
	FVector Back = (Rad * FMath::Cos(Ba) + Nw * FMath::Sin(Ba)).GetSafeNormal();
	FVector S = -T12;
	S = (S - Back * FVector::DotProduct(S, Back)).GetSafeNormal();
	FVector P = -Back;
	FVector F = (FVector::CrossProduct(S, P) * H).GetSafeNormal();
	// (with the index toward twelve and the back of the hand toward the driver, the fingers point up and out of the
	// wheel before the turn toward twelve: the hand comes from below and the rim runs diagonally across the palm)
	// turn the hand toward twelve about the back-of-hand axis, then roll it so the back shows more to the eye
	{
		float Y = FMath::DegreesToRadians(G.Yaw);
		if (FVector::DotProduct(FQuat(Back, Y).RotateVector(F), T12) < FVector::DotProduct(F, T12))
		{
			Y = -Y;
		}
		const FQuat Q(Back, Y);
		F = Q.RotateVector(F);
		S = Q.RotateVector(S);
	}
	{
		const FVector Eye(0.f, 0.f, 118.f);
		const FVector E = (Eye - Grip).GetSafeNormal();
		float Rr = FMath::DegreesToRadians(G.Roll);
		if (FVector::DotProduct(FQuat(F, Rr).RotateVector(Back), E) < FVector::DotProduct(Back, E))
		{
			Rr = -Rr;
		}
		const FQuat Q(F, Rr);
		S = Q.RotateVector(S);
		Back = Q.RotateVector(Back);
		P = -Back;
	}
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
	const float Ahead = bSkin ? 1.4f : 2.4f;
	float Lift = 2.6f;
	PoseHand(Grip - F * Ahead + Back * Lift);
	if (bSkin)
	{
		for (int32 It = 0; It < 12; ++It)
		{
			const float Rest = SkinMinDist(Side, 0);      // the palm decides; the fingers open and close round the rim after
			if (FMath::Abs(Rest - PalmGap) < 0.03f)
			{
				break;
			}
			Lift += PalmGap - Rest;
			PoseHand(Grip - F * Ahead + Back * Lift);
		}
		// the arm: if any of its skin is inside a part of the car (the door card, the column...), swing the elbow
		// about the shoulder-wrist line, the smallest swing that clears it (the hand stays where it is)
		float ArmGap = SkinMinDist(Side, 6);
		if (ArmGap < 0.f)
		{
			float BestSwivel = 0.f, BestGap = ArmGap;
			for (const float Deg : { 6.f, -6.f, 12.f, -12.f, 18.f, -18.f, 24.f, -24.f, 32.f, -32.f, 40.f, -40.f, 50.f, -50.f, 60.f, -60.f })
			{
				Swivel = FMath::DegreesToRadians(Deg);
				PoseHand(Grip - F * Ahead + Back * Lift);
				const float Gp = SkinMinDist(Side, 6);
				if (Gp > BestGap)
				{
					BestGap = Gp;
					BestSwivel = Swivel;
				}
				if (Gp >= 0.2f)
				{
					break;
				}
			}
			Swivel = BestSwivel;
			PoseHand(Grip - F * Ahead + Back * Lift);
			UE_LOG(LogTemp, Display, TEXT("DriverArms: %s arm was %.1f cm inside the cabin; elbow swung %.0f degrees, now %.2f cm clear"),
				*Sx, -ArmGap, FMath::RadiansToDegrees(Swivel), BestGap);
		}
	}

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
		const float AlT = Al + Up * FMath::DegreesToRadians(17.f);
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
	if (!bPlaced || FMath::IsNearlyEqual(Steer, LastSteer, 0.05f))
	{
		return;
	}
	LastSteer = Steer;
	Place();
	PoseArm(true, Left);
	PoseArm(false, Right);
	Mesh->MarkRefreshTransformDirty();
}
