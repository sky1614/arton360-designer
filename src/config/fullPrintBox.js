// src/config/fullPrintBox.js
//
// Full-shirt bounding boxes for FRONT & BACK.
// These cover almost the entire torso area,
// but intentionally exclude sleeves.

const FULL_PRINT_FRONT = {
  left: 25,     // same as mockup offset
  top: 50,
  width: 550,   // fill nearly entire width
  height: 700,  // fill nearly entire height
};

const FULL_PRINT_BACK = {
  left: 25,
  top: 50,
  width: 550,
  height: 700,
};

export default {
  FULL_PRINT_FRONT,
  FULL_PRINT_BACK,
};
