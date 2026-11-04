# Hollow Acre: desktop build

1. `cp -r ../2d game`
2. `npm install`
3. `npm start` runs the game in a desktop window. F11 toggles fullscreen.
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
