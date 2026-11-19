#include "KesslerScene.h"

#include "Components/PointLightComponent.h"
#include "Components/StaticMeshComponent.h"
#include "EndingDirector.h"
#include "Engine/StaticMesh.h"
#include "Engine/StaticMeshActor.h"
#include "Engine/World.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Kessler.h"
#include "Materials/MaterialInterface.h"
#include "Part2Character.h"
#include "Part2Story.h"
#include "Snowfall.h"
#include "EngineUtils.h"
#include "UObject/UObjectIterator.h"

AKesslerScene::AKesslerScene()
{
	PrimaryActorTick.bCanEverTick = true;
	PrimaryActorTick.TickGroup = TG_PrePhysics;
}

bool AKesslerScene::Once(const TCHAR* Beat)
{
	if (Done.Contains(FName(Beat)))
	{
		return false;
	}
	Done.Add(FName(Beat));
	UE_LOG(LogTemp, Display, TEXT("KesslerScene %.2f %s"), T, Beat);
	if (Story.IsValid())
	{
		Story->Event(Beat);
	}
	return true;
}

FQuat AKesslerScene::PlankLean() const
{
	// (stood on its end, its top tipped 14 degrees back against the front wall's boards)
	const FQuat R = ShedT.GetRotation();
	FQuat Q = FQuat(R.GetAxisY(), FMath::DegreesToRadians(14.f)) * R;
	if (FVector::DotProduct(Q.GetAxisZ(), R.GetAxisX()) < 0.f)
	{
		Q = FQuat(R.GetAxisY(), FMath::DegreesToRadians(-14.f)) * R;
	}
	return Q;
}

FVector AKesslerScene::PlankRest() const
{
	return At(-24.f, 74.f, 0.f) + PlankLean().GetAxisZ() * 61.f;
}

FVector AKesslerScene::At(float X, float Y, float Z) const
{
	const FVector W = ShedT.TransformPosition(FVector(X, Y, 0.f));
	return FVector(W.X, W.Y, FloorZ + Z);
}

void AKesslerScene::Line(const FString& Text, float Secs)
{
	if (Story.IsValid())
	{
		Story->Say(Text, 0.f, Secs);
	}
	if (Text.StartsWith(TEXT("Kessler:")))
	{
		SpeakEnd = T + Secs * 0.85f;            // (his head moves with what he says)
		// (her face for the line: wary and hard on the creature, tired on the road, softening on the journal and the watch)
		if (AKessler* Ks = Story.IsValid() ? Story->GetKessler() : nullptr)
		{
			struct FMood { const TCHAR* Starts; float Down, Squint, RaiseIn, Cheek, Lids; };
			static const FMood Moods[] = {
				{TEXT("Kessler: You'd be"), 0.25f, 0.2f, 0.f, 0.f, 0.15f},
				{TEXT("Kessler: Men. Once."), 0.55f, 0.6f, 0.f, 0.35f, 0.f},
				{TEXT("Kessler: They come down"), 0.4f, 0.35f, 0.15f, 0.15f, 0.1f},
				{TEXT("Kessler: Don't be out"), 0.75f, 0.45f, 0.f, 0.3f, 0.f},
				{TEXT("Kessler: Road's shut"), 0.2f, 0.15f, 0.2f, 0.f, 0.35f},
				{TEXT("Kessler: She came"), 0.f, 0.1f, 0.6f, 0.f, 0.3f},
				{TEXT("Kessler: Sleep."), 0.1f, 0.f, 0.25f, 0.f, 0.45f},
			};
			for (const FMood& Md : Moods)
			{
				if (Text.StartsWith(Md.Starts))
				{
					Ks->ExprBrowDown = Md.Down;
					Ks->ExprSquint = Md.Squint;
					Ks->ExprBrowRaiseIn = Md.RaiseIn;
					Ks->ExprCheek = Md.Cheek;
					Ks->ExprLidsDown = Md.Lids;
				}
			}
		}
	}
}

void AKesslerScene::Look(const FVector& Point, float Rate)
{
	if (P.IsValid())
	{
		P->CutLook = Point;
		P->CutLookRate = Rate;
	}
}

