// Hollow Acre, Part 2 test: the drive up the mountain in a blizzard, first person, at night.
// Everything here is made in code: the mountain, the road, the pines, the cab, the hands and the snow.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Color, FogExp2, Object3D, Group, Mesh, InstancedMesh, Points,
  BufferGeometry, BufferAttribute, Float32BufferAttribute, PlaneGeometry, BoxGeometry, CylinderGeometry, ConeGeometry,
  TorusGeometry, CapsuleGeometry, IcosahedronGeometry, SphereGeometry, ExtrudeGeometry, Shape, MeshStandardMaterial,
  MeshBasicMaterial, ShaderMaterial, CanvasTexture, RepeatWrapping, SRGBColorSpace, HemisphereLight, SpotLight,
  PointLight, Vector3, Matrix4, Quaternion, Euler, CatmullRomCurve3, WebGLRenderTarget, HalfFloatType,
  UnsignedByteType, LinearFilter, AdditiveBlending, DoubleSide, OrthographicCamera, MathUtils, NoToneMapping,
  LinearSRGBColorSpace
} from 'three';

const Q = new URLSearchParams(location.search);
const FIXED_T = Q.has('t') ? parseFloat(Q.get('t')) : null;   // freeze the clock (for screenshots)

// ---------------------------------------------------------------- the player's look, read from the farm's save
function readLook() {
  let look = null, married = false;
  try {
    let best = null;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith('hollowSave1') || k.endsWith('_morning')) continue;
      const d = JSON.parse(localStorage.getItem(k) || 'null');
      if (d && d.S && (!best || (d.t || 0) > (best.t || 0))) best = d;
    }
    if (best) {
      look = best.S.look || null;
      married = Object.values(best.S.rom || {}).some(r => r && r.married);
    }
  } catch (e) {}
  look = Object.assign({ skin: '#e8b48c', shirt: '#b8402c', outfit: 'shirt', pattern: '' }, look || {});
  if (Q.get('shirt')) look.shirt = '#' + Q.get('shirt');
  if (Q.get('skin')) look.skin = '#' + Q.get('skin');
  if (Q.has('pattern')) look.pattern = Q.get('pattern');
  if (Q.has('outfit')) look.outfit = Q.get('outfit');
  if (Q.has('married')) married = Q.get('married') === '1';
  // short sleeves in a blizzard: whoever packed for the mountain put a coat on over them
  const bare = ['tee', 'tank', 'vest', 'overalls', 'skirt', 'dress'].includes(look.outfit);
  return { skin: look.skin, sleeve: bare ? '#3e4636' : look.shirt, pattern: bare ? '' : (look.pattern || ''), married };
}
const LOOK = readLook();

// ---------------------------------------------------------------- noise
function hash(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, o = 4) { let s = 0, a = .5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= .5; } return s; }
let rngS = 7; const rnd = () => { rngS = (rngS * 16807) % 2147483647; return (rngS - 1) / 2147483646; };
const smooth = MathUtils.smoothstep;

// ---------------------------------------------------------------- the mountain and the road
// the slope rises toward -z; the road crosses it in long slanting legs joined by hairpins
const natH = (x, z) => .55 * (60 - z) + (fbm(x * .011 + 3, z * .011 + 7) - .5) * 22 + (fbm(x * .05, z * .05) - .5) * 3;
const ctrl = [
  [-175, 96], [-110, 88], [-45, 80], [20, 72], [72, 65], [100, 58], [109, 47], [98, 38], [70, 34], [10, 27], [-50, 20],
  [-98, 13], [-121, 5], [-124, -6], [-110, -13], [-75, -17], [-15, -24], [45, -31], [105, -38], [165, -45]
];
const curve = new CatmullRomCurve3(ctrl.map(p => new Vector3(p[0], 0, p[1])), false, 'centripetal');
const ROAD_LEN = curve.getLength(), NS = Math.ceil(ROAD_LEN);
const RS = [];                             // a sample every metre: {x,y,z,tx,tz}
{
  const pts = curve.getSpacedPoints(NS), raw = pts.map(p => natH(p.x, p.z));
  let prev = -1e9;
  for (let i = 0; i <= NS; i++) {
    const p = pts[i], n = pts[Math.min(i + 1, NS)], b = pts[Math.max(i - 1, 0)];
    let tx = n.x - b.x, tz = n.z - b.z; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
    let s = 0, c = 0; for (let j = Math.max(0, i - 30); j <= Math.min(NS, i + 30); j++) { s += raw[j]; c++; }
    const y = Math.max(prev + .005, s / c - .6); prev = y;                 // smoothed, and always climbing
    RS.push({ x: p.x, z: p.z, y, tx, tz });
  }
}
const GC = 12, grid = new Map();
RS.forEach((r, i) => { const k = Math.floor(r.x / GC) + ',' + Math.floor(r.z / GC); (grid.get(k) || grid.set(k, []).get(k)).push(i); });
function nearestRoad(x, z) {
  const gx = Math.floor(x / GC), gz = Math.floor(z / GC); let best = -1, bd = 1e9;
  for (let r = 1; r <= 3 && best < 0; r++)
    for (let i = gx - r; i <= gx + r; i++) for (let j = gz - r; j <= gz + r; j++) {
      const L = grid.get(i + ',' + j); if (!L) continue;
      for (const k of L) { const s = RS[k], d = (s.x - x) ** 2 + (s.z - z) ** 2; if (d < bd) { bd = d; best = k; } }
    }
  return best < 0 ? { i: 0, d: 1e9 } : { i: best, d: Math.sqrt(bd) };
}
const ROAD_HW = 3.4;
function groundH(x, z) {
  const nat = natH(x, z), nr = nearestRoad(x, z);
  if (nr.d > 45) return nat;
  const ry = RS[nr.i].y;
  if (nr.d < ROAD_HW + .9) return ry - .05;
  const cut = nat > ry;                    // uphill: a steep rock cut; downhill: a long fill slope falling away
  const margin = cut ? 1.5 + Math.min(5, (nat - ry) * .22) : 5 + Math.min(14, (ry - nat) * .7);
  return ry + (nat - ry) * smooth(nr.d, ROAD_HW + .9, ROAD_HW + .9 + margin);
}
const DROP = RS.map(r => { const nx = -r.tz, nz = r.tx; return natH(r.x + nx * 10, r.z + nz * 10) < natH(r.x - nx * 10, r.z - nz * 10) ? 1 : -1; });
// keep the rail on one side for whole stretches (no flicking side to side)
for (let pass = 0; pass < 2; pass++) for (let i = 0; i < DROP.length; i++) {
  let a = 0; for (let j = Math.max(0, i - 25); j <= Math.min(DROP.length - 1, i + 25); j++) a += DROP[j]; DROP[i] = a >= 0 ? 1 : -1;
}

