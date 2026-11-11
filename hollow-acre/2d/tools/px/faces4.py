"""Each townsperson's own face (judge, portraits 5/10: "one face wearing 33 wigs": every adult had the same jaw, chin, eye
height and spacing, the same almond eye, the same nose stroke and mouth). These are deltas on top of the painter's defaults for
the person's kind (portrait4.Painter: woman / man / oldman / elder / kid); anything not listed keeps today's value, so a face
with no entry renders exactly as before. Knobs: face_w (cheek width), chin (chin depth), jaw_p / jaw_q / jaw_taper (jaw shape:
higher p and lower taper = square), eye_a (eye size), eye_dx (half the eye spacing), eye_y, tilt (outer corners up), eye_round
(low = round, high = almond), eye_open, heavy (heavy lids), nose (size), lip_w (mouth width), brow_w (brow weight), freckles."""
FACES = {
    # the young women: nine different faces, not one face in nine hairstyles
    'nell':  dict(eye_round=.66, tilt=1.15, lip_w=5.8),                                   # heart-shaped, cat-eyed
    'june':  dict(face_w=26.3, chin=84.5, jaw_p=1.6, jaw_taper=.16, eye_a=6.7, eye_round=.6, tilt=.45, nose=.84, lip_w=5.2),   # round and soft
    'cora':  dict(face_w=23.8, chin=88.6, jaw_taper=.32, eye_a=5.7, eye_dx=11.0, nose=1.14, lip_w=5.0, tilt=.7),                 # long and narrow
    'ida':   dict(face_w=25.7, jaw_p=2.45, jaw_q=.6, jaw_taper=.13, chin=87.2, eye_a=5.9, eye_round=.82, tilt=.55, brow_w=1.35, lip_w=6.1),   # square jaw
    'tess':  dict(face_w=24.3, chin=84.8, eye_a=6.7, eye_dx=10.9, nose=.78, lip_w=4.7, tilt=1.0),                                # small and delicate
    'iris':  dict(face_w=25.3, chin=86.6, eye_dx=12.5, eye_round=.67, nose=.94, lip_w=5.6, tilt=.35),                            # wide-set eyes
    'della': dict(face_w=25.9, chin=87.6, jaw_p=2.1, eye_a=6.0, eye_round=.78, nose=1.2, lip_w=6.5, tilt=.7),                    # strong cheekbones, full mouth
    'maud':  dict(face_w=24.6, chin=88.2, eye_y=58.6, eye_a=5.8, tilt=1.25, nose=1.05, lip_w=5.4),                               # long oval, upturned eyes
    'mae':   dict(face_w=25.9, chin=85.0, eye_a=6.4, eye_round=.6, tilt=.3, nose=.9, lip_w=6.0),                                 # round, level eyes
    # the men
    'hollis': dict(face_w=27.3, jaw_taper=.06, brow_w=1.9, eye_a=4.8, nose=1.26),                                                # broad
    'dunn':   dict(face_w=25.3, chin=90.2, jaw_p=2.8, eye_a=4.9, eye_open=.66, brow_w=1.85, nose=1.3),                           # long, rugged, squinting
    'gideon': dict(face_w=27.9, chin=89.0, jaw_taper=.04, eye_dx=12.2, eye_a=4.6, nose=1.36, brow_w=2.0),                        # huge
    'silas':  dict(face_w=24.5, chin=89.6, jaw_taper=.23, eye_a=5.2, tilt=.5, eye_open=.7, nose=1.05, lip_w=5.6, skin='#caa082'),   # narrow and sly (skin warmed: it read grey-green)
    'wes':    dict(face_w=25.2, chin=87.0, jaw_p=2.0, jaw_taper=.2, eye_a=5.6, eye_open=.86, nose=.95, lip_w=5.8),               # young and soft
    'hob':    dict(face_w=27.7, chin=87.0, jaw_p=1.9, eye_a=4.6, eye_dx=11.0, nose=1.42),                                        # round and heavy, close-set eyes
    'quinn':  dict(face_w=25.0, chin=89.2, jaw_p=3.0, jaw_q=.7, eye_a=5.3, tilt=.3, nose=1.16, lip_w=6.0),                       # angular
    'moss':   dict(face_w=24.2, chin=90.0, jaw_taper=.3, eye_a=5.4, eye_open=.8, nose=1.22, lip_w=5.8),                         # gaunt
    'abel':   dict(face_w=26.9, jaw_p=3.0, jaw_taper=.05, chin=88.6, eye_a=4.8, nose=1.2),                                       # square
    # the old men: heavy lids, and each his own shape
    'hale':   dict(face_w=24.8, chin=90.0, nose=1.3, heavy=True),
    'ezra':   dict(face_w=26.4, chin=87.0, eye_a=4.6, nose=1.42, heavy=True),
    'otto':   dict(face_w=27.4, chin=87.6, nose=1.3, heavy=True),
    'lyle':   dict(face_w=25.0, chin=89.0, nose=1.15, eye_dx=11.0, heavy=True),
    'corwin': dict(face_w=24.6, chin=90.6, eye_open=.62, nose=1.25, heavy=True),
    # the old women
    'agnes':  dict(face_w=25.0, chin=86.6, nose=1.0, eye_a=5.2, heavy=True),
    'nan':    dict(face_w=26.0, chin=85.6, nose=1.15, lip_w=6.0, heavy=True),
    'ada':    dict(face_w=24.2, chin=88.6, nose=1.1, tilt=.4, heavy=True),
    'orla':   dict(face_w=26.4, chin=85.0, nose=.95, heavy=True),
    # the children: round cheeks, big eyes, button noses, and not one boy twice
    'tobias': dict(face_w=26.0, chin=81.6, eye_a=7.0, eye_dx=11.0, nose=.66, freckles=True),
    'pip':    dict(face_w=27.7, chin=79.4, eye_a=7.9, eye_dx=12.1, nose=.5),
    'finn':   dict(face_w=26.6, chin=80.8, eye_a=7.2, nose=.6),
    'bram':   dict(face_w=27.2, chin=80.0, eye_a=7.6, eye_dx=11.4, nose=.55, freckles=True),
}
def face(cid, C): return dict(C, **FACES.get(cid, {}))
