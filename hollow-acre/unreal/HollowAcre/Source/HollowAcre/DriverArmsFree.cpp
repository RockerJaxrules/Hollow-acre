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
#include "Materials/MaterialInstanceDynamic.h"
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
	{
		// the waist and the ankles in the reference pose (component space), for the clothes
		const FReferenceSkeleton& Rs = SM->GetRefSkeleton();
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
		if (Rs.FindBoneIndex(TEXT("pelvis")) != INDEX_NONE && Rs.FindBoneIndex(TEXT("foot_l")) != INDEX_NONE)
		{
			RefWaistZ = (float)RefCS(TEXT("pelvis")).Z + 7.f;
			RefAnkleZ = (float)RefCS(TEXT("foot_l")).Z + 4.f;
		}
		UE_LOG(LogTemp, Display, TEXT("DriverArms: the body's waist at %.1f cm, its ankles at %.1f (reference pose)"), RefWaistZ, RefAnkleZ);
		if (ClothesMID)
		{
			ClothesMID->SetScalarParameterValue(TEXT("WaistZ"), RefWaistZ);
			ClothesMID->SetScalarParameterValue(TEXT("AnkleZ"), RefAnkleZ);
		}
	}
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
		{
			// spread: each finger's root turned about the palm's normal, away from the middle finger
			const TCHAR* Fs[4] = {TEXT("index"), TEXT("middle"), TEXT("ring"), TEXT("pinky")};
			const float Spread[4] = {-9.f, -1.f, 5.f, 11.f};          // (toward the little finger: +)
			for (int32 f = 0; f < 4; ++f)
			{
				const FName J1(*FString::Printf(TEXT("%s_01_%s"), Fs[f], *Sx)), J2(*FString::Printf(TEXT("%s_02_%s"), Fs[f], *Sx));
				const FVector Root = BoneCS(J1).GetLocation(), Tip0 = BoneCS(J2).GetLocation();
				const FQuat Was = BoneCS(J1).GetRotation();
				SetBoneCS(J1, FQuat(Palm, 0.1f) * Was);
				const float Dir = FVector::DotProduct(BoneCS(J2).GetLocation() - Tip0, Ac) >= 0.f ? 1.f : -1.f;
				SetBoneCS(J1, FQuat(Palm, Dir * FMath::DegreesToRadians(Spread[f])) * Was);
				(void)Root;
			}
		}
		for (const TCHAR* F : FreeFingerNames)
		{
			CurlFixed(F, FVector(4.f, 6.f, 3.f));
		}
		AimThumb(P(TEXT("index_01_") + Sx) + Fd * 1.0f - Ac * 3.8f + Palm * 0.6f, 0.6f);
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
				const FTransform HoldCS(FRotationMatrix::MakeFromXZ(X, Z).ToQuat(), C - X * 15.5f);   // (15.5 cm up from the tail: the tail shows below the little finger)
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
	if (bSeatedLegs)
	{
		// seated: the thighs forward over the cushion (the knees a little higher than the hips), the shins down to the pedals;
		// in the car's own frame as it sits (the chest held by the belt)
		for (int32 Side = 0; Side < 2; ++Side)
		{
			const TCHAR* Sx = Side == 0 ? TEXT("l") : TEXT("r");
			const FName Th(*FString::Printf(TEXT("thigh_%s"), Sx)), Ca(*FString::Printf(TEXT("calf_%s"), Sx)), Ft(*FString::Printf(TEXT("foot_%s"), Sx));
			const int32 Ti = Mesh->GetBoneIndex(Th);
			if (Ti == INDEX_NONE || Mesh->GetBoneIndex(Ca) == INDEX_NONE || Mesh->GetBoneIndex(Ft) == INDEX_NONE)
			{
				continue;
			}
			Mesh->BoneSpaceTransforms[Ti].SetScale3D(FVector::OneVector);
			const float Sg = Side == 0 ? -1.f : 1.f;
			auto AimBone = [&](FName Bone, FName Child, const FVector& WantCar)
			{
				const FTransform Tb = BoneCS(Bone);
				const FVector Cur = (BoneCS(Child).GetLocation() - Tb.GetLocation()).GetSafeNormal();
				SetBoneCS(Bone, FQuat::FindBetweenNormals(Cur, DirToCS(WantCar)) * Tb.GetRotation());
			};
			// (measured in the car: the hips at the back of the cushion, the knees under the dash's lower edge, the feet on the
			// floor at the pedals)
			AimBone(Th, Ca, FVector(0.9f, Sg * 0.1f, 0.42f));
			AimBone(Ca, Ft, FVector(0.64f, Sg * 0.03f, -0.77f));
		}
	}
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
		// the hand's skin points held off the floor: each finger joint (and an estimate of each tip) with its skin radius
		struct FSkinPt { FName Bone; FName Parent; float R; bool bTip; };
		TArray<FSkinPt, TInlineAllocator<32>> SkinPts;
		if (bFloorGuard)
		{
			const FString Suf = FString::Printf(TEXT("_%s"), Sx);
			for (int32 b = 0; b < Mesh->GetNumBones(); ++b)
			{
				const FName Bn = Mesh->GetBoneName(b);
				const FString S = Bn.ToString();
				if (!S.EndsWith(Suf))
				{
					continue;
				}
				const bool bFinger = S.StartsWith(TEXT("thumb_")) || S.StartsWith(TEXT("index_")) || S.StartsWith(TEXT("middle_")) ||
					S.StartsWith(TEXT("ring_")) || S.StartsWith(TEXT("pinky_"));
				TArray<FString> Parts;
				S.ParseIntoArray(Parts, TEXT("_"));
				if (bFinger && Parts.Num() == 3)   // (the joints themselves, not the skeleton's helpers: _dip_, _pip_, _bulge_...)
				{
					const bool bMeta = S.Contains(TEXT("metacarpal"));
					SkinPts.Add({Bn, Mesh->GetParentBone(Bn), bMeta ? 1.2f : 0.85f, S.Contains(TEXT("_03_"))});
				}
				else if (Bn == Hand)
				{
					SkinPts.Add({Bn, NAME_None, 2.2f, false});
				}
			}
		}
		FVector Lift = FVector::ZeroVector;
		FloorDepthIn[Side] = FloorDepthOut[Side] = 0.f;
		for (int32 Pass = 0; Pass < 3; ++Pass)
		{
		const FVector Wrist = FMath::Lerp(HangWrist, F.Hand.GetLocation(), e) + Lift;
		for (const TPair<int32, float>& T : Twist[Side])
		{
			Mesh->BoneSpaceTransforms[T.Key] = GripPose[T.Key];   // (each pass twists from the start again)
		}
		const FQuat HandRot = FQuat::Slerp(HangRot, F.Hand.GetRotation(), e);
		const FVector PoleWay = F.Pole.IsNearlyZero() ? ChestTurn.RotateVector(GripElbow[Side] - GripShoulder[Side]).GetSafeNormal() : F.Pole.GetSafeNormal();
		const FVector PoleClear = F.bRig ? PoleClearOfFloor(Side, BoneCar(Side == 0 ? TEXT("upperarm_l") : TEXT("upperarm_r")), Wrist, PoleWay, 5.f) : PoleWay;
		bool bRigged = false;
		if (F.bRig && F.AnimTime >= 0.f && ArmAnim)
		{
			// the arm as keyed in Sequencer; then collision: should the fingers press into the floor (Lift, from the passes
			// before) or what the hand holds hit it (ExtraLift), the hand is lifted clear by the rig's IK, its elbow kept
			// on the keyed side
			bRigged = AnimArm(Side, F.AnimTime);
			const FVector Up = Lift + ExtraLift[Side];
			if (bRigged && !Up.IsNearlyZero(0.05f))
			{
				const FTransform H = HandNow(Side);
				const FVector ShA = BoneCar(Side == 0 ? TEXT("upperarm_l") : TEXT("upperarm_r")), ElA = BoneCar(Side == 0 ? TEXT("lowerarm_l") : TEXT("lowerarm_r"));
				RigSolveArm(Side, FTransform(H.GetRotation(), H.GetLocation() + Up), (ElA - (ShA + H.GetLocation()) * 0.5f).GetSafeNormal());
			}
		}
		else
		{
			bRigged = F.bRig && RigSolveArm(Side, FTransform(HandRot, Wrist + ExtraLift[Side]), PoleClear);
		}
		if (!bRigged)
		{
		// two-bone: the elbow toward its pole
		const FVector D = Wrist - Sh;
		const float Dist = FMath::Max(1.f, FMath::Min((float)D.Size(), (L1 + L2) * 0.999f));
		const FVector Dir = D.GetSafeNormal();
		// (the elbow's way: as at the wheel, turned with the chest, blended toward Pole by Pole's length, 1 = all the way)
		const FVector PoleWheel = ChestTurn.RotateVector(GripElbow[Side] - GripShoulder[Side]).GetSafeNormal();
		FVector Pole = F.Pole.IsNearlyZero() ? PoleWheel : FMath::Lerp(PoleWheel, F.Pole.GetSafeNormal(), FMath::Min(1.f, (float)F.Pole.Size()));
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
			// (a hand closing on something closes in a wave: the index and thumb first, the little finger last)
			const float St = FMath::Clamp(F.Stagger, 0.f, 0.6f);
			for (const TPair<int32, FQuat>& Kv : ShapeLocal[Side][Shape])
			{
				float cb = c;
				if (St > 0.f)
				{
					const FString Bn = Mesh->GetBoneName(Kv.Key).ToString();
					const float Order = Bn.StartsWith(TEXT("middle")) ? 1.f : Bn.StartsWith(TEXT("ring")) ? 2.f : Bn.StartsWith(TEXT("pinky")) ? 3.f : 0.f;
					cb = FMath::Clamp(c * (1.f + St) - St * Order / 3.f, 0.f, 1.f);
				}
				FTransform& T = Mesh->BoneSpaceTransforms[Kv.Key];
				T.SetRotation(FQuat::Slerp(T.GetRotation(), Kv.Value, cb));
			}
		}
		// (the hand opening wide on its way to something, wider than it, before it closes on it)
		const float o = FreeEase(FMath::Clamp(F.Open, 0.f, 1.f));
		if (o > 0.f)
		{
			for (const TPair<int32, FQuat>& Kv : ShapeLocal[Side][0])
			{
				FTransform& T = Mesh->BoneSpaceTransforms[Kv.Key];
				T.SetRotation(FQuat::Slerp(T.GetRotation(), Kv.Value, o));
			}
		}
		// a finger pressed on the floor straightens back onto it (a hand pushed flat), each finger turned up at its knuckle
		// just enough that its joints and tip are clear; only what that can't clear lifts the hand
		if (bFloorGuard && SkinPts.Num() > 0)
		{
			static const TCHAR* Fingers[] = {TEXT("index"), TEXT("middle"), TEXT("ring"), TEXT("pinky"), TEXT("thumb")};
			const FVector NcS = DirToCS(FloorN);
			const FVector AtCS = MeshRel.InverseTransformPosition(FloorAt);
			for (const TCHAR* Fn : Fingers)
			{
				const FName B1(*FString::Printf(TEXT("%s_01_%s"), Fn, Sx)), B2(*FString::Printf(TEXT("%s_02_%s"), Fn, Sx)), B3(*FString::Printf(TEXT("%s_03_%s"), Fn, Sx));
				if (Mesh->GetBoneIndex(B1) == INDEX_NONE || Mesh->GetBoneIndex(B3) == INDEX_NONE)
				{
					continue;
				}
				for (int32 It = 0; It < 3; ++It)
				{
					const FVector P1 = BoneCS(B1).GetLocation(), P2 = BoneCS(B2).GetLocation(), P3 = BoneCS(B3).GetLocation();
					const FVector Tip = P3 + (P3 - P2) * 0.75f;
					const FVector Car1 = MeshRel.TransformPosition(P1);
					if (!FloorBox.IsInside(FVector2D(Car1.X, Car1.Y)))
					{
						break;
					}
					// the deepest of the finger's points below the floor (skin ~0.85 cm), and how far it is from the knuckle
					float Deep = 0.f, Arm = 1.f;
					for (const FVector& P : {P2, P3, Tip})
					{
						const float Dd = 0.85f - (float)FVector::DotProduct(P - AtCS, NcS);
						if (Dd > Deep)
						{
							Deep = Dd;
							Arm = FMath::Max(1.f, (float)FVector::Dist(P, P1));
						}
					}
					if (Deep <= 0.05f)
					{
						break;
					}
					const FVector Along = (Tip - P1).GetSafeNormal();
					FVector Axis = FVector::CrossProduct(Along, NcS);
					if (Axis.SizeSquared() < 1e-4f)
					{
						break;
					}
					Axis.Normalize();
					const float Ang = FMath::Min(FMath::Asin(FMath::Clamp((Deep + 0.1f) / Arm, 0.f, 1.f)), FMath::DegreesToRadians(35.f));
					SetBoneCS(B1, FQuat(Axis, Ang) * BoneCS(B1).GetRotation());
				}
			}
		}
		// measured against the floor: the deepest skin point under it lifts the wrist by that much and the arm is solved again
		if (SkinPts.Num() == 0)
		{
			break;
		}
		float Deep = 0.f;
		for (const FSkinPt& Pt : SkinPts)
		{
			FVector P = MeshRel.TransformPosition(BoneCS(Pt.Bone).GetLocation());
			if (Pt.bTip && Pt.Parent != NAME_None)
			{
				const FVector Pp = MeshRel.TransformPosition(BoneCS(Pt.Parent).GetLocation());
				P += (P - Pp) * 0.75f;
			}
			if (!FloorBox.IsInside(FVector2D(P.X, P.Y)))
			{
				continue;
			}
			const float Dp = Pt.R - (float)FVector::DotProduct(P - FloorAt, FloorN);
			if (Dp > Deep)
			{
				Deep = Dp;
				if (Pass == 0)
				{
					FloorWorst[Side] = Pt.bTip ? FName(*(Pt.Bone.ToString() + TEXT("_tip"))) : Pt.Bone;
				}
			}
		}
		if (Pass == 0)
		{
			FloorDepthIn[Side] = Deep;
		}
		FloorDepthOut[Side] = Deep;
		if (Deep <= 0.05f)
		{
			break;
		}
		Lift += FloorN * (Deep + 0.1f);
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
	return GripNow(Side).Inverse() * Handle;
}

