// src/state/useDesignerStore.jsx
import { create } from "zustand";

//
// === BASE PATHS ===
//
const ASSETS_BASE =
  typeof window !== "undefined" &&
    window.ARTON360 &&
    window.ARTON360.assetsBase
    ? window.ARTON360.assetsBase
    : "/mockups";

//
// === NORMAL (BOX) MOCKUP MAPPING ===
//
// NEW: use your real mockup filenames inside /public/mockups
const MOCKUPS_FRONT = {
  white: `${ASSETS_BASE}/white.jpg`,
  black: `${ASSETS_BASE}/black.jpg`,
  charcoal: `${ASSETS_BASE}/charcoal.jpg`,
  cardinal: `${ASSETS_BASE}/cardinal.jpg`,
  daisy: `${ASSETS_BASE}/daisy.jpg`,
  azalea: `${ASSETS_BASE}/azalea.jpg`,
  "brown-savanna": `${ASSETS_BASE}/brown-savanna.jpg`
};

//
// === REGULAR TEE (BOX) MOCKUP MAPPING ===
// files live in /public/mockups/*.jpg
//
const REGULAR_COLORS = [
  { key: "white", file: "white.jpg", hex: "#ffffff", label: "White" },
  { key: "black", file: "black.jpg", hex: "#000000", label: "Black" },
  { key: "charcoal", file: "charcoal.jpg", hex: "#36454F", label: "Charcoal" },
  { key: "cardinal", file: "cardinal.jpg", hex: "#8B0000", label: "Cardinal" },
  { key: "daisy", file: "daisy.jpg", hex: "#FFD100", label: "Daisy" },
  { key: "azalea", file: "azalea.jpg", hex: "#FF66B2", label: "Azalea" },
  { key: "brown-savanna", file: "brown-savanna.jpg", hex: "#6B3F2A", label: "Brown Savanna" },
  // ✅ NEW COLORS (add mockups in /public/mockups/ with these filenames)
  { key: "ash", file: "ash.jpg", hex: "#d6d6d6", label: "Ash", tone: "light" },
  { key: "carolina-blue", file: "carolina-blue.jpg", hex: "#66aee8", label: "Carolina Blue", tone: "light" },
  { key: "dark-chocolate", file: "dark-chocolate.jpg", hex: "#3b2616", label: "Dark Chocolate", tone: "dark" },
  { key: "forest-green", file: "forest-green.jpg", hex: "#0b3d2e", label: "Forest Green", tone: "dark" },
  { key: "gold", file: "gold.jpg", hex: "#f2c100", label: "Gold", tone: "light" },
  { key: "graphite-heather", file: "graphite-heather.jpg", hex: "#6b6f74", label: "Graphite Heather", tone: "dark" },
  { key: "heliconia", file: "heliconia.jpg", hex: "#ff2ea6", label: "Heliconia", tone: "light" },
  { key: "ice-grey", file: "ice-grey.jpg", hex: "#e8eaed", label: "Ice Grey", tone: "light" },
  { key: "irish-green", file: "irish-green.jpg", hex: "#00a651", label: "Irish Green", tone: "light" },
  { key: "light-blue", file: "light-blue.jpg", hex: "#b7d9f7", label: "Light Blue", tone: "light" },
  { key: "light-pink", file: "light-pink.jpg", hex: "#ffd1dc", label: "Light Pink", tone: "light" },
  { key: "lime", file: "lime.jpg", hex: "#b7e300", label: "Lime", tone: "light" },
  { key: "maroon", file: "maroon.jpg", hex: "#5a0f1b", label: "Maroon", tone: "dark" },
  { key: "military-green", file: "military-green.jpg", hex: "#4b5d3a", label: "Military Green", tone: "dark" },
  { key: "natural", file: "natural.jpg", hex: "#f1e4cf", label: "Natural", tone: "light" },
  { key: "navy", file: "navy.jpg", hex: "#0b1f3a", label: "Navy", tone: "dark" },
  { key: "orange", file: "orange.jpg", hex: "#ff7a00", label: "Orange", tone: "light" },
  { key: "red", file: "red.jpg", hex: "#d0021b", label: "Red", tone: "dark" },
  { key: "royal", file: "royal.jpg", hex: "#1f4ed8", label: "Royal", tone: "dark" },
  { key: "sand", file: "sand.jpg", hex: "#d9c6a5", label: "Sand", tone: "light" },
  { key: "sapphire", file: "sapphire.jpg", hex: "#0f52ba", label: "Sapphire", tone: "dark" },
  { key: "sky", file: "sky.jpg", hex: "#87ceeb", label: "Sky", tone: "light" },
  { key: "sport-grey", file: "sport-grey.jpg", hex: "#c9c9c9", label: "Sport Grey", tone: "light" },
  { key: "tropical-blue", file: "tropical-blue.jpg", hex: "#00a6d6", label: "Tropical Blue", tone: "light" },
  { key: "turf-green", file: "turf-green.jpg", hex: "#2e8b57", label: "Turf Green", tone: "dark" },
  { key: "yellow-haze", file: "yellow-haze.jpg", hex: "#f7e36d", label: "Yellow Haze", tone: "light" }
];

