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

                {/* 3. DESIGN DETAILS FORM */}
                <DesignDetailsForm />

                {/* 4. PRODUCT ROW */}
                {tshirtDesigns.length > 0 ? <ProductRow /> : null}
            </div>

            {/* FOOTER */}
            <div style={{ background: '#3b3bbe', color: '#fff', padding: '50px 20px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0' }}>Subscribe to Our Newsletter</h2>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: '0 0 20px 0' }}>For sales, exclusive content, and more!</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', maxWidth: '500px', margin: '0 auto' }}>
                    <input type="email" placeholder="Email Address" style={{ padding: '12px 16px', border: 'none', borderRadius: '4px', fontSize: '14px', width: '280px', outline: 'none' }} />
                    <button style={{ padding: '12px 24px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>Subscribe</button>
                </div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', margin: '12px 0 0 0' }}>By clicking Subscribe, you agree to our <a href="#" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'underline' }}>Privacy Policy</a></p>
            </div>
            <div style={{ background: '#1a1a2e', color: '#ccc', padding: '40px 20px' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '30px' }}>
                    <div style={{ minWidth: '200px' }}>
                        <h3 style={{ color: '#fff', fontSize: '18px', margin: '0 0 8px 0' }}>ArtOn360</h3>
                        <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#aaa', margin: '0 0 4px 0' }}>GuaranTee</p>
                        <p style={{ fontSize: '12px', color: '#888', margin: '0 0 12px 0' }}>Est. 2024</p>
                        <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.6, margin: 0 }}>Don't love it? We'll fix it. For free.<br />100% Free Exchange.</p>
                    </div>
                    <div style={{ minWidth: '140px' }}>
                        <h4 style={{ color: '#fff', fontSize: '14px', margin: '0 0 12px 0' }}>Support</h4>
                        <a href="https://arton360.com/contact-us/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: '#aaa', textDecoration: 'none', fontSize: '13px', marginBottom: '8px' }}>Contact Us</a>
                        <a href="https://arton360.com/faq/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: '#aaa', textDecoration: 'none', fontSize: '13px', marginBottom: '8px' }}>FAQ</a>
                        <a href="https://arton360.com/refunds-returns/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: '#aaa', textDecoration: 'none', fontSize: '13px', marginBottom: '8px' }}>Refunds &amp; Returns</a>
                        <a href="https://arton360.com/shipping-info/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: '#aaa', textDecoration: 'none', fontSize: '13px', marginBottom: '8px' }}>Shipping Info</a>
                        <a href="https://arton360.com/size-chart/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: '#aaa', textDecoration: 'none', fontSize: '13px', marginBottom: '8px' }}>Size Chart</a>

                    </div>
                    <div style={{ minWidth: '140px' }}>
                        <h4 style={{ color: '#fff', fontSize: '14px', margin: '0 0 12px 0' }}>About Us</h4>
                        <a href="https://arton360.com/shop-2/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: '#aaa', textDecoration: 'none', fontSize: '13px', marginBottom: '8px' }}>All Designs</a>
                        <a href="https://arton360.com/vendor-dashboard/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: '#aaa', textDecoration: 'none', fontSize: '13px', marginBottom: '8px' }}>Artist Signup</a>
                        <a href="https://arton360.com/about-us/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: '#aaa', textDecoration: 'none', fontSize: '13px', marginBottom: '8px' }}>About Us</a>
                        <a href="mailto:dmca@arton360.com" style={{ display: 'block', color: '#aaa', textDecoration: 'none', fontSize: '13px', marginBottom: '8px' }}>DMCA Copyright</a>
                        <a href="https://arton360.com/design-guide/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: '#aaa', textDecoration: 'none', fontSize: '13px', marginBottom: '8px' }}>ArtOn360 Blog</a>
                        <a href="https://arton360.com/upload-a-design/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: '#aaa', textDecoration: 'none', fontSize: '13px', marginBottom: '8px' }}>Upload a Design</a>

                    </div>
                    <div style={{ minWidth: '140px' }}>
                        <h4 style={{ color: '#fff', fontSize: '14px', margin: '0 0 12px 0' }}>Policies</h4>
                        <a href="https://arton360.com/sign-up/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: '#aaa', textDecoration: 'none', fontSize: '13px', marginBottom: '8px' }}>My Account</a>
                        <a href="https://arton360.com/design-guide/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: '#aaa', textDecoration: 'none', fontSize: '13px', marginBottom: '8px' }}>ArtOn360 Blog</a>
                        <a href="https://arton360.com/upload-a-design/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: '#aaa', textDecoration: 'none', fontSize: '13px', marginBottom: '8px' }}>Upload a Design</a>
                        
                    </div>
                </div>
                <div style={{ maxWidth: '1000px', margin: '30px auto 0', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                    <a href="#" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: '#333', borderRadius: '50%', textDecoration: 'none', fontSize: '16px', color: '#fff' }}>f</a>
                    <a href="#" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: '#333', borderRadius: '50%', textDecoration: 'none', fontSize: '16px', color: '#fff' }}>X</a>
                    <a href="#" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: '#333', borderRadius: '50%', textDecoration: 'none', fontSize: '16px', color: '#fff' }}>in</a>
                    <a href="#" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: '#333', borderRadius: '50%', textDecoration: 'none', fontSize: '16px', color: '#fff' }}>ig</a>
                    <a href="#" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: '#333', borderRadius: '50%', textDecoration: 'none', fontSize: '16px', color: '#fff' }}>P</a>
                </div>
                <div style={{ maxWidth: '1000px', margin: '24px auto 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #333', paddingTop: '20px' }}>
                    <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>We Accept: Visa | Mastercard | Amex | Discover | PayPal | Apple Pay</p>
                    <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>© 2026 arton360 | <a href="#" style={{ color: '#888', textDecoration: 'none' }}>Privacy Policy</a> | <a href="#" style={{ color: '#888', textDecoration: 'none' }}>Terms</a></p>

                </div>
            </div>
        </div>
    );
}