FTransform ADriverArms::GripNow(int32 Side) const
{
	if (bGripTaken[Side])
	{
		return GripTaken[Side];
	}
	if (FMath::IsNearlyZero(GripTilt[Side]))
	{
		return HoldInHand[Side];
	}
	// (turned about the palm's facing, through the point where the hand closes on it, 15.5 cm up from the tail)
	const FVector G = HoldInHand[Side].TransformPosition(FVector(15.5f, 0.f, 0.f));
	const FQuat Q(FaceL[Side].GetSafeNormal(), FMath::DegreesToRadians(GripTilt[Side]));
	FTransform T = HoldInHand[Side];
	T.SetRotation(Q * T.GetRotation());
	T.SetLocation(G + Q.RotateVector(T.GetLocation() - G));
	return T;
}

void ADriverArms::HandAxes(int32 Side, const FQuat& Rot, FVector& Finger, FVector& Palm, FVector& Across) const
{
	Finger = Rot.RotateVector(FingerL[Side]);
	Palm = Rot.RotateVector(FaceL[Side]);
	Across = Rot.RotateVector(AcrossL[Side]);
}

void ADriverArms::ArmLengths(int32 Side, float& Upper, float& Fore) const
{
	const TCHAR* Sx = Side == 0 ? TEXT("l") : TEXT("r");
	const FVector S = BoneCar(FName(*FString::Printf(TEXT("upperarm_%s"), Sx)));
	const FVector E = BoneCar(FName(*FString::Printf(TEXT("lowerarm_%s"), Sx)));
	const FVector W = BoneCar(FName(*FString::Printf(TEXT("hand_%s"), Sx)));
	Upper = (float)FVector::Dist(S, E);
	Fore = (float)FVector::Dist(E, W);
}

