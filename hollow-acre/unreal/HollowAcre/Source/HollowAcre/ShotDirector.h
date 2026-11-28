// Takes an in-game screenshot from the live game camera for the work log, then optionally quits.
// Command line: -shot=<file.png> [-shotdelay=<seconds>] [-shotquit] [-shotui (include the HUD, e.g. the end card)]
//   [-shotcam=x,y,z,yaw,pitch (move the driver's camera, in the car's frame, cm/degrees)] [-shotfov=<degrees>]
//   [-shotlight=<candela> (a work light beside the camera, for judging models)]
// A relative file name lands in Saved/Shots/.
// Video: -capture=<folder> [-capfps=30] [-capsecs=<seconds>] records every frame (HUD included) on a fixed clock, so
// game time runs exactly 1/capfps per frame however long a frame takes to render, then quits. Frames land as
// frame_00000.png ... (a relative folder lands in Saved/Capture/).

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "ShotDirector.generated.h"

UCLASS()
class HOLLOWACRE_API AShotDirector : public AActor
{
	GENERATED_BODY()

public:
	AShotDirector();

protected:
	virtual void BeginPlay() override;
	virtual void Tick(float DeltaSeconds) override;

private:
	void PlaceCamera();
	void TakeShot();
	void Finish();

	FTimerHandle Timer;
	FString ShotPath;
	FString CaptureDir;
	int32 CaptureFrame = 0;
	int32 CaptureFrames = 0;
};