// ---------------------------------------------------------------- textures drawn in code
function canvasTex(w, h, draw, rep = true, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new CanvasTexture(c); if (srgb) t.colorSpace = SRGBColorSpace; if (rep) t.wrapS = t.wrapT = RepeatWrapping; t.anisotropy = 4; return t;
}
const roadTex = canvasTex(128, 512, (g, w, h) => {
  const id = g.createImageData(w, h), d = id.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const n = fbm(x * .05, y * .02, 3), rut = Math.min(Math.abs(x - 36), Math.abs(x - 92));
    let snow = smooth(n, .40, .62) * (rut < 8 ? .2 : 1);              // packed snow, worn through in the wheel ruts
    snow = Math.max(snow, 1 - smooth(Math.min(x, w - 1 - x), 0, 16));     // drifted at the edges
    const grit = (hash(x, y) - .5) * 16, o = (y * w + x) * 4, c0 = [44, 46, 52], c1 = [200, 207, 216];
    for (let k = 0; k < 3; k++) d[o + k] = c0[k] + (c1[k] - c0[k]) * snow + grit;
    d[o + 3] = 255;
  }
  g.putImageData(id, 0, 0);
});
function sleeveTex(hex, pattern) {
  return canvasTex(64, 64, (g, w, h) => {
    const c = new Color(hex); g.fillStyle = '#' + c.getHexString(); g.fillRect(0, 0, w, h);
    const dark = '#' + c.clone().multiplyScalar(.5).getHexString(), light = '#' + c.clone().lerp(new Color('#ffffff'), .3).getHexString();
    if (pattern === 'plaid') { g.globalAlpha = .5; g.fillStyle = dark; for (let i = 0; i < 64; i += 16) { g.fillRect(i, 0, 6, 64); g.fillRect(0, i, 64, 6); } g.globalAlpha = .35; g.fillStyle = light; for (let i = 10; i < 64; i += 16) { g.fillRect(i, 0, 1, 64); g.fillRect(0, i, 64, 1); } }
    else if (pattern === 'stripes') { g.fillStyle = dark; for (let i = 0; i < 64; i += 8) g.fillRect(0, i, 64, 3); }
    else if (pattern === 'dots') { g.fillStyle = light; for (let y = 4; y < 64; y += 10) for (let x = (y / 10 & 1) * 5 + 3; x < 64; x += 10) { g.beginPath(); g.arc(x, y, 1.6, 0, 7); g.fill(); } }
    g.globalAlpha = .14; for (let i = 0; i < 600; i++) { g.fillStyle = hash(i, 3) > .5 ? '#000' : '#fff'; g.fillRect(hash(i, 1) * 64, hash(i, 2) * 64, 1, 1); }   // weave
    g.globalAlpha = .18; g.fillStyle = '#000'; for (let y = 0; y < 64; y += 2) g.fillRect(0, y, 64, 1);
  });
}
const gaugeTex = canvasTex(256, 112, (g, w, h) => {
  g.fillStyle = '#020304'; g.fillRect(0, 0, w, h);
  for (const cx of [62, 194]) {
    g.strokeStyle = 'rgba(255,170,90,.95)'; g.lineWidth = 2; g.beginPath(); g.arc(cx, 60, 46, Math.PI * .8, Math.PI * 2.2); g.stroke();
    for (let i = 0; i <= 12; i++) { const a = Math.PI * .8 + i / 12 * Math.PI * 1.4, r0 = i % 2 ? 41 : 37; g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, 60 + Math.sin(a) * r0); g.lineTo(cx + Math.cos(a) * 46, 60 + Math.sin(a) * 46); g.stroke(); }
  }
  g.fillStyle = 'rgba(255,170,90,.5)'; g.fillRect(108, 70, 40, 12);          // odometer
  g.fillStyle = 'rgba(255,60,40,.95)'; g.beginPath(); g.arc(128, 30, 5, 0, 7); g.fill();   // a warning lamp, lit
}, false);
// the windscreen: clear where the wipers reach, a crust of snow and frost everywhere else
const PIVOTS = [[-.62, .03], [.16, .03]], ARM = .66, GLASS_W = 1.62, GLASS_H = .82;
const frostTex = canvasTex(512, 256, (g, w, h) => {
  const id = g.createImageData(w, h), d = id.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const gx = (x / w - .5) * GLASS_W, gy = (1 - y / h) * GLASS_H;
    let wiped = 0; for (const [px, py] of PIVOTS) { const r = Math.hypot(gx - px, gy - py), a = Math.atan2(gy - py, gx - px); if (r < ARM + .02 && r > .07 && a > -.05 && a < 1.95) wiped = Math.max(wiped, 1 - smooth(r, ARM - .04, ARM + .02)); }
    const ex = Math.min(x, w - 1 - x) / w, ey = Math.min(y, h - 1 - y) / h, edge = 1 - smooth(Math.min(ex * 2.4, ey * 1.6), 0, .1);
    const n = fbm(x * .05, y * .05, 4);
    let a = Math.max(edge * .9, (1 - wiped) * smooth(n, .3, .6) * .85);
    a = Math.max(a, (1 - wiped) * .25) + (wiped > .5 && hash(x, y) > .9985 ? .5 : 0);
    const o = (y * w + x) * 4, br = 170 + n * 60; d[o] = br; d[o + 1] = br + 6; d[o + 2] = br + 14; d[o + 3] = Math.min(255, a * 255);
  }
  g.putImageData(id, 0, 0);
}, false);

// ---------------------------------------------------------------- renderer, scene, camera
const canvas = document.getElementById('view');
const renderer = new WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.toneMapping = NoToneMapping; renderer.outputColorSpace = LinearSRGBColorSpace;
const scene = new Scene(); const NIGHT = new Color('#06080d'); scene.background = NIGHT; scene.fog = new FogExp2(NIGHT, .034);
const camera = new PerspectiveCamera(66, 1, .03, 220);
scene.add(new HemisphereLight('#3a4a64', '#08090c', .36));

