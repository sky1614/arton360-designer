// // src/utils/fit.js
// export function fitIntoBox(naturalW, naturalH, box, { paddingRatio = 0.06, maxScale = Infinity } = {}) {
//   const P = Math.floor(Math.min(box.width, box.height) * paddingRatio);
//   const Uw = box.width - 2 * P;
//   const Uh = box.height - 2 * P;

//   const s0 = Math.min(Uw / naturalW, Uh / naturalH);
//   const s = Math.min(s0, maxScale);

//   const Wt = naturalW * s;
//   const Ht = naturalH * s;

//   const left = box.left + (box.width - Wt) / 2;
//   const top = box.top + (box.height - Ht) / 2;

//   return { scale: s, left, top, width: Wt, height: Ht, padding: P };
// }


// Fit a W×H image inside the PRINT box with optional padding (as ratio of min(width,height))
export function fitIntoBox(W, H, PRINT, opts = {}) {
  const pad = Math.max(0, Math.min(1, opts.paddingRatio ?? 0.06));
  const innerW = PRINT.width * (1 - pad * 2);
  const innerH = PRINT.height * (1 - pad * 2);

  const scale = Math.min(innerW / W, innerH / H);
  const scaledW = W * scale;
  const scaledH = H * scale;

  const left = PRINT.left + (PRINT.width - scaledW) / 2;
  const top  = PRINT.top  + (PRINT.height - scaledH) / 2;

  return { scale, left, top, scaledW, scaledH };
}
