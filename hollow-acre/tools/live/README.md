# Live work log

The owner follows Part 2 work on the **Hands Work Log** page: https://claude.ai/artifact/Skbhh8Gwtk1xkZhWEthjbt
(an Artifact owned by the owner). Keep it updated whenever new renders or in-game screenshots exist.

## Update it
1. Put the newest renders or screenshots in one folder. Subfolders like `r7/` are read as round names, and `page/`
   holds in-game frames.
2. Write a one-paragraph `status.txt` in plain words: what changed and what's next.
3. Build:
   `python3 hollow-acre/tools/live/build_live.py --renders <folder> --site <out> --status status.txt`
4. Publish `<out>/index.html` with every `<out>/img/*.jpg` as files.
   - In this session: the Artifact tool, `file_path=<out>/index.html`, `files={"img/00.jpg": ...}`.
   - In a NEW session: first read the page with `Artifact action:"read" url:<link>`, then publish with `url:<link>` so
     the link stays the same.
5. When the blind judge scores a round, add its scores to the table in `template.html`.

The page always opens with the newest in-game frames, under "In the game right now". The owner wants to see what
players see, not only offline renders.