// terrain
{
  const X0 = -190, X1 = 190, Z0 = -80, Z1 = 125, STEP = 2.2;
  const nx = Math.round((X1 - X0) / STEP), nz = Math.round((Z1 - Z0) / STEP), W = nx + 1;
  const pos = new Float32Array(W * (nz + 1) * 3), col = new Float32Array(W * (nz + 1) * 3), idx = [], H = new Float32Array(W * (nz + 1));
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) H[j * W + i] = groundH(X0 + i * STEP, Z0 + j * STEP);
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
    const k = j * W + i, x = X0 + i * STEP, z = Z0 + j * STEP;
    pos.set([x, H[k], z], k * 3);
    const hx = H[j * W + Math.min(i + 1, nx)] - H[j * W + Math.max(i - 1, 0)], hz = H[Math.min(j + 1, nz) * W + i] - H[Math.max(j - 1, 0) * W + i];
    const slope = Math.hypot(hx, hz) / (2 * STEP), n = fbm(x * .15, z * .15, 3);
    const rock = smooth(slope + (n - .5) * .6, .6, 1.0);
    const sn = [.62 + n * .14, .66 + n * .14, .74 + n * .12], st = [.07 + n * .05, .07 + n * .05, .08 + n * .05];
    col.set([sn[0] + (st[0] - sn[0]) * rock, sn[1] + (st[1] - sn[1]) * rock, sn[2] + (st[2] - sn[2]) * rock], k * 3);
    if (i < nx && j < nz) idx.push(k, k + W, k + 1, k + 1, k + W, k + W + 1);
  }
  const g = new BufferGeometry(); g.setAttribute('position', new BufferAttribute(pos, 3)); g.setAttribute('color', new BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new Mesh(g, new MeshStandardMaterial({ vertexColors: true, roughness: .95 })); m.receiveShadow = true; scene.add(m);
}
function ribbon(offA, offB, dyA, dyB, vScale) {
  const pos = [], uv = [], idx = [];
  RS.forEach((r, n) => {
    const nx = -r.tz, nz = r.tx;
    pos.push(r.x + nx * offA, r.y + dyA, r.z + nz * offA, r.x + nx * offB, r.y + dyB, r.z + nz * offB);
    uv.push(0, n / vScale, 1, n / vScale);
    if (n > 0) { const a = (n - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  });
  const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
{
  const road = new Mesh(ribbon(-ROAD_HW, ROAD_HW, .06, .06, 9), new MeshStandardMaterial({ map: roadTex, roughness: .75 }));
  road.receiveShadow = true; scene.add(road);
  const bermM = new MeshStandardMaterial({ color: '#b9c3cf', roughness: 1 });
  scene.add(new Mesh(ribbon(-ROAD_HW - 1.3, -ROAD_HW + .1, .4, .07, 9), bermM), new Mesh(ribbon(ROAD_HW - .1, ROAD_HW + 1.3, .07, .4, 9), bermM));
}
// guard rail on the drop side: posts, a steel band with snow along its top, and reflectors
const REFLECT = [];
{
  const posts = [], M = new Matrix4();
  for (let i = 0; i < RS.length; i += 3) { const r = RS[i], o = (ROAD_HW + 1.2) * DROP[i]; posts.push([r.x - r.tz * o, r.y, r.z + r.tx * o]); if (i % 12 === 0) REFLECT.push([r.x - r.tz * o, r.y + .78, r.z + r.tx * o, 1]); }
  const pm = new InstancedMesh(new BoxGeometry(.12, 1.0, .16), new MeshStandardMaterial({ color: '#4a4640', roughness: .8 }), posts.length);
  posts.forEach((p, i) => { M.makeTranslation(p[0], p[1] + .45, p[2]); pm.setMatrixAt(i, M); }); pm.castShadow = true; scene.add(pm);
  const pos = [], idx = [], sp = [];
  RS.forEach((r, i) => {
    const o = (ROAD_HW + 1.08) * DROP[i], x = r.x - r.tz * o, z = r.z + r.tx * o, ox = -r.tz * .14 * DROP[i], oz = r.tx * .14 * DROP[i];
    pos.push(x, r.y + .6, z, x, r.y + .92, z); sp.push(x, r.y + .95, z, x + ox, r.y + .95, z + oz);
    if (i > 0 && DROP[i] === DROP[i - 1]) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  });
  const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  scene.add(new Mesh(g, new MeshStandardMaterial({ color: '#a4acb6', roughness: .45, metalness: .35, side: DoubleSide })));
  const gs = new BufferGeometry(); gs.setAttribute('position', new Float32BufferAttribute(sp, 3)); gs.setIndex(idx.slice()); gs.computeVertexNormals();
  scene.add(new Mesh(gs, new MeshStandardMaterial({ color: '#d0d8e2', roughness: 1, side: DoubleSide })));
}
// snow poles on the uphill side, orange, with a reflector at the top (the plough driver's guide)
{
  const poles = [], M = new Matrix4();
  for (let i = 8; i < RS.length; i += 22) { const r = RS[i], o = -(ROAD_HW + 1.6) * DROP[i], x = r.x - r.tz * o, z = r.z + r.tx * o; poles.push([x, groundH(x, z), z]); REFLECT.push([x, groundH(x, z) + 1.75, z, 0]); }
  const pm = new InstancedMesh(new CylinderGeometry(.025, .03, 1.9, 6), new MeshStandardMaterial({ color: '#d0582a', roughness: .6 }), poles.length);
  poles.forEach((p, i) => { M.makeTranslation(p[0], p[1] + .9, p[2]); pm.setMatrixAt(i, M); }); scene.add(pm);
}
// pines: four tiers and a trunk, snow on the upper faces, drawn as one instanced mesh
function pineGeo() {
  const parts = [];
  const add = (g, y, c, snowy) => {
    g = g.toNonIndexed(); g.translate(0, y, 0); const n = g.attributes.position.count, col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const ny = g.attributes.normal.getY(i), s = snowy && ny > .3 && hash(i, y) > .2; col.set(s ? [.66, .7, .78] : c, i * 3); }
    g.setAttribute('color', new BufferAttribute(col, 3)); parts.push(g);
  };
  add(new CylinderGeometry(.16, .24, 3, 6), 1.5, [.12, .08, .06], false);
  [[2.6, 3.2, 2.5], [2.1, 2.9, 4.2], [1.6, 2.6, 5.8], [1.0, 2.2, 7.3]].forEach(([r, h, y]) => add(new ConeGeometry(r, h, 9, 1, true), y, [.03, .06, .045], true));
  let n = 0; parts.forEach(p => n += p.attributes.position.count);
  const out = new BufferGeometry(); for (const a of ['position', 'normal', 'color']) { const arr = new Float32Array(n * 3); let o = 0; parts.forEach(p => { arr.set(p.attributes[a].array, o); o += p.attributes[a].array.length; }); out.setAttribute(a, new BufferAttribute(arr, 3)); }
  return out;
}
const PINE_GEO = pineGeo(), PINE_MAT = new MeshStandardMaterial({ vertexColors: true, roughness: .9, side: DoubleSide }), PINE_SPOTS = [];
{
  rngS = 11;
  for (let t = 0; t < 9000 && PINE_SPOTS.length < 800; t++) {
    const x = -185 + rnd() * 370, z = -75 + rnd() * 195, nr = nearestRoad(x, z); if (nr.d < 7.5) continue;
    const y = groundH(x, z), sl = Math.abs(groundH(x + 1.5, z) - groundH(x - 1.5, z)) + Math.abs(groundH(x, z + 1.5) - groundH(x, z - 1.5));
    if (sl > 3.4) continue;
    PINE_SPOTS.push([x, y - .3, z, .7 + rnd() * .8, rnd() * 6.28, nr.d]);
  }
  PINE_SPOTS.sort((a, b) => a[5] - b[5]);               // the nearest the road first, so low quality keeps the ones you see
}
let pines = null;
function buildPines(count) {
  if (pines) { scene.remove(pines); pines.dispose(); }
  pines = new InstancedMesh(PINE_GEO, PINE_MAT, Math.min(count, PINE_SPOTS.length));
  const M = new Matrix4(), q = new Quaternion(), e = new Euler();
  for (let i = 0; i < pines.count; i++) { const p = PINE_SPOTS[i]; q.setFromEuler(e.set(0, p[4], 0)); M.compose(new Vector3(p[0], p[1], p[2]), q, new Vector3(p[3], p[3] * (.9 + hash(i, 9) * .35), p[3])); pines.setMatrixAt(i, M); }
  pines.castShadow = true; scene.add(pines);
}
// rocks along the cut banks
{
  const g = new IcosahedronGeometry(1, 1), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const v = new Vector3().fromBufferAttribute(p, i), k = .75 + fbm(v.x * 2 + 5, v.y * 2 + v.z * 2, 2) * .6; p.setXYZ(i, v.x * k, v.y * k * .8, v.z * k); }
  g.computeVertexNormals();
  const rocks = []; rngS = 5;
  for (let i = 0; i < RS.length && rocks.length < 140; i += 4) {
    const r = RS[i], side = -DROP[i], o = (ROAD_HW + 2.3 + rnd() * 3) * side, x = r.x - r.tz * o, z = r.z + r.tx * o;
    if (natH(x, z) - r.y < 2 || rnd() < .45) continue; rocks.push([x, groundH(x, z) + .1, z, .5 + rnd() * 1.4]);
  }
  const im = new InstancedMesh(g, new MeshStandardMaterial({ color: '#34363b', roughness: .95, flatShading: true }), rocks.length), M = new Matrix4();
  rocks.forEach((q, i) => { M.compose(new Vector3(q[0], q[1], q[2]), new Quaternion().setFromEuler(new Euler(hash(i, 1) * 3, hash(i, 2) * 6, 0)), new Vector3(q[3], q[3], q[3])); im.setMatrixAt(i, M); });
  im.castShadow = true; scene.add(im);
}

// ---------------------------------------------------------------- the car, the cab and you
// car space: x to the right, y up from the road, -z forward. The driver sits on the left.
const car = new Group(); scene.add(car);
const EYE = new Vector3(-.36, 1.2, 0);
const head = new Group(); head.position.copy(EYE); car.add(head); head.add(camera);
const cab = new Group(); car.add(cab);
const M_dash = new MeshStandardMaterial({ color: '#16171b', roughness: .75 }), M_trim = new MeshStandardMaterial({ color: '#0d0e11', roughness: .6 }),
  M_skin = new MeshStandardMaterial({ color: LOOK.skin, roughness: .6 }), M_sleeve = new MeshStandardMaterial({ map: sleeveTex(LOOK.sleeve, LOOK.pattern), roughness: .92 }),
  M_paint = new MeshStandardMaterial({ color: '#4a1512', roughness: .35, metalness: .4 }), M_snow = new MeshStandardMaterial({ color: '#c9d1dc', roughness: 1 });
const put = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0, parent = cab) => { const o = new Mesh(geo, mat); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); parent.add(o); return o; };
const V = (x, y, z) => new Vector3(x, y, z);
function strut(a, b, w, d, mat) {         // a box from point a to point b
  const dir = b.clone().sub(a), o = new Mesh(new BoxGeometry(w, dir.length(), d), mat);
  o.position.copy(a).add(b).multiplyScalar(.5); o.quaternion.setFromUnitVectors(V(0, 1, 0), dir.normalize()); cab.add(o); return o;
}
// the dashboard: a side profile pushed across the width of the car
{
  const s = new Shape(); [[1.1, .965], [.9, .975], [.7, .975], [.6, .955], [.56, .9], [.52, .78], [.52, .5], [1.1, .5]].forEach(([u, v], i) => i ? s.lineTo(u, v) : s.moveTo(u, v));
  const g = new ExtrudeGeometry(s, { depth: 1.74, bevelEnabled: true, bevelSize: .015, bevelThickness: .015, bevelSegments: 2, curveSegments: 4 });
  g.rotateY(Math.PI / 2); g.translate(-.87, 0, 0); cab.add(new Mesh(g, M_dash));
  // the hood over the gauges, an arch in front of the driver
  const arch = new CylinderGeometry(.11, .11, .2, 16, 1, true, Math.PI / 2, Math.PI); arch.rotateX(Math.PI / 2); arch.scale(1, .55, 1);
  const cap = new CylinderGeometry(.11, .11, .012, 16, 1, false, Math.PI / 2, Math.PI); cap.rotateX(Math.PI / 2); cap.scale(1, .55, 1);
  const hm = new MeshStandardMaterial({ color: '#16171b', roughness: .75, side: DoubleSide });
  put(arch, hm, EYE.x, .935, -.69); put(cap, hm, EYE.x, .935, -.79);
  // the vents and the radio, faintly
  put(new BoxGeometry(.2, .05, .01), M_trim, .02, .86, -.53); put(new BoxGeometry(.16, .07, .01), new MeshStandardMaterial({ color: '#0a0b0d', emissive: '#1a0e06', roughness: .4 }), .02, .76, -.53);
}
// the gauges, glowing faintly, with two needles
const gauge = put(new PlaneGeometry(.2, .087), new MeshBasicMaterial({ map: gaugeTex, color: '#e8d8c8' }), EYE.x, .925, -.7, -.18);
const needles = [-.052, .052].map(x => { const g = new BoxGeometry(.0024, .03, .002); g.translate(0, .014, .0); const n = new Mesh(g, new MeshBasicMaterial({ color: '#ff7040' })); n.position.set(x, -.004, .004); gauge.add(n); return n; });
// glass, pillars, roof, mirror, doors
const GLASS_A = V(0, .97, -1.1), GLASS_B = V(0, 1.47, -.43);          // bottom and top of the windscreen
const glassTilt = Math.atan2(GLASS_B.z - GLASS_A.z, GLASS_B.y - GLASS_A.y);
const glass = new Group(); glass.position.copy(GLASS_A); glass.rotation.x = glassTilt; cab.add(glass);
{
  const fm = new Mesh(new PlaneGeometry(GLASS_W, GLASS_H), new MeshBasicMaterial({ map: frostTex, color: '#161a21', transparent: true, depthWrite: false, fog: false }));
  fm.position.set(0, GLASS_H / 2, 0); glass.add(fm); fm.visible = !Q.get('nofrost');
}
strut(V(-.82, .96, -1.1), V(-.73, 1.48, -.42), .09, .12, M_trim); strut(V(.82, .96, -1.1), V(.73, 1.48, -.42), .09, .12, M_trim);   // A-pillars
put(new BoxGeometry(1.6, .09, .16), M_trim, 0, 1.5, -.42);                         // header
put(new BoxGeometry(1.7, .03, 1.3), new MeshStandardMaterial({ color: '#1d1e22', roughness: 1 }), 0, 1.56, .2);   // headliner
put(new BoxGeometry(.21, .062, .03), M_trim, .02, 1.4, -.52, 0, .18);           // rear-view mirror
put(new BoxGeometry(.015, .08, .015), M_trim, .02, 1.46, -.5);
put(new BoxGeometry(.19, .05, .004), new MeshBasicMaterial({ color: '#0f1218' }), .023, 1.4, -.504, 0, .18);
for (const s of [-1, 1]) {
  put(new BoxGeometry(.06, .5, 1.5), M_dash, s * .88, .76, -.1);                   // door panel
  put(new BoxGeometry(.1, .05, 1.5), M_trim, s * .86, 1.02, -.1);                   // window sill
}
// the bonnet, with snow piled at the bottom of the glass
put(new BoxGeometry(1.74, .1, 1.6), M_paint, 0, .88, -1.92, -.05);
{
  const g = new CylinderGeometry(.09, .09, 1.5, 10, 1, false, 0, Math.PI); g.rotateZ(Math.PI / 2);
  const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) * (.6 + .5 * fbm(p.getX(i) * 4 + 2, 1, 2)));
  g.computeVertexNormals(); put(g, M_snow, 0, .96, -1.17);
}
// wipers: they lie along the bottom of the glass and sweep up across it
const wipers = PIVOTS.map(([px, py]) => {
  const pivot = new Group(); pivot.position.set(px, py, -.025); glass.add(pivot);
  const arm = new Mesh(new BoxGeometry(ARM, .014, .012), M_trim); arm.position.x = ARM / 2; pivot.add(arm);
  const blade = new Mesh(new BoxGeometry(ARM * .82, .022, .02), M_trim); blade.position.set(ARM * .55, .0, -.012); pivot.add(blade);
  return pivot;
});
// the wheel
const wheelMount = new Group(); wheelMount.position.set(EYE.x, .9, -.47); wheelMount.rotation.x = -.42; cab.add(wheelMount);
const wheel = new Group(); wheelMount.add(wheel);
const RIM_R = .185, M_wheel = new MeshStandardMaterial({ color: '#16161a', roughness: .5 });
wheel.add(new Mesh(new TorusGeometry(RIM_R, .016, 10, 48), M_wheel));
for (const a of [0, Math.PI, -Math.PI / 2]) { const s = new Mesh(new BoxGeometry(RIM_R - .04, .028, .014), M_wheel); s.position.set(Math.cos(a) * (RIM_R / 2 + .02), Math.sin(a) * (RIM_R / 2 + .02), -.005); s.rotation.z = a; wheel.add(s); }
{ const hub = new Mesh(new CylinderGeometry(.065, .07, .05, 20), M_wheel); hub.rotation.x = Math.PI / 2; hub.scale.set(1.15, 1, .85); wheel.add(hub); }
{ const col = new Mesh(new CylinderGeometry(.035, .045, .3, 10), M_trim); col.position.set(0, 0, -.15); col.rotation.x = Math.PI / 2; wheelMount.add(col); }
// your hands, gripping at ten and two; each hand is built in the rim's own frame
const wrists = [];
function hand(angle, side) {          // side -1: left hand, 1: right hand
  const g = new Group(), t = V(-Math.sin(angle), Math.cos(angle), 0), u = V(Math.cos(angle), Math.sin(angle), 0), n = V(0, 0, 1);
  g.quaternion.setFromRotationMatrix(new Matrix4().makeBasis(t, u, n)); g.position.copy(u).multiplyScalar(RIM_R); wheel.add(g);
  // x runs along the rim, y outward, z toward you
  const back = new Mesh(new SphereGeometry(1, 14, 10), M_skin); back.scale.set(.046, .018, .05); back.position.set(0, .009, .064); back.rotation.x = .27; g.add(back);
  const order = side < 0 ? [0, 1, 2, 3] : [3, 2, 1, 0];      // index, middle, ring, little
  const lens = [2.75, 2.85, 2.8, 2.5];
  order.forEach((f, k) => {
    const geo = new TorusGeometry(.027, k === 3 ? .009 : .0104, 6, 12, lens[k]); geo.rotateY(Math.PI / 2); geo.rotateX(2.3 - lens[k]);
    const m = new Mesh(geo, M_skin); m.position.x = (f - 1.5) * .02; g.add(m);
    if (k === 2 && side < 0 && LOOK.married) {
      const ring = new Mesh(new TorusGeometry(.0108, .0026, 6, 18), new MeshStandardMaterial({ color: '#e0b850', metalness: 1, roughness: .2, emissive: '#2a1e08' }));
      ring.position.set(m.position.x, .0234, .0135); ring.rotation.x = .52; g.add(ring);
    }
  });
  const thumb = new Mesh(new CapsuleGeometry(.0115, .036, 4, 8), M_skin); thumb.position.set(side * .04, -.016, .035); thumb.rotation.set(.5, 0, side * -1.2); g.add(thumb);
  const wrist = new Object3D(); wrist.position.set(0, -.006, .11); g.add(wrist); wrists.push(wrist);
}
hand(Math.PI * .83, -1); hand(Math.PI * .17, 1);
// the arms: reach from the shoulders to the wrists, bending at the elbow, in your own sleeves
const arms = [-1, 1].map(side => {
  const fore = new Mesh(new CylinderGeometry(.036, .046, 1, 14, 1, true), M_sleeve), upper = new Mesh(new CylinderGeometry(.05, .055, 1, 12, 1, true), M_sleeve);
  const cuff = new Mesh(new CylinderGeometry(.039, .039, .03, 14), M_sleeve), skin = new Mesh(new CylinderGeometry(.026, .03, 1, 10), M_skin), elbow = new Mesh(new SphereGeometry(.05, 10, 8), M_sleeve);
  car.add(fore, upper, cuff, skin, elbow);
  return { side, fore, upper, cuff, skin, elbow, shoulder: V(EYE.x + side * .2, .98, .12) };
});
const _w = new Vector3(), _e = new Vector3(), _d = new Vector3(), _p = new Vector3(), _c = new Vector3(), _k = new Vector3(), UP = V(0, 1, 0);
function place(mesh, a, b, len) { _d.copy(b).sub(a); const L = _d.length(); mesh.position.copy(a).addScaledVector(_d, .5); mesh.quaternion.setFromUnitVectors(UP, _d.divideScalar(L)); mesh.scale.set(1, len ?? L, 1); }
function poseArms() {
  arms.forEach((A, i) => {
    wrists[i].getWorldPosition(_w); car.worldToLocal(_w);
    const S = A.shoulder, a = .29, b = .27; _d.copy(_w).sub(S); const d = Math.min(_d.length(), a + b - .002); _d.normalize();
    const x = (a * a - b * b + d * d) / (2 * d), h = Math.sqrt(Math.max(0, a * a - x * x));
    _p.set(A.side * .75, -1, .05); _p.addScaledVector(_d, -_p.dot(_d)).normalize();
    _e.copy(S).addScaledVector(_d, x).addScaledVector(_p, h);
    _c.copy(_e).sub(_w).normalize().multiplyScalar(.045).add(_w);             // where the cuff starts
    place(A.skin, _w, _c); place(A.fore, _e, _c); _k.copy(_e).sub(_c).normalize().multiplyScalar(.03).add(_c); place(A.cuff, _c, _k, 1);
    place(A.upper, S, _e); A.elbow.position.copy(_e);
  });
}
// lights: two headlamps (set high so the road takes the light), the gauge glow, and the snow-light coming in through the glass
const lamps = [-.6, .6].map(x => { const s = new SpotLight('#eef3ff', 230, 85, .72, .9, 2); s.position.set(x, 1.7, -2.4); s.target.position.set(x * .5, 0, -22); car.add(s, s.target); return s; });
{ const g = new PointLight('#ffa860', .15, .2, 2); g.position.set(EYE.x, .94, -.74); car.add(g);
  const f = new PointLight('#8ea2c2', .55, 1.7, 2); f.position.set(-.36, 1.6, -.62); car.add(f); }
