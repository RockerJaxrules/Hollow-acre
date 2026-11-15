#include "EndingDirector.h"

#include "DriverArms.h"
#include "Sound/SoundBase.h"
#include "EngineUtils.h"

#include "Camera/PlayerCameraManager.h"
#include "Engine/World.h"
#include "Kismet/GameplayStatics.h"
#include "Misc/CommandLine.h"
#include "Misc/Parse.h"
#include "Algo/BinarySearch.h"
#include "TimerManager.h"

AEndingDirector::AEndingDirector()
{
	PrimaryActorTick.bCanEverTick = true;
}

void AEndingDirector::BeginPlay()
{
	Super::BeginPlay();

	if (Car)
	{
		CarStart = Car->GetActorTransform();
	}
	PathDist.Reset();
	float Acc = 0.f;
	for (int32 i = 0; i < Path.Num(); ++i)
	{
		Acc += i > 0 ? FVector::Dist(Path[i - 1], Path[i]) : 0.f;
		PathDist.Add(Acc);
	}
	FParse::Value(FCommandLine::Get(), TEXT("-drivesecs="), DriveSeconds);
	if (DriveSound)
	{
		UGameplayStatics::PlaySound2D(this, DriveSound);
	}
	// the wipers turn about the windshield's normal at their spindles (the glass rakes back about 33 degrees from
	// horizontal-forward: up the glass is (-0.84, 0, 0.54)); a positive sweep carries the parked arm (along -Y, the
	// driver's left) up the glass
	const FVector UpGlass = FVector(-0.841f, 0.f, 0.542f);
	WiperAxis = FVector(0.542f, 0.f, 0.841f);
	WiperSign = FVector::DotProduct(FQuat(WiperAxis, 0.1f).RotateVector(FVector(0.f, -1.f, 0.f)), UpGlass) > 0.f ? 1.f : -1.f;
	WiperBase.Reset();
	for (AActor* W : Wipers)
	{
		WiperBase.Add(W && W->GetRootComponent() ? W->GetRootComponent()->GetRelativeRotation().Quaternion() : FQuat::Identity);
	}
	if (!Arms)
	{
		for (TActorIterator<ADriverArms> It(GetWorld()); It; ++It)
		{
			Arms = *It;
			break;
		}
	}

	// Screenshots for the work log skip the opening fade (-nofade) so the frame isn't black
	if (FParse::Param(FCommandLine::Get(), TEXT("nofade")))
	{
		GetWorldTimerManager().SetTimer(Timer, this, &AEndingDirector::StartFadeOut, FMath::Max(DriveSeconds, 0.01f), false);
		return;
	}
	// the opening black is held every frame until the fade in (the camera manager may not exist yet at BeginPlay, and
	// a fade started then never showed: the first moments of the drive were visible before the black)
	bHoldBlack = true;
	GetWorldTimerManager().SetTimer(Timer, this, &AEndingDirector::StartFadeIn, FMath::Max(HoldBlack, 0.01f), false);
}

void AEndingDirector::StartFadeIn()
{
	bHoldBlack = false;
	if (APlayerCameraManager* Cam = UGameplayStatics::GetPlayerCameraManager(this, 0))
	{
		Cam->StartCameraFade(1.f, 0.f, FadeIn, FLinearColor::Black, false, false);
	}
	GetWorldTimerManager().SetTimer(Timer, this, &AEndingDirector::StartFadeOut, FMath::Max(FadeIn + DriveSeconds, 0.01f), false);
}

void AEndingDirector::StartFadeOut()
{
	if (APlayerCameraManager* Cam = UGameplayStatics::GetPlayerCameraManager(this, 0))
	{
		Cam->StartCameraFade(0.f, 1.f, FadeOut, FLinearColor::Black, false, /*bHoldWhenFinished*/ true);
	}
	GetWorldTimerManager().SetTimer(Timer, this, &AEndingDirector::ShowEndCard, FMath::Max(FadeOut + EndCardDelay, 0.01f), false);
}

void AEndingDirector::ShowEndCard()
{
	EndCardTime = Time;
}

float AEndingDirector::GetEndCardAlpha() const
{
	if (EndCardTime < 0.f)
	{
		return 0.f;
	}
	const float A = FMath::Clamp((Time - EndCardTime) / FMath::Max(EndCardFadeIn, 0.01f), 0.f, 1.f);
	return A * A * (3.f - 2.f * A); // smoothstep
}

