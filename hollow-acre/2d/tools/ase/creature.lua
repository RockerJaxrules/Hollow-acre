-- The Hollow: the thing in the fields. Drawn in Aseprite on the game's existing sheet layout (96x176 frames, 8 columns,
-- 21 rows: walk N W S E x8, idle x4, crawl x6, scream x6, lunge x4, hurt S x4), anchor (48, 171). A very tall figure in a
-- long ragged coat with a carved pumpkin for a head, stick legs and long pale hands. Each frame is posed from a skeleton
-- (feet, knees, hips, shoulders, elbows, hands, head) and drawn with hue-shifted ramps, lit from the top-left.
--   walk   : an uneven, limping stalk; the arms swing late, the coat's tatters sway after the body, the head lolls
--   idle   : the coat rises and falls; a finger twitches; the head turns a little too far
--   crawl  : down on all fours like a spider, limbs stepping in pairs, the face low and toward you
--   scream : arms up, fingers spread, the head tips back and the carved mouth flares
--   lunge  : a crouch, then the reach: arms out at you, fingers wide
--   hurt   : a recoil, the head knocked sideways, the glow guttering
local dir = app.params['dir'] or '.'
local out = app.params['out'] or dir
local px = dofile(app.fs.joinPath(dir, 'px.lua'))