// faint beams in the falling snow: open cones drawn additively, fading with distance
const beamMat = new ShaderMaterial({ transparent: true, depthWrite: false, blending: AdditiveBlending, side: DoubleSide,
  uniforms: { k: { value: .03 } },
  vertexShader: 'varying float vY;varying vec3 vN;varying vec3 vV;void main(){vY=uv.y;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
  fragmentShader: 'uniform float k;varying float vY;varying vec3 vN;varying vec3 vV;void main(){float e=pow(abs(dot(vN,vV)),1.5);gl_FragColor=vec4(vec3(.75,.82,.95)*k*e*pow(vY,2.4),1.);}' });
for (const x of [-.6, .6]) { const c = new Mesh(new ConeGeometry(5, 28, 20, 1, true), beamMat); c.visible = !Q.get('nobeam'); c.position.set(x * .7, .6, -16.4); c.rotation.x = Math.PI / 2 - .03; car.add(c); }

// ---------------------------------------------------------------- falling snow: points stretched into streaks by the car's speed
const SNOW_VS = `uniform float t;uniform vec3 boxC;uniform vec3 box;uniform float scale;uniform vec3 wind;uniform vec3 carV;uniform vec3 res;uniform vec3 l0;uniform vec3 l1;uniform vec3 ld;uniform float bright;
attribute vec3 seed;varying float vA;varying vec2 vDir;varying float vLen;varying float vR;
float beam(vec3 p,vec3 o){vec3 L=p-o;float d=length(L);return smoothstep(.86,.97,dot(L/d,ld))/(1.+.006*d*d);}
void main(){
  vec3 w=wind+vec3(sin(t*.8+seed.y*6.3)*1.3,sin(t*1.7+seed.z*9.)*.6,cos(t*.6+seed.x*6.3)*1.3);
  vec3 p=seed*box+w*t;p=boxC+mod(p-boxC+box*.5,box)-box*.5;
  vec4 c0=projectionMatrix*viewMatrix*vec4(p,1.);vec4 c1=projectionMatrix*viewMatrix*vec4(p-(w-carV)*.022,1.);
  float d=c0.w;vec2 dv=vec2(0.);if(c1.w>.05&&d>.05)dv=(c0.xy/c0.w-c1.xy/c1.w)*res.xy*.5;
  float L=min(length(dv),res.y*.05);float r=clamp(scale*(.016+.012*seed.z)/d,.7,res.y*.012);
  gl_PointSize=2.*r+L+1.;vDir=L>.01?normalize(dv):vec2(1.,0.);vLen=L/gl_PointSize;vR=r/gl_PointSize;
  float lit=beam(p,l0)+beam(p,l1);
  vA=(.045+lit*bright)*(1.-smoothstep(5.,30.,d))*smoothstep(.8,1.8,d)*(r/(r+L*.35));
  gl_Position=c0;}`;
