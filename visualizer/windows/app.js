/* RepRoom Windows packages picker. Public: no prices. Plain JS, no build. */
(function () {
  "use strict";

  var STORE_KEY = "reproom.windows.v1";
  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var ICON = {
    camera: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 10.5h5l2.2-3.5h9.6l2.2 3.5h5V25H4z"/><circle cx="16" cy="17" r="5"/></svg>',
    library: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="4" y="6" width="24" height="20" rx="2"/><path d="M4 21l7-7 6 6 4-4 7 7"/><circle cx="21.5" cy="11.5" r="2"/></svg>',
    window: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><rect x="8" y="6" width="32" height="36" rx="2"/><path d="M8 24h32M24 6v36"/></svg>'
  };

  var STEPS = [
    { id: "photos", name: "Photos" },
    { id: "type", name: "Type" },
    { id: "count", name: "Count" },
    { id: "size", name: "Size" },
    { id: "frame", name: "Frame" },
    { id: "grid", name: "Grid" },
    { id: "glass", name: "Glass" },
    { id: "seeit", name: "See it" },
    { id: "summary", name: "Summary" }
  ];

  var TYPES = [
    { id: "doublehung", name: "Double-hung", sub: "Classic up-and-down sashes" },
    { id: "casement", name: "Casement", sub: "Crank-out side hinge" },
    { id: "slider", name: "Slider", sub: "Side-to-side glide" },
    { id: "picture", name: "Picture", sub: "Fixed glass, max view" },
    { id: "baybow", name: "Bay / Bow", sub: "Projected multi-unit" }
  ];

  var SIZES = [
    { id: "2030", name: "2′0″ × 3′0″", w: 24, h: 36 },
    { id: "2840", name: "2′8″ × 4′0″", w: 32, h: 48 },
    { id: "3040", name: "3′0″ × 4′0″", w: 36, h: 48 },
    { id: "3050", name: "3′0″ × 5′0″", w: 36, h: 60 },
    { id: "3640", name: "3′6″ × 4′0″", w: 42, h: 48 },
    { id: "custom", name: "Custom size", sub: "Enter width × height" }
  ];

  var FRAMES = [
    { id: "white", name: "White", swatch: "#f4f4f2" },
    { id: "black", name: "Black", swatch: "#1a1a1c" },
    { id: "bronze", name: "Bronze", swatch: "#6b4a33" },
    { id: "almond", name: "Almond", swatch: "#d9cbb8" },
    { id: "gray", name: "Gray", swatch: "#8e939a" },
    { id: "forest", name: "Forest", swatch: "#2f4a3c" }
  ];

  var GRIDS = [
    { id: "none", name: "None", sub: "Clear glass, no grids", cols: 0, rows: 0 },
    { id: "colonial", name: "Colonial", sub: "Classic divided lite", cols: 2, rows: 2 },
    { id: "prairie", name: "Prairie", sub: "Perimeter prairie bars", cols: -1, rows: 0 },
    { id: "diamond", name: "Diamond", sub: "Diamond pattern look", cols: 3, rows: 2 }
  ];

  var GLASS = [
    { id: "lowe", name: "Low-E glass", sub: "Energy-efficient coating" },
    { id: "tempered", name: "Tempered", sub: "Safety glass where required" },
    { id: "obscuring", name: "Obscuring", sub: "Privacy glass" },
    { id: "screens", name: "Screens", sub: "Include insect screens" }
  ];

  function defaultState() {
    return {
      photo: null,
      type: null,
      count: 4,
      size: null,
      customW: "",
      customH: "",
      frame: "white",
      grid: "none",
      glass: { lowe: true, tempered: false, obscuring: false, screens: true },
      marks: []
    };
  }

  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(STORE_KEY));
      if (s && typeof s === "object") {
        var d = defaultState();
        Object.keys(d).forEach(function (k) {
          if (s[k] !== undefined) d[k] = s[k];
        });
        if (!d.glass || typeof d.glass !== "object") d.glass = defaultState().glass;
        return d;
      }
    } catch (e) {}
    return defaultState();
  }

  function save() {
    try {
      var copy = JSON.parse(JSON.stringify(state));
      // Keep photo in memory for the session; skip giant data URL in storage if huge
      if (copy.photo && copy.photo.length > 400000) copy.photo = null;
      localStorage.setItem(STORE_KEY, JSON.stringify(copy));
    } catch (e) {}
  }

  var state = load();
  var ui = { step: "photos" };

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function checkBox() { return '<span class="check">' + CHECK + "</span>"; }
  function find(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function toast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.hidden = true; }, 1800);
  }

  function typeName() {
    var t = find(TYPES, state.type);
    return t ? t.name : "";
  }
  function sizeLabel() {
    if (state.size === "custom") {
      var w = Number(state.customW), h = Number(state.customH);
      if (w > 0 && h > 0) return w + "″ × " + h + "″";
      return "Custom";
    }
    var s = find(SIZES, state.size);
    return s ? s.name : "";
  }
  function frameName() {
    var f = find(FRAMES, state.frame);
    return f ? f.name : "";
  }
  function gridName() {
    var g = find(GRIDS, state.grid);
    return g ? g.name : "";
  }
  function glassList() {
    return GLASS.filter(function (g) { return state.glass[g.id]; }).map(function (g) { return g.name; });
  }
  function headline() {
    var parts = [];
    if (state.type) parts.push(typeName());
    if (state.count) parts.push(state.count + (state.count === 1 ? " opening" : " openings"));
    if (state.size) parts.push(sizeLabel());
    return parts.join(" · ");
  }

  function stepIndex() {
    for (var i = 0; i < STEPS.length; i++) if (STEPS[i].id === ui.step) return i;
    return 0;
  }

  function canGoNext() {
    if (ui.step === "photos") return true;
    if (ui.step === "type") return !!state.type;
    if (ui.step === "count") return state.count >= 1;
    if (ui.step === "size") {
      if (!state.size) return false;
      if (state.size === "custom") return Number(state.customW) > 0 && Number(state.customH) > 0;
      return true;
    }
    if (ui.step === "frame") return !!state.frame;
    if (ui.step === "grid") return !!state.grid;
    return true;
  }

  function head(title, desc) {
    return '<div class="step-head"><div><h1 class="step-title">' + esc(title) + '</h1><div class="step-desc">' + esc(desc) + "</div></div></div>";
  }

  // ---------- steps ----------
  function stepPhotos() {
    var h = head("Photos of the house", "Optional. Take a front or side photo to preview the new windows later. You can skip this.");
    h += '<div class="photo-tip">' + ICON.camera + '<ol class="photo-steps">' +
      "<li>Stand back so the whole wall shows</li>" +
      "<li>Keep the camera level</li>" +
      "<li>Bright daylight works best</li>" +
      "<li>One clear photo is enough</li>" +
      "<li>You can change it later</li>" +
      "<li>Skip if you just want options</li>" +
      "</ol></div>";
    if (state.photo) {
      h += '<div class="photo-grid"><div class="photo-card main">' +
        '<div class="photo-img"><img src="' + state.photo + '" alt="House photo"><span class="photo-badge">House</span></div>' +
        '<div class="photo-actions">' +
        '<label class="btn photo-btn ghost">Replace<input type="file" accept="image/*" data-act="photo-file" class="hide-input"></label>' +
        '<button class="btn photo-btn ghost" type="button" data-act="photo-clear">Remove</button>' +
        "</div></div></div>";
    } else {
      h += '<div class="photo-grid"><div class="photo-card empty next">' +
        '<div class="photo-slot-label">House photo</div>' +
        '<label class="photo-pick">' + ICON.camera + " Take a photo" +
        '<input type="file" accept="image/*" capture="environment" data-act="photo-file"></label>' +
        '<label class="photo-pick">' + ICON.library + " Choose from photos" +
        '<input type="file" accept="image/*" data-act="photo-file"></label>' +
        '<button class="btn ghost photo-btn wide" type="button" data-act="photo-sample" style="margin-top:8px">Try a sample house</button>' +
        "</div></div>";
    }
    return h;
  }

  function stepType() {
    var h = head("Window type", "Pick the main style for this job.");
    h += '<div class="tiles wide">';
    TYPES.forEach(function (t) {
      var on = state.type === t.id;
      h += '<button type="button" class="tile' + (on ? " sel" : "") + '" data-act="set-type" data-id="' + t.id + '">' +
        checkBox() +
        '<div class="swatch icon">' + ICON.window + "</div>" +
        '<div class="t-name">' + esc(t.name) + "</div>" +
        '<div class="t-sub">' + esc(t.sub) + "</div></button>";
    });
    h += "</div>";
    return h;
  }

  function stepCount() {
    var h = head("How many openings?", "Count of windows in this quote path.");
    h += '<div class="count-box">' +
      '<button type="button" class="btn ghost" style="flex:0 0 72px;font-size:28px" data-act="count-dec" aria-label="Fewer">−</button>' +
      '<div class="q" id="countVal">' + state.count + "</div>" +
      '<button type="button" class="btn ghost" style="flex:0 0 72px;font-size:28px" data-act="count-inc" aria-label="More">+</button>' +
      "</div>";
    h += '<div class="fine" style="text-align:center;margin-top:12px">Typical home: 8–20. Adjust for this elevation.</div>';
    return h;
  }

  function stepSize() {
    var h = head("Size", "Common sizes, or enter a custom width and height.");
    h += '<div class="tiles">';
    SIZES.forEach(function (s) {
      var on = state.size === s.id;
      h += '<button type="button" class="tile' + (on ? " sel" : "") + '" data-act="set-size" data-id="' + s.id + '">' +
        checkBox() +
        '<div class="t-name">' + esc(s.name) + "</div>" +
        (s.sub ? '<div class="t-sub">' + esc(s.sub) + "</div>" : (s.w ? '<div class="t-sub">' + s.w + "″ × " + s.h + "″</div>" : "")) +
        "</button>";
    });
    h += "</div>";
    if (state.size === "custom") {
      h += '<div class="size-custom">' +
        '<label>W <input type="number" inputmode="decimal" min="1" max="120" step="0.5" value="' + esc(state.customW) + '" data-act="custom-w" aria-label="Width inches"></label>' +
        "<span>×</span>" +
        '<label>H <input type="number" inputmode="decimal" min="1" max="120" step="0.5" value="' + esc(state.customH) + '" data-act="custom-h" aria-label="Height inches"></label>' +
        "<span>inches</span></div>";
    }
    return h;
  }

  function stepFrame() {
    var h = head("Frame finish", "Exterior / interior color for the vinyl or clad frame.");
    h += '<div class="tiles">';
    FRAMES.forEach(function (f) {
      var on = state.frame === f.id;
      h += '<button type="button" class="tile' + (on ? " sel" : "") + '" data-act="set-frame" data-id="' + f.id + '">' +
        checkBox() +
        '<div class="swatch-dot" style="background:' + f.swatch + '"></div>' +
        '<div class="t-name">' + esc(f.name) + "</div></button>";
    });
    h += "</div>";
    return h;
  }

  function stepGrid() {
    var h = head("Grid style", "Mullion pattern on the glass.");
    h += '<div class="tiles">';
    GRIDS.forEach(function (g) {
      var on = state.grid === g.id;
      h += '<button type="button" class="tile' + (on ? " sel" : "") + '" data-act="set-grid" data-id="' + g.id + '">' +
        checkBox() +
        '<div class="t-name">' + esc(g.name) + "</div>" +
        '<div class="t-sub">' + esc(g.sub) + "</div></button>";
    });
    h += "</div>";
    return h;
  }

  function stepGlass() {
    var h = head("Glass & options", "Toggle the options that apply. No prices shown.");
    h += '<div class="toggle-rows">';
    GLASS.forEach(function (g) {
      var on = !!state.glass[g.id];
      h += '<button type="button" class="toggle-row' + (on ? " on" : "") + '" data-act="toggle-glass" data-id="' + g.id + '">' +
        checkBox() +
        '<div class="r-main"><div class="t-name">' + esc(g.name) + '</div><div class="t-sub">' + esc(g.sub) + "</div></div></button>";
    });
    h += "</div>";
    return h;
  }

  function stepSeeit() {
    if (!state.photo) {
      return head("See it on the house", "No house photo yet.") +
        '<div class="callout">Add a photo on the Photos step to mark windows and preview frame color and grids. Or continue to the summary.</div>' +
        '<div class="btns" style="margin-top:14px;max-width:360px">' +
        '<button class="btn primary" type="button" data-act="go" data-step="photos">Add a photo</button></div>';
    }
    var h = head("See it on the house", "Mark each window with the yellow dots, then slide before and after.");
    h += '<div class="card-like" style="background:#fff;border-radius:18px;box-shadow:var(--shadow);padding:12px">' +
      '<div class="see-wrap" id="seeWrap"><canvas id="cv"></canvas></div>' +
      '<div class="see-hint" style="margin-top:10px">Before ← → After</div>' +
      '<input id="split" type="range" min="0" max="100" value="0" aria-label="Before and after" style="width:100%;accent-color:#2459e0">' +
      '<div class="see-toolbar">' +
      '<button class="btn primary" type="button" data-act="win-add" style="flex:0 0 auto;padding:0 18px;height:48px">+ Add window</button>' +
      '<button class="btn ghost" type="button" data-act="win-del" id="winDel" style="flex:0 0 auto;padding:0 18px;height:48px" hidden>Remove</button>' +
      "</div>" +
      '<p class="see-hint">Drag the 4 dots to the corners. Tap a window to select it. Preview uses your frame and grid picks.</p>' +
      "</div>";
    return h;
  }

  function stepSummary() {
    var rows = selectionRows();
    var h = head("Summary", "Selections for this windows package. No prices on the public tool.");
    if (state.photo) {
      h += '<div class="preview compact" style="margin-bottom:14px"><div class="preview-photo" style="width:76px;height:76px;border-radius:14px;overflow:hidden;flex:none"><img src="' + state.photo + '" alt="" style="width:100%;height:100%;object-fit:cover"></div>' +
        '<div><div class="preview-title">Your windows package</div><div class="preview-sub">' + esc(headline() || "Build complete") + "</div></div></div>";
    }
    h += '<div class="summary">';
    h += '<div class="sum-sec">Selections</div>';
    if (!rows.length) h += '<div class="side-empty">Nothing selected yet.</div>';
    rows.forEach(function (r) {
      h += '<div class="sum-row"><div class="n">' + esc(r.label) + (r.detail ? "<small>" + esc(r.detail) + "</small>" : "") + '</div><div class="a">' + esc(r.value) + "</div></div>";
    });
    h += "</div>";
    h += '<div class="btns" style="margin-top:16px;max-width:420px">' +
      '<button class="btn ghost" type="button" data-act="reset">Start over</button>' +
      '<button class="btn primary" type="button" data-act="save-local">Save on this phone</button></div>';
    h += '<div class="fine">Saved on this device only. Rough preview for the sales call — final look depends on the products you quote.</div>';
    return h;
  }

  function selectionRows() {
    var rows = [];
    if (state.type) rows.push({ label: "Type", value: typeName() });
    if (state.count) rows.push({ label: "Openings", value: String(state.count) });
    if (state.size) rows.push({ label: "Size", value: sizeLabel() });
    if (state.frame) rows.push({ label: "Frame", value: frameName() });
    if (state.grid) rows.push({ label: "Grid", value: gridName() });
    var gl = glassList();
    if (gl.length) rows.push({ label: "Glass / options", value: gl.join(", ") });
    if (state.photo) rows.push({ label: "House photo", value: "Added" });
    if (state.marks && state.marks.length) rows.push({ label: "Marked windows", value: String(state.marks.length) });
    return rows;
  }

  var STEP_RENDER = {
    photos: stepPhotos, type: stepType, count: stepCount, size: stepSize,
    frame: stepFrame, grid: stepGrid, glass: stepGlass, seeit: stepSeeit, summary: stepSummary
  };

  // ---------- render ----------
  function render() {
    renderTop();
    renderSteps();
    renderPreview();
    renderBody();
    renderSide();
    save();
  }

  function renderTop() {
    $("topLine").textContent = headline();
  }

  function renderSteps() {
    var idx = stepIndex();
    var collapsed = STEPS.length > 7;
    $("stepNav").classList.toggle("collapsed", collapsed);
    $("stepNav").innerHTML = STEPS.map(function (s, i) {
      var named = !collapsed || Math.abs(i - idx) <= 1;
      var cls = "step-chip" + (s.id === ui.step ? " active" : "") + (i < idx ? " done" : "") + (named ? "" : " mini");
      var dis = "";
      if (i > 1 && !state.type && s.id !== "photos" && s.id !== "type") dis = " disabled";
      return '<button class="' + cls + '" data-act="go" data-step="' + s.id + '" aria-label="Step ' + (i + 1) + ": " + esc(s.name) + '"' + dis +
        '><span class="num">' + (i + 1) + '</span><span class="lbl">' + esc(s.name) + "</span></button>";
    }).join("");
    var act = $("stepNav").querySelector(".active");
    if (act && act.scrollIntoView) act.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  function renderPreview() {
    if (ui.step === "photos" || ui.step === "seeit" || ui.step === "type" || ui.step === "summary") {
      $("preview").innerHTML = "";
      return;
    }
    var chips = [];
    if (state.type) chips.push('<span class="preview-chip">' + esc(typeName()) + "</span>");
    if (state.frame) {
      var f = find(FRAMES, state.frame);
      if (f) chips.push('<span class="preview-chip"><i style="background:' + f.swatch + '"></i>' + esc(f.name) + "</span>");
    }
    if (state.grid) chips.push('<span class="preview-chip">' + esc(gridName()) + " grid</span>");
    $("preview").innerHTML =
      '<div class="preview"><div class="preview-icon">' + ICON.window + "</div>" +
      '<div><div class="preview-title">' + esc(headline() || "Windows package") + "</div>" +
      '<div class="preview-sub">Build the package step by step. Preview on a house photo at See it.</div>' +
      (chips.length ? '<div class="preview-chips">' + chips.join("") + "</div>" : "") +
      "</div></div>";
  }

  function renderBody() {
    if (!STEP_RENDER[ui.step]) ui.step = "photos";
    var sc = $("stageScroll"), top = sc.scrollTop, same = sc.getAttribute("data-step") === ui.step;
    $("stepBody").innerHTML = STEP_RENDER[ui.step]();
    sc.setAttribute("data-step", ui.step);
    sc.scrollTop = same ? top : 0;
    if (ui.step === "seeit" && state.photo) {
      setTimeout(initOverlay, 0);
    } else {
      teardownOverlay();
    }
  }

  function renderSide() {
    var i = stepIndex();
    var next = STEPS[i + 1], prev = STEPS[i - 1];
    var rows = selectionRows();
    var h = '<div class="side-head"><div class="side-kicker">Your selections</div><div class="side-line">' +
      esc(headline() || "Pick a type to begin") + "</div></div>";
    h += '<div class="side-list">';
    if (!rows.length) {
      h += '<div class="side-empty">Pick a window type, count, size, frame, and options. Your selections build as you go.</div>';
    } else {
      rows.forEach(function (r) {
        h += '<div class="side-row"><div class="n">' + esc(r.label) + '</div><div class="a">' + esc(r.value) + "</div></div>";
      });
    }
    h += "</div>";
    h += '<div class="side-foot">';
    if (ui.step === "summary") {
      h += '<div class="btns"><button class="btn ghost" data-act="back">Back</button><button class="btn primary" data-act="save-local">Save</button></div>';
    } else {
      h += '<div class="btns">' + (prev ? '<button class="btn ghost" data-act="back">Back</button>' : "") +
        '<button class="btn primary" data-act="next"' + (canGoNext() ? "" : " disabled") + ">" +
        (ui.step === "photos" && !state.photo ? "Skip photos" :
          next ? (next.id === "summary" ? "See summary" : next.id === "seeit" ? "Next: See it" : "Next: " + next.name) : "Done") +
        "</button></div>";
    }
    h += '<div class="side-tools"><button class="link-btn" data-act="reset">Start over</button></div></div>';
    $("side").innerHTML = h;
  }

  // ---------- overlay (See it) ----------
  var overlay = { img: null, W: 0, H: 0, sel: -1, drag: null, bound: false };

  function frameColor() {
    var f = find(FRAMES, state.frame) || FRAMES[0];
    return f.swatch;
  }
  function gridSpec() {
    var g = find(GRIDS, state.grid) || GRIDS[0];
    return [g.name, g.cols, g.rows];
  }

  function teardownOverlay() {
    overlay.bound = false;
    overlay.drag = null;
    overlay.sel = -1;
  }

  function initOverlay() {
    var cv = $("cv");
    if (!cv || !state.photo) return;
    var g = cv.getContext("2d", { alpha: false });
    var im = new Image();
    im.onload = function () {
      overlay.img = im;
      var m = 1600, s = Math.min(1, m / Math.max(im.width, im.height));
      overlay.W = Math.max(1, Math.round(im.width * s));
      overlay.H = Math.max(1, Math.round(im.height * s));
      cv.width = overlay.W;
      cv.height = overlay.H;
      if (!state.marks) state.marks = [];
      // migrate marks if needed
      overlay.sel = state.marks.length ? 0 : -1;
      bindOverlay(cv);
      drawOverlay();
      syncDelBtn();
    };
    im.onerror = function () { toast("Could not load that photo"); };
    im.src = state.photo;
  }

  function syncDelBtn() {
    var d = $("winDel");
    if (d) d.hidden = overlay.sel < 0;
  }

  function path(c, p) {
    c.beginPath();
    c.moveTo(p[0][0], p[0][1]);
    for (var j = 1; j < 4; j++) c.lineTo(p[j][0], p[j][1]);
    c.closePath();
  }
  function avg(p) {
    return [(p[0][0] + p[1][0] + p[2][0] + p[3][0]) / 4, (p[0][1] + p[1][1] + p[2][1] + p[3][1]) / 4];
  }
  function lerp(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }
  function drawWindow(c, p, frame, gg, scale) {
    var top = Math.hypot(p[1][0] - p[0][0], p[1][1] - p[0][1]);
    var side = Math.hypot(p[3][0] - p[0][0], p[3][1] - p[0][1]);
    var thick = Math.max(3 * scale, Math.min(top, side) * 0.07);
    c.save();
    path(c, p);
    c.clip();
    var gfill = c.createLinearGradient(p[0][0], p[0][1], p[2][0], p[2][1]);
    gfill.addColorStop(0, "rgba(170,200,220,.72)");
    gfill.addColorStop(0.5, "rgba(210,230,240,.55)");
    gfill.addColorStop(1, "rgba(140,170,195,.7)");
    c.fillStyle = gfill;
    c.fillRect(0, 0, c.canvas.width, c.canvas.height);
    c.strokeStyle = frame;
    c.lineWidth = Math.max(2 * scale, thick * 0.55);
    c.lineCap = "square";
    var cols = gg[1], rows = gg[2];
    if (cols === -1) {
      var inset = 0.22;
      var a = lerp(lerp(p[0], p[1], inset), lerp(p[3], p[2], inset), inset);
      var b = lerp(lerp(p[0], p[1], 1 - inset), lerp(p[3], p[2], 1 - inset), inset);
      var d = lerp(lerp(p[0], p[1], 1 - inset), lerp(p[3], p[2], 1 - inset), 1 - inset);
      var e = lerp(lerp(p[0], p[1], inset), lerp(p[3], p[2], inset), 1 - inset);
      c.beginPath();
      c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(d[0], d[1]); c.lineTo(e[0], e[1]);
      c.closePath(); c.stroke();
    } else {
      for (var i = 1; i < cols; i++) {
        var t = i / cols, aa = lerp(p[0], p[1], t), bb = lerp(p[3], p[2], t);
        c.beginPath(); c.moveTo(aa[0], aa[1]); c.lineTo(bb[0], bb[1]); c.stroke();
      }
      for (var r = 1; r < rows; r++) {
        var tr = r / rows, aa2 = lerp(p[0], p[3], tr), bb2 = lerp(p[1], p[2], tr);
        c.beginPath(); c.moveTo(aa2[0], aa2[1]); c.lineTo(bb2[0], bb2[1]); c.stroke();
      }
    }
    c.lineJoin = "miter";
    c.strokeStyle = frame;
    c.lineWidth = thick;
    path(c, p); c.stroke();
    c.globalAlpha = 0.35;
    c.strokeStyle = "#fff";
    c.lineWidth = Math.max(1, thick * 0.25);
    var insetP = p.map(function (pt) { return lerp(pt, avg(p), 0.08); });
    path(c, insetP); c.stroke();
    c.restore();
  }

  function renderAfter(c) {
    c.drawImage(overlay.img, 0, 0, overlay.W, overlay.H);
    var gg = gridSpec(), fc = frameColor(), sc = overlay.W / 900;
    (state.marks || []).forEach(function (A) {
      drawWindow(c, A.p, fc, gg, sc);
    });
  }

  function drawOverlay() {
    var cv = $("cv");
    if (!cv || !overlay.img) return;
    var g = cv.getContext("2d", { alpha: false });
    var W = overlay.W, H = overlay.H;
    g.globalCompositeOperation = "source-over";
    g.globalAlpha = 1;
    renderAfter(g);
    // Slider: 0 = Before (original house), 100 = After (overlays).
    // Cover the left (1-sp) fraction with the original photo so Before←→After reads correctly.
    var sp = ($("split") ? Number($("split").value) : 0) / 100;
    var beforeW = W * (1 - sp);
    if (beforeW > 0) {
      g.save();
      g.beginPath(); g.rect(0, 0, beforeW, H); g.clip();
      g.drawImage(overlay.img, 0, 0, W, H);
      g.restore();
      if (sp > 0 && sp < 1) {
        g.fillStyle = "#fff";
        g.fillRect(beforeW - 2, 0, 4, H);
      }
    }
    (state.marks || []).forEach(function (A, j) {
      if (j !== overlay.sel) return;
      g.strokeStyle = "#2459e0";
      g.lineWidth = Math.max(2, W / 400);
      g.setLineDash([10, 8]);
      path(g, A.p); g.stroke();
      g.setLineDash([]);
      A.p.forEach(function (q) {
        g.beginPath();
        g.arc(q[0], q[1], Math.max(10, W / 55), 0, 7);
        g.fillStyle = "#f5c04a"; g.fill();
        g.lineWidth = 3; g.strokeStyle = "#fff"; g.stroke();
      });
    });
  }

  function pt(e) {
    var cv = $("cv"), r = cv.getBoundingClientRect();
    var t = e.touches ? e.touches[0] : e;
    return [(t.clientX - r.left) * overlay.W / r.width, (t.clientY - r.top) * overlay.H / r.height];
  }
  function inside(p, q) {
    var c = false;
    for (var i = 0, j = 3; i < 4; j = i++) {
      if ((q[i][1] > p[1]) !== (q[j][1] > p[1]) && p[0] < (q[j][0] - q[i][0]) * (p[1] - q[i][1]) / (q[j][1] - q[i][1]) + q[i][0]) c = !c;
    }
    return c;
  }

  function onDown(e) {
    if (!overlay.img || ui.step !== "seeit") return;
    var p = pt(e), R = Math.max(28, overlay.W / 25);
    if (overlay.sel >= 0) {
      var A = state.marks[overlay.sel];
      for (var j = 0; j < 4; j++) {
        if (Math.hypot(A.p[j][0] - p[0], A.p[j][1] - p[1]) < R) {
          overlay.drag = { j: j, last: p };
          e.preventDefault();
          return;
        }
      }
    }
    for (var k = state.marks.length - 1; k >= 0; k--) {
      if (inside(p, state.marks[k].p)) {
        overlay.sel = k;
        overlay.drag = { j: -1, last: p };
        drawOverlay(); syncDelBtn();
        e.preventDefault();
        return;
      }
    }
    overlay.sel = -1;
    drawOverlay(); syncDelBtn();
  }
  function onMove(e) {
    if (!overlay.drag) return;
    e.preventDefault();
    var p = pt(e), A = state.marks[overlay.sel];
    if (!A) return;
    if (overlay.drag.j >= 0) A.p[overlay.drag.j] = p;
    else {
      var dx = p[0] - overlay.drag.last[0], dy = p[1] - overlay.drag.last[1];
      A.p.forEach(function (q) { q[0] += dx; q[1] += dy; });
    }
    overlay.drag.last = p;
    drawOverlay();
  }
  function onUp() { overlay.drag = null; save(); }

  function bindOverlay(cv) {
    if (overlay.bound) return;
    overlay.bound = true;
    cv.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    cv.addEventListener("touchstart", onDown, { passive: false });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
  }

  function addWin() {
    if (!overlay.img) return;
    var w = overlay.W * 0.18, h = overlay.H * 0.2;
    var x = (overlay.W - w) / 2, y = (overlay.H - h) / 2;
    state.marks.push({ p: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]] });
    overlay.sel = state.marks.length - 1;
    drawOverlay(); syncDelBtn(); save();
  }
  function delWin() {
    if (overlay.sel < 0) return;
    state.marks.splice(overlay.sel, 1);
    overlay.sel = -1;
    drawOverlay(); syncDelBtn(); save();
  }

  // ---------- sample house ----------
  function makeSample() {
    var c = document.createElement("canvas");
    c.width = 1200; c.height = 900;
    var g = c.getContext("2d");
    var gr = g.createLinearGradient(0, 0, 0, 900 * 0.45);
    gr.addColorStop(0, "#9ec5e8"); gr.addColorStop(1, "#d7e6f4");
    g.fillStyle = gr; g.fillRect(0, 0, 1200, 405);
    g.fillStyle = "#6f8f5a"; g.fillRect(0, 702, 1200, 198);
    g.fillStyle = "#c9b8a0"; g.fillRect(120, 260, 960, 460);
    g.fillStyle = "#5a4a3e";
    g.beginPath(); g.moveTo(80, 270); g.lineTo(600, 90); g.lineTo(1120, 270); g.closePath(); g.fill();
    g.fillStyle = "#6b3f2a"; g.fillRect(560, 500, 100, 220);
    g.fillStyle = "#d8c39a"; g.fillRect(595, 600, 8, 20);
    function oldWin(x, y, ww, hh) {
      g.fillStyle = "#7fa0b8"; g.fillRect(x, y, ww, hh);
      g.strokeStyle = "#efe6d8"; g.lineWidth = 10; g.strokeRect(x, y, ww, hh);
    }
    oldWin(180, 340, 180, 160); oldWin(400, 340, 120, 160);
    oldWin(700, 340, 120, 160); oldWin(900, 340, 180, 160);
    g.fillStyle = "#b09a80"; g.fillRect(120, 700, 960, 20);
    return c.toDataURL("image/jpeg", 0.92);
  }

  function readPhoto(file) {
    if (!file || !file.type || file.type.indexOf("image/") !== 0) {
      toast("Pick a photo");
      return;
    }
    var r = new FileReader();
    r.onerror = function () { toast("Could not read that photo"); };
    r.onload = function () {
      state.photo = r.result;
      state.marks = [];
      render();
      toast("Photo added");
    };
    r.readAsDataURL(file);
  }

  // ---------- events ----------
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-act]");
    if (!t) return;
    var act = t.getAttribute("data-act");
    if (act === "go") {
      var step = t.getAttribute("data-step");
      if (t.disabled) return;
      ui.step = step;
      render();
      return;
    }
    if (act === "next") {
      if (!canGoNext()) return;
      var i = stepIndex();
      if (i < STEPS.length - 1) ui.step = STEPS[i + 1].id;
      render();
      return;
    }
    if (act === "back") {
      var j = stepIndex();
      if (j > 0) ui.step = STEPS[j - 1].id;
      render();
      return;
    }
    if (act === "reset") {
      if (!window.confirm("Start over and clear all picks and photos?")) return;
      state = defaultState();
      ui.step = "photos";
      render();
      return;
    }
    if (act === "save-local") {
      save();
      toast("Saved on this phone");
      return;
    }
    if (act === "set-type") {
      state.type = t.getAttribute("data-id");
      render();
      return;
    }
    if (act === "set-size") {
      state.size = t.getAttribute("data-id");
      render();
      return;
    }
    if (act === "set-frame") {
      state.frame = t.getAttribute("data-id");
      render();
      return;
    }
    if (act === "set-grid") {
      state.grid = t.getAttribute("data-id");
      render();
      return;
    }
    if (act === "toggle-glass") {
      var gid = t.getAttribute("data-id");
      state.glass[gid] = !state.glass[gid];
      render();
      return;
    }
    if (act === "count-inc") {
      state.count = Math.min(40, (state.count || 1) + 1);
      render();
      return;
    }
    if (act === "count-dec") {
      state.count = Math.max(1, (state.count || 1) - 1);
      render();
      return;
    }
    if (act === "photo-clear") {
      state.photo = null;
      state.marks = [];
      render();
      return;
    }
    if (act === "photo-sample") {
      state.photo = makeSample();
      state.marks = [];
      render();
      toast("Sample house loaded");
      return;
    }
    if (act === "win-add") { addWin(); return; }
    if (act === "win-del") { delWin(); return; }
  });

  document.addEventListener("change", function (e) {
    var t = e.target;
    if (t && t.getAttribute("data-act") === "photo-file") {
      var f = t.files && t.files[0];
      readPhoto(f);
      t.value = "";
      return;
    }
    if (t && t.getAttribute("data-act") === "custom-w") {
      state.customW = t.value;
      save();
      renderSide();
      return;
    }
    if (t && t.getAttribute("data-act") === "custom-h") {
      state.customH = t.value;
      save();
      renderSide();
      return;
    }
  });

  document.addEventListener("input", function (e) {
    if (e.target && e.target.id === "split") drawOverlay();
    if (e.target && e.target.getAttribute("data-act") === "custom-w") {
      state.customW = e.target.value;
      save();
    }
    if (e.target && e.target.getAttribute("data-act") === "custom-h") {
      state.customH = e.target.value;
      save();
    }
  });

  // hide file inputs visually (packages uses absolute 1px; keep a class)
  var style = document.createElement("style");
  style.textContent = ".hide-input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}" +
    ".photo-pick input,.photo-btn input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}";
  document.head.appendChild(style);

  render();
  window.__windows = {
    getState: function () { return JSON.parse(JSON.stringify(state)); },
    steps: STEPS.map(function (s) { return s.id; })
  };
})();
