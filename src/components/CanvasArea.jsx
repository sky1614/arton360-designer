// import { useEffect, useRef } from "react";
// import { useDesignerStore } from "../state/useDesignerStore";
// import PRINT, { getPrintArea } from "../config/printBox";

// // Mask PNG for full-shirt FRONT (white)
// const FULL_MASK_URL = "/mockups/full_mask_tshirt/tshirt_full_white_mask.png";

// export default function CanvasArea() {
//   const canvasEl = useRef(null);
//   const maskRef = useRef(null); // current clipPath mask for this side

//   const {
//     canvas,
//     setCanvas,
//     tshirtDesigns,
//     activeDesignIndex,
//     activeSide,
//     isFullPrintActiveSide,
//   } = useDesignerStore();

//   // ------------------------------
//   // INIT FABRIC CANVAS ONCE
//   // ------------------------------
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

//       // Movement clamp (normal mode only)
//       c.on("object:moving", (e) => {
//         const obj = e.target;
//         if (!obj || obj._isGuide) return;

//         const st = useDesignerStore.getState();
//         const full = st.isFullPrintActiveSide
//           ? st.isFullPrintActiveSide()
//           : false;
//         const side = st.activeSide || "front";

//         // In full-shirt FRONT mode we do NOT clamp – mask will clip
//         if (full && side === "front") {
//           return;
//         }

//         const AREA = getPrintArea(false, side); // normal chest box
//         const w = obj.getScaledWidth();
//         const h = obj.getScaledHeight();

//         const L = AREA.left;
//         const T = AREA.top;
//         const R = AREA.left + AREA.width;
//         const B = AREA.top + AREA.height;

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

//       // When new objects are added, auto-apply mask if full-front
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

//   // ------------------------------
//   // DRAW CHEST PRINT GUIDE BOX
//   // ------------------------------
//   const drawGuideBox = async (c, side) => {
//     const fm = await import("fabric");
//     const fabric = fm.fabric || fm.default || fm;

//     const AREA = getPrintArea(false, side); // normal box for that side

//     const rect = new fabric.Rect({
//       left: AREA.left,
//       top: AREA.top,
//       width: AREA.width,
//       height: AREA.height,
//       fill: "transparent",
//       stroke: "#333",
//       strokeDashArray: [6, 6],
//       selectable: false,
//       evented: false,
//       hoverCursor: "default",
//     });

//     rect._isGuide = true;
//     c.add(rect);
//     rect.bringToFront();
//   };

//   // ------------------------------
//   // APPLY MASK TO ALL OBJECTS
//   // ------------------------------
//   const applyMask = (c, enabled) => {
//     if (!c) return;

//     c.getObjects().forEach((o) => {
//       if (!o || o._isGuide) return;
//       if (o === c.backgroundImage) return;

//       if (enabled && maskRef.current) {
//         o.clipPath = maskRef.current;
//       } else {
//         o.clipPath = null;
//       }
//       o.dirty = true;
//     });

//     c.requestRenderAll();
//   };

//   // ------------------------------
//   // LOAD MOCKUP + MASK + DESIGNS
//   // ------------------------------
//   useEffect(() => {
//     (async () => {
//       if (!canvas) return;

//       const fm = await import("fabric");
//       const fabric = fm.fabric || fm.default || fm;
//       const { fitIntoBox } = await import("../utils/fit");

//       const active = tshirtDesigns[activeDesignIndex];
//       if (!active) return;

//       const sideObj = active.sides?.[activeSide];
//       if (!sideObj?.mockup) return;

//       const full = isFullPrintActiveSide ? isFullPrintActiveSide() : false;
//       const side = activeSide || "front";

//       // Area for this side + mode
//       const AREA = getPrintArea(full, side);

//       // Reset canvas + mask
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

//       // 2) Load MASK for full FRONT only
//       if (full && side === "front") {
//         await new Promise((resolve) => {
//           fabric.Image.fromURL(
//             FULL_MASK_URL,
//             (maskImg) => {
//               if (!maskImg || !bgImg) return resolve();

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
//               maskRef.current = maskImg;
//               resolve();
//             },
//             { crossOrigin: "anonymous" }
//           );
//         });
//       }

