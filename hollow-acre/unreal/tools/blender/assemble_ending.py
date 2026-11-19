"""Cut the ending cutscene together for viewing, using Blender's video sequencer (Blender ships FFmpeg): the story
half captured from the game (2d/tools/ending/capture_story.py), the pixel drive up the mountain
(2d/tools/ending/render_pixel.py), the realistic drive captured from Unreal (ShotDirector -capture), and the sound
(tools/make_ending_audio.py), into one H.264 MP4 with AAC sound.

Run: blender -b --factory-startup --python assemble_ending.py -- <out.mp4> <wav> <height 1080|720> <segment> ...
A segment is a folder of frame_00000.png/.jpg frames (all of them), 'folder#N' (skip its first N frames), or 'black:N'
(N black frames). The realistic capture starts with the game's held black, so it is given as black:45 then folder#45.
"""
import os
import sys

import bpy

args = sys.argv[sys.argv.index('--') + 1:]
OUT, WAV, HEIGHT = args[0], args[1], int(args[2])
SEGS = args[3:]
FPS = int(os.environ.get("HA_FPS", "30"))

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.fps = FPS
sc.view_settings.view_transform = 'Standard'   # pass the frames through untouched (the default AgX darkens them)
sc.view_settings.look = 'None'
sc.render.resolution_x, sc.render.resolution_y = HEIGHT * 16 // 9, HEIGHT
sc.render.resolution_percentage = 100
se = sc.sequence_editor_create()
strips = se.strips if hasattr(se, 'strips') else se.sequences

at = 1
for k, seg in enumerate(SEGS):
    if seg.startswith('black:'):
        n = int(seg[6:])
        try:
            b = strips.new_effect(name='black%d' % k, type='COLOR', channel=1, frame_start=at, length=n)
        except TypeError:
            b = strips.new_effect(name='black%d' % k, type='COLOR', channel=1, frame_start=at, frame_end=at + n)
        b.color = (0, 0, 0)
        at += n
        continue
    folder, skip = (seg.split('#') + ['0'])[:2]
    files = sorted(f for f in os.listdir(folder) if f.startswith('frame_') and f.endswith(('.png', '.jpg')))[int(skip):]
    s = strips.new_image(name='seg%d' % k, filepath=os.path.join(folder, files[0]), channel=1, frame_start=at, fit_method='FIT')
    for f in files[1:]:
        s.elements.append(f)
    at += len(files)
    print('segment %d: %s, %d frames' % (k, os.path.basename(folder.rstrip('/\\')), len(files)))
strips.new_sound(name='sound', filepath=WAV, channel=2, frame_start=1)
sc.frame_start = 1
sc.frame_end = at - 1

r = sc.render
if hasattr(r.image_settings, 'media_type'):
    r.image_settings.media_type = 'VIDEO'
r.image_settings.file_format = 'FFMPEG'
r.ffmpeg.format = 'MPEG4'
r.ffmpeg.codec = 'H264'
r.ffmpeg.constant_rate_factor = 'HIGH' if HEIGHT >= 1080 else 'MEDIUM' if HEIGHT >= 720 else 'LOW'   # small copies for the web page
if os.environ.get('HA_CRF'):        # (e.g. VERYLOW: a long play run small enough for the web page's 20 MB)
    r.ffmpeg.constant_rate_factor = os.environ['HA_CRF']
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
