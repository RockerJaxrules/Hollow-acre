# Shrink a skinned GLB with KHR_mesh_quantization: normals/tangents -> int8, UVs -> uint16, weights -> uint8.
# Positions stay float (skinning precision). three.js GLTFLoader reads this extension natively.
import json, struct, sys, numpy as np
src, dst = sys.argv[1], sys.argv[2]
b = open(src, 'rb').read()
jl = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20 + jl]); off = 20 + jl
bl = struct.unpack('<I', b[off:off + 4])[0]; BIN = b[off + 8: off + 8 + bl]
CT = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}
def read(ai):
    a = J['accessors'][ai]; bv = J['bufferViews'][a['bufferView']]; n = NC[a['type']]; dt = CT[a['componentType']]
    start = bv.get('byteOffset', 0) + a.get('byteOffset', 0); stride = bv.get('byteStride', 0)
    isz = np.dtype(dt).itemsize * n
    if stride and stride != isz:
        raw = np.frombuffer(BIN, np.uint8, count=stride * a['count'], offset=start).reshape(a['count'], stride)[:, :isz]
        return np.frombuffer(raw.tobytes(), dt).reshape(a['count'], n)
    return np.frombuffer(BIN, dt, count=a['count'] * n, offset=start).reshape(a['count'], n).copy()
out = bytearray(); views = []; accs = []
def add(arr, ctype, typ, target=None, normalized=False, stride=None, minmax=False):
    global out
    while len(out) % 4: out += b'\0'
    data = arr.tobytes(); view = {'buffer': 0, 'byteOffset': len(out), 'byteLength': len(data)}
    if stride: view['byteStride'] = stride
    if target: view['target'] = target
    out += data; views.append(view)
    acc = {'bufferView': len(views) - 1, 'componentType': ctype, 'count': int(arr.shape[0]), 'type': typ}
    if normalized: acc['normalized'] = True
    if minmax: acc['min'] = [float(x) for x in arr.min(0)]; acc['max'] = [float(x) for x in arr.max(0)]
    accs.append(acc); return len(accs) - 1
def pad4(a, fill=0):
    return np.concatenate([a, np.full((a.shape[0], 1), fill, a.dtype)], 1)
remap = {}
for m in J['meshes']:
    for p in m['primitives']:
        at = p['attributes']; new = {}
        for k, ai in at.items():
            v = read(ai)
            if k == 'POSITION': new[k] = add(v.astype(np.float32), 5126, 'VEC3', 34962, minmax=True)
            elif k == 'NORMAL':
                q = np.clip(np.round(v * 127), -127, 127).astype(np.int8); new[k] = add(pad4(q), 5120, 'VEC3', 34962, True, stride=4)
                accs[-1]['count'] = v.shape[0]
            elif k == 'TANGENT':
                q = np.clip(np.round(v * 127), -127, 127).astype(np.int8); new[k] = add(q, 5120, 'VEC4', 34962, True)
            elif k.startswith('TEXCOORD'):
                assert v.min() >= -.01 and v.max() <= 1.01, (k, v.min(), v.max())
                q = np.clip(np.round(v * 65535), 0, 65535).astype(np.uint16); new[k] = add(q, 5123, 'VEC2', 34962, True)
            elif k.startswith('WEIGHTS'):
                w = v / np.maximum(v.sum(1, keepdims=True), 1e-9); q = np.floor(w * 255).astype(np.int32)
                rem = 255 - q.sum(1); q[np.arange(len(q)), np.argmax(w, 1)] += rem; new[k] = add(q.astype(np.uint8), 5121, 'VEC4', 34962, True)
            elif k.startswith('JOINTS'): new[k] = add(v.astype(np.uint8), 5121, 'VEC4', 34962)
            elif k.startswith('COLOR'): continue
            else: new[k] = add(v, J['accessors'][ai]['componentType'], J['accessors'][ai]['type'], 34962)
        p['attributes'] = new
        idx = read(p['indices']).ravel(); p['indices'] = add(idx.astype(np.uint16 if idx.max() < 65535 else np.uint32), 5123 if idx.max() < 65535 else 5125, 'SCALAR', 34963)
for s in J.get('skins', []):
    s['inverseBindMatrices'] = add(read(s['inverseBindMatrices']).astype(np.float32), 5126, 'MAT4')
J['accessors'] = accs; J['bufferViews'] = views
while len(out) % 4: out += b'\0'
J['buffers'] = [{'byteLength': len(out)}]
for k in ('extensionsUsed', 'extensionsRequired'): J[k] = sorted(set(J.get(k, [])) | {'KHR_mesh_quantization'})
js = json.dumps(J, separators=(',', ':')).encode()
while len(js) % 4: js += b' '
total = 12 + 8 + len(js) + 8 + len(out)
o = struct.pack('<III', 0x46546C67, 2, total) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(out), 0x004E4942) + bytes(out)
open(dst, 'wb').write(o); print(src, len(b), '->', dst, len(o))