//       // 3) Restore designs (images + text)
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
//                   // use saved position
//                   img.set({
//                     left: d.left ?? AREA.left,
//                     top: d.top ?? AREA.top,
//                     scaleX: d.scaleX ?? 1,
//                     scaleY: d.scaleY ?? 1,
//                     angle: d.angle ?? 0,
//                     originX: "left",
//                     originY: "top",
//                     selectable: true,
//                   });
//                 } else {
//                   // auto-fit into AREA
//                   const W = img._element?.naturalWidth || img.width;
//                   const H = img._element?.naturalHeight || img.height;

//                   const { scale, left, top } = fitIntoBox(W, H, AREA, {
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

//                 // apply mask in full FRONT mode
//                 if (full && side === "front" && maskRef.current) {
//                   img.clipPath = maskRef.current;
//                 }

//                 img.setCoords();
//                 canvas.add(img);
//                 resolve();
//               },
//               { crossOrigin: "anonymous" }
//             );
//           });
//         }

//         if (d.type === "text") {
//           const txt = new fabric.Textbox(d.text || "Add Text", {
//             left: d.left ?? AREA.left + 10,
//             top: d.top ?? AREA.top + 10,
//             scaleX: d.scaleX ?? 1,
//             scaleY: d.scaleY ?? 1,
//             angle: d.angle ?? 0,
//             fontFamily: d.fontFamily || "Poppins",
//             fill: d.color || "#000",
//             originX: "left",
//             originY: "top",
//             selectable: true,
//           });

//           if (full && side === "front" && maskRef.current) {
//             txt.clipPath = maskRef.current;
//           }

//           txt.setCoords();
//           canvas.add(txt);
//         }
//       }

//       // 4) Show chest guide ONLY in normal mode
//       if (!full) {
//         await drawGuideBox(canvas, side);
//       }

//       // 5) Final mask pass (for any objects missed)
//       applyMask(canvas, full && side === "front");
//     })();
//   }, [
//     canvas,
//     tshirtDesigns,
//     activeDesignIndex,
//     activeSide,
//     isFullPrintActiveSide,
//   ]);

//   // ------------------------------
//   // RE-APPLY MASK WHEN MODE CHANGES
//   // ------------------------------
//   useEffect(() => {
//     if (!canvas) return;
//     const full = isFullPrintActiveSide ? isFullPrintActiveSide() : false;
//     const side = activeSide || "front";
//     applyMask(canvas, full && side === "front");
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

// // src/components/CanvasArea.jsx
// import { useEffect, useRef } from "react";
// import { useDesignerStore } from "../state/useDesignerStore";
// import PRINT, { getPrintArea } from "../config/printBox";

// // Mask PNGs for full-shirt FRONT & BACK (white masks reused for all colours)
// const FULL_MASK_FRONT_URL =
//   "/mockups/full_mask_tshirt/tshirt_full_white_mask.png";
// const FULL_MASK_BACK_URL =
//   "/mockups/full_mask_tshirt/tshirt_full_back_mask.png";

// export default function CanvasArea() {
//   const canvasEl = useRef(null);
//   const maskRef = useRef(null); // current clipPath mask for this side

//   const {
//     canvas,
//     setCanvas,
//     tshirtDesigns,
//     activeDesignIndex,
//     activeSide,
//     isFullPrintActiveSide,
//   } = useDesignerStore();

//   // ------------------------------
//   // INIT FABRIC CANVAS ONCE
//   // ------------------------------
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
//       c.selection = true;

//       // Movement clamp (normal mode only)
//       c.on("object:moving", (e) => {
//         const obj = e.target;
//         if (!obj || obj._isGuide) return;

//         const st = useDesignerStore.getState();
//         const full = st.isFullPrintActiveSide
//           ? st.isFullPrintActiveSide()
//           : false;
//         const side = st.activeSide || "front";

//         // In full-shirt mode (front or back) we do NOT clamp – mask will clip
//         if (full) return;

//         const AREA = getPrintArea(false, side); // normal chest box
//         const w = obj.getScaledWidth();
//         const h = obj.getScaledHeight();

//         const L = AREA.left;
//         const T = AREA.top;
//         const R = AREA.left + AREA.width;
//         const B = AREA.top + AREA.height;

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

//       // When new objects are added, auto-apply mask if full mode
//       c.on("object:added", (e) => {
//         const obj = e.target;
//         if (!obj || obj._isGuide) return;

//         const st = useDesignerStore.getState();
//         const full = st.isFullPrintActiveSide
//           ? st.isFullPrintActiveSide()
//           : false;

//         if (full && maskRef.current) {
//           obj.clipPath = maskRef.current;
//         } else {
//           obj.clipPath = null;
//         }

