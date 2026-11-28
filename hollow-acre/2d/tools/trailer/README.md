# Teaser trailer (#200)

Everything is made from the game itself and from code: no outside footage, music or sounds.

1. `cap2.js` is the directed capture (every shot walks a real path and does one thing a player would do; the night shots use the creature's own AI). `cap.js` was the first version.
2. Serve the built game on port 8766 (`test2d_k.html`), then capture frames on a fake clock so the motion is smooth however slowly the browser renders:
   - `node cap.js full` captures every gameplay shot.
   - `ONLY=intro INTRO_END=18.0 node cap.js intro2` captures the cold open through the crash into the oak.
   - Add `preview` as a final argument to grab 3 frames per shot for checking framing.
2. Extract the game's pixel font (base64 in `src/fontdata.js`) to `hollowpixel.ttf`; it is drawn at its native 10 px and scaled by whole numbers.
3. `python3 music.py` writes `score.wav`. It is synthesised with numpy and timed to `tl.py`: rain, engine, thunder, the crash, a music-box waltz, drones, a heartbeat, the stinger, and the waltz again, out of tune.
4. `python3 edit.py` writes `hollow_acre_teaser.mp4` at 1920x1080, 30 fps, from the frames, the title cards and the score.

The edit (shots, cards and their lengths) lives in `tl.py`, and the picture and the score both read it.
