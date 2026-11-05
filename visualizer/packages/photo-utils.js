/*
 * Photo helpers for the AI preview: size math, aspect ratio, base64 size checks, and (in the browser)
 * downscaling a camera photo to a JPEG before it is kept or sent. Pure functions are shared with tests.
 */
(function (root) {
  var MAX_EDGE = 1536;          // long edge in pixels after downscale
  var JPEG_QUALITY = 0.85;      // first try
  var MIN_QUALITY = 0.55;       // never go below this
  var TARGET_BYTES = 2.5 * 1024 * 1024; // aim under this per photo after downscale
  var MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // server refuses images over this (functions/api/preview.js)
  var RATIOS = ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"];

  // Scale (w, h) so the long edge is at most maxEdge. Never upscales. Returns whole pixels, at least 1.
  function fitSize(w, h, maxEdge) {
    maxEdge = maxEdge || MAX_EDGE;
    w = Number(w) || 0; h = Number(h) || 0;
    if (w <= 0 || h <= 0) throw new Error("Image has no size");
    var s = Math.min(1, maxEdge / Math.max(w, h));
    return { w: Math.max(1, Math.round(w * s)), h: Math.max(1, Math.round(h * s)), scaled: s < 1 };
  }

  // Nearest aspect ratio the image model accepts, so the after picture keeps the photo's shape.
  function nearestRatio(w, h) {
    if (!(w > 0 && h > 0)) return null;
    var r = w / h, best = null, bestD = Infinity;
    RATIOS.forEach(function (s) {
      var p = s.split(":"), d = Math.abs(Math.log(r / (Number(p[0]) / Number(p[1]))));
      if (d < bestD) { bestD = d; best = s; }
    });
    return best;
  }

  // Bytes represented by a base64 string (no data: prefix).
  function base64Bytes(b64) {
    b64 = String(b64 || "").replace(/\s/g, "");
    if (!b64) return 0;
    var pad = b64.slice(-2) === "==" ? 2 : b64.slice(-1) === "=" ? 1 : 0;
    return Math.floor(b64.length * 3 / 4) - pad;
  }

  // Next JPEG quality to try when a downscaled photo is still too big, or null when it is fine or cannot go lower.
  function nextQuality(bytes, quality, target) {
    target = target || TARGET_BYTES;
    if (bytes <= target) return null;
    var q = Math.round((quality - 0.1) * 100) / 100;
    return q >= MIN_QUALITY ? q : null;
  }

  // ----- browser only -----
  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { resolve({ img: img, url: url }); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("That file is not a photo this device can open.")); };
      img.src = url; // Safari applies the camera rotation (EXIF) when drawing
    });
  }
  function toBlob(canvas, q) {
    return new Promise(function (resolve) { canvas.toBlob(function (b) { resolve(b); }, "image/jpeg", q); });
  }
  // File from <input type=file> -> { blob (JPEG), w, h }. Long edge about 1536 px.
  function downscale(file, maxEdge) {
    return loadImage(file).then(function (r) {
      var sz = fitSize(r.img.naturalWidth, r.img.naturalHeight, maxEdge);
      var c = document.createElement("canvas");
      c.width = sz.w; c.height = sz.h;
      var ctx = c.getContext("2d");
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
      ctx.drawImage(r.img, 0, 0, sz.w, sz.h);
      URL.revokeObjectURL(r.url);
      var q = JPEG_QUALITY;
      function attempt() {
        return toBlob(c, q).then(function (b) {
          if (!b) throw new Error("Could not prepare that photo.");
          var nq = nextQuality(b.size, q);
          if (nq == null) return { blob: b, w: sz.w, h: sz.h };
          q = nq; return attempt();
        });
      }
      return attempt();
    });
  }
  function blobToBase64(blob) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () { var s = String(fr.result); resolve(s.slice(s.indexOf(",") + 1)); };
      fr.onerror = function () { reject(fr.error); };
      fr.readAsDataURL(blob);
    });
  }

  var api = {
    MAX_EDGE: MAX_EDGE, MAX_UPLOAD_BYTES: MAX_UPLOAD_BYTES, TARGET_BYTES: TARGET_BYTES, RATIOS: RATIOS,
    fitSize: fitSize, nearestRatio: nearestRatio, base64Bytes: base64Bytes, nextQuality: nextQuality,
    downscale: downscale, blobToBase64: blobToBase64
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PhotoUtils = api;
})(typeof window !== "undefined" ? window : this);
