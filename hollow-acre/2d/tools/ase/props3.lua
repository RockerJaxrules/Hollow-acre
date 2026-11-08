-- The last of the old props, redrawn with bkit.lua's palette: the abandoned cars, the lone chimneys of burnt houses, the
-- boulder outcrop, the drowned roofs and steeple in the reservoir, Wickham's rope, crab trap and boardwalk, the four
-- workbenches and the furnace, the mine lift, the filling station's forecourt, the festival's bunting, lanterns, dance
-- floor, ring toss and scale, the roof tarp, the mill bridge and the sprinkler. Same sizes and anchors as before.
local dir = app.params['dir'] or '.'
local out = app.params['out'] or dir
local only = app.params['only']
local px = dofile(app.fs.joinPath(dir, 'px.lua'))
local B = dofile(app.fs.joinPath(dir, 'bkit.lua')); B.init(px)

local function P(c, x, y, col) px.p(c, x, y, col) end
local function R(c, x0, y0, x1, y1, col) px.rect(c, x0, y0, x1, y1, col) end
local function H(a, b) return px.h(a, b) end
local function band(c, r, l, lo, hi) return px.band(c, r, l, lo, hi) end
local WD = B.WALLS.honey
local KB = {'k1', 'k2', 'k3', 'k4', 'k5', 'k6'}
local ST = B.WALLS.stone
local IR = {'OUT', 'bt1', 'bt2', 'bt3', 'bt4', 'bt5'}
local MT = {'m1', 'm2', 'm3', 'm4'}
local function new(w, h) return px.new(w, h, B.PAL) end
local function done(c, ax, ay, noline) if not noline then px.outline(c, px.i(c, 'OUT')) end; return c, {w = c.w, h = c.h, ax = ax, ay = ay} end
local function ground(c, x0, x1, y) for x = x0, x1 do if x % 2 == 0 then P(c, x, y, 'OUT2') end end end
local function post(c, x0, x1, y0, y1, r, cap)
  for y = y0, y1 do for x = x0, x1 do local u = (x - x0) / math.max(1, x1 - x0)
    P(c, x, y, band(c, r, .78 - u * .6 - (((y * 3 + x) % 9 == 0 and u > .2 and u < .8) and .18 or 0), 2, #r)) end end
  if cap then R(c, x0 - 1, y0 - 2, x1 + 1, y0 - 1, r[#r - 1]); px.hline(c, x0 - 1, x1 + 1, y0 - 2, r[#r]) end
end
local function boards(c, x0, x1, y0, y1, r, bw, vertical, seed)
  for y = y0, y1 do for x = x0, x1 do local a = vertical and (x - x0) or (y - y0); local b = vertical and (y - y0) or (x - x0)
    local row = a // bw; local ra = a % bw
    local l = .64 + (H(row, seed or 1) - .5) * .2 - (ra == bw - 1 and .4 or 0) + (ra == 0 and .1 or 0)
    if ((b + row * 17) % 41) == 0 then l = l - .3 end; P(c, x, y, band(c, r, l, 2, #r)); if ra == 1 and (b % 14 == 3) then P(c, x, y, 'm2') end end end
end
local function boulder(c, cx, cy, rx, ry, seed)
  for y = math.floor(cy - ry - 2), math.ceil(cy + ry + 2) do for x = math.floor(cx - rx - 2), math.ceil(cx + rx + 2) do
    local dx, dy = (x + .5 - cx) / rx, (y + .5 - cy) / ry; local th = math.atan(dy, dx)
    local e = 1 + .1 * math.sin(th * 3 + seed) + .07 * math.sin(th * 7 + seed * 2)
    if dx * dx + dy * dy <= e * e then
      local facet = math.floor((th + 3.2) / 1.05)                        -- broad flat facets, not a smooth ball
      local l = .62 - dx * .3 - dy * .4 + ((facet + seed) % 3 - 1) * .08
      if dy < -.35 then l = l + .15 end
      if H(x // 3, y // 3 + seed) > .9 then l = l - .15 end
      P(c, x, y, band(c, ST, l, 2, 7)) end end end
  for i = 0, 10 do local a = 3.4 + H(i, seed) * 2.4; local x, y = cx + math.cos(a) * rx * .7, cy + math.sin(a) * ry * .75
    if px.get(c, x, y) ~= 0 then P(c, x, y, 'v3'); P(c, x + 1, y, 'v2') end end                               -- moss on the shaded side
end

local S = {}

-- ------------------------------------------------------------------ abandoned cars, years in the weather
local function car(paint, seed, opendoor)
  local c = new(136, 66); local gy = 61
  local function wheel(cx, flat)
    for y = 42, 61 do for x = cx - 10, cx + 10 do local dx, dy = (x + .5 - cx) / 10, (y + .5 - 52) / (flat and 8 or 10)
      if dx * dx + dy * dy <= 1 and y <= (flat and 60 or 61) then P(c, x, y, (dx * dx + dy * dy < .3) and ((dx < 0 and dy < 0) and 'm4' or 'm2') or 's1') end end end
    px.ellipse(c, cx + .5, 52.5, 2, 2, 'm3') end
  -- the body: hood, cabin, boot; paint faded, rust coming through
  local function lit(x, y) return .66 - (y - 30) / 50 - (x - 8) / 600 end
  for y = 30, 50 do local inset = (y < 34) and (34 - y) * 1.5 or 0; local x0 = math.floor(8 + inset + (y > 46 and (y - 46) * .8 or 0)); local x1 = math.floor(128 - inset * .8 - (y > 46 and (y - 46) * .6 or 0))
    for x = x0, x1 do local l = lit(x, y); if y < 34 then l = l + .2 end; if y == 41 then l = l - .3 end
      local col = band(c, paint, l, 2, #paint)
      if H(x // 4 + seed, y // 3) > .86 then col = (H(x, y) > .5) and 'r4' or 'r3' end                      -- rust
      P(c, x, y, col) end end
  local cab = {{40, 14}, {92, 14}, {102, 30}, {30, 30}}
  px.poly(c, cab, function(x, y) return band(c, paint, .7 - (y - 14) / 50, 3, #paint) end)
  for y = 13, 16 do px.hline(c, 41 + (16 - y), 91 - (16 - y) // 2, y, band(c, paint, .92, 3, #paint)) end       -- the roof's top, catching light
  for _, w in ipairs({{{42, 18}, {64, 18}, {64, 29}, {34, 29}}, {{68, 18}, {90, 18}, {98, 29}, {68, 29}}}) do
    px.poly(c, w, function(x, y) return ((x + y) % 9 < 2) and 'g4' or ((y < 23) and 'g3' or 'g2') end) end
  px.line(c, 46, 20, 56, 27, 't5'); px.line(c, 52, 19, 50, 28, 't5'); px.line(c, 47, 24, 60, 22, 'g6')          -- the windscreen, smashed
  for x = 10, 126 do if px.get(c, x, 44) ~= 0 then P(c, x, 44, 'm4'); P(c, x, 45, 'm2') end end                  -- chrome strip
  R(c, 6, 40, 9, 46, 'm3'); R(c, 127, 40, 130, 46, 'm3')                                                       -- bumpers
  px.ellipse(c, 12.5, 36.5, 2.5, 2.5, 't5'); P(c, 12, 36, 'g6'); R(c, 124, 35, 126, 38, 'dr3')                 -- headlamp, tail light
  for _, x in ipairs({66, 98}) do px.vline(c, x, 31, 49, band(c, paint, .15, 1, 3)) end; R(c, 70, 35, 74, 36, 'm3')
  if opendoor then R(c, 66, 30, 79, 49, 'OUT'); px.poly(c, {{66, 30}, {60, 26}, {60, 52}, {66, 49}}, function(x, y) return band(c, paint, .5, 2, #paint) end) end
  wheel(32, false); wheel(104, true)
  for x = 4, 132 do if H(x, seed + 3) > .55 then px.vline(c, x, gy - 1 - math.floor(H(x, seed) * 8), gy, H(x, 7) > .5 and 'v3' or 'v2') end end   -- weeds through the wheels
  ground(c, 6, 130, gy + 1)
  return done(c, 68, 61)
end
S.rg_car_a = function() return car(B.WALLS.blue, 1, false) end
S.rg_car_b = function() return car(B.WALLS.sage, 2, true) end
S.rg_car_c = function() return car(B.WALLS.oxblood, 3, false) end

-- ------------------------------------------------------------------ what's left of houses: a chimney standing alone
S.rg_chimney = function()
  local c = new(56, 118); local cx = 28
  for y = 8, 106 do local hw = 9 + (y > 74 and (y - 74) * .45 or 0)
    for x = math.floor(cx - hw), math.ceil(cx + hw) do P(c, x, y, 's4') end end
  B.stones(c, cx - 23, 74, cx + 23, 106, 21, 6, function(x, y) return .58 - (x - cx + 23) / 140 end)
  B.stones(c, cx - 9, 8, cx + 9, 74, 22, 6, function(x, y) return .62 - (x - cx + 9) / 60 end)
  for y = 10, 60 do if H(y // 3, 4) > .35 then P(c, cx + 6 + (y % 2), y, 'OUT2') end end                       -- soot up one side
  R(c, cx - 11, 4, cx + 11, 8, 's6'); px.hline(c, cx - 11, cx + 11, 4, 's7')
  for y = 84, 104 do local w = math.floor(math.sqrt(math.max(0, 1 - ((y - 104) / 20) ^ 2)) * 9); px.hline(c, cx - w, cx + w, y, y > 100 and 'OUT2' or 'OUT') end   -- the hearth, cold
  for _, b in ipairs({{-24, 104, -6, 98}, {8, 106, 26, 100}}) do px.line(c, cx + b[1], b[2], cx + b[3], b[4], 'k1'); px.line(c, cx + b[1], b[2] + 1, cx + b[3], b[4] + 1, 'k2') end   -- charred beams
  for i = 0, 8 do local x, y = cx - 24 + math.floor(H(i, 5) * 48), 104 + math.floor(H(i, 6) * 6); px.ellipse(c, x, y, 2.5, 1.6, i % 2 == 0 and 's3' or 'k1') end
  return done(c, 28, 113)
end
S.rg_outcrop = function()
  local c = new(128, 76)
  boulder(c, 44, 40, 30, 22, 1); boulder(c, 86, 46, 26, 18, 2); boulder(c, 62, 58, 22, 13, 3); boulder(c, 106, 62, 12, 8, 4)
  for x = 8, 120 do if H(x, 9) > .5 then px.vline(c, x, 70 - math.floor(H(x, 10) * 5), 71, 'v3') end end
  ground(c, 12, 118, 72)
  return done(c, 64, 71)
end

-- ------------------------------------------------------------------ the drowned town: roofs and a steeple out of the reservoir
local function waterline(c, x0, x1, y)
  for x = x0, x1 do if x % 3 ~= 0 then P(c, x, y, 'd5') end; if (x + 1) % 5 == 0 then P(c, x, y + 2, 'd4') end end
  for x = x0 - 6, x1 + 6, 4 do P(c, x, y + 4, 'g5'); P(c, x + 1, y + 4, 'g5') end
end
S.rg_roofpeak = function()
  local c = new(120, 56); local cx = 60
  for y = 6, 44 do local t = (y - 6) / 38; local hw = 4 + t * 48
    for x = math.floor(cx - hw), math.ceil(cx + hw) do P(c, x, y, B.roofpx(c, 'slate', x, y, 6, x < cx and 1 or 0, 5)) end end
  for y = 6, 44 do P(c, cx, y, 'sl7') end
  B.chimney(c, cx + 18, cx + 30, 0, 30, 'brick')
  for x = cx - 50, cx + 50 do for y = 40, 44 do if H(x // 2, y) > .55 then P(c, x, y, 'v2') end end end           -- weed where the water line sits
  waterline(c, cx - 52, cx + 52, 45)
  return done(c, 60, 46, true)
end
S.rg_steeple = function()
  local c = new(76, 150); local cx = 38
  for y = 70, 136 do for x = cx - 16, cx + 16 do local u = (x - cx + 16) / 32; P(c, x, y, band(c, B.WALLS.white, .74 - u * .5 - ((y - 70) % 6 == 5 and .22 or 0), 2, 7)) end end
  B.window(c, cx - 7, 80, 14, 26, {trim = B.TRIMS.cream, lancet = true, dark = true})
  px.ellipse(c, cx + .5, 96, 5, 6, 'y1'); px.hline(c, cx - 5, cx + 5, 101, 'y2')                              -- the bell, still hanging
  px.ellipse(c, cx + .5, 118.5, 7, 7, 't2'); px.ellipse(c, cx + .5, 118.5, 5.5, 5.5, 't5'); px.line(c, cx, 118, cx, 114, 'OUT'); px.line(c, cx, 118, cx + 3, 120, 'OUT')
  for i = 0, 58 do local hw = 18 * (i / 58); for x = math.floor(cx - hw), math.ceil(cx + hw) do P(c, x, 12 + i, B.roofpx(c, 'slate', x, 12 + i, 12, x < cx and 1 or 0, 9)) end end
  px.hline(c, cx - 20, cx + 20, 70, 't5'); px.vline(c, cx, 0, 12, 'y2'); px.hline(c, cx - 3, cx + 3, 4, 'y2')
  for x = cx - 16, cx + 16 do for y = 128, 136 do if H(x, y // 2) > .6 then P(c, x, y, 'v2') end end end
  waterline(c, cx - 18, cx + 18, 137)
  return done(c, 38, 140, true)
end

-- ------------------------------------------------------------------ Wickham's waterfront bits
S.wk_rope = function()
  local c = new(26, 16)
  for r = 0, 3 do px.ellipse(c, 13 - r * .3, 9, 10 - r * 2, 5 - r, r % 2 == 0 and 'w5' or 'w4') end
  px.ellipse(c, 13, 9, 2, 1, 'k2'); px.line(c, 22, 9, 25, 13, 'w5')
  return done(c, 13, 13)
end
S.wk_trap = function()
  local c = new(32, 24)
  for y = 6, 20 do for x = 3, 28 do if x == 3 or x == 28 or y == 6 or y == 20 or (x - 3) % 5 == 0 then P(c, x, y, 'k4') elseif (x + y) % 3 == 0 then P(c, x, y, 'w3') end end end
  R(c, 3, 4, 28, 6, 'k5'); px.hline(c, 3, 28, 4, 'k6')
  px.ellipse(c, 16, 14, 3, 2, 'dr3'); P(c, 14, 13, 'dr5')                                                       -- something red inside
  return done(c, 16, 21)
end
S.wk_walk = function()
  local c = new(96, 26)
  boards(c, 2, 93, 3, 17, WD, 6, true, 3)
  R(c, 0, 18, 95, 21, 'k3'); px.hline(c, 0, 95, 18, 'k5')
  for _, x in ipairs({4, 46, 88}) do R(c, x, 20, x + 3, 25, 'k2') end
  return done(c, 48, 12)
end

-- ------------------------------------------------------------------ workbenches and the furnace
local function benchBase(c, x0, x1, top, yb, r)
  for y = top, top + 9 do for x = x0, x1 do P(c, x, y, band(c, r, .86 - (y - top) / 30 - (((x - x0) % 11 == 0) and .2 or 0), 3, #r)) end end   -- the top, from above
  for y = top + 10, top + 15 do for x = x0, x1 do P(c, x, y, band(c, r, .45, 2, #r)) end end                  -- its front edge
  px.hline(c, x0, x1, top + 10, r[#r - 1])
  for _, x in ipairs({x0 + 1, x1 - 4}) do post(c, x, x + 3, top + 16, yb, r, false) end
  R(c, x0 + 4, yb - 10, x1 - 4, yb - 7, r[3]); px.hline(c, x0 + 4, x1 - 4, yb - 10, r[5])                     -- a shelf underneath
end
S.bench_farm = function()
  local c = new(64, 64)
  benchBase(c, 4, 59, 26, 60, B.WALLS.sage)
  post(c, 6, 9, 4, 26, KB, false); post(c, 54, 57, 4, 26, KB, false); R(c, 6, 4, 57, 7, 'k4'); px.hline(c, 6, 57, 4, 'k6')   -- a back shelf
  for i = 0, 3 do local x = 12 + i * 11; R(c, x, 10, x + 7, 15, 'r4'); px.hline(c, x, x + 7, 10, 'r6'); px.vline(c, x + 3, 6, 10, 'v4'); P(c, x + 2, 7, 'v5'); P(c, x + 5, 8, 'v3') end   -- pots
  R(c, 10, 22, 30, 27, 'k3'); for x = 12, 28, 3 do P(c, x, 23, 'v4') end                                          -- a seed tray
  R(c, 38, 21, 46, 28, 't4'); px.hline(c, 38, 46, 21, 't5'); B.text(c, 39, 23, 'S', 'k3')                         -- a seed packet
  px.line(c, 50, 20, 56, 27, 'k4'); R(c, 48, 18, 51, 21, 'm3')                                                    -- a trowel
  return done(c, 32, 61)
end
S.bench_furn = function()
  local c = new(64, 62)
  benchBase(c, 3, 60, 24, 58, WD)
  R(c, 6, 18, 14, 24, 'm2'); px.hline(c, 6, 14, 18, 'm4'); px.vline(c, 10, 14, 18, 'm3')                         -- a vise
  for x = 20, 44 do P(c, x, 27 + (x % 2), 'm3') end; R(c, 44, 25, 50, 29, 'w3')                                    -- a saw
  R(c, 30, 30, 40, 32, 'w6'); px.hline(c, 30, 40, 30, 'w7')                                                       -- a plank
  for i = 0, 6 do P(c, 46 + i, 31 + (i % 2), 'w7') end                                                            -- shavings
  px.line(c, 52, 22, 58, 28, 'k3'); R(c, 50, 20, 53, 23, 'm3')                                                    -- a mallet
  return done(c, 32, 59)
end
S.bench_weapon = function()
  local c = new(64, 66)
  benchBase(c, 3, 60, 28, 62, {'bt1', 'bt2', 'bt3', 'bt4', 'bt5', 's6'})
  for y = 6, 26 do P(c, 8, y, 'k3') end; for i = 0, 3 do px.vline(c, 14 + i * 9, 8, 22, 'm3'); px.hline(c, 12 + i * 9, 16 + i * 9, 8, 'm2') end   -- a tool rack
  px.hline(c, 6, 50, 6, 'k4')
  R(c, 20, 26, 34, 31, 'm2'); px.hline(c, 20, 34, 26, 'm4'); R(c, 24, 31, 30, 34, 'm1')                          -- a small anvil on top
  px.line(c, 40, 30, 52, 30, 'm4'); px.line(c, 40, 31, 52, 31, 'm2'); R(c, 36, 29, 40, 32, 'k4')                   -- a blade
  P(c, 46, 34, 'y2'); P(c, 47, 34, 'y3')                                                                           -- a spark on the floor
  return done(c, 32, 63)
end
S.bench_armor = function()
  local c = new(72, 62)
  benchBase(c, 18, 69, 24, 58, WD)
  post(c, 7, 9, 22, 58, KB, false); R(c, 2, 56, 14, 58, 'k3')                                                     -- a dressmaker's dummy
  for y = 6, 30 do local w = 5 - math.abs(y - 16) * .12; px.hline(c, math.floor(8 - w), math.ceil(8 + w), y, band(c, B.WALLS.plaster, .7 - (y - 6) / 40, 3, 7)) end
  for y = 12, 28 do px.hline(c, 3, 13, y, ((y // 3) % 2 == 0) and 'k4' or 'k3') end                             -- a leather jerkin on it
  R(c, 24, 26, 40, 32, 'k4'); px.hline(c, 24, 40, 26, 'k6'); for x = 26, 38, 3 do P(c, x, 29, 'm3') end           -- leather with rivets
  R(c, 46, 25, 52, 31, 'm3'); px.ellipse(c, 60, 28, 4, 3, 'm2')                                                   -- shears, a helmet
  return done(c, 36, 59)
end
S.furnace = function()
  local c = new(48, 68); local cx = 24
  B.stones(c, 6, 24, 41, 62, 31, 6, function(x, y) return .62 - (x - 6) / 80 end)
  for y = 14, 24 do local w = 18 - (24 - y) * 1.1; for x = math.floor(cx - w), math.ceil(cx + w) do P(c, x, y, band(c, ST, .8 - (y - 14) / 30, 3, 7)) end end
  R(c, cx - 4, 2, cx + 4, 14, 'bt2'); px.vline(c, cx - 4, 2, 14, 'bt4'); R(c, cx - 5, 1, cx + 5, 3, 'bt3')         -- the flue
  for y = 40, 56 do local w = math.floor(math.sqrt(math.max(0, 1 - ((y - 56) / 16) ^ 2)) * 9); for x = cx - w, cx + w do P(c, x, y, (y > 50) and ((x + y) % 3 == 0 and 'y3' or 'y2') or (y > 46 and 'y1' or 'OUT')) end end   -- the fire
  R(c, cx - 11, 57, cx + 11, 60, 'bt3'); px.hline(c, cx - 11, cx + 11, 57, 'bt4')
  ground(c, 6, 42, 64)
  return done(c, 24, 65)
end
S.mine_lift = function()
  local c = new(52, 92); local cx = 26
  post(c, 4, 8, 10, 86, KB, false); post(c, 43, 47, 10, 86, KB, false); R(c, 2, 8, 49, 12, 'k4'); px.hline(c, 2, 49, 8, 'k6')
  px.ellipse(c, cx + .5, 6, 7, 7, 'm2'); px.ellipse(c, cx + .5, 6, 5, 5, 0); px.ellipse(c, cx + .5, 6, 1.5, 1.5, 'm3')   -- the pulley wheel
  px.vline(c, cx, 13, 40, 'w4')
  for y = 40, 82 do for x = 12, 39 do if x == 12 or x == 39 or y == 40 or y == 82 or (x - 12) % 4 == 0 then P(c, x, y, 'bt3') else P(c, x, y, 'OUT') end end end   -- the cage
  R(c, 10, 82, 41, 86, 'k3')
  return done(c, 26, 86)
end

-- ------------------------------------------------------------------ the filling station's forecourt
S.forecourt = function()
  local c = new(200, 96)
  for y = 0, 95 do for x = 0, 199 do local l = .6 + (H(x // 3, y // 3) - .5) * .06; if x % 40 == 0 or y % 32 == 0 then l = l - .22 end
    if y > 90 then l = l - .15 end; P(c, x, y, band(c, ST, l, 3, 7)) end end
  for i, s in ipairs({{60, 40, 14, 6}, {130, 60, 10, 4}, {40, 75, 7, 3}}) do px.ellipse(c, s[1], s[2], s[3], s[4], 's2'); px.ellipse(c, s[1] - 2, s[2] - 1, s[3] * .6, s[4] * .6, 's1')
    P(c, s[1] - 4, s[2] - 2, 'bb3'); P(c, s[1] - 3, s[2] - 2, 'f2') end                                                 -- oil, a rainbow on it
  for i = 0, 6 do local x, y = math.floor(H(i, 3) * 190), math.floor(H(i, 4) * 90); px.line(c, x, y, x + 10, y + 4, 's2'); P(c, x + 5, y + 1, 'v3'); P(c, x + 6, y + 2, 'v4') end   -- cracks with weeds
  return done(c, 100, 48, true)
end

-- ------------------------------------------------------------------ the festival
local function stringline(c, x0, x1, y0, sag) return function(x) local t = (x - x0) / (x1 - x0); return math.floor(y0 + math.sin(t * math.pi) * sag) end end
S.f_bunting = function()
  local c = new(136, 64)
  post(c, 2, 5, 6, 60, B.TRIMS.cream, true); post(c, 130, 133, 6, 60, B.TRIMS.cream, true)
  for y = 10, 60, 6 do px.hline(c, 2, 5, y, 'dr3'); px.hline(c, 130, 133, y, 'dr3') end
  local L = stringline(c, 5, 130, 10, 12)
  for x = 5, 130 do P(c, x, L(x), 'k3') end
  local cols = {{'dr3', 'dr5'}, {'y1', 'y2'}, {'d3', 'd5'}, {'f2', 'f3'}, {'dg3', 'dg5'}}
  for i = 0, 11 do local fx = 10 + i * 10; local fy = L(fx) + 1; local col = cols[i % 5 + 1]
    for k = 0, 6 do px.hline(c, fx + k // 2, fx + 6 - k // 2, fy + k, k < 2 and col[2] or col[1]) end end
  return done(c, 68, 61)
end
S.f_lanterns = function()
  local c = new(136, 64)
  post(c, 2, 5, 6, 60, KB, true); post(c, 130, 133, 6, 60, KB, true)
  local L = stringline(c, 5, 130, 10, 10)
  for x = 5, 130 do P(c, x, L(x), 'k2') end
  for i = 0, 9 do local fx = 14 + i * 12; local fy = L(fx) + 2
    px.vline(c, fx, fy - 1, fy, 'k2'); for y = fy, fy + 7 do local w = (y == fy or y == fy + 7) and 2 or 3; px.hline(c, fx - w, fx + w, y, (y < fy + 3) and 'y3' or ((i % 2 == 0) and 'y2' or 'r6')) end
    px.hline(c, fx - 2, fx + 2, fy + 8, 'k3') end
  return done(c, 68, 61)
end
S.f_floor = function()
  local c = new(164, 64)
  boards(c, 2, 161, 2, 56, WD, 6, true, 11)
  R(c, 0, 57, 163, 61, 'k3'); px.hline(c, 0, 163, 57, 'k5')
  for x = 2, 160, 26 do for y = 4, 54, 50 do P(c, x + 12, y, 'm3') end end
  return done(c, 82, 60, true)
end
S.f_ringtoss = function()
  local c = new(56, 44)
  for y = 10, 20 do for x = 4, 51 do P(c, x, y, ((x // 6) % 2 == 0) and 'dr4' or 't5') end end                     -- the striped table top
  for y = 21, 38 do for x = 4, 51 do P(c, x, y, ((x // 6) % 2 == 0) and 'dr3' or 't4') end end
  for i = 0, 8 do local bx = 8 + (i % 5) * 9; local by = 10 + (i // 5) * 5; R(c, bx, by - 6, bx + 2, by, ({'g3', 'v3', 'g4'})[i % 3 + 1]); P(c, bx + 1, by - 7, 'g5') end   -- bottles
  for i = 0, 2 do px.ellipse(c, 14 + i * 13, 6, 3, 1.5, 'y2'); px.ellipse(c, 14 + i * 13, 6, 1.5, .5, 0) end
  return done(c, 28, 41)
end
S.f_scale = function()
  local c = new(48, 72); local cx = 24
  post(c, 4, 7, 6, 68, KB, false); post(c, 40, 43, 6, 68, KB, false); R(c, 2, 4, 45, 8, 'k4'); px.hline(c, 2, 45, 4, 'k6')
  px.ellipse(c, cx + .5, 20, 7, 7, 't5'); px.ellipse(c, cx + .5, 20, 7, 7, 't5'); px.line(c, cx, 20, cx + 4, 16, 'dr3')   -- the dial
  px.vline(c, cx, 8, 13, 'm2'); px.vline(c, cx, 27, 40, 'm2'); px.line(c, cx, 40, cx - 10, 50, 'm2'); px.line(c, cx, 40, cx + 10, 50, 'm2')
  px.ellipse(c, cx + .5, 51, 12, 3, 'm3'); px.hline(c, cx - 11, cx + 11, 51, 'm4')                                 -- the pan
  B.sign(c, cx, 58, 'LBS')
  return done(c, 24, 69)
end

-- ------------------------------------------------------------------ the roof tarp, the mill bridge, the sprinkler
S.tarp = function()
  local c = new(76, 44)
  for y = 4, 39 do for x = 4, 71 do local wav = math.sin(x * .25 + y * .12) * .12 + math.sin(y * .4) * .06
    P(c, x, y, band(c, B.WALLS.blue, .62 + wav - (y - 4) / 120, 2, 7)) end end
  for _, q in ipairs({{4, 4}, {71, 4}, {4, 39}, {71, 39}}) do R(c, q[1] - 2, q[2] - 2, q[1] + 2, q[2] + 2, 'm3'); px.line(c, q[1], q[2], q[1] + (q[1] < 30 and -4 or 4), q[2] + 4, 'w4') end   -- grommets, ropes
  for _, q in ipairs({{30, 14}, {50, 26}}) do R(c, q[1], q[2], q[1] + 6, q[2] + 3, 'bk4'); px.hline(c, q[1], q[1] + 6, q[2], 'bk6') end                 -- bricks weighing it down
  return done(c, 38, 162)
end
S.millbridge = function()
  local c = new(164, 270)
  boards(c, 14, 149, 6, 262, WD, 5, false, 21)
  for _, x in ipairs({8, 152}) do for y = 0, 266 do P(c, x, y, 'k5'); P(c, x + 1, y, 'k4'); P(c, x + 2, y, 'k3'); P(c, x + 3, y, 'k2') end end
  for y = 4, 260, 32 do for _, x in ipairs({6, 152}) do R(c, x, y, x + 5, y + 8, 'k3'); px.hline(c, x, x + 5, y, 'k6') end end
  return done(c, 82, 258)
end
S.sprinkler_w = function()
  local c = new(24, 26); local cx = 12
  R(c, cx - 1, 6, cx + 1, 21, 'm3'); px.vline(c, cx - 1, 6, 21, 'm4')
  R(c, cx - 5, 3, cx + 5, 6, 'm2'); px.hline(c, cx - 5, cx + 5, 3, 'm4'); P(c, cx - 5, 4, 'd4'); P(c, cx + 5, 4, 'd4')
  px.ellipse(c, cx + .5, 21, 5, 2, 'm2')
  return done(c, 12, 21)
end

local names = {}
for k in pairs(S) do names[#names + 1] = k end
table.sort(names)
for _, name in ipairs(names) do
  if not only or only == name then
    local c, m = S[name]()
    px.save(c, app.fs.joinPath(out, name .. '.png'))
    print(string.format('META %s %d %d %.1f %d %.2f - -', name, m.w, m.h, m.ax, m.ay, m.w / 32))
  end
end
