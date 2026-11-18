#include "Part2Story.h"

#include "Components/SkeletalMeshComponent.h"
#include "Components/StaticMeshComponent.h"
#include "EndingDirector.h"
#include "Engine/StaticMeshActor.h"
#include "EngineUtils.h"
#include "Husk.h"
#include "HuskHunter.h"
#include "Kismet/GameplayStatics.h"
#include "Part2Character.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Components/DecalComponent.h"
#include "Components/PointLightComponent.h"
#include "Components/PoseableMeshComponent.h"

void P2Footprint(UWorld* World, const FVector& At, float Yaw, float Size, bool bBare)
{
	static TArray<TWeakObjectPtr<UDecalComponent>> Prints;
	static UMaterialInterface* Boot = nullptr;
	static UMaterialInterface* Bare = nullptr;
	if (!Boot)
	{
		// (kept alive: held only here, the garbage collector would free them between prints)
		Boot = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Prints/MI_PrintBoot.MI_PrintBoot"));
		Bare = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Prints/MI_PrintBare.MI_PrintBare"));
		if (Boot)
		{
			Boot->AddToRoot();
		}
		if (Bare)
		{
			Bare->AddToRoot();
		}
	}
	UMaterialInterface* M = bBare ? Bare : Boot;
	if (!World || !M)
	{
		return;
	}
	// (the snow under it: the first surface straight down)
	FHitResult Hit;
	FCollisionQueryParams Q(TEXT("Print"), true);
	if (!World->LineTraceSingleByObjectType(Hit, At + FVector(0.f, 0.f, 60.f), At - FVector(0.f, 0.f, 200.f), FCollisionObjectQueryParams(ECC_WorldStatic), Q))
	{
		return;
	}
	// (a decal projects along its X: down into the snow; its texture's up (the toe) along the heading)
	const float Half = Size * 0.5f / 0.78f;       // (the print fills ~78% of its texture's length)
	UDecalComponent* D = UGameplayStatics::SpawnDecalAtLocation(World, M, FVector(10.f, Half, Half), Hit.ImpactPoint, FRotator(-90.f, Yaw, 0.f), 0.f);
	if (D)
	{
		D->SetFadeScreenSize(0.002f);
		Prints.Add(D);
	}
	while (Prints.Num() > 360)
	{
		if (Prints[0].IsValid())
		{
			Prints[0]->DestroyComponent();
		}
		Prints.RemoveAt(0);
	}
}

void P2EyeShine(AHusk* H, bool bOn)
{
	if (!H || !H->GetFace())
	{
		return;
	}
	TArray<USceneComponent*> Kids;
	H->GetFace()->GetChildrenComponents(false, Kids);
	TArray<UStaticMeshComponent*> Glints;
	for (USceneComponent* K : Kids)
	{
		if (K && K->GetName().StartsWith(TEXT("EyeGlint")))
		{
			Glints.Add(Cast<UStaticMeshComponent>(K));
		}
	}
	if (Glints.Num() == 0 && bOn)
	{
		static UStaticMesh* Ball = nullptr;
		static UMaterialInterface* Shine = nullptr;
		if (!Ball)
		{
			Ball = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Sphere.Sphere"));
			Shine = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Materials/Blockout/M_EyeShine.M_EyeShine"));
			if (Ball)
			{
				Ball->AddToRoot();
			}
			if (Shine)
			{
				Shine->AddToRoot();
			}
		}
		for (const TCHAR* Bone : {TEXT("FACIAL_L_Eye"), TEXT("FACIAL_R_Eye")})
		{
			UStaticMeshComponent* G = NewObject<UStaticMeshComponent>(H, *FString::Printf(TEXT("EyeGlint_%s"), Bone));
			G->SetStaticMesh(Ball);
			G->SetMaterial(0, Shine);
			G->SetCollisionEnabled(ECollisionEnabled::NoCollision);
			G->SetCastShadow(false);
			const bool bBone = H->GetFace()->GetBoneIndex(Bone) != INDEX_NONE;
			G->SetupAttachment(H->GetFace(), bBone ? FName(Bone) : NAME_None);
			G->SetRelativeScale3D(FVector(0.012f));
			G->SetRelativeLocation(bBone ? FVector(1.4f, 0.f, 0.f) : FVector(0.f, 0.f, 0.f));
			G->RegisterComponent();
			Glints.Add(G);
		}
	}
	for (UStaticMeshComponent* G : Glints)
	{
		if (G)
		{
			G->SetVisibility(bOn);
		}
	}
}

AP2Story::AP2Story()
{
	PrimaryActorTick.bCanEverTick = true;
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
}

void AP2Story::Event(const TCHAR* Kind) const
{
	if (Director)
	{
		Director->LogEvent(Kind);
	}
}

