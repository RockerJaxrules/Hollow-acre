#include "P2Audio.h"

#include "Components/AudioComponent.h"
#include "EngineUtils.h"
#include "Husk.h"
#include "HuskHunter.h"
#include "Kessler.h"
#include "Kismet/GameplayStatics.h"
#include "Part2Character.h"
#include "Part2Story.h"
#include "Sound/SoundAttenuation.h"
#include "Sound/SoundBase.h"

AP2Audio::AP2Audio()
{
	PrimaryActorTick.bCanEverTick = true;
}

USoundBase* AP2Audio::Clip(const TCHAR* Name)
{
	const FName K(Name);
	if (TObjectPtr<USoundBase>* F = Clips.Find(K))
	{
		return *F;
	}
	USoundBase* S = LoadObject<USoundBase>(nullptr, *FString::Printf(TEXT("/Game/HollowAcre/Audio/Play/%s.%s"), Name, Name));
	Clips.Add(K, S);
	if (!S)
	{
		UE_LOG(LogTemp, Warning, TEXT("P2Audio: no clip %s"), Name);
	}
	return S;
}

USoundBase* AP2Audio::Pick(const TCHAR* Stem, int32 Count)
{
	return Clip(*FString::Printf(TEXT("%s_%02d"), Stem, FMath::RandRange(0, Count - 1)));
}

UAudioComponent* AP2Audio::Bed(const TCHAR* Name)
{
	USoundBase* S = Clip(Name);
	if (!S)
	{
		return nullptr;
	}
	UAudioComponent* A = UGameplayStatics::SpawnSound2D(this, S, 0.f, 1.f, 0.f, nullptr, true, false);
	if (A)
	{
		A->bAutoDestroy = false;
	}
	return A;
}

void AP2Audio::At(USoundBase* S, const FVector& Where, float Volume, float Pitch, bool bFar)
{
	if (S)
	{
		UGameplayStatics::PlaySoundAtLocation(this, S, Where, Volume, Pitch, 0.f, bFar ? Far.Get() : Near.Get());
	}
}

void AP2Audio::Flat(USoundBase* S, float Volume)
{
	if (S)
	{
		UGameplayStatics::PlaySound2D(this, S, Volume);
	}
}

FVector AP2Audio::HuskAt() const
{
	for (TActorIterator<AHuskHunter> It(GetWorld()); It; ++It)
	{
		if (It->Husk && !It->Husk->IsHidden())
		{
			return It->Husk->GetActorLocation() + FVector(0.f, 0.f, 120.f);
		}
	}
	for (TActorIterator<AHusk> It(GetWorld()); It; ++It)
	{
		if (!It->IsHidden())
		{
			return It->GetActorLocation() + FVector(0.f, 0.f, 120.f);
		}
	}
	return FVector::ZeroVector;
}

void AP2Audio::Start(AP2Story* InStory)
{
	Story = InStory;
	// (near sounds fall off over 25 m; far ones (the shriek, the rifle) carry across the valley)
	Near = NewObject<USoundAttenuation>(this);
	Near->Attenuation.bAttenuate = true;
	Near->Attenuation.bSpatialize = true;
	Near->Attenuation.AttenuationShape = EAttenuationShape::Sphere;
	Near->Attenuation.AttenuationShapeExtents = FVector(250.f);
	Near->Attenuation.FalloffDistance = 2500.f;
	Far = NewObject<USoundAttenuation>(this);
	Far->Attenuation = Near->Attenuation;
	Far->Attenuation.AttenuationShapeExtents = FVector(800.f);
	Far->Attenuation.FalloffDistance = 12000.f;
	WindOut = Bed(TEXT("amb_wind_out"));
	Forest = Bed(TEXT("amb_forest"));
	WindIn = Bed(TEXT("amb_wind_in"));
	Heart = Bed(TEXT("amb_heart"));
	Drone = Bed(TEXT("amb_drone"));
	UE_LOG(LogTemp, Display, TEXT("P2Audio: live sound begins (%d beds)"), (WindOut ? 1 : 0) + (Forest ? 1 : 0) + (WindIn ? 1 : 0) + (Heart ? 1 : 0) + (Drone ? 1 : 0));
}

