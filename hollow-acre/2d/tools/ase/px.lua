-- Hollow Acre drawing kit for Aseprite (run headless: aseprite -b --script <file>).
-- Sprites are INDEXED with a locked, named, hue-shifted palette; index 0 is transparent. Everything is hard-edged.
local px = {}
local BAYER = {{0,8,2,10},{12,4,14,6},{3,11,1,9},{15,7,13,5}}

local function hex(h) h = h:gsub('#','') return tonumber(h:sub(1,2),16), tonumber(h:sub(3,4),16), tonumber(h:sub(5,6),16) end

-- ---- Hollow Acre's mood: every palette goes through this grade, so the whole valley is darker, colder in the shadows and
-- less sugary than a cheerful farm game: values pulled down (brights most), saturation eased, shadows pushed toward violet,
-- yellows and greens muted toward autumn. Set px.MOOD = false to draw with the raw colours.
px.MOOD = true
local function rgb2hsv(r, g, b) local mx, mn = math.max(r, g, b), math.min(r, g, b); local d = mx - mn; local h = 0
  if d > 0 then if mx == r then h = ((g - b) / d) % 6 elseif mx == g then h = (b - r) / d + 2 else h = (r - g) / d + 4 end; h = h * 60 end
  return h, mx > 0 and d / mx or 0, mx end
local function hsv2rgb(h, s, v) local c = v * s; local x = c * (1 - math.abs((h / 60) % 2 - 1)); local m = v - c; local r, g, b = 0, 0, 0
  if h < 60 then r, g = c, x elseif h < 120 then r, g = x, c elseif h < 180 then g, b = c, x elseif h < 240 then g, b = x, c elseif h < 300 then r, b = x, c else r, b = c, x end
  return r + m, g + m, b + m end