bool AP2Story::Once(const TCHAR* Beat)
{
	const FName N(Beat);
	if (Done.Contains(N))
	{
		return false;
	}
	Done.Add(N);
	UE_LOG(LogTemp, Display, TEXT("P2Story %.2f beat: %s"), Clock, Beat);
	Event(Beat);
	return true;
}

void AP2Story::Say(const FString& Line, float Delay, float Secs)
{
	Lines.Add({Line, Clock + Delay, Secs});
	UE_LOG(LogTemp, Display, TEXT("P2Story %.2f says (at +%.1f): %s"), Clock, Delay, *Line);
}

void AP2Story::SetObjective(const FString& Text)
{
	Objective = Text;
	ObjectiveAt = Clock;
	UE_LOG(LogTemp, Display, TEXT("P2Story %.2f objective: %s"), Clock, *Text);
}

bool AP2Story::GetObjective(FString& Out, float& Alpha) const
{
	if (Objective.IsEmpty())
	{
		return false;
	}
	// (shown a while when it changes, then faded down to a faint reminder)
	const float s = Clock - ObjectiveAt;
	Alpha = s < 0.6f ? s / 0.6f : s < 6.f ? 1.f : FMath::Max(0.f, 1.f - (s - 6.f) / 1.5f);
	Out = Objective;
	return Alpha > 0.01f;
}

bool AP2Story::GetSaid(FString& Out, float& Alpha) const
{
	for (const FLine& L : Lines)
	{
		const float s = Clock - L.At;
		if (s >= 0.f && s < L.Secs)
		{
			Out = L.Text;
			Alpha = FMath::Min(1.f, FMath::Min(s / 0.25f, (L.Secs - s) / 0.4f));
			return true;
		}
	}
	return false;
}

float AP2Story::GroundAt(const FVector& At) const
{
	TArray<FHitResult> Hits;
	FCollisionQueryParams Q(TEXT("StoryGround"), true, this);
	GetWorld()->LineTraceMultiByObjectType(Hits, At + FVector(0.f, 0.f, 3000.f), At - FVector(0.f, 0.f, 3000.f), FCollisionObjectQueryParams(ECC_WorldStatic), Q);
	float Best = At.Z, BestD = 1e9f;
	bool bTown = false;
	for (const FHitResult& H : Hits)
	{
		const UStaticMeshComponent* S = Cast<UStaticMeshComponent>(H.GetComponent());
		const FString N = S && S->GetStaticMesh() ? S->GetStaticMesh()->GetName() : FString();
		const bool bIsTown = N == TEXT("Town_Ground");
		if (!bIsTown && !(N.StartsWith(TEXT("Terrain")) || N == TEXT("Road")))
		{
			continue;
		}
		const float D = FMath::Abs(H.ImpactPoint.Z - At.Z);
		if ((bIsTown && !bTown) || ((bIsTown == bTown) && D < BestD))
		{
			Best = H.ImpactPoint.Z;
			BestD = D;
			bTown = bTown || bIsTown;
		}
	}
	return Best;
}

void AP2Story::Begin(AEndingDirector* InDirector, float InHuskScale)
{
	Director = InDirector;
	HuskScale = InHuskScale;
	Player = Cast<APart2Character>(UGameplayStatics::GetPlayerPawn(this, 0));
	// the camp's street (tools/make_town.py: it runs from beside the car into the camp)
	StreetHead = Player.IsValid() ? Player->GetActorLocation() : FVector::ZeroVector;
	for (TActorIterator<AStaticMeshActor> It(GetWorld()); It; ++It)
	{
		if (It->GetActorLabel() == TEXT("Town Shed"))
		{
			// the tool shed: its open doorway faces the street (the building's +X); the street runs past it
			const FTransform T = It->GetActorTransform();
			StreetU = T.GetRotation().GetAxisY();           // (along the street, into the camp: the shed's +Y; town.json's street_u)
		}
	}
	FurnishShed();
	if (!FParse::Param(FCommandLine::Get(), TEXT("p2oldsnow")))
	{
		UMaterialInterface* Snow = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Town/Materials/M_Town_Snow.M_Town_Snow"));
		for (TActorIterator<AStaticMeshActor> It(GetWorld()); It; ++It)
		{
			if (It->GetActorLabel() == TEXT("Town Ground") && Snow)
			{
				UStaticMeshComponent* M = It->GetStaticMeshComponent();
				for (int32 i = 0; i < M->GetNumMaterials(); ++i)
				{
					M->SetMaterial(i, Snow);
				}
			}
		}
	}
	UE_LOG(LogTemp, Display, TEXT("P2Story Act I begins"));
}

