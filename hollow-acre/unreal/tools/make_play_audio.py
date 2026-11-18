"""Sound for Part 2 in play (after the wake): the wake's own mix up to the handover (make_wake_audio.py), then the night at
the bottom, laid on the moments the game logs ("CrashEvent <time> <kind> <value>"):
- the mountain's wind and the winter forest at night under everything;
- the player's own steps in the deep snow (walking, running, crouched), close and dry;
- the husk hunting (HuskHunter.cpp): its heavy steps in the snow, quieter with distance (value: cm); its gallop when it
  charges; its breath when it stalks near; the shriek as it charges (the crash's torn human shriek: a demon shriek, a man's
  scream through a torn throat, growls under it, de-squealed); at the catch a scream at the ear, then nothing;
- a heartbeat felt more than heard, rising with the director's menace gauge (value: 0-100);
- at the shed's window: the boards creaking and dragged under its hand (scrape), its growl as the light finds it (husk_hiss).
No voices from the player (captions only). Every sound a real recording (SourceArt/Audio/Recorded, CC0, SOURCES.md).

Run: python make_play_audio.py <unreal log> <length s> <out.wav> [<decoded recordings>]
"""
import sys

import numpy as np

import make_crash_audio as C
import make_ending_audio as A
import make_wake_audio as W

SR = C.SR
STEPS_WALK = 'footsteps/footsteps_deep_snow_steps_speeds_719624'
STEPS_RUN = 'footsteps/footsteps_running_on_frozen_snow_712022'
STEPS_HEAVY = 'footsteps/footsteps_heavy_steps_snow_543385'
STEPS_SLOW = 'footsteps/footsteps_deep_snow_heavy_slow_480621'
HEART = 'body/body_heartbeat_racing_after_exercise_455440'
BREATH = 'creature_extra/creature_extra_pug_close_breaths_snarls_377001'
CV = 'creature_voice/creature_voice_'
WOOD_HIT = 'wood/wood_tree_trunk_hit_branch_57927'
WOOD_CRACK = 'wood/wood_cracking_wood2_501303'
DOWNER = 'cine_hits/cine_hits_impact_downer_535554'
STING_LOOK = 'stingers/stingers_plucked_string_horror_725225'
STING_SCARE = 'stingers/stingers_violin_cymbal_jump_scare_436883'
CLICKS = 'aftermath/aftermath_engine_cooling_metal_click_613135'
DRONE = 'score_strings/score_strings_cellos_droning_509535'
SNAPS = 'wood/wood_branches_snapping_369986'
HISS = 'aftermath/aftermath_steam_hiss_bursts_438640'
CREAK = 'wood/wood_big_tree_fall_creak_494071'
GROWL = 'creature_extra/creature_extra_human_aggressive_growls_257358'
CRACK = 'wood/wood_wood_crack5_183450'
BOOM = 'cine_hits/cine_hits_cinematic_impact_177242'
BODY_FALL = 'snow_impact/snow_impact_body_falls_hard_snow_675895'
DOOR_SLAM = 'metal_impact/metal_impact_car_hood_slam_big_329516'
METAL_CREAK = 'foley_car/foley_car_creaking_metal_slow_stress_172411'


