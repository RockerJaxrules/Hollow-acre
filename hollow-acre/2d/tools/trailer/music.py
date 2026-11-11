"""The teaser's score, numpy only — no samples, nobody else's sounds. Built for fear the way the research says:
   a lamp in the dark over wind and a close, calm breath and a low drone; a fragile music-box for the valley's lie;
   then the drone swells, a heartbeat quickens and a bowed screech climbs as the Hollow comes down over you; then
   EVERYTHING drops out for the held breath; then the stinger into the face; then a deep boom and a broken box.
   python3 music.py -> score.wav"""
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
import wave
from tl import timeline, at, FPS

SR = 44100
segs, TOT = timeline()
N = int((TOT + 1.2) * SR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)


def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def tt(d): return np.arange(int(d * SR)) / SR
def env(d, a, r, sus=1.0):
    t = tt(d); e = np.minimum(1, t / max(a, 1e-4)) * sus
    rel = np.clip((d - t) / max(r, 1e-4), 0, 1); return e * rel
def put(x, t0, g=1.0, pan=0.0):
    i = int(t0 * SR); x = x[:max(0, N - i)]
    if i < 0: x = x[-i:]; i = 0
    L[i:i + len(x)] += x * g * (1 - max(0, pan)); R[i:i + len(x)] += x * g * (1 + min(0, pan))
def hz(n): return 440 * 2 ** ((n - 69) / 12)
def saw(f, d): t = tt(d); return 2 * ((t * f) % 1) - 1
def sine(f, d, ph=0): return np.sin(2 * np.pi * f * tt(d) + ph)
def M(*xs):
    n = max(len(x) for x in xs); return sum(np.pad(x, (0, n - len(x))) for x in xs)


# ---------- instruments / textures
def musicbox(n, d=2.2, g=1.0):
    f = hz(n); t = tt(d)
    x = np.sin(2*np.pi*f*t)*np.exp(-t*3.2) + .35*np.sin(2*np.pi*f*3.01*t)*np.exp(-t*6) + .18*np.sin(2*np.pi*f*5.4*t)*np.exp(-t*11)
    x[:40] *= np.linspace(0, 1, 40); return x * g
def pad(ns, d, g=1.0):
    x = sum(lp(saw(hz(n)*(1+.003*k), d) + saw(hz(n)*(1-.004*k), d), 900) for k, n in enumerate(ns))
    return x * env(d, .6, .9) * g / len(ns)
def boom(d=3.0, f0=70, f1=28):
    t = tt(d); f = f1 + (f0 - f1) * np.exp(-t * 3); ph = 2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-t*1.4) + lp(rng.normal(0, 1, len(t)), 180)*np.exp(-t*6)*.9
def noiseburst(d, lo, hi, dec): t = tt(d); return bp(rng.normal(0, 1, len(t)), lo, hi) * np.exp(-t * dec)
def breath(d=2.2, pan=0.0, g=1.0):
    """a close, calm breath: an inhale that swells, a pause, a softer exhale — patient, in control"""
    t = tt(d); inh = np.exp(-((t-.5)/.34)**2); exh = .7*np.exp(-((t-1.5)/.42)**2)
    n = bp(rng.normal(0, 1, len(t)), 500, 1700); return n * (inh + exh) * g
def reverb(x, sec=2.6, wet=.35):
    t = tt(sec); ir = rng.normal(0, 1, len(t)) * np.exp(-t*3.2); ir = lp(ir, 5000); ir /= np.sqrt((ir**2).sum())
    return x * (1 - wet) + fftconvolve(x, ir)[:len(x)] * wet * 2.2


# ============ the cold open: a lamp in the black — wind, a low drone, a close breath
la0, la1b = at('lantern')              # first lantern segment start; the cold open runs to the first black after it
COLD_END = 6.2
wind = hp(lp(rng.normal(0, 1, int((COLD_END+.5)*SR)), 1800), 500) * .035
wind *= np.minimum(1, tt(COLD_END+.5)/1.5)
put(wind, la0-.2); put(wind[::-1]*.6, la0-.2, .7, .3)
put(lp(saw(hz(26), COLD_END-la0) + saw(hz(26)*1.007, COLD_END-la0) + .6*saw(hz(33), COLD_END-la0), 160) * env(COLD_END-la0, 2.4, .5) * .12, la0)   # a felt-not-heard low drone
put(breath(2.4, 0, .09), la0+1.0); put(breath(2.4, .15, .08), la0+3.4)        # someone, close, breathing slow
put(M(noiseburst(.14, 1600, 7000, 22)*.25, sine(1400, .07)*np.exp(-tt(.07)*26)*.12), 4.43)   # the subliminal frame: a small wrong tick

