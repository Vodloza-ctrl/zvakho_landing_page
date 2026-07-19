// public/config.js
(function() {
  'use strict';

  var host = window.location.hostname;
  var apiBase;

  if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
    apiBase = 'http://localhost:8787/api';
  } else if (host.endsWith('zvakho.co.zw') || host === 'zvakho-universal-store-api.yasibomedia.workers.dev') {
    apiBase = 'https://zvakho-universal-store-api.yasibomedia.workers.dev';
  } else {
    apiBase = window.location.origin + '/api';
  }

  window.ZVAKHO_CONFIG = {
    apiBase: apiBase,
    whatsappNumber: "263719362231",
    refreshMs: 20000
  };

  console.log('🔧 ZVAKHO Config loaded:', window.ZVAKHO_CONFIG);
})();