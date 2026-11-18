#include "HuskHunter.h"

#include "Components/SkeletalMeshComponent.h"
#include "EndingDirector.h"
#include "Engine/StaticMeshActor.h"
#include "Engine/World.h"
#include "Husk.h"
#include "Kismet/GameplayStatics.h"
#include "Part2Character.h"
#include "Part2Story.h"

namespace
{
	FRandomStream& Rng()
	{
		static FRandomStream R(9104);
		return R;
	}
	const TCHAR* StateName(AHuskHunter::EState S)
	{
		switch (S)
		{
		case AHuskHunter::EState::Away: return TEXT("away");
		case AHuskHunter::EState::Roam: return TEXT("roam");
		case AHuskHunter::EState::Investigate: return TEXT("investigate");
		case AHuskHunter::EState::Stalk: return TEXT("stalk");
		case AHuskHunter::EState::Chase: return TEXT("chase");
		case AHuskHunter::EState::Search: return TEXT("search");
		case AHuskHunter::EState::Retreat: return TEXT("retreat");
		case AHuskHunter::EState::Kill: return TEXT("kill");
		}
		return TEXT("?");
	}
}

AHuskHunter::AHuskHunter()
{
	PrimaryActorTick.bCanEverTick = true;
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
}

void AHuskHunter::Begin(AEndingDirector* InDirector, float InScale, float StartFar)
{
	Director = InDirector;
	Scale = InScale;
	Prey = Cast<APart2Character>(UGameplayStatics::GetPlayerPawn(this, 0));
	if (!Prey.IsValid())
	{
		UE_LOG(LogTemp, Warning, TEXT("HuskHunter: no player to hunt"));
		return;
	}
	const FVector From = OutOfSightNear(Prey->GetActorLocation(), StartFar * 0.85f, StartFar * 1.15f);
	FActorSpawnParameters P;
	P.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
	Husk = GetWorld()->SpawnActor<AHusk>(AHusk::StaticClass(), FTransform(From), P);
	if (!Husk || !Husk->Setup())
	{
		UE_LOG(LogTemp, Warning, TEXT("HuskHunter: the husk would not load"));
		return;
	}
	Husk->SetActorScale3D(FVector(Scale));
	TArray<UPrimitiveComponent*> Ps;
	Husk->GetComponents<UPrimitiveComponent>(Ps);
	for (UPrimitiveComponent* Pc : Ps)
	{
		Pc->SetLightingChannels(true, true, false);      // (lit by the town's own moon too, as the camp is)
		Pc->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	}
	const FVector ToPrey = (Prey->GetActorLocation() - From).GetSafeNormal2D();
	Yaw = FMath::RadiansToDegrees(FMath::Atan2(ToPrey.Y, ToPrey.X));
	Goal = OutOfSightNear(Prey->GetActorLocation(), 900.f, 1500.f);
	PlayTake(TEXT("Stalk"), 1.f);
	SetState(EState::Roam, TEXT("the hunt begins, out of sight"));
	Event(TEXT("hunt"));
}

void AHuskHunter::Event(const TCHAR* Kind) const
{
	if (Director)
	{
		Director->LogEvent(Kind);
	}
}

void AHuskHunter::SetState(EState S, const TCHAR* Why)
{
	if (S == State && StateT > 0.f)
	{
		return;
	}
	const float D = Prey.IsValid() && Husk ? FVector::Dist2D(Prey->GetActorLocation(), Husk->GetActorLocation()) : -1.f;
	UE_LOG(LogTemp, Display, TEXT("HuskHunt %.2f %s -> %s (%s); %.0f m from the player, menace %.2f, aware %.2f"), Clock, StateName(State), StateName(S), Why,
		D / 100.f, Menace, Aware);
	State = S;
	StateT = 0.f;
}