namespace
{
	AStaticMeshActor* Piece(UWorld* W, UStaticMesh* Mesh, const FTransform& T, UMaterialInterface* Mat)
	{
		FActorSpawnParameters P;
		P.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
		AStaticMeshActor* A = W->SpawnActor<AStaticMeshActor>(AStaticMeshActor::StaticClass(), T, P);
		if (A)
		{
			A->SetMobility(EComponentMobility::Movable);
			A->GetStaticMeshComponent()->SetStaticMesh(Mesh);
			A->SetActorScale3D(T.GetScale3D());
			if (Mat)
			{
				A->GetStaticMeshComponent()->SetMaterial(0, Mat);
			}
			A->GetStaticMeshComponent()->SetLightingChannels(true, true, false);
		}
		return A;
	}
}

void AP2Story::FurnishShed()
{
	AStaticMeshActor* Shed = nullptr;
	for (TActorIterator<AStaticMeshActor> It(GetWorld()); It; ++It)
	{
		if (It->GetActorLabel() == TEXT("Town Shed"))
		{
			Shed = *It;
		}
	}
	if (!Shed)
	{
		UE_LOG(LogTemp, Warning, TEXT("P2Story: no tool shed in the camp"));
		return;
	}
	UMaterialInterface* Wood = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Town/Materials/M_Town_Barewood.M_Town_Barewood"));
	UStaticMesh* Cube = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Cube.Cube"));
	// (its inside: the dark behind its boards made boards too, seen from inside by the flashlight)
	UStaticMeshComponent* Sm = Shed->GetStaticMeshComponent();
	if (Sm && Wood)
	{
		const TArray<FName> Slots = Sm->GetMaterialSlotNames();
		for (int32 i = 0; i < Slots.Num(); ++i)
		{
			if (Slots[i].ToString().StartsWith(TEXT("dark")))
			{
				Sm->SetMaterial(i, Wood);
			}
		}
	}
	const FTransform T = Shed->GetActorTransform();
	auto At = [&](float X, float Y, float Z) { return T.TransformPosition(FVector(X, Y, Z)); };
	const FQuat R = T.GetRotation();
	const float G = GroundAt(At(-185.f, 0.f, 50.f));
	const float Lift = G - T.GetLocation().Z;
	if (Cube)
	{
		// a plank floor (cube: 1 m)
		Piece(GetWorld(), Cube, FTransform(R, FVector(At(-185.f, 0.f, 0.f).X, At(-185.f, 0.f, 0.f).Y, G + 2.f), FVector(3.5f, 3.5f, 0.04f)), Wood);
		// a work table against the back wall: a thick plank top on four legs
		const float Tz = G + 76.f;
		Piece(GetWorld(), Cube, FTransform(R, FVector(At(-318.f, 40.f, 0.f).X, At(-318.f, 40.f, 0.f).Y, Tz), FVector(0.62f, 1.3f, 0.045f)), Wood);
		for (const FVector2D& L : {FVector2D(-292.f, -16.f), FVector2D(-344.f, -16.f), FVector2D(-292.f, 96.f), FVector2D(-344.f, 96.f)})
		{
			const FVector P = At(L.X, L.Y, 0.f);
			Piece(GetWorld(), Cube, FTransform(R, FVector(P.X, P.Y, G + 38.f), FVector(0.055f, 0.055f, 0.74f)), Wood);
		}
		// her journal on it, open-cornered, a pencil beside it
		UStaticMesh* Book = LoadObject<UStaticMesh>(nullptr, TEXT("/Game/HollowAcre/Wake/Wake_Manual.Wake_Manual"));
		if (Book)
		{
			const FVector P = At(-312.f, 30.f, 0.f);
			AStaticMeshActor* J = Piece(GetWorld(), Book, FTransform(FQuat(FVector::UpVector, FMath::DegreesToRadians(18.f)) * R, FVector(P.X, P.Y, Tz + 3.2f)), nullptr);
			if (J)
			{
				static UMaterialInterface* Part = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Car/Keys/M_KeyPart.M_KeyPart"));
				UStaticMeshComponent* M = J->GetStaticMeshComponent();
				for (int32 Slot = 0; Slot < M->GetNumMaterials() && Part; ++Slot)
				{
					UMaterialInstanceDynamic* D = UMaterialInstanceDynamic::Create(Part, M);
					M->SetMaterial(Slot, D);
					D->SetVectorParameterValue(TEXT("Color"), Slot == 0 ? FLinearColor(0.045f, 0.028f, 0.018f) : FLinearColor(0.62f, 0.58f, 0.48f));
					D->SetScalarParameterValue(TEXT("Metallic"), 0.f);
					D->SetScalarParameterValue(TEXT("Roughness"), Slot == 0 ? 0.62f : 0.9f);
				}
				J->SetActorLabel(TEXT("Journal"));
				UP2UseComponent* U = NewObject<UP2UseComponent>(J, TEXT("Use"));
				U->Id = TEXT("journal");
				U->Prompt = TEXT("Read the journal");
				U->Pages = {
					TEXT("Nov 8\n\nWent through the rail at the second switchback. The truck is done for. My knee is bad, but I walked down the chute to the old Camp Nine. Nobody has lived here since the mine shut the lower works.\n\nI'll sleep in the tool shed and go up in the morning."),
					TEXT("Nov 9\n\nSomething walked around this shed all night. It never knocked. It stood at the window a long while. I kept the lamp lit and my eyes shut.\n\nIn the morning there were tracks. Bare feet. Human feet, but too long, and too far apart."),
					TEXT("If you are reading this, you came looking for me, and I am so sorry.\n\nDon't stay down here after dark. Keep your light on. They don't like the light.\n\nUntil they do."),
				};
				U->RegisterComponent();
				J->AddInstanceComponent(U);
				// (beside it, a box of safety matches)
				if (UStaticMesh* Mb = LoadObject<UStaticMesh>(nullptr, TEXT("/Game/HollowAcre/Wake/Wake_Matchbox.Wake_Matchbox")))
				{
					const FVector Pm = At(-330.f, 70.f, 0.f);
					AStaticMeshActor* Mx = Piece(GetWorld(), Mb, FTransform(FQuat(FVector::UpVector, FMath::DegreesToRadians(-25.f)) * R, FVector(Pm.X, Pm.Y, Tz + 3.1f)), nullptr);
					if (Mx)
					{
						UStaticMeshComponent* Mc = Mx->GetStaticMeshComponent();
						for (int32 Slot = 0; Slot < Mc->GetNumMaterials() && Part; ++Slot)
						{
							UMaterialInstanceDynamic* D = UMaterialInstanceDynamic::Create(Part, Mc);
							Mc->SetMaterial(Slot, D);
							const FString Sn = Mc->GetMaterialSlotNames().IsValidIndex(Slot) ? Mc->GetMaterialSlotNames()[Slot].ToString() : FString();
							D->SetVectorParameterValue(TEXT("Color"), Sn.StartsWith(TEXT("striker")) ? FLinearColor(0.08f, 0.04f, 0.03f) : FLinearColor(0.42f, 0.09f, 0.05f));
							D->SetScalarParameterValue(TEXT("Metallic"), 0.f);
							D->SetScalarParameterValue(TEXT("Roughness"), 0.85f);
						}
						Mx->SetActorLabel(TEXT("Matches"));
						UP2UseComponent* Um = NewObject<UP2UseComponent>(Mx, TEXT("Use"));
						Um->Id = TEXT("matches");
						Um->Prompt = TEXT("Take the matches");
						Um->bOnce = true;
						Um->RegisterComponent();
						Mx->AddInstanceComponent(Um);
						Mc->SetCollisionEnabled(ECollisionEnabled::QueryOnly);
						Mc->SetCollisionResponseToAllChannels(ECR_Block);
					}
				}
				// (the book takes the beam's use trace: its own collision on)
				M->SetCollisionEnabled(ECollisionEnabled::QueryOnly);
				M->SetCollisionResponseToAllChannels(ECR_Block);
			}
		}
	}
	// the pot-belly stove in the back corner, its door to the room, its pipe up through the roof
	if (UStaticMesh* Sm2 = LoadObject<UStaticMesh>(nullptr, TEXT("/Game/HollowAcre/Wake/Wake_Stove.Wake_Stove")))
	{
		const FVector Ps = At(-290.f, -115.f, 0.f);
		AStaticMeshActor* St = Piece(GetWorld(), Sm2, FTransform(FQuat(FVector::UpVector, FMath::DegreesToRadians(15.f)) * R, FVector(Ps.X, Ps.Y, G + 4.f)), nullptr);
		if (St)
		{
			static UMaterialInterface* Part2 = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Car/Keys/M_KeyPart.M_KeyPart"));
			UMaterialInterface* GlowM = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Materials/Play/M_FireGlow.M_FireGlow"));
			UStaticMeshComponent* Sc = St->GetStaticMeshComponent();
			const TArray<FName> Sn = Sc->GetMaterialSlotNames();
			for (int32 Slot = 0; Slot < Sc->GetNumMaterials(); ++Slot)
			{
				const FString N = Sn.IsValidIndex(Slot) ? Sn[Slot].ToString() : FString();
				if (N.StartsWith(TEXT("glow")) && GlowM)
				{
					FireGlow = UMaterialInstanceDynamic::Create(GlowM, Sc);
					Sc->SetMaterial(Slot, FireGlow);
					continue;
				}
				if (!Part2)
				{
					continue;
				}
				UMaterialInstanceDynamic* D = UMaterialInstanceDynamic::Create(Part2, Sc);
				Sc->SetMaterial(Slot, D);
				const bool bNickel = N.StartsWith(TEXT("nickel")), bPipe = N.StartsWith(TEXT("pipe"));
				D->SetVectorParameterValue(TEXT("Color"), bNickel ? FLinearColor(0.28f, 0.27f, 0.25f) : bPipe ? FLinearColor(0.05f, 0.035f, 0.028f) : FLinearColor(0.018f, 0.017f, 0.017f));
				D->SetScalarParameterValue(TEXT("Metallic"), bNickel ? 0.9f : 0.55f);
				D->SetScalarParameterValue(TEXT("Roughness"), bNickel ? 0.45f : bPipe ? 0.85f : 0.68f);
			}
			Sc->SetCollisionEnabled(ECollisionEnabled::QueryAndPhysics);
			Sc->SetCollisionResponseToAllChannels(ECR_Block);
			St->SetActorLabel(TEXT("Stove"));
			UP2UseComponent* Us = NewObject<UP2UseComponent>(St, TEXT("Use"));
			Us->Id = TEXT("stove");
			Us->Prompt = TEXT("Light the stove");
			Us->RegisterComponent();
			St->AddInstanceComponent(Us);
			FireLight = NewObject<UPointLightComponent>(St, TEXT("Fire"));
			FireLight->SetupAttachment(Sc);
			// (out in the room before its door, low: the fire's light on the floor, the walls, the player; the dark iron
			// itself barely caught by it, its window glowing)
			FireLight->SetRelativeLocation(FVector(85.f, 0.f, 35.f));
			FireLight->SetIntensityUnits(ELightUnits::Candelas);
			FireLight->SetIntensity(0.f);
			FireLight->SetAttenuationRadius(650.f);
			FireLight->SetUseTemperature(true);
			FireLight->SetTemperature(2100.f);
			FireLight->SetSourceRadius(8.f);
			FireLight->SetCastShadows(true);
			FireLight->RegisterComponent();
			Stove = St;
		}
	}
	UE_LOG(LogTemp, Display, TEXT("P2Story: the tool shed furnished (floor, table, her journal, matches, the stove); its ground %.0f cm from its origin"), Lift);
}

