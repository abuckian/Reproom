/* RepRoom Windows packages. Guided picker, no prices. */
(function () {
  "use strict";
  var STORE = "reproom.windows.pkg.v1";
  var STEPS = [
    { id: "photos", name: "Photos" },
    { id: "type", name: "Type" },
    { id: "count", name: "Count" },
    { id: "size", name: "Size" },
    { id: "frame", name: "Frame" },
    { id: "grid", name: "Grid" },
    { id: "glass", name: "Glass" },
    { id: "install", name: "Install" },
    { id: "reveal", name: "See it" },
    { id: "summary", name: "Summary" }
  ];
  var TYPES = [
    { id: "double_hung", name: "Double hung", desc: "Two sashes, classic home style" },
    { id: "casement", name: "Casement", desc: "Crank-out, seals tight" },
    { id: "slider", name: "Slider", desc: "Horizontal slide" },
    { id: "picture", name: "Picture", desc: "Fixed glass, big view" },
    { id: "bay", name: "Bay / bow", desc: "Projects out, multi-panel" }
  ];
  var SIZES = [
    { id: "small", name: "Small", desc: "About 24 x 36 in" },
    { id: "standard", name: "Standard", desc: "About 36 x 48 in" },
    { id: "large", name: "Large", desc: "About 36 x 60 in" },
    { id: "xl", name: "XL / custom", desc: "Measure on site" }
  ];
  var FRAMES = [
    { id: "white", name: "White", swatch: "#f4f4f2" },
    { id: "black", name: "Black", swatch: "#1a1a1c" },
    { id: "bronze", name: "Bronze", swatch: "#6b4a33" },
    { id: "beige", name: "Beige", swatch: "#d9cbb8" },
    { id: "gray", name: "Gray", swatch: "#8e939a" },
    { id: "forest", name: "Forest", swatch: "#2f4a3c" }
  ];
  var GRIDS = [
    { id: "picture", name: "No grid", desc: "Clean glass" },
    { id: "1over1", name: "1 over 1", desc: "One horizontal bar" },
    { id: "2over2", name: "2 over 2", desc: "Four lights" },
    { id: "2over1", name: "2 over 1", desc: "Colonial upper" },
    { id: "prairie", name: "Prairie", desc: "Perimeter bars" },
    { id: "colonial6", name: "Colonial 6", desc: "Six lights" }
  ];
  var GLASS = [
    { id: "clear", name: "Clear dual pane", desc: "Standard insulated glass" },
    { id: "lowe", name: "Low-E", desc: "Better energy rating" },
    { id: "tempered", name: "Tempered", desc: "Safety glass where code needs it" },
    { id: "obscure", name: "Obscure / frosted", desc: "Privacy glass" }
  ];
  var INSTALL = [
    { id: "retrofit", name: "Retrofit / insert", desc: "Keeps existing frame" },
    { id: "full_frame", name: "Full frame", desc: "Replace down to rough opening" },
    { id: "new_construction", name: "New construction", desc: "New build or addition" }
  ];

  var state = {
    step: "photos",
    photoNote: "",
    type: null,
    count: 1,
    size: null,
    frame: null,
    grid: null,
    glass: null,
    install: null,
    customer: { name: "", address: "" }
  };

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }
  function toast(msg) {
    var t = $("toast");
    t.hidden = false; t.textContent = msg; t.classList.add("on");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove("on"); t.hidden = true; }, 1800);
  }
  function find(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function persist() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {}
  }
  function restore() {
    try {
      var raw = localStorage.getItem(STORE);
      if (!raw) return;
      var s = JSON.parse(raw);
      if (s && typeof s === "object") {
        Object.keys(state).forEach(function (k) {
          if (s[k] !== undefined) state[k] = s[k];
        });
      }
    } catch (e) {}
  }

  function canAdvance(id) {
    if (id === "photos") return true;
    if (id === "type") return !!state.type;
    if (id === "count") return state.count >= 1;
    if (id === "size") return !!state.size;
    if (id === "frame") return !!state.frame;
    if (id === "grid") return !!state.grid;
    if (id === "glass") return !!state.glass;
    if (id === "install") return !!state.install;
    return true;
  }
  function stepIndex(id) {
    for (var i = 0; i < STEPS.length; i++) if (STEPS[i].id === id) return i;
    return 0;
  }
  function go(id) {
    state.step = id;
    persist();
    render();
    var sc = $("stageScroll");
    if (sc) sc.scrollTop = 0;
  }
  function next() {
    var i = stepIndex(state.step);
    if (!canAdvance(state.step)) { toast("Pick one to continue"); return; }
    if (i < STEPS.length - 1) go(STEPS[i + 1].id);
  }
  function back() {
    var i = stepIndex(state.step);
    if (i > 0) go(STEPS[i - 1].id);
  }

  function tileHtml(item, selected, kind) {
    var sw = item.swatch
      ? '<div class="swatch" style="background:' + esc(item.swatch) + '"></div>'
      : '';
    return '<button type="button" class="tile' + (selected ? " sel" : "") + '" data-kind="' + kind + '" data-id="' + esc(item.id) + '">' +
      sw +
      '<div class="t-name">' + esc(item.name) + "</div>" +
      (item.desc ? '<div class="t-sub">' + esc(item.desc) + "</div>" : "") +
      "</button>";
  }

  function selections() {
    var rows = [];
    var t = find(TYPES, state.type); if (t) rows.push(["Type", t.name]);
    if (state.count) rows.push(["Count", String(state.count) + (state.count === 1 ? " window" : " windows")]);
    var s = find(SIZES, state.size); if (s) rows.push(["Size", s.name]);
    var f = find(FRAMES, state.frame); if (f) rows.push(["Frame", f.name]);
    var g = find(GRIDS, state.grid); if (g) rows.push(["Grid", g.name]);
    var gl = find(GLASS, state.glass); if (gl) rows.push(["Glass", gl.name]);
    var ins = find(INSTALL, state.install); if (ins) rows.push(["Install", ins.name]);
    return rows;
  }

  function renderNav() {
    var h = "";
    STEPS.forEach(function (s, i) {
      var on = s.id === state.step;
      var done = stepIndex(state.step) > i;
      h += '<button type="button" class="step-chip' + (on ? " on" : "") + (done ? " done" : "") + '" data-step="' + s.id + '">' +
        '<span class="num">' + (i + 1) + "</span><span class=\"label\">" + esc(s.name) + "</span></button>";
    });
    $("stepNav").innerHTML = h;
  }

  function renderSide() {
    var rows = selections();
    var h = '<div class="side-head"><div class="side-kicker">Your selections</div>';
    h += '<div class="side-line">' + (rows.length ? (find(TYPES, state.type) || { name: "Windows" }).name : "Pick a type to begin") + "</div></div>";
    h += '<div class="side-list">';
    if (!rows.length) h += '<div class="side-empty">Build the window package step by step. No prices on this public version.</div>';
    else rows.forEach(function (r) {
      h += '<div class="side-row"><div class="n">' + esc(r[0]) + '</div><div class="a">' + esc(r[1]) + "</div></div>";
    });
    h += "</div><div class=\"side-foot\">";
    var i = stepIndex(state.step);
    if (state.step === "summary") {
      h += '<button type="button" class="btn primary" id="btnSave" style="width:100%">Save this design</button>';
    } else {
      h += '<div class="btns">' +
        (i > 0 ? '<button type="button" class="btn ghost" id="btnBack">Back</button>' : "") +
        '<button type="button" class="btn primary" id="btnNext">' + (state.step === "photos" ? "Skip photos" : "Continue") + "</button></div>";
    }
    h += '<div class="side-tools"><button type="button" class="link-btn" id="btnReset">Start over</button></div></div>';
    $("side").innerHTML = h;
  }

  function renderBody() {
    var id = state.step, h = "";
    if (id === "photos") {
      h = '<div class="step-head"><div><div class="section-title">Photos</div><div class="hint">Optional. Snap the house now, or skip and use See it later.</div></div></div>' +
        '<div class="rows">' +
        '<a class="row" href="../windows/?v=winpkg1"><div class="r-main"><div class="t-name">Open photo overlay</div><div class="r-hint">Mark windows on a house photo</div></div></a>' +
        '<button type="button" class="row" id="photoSkip"><div class="r-main"><div class="t-name">Skip for now</div><div class="r-hint">You can come back on the See it step</div></div></button>' +
        "</div>";
    } else if (id === "type") {
      h = '<div class="step-head"><div><div class="section-title">Window type</div><div class="hint">What are we quoting?</div></div></div><div class="tiles wide">';
      TYPES.forEach(function (t) { h += tileHtml(t, state.type === t.id, "type"); });
      h += "</div>";
    } else if (id === "count") {
      h = '<div class="step-head"><div><div class="section-title">How many windows?</div><div class="hint">Same style package across the openings.</div></div></div>' +
        '<div class="pc-card"><div class="pc-head"><div><div class="pc-title">' + state.count + '</div><div class="pc-sub">openings</div></div>' +
        '<div class="stepper">' +
        '<button type="button" class="btn" id="countMinus" ' + (state.count <= 1 ? "disabled" : "") + '>-</button>' +
        '<button type="button" class="btn" id="countPlus">+</button>' +
        "</div></div></div>";
    } else if (id === "size") {
      h = '<div class="step-head"><div><div class="section-title">Rough size</div><div class="hint">Per opening. Final measure is on site.</div></div></div><div class="tiles wide">';
      SIZES.forEach(function (t) { h += tileHtml(t, state.size === t.id, "size"); });
      h += "</div>";
    } else if (id === "frame") {
      h = '<div class="step-head"><div><div class="section-title">Frame color</div></div></div><div class="tiles">';
      FRAMES.forEach(function (t) { h += tileHtml(t, state.frame === t.id, "frame"); });
      h += "</div>";
    } else if (id === "grid") {
      h = '<div class="step-head"><div><div class="section-title">Grid style</div></div></div><div class="tiles wide">';
      GRIDS.forEach(function (t) { h += tileHtml(t, state.grid === t.id, "grid"); });
      h += "</div>";
    } else if (id === "glass") {
      h = '<div class="step-head"><div><div class="section-title">Glass</div></div></div><div class="tiles wide">';
      GLASS.forEach(function (t) { h += tileHtml(t, state.glass === t.id, "glass"); });
      h += "</div>";
    } else if (id === "install") {
      h = '<div class="step-head"><div><div class="section-title">Install method</div></div></div><div class="tiles wide">';
      INSTALL.forEach(function (t) { h += tileHtml(t, state.install === t.id, "install"); });
      h += "</div>";
    } else if (id === "reveal") {
      h = '<div class="step-head"><div><div class="section-title">See it on the house</div><div class="hint">Use the photo overlay to show before and after with your frame color and grid.</div></div></div>' +
        '<div class="rows"><a class="row" href="../windows/?v=winpkg1"><div class="r-main"><div class="t-name">Open Windows photo tool</div><div class="r-hint">Mark each window, then slide before and after</div></div></a>' +
        '<button type="button" class="row" id="revealSkip"><div class="r-main"><div class="t-name">Skip to summary</div></div></button></div>';
    } else if (id === "summary") {
      var rows = selections();
      h = '<div class="step-head"><div><div class="section-title">Summary</div><div class="hint">No prices on the public version. Reps can quote from their own sheet.</div></div></div>';
      if (state.customer.name) h += '<div class="cust-line">For <b>' + esc(state.customer.name) + "</b>" + (state.customer.address ? " · " + esc(state.customer.address) : "") + "</div>";
      h += '<div class="pc-card">';
      rows.forEach(function (r) {
        h += '<div class="sum-row"><div class="n">' + esc(r[0]) + '</div><div class="a">' + esc(r[1]) + "</div></div>";
      });
      h += "</div>";
    }
    $("stepBody").innerHTML = h;
    $("preview").innerHTML = "";
    var line = find(TYPES, state.type);
    $("topLine").textContent = line ? line.name : "Windows package";
  }

  function bind() {
    $("stepNav").onclick = function (e) {
      var b = e.target.closest("[data-step]");
      if (!b) return;
      var target = b.getAttribute("data-step");
      var ti = stepIndex(target), ci = stepIndex(state.step);
      if (ti <= ci) go(target);
      else {
        for (var i = 0; i < ti; i++) if (!canAdvance(STEPS[i].id)) { toast("Finish earlier steps first"); return; }
        go(target);
      }
    };
    $("side").onclick = function (e) {
      if (e.target.id === "btnNext" || e.target.closest("#btnNext")) next();
      else if (e.target.id === "btnBack" || e.target.closest("#btnBack")) back();
      else if (e.target.id === "btnReset" || e.target.closest("#btnReset")) {
        if (!confirm("Clear this window package and start over?")) return;
        localStorage.removeItem(STORE);
        state = { step: "photos", photoNote: "", type: null, count: 1, size: null, frame: null, grid: null, glass: null, install: null, customer: { name: "", address: "" } };
        render();
      } else if (e.target.id === "btnSave" || e.target.closest("#btnSave")) {
        $("custModal").hidden = false;
        $("custName").value = state.customer.name || "";
        $("custAddress").value = state.customer.address || "";
      }
    };
    $("stepBody").onclick = function (e) {
      var tile = e.target.closest(".tile");
      if (tile) {
        var kind = tile.getAttribute("data-kind"), id = tile.getAttribute("data-id");
        state[kind] = id;
        persist();
        render();
        return;
      }
      if (e.target.id === "countMinus" || e.target.closest("#countMinus")) {
        if (state.count > 1) { state.count--; persist(); render(); }
      } else if (e.target.id === "countPlus" || e.target.closest("#countPlus")) {
        state.count++; persist(); render();
      } else if (e.target.id === "photoSkip" || e.target.closest("#photoSkip") || e.target.id === "revealSkip" || e.target.closest("#revealSkip")) {
        next();
      }
    };
    $("custCancel").onclick = function () { $("custModal").hidden = true; };
    $("custForm").onsubmit = function (e) {
      e.preventDefault();
      var name = $("custName").value.trim();
      if (!name) { $("custError").hidden = false; return; }
      $("custError").hidden = true;
      state.customer.name = name;
      state.customer.address = $("custAddress").value.trim();
      $("custModal").hidden = true;
      persist();
      render();
      toast("Saved on this device");
    };
    // long-press brand noop safety
    var brand = $("brand");
    if (brand) brand.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  }

  function render() {
    renderNav();
    renderBody();
    renderSide();
  }

  restore();
  bind();
  render();
})();
