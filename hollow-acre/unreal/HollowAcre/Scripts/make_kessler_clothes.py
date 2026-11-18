"""M_KesslerClothes: Kessler's working clothes, a layer over his MetaHuman body (AKessler::DressUp draws his body a
second time under this material, following his every bone; MetaHuman ships only a T-shirt and shorts, hidden). The
driver's M_DriverClothes was made for an arm seen up close and cut by a painted hand mask; this covers a whole man seen
by lantern light among trees:
- a brown duck-canvas chore coat (the foremen's and miners' coat of the time), to the upper thigh, its sleeves to the
  wrist with a turned cuff, a dark corduroy collar, a buttoned placket with horn buttons, two patch pockets below and
  one on the chest;
- dark wool trousers, bunched over his boots;
- high leather work boots;
- worn leather gloves (cold, and a man who works with his hands).
Only his neck above the collar is cut away (his face is its own mesh). Every zone is read from the point's
reference-pose position (PreSkinnedPosition) against his own joints there (Neck, Hem, Ankle, the arm's shoulder ArmS and
direction ArmDir, the elbow ElbowP and forearm ForeDir, the wrist WristP: set by DressUp from his skeleton), so the
clothes stay put as he walks. It sits out from the skin along its normal by zone (the coat thicker than the trousers,
the collar thickest, the gloves thin), so the skin never shows through.

Every link is checked (a wrong pin name links nothing, silently).
Run (editor, headless): UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this file>"""
import unreal

MATS = '/Game/HollowAcre/Materials/Blockout'
eal = unreal.EditorAssetLibrary
mel = unreal.MaterialEditingLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()
BAD = []


def log(*a):
    unreal.log('[kessler clothes] ' + ' '.join(str(x) for x in a))


def node(m, cls, x, y, **props):
    n = mel.create_material_expression(m, cls, x, y)
    for k, v in props.items():
        n.set_editor_property(k, v)
    return n


def link(a, a_out, b, b_in):
    if not mel.connect_material_expressions(a, a_out, b, b_in):
        BAD.append('%s.%s -> %s.%s' % (a.get_name(), a_out, b.get_name(), b_in))


def prop(a, a_out, p):
    if not mel.connect_material_property(a, a_out, p):
        BAD.append('%s.%s -> %s' % (a.get_name(), a_out, p))


def tex(m, path, tiling, x, y, normal=False):
    tc = node(m, unreal.MaterialExpressionTextureCoordinate, x - 250, y, u_tiling=tiling, v_tiling=tiling)
    ts = node(m, unreal.MaterialExpressionTextureSample, x, y, texture=unreal.load_asset(path))
    if normal:
        ts.set_editor_property('sampler_type', unreal.MaterialSamplerType.SAMPLERTYPE_NORMAL)
    link(tc, '', ts, 'UVs')
    return ts


def custom(m, name, code, out_type, x, y, ins):
    """A Custom HLSL node: its inputs by name, each linked from (node, output); every link checked."""
    c = node(m, unreal.MaterialExpressionCustom, x, y)
    c.set_editor_property('code', code)
    c.set_editor_property('output_type', out_type)
    c.set_editor_property('description', name)
    inputs = []
    for nm, _src, _out in ins:
        ci = unreal.CustomInput()
        ci.set_editor_property('input_name', nm)
        inputs.append(ci)
    c.set_editor_property('inputs', inputs)
    for nm, src, out in ins:
        link(src, out, c, nm)
    return c


# the zones, in his reference pose (cm; MetaHumans face +Y): the arm measured along it from the shoulder (both sides
# alike), the forearm from the elbow on to the fingertips
ZONES = """
float3 Pm = float3(abs(P.x), P.y, P.z);
float d = dot(Pm - ArmS, ArmDir);
float3 onAxis = ArmS + ArmDir * clamp(d, 0.0, 70.0);
float armR = length(Pm - onAxis);
float3 fa = Pm - ElbowP;
float tf = dot(fa, ForeDir);
float foreR = length(fa - ForeDir * clamp(tf, 0.0, 48.0));
float nearFore = step(foreR, 9.0) * step(-2.0, tf);
float arm = max(step(-3.0, d) * step(armR, 9.0) * step(ArmZ, P.z), nearFore);
float glove = nearFore * saturate((dot(Pm - WristP, ForeDir) + 1.0) * 2.0);
float coat = saturate(max(saturate((P.z - Hem) * 1.5), arm) - glove);
float boots = saturate((Ankle - P.z) * 1.5) * (1.0 - arm);
float trousers = saturate(1.0 - coat - boots - glove);
float collar = saturate(1.0 - abs(P.z - (Neck - 3.5)) / 3.5) * (1.0 - arm);
float front = step(0.0, P.y);
float cuff = arm * (1.0 - glove) * step(length(Pm - WristP), 6.5);
"""

