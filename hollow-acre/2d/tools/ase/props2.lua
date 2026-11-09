-- More props for Hollow Acre, drawn in Aseprite with bkit.lua's palette: the town's terrace walls and steps, the water
-- tower, the bandstand, the windpump tower, the fuel pump, the pond dock, footbridge and lake deck, the road signs and
-- milestones, the Greyfield gate, the swing set, grave markers, Wickham's stall, boat, nets, fish rack and bell, the
-- pumpkins and jack-o'-lanterns on every porch, the anvil and the ladder. Same sizes and anchors as the old sprites.
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
local WH = B.WALLS.white
local MT = {'m1', 'm2', 'm3', 'm4'}
local RD = {'dr1', 'dr2', 'dr3', 'dr4', 'dr5'}
local OR = B.ROOFS.scallop                -- warm orange-reds, 8 steps (pumpkins)
local function new(w, h) return px.new(w, h, B.PAL) end
local function done(c, ax, ay) px.outline(c, px.i(c, 'OUT')); return c, {w = c.w, h = c.h, ax = ax, ay = ay} end
local function ground(c, x0, x1, y) for x = x0, x1 do if x % 2 == 0 then P(c, x, y, 'OUT2') end end end
local function post(c, x0, x1, y0, y1, r, cap)
  for y = y0, y1 do for x = x0, x1 do local u = (x - x0) / math.max(1, x1 - x0)
    P(c, x, y, band(c, r, .78 - u * .6 - (((y * 3 + x) % 9 == 0 and u > .2 and u < .8) and .18 or 0), 2, #r)) end end
  if cap then R(c, x0 - 1, y0 - 2, x1 + 1, y0 - 1, r[#r - 1]); px.hline(c, x0 - 1, x1 + 1, y0 - 2, r[#r]) end
end
local function rail(c, x0, x1, y0, y1, r, seed)
  for y = y0, y1 do for x = x0, x1 do local l = (y == y0) and .9 or ((y == y1) and .18 or .55 - (y - y0) / (y1 - y0 + 1) * .2)
    if y ~= y0 and y ~= y1 and H(x // 5, y + (seed or 0)) > .82 then l = l - .16 end; P(c, x, y, band(c, r, l, 2, #r)) end end
end
local function boards(c, x0, x1, y0, y1, r, bw, vertical, seed)        -- deck boards with gaps and nail heads
  for y = y0, y1 do for x = x0, x1 do local a = vertical and (x - x0) or (y - y0); local b = vertical and (y - y0) or (x - x0)
    local row = a // bw; local ra = a % bw
    local l = .64 + (H(row, seed or 1) - .5) * .2 - (ra == bw - 1 and .4 or 0) + (ra == 0 and .1 or 0)
    if ((b + row * 17) % 41) == 0 then l = l - .3 end
    P(c, x, y, band(c, r, l, 2, #r))
    if ra == 1 and (b % 14 == 3) then P(c, x, y, 'm2') end end end
end
local function cyl(c, x0, x1, y0, y1, r, lo, hi)
  for y = y0, y1 do for x = x0, x1 do local u = (x - x0) / math.max(1, x1 - x0) * 2 - 1
    P(c, x, y, band(c, r, .72 - u * .5 - u * u * .2 + ((u > -.6 and u < -.35) and .15 or 0), lo or 1, hi or #r)) end end
end
local function lattice(c, xa0, xa1, xb0, xb1, y0, y1, r, levels)       -- a tapering lattice tower: legs from (xa0,xa1) at y1 up to (xb0,xb1) at y0
  local function lx(side, y) local t = (y1 - y) / (y1 - y0); return side < 0 and (xa0 + (xb0 - xa0) * t) or (xa1 + (xb1 - xa1) * t) end
  for y = y0, y1 do for _, s in ipairs({-1, 1}) do local x = math.floor(lx(s, y)); P(c, x, y, s < 0 and r[4] or r[3]); P(c, x + 1, y, s < 0 and r[3] or r[2]); P(c, x - 1, y, r[1]) end end
  local step = (y1 - y0) / levels
  for i = 0, levels - 1 do local ya, yb = math.floor(y1 - i * step), math.floor(y1 - (i + 1) * step)
    px.line(c, lx(-1, ya), ya, lx(1, yb), yb, r[3]); px.line(c, lx(1, ya), ya, lx(-1, yb), yb, r[2])
    px.hline(c, math.floor(lx(-1, yb)), math.floor(lx(1, yb)), yb, r[4]) end
end

local S = {}

-- ------------------------------------------------------------------ the town's terrace walls and steps
S.twall = function()
  local c = new(66, 52)
  B.stones(c, 0, 12, 65, 41, 31, 7, function(x, y) return .6 - (y - 12) / 120 end)
  for x = 0, 65 do for y = 4, 11 do P(c, x, y, band(c, ST, .86 - (y - 4) / 26 - ((x % 11 == 0) and .3 or 0) + (H(x // 11, 3) - .5) * .1, 3, 7)) end end
  px.hline(c, 0, 65, 11, 's3'); px.hline(c, 0, 65, 12, 'OUT2')
  for x = 0, 65 do if H(x // 2, 7) > .45 then px.vline(c, x, 2, 3 + math.floor(H(x, 8) * 2), H(x, 9) > .5 and 'v3' or 'v4') end end
  for i = 0, 2 do local ix = 6 + math.floor(H(i, 4) * 50); local iy = 14 + math.floor(H(i, 5) * 18)       -- ivy trails over the face
    for k = 0, 8 + math.floor(H(i, 6) * 8) do local x = ix + math.floor(math.sin(k * .7 + i) * 2); P(c, x, iy + k, k % 3 == 0 and 'v4' or 'v2'); if k % 2 == 0 then P(c, x + 1, iy + k, 'v3') end end end
  px.ellipse(c, 33, 34, 2.5, 2, 'OUT'); for y = 36, 41 do if y % 2 == 0 then P(c, 33, y, 's2') end end   -- a weep hole, stained below
  for x = 0, 65, 2 do if H(x, 11) > .4 then px.vline(c, x, 40 - math.floor(H(x, 12) * 4), 41, 'v3') end end
  ground(c, 0, 65, 42)
  return done(c, 0, 42)
end
local function steps(r, wood)
  local c = new(84, 54); local cx = 42
  for i = 0, 4 do local y = 40 - i * 8; local hw = 30 - i * 1.5
    for yy = y - 3, y do for x = math.floor(cx - hw), math.ceil(cx + hw) do P(c, x, yy, band(c, r, .86 - (x - cx + hw) / (hw * 9), 3, #r)) end end      -- the tread
    for yy = y + 1, y + 4 do for x = math.floor(cx - hw), math.ceil(cx + hw) do P(c, x, yy, band(c, r, .42 - (x - cx + hw) / (hw * 8), 2, #r - 1)) end end   -- the riser
    if wood then for x = math.floor(cx - hw), math.ceil(cx + hw), 9 do P(c, x, y - 1, 'm2') end
    else for x = math.floor(cx - hw) + 3, math.ceil(cx + hw), 11 + i do px.vline(c, x, y + 1, y + 4, 's2') end end
    px.hline(c, math.floor(cx - hw), math.ceil(cx + hw), y + 5, 'OUT2') end
  for _, s in ipairs({-1, 1}) do for y = 6, 45 do local x0 = s < 0 and 4 or 77; for x = x0, x0 + 3 do P(c, x, y, band(c, r, s < 0 and .7 or .3, 2, #r)) end end end   -- cheek walls
  ground(c, 6, 78, 46)
  return done(c, 42, 44)
end
S.tsteps = function() return steps(ST, false) end
S.tsteps_wood = function() return steps(WD, true) end

-- ------------------------------------------------------------------ the water tower
S.watertower = function()
  local c = new(150, 470); local cx = 75; local ay = 466
  lattice(c, 22, 128, 38, 112, 168, ay - 4, {'bt1', 'bt2', 'bt3', 'bt4'}, 7)
  for x = cx + 20, cx + 24 do for y = 168, ay - 6 do if x == cx + 20 or x == cx + 24 or (y % 6 == 0) then P(c, x, y, 'bt3') end end end   -- the ladder
  for _, lx in ipairs({22, 128}) do R(c, lx - 6, ay - 4, lx + 6, ay, 's5'); px.hline(c, lx - 6, lx + 6, ay - 4, 's7') end
  -- the tank: painted steel staves, rust running from the seams, the town's name fading
  local t0, t1 = 46, 160
  for y = t0, t1 do for x = cx - 46, cx + 46 do local u = (x - cx) / 46
    local l = .74 - u * .45 - u * u * .2 + ((u > -.55 and u < -.3) and .14 or 0); if (y - t0) % 19 == 18 then l = l - .3 end
    P(c, x, y, band(c, WH, l, 2, 7)) end end
  for k = 0, 14 do local x = cx - 40 + math.floor(H(k, 1) * 80); local y = t0 + ((k % 6) * 19); local len = 6 + math.floor(H(k, 2) * 16)
    for yy = y, math.min(t1, y + len) do P(c, x, yy, yy < y + 3 and 'r4' or 'r3') end end
  B.text(c, cx - 25, 96, 'MARROW HOLLOW', 'ww3'); B.text(c, cx - 25, 95, 'MARROW HOLLOW', 'ww2')
  for i = 0, 34 do local y = t0 - 1 - i; local hw = 50 - i * 1.35
    for x = math.floor(cx - hw), math.ceil(cx + hw) do P(c, x, y, band(c, RD, x < cx and .78 - (cx - x) / 200 or .32, 1, 5)) end end
  px.hline(c, cx - 50, cx + 50, t0 - 1, 'dr1'); R(c, cx - 2, 2, cx + 2, 12, 'dr3'); px.ellipse(c, cx + .5, 4, 3, 3, 'dr4')
  -- the catwalk round the bottom of the tank
  R(c, cx - 54, t1 + 1, cx + 54, t1 + 5, 'bt3'); px.hline(c, cx - 54, cx + 54, t1 + 1, 'bt4')
  for x = cx - 54, cx + 54, 6 do px.vline(c, x, t1 - 9, t1, 'bt3') end; px.hline(c, cx - 54, cx + 54, t1 - 10, 'bt4'); px.hline(c, cx - 54, cx + 54, t1 - 5, 'bt2')
  R(c, cx - 30, t1 + 6, cx + 30, t1 + 9, 'bt2'); px.vline(c, cx, t1 + 9, t1 + 30, 'bt2')
  ground(c, 14, 136, ay + 1)
  return done(c, 75, 466)
end

-- ------------------------------------------------------------------ the bandstand on the green
S.bandstand = function()
  local c = new(156, 168); local cx = 78; local ay = 164
  -- the platform, its lattice skirt, the steps
  for y = 128, 136 do for x = 14, 141 do P(c, x, y, band(c, WD, .76 - (y - 128) / 30, 3, 7)) end end
  boards(c, 18, 137, 120, 130, WD, 5, true, 61)
  for y = 137, 156 do for x = 16, 139 do local lat = ((x + y) % 8 == 0) or ((x - y) % 8 == 0); P(c, x, y, lat and 'ww6' or 'OUT') end end
  px.hline(c, 16, 139, 137, 'ww7'); px.hline(c, 16, 139, 156, 'ww3')
  for i = 0, 3 do local y = 140 + i * 5; R(c, cx - 14 - i, y, cx + 14 + i, y + 3, 'w5'); px.hline(c, cx - 14 - i, cx + 14 + i, y, 'w7') end
  -- posts, rail, the striped roof
  for _, x in ipairs({20, 52, 101, 132}) do post(c, x, x + 3, 50, 128, WH, false) end
  for x = 18, 138 do if x < cx - 15 or x > cx + 15 then P(c, x, 112, 'ww7'); P(c, x, 113, 'ww5'); if x % 5 == 0 then px.vline(c, x, 114, 127, 'ww5') end end end
  for i = 0, 46 do local y = 6 + i; local hw = 6 + i * 1.62
    for x = math.floor(cx - hw), math.ceil(cx + hw) do local st = math.floor((math.atan(x - cx, i + 4) + 1.6) * 6) % 2
      local lit = x < cx and .75 or .4
      P(c, x, y, st == 0 and band(c, B.TRIMS.green, lit, 1, 5) or band(c, B.TRIMS.cream, lit, 1, 5)) end end
  for x = 4, 152 do local st = ((x - 4) // 8) % 2; for y = 52, 56 + ((x % 8 > 1 and x % 8 < 6) and 2 or 0) do P(c, x, y, st == 0 and 'dg3' or 't4') end end
  px.hline(c, 4, 152, 52, 'OUT2')
  px.vline(c, cx, 0, 6, 'y2'); P(c, cx, 0, 'y3'); px.hline(c, cx - 2, cx + 2, 3, 'y2')
  ground(c, 14, 142, 158)
  return done(c, 78, 164)
end

-- ------------------------------------------------------------------ the windpump's tower (its wheel turns as its own sprite at the top)
S.windpump = function()
  local c = new(48, 170); local cx = 24
  lattice(c, 9, 39, 20, 28, 34, 164, {'bt1', 'bt2', 'bt3', 'bt4'}, 6)
  R(c, cx - 7, 30, cx + 7, 34, 'w4'); px.hline(c, cx - 7, cx + 7, 30, 'w6')                         -- the little platform
  px.vline(c, cx, 34, 160, 'm2')                                                                     -- the pump rod
  px.line(c, cx + 2, 32, cx + 20, 26, 'bt3'); for y = 18, 30 do for x = cx + 14, cx + 22 do if (x - (cx + 14)) >= math.abs(y - 24) * .8 then P(c, x, y, x < cx + 18 and 'dr4' or 'dr3') end end end   -- the tail vane
  R(c, cx - 6, 158, cx + 6, 166, 's5'); px.hline(c, cx - 6, cx + 6, 158, 's7'); R(c, cx + 3, 152, cx + 9, 157, 'm2')   -- the well head, a spout
  return done(c, 24, 167)
end

-- ------------------------------------------------------------------ fuel
S.gas_pump = function()
  local c = new(30, 76); local cx = 15
  R(c, cx - 9, 66, cx + 9, 72, 's5'); px.hline(c, cx - 9, cx + 9, 66, 's7')
  cyl(c, cx - 8, cx + 7, 20, 65, RD, 1, 5)
  R(c, cx - 5, 26, cx + 4, 38, 't5'); px.hline(c, cx - 5, cx + 4, 38, 't2'); B.text(c, cx - 4, 29, '89', 'OUT')
  R(c, cx - 5, 42, cx + 4, 46, 'OUT'); px.hline(c, cx - 4, cx + 3, 44, 'y2')
  px.ellipse(c, cx + .5, 12, 7, 7, 't5'); px.ellipse(c, cx + .5, 12, 5, 5, 't4'); px.hline(c, cx - 6, cx + 6, 12, 'dr3'); px.hline(c, cx - 6, cx + 6, 13, 'dr4')
  R(c, cx - 4, 18, cx + 4, 20, 'dr2')
  px.vline(c, cx + 9, 30, 52, 'OUT'); px.line(c, cx + 9, 52, cx + 12, 60, 'OUT'); R(c, cx + 8, 28, cx + 11, 33, 'm3')
  return done(c, 15, 73)
end
S.pump_isle = function()
  local c = new(70, 24)
  R(c, 2, 4, 67, 18, 's6'); px.hline(c, 2, 67, 4, 's7'); R(c, 2, 14, 67, 18, 's4')
  for x = 2, 67 do if ((x - 2) // 5) % 2 == 0 then px.vline(c, x, 15, 17, 'y2') else px.vline(c, x, 15, 17, 'OUT') end end
  px.ellipse(c, 50, 9, 6, 2, 'OUT2')
  ground(c, 2, 67, 19)
  return done(c, 35, 17)
end

-- ------------------------------------------------------------------ water: dock, footbridge, deck
S.dock = function()
  local c = new(70, 140)
  for _, x in ipairs({8, 59}) do for y = 0, 130 do P(c, x, y, 'k4'); P(c, x + 1, y, 'k3'); P(c, x + 2, y, 'k2') end end      -- the stringers
  boards(c, 11, 58, 0, 126, WD, 5, false, 71)
  for _, y in ipairs({4, 44, 84, 124}) do for _, x in ipairs({5, 62}) do cyl(c, x, x + 4, y - 4, y + 10, KB, 2, 6); px.ellipse(c, x + 2.5, y - 4, 2.5, 1.2, 'k6') end end   -- pilings
  for y = 127, 133 do for x = 9, 60 do P(c, x, y, band(c, KB, .35, 1, 4)) end end
  px.ellipse(c, 48, 112, 5, 3.5, 'w5'); px.ellipse(c, 48, 112, 3, 2, 'w3'); P(c, 48, 112, 'w2')                              -- a coil of rope
  return done(c, 35, 70)
end
S.footbridge = function()
  local c = new(100, 50)
  boards(c, 4, 95, 9, 41, WD, 5, true, 81)
  R(c, 2, 6, 97, 8, 'k3'); px.hline(c, 2, 97, 6, 'k5'); R(c, 2, 42, 97, 45, 'k2'); px.hline(c, 2, 97, 42, 'k4')
  for _, x in ipairs({2, 48, 94}) do R(c, x, 44, x + 3, 48, 'k2') end
  return done(c, 50, 25)
end
S.footbridge_rail = function()
  local c = new(100, 11)
  for _, x in ipairs({2, 26, 50, 74, 95}) do post(c, x, x + 2, 2, 10, KB, false) end
  rail(c, 0, 99, 2, 4, WD, 3)
  return done(c, 50, 10)
end
S.deck = function()
  local c = new(212, 96)
  boards(c, 6, 205, 6, 76, WD, 5, false, 91)
  R(c, 4, 77, 207, 84, 'k3'); px.hline(c, 4, 207, 77, 'k5'); px.hline(c, 4, 207, 84, 'k1')
  for x = 8, 204, 28 do cyl(c, x, x + 5, 82, 92, KB, 2, 6) end
  for x = 4, 207 do P(c, x, 4, 'k5'); P(c, x, 5, 'k3') end
  for i = 0, 2 do local y = 84 + i * 3; R(c, 96 - i * 2, y, 116 + i * 2, y + 2, 'w5'); px.hline(c, 96 - i * 2, 116 + i * 2, y, 'w7') end
  return done(c, 106, 88)
end

-- ------------------------------------------------------------------ roadside: the milestone, the county line, the motel's sign, Greyfield's gate
S.rg_mile = function()
  local c = new(30, 50); local cx = 15
  for y = 8, 44 do for x = cx - 9, cx + 9 do local arch = y < 16 and math.sqrt(math.max(0, 81 - (x - cx) ^ 2)) * .9 < 16 - y and true or false
    if not arch then P(c, x, y, band(c, ST, .78 - (x - cx + 9) / 34 + (H(x // 3, y // 3) - .5) * .1, 2, 7)) end end end
  for y = 10, 44 do P(c, cx + 10, y + 1, 's2') end
  px.ellipse(c, cx + .5, 24.5, 5, 5, 's3'); px.ellipse(c, cx + .5, 24.5, 3.5, 3.5, 's5')                                  -- a compass rose cut in it
  px.vline(c, cx, 19, 30, 's2'); px.hline(c, cx - 5, cx + 5, 24, 's2'); P(c, cx, 18, 's7')
  B.text(c, cx - 5, 33, 'MI', 's2')
  for x = cx - 10, cx + 10 do if H(x, 3) > .3 then px.vline(c, x, 41 - math.floor(H(x, 4) * 5), 44, 'v3') end end
  ground(c, cx - 10, cx + 10, 46)
  return done(c, 15, 46)
end
S.rg_countysign = function()
  local c = new(96, 92); local cx = 48
  post(c, 20, 23, 10, 86, KB, false); post(c, 72, 75, 10, 86, KB, false)
  R(c, 8, 6, 87, 40, 'dg2'); px.hline(c, 8, 87, 6, 'dg4'); px.hline(c, 8, 87, 40, 'dg1'); R(c, 10, 8, 85, 38, 'dg3'); R(c, 11, 9, 84, 37, 'dg2')
  B.text(c, cx - 13, 13, 'LEAVING', 't5'); B.text(c, cx - 27, 22, 'MARROW COUNTY', 't5'); B.text(c, cx - 9, 30, 'LINE', 't5')
  R(c, 16, 46, 79, 62, 't5'); px.hline(c, 16, 79, 62, 't2'); B.text(c, cx - 19, 48, 'COME BACK', 'OUT'); B.text(c, cx - 7, 55, 'SOON', 'OUT')
  for _, x in ipairs({30, 34}) do for y = 46, 74 do if H(x, y // 2) > .25 then P(c, x + (y > 60 and 1 or 0), y, y < 62 and 'b2' or 'b1') end end end   -- two long dark streaks
  ground(c, 18, 78, 88)
  return done(c, 48, 88)
end
S.rg_motelsign = function()
  local c = new(80, 156); local cx = 40
  post(c, cx - 14, cx - 11, 60, 150, IR, false); post(c, cx + 10, cx + 13, 60, 150, IR, false)
  R(c, 6, 4, 73, 56, 'dg2'); px.hline(c, 6, 73, 4, 'dg4'); px.hline(c, 6, 73, 56, 'dg1'); R(c, 9, 7, 70, 53, 'dg3')
  for i = 0, 14 do local hw = 1 + i * .6; px.hline(c, math.floor(18 - hw), math.ceil(18 + hw), 14 + i * 2, i % 3 == 0 and 'dg5' or 'dg4') end; R(c, 17, 44, 19, 48, 'k3')   -- a pine
  B.text(c, 30, 14, 'PINE', 't5'); B.text(c, 30, 24, 'REST', 't5'); B.text(c, 30, 36, 'MOTEL', 'dr4')
  R(c, 10, 62, 69, 74, 'OUT'); B.text(c, 14, 66, 'NO VACANCY', 'dr3')
  ground(c, cx - 16, cx + 16, 152)
  return done(c, 40, 152)
end
S.rg_gate = function()
  local c = new(128, 104); local cx = 64
  for _, x0 in ipairs({4, 104}) do B.wall(c, 'brick', x0, 16, x0 + 19, 96, 11); R(c, x0 - 2, 12, x0 + 21, 16, 's6'); px.hline(c, x0 - 2, x0 + 21, 12, 's7')
    px.ellipse(c, x0 + 9.5, 9, 4, 4, 's5'); P(c, x0 + 8, 7, 's7') end
  for x = 24, 103, 4 do local top = 30 + math.floor(math.abs(x - cx) / 6); px.vline(c, x, top, 96, 'bt3'); P(c, x, top - 1, 'bt5'); P(c, x - 1, top, 'bt4'); P(c, x + 1, top, 'bt2') end
  for _, y in ipairs({44, 92}) do px.hline(c, 24, 103, y, 'bt4'); px.hline(c, 24, 103, y + 1, 'OUT') end
  px.vline(c, cx, 30, 96, 'OUT')
  for i = 0, 60 do local a = math.pi * i / 60; local x = cx - math.cos(a) * 42; local y = 24 - math.sin(a) * 16; P(c, x, y, 'bt3'); P(c, x, y + 1, 'OUT') end   -- the arch over it
  B.text(c, cx - 17, 14, 'GREYFIELD', 'bt4')
  R(c, cx - 3, 60, cx + 3, 66, 'm3'); px.line(c, cx - 8, 58, cx + 8, 64, 'm2')                                                -- a chain and lock
  ground(c, 2, 125, 98)
  return done(c, 64, 100)
end
S.rg_swing = function()
  local c = new(100, 84); local cx = 50
  for _, x in ipairs({10, 88}) do px.line(c, x - 8, 78, x, 8, 'bt3'); px.line(c, x + 8, 78, x, 8, 'bt2'); px.line(c, x - 7, 78, x + 1, 8, 'bt4') end
  R(c, 8, 6, 92, 9, 'bt3'); px.hline(c, 8, 92, 6, 'bt4')
  for i, sx in ipairs({34, 62}) do local lean = i == 2 and 9 or 0
    px.line(c, sx - 6, 9, sx - 6 + lean, 56, 'm2'); px.line(c, sx + 6, 9, sx + 6 + lean, 56, 'm2')
    R(c, sx - 8 + lean, 56, sx + 8 + lean, 59, 'k4'); px.hline(c, sx - 8 + lean, sx + 8 + lean, 56, 'k6') end
  for x = cx - 22, cx + 22 do if H(x, 2) > .4 then P(c, x, 74, 'k2') end end                                                 -- worn bare earth under it
  ground(c, 2, 98, 79)
  return done(c, 50, 80)
end
local function marker(kind)
  local c = new(22, 34); local cx = 11
  if kind == 0 then post(c, cx - 1, cx + 1, 6, 30, KB, false); R(c, cx - 6, 11, cx + 6, 13, 'k4'); px.hline(c, cx - 6, cx + 6, 11, 'k6')
  elseif kind == 1 then post(c, cx - 1, cx + 1, 10, 30, KB, false)
    px.line(c, cx - 6, 13, cx + 6, 17, 'k5'); px.line(c, cx - 6, 14, cx + 6, 18, 'k3')                                       -- leaning, its arm slipped
  else for y = 12, 30 do for x = cx - 6, cx + 6 do if y > 12 + math.abs(x - cx) * .4 then P(c, x, y, band(c, ST, .7 - (x - cx + 6) / 20, 2, 6)) end end end
    px.hline(c, cx - 3, cx + 3, 20, 's3') end
  for x = cx - 6, cx + 6 do if H(x, kind) > .4 then px.vline(c, x, 28 - math.floor(H(x, kind + 1) * 4), 31, 'v3') end end
  ground(c, cx - 5, cx + 5, 32)
  return done(c, 11, 31)
end
S.rg_marker_0 = function() return marker(0) end
S.rg_marker_1 = function() return marker(1) end
S.rg_marker_2 = function() return marker(2) end

-- ------------------------------------------------------------------ Wickham's waterfront
S.wk_stall = function()
  local c = new(92, 84); local cx = 46
  post(c, 8, 11, 18, 80, KB, false); post(c, 80, 83, 18, 80, KB, false)
  B.awning(c, 4, 87, 10, B.DOORS.teal, {'t1', 't2', 't4', 't5'}); px.hline(c, 4, 87, 9, 'OUT')
  for y = 2, 9 do for x = 6, 85 do P(c, x, y, band(c, B.DOORS.teal, .6 - (y - 2) / 20, 2, 5)) end end
  for y = 44, 74 do for x = 10, 81 do P(c, x, y, band(c, WD, .52 - (x - 10) / 200 - (((y - 44) % 5 == 4) and .25 or 0), 2, 6)) end end
  R(c, 8, 38, 83, 44, 't5'); for x = 10, 81, 3 do P(c, x, 39 + (x % 2), 'g5') end                                          -- crushed ice on the counter
  for i = 0, 5 do local fx = 14 + i * 11; px.ellipse(c, fx + 4, 38, 5, 2, i % 2 == 0 and 'sl5' or 'sl6'); P(c, fx + 8, 38, 'sl3'); P(c, fx + 1, 37, 'OUT') end   -- fish laid out
  R(c, 58, 58, 76, 68, 'OUT'); B.text(c, 61, 60, 'FISH', 't5')
  ground(c, 6, 85, 80)
  return done(c, 46, 81)
end
S.wk_boat = function()
  local c = new(80, 36); local cx = 40
  for y = 6, 28 do local t = (y - 6) / 22; for x = 4, 75 do local u = (x - cx) / 36; local hw = math.sqrt(math.max(0, 1 - u * u)) * (11 - t * 2)
    if math.abs(y - 15) <= hw then local l = .74 - (y - 6) / 40 - u * .1; P(c, x, y, band(c, B.DOORS.teal, l, 1, 5)) end end end
  for x = 8, 72 do if px.get(c, x, 15) ~= 0 then P(c, x, 15, 'w5') end end                                                   -- the keel strip
  for k = 0, 5 do local x = 14 + k * 10; for y = 8, 22 do if px.get(c, x, y) ~= 0 and H(k, y) > .6 then P(c, x, y, 'w4') end end end   -- paint worn to the wood
  ground(c, 6, 74, 30)
  return done(c, 40, 33)
end
S.wk_nets = function()
  local c = new(78, 66)
  post(c, 4, 7, 6, 62, KB, true); post(c, 70, 73, 6, 62, KB, true); px.hline(c, 4, 73, 8, 'k4')
  for y = 10, 52 do for x = 9, 68 do local sag = math.floor(math.sin((x - 9) / 59 * math.pi) * 3)
    if ((x + y) % 5 == 0 or (x - y) % 5 == 0) and y > 10 + sag then P(c, x, y, 'w3') end end end
  for x = 12, 66, 9 do px.ellipse(c, x + .5, 53, 2, 2, 'dr4'); P(c, x, 52, 'dr5') end                                         -- floats
  ground(c, 3, 74, 63)
  return done(c, 39, 63)
end
S.wk_rack = function()
  local c = new(70, 60)
  post(c, 4, 7, 6, 56, KB, true); post(c, 62, 65, 6, 56, KB, true); rail(c, 2, 67, 8, 10, WD, 4)
  for i = 0, 6 do local x = 12 + i * 7; px.vline(c, x, 11, 15, 'w3')
    for y = 16, 32 do local w = math.floor(math.sin((y - 16) / 16 * math.pi) * 2.5); px.hline(c, x - w, x + w, y, (y < 24) and 'sl6' or 'sl5') end
    px.hline(c, x - 2, x + 2, 33, 'sl3'); P(c, x - 1, 18, 'OUT') end
  ground(c, 3, 66, 57)
  return done(c, 35, 57)
end
local function bell(night)
  local c = new(64, 104); local cx = 32
  B.stones(c, 10, 84, 53, 100, 41, 5, function() return .6 end); R(c, 8, 82, 55, 84, 's6'); px.hline(c, 8, 55, 82, 's7')
  post(c, 12, 16, 12, 82, KB, false); post(c, 47, 51, 12, 82, KB, false)
  for i = 0, 6 do px.hline(c, 6 + i, 57 - i, 10 - i, 'k' .. (i < 3 and 5 or 4)) end; R(c, 8, 10, 55, 13, 'k3')
  local by = 24
  for y = by, by + 30 do local t = (y - by) / 30; local hw = 6 + t * t * 12
    for x = math.floor(cx - hw), math.ceil(cx + hw) do local u = (x - cx) / hw; P(c, x, y, band(c, {'y1', 'y2', 'y3', 'r6'}, .55 - u * .4 + (t > .9 and -.3 or 0), 1, 4)) end end
  for x = cx - 18, cx + 18 do P(c, x, by + 31, 'k2') end; px.vline(c, cx, by - 6, by, 'm2')
  px.ellipse(c, cx + .5, by + 33, 2.5, 2.5, 'm2')
  px.vline(c, cx + 14, by + 20, 80, 'w5')                                                                                    -- the bell rope
  if night then px.ellipse(c, cx + .5, by + 20, 10, 8, 'y3') end
  return done(c, 32, 101)
end
S.wk_bell = function() return bell(false) end
S.wk_bell_n = function() return bell(true) end

-- ------------------------------------------------------------------ pumpkins and jack-o'-lanterns
local function pumpkin(w, h, ay, pale, face, seed)
  local c = new(w, h); local cx = w / 2; local cy = ay - (h - 6) * .45
  local rx, ry = w * .44, (h - 6) * .45
  local ramp = pale and {'t2', 't3', 't4', 't5', 'p1'} or {'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8'}
  for y = math.floor(cy - ry), math.ceil(cy + ry) do for x = math.floor(cx - rx), math.ceil(cx + rx) do
    local dx, dy = (x + .5 - cx) / rx, (y + .5 - cy) / ry
    if dx * dx + dy * dy <= 1 then local rib = math.abs(math.sin(dx * 3.6 * math.pi / 2))
      local l = .7 - dx * .35 - dy * .3 - (1 - rib) * .3; P(c, x, y, band(c, ramp, l, 1, #ramp)) end end end
  R(c, math.floor(cx) - 1, math.floor(cy - ry) - 4, math.floor(cx), math.floor(cy - ry), 'k4'); P(c, math.floor(cx) + 1, math.floor(cy - ry) - 3, 'v3')
  if face then local fy = math.floor(cy) - 2; local lit = 'y3'; local glow = 'y2'
    if face == 1 then for _, ex in ipairs({-4, 3}) do for k = 0, 2 do px.hline(c, math.floor(cx + ex - k + 1), math.floor(cx + ex + k), fy + 2 - k, lit) end end
      px.hline(c, math.floor(cx - 5), math.floor(cx + 5), fy + 5, lit); px.hline(c, math.floor(cx - 4), math.floor(cx + 4), fy + 6, glow); P(c, math.floor(cx - 2), fy + 5, 'r3'); P(c, math.floor(cx + 2), fy + 5, 'r3')
    elseif face == 2 then for _, ex in ipairs({-4, 3}) do R(c, math.floor(cx + ex), fy, math.floor(cx + ex + 1), fy + 2, lit) end
      for x = math.floor(cx - 5), math.floor(cx + 5) do P(c, x, fy + 5 + ((x % 2 == 0) and 0 or 1), lit) end
    else for _, ex in ipairs({-4, 3}) do px.line(c, cx + ex, fy, cx + ex + 1, fy + 2, lit); P(c, math.floor(cx + ex), fy + 1, glow) end   -- a long, wrong mouth
      px.line(c, cx - 6, fy + 6, cx + 6, fy + 4, lit); px.line(c, cx - 6, fy + 7, cx + 6, fy + 5, glow) end end
  ground(c, math.floor(cx - rx), math.ceil(cx + rx), ay + 1)
  return done(c, w / 2, ay)
end
S.pumpkin = function() return pumpkin(26, 22, 19, false, nil, 1) end
S.pumpkin_b = function() return pumpkin(24, 20, 17, true, nil, 2) end
S.jack = function() return pumpkin(26, 22, 19, false, 1, 3) end
S.jack_b = function() return pumpkin(26, 22, 19, false, 2, 4) end
S.jack_c = function() return pumpkin(26, 22, 19, false, 3, 5) end
S.jack_b_e = function() return pumpkin(26, 22, 19, true, 3, 6) end

S.anvil = function()
  local c = new(34, 26); local cx = 17
  R(c, cx - 5, 12, cx + 5, 20, 'bt2'); R(c, cx - 8, 20, cx + 8, 23, 'bt3')
  for y = 5, 11 do local t = (y - 5) / 6; for x = cx - 13 + math.floor((1 - t) * 0), cx + 10 do P(c, x, y, band(c, IR, y == 5 and .95 or .5 - (x - cx) / 60, 2, 6)) end end
  for i = 0, 4 do px.hline(c, cx - 13 - i, cx - 13, 6 + i // 2, 'bt3') end
  px.hline(c, cx - 12, cx + 9, 5, 'm4')
  return done(c, 17, 23)
end
S.ladder = function()
  local c = new(20, 34)
  for _, x in ipairs({3, 15}) do for y = 1, 31 do P(c, x, y, 'w5'); P(c, x + 1, y, 'w3') end end
  for y = 4, 30, 5 do px.hline(c, 4, 15, y, 'w6'); px.hline(c, 4, 15, y + 1, 'w2') end
  return done(c, 10, 31)
end

local names = {}
for k in pairs(S) do names[#names + 1] = k end
table.sort(names)
for _, name in ipairs(names) do
  if not only or only == name then
    local c, m = S[name](); if name:match('^tex') == nil then c.weather = {speck = .1, grime = .3, streak = name:match('wall') ~= nil or name == 'watertower' or name == 'memorial', round = .7, radius = 3, mottle = .28, cell = 5} end
    px.save(c, app.fs.joinPath(out, name .. '.png'))
    print(string.format('META %s %d %d %.1f %d %.2f - -', name, m.w, m.h, m.ax, m.ay, m.w / 32))
  end
end
