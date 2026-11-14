// Takes an in-game screenshot from the live game camera for the work log, then optionally quits.
// Command line: -shot=<file.png> [-shotdelay=<seconds>] [-shotquit]
// A relative file name lands in Saved/Shots/.

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

private:
	void TakeShot();
	void Finish();

	FTimerHandle Timer;
	FString ShotPath;
};
