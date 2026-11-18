"""Materials for Part 2's play: M_FireGlow, an emissive surface whose glow the game sets (the stove's mica window lit
from inside: Glow, a colour times brightness, 0 when cold); M_Breath, the breath's vapour in the cold.
Run: UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this> -unattended -nosplash -nosound"""
import unreal

DEST = '/Game/HollowAcre/Materials/Play'
eal = unreal.EditorAssetLibrary
mel = unreal.MaterialEditingLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()


def breath():
    """M_Breath: the breath's vapour in the cold. A soft puff (a sphere seen face-on: thick in its middle, nothing at its
    rim), broken into wisps by a 3D noise that drifts with time, lit per pixel so it shows only where a light catches it
    (the flashlight's beam, the fire, a little moon), as real breath does at night. Opacity is the game's (it fades)."""
    path = DEST + '/M_Breath'
    if eal.does_asset_exist(path):
        eal.delete_asset(path)                  # (remade each run: it is still being tuned)
    m = tools.create_asset('M_Breath', DEST, unreal.Material, unreal.MaterialFactoryNew())
    m.set_editor_property('blend_mode', unreal.BlendMode.BLEND_TRANSLUCENT)
    m.set_editor_property('translucency_lighting_mode', unreal.TranslucencyLightingMode.TLM_SURFACE_PER_PIXEL_LIGHTING)
    col = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, -400, -200)
    col.set_editor_property('constant', unreal.LinearColor(0.82, 0.84, 0.86, 1.0))
    mel.connect_material_property(col, '', unreal.MaterialProperty.MP_BASE_COLOR)
    rough = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -400, -50)
    rough.set_editor_property('r', 1.0)
    mel.connect_material_property(rough, '', unreal.MaterialProperty.MP_ROUGHNESS)
    # (thick where it faces the eye, nothing at its rim)
    fr = mel.create_material_expression(m, unreal.MaterialExpressionFresnel, -1100, 150)
    fr.set_editor_property('exponent', 1.2)
    om = mel.create_material_expression(m, unreal.MaterialExpressionOneMinus, -950, 150)
    mel.connect_material_expressions(fr, '', om, '')
    sq = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -800, 150)
    mel.connect_material_expressions(om, '', sq, 'A')
    mel.connect_material_expressions(om, '', sq, 'B')
    # (wisps: a 3D noise in world space, drifting up with time)
    wp = mel.create_material_expression(m, unreal.MaterialExpressionWorldPosition, -1400, 400)
    tm = mel.create_material_expression(m, unreal.MaterialExpressionTime, -1400, 550)
    up = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -1250, 550)
    mel.connect_material_expressions(tm, '', up, 'A')
    up.set_editor_property('const_b', 6.0)
    drift = mel.create_material_expression(m, unreal.MaterialExpressionAppendVector, -1100, 550)
    zero2 = mel.create_material_expression(m, unreal.MaterialExpressionConstant2Vector, -1250, 650)
    mel.connect_material_expressions(zero2, '', drift, 'A')
    mel.connect_material_expressions(up, '', drift, 'B')
    pos = mel.create_material_expression(m, unreal.MaterialExpressionSubtract, -950, 450)
    mel.connect_material_expressions(wp, '', pos, 'A')
    mel.connect_material_expressions(drift, '', pos, 'B')
    nz = mel.create_material_expression(m, unreal.MaterialExpressionNoise, -800, 450)
    # (contrasty: holes and threads in it, wisps rather than a ball; held at 0 below)
    nz.set_editor_property('scale', 0.45)
    nz.set_editor_property('levels', 4)
    nz.set_editor_property('output_min', -0.9)
    nz.set_editor_property('output_max', 1.3)
    mel.connect_material_expressions(pos, '', nz, 'Position')
    nzc = mel.create_material_expression(m, unreal.MaterialExpressionMax, -700, 450)
    nzc.set_editor_property('const_b', 0.0)
    mel.connect_material_expressions(nz, '', nzc, 'A')
    mix = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -600, 250)
    mel.connect_material_expressions(sq, '', mix, 'A')
    mel.connect_material_expressions(nzc, '', mix, 'B')
    op = mel.create_material_expression(m, unreal.MaterialExpressionScalarParameter, -600, 450)
    op.set_editor_property('parameter_name', 'Opacity')
    op.set_editor_property('default_value', 0.2)
    out = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -400, 250)
    mel.connect_material_expressions(mix, '', out, 'A')
    mel.connect_material_expressions(op, '', out, 'B')
    # (soft where it meets anything: the near plane, a wall)
    df = mel.create_material_expression(m, unreal.MaterialExpressionDepthFade, -250, 300)
    df.set_editor_property('fade_distance_default', 12.0)
    mel.connect_material_expressions(out, '', df, 'Opacity')
    mel.connect_material_property(df, '', unreal.MaterialProperty.MP_OPACITY)
    mel.recompile_material(m)
    eal.save_loaded_asset(m, only_if_is_dirty=False)
    unreal.log('[play mats] made M_Breath')


