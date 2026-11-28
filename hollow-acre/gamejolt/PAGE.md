# Hollow Acre on Game Jolt: making the page, step by step

Everything for the page is in this folder:

| What | File |
| --- | --- |
| Title, short and full descriptions, category, tags, maturity answers, system notes | `page_text.md` |
| Thumbnail, 1920 x 1080 (16:9) | `art/thumbnail.png` (a second choice: `art/thumbnail_alt.png`) |
| Header, 3000 x 750 (4:1) | `art/header.png` |
| Screenshots, PC, 1920 x 1080 | `screens/pc/01_title.png` to `08_map.png` |
| Screenshots, phone | `screens/phone/01_farm.png` to `04_title_upright.png` (2532 x 1170, and 1170 x 2532 upright) |
| The game for the browser | `build/HollowAcre-demo-gamejolt.zip` |

All pictures come from the game itself. The thumbnail and header use the loading screen's night farm and the game's own
lettering, and the screenshots are the real game. None of them show gore, so they are fine for Game Jolt's public lists.

## Which game goes on Game Jolt: the demo

The zip holds **the demo**: the whole game, with 90 minutes of play, the rating screen at the end and the link to the full game.

Why the demo and not the full game:

- **The copy goes out of date.** Game Jolt keeps the copy you upload until you upload another. The full game on the
  website changes many times a week, so a full copy on Game Jolt would soon be older and buggier than the free website.
- **It gets feedback.** The demo is a taste. At the end, players rate it and leave a note, which arrives on your Demo
  feedback page. Then they go on to the full game, which is free and always the newest.

The demo in the zip is the version of the game that was current when the zip was made. To refresh it, see "Updating the
demo" below.

## Before you start

- Game Jolt's terms require account holders to be 13 or older. A parent can make and own the account.
- Sign in at https://gamejolt.com. Making a game page is free.
- Have this folder open, so you can upload the files from it.

Game Jolt moves its buttons around now and then. If something isn't exactly where these steps say, look for the nearest
button with the same name.

## 1. Make the page

