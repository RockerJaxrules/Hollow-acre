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
  v = (v ^ 1.32) * .97                                         -- deep darks, lights kept: contrast like the old rendered art
  s = math.min(1, s * (1 + .18 * (1 - v)))                     -- shadows keep their colour (richer, not grey)
  if v > .78 then s = s * .9 end                               -- only the brightest tones ease off
  if h > 45 and h < 160 then s = s * .95 end
  if v < .45 then local t = (.45 - v) / .45; local d = ((250 - h + 540) % 360) - 180; h = (h + d * .18 * t + 360) % 360 end
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
  local c = {spr=spr, img=cel.image, w=w, h=h, idx=idx, weather={speck=.09, grime=.4, streak=false}}
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
function px.weather(c)
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
function px.save(c, path) px.weather(c); c.spr:saveCopyAs(path) end
return px