void AHuskHunter::HearNoise(const FVector& At, float Carries)
{
	if (!Husk || State == EState::Kill || State == EState::Retreat || State == EState::Away)
	{
		return;
	}
	const float D = FVector::Dist(At, Husk->GetActorLocation());
	if (D > Carries)
	{
		return;
	}
	Aware = FMath::Max(Aware, 0.25f + 0.5f * (1.f - D / Carries));
	LastKnown = At;
	if (State == EState::Roam || State == EState::Search)
	{
		Goal = At + FVector(Rng().FRandRange(-250.f, 250.f), Rng().FRandRange(-250.f, 250.f), 0.f);
		SetState(EState::Investigate, TEXT("heard something"));
	}
	else if (State == EState::Investigate)
	{
		Goal = At;
	}
}

float AHuskHunter::GroundAt(const FVector& At) const
{
	TArray<FHitResult> Hits;
	FCollisionQueryParams Q(TEXT("HunterGround"), true, this);
	// (every surface down the line, not just to the first solid one: a tree's or a roof's would stop a channel trace)
	GetWorld()->LineTraceMultiByObjectType(Hits, At + FVector(0.f, 0.f, 3000.f), At - FVector(0.f, 0.f, 3000.f), FCollisionObjectQueryParams(ECC_WorldStatic), Q);
	// (the snow it walks on: the camp's own ground first where there is any; else the terrain. Of several surfaces at one
	// place (the far terrain's coarse surface lies above the camp's snow in places), the one nearest its feet)
	float Best = At.Z, BestD = 1e9f;
	bool bTown = false;
	for (const FHitResult& H : Hits)
	{
		const UStaticMeshComponent* S = Cast<UStaticMeshComponent>(H.GetComponent());
		const FString N = S && S->GetStaticMesh() ? S->GetStaticMesh()->GetName() : FString();
		const bool bIsTown = N == TEXT("Town_Ground");
		if (!bIsTown && !(N.StartsWith(TEXT("Terrain")) || N == TEXT("Road")))
		{
			continue;
		}
		const float D = FMath::Abs(H.ImpactPoint.Z - At.Z);
		if ((bIsTown && !bTown) || ((bIsTown == bTown) && D < BestD))
		{
			Best = H.ImpactPoint.Z;
			BestD = D;
			bTown = bTown || bIsTown;
		}
	}
	return Best;
}

FVector AHuskHunter::HeadAt() const
{
	return Husk ? Husk->GetActorLocation() + FVector(0.f, 0.f, 150.f * Scale) : FVector::ZeroVector;
}

bool AHuskHunter::LineOfSight(const FVector& From, const FVector& To) const
{
	FCollisionQueryParams Q(TEXT("HunterSight"), true, this);
	if (Husk)
	{
		Q.AddIgnoredActor(Husk);
	}
	if (Prey.IsValid())
	{
		Q.AddIgnoredActor(Prey.Get());
		TArray<AActor*> On;
		Prey->GetAttachedActors(On, true, true);
		Q.AddIgnoredActors(On);
	}
	FHitResult H;
	return !GetWorld()->LineTraceSingleByChannel(H, From, To, ECC_Visibility, Q);
}

bool AHuskHunter::PreyCanSee(const FVector& P, bool* bInBeam) const
{
	if (bInBeam)
	{
		*bInBeam = false;
	}
	if (!Prey.IsValid())
	{
		return false;
	}
	const FVector Eye = Prey->EyesAt();
	const FVector To = P - Eye;
	const float D = To.Size();
	const float Cos = FVector::DotProduct(To.GetSafeNormal(), Prey->LookDir());
	if (Cos < FMath::Cos(FMath::DegreesToRadians(52.f)) || !LineOfSight(Eye, P))
	{
		return false;
	}
	bool bBeam = false;
	if (Prey->IsLightOn() && D < 3200.f)
	{
		const FVector B = P - Prey->BeamFrom();
		bBeam = FVector::DotProduct(B.GetSafeNormal(), Prey->BeamDir()) > FMath::Cos(FMath::DegreesToRadians(20.f));
	}
	if (bInBeam)
	{
		*bInBeam = bBeam;
	}
	return bBeam || D < 1300.f;          // (by the moon on the snow, a dark shape only near)
}

