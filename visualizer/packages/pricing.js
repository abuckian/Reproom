/*
 * RepRoom price tally. Pure functions, no DOM. Used by the app and by tests/pricing.test.js.
 * Total = product line retail price + selected construction options + selected upgrades
 *         + selected Full Bathroom Options. No tax, discount, deposit, financing, or labor lines.
 */
(function (root) {
  function findLine(catalog, id) {
    for (var i = 0; i < catalog.lines.length; i++) if (catalog.lines[i].id === id) return catalog.lines[i];
    return null;
  }

  // Merge the generic item definition with the line specific price entry.
  function lineItem(catalog, line, itemId) {
    if (!line || !line.prices[itemId]) return null;
    var def = catalog.items[itemId] || {};
    var p = line.prices[itemId];
    var out = { id: itemId };
    var k;
    for (k in def) out[k] = def[k];
    for (k in p) out[k] = p[k];
    out.label = p.label || def.label || out.sheetLabel;
    out.star = !!p.star;
    return out;
  }

  function isAvailable(catalog, lineId, itemId) {
    var line = findLine(catalog, lineId);
    return !!(line && line.prices[itemId]);
  }

  function allFullBathItems(catalog) {
    var fb = catalog.fullBath, map = {};
    fb.vanity.sources.forEach(function (src) {
      src.sizes.forEach(function (s) { map[s.id] = Object.assign({ section: src.sheetGroup, type: "fixed", sourceId: src.id }, s); });
      src.extras.forEach(function (s) { map[s.id] = Object.assign({ section: src.sheetGroup, type: "fixed", sourceId: src.id }, s); });
    });
    fb.toilet.options.forEach(function (s) { map[s.id] = Object.assign({ section: fb.toilet.sheetGroup, type: "fixed" }, s); });
    fb.groups.forEach(function (g) {
      g.items.forEach(function (s) { map[s.id] = Object.assign({ section: g.sheetGroup }, s); });
    });
    Object.keys(map).forEach(function (id) { if (!map[id].label) map[id].label = map[id].sheetLabel; });
    return map;
  }

  function posInt(n) {
    n = Number(n);
    if (!isFinite(n) || n <= 0) return 0;
    return Math.floor(n);
  }
  function posNum(n) {
    n = Number(n);
    if (!isFinite(n) || n <= 0) return 0;
    return Math.round(n * 100) / 100;
  }

  /*
   * state = {
   *   line: "s1".."s5",
   *   trim: "chrome"|"bn"|"orb"|"mb",
   *   fixture: "standard"|"none"|"hh"|"hhs"|"rain"|"rain_div",
   *   door: "rod"|"standard_door"|"denali_door"|"custom_door",
   *   picks: { itemId: true },        // line toggles and Full Bath fixed items
   *   pieces: { grab_bars: n, corner_shelves: n },  // lines where Additional Shelves and GBs is "pieces"
   *   qty:   { itemId: n },           // Full Bath "per" items
   *   sqft:  { itemId: n },           // Full Bath per sq ft items
   *   vanity: null | "vanity_cs_0_36" ...,
   *   vanityExtras: { stair, double, drywall },
   *   toilet: null | "toilet_kohler" | "toilet_cust"
   *   (plus look choices like wallColor, which carry no price)
   * }
   */
  // Locked off-sheet charges that apply to this system and type (catalog.systemAdders).
  function systemAdders(catalog, line, state) {
    if (!line) return [];
    return (catalog.systemAdders || []).filter(function (x) { return x.line === line.id && (!x.type || x.type === (state && state.type)); });
  }
  // Base price the customer sees for the system: sheet base plus any locked adders.
  function systemPrice(catalog, line, state) {
    return line ? systemAdders(catalog, line, state).reduce(function (t, x) { return t + x.price; }, line.basePrice) : 0;
  }

  function computeQuote(catalog, state) {
    state = state || {};
    var line = findLine(catalog, state.line);
    var rows = [];
    if (!line) return { line: null, rows: rows, total: 0, stars: [] };

    rows.push({ id: "base_" + line.id, section: "Product line", label: line.name, sheetLabel: line.sheetName + " RETAIL PRICE", unitPrice: line.basePrice, qty: 1, unit: "each", amount: line.basePrice, star: false, isBase: true });
    systemAdders(catalog, line, state).forEach(function (x) {
      rows.push({ id: x.id, section: "Product line", label: x.label, sheetLabel: x.label, unitPrice: x.price, qty: 1, unit: "each", amount: x.price, star: false, repNote: x.repNote || "", detail: "", auto: true, locked: true, isAdder: true });
    });

    var picks = state.picks || {};
    var added = {};

    function addLineItem(itemId, detail, auto) {
      if (added[itemId]) return;
      var it = lineItem(catalog, line, itemId);
      if (!it) return;
      added[itemId] = true;
      rows.push({ id: itemId, section: it.group === "construction" ? "Construction options" : "Upgrades", label: it.label, sheetLabel: it.sheetLabel, unitPrice: it.price, qty: 1, unit: "each", amount: it.price, star: it.star, repNote: it.repNote || "", detail: detail || "", auto: !!auto });
    }

    // Rows follow the order of the customer steps: walls, trim, fixture, door, seats, shelves, then site work.
    function addToggle(id) {
      if (!picks[id]) return;
      addLineItem(id);
      // Sheet rule: Soffit Removal (must add CP)
      var def = catalog.items[id];
      if (def && def.requires && line.prices[def.requires]) addLineItem(def.requires, "Required with " + (def.label || def.sheetLabel), true);
    }
    var trim = (catalog.trimFinishes || []).filter(function (t) { return t.id === state.trim; })[0];
    var fx = (catalog.fixtures || []).filter(function (f) { return f.id === state.fixture; })[0];
    var door = (catalog.doors || []).filter(function (d) { return d.id === state.door; })[0];

    if (picks.premium_wall) {
      var pw = catalog.items.premium_wall, ws = pw && pw.wallStyle;
      var wc = (catalog.wallColorsStandard || []).filter(function (c) { return c.id === state.wallColor; })[0];
      addLineItem("premium_wall", wc ? wc.name : "");
      var pwRow = rows[rows.length - 1];
      if (pwRow && pwRow.id === "premium_wall" && ws) pwRow.recordDetail = ws.name + (wc ? ", " + wc.name : "");
    }
    addToggle("color_matched");
    if (trim && trim.item) addLineItem(trim.item, trim.name);
    if (fx && fx.item) addLineItem(fx.item, fx.name);
    addToggle("add_shower_option");
    if (door && door.item) addLineItem(door.item);
    ["frosted_glass", "folding_seat", "bench_seat", "foot_pedestal", "metal_shelves"].forEach(addToggle);
    var gb = lineItem(catalog, line, "add_shelves_gbs");
    if (gb && gb.type === "pieces") {
      var pc = pieceCounts(catalog, line, state);
      if (pc.extra > 0) {
        added.add_shelves_gbs = true;
        rows.push({ id: "add_shelves_gbs", section: "Upgrades", label: gb.label + ": " + pc.total + " (" + pc.included + " included, " + pc.extra + " extra)", sheetLabel: gb.sheetLabel, unitPrice: gb.price, qty: pc.extra, unit: "per", amount: gb.price * pc.extra, star: gb.star, repNote: gb.repNote || "", detail: pc.detail, pieces: pc });
      }
    } else {
      addToggle("add_shelves_gbs");
    }
    Object.keys(line.prices).forEach(function (id) {
      var def = catalog.items[id];
      if (def && def.group === "construction") addToggle(id);
    });

    // Full Bathroom Options
    var fbMap = allFullBathItems(catalog);
    function addFb(id, qty, unit, detail) {
      var it = fbMap[id];
      if (!it) return;
      var amount = Math.round(it.price * qty * 100) / 100;
      rows.push({ id: id, section: "Full Bathroom Options", group: it.section, label: it.label, sheetLabel: it.sheetLabel, unitPrice: it.price, qty: qty, unit: unit, amount: amount, star: !!it.star, repNote: it.repNote || "", detail: detail || "" });
    }

    if (state.vanity && fbMap[state.vanity]) {
      var v = fbMap[state.vanity];
      var src = catalog.fullBath.vanity.sources.filter(function (s) { return s.id === v.sourceId; })[0];
      var colorName = "";
      if (src.colors && state.vanityColor) {
        var c = src.colors.filter(function (x) { return x.id === state.vanityColor; })[0];
        if (c) colorName = c.name;
      }
      addFb(state.vanity, 1, "each", colorName);
      var ex = state.vanityExtras || {};
      src.extras.forEach(function (e) { if (ex[e.key]) addFb(e.id, 1, "each"); });
    }
    if (state.toilet && fbMap[state.toilet]) {
      var tdetail = [state.toiletShape, state.toiletHeight].filter(Boolean).join(", ");
      addFb(state.toilet, 1, "each", tdetail);
    }
    catalog.fullBath.groups.forEach(function (g) {
      g.items.forEach(function (it) {
        if (it.type === "fixed" && picks[it.id]) addFb(it.id, 1, "each");
        if (it.type === "per") { var q = posInt((state.qty || {})[it.id]); if (q) addFb(it.id, q, "per"); }
        if (it.type === "sqft") { var s = posNum((state.sqft || {})[it.id]); if (s) addFb(it.id, s, "sqft"); }
      });
    });

    var total = 0;
    rows.forEach(function (r) { total += r.amount; });
    total = Math.round(total * 100) / 100;
    return { line: line, rows: rows, total: total, stars: rows.filter(function (r) { return r.star; }) };
  }

  // Grab bars and corner shelves by count: first piecesIncluded are free, each piece beyond is the sheet price.
  function pieceCounts(catalog, line, state) {
    var it = lineItem(catalog, line, "add_shelves_gbs");
    if (!it || it.type !== "pieces") return null;
    var src = (state && state.pieces) || {};
    var parts = it.pieceParts.map(function (p) {
      var n = src[p.id];
      n = n == null || n === "" ? p.default : posInt(n);
      return { id: p.id, name: p.name, count: n };
    });
    var total = parts.reduce(function (a, p) { return a + p.count; }, 0);
    var included = it.piecesIncluded;
    return {
      parts: parts, total: total, included: included,
      freeLeft: Math.max(0, included - total), extra: Math.max(0, total - included),
      unitPrice: it.price, amount: Math.max(0, total - included) * it.price,
      detail: parts.map(function (p) { return p.count + " " + p.name; }).join(", ")
    };
  }

  function floorFor(catalog, total) {
    return Math.round(total * catalog.meta.floorRatio * 100) / 100;
  }

  // Size fit per the sheet limits. w, l in inches. kind: "shower" | "tub". Returns {ok, reason}.
  function checkFit(line, kind, w, l) {
    w = Number(w); l = Number(l);
    if (!line.fit || !(w > 0) || !(l > 0)) return { ok: true, reason: "" };
    var a = Math.min(w, l), b = Math.max(w, l);
    var f = line.fit;
    if (f.shower || f.tub) {
      var lim = kind === "tub" ? f.tub : f.shower;
      if (a > lim[0] || b > lim[1]) return { ok: false, reason: kind === "tub" ? "Over max tub 34x60x17" : "Over max shower pan 36x60" };
    }
    if (f.any && (a > f.any[0] || b > f.any[1])) {
      return { ok: false, reason: line.id === "s2" ? "Max width 34\", max length 60\"" : "Over 48x72" };
    }
    if (f.range) {
      var lo = f.range[0], hi = f.range[1];
      if (a < lo[0] || b < lo[1] || a > hi[0] || b > hi[1]) return { ok: false, reason: "Pan size must be 36x60 to 48x72" };
    }
    return { ok: true, reason: "" };
  }

  // ---------- Deal record export (fields the team logs for every job) ----------
  var DEAL_FIELDS = ["sign_date", "customer", "product", "line_items", "retail_total", "sold_price", "percent_of_retail", "above_95_floor"];

  // "" -> 12345.5 ; blank or invalid -> null
  function parseMoney(v) {
    if (v == null) return null;
    var s = String(v).replace(/[$,\s]/g, "");
    if (!s) return null;
    var n = Number(s);
    if (!isFinite(n) || n <= 0) return null;
    return Math.round(n * 100) / 100;
  }

  // Line item name for the internal record: sheet wording plus the customer's pick.
  function recordItemName(r, line) {
    if (r.isBase) return line.sheetName;
    var name = (r.group && /^Vanity/.test(r.group) ? r.group + ": " : "") + r.sheetLabel;
    var detail = r.recordDetail || r.detail || "";
    if (r.pieces) detail = r.pieces.detail + " (" + r.pieces.included + " included)";
    return detail ? name + ": " + detail : name;
  }

  function dealRecord(catalog, state, opts) {
    opts = opts || {};
    var q = computeQuote(catalog, state);
    var sold = parseMoney(opts.soldPrice);
    var retail = q.total;
    var hasSold = sold != null && retail > 0;
    return {
      sign_date: "",
      customer: String(opts.customer || "").trim(),
      product: q.line ? q.line.sheetName : "",
      line_items: q.rows.map(function (r) { return { name: recordItemName(r, q.line), qty: r.qty, price: r.unitPrice }; }),
      retail_total: retail,
      sold_price: hasSold ? sold : "",
      // Rounded DOWN to 2 decimals so it can never read 95 while the sold price is under the 95% floor.
      percent_of_retail: hasSold ? Math.floor((sold * 10000) / retail + 1e-7) / 100 : "",
      above_95_floor: hasSold ? (Math.round(sold * 100) >= Math.round(floorFor(catalog, retail) * 100) ? "yes" : "no") : ""
    };
  }

  function csvCell(v) {
    var s = v == null ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // keep spreadsheets from treating text as a formula
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  // One header row plus one data row. line_items cell: "name | qty | price" joined by "; ".
  function dealCsv(rec) {
    var items = rec.line_items.map(function (i) { return i.name + " | " + i.qty + " | " + i.price; }).join("; ");
    var row = DEAL_FIELDS.map(function (f) { return csvCell(f === "line_items" ? items : rec[f]); });
    return DEAL_FIELDS.join(",") + "\r\n" + row.join(",") + "\r\n";
  }

  var api = { dealRecord: dealRecord, dealCsv: dealCsv, parseMoney: parseMoney, DEAL_FIELDS: DEAL_FIELDS, computeQuote: computeQuote, systemAdders: systemAdders, systemPrice: systemPrice, pieceCounts: pieceCounts, floorFor: floorFor, checkFit: checkFit, lineItem: lineItem, isAvailable: isAvailable, findLine: findLine, allFullBathItems: allFullBathItems };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Pricing = api;
})(typeof window !== "undefined" ? window : this);