void AP2Story::OnUse(UP2UseComponent* Use)
{
	if (!Use)
	{
		return;
	}
	UE_LOG(LogTemp, Display, TEXT("P2Story %.2f used %s"), Clock, *Use->Id.ToString());
	if (Use->Id == TEXT("matches"))
	{
		bHasMatches = true;
		Use->GetOwner()->SetActorHiddenInGame(true);
		Use->GetOwner()->SetActorEnableCollision(false);
		Event(TEXT("matches"));
		Say(TEXT("Matches. Half a box."), 0.3f, 2.4f);
		return;
	}
	if (Use->Id == TEXT("stove"))
	{
		if (!bHasMatches)
		{
			Use->bUsed = false;
			Say(TEXT("Nothing to light it with."), 0.2f, 2.4f);
			return;
		}
		if (!bStoveLit)
		{
			// the stove lit: the match, the kindling catching, the fire's light through its door's mica and the gaps
			bStoveLit = true;
			StoveLitAt = Clock;
			Use->bEnabled = false;
			Event(TEXT("fire_lit"));
			Say(TEXT("Come on. Come on..."), 0.2f, 2.0f);
			SetObjective(TEXT("Stay by the fire. Wait for morning"));
			if (Player.IsValid())
			{
				Player->Checkpoint = Player->GetActorTransform();
				Player->CheckpointLook = Player->GetControlRotation();
			}
		}
		return;
	}
	if (Use->Id == TEXT("journal") && Once(TEXT("journal_read")))
	{
		// after the last page: the hit on the wall, the light stutters, the shriek outside; the night's hunt begins
		Lines.Reset();
		Say(TEXT("..."), 1.4f, 1.6f);
		Done.Add(TEXT("bang_due"));
		BangAt = Clock + 1.8f;
	}
}