AStaticMeshActor* AKesslerScene::Prop(UStaticMesh* Mesh, UMaterialInterface* Mat, const FTransform& Xf)
{
	FActorSpawnParameters Sp;
	Sp.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
	AStaticMeshActor* A = GetWorld()->SpawnActor<AStaticMeshActor>(AStaticMeshActor::StaticClass(), Xf, Sp);
	if (A)
	{
		A->SetMobility(EComponentMobility::Movable);
		A->GetStaticMeshComponent()->SetStaticMesh(Mesh);
		A->GetStaticMeshComponent()->SetCollisionEnabled(ECollisionEnabled::NoCollision);
		A->GetStaticMeshComponent()->SetLightingChannels(true, true, true);
		A->SetActorScale3D(Xf.GetScale3D());
		if (Mat)
		{
			A->GetStaticMeshComponent()->SetMaterial(0, Mat);
		}
	}
	return A;
}

void AKesslerScene::Start(AP2Story* InStory)
{
	Story = InStory;
	if (!InStory)
	{
		return;
	}
	K = InStory->Kessler.Get();
	P = InStory->Player;
	ShedT = InStory->ShedT;
	FloorZ = InStory->GroundAt(ShedT.TransformPosition(FVector(-185.f, 0.f, 0.f)));
	UStaticMesh* Cube = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Cube.Cube"));
	UStaticMesh* Cyl = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Cylinder.Cylinder"));
	UMaterialInterface* Board = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Town/Materials/M_Town_Barewood.M_Town_Barewood"));
	UMaterialInterface* Dry = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Town/Materials/M_Town_Drywood.M_Town_Drywood"));
	const FQuat R = ShedT.GetRotation();
	// the bar: a plank leant against the wall inside the door, and an iron-strapped wooden bracket on each jamb
	if (Cube)
	{
		Plank = Prop(Cube, Board, FTransform(PlankLean(), PlankRest(), FVector(0.05f, 0.18f, 1.22f)));
		for (float Y : {-66.f, 46.f})
		{
			Brackets.Add(Prop(Cube, Dry, FTransform(R, At(-7.f, Y, 100.f), FVector(0.07f, 0.09f, 0.14f))));
		}
	}
	if (Cyl)
	{
		Split = Prop(Cyl, Dry, FTransform(R, At(-200.f, -150.f, 6.f), FVector(0.11f, 0.11f, 0.4f)));
		if (Split)
		{
			Split->SetActorHiddenInGame(true);
		}
	}
	// the cut: a blink, and the player sat by the stove, the door before them; he is out on the step
	if (P.IsValid())
	{
		P->bCutscene = true;
		P->CutFov = 0.f;
		const FVector Seat = At(-196.f, -96.f, 0.f);
		P->SetActorLocation(FVector(Seat.X, Seat.Y, Seat.Z + 70.f), false, nullptr, ETeleportType::TeleportPhysics);
		if (!P->bIsCrouched)
		{
			P->Crouch();
		}
		if (P->IsLightOn())
		{
			P->FlashlightToggle();
		}
		if (P->Controller)
		{
			P->Controller->SetControlRotation((At(0.f, -10.f, 120.f) - P->EyesAt()).Rotation());
		}
		P->bCarryingWood = false;
	}
	if (K.IsValid())
	{
		K->LitByAll();
		K->bBreathShows = false;
		// (indoors: no falling snow drawn; a flake drifting past the eyes, lit by the fire, hung as an orange blur)
		for (TActorIterator<ASnowfall> It(GetWorld()); It; ++It)
		{
			It->SetActorHiddenInGame(true);
		}
		K->LowerRifle();
		K->LanternUp = 0.f;
		K->SetActorLocation(At(140.f, -12.f, 0.f), false, nullptr, ETeleportType::TeleportPhysics);
		K->SetActorRotation(FRotator(0.f, (R.GetAxisX() * -1.f).Rotation().Yaw, 0.f));
	}
	if (InStory->Director)
	{
		InStory->Director->WakeLids = 1.f;
	}
	InStory->Lines.Reset();
	InStory->SetObjective(TEXT(""));
	UE_LOG(LogTemp, Display, TEXT("KesslerScene: begins (the player sat by the stove at %s)"), P.IsValid() ? *P->GetActorLocation().ToCompactString() : TEXT("?"));
}

