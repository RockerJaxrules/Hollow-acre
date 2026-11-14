"""Exact Blender API reference for the installed bpy (no internet needed).

  python3 api.py build            -> writes api_cache/ops.txt, types.txt, nodes.txt
  python3 api.py find <regex> [-n 40]   -> search all three (case-insensitive)
  python3 api.py node <NodeType>  -> inputs/outputs of a shader/geometry node, e.g. ShaderNodeBsdfPrincipled

Use it BEFORE writing bpy code you are not sure of: Blender 5.x renamed many things.
"""
import os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); CACHE = os.path.join(HERE, 'api_cache')

def _props(rna):
    out = []
    for p in rna.properties:
        if p.identifier == 'rna_type': continue
        t = p.type
        if t == 'ENUM':
            try: t += '{' + ','.join(i.identifier for i in p.enum_items) + '}'
            except Exception: pass
        elif t in ('POINTER', 'COLLECTION') and getattr(p, 'fixed_type', None):
            t += '<' + p.fixed_type.identifier + '>'
        d = (p.description or '').replace('\n', ' ')
        out.append(f'  .{p.identifier}: {t}  {d}')
    return out

def build():
    import bpy
    os.makedirs(CACHE, exist_ok=True)
    with open(os.path.join(CACHE, 'ops.txt'), 'w') as f:
        f.write(f'# bpy.ops for Blender {bpy.app.version_string}\n')
        for mod in sorted(dir(bpy.ops)):
            for name in sorted(dir(getattr(bpy.ops, mod))):
                try:
                    op = getattr(getattr(bpy.ops, mod), name); rna = op.get_rna_type()
                except Exception: continue
                f.write(f'bpy.ops.{mod}.{name}()  {(rna.description or "").strip()}\n')
                f.write('\n'.join(_props(rna)) + '\n')
    with open(os.path.join(CACHE, 'types.txt'), 'w') as f:
        f.write(f'# bpy.types for Blender {bpy.app.version_string}\n')
        for name in sorted(dir(bpy.types)):
            cls = getattr(bpy.types, name)
            rna = getattr(cls, 'bl_rna', None)
            if rna is None: continue
            base = rna.base.identifier if rna.base else ''
            f.write(f'bpy.types.{name}({base})  {(rna.description or "").strip()}\n')
            f.write('\n'.join(_props(rna)) + '\n')
    # node sockets need a live node tree
    with open(os.path.join(CACHE, 'nodes.txt'), 'w') as f:
        f.write(f'# node sockets for Blender {bpy.app.version_string}\n')
        trees = {'ShaderNode': bpy.data.materials.new('api_m'), 'GeometryNode': None, 'CompositorNode': None}
        m = trees['ShaderNode']; m.use_nodes = True
        gt = bpy.data.node_groups.new('api_g', 'GeometryNodeTree')
        for name in sorted(dir(bpy.types)):
            tree = m.node_tree if name.startswith('ShaderNode') else gt if name.startswith(('GeometryNode', 'FunctionNode')) else None
            if tree is None: continue
            try: n = tree.nodes.new(name)
            except Exception: continue
            ins = ', '.join(f'{s.name}[{s.type}]' for s in n.inputs)
            outs = ', '.join(f'{s.name}[{s.type}]' for s in n.outputs)
            f.write(f'{name}\n  IN: {ins}\n  OUT: {outs}\n')
            tree.nodes.remove(n)
    print('built', CACHE)

def _blocks(path):
    blk = []
    for line in open(path):
        if not line.startswith('  ') and blk: yield blk; blk = []
        blk.append(line.rstrip('\n'))
    if blk: yield blk

def find(pat, n=40):
    if not os.path.isdir(CACHE): build()
    rx = re.compile(pat, re.I); hits = 0
    for fn in ('ops.txt', 'types.txt', 'nodes.txt'):
        for blk in _blocks(os.path.join(CACHE, fn)):
            head = blk[0]
            if rx.search(head):
                print(head); [print(l) for l in blk[1:12]]
                if len(blk) > 12: print(f'  ... {len(blk)-12} more')
                hits += 1
            else:
                sub = [l for l in blk[1:] if rx.search(l)]
                if sub: print(head); [print(l) for l in sub[:6]]; hits += 1
            if hits >= n: return

def node(t):
    for blk in _blocks(os.path.join(CACHE, 'nodes.txt')):
        if blk[0].strip() == t: print('\n'.join(blk)); return
    print('no node', t)

if __name__ == '__main__':
    a = sys.argv[1:]
    if not a or a[0] == 'build': build()
    elif a[0] == 'find': find(a[1], int(a[3]) if len(a) > 3 and a[2] == '-n' else 40)
    elif a[0] == 'node': node(a[1])
