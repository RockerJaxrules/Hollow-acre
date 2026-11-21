# Hollow Acre: desktop build

1. `cp -r ../2d game`
2. `npm install`
3. `npm start` runs the game in a desktop window. F11 toggles fullscreen.
   The first run opens at most of your screen; after that the window comes back at the size and place you left it.
   In the game, **Display** (title screen, or the monitor icon in the HUD corner) shows your screen's real resolution and lets
   you pick a resolution (sizes the window), Window or Full screen, the interface size and the world zoom.
4. `npm run dist` builds installers for Windows, macOS and Linux.

The controls are the same in the browser and the desktop build:

- **WASD or arrow keys:** walk (hold Shift to run)
- **Space, E or left click:** act
- **1-6:** hotbar slots
- **B:** bag
- **J:** journal
- **Q:** next seed
- **Esc:** close a panel
- **F:** fullscreen

For Steam, add [steamworks.js](https://github.com/ceifa/steamworks.js) to the main process, then upload the `electron-builder` output with SteamPipe.

## Multiplayer

Multiplayer works in the desktop build and in any web browser, not only on claude.ai. Players connect directly to each other
(WebRTC via the bundled Trystero library, MIT) and find each other through free public relays, so there is no game server to run.
Open the menu, then **Together**: everyone online shares one valley, or type the same farm code to play privately with friends.
Each player keeps their own farm, story and save. For Steam, the same screen can later switch to Steam's own networking.
