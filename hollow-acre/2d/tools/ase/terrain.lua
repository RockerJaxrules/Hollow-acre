-- Ground textures for Hollow Acre: 192x192 tiles that wrap seamlessly (the engine samples them in world space and
-- blends regions along their edges). Flat colour patches instead of speckle noise, with drawn detail on top: grass
-- tufts with lit tips, clover and the odd flower; leaf litter and moss in the woods; pebbles and cracks in the dirt;
-- rounded cobbles lit from the top-left; ripples and glints on the water. Everything placed with wrap-around so the
-- tile has no seams. Writes tex_<name>.png and META lines for install.py.
local dir = app.params['dir'] or '.'
local out = app.params['out'] or dir
local px = dofile(app.fs.joinPath(dir, 'px.lua'))
local N = 192

local RAMPS = {
  g = {'#1f4a2c', '#2b5e30', '#3a7234', '#4e8a3a', '#64a040', '#82b84a', '#a6cc5c', '#cce07a'},
  f = {'#12241c', '#182e20', '#1e3a26', '#26462c', '#305432', '#3e6438', '#4e7440'},
  l = {'#5a2a1e', '#8a4a22', '#b86a2a', '#d89a3a'},
  d = {'#3e261e', '#4e3024', '#62402a', '#7a5434', '#926a40', '#aa824e', '#c29c64', '#d8b67e'},
  s = {'#24222c', '#36343e', '#4a4754', '#5e5b68', '#76727e', '#8e8a96', '#a8a4ae', '#c4c0c8'},
  w = {'#10283e', '#163652', '#1c4664', '#245878', '#2e6c8c', '#3c82a2', '#5c9cba', '#94c4d8', '#d4eef4'},
  x = {'#f0ece0', '#f2d050', '#e89aa8', '#9ab8e8'},
}
local PAL = {{'OUT', '#22161e'}}
for k, cols in pairs(RAMPS) do for i, h in ipairs(cols) do PAL[#PAL + 1] = {k .. i, h} end end
local function R_(k) local r = {}; for i = 1, #RAMPS[k] do r[i] = k .. i end return r end
local G, F, L, D, S, W = R_('g'), R_('f'), R_('l'), R_('d'), R_('s'), R_('w')

local function H(a, b) return px.h(a, b) end
local function wrap(v) return (v % N + N) % N end
local function P(c, x, y, col) px.p(c, wrap(math.floor(x)), wrap(math.floor(y)), col) end
local function idx(c, x, y) return px.get(c, wrap(x), wrap(y)) end
-- periodic value noise: n lattice cells across the tile, so it wraps
local function vnoise(x, y, n, seed)
  local cs = N / n; local gx, gy = x / cs, y / cs; local i0, j0 = math.floor(gx), math.floor(gy); local fx, fy = gx - i0, gy - j0
  local function v(i, j) return H((i % n) + seed * 31, (j % n) + seed * 17) end
  local u, w = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
  local a, b, c, d = v(i0, j0), v(i0 + 1, j0), v(i0, j0 + 1), v(i0 + 1, j0 + 1)
  return a + (b - a) * u + (c - a) * w + (a - b - c + d) * u * w
end
local function fbm(x, y, seed) return vnoise(x, y, 4, seed) * .55 + vnoise(x, y, 8, seed + 1) * .3 + vnoise(x, y, 16, seed + 2) * .15 end
local function stepOf(c, r, v) for i = 1, #r do if px.i(c, r[i]) == v then return i end end return nil end

local T = {}

-- ------------------------------------------------------------------ grass
local function grassy(c, r, lo, seed, opts)
  -- two or three flat tones in big soft patches
  for y = 0, N - 1 do for x = 0, N - 1 do local n = fbm(x, y, seed)
    local k = n < .48 and lo or (n < .76 and lo + 1 or lo + 2)
    px.p(c, x, y, r[k]) end end
  -- tufts: three blades, dark root, mid stem, lit tips (lighter where the patch is lighter)
  local step = opts.step or 6
  for gy = 0, N - 1, step do for gx = 0, N - 1, step do
    local x = gx + math.floor(H(gx, gy + seed) * step); local y = gy + math.floor(H(gx + 7, gy + seed) * step)
    if H(gx + 3, gy + seed + 5) < (opts.density or .8) then
      local k = stepOf(c, r, idx(c, x, y)) or lo
      local tip, mid, root = r[math.min(#r, k + 2)], r[math.min(#r, k + 1)], r[math.max(1, k - 1)]
      local big = H(gx, gy + seed + 9) > .65
      P(c, x, y + 2, root); P(c, x + 1, y + 2, root); P(c, x + 2, y + 2, root)
      P(c, x, y + 1, mid); P(c, x + 1, y + 1, mid); P(c, x + 2, y + 1, mid)
      P(c, x, y, tip); P(c, x + 2, y, tip); P(c, x + 1, y - (big and 1 or 0), tip)
      if big then P(c, x + 1, y, mid); P(c, x - 1, y + 1, tip); P(c, x + 3, y + 1, tip) end
    end end end
  -- extras: clover, flowers, pebbles, leaves
  for i = 0, (opts.extras or 40) do local x, y = math.floor(H(i, seed + 40) * N), math.floor(H(i, seed + 41) * N); local kind = H(i, seed + 42)
    if kind < (opts.flowers or .3) then local col = ({'x1', 'x2', 'x3', 'x4'})[i % 4 + 1]; P(c, x, y, col); P(c, x + 1, y, col); P(c, x, y + 1, col); P(c, x + 1, y + 1, r[lo]); P(c, x + 1, y - 1, col)
    elseif kind < .6 then P(c, x, y, r[lo + 3]); P(c, x + 1, y, r[lo + 3]); P(c, x, y + 1, r[lo + 2]); P(c, x - 1, y, r[lo + 3]); P(c, x, y - 1, r[lo + 3]); P(c, x, y, r[lo + 4] or r[#r])   -- clover
    elseif kind < .75 then P(c, x, y, 's6'); P(c, x + 1, y, 's5'); P(c, x, y + 1, 's4'); P(c, x + 1, y + 1, r[lo - 1] or r[1])                             -- a pebble
    elseif opts.leaves then local lc = ({'l2', 'l3', 'l4'})[i % 3 + 1]; P(c, x, y, lc); P(c, x + 1, y, lc); P(c, x + 1, y + 1, 'l1'); P(c, x - 1, y - 1, lc) end end
end
T.grass = function() local c = px.new(N, N, PAL); grassy(c, G, 3, 3, {step = 6, density = .85, extras = 70, flowers = .28}); return c end
T.forest = function() local c = px.new(N, N, PAL); grassy(c, F, 3, 5, {step = 7, density = .6, extras = 120, flowers = .03, leaves = true})
  for i = 0, 30 do local x, y = math.floor(H(i, 70) * N), math.floor(H(i, 71) * N)                 -- moss cushions
    for k = 0, 6 do P(c, x + math.floor(H(k, i) * 5), y + math.floor(H(k, i + 1) * 3), F[6 + (k % 2)]) end end
  return c end

-- ------------------------------------------------------------------ dirt
T.dirt = function()
  local c = px.new(N, N, PAL)
  for y = 0, N - 1 do for x = 0, N - 1 do local n = fbm(x, y, 11); local m = vnoise(x, y, 24, 13)
    local big = vnoise(x, y, 3, 17)                                             -- the light tone comes in big soft areas, not little ovals
    local k = n < .44 and 4 or 5; if big > .66 and n > .4 then k = 6 end; if m > .86 and k == 4 then k = 3 end
    px.p(c, x, y, D[k]) end end
  for i = 0, 140 do local x, y = math.floor(H(i, 20) * N), math.floor(H(i, 21) * N); local t = H(i, 22)        -- pebbles of a few sizes
    if t < .55 then P(c, x, y, 's6'); P(c, x + 1, y + 1, 'd2')
    elseif t < .85 then P(c, x, y, 's7'); P(c, x + 1, y, 's5'); P(c, x, y + 1, 's5'); P(c, x + 1, y + 1, 's3'); P(c, x + 1, y + 2, 'd2'); P(c, x, y + 2, 'd3')
    else for yy = 0, 2 do for xx = 0, 3 do P(c, x + xx, y + yy, (yy == 0 and xx < 2) and 's7' or (yy == 2 or xx == 3) and 's3' or 's5') end end; for xx = 0, 4 do P(c, x + xx, y + 3, 'd2') end end end
  for i = 0, 26 do local x, y = math.floor(H(i, 30) * N), math.floor(H(i, 31) * N); local len = 3 + math.floor(H(i, 32) * 5)  -- little cracks
    for k = 0, len do P(c, x + k, y + math.floor(math.sin(k * .9 + i) * 1.2), 'd2') end end
  for i = 0, 18 do local x, y = math.floor(H(i, 33) * N), math.floor(H(i, 34) * N)                                        -- light dusty spots
    P(c, x, y, 'd8'); P(c, x + 1, y, 'd7'); P(c, x + 2, y + 1, 'd7') end
  return c
end

-- ------------------------------------------------------------------ cobbles: wrapping Voronoi stones, lit top-left
T.stone = function()
  local c = px.new(N, N, PAL)
  local cell = 16; local n = N // cell; local pts = {}
  for j = 0, n - 1 do for i = 0, n - 1 do pts[#pts + 1] = {i * cell + 2 + H(i, j + 50) * (cell - 4), j * cell + 2 + H(i + 9, j + 51) * (cell - 4), H(i, j + 52)} end end
  for y = 0, N - 1 do for x = 0, N - 1 do
    local d1, d2, best = 1e9, 1e9, nil
    for _, p in ipairs(pts) do
      local dx = math.abs(x - p[1]); dx = math.min(dx, N - dx); local dy = math.abs(y - p[2]); dy = math.min(dy, N - dy)
      local d = math.sqrt(dx * dx + dy * dy)
      if d < d1 then d2 = d1; d1 = d; best = p elseif d < d2 then d2 = d end end
    local edge = d2 - d1
    local col
    if edge < 1.3 then col = S[2]
    else
      local dx = x - best[1]; if dx > N / 2 then dx = dx - N elseif dx < -N / 2 then dx = dx + N end
      local dy = y - best[2]; if dy > N / 2 then dy = dy - N elseif dy < -N / 2 then dy = dy + N end
      local l = .58 + (best[3] - .5) * .3 - (dx * .5 + dy * .75) / 14
      if edge < 2.6 and (dx + dy) > 0 then l = l - .22 end
      if edge < 2.6 and (dx + dy) < 0 then l = l + .14 end
      col = px.band(c, S, l, 3, 7)
    end
    px.p(c, x, y, col) end end
  for i = 0, 40 do local x, y = math.floor(H(i, 60) * N), math.floor(H(i, 61) * N); if idx(c, x, y) == px.i(c, S[2]) then P(c, x, y, i % 3 == 0 and 'g4' or 'g3') end end   -- moss in the joints
  return c
end

-- ------------------------------------------------------------------ water
T.water = function()
  local c = px.new(N, N, PAL)
  for y = 0, N - 1 do for x = 0, N - 1 do local n = fbm(x * 1.0, y * 1.0, 21); local m = vnoise(x, y, 12, 23)
    local k = n < .45 and 3 or (n < .74 and 4 or 5); if m < .1 then k = k - 1 end
    px.p(c, x, y, W[k]) end end
  for gy = 0, N - 1, 9 do for gx = 0, N - 1, 16 do                                                              -- ripples: a lit dash over a dark one
    local x = gx + math.floor(H(gx, gy + 3) * 14); local y = gy + math.floor(H(gx + 1, gy + 4) * 7); local len = 3 + math.floor(H(gx, gy + 5) * 6)
    if H(gx + 2, gy + 6) < .75 then
      local k = stepOf(c, W, idx(c, x, y)) or 4
      for i = 0, len do P(c, x + i, y, W[math.min(#W - 1, k + 2)]); if i > 0 and i < len then P(c, x + i, y + 1, W[math.max(1, k - 1)]) end end
    end end end
  for i = 0, 26 do local x, y = math.floor(H(i, 80) * N), math.floor(H(i, 81) * N); P(c, x, y, 'w9'); P(c, x + 1, y, 'w8') end   -- glints
  return c
end

for _, name in ipairs({'grass', 'forest', 'dirt', 'stone', 'water'}) do
  local c = T[name]()
  px.save(c, app.fs.joinPath(out, 'tex_' .. name .. '.png'))
  print(string.format('META tex_%s %d %d %.1f %d %.2f - -', name, N, N, 0, 0, 6))
end