void AP2Audio::OnEvent(const TCHAR* Kind, float Value)
{
	APart2Character* P = Cast<APart2Character>(UGameplayStatics::GetPlayerPawn(this, 0));
	const FVector Me = P ? P->GetActorLocation() : FVector::ZeroVector;
	const FVector H = HuskAt();
	const FString K(Kind);
	if (K == TEXT("husk_shriek"))
	{
		At(Clip(TEXT("husk_shriek")), H.IsZero() ? Me + FVector(800.f, 0.f, 0.f) : H, 1.4f, 1.f, true);
		if (Value < 1500.f)
		{
			Flat(Clip(TEXT("sting_scare")), 0.9f);       // (close: the strings stab with it)
		}
	}
	else if (K == TEXT("bang"))
	{
		At(Clip(TEXT("bang")), Story.IsValid() && !Story->WindowPoint().IsZero() ? Story->WindowPoint() : Me, 1.6f);
	}
	else if (K == TEXT("scrape"))
	{
		At(Clip(TEXT("scrape")), Story.IsValid() ? Story->WindowPoint() : Me, 1.2f);
	}
	else if (K == TEXT("husk_hiss"))
	{
		At(Clip(TEXT("husk_growl")), H.IsZero() ? Me : H, 1.3f);
		Flat(Clip(TEXT("sting_scare")), 0.8f);
	}
	else if (K == TEXT("sighting_look") || K == TEXT("truck_seen"))
	{
		Flat(Clip(TEXT("sting_look")), 0.8f);
	}
	else if (K == TEXT("rifle_shot") || K == TEXT("second_fire"))
	{
		AKessler* Ks = Story.IsValid() ? Story->GetKessler() : nullptr;
		At(Clip(TEXT("rifle_shot")), Ks ? Ks->GetActorLocation() + FVector(0.f, 0.f, 150.f) : Me, 2.f, 1.f, true);
	}
	else if (K == TEXT("truck_door_bang"))
	{
		AActor* Tk = Story.IsValid() ? Story->GetTruck() : nullptr;
		At(Clip(TEXT("door_slam")), Tk ? Tk->GetActorLocation() : Me, 1.8f);
		At(Clip(TEXT("metal_creak")), Tk ? Tk->GetActorLocation() : Me, 1.f);
		Flat(Clip(TEXT("sting_scare")), 0.9f);
	}
	else if (K == TEXT("matches"))
	{
		Flat(Clip(TEXT("match_hiss")), 0.8f);
	}
	else if (K == TEXT("fire_lit") || K == TEXT("stove_feed"))
	{
		if (!Fire && Story.IsValid())
		{
			const FVector Stove = Story->GetShedAt();
			Fire = UGameplayStatics::SpawnSoundAtLocation(this, Clip(TEXT("amb_fire")), Story->ShedStove(), FRotator::ZeroRotator, 1.f, 1.f, 0.f, Near);
			if (Fire)
			{
				Fire->bAutoDestroy = false;
			}
			(void)Stove;
		}
	}
	else if (K == TEXT("headlight_dies"))
	{
		Flat(Clip(TEXT("clicks")), 0.7f);
	}
	else if (K == TEXT("husk_kill"))
	{
		Flat(Clip(TEXT("husk_scream_close")), 1.4f);
	}
	else if (K == TEXT("door_shut") || K == TEXT("door_bar"))
	{
		// (at the door itself: the leaf banging home in its frame, then the bar dropping into its brackets, a heavy
		// knock of wood on iron with the boards' ring)
		const FVector D = Story.IsValid() && Story->ShedDoor ? Story->ShedDoor->GetActorLocation() + FVector(0.f, 0.f, 100.f) : Me;
		if (K == TEXT("door_shut"))
		{
			At(Clip(TEXT("door_slam")), D, 1.1f, 1.15f);
		}
		else
		{
			At(Clip(TEXT("bang")), D, 1.3f, 0.8f);
			At(Clip(TEXT("metal_creak")), D, 0.5f, 1.6f);
		}
	}
}

