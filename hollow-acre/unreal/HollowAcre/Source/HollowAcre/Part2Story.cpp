#include "Part2Story.h"

#include "Components/SkeletalMeshComponent.h"
#include "Components/StaticMeshComponent.h"
#include "EndingDirector.h"
#include "Engine/StaticMeshActor.h"
#include "EngineUtils.h"
#include "Husk.h"
#include "Kessler.h"
#include "Misc/CommandLine.h"
#include "HuskHunter.h"
#include "Kismet/GameplayStatics.h"
#include "Part2Character.h"
#include "Snowfall.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Components/DecalComponent.h"
#include "Components/PointLightComponent.h"
#include "Components/SpotLightComponent.h"
#include "Components/LightComponent.h"
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
	Alpha = s < 0.6f ? s / 0.6f : s < 6.f ? 1.f : FMath::Max(0.85f, 1.f - (s - 6.f) / 1.5f);
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
			A->Tags.Add(TEXT("ShedPiece"));
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
	// (indoors: the same weathered boards with no snow settled on them)
	UMaterialInterface* Wood = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Town/Materials/M_Town_Drywood.M_Town_Drywood"));
	if (!Wood)
	{
		Wood = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Town/Materials/M_Town_Barewood.M_Town_Barewood"));
	}
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
	// (no snow falling inside it)
	{
		FBox Inside(ForceInit);
		for (float X : {-372.f, 2.f})
		{
			for (float Y : {-187.f, 187.f})
			{
				for (float Z : {-20.f, 300.f})
				{
					Inside += At(X, Y, Z);
				}
			}
		}
		for (TActorIterator<ASnowfall> It(GetWorld()); It; ++It)
		{
			It->NoSnow.Add(Inside);
		}
	}
	const FQuat R = T.GetRotation();
	const float G = GroundAt(At(-185.f, 0.f, 50.f));
	const float Lift = G - T.GetLocation().Z;
	if (Cube)
	{
		// (its plank floor is the shed's own now: make_town.py lays it board by board)
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
					// (a big box of kitchen matches: 11.5 x 6 x 2.4 cm, scaled from the safety-match box)
					AStaticMeshActor* Mx = Piece(GetWorld(), Mb, FTransform(FQuat(FVector::UpVector, FMath::DegreesToRadians(-25.f)) * R, FVector(Pm.X, Pm.Y, Tz + 3.9f), FVector(2.17f, 1.67f, 1.5f)), nullptr);
					if (Mx)
					{
						UStaticMeshComponent* Mc = Mx->GetStaticMeshComponent();
						for (int32 Slot = 0; Slot < Mc->GetNumMaterials() && Part; ++Slot)
						{
							UMaterialInstanceDynamic* D = UMaterialInstanceDynamic::Create(Part, Mc);
							Mc->SetMaterial(Slot, D);
							const FString Sn = Mc->GetMaterialSlotNames().IsValidIndex(Slot) ? Mc->GetMaterialSlotNames()[Slot].ToString() : FString();
							D->SetVectorParameterValue(TEXT("Color"), Sn.StartsWith(TEXT("striker")) ? FLinearColor(0.08f, 0.04f, 0.03f) : FLinearColor(0.62f, 0.14f, 0.05f));
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
	TArray<AStaticMeshActor*> Pieces;
	for (TActorIterator<AStaticMeshActor> It(GetWorld()); It; ++It)
	{
		if (It->ActorHasTag(TEXT("ShedPiece")))
		{
			Pieces.Add(*It);
		}
	}
	// the pot-belly stove in the back corner, its door open toward the bench (where one comes to it from), its pipe up
	// through the roof
	if (UStaticMesh* Sm2 = LoadObject<UStaticMesh>(nullptr, TEXT("/Game/HollowAcre/Wake/Wake_Stove.Wake_Stove")))
	{
		const FVector Ps = At(-290.f, -115.f, 0.f);
		AStaticMeshActor* St = Piece(GetWorld(), Sm2, FTransform(FQuat(FVector::UpVector, FMath::DegreesToRadians(90.f)) * R, FVector(Ps.X, Ps.Y, G + 4.f)), nullptr);
		if (St)
		{
			static UMaterialInterface* Part2 = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Car/Keys/M_KeyPart.M_KeyPart"));
			UMaterialInterface* GlowM = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Materials/Play/M_FireGlow.M_FireGlow"));
			UStaticMeshComponent* Sc = St->GetStaticMeshComponent();
			const TArray<FName> Sn = Sc->GetMaterialSlotNames();
			for (int32 Slot = 0; Slot < Sc->GetNumMaterials(); ++Slot)
			{
				const FString N = Sn.IsValidIndex(Slot) ? Sn[Slot].ToString() : FString();
				// (its firebox's sooted inside, the coals on its grate, its mica window: each glowing with the fire, dark cold)
				if (N.StartsWith(TEXT("glow")) && GlowM)
				{
					UMaterialInstanceDynamic* Gl = UMaterialInstanceDynamic::Create(GlowM, Sc);
					Gl->SetVectorParameterValue(TEXT("Glow"), FLinearColor::Black);
					Sc->SetMaterial(Slot, Gl);
					(N.StartsWith(TEXT("glow_box")) ? FireBox : N.StartsWith(TEXT("glow_coal")) ? FireCoal : FireGlow) = Gl;
					continue;
				}
				// (its belly's iron, heating to a dull red as the fire burns high)
				if (N.StartsWith(TEXT("heat")) || N.StartsWith(TEXT("castiron")))
				{
					if (UMaterialInterface* Hm = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Materials/Play/M_HotIron.M_HotIron")))
					{
						// (the belly and its door, lip and legs: one dull iron, the belly's slot heating)
						UMaterialInstanceDynamic* Iron = UMaterialInstanceDynamic::Create(Hm, Sc);
						Sc->SetMaterial(Slot, Iron);
						if (N.StartsWith(TEXT("heat")))
						{
							StoveHeat = Iron;
						}
						continue;
					}
				}
				if (!Part2)
				{
					continue;
				}
				UMaterialInstanceDynamic* D = UMaterialInstanceDynamic::Create(Part2, Sc);
				Sc->SetMaterial(Slot, D);
				const bool bNickel = N.StartsWith(TEXT("nickel")), bPipe = N.StartsWith(TEXT("pipe"));
				const bool bChar = N.StartsWith(TEXT("char"));
				D->SetVectorParameterValue(TEXT("Color"), bNickel ? FLinearColor(0.075f, 0.07f, 0.065f) : bPipe ? FLinearColor(0.05f, 0.035f, 0.028f) :
					bChar ? FLinearColor(0.012f, 0.01f, 0.009f) : FLinearColor(0.018f, 0.017f, 0.017f));
				D->SetScalarParameterValue(TEXT("Metallic"), bNickel ? 0.6f : bChar ? 0.f : 0.22f);
				D->SetScalarParameterValue(TEXT("Roughness"), bNickel ? 0.6f : bPipe ? 0.88f : bChar ? 0.95f : 0.84f);
			}
			Sc->SetCollisionEnabled(ECollisionEnabled::QueryAndPhysics);
			Sc->SetCollisionResponseToAllChannels(ECR_Block);
			// (measured: each slot's material and its colour, as the game has them)
			for (int32 Slot = 0; Slot < Sc->GetNumMaterials(); ++Slot)
			{
				UMaterialInterface* Mi = Sc->GetMaterial(Slot);
				FLinearColor C(-1.f, -1.f, -1.f);
				if (Mi)
				{
					Mi->GetVectorParameterValue(FHashedMaterialParameterInfo(TEXT("Color")), C);
				}
				UE_LOG(LogTemp, Display, TEXT("P2Stove slot %d %s: %s (parent %s), Color %s"), Slot, Sn.IsValidIndex(Slot) ? *Sn[Slot].ToString() : TEXT("?"),
					Mi ? *Mi->GetName() : TEXT("none"), Mi && Mi->GetMaterial() ? *Mi->GetMaterial()->GetName() : TEXT("?"), *C.ToString());
			}
			// its flames: crossed cards over the logs, drawn by M_Flame; nothing until it is lit
			if (UStaticMesh* Fm = LoadObject<UStaticMesh>(nullptr, TEXT("/Game/HollowAcre/Wake/Wake_StoveFlames.Wake_StoveFlames")))
			{
				Flames = NewObject<UStaticMeshComponent>(St, TEXT("Flames"));
				Flames->SetStaticMesh(Fm);
				Flames->SetupAttachment(Sc);
				Flames->SetCollisionEnabled(ECollisionEnabled::NoCollision);
				Flames->SetCastShadow(false);
				if (UMaterialInterface* Fl = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Materials/Play/M_Flame.M_Flame")))
				{
					FlameMID = UMaterialInstanceDynamic::Create(Fl, Flames);
					FlameMID->SetScalarParameterValue(TEXT("Intensity"), 0.f);
					Flames->SetMaterial(0, FlameMID);
				}
				Flames->SetVisibility(false);
				Flames->RegisterComponent();
			}
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
			FireLight->SetRelativeLocation(FVector(48.f, 0.f, 40.f));
			FireLight->SetIntensityUnits(ELightUnits::Candelas);
			FireLight->SetIntensity(0.f);
			FireLight->SetAttenuationRadius(330.f);         // (near the stove, the corners dark; not out through the door)
			FireLight->SetUseTemperature(true);
			FireLight->SetTemperature(2100.f);
			FireLight->SetSourceRadius(8.f);
			FireLight->SetCastShadows(true);
			// (no ball of glowing fog round it: a point light in the volumetric fog lit a bright blurred disc over the view
			// whenever it sat just below the eyes; a stove's light barely shows in a room's air)
			FireLight->SetVolumetricScatteringIntensity(0.f);
			// (the fire's light on its own channel: the room, the floor, the walls, its table take it; the stove's iron doesn't,
			// so it stays dark with its window glowing)
			FireLight->SetLightingChannels(false, false, true);
			FireLight->RegisterComponent();
			Sc->SetLightingChannels(true, true, false);
			if (UStaticMeshComponent* Shc = Shed->GetStaticMeshComponent())
			{
				Shc->SetLightingChannels(true, true, true);
			}
			for (AStaticMeshActor* Pc : Pieces)
			{
				if (Pc && Pc != St)
				{
					Pc->GetStaticMeshComponent()->SetLightingChannels(true, true, true);
				}
			}
			for (TActorIterator<AStaticMeshActor> It(GetWorld()); It; ++It)
			{
				if (It->GetActorLabel() == TEXT("Town Ground"))
				{
					It->GetStaticMeshComponent()->SetLightingChannels(true, true, true);
				}
			}
			Stove = St;
			// (the fire's light spilling out of the doorway: what of it reaches the snow out front, the door's shape lit
			// on it and anything standing there lit warm from the front and throwing its shadow across it. A stove's
			// light carries a few metres out a door: drawn as a spot from the back of the room through the doorway,
			// flickering with the fire)
			DoorSpill = NewObject<USpotLightComponent>(this, TEXT("DoorSpill"));
			DoorSpill->SetIntensityUnits(ELightUnits::Candelas);
			DoorSpill->SetIntensity(0.f);
			DoorSpill->SetAttenuationRadius(1100.f);
			DoorSpill->SetUseTemperature(true);
			DoorSpill->SetTemperature(2100.f);
			DoorSpill->SetSourceRadius(20.f);
			DoorSpill->SetInnerConeAngle(18.f);
			DoorSpill->SetOuterConeAngle(42.f);
			DoorSpill->SetCastShadows(true);
			DoorSpill->SetVolumetricScatteringIntensity(0.f);       // (its own glow in the fog, by the player's head, was the disc)
			DoorSpill->SetLightingChannels(false, false, true);
			DoorSpill->RegisterComponent();
			// (from just inside the doorway, high, down and out through it: the doorway's shape on the snow; not from the
			// back of the room, where its source sat by the player's head)
			const FVector From = At(-70.f, 0.f, 0.f) + FVector(0.f, 0.f, G - T.GetLocation().Z + 190.f);
			const FVector To = At(260.f, 0.f, 0.f) + FVector(0.f, 0.f, G - T.GetLocation().Z + 60.f);
			DoorSpill->SetWorldLocationAndRotation(From, (To - From).Rotation());
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
	if (Use->Id == TEXT("wood") && Player.IsValid() && !Player->bCarryingWood)
	{
		Player->bCarryingWood = true;
		WoodTakenAt = Clock;
		Event(TEXT("wood_take"));
		Say(TEXT("Enough for the night. Go."), 0.4f, 2.6f);
		SetObjective(TEXT("Bring the wood back to the stove"));
		if (Stove)
		{
			if (UP2UseComponent* Su = Stove->FindComponentByClass<UP2UseComponent>())
			{
				Su->bEnabled = true;
				Su->Prompt = TEXT("Feed the stove");
			}
		}
		UE_LOG(LogTemp, Display, TEXT("P2Story %.2f used wood (an armful)"), Clock);
		return;
	}
	if (Use->Id == TEXT("stove") && bStoveLit)
	{
		// (fed: the wood on the coals, the fire back up)
		if (Player.IsValid() && Player->bCarryingWood)
		{
			Player->bCarryingWood = false;
			FedAt = Clock;
			Use->bEnabled = false;
			Event(TEXT("fire_fed"));
			Say(TEXT("Good. That'll hold."), 1.2f, 2.6f);
			SetObjective(TEXT("Wait for morning"));
			UE_LOG(LogTemp, Display, TEXT("P2Story %.2f used stove (fed)"), Clock);
		}
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
			// the stove lit: the match struck (its little flame on the hand), the kindling catching, the fire's light
			// through its door's mica and the gaps
			if (Player.IsValid())
			{
				MatchLight = NewObject<UPointLightComponent>(this, TEXT("Match"));
				MatchLight->SetIntensityUnits(ELightUnits::Candelas);
				MatchLight->SetIntensity(0.f);
				MatchLight->SetAttenuationRadius(260.f);
				MatchLight->SetUseTemperature(true);
				MatchLight->SetTemperature(1900.f);
				MatchLight->SetSourceRadius(1.f);
				MatchLight->SetVolumetricScatteringIntensity(0.05f);
				// (the match lights the room and the stove; the hand that holds it, inches from the flame, gets its own
				// gentler light: at full strength the sleeve burned out to a yellow blob against the dark room)
				MatchLight->SetLightingChannels(false, true, true);
				MatchLight->RegisterComponent();
				// (held up before the eyes, a little low and to the left of the middle of the view)
				const FVector Lk = Player->LookDir();
				const FVector Rt = FVector::CrossProduct(FVector::UpVector, Lk).GetSafeNormal();
				MatchLight->SetWorldLocation(Player->EyesAt() + Lk * 34.f - FVector(0.f, 0.f, 11.f) - Rt * 6.f);
				MatchHand = NewObject<UPointLightComponent>(this, TEXT("MatchHand"));
				MatchHand->SetIntensityUnits(ELightUnits::Candelas);
				MatchHand->SetIntensity(0.f);
				MatchHand->SetAttenuationRadius(90.f);
				MatchHand->SetUseTemperature(true);
				MatchHand->SetTemperature(1900.f);
				MatchHand->SetSourceRadius(1.f);
				MatchHand->SetCastShadows(false);
				MatchHand->SetLightingChannels(true, false, false);
				MatchHand->RegisterComponent();
				MatchHand->SetWorldLocation(MatchLight->GetComponentLocation());
				MatchAt = Clock;
				// (its flame: a small bright teardrop on the match's head)
				// (the stove's flame cards at a match's size: 2 cm wide, 3 tall, licking)
				MatchFlame = NewObject<UStaticMeshComponent>(this, TEXT("MatchFlame"));
				MatchFlame->SetStaticMesh(LoadObject<UStaticMesh>(nullptr, TEXT("/Game/HollowAcre/Wake/Wake_StoveFlames.Wake_StoveFlames")));
				if (UMaterialInterface* Gm = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HollowAcre/Materials/Play/M_Flame.M_Flame")))
				{
					MatchFlameMID = UMaterialInstanceDynamic::Create(Gm, MatchFlame);
					MatchFlameMID->SetScalarParameterValue(TEXT("Intensity"), 0.f);
					MatchFlameMID->SetScalarParameterValue(TEXT("Seed"), 3.7f);
					MatchFlame->SetMaterial(0, MatchFlameMID);
				}
				MatchFlame->SetCollisionEnabled(ECollisionEnabled::NoCollision);
				MatchFlame->SetCastShadow(false);
				MatchFlame->SetWorldScale3D(FVector(0.13f));
				MatchFlame->RegisterComponent();
				MatchFlame->SetWorldLocation(MatchLight->GetComponentLocation() - FVector(0.26f, 0.f, 41.f * 0.13f));
			}
			bStoveLit = true;
			StoveLitAt = Clock;
			Use->bEnabled = false;
			Event(TEXT("fire_lit"));
			Say(TEXT("Come on. Come on..."), 0.2f, 2.0f);
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
	// (in the street: a quick stalk across, out of reach, seen then gone; past the doorway: slow, and it stops)
	const float CrossSpeed = bCrossDash ? 340.f : bCrossInHeadlight ? 175.f : 105.f;
	if (!Crosser || CrossT < 0.f)
	{
		return;
	}
	// it walks across the far end of the street; halfway, it stops, and its head turns to the player; then it goes on
	CrossT += Dt;
	const float Len = FVector::Dist2D(CrossFrom, CrossTo);
	const float Stop0 = bCrossDash ? 1e6f : (bCrossInHeadlight ? 0.42f : 0.47f) * Len / CrossSpeed, Stop1 = Stop0 + (bCrossInHeadlight ? 2.2f : 3.4f);
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
		if (bCrossInHeadlight && Director)
		{
			Director->HeadlightSurgeUntil = Director->GetRealTime() + (Stop1 - Stop0);
		}
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
		if (PassAt < 0.f)
		{
			Say(TEXT("What was that?"), bCrossInHeadlight ? 3.4f : 0.6f, 2.8f);
		}
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
	// (-p2lantern, for checking the lantern scene without the whole night: the player by the lit stove, the fire fed,
	// the moon behind cloud; on to the lantern)
	static const bool bLanternTest = FParse::Param(FCommandLine::Get(), TEXT("p2lantern"));
	if (bLanternTest)
	{
		if (Once(TEXT("lantern_test")))
		{
			for (TActorIterator<AStaticMeshActor> It(GetWorld()); It; ++It)
			{
				if (It->GetActorLabel() == TEXT("Town Shed"))
				{
					const FTransform T = It->GetActorTransform();
					Player->SetActorLocation(T.TransformPosition(FVector(-200.f, -40.f, 100.f)), false, nullptr, ETeleportType::TeleportPhysics);
				}
			}
			bHasMatches = bStoveLit = true;
			StoveLitAt = Clock - 60.f;
			FedAt = Clock - 9.f;
			MoonDimFrom = Clock;
			UE_LOG(LogTemp, Display, TEXT("P2Story %.2f lantern test: the player in the shed by the lit stove"), Clock);
		}
		if (Clock - FedAt > 11.f && Once(TEXT("lantern")))
		{
			BeginLantern();
		}
		return;
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
						Mid = Pp + (Hp.ImpactPoint - Pp).GetSafeNormal2D() * FMath::Min(Dp, 650.f);
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
		MoonDimFrom = Clock;
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
		MoonDimFrom = Clock;
		if (Player.IsValid())
		{
			Player->Stutter(1.8f);
		}
		Say(TEXT("No. No, no, no..."), 0.4f, 2.6f);
		SetObjective(TEXT("Find shelter in the camp"));
	}
	if (bStoveLit && Clock - StoveLitAt > 3.5f && Once(TEXT("caught")))
	{
		SetObjective(TEXT("Stay by the fire. Wait for morning"));
	}
	if (bStoveLit && Clock - StoveLitAt > 9.f && Once(TEXT("pass")))
	{
		for (TActorIterator<AStaticMeshActor> It(GetWorld()); It; ++It)
		{
			if (It->GetActorLabel() == TEXT("Town Shed"))
			{
				const FTransform Ts = It->GetActorTransform();
				CrossFrom = Ts.TransformPosition(FVector(190.f, -600.f, 0.f));
				CrossTo = Ts.TransformPosition(FVector(190.f, 600.f, 0.f));
				CrossFrom.Z = GroundAt(CrossFrom);
				CrossTo.Z = GroundAt(CrossTo);
				bCrossInHeadlight = false;
				SpawnCrosser();
				PassAt = Clock;
				if (Crosser)
				{
					TArray<UPrimitiveComponent*> Pp;
					Crosser->GetComponents<UPrimitiveComponent>(Pp);
					for (UPrimitiveComponent* Pc : Pp)
					{
						Pc->SetLightingChannels(true, true, false);    // (pale under the moon, as at the doorway)
					}
				}
			}
		}
	}
	if (PassAt > 0.f && Clock - PassAt > 12.f && Once(TEXT("still_out_there")))
	{
		Say(TEXT("It's still out there."), 0.f, 3.f);
		SetObjective(TEXT("Wait for morning"));
	}
	if (PassAt > 0.f && Clock - PassAt > 21.f && Once(TEXT("window")))
	{
		BeginWindow();
	}
	if (WindowGoneAt > 0.f && Clock - WindowGoneAt > 9.f && Once(TEXT("fire_dying")))
	{
		BeginWood();
	}
	// (the armful taken, turning to go: something tall goes fast between the cabins at the edge of the light, gone)
	if (WoodTakenAt > 0.f && Clock - WoodTakenAt > 3.2f && Player.IsValid() && Once(TEXT("between_cabins")))
	{
		// (ahead, on the way back toward the shed, across the gap between the cabins, 17 m off)
		const FVector Lk = Player->LookDir().GetSafeNormal2D();
		const FVector Ac = FVector::CrossProduct(FVector::UpVector, Lk);
		const FVector Mid = Player->GetActorLocation() + Lk * 1300.f;
		CrossFrom = Mid - Ac * 650.f;
		CrossTo = Mid + Ac * 650.f;
		CrossFrom.Z = GroundAt(CrossFrom);
		CrossTo.Z = GroundAt(CrossTo);
		bCrossInHeadlight = false;
		bCrossDash = true;
		SpawnCrosser();
		Event(TEXT("husk_gallop"));
		Say(TEXT("...!"), 0.9f, 1.4f);
		Say(TEXT("Keep moving. Don't run with it. Keep moving."), 2.8f, 3.f);
		UE_LOG(LogTemp, Display, TEXT("P2Story %.2f beat: between the cabins (it crosses ahead, 13 m off)"), Clock);
	}
	// (fed, a while by the fire: then a light out in the trees)
	if (FedAt > 0.f && Clock - FedAt > 11.f && Once(TEXT("lantern")))
	{
		BeginLantern();
	}
	// (the fire burning down until it is fed; fed, it comes back up)
	if (FireDyingFrom > 0.f)
	{
		FireFuel = FedAt > 0.f ? FMath::Min(1.f, 0.25f + (Clock - FedAt) / 4.f) : FMath::Max(0.22f, 1.f - (Clock - FireDyingFrom) / 26.f);
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
		SiftSnow(Player->EyesAt() + Player->LookDir() * 90.f + FVector(0.f, 0.f, 75.f), 110.f, 140);
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
					Hunter->PeerInto(T.TransformPosition(FVector(70.f, 0.f, 0.f)), -T.GetRotation().GetAxisX());
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
	TickWindow(Dt);
	TickLantern(Dt);
	if (MoonDimFrom > 0.f)
	{
		if (!Moon.IsValid())
		{
			for (TActorIterator<AActor> It(GetWorld()); It; ++It)
			{
				if (It->GetActorLabel() == TEXT("Town moon"))
				{
					Moon = It->FindComponentByClass<ULightComponent>();
				}
			}
			if (Moon.IsValid())
			{
				MoonBase = Moon->Intensity;
			}
		}
		if (Moon.IsValid())
		{
			// (cloud over it in a few seconds as the snow thickens: about a third of its light left)
			Moon->SetIntensity(MoonBase * FMath::Lerp(1.f, 0.32f, FMath::SmoothStep(0.f, 1.f, (Clock - MoonDimFrom) / 3.5f)));
		}
	}
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
			Pc->SetLightingChannels(true, true, true);          // (the town's moon, the beam, and the shed's fire)
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
		C->SetWorldScale3D(FVector(R.FRandRange(0.004f, 0.01f)));
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
		if (F.bThrown)
		{
			// (thrown snow: falls back, slowed by the air)
			F.V += FVector(0.f, 0.f, -980.f) * Dt;
			F.V *= FMath::Max(0.f, 1.f - 1.8f * Dt);
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
	return bStoveLit && FireFuel > 0.4f && Stove && FVector::Dist2D(P, Stove->GetActorLocation()) < 280.f && FMath::Abs(P.Z - Stove->GetActorLocation().Z) < 300.f;
}

void AP2Story::TickFire(float Dt)
{
	if (MatchLight)
	{
		// (the match: a flare, a small steady flame a moment, out as it goes into the stove)
		const float m = Clock - MatchAt;
		const float I = m < 0.12f ? m / 0.12f * 6.f : m < 0.4f ? FMath::Lerp(6.f, 2.2f, (m - 0.12f) / 0.28f) : m < 1.8f ? 2.2f * (0.9f + 0.1f * FMath::Sin(Clock * 23.f)) : FMath::Max(0.f, 2.2f * (1.f - (m - 1.8f) / 0.3f));
		MatchLight->SetIntensity(I);
		if (MatchHand)
		{
			MatchHand->SetIntensity(I * 0.1f);
		}
		if (MatchFlame)
		{
			if (MatchFlameMID)
			{
				MatchFlameMID->SetScalarParameterValue(TEXT("Intensity"), 9.f * FMath::Min(1.5f, I / 2.2f));
			}
		}
		if (m > 2.2f)
		{
			MatchLight->DestroyComponent();
			MatchLight = nullptr;
			if (MatchHand)
			{
				MatchHand->DestroyComponent();
				MatchHand = nullptr;
			}
			if (MatchFlame)
			{
				MatchFlame->DestroyComponent();
				MatchFlame = nullptr;
			}
		}
	}
	if (!bStoveLit || !FireLight)
	{
		return;
	}
	// (catching over a few seconds, then burning: a fire's flicker, slow swells and quick licks)
	const float s = Clock - StoveLitAt;
	const float Catch = FMath::Clamp(s / 4.f, 0.f, 1.f);
	const float Fl = 0.78f + 0.12f * FMath::Sin(Clock * 2.3f) + 0.07f * FMath::Sin(Clock * 7.9f + 1.f) + 0.05f * FMath::Sin(Clock * 17.3f + 2.f);
	const float Fu = FireFuel;
	FireLight->SetIntensity(11.f * Catch * Catch * Fl * Fu);
	if (DoorSpill)
	{
		DoorSpill->SetIntensity(5.f * Catch * Catch * Fl * Fu);
	}
	if (FireGlow)
	{
		FireGlow->SetVectorParameterValue(TEXT("Glow"), FLinearColor(1.f, 0.38f, 0.08f) * (6.f * Catch * Fl));
	}
	// (through its open door: the flames licking up over the logs, the coals glowing under them, the sooted inside lit
	// orange by them; the belly's iron slowly coming to a dull red as it burns on)
	const float Lick = 0.75f + 0.15f * FMath::Sin(Clock * 6.1f) + 0.1f * FMath::Sin(Clock * 13.7f + 0.5f);
	if (Flames && FlameMID)
	{
		Flames->SetVisibility(Catch > 0.02f);
		// (bright enough to read through the door, no brighter: at 14 its bloom spread an orange blur over the lower view
		// whenever the stove sat at the edge of the frame)
		FlameMID->SetScalarParameterValue(TEXT("Intensity"), 1.4f * Catch * Lick * FMath::Square(Fu));   // (now drawn: non-Nanite)
	}
	if (FireCoal)
	{
		FireCoal->SetVectorParameterValue(TEXT("Glow"), FLinearColor(1.f, 0.3f, 0.05f) * (1.6f * Catch * (0.85f + 0.15f * FMath::Sin(Clock * 1.7f))));
	}
	if (FireBox)
	{
		FireBox->SetVectorParameterValue(TEXT("Glow"), FLinearColor(1.f, 0.36f, 0.08f) * (0.9f * Catch * Fl));
	}
	if (StoveHeat)
	{
		const float Hot = FMath::Clamp((s - 6.f) / 40.f, 0.f, 1.f);
		StoveHeat->SetVectorParameterValue(TEXT("Heat"), FLinearColor(1.f, 0.12f, 0.02f) * (0.35f * Hot * Hot * Fl));
	}
}

void AP2Story::BeginWindow()
{
	AActor* Shed = nullptr;
	for (TActorIterator<AStaticMeshActor> It(GetWorld()); It; ++It)
	{
		if (It->GetActorLabel() == TEXT("Town Shed"))
		{
			Shed = *It;
		}
	}
	if (!Shed)
	{
		return;
	}
	const FTransform T = Shed->GetActorTransform();
	// (the window over the bench on the back wall (make_town.py shed(): 76 x 62 cm, its foot 118 cm up, boarded with a gap
	// across its middle at about 149 cm); it stands outside, a stride back from the wall, facing in)
	WindowGap = T.TransformPosition(FVector(-372.f, 39.f, 149.f));
	WindowIn = T.TransformVector(FVector(1.f, 0.f, 0.f)).GetSafeNormal();
	WindowSide = T.TransformVector(FVector(0.f, 1.f, 0.f)).GetSafeNormal();
	FVector P = T.TransformPosition(FVector(-372.f - 62.f, 39.f, 0.f));
	P.Z = GroundAt(P);
	FActorSpawnParameters Sp;
	Sp.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
	WindowHusk = GetWorld()->SpawnActor<AHusk>(AHusk::StaticClass(), FTransform(P), Sp);
	if (!WindowHusk || !WindowHusk->Setup())
	{
		return;
	}
	WindowHusk->SetActorScale3D(FVector(HuskScale));
	WindowHusk->Play(TEXT("Stalk"), true);
	if (WindowHusk->GetBody())
	{
		WindowHusk->GetBody()->SetPlayRate(0.05f);
	}
	const float Yaw = WindowIn.Rotation().Yaw;
	WindowHusk->SetActorLocationAndRotation(P, FRotator(0.f, Yaw, 0.f).Quaternion() * FRotator(0.f, -WindowHusk->MeshForwardYaw(), 0.f).Quaternion());
	WindowHusk->PeerDown = 0.f;
	WindowHusk->JawOpen = 4.f;
	TArray<UPrimitiveComponent*> Ps;
	WindowHusk->GetComponents<UPrimitiveComponent>(Ps);
	for (UPrimitiveComponent* Pc : Ps)
	{
		Pc->SetLightingChannels(true, true, true);
		Pc->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	}
	WindowAt = Clock;
	WindowGoneAt = -1.f;
	WindowLitAt = -1.f;
	WindowReach = 0.f;
	Event(TEXT("scrape"));
	UE_LOG(LogTemp, Display, TEXT("P2Story %.2f beat: the window (it stands at the back wall; its hand through the gap at %s)"), Clock, *WindowGap.ToCompactString());
}

void AP2Story::TickWindow(float Dt)
{
	if (WindowAt < 0.f || !WindowHusk)
	{
		return;
	}
	const float W = Clock - WindowAt;
	if (W > 1.8f && W - Dt <= 1.8f)
	{
		Event(TEXT("scrape"));
	}
	if (W > 0.9f && W - Dt <= 0.9f)
	{
		if (Director)
		{
			Director->LogEvent(TEXT("husk_breath"), 140.f);
		}
	}
	// the light on its hand (the flashlight on and the beam on the window), or long enough: it pulls back and goes
	const bool bLit = Player.IsValid() && Player->IsLightOn() && FVector::DotProduct(Player->LookDir(), (WindowGap - Player->EyesAt()).GetSafeNormal()) > FMath::Cos(FMath::DegreesToRadians(14.f));
	if (WindowLitAt < 0.f && W > 3.4f && bLit)
	{
		WindowLitAt = Clock;              // (caught in the light: it goes still a moment, then pulls back)
	}
	if (WindowGoneAt < 0.f && W > 3.4f && ((WindowLitAt > 0.f && Clock - WindowLitAt > 1.6f) || W > 11.f))
	{
		WindowGoneAt = Clock;
		Event(WindowLitAt > 0.f ? TEXT("husk_hiss") : TEXT("scrape"));
		Say(TEXT("It knows I'm in here."), 1.6f, 3.f);
	}
	// its reach: in through the gap after the second scrape, slow, then feeling along the boards; out fast when lit
	float Want = W < 2.6f ? 0.f : FMath::Min(1.f, (W - 2.6f) / 1.1f);
	if (WindowGoneAt > 0.f)
	{
		Want = 0.f;
	}
	WindowReach = FMath::FInterpTo(WindowReach, Want, Dt, WindowGoneAt > 0.f ? 8.f : 3.f);
	// (feeling along the boards; still while the light is on it)
	const float Feel = WindowLitAt > 0.f ? FMath::Clamp(WindowLitAt - WindowAt - 3.7f, 0.f, 99.f) : FMath::Clamp(W - 3.7f, 0.f, 99.f);
	const FVector Into = WindowGap + WindowIn * (32.f + 9.f * FMath::Sin(Feel * 0.9f)) + WindowSide * (13.f * FMath::Sin(Feel * 1.25f)) +
		FVector(0.f, 0.f, 2.5f * FMath::Sin(Feel * 2.3f) - 4.f);
	WindowHusk->ReachAt[1] = Into;
	WindowHusk->ReachW[1] = FMath::SmoothStep(0.f, 1.f, WindowReach);
	// (all of it but the arm it reaches in with kept outside the wall's boards: it stoops and leans as it stalks, and a
	// head or a shoulder through the boards showed it inside the shed (run 24). Each frame it is eased back by however far
	// its farthest part is past the boards' outer face, 7 cm out from the wall line, with a hand's clearance)
	{
		float Most = -1e9f;
		for (const TCHAR* Bn : {TEXT("head"), TEXT("neck_01"), TEXT("spine_05"), TEXT("spine_03"), TEXT("pelvis"), TEXT("clavicle_l"), TEXT("upperarm_l"),
			TEXT("lowerarm_l"), TEXT("hand_l"), TEXT("thigh_l"), TEXT("calf_l"), TEXT("foot_l"), TEXT("thigh_r"), TEXT("calf_r"), TEXT("foot_r")})
		{
			Most = FMath::Max(Most, FVector::DotProduct(WindowHusk->DrawnAt(FName(Bn)) - WindowGap, WindowIn));
		}
		const float Over = Most - (-7.f - 10.f);
		if (Over > 0.f)
		{
			WindowHusk->AddActorWorldOffset(-WindowIn * Over * FMath::Min(1.f, Dt * 12.f));
		}
	}
	if (Player.IsValid())
	{
		WindowHusk->GlareAt = Player->EyesAt();
		WindowHusk->GlareW = FMath::FInterpTo(WindowHusk->GlareW, WindowGoneAt > 0.f ? 0.f : 0.7f, Dt, 2.f);
	}
	if (WindowGoneAt > 0.f && Clock - WindowGoneAt > 1.4f)
	{
		WindowHusk->Destroy();
		WindowHusk = nullptr;
		UE_LOG(LogTemp, Display, TEXT("P2Story %.2f beat: the window, gone (%s)"), Clock, W > 10.f ? TEXT("in its own time") : TEXT("the light on it"));
	}
}

void AP2Story::BeginWood()
{
	// the woodpile against the back wall of the cabin next to the shed (make_town.py cabin(wood=True): from 125 cm either
	// side of its middle, 45 cm out from the wall, 1.15 m high)
	AActor* Cabin = nullptr;
	for (TActorIterator<AStaticMeshActor> It(GetWorld()); It; ++It)
	{
		if (It->GetActorLabel() == TEXT("Town CabinA"))
		{
			Cabin = *It;
		}
	}
	FireDyingFrom = Clock;
	Say(TEXT("The fire's going down..."), 0.f, 2.6f);
	Say(TEXT("There was wood stacked behind the next cabin."), 3.2f, 3.2f);
	SetObjective(TEXT("Get wood from behind the next cabin"));
	if (!Cabin)
	{
		UE_LOG(LogTemp, Warning, TEXT("P2Story: no Town CabinA for the woodpile"));
		return;
	}
	const FTransform T = Cabin->GetActorTransform();
	FActorSpawnParameters Sp;
	Sp.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
	WoodPile = GetWorld()->SpawnActor<AActor>(AActor::StaticClass(), FTransform(T.GetRotation(), T.TransformPosition(FVector(-610.f - 30.f, 0.f, 60.f))), Sp);
	if (WoodPile)
	{
		USceneComponent* Root = NewObject<USceneComponent>(WoodPile, TEXT("Root"));
		WoodPile->SetRootComponent(Root);
		Root->RegisterComponent();
		Root->SetWorldLocation(T.TransformPosition(FVector(-610.f - 30.f, 0.f, 60.f)));
		UP2UseComponent* U = NewObject<UP2UseComponent>(WoodPile, TEXT("Use"));
		U->Id = TEXT("wood");
		U->Prompt = TEXT("Take an armful of wood");
		U->Near = 140.f;
		U->Reach = 200.f;
		U->bOnce = true;
		U->RegisterComponent();
		WoodPile->AddInstanceComponent(U);
	}
	UE_LOG(LogTemp, Display, TEXT("P2Story %.2f beat: the fire dying (the woodpile at %s)"), Clock, WoodPile ? *WoodPile->GetActorLocation().ToCompactString() : TEXT("?"));
}

FVector AP2Story::ShedAt(float U, float V) const
{
	// (the shed faces across the street (its +X toward v-), its +Y down the street (u+); its origin the middle of its
	// front at the ground)
	const FVector P = ShedT.TransformPosition(FVector(-V * 100.f, U * 100.f, 0.f));
	return FVector(P.X, P.Y, GroundAt(P));
}

bool AP2Story::InShed(const FVector& P) const
{
	const FVector L = ShedT.InverseTransformPosition(P);
	return L.X > -380.f && L.X < 15.f && FMath::Abs(L.Y) < 195.f;
}

bool AP2Story::PlayerSees(const FVector& P, float MaxDist, float Cone) const
{
	if (!Player.IsValid())
	{
		return false;
	}
	const FVector E = Player->EyesAt();
	const FVector D = P - E;
	if (D.Size() > MaxDist || FVector::DotProduct(D.GetSafeNormal(), Player->LookDir()) < Cone)
	{
		return false;
	}
	FHitResult H;
	FCollisionQueryParams Q(TEXT("P2Sees"), true, Player.Get());
	if (Kessler)
	{
		Q.AddIgnoredActor(Kessler);
		if (Kessler->GetMan())
		{
			Q.AddIgnoredActor(Kessler->GetMan());
		}
	}
	return !GetWorld()->LineTraceSingleByChannel(H, E, P, ECC_Visibility, Q);
}

void AP2Story::LStageTo(int32 S, const TCHAR* Why)
{
	LStage = S;
	LStageAt = Clock;
	UE_LOG(LogTemp, Display, TEXT("P2Story %.2f lantern %d: %s (the player %s, %.1f m from him)"), Clock, S, Why,
		Player.IsValid() ? *Player->GetActorLocation().ToCompactString() : TEXT("?"),
		Player.IsValid() && Kessler ? FVector::Dist2D(Player->GetActorLocation(), Kessler->GetActorLocation()) / 100.f : -1.f);
}

void AP2Story::BeginLantern()
{
	// (GAMEPLAY_ACT1.md, the rest of the first night, 3: the lantern) Kessler, along the edge of the spruces behind the
	// camp toward it, his lantern swinging; seen through the gap in the boards at the back of the shed
	for (TActorIterator<AStaticMeshActor> It(GetWorld()); It; ++It)
	{
		if (It->GetActorLabel() == TEXT("Town Shed"))
		{
			ShedT = It->GetActorTransform();
		}
	}
	// (a way between the trunks, at least 1.4 m from each (mountain.json's trees), from 58 m out to the trees' edge 17 m
	// behind the shed)
	const FVector From = ShedAt(-42.f, 40.f);
	KWay[0] = ShedAt(-31.f, 30.f);
	KWay[1] = ShedAt(-21.f, 22.f);
	KWay[2] = ShedAt(-11.f, 13.f);
	FActorSpawnParameters P;
	P.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
	Kessler = GetWorld()->SpawnActor<AKessler>(AKessler::StaticClass(), FTransform((KWay[0] - From).GetSafeNormal2D().Rotation(), From), P);
	if (Kessler)
	{
		Kessler->WalkRate = 0.62f;          // (slow, careful, looking)
		Kessler->WalkTo(KWay[0]);
		KLeg = 0;
	}
	if (Hunter)
	{
		Hunter->HoldAway();
	}
	LStageTo(1, TEXT("a light in the trees"));
}

void AP2Story::TickLantern(float Dt)
{
	if (LStage == 0 || !Kessler || !Player.IsValid())
	{
		return;
	}
	const float St = Clock - LStageAt;
	const FVector Eyes = Player->EyesAt();
	const FVector PAt = Player->GetActorLocation();
	const FVector KAt = Kessler->GetActorLocation();
	const float D = FVector::Dist2D(PAt, KAt);
	switch (LStage)
	{
	case 1:
		// along the trees' edge, the lantern swinging; seen first through the boards at the back
		if (!Kessler->IsWalking() && KLeg < 2)
		{
			Kessler->WalkTo(KWay[++KLeg]);
		}
		if (PlayerSees(Kessler->LanternAt(), 6000.f, 0.8f) && Once(TEXT("lantern_seen")))
		{
			Say(TEXT("...A light?"), 0.3f, 2.4f);
			Say(TEXT("Someone's out there."), 3.f, 2.8f);
			SetObjective(TEXT("See who it is"));
		}
		if (St > 15.f && !Done.Contains(FName(TEXT("lantern_seen"))) && Once(TEXT("lantern_hint")))
		{
			Say(TEXT("(A light. Out back, through the boards.)"), 0.f, 3.2f);
			SetObjective(TEXT("See who it is"));
		}
		// (at the trees' edge he waits, still, the light held up toward the camp, until they come out)
		if (KLeg == 2 && !Kessler->IsWalking())
		{
			const FVector Toward = InShed(PAt) ? ShedT.TransformPosition(FVector(-185.f, 0.f, 150.f)) : Eyes;
			Kessler->FaceTo(Toward);
			Kessler->LookAtPoint = Toward;
			Kessler->LanternToward = Toward;
			Kessler->LanternUp = 1.f;
		}
		// (they are out and see him: he turns and comes on toward them, slow, until he is near enough to see their
		// face, and stops)
		if (KLeg < 3 && !InShed(PAt) && D < 4500.f && PlayerSees(Kessler->LanternAt(), 4500.f, 0.7f))
		{
			KLeg = 3;
			UE_LOG(LogTemp, Display, TEXT("P2Story %.2f lantern: he has seen them; he comes on (%.1f m)"), Clock, D / 100.f);
		}
		if (KLeg == 3)
		{
			Kessler->LookAtPoint = Eyes;
			Kessler->LanternUp = 0.3f;
			Kessler->LanternToward = Eyes;
			if (D > 1080.f)
			{
				Kessler->WalkTo(PAt + (KAt - PAt).GetSafeNormal2D() * 1000.f);
			}
			else
			{
				Kessler->Halt();
				LStageTo(2, TEXT("he stops; the lantern comes up to the player"));
			}
		}
		break;
	case 2:
		// silent, the light held up to them; no answer
		Kessler->LookAtPoint = Eyes;
		Kessler->FaceTo(PAt);
		if (St > 0.8f)
		{
			Kessler->LanternToward = Eyes;
			Kessler->LanternUp = 1.f;
		}
		if (Once(TEXT("hello")))
		{
			Say(TEXT("Hello?!"), 1.f, 2.f);
			Say(TEXT("Who's there?!"), 3.3f, 2.4f);
			SetObjective(TEXT(""));
		}
		if (St > 6.4f)
		{
			// (the side it will come from: away from the buildings)
			const FVector Run = (PAt - KAt).GetSafeNormal2D();
			const FVector Sd = FVector::CrossProduct(FVector::UpVector, Run);
			const FVector Mid = ShedT.TransformPosition(FVector(-185.f, 0.f, 0.f));
			ChargeSide = FVector::Dist2D(PAt + Sd * 900.f, Mid) > FVector::Dist2D(PAt - Sd * 900.f, Mid) ? Sd : -Sd;
			Kessler->LanternUp = 0.f;
			Kessler->AimAt(Eyes - FVector(0.f, 0.f, 20.f) + ChargeSide * 90.f);
			LStageTo(3, TEXT("the rifle comes up at the player"));
		}
		break;
	case 3:
		// the rifle on them (on the dark just beside them: he has seen it there): run
		Kessler->AimAt(Eyes - FVector(0.f, 0.f, 20.f) + ChargeSide * 90.f);
		if (Once(TEXT("rifle_up")))
		{
			Say(TEXT("No... no, no, no-"), 0.7f, 2.2f);
			SetObjective(TEXT("RUN"));
		}
		if (St > 2.7f)
		{
			// (they have turned and run from him: it breaks from the dark ahead of them, off to one side (on the side away
			// from the buildings), into their light, straight at them; they are caught between it and the rifle)
			const FVector Run = (PAt - KAt).GetSafeNormal2D();
			const FVector Sd = FVector::CrossProduct(FVector::UpVector, Run);
			const FVector Side = FVector::DotProduct(Sd, ChargeSide) >= 0.f ? Sd : -Sd;
			const FVector From = PAt + Side * 1350.f + Run * 900.f;
			if (!Hunter)
			{
				FActorSpawnParameters Sp;
				Sp.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
				Hunter = GetWorld()->SpawnActor<AHuskHunter>(AHuskHunter::StaticClass(), FTransform::Identity, Sp);
				if (Hunter)
				{
					Hunter->Begin(Director, HuskScale, 1600.f);
					Hunter->HoldAway();
				}
			}
			if (Hunter)
			{
				Hunter->ChargeFrom(From);
			}
			LStageTo(4, TEXT("it breaks from the dark at their heels"));
		}
		break;
	case 4:
	{
		// the charge; his rifle on it; the shot when it is on their heels
		const FVector Hb = Hunter ? Hunter->BodyAt() : PAt;
		Kessler->AimAt(Hb);
		const float Dh = FVector::Dist2D(Hb, PAt);
		if (Once(TEXT("it_comes")))
		{
			Say(TEXT("Oh God-"), 0.6f, 1.4f);
		}
		if ((Dh < 470.f && Kessler->IsAimed()) || St > 6.f)
		{
			FVector M, Dir;
			Kessler->Fire(M, Dir);
			Event(TEXT("rifle_shot"));
			if (Hunter)
			{
				Hunter->Shot((Hb - M).GetSafeNormal());
				SnowBurst(FVector(Hb.X, Hb.Y, GroundAt(Hb) + 10.f), (Hb - M).GetSafeNormal(), 90);
				SnowBurst(Hb, (Hb - M).GetSafeNormal(), 40);           // (off its back where the round hit)
			}
			Player->Jolt(1.3f);
			LStageTo(5, TEXT("the shot: it drops at their heels"));
		}
		break;
	}
	case 5:
		// silence; the thing in the snow; he lowers the rifle and comes
		if (Once(TEXT("husk_down")))
		{
			Event(TEXT("husk_down"));
			SetObjective(TEXT(""));
		}
		Kessler->LookAtPoint = Eyes;
		if (St > 0.7f)
		{
			Kessler->LowerRifle();
		}
		if (St > 1.9f)
		{
			if (Once(TEXT("kessler_comes")))
			{
				Kessler->WalkRate = 0.8f;
			}
			if (D > 210.f)
			{
				// (at a run while far, the last steps walked)
				Kessler->WalkTo(PAt + (KAt - PAt).GetSafeNormal2D() * 170.f, D > 650.f);
				Kessler->LanternToward = Eyes;
				Kessler->LanternUp = D > 650.f ? 0.f : 0.35f;
			}
			else if (!Kessler->IsWalking())
			{
				LStageTo(6, TEXT("he comes up to them, the lantern raised to their face"));
			}
		}
		break;
	case 6:
	{
		// (the lantern held up between them, off to his left, so its light is on both their faces and his can be seen)
		Kessler->FaceTo(PAt);
		Kessler->LookAtPoint = Eyes;
		Kessler->LanternToward = Eyes - Kessler->GetActorRightVector() * 70.f;
		Kessler->LanternUp = 1.f;
		if (Once(TEXT("get_inside")))
		{
			Say(TEXT("Stranger: Get inside."), 1.2f, 3.4f);
		}
		if (St > 5.f && Once(TEXT("get_inside_obj")))
		{
			SetObjective(TEXT("Get inside"));
		}
		break;
	}
	default:
		break;
	}
}

void AP2Story::SnowBurst(const FVector& At, const FVector& Dir, int32 Count)
{
	SiftSnow(At, 25.f, Count);
	FRandomStream R(131 + Count);
	const FVector D = Dir.GetSafeNormal2D();
	for (int32 i = Sift.Num() - Count; i < Sift.Num(); ++i)
	{
		if (i < 0)
		{
			continue;
		}
		FSift& F = Sift[i];
		const FVector Out = FVector(R.FRandRange(-1.f, 1.f), R.FRandRange(-1.f, 1.f), R.FRandRange(0.4f, 1.3f)).GetSafeNormal();
		F.V = (Out + D * 0.7f) * R.FRandRange(140.f, 420.f);
		F.Delay = R.FRandRange(0.f, 0.08f);
		F.bThrown = true;
		if (F.C)
		{
			F.C->SetWorldScale3D(FVector(R.FRandRange(0.008f, 0.03f)));
		}
	}
}
