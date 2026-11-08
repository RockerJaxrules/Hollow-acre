-- Three style samples for approval: a front-gable cottage (day and night), an autumn maple, a stone well.
-- Stardew Valley's look (chunky readable forms, every plank/shingle/stone drawn and outlined, warm hue-shifted colour,
-- dark plum outlines, life clustered round things) with Hollow Acre's tone (autumn rot, small wrong details).
local dir = app.params['dir'] or '.'
local px = dofile(app.fs.joinPath(dir, 'px.lua'))
local out = app.params['out'] or dir
local P, R, LINE, H = px.p, px.rect, px.line, px.h

local PAL = {
 {'OUT','#1d1018'},{'OUT2','#2c1820'},
 {'r1','#2e1424'},{'r2','#4f1a28'},{'r3','#75242b'},{'r4','#9a3530'},{'r5','#bd4f35'},{'r6','#d9733f'},{'r7','#eca055'},{'r8','#f6c779'},
 {'w1','#2a1824'},{'w2','#47292b'},{'w3','#6a3f30'},{'w4','#8d5937'},{'w5','#ad7542'},{'w6','#c99352'},{'w7','#e0b467'},
 {'t1','#5c4544'},{'t2','#8b7362'},{'t3','#bba78a'},{'t4','#e2d4b0'},{'t5','#f6ecd2'},
 {'s1','#231b2b'},{'s2','#382f42'},{'s3','#51485a'},{'s4','#6d6473'},{'s5','#8c8389'},{'s6','#ada395'},{'s7','#cfc5ac'},
 {'g1','#121628'},{'g2','#1d2742'},{'g3','#2c4262'},{'g4','#46698a'},{'g5','#86bccc'},{'g6','#d2eef0'},
 {'d1','#10202a'},{'d2','#1a3438'},{'d3','#284c4c'},{'d4','#3c6a62'},{'d5','#5a8c7a'},
 {'v1','#172219'},{'v2','#233a25'},{'v3','#34552b'},{'v4','#4f7432'},{'v5','#76943c'},{'v6','#a7b453'},
 {'f1','#4a1626'},{'f2','#7e2434'},{'f3','#b0464a'},{'f4','#d77a68'},
 {'m1','#1e1e2a'},{'m2','#383a4a'},{'m3','#5e6274'},{'m4','#9298a8'},
 {'y1','#b8742a'},{'y2','#e8a83e'},{'y3','#fbe08a'},
 {'b1','#4e0a12'},{'b2','#84141c'},{'b3','#b02a2a'},
 {'p1','#c8b8b0'},{'p2','#ece2da'},
 {'k1','#22141e'},{'k2','#3a2228'},{'k3','#573430'},{'k4','#77493a'},{'k5','#9a6448'},{'k6','#b8835a'},
 {'L1','#2a0e22'},{'L2','#4c1426'},{'L3','#7a1e2a'},{'L4','#a8302c'},{'L5','#cf5130'},{'L6','#e87c38'},{'L7','#f6aa48'},{'L8','#fdd27a'},
}
local ROOF = {'r1','r2','r3','r4','r5','r6','r7','r8'}
local WOOD = {'w1','w2','w3','w4','w5','w6','w7'}
local STONE = {'s1','s2','s3','s4','s5','s6','s7'}
local BARK = {'k1','k2','k3','k4','k5','k6'}
local LEAF = {'L1','L2','L3','L4','L5','L6','L7','L8'}
local IVY = {'v1','v2','v3','v4','v5','v6'}

