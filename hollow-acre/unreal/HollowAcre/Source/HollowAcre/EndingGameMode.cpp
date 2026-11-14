#include "EndingGameMode.h"

#include "EndingHUD.h"
#include "GameFramework/SpectatorPawn.h"

AEndingGameMode::AEndingGameMode()
{
	DefaultPawnClass = ASpectatorPawn::StaticClass();
	HUDClass = AEndingHUD::StaticClass();
}
