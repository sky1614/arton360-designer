// src/utils/saveDesign.js
// Shared save/publish logic used by both ProductRow and DetailsPane

import { useDesignerStore } from "../state/useDesignerStore";

function getWpConfig() {
  if (typeof window === "undefined") return {};
  return window.ARTON360 || {};
}

/**
 * Export the full canvas as a PNG (with T-shirt background).
 * Used as the product featured image / thumbnail.
 */
export function exportPreviewPNG(canvas) {
  try {
    const all = canvas.getObjects();
    const guides = all.filter((o) => o._isGuide);

    // hide guides
    guides.forEach((g) => g.set({ opacity: 0 }));
    canvas.discardActiveObject();
    canvas.renderAll();

    const png = canvas.toDataURL({
      format: "png",
      multiplier: 2,
      enableRetinaScaling: true,
    });

    // restore guides
    guides.forEach((g) => g.set({ opacity: 1 }));
    canvas.renderAll();

    return png;
  } catch (e) {
    console.error("exportPreviewPNG error:", e);
    return null;
  }
}

/**
 * Export artwork-only PNG (transparent background, no T-shirt mockup).
 * Used as the overlay on the frontend product page so it can be
 * composited on top of any color base.
 */
export function exportArtworkPNG(canvas) {
  try {
    const all = canvas.getObjects();
    const guides = all.filter((o) => o._isGuide);

    // Save current background
    const savedBg = canvas.backgroundImage;
    const savedBgColor = canvas.backgroundColor;

    // Remove background (make transparent)
    canvas.backgroundImage = null;
    canvas.backgroundColor = "transparent";

    // Hide guides
    guides.forEach((g) => g.set({ opacity: 0 }));
    canvas.discardActiveObject();
    canvas.renderAll();

    const png = canvas.toDataURL({
      format: "png",
      multiplier: 2,
      enableRetinaScaling: true,
    });

    // Restore background
    canvas.backgroundImage = savedBg;
    canvas.backgroundColor = savedBgColor;

    // Restore guides
    guides.forEach((g) => g.set({ opacity: 1 }));
    canvas.renderAll();

    return png;
  } catch (e) {
    console.error("exportArtworkPNG error:", e);
    return null;
  }
}

/**
 * Save/publish the active design to WordPress.
 * Returns { success: true, data } or { success: false, error }.
 */
export async function saveDesignToWordPress(canvas) {
  console.log("=== SAVE STARTED ===");

  if (!canvas) {
    return { success: false, error: "Canvas not ready" };
  }

  const store = useDesignerStore.getState();
  if (!store.isMetaValid()) {
    return { success: false, error: "Please add Title and Category." };
  }

  // Generate both PNGs
  const previewPng = exportPreviewPNG(canvas);
  if (!previewPng) {
    return { success: false, error: "Failed to generate preview image" };
  }

  const artworkPng = exportArtworkPNG(canvas);
  // artworkPng is optional - we proceed even if it fails

  const config = getWpConfig();
  console.log("WP Config received:", {
    hasSite: !!config.site,
    hasNonce: !!config.nonce,
    hasVendorId: !!config.vendorId,
    site: config.site,
  });

  if (!config.site || !config.nonce) {
    return {
      success: false,
      error: `WordPress connection not ready.\nSite: ${!!config.site}\nNonce: ${!!config.nonce}`,
    };
  }

  const url = `${config.site}/wp-json/arton360/v1/save-design`;
  console.log("Posting to URL:", url);

  const { designMetas, tshirtDesigns, activeDesignIndex } = store;
  const activeDesign = tshirtDesigns[activeDesignIndex];
  const productMeta = designMetas[activeDesignIndex];

  const payload = {
    designName: productMeta.title || "Untitled Design",
    tshirtDesigns: [activeDesign],
    vendorSelectedColor: activeDesign?.color || "white",
    previewPng,
    artworkPng: artworkPng || null,
    printBox: { left: 210, top: 200, width: 180, height: 280 },
    productMeta: {
      title: productMeta.title,
      description: productMeta.description || "",
      categorySlug: productMeta.categorySlug || "tshirts",
      tags: productMeta.tags || [],
      price: parseFloat(productMeta.price) || 25,
      currency: productMeta.currency || "USD",
      artType: productMeta.artType || "",
      vendorMatureFlag: productMeta.vendorMatureFlag || false,
    },
  };

  console.log("Payload preview:", {
    designName: payload.designName,
    vendorSelectedColor: payload.vendorSelectedColor,
    hasPreviewPng: !!payload.previewPng,
    hasArtworkPng: !!payload.artworkPng,
    previewPngLength: payload.previewPng?.length,
    productMeta: payload.productMeta,
    designsCount: payload.tshirtDesigns?.length,
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
      ok: response.ok,
    });

    const data = await response.json();
    console.log("Response data:", data);

    if (response.ok && data.ok) {
      return { success: true, data };
    } else {
      const errorMsg =
        data.message || data.code || response.statusText || "Unknown error";
      return { success: false, error: errorMsg, data };
    }
  } catch (error) {
    console.error("Network/Fetch error:", error);
    return { success: false, error: error.message };
  }
}