FVector AHuskHunter::OutOfSightNear(const FVector& Around, float MinR, float MaxR) const
{
	FVector Best = Around + FVector(MaxR, 0.f, 0.f);
	float BestScore = -1e9f;
	for (int32 i = 0; i < 28; ++i)
	{
		const float A = Rng().FRandRange(0.f, 2.f * PI);
		const float R = Rng().FRandRange(MinR, MaxR);
		FVector C = Around + FVector(FMath::Cos(A), FMath::Sin(A), 0.f) * R;
		C.Z = GroundAt(C);
		float Score = 0.f;
		if (Prey.IsValid())
		{
			const FVector To = (C - Prey->EyesAt()).GetSafeNormal();
			Score -= 2.f * FVector::DotProduct(To, Prey->LookDir());              // (behind the player's eyes is better)
			Score += LineOfSight(Prey->EyesAt(), C + FVector(0.f, 0.f, 120.f)) ? 0.f : 1.5f;   // (and hidden is better)
		}
		Score += Rng().FRandRange(0.f, 0.3f);
		if (Score > BestScore)
		{
			BestScore = Score;
			Best = C;
		}
	}
	return Best;
}

FVector AHuskHunter::Steer(const FVector& From, const FVector& Dir) const
{
	// round the camp's buildings, the car and the trees: the way ahead swept at the chest; if blocked, the nearest free way
	FCollisionQueryParams Q(TEXT("HunterSteer"), true, this);
	if (Husk)
	{
		Q.AddIgnoredActor(Husk);
	}
	if (Prey.IsValid())
	{
		Q.AddIgnoredActor(Prey.Get());
	}
	const FVector Chest = From + FVector(0.f, 0.f, 110.f * Scale);
	const float Look = 260.f + Speed * 0.5f;
	for (float Off : {0.f, 25.f, -25.f, 50.f, -50.f, 80.f, -80.f, 115.f, -115.f})
	{
		const FVector D = FRotator(0.f, Off, 0.f).RotateVector(Dir);
		FHitResult H;
		if (!GetWorld()->SweepSingleByChannel(H, Chest, Chest + D * Look, FQuat::Identity, ECC_WorldStatic, FCollisionShape::MakeSphere(45.f * Scale), Q))
		{
			return D;
		}
	}
	return -Dir;
}

void AHuskHunter::PlayTake(const TCHAR* T, float Rate)
{
	if (!Husk)
	{
		return;
	}
	if (Take != T)
	{
		Take = T;
		Husk->Play(T, true);
	}
	if (Husk->GetBody())
	{
		Husk->GetBody()->SetPlayRate(Rate);
	}
}

void AHuskHunter::Sense(float Dt)
{
	if (!Prey.IsValid() || !Husk)
	{
		return;
	}
	const FVector Me = HeadAt();
	const FVector Eye = Prey->EyesAt();
	const float D = FVector::Dist(Me, Eye);
	// how far off the player can be seen: the flashlight on, from far; a dark figure on the moonlit snow, near; less
	// crouched, more running
	float VisR = Prey->IsLightOn() ? 5200.f : 1000.f;
	if (Prey->bIsCrouched)
	{
		VisR *= Prey->IsLightOn() ? 0.8f : 0.45f;
	}
	if (Prey->IsRunningNow())
	{
		VisR *= 1.3f;
	}
	const FVector Fwd = FRotator(0.f, Yaw, 0.f).Vector();
	const float Cone = FVector::DotProduct((Eye - Me).GetSafeNormal2D(), Fwd);
	const bool bCone = Cone > FMath::Cos(FMath::DegreesToRadians(72.f)) || D < 450.f;
	bSeesPrey = D < VisR && bCone && (LineOfSight(Me, Eye) || LineOfSight(Me, Prey->GetActorLocation()));
	if (bSeesPrey)
	{
		Aware = FMath::Min(1.f, Aware + Dt * (0.3f + 1.4f * (1.f - D / VisR)));
		LastKnown = Prey->GetActorLocation();
		LastSeenT = Clock;
	}
	else
	{
		Aware = FMath::Max(0.f, Aware - Dt * 0.06f);
	}
	// the beam on it
	bool bInBeam = false;
	const bool bPreySees = PreyCanSee(Husk->GetActorLocation() + FVector(0.f, 0.f, 100.f * Scale), &bInBeam);
	bLit = bInBeam;
	LitFor = bLit ? LitFor + Dt : 0.f;
	// the director's gauge: near, and seen or heard, the tension builds; far and quiet, it ebbs
	const float D2 = FVector::Dist2D(Husk->GetActorLocation(), Prey->GetActorLocation());
	float Up = 0.f;
	if (D2 < 2500.f)
	{
		Up += 0.035f * (1.f - D2 / 2500.f) + 0.01f;
	}
	if (bPreySees)
	{
		Up += 0.11f;
	}
	if (State == EState::Chase)
	{
		Up += 0.05f;
	}
	Menace = FMath::Clamp(Menace + Dt * (Up > 0.f ? Up : -0.025f), 0.f, 1.f);
	QuietFor = (D2 > 3000.f && !bPreySees) ? QuietFor + Dt : 0.f;
}