//         // make sure objects stay draggable
//         obj.selectable = true;
//         obj.evented = true;
//         obj.lockMovementX = false;
//         obj.lockMovementY = false;
//       });

//       setCanvas(c);

//       return () => {
//         document.removeEventListener("keydown", onKey);
//         c && c.dispose();
//       };
//     })();
//   }, [setCanvas]);

//   // ------------------------------
//   // DRAW CHEST PRINT GUIDE BOX
//   // ------------------------------
//   const drawGuideBox = async (c, side) => {
//     const fm = await import("fabric");
//     const fabric = fm.fabric || fm.default || fm;

//     const AREA = getPrintArea(false, side); // normal box for that side

//     const rect = new fabric.Rect({
//       left: AREA.left,
//       top: AREA.top,
//       width: AREA.width,
//       height: AREA.height,
//       fill: "transparent",
//       stroke: "#333",
//       strokeDashArray: [6, 6],
//       selectable: false,
//       evented: false,
//       hoverCursor: "default",
//     });

//     rect._isGuide = true;
//     c.add(rect);
//     rect.bringToFront();
//   };

//   // ------------------------------
//   // APPLY MASK TO ALL OBJECTS
//   // ------------------------------
//   const applyMask = (c, enabled) => {
//     if (!c) return;

//     c.getObjects().forEach((o) => {
//       if (!o || o._isGuide) return;
//       if (o === c.backgroundImage) return;

//       if (enabled && maskRef.current) {
//         o.clipPath = maskRef.current;
//       } else {
//         o.clipPath = null;
//       }

//       // ensure interactability
//       o.selectable = true;
//       o.evented = true;
//       o.lockMovementX = false;
//       o.lockMovementY = false;
//       o.dirty = true;
//     });

//     c.requestRenderAll();
//   };

//   // ------------------------------
//   // LOAD MOCKUP + MASK + DESIGNS
//   // ------------------------------
//   useEffect(() => {
//     (async () => {
//       if (!canvas) return;

//       const fm = await import("fabric");
//       const fabric = fm.fabric || fm.default || fm;
//       const { fitIntoBox } = await import("../utils/fit");

//       const active = tshirtDesigns[activeDesignIndex];
//       if (!active) return;

//       const sideObj = active.sides?.[activeSide];
//       if (!sideObj?.mockup) return;

//       const full = isFullPrintActiveSide ? isFullPrintActiveSide() : false;
//       const side = activeSide || "front";

//       // Area for this side + mode
//       const AREA = getPrintArea(full, side);

//       // Reset canvas + mask
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

//       // 2) Load MASK for full FRONT/BACK
//       if (full) {
//         const maskUrl =
//           side === "front" ? FULL_MASK_FRONT_URL : FULL_MASK_BACK_URL;

//         await new Promise((resolve) => {
//           fabric.Image.fromURL(
//             maskUrl,
//             (maskImg) => {
//               if (!maskImg || !bgImg) return resolve();

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
//               maskRef.current = maskImg;
//               resolve();
//             },
//             { crossOrigin: "anonymous" }
//           );
//         });
//       }

//       // 3) Restore designs (images + text)
//       const toLoad = Array.isArray(sideObj.designs) ? sideObj.designs : [];

//       for (const d of toLoad) {
//         if (!d || !d.type) continue;

//         if (d.type === "image" && d.url) {
//           await new Promise((resolve) => {
//             fabric.Image.fromURL(
//               d.url,
//               (img) => {
//                 if (!img) return resolve();

//                 if (
//                   typeof d.scaleX === "number" ||
//                   typeof d.left === "number"
//                 ) {
//                   // use saved position
//                   img.set({
//                     left: d.left ?? AREA.left,
//                     top: d.top ?? AREA.top,
//                     scaleX: d.scaleX ?? 1,
//                     scaleY: d.scaleY ?? 1,
//                     angle: d.angle ?? 0,
//                     originX: "left",
//                     originY: "top",
//                     selectable: true,
//                   });
//                 } else {
//                   // auto-fit into AREA
//                   const W = img._element?.naturalWidth || img.width;
//                   const H = img._element?.naturalHeight || img.height;

//                   const { scale, left, top } = fitIntoBox(W, H, AREA, {
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

//                 // apply mask in full mode
//                 if (full && maskRef.current) {
//                   img.clipPath = maskRef.current;
//                 }

