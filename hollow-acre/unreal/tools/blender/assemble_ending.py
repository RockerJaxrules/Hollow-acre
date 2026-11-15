"""Cut the ending cutscene together for viewing: the pixel drive (2d/tools/ending/render_pixel.py frames), the
realistic drive captured from Unreal (ShotDirector -capture), and the sound (tools/make_ending_audio.py), into one
H.264 MP4 with AAC sound, using Blender's video sequencer (Blender ships FFmpeg).

Run: blender -b --factory-startup --python assemble_ending.py -- <pixel frames> <unreal frames> <wav> <out.mp4> [height: 1080 or 720]
The realistic capture's first HOLD seconds are replaced by black: the game holds black there before the fade in.
"""
import os
import sys

import bpy

args = sys.argv[sys.argv.index('--') + 1:]
PIX_DIR, REAL_DIR, WAV, OUT = args[:4]
HEIGHT = int(args[4]) if len(args) > 4 else 1080
FPS = 30
HOLD = 1.5

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.fps = FPS
sc.view_settings.view_transform = 'Standard'   # pass the frames through untouched (the default AgX darkens them)
sc.view_settings.look = 'None'
sc.render.resolution_x, sc.render.resolution_y = HEIGHT * 16 // 9, HEIGHT
sc.render.resolution_percentage = 100
se = sc.sequence_editor_create()
strips = se.strips if hasattr(se, 'strips') else se.sequences


def image_strip(name, folder, first, count, channel, start):
    files = ['frame_%05d.png' % i for i in range(first, first + count)]
    s = strips.new_image(name=name, filepath=os.path.join(folder, files[0]), channel=channel, frame_start=start, fit_method='FIT')
    for f in files[1:]:
        s.elements.append(f)
    return s


n_pix = len([f for f in os.listdir(PIX_DIR) if f.startswith('frame_')])
n_real = len([f for f in os.listdir(REAL_DIR) if f.startswith('frame_')])
hold = int(HOLD * FPS)
image_strip('pixel', PIX_DIR, 0, n_pix, 1, 1)
black = strips.new_effect(name='hold black', type='COLOR', channel=1, frame_start=1 + n_pix, length=hold) \
    if 'length' in strips.new_effect.__doc__ else strips.new_effect(name='hold black', type='COLOR', channel=1, frame_start=1 + n_pix, frame_end=1 + n_pix + hold)
black.color = (0, 0, 0)
image_strip('real', REAL_DIR, hold, n_real - hold, 1, 1 + n_pix + hold)
strips.new_sound(name='sound', filepath=WAV, channel=2, frame_start=1)
sc.frame_start = 1
sc.frame_end = n_pix + n_real

r = sc.render
if hasattr(r.image_settings, 'media_type'):
    r.image_settings.media_type = 'VIDEO'
r.image_settings.file_format = 'FFMPEG'
r.ffmpeg.format = 'MPEG4'
r.ffmpeg.codec = 'H264'
r.ffmpeg.constant_rate_factor = 'HIGH' if HEIGHT >= 1080 else 'MEDIUM'
r.ffmpeg.ffmpeg_preset = 'GOOD'
r.ffmpeg.gopsize = FPS
r.ffmpeg.audio_codec = 'AAC'
r.ffmpeg.audio_bitrate = 192
r.ffmpeg.audio_channels = 'STEREO'
r.ffmpeg.audio_mixrate = 48000
r.filepath = OUT
r.use_file_extension = False
bpy.ops.render.render(animation=True)
print('assembled %s: %d frames (%.1f s)' % (OUT, sc.frame_end, sc.frame_end / FPS))