# ============ the lie: a fragile, warm, slightly sad music-box — one wrong note
mb0 = at('Marrow Hollow')[0]; CALM_END = 16.93
beat = .62
MEL = [(76, 1), (81, 1), (83, 2), (81, 1), (79, 2), (76, 1), (78, 1), (74, 3), (72, 1), (76, 1), (79, 2), (71, 2)]  # (72: the wrong note)
t = mb0 + .2; k = 0
while t < CALM_END - .3 and k < 80:
    n, ln = MEL[k % len(MEL)]
    put(musicbox(n, 2.2) * .2, t, 1, .12*np.sin(k))
    if k % 4 == 0: put(pad([n-12, n-7], 1.4, .4) * .18, t)
    t += ln * beat; k += 1
# it stops dead at the turn: a reversed swell into silence
sw = (np.exp(tt(.7)*4)-1)/(np.exp(2.8)-1)
put(lp(rng.normal(0, 1, len(sw)), 2600) * sw * .22, CALM_END-.7)

# ============ the turn + the hauntings: the drone swells, a heartbeat quickens, a screech climbs
ap0 = at('stalk')[0]              # the Hollow starts down over you here
sa, sb = at('scare')                 # the face
slam = sa + 0.06                     # the hit, right as we cut to the face
hush = slam - 2.0                    # the held breath: everything drops out here (the 2s black)
dd = hush - ap0 + .15
drone = lp(saw(hz(31), dd) + saw(hz(31)*1.008, dd) + .7*saw(hz(32), dd) + .5*saw(hz(38), dd), 360) * env(dd, 1.6, .12) * .15
put(drone, ap0-.2)
sub = (sine(24.5, dd) + .3*sine(37, dd)) * env(dd, 2.0, .15) * .18      # a sub rumble of dread
put(sub, ap0-.2)
# a heartbeat from the turn, quickening all the way to the drop-out
hb = ap0 + .3; per = 1.0
while hb < hush - .15:
    for off, gg in ((0, 1.0), (.17, .7)):
        put(lp(sine(50, .26)*np.exp(-tt(.26)*17), 150) * .62 * gg, hb + off)
    hb += per; per = max(.36, per*.9)
# a bowed screech, bandpassed, climbing in pitch and volume into the hush
scr_d = hush - (ap0 + .6)
f = np.linspace(900, 3000, int(scr_d*SR))
scr = bp(rng.normal(0, 1, len(f)), 800, 3600) * (np.sin(2*np.pi*np.cumsum(f)/SR)*.5+.5) * np.linspace(0, 1, len(f))**2
put(scr * .13, ap0 + .6, 1, .2)
# the breath comes back, closer, over the turn; and a per-cut tick at each haunting
put(breath(2.6, 0, .13), ap0 + .5)
for nm in ('well', 'corn_watch', 'chase'):
    T = at(nm)[0]
    put(M(saw(hz(91), .5)*env(.5, .002, .45)*.045, noiseburst(.4, 3500, 9000, 9)*.09), T+.05, 1, rng.uniform(-.5, .5))
    put(breath(1.6, rng.uniform(-.3, .3), .07), T+.2)
put(np.linspace(0, 1, int(.7*SR))**3 * lp(rng.normal(0, 1, int(.7*SR)), 5000) * .5, slam-.7)   # the breath in, just before

# ============ the button: the stinger into the face
stg = M(sum(saw(hz(n), 1.9) for n in (49, 61, 62, 68, 73, 74, 85, 86))/8 * env(1.9, .002, 1.6) * .5,
        noiseburst(1.2, 700, 11000, 3) * .8, boom(2.3, 120, 30) * .95,
        bp(rng.normal(0, 1, int(.55*SR)), 3000, 8000) * np.exp(-tt(.55)*7) * .55)      # cluster + crack + sub + shriek
put(stg * 2.7, slam)

# ============ the title: a deep boom, then the box again, slow and broken
ta, tb = at('title')
put(boom(5.0, 60, 23) * .9, ta + .1)
tm = ta + 1.4
for i, (n, ln) in enumerate(MEL[:5]):
    x = musicbox(n, 3.2); wob = 1 + .013*np.sin(tt(3.2)*5.5 + i)
    idx = np.clip((np.arange(len(x))*wob*.965).astype(int), 0, len(x)-1)
    put(reverb(x[idx], 2.8, .45) * .2, tm, 1, .1); tm += ln * beat * 1.6

# ---------- mix and write
mix = np.stack([L, R], 1)
mix = reverb(mix[:, 0], 1.6, .12)[:, None] * [1, 0] + reverb(mix[:, 1], 1.6, .12)[:, None] * [0, 1]
pk = np.abs(mix).max(); mix = np.tanh(mix / pk * 1.4) * .89
with wave.open('score.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print('score.wav', round(len(mix) / SR, 2), 's')
