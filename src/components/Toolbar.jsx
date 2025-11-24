// // src/components/Toolbar.jsx
// import { useRef, useState } from "react";
// import WebFont from "webfontloader";
// import { useDesignerStore } from "../state/useDesignerStore";
// import { fitIntoBox } from "../utils/fit";

// const FONTS = ["Poppins", "Roboto", "Montserrat", "Open Sans", "Raleway"];
// const COLORS = [
//   { name: "white", hex: "#ffffff" },
//   { name: "black", hex: "#000000" },
//   { name: "red",   hex: "#ff0000" },
//   { name: "gray",  hex: "#808080" },
//   { name: "navy",  hex: "#1e3a8a" },
// ];

// // Keep in sync with CanvasArea printable box
// const PRINT = { left: 210, top: 200, width: 180, height: 280 };

// // Upload size limit (px)
// const MAX_W = 2200;
// const MAX_H = 3000;
// const MAX_FILES = 50;

// export default function Toolbar() {
//   const {
//     canvas,
//     activeSide, setActiveSide, setColor,
//     addMultipleSame, addMultipleSeparate,
//     activeDesignIndex, tshirtDesigns,
//     prevDesign, nextDesign,
//   } = useDesignerStore();

//   const fileRef = useRef(null);
//   const [font, setFont] = useState("Poppins");

//   // ---- helpers ------------------------------------------------------
//   const getImageDims = (url) =>
//     new Promise((resolve) => {
//       const img = new Image();
//       img.onload = () => resolve({ w: img.naturalWidth || img.width, h: img.naturalHeight || img.height });
//       img.onerror = () => resolve({ w: 0, h: 0 });
//       img.crossOrigin = "anonymous";
//       img.src = url;
//     });

//   // ---- upload with size filter + auto-fit ---------------------------
//   const onUpload = async (e) => {
//     let files = Array.from(e.target.files || []);      // ← CHANGED: let
//     if (files.length > MAX_FILES) {                    // ← ADD: enforce 50 max
//       alert(`You selected ${files.length} files. Only the first ${MAX_FILES} will be processed.`);
//       files = files.slice(0, MAX_FILES);
//     }

//     if (!files.length) return;

//     const staged = await Promise.all(
//       files.map(async (file) => {
//         const url = URL.createObjectURL(file);
//         const { w, h } = await getImageDims(url);
//         return { file, url, w, h };
//       })
//     );

//     const accepted = staged.filter(({ w, h }) => w > 0 && h > 0 && w <= MAX_W && h <= MAX_H);
//     const rejected = staged.filter(({ w, h }) => !(w > 0 && h > 0 && w <= MAX_W && h <= MAX_H));

//     if (rejected.length) {
//       alert([
//         `❗ Rejected (exceeds ${MAX_W}×${MAX_H}px):`,
//         ...rejected.map(({ file, w, h }) => `• ${file.name} — ${w}×${h}px`),
//       ].join("\n"));
//     }
//     if (!accepted.length) { e.target.value = ""; return; }

//     const items = accepted.map(({ url }) => ({ url, left: 240, top: 300, scale: 0.5 }));

//     let mode = "same";
//     if (accepted.length > 1) {
//       mode = window.confirm("Put ALL artworks on SAME T-shirt?\nCancel = separate shirts.") ? "same" : "different";
//     }

//     const fm = await import("fabric");
//     const fabric = fm.fabric || fm.default || fm;

//     if (mode === "same") {
//       addMultipleSame(items);
//       for (let idx = 0; idx < items.length; idx++) {
//         const d = items[idx];
//         await new Promise((r) => {
//           fabric.Image.fromURL(
//             d.url,
//             (img) => {
//               const W0 = img._element?.naturalWidth || img.width;
//               const H0 = img._element?.naturalHeight || img.height;

//               const { scale, left, top } = fitIntoBox(W0, H0, PRINT, { paddingRatio: 0.06 });
//               const scaleFactor = idx === 0 ? 1.0 : 0.65;

//               img.scale(scale * scaleFactor);
//               img.set({ left: left + idx * 10, top: top + idx * 10, selectable: true });
//               img.fitMode = "auto";
//               img.setCoords();
//               canvas?.add(img);
//               canvas?.renderAll();
//               r(null);
//             },
//             { crossOrigin: "anonymous" }
//           );
//         });
//       }
//     } else {
//       addMultipleSeparate(items);
//     }

