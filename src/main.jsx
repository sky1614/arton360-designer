// ---- NEW: listen for config from WordPress parent ----
if (typeof window !== 'undefined' && !window.__ARTON360_LISTENER_ATTACHED__) {
  window.__ARTON360_LISTENER_ATTACHED__ = true;

  window.addEventListener('message', (event) => {
    // OPTIONAL: lock to your WP origin
    // if (event.origin !== 'https://arton360.com') return;

    const data = event.data;
    if (!data || data.type !== 'ARTON360_CONFIG') return;

    window.ARTON360 = {
      site: data.site,        // e.g. https://arton360.com
      apiBase: data.apiBase,  // e.g. https://arton360.com/wp-json
      nonce: data.nonce,
      vendorId: data.vendorId,
    };

    console.log('[ARTON360] Config received:', window.ARTON360);
  });
}

// ---- React bootstrap ----
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
