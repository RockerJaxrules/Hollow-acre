# Hollow Acre: world design guide

This is the rulebook for the map remake, every building and object redraw, and the inspector's checklist.
It comes from research into Stardew-like map design (sources at the bottom) plus every tip given during the project.
If something in the game breaks a rule here, the inspector should flag it.

## 1. Scale and camera
- One world unit is one tile: 32 px (`PPM=32`). The camera shows about 15 by 10 tiles on a phone and about 16 by 10 on a PC.
- People are about 1.3 tiles tall. A doorway is 1 tile wide. A cottage front is 3 to 4 tiles wide, and a shop front 5 to 7.
- One perspective everywhere: 3/4 top-down. Tops of things face the sky and fronts face the camera (south). Never mix angles in one view.
- Light always comes from the upper left. Shadows fall down and to the right. Contact shadows sit under everything that touches the ground.

## 2. How a player reads the world (Lynch's five elements)
A player should be able to draw the town from memory after one or two visits.
- **Paths**: what people move along. Plan the main pathways first, before any boundaries. There are three widths:
  - main street: 3 to 4 tiles of cobble
  - lanes: 2 tiles of packed dirt or gravel
  - footpaths: 1 tile, worn into grass
  - Paths connect nodes; they never just stop.
- **Edges**: linear breaks such as a river, a stone wall, a hedge line, a tree line, a cliff or a railway. Edges mark district boundaries, usually next to a node.
- **Districts**: areas with their own character that you recognise from the ground, walls, plants and colour alone. Examples: the green, the church hill, the lanes, Smith's Row, the farm, Wickham.
- **Nodes**: the places paths meet, such as the crossroads, the green, the well court and the church steps. Things happen at nodes: a bench, a lamp, a board, a well.
- **Landmarks**: things you can see from far off. The church tower is the "weenie": high, a contrasting silhouette, lit at night, with clear sightlines from the main paths. Every district needs at least one landmark of its own: the water tower, the mill wheel, the burnt tree, the bandstand.

