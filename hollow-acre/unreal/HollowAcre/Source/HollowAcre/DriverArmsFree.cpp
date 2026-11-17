// The driver's body out of the seat: Part 2's opening, the wake in the wreck (EndingWakeBeats.cpp drives it).
//
// The chest goes where the director puts it (carried under the eye, as when sitting), and each arm reaches a target the
// director gives for its hand: two-bone, the elbow on its hinge toward a pole (by default where it was at the wheel,
// turned with the chest), the forearm's twist shared out down its twist bones. A hand not reaching hangs from its
// shoulder under gravity. The fingers take one of four shapes, made once from the hand's own skin: flat (pressed on
// something: the roof lining, the snow), relaxed, closed round a handle (the flashlight's barrel, 4 cm across: each
// finger curls until its skin meets it, the thumb wrapped over the index and middle fingers) or round the belt's buckle.

#include "DriverArms.h"

#include "Components/PoseableMeshComponent.h"
#include "Engine/SkeletalMesh.h"

namespace
{
	FQuat FreeFrameXY(const FVector& X, const FVector& Y)
	{
		return FRotationMatrix::MakeFromXY(X, Y).ToQuat();
	}

	float FreeEase(float S)
	{
		S = FMath::Clamp(S, 0.f, 1.f);
		return S * S * (3.f - 2.f * S);
	}

	const TCHAR* FreeFingerNames[4] = {TEXT("index"), TEXT("middle"), TEXT("ring"), TEXT("pinky")};
}

