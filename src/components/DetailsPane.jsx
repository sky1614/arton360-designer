// import { useState } from "react";
// import { useDesignerStore } from "../state/useDesignerStore";

// const PRINT = { left: 210, top: 200, width: 180, height: 280 };

// function getWpConfig() {
//   if (typeof window === "undefined") return {};
//   return window.ARTON360 || {};
// }

// export default function DetailsPane() {
//   const {
//     canvas,
//     tshirtDesigns,
//     productMeta,
//     setProductMeta,
//     addTag,
//     removeTag,
//     isMetaValid,
//   } = useDesignerStore();

//   const [tagInput, setTagInput] = useState("");

//   function exportPNG(c) {
//     try {
//       const all = c.getObjects();
//       const guides = all.filter((o) => o._isGuide);

//       guides.forEach((g) => g.set({ opacity: 0 }));
//       c.discardActiveObject();
//       c.renderAll();

//       const png = c.toDataURL({
//         format: "png",
//         multiplier: 2,
//         enableRetinaScaling: true,
//       });

//       guides.forEach((g) => g.set({ opacity: 1 }));
//       c.renderAll();

//       return png;
//     } catch (e) {
//       console.error(e);
//       alert("Could not create preview image.");
//       return null;
//     }
//   }

//   const onSave = async () => {
//     if (!canvas) return;

//     if (!isMetaValid()) {
//       alert("Please add Title and Category.");
//       return;
//     }

//     const previewPng = exportPNG(canvas);
//     if (!previewPng) return;

//     // 🔹 Read latest config at click time
//     const { site: WP_SITE, nonce: WP_NONCE } = getWpConfig();

//     if (!WP_SITE || !WP_NONCE) {
//       alert(
//         "Connection to WordPress is not ready yet. Please refresh the page and try again."
//       );
//       console.warn("[ARTON360] Missing WP config:", getWpConfig());
//       return;
//     }

//     try {
//       const res = await fetch(
//         `${WP_SITE}/wp-json/arton360/v1/save-design`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "X-WP-Nonce": WP_NONCE,
//           },
//           credentials: "include", 
//           body: JSON.stringify({
//             designName: productMeta.title,
//             tshirtDesigns,
//             previewPng,
//             printBox: PRINT,
//             productMeta, // includes price, tags, artType, etc.
//           }),
//         }
//       );

//       const json = await res.json().catch(() => ({}));

//       if (!res.ok) {
//         console.error("[ARTON360] Save failed", res.status, json);
//         alert(json?.message || `Save failed (${res.status})`);
//         return;
//       }

//       alert(
//         json.status === "publish"
//           ? "✅ Published!"
//           : "✅ Saved for review."
//       );
//     } catch (err) {
//       console.error("[ARTON360] Network error", err);
//       alert("Network error while saving. Please try again.");
//     }
//   };

//   const commitTag = () => {
//     const raw = tagInput.trim();
//     if (!raw) return;
//     raw.split(",").forEach((t) => addTag(t));
//     setTagInput("");
//   };

//   return (
//     <div className="p-6">
//       {/* left align title */}
//       <h2 className="text-2xl font-bold mb-4 text-left">Listing Details</h2>

//       {/* constrain all controls to a tidy column */}
//       <div className="max-w-[440px]">
//         <label className="text-sm">Title *</label>
//         <input
//           className="w-full border px-2 py-1 mb-3"
//           value={productMeta.title}
//           onChange={(e) => setProductMeta({ title: e.target.value })}
//           placeholder="Retro Cat Tee"
//           maxLength={70}
//         />

//         <label className="text-sm">Category *</label>
//         <select
//           className="w-full border px-2 py-1 mb-3"
//           value={productMeta.categorySlug}
//           onChange={(e) => setProductMeta({ categorySlug: e.target.value })}
//         >
//           <option value="tshirts">T-Shirts</option>
//           <option value="hoodies">Hoodies</option>
//           <option value="kids">Kids</option>
//         </select>

