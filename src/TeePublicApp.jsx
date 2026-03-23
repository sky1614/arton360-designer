import { useRef, useEffect } from "react";
import DesignDetailsForm from "./components/DesignDetailsForm";
import ProductRow from "./components/ProductRow";
//import { Button } from "./components/ui/button";
import { Button } from "@/components/ui/button";
import { useDesignerStore } from "./state/useDesignerStore";
import { uploadFilesToCanvas } from "./utils/uploadToCanvas";
//import DesignNav from "./components/DesignNav";

export default function TeePublicApp() {
    const fileRef = useRef(null);

    // Send height to WordPress parent for iframe resizing
    useEffect(() => {
        const sendHeight = () => {
            const root = document.getElementById('root');
            const content = root?.firstElementChild;
            const h = content ? content.offsetHeight : root?.offsetHeight || 0;
            if (h > 100) {
                window.parent.postMessage({ type: 'resize', height: h }, '*');
            }
        };
        sendHeight();
        const interval = setInterval(sendHeight, 1000);
        return () => clearInterval(interval);
    }, []);

    const { canvas, addMultipleSame, addMultipleSeparate, tshirtDesigns, activeDesignIndex } = useDesignerStore();
    const active = tshirtDesigns?.[activeDesignIndex];
    const activeSide = active?.sides?.front;
    const previewUrl =
        activeSide?.designs?.find((d) => d?.type === "image" && d?.url)?.url || null;

    const onPick = () => fileRef.current?.click();
    const onFilesSelected = async (e) => {
        const files = e.target.files;
        const attemptUpload = async (triesLeft = 10) => {
            const res = await uploadFilesToCanvas({
                files,
                canvas,
                addMultipleSame,
                addMultipleSeparate,
            });

            if (res?.ok) return;

            if (res?.reason === "PRINT_AREA_NOT_READY" && triesLeft > 0) {
                setTimeout(() => attemptUpload(triesLeft - 1), 250);
                return;
            }

            alert("Upload failed. Canvas not ready.");
        };

        attemptUpload();
        e.target.value = "";
    };


    return (
        <div className="bg-slate-200">

            {/* 1. NAVBAR */}
            <div className="bg-[#1c2432] text-white h-16 flex items-center px-8 shadow-md shrink-0 justify-end">
                {/* <div className="font-bold text-2xl tracking-tighter mr-auto">arton360</div>
                <div className="flex gap-6 text-sm font-medium">
                    <span className="opacity-70">Shop</span>
                    <span className="text-white hover:text-blue-300 cursor-pointer">Create</span>
                </div> */}
                <Button
                    className="bg-[#6c85e3] hover:bg-[#5b73d1] text-white font-bold"
                    onClick={onPick}
                >
                Upload Art
                </Button>

            </div>
            {/* Hidden file input (triggered by Upload Art button) */}
            <input
                ref={fileRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg"
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
                    <div className="w-[300px] h-[300px] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-white border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center p-4 text-center overflow-hidden">
                        {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Artwork Preview"
                            className="w-full h-full object-contain"
                        />
                        ) : (
                        <>
                            <div className="text-6xl text-gray-300 mb-2">🖼️</div>
                            <div className="text-gray-400 text-sm font-medium">
                            Your Artwork Preview
                            </div>
                        </>
                        )}
                    </div>
                </div>

                {/* Resolution requirements */}
                <div className="text-center text-sm text-gray-600 mt-3 space-y-1">
                    <p>High-resolution <strong>JPG</strong> or transparent <strong>PNG</strong> at <strong>300dpi</strong>.</p>
                    <p>Minimum dimensions of at least <strong>2200px by 3000px</strong> (not including outer transparent pixels).</p>
                    <p>To enable all products, your file must be at least <strong>4000px by 5455px</strong>.</p>
                    <p className="text-blue-600 font-semibold cursor-pointer">See our design guide for help.</p>
                </div>

                {/* 3. DESIGN DETAILS FORM (Gray Box) */}
                <DesignDetailsForm />

                {/* 4. PRODUCT ROW (White Box with Canvas) */}
                {tshirtDesigns.length > 0 ? <ProductRow /> : null}
            </div>
        </div>
    );
}