COLOR = ZONES + """
float3 c = Coat * lerp(0.72, 1.07, saturate(0.5 + 0.5 * Fold.w));                       // the folds' valleys in shadow
// the canvas worn pale where it rubs: the elbows, the cuffs' edges, the pockets' lips
c *= lerp(1.0, 1.22, arm * (1.0 - glove) * saturate(1.0 - abs(tf) / 5.0) * saturate(1.0 - foreR / 9.0));
c *= lerp(1.0, 0.8, cuff * step(5.0, length(Pm - WristP)));                                // the turned cuff's line
// the placket down the front and its horn buttons, 10 cm apart
float pl = coat * front * (1.0 - arm) * step(abs(P.x), 1.6) * step(P.z, Neck - 5.0);
c *= lerp(1.0, 0.76, pl * step(1.15, abs(P.x)));
float bz = frac((P.z - Hem - 7.0) / 10.0) * 10.0;
float btn = pl * step(length(float2(P.x, min(bz, 10.0 - bz))), 0.85) * step(Hem + 5.0, P.z);
c = lerp(c, float3(0.018, 0.012, 0.008), btn);
// patch pockets: two low, one on the chest (his left): a shade darker, stitched round
float2 lo = float2(abs(P.x), P.z);
float pk1 = front * (1.0 - arm) * step(5.5, lo.x) * step(lo.x, 17.0) * step(Hem + 3.0, P.z) * step(P.z, Hem + 19.0);
float pk2 = front * (1.0 - arm) * step(4.5, P.x) * step(P.x, 13.5) * step(Neck - 25.0, P.z) * step(P.z, Neck - 14.0);
float pk = max(pk1, pk2);
float edge = pk * (1.0 - step(6.3, lo.x) * step(lo.x, 16.2) * step(Hem + 3.8, P.z) * step(P.z, Hem + 18.2)) * pk1
           + pk2 * (1.0 - step(5.3, P.x) * step(P.x, 12.7) * step(Neck - 24.2, P.z) * step(P.z, Neck - 14.8));
c *= lerp(1.0, 0.9, pk);
c *= lerp(1.0, 0.7, saturate(edge));
c = lerp(c, CollarColor, collar * coat);
float3 tr = Trousers * lerp(0.75, 1.05, saturate(0.5 + 0.5 * Fold.w));
c = lerp(c, tr, trousers);
float3 bt = float3(0.009, 0.007, 0.006) * lerp(1.0, 1.6, saturate((P.z - (Ankle - 4.0)) / 4.0));   // (near black; a scuffed, paler top)
c = lerp(c, bt, boots);
c = lerp(c, float3(0.045, 0.029, 0.016) * lerp(0.8, 1.1, saturate(0.5 + 0.5 * Fold.w)), glove);
return c;
"""

