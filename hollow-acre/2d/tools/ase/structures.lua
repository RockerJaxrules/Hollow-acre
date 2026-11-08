-- The odd structures of the valley that aren't houses: the Route 9 motel, Lusk's filling station, the covered bridge,
-- the reservoir dam, the fire lookout, the swamp hut, the mine mouth, the greenhouse and the silo. Drawn with bkit.lua's
-- palette and materials so they sit with the houses. Same anchor rules: ax = width / 2, ay = 3 px above the bottom.
-- Writes <name>.png (+ _n.png for those lit at night) and prints META lines like buildings.lua.
local dir = app.params['dir'] or '.'
local out = app.params['out'] or dir
local only = app.params['only']
local px = dofile(app.fs.joinPath(dir, 'px.lua'))
local B = dofile(app.fs.joinPath(dir, 'bkit.lua')); B.init(px)

local function P(c, x, y, col) px.p(c, x, y, col) end
local function R(c, x0, y0, x1, y1, col) px.rect(c, x0, y0, x1, y1, col) end
local function H(a, b) return px.h(a, b) end
local function band(c, r, lt, lo, hi) return px.band(c, r, lt, lo, hi) end
local T = B.TRIMS.cream
local function shade(c, x0, y0, x1, y1) for y = y0, y1 do for x = x0, x1 do if (x + y) % 2 == 0 and px.get(c, x, y) ~= 0 then P(c, x, y, 'OUT2') end end end end
local function post(c, x, y0, y1, r) r = r or {'k2', 'k3', 'k4', 'k5'}       -- a squared timber post, lit left
  R(c, x, y0, x + 3, y1, r[3]); px.vline(c, x, y0, y1, r[4]); px.vline(c, x + 3, y0, y1, r[1]) end