function px.grade(r, g, b)
  local h, s, v = rgb2hsv(r / 255, g / 255, b / 255)
  v = (v ^ 1.22) * .97                                         -- a little darker, lights kept (the old art's level)
  s = s * .93 * (1 + .06 * (1 - v))                            -- calmer colour, shadows keep a little more
  if v > .8 then s = s * .92 end                               -- only the brightest tones ease off
  if h > 45 and h < 160 then s = s * .95 end                   -- greens and yellows toward autumn
  if v < .45 then local t = (.45 - v) / .45; local d = ((250 - h + 540) % 360) - 180; h = (h + d * .12 * t + 360) % 360 end
  local rr, gg, bb = hsv2rgb(h, s, v)
  return math.floor(rr * 255 + .5), math.floor(gg * 255 + .5), math.floor(bb * 255 + .5)
end

-- pal: list of {name, '#rrggbb'}; ramps: name -> list of palette names, darkest first
function px.new(w, h, pal)
  local spr = Sprite(w, h, ColorMode.INDEXED)
  local P = Palette(#pal + 1)
  P:setColor(0, Color{r=0, g=0, b=0, a=0})
  local idx = {}
  for i, e in ipairs(pal) do local r, g, b = hex(e[2]); if px.MOOD and e[1] ~= 'OUT' then r, g, b = px.grade(r, g, b) end
    P:setColor(i, Color{r=r, g=g, b=b, a=255}); idx[e[1]] = i end
  spr:setPalette(P); spr.transparentColor = 0
  local cel = spr.cels[1] or spr:newCel(spr.layers[1], spr.frames[1])
  local c = {spr=spr, img=cel.image, w=w, h=h, idx=idx, weather={grime=.25, patch=.25}}
  local names = {}; for n, i in pairs(idx) do names[i] = n end; c.names = names
  return c
end

function px.i(c, name) local v = c.idx[name]; if not v then error('no colour '..tostring(name)) end return v end
function px.p(c, x, y, col)
  x = math.floor(x); y = math.floor(y)
  if x < 0 or y < 0 or x >= c.w or y >= c.h then return end
  c.img:drawPixel(x, y, type(col) == 'number' and col or px.i(c, col))
end
function px.get(c, x, y)
  x = math.floor(x); y = math.floor(y)
  if x < 0 or y < 0 or x >= c.w or y >= c.h then return 0 end
  return c.img:getPixel(x, y)
end
function px.rect(c, x0, y0, x1, y1, col) for y = y0, y1 do for x = x0, x1 do px.p(c, x, y, col) end end end
function px.hline(c, x0, x1, y, col) for x = x0, x1 do px.p(c, x, y, col) end end
function px.vline(c, x, y0, y1, col) for y = y0, y1 do px.p(c, x, y, col) end end
function px.line(c, x0, y0, x1, y1, col)
  x0, y0, x1, y1 = math.floor(x0), math.floor(y0), math.floor(x1), math.floor(y1)
  local dx, dy = math.abs(x1 - x0), -math.abs(y1 - y0); local sx = x0 < x1 and 1 or -1; local sy = y0 < y1 and 1 or -1; local err = dx + dy
  while true do
    px.p(c, x0, y0, col); if x0 == x1 and y0 == y1 then break end
    local e2 = 2 * err; if e2 >= dy then err = err + dy; x0 = x0 + sx end; if e2 <= dx then err = err + dx; y0 = y0 + sy end
  end
end
function px.ellipse(c, cx, cy, rx, ry, col)
  for y = math.floor(cy - ry), math.ceil(cy + ry) do for x = math.floor(cx - rx), math.ceil(cx + rx) do
    local dx, dy = (x + .5 - cx) / rx, (y + .5 - cy) / ry
    if dx * dx + dy * dy <= 1 then px.p(c, x, y, col) end end end
end
-- fill a polygon given as {{x,y},...} (even-odd scanline)
function px.poly(c, pts, colf)
  local miny, maxy = 1e9, -1e9
  for _, q in ipairs(pts) do miny = math.min(miny, q[2]); maxy = math.max(maxy, q[2]) end
  for y = math.floor(miny), math.ceil(maxy) do
    local xs = {}; local yy = y + .5
    for i = 1, #pts do local a, b = pts[i], pts[i % #pts + 1]
      if (a[2] <= yy and b[2] > yy) or (b[2] <= yy and a[2] > yy) then xs[#xs + 1] = a[1] + (yy - a[2]) / (b[2] - a[2]) * (b[1] - a[1]) end end
    table.sort(xs)
    for k = 1, #xs - 1, 2 do for x = math.floor(xs[k] + .5), math.floor(xs[k + 1] - .5) do
      if type(colf) == 'function' then local v = colf(x, y); if v then px.p(c, x, y, v) end else px.p(c, x, y, colf) end end end
  end
end
-- pick a step of a ramp for a continuous light value 0..1, ordered-dithered between neighbouring steps
function px.ramp(c, ramp, light, x, y, lo, hi)
  lo = lo or 1; hi = hi or #ramp; light = math.max(0, math.min(1, light))
  local v = lo + light * (hi - lo); local b = math.floor(v); local f = v - b
  x = math.floor(x); y = math.floor(y)
  local t = BAYER[y % 4 + 1][x % 4 + 1] / 16
  local k = math.min(hi, b + (f > t and 1 or 0))
  return px.i(c, ramp[k])
end
-- flat band (no dither): Stardew-style clean colour steps
function px.band(c, ramp, light, lo, hi)
  lo = lo or 1; hi = hi or #ramp; light = math.max(0, math.min(1, light))
  local k = math.max(lo, math.min(hi, math.floor(lo + light * (hi - lo) + .5)))
  return px.i(c, ramp[k])
end
-- a one-pixel outline round everything drawn (or round pixels matching pred), on transparent pixels only
function px.outline(c, col, pred)
  local add = {}
  for y = 0, c.h - 1 do for x = 0, c.w - 1 do
    if px.get(c, x, y) == 0 then
      for _, d in ipairs({{1,0},{-1,0},{0,1},{0,-1}}) do
        local v = px.get(c, x + d[1], y + d[2])
        if v ~= 0 and (not pred or pred(v, x + d[1], y + d[2])) then add[#add + 1] = {x, y}; break end
      end
    end end end
  for _, q in ipairs(add) do px.p(c, q[1], q[2], col) end
end
-- deterministic noise
function px.h(a, b) local s = math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - math.floor(s) end

-- ---- weathering: run on every sprite as it is saved, so nothing is a clean flat shape. Works inside each colour ramp
-- (names like 'w3': a step darker is 'w2', a step lighter 'w4'), never touching outlines or transparency.
--   speck  : surface texture: little clusters a step darker or lighter (grain, pits, scuffs)
--   grime  : dirt splashed up from the ground: the bottom of the sprite darkens a step, dithered, thickest at the foot
--   streak : water stains: thin dark runs down the surface from random points (buildings, walls)
local function step(c, v, d)
  local n = c.names[v]; if not n then return v end
  local pre, num = n:match('^(%a+)(%d+)$'); if not pre or pre == 'OUT' then return v end
  local t = c.idx[pre .. (tonumber(num) + d)]; return t or v
end
function px.weather_v1(c)
  local W = c.weather; if not W then return end
  local img = c.img; local w, h = c.w, c.h
  local V = {}; for y = 0, h - 1 do local row = {}; for x = 0, w - 1 do row[x] = img:getPixel(x, y) end; V[y] = row end
  local function get(x, y) if x < 0 or y < 0 or x >= w or y >= h then return 0 end return V[y][x] end
  local function rampOf(v) local n = c.names[v]; if not n then return nil end; local pre, num = n:match('^(%a+)(%d+)$'); if not pre or pre == 'OUT' then return nil end; return pre, tonumber(num) end
  local new = {}; for y = 0, h - 1 do local row = {}; for x = 0, w - 1 do row[x] = V[y][x] end; new[y] = row end
  local BY = {{0, 8, 2, 10}, {12, 4, 14, 6}, {3, 11, 1, 9}, {15, 7, 13, 5}}
  local function bay(x, y) return BY[y % 4 + 1][x % 4 + 1] / 16 end
  -- 1. soft: hard band edges inside a ramp are dithered over two pixels, like light falling off a rendered form
  if W.soft ~= false then
    for y = 0, h - 1 do for x = 0, w - 1 do local v = V[y][x]; local pa, ka = rampOf(v)
      if pa then for _, d in ipairs({{1, 0}, {0, 1}, {-1, 0}, {0, -1}}) do local u = get(x + d[1], y + d[2]); local pb, kb = rampOf(u)
        if pb == pa and math.abs(kb - ka) == 1 and ((x + y) % 2 == 0) then new[y][x] = u; break end end end end end
  end
  -- 2. round: light the silhouette as a volume. The alpha is blurred; its slope gives each edge pixel an outward normal;
  --    edges facing the light (top-left) brighten, edges facing away darken. Deep insides stay as drawn.
  local R = W.round or 0
  if R > 0 then local r = W.radius or 3
    local S = {}; for y = 0, h do S[y] = {}; for x = 0, w do S[y][x] = 0 end end
    for y = 1, h do local acc = 0; for x = 1, w do acc = acc + ((V[y - 1][x - 1] ~= 0) and 1 or 0); S[y][x] = S[y - 1][x] + acc end end
    local function A(x, y) local x0, y0, x1, y1 = math.max(0, x - r), math.max(0, y - r), math.min(w, x + r + 1), math.min(h, y + r + 1)
      return (S[y1][x1] - S[y0][x1] - S[y1][x0] + S[y0][x0]) / ((2 * r + 1) * (2 * r + 1)) end
    local Lx, Ly = -.62, -.78
    for y = 0, h - 1 do for x = 0, w - 1 do local v = new[y][x]; local pre, k = rampOf(v)
      if pre then local gx, gy = A(x + 1, y) - A(x - 1, y), A(x, y + 1) - A(x, y - 1)
        local mag = math.sqrt(gx * gx + gy * gy)
        if mag > .02 then local nx, ny = -gx / mag, -gy / mag; local e = math.min(1, mag * (2 * r + 1) * .55)
          local sh = (nx * Lx + ny * Ly) * e * R; local d = 0; local t = bay(x, y)
          if sh > 0 then d = (sh * 1.6 > t) and 1 or 0 else d = (-sh * 2.2 > t) and -1 or 0; if -sh * 2.2 > 1 + t then d = -2 end end
          if d ~= 0 then local t2 = c.idx[pre .. math.max(1, k + d)] or c.idx[pre .. (k + (d > 0 and 1 or -1))]; if t2 then new[y][x] = t2 end end end end end end
  end
  -- 3. grit: mottled surfaces (soft blotches a step darker or lighter), then the fine grain
  local function vn(x, y, cell, sd)
    local gx, gy = x / cell, y / cell; local i, j = math.floor(gx), math.floor(gy); local fx, fy = gx - i, gy - j
    local ni, nj = W.wrapW and math.floor(w / cell) or nil, W.wrapW and math.floor(h / cell) or nil
    local function hv(a, b) if ni then a = a % ni; b = b % nj end return px.h(a + sd * 31, b + sd * 17) end
    local u, vv = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
    local a1, b1, c1, d1 = hv(i, j), hv(i + 1, j), hv(i, j + 1), hv(i + 1, j + 1)
    return a1 + (b1 - a1) * u + (c1 - a1) * vv + (a1 - b1 - c1 + d1) * u * vv
  end
  local M = W.mottle or .22
  for y = 0, h - 1 do for x = 0, w - 1 do local v = new[y][x]; local pre, k = rampOf(v)
    if pre then local nv = v
      if M > 0 then local n = vn(x, y, W.cell or 7, 5) * .7 + vn(x, y, 3, 9) * .3
        if n < .5 - (1 - M) * .35 and bay(x, y) < .6 then nv = c.idx[pre .. (k - 1)] or nv
        elseif n > .5 + (1 - M) * .38 and bay(x, y) < .35 then nv = c.idx[pre .. (k + 1)] or nv end end
      if W.speck and W.speck > 0 then local n = px.h(x // 2 + x % 2 * 7, y + 3.1); local p2, k2 = rampOf(nv)
        if p2 then if n < W.speck * .65 then nv = c.idx[p2 .. (k2 - 1)] or nv elseif n > 1 - W.speck * .35 then nv = c.idx[p2 .. (k2 + 1)] or nv end end end
      new[y][x] = nv end end end
  -- 4. grime from the ground up, and water stains down the walls
  local miny, maxy = 1e9, -1e9
  for y = 0, h - 1 do for x = 0, w - 1 do if V[y][x] ~= 0 then miny = math.min(miny, y); maxy = math.max(maxy, y) end end end
  if maxy >= miny then local span = maxy - miny + 1
    if W.grime and W.grime > 0 then for y = 0, h - 1 do local t = (y - (maxy - span * W.grime)) / (span * W.grime)
      if t > 0 then for x = 0, w - 1 do local p2, k2 = rampOf(new[y][x]); if p2 and px.h(x * 1.7, y * 2.3) < t * .75 then new[y][x] = c.idx[p2 .. (k2 - 1)] or new[y][x] end end end end end
    if W.streak then for k = 0, math.floor(w / 9) do local sx = math.floor(px.h(k, 77) * w); local sy = math.floor(miny + px.h(k, 78) * span * .6)
      local len = 4 + math.floor(px.h(k, 79) * span * .3)
      for y = sy, math.min(h - 1, sy + len) do local p2, k2 = rampOf(new[y][sx]); if p2 and px.h(sx, y // 3) > .25 then new[y][sx] = c.idx[p2 .. (k2 - 1)] or new[y][sx] end end end end
  end
  for y = 0, h - 1 do for x = 0, w - 1 do if new[y][x] ~= V[y][x] then img:drawPixel(x, y, new[y][x]) end end end
end
-- ---- weathering v2, the old art's way: no dither and no lone pixels; every change is a clean-edged shape, and shading
-- falls off through in-between tones (a half step between each pair of ramp steps) instead of checkerboards and specks.
--   round  : the silhouette lit as a volume (light from the top-left): lit rims up a half or whole step, far rims down
--   soft   : where two broad flats of neighbouring steps meet, a one-pixel band of the in-between tone (on by default)
--   patch  : broad worn patches a half step darker (a whole step at their hearts) and a few sun-bleached ones
--   moss   : {ramps = {'sl', 's'}, amt = .3}: moss in the shaded hollows of those surfaces (shingle gaps, stone joints)
--   grime  : a ragged dirt line up from the ground, a half step darker, a whole step at the very foot
--   streak : a few water stains: solid thin runs a half step darker
--   chips  : rare dents: a two-pixel dark nick with its lit lip above
-- The result is saved as a full-colour image (the in-between tones would overflow a 256-colour palette).
-- c.weather.v1 = true uses the earlier, grittier pass (px.weather_v1), kept as a backup.
local MOSS = {'#1c2818', '#2c3c20', '#42532a', '#5c6a34'}
function px.weather(c)
  local W = c.weather; if not W then return nil end
  if W.v1 then px.weather_v1(c); return nil end
  local img = c.img; local w, h = c.w, c.h
  local pal = c.spr.palettes[1]
  local RGB = {}; for i = 0, #pal - 1 do local q = pal:getColor(i); RGB[i] = {q.red, q.green, q.blue, q.alpha} end
  local function parse(n) if not n then return nil end; local pre, num = n:match('^(%a+)(%d+)$'); if not pre or pre == 'OUT' then return nil end
    return pre, tonumber(num) * 2 end
  local len = {}; for n, _ in pairs(c.idx) do local pre, pos = parse(n); if pre then len[pre] = math.max(len[pre] or 0, pos // 2) end end
  local V, Rz, Pz = {}, {}, {}
  for y = 0, h - 1 do V[y], Rz[y], Pz[y] = {}, {}, {}
    for x = 0, w - 1 do local v = img:getPixel(x, y); V[y][x] = v; local pre, pos = parse(c.names[v]); Rz[y][x] = pre; Pz[y][x] = pos end end
  local function get(x, y) if x < 0 or y < 0 or x >= w or y >= h then return 0 end return V[y][x] end
  local function rz(x, y) if x < 0 or y < 0 or x >= w or y >= h then return nil end return Rz[y][x] end
  local function pz(x, y) if x < 0 or y < 0 or x >= w or y >= h then return nil end return Pz[y][x] end
  -- the colour of a ramp position (in half steps: 2 = step 1, 3 = between steps 1 and 2, ...)
  local function tone(pre, pos) local n = len[pre]; pos = math.max(2, math.min(2 * n, pos))
    local a = c.idx[pre .. (pos // 2)]; if pos % 2 == 0 then return RGB[a] end
    local b = c.idx[pre .. (pos // 2 + 1)]; if not a or not b then return RGB[a or b] end
    local p, q = RGB[a], RGB[b]; return {(p[1] + q[1]) // 2, (p[2] + q[2]) // 2, (p[3] + q[3]) // 2, 255} end
  local D4 = {{1, 0}, {0, 1}, {-1, 0}, {0, -1}}
  -- value noise (wraps for ground tiles)
  local function vn(x, y, cell, sd)
    local gx, gy = x / cell, y / cell; local i, j = math.floor(gx), math.floor(gy); local fx, fy = gx - i, gy - j
    local ni, nj = W.wrapW and math.max(1, math.floor(w / cell)) or nil, W.wrapW and math.max(1, math.floor(h / cell)) or nil
    local function hv(a, b) if ni then a = a % ni; b = b % nj end return px.h(a + sd * 31, b + sd * 17) end
    local u, vv = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
    local a1, b1, c1, d1 = hv(i, j), hv(i + 1, j), hv(i, j + 1), hv(i + 1, j + 1)
    return a1 + (b1 - a1) * u + (c1 - a1) * vv + (a1 - b1 - c1 + d1) * u * vv
  end
  local O = {}; for y = 0, h - 1 do O[y] = {}; for x = 0, w - 1 do O[y][x] = 0 end end
  -- 1. soft
  if W.soft ~= false then local S2 = {}
    for y = 0, h - 1 do for x = 0, w - 1 do local pre, pos = Rz[y][x], Pz[y][x]
      if pre then for _, d in ipairs(D4) do local qx, qy = x + d[1], y + d[2]
        if rz(qx, qy) == pre and pz(qx, qy) == pos + 2 and get(x - d[1], y - d[2]) == V[y][x] and get(qx + d[1], qy + d[2]) == V[qy][qx] then
          S2[#S2 + 1] = {x, y}; break end end end end end
    for _, q in ipairs(S2) do Pz[q[2]][q[1]] = Pz[q[2]][q[1]] + 1 end
  end
  -- a field of offsets with its lone pixels removed (each kept pixel shares its value with a neighbour)
  local function clean(F) local out = {}
    for y = 0, h - 1 do out[y] = {}; for x = 0, w - 1 do local f = F[y][x]; out[y][x] = f
      if f ~= 0 then local n = 0; for _, d in ipairs(D4) do local yy, xx = y + d[2], x + d[1]; if F[yy] and F[yy][xx] == f then n = n + 1 end end
        if n == 0 then out[y][x] = 0 end end end end
    return out end
  -- 2. round
  local R = W.round or 0
  if R > 0 then local r = W.radius or 3
    local S = {}; for y = 0, h do S[y] = {}; for x = 0, w do S[y][x] = 0 end end
    for y = 1, h do local acc = 0; for x = 1, w do acc = acc + ((V[y - 1][x - 1] ~= 0) and 1 or 0); S[y][x] = S[y - 1][x] + acc end end
    local function A(x, y) local x0, y0, x1, y1 = math.max(0, x - r), math.max(0, y - r), math.min(w, x + r + 1), math.min(h, y + r + 1)
      return (S[y1][x1] - S[y0][x1] - S[y1][x0] + S[y0][x0]) / ((2 * r + 1) * (2 * r + 1)) end
    local Lx, Ly = -.62, -.78; local F = {}
    for y = 0, h - 1 do F[y] = {}; for x = 0, w - 1 do F[y][x] = 0
      if Rz[y][x] then local gx, gy = A(x + 1, y) - A(x - 1, y), A(x, y + 1) - A(x, y - 1); local mag = math.sqrt(gx * gx + gy * gy)
        if mag > .02 then local nx, ny = -gx / mag, -gy / mag; local e = math.min(1, mag * (2 * r + 1) * .55)
          local sh = (nx * Lx + ny * Ly) * e * R
          F[y][x] = sh > 0 and math.min(2, math.floor(sh * 2.2 + .25)) or -math.min(3, math.floor(-sh * 3 + .25)) end end end end
    F = clean(F); for y = 0, h - 1 do for x = 0, w - 1 do O[y][x] = O[y][x] + F[y][x] end end
  end
  -- 3. worn patches
  local PA = W.patch or 0
  if PA > 0 then local cell = (W.cell or 6) * 2; local lo = .5 - (1 - PA) * .2; local hi = .5 + (1 - PA) * .26; local F = {}
    for y = 0, h - 1 do F[y] = {}; for x = 0, w - 1 do F[y][x] = 0
      if Rz[y][x] then local n = vn(x, y, cell, 5) * .65 + vn(x, y, cell / 2, 9) * .35
        if n < lo - .13 then F[y][x] = -2 elseif n < lo then F[y][x] = -1 elseif n > hi then F[y][x] = 1 end end end end
    F = clean(F); for y = 0, h - 1 do for x = 0, w - 1 do O[y][x] = O[y][x] + F[y][x] end end
  end
  -- 4. grime up from the ground, water stains, dents
  local miny, maxy = 1e9, -1e9
  for y = 0, h - 1 do for x = 0, w - 1 do if V[y][x] ~= 0 then miny = math.min(miny, y); maxy = math.max(maxy, y) end end end
  if maxy >= miny then local span = maxy - miny + 1
    if W.grime and W.grime > 0 then
      for x = 0, w - 1 do local top = maxy - span * W.grime * .45 * (.55 + .45 * vn(x, 0, 7, 31)); local foot = maxy - span * W.grime * .12 * (.5 + .5 * vn(x, 0, 4, 33))
        for y = math.max(0, math.floor(top)), maxy do if Rz[y][x] then O[y][x] = O[y][x] - ((y > foot) and 2 or 1) end end end end
    if W.streak then for k = 0, math.floor(w / 16) do local sx = math.floor(px.h(k, 77) * w); local sy = math.floor(miny + px.h(k, 78) * span * .6)
      local ln = 4 + math.floor(px.h(k, 79) * span * .25)
      for y = sy, math.min(h - 1, sy + ln) do if Rz[y][sx] then O[y][sx] = O[y][sx] - 1 end end end end
    if W.chips and W.chips > 0 then for y = 1, h - 1 do for x = 0, w - 2 do
      if px.h(x * 3.1, y * 1.7) < W.chips and Rz[y][x] and Rz[y][x + 1] == Rz[y][x] and Rz[y - 1][x] == Rz[y][x] and Rz[y - 1][x + 1] == Rz[y][x] then
        O[y][x] = O[y][x] - 2; O[y][x + 1] = O[y][x + 1] - 2; O[y - 1][x] = O[y - 1][x] + 1; O[y - 1][x + 1] = O[y - 1][x + 1] + 1 end end end end
  end
  -- 5. moss in the shaded hollows
  local MZ
  if W.moss then local set = {}; for _, r in ipairs(W.moss.ramps or W.moss) do set[r] = true end; local amt = W.moss.amt or .3
    local thr = .5 + (1 - amt) * .25; local F = {}
    for y = 0, h - 1 do F[y] = {}; for x = 0, w - 1 do F[y][x] = 0; local pre = Rz[y][x]
      if pre and set[pre] then local n = vn(x * .45, y * 1.6, 7, 21) * .7 + vn(x * .6, y, 3, 23) * .3; local rel = (Pz[y][x] - 2) / math.max(1, 2 * len[pre] - 2)
        if n > thr and (rel < .55 or n > thr + .08) then F[y][x] = 1 + math.min(3, math.floor(rel * 4)) end end end end
    MZ = clean(F)
    local MR = {}; for i, hx in ipairs(MOSS) do local r, g, b = hex(hx); if px.MOOD then r, g, b = px.grade(r, g, b) end; MR[i] = {r, g, b, 255} end
    MZ.rgb = MR
  end
  -- assemble, then drop any lone pixel the weathering made
  local OUTC = {}
  for y = 0, h - 1 do OUTC[y] = {}; for x = 0, w - 1 do local v = V[y][x]; local pre = Rz[y][x]
    if pre then local m = MZ and MZ[y][x] or 0
      if m > 0 then local o = O[y][x]; OUTC[y][x] = MZ.rgb[math.max(1, math.min(4, m + (o >= 2 and 1 or (o <= -2 and -1 or 0))))]
      else OUTC[y][x] = tone(pre, Pz[y][x] + O[y][x]) end
    else OUTC[y][x] = RGB[v] end end end
  local function key(q) return q[1] * 65536 + q[2] * 256 + q[3] + (q[4] or 255) * 16777216 end
  for y = 0, h - 1 do for x = 0, w - 1 do local v = V[y][x]
    if v ~= 0 and Rz[y][x] then local k = key(OUTC[y][x])
      if k ~= key(RGB[v]) then local alone = true
        for _, d in ipairs(D4) do local yy, xx = y + d[2], x + d[1]; if OUTC[yy] and OUTC[yy][xx] and key(OUTC[yy][xx]) == k then alone = false; break end end
        if alone then OUTC[y][x] = tone(Rz[y][x], Pz[y][x]) end end end end end
  local out = Sprite(w, h, ColorMode.RGB); local oi = out.cels[1].image; local pc = app.pixelColor
  for y = 0, h - 1 do for x = 0, w - 1 do local v = V[y][x]
    if v ~= 0 then local q = OUTC[y][x]; oi:drawPixel(x, y, pc.rgba(q[1], q[2], q[3], q[4] or 255)) end end end
  return out
end
function px.save(c, path) local out = px.weather(c)
  if out then out:saveCopyAs(path); out:close() else c.spr:saveCopyAs(path) end end
return px