void AP2Story::TickCrosser(float Dt)
{
	const float CrossSpeed = 175.f;           // (a quick stalk across, out of reach: seen, then gone)
	if (!Crosser || CrossT < 0.f)
	{
		return;
	}
	// it walks across the far end of the street; halfway, it stops, and its head turns to the player; then it goes on
	CrossT += Dt;
	const float Len = FVector::Dist2D(CrossFrom, CrossTo);
	const float Stop0 = 0.42f * Len / CrossSpeed, Stop1 = Stop0 + 1.6f;
	float S = CrossT < Stop0 ? CrossT * CrossSpeed : CrossT < Stop1 ? Stop0 * CrossSpeed : (Stop0 + (CrossT - Stop1)) * CrossSpeed;
	const bool bStopped = CrossT >= Stop0 && CrossT < Stop1;
	FVector P = CrossFrom + (CrossTo - CrossFrom).GetSafeNormal2D() * S;
	P.Z = GroundAt(P);
	const FVector D = (CrossTo - CrossFrom).GetSafeNormal2D();
	const float Yaw = FMath::RadiansToDegrees(FMath::Atan2(D.Y, D.X));
	Crosser->SetActorLocationAndRotation(P, FRotator(0.f, Yaw, 0.f).Quaternion() * FRotator(0.f, -Crosser->MeshForwardYaw(), 0.f).Quaternion());
	if (Crosser->GetBody())
	{
		Crosser->GetBody()->SetPlayRate(bStopped ? 0.05f : CrossSpeed / (67.f * HuskScale));
	}
	if (Player.IsValid())
	{
		Crosser->GlareAt = Player->EyesAt();
		Crosser->GlareW = FMath::FInterpTo(Crosser->GlareW, bStopped ? 1.f : 0.f, Dt, bStopped ? 9.f : 3.f);
	}
	if (bStopped && CrossT - Dt < Stop0)
	{
		Event(TEXT("sighting_look"));
	}
	// (in the headlight: as it stands there looking, the light dies; the dark takes it)
	if (bCrossInHeadlight && Director && CrossT >= Stop1 - 0.3f && Director->HeadlightDieAt < 0.f)
	{
		Director->HeadlightDieAt = Director->GetRealTime() - 6.f;      // (its last stutter now, out in 3 s)
		Done.Add(TEXT("dark_due"));
		DarkAt = Clock + 3.f;
	}
	P2EyeShine(Crosser, bStopped);
	if (Player.IsValid() && FMath::FloorToInt(CrossT * 2.f) != FMath::FloorToInt((CrossT - Dt) * 2.f))
	{
		FHitResult Hb;
		FCollisionQueryParams Qb(TEXT("CrossSee"), true, Crosser);
		Qb.AddIgnoredActor(Player.Get());
		const FVector Head = P + FVector(0.f, 0.f, 140.f * HuskScale);
		const bool bBlocked = GetWorld()->LineTraceSingleByChannel(Hb, Player->EyesAt(), Head, ECC_Visibility, Qb);
		UE_LOG(LogTemp, Display, TEXT("P2Cross %.1f at %s, %.0f m off, %s, %.0f deg off the gaze%s"), CrossT, *P.ToCompactString(), FVector::Dist(P, Player->GetActorLocation()) / 100.f,
			bBlocked ? *FString::Printf(TEXT("hidden by %s"), Hb.GetActor() ? *Hb.GetActor()->GetActorLabel() : TEXT("?")) : TEXT("in sight"),
			FMath::RadiansToDegrees(FMath::Acos(FMath::Clamp(FVector::DotProduct((Head - Player->EyesAt()).GetSafeNormal(), Player->LookDir()), -1.f, 1.f))), bStopped ? TEXT(", stopped, looking") : TEXT(""));
	}
	if (S >= Len || (bCrossInHeadlight && DarkAt > 0.f && Clock > DarkAt + 0.4f))
	{
		Crosser->Destroy();
		Crosser = nullptr;
		CrossT = -1.f;
		Say(TEXT("What was that?"), bCrossInHeadlight ? 3.4f : 0.6f, 2.8f);
	}
}

