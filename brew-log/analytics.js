// Vercel Web Analytics - Inline implementation
// This initializes the Vercel Web Analytics tracking

(function() {
  // Initialize the analytics queue
  if (window.va) return;
  
  window.va = function() {
    (window.vaq = window.vaq || []).push(arguments);
  };

  // Set the mode (auto-detect environment)
  try {
    window.vam = (function() {
      try {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
          return 'development';
        }
      } catch(e) {}
      return 'production';
    })();
  } catch(e) {
    window.vam = 'production';
  }

  // Load the analytics script
  var script = document.createElement('script');
  script.src = '/_vercel/insights/script.js';
  script.defer = true;
  
  // Add to head when DOM is ready
  if (document.head) {
    document.head.appendChild(script);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      document.head.appendChild(script);
    });
  }
})();