-- chunky outlined stones in courses (foundations, chimneys, the well)
local function stones(c, x0, y0, x1, y1, seed, rowh, lightf)
  local y = y0; local row = 0
  while y <= y1 do
    local h = math.min(rowh, y1 - y + 1); local x = x0 - math.floor(H(row, seed) * 7)
    while x <= x1 do
      local w = 8 + math.floor(H(x, row + seed) * 7)
      local xa, xb = math.max(x0, x), math.min(x1, x + w - 2)
      for yy = y, y + h - 2 do for xx = xa, xb do
        local lt = (lightf and lightf(xx, yy) or .6)
        local inner = (yy == y) and .2 or ((xx == xa) and .12 or ((yy == y + h - 2 or xx == xb) and -.25 or 0))
        P(c, xx, yy, px.ramp(c, STONE, lt + inner + (H(xa, yy // 3) - .5) * .12, xx, yy, 3, 7))
      end end
      if xb >= xa then px.vline(c, xb + 1, y, y + h - 2, 's1'); px.hline(c, xa, xb + 1, y + h - 1, 's1') end
      x = x + w
    end
    y = y + h; row = row + 1
  end
end

--------------------------------------------------------------------------- the cottage
local function cottage(night)
  local W, Hh = 232, 236
  local c = px.new(W, Hh, PAL)
  local gy = 227                       -- the ground line under the foundation
  local x0, x1, yW = 24, 207, 150      -- wall left/right, wall top
  local ax, ay = 115, 98               -- the gable apex (bottom of the bargeboard)
  local topL, topR, topA = 104, 104, 40
  -- roof planes (behind the gable), scalloped shingles in rows; left plane lit, right plane in shade
  local roofpoly = {{10, topL}, {ax, topA}, {221, topR}, {221, 154}, {ax, ay}, {10, 154}}
  px.poly(c, roofpoly, function(x, y)
    local row = (y - topA) // 7; local ry = (y - topA) % 7; local off = (row % 2) * 6; local lx = (x + off) % 12
    local left = x < ax
    if (ry == 6 and lx >= 2 and lx <= 9) or (ry == 5 and (lx == 1 or lx == 10)) or (ry == 4 and (lx == 0 or lx == 11)) then return px.i(c, left and 'r2' or 'r1') end
    local base = left and .62 or .3
    local bulge = .26 * (1 - math.abs(lx - 5.5) / 6) + .05 * ry / 6
    if ry < 2 then bulge = bulge - .18 end
    local n = H(x // 12 + row * 7, row)
    if n > .94 then return px.i(c, 'r1') end                         -- a slipped tile
    local v = px.ramp(c, ROOF, base + bulge + (n - .5) * .14 - (y - topA) / 400, x, y, 2, 8)
    if left and ry == 3 and (lx == 3 or lx == 4) and n > .35 then v = px.i(c, 'r8') end
    return v
  end)
  -- moss creeping up from the eaves
  for i = 0, 70 do local x = 14 + math.floor(H(i, 3) * 200); local y = 128 + math.floor(H(i, 5) * 24)
    if px.get(c, x, y) ~= 0 and math.abs(x - ax) > 6 then P(c, x, y, ({'v3','v4','v5','v4'})[i % 4 + 1]); P(c, x + 1, y, 'v3') end end
  -- the ridge running back, and the side eaves
  for y = topA, ay do P(c, ax - 1, y, 'r7'); P(c, ax, y, 'r6'); P(c, ax + 1, y, 'r3'); P(c, ax + 2, y, 'r2') end
  px.vline(c, 10, topL, 154, 'r3'); px.vline(c, 11, topL + 1, 154, 'r5'); px.vline(c, 221, topR, 154, 'r1')
  -- the gable wall: board and batten, a round attic window
  px.poly(c, {{x0, yW + 1}, {ax, ay + 4}, {x1, yW + 1}}, function(x, y)
    local bx = (x - x0) % 8
    if bx == 0 then return px.i(c, 'w2') end
    if bx == 1 then return px.i(c, 'w6') end
    return px.ramp(c, WOOD, .58 - (x - x0) / 700 - (yW - y) / 300, x, y, 3, 6)
  end)
  px.ellipse(c, ax + .5, 126.5, 10, 10, 't3'); px.ellipse(c, ax + .5, 126.5, 8, 8, 'g2'); px.ellipse(c, ax - 1.5, 124.5, 4, 4, 'g3')
  P(c, ax - 3, 121, 'g6'); P(c, ax - 2, 121, 'g5'); P(c, ax - 3, 122, 'g5'); px.hline(c, ax - 7, ax + 8, 126, 't2'); px.vline(c, ax, 119, 134, 't2')
  -- the bargeboards: thick cream boards along both slopes
  for t = 0, 5 do
    local col = ({'OUT', 't1', 't3', 't4', 't5', 'OUT'})[t + 1]
    LINE(c, 9, 153 + t - 2, ax, ay + t - 2, col); LINE(c, ax, ay + t - 2, 222, 153 + t - 2, (t >= 1 and t <= 4) and ({'t1', 't2', 't3', 't3'})[t] or col)
  end
  P(c, ax, ay - 3, 'OUT'); P(c, ax, ay - 2, 't4')
  -- the walls: clapboard, lit from the left, with knots and a weathered board or two
  for y = yW + 1, 217 do
    local row = (y - yW - 1) // 6; local ry = (y - yW - 1) % 6
    for x = x0, x1 do
      if px.get(c, x, y) == 0 or y > yW + 6 or true then
        local lt = .62 - (x - x0) / 520
        local col
        if ry == 5 then col = 'w2' elseif ry == 4 then col = 'w3' elseif ry == 0 then col = (x < x1 - 30) and 'w6' or 'w5'
        else col = px.ramp(c, WOOD, lt + (H(row, 1) - .5) * .12, x, y, 4, 6) end
        if px.get(c, x, y) == 0 or y > ay + 60 then P(c, x, y, col) end
      end
    end
  end
  for k = 0, 9 do local kx = x0 + 12 + math.floor(H(k, 7) * 160); local ky = yW + 3 + 6 * math.floor(H(k, 9) * 10)
    if ky < 214 then P(c, kx, ky + 1, 'w2'); P(c, kx + 1, ky + 1, 'w3'); P(c, kx + 2, ky + 2, 'w2') end end
  -- the shadow the gable throws on the top of the wall
  for y = yW + 1, yW + 7 do for x = x0, x1 do
    if (y - yW) / 8 < (1 - (x + y) % 2 * .5) and px.get(c, x, y) ~= 0 then P(c, x, y, ((y + x) % 2 == 0) and 'w2' or 'w3') end end end
  -- corner boards
  for _, cx in ipairs({x0, x1 - 4}) do R(c, cx, yW + 2, cx + 4, 217, 't3'); px.vline(c, cx, yW + 2, 217, 't4'); px.vline(c, cx + 4, yW + 2, 217, 't2') end
  -- the foundation
  stones(c, 20, 218, 211, 226, 11, 5, function(x, y) return .66 - (x - 20) / 600 end)
  px.hline(c, 20, 211, 218, 's6')
  -- windows: frame, sill, panes, curtains; the left one has something small standing in it
  local function window(wx, wy, ww, wh, curtain, doll)
    R(c, wx - 4, wy - 4, wx + ww + 3, wy + wh + 3, 't3'); px.hline(c, wx - 4, wx + ww + 3, wy - 4, 't5'); px.vline(c, wx - 4, wy - 4, wy + wh + 3, 't4')
    px.vline(c, wx + ww + 3, wy - 4, wy + wh + 3, 't2')
    for y = wy, wy + wh - 1 do for x = wx, wx + ww - 1 do
      local v
      if night then v = px.ramp(c, {'y1', 'y2', 'y3'}, .9 - (y - wy) / wh * .6, x, y)
      else v = (x - wx) + (y - wy) * .8 < ww * .55 and 'g3' or 'g2' end
      P(c, x, y, v) end end
    if not night then LINE(c, wx + 2, wy + 6, wx + 7, wy + 1, 'g5'); LINE(c, wx + 3, wy + 7, wx + 8, wy + 2, 'g4'); P(c, wx + 2, wy + 2, 'g6') end
    if curtain then for i = 0, 7 do px.hline(c, wx, wx + 3 - i // 3, wy + i, night and 'f3' or curtain); px.hline(c, wx + ww - 4 + i // 3, wx + ww - 1, wy + i, night and 'f3' or curtain) end end
    if doll then  -- a small pale face low in the glass, two black eyes, looking out
      px.ellipse(c, wx + ww * .62, wy + wh - 7, 3.2, 3.6, night and 'p1' or 'p1'); P(c, wx + ww * .62 - 1.5, wy + wh - 8, 'OUT'); P(c, wx + ww * .62 + 1, wy + wh - 8, 'OUT')
      P(c, wx + ww * .62 - 1, wy + wh - 9, 'p2'); px.hline(c, math.floor(wx + ww * .62 - 2), math.floor(wx + ww * .62 + 2), wy + wh - 3, 'f2')
    end
    px.vline(c, wx + ww // 2, wy, wy + wh - 1, 't2'); px.hline(c, wx, wx + ww - 1, wy + wh // 2, 't2')
    px.vline(c, wx + ww // 2 + 1, wy, wy + wh - 1, 't4'); px.hline(c, wx, wx + ww - 1, wy + wh // 2 + 1, 't4')
    R(c, wx - 6, wy + wh + 3, wx + ww + 5, wy + wh + 5, 't4'); px.hline(c, wx - 6, wx + ww + 5, wy + wh + 3, 't5'); px.hline(c, wx - 6, wx + ww + 5, wy + wh + 6, 'w2')
  end
  local function flowerbox(bx, by, bw, dying)
    R(c, bx, by, bx + bw, by + 7, 'w4'); px.hline(c, bx, bx + bw, by, 'w6'); px.hline(c, bx, bx + bw, by + 7, 'w2'); px.vline(c, bx, by, by + 7, 'w5')
    for i = 0, 4 do px.vline(c, bx + 3 + i * (bw // 5), by + 2, by + 5, 'w3') end
    for i = 0, bw - 2, 3 do
      local fx = bx + 1 + i; local hgt = 3 + math.floor(H(i, bx) * 4)
      if dying then px.vline(c, fx, by - hgt + 2, by - 1, 'k3'); P(c, fx + 1, by - hgt + 3, ({'f1', 'f2', 'k2'})[i % 3 + 1]); P(c, fx + 1, by - hgt + 4, 'f1')
      else px.vline(c, fx, by - hgt, by - 1, 'v3'); P(c, fx - 1, by - hgt + 2, 'v4'); P(c, fx, by - hgt - 1, ({'f3', 'f4', 'y2', 'f3'})[i % 4 + 1]); P(c, fx + 1, by - hgt, 'f2') end
    end
  end
  window(46, 168, 24, 26, 't4', true); window(160, 168, 24, 26, 'f2', false)
  flowerbox(40, 204, 36, true); flowerbox(154, 204, 36, false)
  -- the door: frame, boards, a little window, the knob, a red ribbon, scratches
  local dx0, dx1, dy0 = 103, 128, 170
  R(c, dx0 - 5, dy0 - 5, dx1 + 5, 217, 't3'); px.hline(c, dx0 - 5, dx1 + 5, dy0 - 5, 't5'); px.vline(c, dx0 - 5, dy0 - 5, 217, 't4'); px.vline(c, dx1 + 5, dy0 - 5, 217, 't2')
  R(c, dx0 - 7, dy0 - 8, dx1 + 7, dy0 - 6, 't4'); px.hline(c, dx0 - 7, dx1 + 7, dy0 - 8, 't5'); px.hline(c, dx0 - 7, dx1 + 7, dy0 - 5, 'w2')
  for y = dy0, 217 do for x = dx0, dx1 do
    local bx = (x - dx0) % 6
    P(c, x, y, bx == 0 and 'd1' or (bx == 1 and 'd4' or px.ramp(c, {'d1', 'd2', 'd3', 'd4', 'd5'}, .55 - (x - dx0) / 60, x, y, 2, 4))) end end
  R(c, dx0 + 5, dy0 + 5, dx1 - 5, dy0 + 15, 't2'); R(c, dx0 + 6, dy0 + 6, dx1 - 6, dy0 + 14, night and 'y2' or 'g2'); px.vline(c, (dx0 + dx1) // 2, dy0 + 6, dy0 + 14, 't2'); px.hline(c, dx0 + 6, dx1 - 6, dy0 + 10, 't2')
  if not night then P(c, dx0 + 7, dy0 + 7, 'g5'); P(c, dx0 + 8, dy0 + 7, 'g4') end
  R(c, dx1 - 5, 194, dx1 - 3, 196, 'y2'); P(c, dx1 - 5, 194, 'y3'); P(c, dx1 - 3, 196, 'y1')
  R(c, dx1 - 6, 189, dx1 - 2, 190, 'b2'); P(c, dx1 - 4, 191, 'b2'); P(c, dx1 - 3, 192, 'b1'); P(c, dx1 - 5, 192, 'b3'); P(c, dx1 - 6, 193, 'b1')
  for k = 0, 2 do LINE(c, dx0 + 3 + k * 3, 200, dx0 + 6 + k * 3, 209, 'd1') end
  R(c, dx0 - 9, 218, dx1 + 9, 222, 's6'); px.hline(c, dx0 - 9, dx1 + 9, 218, 's7'); px.hline(c, dx0 - 9, dx1 + 9, 222, 's3')
  -- a lantern on a bracket by the door
  local lx = dx1 + 12
  px.hline(c, lx - 3, lx + 3, 176, 'm2'); px.vline(c, lx - 3, 176, 180, 'm2'); R(c, lx - 2, 180, lx + 3, 188, 'm3'); R(c, lx - 1, 181, lx + 2, 187, night and 'y3' or 'g3')
  if not night then P(c, lx, 184, 'y2'); P(c, lx + 1, 184, 'y1') end
  px.hline(c, lx - 3, lx + 4, 179, 'm1'); px.hline(c, lx - 3, lx + 4, 189, 'm1')
  -- ivy climbing the left corner up under the eaves
  local sx, sy = x0 + 3, 216
  for i = 0, 70 do
    sx = sx + (H(i, 2) - .4) * 2.2; sy = sy - 1
    if sy < yW + 4 then break end
    P(c, sx, sy, 'v2')
    if i % 3 == 0 then
      local lx2 = sx + (i % 2 == 0 and -3 or 2); local ly2 = sy
      for _, d in ipairs({{0,0},{1,0},{0,1},{1,1},{2,0},{-1,1}}) do P(c, lx2 + d[1], ly2 + d[2], ({'v3','v4','v5','v4','v6','v3'})[(i + d[1] + d[2]) % 6 + 1]) end
    end
  end
  -- the chimney on the shaded slope, its shadow on the roof
  local cx0, cx1, cy0, cy1 = 160, 180, 58, 116
  for y = cy0 + 6, cy1 do for x = cx1 + 1, cx1 + 9 do if px.get(c, x, y) ~= 0 and (x + y) % 2 == 0 then P(c, x, y, 'r1') end end end
  stones(c, cx0, cy0 + 4, cx1, cy1, 5, 5, function(x, y) return .7 - (x - cx0) / 40 end)
  R(c, cx0 - 3, cy0, cx1 + 3, cy0 + 3, 's6'); px.hline(c, cx0 - 3, cx1 + 3, cy0, 's7'); px.hline(c, cx0 - 3, cx1 + 3, cy0 + 3, 's3')
  R(c, cx0 + 3, cy0 - 1, cx1 - 3, cy0, 'OUT')
  -- finally, the outline round everything
  px.outline(c, px.i(c, 'OUT'))
  return c
end

--------------------------------------------------------------------------- the autumn maple
local function maple()
  local W, Hh = 140, 172
  local c = px.new(W, Hh, PAL)
  local base, cx = 164, 70
  -- roots and trunk
  local function trunkCol(x, y, left, right)
    local t = (x - left) / math.max(1, right - left)
    local lt = .75 - t * .7 + (H(x // 2, y // 5) - .5) * .18
    if (x + math.floor(math.sin(y * .35) * 1.5)) % 5 == 0 and t > .15 and t < .85 then lt = lt - .35 end
    return px.ramp(c, BARK, lt, x, y, 1, 6)
  end
  for y = 96, base do
    local t = (y - 96) / (base - 96)
    local hw = 6 + t ^ 3 * 10
    for x = math.floor(cx - hw), math.ceil(cx + hw) do P(c, x, y, trunkCol(x, y, cx - hw, cx + hw)) end
  end
  for _, rt in ipairs({{-1, 22, 5}, {1, 24, 4}, {.25, 10, 3}}) do       -- three roots spreading into the ground
    for i = 0, rt[2] do local x = cx + rt[1] * (6 + i); local y = base - 6 + i * .35 + (rt[1] == .25 and 2 or 0)
      local th = rt[3] * (1 - i / rt[2]) + 1
      for k = 0, math.floor(th) do P(c, x, y - k, trunkCol(x, y - k, cx - 30, cx + 30)) end end
  end
  -- limbs up into the crown
  for _, lb in ipairs({{-1, 34}, {1, 30}, {0, 40}}) do
    for i = 0, lb[2] do local x = cx + lb[1] * i * .7 + math.sin(i * .3) * 1.5; local y = 100 - i
      for k = -2, 2 do P(c, x + k, y, trunkCol(x + k, y, x - 2, x + 2)) end end
  end
  -- an eye-shaped knot in the bark
  px.ellipse(c, cx - 1, 128, 4, 2.4, 'k1'); P(c, cx - 2, 128, 'k3'); P(c, cx, 127, 'p1'); px.hline(c, cx - 5, cx + 3, 125, 'k2')
  -- the crown: clusters of leaves, back to front, lit from the upper left
  local clusters = {{70,30,22},{44,46,18},{96,46,18},{70,50,30},{48,70,22},{92,70,22},{70,80,24},{34,64,14},{108,64,14}}
  table.sort(clusters, function(a, b) return a[2] < b[2] end)
  for ci, cl in ipairs(clusters) do
    local ccx, ccy, r = cl[1], cl[2], cl[3]
    for y = ccy - r, ccy + r, 2 do for x = ccx - r, ccx + r, 3 do
      local jx = x + math.floor(H(x, y + ci) * 3) - 1; local jy = y + math.floor(H(y, x - ci) * 2)
      local nx, ny = (jx - ccx) / r, (jy - ccy) / r
      if nx * nx + ny * ny <= 1 then
        local lt = .5 + .42 * (-.72 * nx - .7 * ny) + (ccy < 50 and .08 or 0) - (ci < 3 and .1 or 0) + (H(jx, jy) - .5) * .24
        local function L(dx, dy, d) local v = math.max(1, math.min(8, math.floor(1 + lt * 7 + .5) + d)); P(c, jx + dx, jy + dy, LEAF[v]) end
        L(0, 0, 0); L(1, 0, 0); L(-1, 1, -1); L(0, 1, -1); L(1, 1, -2); L(0, -1, 1); L(2, 1, -2)
        if lt > .78 then P(c, jx, jy - 1, 'L8') end
      end
    end end
  end
  -- deep gaps where the limbs show through
  for _, g in ipairs({{58, 92}, {83, 90}, {70, 94}, {52, 80}}) do px.ellipse(c, g[1], g[2], 3, 2, 'L1') end
  px.outline(c, px.i(c, 'L1'), function(v) return v >= px.i(c, 'L1') and v <= px.i(c, 'L8') end)
  px.outline(c, px.i(c, 'OUT'))
  -- a few leaves let go
  for _, f in ipairs({{20, 120}, {118, 132}, {30, 150}, {104, 158}, {50, 160}, {90, 162}}) do P(c, f[1], f[2], 'L6'); P(c, f[1] + 1, f[2], 'L5'); P(c, f[1], f[2] + 1, 'L4') end
  return c
end

--------------------------------------------------------------------------- the well
local function well()
  local W, Hh = 84, 104
  local c = px.new(W, Hh, PAL)
  local cx, rimY, botY = 42, 66, 96
  -- the drum: courses of stone curving round a cylinder, lit on the left
  stones(c, 14, rimY, 70, botY, 21, 6, function(x, y) local t = (x - 14) / 56; return .78 - math.abs(t - .3) * .9 end)
  for y = rimY, botY do P(c, 13, y, 's1'); P(c, 71, y, 's1') end
  -- a red handprint dragged down the front stones
  px.ellipse(c, 30, 78, 3, 3.5, 'b2'); for k = 0, 3 do px.vline(c, 27 + k * 2, 72, 75, k == 3 and 'b1' or 'b2') end; px.vline(c, 31, 81, 88, 'b1'); px.vline(c, 29, 81, 85, 'b2')
  -- the rim seen from above and the black water inside
  px.ellipse(c, cx, rimY, 29, 9, 's5'); px.ellipse(c, cx, rimY - 1, 28, 8, 's6')
  for a = 0, 359, 18 do local ang = math.rad(a); local x = cx + math.cos(ang) * 25; local y = rimY + math.sin(ang) * 7; P(c, x, y, 's3') end
  px.ellipse(c, cx, rimY, 22, 5.5, 's2'); px.ellipse(c, cx, rimY + .5, 20, 4.5, 'g1')
  px.hline(c, cx - 8, cx + 4, rimY - 2, 'g2'); P(c, cx + 6, rimY + 1, 'p1'); P(c, cx + 9, rimY + 1, 'p1')   -- something pale looking up
  -- posts, the beam, the rope and bucket, the crank
  for _, xp in ipairs({16, 66}) do R(c, xp - 2, 20, xp + 2, rimY + 2, 'w4'); px.vline(c, xp - 2, 20, rimY + 2, 'w6'); px.vline(c, xp + 2, 20, rimY + 2, 'w2') end
  R(c, 14, 30, 70, 33, 'w5'); px.hline(c, 14, 70, 30, 'w7'); px.hline(c, 14, 70, 33, 'w2')
  px.vline(c, cx, 34, 48, 't2'); px.vline(c, cx + 1, 34, 48, 't3')
  R(c, cx - 5, 48, cx + 6, 57, 'w4'); px.hline(c, cx - 5, cx + 6, 48, 'w6'); px.hline(c, cx - 5, cx + 6, 51, 'm3'); px.hline(c, cx - 5, cx + 6, 55, 'm3'); px.vline(c, cx + 6, 48, 57, 'w2')
  LINE(c, 70, 31, 76, 31, 'm3'); px.vline(c, 76, 31, 38, 'm3'); R(c, 75, 38, 78, 40, 'w4')
  -- a little gabled roof of planks over it all
  px.poly(c, {{6, 24}, {cx, 4}, {78, 24}, {78, 28}, {6, 28}}, function(x, y)
    local left = x < cx; local bx = (x + (left and 0 or 3)) % 7
    if bx == 0 then return px.i(c, left and 'r2' or 'r1') end
    return px.ramp(c, ROOF, (left and .7 or .32) - (y - 4) / 90 + (H(x // 7, 1) - .5) * .12, x, y, 2, 7)
  end)
  LINE(c, 5, 25, cx, 4, 't4'); LINE(c, cx, 4, 79, 25, 't2'); LINE(c, 5, 26, cx, 5, 't3'); LINE(c, cx, 5, 79, 26, 't1')
  px.hline(c, 6, 78, 28, 't3'); px.hline(c, 6, 78, 29, 'w2')
  px.outline(c, px.i(c, 'OUT'))
  return c
end

local function save(c, name) px.save(c, app.fs.joinPath(out, name .. '.png')) end
save(cottage(false), 'sample_cottage'); save(cottage(true), 'sample_cottage_n'); save(maple(), 'sample_maple'); save(well(), 'sample_well')
print('samples written to ' .. out)
