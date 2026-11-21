# The new ending and Part 2: the owner's direction (kept word for word)

Saved so none of it is lost. This work comes after the current list (t346-t348 on the live list).

## The owner's words

> Oh and by the way this is for when we're done but the ending will than end and you will get a message or call your grandmother has gone missing in a mountain and you say goodbye to your spouse if you chose to have one in game and go looking for her your car is than seen driving up a mountain bad weather blizzard when screen fades to black it fades back and the game is now in first person realistic and this will go into the story of Are mountain alway dark there always cold leans more on survival hiding base protection stealth and a story focusing on you trying to uncover the secret of lost minors and your inherit your grandmothers mining company after she went missing you end up there when driving to check o the run into the creature which will be like a yeti rams you vehicle almost off the mountain

> This will focus on mining and base upgrading and uncovering the mystery and surviving the climate of a cold always dark location but this time game first person and realistic still horror though and the creature will probably be a yeti or something but how the ending will happen as you will see the first person cutscene realistic driving up the mountain screen fades to black and it will say to be continued and before you do this you will probably have to look up some good tools for how to make Claude able to make really good looking realistic high detailed models textures and animations for the cutscene that ends this story and when we do the second game

## The owner's correction: it is one game

> Game 2 is a continuation you understand it links into the new endings it's not a new game it's a new part of this game same character

So "game 2" is **Part 2 of Hollow Acre**, not a separate game:
- It lives in the same game and the same save. The new ending leads straight into it.
- **The same character:** your name, your look (seen in first person through the hands, sleeves, reflections and photos), your spouse if you married, and your choices all carry over.
- The switch to first-person realistic happens inside the same game when the ending's drive fades in. The farm, Marrow Hollow and the people you know remain part of the same story.
- Any "To be continued" is a chapter break into Part 2, not the end of the game.

## What that means

### The new ending of Hollow Acre (t346)

1. After the current ending, a message or phone call: your grandmother has gone missing on a mountain.
2. If you married someone in the game, you say goodbye to your spouse.
3. You set off to look for her. Your car is seen driving up a mountain in bad weather, a blizzard.
4. The screen fades to black and fades back in. The game is now **first-person and realistic**: a realistic first-person cutscene driving up the mountain.
5. The screen fades to black, and the words: **To be continued**.

### Before building it (t347)

Research the best tools for Claude to make really good-looking, realistic, high-detail 3D models, textures and animations. They are needed for this closing cutscene and for game 2.

### Part 2 (t348): the same game, the same character

- **Style:** first-person, realistic, still horror.
- **Setting:** a mountain that is always dark and always cold.
- **Play:** mining, base upgrading, surviving the climate, hiding, base protection, stealth.
- **Story:**
  - You inherit your grandmother's mining company after she goes missing.
  - You uncover the secret of the lost miners.
  - Driving up to check on it, you run into the creature, a yeti-like thing, which rams your vehicle off the mountain
    (the owner's later message: off it, not almost off it).

### The owner's words on how Part 2 plays (kept word for word)

> Are mountain alway dark there always cold leans more on survival hiding base protection stealth and a story focusing on you trying to uncover the secret of lost minors and your inherit your grandmothers mining company after she went missing you end up there when driving to check o the run into the creature which will be like a yeti rams you vehicle off the mountain
> This will focus on mining and base upgrading and uncovering the mystery and surviving the climate of a cold always dark location so first you will be lower on the mountain and you will have to explore and mine to get money fix your car so you can drive up to the main area where your grandmothers
> Mine will be but this will be a long game always focusing on survival lots of running sneaking around upgrading your tools exploring we do this in part 2 and character will probably have a flashlight

What that adds:
- **The opening:** the drive from the ending goes on until the creature rams the car off the road, down the mountain.
- **The first stretch:** you start lower on the mountain, cut off from where you were going. You explore and mine to earn
  money, and with it you fix your car.
- **The goal of that stretch:** the repaired car takes you up to the main area, where your grandmother's mine is.
- **The whole game:** long, and always about survival: lots of running, sneaking, exploring, and upgrading your tools.
- **All of this is Part 2.** The character will probably carry a flashlight.

## Engine decision (owner): Part 2 moves to Unreal Engine
- Part 2 (realistic first-person survival horror) is built in Unreal Engine 5, as a native app for PC, Mac, iPhone and
  Android.
- Part 1 is also included in that app (the web game runs inside it), and Part 1 always stays playable in the browser
  as it is now. The save and character carry over from Part 1 into Part 2.
- Unreal runs on the owner's own PC. This cloud session drives it through Remote Control (a folder on the PC served
  by the Claude desktop app). iPhone builds need the owner's Mac with Xcode and an Apple developer account. Android
  builds run on the PC with the Android SDK.
- Blender stays the modelling tool (tools/b3d). Models export as FBX to Unreal.
- The three.js Part 2 test page (2d/p2) is frozen as a prototype.

## Outside-art exception for Part 2 (owner approved)
Owner: "Allow them if I can still make money off the game if I sell it and don't get in trouble for using them and they
work good if not do it on your own".
- Allowed in Part 2 (Unreal):
  - Epic's **MetaHuman**: realistic people and hands. Under the Unreal Engine EULA from UE 5.6; commercial games
    allowed.
  - **Quixel Megascans**: about 23,000 scanned assets, free on Fab since November 2026 under the Fab Standard License;
    commercial use in any engine; no credit required.
- Conditions:
  - Never resell or redistribute the raw assets on their own.
  - Unreal's royalty is 5% of gross revenue above US$1M per product, waived for Epic Games Store sales.
  - MetaHumans are synthetic, so no real person's likeness is used. Never scan a real person without their written
    consent.
  - Keep a list of every Epic asset used (`ASSETS_EPIC.md`).
  - Re-read the current EULA and Fab licence text before release.
- Everything else stays our own work, and Part 1 (the pixel game) keeps the strict no-outside-art rule.

## Part 2's world, story and people (owner)
- **The map:** "It's going to be a big map giant map so there will be parts you explore completely abandoned and than
  some are small mining towns your probably going to start off in a abandoned area you have to explore maybe not
  abandoned maybe a few people but giant map and you end up needing to get back to the top where you were heading ad
  that is there grandmas place is this should be a big long game with a big long map and a big great story with lots
  of cutscenes and horror".
- **The people:** "There friendly most of them not the most gentle people but kind and not many of them and you mah be
  running away from one before realizing there here to help you".
- **Caitie-Lynn** (Caitlyn's sister, a gag character in Part 2, looking like a real person from the owner's photos):
  the owner confirms they have that person's written consent. The photos are used for reference only and are never
  committed; Caitlyn's own face in Part 1 (`mae`) stays as it is.
- **Animation:** the owner has no motion-capture equipment and asked that everything be animated by us ("You animate
  it all"), rather than using Epic's Game Animation Sample (a free library of pre-recorded mocap that needs no
  equipment; offered, not taken for now).

### The look and the bar (owner, while gameplay was being built)
- "Forest on mountains should be more denser" (done: 46,661 spruces, was 3,400; the mountainsides forested to a
  treeline).
- "When your done making the game let me know it needs to feel unique though good story I want a the quarry map or
  until dawn beautiful that detailed that good looking" (kept word for word). Understood as: the map should reach the
  beauty and density of detail of Supermassive's The Quarry and Until Dawn (hand-dressed places, cinematic moonlight,
  fog and practical lights), while the game feels like its own (our story, our mountain, our creature, never a copy
  of theirs); the owner is told when the game is done. The blind judges now score against that bar.
