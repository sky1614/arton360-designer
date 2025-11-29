// // src/state/useDesignerStore.jsx
// import { create } from "zustand";

// //
// // === BASE PATHS ===
// //
// const ASSETS_BASE =
//   (typeof window !== "undefined" &&
//     window.ARTON360 &&
//     window.ARTON360.assetsBase)
//     ? window.ARTON360.assetsBase
//     : "/mockups";

// //
// // === NORMAL (BOX) MOCKUP MAPPING ===
// //
// const colorToMockups = (color) => {
//   if (color === "white") {
//     return {
//       front: `${ASSETS_BASE}/tshirt_base.png`,
//       back: `${ASSETS_BASE}/tshirt_back_base.png`,
//     };
//   }
//   return {
//     front: `${ASSETS_BASE}/tshirt_${color}_front.png`,
//     back: `${ASSETS_BASE}/tshirt_${color}_back.png`,
//   };
// };

// //
// // === FULL-SHIRT MOCKUP MAPPING (FRONT/BACK, ALL COLOURS) ===
// //   files live in /mockups/full_mask_tshirt
// //
// const normalizeForFull = (color) => (color === "gray" ? "grey" : color);

// const fullFrontMockup = (color) => {
//   const c = normalizeForFull(color);
//   switch (c) {
//     case "black":
//       return "/mockups/full_mask_tshirt/tshirt_full_black.png";
//     case "blue":
//       return "/mockups/full_mask_tshirt/tshirt_full_blue.png";
//     case "grey":
//       return "/mockups/full_mask_tshirt/tshirt_full_grey.png";
//     case "red":
//       return "/mockups/full_mask_tshirt/tshirt_full_red.png";
//     case "white":
//     default:
//       return "/mockups/full_mask_tshirt/tshirt_full_white.png";
//   }
// };

// const fullBackMockup = (color) => {
//   const c = normalizeForFull(color);
//   switch (c) {
//     case "black":
//       return "/mockups/full_mask_tshirt/tshirt_full_back_black.png";
//     case "blue":
//       return "/mockups/full_mask_tshirt/tshirt_full_back_blue.png";
//     case "grey":
//       return "/mockups/full_mask_tshirt/tshirt_full_back_grey.png";
//     case "red":
//       return "/mockups/full_mask_tshirt/tshirt_full_back_red.png";
//     case "white":
//     default:
//       return "/mockups/full_mask_tshirt/tshirt_full_white_back.png";
//   }
// };

// export const useDesignerStore = create((set, get) => ({
//   // ====== Fabric instance ======
//   canvas: null,
//   setCanvas: (c) => set({ canvas: c }),

//   // ====== T-shirt list ======
//   tshirtDesigns: [
//     {
//       color: "white",
//       sides: {
//         front: {
//           mockup: `${ASSETS_BASE}/tshirt_base.png`,
//           designs: [],
//           isFullPrint: false,
//         },
//         back: {
//           mockup: `${ASSETS_BASE}/tshirt_back_base.png`,
//           designs: [],
//           isFullPrint: false,
//         },
//       },
//     },
//   ],

//   // ====== Active Design Index Handling ======
//   activeDesignIndex: 0,

//   setActiveDesignIndex: (i) => {
//     const max = get().tshirtDesigns.length - 1;
//     set({ activeDesignIndex: Math.max(0, Math.min(i, max)) });
//   },

//   nextDesign: () => {
//     const i = get().activeDesignIndex;
//     const total = get().tshirtDesigns.length;
//     if (i < total - 1) set({ activeDesignIndex: i + 1 });
//   },

//   prevDesign: () => {
//     const i = get().activeDesignIndex;
//     if (i > 0) set({ activeDesignIndex: i - 1 });
//   },

//   // ====== Active Side ======
//   activeSide: "front",
//   setActiveSide: (side) => set({ activeSide: side }),

//   // ============================================================
//   //    FULL-SHIRT MODE (PER SIDE)
//   // ============================================================

//   toggleFullPrintForActiveSide: () =>
//     set((state) => {
//       const designs = [...state.tshirtDesigns];
//       const active = designs[state.activeDesignIndex];
//       if (!active) return {};

//       const side = state.activeSide || "front";
//       const sideObj = active.sides[side];

//       sideObj.isFullPrint = !sideObj.isFullPrint;