FVector ADriverArms::ElbowFor(int32 Side, const FVector& Shoulder, const FVector& Wrist, const FVector& PoleDirCar) const
{
	float Lu, Lf;
	ArmLengths(Side, Lu, Lf);
	const FVector SW = Wrist - Shoulder;
	const float d = FMath::Max((float)SW.Size(), 1e-3f);
	const FVector u = SW / d;
	if (d >= Lu + Lf - 0.01f)
	{
		return Shoulder + u * Lu;
	}
	const FVector PoleAt = (Shoulder + Wrist) * 0.5f + PoleDirCar.GetSafeNormal() * 40.f;
	FVector v = PoleAt - Shoulder;
	v = (v - u * FVector::DotProduct(v, u)).GetSafeNormal();
	const float a = (Lu * Lu - Lf * Lf + d * d) / (2.f * d);
	const float hh = FMath::Sqrt(FMath::Max(0.f, Lu * Lu - a * a));
	return Shoulder + u * a + v * hh;
}

FVector ADriverArms::PoleClearOfFloor(int32 Side, const FVector& Shoulder, const FVector& Wrist, const FVector& Pole, float Clear) const
{
	if ((!bFloorGuard && HeadGuardR <= 0.f && EyeGuardR <= 0.f) || Pole.IsNearlyZero())
	{
		return Pole;
	}
	// (the margin: the elbow's height over Clear, and the arm's distance from the head; the least of them)
	auto Height = [&](const FVector& Pl)
	{
		const FVector E = ElbowFor(Side, Shoulder, Wrist, Pl);
		float M = 1e3f;
		if (bFloorGuard && FloorBox.IsInside(FVector2D(E.X, E.Y)))
		{
			M = (float)FVector::DotProduct(E - FloorAt, FloorN);
		}
		return FMath::Min(M, ArmHeadClear(Shoulder, E, Wrist) + Clear);
	};
	if (Height(Pole) >= Clear)
	{
		return Pole;
	}
	// (swung about the shoulder-wrist line, the least turn that clears it; between the steps, found by halving)
	const FVector Ax = (Wrist - Shoulder).GetSafeNormal();
	auto Turned = [&](float Deg) { return FQuat(Ax, FMath::DegreesToRadians(Deg)).RotateVector(Pole); };
	FVector Best = Pole;
	float BestH = Height(Pole);
	for (float A = 4.f; A <= 180.f; A += 4.f)
	{
		const float Hp = Height(Turned(A)), Hm = Height(Turned(-A));
		if (Hp >= Clear || Hm >= Clear)
		{
			const float Sg = Hp >= Hm ? 1.f : -1.f;
			float Lo = A - 4.f, Hi = A;
			for (int32 i = 0; i < 10; ++i)
			{
				const float Md = 0.5f * (Lo + Hi);
				(Height(Turned(Md * Sg)) >= Clear ? Hi : Lo) = Md;
			}
			return Turned(Hi * Sg);
		}
		if (FMath::Max(Hp, Hm) > BestH)
		{
			BestH = FMath::Max(Hp, Hm);
			Best = Hp >= Hm ? Turned(A) : Turned(-A);
		}
	}
	return Best;
}

