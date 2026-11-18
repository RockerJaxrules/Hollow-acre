#include "EndingHUD.h"

#include "CanvasItem.h"
#include "Engine/Canvas.h"
#include "EndingDirector.h"
#include "EngineUtils.h"
#include "Engine/Engine.h"
#include "Engine/Font.h"
#include "Engine/Texture2D.h"
#include "Kismet/GameplayStatics.h"
#include "Part2Character.h"
#include "Part2Story.h"

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
	DrawPlay();
	// the eyelids (the wake): heavy, closing from above and below with soft edges, under the words
	const float Lids = Director.IsValid() ? Director->GetLids() : 0.f;
	if (Lids > 0.005f)
	{
		const float Half = Canvas->ClipY * 0.5f;
		const float Edge = Canvas->ClipY * 0.09f;                  // (the soft edge of each lid)
		const float Reach = (Half + Edge) * FMath::Clamp(Lids, 0.f, 1.f);
		for (int32 Top = 0; Top < 2; ++Top)
		{
			// the solid part, then the edge as stacked thin bands fading out
			const float Solid = FMath::Max(0.f, Reach - Edge);
			FCanvasTileItem T(FVector2D(0.f, Top ? 0.f : Canvas->ClipY - Solid), FVector2D(Canvas->ClipX, Solid), FLinearColor::Black);
			T.BlendMode = SE_BLEND_Translucent;
			Canvas->DrawItem(T);
			const int32 Bands = 12;
			for (int32 b = 0; b < Bands; ++b)
			{
				const float y0 = Solid + Edge * b / Bands;
				if (y0 >= Reach)
				{
					break;
				}
				const float a = 1.f - (b + 0.5f) / Bands;
				FCanvasTileItem B(FVector2D(0.f, Top ? y0 : Canvas->ClipY - y0 - Edge / Bands), FVector2D(Canvas->ClipX, Edge / Bands),
					FLinearColor(0.f, 0.f, 0.f, a * a));
				B.BlendMode = SE_BLEND_Translucent;
				Canvas->DrawItem(B);
			}
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
		const float S = H > 0.f ? Canvas->ClipY * 0.045f / H : 1.f;   // (big enough to read at a glance)
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

void AEndingHUD::DrawPlay()
{
	// Part 2 in play: the objective (top left, faint, shown a while when it changes), the player's own lines (captions at
	// the bottom: the game has no voices), what can be used where the eyes rest (a small prompt below the middle), and a
	// page being read (held up in the light: paper filling the middle of the view, the night dimmed round it)
	APart2Character* Me = Cast<APart2Character>(UGameplayStatics::GetPlayerPawn(this, 0));
	if (!Me)
	{
		return;
	}
	AP2Story* Story = nullptr;
	for (TActorIterator<AP2Story> It(GetWorld()); It; ++It)
	{
		Story = *It;
	}
	UFont* Font = GEngine->GetLargeFont();
	FFontRenderInfo Info;
	Info.bClipText = false;
	Info.bEnableShadow = true;
	const float Y = Canvas->ClipY;
	auto Text = [&](const FString& S, float X, float Yp, float Height, const FLinearColor& C, bool bCentre)
	{
		float W = 0.f, H = 0.f;
		Canvas->TextSize(Font, S, W, H);
		const float Sc = H > 0.f ? Y * Height / H : 1.f;
		Canvas->SetDrawColor(C.ToFColor(true));
		Canvas->DrawText(Font, S, bCentre ? X - W * Sc * 0.5f : X, Yp - H * Sc * 0.5f, Sc, Sc, Info);
		return W * Sc;
	};
	FString S;
	float A = 0.f;
	if (Story && Story->GetObjective(S, A))
	{
		Text(S, Canvas->ClipX * 0.045f, Y * 0.07f, 0.03f, FLinearColor(0.82f, 0.85f, 0.9f, A * 0.85f), false);
	}
	if (Story && Story->GetSaid(S, A) && !Me->IsReading())
	{
		Text(S, Canvas->ClipX * 0.5f, Y * 0.885f, 0.04f, FLinearColor(0.93f, 0.93f, 0.9f, A * 0.95f), true);
	}
	if (Me->GetPrompt(S))
	{
		Text(FString::Printf(TEXT("E    %s"), *S), Canvas->ClipX * 0.5f, Y * 0.62f, 0.027f, FLinearColor(0.9f, 0.9f, 0.86f, 0.85f), true);
	}
	int32 Index = 0, Count = 0;
	if (Me->GetReading(S, Index, Count))
	{
		// the night dimmed; the page: old ruled paper, her pencil hand in dark ink, wrapped to the page
		FCanvasTileItem Dim(FVector2D(0.f, 0.f), FVector2D(Canvas->ClipX, Y), FLinearColor(0.f, 0.f, 0.f, 0.62f));
		Dim.BlendMode = SE_BLEND_Translucent;
		Canvas->DrawItem(Dim);
		// (her notebook page: aged ruled paper (tools/make_journal_paper.py), a little crooked in the hand; the words in dark
		// pencil on its rules)
		static UTexture2D* PaperTex = nullptr;
		if (!PaperTex)
		{
			PaperTex = LoadObject<UTexture2D>(nullptr, TEXT("/Game/HollowAcre/UI/T_JournalPaper.T_JournalPaper"));
			if (PaperTex)
			{
				PaperTex->AddToRoot();
			}
		}
		const float Ph = Y * 0.9f, Pw = Ph * 1024.f / 1280.f;
		const float Px = (Canvas->ClipX - Pw) * 0.5f, Py = (Y - Ph) * 0.5f;
		if (PaperTex)
		{
			FCanvasTileItem Paper(FVector2D(Px, Py), PaperTex->GetResource(), FVector2D(Pw, Ph), FLinearColor(0.95f, 0.93f, 0.9f, 1.f));
			Paper.BlendMode = SE_BLEND_Translucent;
			Paper.Rotation = FRotator(0.f, -1.2f, 0.f);
			Paper.PivotPoint = FVector2D(0.5f, 0.5f);
			Canvas->DrawItem(Paper);
		}
		else
		{
			FCanvasTileItem Paper(FVector2D(Px, Py), FVector2D(Pw, Ph), FLinearColor(0.62f, 0.57f, 0.46f, 1.f));
			Canvas->DrawItem(Paper);
		}
		FFontRenderInfo Ink;
		Ink.bClipText = false;
		Ink.bEnableShadow = false;
		// (wrapped by words between the margin and the right edge, one line of writing on each rule)
		const float Rule = Ph * 46.f / 1280.f;
		const float Lh = Rule / Y * 1.45f;       // (written large, a line on every other rule)
		float W = 0.f, H = 0.f;
		Canvas->TextSize(Font, TEXT("M"), W, H);
		const float Sc = H > 0.f ? Y * Lh / H : 1.f;
		TArray<FString> Paras;
		S.ParseIntoArray(Paras, TEXT("\n"), false);
		const float X0 = Px + Pw * 140.f / 1024.f, X1 = Px + Pw * 0.92f;
		float Yl = Py + Ph * (120.f + 3 * 46.f) / 1280.f - H * Sc * 0.95f;
		Canvas->SetDrawColor(FLinearColor(0.02f, 0.02f, 0.035f, 1.f).ToFColor(true));
		for (const FString& Para : Paras)
		{
			TArray<FString> Words;
			Para.ParseIntoArray(Words, TEXT(" "), true);
			FString Line;
			for (int32 i = 0; i <= Words.Num(); ++i)
			{
				const FString Try = i < Words.Num() ? (Line.IsEmpty() ? Words[i] : Line + TEXT(" ") + Words[i]) : FString();
				float Tw = 0.f, Th = 0.f;
				if (i < Words.Num())
				{
					Canvas->TextSize(Font, Try, Tw, Th);
				}
				if (i == Words.Num() || Tw * Sc > X1 - X0)
				{
					if (!Line.IsEmpty())
					{
						Canvas->DrawText(Font, Line, X0, Yl, Sc, Sc, Ink);
						Yl += Rule * 2.f;
					}
					Line = i < Words.Num() ? Words[i] : FString();
				}
				else
				{
					Line = Try;
				}
			}
			if (Para.IsEmpty())
			{
				Yl += Rule * 0.0f;
			}
		}
		Text(FString::Printf(TEXT("%d / %d        E"), Index + 1, Count), Canvas->ClipX * 0.5f, Py + Ph + Y * 0.025f, 0.022f, FLinearColor(0.8f, 0.8f, 0.78f, 0.8f), true);
	}
}
