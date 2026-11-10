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
       'tank': 'in_tank', 'toolwall': 'in_toolwall', 'saddle': 'in_saddle', 'shovels': 'in_shovels', 'rods': 'in_rods', 'bar': 'in_bar', 'hearth': 'in_hearth', 'altar': 'in_altar', 'blackboard': 'in_blackboard', 'candycase': 'in_candycase', 'chairstack': 'in_chairstack', 'bottles': 'in_bottles', 'papers': 'in_papers', 'knit': 'in_knit', 'drawings': 'in_drawings', 'mapboard': 'in_mapboard', 'sign_open': 'in_sign_open', 'fishmount': 'in_fishmount', 'netwall': 'in_netwall', 'lures': 'in_lures', 'cat': 'in_cat', 'forgehearth': 'in_forgehearth', 'quench': 'in_quench', 'grindstone': 'in_grindstone', 'hoist': 'in_hoist', 'lathe': 'in_lathe', 'cellar': 'in_cellar', 'trapdoor': 'in_trapdoor', 'indrum': 'in_drum', 'drum_blue': 'in_drum_blue', 'rugb': 'in_rug_b', 'rugc': 'in_rug_c', 'rugd': 'in_rug_d', 'tbooks': 't_books', 'tcandle': 't_candle', 'tlamp': 't_lamp', 'tmug': 't_mug', 'tplate': 't_plate', 'tvase': 't_vase', 'wboat': 'wk_boat', 'wrack': 'wk_rack', 'wrope': 'wk_rope', 'wtrap': 'wk_trap', 'wstall': 'wk_stall', 'wbell': 'wk_bell', 'rumple': 'in_rumple', 'stain': 'in_stain', 'innporch': 'inn_deck', 'innrail': 'inn_rail', 'innsteps': 'inn_steps', 'innstoop': 'inn_stoop', 'wnets': 'wk_nets', 'wlamp': 'wk_lamp', 'fenceh': 'fence_h', 'fencev': 'fence_v', 'pickh': 'picket_h', 'pickv': 'picket_v', 'kneeler': 'in_kneeler', 'medcab': 'in_medcab', 'doll': 'in_doll', 'goodstable': 'in_goodstable', 'cot': 'in_cot', 'minecart': 'in_minecart', 'eyechart': 'in_eyechart', 'vanity': 'in_vanity', 'nightstand': 'in_nightstand', 'dressform': 'in_dressform', 'primers': 'in_primers', 'sewmachine': 'in_sewmachine', 'stoneblocks': 'in_stoneblocks', 'banker': 'in_banker', 'quarryrack': 'in_quarryrack', 'sortrack': 'in_sortrack', 'crosswall': 'in_crosswall', 'creel': 'in_creel', 'hopechest': 'in_hopechest', 'trestlelid': 'in_trestlelid'}
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
        same = e.get('fw') == im.width and e.get('fh') == im.height and 'ay' in e   # same size: keep its anchor (floor and wall pieces are anchored their own way)
        e.update(fw=im.width, fh=im.height, ax=e['ax'] if same else im.width / 2, ay=e['ay'] if same else im.height - 3); O[dst] = e
        print('installed', dst, im.size)
json.dump(O, open(mp, 'w'))
