// import { useEffect, useRef } from "react";
// import { useDesignerStore } from "../state/useDesignerStore";

// export default function CanvasArea() {
//   const canvasEl = useRef(null);
//   const { canvas, setCanvas, tshirtDesigns, activeDesignIndex, activeSide } = useDesignerStore();

//   // Keep in sync with Toolbar
//   const PRINT = { left: 210, top: 200, width: 180, height: 280 };

//   // -------------------- Initialize Fabric canvas --------------------
//   useEffect(() => {
//     let c;
//     (async () => {
//       const fm = await import("fabric");
//       const fabric = fm.fabric || fm.default || fm;

//       c = new fabric.Canvas("designer-canvas", {
//         width: 600,
//         height: 700,
//         preserveObjectStacking: true,
//       });

//       // Restrict movement inside printable area
//       c.on("object:moving", (e) => {
//         const o = e.target; if (!o) return;
//         const w = o.getScaledWidth(), h = o.getScaledHeight();
//         const r = PRINT.left + PRINT.width, b = PRINT.top + PRINT.height;
//         if (o.left < PRINT.left) o.left = PRINT.left;
//         if (o.top < PRINT.top) o.top = PRINT.top;
//         if (o.left + w > r) o.left = r - w;
//         if (o.top + h > b) o.top = b - h;
//       });

//       // When artist resizes/rotates, mark as manual (prevents future auto-fit)
//       c.on("object:modified", (e) => {
//         const o = e.target;
//         if (o) o.fitMode = "manual";
//       });

//       // Delete/Backspace guard:
//       // only delete if NOT editing a textbox
//       const handleDelete = (e) => {
//         if (e.key !== "Delete" && e.key !== "Backspace") return;
//         const a = c.getActiveObject();
//         if (!a) return;

//         const isEditingTextbox = a.type === "textbox" && a.isEditing;
//         if (isEditingTextbox) return; // allow text editing; don't remove the object

//         c.remove(a);
//         c.discardActiveObject();
//         c.requestRenderAll();
//       };
//       document.addEventListener("keydown", handleDelete);

//       setCanvas(c);
//       return () => {
//         document.removeEventListener("keydown", handleDelete);
//         if (c) c.dispose();
//       };
//     })();
//   }, [setCanvas]);

//   // -------------------- Load shirt/side --------------------
//   useEffect(() => {
//     (async () => {
//       if (!canvas) return;
//       const fm = await import("fabric");
//       const fabric = fm.fabric || fm.default || fm;

//       const active = tshirtDesigns[activeDesignIndex];
//       const side = active?.sides?.[activeSide];
//       if (!side?.mockup) return;

//       canvas.clear();

//       // Mockup background
//       await new Promise((res) => {
//         fabric.Image.fromURL(
//           side.mockup,
//           (img) => {
//             img.scaleToWidth(550);
//             img.set({ left: 25, top: 50, selectable: false, evented: false });
//             canvas.setBackgroundImage(img, () => { canvas.renderAll(); res(null); });
//           },
//           { crossOrigin: "anonymous" }
//         );
//       });

//       // Restore designs
//       for (const d of side.designs || []) {
//         if (d.type === "image" && d.url) {
//           await new Promise((r) => {
//             fabric.Image.fromURL(
//               d.url,
//               (img) => {
//                 img.set({
//                   left: d.left ?? 240,
//                   top: d.top ?? 300,
//                   scaleX: d.scaleX ?? 0.5,
//                   scaleY: d.scaleY ?? 0.5,
//                   angle: d.angle ?? 0,
//                   selectable: true,
//                 });
//                 img.fitMode = d.fitMode || "auto";
//                 img.setCoords(); canvas.add(img); r(null);
//               },
//               { crossOrigin: "anonymous" }
//             );
//           });
//         } else if (d.type === "text") {
//           const txt = new fabric.Textbox(d.text || "Add Text", {
//             left: d.left ?? 240,
//             top: d.top ?? 300,
//             scaleX: d.scaleX ?? 1,
//             scaleY: d.scaleY ?? 1,
//             angle: d.angle ?? 0,
//             fontFamily: d.fontFamily || "Poppins",
//             fill: d.color || "#000",
//             selectable: true,
//           });
//           txt.fitMode = d.fitMode || "manual";
//           txt.setCoords(); canvas.add(txt);
//         }
//       }

//       // Printable overlay (guide)
//       const rect = new fabric.Rect({
//         left: PRINT.left, top: PRINT.top, width: PRINT.width, height: PRINT.height,
//         fill: "transparent", stroke: "#333", strokeDashArray: [6, 6],
//         selectable: false, evented: false,
//       });
//       rect._isGuide = true;
//       canvas.add(rect); rect.moveTo(canvas.getObjects().length - 1);

//       canvas.renderAll();
//     })();
//   }, [canvas, activeDesignIndex, activeSide, tshirtDesigns]);

//   return (
//     <div className="flex items-center justify-center" style={{ width: "100%", height: "800px" }}>
//       <canvas id="designer-canvas" ref={canvasEl} width="600" height="700" style={{ border: "1px solid #ccc" }} />
//     </div>
//   );
// }


// import { useEffect, useRef } from "react";
// import { useDesignerStore } from "../state/useDesignerStore";
// import PRINT from "../config/printBox";

// export default function CanvasArea() {
//   const canvasEl = useRef(null);
//   const {
//     canvas, setCanvas, tshirtDesigns, activeDesignIndex, activeSide,
//   } = useDesignerStore();

//   // ---------- Create Fabric canvas ONCE ----------
//   useEffect(() => {
//     let c;
//     (async () => {
//       const fm = await import("fabric");
//       const fabric = fm.fabric || fm.default || fm;