void AHuskHunter::Think(float Dt)
{
	if (!Prey.IsValid() || !Husk)
	{
		return;
	}
	const FVector PreyAt = Prey->GetActorLocation();
	const FVector At = Husk->GetActorLocation();
	const float D = FVector::Dist2D(PreyAt, At);
	if (Prey->IsDead() && State != EState::Kill && State != EState::Away)
	{
		SetState(EState::Retreat, TEXT("the player is down"));
	}
	switch (State)
	{
	case EState::Away:
		Husk->SetActorHiddenInGame(true);
		if (Clock >= AwayUntil && !Prey->IsDead())
		{
			const FVector From = OutOfSightNear(PreyAt, 3600.f, 5200.f);
			Husk->SetActorLocation(FVector(From.X, From.Y, GroundAt(From)));
			Husk->SetActorHiddenInGame(false);
			Goal = OutOfSightNear(PreyAt, 900.f, 1600.f);
			Aware = 0.f;
			SetState(EState::Roam, TEXT("the director sends it back near the player"));
		}
		break;
	case EState::Roam:
		// toward the director's hint: a place near the player, out of their sight; renewed as they move on
		if (StateT > 11.f || FVector::Dist2D(At, Goal) < 250.f)
		{
			Goal = OutOfSightNear(PreyAt, 700.f, 1500.f);
			StateT = 0.01f;
		}
		if (bSeesPrey && Aware > 0.35f)
		{
			SetState(EState::Stalk, TEXT("it has seen the player"));
		}
		break;
	case EState::Investigate:
		if (bSeesPrey && Aware > 0.35f)
		{
			SetState(EState::Stalk, TEXT("what it heard is the player"));
		}
		else if (FVector::Dist2D(At, Goal) < 220.f || StateT > 14.f)
		{
			SetState(EState::Search, TEXT("nothing where the noise was"));
		}
		break;
	case EState::Stalk:
	{
		// at the edge of the light, out of the beam: a place 14-22 m off, on the dark side of the player
		if (StateT < Dt * 1.5f || FVector::Dist2D(At, Goal) < 200.f || (Clock - LastSeenT) < 0.2f && FMath::Fmod(StateT, 3.f) < Dt)
		{
			const FVector Away = (At - PreyAt).GetSafeNormal2D();
			const FVector Side = FVector::CrossProduct(FVector::UpVector, Away) * (Rng().FRand() < 0.5f ? 1.f : -1.f);
			FVector G = PreyAt + (Away * 0.8f + Side * 0.6f).GetSafeNormal() * Rng().FRandRange(900.f, 1500.f);
			G.Z = GroundAt(G);
			Goal = G;
		}
		if (bLit && LitFor > 2.2f && D < 1350.f)
		{
			Event(TEXT("husk_shriek"));
			SetState(EState::Chase, TEXT("the beam held on it: it charges"));
		}
		else if (Prey->IsRunningNow() && D < 2600.f && Aware > 0.5f)
		{
			Event(TEXT("husk_shriek"));
			SetState(EState::Chase, TEXT("the player runs"));
		}
		else if (StateT > 14.f && Aware > 0.8f)
		{
			Event(TEXT("husk_shriek"));
			SetState(EState::Chase, TEXT("done circling"));
		}
		else if (Clock - LastSeenT > 6.f)
		{
			SetState(EState::Search, TEXT("lost the player"));
		}
		break;
	}
	case EState::Chase:
		Goal = (Clock - LastSeenT) < 0.5f ? PreyAt : LastKnown;
		if (D < 165.f * Scale && !Prey->IsDead())
		{
			Event(TEXT("husk_kill"));
			Prey->Caught(Husk);
			if (Husk->GetBody())
			{
				UE_LOG(LogTemp, Display, TEXT("HuskKillCheck the husk at %s, its body's bounds %s (radius %.0f), the player's eyes %s, take %s"), *At.ToCompactString(),
					*Husk->GetBody()->Bounds.Origin.ToCompactString(), Husk->GetBody()->Bounds.SphereRadius, *Prey->EyesAt().ToCompactString(), *Take);
			}
			SetState(EState::Kill, TEXT("caught"));
		}
		else if (Clock - LastSeenT > 2.6f && D > 900.f)
		{
			SetState(EState::Search, TEXT("the player broke its sight"));
		}
		else if (Menace >= 0.99f && StateT > 9.f)
		{
			SetState(EState::Retreat, TEXT("the director calls it off at the peak"));
		}
		break;
	case EState::Search:
		if (StateT < Dt * 1.5f || FVector::Dist2D(At, Goal) < 200.f)
		{
			Goal = LastKnown + FVector(Rng().FRandRange(-800.f, 800.f), Rng().FRandRange(-800.f, 800.f), 0.f);
			Goal.Z = GroundAt(Goal);
		}
		if (bSeesPrey && Aware > 0.6f)
		{
			Event(TEXT("husk_shriek"));
			SetState(EState::Chase, TEXT("found the player again"));
		}
		else if (bSeesPrey && Aware > 0.35f)
		{
			SetState(EState::Stalk, TEXT("glimpsed the player"));
		}
		else if (StateT > 16.f)
		{
			SetState(Menace > 0.55f ? EState::Retreat : EState::Roam, TEXT("gave up the search"));
		}
		break;
	case EState::Retreat:
		if (StateT < Dt * 1.5f)
		{
			Goal = OutOfSightNear(PreyAt, 5500.f, 7000.f);
		}
		if ((FVector::Dist2D(At, PreyAt) > 4500.f && !PreyCanSee(HeadAt())) || StateT > 20.f)
		{
			AwayUntil = Clock + 20.f + 35.f * Menace;
			Menace *= 0.3f;
			SetState(EState::Away, TEXT("gone into the trees"));
		}
		break;
	case EState::Kill:
		if (StateT > 3.2f)
		{
			AwayUntil = Clock + 30.f;
			Menace = 0.2f;
			Aware = 0.f;
			SetState(EState::Away, TEXT("after the catch"));
		}
		break;
	}
	// (the director: all quiet far too long, it hints the husk nearer)
	if (State == EState::Roam && QuietFor > 25.f)
	{
		Goal = OutOfSightNear(PreyAt, 600.f, 1100.f);
		QuietFor = 0.f;
	}
}