//                 img.setCoords();
//                 canvas.add(img);
//                 resolve();
//               },
//               { crossOrigin: "anonymous" }
//             );
//           });
//         }

//         if (d.type === "text") {
//           const txt = new fabric.Textbox(d.text || "Add Text", {
//             left: d.left ?? AREA.left + 10,
//             top: d.top ?? AREA.top + 10,
//             scaleX: d.scaleX ?? 1,
//             scaleY: d.scaleY ?? 1,
//             angle: d.angle ?? 0,
//             fontFamily: d.fontFamily || "Poppins",
//             fill: d.color || "#000",
//             originX: "left",
//             originY: "top",
//             selectable: true,
//           });

//           if (full && maskRef.current) {
//             txt.clipPath = maskRef.current;
//           }

//           txt.setCoords();
//           canvas.add(txt);
//         }
//       }

//       // 4) Show chest guide ONLY in normal mode
//       if (!full) {
//         await drawGuideBox(canvas, side);
//       }

//       // 5) Final mask pass (for any objects missed)
//       applyMask(canvas, full);
//     })();
//   }, [
//     canvas,
//     tshirtDesigns,
//     activeDesignIndex,
//     activeSide,
//     isFullPrintActiveSide,
//   ]);

//   // ------------------------------
//   // RE-APPLY MASK WHEN MODE CHANGES
//   // ------------------------------
//   useEffect(() => {
//     if (!canvas) return;
//     const full = isFullPrintActiveSide ? isFullPrintActiveSide() : false;
//     applyMask(canvas, full);
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


// src/components/CanvasArea.jsx
import { useEffect, useRef } from "react";
import { useDesignerStore } from "../state/useDesignerStore";
import { getPrintArea } from "../config/printBox";

// One front mask image (used as clipPath in full mode)
const FULL_MASK_URL = "/mockups/full_mask_tshirt/tshirt_full_white_mask.png";

