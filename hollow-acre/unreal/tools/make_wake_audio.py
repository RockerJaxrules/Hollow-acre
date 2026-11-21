"""Sound for Part 2's opening wake in the wreck (EndingWakeBeats.cpp, -wake), laid on the moments the game logs as it runs
("CrashEvent <time> <kind> <value>", on the capture's clock), with the crash's tools (make_crash_audio.py).

Quiet and close, the way Supermassive's horror scenes sit between the scares: the inside of the upturned car (its room
tone, the engine ticking as it cools, coolant dripping on metal, the wind through the gone windows), the ears still
ringing from the crash and fading, a heartbeat felt more than heard; every small sound of the body (the buckle, the
glass under the hands, the flashlight's switch) close and dry. The false scare: a heavy thump on the car under a low
hit, the heart quickening, snow sliding off past the window. Out in the open: the mountain's wind and the snow under
the hands and knees. A low drone under it all, swelling for the last look back up the chute. The driver makes no sound
(their lines are captions). Every sound is a real recording (SourceArt/Audio/Recorded, CC0, each one's source in
SOURCES.md); every glass and metal one de-whined (detone, dezing) so nothing in it squeaks.

Run: python hollow-acre/unreal/tools/make_wake_audio.py <unreal log with the CrashEvent lines> <length s> <out.wav>
     [<decoded recordings: HollowAcre/Saved/AudioCache>]
"""
import sys

import numpy as np

import make_crash_audio as C
import make_ending_audio as A

SR = C.SR
BELT = 'foley_car/foley_car_seatbelt_buckle_body_movement_848306'
SWITCH = 'cabin/cabin_izh412_blower_switch_879618'
SHARDS = 'foley_car/foley_car_glass_pieces_shards_181998'
TICKS = 'aftermath/aftermath_engine_cooldown_clicking_539514'
ROOM = 'aftermath/aftermath_in_car_room_tone_272393'
SNOW_SLIDE = 'snow_impact/snow_impact_snow_falling_from_trees_116136'
SNOW_CRUNCH = 'snow_impact/snow_impact_snow_block_crunch_450848'
SNOW_STEPS = 'footsteps/footsteps_deep_snow_heavy_slow_480621'
BODY_SNOW = 'snow_impact/snow_impact_body_falls_hard_snow_675895'
SLAM = 'metal_impact/metal_impact_car_hood_slam_big_329516'
RINGING = 'body/body_ear_ringing_after_explosion_365956'
WIND_IN = 'wind/wind_heavy_wind_inside_car_82267'
WIND_OUT = 'wind/wind_mountain_wind_alps_gusts_454092'
FOREST = 'night_ambience/night_ambience_winter_forest_night_378048'


def clean(x):
    """No squeak in it: held notes and quick glides pulled down."""
    return C.dezing(C.detone(x, lo=400.0, hi=9000.0, over=2.5, keep=1.3))


def snip(name, at, dur, pre=0.02):
    return C.seg(name, max(0.0, at - pre), dur)


def bsnip(at, dur, pre=0.02):
    """A stretch of the belt recording, de-whined (its clacks rang at ~11.6 kHz)."""
    return clean(snip(BELT, at, dur, pre))


