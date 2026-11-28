# Hollow Acre: desktop app (Windows, Mac, Linux, Steam Deck)

Download: **https://github.com/RockerJaxrules/Hollow-acre/releases/latest**

| File | For |
| --- | --- |
| `HollowAcre-Setup-<version>.exe` | Windows: installs the game, with Start menu and desktop shortcuts. Updates itself. |
| `HollowAcre-Portable-<version>.exe` | Windows: plays without installing. It tells you when a new version is out. |
| `HollowAcre-<version>-mac-arm64.dmg` | Mac with Apple silicon (M1, M2, M3, M4 and newer). It tells you when a new version is out. |
| `HollowAcre-<version>-mac-x64.dmg` | Mac with an Intel processor. It tells you when a new version is out. |
| `HollowAcre-<version>-mac-arm64.zip`, `...-mac-x64.zip` | The same Mac apps in a .zip, if you'd rather not use the .dmg. |
| `HollowAcre-x86_64.AppImage` | Steam Deck and most Linux computers. Updates itself. |
| `HollowAcre_<version>_amd64.deb` | Ubuntu and Debian. It tells you when a new version is out. |

## Windows

1. Download `HollowAcre-Setup-<version>.exe` from the page above and run it.
2. The app isn't signed yet, so Windows may show **"Windows protected your PC"**. Click **More info**, then **Run anyway**.
   (If Edge says the file "isn't commonly downloaded", click the **...** next to it, then **Keep**, then **Keep anyway**.)
3. Choose where to install it and click **Install**. Start the game from the desktop or the Start menu.

The portable `.exe` needs no install: put it anywhere and double-click it (the same **More info**, **Run anyway** applies).

## Mac

1. Find out which Mac you have: Apple menu > **About This Mac**. **Chip: Apple M1** (or M2, M3...) means Apple silicon;
   **Processor: ... Intel** means Intel.
2. From the page above, download `HollowAcre-<version>-mac-arm64.dmg` for Apple silicon, or `HollowAcre-<version>-mac-x64.dmg`
   for Intel.
3. Open the `.dmg` and drag **Hollow Acre** onto the **Applications** folder next to it.
4. The app isn't signed with an Apple Developer certificate, so the first time, macOS asks before it opens it:
   - **macOS 14 Sonoma and earlier:** in **Applications**, right-click (or Control-click) **Hollow Acre**, choose **Open**, then
     **Open** again in the box that appears.
   - **macOS 15 Sequoia and later:** double-click **Hollow Acre**. macOS says it can't check it; click **Done**. Open
     **System Settings** > **Privacy & Security**, scroll down to the line about Hollow Acre and click **Open Anyway**. Enter your
     password, then click **Open Anyway** once more.
   After that it opens normally, from Launchpad, the Dock or Applications.
5. If macOS ever says the app "is damaged and can't be opened", the download was changed on its way. Download it again. If it
   still says so, open **Terminal** and run `xattr -cr "/Applications/Hollow Acre.app"`, then open it as in step 4.

The Mac keys are the usual ones: **Cmd+Q** quits (the game saves first), **Cmd+H** hides it, **Ctrl+Cmd+F** is full screen, and
**Cmd+C** / **Cmd+V** work in the game's text boxes (your login, a farm code).

## Steam Deck

