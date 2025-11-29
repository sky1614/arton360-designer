// // src/state/useDesignerStore.jsx
// import { create } from "zustand";

// const ASSETS_BASE =
//   (typeof window !== "undefined" && window.ARTON360 && window.ARTON360.assetsBase)
//     ? window.ARTON360.assetsBase
//     : "/mockups";

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

// export const useDesignerStore = create((set, get) => ({
//   // Fabric instance
//   canvas: null,
//   setCanvas: (c) => set({ canvas: c }),

//   // Shirts state
//   tshirtDesigns: [
//     {
//       color: "white",
//       sides: {
//         front: { mockup: `${ASSETS_BASE}/tshirt_base.png`, designs: [] },
//         back:  { mockup: `${ASSETS_BASE}/tshirt_back_base.png`, designs: [] },
//       },
//     },
//   ],

//   activeDesignIndex: 0,
//   setActiveDesignIndex: (i) => {
//     const max = get().tshirtDesigns.length - 1;
//     set({ activeDesignIndex: Math.max(0, Math.min(i, max)) });
//   },
//   nextDesign: () => {
//     const i = get().activeDesignIndex, total = get().tshirtDesigns.length;
//     if (i < total - 1) set({ activeDesignIndex: i + 1 });
//   },
//   prevDesign: () => {
//     const i = get().activeDesignIndex;
//     if (i > 0) set({ activeDesignIndex: i - 1 });
//   },

//   activeSide: "front",
//   setActiveSide: (side) => set({ activeSide: side }),

//   setColor: (color) =>
//     set((state) => {
//       const designs = [...state.tshirtDesigns];
//       const active = designs[state.activeDesignIndex];
//       active.color = color;
//       const files = colorToMockups(color);
//       active.sides.front.mockup = files.front;
//       active.sides.back.mockup  = files.back;
//       return { tshirtDesigns: designs };
//     }),

//   // ====== Product listing metadata (Right panel) ======
//   productMeta: {
//     title: "",
//     description: "",
//     categorySlug: "tshirts",  // default
//     artType: "",
//     tags: [],
//   },
//   setProductMeta: (patch) =>
//     set((state) => ({ productMeta: { ...state.productMeta, ...patch } })),
//   addTag: (tag) =>
//     set((state) => {
//       const t = (tag || "").trim().toLowerCase();
//       if (!t) return {};
//       const uniq = Array.from(new Set([...(state.productMeta.tags || []), t]));
//       return { productMeta: { ...state.productMeta, tags: uniq.slice(0, 15) } };
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

//   // ====== Design item helpers ======
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
//         top:  (i.top ?? 300) + idx * 10,
//         scaleX: (i.scale ?? 0.5) * (idx === 0 ? 1.0 : 0.65),
//         scaleY: (i.scale ?? 0.5) * (idx === 0 ? 1.0 : 0.65),
//         fitMode: idx === 0 ? "auto" : "auto",
//       }));
//       active.sides[state.activeSide].designs = active.sides[state.activeSide].designs.concat(enriched);
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
//           },
//           back: { mockup: `${ASSETS_BASE}/tshirt_back_base.png`, designs: [] },
//         },
//       }));
//       return {
//         tshirtDesigns: [...state.tshirtDesigns, ...newShirts],
//         activeDesignIndex: state.tshirtDesigns.length,
//       };
//     }),
// }));


// src/state/useDesignerStore.jsx
// import { create } from "zustand";

// const ASSETS_BASE =
//   (typeof window !== "undefined" && window.ARTON360 && window.ARTON360.assetsBase)
//     ? window.ARTON360.assetsBase
//     : "/mockups";

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

// export const useDesignerStore = create((set, get) => ({
//   // ====== Fabric instance ======
//   canvas: null,
//   setCanvas: (c) => set({ canvas: c }),

//   // ====== Shirts state ======
//   // NOTE: we now track isFullPrint PER SIDE
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

//   // ====== Side (front/back) ======
//   activeSide: "front",
//   setActiveSide: (side) => set({ activeSide: side }),

