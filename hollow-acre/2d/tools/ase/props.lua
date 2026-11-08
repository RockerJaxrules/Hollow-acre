-- Everyday props for Hollow Acre, drawn in Aseprite with bkit.lua's palette so they sit with the buildings: fences and
-- walls that tile, lamps, benches, barrels, crates, sacks, hay, firewood, the well, mailbox, signs, the notice board,
-- the phone booth, graves, the fountain and the rest. Every sprite keeps its old size and anchor (fence and wall pieces
-- keep their tiling step: 2 tiles across, 1 tile down). Top faces light, front faces mid, shade side dark, a contact
-- line where they meet the ground, bold outline. Writes <name>.png and META lines for install.py.
local dir = app.params['dir'] or '.'
local out = app.params['out'] or dir
local only = app.params['only']
local px = dofile(app.fs.joinPath(dir, 'px.lua'))
local B = dofile(app.fs.joinPath(dir, 'bkit.lua')); B.init(px)

local function P(c, x, y, col) px.p(c, x, y, col) end
local function R(c, x0, y0, x1, y1, col) px.rect(c, x0, y0, x1, y1, col) end
local function H(a, b) return px.h(a, b) end
local function band(c, r, l, lo, hi) return px.band(c, r, l, lo, hi) end
local WD = B.WALLS.honey                   -- warm wood, 7 steps
local KB = {'k1', 'k2', 'k3', 'k4', 'k5', 'k6'}
local ST = B.WALLS.stone
local IR = {'OUT', 'bt1', 'bt2', 'bt3', 'bt4', 'bt5'}   -- black iron
local WH = B.WALLS.white
local function new(w, h) return px.new(w, h, B.PAL) end
local function done(c, ax, ay) px.outline(c, px.i(c, 'OUT')); return c, {w = c.w, h = c.h, ax = ax, ay = ay} end
local function ground(c, x0, x1, y) for x = x0, x1 do if (x % 2 == 0) then P(c, x, y, 'OUT2') end end end

