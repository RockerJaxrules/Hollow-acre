#include "EndingDirector.h"

#include "Camera/PlayerCameraManager.h"
#include "Engine/World.h"
#include "Kismet/GameplayStatics.h"
#include "Misc/CommandLine.h"
#include "Misc/Parse.h"
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

	// Screenshots for the work log skip the fade (-nofade) so the frame isn't black
	if (FParse::Param(FCommandLine::Get(), TEXT("nofade")))
	{
		return;
	}
	if (APlayerCameraManager* Cam = UGameplayStatics::GetPlayerCameraManager(this, 0))
	{
		Cam->StartCameraFade(1.f, 1.f, 0.f, FLinearColor::Black, false, true);
	}
	GetWorldTimerManager().SetTimer(FadeTimer, this, &AEndingDirector::StartFade, FMath::Max(HoldBlack, 0.01f), false);
}

void AEndingDirector::StartFade()
{
	if (APlayerCameraManager* Cam = UGameplayStatics::GetPlayerCameraManager(this, 0))
	{
		Cam->StartCameraFade(1.f, 0.f, FadeIn, FLinearColor::Black, false, false);
	}
}

void AEndingDirector::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	if (!Car)
	{
		return;
	}
	Time += DeltaSeconds;

	const float Speed = SpeedKmh * 100000.f / 3600.f; // cm/s
	FVector Loc = CarStart.GetLocation() + CarStart.GetRotation().GetForwardVector() * Speed * Time;
	// Low, uneven bumps and a slow roll, never mirrored or periodic-looking
	Loc.Z += 0.8f * FMath::Sin(Time * 7.1f) + 0.5f * FMath::Sin(Time * 11.3f + 1.7f);
	const FRotator Sway(SwayDeg * 0.4f * FMath::Sin(Time * 1.9f + 0.4f), 0.f, SwayDeg * FMath::Sin(Time * 1.3f));
	Car->SetActorLocationAndRotation(Loc, (CarStart.GetRotation() * Sway.Quaternion()));
}