/**
 * Simple heuristic: is a hex color "light" (bright enough for dark text)?
 */
const isLightColor = (hex) => {
  if (!hex || hex.length < 4) return true;
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  // Perceived brightness (ITU-R BT.709)
  return (0.299 * r + 0.587 * g + 0.114 * b) > 140;
};

/**
 * Get front mockup URL for a color.
 * Accepts an optional colors array (for use inside store actions after WP colors load).
 * Falls back to REGULAR_COLORS (hardcoded) if no array is provided.
 */
const regularMockupFront = (colorKey, colorsOverride) => {
  const colors = colorsOverride || REGULAR_COLORS;
  const found = colors.find((c) => c.key === colorKey) || colors[0];

  // If the color has a full mockup URL from WordPress, use that
  if (found.mockupUrl) {
    return found.mockupUrl;
  }

  // Otherwise use local mockup file path
  return `/mockups/${found.file}`;
};

// helper: returns { front, back } mockup URLs for regular (box) tee
const colorToMockups = (colorKey) => ({
  front: regularMockupFront(colorKey),
  back: regularMockupFront(colorKey), // use front image for back until separate back mockups exist
});

// helper to make stable IDs for design items
const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;



//
// === FULL-SHIRT MOCKUP MAPPING (FRONT/BACK, ALL COLOURS) ===
//   files live in /mockups/full_mask_tshirt
//
const normalizeForFull = (color) => (color === "gray" ? "grey" : color);

const fullFrontMockup = (color) => {
  const c = normalizeForFull(color);
  switch (c) {
    case "black":
      return "/mockups/full_mask_tshirt/tshirt_full_black.jpg";
    case "blue":
      return "/mockups/full_mask_tshirt/tshirt_full_blue.jpg";
    case "grey":
      return "/mockups/full_mask_tshirt/tshirt_full_grey.jpg";
    case "red":
      return "/mockups/full_mask_tshirt/tshirt_full_red.jpg";
    case "white":
    default:
      return "/mockups/full_mask_tshirt/tshirt_full_white.jpg";
  }
};

const fullBackMockup = (color) => {
  const c = normalizeForFull(color);
  switch (c) {
    case "black":
      return "/mockups/full_mask_tshirt/tshirt_full_back_black.jpg";
    case "blue":
      return "/mockups/full_mask_tshirt/tshirt_full_back_blue.jpg";
    case "grey":
      return "/mockups/full_mask_tshirt/tshirt_full_back_grey.jpg";
    case "red":
      return "/mockups/full_mask_tshirt/tshirt_full_back_red.jpg";
    case "white":
    default:
      return "/mockups/full_mask_tshirt/tshirt_full_white_back.jpg";
  }
};