-- a squared post, lit on the left, a cap on top
local function post(c, x0, x1, y0, y1, r, cap)
  for y = y0, y1 do for x = x0, x1 do local u = (x - x0) / math.max(1, x1 - x0)
    local l = .78 - u * .6; if (y * 3 + x) % 9 == 0 and u > .2 and u < .8 then l = l - .18 end
    P(c, x, y, band(c, r, l, 2, #r)) end end
  if cap then R(c, x0 - 1, y0 - 2, x1 + 1, y0 - 1, r[#r - 1]); px.hline(c, x0 - 1, x1 + 1, y0 - 2, r[#r]); P(c, x1 + 1, y0 - 1, r[3]) end
end
-- a horizontal board/rail: lit top edge, grain, dark underside
local function rail(c, x0, x1, y0, y1, r, seed)
  for y = y0, y1 do for x = x0, x1 do
    local l = (y == y0) and .9 or ((y == y1) and .18 or .55 - (y - y0) / (y1 - y0 + 1) * .2)
    if y ~= y0 and y ~= y1 and H(x // 5, y + (seed or 0)) > .82 then l = l - .16 end
    P(c, x, y, band(c, r, l, 2, #r)) end end
end
local function plankTop(c, x0, x1, y0, y1, r, pw, seed)                 -- a top face of boards running left-right
  for y = y0, y1 do local row = (y - y0) // (pw or 4); local ry = (y - y0) % (pw or 4)
    for x = x0, x1 do local l = .72 + (H(row, seed or 1) - .5) * .14 - (ry == (pw or 4) - 1 and .32 or 0)
      if ((x + row * 11) % 23) == 0 then l = l - .3 end; P(c, x, y, band(c, r, l, 2, #r)) end end
end
local function cyl(c, x0, x1, y0, y1, r, lo, hi)                         -- a vertical cylinder's shading across x
  for y = y0, y1 do for x = x0, x1 do local u = (x - x0) / math.max(1, x1 - x0) * 2 - 1
    local l = .72 - u * .5 - u * u * .2 + ((u > -.6 and u < -.35) and .15 or 0); P(c, x, y, band(c, r, l, lo or 1, hi or #r)) end end
end

local S = {}

-- ------------------------------------------------------------------ fences and walls (tiling pieces)
S.fence_h = function()
  local c = new(72, 24)
  rail(c, 3, 71, 6, 9, WD, 1); rail(c, 3, 71, 14, 17, WD, 2)
  for x = 10, 70, 13 do P(c, x, 8, 'k3') end                                 -- knots
  ground(c, 2, 70, 22)
  post(c, 0, 5, 3, 21, WD, true); P(c, 2, 7, 'm2'); P(c, 2, 15, 'm2')
  px.hline(c, 0, 6, 22, 'OUT2')
  return done(c, 0, 22)
end
S.fence_v = function()
  local c = new(14, 68)
  for y = 2, 48 do P(c, 5, y, WD[6]); P(c, 6, y, WD[5]); P(c, 7, y, WD[4]); P(c, 8, y, WD[2]) end   -- the rails running away up the screen
  for y = 6, 46, 9 do P(c, 6, y, 'k3') end
  post(c, 4, 9, 46, 65, WD, true); P(c, 6, 50, 'm2'); P(c, 6, 58, 'm2')
  return done(c, 7, 66)
end
S.picket_h = function()
  local c = new(64, 25)
  rail(c, 2, 63, 9, 11, WH, 3); rail(c, 2, 63, 17, 19, WH, 4)
  for x = 4, 61, 6 do                                                        -- pickets with pointed tops
    for y = 4, 22 do for k = 0, 3 do local xx = x + k
      if y >= 4 + math.abs(k - 1.5) * 1.2 then P(c, xx, y, band(c, WH, (k == 0 and .9 or (k == 3 and .3 or .65)) - (y > 19 and .15 or 0), 2, 7)) end end end
    P(c, x + 1, 3, WH[7]); P(c, x + 2, 3, WH[6]) end
  post(c, 0, 4, 2, 22, WH, true)
  ground(c, 1, 62, 23)
  return done(c, 0, 23)
end
S.picket_v = function()
  local c = new(14, 68)
  for y = 0, 50 do P(c, 5, y, WH[7]); P(c, 6, y, WH[6]); P(c, 7, y, WH[5]); P(c, 8, y, WH[3]) end
  for y = 2, 48, 6 do px.hline(c, 4, 9, y, WH[7]); P(c, 9, y + 1, WH[2]) end   -- picket tops seen end-on
  post(c, 4, 9, 48, 65, WH, true)
  return done(c, 7, 66)
end
S.rgiron_h = function()
  local c = new(72, 40)
  B.stones(c, 0, 31, 71, 37, 7, 4, function(x, y) return .6 end); px.hline(c, 0, 71, 30, 's6')
  for x = 2, 70, 4 do for y = 6, 30 do P(c, x, y, y < 9 and 'bt3' or 'bt2'); if (x % 8 == 2) then P(c, x + 1, y, 'OUT') end end
    P(c, x, 4, 'bt4'); P(c, x - 1, 5, 'bt3'); P(c, x + 1, 5, 'bt2'); P(c, x, 3, 'bt5') end
  px.hline(c, 0, 71, 9, 'bt3'); px.hline(c, 0, 71, 10, 'OUT'); px.hline(c, 0, 71, 26, 'bt3'); px.hline(c, 0, 71, 27, 'OUT')
  for x = 6, 70, 16 do px.ellipse(c, x + .5, 18, 3, 3, 'bt3'); px.ellipse(c, x + .5, 18, 1.5, 1.5, 0) end   -- scrolls between bars
  post(c, 0, 4, 2, 30, IR, true)
  return done(c, 0, 37)
end
S.rgiron_v = function()
  local c = new(14, 68)
  for y = 6, 52 do P(c, 6, y, 'bt3'); P(c, 7, y, 'bt2') end
  for y = 8, 50, 6 do P(c, 5, y, 'bt4'); P(c, 8, y, 'bt1') end
  B.stones(c, 2, 56, 11, 65, 9, 5, function() return .6 end)
  post(c, 4, 9, 34, 55, IR, true); P(c, 6, 31, 'bt5'); P(c, 7, 32, 'bt3')
  return done(c, 7, 66)
end
local function stonewall(broken)
  local c = new(70, 38)
  B.stones(c, 0, 12, 69, 31, broken and 11 or 10, 6, function(x, y) return .62 - (y - 12) / 90 end)
  for x = 0, 69 do for y = 4, 11 do local n = H(x // 6, y // 4 + 3)                -- cap stones on top, lighter
    P(c, x, y, band(c, ST, .84 - (y - 4) / 30 + (n - .5) * .12 - ((x % 9 == 0) and .3 or 0), 3, 7)) end end
  px.hline(c, 0, 69, 11, 's3')
  for x = 0, 69 do if H(x // 3, 5) > .5 then px.vline(c, x, 3, 3 + math.floor(H(x, 6) * 3), H(x, 7) > .5 and 'v3' or 'v2') end end   -- moss
  if broken then for x = 24, 46 do for y = 3, 18 + math.floor(math.abs(x - 35) * .5) - 6 do P(c, x, y, 0) end end
    for i = 0, 5 do local rx, ry = 22 + math.floor(H(i, 1) * 28), 30 + math.floor(H(i, 2) * 4); px.ellipse(c, rx, ry, 3, 2, i % 2 == 0 and 's5' or 's4'); P(c, rx - 1, ry - 1, 's6') end end
  for x = 0, 69, 3 do if H(x, 9) > .55 then px.vline(c, x, 30 - math.floor(H(x, 10) * 4), 31, 'v4') end end
  ground(c, 0, 69, 32)
  return done(c, 0, 32)
end
S.stonewall = function() return stonewall(false) end
S.stonewall_b = function() return stonewall(true) end

-- ------------------------------------------------------------------ lamps
S.lamp = function()
  local c = new(16, 82); local cx = 8
  R(c, cx - 5, 72, cx + 5, 79, 'bt2'); px.hline(c, cx - 5, cx + 5, 72, 'bt4'); px.vline(c, cx - 5, 72, 79, 'bt3'); px.hline(c, cx - 6, cx + 6, 79, 'bt1')
  cyl(c, cx - 2, cx + 2, 22, 71, IR, 2, 6); for y = 30, 70, 10 do px.hline(c, cx - 3, cx + 3, y, 'bt4') end
  -- the lantern: a cap, four glass panes, a finial
  R(c, cx - 6, 8, cx + 6, 20, 'bt2'); R(c, cx - 4, 10, cx + 4, 19, 'y2'); px.vline(c, cx, 10, 19, 'bt2'); R(c, cx - 3, 11, cx - 2, 15, 'y3')
  for i = 0, 3 do px.hline(c, cx - 7 + i, cx + 7 - i, 7 - i, i == 0 and 'bt3' or 'bt4') end
  P(c, cx, 2, 'bt5'); px.vline(c, cx, 3, 4, 'bt3'); px.hline(c, cx - 4, cx + 4, 21, 'bt3')
  return done(c, 8, 79)
end
S.wk_lamp = function()
  local c = new(28, 86)
  post(c, 2, 6, 14, 82, KB, true)
  for x = 4, 22 do P(c, x, 14, 'k5'); P(c, x, 15, 'k3') end; px.line(c, 7, 24, 16, 15, 'k4')
  px.vline(c, 20, 16, 20, 'm2')
  B.lantern(c, 20, 21, true)
  B.stones(c, 0, 80, 9, 84, 3, 3, function() return .6 end)
  return done(c, 11, 83)
end

-- ------------------------------------------------------------------ seats and work
S.parkbench = function()
  local c = new(62, 40)
  for i = 0, 1 do rail(c, 6, 55, 5 + i * 5, 8 + i * 5, WD, 10 + i) end           -- backrest
  plankTop(c, 6, 55, 16, 27, WD, 4, 12)                                        -- seat seen from above
  rail(c, 6, 55, 28, 30, WD, 13)
  for _, x in ipairs({4, 52}) do                                              -- cast iron ends
    px.vline(c, x, 4, 34, 'bt2'); px.vline(c, x + 1, 4, 34, 'bt3'); px.vline(c, x + 2, 14, 34, 'bt1')
    px.line(c, x, 16, x + 4, 12, 'bt3'); P(c, x + 4, 11, 'bt4'); px.line(c, x - 1, 34, x + 3, 34, 'bt2') end
  ground(c, 4, 57, 36)
  return done(c, 31, 36)
end
S.choppingblock = function()
  local c = new(40, 40); local cx = 20
  cyl(c, cx - 11, cx + 11, 18, 34, KB, 2, 6)
  px.ellipse(c, cx + .5, 18, 11.5, 5, 'w6'); px.ellipse(c, cx + .5, 18, 8, 3.2, 'w5'); px.ellipse(c, cx + .5, 18, 4, 1.6, 'w6'); P(c, cx, 18, 'w4')
  px.line(c, cx - 2, 17, cx + 9, 3, 'k5'); px.line(c, cx - 1, 17, cx + 10, 3, 'k3')                 -- the axe, stuck
  R(c, cx - 5, 14, cx + 1, 18, 'm3'); px.hline(c, cx - 5, cx + 1, 14, 'm4'); P(c, cx - 5, 18, 'm1')
  for i = 0, 5 do local x, y = 6 + math.floor(H(i, 3) * 28), 34 + math.floor(H(i, 4) * 4); P(c, x, y, 'w6'); P(c, x + 1, y, 'w4') end
  ground(c, cx - 12, cx + 12, 36)
  return done(c, 20, 36)
end

-- ------------------------------------------------------------------ containers and stacks
S.barrel = function()
  local c = new(30, 34); local cx = 15
  for y = 7, 30 do local t = (y - 7) / 23; local bulge = math.sin(t * math.pi) * 2.2; local x0, x1 = math.floor(cx - 10 - bulge), math.floor(cx + 10 + bulge)
    for x = x0, x1 do local u = (x - x0) / (x1 - x0) * 2 - 1; local l = .7 - u * .5 - u * u * .2
      if (x - x0) % 5 == 0 then l = l - .22 end; P(c, x, y, band(c, WD, l, 2, 7)) end end
  for _, y in ipairs({10, 27}) do for x = cx - 12, cx + 12 do if px.get(c, x, y) ~= 0 then P(c, x, y, x < cx - 4 and 'm4' or 'm2'); P(c, x, y + 1, 'm1') end end end
  px.ellipse(c, cx + .5, 7, 10.5, 4, 'w2'); px.ellipse(c, cx + .5, 7, 9, 3, 'w5'); px.hline(c, cx - 8, cx + 8, 6, 'w4'); px.hline(c, cx - 8, cx + 8, 8, 'w4'); P(c, cx - 4, 6, 'w6')
  ground(c, cx - 11, cx + 11, 31)
  return done(c, 15, 31)
end
S.crate = function()
  local c = new(30, 32)
  plankTop(c, 3, 26, 4, 11, WD, 4, 21)
  for y = 12, 28 do for x = 3, 26 do P(c, x, y, band(c, WD, .5 - (x - 3) / 80 - (((y - 12) % 6 == 5) and .25 or 0), 2, 6)) end end
  R(c, 3, 12, 5, 28, 'w6'); R(c, 24, 12, 26, 28, 'w3'); px.line(c, 6, 27, 23, 13, 'w6'); px.line(c, 6, 26, 23, 12, 'w3')
  for _, q in ipairs({{4, 13}, {25, 13}, {4, 27}, {25, 27}}) do P(c, q[1], q[2], 'm2') end
  px.hline(c, 3, 26, 12, 'w2')
  ground(c, 3, 27, 29)
  return done(c, 15, 29)
end
S.sacks = function()
  local c = new(36, 32)
  for i, s in ipairs({{11, 18, 9, 12}, {24, 19, 9, 11}, {17, 11, 8, 9}}) do local sx, sy, rx, ry = s[1], s[2], s[3], s[4]
    for y = math.floor(sy - ry), math.ceil(sy + ry) do for x = math.floor(sx - rx), math.ceil(sx + rx) do
      local dx, dy = (x + .5 - sx) / rx, (y + .5 - sy) / ry; local d = dx * dx + dy * dy * (dy < 0 and 1.3 or 1)
      if d <= 1 then local l = .62 - dx * .3 - dy * .25 + (((x + y) % 4 == 0) and -.06 or 0); P(c, x, y, band(c, B.WALLS.plaster, l, 2, 7)) end end end
    R(c, sx - 2, sy - ry - 2, sx + 1, sy - ry, 'pl4'); px.hline(c, sx - 3, sx + 2, sy - ry + 1, 'k3')
    if i == 1 then B.text(c, sx - 1, sy - 2, 'F', 'k3') end end
  ground(c, 2, 34, 29)
  return done(c, 18, 29)
end
S.hay = function()
  local c = new(46, 36); local TH = B.ROOFS.thatch
  for y = 5, 13 do for x = 3, 42 do local n = H(x // 2, y + 1); P(c, x, y, band(c, TH, .82 - (y - 5) / 40 + (n - .5) * .25, 3, 8)) end end
  for y = 14, 32 do for x = 3, 42 do local n = H(x, y // 2 + 4); P(c, x, y, band(c, TH, .55 - (x - 3) / 120 + (n - .5) * .3 - (y > 29 and .2 or 0), 2, 7)) end end
  px.hline(c, 3, 42, 14, 'th3')
  for _, x in ipairs({13, 31}) do px.vline(c, x, 5, 32, 'k3'); px.vline(c, x + 1, 5, 32, 'k5') end
  for i = 0, 8 do local x = 3 + math.floor(H(i, 5) * 39); px.line(c, x, 4, x + (i % 2 == 0 and 2 or -2), 1, 'th6') end
  ground(c, 3, 43, 33)
  return done(c, 23, 33)
end
S.firewood = function()
  local c = new(42, 30)
  local logs = {}
  for row = 0, 2 do local n = 4 - row; for k = 0, n - 1 do logs[#logs + 1] = {6 + row * 4 + k * 8, 23 - row * 7} end end
  for _, q in ipairs(logs) do local x, y = q[1], q[2]
    px.ellipse(c, x + .5, y + .5, 4.5, 4, 'k2'); px.ellipse(c, x + .5, y + .5, 3.5, 3, 'w5'); px.ellipse(c, x + .5, y + .5, 2, 1.7, 'w6'); P(c, x, y, 'w4'); P(c, x + 1, y - 1, 'w7') end
  ground(c, 1, 40, 28)
  return done(c, 21, 27)
end
S.lumber = function()
  local c = new(48, 26)
  for i = 0, 3 do local y = 18 - i * 4; plankTop(c, 3 + i, 44 - i, y - 3, y - 1, WD, 3, 30 + i); rail(c, 3 + i, 44 - i, y, y + 2, WD, 31 + i)
    px.vline(c, 44 - i, y - 3, y + 2, 'w2'); px.vline(c, 3 + i, y - 3, y + 2, 'w6') end
  ground(c, 2, 45, 23)
  return done(c, 24, 23)
end
S.bucket = function()
  local c = new(22, 24); local cx = 11
  for y = 8, 20 do local t = (y - 8) / 12; local hw = 7 - t * 1.5; for x = math.floor(cx - hw), math.ceil(cx + hw) do local u = (x - cx) / hw
    P(c, x, y, band(c, WD, .66 - u * .45 - (((x - cx) % 4 == 0) and .18 or 0), 2, 7)) end end
  for _, y in ipairs({10, 18}) do for x = cx - 8, cx + 8 do if px.get(c, x, y) ~= 0 then P(c, x, y, 'm3') end end end
  px.ellipse(c, cx + .5, 8, 7.5, 2.6, 'w3'); px.ellipse(c, cx + .5, 8, 6, 1.8, 'd3'); P(c, cx - 2, 8, 'd5')
  px.line(c, cx - 7, 8, cx - 3, 1, 'm2'); px.line(c, cx - 3, 1, cx + 4, 1, 'm2'); px.line(c, cx + 4, 1, cx + 7, 8, 'm2')
  ground(c, cx - 6, cx + 6, 21)
  return done(c, 11, 21)
end
S.tyres = function()
  local c = new(32, 34); local cx = 16
  local TY = {'OUT', 's1', 's2', 's3', 's4'}
  for i = 0, 2 do local yc = 22 - i * 7                                       -- bottom tyre first; each one sits on the one below
    for y = yc, yc + 6 do for x = cx - 13, cx + 13 do local u = (x - cx) / 13
      if math.abs(u) <= 1 then local l = .35 - u * .25 - (y - yc) / 30; if (x + y) % 3 == 0 and y > yc and y < yc + 6 then l = l - .15 end
        P(c, x, y, band(c, TY, l, 2, 5)) end end end
    px.ellipse(c, cx + .5, yc + .5, 13, 4.5, 's3'); px.ellipse(c, cx - .5, yc - .5, 11, 3.2, 's4')
    px.ellipse(c, cx + .5, yc + .5, 6, 2, 'OUT') end
  ground(c, cx - 13, cx + 13, 31)
  return done(c, 16, 31)
end
S.drum = function()
  local c = new(22, 32); local cx = 11
  cyl(c, cx - 8, cx + 8, 6, 28, {'dr1', 'dr2', 'dr3', 'dr4', 'dr5', 'r6'}, 1, 6)
  for _, y in ipairs({12, 21}) do px.hline(c, cx - 8, cx + 8, y, 'dr1'); px.hline(c, cx - 8, cx + 8, y + 1, 'dr4') end
  px.ellipse(c, cx + .5, 6, 8.5, 3, 'dr2'); px.ellipse(c, cx + .5, 6, 7, 2, 'dr4'); P(c, cx + 3, 5, 'OUT'); P(c, cx + 4, 5, 'm2')
  for y = 14, 26 do if H(y, 3) > .6 then P(c, cx + 5, y, 'r4') end end
  ground(c, cx - 8, cx + 8, 29)
  return done(c, 11, 29)
end
S.trashcan = function()
  local c = new(22, 32); local cx = 11
  local SG = B.WALLS.sage
  for y = 9, 28 do local hw = 8 - (y - 9) / 20; for x = math.floor(cx - hw), math.ceil(cx + hw) do local u = (x - cx) / hw
    local l = .7 - u * .5 - u * u * .2; if (x - cx + 8) % 4 == 0 then l = l - .2 end; P(c, x, y, band(c, SG, l, 2, 7)) end end
  px.ellipse(c, cx + .5, 8, 9, 3.2, 'sg3'); px.ellipse(c, cx + .5, 7, 8, 2.5, 'sg6'); R(c, cx - 2, 3, cx + 2, 5, 'sg4'); px.hline(c, cx - 2, cx + 2, 3, 'sg7')
  ground(c, cx - 8, cx + 8, 29)
  return done(c, 11, 29)
end
S.hydrant = function()
  local c = new(20, 30); local cx = 10
  local RD = {'dr1', 'dr2', 'dr3', 'dr4', 'dr5'}
  cyl(c, cx - 4, cx + 4, 9, 24, RD, 1, 5)
  px.ellipse(c, cx + .5, 8, 5, 4, 'dr3'); R(c, cx - 1, 2, cx + 1, 4, 'dr4'); P(c, cx, 1, 'dr5')
  R(c, cx - 7, 13, cx - 5, 16, 'dr4'); R(c, cx + 5, 13, cx + 7, 16, 'dr2'); P(c, cx - 7, 14, 'm4')
  R(c, cx - 6, 24, cx + 6, 27, 'dr2'); px.hline(c, cx - 6, cx + 6, 24, 'dr4')
  for x = cx - 5, cx + 5, 3 do P(c, x, 25, 'm3') end
  ground(c, cx - 6, cx + 6, 28)
  return done(c, 10, 27)
end

-- ------------------------------------------------------------------ the well, the old well, the cart, the wheel
S.well = function()
  local c = new(64, 74); local cx = 32
  -- the posts and the little roof
  post(c, 9, 13, 14, 52, KB, false); post(c, 50, 54, 14, 52, KB, false)
  for y = 4, 14 do local t = (y - 4) / 10; for x = math.floor(cx - 14 - t * 16), math.ceil(cx + 14 + t * 16) do
    P(c, x, y, B.roofpx(c, 'shingle', x, y, 4, x < cx and 1 or 0, 3)) end end
  px.hline(c, cx - 31, cx + 31, 15, 'OUT2'); px.hline(c, cx - 14, cx + 14, 4, 'sh7')
  -- the crank, the rope, the bucket
  px.hline(c, 13, 50, 24, 'k4'); px.hline(c, 13, 50, 25, 'k2'); px.line(c, 50, 24, 56, 30, 'm2'); px.vline(c, 56, 30, 34, 'k4')
  px.vline(c, cx + 4, 26, 36, 'w5')
  R(c, cx + 1, 37, cx + 8, 43, 'w4'); px.hline(c, cx + 1, cx + 8, 37, 'w6'); px.hline(c, cx + 1, cx + 8, 40, 'm3')
  -- the stone ring: we see its top (dark water inside) and its front
  B.stones(c, 6, 50, 57, 69, 13, 6, function(x, y) return .66 - (x - 6) / 160 end)
  px.ellipse(c, cx + .5, 49, 26, 9, 's6'); px.ellipse(c, cx + .5, 49, 21, 6.5, 's3'); px.ellipse(c, cx + .5, 50, 19, 5.5, 'OUT')
  px.ellipse(c, cx - 4, 50, 6, 1.5, 'd2')
  for x = 8, 56, 7 do P(c, x, 44 + math.floor(math.abs(x - cx) / 8), 's5') end
  for x = 6, 57 do if H(x, 4) > .6 then P(c, x, 69, 'v3') end end
  ground(c, 6, 57, 71)
  return done(c, 32, 71)
end
S.rg_oldwell = function()
  local c = new(64, 48); local cx = 32
  B.stones(c, 7, 24, 56, 41, 17, 6, function(x, y) return .52 - (x - 7) / 160 end)
  px.ellipse(c, cx + .5, 24, 25, 9, 's5'); px.ellipse(c, cx + .5, 24, 20, 6.5, 's2'); px.ellipse(c, cx + .5, 25, 18, 5.5, 'OUT')
  for i = 0, 4 do local x = 10 + math.floor(H(i, 1) * 44); px.ellipse(c, x, 15 + math.floor(H(i, 2) * 4), 3, 2, 's4') end   -- fallen stones on the rim
  post(c, 50, 53, 6, 26, KB, false); for y = 6, 9 do for x = 50, 53 do if (x + y) % 2 == 0 then P(c, x, y, 0) end end end      -- one post, snapped
  px.line(c, cx - 3, 18, cx - 2, 26, 'w5')                                                                                        -- a rope over the edge, pulled tight
  for x = 7, 56 do if H(x, 5) > .4 then px.vline(c, x, 40, 41 - math.floor(H(x, 6) * 5), 'v2') end end
  ground(c, 7, 56, 43)
  return done(c, 32, 42)
end
S.cart = function()
  local c = new(84, 56)
  plankTop(c, 10, 70, 12, 20, WD, 3, 41)                                          -- the load bed, heaped with pumpkins
  for i = 0, 6 do local x, y = 16 + i * 8 + math.floor(H(i, 2) * 3), 14 - math.floor(H(i, 3) * 4)
    px.ellipse(c, x + .5, y + .5, 4.5, 3.5, 'r6'); px.ellipse(c, x - .5, y, 2, 2, 'r7'); px.vline(c, x, y - 4, y - 3, 'v3'); px.vline(c, x + 2, y - 2, y + 3, 'r5') end
  for y = 21, 34 do for x = 8, 72 do P(c, x, y, band(c, WD, .5 - (x - 8) / 200 - (((y - 21) % 5 == 4) and .25 or 0), 2, 6)) end end
  R(c, 8, 21, 10, 34, 'w6'); R(c, 70, 21, 72, 34, 'w3'); px.hline(c, 8, 72, 21, 'w2')
  px.line(c, 72, 30, 82, 34, 'w5'); px.line(c, 72, 31, 82, 35, 'w3')                                                          -- the shaft
  for _, wx in ipairs({22, 58}) do                                                                                              -- spoked wheels
    px.ellipse(c, wx + .5, 42.5, 11, 11, 'k2'); px.ellipse(c, wx + .5, 42.5, 9, 9, 0); px.ellipse(c, wx + .5, 42.5, 2.5, 2.5, 'm3')
    for a = 0, 5 do local an = a * math.pi / 3; px.line(c, wx, 42, wx + math.cos(an) * 9, 42 + math.sin(an) * 9, 'k4') end
    for y = 32, 53 do for x = wx - 11, wx + 11 do if px.get(c, x, y) == px.i(c, 'k2') and x < wx - 3 and y < 42 then P(c, x, y, 'k4') end end end end
  ground(c, 10, 70, 54)
  return done(c, 42, 53)
end
S.wheel = function()
  local c = new(46, 52); local cx, cy = 23, 26
  px.ellipse(c, cx + .5, cy + .5, 19, 21, 'k2'); px.ellipse(c, cx + .5, cy + .5, 16, 18, 0); px.ellipse(c, cx + 1.5, cy + .5, 18, 20, 'k4'); px.ellipse(c, cx + 1.5, cy + .5, 16, 18, 0)
  px.ellipse(c, cx + .5, cy + .5, 4, 4, 'k3'); px.ellipse(c, cx + .5, cy + .5, 2, 2, 'm3')
  for a = 0, 7 do local an = a * math.pi / 4; px.line(c, cx + math.cos(an) * 3, cy + math.sin(an) * 3, cx + math.cos(an) * 16, cy + math.sin(an) * 17.5, a % 2 == 0 and 'k4' or 'k3') end
  for y = 40, 47 do for x = 8, 38 do if px.get(c, x, y) ~= 0 and H(x, y) > .5 then P(c, x, y, 'v3') end end end   -- grass grown up through it
  ground(c, 6, 40, 48)
  return done(c, 23, 48)
end

-- ------------------------------------------------------------------ signs, boards, booths
S.mailbox = function()
  local c = new(30, 46); local cx = 15
  post(c, cx - 2, cx + 1, 20, 42, KB, false)
  R(c, cx - 11, 10, cx + 9, 20, 'bt3'); for x = cx - 11, cx + 9 do local h = math.floor(math.sqrt(math.max(0, 1 - ((x - cx + 1) / 10.5) ^ 2)) * 4); for y = 10 - h, 10 do P(c, x, y, y < 8 and 'bt4' or 'bt3') end end
  px.hline(c, cx - 11, cx + 9, 20, 'bt1'); R(c, cx - 11, 10, cx - 9, 20, 'bt5')
  R(c, cx + 10, 4, cx + 11, 14, 'dr4'); R(c, cx + 10, 4, cx + 14, 7, 'dr3')                                                   -- the flag
  R(c, cx - 11, 23, cx + 10, 30, 't5'); px.hline(c, cx - 11, cx + 10, 30, 't2'); B.text(c, cx - 10, 24, 'MARSH', 'OUT')   -- the name board on the post
  ground(c, cx - 3, cx + 3, 43)
  return done(c, 15, 43)
end
S.signpost = function()
  local c = new(40, 46); local cx = 20
  post(c, cx - 2, cx + 1, 6, 42, KB, true)
  for i, b in ipairs({{cx - 17, 9, cx + 12, -1}, {cx - 12, 20, cx + 17, 1}}) do local x0, y0, x1, dir = b[1], b[2], b[3], b[4]
    rail(c, x0, x1, y0, y0 + 6, WD, 50 + i)
    local tip = dir < 0 and x0 or x1; for k = 0, 3 do px.vline(c, tip + dir * k, y0 + k, y0 + 6 - k, WD[5 - (k > 1 and 1 or 0)]) end
    P(c, cx, y0 + 3, 'm2') end
  ground(c, cx - 3, cx + 3, 43)
  return done(c, 20, 43)
end
local function streetsign(text)
  local cw = math.max(39, #text * 4 + 13); local c = new(cw, 72); local cx = cw // 2
  cyl(c, cx - 1, cx + 1, 14, 68, IR, 2, 6); R(c, cx - 3, 66, cx + 3, 69, 'bt2')
  local w = #text * 4 + 7; local x0 = cx - w // 2
  R(c, x0, 3, x0 + w, 14, 'dg2'); px.hline(c, x0, x0 + w, 3, 'dg4'); px.hline(c, x0, x0 + w, 14, 'dg1')
  px.vline(c, x0 + 1, 4, 13, 't4'); px.vline(c, x0 + w - 1, 4, 13, 't4')
  B.text(c, x0 + 4, 6, text, 't5')
  R(c, cx - 1, 1, cx + 1, 3, 'bt4')
  return done(c, cw / 2, 69)
end
for k, t in pairs({main = 'MAIN ST', hill = 'HILL ST', market = 'MARKET ST', elm = 'ELM ST', church = 'CHURCH ST', orchard = 'ORCHARD LN', east = 'EAST AVE', green = 'GREEN ST', mill = 'MILL RD'}) do
  S['st_' .. k] = function() return streetsign(t) end end
S.board = function()
  local c = new(64, 58); local cx = 32
  post(c, 8, 12, 20, 54, KB, false); post(c, 51, 55, 20, 54, KB, false)
  for y = 3, 11 do local t = (y - 3) / 8; for x = math.floor(cx - 24 - t * 6), math.ceil(cx + 24 + t * 6) do P(c, x, y, B.roofpx(c, 'shingle', x, y, 3, x < cx and 1 or 0, 5)) end end
  px.hline(c, cx - 30, cx + 30, 12, 'OUT2')
  R(c, 5, 13, 58, 42, 'w3'); R(c, 7, 15, 56, 40, 'k5'); for y = 15, 40, 4 do px.hline(c, 7, 56, y, 'k4') end
  local notes = {{9, 17, 9, 12, 't5'}, {20, 16, 12, 16, 't4'}, {35, 18, 8, 10, 't5'}, {45, 16, 9, 13, 'p1'}, {11, 31, 10, 8, 't4'}, {38, 30, 12, 9, 't5'}}
  for i, n in ipairs(notes) do R(c, n[1], n[2], n[1] + n[3], n[2] + n[4], n[5]); P(c, n[1] + n[3] // 2, n[2], 'dr4')
    for y = n[2] + 3, n[2] + n[4] - 2, 2 do px.hline(c, n[1] + 2, n[1] + n[3] - 2 - (y % 3), y, 'pl3') end end
  R(c, 20, 16, 32, 29, 't5'); R(c, 20, 16, 32, 18, 'dr3'); px.ellipse(c, 26, 22.5, 3, 3.5, 'OUT'); P(c, 25, 22, 't5'); P(c, 27, 22, 't5'); px.hline(c, 22, 30, 27, 'pl3')   -- a MISSING poster: a face under a red band
  rail(c, 5, 58, 42, 44, WD, 61)
  ground(c, 7, 57, 55)
  return done(c, 32, 55)
end
S.phone_booth = function()
  local c = new(34, 70)
  local BL = B.WALLS.blue
  for y = 4, 65 do for x = 3, 30 do local u = (x - 3) / 27; P(c, x, y, band(c, BL, .62 - u * .45, 2, 7)) end end
  R(c, 2, 2, 31, 11, 'bb2'); px.hline(c, 2, 31, 2, 'bb5'); R(c, 6, 4, 27, 9, 't5'); B.text(c, 7, 5, 'PHONE', 'bb1')
  R(c, 7, 14, 26, 58, 'g2'); for x = 7, 26 do for y = 14, 58 do if (x - y) % 11 == 0 then P(c, x, y, 'g4') end end end
  for y = 14, 58, 11 do px.hline(c, 7, 26, y, 'bb2') end; px.vline(c, 16, 14, 58, 'bb2')
  R(c, 12, 26, 15, 34, 'OUT'); px.vline(c, 13, 34, 40, 'OUT')                                                              -- the receiver, off the hook
  R(c, 3, 62, 30, 66, 'bb1')
  ground(c, 2, 31, 67)
  return done(c, 17, 67)
end

-- ------------------------------------------------------------------ yards and gardens
S.birdbath = function()
  local c = new(30, 40); local cx = 15
  cyl(c, cx - 3, cx + 3, 14, 33, ST, 2, 7); R(c, cx - 6, 32, cx + 6, 36, 's5'); px.hline(c, cx - 6, cx + 6, 32, 's6')
  px.ellipse(c, cx + .5, 11, 13, 5, 's6'); px.ellipse(c, cx + .5, 12.5, 12, 4, 's4'); px.ellipse(c, cx + .5, 11, 10, 3, 'd3'); px.hline(c, cx - 6, cx - 1, 10, 'd5')
  P(c, cx + 4, 11, 'b2'); P(c, cx + 5, 11, 'b1')                                                                             -- something red in the water
  ground(c, cx - 6, cx + 6, 37)
  return done(c, 15, 37)
end
local function flowers(c, x0, x1, y0, y1, seed, dead)
  for i = 0, (x1 - x0) // 3 do local x = x0 + math.floor(H(i, seed) * (x1 - x0)); local y = y0 + math.floor(H(i, seed + 1) * (y1 - y0))
    px.vline(c, x, y, y1, dead and 'k3' or 'v3')
    local col = dead and 'k4' or ({'f1', 'f2', 'f3', 'f4', 't5'})[i % 5 + 1]
    P(c, x, y, col); P(c, x - 1, y, col); P(c, x + 1, y, col); P(c, x, y - 1, col); P(c, x, y, dead and 'k2' or 'y2') end
end
S.planter = function()
  local c = new(44, 34)
  for y = 15, 30 do for x = 3, 40 do P(c, x, y, band(c, WD, .52 - (x - 3) / 120 - (((y - 15) % 5 == 4) and .25 or 0), 2, 6)) end end
  R(c, 3, 13, 40, 15, 'w6'); px.hline(c, 3, 40, 13, 'w7'); R(c, 6, 11, 37, 13, 'k2')
  flowers(c, 6, 37, 2, 12, 71)
  ground(c, 3, 40, 31)
  return done(c, 22, 31)
end
local function gardenbed(flower)
  local c = new(84, 50)
  for y = 6, 40 do for x = 4, 79 do local soil = ((y - 6) % 9 < 6)
    P(c, x, y, soil and band(c, KB, .5 + (H(x // 2, y) - .5) * .3, 1, 4) or band(c, KB, .25, 1, 3)) end end
  for _, e in ipairs({{3, 4, 80, 6}, {3, 41, 80, 44}}) do R(c, e[1], e[2], e[3], e[4], 'w5'); px.hline(c, e[1], e[3], e[2], 'w7'); px.hline(c, e[1], e[3], e[4], 'w2') end
  for _, x in ipairs({3, 78}) do R(c, x, 4, x + 2, 44, 'w4') end
  for row = 0, 3 do local y = 10 + row * 9
    for x = 8, 76, 8 do local h = H(x, row + 1)
      if flower then local col = ({'f1', 'f2', 'f3', 'f4'})[(x // 8 + row) % 4 + 1]; px.vline(c, x, y - 2, y + 3, 'v3'); px.ellipse(c, x + .5, y - 2, 2, 2, col); P(c, x, y - 2, 'y2')
      else for k = -2, 2 do px.line(c, x, y + 3, x + k * 1.5, y - 2 - math.abs(k) * -.5, (k == 0) and 'v5' or 'v3') end
        if h > .6 then px.ellipse(c, x + .5, y + 3, 2, 1.5, 'r6') end end end end
  ground(c, 3, 80, 46)
  return done(c, 42, 46)
end
S.gardenbed = function() return gardenbed(false) end
S.gardenbed_b = function() return gardenbed(true) end
local function clothesline(stained)
  local c = new(112, 70)
  post(c, 4, 7, 6, 64, KB, false); post(c, 104, 107, 6, 64, KB, false); px.hline(c, 1, 10, 8, 'k4'); px.hline(c, 101, 110, 8, 'k4')
  for x = 8, 104 do P(c, x, 10 + math.floor(math.sin((x - 8) / 96 * math.pi) * 4), 'k3') end
  local items = {{16, 18, 'ww', 22}, {38, 16, 'ww', 18}, {58, 15, 'bb', 14}, {78, 17, stained and 'ww' or 'f', 20}}
  for i, it in ipairs(items) do local x0, w, mat, h = it[1], it[2], it[3], it[4]
    local top = 10 + math.floor(math.sin((x0 - 8) / 96 * math.pi) * 4) + 1
    for y = top, top + h do for x = x0, x0 + w do local u = (x - x0) / w
      local wav = math.sin(x * .5 + y * .1) * .08
      local col = mat == 'f' and band(c, {'f2', 'f3', 'f4'}, .6 - u * .3 + wav, 1, 3) or band(c, B.WALLS[mat == 'ww' and 'white' or 'blue'], .72 - u * .3 + wav - (y - top) / 120, 3, 7)
      P(c, x, y, col) end end
    for x = x0, x0 + w, 2 do P(c, x, top + h + 1, mat == 'f' and 'f2' or (mat == 'bb' and 'bb3' or 'ww4')) end
    px.vline(c, x0 + 1, top - 1, top + 1, 'k5'); px.vline(c, x0 + w - 1, top - 1, top + 1, 'k5')
    if stained and i == 4 then for k = 0, 8 do local x, y = x0 + 6 + math.floor(H(k, 1) * 9), top + 3 + math.floor(H(k, 2) * 12); P(c, x, y, 'b2'); P(c, x, y + 1, 'b1') end
      px.ellipse(c, x0 + 10, top + 8, 3, 3.5, 'b2') end end
  ground(c, 3, 108, 66)
  return done(c, 56, 66)
end
S.clothesline = function() return clothesline(false) end
S.clothesline_b = function() return clothesline(true) end

-- ------------------------------------------------------------------ the dead
local function headstone(w, h, kind, seed)
  local c = new(w, h); local cx = w / 2; local by = h - 3
  local x0, x1, top = math.floor(cx - w * .32), math.ceil(cx + w * .32), 6
  for y = top, by - 3 do for x = x0, x1 do local u = (x - x0) / (x1 - x0)
    local arch = (kind == 'round') and math.sqrt(math.max(0, 1 - ((x - cx) / ((x1 - x0) / 2)) ^ 2)) * 8 or 0
    if y >= top + 8 - arch or kind ~= 'round' then P(c, x, y, band(c, ST, .76 - u * .5 + (H(x // 3, y // 3 + seed) - .5) * .1, 2, 7)) end end end
  for y = top, by - 3 do P(c, x1 + 1, y + 2, 's2'); P(c, x1 + 2, y + 3, 's1') end
  if kind == 'cross' then local mx = math.floor(cx); px.vline(c, mx, top + 6, top + 16, 's2'); px.hline(c, mx - 3, mx + 3, top + 9, 's2') else B.text(c, math.floor(cx) - 5, top + 6, 'RIP', 's2') end
  for y = top + 20, by - 6, 3 do px.hline(c, x0 + 4, x1 - 4 - (y % 4), y, 's3') end
  for x = x0 - 2, x1 + 2 do if H(x, seed + 3) > .4 then px.vline(c, x, by - 3 - math.floor(H(x, seed) * 5), by - 1, 'v3') end end
  R(c, x0 - 3, by - 3, x1 + 4, by - 1, 's4'); px.hline(c, x0 - 3, x1 + 4, by - 3, 's6')
  return done(c, cx, by)
end
S.grave_0 = function() return headstone(47, 44, 'cross', 1) end
S.grave_3 = function() return headstone(47, 44, 'cross', 2) end
S.grave_1 = function() return headstone(28, 27, 'round', 3) end
S.grave_2 = function()
  local c = new(18, 29); local cx = 9
  post(c, cx - 1, cx + 1, 3, 26, KB, false); R(c, cx - 6, 8, cx + 6, 10, 'k4'); px.hline(c, cx - 6, cx + 6, 8, 'k6'); px.hline(c, cx - 6, cx + 6, 10, 'k2')
  px.line(c, cx - 4, 9, cx - 2, 14, 'f2')                                                                                        -- a ribbon tied on
  ground(c, cx - 4, cx + 4, 27)
  return done(c, 9, 27)
end
S.memorial = function()
  local c = new(54, 104); local cx = 27
  for y = 8, 86 do local t = (y - 8) / 78; local hw = 5 + t * 7; for x = math.floor(cx - hw), math.ceil(cx + hw) do local u = (x - cx) / hw
    P(c, x, y, band(c, ST, .72 - u * .45 + (u < -.5 and .1 or 0), 2, 7)) end end
  for i = 0, 6 do px.hline(c, cx - 4 + i // 3, cx + 4 - i // 3, 8 - i, ST[7 - i // 3]) end
  R(c, cx - 7, 46, cx + 7, 66, 'y1'); px.hline(c, cx - 7, cx + 7, 46, 'y2'); for y = 50, 64, 3 do px.hline(c, cx - 5, cx + 5 - (y % 4), y, 'OUT2') end
  R(c, cx - 15, 86, cx + 15, 92, 's5'); px.hline(c, cx - 15, cx + 15, 86, 's7'); R(c, cx - 19, 93, cx + 19, 98, 's4'); px.hline(c, cx - 19, cx + 19, 93, 's6')
  flowers(c, cx - 14, cx + 14, 82, 90, 9, false)
  ground(c, cx - 19, cx + 19, 100)
  return done(c, 27, 100)
end
S.cellardoor = function()
  local c = new(56, 40)
  B.stones(c, 2, 22, 53, 34, 23, 5, function() return .55 end)
  for y = 6, 22 do local t = (y - 6) / 16; for x = 6, 49 do local leaf = x < 28 and 1 or 2
    local l = .7 - t * .3 - (((x - 6) % 6 == 0) and .25 or 0) - (leaf == 2 and .12 or 0); P(c, x, y, band(c, WD, l, 2, 7)) end end
  px.vline(c, 27, 6, 22, 'OUT'); px.vline(c, 28, 6, 22, 'w2'); px.hline(c, 6, 49, 6, 'w7')
  for _, y in ipairs({10, 18}) do px.hline(c, 8, 25, y, 'm2'); px.hline(c, 30, 47, y, 'm2') end
  px.line(c, 22, 14, 33, 16, 'm3'); px.line(c, 22, 15, 33, 17, 'm1'); R(c, 26, 16, 29, 20, 'm4'); P(c, 27, 18, 'OUT')            -- a chain and a new padlock
  ground(c, 2, 53, 36)
  return done(c, 28, 36)
end
S.fountain = function()
  local c = new(104, 96); local cx = 52
  -- the basin: rim seen from above, water inside, front wall
  B.stones(c, 8, 62, 95, 84, 31, 6, function(x, y) return .64 - (x - 8) / 260 end)
  px.ellipse(c, cx + .5, 60, 46, 17, 's6'); px.ellipse(c, cx + .5, 61, 41, 14, 's3'); px.ellipse(c, cx + .5, 62, 39, 12.5, 'd3')
  for i = 0, 10 do local a = H(i, 1) * 6.28; local r = .3 + H(i, 2) * .6; px.hline(c, math.floor(cx + math.cos(a) * 36 * r), math.floor(cx + math.cos(a) * 36 * r) + 4, math.floor(62 + math.sin(a) * 10 * r), 'd5') end
  -- the pedestal and its bowl, water falling in arcs
  cyl(c, cx - 4, cx + 4, 30, 62, ST, 2, 7)
  px.ellipse(c, cx + .5, 30, 14, 5, 's6'); px.ellipse(c, cx + .5, 32, 13, 4, 's4'); px.ellipse(c, cx + .5, 30, 11, 3, 'd4')
  cyl(c, cx - 2, cx + 2, 16, 29, ST, 3, 7); R(c, cx - 3, 13, cx + 3, 16, 's6')
  for _, s in ipairs({-1, 1}) do for t = 0, 16 do local x = cx + s * (3 + t * .9); local y = 14 + t * t * .1 - t * .4; P(c, x, y, 'g6') end
    for t = 0, 22 do local x = cx + s * (12 + t * .7); local y = 31 + t * t * .05 + t * .5; P(c, x, y, 'g5') end end
  P(c, cx, 12, 'g6'); P(c, cx, 11, 'g6')
  ground(c, 8, 95, 86)
  return done(c, 52, 86)
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
