import { fitIntoBox } from "./fit";

const MIN_W = 2200;
const MIN_H = 3000;
const FULL_W = 4000;
const FULL_H = 5455;
const MAX_BATCH = 50;

const getDims = (url) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () =>
      resolve({
        w: img.naturalWidth || img.width,
        h: img.naturalHeight || img.height,
      });
    img.onerror = () => resolve({ w: 0, h: 0 });
    img.crossOrigin = "anonymous";
    img.src = url;
  });

export async function uploadFilesToCanvas({
  files,
  canvas, // unused for Option A, kept so TeePublicApp doesn't break
  addMultipleSame, // unused for Option A
  addMultipleSeparate,
}) {
  let list = Array.from(files || []);
  if (!list.length) return { ok: false, reason: "NO_FILES" };

  if (list.length > MAX_BATCH) {
    alert(`Only first ${MAX_BATCH} files will be processed.`);
    list = list.slice(0, MAX_BATCH);
  }

  const staged = await Promise.all(
    list.map(async (file) => {
      const url = URL.createObjectURL(file);
      const { w, h } = await getDims(url);
      return { file, url, w, h };
    })
  );

  // Reject unreadable images
  const readable = staged.filter(({ w, h }) => w > 0 && h > 0);
  if (!readable.length) {
    alert("Could not read image dimensions. Try a different file.");
    return { ok: false, reason: "BAD_IMAGES" };
  }

  // Reject images below minimum 2200x3000
  const tooSmall = readable.filter(({ w, h }) => w < MIN_W || h < MIN_H);
  const accepted = readable.filter(({ w, h }) => w >= MIN_W && h >= MIN_H);

  if (tooSmall.length > 0) {
    alert(
      `${tooSmall.length} image(s) rejected — minimum size is ${MIN_W}x${MIN_H}px.\n` +
      tooSmall.map(({ file, w, h }) => `  ${file.name}: ${w}x${h}px`).join("\n")
    );
  }

  if (!accepted.length) {
    return { ok: false, reason: "TOO_SMALL" };
  }

  // Warn if below 4000x5455 (not all products will be enabled)
  const belowFull = accepted.filter(({ w, h }) => w < FULL_W || h < FULL_H);
  if (belowFull.length > 0) {
    alert(
      `Note: ${belowFull.length} image(s) are below ${FULL_W}x${FULL_H}px.\n` +
      `Some products may not be available for these designs.`
    );
  }

  const items = accepted.map(({ url }) => ({ url }));

  // ✅ Option A: ALWAYS create separate Standard T-shirts
  addMultipleSeparate(items);

  return { ok: true };
}


//   let mode = "same";
//   if (accepted.length > 1) {
//     mode = window.confirm(
//       "Put ALL artworks on SAME product?\nCancel = SEPARATE products."
//     )
//       ? "same"
//       : "different";
//   }

//   const fm = await import("fabric");
//   const fabric = fm.fabric || fm.default || fm;

//   // ✅ IMPORTANT: always use the real print area already computed by CanvasArea
//   const box = canvas.__printArea;
//   if (!box) {
//     // IMPORTANT: don't alert here. Caller will retry.
//     return { ok: false, reason: "PRINT_AREA_NOT_READY" };
//   }


//   if (mode === "same") {
//     addMultipleSame(items);

//     for (let idx = 0; idx < items.length; idx++) {
//       const d = items[idx];
//       await new Promise((resolve) => {
//         fabric.Image.fromURL(
//           d.url,
//           (img) => {
//             const W = img._element?.naturalWidth || img.width;
//             const H = img._element?.naturalHeight || img.height;

//             const { scale, left, top } = fitIntoBox(W, H, box, {
//               paddingRatio: 0.06,
//             });

//             img.set({
//               originX: "left",
//               originY: "top",
//               selectable: true,
//               evented: true,
//               hasControls: true,
//               hasBorders: true,
//               lockMovementX: false,
//               lockMovementY: false,
//             });

//             img.scale(scale);
//             img.set({
//               left: left + idx * 10,
//               top: top + idx * 10,
//             });

//             img.setCoords();
//             canvas.add(img);
//             canvas.requestRenderAll();
//             resolve(null);
//           },
//           { crossOrigin: "anonymous" }
//         );
//       });
//     }
//   } else {
//     addMultipleSeparate(items.map((i) => ({ ...i })));
//   }
//   return { ok: true };
//}