void AP2Story::Beats(float Dt)
{
	if (!Player.IsValid())
	{
		Player = Cast<APart2Character>(UGameplayStatics::GetPlayerPawn(this, 0));
		if (!Player.IsValid())
		{
			return;
		}
	}
	// the first moments: the cold, a call into the dark
	if (Clock > 1.5f && Once(TEXT("obj_cold")))
	{
		SetObjective(TEXT("Get out of the cold"));
	}
	if (Clock > 3.f && Once(TEXT("say_hello")))
	{
		Say(TEXT("Hello?"), 0.f, 2.4f);
		Say(TEXT("Is anyone out here?"), 3.0f, 2.8f);
	}
	// the first sighting, in the car's last light: the player looks along the headlight's beam, and something crosses it,
	// stops in it, and turns its head to them; and then the light dies
	if (Clock > 3.5f && !Done.Contains(TEXT("sighting")) && Director && !Done.Contains(TEXT("dark")))
	{
		FVector HFrom, HDir;
		if (Director->GetHeadlightRay(HFrom, HDir) && FVector::DotProduct(Player->LookDir().GetSafeNormal2D(), HDir.GetSafeNormal2D()) > 0.8f && Once(TEXT("sighting")))
		{
			const FVector D = HDir.GetSafeNormal2D();
			const FVector V = FVector::CrossProduct(FVector::UpVector, D);
			FVector Mid = Player->GetActorLocation() + D * 1400.f;
			{
				// (where the beam's pool lies on the snow: its axis traced to the ground; crossed through its middle, if
				// it lies 9-25 m off)
				FHitResult Hp;
				FCollisionQueryParams Qp(TEXT("Pool"), true, Player.Get());
				TArray<AActor*> On;
				if (Director->Car)
				{
					Qp.AddIgnoredActor(Director->Car);
					Director->Car->GetAttachedActors(On, true, true);
					Qp.AddIgnoredActors(On);
				}
				if (GetWorld()->LineTraceSingleByChannel(Hp, HFrom, HFrom + HDir * 4000.f, ECC_Visibility, Qp))
				{
					// (in the pool, but near enough to read: no further than 11 m along the way to it)
					const FVector Pp = Player->GetActorLocation();
					const float Dp = FVector::Dist2D(Hp.ImpactPoint, Pp);
					if (Dp > 600.f && Dp < 2500.f)
					{
						Mid = Pp + (Hp.ImpactPoint - Pp).GetSafeNormal2D() * FMath::Min(Dp, 1100.f);
						Mid.Z = GroundAt(Mid);
					}
				}
			}
			const FVector Across = FVector::CrossProduct(FVector::UpVector, (Mid - Player->GetActorLocation()).GetSafeNormal2D());
			CrossFrom = Mid + Across * 520.f;
			CrossTo = Mid - Across * 520.f;
			(void)V;
			bCrossInHeadlight = true;
			SpawnCrosser();
		}
	}
	// the car's last light dies (the director kills it 9 s into play, unless something is standing in it)
	if (Director && Director->HeadlightDieAt < 0.f && Clock > 9.6f && Once(TEXT("dark")))
	{
		Say(TEXT("No. No, no, no..."), 0.2f, 2.6f);
		SetObjective(TEXT("Find shelter in the camp"));
	}
	// the first sighting: the first time, after the light dies, the player looks down the street into the camp
	if (Clock > 12.f && !Done.Contains(TEXT("sighting")))
	{
		const FVector Look = Player->LookDir().GetSafeNormal2D();
		if (FVector::DotProduct(Look, StreetU) > 0.8f && Once(TEXT("sighting")))
		{
			const FVector V = FVector::CrossProduct(FVector::UpVector, StreetU);
			const FVector Mid = Player->GetActorLocation() + StreetU * 1800.f;
			CrossFrom = Mid + V * 750.f;
			CrossTo = Mid - V * 750.f;
			SpawnCrosser();
		}
	}
	if (false)
	{
		{
			FActorSpawnParameters P;
			P.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
			Crosser = GetWorld()->SpawnActor<AHusk>(AHusk::StaticClass(), FTransform(CrossFrom), P);
			if (Crosser && Crosser->Setup())
			{
				Crosser->SetActorScale3D(FVector(HuskScale));
				Crosser->Play(TEXT("Stalk"), true);
				Crosser->JawOpen = 5.f;
				TArray<UPrimitiveComponent*> Ps;
				Crosser->GetComponents<UPrimitiveComponent>(Ps);
				for (UPrimitiveComponent* Pc : Ps)
				{
					Pc->SetLightingChannels(true, true, false);
					Pc->SetCollisionEnabled(ECollisionEnabled::NoCollision);
				}
				CrossT = 0.f;
			}
		}
	}
	if (DarkAt > 0.f && Clock >= DarkAt && Once(TEXT("dark")))
	{
		Say(TEXT("No. No, no, no..."), 0.4f, 2.6f);
		SetObjective(TEXT("Find shelter in the camp"));
	}
	// after it has gone from the doorway: the cold (the stove, if they haven't lit it)
	if (Hunter && Done.Contains(TEXT("husk_shriek")) && (Hunter->State == AHuskHunter::EState::Away || Hunter->State == AHuskHunter::EState::Retreat) && !bStoveLit && Once(TEXT("cold")))
	{
		Say(TEXT("It's so cold..."), 1.5f, 2.6f);
		SetObjective(TEXT("Light the stove"));
	}
	// the bang after the journal: something hits the shed hard; the light stutters; the shriek; the hunt
	if (BangAt > 0.f && Clock >= BangAt && Once(TEXT("bang")))
	{
		Player->Stutter(1.1f);
		Player->Jolt(1.8f);
		SiftSnow(Player->EyesAt() + FVector(0.f, 0.f, 90.f), 150.f, 70);
		Say(TEXT("Oh God."), 1.6f, 2.2f);
		SetObjective(TEXT("Survive the night"));
		ShriekAt = Clock + 1.3f;
	}
	if (ShriekAt > 0.f && Clock >= ShriekAt && Once(TEXT("husk_shriek")))
	{
		FActorSpawnParameters P;
		P.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
		Hunter = GetWorld()->SpawnActor<AHuskHunter>(AHuskHunter::StaticClass(), FTransform::Identity, P);
		if (Hunter)
		{
			Hunter->Begin(Director, HuskScale, 1600.f);
			Hunter->Menace = 0.45f;
			// (it heard the bang: it comes round to the shed's doorway and bends to look in)
			for (TActorIterator<AStaticMeshActor> It(GetWorld()); It; ++It)
			{
				if (It->GetActorLabel() == TEXT("Town Shed"))
				{
					const FTransform T = It->GetActorTransform();
					Hunter->PeerInto(T.TransformPosition(FVector(95.f, 0.f, 0.f)), -T.GetRotation().GetAxisX());
				}
			}
			Say(TEXT("(The light. It doesn't like the light...)"), 6.f, 3.f);
		}
	}
}

