// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import TeePublicApp from "./TeePublicApp.jsx";
import { useDesignerStore } from "./state/useDesignerStore";
import "./index.css";

// ===============================
// Listen for config from WordPress
// ===============================
if (typeof window !== "undefined" && !window.ARTON360_LISTENER_ATTACHED) {
  window.ARTON360_LISTENER_ATTACHED = true; // avoid duplicates on HMR

  window.addEventListener("message", (event) => {
    try {
      if (!event.data || event.data.type !== "ARTON360_CONFIG") return;

      // Save config so DetailsPane (and others) can read it
      window.ARTON360 = event.data;
      console.log("[ARTON360] Config received:", window.ARTON360);

      // Fetch available colors from WordPress taxonomy (async, non-blocking)
      if (event.data.site) {
        useDesignerStore.getState().fetchColorsFromWP(event.data.site);
      }
    } catch (err) {
      console.error("[ARTON360] Error handling config message", err);
    }
  });
}

// ===============================
// Mount React App
// ===============================
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TeePublicApp />
  </React.StrictMode>
);
