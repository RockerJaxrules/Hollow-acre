// Your arms on the wheel: one skinned arm modelled in Blender (tools/b3d/lib/hands.py), mirrored for the right.
// Bind pose = the rest hand (straight fingers) at the left hand's place; every frame the bones are posed from code:
//   each hand takes its own place on the rim (left: relaxed, draped toward the hub at about twenty past nine; right:
//   hooked over the top at about ten past one), the fingers close until they meet it (angles solved in Blender), the arm reaches by
//   two-bone IK from the shoulder, the forearm shares the hand's roll, and on hard turns each hand lets go and takes
//   a new hold further round (never both at once).
import { Group, Vector3, Vector2, Matrix4, Quaternion, Color, MeshStandardMaterial, TextureLoader, NoColorSpace, ShaderChunk, MathUtils, LinearFilter, LinearMipmapLinearFilter } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as skClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import RIG from './arm_rig.json';

const V3 = a => new Vector3(a[0], a[1], a[2]);
const PATTERN = { '': 0, plaid: 1, stripes: 2, dots: 3 };
const WC = V3(RIG.WC), AXIS = V3(RIG.AXIS).normalize(), SH = V3(RIG.SH), ELB = V3(RIG.ELB), W = V3(RIG.W), POLE = V3(RIG.POLE).normalize();
const ND = V3(RIG.ND), XH = V3(RIG.XH), L_UP = RIG.L_UP, L_FORE = RIG.L_FORE, O_RIM = V3(RIG.O), GX = V3(RIG.GX).normalize();
const SIDES = ['L', 'R'];
const SPREAD_AX = V3(RIG.spreadAxis).normalize();
const HD = { L: new Matrix4().fromArray(RIG.hands.L.hand).transpose(), R: new Matrix4().fromArray(RIG.hands.R.hand).transpose() };
const FINGERS = ['index', 'middle', 'ring', 'pinky'];

// ---------------------------------------------------------------- material: skin, nails, cloth and the ring in one draw call
// the rim (a torus, the same however the wheel turns) in view space: its shadow across the fingers is traced per light
const RIM_GLSL = `uniform vec3 rimC; uniform vec3 rimA; uniform vec2 rimRT;
float rimDist( vec3 p ) { vec3 q = p - rimC; float h = dot( q, rimA ); return length( vec2( length( q - h * rimA ) - rimRT.x, h ) ) - rimRT.y; }
float rimShadow( vec3 p, vec3 L ) {
  float m = 1.0, t = .004;
  for ( int i = 0; i < 12; i ++ ) { float d = rimDist( p + L * t ); m = min( m, d / ( .09 * t + .0012 ) ); t += max( d * .85, .005 ); if ( t > .32 || m < .01 ) break; }
  return smoothstep( 0.0, 1.0, clamp( m, 0.0, 1.0 ) );
}
`;
const LIGHTS = 'float armSkin = 0.0; float armCloth = 0.0; vec3 armWrap = vec3( 0.0 ); vec3 armSheen = vec3( 0.0 );\n' + RIM_GLSL + ShaderChunk.lights_physical_pars_fragment
  .replace('vec3 irradiance = dotNL * directLight.color;',
    'float rsh = rimShadow( geometryPosition, directLight.direction );\n\tvec3 irradiance = dotNL * directLight.color * rsh;\n\tfloat ndlA = dot( geometryNormal, directLight.direction );\n' +
    '\tvec3 wrapI = clamp( ( vec3( ndlA ) + armWrap ) / ( 1.0 + armWrap ), 0.0, 1.0 ) * directLight.color * rsh;')
  .replace('reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );',
    'reflectedLight.directDiffuse += mix( irradiance, wrapI, armSkin ) * BRDF_Lambert( material.diffuseColor );\n' +
    // fake scatter: a warm red band where the light turns away (the terminator), as light leaks through skin
    '\treflectedLight.directDiffuse += armSkin * rsh * vec3( .2, .045, .025 ) * ( smoothstep( -.3, .05, ndlA ) - smoothstep( .05, .45, ndlA ) ) * directLight.color * BRDF_Lambert( material.diffuseColor ) * 3.0;\n' +
    '\treflectedLight.directSpecular += armCloth * armSheen * pow( 1.0 - saturate( dot( geometryNormal, geometryViewDir ) ), 3.0 ) * saturate( ndlA + 0.5 ) * directLight.color * rsh;');