//       c = new fabric.Canvas("designer-canvas", {
//         width: 600,
//         height: 700,
//         preserveObjectStacking: true,
//       });

//       // clamp movement inside printable area
//       c.on("object:moving", (e) => {
//         const obj = e.target;
//         if (!obj) return;
//         const w = obj.getScaledWidth();
//         const h = obj.getScaledHeight();

//         const L = PRINT.left;
//         const T = PRINT.top;
//         const R = PRINT.left + PRINT.width;
//         const B = PRINT.top  + PRINT.height;

//         if (obj.left < L) obj.left = L;
//         if (obj.top  < T) obj.top  = T;
//         if (obj.left + w > R) obj.left = R - w;
//         if (obj.top  + h > B) obj.top  = B - h;
//       });

//       // delete key
//       const onKey = (e) => {
//         if (e.key === "Delete" || e.key === "Backspace") {
//           const a = c.getActiveObject();
//           if (a) { c.remove(a); c.discardActiveObject(); c.requestRenderAll(); }
//         }
//       };
//       document.addEventListener("keydown", onKey);

//       setCanvas(c);

//       return () => {
//         document.removeEventListener("keydown", onKey);
//         c && c.dispose();
//       };
//     })();
//   }, [setCanvas]);

//   // ---------- helper: draw dashed printable guide ----------
//   const drawPrintableGuide = async (c) => {
//     const fm = await import("fabric");
//     const fabric = fm.fabric || fm.default || fm;
//     const rect = new fabric.Rect({
//       left: PRINT.left,
//       top: PRINT.top,
//       width: PRINT.width,
//       height: PRINT.height,
//       fill: "transparent",
//       stroke: "#333",
//       strokeDashArray: [6, 6],
//       selectable: false,
//       evented: false,
//       hoverCursor: "default",
//     });
//     rect._isGuide = true;
//     c.add(rect);
//     rect.moveTo(c.getObjects().length - 1);
//   };

//   // ---------- Load mockup + restore designs when shirt/side changes ----------
//   useEffect(() => {
//     (async () => {
//       if (!canvas) return;

//       const fm = await import("fabric");
//       const fabric = fm.fabric || fm.default || fm;
//       const fit = (await import("../utils/fit")).fitIntoBox;

//       const active = tshirtDesigns[activeDesignIndex];
//       const side = active?.sides?.[activeSide];
//       if (!side?.mockup) return;

//       canvas.clear();

//       // background mockup
//       await new Promise((resolve) => {
//         fabric.Image.fromURL(
//           side.mockup,
//           (img) => {
//             img.scaleToWidth(550);
//             img.set({ left: 25, top: 50, selectable: false, evented: false });
//             canvas.setBackgroundImage(img, () => {
//               canvas.renderAll();
//               resolve();
//             });
//           },
//           { crossOrigin: "anonymous" }
//         );
//       });

//       // restore each saved design
//       const toLoad = side.designs || [];
//       for (const d of toLoad) {
//         if (d.type === "image") {
//           await new Promise((resolve) => {
//             fabric.Image.fromURL(
//               d.url,
//               (img) => {
//                 // use saved position/scale when present, otherwise auto-fit
//                 if (typeof d.scaleX === "number" || typeof d.left === "number") {
//                   img.set({
//                     left: d.left ?? PRINT.left,
//                     top: d.top ?? PRINT.top,
//                     scaleX: d.scaleX ?? 1,
//                     scaleY: d.scaleY ?? 1,
//                     angle: d.angle ?? 0,
//                     selectable: true,
//                     originX: "left",
//                     originY: "top",
//                   });
//                 } else {
//                   const W = img._element?.naturalWidth || img.width;
//                   const H = img._element?.naturalHeight || img.height;
//                   const { scale, left, top } = fit(W, H, PRINT, { paddingRatio: 0.06 });
//                   img.set({ originX: "left", originY: "top" });
//                   img.scale(scale);
//                   img.set({ left, top, selectable: true });
//                 }
//                 img.setCoords();
//                 canvas.add(img);
//                 canvas.requestRenderAll();
//                 resolve();
//               },
//               { crossOrigin: "anonymous" }
//             );
//           });
//         } else if (d.type === "text") {
//           const txt = new fabric.Textbox(d.text || "Add Text", {
//             left: d.left ?? PRINT.left + 10,
//             top:  d.top  ?? PRINT.top  + 10,
//             scaleX: d.scaleX ?? 1,
//             scaleY: d.scaleY ?? 1,
//             angle: d.angle ?? 0,
//             fontFamily: d.fontFamily || "Poppins",
//             fill: d.color || "#000",
//             selectable: true,
//             originX: "left",
//             originY: "top",
//           });
//           txt.setCoords();
//           canvas.add(txt);
//         }
//       }

//       await drawPrintableGuide(canvas);
//       canvas.renderAll();
//     })();
//   }, [canvas, tshirtDesigns, activeDesignIndex, activeSide]);

//   return (
//     <div className="flex items-center justify-center" style={{ width: "100%", height: "800px" }}>
//       <canvas
//         id="designer-canvas"
//         ref={canvasEl}
//         width="600"
//         height="700"
//         style={{ border: "1px solid #ccc" }}
//       />
//     </div>
//   );
// }


// import { useEffect, useRef } from "react";
// import { useDesignerStore } from "../state/useDesignerStore";
// import PRINT from "../config/printBox";
// import { getPrintArea } from "../config/printBox";

// export default function CanvasArea() {
//   const canvasEl = useRef(null);

