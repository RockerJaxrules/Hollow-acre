#include "DriverArms.h"

#include "Components/PoseableMeshComponent.h"
#include "Engine/SkeletalMesh.h"

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

void ADriverArms::CurlFinger(const FString& Finger, const FString& Sx, const FVector& Deg, const FVector& AxisCS, const FVector& PalmCS)
{
	// Close the finger round the rim: each joint bends toward the palm a few degrees at a time until the finger
	// touches the rim's surface (or reaches its limit), then the next joint takes over. The finger wraps the rim.
	const FName J[3] = { *FString::Printf(TEXT("%s_01_%s"), *Finger, *Sx), *FString::Printf(TEXT("%s_02_%s"), *Finger, *Sx),
		*FString::Printf(TEXT("%s_03_%s"), *Finger, *Sx) };
	for (const FName& B : J)
	{
		if (Mesh->GetBoneIndex(B) == INDEX_NONE)
		{
			return;
		}
	}
	auto Tip = [&]() { const FVector A = BoneCS(J[1]).GetLocation(), Bp = BoneCS(J[2]).GetLocation(); return Bp + (Bp - A) * 0.85f; };
	auto Clearance = [&](int From)
	{
		float M = 1e9f;
		for (int m = From; m < 3; ++m)
		{
			const FVector A = BoneCS(J[m]).GetLocation();
			const FVector Bp = (m < 2) ? BoneCS(J[m + 1]).GetLocation() : Tip();
			for (float t : { 0.35f, 0.7f, 1.0f })
			{
				M = FMath::Min(M, RimDistCS(FMath::Lerp(A, Bp, t)));
			}
		}
		return M;
	};
	const float Skin = 0.8f;                          // bone line to the finger's skin
	const float Step = FMath::DegreesToRadians(2.5f);
	const float Max[3] = { (float)Deg.X, (float)Deg.Y, (float)Deg.Z };
	for (int k = 0; k < 3; ++k)
	{
		// which way bends toward the palm
		const FTransform T0 = BoneCS(J[k]);
		const FVector Child = (k < 2) ? BoneCS(J[k + 1]).GetLocation() : Tip();
		const FVector V = Child - T0.GetLocation();
		const float Sign = FVector::DotProduct(FQuat(AxisCS, 0.2f).RotateVector(V) - V, PalmCS) >= 0.f ? 1.f : -1.f;
		float Done = 0.f;
		while (Done < FMath::DegreesToRadians(Max[k]))
		{
			if (Clearance(k) < Skin)
			{
				if (Done > 0.f)
				{
					SetBoneCS(J[k], FQuat(AxisCS, -Sign * Step * 0.5f) * BoneCS(J[k]).GetRotation());   // back off half a step
				}
				break;
			}
			SetBoneCS(J[k], FQuat(AxisCS, Sign * Step) * BoneCS(J[k]).GetRotation());
			Done += Step;
		}
	}
}