//     e.target.value = "";
//   };

//   // ---- Add Text: always create INSIDE printable box -----------------
//   const onAddText = async () => {
//     if (!canvas) return;
//     const fm = await import("fabric");
//     const fabric = fm.fabric || fm.default || fm;

//     const DEFAULT_TEXT = "Add Text";
//     const PAD = 10; // margin inside the printable area

//     // Ensure the textbox fits within PRINT; shrink font if needed, then center
//     const fitTextboxInside = (tb) => {
//       // limit width inside the print area
//       tb.set({ width: PRINT.width - PAD * 2, originX: "left", originY: "top" });
//       tb.initDimensions();

//       // shrink font if natural width still exceeds the allowed width
//       let guard = 0;
//       while (tb.width > (PRINT.width - PAD * 2) && guard < 10) {
//         tb.set({ fontSize: tb.fontSize * 0.9 });
//         tb.initDimensions();
//         guard += 1;
//       }

//       // center within printable rect
//       const left = PRINT.left + PAD + Math.max(0, (PRINT.width - PAD * 2 - tb.width) / 2);
//       const top  = PRINT.top  + PAD + Math.max(0, (PRINT.height - PAD * 2 - tb.height) / 2);
//       tb.set({ left, top });
//       tb.setCoords();
//     };

//     WebFont.load({
//       google: { families: [font] },
//       active: () => {
//         const tb = new fabric.Textbox(DEFAULT_TEXT, {
//           left: PRINT.left + PAD,
//           top:  PRINT.top  + PAD,
//           width: PRINT.width - PAD * 2,
//           textAlign: "center",
//           fontSize: 36,
//           fontFamily: font,
//           fill: "#000",
//           editable: true,
//         });

//         canvas.add(tb);
//         fitTextboxInside(tb);                 // <<< clamp & center inside dotted box
//         canvas.setActiveObject(tb);
//         canvas.requestRenderAll();

//         // focus + select placeholder
//         tb.enterEditing();
//         if (typeof tb.setSelectionStart === "function" && typeof tb.setSelectionEnd === "function") {
//           tb.setSelectionStart(0);
//           tb.setSelectionEnd(tb.text.length);
//         }
//         tb.hiddenTextarea?.focus({ preventScroll: true });
//       },
//     });
//   };

//   const onChangeFont = (e) => {
//     const val = e.target.value;
//     setFont(val);
//     const obj = canvas?.getActiveObject();
//     if (obj && obj.type === "textbox") {
//       WebFont.load({
//         google: { families: [val] },
//         active: () => { obj.set("fontFamily", val); canvas.renderAll(); },
//       });
//     }
//   };

//   const total = tshirtDesigns.length;

//   // ---- UI -----------------------------------------------------------
//   return (
//     // force left alignment to avoid inherited centers from globals
//     <div className="p-4" style={{ textAlign: "left" }}>
//       <h2 className="text-2xl font-bold mb-4">Tools</h2>

//       {/* Side toggle */}
//       <div className="mb-3">
//         <button onClick={() => setActiveSide("front")}>Front</button>
//         <button onClick={() => setActiveSide("back")} className="ml-2">Back</button>
//         <div className="text-xs mt-1">Current: {activeSide}</div>
//       </div>

//       {/* Navigation */}
//       <div className="mb-3">
//         <div className="text-sm mb-1">T-shirt: {activeDesignIndex + 1} / {total}</div>
//         <button onClick={prevDesign} disabled={activeDesignIndex === 0}>◀ Prev</button>
//         <button onClick={nextDesign} className="ml-2" disabled={activeDesignIndex >= total - 1}>Next ▶</button>
//       </div>

//       {/* Upload */}
//       <div className="mb-4">
//         <div className="text-sm mb-1">Artwork</div>
//         <input type="file" ref={fileRef} multiple accept="image/*" onChange={onUpload} />
//         <div className="text-[11px] text-gray-500 mt-1">
//           Max image size: <strong>{MAX_W}×{MAX_H}px</strong> • Max files: <strong>{MAX_FILES}</strong>
//         </div>
//       </div>

