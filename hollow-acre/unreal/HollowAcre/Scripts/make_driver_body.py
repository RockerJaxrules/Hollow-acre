"""M_DriverBody: the driver's own body as the player sees it (DriverArms, Part 2's wake): the farmer from Part 1 dressed for
the mountain in winter. Black leather driving gloves over the hands (SourceArt/T_HandMask.png, tools/blender/hand_mask.py),
the red plaid flannel shirt (T_Plaid tinted ShirtColor, Part 1's default #b8402c until the save passes its own) on the arms
and chest, a dark leather belt at the waist, indigo jeans below it, dark leather boots below the ankles. Where the waist
and the ankles are comes from the body's own bones (WaistZ, AnkleZ: heights in the mesh's reference pose, set by the game),
read against each point's reference-pose height (PreSkinnedPosition), so the clothes stay put as the body bends.

Every link is checked (a wrong pin name links nothing, silently: the breath's fog once came out solid that way).
Run (editor, headless): UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this file>"""
import unreal

MATS = '/Game/HollowAcre/Materials/Blockout'
eal = unreal.EditorAssetLibrary
mel = unreal.MaterialEditingLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()
BAD = []


def log(*a):
    unreal.log('[driver body] ' + ' '.join(str(x) for x in a))


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


def run():
    path = MATS + '/M_DriverBody'
    if eal.does_asset_exist(path):
        eal.delete_asset(path)
    m = tools.create_asset('M_DriverBody', MATS, unreal.Material, unreal.MaterialFactoryNew())
    m.set_editor_property('used_with_skeletal_mesh', True)
    # the zones
    pre = node(m, unreal.MaterialExpressionPreSkinnedPosition, -2200, 600)
    # (the reference-pose position is known only per vertex: carried to the pixels through an interpolator)
    vi = node(m, unreal.MaterialExpressionVertexInterpolator, -2120, 600)
    link(pre, '', vi, 'VS')
    z = node(m, unreal.MaterialExpressionComponentMask, -2050, 600, r=False, g=False, b=True, a=False)
    link(vi, '', z, '')
    waist = node(m, unreal.MaterialExpressionScalarParameter, -2200, 750, parameter_name='WaistZ', default_value=100.0)
    ankle = node(m, unreal.MaterialExpressionScalarParameter, -2200, 850, parameter_name='AnkleZ', default_value=12.0)
    belt_top = node(m, unreal.MaterialExpressionAdd, -2050, 800)
    link(waist, '', belt_top, 'A')
    link(const(m, 4.0, -2200, 950), '', belt_top, 'B')
    legs = band(m, z, waist, 1.0, 2.0, -1800, 600)          # below the waist
    below_belt_top = band(m, z, belt_top, 1.0, 2.0, -1800, 760)
    belt = node(m, unreal.MaterialExpressionSubtract, -1400, 700)   # between the waist and the belt's top
    link(below_belt_top, '', belt, 'A')
    link(legs, '', belt, 'B')
    boots = band(m, z, ankle, 1.0, 1.5, -1800, 920)
    hand = tex(m, '/Game/HollowAcre/Textures/T_HandMask', 1.0, -1800, 1100)
    hand.set_editor_property('sampler_type', unreal.MaterialSamplerType.SAMPLERTYPE_LINEAR_COLOR)
    # the colours
    plaid = tex(m, '/Game/HollowAcre/Textures/T_Plaid', 6.0, -1500, -300)
    shirt_col = node(m, unreal.MaterialExpressionVectorParameter, -1500, -150, parameter_name='ShirtColor',
                     default_value=unreal.LinearColor(0.479, 0.051, 0.025, 1))
    shirt = node(m, unreal.MaterialExpressionMultiply, -1200, -250)
    link(plaid, 'R', shirt, 'A')
    link(shirt_col, '', shirt, 'B')
    denim = const3(m, (0.022, 0.03, 0.058), -1200, -80)
    leather = const3(m, (0.03, 0.02, 0.014), -1200, 0)
    glove = const3(m, (0.028, 0.022, 0.018), -1200, 80)
    c1 = mix(m, shirt, '', denim, '', legs, -900, -200)
    c2 = mix(m, c1, '', leather, '', belt, -700, -150)
    c3 = mix(m, c2, '', leather, '', boots, -500, -100)
    c4 = mix(m, c3, '', glove, '', hand, -300, -50)
    prop(c4, '', unreal.MaterialProperty.MP_BASE_COLOR)
    # rough cloth, the jeans a little less, leather smoother
    r1 = mix(m, const(m, 0.9, -900, 250), '', const(m, 0.78, -900, 320), '', legs, -700, 280)
    r2 = mix(m, r1, '', const(m, 0.45, -700, 380), '', belt, -500, 300)
    r3 = mix(m, r2, '', const(m, 0.5, -500, 400), '', boots, -350, 320)
    r4 = mix(m, r3, '', const(m, 0.42, -350, 420), '', hand, -200, 340)
    prop(r4, '', unreal.MaterialProperty.MP_ROUGHNESS)
    # the weave and the grain
    fabric = tex(m, '/Game/HollowAcre/Textures/T_FabricN', 14.0, -900, 600, normal=True)
    leather_n = tex(m, '/Game/HollowAcre/Textures/T_LeatherN', 10.0, -900, 800, normal=True)
    n1 = mix(m, fabric, 'RGB', leather_n, 'RGB', hand, -500, 650)
    prop(n1, '', unreal.MaterialProperty.MP_NORMAL)
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    log('made %s; failed links: %s' % (path, BAD or 'none'))


run()