void AHuskHunter::Move(float Dt)
{
	if (!Husk || State == EState::Away)
	{
		Speed = 0.f;
		return;
	}
	FVector At = Husk->GetActorLocation();
	FVector ToGoal = Goal - At;
	ToGoal.Z = 0.f;
	const float Dist = ToGoal.Size();
	// how fast, and which take: stalking a slow walk (it stops dead in the beam, as if listening), investigating and
	// searching a quicker walk, charging and going a gallop
	float Want = 0.f;
	bool bGallop = false;
	switch (State)
	{
	case EState::Roam: Want = 115.f * Scale / 1.3f; break;
	case EState::Investigate: Want = 150.f * Scale / 1.3f; break;
	case EState::Search: Want = 105.f * Scale / 1.3f; break;
	case EState::Stalk: Want = bLit ? (FVector::Dist2D(At, Prey.IsValid() ? Prey->GetActorLocation() : At) > 1250.f ? 55.f : 0.f) : 95.f * Scale / 1.3f; break;
	case EState::Chase: Want = FMath::Min(1.f, StateT / 0.9f) * 640.f; bGallop = true; break;
	case EState::Retreat: Want = 520.f; bGallop = true; break;
	default: Want = 0.f; break;
	}
	if (Dist < 60.f && State != EState::Chase)
	{
		Want = 0.f;
	}
	Speed = FMath::FInterpTo(Speed, Want, Dt, bGallop ? 3.5f : 4.f);
	if (State == EState::Kill)
	{
		Speed = 0.f;
	}
	// turning toward the way it goes (in the beam it turns its head to the light: faces the player)
	FVector Dir = ToGoal.GetSafeNormal();
	if (State == EState::Stalk && bLit && Prey.IsValid())
	{
		Dir = (Prey->GetActorLocation() - At).GetSafeNormal2D();      // (in the beam: it comes on straight at the light)
	}
	else if (State == EState::Kill || (Speed < 20.f && Prey.IsValid() && bSeesPrey))
	{
		Dir = (Prey->GetActorLocation() - At).GetSafeNormal2D();
	}
	else if (Speed > 5.f)
	{
		Dir = Steer(At, Dir);
	}
	if (!Dir.IsNearlyZero())
	{
		const float WantYaw = FMath::RadiansToDegrees(FMath::Atan2(Dir.Y, Dir.X));
		Yaw = FMath::FixedTurn(Yaw, WantYaw, (bGallop ? 260.f : 130.f) * Dt);
	}
	const FVector Fwd = FRotator(0.f, Yaw, 0.f).Vector();
	At += Fwd * Speed * Dt;
	At.Z = GroundAt(At);
	Husk->SetActorLocationAndRotation(At, FRotator(0.f, Yaw, 0.f).Quaternion() * FRotator(0.f, -Husk->MeshForwardYaw(), 0.f).Quaternion());
	if (!Husk->HasSurface())
	{
		Husk->AddActorWorldOffset(FVector(0.f, 0.f, Husk->GroundLift([this](const FVector& P) { return GroundAt(P); })));
	}
	// its eyes on the player whenever it has them (stalking it never looks away; in the beam its head jerks)
	if (Prey.IsValid())
	{
		float GW = 0.f;
		if (State == EState::Kill)
		{
			GW = 1.f;
		}
		else if (bSeesPrey && (State == EState::Stalk || State == EState::Chase || State == EState::Search))
		{
			GW = State == EState::Chase ? 0.55f : 0.9f;
		}
		Husk->GlareAt = Prey->EyesAt();
		Husk->GlareW = FMath::FInterpTo(Husk->GlareW, GW, Dt, 5.f);
		TwitchT -= Dt;
		if (TwitchT <= 0.f)
		{
			// (a sudden small jerk of the head now and then, more in the light)
			TwitchT = Rng().FRandRange(bLit ? 0.5f : 1.5f, bLit ? 1.4f : 4.f);
			TwitchTo = (State == EState::Stalk || State == EState::Kill) ? FRotator(Rng().FRandRange(-6.f, 6.f), Rng().FRandRange(-9.f, 9.f), Rng().FRandRange(-14.f, 14.f)) : FRotator::ZeroRotator;
		}
		Husk->Twitch = FMath::RInterpTo(Husk->Twitch, TwitchTo, Dt, 22.f);
	}
	if (State == EState::Kill)
	{
		PlayTake(TEXT("Rise"), 1.4f);
		Husk->JawOpen = 34.f;
		// (its face right at the eyes: the whole body shifted so its head is 75 cm in front of them, square to them)
		if (Prey.IsValid() && Prey->IsDead() && Husk->GetBody() && Husk->GetBody()->GetBoneIndex(TEXT("head")) != INDEX_NONE)
		{
			const FVector Eye = Prey->EyesAt();
			FVector Toward = (At - Prey->GetActorLocation()).GetSafeNormal2D();
			if (Toward.IsNearlyZero())
			{
				Toward = Prey->LookDir().GetSafeNormal2D();
			}
			const FVector Head = Husk->GetBody()->GetBoneLocation(TEXT("head"));
			const FVector FaceAt = Eye + Toward * 62.f + FVector(0.f, 0.f, 4.f);
			Husk->AddActorWorldOffset(FMath::Lerp(FVector::ZeroVector, FaceAt - Head, FMath::Min(1.f, StateT * 6.f)));
		}
	}
	else if (bGallop && Speed > 120.f)
	{
		PlayTake(TEXT("Gallop"), FMath::Clamp(Speed / (800.f * Scale), 0.45f, 1.1f));
		Husk->JawOpen = State == EState::Chase ? 22.f : 10.f;
	}
	else if (Speed > 15.f)
	{
		PlayTake(TEXT("Stalk"), FMath::Clamp(Speed / (67.f * Scale), 0.3f, 2.2f));
		Husk->JawOpen = 5.f;
	}
	else
	{
		PlayTake(TEXT("Peer"), 1.f);
		Husk->JawOpen = bLit ? 14.f : 6.f;
	}
}

