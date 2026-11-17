"""M_DriverClothes: the driver's clothes, a layer over their own skin (DriverArms draws the body twice: the MetaHuman's skin,
and this over it, following the same pose). The top is whatever the player's Part 1 character wore (the owner: "the
sleeves have to come in the different colours and patterns you could in the pixel version, and no sleeves depending on
what your pixel character looked like"; test videos use a plain green hoodie): its colour (ShirtColor), pattern (Pattern: 0
plain, 1 plaid from T_Plaid, 2 stripes, 3 dots), how far its sleeves reach (SleeveD: along the arm from the shoulder; huge
for long sleeves) and its cuff (CuffKind: 0 a shirt's seam, 1-2 a knit rib, 3 a jacket's hem, 4 a coat), all set by
DriverArms::ApplyOutfit. The hands always bare: where SourceArt/T_HandMask.png is white this layer is cut away. It sits
ClothOut cm out from the skin (thicker for a hoodie or a coat) so the skin never shows through. Indigo jeans below the
waist, a dark leather belt, dark boots below the ankles. Every zone is read from each point's reference-pose position
(PreSkinnedPosition) against the body's own joints there (WaistZ, AnkleZ, the arm's shoulder ArmS and direction ArmDir,
the wrist WristP), so the clothes stay put as the body bends. The zones are small HLSL (Custom nodes) rather than a web of
nodes: one place to read them.

Every link is checked (a wrong pin name links nothing, silently: the breath's fog once came out solid that way).
Run (editor, headless): UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this file>"""
import unreal

MATS = '/Game/HollowAcre/Materials/Blockout'
eal = unreal.EditorAssetLibrary
mel = unreal.MaterialEditingLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()
BAD = []


def log(*a):
    unreal.log('[driver clothes] ' + ' '.join(str(x) for x in a))


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


def const3(m, c, x, y):
    return node(m, unreal.MaterialExpressionConstant3Vector, x, y, constant=unreal.LinearColor(c[0], c[1], c[2], 1.0))


def const(m, v, x, y):
    return node(m, unreal.MaterialExpressionConstant, x, y, r=v)


def mix(m, a, a_out, b, b_out, alpha, x, y):
    e = node(m, unreal.MaterialExpressionLinearInterpolate, x, y)
    link(a, a_out, e, 'A')
    link(b, b_out, e, 'B')
    link(alpha, '', e, 'Alpha')
    return e


def band(m, z, lo_param, sign, soft, x, y):
    """saturate(sign * (param - z) * soft): 1 on the param's low side (sign 1) or high side (sign -1), a soft edge."""
    d = node(m, unreal.MaterialExpressionSubtract, x, y)
    link(lo_param, '', d, 'A')
    link(z, '', d, 'B')
    k = node(m, unreal.MaterialExpressionMultiply, x + 120, y)
    link(d, '', k, 'A')
    link(const(m, sign * soft, x, y + 70), '', k, 'B')
    s = node(m, unreal.MaterialExpressionSaturate, x + 240, y)
    link(k, '', s, '')
    return s


# the shared zones, in the body's reference pose (cm): the arm measured along it from the shoulder (both sides alike)
ZONES = """
float3 Pm = float3(abs(P.x), P.y, P.z);
float d = dot(Pm - ArmS, ArmDir);
float3 onAxis = ArmS + ArmDir * clamp(d, 0.0, 70.0);
float armR = length(Pm - onAxis);
// (and the forearm on to the fingertips, from the elbow along ForeDir: the hand's part of the arm)
float3 fa = Pm - ElbowP;
float foreR = length(fa - ForeDir * clamp(dot(fa, ForeDir), 0.0, 48.0));
float nearFore = step(foreR, 9.0) * step(-2.0, dot(fa, ForeDir));
float arm = max(step(-3.0, d) * step(armR, 9.0) * step(ArmZ, P.z), nearFore);
float legs = saturate((Waist - P.z) * 2.0) * (1.0 - arm);
float belt = saturate(saturate((Waist + 4.0 - P.z) * 2.0) * (1.0 - arm) - legs);
float boots = saturate((Ankle - P.z) * 1.5) * (1.0 - arm);
float cuff = arm * step(length(Pm - WristP), 7.0);
"""

COLOR = ZONES + """
float3 top = Top;
if (Pattern > 0.5 && Pattern < 1.5) top *= Plaid;                                         // plaid
else if (Pattern > 1.5 && Pattern < 2.5) top *= (frac(lerp(P.z, d, arm) / 3.2) < 0.5) ? 1.0 : 0.5;   // stripes round the body and the arm
else if (Pattern > 2.5) { float2 g = frac(UV * 70.0) - 0.5; top = lerp(top, top * 1.7 + 0.06, step(length(g), 0.2)); }   // dots
if (CuffKind > 0.5 && CuffKind < 2.5) top *= lerp(1.0, 0.8 + 0.12 * cos(UV.x * 1400.0), cuff);   // a knit rib cuff
else if (CuffKind < 0.5) top *= lerp(1.0, 0.86, cuff * step(length(Pm - WristP), 1.6 + 5.4) * step(5.4, length(Pm - WristP)));   // a shirt cuff's seam
else if (CuffKind > 2.5 && CuffKind < 3.5) top *= lerp(1.0, 0.85, cuff * step(5.8, length(Pm - WristP)));   // a jacket's turned hem
float3 c = lerp(top, float3(0.022, 0.03, 0.058), legs);
c = lerp(c, float3(0.03, 0.02, 0.014), belt);
c = lerp(c, float3(0.03, 0.02, 0.014), boots);
return c;
"""

