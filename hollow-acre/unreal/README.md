# Hollow Acre Part 2: Unreal Engine project

Part 2 is built in Unreal Engine 5 on the owner's PC. Read `../PART2_HANDOFF.md` first.

## PC setup checklist (owner, one time)
1. **Epic Games Launcher:** install it from epicgames.com and sign in.
2. **Unreal Engine 5:** Launcher, then Unreal Engine, then Library, then Install, latest 5.x. Allow about 100 GB on an SSD.
3. **Visual Studio 2022 Community:** in the installer, tick "Game development with C++" (it includes the Unreal
   integration).
4. **Git and Git LFS:** git-scm.com, then run `git lfs install` once. Unreal assets are large binary files.
5. **Claude desktop app:**
   - Sign in.
   - Settings, then Claude Code, then Remote Control: turn it on and add the folder `C:\HollowAcre`, not your whole
     user folder.
   - Leave the app running.
6. **Clone the repo** into `C:\HollowAcre` (or let the Claude session do it).
7. **For later:**
   - Android: Android Studio with the SDK and NDK versions Unreal asks for.
   - iPhone: the Mac with Xcode, plus an Apple developer account.

## First session on the PC
Start Claude Code in `C:\HollowAcre` and say: "Read hollow-acre/PART2_HANDOFF.md and start Part 2 in Unreal."

That session will:
- create the project `HollowAcre` from the **First Person** template, **C++**, in `hollow-acre/unreal/HollowAcre/`;
- merge `ConfigSnippets/DefaultEngine.ini.part` into `Config/DefaultEngine.ini`;
- set up Git LFS tracking for `*.uasset` and `*.umap`;
- build the first milestone: the night blizzard drive with MetaHuman arms at 10 and 2;
- keep the live log updated (`../tools/live/README.md`).

## Automation (so Claude can work from the phone conversation)
- Editor scripts run headless:
  `UnrealEditor-Cmd.exe HollowAcre.uproject -run=pythonscript -script="Scripts/<name>.py"`
  (needs the Python Editor Script Plugin, which is on by default).
- Screenshots for the live log come from the game camera, rendered off-screen (`-RenderOffscreen`).
- Packaging: `RunUAT.bat BuildCookRun -project=... -platform=Win64 -clientconfig=Shipping -cook -build -stage
  -pak -archive`.
