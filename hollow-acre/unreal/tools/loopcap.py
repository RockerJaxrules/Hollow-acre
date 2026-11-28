"""Records what the PC is playing (the default speakers' loopback) to a WAV, for reference clips the listening model
(ears.py) compares our sound against. Study only: the clips stay in the scratch folder, never shipped or committed.

Run: <venv python> loopcap.py <out.wav> <seconds>
"""
import sys
import wave

import numpy as np
import soundcard as sc

out, secs = sys.argv[1], float(sys.argv[2])
spk = sc.default_speaker()
mic = sc.get_microphone(id=str(spk.name), include_loopback=True)
SR = 48000
with mic.recorder(samplerate=SR, channels=2) as rec:
    data = rec.record(numframes=int(secs * SR))
pcm = (np.clip(data, -1, 1) * 32767).astype('<i2')
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('recorded', out, '%.1f s from %s, peak %.3f' % (secs, spk.name, float(np.abs(data).max())))
