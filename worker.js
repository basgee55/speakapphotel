// Cloudflare Worker — CORS proxy voor Anthropic API
// Deploy via: https://dash.cloudflare.com → Workers → Create → Plak deze code
export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);
    const anthropicUrl = 'https://api.anthropic.com' + url.pathname + url.search;

    const proxyRequest = new Request(anthropicUrl, {
      method: request.method,
      headers: new Headers(
        [...request.headers.entries()].filter(
          ([k]) => !['host', 'cf-ray', 'cf-connecting-ip', 'cf-ipcountry', 'cf-visitor'].includes(k.toLowerCase())
        )
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