//       {/* Color */}
//       <div className="mb-3">
//         <div className="text-sm mb-1">T-shirt Color</div>
//         <div className="flex gap-3 justify-start">
//           {COLORS.map((c) => (
//             <button
//               key={c.name}
//               onClick={() => setColor(c.name)}
//               title={c.name}
//               className="rounded-full border shrink-0 w-10 h-10"
//               style={{ width:20, height:20, backgroundColor: c.hex, borderColor: c.hex === "#ffffff" ? "#ccc" : c.hex }}
//              />
//           ))}
//         </div>
//       </div>

//       {/* Text */}
//       <div className="mb-4">
//         <div className="text-sm mb-1">Font</div>
//         <select value={font} onChange={onChangeFont} className="w-full mb-2">
//           {FONTS.map((f) => <option key={f}>{f}</option>)}
//         </select>
//         <button onClick={onAddText}>Add Text</button>
//       </div>
//     </div>
//   );
// }


// import { useRef, useState } from "react";
// import WebFont from "webfontloader";
// import { useDesignerStore } from "../state/useDesignerStore";
// import { fitIntoBox } from "../utils/fit";
// import PRINT from "../config/printBox";

// const FONTS = ["Poppins", "Roboto", "Montserrat", "Open Sans", "Raleway"];
// const COLORS = [
//   { name: "white", hex: "#ffffff" },
//   { name: "black", hex: "#000000" },
//   { name: "red",   hex: "#ff0000" },
//   { name: "gray",  hex: "#808080" },
//   { name: "navy",  hex: "#1e3a8a" },
// ];

// const MAX_W = 2200;
// const MAX_H = 3000;
// const MAX_BATCH = 50;

// export default function Toolbar() {
//   const {
//     canvas,
//     activeSide, setActiveSide, setColor,
//     addMultipleSame, addMultipleSeparate,
//     activeDesignIndex, tshirtDesigns,
//     prevDesign, nextDesign,
//   } = useDesignerStore();

//   const fileRef = useRef(null);
//   const [font, setFont] = useState("Poppins");

//   const getDims = (url) =>
//     new Promise((resolve) => {
//       const img = new Image();
//       img.onload = () => resolve({ w: img.naturalWidth || img.width, h: img.naturalHeight || img.height });
//       img.onerror = () => resolve({ w: 0, h: 0 });
//       img.crossOrigin = "anonymous";
//       img.src = url;
//     });

//   // --------- UPLOAD: auto-fit every image into PRINT ----------
//   const onUpload = async (e) => {
//     let files = Array.from(e.target.files || []);
//     if (!files.length) return;

//     if (files.length > MAX_BATCH) {
//       alert(`You selected ${files.length} files. Only the first ${MAX_BATCH} will be processed.`);
//       files = files.slice(0, MAX_BATCH);
//     }

//     const staged = await Promise.all(files.map(async (file) => {
//       const url = URL.createObjectURL(file);
//       const { w, h } = await getDims(url);
//       return { file, url, w, h };
//     }));

//     const accepted = staged.filter(({ w, h }) => w > 0 && h > 0 && w <= MAX_W && h <= MAX_H);
//     const rejected = staged.filter(({ w, h }) => !(w > 0 && h > 0 && w <= MAX_W && h <= MAX_H));

//     if (rejected.length) {
//       alert([
//         `❗ Rejected (exceeds ${MAX_W}×${MAX_H}px):`,
//         ...rejected.map(({ file, w, h }) => `• ${file.name} — ${w}×${h}px`),
//       ].join("\n"));
//     }
//     if (!accepted.length) { e.target.value = ""; return; }

//     // Store entries (positions are computed by canvas)
//     const items = accepted.map(({ url }) => ({ url }));

//     let mode = "same";
//     if (accepted.length > 1) {
//       mode = window.confirm("Put ALL artworks on SAME T-shirt?\nCancel = SEPARATE shirts.") ? "same" : "different";
//     }

//     const fm = await import("fabric");
//     const fabric = fm.fabric || fm.default || fm;

//     if (mode === "same") {
//       addMultipleSame(items);