void ADriverArms::MakeShapes()
{
	USkeletalMesh* SM = Cast<USkeletalMesh>(Mesh->GetSkinnedAsset());
	if (!SM || Mesh->GetBoneIndex(TEXT("spine_05")) == INDEX_NONE)
	{
		return;
	}
	const TArray<FTransform>& RefPose = SM->GetRefSkeleton().GetRefBonePose();
	const TArray<FTransform> Saved = Mesh->BoneSpaceTransforms;          // (the grip at the wheel)
	const FTransform MeshRel = Mesh->GetRelativeTransform();
	SitChestCS = BoneCS(TEXT("spine_05"));
	SitChestCar = SitChestCS * MeshRel;
	ChestInEye = SitChestCar * FTransform(EyeAt).Inverse();
	auto P = [&](const FString& B) { return BoneCS(FName(*B)).GetLocation(); };
	for (int32 Side = 0; Side < 2; ++Side)
	{
		Mesh->BoneSpaceTransforms = Saved;
		const FString Sx = Side == 0 ? TEXT("l") : TEXT("r");
		const FName Upper(*(TEXT("upperarm_") + Sx)), Lower(*(TEXT("lowerarm_") + Sx)), Hand(*(TEXT("hand_") + Sx));
		const FName T1(*(TEXT("thumb_01_") + Sx)), T2(*(TEXT("thumb_02_") + Sx)), T3(*(TEXT("thumb_03_") + Sx));
		if (Mesh->GetBoneIndex(Hand) == INDEX_NONE || Mesh->GetBoneIndex(T3) == INDEX_NONE || Mesh->GetBoneIndex(*(TEXT("pinky_03_") + Sx)) == INDEX_NONE)
		{
			continue;
		}
		// the arm's hinge, as it bends at the wheel
		const FTransform Ut = BoneCS(Upper), Lt = BoneCS(Lower), Ht = BoneCS(Hand);
		const FVector UD = (Lt.GetLocation() - Ut.GetLocation()).GetSafeNormal(), FD = (Ht.GetLocation() - Lt.GetLocation()).GetSafeNormal();
		const FVector Bd = FVector::CrossProduct(UD, FD).GetSafeNormal();
		AlongU[Side] = Ut.GetRotation().UnrotateVector(UD);
		BendU[Side] = Ut.GetRotation().UnrotateVector(Bd);
		AlongF[Side] = Lt.GetRotation().UnrotateVector(FD);
		BendF[Side] = Lt.GetRotation().UnrotateVector(Bd);
		HandInFore[Side] = Lt.GetRotation().Inverse() * Ht.GetRotation();
		const FReferenceSkeleton& Rf = SM->GetRefSkeleton();
		const int32 Li = Rf.FindBoneIndex(Lower);
		const float Lf = FMath::Max(1.f, (float)FVector::Dist(Lt.GetLocation(), Ht.GetLocation()));
		Twist[Side].Reset();
		for (int32 b = 0; b < Rf.GetNum(); ++b)
		{
			if (Rf.GetParentIndex(b) == Li && Rf.GetBoneName(b).ToString().Contains(TEXT("twist")))
			{
				const float Along = FVector::DotProduct(BoneCS(Rf.GetBoneName(b)).GetLocation() - Lt.GetLocation(), FD) / Lf;
				Twist[Side].Add(TPair<int32, float>(b, FMath::Clamp(Along, 0.15f, 0.9f)));
			}
		}
		// the hand's own frame: the fingers curled round the rim show which side the palm is
		const FVector Hd = Ht.GetLocation();
		const FVector Fd = (P(TEXT("middle_01_") + Sx) - Hd).GetSafeNormal();
		FVector Ac = P(TEXT("pinky_01_") + Sx) - P(TEXT("index_01_") + Sx);
		Ac = (Ac - Fd * FVector::DotProduct(Ac, Fd)).GetSafeNormal();
		FVector Palm = P(TEXT("middle_03_") + Sx) - P(TEXT("middle_01_") + Sx);
		Palm = (Palm - Fd * FVector::DotProduct(Palm, Fd) - Ac * FVector::DotProduct(Palm, Ac)).GetSafeNormal();
		FingerL[Side] = Ht.GetRotation().UnrotateVector(Fd);
		AcrossL[Side] = Ht.GetRotation().UnrotateVector(Ac);
		FaceL[Side] = Ht.GetRotation().UnrotateVector(Palm);
		// the palm's skin in its middle: of the palm's own skin, the furthest out along the palm's way near its middle
		const FVector Mid = Hd + (P(TEXT("middle_01_") + Sx) - Hd) * 0.55f;
		float Out = 1.3f;
		{
			TMap<int32, FTransform> Cache;
			float Best = -1e9f;
			for (const FHandSkinPoint& Pt : Skin[Side][0])
			{
				FVector Q(0.f);
				for (int32 K = 0; K < Pt.Num; ++K)
				{
					Q += CurCS(Pt.Bone[K], Cache).TransformPosition(FVector(Pt.Local[K])) * Pt.Weight[K];
				}
				const FVector D = Q - Mid;
				const float Along = FVector::DotProduct(D, Palm);
				if ((D - Palm * Along).Size() < 2.f)
				{
					Best = FMath::Max(Best, Along);
				}
			}
			if (Best > 0.3f && Best < 4.f)
			{
				Out = Best;
			}
		}
		const FVector PalmSkin = Mid + Palm * Out;
		PalmSkinL[Side] = Ht.InverseTransformPosition(PalmSkin);

		// ---- the shapes: each from the fingers' reference pose
		TArray<int32> Bones;
		for (const TCHAR* F : {TEXT("index"), TEXT("middle"), TEXT("ring"), TEXT("pinky"), TEXT("thumb")})
		{
			for (int32 k = 1; k <= 3; ++k)
			{
				const int32 i = Mesh->GetBoneIndex(FName(*FString::Printf(TEXT("%s_0%d_%s"), F, k, *Sx)));
				if (i != INDEX_NONE)
				{
					Bones.Add(i);
				}
			}
		}
		auto ToRef = [&]()
		{
			Mesh->BoneSpaceTransforms = Saved;
			for (int32 i : Bones)
			{
				Mesh->BoneSpaceTransforms[i].SetRotation(RefPose[i].GetRotation());
			}
		};
		auto CurlFixed = [&](const TCHAR* F, const FVector& Deg)
		{
			for (int32 k = 0; k < 3; ++k)
			{
				const FString Jk = FString::Printf(TEXT("%s_0%d_%s"), F, k + 1, *Sx);
				const FString Jn = FString::Printf(TEXT("%s_0%d_%s"), F, k + 2, *Sx);
				const FVector Jp = P(Jk);
				const FVector Cp = k < 2 ? P(Jn) : P(Jk) + (P(Jk) - P(FString::Printf(TEXT("%s_0%d_%s"), F, k, *Sx))) * 0.85f;
				const FVector V = Cp - Jp;
				const float S = FVector::DotProduct(FQuat(Ac, 0.2f).RotateVector(V) - V, Palm) >= 0.f ? 1.f : -1.f;
				SetBoneCS(FName(*Jk), FQuat(Ac, S * FMath::DegreesToRadians((float)Deg[k])) * BoneCS(FName(*Jk)).GetRotation());
			}
		};
		auto TipOf = [&]() { const FVector A2 = BoneCS(T2).GetLocation(), A3 = BoneCS(T3).GetLocation(); return A3 + (A3 - A2) * 0.9f; };
		auto AimThumb = [&](const FVector& Target, float W)
		{
			for (int32 It = 0; It < 3; ++It)
			{
				const FTransform Tt = BoneCS(T1);
				const FVector Cur = (FMath::Lerp(BoneCS(T2).GetLocation(), TipOf(), 0.6f) - Tt.GetLocation()).GetSafeNormal();
				const FVector Want = (Target - Tt.GetLocation()).GetSafeNormal();
				SetBoneCS(T1, FQuat::Slerp(FQuat::Identity, FQuat::FindBetweenNormals(Cur, Want), W) * Tt.GetRotation());
			}
			const FTransform T = BoneCS(T2);
			const FVector Cur = (TipOf() - T.GetLocation()).GetSafeNormal(), Want = (Target - T.GetLocation()).GetSafeNormal();
			SetBoneCS(T2, FQuat::Slerp(FQuat::Identity, FQuat::FindBetweenNormals(Cur, Want), W * 0.6f) * T.GetRotation());
		};
		auto Keep = [&](int32 Shape)
		{
			ShapeLocal[Side][Shape].Reset();
			for (int32 i : Bones)
			{
				ShapeLocal[Side][Shape].Add(i, Mesh->BoneSpaceTransforms[i].GetRotation());
			}
		};
		// flat: nearly straight, the thumb a little out along the index's side
		ToRef();
		for (const TCHAR* F : FreeFingerNames)
		{
			CurlFixed(F, FVector(5.f, 7.f, 4.f));
		}
		AimThumb(P(TEXT("index_01_") + Sx) + Fd * 1.5f - Ac * 3.2f + Palm * 0.8f, 0.5f);
		Keep(0);
		// relaxed: curled a little, more toward the little finger; the thumb in front of the index
		ToRef();
		CurlFixed(TEXT("index"), FVector(18.f, 26.f, 14.f));
		CurlFixed(TEXT("middle"), FVector(22.f, 32.f, 16.f));
		CurlFixed(TEXT("ring"), FVector(26.f, 34.f, 18.f));
		CurlFixed(TEXT("pinky"), FVector(30.f, 36.f, 18.f));
		AimThumb(P(TEXT("index_02_") + Sx) + Palm * 2.2f - Ac * 0.8f, 0.7f);
		Keep(1);
		// round a handle (2: the flashlight's barrel, 3: the buckle): each finger curls until its skin meets it, the thumb over
		// the index and middle fingers
		for (int32 Shape = 2; Shape <= 3; ++Shape)
		{
			ToRef();
			const float R = Shape == 2 ? 1.985f : 1.5f;
			const FVector C = PalmSkin + Palm * (R + 0.1f);
			const FVector Ax = Ac;
			GraspDist = [MeshRel, C, Ax, R](const FVector& Pcar)
			{
				const FVector D = MeshRel.InverseTransformPosition(Pcar) - C;
				return (float)(D - Ax * FVector::DotProduct(D, Ax)).Size() - R;
			};
			for (const TCHAR* F : FreeFingerNames)
			{
				CurlFinger(F, Sx, FVector(95.f, 110.f, 85.f), Ac, Palm);
			}
			const FVector Q = (P(TEXT("index_02_") + Sx) + P(TEXT("middle_02_") + Sx)) * 0.5f;
			FVector OutQ = Q - C;
			OutQ = (OutQ - Ax * FVector::DotProduct(OutQ, Ax)).GetSafeNormal();
			AimThumb(Q + OutQ * 1.1f, 1.f);
			const float TipGap = GraspDist(MeshRel.TransformPosition(TipOf()));
			float Worst = 1e9f;
			for (int32 Part = 1; Part <= 4; ++Part)
			{
				Worst = FMath::Min(Worst, SkinMinDist(Side, Part, 0));
			}
			GraspDist = nullptr;
			Keep(Shape);
			if (Shape == 2)
			{
				// the flashlight in this grip: along the barrel toward the index's side (its head out past the thumb), the
				// switch toward the thumb; the hand round its barrel 12.5 cm from the tail (the switch just past the index)
				const FVector X = -Ac;
				FVector Z = TipOf() - C;
				Z = (Z - X * FVector::DotProduct(Z, X)).GetSafeNormal();
				const FTransform HoldCS(FRotationMatrix::MakeFromXZ(X, Z).ToQuat(), C - X * 12.5f);
				HoldInHand[Side] = HoldCS * Ht.Inverse();
			}
			UE_LOG(LogTemp, Display, TEXT("DriverArms: %s hand round a %.1f cm handle: closest finger skin %.2f cm from it, the thumb's tip %.2f cm"),
				*Sx, R * 2.f, Worst, TipGap);
		}
		UE_LOG(LogTemp, Display, TEXT("DriverArms: %s hand: the palm's skin %.2f cm out from its middle; %d twist bones"), *Sx, Out, Twist[Side].Num());
	}
	Mesh->BoneSpaceTransforms = Saved;
	bShapes = true;
}

