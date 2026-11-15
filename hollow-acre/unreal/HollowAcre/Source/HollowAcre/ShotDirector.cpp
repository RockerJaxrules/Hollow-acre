#include "ShotDirector.h"

#include "Camera/CameraActor.h"
#include "Camera/CameraComponent.h"
#include "Components/PointLightComponent.h"
#include "Engine/World.h"
#include "EngineUtils.h"
#include "Kismet/KismetSystemLibrary.h"
#include "Misc/CommandLine.h"
#include "Misc/Parse.h"
#include "Misc/App.h"
#include "Misc/Paths.h"
#include "TimerManager.h"
#include "UnrealClient.h"

AShotDirector::AShotDirector()
{
	PrimaryActorTick.bCanEverTick = true;
	PrimaryActorTick.bStartWithTickEnabled = false;
	PrimaryActorTick.TickGroup = TG_PostUpdateWork;
}

void AShotDirector::BeginPlay()
{
	Super::BeginPlay();

	if (FParse::Value(FCommandLine::Get(), TEXT("-capture="), CaptureDir) && !CaptureDir.IsEmpty())
	{
		if (FPaths::IsRelative(CaptureDir))
		{
			CaptureDir = FPaths::Combine(FPaths::ProjectSavedDir(), TEXT("Capture"), CaptureDir);
		}
		CaptureDir = FPaths::ConvertRelativePathToFull(CaptureDir);
		float Fps = 30.f, Secs = 45.f;
		FParse::Value(FCommandLine::Get(), TEXT("-capfps="), Fps);
		FParse::Value(FCommandLine::Get(), TEXT("-capsecs="), Secs);
		FApp::SetUseFixedTimeStep(true);
		FApp::SetFixedDeltaTime(1.0 / FMath::Max(Fps, 1.f));
		CaptureFrames = FMath::CeilToInt(Fps * Secs);
		SetActorTickEnabled(true);
		UE_LOG(LogTemp, Display, TEXT("ShotDirector: capturing %d frames at %.0f fps into %s"), CaptureFrames, Fps, *CaptureDir);
		PlaceCamera();
		return;
	}
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
	PlaceCamera();
}

void AShotDirector::PlaceCamera()
{
	FString Cam;
	const bool bCam = FParse::Value(FCommandLine::Get(), TEXT("-shotcam="), Cam, /*bShouldStopOnSeparator*/ false);
	float Fov = 0.f, Light = 0.f;
	FParse::Value(FCommandLine::Get(), TEXT("-shotfov="), Fov);
	FParse::Value(FCommandLine::Get(), TEXT("-shotlight="), Light);
	if (!bCam && Fov <= 0.f && Light <= 0.f)
	{
		return;
	}
	ACameraActor* Camera = nullptr;
	for (TActorIterator<ACameraActor> It(GetWorld()); It; ++It)
	{
		Camera = *It;
		break;
	}
	if (!Camera)
	{
		UE_LOG(LogTemp, Warning, TEXT("ShotDirector: no camera to move"));
		return;
	}
	if (bCam)
	{
		TArray<FString> Parts;
		Cam.ParseIntoArray(Parts, TEXT(","));
		if (Parts.Num() >= 3)
		{
			const FVector At(FCString::Atof(*Parts[0]), FCString::Atof(*Parts[1]), FCString::Atof(*Parts[2]));
			const FRotator Rot(Parts.Num() > 4 ? FCString::Atof(*Parts[4]) : 0.f, Parts.Num() > 3 ? FCString::Atof(*Parts[3]) : 0.f, 0.f);
			// the camera rides on the car, so its relative transform is the car-frame placement
			Camera->GetRootComponent()->SetRelativeLocationAndRotation(At, Rot);
			UE_LOG(LogTemp, Display, TEXT("ShotDirector: camera at %s %s (car frame)"), *At.ToString(), *Rot.ToString());
		}
	}
	if (Fov > 0.f)
	{
		Camera->GetCameraComponent()->SetFieldOfView(Fov);
	}
	if (Light > 0.f)
	{
		UPointLightComponent* Lamp = NewObject<UPointLightComponent>(Camera, TEXT("ShotWorkLight"));
		Lamp->SetupAttachment(Camera->GetRootComponent());
		Lamp->SetRelativeLocation(FVector(-10.f, -25.f, 30.f));
		Lamp->SetIntensityUnits(ELightUnits::Candelas);
		Lamp->SetIntensity(Light);
		Lamp->SetAttenuationRadius(2500.f);
		Lamp->SetSourceRadius(12.f);
		Lamp->RegisterComponent();
	}
}

void AShotDirector::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	if (CaptureDir.IsEmpty())
	{
		return;
	}
	if (CaptureFrame >= CaptureFrames)
	{
		UE_LOG(LogTemp, Display, TEXT("ShotDirector: captured %d frames"), CaptureFrame);
		SetActorTickEnabled(false);
		GetWorldTimerManager().SetTimer(Timer, this, &AShotDirector::Finish, 1.f, false);
		return;
	}
	FScreenshotRequest::RequestScreenshot(FPaths::Combine(CaptureDir, FString::Printf(TEXT("frame_%05d.png"), CaptureFrame)),
		/*bShowUI*/ true, /*bAddFilenameSuffix*/ false);
	++CaptureFrame;
}

void AShotDirector::TakeShot()
{
	UE_LOG(LogTemp, Display, TEXT("ShotDirector: writing %s"), *ShotPath);
	FScreenshotRequest::RequestScreenshot(ShotPath, /*bShowUI*/ FParse::Param(FCommandLine::Get(), TEXT("shotui")), /*bAddFilenameSuffix*/ false);
	GetWorldTimerManager().SetTimer(Timer, this, &AShotDirector::Finish, 2.f, false);
}

void AShotDirector::Finish()
{
	if (FParse::Param(FCommandLine::Get(), TEXT("shotquit")) || !CaptureDir.IsEmpty())
	{
		UKismetSystemLibrary::QuitGame(this, nullptr, EQuitPreference::Quit, false);
	}
}