KEEP = ZONES + """
// the hands bare; the arm bare past the sleeve's end (none: from the shoulder; short: part way down the upper arm)
float bare = arm * step(SleeveD, d);
// the sleeve's end: a clean line across the arm just short of the wrist (the painted hand mask alone left ragged bits)
float pastCuff = nearFore * step(-2.0, dot(Pm - WristP, ForeDir));
return (1.0 - Hand) * (1.0 - bare) * (1.0 - pastCuff);
"""

ROUGH = ZONES + """
float r = CuffKind < 0.5 ? 0.86 : CuffKind < 2.5 ? 0.95 : CuffKind < 3.5 ? 0.8 : 0.97;
r = lerp(r, 0.78, legs);
r = lerp(r, 0.45, belt);
r = lerp(r, 0.5, boots);
return r;
"""


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


def run():
    """The top the player's Part 1 character wore (colour, pattern, sleeves, cuff: set per character by DriverArms),
    jeans below the waist, a belt, boots; the hands bare."""
    path = MATS + '/M_DriverClothes'
    if eal.does_asset_exist(path):
        eal.delete_asset(path)
    m = tools.create_asset('M_DriverClothes', MATS, unreal.Material, unreal.MaterialFactoryNew())
    m.set_editor_property('used_with_skeletal_mesh', True)
    m.set_editor_property('blend_mode', unreal.BlendMode.BLEND_MASKED)
    m.set_editor_property('two_sided', True)
    pre = node(m, unreal.MaterialExpressionPreSkinnedPosition, -2200, 600)
    # (the reference-pose position is known only per vertex: carried to the pixels through an interpolator)
    vi = node(m, unreal.MaterialExpressionVertexInterpolator, -2120, 600)
    link(pre, '', vi, 'VS')
    uv = node(m, unreal.MaterialExpressionTextureCoordinate, -2200, 450)
    sp = lambda nm, v, y: node(m, unreal.MaterialExpressionScalarParameter, -2200, y, parameter_name=nm, default_value=v)
    vp = lambda nm, v, y: node(m, unreal.MaterialExpressionVectorParameter, -2200, y, parameter_name=nm,
                               default_value=unreal.LinearColor(v[0], v[1], v[2], 1.0))
    waist, ankle = sp('WaistZ', 106.9, 750), sp('AnkleZ', 13.3, 820)
    pattern, cuffk, sleeve, armz = sp('Pattern', 0.0, 890), sp('CuffKind', 2.0, 960), sp('SleeveD', 9999.0, 1030), sp('ArmZ', 100.0, 1100)
    arms_, armdir, wristp = vp('ArmS', (20.3, -2.0, 155.0), 1170), vp('ArmDir', (0.607, 0.026, -0.794), 1240), vp('WristP', (53.6, 17.0, 113.0), 1310)
    top = vp('ShirtColor', (0.08, 0.2, 0.05), 1380)       # (the test outfit: Part 1's green, a plain hoodie)
    hand = tex(m, '/Game/HollowAcre/Textures/T_HandMask', 1.0, -1800, 1500)
    hand.set_editor_property('sampler_type', unreal.MaterialSamplerType.SAMPLERTYPE_LINEAR_COLOR)
    plaid = tex(m, '/Game/HollowAcre/Textures/T_Plaid', 11.0, -1800, -300)     # (a flannel's checks, about 6 cm)
    foredir = vp('ForeDir', (0.59, 0.72, -0.37), 1600)
    elbowp = vp('ElbowP', (38.8, -1.2, 130.8), 1670)
    zone_ins = [('P', vi, ''), ('Waist', waist, ''), ('Ankle', ankle, ''), ('ArmS', arms_, ''), ('ArmDir', armdir, ''),
                ('ArmZ', armz, ''), ('WristP', wristp, ''), ('ForeDir', foredir, ''), ('ElbowP', elbowp, '')]
    col = custom(m, 'clothes colour', COLOR, unreal.CustomMaterialOutputType.CMOT_FLOAT3, -900, 0,
                 zone_ins + [('UV', uv, ''), ('Top', top, ''), ('Pattern', pattern, ''), ('CuffKind', cuffk, ''), ('Plaid', plaid, 'R')])
    prop(col, '', unreal.MaterialProperty.MP_BASE_COLOR)
    keep = custom(m, 'clothes cut', KEEP, unreal.CustomMaterialOutputType.CMOT_FLOAT1, -900, 900,
                  zone_ins + [('Hand', hand, 'R'), ('SleeveD', sleeve, '')])
    prop(keep, '', unreal.MaterialProperty.MP_OPACITY_MASK)
    rough = custom(m, 'clothes roughness', ROUGH, unreal.CustomMaterialOutputType.CMOT_FLOAT1, -900, 450,
                   zone_ins + [('CuffKind', cuffk, '')])
    prop(rough, '', unreal.MaterialProperty.MP_ROUGHNESS)
    # out from the skin along its normal (after skinning), so the cloth always covers it: thicker for a hoodie or a coat
    nrm = node(m, unreal.MaterialExpressionVertexNormalWS, -600, 1300)
    out = node(m, unreal.MaterialExpressionMultiply, -400, 1300)
    link(nrm, '', out, 'A')
    link(sp('ClothOut', 0.65, 1450), '', out, 'B')
    prop(out, '', unreal.MaterialProperty.MP_WORLD_POSITION_OFFSET)
    # the weave and the grain
    fabric = tex(m, '/Game/HollowAcre/Textures/T_FabricN', 14.0, -900, 600 + 900, normal=True)
    prop(fabric, 'RGB', unreal.MaterialProperty.MP_NORMAL)
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    log('made %s; failed links: %s' % (path, BAD or 'none'))


run()