local RAMPS = {
  co = {'#0e0a14', '#1a1424', '#2a1e36', '#3a2a4a', '#4e3a5e', '#6a5276'},   -- the coat: black going to bruise purple
  lg = {'#14100e', '#2a221e', '#423630', '#5e4e44'},                         -- the legs, like old wood
  ha = {'#3e3e46', '#6a6a72', '#9a9a9c', '#c8c4ba'},                         -- the hands, grey-white
  pk = {'#4a1a10', '#7a2a10', '#a84210', '#d0661a', '#ec8a26', '#f6b048', '#fcd890'},
  gw = {'#3a0800', '#c83a00', '#ff8a1a', '#ffe08a'},                         -- the light inside
  st = {'#1e2a10', '#3a4a1a', '#5a6a2a'},
  rp = {'#3a2a1a', '#6a5236'},
  bl = {'#4a080c', '#8a1418'},
  vn = {'#1a2a14', '#2e4422', '#4a6a30'},
}
local PAL = {{'OUT', '#120a10'}}
for k, cols in pairs(RAMPS) do for i, h in ipairs(cols) do PAL[#PAL + 1] = {k .. i, h} end end
local function R_(k) local r = {}; for i = 1, #RAMPS[k] do r[i] = k .. i end return r end
local CO, LG, HA, PK, GW = R_('co'), R_('lg'), R_('ha'), R_('pk'), R_('gw')

local FW, FH, AX, AY = 96, 176, 48, 171
local ROWS = {}
for _, d in ipairs({'N', 'W', 'S', 'E'}) do ROWS[#ROWS + 1] = {'walk', d, 8} end
for _, d in ipairs({'N', 'W', 'S', 'E'}) do ROWS[#ROWS + 1] = {'idle', d, 4} end
for _, d in ipairs({'N', 'W', 'S', 'E'}) do ROWS[#ROWS + 1] = {'crawl', d, 6} end
for _, d in ipairs({'N', 'W', 'S', 'E'}) do ROWS[#ROWS + 1] = {'scream', d, 6} end
for _, d in ipairs({'N', 'W', 'S', 'E'}) do ROWS[#ROWS + 1] = {'lunge', d, 4} end
ROWS[#ROWS + 1] = {'hurt', 'S', 4}

local c = px.new(FW * 8, FH * #ROWS, PAL)
local OX, OY, FLIP = 0, 0, 1                                      -- the current frame's anchor, and whether it is drawn mirrored (W)
local function H(a, b) return px.h(a, b) end
local function band(r, l, lo, hi) return px.band(c, r, l, lo, hi) end
local function P(x, y, col)                                       -- plot in frame space (relative to the anchor), mirrored for W
  local fx = FLIP == 1 and (OX + AX + x) or (OX + AX - x - 1)
  if fx < OX or fx >= OX + FW then return end
  local fy = OY + AY + y; if fy < OY or fy >= OY + FH then return end
  px.p(c, fx, fy, col)
end
local function line(x0, y0, x1, y1, w, r, lit)                   -- a limb: w px thick, lit on its left edge
  local n = math.max(1, math.ceil(math.max(math.abs(x1 - x0), math.abs(y1 - y0)) * 1.5))
  for i = 0, n do local t = i / n; local x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
    for k = 0, w - 1 do local o = k - (w - 1) / 2
      local l = (lit or .55) + (w > 1 and (-o / w) * .7 or 0)
      if math.abs(y1 - y0) >= math.abs(x1 - x0) then P(math.floor(x + o + .5), math.floor(y + .5), band(r, l, 1, #r))
      else P(math.floor(x + .5), math.floor(y + o + .5), band(r, l, 1, #r)) end end end
end
local function fill(pts, colf)                                    -- a filled polygon in frame space
  local miny, maxy = 1e9, -1e9; for _, q in ipairs(pts) do miny = math.min(miny, q[2]); maxy = math.max(maxy, q[2]) end
  for y = math.floor(miny), math.ceil(maxy) do local xs = {}; local yy = y + .5
    for i = 1, #pts do local a, b = pts[i], pts[i % #pts + 1]
      if (a[2] <= yy and b[2] > yy) or (b[2] <= yy and a[2] > yy) then xs[#xs + 1] = a[1] + (yy - a[2]) / (b[2] - a[2]) * (b[1] - a[1]) end end
    table.sort(xs)
    for k = 1, #xs - 1, 2 do for x = math.floor(xs[k] + .5), math.floor(xs[k + 1] - .5) do local v = colf(x, y); if v then P(x, y, v) end end end end
end
local function ellipse(cx, cy, rx, ry, colf)
  for y = math.floor(cy - ry), math.ceil(cy + ry) do for x = math.floor(cx - rx), math.ceil(cx + rx) do
    local dx, dy = (x + .5 - cx) / rx, (y + .5 - cy) / ry; if dx * dx + dy * dy <= 1 then local v = colf(x, y, dx, dy); if v then P(x, y, v) end end end end
end

-- ------------------------------------------------------------------ parts
local function hand(x, y, ang, spread, far)                       -- a long hand: a palm and four long fingers fanning from it
  local r = far and {'ha1', 'ha1', 'ha2', 'ha3'} or HA
  ellipse(x, y, 2.6, 3, function() return r[3] end); P(x - 1, y - 1, r[4])
  for i = -1.5, 1.5 do local a = ang + i * (spread or .22); local len = 8 + (math.abs(i) < 1 and 2 or 0)
    local ex, ey = x + math.cos(a) * len, y + math.sin(a) * len
    local kx, ky = x + math.cos(a) * len * .55, y + math.sin(a) * len * .55
    line(x, y, kx, ky, 1, r, .7); line(kx, ky, ex + math.cos(a + .5) * 1.5, ey + math.sin(a + .5) * 1.5, 1, r, .5) end   -- a knuckle bend in each finger
end
local function pumpkin(cx, cy, view, mouth, glowk, tilt)          -- view: 'S' face, 'E' profile, 'N' back
  tilt = tilt or 0
  ellipse(cx, cy, 16, 13, function(x, y, dx, dy)
    local rib = math.abs(math.sin((dx + tilt * .1) * 3.2))
    local l = .62 - dx * .3 - dy * .35 - (1 - rib) * .28
    return band(PK, l, 1, 7) end)
  local sx = cx + (view == 'E' and -3 or 0) + tilt
  line(sx, cy - 13, sx + 2, cy - 19, 3, R_('st'), .6); P(sx + 3, cy - 20, 'st2')                         -- the stem, crooked
  if view == 'N' then for k = -1, 1 do line(cx + k * 6, cy - 10, cx + k * 7, cy + 10, 1, {'pk2', 'pk2', 'pk3'}, .4) end return end
  local g = glowk or 1
  local G = function(k) return GW[math.max(1, math.min(4, k + (g > .7 and 0 or -1)))] end
  local eyes = view == 'S' and {{-7, 0}, {7, -1}} or {{8, 0}}
  for _, e in ipairs(eyes) do local ex, ey = cx + e[1] + tilt, cy - 5 + e[2]                           -- triangle eyes, one set a little higher
    for j = 0, 6 do local hw = j * .75
      for i = math.floor(-hw - 1), math.ceil(hw + 1) do local inside = math.abs(i) <= hw
        if inside then P(ex + i, ey + j, (j >= 5) and G(3) or G(4)) elseif math.abs(i) <= hw + 1.2 then P(ex + i, ey + j, 'pk1') end end end
    for i = -5, 5 do P(ex + i, ey + 7, 'pk1') end end
  local mw = view == 'S' and 11 or 6; local mx = cx + (view == 'S' and 0 or 8) + tilt; local my = cy + 4
  local open = 3 + math.floor((mouth or 0) * 5)
  for i = -mw, mw do local edge = math.abs(i) / mw
    local top = my + math.floor(edge * edge * 3); local bot = my + open - math.floor(edge * 2)
    local toothT = (i % 4 == 1) and 2 or 0; local toothB = (i % 4 == 3) and 2 or 0
    for y = top - 1, bot + 1 do
      if y == top - 1 or y == bot + 1 then P(mx + i, y, 'pk1')
      elseif y < top + toothT or y > bot - toothB then P(mx + i, y, (y < top + toothT) and 'pk4' or 'pk3')     -- teeth left in the flesh
      else P(mx + i, y, (y <= top + 1) and G(2) or G(4)) end end end
end
local function coat(sh, hip, hem, sway, view, billow)              -- the long coat: shoulders to a ragged hem, folds, a rope belt
  local w0, w1 = (view == 'E') and 8 or 12, ((view == 'E') and 15 or 22) + (billow or 0)
  local pts = {}
  pts[#pts + 1] = {sh.x - w0, sh.y + 5}; pts[#pts + 1] = {sh.x - 5, sh.y}; pts[#pts + 1] = {sh.x + 5, sh.y}; pts[#pts + 1] = {sh.x + w0, sh.y + 5}
  for i = 0, 10 do local t = i / 10; local x = hip.x + w1 - t * 2 * w1                                     -- the hem, torn into tatters that hang after the body
    local tat = (i % 2 == 0) and 0 or (5 + math.floor(H(i, 3) * 6))
    pts[#pts + 1] = {x + math.sin(t * 6 + sway) * 2, hem + tat + math.floor(math.sin(i + sway * 2) * 1.5)} end
  fill(pts, function(x, y)
    local u = (x - (sh.x - w0)) / (2 * w0); local v = (y - sh.y) / (hem - sh.y)
    local l = .55 - (x - sh.x) / 40 - v * .15
    if (x + math.floor(y / 9)) % 9 == 0 and v > .2 then l = l - .2 end                                     -- long folds
    if H(x // 3, y // 5) > .9 then l = l - .15 end
    return band(CO, l, 1, 6) end)
  for _, k in ipairs({-1, 1}) do fill({{sh.x + k * 2, sh.y + 1}, {sh.x + k * 7, sh.y - 7}, {sh.x + k * 8, sh.y + 3}}, function(x, y) return k < 0 and 'co4' or 'co2' end) end   -- a high collar
  if view ~= 'N' then local bw = math.floor(w0 + (w1 - w0) * .35); for x = -bw + 2, bw - 2 do P(sh.x + x, hip.y - 2, 'rp1'); if x % 3 == 0 then P(sh.x + x, hip.y - 3, 'rp2') end end end   -- a rope belt
  if view == 'S' then line(sh.x, sh.y + 2, hip.x, hem, 1, {'co1', 'co1', 'co2'}, .3)                       -- the opening down the front
    for k = 0, 3 do P(sh.x - 4 + k * 3, sh.y + 20 + k * 7, 'bl1'); P(sh.x - 4 + k * 3, sh.y + 21 + k * 7, 'bl2') end end
  if view == 'N' then line(sh.x, sh.y + 2, hip.x, hem - 4, 1, {'co1', 'co1', 'co2'}, .3) end              -- the seam up the back
  for k = -1, 1, 2 do local vx = sh.x + k * (w0 - 2)                                                        -- roots creeping out of the cuffs
    for j = 0, 5 do P(vx + k * (j % 2), sh.y + 30 + j, j < 3 and 'vn2' or 'vn1') end end
end

-- ------------------------------------------------------------------ the figure from a pose
local function figure(view, p)
  local hipY, shY, headY = -62 + p.bob, -112 + p.bob, -142 + p.bob + (p.headDy or 0)
  local hip = {x = p.lean * .3, y = hipY}; local sh = {x = p.lean, y = shY}; local hem = -46 + p.bob
  local function leg(side, far)
    local f = p.feet[side]; local hx = hip.x + (view == 'E' and 0 or (side == 1 and -5 or 5))
    local kx, ky = (hx + f[1]) / 2 + (view == 'E' and 4 or (side == 1 and -2 or 2)), (hipY + f[2]) / 2 - 2
    local r = far and {'lg1', 'lg1', 'lg2', 'lg3'} or LG
    line(hx, hipY, kx, ky, 3, r, .6); line(kx, ky, f[1], f[2] - 2, 3, r, .5)
    line(f[1] - (view == 'E' and 0 or 2), f[2] - 1, f[1] + (view == 'E' and 7 or 3), f[2], 2, r, .4)   -- a long, flat foot
  end
  local function arm(side, far)
    local s = {x = sh.x + (view == 'E' and (side == 1 and 2 or -2) or (side == 1 and -11 or 11)), y = shY + 5}
    local h = p.hands[side]; local e = {x = (s.x + h[1]) / 2 + (view == 'E' and 3 or (side == 1 and -4 or 4)), y = (s.y + h[2]) / 2 + (p.elbowUp and -8 or 0)}
    local r = far and {'co1', 'co1', 'co2', 'co2', 'co3', 'co3'} or CO
    line(s.x, s.y, e.x, e.y, 5, r, .55); line(e.x, e.y, h[1], h[2] - 3, 4, r, .5)                          -- sleeves
    hand(h[1], h[2], h[3] or (math.pi / 2), p.spread, far)
  end
  if view == 'E' then leg(2, true); arm(2, true) end
  leg(1, false); if view ~= 'E' then leg(2, false) end
  coat(sh, hip, hem, p.sway, view, p.billow)
  for y = headY + 10, shY + 1 do P(sh.x + (view == 'E' and 2 or 0) + (p.headDx or 0) * (shY - y) / (shY - headY), y, 'lg2'); P(sh.x + 1 + (view == 'E' and 2 or 0) + (p.headDx or 0) * (shY - y) / (shY - headY), y, 'lg1') end   -- the neck, a stick into the head
  if view ~= 'N' then arm(1, false); if view ~= 'E' then arm(2, false) end end
  pumpkin(sh.x + (view == 'E' and 4 or 0) + (p.headDx or 0), headY, view, p.mouth, p.glow, p.tilt)
  if view == 'N' then arm(1, false); arm(2, false) end
end

-- ------------------------------------------------------------------ crawling: down on all fours like a spider
local function crawl(view, f)
  local ph = f / 6 * math.pi * 2
  local body = {x = 0, y = -42 + math.floor(math.sin(ph * 2) * 1.5)}
  local function limb(bx, by, kx, ky, fx, fy, far)
    local r = far and {'co1', 'co1', 'co2', 'co3', 'co3', 'co3'} or CO
    line(bx, by, kx, ky, 4, r, .55); line(kx, ky, fx, fy - 2, 3, far and {'lg1', 'lg1', 'lg2', 'lg2'} or LG, .5)
    hand(fx, fy - 1, math.pi / 2, .3, far) end
  if view == 'E' then
    for i, side in ipairs({2, 1}) do local far = side == 2
      for j, base in ipairs({{12, 0}, {-12, math.pi}}) do local ph2 = ph + base[2] + (far and math.pi / 2 or 0)
        local fx = base[1] * 1.6 + math.cos(ph2) * 8; local lift = math.max(0, math.sin(ph2)) * 6
        limb(body.x + base[1], body.y, body.x + base[1] * 1.2 + (base[1] > 0 and 6 or -6), body.y - 30 - lift, fx, -lift, far) end end
    ellipse(body.x, body.y, 20, 9, function(x, y, dx, dy) return band(CO, .55 - dx * .2 - dy * .3, 1, 6) end)
    for k = 0, 8 do P(-18 - k, body.y + 6 + (k % 3), 'co2') end                                              -- tatters dragging
    pumpkin(body.x + 26, body.y - 4, 'E', .3, 1, 0)
  else
    for _, side in ipairs({-1, 1}) do for j, base in ipairs({{-14, 0}, {14, math.pi}}) do
      local ph2 = ph + base[2] + (side < 0 and 0 or math.pi); local lift = math.max(0, math.sin(ph2)) * 6
      limb(side * 10, body.y + base[1] * .4, side * 30, body.y - 26 - lift, side * (38 + math.cos(ph2) * 4), base[1] * .3 - lift, view == 'N' and j == 1) end end
    ellipse(body.x, body.y, 18, 12, function(x, y, dx, dy) return band(CO, .55 - dx * .2 - dy * .3, 1, 6) end)
    if view == 'S' then pumpkin(0, body.y + 10, 'S', .4, 1, math.floor(math.sin(ph) * 1.5)) else pumpkin(0, body.y - 12, 'N', 0, 1, 0) end
  end
end

-- ------------------------------------------------------------------ poses for each clip
local function basePose(view)
  local s = (view == 'E') and 0 or 1
  return {bob = 0, lean = 0, sway = 0, mouth = 0, glow = 1, tilt = 0,
    feet = {[1] = {view == 'E' and 0 or -8, 0}, [2] = {view == 'E' and 0 or 8, 0}},
    hands = {[1] = {view == 'E' and 4 or -21, -54}, [2] = {view == 'E' and -2 or 21, -54}}}
end
local function pose(clip, view, f)
  local p = basePose(view)
  if clip == 'walk' then local ph = f / 8 * math.pi * 2; local cph = math.cos(ph); local sph = math.sin(ph)
    p.bob = -math.floor(math.abs(sph) * 2 + .5) + ((sph > 0 and sph > .7) and 2 or 0)                       -- the limp: a dip on the bad leg
    p.sway = ph - .9; p.tilt = math.floor(math.sin(ph - .6) * 2 + .5); p.headDx = p.tilt
    if view == 'E' then p.feet[1] = {math.floor(cph * 11), -math.max(0, math.floor(sph * 5))}; p.feet[2] = {-math.floor(cph * 11), -math.max(0, math.floor(-sph * 3))}
      p.hands[1] = {math.floor(-cph * 9) + 4, -54 + math.floor(math.abs(cph) * 3)}; p.hands[2] = {math.floor(cph * 7) - 2, -54}; p.lean = 3
    else local st = math.floor(cph * 3 + .5); p.feet[1] = {-8, (view == 'N' and -st or st)}; p.feet[2] = {8, (view == 'N' and st or -st)}
      p.hands[1] = {-21 - math.max(0, math.floor(-cph * 2)), -54 + math.floor(-cph * 4)}; p.hands[2] = {21 + math.max(0, math.floor(cph * 2)), -54 + math.floor(cph * 4)} end
  elseif clip == 'idle' then local b = (f == 1 or f == 2) and -1 or 0; p.bob = b; p.sway = f * .6
    p.tilt = (f == 2) and 3 or ((f == 3) and 1 or 0); p.headDx = p.tilt; p.spread = (f == 1) and .4 or .22
  elseif clip == 'scream' then local k = math.min(1, f / 2)
    p.mouth = k; p.headDy = -math.floor(k * 3); p.tilt = (f % 2 == 0) and 1 or -1; p.billow = math.floor(k * 4); p.sway = f * 1.3; p.spread = .45
    if view == 'E' then p.hands[1] = {4 + math.floor(k * 6), -54 - math.floor(k * 80), -math.pi / 2}; p.hands[2] = {-2 + math.floor(k * 3), -54 - math.floor(k * 74), -math.pi / 2}
    else p.hands[1] = {-21 - math.floor(k * 10), -54 - math.floor(k * 84), -math.pi / 2}; p.hands[2] = {21 + math.floor(k * 10), -54 - math.floor(k * 84), -math.pi / 2} end
    p.elbowUp = k > .5; p.glow = (f % 2 == 0) and 1 or .6
  elseif clip == 'lunge' then
    local crouch = ({4, 10, 6, 2})[f + 1]; p.bob = crouch; p.mouth = (f == 1 or f == 2) and 1 or .3; p.spread = .5; p.billow = (f == 1) and 6 or 2
    if view == 'E' then p.lean = ({2, 10, 8, 3})[f + 1]; local reach = ({4, 30, 24, 8})[f + 1]
      p.hands[1] = {reach + 6, -84 + crouch, 0}; p.hands[2] = {reach, -78 + crouch, 0}
    else local reach = ({0, 1, 1, 0})[f + 1]
      p.hands[1] = {-26 - reach * 6, -70 + crouch + reach * 6, math.pi * .6}; p.hands[2] = {26 + reach * 6, -70 + crouch + reach * 6, math.pi * .4} end
  elseif clip == 'hurt' then
    p.lean = ({-4, -7, -5, -2})[f + 1]; p.headDx = ({-5, -8, -6, -2})[f + 1]; p.tilt = -2; p.glow = (f % 2 == 1) and .4 or .9; p.mouth = .6
    p.hands[1] = {-24, -64 + f * 2, math.pi * .7}; p.hands[2] = {18, -48, math.pi * .45}
  end
  return p
end

for r, row in ipairs(ROWS) do local clip, d, n = row[1], row[2], row[3]
  for f = 0, n - 1 do
    OX, OY = f * FW, (r - 1) * FH; FLIP = (d == 'W') and -1 or 1
    local view = (d == 'W') and 'E' or d
    if clip == 'crawl' then crawl(view, f) else figure(view, pose(clip, view, f)) end
  end end
px.outline(c, px.i(c, 'OUT'))
c.weather = {speck = .05, grime = 0, round = .6, radius = 3, mottle = .18}
px.save(c, app.fs.joinPath(out, 'hollow.png'))
print('META hollow done')
