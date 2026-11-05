/*
 * Builds the AI bathroom preview options and prompt from the picker state.
 * No prices here. Used by the app's "See it" step (sent to functions/api/preview.js) and by tools/ai-preview-test.js.
 */
(function (root) {
  function find(list, id) { return (list || []).filter(function (x) { return x.id === id; })[0] || null; }

  // Picker state -> plain options object (what the image should show).
  function previewOptionsFromState(catalog, state) {
    var line = find(catalog.lines, state.line);
    if (!line) throw new Error("No product line picked");
    var has = function (id) { return !!line.prices[id]; };
    var o = { system: line.name, lineId: line.id };
    var byType = { shower: "walk_in_shower", combo: "tub_shower", soaker: "soaker_tub", walkin_tub: "walk_in_tub" };
    if (state.type && byType[state.type]) o.layout = byType[state.type];
    else if (line.id === "s4") o.layout = "walk_in_tub";
    else if (line.id === "s2") o.layout = "soaker_tub";
    else if (line.id === "s5") o.layout = "walk_in_shower";
    else o.layout = (state.measure && state.measure.kind === "tub") ? "tub_shower" : "walk_in_shower";

    if (line.walls === "purostone") {
      var p = find(catalog.puroStonePatterns, state.puroPattern);
      o.walls = { type: "purostone", pattern: p ? p.name : null };
    } else {
      var c = find(catalog.wallColorsStandard, state.wallColor);
      o.walls = { type: "standard", color: c ? c.name : null };
      var pwi = catalog.items.premium_wall;
      if (state.picks && state.picks.premium_wall && has("premium_wall") && pwi && pwi.wallStyle) o.walls.style = pwi.wallStyle.id;
    }
    if (line.id === "s4") o.tubColor = (find(catalog.walkInTubColors, state.tubColor) || {}).name || null;
    o.trim = (find(catalog.trimFinishes, state.trim) || { name: "Chrome" }).name;
    var fx = find(catalog.fixtures, state.fixture);
    o.fixture = fx ? fx.id : (line.hasMoenValve ? "standard" : "none");
    // Walk-in tub: no heads offered; the shower comes only from the Add Shower Option.
    if (line.id === "s4") o.fixture = state.picks && state.picks.add_shower_option && has("add_shower_option") ? "tub_shower" : "tub_only";
    var d = find(catalog.doors, state.door);
    o.door = (d && (!d.item || has(d.item))) ? d.id : "rod";
    o.frostedGlass = !!(state.picks && state.picks.frosted_glass && has("frosted_glass"));
    o.seat = state.picks && state.picks.bench_seat && has("bench_seat") ? "bench" : (state.picks && state.picks.folding_seat && has("folding_seat") ? "folding" : null);
    o.footPedestal = !!(state.picks && state.picks.foot_pedestal && has("foot_pedestal"));
    o.metalShelves = !!(state.picks && state.picks.metal_shelves && has("metal_shelves"));
    var pk = function (id) { return !!(state.picks && state.picks[id] && has(id)); };
    o.showerAdded = line.id === "s4" ? pk("add_shower_option") : null;
    o.windowKit = pk("window_kit");
    o.soffitRemoved = pk("soffit");
    var gbDef = catalog.items.add_shelves_gbs;
    var pieces = (state.pieces) || {};
    if (line.prices.add_shelves_gbs && (line.prices.add_shelves_gbs.type || gbDef.type) === "pieces") {
      o.grabBars = pieces.grab_bars != null ? Number(pieces.grab_bars) : 2;
      o.cornerShelves = pieces.corner_shelves != null ? Number(pieces.corner_shelves) : 2;
    } else {
      o.grabBars = 2; o.cornerShelves = 2; // PuroStone includes 2 metal shelves (trim matched) and 2 grab bars
      if (line.id === "s3") o.metalShelves = true;
    }
    return o;
  }

  var LAYOUT = {
    walk_in_shower: "a walk-in shower with a low shower base (no bathtub)",
    tub_shower: "a bathtub with shower (tub and shower combination)",
    soaker_tub: "a 19 inch deep soaker bathtub with shower",
    walk_in_tub: "a walk-in bathtub with a hinged entry door in the tub front"
  };
  var DOOR = {
    rod: "a straight shower curtain rod in the trim finish, with no glass door",
    standard_door: "a glass shower door (CincyBath Standard Door)",
    denali_door: "a sliding glass shower door with exposed roller hardware (Denali Door)",
    custom_door: "an inline fixed glass panel with a swinging glass door (Custom Door)"
  };
  var FIXTURE = {
    standard: "a standard single handle shower valve and a standard wall mounted shower head",
    none: "the standard faucet and controls for this tub",
    tub_only: "the walk-in tub's own faucet and controls only. No shower head, no shower valve, and no slide bar on the wall",
    tub_shower: "the walk-in tub's own faucet and controls, plus a standard wall mounted shower head and single handle shower valve on the wall above the tub",
    hh: "a removable handheld shower head in a wall mount, with its hose, plus a single handle shower valve",
    hhs: "a standard wall mounted shower head plus a handheld shower head on a slide bar with its hose, joined by a diverter, plus a single handle shower valve",
    rain: "a large round rain shower head overhead, plus a single handle shower valve",
    rain_div: "a large round rain shower head overhead plus a handheld shower head on a slide bar with its hose, joined by a diverter, plus a single handle shower valve"
  };

  // options -> prompt text. refs: [{ label: "wall panel color Gray" }, ...] in the order the images are attached.
  // extraAngles: how many more photos of the same room are attached right after image 1 (0 to 2). Product
  // reference images come after those. Order sent: room photo, extra angles, product references.
  function buildPreviewPrompt(o, refs, extraAngles) {
    refs = refs || [];
    var extra = Math.max(0, Math.min(2, Number(extraAngles) || 0));
    var walls = o.walls.type === "purostone"
      ? "PuroStone stone look wall panels in the " + (o.walls.pattern || "chosen") + " pattern"
      : o.walls.style === "sim_tile_11x20"
        ? (o.walls.color || "White").toLowerCase() + " 11x20 simulated tile wall panels (Milestone Wall Systems)"
        : "smooth seamless wall panels in the color " + (o.walls.color || "White");
    var lines = [];
    lines.push("Edit image 1, a photo of a real bathroom, to show how it would look after a CincyBath remodel of the bathing area.");
    if (extra === 1) lines.push("Image 2 is another photo of the same bathroom from a different angle. Use it only to understand the room. The result must show the view of image 1.");
    if (extra === 2) lines.push("Images 2 and 3 are other photos of the same bathroom from different angles. Use them only to understand the room. The result must show the view of image 1.");
    lines.push("Keep the photo exactly as taken: same camera position, angle, framing, perspective, and lighting. Keep the room's size and shape, the ceiling, window, entry door, vanity, toilet, flooring, wall paint outside the bathing area, and every object outside the bathing area exactly as they are, in the same places.");
    lines.push("Change only the bathing area, in the same location and the same size as the existing tub or shower opening:");
    lines.push("1. Replace the existing tub or shower with " + LAYOUT[o.layout] + (o.tubColor ? " in " + o.tubColor.toLowerCase() : "") + (o.showerAdded ? ", with a shower added" : "") + ".");
    lines.push("2. Cover the back wall and both side walls of the bathing area with " + walls + ", with clean straight trim edges.");
    lines.push("3. All metal parts (valve trim, shower head, grab bars, rod or door hardware) are in a " + o.trim.toLowerCase() + " finish.");
    lines.push("4. Fixture: " + FIXTURE[o.fixture] + ".");
    lines.push("5. Enclosure: " + DOOR[o.door] + (o.door !== "rod" ? (o.frostedGlass ? ", with frosted glass" : ", with clear glass") : "") + ".");
    var extras = [];
    if (o.grabBars > 0) extras.push(o.grabBars + " grab bar" + (o.grabBars > 1 ? "s" : ""));
    if (o.cornerShelves > 0) extras.push(o.cornerShelves + " corner shel" + (o.cornerShelves > 1 ? "ves" : "f") + (o.metalShelves ? " in metal matching the trim" : " matching the wall color"));
    else if (o.metalShelves) extras.push("metal corner shelves matching the trim");
    if (o.seat === "folding") extras.push("a wall mounted folding shower seat");
    if (o.seat === "bench") extras.push("a built in shower bench seat");
    if (o.footPedestal) extras.push("a small foot pedestal (foot rest) matching the trim");
    if (extras.length) lines.push("6. Inside the bathing area add exactly: " + extras.join(", ") + ".");
    var site = [];
    if (o.windowKit) site.push("The window inside the bathing area is trimmed with a window kit that matches the wall panels.");
    if (o.soffitRemoved) site.push("The soffit above the bathing area is removed and replaced with a flat ceiling panel.");
    if (site.length) lines.push("7. " + site.join(" "));
    if (refs.length) {
      lines.push("Reference product photos are attached after the room photo" + (extra ? "s" : "") + ". Match their color, texture, and shape exactly:");
      refs.forEach(function (r, i) { lines.push("Image " + (i + 2 + extra) + ": " + r.label + "."); });
    }
    lines.push("Make it photorealistic, like a professional after photo taken from the same spot, with natural reflections and shadows. Add nothing that is not listed above.");
    return lines.join("\n");
  }

  // ----- Full bathroom, pass 2: the rest of the room (vanity, toilet, floor, accessories, lights) -----
  // Picker state -> what the rest of the room should show. Only things you can see; no prices.
  var VANITY_WIDTH = { "0_36": "up to 36 inches wide", "37_60": "between 37 and 60 inches wide", "61": "wider than 60 inches" };
  function roomOptionsFromState(catalog, state) {
    var fb = catalog.fullBath, o = { vanity: null, toilet: null, floor: false, mirror: null, accessories: false, lights: 0, canLights: 0, fan: false, paintedWalls: false };
    var picks = state.picks || {}, qty = state.qty || {}, sqft = state.sqft || {};
    o.trim = (find(catalog.trimFinishes, state.trim) || { name: "Chrome" }).name;
    var src = find(fb.vanity.sources, state.vanitySource);
    if (src && state.vanity) {
      var size = find(src.sizes, state.vanity);
      var band = size ? size.id.replace(/^vanity_(cs|cb)_/, "") : "";
      o.vanity = { supplied: src.id === "cb" ? "cincybath" : "customer", width: VANITY_WIDTH[band] || null,
        color: src.id === "cb" ? ((find(src.colors || [], state.vanityColor) || {}).name || null) : null,
        double: !!(state.vanityExtras && state.vanityExtras.double) };
    }
    var t = find(fb.toilet.options, state.toilet);
    if (t) o.toilet = { supplied: t.id === "toilet_cust" ? "customer" : "kohler", shape: state.toiletShape || null, height: state.toiletHeight || null };
    o.floor = Number(sqft.fl_lvp) > 0;
    if (picks.acc_mirror_medcab) o.mirror = "trim";
    else if (picks.acc_cust_mirror) o.mirror = "customer";
    o.accessories = !!picks.acc_pack;
    o.lights = Math.max(0, Math.floor(Number(qty.acc_cust_light) || 0));
    o.canLights = Math.max(0, Math.floor(Number(qty.el_can_lights) || 0));
    o.fan = !!picks.el_fan;
    o.paintedWalls = Number(qty.dw_paint_wall) > 0;
    return o;
  }
  function hasRoomChanges(r) {
    return !!(r && (r.vanity || r.toilet || r.floor || r.mirror || r.accessories || r.lights || r.canLights || r.fan || r.paintedWalls));
  }
  function num(n, one, many) { return n + " " + (n === 1 ? one : many); }
  // Prompt for pass 2. Image 1 is pass 1's picture (bathing area already remodeled).
  function buildRoomPrompt(r) {
    var trim = String(r.trim || "Chrome").toLowerCase();
    var L = [];
    L.push("Edit image 1, a photo of a real bathroom whose tub or shower area has just been remodeled, to show the rest of the room remodeled too.");
    L.push("Keep the bathing area exactly as it is in image 1. The tub or shower, its wall panels, trim, glass door or rod, shower fixtures, shelves, grab bars, and everything inside the bathing area must not change at all.");
    L.push("Keep the photo exactly as taken: same camera position, angle, framing, perspective, and lighting. Keep the room's size and shape, the ceiling, window, and entry door where they are.");
    L.push("The toilet stays exactly where it is now, and the vanity stays in the same spot along the same wall.");
    L.push("Change only the rest of the room:");
    var items = [];
    if (r.vanity) {
      var v = r.vanity.supplied === "cincybath"
        ? "a new shaker style vanity cabinet" + (r.vanity.color ? " in " + r.vanity.color.toLowerCase() : "") + " with a new countertop"
        : "a new vanity cabinet with a new countertop, simple and clean in style";
      if (r.vanity.width) v += ", " + r.vanity.width;
      v += r.vanity.double ? ", with two sinks and two faucets" : ", with one sink and faucet";
      items.push("Vanity: replace the existing vanity with " + v + ", faucets in a " + trim + " finish.");
    }
    if (r.toilet) {
      var tt = "a new white " + (r.toilet.supplied === "kohler" ? "Kohler " : "") + "toilet";
      if (r.toilet.shape) tt += " with " + (r.toilet.shape === "Elongated" ? "an elongated" : "a round") + " bowl";
      if (r.toilet.height) tt += ", seat about " + r.toilet.height.replace(/\s*in$/, "") + " inches high";
      items.push("Toilet: replace the existing toilet with " + tt + ", in the same spot.");
    }
    if (r.floor) items.push("Floor: replace the flooring outside the bathing area with new luxury vinyl plank flooring in a neutral wood look, laid straight and even.");
    if (r.mirror === "trim") items.push("Mirror: a new framed mirror or flush medicine cabinet above the vanity, with a frame in a " + trim + " finish.");
    if (r.mirror === "customer") items.push("Mirror: a new simple mirror above the vanity.");
    if (r.accessories) items.push("Accessories: a matching towel bar and toilet paper holder in a " + trim + " finish.");
    if (r.lights) items.push("Lighting: " + num(r.lights, "new light fixture", "new light fixtures") + " above the vanity.");
    if (r.canLights) items.push("Ceiling: add " + num(r.canLights, "recessed can light", "recessed can lights") + " in the ceiling outside the bathing area.");
    if (r.fan) items.push("Ceiling: a new ceiling exhaust fan grille.");
    if (r.paintedWalls) items.push("Walls outside the bathing area: freshly painted, smooth and clean, in the same color as now.");
    items.forEach(function (x, i) { L.push((i + 1) + ". " + x); });
    L.push("Keep everything not listed above as it is now. Make it photorealistic, like a professional after photo taken from the same spot, with natural reflections and shadows. Add nothing that is not listed above.");
    return L.join("\n");
  }

  var api = { previewOptionsFromState: previewOptionsFromState, buildPreviewPrompt: buildPreviewPrompt, buildShowerPrompt: buildPreviewPrompt,
    roomOptionsFromState: roomOptionsFromState, hasRoomChanges: hasRoomChanges, buildRoomPrompt: buildRoomPrompt };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PreviewPrompt = api;
})(typeof window !== "undefined" ? window : this);