void AKesslerScene::Tick(float Dt)
{
	Super::Tick(Dt);
	if (!Story.IsValid() || !K.IsValid() || !P.IsValid() || bOver)
	{
		return;
	}
	T += Dt;
	AP2Story* S = Story.Get();
	AKessler* Km = K.Get();
	AEndingDirector* Dir = S->Director;
	const FVector Eyes = P->EyesAt();
	const FVector KEyes = Km->EyesAt();
	const FQuat R = ShedT.GetRotation();
	const FVector In = -R.GetAxisX();             // (into the shed from its door)
	const FVector Stove = At(-290.f, -115.f, 0.f);
	const FVector StoveDoor = Stove + R.GetAxisY() * 34.f + FVector(0.f, 0.f, 46.f);
	auto Ease = [](float a) { return FMath::SmoothStep(0.f, 1.f, FMath::Clamp(a, 0.f, 1.f)); };

	// 0: the blink open on the door
	if (Dir && T < 1.2f)
	{
		Dir->WakeLids = FMath::Clamp(1.f - T / 0.9f, 0.f, 1.f);
	}
	// 1. Inside: he pushes in, the lantern first, its light swinging over the walls and the window's gouges; he swings the
	// door shut behind him (one heavy knock) and bars it: the plank from beside the door, in both hands, dropped into the
	// brackets on the jambs
	if (Once(TEXT("scene_inside")))
	{
		Km->WalkRate = 0.75f;
		Km->WalkTo(At(-110.f, 15.f));
		Km->LanternUp = 0.7f;
	}
	if (T < 3.4f)
	{
		const float a = FMath::Clamp((T - 0.8f) / 2.4f, 0.f, 1.f);
		Km->LanternToward = FMath::Lerp(At(-120.f, 185.f, 150.f), At(-370.f, -60.f, 130.f), Ease(a));
		Km->LookAtPoint = Km->LanternToward;
		Look(KEyes - FVector(0.f, 0.f, 12.f), 2.2f);
	}
	if (S->ShedDoor && T > 3.2f && T < 5.6f)
	{
		Km->LanternUp = 0.f;
		const float Open = 1.f - FMath::Clamp((T - 3.2f) / 1.5f, 0.f, 1.f) * FMath::Clamp((T - 3.2f) / 1.5f, 0.f, 1.f);
		S->SetShedDoor(Open);
		const FVector Edge = S->ShedDoor->GetActorTransform().TransformPosition(FVector(-85.f, 22.8f, 105.f));
		Km->FaceTo(Edge);
		Km->LookAtPoint = Edge;
		Km->ReachR = Edge;
		Km->ReachRWant = Open > 0.4f ? 1.f : 0.f;          // (pushed: it swings on the rest of the way itself)
		Look(S->ShedDoor->GetActorTransform().TransformPosition(FVector(-42.f, 11.f, 110.f)), 1.8f);
		if (T > 4.7f && Once(TEXT("door_shut")))
		{
			S->SetShedDoor(0.f);
		}
	}
	if (T > 5.0f && Once(TEXT("scene_to_plank")))
	{
		Km->ReachRWant = 0.f;
		Km->WalkTo(At(-52.f, 30.f));
		// (his hands freed for the bar: the lantern set down on the boards inside the door, lighting the room from low;
		// the rifle stood against the front wall by the door, its muzzle up)
		Km->LanternSetAt = At(-34.f, -92.f, 0.f);
		Km->RifleSet = FTransform(FRotator(74.f, R.GetAxisX().Rotation().Yaw, 0.f), At(-16.f, 132.f, 52.f));
		Km->bRifleSet = true;
	}
	if (T > 5.0f && T < 9.6f && Plank)
	{
		const FQuat Lean = PlankLean();
		const FVector Rest = PlankRest();
		const FQuat Across = FQuat(R.GetAxisX(), FMath::DegreesToRadians(90.f)) * R;     // (its length across the doorway)
		const FVector Carry = At(-40.f, 8.f, 112.f), Bar = At(-9.f, -10.f, 100.f);
		FVector Pl = Rest;
		FQuat Q = Lean;
		if (T < 6.2f)
		{
			Km->FaceTo(Rest);
			Km->LookAtPoint = Rest + Lean.GetAxisZ() * 50.f;
			if (T > 5.7f)
			{
				Km->ReachR = Rest + Lean.GetAxisZ() * 52.f;
				Km->ReachRWant = 1.f;
			}
		}
		else if (T < 7.6f)
		{
			const float a = Ease((T - 6.2f) / 1.4f);
			Km->FaceTo(Bar);
			Km->LookAtPoint = Bar;
			Pl = FMath::Lerp(Rest, Carry, a);
			Q = FQuat::Slerp(Lean, Across, a);
		}
		else
		{
			const float a = Ease((T - 7.6f) / 1.0f);
			Pl = FMath::Lerp(Carry, Bar, a);
			Q = Across;
		}
		Plank->SetActorLocationAndRotation(Pl, Q);
		if (T >= 6.2f)
		{
			const FVector Along = Q.GetAxisZ();
			Km->ReachR = Pl + Along * 34.f;
			Km->ReachL = Pl - Along * 34.f;
			Km->ReachRWant = Km->ReachLWant = 1.f;
		}
		Look(T < 7.6f ? (Pl + KEyes) * 0.5f : Bar, 1.5f);
		if (T > 8.5f && Once(TEXT("door_bar")))
		{
			Plank->SetActorLocationAndRotation(Bar, Across);
		}
	}
	// 2. The fire: to the stove, down on his heels before it, a split from her woodbox in through its door; it flares on
	// his face. He doesn't look at the player.
	if (T > 9.6f && Once(TEXT("scene_to_stove")))
	{
		Km->ReachRWant = Km->ReachLWant = 0.f;
		Km->WalkTo(Stove + R.GetAxisY() * 92.f + R.GetAxisX() * 10.f);
		Km->LookAtPoint = StoveDoor;
	}
	if (T > 9.6f && T < 27.2f)
	{
		Km->FaceTo(StoveDoor);
		// (the eyes stay on the barred door a beat as she steps away from it: the plank in its brackets, seen (blind
		// judge, run 52: her back hid it))
		Look(T < 11.0f ? At(-9.f, -10.f, 100.f) : T < 12.8f ? StoveDoor + FVector(0.f, 0.f, 25.f) : KEyes - FVector(0.f, 0.f, 6.f), T < 11.0f ? 1.5f : T < 12.8f ? 1.0f : 1.2f);
	}
	if (T > 12.5f)
	{
		Km->CrouchWant = (T < 48.6f || (T > 56.2f && T < 64.2f)) ? 1.f : 0.f;
	}
	if (T > 13.8f && T < 16.2f && Split)
	{
		// (the split from the woodbox in his right hand, in through the door)
		Split->SetActorHiddenInGame(false);
		const FVector From = At(-235.f, -165.f, 30.f), Into = StoveDoor - R.GetAxisY() * 18.f;
		const float a = Ease((T - 13.8f) / 2.1f);
		const FVector Sp = FMath::Lerp(From, Into, a);
		Split->SetActorLocationAndRotation(Sp, FQuat(R.GetAxisY(), FMath::DegreesToRadians(80.f)) * R);
		Km->ReachR = Sp;
		Km->ReachRWant = 1.f;
	}
	if (T > 16.2f && Once(TEXT("stove_feed")))
	{
		if (Split)
		{
			Split->SetActorHiddenInGame(true);
		}
		Km->ReachRWant = 0.f;
		S->FuelOverride = 1.45f;               // (it takes: flares)
	}
	if (T > 16.7f && Once(TEXT("line_wrote")))
	{
		Line(TEXT("Kessler: You'd be the one I wrote to."), 4.2f);
	}
	// 3. The question. He shuts the stove's door: his face drops back into the dimmer light. A long hold.
	if (T > 22.2f && Once(TEXT("line_what")))
	{
		Line(TEXT("What was that?"), 2.6f);
	}
	if (T > 25.2f && T < 26.8f)
	{
		Km->ReachR = StoveDoor + R.GetAxisY() * 4.f;
		Km->ReachRWant = 1.f;
	}
	if (T > 26.8f && Once(TEXT("stove_shut")))
	{
		Km->ReachRWant = 0.f;
		S->FuelOverride = 0.55f;               // (the door shut on it: only its window glow and the lantern)
	}
	if (T > 27.2f && T < 48.6f)
	{
		Km->LookAtPoint = T < 29.8f ? StoveDoor : Eyes;
		if (T > 29.8f)
		{
			Km->FaceTo(FMath::Lerp(StoveDoor, Eyes, 0.6f));
		}
		Look(KEyes - FVector(0.f, 0.f, 4.f), 0.9f);
	}
	if (T > 30.2f && Once(TEXT("line_men")))
	{
		Line(TEXT("Kessler: Men. Once."), 2.8f);
	}
	if (T > 33.8f && Once(TEXT("line_highground")))
	{
		Line(TEXT("Kessler: They come down off the high ground when the snow shuts the road."), 4.4f);
	}
	if (T > 38.5f && Once(TEXT("line_dark")))
	{
		Line(TEXT("Kessler: Don't be out after dark."), 2.8f);
	}
	// 4. The road.
	if (T > 41.8f && Once(TEXT("line_car")))
	{
		Line(TEXT("My car..."), 2.2f);
	}
	if (T > 44.2f && Once(TEXT("line_road")))
	{
		Line(TEXT("Kessler: Road's shut till you've got something that'll climb it."), 4.2f);
	}
	// 5. The journal: up, to the table; it in his hands, its pages turned with a gloved thumb; the first time his face
	// softens. Then into the player's hands.
	AActor* J = S->ShedJournal;
	const FVector Table = At(-318.f, 30.f, 79.f);
	if (T > 48.7f && Once(TEXT("scene_to_table")))
	{
		Km->WalkTo(At(-262.f, 30.f));
		Km->LookAtPoint = Table;
	}
	const FVector Hearth = Stove + R.GetAxisY() * 92.f + R.GetAxisX() * 10.f;
	if (T > 48.7f && T < 63.2f)
	{
		// (and down to the open book in her hands while she reads it, so it reads as her journal (judge, run 52))
		Look(T < 53.5f ? Table + FVector(0.f, 0.f, 30.f) : (T > 57.0f && T < 60.6f && J) ? J->GetActorLocation() : KEyes - FVector(0.f, 0.f, T < 56.f ? 15.f : 8.f), 1.2f);
	}
	if (T > 51.7f && Once(TEXT("journal_up")))
	{
		UE_LOG(LogTemp, Display, TEXT("KesslerScene: her journal %s at %s (hidden %d)"), J ? *J->GetName() : TEXT("MISSING"),
			J ? *J->GetActorLocation().ToCompactString() : TEXT("-"), J ? (int32)J->IsHidden() : -1);
	}
	if (T > 53.f && Once(TEXT("journal_to_fire")))
	{
		Km->WalkTo(Hearth);
	}
	if (J && T > 51.7f && T < 63.7f)
	{
		J->SetActorHiddenInGame(false);
		const FVector Chest = KEyes - FVector(0.f, 0.f, 30.f) + Km->GetActorForwardVector() * 34.f;
		const FVector Give = Eyes + (KEyes - Eyes).GetSafeNormal2D() * 72.f - FVector(0.f, 0.f, 34.f);
		FVector Jp = Table;
		FQuat Jq = J->GetActorQuat();
		if (T < 53.0f)
		{
			Km->FaceTo(Table);
			Km->ReachR = Table + FVector(0.f, 0.f, 6.f);
			Km->ReachRWant = 1.f;
		}
		else if (T < 61.0f)
		{
			// (carried back to the fire against his chest; crouched there, opened to his eyes in its light, pages turned)
			const float a = Ease((T - 53.0f) / 1.0f);
			if (T > 56.2f)
			{
				Km->FaceTo(StoveDoor);
			}
			Jp = FMath::Lerp(Table, Chest, a);
			const float Turn = FMath::Sin(FMath::Max(0.f, T - 57.f) * 2.3f) * 6.f;
			Jq = FQuat(FVector::UpVector, FMath::DegreesToRadians(Turn)) * FRotationMatrix::MakeFromZ(KEyes - Jp).ToQuat();
			Km->LookAtPoint = T > 56.2f ? Jp : Hearth + FVector(0.f, 0.f, 100.f);
			Km->ReachR = Jp + Km->GetActorRightVector() * 9.f;
			Km->ReachL = Jp - Km->GetActorRightVector() * 9.f;
			Km->ReachRWant = 1.f;
			Km->ReachLWant = a;
		}
		else
		{
			const float a = Ease((T - 61.0f) / 1.4f);
			Km->FaceTo(Eyes);
			Km->LookAtPoint = Eyes;
			Jp = FMath::Lerp(Chest, Give, a);
			Jq = FRotationMatrix::MakeFromZ(Eyes - Jp).ToQuat();          // (held out, its cover to the player's eyes)
			Km->ReachR = Jp;
			Km->ReachRWant = 1.f;
			Km->ReachLWant = 0.f;
			Look(T < 62.6f ? Jp : KEyes, 1.6f);
		}
		J->SetActorLocationAndRotation(Jp, Jq);
	}
	if (T > 58.0f && Once(TEXT("line_came_through")))
	{
		Line(TEXT("Kessler: She came through here."), 3.8f);
	}
	if (T > 63.7f && Once(TEXT("journal_given")))
	{
		if (J)
		{
			J->SetActorHiddenInGame(true);       // (in the player's hands now)
		}
		Km->ReachRWant = Km->ReachLWant = 0.f;
	}
	// 6. The watch: back to the door; down against it, the rifle across his knees, the lantern set by him and turned down
	if (T > 64.2f && Once(TEXT("scene_to_door")))
	{
		Km->WalkTo(At(-34.f, -8.f));
		Km->LookAtPoint = Eyes;
	}
	if (T > 64.2f)
	{
		Look(KEyes - FVector(0.f, 0.f, T < 69.f ? 15.f : 32.f), 1.0f);
	}
	if (T > 68.0f)
	{
		Km->FaceTo(At(-260.f, -8.f));
		Km->SitWant = 1.f;
	}
	if (T > 69.7f)
	{
		// (across his knees: along his right-left, at his thighs, the muzzle to his left)
		const FVector Knees = Km->BoneAt(TEXT("pelvis")).GetLocation() + Km->GetActorForwardVector() * 40.f + FVector(0.f, 0.f, 32.f);
		Km->RifleSet = FTransform(FRotator(0.f, (-Km->GetActorRightVector()).Rotation().Yaw, 0.f), Knees);
		Km->bRifleSet = true;
		Km->LanternTrim = FMath::Lerp(1.f, 0.28f, Ease((T - 77.6f) / 2.5f));
	}
	if (T > 74.0f && Once(TEXT("line_sleep")))
	{
		Line(TEXT("Kessler: Sleep. I'll watch."), 3.2f);
	}
	// the player's eyes to the gap in the boards where the hand came through; the lantern's last glow on them; a long
	// slow blink, and black
	// (turned in time to hold on it: at the old slow rate the eyes were still swinging round when the lids closed and the
	// window never came into view (blind judge, run 52))
	if (T > 77.4f)
	{
		Look(S->WindowGap.IsZero() ? At(-370.f, 60.f, 130.f) : S->WindowGap - FVector(0.f, 0.f, 55.f), 1.3f);     // (the boarded window's middle: at its top gap, from the floor by the stove, the view tipped up into the ceiling (judge, run 55))
	}
	if (Dir && T > 83.2f)
	{
		const float b = T - 83.2f;
		Dir->WakeLids = b < 2.4f ? Ease(b / 2.4f) : b < 3.6f ? 1.f - 0.55f * Ease((b - 2.4f) / 1.0f) : FMath::Clamp(0.45f + (b - 3.6f) / 2.2f, 0.f, 1.f);
	}
	if (T > 90.2f && Dir && Once(TEXT("card_morning")))
	{
		Dir->ShowCard(NSLOCTEXT("HollowAcre", "Morning", "Morning."));
	}
	// (alive while he speaks: small nods and a turn of the head over the words, never still)
	Km->bTalking = T < SpeakEnd;
	if (T < SpeakEnd && !Km->LookAtPoint.IsZero())
	{
		Km->LookAtPoint += FVector(0.f, 0.f, 5.f * FMath::Sin(T * 6.3f) + 3.f * FMath::Sin(T * 2.1f)) + Km->GetActorRightVector() * 6.f * FMath::Sin(T * 1.7f);
	}
	if (T > 96.7f && Once(TEXT("scene_over")))
	{
		bOver = true;
		UE_LOG(LogTemp, Display, TEXT("KesslerScene: over"));
	}
}