void ADriverArms::BendToRim(FName Bone, FName Child, float MaxDeg)
{
	// bend a thumb joint toward the rim until its pad touches (axis: across the thumb, toward the nearest rim surface)
	if (Mesh->GetBoneIndex(Bone) == INDEX_NONE || Mesh->GetBoneIndex(Child) == INDEX_NONE)
	{
		return;
	}
	const float Step = FMath::DegreesToRadians(2.5f);
	float Done = 0.f;
	while (Done < FMath::DegreesToRadians(MaxDeg))
	{
		const FTransform T = BoneCS(Bone);
		const FVector C = BoneCS(Child).GetLocation();
		const FVector TipP = C + (C - T.GetLocation()) * 0.9f;
		if (FMath::Min(RimDistCS(TipP), RimDistCS(C)) < 0.8f)
		{
			break;
		}
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
	// the wrist sits behind the knuckles, the knuckle row just outside the rim
	// the rim lies across the palm: about 2.4 cm past the knuckles along the fingers and 2.6 cm to the palm side of
	// the knuckle line, so the curled fingers close round it
	const FVector Knuckles = Grip - F * 2.4f + Back * 2.6f;
	const FVector Wrist = Knuckles - F * LMeta;

	// ---- two-bone IK: shoulder, elbow, wrist (car frame)
	const FVector Sh = MeshRel.TransformPosition(BoneCS(N(TEXT("upperarm"))).GetLocation());
	const FVector El0 = MeshRel.TransformPosition(BoneCS(N(TEXT("lowerarm"))).GetLocation());
	const float L1 = FVector::Dist(Sh, El0);
	const float L2 = FVector::Dist(El0, MeshRel.TransformPosition(HandRef));
	FVector D = Wrist - Sh;
	float Dist = D.Size();
	const FVector Dir = D / Dist;
	if (Dist > (L1 + L2) * 0.995f)
	{
		UE_LOG(LogTemp, Warning, TEXT("DriverArms: %s wrist out of reach by %.1f cm"), *Sx, Dist - (L1 + L2));
		Dist = (L1 + L2) * 0.995f;
	}
	const float A = (L1 * L1 - L2 * L2 + Dist * Dist) / (2.f * Dist);
	const float Hh = FMath::Sqrt(FMath::Max(0.f, L1 * L1 - A * A));
	FVector Pole(0.f, (bLeft ? -1.f : 1.f) * G.ElbowPole.X, G.ElbowPole.Y);
	Pole = (Pole - Dir * FVector::DotProduct(Pole, Dir)).GetSafeNormal();
	const FVector Elbow = Sh + Dir * A + Pole * Hh;
	const FVector WristReached = Sh + Dir * Dist;

	// aim the upper arm at the elbow, the forearm at the wrist
	auto Aim = [&](FName Bone, FName Child, const FVector& TargetCar)
	{
		const FTransform Tb = BoneCS(Bone);
		const FVector Cur = (BoneCS(Child).GetLocation() - Tb.GetLocation()).GetSafeNormal();
		const FVector Want = (ToCS(TargetCar) - Tb.GetLocation()).GetSafeNormal();
		SetBoneCS(Bone, FQuat::FindBetweenNormals(Cur, Want) * Tb.GetRotation());
	};
	Aim(N(TEXT("upperarm")), N(TEXT("lowerarm")), Elbow);
	Aim(N(TEXT("lowerarm")), N(TEXT("hand")), WristReached);

	// the hand: turn its reference frame onto the target frame
	const FVector fT = DirToCS(F), sT = DirToCS(S), pT = DirToCS(P);
	const FMatrix MRef(fR, sR, pR, FVector::ZeroVector);
	const FMatrix MTgt(fT, sT, pT, FVector::ZeroVector);
	const FQuat Rot(MRef.GetTransposed() * MTgt);
	// (applied to the hand's reference rotation: the frame above was measured in the reference pose)
	SetBoneCS(N(TEXT("hand")), Rot * RefHandRot[bLeft ? 0 : 1]);

	// fingers close round the rim; the thumb lies along the driver face toward twelve
	const FVector KnuckleAxis = DirToCS(S);
	const FVector Palm = DirToCS(P);
	CurlFinger(TEXT("index"), Sx, G.Index, KnuckleAxis, Palm);
	CurlFinger(TEXT("middle"), Sx, G.Middle, KnuckleAxis, Palm);
	CurlFinger(TEXT("ring"), Sx, G.Ring, KnuckleAxis, Palm);
	CurlFinger(TEXT("pinky"), Sx, G.Pinky, KnuckleAxis, Palm);
	if (Mesh->GetBoneIndex(N(TEXT("thumb_01"))) != INDEX_NONE)
	{
		const FVector Th1 = BoneCS(N(TEXT("thumb_01"))).GetLocation();
		const FVector Th3 = BoneCS(N(TEXT("thumb_03"))).GetLocation();
		const FVector Want = DirToCS((T12 + Nw * 0.3f - P * 0.15f).GetSafeNormal());
		const FTransform T1 = BoneCS(N(TEXT("thumb_01")));
		SetBoneCS(N(TEXT("thumb_01")), FQuat::FindBetweenNormals((Th3 - Th1).GetSafeNormal(), Want) * T1.GetRotation());
		BendToRim(N(TEXT("thumb_02")), N(TEXT("thumb_03")), 35.f);
		BendToRim(N(TEXT("thumb_03")), N(TEXT("thumb_03")), 0.f);
	}
	UE_LOG(LogTemp, Display, TEXT("DriverArms: %s grip %s wrist %s elbow %s (reach %.1f of %.1f)"), *Sx, *Grip.ToString(),
		*WristReached.ToString(), *Elbow.ToString(), Dist, L1 + L2);
}

void ADriverArms::BeginPlay()
{
	Super::BeginPlay();
	if (Body)
	{
		Mesh->SetSkinnedAssetAndUpdate(Body);
	}
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