float ADriverArms::ArmHeadClear(const FVector& Shoulder, const FVector& Elbow, const FVector& Wrist) const
{
	float M = 1e3f;
	if (HeadGuardR > 0.f)
	{
		M = FMath::Min(FMath::PointDistToSegment(HeadGuardAt, Shoulder, Elbow), FMath::PointDistToSegment(HeadGuardAt, Elbow, Wrist)) - HeadGuardR;
	}
	if (EyeGuardR > 0.f)
	{
		// (along each bone: in front of the eyes it keeps EyeGuardR off; out of view, below the chin or behind, EyeGuardRSide)
		for (int32 Seg = 0; Seg < 2; ++Seg)
		{
			const FVector A = Seg == 0 ? Shoulder : Elbow, B = Seg == 0 ? Elbow : Wrist;
			for (int32 i = 0; i <= 12; ++i)
			{
				const FVector P = FMath::Lerp(A, B, i / 12.f);
				const FVector D = P - EyeGuardAt;
				const float Dist = (float)D.Size();
				const float Cos = Dist > 1e-3f ? (float)FVector::DotProduct(D / Dist, EyeGuardFwd) : 1.f;
				const float InView = FMath::SmoothStep(0.5f, 0.82f, Cos);
				M = FMath::Min(M, Dist - FMath::Lerp(EyeGuardRSide, EyeGuardR, InView));
			}
		}
	}
	return M;
}