void AHuskHunter::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	if (!Husk)
	{
		return;
	}
	const float Dt = FMath::Min(DeltaSeconds, 0.1f);
	Clock += Dt;
	StateT += Dt;
	if (!Prey.IsValid())
	{
		Prey = Cast<APart2Character>(UGameplayStatics::GetPlayerPawn(this, 0));
	}
	SenseT -= Dt;
	if (SenseT <= 0.f)
	{
		SenseT = 0.1f;
		if (State == EState::Away || State == EState::Kill)
		{
			// (gone: it senses nothing, and the tension ebbs)
			bSeesPrey = bLit = false;
			LitFor = 0.f;
			Menace = FMath::Max(0.f, Menace - 0.1f * 0.03f);
		}
		else
		{
			Sense(0.1f);
		}
	}
	Think(Dt);
	Move(Dt);
	// (for the sound: its footfalls by how it moves, how far it is (cm), its breath near, the menace gauge)
	if (Prey.IsValid() && State != EState::Away && Speed > 15.f)
	{
		const float D = FVector::Dist(Prey->EyesAt(), HeadAt());
		StepT -= Dt * (Take == TEXT("Gallop") ? Speed / 210.f : Speed / 60.f);
		if (StepT <= 0.f)
		{
			StepT = 1.f;
			Director ? Director->LogEvent(Take == TEXT("Gallop") ? TEXT("husk_gallop") : TEXT("husk_step"), D) : void();
			// (its long bare prints, left and right in turn, too far apart)
			const FVector F = FRotator(0.f, Yaw, 0.f).Vector();
			const FVector Side = FVector::CrossProduct(FVector::UpVector, F) * ((++Footfalls & 1) ? 16.f : -16.f) * Scale;
			P2Footprint(GetWorld(), Husk->GetActorLocation() + Side + FVector(0.f, 0.f, 20.f), Yaw, 38.f * Scale / 1.3f, true);
		}
	}
	BreathT -= Dt;
	if (BreathT <= 0.f && Prey.IsValid() && State != EState::Away)
	{
		BreathT = 0.5f;
		if (Director)
		{
			Director->LogEvent(TEXT("menace"), Menace * 100.f);
			const float D = FVector::Dist(Prey->EyesAt(), HeadAt());
			if (D < 1200.f && (State == EState::Stalk || State == EState::Search || State == EState::Investigate))
			{
				Director->LogEvent(TEXT("husk_breath"), D);
			}
		}
	}
	if (FMath::FloorToInt(Clock) != FMath::FloorToInt(Clock - Dt) && Prey.IsValid())
	{
		if (Husk->GetBody())
		{
			UE_LOG(LogTemp, Display, TEXT("HuskBody the body drawn %.0f cm from the husk's place (bounds radius %.0f)"), FVector::Dist(Husk->GetBody()->Bounds.Origin, Husk->GetActorLocation()), Husk->GetBody()->Bounds.SphereRadius);
		}
		UE_LOG(LogTemp, Display, TEXT("HuskHuntLog %.0f %s %.1f m off, speed %.0f, menace %.2f, aware %.2f%s%s"), Clock, StateName(State),
			FVector::Dist2D(Prey->GetActorLocation(), Husk->GetActorLocation()) / 100.f, Speed, Menace, Aware, bSeesPrey ? TEXT(", sees the player") : TEXT(""),
			bLit ? TEXT(", in the beam") : TEXT(""));
	}
}