void AP2Story::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	const float Dt = FMath::Min(DeltaSeconds, 0.1f);
	Clock += Dt;
	Beats(Dt);
	TickFire(Dt);
	TickCrosser(Dt);
	TickSift(Dt);
}

void AP2Story::SpawnCrosser()
{
	FActorSpawnParameters P;
	P.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
	Crosser = GetWorld()->SpawnActor<AHusk>(AHusk::StaticClass(), FTransform(CrossFrom), P);
	if (Crosser && Crosser->Setup())
	{
		Crosser->SetActorScale3D(FVector(HuskScale));
		Crosser->Play(TEXT("Stalk"), true);
		Crosser->JawOpen = 5.f;
		TArray<UPrimitiveComponent*> Ps;
		Crosser->GetComponents<UPrimitiveComponent>(Ps);
		for (UPrimitiveComponent* Pc : Ps)
		{
			Pc->SetLightingChannels(true, true, false);
			Pc->SetCollisionEnabled(ECollisionEnabled::NoCollision);
		}
		CrossT = 0.f;
	}
}

void AP2Story::SiftSnow(const FVector& Above, float Radius, int32 Count)
{
	static UStaticMesh* Ball = nullptr;
	static UMaterialInterface* Flake = nullptr;
	if (!Ball)
	{
		Ball = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Sphere.Sphere"));
		Flake = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Materials/Blockout/M_Snowflake.M_Snowflake"));
		if (Ball)
		{
			Ball->AddToRoot();
		}
		if (Flake)
		{
			Flake->AddToRoot();
		}
	}
	FRandomStream R(77 + Count);
	for (int32 i = 0; i < Count && Ball; ++i)
	{
		UStaticMeshComponent* C = NewObject<UStaticMeshComponent>(this);
		C->SetStaticMesh(Ball);
		if (Flake)
		{
			C->SetMaterial(0, Flake);
		}
		C->SetCollisionEnabled(ECollisionEnabled::NoCollision);
		C->SetCastShadow(false);
		C->SetMobility(EComponentMobility::Movable);
		const float A = R.FRandRange(0.f, 2.f * PI), Rr = Radius * FMath::Sqrt(R.FRand());
		C->SetWorldLocation(Above + FVector(FMath::Cos(A) * Rr, FMath::Sin(A) * Rr, R.FRandRange(-10.f, 10.f)));
		C->SetWorldScale3D(FVector(R.FRandRange(0.002f, 0.006f)));
		C->RegisterComponent();
		Sift.Add({C, FVector(R.FRandRange(-12.f, 12.f), R.FRandRange(-12.f, 12.f), -R.FRandRange(40.f, 110.f)), (float)R.FRandRange(0.f, 0.5f), Clock});
	}
}

