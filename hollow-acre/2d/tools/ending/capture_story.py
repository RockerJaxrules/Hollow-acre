"""Capture the new ending's story half from the real game: the letter, the goodbye, the drive out (src/ending_story.js),
played in headless Chrome on a virtual clock, one screenshot per frame at 30 fps. Lines are read at a natural pace
(the advance a player would tap), the letter is held long enough to read. Writes the frames and events.json (when the
lines, the letter, the engine and the fade happen) for the sound.

Run (Python 3):  python hollow-acre/2d/tools/ending/capture_story.py <out folder> [spouse id, default june | none]
"""
import json
import os
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import cdp

ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
FPS = 30


def main():
    out = sys.argv[1]
    spouse = sys.argv[2] if len(sys.argv) > 2 else 'june'
    spouse = None if spouse == 'none' else spouse
    os.makedirs(out, exist_ok=True)
    for f in os.listdir(out):
        if f.startswith('frame_'):
            os.remove(os.path.join(out, f))
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8767', '--bind', '127.0.0.1', '--directory', ROOT],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    c = cdp.Chrome(1920, 1080)
    try:
        c.goto('http://127.0.0.1:8767/index.html')
        c.wait("window.__game&&__game.S&&__game.S.mode==='title'", 180)
        c.js("document.getElementById('begin').click()")
        time.sleep(0.6)
        c.js("(()=>{const b=document.getElementById('cGo');b&&b.click();return 1})()")
        time.sleep(0.6)
        for _ in range(12):
            c.js("(()=>{try{__game.skip()}catch(e){}return 1})()")
            time.sleep(0.25)
        time.sleep(1.5)
        # the state after the finale: the farm settled, the car fixed, married (if so), dusk
        setup = '''(()=>{S.tut&&(S.tut.off=true);document.querySelectorAll('#tut,#maecard').forEach(e=>e.style.display='none');
          S.readLetter=true;S.carFixed=true;S.looped=true;S.rom=S.rom||{};%s
          S.hour=17.4;S.storm=false;S.room=null;P.x=.2;P.z=-6;P.dir='S';
          try{document.getElementById('toast').style.display='none'}catch(e){}
          if(typeof carShow==='function')carShow();
          ['hud','buttons','hotbar','topBar'].forEach(id=>{const e=document.getElementById(id);if(e)e.hidden=true;});try{ui.obj.hidden=true}catch(e){}
          fade(1);return [BEATEN.o&&BEATEN.o.x,BEATEN.o&&BEATEN.o.z];})()''' % (
            ("S.rom.%s=Object.assign(S.rom.%s||{},{married:1});" % (spouse, spouse)) if spouse else '')
        print('setup', c.js("JSON.stringify(__game.ev(%s))" % json.dumps(setup)))
        time.sleep(1.0)
        src = open(os.path.join(ROOT, 'src', 'ending_story.js'), encoding='utf-8').read()
        c.js("__game.ev(%s)" % json.dumps('window.__ending=(function(){' + src + '\nreturn {endingStory};})();1'))
        print('vclock', c.js(cdp.VCLOCK_JS))
        c.js("__step(900)")                      # start on black (the stage fades in from it)
        t0 = c.js("performance.now()")
        c.js("window.__evlog=[];window.__done=0;__ending.endingStory({spouse:%s,log:(k,d)=>__evlog.push([performance.now(),k,d||null]),done:()=>{window.__done=performance.now()}});1"
             % json.dumps(spouse))
        # the game's own names (STG, stgNext) live inside its script: reach them through its debug hook
        state_js = "__game.ev(%s)" % json.dumps('''(()=>{const r={done:window.__done,note:!document.getElementById('note').hidden};if(!STG||STG.i<0)return r;
          const b=STG.def.beats[STG.i]||{};r.i=STG.i;r.text=b.text?b.text.length:0;r.typed=STG.typed;r.cap=document.getElementById('stgCap').classList.contains('on');
          r.moving=Object.keys(STG.movers).length;return r;})()''')
        typed_at = None
        note_at = None
        last_i = None
        frame = 0
        done_frame = None
        while frame < FPS * 150:
            c.js("__step(%f)" % (1000.0 / FPS))
            st = c.js(state_js) or {}
            now = frame / FPS
            if st.get('note'):
                note_at = now if note_at is None else note_at
                if now - note_at > 9.0:
                    c.js("document.getElementById('noteClose').click();1")
                    note_at = None
            else:
                note_at = None
            if st.get('i') != last_i:
                last_i, typed_at = st.get('i'), None
            if st.get('text') and st.get('cap') and st.get('typed', 0) >= st['text']:
                typed_at = now if typed_at is None else typed_at
                if now - typed_at > 1.5 + st['text'] / 17.0:
                    c.js("__game.ev('stgNext();1')")
                    typed_at = None
            c.shot(os.path.join(out, 'frame_%05d.jpg' % frame), 'jpeg', 93)
            frame += 1
            if st.get('done') and done_frame is None:
                done_frame = frame
            if done_frame is not None and frame > done_frame + 15:
                break
            if frame % 150 == 0:
                print('frame', frame, st)
        ev = c.js("__evlog")
        events = [[(t - t0) / 1000.0, k, d] for t, k, d in ev]
        json.dump({'fps': FPS, 'frames': frame, 'events': events}, open(os.path.join(out, 'events.json'), 'w'), indent=1)
        print('story: %d frames (%.1f s), %d events' % (frame, frame / FPS, len(events)))
    finally:
        c.close()
        srv.terminate()


if __name__ == '__main__':
    main()