//         <label className="text-sm">Art Type</label>
//         <select
//           className="w-full border px-2 py-1 mb-3"
//           value={productMeta.artType || ""}
//           onChange={(e) => setProductMeta({ artType: e.target.value })}
//         >
//           <option value="">(Select)</option>
//           <option value="illustration">Illustration</option>
//           <option value="vector">Vector</option>
//           <option value="typography">Typography</option>
//           <option value="photography">Photography</option>
//           <option value="calligraphy">Calligraphy</option>
//         </select>

//         <label className="text-sm">Tags (press Enter)</label>
//         <input
//           className="w-full border px-2 py-1 mb-1"
//           value={tagInput}
//           onChange={(e) => setTagInput(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === "Enter") {
//               e.preventDefault();
//               commitTag();
//             }
//           }}
//           placeholder="cat, minimal, retro"
//         />
//         <div className="flex flex-wrap gap-1 mb-3">
//           {(productMeta.tags || []).map((t) => (
//             <span
//               key={t}
//               className="text-xs bg-gray-100 px-2 py-0.5 rounded"
//             >
//               {t}{" "}
//               <button className="ml-1" onClick={() => removeTag(t)}>
//                 ×
//               </button>
//             </span>
//           ))}
//         </div>

//         <label className="text-sm">Description</label>
//         <textarea
//           className="w-full border px-2 py-1 mb-4"
//           rows={5}
//           maxLength={800}
//           value={productMeta.description || ""}
//           onChange={(e) =>
//             setProductMeta({ description: e.target.value })
//           }
//           placeholder="Tell buyers about your artwork…"
//         />

//         <button
//           onClick={onSave}
//           className="bg-blue-600 text-white w-full py-2 rounded"
//         >
//           💾 Save / Publish
//         </button>

//         {!isMetaValid() && (
//           <div className="text-xs text-red-600 mt-2">
//             Title and Category are required.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// import { useState } from "react";
// import { useDesignerStore } from "../state/useDesignerStore";

// const PRINT = { left: 210, top: 200, width: 180, height: 280 };

// function getWpConfig() {
//   if (typeof window === "undefined") return {};
//   return window.ARTON360 || {};
// }

// export default function DetailsPane() {
//   const {
//     canvas,
//     tshirtDesigns,
//     productMeta,
//     setProductMeta,
//     addTag,
//     removeTag,
//     isMetaValid,
//   } = useDesignerStore();

//   const [tagInput, setTagInput] = useState("");

//   function exportPNG(c) {
//     try {
//       const all = c.getObjects();
//       const guides = all.filter((o) => o._isGuide);

//       // hide guides
//       guides.forEach((g) => g.set({ opacity: 0 }));
//       c.discardActiveObject();
//       c.renderAll();

//       const png = c.toDataURL({
//         format: "png",
//         multiplier: 2,
//         enableRetinaScaling: true,
//       });

//       // restore guides
//       guides.forEach((g) => g.set({ opacity: 1 }));
//       c.renderAll();

//       return png;
//     } catch (e) {
//       console.error(e);
//       alert("Could not create preview image.");
//       return null;
//     }
//   }

//   const onSave = async () => {
//     if (!canvas) return;

//     if (!isMetaValid()) {
//       alert("Please add Title and Category.");
//       return;
//     }

//     const previewPng = exportPNG(canvas);
//     if (!previewPng) return;

//     // 🔹 Read latest config at click time
//     const { site: WP_SITE, nonce: WP_NONCE } = getWpConfig();

//     if (!WP_SITE || !WP_NONCE) {
//       alert(
//         "Connection to WordPress is not ready yet. Please refresh the page and try again."
//       );
//       console.warn("[ARTON360] Missing WP config:", getWpConfig());
//       return;
//     }

//     try {
//       const res = await fetch(
//         `${WP_SITE}/wp-json/arton360/v1/save-design`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "X-WP-Nonce": WP_NONCE,
//           },
//           credentials: "include",
//           body: JSON.stringify({
//             designName: productMeta.title,
//             tshirtDesigns,
//             previewPng,
//             printBox: PRINT,
//             // 🔹 Send ALL listing details (title, category, price, tags, mature, currency, etc.)
//             productMeta,
//           }),
//         }
//       );

