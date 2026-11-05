/*
 * Company catalog and prices. PRIVATE: do not publish or commit to a public repo.
 * Single source for every option and price in the app.
 * Transcribed from (private) (Ian's sheet, 2026-10-06).
 *
 * Field guide
 *   sheetLabel : text exactly as on the sheet (rep view, tests compare this to the sheet)
 *   label      : customer facing text (internal notes removed). Falls back to sheetLabel.
 *   repNote    : internal note, shown in rep view only
 *   star       : true = starred on the sheet = SUBJECT TO CHANGE (rep view only)
 *   type       : "fixed" (once), "per" (price x quantity), "sqft" (price x square feet),
 *                "pieces" (count of parts; first piecesIncluded free, price for each piece beyond that)
 *
 * Product line "prices" maps item id -> { price, star?, sheetLabel?, label? } for ONLY the items
 * that line lists on the sheet. Anything not listed is hidden for that line.
 */
(function (root) {
  var CATALOG = {
    meta: {
      company: "Company",
      source: "RepRoom bathroom option demo (no prices)",
      starNote: "Starred items are subject to change. Double check before locking a starred price on a quote or contract.",
      floorRatio: 0.95
    },

    // Locked charges added on top of a system that are not on the printed sheet (owner confirmed). Kept out of
    // lines[].prices so the sheet parity test stays one to one with the sheet.
    systemAdders: [
      { id: "soaker_purostone", line: "s3", type: "soaker", label: "Soaker tub with PuroStone", price: 0,
        repNote: "Not on the printed sheet. Owner confirmed 10/7/2026: a soaker tub (17, 19, or 21 in) with PuroStone walls is the PuroStone system base system." }
    ],

    wallColorsStandard: [
      { id: "white", name: "White", swatch: "#f6f5f1" },
      { id: "biscuit", name: "Biscuit", swatch: "#eadfc8" },
      { id: "almond", name: "Almond", swatch: "#e4d5bd" },
      { id: "sandbar", name: "Sandbar", swatch: "#cdbb9f" },
      { id: "gray", name: "Gray", swatch: "#b9bbbb" }
    ],
    puroStonePatterns: [
      { id: "marbled_ash", name: "Marbled Ash" },
      { id: "sahara", name: "Sahara" },
      { id: "stratus", name: "Stratus" },
      { id: "tundra", name: "Tundra" },
      { id: "coastal_mist", name: "Coastal Mist" }
    ],
    walkInTubColors: [
      { id: "white", name: "White", swatch: "#f6f5f1" },
      { id: "biscuit", name: "Biscuit", swatch: "#eadfc8" }
    ],
    walkInTubSizes: ["28x48", "30x52", "30x53", "32x52", "30x60"],

    // Trim finish: Chrome is included. BN, ORB, MB are the Premium Trim Package.
    trimFinishes: [
      { id: "chrome", name: "Chrome", included: true, swatch: "linear-gradient(135deg,#f4f6f8,#aeb6bd 45%,#eef1f3 60%,#9aa3ab)" },
      { id: "bn", name: "Brushed Nickel", abbr: "BN", item: "premium_trim", swatch: "linear-gradient(135deg,#d9d6cf,#a9a59c 50%,#cfcbc2)" },
      { id: "orb", name: "Oil Rubbed Bronze", abbr: "ORB", item: "premium_trim", swatch: "linear-gradient(135deg,#5a4434,#2e221a 55%,#6b513e)" },
      { id: "mb", name: "Matte Black", abbr: "MB", item: "premium_trim", swatch: "linear-gradient(135deg,#3a3b3d,#151617)" }
    ],

    // Fixture: Standard Moen valve is included on lines whose includes list it (not Walk-In Tubs).
    // Shower heads (Ian 10/7). "standard" is included on lines with a Moen valve; each paid head is the sheet's
    // Upgraded Fixture. The ids hh, hhs, rain are kept from the old picks (HH, HH+S, Rain) so saved designs carry
    // over: HH is now Removable Head, HH+S is Standard Head w/ Diverter, Rain is Rain Head.
    fixtureStandard: { id: "standard", name: "Standard Head", desc: "Fixed head on the wall" },
    fixtures: [
      { id: "hh", name: "Removable Head", desc: "Handheld you can take off the wall", item: "upgraded_fixture" },
      { id: "hhs", name: "Standard Head w/ Diverter", desc: "Adds a handheld, switch between the two", item: "upgraded_fixture" },
      { id: "rain", name: "Rain Head", desc: "Large overhead rain head", item: "upgraded_fixture" },
      { id: "rain_div", name: "Rain Head w/ Diverter", desc: "Rain head plus a handheld, switch between the two", item: "upgraded_fixture" }
    ],

    // Door choice (one per shower). Rod is included.
    doors: [
      { id: "rod", name: "Straight / Curved Rod", included: true },
      { id: "standard_door", item: "standard_door" },
      { id: "denali_door", item: "denali_door" },
      { id: "custom_door", item: "custom_door" }
    ],

    // Item definitions for the system lines (S1 to S5). Prices live on each line.
    items: {
      // Construction options
      mud_set:          { group: "construction", sheetLabel: "Mud Set Tile / Cast Iron Tearout" },
      garden_tub:       { group: "construction", sheetLabel: "Garden Tub Shower Combo Demo" },
      jetted_tub:       { group: "construction", sheetLabel: "Jetted Tub Removal" },
      soffit:           { group: "construction", sheetLabel: "Soffit Removal (must add CP)", label: "Soffit Removal", hint: "Ceiling Panel is required and added automatically", requires: "ceiling_panel" },
      ceiling_panel:    { group: "construction", sheetLabel: "Ceiling Panel" },
      mixer_valve:      { group: "construction", sheetLabel: "Moving Mixer Valve" },
      add_shower_head:  { group: "construction", sheetLabel: "Additional Shower Head" },
      oversize_walls:   { group: "construction", sheetLabel: "Oversize Walls (9ft Milestone)", label: "Oversize Walls (9ft)", repNote: "Milestone is the Toronto shower supplier." },
      over_36x60:       { group: "construction", sheetLabel: "Over 36 x 60 Size", repNote: "Added automatically when a PuroStone shower is over 36x60 (size step). Rule read from the sheet line; confirm with Ian." },
      build_wall:       { group: "construction", sheetLabel: "Build Wall for Shower (Drywall/Wrap)" },
      remove_wall:      { group: "construction", sheetLabel: "Remove Wall" },
      window_kit:       { group: "construction", sheetLabel: "Window Kit (Calcutta=White)", label: "Window Kit", repNote: "Sheet says \"Calcutta=White\". Meaning not confirmed." },
      move_drain:       { group: "construction", sheetLabel: "Move Drain" },

      // Upgrades
      premium_wall:      { group: "upgrade", step: "walls", sheetLabel: "Premium Wall Upgrade", label: "Simulated Tile 11x20 (Milestone)",
                           wallStyle: { id: "sim_tile_11x20", name: "Simulated Tile 11x20 (Milestone)", sub: "Milestone Wall Systems", colors: ["white"] },
                           repNote: "Confirmed from a signed Company contract (9/30/2026): Milestone Wall Systems kit, White, 11x20 Tile (Simulated Tile) sold as the Premium Wall Upgrade. Other premium wall options may exist but are unconfirmed.",
                           colorNote: "White is the only confirmed color for Simulated Tile. Other colors are unconfirmed." },
      color_matched:     { group: "upgrade", step: "walls", sheetLabel: "Color Matched (BCI color match)", label: "Color Matched", repNote: "BCI is Bath Concepts (Chicago supplier)." },
      premium_trim:      { group: "upgrade", step: "trim", sheetLabel: "Premium Trim Package (BN, ORB, MB)", label: "Premium Trim Package" },
      upgraded_fixture:  { group: "upgrade", step: "fixture", sheetLabel: "Upgraded Fixture (Rain, HH, HH+S)", label: "Upgraded Fixture" },
      add_shower_option: { group: "upgrade", step: "fixture", sheetLabel: "Add Shower Option" },
      standard_door:     { group: "upgrade", step: "doors", sheetLabel: "Standard Door" },
      denali_door:       { group: "upgrade", step: "doors", sheetLabel: "Denali Door (exposed roller)", label: "Denali Door", hint: "Exposed roller" },
      custom_door:       { group: "upgrade", step: "doors", sheetLabel: "Custom Door (inline & swings)", label: "Custom Door", hint: "Inline and swings" },
      frosted_glass:     { group: "upgrade", step: "doors", sheetLabel: "Frosted Glass (no tub Denali)", label: "Frosted Glass", repNote: "Sheet says \"no tub Denali\". Not enforced until Ian confirms." },
      add_shelves_gbs:   { group: "upgrade", step: "shelves", sheetLabel: "Additional Shelves and GBs", label: "Grab bars and shelves",
                           type: "pieces", piecesIncluded: 4,
                           pieceParts: [ { id: "grab_bars", name: "Grab Bars", default: 2 }, { id: "corner_shelves", name: "Corner Shelves", default: 2 } ],
                           repNote: "Ian 10/7: 4 grab bars or corner shelves included in any mix;  for each piece beyond 4 combined." },
      foot_pedestal:     { group: "upgrade", step: "seats", sheetLabel: "Foot Pedestal (trim match)", label: "Foot Pedestal", hint: "Trim match" },
      folding_seat:      { group: "upgrade", step: "seats", sheetLabel: "Folding Seat (any color)", label: "Folding Seat", hint: "Any color" },
      bench_seat:        { group: "upgrade", step: "seats", sheetLabel: "Bench Seat" },
      metal_shelves:     { group: "upgrade", step: "shelves", sheetLabel: "Metal Corner Shelves (trim match)", label: "Metal Corner Shelves", hint: "Trim match" }
    },

    lines: [
      {
        id: "s1",
        sheet: "1",
        sheetName: "Standard Walk-in Showers & Tub/Shower Combos",
        name: "Standard Walk-in Shower or Tub/Shower Combo",
        cardName: "Standard Walk-in Shower / Tub Combo",
        basePrice: 0,
        sizeText: "Max shower pan 36x60. Max tub 34x60x17.",
        fit: { shower: [36, 60], tub: [34, 60] },
        walls: "standard",
        wallNote: "Can color match pan/tub",
        includes: [
          "Tearout of fiberglass, acrylic, or tile on drywall (does not include mud or cast)",
          "Standard wall system (White, Biscuit, Almond, Sandbar, Gray)",
          "Chrome accessories: standard Moen valve, grab bars, straight/curved rod",
          "4 grab bars or corner shelves in any mix (corner shelves color matched)"
        ],
        hasMoenValve: true,
        prices: {
          mud_set: { price: 0 }, garden_tub: { price: 0 }, jetted_tub: { price: 0 },
          soffit: { price: 0 }, ceiling_panel: { price: 0 }, mixer_valve: { price: 0 },
          add_shower_head: { price: 0 }, oversize_walls: { price: 0 }, build_wall: { price: 0 },
          remove_wall: { price: 0 }, window_kit: { price: 0 }, move_drain: { price: 0 },
          premium_wall: { price: 0 }, premium_trim: { price: 0 }, upgraded_fixture: { price: 0 },
          standard_door: { price: 0 }, denali_door: { price: 0 }, custom_door: { price: 0 },
          frosted_glass: { price: 0 }, add_shelves_gbs: { price: 0 }, foot_pedestal: { price: 0 },
          folding_seat: { price: 0 }, bench_seat: { price: 0 }, metal_shelves: { price: 0 },
          color_matched: { price: 0 }
        }
      },
      {
        id: "s2",
        sheet: "2",
        sheetName: "19\" Soaker Tubs",
        name: "19\" Soaker Tub",
        cardName: "19\" Soaker Tub",
        basePrice: 0,
        sizeText: "Max width 34\", max length 60\".",
        fit: { any: [34, 60] },
        walls: "standard",
        wallNote: "Can color match BCI",
        includes: [
          "Tearout of fiberglass, acrylic, or tile on drywall (does not include mud or cast)",
          "Standard wall system (White, Biscuit, Almond, Sandbar, Gray)",
          "Chrome accessories: standard Moen valve, grab bars, straight/curved rod",
          "4 grab bars or corner shelves in any mix (corner shelves color matched)"
        ],
        hasMoenValve: true,
        prices: {
          mud_set: { price: 0 }, garden_tub: { price: 0 }, jetted_tub: { price: 0 },
          soffit: { price: 0 }, ceiling_panel: { price: 0 }, mixer_valve: { price: 0 },
          oversize_walls: { price: 0 }, build_wall: { price: 0 }, remove_wall: { price: 0 },
          window_kit: { price: 0 }, move_drain: { price: 0 },
          premium_wall: { price: 0 }, premium_trim: { price: 0 }, upgraded_fixture: { price: 0 },
          standard_door: { price: 0 }, denali_door: { price: 0 }, frosted_glass: { price: 0 },
          add_shelves_gbs: { price: 0 }, metal_shelves: { price: 0 }, color_matched: { price: 0 }
        }
      },
      {
        id: "s3",
        sheet: "3",
        sheetName: "PuroStone Walk-in Showers / Tub Shower Combo",
        name: "PuroStone Walk-in Shower or Tub/Shower Combo",
        cardName: "PuroStone Walk-in Shower / Tub Combo",
        basePrice: 0,
        sizeText: "All sizes up to 48x72.",
        fit: { any: [48, 72] },
        walls: "purostone",
        includes: [
          "Tearout of fiberglass, acrylic, or tile on drywall (does not include mud or cast)",
          "PuroStone wall system (Marbled Ash, Sahara, Stratus, Tundra, Coastal Mist)",
          "Chrome accessories: standard Moen valve, 2 grab bars, straight/curved rod",
          "2 metal shelves (trim matched); shelves and grab bars can mix and match to equal 4"
        ],
        hasMoenValve: true,
        prices: {
          mud_set: { price: 0, star: true }, garden_tub: { price: 0, star: true }, jetted_tub: { price: 0 },
          mixer_valve: { price: 0 }, add_shower_head: { price: 0 }, over_36x60: { price: 0, star: true },
          build_wall: { price: 0, star: true, sheetLabel: "Build Wall for Shower (Drywall)" },
          remove_wall: { price: 0 },
          window_kit: { price: 0, sheetLabel: "Window Kit", repNote: "" },
          move_drain: { price: 0 },
          premium_trim: { price: 0 }, upgraded_fixture: { price: 0 },
          standard_door: { price: 0, star: true }, denali_door: { price: 0, star: true },
          custom_door: { price: 0, star: true }, frosted_glass: { price: 0 },
          add_shelves_gbs: { price: 0, sheetLabel: "Additional GBs", label: "Additional Grab Bars", type: "fixed", repNote: "Sheet lists \"Additional GBs\" only. Extra grab bars and shelves as add-ons." },
          foot_pedestal: { price: 0 }, folding_seat: { price: 0 }, metal_shelves: { price: 0 }
        }
      },
      {
        id: "s4",
        sheet: "4",
        sheetName: "Walk-In Tubs",
        name: "Walk-In Tub",
        cardName: "Walk-In Tub",
        basePrice: 0,
        sizeText: "Sizes: 28x48, 30x52, 30x53, 32x52, 30x60.",
        fit: null,
        walls: "standard",
        wallNote: "White or biscuit tub",
        includes: [
          "Tearout of fiberglass, acrylic, or tile on drywall (does not include mud or cast)",
          "Standard wall system (White, Biscuit, Almond, Sandbar, Gray)",
          "Chrome accessories: grab bars, straight/curved rod",
          "4 grab bars or corner shelves in any mix (corner shelves color matched)",
          "Mandatory electrical work"
        ],
        hasMoenValve: false,
        prices: {
          mud_set: { price: 0 }, garden_tub: { price: 0 }, jetted_tub: { price: 0 },
          soffit: { price: 0 }, ceiling_panel: { price: 0 }, mixer_valve: { price: 0 },
          oversize_walls: { price: 0 }, build_wall: { price: 0 }, remove_wall: { price: 0 },
          window_kit: { price: 0 },
          premium_wall: { price: 0 }, add_shower_option: { price: 0, star: true },
          premium_trim: { price: 0 }, upgraded_fixture: { price: 0 },
          add_shelves_gbs: { price: 0 }, metal_shelves: { price: 0 }
        }
      },
      {
        id: "s5",
        sheet: "5",
        sheetName: "Extra Large Walk-in Showers",
        name: "Extra Large Walk-in Shower",
        cardName: "Extra Large Walk-in Shower",
        basePrice: 0,
        sizeText: "Pan size 36x60 to 48x72.",
        fit: { range: [[36, 60], [48, 72]] },
        walls: "standard",
        includes: [
          "Tearout of fiberglass, acrylic, or tile on drywall (does not include mud or cast)",
          "Standard wall system (White, Biscuit, Almond, Sandbar, Gray)",
          "Chrome accessories: standard Moen valve, grab bars, straight/curved rod",
          "4 grab bars or corner shelves in any mix (corner shelves color matched)"
        ],
        hasMoenValve: true,
        prices: {
          mud_set: { price: 0, star: true }, garden_tub: { price: 0, star: true }, jetted_tub: { price: 0 },
          soffit: { price: 0, star: true }, ceiling_panel: { price: 0, star: true }, mixer_valve: { price: 0 },
          add_shower_head: { price: 0 }, oversize_walls: { price: 0, star: true },
          build_wall: { price: 0, star: true }, remove_wall: { price: 0 }, window_kit: { price: 0 },
          move_drain: { price: 0 },
          premium_wall: { price: 0, star: true }, premium_trim: { price: 0 }, upgraded_fixture: { price: 0 },
          standard_door: { price: 0, star: true }, denali_door: { price: 0, star: true },
          custom_door: { price: 0, star: true }, frosted_glass: { price: 0 }, add_shelves_gbs: { price: 0 },
          foot_pedestal: { price: 0 }, folding_seat: { price: 0 }, bench_seat: { price: 0 },
          metal_shelves: { price: 0 }, color_matched: { price: 0 }
        }
      }
    ],

    // Section 6: Full Bathroom Options (same for every line)
    fullBath: {
      repNote: "Sheet: Almost everything we can do is here. If it's not listed, must call and ask for clearance; full baths have been hindering production. Keep jobs simple and efficient. Max 4 to 5 working days.",
      vanity: {
        sources: [
          {
            id: "cs",
            sheetGroup: "Vanity, Customer Supplied",
            name: "Customer Supplied",
            desc: "You provide the top, sidesplash, backsplash, and fixtures. We provide all plumbing.",
            sizes: [
              { id: "vanity_cs_0_36", sheetLabel: "0-36 in Vanity", price: 0 },
              { id: "vanity_cs_37_60", sheetLabel: "37-60 in Vanity", price: 0 },
              { id: "vanity_cs_61", sheetLabel: "61+ in Vanity", price: 0 }
            ],
            extras: [
              { id: "vanity_cs_stair", key: "stair", sheetLabel: "Stair Charge (if stairs involved)", label: "Stair Charge", hint: "If stairs are involved", price: 0 },
              { id: "vanity_cs_double", key: "double", sheetLabel: "Turning Single to Double", price: 0 },
              { id: "vanity_cs_drywall", key: "drywall", sheetLabel: "Drywall Touch Ups (steer away)", label: "Drywall Touch Ups", price: 0, repNote: "Steer away." }
            ]
          },
          {
            id: "cb",
            sheetGroup: "Vanity, Company Supplied",
            name: "Company Supplied",
            desc: "We provide everything. Builder surplus, shaker style doors.",
            colors: [
              { id: "grey", name: "Grey", swatch: "#8d9094" },
              { id: "white", name: "White", swatch: "#f6f5f1" },
              { id: "blue", name: "Blue", swatch: "#3f5a78" },
              { id: "light_wood", name: "Light Wood", swatch: "linear-gradient(135deg,#d8bf98,#c3a476)" },
              { id: "dark_wood", name: "Dark Wood", swatch: "linear-gradient(135deg,#6a4a31,#4a3221)" }
            ],
            sizes: [
              { id: "vanity_cb_0_36", sheetLabel: "0-36 in Vanity", price: 0 },
              { id: "vanity_cb_37_60", sheetLabel: "37-60 in Vanity", price: 0 },
              { id: "vanity_cb_61", sheetLabel: "61+ in Vanity", price: 0 }
            ],
            extras: [
              { id: "vanity_cb_stair", key: "stair", sheetLabel: "Stair Charge (if stairs involved)", label: "Stair Charge", hint: "If stairs are involved", price: 0 },
              { id: "vanity_cb_double", key: "double", sheetLabel: "Turning Single to Double", price: 0 },
              { id: "vanity_cb_drywall", key: "drywall", sheetLabel: "Drywall Touch Ups (steer away)", label: "Drywall Touch Ups", price: 0, repNote: "Steer away." }
            ]
          }
        ]
      },
      toilet: {
        sheetGroup: "Toilet",
        desc: "Round or elongated; 15, 16.5, or 19 inch heights.",
        repNote: "Customer supplied must be a normal toilet. Use common sense. NEVER MOVING TOILETS.",
        shapes: ["Round", "Elongated"],
        heights: ["15 in", "16.5 in", "19 in"],
        options: [
          { id: "toilet_kohler", sheetLabel: "Kohler Toilet", price: 0 },
          { id: "toilet_cust", sheetLabel: "Customer Supplied", label: "Customer Supplied Toilet", price: 0 }
        ]
      },
      groups: [
        {
          id: "drywall",
          sheetGroup: "Drywall",
          name: "Drywall",
          desc: "Drywall gets 1 coat plus tape.",
          repNote: "We no longer prep for paint unless we're painting.",
          items: [
            { id: "dw_touchups", sheetLabel: "Drywall Touch Ups", type: "per", price: 0 },
            { id: "dw_replace_wall", sheetLabel: "Drywall Replacement Per Wall", type: "per", price: 0, unitName: "wall" },
            { id: "dw_ceiling", sheetLabel: "Drywall Ceiling Replacement", type: "fixed", price: 0 },
            { id: "dw_mud_conv", sheetLabel: "Mud to Drywall Conversion", type: "fixed", price: 0 },
            { id: "dw_paint_wall", sheetLabel: "Painting Per Wall (try not to sell)", label: "Painting Per Wall", type: "per", price: 0, unitName: "wall", repNote: "Try not to sell." }
          ]
        },
        {
          id: "flooring",
          sheetGroup: "Flooring",
          name: "Flooring",
          desc: "We provide the flooring, underlayment, and trim or quarter round.",
          items: [
            { id: "fl_lvp", sheetLabel: "LVP / LVT Flooring", type: "sqft", price: 0 },
            { id: "fl_subfloor", sheetLabel: "Subfloor Replacement (additional)", type: "sqft", price: 0 }
          ]
        },
        {
          id: "accessories",
          sheetGroup: "Accessories",
          name: "Accessories",
          desc: "Accessory Pack includes 1 towel rod, 1 towel ring, and TP holder.",
          repNote: "Try to have customer supply. Mirror: try customer supply; must do customer supplied light fixture. Fan install must be same size in same place (customer supplied).",
          items: [
            { id: "acc_pack", sheetLabel: "Accessory Pack (trim match)", type: "fixed", price: 0 },
            { id: "acc_mirror_medcab", sheetLabel: "Mirror / Flush Med Cab (trim match)", type: "fixed", price: 0 },
            { id: "acc_medcab_insert", sheetLabel: "Medicine Cabinet Insert (cust supp)", type: "fixed", price: 0 },
            { id: "acc_cust_acc", sheetLabel: "Customer Supplied Accessories", type: "per", price: 0 },
            { id: "acc_cust_mirror", sheetLabel: "Customer Supplied Mirror", type: "fixed", price: 0 },
            { id: "acc_cust_light", sheetLabel: "Customer Supply Light Fixtures", type: "per", price: 0, unitName: "fixture" }
          ]
        },
        {
          id: "electrical",
          sheetGroup: "Electrical",
          name: "Electrical",
          repNote: "Subbed out. Be very careful and sell away from this.",
          items: [
            { id: "el_can_lights", sheetLabel: "Adding Can Lights (subbed out)", label: "Adding Can Lights", type: "per", price: 0, unitName: "light", repNote: "Subbed out." },
            { id: "el_outlets", sheetLabel: "Adding Outlets", type: "per", price: 0, unitName: "outlet" },
            { id: "el_fan", sheetLabel: "Customer Supply Fan", type: "fixed", price: 0 }
          ]
        }
      ]
    }
  };

  if (typeof module !== "undefined" && module.exports) module.exports = CATALOG;
  else root.CATALOG = CATALOG;
})(typeof window !== "undefined" ? window : this);