//
// Default listing meta FOR ONE DESIGN
//
const createEmptyMeta = (productType = "tshirts") => ({
  title: "",
  description: "",
  categorySlug: productType === "graphic-tshirt" ? "graphic-tshirt" : "tshirts",
  artType: "",
  tags: [],
  currency: "USD",
  price: "",
  vendorMatureFlag: false,
  albumId: "",
  publishedUrl: "",
});

export const useDesignerStore = create((set, get) => ({
  setProductTypeForActive: (productType) =>
    set((state) => {
      const designs = [...state.tshirtDesigns];
      const active = designs[state.activeDesignIndex];
      if (!active) return {};

      const side = state.activeSide || "front";
      const sideObj = active.sides?.[side];
      if (!sideObj) return {};

      active.productType = productType;

      if (productType === "graphic-tshirt") {
        sideObj.mockup = "/mockups/graphic_tshirt.jpg";
        sideObj.printType = "mask";
        sideObj.maskUrl = "/mockups/graphic_tshirt_mask.png";
        sideObj.isFullPrint = true;
      } else {
        // default back to regular tee
        sideObj.mockup = regularMockupFront(active.color || "white", state.regularColors);
        sideObj.printType = "box";
        sideObj.maskUrl = null;
        sideObj.isFullPrint = false;
      }

      // Also update categorySlug in designMetas
      const metas = [...state.designMetas];
      if (metas[state.activeDesignIndex]) {
        metas[state.activeDesignIndex] = {
          ...metas[state.activeDesignIndex],
          categorySlug: productType === "graphic-tshirt" ? "graphic-tshirt" : "tshirts",
        };
      }

      return { tshirtDesigns: designs, designMetas: metas };
    }),

  // ====== Fabric instance ======
  canvas: null,
  setCanvas: (c) => set({ canvas: c }),
  regularColors: REGULAR_COLORS,
  albums: [],
  albumsLoaded: false,

  fetchAlbumsFromWP: async (siteUrl) => {
    try {
      const url = `${siteUrl}/wp-json/arton360/v1/albums`;
      const resp = await fetch(url, {
        credentials: "include",
        headers: { "X-WP-Nonce": window.ARTON360?.nonce || "" },
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const albums = await resp.json();
      if (Array.isArray(albums)) {
        console.log(`[ARTON360] Loaded ${albums.length} albums`);
        set({ albums, albumsLoaded: true });
      }
    } catch (err) {
      console.warn("[ARTON360] Failed to fetch albums:", err.message);
      set({ albumsLoaded: true });
    }
  },

  createAlbum: async (name) => {
    const config = window.ARTON360 || {};
    if (!config.site || !config.nonce) return null;
    try {
      const resp = await fetch(`${config.site}/wp-json/arton360/v1/albums`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-WP-Nonce": config.nonce,
        },
        body: JSON.stringify({ name }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const newAlbum = await resp.json();
      if (newAlbum.id) {
        set((state) => ({ albums: [...state.albums, newAlbum] }));
        return newAlbum;
      }
      return null;
    } catch (err) {
      console.error("[ARTON360] Failed to create album:", err.message);
      return null;
    }
  },


  // ====== Dynamic color loading from WordPress taxonomy ======
  colorsLoaded: false,

  /**
   * Fetch available colors from WordPress pa_color taxonomy.
   * Falls back to hardcoded REGULAR_COLORS if fetch fails.
   * Called from main.jsx when ARTON360_CONFIG is received.
   */
  fetchColorsFromWP: async (siteUrl) => {
    try {
      const url = `${siteUrl}/wp-json/arton360/v1/colors`;
      const resp = await fetch(url, { credentials: "include" });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const wpColors = await resp.json();
      if (!Array.isArray(wpColors) || wpColors.length === 0) {
        console.warn("[ARTON360] No colors returned from WP, using defaults");
        set({ colorsLoaded: true });
        return;
      }

      // Map WP colors to the format used by the store
      const mapped = wpColors.map((c) => ({
        key: c.key,
        label: c.label,
        hex: c.hex || "#cccccc",
        file: `${c.key}.jpg`, // fallback filename
         mockupUrl: (c.mockupUrl || "").replace(/\.png$/i, ".jpg"), // convert .png to .jpg
        tone: isLightColor(c.hex) ? "light" : "dark",
      }));

      console.log(`[ARTON360] Loaded ${mapped.length} colors from WordPress`);
      set({ regularColors: mapped, colorsLoaded: true });
    } catch (err) {
      console.warn("[ARTON360] Failed to fetch colors from WP, using defaults:", err.message);
      set({ colorsLoaded: true });
    }
  },


  // ====== T-shirt list ======
  tshirtDesigns: [
    // {
    //   productType: "tshirts", // regular
    //   color: "white",
    //   sides: {
    //     front: {
    //       mockup: regularMockupFront("white"),
    //       designs: [],
    //       // keep isFullPrint in case you need later, but regular box only for now
    //       isFullPrint: false,
    //       // ✅ NEW (future-proof)
    //       printType: "box",   // "box" | "mask"
    //       maskUrl: null,      // used when printType === "mask"
    //     },
    //   },
    // },
    // // ✅ Graphic T-shirt (full print via mask)
    // {
    //   productType: "graphic-tshirt",
    //   color: "white",
    //   sides: {
    //     front: {
    //       mockup: "/mockups/graphic_tshirt.png",
    //       designs: [],
    //       isFullPrint: true,
    //       printType: "mask",
    //       maskUrl: "/mockups/graphic_tshirt_mask.png",
    //     },
    //   },
    // },
  ],


  // ====== Per-design listing metadata (1 meta per shirt) ======
  designMetas: [],

  // ====== Active Design Index Handling ======
  activeDesignIndex: 0,

  setActiveDesignIndex: (i) =>
    set((state) => {
      const count = state.tshirtDesigns.length;
      if (count === 0) return { activeDesignIndex: 0, designMetas: [] };

      const max = count - 1;
      const clamped = Math.max(0, Math.min(i, max));

      const metas = [...state.designMetas];
      if (!metas[clamped]) {
        const pt = state.tshirtDesigns?.[clamped]?.productType || "tshirts";
        metas[clamped] = createEmptyMeta(pt);
      }

      return { activeDesignIndex: clamped, designMetas: metas };
    }),

  nextDesign: () =>
    set((state) => {
      const total = state.tshirtDesigns.length;
      if (total === 0) return {};

      const current = state.activeDesignIndex ?? 0;
      if (current >= total - 1) return {};

      const newIndex = current + 1;

      const metas = [...state.designMetas];
      if (!metas[newIndex]) {
        const pt = state.tshirtDesigns?.[newIndex]?.productType || "tshirts";
        metas[newIndex] = createEmptyMeta(pt);
      }

      return { activeDesignIndex: newIndex, designMetas: metas };
    }),
  
  removeDesign: (index) =>
    set((state) => {
      const designs = [...state.tshirtDesigns];
      const metas = [...state.designMetas];
      if (designs.length === 0) return {};
      const i = index !== undefined ? index : state.activeDesignIndex;
      if (i < 0 || i >= designs.length) return {};
      designs.splice(i, 1);
      metas.splice(i, 1);
      let newIndex = state.activeDesignIndex;
      if (designs.length === 0) {
        newIndex = 0;
      } else if (newIndex >= designs.length) {
        newIndex = designs.length - 1;
      }
      return { tshirtDesigns: designs, designMetas: metas, activeDesignIndex: newIndex };
    }),

  prevDesign: () =>
    set((state) => {
      const total = state.tshirtDesigns.length;
      if (total === 0) return {};

      const current = state.activeDesignIndex ?? 0;
      if (current <= 0) return {};

      const newIndex = current - 1;

      const metas = [...state.designMetas];
      if (!metas[newIndex]) {
        const pt = state.tshirtDesigns?.[newIndex]?.productType || "tshirts";
        metas[newIndex] = createEmptyMeta(pt);
      }

      return { activeDesignIndex: newIndex, designMetas: metas };
    }),

  // ====== Active Side ======
  activeSide: "front",
  setActiveSide: (side) => set({ activeSide: side }),

  // ============================================================
  //    FULL-SHIRT MODE (PER SIDE)
  // ============================================================

  toggleFullPrintForActiveSide: () =>
    set((state) => {
      const designs = [...state.tshirtDesigns];
      const active = designs[state.activeDesignIndex];
      if (!active) return {};

      const side = state.activeSide || "front";
      const sideObj = active.sides[side];

      sideObj.isFullPrint = !sideObj.isFullPrint;

      if (sideObj.isFullPrint) {
        // turning ON → use full-shirt mockup for current colour
        sideObj.mockup =
          side === "front"
            ? fullFrontMockup(active.color || "white")
            : fullBackMockup(active.color || "white");
      } else {
        // turning OFF → back to normal chest mockups
        const files = colorToMockups(active.color || "white");
        sideObj.mockup = side === "front" ? files.front : files.back;
      }

      return { tshirtDesigns: designs };
    }),

  setFullPrintForActiveSide: (value) =>
    set((state) => {
      const designs = [...state.tshirtDesigns];
      const active = designs[state.activeDesignIndex];
      if (!active) return {};

      const side = state.activeSide || "front";
      const sideObj = active.sides[side];

      sideObj.isFullPrint = !!value;

      if (sideObj.isFullPrint) {
        sideObj.mockup =
          side === "front"
            ? fullFrontMockup(active.color || "white")
            : fullBackMockup(active.color || "white");
      } else {
        const files = colorToMockups(active.color || "white");
        sideObj.mockup = side === "front" ? files.front : files.back;
      }

      return { tshirtDesigns: designs };
    }),

  // Easy getter
  isFullPrintActiveSide: () => {
    const { tshirtDesigns, activeDesignIndex, activeSide } = get();
    const active = tshirtDesigns[activeDesignIndex];
    if (!active) return false;
    return !!active.sides?.[activeSide || "front"]?.isFullPrint;
  },

  // ====== Color Change (supports full + box) ======
  setColor: (colorKey) =>
    set((state) => {
      const designs = [...state.tshirtDesigns];
      const active = designs[state.activeDesignIndex];
      if (!active) return {};

      // only regular tee supports color switching (per your update)
      if ((active.productType || "tshirts") !== "tshirts") return {};

      active.color = colorKey;
      active.sides.front.mockup = regularMockupFront(colorKey, state.regularColors);

      return { tshirtDesigns: designs };
    }),

  // ============================================================
  //   PER-DESIGN LISTING META HELPERS (Title, price, tags, 18+)
  // ============================================================

  setProductMetaForIndex: (index, patch) =>
    set((state) => {
      const metas = [...state.designMetas];
      const idx =
        typeof index === "number" ? index : state.activeDesignIndex;
      const base = metas[idx] || createEmptyMeta();
      metas[idx] = { ...base, ...patch };
      return { designMetas: metas };
    }),

  addTagForIndex: (index, tag) =>
    set((state) => {
      const idx =
        typeof index === "number" ? index : state.activeDesignIndex;
      const metas = [...state.designMetas];
      const base = metas[idx] || createEmptyMeta();

      const t = (tag || "").trim().toLowerCase();
      if (!t) return {};

      const uniq = Array.from(new Set([...(base.tags || []), t])).slice(
        0,
        15
      );

      metas[idx] = { ...base, tags: uniq };
      return { designMetas: metas };
    }),

  removeTagForIndex: (index, tag) =>
    set((state) => {
      const idx =
        typeof index === "number" ? index : state.activeDesignIndex;
      const metas = [...state.designMetas];
      const base = metas[idx] || createEmptyMeta();

      metas[idx] = {
        ...base,
        tags: (base.tags || []).filter((x) => x !== tag),
      };
      return { designMetas: metas };
    }),

  isMetaValidForIndex: (index) => {
    const { designMetas } = get();
    const idx =
      typeof index === "number" ? index : get().activeDesignIndex;
    const meta = designMetas[idx];
    if (!meta) return false;
    const { title, categorySlug } = meta;
    return !!(title && title.trim().length >= 3 && categorySlug);
  },

  // Convenience wrappers that always use ACTIVE design
  setProductMeta: (patch) => {
    const idx = get().activeDesignIndex;
    get().setProductMetaForIndex(idx, patch);
  },

  addTag: (tag) => {
    const idx = get().activeDesignIndex;
    get().addTagForIndex(idx, tag);
  },

  removeTag: (tag) => {
    const idx = get().activeDesignIndex;
    get().removeTagForIndex(idx, tag);
  },

  isMetaValid: () => {
    const idx = get().activeDesignIndex;
    return get().isMetaValidForIndex(idx);
  },

  // ====== Design Item Operations ======
  addDesignToActive: ({ url, left = 240, top = 300, scale = 0.5 }) =>
    set((state) => {
      const designs = [...state.tshirtDesigns];
      const active = designs[state.activeDesignIndex];

      active.sides[state.activeSide].designs.push({
        type: "image",
        url,
        left,
        top,
        scaleX: scale,
        scaleY: scale,
        fitMode: "auto",
      });

      return { tshirtDesigns: designs };
    }),

  addMultipleSame: (items) =>
    set((state) => {
      const designs = [...state.tshirtDesigns];
      const active = designs[state.activeDesignIndex];

      const enriched = items.map((i, idx) => ({
        ...i,
        id: makeId(),
        type: "image",
        left: (i.left ?? 240) + idx * 10,
        top: (i.top ?? 300) + idx * 10,
        scaleX: (i.scale ?? 0.5) * (idx === 0 ? 1.0 : 0.65),
        scaleY: (i.scale ?? 0.5) * (idx === 0 ? 1.0 : 0.65),
        fitMode: "auto",
      }));


      active.sides[state.activeSide].designs =
        active.sides[state.activeSide].designs.concat(enriched);

      return { tshirtDesigns: designs };
    }),

  // Batch of SEPARATE shirts (one art per product)
  addMultipleSeparate: (items) =>
    set((state) => {
      const newShirts = items.map((d) => ({
        productType: "tshirts",
        color: "white",
        sides: {
          front: {
            mockup: regularMockupFront("white"),
            designs: [
              {
                ...d,
                id: makeId(),
                type: "image",
                fitMode: "auto",
              },
            ],
            isFullPrint: false,
          },
        },
      }));


      const baseMeta =
        state.designMetas[state.activeDesignIndex] || createEmptyMeta();
      const newMetas = items.map(() => ({ ...baseMeta }));

      const prevCount = state.tshirtDesigns.length;

      return {
        tshirtDesigns: [...state.tshirtDesigns, ...newShirts],
        designMetas: [...state.designMetas, ...newMetas],
        activeDesignIndex: prevCount, // jump to first newly added design
      };

    }),
  
    // Reset everything to fresh empty state (after publishing)
  resetAll: () =>
    set({
      tshirtDesigns: [],
      designMetas: [],
      activeDesignIndex: 0,
      activeSide: "front",
    }),  
    
  updateDesignItem: (designId, patch) =>
    set((state) => {
      const designs = [...state.tshirtDesigns];
      const active = designs[state.activeDesignIndex];
      if (!active) return {};

      const side = state.activeSide || "front";
      const list = active.sides?.[side]?.designs || [];
      const idx = list.findIndex((d) => d.id === designId);
      if (idx === -1) return {};

      list[idx] = { ...list[idx], ...patch };
      return { tshirtDesigns: designs };
    }),

}));