const SNOW_FS = `varying float vA;varying vec2 vDir;varying float vLen;varying float vR;
void main(){vec2 c=gl_PointCoord-.5;c.y=-c.y;float a=clamp(dot(c,vDir),-vLen*.5,vLen*.5);float r=length(c-vDir*a);
  float m=1.-smoothstep(vR*.25,vR,r);if(m<=0.)discard;gl_FragColor=vec4(vec3(.86,.9,1.)*vA*m,1.);}`;
function snowMaterial(bright) {
  return new ShaderMaterial({ transparent: true, depthWrite: false, blending: AdditiveBlending, fog: false, vertexShader: SNOW_VS, fragmentShader: SNOW_FS,
    uniforms: { t: { value: 0 }, boxC: { value: new Vector3() }, box: { value: new Vector3(34, 20, 38) }, scale: { value: 300 }, wind: { value: new Vector3(-5, -2.6, 2.5) },
      carV: { value: new Vector3() }, res: { value: new Vector3() }, l0: { value: new Vector3() }, l1: { value: new Vector3() }, ld: { value: new Vector3() }, bright: { value: bright } } });
}
const snowMat = snowMaterial(2.6), driftMat = snowMaterial(1.4);
driftMat.uniforms.box.value.set(30, .9, 34); driftMat.uniforms.wind.value.set(-9, 0, 4);
let snow = null, drift = null;
function cloud(n, mat, seedBase) {
  const s = new Float32Array(n * 3); rngS = seedBase; for (let i = 0; i < n * 3; i++) s[i] = rnd();
  const g = new BufferGeometry(); g.setAttribute('seed', new BufferAttribute(s, 3)); g.setAttribute('position', new BufferAttribute(new Float32Array(n * 3), 3));
  const p = new Points(g, mat); p.frustumCulled = false; scene.add(p); return p;
}
function buildSnow(n, nd) {
  for (const o of [snow, drift]) if (o) { scene.remove(o); o.geometry.dispose(); }
  snow = cloud(n, snowMat, 3); drift = nd ? cloud(nd, driftMat, 17) : null;
}
// flakes landing on the glass, wiped away as the blades pass
const GF = 160, gfPos = new Float32Array(GF * 3), gfA = new Float32Array(GF), gfBorn = new Float32Array(GF);
rngS = 23; for (let i = 0; i < GF; i++) { gfPos[i * 3] = (rnd() - .5) * GLASS_W * .95; gfPos[i * 3 + 1] = .05 + rnd() * (GLASS_H - .1); gfPos[i * 3 + 2] = -.006; gfBorn[i] = -rnd() * 3; }
const glassFlakes = new Points((() => { const g = new BufferGeometry(); g.setAttribute('position', new BufferAttribute(gfPos, 3)); g.setAttribute('a', new BufferAttribute(gfA, 1)); return g; })(),
  new ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { s: { value: 4 } },
    vertexShader: 'attribute float a;varying float vA;uniform float s;void main(){vA=a;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=s/-mv.z;gl_Position=projectionMatrix*mv;}',
    fragmentShader: 'varying float vA;void main(){vec2 c=gl_PointCoord-.5;float r=dot(c,c);if(r>.25)discard;gl_FragColor=vec4(vec3(.5,.55,.62),vA*(1.-r*3.));}' }));