1. Open your **Dashboard** (your avatar at the top right, then **Dashboard**, or https://gamejolt.com/dashboard).
2. Choose **Add a game** (it may say **Add your game**).
3. **Title:** `Hollow Acre`. Continue.

## 2. Details

On the game's **Details** (or **Game info**) page:

1. **Description:** paste the full description from `page_text.md`, everything between its two lines.
2. **Category:** Simulation. Add Adventure if there is a second choice.
3. **Engine / creation tool:** HTML5. If it isn't listed, pick Other or Custom.
4. **Development status:** Work in progress.
5. Leave **comments** and **ratings** on, so players can rate and comment on Game Jolt too.
6. Save.

## 3. Maturity

Open the **Maturity** section. Choose **Mature**, then tick the content kinds as the table in `page_text.md` says:
intense violence, intense animated blood, mild language, alcohol, a mild tobacco reference, players interact online.
Leave sexual content, drugs and gambling unticked. Save.

## 4. Thumbnail, header and screenshots

1. **Thumbnail:** upload `art/thumbnail.png`. It is already 16:9, so in the crop box keep the whole picture and save.
   (`art/thumbnail_alt.png`, the farmer and the thing in the corn at night, is the other choice.)
2. **Header:** upload `art/header.png`. Keep it whole. The title is in the middle, so it survives the phone crop.
3. **Media / Screenshots:** add the PC pictures in order, 01 to 08, then the phone pictures. The first one is shown first.

## 5. Put the game on the page

1. Open **Packages** and choose **Add package**.
   - **Name:** `Hollow Acre Demo (play in your browser)`
   - **Description:** `90 minutes of the real game. At the end, rate it and tell the developer what you think. The full game is free in your browser.`
   - Save.
2. In the package, choose **New release**. Version: `1.0.0`. Save.
3. In the release, choose **Upload browser build** (not a downloadable build) and pick `build/HollowAcre-demo-gamejolt.zip`.
   Wait for it to upload and be processed.
4. **Platform / type:** HTML.
5. **Size:** width `1280`, height `720`. Tick **Fit to screen** (it may say "let the game fill the space"), so the game
   uses the whole window. The game fits itself to any size, a phone included.
6. **Publish the release.** A release stays hidden until you do.

## 6. Publish the page and test it

1. Back on the game's dashboard, publish the game page (**Publish**, or set it to visible).
2. Open the public page and press **Play**. You should see the night farm loading screen, then the title screen with
   "DEMO · 1 H 30 MIN OF PLAY" under the story line.
3. Click into the game once: the browser lets the sound start, and keys reach the game.
4. Try it on a phone too.

## Notes on how the game runs inside Game Jolt

- **The frame.** Game Jolt shows a browser game inside a frame on its page, served from its own web address. The zip's
  paths are all relative, and nothing in it reaches the GitHub website, so it runs there as it is.
- **Saves.** The demo saves in the browser, under Game Jolt's address, so:
  - it is separate from the full game's save on the website, and from the website's demo;
  - a private window, or clearing the browser's site data, starts it over;
  - Safari may forget it if the player doesn't come back for about a week.
  The demo's 90 minutes are saved the same way, so the same things reset them.
- **Full screen.** Use Game Jolt's own full-screen button on the play page. The game's F key and full-screen button only work
  if Game Jolt's frame allows full screen. Either way the game fills whatever space it has.
- **Links.** The links on the demo's last screen ("Play the full game", and the apps) open in a new tab, so the player keeps
  their Game Jolt tab.
- **Controllers.** A controller works once the player has clicked into the game. A few browsers don't pass controllers
  into a frame; keyboard, mouse and touch always work.
- **Multiplayer.** Playing together works from Game Jolt. It finds other players through the same public relays as the
  website, so a Game Jolt player and a website player can meet in one valley.
- **Ratings from Game Jolt players** arrive on the same Demo feedback page as the website demo's, marked "Game Jolt".
  Game Jolt's own ratings and comments are separate, on the Game Jolt page.

## Reading the demo feedback

In the full game, on the profile where you typed **Jaxon5**:

- **Settings > Gameplay > Demo feedback**, or
- **Profiles > Codes > Demo feedback**.

It lists every rating and note, newest first, with the average. The first time on a device it asks for the code once more.
**Send a test** sends a test rating through the relays. It shows up marked "A test from this page", and it isn't counted
in the average.

The ratings travel over public Nostr relays, the same free servers the game's log-in accounts use. Each one is encrypted
to a key made from your code, so people browsing those relays see only scrambled text. Anyone who knows or guesses the code
could read them, so keep the code to yourself. The relays don't promise to keep messages forever. The page keeps a copy of
everything it has fetched on your device, so open it now and then.

## Updating the demo on Game Jolt

The website's demo (https://rockerjaxrules.github.io/Hollow-acre/hollow-acre/2d/demo/) always plays the newest game. The
Game Jolt copy changes only when you upload a new zip:

1. Get a fresh zip. Every push builds one. On GitHub, open **Actions**, then the latest **Hollow Acre apps** run, and
   download **HollowAcre-gamejolt-demo** from its **Artifacts**. Unzip that download once: inside is
   `HollowAcre-demo-gamejolt.zip`.
   (Or, from the repository: `python3 hollow-acre/2d/tools/mkdemo.py --gamejolt HollowAcre-demo-gamejolt.zip`.)
2. On Game Jolt, open the package, choose **New release** with a higher version (1.0.1, 1.1.0...), upload the new zip as an
   HTML browser build as in step 5, and publish it.

Players keep their demo progress and the time they have left. Both are saved in their browser, not in the zip.

## The full game on Game Jolt too (optional)

You can also add the desktop apps as a second package, **Hollow Acre (full game, desktop)**, with downloadable builds
from https://github.com/RockerJaxrules/Hollow-acre/releases/latest:

- `HollowAcre-Setup-<version>.exe`: Windows;
- `HollowAcre-<version>-mac-arm64.dmg` and `HollowAcre-<version>-mac-x64.dmg`: Mac;
- `HollowAcre-x86_64.AppImage`: Linux.

They play the newest game from the website every time they start. The Windows and Linux apps also update themselves,
and the Mac app says when a new version is out. So a copy on Game Jolt doesn't go stale.
