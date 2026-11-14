// Runs the realistic half of the ending drive. Part 1 (pixel) ends with the car driving up the mountain into the blizzard
// and the screen fading to black; this scene opens on that black, fades in to the driver's seat with the car already
// moving, drives on, then fades back to black and shows "To be continued" (the chapter break into Part 2).
//
// Command line (testing and work-log screenshots):
//   -nofade           skip the opening fade (the frame is never black)
//   -drivesecs=<s>    override how long the drive lasts before the fade out

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "EndingDirector.generated.h"

UCLASS()
class HOLLOWACRE_API AEndingDirector : public AActor
{
	GENERATED_BODY()

public:
	AEndingDirector();

	/** The car root: the body, wheel, headlights and the driver's camera are attached to it. */
	UPROPERTY(EditAnywhere, Category = "Ending")
	TObjectPtr<AActor> Car;

	/** Seconds of held black at the start (the cut from the pixel game). */
	UPROPERTY(EditAnywhere, Category = "Ending")
	float HoldBlack = 1.5f;

	/** Seconds for the fade from black into the realistic view. */
	UPROPERTY(EditAnywhere, Category = "Ending")
	float FadeIn = 3.5f;

	/** Seconds of driving after the fade in, before the fade out. */
	UPROPERTY(EditAnywhere, Category = "Ending")
	float DriveSeconds = 30.f;

	/** Seconds for the fade back to black at the end. */
	UPROPERTY(EditAnywhere, Category = "Ending")
	float FadeOut = 3.f;

	/** Pause on black before the words appear, then how long they take to fade in. */
	UPROPERTY(EditAnywhere, Category = "Ending")
	float EndCardDelay = 1.f;

	UPROPERTY(EditAnywhere, Category = "Ending")
	float EndCardFadeIn = 2.5f;

	UPROPERTY(EditAnywhere, Category = "Ending")
	FText EndCardText = NSLOCTEXT("HollowAcre", "ToBeContinued", "To be continued");

	/** Car speed in km/h. */
	UPROPERTY(EditAnywhere, Category = "Ending")
	float SpeedKmh = 35.f;

	/** The road the car follows (world positions, cm, in driving order). Empty: drive straight ahead. */
	UPROPERTY(EditAnywhere, Category = "Ending")
	TArray<FVector> Path;

	/** Gentle body sway from the rough, snowy road (degrees). */
	UPROPERTY(EditAnywhere, Category = "Ending")
	float SwayDeg = 0.6f;

	/** 0 until the end card shows, then rises to 1 as the words fade in (read by the HUD). */
	UFUNCTION(BlueprintPure, Category = "Ending")
	float GetEndCardAlpha() const;

protected:
	virtual void BeginPlay() override;
	virtual void Tick(float DeltaSeconds) override;

private:
	void StartFadeIn();
	void StartFadeOut();
	void ShowEndCard();

	/** Position along Path at a distance (cm) from its start. */
	FVector PathAt(float Dist) const;

	FTransform CarStart;
	TArray<float> PathDist;
	float Time = 0.f;
	float EndCardTime = -1.f;
	FTimerHandle Timer;
};
