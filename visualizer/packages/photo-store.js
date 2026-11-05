/*
 * Keeps the bathroom photos (and the last AI picture) on this iPad only, in IndexedDB.
 * Nothing here uploads anything. Falls back to memory if IndexedDB is blocked (for example private browsing).
 */
(function (root) {
  var DB = "cincybath-photos", VER = 1, PHOTOS = "photos", PREVIEWS = "previews";
  var mem = { photos: {}, previews: {} };
  var dbp = null;

  function open() {
    if (dbp) return dbp;
    dbp = new Promise(function (resolve) {
      try {
        if (!root.indexedDB) return resolve(null);
        var req = root.indexedDB.open(DB, VER);
        req.onupgradeneeded = function () {
          var db = req.result;
          if (!db.objectStoreNames.contains(PHOTOS)) db.createObjectStore(PHOTOS, { keyPath: "id" });
          if (!db.objectStoreNames.contains(PREVIEWS)) db.createObjectStore(PREVIEWS, { keyPath: "id" });
        };
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { resolve(null); };
        req.onblocked = function () { resolve(null); };
      } catch (e) { resolve(null); }
    });
    return dbp;
  }
  function tx(store, mode, fn) {
    return open().then(function (db) {
      if (!db) return fn(null);
      return new Promise(function (resolve, reject) {
        var t = db.transaction(store, mode), s = t.objectStore(store), out;
        Promise.resolve(fn(s)).then(function (r) { out = r; });
        t.oncomplete = function () { resolve(out); };
        t.onerror = function () { reject(t.error); };
        t.onabort = function () { reject(t.error); };
      });
    });
  }
  function reqP(r) { return new Promise(function (res, rej) { r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; }); }
  function memKey(store) { return store === PHOTOS ? "photos" : "previews"; }

  function all(store) {
    return tx(store, "readonly", function (s) {
      if (!s) return Object.keys(mem[memKey(store)]).map(function (k) { return mem[memKey(store)][k]; });
      return reqP(s.getAll());
    }).then(function (list) { return (list || []).sort(function (a, b) { return (a.addedAt || 0) - (b.addedAt || 0); }); });
  }
  function put(store, rec) {
    return tx(store, "readwrite", function (s) { if (!s) { mem[memKey(store)][rec.id] = rec; return rec; } s.put(rec); return rec; })
      .catch(function () { mem[memKey(store)][rec.id] = rec; return rec; });
  }
  function del(store, id) {
    return tx(store, "readwrite", function (s) { if (!s) { delete mem[memKey(store)][id]; return; } s.delete(id); });
  }
  function clear(store) {
    return tx(store, "readwrite", function (s) { if (!s) { mem[memKey(store)] = {}; return; } s.clear(); });
  }

  root.PhotoStore = {
    listPhotos: function () { return all(PHOTOS); },
    putPhoto: function (rec) { return put(PHOTOS, rec); },
    removePhoto: function (id) { return del(PHOTOS, id); },
    clearPhotos: function () { return clear(PHOTOS); },
    getPreview: function () { return all(PREVIEWS).then(function (l) { return l.filter(function (p) { return p.id === "last"; })[0] || null; }); },
    setPreview: function (rec) { rec.id = "last"; return put(PREVIEWS, rec); },
    clearPreview: function () { return clear(PREVIEWS); },
    clearAll: function () { return Promise.all([clear(PHOTOS), clear(PREVIEWS)]); }
  };
})(typeof window !== "undefined" ? window : this);