void AP2Story::TickSift(float Dt)
{
	for (int32 i = Sift.Num() - 1; i >= 0; --i)
	{
		FSift& F = Sift[i];
		if (!F.C)
		{
			Sift.RemoveAt(i);
			continue;
		}
		const float Age = Clock - F.Born;
		if (Age < F.Delay)
		{
			continue;
		}
		F.C->AddWorldOffset(F.V * Dt + FVector(FMath::Sin(Age * 3.f + i) * 6.f * Dt, 0.f, 0.f));
		if (Age > F.Delay + 3.5f)
		{
			F.C->DestroyComponent();
			Sift.RemoveAt(i);
		}
	}
}

bool AP2Story::IsNearFire(const FVector& P) const
{
	return bStoveLit && Stove && FVector::Dist2D(P, Stove->GetActorLocation()) < 280.f && FMath::Abs(P.Z - Stove->GetActorLocation().Z) < 300.f;
}

void AP2Story::TickFire(float Dt)
{
	if (!bStoveLit || !FireLight)
	{
		return;
	}
	// (catching over a few seconds, then burning: a fire's flicker, slow swells and quick licks)
	const float s = Clock - StoveLitAt;
	const float Catch = FMath::Clamp(s / 4.f, 0.f, 1.f);
	const float Fl = 0.78f + 0.12f * FMath::Sin(Clock * 2.3f) + 0.07f * FMath::Sin(Clock * 7.9f + 1.f) + 0.05f * FMath::Sin(Clock * 17.3f + 2.f);
	FireLight->SetIntensity(14.f * Catch * Catch * Fl);
	if (FireGlow)
	{
		FireGlow->SetVectorParameterValue(TEXT("Glow"), FLinearColor(1.f, 0.38f, 0.08f) * (6.f * Catch * Fl));
	}
}
