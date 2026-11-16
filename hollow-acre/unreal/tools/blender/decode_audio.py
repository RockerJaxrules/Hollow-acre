"""Decode the recorded sound effects (SourceArt/Audio/Recorded/**: MP3, OGG, FLAC, WAV) to 48 kHz 16-bit stereo WAV
for the crash's sound mix (make_crash_audio.py reads them with numpy). Uses Blender's own audio library (Audaspace),
so no other tools are needed.

Run: blender -b --factory-startup --python decode_audio.py -- <SourceArt/Audio/Recorded> <Saved/AudioCache>
"""
import os
import sys

import aud

ARGS = sys.argv[sys.argv.index('--') + 1:]
SRC, DST = os.path.abspath(ARGS[0]), os.path.abspath(ARGS[1])
n = 0
for root, _, files in os.walk(SRC):
    for f in sorted(files):
        if os.path.splitext(f)[1].lower() not in ('.mp3', '.ogg', '.flac', '.wav'):
            continue
        src = os.path.join(root, f)
        out = os.path.join(DST, os.path.relpath(root, SRC), os.path.splitext(f)[0] + '.wav')
        if os.path.exists(out) and os.path.getmtime(out) > os.path.getmtime(src):
            continue
        os.makedirs(os.path.dirname(out), exist_ok=True)
        try:
            snd = aud.Sound(src).resample(48000, True)
            snd.write(out, rate=48000, channels=aud.CHANNELS_STEREO, format=aud.FORMAT_S16,
                      container=aud.CONTAINER_WAV, codec=aud.CODEC_PCM)
            n += 1
        except Exception as e:
            # some files only decode at their own rate and channel count (the mix resamples them)
            try:
                snd = aud.Sound(src)
                rate, ch = snd.specs
                snd.write(out, rate=int(rate), channels=ch, format=aud.FORMAT_S16, container=aud.CONTAINER_WAV,
                          codec=aud.CODEC_PCM)
                n += 1
                print('decoded at its own rate (%d Hz, %d ch): %s' % (rate, ch, src))
            except Exception as e2:
                # and some stumble on their last partial frame: leave the final few milliseconds off
                try:
                    snd = aud.Sound(src)
                    rate, ch = snd.specs
                    snd = snd.limit(0.0, max(0.1, snd.length / rate - 0.06)).resample(48000, True)
                    snd.write(out, rate=48000, channels=aud.CHANNELS_STEREO, format=aud.FORMAT_S16,
                              container=aud.CONTAINER_WAV, codec=aud.CODEC_PCM)
                    n += 1
                    print('decoded without its last frame: %s' % src)
                except Exception as e3:
                    print('decode failed: %s: %s / %s / %s' % (src, e, e2, e3))
print('decoded %d file(s) into %s' % (n, DST))