//       for (let idx = 0; idx < items.length; idx++) {
//         const d = items[idx];
//         await new Promise((resolve) => {
//           fabric.Image.fromURL(
//             d.url,
//             (img) => {
//               const W = img._element?.naturalWidth || img.width;
//               const H = img._element?.naturalHeight || img.height;

//               const { scale, left, top } = fitIntoBox(W, H, PRINT, { paddingRatio: 0.06 });

//               img.set({ originX: "left", originY: "top" });
//               img.scale(scale);
//               // slight stagger so multiple images aren’t exactly on top
//               img.set({ left: left + idx * 10, top: top + idx * 10, selectable: true });

//               // guard: make sure it cannot exceed the box after scaling
//               const w = img.getScaledWidth();
//               const h = img.getScaledHeight();
//               const R = PRINT.left + PRINT.width;
//               const B = PRINT.top  + PRINT.height;
//               if (img.left < PRINT.left) img.left = PRINT.left;
//               if (img.top  < PRINT.top)  img.top  = PRINT.top;
//               if (img.left + w > R) img.left = R - w;
//               if (img.top  + h > B) img.top  = B - h;

//               img.setCoords();
//               canvas?.add(img);
//               canvas?.requestRenderAll();
//               resolve(null);
//             },
//             { crossOrigin: "anonymous" }
//           );
//         });
//       }
//     } else {
//       // Create separate shirts; CanvasArea will auto-fit on load (no saved position)
//       addMultipleSeparate(items.map((i) => ({ ...i })));
//     }

//     e.target.value = "";
//   };

//   // --------- TEXT (centered & clamped into PRINT) ----------
//   const onAddText = async () => {
//     if (!canvas) return;
//     const fm = await import("fabric");
//     const fabric = fm.fabric || fm.default || fm;

//     WebFont.load({
//       google: { families: [font] },
//       active: () => {
//         const t = new fabric.Textbox("Add Text", {
//           left: PRINT.left + PRINT.width / 2 - 80,
//           top:  PRINT.top  + PRINT.height / 2 - 18,
//           fontSize: 36,
//           fontFamily: font,
//           fill: "#000",
//           editable: true,
//           originX: "left",
//           originY: "top",
//         });

//         const w = t.getScaledWidth();
//         const h = t.getScaledHeight();
//         const R = PRINT.left + PRINT.width;
//         const B = PRINT.top  + PRINT.height;
//         if (t.left < PRINT.left) t.left = PRINT.left;
//         if (t.top  < PRINT.top)  t.top  = PRINT.top;
//         if (t.left + w > R) t.left = R - w;
//         if (t.top  + h > B) t.top  = B - h;

//         t.setCoords();
//         canvas.add(t);
//         canvas.setActiveObject(t);
//         canvas.requestRenderAll();
//       },
//     });
//   };

//   const onChangeFont = (e) => {
//     const val = e.target.value;
//     setFont(val);
//     const obj = canvas?.getActiveObject();
//     if (obj && obj.type === "textbox") {
//       WebFont.load({
//         google: { families: [val] },
//         active: () => { obj.set("fontFamily", val); canvas.renderAll(); },
//       });
//     }
//   };

//   const total = tshirtDesigns.length;

//   return (
//     <div className="p-4 w-64 border-r border-gray-300 text-left">
//       <h2 className="text-2xl font-bold mb-4">Tools</h2>

//       <div className="mb-3">
//         <button onClick={() => setActiveSide("front")}>Front</button>
//         <button onClick={() => setActiveSide("back")} className="ml-2">Back</button>
//         <div className="text-xs mt-1">Current: {activeSide}</div>
//       </div>

//       <div className="mb-3">
//         <div className="text-sm mb-1">T-shirt: {activeDesignIndex + 1} / {total}</div>
//         <button onClick={prevDesign} disabled={activeDesignIndex === 0}>◀ Prev</button>
//         <button onClick={nextDesign} className="ml-2" disabled={activeDesignIndex >= total - 1}>Next ▶</button>
//       </div>

//       <div className="mb-4">
//         <div className="text-sm mb-1">Artwork</div>
//         <input type="file" ref={fileRef} multiple accept="image/*" onChange={onUpload} />
//         <div className="text-[11px] text-gray-500 mt-1">
//           Max image size: <strong>{MAX_W}×{MAX_H}px</strong> • Max per upload: <strong>{MAX_BATCH}</strong>
//         </div>
//       </div>

