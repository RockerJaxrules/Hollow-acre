-- The horror in the art: blood, kills, the things left out in the swamp and the woods, and the small litter of the
-- ground (fallen leaves, twigs, ivy). Its own hue-shifted palette: blood runs from near-black maroon through red to a
-- wet pink gloss, dries to brown; flesh, bone and fur have their own ramps. Same sizes and anchors as the old sprites.
-- Also draws g_dec_<size><shape> and g_dry_<size><shape>: blood splats for the ground that the game lays where you bleed.
local dir = app.params['dir'] or '.'
local out = app.params['out'] or dir
local only = app.params['only']
local px = dofile(app.fs.joinPath(dir, 'px.lua'))

local RAMPS = {
  bl = {'#1e0608', '#3a080c', '#5e0c10', '#8a1418', '#b82222', '#e04a3a', '#f4a090'},
  dd = {'#24100c', '#3e1a12', '#5a2a1a', '#74402a'},
  fl = {'#4a1a22', '#7a2a32', '#a8444a', '#cc6a68', '#e89a90'},
  bn = {'#5a5248', '#8a8070', '#bcb29e', '#e6dcc6'},
  fu = {'#2a1812', '#4a2a1a', '#6e4224', '#94603a', '#b88050', '#d8a878'},
  rb = {'#3a3230', '#5e5450', '#8a7e76', '#b8aea4'},
  k = {'#1e1218', '#34201e', '#4e3024', '#6c4430', '#8a5c3a', '#a87848'},
  m = {'#2a2a34', '#4a4c58', '#7a7c88', '#b0b2bc'},
  s = {'#24222c', '#36343e', '#4e4c5e', '#6a687a', '#8a8898', '#acaab6'},
  d = {'#2a1c16', '#3e2a1e', '#56402a', '#705638', '#8a6e48', '#a68a5e'},
  c = {'#0e0c0e', '#1c181c', '#2e2828', '#463c38', '#6a5a50'},
  e = {'#c8501e', '#f0a040'},
  w = {'#2a2430', '#6a6070', '#dcd6d2', '#f4f0e8'},
  x = {'#e8dcc8', '#c89aa0', '#8aa0c0', '#c8b070', '#7a8a6a'},
  j = {'#2a3a2a', '#4a5a3a', '#7a8a5a', '#c8d8b0'},
  lo = {'#5a2a1e', '#7a2e22', '#a84a24', '#d06e28', '#ec9a34', '#f6c45a', '#8a6a28', '#c49e28'},
  gr = {'#1e3a26', '#2a4a2a', '#3e6634', '#5a8a40', '#86b050'},
  t = {'#8a7a5a', '#c8b88a', '#efe4c4'},
}
local PAL = {{'OUT', '#1a0e12'}}
for k, cols in pairs(RAMPS) do for i, h in ipairs(cols) do PAL[#PAL + 1] = {k .. i, h} end end
local function R_(k) local r = {}; for i = 1, #RAMPS[k] do r[i] = k .. i end return r end
local BL, DD, FL, BN, FU, RB, K, MT, ST, DT, CH, WB, GR = R_('bl'), R_('dd'), R_('fl'), R_('bn'), R_('fu'), R_('rb'), R_('k'), R_('m'), R_('s'), R_('d'), R_('c'), R_('w'), R_('gr')

local function P(c, x, y, col) px.p(c, x, y, col) end
local function R(c, x0, y0, x1, y1, col) px.rect(c, x0, y0, x1, y1, col) end
local function H(a, b) return px.h(a, b) end
local function band(c, r, l, lo, hi) return px.band(c, r, l, lo, hi) end
local function new(w, h) return px.new(w, h, PAL) end
local function done(c, ax, ay, noline) if not noline then px.outline(c, px.i(c, 'OUT')) end; return c, {w = c.w, h = c.h, ax = ax, ay = ay} end
-- a lumpy blob: an ellipse whose edge wobbles, shaded from the top-left
local function blob(c, cx, cy, rx, ry, r, seed, lift, lo, hi)
  for y = math.floor(cy - ry - 2), math.ceil(cy + ry + 2) do for x = math.floor(cx - rx - 2), math.ceil(cx + rx + 2) do
    local dx, dy = (x + .5 - cx) / rx, (y + .5 - cy) / ry; local th = math.atan(dy, dx)
    local e = 1 + .16 * math.sin(th * 5 + seed) + .1 * math.sin(th * 9 + seed * 2)
    local d = math.sqrt(dx * dx + dy * dy) / e
    if d <= 1 then P(c, x, y, band(c, r, (lift or .55) - dx * .25 - dy * .3 - d * .15, lo or 1, hi or #r)) end end end
end
-- wet blood: a pool with a dark rim, a lighter middle, a gloss
local function pool(c, cx, cy, rx, ry, seed, dry)
  local r = dry and DD or BL
  blob(c, cx, cy, rx, ry, r, seed, .55, 1, dry and 4 or 5)
  if not dry then P(c, math.floor(cx - rx * .35), math.floor(cy - ry * .4), 'bl7'); P(c, math.floor(cx - rx * .35) + 1, math.floor(cy - ry * .4), 'bl6') end
end
local function drops(c, cx, cy, n, spread, seed, dry)
  for i = 0, n - 1 do local a = H(i, seed) * 6.283; local d = spread * (.45 + H(i, seed + 1) * .6)
    local x, y = cx + math.cos(a) * d, cy + math.sin(a) * d * .5
    local col = dry and 'dd2' or (H(i, seed + 2) > .5 and 'bl4' or 'bl3')
    P(c, x, y, col); if H(i, seed + 3) > .4 then P(c, x + 1, y, col) end
    if H(i, seed + 4) > .55 then for k = 1, 2 + math.floor(H(i, seed + 5) * 3) do P(c, x + math.cos(a) * k, y + math.sin(a) * k * .5, dry and 'dd1' or 'bl2') end end end   -- streaks flung outward
end

local S = {}

-- ------------------------------------------------------------------ blood on the ground
S.g_spatter = function() local c = new(48, 22); pool(c, 22, 11, 7, 3.5, 3); drops(c, 22, 11, 16, 14, 7); return done(c, 24, 12, true) end
S.g_blood = function() local c = new(44, 20); pool(c, 21, 9, 15, 5.5, 5); pool(c, 31, 12, 6, 2.5, 9); drops(c, 21, 10, 8, 18, 11); return done(c, 22, 10, true) end
S.g_drag = function()
  local c = new(64, 16)
  for _, off in ipairs({-2, 3}) do
    for x = 2, 61 do local t = (x - 2) / 59; if H(x // 3, off) > .18 + t * .3 then
      local y = 8 + off + math.floor(math.sin(x * .2 + off) * .8); local col = t < .55 and (H(x, off) > .5 and 'bl4' or 'bl3') or (t < .8 and 'bl2' or 'dd2')
      P(c, x, y, col); if H(x, off + 3) > .45 then P(c, x, y + 1, t < .5 and 'bl2' or 'dd1') end end end end
  pool(c, 6, 8, 4, 3, 13)
  return done(c, 32, 8, true)
end
-- splats the game lays where someone bleeds: three sizes, two shapes, wet and dried
for _, sz in ipairs({{'s', 12, 8, 3, 1.6}, {'m', 20, 12, 5, 2.6}, {'l', 30, 16, 8, 4}}) do for shp = 0, 1 do
  for _, dry in ipairs({false, true}) do
    S[(dry and 'g_dry_' or 'g_dec_') .. sz[1] .. shp] = function()
      local c = new(sz[2], sz[3]); local cx, cy = sz[2] / 2, sz[3] / 2
      pool(c, cx - (shp == 1 and 1 or 0), cy, sz[4], sz[5], 20 + shp * 7, dry)
      if shp == 1 then pool(c, cx + sz[4] * .7, cy + sz[5] * .5, sz[4] * .45, sz[5] * .5, 31, dry) end
      drops(c, cx, cy, math.floor(sz[4] * 1.4), sz[4] * 1.3, 40 + shp, dry)
      return done(c, sz[2] / 2, sz[3] / 2, true)
    end end end end

-- ------------------------------------------------------------------ the kills
local function rabbitBody(c, cx, cy, open)
  blob(c, cx, cy, 9, 4.5, RB, 1, .6)
  blob(c, cx - 9, cy - 2, 3.5, 3, RB, 2, .65)                                                       -- the head
  for k = 0, 5 do P(c, cx - 11 - k, cy - 4 - math.floor(k * .4), k < 4 and 'rb3' or 'rb2'); P(c, cx - 11 - k, cy - 3 - math.floor(k * .4), 'rb2') end   -- an ear laid back
  P(c, cx - 10, cy - 3, 'OUT')
  for _, l in ipairs({{cx - 5, 1}, {cx + 5, -1}}) do px.line(c, l[1], cy + 3, l[1] + l[2] * -4, cy + 6, 'rb2') end
  px.ellipse(c, cx + 9, cy - 1, 2, 2, 'x1')                                                          -- the tail
  if open then blob(c, cx + 1, cy + 1, 5, 2, FL, 3, .6); for k = 0, 4 do P(c, cx - 3 + k * 2, cy + 1, k % 2 == 0 and 'fl5' or 'bl4') end
    px.line(c, cx + 4, cy + 2, cx + 10, cy + 5, 'fl3'); px.line(c, cx + 10, cy + 5, cx + 13, cy + 4, 'fl4') end
end
S.g_rabbit = function()
  local c = new(40, 24); pool(c, 21, 17, 12, 3.5, 2); rabbitBody(c, 22, 12, true)
  for i = 0, 8 do local x, y = 6 + math.floor(H(i, 5) * 30), 4 + math.floor(H(i, 6) * 16); P(c, x, y, 'rb3') end   -- fur, everywhere
  return done(c, 20, 16)
end
S.g_ribs = function()
  local c = new(44, 36); local cx = 22
  pool(c, cx, 31, 12, 3, 4)
  for y = 6, 30 do P(c, cx, y, y % 3 == 0 and 'bn2' or 'bn3'); P(c, cx + 1, y, 'bn2') end
  for i = 0, 6 do local y = 9 + i * 3; local w = 10 - math.abs(i - 3) * 1.2
    for _, s in ipairs({-1, 1}) do for t = 0, 10 do local a = t / 10 * 1.9
      local x = cx + s * math.sin(a) * w; local yy = y + (1 - math.cos(a)) * 4
      P(c, x, yy, s < 0 and 'bn4' or 'bn2') end end
    if H(i, 7) > .55 then P(c, cx - 4, y + 2, 'fl3'); P(c, cx - 5, y + 2, 'fl2') end end
  return done(c, 22, 31)
end
local function deer(c, cx, cy, open, seed)
  blob(c, cx, cy, 20, 7, FU, seed, .62)
  for x = cx - 14, cx + 12 do P(c, x, cy + 5, 'fu6') end                                            -- the pale belly
  for k = 0, 9 do local x, y = cx - 20 - k, cy - 2 - k * .9; for w = 0, 2 do P(c, x, y + w, band(c, FU, .6 - w * .2, 1, 6)) end end   -- the neck
  blob(c, cx - 31, cy - 11, 5, 3.5, FU, seed + 1, .66); P(c, cx - 33, cy - 12, 'OUT'); P(c, cx - 36, cy - 10, 'c1')     -- head, eye, nose
  px.line(c, cx - 29, cy - 14, cx - 26, cy - 18, 'fu3'); px.line(c, cx - 28, cy - 14, cx - 24, cy - 16, 'fu4')        -- ear
  for i, l in ipairs({cx - 14, cx - 9, cx + 9, cx + 14}) do px.line(c, l, cy + 5, l + (i <= 2 and -6 or 6), cy + 12, 'fu3'); P(c, l + (i <= 2 and -6 or 6), cy + 12, 'c1') end   -- legs, stiff
  for k = 0, 6 do P(c, cx - 8 + k * 3, cy - 3, 'fu6') end                                            -- spots
  if open then blob(c, cx + 1, cy + 2, 10, 3.5, FL, seed + 2, .55)
    for i = 0, 5 do local x = cx - 7 + i * 3; px.line(c, x, cy, x + 1, cy + 4, 'bn4') end end
end
S.deer_dead = function() local c = new(64, 30); deer(c, 40, 17, false, 3); pool(c, 22, 25, 6, 1.6, 5); return done(c, 32, 27) end
S.g_deer_open = function()
  local c = new(72, 40); pool(c, 40, 28, 18, 5, 6)
  deer(c, 44, 20, true, 7)
  for i = 0, 11 do local a = -math.pi / 2 + i / 12 * 6.283; local x, y = 40 + math.cos(a) * 30, 20 + math.sin(a) * 15   -- twelve pieces in a ring, the heart at the top
    if i == 0 then blob(c, x, y - 1, 3, 3.5, BL, 11, .6, 3, 6); P(c, x - 1, y - 3, 'bl7')
    else blob(c, x, y, 2 + H(i, 3), 1.5 + H(i, 4), FL, i, .55) end end
  return done(c, 36, 30)
end
S.g_hooks = function()
  local c = new(64, 84)
  for _, x in ipairs({4, 56}) do for y = 6, 80 do for k = 0, 3 do P(c, x + k, y, band(c, K, .7 - k * .2, 2, 6)) end end end
  for y = 4, 9 do for x = 2, 61 do P(c, x, y, band(c, K, y < 6 and .85 or .45, 2, 6)) end end
  for i, hx in ipairs({17, 32, 47}) do px.vline(c, hx, 10, 16, 'm3'); px.line(c, hx, 16, hx + 2, 19, 'm4')
    local top = 19; local len = (i == 3) and 34 or 40
    for y = top, top + len do local t = (y - top) / len; local w = math.floor(math.sin(t * math.pi) * 6) + 2
      for x = hx - w, hx + w do local u = (x - hx) / w
        local col = (i == 3) and band(c, R_('x'), .9 - (x - hx + w) / 30, 1, 1) or band(c, FL, .7 - u * .4 - ((y - top) % 5 == 0 and .25 or 0), 1, 5)
        if i ~= 3 and math.abs(u) < .25 and (y % 4 == 0) then col = 'bn4' end
        P(c, x, y, col) end end
    if i == 3 then for y = top + 4, top + len - 2, 6 do px.hline(c, hx - 5, hx + 5, y, 't1') end; for y = top + 20, top + 30 do P(c, hx + 2, y, 'bl4') end end   -- one of them is wrapped
    for k = 0, 3 do P(c, hx + (k % 2), top + len + 4 + k * 5, 'bl4') end end
  pool(c, 32, 79, 22, 3, 9)
  return done(c, 32, 80)
end
S.g_coffins = function()
  local c = new(70, 36)
  for i = 0, 2 do local cx = 13 + i * 22; local top = 4 + (i == 1 and 2 or 0)
    local pts = {{cx - 5, top}, {cx + 5, top}, {cx + 8, top + 7}, {cx + 5, top + 26}, {cx - 5, top + 26}, {cx - 8, top + 7}}
    px.poly(c, pts, function(x, y) return band(c, K, .78 - (x - cx + 8) / 40 - (((x - cx + 20) % 5 == 0) and .18 or 0), 3, 6) end)
    for _, q in ipairs({{cx, top + 4}, {cx, top + 10}}) do px.vline(c, q[1], q[2], q[2] + 6, 'k3') end; px.hline(c, cx - 2, cx + 2, top + 6, 'k3')   -- a cross scratched in
    if i == 2 then px.line(c, cx - 8, top + 8, cx + 5, top + 27, 'OUT'); px.line(c, cx - 7, top + 8, cx + 6, top + 27, 'c2') end   -- this lid doesn't sit right
    for x = cx - 5, cx + 5 do P(c, x, top + 27, 'k1') end end
  return done(c, 35, 31)
end
S.g_grave = function()
  local c = new(64, 40)
  for y = 8, 30 do for x = 8, 44 do local d = math.min(y - 8, 30 - y, x - 8, 44 - x)
    P(c, x, y, d < 3 and band(c, DT, .6 - (y - 8) / 40, 2, 6) or (y < 14 and 'd2' or 'c1')) end end
  for k = 0, 5 do local x = 10 + math.floor(H(k, 3) * 30); px.line(c, x, 10, x + 2, 15, 'd2') end      -- roots in the walls
  blob(c, 52, 22, 11, 9, DT, 3, .62, 2, 6)
  for k = 0, 10 do P(c, 46 + math.floor(H(k, 5) * 14), 16 + math.floor(H(k, 6) * 12), 's4') end
  px.line(c, 54, 4, 52, 20, 'k4'); px.line(c, 55, 4, 53, 20, 'k5'); R(c, 50, 19, 55, 25, 'm3'); px.hline(c, 50, 55, 19, 'm4')   -- the shovel left in it
  return done(c, 32, 34)
end
S.g_jars = function()
  local c = new(40, 50)
  for _, y in ipairs({22, 46}) do for x = 1, 38 do P(c, x, y, 'k5'); P(c, x, y + 1, 'k3') end end
  for i = 0, 5 do local row = i // 3; local jx = 4 + (i % 3) * 12; local jy = 8 + row * 24
    for y = jy, jy + 13 do for x = jx, jx + 8 do local u = (x - jx) / 8
      P(c, x, y, y < jy + 3 and 'j4' or band(c, R_('j'), .62 - u * .45, 1, 3)) end end
    R(c, jx - 1, jy - 2, jx + 9, jy, 'm3'); px.hline(c, jx - 1, jx + 9, jy - 2, 'm4')
    local kind = (i * 7 + 3) % 3
    if kind == 0 then for k = 0, 1 do local ex, ey = jx + 2 + k * 4, jy + 6 + k * 3; P(c, ex, ey, 'w4'); P(c, ex + 1, ey, 'w4'); P(c, ex, ey + 1, 'w3'); P(c, ex + 1, ey + 1, 'OUT') end   -- eyes
    elseif kind == 1 then for k = 0, 4 do P(c, jx + 1 + k * 1.6, jy + 9 + (k % 2), 'bn4') end                                                                          -- teeth
    else px.line(c, jx + 2, jy + 11, jx + 6, jy + 5, 'fl4'); P(c, jx + 6, jy + 5, 'bn4') end                                                                             -- a finger
    px.vline(c, jx + 1, jy + 3, jy + 12, 'j4') end
  return done(c, 20, 47)
end

-- ------------------------------------------------------------------ the swamp and the woods
S.rg_peat = function()
  local c = new(44, 32)
  for row = 0, 3 do local y = 24 - row * 6; local n = 4 - row
    for k = 0, n - 1 do local x = 4 + row * 4 + k * 9
      R(c, x, y, x + 8, y + 5, 'd2'); px.hline(c, x, x + 8, y, 'd4'); px.hline(c, x, x + 8, y + 1, 'd3'); px.vline(c, x + 8, y, y + 5, 'd1')
      for q = 0, 2 do P(c, x + 1 + math.floor(H(k, row + q) * 6), y + 2 + q, 'gr2') end end end
  return done(c, 22, 29)
end
S.rg_bogbody = function()
  local c = new(72, 34)
  blob(c, 36, 20, 32, 9, {'c1', 'd1', 'd2', 'j1', 'j2'}, 5, .4)                                       -- black bog water
  for i = 0, 6 do local x = 10 + i * 8; px.hline(c, x, x + 3, 15 + (i % 3) * 3, 'j2') end
  blob(c, 26, 18, 13, 4, DD, 7, .7)                                                                  -- the body, leather-brown, half under
  blob(c, 11, 15, 4.5, 4, DD, 8, .75); P(c, 10, 14, 'c1'); P(c, 12, 14, 'c1'); px.hline(c, 9, 13, 17, 'c2')   -- the face, sunken
  px.line(c, 20, 20, 30, 26, 'dd3'); px.line(c, 30, 26, 34, 25, 'dd4')                                -- an arm under the surface
  px.line(c, 14, 18, 18, 16, 't1'); px.line(c, 14, 19, 18, 17, 't1')                                    -- the rope round its neck
  for k = 0, 8 do P(c, 40 + k * 3, 21 + (k % 2), 'gr3') end
  return done(c, 36, 28)
end
local function burnt(w, h, ay, seed)
  local c = new(w, h); local cx = w / 2
  for y = 24, ay do local t = (y - 24) / (ay - 24); local hw = 5 + t * 5 + ((y > ay - 6) and (y - ay + 6) * 1.4 or 0)
    for x = math.floor(cx - hw), math.ceil(cx + hw) do local u = (x - cx) / hw
      local col = band(c, CH, .5 - u * .35 + (((x + y * 2) % 7 == 0) and .25 or 0), 1, 5)
      if H(x // 2, y // 5 + seed) > .93 then col = (H(x, y) > .5) and 'e1' or 'e2' end                  -- embers still in the cracks
      P(c, x, y, col) end end
  local function limb(x0, y0, a, len, wd, d)
    local x1, y1 = x0 + math.cos(a) * len, y0 + math.sin(a) * len
    for i = 0, len do local t = i / len; for k = -wd, wd do P(c, x0 + (x1 - x0) * t + k, y0 + (y1 - y0) * t, k < 0 and 'c4' or 'c2') end end
    if d > 0 then limb(x1, y1, a - .5, len * .6, math.max(0, wd - 1), d - 1); if H(d, seed) > .4 then limb(x1, y1, a + .45, len * .55, 0, d - 1) end end
  end
  limb(cx - 2, 40, -2.3, 22, 1, 2); limb(cx + 2, 32, -.85, 20, 1, 2); limb(cx, 26, -1.6, 18, 1, 1)
  for x = math.floor(cx - 14), math.ceil(cx + 14) do if H(x, seed) > .4 then P(c, x, ay + 1, 'c1') end end
  return done(c, w / 2, ay)
end
S.rg_burnt_a = function() return burnt(76, 128, 123, 3) end
S.rg_burnt_b = function() return burnt(70, 110, 105, 4) end
local function dolltree(seed)
  local c = new(96, 176); local cx = 48; local ay = 171
  for y = 40, ay + 1 do local t = (y - 40) / (ay - 40); local w = 4 + t * 4 + ((y > ay - 5) and (y - ay + 5) * 1.5 or 0)
    for x = math.floor(cx - w / 2), math.floor(cx + w / 2) do local u = (x - (cx - w / 2)) / w
      local col = u < .4 and 'w4' or (u < .75 and 'w3' or 'w2'); if H(x // 2 + seed, y // 3) > .84 and u > .15 and u < .85 then col = 'w1' end; P(c, x, y, col) end end
  local tips = {}
  local function br(x0, y0, a, len, d)
    local x1, y1 = x0 + math.cos(a) * len, y0 + math.sin(a) * len; px.line(c, x0, y0, x1, y1, 'w3'); px.line(c, x0 + 1, y0, x1 + 1, y1, 'w2')
    if d > 0 then br(x1, y1, a - .45, len * .66, d - 1); br(x1, y1, a + .4, len * .62, d - 1) else tips[#tips + 1] = {x1, y1} end
  end
  br(cx, 46, -2.2, 24, 3); br(cx, 46, -.95, 24, 3); br(cx, 42, -1.55, 22, 2)
  for i = 0, 5 do local b = tips[1 + ((i * 5 + seed) % #tips)]; local len = 8 + math.floor(H(i, seed) * 10)
    local x, y = math.floor(b[1]), math.floor(b[2]); px.vline(c, x, y, y + len, 't1')
    local dy = y + len; local cloth = 'x' .. (2 + (i + seed) % 4)
    px.ellipse(c, x + .5, dy + 3, 3, 3, 'x1'); P(c, x - 1, dy + 3, 'OUT'); P(c, x + 2, dy + 3, 'OUT'); px.hline(c, x - 2, x + 3, dy, 'k3')   -- a doll: pale head, button eyes, a hank of hair,
    for k = 0, 8 do px.hline(c, x - 1 - k // 3, x + 2 + k // 3, dy + 6 + k, k == 8 and 'x1' or cloth) end                                  -- a little dress
    px.vline(c, x - 2, dy + 7, dy + 10, 'x1'); px.vline(c, x + 3, dy + 7, dy + 10, 'x1'); P(c, x - 1, dy + 15, 'x1'); P(c, x + 2, dy + 15, 'x1') end
  return done(c, 48, ay)
end
S.rg_dolltree_a = function() return dolltree(1) end
S.rg_dolltree_b = function() return dolltree(4) end
S.rg_den = function()
  local c = new(88, 62); local cx = 44
  blob(c, cx, 44, 30, 14, DT, 3, .5, 1, 5)
  for i = 0, 15 do local x0 = cx - 26 + i * 3.4; local x1 = cx - 4 + i * .6
    px.line(c, x0, 54, x1, 12 + math.abs(i - 7) * .8, i % 2 == 0 and 'k4' or 'k3'); px.line(c, x0 + 1, 54, x1 + 1, 12 + math.abs(i - 7) * .8, 'k2') end
  blob(c, cx, 47, 9, 8, CH, 4, .2, 1, 2)                                                              -- the way in, dark
  for i = 0, 6 do local x, y = cx - 20 + math.floor(H(i, 5) * 40), 53 + math.floor(H(i, 6) * 5); px.line(c, x, y, x + 3, y - 1, 'bn4'); P(c, x + 4, y - 1, 'bn3') end   -- bones at the mouth
  for k = 0, 5 do P(c, cx + 14 + k, 50 + (k % 2), 'fu4') end
  return done(c, 44, 58)
end

-- ------------------------------------------------------------------ litter: leaves, a twig, ivy, a note
local LEAF = {{'lo3', 'lo4', 'lo2'}, {'lo4', 'lo5', 'lo3'}, {'lo5', 'lo6', 'lo4'}, {'lo7', 'lo8', 'lo1'}, {'lo2', 'lo3', 'lo1'}}
local function leaves(seed)
  local c = new(56, 23)
  for i = 0, 13 do local x, y = 4 + math.floor(H(i, seed) * 46), 5 + math.floor(H(i, seed + 1) * 13); local L = LEAF[1 + (i + seed) % #LEAF]
    P(c, x, y, L[2]); P(c, x + 1, y, L[1]); P(c, x - 1, y, L[1]); P(c, x, y - 1, L[2]); P(c, x, y + 1, L[3]); P(c, x + 1, y + 1, L[3])
    if H(i, seed + 2) > .5 then P(c, x + 2, y - 1, L[1]); P(c, x - 2, y - 1, L[1]) end; P(c, x - 1, y + 2, 'k3') end
  return done(c, 28, 21, true)
end
for i = 0, 3 do S['leaves_' .. i] = function() return leaves(i * 5 + 1) end end
S.twig = function()
  local c = new(28, 16)
  px.line(c, 3, 11, 25, 7, 'k4'); px.line(c, 3, 12, 25, 8, 'k3'); px.line(c, 4, 13, 24, 9, 'k2')
  px.line(c, 10, 10, 13, 4, 'k4'); px.line(c, 18, 8, 22, 3, 'k4'); px.line(c, 15, 9, 13, 13, 'k3')
  P(c, 22, 3, 'lo4'); P(c, 23, 3, 'lo3'); P(c, 13, 4, 'lo5')
  return done(c, 14, 13)
end
S.vines = function()
  local c = new(46, 100)
  for st = 0, 2 do local x = 10 + st * 12
    for y = 98, 4 + st * 8, -1 do x = x + math.sin(y * .12 + st * 2) * .6; P(c, x, y, 'gr1') end end
  for i = 0, 120 do local y = 6 + math.floor(H(i, 3) * 92); local st = i % 3; if y < 4 + st * 8 then goto skip end
    do local x = 10 + st * 12 + math.floor(math.sin(y * .12 + st * 2) * 3) + math.floor((H(i, 4) - .5) * 9)
      local l = ({'gr3', 'gr4', 'gr5'})[1 + i % 3]
      P(c, x, y, l); P(c, x + 1, y, l); P(c, x, y + 1, 'gr2'); P(c, x + 1, y + 1, 'gr3'); P(c, x - 1, y, 'gr3'); P(c, x, y - 1, i % 5 == 0 and 'gr5' or l) end
    ::skip:: end
  return done(c, 23, 98, true)
end
S.doornote = function()
  local c = new(10, 13)
  R(c, 1, 2, 8, 11, 't3'); px.vline(c, 8, 2, 11, 't2'); px.hline(c, 1, 8, 11, 't2')
  for y = 4, 9, 2 do px.hline(c, 2, 7 - (y % 3), y, 't1') end; P(c, 4, 1, 'm2'); P(c, 4, 2, 'm3')
  return done(c, 5, 10)
end

local names = {}
for k in pairs(S) do names[#names + 1] = k end
table.sort(names)
for _, name in ipairs(names) do
  if not only or only == name then
    local c, m = S[name](); c.weather = {speck = .06, grime = 0, round = .5, radius = 2, mottle = .2}
    px.save(c, app.fs.joinPath(out, name .. '.png'))
    print(string.format('META %s %d %d %.1f %d %.2f - -', name, m.w, m.h, m.ax, m.ay, m.w / 32))
  end
end