//   const {
//     canvas, setCanvas,
//     tshirtDesigns, activeDesignIndex, activeSide,
//     isFullPrintActiveSide
//   } = useDesignerStore();

//   // ---------- Create Fabric canvas ONCE ----------
//   useEffect(() => {
//     let c;
//     (async () => {
//       const fm = await import("fabric");
//       const fabric = fm.fabric || fm.default || fm;

//       c = new fabric.Canvas("designer-canvas", {
//         width: 600,
//         height: 700,
//         preserveObjectStacking: true,
//       });

//       // Movement constraint inside bounding box
//       c.on("object:moving", (e) => {
//         const obj = e.target;
//         if (!obj) return;

//         const isFull = isFullPrintActiveSide();
//         const box = getPrintArea(isFull, activeSide);

//         const w = obj.getScaledWidth();
//         const h = obj.getScaledHeight();

//         const L = box.left;
//         const T = box.top;
//         const R = box.left + box.width;
//         const B = box.top + box.height;

//         if (obj.left < L) obj.left = L;
//         if (obj.top < T) obj.top = T;
//         if (obj.left + w > R) obj.left = R - w;
//         if (obj.top + h > B) obj.top = B - h;
//       });

//       // Delete key
//       const onKey = (e) => {
//         if (e.key === "Delete" || e.key === "Backspace") {
//           const a = c.getActiveObject();
//           if (a) {
//             c.remove(a);
//             c.discardActiveObject();
//             c.requestRenderAll();
//           }
//         }
//       };
//       document.addEventListener("keydown", onKey);

//       setCanvas(c);

//       return () => {
//         document.removeEventListener("keydown", onKey);
//         c && c.dispose();
//       };
//     })();
//   }, [setCanvas, activeSide, isFullPrintActiveSide]);

//   // ---------- Draw dashed printable guide ----------
//   const drawPrintableGuide = async (c, box) => {
//     const fm = await import("fabric");
//     const fabric = fm.fabric || fm.default || fm;

//     const rect = new fabric.Rect({
//       left: box.left,
//       top: box.top,
//       width: box.width,
//       height: box.height,
//       fill: "transparent",
//       stroke: "#333",
//       strokeDashArray: [6, 6],
//       selectable: false,
//       evented: false,
//       hoverCursor: "default",
//     });

//     rect._isGuide = true;
//     c.add(rect);
//     rect.moveTo(c.getObjects().length - 1);
//   };

//   // ---------- Load mockup + restore designs ----------
//   useEffect(() => {
//     (async () => {
//       if (!canvas) return;

//       const fm = await import("fabric");
//       const fabric = fm.fabric || fm.default || fm;

//       const active = tshirtDesigns[activeDesignIndex];
//       const sideObj = active?.sides?.[activeSide];
//       if (!sideObj?.mockup) return;

//       const isFull = sideObj.isFullPrint;

//       // Select bounding area
//       const box = getPrintArea(isFull, activeSide);

//       canvas.clear();

//       // Background mockup
//       await new Promise((resolve) => {
//         fabric.Image.fromURL(
//           sideObj.mockup,
//           (img) => {
//             img.scaleToWidth(550);
//             img.set({ left: 25, top: 50, selectable: false, evented: false });
//             canvas.setBackgroundImage(img, () => {
//               canvas.renderAll();
//               resolve();
//             });
//           },
//           { crossOrigin: "anonymous" }
//         );
//       });

//       // Load fit function ONCE (important fix)
//       const fmFit = await import("../utils/fit");
//       const fit = fmFit.fitIntoBox;

//       // Restore objects
//       const toLoad = sideObj.designs || [];
//       for (const d of toLoad) {
//         if (d.type === "image") {
//           await new Promise((resolve) => {
//             fabric.Image.fromURL(
//               d.url,
//               (img) => {
//                 const W = img._element?.naturalWidth || img.width;
//                 const H = img._element?.naturalHeight || img.height;

//                 if (d.scaleX || d.left || d.top) {
//                   // Load from saved
//                   img.set({
//                     left: d.left ?? box.left,
//                     top: d.top ?? box.top,
//                     scaleX: d.scaleX ?? 1,
//                     scaleY: d.scaleY ?? 1,
//                     angle: d.angle ?? 0,
//                     selectable: true,
//                     originX: "left",
//                     originY: "top",
//                   });
//                 } else {
//                   // Auto-fit new images
//                   const { scale, left, top } = fit(W, H, box, { paddingRatio: 0.06 });

//                   img.set({ originX: "left", originY: "top" });
//                   img.scale(scale);
//                   img.set({ left, top, selectable: true });
//                 }

//                 img.setCoords();
//                 canvas.add(img);
//                 canvas.requestRenderAll();
//                 resolve();
//               },
//               { crossOrigin: "anonymous" }
//             );
//           });
//         }

//         // Restore TEXT
//         else if (d.type === "text") {
//           const txt = new fabric.Textbox(d.text || "Add Text", {
//             left: d.left ?? box.left + 10,
//             top: d.top ?? box.top + 10,
//             scaleX: d.scaleX ?? 1,
//             scaleY: d.scaleY ?? 1,
//             angle: d.angle ?? 0,
//             fontFamily: d.fontFamily || "Poppins",
//             fill: d.color || "#000",
//             selectable: true,
//             originX: "left",
//             originY: "top",
//           });

//           txt.setCoords();
//           canvas.add(txt);
//         }
//       }

//       // Draw dashed guide ONLY for normal print mode
//       if (!isFull) {
//         await drawPrintableGuide(canvas, box);
//       }

//       canvas.renderAll();
//     })();
//   }, [
//     canvas,
//     tshirtDesigns,
//     activeDesignIndex,
//     activeSide,
//     isFullPrintActiveSide,
//   ]);