void AP2Audio::Tick(float Dt)
{
	Super::Tick(Dt);
	APart2Character* P = Cast<APart2Character>(UGameplayStatics::GetPlayerPawn(this, 0));
	if (!P || !Story.IsValid())
	{
		return;
	}
	// (inside the shed: the wind through the boards instead of the open night; eased over a second)
	const bool bIn = Story->InShed(P->GetActorLocation());
	Inside = FMath::FInterpTo(Inside, bIn ? 1.f : 0.f, Dt, 1.5f);
	// (the hunt's menace: the heartbeat and the drone rise with it)
	float M = 0.f;
	for (TActorIterator<AHuskHunter> It(GetWorld()); It; ++It)
	{
		M = FMath::Max(M, It->Menace);
	}
	Danger = FMath::FInterpTo(Danger, M, Dt, 0.8f);
	if (WindOut)
	{
		WindOut->SetVolumeMultiplier(FMath::Lerp(1.f, 0.12f, Inside));
	}
	if (Forest)
	{
		Forest->SetVolumeMultiplier(FMath::Lerp(1.f, 0.05f, Inside));
	}
	if (WindIn)
	{
		WindIn->SetVolumeMultiplier(FMath::Lerp(0.f, 1.f, Inside));
	}
	if (Heart)
	{
		Heart->SetVolumeMultiplier(0.05f + 0.95f * FMath::Pow(Danger, 1.5f));
	}
	if (Drone)
	{
		Drone->SetVolumeMultiplier(0.15f + 0.85f * Danger);
	}
	// (the player's steps in the snow: one at every stride, walking, running or crouched)
	const FVector Feet = P->GetActorLocation() - FVector(0.f, 0.f, 90.f);
	if (!LastFeet.IsZero() && !P->bCutscene)
	{
		StepDist += FVector::Dist2D(Feet, LastFeet);
		const bool bRun = P->IsRunningNow(), bCrouch = P->bIsCrouched;
		const float Stride = bRun ? 115.f : bCrouch ? 55.f : 75.f;
		if (StepDist > Stride)
		{
			StepDist = 0.f;
			At(bRun ? Pick(TEXT("step_run"), 8) : bCrouch ? Pick(TEXT("step_crouch"), 6) : Pick(TEXT("step_walk"), 8), Feet, bRun ? 1.f : 0.8f,
				FMath::FRandRange(0.94f, 1.06f));
		}
	}
	LastFeet = Feet;
	// (the creature heard before it is seen: its heavy steps in the snow while it moves; its breath when it is near)
	for (TActorIterator<AHuskHunter> It(GetWorld()); It; ++It)
	{
		if (!It->Husk || It->Husk->IsHidden())
		{
			continue;
		}
		const FVector Hat = It->Husk->GetActorLocation();
		const float Sp = It->Husk->GetVelocity().Size2D();
		HuskStepT -= Dt;
		if (HuskStepT <= 0.f && Sp > 40.f)
		{
			HuskStepT = Sp > 400.f ? 0.22f : 0.55f;
			At(Pick(TEXT("husk_step"), 8), Hat, Sp > 400.f ? 1.3f : 1.f, Sp > 400.f ? 0.92f : 1.f);
		}
		HuskBreathT -= Dt;
		if (HuskBreathT <= 0.f && FVector::Dist(Hat, P->GetActorLocation()) < 1500.f)
		{
			HuskBreathT = FMath::FRandRange(1.6f, 2.6f);
			At(Clip(TEXT("husk_breath")), Hat + FVector(0.f, 0.f, 150.f), 1.1f);
		}
	}
}