void ADriverArms::WristFor(int32 Side, const FVector& Elbow, const FTransform& Hand, float& Flex, float& Dev) const
{
	FVector Fi, Pa, Ac;
	HandAxes(Side, Hand.GetRotation(), Fi, Pa, Ac);
	const FVector A = (Hand.GetLocation() - Elbow).GetSafeNormal();
	const float Ah = FVector::DotProduct(A, Fi), Ap = FVector::DotProduct(A, Pa), Aa = FVector::DotProduct(A, Ac);
	// (bent toward the palm by f then toward the little finger by d, the forearm reads cos f cos d along the fingers,
	// -sin f along the palm's facing and -cos f sin d across: HandFromForearm's two turns, read back exactly)
	Flex = FMath::RadiansToDegrees(FMath::Atan2(-Ap, FMath::Sqrt(Ah * Ah + Aa * Aa)));
	Dev = FMath::RadiansToDegrees(FMath::Atan2(-Aa, Ah));
}

void ADriverArms::WristNow(int32 Side, float& Flex, float& Dev) const
{
	WristFor(Side, BoneCar(Side == 0 ? TEXT("lowerarm_l") : TEXT("lowerarm_r")), HandNow(Side), Flex, Dev);
}

FTransform ADriverArms::HandFromForearm(int32 Side, const FVector& Elbow, const FVector& Wrist, float Flex, float Dev, const FVector& PalmWay) const
{
	const FVector A = (Wrist - Elbow).GetSafeNormal();
	FVector P = PalmWay - A * FVector::DotProduct(PalmWay, A);
	if (P.SizeSquared() < 1e-6f)
	{
		P = FVector::CrossProduct(A, FVector::UpVector);
	}
	P.Normalize();
	// in line with the forearm, the palm facing PalmWay
	FQuat R = FreeFrameXY(A, P) * FreeFrameXY(FingerL[Side], FaceL[Side]).Inverse();
	FVector Fi, Pa, Ac;
	HandAxes(Side, R, Fi, Pa, Ac);
	// bent toward the palm (or back), about the hand's across axis
	const FVector Kf = FVector::CrossProduct(Fi, Pa).GetSafeNormal();
	R = FQuat(Kf, FMath::DegreesToRadians(Flex)) * R;
	HandAxes(Side, R, Fi, Pa, Ac);
	// then toward the little finger (or the thumb), about the palm's facing
	const FVector Kd = FVector::CrossProduct(Fi, Ac).GetSafeNormal();
	R = FQuat(Kd, FMath::DegreesToRadians(Dev)) * R;
	return FTransform(R.GetNormalized(), Wrist);
}