//   return (
//     <div
//       className="flex items-center justify-center"
//       style={{ width: "100%", height: "800px" }}
//     >
//       <canvas
//         id="designer-canvas"
//         ref={canvasEl}
//         width="600"
//         height="700"
//         style={{ border: "1px solid #ccc" }}
//       />
//     </div>
//   );
// }

// import { useEffect, useRef } from "react";
// import { useDesignerStore } from "../state/useDesignerStore";
// import PRINT from "../config/printBox";

// export default function CanvasArea() {
//   const canvasEl = useRef(null);
//   const maskRef = useRef(null); // holds current shirt mask for this side

//   const {
//     canvas,
//     setCanvas,
//     tshirtDesigns,
//     activeDesignIndex,
//     activeSide,
//     fullShirtMode,     // <- from zustand store
//   } = useDesignerStore();

//   // ---------- Create Fabric canvas ONCE ----------
//   useEffect(() => {
//     let c;
//     (async () => {
//       const fm = await import("fabric");
//       const fabric = fm.fabric || fm.default || fm;

//       c = new fabric.Canvas("designer-canvas", {
//         width: 600,
//         height: 700,
//         preserveObjectStacking: true,
//       });

//       // clamp movement inside printable area (normal mode only – in full mode we let it go free,
//       // the mask will clip it visually)
//       c.on("object:moving", (e) => {
//         const obj = e.target;
//         if (!obj || obj._isGuide) return;

//         if (!fullShirtMode) {
//           const w = obj.getScaledWidth();
//           const h = obj.getScaledHeight();

//           const L = PRINT.left;
//           const T = PRINT.top;
//           const R = PRINT.left + PRINT.width;
//           const B = PRINT.top + PRINT.height;

//           if (obj.left < L) obj.left = L;
//           if (obj.top < T) obj.top = T;
//           if (obj.left + w > R) obj.left = R - w;
//           if (obj.top + h > B) obj.top = B - h;
//         }
//       });

//       // delete key
//       const onKey = (e) => {
//         if (e.key === "Delete" || e.key === "Backspace") {
//           const a = c.getActiveObject();
//           if (a) {
//             c.remove(a);
//             c.discardActiveObject();
//             c.requestRenderAll();
//           }
//         }
//       };
//       document.addEventListener("keydown", onKey);

//       // when new objects are added (upload / text), auto-apply mask if needed
//       c.on("object:added", (e) => {
//         const obj = e.target;
//         if (!obj || obj._isGuide) return;
//         const state = useDesignerStore.getState();
//         if (state.fullShirtMode && maskRef.current) {
//           obj.clipPath = maskRef.current;
//         } else {
//           obj.clipPath = null;
//         }
//       });

//       setCanvas(c);

//       return () => {
//         document.removeEventListener("keydown", onKey);
//         c && c.dispose();
//       };
//     })();
//   }, [setCanvas, fullShirtMode]);

//   // ---------- helper: dashed printable guide ----------
//   const drawPrintableGuide = async (c) => {
//     const fm = await import("fabric");
//     const fabric = fm.fabric || fm.default || fm;

//     const rect = new fabric.Rect({
//       left: PRINT.left,
//       top: PRINT.top,
//       width: PRINT.width,
//       height: PRINT.height,
//       fill: "transparent",
//       stroke: "#333",
//       strokeDashArray: [6, 6],
//       selectable: false,
//       evented: false,
//       hoverCursor: "default",
//     });
//     rect._isGuide = true;
//     c.add(rect);
//     rect.moveTo(c.getObjects().length - 1);
//   };

//   // ---------- helper: apply or remove mask on all objects ----------
//   const applyMaskToObjects = (c, mask, enabled) => {
//     if (!c) return;
//     c.getObjects().forEach((obj) => {
//       if (obj._isGuide || obj === c.backgroundImage) return;
//       if (enabled && mask) {
//         obj.clipPath = mask;
//       } else {
//         obj.clipPath = null;
//       }
//       obj.dirty = true;
//     });
//     c.requestRenderAll();
//   };

//   // ---------- Load mockup + restore designs when shirt/side changes ----------
//   useEffect(() => {
//     (async () => {
//       if (!canvas) return;

//       const fm = await import("fabric");
//       const fabric = fm.fabric || fm.default || fm;
//       const fit = (await import("../utils/fit")).fitIntoBox;

//       const active = tshirtDesigns[activeDesignIndex];
//       const side = active?.sides?.[activeSide];
//       if (!side?.mockup) return;

//       // clear everything (objects + guides)
//       canvas.clear();
//       maskRef.current = null;

//       // 1) background mockup
//       let bgImg = null;
//       await new Promise((resolve) => {
//         fabric.Image.fromURL(
//           side.mockup,
//           (img) => {
//             img.scaleToWidth(550);
//             img.set({
//               left: 25,
//               top: 50,
//               selectable: false,
//               evented: false,
//             });
//             canvas.setBackgroundImage(img, () => {
//               canvas.renderAll();
//               resolve();
//             });
//             bgImg = img;
//           },
//           { crossOrigin: "anonymous" }
//         );
//       });

//       // 2) build MASK from the same mockup image (used only as clipPath, not drawn)
//       if (bgImg) {
//         // clone the background image to use as a clipPath
//         const mask = bgImg.clone();
//         mask.set({
//           left: bgImg.left,
//           top: bgImg.top,
//           originX: "left",
//           originY: "top",
//           selectable: false,
//           evented: false,
//         });
//         mask.scaleX = bgImg.scaleX;
//         mask.scaleY = bgImg.scaleY;
//         mask.absolutePositioned = true; // coordinates relative to canvas, not to object
//         maskRef.current = mask;
//       }