glassFlakes.frustumCulled = false; glass.add(glassFlakes);
const gfAng = []; for (let i = 0; i < GF; i++) { const x = gfPos[i * 3], y = gfPos[i * 3 + 1]; gfAng.push(PIVOTS.map(([px, py]) => Math.hypot(x - px, y - py) < ARM ? Math.atan2(y - py, x - px) : null)); }

// ---------------------------------------------------------------- reflectors on the rail and the poles: they flare when the lamps catch them
const reflectPts = new Points((() => { const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(REFLECT.flatMap(r => [r[0], r[1], r[2]]), 3)); g.setAttribute('kind', new Float32BufferAttribute(REFLECT.map(r => r[3]), 1)); return g; })(),
  new ShaderMaterial({ transparent: true, depthWrite: false, blending: AdditiveBlending, uniforms: { lp: { value: new Vector3() }, ld: { value: new Vector3() }, res: { value: new Vector3() } },
    vertexShader: `uniform vec3 lp;uniform vec3 ld;uniform vec3 res;attribute float kind;varying vec3 vC;void main(){vec3 L=position-lp;float d=length(L);
      float lit=smoothstep(.8,.96,dot(L/d,ld))*(1.-smoothstep(8.,70.,d));vC=mix(vec3(.95,.25,.12),vec3(1.,.55,.15),kind)*lit*2.5*exp(-d*d*.0006);
      vec4 mv=viewMatrix*vec4(position,1.);gl_PointSize=clamp(res.y*.12/-mv.z,1.5,res.y*.02);gl_Position=projectionMatrix*mv;}`,
    fragmentShader: 'varying vec3 vC;void main(){vec2 c=gl_PointCoord-.5;float r=dot(c,c);if(r>.25)discard;gl_FragColor=vec4(vC*(1.-r*4.),1.);}' }));
reflectPts.frustumCulled = false; scene.add(reflectPts);

