# Produce an obfuscated distributable from the readable build: minify only the game's own <script>, keep the Trystero vendor and loader intact.
import re, subprocess, sys
src = sys.argv[1] if len(sys.argv)>1 else 'hollow-acre-2d.html'
out = sys.argv[2] if len(sys.argv)>2 else 'hollow-acre-2d.dist.html'
h = open(src).read()
# the game is the final <script> block (after the trystero vendor block)
scripts = list(re.finditer(r'<script>([\s\S]*?)</script>', h))
g = scripts[-1]
mini = subprocess.run(['node','minify.js'], input=g.group(1), capture_output=True, text=True)
if mini.returncode!=0:
    sys.stderr.write(mini.stderr[:400]); sys.exit(1)
h2 = h[:g.start(1)] + mini.stdout + h[g.end(1):]
open(out,'w').write(h2)
print('dist', len(h2), 'chars; code mangled')
