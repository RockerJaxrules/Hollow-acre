// Draws the ending's end card ("To be continued") over the black after the drive fades out.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/HUD.h"
#include "EndingHUD.generated.h"

class AEndingDirector;

UCLASS()
class HOLLOWACRE_API AEndingHUD : public AHUD
{
	GENERATED_BODY()

public:
	/** Text height as a fraction of the screen height (works on phones and PC alike). */
	UPROPERTY(EditAnywhere, Category = "Ending")
	float TextHeight = 0.045f;

	/** Cold off-white, so the words sit in the same night as the scene. */
	UPROPERTY(EditAnywhere, Category = "Ending")
	FLinearColor TextColor = FLinearColor(0.80f, 0.84f, 0.90f, 1.f);

	virtual void DrawHUD() override;

private:
	TWeakObjectPtr<AEndingDirector> Director;
	bool bLoggedEndCard = false;
};
