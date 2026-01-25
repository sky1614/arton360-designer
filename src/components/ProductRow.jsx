import { useState, useRef } from "react";
import { useDesignerStore } from "../state/useDesignerStore";
import CanvasArea from "./CanvasArea";
import WebFont from "webfontloader";
import { uploadFilesToCanvas } from "../utils/uploadToCanvas";

// Common fonts
const FONTS = ["Poppins", "Roboto", "Montserrat", "Open Sans", "Raleway"];

function getWpConfig() {
    if (typeof window === "undefined") return {};
    return window.ARTON360 || {};
}

export default function ProductRow() {
    const {
        // State
        tshirtDesigns,
        activeDesignIndex,
        regularColors,
        setColor,
        setProductTypeForActive,
        activeDesign: activeDesignFromStore,

        // Tools
        canvas,
        addMultipleSame,
        addMultipleSeparate,
        isMetaValid
    } = useDesignerStore();
    const activeDesign = activeDesignFromStore || tshirtDesigns?.[activeDesignIndex];

    // ✅ If no designs exist yet, don’t render ProductRow UI (prevents crash)
    if (!activeDesign) {
        return (
            <div className="bg-white p-6 border border-gray-200 rounded-lg">
                <div className="text-sm text-gray-600">
                    Upload your art to start. Your designs will appear here.
                </div>
            </div>
        );
    }


    const [font, setFont] = useState("Poppins");
    const [colorFilter, setColorFilter] = useState("all"); // all | light | dark
    const filteredColors = regularColors.filter((c) => {
        if (colorFilter === "all") return true;
        return (c.tone || "all") === colorFilter;
    });

    const activeProductType = activeDesign?.productType || "tshirts";

    // ----------- TOOLS (Copied from Sidebar) -----------
    const onUpload = async (e) => {
        const files = e.target.files;
        await uploadFilesToCanvas({
            files: e.target.files,
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

    return (
        <div className="bg-gray-100 p-6 rounded-md">

            {/* HEADER ROW inside the product card */}
            <div className="flex items-center justify-between bg-black text-white px-4 py-2 rounded-t-md mb-0">
                <div className="font-bold">Item</div>
                <div className="flex gap-4 text-sm font-bold">
                    <span>Enable</span>
                    <span>Default Color</span>
                </div>
            </div>

            <div className="bg-white p-6 border border-gray-200 border-t-0 rounded-b-md">

                {/* THE T-SHIRT ROW */}
                <div className="flex flex-col md:flex-row gap-8">

                    {/* LEFT: CANVAS PREVIEW */}
                    <div className="shrink-0 w-full md:w-[580px] h-[700px] bg-white relative border border-gray-200 rounded-lg overflow-hidden shadow-sm" id="canvas-wrapper">
                        <CanvasArea />
                    </div>

                    {/* RIGHT: CONTROLS */}
                    <div className="flex-1 space-y-6">

                        {/* 1. TOP TOGGLES */}
                        <div className="flex items-center justify-between border-b pb-4">
                            <div className="font-bold text-lg">T-Shirt</div>

                            <div className="flex items-center gap-4">
                                {/* Enable Switch */}
                                <label className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only" checked readOnly />
                                        <div className="block bg-green-500 w-10 h-6 rounded-full"></div>
                                        <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4"></div>
                                    </div>
                                    <div className="ml-3 text-gray-700 font-medium">ON</div>
                                </label>

                                {/* Default Color Dropdown */}
                                <select className="border border-gray-300 rounded px-2 py-1 text-sm bg-white">
                                    <option>Select Default Color</option>
                                    <option>White</option>
                                    <option>Black</option>
                                </select>
                            </div>
                        </div>

                        {/* 2. PRODUCT TYPE SELECTION (Using Radio/Buttons) */}
                        <div>
                            <div className="text-sm font-bold mb-2">Product Style</div>
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="ptype"
                                        checked={activeProductType === "tshirts"}
                                        onChange={() => setProductTypeForActive("tshirts")}
                                    />
                                    <span>Standard T-Shirt</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="ptype"
                                        checked={activeProductType === "graphic-tshirt"}
                                        onChange={() => setProductTypeForActive("graphic-tshirt")}
                                    />
                                    <span>Graphic T-Shirt (Full Print)</span>
                                </label>
                            </div>
                        </div>

                        {/* 3. TOOLS (Design Actions) */}
                        <div className="bg-gray-800 p-3 rounded flex gap-2 items-center text-white text-sm">
                            <span className="font-bold mr-2">Tools</span>

                            {/* Upload */}
                            <div className="relative group cursor-pointer bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded flex items-center gap-1 transition-colors">
                                <span>📁</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={onUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>

                            {/* Text */}
                            <button onClick={onAddText} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded flex items-center gap-1 transition-colors">
                                <span>Tt</span>
                            </button>

                            {/* Scale Slider (Visual only for now) */}
                            <div className="flex-1 flex items-center gap-2 ml-4">
                                <span>Scale</span>
                                <input type="range" className="w-full h-1 bg-gray-500 rounded-lg appearance-none cursor-pointer" />
                                <span>100%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLOR GRID (Bottom Area) */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-gray-700">Product Colors</div>
                </div>

                {/* Filters moved right above palette */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setColorFilter("all")}
                        className={`px-3 py-1 text-xs rounded ${
                        colorFilter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                        }`}
                    >
                    All
                    </button>

                    <button
                        onClick={() => setColorFilter("light")}
                        className={`px-3 py-1 text-xs rounded ${
                        colorFilter === "light" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                        }`}
                    >
                        Light
                    </button>

                    <button
                        onClick={() => setColorFilter("dark")}
                        className={`px-3 py-1 text-xs rounded ${
                        colorFilter === "dark" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                        }`}
                    >
                        Dark
                    </button>
                </div>


                    <div className="flex flex-wrap gap-2">
                        {filteredColors.map((c) => (
                            <button
                                key={c.key}
                                onClick={() => setColor(c.key)}
                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none flex items-center justify-center ${activeDesign.color === c.key ? "ring-2 ring-offset-2 ring-blue-500 border-gray-300" : "border-gray-200"
                                    }`}
                                style={{ backgroundColor: c.hex }}
                                title={c.label}
                            >
                                {/* Checkmark if selected */}
                                {activeDesign.color === c.key && (
                                    <span className={`text-[10px] ${['white', 'daisy', 'azalea'].includes(c.key) ? 'text-black' : 'text-white'}`}>✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* FINAL SAVE BUTTON AREA */}
            <div className="mt-8 text-center">
                <button onClick={onSave} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-12 rounded shadow-sm text-lg uppercase tracking-wide transition-colors">
                    Publish
                </button>
            </div>

        </div>
    );
}