## 3. Town form (how real villages grow)
- Classic English village form: houses along a main street, the church at its head or at a bend in the road, and the green as the core, with church, hall and pub clustered round it.
- Growth follows the roads. The old core is tight and irregular. Edges are looser, with houses set back in big gardens, then fields.
- Small clusters sit at junctions. Lanes are narrow and organic; nothing on a perfect grid unless it was planned (Smith's Row can be).
- Function first. The services you visit most (store, smithy, board, church) sit on the hub. The farm, woods, lake and quarry sit at the ends of spokes.

## 4. Paths, flow and space
- **Cut dead space.** In town, every stretch should have something to look at or do. Long empty runs are for the wild, not town.
- **Nooks emphasise.** A building set in a small isolated nook feels important: the hidden garden, the chapel, Agnes's house.
- **Desire paths.** Worn dirt cuts the corners people actually walk: across the green, to the well, behind the tavern.
- **Alleys and courtyards.** Squeeze between buildings (1 to 2 tiles, shadowed) and open into courtyards (a well, a stall, washing lines). This contrast makes towns feel real.
- **Traffic zones.** Busy streets are wide, worn and cobbled. Quiet corners have grass in the cracks.
- **Verticality** makes small areas dense: terraces, retaining walls, steps, cliffs, raised gardens. Steps let you go behind buildings.

## 5. Density and detail
- Aim for 1 to 3 points of interest per screen in town, with a baseline of 2 to 3 small story details per area. Never put a rich area next to a bare one; uneven detail reads as unfinished.
- Foliage density changes gradually: manicured in the centre, wilder at the edges, dark in the copses.
- Negative space is deliberate: the green, fields and the lake are open on purpose and framed by detail at their edges.
- Decorations don't have to fill whole tiles. Hide the grid with offsets and clusters.

## 6. Landmarks, sightlines and reveals
- A landmark is placed high, contrasts in colour and silhouette, is lit (glow, fire, lamp), and has clear lines of sight.
- Hide-and-reveal works in top-down too: trees, buildings and terrace walls block the view, and stepping round them reveals the landmark, now closer.
- Leading lines (fences, hedges, kerbs, rows of lamps) point to places that matter.
- Curtain technique: the edge of a district is screened (trees, hedge, a building) so you discover what's behind it.

## 7. Buildings (3/4 view)
- The roof takes the upper half of the building or more. The ridge is the top edge. Eaves overhang the wall by 3 to 6 px with a dark shadow line under them.
- The front wall face is 2 to 3 tiles tall for a house and 3 to 4 for a shop or church. The door sits on the ground line with a step. Windows sit on a shared sill line. Foundations show 2 to 4 px of stone or a plinth at the base.
- Every building gets a distinct silhouette (roof pitch, chimney position, porch, dormers, extensions) and its own palette (siding colour, trim colour, roof material).
- Detail layers, in order: form, then material texture, then wear (stains, moss, chipped paint), then life (curtains, flower boxes, a bike, laundry, a cat), then horror (a boarded window, scratches, a red ribbon).
- Outlines use the darkest step of each material's ramp, not pure black. Black is only for the deepest contact shadows.
- Mixed borders between yards: picket, hedge, wall, wicker, open lawn. Never one fence type for a whole street.

## 8. Tiles and terrain
- Make several variation tiles per surface and scatter them unevenly (clusters, not uniform noise). Hide repeats inside quiet textures.
- Flip or rotate tiles only if the light still reads as coming from the upper left.
- Every transition between surfaces (grass to dirt, dirt to cobble, grass to water) needs a soft, irregular edge with a dark lip where one surface sits lower.
- Ground colours are quieter than the buildings and objects on them. The ground is the stage, not the show.

## 9. Colour and shading
- Locked, limited palettes per material, built as hue-shifted ramps: shadows lean cool (violet, blue), highlights lean warm (yellow, cream). Ramps share colours so the whole palette hangs together.
- Autumn palette for the season: amber, rust, ochre and moss green. Horror is a narrow, desaturated range with one focal light colour per scene.
- Light the edges of things and keep the rest in shadow. Highlights are small, focused and consistent.
- Dither only for texture and soft transitions (rugs, wood grain, light falloff, fog), never as an all-over noise.
- Hard alpha only (0 or 255). No soft gradients on sprites. Light, fog and night are separate overlay layers.
- Every asset goes through `tools/px/pipeline.py`: palette lock, hard alpha, ordered dither, integer scale.

## 10. Interiors
- 3/4 tilt: the back wall is a band 3 tiles tall, darker than the floor. Furniture sits against it. Side walls are thin strips.
- Rooms are irregular: alcoves, a step down, a pillar, a nook partition. Floors are coded by zone (rug at the hearth, lino in the kitchen, boards elsewhere).
- Character clutter tells you who lives there: their hobby on the table, their flaw on the floor (bottles, unwashed plates, a stopped clock).
- Surface layering: tables get cloths, then plates, then crumbs. Shelves get books, then jars, then a candle.
- Wall hangings at eye level: pictures, calendars, a clock, a cross. Window light changes with time and weather.
- Friendship-locked rooms, hidden rooms (cellars, trapdoors, behind wardrobes), and rooms that are different at night.

## 11. Story in the environment
- Stage scenes as if something just happened: a knocked-over chair, a cold cup of tea beside an unread letter.
- Wear and decay show history: cracks, rust, encroaching plants.
- Keep it logical: the smith's yard has slag and water butts, the farm has mud by the gate, the church has wax and old graves.
- Horror is layered over the cosy: wrong decorations, peeping silhouettes, offerings, red ribbons, things that move when you look away.

## 12. Process for every area
1. Block out paths and nodes.
2. Add edges and districts.
3. Place landmarks with sightlines.
4. Place buildings, then yards and borders.
5. Add props in clusters.
6. Add micro-stories.
7. Do the light pass.
8. Inspector pass: screenshot, review like a player, fix, repeat until clean.

## Inspector checklist
- **Can I tell where I am?** A landmark should be visible or near, and the district should be readable from the ground and colours.
- **Is any screen empty or overcrowded?** Count the points of interest.
- **Overlaps and clipping:**
  - Do sprites overlap wrongly, float, or sit inside walls or water?
  - Are doors blocked?
  - Does anything stand in a path?
- **Repeats:** Are there obvious repeated tiles or props, or identical buildings side by side?
- **Light and shadow:** Does everything have a contact shadow? Is the light direction consistent? Are there soft-alpha edges?
- **Paths:** Do they lead somewhere? Are there dead ends without a reason? Can every door and point of interest be reached?
- **Interiors:** back wall band, furniture against walls, clutter, flaws, light from the windows.
- **Text and UI:** do labels overlap? Do bubbles and toasts cover the action?
- **Speed:** 60 fps on PC; check the slowest scenes.

## Sources
- Pelican Town layout (hub, exits): https://stardewvalleywiki.com/Pelican_Town
- Dead space, nooks, path width: https://www.tumblr.com/enhousestudios/140703456154/2d-rpg-map-design
- Town principles (function first, mental map): https://grasp.study/modules/b4c3ab00-6660-4162-a18c-d2fdab877c31/lessons/45b5f8e5-5685-4623-9586-8487c1a4f2ac
- Paths before boundaries: https://www.worldofleveldesign.com/categories/csgo-tutorials/csgo-how-to-draw-top-down-layouts.php
- Hiding the grid: https://discussions.unity.com/t/making-nice-top-down-map/906213
- 3/4 tiles: https://www.slynyrd.com/blog/2019/8/27/pixelblog-20-top-down-tiles
- 3/4 buildings (roof share, eaves, ramp outlines): https://blakecrosley.com/blog/pixel-art-structures-on-iphone
- Interiors (wall band, one perspective): https://www.sprite-ai.art/gallery/rooms
- Lynch in level design: https://gamedeveloper.com/design/realism-and-legibility-in-open-world-level-design, https://unwinnable.com/2019/08/12/planning-novigrad/, https://ecampusontario.pressbooks.pub/studioskills/?p=172
- Environmental storytelling: https://gamedesignskills.com/game-design/environmental-storytelling/, https://www.abratabia.com/game-narrative/environmental-storytelling.php
- Tile variation: https://castleparadox.com/articles/sewlesson1.php, https://www.redblobgames.com/articles/autotile/claude/
- Elevation makes areas dense, stairs behind buildings (Eastward): https://www.gamedeveloper.com/art/eastward-s-creators-share-insights-on-making-pixel-art-adventures
- Hue shifting and ramps: https://gamedev.net/tutorials/visual-arts/color-palettes-r4964/, https://community.aseprite.org/t/how-do-i-make-cohesive-color-palettes-on-aseprite/7983
- Village form: https://dspace.mit.edu/bitstream/handle/1721.1/64870/27589943-MIT.pdf?sequence=2, https://www.swindon.gov.uk/download/downloads/id/10709/design_access_statement_chapter_3-1147900.pdf
- Weenies, reveals, framing: https://tancoque.design.blog/, https://https-book_leveldesignbook_com.proxy.bugsmash.io/process/blockout/massing/composition
- Horror palettes, edge lighting, dithering restraint: https://lospec.com/palette-list/tag/dithering