//       // 3) restore saved designs
//       const toLoad = side.designs || [];
//       for (const d of toLoad) {
//         if (d.type === "image") {
//           await new Promise((resolve) => {
//             fabric.Image.fromURL(
//               d.url,
//               (img) => {
//                 if (typeof d.scaleX === "number" || typeof d.left === "number") {
//                   img.set({
//                     left: d.left ?? PRINT.left,
//                     top: d.top ?? PRINT.top,
//                     scaleX: d.scaleX ?? 1,
//                     scaleY: d.scaleY ?? 1,
//                     angle: d.angle ?? 0,
//                     selectable: true,
//                     originX: "left",
//                     originY: "top",
//                   });
//                 } else {
//                   const W = img._element?.naturalWidth || img.width;
//                   const H = img._element?.naturalHeight || img.height;
//                   const { scale, left, top } = fit(W, H, PRINT, {
//                     paddingRatio: 0.06,
//                   });
//                   img.set({ originX: "left", originY: "top" });
//                   img.scale(scale);
//                   img.set({
//                     left,
//                     top,
//                     selectable: true,
//                   });
//                 }
//                 img.setCoords();

//                 // apply mask if full-shirt mode is currently on
//                 if (fullShirtMode && maskRef.current) {
//                   img.clipPath = maskRef.current;
//                 }

//                 canvas.add(img);
//                 canvas.requestRenderAll();
//                 resolve(null);
//               },
//               { crossOrigin: "anonymous" }
//             );
//           });
//         } else if (d.type === "text") {
//           const txt = new fabric.Textbox(d.text || "Add Text", {
//             left: d.left ?? PRINT.left + 10,
//             top: d.top ?? PRINT.top + 10,
//             scaleX: d.scaleX ?? 1,
//             scaleY: d.scaleY ?? 1,
//             angle: d.angle ?? 0,
//             fontFamily: d.fontFamily || "Poppins",
//             fill: d.color || "#000",
//             selectable: true,
//             originX: "left",
//             originY: "top",
//           });

//           // mask if needed
//           if (fullShirtMode && maskRef.current) {
//             txt.clipPath = maskRef.current;
//           }

//           txt.setCoords();
//           canvas.add(txt);
//         }
//       }

//       // 4) normal dashed printable guide (only as visual, still there in full mode)
//       await drawPrintableGuide(canvas);

//       // 5) after everything is added, (re)apply mask according to current mode
//       applyMaskToObjects(canvas, maskRef.current, fullShirtMode);
//     })();
//   }, [canvas, tshirtDesigns, activeDesignIndex, activeSide, fullShirtMode]);

//   // ---------- React when fullShirtMode toggles ----------
//   useEffect(() => {
//     if (!canvas) return;
//     applyMaskToObjects(canvas, maskRef.current, fullShirtMode);
//   }, [canvas, fullShirtMode]);

//   return (
//     <div
//       className="flex items-center justify-center"
//       style={{ width: "100%", height: "800px" }}
//     >
//       <canvas
//         id="designer-canvas"
//         ref={canvasEl}
//         width="600"
//         height="700"
//         style={{ border: "1px solid #ccc" }}
//       />
//     </div>
//   );
// }

// import { useEffect, useRef } from "react";
// import { useDesignerStore } from "../state/useDesignerStore";
// import PRINT from "../config/printBox";

// // Front full-shirt mask image (already accessible in browser)
// const FULL_FRONT_MASK_URL = "/mockups/full_mask_tshirt/tshirt_full_white_mask.png";

// export default function CanvasArea() {
//   const canvasEl = useRef(null);
//   const maskRef = useRef(null); // current clipPath mask for this side

//   const {
//     canvas,
//     setCanvas,
//     tshirtDesigns,
//     activeDesignIndex,
//     activeSide,
//     isFullPrintActiveSide, // <-- from store
//   } = useDesignerStore();

//   // --------------------
//   // INIT FABRIC CANVAS ONCE
//   // --------------------
//   useEffect(() => {
//     let c;
//     (async () => {
//       const fm = await import("fabric");
//       const fabric = fm.fabric || fm.default || fm;

//       c = new fabric.Canvas("designer-canvas", {
//         width: 600,
//         height: 700,
//         preserveObjectStacking: true,
//       });

//       // Clamp movement ONLY when not in full-print for this side
//       c.on("object:moving", (e) => {
//         const obj = e.target;
//         if (!obj || obj._isGuide) return;

//         const st = useDesignerStore.getState();
//         const full = st.isFullPrintActiveSide
//           ? st.isFullPrintActiveSide()
//           : false;

//         if (!full) {
//           const w = obj.getScaledWidth();
//           const h = obj.getScaledHeight();

//           const L = PRINT.left;
//           const T = PRINT.top;
//           const R = PRINT.left + PRINT.width;
//           const B = PRINT.top + PRINT.height;

//           if (obj.left < L) obj.left = L;
//           if (obj.top < T) obj.top = T;
//           if (obj.left + w > R) obj.left = R - w;
//           if (obj.top + h > B) obj.top = B - h;
//         }
//       });

//       // Delete key
//       const onKey = (e) => {
//         if (e.key === "Delete" || e.key === "Backspace") {
//           const a = c.getActiveObject();
//           if (a) {
//             c.remove(a);
//             c.discardActiveObject();
//             c.requestRenderAll();
//           }
//         }
//       };
//       document.addEventListener("keydown", onKey);

//       // When new objects are added (upload / text), auto-apply mask if needed
//       c.on("object:added", (e) => {
//         const obj = e.target;
//         if (!obj || obj._isGuide) return;

