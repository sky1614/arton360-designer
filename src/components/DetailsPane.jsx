// src/components/DetailsPane.jsx
import { useState, useMemo } from "react";
import { useDesignerStore } from "../state/useDesignerStore";

const PRINT = { left: 210, top: 200, width: 180, height: 280 };

function getWpConfig() {
  if (typeof window === "undefined") return {};
  return window.ARTON360 || {};
}

// --- Internal reusable UI components (TeePublic style) ---
const FieldGroup = ({ label, helperText, children }) => (
  <div className="mb-7">
    <label className="block text-lg font-semibold text-gray-900 mb-1.5">
      {label}
    </label>
    {helperText && <div className="text-sm text-gray-600 mb-3">{helperText}</div>}
    {children}
  </div>
);

const StyledInput = (props) => (
  <input
    className="w-full h-11 border border-gray-300 rounded-lg bg-white px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    {...props}
  />
);

const StyledSelect = (props) => (
  <select
    className="w-full h-11 border border-gray-300 rounded-lg bg-white px-4 py-2.5 text-base text-gray-900 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    {...props}
  />
);

const StyledTextarea = (props) => (
  <textarea
    className="w-full border border-gray-300 rounded-lg bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-all resize-y focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    {...props}
  />
);

export default function DetailsPane() {
  const {
    canvas,
    tshirtDesigns,
    designMetas,
    setProductMeta,
    addTag,
    removeTag,
    isMetaValid,
    activeDesignIndex,
  } = useDesignerStore();

  const [tagInput, setTagInput] = useState("");

  const activeIndex =
    typeof activeDesignIndex === "number" ? activeDesignIndex : 0;

  // ✅ Fix: compute defaultCategory safely BEFORE fallback productMeta uses it
  const activeDesign = tshirtDesigns?.[activeIndex];
  const activeProductType = activeDesign?.productType || "tshirts";
  const defaultCategory =
    activeProductType === "graphic-tshirt" ? "graphic-tshirt" : "tshirts";

  // Per-design product meta (fallback if not created yet)
  const productMeta = useMemo(() => {
    return (
      designMetas?.[activeIndex] || {
        title: "",
        description: "",
        categorySlug: defaultCategory,
        artType: "",
        tags: [],
        currency: "USD",
        price: "",
        vendorMatureFlag: false,
      }
    );
  }, [designMetas, activeIndex, defaultCategory]);

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
      console.log("=== SAVE STARTED ===");
      
      if (!canvas) {
          alert("Canvas not ready");
          console.error("Canvas is null");
          return;
      }
      
      if (!isMetaValid()) {
          alert("Please add Title and Category.");
          console.error("Meta validation failed");
          return;
      }

      const previewPng = exportPNG(canvas);
      if (!previewPng) {
          alert("Failed to generate preview image");
          console.error("Preview PNG generation failed");
          return;
      }

      const config = getWpConfig();
      console.log("WP Config received:", {
          hasSite: !!config.site,
          hasNonce: !!config.nonce,
          hasVendorId: !!config.vendorId,
          site: config.site
      });
      
      if (!config.site || !config.nonce) {
          alert(`WordPress connection not ready.\nSite: ${!!config.site}\nNonce: ${!!config.nonce}`);
          console.error("Missing WP config:", config);
          return;
      }

      const url = `${config.site}/wp-json/arton360/v1/save-design`;
      console.log("Posting to URL:", url);

      const { designMetas, tshirtDesigns, activeDesignIndex } = useDesignerStore.getState();
      const activeDesign = tshirtDesigns[activeDesignIndex];
      const productMeta = designMetas[activeDesignIndex];

      const payload = {
          designName: productMeta.title || "Untitled Design",
          tshirtDesigns: [activeDesign],
          previewPng,
          printBox: { left: 210, top: 200, width: 180, height: 280 },
          productMeta: {
              title: productMeta.title,
              description: productMeta.description || "",
              categorySlug: productMeta.categorySlug || "tshirts",
              tags: productMeta.tags || [],
              price: parseFloat(productMeta.price) || 25,
              currency: productMeta.currency || "USD",
              artType: productMeta.artType || "",
              vendorMatureFlag: productMeta.vendorMatureFlag || false
          }
      };

      console.log("Payload preview:", {
          designName: payload.designName,
          hasPreviewPng: !!payload.previewPng,
          previewPngLength: payload.previewPng?.length,
          productMeta: payload.productMeta,
          designsCount: payload.tshirtDesigns?.length
      });
      
      try {
          console.log("Sending fetch request...");
          const response = await fetch(url, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "X-WP-Nonce": config.nonce,
              },
              credentials: "include",
              body: JSON.stringify(payload),
          });

          console.log("Response received:", {
              status: response.status,
              statusText: response.statusText,
              ok: response.ok
          });

          const data = await response.json();
          console.log("Response data:", data);

          if (response.ok && data.ok) {
              alert(`✅ Product Created Successfully!\n\nProduct ID: ${data.product_id}\nStatus: ${data.status}\n\nClick OK to view your product.`);
              console.log("✅ SUCCESS - Product URL:", data.product_url);
              
              // Open product in new tab
              if (data.product_url) {
                  window.open(data.product_url, '_blank');
              }
          } else {
              const errorMsg = data.message || data.code || response.statusText || "Unknown error";
              alert(`❌ Save Failed\n\nError: ${errorMsg}\n\nCheck browser console for details.`);
              console.error("Save failed:", data);
          }
      } catch (error) {
          console.error("❌ Network/Fetch error:", error);
          alert(`❌ Network Error\n\n${error.message}\n\nCheck:\n1. Internet connection\n2. WordPress site is accessible\n3. Browser console for details`);
      }
  };

  const commitTag = () => {
    const raw = tagInput.trim();
    if (!raw) return;
    raw.split(",").forEach((t) => addTag(t));
    setTagInput("");
  };

  // ---- Price + Currency helpers ----
  const currency = productMeta.currency || "USD";
  const priceValue =
    typeof productMeta.price === "number" ||
      typeof productMeta.price === "string"
      ? productMeta.price
      : "";
  const currencySymbol = "$";
  const isMature = !!productMeta.vendorMatureFlag;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* TeePublic-style gray panel */}
      <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl p-8">
        {/* 2-column grid (like TeePublic) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
          {/* LEFT COLUMN */}
          <div>
            <FieldGroup label="Design Title" helperText="Give your design a name!">
              <StyledInput
                value={productMeta.title}
                onChange={(e) => setProductMeta({ title: e.target.value })}
                placeholder="Title"
                maxLength={70}
              />
            </FieldGroup>

            <FieldGroup
              label="Description"
              helperText="Describe your design in a short sentence or two!"
            >
              <StyledTextarea
                rows={4}
                maxLength={800}
                value={productMeta.description || ""}
                onChange={(e) => setProductMeta({ description: e.target.value })}
                placeholder="Describe your design"
              />
            </FieldGroup>

            {/* Album (UI placeholder like TeePublic) */}
            <div className="mb-7">
              <label className="block text-lg font-semibold text-gray-900 mb-1.5">
                Album
              </label>
              <div className="text-sm text-gray-600 mb-3">(Optional)</div>
              <select className="w-full h-11 border border-gray-300 rounded-lg bg-gray-50 px-4 py-2.5 text-base text-gray-700 shadow-sm outline-none cursor-pointer transition-all hover:bg-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option>No Available Albums</option>
              </select>
              <button className="mt-2.5 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                Manage Albums
              </button>
            </div>

            {/* Keep your existing fields (Category + ArtType) in the left column */}
            <FieldGroup label="Category *" helperText="Choose a product category">
              <StyledSelect
                value={productMeta.categorySlug || defaultCategory}
                onChange={(e) => setProductMeta({ categorySlug: e.target.value })}
              >
                <option value="tshirts">T-shirt</option>
                <option value="graphic-tshirt">Graphic T-shirt</option>
              </StyledSelect>
            </FieldGroup>

            <FieldGroup label="Art Type" helperText="Optional">
              <StyledSelect
                value={productMeta.artType || ""}
                onChange={(e) => setProductMeta({ artType: e.target.value })}
              >
                <option value="">(Select)</option>
                <option value="illustration">Illustration</option>
                <option value="vector">Vector</option>
                <option value="typography">Typography</option>
                <option value="photography">Photography</option>
                <option value="calligraphy">Calligraphy</option>
              </StyledSelect>
            </FieldGroup>

            {/* Currency + Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldGroup label="Currency" helperText="Currently USD only">
                <StyledSelect
                  value={currency}
                  onChange={(e) => setProductMeta({ currency: e.target.value })}
                >
                  <option value="USD">$ USD</option>
                </StyledSelect>
              </FieldGroup>

              <FieldGroup label={`Price (${currencySymbol})`} helperText="Set your base price">
                <StyledInput
                  type="number"
                  min="0"
                  step="1"
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
              </FieldGroup>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div>
            {/* Main Tag (UI placeholder like TeePublic) */}
            <FieldGroup
              label="Main Tag"
              helperText="What (1) tag would I search to find your design?"
            >
              <StyledInput placeholder="Main tag" />
            </FieldGroup>

            {/* Supporting Tags */}
            <FieldGroup
              label="Supporting Tags"
              helperText="What other relevant tags would customers use to find your design?"
            >
              <StyledTextarea
                rows={4}
                placeholder="Use commas to separate tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitTag();
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {(productMeta.tags || []).map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-sm font-medium text-blue-700"
                  >
                    {t}
                    <button
                      onClick={() => removeTag(t)}
                      className="ml-2 text-blue-500 hover:text-blue-700 font-bold text-base leading-none"
                      type="button"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </FieldGroup>

            {/* Mature content radio (TeePublic style) */}
            <div className="mt-6">
              <div className="text-lg font-semibold text-gray-900 mb-1.5 leading-snug">
                Does this design contain Mature Content, such as nudity or other adult themes?
              </div>
              <div className="text-sm text-gray-600 mb-4">
                If you are not sure, check out our{" "}
                <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                  FAQ
                </span>
                .
              </div>

              <div className="flex gap-6">
                <label className="inline-flex items-center cursor-pointer select-none">
                  <input
                    type="radio"
                    name="mature"
                    checked={isMature === true}
                    onChange={() => setProductMeta({ vendorMatureFlag: true })}
                    className="w-5 h-5 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  />
                  <span className="ml-2.5 text-base font-medium text-gray-900">
                    Yes
                  </span>
                </label>

                <label className="inline-flex items-center cursor-pointer select-none">
                  <input
                    type="radio"
                    name="mature"
                    checked={isMature === false}
                    onChange={() => setProductMeta({ vendorMatureFlag: false })}
                    className="w-5 h-5 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  />
                  <span className="ml-2.5 text-base font-medium text-gray-900">
                    No
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Save button (full-width like TeePublic action) */}
        <div className="mt-8">
          <button
            onClick={onSave}
            className="w-full h-11 rounded-lg bg-[#45b452] hover:bg-[#3da149] text-white font-bold shadow-sm transition-colors"
          >
            PUBLISH / SAVE
          </button>

          {!isMetaValid() && (
            <div className="text-sm text-red-600 mt-3">
              Title and Category are required.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
