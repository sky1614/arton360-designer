import { useRef, useState } from "react";
import WebFont from "webfontloader";
import { useDesignerStore } from "../state/useDesignerStore";
import { fitIntoBox } from "../utils/fit";
import PRINT from "../config/printBox"; // old chest print (still needed)
import { getPrintArea } from "../config/printBox"; // new helper
import { uploadFilesToCanvas } from "../utils/uploadToCanvas";

const FONTS = ["Poppins", "Roboto", "Montserrat", "Open Sans", "Raleway"];


const MAX_W = 2200;
const MAX_H = 3000;
const MAX_BATCH = 50;

export default function Toolbar() {
  const {
    canvas,
    activeSide,
    setActiveSide,
    activeDesignIndex,
    tshirtDesigns,
    prevDesign,
    nextDesign,
    addMultipleSame,
    addMultipleSeparate,
    setColor,

    // NEW STORE FUNCTIONS
    toggleFullPrintForActiveSide,
    isFullPrintActiveSide,
    regularColors,
    setProductTypeForActive,
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

  // ========= BACK BUTTON HANDLER =========
  const handleBackClick = () => {
    alert("Back side editing is under development and will be available soon.");
    // keep side on front
    setActiveSide("front");
  };

  // ========= UPLOAD IMAGES =========
  const onUpload = async (e) => {
    const files = e.target.files;
    await uploadFilesToCanvas({
      // files,
      canvas,
      addMultipleSame,
      addMultipleSeparate,
    });
    e.target.value = "";
  };





  // ========= ADD TEXT =========
  const onAddText = async () => {
    if (!canvas) return;

    // ✅ Use real computed AREA from CanvasArea (consistent with onUpload)
    const box = canvas?.__printArea;
    if (!box) {
      alert("Canvas print area not ready yet. Please wait a moment.");
      return;
    }

    const fm = await import("fabric");
    const fabric = fm.fabric || fm.default || fm;

    WebFont.load({
      google: { families: [font] },
      active: () => {
        // Create new textbox centered in the print area
        const t = new fabric.Textbox("Add Text", {
          left: box.left + box.width / 2 - 80,
          top: box.top + box.height / 2 - 18,
          fontSize: 36,
          fontFamily: font,
          fill: "#000",
          originX: "left",
          originY: "top",
          selectable: true,
          evented: true,
          hasControls: true,
          hasBorders: true,
          lockMovementX: false,
          lockMovementY: false,
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
  const activeProductType =
    tshirtDesigns?.[activeDesignIndex]?.productType || "tshirts";


  return (
    <div className="p-4 w-64 border-r border-gray-300 text-left">
      <h2 className="text-2xl font-bold mb-4">Tools</h2>

      {/* ===== FULL SHIRT MODE TOGGLE ===== */}
      <div className="mb-4" style={{ display: "none" }}>
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
        <div className="text-xs mt-1">Full front print only.</div>
      </div>

      {/* ===== FRONT / BACK ===== */}
      <div className="mb-3" style={{ display: "none" }}>
        <div className="text-sm mb-1">Side</div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setActiveSide("front")}
            className="px-2 py-1 border rounded text-sm"
          >
            Front
          </button>
          <button
            onClick={handleBackClick}
            className="px-2 py-1 border rounded text-sm opacity-60 cursor-not-allowed"
          >
            Back (coming soon)
          </button>
        </div>
        <div className="text-xs mt-1 text-gray-500">
          Back editing coming soon.
        </div>
      </div>

      {/* ===== PRODUCT TYPE ===== */}
      <div className="mb-3">
        <div className="text-sm mb-1">Product</div>
        <select
          className="w-full border px-2 py-1"
          value={activeProductType}
          onChange={(e) => setProductTypeForActive(e.target.value)}
        >
          <option value="tshirts">T-shirt</option>
          <option value="graphic-tshirt">Graphic T-shirt</option>
        </select>
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
          {(regularColors || []).map((c) => (
            <button
              key={c.key}
              title={c.label}
              onClick={() => setColor(c.key)}
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
