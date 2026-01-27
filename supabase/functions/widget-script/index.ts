import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

// Widget embed script template
const widgetScript = (baseUrl: string) => `
(function(window, document) {
  'use strict';

  const WIDGET_URL = '${baseUrl}';
  let iframe = null;
  let isOpen = false;
  let config = {};

  function createIframe(orgId) {
    if (iframe) return;

    iframe = document.createElement('iframe');
    iframe.src = WIDGET_URL + '/widget/' + orgId;
    iframe.style.cssText = [
      'position: fixed',
      'bottom: 0',
      'right: 0',
      'width: 100%',
      'height: 100%',
      'max-width: 420px',
      'max-height: 620px',
      'border: none',
      'z-index: 2147483647',
      'background: transparent',
      'pointer-events: none'
    ].join(';');
    iframe.allow = 'microphone; camera';
    iframe.title = 'Chat Widget';
    
    document.body.appendChild(iframe);
    window.addEventListener('message', handleMessage);
  }

  function handleMessage(event) {
    if (!event.data || typeof event.data !== 'object') return;
    
    var type = event.data.type;
    var payload = event.data.payload;

    switch (type) {
      case 'widget:open':
        isOpen = true;
        if (iframe) iframe.style.pointerEvents = 'auto';
        break;
      case 'widget:close':
        isOpen = false;
        if (iframe) iframe.style.pointerEvents = 'none';
        break;
      case 'widget:resize':
        if (iframe && payload) {
          iframe.style.width = payload.width || '100%';
          iframe.style.height = payload.height || '100%';
        }
        break;
    }
  }

  function init(options) {
    if (!options || !options.orgId) {
      console.error('PrivyWidget: orgId is required');
      return;
    }

    config = options;
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        createIframe(options.orgId);
      });
    } else {
      createIframe(options.orgId);
    }
  }

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

  if (window.privyWidget && window.privyWidget.q) {
    window.privyWidget.q.forEach(function(args) {
      window.privyWidget.apply(null, args);
    });
  }

})(window, document);
`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the origin URL to construct the widget URL
    const url = new URL(req.url);
    const origin = req.headers.get('origin') || req.headers.get('referer') || '';
    
    // Use the Supabase URL to construct the app URL
    // In production, this would be the deployed app URL
    const appUrl = Deno.env.get('APP_URL') || origin || 'https://privydesk.com';
    
    const script = widgetScript(appUrl);
    
    return new Response(script, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error serving widget script:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to serve widget script' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
