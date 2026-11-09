-- Item icons for Hollow Acre: every thing you can carry, drawn at 32x32 in Aseprite as one set. One light (top-left),
-- rounded forms shaded through their ramps, a dark outline, the same clean finish as the world (no speckle).
-- Writes icon32_<key>.png and META lines for install.py. Keys are the names the game asks for (iconOf / gradeIcon):
-- tools keep grey metal (and the can its green, the rod its cane) so the upgrade tints still find them.
local dir = app.params['dir'] or '.'
local out = app.params['out'] or dir
local only = app.params['only']
local px = dofile(app.fs.joinPath(dir, 'px.lua'))

local RAMPS = {
  mt = {'#2a2c34', '#3e414c', '#585c68', '#767b86', '#979ca6', '#bcc0c6', '#e2e4e6'},   -- steel
  wd = {'#2e1c14', '#4a2e1e', '#6a4428', '#8c5c34', '#ad7842', '#c99656', '#e2b876'},   -- wood
  gr = {'#14281a', '#1e3c20', '#2c5428', '#3e6e30', '#58883a', '#78a448', '#a0c060'},   -- leaf
  cg = {'#163024', '#22442e', '#2e5c3a', '#3e7646', '#529052', '#6eaa62', '#94c47c'},   -- the can's paint
  rd = {'#3a0e14', '#5c1820', '#82242a', '#a83832', '#c8523c', '#e0744e', '#f09c6c'},
  og = {'#4a1e10', '#6e3014', '#98461a', '#c06222', '#dc8030', '#eea04a', '#f8c470'},
  yl = {'#4a3410', '#6e5016', '#98741e', '#c09a2a', '#dcbc3e', '#eed660', '#faf09a'},
  pp = {'#5a4a3a', '#7c6a54', '#9c8a6e', '#bcaa88', '#d6c6a2', '#e8dcbe', '#f6f0dc'},   -- paper, cream
  wh = {'#6a6670', '#8a8690', '#aaa6ac', '#c8c4c6', '#dedad8', '#eeebe6', '#fcfaf4'},   -- bone, milk
  st = {'#2a2630', '#3c3842', '#524e58', '#6a6670', '#848088', '#a09ca2', '#c0bcbe'},   -- stone
  cu = {'#3a1a10', '#5c2a16', '#86401e', '#ae5a28', '#cc7a36', '#e09a50', '#f2c27a'},   -- copper
  br = {'#3e2c10', '#5e4416', '#86641e', '#ac8628', '#cca83a', '#e4c856', '#f6e690'},   -- brass, gold
  cy = {'#0c2a2e', '#124044', '#1a5a5c', '#247a76', '#349c92', '#56c0ae', '#96e6d2'},   -- glow
  bl = {'#141c38', '#1e2c52', '#2c406e', '#3c588e', '#5474ac', '#7a98c8', '#aac0e2'},
  pu = {'#2a1430', '#3e1e46', '#58285e', '#743a76', '#90528e', '#ae74a8', '#cea0c6'},
  ck = {'#0c0a10', '#16141c', '#22202a', '#302e3a', '#42404e', '#5a5868', '#7a7a8c'},   -- coal, iron black
  le = {'#2a160e', '#40221a', '#5a3224', '#764430', '#92583c', '#ac704e', '#c88c66'},   -- leather
  fs = {'#1a2a2c', '#2a4040', '#3e5a58', '#587672', '#78948c', '#9cb4a8', '#c6d6c8'},   -- fish
  pk = {'#4a1e26', '#6e2e38', '#94444c', '#b86264', '#d4867e', '#ecac9c', '#f8d0c0'},
  rs = {'#3a1c14', '#5a2c1c', '#7c3e24', '#9a5230', '#b46a40', '#c88a5c', '#dcae84'},   -- rust
}
local PAL = {{'OUT', '#1e1418'}}
local KEYS = {}; for k in pairs(RAMPS) do KEYS[#KEYS + 1] = k end; table.sort(KEYS)
for _, k in ipairs(KEYS) do for i, h in ipairs(RAMPS[k]) do PAL[#PAL + 1] = {k .. i, h} end end
local RR = {}; for _, k in ipairs(KEYS) do RR[k] = {}; for i = 1, #RAMPS[k] do RR[k][i] = k .. i end end

local c
local function P(x, y, col) px.p(c, x, y, col) end
local function B(r, l) return px.band(c, RR[r], l, 1, #RR[r]) end
local function H(a, b) return px.h(a, b) end
local LX, LY, LZ = -.55, -.66, .51
local function sh(nx, ny, nz) return math.max(0, LX * nx + LY * ny + LZ * nz) end
local function put(x, y, r, l) if l == nil then return end; if type(l) == 'string' then P(x, y, l) else P(x, y, B(r, l)) end end
-- an ellipsoid lit as a volume. o.mod(x,y,l,nx,ny) adjusts the light (or returns a colour name); o.rf(x,y) picks the ramp
local function blob(cx, cy, rx, ry, r, o) o = o or {}
  for y = math.floor(cy - ry), math.ceil(cy + ry) do for x = math.floor(cx - rx), math.ceil(cx + rx) do
    local nx, ny = (x + .5 - cx) / rx, (y + .5 - cy) / ry; local d = nx * nx + ny * ny
    if d <= 1 then local nz = math.sqrt(1 - d); local l = (o.amb or .16) + (o.k or .86) * sh(nx, ny, nz)
      if o.mod then l = o.mod(x, y, l, nx, ny) end
      put(x, y, o.rf and o.rf(x, y, nx, ny) or r, l) end end end
end
-- a cylinder along a line, w pixels thick, lit across its width. o.mod gets (x,y,l,t along 0..1,n across -1..1)
local function rod(x0, y0, x1, y1, w, r, o) o = o or {}
  local dx, dy = x1 - x0, y1 - y0; local len = math.max(.01, math.sqrt(dx * dx + dy * dy)); local ux, uy = dx / len, dy / len; local qx, qy = -uy, ux; local hw = w / 2
  for y = math.floor(math.min(y0, y1) - w), math.ceil(math.max(y0, y1) + w) do for x = math.floor(math.min(x0, x1) - w), math.ceil(math.max(x0, x1) + w) do
    local ax, ay = x + .5 - x0, y + .5 - y0; local t = ax * ux + ay * uy; local s = ax * qx + ay * qy
    if t >= -.3 and t <= len + .3 and math.abs(s) <= hw then local n = s / hw; local nz = math.sqrt(math.max(0, 1 - n * n))
      local l = (o.amb or .2) + (o.k or .8) * sh(qx * n, qy * n, nz)
      if o.mod then l = o.mod(x, y, l, t / len, n) end
      put(x, y, o.rf and o.rf(x, y, t / len, n) or r, l) end end end
end
local function poly(pts, r, lf) px.poly(c, pts, function(x, y) local l = type(lf) == 'function' and lf(x, y) or lf; if l == nil then return nil end
  if type(l) == 'string' then return l end; return B(r, l) end) end
local function rect(x0, y0, x1, y1, r, lf) for y = y0, y1 do for x = x0, x1 do put(x, y, r, type(lf) == 'function' and lf(x, y) or lf) end end end
local function line(x0, y0, x1, y1, col) px.line(c, x0, y0, x1, y1, col) end
-- an arc of a ring (for handles, rims): centre, radii, from a0 to a1, thickness, ramp, light
local function arc(cx, cy, rx, ry, a0, a1, w, r, l)
  for i = 0, 80 do local a = a0 + (a1 - a0) * i / 80; for k = 0, w - 1 do local x, y = cx + math.cos(a) * (rx - k), cy + math.sin(a) * (ry - k)
    put(x, y, r, type(l) == 'function' and l(a, k) or l) end end
end
-- a bowl seen from the front and a little above: rim, what's in it, the wooden or ceramic body
local function bowl(fill, rim, body)
  blob(16, 20, 12, 8.5, body or 'wd', {mod = function(x, y, l, nx, ny) if ny < -.1 then return nil end; return l end})
  blob(16, 18.6, 12, 4.2, rim or 'wd', {mod = function(x, y, l) return .62 end})
  blob(16, 18.6, 10.4, 3.2, 'wd', {mod = function(x, y, l, nx, ny) return fill(x, y, nx, ny) end})
  for x = 7, 25 do if (x % 5 == 0) then P(x, 26, B(body or 'wd', .2)) end end
end
local function steam(x, y) for k = 0, 2 do local sx = x + k * 4; for i = 0, 4 do P(sx + math.floor(math.sin(i * 1.3 + k) * 1.2 + .5), y - i, i % 2 == 0 and 'wh6' or 'wh5') end end end
local function sparkle(x, y, col) P(x, y, col); P(x - 1, y, col); P(x + 1, y, col); P(x, y - 1, col); P(x, y + 1, col) end

local I = {}
-- ------------------------------------------------------------------ tools (grey metal, green can, cane rod: the grade tints find them)
I.hoe = function()   -- the head at a right angle to the handle: a short neck, then the blade hanging back toward the grip
  local hx, hy, tx, ty = 5, 29, 21, 9; local L = math.sqrt((tx - hx) ^ 2 + (ty - hy) ^ 2); local dx, dy = (tx - hx) / L, (ty - hy) / L; local qx, qy = -dy, dx
  rod(hx, hy, tx, ty, 3, 'wd', {mod = function(x, y, l, t) return l - ((math.floor(t * 30) % 6 == 0) and .1 or 0) end})
  local nx, ny = tx + qx * 4, ty + qy * 4
  rod(tx - dx, ty - dy, nx, ny, 2.4, 'mt', {amb = .3})
  local a1, a2 = {nx - dx * .5, ny - dy * .5}, {nx + qx * 6 - dx * .5, ny + qy * 6 - dy * .5}
  local a3, a4 = {a2[1] - dx * 9, a2[2] - dy * 9}, {a1[1] - dx * 9, a1[2] - dy * 9}
  poly({a1, a2, a3, a4}, 'mt', function(x, y) local along = ((x - a1[1]) * -dx + (y - a1[2]) * -dy) / 9; local across = ((x - a1[1]) * qx + (y - a1[2]) * qy) / 6
    return .82 - along * .35 - across * .3 end)
  line(math.floor(a4[1] + .5), math.floor(a4[2] + .5), math.floor(a3[1] + .5), math.floor(a3[2] + .5), 'mt7')
  blob(tx, ty, 2.4, 2.4, 'mt', {amb = .3})
end
I.can = function()
  rod(19, 21, 28, 9, 2.6, 'cg')
  blob(28.5, 8, 2.4, 2.8, 'mt', {amb = .3}); P(30, 6, 'mt2'); P(30, 9, 'mt2'); P(29, 7, 'mt3')
  for y = 13, 27 do for x = 4, 22 do local u = (x - 13) / 9; if math.abs(u) <= 1 then local nz = math.sqrt(1 - u * u)
    local l = .18 + .8 * sh(u, 0, nz) - (y - 13) / 70; if y == 17 or y == 24 then l = l - .22 end; if y == 25 then l = l + .1 end; P(x, y, B('cg', l)) end end end
  blob(13, 13, 9, 2.6, 'cg', {mod = function() return .78 end}); blob(13, 13, 7, 1.6, 'ck', {amb = .05, k = .3})
  arc(13, 13, 7, 8, math.pi, 2 * math.pi, 2, 'cg', function(a, k) return k == 0 and .55 or .8 end)
end
I.pick = function()  -- the head crosses the handle at a right angle, its points curving back toward the grip
  local hx, hy, tx, ty = 7, 29, 17, 11; local L = math.sqrt((tx - hx) ^ 2 + (ty - hy) ^ 2); local dx, dy = (tx - hx) / L, (ty - hy) / L; local qx, qy = -dy, dx
  rod(hx, hy, tx, ty, 3, 'wd', {mod = function(x, y, l, t) return l - ((math.floor(t * 30) % 7 == 0) and .1 or 0) end})
  local cx, cy = tx + dx * 1.5, ty + dy * 1.5
  for i = 0, 120 do local t = -1 + 2 * i / 120; local bulge = (1 - t * t) * 3.2 - .8
    local x, y = cx + qx * t * 13 + dx * bulge, cy + qy * t * 13 + dy * bulge; local th = .5 + (1 - t * t) * 2
    for k = -math.ceil(th), math.ceil(th) do if math.abs(k) <= th then P(x + dx * k, y + dy * k, B('mt', .5 + (k / th) * .32)) end end end
  P(cx - qx * 13 - dx, cy - qy * 13 - dy, 'mt7'); P(cx + qx * 13 - dx, cy + qy * 13 - dy, 'mt6')
  blob(cx, cy, 2.6, 2.6, 'mt', {amb = .3})
end
I.axe = function()
  rod(8, 29, 18, 6, 3, 'wd', {mod = function(x, y, l, t) return l - ((math.floor(t * 30) % 6 == 0) and .1 or 0) end})
  poly({{15, 5}, {22, 4}, {27, 1}, {30, 5}, {30, 13}, {25, 12}, {20, 10}, {15, 9}}, 'mt', function(x, y) return .8 - (y - 1) / 13 * .5 + (x >= 28 and .14 or 0) end)
  line(29, 2, 30, 12, 'mt7'); line(25, 12, 30, 13, 'mt2')
  blob(16, 7, 2.6, 3, 'mt', {amb = .25})
end
I.rod = function()
  rod(4, 30, 28, 2, 2.2, 'wd', {mod = function(x, y, l, t) if math.floor(t * 34) % 6 == 0 then return l - .25 end; return l + .08 end})
  rod(4, 30, 9, 24, 2.8, 'ck', {amb = .2})
  blob(10.5, 22.5, 2.6, 2.6, 'mt', {amb = .3}); P(10, 22, 'mt2')
  for y = 3, 21 do P(29, y, (y % 3 == 0) and 'wh4' or 'wh5') end
  blob(29.5, 23, 1.8, 1.4, 'rd', {mod = function(x, y, l) return y >= 23 and nil or l end}); blob(29.5, 23.5, 1.8, 1.5, 'wh', {mod = function(x, y, l) return y < 24 and nil or l end})
end
-- ------------------------------------------------------------------ seeds
local function packet(band, art)
  for y = 6, 28 do for x = 8, 24 do local u = (x - 8) / 16; P(x, y, B('pp', .9 - u * .38 - (y > 26 and .12 or 0))) end end
  for x = 8, 24 do P(x, 5, (x % 2 == 0) and B('pp', .75) or B('pp', .55)); P(x, 8, B('pp', .5)) end
  for y = 22, 26 do for x = 9, 23 do P(x, y, B(band, .62 - (x - 9) / 36 - (y == 26 and .15 or 0))) end end
  for x = 11, 21, 2 do P(x, 24, B(band, .95)) end
  art()
  for y = 6, 28 do P(24, y, B('pp', .35)) end
end
I.seed_turnip = function() packet('pu', function()
  for _, lf in ipairs({{13, 9}, {16, 8}, {19, 9}}) do rod(16, 14, lf[1], lf[2] + 1, 1.8, 'gr') end
  blob(16, 17, 4.2, 4, 'wh', {rf = function(x, y) return y < 16 and 'pu' or 'wh' end}); P(16, 21, 'pu3') end) end
I.seed_pumpkin = function() packet('og', function()
  blob(16, 16, 5.5, 4.2, 'og', {mod = function(x, y, l, nx) return l - ((math.abs(nx * 2.2 % 1 - .5) > .38) and .18 or 0) end}); rod(16, 12, 17, 10, 1.6, 'gr') end) end
I.seed_corn = function() packet('yl', function()
  blob(16, 15.5, 3, 5.5, 'yl', {mod = function(x, y, l) return l + (((x + y) % 2 == 0) and .08 or -.04) end})
  poly({{12, 21}, {14, 13}, {16, 20}}, 'gr', .55); poly({{20, 21}, {18, 13}, {16, 20}}, 'gr', .35) end) end
I.seed = function()
  blob(16, 20, 10, 8.5, 'le', {mod = function(x, y, l) return l + ((H(x // 2, y // 2) > .8) and -.08 or 0) end})
  blob(16, 11.5, 5, 3, 'le', {mod = function(x, y, l) return l - .05 end}); rod(11, 13, 21, 13, 1.6, 'rd')
  for i = 0, 7 do local x, y = 9 + i * 2 + (i % 2), 26 + (i % 3); blob(x, y, 1.2, 1, 'yl', {amb = .3}) end
end
-- ------------------------------------------------------------------ produce
I.turnip = function()
  for _, lf in ipairs({{10, 3}, {16, 2}, {22, 4}}) do rod(16, 12, lf[1], lf[2], 3, 'gr', {mod = function(x, y, l, t) return l + t * .2 end}) end
  blob(16, 19, 8.5, 8, 'wh', {rf = function(x, y) return y < 17 + (x % 3) * .3 and 'pu' or 'wh' end})
  rod(16, 26, 17, 30, 1.6, 'wh'); P(13, 22, 'wh4'); P(19, 23, 'wh4')
end
I.pumpkin = function()
  blob(16, 18, 13, 10, 'og', {mod = function(x, y, l, nx) local r = math.abs(math.sin(nx * 4.2)); return l - (r < .25 and .2 or 0) end})
  rod(16, 10, 18, 5, 2.6, 'gr', {rf = function() return 'wd' end})
  arc(21, 7, 3, 2, math.pi * .9, math.pi * 2.1, 1, 'gr', .5)
end
I.corn = function()
  poly({{6, 27}, {9, 18}, {14, 22}}, 'gr', .45); poly({{6, 27}, {15, 25}, {13, 19}}, 'gr', .7)
  for i = 0, 50 do local t = i / 50; local cx, cy = 9 + t * 16, 24 - t * 18; local w = 4.2 * math.sin(math.min(1, t * 1.3 + .1) * math.pi * .9 + .15)
    for k = -5, 5 do if math.abs(k) <= w then local x, y = cx + k * .78, cy + k * .62; local kern = ((math.floor(t * 18) + k) % 2 == 0)
      P(x, y, B('yl', .78 - (k + w) / (2 * w + .01) * .55 + (kern and .08 or -.05))) end end end
  poly({{8, 28}, {12, 15}, {16, 25}}, 'gr', .55); poly({{8, 28}, {18, 24}, {15, 20}}, 'gr', .3)
  rod(6, 30, 8, 27, 2.4, 'gr')
end
local function fishbody(cx, cy)
  poly({{cx - 13, cy - 5}, {cx - 13, cy + 5}, {cx - 8, cy}}, 'fs', .4)
  blob(cx, cy, 10, 5.5, 'fs', {mod = function(x, y, l, nx, ny) local v = l + (ny > .25 and .25 or 0) - (ny < -.45 and .15 or 0); if ((x + y * 2) % 5 == 0) and ny > -.3 and ny < .4 then v = v - .08 end; return v end})
  poly({{cx - 3, cy - 5}, {cx + 2, cy - 9}, {cx + 4, cy - 5}}, 'fs', .45)
  P(cx + 6, cy - 1, 'ck1'); P(cx + 6, cy - 2, 'wh7'); line(cx + 3, cy - 3, cx + 3, cy + 2, B('fs', .3))
end
I.fish = function() fishbody(18, 17) end
I.egg = function() blob(16, 17, 8, 10.5, 'pp', {amb = .25, mod = function(x, y, l) return l + .1 end}) end
I.mushroom = function()
  blob(16, 13, 14, 9, 'cy', {amb = 0, k = 0, mod = function(x, y, l, nx, ny) return (nx * nx + ny * ny > .72) and 'cy2' or 'cy3' end})
  rod(16, 15, 15, 28, 5, 'wh')
  blob(16, 12, 11, 7, 'cy', {mod = function(x, y, l, nx, ny) if ny > .55 then return .25 end; local s = H(math.floor((nx + 1) * 3), math.floor((ny + 1) * 3)); return l + ((s > .7) and .3 or 0) end})
end
-- ------------------------------------------------------------------ materials
I.wood = function()
  rod(4, 20, 26, 12, 9, 'wd', {rf = function() return 'wd' end, mod = function(x, y, l, t) return l - ((math.floor(t * 40 + y) % 9 == 0) and .14 or 0) end})
  blob(26, 12, 3.6, 4.6, 'pp', {mod = function(x, y, l, nx, ny) local r = math.sqrt(nx * nx + ny * ny); return .55 + ((math.floor(r * 4) % 2 == 0) and .15 or -.05) end})
  rod(7, 27, 24, 22, 6, 'wd', {mod = function(x, y, l, t) return l - .08 end})
  blob(24, 22, 2.4, 3.1, 'pp', {mod = function(x, y, l, nx, ny) local r = math.sqrt(nx * nx + ny * ny); return .5 + ((math.floor(r * 3) % 2 == 0) and .15 or -.05) end})
end
local function rock(seed, r, extra)
  local pts = {{4, 26}, {3, 19}, {7, 11}, {13, 7}, {20, 6}, {26, 10}, {29, 17}, {28, 26}}
  for i, q in ipairs(pts) do q[1] = q[1] + math.floor((H(i, seed) - .5) * 3); q[2] = q[2] + math.floor((H(i, seed + 1) - .5) * 3) end
  -- facets: a lit top plane, a front plane, a shaded right flank, split along a few creases
  poly(pts, r, function(x, y) local top = y < 13 + (x - 16) * .2 + math.sin(x * .7 + seed) * 1.2; local right = x > 21 + (y - 16) * .3
    local l = top and .85 or (right and .28 or .55); if not top and not right and x < 10 then l = .66 end
    if math.abs(y - (13 + (x - 16) * .2 + math.sin(x * .7 + seed) * 1.2)) < .7 then l = top and 1 or .4 end
    if y > 23 then l = l - .12 end; return l + (H(x // 4, y // 3 + seed) > .85 and -.1 or 0) end)
  line(4, 27, 28, 27, B(r, .1))
  if extra then extra() end
end
I.stone = function() rock(3, 'st') end
local function nugget(x, y, r, s) poly({{x - 3 * s, y + 1}, {x - 1, y - 2 * s}, {x + 2 * s, y - 1}, {x + 3 * s, y + 2}, {x, y + 2 * s}}, r, function(xx, yy) return (yy < y) and .92 or (xx > x and .4 or .65) end) end
I.copper = function() rock(5, 'st', function() for _, q in ipairs({{11, 15, 1}, {19, 11, .8}, {21, 20, 1.1}, {13, 22, .8}}) do nugget(q[1], q[2], 'cu', q[3]) end end) end
I.iron = function() rock(7, 'st', function() for _, q in ipairs({{12, 16, 1}, {20, 12, .8}, {21, 21, 1}, {13, 23, .7}}) do nugget(q[1], q[2], 'rs', q[3]); P(q[1] - 1, q[2] - 1, 'mt7') end end) end
I.coal = function()
  for _, q in ipairs({{11, 20, 7, 6}, {21, 21, 6.5, 5.5}, {16, 13, 6.5, 5.5}}) do
    blob(q[1], q[2], q[3], q[4], 'ck', {mod = function(x, y, l, nx, ny) return l + ((math.abs(nx - ny) < .12) and .25 or 0) end}) end
  P(14, 10, 'bl6'); P(9, 17, 'bl6'); P(19, 18, 'bl5')
end
I.gem = function()
  poly({{9, 9}, {12, 5}, {14, 14}, {11, 27}, {7, 24}}, 'cy', function(x, y) return x < 10 and .7 or .4 end)
  poly({{20, 10}, {24, 7}, {26, 22}, {22, 27}, {19, 20}}, 'cy', function(x, y) return x < 22 and .55 or .25 end)
  poly({{16, 2}, {21, 8}, {20, 28}, {12, 28}, {11, 8}}, 'cy', function(x, y) if x < 13 then return .95 elseif x < 16 then return .78 elseif x < 19 then return .55 end; return .32 end)
  line(16, 2, 16, 28, 'cy7'); line(11, 8, 21, 8, 'cy6'); P(13, 6, 'wh7'); P(13, 5, 'wh7'); P(14, 11, 'wh7')
  for y = 18, 26 do P(15, y, 'cy3') end
end
local function ingot(r)
  poly({{6, 13}, {24, 13}, {28, 18}, {10, 18}}, r, .9)
  rect(10, 19, 28, 25, r, function(x, y) return .55 - (y - 19) / 20 end)
  poly({{6, 13}, {10, 18}, {10, 25}, {6, 20}}, r, .3)
  line(10, 18, 28, 18, B(r, 1)); for x = 13, 25, 4 do P(x, 15, B(r, 1)) end
end
I.cbar = function() ingot('cu') end
I.ibar = function() ingot('mt') end
I.bonemeal = function()
  blob(15, 19, 11, 10, 'pp', {mod = function(x, y, l, nx, ny) if ny < -.6 then return nil end; return l - ((H(x // 2, y // 2) > .82) and .1 or 0) end})
  blob(15, 13, 8, 3, 'wh', {amb = .45}); for i = 0, 6 do P(7 + i * 3, 12 + (i % 3), 'wh7') end
  rod(18, 27, 28, 21, 2.6, 'wh'); blob(28, 20.5, 2, 2, 'wh'); blob(29, 22.5, 2, 2, 'wh'); blob(17.5, 26.5, 2, 2, 'wh'); blob(18.5, 28.5, 2, 2, 'wh')
end
I.bait = function()
  for y = 13, 27 do for x = 7, 25 do local u = (x - 16) / 9; local nz = math.sqrt(math.max(0, 1 - u * u)); P(x, y, B('mt', .2 + .75 * sh(u, 0, nz) - ((y - 13) % 4 == 0 and .15 or 0))) end end
  blob(16, 13, 9, 2.6, 'mt', {mod = function() return .7 end}); blob(16, 13, 7.5, 1.8, 'le', {amb = .2})
  for _, w in ipairs({{12, 12, 9, 6}, {18, 12, 22, 7}, {15, 12, 16, 5}}) do rod(w[1], w[2], w[3], w[4], 2, 'pk', {mod = function(x, y, l, t) return l + ((math.floor(t * 6) % 2 == 0) and .08 or 0) end}) end
  rect(10, 18, 22, 22, 'rd', function(x, y) return .6 - (x - 10) / 30 end); for x = 12, 20, 2 do P(x, 20, 'wh7') end
end
I.milk = function()
  for y = 9, 29 do local w = (y < 13) and (3 + (y - 9)) or 7; for x = 16 - w, 16 + w do local u = (x - 16) / (w + .5); local nz = math.sqrt(math.max(0, 1 - u * u))
    P(x, y, (y < 13) and B('wh', .3 + .7 * sh(u, 0, nz) - .25) or B('wh', .35 + .65 * sh(u, 0, nz))) end end
  rect(13, 5, 19, 8, 'rd', function(x, y) return .7 - (x - 13) / 12 end); line(13, 8, 19, 8, 'rd2')
  rect(10, 17, 22, 23, 'bl', function(x, y) return .55 - (x - 10) / 40 end); for x = 12, 20, 3 do P(x, 20, 'wh7') end
  rect(11, 13, 12, 27, 'wh', 1)
end
I.fiber = function()
  for i = 0, 8 do local x0 = 9 + i * 1.6; rod(x0, 29, x0 + (i - 4) * 1.4, 4 + (i % 3) * 2, 1.8, (i % 3 == 0) and 'pp' or 'gr', {mod = function(x, y, l, t) return l + t * .25 end}) end
  rect(10, 17, 23, 20, 'le', function(x, y) return .7 - (y - 17) * .12 end)
end
I.hay = function()
  rect(3, 12, 28, 27, 'yl', function(x, y) return .7 - (x - 3) / 70 - (y - 12) / 60 + ((H(x, y // 2) > .7) and .1 or 0) - (((x + y) % 5 == 0) and .08 or 0) end)
  poly({{3, 12}, {7, 7}, {31, 7}, {28, 12}}, 'yl', function(x, y) return .9 + ((H(x // 2, y) > .7) and -.15 or 0) end)
  poly({{28, 12}, {31, 7}, {31, 22}, {28, 27}}, 'yl', .3)
  for _, x in ipairs({10, 20}) do rect(x, 12, x + 1, 27, 'le', .55); line(x + 3, 7, x + 4, 7, 'le4') end
end
I.lumber = function()
  for k = 0, 3 do local y = 23 - k * 5; local x = 3 + (k % 2) * 2
    rect(x, y, x + 24, y + 3, 'wd', function(xx, yy) return .72 - (yy - y) * .14 - ((xx + k * 3) % 11 == 0 and .12 or 0) end)
    rect(x + 25, y, x + 26, y + 3, 'pp', .55) end
end
-- ------------------------------------------------------------------ food
I.bread = function()
  blob(16, 18, 13, 9, 'og', {mod = function(x, y, l, nx, ny) if ny > .55 then return l * .6 end; return l + ((math.abs((nx * 3 + ny) % 1 - .5) < .07 and ny < .2) and .3 or 0) end})
  blob(16, 15, 11, 5, 'yl', {amb = .3, mod = function(x, y, l, nx, ny) return l - .12 end})
end
I.stew = function() bowl(function(x, y, nx, ny) local b = H(x // 2, y); if b > .8 then return 'og5' elseif b > .65 then return 'gr5' end; return .3 + (nx < 0 and .1 or 0) end, 'wd', 'wd'); steam(10, 10) end
I.soup = function() bowl(function(x, y, nx, ny) local b = H(x, y); if b > .86 then return 'gr6' elseif b > .8 then return 'pu5' end; return 'pp' .. (nx < -.2 and 6 or 5) end, 'pp', 'pp'); steam(10, 10) end
I.chowder = function() bowl(function(x, y, nx, ny) if H(x, y) > .75 then return 'yl6' end; return 'pp' .. (nx < 0 and 7 or 6) end, 'bl', 'bl'); steam(11, 10) end
I.glowstew = function()
  bowl(function(x, y, nx, ny) if H(x, y) > .8 then return 'wh6' end; return 'cy' .. (nx < -.2 and 7 or 6) end, 'ck', 'ck'); sparkle(10, 8, 'cy7'); sparkle(22, 6, 'cy6')
end
I.egg_fried = function()
  blob(16, 18, 13, 8, 'wh', {amb = .5, mod = function(x, y, l, nx, ny) if (nx * nx + ny * ny) > .7 + H(math.floor(math.atan(ny, nx) * 3), 1) * .3 then return nil end; return l end})
  blob(17, 17, 5, 4, 'yl', {amb = .3})
end
I.pie = function()
  blob(16, 21, 14, 8, 'mt', {mod = function(x, y, l, nx, ny) if ny < 0 then return nil end; return .35 + (nx < 0 and .2 or 0) end})
  blob(16, 18, 14, 9, 'og', {mod = function(x, y, l, nx, ny) local r = nx * nx + ny * ny; if r > .72 then return 'wd' .. ((ny < 0) and 6 or 4) end; return .5 + (nx < -.3 and .12 or 0) end})
  for a = 0, 11 do local an = a / 12 * math.pi * 2; P(16 + math.cos(an) * 12.2, 18 + math.sin(an) * 7.6, 'wd7') end
  blob(14, 16, 2, 1.2, 'wh', {amb = .8})
end
I.hash = function()
  rod(22, 22, 30, 28, 2.8, 'ck')
  blob(14, 18, 12, 8, 'ck', {mod = function(x, y, l, nx, ny) return l * .8 end})
  blob(14, 17, 10, 6, 'og', {mod = function(x, y, l, nx, ny) local h = H(x // 2, y // 2); if h > .72 then return 'yl5' elseif h < .2 then return 'wd3' end; return .45 + h * .3 end})
  steam(8, 9)
end
I.fish_fried = function()
  blob(16, 20, 14, 8, 'wh', {amb = .45, mod = function(x, y, l) return l end}); blob(16, 19.5, 11.5, 6, 'wh', {amb = .6})
  blob(15, 18, 9, 4, 'og', {mod = function(x, y, l, nx, ny) return l + ((((x + y) % 4) == 0) and .15 or 0) end})
  poly({{6, 15}, {6, 21}, {9, 18}}, 'og', .45)
  blob(25, 16, 3, 2.4, 'yl', {amb = .35}); P(24, 15, 'yl7')
end
-- ------------------------------------------------------------------ found and made things
I.it_bouquet = function()  -- late asters, goldenrod and one red maple leaf, tied with twine
  for i = 0, 6 do rod(16, 29, 8 + i * 2.6, 8 + (i % 2) * 3, 1.4, 'gr') end
  for i = 0, 5 do local x, y = 18 + i, 4 + i * 1.5; for k = 0, 2 do P(x + k, y + (k % 2), 'yl' .. (6 - k % 2)) end end     -- goldenrod sprays
  for i = 0, 3 do local x, y = 20 + i * 1.5, 3 + i * 2; P(x, y, 'yl7'); P(x + 1, y + 1, 'yl5') end
  for _, q in ipairs({{9, 9}, {13, 6}, {11, 13}, {16, 10}}) do for k = 0, 7 do local a = k / 8 * math.pi * 2; P(q[1] + math.cos(a) * 2.3, q[2] + math.sin(a) * 2.3, k < 4 and 'pu6' or 'pu5') end; P(q[1], q[2], 'yl6') end
  poly({{23, 14}, {26, 11}, {26, 14}, {29, 13}, {27, 16}, {29, 18}, {25, 17}, {24, 20}, {22, 17}, {19, 18}, {21, 15}}, 'rd', function(x, y) return x < 24 and .8 or .55 end)
  line(24, 20, 21, 25, 'wd3')
  for y = 21, 23 do rect(13, y, 19, y, 'pp', y == 22 and .4 or .7) end; P(12, 24, 'pp4'); P(20, 24, 'pp4'); P(11, 25, 'pp4')
end
I.it_candy_apple = function()
  rod(16, 13, 17, 2, 1.8, 'wd')
  blob(16, 20, 10, 9, 'rd', {mod = function(x, y, l, nx, ny) return l + (ny > .6 and -.15 or 0) end})
  blob(12, 16, 2.2, 3, 'wh', {amb = .9, k = 0}); P(11, 15, 'wh7')
  for x = 7, 25 do if H(x, 4) > .45 then P(x, 27 + (x % 2), 'rd3') end end
end
I.it_ring = function()   -- an old iron ring with a red stone
  for i = 0, 140 do local a = i / 140 * math.pi * 2; for k = 0, 2 do local x, y = 16 + math.cos(a) * (10 - k), 20 + math.sin(a) * (7 - k * .7)
    P(x, y, B('mt', .25 + .7 * sh(math.cos(a), math.sin(a), .5) - k * .12)) end end
  rect(12, 10, 20, 14, 'mt', function(x, y) return y == 10 and .8 or .45 end)
  blob(16, 9, 4, 3.6, 'rd', {amb = .25, mod = function(x, y, l) return l + .1 end}); P(15, 8, 'rd7'); P(14, 7, 'wh7')
end
I.it_chicory = function()
  for i = 0, 2 do rod(16, 30, 9 + i * 7, 9 + (i % 2) * 4, 1.4, 'gr') end
  for _, q in ipairs({{9, 9}, {16, 13}, {23, 9}}) do for k = 0, 7 do local a = k / 8 * math.pi * 2; rod(q[1], q[2], q[1] + math.cos(a) * 4.2, q[2] + math.sin(a) * 4.2, 1.6, 'bl', {amb = .45}) end
    P(q[1], q[2], 'wh7') end
end
I.it_rosehip = function()
  rod(4, 26, 28, 10, 1.8, 'wd')
  for _, q in ipairs({{10, 17}, {17, 19}, {22, 11}, {14, 11}}) do blob(q[1], q[2] + 1, 3.4, 4, 'rd', {amb = .25}); P(q[1], q[2] - 3, 'ck2'); P(q[1] - 1, q[2] - 3, 'ck2') end
  poly({{24, 15}, {29, 17}, {25, 20}}, 'gr', .55)
end
I.it_cranberry = function()
  poly({{4, 14}, {12, 9}, {13, 14}}, 'gr', .6)
  for _, q in ipairs({{9, 22}, {15, 24}, {21, 23}, {12, 17}, {18, 18}, {24, 18}, {15, 12}}) do blob(q[1], q[2], 3.6, 3.4, 'rd', {amb = .2, mod = function(x, y, l) return l - .05 end}); P(q[1] - 1, q[2] - 2, 'rd7') end
end
I.it_ghostcorn = function()
  poly({{6, 27}, {9, 18}, {14, 22}}, 'st', .55)
  for i = 0, 50 do local t = i / 50; local cx, cy = 9 + t * 16, 24 - t * 18; local w = 4.2 * math.sin(math.min(1, t * 1.3 + .1) * math.pi * .9 + .15)
    for k = -5, 5 do if math.abs(k) <= w then P(cx + k * .78, cy + k * .62, B('wh', .82 - (k + w) / (2 * w + .01) * .5 + (((math.floor(t * 18) + k) % 2 == 0) and .06 or -.04))) end end end
  poly({{8, 28}, {12, 15}, {16, 25}}, 'st', .6); poly({{8, 28}, {18, 24}, {15, 20}}, 'st', .38)
  P(17, 12, 'cy6'); P(21, 9, 'cy6')
end
I.it_pearl = function()
  blob(16, 21, 13, 7, 'pp', {mod = function(x, y, l, nx, ny) if ny < -.2 then return nil end; return l - ((math.floor((nx + 1) * 5) % 2 == 0) and .1 or 0) end})
  blob(16, 16, 6.5, 6.5, 'wh', {amb = .3, mod = function(x, y, l, nx, ny) if nx < -.1 and ny > .2 then return 'pu6' end; return l end}); P(13, 13, 'wh7'); P(14, 13, 'wh7')
end
I.it_resin = function()
  blob(16, 19, 10, 10, 'og', {amb = .4, mod = function(x, y, l, nx, ny) if ny < -.35 and math.abs(nx) > .45 + (-.35 - ny) then return nil end; return l + .1 end})
  poly({{12, 11}, {16, 2}, {20, 11}}, 'og', .7); blob(12, 15, 2, 3.2, 'yl', {amb = .9, k = 0}); P(19, 24, 'og2'); P(20, 23, 'og2')
end
I.it_coin = function()
  blob(17, 17, 11, 11, 'br', {mod = function(x, y, l) return l * .6 end})
  blob(15.5, 16, 11, 11, 'br', {mod = function(x, y, l, nx, ny) local r = math.sqrt(nx * nx + ny * ny); if r > .8 then return l + .1 end; if r > .72 then return .2 end
    if math.abs(nx) < .12 and ny > -.5 and ny < .5 then return .2 end; if math.abs(ny + .25) < .1 and math.abs(nx) < .4 then return .2 end; return l end})
end
I.it_chaga = function()
  blob(16, 17, 12, 9, 'ck', {mod = function(x, y, l, nx, ny) local f = H(x // 3, y // 3); if nx > .2 and ny < .1 then return 'og' .. (f > .5 and 5 or 4) end; return l + (f > .7 and .18 or 0) end})
  for x = 6, 26, 3 do P(x, 25, 'wh5') end
end
I.it_sprinkler = function()
  for y = 15, 28 do for x = 9, 23 do local u = (x - 16) / 7; local nz = math.sqrt(math.max(0, 1 - u * u)); P(x, y, B('br', .2 + .78 * sh(u, 0, nz) - ((y == 18 or y == 25) and .2 or 0))) end end
  blob(16, 15, 7, 2.2, 'br', {mod = function() return .8 end}); rect(15, 8, 17, 14, 'br', .6); rect(9, 7, 23, 8, 'cu', function(x) return .8 - (x - 9) / 30 end); blob(16, 7, 2.5, 1.6, 'br', {amb = .4})
  for k = 0, 4 do P(4 + k, 5 - k % 2, 'bl6'); P(27 - k, 5 - k % 2, 'bl6'); P(6 + k * 5, 2, 'wh7') end
end
I.it_flask = function()
  poly({{9, 29}, {23, 29}, {23, 16}, {19, 12}, {19, 8}, {13, 8}, {13, 12}, {9, 16}}, 'wh', function(x, y) if y > 17 then return B('yl', .4 + (x < 13 and .4 or (x > 20 and -.1 or .15))) end; return x < 12 and .9 or .6 end)
  rect(13, 3, 19, 7, 'wd', function(x) return .8 - (x - 13) / 12 end); rect(11, 20, 21, 25, 'pp', .85); line(12, 22, 20, 22, 'wd2'); P(10, 17, 'wh7'); line(10, 18, 10, 28, 'wh7')
end
I.it_club = function()
  for s = 0, 1, .03 do local x, y = 6 + s * 20, 27 - s * 21; blob(x, y, 1.6 + s * s * 3.8, 1.6 + s * s * 3.8, 'wd', {amb = .2}) end
  for k = 0, 3 do rod(5 + k * 1.2, 26 - k * 1.2, 7 + k * 1.2, 28 - k * 1.2, 1.4, 'le', {amb = .3}) end
  P(22, 8, 'wd2'); P(24, 11, 'wd2'); P(21, 11, 'wd2')
end
I.it_sickle = function()
  for i = 0, 80 do local a = math.pi * .95 + i / 80 * math.pi * 1.2; local u = i / 80; local th = math.max(1, math.floor(4.5 * (1 - u) ^ .7 + .5))
    for k = 0, th - 1 do P(18 + math.cos(a) * (11 - k), 14 + math.sin(a) * (10 - k), B('mt', k == th - 1 and .95 or (k == 0 and .3 or .62))) end end
  rod(6, 15, 4, 29, 3, 'wd'); blob(6, 14, 2.4, 2, 'br', {amb = .3})
end
I.it_machete = function()
  poly({{7, 24}, {25, 5}, {29, 3}, {28, 8}, {11, 27}}, 'mt', function(x, y) return ((x - y) > 4) and .4 or .85 end)
  line(25, 5, 29, 3, 'mt7'); rod(3, 30, 8, 25, 3.2, 'wd'); blob(9, 24, 2.2, 2.2, 'br', {amb = .3})
end
local function garment(r, extra)
  poly({{9, 5}, {13, 3}, {19, 3}, {23, 5}, {28, 13}, {25, 16}, {23, 12}, {23, 29}, {9, 29}, {9, 12}, {7, 16}, {4, 13}}, r, function(x, y) return .78 - (x - 4) / 34 - (y - 3) / 60 + ((H(x, y) > .9) and -.08 or 0) end)
  poly({{13, 3}, {16, 8}, {19, 3}}, r, .2); line(16, 8, 16, 29, B(r, .25)); if extra then extra() end
end
I.it_jacket = function() garment('st', function() for i = 0, 3 do P(18, 11 + i * 4, 'br6') end; rect(10, 20, 13, 22, 'st', .35); rect(19, 20, 22, 22, 'st', .3) end) end
I.it_coat = function() garment('le', function() for i = 0, 4 do P(14, 10 + i * 4, 'br6'); P(18, 10 + i * 4, 'br6') end end) end
I.it_mail = function() garment('mt', function() for y = 5, 28 do for x = 5, 27 do if px.get(c, x, y) ~= 0 and ((x + (y // 2) % 2 * 2) % 4 == 0 or y % 2 == 0) and px.get(c, x, y) ~= px.i(c, 'OUT') then
  local v = px.get(c, x, y); if v ~= px.i(c, 'mt2') then P(x, y, 'mt3') end end end end end) end
-- ------------------------------------------------------------------ furniture (as you'd see it in a catalogue: whole, filling the square)
I.in_rockS = function()
  arc(16, 28, 14, 3, math.pi, math.pi * 2, 2, 'wd', .55)
  for _, x in ipairs({8, 23}) do rod(x, 6, x, 27, 2.4, 'wd') end
  for y = 7, 17, 3 do rod(8, y, 23, y, 1.8, 'wd', {amb = .3}) end
  rect(7, 18, 24, 21, 'wd', function(x, y) return .78 - (y - 18) * .15 end); rect(9, 15, 22, 18, 'rd', .55)
  for _, x in ipairs({9, 22}) do rod(x, 21, x, 27, 2, 'wd') end
end
I.in_oillamp = function()
  blob(16, 26, 8, 3, 'br', {amb = .3}); rod(16, 25, 16, 20, 4, 'br')
  blob(16, 17, 6, 5, 'br', {mod = function(x, y, l) return l + .05 end})
  for y = 4, 12 do local w = 4 - math.abs(y - 8) * .45; for x = 16 - w, 16 + w do P(x, y, B('wh', .8 + ((x < 15) and .2 or 0))) end end
  blob(16, 9, 1.4, 2.4, 'og', {amb = .9, k = 0}); P(16, 8, 'yl7'); rect(13, 3, 19, 3, 'mt', .5)
end
local function shelf(stock)
  rect(5, 3, 26, 29, 'wd', function(x, y) return (x < 7) and .75 or (x > 24 and .3 or .45) end); rect(7, 5, 24, 28, 'wd', .2)
  for _, y in ipairs({11, 19, 27}) do rect(6, y, 25, y + 1, 'wd', function(x, yy) return yy == y and .8 or .45 end) end
  stock()
end
I.in_shelf_jars = function() shelf(function()
  for row, y in ipairs({10, 18, 26}) do for i = 0, 3 do local x = 9 + i * 4; local r = ({'og', 'gr', 'rd', 'yl'})[(i + row) % 4 + 1]
    rect(x, y - 4, x + 2, y, r, function(xx) return xx == x and .8 or .5 end); rect(x, y - 5, x + 2, y - 5, 'pp', .7) end end end) end
I.in_shelf_books = function() shelf(function()
  for row, y in ipairs({10, 18, 26}) do local x = 8; local i = 0; while x < 23 do local w = 1 + (H(i, row) > .5 and 1 or 0); local hgt = 4 + math.floor(H(i, row + 3) * 2)
    local r = ({'rd', 'bl', 'gr', 'og', 'le', 'pu'})[math.floor(H(i, row + 5) * 6) + 1]; rect(x, y - hgt, x + w, y, r, function(xx) return xx == x and .75 or .45 end); x = x + w + 1; i = i + 1 end end end) end
I.in_rug = function()
  for k = 0, 6 do blob(16, 17, 15 - k * 2, 9 - k * 1.2, ({'rd', 'og', 'pp', 'rd', 'gr', 'og', 'pp'})[k + 1], {amb = .45, k = .4, mod = function(x, y, l) return l + (((x + y) % 3 == 0) and .08 or 0) end}) end
end
I.jack_b = function()
  blob(16, 18, 13, 10, 'og', {mod = function(x, y, l, nx) return l - ((math.abs(math.sin(nx * 4.2)) < .25) and .2 or 0) end})
  rod(16, 9, 18, 4, 2.6, 'wd')
  for _, e in ipairs({{10, 15}, {22, 15}}) do poly({{e[1] - 3, e[2] + 2}, {e[1], e[2] - 2}, {e[1] + 3, e[2] + 2}}, 'yl', function(x, y) return y > e[2] and 'yl7' or 'yl5' end) end
  poly({{8, 21}, {24, 21}, {21, 25}, {18, 23}, {16, 25}, {14, 23}, {11, 25}}, 'yl', function(x, y) return y < 23 and 'yl7' or 'og6' end)
end
I.in_crates = function()
  local function crate(x0, y0, w, h) rect(x0, y0, x0 + w, y0 + h, 'wd', function(x, y) local e = (x == x0 or y == y0 or x == x0 + w or y == y0 + h); return e and .8 or (.48 - (x - x0) / 60 + (((y - y0) % 4 == 0) and -.12 or 0)) end)
    line(x0 + 1, y0 + h - 1, x0 + w - 1, y0 + 1, B('wd', .8)) end
  crate(3, 14, 14, 14); crate(16, 16, 13, 12); crate(8, 3, 13, 11)
end
I.in_desk = function()
  rect(3, 10, 28, 13, 'wd', function(x, y) return y == 10 and .9 or .7 end); rect(3, 14, 12, 28, 'wd', function(x, y) return .5 - (x - 3) / 40 + ((y == 19 or y == 24) and -.2 or 0) end)
  rect(24, 14, 27, 28, 'wd', .35); P(8, 16, 'br6'); P(8, 21, 'br6'); P(8, 26, 'br6')
  rect(16, 5, 23, 9, 'pp', .85); rod(24, 9, 27, 3, 1.4, 'wh'); blob(6, 8, 1.8, 2, 'ck', {amb = .3})
end
I.in_clock = function()
  rect(10, 2, 22, 30, 'wd', function(x, y) return x < 12 and .75 or (x > 20 and .3 or .5) end); poly({{9, 4}, {16, 0}, {23, 4}}, 'wd', .7)
  blob(16, 9, 5, 5, 'pp', {amb = .55}); line(16, 9, 16, 6, 'ck1'); line(16, 9, 18, 10, 'ck1')
  rect(13, 16, 19, 27, 'ck', .2); rod(16, 16, 16, 23, 1, 'br'); blob(16, 24, 2, 2, 'br', {amb = .4})
end
I.in_table = function()
  poly({{4, 10}, {28, 10}, {30, 16}, {2, 16}}, 'wd', function(x, y) return .85 - (y - 10) / 30 end); rect(2, 17, 30, 19, 'wd', .4)
  for _, x in ipairs({4, 27}) do rod(x, 19, x, 29, 2.4, 'wd') end; rod(16, 19, 16, 26, 2, 'wd', {amb = .1})
  blob(11, 12, 3, 1.3, 'wh', {amb = .6}); rect(20, 9, 21, 12, 'pp', .8); P(20, 8, 'yl7')
end
I.in_chess = function()
  poly({{5, 12}, {27, 12}, {29, 18}, {3, 18}}, 'wd', .6)
  for y = 12, 17 do for x = 5, 27 do local u = math.floor((x - 5 + (y - 12) * .3) / 3); if (u + math.floor((y - 12) / 1.5)) % 2 == 0 then P(x, y, 'pp6') end end end
  rect(3, 19, 29, 20, 'wd', .4); rod(16, 21, 16, 29, 3, 'wd'); rect(10, 28, 22, 29, 'wd', .3)
  for _, q in ipairs({{9, 11, 'wh'}, {13, 10, 'ck'}, {20, 11, 'wh'}, {24, 10, 'ck'}}) do rod(q[1], q[2], q[1], q[2] - 4, 2, q[3], {amb = .4}) end
end
I.in_piano = function()
  rect(3, 4, 28, 28, 'ck', function(x, y) return x < 6 and .55 or (x > 25 and .2 or .35) end); rect(3, 3, 28, 4, 'ck', .6)
  rect(4, 15, 27, 18, 'wh', function(x, y) return y == 15 and 1 or .8 end); for x = 5, 26, 2 do rect(x, 15, x, 16, 'ck', .1) end
  rect(5, 19, 26, 20, 'ck', .5); rect(8, 6, 23, 11, 'wd', .5); for _, x in ipairs({5, 26}) do rect(x, 21, x + 1, 28, 'ck', .3) end
  blob(10, 3, 1.8, 1.4, 'yl', {amb = .6})
end
I.in_globe = function()
  rect(10, 28, 22, 29, 'wd', .4); rod(16, 27, 16, 20, 2.4, 'wd')
  arc(16, 12, 10, 10, math.pi * .45, math.pi * 1.6, 2, 'br', .6)
  blob(16, 12, 8, 8, 'bl', {mod = function(x, y, l, nx, ny) local land = H(math.floor((nx + 1) * 3.5), math.floor((ny + 1) * 3.5)) > .55; return land and B('gr', l) or l end})
end
I.in_candles = function()
  rect(10, 27, 22, 29, 'br', .5); rod(16, 27, 16, 15, 2.4, 'br')
  arc(16, 15, 9, 5, 0, math.pi, 2, 'br', .55)
  for _, x in ipairs({7, 16, 25}) do rect(x - 1, 8 - (x == 16 and 2 or 0), x + 1, 14 - (x == 16 and 2 or 0), 'wh', function(xx) return xx == x - 1 and .95 or .7 end)
    local fy = 5 - (x == 16 and 2 or 0); blob(x, fy, 1.4, 2.3, 'yl', {amb = .8, k = 0}); P(x, fy + 1, 'og5') end
end
I.in_keg = function()
  rect(3, 26, 29, 29, 'wd', .3); for _, x in ipairs({6, 25}) do rect(x, 22, x + 1, 26, 'wd', .4) end
  blob(16, 15, 13, 9, 'wd', {mod = function(x, y, l, nx) return l - ((math.abs(nx) > .55 and math.abs(nx) < .63) and .3 or 0) - (((x * 3) % 7 == 0) and .06 or 0) end})
  blob(16, 15, 4, 4, 'wd', {mod = function(x, y, l) return l * .7 end}); rod(18, 22, 18, 25, 2, 'br')
end
I.in_cradle = function()
  arc(16, 22, 14, 4, 0, math.pi, 2, 'wd', .55)
  blob(16, 15, 12, 7, 'wd', {mod = function(x, y, l, nx, ny) if ny < -.3 then return nil end; return l - ((math.floor((nx + 1) * 6) % 2 == 0) and .1 or 0) end})
  blob(16, 13, 10, 3, 'pp', {amb = .6}); blob(10, 12, 3, 2, 'wh', {amb = .6}); rect(4, 8, 5, 14, 'wd', .7); rect(27, 8, 28, 14, 'wd', .4)
end

local names = {}; for k in pairs(I) do names[#names + 1] = k end; table.sort(names)
for _, name in ipairs(names) do
  if not only or only == name then
    c = px.new(32, 32, PAL)
    I[name]()
    px.outline(c, px.i(c, 'OUT'))
    c.weather = {patch = 0, grime = 0, round = 0}
    px.save(c, app.fs.joinPath(out, 'icon32_' .. name .. '.png'))
    print(string.format('META icon32_%s 32 32 16.0 32 1.00 - -', name))
  end
end
