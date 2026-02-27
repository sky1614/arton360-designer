// import { useState } from "react";
// import { useDesignerStore } from "../state/useDesignerStore";
// import { useMemo, useState } from "react";
// import { useDesignerStore } from "../state/useDesignerStore";

import { useState } from "react";
import { useDesignerStore } from "../state/useDesignerStore";


// --- Internal Reusable Components for Consistency ---

const FieldGroup = ({ label, helperText, children }) => (
    <div className="mb-7">
        <label className="block text-lg font-semibold text-gray-900 mb-1.5">{label}</label>
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

const StyledTextarea = (props) => (
    <textarea
        className="w-full border border-gray-300 rounded-lg bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-all resize-y focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        {...props}
    />
);

// ----------------------------------------------------

export default function DesignDetailsForm() {
    const {
        designMetas,
        setProductMeta,
        addTag,
        removeTag,
        activeDesignIndex,
        albums,
        albumsLoaded,
        createAlbum,
    } = useDesignerStore();

    // ---------- PRICING + PRODUCT TYPE ----------
    const BASE_PRICE = {
        tshirts: 15,
        "graphic-tshirt": 30,
    };

    const { tshirtDesigns, setProductTypeForActive } = useDesignerStore();

    const activeDesign = tshirtDesigns?.[activeDesignIndex];
    const productType = activeDesign?.productType || "tshirts";
    const base = BASE_PRICE[productType] ?? 15;

    const [priceWarn, setPriceWarn] = useState("");


    const [tagInput, setTagInput] = useState("");

    // Safe Access
    const productMeta = designMetas?.[activeDesignIndex] || {
        title: "",
        description: "",
        tags: [],
        price: "",
        vendorMatureFlag: false,
    };

    const commitTag = () => {
        const raw = tagInput.trim();
        if (!raw) return;
        raw.split(",").forEach((t) => addTag(t));
        setTagInput("");
    };

    

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
            {/* TeePublic-style Panel Container */}
            <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl p-8">

                {/* 2-Column Grid Wrapper */}
                <div className="grid grid-cols-2 gap-x-16 gap-y-8">

                    {/* --- LEFT COLUMN --- */}
                    <div>
                        <FieldGroup
                            label="Design Title"
                            helperText="Give your design a name!"
                        >
                            <StyledInput
                                value={productMeta.title}
                                onChange={(e) => setProductMeta({ title: e.target.value })}
                                placeholder="Title"
                            />
                        </FieldGroup>

                        <FieldGroup
                            label="Description"
                            helperText="Describe your design in a short sentence or two!"
                        >
                            <StyledTextarea
                                rows={4}
                                value={productMeta.description || ""}
                                onChange={(e) => setProductMeta({ description: e.target.value })}
                                placeholder="Describe your design"
                            />
                        </FieldGroup>

                        {/* Album Section */}
                        <div className="mb-7">
                            <label className="block text-lg font-semibold text-gray-900 mb-1.5">Album</label>
                            <div className="text-sm text-gray-600 mb-3">(Optional)</div>
                            <select className="w-full h-11 border border-gray-300 rounded-lg bg-gray-50 px-4 py-2.5 text-base text-gray-700 shadow-sm outline-none cursor-pointer transition-all hover:bg-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                                <option>No Available Albums</option>
                            </select>
                            <button className="mt-2.5 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                                Manage Albums
                            </button>
                        </div>
                        {/* Pricing Section */}
                        <div className="mb-7">
                            <label className="block text-lg font-semibold text-gray-900 mb-1.5">Pricing</label>
                            <div className="text-sm text-gray-600 mb-3">
                                You can’t set a price lower than the base price.
                            </div>

                            {/* Type selection */}
                            <div className="flex items-center gap-6 mb-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="ptype-price"
                                        checked={productType === "tshirts"}
                                        onChange={() => {
                                            setProductTypeForActive("tshirts");
                                            setProductMeta({ categorySlug: "tshirts" });

                                            const newBase = BASE_PRICE["tshirts"];
                                            const n = Number(productMeta.price);
                                            if (productMeta.price && !Number.isNaN(n) && n < newBase) {
                                                setProductMeta({ price: String(newBase) });
                                                setPriceWarn(`Minimum allowed is $${newBase}.`);
                                            } else {
                                                setPriceWarn("");
                                            }
                                        }}
                                    />
                                    <span className="text-base font-medium text-gray-900">Standard T-Shirt</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="ptype-price"
                                        checked={productType === "graphic-tshirt"}
                                        onChange={() => {
                                            setProductTypeForActive("graphic-tshirt");
                                            setProductMeta({ categorySlug: "graphic-tshirt" });

                                            const newBase = BASE_PRICE["graphic-tshirt"];
                                            const n = Number(productMeta.price);
                                            if (productMeta.price && !Number.isNaN(n) && n < newBase) {
                                                setProductMeta({ price: String(newBase) });
                                                setPriceWarn(`Minimum allowed is $${newBase}.`);
                                            } else {
                                                setPriceWarn("");
                                            }
                                        }}
                                    />
                                    <span className="text-base font-medium text-gray-900">Graphic T-Shirt</span>
                                </label>
                            </div>

                            {/* Base price display */}
                            <div className="text-sm mb-2">
                                Base price: <span className="font-semibold">${base}</span>
                            </div>

                            {/* Price input */}
                            <div className="flex items-center gap-3">
                                <div className="text-sm font-medium">Your price ($)</div>
                                <input
                                    type="number"
                                    min={base}
                                    step="0.01"
                                    value={productMeta.price || ""}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setProductMeta({ price: v });

                                        const n = Number(v);
                                        if (!v) {
                                            setPriceWarn("");
                                            return;
                                        }
                                        if (!Number.isNaN(n) && n < base) {
                                            setPriceWarn(`Minimum allowed is $${base}.`);
                                        } else {
                                            setPriceWarn("");
                                        }
                                    }}
                                    onBlur={() => {
                                        const n = Number(productMeta.price);
                                        if (!productMeta.price) return;
                                        if (!Number.isNaN(n) && n < base) {
                                            alert(`Price can’t be lower than $${base}.`);
                                            setProductMeta({ price: String(base) });
                                            setPriceWarn("");
                                        }
                                    }}
                                    className="w-40 border border-gray-300 rounded-lg bg-white px-4 py-2.5 text-base text-gray-900 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder={`${base}`}
                                />
                            </div>

                            {priceWarn ? <div className="mt-2 text-sm text-red-600">{priceWarn}</div> : null}
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN --- */}
                    <div>
                        <FieldGroup
                            label="Main Tag"
                            helperText="What (1) tag would I search to find your design?"
                        >
                            <StyledInput
                                placeholder="Main tag"
                            />
                        </FieldGroup>

                        <FieldGroup
                            label="Supporting Tags"
                            helperText="What other relevant tags would customers use to find your design?"
                        >
                            <StyledTextarea
                                className="w-full border border-gray-300 rounded bg-white p-3 text-base shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none min-h-[120px] placeholder:text-gray-300"
                                placeholder="Use commas to separate tags"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), commitTag())}
                            />
                            <div className="flex flex-wrap gap-2 mt-3">
                                {productMeta.tags?.map(t => (
                                    <span key={t} className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-sm font-medium text-blue-700">
                                        {t}
                                        <button onClick={() => removeTag(t)} className="ml-2 text-blue-500 hover:text-blue-700 font-bold text-base leading-none">×</button>
                                    </span>
                                ))}
                            </div>
                        </FieldGroup>

                        {/* Mature Content Section */}
                        <div className="mt-6">
                            <div className="text-lg font-semibold text-gray-900 mb-1.5 leading-snug">
                                Does this design contain Mature Content?
                            </div>
                            <div className="text-sm text-gray-600 mb-4">
                                Such as nudity or other adult themes. <span className="text-blue-600 font-medium cursor-pointer hover:underline">Check our FAQ</span> if unsure.
                            </div>
                            <div className="flex gap-6">
                                <label className="inline-flex items-center cursor-pointer group select-none">
                                    <input
                                        type="radio"
                                        name="mature"
                                        checked={productMeta.vendorMatureFlag === true}
                                        onChange={() => setProductMeta({ vendorMatureFlag: true })}
                                        className="w-5 h-5 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                                    />
                                    <span className="ml-2.5 text-base font-medium text-gray-900">Yes</span>
                                </label>
                                <label className="inline-flex items-center cursor-pointer group select-none">
                                    <input
                                        type="radio"
                                        name="mature"
                                        checked={productMeta.vendorMatureFlag === false}
                                        onChange={() => setProductMeta({ vendorMatureFlag: false })}
                                        className="w-5 h-5 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                                    />
                                    <span className="ml-2.5 text-base font-medium text-gray-900">No</span>
                                </label>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
