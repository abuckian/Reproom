/*
 * Simple start of the flow (Ian, 10/7): Type > Size (required) > Walls. The customer never picks a price sheet
 * system. This file maps type + size + wall material to the sheet system behind the scenes. Pure functions,
 * shared by the app and tests/mapping.test.js. Every limit is read from catalog.js (which the parity test ties to
 * the price sheet); no prices live here.
 *
 *   Walk-in Shower, standard walls or Simulated Tile:  pan up to 36x60 -> S1 Standard; over 36x60 up to 48x72 -> S5 XL
 *   Walk-in Shower, PuroStone walls:                   up to 48x72 -> S3 PuroStone (+ "Over 36 x 60 Size" when over 36x60)
 *   Tub/Shower Combo, standard walls or Simulated Tile: tub up to 34x60 -> S1 Standard (sheet: "Max tub 34x60x17")
 *   Tub/Shower Combo, PuroStone walls:                 up to 48x72 -> S3 PuroStone (+ "Over 36 x 60 Size" when over 36x60)
 *   Combo tubs are a standard 15 inches deep (Ian 10/7, no depth choice).
 *   Soaker Tub depth is required: 17, 19, or 21 inch (Ian 10/7). All three are the same price as the 19 inch on the
 *   sheet (Ian 10/7), so every depth maps the same way. The depth is kept on the design so the rep sees it.
 *   Soaker Tub, any depth, standard walls or Sim Tile: up to 34 wide, 60 long -> S2 19" Soaker
 *   Soaker Tub, PuroStone walls (Ian 10/7):            up to 34 wide, 60 long -> S3 PuroStone () plus a locked
 *                                                        "Soaker tub with PuroStone" (catalog.systemAdders) = .
 *   Walk-in Tub:                                       one of the sheet sizes -> S4 Walk-In Tub
 *   Anything bigger: no system, "over max size, talk to your rep".
 */