//   // ====== Full-shirt mode (per side) ======
//   // Toggle / set full-print for CURRENT T-shirt + CURRENT side
//   toggleFullPrintForActiveSide: () =>
//     set((state) => {
//       const designs = [...state.tshirtDesigns];
//       const active = designs[state.activeDesignIndex];
//       const side = active.sides[state.activeSide];
//       side.isFullPrint = !side.isFullPrint;
//       return { tshirtDesigns: designs };
//     }),

//   setFullPrintForActiveSide: (value) =>
//     set((state) => {
//       const designs = [...state.tshirtDesigns];
//       const active = designs[state.activeDesignIndex];
//       const side = active.sides[state.activeSide];
//       side.isFullPrint = !!value;
//       return { tshirtDesigns: designs };
//     }),

//   // Helper to read the flag easily from components
//   isFullPrintActiveSide: () => {
//     const { tshirtDesigns, activeDesignIndex, activeSide } = get();
//     const active = tshirtDesigns[activeDesignIndex];
//     if (!active) return false;
//     const side = active.sides?.[activeSide];
//     return !!side?.isFullPrint;
//   },

//   // ====== Color / mockup handling ======
//   setColor: (color) =>
//     set((state) => {
//       const designs = [...state.tshirtDesigns];
//       const active = designs[state.activeDesignIndex];
//       active.color = color;
//       const files = colorToMockups(color);

//       // keep existing isFullPrint + designs, only swap mockup paths
//       active.sides.front.mockup = files.front;
//       active.sides.back.mockup = files.back;

//       return { tshirtDesigns: designs };
//     }),

//   // ====== Product listing metadata (Right panel) ======
//   productMeta: {
//     title: "",
//     description: "",
//     categorySlug: "tshirts", // default
//     artType: "",
//     tags: [],
//   },
//   setProductMeta: (patch) =>
//     set((state) => ({ productMeta: { ...state.productMeta, ...patch } })),
//   addTag: (tag) =>
//     set((state) => {
//       const t = (tag || "").trim().toLowerCase();
//       if (!t) return {};
//       const uniq = Array.from(new Set([...(state.productMeta.tags || []), t]));
//       return { productMeta: { ...state.productMeta, tags: uniq.slice(0, 15) } };
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

//   // ====== Design item helpers ======
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
//         fitMode: idx === 0 ? "auto" : "auto",
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
// import { create } from "zustand";

// //
// // === BASE PATHS ===
// //
// const ASSETS_BASE =
//   (typeof window !== "undefined" && window.ARTON360 && window.ARTON360.assetsBase)
//     ? window.ARTON360.assetsBase
//     : "/mockups";

// //
// // === NORMAL MOCKUP MAPPING ===
// //
// const colorToMockups = (color) => {
//   if (color === "white") {
//     return {
//       front: `${ASSETS_BASE}/tshirt_base.png`,
//       back:  `${ASSETS_BASE}/tshirt_back_base.png`,
//     };
//   }
//   return {
//     front: `${ASSETS_BASE}/tshirt_${color}_front.png`,
//     back:  `${ASSETS_BASE}/tshirt_${color}_back.png`,
//   };
// };

// //
// // === FULL-SHIRT MOCKUP & MASK PATHS ===
// //
// const FULL_WHITE_FRONT = "/mockups/full_mask_tshirt/tshirt_full_white.png";
// const FULL_WHITE_MASK  = "/mockups/full_mask_tshirt/tshirt_full_white_mask.png";


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
//           isFullPrint: false,     // <-- added
//         },
//         back: {
//           mockup: `${ASSETS_BASE}/tshirt_back_base.png`,
//           designs: [],
//           isFullPrint: false,     // <-- added
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
//       const active  = designs[state.activeDesignIndex];
//       const sideObj = active.sides[state.activeSide];

//       sideObj.isFullPrint = !sideObj.isFullPrint;

//       // When enabling → swap to full mockup
//       if (sideObj.isFullPrint) {
//         sideObj.mockup = FULL_WHITE_FRONT;
//       } else {
//         // disable → restore normal mockup for current color
//         const files = colorToMockups(active.color);
//         sideObj.mockup =
//           state.activeSide === "front" ? files.front : files.back;
//       }