# the cloth's folds: the sleeves bunched in wavy rings above the cuff and creased inside the elbow (as the driver's
# sleeves, from photographs), the upper arm in long soft folds, the coat hanging in soft vertical folds from the
# shoulders, the trousers bunched in rings above the boots, the gloves creased across the knuckles. A height in the
# reference pose, turned into a normal by its screen derivatives (Mikkelsen's surface-gradient bump), on the weave's
# normal. xyz: the normal; w: the height.
FOLDS = ZONES + """
float3 ax = ForeDir;
float3 r0 = normalize(cross(ax, float3(0.0, 0.0, 1.0)));
float3 r1 = cross(ax, r0);
float3 rad = fa - ax * tf;
float th = atan2(dot(rad, r1), dot(rad, r0));
float bunch = smoothstep(5.0, 20.0, tf) * (1.0 - smoothstep(22.5, 25.0, tf));
float wav = tf * 1.6 + 1.2 * sin(th * 2.0 + tf * 0.33) + 0.7 * sin(th * 3.0 - tf * 0.21);
float ring = sin(wav);
ring = sign(ring) * pow(abs(ring), 0.65);
float h = nearFore * (1.0 - glove) * ring * (0.2 + 0.8 * bunch);
float elbow = nearFore * (1.0 - smoothstep(0.0, 8.0, abs(tf - 1.0)));
h += elbow * 0.8 * sin(th * 5.0 + tf * 0.9);
float upper = step(-3.0, d) * step(armR, 9.0) * step(ArmZ, P.z) * (1.0 - nearFore);
float3 ru = Pm - onAxis;
float3 u0 = normalize(cross(ArmDir, float3(0.0, 1.0, 0.0)));
float3 u1 = cross(ArmDir, u0);
float thu = atan2(dot(ru, u1), dot(ru, u0));
h += upper * 0.55 * sin(d * 0.42 + 1.8 * sin(thu * 2.0) + 0.8 * sin(thu * 3.0 + d * 0.1));
float body = coat * (1.0 - arm);
float ang = atan2(P.y, P.x);
h += body * 0.45 * sin(ang * 11.0 + 1.3 * sin(P.z * 0.07) + 0.6 * sin(ang * 4.0)) * saturate((Neck - 12.0 - P.z) / 20.0);
float shin = trousers * (1.0 - smoothstep(Ankle + 2.0, Ankle + 16.0, P.z));
h += shin * 0.9 * sin(P.z * 1.5 + 1.4 * sin(atan2(P.y, Pm.x - 10.0) * 2.0));
h += trousers * (1.0 - shin) * 0.3 * sin(atan2(P.y, Pm.x - 10.0) * 3.0 + P.z * 0.06);
h += glove * 0.5 * sin(tf * 2.4);
float3 Nn = normalize(N);
float3 dpdx = ddx(WP), dpdy = ddy(WP);
float dhx = ddx(h) * 0.38, dhy = ddy(h) * 0.38;
float3 R1 = cross(dpdy, Nn), R2 = cross(Nn, dpdx);
float det = dot(dpdx, R1);
float3 grad = sign(det) * (dhx * R1 + dhy * R2);
float3 Nb = normalize(abs(det) * Nn - grad);
return float4(Nb, h);
"""

# his neck above the collar left bare (his face and the rest of his neck are the face mesh's); everything else covered
KEEP = ZONES + """
return 1.0 - step(Neck, P.z) * (1.0 - arm);
"""

ROUGH = ZONES + """
float r = lerp(0.86, 0.93, trousers);
r = lerp(r, 0.97, collar * coat);
r = lerp(r, 0.52, boots);
r = lerp(r, 0.62, glove);
return r;
"""

# out from the skin along its normal, by zone (cm): the coat over a shirt and a vest, the collar turned up thick, the
# trousers, the boots' leather, the gloves thin. In the vertex shader, from the reference-pose position directly.
OUT = ZONES + """
float o = coat * 1.9 + collar * coat * 1.6 + trousers * 1.15 + boots * 0.9 + glove * 0.3;
return o * Scale;
"""


