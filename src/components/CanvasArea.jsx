// src/components/CanvasArea.jsx
import { useEffect, useRef } from "react";
import { useDesignerStore } from "../state/useDesignerStore";
import { getPrintArea } from "../config/printBox";

// One front mask image (used as clipPath in full mode)
const FULL_MASK_URL = null;

export default function CanvasArea() {
  const canvasRef = useRef(null);
  const maskRef = useRef(null);
  const didInitRef = useRef(false);
  const areaRef = useRef(null);
  const printTypeRef = useRef("box");
  const maskReadyRef = useRef(false);


  // holds Fabric.Image used as clipPath

  const {
    canvas,
    setCanvas,
    tshirtDesigns,
    activeDesignIndex,
    activeSide,
    isFullPrintActiveSide,
    updateDesignItem,
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
      if (didInitRef.current) return;
      didInitRef.current = true;


      c = new fabric.Canvas(canvasRef.current, {
        width: 600,
        height: 700,
        preserveObjectStacking: true,
        selection: true,
      });
      c.uniformScaling = true;
      // ✅ apply mask to any newly added object (uploads, paste, etc.)
      const applyMaskToObject = (obj) => {
        if (!obj) return;
        if (obj._isGuide || obj === c.backgroundImage) return;
        if (printTypeRef.current !== "mask") return;
        if (!maskReadyRef.current) return;
        if (!maskRef.current) return;

        // avoid re-applying
        if (obj.clipPath) return;

        // ✅ clone mask per object (fixes Fabric cache bug)
        maskRef.current.clone((cl) => {
          cl.set({
            absolutePositioned: true,
            left: maskRef.current.left,
            top: maskRef.current.top,
            originX: "left",
            originY: "top",
            selectable: false,
            evented: false,
          });

          obj.clipPath = cl;

          // ✅ prevents drawClipPathOnCache width/height=0 issues
          obj.objectCaching = false;

          obj.setCoords();
          c.requestRenderAll();
        });
      };

      // ✅ handle uploads that add directly to canvas
      c.on("object:added", (e) => applyMaskToObject(e.target));


      // --- Clamp objects inside printable AREA ---
      const clampToArea = (obj, area) => {
        if (!obj || obj._isGuide || obj === c.backgroundImage) return;
        if (c.__printType === "mask") return;

        // keep inside bounds using the object's bounding box
        obj.setCoords();
        const r = obj.getBoundingRect(true, true);

        // move back inside if out
        let dx = 0;
        let dy = 0;

        if (r.left < area.left) dx = area.left - r.left;
        if (r.top < area.top) dy = area.top - r.top;

        const rRight = r.left + r.width;
        const rBottom = r.top + r.height;

        const aRight = area.left + area.width;
        const aBottom = area.top + area.height;

        if (rRight > aRight) dx = aRight - rRight;
        if (rBottom > aBottom) dy = aBottom - rBottom;

        if (dx !== 0 || dy !== 0) {
          obj.left += dx;
          obj.top += dy;
          obj.setCoords();
        }
      };

      const limitScaleToArea = (obj, area) => {
        if (!obj || obj._isGuide || obj === c.backgroundImage) return;
         if (c.__printType === "mask") return;

        // stop scaling beyond area (bounding box must fit)
        obj.setCoords();
        const r = obj.getBoundingRect(true, true);

        if (r.width > area.width || r.height > area.height) {
          const scaleDown = Math.min(area.width / r.width, area.height / r.height);
          obj.scaleX *= scaleDown;
          obj.scaleY *= scaleDown;
          obj.setCoords();
        }
      };
      // ---- FAST clamp (RAF throttled) ----
      let rafId = null;
      let pendingObj = null;

      const clampRaf = (obj) => {
        pendingObj = obj;
        if (rafId) return;

        rafId = requestAnimationFrame(() => {
          rafId = null;
          const o = pendingObj;
          pendingObj = null;
          if (!o || o._isGuide || o === c.backgroundImage) return;

          const AREA = areaRef.current; // <-- uses the real computed area from section 3
          if (!AREA) return;

          limitScaleToArea(o, AREA);
          clampToArea(o, AREA);
          c.requestRenderAll();
        });
      };

      // single handlers (ONLY ONCE)
      c.on("object:moving", (e) => clampRaf(e.target));
      c.on("object:scaling", (e) => clampRaf(e.target));
      c.on("object:modified", (e) => clampRaf(e.target));


      c.on("mouse:down", (opt) => {
        c.calcOffset(); // force-refresh offsets before hit test
        const p = c.getPointer(opt.e, true);

        const objs = c.getObjects().filter((o) => !o._isGuide);
        const hits = objs.map((o) => ({
          type: o.type,
          selectable: o.selectable,
          evented: o.evented,
          containsPoint: typeof o.containsPoint === "function" ? o.containsPoint(p) : "no containsPoint()",
        }));

        console.log("HITTEST pointer =", p);
        console.log("HITTEST results =", hits);
      });

      // ✅ Make sure UPPER canvas is on top and receives mouse
      c.upperCanvasEl.style.pointerEvents = "auto";
      c.upperCanvasEl.style.zIndex = "10";

      // ✅ LOWER canvas should NOT receive mouse
      c.lowerCanvasEl.style.pointerEvents = "none";
      c.lowerCanvasEl.style.zIndex = "0";

      // ✅ DEBUG: confirm Fabric is receiving events and targets
      c.on("mouse:down", (opt) => {
        console.log("FABRIC mouse:down fired");
        console.log("opt.target =", opt?.target);
      });

      console.log("✅ CanvasArea init running - updated code loaded");

      // ✅ Keep Fabric's pointer offsets correct (very common issue)
      const fixOffset = () => {
        try {
          c.calcOffset();
          c.requestRenderAll();
        } catch { }
      };

      fixOffset();
      window.addEventListener("resize", fixOffset, { passive: true });
      window.addEventListener("scroll", fixOffset, { passive: true });

      // also re-calc after background is set/changed
      c.on("after:render", () => {
        // lightweight: only if needed
        // c.calcOffset();
      });


      // IMPORTANT: make sure Fabric's upper canvas gets the mouse events
      // c.upperCanvasEl.style.pointerEvents = "auto";
      // c.upperCanvasEl.style.zIndex = "10";

      // // optional but usually correct: prevent the lower canvas from stealing clicks
      // c.lowerCanvasEl.style.pointerEvents = "none";
      console.log("upperCanvasEl:", c.upperCanvasEl);
      console.log("lowerCanvasEl:", c.lowerCanvasEl);

      console.log("upper pointer-events:", getComputedStyle(c.upperCanvasEl).pointerEvents);
      console.log("lower pointer-events:", getComputedStyle(c.lowerCanvasEl).pointerEvents);

      console.log("upper zIndex:", getComputedStyle(c.upperCanvasEl).zIndex);
      console.log("lower zIndex:", getComputedStyle(c.lowerCanvasEl).zIndex);


      // recalc offset after DOM paint
      requestAnimationFrame(() => c.calcOffset());


      c.on("mouse:down", (opt) => {
        const p = c.getPointer(opt.e);
        console.log("pointer:", p);
        console.log("findTarget:", c.findTarget(opt.e));
        console.log("fabric mouse:down target =", opt?.target);
        if (opt?.target) {
          console.log("target type:", opt.target.type, "selectable:", opt.target.selectable);
        }
      });

      // c.on("mouse:down", (opt) => {
      //   console.log("fabric target:", opt.target?.type, opt.target);
      // });


      c.selection = true;
      c.skipTargetFind = false;
      c.preserveObjectStacking = true;
      c.perPixelTargetFind = false;
      c.targetFindTolerance = 12;
      c.defaultCursor = "default";
      c.hoverCursor = "move";

      const syncToStore = (obj) => {
        const id = obj?.__designId;
        if (!id) return;

        // Image or Textbox
        const patch = {
          left: obj.left,
          top: obj.top,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          angle: obj.angle || 0,
        };

        if (obj.type === "textbox") {
          patch.text = obj.text;
          patch.fontFamily = obj.fontFamily;
          patch.color = obj.fill;
        }

        updateDesignItem(id, patch);
      };

      // Sync when user changes anything
      c.on("object:modified", (e) => syncToStore(e.target));

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

      // c.on("mouse:down", mouseDownHandler);
      // c.on("mouse:move", mouseMoveHandler);
      // c.on("mouse:up", mouseUpHandler);

      setCanvas(c);
    };

    init();

    return () => {
      didInitRef.current = false;
      if (keyHandler) document.removeEventListener("keydown", keyHandler);
      if (canvasRef.current && canvasRef.current.style) {
        canvasRef.current.style.pointerEvents = "auto";
      }
      if (c) {
        //try { c.upperCanvasEl?.remove(); } catch { }
        // c.off("mouse:down", mouseDownHandler);
        // c.off("mouse:move", mouseMoveHandler);
        // c.off("mouse:up", mouseUpHandler);
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

      // TEMP: make it impossible to miss
      stroke: "#111",
      strokeWidth: 1.5,
      strokeDashArray: [8, 6],
      opacity: 1,
      strokeUniform: true,

      selectable: false,
      evented: false,
    });

    rect._isGuide = true;
    c.add(rect);
    rect.bringToFront();
    c.requestRenderAll();

    console.log("✅ GUIDE ADDED", AREA, "GUIDE COUNT:", c.getObjects().filter(o => o._isGuide).length);
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
      const clampToArea = (obj, area) => {
        if (!obj) return;

        obj.setCoords();
        const b = obj.getBoundingRect(true); // absolute bounding box

        let left = obj.left;
        let top = obj.top;

        // push back inside
        if (b.left < area.left) left += area.left - b.left;
        if (b.top < area.top) top += area.top - b.top;

        const maxLeft = area.left + area.width - b.width;
        const maxTop = area.top + area.height - b.height;

        if (b.left > maxLeft) left -= b.left - maxLeft;
        if (b.top > maxTop) top -= b.top - maxTop;

        obj.set({ left, top });
        obj.setCoords();
      };


      const active = tshirtDesigns[activeDesignIndex];
      if (!active) return;

      const sideObj = active.sides?.front;
      if (!sideObj?.mockup) return;

      const full = isFullPrintActiveSide ? isFullPrintActiveSide() : false;
      const side = "front";
      const printType = sideObj.printType || "box";
      const maskUrl = sideObj.maskUrl || null;

      printTypeRef.current = printType;
      maskReadyRef.current = false; // reset each load

      //const AREA = getPrintArea(full, side);


      // Reset canvas + mask
      canvas.clear();
      maskRef.current = null;

      // Just to be extra safe: re-enable interaction at canvas level
      canvas.isDrawingMode = false;
      canvas.selection = true;
      canvas.skipTargetFind = false;
      if (canvas.upperCanvasEl) canvas.upperCanvasEl.style.pointerEvents = "auto";
      if (canvas.lowerCanvasEl) canvas.lowerCanvasEl.style.pointerEvents = "none";


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
              requestAnimationFrame(() => canvas.calcOffset());
              canvas.calcOffset();
              resolve();
            });
            bgImg = img;
          },
          { crossOrigin: "anonymous" }
        );
      });
      // ✅ Compute print AREA relative to the mockup (works for all 7 colors if mockups share layout)
      const bgLeft = bgImg.left;
      const bgTop = bgImg.top;
      const bgW = bgImg.getScaledWidth();
      const bgH = bgImg.getScaledHeight();

      let AREA = null;

      // ✅ 1) MASK MODE (Graphic T-shirt) → load mask, align to bg, AREA from mask bounds
      if (printType === "mask" && maskUrl) {
        await new Promise((resolve) => {
          fabric.Image.fromURL(
            maskUrl,
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

              // scale mask to match mockup width
              maskImg.scaleToWidth(bgImg.getScaledWidth());

              maskRef.current = maskImg;
              maskReadyRef.current = true;
              canvas.requestRenderAll?.();

              // ✅ AREA derived from mask bounds (future-proof)
              maskImg.setCoords();
              const b = maskImg.getBoundingRect(true, true);
              const AREA_RATIO = 0.62;  // adjust: 0.65 = smaller, 0.8 = bigger
              const areaW = b.width * AREA_RATIO;
              const areaH = b.height * AREA_RATIO;
              AREA = {
                left: b.left + (b.width - areaW) / 2,
                top: b.top + (b.height - areaH) / 2,
                width: areaW,
                height: areaH,
              };

              resolve();
            },
            { crossOrigin: "anonymous" }
          );
        });
      } else {
        // ✅ 2) BOX MODE (your current chest logic)
        AREA = full
          ? getPrintArea(true, side)
          : {
            left: bgLeft + bgW * 0.32,
            top: bgTop + bgH * 0.28,
            width: bgW * 0.36,
            height: bgH * 0.42,
          };
      }

      areaRef.current = AREA;
      canvas.__printArea = AREA;
      canvas.__printType = printType;

      const applyMaskClip = (obj) => {
        if (!obj) return;
        if (printType !== "mask") return;
        if (!maskRef.current) return;

        // ✅ avoid Fabric cache bug by cloning per object
        maskRef.current.clone((cl) => {
          cl.set({
            absolutePositioned: true,
            left: maskRef.current.left,
            top: maskRef.current.top,
            originX: "left",
            originY: "top",
            selectable: false,
            evented: false,
          });

          obj.clipPath = cl;

          // ✅ optional but helps prevent cache issues
          obj.objectCaching = false;

          obj.setCoords();
          canvas.requestRenderAll();
        });
      };

      // ---- 3.2 MASK FOR FRONT FULL-PRINT ----
      if (full && side === "front" && FULL_MASK_URL) {
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
      saved.forEach((d) => {
        if (d && !d.id) {
          d.id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        }
      });

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

                  // ✅ Use the computed print AREA (not undefined "box")
                  const { scale, left, top } = fitIntoBox(W, H, AREA, {
                  paddingRatio: 0,
                  cover: printType === "mask",
                });

                  img.set({ originX: "left", originY: "top" });
                  img.scale(scale);
                  img.set({ left, top });
                }


                // FORCE interactive flags
                img.set({
                  selectable: true,
                  evented: true,
                  hasControls: true,
                  hasBorders: true,
                  lockUniScaling: true,  // keep ratio
                });

                // hide side scaling handles (allow only corners)
                img.setControlsVisibility({
                  mt: false, mb: false, ml: false, mr: false,
                });

                // if (full && side === "front" && maskRef.current) {
                //   img.clipPath = maskRef.current;
                // }

                if (printType === "mask") {
                  applyMaskClip(img);
                }

                img.__designId = d.id;
                img.setCoords();
                canvas.add(img);
                img.bringToFront();
                canvas.setActiveObject(img);
                canvas.requestRenderAll();
                // ✅ keep dotted guide always visible above artwork
                const guide = canvas.getObjects().find((o) => o._isGuide);
                if (guide) guide.bringToFront();
                canvas.requestRenderAll();

                img.on("moving", () => clampToArea(img, AREA));
                img.on("scaling", () => clampToArea(img, AREA));
                img.on("modified", () => clampToArea(img, AREA));

                console.log("ADDED IMG", {
                  type: img.type,
                  selectable: img.selectable,
                  evented: img.evented,
                  left: img.left,
                  top: img.top,
                  w: img.getScaledWidth(),
                  h: img.getScaledHeight()
                });
                console.log("TOTAL OBJECTS:", canvas.getObjects().length);
                console.log("✅ OBJECT LIST:", canvas.getObjects().map(o => ({
                  type: o.type,
                  selectable: o.selectable,
                  evented: o.evented,
                  left: o.left,
                  top: o.top
                })));

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

          // if (full && side === "front" && maskRef.current) {
          //   txt.clipPath = maskRef.current;
          // }

          if (printType === "mask") {
            applyMaskClip(txt);
          }

          txt.__designId = d.id;
          txt.setCoords();
          canvas.add(txt);
          txt.on("moving", () => clampToArea(txt, AREA));
          txt.on("scaling", () => clampToArea(txt, AREA));
          txt.on("modified", () => clampToArea(txt, AREA));

          txt.bringToFront();
          canvas.setActiveObject(txt);
          canvas.requestRenderAll();

        }
      }

      //---- 3.4 CHEST GUIDE ONLY IN BOX MODE ----
      if (!full && printType !== "mask") {
        await drawGuideBox(canvas, side);
      }

      canvas.requestRenderAll();
      const guide = canvas.getObjects().find((o) => o._isGuide);
      if (guide) guide.bringToFront();
      canvas.requestRenderAll();

      console.log("TOTAL OBJECTS:", canvas.getObjects().length);
      console.log("OBJECT LIST:", canvas.getObjects().map(o => ({
        type: o.type,
        selectable: o.selectable,
        evented: o.evented,
        left: o.left,
        top: o.top,
        w: o.getScaledWidth?.(),
        h: o.getScaledHeight?.()
      })));

      console.log("count =", canvas.getObjects().length);
      console.log(
        "objects =",
        canvas.getObjects().map((o) => ({
          type: o.type,
          selectable: o.selectable,
          evented: o.evented,
        }))
      );

      console.log("Objects on canvas:", canvas.getObjects().map(o => ({
        type: o.type,
        selectable: o.selectable,
        evented: o.evented,
        left: o.left,
        top: o.top
      })));

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
        //onMouseDown={() => console.log("✅ canvas mousedown")}
        style={{ border: "1px solid #ccc" }}
      />
    </div>
  );
}