//       <div className="mb-3">
//         <div className="text-sm mb-1">T-shirt Color</div>
//         <div className="flex gap-2">
//           {COLORS.map((c) => (
//             <button
//               key={c.name}
//               onClick={() => setColor(c.name)}
//               title={c.name}
//               className="rounded-full border shrink-0 w-10 h-10"
//               style={{ width:20, height:20, backgroundColor: c.hex, borderColor: c.hex === "#ffffff" ? "#ccc" : c.hex }}
//             />
//           ))}
//         </div>
//       </div>

//       <div className="mb-4">
//         <div className="text-sm mb-1">Font</div>
//         <select value={font} onChange={onChangeFont} className="w-full mb-2">
//           {FONTS.map((f) => <option key={f}>{f}</option>)}
//         </select>
//         <button onClick={onAddText}>Add Text</button>
//       </div>
//     </div>
//   );
// }

import { useRef, useState } from "react";
import WebFont from "webfontloader";
import { useDesignerStore } from "../state/useDesignerStore";
import { fitIntoBox } from "../utils/fit";
import PRINT from "../config/printBox"; // old chest print (still needed)
import { getPrintArea } from "../config/printBox"; // new helper

const FONTS = ["Poppins", "Roboto", "Montserrat", "Open Sans", "Raleway"];
const COLORS = [
  { name: "white", hex: "#ffffff" },
  { name: "black", hex: "#000000" },
  { name: "red", hex: "#ff0000" },
  { name: "gray", hex: "#808080" },
  { name: "navy", hex: "#1e3a8a" },
];

const MAX_W = 2200;
const MAX_H = 3000;
const MAX_BATCH = 50;

