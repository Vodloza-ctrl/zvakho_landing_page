// ============================================
// ZVAKHO STORE - Configuration
// ============================================

(function() {
  'use strict';

  // Determine API base URL
  // If you're deploying to the same domain, use relative path:
  //   /api
  // If your API is on a different domain, set the full URL here:
  //   https://zvakho-api-v2.workers.dev/api
  var apiBase = window.location.origin + '/api';

  // Optional: Override with environment variable if needed
  // You can also set this manually for staging/production
  // For example:
  // if (window.location.hostname === 'zvakho.co.zw') {
  //   apiBase = 'https://zvakho-api-v2.workers.dev/api';
  // }

  window.ZVAKHO_CONFIG = {
    apiBase: apiBase,
    version: '2.0.0',
    environment: window.location.hostname === 'localhost' ? 'development' : 'production'
  };

  console.log('🔧 ZVAKHO Config loaded:', window.ZVAKHO_CONFIG);
})();