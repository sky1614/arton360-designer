import { useState } from "react";
import { useDesignerStore } from "../state/useDesignerStore";

const PRINT = { left: 210, top: 200, width: 180, height: 280 };
const { site: WP_SITE, nonce: WP_NONCE } =
  (typeof window !== "undefined" && window.ARTON360) ? window.ARTON360 : {};

export default function DetailsPane() {
  const {
    canvas, tshirtDesigns,
    productMeta, setProductMeta,
    addTag, removeTag, isMetaValid,
  } = useDesignerStore();

  const [tagInput, setTagInput] = useState("");

  function exportPNG(c) {
    try {
      const all = c.getObjects();
      const guides = all.filter((o) => o._isGuide);
      guides.forEach((g) => g.set({ opacity: 0 }));
      c.discardActiveObject(); c.renderAll();
      const png = c.toDataURL({ format: "png", multiplier: 2, enableRetinaScaling: true });
      guides.forEach((g) => g.set({ opacity: 1 })); c.renderAll();
      return png;
    } catch {
      alert("Could not create preview image."); return null;
    }
  }

  const onSave = async () => {
    if (!canvas) return;
    if (!isMetaValid()) { alert("Please add Title and Category."); return; }
    const previewPng = exportPNG(canvas); if (!previewPng) return;

    const res = await fetch(`${WP_SITE}/wp-json/arton360/v1/save-design`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-WP-Nonce": WP_NONCE },
      body: JSON.stringify({
        designName: productMeta.title,
        tshirtDesigns, previewPng, printBox: PRINT, price: 499, productMeta,
      }),
    });
    const json = await res.json();
    if (!res.ok) return alert(json?.error || `Save failed (${res.status})`);
    alert(json.status === "publish" ? "✅ Published!" : "✅ Saved for review.");
  };

  const commitTag = () => {
    const raw = tagInput.trim(); if (!raw) return;
    raw.split(",").forEach((t) => addTag(t)); setTagInput("");
  };

  return (
    <div className="p-6">
      {/* left align title */}
      <h2 className="text-2xl font-bold mb-4 text-left">Listing Details</h2>

      {/* constrain all controls to a tidy column */}
      <div className="max-w-[440px]">
        <label className="text-sm">Title *</label>
        <input
          className="w-full border px-2 py-1 mb-3"
          value={productMeta.title}
          onChange={(e) => setProductMeta({ title: e.target.value })}
          placeholder="Retro Cat Tee"
          maxLength={70}
        />

        <label className="text-sm">Category *</label>
        <select
          className="w-full border px-2 py-1 mb-3"
          value={productMeta.categorySlug}
          onChange={(e) => setProductMeta({ categorySlug: e.target.value })}
        >
          <option value="tshirts">T-Shirts</option>
          <option value="hoodies">Hoodies</option>
          <option value="kids">Kids</option>
        </select>

        <label className="text-sm">Art Type</label>
        <select
          className="w-full border px-2 py-1 mb-3"
          value={productMeta.artType || ""}
          onChange={(e) => setProductMeta({ artType: e.target.value })}
        >
          <option value="">(Select)</option>
          <option value="illustration">Illustration</option>
          <option value="vector">Vector</option>
          <option value="typography">Typography</option>
          <option value="photography">Photography</option>
          <option value="calligraphy">Calligraphy</option>
        </select>

        <label className="text-sm">Tags (press Enter)</label>
        <input
          className="w-full border px-2 py-1 mb-1"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitTag(); } }}
          placeholder="cat, minimal, retro"
        />
        <div className="flex flex-wrap gap-1 mb-3">
          {(productMeta.tags || []).map((t) => (
            <span key={t} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
              {t} <button className="ml-1" onClick={() => removeTag(t)}>×</button>
            </span>
          ))}
        </div>

        <label className="text-sm">Description</label>
        <textarea
          className="w-full border px-2 py-1 mb-4"
          rows={5}
          maxLength={800}
          value={productMeta.description || ""}
          onChange={(e) => setProductMeta({ description: e.target.value })}
          placeholder="Tell buyers about your artwork…"
        />

        <button onClick={onSave} className="bg-blue-600 text-white w-full py-2 rounded">
          💾 Save / Publish
        </button>

        {!isMetaValid() && (
          <div className="text-xs text-red-600 mt-2">Title and Category are required.</div>
        )}
      </div>
    </div>
  );
}