//       if (sideObj.isFullPrint) {
//         // when turning ON → use full-shirt mockup for current colour
//         sideObj.mockup =
//           side === "front"
//             ? fullFrontMockup(active.color || "white")
//             : fullBackMockup(active.color || "white");
//       } else {
//         // turning OFF → go back to box-print mockups
//         const files = colorToMockups(active.color || "white");
//         sideObj.mockup = side === "front" ? files.front : files.back;
//       }

//       return { tshirtDesigns: designs };
//     }),

//   setFullPrintForActiveSide: (value) =>
//     set((state) => {
//       const designs = [...state.tshirtDesigns];
//       const active = designs[state.activeDesignIndex];
//       if (!active) return {};

//       const side = state.activeSide || "front";
//       const sideObj = active.sides[side];

//       sideObj.isFullPrint = !!value;

//       if (sideObj.isFullPrint) {
//         sideObj.mockup =
//           side === "front"
//             ? fullFrontMockup(active.color || "white")
//             : fullBackMockup(active.color || "white");
//       } else {
//         const files = colorToMockups(active.color || "white");
//         sideObj.mockup = side === "front" ? files.front : files.back;
//       }

//       return { tshirtDesigns: designs };
//     }),

//   // Easy getter
//   isFullPrintActiveSide: () => {
//     const { tshirtDesigns, activeDesignIndex, activeSide } = get();
//     const active = tshirtDesigns[activeDesignIndex];
//     if (!active) return false;
//     return !!active.sides?.[activeSide || "front"]?.isFullPrint;
//   },

//   // ====== Color Change (supports full + box) ======
//   setColor: (color) =>
//     set((state) => {
//       const designs = [...state.tshirtDesigns];
//       const active = designs[state.activeDesignIndex];
//       if (!active) return {};

//       active.color = color;

//       const files = colorToMockups(color);

//       // FRONT
//       if (active.sides.front.isFullPrint) {
//         active.sides.front.mockup = fullFrontMockup(color);
//       } else {
//         active.sides.front.mockup = files.front;
//       }

//       // BACK
//       if (active.sides.back.isFullPrint) {
//         active.sides.back.mockup = fullBackMockup(color);
//       } else {
//         active.sides.back.mockup = files.back;
//       }

//       return { tshirtDesigns: designs };
//     }),

//   // ====== Product listing metadata (GLOBAL for now) ======
//   productMeta: {
//     title: "",
//     description: "",
//     categorySlug: "tshirts",
//     artType: "",
//     tags: [],
//   },

//   setProductMeta: (patch) =>
//     set((state) => ({
//       productMeta: { ...state.productMeta, ...patch },
//     })),

//   addTag: (tag) =>
//     set((state) => {
//       const t = (tag || "").trim().toLowerCase();
//       if (!t) return {};
//       const uniq = Array.from(
//         new Set([...(state.productMeta.tags || []), t])
//       );
//       return {
//         productMeta: { ...state.productMeta, tags: uniq.slice(0, 15) },
//       };
//     }),

//   removeTag: (tag) =>
//     set((state) => ({
//       productMeta: {
//         ...state.productMeta,
//         tags: (state.productMeta.tags || []).filter((x) => x !== tag),
//       },
//     })),

//   isMetaValid: () => {
//     const { title, categorySlug } = get().productMeta;
//     return !!(title && title.trim().length >= 3 && categorySlug);
//   },

//   // ====== Design Item Operations ======
//   addDesignToActive: ({ url, left = 240, top = 300, scale = 0.5 }) =>
//     set((state) => {
//       const designs = [...state.tshirtDesigns];
//       const active = designs[state.activeDesignIndex];

//       active.sides[state.activeSide].designs.push({
//         type: "image",
//         url,
//         left,
//         top,
//         scaleX: scale,
//         scaleY: scale,
//         fitMode: "auto",
//       });

//       return { tshirtDesigns: designs };
//     }),

//   addMultipleSame: (items) =>
//     set((state) => {
//       const designs = [...state.tshirtDesigns];
//       const active = designs[state.activeDesignIndex];

//       const enriched = items.map((i, idx) => ({
//         ...i,
//         type: "image",
//         left: (i.left ?? 240) + idx * 10,
//         top: (i.top ?? 300) + idx * 10,
//         scaleX: (i.scale ?? 0.5) * (idx === 0 ? 1.0 : 0.65),
//         scaleY: (i.scale ?? 0.5) * (idx === 0 ? 1.0 : 0.65),
//         fitMode: "auto",
//       }));

