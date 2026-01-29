// Widget embed script
// This creates an iframe that loads the chat widget

(function(window, document) {
  'use strict';

  const WIDGET_URL = '__WIDGET_URL__';
  let iframe = null;
  let isOpen = false;
  let config = {};

  // Create iframe
  function createIframe(orgId) {
    if (iframe) return;

    iframe = document.createElement('iframe');
    iframe.src = `${WIDGET_URL}/widget/${orgId}`;
    iframe.style.cssText = `
      position: fixed;
      bottom: 0;
      right: 0;
      width: 100%;
      height: 100%;
      max-width: 400px;
      max-height: 600px;
      border: none;
      z-index: 2147483647;
      background: transparent;
      pointer-events: none;
    `;
    iframe.allow = 'microphone; camera';
    iframe.title = 'Chat Widget';
    
    document.body.appendChild(iframe);

    // Listen for messages from iframe
    window.addEventListener('message', handleMessage);
  }

  // Handle messages from widget
  function handleMessage(event) {
    if (!event.data || typeof event.data !== 'object') return;
    
    const { type, payload } = event.data;

    switch (type) {
      case 'widget:open':
        isOpen = true;
        if (iframe) {
          iframe.style.pointerEvents = 'auto';
        }
        break;
      case 'widget:close':
        isOpen = false;
        if (iframe) {
          iframe.style.pointerEvents = 'none';
        }
        break;
      case 'widget:resize':
        if (iframe && payload) {
          iframe.style.width = payload.width || '100%';
          iframe.style.height = payload.height || '100%';
        }
        break;
    }
  }

  // Initialize widget
  function init(options) {
    if (!options || !options.orgId) {
      console.error('PrivyWidget: orgId is required');
      return;
    }

    config = options;
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        createIframe(options.orgId);
      });
    } else {
      createIframe(options.orgId);
    }
  }

  // Public API
  window.privyWidget = function(action, options) {
    switch (action) {
      case 'init':
        init(options);
        break;
      case 'open':
        if (iframe) {
          iframe.contentWindow.postMessage({ type: 'widget:open' }, '*');
        }
        break;
      case 'close':
        if (iframe) {
          iframe.contentWindow.postMessage({ type: 'widget:close' }, '*');
        }
        break;
      case 'destroy':
        if (iframe) {
          iframe.remove();
          iframe = null;
        }
        window.removeEventListener('message', handleMessage);
        break;
    }
  };

  // Process any queued commands
  if (window.privyWidget && window.privyWidget.q) {
    window.privyWidget.q.forEach(function(args) {
      window.privyWidget.apply(null, args);
    });
  }

})(window, document);