//         const st = useDesignerStore.getState();
//         const full = st.isFullPrintActiveSide
//           ? st.isFullPrintActiveSide()
//           : false;
//         const side = st.activeSide || "front";

//         if (full && side === "front" && maskRef.current) {
//           obj.clipPath = maskRef.current;
//         } else {
//           obj.clipPath = null;
//         }
//       });

//       setCanvas(c);

//       return () => {
//         document.removeEventListener("keydown", onKey);
//         c && c.dispose();
//       };
//     })();
//   }, [setCanvas]);

//   // --------------------
//   // DRAW PRINTABLE GUIDE (for normal mode visual)
//   // --------------------
//   const drawPrintableGuide = async (c) => {
//     const fm = await import("fabric");
//     const fabric = fm.fabric || fm.default || fm;

//     const rect = new fabric.Rect({
//       left: PRINT.left,
//       top: PRINT.top,
//       width: PRINT.width,
//       height: PRINT.height,
//       fill: "transparent",
//       stroke: "#333",
//       strokeDashArray: [6, 6],
//       selectable: false,
//       evented: false,
//       hoverCursor: "default",
//     });
//     rect._isGuide = true;
//     c.add(rect);
//     rect.moveTo(c.getObjects().length - 1);
//   };

//   // --------------------
//   // APPLY MASK TO ALL OBJECTS (except background & guide)
//   // --------------------
//   const applyMaskToObjects = (c, mask, enabled) => {
//     if (!c) return;

//     c.getObjects().forEach((obj) => {
//       if (!obj || obj._isGuide) return;
//       if (obj === c.backgroundImage) return;

//       if (enabled && mask) {
//         obj.clipPath = mask;
//       } else {
//         obj.clipPath = null;
//       }
//       obj.dirty = true;
//     });
//     c.requestRenderAll();
//   };

//   // --------------------
//   // LOAD MOCKUP + MASK + RESTORE OBJECTS
//   // --------------------
//   useEffect(() => {
//     (async () => {
//       if (!canvas) return;

//       const fm = await import("fabric");
//       const fabric = fm.fabric || fm.default || fm;
//       const fit = (await import("../utils/fit")).fitIntoBox;

//       const active = tshirtDesigns[activeDesignIndex];
//       const sideObj = active?.sides?.[activeSide];
//       if (!sideObj?.mockup) return;

//       const fullForSide = isFullPrintActiveSide ? isFullPrintActiveSide() : false;
//       const isFront = activeSide === "front";

//       // Clear canvas and reset mask ref
//       canvas.clear();
//       maskRef.current = null;

//       // 1) Background mockup
//       let bgImg = null;
//       await new Promise((resolve) => {
//         fabric.Image.fromURL(
//           sideObj.mockup,
//           (img) => {
//             if (!img) return resolve();

//             img.scaleToWidth(550);
//             img.set({
//               left: 25,
//               top: 50,
//               selectable: false,
//               evented: false,
//             });
//             canvas.setBackgroundImage(img, () => {
//               canvas.renderAll();
//               resolve();
//             });
//             bgImg = img;
//           },
//           { crossOrigin: "anonymous" }
//         );
//       });

//       // 2) Load MASK IMAGE (front only, full-shirt mode)
//       if (fullForSide && isFront) {
//         await new Promise((resolve) => {
//           fabric.Image.fromURL(
//             FULL_FRONT_MASK_URL,
//             (maskImg) => {
//               if (!maskImg || !bgImg) {
//                 return resolve();
//               }

//               // Match position & scale to background
//               maskImg.set({
//                 left: bgImg.left,
//                 top: bgImg.top,
//                 originX: "left",
//                 originY: "top",
//                 selectable: false,
//                 evented: false,
//                 absolutePositioned: true,
//               });
//               maskImg.scaleToWidth(bgImg.getScaledWidth());
//               // height auto-preserved with scaleToWidth
//               maskRef.current = maskImg;
//               resolve();
//             },
//             { crossOrigin: "anonymous" }
//           );
//         });
//       }

//       // 3) Restore saved designs
//       const toLoad = Array.isArray(sideObj.designs) ? sideObj.designs : [];
//       for (const d of toLoad) {
//         if (!d || !d.type) continue;

//         if (d.type === "image" && d.url) {
//           await new Promise((resolve) => {
//             fabric.Image.fromURL(
//               d.url,
//               (img) => {
//                 if (!img) return resolve();

//                 if (typeof d.scaleX === "number" || typeof d.left === "number") {
//                   img.set({
//                     left: d.left ?? PRINT.left,
//                     top: d.top ?? PRINT.top,
//                     scaleX: d.scaleX ?? 1,
//                     scaleY: d.scaleY ?? 1,
//                     angle: d.angle ?? 0,
//                     selectable: true,
//                     originX: "left",
//                     originY: "top",
//                   });
//                 } else {
//                   const W = img._element?.naturalWidth || img.width;
//                   const H = img._element?.naturalHeight || img.height;
//                   const { scale, left, top } = fit(W, H, PRINT, {
//                     paddingRatio: 0.06,
//                   });
//                   img.set({
//                     originX: "left",
//                     originY: "top",
//                     selectable: true,
//                   });
//                   img.scale(scale);
//                   img.set({ left, top });
//                 }

//                 if (fullForSide && isFront && maskRef.current) {
//                   img.clipPath = maskRef.current;
//                 }

//                 img.setCoords();
//                 canvas.add(img);
//                 canvas.requestRenderAll();
//                 resolve();
//               },
//               { crossOrigin: "anonymous" }
//             );
//           });
//         }