(function (root) {
  var TYPES = [
    { id: "shower", name: "Walk-in Shower", sub: "Step right in. No tub to climb over.", line: "s1" },
    { id: "combo", name: "Tub/Shower Combo", sub: "A regular bathtub with a shower.", line: "s1" },
    { id: "soaker", name: "Soaker Tub", sub: "A deeper tub for soaking, with a shower.", line: "s2" },
    { id: "walkin_tub", name: "Walk-in Tub", sub: "A tub with a door, so you walk right in.", line: "s4" }
  ];
  var WALLS = {
    standard: { id: "standard", name: "Standard wall panels", sub: "White, Biscuit, Almond, Sandbar, Gray" },
    sim_tile: { id: "sim_tile", name: "Simulated Tile 11x20", sub: "Milestone tile look panels", item: "premium_wall" },
    purostone: { id: "purostone", name: "PuroStone", sub: "Stone look walls in 5 patterns", line: "s3" }
  };
  // PuroStone: sheet 3 is "PuroStone Walk-in Showers / Tub Shower Combo"; Ian 10/7 also allows it on the Soaker Tub.
  // Not on the Walk-in Tub (its sheet section lists standard walls only).
  var WALLS_FOR = { shower: ["standard", "sim_tile", "purostone"], combo: ["standard", "sim_tile", "purostone"], soaker: ["standard", "sim_tile", "purostone"], walkin_tub: ["standard", "sim_tile"] };
  var MAX_INCHES = 999;
  var COMBO_DEPTH = 15;
  // Sheet section 2 is "19\" Soaker Tubs"; Ian 10/7: 17 and 21 inch are the same price as 19 inch.
  var SOAKER_DEPTHS = [
    { id: "17", name: "17 inch" },
    { id: "19", name: "19 inch" },
    { id: "21", name: "21 inch" }
  ];

  function findLine(C, id) { return C.lines.filter(function (l) { return l.id === id; })[0] || null; }
  function typeOf(id) { return TYPES.filter(function (t) { return t.id === id; })[0] || null; }
  function num(v) {
    var s = String(v == null ? "" : v).trim();
    if (!/^\d*\.?\d+$|^\d+\.$/.test(s)) return 0;
    var n = Number(s);
    return isFinite(n) && n > 0 && n <= MAX_INCHES ? n : 0;
  }
  function fmt(n) { return String(Math.round(n * 100) / 100); }
  function limits(C) {
    return {
      standard: findLine(C, "s1").fit.shower,   // [36, 60]
      xl: findLine(C, "s5").fit.range,          // [[36, 60], [48, 72]]
      puro: findLine(C, "s3").fit.any,          // [48, 72]
      soaker: findLine(C, "s2").fit.any,        // [34, 60]
      comboTub: findLine(C, "s1").fit.tub,      // [34, 60] (Max tub 34x60x17)
      walkInTub: C.walkInTubSizes.slice()       // ["28x48", ...]
    };
  }
  function wallFor(s) {
    var list = WALLS_FOR[s.type] || [];
    return list.indexOf(s.wallMaterial) >= 0 ? s.wallMaterial : "standard";
  }

  // Size check for the current type. { ok, code: "no_type"|"empty"|"invalid"|"over"|"ok", tier, text, max, message }
  function sizeStatus(C, s) {
    s = s || {};
    var L = limits(C);
    if (!typeOf(s.type)) return { ok: false, code: "no_type", message: "Pick a type first." };
    if (s.type === "walkin_tub") {
      if (s.tubSize === "other") return { ok: false, code: "over", message: "Over max size, talk to your rep. Walk-in tubs come in " + L.walkInTub.join(", ") + "." };
      if (L.walkInTub.indexOf(s.tubSize) >= 0) return { ok: true, code: "ok", tier: "walkin_tub", text: s.tubSize.replace("x", " x ") + " in" };
      return { ok: false, code: "empty", message: "Pick the tub size." };
    }
    var raw = s.size || {};
    var hasW = String(raw.w == null ? "" : raw.w).trim() !== "", hasL = String(raw.l == null ? "" : raw.l).trim() !== "";
    var w = num(raw.w), l = num(raw.l);
    if (!hasW || !hasL) return { ok: false, code: "empty", message: "Enter both the width and the length in inches." };
    if (!w || !l) return { ok: false, code: "invalid", message: "Enter the size in inches, for example 34 and 60." };
    var a = Math.min(w, l), b = Math.max(w, l), text = fmt(a) + " x " + fmt(b) + " in";
    var std36 = a <= L.standard[0] && b <= L.standard[1];   // 36x60 or smaller (PuroStone "Over 36 x 60 Size" rule)
    if (s.type === "soaker") {
      if (a > L.soaker[0] || b > L.soaker[1]) return { ok: false, code: "over", text: text, message: "Over max size, talk to your rep. Soaker tubs go up to " + L.soaker[0] + " inches wide and " + L.soaker[1] + " inches long." };
      var dp = SOAKER_DEPTHS.filter(function (d) { return d.id === String(s.soakerDepth || ""); })[0];
      if (!dp) return { ok: false, code: "empty", text: text, message: "Pick the tub depth." };
      return { ok: true, code: "ok", tier: "soaker", text: text + ", " + dp.id + " in deep", a: a, b: b };
    }
    if (s.type === "combo") {
      if (wallFor(s) === "purostone") {
        if (a > L.puro[0] || b > L.puro[1]) return { ok: false, code: "over", text: text, message: "Over max size, talk to your rep. With PuroStone walls, tub/shower combos go up to " + L.puro[0] + " x " + L.puro[1] + " inches." };
        return { ok: true, code: "ok", tier: std36 ? "standard" : "xl", text: text + ", " + COMBO_DEPTH + " in deep", a: a, b: b };
      }
      if (a > L.comboTub[0] || b > L.comboTub[1]) return { ok: false, code: "over", text: text, message: "Over max size, talk to your rep. Tub/shower combos go up to " + L.comboTub[0] + " inches wide and " + L.comboTub[1] + " inches long." };
      return { ok: true, code: "ok", tier: "standard", text: text + ", " + COMBO_DEPTH + " in deep", a: a, b: b };
    }
    var max = wallFor(s) === "purostone" ? L.puro : L.xl[1];
    if (a > max[0] || b > max[1]) return { ok: false, code: "over", text: text, message: "Over max size, talk to your rep. Walk-in showers go up to " + max[0] + " x " + max[1] + " inches." };
    var std = a <= L.standard[0] && b <= L.standard[1];   // exactly 36x60 is still Standard (sheet: "Max shower pan 36x60")
    return { ok: true, code: "ok", tier: std ? "standard" : "xl", text: text, a: a, b: b };
  }

  // Type + size + wall material -> { line, size, wall, over36x60 }. line is null until the size is valid.
  function systemFor(C, s) {
    var st = sizeStatus(C, s), wall = wallFor(s || {});
    var out = { line: null, size: st, wall: wall, over36x60: false };
    if (!st.ok) return out;
    if (s.type === "walkin_tub") out.line = "s4";
    else if (wall === "purostone") { out.line = "s3"; out.over36x60 = st.tier === "xl"; }  // shower, combo, or soaker
    else if (s.type === "soaker") out.line = "s2";
    else if (s.type === "combo") out.line = "s1";
    else out.line = st.tier === "standard" ? "s1" : "s5";
    return out;
  }

  // Applies the mapping to the picker state (changes it in place). Keeps picks a new system does not offer out.
  function applyDerived(C, s) {
    var sys = systemFor(C, s);
    if (s.type) s.wallMaterial = s.wallMaterial ? sys.wall : s.wallMaterial;
    s.line = sys.line;
    s.picks = s.picks || {};
    var L = findLine(C, sys.line);
    if (!L) return sys;
    Object.keys(s.picks).forEach(function (k) { if (C.items[k] && !L.prices[k]) delete s.picks[k]; });
    if (sys.wall === "sim_tile" && L.prices.premium_wall) s.picks.premium_wall = true; else delete s.picks.premium_wall;
    if (sys.over36x60 && L.prices.over_36x60) s.picks.over_36x60 = true; else delete s.picks.over_36x60;
    var d = (C.doors || []).filter(function (x) { return x.id === s.door; })[0];
    if (!d || (d.item && !L.prices[d.item])) s.door = "rod";
    if (!s.fixture || s.fixture === "standard" || s.fixture === "none") s.fixture = L.hasMoenValve ? "standard" : "none";
    // Walk-in tub (Ian 10/7): no shower heads; the only shower choice is the sheet's Add Shower Option (*).
    if (L.id === "s4") s.fixture = "none";
    if (L.walls === "purostone") s.wallColor = null; else s.puroPattern = null;
    if (L.id !== "s4") s.tubColor = null;
    return sys;
  }

  // Saved designs from before this flow: fill type, wall material, and size from the old fields. The stored
  // system is left as it was (no re-pricing) until the type, size, or walls are changed.
  function migrate(C, s) {
    if (!s) return s;
    // Shower heads (Ian 10/7): old ids keep their meaning under new names (see catalog.fixtures). Anything not
    // offered any more goes back to the included head.
    if (s.fixture && s.fixture !== "standard" && s.fixture !== "none" && !(C.fixtures || []).some(function (f) { return f.id === s.fixture; })) s.fixture = null;
    // Walk-in tub: a saved head (Upgraded Fixture) is dropped; a saved Add Shower Option pick is kept as is.
    if (s.line === "s4" || s.type === "walkin_tub") s.fixture = "none";
    // Soaker 17 or 21 inch saved before they were priced (no system then): map them now, same as 19 inch.
    if (s.type === "soaker" && !s.line && s.soakerDepth) { applyDerived(C, s); return s; }
    if (s.type || !s.line) return s;
    var byLine = { s1: "shower", s3: "shower", s5: "shower", s2: "soaker", s4: "walkin_tub" };
    s.type = byLine[s.line] || null;
    if ((s.line === "s1" || s.line === "s3") && s.measure && s.measure.kind === "tub") s.type = "combo";
    if (s.line === "s2" && !s.soakerDepth) s.soakerDepth = "19";
    s.wallMaterial = s.line === "s3" ? "purostone" : (s.picks && s.picks.premium_wall ? "sim_tile" : "standard");
    if (!s.size) s.size = { w: "", l: "" };
    var m = s.measure || {};
    if (s.type !== "walkin_tub" && m.w && m.l && !s.size.w && !s.size.l) { s.size.w = m.w; s.size.l = m.l; }
    return s;
  }

  // Rep only: combos the sheet does not price directly. None open right now (soaker depths and soaker with
  // PuroStone were confirmed 10/7); kept so new open questions show on the Walls step.
  function repFlags(s) {
    var out = [];
    return out;
  }
  function typeName(s) { var t = typeOf(s && s.type); return t ? t.name : ""; }

  var api = { COMBO_DEPTH: COMBO_DEPTH, SOAKER_DEPTHS: SOAKER_DEPTHS, TYPES: TYPES, WALLS: WALLS, WALLS_FOR: WALLS_FOR, typeOf: typeOf, typeName: typeName, limits: limits,
    repFlags: repFlags, sizeStatus: sizeStatus, systemFor: systemFor, applyDerived: applyDerived, migrate: migrate, wallFor: wallFor };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Mapping = api;
})(typeof window !== "undefined" ? window : this);
