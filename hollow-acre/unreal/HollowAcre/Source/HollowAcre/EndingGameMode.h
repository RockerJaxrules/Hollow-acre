// Game mode for the ending drive: no player body to move (the view is the driver's camera on the car), and the HUD
// that draws the end card.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "EndingGameMode.generated.h"

UCLASS()
class HOLLOWACRE_API AEndingGameMode : public AGameModeBase
{
	GENERATED_BODY()

public:
	AEndingGameMode();
};
