#include "ShotDirector.h"

#include "Engine/World.h"
#include "Kismet/KismetSystemLibrary.h"
#include "Misc/CommandLine.h"
#include "Misc/Parse.h"
#include "Misc/Paths.h"
#include "TimerManager.h"
#include "UnrealClient.h"

AShotDirector::AShotDirector()
{
	PrimaryActorTick.bCanEverTick = false;
}

void AShotDirector::BeginPlay()
{
	Super::BeginPlay();

	if (!FParse::Value(FCommandLine::Get(), TEXT("-shot="), ShotPath) || ShotPath.IsEmpty())
	{
		return;
	}
	if (FPaths::IsRelative(ShotPath))
	{
		ShotPath = FPaths::Combine(FPaths::ProjectSavedDir(), TEXT("Shots"), ShotPath);
	}
	ShotPath = FPaths::ConvertRelativePathToFull(ShotPath);

	// Give Lumen, virtual shadows and volumetric fog time to settle before the shot
	float Delay = 6.f;
	FParse::Value(FCommandLine::Get(), TEXT("-shotdelay="), Delay);
	GetWorldTimerManager().SetTimer(Timer, this, &AShotDirector::TakeShot, FMath::Max(Delay, 0.1f), false);
}

void AShotDirector::TakeShot()
{
	UE_LOG(LogTemp, Display, TEXT("ShotDirector: writing %s"), *ShotPath);
	FScreenshotRequest::RequestScreenshot(ShotPath, /*bShowUI*/ FParse::Param(FCommandLine::Get(), TEXT("shotui")), /*bAddFilenameSuffix*/ false);
	GetWorldTimerManager().SetTimer(Timer, this, &AShotDirector::Finish, 2.f, false);
}

void AShotDirector::Finish()
{
	if (FParse::Param(FCommandLine::Get(), TEXT("shotquit")))
	{
		UKismetSystemLibrary::QuitGame(this, nullptr, EQuitPreference::Quit, false);
	}
}