FLAME = """
// a flame on a card: u across, v up from its foot. Its body a tongue narrowing to its tip, licking (two octaves of value
// noise rising through it bend it and break its top), white-yellow at its root and core, orange-red at its edges and tip
float2 p = UV;
float t = Time;
float2 q = float2(p.x * 3.0 + Seed, p.y * 2.2 - t * 2.6);
float2 i0 = floor(q);
float2 f0 = frac(q);
f0 = f0 * f0 * (3.0 - 2.0 * f0);
float a0 = frac(sin(dot(i0, float2(127.1, 311.7))) * 43758.5453);
float b0 = frac(sin(dot(i0 + float2(1.0, 0.0), float2(127.1, 311.7))) * 43758.5453);
float c0 = frac(sin(dot(i0 + float2(0.0, 1.0), float2(127.1, 311.7))) * 43758.5453);
float d0 = frac(sin(dot(i0 + float2(1.0, 1.0), float2(127.1, 311.7))) * 43758.5453);
float n1 = lerp(lerp(a0, b0, f0.x), lerp(c0, d0, f0.x), f0.y);
float2 q2 = q * 2.3 + float2(5.2, -t * 1.7);
float2 i1 = floor(q2);
float2 f1 = frac(q2);
f1 = f1 * f1 * (3.0 - 2.0 * f1);
float a1 = frac(sin(dot(i1, float2(127.1, 311.7))) * 43758.5453);
float b1 = frac(sin(dot(i1 + float2(1.0, 0.0), float2(127.1, 311.7))) * 43758.5453);
float c1 = frac(sin(dot(i1 + float2(0.0, 1.0), float2(127.1, 311.7))) * 43758.5453);
float d1 = frac(sin(dot(i1 + float2(1.0, 1.0), float2(127.1, 311.7))) * 43758.5453);
float n2 = lerp(lerp(a1, b1, f1.x), lerp(c1, d1, f1.x), f1.y);
float n = n1 * 0.65 + n2 * 0.35;
float wob = (n - 0.5) * 0.55 * p.y;
float x = abs(p.x - 0.5 + wob);
float width = 0.44 * pow(saturate(1.0 - p.y), 0.75) * (0.7 + 0.6 * n);
float body = saturate(1.0 - x / max(width, 0.001));
body *= body;
float top = saturate(1.15 - p.y * (0.8 + 0.7 * n));
float root = saturate(p.y * 8.0);
float core = saturate(1.0 - x / max(width * 0.4, 0.001)) * saturate(1.0 - p.y * 1.5);
float3 col = lerp(float3(1.0, 0.28, 0.05), float3(1.0, 0.78, 0.38), core);
return col * body * top * root * Intensity;
"""


def flame():
    """M_Flame: the stove's flames on crossed cards (Wake_StoveFlames): additive, unlit, drawn by a Custom node (FLAME) from
    the card's UVs and the time; Intensity the game's (0 when cold, flickering with the fire), Seed per card."""
    path = DEST + '/M_Flame'
    if eal.does_asset_exist(path):
        eal.delete_asset(path)
    m = tools.create_asset('M_Flame', DEST, unreal.Material, unreal.MaterialFactoryNew())
    m.set_editor_property('blend_mode', unreal.BlendMode.BLEND_ADDITIVE)
    m.set_editor_property('shading_model', unreal.MaterialShadingModel.MSM_UNLIT)
    m.set_editor_property('two_sided', True)
    uv = mel.create_material_expression(m, unreal.MaterialExpressionTextureCoordinate, -900, 0)
    tm = mel.create_material_expression(m, unreal.MaterialExpressionTime, -900, 150)
    it = mel.create_material_expression(m, unreal.MaterialExpressionScalarParameter, -900, 300)
    it.set_editor_property('parameter_name', 'Intensity')
    it.set_editor_property('default_value', 0.0)
    sd = mel.create_material_expression(m, unreal.MaterialExpressionScalarParameter, -900, 450)
    sd.set_editor_property('parameter_name', 'Seed')
    sd.set_editor_property('default_value', 0.0)
    c = mel.create_material_expression(m, unreal.MaterialExpressionCustom, -500, 100)
    c.set_editor_property('code', FLAME)
    c.set_editor_property('output_type', unreal.CustomMaterialOutputType.CMOT_FLOAT3)
    ins = []
    for nm in ('UV', 'Time', 'Intensity', 'Seed'):
        ci = unreal.CustomInput()
        ci.set_editor_property('input_name', nm)
        ins.append(ci)
    c.set_editor_property('inputs', ins)
    ok = all([mel.connect_material_expressions(uv, '', c, 'UV'), mel.connect_material_expressions(tm, '', c, 'Time'),
              mel.connect_material_expressions(it, '', c, 'Intensity'), mel.connect_material_expressions(sd, '', c, 'Seed'),
              mel.connect_material_property(c, '', unreal.MaterialProperty.MP_EMISSIVE_COLOR)])
    mel.recompile_material(m)
    eal.save_loaded_asset(m, only_if_is_dirty=False)
    unreal.log('[play mats] made M_Flame; links %s' % ('ok' if ok else 'FAILED'))


