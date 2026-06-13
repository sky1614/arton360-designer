// src/components/DetailsPane.jsx
import { useState, useMemo } from "react";
import { useDesignerStore } from "../state/useDesignerStore";
import { saveDesignToWordPress, saveAllDesignsToWordPress } from "../utils/saveDesign";

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
  const [publishProgress, setPublishProgress] = useState({ active: false, current: 0, total: 0, message: '' });

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

  const onSave = async () => {
    const result = await saveDesignToWordPress(canvas);
    if (result.success) {
      alert(`Product Created!\n\nProduct ID: ${result.data.product_id}\nStatus: ${result.data.status}\n\nClick OK to view your product.`);
      if (result.data.product_url) {
        window.open(result.data.product_url, '_blank');
      }
    } else {
      alert(`Save Failed\n\n${result.error}\n\nCheck browser console for details.`);
    }
  };

  const onSaveAll = async () => {
    const total = tshirtDesigns?.length || 0;
    if (total <= 1) {
        onSave();
        return;
    }
    if (!confirm(`Publish all ${total} designs in batches of 5? Each will be created as a separate product.`)) return;

    let succeeded = 0;
    let failed = 0;
    const batchSize = 5;

    for (let i = 0; i < total; i += batchSize) {
        const batchEnd = Math.min(i + batchSize, total);
        console.log(`Publishing batch ${Math.floor(i/batchSize) + 1}: designs ${i+1} to ${batchEnd}`);

        // Process each design in this batch
        for (let j = i; j < batchEnd; j++) {
            try {
                const result = await saveDesignToWordPress(canvas, j);
                if (result.success) {
                    succeeded++;
                    console.log(`✅ Design ${j+1}/${total} published`);
                } else {
                    failed++;
                    console.log(`❌ Design ${j+1}/${total} failed:`, result.error);
                }
            } catch (err) {
                failed++;
                console.log(`❌ Design ${j+1}/${total} error:`, err);
            }
        }

        // Wait 3 seconds between batches to prevent server overload
        if (i + batchSize < total) {
            console.log(`Waiting 3 seconds before next batch...`);
            await new Promise(r => setTimeout(r, 3000));
        }
    }

    if (failed === 0) {
        alert(`✅ All ${succeeded} products published successfully!`);
    } else {
        alert(`Published ${succeeded}/${total}.\n${failed} failed.\n\nCheck console for details.`);
    }
 };

  const commitTag = () => {
    const raw = tagInput.trim();
    if (!raw) return;
    raw.split(",").forEach((t) => addTag(t));
    setTagInput("");
  };

  const autoFillWithAI = async () => {
    if (!canvas) return;
    
    const previewImg = exportPreviewPNG(canvas);
    if (!previewImg) {
        alert("Could not capture design image");
        return;
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + import.meta.env.VITE_OPENROUTER_API_KEY
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-exp:free",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "image_url",
                                image_url: { url: previewImg }
                            },
                            {
                                type: "text",
                                text: "Analyze this t-shirt design artwork and respond ONLY with valid JSON, no markdown, no code blocks: {\"title\": \"short catchy product title max 6 words\", \"description\": \"2-3 sentence product description\", \"tags\": [\"tag1\", \"tag2\", \"tag3\", \"tag4\", \"tag5\"]}"
                            }
                        ]
                    }
                ]
            })
        });

        const data = await response.json();
        let text = data.choices[0].message.content;
        
        // Clean up response - remove markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        const parsed = JSON.parse(text);

        setProductMeta({
            title: parsed.title,
            description: parsed.description,
        });

        // Add tags
        parsed.tags.forEach(tag => addTag(tag));

        alert("✅ AI filled the details! Review and edit if needed.");

    } catch (err) {
        console.error("AI auto-fill error:", err);
        alert("AI auto-fill failed. Please fill manually.");
    }
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
            <button
                onClick={autoFillWithAI}
                style={{
                    background: '#3b3bbe',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                ✨ Auto-fill with AI
            </button>
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

          {tshirtDesigns?.length > 1 && (
            <button
              onClick={onSaveAll}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors mt-2"
            >
              PUBLISH ALL ({tshirtDesigns.length} designs)
            </button>
          )}

          {!isMetaValid() && (
            <div className="text-sm text-red-600 mt-3">
              Title and Category are required.
            </div>
          )}
        </div>
      </div>
      {/* Progress Bar */}
      {publishProgress.active && (
          <div style={{
              position: 'fixed',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#1c2432',
              color: '#fff',
              padding: '16px 24px',
              borderRadius: '12px',
              zIndex: 99999,
              minWidth: '320px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
          }}>
              <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                  {publishProgress.message}
              </div>
              <div style={{ background: '#333', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                  <div style={{
                      background: '#3b3bbe',
                      height: '100%',
                      width: `${(publishProgress.current / publishProgress.total) * 100}%`,
                      transition: 'width 0.3s ease',
                      borderRadius: '6px'
                  }} />
              </div>
              <div style={{ marginTop: '6px', fontSize: '12px', color: '#aaa', textAlign: 'right' }}>
                  {publishProgress.current}/{publishProgress.total}
              </div>
          </div>
      )}
    </div>
  );
}
