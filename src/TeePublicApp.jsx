import { useRef } from "react";
import DesignDetailsForm from "./components/DesignDetailsForm";
import ProductRow from "./components/ProductRow";
//import { Button } from "./components/ui/button";
import { Button } from "@/components/ui/button";
import { useDesignerStore } from "./state/useDesignerStore";
import { uploadFilesToCanvas } from "./utils/uploadToCanvas";
import DesignNav from "./components/DesignNav";

export default function TeePublicApp() {
    const fileRef = useRef(null);
    const { canvas, addMultipleSame, addMultipleSeparate } = useDesignerStore();
    const onPick = () => fileRef.current?.click();
    const onFilesSelected = async (e) => {
        const files = e.target.files;
        await uploadFilesToCanvas({
            files,
            canvas,
            addMultipleSame,
            addMultipleSeparate,
        });
        e.target.value = "";
    };

    return (
        <div className="min-h-screen bg-slate-200">

            {/* 1. NAVBAR */}
            <div className="bg-[#1c2432] text-white h-16 flex items-center px-8 shadow-md shrink-0">
                <div className="font-bold text-2xl tracking-tighter mr-auto">arton360</div>
                <div className="flex gap-6 text-sm font-medium">
                    <span className="opacity-70">Shop</span>
                    <span className="text-white hover:text-blue-300 cursor-pointer">Create</span>
                </div>
                <Button
                    className="ml-6 bg-[#6c85e3] hover:bg-[#5b73d1] text-white font-bold"
                    onClick={() => {
                        if (!canvas) {
                        alert("Canvas is still loading. Please wait 1–2 seconds and try again.");
                        return;
                        }
                        onPick();
                    }}
                    disabled={!canvas}
                >
                Upload Art
                </Button>

            </div>
            {/* Hidden file input (triggered by Upload Art button) */}
            <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg"
                multiple
                className="hidden"
                onChange={onFilesSelected}
            />

            {/* 2. MAIN CONTENT AREA - Centered Column */}
            <div className="max-w-6xl mx-auto py-8 px-4">

                {/* HEADER: UPLOAD A DESIGN */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-[#45b452] mb-2">Upload A Design</h1>
                    <div className="text-blue-600 text-sm font-semibold cursor-pointer">Need help uploading?</div>
                </div>

                {/* MAIN ARTWORK PREVIEW (Top) 
             In TeePublic this is the raw artwork. 
             For us, we can show a placeholder or the "Upload Art" dropzone if empty.
         */}
                <div className="flex justify-center mb-10">
                    <div className="w-[300px] h-[300px] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-white border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center p-4 text-center">
                        <div className="text-6xl text-gray-300 mb-2">🖼️</div>
                        <div className="text-gray-400 text-sm font-medium">Your Artwork Preview</div>
                    </div>
                </div>

                {/* 3. DESIGN DETAILS FORM (Gray Box) */}
                <DesignDetailsForm />

                {/* DESIGN NAV (for multiple uploads) */}
                <DesignNav />

                {/* 4. PRODUCT ROW (White Box with Canvas) */}
                <ProductRow />

            </div>
        </div>
    );
}