def hot_iron():
    """M_HotIron: the stove's cast-iron belly: dark, a little metallic, rough; Heat (a colour times brightness) its glow
    when the fire is high, blotchy as iron heats unevenly (a world-space noise), 0 when cold."""
    path = DEST + '/M_HotIron'
    if eal.does_asset_exist(path):
        eal.delete_asset(path)
    m = tools.create_asset('M_HotIron', DEST, unreal.Material, unreal.MaterialFactoryNew())
    m.set_editor_property('used_with_nanite', True)       # (else the game draws the default grey on a Nanite mesh)
    col = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, -500, -200)
    col.set_editor_property('constant', unreal.LinearColor(0.018, 0.017, 0.017, 1.0))
    mel.connect_material_property(col, '', unreal.MaterialProperty.MP_BASE_COLOR)
    mt = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -500, -50)
    mt.set_editor_property('r', 0.22)
    mel.connect_material_property(mt, '', unreal.MaterialProperty.MP_METALLIC)
    rg = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -500, 50)
    rg.set_editor_property('r', 0.84)
    mel.connect_material_property(rg, '', unreal.MaterialProperty.MP_ROUGHNESS)
    wp = mel.create_material_expression(m, unreal.MaterialExpressionWorldPosition, -1000, 300)
    nz = mel.create_material_expression(m, unreal.MaterialExpressionNoise, -800, 300)
    nz.set_editor_property('scale', 0.06)
    nz.set_editor_property('levels', 3)
    nz.set_editor_property('output_min', 0.25)
    nz.set_editor_property('output_max', 1.0)
    mel.connect_material_expressions(wp, '', nz, 'Position')
    ht = mel.create_material_expression(m, unreal.MaterialExpressionVectorParameter, -800, 500)
    ht.set_editor_property('parameter_name', 'Heat')
    ht.set_editor_property('default_value', unreal.LinearColor(0.0, 0.0, 0.0, 1.0))
    em = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -500, 400)
    mel.connect_material_expressions(nz, '', em, 'A')
    mel.connect_material_expressions(ht, '', em, 'B')
    mel.connect_material_property(em, '', unreal.MaterialProperty.MP_EMISSIVE_COLOR)
    mel.recompile_material(m)
    eal.save_loaded_asset(m, only_if_is_dirty=False)
    unreal.log('[play mats] made M_HotIron')


def run():
    breath()
    flame()
    hot_iron()
    path = DEST + '/M_FireGlow'
    if eal.does_asset_exist(path):
        unreal.log('[play mats] M_FireGlow already there')
        return
    m = tools.create_asset('M_FireGlow', DEST, unreal.Material, unreal.MaterialFactoryNew())
    m.set_editor_property('used_with_nanite', True)
    base = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, -400, -100)
    base.set_editor_property('constant', unreal.LinearColor(0.05, 0.035, 0.02, 1.0))
    mel.connect_material_property(base, '', unreal.MaterialProperty.MP_BASE_COLOR)
    glow = mel.create_material_expression(m, unreal.MaterialExpressionVectorParameter, -400, 100)
    glow.set_editor_property('parameter_name', 'Glow')
    glow.set_editor_property('default_value', unreal.LinearColor(0.0, 0.0, 0.0, 1.0))
    mel.connect_material_property(glow, '', unreal.MaterialProperty.MP_EMISSIVE_COLOR)
    rough = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -400, 250)
    rough.set_editor_property('r', 0.3)
    mel.connect_material_property(rough, '', unreal.MaterialProperty.MP_ROUGHNESS)
    mel.recompile_material(m)
    eal.save_loaded_asset(m, only_if_is_dirty=False)
    unreal.log('[play mats] made M_FireGlow')


run()