//       const json = await res.json().catch(() => ({}));

//       if (!res.ok) {
//         console.error("[ARTON360] Save failed", res.status, json);
//         alert(json?.message || `Save failed (${res.status})`);
//         return;
//       }

//       alert(
//         json.status === "publish"
//           ? "✅ Published on the store!"
//           : "✅ Saved (status: " + json.status + ")"
//       );
//     } catch (err) {
//       console.error("[ARTON360] Network error", err);
//       alert("Network error while saving. Please try again.");
//     }
//   };

//   const commitTag = () => {
//     const raw = tagInput.trim();
//     if (!raw) return;
//     raw.split(",").forEach((t) => addTag(t));
//     setTagInput("");
//   };

//   // ---- Price + Currency helpers ----
//   const currency = productMeta.currency || "INR"; // default INR
//   const priceValue =
//     typeof productMeta.price === "number" || typeof productMeta.price === "string"
//       ? productMeta.price
//       : "";
//   const currencySymbol = currency === "USD" ? "$" : "₹";

//   const isMature = !!productMeta.vendorMatureFlag;

//   return (
//     <div className="p-6">
//       {/* left align title */}
//       <h2 className="text-2xl font-bold mb-4 text-left">Listing Details</h2>

//       {/* constrain all controls to a tidy column */}
//       <div className="max-w-[440px]">
//         {/* Title */}
//         <label className="text-sm">Title *</label>
//         <input
//           className="w-full border px-2 py-1 mb-3"
//           value={productMeta.title}
//           onChange={(e) => setProductMeta({ title: e.target.value })}
//           placeholder="Retro Cat Tee"
//           maxLength={70}
//         />

//         {/* Category */}
//         <label className="text-sm">Category *</label>
//         <select
//           className="w-full border px-2 py-1 mb-3"
//           value={productMeta.categorySlug}
//           onChange={(e) => setProductMeta({ categorySlug: e.target.value })}
//         >
//           <option value="tshirts">T-Shirts</option>
//           <option value="hoodies">Hoodies</option>
//           <option value="kids">Kids</option>
//         </select>

//         {/* Art Type */}
//         <label className="text-sm">Art Type</label>
//         <select
//           className="w-full border px-2 py-1 mb-3"
//           value={productMeta.artType || ""}
//           onChange={(e) => setProductMeta({ artType: e.target.value })}
//         >
//           <option value="">(Select)</option>
//           <option value="illustration">Illustration</option>
//           <option value="vector">Vector</option>
//           <option value="typography">Typography</option>
//           <option value="photography">Photography</option>
//           <option value="calligraphy">Calligraphy</option>
//         </select>

//         {/* Currency + Price row */}
//         <div className="flex gap-2 mb-3">
//           <div className="w-2/5">
//             <label className="text-sm">Currency</label>
//             <select
//               className="w-full border px-2 py-1"
//               value={currency}
//               onChange={(e) => setProductMeta({ currency: e.target.value })}
//             >
//               <option value="INR">₹ INR</option>
//               <option value="USD">$ USD</option>
//             </select>
//           </div>

//           <div className="w-3/5">
//             <label className="text-sm">
//               Price ({currencySymbol})
//             </label>
//             <input
//               type="number"
//               min="0"
//               step="1"
//               className="w-full border px-2 py-1"
//               value={priceValue}
//               onChange={(e) => {
//                 const val = e.target.value;
//                 if (val === "") {
//                   setProductMeta({ price: "" });
//                 } else {
//                   const num = parseFloat(val);
//                   setProductMeta({ price: isNaN(num) ? "" : num });
//                 }
//               }}
//               placeholder={currency === "USD" ? "20" : "499"}
//             />
//           </div>
//         </div>

//         {/* Mature content toggle */}
//         <div className="flex items-center gap-2 mb-4">
//           <input
//             id="mature-flag"
//             type="checkbox"
//             checked={isMature}
//             onChange={(e) =>
//               setProductMeta({ vendorMatureFlag: e.target.checked })
//             }
//           />
//           <label htmlFor="mature-flag" className="text-sm">
//             Contains mature / 18+ content
//           </label>
//         </div>

