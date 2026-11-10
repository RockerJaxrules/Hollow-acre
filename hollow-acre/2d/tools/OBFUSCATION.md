# Shipping an obfuscated build

The editable source lives in `src/` (and the dev copies in the scratchpad). It stays readable so it
can be worked on. The real protection against others reading it is keeping this repository private —
access control, not obfuscation, is what actually hides source.

The build that ships to players (`index.html`, and the published artifact) is obfuscated so the code
out in the world cannot be casually read or copied:

    python3 tools/mkdist.py <readable-build>.html index.html   # minifies the game's own <script> with tools/minify.js (terser)

What this does: every function body, parameter and local variable is renamed to single letters, all
comments are removed and the formatting is collapsed. A few top-level function names that the modules
share by name are left as labels (renaming them would break the game); their logic is still unreadable.
The MIT-licensed Trystero vendor block is left intact with its licence, as its licence requires.

Honest limit: no browser game can be made truly uncopyable. Anything the browser runs can be
recovered by a determined person. This is a strong deterrent, not a lock.
