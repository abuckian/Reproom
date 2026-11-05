/*
 * Project scope ("Shower only" or "Full bathroom") and which steps show. Pure functions, shared with tests.
 * Shower only hides the Full Bath step and leaves its picks out of the total (they are kept in the state, so
 * switching back to Full bathroom brings them back). Prices themselves come only from pricing.js.
 */
(function (root) {
  var SCOPES = [
    { id: "shower", name: "Shower only", sub: "New tub or shower area. The rest of the room stays as it is." },
    { id: "full", name: "Full bathroom", sub: "New tub or shower plus vanity, toilet, flooring, and more." }
  ];

  function fullBathItemIds(C) {
    var ids = [];
    C.fullBath.groups.forEach(function (g) { g.items.forEach(function (it) { ids.push(it.id); }); });
    return ids;
  }
  function hasFullBathPicks(C, s) {
    if (!s) return false;
    if (s.vanitySource || s.vanity || s.toilet) return true;
    return fullBathItemIds(C).some(function (id) {
      return (s.picks && s.picks[id]) || (s.qty && Number(s.qty[id]) > 0) || (s.sqft && Number(s.sqft[id]) > 0);
    });
  }
  // Saved states from before the choice existed: full bathroom if they carry full bath picks, else shower only.
  function scopeOf(C, s) {
    if (s && (s.scope === "shower" || s.scope === "full")) return s.scope;
    return hasFullBathPicks(C, s) ? "full" : "shower";
  }
  // Copy of the state with every Full Bathroom pick removed (the original is not changed).
  function stripFullBath(C, s) {
    var o = JSON.parse(JSON.stringify(s || {}));
    o.vanitySource = null; o.vanity = null; o.vanityColor = null; o.vanityExtras = {};
    o.toilet = null; o.toiletShape = null; o.toiletHeight = null;
    fullBathItemIds(C).forEach(function (id) {
      if (o.picks) delete o.picks[id];
      if (o.qty) delete o.qty[id];
      if (o.sqft) delete o.sqft[id];
    });
    return o;
  }
  // The state that is priced, saved to deal records, and turned into the AI prompt.
  function effectiveState(C, s) { return scopeOf(C, s) === "full" ? s : stripFullBath(C, s); }
  function quote(C, P, s) { return P.computeQuote(C, effectiveState(C, s)); }

  // stepDefs: [{id,name}], o: { scope, hasLine, hasDoors, hasSeats }
  function visibleSteps(stepDefs, o) {
    o = o || {};
    return stepDefs.filter(function (st) {
      if (st.id === "fullbath") return o.scope === "full";
      if (!o.hasLine) return true;
      if (st.id === "doors") return !!o.hasDoors;
      if (st.id === "seats") return !!o.hasSeats;
      return true;
    });
  }

  var api = { SCOPES: SCOPES, fullBathItemIds: fullBathItemIds, hasFullBathPicks: hasFullBathPicks, scopeOf: scopeOf,
    stripFullBath: stripFullBath, effectiveState: effectiveState, quote: quote, visibleSteps: visibleSteps };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Flow = api;
})(typeof window !== "undefined" ? window : this);
