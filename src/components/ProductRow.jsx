import { useState, useRef } from "react";
import { useDesignerStore } from "../state/useDesignerStore";
import CanvasArea from "./CanvasArea";
import DesignNav from "./DesignNav";
import WebFont from "webfontloader";
import { uploadFilesToCanvas } from "../utils/uploadToCanvas";
import { saveDesignToWordPress, saveAllDesignsToWordPress } from "../utils/saveDesign";

// Common fonts
const FONTS = ["Poppins", "Roboto", "Montserrat", "Open Sans", "Raleway"];

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
        isMetaValid,
        removeDesign,
        resetAll,
    } = useDesignerStore();
    const activeDesign = activeDesignFromStore || tshirtDesigns?.[activeDesignIndex];
    const [font, setFont] = useState("Poppins");
    const [colorFilter, setColorFilter] = useState("all"); // all | light | dark
    const [publishing, setPublishing] = useState(false);
    const publishingRef = useRef(false);

    const onDeleteDesign = () => {
        if (!confirm(`Delete design ${activeDesignIndex + 1} of ${tshirtDesigns.length}? This cannot be undone.`)) return;
        if (canvas) canvas.clear();
        removeDesign(activeDesignIndex);
    };


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

    const onSave = async () => {
        if (publishingRef.current) return;
        publishingRef.current = true;
        setPublishing(true);
        try {
            const result = await saveDesignToWordPress(canvas);
            if (result.success) {
                alert("1 art is published");
                if (canvas) canvas.clear();
                resetAll();
                if (result.data.product_url) {
                    window.open(result.data.product_url, '_blank');
                }
            } else {
                alert(`Save Failed\n\n${result.error}`);
            }
        } finally {
            publishingRef.current = false;
            setPublishing(false);
        }
    };


    const onSaveAll = async () => {
        if (publishingRef.current) return;
        publishingRef.current = true;
        setPublishing(true);
        try {
            const result = await saveAllDesignsToWordPress(canvas);
            if (result.success) {
                alert(`${result.total} art uploaded`);
                if (canvas) canvas.clear();
                resetAll();
            } else {
                alert(`${result.succeeded}/${result.total} art uploaded. ${result.failed} failed.`);
            }

        } finally {
            publishingRef.current = false;
            setPublishing(false);
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

                                {/* Default Color Dropdown - synced with swatch selection */}
                                <select
                                    className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                                    value={activeDesign?.color || "white"}
                                    onChange={(e) => setColor(e.target.value)}
                                >
                                    {regularColors.map((c) => (
                                        <option key={c.key} value={c.key}>{c.label}</option>
                                    ))}
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
                        </div>
                    </div>
                </div>

                {/* PREV / NEXT below canvas */}
                {tshirtDesigns.length > 1 && (
                    <div className="md:w-[580px]">
                        <DesignNav />
                    </div>
                )}

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
            <div className="mt-8 text-center space-y-3">
                <div className="flex justify-center gap-4">
                    <button onClick={onDeleteDesign} disabled={publishing} className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded shadow-sm text-lg uppercase tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        Delete
                    </button>
                    <button onClick={onSave} disabled={publishing} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-12 rounded shadow-sm text-lg uppercase tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {publishing ? "Processing..." : "Publish"}
                    </button>
                </div>
                {tshirtDesigns?.length > 1 && (
                    <div className="flex justify-center gap-4">
                        <button onClick={() => { if(confirm(`Delete ALL ${tshirtDesigns.length} designs? This cannot be undone.`)) { if(canvas) canvas.clear(); while(tshirtDesigns.length > 0) { removeDesign(0); } } }} disabled={publishing} className="bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-8 rounded shadow-sm text-lg uppercase tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            DELETE ALL ({tshirtDesigns.length})
                        </button>
                        <button onClick={onSaveAll} disabled={publishing} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-12 rounded shadow-sm text-lg uppercase tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {publishing ? "Processing..." : `PUBLISH ALL (${tshirtDesigns.length} designs)`}
                        </button>
                    </div>
                )}
            </div>



        </div>
    );
}