//         if (d.type === "text") {
//           const txt = new fabric.Textbox(d.text || "Add Text", {
//             left: d.left ?? PRINT.left + 10,
//             top: d.top ?? PRINT.top + 10,
//             scaleX: d.scaleX ?? 1,
//             scaleY: d.scaleY ?? 1,
//             angle: d.angle ?? 0,
//             fontFamily: d.fontFamily || "Poppins",
//             fill: d.color || "#000",
//             selectable: true,
//             originX: "left",
//             originY: "top",
//           });

//           if (fullForSide && isFront && maskRef.current) {
//             txt.clipPath = maskRef.current;
//           }

//           txt.setCoords();
//           canvas.add(txt);
//         }
//       }

//       // 4) Normal dashed box (still visible as guide)
//       //await drawPrintableGuide(canvas);
//       // 4) Draw dashed printable guide ONLY when NOT in full-shirt mode
//       if (!fullShirtMode) {
//         await drawPrintableGuide(canvas);
//       }

//       // 5) Apply mask to all objects according to current flag
//       applyMaskToObjects(canvas, maskRef.current, fullForSide && isFront);
//     })();
//   }, [canvas, tshirtDesigns, activeDesignIndex, activeSide, isFullPrintActiveSide]);

//   // --------------------
//   // WHEN FULL-PRINT FLAG CHANGES (store updated)
//   // --------------------
//   useEffect(() => {
//     if (!canvas) return;
//     const full = isFullPrintActiveSide ? isFullPrintActiveSide() : false;
//     const enabled = full && activeSide === "front";
//     applyMaskToObjects(canvas, maskRef.current, enabled);
//   }, [canvas, activeSide, isFullPrintActiveSide]);

//   return (
//     <div
//       className="flex items-center justify-center"
//       style={{ width: "100%", height: "800px" }}
//     >
//       <canvas
//         id="designer-canvas"
//         ref={canvasEl}
//         width="600"
//         height="700"
//         style={{ border: "1px solid #ccc" }}
//       />
//     </div>
//   );
// }

import { useEffect, useRef } from "react";
import { useDesignerStore } from "../state/useDesignerStore";
import PRINT, { getPrintArea } from "../config/printBox";

// Mask PNG for full-shirt FRONT (white)
const FULL_MASK_URL = "/mockups/full_mask_tshirt/tshirt_full_white_mask.png";