export default function Toolbar() {
  const {
    canvas,
    activeSide, setActiveSide,
    activeDesignIndex, tshirtDesigns,
    prevDesign, nextDesign,
    addMultipleSame, addMultipleSeparate,
    setColor,

    // NEW STORE FUNCTIONS
    toggleFullPrintForActiveSide,
    isFullPrintActiveSide
  } = useDesignerStore();

  const fileRef = useRef(null);
  const [font, setFont] = useState("Poppins");

  const getDims = (url) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () =>
        resolve({
          w: img.naturalWidth || img.width,
          h: img.naturalHeight || img.height,
        });
      img.onerror = () => resolve({ w: 0, h: 0 });
      img.crossOrigin = "anonymous";
      img.src = url;
    });

  // ========= UPLOAD IMAGES =========
  const onUpload = async (e) => {
    let files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (files.length > MAX_BATCH) {
      alert(`Only first ${MAX_BATCH} files will be processed.`);
      files = files.slice(0, MAX_BATCH);
    }

    const staged = await Promise.all(
      files.map(async (file) => {
        const url = URL.createObjectURL(file);
        const { w, h } = await getDims(url);
        return { file, url, w, h };
      })
    );

    const accepted = staged.filter(
      ({ w, h }) => w > 0 && h > 0 && w <= MAX_W && h <= MAX_H
    );

    if (!accepted.length) {
      e.target.value = "";
      return;
    }

    const items = accepted.map(({ url }) => ({ url }));

    let mode = "same";
    if (accepted.length > 1) {
      mode = window.confirm(
        "Put ALL artworks on SAME T-shirt?\nCancel = SEPARATE shirts."
      )
        ? "same"
        : "different";
    }

    const fm = await import("fabric");
    const fabric = fm.fabric || fm.default || fm;

    // SELECT BOUNDING BOX BASED ON FULL PRINT MODE
    const isFull = isFullPrintActiveSide();
    const box = getPrintArea(isFull, activeSide);

    if (mode === "same") {
      addMultipleSame(items);

      for (let idx = 0; idx < items.length; idx++) {
        const d = items[idx];
        await new Promise((resolve) => {
          fabric.Image.fromURL(
            d.url,
            (img) => {
              const W = img._element?.naturalWidth || img.width;
              const H = img._element?.naturalHeight || img.height;

              const { scale, left, top } = fitIntoBox(W, H, box, {
                paddingRatio: 0.06,
              });

              img.set({ originX: "left", originY: "top" });
              img.scale(scale);
              img.set({
                left: left + idx * 10,
                top: top + idx * 10,
                selectable: true,
              });

              img.setCoords();
              canvas?.add(img);
              canvas?.requestRenderAll();
              resolve(null);
            },
            { crossOrigin: "anonymous" }
          );
        });
      }
    } else {
      addMultipleSeparate(items.map((i) => ({ ...i })));
    }

    e.target.value = "";
  };

  // ========= ADD TEXT =========
  const onAddText = async () => {
    if (!canvas) return;

    const fm = await import("fabric");
    const fabric = fm.fabric || fm.default || fm;

    WebFont.load({
      google: { families: [font] },
      active: () => {
        const isFull = isFullPrintActiveSide();
        const box = getPrintArea(isFull, activeSide);

        const t = new fabric.Textbox("Add Text", {
          left: box.left + box.width / 2 - 80,
          top: box.top + box.height / 2 - 18,
          fontSize: 36,
          fontFamily: font,
          fill: "#000",
          originX: "left",
          originY: "top",
        });

        t.setCoords();
        canvas.add(t);
        canvas.setActiveObject(t);
        canvas.requestRenderAll();
      },
    });
  };

  // ========= FONT CHANGE =========
  const onChangeFont = (e) => {
    const val = e.target.value;
    setFont(val);
    const obj = canvas?.getActiveObject();
    if (obj && obj.type === "textbox") {
      WebFont.load({
        google: { families: [val] },
        active: () => {
          obj.set("fontFamily", val);
          canvas.renderAll();
        },
      });
    }
  };

  const total = tshirtDesigns.length;
  const fullMode = isFullPrintActiveSide();

  return (
    <div className="p-4 w-64 border-r border-gray-300 text-left">
      <h2 className="text-2xl font-bold mb-4">Tools</h2>

      {/* ===== FULL SHIRT MODE TOGGLE ===== */}
      <div className="mb-4">
        <button
          onClick={toggleFullPrintForActiveSide}
          className="px-3 py-2 rounded border"
          style={{
            background: fullMode ? "#333" : "#eee",
            color: fullMode ? "white" : "black",
          }}
        >
          {fullMode ? "Full Shirt Mode: ON" : "Full Shirt Mode: OFF"}
        </button>
        <div className="text-xs mt-1">
          Covers entire front/back (no sleeves)
        </div>
      </div>

      {/* ===== FRONT / BACK ===== */}
      <div className="mb-3">
        <button onClick={() => setActiveSide("front")}>Front</button>
        <button onClick={() => setActiveSide("back")} className="ml-2">
          Back
        </button>
        <div className="text-xs mt-1">Current: {activeSide}</div>
      </div>

      {/* ===== T-SHIRT SELECTION ===== */}
      <div className="mb-3">
        <div className="text-sm mb-1">
          T-shirt: {activeDesignIndex + 1} / {total}
        </div>
        <button onClick={prevDesign} disabled={activeDesignIndex === 0}>
          ◀ Prev
        </button>
        <button
          onClick={nextDesign}
          className="ml-2"
          disabled={activeDesignIndex >= total - 1}
        >
          Next ▶
        </button>
      </div>

      {/* ===== UPLOAD ===== */}
      <div className="mb-4">
        <div className="text-sm mb-1">Artwork</div>
        <input
          type="file"
          ref={fileRef}
          multiple
          accept="image/*"
          onChange={onUpload}
        />
      </div>

      {/* ===== COLOR ===== */}
      <div className="mb-3">
        <div className="text-sm mb-1">T-shirt Color</div>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c.name}
              onClick={() => setColor(c.name)}
              className="rounded-full border shrink-0"
              style={{
                width: 20,
                height: 20,
                backgroundColor: c.hex,
                borderColor: c.hex === "#ffffff" ? "#ccc" : c.hex,
              }}
            />
          ))}
        </div>
      </div>

      {/* ===== TEXT ===== */}
      <div className="mb-4">
        <div className="text-sm mb-1">Font</div>
        <select
          value={font}
          onChange={onChangeFont}
          className="w-full mb-2"
        >
          {FONTS.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
        <button onClick={onAddText}>Add Text</button>
      </div>
    </div>
  );
}
