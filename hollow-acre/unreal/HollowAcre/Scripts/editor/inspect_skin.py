import unreal
mel = unreal.MaterialEditingLibrary
MP = unreal.MaterialProperty
def d(e, depth=0, seen=None):
    seen = seen or set()
    if e is None or depth > 6 or e.get_name() in seen:
        return
    seen.add(e.get_name())
    extra = ''
    for prop in ('constant', 'r', 'const_b', 'desc', 'parameter_name'):
        try:
            v = e.get_editor_property(prop)
            if v not in (None, ''):
                extra += ' %s=%s' % (prop, v)
        except Exception:
            pass
    unreal.log('[skin] ' + '  ' * depth + e.get_class().get_name() + extra)
    try:
        for i in mel.get_inputs_for_material_expression(m, e):
            d(i, depth + 1, seen)
    except Exception as ex:
        unreal.log('[skin] ' + '  ' * depth + ' (inputs? %s)' % ex)
for name in ('M_HuskSkin',):
    m = unreal.load_asset('/Game/HollowAcre/Creature/HuskGame/' + name)
    unreal.log('[skin] %s shading %s use_attrs %s' % (name, m.get_editor_property('shading_model'), m.get_editor_property('use_material_attributes')))
    for prop in (MP.MP_BASE_COLOR, MP.MP_SUBSURFACE_COLOR, MP.MP_ROUGHNESS):
        unreal.log('[skin] -- %s' % prop)
        d(mel.get_material_property_input_node(m, prop))