export default function CanvasArea() {
  const canvasEl = useRef(null);
  const maskRef = useRef(null); // current clipPath mask for this side

  const {
    canvas,
    setCanvas,
    tshirtDesigns,
    activeDesignIndex,
    activeSide,
    isFullPrintActiveSide,
  } = useDesignerStore();

  // ------------------------------
  // INIT FABRIC CANVAS ONCE
  // ------------------------------
  useEffect(() => {
    let c;
    (async () => {
      const fm = await import("fabric");
      const fabric = fm.fabric || fm.default || fm;

      c = new fabric.Canvas("designer-canvas", {
        width: 600,
        height: 700,
        preserveObjectStacking: true,
      });

      // Movement clamp (normal mode only)
      c.on("object:moving", (e) => {
        const obj = e.target;
        if (!obj || obj._isGuide) return;

        const st = useDesignerStore.getState();
        const full = st.isFullPrintActiveSide
          ? st.isFullPrintActiveSide()
          : false;
        const side = st.activeSide || "front";

        // In full-shirt FRONT mode we do NOT clamp – mask will clip
        if (full && side === "front") {
          return;
        }

        const AREA = getPrintArea(false, side); // normal chest box
        const w = obj.getScaledWidth();
        const h = obj.getScaledHeight();

        const L = AREA.left;
        const T = AREA.top;
        const R = AREA.left + AREA.width;
        const B = AREA.top + AREA.height;

        if (obj.left < L) obj.left = L;
        if (obj.top < T) obj.top = T;
        if (obj.left + w > R) obj.left = R - w;
        if (obj.top + h > B) obj.top = B - h;
      });

      // Delete key
      const onKey = (e) => {
        if (e.key === "Delete" || e.key === "Backspace") {
          const a = c.getActiveObject();
          if (a) {
            c.remove(a);
            c.discardActiveObject();
            c.requestRenderAll();
          }
        }
      };
      document.addEventListener("keydown", onKey);

      // When new objects are added, auto-apply mask if full-front
      c.on("object:added", (e) => {
        const obj = e.target;
        if (!obj || obj._isGuide) return;

        const st = useDesignerStore.getState();
        const full = st.isFullPrintActiveSide
          ? st.isFullPrintActiveSide()
          : false;
        const side = st.activeSide || "front";

        if (full && side === "front" && maskRef.current) {
          obj.clipPath = maskRef.current;
        } else {
          obj.clipPath = null;
        }
      });

      setCanvas(c);

      return () => {
        document.removeEventListener("keydown", onKey);
        c && c.dispose();
      };
    })();
  }, [setCanvas]);

  // ------------------------------
  // DRAW CHEST PRINT GUIDE BOX
  // ------------------------------
  const drawGuideBox = async (c, side) => {
    const fm = await import("fabric");
    const fabric = fm.fabric || fm.default || fm;

    const AREA = getPrintArea(false, side); // normal box for that side

    const rect = new fabric.Rect({
      left: AREA.left,
      top: AREA.top,
      width: AREA.width,
      height: AREA.height,
      fill: "transparent",
      stroke: "#333",
      strokeDashArray: [6, 6],
      selectable: false,
      evented: false,
      hoverCursor: "default",
    });

    rect._isGuide = true;
    c.add(rect);
    rect.bringToFront();
  };

  // ------------------------------
  // APPLY MASK TO ALL OBJECTS
  // ------------------------------
  const applyMask = (c, enabled) => {
    if (!c) return;

    c.getObjects().forEach((o) => {
      if (!o || o._isGuide) return;
      if (o === c.backgroundImage) return;

      if (enabled && maskRef.current) {
        o.clipPath = maskRef.current;
      } else {
        o.clipPath = null;
      }
      o.dirty = true;
    });

    c.requestRenderAll();
  };

  // ------------------------------
  // LOAD MOCKUP + MASK + DESIGNS
  // ------------------------------
  useEffect(() => {
    (async () => {
      if (!canvas) return;

      const fm = await import("fabric");
      const fabric = fm.fabric || fm.default || fm;
      const { fitIntoBox } = await import("../utils/fit");

      const active = tshirtDesigns[activeDesignIndex];
      if (!active) return;

      const sideObj = active.sides?.[activeSide];
      if (!sideObj?.mockup) return;

      const full = isFullPrintActiveSide ? isFullPrintActiveSide() : false;
      const side = activeSide || "front";

      // Area for this side + mode
      const AREA = getPrintArea(full, side);

      // Reset canvas + mask
      canvas.clear();
      maskRef.current = null;

      // 1) Background mockup
      let bgImg = null;
      await new Promise((resolve) => {
        fabric.Image.fromURL(
          sideObj.mockup,
          (img) => {
            if (!img) return resolve();
            img.scaleToWidth(550);
            img.set({
              left: 25,
              top: 50,
              selectable: false,
              evented: false,
            });
            canvas.setBackgroundImage(img, () => {
              canvas.renderAll();
              resolve();
            });
            bgImg = img;
          },
          { crossOrigin: "anonymous" }
        );
      });

      // 2) Load MASK for full FRONT only
      if (full && side === "front") {
        await new Promise((resolve) => {
          fabric.Image.fromURL(
            FULL_MASK_URL,
            (maskImg) => {
              if (!maskImg || !bgImg) return resolve();

              maskImg.set({
                left: bgImg.left,
                top: bgImg.top,
                originX: "left",
                originY: "top",
                selectable: false,
                evented: false,
                absolutePositioned: true,
              });
              maskImg.scaleToWidth(bgImg.getScaledWidth());
              maskRef.current = maskImg;
              resolve();
            },
            { crossOrigin: "anonymous" }
          );
        });
      }

      // 3) Restore designs (images + text)
      const toLoad = Array.isArray(sideObj.designs) ? sideObj.designs : [];

      for (const d of toLoad) {
        if (!d || !d.type) continue;

        if (d.type === "image" && d.url) {
          await new Promise((resolve) => {
            fabric.Image.fromURL(
              d.url,
              (img) => {
                if (!img) return resolve();

                if (typeof d.scaleX === "number" || typeof d.left === "number") {
                  // use saved position
                  img.set({
                    left: d.left ?? AREA.left,
                    top: d.top ?? AREA.top,
                    scaleX: d.scaleX ?? 1,
                    scaleY: d.scaleY ?? 1,
                    angle: d.angle ?? 0,
                    originX: "left",
                    originY: "top",
                    selectable: true,
                  });
                } else {
                  // auto-fit into AREA
                  const W = img._element?.naturalWidth || img.width;
                  const H = img._element?.naturalHeight || img.height;

                  const { scale, left, top } = fitIntoBox(W, H, AREA, {
                    paddingRatio: 0.06,
                  });

                  img.set({
                    originX: "left",
                    originY: "top",
                    selectable: true,
                  });
                  img.scale(scale);
                  img.set({ left, top });
                }

                // apply mask in full FRONT mode
                if (full && side === "front" && maskRef.current) {
                  img.clipPath = maskRef.current;
                }

                img.setCoords();
                canvas.add(img);
                resolve();
              },
              { crossOrigin: "anonymous" }
            );
          });
        }

        if (d.type === "text") {
          const txt = new fabric.Textbox(d.text || "Add Text", {
            left: d.left ?? AREA.left + 10,
            top: d.top ?? AREA.top + 10,
            scaleX: d.scaleX ?? 1,
            scaleY: d.scaleY ?? 1,
            angle: d.angle ?? 0,
            fontFamily: d.fontFamily || "Poppins",
            fill: d.color || "#000",
            originX: "left",
            originY: "top",
            selectable: true,
          });

          if (full && side === "front" && maskRef.current) {
            txt.clipPath = maskRef.current;
          }

          txt.setCoords();
          canvas.add(txt);
        }
      }

      // 4) Show chest guide ONLY in normal mode
      if (!full) {
        await drawGuideBox(canvas, side);
      }

      // 5) Final mask pass (for any objects missed)
      applyMask(canvas, full && side === "front");
    })();
  }, [
    canvas,
    tshirtDesigns,
    activeDesignIndex,
    activeSide,
    isFullPrintActiveSide,
  ]);

  // ------------------------------
  // RE-APPLY MASK WHEN MODE CHANGES
  // ------------------------------
  useEffect(() => {
    if (!canvas) return;
    const full = isFullPrintActiveSide ? isFullPrintActiveSide() : false;
    const side = activeSide || "front";
    applyMask(canvas, full && side === "front");
  }, [canvas, activeSide, isFullPrintActiveSide]);

  return (
    <div
      className="flex items-center justify-center"
      style={{ width: "100%", height: "800px" }}
    >
      <canvas
        id="designer-canvas"
        ref={canvasEl}
        width="600"
        height="700"
        style={{ border: "1px solid #ccc" }}
      />
    </div>
  );
}
