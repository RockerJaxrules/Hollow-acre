#include "EndingHUD.h"

#include "CanvasItem.h"
#include "Engine/Canvas.h"
#include "EndingDirector.h"
#include "EngineUtils.h"
#include "Engine/Engine.h"
#include "Engine/Font.h"

void AEndingHUD::DrawHUD()
{
	Super::DrawHUD();
	if (!Canvas)
	{
		return;
	}
	if (!Director.IsValid())
	{
		for (TActorIterator<AEndingDirector> It(GetWorld()); It; ++It)
		{
			Director = *It;
			break;
		}
	}
	const float Alpha = Director.IsValid() ? Director->GetEndCardAlpha() : 0.f;
	if (Alpha <= 0.f)
	{
		return;
	}
	if (!bLoggedEndCard)
	{
		bLoggedEndCard = true;
		UE_LOG(LogTemp, Display, TEXT("EndingHUD: end card showing on %.0fx%.0f"), Canvas->ClipX, Canvas->ClipY);
	}

	// The camera fade already holds the screen black; draw the words with the engine font, centred
	UFont* Font = GEngine->GetLargeFont();
	const FString Str = Director->EndCardText.ToString();
	float W = 0.f, H = 0.f;
	Canvas->TextSize(Font, Str, W, H);
	const float Scale = H > 0.f ? Canvas->ClipY * TextHeight / H : 1.f;
	FLinearColor Col = TextColor;
	Col.A = Alpha;
	Canvas->SetDrawColor(Col.ToFColor(true));
	FFontRenderInfo Info;
	Info.bClipText = false;
	Info.bEnableShadow = false;
	Canvas->DrawText(Font, Str, (Canvas->ClipX - W * Scale) * 0.5f, (Canvas->ClipY - H * Scale) * 0.5f, Scale, Scale, Info);
}
