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
	Right.Index = FVector(48.f, 62.f, 22.f);   // never mirror copies
	Right.Middle = FVector(57.f, 72.f, 28.f);
	Right.Ring = FVector(60.f, 80.f, 34.f);
	Right.Pinky = FVector(64.f, 82.f, 36.f);
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

void ADriverArms::CurlFinger(const FString& Finger, const FString& Sx, const FVector& Deg, const FVector& AxisCS, const FVector& PalmCS)
{
	const FName J[3] = { *FString::Printf(TEXT("%s_01_%s"), *Finger, *Sx), *FString::Printf(TEXT("%s_02_%s"), *Finger, *Sx),
		*FString::Printf(TEXT("%s_03_%s"), *Finger, *Sx) };
	const float A[3] = { (float)Deg.X, (float)Deg.Y, (float)Deg.Z };
	for (int k = 0; k < 3; ++k)
	{
		if (Mesh->GetBoneIndex(J[k]) == INDEX_NONE)
		{
			return;
		}
		const FTransform T = BoneCS(J[k]);
		const FVector Child = (k < 2) ? BoneCS(J[k + 1]).GetLocation()
			: T.GetLocation() + (T.GetLocation() - BoneCS(J[k - 1]).GetLocation()) * 0.8f;
		const FVector V = Child - T.GetLocation();
		float Ang = FMath::DegreesToRadians(A[k]);
		const FVector Vp = FQuat(AxisCS, Ang).RotateVector(V);
		if (FVector::DotProduct(Vp - V, PalmCS) < 0.f)
		{
			Ang = -Ang;     // curl toward the palm
		}
		SetBoneCS(J[k], FQuat(AxisCS, Ang) * T.GetRotation());
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
	const FVector Wrist = Grip + Back * (RimTube + 0.9f) - F * LMeta;

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
	const FVector Knuckles = DirToCS(S);
	const FVector Palm = DirToCS(P);
	CurlFinger(TEXT("index"), Sx, G.Index, Knuckles, Palm);
	CurlFinger(TEXT("middle"), Sx, G.Middle, Knuckles, Palm);
	CurlFinger(TEXT("ring"), Sx, G.Ring, Knuckles, Palm);
	CurlFinger(TEXT("pinky"), Sx, G.Pinky, Knuckles, Palm);
	if (Mesh->GetBoneIndex(N(TEXT("thumb_01"))) != INDEX_NONE)
	{
		const FVector Th1 = BoneCS(N(TEXT("thumb_01"))).GetLocation();
		const FVector Th3 = BoneCS(N(TEXT("thumb_03"))).GetLocation();
		const FVector Want = DirToCS((T12 + Nw * 0.3f - P * 0.15f).GetSafeNormal());
		const FTransform T1 = BoneCS(N(TEXT("thumb_01")));
		SetBoneCS(N(TEXT("thumb_01")), FQuat::FindBetweenNormals((Th3 - Th1).GetSafeNormal(), Want) * T1.GetRotation());
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
