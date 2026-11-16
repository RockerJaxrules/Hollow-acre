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
	// Part 2's words over its black: where and when at the start, the title at the end (a line, and a smaller one)
	FString L1, L2;
	float CapAlpha = 0.f, CapSize = 0.f;
	if (Director.IsValid() && Director->GetCaption(L1, L2, CapAlpha, CapSize))
	{
		UFont* Font = GEngine->GetLargeFont();
		FFontRenderInfo Info;
		Info.bClipText = false;
		Info.bEnableShadow = false;
		FLinearColor Col = TextColor;
		Col.A = CapAlpha;
		Canvas->SetDrawColor(Col.ToFColor(true));
		float W = 0.f, H = 0.f;
		Canvas->TextSize(Font, L1, W, H);
		const float S1 = H > 0.f ? Canvas->ClipY * CapSize / H : 1.f;
		Canvas->DrawText(Font, L1, (Canvas->ClipX - W * S1) * 0.5f, Canvas->ClipY * 0.47f - H * S1 * 0.5f, S1, S1, Info);
		if (!L2.IsEmpty())
		{
			Canvas->TextSize(Font, L2, W, H);
			const float S2 = H > 0.f ? Canvas->ClipY * CapSize * 0.5f / H : 1.f;
			Canvas->DrawText(Font, L2, (Canvas->ClipX - W * S2) * 0.5f, Canvas->ClipY * (0.47f + CapSize * 0.75f), S2, S2, Info);
		}
	}
	// the driver's lines: captions centred in the lower letterbox bar
	FString Said;
	float SaidAlpha = 0.f;
	if (Director.IsValid() && Director->GetLine(Said, SaidAlpha))
	{
		UFont* Font = GEngine->GetLargeFont();
		FFontRenderInfo Info;
		Info.bClipText = false;
		Info.bEnableShadow = true;
		Canvas->SetDrawColor(FLinearColor(0.92f, 0.92f, 0.9f, SaidAlpha * 0.95f).ToFColor(true));
		float W = 0.f, H = 0.f;
		Canvas->TextSize(Font, Said, W, H);
		const float S = H > 0.f ? Canvas->ClipY * 0.03f / H : 1.f;
		const float Bar = FMath::Max(0.f, (Canvas->ClipY - Canvas->ClipX / 2.39f) * 0.5f);   // the letterbox bar's height
		Canvas->DrawText(Font, Said, (Canvas->ClipX - W * S) * 0.5f, Canvas->ClipY - Bar * 0.5f - H * S * 0.5f, S, S, Info);
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