//       active.sides[state.activeSide].designs =
//         active.sides[state.activeSide].designs.concat(enriched);

//       return { tshirtDesigns: designs };
//     }),

//   addMultipleSeparate: (items) =>
//     set((state) => {
//       const newShirts = items.map((d) => ({
//         color: "white",
//         sides: {
//           front: {
//             mockup: `${ASSETS_BASE}/tshirt_base.png`,
//             designs: [{ ...d, type: "image", fitMode: "auto" }],
//             isFullPrint: false,
//           },
//           back: {
//             mockup: `${ASSETS_BASE}/tshirt_back_base.png`,
//             designs: [],
//             isFullPrint: false,
//           },
//         },
//       }));

//       return {
//         tshirtDesigns: [...state.tshirtDesigns, ...newShirts],
//         activeDesignIndex: state.tshirtDesigns.length,
//       };
//     }),
// }));


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
const colorToMockups = (color) => {
  if (color === "white") {
    return {
      front: `${ASSETS_BASE}/tshirt_base.png`,
      back: `${ASSETS_BASE}/tshirt_back_base.png`,
    };
  }
  return {
    front: `${ASSETS_BASE}/tshirt_${color}_front.png`,
    back: `${ASSETS_BASE}/tshirt_${color}_back.png`,
  };
};

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
const createEmptyMeta = () => ({
  title: "",
  description: "",
  categorySlug: "tshirts",
  artType: "",
  tags: [],
  currency: "USD",
  price: "",
  vendorMatureFlag: false, // 18+ toggle
});

export const useDesignerStore = create((set, get) => ({
  // ====== Fabric instance ======
  canvas: null,
  setCanvas: (c) => set({ canvas: c }),

  // ====== T-shirt list ======
  tshirtDesigns: [
    {
      color: "white",
      sides: {
        front: {
          mockup: `${ASSETS_BASE}/tshirt_base.png`,
          designs: [],
          isFullPrint: false,
        },
        back: {
          mockup: `${ASSETS_BASE}/tshirt_back_base.png`,
          designs: [],
          isFullPrint: false,
        },
      },
    },
  ],

  // ====== Per-design listing metadata (1 meta per shirt) ======
  designMetas: [createEmptyMeta()],

  // ====== Active Design Index Handling ======
  activeDesignIndex: 0,

  setActiveDesignIndex: (i) =>
    set((state) => {
      const max = state.tshirtDesigns.length - 1;
      const clamped = Math.max(0, Math.min(i, max));

      const metas = [...state.designMetas];
      if (!metas[clamped]) {
        const prevMeta =
          metas[state.activeDesignIndex] || createEmptyMeta();
        metas[clamped] = { ...prevMeta };
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
        const base = metas[i] || createEmptyMeta();
        metas[newIndex] = { ...base }; // duplicate for convenience
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
  setColor: (color) =>
    set((state) => {
      const designs = [...state.tshirtDesigns];
      const active = designs[state.activeDesignIndex];
      if (!active) return {};

      active.color = color;

      const files = colorToMockups(color);

      // FRONT
      if (active.sides.front.isFullPrint) {
        active.sides.front.mockup = fullFrontMockup(color);
      } else {
        active.sides.front.mockup = files.front;
      }

      // BACK
      if (active.sides.back.isFullPrint) {
        active.sides.back.mockup = fullBackMockup(color);
      } else {
        active.sides.back.mockup = files.back;
      }

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
        color: "white",
        sides: {
          front: {
            mockup: `${ASSETS_BASE}/tshirt_base.png`,
            designs: [{ ...d, type: "image", fitMode: "auto" }],
            isFullPrint: false,
          },
          back: {
            mockup: `${ASSETS_BASE}/tshirt_back_base.png`,
            designs: [],
            isFullPrint: false,
          },
        },
      }));

      const baseMeta =
        state.designMetas[state.activeDesignIndex] || createEmptyMeta();
      const newMetas = items.map(() => ({ ...baseMeta }));

      return {
        tshirtDesigns: [...state.tshirtDesigns, ...newShirts],
        designMetas: [...state.designMetas, ...newMetas],
        activeDesignIndex: state.tshirtDesigns.length, // jump to first new
      };
    }),
}));