//       return { tshirtDesigns: designs };
//     }),

//   setFullPrintForActiveSide: (value) =>
//     set((state) => {
//       const designs = [...state.tshirtDesigns];
//       const active  = designs[state.activeDesignIndex];
//       const sideObj = active.sides[state.activeSide];

//       sideObj.isFullPrint = !!value;

//       if (sideObj.isFullPrint) {
//         sideObj.mockup = FULL_WHITE_FRONT;
//       } else {
//         const files = colorToMockups(active.color);
//         sideObj.mockup =
//           state.activeSide === "front" ? files.front : files.back;
//       }

//       return { tshirtDesigns: designs };
//     }),

//   // Easy getter
//   isFullPrintActiveSide: () => {
//     const { tshirtDesigns, activeDesignIndex, activeSide } = get();
//     const active = tshirtDesigns[activeDesignIndex];
//     if (!active) return false;
//     return !!active.sides?.[activeSide]?.isFullPrint;
//   },

//   // ====== Color Change (normal mode restore) ======
//   setColor: (color) =>
//     set((state) => {
//       const designs = [...state.tshirtDesigns];
//       const active = designs[state.activeDesignIndex];
//       active.color = color;

//       const files = colorToMockups(color);

//       // Only update mockups for sides NOT in full-print mode
//       if (!active.sides.front.isFullPrint) {
//         active.sides.front.mockup = files.front;
//       }
//       if (!active.sides.back.isFullPrint) {
//         active.sides.back.mockup = files.back;
//       }

//       return { tshirtDesigns: designs };
//     }),

//   // ====== Product listing metadata ======
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
//       const uniq = Array.from(new Set([...(state.productMeta.tags || []), t]));
//       return { productMeta: { ...state.productMeta, tags: uniq.slice(0, 15) } };
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
//       const active  = designs[state.activeDesignIndex];

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
//       const active  = designs[state.activeDesignIndex];

//       const enriched = items.map((i, idx) => ({
//         ...i,
//         type: "image",
//         left: (i.left ?? 240) + idx * 10,
//         top:  (i.top  ?? 300) + idx * 10,
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

// // src/state/useDesignerStore.jsx
// import { create } from "zustand";

// //
// // === BASE PATHS ===
// //
// const ASSETS_BASE =
//   (typeof window !== "undefined" && window.ARTON360 && window.ARTON360.assetsBase)
//     ? window.ARTON360.assetsBase
//     : "/mockups";

// //
// // === NORMAL MOCKUP MAPPING ===
// //
// const colorToMockups = (color) => {
//   if (color === "white") {
//     return {
//       front: `${ASSETS_BASE}/tshirt_base.png`,
//       back:  `${ASSETS_BASE}/tshirt_back_base.png`,
//     };
//   }
//   return {
//     front: `${ASSETS_BASE}/tshirt_${color}_front.png`,
//     back:  `${ASSETS_BASE}/tshirt_${color}_back.png`,
//   };
// };

// //
// // === FULL-SHIRT MOCKUP & MASK PATHS ===
// //
// const FULL_WHITE_FRONT = "/mockups/full_mask_tshirt/tshirt_full_white.png";
// const FULL_WHITE_MASK  = "/mockups/full_mask_tshirt/tshirt_full_white_mask.png";

// //
// // === DEFAULT META FOR A DESIGN ===
// //
// const createDefaultMeta = () => ({
//   title: "",
//   description: "",
//   categorySlug: "tshirts",
//   artType: "",
//   tags: [],
//   price: "",
//   currency: "USD",
//   vendorMatureFlag: false,
// });

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

//   setActiveDesignIndex: (i) =>
//     set((state) => {
//       const max = state.tshirtDesigns.length - 1;
//       const idx = Math.max(0, Math.min(i, max));
//       const meta = state.designMetas[idx] || createDefaultMeta();
//       return {
//         activeDesignIndex: idx,
//         productMeta: meta,
//         designMetas: {
//           ...state.designMetas,
//           [idx]: meta,
//         },
//       };
//     }),

