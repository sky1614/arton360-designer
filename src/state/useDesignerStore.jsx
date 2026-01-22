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
  white: `${ASSETS_BASE}/white.png`,
  black: `${ASSETS_BASE}/black.png`,
  charcoal: `${ASSETS_BASE}/charcoal.png`,
  cardinal: `${ASSETS_BASE}/cardinal.png`,
  daisy: `${ASSETS_BASE}/daisy.png`,
  azalea: `${ASSETS_BASE}/azalea.png`,
  "brown-savanna": `${ASSETS_BASE}/brown-savanna.png`
};

//
// === REGULAR TEE (BOX) MOCKUP MAPPING ===
// files live in /public/mockups/*.png
//
const REGULAR_COLORS = [
  { key: "white", file: "white.png", hex: "#ffffff", label: "White" },
  { key: "black", file: "black.png", hex: "#000000", label: "Black" },
  { key: "charcoal", file: "charcoal.png", hex: "#36454F", label: "Charcoal" },
  { key: "cardinal", file: "cardinal.png", hex: "#8B0000", label: "Cardinal" },
  { key: "daisy", file: "daisy.png", hex: "#FFD100", label: "Daisy" },
  { key: "azalea", file: "azalea.png", hex: "#FF66B2", label: "Azalea" },
  { key: "brown-savanna", file: "brown-savanna.png", hex: "#6B3F2A", label: "Brown Savanna" },
];

const regularMockupFront = (colorKey) => {
  const found = REGULAR_COLORS.find((c) => c.key === colorKey) || REGULAR_COLORS[0];
  return `/mockups/${found.file}`;
};

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
      return "/mockups/full_mask_tshirt/tshirt_full_black.png";
    case "blue":
      return "/mockups/full_mask_tshirt/tshirt_full_blue.png";
    case "grey":
      return "/mockups/full_mask_tshirt/tshirt_full_grey.png";
    case "red":
      return "/mockups/full_mask_tshirt/tshirt_full_red.png";
    case "white":
    default:
      return "/mockups/full_mask_tshirt/tshirt_full_white.png";
  }
};

const fullBackMockup = (color) => {
  const c = normalizeForFull(color);
  switch (c) {
    case "black":
      return "/mockups/full_mask_tshirt/tshirt_full_back_black.png";
    case "blue":
      return "/mockups/full_mask_tshirt/tshirt_full_back_blue.png";
    case "grey":
      return "/mockups/full_mask_tshirt/tshirt_full_back_grey.png";
    case "red":
      return "/mockups/full_mask_tshirt/tshirt_full_back_red.png";
    case "white":
    default:
      return "/mockups/full_mask_tshirt/tshirt_full_white_back.png";
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
        sideObj.mockup = "/mockups/graphic_tshirt.png";
        sideObj.printType = "mask";
        sideObj.maskUrl = "/mockups/graphic_tshirt_mask.png";
        sideObj.isFullPrint = true;
      } else {
        // default back to regular tee
        sideObj.mockup = regularMockupFront(active.color || "white");
        sideObj.printType = "box";
        sideObj.maskUrl = null;
        sideObj.isFullPrint = false;
      }

      return { tshirtDesigns: designs };
    }),

  // ====== Fabric instance ======
  canvas: null,
  setCanvas: (c) => set({ canvas: c }),
  regularColors: REGULAR_COLORS,


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
  designMetas: [/*createEmptyMeta()*/],

  // ====== Active Design Index Handling ======
  activeDesignIndex: 0,

  setActiveDesignIndex: (i) =>
    set((state) => {
      const max = state.tshirtDesigns.length - 1;
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
      const i = state.activeDesignIndex;
      if (i >= total - 1) return {};

      const newIndex = i + 1;
      const metas = [...state.designMetas];
      if (!metas[newIndex]) {
        const pt = state.tshirtDesigns?.[newIndex]?.productType || "tshirts";
        metas[newIndex] = createEmptyMeta(pt);
      }

      return { activeDesignIndex: newIndex, designMetas: metas };
    }),

  prevDesign: () =>
    set((state) => {
      const i = state.activeDesignIndex;
      if (i <= 0) return {};

      const newIndex = i - 1;
      const metas = [...state.designMetas];
      if (!metas[newIndex]) {
        const base = metas[i] || createEmptyMeta();
        metas[newIndex] = { ...base };
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
      active.sides.front.mockup = regularMockupFront(colorKey);

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
