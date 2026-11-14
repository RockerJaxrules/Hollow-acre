# Competitive-mode trailer

A gameplay trailer for the competitive mode, cut from real game footage.

- `scen.js`: the demo match. It is a world played against each other, with you (Jax) against a friend (Sam), the Vance orchard and the Dunn boys. Both players have a shop on the square, and a few market days have already run.
- `cap.js`: captures every shot frame by frame on a fake clock, at 1280x720 and 2x scale. Each shot is either a world shot (the farm, the square, the corn at night) or a UI shot worked by a pixel cursor (the Grange board and the three ledger tabs). Run it as `node cap.js <outdir> [preview]`; the game must be served at `localhost:8766/test2d_k.html`.
- `tl.py`: the edit. Both the picture and the score read this one list.
- `music.py`: the score, made with numpy only. Run `python3 music.py` to write `score.wav`.
- `edit.py`: builds the cards in the game's pixel font (`hollowpixel.ttf` from `../trailer`), crops the UI shots, and writes `hollow_acre_compete.mp4`.

The output is in `../../media/hollow_acre_compete.mp4`.