void AEndingDirector::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	Time += DeltaSeconds;
	if (bHoldBlack)
	{
		if (APlayerCameraManager* Cam = UGameplayStatics::GetPlayerCameraManager(this, 0))
		{
			Cam->SetManualCameraFade(1.f, FLinearColor::Black, false);
		}
	}
	if (!Car)
	{
		return;
	}

	const float Speed = SpeedKmh * 100000.f / 3600.f; // cm/s
	const float Dist = Speed * Time;
	FVector Loc;
	FQuat Rot;
	if (Path.Num() >= 2)
	{
		// Follow the road; heading and pitch from points 3 m behind and ahead, so curves and the climb feel smooth
		Loc = PathAt(Dist);
		const FVector Fwd = (PathAt(Dist + 300.f) - PathAt(Dist - 300.f)).GetSafeNormal();
		Rot = FRotationMatrix::MakeFromXZ(Fwd, FVector::UpVector).ToQuat();
	}
	else
	{
		Loc = CarStart.GetLocation() + CarStart.GetRotation().GetForwardVector() * Dist;
		Rot = CarStart.GetRotation();
	}
	// Low, uneven bumps and a slow roll, never mirrored or periodic-looking
	Loc.Z += 0.8f * FMath::Sin(Time * 7.1f) + 0.5f * FMath::Sin(Time * 11.3f + 1.7f);
	const FRotator Sway(SwayDeg * 0.4f * FMath::Sin(Time * 1.9f + 0.4f), 0.f, SwayDeg * FMath::Sin(Time * 1.3f));
	Car->SetActorLocationAndRotation(Loc, Rot * Sway.Quaternion());

	// Wipers: out and back, easing at each end like the real linkage, resting parked a moment between sweeps
	{
		const float Cycle = WiperPeriod + WiperRest;
		const float Ph = FMath::Fmod(Time + 0.4f, Cycle);
		const float A = Ph < WiperPeriod ? 0.5f * (1.f - FMath::Cos(2.f * PI * Ph / WiperPeriod)) : 0.f;
		const FQuat Q(WiperAxis, WiperSign * FMath::DegreesToRadians(WiperSweep * A));
		for (int32 i = 0; i < Wipers.Num() && i < WiperBase.Num(); ++i)
		{
			if (Wipers[i])
			{
				Wipers[i]->SetActorRelativeRotation(Q * WiperBase[i]);
			}
		}
	}

	// Steering: the road's curvature a moment ahead (the driver turns into a bend before reaching it), as the front
	// wheels' angle for this wheelbase, times the steering ratio; plus the small, constant corrections of holding a
	// lane on a snowy road. Eased, never snapped.
	static const bool bNoSteer = FParse::Param(FCommandLine::Get(), TEXT("nosteer"));   // testing: wheel held straight
	if (Arms && Path.Num() >= 2 && !bNoSteer)
	{
		const float Ahead = Dist + Speed * SteerLead;
		float dH = HeadingAt(Ahead + 300.f) - HeadingAt(Ahead - 300.f);
		dH = FMath::UnwindRadians(dH);
		const float Kappa = dH / 600.f;                                            // 1/cm
		const float Wheels = FMath::Atan(Wheelbase * Kappa);
		float Want = SteerRatio * FMath::RadiansToDegrees(Wheels);
		Want += 1.4f * FMath::Sin(Time * 0.63f + 0.5f) + 0.7f * FMath::Sin(Time * 1.71f + 2.1f) + 0.3f * FMath::Sin(Time * 3.9f);
		SteerNow = FMath::FInterpTo(SteerNow, FMath::Clamp(Want, -120.f, 120.f), DeltaSeconds, 3.f);
		Arms->Steer = SteerNow;
	}
}

float AEndingDirector::HeadingAt(float Dist) const
{
	const FVector D = PathAt(Dist + 150.f) - PathAt(Dist - 150.f);
	return FMath::Atan2(D.Y, D.X);
}

FVector AEndingDirector::PathAt(float Dist) const
{
	if (Path.Num() == 0)
	{
		return FVector::ZeroVector;
	}
	if (Dist <= 0.f || Path.Num() == 1)
	{
		return Path[0] + (Path.Num() > 1 ? (Path[0] - Path[1]).GetSafeNormal() * -Dist : FVector::ZeroVector);
	}
	const int32 Hi = Algo::UpperBound(PathDist, Dist);
	if (Hi >= Path.Num())
	{
		return Path.Last();
	}
	const int32 Lo = Hi - 1;
	const float Seg = FMath::Max(PathDist[Hi] - PathDist[Lo], 1.f);
	return FMath::Lerp(Path[Lo], Path[Hi], (Dist - PathDist[Lo]) / Seg);
}
