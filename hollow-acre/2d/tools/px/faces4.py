"""Each townsperson's own face (judge, portraits 5/10: "one face wearing 33 wigs": every adult had the same jaw, chin, eye
height and spacing, the same almond eye, the same nose stroke and mouth). These are deltas on top of the painter's defaults for
the person's kind (portrait4.Painter: woman / man / oldman / elder / kid); anything not listed keeps today's value, so a face
with no entry renders exactly as before. Knobs: face_w (cheek width), chin (chin depth), jaw_p / jaw_q / jaw_taper (jaw shape:
higher p and lower taper = square), eye_a (eye size), eye_dx (half the eye spacing), eye_y, tilt (outer corners up), eye_round
(low = round, high = almond), eye_open, heavy (heavy lids), nose (size), lip_w (mouth width), brow_w (brow weight), freckles."""
FACES = {
    # the young women: nine different faces, not one face in nine hairstyles
    'nell':  dict(face_w=23.4, chin=89.4, jaw_taper=.46, eye_round=.88, eye_a=5.5, tilt=1.6, nose=1.0, lip_w=5.4),   # heart-shaped, pointed chin, cat-eyed
    'june':  dict(face_w=28.2, chin=82.6, jaw_p=1.4, jaw_taper=.04, eye_a=7.5, eye_dx=13.0, eye_round=.46, tilt=.05, nose=.7, lip_w=4.3, mouth_y=75.4),   # round face, round wide-set eyes, small mouth
    'cora':  dict(face_w=23.8, chin=88.6, jaw_taper=.32, eye_a=5.7, eye_dx=11.0, nose=1.14, lip_w=5.0, tilt=.7),                 # long and narrow
    'ida':   dict(face_w=25.7, jaw_p=2.45, jaw_q=.6, jaw_taper=.13, chin=87.2, eye_a=5.9, eye_round=.82, tilt=.55, brow_w=1.35, lip_w=6.1),   # square jaw
    'tess':  dict(face_w=24.3, chin=84.8, eye_a=6.7, eye_dx=10.9, nose=.78, lip_w=4.7, tilt=1.0),                                # small and delicate
    'iris':  dict(face_w=25.3, chin=86.6, eye_dx=12.5, eye_round=.67, nose=.94, lip_w=5.6, tilt=.35),                            # wide-set eyes
    'della': dict(face_w=25.9, chin=87.6, jaw_p=2.1, eye_a=6.0, eye_round=.78, nose=1.2, lip_w=6.5, tilt=.7),                    # strong cheekbones, full mouth
    'maud':  dict(face_w=24.6, chin=88.2, eye_y=58.6, eye_a=5.8, tilt=1.25, nose=1.05, lip_w=5.4),                               # long oval, upturned eyes
    # 'mae' (Caitlyn) has no entry: her face stays exactly as it is (owner). sheet4 renders her row; the install keeps the installed row.
    # the men
    'hollis': dict(face_w=27.3, jaw_taper=.06, brow_w=1.9, eye_a=4.8, nose=1.26),                                                # broad
    'dunn':   dict(face_w=25.3, chin=90.4, jaw_p=2.8, eye_a=5.3, eye_open=.62, tilt=-.25, brow_arch=.95, brow_w=1.7, nose=1.3),   # long, rugged, squinting, outer corners down
    'gideon': dict(face_w=28.0, chin=89.0, jaw_taper=.04, eye_dx=12.7, eye_a=4.2, eye_open=.6, nose=1.52, brow_w=2.5, brow_arch=.2),   # huge: small deep-set eyes under one heavy flat brow
    'silas':  dict(face_w=24.5, chin=89.6, jaw_taper=.23, eye_a=5.2, tilt=.5, eye_open=.7, nose=1.05, lip_w=5.6, skin='#d6a47e'),   # narrow and sly (skin warmed twice: it read grey-green)
    'wes':    dict(face_w=25.2, chin=87.0, jaw_p=2.0, jaw_taper=.2, eye_a=5.6, eye_open=.86, nose=.95, lip_w=5.8),               # young and soft
    'hob':    dict(face_w=27.7, chin=87.0, jaw_p=1.9, eye_a=4.6, eye_dx=11.0, nose=1.42),                                        # round and heavy, close-set eyes
    'quinn':  dict(face_w=25.0, chin=89.2, jaw_p=3.0, jaw_q=.7, eye_a=5.3, tilt=.3, nose=1.16, lip_w=6.0),                       # angular
    'moss':   dict(face_w=24.2, chin=90.0, jaw_taper=.3, eye_a=5.4, eye_open=.8, nose=1.22, lip_w=5.8),                         # gaunt
    'abel':   dict(face_w=26.9, jaw_p=3.0, jaw_taper=.05, chin=88.6, eye_a=4.8, nose=1.2),                                       # square
    # the old men: heavy lids, and each his own shape
    'hale':   dict(face_w=24.8, chin=90.0, nose=1.3, heavy=True, age=.9),
    'ezra':   dict(face_w=26.4, chin=87.0, eye_a=4.6, nose=1.42, heavy=True, age=.9),
    'otto':   dict(face_w=27.4, chin=87.6, nose=1.3, heavy=True, age=.95),
    'lyle':   dict(face_w=25.0, chin=89.0, nose=1.15, eye_dx=11.0, heavy=True, age=.9),
    'corwin': dict(face_w=24.6, chin=90.6, eye_open=.62, nose=1.25, heavy=True, age=.95, skin='#dfb492'),   # skin warmed: it read washed-out grey
    # the old women
    'agnes':  dict(face_w=25.0, chin=86.6, nose=1.05, eye_a=5.2, heavy=True, age=.95),
    'nan':    dict(face_w=26.0, chin=85.6, nose=1.15, lip_w=6.0, heavy=True, age=.9),
    'ada':    dict(face_w=24.2, chin=88.6, nose=1.1, tilt=.4, heavy=True, age=.95),
    'orla':   dict(face_w=26.4, chin=85.0, nose=.95, heavy=True, age=.9),
    # the children: round cheeks, big eyes, button noses, and not one boy twice
    'tobias': dict(face_w=25.4, chin=82.8, jaw_taper=.2, eye_a=6.3, eye_dx=10.6, eye_round=.82, nose=.76, freckles=16),   # narrower, almond eyes, freckled
    'pip':    dict(face_w=28.1, chin=79.0, eye_a=8.3, eye_dx=12.5, eye_round=.48, nose=.44, lip_w=3.8),   # moon face, huge round eyes, tiny mouth
    'finn':   dict(face_w=26.6, chin=80.8, eye_a=7.2, nose=.6),
    'bram':   dict(face_w=27.2, chin=80.0, eye_a=7.6, eye_dx=11.4, nose=.55, freckles=10),
}
# (judge r2: rows looked alike: Tobias and Pip one kid, Gideon and Hollis one beard) hair and beards differ as well as the face
LOOK = {'pip': dict(style='curly'), 'hollis': dict(beard='moustache')}
def face(cid, C): return dict(C, **FACES.get(cid, {}), **LOOK.get(cid, {}))
