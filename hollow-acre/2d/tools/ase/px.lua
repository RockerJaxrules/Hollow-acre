-- Hollow Acre drawing kit for Aseprite (run headless: aseprite -b --script <file>).
-- Sprites are INDEXED with a locked, named, hue-shifted palette; index 0 is transparent. Everything is hard-edged.
local px = {}
local BAYER = {{0,8,2,10},{12,4,14,6},{3,11,1,9},{15,7,13,5}}

local function hex(h) h = h:gsub('#','') return tonumber(h:sub(1,2),16), tonumber(h:sub(3,4),16), tonumber(h:sub(5,6),16) end

-- pal: list of {name, '#rrggbb'}; ramps: name -> list of palette names, darkest first
function px.new(w, h, pal)
  local spr = Sprite(w, h, ColorMode.INDEXED)
  local P = Palette(#pal + 1)
  P:setColor(0, Color{r=0, g=0, b=0, a=0})
  local idx = {}
  for i, e in ipairs(pal) do local r, g, b = hex(e[2]); P:setColor(i, Color{r=r, g=g, b=b, a=255}); idx[e[1]] = i end
  spr:setPalette(P); spr.transparentColor = 0
  local cel = spr.cels[1] or spr:newCel(spr.layers[1], spr.frames[1])
  local c = {spr=spr, img=cel.image, w=w, h=h, idx=idx}
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

function px.save(c, path) c.spr:saveCopyAs(path) end
return px
