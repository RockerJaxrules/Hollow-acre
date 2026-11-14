// Runs the realistic half of the ending drive. Part 1 (pixel) ends with the car driving up the mountain into the blizzard
// and the screen fading to black; this scene opens on that black, fades in to the driver's seat with the truck already
// moving, and later fades out to "To be continued".

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

	/** The truck root: the cab, wheel, headlights and the driver's camera are attached to it. */
	UPROPERTY(EditAnywhere, Category = "Ending")
	TObjectPtr<AActor> Truck;

	/** Seconds of held black at the start (the cut from the pixel game). */
	UPROPERTY(EditAnywhere, Category = "Ending")
	float HoldBlack = 1.5f;

	/** Seconds for the fade from black into the realistic view. */
	UPROPERTY(EditAnywhere, Category = "Ending")
	float FadeIn = 3.5f;

	/** Truck speed in km/h. */
	UPROPERTY(EditAnywhere, Category = "Ending")
	float SpeedKmh = 35.f;

	/** Gentle cab sway from the rough, snowy road (degrees). */
	UPROPERTY(EditAnywhere, Category = "Ending")
	float SwayDeg = 0.6f;

protected:
	virtual void BeginPlay() override;
	virtual void Tick(float DeltaSeconds) override;

private:
	void StartFade();

	FTransform TruckStart;
	float Time = 0.f;
	FTimerHandle FadeTimer;
};