export default function CanvasArea() {
  const canvasRef = useRef(null);
  const maskRef = useRef(null); // holds Fabric.Image used as clipPath

  const {
    canvas,
    setCanvas,
    tshirtDesigns,
    activeDesignIndex,
    activeSide,
    isFullPrintActiveSide,
  } = useDesignerStore();

  // -------------------------------------------------
  // 1) INIT FABRIC CANVAS ONCE
  // -------------------------------------------------
  useEffect(() => {
    let c;
    let keyHandler;
    let mouseDownHandler;
    let mouseMoveHandler;
    let mouseUpHandler;
    let dragTarget = null;
    let lastPos = { x: 0, y: 0 };

    const init = async () => {
      const fm = await import("fabric");
      const fabric = fm.fabric || fm.default || fm;

      // Global defaults (safe)
      fabric.Object.prototype.selectable = true;
      fabric.Object.prototype.evented = true;
      fabric.Object.prototype.hasControls = true;
      fabric.Object.prototype.hasBorders = true;

      if (!canvasRef.current) return;

      c = new fabric.Canvas(canvasRef.current, {
        width: 600,
        height: 700,
        preserveObjectStacking: true,
        selection: true,
      });

      // --- Delete key: remove active object ---
      keyHandler = (e) => {
        if (e.key === "Delete" || e.key === "Backspace") {
          const active = c.getActiveObject();
          if (active && active !== c.backgroundImage) {
            c.remove(active);
            c.discardActiveObject();
            c.requestRenderAll();
          }
        }
      };
      document.addEventListener("keydown", keyHandler);

      // --- Manual DRAG support (in case defaults are broken) ---
      mouseDownHandler = (opt) => {
        const tgt = opt.target;
        // Ignore background + guides
        if (!tgt || tgt === c.backgroundImage || tgt._isGuide) {
          dragTarget = null;
          return;
        }

        c.setActiveObject(tgt);
        dragTarget = tgt;
        lastPos = { x: opt.e.clientX, y: opt.e.clientY };
      };

      mouseMoveHandler = (opt) => {
        if (!dragTarget) return;
        // When scaling/rotating, Fabric sets transform; in that case let Fabric handle it
        if (opt.transform) return;

        const e = opt.e;
        const dx = e.clientX - lastPos.x;
        const dy = e.clientY - lastPos.y;
        lastPos = { x: e.clientX, y: e.clientY };

        dragTarget.left += dx;
        dragTarget.top += dy;
        dragTarget.setCoords();
        c.requestRenderAll();
      };

      mouseUpHandler = () => {
        dragTarget = null;
      };

      c.on("mouse:down", mouseDownHandler);
      c.on("mouse:move", mouseMoveHandler);
      c.on("mouse:up", mouseUpHandler);

      setCanvas(c);
    };

    init();

    return () => {
      if (keyHandler) document.removeEventListener("keydown", keyHandler);
      if (canvasRef.current && canvasRef.current.style) {
        canvasRef.current.style.pointerEvents = "auto";
      }
      if (c) {
        c.off("mouse:down", mouseDownHandler);
        c.off("mouse:move", mouseMoveHandler);
        c.off("mouse:up", mouseUpHandler);
        c.dispose();
      }
    };
  }, [setCanvas]);

  // -------------------------------------------------
  // 2) DRAW CHEST PRINT GUIDE BOX (for box mode)
  // -------------------------------------------------
  const drawGuideBox = async (c, side) => {
    const fm = await import("fabric");
    const fabric = fm.fabric || fm.default || fm;

    const AREA = getPrintArea(false, side);

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
    });

    rect._isGuide = true;
    c.add(rect);
    rect.bringToFront();
  };

  // -------------------------------------------------
  // 3) LOAD side: mockup + mask + designs
  // -------------------------------------------------
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
      const AREA = getPrintArea(full, side);

      // Reset canvas + mask
      canvas.clear();
      maskRef.current = null;

      // Just to be extra safe: re-enable interaction at canvas level
      canvas.isDrawingMode = false;
      canvas.selection = true;
      canvas.skipTargetFind = false;
      if (canvas.upperCanvasEl)
        canvas.upperCanvasEl.style.pointerEvents = "auto";
      if (canvas.lowerCanvasEl)
        canvas.lowerCanvasEl.style.pointerEvents = "auto";

      // ---- 3.1 MOCKUP BACKGROUND ----
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

      // ---- 3.2 MASK FOR FRONT FULL-PRINT ----
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

      // ---- 3.3 RESTORE ARTWORK + TEXT ----
      const saved = Array.isArray(sideObj.designs) ? sideObj.designs : [];

      for (const d of saved) {
        if (!d || !d.type) continue;

        if (d.type === "image" && d.url) {
          await new Promise((resolve) => {
            fabric.Image.fromURL(
              d.url,
              (img) => {
                if (!img) return resolve();

                if (
                  typeof d.left === "number" ||
                  typeof d.scaleX === "number"
                ) {
                  img.set({
                    left: d.left ?? AREA.left,
                    top: d.top ?? AREA.top,
                    scaleX: d.scaleX ?? 1,
                    scaleY: d.scaleY ?? 1,
                    angle: d.angle ?? 0,
                    originX: "left",
                    originY: "top",
                  });
                } else {
                  const W = img._element?.naturalWidth || img.width;
                  const H = img._element?.naturalHeight || img.height;

                  const { scale, left, top } = fitIntoBox(W, H, AREA, {
                    paddingRatio: 0.06,
                  });

                  img.set({
                    originX: "left",
                    originY: "top",
                  });
                  img.scale(scale);
                  img.set({ left, top });
                }

                // FORCE interactive flags
                img.set({
                  selectable: true,
                  evented: true,
                  hasControls: true,
                  hasBorders: true,
                  lockMovementX: false,
                  lockMovementY: false,
                });

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
          });

          txt.set({
            selectable: true,
            evented: true,
            hasControls: true,
            hasBorders: true,
            lockMovementX: false,
            lockMovementY: false,
          });

          if (full && side === "front" && maskRef.current) {
            txt.clipPath = maskRef.current;
          }

          txt.setCoords();
          canvas.add(txt);
        }
      }

      // ---- 3.4 CHEST GUIDE ONLY IN BOX MODE ----
      if (!full) {
        await drawGuideBox(canvas, side);
      }

      canvas.requestRenderAll();
    })();
  }, [
    canvas,
    tshirtDesigns,
    activeDesignIndex,
    activeSide,
    isFullPrintActiveSide,
  ]);

  // -------------------------------------------------
  // 4) RENDER
  // -------------------------------------------------
  return (
    <div
      className="flex items-center justify-center"
      style={{ width: "100%", height: "800px" }}
    >
      <canvas
        id="designer-canvas"
        ref={canvasRef}
        width="600"
        height="700"
        style={{ border: "1px solid #ccc" }}
      />
    </div>
  );
}