const FRAG_HEAD = `
uniform sampler2D dataMap; uniform vec3 skinCol; uniform vec3 clothCol; uniform float pattern; uniform float squeeze;
varying vec2 vArmUv; varying vec2 vCyl;
float aaStep( float e, float x ) { float w = fwidth( x ) * .7 + 1e-4; return smoothstep( e - w, e + w, x ); }
vec3 clothPattern( vec2 c ) {
  vec3 dark = clothCol * .45, light = mix( clothCol, vec3( 1.0 ), .32 ), col = clothCol;
  if ( pattern > .5 && pattern < 1.5 ) {                    // plaid: broad dark bands both ways, thin light threads
    vec2 q = fract( c / .038 );
    float bx = 1.0 - aaStep( .36, q.x ), by = 1.0 - aaStep( .36, q.y );
    col = mix( col, dark, .45 * max( bx, by ) + .2 * bx * by );
    float lx = 1.0 - aaStep( .025, abs( q.x - .66 ) ), ly = 1.0 - aaStep( .025, abs( q.y - .66 ) );
    col = mix( col, light, .4 * max( lx, ly ) );
  } else if ( pattern > 1.5 && pattern < 2.5 ) {            // stripes round the arm
    col = mix( col, dark, 1.0 - aaStep( .4, fract( c.y / .019 ) ) );
  } else if ( pattern > 2.5 ) {                             // dots
    vec2 q = c / vec2( .021, .021 ); q.x += step( .5, fract( q.y * .5 ) ) * .5;
    col = mix( col, light, 1.0 - aaStep( .2, length( fract( q ) - .5 ) ) );
  }
  return col;
}
`;
function armMaterial(maps, look, mirrored) {
  const m = new MeshStandardMaterial({ normalMap: maps.n, normalScale: new Vector2(.45, mirrored ? -.45 : .45), roughness: .5, metalness: 0 });
  const U = {
    dataMap: { value: maps.d }, skinCol: { value: new Color(look.skin) }, clothCol: { value: new Color(look.sleeve) },
    pattern: { value: PATTERN[look.pattern] ?? 0 }, ringOn: { value: !mirrored && look.married ? 1 : 0 }, squeeze: { value: 0 },
    rimC: { value: new Vector3() }, rimA: { value: new Vector3(0, 0, 1) }, rimRT: { value: new Vector2(RIG.RR, RIG.RT) }
  };
  m.userData.U = U;
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec2 cyl; varying vec2 vArmUv; varying vec2 vCyl; uniform float ringOn;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvArmUv = uv; vCyl = cyl;\nif ( ringOn < .5 && uv.x > .962 && uv.y > .965 ) transformed = vec3( 0.0 );');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\n' + FRAG_HEAD)
      .replace('#include <lights_physical_pars_fragment>', LIGHTS)
      .replace('#include <map_fragment>', `#include <map_fragment>
        vec4 armD = texture2D( dataMap, vArmUv );
        float mId = textureLod( dataMap, vArmUv, 0.0 ).a;             // material id from the full-size level: no mip mixing at seams
        float isRing = step( .93, mId ), isCloth = step( .7, mId ) * ( 1.0 - isRing ), isNail = smoothstep( .3, .45, mId ) * ( 1.0 - step( .7, mId ) );
        float skinM = max( 0.0, 1.0 - isRing - isCloth - isNail );
        vec3 sk = skinCol;
        sk = mix( sk, sk * vec3( 1.07, .70, .66 ), armD.g * .6 * ( 1.0 - .55 * squeeze ) );          // flush: tips, knuckles, nail folds
        sk = mix( sk, sk * 1.12 + .015, armD.g * squeeze * .35 );                                    // knuckles pale when you grip hard
        sk *= ( 1.0 - armD.b * .2 ) * mix( vec3( 1.0 ), vec3( .9, .96, .98 ), armD.b );            // creases and veins: darker, a little cooler
        vec3 nail = mix( skinCol * vec3( 1.12, 1.0, .95 ), vec3( .78, .46, .36 ), .5 );             // pink-beige over the nail bed
        nail = mix( nail, vec3( .9, .84, .74 ), smoothstep( .55, .64, mId ) * .9 );                 // the lighter free edge
        vec3 cl = clothPattern( vCyl ); cl = mix( cl, vec3( dot( cl, vec3( .2126, .7152, .0722 ) ) ), .2 );
        vec3 alb = sk * skinM + nail * isNail + cl * isCloth + vec3( .95, .66, .28 ) * isRing;
        diffuseColor.rgb = alb;
        armSkin = min( 1.0, skinM + isNail * .6 ); armCloth = isCloth; armWrap = vec3( .55, .3, .2 ) * armSkin; armSheen = clothCol * .55 + .05;
        float armAO = mix( 1.0, armD.r, .9 );
        float skinLum = dot( skinCol, vec3( .2126, .7152, .0722 ) ), darkSkin = 1.0 - smoothstep( .06, .3, skinLum );`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = ( mix( .57, .42, darkSkin ) - armD.g * .06 * darkSkin ) * skinM + .32 * isNail + .92 * isCloth + .26 * isRing;   // darker skin shows more sheen, most on the knuckles')
      .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor = isRing;')
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        if ( isCloth > .5 ) {                                   // woven cloth: a fine twill from the sleeve's own coordinates
          vec3 dp1 = dFdx( - vViewPosition ), dp2 = dFdy( - vViewPosition ); vec2 du1 = dFdx( vCyl ), du2 = dFdy( vCyl );
          vec3 p2 = cross( dp2, normal ), p1 = cross( normal, dp1 );
          vec3 T = p2 * du1.x + p1 * du2.x, B = p2 * du1.y + p1 * du2.y;
          float inv = inversesqrt( max( max( dot( T, T ), dot( B, B ) ), 1e-12 ) );
          vec2 q = vCyl * 330.0; float fade = 1.0 - smoothstep( .25, .6, length( fwidth( q ) ) );
          float a = 6.2832 * ( q.x + q.y ), b = 6.2832 * ( q.x * 2.0 - q.y );
          vec2 g = vec2( cos( a ) + .5 * cos( b ) * 2.0, cos( a ) - .5 * cos( b ) ) * 330.0 * .0009 * fade;
          normal = normalize( normal - ( T * g.x + B * g.y ) * inv );
        }`)
      .replace('#include <aomap_fragment>', '#include <aomap_fragment>\nfloat rimAO = mix( .5, 1.0, smoothstep( .0, .022, rimDist( geometryPosition ) ) );\nreflectedLight.indirectDiffuse *= armAO * rimAO; reflectedLight.indirectSpecular *= armAO * rimAO; reflectedLight.directDiffuse *= mix( 1.0, armAO, .35 );');
  };
  return m;
}

// ---------------------------------------------------------------- small matrix helpers (all in the arm root's space = car space, or mirrored car space)
const _q = new Quaternion(), _m = new Matrix4(), _v = new Vector3(), _v2 = new Vector3();
function rotAbout(out, p, axis, ang) { // rotation by ang about the line through p
  _m.makeRotationAxis(axis, ang); out.makeTranslation(p.x, p.y, p.z).multiply(_m); return out.multiply(_m.makeTranslation(-p.x, -p.y, -p.z));
}
function rigid(out, q, from, to) {     // rotate by q about `from`, then move `from` to `to`
  out.makeRotationFromQuaternion(q); out.multiply(_m.makeTranslation(-from.x, -from.y, -from.z));
  return out.premultiply(_m.makeTranslation(to.x, to.y, to.z));
}
function ik(S, Wp, a, b, pole, out) {
  const d = _v.copy(Wp).sub(S); const L = Math.min(d.length(), a + b - 1e-3); d.normalize();
  const x = (a * a - b * b + L * L) / (2 * L), h = Math.sqrt(Math.max(0, a * a - x * x));
  const p = _v2.copy(pole).addScaledVector(d, -pole.dot(d)).normalize();
  return out.copy(S).addScaledVector(d, x).addScaledVector(p, h);
}

// ---------------------------------------------------------------- the hand's hold on the rim (push-pull re-grip)
const LIMIT = .5, OPEN = .16, MOVE = .34, CLOSE = .2;
function newHold() { return { g: 0, phase: 0, t: 0, g0: 0, dir: 0, curl: 1, lift: 0 }; }
function stepHold(h, dt, th, otherHolding) {
  const ease = x => x * x * (3 - 2 * x);
  if (h.phase === 0) {
    const rel = th + h.g; h.curl = 1; h.lift = 0;
    if (Math.abs(rel) > LIMIT && otherHolding) { h.phase = 1; h.t = 0; h.dir = -Math.sign(rel); }
  } else if (h.phase === 1) {                                     // let go
    h.t += dt; const s = ease(Math.min(1, h.t / OPEN)); h.curl = 1 - .82 * s; h.lift = .013 * s;
    if (h.t >= OPEN) { h.phase = 2; h.t = 0; h.g0 = h.g; }
  } else if (h.phase === 2) {                                     // slide back round the rim, hand lifted
    h.t += dt; const s = ease(Math.min(1, h.t / MOVE)); const target = -th + h.dir * .24;
    h.g = h.g0 + (target - h.g0) * s; h.curl = .18; h.lift = .013;
    if (h.t >= MOVE) { h.phase = 3; h.t = 0; }
  } else {                                                        // take hold again
    h.t += dt; const s = ease(Math.min(1, h.t / CLOSE)); h.curl = .18 + .82 * s; h.lift = .013 * (1 - s);
    if (h.t >= CLOSE) { h.phase = 0; h.curl = 1; h.lift = 0; }
  }
}

export function makeArms({ parent, mirrorX, look, url = 'arm.glb' }) {
  const api = { ready: null, arms: [], holds: [newHold(), newHold()] };
  const tl = new TextureLoader();
  const tex = (u) => new Promise((res, rej) => tl.load(u, t => { t.flipY = false; t.colorSpace = NoColorSpace; t.anisotropy = 4; res(t); }, undefined, rej));
  api.ready = Promise.all([new GLTFLoader().loadAsync(url), tex('arm_n.webp'), tex('arm_d.webp')]).then(([gltf, n, d]) => {
    const maps = { n, d };
    const roots = [gltf.scene, skClone(gltf.scene)];
    const mirror = new Group(); mirror.position.x = 2 * mirrorX; mirror.scale.x = -1; parent.add(mirror);
    roots.forEach((root, i) => {
      (i ? mirror : parent).add(root);
      const bones = {}; let mesh = null;
      root.traverse(o => { if (o.isBone) bones[o.name] = o; if (o.isSkinnedMesh) mesh = o; });
      const geo = mesh.geometry; if (geo.attributes.uv1 && !geo.attributes.cyl) { geo.setAttribute('cyl', geo.attributes.uv1); geo.deleteAttribute('uv1'); }
      mesh.material = armMaterial(maps, look, i === 1); mesh.frustumCulled = false;
      const U = mesh.material.userData.U;
      mesh.onBeforeRender = (r, s, cam) => {                     // the rim in view space (a torus: the same however the wheel turns)
        U.rimC.value.copy(WC).applyMatrix4(parent.matrixWorld).applyMatrix4(cam.matrixWorldInverse);
        U.rimA.value.copy(AXIS).transformDirection(parent.matrixWorld).transformDirection(cam.matrixWorldInverse);
      };
      root.updateMatrixWorld(true);
      const inv = new Matrix4().copy(root.matrixWorld).invert(), bind = {}, parentRest = {};
      for (const b of RIG.bones) {
        const bone = bones[b.name]; bind[b.name] = new Matrix4().multiplyMatrices(inv, bone.matrixWorld);
        if (!b.parent) parentRest[b.name] = new Matrix4().multiplyMatrices(inv, bone.parent.matrixWorld);
        bone.matrixAutoUpdate = false;
      }
      api.arms.push({ root, bones, mesh, bind, parentRest, M: {}, D: {}, side: SIDES[i] });
    });
  });

  const Dh = new Matrix4(), tmp = new Matrix4(), q1 = new Quaternion(), q2 = new Quaternion(), Ep = new Vector3(), Wp = new Vector3(), Sp = new Vector3();
  const d0 = new Vector3(), d1 = new Vector3(), xh = new Vector3(), xf = new Vector3();
  function poseArm(A, phi, hold, extra) {
    const D = A.D, M = A.M, HP = RIG.hands[A.side];
    for (const b of RIG.bones) D[b.name] = D[b.name] || new Matrix4();
    // the hand rides the rim (each hand in its own place and roll), lifted off it while it changes its hold
    rotAbout(Dh, WC, AXIS, phi); Dh.multiply(HD[A.side]);
    if (hold.lift) { _v.copy(ND).transformDirection(Dh).multiplyScalar(hold.lift); Dh.premultiply(tmp.makeTranslation(_v.x, _v.y, _v.z)); }
    if (extra.wristFlex) Dh.multiply(rotAbout(tmp, W, XH, extra.wristFlex));
    D.hand.copy(Dh);
    // the arm reaches for the wrist
    Wp.copy(W).applyMatrix4(Dh); Sp.copy(SH).add(extra.shoulder);
    ik(Sp, Wp, L_UP, L_FORE, POLE, Ep);
    q1.setFromUnitVectors(d0.copy(ELB).sub(SH).normalize(), d1.copy(Ep).sub(Sp).normalize()); rigid(D.upper, q1, SH, Sp);
    q1.setFromUnitVectors(d0.copy(W).sub(ELB).normalize(), d1.copy(Wp).sub(Ep).normalize());
    xh.copy(XH).transformDirection(Dh); xf.copy(XH).applyQuaternion(q1);
    xh.addScaledVector(d1, -xh.dot(d1)).normalize(); xf.addScaledVector(d1, -xf.dot(d1)).normalize();
    const tau = Math.atan2(_v.crossVectors(xf, xh).dot(d1), xf.dot(xh));
    rigid(D.fore, q2.setFromAxisAngle(d1, tau * .2).multiply(q1), ELB, Ep);
    rigid(D.twist, q2.setFromAxisAngle(d1, tau * .7).multiply(q1), ELB, Ep);
    // fingers: close each joint by its share of the solved grip
    for (const n of FINGERS) {
      const F = RIG.fingers[n], ax = _v2.fromArray(F.axis);
      let acc = tmp.copy(Dh).multiply(rotAbout(_m2, _v.fromArray(F.joints[0]), SPREAD_AX, HP.spread[n]));
      for (let k = 0; k < 3; k++) {
        const c = Math.max(0, hold.curl + extra.curl[n] + (k === 0 ? extra.mcp[n] : 0));
        acc = acc.multiply(rotAbout(_m2, _v.fromArray(F.joints[k]), ax, HP.grip[n][k] * Math.min(c, 1.08) + (c > 1 ? (c - 1) * .5 : 0)));
        D[n + (k + 1)].copy(acc);
      }
    }
    for (let k = 0; k < 3; k++) D['thumb' + (k + 1)].multiplyMatrices(Dh, _m3.fromArray(HP.thumb[k]).transpose());
    // write bone matrices
    for (const b of RIG.bones) {
      M[b.name] = M[b.name] || new Matrix4(); M[b.name].multiplyMatrices(D[b.name], A.bind[b.name]);
      const par = b.parent ? M[b.parent] : A.parentRest[b.name];
      A.bones[b.name].matrix.copy(par).invert().multiply(M[b.name]);
    }
    A.root.updateMatrixWorld(true);
  }
  const _m2 = new Matrix4(), _m3 = new Matrix4();
  const ZERO = { index: 0, middle: 0, ring: 0, pinky: 0 };
  const noise = (t, s) => Math.sin(t * 1.3 + s) * .5 + Math.sin(t * 2.9 + s * 2.1) * .3 + Math.sin(t * .7 + s * 3.7) * .2;
  // theta: wheel angle (radians, + = anticlockwise as you see it). steerAt(t): the wheel angle at loop time t, used to
  // replay the holds from the start of the loop when the clock is frozen for screenshots.
  api.update = ({ T, lt, dt, theta, squeeze = 0, lean = 0, bob = 0, steerAt = null, fixed = false }) => {
    if (!api.arms.length) return;
    const H = api.holds;
    if (fixed && steerAt) {                                        // deterministic replay
      H[0] = newHold(); H[1] = newHold();
      for (let t = 0; t <= lt; t += 1 / 30) { const th = steerAt(t); stepHold(H[0], 1 / 30, th, H[1].phase === 0); stepHold(H[1], 1 / 30, -th, H[0].phase === 0); }
    } else { stepHold(H[0], dt, theta, H[1].phase === 0); stepHold(H[1], dt, -theta, H[0].phase === 0); }
    api.arms.forEach((A, i) => {
      const side = i ? -1 : 1, th = theta * side, h = H[i];
      const curl = {}, mcp = {};
      for (const n of FINGERS) {
        curl[n] = squeeze * .07 + noise(T * .8, i * 5 + n.length) * .02;
        mcp[n] = 0;
      }
      // now and then, on a straight, the index lifts and taps the rim
      const tapT = (T + i * 4.3) % 9.5;
      if (h.phase === 0 && Math.abs(theta) < .15 && tapT < .7) mcp.index = -.55 * Math.sin(tapT / .7 * Math.PI) ** 2, curl.index -= .25 * Math.sin(tapT / .7 * Math.PI);
      const shoulder = _v.set(lean * .018 * side, -bob * .01, 0).clone();
      poseArm(A, th + h.g, h, { curl, mcp, shoulder, wristFlex: -squeeze * .05 });
      A.mesh.material.userData.U.squeeze.value = squeeze;
    });
  };
  return api;
}