local function plankrow(c, x0, x1, y0, y1, r, seed)                            -- horizontal boards (decks, floors)
  for y = y0, y1 do local row = (y - y0) // 4; local ry = (y - y0) % 4
    for x = x0, x1 do local col = ry == 3 and r[1] or band(c, r, .55 + (H(row, seed) - .5) * .25 - (ry == 0 and -.15 or 0), 2, #r)
      if ((x + row * 13) % 37) == 0 then col = r[1] end; P(c, x, y, col) end end end
local function batten(c, x0, y0, x1, y1, wr)                                   -- board and batten in a wall ramp
  for y = y0, y1 do for x = x0, x1 do local bx = (x - x0) % 8
    P(c, x, y, bx == 0 and wr[2] or (bx == 1 and wr[6] or band(c, wr, .6 - (x - x0) / ((x1 - x0) * 3.2) + (H(x // 8, y // 20) - .5) * .1, 3, 6))) end end end
local function concrete(c, x0, y0, x1, y1, seed, lt)                           -- poured concrete: form-work panels, tie holes, stains
  local S = B.WALLS.stone
  for y = y0, y1 do for x = x0, x1 do
    local v = (lt and lt(x, y) or .62) + (H(x // 3, y // 5 + seed) - .5) * .06
    local col = band(c, S, v, 3, 7)
    if (y - y0) % 34 == 33 or (x - x0) % 58 == 57 then col = S[3] end
    if (y - y0) % 34 == 0 then col = S[6] end
    if (y - y0) % 34 == 17 and (x - x0) % 29 == 14 then col = S[2] end
    P(c, x, y, col) end end
  for k = 0, (x1 - x0) // 9 do local sx = x0 + 3 + math.floor(H(k, seed + 7) * (x1 - x0 - 6)); local len = 10 + math.floor(H(k, seed + 9) * (y1 - y0) * .7)
    local sy = y0 + math.floor(H(k, seed + 3) * 20)
    for y = sy, math.min(y1, sy + len) do if H(sx, y // 4) > .2 then P(c, sx, y, H(k, 1) > .6 and 'r4' or S[3]) end end end
end

local S = {}

-- ------------------------------------------------------------------ the Route 9 motel: six rooms either side of the office, always NO VACANCY
S.rg_motel = function(night)
  local Wd, Hh = 356, 158; local c = px.new(Wd, Hh, B.PAL); local gy = Hh - 3
  local x0, x1 = 12, Wd - 13; local cx = Wd // 2
  local wallH = 58; local yW = gy - 9 - wallH
  local top = B.sideroof(c, x0, x1, yW, 30, 'tin', 21, false)
  -- the sign up on the roof, on two legs
  local sx0, sx1, sy0 = cx - 70, cx + 70, 8
  for _, lx in ipairs({sx0 + 14, sx1 - 18}) do post(c, lx, sy0 + 30, top + 6, {'m1', 'm2', 'm3', 'm4'}) end
  px.line(c, sx0 + 17, sy0 + 34, sx1 - 18, top + 2, 'm2'); px.line(c, sx1 - 15, sy0 + 34, sx0 + 15, top + 2, 'm2')
  R(c, sx0, sy0, sx1, sy0 + 20, 'bb3'); px.hline(c, sx0, sx1, sy0, 'bb5'); px.hline(c, sx0, sx1, sy0 + 1, 'bb4'); px.hline(c, sx0, sx1, sy0 + 20, 'bb1')
  R(c, sx0 + 3, sy0 + 3, sx1 - 3, sy0 + 17, 'bb2'); B.text(c, cx - 25, sy0 + 7, 'ROUTE 9 MOTEL', night and 'y3' or 't5', night and 'y1' or 'bb1')
  for x = sx0 + 4, sx1 - 4, 6 do P(c, x, sy0 + 2, night and 'y3' or 't3'); P(c, x, sy0 + 18, night and 'y3' or 't3') end   -- the bulbs round the board
  R(c, cx - 30, sy0 + 22, cx + 30, sy0 + 31, 'OUT'); B.text(c, cx - 24, sy0 + 24, 'NO', night and 'b3' or 'dr2'); B.text(c, cx - 12, sy0 + 24, 'VACANCY', night and 'b3' or 'dr3')
  -- the walls, the walkway roof on its posts, the rooms
  B.wall(c, 'mustard', x0, yW + 1, x1, gy - 10, 22)
  shade(c, x0, yW + 1, x1, yW + 5)
  local cy = gy - 10 - 52
  for y = cy - 6, cy do for x = x0 - 4, x1 + 4 do P(c, x, y, band(c, B.ROOFS.tin, (y - cy + 6) / 8 + .2, 2, 6)) end end
  px.hline(c, x0 - 4, x1 + 4, cy - 7, 'OUT'); px.hline(c, x0 - 4, x1 + 4, cy + 1, 'd2'); px.hline(c, x0 - 4, x1 + 4, cy + 2, 'OUT')
  shade(c, x0, cy + 3, x1, cy + 8)
  local rooms = {}
  for i = 0, 2 do rooms[#rooms + 1] = x0 + 10 + i * 40 end
  for i = 0, 2 do rooms[#rooms + 1] = cx + 42 + i * 40 end
  for i, rx in ipairs(rooms) do
    local dx0, dx1 = rx, rx + 15; local dt = gy - 10 - 38
    local col = ({'d', 'd', 'dr', 'd', 'd', 'dg'})[i]
    B.door(c, dx0, dx1, dt, gy - 10, {trim = T, col = B.DOORS[({d = 'teal', dr = 'red', dg = 'green'})[col]], night = false, scratches = (i == 5)})
    R(c, dx0 + 4, dt + 18, dx1 - 4, dt + 24, 'y1'); px.hline(c, dx0 + 4, dx1 - 4, dt + 18, 'y2'); B.text(c, dx0 + 6, dt + 19, tostring(i), 'OUT')   -- a brass number
    if i == 4 then R(c, dx1 - 3, dt, dx1, gy - 11, 'OUT'); px.vline(c, dx1 - 4, dt, gy - 11, 'k2') end          -- room 4 stands open an inch
    if i == 2 then R(c, dx1 - 4, dt + 22, dx1 - 2, dt + 27, 't5'); P(c, dx1 - 3, dt + 21, 'OUT') end           -- a do-not-disturb card
    if i == 6 then px.line(c, dx0 + 2, dt + 6, dx1 - 2, dt + 22, 'b2'); px.line(c, dx1 - 2, dt + 6, dx0 + 2, dt + 22, 'b2') end
    B.window(c, dx1 + 9, dt + 6, 14, 14, {trim = T, night = night and (i % 3 ~= 0), curtain = ({'t4', 'f2', 'v4'})[i % 3 + 1], boarded = (i == 6)})
  end
  -- the office in the middle: glass door, a big window, the sign, the bell on its bracket
  B.door(c, cx - 11, cx + 11, gy - 10 - 42, gy - 10, {trim = T, col = B.DOORS.teal, kind = 'glass', night = night})
  B.window(c, cx - 38, gy - 10 - 38, 18, 20, {trim = T, night = night, curtain = 't4'})
  B.window(c, cx + 20, gy - 10 - 38, 18, 20, {trim = T, night = night, curtain = 'f2', face = true})
  B.sign(c, cx, yW + 8, 'OFFICE')
  R(c, cx - 50, gy - 30, cx - 44, gy - 12, 't5'); px.vline(c, cx - 50, gy - 30, gy - 12, 't2'); B.text(c, cx - 49, gy - 27, 'I', 'd3')   -- the ice machine
  for _, xx in ipairs({x0 - 2, rooms[2] - 9, rooms[3] - 9, cx - 54, cx + 37, rooms[5] - 9, rooms[6] - 9, x1 - 2}) do post(c, xx, cy + 2, gy - 10, {'t2', 't3', 't4', 't5'}) end
  -- the walk in front: concrete with joints, an oil stain
  for y = gy - 9, gy do for x = x0 - 6, x1 + 6 do P(c, x, y, ((x - x0) % 24 == 0) and 's3' or band(c, B.WALLS.stone, .7 - (y - gy + 9) / 30, 4, 7)) end end
  px.hline(c, x0 - 6, x1 + 6, gy - 9, 's7'); px.ellipse(c, rooms[4] + 8, gy - 4, 8, 2, 'OUT2')
  if night then B.lantern(c, cx + 16, gy - 10 - 48, true) end
  px.outline(c, px.i(c, 'OUT'))
  return c, {w = Wd, h = Hh, ax = Wd / 2, ay = gy - 3}
end

-- ------------------------------------------------------------------ Lusk's filling station: the canopy over two pumps, the kiosk, the price sign
S.fuel = function(night)
  local Wd, Hh = 344, 218; local c = px.new(Wd, Hh, B.PAL); local gy = Hh - 3; local ax = Wd // 2
  local dcx = ax + 100                               -- the kiosk door: the game puts Lusk's door here (door_dx)
  -- the kiosk
  local kx0, kx1 = dcx - 76, dcx + 50; local wallH = 66; local yW = gy - 9 - wallH
  local py = yW - 18
  for y = py, yW do for x = kx0 - 2, kx1 + 2 do P(c, x, y, B.WALLS.white[(y - py) % 6 == 5 and 3 or 6]) end end
  R(c, kx0 - 5, py - 4, kx1 + 5, py - 1, T[4]); px.hline(c, kx0 - 5, kx1 + 5, py - 4, T[5]); px.hline(c, kx0 - 5, kx1 + 5, py - 1, T[2]); px.hline(c, kx0 - 5, kx1 + 5, py - 5, 'OUT')
  B.wall(c, 'white', kx0, yW + 1, kx1, gy - 10, 31)
  for y = gy - 26, gy - 10 do for x = kx0, kx1 do P(c, x, y, band(c, B.WALLS.brick, .6 - (x - kx0) / 400 + ((y - gy) % 4 == 0 and -.3 or 0), 2, 6)) end end
  px.hline(c, kx0, kx1, gy - 27, T[4])
  shade(c, kx0, yW + 1, kx1, yW + 4)
  B.sign(c, (kx0 + kx1) // 2, py + 3, "BAIT & ICE")
  -- the shop window: posters, a neon OPEN, cans stacked behind
  local wx0, wx1, wy0, wy1 = kx0 + 8, dcx - 18, yW + 14, gy - 32
  B.window(c, wx0, wy0, wx1 - wx0, wy1 - wy0, {trim = T, night = night, curtain = nil})
  for k = 0, 4 do local bx = wx0 + 4 + k * 9; R(c, bx, wy1 - 9, bx + 5, wy1 - 1, ({'dr3', 'd3', 'y1', 'dr4', 'sg4'})[k + 1]); px.hline(c, bx, bx + 5, wy1 - 9, 't5') end
  R(c, wx0 + 3, wy0 + 3, wx0 + 17, wy0 + 15, 't5'); B.text(c, wx0 + 4, wy0 + 5, 'BAIT', 'dr3'); R(c, wx0 + 22, wy0 + 3, wx0 + 35, wy0 + 12, 't4'); B.text(c, wx0 + 24, wy0 + 5, 'ICE', 'd2')
  R(c, wx0 + 40, wy0 + 2, wx0 + 58, wy0 + 20, 't5'); px.ellipse(c, wx0 + 49, wy0 + 9, 4, 4, 'OUT'); px.hline(c, wx0 + 43, wx0 + 55, wy0 + 16, 'OUT'); px.hline(c, wx0 + 43, wx0 + 53, wy0 + 18, 'OUT')  -- a MISSING poster
  B.door(c, dcx - 11, dcx + 11, gy - 10 - 44, gy - 10, {trim = T, col = B.DOORS.teal, kind = 'glass', night = night})
  B.window(c, dcx + 20, yW + 14, 22, 22, {trim = T, night = night, curtain = nil})
  R(c, dcx + 22, yW + 22, dcx + 39, yW + 29, 'OUT'); B.text(c, dcx + 23, yW + 23, 'OPEN', night and 'b3' or 'dr2')
  -- the ice chest out front
  R(c, dcx + 22, gy - 30, dcx + 46, gy - 11, 't5'); px.hline(c, dcx + 22, dcx + 46, gy - 30, 't4'); R(c, dcx + 22, gy - 33, dcx + 46, gy - 31, 'ww5')
  px.vline(c, dcx + 46, gy - 30, gy - 11, 't2'); B.text(c, dcx + 28, gy - 25, 'ICE', 'd2'); px.hline(c, dcx + 22, dcx + 46, gy - 11, 't2')
  -- the canopy, seen from above, on two posts, the pumps on their island
  local cx0, cx1 = 8, kx0 - 10; local ct = 54; local cf = ct + 22
  for y = ct, cf do for x = cx0, cx1 do P(c, x, y, band(c, B.WALLS.white, .78 - (y - ct) / 60 + ((x - cx0) % 30 == 0 and -.2 or 0), 3, 7)) end end
  px.hline(c, cx0, cx1, ct - 1, 'OUT'); px.hline(c, cx0, cx1, ct, 'ww7')
  for y = cf, cf + 14 do for x = cx0, cx1 do local st = ((y - cf) // 3) % 2
    P(c, x, y, (y >= cf + 3 and y <= cf + 11) and ((st == 0) and 'dr4' or 't5') or ((y < cf + 3) and 'dr3' or 'dr2')) end end
  R(c, (cx0 + cx1) // 2 - 26, cf + 2, (cx0 + cx1) // 2 + 26, cf + 12, 't5'); B.text(c, (cx0 + cx1) // 2 - 17, cf + 5, 'LUSK FUEL', 'dr2', 't3')
  px.hline(c, cx0, cx1, cf + 15, 'OUT')
  shade(c, cx0 + 2, cf + 16, cx1 - 2, cf + 22)
  for _, lx in ipairs({cx0 + 30, (cx0 + cx1) // 2, cx1 - 30}) do R(c, lx - 4, cf + 16, lx + 4, cf + 17, night and 'y3' or 'ww6') end
  for _, xx in ipairs({cx0 + 6, cx1 - 9}) do post(c, xx, cf + 16, gy - 12, {'ww3', 'ww5', 'ww6', 'ww7'}); R(c, xx - 2, gy - 14, xx + 5, gy - 10, 's5') end
  local ix0, ix1 = cx0 + 24, cx1 - 24
  R(c, ix0, gy - 17, ix1, gy - 10, 's6'); px.hline(c, ix0, ix1, gy - 17, 's7'); px.hline(c, ix0, ix1, gy - 10, 's3')
  for x = ix0, ix1 do if ((x - ix0) // 4) % 2 == 0 then P(c, x, gy - 12, 'y2'); P(c, x, gy - 11, 'y2') else P(c, x, gy - 12, 'OUT'); P(c, x, gy - 11, 'OUT') end end
  for k, pxm in ipairs({ix0 + 22, ix1 - 40}) do
    local p0, p1, pt = pxm, pxm + 18, gy - 62
    R(c, p0, pt, p1, gy - 18, 'd3'); px.vline(c, p0, pt, gy - 18, 'd5'); px.vline(c, p0 + 1, pt, gy - 18, 'd4'); px.vline(c, p1, pt, gy - 18, 'd1'); px.vline(c, p1 - 1, pt, gy - 18, 'd2')
    R(c, p0 + 3, pt + 6, p1 - 3, pt + 17, 't5'); px.hline(c, p0 + 3, p1 - 3, pt + 17, 't2'); B.text(c, p0 + 4, pt + 8, k == 1 and '089' or '000', 'OUT')
    R(c, p0 + 4, pt + 22, p1 - 4, pt + 26, 'OUT'); px.hline(c, p0 + 4, p1 - 4, pt + 30, 'd2')
    px.ellipse(c, (p0 + p1) / 2 + .5, pt - 6, 8, 6, 't5'); px.hline(c, p0 + 1, p1 - 1, pt - 6, 'dr3'); px.hline(c, p0 + 1, p1 - 1, pt - 5, 'dr4')
    if night then px.ellipse(c, (p0 + p1) / 2 + .5, pt - 7, 5, 3, 'y3') end
    px.vline(c, p1 + 2, pt + 10, pt + 30, 'OUT'); px.line(c, p1 + 2, pt + 30, p1 + 5, gy - 22, 'OUT'); R(c, p1 + 1, pt + 8, p1 + 4, pt + 13, 'm2')
    if k == 2 then px.ellipse(c, p1 + 6, gy - 13, 6, 1.5, 'OUT2') end
  end
  -- the price sign on its pole
  local sx = Wd - 16
  R(c, sx, 30, sx + 3, gy - 10, 'm3'); px.vline(c, sx, 30, gy - 10, 'm4'); px.vline(c, sx + 3, 30, gy - 10, 'm1')
  R(c, sx - 11, 22, sx + 14, 66, 't5'); R(c, sx - 11, 22, sx + 14, 30, 'dr3'); px.hline(c, sx - 11, sx + 14, 66, 't2'); px.vline(c, sx + 14, 22, 66, 't3')
  B.text(c, sx - 4, 24, 'GAS', 't5'); B.text(c, sx - 6, 34, '.89', 'OUT'); B.text(c, sx - 8, 44, 'BAIT', 'dr3'); B.text(c, sx - 6, 54, 'ICE', 'd2')
  if night then for x = sx - 10, sx + 13, 4 do P(c, x, 21, 'y3') end end
  R(c, Wd - 40, gy - 12, Wd - 2, gy - 9, 's5'); px.ellipse(c, Wd - 30, gy - 10, 5, 3, 'OUT')   -- a tyre against the kerb
  px.outline(c, px.i(c, 'OUT'))
  return c, {w = Wd, h = Hh, ax = ax, ay = gy - 3, door_dx = dcx - ax}
end

-- ------------------------------------------------------------------ the covered bridge over Marrow Creek: we see its long side; the road runs through it
S.cbridge = function(night)
  local Wd, Hh = 312, 228; local c = px.new(Wd, Hh, B.PAL); local gy = Hh - 6; local ax = Wd // 2
  local x0, x1 = 26, Wd - 27; local wb = gy - 52; local wt = wb - 58
  local top = B.sideroof(c, x0, x1, wt, 104, 'shingle', 41, false)
  for k = 0, 22 do local mx = x0 + math.floor(H(k, 3) * (x1 - x0)); local my = top + 8 + math.floor(H(k, 5) * 88)   -- moss on the shakes
    px.ellipse(c, mx, my, 3 + H(k, 7) * 4, 1.5 + H(k, 8), H(k, 9) > .5 and 'v2' or 'v3'); P(c, mx - 1, my - 1, 'v4') end
  batten(c, x0, wt + 1, x1, wb, B.WALLS.oxblood)
  shade(c, x0, wt + 1, x1, wt + 5)
  for _, ex in ipairs({x0, x1 - 5}) do R(c, ex, wt + 1, ex + 5, wb, T[3]); px.vline(c, ex, wt + 1, wb, T[4]); px.vline(c, ex + 5, wt + 1, wb, T[2]) end
  -- small windows (open, no glass), one with a rope hanging out of it
  for k = 0, 5 do if k ~= 2 and k ~= 3 then local wx = x0 + 22 + k * 42; local wy = wt + 16
    R(c, wx - 2, wy - 2, wx + 19, wy + 10, T[3]); px.hline(c, wx - 2, wx + 19, wy - 2, T[5]); px.hline(c, wx - 2, wx + 19, wy + 10, T[2])
    R(c, wx, wy, wx + 17, wy + 8, 'OUT'); px.hline(c, wx, wx + 17, wy + 8, 'k1')
    if not night then px.hline(c, wx + 2, wx + 15, wy + 6, 'k2') end
    if k == 4 then px.vline(c, wx + 9, wy + 4, wy + 34, 'w4'); px.vline(c, wx + 10, wy + 4, wy + 34, 'w2'); px.ellipse(c, wx + 9.5, wy + 36, 2.5, 2, 'w4') end end end
  local sw = #'MARROW CREEK 1871' * 4 + 9; B.sign(c, ax, wt + 18, 'MARROW CREEK 1871')
  -- the deck beam and the truss underneath, in its own shadow; the water under it is the game's
  R(c, x0 - 4, wb + 1, x1 + 4, wb + 7, 'k3'); px.hline(c, x0 - 4, x1 + 4, wb + 1, 'k5'); px.hline(c, x0 - 4, x1 + 4, wb + 7, 'k1')
  for x = x0 + 4, x1 - 4, 18 do px.line(c, x, wb + 8, x + 9, wb + 22, 'k2'); px.line(c, x + 18, wb + 8, x + 9, wb + 22, 'k2') end
  px.hline(c, x0 + 4, x1 - 4, wb + 22, 'k2')
  shade(c, x0 + 30, wb + 23, x1 - 30, wb + 40)
  -- the stone abutments at each end, the road boards running onto them, a lamp on each portal
  for _, side in ipairs({-1, 1}) do
    local ax0 = side < 0 and 0 or x1 - 18; local ax1 = side < 0 and x0 + 18 or Wd - 1
    B.stones(c, ax0, wb - 2, ax1, gy, 50 + side, 7, function(x, y) return .66 - (y - wb) / 200 - (side > 0 and .1 or 0) end)
    px.hline(c, ax0, ax1, wb - 3, 's7')
    plankrow(c, ax0, ax1, wb - 10, wb - 3, {'w2', 'w3', 'w4', 'w5', 'w6'}, 9 + side)
    local lx = side < 0 and x0 - 8 or x1 + 8
    B.lantern(c, lx, wt + 10, night)
  end
  px.outline(c, px.i(c, 'OUT'))
  return c, {w = Wd, h = Hh, ax = ax, ay = gy - 3}
end

-- ------------------------------------------------------------------ the reservoir dam: a curtain of concrete, the spillway pouring out of the middle
S.rg_dam = function(night)
  local Wd, Hh = 568, 180; local c = px.new(Wd, Hh, B.PAL); local gy = Hh - 3; local ax = Wd // 2
  local x0, x1 = 4, Wd - 5; local ft = 30
  concrete(c, x0, ft, x1, gy - 6, 61, function(x, y) return .7 - (y - ft) / 500 - math.abs(x - ax) / 4000 end)
  -- buttresses: lit face, shaded face, a cap
  for k = -3, 3 do if k ~= 0 then local bx = ax + k * 82
    for y = ft + 4, gy - 6 do for x = bx - 8, bx + 8 do P(c, x, y, x < bx - 2 and band(c, B.WALLS.stone, .86, 3, 7) or (x > bx + 3 and band(c, B.WALLS.stone, .34, 2, 6) or band(c, B.WALLS.stone, .66, 3, 7))) end end
    px.vline(c, bx - 9, ft + 4, gy - 6, 's2'); px.vline(c, bx + 9, ft + 4, gy - 6, 's2'); R(c, bx - 10, ft + 2, bx + 10, ft + 5, 's6') end end
  -- the walkway along the top with its railing
  R(c, x0, ft - 12, x1, ft, 's6'); px.hline(c, x0, x1, ft - 12, 's7'); px.hline(c, x0, x1, ft, 's3'); px.hline(c, x0, x1, ft + 1, 'OUT2')
  for x = x0 + 2, x1 - 2, 12 do px.vline(c, x, ft - 24, ft - 12, 'm2'); P(c, x + 1, ft - 23, 'm4') end
  px.hline(c, x0, x1, ft - 24, 'm3'); px.hline(c, x0, x1, ft - 23, 'm1'); px.hline(c, x0, x1, ft - 17, 'm2')
  -- the spillway: a notch in the crest, water pouring down in ribbons, foam where it lands
  local s0, s1 = ax - 44, ax + 44
  R(c, s0 - 4, ft - 24, s1 + 4, ft + 6, 's2')
  for y = ft - 22, gy - 8 do for x = s0, s1 do local u = (x - s0) / (s1 - s0)
    local rib = (x + math.floor(y * .15) + math.floor(H(x // 3, 1) * 9)) % 7
    local col = rib == 0 and 'd5' or (rib == 1 and 'g6' or (rib < 4 and 'g5' or 'd4'))
    if y < ft - 14 then col = (x % 5 == 0) and 'g6' or 'd3' end
    if H(x, y // 3) > .93 then col = 't5' end
    if u < .04 or u > .96 then col = 'd2' end
    P(c, x, y, col) end end
  for k = 0, 24 do local fx = s0 - 10 + math.floor(H(k, 11) * (s1 - s0 + 20)); px.ellipse(c, fx, gy - 9 + H(k, 12) * 4, 4 + H(k, 13) * 5, 2.5, H(k, 14) > .4 and 't5' or 'g6') end
  -- the plaque, the flood marks someone has kept carving, a pipe dribbling rust
  local plx = ax - 160
  R(c, plx - 2, ft + 22, plx + 92, ft + 38, 'OUT'); R(c, plx, ft + 24, plx + 90, ft + 36, 'y1'); px.hline(c, plx, plx + 90, ft + 24, 'y2')
  B.text(c, plx + 4, ft + 27, 'MARROW RESERVOIR', 'OUT'); B.text(c, plx + 70, ft + 27, '1931', 'OUT')
  local mx = ax + 120
  for i, yr in ipairs({'1931', '1952', '1974', '1999', '2024'}) do local my = gy - 22 - i * 16
    px.hline(c, mx, mx + 22, my, 's1'); B.text(c, mx + 26, my - 2, yr, i == 5 and 'b2' or 's2') end
  px.ellipse(c, ax + 210, gy - 40, 6, 6, 'm1'); px.ellipse(c, ax + 210, gy - 40, 4, 4, 'OUT'); for y = gy - 36, gy - 8 do P(c, ax + 210 + (y % 3 == 0 and 1 or 0), y, 'r4') end
  -- moss and weeds along the foot
  for x = x0, x1 do if H(x // 2, 5) > .45 then px.vline(c, x, gy - 6 - math.floor(H(x, 6) * 6), gy - 6, H(x, 7) > .5 and 'v3' or 'v2') end end
  R(c, x0, gy - 5, x1, gy, 's3'); px.hline(c, x0, x1, gy - 5, 's4')
  px.outline(c, px.i(c, 'OUT'))
  return c, {w = Wd, h = Hh, ax = ax, ay = gy - 3}
end

-- ------------------------------------------------------------------ the fire lookout: a timber lattice, stairs, a glass cab with someone in it
S.rg_tower = function(night)
  local Wd, Hh = 128, 344; local c = px.new(Wd, Hh, B.PAL); local gy = Hh - 3; local ax = Wd // 2
  local cabB = 100; local legB = gy - 6
  local KR = {'k1', 'k2', 'k3', 'k4', 'k5'}
  -- back legs (dark), stairs inside, then the front legs and bracing
  for _, l in ipairs({{ax - 34, ax - 20}, {ax + 34, ax + 20}}) do px.line(c, l[1], legB, l[2], cabB, 'k1'); px.line(c, l[1] + 1, legB, l[2] + 1, cabB, 'k2') end
  local fl = 0
  for y = legB - 8, cabB + 18, -26 do local w = 14; local lx = ax - 12 + (fl % 2) * 2
    for k = 0, 12 do local sy = y - k * 2; local sx = (fl % 2 == 0) and (ax - 14 + k * 2) or (ax + 14 - k * 2)
      R(c, sx - 1, sy, sx + 3, sy, 'w4'); P(c, sx + 3, sy + 1, 'w2') end
    px.line(c, (fl % 2 == 0) and ax - 15 or ax + 15, y, (fl % 2 == 0) and ax + 11 or ax - 11, y - 26, 'k3')
    R(c, ax - 16, y - 27, ax + 16, y - 25, 'w3'); fl = fl + 1 end
  local function legx(side, y) local t = (legB - y) / (legB - cabB); return ax + side * (50 - 22 * t) end
  for _, side in ipairs({-1, 1}) do
    for y = cabB, legB do local x = math.floor(legx(side, y)); R(c, x - 2, y, x + 2, y, side < 0 and 'k4' or 'k3'); P(c, x - 2, y, side < 0 and 'k5' or 'k4'); P(c, x + 2, y, 'k1') end
    R(c, math.floor(legx(side, legB)) - 5, legB, math.floor(legx(side, legB)) + 5, legB + 3, 's5'); px.hline(c, math.floor(legx(side, legB)) - 5, math.floor(legx(side, legB)) + 5, legB, 's7')
  end
  local lv = {}; for y = legB - 2, cabB + 10, -46 do lv[#lv + 1] = y end
  for i = 1, #lv - 1 do local ya, yb = lv[i], lv[i + 1]
    px.line(c, legx(-1, ya), ya, legx(1, yb), yb, 'k3'); px.line(c, legx(1, ya), ya, legx(-1, yb), yb, 'k3')
    px.line(c, legx(-1, ya), ya - 1, legx(1, yb), yb - 1, 'k4')
    R(c, math.floor(legx(-1, yb)), yb, math.floor(legx(1, yb)), yb + 2, 'k3'); px.hline(c, math.floor(legx(-1, yb)), math.floor(legx(1, yb)), yb, 'k5') end
  -- the catwalk, the cab, the roof
  R(c, ax - 40, cabB - 2, ax + 40, cabB + 3, 'w4'); px.hline(c, ax - 40, ax + 40, cabB - 2, 'w6'); px.hline(c, ax - 40, ax + 40, cabB + 3, 'w2')
  shade(c, ax - 36, cabB + 4, ax + 36, cabB + 8)
  local c0, c1, ct = ax - 30, ax + 30, cabB - 48
  B.wall(c, 'honey', c0, ct, c1, cabB - 3, 71)
  local panes = 4; local pw = (c1 - c0 - 6) // panes
  for k = 0, panes - 1 do local wx = c0 + 4 + k * pw
    R(c, wx, ct + 6, wx + pw - 3, ct + 26, (night and 'y2') or ((k % 2 == 0) and 'g3' or 'g2'))
    if not night then px.line(c, wx + 1, ct + 12, wx + 5, ct + 8, 'g5') end
    px.hline(c, wx - 1, wx + pw - 2, ct + 5, T[4]); px.hline(c, wx - 1, wx + pw - 2, ct + 27, T[2]); px.vline(c, wx - 1, ct + 5, ct + 27, T[3]) end
  local fx = c0 + 4 + 2 * pw + 4                                              -- someone standing at the glass, looking out at you
  px.ellipse(c, fx + 4, ct + 13, 3, 3.5, 'OUT'); R(c, fx + 1, ct + 16, fx + 7, ct + 26, 'OUT')
  if night then P(c, fx + 3, ct + 12, 'b3'); P(c, fx + 5, ct + 12, 'b3') end
  for x = ax - 40, ax + 40, 5 do px.vline(c, x, cabB - 14, cabB - 3, 'k3') end
  px.hline(c, ax - 40, ax + 40, cabB - 15, 'k4'); px.hline(c, ax - 40, ax + 40, cabB - 14, 'k2'); px.hline(c, ax - 40, ax + 40, cabB - 9, 'k3')
  local rt = ct - 34
  for y = rt, ct do local t = (y - rt) / (ct - rt); local hw = 4 + t * 36
    for x = math.floor(ax - hw), math.ceil(ax + hw) do P(c, x, y, B.roofpx(c, 'shingle', x, y, rt, x < ax and 1 or 0, 72)) end end
  px.hline(c, ax - 40, ax + 40, ct + 1, 'OUT'); shade(c, c0, ct + 1, c1, ct + 4)
  px.vline(c, ax, rt - 16, rt, 'm2'); P(c, ax, rt - 17, 'm4'); px.hline(c, ax - 3, ax + 3, rt - 10, 'm2')
  px.outline(c, px.i(c, 'OUT'))
  return c, {w = Wd, h = Hh, ax = ax, ay = gy - 3}
end

-- ------------------------------------------------------------------ the swamp hut on stilts: reed thatch, a ladder, things hung up to dry
S.rg_hut = function(night)
  local Wd, Hh = 160, 182; local c = px.new(Wd, Hh, B.PAL); local gy = Hh - 3; local ax = Wd // 2
  local deck = gy - 44; local x0, x1 = ax - 46, ax + 46; local yW = deck - 44
  local topY = B.frontgable(c, {gablewin = 'vent', moss = 1.6}, x0, x1, yW, 'log', 'thatch', T, 91)
  for k = 0, 16 do local mx = ax - 40 + math.floor(H(k, 2) * 80); local my = (topY or 20) + 10 + math.floor(H(k, 4) * (yW - (topY or 20) - 10))
    px.ellipse(c, mx, my, 2 + H(k, 6) * 4, 1 + H(k, 8) * 1.5, H(k, 9) > .5 and 'v2' or 'v3') end
  B.wall(c, 'log', x0, yW + 1, x1, deck - 1, 92)
  shade(c, x0, yW + 1, x1, yW + 4)
  B.door(c, ax - 10, ax + 10, deck - 36, deck - 1, {trim = B.TRIMS.black, col = B.DOORS.oak, night = night, scratches = true})
  B.window(c, ax + 20, yW + 12, 16, 14, {trim = B.TRIMS.black, night = night, curtain = nil})
  B.window(c, ax - 36, yW + 12, 16, 14, {trim = B.TRIMS.black, night = false, boarded = true})
  -- the deck, its rail, the stilts in the mud, the ladder
  plankrow(c, x0 - 14, x1 + 14, deck, deck + 6, {'w2', 'w3', 'w4', 'w5'}, 93)
  px.hline(c, x0 - 14, x1 + 14, deck + 7, 'OUT'); shade(c, x0 - 10, deck + 8, x1 + 10, deck + 14)
  for _, sx in ipairs({x0 - 10, x0 + 24, x1 - 26, x1 + 8}) do post(c, sx, deck + 7, gy - 4, {'k1', 'k2', 'k3', 'k4'})
    for y = gy - 14, gy - 4 do if (y + sx) % 3 ~= 0 then P(c, sx + (y % 2), y, 'v2') end end
    px.ellipse(c, sx + 2, gy - 3, 6, 2, 'k1') end
  for x = x0 - 14, x1 + 14 do if x % 4 == 0 then px.vline(c, x, deck - 10, deck - 1, 'k3') end end
  px.hline(c, x0 - 14, x1 + 14, deck - 11, 'k4'); px.hline(c, x0 - 14, x1 + 14, deck - 10, 'k2')
  local lx = x1 + 2
  for _, rx in ipairs({lx, lx + 9}) do px.line(c, rx, deck + 6, rx + 4, gy - 3, 'w4') end
  for y = deck + 12, gy - 6, 6 do local t = (y - deck) / (gy - deck); px.hline(c, math.floor(lx + t * 4), math.floor(lx + 9 + t * 4), y, 'w5') end
  -- a net over the rail; little bones strung from the eave, turning
  for x = x0 - 12, x0 + 20 do for y = deck - 10, deck + 2 do if (x + y) % 4 == 0 or (x - y) % 4 == 0 then P(c, x, y, 'ww3') end end end
  for k = 0, 4 do local bx = x0 + 6 + k * 18; local by = yW + 2 + (k % 2) * 4
    px.vline(c, bx, yW + 1, by + 4, 'ww3'); R(c, bx - 1, by + 5, bx + 1, by + 7, 'p1'); P(c, bx, by + 8, 'p2'); P(c, bx - 1, by + 9, 'p1'); P(c, bx + 1, by + 9, 'p1') end
  B.lantern(c, ax + 14, deck - 34, night)
  px.vline(c, ax - 30, (topY or 20) + 20, (topY or 20) + 34, 'm2'); R(c, ax - 33, (topY or 20) + 14, ax - 27, (topY or 20) + 20, 'm3')   -- a stovepipe
  px.outline(c, px.i(c, 'OUT'))
  return c, {w = Wd, h = Hh, ax = ax, ay = gy - 3, chim = {ax - 30 - ax, (topY or 20) + 12 - (gy - 3)}}
end

-- ------------------------------------------------------------------ the mine mouth: timbers in the rock, rails going in, boards half across
S.mineportal = function(night)
  local Wd, Hh = 84, 90; local c = px.new(Wd, Hh, B.PAL); local gy = Hh - 3; local ax = Wd // 2
  -- the rock face round it
  for y = 10, gy - 4 do for x = 2, Wd - 3 do local d = ((x - ax) / 40) ^ 2 + ((y - gy) / (gy - 8)) ^ 2
    if d < 1 then local n = H(x // 5 + (y // 4) * 3, 1); local v = .55 - (x - 2) / 260 + (n - .5) * .3 - (y < 20 and -.1 or 0)
      P(c, x, y, band(c, B.WALLS.stone, v, 2, 6)); if H(x // 5, y // 4) > .86 and (x + y) % 3 == 0 then P(c, x, y, 's1') end end end end
  for k = 0, 9 do local vx = 4 + math.floor(H(k, 3) * (Wd - 8)); px.vline(c, vx, 12 + math.floor(H(k, 4) * 20), 30 + math.floor(H(k, 5) * 30), H(k, 6) > .5 and 'v3' or 'v2') end
  -- the opening and its timbers
  local o0, o1, ot = ax - 16, ax + 16, gy - 44
  R(c, o0, ot, o1, gy - 4, 'OUT')
  for y = ot + 4, gy - 6, 9 do px.hline(c, o0 + 4, o1 - 4, y, 'k1') end
  if night then P(c, ax - 3, ot + 22, 'y3'); P(c, ax + 2, ot + 22, 'y3') end
  post(c, o0 - 5, ot - 2, gy - 4, {'k2', 'k3', 'k4', 'k5'}); post(c, o1 + 2, ot - 2, gy - 4, {'k2', 'k3', 'k4', 'k5'})
  R(c, o0 - 8, ot - 8, o1 + 8, ot - 2, 'k3'); px.hline(c, o0 - 8, o1 + 8, ot - 8, 'k5'); px.hline(c, o0 - 8, o1 + 8, ot - 2, 'k1')
  shade(c, o0, ot - 1, o1, ot + 3)
  B.sign(c, ax, ot - 22, 'MINE')
  -- two boards nailed across, one hanging loose, with marks from the inside
  R(c, o0 - 4, ot + 14, o1 + 4, ot + 18, 'w5'); px.hline(c, o0 - 4, o1 + 4, ot + 14, 'w6'); px.hline(c, o0 - 4, o1 + 4, ot + 18, 'w2')
  for k = 0, 2 do px.line(c, o0 + 4 + k * 4, ot + 15, o0 + 6 + k * 4, ot + 18, 'OUT') end
  px.line(c, o1 + 2, ot + 26, o0 + 10, ot + 34, 'w5'); px.line(c, o1 + 2, ot + 27, o0 + 10, ot + 35, 'w2')
  -- rails running out of the dark
  for y = gy - 6, gy - 1 do local t = (y - (gy - 6)) / 6; local w = 8 + t * 6
    P(c, math.floor(ax - w), y, 'm3'); P(c, math.floor(ax + w), y, 'm3') end
  for y = gy - 5, gy - 1, 2 do px.hline(c, ax - 12, ax + 12, y, 'k2') end
  B.lantern(c, o1 + 10, ot + 4, night)
  px.outline(c, px.i(c, 'OUT'))
  return c, {w = Wd, h = Hh, ax = ax, ay = gy - 3}
end

-- ------------------------------------------------------------------ the greenhouse: a brick knee wall, white glazing bars, a glass roof, plants pressed to the panes
S.greenhouse = function(night)
  local Wd, Hh = 184, 172; local c = px.new(Wd, Hh, B.PAL); local gy = Hh - 3; local ax = Wd // 2
  local x0, x1 = 10, Wd - 11; local knee = gy - 26; local eave = gy - 84; local ridge = 18
  -- the roof glass seen from above: two slopes, bars running up to the ridge
  for y = ridge, eave do local t = (y - ridge) / (eave - ridge)
    for x = x0 - 4, x1 + 4 do local lit = x < ax
      local v = night and (((x // 3 + y // 5) % 5 == 0) and 'g2' or 'g1') or ((((x - x0) + (y - ridge)) % 38 < 6) and 'g5' or (lit and 'g3' or 'g2'))
      if (x - x0) % 16 == 0 or (y - ridge) % 22 == 0 then v = 'ww6' end
      if (x - x0) % 16 == 1 then v = 'ww4' end
      P(c, x, y, v) end end
  R(c, x0 - 6, ridge - 4, x1 + 6, ridge - 1, 'ww6'); px.hline(c, x0 - 6, x1 + 6, ridge - 4, 'ww7'); px.hline(c, x0 - 6, x1 + 6, ridge - 1, 'ww3')
  for x = x0, x1, 12 do R(c, x, ridge - 7, x + 1, ridge - 5, 'ww5') end
  R(c, x0 - 5, eave + 1, x1 + 5, eave + 4, 'ww6'); px.hline(c, x0 - 5, x1 + 5, eave + 4, 'ww3'); px.hline(c, x0 - 5, x1 + 5, eave + 5, 'OUT')
  -- the front glass wall with the plants behind it
  for y = eave + 6, knee - 1 do for x = x0, x1 do
    local v = night and 'g1' or (((x - x0 + (y - eave)) % 30 < 4) and 'g5' or 'g3')
    local pl = H(x // 6, 7) * 26; if y > knee - 6 - pl then local n = H(x // 3, y // 3); v = n > .8 and (night and 'v2' or 'v5') or (n > .3 and (night and 'v1' or 'v3') or (night and 'v1' or 'v2'))
      if n > .965 then v = night and 'dr2' or 'dr4' end end
    if night and H(x // 9, y // 9) > .93 then v = 'y2' end
    P(c, x, y, v) end end
  for x = x0, x1 + 1, 14 do R(c, x, eave + 5, x + 1, knee, 'ww6'); px.vline(c, x + 2, eave + 5, knee, 'ww3') end
  px.hline(c, x0, x1, eave + 30, 'ww6'); px.hline(c, x0, x1, eave + 31, 'ww3')
  B.wall(c, 'brick', x0 - 2, knee, x1 + 2, gy - 10, 81)
  R(c, x0 - 4, knee - 2, x1 + 4, knee, 's6'); px.hline(c, x0 - 4, x1 + 4, knee - 2, 's7')
  B.stones(c, x0 - 4, gy - 9, x1 + 4, gy, 82, 5, function(x, y) return .6 end)
  -- the door: glass in a white frame, a step
  local d0, d1, dt = ax - 12, ax + 12, gy - 60
  R(c, d0 - 3, dt - 3, d1 + 3, gy - 10, 'ww6'); R(c, d0, dt, d1, gy - 10, night and 'y1' or 'g3'); px.vline(c, ax, dt, gy - 10, 'ww5'); px.hline(c, d0, d1, dt + 22, 'ww5')
  if not night then px.line(c, d0 + 2, dt + 8, d0 + 7, dt + 3, 'g5') end
  R(c, d1 - 4, dt + 28, d1 - 2, dt + 30, 'y2'); R(c, d0 - 6, gy - 9, d1 + 6, gy - 6, 's6')
  px.outline(c, px.i(c, 'OUT'))
  return c, {w = Wd, h = Hh, ax = ax, ay = gy - 3}
end

-- ------------------------------------------------------------------ the silo: concrete staves, iron hoops, a domed cap, the ladder in its cage
S.silo = function(night)
  local Wd, Hh = 60, 194; local c = px.new(Wd, Hh, B.PAL); local gy = Hh - 3; local ax = Wd // 2
  local r = 22; local top = 40
  local St = B.WALLS.stone
  for y = top, gy - 4 do for x = ax - r, ax + r do local u = (x - ax) / r
    local lt = .72 - u * .42 - u * u * .2 + ((u < -.3 and u > -.5) and .12 or 0)
    local row = (y - top) // 6; local ry = (y - top) % 6; local off = (row % 2) * 4
    local v = band(c, St, lt + (ry == 0 and .08 or 0) + (H((x + off) // 8, row) - .5) * .08, 2, 7)
    if ry == 5 then v = St[math.max(1, math.floor(2 + (1 - u) * 1.5))] end
    P(c, x, y, v) end end
  for y = top + 14, gy - 10, 26 do for x = ax - r, ax + r do P(c, x, y, x < ax + r * .4 and 'm3' or 'm1') end
    for x = ax - r, ax + r do if H(x, y) > .8 then for yy = y + 1, y + 2 + math.floor(H(x, y + 1) * 9) do P(c, x, yy, 'r4') end end end end
  for y = top - 22, top do local t = (top - y) / 22; local hw = r * math.sqrt(math.max(0, 1 - t * t))
    for x = math.floor(ax - hw), math.ceil(ax + hw) do local u = (x - ax) / r
      P(c, x, y, band(c, B.ROOFS.scallop, .7 - u * .45 - t * .1, 2, 7)) end end
  px.hline(c, ax - r - 1, ax + r + 1, top, 'r2'); px.hline(c, ax - r - 1, ax + r + 1, top + 1, 'OUT2')
  R(c, ax - 3, top - 26, ax + 3, top - 22, 'm2')
  -- the ladder cage up the right side
  local lx = ax + r - 8
  for y = top + 4, gy - 30 do P(c, lx, y, 'm2'); P(c, lx + 6, y, 'm1') end
  for y = top + 6, gy - 30, 4 do px.hline(c, lx, lx + 6, y, 'm3') end
  for y = top + 8, gy - 40, 10 do px.line(c, lx - 2, y, lx + 9, y, 'm1') end
  -- a hatch at the bottom, not quite shut
  R(c, ax - 8, gy - 30, ax + 4, gy - 8, 'k3'); px.vline(c, ax - 8, gy - 30, gy - 8, 'k5'); R(c, ax + 2, gy - 29, ax + 4, gy - 9, 'OUT')
  for k = 0, 2 do px.line(c, ax - 5 + k * 3, gy - 24, ax - 4 + k * 3, gy - 14, 'k1') end
  B.stones(c, ax - r - 3, gy - 6, ax + r + 3, gy, 83, 5, function(x, y) return .55 end)
  px.outline(c, px.i(c, 'OUT'))
  return c, {w = Wd, h = Hh, ax = ax, ay = gy - 3}
end

local LIT = {rg_motel = true, fuel = true, cbridge = true, greenhouse = true, rg_tower = true, rg_hut = true, mineportal = true}
local names = {}
for k in pairs(S) do names[#names + 1] = k end
table.sort(names)
for _, name in ipairs(names) do
  if not only or only == name then
    for _, night in ipairs(LIT[name] and {false, true} or {false}) do
      local c, m = S[name](night)
      local fn = name .. (night and '_n' or '')
      px.save(c, app.fs.joinPath(out, fn .. '.png'))
      local extra = m.door_dx and string.format(' door_dx=%d', m.door_dx) or ''
      print(string.format('META %s %d %d %.1f %d %.2f %s -%s', fn, m.w, m.h, m.ax, m.ay, m.w / 32,
        m.chim and string.format('%d,%d', math.floor(m.chim[1]), math.floor(m.chim[2])) or '-', extra))
    end
  end
end
