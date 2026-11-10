"""Install hand-drawn cabin furniture (furn_hd.js output): python3 install_fhd.py <kind>... [--views]
out/hd_<kind>_S.png -> <sprite>.png (+ hd_<kind>_S_night -> <sprite>_n.png when drawn); with --views also hd_<kind>_E -> <sprite>_e,
hd_<kind>_N -> <sprite>_bk and hd_<kind>_W -> <sprite>_w when drawn (otherwise the game mirrors _e). Old art goes to
spr/backup_v2/furn_old/ first (only the first time)."""
import sys, os, json, shutil
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); GAME = os.path.abspath(os.path.join(HERE, '..', '..'))
BUILD = os.environ.get('HA_SCRATCH', '/tmp/claude-0/-home-user-Minecraftbot/f193b802-e794-5104-89ce-994e8f157fdf/scratchpad')
SPR = {'bookcase': 'in_shelf_books', 'desk': 'in_desk', 'table': 'in_table', 'clock': 'in_clock', 'keg': 'in_keg', 'cradle': 'in_cradle',
       'piano': 'in_piano', 'chess': 'in_chess', 'rocker': 'in_rockS', 'jars': 'in_shelf_jars', 'crates': 'in_crates', 'globe': 'in_globe',
       'candles': 'in_candles', 'lamp': 'in_oillamp', 'rug': 'in_rug',
       'beda': 'in_bed', 'bedb': 'in_bed_b', 'bedc': 'in_bed_c', 'bedd': 'in_bed_d', 'bede': 'in_bed_e', 'wardrobe': 'in_wardrobe', 'cabinet': 'in_cabinet', 'stove': 'in_stove',
       'counter': 'in_counter', 'kcounter': 'in_kcounter', 'cans': 'in_shelf_cans', 'mail': 'in_shelf_mail', 'parts': 'in_shelf_parts', 'filecab': 'in_filecab',
       'schooldesk': 'in_schooldesk', 'stool': 'in_stool', 'lamp_st': 'lamp', 'pew': 'in_pew', 'toolbox': 'in_toolbox', 'coffin': 'in_coffin',
       'mirror': 'in_mirror', 'painting_a': 'in_painting_a', 'painting_b': 'in_painting_b', 'calendar': 'in_calendar', 'photowall': 'in_photowall', 'coatpegs': 'in_coatpegs',
       'poster_lost': 'in_poster_lost', 'poster_fair': 'in_poster_fair', 'poster_seeds': 'in_poster_seeds', 'hangplant': 'in_hangplant', 'plant': 'in_plant', 'plant2': 'in_plant2',
       'sawhorse': 'in_sawhorse', 'chickcrate': 'in_chickcrate', 'feedbins': 'in_feedbins', 'mailsacks': 'in_mailsacks', 'produce': 'in_produce', 'seedrack': 'in_seedrack',
       'tank': 'in_tank', 'toolwall': 'in_toolwall', 'saddle': 'in_saddle', 'shovels': 'in_shovels', 'rods': 'in_rods'}
kinds = [a for a in sys.argv[1:] if not a.startswith('--')]; views = '--views' in sys.argv
mp = os.path.join(BUILD, 'spr', 'lpc', 'objects.json'); O = json.load(open(mp))
bak = os.path.join(GAME, 'spr', 'backup_v2', 'furn_old'); os.makedirs(bak, exist_ok=True)
for k in kinds:
    n = SPR.get(k, k); pairs = [(f'hd_{k}_S', n), (f'hd_{k}_S_night', n + '_n')]
    if views: pairs += [(f'hd_{k}_E', n + '_e'), (f'hd_{k}_N', n + '_bk'), (f'hd_{k}_W', n + '_w')]
    for src, dst in pairs:
        sp = os.path.join(HERE, 'out', src + '.png')
        if not os.path.exists(sp): continue
        im = Image.open(sp)
        for root in (GAME, BUILD):
            d = os.path.join(root, 'spr', 'lpc', 'obj', dst + '.png')
            if root == GAME and os.path.exists(d) and not os.path.exists(os.path.join(bak, dst + '.png')): shutil.copy(d, os.path.join(bak, dst + '.png'))
            shutil.copy(sp, d)
        e = O.get(dst, {'src': f'spr/lpc/obj/{dst}.png', 'foot': O.get(n, {}).get('foot', [0, 0, 0, 0])})
        e.update(fw=im.width, fh=im.height, ax=im.width / 2, ay=im.height - 3); O[dst] = e
        print('installed', dst, im.size)
json.dump(O, open(mp, 'w'))