def run():
    path = MATS + '/M_KesslerClothes'
    if eal.does_asset_exist(path):
        eal.delete_asset(path)
    m = tools.create_asset('M_KesslerClothes', MATS, unreal.Material, unreal.MaterialFactoryNew())
    m.set_editor_property('used_with_skeletal_mesh', True)
    m.set_editor_property('blend_mode', unreal.BlendMode.BLEND_MASKED)
    m.set_editor_property('two_sided', True)
    pre = node(m, unreal.MaterialExpressionPreSkinnedPosition, -2200, 600)
    vi = node(m, unreal.MaterialExpressionVertexInterpolator, -2120, 600)
    link(pre, '', vi, 'VS')
    sp = lambda nm, v, y: node(m, unreal.MaterialExpressionScalarParameter, -2200, y, parameter_name=nm, default_value=v)
    vp = lambda nm, v, y: node(m, unreal.MaterialExpressionVectorParameter, -2200, y, parameter_name=nm,
                               default_value=unreal.LinearColor(v[0], v[1], v[2], 1.0))
    # (defaults: his own joints, as DressUp logged them)
    hem, ankle, neck, armz = sp('Hem', 78.0, 750), sp('AnkleZ', 24.0, 820), sp('NeckZ', 152.0, 890), sp('ArmZ', 94.0, 960)
    arms_, armdir = vp('ArmS', (18.2, -2.9, 141.6), 1170), vp('ArmDir', (0.6, 0.03, -0.8), 1240)
    wristp, foredir, elbowp = vp('WristP', (47.0, 13.3, 105.3), 1310), vp('ForeDir', (0.5, 0.6, -0.6), 1600), vp('ElbowP', (34.4, -2.1, 120.4), 1670)
    coatc = vp('CoatColor', (0.15, 0.1, 0.055), 1380)          # (brown duck canvas, worn)
    collc = vp('CollarColor', (0.05, 0.03, 0.018), 1450)       # (dark brown corduroy)
    trc = vp('TrousersColor', (0.035, 0.033, 0.03), 1520)      # (dark grey wool)
    scale = sp('ClothOut', 1.0, 1740)
    zone_ins = lambda p: [('P', p, ''), ('Hem', hem, ''), ('Ankle', ankle, ''), ('Neck', neck, ''), ('ArmS', arms_, ''),
                          ('ArmDir', armdir, ''), ('ArmZ', armz, ''), ('WristP', wristp, ''), ('ForeDir', foredir, ''),
                          ('ElbowP', elbowp, '')]
    m.set_editor_property('tangent_space_normal', False)
    fabric = tex(m, '/Game/HollowAcre/Textures/T_FabricN', 9.0, -1500, 2100, normal=True)
    fab_ws = node(m, unreal.MaterialExpressionTransform, -1250, 2100,
                  transform_source_type=unreal.MaterialVectorCoordTransformSource.TRANSFORMSOURCE_TANGENT,
                  transform_type=unreal.MaterialVectorCoordTransform.TRANSFORM_WORLD)
    link(fabric, 'RGB', fab_ws, '')
    wpos = node(m, unreal.MaterialExpressionWorldPosition, -1250, 2250)
    folds = custom(m, 'clothes folds', FOLDS, unreal.CustomMaterialOutputType.CMOT_FLOAT4, -900, 1900,
                   zone_ins(vi) + [('WP', wpos, ''), ('N', fab_ws, '')])
    fold_n = node(m, unreal.MaterialExpressionComponentMask, -650, 1900, r=True, g=True, b=True, a=False)
    link(folds, '', fold_n, '')
    prop(fold_n, '', unreal.MaterialProperty.MP_NORMAL)
    col = custom(m, 'clothes colour', COLOR, unreal.CustomMaterialOutputType.CMOT_FLOAT3, -900, 0,
                 zone_ins(vi) + [('Coat', coatc, ''), ('CollarColor', collc, ''), ('Trousers', trc, ''), ('Fold', folds, '')])
    prop(col, '', unreal.MaterialProperty.MP_BASE_COLOR)
    keep = custom(m, 'clothes cut', KEEP, unreal.CustomMaterialOutputType.CMOT_FLOAT1, -900, 900, zone_ins(vi))
    prop(keep, '', unreal.MaterialProperty.MP_OPACITY_MASK)
    rough = custom(m, 'clothes roughness', ROUGH, unreal.CustomMaterialOutputType.CMOT_FLOAT1, -900, 450, zone_ins(vi))
    prop(rough, '', unreal.MaterialProperty.MP_ROUGHNESS)
    spec = node(m, unreal.MaterialExpressionConstant, -600, 520, r=0.3)
    prop(spec, '', unreal.MaterialProperty.MP_SPECULAR)
    thick = custom(m, 'clothes thickness', OUT, unreal.CustomMaterialOutputType.CMOT_FLOAT1, -900, 1300,
                   zone_ins(pre) + [('Scale', scale, '')])
    nrm = node(m, unreal.MaterialExpressionVertexNormalWS, -600, 1400)
    out = node(m, unreal.MaterialExpressionMultiply, -400, 1300)
    link(nrm, '', out, 'A')
    link(thick, '', out, 'B')
    prop(out, '', unreal.MaterialProperty.MP_WORLD_POSITION_OFFSET)
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    log('made %s; failed links: %s' % (path, BAD or 'none'))


run()