//   nextDesign: () => {
//     const { activeDesignIndex, tshirtDesigns, setActiveDesignIndex } = get();
//     const total = tshirtDesigns.length;
//     if (activeDesignIndex < total - 1) {
//       setActiveDesignIndex(activeDesignIndex + 1);
//     }
//   },

//   prevDesign: () => {
//     const { activeDesignIndex, setActiveDesignIndex } = get();
//     if (activeDesignIndex > 0) {
//       setActiveDesignIndex(activeDesignIndex - 1);
//     }
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
//       const active  = designs[state.activeDesignIndex];
//       const sideObj = active.sides[state.activeSide];

//       sideObj.isFullPrint = !sideObj.isFullPrint;

//       // When enabling → swap to full mockup
//       if (sideObj.isFullPrint) {
//         sideObj.mockup = FULL_WHITE_FRONT;
//       } else {
//         // disable → restore normal mockup for current color
//         const files = colorToMockups(active.color);
//         sideObj.mockup =
//           state.activeSide === "front" ? files.front : files.back;
//       }

//       return { tshirtDesigns: designs };
//     }),

//   setFullPrintForActiveSide: (value) =>
//     set((state) => {
//       const designs = [...state.tshirtDesigns];
//       const active  = designs[state.activeDesignIndex];
//       const sideObj = active.sides[state.activeSide];

//       sideObj.isFullPrint = !!value;

//       if (sideObj.isFullPrint) {
//         sideObj.mockup = FULL_WHITE_FRONT;
//       } else {
//         const files = colorToMockups(active.color);
//         sideObj.mockup =
//           state.activeSide === "front" ? files.front : files.back;
//       }

//       return { tshirtDesigns: designs };
//     }),

//   // Easy getter
//   isFullPrintActiveSide: () => {
//     const { tshirtDesigns, activeDesignIndex, activeSide } = get();
//     const active = tshirtDesigns[activeDesignIndex];
//     if (!active) return false;
//     return !!active.sides?.[activeSide]?.isFullPrint;
//   },

//   // ====== Color Change (normal mode restore) ======
//   setColor: (color) =>
//     set((state) => {
//       const designs = [...state.tshirtDesigns];
//       const active = designs[state.activeDesignIndex];
//       active.color = color;

//       const files = colorToMockups(color);

//       // Only update mockups for sides NOT in full-print mode
//       if (!active.sides.front.isFullPrint) {
//         active.sides.front.mockup = files.front;
//       }
//       if (!active.sides.back.isFullPrint) {
//         active.sides.back.mockup = files.back;
//       }

//       return { tshirtDesigns: designs };
//     }),

//   // ====== Product listing metadata (per design) ======
//   designMetas: {
//     0: createDefaultMeta(),
//   },

//   // productMeta = meta of *currently active* design
//   productMeta: createDefaultMeta(),

//   setProductMeta: (patch) =>
//     set((state) => {
//       const idx = state.activeDesignIndex || 0;
//       const currentMeta = state.designMetas[idx] || state.productMeta || createDefaultMeta();
//       const updatedMeta = { ...currentMeta, ...patch };
//       return {
//         productMeta: updatedMeta,
//         designMetas: {
//           ...state.designMetas,
//           [idx]: updatedMeta,
//         },
//       };
//     }),

//   addTag: (tag) =>
//     set((state) => {
//       const t = (tag || "").trim().toLowerCase();
//       if (!t) return {};
//       const idx = state.activeDesignIndex || 0;
//       const currentMeta = state.designMetas[idx] || state.productMeta || createDefaultMeta();
//       const existingTags = currentMeta.tags || [];
//       const uniq = Array.from(new Set([...existingTags, t]));
//       const updatedMeta = { ...currentMeta, tags: uniq.slice(0, 15) };
//       return {
//         productMeta: updatedMeta,
//         designMetas: {
//           ...state.designMetas,
//           [idx]: updatedMeta,
//         },
//       };
//     }),

