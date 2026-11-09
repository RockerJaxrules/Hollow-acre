-- Trees, bushes and small plants for Hollow Acre, drawn in Aseprite (headless). Our own look, studied from how the
-- classic farm games build trees: a crown made of separate leaf clumps, each lit from the top-left with flat colour
-- bands and small leaf marks; deep shadow in the gaps between clumps; a trunk that flares into roots; hue-shifted
-- ramps (shadows go teal or plum, light goes yellow). Every sprite keeps the old sprite's size and anchor so the world
-- doesn't move. Writes <name>.png and prints META lines for install.py.
local dir = app.params['dir'] or '.'
local out = app.params['out'] or dir
local only = app.params['only']
local px = dofile(app.fs.joinPath(dir, 'px.lua'))

local function ramp(prefix, cols) local r = {}; for i, h in ipairs(cols) do r[i] = {prefix .. i, h} end return r end
local RAMPS = {
  g = {'#14262a', '#1b3a34', '#24503a', '#356a3c', '#4f8a3e', '#74a843', '#a2c650', '#d2e070'},   -- summer green
  t = {'#101e26', '#15302f', '#1c443c', '#245a48', '#2f7254', '#468a5e', '#68a66c', '#9cc884'},   -- pine teal
  o = {'#2a1420', '#4a1e22', '#7a2e22', '#a84a24', '#d06e28', '#ec9a34', '#f6c45a', '#fbe48e'},   -- maple orange
  r = {'#240f1e', '#42142a', '#6c1c2e', '#9a2a30', '#c43e34', '#e2603c', '#f28a52', '#f8b878'},   -- maple red
  y = {'#2a2014', '#4a3818', '#70561c', '#9a7a20', '#c49e28', '#e2c03c', '#f2dc64', '#fcf0a0'},   -- gold
  w = {'#1a2618', '#2a3a1c', '#3e5220', '#566a26', '#728430', '#90a03c', '#b0bc54', '#d4dc80'},   -- willow, birch green
  u = {'#2a1622', '#4a2026', '#6e2c26', '#8e4228', '#ae5a2e', '#c8783a', '#dc9a50', '#ecc078'},   -- oak russet
  k = {'#1e1218', '#34201e', '#4e3024', '#6c4430', '#8a5c3a', '#a87848', '#c8995e'},              -- bark
  b = {'#2a2430', '#6a6070', '#b4aab0', '#dcd6d2', '#f4f0e8'},                                    -- birch bark
  d = {'#1e1a20', '#3a3238', '#585058', '#7a7076', '#9e948e', '#c4baae'},                         -- dead wood
  s = {'#1e1c26', '#363444', '#4e4c5e', '#6a687a', '#8a8898', '#acaab6', '#d0ced6'},              -- stone
  a = {'#5a0f1e', '#b0222a', '#f05a48'},                                                          -- apples, holly
  e = {'#2e1a3e', '#5a3a78', '#8a6aa8'},                                                          -- elderberry
  j = {'#2a3a62', '#4a6496', '#8aa8d0'},                                                          -- juniper berries
  m = {'#6a1420', '#c02a2a', '#f2e6d0'},                                                          -- toadstool
}
local PAL = {{'OUT', '#22161e'}}
for k, cols in pairs(RAMPS) do for _, e in ipairs(ramp(k, cols)) do PAL[#PAL + 1] = e end end
local function R_(k) local r = {}; for i = 1, #RAMPS[k] do r[i] = k .. i end return r end
local G, T, O, Rd, Y, W, U, K, Bw, D, S = R_('g'), R_('t'), R_('o'), R_('r'), R_('y'), R_('w'), R_('u'), R_('k'), R_('b'), R_('d'), R_('s')

local function P(c, x, y, col) px.p(c, x, y, col) end
local function H(a, b) return px.h(a, b) end
local function band(c, r, l, lo, hi) return px.band(c, r, l, lo, hi) end
local function clamp(v, a, b) return math.max(a, math.min(b, v)) end
local function step(c, r, x, y) local v = px.get(c, x, y); if v == 0 then return nil end; for i = 1, #r do if px.i(c, r[i]) == v then return i end end return nil end

-- ------------------------------------------------------------------ trunks and branches
local function trunk(c, xc, ybot, ytop, w0, w1, r, seed, roots)
  for y = ytop, ybot do local t = (y - ytop) / math.max(1, ybot - ytop)
    local w = w1 + (w0 - w1) * t ^ 1.6
    local fl = y - (ybot - 7); if fl > 0 then w = w + fl * 1.3 end
    local x0 = math.floor(xc - w / 2 + math.sin(y * .07 + seed) * .8); local x1 = math.floor(x0 + w)
    for x = x0, x1 do local u = (x - x0) / math.max(1, x1 - x0)
      local l = .78 - u * .62
      if (x - x0 + math.floor(math.sin(y * .25 + seed + x) * 1.2)) % 4 == 0 and u > .12 and u < .9 then l = l - .3 end   -- grooves in the bark
      if u < .14 then l = l + .12 end
      P(c, x, y, band(c, r, l, 2, #r)) end end
  for i = 1, roots or 0 do local side = (i % 2 == 0) and 1 or -1; local len = 4 + math.floor(H(i, seed) * 4)
    for k = 0, len do local yy = ybot - 2 + math.floor(k * .35); local xx = math.floor(xc + side * (w0 / 2 + k))
      for j = 0, math.max(0, 2 - k // 2) do P(c, xx, yy - j, band(c, r, side < 0 and .6 or .25, 2, #r)) end end end
end
local function limb(c, x0, y0, x1, y1, w, r)
  local n = math.max(math.abs(x1 - x0), math.abs(y1 - y0)); if n < 1 then return end
  for i = 0, n do local t = i / n; local x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t; local ww = w * (1 - t * .5)
    for k = -math.floor(ww / 2), math.floor(ww / 2) do P(c, x + k, y, band(c, r, .62 - k / math.max(1, ww) * .7, 2, #r)) end end
end

-- ------------------------------------------------------------------ a crown of leaf clumps
local function crown(c, o)
  local r, cx, cy, rx, ry, seed = o.r, o.cx, o.cy, o.rx, o.ry, o.seed or 1
  -- the deep inside of the crown first, so gaps between clumps read as shadow, not holes
  px.ellipse(c, cx, cy + ry * .1, rx * .7, ry * .68, r[3])
  for _, b in ipairs(o.limbs or {}) do limb(c, b[1], b[2], b[3], b[4], b[5], o.bark or K) end
  local cl = {}
  local n = o.n or 18
  for i = 1, n do local a = i * 2.39996 + seed; local f = math.sqrt(i / n) * .84
    local qx, qy = cx + math.cos(a) * f * rx * .9, cy + math.sin(a) * f * ry * .9
    local rr = (o.rmin or 9) + H(i, seed) * ((o.rmax or 15) - (o.rmin or 9)) * (1.15 - f * .4)
    cl[#cl + 1] = {qx, qy, rr, H(i, seed + 5) * 6.28} end
  table.sort(cl, function(a, b) return a[2] < b[2] end)
  local lo = o.lo or 3
  for _, q in ipairs(cl) do local qx, qy, rr, ph = q[1], q[2], q[3], q[4]
    for y = math.floor(qy - rr * 1.2), math.ceil(qy + rr * 1.2) do for x = math.floor(qx - rr * 1.2), math.ceil(qx + rr * 1.2) do
      local dx, dy = (x + .5 - qx) / rr, (y + .5 - qy) / (rr * (o.squash or .92)); local th = math.atan(dy, dx)
      local edge = 1 + .1 * math.sin(th * 6 + ph) + .05 * math.sin(th * 11 + ph * 2)
      local d = math.sqrt(dx * dx + dy * dy) / edge
      if d <= 1 then
        local dir = dx * .55 + dy * .8
        local lloc = .52 - .38 * dir
        local lg = .58 - .38 * ((x - cx) / rx * .45 + (y - cy) / ry * .75)
        local l = lloc * .5 + lg * .55 + (o.lift or 0) - .1
        if d < .82 and d > .3 and dir < -.28 then l = l + .2 end                     -- the lit crescent on each clump's top-left
        if d > .76 and dir > .15 then l = l - .38 end                                 -- its dark rim where it sits over the clump behind
        P(c, x, y, band(c, r, l, lo, #r - 2)) end end end end
  -- sparse leaf marks: a light dash here, a dark nick there
  local area = rx * ry
  for i = 0, math.floor(area / 40) do local x = math.floor(cx - rx + H(i, seed + 21) * rx * 2); local y = math.floor(cy - ry + H(i, seed + 22) * ry * 2)
    local k = step(c, r, x, y)
    if k and step(c, r, x + 1, y) and step(c, r, x, y + 1) then
      if k >= 5 then P(c, x, y, r[math.min(#r, k + 1)]); P(c, x + 1, y, r[math.min(#r, k + 1)])
      elseif k >= lo then P(c, x, y + 1, r[k - 1]); P(c, x + 1, y + 1, r[k - 1]) end end end
  -- a few bright pixels where the sun catches the top-left leaves
  for i = 0, (o.sparks or 14) do local a = 3.6 + H(i, seed + 9) * 1.6; local f = .55 + H(i, seed + 8) * .4
    local x, y = math.floor(cx + math.cos(a) * rx * f), math.floor(cy + math.sin(a) * ry * f)
    if step(c, r, x, y) and step(c, r, x, y) >= 5 then P(c, x, y, r[#r]) end end
end
local function fruit(c, cx, cy, rx, ry, n, cols, seed)
  for i = 1, n do local a = H(i, seed) * 6.28; local f = math.sqrt(H(i, seed + 1)) * .85
    local x, y = math.floor(cx + math.cos(a) * rx * f), math.floor(cy + math.sin(a) * ry * f)
    if px.get(c, x, y) ~= 0 then P(c, x, y, cols[2]); P(c, x + 1, y, cols[2]); P(c, x, y + 1, cols[2]); P(c, x + 1, y + 1, cols[1]); P(c, x, y, cols[3]) end end
end

-- ------------------------------------------------------------------ conifers: tiers of drooping boughs
local function conifer(c, cx, ybase, h, wmax, tiers, r, seed, trunkH)
  trunk(c, cx, ybase, ybase - (trunkH or 10) - 6, 7, 5, K, seed, 2)
  local top = ybase - (trunkH or 10) - h
  local th = h / (tiers + .6)
  for i = tiers, 1, -1 do                                                              -- the lowest, widest tier first; each skirt hangs over the one below
    local t0 = top + (i - 1) * th * .9; local t1 = t0 + th * 1.5
    local hw1 = wmax * (.2 + .8 * (i / tiers)); local hw0 = hw1 * .22
    local function hwAt(y) local t = clamp((y - t0) / (t1 - t0), 0, 1); return hw0 + (hw1 - hw0) * t ^ .85 end
    for y = math.floor(t0), math.ceil(t1 - 3) do local hw = hwAt(y); local t = (y - t0) / (t1 - t0)
      for x = math.floor(cx - hw), math.ceil(cx + hw) do local u = (x - cx) / math.max(1, hw)
        local l = .6 - u * .38 - (t < .22 and .2 or 0)
        P(c, x, y, band(c, r, l, 2, #r - 1)) end end
    -- the bough tips: little drooping clumps along the bottom of the skirt
    local nb = math.max(3, math.floor(hw1 * 2 / 7))
    for k = 0, nb do local bx = cx - hw1 + k * (hw1 * 2 / nb) + (H(k, seed + i) - .5) * 2; local by = t1 - 3 + math.abs(bx - cx) / hw1 * 1.5
      local u = (bx - cx) / hw1
      for y = math.floor(by - 3), math.ceil(by + 3) do for x = math.floor(bx - 4), math.ceil(bx + 4) do
        local dx, dy = (x + .5 - bx) / 4.2, (y + .5 - by) / 3.2
        if dx * dx + dy * dy <= 1 then local l = .66 - u * .38 - dy * .2 - dx * .1; P(c, x, y, band(c, r, l, 2, #r - 1)) end end end
      P(c, math.floor(bx), math.floor(by + 3), band(c, r, .3 - u * .2, 2, #r - 1)) end
    -- needle strokes: down and out from the trunk, light on the sun side, dark on the other
    for y = math.floor(t0 + 3), math.ceil(t1 - 2), 3 do for x = math.floor(cx - hw1), math.ceil(cx + hw1), 3 do
      local xx = x + ((y // 3) % 2); local k = step(c, r, xx, y)
      if k and H(xx // 2, y // 2 + seed) > .45 then
        if xx < cx then P(c, xx, y, r[math.min(#r, k + 1)]); P(c, xx - 1, y + 1, r[math.min(#r, k + 1)])
        else P(c, xx, y, r[math.max(1, k - 1)]); P(c, xx + 1, y + 1, r[math.max(1, k - 1)]) end end end end
  end
  P(c, cx, math.floor(top) - 1, r[6]); P(c, cx, math.floor(top) - 2, r[7])
end

-- ------------------------------------------------------------------ the specs
local N = {}
local function new(w, h) return px.new(w, h, PAL) end
local function done(c, ax, ay) px.outline(c, px.i(c, 'OUT')); return c, {w = c.w, h = c.h, ax = ax, ay = ay} end

local function deciduous(r, w, h, ay, o)
  local c = new(w, h); local cx = w / 2
  trunk(c, cx, ay + 2, o.cy + 6, o.w0 or 12, o.w1 or 7, o.bark or K, o.seed, o.roots or 3)
  crown(c, {r = r, cx = cx, cy = o.cy, rx = o.rx, ry = o.ry, seed = o.seed, n = o.n, rmin = o.rmin, rmax = o.rmax, bark = o.bark,
    limbs = {{cx, o.cy + o.ry * .5, cx - o.rx * .45, o.cy - o.ry * .1, 5}, {cx, o.cy + o.ry * .4, cx + o.rx * .5, o.cy, 4}, {cx, o.cy + o.ry * .3, cx + 2, o.cy - o.ry * .4, 4}}})
  if o.fruit then fruit(c, cx, o.cy, o.rx * .9, o.ry * .85, o.fruitN or 16, o.fruit, o.seed + 3) end
  return done(c, w / 2, ay)
end
for name, r, seed in pairs({}) do end
N.maple_green  = function() return deciduous(G, 120, 150, 144, {cy = 58, rx = 50, ry = 52, seed = 11, n = 20}) end
N.maple_gold   = function() return deciduous(Y, 120, 150, 144, {cy = 58, rx = 50, ry = 52, seed = 12, n = 20}) end
N.maple_orange = function() return deciduous(O, 120, 150, 144, {cy = 58, rx = 50, ry = 52, seed = 13, n = 20}) end
N.maple_red    = function() return deciduous(Rd, 120, 150, 144, {cy = 58, rx = 50, ry = 52, seed = 14, n = 20}) end
N.oak_green    = function() return deciduous(G, 136, 140, 134, {cy = 54, rx = 62, ry = 44, seed = 21, n = 24, w0 = 18, w1 = 10, rmin = 10, rmax = 16, roots = 4}) end
N.oak_russet   = function() return deciduous(U, 136, 140, 134, {cy = 54, rx = 62, ry = 44, seed = 22, n = 24, w0 = 18, w1 = 10, rmin = 10, rmax = 16, roots = 4}) end
N.tree_green   = function() return deciduous(G, 94, 105, 97, {cy = 42, rx = 40, ry = 36, seed = 31, n = 14, w0 = 10, w1 = 6, rmin = 8, rmax = 12}) end
N.tree_orange  = function() return deciduous(O, 94, 107, 99, {cy = 44, rx = 40, ry = 36, seed = 32, n = 14, w0 = 10, w1 = 6, rmin = 8, rmax = 12}) end
N.apple_tree   = function() return deciduous(G, 108, 116, 110, {cy = 46, rx = 46, ry = 38, seed = 41, n = 16, w0 = 11, w1 = 7, rmin = 8, rmax = 13, fruit = {'a1', 'a2', 'a3'}, fruitN = 22}) end
N.apple_gold   = function() return deciduous(W, 108, 116, 110, {cy = 46, rx = 46, ry = 38, seed = 42, n = 16, w0 = 11, w1 = 7, rmin = 8, rmax = 13, fruit = {'y4', 'y6', 'y8'}, fruitN = 22}) end

local function birch(r, seed)
  local c = new(80, 152); local cx = 40; local ay = 146
  -- a slim white trunk with black marks, leaning a little
  for y = 40, ay + 1 do local t = (y - 40) / (ay - 40); local w = 4 + t * 4 + ((y > ay - 4) and (y - ay + 4) or 0); local xc = cx + math.sin(t * 2 + seed) * 2
    for x = math.floor(xc - w / 2), math.floor(xc + w / 2) do local u = (x - (xc - w / 2)) / w
      local col = u < .35 and Bw[5] or (u < .7 and Bw[4] or Bw[3])
      if H(x // 2 + seed, y // 3) > .82 and u > .15 and u < .85 then col = (H(x, y) > .5) and Bw[1] or Bw[2] end
      if (y % 11 == 0) and u > .2 then col = Bw[2] end
      P(c, x, y, col) end end
  crown(c, {r = r, cx = cx, cy = 52, rx = 28, ry = 46, seed = seed, n = 16, rmin = 7, rmax = 11, bark = Bw, squash = 1.05,
    limbs = {{cx, 80, cx - 14, 54, 3}, {cx, 70, cx + 13, 46, 3}}})
  return done(c, 40, ay)
end
N.birch_gold  = function() return birch(Y, 51) end
N.birch_green = function() return birch(W, 52) end

local function conif(w, h, ay, hh, wmax, tiers, r, seed, trunkH)
  local c = new(w, h); conifer(c, math.floor(w / 2), ay + 1, hh, wmax, tiers, r, seed, trunkH); return done(c, w / 2, ay)
end
N.pine_0   = function() return conif(85, 91, 89, 66, 36, 4, T, 61, 8) end
N.pine_1   = function() return conif(85, 91, 89, 64, 38, 4, G, 62, 9) end
N.pine_o0  = function() return conif(85, 91, 89, 66, 36, 4, O, 63, 8) end
N.pine_o1  = function() return conif(85, 91, 89, 64, 38, 4, Y, 64, 9) end
N.spruce_0 = function() return conif(70, 134, 129, 106, 30, 6, T, 65, 10) end
N.spruce_1 = function() return conif(60, 112, 107, 88, 25, 5, T, 66, 9) end

N.willow = function()
  local c = new(150, 146); local cx = 75; local ay = 140
  trunk(c, cx + 2, ay + 1, 60, 20, 12, K, 71, 4)
  limb(c, cx, 70, cx - 34, 44, 6, K); limb(c, cx + 4, 66, cx + 36, 40, 6, K)
  crown(c, {r = W, cx = cx, cy = 44, rx = 62, ry = 32, seed = 72, n = 20, rmin = 9, rmax = 14, squash = .8})
  -- the hanging curtains: ribbons of leaves, swaying, over the crown's edge and in front of the trunk
  for i = 0, 26 do local sx = cx - 62 + i * 4.8 + H(i, 3) * 2; local u = (sx - cx) / 64
    local y0 = 44 + math.sqrt(math.max(0, 1 - u * u)) * 20 - 12 + H(i, 4) * 8
    local len = 42 + H(i, 5) * 44 - math.abs(u) * 10
    if math.abs(u) < .3 and H(i, 6) < .55 then len = len * .55 end
    for y = math.floor(y0), math.floor(y0 + len) do local f = (y - y0) / len; local x = math.floor(sx + math.sin(y * .1 + i) * 1.5)
      local wd = (f > .85) and 1 or 2
      for k = 0, wd do local l = .66 - u * .3 - f * .3 - k * .14 + (((y + i * 3) % 6 == 0) and .14 or 0)
        P(c, x + k, y, band(c, W, l, 3, 8)) end end end
  return done(c, 75, ay)
end

local function bare(c, x, y, a, len, w, depth, seed, r)
  local x1, y1 = x + math.cos(a) * len, y + math.sin(a) * len
  limb(c, x, y, x1, y1, w, r)
  if depth <= 0 or len < 5 then return end
  local n = (depth > 2) and 2 or (H(x, y + seed) > .4 and 2 or 1)
  for i = 1, n do local da = (i == 1 and -1 or 1) * (.35 + H(i + depth, seed) * .45)
    bare(c, x1, y1, a + da, len * (.62 + H(depth, i + seed) * .2), math.max(1, w * .62), depth - 1, seed + i * 7, r) end
end
N.deadoak = function()
  local c = new(116, 126); local cx = 58; local ay = 120
  trunk(c, cx, ay + 1, 64, 16, 10, D, 81, 4)
  bare(c, cx - 2, 66, -2.2, 26, 6, 4, 82, D); bare(c, cx + 2, 66, -.95, 28, 6, 4, 83, D); bare(c, cx, 64, -1.6, 30, 5, 4, 84, D)
  px.ellipse(c, cx + 2, 92, 2.5, 3.5, 'OUT'); P(c, cx + 1, 90, 'd2')                       -- a hollow
  return done(c, cx, ay)
end
N.deadtree = function()
  local c = new(76, 95); local cx = 38; local ay = 93
  trunk(c, cx, ay + 1, 46, 10, 7, D, 85, 3)
  bare(c, cx - 1, 48, -2.0, 18, 4, 3, 86, D); bare(c, cx + 1, 48, -1.05, 20, 4, 3, 87, D); bare(c, cx, 46, -1.55, 22, 4, 3, 88, D)
  return done(c, cx, ay)
end
N.snag = function()
  local c = new(52, 114); local cx = 26; local ay = 108
  trunk(c, cx, ay + 1, 24, 15, 11, D, 89, 3)
  for x = cx - 7, cx + 7 do local tt = 24 + math.floor(H(x, 9) * 10) + ((x - cx) % 3 == 0 and 4 or 0); for y = 18, tt do P(c, x, y, 0) end end   -- broken off, jagged
  px.ellipse(c, cx - 1, 48, 2.5, 3.5, 'OUT')
  for i, y in ipairs({64, 74, 82}) do local x0 = (i % 2 == 0) and cx + 5 or cx - 13
    for k = 0, 8 do px.hline(c, x0 + (i % 2 == 0 and 0 or 8 - k) - (i % 2 == 0 and 0 or 0), x0 + (i % 2 == 0 and k or 8), y + (k < 3 and 0 or 0), k < 2 and 'o6' or 'o5') end
    px.hline(c, x0, x0 + 8, y + 1, 'o4'); px.hline(c, x0, x0 + 8, y + 2, 'o3') end
  for y = 30, 100, 9 do P(c, cx - 5 + (y % 4), y, 'd6'); P(c, cx - 4 + (y % 4), y + 1, 'd5') end
  return done(c, cx, ay)
end

-- ------------------------------------------------------------------ bushes and hedges
local function bush(r, w, h, ay, seed, berry)
  local c = new(w, h)
  crown(c, {r = r, cx = w / 2, cy = ay - h * .38, rx = w * .44, ry = h * .4, seed = seed, n = 9, rmin = 6, rmax = 9, squash = .85, sparks = 6})
  if berry then fruit(c, w / 2, ay - h * .38, w * .4, h * .34, 9, berry, seed + 2) end
  return done(c, w / 2, ay)
end
N.bush_green = function() return bush(G, 50, 40, 36, 91) end
N.bush_gold  = function() return bush(Y, 50, 40, 36, 92) end
N.bush_red   = function() return bush(Rd, 50, 40, 36, 93) end
N.holly      = function() return bush(T, 50, 40, 36, 94, {'a1', 'a2', 'a3'}) end
N.juniper    = function() return bush(T, 50, 40, 36, 95, {'j1', 'j2', 'j3'}) end
N.elder      = function() return bush(W, 50, 40, 36, 96, {'e1', 'e2', 'e3'}) end
N.sumac      = function() return bush(Rd, 50, 40, 36, 97, {'r4', 'r6', 'r8'}) end

local function hedgebox(c, x0, y0, x1, ytop, yfront, yb, seed)
  for y = y0, yb do for x = x0, x1 do
    local bump = math.floor(H(x // 4, seed) * 3)
    if y >= ytop - bump then
      local top = y < yfront
      local l = top and (.72 - (y - ytop) / 80) or (.4 - (y - yfront) / 60)
      if (x + (y // 3) * 2) % 5 == 0 then l = l + (top and .14 or .1) end
      if (x * 3 + y) % 7 == 0 then l = l - .16 end
      if y == yfront then l = .2 end
      P(c, x, y, band(c, G, l, 2, 7)) end end end
end
N.hedge     = function() local c = new(70, 40); hedgebox(c, 1, 4, 68, 6, 16, 36, 98); return done(c, 0, 36) end
N.hedge_v   = function() local c = new(30, 62); hedgebox(c, 2, 4, 27, 6, 46, 58, 99); return done(c, 13.5, 54) end
N.hedge_v_b = function() local c = new(30, 62); hedgebox(c, 2, 4, 27, 6, 46, 58, 100)
  for i = 1, 6 do local x, y = 5 + math.floor(H(i, 7) * 18), 10 + math.floor(H(i, 8) * 30); P(c, x, y, 'r6'); P(c, x + 1, y, 'r5') end; return done(c, 13.5, 54) end

-- ------------------------------------------------------------------ small plants, rocks, stumps
N.fern = function(r) r = r or Y
  local c = new(46, 30); local cx, by = 23, 27
  for i = 0, 8 do local a = -math.pi * (.1 + i * .8 / 8); local len = 14 + H(i, 1) * 6 - math.abs(i - 4) * .5
    for t = 0, len do local f = t / len; local x = cx + math.cos(a) * t * 1.2; local yy = by - 1 + math.sin(a) * t * .85 + f * f * 8
      P(c, x, yy, band(c, r, .45 - f * .1, 2, 6))
      local pl = math.floor((1 - f) * 3) + 1                                      -- pinnae, shorter toward the tip
      if t % 2 == 0 and f > .08 then for k = 1, pl do P(c, x - k * .3, yy - k, band(c, r, .78 - f * .2 - k * .08, 2, 8)); P(c, x + k * .3, yy + k * .6, band(c, r, .32, 2, 6)) end end end end
  return done(c, cx, by)
end
N.fern_green = function() return N.fern(G) end
N.reeds = function()
  local c = new(32, 46); local by = 43
  for i = 0, 6 do local x0 = 6 + i * 3.2; local h = 24 + H(i, 2) * 16; local lean = (H(i, 3) - .5) * 6
    for t = 0, h do local x = x0 + lean * (t / h) ^ 2; P(c, x, by - t, band(c, W, .3 + t / h * .5, 2, 7)) end
    if i % 2 == 0 then local x = x0 + lean; for y = by - h - 2, by - h + 7 do P(c, x - 1, y, 'k4'); P(c, x, y, 'k5'); P(c, x + 1, y, 'k3') end; P(c, x, by - h - 4, 'w5') end end
  return done(c, 16, by)
end
local function rock(w, h, ay, seed)
  local c = new(w, h); local cx = w / 2
  local pts = {{2, ay - 2}, {3, ay - h * .45}, {cx - w * .15, 3}, {cx + w * .25, 2}, {w - 3, ay - h * .5}, {w - 2, ay - 1}}
  px.poly(c, pts, function(x, y) local u = (x - 2) / (w - 4); local top = y < ay - h * .45 + (x - cx) * .1
    local l = top and .8 - u * .3 or (u < .55 and .5 or .25)
    if H(x // 3, y // 3 + seed) > .85 then l = l - .15 end
    return band(c, S, l, 2, 7) end)
  for x = 3, w - 4 do if H(x, seed) > .55 then P(c, x, math.floor(ay - h * .45 + (x - cx) * .1) - 1, 'g4') end end   -- moss along the top edge
  return done(c, cx, ay)
end
N.rock_0 = function() return rock(26, 22, 19, 1) end
N.rock_1 = function() return rock(34, 28, 25, 2) end
local function weeds(seed)
  local c = new(26, 22); local by = 19
  for i = 0, 7 do local x0 = 4 + i * 2.4; local h = 6 + H(i, seed) * 9; local lean = (H(i, seed + 1) - .5) * 8
    for t = 0, h do P(c, x0 + lean * (t / h) ^ 2, by - t, band(c, i % 3 == 0 and Y or W, .35 + t / h * .45, 2, 7)) end
    if i % 3 == 1 then P(c, x0 + lean, by - h - 1, 'y7'); P(c, x0 + lean + 1, by - h, 'y6') end end
  return done(c, 13, by)
end
N.weeds_0 = function() return weeds(3) end
N.weeds_1 = function() return weeds(4) end
local function toadstools(seed)
  local c = new(28, 28); local by = 26
  for i, m in ipairs({{9, 9, 6}, {18, 13, 5}, {14, 18, 3.5}}) do local x, h, r = m[1], m[2], m[3]
    px.rect(c, x - 1, by - h, x + 1, by, 'm3'); px.vline(c, x + 1, by - h, by, 'b3')
    px.ellipse(c, x + .5, by - h, r, r * .62, 'm2'); px.hline(c, math.floor(x - r + 1), math.floor(x + r), math.floor(by - h + r * .5), 'm1')
    P(c, x - 1, by - h - 1, 'm3'); P(c, x + 2, by - h, 'm3'); P(c, x - 3, by - h + 1, 'm3') end
  return done(c, 14, by)
end
N.mushroom = function() return toadstools(1) end
N.mushroom_b = function() local c = new(28, 28); local by = 26
  for i, m in ipairs({{8, 7, 5}, {16, 10, 6}, {22, 6, 3.5}}) do local x, h, r = m[1], m[2], m[3]
    px.rect(c, x - 1, by - h, x + 1, by, 'd6'); px.ellipse(c, x + .5, by - h, r, r * .55, 'u5'); px.hline(c, math.floor(x - r + 1), math.floor(x + r), math.floor(by - h + r * .45), 'u3'); P(c, x - 1, by - h - 1, 'u7') end
  return done(c, 14, by) end
local function stump(w, h, ay, r, rings)
  local c = new(w, h); local cx = w / 2; local rx = w * .36; local top = ay - h * .55
  trunk(c, cx, ay + 1, top + 3, rx * 2, rx * 2, r, 5, (w > 40) and 4 or 2)
  px.ellipse(c, cx + .5, top + 1, rx + .5, rx * .42 + .5, r[2])
  px.ellipse(c, cx + .5, top, rx, rx * .4, rings[3]); px.ellipse(c, cx + .5, top, rx * .7, rx * .28, rings[2]); px.ellipse(c, cx + .5, top, rx * .4, rx * .16, rings[3]); P(c, cx, top, rings[1])
  for k = 0, 2 do P(c, math.floor(cx + rx * .3 + k), math.floor(top - rx * .1 + k), rings[1]) end   -- a crack
  return done(c, cx, ay)
end
local RING = {'k3', 'k6', 'k7'}
N.stump = function() return stump(46, 32, 30, K, RING) end
N.stump_maple = function() return stump(30, 22, 19, K, RING) end
N.stump_oak = function() return stump(30, 22, 19, U, {'u3', 'u6', 'u7'}) end
N.stump_pine = function() return stump(28, 22, 19, K, {'k4', 'y6', 'y7'}) end
N.applespill = function()
  local c = new(58, 34); local by = 30
  px.ellipse(c, 22, by - 8, 14, 9, 'k5'); px.ellipse(c, 22, by - 8, 11, 6.5, 'k2')                -- a basket on its side
  for y = by - 16, by - 1 do for x = 9, 35 do if px.get(c, x, y) == px.i(c, 'k5') and (x + y) % 3 == 0 then P(c, x, y, 'k6') end end end
  for i = 0, 9 do local x, y = 26 + math.floor(H(i, 1) * 26), by - 4 - math.floor(H(i, 2) * 10)
    px.ellipse(c, x + .5, y + .5, 2.5, 2.5, 'a2'); P(c, x + 1, y + 1, 'a1'); P(c, x - 1, y - 1, 'a3'); P(c, x, y - 2, 'k3') end
  return done(c, 29, by)
end

local names = {}
for k in pairs(N) do names[#names + 1] = k end
table.sort(names)
for _, name in ipairs(names) do
  if not only or only == name then
    local c, m = N[name](); c.weather = {grime = .15, round = 1.35, radius = math.max(4, math.floor(c.w / 7)), patch = .18, cell = 6}
    px.save(c, app.fs.joinPath(out, name .. '.png'))
    print(string.format('META %s %d %d %.1f %d %.2f - -', name, m.w, m.h, m.ax, m.ay, m.w / 32))
  end
end