1. Hold the power button and choose **Switch to Desktop**.
2. Open a web browser (Firefox is in the **Discover** store if there isn't one yet), go to the page above and download
   `HollowAcre-x86_64.AppImage`. It goes to your **Downloads** folder. If you want it somewhere else, move it now, before step 4:
   Steam remembers where it is. Keep the file's name as it is, because updates replace that same file.
3. Open the **Dolphin** file manager, right-click the file, choose **Properties**, open **Permissions**, tick
   **Is executable** and click **OK**.
4. Open **Steam**, then **Games**, then **Add a Non-Steam Game to My Library...**. Click **Browse...**, set the file type to
   **All Files**, pick `HollowAcre-x86_64.AppImage`, and click **Add Selected Programs**.
5. Double-click **Return to Gaming Mode** on the desktop. Hollow Acre is in your Library under **Non-Steam**.

On the Deck the game starts full screen at 1280 x 800, and the Deck's controls work from the title screen.
Press **Steam + X** to open the on-screen keyboard whenever you need to type, such as your login or a farm code.
If the sticks move a mouse pointer instead, open the game's **Controller settings** in Steam and pick the **Gamepad** layout.

## Updates

- **The game** updates by itself. The app plays the newest version from the game's website, so every update to the game
  reaches you the next time you start it, with nothing to download. The website's copy is kept for playing offline.
  If the app has never been online, it plays the copy of the game that ships inside it.
- **The app** checks for a new version a few seconds after it starts. The Windows installer version and the AppImage download it
  quietly and show **"Update ready, restart to apply"**. Choose **Restart now** or **Later**. It never restarts by itself
  mid-game, and if you choose Later the update goes in when you next quit. The portable `.exe` and the `.deb` show
  a notice with a link to the download page.
- **On a Mac** the app can't replace itself, because it isn't signed by Apple. It asks GitHub for the newest version instead, and
  when there is one it shows **"A new version is ready"** with a **Download** button, which downloads the right `.dmg` for your Mac.
  Open it and drag Hollow Acre into **Applications**, choosing **Replace**. Your saves stay. A new version of the app is rare;
  the game inside it updates every time it starts, as on Windows and Linux.

## Saves

Your saves stay on your computer, in the app's own data folder: `%APPDATA%\Hollow Acre` on Windows,
`~/Library/Application Support/Hollow Acre` on a Mac, and `~/.config/Hollow Acre` on Linux and the Deck. They are kept when the app updates, and when you uninstall it on Windows.
If you used version 0.2 of the app, your saves are moved over the first time 1.0 starts. A copy of them is also kept in
`saves-from-old-app.json` in that folder.
The same folder has `desktop.log`, which says what the app did, in case something goes wrong.

## Multiplayer

Multiplayer works in the desktop app and in any web browser, so a desktop player and a browser player can play together.
Players connect directly to each other (WebRTC, through the bundled Trystero library, MIT) and find each other through free
public relays, so there is no game server to run.
Open the menu, then **Together**. Everyone online shares one valley, or type the same farm code to play privately with friends.
Each player keeps their own farm, story and save.

## Controls

The controls are the same in the browser and the desktop app. A controller works everywhere, from the title screen on.

- **WASD or arrow keys:** walk (hold Shift to run)
- **Space, E or left click:** act
- **1-6:** hotbar slots
- **B:** bag
- **J:** journal
- **Q:** next seed
- **Esc:** close a panel
- **F or F11:** full screen (on a Mac, **F** or **Ctrl+Cmd+F**)

In the game, **Display** (on the title screen, or the monitor icon in the HUD corner) shows your screen's real resolution.
It lets you pick a resolution (which sizes the window), Window or Full screen, the interface size and the world zoom.

## For developers

- `npm install`, then `npm start` runs the app from this folder. `npm run dist` builds the apps for this computer's system.
  Both copy the game from `../2d` into `game/` first (`copy-game.js`).
- GitHub Actions (`.github/workflows/hollow-acre-apps.yml`) builds Windows, Linux and macOS on every push.
  A push that raises the `version` in `package.json` publishes the release `desktop-v<version>` by itself; running it by hand
  (**Actions**, **Hollow Acre apps**, **Run workflow**) publishes it too, or refreshes the files of a release that exists.
  The release has the Windows, Mac and Linux files and the update files (`latest.yml`, `latest-linux.yml`).
- The Mac apps (Apple silicon and Intel, `.dmg` and `.zip`) are built on a `macos-latest` runner. There is no Apple Developer
  certificate, so electron-builder's signing is off (`"identity": null`) and `build/adhoc-sign.js` gives each app an ad-hoc
  signature (`codesign --sign -`), which Apple silicon needs to open it at all. The run's log shows each app's signature and processor.
  With a Developer ID certificate and notarization later, the Mac app could update itself like the Windows one.
  The game itself needs no release, because the app plays it from the website.
- How it works (`main.js`, `preload.js`):
  - The window loads `https://rockerjaxrules.github.io/Hollow-acre/hollow-acre/2d/`, and the site's service worker keeps it
    for offline play.
  - With no connection and no saved copy, requests for that address are answered from `game/`, so the save stays under the
    same address either way.
  - Saves from 0.2, which played from `file://`, are copied into the website's storage on the first start, and a key that is
    already there is never overwritten.
- Security:
  - The page runs with `contextIsolation`, `sandbox` and no Node.
  - The `hollowDesktop` bridge (window size, full screen, screen info, the update notice) is given only to the game's own pages.
  - The window can't be sent to another site, and links to other sites open in the system browser.
  - It has no new windows and no webviews, and only the permissions the game uses.
- Electron flags: just one, `autoplay-policy=no-user-gesture-required`, so a player who uses only a controller hears the
  music from the title screen. The Deck needs nothing else:
  - Game Mode and Desktop Mode both run the app through X11.
  - Steam Input shows the Deck's controls as a normal gamepad.
  - SteamOS allows Chromium's own sandbox.
- Ubuntu 24.04 and later block the AppImage's sandbox, so use the `.deb` there.
- For Steam, add [steamworks.js](https://github.com/ceifa/steamworks.js) to the main process, then upload the
  `electron-builder` output with SteamPipe.