//         {/* Tags */}
//         <label className="text-sm">Tags (press Enter)</label>
//         <input
//           className="w-full border px-2 py-1 mb-1"
//           value={tagInput}
//           onChange={(e) => setTagInput(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === "Enter") {
//               e.preventDefault();
//               commitTag();
//             }
//           }}
//           placeholder="cat, minimal, retro"
//         />
//         <div className="flex flex-wrap gap-1 mb-3">
//           {(productMeta.tags || []).map((t) => (
//             <span
//               key={t}
//               className="text-xs bg-gray-100 px-2 py-0.5 rounded"
//             >
//               {t}{" "}
//               <button className="ml-1" onClick={() => removeTag(t)}>
//                 ×
//               </button>
//             </span>
//           ))}
//         </div>

//         {/* Description */}
//         <label className="text-sm">Description</label>
//         <textarea
//           className="w-full border px-2 py-1 mb-4"
//           rows={5}
//           maxLength={800}
//           value={productMeta.description || ""}
//           onChange={(e) =>
//             setProductMeta({ description: e.target.value })
//           }
//           placeholder="Tell buyers about your artwork…"
//         />

//         {/* Save / Publish */}
//         <button
//           onClick={onSave}
//           className="bg-blue-600 text-white w-full py-2 rounded"
//         >
//           💾 Save / Publish
//         </button>

//         {!isMetaValid() && (
//           <div className="text-xs text-red-600 mt-2">
//             Title and Category are required.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { useDesignerStore } from "../state/useDesignerStore";

const PRINT = { left: 210, top: 200, width: 180, height: 280 };

function getWpConfig() {
  if (typeof window === "undefined") return {};
  return window.ARTON360 || {};
}

