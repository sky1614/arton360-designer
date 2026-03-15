// // KEEP YOUR ORIGINAL PRINT AREA EXACTLY AS IT IS
// const PRINT = { left: 210, top: 200, width: 180, height: 280 };
// export default PRINT;

// // ===== FULL SHIRT PRINT AREAS (added new) =====
// export const FULL_PRINT_FRONT = {
//   left: 25,
//   top: 50,
//   width: 550,
//   height: 700,
// };

// export const FULL_PRINT_BACK = {
//   left: 25,
//   top: 50,
//   width: 550,
//   height: 700,
// };

// // ===== Helper: decide which print area to use =====
// export function getPrintArea(isFullPrint, side = "front") {
//   if (isFullPrint) {
//     return side === "back" ? FULL_PRINT_BACK : FULL_PRINT_FRONT;
//   }
//   return PRINT; // old chest print box
// }

const PRINT = { left: 200, top: 200, width: 210, height: 300 };
export default PRINT;

export const FULL_PRINT_FRONT = { left: 25, top: 50, width: 550, height: 700 };
export const FULL_PRINT_BACK  = { left: 25, top: 50, width: 550, height: 700 };

export function getPrintArea(isFullPrint, side = "front") {
  if (isFullPrint) {
    return side === "back" ? FULL_PRINT_BACK : FULL_PRINT_FRONT;
  }
  return PRINT;
}
