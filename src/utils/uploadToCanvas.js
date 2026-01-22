import { fitIntoBox } from "./fit";

const MAX_W = 2200;
const MAX_H = 3000;
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
  canvas,
  addMultipleSame,
  addMultipleSeparate,
}) {
  if (!canvas) return;

  let list = Array.from(files || []);
  if (!list.length) return;

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

  const accepted = staged.filter(
    ({ w, h }) => w > 0 && h > 0 && w >= MAX_W && h >= MAX_H
  );

  if (!accepted.length) return;

  const items = accepted.map(({ url }) => ({ url }));

  let mode = "same";
  if (accepted.length > 1) {
    mode = window.confirm(
      "Put ALL artworks on SAME product?\nCancel = SEPARATE products."
    )
      ? "same"
      : "different";
  }

  const fm = await import("fabric");
  const fabric = fm.fabric || fm.default || fm;

  // ✅ IMPORTANT: always use the real print area already computed by CanvasArea
  const box = canvas.__printArea;
  if (!box) {
    alert("Print area not ready yet. Try again in a second.");
    return;
  }

  if (mode === "same") {
    addMultipleSame(items);

    for (let idx = 0; idx < items.length; idx++) {
      const d = items[idx];
      await new Promise((resolve) => {
        fabric.Image.fromURL(
          d.url,
          (img) => {
            const W = img._element?.naturalWidth || img.width;
            const H = img._element?.naturalHeight || img.height;

            const { scale, left, top } = fitIntoBox(W, H, box, {
              paddingRatio: 0.06,
            });

            img.set({
              originX: "left",
              originY: "top",
              selectable: true,
              evented: true,
              hasControls: true,
              hasBorders: true,
              lockMovementX: false,
              lockMovementY: false,
            });

            img.scale(scale);
            img.set({
              left: left + idx * 10,
              top: top + idx * 10,
            });

            img.setCoords();
            canvas.add(img);
            canvas.requestRenderAll();
            resolve(null);
          },
          { crossOrigin: "anonymous" }
        );
      });
    }
  } else {
    addMultipleSeparate(items.map((i) => ({ ...i })));
  }
}