export default function DetailsPane() {
  const {
    canvas,
    tshirtDesigns,
    productMeta,
    setProductMeta,
    addTag,
    removeTag,
    isMetaValid,
    activeDesignIndex,
  } = useDesignerStore();

  const [tagInput, setTagInput] = useState("");

  function exportPNG(c) {
    try {
      const all = c.getObjects();
      const guides = all.filter((o) => o._isGuide);

      // hide guides
      guides.forEach((g) => g.set({ opacity: 0 }));
      c.discardActiveObject();
      c.renderAll();

      const png = c.toDataURL({
        format: "png",
        multiplier: 2,
        enableRetinaScaling: true,
      });

      // restore guides
      guides.forEach((g) => g.set({ opacity: 1 }));
      c.renderAll();

      return png;
    } catch (e) {
      console.error(e);
      alert("Could not create preview image.");
      return null;
    }
  }

  const onSave = async () => {
    if (!canvas) return;

    if (!isMetaValid()) {
      alert("Please add Title and Category.");
      return;
    }

    const previewPng = exportPNG(canvas);
    if (!previewPng) return;

    // 🔹 Read latest config at click time
    const { site: WP_SITE, nonce: WP_NONCE } = getWpConfig();

    if (!WP_SITE || !WP_NONCE) {
      alert(
        "Connection to WordPress is not ready yet. Please refresh the page and try again."
      );
      console.warn("[ARTON360] Missing WP config:", getWpConfig());
      return;
    }

    // 🔹 Only send the ACTIVE design, not all of them
    const activeIndex =
      typeof activeDesignIndex === "number" ? activeDesignIndex : 0;
    const activeDesign = tshirtDesigns?.[activeIndex];

    if (!activeDesign) {
      alert("No active design found to save.");
      console.warn("[ARTON360] No active design at index", activeIndex);
      return;
    }

    try {
      const res = await fetch(
        `${WP_SITE}/wp-json/arton360/v1/save-design`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-WP-Nonce": WP_NONCE,
          },
          credentials: "include",
          body: JSON.stringify({
            designName: productMeta.title,
            // Only this design is sent to WP
            tshirtDesigns: [activeDesign],
            previewPng,
            printBox: PRINT,
            // 🔹 Send listing details (title, category, price, tags, mature, currency, etc.)
            productMeta,
          }),
        }
      );

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("[ARTON360] Save failed", res.status, json);
        alert(json?.message || `Save failed (${res.status})`);
        return;
      }

      alert(
        json.status === "publish"
          ? "✅ Published on the store!"
          : "✅ Saved (status: " + json.status + ")"
      );
    } catch (err) {
      console.error("[ARTON360] Network error", err);
      alert("Network error while saving. Please try again.");
    }
  };

  const commitTag = () => {
    const raw = tagInput.trim();
    if (!raw) return;
    raw.split(",").forEach((t) => addTag(t));
    setTagInput("");
  };

  // ---- Price + Currency helpers ----
  const currency = productMeta.currency || "USD"; // default USD now
  const priceValue =
    typeof productMeta.price === "number" || typeof productMeta.price === "string"
      ? productMeta.price
      : "";
  const currencySymbol = "$"; // always show dollar

  const isMature = !!productMeta.vendorMatureFlag;

  return (
    <div className="p-6">
      {/* left align title */}
      <h2 className="text-2xl font-bold mb-4 text-left">Listing Details</h2>

      {/* constrain all controls to a tidy column */}
      <div className="max-w-[440px]">
        {/* Title */}
        <label className="text-sm">Title *</label>
        <input
          className="w-full border px-2 py-1 mb-3"
          value={productMeta.title}
          onChange={(e) => setProductMeta({ title: e.target.value })}
          placeholder="Retro Cat Tee"
          maxLength={70}
        />

        {/* Category */}
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

        {/* Art Type */}
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

        {/* Currency + Price row */}
        <div className="flex gap-2 mb-3">
          <div className="w-2/5">
            <label className="text-sm">Currency</label>
            <select
              className="w-full border px-2 py-1"
              value={currency}
              onChange={(e) => setProductMeta({ currency: e.target.value })}
            >
              {/* Only USD now */}
              <option value="USD">$ USD</option>
            </select>
          </div>

          <div className="w-3/5">
            <label className="text-sm">
              Price ({currencySymbol})
            </label>
            <input
              type="number"
              min="0"
              step="1"
              className="w-full border px-2 py-1"
              value={priceValue}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                  setProductMeta({ price: "" });
                } else {
                  const num = parseFloat(val);
                  setProductMeta({ price: isNaN(num) ? "" : num });
                }
              }}
              placeholder="20"
            />
          </div>
        </div>

        {/* Mature content toggle */}
        <div className="flex items-center gap-2 mb-4">
          <input
            id="mature-flag"
            type="checkbox"
            checked={isMature}
            onChange={(e) =>
              setProductMeta({ vendorMatureFlag: e.target.checked })
            }
          />
          <label htmlFor="mature-flag" className="text-sm">
            Contains mature / 18+ content
          </label>
        </div>

        {/* Tags */}
        <label className="text-sm">Tags (press Enter)</label>
        <input
          className="w-full border px-2 py-1 mb-1"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitTag();
            }
          }}
          placeholder="cat, minimal, retro"
        />
        <div className="flex flex-wrap gap-1 mb-3">
          {(productMeta.tags || []).map((t) => (
            <span
              key={t}
              className="text-xs bg-gray-100 px-2 py-0.5 rounded"
            >
              {t}{" "}
              <button className="ml-1" onClick={() => removeTag(t)}>
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Description */}
        <label className="text-sm">Description</label>
        <textarea
          className="w-full border px-2 py-1 mb-4"
          rows={5}
          maxLength={800}
          value={productMeta.description || ""}
          onChange={(e) =>
            setProductMeta({ description: e.target.value })
          }
          placeholder="Tell buyers about your artwork…"
        />

        {/* Save / Publish */}
        <button
          onClick={onSave}
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          💾 Save / Publish
        </button>

        {!isMetaValid() && (
          <div className="text-xs text-red-600 mt-2">
            Title and Category are required.
          </div>
        )}
      </div>
    </div>
  );
}
