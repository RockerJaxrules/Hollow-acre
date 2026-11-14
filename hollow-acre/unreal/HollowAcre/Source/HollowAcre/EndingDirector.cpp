#include "EndingDirector.h"

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

	// Screenshots for the work log skip the opening fade (-nofade) so the frame isn't black
	if (FParse::Param(FCommandLine::Get(), TEXT("nofade")))
	{
		GetWorldTimerManager().SetTimer(Timer, this, &AEndingDirector::StartFadeOut, FMath::Max(DriveSeconds, 0.01f), false);
		return;
	}
	if (APlayerCameraManager* Cam = UGameplayStatics::GetPlayerCameraManager(this, 0))
	{
		Cam->StartCameraFade(1.f, 1.f, 0.f, FLinearColor::Black, false, true);
	}
	GetWorldTimerManager().SetTimer(Timer, this, &AEndingDirector::StartFadeIn, FMath::Max(HoldBlack, 0.01f), false);
}

void AEndingDirector::StartFadeIn()
{
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
