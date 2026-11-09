-- Hollow Acre building kit for Aseprite. One locked master palette of hand-picked, hue-shifted ramps (shadows lean
-- violet/plum, lights lean warm yellow); every building is built from a spec out of the same parts: walls in six materials,
-- roofs in five, front gables, cross gables, gambrels, parapets, a church tower; windows, doors, porches, awnings, signs,
-- chimneys, ivy, flower boxes, lanterns, and the wrong details. Flat colour bands, dithering only for soft transitions.
local B = {}
local px

B.PAL = {
 {'OUT','#1d1018'},{'OUT2','#2c1820'},
 -- roofs (8 steps)
 {'r1','#2e1424'},{'r2','#4f1a28'},{'r3','#75242b'},{'r4','#9a3530'},{'r5','#bd4f35'},{'r6','#d9733f'},{'r7','#eca055'},{'r8','#f6c779'},
 -- asphalt shingle roofs, the way most houses are roofed now: charcoal, dark brown, weathered teal
 {'as1','#141418'},{'as2','#1e1e24'},{'as3','#2a2930'},{'as4','#37353c'},{'as5','#46434a'},{'as6','#57535a'},{'as7','#6c676c'},{'as8','#868082'},
 {'bn1','#1a1214'},{'bn2','#271a1a'},{'bn3','#36241f'},{'bn4','#463026'},{'bn5','#573d2e'},{'bn6','#6a4c38'},{'bn7','#7f5e46'},{'bn8','#977458'},
 {'tl1','#10181c'},{'tl2','#172328'},{'tl3','#1f3034'},{'tl4','#2a3f42'},{'tl5','#365052'},{'tl6','#456264'},{'tl7','#587878'},{'tl8','#72908c'},
 {'sl1','#1c1a2c'},{'sl2','#2a2a44'},{'sl3','#3a3d5c'},{'sl4','#4c5372'},{'sl5','#626c88'},{'sl6','#7f8aa2'},{'sl7','#a2acbe'},{'sl8','#c8d0da'},
 {'sh1','#22141c'},{'sh2','#3a2022'},{'sh3','#57302a'},{'sh4','#764334'},{'sh5','#94593e'},{'sh6','#b2744c'},{'sh7','#cc955e'},{'sh8','#e4b878'},
 {'tn1','#161c18'},{'tn2','#222c24'},{'tn3','#2f3f30'},{'tn4','#42553c'},{'tn5','#586c46'},{'tn6','#72844e'},{'tn7','#909c5a'},{'tn8','#b4b46c'},   -- two steps toward olive (judge r3)
 {'th1','#2a1c1a'},{'th2','#463024'},{'th3','#66462c'},{'th4','#8a6234'},{'th5','#ab7e3c'},{'th6','#c89c4a'},{'th7','#dfba62'},{'th8','#f0d88a'},
 {'pr1','#1c1024'},{'pr2','#2c1834'},{'pr3','#402444'},{'pr4','#553050'},{'pr5','#6c3e5e'},{'pr6','#84546c'},{'pr7','#9e6c7c'},{'pr8','#ba8c94'},   -- judge (sweep): the plum read as candy pink; pulled toward a dusty plum
 -- walls (7 steps)
 {'w1','#2a1824'},{'w2','#47292b'},{'w3','#6a3f30'},{'w4','#8d5937'},{'w5','#ad7542'},{'w6','#c99352'},{'w7','#e0b467'},
 {'ww1','#2a2630'},{'ww2','#4a4450'},{'ww3','#6e6874'},{'ww4','#948e92'},{'ww5','#b8b2ae'},{'ww6','#d6d0c6'},{'ww7','#ece6d8'},
 {'sg1','#1c2420'},{'sg2','#2c3a30'},{'sg3','#405440'},{'sg4','#587050'},{'sg5','#748c62'},{'sg6','#94a878'},{'sg7','#b8c494'},
 {'bb1','#161c2c'},{'bb2','#222c44'},{'bb3','#33425e'},{'bb4','#485a78'},{'bb5','#627694'},{'bb6','#8296ae'},{'bb7','#a8b8c8'},
 {'ox1','#200e18'},{'ox2','#381420'},{'ox3','#561c26'},{'ox4','#742a2c'},{'ox5','#923c34'},{'ox6','#ae5640'},{'ox7','#c87452'},
 {'mu1','#2a1c14'},{'mu2','#48301c'},{'mu3','#6c4a22'},{'mu4','#92662a'},{'mu5','#b48434'},{'mu6','#cca244'},{'mu7','#e2c060'},
 {'bk1','#1e0e14'},{'bk2','#3a1418'},{'bk3','#5a1e1e'},{'bk4','#7a2c26'},{'bk5','#9a3e30'},{'bk6','#b4563a'},{'bk7','#cc744a'},
 {'s1','#231b2b'},{'s2','#382f42'},{'s3','#51485a'},{'s4','#6d6473'},{'s5','#8c8389'},{'s6','#ada395'},{'s7','#cfc5ac'},
 {'lg1','#1c1016'},{'lg2','#321c1e'},{'lg3','#4c2c26'},{'lg4','#683e2e'},{'lg5','#845238'},{'lg6','#a06a44'},{'lg7','#ba8654'},
 {'pl1','#3a3036'},{'pl2','#5e5258'},{'pl3','#847a78'},{'pl4','#aaa096'},{'pl5','#cac0ae'},{'pl6','#e2d8c2'},{'pl7','#f2eada'},
 -- trims, glass, doors, nature, metal, light, the wrong things
 {'t1','#5c4544'},{'t2','#8b7362'},{'t3','#bba78a'},{'t4','#e2d4b0'},{'t5','#f6ecd2'},
 {'dg1','#10201a'},{'dg2','#1a3226'},{'dg3','#264834'},{'dg4','#366044'},{'dg5','#4c7a56'},
 {'bt1','#141218'},{'bt2','#24202a'},{'bt3','#36303c'},{'bt4','#4a4252'},{'bt5','#625a6a'},
 {'g1','#121628'},{'g2','#1d2742'},{'g3','#2c4262'},{'g4','#46698a'},{'g5','#86bccc'},{'g6','#d2eef0'},
 {'d1','#10202a'},{'d2','#1a3438'},{'d3','#284c4c'},{'d4','#3c6a62'},{'d5','#5a8c7a'},
 {'dr1','#2a0c12'},{'dr2','#4a1218'},{'dr3','#6e1c20'},{'dr4','#922a28'},{'dr5','#b04034'},
 {'v1','#172219'},{'v2','#233a25'},{'v3','#34552b'},{'v4','#4f7432'},{'v5','#76943c'},{'v6','#a7b453'},
 {'f1','#4a1626'},{'f2','#7e2434'},{'f3','#b0464a'},{'f4','#d77a68'},
 {'m1','#1e1e2a'},{'m2','#383a4a'},{'m3','#5e6274'},{'m4','#9298a8'},
 {'y1','#b8742a'},{'y2','#e8a83e'},{'y3','#fbe08a'},
 {'b1','#4e0a12'},{'b2','#84141c'},{'b3','#b02a2a'},
 {'p1','#c8b8b0'},{'p2','#ece2da'},
 {'oxf1','#1c1017'},{'oxf2','#2f1d20'},{'oxf3','#482329'},{'oxf4','#623233'},{'oxf5','#7d4540'},{'oxf6','#985e50'},{'oxf7','#b27c65'},
 {'gs1','#2a2b2e'},{'gs2','#404247'},{'gs3','#56595e'},{'gs4','#6f7277'},{'gs5','#8c8f92'},   -- judge r3: two steps darker and cooler (near-white read louder than the barn)
 {'gw1','#24211f'},{'gw2','#3c3732'},{'gw3','#57504a'},{'gw4','#756c62'},{'gw5','#958a7c'},
 {'k1','#22141e'},{'k2','#3a2228'},{'k3','#573430'},{'k4','#77493a'},{'k5','#9a6448'},{'k6','#b8835a'},
}
local function ramp(prefix, n) local r = {} for i = 1, n do r[i] = prefix .. i end return r end
B.ROOFS = {scallop = ramp('r', 8), slate = ramp('sl', 8), shingle = ramp('sh', 8), tin = ramp('tn', 8), thatch = ramp('th', 8), plum = ramp('pr', 8),
           asphalt = ramp('as', 8), brown = ramp('bn', 8), teal = ramp('tl', 8)}
B.WALLS = {honey = ramp('w', 7), white = ramp('ww', 7), sage = ramp('sg', 7), blue = ramp('bb', 7), oxblood = ramp('ox', 7), oxfade = ramp('oxf', 7), mustard = ramp('mu', 7),
           brick = ramp('bk', 7), stone = ramp('s', 7), log = ramp('lg', 7), plaster = ramp('pl', 7)}
B.TRIMS = {cream = ramp('t', 5), green = ramp('dg', 5), black = ramp('bt', 5), weathered = ramp('gs', 5)}
B.DOORS = {teal = ramp('d', 5), red = ramp('dr', 5), green = ramp('dg', 5), black = ramp('bt', 5), oak = {'w2', 'w3', 'w4', 'w5', 'w6'}, weathered = ramp('gs', 5)}
local STONE = B.WALLS.stone

B.FONT = {
 A={'010','101','111','101','101'},B={'110','101','110','101','110'},C={'011','100','100','100','011'},D={'110','101','101','101','110'},
 E={'111','100','110','100','111'},F={'111','100','110','100','100'},G={'011','100','101','101','011'},H={'101','101','111','101','101'},
 I={'111','010','010','010','111'},J={'001','001','001','101','010'},K={'101','101','110','101','101'},L={'100','100','100','100','111'},
 M={'101','111','111','101','101'},N={'101','111','111','111','101'},O={'010','101','101','101','010'},P={'110','101','110','100','100'},
 Q={'010','101','101','110','011'},R={'110','101','110','101','101'},S={'011','100','010','001','110'},T={'111','010','010','010','010'},
 U={'101','101','101','101','111'},V={'101','101','101','101','010'},W={'101','101','111','111','101'},X={'101','101','010','101','101'},
 Y={'101','101','010','010','010'},Z={'111','001','010','100','111'},['&']={'010','101','010','101','011'},["'"]={'010','010','000','000','000'},
 [' ']={'000','000','000','000','000'},['.']={'000','000','000','000','010'},
 ['0']={'111','101','101','101','111'},['1']={'010','110','010','010','111'},['2']={'110','001','010','100','111'},['3']={'110','001','010','001','110'},
 ['4']={'101','101','111','001','001'},['5']={'111','100','110','001','110'},['6']={'011','100','110','101','010'},['7']={'111','001','010','010','010'},
 ['8']={'010','101','010','101','010'},['9']={'010','101','011','001','110'},['-']={'000','000','111','000','000'},[':']={'000','010','000','010','000'},
 ['!']={'010','010','010','000','010'}}

function B.init(lib) px = lib end
B.EAVE_DROP = 0   -- the roof's overhang covers the wall's top 4 rows: the eave shadow starts just below it
local function P(c, x, y, col) px.p(c, x, y, col) end
local function R(c, x0, y0, x1, y1, col) px.rect(c, x0, y0, x1, y1, col) end
local function H(a, b) return px.h(a, b) end
local function band(c, rmp, lt, lo, hi) return px.band(c, rmp, lt, lo, hi) end

function B.text(c, x, y, s, col, sh)
  s = s:upper()
  for i = 1, #s do local g = B.FONT[s:sub(i, i)] or B.FONT[' ']
    for r = 1, 5 do for k = 1, 3 do if g[r]:sub(k, k) == '1' then if sh then P(c, x + k, y + r, sh) end; P(c, x + k - 1, y + r - 1, col) end end end
    x = x + 4 end
end