// ---------------------------------------------------------------- the film look: one pass
const post = new ShaderMaterial({ uniforms: { tex: { value: null }, t: { value: 0 }, res: { value: new Vector3() }, ca: { value: 1 }, grain: { value: .055 } },
  vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader: `uniform sampler2D tex;uniform float t;uniform vec3 res;uniform float ca;uniform float grain;varying vec2 vUv;
    vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
    float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
    void main(){vec2 c=vUv-.5;float r=dot(c,c);vec2 o=c*r*.014*ca;
      vec3 col=ca>0.?vec3(texture2D(tex,vUv+o).r,texture2D(tex,vUv).g,texture2D(tex,vUv-o).b):texture2D(tex,vUv).rgb;
      col=aces(col*1.5);col=pow(col,vec3(1./2.2));
      col*=vec3(.92,.97,1.06);                                       // cold
      col*=1.-smoothstep(.1,.7,r)*.8;                                // vignette
      col+=(h(vUv*res.xy+fract(t*7.)*91.)-.5)*grain;                 // grain
      gl_FragColor=vec4(col,1.);}` });
const postScene = new Scene(), postCam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
postScene.add(new Mesh(new PlaneGeometry(2, 2), post));
let rt = null;
const halfOK = renderer.capabilities.isWebGL2 && (renderer.extensions.has('EXT_color_buffer_half_float') || renderer.extensions.has('EXT_color_buffer_float'));

// ---------------------------------------------------------------- quality tiers
const TIERS = { low: { pr: 1, snow: 5000, drift: 0, pines: 320, shadow: false, ca: 0 }, med: { pr: 1.5, snow: 9000, drift: 1200, pines: 560, shadow: false, ca: 1 }, high: { pr: 2, snow: 15000, drift: 2500, pines: 800, shadow: true, ca: 1 } };
const ui = { fps: document.getElementById('fps'), q: document.getElementById('q'), tap: document.getElementById('tap'), fade: document.getElementById('fade') };
let tier = null, auto = !TIERS[Q.get('q')], autoStep = auto ? 0 : -1, fpsLog = [];
function applyTier(name) {
  tier = Object.assign({ name }, TIERS[name]);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tier.pr)); resize();
  buildSnow(tier.snow, tier.drift); buildPines(tier.pines);
  renderer.shadowMap.enabled = tier.shadow; lamps[0].castShadow = tier.shadow; lamps[0].shadow.mapSize.set(1024, 1024); lamps[0].shadow.camera.near = 1; lamps[0].shadow.camera.far = 60;
  scene.traverse(o => { if (o.material) o.material.needsUpdate = true; });
  post.uniforms.ca.value = tier.ca; ui.q.textContent = 'Quality: ' + (auto ? 'Auto (' + name + ')' : name[0].toUpperCase() + name.slice(1));
}
function resize() {
  const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h;
  camera.fov = w < h ? 84 : 64; camera.updateProjectionMatrix();
  const pr = renderer.getPixelRatio(), W = Math.round(w * pr), H = Math.round(h * pr);
  if (rt) rt.dispose(); rt = new WebGLRenderTarget(W, H, { type: halfOK ? HalfFloatType : UnsignedByteType, minFilter: LinearFilter, magFilter: LinearFilter, depthBuffer: true });
  post.uniforms.tex.value = rt.texture; post.uniforms.res.value.set(W, H, 0);
  for (const m of [snowMat, driftMat]) { m.uniforms.res.value.set(W, H, 0); m.uniforms.scale.value = H * .9; }
  reflectPts.material.uniforms.res.value.set(W, H, 0); glassFlakes.material.uniforms.s.value = H * .006;
}
addEventListener('resize', () => tier && resize());
ui.q.addEventListener('click', e => {
  e.stopPropagation(); const order = ['auto', 'low', 'med', 'high'], next = order[(order.indexOf(auto ? 'auto' : tier.name) + 1) % 4];
  if (next === 'auto') { auto = true; autoStep = 0; fpsLog.length = 0; applyTier('med'); } else { auto = false; autoStep = -1; applyTier(next); }
});

// look around: drag (touch or mouse); the view drifts back to the road when you let go
const look = { yaw: 0, pitch: 0, drag: false, lx: 0, ly: 0, held: 0 };
canvas.addEventListener('pointerdown', e => { look.drag = true; look.lx = e.clientX; look.ly = e.clientY; try { canvas.setPointerCapture(e.pointerId); } catch (_) {} startAudio(); });
canvas.addEventListener('pointermove', e => {
  if (!look.drag) return; const k = 3 / Math.min(innerWidth, innerHeight);
  look.yaw = MathUtils.clamp(look.yaw - (e.clientX - look.lx) * k, -2.0, 2.0); look.pitch = MathUtils.clamp(look.pitch - (e.clientY - look.ly) * k, -.75, .55);
  look.lx = e.clientX; look.ly = e.clientY; look.held = 1.5;
});
addEventListener('pointerup', () => look.drag = false); addEventListener('pointercancel', () => look.drag = false);
ui.tap.addEventListener('click', e => { e.stopPropagation(); startAudio(); });
for (const ev of ['touchend', 'click']) addEventListener(ev, () => startAudio(), { passive: true });

// ---------------------------------------------------------------- sound: wind, road rumble, the engine, the wipers (all made in code)
let AC = null, wiperThunk = null;
function startAudio() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; } ui.tap.style.opacity = 0; setTimeout(() => ui.tap.remove(), 900);
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    const len = AC.sampleRate * 2, buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0); let b = 0;
    for (let i = 0; i < len; i++) { b = .985 * b + .15 * (Math.random() * 2 - 1); d[i] = b; }
    const master = AC.createGain(); master.gain.value = 0; master.gain.setTargetAtTime(.9, AC.currentTime, .8); master.connect(AC.destination);
    const noise = (rate) => { const s = AC.createBufferSource(); s.buffer = buf; s.loop = true; s.playbackRate.value = rate; s.start(); return s; };
    const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 520; bp.Q.value = .8;
    const wg = AC.createGain(); wg.gain.value = .5; noise(1).connect(bp).connect(wg).connect(master);
    const lfo = AC.createOscillator(), lg = AC.createGain(); lfo.frequency.value = .13; lg.gain.value = 280; lfo.connect(lg).connect(bp.frequency); lfo.start();
    const lfo2 = AC.createOscillator(), lg2 = AC.createGain(); lfo2.frequency.value = .21; lg2.gain.value = .25; lfo2.connect(lg2).connect(wg.gain); lfo2.start();
    const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 150; const rg = AC.createGain(); rg.gain.value = .55; noise(.5).connect(lp).connect(rg).connect(master);
    const eng = AC.createOscillator(); eng.type = 'sawtooth'; eng.frequency.value = 38; const el = AC.createBiquadFilter(); el.type = 'lowpass'; el.frequency.value = 105;
    const eg = AC.createGain(); eg.gain.value = .06; eng.connect(el).connect(eg).connect(master); eng.start(); AC.engine = eng;
    wiperThunk = () => {
      const s = AC.createBufferSource(); s.buffer = buf; const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 320; const g = AC.createGain(), t0 = AC.currentTime;
      g.gain.setValueAtTime(.3, t0); g.gain.exponentialRampToValueAtTime(.001, t0 + .12); s.connect(f).connect(g).connect(master); s.start(); s.stop(t0 + .15);
    };
    if (AC.state === 'suspended') AC.resume();
  } catch (e) {}
}

