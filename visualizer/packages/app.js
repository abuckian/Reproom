/* RepRoom option picker. Plain JS, no build step. */
(function () {
  "use strict";
  var C = window.CATALOG, P = window.Pricing, M = window.Mapping, Flow = window.Flow;
  var REP_PIN_PLACEHOLDER = "0000"; // Placeholder only. See README. Not real security.
  var NO_PRICE = true; // Public RepRoom build: never show money.
  var STORE_KEY = "cincybath.picker.v1";
  var DESIGNS_KEY = "cincybath.designs.v1";
  var PRICE_SHEET_DATE = "10/6/2026";

  // Shower head icons for the fixture step (32x32, stroke style like ICON).
  var HD = '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
  var HAND = '<path d="M22.5 16.5l4 1.6-1.2 3-4-1.6z"/><path d="M22.8 20.4l-2.3 5"/><path d="M20.5 25.4c-1 2.2-3.6 2.4-4.6 0.6"/>';
  var HEAD_ICON = {
    standard: HD + '<path d="M6 28V7"/><path d="M6 8h9v3"/><path d="M10 15l2-4h6l2 4z"/><path d="M11 19v2M15 19v3M19 19v2"/></svg>',
    hh: HD + '<path d="M5 28V8"/><path d="M5 12h3"/><path d="M15 5l5 2-1.5 4-5-2z"/><path d="M15.5 10.2L12 18"/><path d="M12 18c-1.5 3.5-5 4-6.5 2"/><path d="M21 11.5l2 1M20 14l2 1.5"/></svg>',
    hhs: HD + '<path d="M5 28V5"/><path d="M5 6h7v3"/><path d="M8 13l1.5-4h5l1.5 4z"/><path d="M9 16.5v2M12 16.5v2.5M15 16.5v2"/>' + HAND + '</svg>',
    rain: HD + '<path d="M16 3v4"/><path d="M6 10.5c0-2 1.5-3.5 3.5-3.5h13c2 0 3.5 1.5 3.5 3.5z"/><path d="M8 14v2M12 14v3M16 14v2M20 14v3M24 14v2M10 20v2M14 21v2M18 20v2M22 21v2"/></svg>',
    rain_div: HD + '<path d="M13 3v3"/><path d="M4 9c0-1.7 1.3-3 3-3h12c1.7 0 3 1.3 3 3z"/><path d="M6 12.5v2M10 12.5v2.5M14 12.5v2M18 12.5v2.5M8 17.5v2M12 18v2"/>' + HAND + '</svg>'
  };
  var ICON = {
    panel: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="6" y="4" width="20" height="24" rx="1.5"/></svg>',
    simtile: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="4" y="4" width="24" height="24" rx="1.5"/><path d="M4 10.5h24M4 17h24M4 23.5h24M12 4v6.5M22 4v6.5M8 10.5V17M17 10.5V17M12 17v6.5M22 17v6.5M8 23.5V28M17 23.5V28"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    bath: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 25h36v5a9 9 0 0 1-9 9H15a9 9 0 0 1-9-9v-5z"/><path d="M11 25V11a4 4 0 0 1 7.6-1.7"/><path d="M15 39l-2 4M33 39l2 4"/><circle cx="21" cy="13" r="2.2"/></svg>',
    stone: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 9c6-3 9 3 15 0s7-2 9-1M4 17c5-2 8 2 13 0s8-3 11-1M4 25c6-3 10 2 16-1"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    shower: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 28V9a5 5 0 0 1 10 0"/><path d="M13 13h10l-2 4h-6z"/><path d="M15 21v2M19 21v2M17 24v2"/></svg>',
    door: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="5" y="4" width="22" height="24" rx="1.5"/><path d="M16 4v24"/><path d="M12 15v3M20 15v3" stroke-linecap="round"/></svg>',
    camera: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 10.5h5l2.2-3.5h9.6l2.2 3.5h5V25H4z"/><circle cx="16" cy="17" r="5"/></svg>',
    library: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="4" y="6" width="24" height="20" rx="2"/><path d="M4 21l7-7 6 6 4-4 7 7"/><circle cx="21.5" cy="11.5" r="2"/></svg>',
    spark: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M16 4l2.6 7.4L26 14l-7.4 2.6L16 24l-2.6-7.4L6 14l7.4-2.6z"/><path d="M25 21l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"/></svg>',
    room: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 30h18v4a6 6 0 0 1-6 6h-6a6 6 0 0 1-6-6z"/><path d="M8 30V18a3 3 0 0 1 5.7-1.3"/><rect x="27" y="22" width="15" height="18" rx="1.5"/><path d="M27 28h15M34.5 22v-3"/><rect x="29" y="8" width="11" height="9" rx="1.5"/></svg>',
    walkintub: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 14h32v16a10 10 0 0 1-10 10H18A10 10 0 0 1 8 30z"/><path d="M14 20h12v14H14z"/><path d="M23 27h1"/><path d="M36 14V8a3 3 0 0 0-5-2"/><path d="M14 40l-2 3M34 40l2 3"/></svg>',
    bigshower: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10 44V12a7 7 0 0 1 14 0"/><path d="M17 17h14l-3 5h-8z"/><path d="M21 27v3M27 27v3M24 32v3M19 33v3M29 33v3"/><path d="M6 44h36"/></svg>',
    combo: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 26h38v4a9 9 0 0 1-9 9H14a9 9 0 0 1-9-9z"/><path d="M13 39l-2 4M35 39l2 4"/><path d="M36 26V9a4 4 0 0 0-7-2.5"/><path d="M25 9h8l-1.5 3.5h-5z"/><path d="M27 16v2M31 16v2M29 20v2"/></svg>',
    rod: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h24"/><path d="M7 7v18c2 1 3-1 5 0s3 1 5 0 3-1 5 0 3 1 3 0V7"/></svg>'
  };

  var STEP_DEFS = [
    { id: "photos", name: "Photos" },
    { id: "type", name: "Type" },
    { id: "size", name: "Size" },
    { id: "walls", name: "Walls" },
    { id: "trim", name: "Trim" },
    { id: "fixture", name: "Fixture" },
    { id: "doors", name: "Door" },
    { id: "seats", name: "Seat" },
    { id: "shelves", name: "Accessories" },
    { id: "construction", name: "Site work" },
    { id: "fullbath", name: "Full Bath" },
    { id: "reveal", name: "See it" },
    { id: "summary", name: "Summary" }
  ];

  function defaultState() {
    return {
      scope: null, type: null, size: { w: "", l: "" }, soakerDepth: null, wallMaterial: null, line: null,
      wallColor: null, puroPattern: null, tubColor: null, tubSize: null,
      trim: "chrome", fixture: null, door: "rod",
      picks: {}, qty: {}, sqft: {}, pieces: {},
      vanitySource: null, vanity: null, vanityColor: null, vanityExtras: {},
      toilet: null, toiletShape: null, toiletHeight: null,
      customer: { name: "", address: "", phone: "" }
    };
  }
  function load() {
    try { var s = JSON.parse(localStorage.getItem(STORE_KEY)); if (s && typeof s === "object") return M.migrate(C, Object.assign(defaultState(), s)); } catch (e) {}
    return null;
  }
  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
      if (ui) {
        if (ui.designId) localStorage.setItem(STORE_KEY + ".designId", ui.designId); else localStorage.removeItem(STORE_KEY + ".designId");
        if (ui.soldPrice) localStorage.setItem(STORE_KEY + ".sold", ui.soldPrice); else localStorage.removeItem(STORE_KEY + ".sold");
      }
    } catch (e) {}
  }

  var state = load() || defaultState();
  var ui = { step: "photos", rep: false, drawer: false, soldPrice: "", pin: "", designId: null, custMode: "save" };
  try { ui.designId = localStorage.getItem(STORE_KEY + ".designId") || null; ui.soldPrice = localStorage.getItem(STORE_KEY + ".sold") || ""; } catch (e) {}
  var lastTotal = null;

  // ---------- helpers ----------
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function money(n) {
    if (NO_PRICE) return "";
    if (n == null || n === "" || !isFinite(Number(n))) return "";
    return "$" + Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
  function line() { return P.findLine(C, state.line); }
  function li(id) { return P.lineItem(C, line(), id); }
  function has(id) { return !!li(id); }
  function star(isStar) { return isStar ? '<span class="star rep-only" title="Subject to change">*</span>' : ""; }
  function repNotes(it) {
    var out = "";
    if (it.sheetLabel && it.label && it.sheetLabel !== it.label) out += '<div class="rep-note">Sheet: ' + esc(it.sheetLabel) + "</div> ";
    if (it.star) out += '<div class="rep-note">* Subject to change</div> ';
    if (it.repNote) out += '<div class="rep-note">' + esc(it.repNote) + "</div>";
    return out;
  }
  // Wall colors allowed with the current wall style (Simulated Tile: only the confirmed colors).
  function simTileOn() { return !!state.picks.premium_wall && has("premium_wall"); }
  function wallColorsAllowed() {
    var ws = C.items.premium_wall && C.items.premium_wall.wallStyle;
    if (simTileOn() && ws) return C.wallColorsStandard.filter(function (c) { return ws.colors.indexOf(c.id) >= 0; });
    return C.wallColorsStandard;
  }
  function normalizeWalls() {
    if (!line() || line().walls === "purostone") return;
    var ok = wallColorsAllowed();
    if (simTileOn() && !ok.some(function (c) { return c.id === state.wallColor; })) state.wallColor = ok[0] ? ok[0].id : null;
  }
  function checkBox() { return '<span class="check">' + ICON.check + "</span>"; }

  function scope() { return Flow.scopeOf(C, state); }
  // Customer facing name: simple type plus size (the sheet system name is for the rep, summary, and printout).
  function customerName() {
    var st = M.sizeStatus(C, state), n = M.typeName(state) || (line() ? line().name : "");
    return st.ok ? n + ", " + st.text : n;
  }
  function sizeOk() { return M.sizeStatus(C, state).ok; }
  function derive() { if (state.type && !state.wallMaterial) state.wallMaterial = "standard"; M.applyDerived(C, state); }
  function stepsForLine() {
    var L = line();
    return Flow.visibleSteps(STEP_DEFS.map(function (s) { return s.id === "fixture" && L && L.id === "s4" ? { id: s.id, name: "Shower head" } : s; }), {
      scope: scope(), hasLine: !!L,
      hasDoors: !!L && (has("standard_door") || has("denali_door") || has("custom_door") || has("frosted_glass")),
      hasSeats: !!L && (has("foot_pedestal") || has("folding_seat") || has("bench_seat"))
    });
  }

  // ---------- rendering ----------
  function render() {
    document.body.classList.toggle("rep", ui.rep);
    normalizeWalls();
    renderTop();
    renderSteps();
    renderPreview();
    renderBody();
    renderSide();
    renderDrawer();
    save();
  }

  function quote() { return Flow.quote(C, P, state); }

  function renderTop() {
    var q = quote();
    var el = $("topTotal");
    el.textContent = money(q.total);
    if (lastTotal !== null && lastTotal !== q.total) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
    lastTotal = q.total;
    var L = line();
    $("topLine").textContent = L ? customerName() : (state.type ? M.typeName(state) : "");
  }

  function renderSteps() {
    var steps = stepsForLine();
    var idx = steps.map(function (s) { return s.id; }).indexOf(ui.step);
    // Many steps: only the current step and its neighbors show their names; the rest are numbered circles.
    var collapsed = steps.length > 9;
    $("stepNav").classList.toggle("collapsed", collapsed);
    $("stepNav").innerHTML = steps.map(function (s, i) {
      var named = !collapsed || Math.abs(i - idx) <= 1;
      var cls = "step-chip" + (s.id === ui.step ? " active" : "") + (i < idx ? " done" : "") + (named ? "" : " mini");
      var dis = (s.id === "size" && !state.type) || (!state.line && s.id !== "type" && s.id !== "size" && s.id !== "photos") ? " disabled" : "";
      return '<button class="' + cls + '" data-act="go" data-step="' + s.id + '" aria-label="Step ' + (i + 1) + ": " + esc(s.name) + '"' + dis + '><span class="num">' + (i + 1) + '</span><span class="lbl">' + esc(s.name) + "</span></button>";
    }).join("") + (collapsed && idx >= 0 ? '<span class="step-count">Step ' + (idx + 1) + " of " + steps.length + "</span>" : "");
    var act = $("stepNav").querySelector(".active");
    if (act && act.scrollIntoView) act.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  function lookChips() {
    var chips = [];
    var L = line();
    if (!L) return "";
    if (L.walls === "purostone" && state.puroPattern) {
      var p = C.puroStonePatterns.filter(function (x) { return x.id === state.puroPattern; })[0];
      if (p) chips.push('<span class="preview-chip">PuroStone ' + esc(p.name) + "</span>");
    } else if (state.wallColor) {
      var c = C.wallColorsStandard.filter(function (x) { return x.id === state.wallColor; })[0];
      if (c) chips.push('<span class="preview-chip"><i style="background:' + c.swatch + '"></i>' + esc(c.name) + (simTileOn() ? " simulated tile" : "") + " walls</span>");
    }
    var t = C.trimFinishes.filter(function (x) { return x.id === state.trim; })[0];
    if (t) chips.push('<span class="preview-chip"><i style="background:' + t.swatch + '"></i>' + esc(t.name) + " trim</span>");
    var d = C.doors.filter(function (x) { return x.id === state.door; })[0];
    if (d && stepsForLine().some(function (s) { return s.id === "doors"; })) chips.push('<span class="preview-chip">' + esc(d.item ? li(d.item).label : d.name) + "</span>");
    return chips.join("");
  }

  function renderPreview() {
    if (ui.step === "photos" || ui.step === "reveal" || ui.step === "type" || ui.step === "size") { $("preview").innerHTML = ""; return; }
    var compact = ui.step === "summary";
    var mp = mainPhoto();
    var icon = mp ? '<div class="preview-photo"><img src="' + mp.url + '" alt="Your bathroom"></div>' : '<div class="preview-icon">' + ICON.bath + "</div>";
    var title = mp ? "Your bathroom" : "Your bathroom preview";
    var sub = mp ? "When your picks are done, tap See it to see them on your own photo." : "Add a photo of your bathroom at the Photos step to see your picks on it.";
    $("preview").innerHTML =
      '<div class="preview' + (compact ? " compact" : "") + '">' + icon +
        '<div><div class="preview-title">' + title + "</div>" +
        '<div class="preview-sub">' + sub + "</div>" +
        (lookChips() ? '<div class="preview-chips">' + lookChips() + "</div>" : "") +
        "</div></div>";
  }

  function head(title, desc) {
    return '<div class="step-head"><div><h1 class="step-title">' + esc(title) + "</h1>" + (desc ? '<div class="step-desc">' + esc(desc) + "</div>" : "") + "</div></div>";
  }

  function toggleRow(it, opts) {
    opts = opts || {};
    var on = opts.on != null ? opts.on : !!state.picks[it.id];
    var act = opts.act || 'data-act="toggle" data-id="' + it.id + '"';
    var hint = opts.hint != null ? opts.hint : (it.hint || "");
    return '<button class="row' + (on ? " on" : "") + (opts.locked ? " locked" : "") + '" ' + act + (opts.locked ? ' aria-disabled="true"' : "") + ">" +
      checkBox() +
      '<div class="r-main"><div class="r-name">' + esc(it.label) + star(it.star) + "</div>" +
      (hint ? '<div class="r-hint">' + esc(hint) + "</div>" : "") + repNotes(it) + "</div>" +
      '<div class="r-price">+' + money(it.price) + "</div></button>";
  }

  function qtyRow(it) {
    var q = Number(state.qty[it.id]) || 0;
    return '<div class="row' + (q ? " on" : "") + '">' +
      '<div class="r-main"><div class="r-name">' + esc(it.label) + star(it.star) + "</div>" +
      '<div class="r-hint">' + money(it.price) + " per" + (it.unitName ? " " + esc(it.unitName) : "") + "</div>" + repNotes(it) + "</div>" +
      '<div class="stepper"><button data-act="qty" data-id="' + it.id + '" data-d="-1"' + (q ? "" : " disabled") + ' aria-label="Less">&minus;</button>' +
      '<span class="q">' + q + '</span><button data-act="qty" data-id="' + it.id + '" data-d="1" aria-label="More">+</button></div>' +
      '<div class="r-sub">' + (q ? money(q * it.price) : "") + "</div></div>";
  }

  function sqftRow(it) {
    var v = state.sqft[it.id] || "";
    var n = Number(v) || 0;
    return '<div class="row' + (n > 0 ? " on" : "") + '" data-sqrow="' + it.id + '">' +
      '<div class="r-main"><div class="r-name">' + esc(it.label) + star(it.star) + "</div>" +
      '<div class="r-hint">' + money(it.price) + " per sq ft</div>" + repNotes(it) + "</div>" +
      '<div class="stepper"><button data-act="sqft" data-id="' + it.id + '" data-d="-5" aria-label="Less">&minus;</button>' +
      '<input type="text" inputmode="decimal" data-sqft="' + it.id + '" value="' + esc(v) + '" placeholder="0" aria-label="Square feet">' +
      '<button data-act="sqft" data-id="' + it.id + '" data-d="5" aria-label="More">+</button></div><span class="unit">sq ft</span>' +
      '<div class="r-sub" data-sqsub="' + it.id + '">' + (n > 0 ? money(n * it.price) : "") + "</div></div>";
  }

  function tile(o) {
    // o: {act, sel, name, sub, price (number|null), included, swatch, swatchClass, swatchHtml, small, extraAttrs}
    var priceHtml = o.priceText != null ? '<div class="t-price' + (o.inc ? " inc" : "") + '">' + o.priceText + "</div>" : "";
    var sw = o.swatch ? '<div class="swatch" style="background:' + o.swatch + '"></div>' : (o.swatchHtml ? '<div class="swatch ' + (o.swatchClass || "") + '">' + o.swatchHtml + "</div>" : "");
    return '<button class="tile' + (o.sel ? " sel" : "") + (o.small ? " small" : "") + (o.off ? " off" : "") + '" ' + o.act + ">" + checkBox() + sw +
      '<div class="t-name">' + o.name + "</div>" + (o.sub ? '<div class="t-sub">' + o.sub + "</div>" : "") + priceHtml + "</button>";
  }

  // ----- steps -----
  function stepType() {
    var h = head("What are we putting in?", "Pick one. Your designer can help you choose.");
    h += '<div class="type-cards">' + M.TYPES.map(function (t) {
      var L = P.findLine(C, t.line);
      var icon = t.id === "shower" ? ICON.bigshower : t.id === "combo" ? ICON.combo : t.id === "soaker" ? ICON.bath : ICON.walkintub;
      return '<button class="type-card' + (state.type === t.id ? " sel" : "") + '" data-act="type" data-val="' + t.id + '">' + checkBox() +
        '<div class="type-icon">' + icon + '</div><div class="type-body"><div class="type-name">' + esc(t.name) + '</div><div class="type-sub">' + esc(t.sub) + "</div>" +
        '<div class="type-price">From ' + money(L.basePrice) + "</div>" +
        '<div class="rep-note">' + esc(TYPE_REP[t.id]) + "</div></div></button>";
    }).join("") + "</div>";
    var sc = scope();
    h += '<div class="section-title">What are we remodeling?</div><div class="scope-tiles">' + Flow.SCOPES.map(function (o) {
      return '<button class="scope-tile' + (sc === o.id ? " sel" : "") + '" data-act="scope" data-val="' + o.id + '">' + checkBox() +
        '<div class="scope-icon">' + (o.id === "full" ? ICON.room : ICON.bath) + '</div><div><div class="t-name">' + esc(o.name) + '</div><div class="t-sub">' + esc(o.sub) + "</div></div></button>";
    }).join("") + "</div>";
    return h;
  }
  var TYPE_REP = {
    shower: "Sheet: S1 Standard () up to a 36x60 pan, S5 Extra Large () over 36x60 up to 48x72, S3 PuroStone () with PuroStone walls.",
    combo: "Sheet: S1 Standard () with standard walls or Sim Tile, tub up to 34x60 (15 in deep); S3 PuroStone () with PuroStone walls, up to 48x72, plus Over 36 x 60 Size * when over 36x60.",
    soaker: "Sheet: S2 19\" Soaker Tubs (), max 34 wide, 60 long. 17, 19 and 21 inch depths are all the same price. With PuroStone walls: S3  plus  soaker = .",
    walkin_tub: "Sheet: S4 Walk-In Tubs (), sizes 28x48, 30x52, 30x53, 32x52, 30x60."
  };

  function adderText(L) {
    var ad = P.systemAdders(C, L, state);
    return ad.length ? " (" + money(L.basePrice) + ad.map(function (x) { return " plus " + money(x.price) + " " + x.label.charAt(0).toLowerCase() + x.label.slice(1); }).join("") + ")" : "";
  }
  function sizeStatusHtml() {
    var st = M.sizeStatus(C, state), L = line();
    if (st.ok && L) {
      var what = state.type === "shower" ? (st.tier === "standard" ? "Standard size walk-in shower" : "Extra large walk-in shower") : state.type === "combo" ? "Fits a tub/shower combo" : state.type === "soaker" ? "Fits a soaker tub" : "Walk-in tub";
      var extra = state.picks.over_36x60 ? '<div class="size-sub">PuroStone over 36 x 60 adds ' + money(li("over_36x60").price) + star(li("over_36x60").star) + "</div>" : "";
      return '<div class="size-status ok">' + ICON.check + '<div><div class="size-main">' + esc(what) + ", " + esc(st.text) + '</div><div class="size-sub">System price ' + money(P.systemPrice(C, L, state)) + adderText(L) + "</div>" + extra +
        '<div class="rep-note">' + esc(L.sheetName) + " (sheet " + esc(L.sheet) + ")</div></div></div>";
    }
    if (st.code === "over") return '<div class="size-status over"><div><div class="size-main">Over max size, talk to your rep</div><div class="size-sub">' + esc(st.message.replace("Over max size, talk to your rep. ", "")) + "</div></div></div>";
    return '<div class="size-status none"><div class="size-sub">' + esc(st.message || "") + "</div></div>";
  }

  function stepSize() {
    var lim = M.limits(C), h;
    if (state.type === "walkin_tub") {
      h = head("Tub size", "Pick the walk-in tub size. This is required.");
      h += '<div class="tiles size-tiles">' + lim.walkInTub.map(function (z) {
        return tile({ act: 'data-act="tubsize" data-val="' + z + '"', sel: state.tubSize === z, name: esc(z.replace("x", " x ")), sub: "inches", small: true });
      }).join("") + tile({ act: 'data-act="tubsize" data-val="other"', sel: state.tubSize === "other", name: "A different size", small: true }) + "</div>";
    } else {
      var shower = state.type === "shower", z = state.size || {}, combo = state.type === "combo", puro = M.wallFor(state) === "purostone";
      h = head(shower ? "Shower size" : "Tub size", shower ? "Measure the shower floor (pan) in inches. This is required." : "Measure the tub space in inches. This is required.");
      h += '<div class="size-card"><label class="size-field"><span>Width</span><input type="text" inputmode="decimal" data-size="w" value="' + esc(z.w) + '" placeholder="0"></label>' +
        '<span class="size-x">x</span><label class="size-field"><span>Length</span><input type="text" inputmode="decimal" data-size="l" value="' + esc(z.l) + '" placeholder="0"></label>' +
        '<span class="size-unit">inches</span></div>';
      h += '<div class="fine">' + (shower ? "Walk-in showers go up to " + lim.xl[1][0] + " x " + lim.xl[1][1] + " inches." :
        combo ? "Tub/shower combo tubs are a standard " + M.COMBO_DEPTH + " inches deep. They go up to " + (puro ? lim.puro[0] + " x " + lim.puro[1] + " inches with PuroStone walls." : lim.comboTub[0] + " inches wide and " + lim.comboTub[1] + " inches long (up to " + lim.puro[0] + " x " + lim.puro[1] + " with PuroStone walls).") :
        "Soaker tubs go up to " + lim.soaker[0] + " inches wide and " + lim.soaker[1] + " inches long.") + "</div>";
      if (combo) h += '<div class="depth-fixed"><span>Tub depth</span><b>' + M.COMBO_DEPTH + ' inches</b><small>Standard depth</small></div>';
      if (state.type === "soaker") {
        h += '<div class="section-title">Tub depth</div><div class="tiles depth-tiles">' + M.SOAKER_DEPTHS.map(function (d) {
          return tile({ act: 'data-act="depth" data-val="' + d.id + '"', sel: String(state.soakerDepth) === d.id, name: esc(d.name), sub: "deep", small: true });
        }).join("") + "</div>";
      }
    }
    h += '<div id="sizeStatus">' + sizeStatusHtml() + "</div>";
    return h;
  }

  function stepWalls() {
    var L = line(), wm = M.wallFor(state), mats = M.WALLS_FOR[state.type] || ["standard"];
    var h = head("Walls", "Pick the wall material, then the color.");
    h += '<div class="section-title">Wall material</div><div class="tiles mat">' + mats.map(function (id) {
      var w = M.WALLS[id], o = { act: 'data-act="wallmat" data-val="' + id + '"', sel: wm === id, name: esc(w.name), sub: esc(w.sub), swatchClass: "icon" };
      var fits = M.systemFor(C, Object.assign({}, state, { wallMaterial: id })).line;
      if (id === "standard") { o.swatchHtml = ICON.panel; o.priceText = "Included"; o.inc = true; }
      if (id === "sim_tile") {
        var pwL = P.lineItem(C, wm === "purostone" ? P.findLine(C, M.systemFor(C, Object.assign({}, state, { wallMaterial: "standard" })).line) : L, "premium_wall");
        o.swatchHtml = ICON.simtile; o.priceText = pwL ? "+" + money(pwL.price) + star(pwL.star) : "";
      }
      if (id === "purostone") {
        var S3 = P.findLine(C, "s3"), big = M.sizeStatus(C, state).tier === "xl";
        o.swatchHtml = ICON.stone; o.priceText = "System price " + money(P.systemPrice(C, S3, state)) + (big ? " plus " + money(S3.prices.over_36x60.price) + " over 36 x 60" : "");
      }
      if (!fits) { o.off = true; o.inc = false; o.act = 'data-act="noop" disabled'; o.priceText = "Too big for this size, talk to your rep"; }
      return tile(o);
    }).join("") + "</div>";
    if (ui.rep) {
      var pw = li("premium_wall");
      h += '<div class="rows" style="margin-top:10px"><div class="callout rep">Wall material sets the sheet system: ' + esc(L.sheetName) + ". " + (pw && wm === "sim_tile" ? repNotes(pw) : "") +
        M.repFlags(state).map(function (f) { return '<div class="rep-note">' + esc(f) + "</div>"; }).join("") + "</div></div>";
    }
    if (L.walls === "purostone") {
      h += '<div class="section-title">PuroStone pattern</div><div class="tiles five">' + C.puroStonePatterns.map(function (p) {
        return tile({ act: 'data-act="set" data-key="puroPattern" data-val="' + p.id + '"', sel: state.puroPattern === p.id, name: esc(p.name), swatchHtml: ICON.stone, swatchClass: "stone", priceText: "Included", inc: true });
      }).join("") + "</div>";
    } else {
      var sim = simTileOn(), colors = wallColorsAllowed();
      h += '<div class="section-title">Wall color' + (sim ? " for Simulated Tile" : "") + '</div><div class="tiles five">' + colors.map(function (c) {
        return tile({ act: 'data-act="set" data-key="wallColor" data-val="' + c.id + '"', sel: state.wallColor === c.id, name: esc(c.name), swatch: c.swatch, priceText: "Included", inc: true });
      }).join("") + "</div>";
      if (sim && ui.rep && C.items.premium_wall.colorNote) h += '<div class="rows" style="margin-top:10px"><div class="callout rep"><div class="rep-note">' + esc(C.items.premium_wall.colorNote) + "</div></div></div>";
    }
    if (L.id === "s4") {
      h += '<div class="section-title">Tub color</div><div class="tiles">' + C.walkInTubColors.map(function (c) {
        return tile({ act: 'data-act="set" data-key="tubColor" data-val="' + c.id + '"', sel: state.tubColor === c.id, name: esc(c.name), swatch: c.swatch, priceText: "Included", inc: true });
      }).join("") + "</div>";
    }
    var ups = [];
    if (has("color_matched")) ups.push(toggleRow(li("color_matched"), { hint: L.wallNote || "" }));
    if (ups.length) h += '<div class="section-title">Wall upgrades</div><div class="rows">' + ups.join("") + "</div>";
    if (L.walls !== "purostone") h += '<div class="fine">Colors on screen are approximate. Please see physical samples.</div>';
    return h;
  }

  function stepTrim() {
    var it = li("premium_trim");
    var h = head("Trim finish", "Chrome is included. Brushed Nickel, Oil Rubbed Bronze, and Matte Black are the Premium Trim Package.");
    h += '<div class="tiles wide">' + C.trimFinishes.map(function (t) {
      return tile({ act: 'data-act="set" data-key="trim" data-val="' + t.id + '"', sel: state.trim === t.id, name: esc(t.name) + (t.included ? "" : star(it && it.star)), sub: t.included ? "" : "Premium Trim Package", swatch: t.swatch, priceText: t.included ? "Included" : "+" + money(it.price), inc: !!t.included });
    }).join("") + "</div>";
    if (it) h += '<div class="rows" style="margin-top:10px">' + (ui.rep ? '<div class="callout rep">' + repNotes(it) + "</div>" : "") + "</div>";
    return h;
  }

  // Walk-in tub (Ian 10/7): only the sheet's Add Shower Option, as No shower / Add Shower cards.
  function stepTubShower() {
    var it = li("add_shower_option"), on = !!state.picks.add_shower_option;
    var h = head("Shower head", "Your walk-in tub comes without a shower. You can add one.");
    h += '<div class="tiles wide tub-shower">' +
      tile({ act: 'data-act="addshower" data-val="0"', sel: !on, name: "No shower", sub: "Tub only", swatchHtml: ICON.walkintub, swatchClass: "icon", priceText: "Included", inc: true }) +
      tile({ act: 'data-act="addshower" data-val="1"', sel: on, name: "Add Shower" + star(it.star), sub: "Adds a shower head to your tub", swatchHtml: HEAD_ICON.standard, swatchClass: "icon", priceText: "+" + money(it.price) }) +
      "</div>";
    if (ui.rep) h += '<div class="rows" style="margin-top:10px"><div class="callout rep">Sheet: ' + esc(it.sheetLabel) + " " + money(it.price) + (it.star ? "*" : "") + " (Walk-In Tubs, Upgrades). The Upgraded Fixture is not offered on walk-in tubs." + repNotes(it) + "</div></div>";
    return h;
  }

  function stepFixture() {
    var L = line(), it = li("upgraded_fixture");
    if (L.id === "s4") return stepTubShower();
    var h = head("Shower fixture", L.hasMoenValve ? "A standard Moen valve is included." : "Choose a fixture upgrade if you like.");
    var tiles = [], fs = C.fixtureStandard;
    if (L.hasMoenValve) tiles.push(tile({ act: 'data-act="set" data-key="fixture" data-val="standard"', sel: state.fixture === "standard" || !state.fixture, name: esc(fs.name), sub: esc(fs.desc), swatchHtml: HEAD_ICON.standard, swatchClass: "icon", priceText: "Included", inc: true }));
    else tiles.push(tile({ act: 'data-act="set" data-key="fixture" data-val="none"', sel: state.fixture === "none" || !state.fixture, name: "No fixture upgrade", swatchHtml: ICON.shower, swatchClass: "icon", priceText: "No charge", inc: true }));
    C.fixtures.forEach(function (f) {
      tiles.push(tile({ act: 'data-act="set" data-key="fixture" data-val="' + f.id + '"', sel: state.fixture === f.id, name: esc(f.name) + star(it.star), sub: esc(f.desc), swatchHtml: HEAD_ICON[f.id] || ICON.shower, swatchClass: "icon", priceText: "+" + money(it.price) }));
    });
    h += '<div class="tiles heads">' + tiles.join("") + "</div>";
    h += '<div class="fine">Each upgraded head is +' + money(it.price) + ".</div>";
    if (ui.rep) h += '<div class="rep-note">Each paid head is the sheet\'s ' + esc(it.sheetLabel) + " (" + money(it.price) + ").</div>";
    return h;
  }

  function stepDoors() {
    var h = head("Door and glass", "A straight or curved rod is included.");
    var tiles = C.doors.filter(function (d) { return d.included || has(d.item); }).map(function (d) {
      if (d.included) return tile({ act: 'data-act="set" data-key="door" data-val="' + d.id + '"', sel: state.door === d.id, name: esc(d.name), swatchHtml: ICON.rod, swatchClass: "icon", priceText: "Included", inc: true });
      var it = li(d.item);
      return tile({ act: 'data-act="set" data-key="door" data-val="' + d.id + '"', sel: state.door === d.id, name: esc(it.label) + star(it.star), sub: esc(it.hint || ""), swatchHtml: ICON.door, swatchClass: "icon", priceText: "+" + money(it.price) });
    });
    h += '<div class="section-title">Door</div><div class="tiles">' + tiles.join("") + "</div>";
    if (ui.rep) {
      var notes = C.doors.filter(function (d) { return d.item && has(d.item); }).map(function (d) { return repNotes(li(d.item)); }).join("");
      if (notes) h += '<div style="margin-top:8px">' + notes + "</div>";
    }
    if (has("frosted_glass")) h += '<div class="section-title">Glass</div><div class="rows">' + toggleRow(li("frosted_glass")) + "</div>";
    return h;
  }

  function stepSeats() {
    var h = head("Seating", "Add a seat or foot pedestal.");
    var rows = ["folding_seat", "bench_seat", "foot_pedestal"].filter(has).map(function (id) { return toggleRow(li(id)); });
    return h + '<div class="rows">' + rows.join("") + "</div>";
  }

  function stepShelves() {
    var L = line();
    var pc = P.pieceCounts(C, L, state);
    var h;
    if (pc) {
      var it = li("add_shelves_gbs");
      h = head("Accessories", "Your system includes " + pc.included + " grab bars or corner shelves in any mix. Each one after that is " + money(it.price) + ".");
      var status = pc.extra > 0
        ? '<span class="pc-badge extra">' + pc.extra + " extra x " + money(it.price) + " = " + money(pc.amount) + "</span>"
        : '<span class="pc-badge free">' + pc.freeLeft + " of " + pc.included + " free left</span>";
      h += '<div class="pc-card"><div class="pc-head"><div><div class="pc-title">' + pc.included + ' included</div><div class="pc-sub">' + pc.total + " selected</div></div>" + status + "</div>";
      h += '<div class="rows">' + pc.parts.map(function (p) {
        return '<div class="row' + (p.count ? " on" : "") + '"><div class="r-main"><div class="r-name">' + esc(p.name) + "</div>" +
          (p.id === "corner_shelves" ? '<div class="r-hint">Color matched</div>' : "") + "</div>" +
          '<div class="stepper"><button data-act="piece" data-id="' + p.id + '" data-d="-1"' + (p.count ? "" : " disabled") + ' aria-label="Less">&minus;</button>' +
          '<span class="q">' + p.count + '</span><button data-act="piece" data-id="' + p.id + '" data-d="1"' + (p.count >= 20 ? " disabled" : "") + ' aria-label="More">+</button></div></div>';
      }).join("") + "</div>" + repNotes(it) + "</div>";
      if (has("metal_shelves")) h += '<div class="section-title">Shelf upgrade</div><div class="rows">' + toggleRow(li("metal_shelves")) + "</div>";
      return h;
    }
    var inc = L.walls === "purostone" ? "2 metal shelves (trim matched)" : "2 corner shelves (color matched)";
    h = head("Accessories", inc + " and 2 grab bars are included. Shelves and grab bars can mix and match to equal 4.");
    var rows = ["metal_shelves", "add_shelves_gbs"].filter(has).map(function (id) { return toggleRow(li(id)); });
    return h + '<div class="rows">' + rows.join("") + "</div>";
  }

  function stepConstruction() {
    var L = line();
    var h = head("Site work", "Items your RepRoom designer notes for your space. Tearout of fiberglass, acrylic, or tile on drywall is included.");
    var ids = Object.keys(L.prices).filter(function (id) { return C.items[id] && C.items[id].group === "construction"; });
    var soffitOn = !!state.picks.soffit && has("soffit");
    h += '<div class="rows">' + ids.map(function (id) {
      var it = li(id);
      if (id === "ceiling_panel" && soffitOn) return toggleRow(it, { on: true, locked: true, act: 'data-act="noop"', hint: "Added with Soffit Removal" });
      if (id === "over_36x60") return toggleRow(it, { on: !!state.picks.over_36x60, locked: true, act: 'data-act="noop"', hint: state.picks.over_36x60 ? "Added because the shower is over 36 x 60" : "Added only when the shower is over 36 x 60" });
      return toggleRow(it);
    }).join("") + "</div>";
    return h;
  }

  function stepFullBath() {
    var fb = C.fullBath;
    var h = head("Full bathroom options", "Vanity, toilet, flooring, and more.");
    h += '<div class="callout rep rep-only" style="margin-bottom:6px">' + esc(fb.repNote) + "</div>";

    // Vanity
    h += '<div class="section-title">Vanity</div><div class="tiles wide">';
    h += tile({ act: 'data-act="vsrc" data-val=""', sel: !state.vanitySource, name: "No vanity", small: true });
    fb.vanity.sources.forEach(function (s) {
      h += tile({ act: 'data-act="vsrc" data-val="' + s.id + '"', sel: state.vanitySource === s.id, name: esc(s.name), sub: esc(s.desc) });
    });
    h += "</div>";
    var src = fb.vanity.sources.filter(function (s) { return s.id === state.vanitySource; })[0];
    if (src) {
      h += '<div class="section-desc" style="margin-top:14px">Vanity width</div><div class="tiles">' + src.sizes.map(function (z) {
        return tile({ act: 'data-act="set" data-key="vanity" data-val="' + z.id + '"', sel: state.vanity === z.id, name: esc(z.sheetLabel), priceText: "+" + money(z.price), small: false });
      }).join("") + "</div>";
      if (src.colors) {
        h += '<div class="section-desc" style="margin-top:14px">Vanity color</div><div class="tiles five">' + src.colors.map(function (c) {
          return tile({ act: 'data-act="set" data-key="vanityColor" data-val="' + c.id + '"', sel: state.vanityColor === c.id, name: esc(c.name), swatch: c.swatch });
        }).join("") + "</div>";
      }
      h += '<div class="rows" style="margin-top:12px">' + src.extras.map(function (e) {
        var it = Object.assign({ label: e.label || e.sheetLabel }, e);
        return toggleRow(it, { on: !!(state.vanityExtras || {})[e.key], act: 'data-act="vx" data-key="' + e.key + '"' });
      }).join("") + "</div>";
    }

    // Toilet
    var t = fb.toilet;
    h += '<div class="section-title">Toilet</div><div class="section-desc">' + esc(t.desc) + '</div><div class="tiles wide">';
    h += tile({ act: 'data-act="set" data-key="toilet" data-val=""', sel: !state.toilet, name: "No toilet", small: true });
    t.options.forEach(function (o) {
      h += tile({ act: 'data-act="set" data-key="toilet" data-val="' + o.id + '"', sel: state.toilet === o.id, name: esc(o.label || o.sheetLabel), priceText: "+" + money(o.price) });
    });
    h += "</div>";
    h += '<div class="rep-note">' + esc(t.repNote) + "</div>";
    if (state.toilet) {
      h += '<div class="cols-2" style="margin-top:12px"><div class="tiles">' + t.shapes.map(function (s) {
        return tile({ act: 'data-act="set" data-key="toiletShape" data-val="' + s + '"', sel: state.toiletShape === s, name: esc(s), small: true });
      }).join("") + '</div><div class="tiles">' + t.heights.map(function (s) {
        return tile({ act: 'data-act="set" data-key="toiletHeight" data-val="' + s + '"', sel: state.toiletHeight === s, name: esc(s), small: true });
      }).join("") + "</div></div>";
    }

    fb.groups.forEach(function (g) {
      h += '<div class="section-title">' + esc(g.name) + "</div>";
      if (g.desc) h += '<div class="section-desc">' + esc(g.desc) + "</div>";
      if (g.repNote) h += '<div class="rep-note" style="margin:0 2px 10px">' + esc(g.repNote) + "</div>";
      h += '<div class="rows">' + g.items.map(function (it) {
        var x = Object.assign({ label: it.label || it.sheetLabel }, it);
        if (it.type === "per") return qtyRow(x);
        if (it.type === "sqft") return sqftRow(x);
        return toggleRow(x);
      }).join("") + "</div>";
    });
    return h;
  }

  function lookRows() {
    var L = line(), rows = [];
    var zs = M.sizeStatus(C, state);
    if (L.id !== "s4" || state.type !== "walkin_tub") rows.push([state.type === "shower" ? "Shower size" : "Tub size", zs.ok ? zs.text : "Not entered"]);
    if (L.walls === "purostone") {
      var p = C.puroStonePatterns.filter(function (x) { return x.id === state.puroPattern; })[0];
      rows.push(["PuroStone wall pattern", p ? p.name : "Not chosen yet"]);
    } else {
      var c = C.wallColorsStandard.filter(function (x) { return x.id === state.wallColor; })[0];
      if (simTileOn()) rows.push(["Wall style", C.items.premium_wall.wallStyle.name, false]);
      rows.push(["Wall color", c ? c.name : "Not chosen yet"]);
    }
    if (L.id === "s4") {
      var tc = C.walkInTubColors.filter(function (x) { return x.id === state.tubColor; })[0];
      rows.push(["Tub color", tc ? tc.name : "Not chosen yet"]);
      rows.push(["Tub size", zs.ok ? zs.text : (state.tubSize || "Not chosen yet")]);
    }
    var t = C.trimFinishes.filter(function (x) { return x.id === state.trim; })[0];
    rows.push(["Trim finish", t ? t.name : "Chrome", !t || !!t.included]);
    var f = C.fixtures.filter(function (x) { return x.id === state.fixture; })[0];
    if (L.id === "s4") rows.push(["Shower head", state.picks.add_shower_option ? "Add Shower" : "No shower", !state.picks.add_shower_option]);
    else rows.push(["Fixture", f ? f.name : (L.hasMoenValve ? C.fixtureStandard.name : "No fixture upgrade"), !f]);
    if (stepsForLine().some(function (s) { return s.id === "doors"; })) {
      var d = C.doors.filter(function (x) { return x.id === state.door; })[0];
      rows.push(["Door", d && d.item ? li(d.item).label : "Straight / Curved Rod", !(d && d.item)]);
    }
    var pc = P.pieceCounts(C, L, state);
    if (pc) rows.push(["Grab bars and shelves", pc.detail + " (" + pc.total + ")", pc.extra === 0]);
    return rows;
  }

  // Customer facing name, detail, and quantity text for a quote row (summary screen and printout).
  function itemDisplay(r) {
    var name = r.section === "Full Bathroom Options" && /^Vanity/.test(r.group || "") ? r.group.replace("Vanity, ", "Vanity (") + "): " + r.label : r.label;
    var qty = r.unit === "per" ? r.qty + " x " + money(r.unitPrice) : r.unit === "sqft" ? r.qty + " sq ft x " + money(r.unitPrice) : "";
    var detail = r.detail || "";
    if (r.auto) detail = detail ? detail : "Required";
    return { name: name, detail: detail, qty: qty, amount: r.amount };
  }
  var SECTION_NAMES = { "Upgrades": "Upgrades", "Construction options": "Site work", "Full Bathroom Options": "Full Bathroom Options" };

  function stepSummary() {
    var q = quote(), L = line();
    var h = '<div class="step-head"><div><h1 class="step-title">Your bathroom summary</h1><div class="step-desc">Itemized from the RepRoom option list.</div></div>' +
      '<div class="head-actions"><button class="btn brass" data-act="save-design">Save this design</button></div></div>';
    if (state.customer && state.customer.name) h += '<div class="cust-line">Prepared for <b>' + esc(state.customer.name) + "</b>" + (ui.designId ? ' <span class="saved-pill">Saved</span>' : "") + "</div>";
    h += '<div class="summary">';
    var base = q.rows[0];
    h += '<div class="sum-sec">System</div>' + sumRow(base.label, "", base.amount, Object.assign({}, base, { detail: customerName() }));
    q.rows.filter(function (r) { return r.isAdder; }).forEach(function (r) { h += sumRow(r.label, "", r.amount, Object.assign({}, r, { repNote: ui.rep ? r.repNote : "" })); });
    h += '<div class="sum-sec">Your look</div>' + lookRows().map(function (r) { var inc = r[2] !== false; return '<div class="sum-row"><div class="n">' + esc(r[0]) + "<small>" + esc(r[1]) + '</small></div><div class="a' + (inc ? " inc" : " up") + '">' + (inc ? "Included" : "Priced below") + "</div></div>"; }).join("");
    ["Upgrades", "Construction options", "Full Bathroom Options"].forEach(function (sec) {
      var rs = q.rows.filter(function (r) { return r.section === sec; });
      if (!rs.length) return;
      h += '<div class="sum-sec">' + SECTION_NAMES[sec] + "</div>";
      rs.forEach(function (r) {
        var d = itemDisplay(r);
        h += sumRow(d.name, d.qty, r.amount, r);
      });
    });
    h += '<div class="sum-sec">Included with your system</div>' + L.includes.map(function (s) { return '<div class="sum-row"><div class="n">' + esc(s) + '</div><div class="a inc">Included</div></div>'; }).join("");
    h += '<div class="sum-total"><span>Total</span><strong>' + money(q.total) + "</strong></div>";
    if (q.stars.length) h += '<div class="rep-note">* ' + q.stars.length + " starred item(s) in this quote are subject to change. " + esc(C.meta.starNote) + "</div>";
    h += "</div>";
    return h;
  }
  function sumRow(name, qty, amount, r) {
    var detail = r.detail ? "<small>" + esc(r.detail) + "</small>" : "";
    var auto = r.auto ? "<small>Required</small>" : "";
    var sheet = r.sheetLabel && r.sheetLabel !== r.label && !r.isBase ? '<div class="rep-note">Sheet: ' + esc(r.sheetLabel) + "</div>" : "";
    var note = r.repNote ? '<div class="rep-note">' + esc(r.repNote) + "</div>" : "";
    return '<div class="sum-row"><div class="n">' + esc(name) + star(r.star) + detail + auto + sheet + note + '</div><div class="q">' + esc(qty) + '</div><div class="a">' + money(r.amount) + "</div></div>";
  }

  // ---------- photos of the current bathroom (kept on this iPad only) ----------
  var MAX_PHOTOS = 3;
  var photos = [];   // { id, blob, w, h, main, addedAt, url }
  var ai = { status: "unknown", busy: false, error: null, after: null };
  ui.aiView = "side"; ui.aiSlider = 50; ui.photoBusy = false;

  function withUrl(p) { p.url = URL.createObjectURL(p.blob); return p; }
  function bare(p) { return { id: p.id, blob: p.blob, w: p.w, h: p.h, main: !!p.main, addedAt: p.addedAt }; }
  function mainPhoto() { return photos.filter(function (p) { return p.main; })[0] || photos[0] || null; }
  function ensureMain() {
    if (photos.length && !photos.some(function (p) { return p.main; })) { photos[0].main = true; PhotoStore.putPhoto(bare(photos[0])); }
  }
  function loadPhotos() {
    if (!window.PhotoStore) return;
    PhotoStore.listPhotos().then(function (list) {
      photos = (list || []).filter(function (p) { return p && p.blob; }).slice(0, MAX_PHOTOS).map(withUrl);
      ensureMain();
      return PhotoStore.getPreview();
    }).then(function (pv) {
      if (pv && pv.blob) ai.after = { blob: pv.blob, url: URL.createObjectURL(pv.blob), key: pv.key, photoId: pv.photoId };
      render();
    }).catch(function () {});
  }
  function addPhotos(files, retakeId) {
    var old = retakeId ? photos.filter(function (p) { return p.id === retakeId; })[0] : null;
    var room = old ? 1 : MAX_PHOTOS - photos.length;
    if (room <= 0) { toast("Three photos is the most. Remove one to add another."); return; }
    var list = files.slice(0, room);
    if (files.length > room) toast("Only " + MAX_PHOTOS + " photos fit. Kept the first " + room + ".");
    ui.photoBusy = true; render();
    var chain = Promise.resolve();
    list.forEach(function (f) {
      chain = chain.then(function () { return PhotoUtils.downscale(f); }).then(function (r) {
        var rec = { id: old ? old.id : "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), blob: r.blob, w: r.w, h: r.h,
          main: old ? !!old.main : !photos.length, addedAt: old ? old.addedAt : Date.now() };
        if (old) {
          URL.revokeObjectURL(old.url);
          photos = photos.map(function (p) { return p.id === old.id ? withUrl(rec) : p; });
          if (ai.after && ai.after.photoId === old.id) clearAfter();
        } else photos.push(withUrl(rec));
        return PhotoStore.putPhoto(bare(rec));
      });
    });
    chain.catch(function (e) { toast(e && e.message ? e.message : "Could not add that photo."); })
      .then(function () { ui.photoBusy = false; ensureMain(); render(); });
  }
  function removePhoto(id) {
    var p = photos.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    URL.revokeObjectURL(p.url);
    photos = photos.filter(function (x) { return x.id !== id; });
    PhotoStore.removePhoto(id);
    if (ai.after && ai.after.photoId === id) clearAfter();
    ensureMain();
    render();
  }
  function setMainPhoto(id) {
    photos.forEach(function (p) { var was = !!p.main; p.main = p.id === id; if (was !== p.main) PhotoStore.putPhoto(bare(p)); });
    render();
  }
  function clearAfter() {
    if (ai.after) URL.revokeObjectURL(ai.after.url);
    ai.after = null; ai.error = null;
    if (window.PhotoStore) PhotoStore.clearPreview();
  }
  function clearPhotos() {
    photos.forEach(function (p) { URL.revokeObjectURL(p.url); });
    photos = [];
    clearAfter();
    if (window.PhotoStore) PhotoStore.clearAll();
  }

  function photoInput(label, icon, opts) {
    return '<label class="photo-pick">' + icon + "<span>" + label + "</span>" +
      '<input type="file" accept="image/*" data-photo-input' + (opts.camera ? ' capture="environment"' : "") + (opts.multiple ? " multiple" : "") +
      (opts.retake ? ' data-retake="' + opts.retake + '"' : "") + "></label>";
  }

  // Photo instructions (Ian approved 10/7, customer facing, keep wording exactly)
  var PHOTO_STEPS = [
    "Turn on all the lights and open the shower curtain or door.",
    "Hold the device sideways and stand in the doorway, so the whole tub or shower fits in the shot.",
    "Take one straight on, then one from each corner if you can.",
    "Move towels, bath mats, and bottles out of the way.",
    "Keep the device level and steady, with no zooming in."
  ];

  function stepPhotos() {
    var h = head("Photos of your bathroom", "Take 2 or 3 photos so we can show your new bathroom on your own photo. You can skip this.");
    h += '<div class="photo-tip">' + ICON.camera + '<ol class="photo-steps">' + PHOTO_STEPS.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ol></div>";
    h += '<div class="photo-grid">';
    for (var i = 0; i < MAX_PHOTOS; i++) {
      var p = photos[i];
      if (p) {
        h += '<div class="photo-card' + (p.main ? " main" : "") + '"><div class="photo-img"><img src="' + p.url + '" alt="Bathroom photo ' + (i + 1) + '">' +
          (p.main ? '<span class="photo-badge">Main photo</span>' : "") + "</div>" +
          '<div class="photo-actions">' +
          (p.main ? '<div class="photo-main-note">The new bathroom is shown from this angle</div>' : '<button class="btn ghost photo-btn wide" data-act="photo-main" data-id="' + p.id + '">Use as main photo</button>') +
          '<div class="btns">' +
          '<label class="btn ghost photo-btn">Retake<input type="file" accept="image/*" data-photo-input data-retake="' + p.id + '"></label>' +
          '<button class="btn ghost photo-btn" data-act="photo-remove" data-id="' + p.id + '">Remove</button></div></div></div>';
      } else {
        var first = i === photos.length;
        h += '<div class="photo-card empty' + (first ? " next" : "") + '"><div class="photo-slot-label">' + (i === 0 ? "Main photo" : "Photo " + (i + 1) + " (optional)") + "</div>" +
          (first ? photoInput("Take a photo", ICON.camera, { camera: true }) + photoInput("Choose from photos", ICON.library, { multiple: true }) : '<div class="photo-empty-note">Add the photos before this one first</div>') +
          "</div>";
      }
    }
    h += "</div>";
    if (ui.photoBusy) h += '<div class="photo-busy"><span class="spinner"></span>Getting your photo ready</div>';
    h += '<div class="fine">Photos stay on this device. They are only sent out to make the picture when you tap Show my new bathroom. Start over clears them.</div>';
    return h;
  }

  // ---------- See my new bathroom ----------
  function previewRequestParts() {
    var mp = mainPhoto();
    var others = photos.filter(function (p) { return mp && p.id !== mp.id; });
    var full = scope() === "full";
    var eff = Flow.effectiveState(C, state);
    var showerPrompt = "", roomPrompt = null;
    if (window.PreviewPrompt && state.line) {
      showerPrompt = PreviewPrompt.buildShowerPrompt(PreviewPrompt.previewOptionsFromState(C, eff), [], others.length);
      if (full) {
        var ro = PreviewPrompt.roomOptionsFromState(C, eff);
        if (PreviewPrompt.hasRoomChanges(ro)) roomPrompt = PreviewPrompt.buildRoomPrompt(ro);
      }
    }
    var ordered = mp ? [mp].concat(others) : [];
    return { prompt: showerPrompt, showerPrompt: showerPrompt, roomPrompt: roomPrompt, photos: ordered, ratio: mp ? PhotoUtils.nearestRatio(mp.w, mp.h) : null,
      key: showerPrompt + "|" + (roomPrompt || "") + "|" + ordered.map(function (p) { return p.id; }).join(",") };
  }
  function readJson(res) {
    var ct = res.headers.get("Content-Type") || "";
    if (ct.indexOf("json") < 0) return Promise.resolve(null);
    return res.json().catch(function () { return null; });
  }
  function checkAi() {
    if (ai.status !== "unknown") return;
    ai.status = "checking";
    fetch("api/preview", { method: "GET", credentials: "same-origin", headers: { Accept: "application/json" } }).then(function (res) {
      return readJson(res).then(function (j) {
        if (res.ok && j && j.configured) ai.status = "on";
        else if (j && j.error === "ai_not_configured") ai.status = "off";
        else if (j && j.error === "login_required") ai.status = "login";
        else ai.status = "unavailable";
      });
    }).catch(function () { ai.status = "unavailable"; }).then(function () { if (ui.step === "reveal") render(); });
  }
  function findImage(j) {
    if (j && j.output_image && j.output_image.data) return j.output_image;
    var found = null;
    ((j && j.steps) || []).forEach(function (st) {
      if (st.type === "thought") return; // interim thinking pictures are not the answer
      (st.content || []).forEach(function (c) { if (c && c.type === "image" && c.data) found = c; });
      if (st.type === "image" && st.data) found = st;
    });
    ((j && j.outputs) || []).forEach(function (o) { if (o && o.type === "image" && o.data) found = o; });
    return found;
  }
  function b64ToBlob(b64, mime) {
    var bin = atob(b64), arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime || "image/jpeg" });
  }
  // One AI call through /api/preview. Resolves to { data, mime_type } or rejects with { code, message }.
  function callPreview(body) {
    return fetch("api/preview", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body) })
      .catch(function () { throw { code: "offline", message: "No connection. Check the internet and try again." }; })
      .then(function (res) {
        return readJson(res).then(function (j) {
          if (!res.ok || !j) throw { code: (j && j.error) || "failed", message: (j && j.message) || "The picture could not be made. Try again." };
          var img = findImage(j);
          if (!img) throw { code: "no_image", message: "The AI did not send back a picture. Try again." };
          return { data: img.data, mime_type: img.mime_type || "image/jpeg" };
        });
      });
  }
  function setAfter(img, parts, partial) {
    var blob = b64ToBlob(img.data, img.mime_type);
    if (ai.after) URL.revokeObjectURL(ai.after.url);
    ai.after = { blob: blob, url: URL.createObjectURL(blob), key: partial ? "partial" : parts.key, photoId: parts.photos[0].id };
    PhotoStore.setPreview({ blob: blob, key: ai.after.key, photoId: parts.photos[0].id, addedAt: Date.now() });
  }
  // Shower only: one pass. Full bathroom: pass 1 designs the shower on the main photo, pass 2 takes that picture
  // and designs the rest of the room while keeping the new shower. Two separate calls (not one long server call)
  // keep each Cloudflare Function a thin pass through on the free plan and let the iPad show real progress.
  function makePreview() {
    if (ai.busy || ai.status !== "on" || !photos.length || !state.line) return;
    var parts = previewRequestParts();
    var twoPass = !!parts.roomPrompt;
    ai.busy = true; ai.error = null; ai.phase = "shower"; ai.twoPass = twoPass; clearInterim(); render();
    Promise.all(parts.photos.map(function (p) { return PhotoUtils.blobToBase64(p.blob); })).then(function (datas) {
      return callPreview({ pass: "shower", prompt: parts.showerPrompt, aspect_ratio: parts.ratio, images: datas.map(function (d) { return { mime_type: "image/jpeg", data: d }; }) });
    }).then(function (shower) {
      if (!twoPass) { setAfter(shower, parts, false); return; }
      ai.phase = "room";
      var b = b64ToBlob(shower.data, shower.mime_type);
      ai.interim = { url: URL.createObjectURL(b) };
      render();
      return callPreview({ pass: "room", prompt: parts.roomPrompt, aspect_ratio: parts.ratio, images: [shower] }).then(function (room) {
        setAfter(room, parts, false);
      }, function (e) {
        setAfter(shower, parts, true);
        if (e && (e.code === "ai_not_configured" || e.code === "login_required")) throw e;
        ai.error = "The shower is done, but the rest of the bathroom could not be made. " + ((e && e.message) || "Try again.");
      });
    }).catch(function (e) {
      if (e && e.code === "ai_not_configured") ai.status = "off";
      else if (e && e.code === "login_required") ai.status = "login";
      else ai.error = (e && e.message) || "The picture could not be made. Try again.";
    }).then(function () { ai.busy = false; ai.phase = null; clearInterim(); render(); });
  }
  function clearInterim() { if (ai.interim) URL.revokeObjectURL(ai.interim.url); ai.interim = null; }

  function revealPicks() {
    var L = line(), q = quote();
    var rows = [["System", customerName()]].concat(lookRows().map(function (r) { return [r[0], r[1]]; }));
    var skip = { premium_trim: 1, upgraded_fixture: 1, standard_door: 1, denali_door: 1, custom_door: 1, premium_wall: 1, add_shelves_gbs: 1 };
    q.rows.filter(function (r) { return r.section === "Upgrades" && !skip[r.id]; }).forEach(function (r) { rows.push(["Added", r.label]); });
    if (scope() === "full") {
      var fbRows = q.rows.filter(function (r) { return r.section === "Full Bathroom Options"; });
      if (!fbRows.length) rows.push(["Rest of the room", "No changes picked yet"]);
      fbRows.forEach(function (r) { var d = itemDisplay(r); rows.push(["Rest of the room", d.name + (d.detail ? " (" + d.detail + ")" : "")]); });
    } else rows.push(["Rest of the room", "Stays as it is"]);
    return '<div class="sum-sec">Your picks</div>' + rows.map(function (r) {
      return '<div class="sum-row"><div class="n">' + esc(r[0]) + "</div><div class=\"pv\">" + esc(r[1]) + "</div></div>";
    }).join("");
  }

  function afterPanel() {
    var stale = ai.after && ai.after.key !== "partial" && ai.after.key !== previewRequestParts().key;
    if (ai.busy) {
      var room = ai.phase === "room";
      var stepTxt = ai.twoPass ? '<div class="ba-step">Step ' + (room ? 2 : 1) + " of 2</div>" : "";
      return (room && ai.interim ? '<img class="ba-interim" src="' + ai.interim.url + '" alt="">' : "") +
        '<div class="ba-empty' + (room && ai.interim ? " over" : "") + '"><span class="spinner big"></span>' + stepTxt +
        '<div class="ba-empty-title">' + (room ? "Designing the rest of the bathroom" : "Designing the shower") + "</div>" +
        '<div class="ba-empty-sub">' + (ai.twoPass ? (room ? "Vanity, toilet, floor, and more. About half a minute." : "Then the rest of the bathroom. About a minute in all.") : "This takes about half a minute.") + "</div></div>";
    }
    if (ai.after) return '<img src="' + ai.after.url + '" alt="Your new bathroom">' + (stale ? '<div class="ba-stale">Your picks changed. Tap Show my new bathroom to update.</div>' : "");
    var t, sub, extra = "";
    if (ai.status === "off") { t = "Your new bathroom picture is coming soon"; sub = "AI preview turns on once the key is added."; }
    else if (ai.status === "login") { t = "Please sign in again"; sub = "Your sign in ran out."; extra = '<a class="btn ghost ba-btn" href="./">Sign in</a>'; }
    else if (ai.status === "unavailable") { t = "AI preview is not available here"; sub = "It needs the RepRoom site and an internet connection."; extra = '<button class="btn ghost ba-btn" data-act="ai-recheck">Try again</button>'; }
    else if (ai.status === "checking" || ai.status === "unknown") { t = "Getting the AI preview ready"; sub = ""; }
    else if (ai.error) { t = "That did not work"; sub = ai.error; }
    else { t = "Your new bathroom shows here"; sub = "Tap Show my new bathroom."; }
    return '<div class="ba-empty"><div class="ba-empty-icon">' + ICON.spark + '</div><div class="ba-empty-title">' + esc(t) + "</div>" + (sub ? '<div class="ba-empty-sub">' + esc(sub) + "</div>" : "") + extra + "</div>";
  }

  function stepReveal() {
    var mp = mainPhoto();
    var can = ai.status === "on" && !ai.busy && !!mp;
    var label = ai.after ? "Make another version" : "Show my new bathroom";
    var h = '<div class="step-head"><div><h1 class="step-title">See your new bathroom</h1><div class="step-desc">' + (scope() === "full" ? "Full bathroom: we design the shower first, then the rest of the room." : "Shower only: just the tub or shower area changes.") + "</div></div>" +
      (mp ? '<div class="head-actions"><button class="btn brass" data-act="ai-make"' + (can ? "" : " disabled") + ">" + label + "</button></div>" : "") + "</div>";
    if (!mp) {
      h += '<div class="ba-nophoto">' + ICON.camera + '<div><div class="ba-empty-title">Add a photo of your bathroom</div><div class="ba-empty-sub">Take a photo from the doorway and we will show your picks on it.</div></div>' +
        '<button class="btn primary" style="flex:0 0 auto;padding:0 26px" data-act="go" data-step="photos">Add photos</button></div>';
    } else {
      if (ai.after && !ai.busy) {
        h += '<div class="seg ba-seg"><button data-act="ai-view" data-val="side" class="' + (ui.aiView !== "slider" ? "on" : "") + '">Side by side</button>' +
          '<button data-act="ai-view" data-val="slider" class="' + (ui.aiView === "slider" ? "on" : "") + '">Slider</button></div>';
      }
      if (ai.after && !ai.busy && ui.aiView === "slider") {
        var v = ui.aiSlider;
        h += '<div class="ba-slider" id="aiSliderBox" role="slider" aria-label="Drag to compare now and new" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + v + '"><img src="' + mp.url + '" alt="Your bathroom now">' +
          '<div class="ba-after" id="aiAfterClip" style="clip-path:inset(0 ' + (100 - v) + '% 0 0)"><img src="' + ai.after.url + '" alt="Your new bathroom"></div>' +
          '<div class="ba-handle" id="aiHandle" style="left:' + v + '%"><span></span></div>' +
          '<span class="ba-tag left">New</span><span class="ba-tag right">Now</span>' +
          "</div>";
      } else {
        h += '<div class="ba-pair"><figure class="ba-pane"><div class="ba-frame"><img src="' + mp.url + '" alt="Your bathroom now"></div><figcaption>Now</figcaption></figure>' +
          '<figure class="ba-pane"><div class="ba-frame after">' + afterPanel() + "</div><figcaption>New</figcaption></figure></div>";
      }
      if (ai.after && ai.error && !ai.busy) h += '<div class="ba-error">' + esc(ai.error) + "</div>";
      if (ai.after) h += '<div class="fine">Picture made by computer from your photo. Colors and details are approximate. Please see physical samples.</div>';
    }
    h += '<div class="summary ba-picks">' + revealPicks() + "</div>";
    return h;
  }

  var STEP_RENDER = { photos: stepPhotos, reveal: stepReveal, type: stepType, size: stepSize, walls: stepWalls, trim: stepTrim, fixture: stepFixture, doors: stepDoors, seats: stepSeats, shelves: stepShelves, construction: stepConstruction, fullbath: stepFullBath, summary: stepSummary };

  function renderBody() {
    if (!state.line && ["photos", "type", "size"].indexOf(ui.step) < 0) ui.step = state.type ? "size" : "type";
    if (ui.step === "size" && !state.type) ui.step = "type";
    if (!stepsForLine().some(function (s) { return s.id === ui.step; })) ui.step = "type";
    if (ui.step === "reveal") checkAi();
    var sc = $("stageScroll"), top = sc.scrollTop, same = sc.getAttribute("data-step") === ui.step;
    $("stepBody").innerHTML = STEP_RENDER[ui.step]();
    sc.setAttribute("data-step", ui.step);
    sc.scrollTop = same ? top : 0;
  }

  function sideWaitText() {
    var c = M.sizeStatus(C, state).code;
    return c === "over" ? "Over max size, talk to your rep." : "Enter the size to see your price.";
  }
  function canGoNext() {
    if (ui.step === "photos") return true;
    if (ui.step === "type") return !!state.type;
    if (ui.step === "size") return sizeOk() && !!state.line;
    return !!state.line;
  }
  function renderSide() {
    var q = quote(), L = line();
    var steps = stepsForLine(), i = steps.map(function (s) { return s.id; }).indexOf(ui.step);
    var next = steps[i + 1], prev = steps[i - 1];
    var h = '<div class="side-head"><div class="side-kicker">Your selections</div><div class="side-line">' + (L ? esc(customerName()) : state.type ? esc(M.typeName(state)) : "Pick a type to begin") + "</div></div>";
    h += '<div class="side-list">';
    if (!L) h += '<div class="side-empty">' + (state.type ? sideWaitText() : "Pick a walk-in shower, soaker tub, or walk-in tub. Your total updates with every choice.") + "</div>";
    else {
      var rows = q.rows.slice(1).filter(function (r) { return !r.isAdder; });
      h += '<div class="side-row"><div class="n">System price' + (ui.rep ? "<small>" + esc(L.name) + adderText(L) + "</small>" : "") + '</div><div class="a">' + money(P.systemPrice(C, L, state)) + "</div></div>";
      if (!rows.length) h += '<div class="side-empty">No add-ons yet.</div>';
      rows.forEach(function (r) {
        var sub = r.pieces ? r.detail + ", " + r.qty + " extra x " + money(r.unitPrice) : r.unit === "per" ? r.qty + " x " + money(r.unitPrice) : r.unit === "sqft" ? r.qty + " sq ft" : (r.detail || "");
        h += '<div class="side-row"><div class="n">' + esc(r.label) + star(r.star) + (sub ? "<small>" + esc(sub) + "</small>" : "") + '</div><div class="a">' + money(r.amount) + "</div></div>";
      });
    }
    h += "</div>";
    h += '<div class="side-foot"><div class="side-total"><span>Total</span><strong>' + money(q.total) + "</strong></div>";
    if (ui.step === "summary") {
      h += '<div class="btns"><button class="btn ghost" data-act="back">Back</button><button class="btn brass" data-act="save-design">Save this design</button></div>';
    } else {
      h += '<div class="btns">' + (prev ? '<button class="btn ghost" data-act="back">Back</button>' : "") +
        '<button class="btn primary" data-act="next"' + (canGoNext() ? "" : " disabled") + ">" +
        (ui.step === "photos" && !photos.length ? "Skip photos" : next ? (next.id === "summary" ? "See summary" : next.id === "reveal" ? "Next: See it" : "Next: " + next.name) : "Done") + "</button></div>";
    }
    h += '<div class="side-tools"><button class="link-btn" data-act="reset">Start over</button><button class="link-btn" data-act="saved-open">Saved designs</button><button class="lock-btn" data-act="lock" aria-label="Rep view">' + ICON.lock + "</button></div></div>";
    $("side").innerHTML = h;
  }

  function soldStatusHtml(q) {
    var floor = P.floorFor(C, q.total);
    var raw = String(ui.soldPrice || "").replace(/[$,\s]/g, "");
    var sold = Number(raw);
    if (!raw || !isFinite(sold) || sold <= 0) return '<div class="status none">Enter a sold price to compare it with the floor.</div>';
    var diff = Math.round((sold - floor) * 100) / 100;
    var pct = P.dealRecord(C, Flow.effectiveState(C, state), { soldPrice: raw }).percent_of_retail;
    var pctTxt = pct !== "" ? " (" + pct + "% of retail)" : "";
    if (diff >= 0) return '<div class="status ok">At or above the floor by ' + money(diff) + pctTxt + ". Full commission.</div>";
    return '<div class="status bad">Below the 95% line by ' + money(-diff) + pctTxt + ". Commission may drop to 5%.</div>";
  }

  function renderDrawer() {
    var d = $("repDrawer"), s = $("scrim");
    d.hidden = !(ui.rep && ui.drawer);
    s.hidden = d.hidden;
    if (d.hidden) return;
    var q = quote();
    var floor = P.floorFor(C, q.total);
    var notes = [];
    q.rows.forEach(function (r) { if (r.repNote) notes.push("<li><b>" + esc(r.sheetLabel) + ":</b> " + esc(r.repNote) + "</li>"); });
    M.repFlags(state).forEach(function (f) { notes.push("<li><b>Pricing:</b> " + esc(f) + "</li>"); });
    if (q.rows.some(function (r) { return r.section === "Full Bathroom Options"; })) notes.push("<li><b>Full bath:</b> " + esc(C.fullBath.repNote) + "</li>");
    var h = '<div class="drawer-head"><div><h2>Rep view</h2><small>Not for the customer</small></div><button class="btn ghost" style="flex:0 0 auto;height:44px;padding:0 16px" data-act="drawer-close">Close</button></div>';
    h += '<div class="drawer-body">';
    h += '<div class="kv big"><span>Retail total</span><strong>' + money(q.total) + "</strong></div>";
    h += '<div class="kv"><span>95% floor</span><strong>' + money(floor, true) + "</strong></div>";
    h += '<div class="sold"><label for="soldInput">Sold price (optional)</label><div class="sold-input"><span>$</span><input id="soldInput" type="text" inputmode="decimal" placeholder="0" value="' + esc(ui.soldPrice) + '"></div><div id="soldStatus">' + soldStatusHtml(q) + "</div></div>";
    h += "<h3>Deal record</h3>";
    h += '<div class="fine" style="margin:0 0 10px">Customer: <b>' + (state.customer && state.customer.name ? esc(state.customer.name) : "not entered yet") + "</b></div>";
    h += '<button class="btn brass" style="width:100%" data-act="export">Export deal record</button>';
    h += '<div class="fine">Downloads a JSON file and a one row CSV: sign_date (blank), customer, product, line_items, retail_total, sold_price, percent_of_retail, above_95_floor.</div>';
    h += "<h3>Subject to change (*)</h3>";
    h += q.stars.length ? '<ul class="note-list">' + q.stars.map(function (r) { return "<li>" + esc(r.sheetLabel) + " <b>" + money(r.unitPrice) + "</b></li>"; }).join("") + "</ul><div class=\"fine\">" + esc(C.meta.starNote) + "</div>" : '<div class="fine">No starred items in this quote.</div>';
    h += "<h3>Sheet notes for this quote</h3>";
    h += notes.length ? '<ul class="note-list">' + notes.join("") + "</ul>" : '<div class="fine">None.</div>';
    h += "</div>";
    h += '<div class="drawer-foot"><button class="btn ghost" style="flex:1" data-act="rep-exit">Exit rep view</button><button class="btn primary" data-act="drawer-close">Back to picks</button></div>';
    d.innerHTML = h;
  }

  function updateTotalsOnly() {
    renderTop();
    renderSide();
    renderPreview();
    if (ui.rep && ui.drawer) {
      var st = $("soldStatus");
      if (st) st.innerHTML = soldStatusHtml(quote());
    }
    save();
  }

  // ---------- saving, printing, export ----------
  function loadDesigns() {
    try { var a = JSON.parse(localStorage.getItem(DESIGNS_KEY)); return Array.isArray(a) ? a : []; } catch (e) { return []; }
  }
  function storeDesigns(list) { try { localStorage.setItem(DESIGNS_KEY, JSON.stringify(list)); return true; } catch (e) { return false; } }

  function saveDesign() {
    var list = loadDesigns(), q = quote(), now = new Date().toISOString();
    var rec = list.filter(function (d) { return d.id === ui.designId; })[0];
    if (!rec) { rec = { id: "d" + Date.now().toString(36), createdAt: now }; list.unshift(rec); ui.designId = rec.id; }
    rec.savedAt = now;
    rec.customer = Object.assign({}, state.customer);
    rec.product = q.line ? q.line.name : "";
    rec.total = q.total;
    rec.state = JSON.parse(JSON.stringify(state));
    rec.soldPrice = ui.soldPrice || "";
    var ok = storeDesigns(list);
    save();
    return ok;
  }

  function openDesign(id) {
    var rec = loadDesigns().filter(function (d) { return d.id === id; })[0];
    if (!rec) return;
    state = M.migrate(C, Object.assign(defaultState(), JSON.parse(JSON.stringify(rec.state))));
    ui.designId = rec.id;
    ui.soldPrice = rec.soldPrice || "";
    ui.step = "summary";
    $("savedModal").hidden = true;
    render();
    toast("Opened design for " + (rec.customer && rec.customer.name ? rec.customer.name : "customer"));
  }

  function deleteDesign(id) {
    var list = loadDesigns().filter(function (d) { return d.id !== id; });
    storeDesigns(list);
    if (ui.designId === id) ui.designId = null;
    renderSaved();
    save();
  }

  function fmtDate(iso) {
    var d = iso ? new Date(iso) : new Date();
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }
  function ymd(d) {
    d = d || new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function slug(s) { return String(s || "customer").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "customer"; }

  function renderSaved() {
    var list = loadDesigns();
    $("savedList").innerHTML = list.length ? list.map(function (d) {
      var c = d.customer || {};
      return '<div class="saved-row' + (d.id === ui.designId ? " current" : "") + '"><div class="sr-main"><div class="sr-name">' + esc(c.name || "No name") + "</div>" +
        '<div class="sr-sub">' + esc(d.product) + " &middot; " + money(d.total) + " &middot; Saved " + esc(fmtDate(d.savedAt)) + "</div></div>" +
        '<button class="btn ghost sr-btn" data-act="saved-delete" data-id="' + d.id + '">Delete</button>' +
        '<button class="btn primary sr-btn" data-act="saved-load" data-id="' + d.id + '">Open</button></div>';
    }).join("") : '<div class="side-empty">No saved designs yet. Finish a design and tap Save this design on the summary.</div>';
  }

  function openCustomer(mode) {
    ui.custMode = mode;
    var c = state.customer || {};
    $("custName").value = c.name || "";
    $("custAddress").value = c.address || "";
    $("custPhone").value = c.phone || "";
    $("custError").hidden = true;
    $("custTitle").textContent = mode === "export" ? "Customer for this deal record" : "Save this design";
    $("custSub").textContent = mode === "export" ? "Add the customer's name for the deal record. The design is saved too." : "Add the customer's name to save this design and make a printable summary.";
    $("custSubmit").textContent = mode === "export" ? "Save and export" : "Save and show summary";
    $("custModal").hidden = false;
    setTimeout(function () { try { $("custName").focus(); } catch (e) {} }, 50);
  }

  function printSheetHtml() {
    var q = quote(), L = line(), c = state.customer || {};
    var h = '<header class="ps-head"><div class="ps-brand"><img src="icon.svg" alt=""><div><div class="ps-co">RepRoom</div><div class="ps-doc">Bathroom design summary</div></div></div>' +
      '<div class="ps-meta"><div class="ps-label">Date</div><div>' + esc(fmtDate()) + "</div></div></header>";
    h += '<section class="ps-cust"><div class="ps-label">Prepared for</div><div class="ps-name">' + esc(c.name) + "</div>" +
      (c.address ? "<div>" + esc(c.address) + "</div>" : "") + (c.phone ? "<div>" + esc(c.phone) + "</div>" : "") + "</section>";
    h += '<table class="ps-table"><thead><tr><th>Item</th><th class="q">Qty</th><th class="a">Price</th></tr></thead><tbody>';
    var base = q.rows[0];
    h += '<tr class="sec"><td colspan="3">System</td></tr><tr><td>' + esc(base.label) + ' <span class="d">' + esc(customerName()) + "</span>" + '</td><td class="q"></td><td class="a">' + money(base.amount) + "</td></tr>" +
      q.rows.filter(function (r) { return r.isAdder; }).map(function (r) { return "<tr><td>" + esc(r.label) + '</td><td class="q"></td><td class="a">' + money(r.amount) + "</td></tr>"; }).join("");
    h += '<tr class="sec"><td colspan="3">Your look</td></tr>' + lookRows().map(function (r) {
      var inc = r[2] !== false;
      return "<tr><td>" + esc(r[0]) + ': <span class="d">' + esc(r[1]) + '</span></td><td class="q"></td><td class="a ' + (inc ? "inc" : "muted") + '">' + (inc ? "Included" : "Priced below") + "</td></tr>";
    }).join("");
    ["Upgrades", "Construction options", "Full Bathroom Options"].forEach(function (sec) {
      var rs = q.rows.filter(function (r) { return r.section === sec; });
      if (!rs.length) return;
      h += '<tr class="sec"><td colspan="3">' + SECTION_NAMES[sec] + "</td></tr>";
      rs.forEach(function (r) {
        var d = itemDisplay(r);
        h += "<tr><td>" + esc(d.name) + (d.detail ? ' <span class="d">' + esc(d.detail) + "</span>" : "") + '</td><td class="q">' + esc(d.qty) + '</td><td class="a">' + money(d.amount) + "</td></tr>";
      });
    });
    h += '</tbody><tfoot><tr><td colspan="2">Total</td><td class="a">' + money(q.total) + "</td></tr></tfoot></table>";
    h += '<section class="ps-inc"><div class="ps-label">Included with your system</div><ul>' + L.includes.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></section>";
    h += '<footer class="ps-foot">Prices from RepRoom option list, ' + PRICE_SHEET_DATE + "</footer>";
    return h;
  }

  function openPrint() {
    $("printSheet").innerHTML = printSheetHtml();
    $("printView").hidden = false;
    document.body.classList.add("printing");
  }
  function closePrint() { $("printView").hidden = true; document.body.classList.remove("printing"); }

  function download(filename, text, mime) {
    var blob = new Blob([text], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = filename; a.style.display = "none";
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 2000);
  }

  function exportDeal() {
    saveDesign();
    var rec = P.dealRecord(C, Flow.effectiveState(C, state), { customer: state.customer.name, soldPrice: ui.soldPrice });
    var base = "cincybath-deal-" + slug(rec.customer) + "-" + ymd();
    download(base + ".json", JSON.stringify(rec, null, 2) + "\n", "application/json");
    setTimeout(function () { download(base + ".csv", P.dealCsv(rec), "text/csv"); }, 400);
    render();
    toast("Deal record exported: " + base + ".json and .csv");
  }

  var toastTimer = null;
  function toast(msg) {
    var t = $("toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 3200);
  }

  $("custForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("custName").value.trim();
    if (!name) { $("custError").hidden = false; return; }
    state.customer = { name: name, address: $("custAddress").value.trim(), phone: $("custPhone").value.trim() };
    $("custModal").hidden = true;
    if (ui.custMode === "export") { exportDeal(); return; }
    var ok = saveDesign();
    render();
    openPrint();
    toast(ok ? "Design saved for " + name : "Could not save on this device (storage full or blocked)");
  });

  // ---------- state changes ----------
  function setVanitySource(id) {
    var prev = state.vanity;
    state.vanitySource = id || null;
    if (!id) { state.vanity = null; state.vanityColor = null; state.vanityExtras = {}; return; }
    if (prev) {
      var band = prev.replace(/^vanity_(cs|cb)_/, "");
      state.vanity = "vanity_" + id + "_" + band;
    }
    if (id !== "cb") state.vanityColor = null;
  }

  function go(step) { ui.step = step; render(); }
  function nextStep(dir) {
    var steps = stepsForLine(), i = steps.map(function (s) { return s.id; }).indexOf(ui.step);
    var n = steps[i + dir];
    if (n) go(n.id);
  }

  function openPin() { ui.pin = ""; drawPin(); $("pinModal").hidden = false; }
  function drawPin() {
    var dots = $("pinDots").children;
    for (var i = 0; i < 4; i++) dots[i].className = i < ui.pin.length ? "f" : "";
    $("pinPad").innerHTML = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map(function (k) {
      if (!k) return '<button class="blank" tabindex="-1"></button>';
      return '<button data-act="pin" data-d="' + k + '">' + (k === "del" ? "&#9003;" : k) + "</button>";
    }).join("");
  }
  function pinPress(k) {
    if (k === "del") ui.pin = ui.pin.slice(0, -1);
    else if (ui.pin.length < 4) ui.pin += k;
    drawPin();
    if (ui.pin.length === 4) {
      if (ui.pin === REP_PIN_PLACEHOLDER) {
        $("pinModal").hidden = true; ui.rep = true; ui.drawer = true; ui.pin = ""; render();
      } else {
        var el = $("pinDots"); el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake");
        setTimeout(function () { ui.pin = ""; drawPin(); }, 350);
      }
    }
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]");
    if (!b || b.disabled) return;
    var a = b.getAttribute("data-act"), id = b.getAttribute("data-id"), key = b.getAttribute("data-key"), val = b.getAttribute("data-val");
    switch (a) {
      case "type": state.type = val; derive(); render(); break;
      case "tubsize": state.tubSize = val; derive(); render(); break;
      case "depth": state.soakerDepth = val; derive(); render(); break;
      case "wallmat": state.wallMaterial = val; derive(); render(); break;
      case "scope":
        var hadFb = Flow.hasFullBathPicks(C, state);
        state.scope = val;
        if (val === "shower" && hadFb) toast("Full bathroom picks are set aside. Pick Full bathroom to bring them back.");
        render(); break;
      case "set":
        if ((key === "vanityColor" || key === "toiletShape" || key === "toiletHeight") && state[key] === val) state[key] = null;
        else state[key] = val || null;
        if (key === "toilet" && !val) { state.toiletShape = null; state.toiletHeight = null; }
        render(); break;
      case "toggle": state.picks[id] = !state.picks[id]; if (!state.picks[id]) delete state.picks[id]; render(); break;
      case "addshower": if (val === "1" && has("add_shower_option")) state.picks.add_shower_option = true; else delete state.picks.add_shower_option; render(); break;
      case "piece":
        state.pieces = state.pieces || {};
        var cur = P.pieceCounts(C, line(), state);
        var part = cur && cur.parts.filter(function (x) { return x.id === id; })[0];
        if (part) state.pieces[id] = Math.min(20, Math.max(0, part.count + Number(b.getAttribute("data-d"))));
        render(); break;
      case "vx": state.vanityExtras = state.vanityExtras || {}; state.vanityExtras[key] = !state.vanityExtras[key]; render(); break;
      case "vsrc": setVanitySource(val); render(); break;
      case "qty":
        var q = (Number(state.qty[id]) || 0) + Number(b.getAttribute("data-d"));
        if (q <= 0) delete state.qty[id]; else state.qty[id] = q;
        render(); break;
      case "sqft":
        var s = Math.max(0, (Number(state.sqft[id]) || 0) + Number(b.getAttribute("data-d")));
        if (!s) delete state.sqft[id]; else state.sqft[id] = String(Math.round(s * 100) / 100);
        render(); break;
      case "go": go(b.getAttribute("data-step")); break;
      case "next": nextStep(1); break;
      case "back": nextStep(-1); break;
      case "reset":
        if (window.confirm("Start over and clear all picks and photos?")) { state = defaultState(); ui.soldPrice = ""; ui.designId = null; ui.step = "photos"; clearPhotos(); render(); }
        break;
      case "lock": if (ui.rep) { ui.drawer = true; render(); } else openPin(); break;
      case "pin": pinPress(b.getAttribute("data-d")); break;
      case "pin-cancel": $("pinModal").hidden = true; ui.pin = ""; break;
      case "drawer-close": ui.drawer = false; render(); break;
      case "save-design": openCustomer("save"); break;
      case "cust-cancel": $("custModal").hidden = true; break;
      case "print-now": window.print(); break;
      case "print-close": closePrint(); break;
      case "saved-open": renderSaved(); $("savedModal").hidden = false; break;
      case "saved-close": $("savedModal").hidden = true; break;
      case "saved-load": openDesign(id); break;
      case "saved-delete": if (window.confirm("Delete this saved design from this device?")) deleteDesign(id); break;
      case "export": if (state.customer && state.customer.name) exportDeal(); else openCustomer("export"); break;
      case "photo-main": setMainPhoto(id); break;
      case "photo-remove": if (window.confirm("Remove this photo?")) removePhoto(id); break;
      case "ai-make": makePreview(); break;
      case "ai-view": ui.aiView = val; render(); break;
      case "ai-recheck": ai.status = "unknown"; render(); break;
      case "rep-exit": ui.rep = false; ui.drawer = false; ui.soldPrice = ""; render(); break;
    }
  });
  $("scrim").addEventListener("click", function () { ui.drawer = false; render(); });

  document.addEventListener("input", function (e) {
    var t = e.target;
    if (t.hasAttribute("data-sqft")) {
      var id = t.getAttribute("data-sqft"), v = t.value.replace(/[^0-9.]/g, "");
      if (v !== t.value) t.value = v;
      if (v) state.sqft[id] = v; else delete state.sqft[id];
      var n = Number(v) || 0, it = P.allFullBathItems(C)[id];
      var sub = document.querySelector('[data-sqsub="' + id + '"]');
      if (sub) sub.textContent = n > 0 ? money(n * it.price) : "";
      var row = document.querySelector('[data-sqrow="' + id + '"]');
      if (row) row.classList.toggle("on", n > 0);
      updateTotalsOnly();
    } else if (t.hasAttribute("data-size")) {
      var sv = t.value.replace(/[^0-9.]/g, "");
      if (sv !== t.value) t.value = sv;
      state.size = state.size || { w: "", l: "" };
      state.size[t.getAttribute("data-size")] = sv;
      derive();
      var ss = $("sizeStatus"); if (ss) ss.innerHTML = sizeStatusHtml();
      renderSteps();
      updateTotalsOnly();
    } else if (t.id === "soldInput") {
      ui.soldPrice = t.value.replace(/[^0-9.,$]/g, "");
      save();
      $("soldStatus").innerHTML = soldStatusHtml(quote());
    }
  });
  document.addEventListener("change", function (e) {
    if (e.target.hasAttribute("data-photo-input")) {
      var files = Array.prototype.slice.call(e.target.files || []);
      var retake = e.target.getAttribute("data-retake") || null;
      e.target.value = "";
      if (files.length) addPhotos(files, retake);
      return;
    }
  });

  // Before and after slider: drag (or tap) anywhere on the picture.
  (function () {
    var dragging = false;
    function setFrom(e) {
      var box = $("aiSliderBox"); if (!box) return;
      var r = box.getBoundingClientRect();
      var v = Math.max(0, Math.min(100, Math.round((e.clientX - r.left) / r.width * 100)));
      ui.aiSlider = v;
      var w = $("aiAfterClip"); if (w) w.style.clipPath = "inset(0 " + (100 - v) + "% 0 0)";
      var hd = $("aiHandle"); if (hd) hd.style.left = v + "%";
      box.setAttribute("aria-valuenow", v);
    }
    document.addEventListener("pointerdown", function (e) {
      if (!e.target.closest || !e.target.closest("#aiSliderBox")) return;
      dragging = true; setFrom(e); e.preventDefault();
    });
    document.addEventListener("pointermove", function (e) { if (dragging) { setFrom(e); e.preventDefault(); } });
    ["pointerup", "pointercancel"].forEach(function (ev) { document.addEventListener(ev, function () { dragging = false; }); });
  })();

  // Long press on the logo opens the rep PIN.
  (function () {
    var brand = $("brand"), timer = null;
    function start(e) { cancel(); timer = setTimeout(function () { timer = null; if (ui.rep) { ui.drawer = true; render(); } else openPin(); }, 800); }
    function cancel() { if (timer) { clearTimeout(timer); timer = null; } }
    brand.addEventListener("pointerdown", start);
    ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) { brand.addEventListener(ev, cancel); });
    brand.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  })();

  ui.step = "photos";
  render();
  loadPhotos();

  // Test hook (read only)
  window.__picker = { getState: function () { return JSON.parse(JSON.stringify(state)); }, quote: quote, designs: loadDesigns, photos: function () { return photos.map(function (p) { return { id: p.id, w: p.w, h: p.h, main: !!p.main, bytes: p.blob.size }; }); }, previewPrompt: function () { return previewRequestParts().prompt; } };
})();
