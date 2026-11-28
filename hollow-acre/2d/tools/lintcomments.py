# Fails the build when a // comment has swallowed code on the same line (the game's sources are long one-line statements,
# and a comment dropped mid-line silently turns everything after it into comment: #276 hid every stone and weed in Grandpa's
# field this way, and two more were found by this check).
import re,glob,sys
def scan(files):
    hits=[]
    for f in files:
        for n,line in enumerate(open(f,encoding='utf8'),1):
            i=0;q=None;esc=False;cpos=-1
            while i<len(line):
                c=line[i]
                if q:
                    if esc:esc=False
                    elif c=='\\':esc=True
                    elif c==q:q=None
                else:
                    if c in '"\'`':q=c
                    elif line.startswith('//',i) and line[max(0,i-1)]!=':':cpos=i;break
                i+=1
            if cpos<0:continue
            com=line[cpos+2:]
            if re.search(r"\)\s*continue;|\bif\(|\bfor\(|\bconst \w+=|\blet \w+=|\}\s*else\b|\w+\([^)]*\);\s*\w+\(",com):hits.append(f"{f}:{n}: //{com.strip()[:140]}")
    return hits
if __name__=='__main__':
    h=scan([f for f in sorted(glob.glob('g2d/*.js')) if not f.endswith(('trystero.iife.js','fontdata.js'))])
    if h:print('COMMENT SWALLOWS CODE:\n'+'\n'.join(h));sys.exit(1)
    print('comments ok')
