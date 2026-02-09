import { useRef, useState } from "react";
import { useDesignerStore } from "../state/useDesignerStore";
import WebFont from "webfontloader";
import { uploadFilesToCanvas } from "../utils/uploadToCanvas";
import { saveDesignToWordPress, saveAllDesignsToWordPress } from "../utils/saveDesign";

// Common fonts
const FONTS = ["Poppins", "Roboto", "Montserrat", "Open Sans", "Raleway"];

function getWpConfig() {
    if (typeof window === "undefined") return {};
    return window.ARTON360 || {};
}

export default function ProductSidebar() {
    const {
        // Canvas & Design
        canvas,
        tshirtDesigns,
        activeDesignIndex,
        activeSide,
        setActiveSide, // If we want to bring back side switching
        addMultipleSame,
        addMultipleSeparate,
        setColor,

        // Config / Store
        toggleFullPrintForActiveSide,
        regularColors,
        setProductTypeForActive,

        // Meta / Details
        designMetas,
        setProductMeta,
        addTag,
        removeTag,
        isMetaValid,
    } = useDesignerStore();

    const fileRef = useRef(null);
    const [font, setFont] = useState("Poppins");
    const [tagInput, setTagInput] = useState("");

    // Basic indices
    const total = tshirtDesigns.length;
    const activeDesign = tshirtDesigns[activeDesignIndex];
    const activeProductType = activeDesign?.productType || "tshirts";

    // Product Meta
    const productMeta = designMetas?.[activeDesignIndex] || {
        title: "",
        tags: [],
        categorySlug: "tshirts",
        price: "",
        currency: "USD",
    };

    const currencySymbol = "$";
    const priceValue = productMeta.price || "";

    // -------------------------------------------------------------
    // ACTION HANDLERS (Migrated from Toolbar/DetailsPane)
    // -------------------------------------------------------------

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

    const onAddText = async () => {
        if (!canvas) return;
        const box = canvas?.__printArea;
        if (!box) {
            alert("Canvas print area not ready yet.");
            return;
        }

        const fm = await import("fabric");
        const fabric = fm.fabric || fm.default || fm;

        WebFont.load({
            google: { families: [font] },
            active: () => {
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
                });
                canvas.add(t);
                canvas.setActiveObject(t);
                canvas.requestRenderAll();
            },
        });
    };

    const exportPNG = (c) => {
        try {
            const all = c.getObjects();
            const guides = all.filter((o) => o._isGuide);
            guides.forEach((g) => g.set({ opacity: 0 }));
            c.discardActiveObject();
            c.renderAll();

            const png = c.toDataURL({
                format: "png",
                multiplier: 2,
                enableRetinaScaling: true,
            });

            guides.forEach((g) => g.set({ opacity: 1 }));
            c.renderAll();
            return png;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    const onSave = async () => {
        const canvas = window.__fabric_canvas || document.querySelector("canvas");
        if (!canvas) {
            alert("Canvas not found");
            return;
        }
        const result = await saveDesignToWordPress(canvas);
        if (result.success) {
            alert("Design published successfully!");
        } else {
            alert("Publish failed: " + (result.error || "Unknown error"));
        }
    };

    const onSaveAll = async () => {
        const canvas = window.__fabric_canvas || document.querySelector("canvas");
        if (!canvas) {
            alert("Canvas not found");
            return;
        }
        const result = await saveAllDesignsToWordPress(canvas);
        if (result.success) {
            alert(`All ${result.total} designs published successfully!`);
        } else {
            alert(`Published ${result.succeeded}/${result.total}. ${result.failed} failed.`);
        }
    };

    const commitTag = () => {
        const raw = tagInput.trim();
        if (!raw) return;
        raw.split(",").forEach((t) => addTag(t));
        setTagInput("");
    };


    // -------------------------------------------------------------
    // UI RENDER
    // -------------------------------------------------------------
    return (
        <div className="h-full flex flex-col bg-white border-l border-gray-200 overflow-y-auto">

            {/* 1. HEADER section */}
            <div className="p-6 border-b border-gray-100">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Design Title
                </label>
                <input
                    className="w-full text-2xl font-bold text-gray-800 placeholder-gray-300 border-none focus:ring-0 p-0"
                    value={productMeta.title}
                    onChange={(e) => setProductMeta({ title: e.target.value })}
                    placeholder="My Awesome Design"
                />
                <div className="mt-2 flex items-baseline gap-1 text-gray-600">
                    <span className="text-sm">Price:</span>
                    <span className="font-medium text-lg text-green-600">{currencySymbol}</span>
                    <input
                        type="number"
                        className="w-20 font-medium text-lg border-b border-dashed border-gray-300 focus:border-blue-500 outline-none text-green-600"
                        value={priceValue}
                        onChange={(e) => setProductMeta({ price: parseFloat(e.target.value) || "" })}
                        placeholder="20.00"
                    />
                </div>
            </div>

            {/* 2. PRODUCT CHOICES (Type & Color) */}
            <div className="p-6 border-b border-gray-100 space-y-6">

                {/* Product Type Toggle */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Product Style</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setProductTypeForActive("tshirts")}
                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors border ${activeProductType === "tshirts"
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            T-Shirt
                        </button>
                        <button
                            onClick={() => setProductTypeForActive("graphic-tshirt")}
                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors border ${activeProductType === "graphic-tshirt"
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            Graphic Tee
                        </button>
                    </div>
                </div>

                {/* Colors */}
                {(activeProductType === "tshirts") && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                        <div className="flex flex-wrap gap-3">
                            {regularColors.map((c) => (
                                <button
                                    key={c.key}
                                    onClick={() => setColor(c.key)}
                                    className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none ${activeDesign.color === c.key ? "ring-2 ring-offset-2 ring-blue-500 border-gray-300" : "border-gray-200"
                                        }`}
                                    style={{ backgroundColor: c.hex }}
                                    title={c.label}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 3. DESIGN TOOLS (The "Uploader/Editor" part) */}
            <div className="p-6 border-b border-gray-100 bg-gray-50">
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                    Add to Design
                </label>

                <div className="grid grid-cols-2 gap-3">
                    {/* Upload Button */}
                    <div className="relative group">
                        <button className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg shadow-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all flex flex-col items-center gap-1">
                            <span className="text-xl">📁</span>
                            <span>Upload Art</span>
                        </button>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={onUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>

                    {/* Text Button */}
                    <button
                        onClick={onAddText}
                        className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg shadow-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all flex flex-col items-center gap-1"
                    >
                        <span className="text-xl">Tt</span>
                        <span>Add Text</span>
                    </button>
                </div>

                {/* Font Select (Only show if text tool used ideally, but keeping it simple) */}
                <div className="mt-4">
                    <select
                        value={font}
                        onChange={(e) => setFont(e.target.value)}
                        className="w-full text-sm border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                        {FONTS.map(f => <option key={f}>{f}</option>)}
                    </select>
                </div>
            </div>

            {/* 4. DETAILS & TAGS (Collapsible-ish) */}
            <div className="p-6 flex-1 text-sm text-gray-600 space-y-4">
                <div>
                    <label className="block font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                        rows={3}
                        placeholder="Describe your design..."
                        value={productMeta.description || ""}
                        onChange={(e) => setProductMeta({ description: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block font-medium text-gray-700 mb-1">Tags (Press Enter)</label>
                    <input
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="retro, funny, cat..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), commitTag())}
                    />
                    <div className="flex flex-wrap gap-1 mt-2">
                        {productMeta.tags?.map(t => (
                            <span key={t} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {t}
                                <button onClick={() => removeTag(t)} className="ml-1 text-gray-400 hover:text-gray-600">×</button>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* 5. FOOTER ACTIONS */}
            <div className="p-6 border-t border-gray-200 bg-white sticky bottom-0 z-10">
                <button
                    onClick={onSave}
                    className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                    <span>Save & Publish</span>
                </button>
                {tshirtDesigns?.length > 1 && (
                    <button
                        onClick={onSaveAll}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors mt-2"
                    >
                        PUBLISH ALL ({tshirtDesigns.length} designs)
                    </button>
                )}
                <div className="text-center mt-2 text-xs text-gray-400">
                    By saving, you agree to the Artist Terms.
                </div>
            </div>

        </div>
    );
}