def wake(ev, total):
    M = C.Mix(total)
    tt = np.arange(M.n) / SR
    first = lambda k, d=None: next((t for t, kk, v in ev if kk == k), d)
    t0 = first('wakeup', 1.6)
    t_out = first('out', t0 + 24.6)
    t_thump = first('thump', t0 + 15.62)
    t_land = first('land', t0 + 7.42)
    t_stand = first('stand', t0 + 28.4)
    rng = np.random.default_rng(17)

    # ---- the beds -------------------------------------------------------------------------------------------------------
    inside = [(0, 0.0), (t0, 0.6), (t0 + 2.5, 1.0), (t_out - 0.6, 1.0), (t_out + 1.2, 0.25), (total, 0.25)]
    M.bed(C.level(C.filt(C.steady(ROOM, total, skip=3), A.lp(2500)), 0.010), 0.0, total, inside)
    M.bed(C.level(C.pan(clean(C.steady(TICKS, total, skip=4)), -0.1), 0.016), 0.0, total,
          [(0, 0.0), (t0, 0.8), (t0 + 2, 1.0), (t_out, 0.9), (t_out + 2.0, 0.35), (total, 0.3)])
    # (the drips on metal pinged at ~5.2 kHz: low-passed and de-whined to a dull tick)
    M.bed(C.level(C.pan(clean(C.filt(C.steady(C.F_DRIP, total, skip=2), A.lp(2600))), 0.3), 0.006), 0.0, total, inside)
    M.bed(C.level(C.filt(C.steady(WIND_IN, total, skip=6), A.lp(1400)), 0.012), 0.0, total,
          [(0, 0.0), (t0, 0.7), (t_out - 1, 1.0), (t_out + 1.5, 0.0), (total, 0.0)])
    M.bed(C.level(clean(C.steady(WIND_OUT, total, skip=10)), 0.03), 0.0, total,
          [(0, 0.0), (t_out - 1.5, 0.05), (t_out + 0.8, 1.0), (total, 1.0)])
    M.bed(C.level(C.filt(C.steady(FOREST, total, skip=8), A.lp(6000)), 0.014), 0.0, total,
          [(0, 0.0), (t_out - 1.0, 0.0), (t_out + 1.5, 1.0), (total, 1.0)])
    # (no ringing in the ears here: a held tone, it read as a squeal)
    # a low drone under it all (cellos), lifting at the scare and at the last look up the chute
    drone = C.level(C.filt(C.steady(C.STR_CELLOS, total, skip=4), A.lp(900)), 0.007)
    M.bed(drone, 0.0, total, [(0, 0), (t0 + 1, 0.5), (t_thump - 0.2, 0.8), (t_thump + 0.5, 1.5), (t_thump + 5, 0.8),
                              (t_stand, 0.9), (t_stand + 3, 1.6), (total, 1.6)])
    M.bed(C.level(C.filt(C.steady(C.EXT_WATER, total, skip=6), A.lp(3000)), 0.004), 0.0, total,
          [(0, 0), (t_stand, 0), (t_stand + 3.5, 1.0), (total, 1.0)])

    # the heart: slow, then racing after the thump, settling as the body works its way out
    beat = C.one_beat()
    tb = t0 + 0.8
    while tb < t_stand + 4:
        g = 0.07 + 0.08 * np.exp(-max(0.0, tb - t_thump) / 4.0) * (tb > t_thump)
        M.at(tb, C.pan(C.peak(beat, g), 0.0))
        tb += 0.92 if tb < t_thump else 0.55 + 0.37 * min(1.0, (tb - t_thump) / 9.0)

    # ---- the body and the car ----------------------------------------------------------------------------------------------
    # blood dripping onto the roof lining as the head hangs
    for k, td in enumerate(np.arange(t0 + 1.2, t0 + 7.0, 1.1)):
        d = snip(C.F_DRIP, (0.48, 1.68, 3.72, 5.12, 6.82, 8.58)[k % 6], 0.2)
        M.at(td + rng.uniform(-0.2, 0.2), C.pan(C.peak(clean(C.filt(d, A.lp(2600))), 0.05), 0.1))
    T = {k: t for t, k, v in ev}
    if 'brace' in T:
        M.at(T['brace'] - 0.1, C.pan(C.peak(C.fade(C.filt(bsnip(1.2, 0.8), A.lp(4000)), 0.05, 0.3), 0.07), -0.3))
    for k, at in (('press1', 4.77), ('stuck', 5.15)):
        if k in T:
            M.at(T[k] - 0.01, C.pan(C.peak(C.filt(C.pitch(bsnip(at, 0.14), 0.88), A.lp(4500)), 0.16), 0.35))
    if 'push' in T:
        M.at(T['push'], C.pan(C.peak(C.fade(C.filt(bsnip(2.0, 0.9), A.lp(3500)), 0.1, 0.3), 0.08), 0.0))
    if 'release' in T:
        M.at(T['release'] - 0.01, C.pan(C.peak(bsnip(5.87, 0.18), 0.3), 0.35))
        M.at(T['release'] + 0.08, C.pan(C.peak(C.fade(C.filt(bsnip(6.0, 0.6), A.lp(5000)), 0.02, 0.3), 0.1), -0.2))
    # the drop: the body onto the roof, the glass under it
    M.at(t_land - 0.02, C.pan(C.peak(C.filt(C.fade(C.loudest(SLAM, 0.8, pre=0.02), 0.003, 0.4), A.lp(650)), 0.5), 0.0))
    M.at(t_land - 0.02, C.pan(C.peak(C.filt(C.fade(C.loudest(BODY_SNOW, 0.6, pre=0.02), 0.003, 0.3), A.lp(1200)), 0.4), 0.0))
    M.at(t_land, C.pan(C.peak(clean(snip(SHARDS, 4.29, 0.7)), 0.28), 0.2))
    M.at(t_land - 0.03, C.pan(C.peak(C.filt(C.seg(C.HIT_DOWNER, 0.0, 2.5), A.lp(400)), 0.18), 0.0))
    # glass under the elbow and the hands as they move on the lining
    for k, at, g, p in (('elbow', 8.59, 0.12, -0.2), ('reach', 14.4, 0.1, 0.3), ('grab', 16.19, 0.13, 0.4), ('turn', 24.14, 0.14, 0.0),
                        ('crawl1', 11.71, 0.11, -0.3), ('crawl2', 14.8, 0.1, 0.2), ('crawl3', 16.56, 0.12, -0.4), ('crawl4', 17.58, 0.1, 0.1)):
        if k in T:
            M.at(T[k] - 0.02, C.pan(C.peak(C.fade(clean(snip(SHARDS, at, 0.45)), 0.005, 0.2), g), p))
    # the flashlight's switch: the click, the contact stuttering, catching
    for k, at, g in (('click', 0.77, 0.24), ('flicker', 1.70, 0.08), ('beam', 1.91, 0.06)):
        if k in T:
            M.at(T[k] - 0.005, C.pan(C.peak(C.filt(snip(SWITCH, at, 0.09, pre=0.01), A.lp(7000)), g), 0.25))

    # ---- the false scare: a heavy thump on the car, under a low hit; snow sliding off past the window ------------------------
    M.at(t_thump - 0.02, C.pan(C.peak(C.filt(C.fade(C.loudest(SLAM, 1.0, pre=0.02), 0.002, 0.6), A.lp(900)), 0.78), 0.55))
    M.at(t_thump - 0.01, C.pan(C.peak(C.filt(C.fade(C.load(SNOW_CRUNCH), 0.002, 0.2), A.lp(2500)), 0.35), 0.6))
    M.at(t_thump - 0.03, C.pan(C.peak(C.seg(C.HIT_DOWNER, 0.0, 3.0), 0.42), 0.0))
    M.at(t_thump - 0.03, C.pan(C.peak(C.filt(C.seg(C.HIT_BOOM, 0.0, 3.0), A.lp(180)), 0.3), 0.0))
    if 'snowslide' in T:
        M.at(T['snowslide'] - 0.05, C.pan(C.peak(C.fade(C.filt(snip(SNOW_SLIDE, 46.2, 0.9, pre=0.15), A.lp(6000)), 0.05, 0.4), 0.3), 0.7))
    if 'snowland' in T:
        M.at(T['snowland'] - 0.01, C.pan(C.peak(C.fade(C.load(SNOW_CRUNCH), 0.002, 0.2), 0.42), 0.7))
        M.at(T['snowland'] + 0.2, C.pan(C.peak(C.filt(C.fade(C.load(SNOW_CRUNCH), 0.002, 0.2), A.lp(2000)), 0.18), 0.8))

    # ---- out into the snow: the hands and knees in it, getting up -------------------------------------------------------------
    steps = C.load(SNOW_STEPS)
    env = np.abs(steps.mean(0))
    w = int(0.05 * SR)
    env = np.convolve(env, np.ones(w) / w, 'same')
    peaks = []
    i = int(1.0 * SR)
    while i < env.shape[0] - SR and len(peaks) < 12:
        j = i + int(1.2 * SR)
        k = i + int(np.argmax(env[i:j]))
        peaks.append(k / SR)
        i = j
    for n_, k in enumerate(('crawl5', 'crawl6', 'crawl7', 'crawl8', 'kneel', 'stand')):
        if k in T:
            at = peaks[n_ % len(peaks)] if peaks else 2.0
            g = 0.2 if k.startswith('crawl') else 0.26
            M.at(T[k] - 0.05, C.pan(C.peak(C.fade(C.filt(snip(SNOW_STEPS, at, 0.55, pre=0.08), A.lp(5000)), 0.01, 0.25), g), (-0.2, 0.2)[n_ % 2]))
    if 'stand' in T:
        M.at(T['stand'] + 0.6, C.pan(C.peak(C.fade(C.filt(bsnip(1.6, 0.7), A.lp(4000)), 0.05, 0.3), 0.06), 0.0))
    return M.x


def main():
    ev = C.parse(sys.argv[1])
    total = float(sys.argv[2])
    out = sys.argv[3]
    if len(sys.argv) > 4:
        C.CACHE = sys.argv[4]
    mix = wake(ev, total)
    top = np.max(np.abs(mix))
    mix = 0.95 * np.tanh(mix / 0.95)
    A.write(out, mix)
    print('wake sound: %.1f s, %d events, peak before the limit %.2f' % (total, len(ev), top))


if __name__ == '__main__':
    main()