void ADriverArms::ForearmParams(int32 Side, const FVector& Elbow, const FTransform& Hand, float& Flex, float& Dev, FVector& PalmWay) const
{
	WristFor(Side, Elbow, Hand, Flex, Dev);
	FQuat R = Hand.GetRotation();
	FVector Fi, Pa, Ac;
	HandAxes(Side, R, Fi, Pa, Ac);
	R = FQuat(FVector::CrossProduct(Fi, Ac).GetSafeNormal(), FMath::DegreesToRadians(-Dev)) * R;
	HandAxes(Side, R, Fi, Pa, Ac);
	R = FQuat(FVector::CrossProduct(Fi, Pa).GetSafeNormal(), FMath::DegreesToRadians(-Flex)) * R;
	HandAxes(Side, R, Fi, Pa, Ac);
	PalmWay = Pa;
}

FTransform ADriverArms::HandleInHand(int32 Side) const
{
	return GripNow(Side) * HandNow(Side);
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

void ADriverArms::LeaveKeysOn(AActor* Car)
{
	if (!Car || bKeysLeft)
	{
		return;
	}
	bKeysLeft = true;
	TArray<USceneComponent*> On = RootComponent->GetAttachChildren();
	int32 n = 0;
	for (USceneComponent* C : On)
	{
		if (C && C != Mesh)
		{
			C->AttachToComponent(Car->GetRootComponent(), FAttachmentTransformRules::KeepWorldTransform);
			++n;
		}
	}
	UE_LOG(LogTemp, Display, TEXT("DriverArms: %d things left in the car (the key, its lock, the dash's glow)"), n);
}

FVector ADriverArms::BoneCar(FName Bone) const
{
	return Mesh->GetRelativeTransform().TransformPosition(BoneCS(Bone).GetLocation());
}

void ADriverArms::DumpBadBones(const TCHAR* Why) const
{
	int32 Bad = 0;
	for (int32 b = 0; b < Mesh->BoneSpaceTransforms.Num(); ++b)
	{
		const FTransform& T = Mesh->BoneSpaceTransforms[b];
		const FVector Sc = T.GetScale3D();
		const bool bNan = T.ContainsNaN() || !T.GetRotation().IsNormalized();
		if (bNan || Sc.GetMin() < 0.5f || Sc.GetMax() > 2.f)
		{
			if (++Bad <= 60)
			{
				UE_LOG(LogTemp, Display, TEXT("BadBone %s: %s %s rot %s loc %s scale %s"), Why, *Mesh->GetBoneName(b).ToString(), bNan ? TEXT("NOT FINITE") : TEXT(""),
					*T.GetRotation().ToString(), *T.GetLocation().ToString(), *Sc.ToString());
			}
		}
	}
	UE_LOG(LogTemp, Display, TEXT("BadBone %s: %d of %d bones broken"), Why, Bad, Mesh->BoneSpaceTransforms.Num());
}