void ADriverArms::FreeFollow()
{
	if (!bShapes || GripPose.Num() != Mesh->BoneSpaceTransforms.Num())
	{
		return;
	}
	Mesh->BoneSpaceTransforms = GripPose;
	Mesh->SetRelativeTransform(SitChestCS.Inverse() * FreeChest);
	const FTransform& MeshRel = Mesh->GetRelativeTransform();
	const FQuat ChestTurn = FreeChest.GetRotation() * SitChestCar.GetRotation().Inverse();
	const FVector G = GetActorTransform().InverseTransformVectorNoScale(FVector(0.f, 0.f, -1.f)).GetSafeNormal();
	const FVector ChestAt = FreeChest.GetLocation();
	for (int32 Side = 0; Side < 2; ++Side)
	{
		const TCHAR* Sx = Side == 0 ? TEXT("l") : TEXT("r");
		const FName Upper(*FString::Printf(TEXT("upperarm_%s"), Sx)), Lower(*FString::Printf(TEXT("lowerarm_%s"), Sx)),
			Hand(*FString::Printf(TEXT("hand_%s"), Sx));
		if (Mesh->GetBoneIndex(Hand) == INDEX_NONE || ShapeLocal[Side][1].Num() == 0)
		{
			continue;
		}
		const FFreeHand& F = Free[Side];
		const FVector Sh = MeshRel.TransformPosition(BoneCS(Upper).GetLocation());
		const float L1 = FVector::Dist(GripShoulder[Side], GripElbow[Side]), L2 = FVector::Dist(GripElbow[Side], GripWrist[Side]);
		// hanging free: down from the shoulder, the elbow a little bent, the palm turned in toward the body
		FVector In = ChestAt - Sh;
		In = (In - G * FVector::DotProduct(In, G)).GetSafeNormal();
		if (In.IsNearlyZero())
		{
			In = ChestTurn.RotateVector(FVector(0.f, Side == 0 ? 1.f : -1.f, 0.f));
		}
		const FQuat HangRot = FreeFrameXY(G, In) * FreeFrameXY(FingerL[Side], FaceL[Side]).Inverse();
		const FVector HangWrist = Sh + G * (L1 + L2) * 0.92f;
		const float e = FreeEase(F.W);
		const FVector Wrist = FMath::Lerp(HangWrist, F.Hand.GetLocation(), e);
		const FQuat HandRot = FQuat::Slerp(HangRot, F.Hand.GetRotation(), e);
		// two-bone: the elbow toward its pole
		const FVector D = Wrist - Sh;
		const float Dist = FMath::Max(1.f, FMath::Min((float)D.Size(), (L1 + L2) * 0.999f));
		const FVector Dir = D.GetSafeNormal();
		FVector Pole = F.Pole.IsNearlyZero() ? ChestTurn.RotateVector(GripElbow[Side] - GripShoulder[Side]) : F.Pole;
		Pole = (Pole - Dir * FVector::DotProduct(Pole, Dir)).GetSafeNormal();
		if (Pole.IsNearlyZero())
		{
			Pole = FVector::CrossProduct(Dir, ChestTurn.RotateVector(FVector(0.f, 1.f, 0.f))).GetSafeNormal();
		}
		const float A = (L1 * L1 - L2 * L2 + Dist * Dist) / (2.f * Dist);
		const FVector Elbow = Sh + Dir * A + Pole * FMath::Sqrt(FMath::Max(0.f, L1 * L1 - A * A));
		const FVector WristAt = Sh + Dir * Dist;
		// each bone turned about its own hinge (never sideways at the elbow: that folds the skin into a fin)
		const FVector UDc = DirToCS(Elbow - Sh), FDc = DirToCS(WristAt - Elbow);
		FVector Bd = FVector::CrossProduct(UDc, FDc);
		Bd = Bd.SizeSquared() > 1e-4f ? Bd.GetSafeNormal() : BoneCS(Upper).GetRotation().RotateVector(BendU[Side]);
		SetBoneCS(Upper, FreeFrameXY(UDc, Bd) * FreeFrameXY(AlongU[Side], BendU[Side]).Inverse());
		SetBoneCS(Lower, FreeFrameXY(FDc, Bd) * FreeFrameXY(AlongF[Side], BendF[Side]).Inverse());
		SetBoneCS(Hand, MeshRel.GetRotation().Inverse() * HandRot);
		// the hand's turn on the forearm shared out down the forearm's twist bones
		if (Twist[Side].Num() > 0)
		{
			const FQuat Rel = (BoneCS(Lower).GetRotation().Inverse() * BoneCS(Hand).GetRotation()) * HandInFore[Side].Inverse();
			FQuat Sw, Tw;
			Rel.ToSwingTwist(AlongF[Side], Sw, Tw);
			float Ang = FMath::UnwindRadians(Tw.GetAngle());
			if (FVector::DotProduct(Tw.GetRotationAxis(), AlongF[Side]) < 0.f)
			{
				Ang = -Ang;
			}
			const FQuat HandWas = BoneCS(Hand).GetRotation();
			for (const TPair<int32, float>& T : Twist[Side])
			{
				FTransform& Bt = Mesh->BoneSpaceTransforms[T.Key];
				Bt.SetRotation(FQuat(AlongF[Side], Ang * T.Value) * Bt.GetRotation());
			}
			SetBoneCS(Hand, HandWas);
		}
		// the fingers: relaxed, closing into the hand's shape
		for (const TPair<int32, FQuat>& Kv : ShapeLocal[Side][1])
		{
			Mesh->BoneSpaceTransforms[Kv.Key].SetRotation(Kv.Value);
		}
		const int32 Shape = FMath::Clamp<int32>(F.Shape, 0, 3);
		const float c = FreeEase(F.Close);
		if (Shape != 1 && c > 0.f)
		{
			for (const TPair<int32, FQuat>& Kv : ShapeLocal[Side][Shape])
			{
				FTransform& T = Mesh->BoneSpaceTransforms[Kv.Key];
				T.SetRotation(FQuat::Slerp(T.GetRotation(), Kv.Value, c));
			}
		}
	}
}

FTransform ADriverArms::HandAtPalm(int32 Side, const FVector& PalmAt, const FVector& Finger, const FVector& Facing) const
{
	const FQuat R = FreeFrameXY(Finger, Facing) * FreeFrameXY(FingerL[Side], FaceL[Side]).Inverse();
	return FTransform(R, PalmAt - R.RotateVector(PalmSkinL[Side]));
}

FTransform ADriverArms::HandOnHandle(int32 Side, const FTransform& Handle) const
{
	return HoldInHand[Side].Inverse() * Handle;
}

FTransform ADriverArms::HandleInHand(int32 Side) const
{
	return HoldInHand[Side] * HandNow(Side);
}

FTransform ADriverArms::HandNow(int32 Side) const
{
	return BoneCS(Side == 0 ? TEXT("hand_l") : TEXT("hand_r")) * Mesh->GetRelativeTransform();
}

FVector ADriverArms::PalmNow(int32 Side, FVector* Facing) const
{
	const FTransform H = HandNow(Side);
	if (Facing)
	{
		*Facing = H.GetRotation().RotateVector(FaceL[Side]);
	}
	return H.TransformPosition(PalmSkinL[Side]);
}
