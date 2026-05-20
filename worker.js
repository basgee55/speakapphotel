// Cloudflare Worker — CORS proxy voor Anthropic + OpenAI
// Routes:
//   /openai/*  → https://api.openai.com/*  (strip /openai prefix)
//   alles anders → https://api.anthropic.com/*
export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);
    let targetUrl;

    if (url.pathname.startsWith('/openai/')) {
      targetUrl = 'https://api.openai.com' + url.pathname.replace('/openai', '') + url.search;
    } else {
      targetUrl = 'https://api.anthropic.com' + url.pathname + url.search;
    }

    const skipHeaders = ['host', 'cf-ray', 'cf-connecting-ip', 'cf-ipcountry', 'cf-visitor'];
    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: new Headers(
        [...request.headers.entries()].filter(([k]) => !skipHeaders.includes(k.toLowerCase()))
      ),
      body: request.body,
    });

    const response = await fetch(proxyRequest);
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};