// ---------------------------------------------------------------- the drive
const LOOP = 32, START = 8;
let t0 = performance.now(), last = t0, frames = 0, acc = 0, lastWipe = 0, dist = START, heading = null, loopN = -1, prevWiper = 0;
const tmp = new Vector3(), fwd = new Vector3(), prevPos = new Vector3(), carV = new Vector3();
function roadAt(s) {
  s = MathUtils.clamp(s, 0, RS.length - 2); const i = Math.floor(s), f = s - i, a = RS[i], b = RS[i + 1];
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, z: a.z + (b.z - a.z) * f, tx: a.tx + (b.tx - a.tx) * f, tz: a.tz + (b.tz - a.tz) * f };
}
const turn = (s0, s1) => { const a = roadAt(s0), b = roadAt(s1); return Math.atan2(a.tx * b.tz - a.tz * b.tx, a.tx * b.tx + a.tz * b.tz); };
const speedAt = s => 11.5 - 6.5 * Math.min(1, Math.abs(turn(s, s + 14)) / 1.2);
function frame(now) {
  requestAnimationFrame(frame);
  const raw = (now - last) / 1000, dt = Math.min(.05, raw); last = now;
  const T = FIXED_T !== null ? FIXED_T : (now - t0) / 1000, lt = T % LOOP, n = Math.floor(T / LOOP);
  // the car keeps to its lane and eases off for the hairpins
  if (FIXED_T !== null) { dist = START; for (let k = 0; k < lt * 20; k++) dist += speedAt(dist) / 20; }
  else { if (n !== loopN) { loopN = n; dist = START; heading = null; } dist += speedAt(dist) * dt; }
  const p = roadAt(dist), ahead = roadAt(dist + 7), lane = 1.55, nx = -p.tz, nz = p.tx;
  prevPos.copy(car.position);
  car.position.set(p.x + nx * lane, p.y + .03 + Math.sin(T * 9.1) * .006 + (vnoise(T * 3.1, 1) - .5) * .022, p.z + nz * lane);
  carV.set(p.tx, 0, p.tz).multiplyScalar(speedAt(dist));
  const want = Math.atan2(-(ahead.x - p.x), -(ahead.z - p.z)); if (heading === null || FIXED_T !== null) heading = want;
  let dh = want - heading; dh = Math.atan2(Math.sin(dh), Math.cos(dh)); heading += dh * Math.min(1, dt * 3.5);
  const pitch = Math.atan2(ahead.y - p.y, 7) * .9, bendNear = turn(dist + 2, dist + 9), bend = MathUtils.clamp(bendNear * 2, -1, 1);
  car.rotation.set(pitch, heading, bend * .03 + Math.sin(T * .9) * .004, 'YXZ');
  // the head: sways a little, looks where you drag it, drifts back to the road
  if (!look.drag) { look.held -= dt; if (look.held <= 0) { const k = Math.pow(.3, dt); look.yaw *= k; look.pitch *= k; } }
  head.rotation.set((innerWidth < innerHeight ? -.05 : -.07) + look.pitch + (vnoise(T * .6, 4) - .5) * .02, look.yaw - bend * .12 + (vnoise(T * .5, 7) - .5) * .03, (vnoise(T * .7, 9) - .5) * .015 + bend * .02, 'YXZ');
  // the wheel turns with the bend, the wipers sweep, the needles shiver
  wheel.rotation.z = MathUtils.clamp(bendNear * 1.6, -.85, .85) + (vnoise(T * 2, 3) - .5) * .05;
  car.updateMatrixWorld(true); poseArms();
  const wp = (T % 1.7) / 1.7, sweep = wp < .7 ? (1 - Math.cos(wp / .7 * Math.PI * 2)) / 2 : 0, wa = sweep * 1.9;
  wipers.forEach(w => w.rotation.z = wa);
  if (wp < .02 && T - lastWipe > 1) { lastWipe = T; wiperThunk && wiperThunk(); }
  // glass flakes: settle, then get wiped when a blade passes over them
  for (let i = 0; i < GF; i++) {
    for (const a of gfAng[i]) if (a !== null && wa !== prevWiper && (prevWiper - a) * (wa - a) <= 0) gfBorn[i] = T + .2 + hash(i, T) * 1.4;
    const age = T - gfBorn[i]; gfA[i] = age < 0 ? 0 : Math.min(.9, age * 1.5);
  }
  prevWiper = wa; glassFlakes.geometry.attributes.a.needsUpdate = true;
  needles[0].rotation.z = 1.1 - Math.min(1, carV.length() / 30) * 1.4 + Math.sin(T * 13) * .01; needles[1].rotation.z = .9 + Math.sin(T * .4) * .02;
  if (AC && AC.engine) AC.engine.frequency.setTargetAtTime(32 + carV.length() * .9, AC.currentTime, .4);
  // black at the start and end of each loop
  ui.fade.style.opacity = FIXED_T !== null ? 0 : lt > LOOP - 1.3 ? Math.min(1, (lt - (LOOP - 1.3)) / 1.1) : lt < 1.3 ? 1 - lt / 1.3 : 0;
  // snow, beams and reflectors follow the car
  car.updateMatrixWorld(true); camera.getWorldPosition(tmp);
  fwd.set(0, -.04, -1).applyQuaternion(car.quaternion).normalize();
  for (const m of [snowMat, driftMat]) {
    const u = m.uniforms; u.t.value = T; u.carV.value.copy(carV); u.ld.value.copy(fwd);
    lamps[0].getWorldPosition(u.l0.value); lamps[1].getWorldPosition(u.l1.value); u.l0.value.y -= 1.2; u.l1.value.y -= 1.2;
  }
  snowMat.uniforms.boxC.value.copy(tmp).addScaledVector(fwd, 13);
  driftMat.uniforms.boxC.value.set(tmp.x + fwd.x * 12, car.position.y + .35, tmp.z + fwd.z * 12);
  { const u = reflectPts.material.uniforms; u.lp.value.copy(car.position); u.lp.value.y += .8; u.ld.value.copy(fwd); }
  // draw: the scene into the film buffer, then one pass to the screen
  renderer.setRenderTarget(rt); renderer.render(scene, camera); renderer.setRenderTarget(null);
  post.uniforms.t.value = T; renderer.render(postScene, postCam);
  // frame rate, and the automatic tier: measure two seconds at medium, then step up or down once
  frames++; acc += raw;
  if (acc > .5) { const fps = frames / acc; ui.fps.textContent = Math.round(fps) + ' fps · ' + (1000 / fps).toFixed(1) + ' ms'; frames = 0; acc = 0; if (autoStep >= 0 && (now - t0) > 1500) fpsLog.push(fps); }
  if (autoStep >= 0 && autoStep < 2 && fpsLog.length >= 4) {
    const f = fpsLog.reduce((a, b) => a + b) / fpsLog.length; fpsLog.length = 0;
    if (autoStep === 0) { if (f < 40) { autoStep = 2; applyTier('low'); } else if (f > 56) { autoStep = 1; applyTier('high'); } else autoStep = 2; }
    else { autoStep = 2; if (f < 45) applyTier('med'); }
  }
}
applyTier(auto ? 'med' : Q.get('q'));
if (Q.get('nocab')) { cab.visible = false; arms.forEach(a => [a.fore, a.upper, a.cuff, a.skin, a.elbow].forEach(m => m.visible = false)); }
requestAnimationFrame(t => { document.getElementById('load')?.remove(); frame(t); });
window.__p2 = { scene, camera, renderer, LOOK, tier: () => tier.name, roadLen: ROAD_LEN, car };
