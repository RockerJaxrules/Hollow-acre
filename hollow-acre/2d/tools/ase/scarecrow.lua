-- The scarecrow in your field: the Hollow's coat and pumpkin, hung on a post. Drawn in Aseprite, one sheet of 64x124 frames,
-- anchor (32, 120) at the foot of the post. Its arms are tied along the crossbar with long grey fingers hanging limp from
-- the cuffs; straw pokes out at the cuffs, the collar and the trouser legs; the legs dangle clear of the ground.
-- Clips:  idle S x4 / idle N x4 : the wind (tatters, a sleeve and the legs swing a little after each other)
--         look S x6             : the slumped head lifts and turns to you, the eyes kindle, the fingers curl
local dir = app.params['dir'] or '.'
local out = app.params['out'] or dir
local px = dofile(app.fs.joinPath(dir, 'px.lua'))

local RAMPS = {
  co = {'#0e0a14', '#1a1424', '#2a1e36', '#3a2a4a', '#4e3a5e', '#6a5276'},
  lg = {'#14100e', '#2a221e', '#423630', '#5e4e44'},
  ha = {'#3e3e46', '#6a6a72', '#9a9a9c', '#c8c4ba'},
  pk = {'#4a1a10', '#7a2a10', '#a84210', '#d0661a', '#ec8a26', '#f6b048', '#fcd890'},
  gw = {'#3a0800', '#c83a00', '#ff8a1a', '#ffe08a'},
  st = {'#1e2a10', '#3a4a1a', '#5a6a2a'},
  sw = {'#6a4a18', '#9a7424', '#c8a038', '#e8c860'},      -- straw
  wd = {'#2a1a10', '#4a3020', '#6a4630', '#8a6040'},      -- the post
  rp = {'#3a2a1a', '#6a5236'},
  ow = {'#1a1418', '#3a3034'},                            -- a crow
}
local PAL = {{'OUT', '#120a10'}}
for k, cols in pairs(RAMPS) do for i, h in ipairs(cols) do PAL[#PAL + 1] = {k .. i, h} end end
local function R_(k) local r = {}; for i = 1, #RAMPS[k] do r[i] = k .. i end return r end
local CO, LG, HA, PK, GW, SW, WD = R_('co'), R_('lg'), R_('ha'), R_('pk'), R_('gw'), R_('sw'), R_('wd')

local FW, FH, AX, AY = 64, 124, 32, 120
local ROWS = {{'idle', 'S', 4}, {'idle', 'N', 4}, {'look', 'S', 6}}
local c = px.new(FW * 6, FH * #ROWS, PAL)
local OX, OY = 0, 0
local function H(a, b) return px.h(a, b) end
local function band(r, l, lo, hi) return px.band(c, r, l, lo, hi) end
local function P(x, y, col) local fx, fy = OX + AX + math.floor(x), OY + AY + math.floor(y)
  if fx < OX or fx >= OX + FW or fy < OY or fy >= OY + FH then return end; px.p(c, fx, fy, col) end
local function line(x0, y0, x1, y1, w, r, lit)
  local n = math.max(1, math.ceil(math.max(math.abs(x1 - x0), math.abs(y1 - y0)) * 1.5))
  for i = 0, n do local t = i / n; local x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
    for k = 0, w - 1 do local o = k - (w - 1) / 2; local l = (lit or .55) + (w > 1 and (-o / w) * .7 or 0)
      if math.abs(y1 - y0) >= math.abs(x1 - x0) then P(x + o + .5, y + .5, band(r, l, 1, #r)) else P(x + .5, y + o + .5, band(r, l, 1, #r)) end end end
end
local function fill(pts, colf)
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
local function straw(x, y, n, ang, seed)                         -- a tuft of straw poking out
  for i = 0, n - 1 do local a = ang + (H(i, seed) - .5) * 1.1; local len = 3 + math.floor(H(i, seed + 1) * 4)
    line(x, y, x + math.cos(a) * len, y + math.sin(a) * len, 1, SW, .5 + H(i, seed + 2) * .4) end
end
local function pumpkin(cx, cy, view, glow, tilt)                 -- smaller than the Hollow's: rx 10, ry 8
  ellipse(cx, cy, 10, 8, function(x, y, dx, dy) local rib = math.abs(math.sin((dx + tilt * .08) * 3.2))
    return band(PK, .62 - dx * .3 - dy * .35 - (1 - rib) * .28, 1, 7) end)
  line(cx + tilt, cy - 8, cx + tilt + 2, cy - 12, 2, R_('st'), .6)
  if view == 'N' then for k = -1, 1 do line(cx + k * 4, cy - 6, cx + k * 4, cy + 6, 1, {'pk2', 'pk2', 'pk3'}, .4) end; return end
  local G = function(k) if glow <= 0 then return ({'pk1', 'OUT', 'pk1', 'pk1'})[k] end
    return GW[math.max(1, math.min(4, k - (glow < .5 and 1 or 0)))] end
  for _, e in ipairs({{-4, 0}, {4, -1}}) do local ex, ey = cx + e[1] + tilt, cy - 3 + e[2]
    for j = 0, 3 do for i = -j, j do P(ex + i * .7, ey + j, glow > 0 and (j == 3 and G(3) or G(4)) or 'OUT') end end end
  for i = -6, 6 do local edge = math.abs(i) / 6; local top = cy + 3 + math.floor(edge * edge * 2)
    for y = top, top + 2 - math.floor(edge) do P(cx + i + tilt, y, (i % 3 == 0) and 'pk4' or (glow > 0 and G(3) or 'OUT')) end end
end
local function hand(x, y, curl, far)
  local r = far and {'ha1', 'ha1', 'ha2', 'ha3'} or HA
  ellipse(x, y, 1.8, 2, function() return r[3] end)
  for i = -1.5, 1.5 do local a = math.pi / 2 + i * .18 - curl * .9; local len = 7
    local kx, ky = x + i * 1.2, y + 4
    line(x + i, y + 1, kx, ky, 1, r, .7); line(kx, ky, kx + math.cos(a) * (len - 3), ky + math.sin(a) * (len - 3), 1, r, .5) end
end

-- ------------------------------------------------------------------ one frame
local function frame(view, f, look)
  local ph = f / 4 * math.pi * 2; local wind = math.sin(ph)
  local barY, postTop = -80, -88
  -- the post and crossbar, the crossbar lashed with rope
  line(0, 0, 0, postTop, 4, WD, .6); for y = -10, -2, 4 do P(-2, y, 'wd1') end
  line(-27, barY, 27, barY, 3, WD, .6); for k = -1, 1, 2 do P(k * 1, barY - 1, 'rp2'); P(k * 2, barY + 1, 'rp1') end
  -- the dangling legs (behind the coat), straw out of the trouser ends
  for _, s in ipairs({-1, 1}) do local sw = math.floor(wind * (s < 0 and 1.5 or 1) + .5)
    line(s * 4, -40, s * 5 + sw, -18, 3, LG, .55); straw(s * 5 + sw, -17, 4, math.pi / 2, 11 + s) end
  -- the coat on the crossbar: sleeves along the bar, the body hanging, ragged and stirring
  local hem = -36
  local pts = {{-9, barY + 1}, {9, barY + 1}}
  for i = 0, 8 do local t = i / 8; local x = 13 - t * 26 + math.floor(wind * (1 - t) * 1.5)
    pts[#pts + 1] = {x, hem + ((i % 2 == 1) and (3 + math.floor(H(i, 7) * 4)) or 0) + math.floor(math.sin(i + ph) * 1.2)} end
  fill(pts, function(x, y) local l = .55 - x / 34 - (y - barY) / 120; if (x + math.floor(y / 7)) % 7 == 0 and y > barY + 6 then l = l - .2 end
    return band(CO, l, 1, 6) end)
  for x = -10, 10 do P(x, -54, 'rp1'); if x % 3 == 0 then P(x, -55, 'rp2') end end                          -- the rope belt
  for _, s in ipairs({-1, 1}) do                                                                            -- sleeves, one lifting in the wind
    local lift = (s > 0) and math.floor(wind * 1.5 + .5) or 0
    for x = 6, 22 do local t = (x - 6) / 16; for y = -2, 3 do P(s * x, barY + y - math.floor(lift * t) + (t > .8 and 1 or 0), band(CO, (y < 0 and .7 or .45) - t * .1, 1, 6)) end end
    local cx = s * 23; local cy = barY + 2 - lift
    straw(cx + s * 2, cy, 5, s < 0 and math.pi or 0, 21 + s)
    hand(cx, cy + 3, look, false) end
  if view == 'S' then line(0, barY + 2, 0, hem, 1, {'co1', 'co1', 'co2'}, .3) end
  for _, k in ipairs({-1, 1}) do fill({{k * 2, barY + 1}, {k * 6, barY - 5}, {k * 7, barY + 3}}, function() return k < 0 and 'co4' or 'co2' end) end   -- a high collar
  straw(0, barY - 3, 6, -math.pi / 2, 31)                                                                   -- straw out of the collar
  -- the head on the post top: slumped forward and to one side, lifting and turning when it looks at you
  local lift = look; local tilt = math.floor((1 - lift) * 3 + .5)
  local hx, hy = 2 * (1 - lift) + (view == 'S' and 0 or 0), postTop - 6 + math.floor((1 - lift) * 3)
  if view == 'N' then pumpkin(hx, hy, 'N', 0, tilt)
  else pumpkin(hx, hy, (lift > .2 or f == 0) and 'S' or 'S', lift > .5 and (lift - .5) * 2 or 0, -tilt + (lift > .6 and 0 or 0)) end
  if f == 2 and look == 0 and view == 'S' then                                                              -- now and then a crow on the crossbar
    ellipse(-17, barY - 4, 3.5, 2.5, function() return 'ow1' end); P(-20, barY - 5, 'ow2'); P(-21, barY - 5, 'pk5'); P(-15, barY - 1, 'ow1') end
end

for r, row in ipairs(ROWS) do local clip, d, n = row[1], row[2], row[3]
  for f = 0, n - 1 do OX, OY = f * FW, (r - 1) * FH
    local look = (clip == 'look') and math.min(1, f / 4) or 0
    frame(d, clip == 'look' and (f % 4) or f, look) end end
px.outline(c, px.i(c, 'OUT'))
c.weather = {speck = .06, grime = 0, round = .6, radius = 2, mottle = .18}
px.save(c, app.fs.joinPath(out, 'scarecrow.png'))
print('META scarecrow done')