def onsets(name, n, dur=0.35, seed=1):
    """n short footfalls cut from a recording of steps: each a slice around a loud transient."""
    x = C.load(name)
    m = x.mean(0) if x.ndim == 2 else x
    env = np.convolve(np.abs(m), np.ones(256) / 256, mode='same')
    rng = np.random.default_rng(seed)
    out = []
    hop = int(0.12 * SR)
    peaks = [i for i in range(hop, len(env) - int(dur * SR), hop) if env[i] == env[i - hop // 2:i + hop // 2].max() and env[i] > env.mean() * 1.5]
    if not peaks:
        peaks = list(range(SR, len(env) - SR, SR))
    for k in range(n):
        p = peaks[rng.integers(0, len(peaks))]
        s = max(0, p - int(0.04 * SR))
        c = m[s:s + int(dur * SR)].copy()
        out.append(C.fade(np.stack([c, c]), 0.004, 0.08))
    return out


def shriek(seed=3):
    n = int(1.3 * SR)
    sh = np.zeros((2, n))
    for c, g in ((C.voice(CV + 'demon_shriek_433735', 1.35, 0.9, drive=3.0, fry=58.0, grit=0.3, many=True), 1.0),
                 (C.voice(CV + 'male_screams_556976', 1.35, 0.94, drive=3.0, fry=46.0, depth=0.42), 0.8),
                 (C.pitch(C.loudest('creature/creature_black_bear_angry_growl_763026', 1.3, pre=0.08), 0.75), 0.35)):
        c = c[:, :n]
        sh[:, :c.shape[1]] += C.level(C.fade(c, 0.015, 0.35), 0.1) * g
    return C.detone(sh)


def scream_close():
    """The catch: at the ear, the shriek and a man's scream torn, dry (no room: it is right there)."""
    n = int(1.6 * SR)
    x = np.zeros((2, n))
    for c, g in ((C.voice(CV + 'demon_shriek_433735', 1.6, 0.86, at=6.5, drive=3.2, fry=56.0, grit=0.32, seed=11, many=True), 1.0),
                 (C.voice('creature_extra/creature_extra_human_monster_screams_391552', 1.6, 0.92, drive=2.8, fry=50.0), 0.75)):
        c = c[:, :n]
        x[:, :c.shape[1]] += C.level(C.fade(c, 0.005, 0.5), 0.12) * g
    return C.detone(x)


def play(ev, total):
    first = lambda k, d=None: next((t for t, kk, v in ev if kk == k), d)
    t_play = first('play', None)
    wake_ev = [e for e in ev if t_play is None or e[0] < t_play + 0.5]
    mix = W.wake(wake_ev, total)
    if t_play is None:
        return mix
    M = C.Mix(total)
    M.x = mix
    # the night: wind and the forest, under everything from the handover on
    wind = C.steady(W.WIND_OUT, total - t_play + 1.0, skip=4.0)
    forest = C.steady(W.FOREST, total - t_play + 1.0, skip=8.0)
    M.bed(C.level(wind, 0.03), t_play, total, [(t_play, 0.0), (t_play + 1.5, 1.0), (total, 1.0)])
    M.bed(C.level(forest, 0.02), t_play, total, [(t_play, 0.0), (t_play + 2.0, 1.0), (total, 1.0)])
    walk = onsets(STEPS_WALK, 24, 0.35, 1)
    run = onsets(STEPS_RUN, 24, 0.3, 2)
    heavy = onsets(STEPS_HEAVY, 24, 0.45, 3)
    slow = onsets(STEPS_SLOW, 16, 0.5, 4)
    rng = np.random.default_rng(7)
    sh = shriek()
    sc = scream_close()
    breath = C.loudest(BREATH, 1.2, pre=0.05)
    breath = C.pitch(breath, 0.72)
    heart = C.steady(HEART, total - t_play + 1.0, skip=1.0)
    menace = [(t, v) for t, k, v in ev if k == 'menace']
    t_kill = [t for t, k, v in ev if k == 'husk_kill']
    for t, k, v in ev:
        if t < t_play:
            continue
        if k == 'step_walk':
            M.at(t, C.level(walk[rng.integers(0, len(walk))], 0.05), 1.0)
        elif k == 'step_run':
            M.at(t, C.level(run[rng.integers(0, len(run))], 0.07), 1.0)
        elif k == 'step_crouch':
            M.at(t, C.level(slow[rng.integers(0, len(slow))], 0.02), 1.0)
        elif k in ('husk_step', 'husk_gallop'):
            d = max(150.0, v)
            g = min(1.0, (400.0 / d) ** 1.2)
            c = heavy[rng.integers(0, len(heavy))]
            c = C.pitch(c, 0.78 if k == 'husk_step' else 0.7)
            M.at(t, C.level(c, 0.06 if k == 'husk_step' else 0.09), g)
        elif k == 'husk_breath':
            d = max(150.0, v)
            M.at(t, C.level(breath[:, :int(0.5 * SR)], 0.03), min(1.0, (500.0 / d) ** 1.3))
        elif k == 'husk_shriek':
            M.at(t, C.verb(sh, 1.4, 0.28), 1.0)
            # (close, in the shed or on the player: the strings stab with it)
            M.at(t - 0.05, C.level(C.loudest(STING_SCARE, 1.6, pre=0.03), 0.06), 1.0)
        elif k == 'bang':
            # something hits the shed's wall hard from outside: the boards boom and crack, the hit felt low
            hit = C.sumc(C.level(C.loudest(WOOD_HIT, 0.9, pre=0.02), 0.16), C.level(C.loudest(WOOD_CRACK, 0.8, pre=0.02), 0.06),
                         C.level(C.loudest(DOWNER, 1.8, pre=0.02), 0.07))
            M.at(t, C.verb(hit, 0.9, 0.2), 1.0)
        elif k == 'sighting_look':
            M.at(t, C.level(C.loudest(STING_LOOK, 2.5, pre=0.03), 0.035), 1.0)
        elif k == 'fire_lit':
            # the match flaring, then the stove's fire catching: small snaps and crackles, closer together as it takes,
            # and the draught's low roar in the pipe under them
            M.at(t + 0.15, C.level(C.loudest(HISS, 0.45, pre=0.01), 0.02), 1.0)
            snaps = onsets(SNAPS, 30, 0.12, 9)
            tt_ = t + 0.8
            while tt_ < total:
                catch = min(1.0, (tt_ - t) / 4.0)
                M.at(tt_, C.level(C.pitch(snaps[rng.integers(0, len(snaps))], rng.uniform(1.1, 1.6)), 0.012 + 0.012 * rng.random()), catch)
                tt_ += rng.uniform(0.08, 0.5) / (0.4 + catch)
            roar = C.steady(W.WIND_IN, total - t + 1.0, skip=3.0)
            roar = C.filt(roar, A.lp(400))
            M.bed(C.level(roar, 0.012), t, total, [(t, 0.0), (t + 4.0, 1.0), (total, 1.0)])
        elif k == 'scrape':
            # along the shed's back wall from outside: boards creaking under a weight leant on them, a dry drag of nails
            # (claws) over the wood; close, through the boards
            cr = C.pitch(C.loudest(CREAK, 1.3, pre=0.05), 1.35)
            M.at(t, C.verb(C.sumc(C.level(cr, 0.05), C.level(C.pitch(C.loudest(WOOD_CRACK, 0.5, pre=0.01), 1.6), 0.015)), 0.5, 0.15), 1.0)
        elif k == 'husk_hiss':
            # the light on its hand: a low torn growl through the boards as it pulls back, and the strings' stab
            M.at(t, C.verb(C.level(C.pitch(C.loudest(GROWL, 1.1, pre=0.03), 0.72), 0.09), 0.6, 0.2), 1.0)
            M.at(t - 0.04, C.level(C.loudest(STING_SCARE, 1.4, pre=0.03), 0.05), 1.0)
        elif k == 'rifle_shot':
            # a rifle fired out in the open behind: the crack, a boom under it, its echo off the valley's slopes rolling
            # away, and a ringing in the ears after (a stand-in built from the library's own recordings until a real
            # recorded rifle shot is in: queued for the owner's OK)
            crack = C.level(C.pitch(C.loudest(CRACK, 0.3, pre=0.004), 0.6), 0.45)
            boom = C.level(C.pitch(C.loudest(BOOM, 1.6, pre=0.01), 0.8), 0.2)
            shot = C.sumc(crack, boom)
            M.at(t, C.verb(shot, 2.2, 0.3), 1.0)
            for dt_, g in ((0.55, 0.22), (1.3, 0.12), (2.2, 0.06)):
                M.at(t + dt_, C.filt(C.verb(shot, 2.5, 0.6), A.lp(900)), g)
            n_ = int(3.2 * SR)
            ring = np.sin(2 * np.pi * 3900 * np.arange(n_) / SR) * np.exp(-np.arange(n_) / (1.2 * SR))
            M.at(t + 0.1, C.level(np.stack([ring, ring]), 0.006), 1.0)
        elif k == 'truck_door_bang':
            # the truck's door slammed in by the gust behind the player, close: the steel door's boom against the cab,
            # its latch rattle, the hinges groaning as it swings back off the frame, and the strings' stab with it
            slam = C.level(C.pitch(C.loudest(DOOR_SLAM, 1.1, pre=0.01), 0.85), 0.32)
            M.at(t + 0.2, C.verb(slam, 0.8, 0.18), 1.0)
            M.at(t + 0.35, C.level(C.pitch(C.loudest(METAL_CREAK, 1.6, pre=0.05), 1.25), 0.04), 1.0)
            M.at(t + 0.17, C.level(C.loudest(STING_SCARE, 1.5, pre=0.03), 0.06), 1.0)
        elif k == 'husk_down':
            # its body going down in the snow at a gallop: a heavy fall, the snow crushed under it
            M.at(t + 0.25, C.level(C.loudest(BODY_FALL, 1.4, pre=0.02), 0.16), 1.0)
        elif k == 'headlight_dies':
            M.at(t - 2.8, C.level(C.loudest(CLICKS, 3.0, pre=0.1), 0.02), 1.0)
        elif k == 'husk_kill':
            M.at(t + 0.1, sc, 1.3)
    if menace:
        ts = [t for t, v in menace]
        gs = [0.05 + 0.95 * (v / 100.0) ** 1.5 for t, v in menace]
        M.bed(C.level(heart, 0.035), t_play, total, list(zip(ts, gs)))
        # (a low cello drone under the hunt, swelling with the menace)
        drone = C.steady(DRONE, total - ts[0] + 1.0, skip=2.0)
        M.bed(C.level(drone, 0.03), ts[0], total, [(t, 0.15 + 0.85 * (v / 100.0)) for t, v in menace])
    # (after the catch: the black is silent but for the wind)
    for tk in t_kill:
        s, e = int((tk + 0.75) * SR), int((tk + 3.0) * SR)
        if s < M.n:
            M.x[:, s:min(e, M.n)] *= 0.15
    return M.x


def main():
    ev = C.parse(sys.argv[1])
    total = float(sys.argv[2])
    out = sys.argv[3]
    if len(sys.argv) > 4:
        C.CACHE = sys.argv[4]
    mix = play(ev, total)
    top = np.max(np.abs(mix))
    mix = 0.95 * np.tanh(mix / 0.95)
    A.write(out, mix)
    print('play sound: %.1f s, %d events, peak before the limit %.2f' % (total, len(ev), top))


if __name__ == '__main__':
    main()