//   removeTag: (tag) =>
//     set((state) => {
//       const idx = state.activeDesignIndex || 0;
//       const currentMeta = state.designMetas[idx] || state.productMeta || createDefaultMeta();
//       const updatedMeta = {
//         ...currentMeta,
//         tags: (currentMeta.tags || []).filter((x) => x !== tag),
//       };
//       return {
//         productMeta: updatedMeta,
//         designMetas: {
//           ...state.designMetas,
//           [idx]: updatedMeta,
//         },
//       };
//     }),

//   isMetaValid: () => {
//     const state = get();
//     const idx = state.activeDesignIndex || 0;
//     const meta = state.designMetas?.[idx] || state.productMeta || {};
//     const { title, categorySlug } = meta;
//     return !!(title && title.trim().length >= 3 && categorySlug);
//   },

//   // ====== Design Item Operations ======
//   addDesignToActive: ({ url, left = 240, top = 300, scale = 0.5 }) =>
//     set((state) => {
//       const designs = [...state.tshirtDesigns];
//       const active  = designs[state.activeDesignIndex];

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
//       const active  = designs[state.activeDesignIndex];

//       const enriched = items.map((i, idx) => ({
//         ...i,
//         type: "image",
//         left: (i.left ?? 240) + idx * 10,
//         top:  (i.top  ?? 300) + idx * 10,
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

//       const oldCount = state.tshirtDesigns.length;
//       const tshirtDesigns = [...state.tshirtDesigns, ...newShirts];

//       const designMetas = { ...state.designMetas };
//       items.forEach((_, idx) => {
//         const designIndex = oldCount + idx;
//         designMetas[designIndex] = createDefaultMeta();
//       });

//       const activeDesignIndex = oldCount; // first of the newly added
//       const productMeta = designMetas[activeDesignIndex];

//       return {
//         tshirtDesigns,
//         designMetas,
//         activeDesignIndex,
//         productMeta,
//       };
//     }),

// }));

// src/state/useDesignerStore.jsx
import { create } from "zustand";

//
// === BASE PATHS ===
//
const ASSETS_BASE =
  (typeof window !== "undefined" &&
    window.ARTON360 &&
    window.ARTON360.assetsBase)
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

  // ====== Active Design Index Handling ======
  activeDesignIndex: 0,

  setActiveDesignIndex: (i) => {
    const max = get().tshirtDesigns.length - 1;
    set({ activeDesignIndex: Math.max(0, Math.min(i, max)) });
  },

  nextDesign: () => {
    const i = get().activeDesignIndex;
    const total = get().tshirtDesigns.length;
    if (i < total - 1) set({ activeDesignIndex: i + 1 });
  },

  prevDesign: () => {
    const i = get().activeDesignIndex;
    if (i > 0) set({ activeDesignIndex: i - 1 });
  },

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
        // when turning ON → use full-shirt mockup for current colour
        sideObj.mockup =
          side === "front"
            ? fullFrontMockup(active.color || "white")
            : fullBackMockup(active.color || "white");
      } else {
        // turning OFF → go back to box-print mockups
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

  // ====== Product listing metadata (GLOBAL for now) ======
  productMeta: {
    title: "",
    description: "",
    categorySlug: "tshirts",
    artType: "",
    tags: [],
  },

  setProductMeta: (patch) =>
    set((state) => ({
      productMeta: { ...state.productMeta, ...patch },
    })),

  addTag: (tag) =>
    set((state) => {
      const t = (tag || "").trim().toLowerCase();
      if (!t) return {};
      const uniq = Array.from(
        new Set([...(state.productMeta.tags || []), t])
      );
      return {
        productMeta: { ...state.productMeta, tags: uniq.slice(0, 15) },
      };
    }),

  removeTag: (tag) =>
    set((state) => ({
      productMeta: {
        ...state.productMeta,
        tags: (state.productMeta.tags || []).filter((x) => x !== tag),
      },
    })),

  isMetaValid: () => {
    const { title, categorySlug } = get().productMeta;
    return !!(title && title.trim().length >= 3 && categorySlug);
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

      return {
        tshirtDesigns: [...state.tshirtDesigns, ...newShirts],
        activeDesignIndex: state.tshirtDesigns.length,
      };
    }),
}));