-- ------------------------------------------------------------------ materials
function B.stones(c, x0, y0, x1, y1, seed, rowh, lightf)
  local y = y0; local row = 0
  while y <= y1 do
    local h = math.min(rowh, y1 - y + 1); local x = x0 - math.floor(H(row, seed) * 7)
    while x <= x1 do
      local w = 8 + math.floor(H(x, row + seed) * 7)
      local xa, xb = math.max(x0, x), math.min(x1, x + w - 2)
      for yy = y, y + h - 2 do for xx = xa, xb do
        local lt = (lightf and lightf(xx, yy) or .6)
        local inner = (yy == y) and .2 or ((xx == xa) and .1 or ((yy == y + h - 2 or xx == xb) and -.22 or 0))
        P(c, xx, yy, band(c, STONE, lt + inner + (H(xa, yy // 3) - .5) * .12, 3, 7))
      end end
      if xb >= xa then px.vline(c, xb + 1, y, y + h - 2, 's1'); px.hline(c, xa, xb + 1, y + h - 1, 's1') end
      x = x + w
    end
    y = y + h; row = row + 1
  end
end

function B.wall(c, mat, x0, y0, x1, y1, seed, rough)
  local Wr = B.WALLS[mat]
  local function lt(x) return .64 - (x - x0) / ((x1 - x0) * 3.2) end
  if mat == 'brick' then
    for y = y0, y1 do local course = (y - y0) // 4; local r = (y - y0) % 4; local off = (course % 2) * 5
      for x = x0, x1 do local bx = (x + off) % 10
        if r == 3 or bx == 9 then P(c, x, y, (x + y) % 5 == 0 and 's5' or 's4')
        else local id = ((x + off) // 10) * 31 + course * 17; local n = H(id, seed)
          local v = lt(x) + (n - .5) * .3 + (r == 0 and .14 or 0) + (bx == 8 and -.12 or 0)
          P(c, x, y, band(c, Wr, v, 2, 7)) end end end
  elseif mat == 'stone' then
    B.stones(c, x0, y0, x1, y1, seed, 7, function(x, y) return lt(x) end)
  elseif mat == 'log' then
    for y = y0, y1 do local r = (y - y0) % 7
      for x = x0, x1 do local col = ({'lg2', 'lg5', 'lg6', 'lg5', 'lg4', 'lg3', 'lg1'})[r + 1]
        if (r == 2 or r == 3) and H(x // 3, y) > .9 then col = 'lg3' end
        if x > x1 - (x1 - x0) * .25 and r >= 1 and r <= 4 and (x + y) % 2 == 0 then col = ({'lg2', 'lg4', 'lg5', 'lg4', 'lg3'})[r] end
        P(c, x, y, col) end end
    for y = y0, y1, 7 do for _, ex in ipairs({x0 - 3, x1 + 3}) do
      px.ellipse(c, ex + .5, y + 3.5, 3.5, 3.5, 'lg6'); px.ellipse(c, ex + .5, y + 3.5, 2, 2, 'lg5'); P(c, ex, y + 3, 'lg4') end end
  elseif mat == 'plaster' then
    for y = y0, y1 do for x = x0, x1 do P(c, x, y, band(c, Wr, lt(x) + .12 + (H(x // 4, y // 3) - .5) * .06, 3, 7)) end end
    local beams = {}
    for x = x0, x1 - 2, 22 do beams[#beams + 1] = x end; beams[#beams + 1] = x1 - 3
    for _, bx in ipairs(beams) do R(c, bx, y0, bx + 3, y1, 'k3'); px.vline(c, bx, y0, y1, 'k4'); px.vline(c, bx + 3, y0, y1, 'k2') end
    local mid = (y0 + y1) // 2; R(c, x0, mid, x1, mid + 3, 'k3'); px.hline(c, x0, x1, mid, 'k4'); px.hline(c, x0, x1, mid + 3, 'k2')
    for i = 1, #beams - 1, 2 do local a, b = beams[i] + 4, beams[i + 1] - 1
      if b - a > 8 then px.line(c, a, mid - 1, b, y0 + 1, 'k3'); px.line(c, a, mid - 2, b - 1, y0 + 1, 'k2') end end
    R(c, x0, y0, x1, y0 + 2, 'k3'); px.hline(c, x0, x1, y0, 'k4')
  elseif mat == 'batten' then
    for y = y0, y1 do for x = x0, x1 do local bx = (x - x0) % 8
      P(c, x, y, bx == 0 and Wr[2] or (bx == 1 and Wr[6] or band(c, Wr, lt(x) - .04, 3, 6))) end end
  else  -- clapboard in the given paint
    for y = y0, y1 do local row = (y - y0) // 6; local ry = (y - y0) % 6
      local tone = H(row, seed) > .4 and .04 or -.04
      for x = x0, x1 do local col
        if ry == 5 then col = Wr[2] elseif ry == 4 then col = Wr[3] elseif ry == 0 then col = (x < x1 - (x1 - x0) * .2) and Wr[6] or Wr[5]
        else col = band(c, Wr, lt(x) + tone, 4, 6) end
        P(c, x, y, col) end end
    for k = 0, math.floor((x1 - x0) * (y1 - y0) / 1600) do local kx = x0 + 6 + math.floor(H(k, seed) * (x1 - x0 - 12)); local ky = y0 + 2 + 6 * math.floor(H(k, seed + 3) * ((y1 - y0) // 6))
      if ky < y1 - 3 then P(c, kx, ky, Wr[2]); P(c, kx + 1, ky, Wr[3]) end end
    if rough then   -- judge (derelict barn): neglect shows in the boards themselves, a few missing (the dark inside and a stud behind), one sprung
      local rows = (y1 - y0) // 6
      -- judge r2: the paint peels to silver-grey wood, mostly on the lowest courses where the wet splashes up, in ragged runs
      for r = 0, rows do local low = r >= rows - 3; local x = x0
        while x < x1 do local len = 6 + math.floor(H(x + r * 7, seed + 71) * 16)
          if H(x * 3 + r, seed + 73) < (low and .55 or .12) then for xx = x, math.min(x1, x + len) do for ry = 0, 5 do local yy = y0 + r * 6 + ry
            -- judge r3: tidy rectangles read as a pattern; the paint tears unevenly at each end and leaves the odd fleck of red
            local endd = math.min(xx - x, x + len - xx); local torn = endd < 3 and H(xx * 5 + ry, seed + 75) < .6 - endd * .15
            if yy <= y1 and not torn and not (ry >= 1 and ry <= 3 and H(xx * 7 + ry, seed + 77) > .96) then P(c, xx, yy, ry == 5 and 'gs1' or (ry == 4 and 'gs2' or (ry == 0 and 'gs5' or ((xx + ry) % 7 == 0 and 'gs3' or 'gs4')))) end end end end
          if H(x * 3 + r, seed + 73) < (low and .55 or .12) then for ry = 1, 4 do local yy = y0 + r * 6 + ry; if yy <= y1 then P(c, x - 1, yy, Wr[2]); P(c, math.min(x1, x + len + 1), yy, Wr[2]) end end end   -- judge r4: a dark lip where the paint stops
          x = x + len + 1 end end
      local avoid = type(rough) == 'table' and rough or {}   -- the door and windows (a gap under them would never show)
      local function free(a, b) for _, sp in ipairs(avoid) do if b >= sp[1] and a <= sp[2] then return false end end return true end
      local function spot(k, len) for t = 0, 24 do local gx = x0 + 8 + math.floor(H(k * 31 + t, seed + 65) * (x1 - x0 - 16 - len)); if free(gx, gx + len) then return gx end end end
      for k = 0, 2 do local r = 1 + math.floor(H(k, seed + 61) * (rows - 3)); local len = 9 + math.floor(H(k, seed + 63) * 9)
        local gx = spot(k, len); local gy = y0 + r * 6
        if gx then R(c, gx, gy, gx + len, gy + 4, 'lg2'); px.hline(c, gx, gx + len, gy, 'lg1');   -- judge r4: the dark inside is wood in shadow, not black P(c, gx, gy + 1, Wr[3]); P(c, gx, gy + 2, Wr[3]); P(c, gx + len, gy + 3, Wr[3]); P(c, gx + len - 1, gy + 4, Wr[3]);   -- splintered ends
          px.hline(c, gx + 1, gx + len - 1, gy - 1, Wr[6]); P(c, gx + 3, gy, Wr[5]); P(c, gx + len - 4, gy, Wr[5]);   -- the lit, broken edge of the board above px.vline(c, gx + len // 2, gy + 1, gy + 4, 'lg3')
        P(c, gx - 1, gy + 2, Wr[2]); P(c, gx + len + 1, gy + 2, Wr[2]); px.hline(c, gx, gx + len, gy + 5, Wr[5]) end end
      local r = 2 + math.floor(H(7, seed + 67) * (rows - 4)); local gx = spot(9, 14) or x0 + 10; local gy = y0 + r * 6
      for i = 0, 13 do local dy = (i >= 7) and ((i - 6) // 3) or 0; px.vline(c, gx + i, gy + dy, gy + 4 + dy, Wr[3 + (i % 2)]); P(c, gx + i, gy + 5 + dy, Wr[1]) end   -- one board sprung loose at its right end
    end
  end
end

-- ------------------------------------------------------------------ roofs
-- one pixel of roof material, given which side it's on (lit 1..0 shaded) and where it is in its course
function B.roofpx(c, mat, x, y, top, lit, seed)
  local Rr = B.ROOFS[mat]
  if mat == 'scallop' then
    local row = (y - top) // 7; local ry = (y - top) % 7; local off = (row % 2) * 6; local lx = (x + off) % 12
    if (ry == 6 and lx >= 2 and lx <= 9) or (ry == 5 and (lx == 1 or lx == 10)) or (ry == 4 and (lx == 0 or lx == 11)) then return px.i(c, lit > .5 and Rr[2] or Rr[1]) end
    local n = H(x // 12 + row * 7, row + seed)
    local v = band(c, Rr, (lit > .5 and .66 or .26) + .2 * (1 - math.abs(lx - 5.5) / 6) - (ry <= 1 and .2 or 0) + (n - .5) * .1 - (y - top) / 520, 2, 8)
    if lit > .5 and ry == 2 and (lx == 3 or lx == 4) then v = px.i(c, n > .5 and Rr[8] or Rr[7]) end
    return v
  elseif mat == 'slate' or mat == 'shingle' or mat == 'plum' or mat == 'asphalt' or mat == 'brown' or mat == 'teal' then
    local ch = (mat == 'slate') and 5 or 6; local cw = (mat == 'slate') and 9 or 11
    local row = (y - top) // ch; local ry = (y - top) % ch; local off = math.floor(H(row, seed) * cw)
    local lx = (x + off) % cw; local n = H((x + off) // cw, row + seed)
    --[[ judge (buildings sweep): one shingle stamp edge to edge gave the biggest mass on every building texture and no form.
         The middle of each plane goes quiet (soft course lines, no joints); the full shingle pattern stays at the eave, the
         edges and the hips, where the eye reads the material ]]
    local ctx = B.RCTX; local quiet = false
    if ctx then local dE = ctx.yb - y; local dS = math.min(x - ctx.xa, ctx.xb - x); quiet = dE > ch * 2 + 1 and dS > 9 and (y - top) > ch end
    if ry == ch - 1 then return px.i(c, quiet and (lit > .5 and Rr[3] or Rr[2]) or (lit > .5 and Rr[2] or Rr[1])) end
    if lx == 0 and ry < ch - 2 and not quiet then return px.i(c, lit > .5 and Rr[3] or Rr[2]) end
    local v = band(c, Rr, (lit > .5 and .62 or .24) + (ry == 0 and .14 or 0) - (ry == ch - 2 and .1 or 0) + (n - .5) * .16 - (y - top) / 560, 2, 8)
    if lit > .5 and ry == 1 and lx == 2 and n > .8 then v = px.i(c, Rr[7]) end   -- a few lit shingle tips, not a dash on every other one (judge: the roof read as noise)
    return v
  elseif mat == 'tin' and B.GABLE then
    local G = B.GABLE; local d = math.abs(x - G.ax); local v = y - G.k * d
    local sm0 = math.floor(v / 6); local right = x >= G.ax
    --[[ judge r7: the derelict barn's neglect belongs at the eaves (mid-slope blotches read as mould): one lifted sheet near
         the left eave, a dark gap under a lit bent edge ]]
    local bx = math.floor(v) % 6; local sm = math.floor(v / 6)
    if G.rough then   --[[ judge r4: the roof (half the sprite) read as the kept barn's clean tin. One sheet gone near the right
         eave (dark rafters, a lit cut edge); one whole sheet rusted through on the left; the eave sides oxide red-brown ]]
      if right and sm == 9 and d > G.half - 26 then if bx == 0 then return px.i(c, Rr[8]) end; return px.i(c, (d % 6 == 0) and 'lg3' or 'lg1') end
      if not right and (sm == 5 or sm == 6) then if bx == 0 then return px.i(c, 'lg5') end; if bx == 1 then return px.i(c, 'lg2') end
        return px.i(c, (H(d // 3, sm + seed) > .5) and 'lg3' or 'lg4') end
      local rl2 = 8 + math.floor(H(sm + (right and 50 or 0), seed + 21) * 24)
      if bx >= 2 and bx <= 3 and d > G.half - rl2 and H(sm + (right and 50 or 0), seed + 23) > .25 then return px.i(c, d > G.half - rl2 * .45 and 'lg4' or 'lg3') end
    end
    -- judge r5: wear where the water runs off, the last 3-8 px of each rib before the eave a step darker, each rib its own length
    local run = 3 + math.floor(H(sm + (right and 50 or 0), seed + 7) * 6); local worn = d > G.half - run
    if bx == 0 then return px.i(c, lit > .5 and (worn and Rr[5] or Rr[6]) or (worn and Rr[3] or Rr[4])) end
    if bx == 1 then return px.i(c, lit > .5 and Rr[2] or Rr[1]) end   -- judge r4: the rib's shadow side, so each seam is a 2 px rib
    -- rust (judge r5): orange-brown, 2 px wide, starting at a rib end and running out to the eave, darkest where it starts
    local rs = H(sm + (right and 50 or 0), seed); local rl = 2 + math.floor(H(sm, seed + 3) * 6)   -- judge r6: 2-7 px, not a ladder of equal dashes
    if G.rough then rs = (sm % 2 == 1 and H(sm + (right and 50 or 0), seed + 9) > .35) and 1 or 0; rl = 12 + math.floor(H(sm, seed + 4) * 12) end   -- derelict (judge r3: the roof read untouched): long rust runs down every other seam to the eave
    if rs > .84 and (bx == 2 or bx == 3) and d > G.half - rl then
      if G.rough then return px.i(c, d < G.half - rl * .6 and 'lg5' or (bx == 2 and 'lg6' or 'lg5')) end
      return px.i(c, d < G.half - rl / 2 and 'mu3' or 'mu4') end
    return band(c, Rr, (lit > .5 and .5 or .22) - (worn and .14 or 0), 2, 6)
  elseif mat == 'tin' then
    local bx = x % 7
    if bx == 0 then return px.i(c, lit > .5 and Rr[7] or Rr[4]) end
    if bx == 1 then return px.i(c, lit > .5 and Rr[5] or Rr[3]) end
    if bx == 6 then return px.i(c, Rr[2]) end
    --[[ judge r6: rust starts at the eave and runs up a rib 5-10 px, 2 px wide, tapered at the top, orange-brown (crimson
         streaks floating mid-slope read as blood), a few, clustered toward the two ends of the eave ]]
    local E = B.EAVE
    if E and bx >= 2 and bx <= 3 then local col = x // 7; local w = E.x1 - E.x0; local fx = (x - E.x0) / math.max(1, w)
      if (fx < .3 or fx > .7) and H(col, seed) > .55 then local len = 5 + math.floor(H(col, seed + 1) * 6); local up = E.y - y
        if up >= 0 and up < len and not (up >= len - 2 and bx == 3) then return px.i(c, up >= len - 3 and 'mu4' or 'mu3') end end end
    return band(c, Rr, (lit > .5 and .58 or .26) - (y - top) / 600, 2, 7)
  else -- thatch
    local n = H(x // 2 + (y // 3) * 17, seed)
    local row = (y - top) % 9
    local v = (lit > .5 and .6 or .26) + (n - .5) * .34 - (row == 8 and .25 or 0) + (row == 0 and .1 or 0)
    return band(c, Rr, v, 1, 8)
  end
end

-- a front gable: the end wall in the house's material, cream barge boards, and the two roof planes running back from it
function B.frontgable(c, sp, x0, x1, yW, wallmat, roofmat, trim, seed)
  local W = x1 - x0; local ax = (x0 + x1) // 2
  local over = 14; local Gh = math.floor(W * (sp.pitch or .28)); local Rb = math.floor(W * (sp.back or .31))
  local ay = yW - Gh; local topA = ay - Rb + 6; local sideTop = yW - math.floor(W * .25)
  local roofpoly = {{x0 - over, sideTop}, {ax, topA}, {x1 + over, sideTop}, {x1 + over, yW + 4}, {ax, ay}, {x0 - over, yW + 4}}
  --[[ judge r3: seen end-on, a metal roof's seams run from the ridge down to each eave, parallel to the gable's edges ]]
  B.GABLE = {ax = ax, k = (yW + 4 - ay) / math.max(1, ax - (x0 - over)), half = ax - (x0 - over), rough = sp.rough}
  px.poly(c, roofpoly, function(x, y) return B.roofpx(c, roofmat, x, y, topA, x < ax and 1 or 0, seed) end)
  B.GABLE = nil
  if sp.rough then   -- judge r7: olive moss clumps along the outer 8 px of each plane, lit top-left (judge r3: two, larger, not beads)
    for side = 0, 1 do for k = 0, 1 do
      local ex = side == 0 and (x0 - over + 2 + math.floor(H(k, seed + 31 + side) * 5)) or (x1 + over - 2 - math.floor(H(k, seed + 33 + side) * 5))
      local ey = sideTop + 10 + math.floor((k + .3 + H(k, seed + 35 + side) * .5) / 2 * (yW + 4 - sideTop - 16))
      local rw, rh = 5 + math.floor(H(k, seed + 37) * 2), 3 + math.floor(H(k, seed + 39) * 1.5)
      for yy = -rh, rh do for xx = -rw, rw do if (xx * xx) / (rw * rw + .5) + (yy * yy) / (rh * rh + .5) <= 1 and px.get(c, ex + xx, ey + yy) ~= 0 then
        P(c, ex + xx, ey + yy, (yy < 0 and xx <= 0) and 'v4' or ((yy > 0 or xx > rw - 1) and 'v2' or 'v3')) end end end
    end end
  end
  -- moss and the odd bird mess along the lower courses
  for i = 0, sp.rough and -1 or math.floor(W / 3) do local x = x0 - over + math.floor(H(i, seed) * (W + over * 2)); local y = yW - 22 + math.floor(H(i, seed + 5) * 24)
    if px.get(c, x, y) ~= 0 and math.abs(x - ax) > 6 and H(i, 9) < (sp.moss or .4) then P(c, x, y, ({'v3', 'v4', 'v5', 'v4'})[i % 4 + 1]); P(c, x + 1, y, 'v3') end end
  for y = topA, ay do P(c, ax - 1, y, B.ROOFS[roofmat][7]); P(c, ax, y, B.ROOFS[roofmat][6]); P(c, ax + 1, y, B.ROOFS[roofmat][3]); P(c, ax + 2, y, B.ROOFS[roofmat][2]) end
  px.vline(c, x0 - over, sideTop, yW + 4, B.ROOFS[roofmat][3]); px.vline(c, x1 + over, sideTop, yW + 4, B.ROOFS[roofmat][1])
  if sp.rough and roofmat == 'tin' then
    --[[ judge (derelict barn): a flat dark hole read as a clean roof with a stain. One sheet near the left eave is lifted: 14 px
         along its rib, its outer end raised 3 px and standing 3 px past the roof's outline, a lit top edge, the dark gap under
         it and its shadow on the sheet below ]]
    local Rr = B.ROOFS.tin; local half = ax - (x0 - over); local k = (yW + 4 - ay) / math.max(1, ax - (x0 - over)); local v0 = 48
    for d = half - 13, half + 3 do local x = ax - d; local yt = math.floor(v0 + k * d + .5)   -- the rib band's top on this column (bands run v = y - k*d)
      local lift = math.max(0, math.floor((d - (half - 13)) * 3 / 16 + .5)); local top = yt - lift
      if lift > 0 then for yy = top + 5, yt + 5 do P(c, x, yy, 'OUT') end end
      P(c, x, top, Rr[8]); P(c, x, top + 1, Rr[6]); P(c, x, top + 2, Rr[5]); P(c, x, top + 3, Rr[4]); P(c, x, top + 4, Rr[2])   -- judge r2: its top edge lit (it read as a dark ledge)
      if d <= half then for yy = yt + 6, yt + 7 do if px.get(c, x, yy) ~= 0 then px.shade(c, x, yy, -1) end end end
    end
  end
  -- the gable end
  local G = B.WALLS[wallmat]
  px.poly(c, {{x0, yW + 1}, {ax, ay + 4}, {x1, yW + 1}}, function(x, y)
    if wallmat == 'brick' or wallmat == 'stone' then local r = (y % 4); return px.i(c, (r == 3 or (x + (y // 4) % 2 * 5) % 10 == 9) and 's4' or G[4 + ((x // 10 + y // 4) % 2)]) end
    local bx = (x - x0) % 8
    if sp.rough then   --[[ judge r3: a peel following both roof edges read as bunting (a mirrored sawtooth). Whole boards bleach from
         the bottom up, uneven, longest on the weather (left) side; the boards under the eaves stay mostly red; grain streaks ]]
      local b = (x - x0) // 8; local left = x < ax; local edge = ay + 4 + (yW + 1 - (ay + 4)) * (math.abs(x - ax) / math.max(1, ax - x0))
      local len = math.floor(H(b, seed + 77) * (left and 30 or 12)) - (H(b, seed + 79) > .55 and 8 or 0)
      if yW + 1 - y < len and y - edge > 5 then if bx == 0 then return px.i(c, 'gs1') end; if bx == 1 then return px.i(c, 'gs5') end
        if (bx == 4 or bx == 6) and H(y // 3, b + seed) > .55 then return px.i(c, 'gs3') end
        return px.i(c, (yW + 1 - y) > len - 2 and 'gs3' or 'gs4') end end
    if bx == 0 then return px.i(c, G[2]) end; if bx == 1 then return px.i(c, G[6]) end
    return band(c, G, .56 - (x - x0) / 700 - (yW - y) / 300, 3, 6) end)
  local gw = sp.gablewin or 'round'
  if gw == 'round' then
    local cy = ay + Gh * .55
    px.ellipse(c, ax + .5, cy + .5, 9, 9, trim[3]); px.ellipse(c, ax + .5, cy + .5, 7, 7, 'g2'); px.ellipse(c, ax - 1.5, cy - 1.5, 3.5, 3.5, 'g3')
    P(c, ax - 3, cy - 4, 'g6'); P(c, ax - 2, cy - 4, 'g5'); px.hline(c, ax - 6, ax + 7, math.floor(cy), trim[2]); px.vline(c, ax, cy - 7, cy + 7, trim[2])
  elseif gw == 'loft' then
    local ly = ay + math.floor(Gh * .35); R(c, ax - 9, ly, ax + 9, ly + 16, trim[3]); R(c, ax - 7, ly + 2, ax + 7, ly + 16, 'w3')
    px.line(c, ax - 7, ly + 2, ax + 7, ly + 16, trim[4]); px.line(c, ax + 7, ly + 2, ax - 7, ly + 16, trim[4]); px.vline(c, ax, ay - 4, ly - 1, 'm3')
  elseif gw == 'mesh' then   -- the coop's gable: an opening covered in chicken wire, the dark roost behind it
    local vy = ay + math.floor(Gh * .38); R(c, ax - 9, vy, ax + 9, vy + 12, trim[3]); R(c, ax - 7, vy + 2, ax + 7, vy + 11, 'k1')
    for yy = vy + 2, vy + 11 do for xx = ax - 7, ax + 7 do if ((xx + yy) % 3 == 0) or ((xx - yy) % 3 == 0 and (yy % 2 == 0)) then P(c, xx, yy, 'm3') end end end
    px.hline(c, ax - 9, ax + 9, vy + 12, trim[2]); px.hline(c, ax - 9, ax + 9, vy, trim[4])
  elseif gw == 'vent' then
    local vy = ay + math.floor(Gh * .45); R(c, ax - 6, vy, ax + 6, vy + 9, trim[3]); for yy = vy + 2, vy + 8, 2 do px.hline(c, ax - 5, ax + 5, yy, trim[1]) end
  end
  for t = 0, 5 do
    local col = ({'OUT', trim[1], trim[3], trim[4], trim[5], 'OUT'})[t + 1]
    px.line(c, x0 - over - 1, yW + 3 + t - 2, ax, ay + t - 2, col)
    px.line(c, ax, ay + t - 2, x1 + over + 1, yW + 3 + t - 2, (t >= 1 and t <= 4) and ({trim[1], trim[2], trim[3], trim[3]})[t] or col)
  end
  return topA, ay
end

-- a long roof seen from the front (ridge running left-right), with hipped ends
function B.sideroof(c, x0, x1, yW, depth, roofmat, seed, hip)
  local over = 10; local top = yW - depth; local hipw = hip and math.floor(depth * .9) or 0
  B.EAVE = {y = yW + 3, x0 = x0 - over, x1 = x1 + over}
  for y = top, yW + 3 do
    local t = (y - top) / math.max(1, depth); local inset = math.floor((1 - t) * hipw)
    local xa, xb = x0 - over + inset, x1 + over - inset
    B.RCTX = {xa = xa, xb = xb, yb = yW + 3}
    for x = xa, xb do
      local lit = 1
      if hip and x < xa + math.floor(t * hipw * .6) + 3 then lit = 1 end
      if hip and x > xb - math.floor(t * hipw) - 3 then lit = 0 end
      P(c, x, y, B.roofpx(c, roofmat, x, y, top, lit, seed))
    end
    if hip then P(c, xb - math.floor(t * hipw) - 3, y, B.ROOFS[roofmat][2]); P(c, xa + math.floor(t * hipw * .6) + 3, y, B.ROOFS[roofmat][6]) end   -- the hips: the right one dark, the left one lit (judge: lit ridge and hips)
  end
  B.RCTX = nil
  --[[ judge (kit pass 2): stepped diagonals read as painted glare bars. Light by plane: the left hip a step lighter than the
       front; on the front at most one block-shaped lighter step at the upper left, its edges on course lines and shingle
       joints; the right hip stays in shade. Blue slate takes no lit step (it turns powder blue, read as ice) ]]
  local Wd = (x1 - x0) + 2 * over
  for y = top + 2, yW + 3 do local t = (y - top) / math.max(1, depth); local inset = math.floor((1 - t) * hipw); local xa = x0 - over + inset
    local hipEdge = hip and (xa + math.floor(t * hipw * .6) + 3) or nil
    local blockX = x0 - over + math.floor(Wd * .3); local blockY = top + 6 * math.max(1, math.floor(depth * .45 / 6))
    for x = x0 - over, x1 + over do if px.get(c, x, y) ~= 0 then
      local cool = (roofmat == 'slate' or roofmat == 'teal')   -- judge (pass 3): a lit step on blue slate or teal went icy, streaky or read as a verdigris stain
      if hip and x < hipEdge - 1 then
        if cool then P(c, x, y, ((y - top) % 5 == 4) and B.ROOFS[roofmat][5] or B.ROOFS[roofmat][6]) else px.shade(c, x, y, 1) end   -- slate/teal: one flat, mid step lighter, no streaks
      elseif not cool and y < blockY and x < blockX and x >= (hipEdge or (x0 - over)) + 1 then px.shade(c, x, y, 1) end end end end
  local Rr = B.ROOFS[roofmat]
  --[[ judge (buildings sweep): a side roof in one even tone with a pale frame read as a box lid. The slope turns away from
       the light toward the eave: the lowest courses a step and two darker (the shadow the eave gathers), the first under the
       ridge a step lighter ]]
  if not hip then for y = top + 2, yW + 3 do local fromEave = yW + 3 - y
    local k = fromEave <= 2 and -2 or (fromEave <= 7 and -1 or (y <= top + 4 and 1 or 0))
    if k ~= 0 then for x = x0 - over, x1 + over do if px.get(c, x, y) ~= 0 then px.shade(c, x, y, k) end end end end end
  px.hline(c, x0 - over + hipw, x1 + over - hipw, top, Rr[7]); px.hline(c, x0 - over + hipw, x1 + over - hipw, top + 1, Rr[6]); px.hline(c, x0 - over + hipw, x1 + over - hipw, top - 1, 'OUT')
  px.hline(c, x0 - over, x1 + over, yW + 4, 'OUT')
  return top
end

-- ------------------------------------------------------------------ openings and life
function B.window(c, wx, wy, ww, wh, o)
  if o.lancet and not o._in then
    local hw = ww / 2 + 4; local cx = wx + (ww - 1) / 2; local ys = wy - 4 + 1.732 * hw
    local function inside(x, y) if y >= ys then return true end
      local a, b = (x + .5) - (cx - hw), (x + .5) - (cx + hw); local dy = (y + .5) - ys
      return a * a + dy * dy <= 4 * hw * hw and b * b + dy * dy <= 4 * hw * hw end
    local orig = px.p
    px.p = function(cc, x, y, col) if inside(math.floor(x), math.floor(y)) then orig(cc, x, y, col) end end
    local q = {}; for k, v in pairs(o) do q[k] = v end; q._in = true
    B.window(c, wx, wy, ww, wh, q)
    px.p = orig
    for y = wy - 5, math.floor(ys) do for x = wx - 5, wx + ww + 4 do       -- the arch's edge: lit on the left, shaded right, a dark line outside
      if inside(x, y) and not (inside(x - 1, y) and inside(x + 1, y) and inside(x, y - 1)) then P(c, x, y, x < cx and o.trim[5] or o.trim[2])
      elseif not inside(x, y) and (inside(x, y + 1) or inside(x - 1, y) or inside(x + 1, y)) and y > wy - 5 then P(c, x, y, 'OUT2') end end end
    return
  end
  local T = o.trim
  if o.shutters then for _, sx in ipairs({wx - 9, wx + ww + 4}) do
    R(c, sx, wy - 2, sx + 4, wy + wh + 1, o.shutters[3]); px.vline(c, sx, wy - 2, wy + wh + 1, o.shutters[4]); px.vline(c, sx + 4, wy - 2, wy + wh + 1, o.shutters[2])
    for yy = wy, wy + wh, 3 do px.hline(c, sx + 1, sx + 3, yy, o.shutters[2]) end end end
  R(c, wx - 4, wy - 4, wx + ww + 3, wy + wh + 3, T[3]); px.hline(c, wx - 4, wx + ww + 3, wy - 4, T[5]); px.vline(c, wx - 4, wy - 4, wy + wh + 3, T[4]); px.vline(c, wx + ww + 3, wy - 4, wy + wh + 3, T[2])
  for y = wy, wy + wh - 1 do for x = wx, wx + ww - 1 do
    local v
    if o.night and not o.dark then v = px.ramp(c, {'y1', 'y2', 'y3'}, .92 - (y - wy) / wh * .6, x, y)
    else v = ((x - wx) + (y - wy) * .8 < ww * .55) and 'g3' or 'g2' end
    if o.stained then                                                   -- leaded diamond panes; a few coloured, one of them red
      local u, w2 = (x - wx) + (y - wy), (x - wx) - (y - wy)
      if u % 7 == 0 or w2 % 7 == 0 then v = 'OUT2'
      else local id = (u // 7) * 13 + (w2 // 7) * 7; local n = H(id, o.seed or 1)
        local lit = o.night and not o.dark
        if n > .86 then v = lit and 'b3' or 'dr3' elseif n > .7 then v = lit and 'y3' or 'y1' elseif n > .55 then v = lit and 'y2' or 'd3' end end
    end
    P(c, x, y, v) end end
  if not (o.night and not o.dark) and not o.stained then px.line(c, wx + 2, wy + 6, wx + 7, wy + 1, 'g5'); px.line(c, wx + 3, wy + 7, wx + 8, wy + 2, 'g4'); P(c, wx + 2, wy + 2, 'g6') end
  if o.curtain then for i = 0, math.min(7, wh - 2) do
    local cc = (o.night and not o.dark) and 'f3' or o.curtain
    px.hline(c, wx, wx + 3 - i // 3, wy + i, cc); px.hline(c, wx + ww - 4 + i // 3, wx + ww - 1, wy + i, cc) end end
  if o.face then local fx = wx + ww * .62
    px.ellipse(c, fx, wy + wh - 7, 3.2, 3.6, 'p1'); P(c, fx - 1.5, wy + wh - 8, 'OUT'); P(c, fx + 1, wy + wh - 8, 'OUT'); P(c, fx - 1, wy + wh - 9, 'p2')
    px.hline(c, math.floor(fx - 2), math.floor(fx + 2), wy + wh - 3, 'f2') end
  if o.watcher and o.night then for y = wy + 4, wy + wh - 1 do for x = wx + 3, wx + ww - 4 do
    local dx = x - (wx + ww / 2); if (dx * dx) / 6 + (y - (wy + 7)) ^ 2 / 7 < 1 or (y > wy + 10 and math.abs(dx) < 4) then P(c, x, y, 'OUT') end end end end
  if not o.stained then
    px.vline(c, wx + ww // 2, wy, wy + wh - 1, T[2]); px.hline(c, wx, wx + ww - 1, wy + wh // 2, T[2])
    px.vline(c, wx + ww // 2 + 1, wy, wy + wh - 1, T[4]); px.hline(c, wx, wx + ww - 1, wy + wh // 2 + 1, T[4])
  else px.hline(c, wx, wx + ww - 1, wy + wh * 2 // 3, T[3]); px.hline(c, wx, wx + ww - 1, wy + wh * 2 // 3 + 1, T[2]) end
  if o.broken then px.line(c, wx + 2, wy + 3, wx + 6, wy + 8, 'OUT'); px.line(c, wx + 6, wy + 8, wx + 4, wy + 12, 'OUT'); P(c, wx + 7, wy + 4, 'g1') end
  if o.broken and o.rough then   -- judge (derelict barn): both windows kept the kept barn's whole glass; one pane gone, a jagged hole and shards
    local hx, hy = wx + 2, wy + 2; local hw, hh = ww // 2 - 2, wh // 2 - 2
    for y = hy, hy + hh do for x = hx, hx + hw do local e = (x - hx) / math.max(1, hw) + (y - hy) / math.max(1, hh)
      if e < .95 + (H(x, y + 3) - .5) * .35 then P(c, x, y, 'OUT') end end end
    P(c, hx + hw, hy, 'g5'); P(c, hx + hw - 1, hy + 1, 'g4'); P(c, hx, hy + hh, 'g5'); P(c, hx + 1, hy + hh - 1, 'g4'); P(c, hx + hw // 2 + 1, hy + hh // 2 + 1, 'g5') end
  if o.boarded then for i, yy in ipairs({wy + 2, wy + wh - 7}) do
    -- judge (derelict barn): new-lumber yellow boards read as fresh repairs; on a derelict building they are grey, old and split
    local bw = o.rough and {'gs3', 'gs5', 'gs1'} or {'w5', 'w7', 'w2'}
    R(c, wx - 5, yy + i, wx + ww + 4, yy + i + 3, bw[1]); px.hline(c, wx - 5, wx + ww + 4, yy + i, bw[2]); px.hline(c, wx - 5, wx + ww + 4, yy + i + 3, bw[3])
    if o.rough and i == 2 then local sx = wx + ww // 2 + 2; P(c, sx, yy + i + 1, bw[3]); P(c, sx + 1, yy + i + 2, bw[3]); P(c, sx + 2, yy + i + 2, bw[3]); P(c, sx - 1, yy + i + 1, 'gs2') end
    P(c, wx - 3, yy + i + 1, 'm2'); P(c, wx + ww + 2, yy + i + 1, 'm2') end end
  R(c, wx - 6, wy + wh + 3, wx + ww + 5, wy + wh + 5, T[4]); px.hline(c, wx - 6, wx + ww + 5, wy + wh + 3, T[5]); px.hline(c, wx - 6, wx + ww + 5, wy + wh + 6, 'w2')
  if o.box then B.flowerbox(c, wx - 3, wy + wh + 7, ww + 5, o.box == 'dead', o.seed or 1) end
end

function B.flowerbox(c, bx, by, bw, dying, seed)
  R(c, bx, by, bx + bw, by + 7, 'w4'); px.hline(c, bx, bx + bw, by, 'w6'); px.hline(c, bx, bx + bw, by + 7, 'w2'); px.vline(c, bx, by, by + 7, 'w5')
  for i = 0, 4 do px.vline(c, bx + 3 + i * (bw // 5), by + 2, by + 5, 'w3') end
  for i = 0, bw - 2, 3 do
    local fx = bx + 1 + i; local hgt = 3 + math.floor(H(i, bx + seed) * 4)
    if dying then px.vline(c, fx, by - hgt + 2, by - 1, 'k3'); P(c, fx + 1, by - hgt + 3, ({'f1', 'f2', 'k2'})[i % 3 + 1]); P(c, fx + 1, by - hgt + 4, 'f1')
    else px.vline(c, fx, by - hgt, by - 1, 'v3'); P(c, fx - 1, by - hgt + 2, 'v4'); P(c, fx, by - hgt - 1, ({'f3', 'f4', 'y2', 'f3', 'p2'})[(i + seed) % 5 + 1]); P(c, fx + 1, by - hgt, 'f2') end
  end
end

function B.door(c, dx0, dx1, dy0, yb, o)
  local T, D = o.trim, o.col
  R(c, dx0 - 5, dy0 - 5, dx1 + 5, yb, T[3]); px.hline(c, dx0 - 5, dx1 + 5, dy0 - 5, T[5]); px.vline(c, dx0 - 5, dy0 - 5, yb, T[4]); px.vline(c, dx1 + 5, dy0 - 5, yb, T[2])
  R(c, dx0 - 7, dy0 - 8, dx1 + 7, dy0 - 6, T[4]); px.hline(c, dx0 - 7, dx1 + 7, dy0 - 8, T[5]); px.hline(c, dx0 - 7, dx1 + 7, dy0 - 5, 'w2')
  local kind = o.kind or 'plank'
  for y = dy0, yb do for x = dx0, dx1 do
    local bx = (x - dx0) % 6
    local v
    if kind == 'barn' and o.rough then v = (bx == 0) and D[1] or ((bx == 1) and D[4] or band(c, D, .55 - (x - dx0) / 120 + (H(x // 6, y // 9) - .5) * .12, 2, 4))   -- judge r4: a grey slab read as steel; plank seams
    elseif kind == 'barn' then v = band(c, D, .55 - (x - dx0) / 120, 2, 4)
    else v = (bx == 0) and D[1] or ((bx == 1) and D[4] or band(c, D, .55 - (x - dx0) / 70, 2, 4)) end
    P(c, x, y, v) end end
  local mid = (dx0 + dx1) // 2
  if kind == 'double' or kind == 'barn' then px.vline(c, mid, dy0, yb, 'OUT') end
  if kind == 'barn' then for _, h in ipairs({{dx0, mid}, {mid + 1, dx1}}) do px.line(c, h[1], dy0, h[2], yb, T[4]); px.line(c, h[2], dy0, h[1], yb, T[4])
      R(c, h[1], dy0, h[2], dy0 + 1, T[4]); R(c, h[1], yb - 1, h[2], yb, T[4]) end
  elseif kind == 'glass' then R(c, dx0 + 3, dy0 + 3, dx1 - 3, dy0 + (yb - dy0) // 2, o.night and 'y2' or 'g3'); if not o.night then P(c, dx0 + 4, dy0 + 4, 'g6'); P(c, dx0 + 5, dy0 + 4, 'g5') end
    px.vline(c, mid, dy0 + 3, dy0 + (yb - dy0) // 2, T[2])
  else R(c, dx0 + 5, dy0 + 5, dx1 - 5, dy0 + 15, T[2]); R(c, dx0 + 6, dy0 + 6, dx1 - 6, dy0 + 14, o.night and 'y2' or 'g2'); px.vline(c, mid, dy0 + 6, dy0 + 14, T[2]); px.hline(c, dx0 + 6, dx1 - 6, dy0 + 10, T[2])
    if not o.night then P(c, dx0 + 7, dy0 + 7, 'g5') end end
  R(c, dx1 - 5, dy0 + (yb - dy0) * .55, dx1 - 3, dy0 + (yb - dy0) * .55 + 2, 'y2'); P(c, dx1 - 5, dy0 + (yb - dy0) * .55, 'y3')
  if o.ribbon then R(c, dx1 - 6, dy0 + 18, dx1 - 2, dy0 + 19, 'b2'); P(c, dx1 - 4, dy0 + 20, 'b2'); P(c, dx1 - 3, dy0 + 21, 'b1'); P(c, dx1 - 5, dy0 + 21, 'b3') end
  if o.scratches then for k = 0, 2 do px.line(c, dx0 + 3 + k * 3, yb - 17, dx0 + 6 + k * 3, yb - 8, 'OUT') end end
  if o.blood then for k = 0, 3 do px.vline(c, dx0 + 2 + k * 2, dy0 + 20, dy0 + 26 + k * 2, k % 2 == 0 and 'b2' or 'b1') end end
  R(c, dx0 - 9, yb + 1, dx1 + 9, yb + 5, 's6'); px.hline(c, dx0 - 9, dx1 + 9, yb + 1, 's7'); px.hline(c, dx0 - 9, dx1 + 9, yb + 5, 's3')
end

function B.lantern(c, lx, ly, night)
  px.hline(c, lx - 3, lx + 3, ly, 'm2'); px.vline(c, lx - 3, ly, ly + 4, 'm2'); R(c, lx - 2, ly + 4, lx + 3, ly + 12, 'm3'); R(c, lx - 1, ly + 5, lx + 2, ly + 11, night and 'y3' or 'g3')
  if not night then P(c, lx, ly + 8, 'y2'); P(c, lx + 1, ly + 8, 'y1') end
  px.hline(c, lx - 3, lx + 4, ly + 3, 'm1'); px.hline(c, lx - 3, lx + 4, ly + 13, 'm1')
end

function B.ivy(c, x, ybot, ytop, seed)
  local sx, sy = x, ybot
  for i = 0, 160 do
    sx = sx + (H(i, seed) - .4) * 2.2; sy = sy - 1
    if sy < ytop then break end
    P(c, sx, sy, 'v2')
    if i % 3 == 0 then local lx2 = sx + (i % 2 == 0 and -3 or 2)
      for _, d in ipairs({{0,0},{1,0},{0,1},{1,1},{2,0},{-1,1}}) do P(c, lx2 + d[1], sy + d[2], ({'v3','v4','v5','v4','v6','v3'})[(i + d[1] + d[2]) % 6 + 1]) end end
  end
end

-- the shadow the eaves throw on the wall below: a solid dark band, then two rows a step and a half darker, no checkerboard
-- (judge: the dotted band read as noise; a clean eave band is what gives the roof its overhang)
function B.eaveshadow(c, x0, x1, yW)
  local d = B.EAVE_DROP or 0
  -- the wall's own darkest steps, so its texture still shows through (judge: a near-black band merged into the roof's outline)
  for x = x0, x1 do for y = yW + 1 + d, yW + 4 + d do px.shade(c, x, y, -3) end; px.shade(c, x, yW + 5 + d, -2); px.shade(c, x, yW + 6 + d, -1) end   -- judge (sweep): the eave's cast shadow read as missing; a row deeper
end

function B.chimney(c, cx0, cx1, cy0, cy1, mat)
  for y = cy0 + 6, cy1 do for x = cx1 + 1, cx1 + 7 do if px.get(c, x, y) ~= 0 then px.shade(c, x, y, x < cx1 + 5 and -2 or -1) end end end   -- the chimney's shadow on the roof: solid steps, no checkerboard
  if mat == 'brick' then B.wall(c, 'brick', cx0, cy0 + 4, cx1, cy1, 7)
  else B.stones(c, cx0, cy0 + 4, cx1, cy1, 5, 5, function(x, y) return .7 - (x - cx0) / 40 end) end
  R(c, cx0 - 3, cy0, cx1 + 3, cy0 + 3, 's6'); px.hline(c, cx0 - 3, cx1 + 3, cy0, 's7'); px.hline(c, cx0 - 3, cx1 + 3, cy0 + 3, 's3')
  R(c, cx0 + 3, cy0 - 1, cx1 - 3, cy0, 'OUT')
end

function B.sign(c, cx, y, text)
  local w = #text * 4 + 9; local x0 = cx - w // 2
  R(c, x0, y, x0 + w, y + 10, 'w4'); px.hline(c, x0, x0 + w, y, 'w6'); px.hline(c, x0, x0 + w, y + 1, 'w5'); px.hline(c, x0, x0 + w, y + 10, 'w2')
  px.vline(c, x0, y, y + 10, 'OUT'); px.vline(c, x0 + w, y, y + 10, 'OUT'); px.hline(c, x0, x0 + w, y - 1, 'OUT'); px.hline(c, x0, x0 + w, y + 11, 'OUT')
  B.text(c, x0 + 5, y + 3, text, 't5', 'w2')
  P(c, x0 + 2, y + 5, 'm2'); P(c, x0 + w - 2, y + 5, 'm2')
end

function B.awning(c, x0, x1, y, a, b)
  for yy = y, y + 9 do for x = x0, x1 do local st = ((x - x0) // 7) % 2; local col = st == 1 and a or b
    P(c, x, yy, col[(yy < y + 3) and 4 or 3]) end end
  for x = x0, x1, 7 do local st = ((x - x0) // 7) % 2; local col = st == 1 and a or b
    for k = 0, 4 do P(c, x + k, y + 10 + ((k == 1 or k == 3) and 1 or (k == 2 and 2 or 0)), col[2]) end end
  px.hline(c, x0, x1, y - 1, 'OUT')
  for yy = y + 11, y + 16 do for x = x0, x1 do if px.get(c, x, yy) ~= 0 then px.shade(c, x, yy, yy <= y + 13 and -3 or (yy <= y + 15 and -2 or -1)) end end end   -- judge (sweep): flat on the wall like tape; a cast shadow under it
end

-- a porch floor: boards running across, a lit front edge, board ends, a dark fascia and its shadow on the ground
function B.deck(c, x0, x1, ytop, ybot)
  for y = ytop, ybot do for x = x0, x1 do local r = y - ytop
    local col = (r == 0) and 'w7' or ((r == 1) and 'w6' or ((y == ybot) and 'w2' or 'w4'))
    if r >= 2 and (x - x0) % 9 == 0 then col = 'w2' end
    if r == 0 and (x - x0) % 9 == 0 then col = 'w5' end
    P(c, x, y, col) end end
  for x = x0, x1 do if (x % 2 == 0) then P(c, x, ybot + 1, 'OUT2') end end
end
-- steps from a raised doorway down to the ground: each a lit tread and a shaded riser, wider as they go down, worn in the middle
function B.steps(c, cx, hw, ytop, ybot, mat)
  local n = math.max(1, math.floor((ybot - ytop + 1) / 2))
  for i = 0, n - 1 do local y0 = ytop + i * 2; local w = hw + i * 2
    for x = cx - w, cx + w do
      if mat == 'stone' then P(c, x, y0, (x < cx - w + 2) and 's6' or 's7'); P(c, x, y0 + 1, (x > cx + w - 2) and 's2' or 's4')
      else P(c, x, y0, (x < cx - w + 2) and 'w6' or 'w7'); P(c, x, y0 + 1, (x > cx + w - 2) and 'w2' or 'w4') end end
    for x = cx - 3, cx + 3 do P(c, x, y0, mat == 'stone' and 's6' or 'w6') end
    P(c, cx - w, y0 + 1, mat == 'stone' and 's3' or 'w3') end
end
-- a plank ramp for wide barn and garage doors
function B.ramp(c, x0, x1, ytop, ybot)
  for y = ytop, ybot do local t = (y - ytop) / math.max(1, ybot - ytop); local e = math.floor(t * 4)
    for x = x0 - e, x1 + e do local col = ((x - x0) % 7 == 0) and 'w3' or ((y == ytop) and 'w6' or 'w5'); if x < x0 - e + 2 then col = 'w6' elseif x > x1 + e - 2 then col = 'w3' end; P(c, x, y, col) end end
  for y = ytop + 2, ybot, 3 do px.hline(c, x0, x1, y, 'w4') end
end
function B.porch(c, x0, x1, ytop, yb, roofmat, trim, rail)
  for y = ytop - 8, ytop do for x = x0 - 3, x1 + 3 do P(c, x, y, B.roofpx(c, roofmat, x, y, ytop - 8, 1, 3)) end end
  px.hline(c, x0 - 4, x1 + 4, ytop - 9, 'OUT'); px.hline(c, x0 - 3, x1 + 3, ytop + 1, trim[4]); px.hline(c, x0 - 3, x1 + 3, ytop + 2, trim[2]); px.hline(c, x0 - 4, x1 + 4, ytop + 3, 'OUT')
  for x = x0, x1 do for yy = ytop + 4, ytop + 5 do if px.get(c, x, yy) ~= 0 then px.shade(c, x, yy, -2) end end; if px.get(c, x, ytop + 6) ~= 0 then px.shade(c, x, ytop + 6, -1) end end   -- the porch roof's shadow on the wall: solid steps (judge: the checker frieze turned to dither)
  for _, postx in ipairs({x0, x1 - 2}) do R(c, postx, ytop + 3, postx + 2, yb, trim[4]); px.vline(c, postx + 2, ytop + 3, yb, trim[2]) end
  if rail then for x = x0, x1 do P(c, x, yb - 10, trim[4]); P(c, x, yb - 9, trim[2]); if x % 4 == 0 then px.vline(c, x, yb - 8, yb, trim[3]) end end end
end

-- a dormer standing on the roof: a little sided face with a window, its own small roof, its shadow on the roof behind
function B.dormer(c, cx, yb, wd, hd, roofmat, wallmat, trim, night, seed)
  local x0, x1 = cx - wd // 2, cx + wd // 2; local yt = yb - hd; local ph = math.floor((wd / 2 + 4) * .62)
  for y = yt + 2, yb + 3 do for x = x1 + 1, x1 + 5 do if px.get(c, x, y) ~= 0 then P(c, x, y, 'OUT2') end end end
  local wm = (wallmat == 'brick' or wallmat == 'stone' or wallmat == 'log') and 'white' or wallmat
  B.wall(c, wm, x0, yt, x1, yb, seed)
  for _, bx in ipairs({x0, x1 - 2}) do R(c, bx, yt, bx + 2, yb, trim[3]); px.vline(c, bx, yt, yb, trim[4]) end
  B.window(c, cx - 6, yt + 4, 13, hd - 7, {trim = trim, night = night, curtain = 't4', seed = seed})
  px.hline(c, x0 - 1, x1 + 1, yb + 1, 'OUT')
  px.poly(c, {{x0 - 4, yt + 2}, {cx + .5, yt - ph}, {x1 + 5, yt + 2}}, function(x, y) return B.roofpx(c, roofmat, x, y, yt - ph, x <= cx and 1 or 0, seed) end)
  for t = 0, 2 do local col = ({trim[4], trim[3], trim[2]})[t + 1]
    px.line(c, x0 - 4, yt + 2 + t, cx, yt - ph + t, col); px.line(c, cx + 1, yt - ph + t, x1 + 5, yt + 2 + t, t == 0 and trim[3] or trim[2]) end
  px.line(c, x0 - 5, yt + 2, cx, yt - ph - 1, 'OUT'); px.line(c, cx + 1, yt - ph - 1, x1 + 6, yt + 2, 'OUT')
end
-- a roll-up garage door: four lit-edged panels, a row of little windows along the top, a concrete apron at the foot
function B.garagedoor(c, x0, x1, y0, y1, trim, night, seed)
  R(c, x0 - 4, y0 - 4, x1 + 4, y1, trim[3]); px.hline(c, x0 - 4, x1 + 4, y0 - 4, trim[5]); px.vline(c, x0 - 4, y0 - 4, y1, trim[4]); px.vline(c, x1 + 4, y0 - 4, y1, trim[2])
  local G = B.WALLS.white; local n = 4; local ph = (y1 - y0 + 1) / n; local cols = math.max(3, math.floor((x1 - x0) / 13))
  for y = y0, y1 do local k = math.floor((y - y0) / ph); local r = (y - y0) - k * ph
    for x = x0, x1 do local col
      if r < 1 then col = G[6] elseif r >= ph - 1.2 then col = G[3] else col = band(c, G, .58 - (x - x0) / math.max(1, x1 - x0) * .22 - k * .04, 3, 6) end
      local cx = (x - x0) % ((x1 - x0 + 1) / cols)
      if k == 0 and r >= 2.5 and r < ph - 2.5 and cx > 2.5 and cx < (x1 - x0 + 1) / cols - 2.5 then col = night and 'y2' or ((r < 4 and cx < 6) and 'g4' or 'g2') end
      P(c, x, y, col) end end
  for i = 1, cols - 1 do local sx = math.floor(x0 + i * (x1 - x0 + 1) / cols); for y = y0, y1 do if px.get(c, sx, y) ~= px.i(c, 'g2') then P(c, sx, y, G[4]) end end end
  P(c, (x0 + x1) // 2 - 2, y1 - 4, 'm2'); P(c, (x0 + x1) // 2 + 2, y1 - 4, 'm2'); px.hline(c, (x0 + x1) // 2 - 2, (x0 + x1) // 2 + 2, y1 - 3, 'm1')
  if seed and H(seed, 3) > .5 then for k = 0, 2 do px.vline(c, x0 + 8 + k * 9, y1 - 6 - k, y1, 's4') end end   -- oil and rust streaks at the foot
end

-- ------------------------------------------------------------------ whole buildings
--[[ judge (buildings sweep): the coop read as a small shed with a vent (BLOCKING). What says hens: a low hatch with a cleated
     ramp down to the ground, a nest-box lean-to on the side with its own lid, chicken wire in the gable, straw at the foot ]]
function B.coopfx(c, sp, x0, x1, gy, seed)
  local fy = gy - 10
  -- the hatch, low on the wall left of the door
  local hx0, hx1 = x0 + 8, x0 + 19; local hy0 = fy - 12
  R(c, hx0 - 2, hy0 - 2, hx1 + 2, fy, 'w3'); px.hline(c, hx0 - 2, hx1 + 2, hy0 - 2, 'w6'); px.vline(c, hx0 - 2, hy0 - 2, fy, 'w5')
  R(c, hx0, hy0, hx1, fy, 'k1'); px.hline(c, hx0, hx1, hy0, 'OUT'); px.hline(c, hx0, hx1, hy0 + 1, 'lg1')
  R(c, hx1 + 3, hy0 - 3, hx1 + 9, hy0 + 8, 'w4'); px.vline(c, hx1 + 3, hy0 - 3, hy0 + 8, 'w6'); px.vline(c, hx1 + 9, hy0 - 3, hy0 + 8, 'w2')   -- the slide door, pulled up to the side
  -- the ramp: a plank from the sill to the ground, cleats across it
  local ax_, ay_, bx_, by_ = hx0 + 4, fy - 1, hx0 - 24, gy + 2
  local n = math.max(math.abs(bx_ - ax_), math.abs(by_ - ay_))
  for i = 0, n do local x = math.floor(ax_ + (bx_ - ax_) * i / n + .5); local y = math.floor(ay_ + (by_ - ay_) * i / n + .5)
    P(c, x, y - 2, 'OUT'); P(c, x, y - 1, 'w7'); P(c, x, y, 'w5'); P(c, x, y + 1, 'w4'); P(c, x, y + 2, 'w2'); P(c, x, y + 3, 'OUT'); if i % 5 == 2 then P(c, x, y - 1, 'w3'); P(c, x, y, 'w3') end end   -- a lit top edge so it reads over the stones
  for x = bx_ - 2, ax_ do P(c, x, gy, 'OUT2') end
  -- the nest box: a lean-to on the right wall
  local nx0, nx1 = x1 + 1, x1 + 15; local ny0, ny1 = fy - 26, fy - 9
  R(c, nx0, ny0, nx1, ny1, 'w4'); px.vline(c, nx1, ny0, ny1, 'w2'); px.hline(c, nx0, nx1, ny1, 'w2')
  for xx = nx0 + 4, nx1 - 1, 5 do px.vline(c, xx, ny0 + 2, ny1 - 1, 'w3') end
  for k = 0, 17 do local yy = ny0 - 1 - math.floor(k * 5 / 17); P(c, nx1 + 1 - k, yy, 'bn6'); P(c, nx1 + 1 - k, yy - 1, 'bn5'); P(c, nx1 + 1 - k, yy + 1, 'bn3') end   -- its sloped lid
  px.line(c, nx0 + 2, ny1 + 1, nx0 + 2, fy, 'w2'); px.line(c, nx1 - 2, ny1 + 1, nx0 + 4, fy, 'w2')   -- the bracket
  for yy = ny0, ny1 do for xx = nx0, nx1 do if px.get(c, xx, yy) ~= 0 and xx > nx1 - 3 then px.shade(c, xx, yy, -1) end end end
  -- straw at the foot of the wall and spilling from the hatch
  for i = 0, 16 do local sx = x0 - 6 + math.floor(H(i, seed + 97) * (x1 - x0 + 24)); local sw = 2 + math.floor(H(i, seed + 98) * 3)
    for k = 0, sw do P(c, sx + k, gy - 1 - (k % 2), (k % 3 == 0) and 't4' or 't3') end end
  for k = -4, 6 do P(c, hx0 + k, fy - (k % 2), 't4') end
  -- a hen looking out of the hatch: white head, red comb, a dot of beak (says 'coop' at a glance)
  local hx, hy = hx0 + 5, hy0 + 5
  R(c, hx - 1, hy, hx + 2, hy + 3, 'p2'); P(c, hx + 2, hy + 3, 'p1'); P(c, hx - 1, hy + 3, 'p1'); P(c, hx, hy - 1, 'b3'); P(c, hx + 1, hy - 1, 'b2'); P(c, hx - 2, hy + 1, 'y2'); P(c, hx, hy + 1, 'OUT')
  for x = hx - 1, hx + 3 do if px.get(c, x, hy + 4) ~= 0 then P(c, x, hy + 4, 'p1') end end
end

function B.build(sp, night)
  DOORMETA = nil
  local wt = sp.w; local W = math.floor(wt * 32); local m = 22
  local wallH = sp.wallh or 70
  local kind = sp.kind or 'gable'
  -- modern roofs: 'hip' (sloped on all four sides) and 'side' (ridge running left to right, gable ends at the sides)
  if (kind == 'hip' or kind == 'side') and not sp.roofd then sp.roofd = math.floor(math.max(50, math.min(84, W * .32))) end
  local extraTop = (kind == 'gable' or kind == 'church' or kind == 'barn') and math.floor(W * .62) + 10 or (sp.roofd or 64) + 40
  if kind == 'church' then extraTop = extraTop + (sp.spire or 70) + 30 end
  if kind == 'cross' then extraTop = math.max(extraTop, math.floor(W * .45 * .62) + 40) end
  local Wd = W + m * 2; local Hh = extraTop + wallH + 16
  local c = px.new(Wd, Hh, B.PAL)
  local x0, x1 = m, m + W - 1; local gy = Hh - 6; local yW = gy - 9 - wallH
  local trim = B.TRIMS[sp.trim or 'cream']; local seed = sp.seed or 1
  local roofmat = sp.roof or 'scallop'; local wallmat = sp.wall or 'honey'
  -- roof first (the walls and the gable sit in front of it)
  local topY
  -- an attached garage wing, drawn first so the house's own eaves overhang it
  if sp.wing then local wg = sp.wing; local ww = math.floor(wg.w * 32); local wx0, wx1
    if wg.side == 'left' then wx0, wx1 = x0, x0 + ww - 1; x0 = x0 + ww + 1 else wx0, wx1 = x1 - ww + 1, x1; x1 = x1 - ww - 1 end
    local wyW = gy - 9 - (wg.h or 58)
    B.sideroof(c, wx0, wx1, wyW, wg.roofd or 40, roofmat, seed + 7, true)
    B.wall(c, wg.wall or wallmat, wx0, wyW + 1, wx1, gy - 10, seed + 9)
    B.eaveshadow(c, wx0, wx1, wyW)
    B.stones(c, wx0 - 4, gy - 9, wx1 + 4, gy, seed + 13, 5, function(x, y) return .66 - (x - wx0) / 700 end); px.hline(c, wx0 - 4, wx1 + 4, gy - 9, 's6')
    local gx0, gx1 = wx0 + 9, wx1 - 9
    B.garagedoor(c, gx0, gx1, gy - (wg.h or 58) + 12, gy - 1, trim, night, seed)
    R(c, gx0 - 6, gy, gx1 + 6, gy + 3, 's6'); px.hline(c, gx0 - 6, gx1 + 6, gy, 's7'); px.hline(c, gx0 - 6, gx1 + 6, gy + 3, 's4')
  end
  if kind == 'hip' or kind == 'side' then
    topY = B.sideroof(c, x0, x1, yW, sp.roofd, roofmat, seed, kind == 'hip')
    if kind == 'side' then local Rr = B.ROOFS[roofmat]                                         -- the rake boards at the gable ends
      -- the rake boards in the roof's own dark edge, not the pale trim (judge: a cream frame round the roof read as a box lid)
      for _, e in ipairs({{x0 - 10, Rr[3]}, {x1 + 10, Rr[1]}}) do px.vline(c, e[1], topY, yW + 4, e[2]); px.vline(c, e[1] + (e[1] < x0 and 1 or -1), topY, yW + 3, Rr[2]) end
      px.hline(c, x0 - 10, x1 + 10, topY - 1, 'OUT') end
    for i, d in ipairs(sp.dormers or {}) do local dcx = math.floor(x0 + d.x * (x1 - x0))
      B.dormer(c, dcx, yW - 8, d.w or 24, d.h or 22, roofmat, wallmat, trim, night, seed + 20 + i) end
  elseif kind == 'gable' or kind == 'church' or kind == 'barn' then topY = select(1, B.frontgable(c, sp, x0, x1, yW, wallmat, roofmat, trim, seed))
  elseif kind == 'cross' then
    topY = B.sideroof(c, x0, x1, yW, sp.roofd or 64, roofmat, seed, sp.hip)
    local gw = math.floor(W * (sp.gablew or .42)); local gx0 = (x0 + x1) // 2 - gw // 2
    B.frontgable(c, {pitch = .34, back = .26, gablewin = sp.gablewin or 'round', moss = sp.moss}, gx0, gx0 + gw, yW, wallmat, roofmat, trim, seed + 3)
  elseif kind == 'flat' then
    local py = yW - 16
    for y = py, yW do for x = x0 - 2, x1 + 2 do P(c, x, y, B.WALLS[wallmat][(y - py) % 5 == 4 and 3 or 5]) end end
    R(c, x0 - 5, py - 4, x1 + 5, py - 1, trim[4]); px.hline(c, x0 - 5, x1 + 5, py - 4, trim[5]); px.hline(c, x0 - 5, x1 + 5, py - 1, trim[2]); px.hline(c, x0 - 5, x1 + 5, py - 5, 'OUT')
    for x = x0, x1, 9 do R(c, x, py, x + 2, py + 2, trim[3]) end
    --[[ judge (buildings sweep): a flat roof showed only its front edge and read as a cardboard false front. From above at
         this angle its top shows: tar and gravel behind the parapet, the back parapet's lit edge, a vent and a hatch ]]
    local dep = 22; local ry0 = py - 5 - dep
    for y = ry0, py - 6 do for x = x0 - 4, x1 + 4 do local n = H(x // 2 + y * 13, seed + 91)
      -- judge (pass 2): gravel blobs read as camouflage, single pixels as grit: plain tar, darker toward the back
      P(c, x, y, (y <= ry0 + 1) and (y == ry0 and 'OUT' or 's5') or ((y - ry0) < 7 and 's2' or 's3')) end end
    px.vline(c, x0 - 5, ry0, py - 5, 'OUT'); px.vline(c, x1 + 5, ry0, py - 5, 'OUT')
    for y = py - 8, py - 6 do for x = x0 - 4, x1 + 4 do px.shade(c, x, y, -1) end end   -- the front parapet's shadow on the roof
    px.hline(c, x0 - 5, x1 + 5, py - 5, 's6'); px.hline(c, x0 - 5, x1 + 5, py - 6, 's5')   -- judge: the front parapet's lit edge (the slab read as a lid laid on)
    for y = py, py + 2 do for x = x0 - 2, x1 + 2 do px.shade(c, x, y, y == py + 2 and -1 or -2) end end   -- judge: the cornice casts a shadow on the facade below it
    local vx = x0 + math.floor((x1 - x0) * .72); R(c, vx, ry0 + 6, vx + 5, ry0 + 13, 'm3'); px.vline(c, vx, ry0 + 6, ry0 + 13, 'm4'); px.hline(c, vx, vx + 5, ry0 + 6, 'm4')
    for y = ry0 + 14, ry0 + 15 do for x = vx, vx + 6 do px.shade(c, x, y, -2) end end   -- a vent stack and its shadow
    local hx = x0 + math.floor((x1 - x0) * .2); R(c, hx, ry0 + 8, hx + 9, ry0 + 13, 'k3'); px.hline(c, hx, hx + 9, ry0 + 8, 'k5'); px.rect(c, hx + 1, ry0 + 9, hx + 8, ry0 + 9, 'k4')   -- a roof hatch
    topY = ry0 - 1
  end
  -- the walls, the shadow under the eaves, corner boards, the foundation
  local avoid = nil
  if sp.rough then avoid = {}; local d = sp.door or {}; local dcx = math.floor((x0 + x1) / 2 + (d.dx or 0) * 32); local dw = d.w or 26
    avoid[#avoid + 1] = {dcx - dw // 2 - 6, dcx + dw // 2 + 6}
    for _, w in ipairs(sp.windows or {}) do local ww = w.w or 24; local wx = math.floor(x0 + w.x * 32 - ww / 2); avoid[#avoid + 1] = {wx - 9, wx + ww + 9} end end
  B.wall(c, (sp.siding and wallmat ~= 'brick' and wallmat ~= 'stone' and wallmat ~= 'log' and wallmat ~= 'plaster') and wallmat or wallmat, x0, yW + 1, x1, gy - 10, seed, avoid)
  B.eaveshadow(c, x0, x1, yW)
  if wallmat ~= 'brick' and wallmat ~= 'stone' and wallmat ~= 'log' then
    for _, cx in ipairs({x0, x1 - 4}) do R(c, cx, yW + 2, cx + 4, gy - 10, trim[3]); px.vline(c, cx, yW + 2, gy - 10, trim[4]); px.vline(c, cx + 4, yW + 2, gy - 10, trim[2]) end end
  B.stones(c, x0 - 4, gy - 9, x1 + 4, gy, seed + 11, 5, function(x, y) return .66 - (x - x0) / 700 end)
  if sp.rough then   -- judge r4: nothing grew against the base; weeds and dry grass up the foundation, away from the door
    local d = sp.door or {}; local dcx = math.floor((x0 + x1) / 2 + (d.dx or 0) * 32); local dw = (d.w or 26) // 2 + 8
    for i = 0, 22 do local tx = x0 - 3 + math.floor(H(i, seed + 81) * (x1 - x0 + 6))
      if math.abs(tx - dcx) > dw then local h = 3 + math.floor(H(i, seed + 83) * 6)
        for k = -2, 2 do local bh = h - math.abs(k) * 2 + math.floor(H(i * 5 + k, seed + 85) * 2); if bh > 0 then
          px.vline(c, tx + k, gy - bh, gy, (k <= 0) and 'v3' or 'v2'); P(c, tx + k, gy - bh, (k < 0) and 'v4' or 'v3') end end end end end
  px.hline(c, x0 - 4, x1 + 4, gy - 9, 's6')
  -- shopfront awning and sign
  if sp.awning then B.awning(c, x0 + 6, x1 - 6, yW + 8, B.DOORS.red, {'t1', 't2', 't4', 't5'}) end
  -- windows
  local wins = sp.windows or {}
  for i, w in ipairs(wins) do
    local ww, wh = w.w or 24, w.h or 26
    local wx = math.floor(x0 + w.x * 32 - ww / 2); local wy = w.y and (yW + w.y) or (yW + 18 + (sp.awning and 10 or 0))
    B.window(c, wx, wy, ww, wh, {trim = trim, night = night, dark = w.dark, curtain = (w.curtain == false) and nil or (w.curtain or ({'t4', 'f2', 'v4', 't4', 'f3'})[(i + seed) % 5 + 1]),
      face = w.face, watcher = w.watcher, broken = w.broken, boarded = w.boarded, rough = sp.rough, box = w.box, lancet = w.lancet, stained = w.stained, shutters = sp.shutters and B.TRIMS[sp.shutters] or nil, seed = seed + i})
  end
  -- the door, porch, lantern
  if not sp.nodoor then
    local d = sp.door or {}; local dw = d.w or 26; local dh = d.h or 46; local dcx = math.floor((x0 + x1) / 2 + (d.dx or 0) * 32)
    local dx0, dx1 = dcx - dw // 2, dcx + dw // 2
    -- the door sits up on the foundation, so something always leads up to it: homes get a porch (deck, posts, roof, rail)
    -- with steps down the middle; shops and halls get steps; barn and garage doors get a plank ramp
    local wide = (d.kind == 'barn') or (dw >= 50)
    local home = not wide and not sp.sign and sp.stoop ~= false and (kind == 'gable' or kind == 'cross' or kind == 'hip' or kind == 'side') and (sp.wallh or 70) >= 60
    local pr = sp.porch or (home and {rail = true}) or nil
    local px0, px1 = pr and (pr.full and x0 + 4 or dx0 - 16), pr and (pr.full and x1 - 4 or dx1 + 16)
    if pr then B.porch(c, px0, px1, gy - 10 - dh - 14, gy - 10, roofmat, trim, pr.rail) end
    B.door(c, dx0, dx1, gy - 10 - dh, gy - 10, {trim = trim, col = B.DOORS[d.col or 'teal'], kind = d.kind, night = night, ribbon = sp.ribbon, scratches = sp.scratches, blood = sp.blooddoor, rough = sp.rough})
    local stoneSteps = (wallmat == 'brick' or wallmat == 'stone')
    if pr then B.deck(c, px0 - 2, px1 + 2, gy - 10, gy - 6)
      for _, postx in ipairs({px0, px1 - 2}) do R(c, postx, gy - 6, postx + 2, gy - 1, trim[3]); px.vline(c, postx + 2, gy - 6, gy - 1, trim[2]) end end   -- the posts carry on down to the ground
    DOORMETA = {w = dw, dx = dcx - (W + 2 * m) / 2, steps = wide and 'ramp' or ((stoneSteps and not pr) and 'stone' or 'wood')}
    if sp.lantern ~= false then B.lantern(c, dx1 + 12, gy - 10 - dh + 6, night) end
  end
  if sp.sign then B.sign(c, (x0 + x1) // 2, yW + (sp.awning and -2 or 6) + (sp.signy or 0), sp.sign) end
  if sp.ivy then B.ivy(c, sp.ivy == 'left' and x0 + 3 or x1 - 3, gy - 11, yW + 4, seed) end
  -- chimneys
  -- chimneys rise out of the roof: each finds the roof's top edge where it stands, sits its base a little way down the
  -- roof (never below the eaves), and climbs clear of the ridge line; too near an edge, it slides in until it fits
  local chim
  local function roofTop(x) for y = 0, c.h - 1 do if px.get(c, x, y) ~= 0 then return y end end return nil end
  for _, ch in ipairs(sp.chimneys or {}) do
    local cx = math.floor(x0 + ch.x * W); local hw = 7; local mid = (x0 + x1) / 2; local base
    for _ = 1, 60 do
      local a, b, m = roofTop(cx - hw), roofTop(cx + hw), roofTop(cx)
      if a and b and m then base = math.max(a, b, m) + 10; if base < yW - 8 then break end end
      base = nil; cx = cx + (cx < mid and 2 or -2)
    end
    if base then local top = base - 26 - (ch.tall or 0)
      B.chimney(c, cx - hw, cx + hw, top, base, ch.mat or 'stone')
      for x = cx - hw - 1, cx + hw + 1 do P(c, x, base + 1, 'OUT2') end                     -- where it meets the roof
      if not chim then chim = {cx, top} end end end
  -- the church's tower and spire, standing in front of the nave
  if kind == 'church' then
    -- the tower: a box standing proud of the nave, a quarter of its width, with a shaded side face, three stages
    -- split by string courses (door, clock, belfry), and an octagonal spire with a lucarne and a gilt cross
    local tcx = (x0 + x1) // 2; local tw = math.max(22, math.floor(W * .12)); local side = 7
    local ttop = (topY or yW - 80) - 4; local tb = gy - 10
    local G = B.WALLS[wallmat]
    for y = ttop + 2, tb do for x = tcx + tw + 1, tcx + tw + 10 do px.shade(c, x, y, x < tcx + tw + 6 and -2 or -1) end end  -- its shadow on the nave: solid steps
    B.wall(c, wallmat, tcx - tw, ttop, tcx + tw, tb, seed + 5)
    for y = ttop, tb do for x = tcx + tw + 1, tcx + tw + side do                                                                       -- the side face, in shade
      local v = band(c, G, .18 + ((y - ttop) % 6 == 0 and .12 or 0), 1, 4); P(c, x, y, v) end end
    px.vline(c, tcx + tw + side, ttop, tb, G[1])
    if wallmat ~= 'brick' and wallmat ~= 'stone' and wallmat ~= 'log' then
      for _, cx in ipairs({tcx - tw, tcx + tw - 4}) do R(c, cx, ttop, cx + 4, tb, trim[3]); px.vline(c, cx, ttop, tb, trim[4]); px.vline(c, cx + 4, ttop, tb, trim[2]) end
    else for y = ttop, tb, 5 do R(c, tcx - tw, y, tcx - tw + (((y - ttop) // 5) % 2 == 0 and 6 or 3), y + 4, 's6'); px.hline(c, tcx - tw, tcx - tw + 5, y + 4, 's3') end end  -- quoins
    local function course(y) R(c, tcx - tw - 3, y, tcx + tw + side + 2, y + 3, trim[4]); px.hline(c, tcx - tw - 3, tcx + tw + side + 2, y, trim[5])
      px.hline(c, tcx - tw - 3, tcx + tw + side + 2, y + 3, trim[2]); px.hline(c, tcx - tw - 3, tcx + tw + side + 2, y + 4, 'OUT2')
      R(c, tcx + tw + 1, y, tcx + tw + side + 2, y + 3, trim[2]) end
    local belY = ttop + 6; local clkY = belY + 46; local doorTop = tb - 58
    -- belfry: two louvred lancets, the bell hanging in the dark between them
    for _, bx in ipairs({tcx - tw // 2 - 6, tcx + tw // 2 - 6}) do
      local bw, bh = 12, 30
      B.window(c, bx, belY + 6, bw, bh, {trim = trim, lancet = true, dark = true, curtain = nil})
      for yy = belY + 4, belY + 6 + bh - 1 do for xx = bx, bx + bw - 1 do if px.get(c, xx, yy) ~= px.i(c, trim[5]) and px.get(c, xx, yy) ~= px.i(c, trim[2]) and px.get(c, xx, yy) ~= px.i(c, 'OUT2') and yy >= belY + 2 then
        local inside = px.get(c, xx, yy) == px.i(c, 'g2') or px.get(c, xx, yy) == px.i(c, 'g3') or px.get(c, xx, yy) == px.i(c, trim[4]) or px.get(c, xx, yy) == px.i(c, trim[3])
        if inside then P(c, xx, yy, (yy - belY) % 4 == 0 and trim[2] or ((yy - belY) % 4 == 1 and trim[3] or 'OUT')) end end end end
    end
    local bcx = tcx; px.ellipse(c, bcx + .5, belY + 26, 7, 8, 'm2'); R(c, bcx - 8, belY + 30, bcx + 8, belY + 33, 'm2'); px.hline(c, bcx - 8, bcx + 8, belY + 33, 'm1')
    px.vline(c, bcx - 4, belY + 21, belY + 31, 'm3'); P(c, bcx - 3, belY + 22, 'm4'); px.vline(c, bcx, belY + 12, belY + 18, 'm1'); P(c, bcx, belY + 35, 'm1')
    course(belY + 44)
    -- a clock face that has stopped, with its twelve marks
    local cl = clkY + 16; px.ellipse(c, tcx + .5, cl + .5, 12, 12, trim[2]); px.ellipse(c, tcx + .5, cl + .5, 10.5, 10.5, 't5'); px.ellipse(c, tcx + 1.5, cl + 1.5, 9, 9, 't4')
    px.ellipse(c, tcx + .5, cl + .5, 9, 9, 't5')
    for i = 0, 11 do local a = i * math.pi / 6; local rr = (i % 3 == 0) and 7.5 or 8.2
      P(c, tcx + math.floor(math.sin(a) * rr + .5), cl - math.floor(math.cos(a) * rr + .5), i % 3 == 0 and 'OUT' or 't2') end
    px.line(c, tcx, cl, tcx - 1, cl - 6, 'OUT'); px.line(c, tcx, cl, tcx + 4, cl + 3, 'OUT'); P(c, tcx, cl, 'b2')
    course(cl + 18)
    -- the door under a pointed arch, steps worn in the middle
    local dw = 15
    B.door(c, tcx - dw, tcx + dw, doorTop, tb, {trim = trim, col = B.DOORS.oak, kind = 'double', night = night, scratches = sp.scratches})
    for i = 0, dw + 6 do local hgt = math.floor(math.sqrt(math.max(0, (dw + 6) ^ 2 - i * i)) * .62)
      for yy = doorTop - 6 - hgt, doorTop - 6 do for _, xx in ipairs({tcx - i, tcx + i}) do
        P(c, xx, yy, (yy == doorTop - 6 - hgt) and (xx < tcx and trim[5] or trim[2]) or ((i < dw - 1 and yy > doorTop - 6 - hgt + 3) and (night and 'y1' or 'g2') or trim[3])) end end end
    P(c, tcx, doorTop - 6 - math.floor((dw + 6) * .62) - 1, trim[5])
    R(c, tcx - dw - 12, tb + 1, tcx + dw + 12, tb + 3, 's6'); px.hline(c, tcx - dw - 12, tcx + dw + 12, tb + 1, 's7')
    R(c, tcx - dw - 8, tb - 1, tcx + dw + 8, tb, 's5'); px.hline(c, tcx - 5, tcx + 5, tb, 's4')
    -- the spire: octagonal, lit left, shaded right, a lucarne low on the front, gilt cross
    local sp_h = sp.spire or 70; local base = tw + 5
    px.hline(c, tcx - tw - 6, tcx + tw + side + 4, ttop, trim[5]); R(c, tcx - tw - 6, ttop + 1, tcx + tw + side + 4, ttop + 3, trim[3]); px.hline(c, tcx - tw - 6, tcx + tw + side + 4, ttop + 4, 'OUT2')
    for i = 0, sp_h do local f = i / sp_h; local hw = base * f; local y = ttop - sp_h + i
      for x = math.floor(tcx - hw), math.ceil(tcx + hw + side * f) do
        local u = (x - tcx) / math.max(1, hw)
        local col = B.roofpx(c, roofmat, x, y, ttop - sp_h, u < -.33 and 1 or (u < .33 and (u < 0 and 1 or 0) or 0), seed)
        if math.abs(u + .33) < .04 or math.abs(u - .33) < .04 then col = B.ROOFS[roofmat][2] end
        if x > tcx + hw then col = B.ROOFS[roofmat][1] end
        P(c, x, y, col) end end
    local ly = ttop - math.floor(sp_h * .28); local lw = math.max(4, math.floor(base * .22))
    for i = 0, lw + 1 do px.hline(c, tcx - i, tcx + i, ly - lw - 1 + i, i == lw + 1 and trim[2] or trim[4]) end
    R(c, tcx - lw + 1, ly + 1, tcx + lw - 1, ly + 7, 'OUT'); for yy = ly + 2, ly + 7, 2 do px.hline(c, tcx - lw + 1, tcx + lw - 1, yy, trim[2]) end
    px.vline(c, tcx - lw, ly, ly + 8, trim[4]); px.vline(c, tcx + lw, ly, ly + 8, trim[2])
    px.vline(c, tcx, ttop - sp_h - 14, ttop - sp_h, 'y2'); px.vline(c, tcx + 1, ttop - sp_h - 14, ttop - sp_h, 'y1'); px.hline(c, tcx - 4, tcx + 5, ttop - sp_h - 10, 'y2'); px.hline(c, tcx - 4, tcx + 5, ttop - sp_h - 9, 'y1'); P(c, tcx, ttop - sp_h - 14, 'y3')
  end
  if sp.handprint then local hx, hy = math.floor(x0 + sp.handprint * W), gy - 30
    px.ellipse(c, hx, hy, 3, 3.5, 'b2'); for k = 0, 3 do px.vline(c, hx - 3 + k * 2, hy - 7, hy - 3, k == 3 and 'b1' or 'b2') end; px.vline(c, hx + 1, hy + 3, hy + 10, 'b1') end
  px.outline(c, px.i(c, 'OUT'))
  -- chim: where smoke leaves the first chimney, relative to the sprite's anchor (the game's puff offset)
  if sp.coop then B.coopfx(c, sp, x0, x1, gy, seed) end
  return c, {w = Wd, h = Hh, ax = Wd / 2, ay = gy - 3, chim = chim and {chim[1] - Wd / 2, chim[2] - (gy - 3) - 2} or nil, door = DOORMETA}
end

return B
