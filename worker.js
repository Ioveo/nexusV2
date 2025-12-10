// worker.js

/**
 * NEXUS Backend Worker
 * Handles API requests for R2/KV and serves Static Assets for SPA
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-password',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Handle CORS Preflight (Global)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 2. API Routes - INTERCEPT FIRST
    if (url.pathname.startsWith('/api/')) {
      try {
        // --- AUTH CHECK HELPER ---
        const checkAuth = () => {
          const providedPass = (request.headers.get('x-admin-password') || '').trim();
          let envPass = env.ADMIN_PASSWORD;
          if (!envPass || !envPass.trim()) {
              envPass = null;
          } else {
              envPass = envPass.trim();
          }
          const correctPass = envPass || "NEXUS_ADMIN";
          
          if (providedPass !== correctPass) {
            throw new Error('Unauthorized');
          }
        };

        const debugHeaders = {
             ...corsHeaders,
             'Content-Type': 'application/json',
        };

        // G. GET /api/system-config
        if (url.pathname === '/api/system-config' && request.method === 'GET') {
          return new Response(JSON.stringify({
            geminiApiKey: env.GEMINI_API_KEY || null
          }), { headers: debugHeaders });
        }

        // J. HEALTH CHECK (R2 Status)
        if (url.pathname === '/api/health-check' && request.method === 'GET') {
            try {
                if (!env.SONIC_BUCKET) {
                    return new Response(JSON.stringify({ status: 'error', message: 'R2 Bucket NOT Bound' }), { headers: debugHeaders });
                }
                // Try listing 1 item to verify permission
                await env.SONIC_BUCKET.list({ limit: 1 });
                return new Response(JSON.stringify({ status: 'ok', message: 'R2 Connected' }), { headers: debugHeaders });
            } catch (e) {
                return new Response(JSON.stringify({ status: 'error', message: e.message }), { headers: debugHeaders });
            }
        }

        // A. TRACKS
        if (url.pathname === '/api/tracks') {
            if (request.method === 'GET') {
                const data = await env.SONIC_KV.get('gallery_tracks') || '[]';
                return new Response(data, { headers: debugHeaders });
            }
            if (request.method === 'POST') {
                checkAuth();
                await env.SONIC_KV.put('gallery_tracks', await request.text());
                return new Response(JSON.stringify({ success: true }), { headers: debugHeaders });
            }
        }

        // B. ARTICLES
        if (url.pathname === '/api/articles') {
            if (request.method === 'GET') {
                const data = await env.SONIC_KV.get('gallery_articles') || '[]';
                return new Response(data, { headers: debugHeaders });
            }
            if (request.method === 'POST') {
                checkAuth();
                await env.SONIC_KV.put('gallery_articles', await request.text());
                return new Response(JSON.stringify({ success: true }), { headers: debugHeaders });
            }
        }

        // C. GALLERY
        if (url.pathname === '/api/gallery') {
            if (request.method === 'GET') {
                const data = await env.SONIC_KV.get('nexus_gallery') || '[]';
                return new Response(data, { headers: debugHeaders });
            }
            if (request.method === 'POST') {
                checkAuth();
                await env.SONIC_KV.put('nexus_gallery', await request.text());
                return new Response(JSON.stringify({ success: true }), { headers: debugHeaders });
            }
        }

        // H. VIDEOS
        if (url.pathname === '/api/videos') {
            if (request.method === 'GET') {
                const data = await env.SONIC_KV.get('nexus_videos') || '[]';
                return new Response(data, { headers: debugHeaders });
            }
            if (request.method === 'POST') {
                checkAuth();
                await env.SONIC_KV.put('nexus_videos', await request.text());
                return new Response(JSON.stringify({ success: true }), { headers: debugHeaders });
            }
        }

        // I. CATEGORIES (NEW)
        if (url.pathname === '/api/categories') {
            if (request.method === 'GET') {
                const data = await env.SONIC_KV.get('nexus_categories') || '[]';
                return new Response(data, { headers: debugHeaders });
            }
            if (request.method === 'POST') {
                checkAuth();
                await env.SONIC_KV.put('nexus_categories', await request.text());
                return new Response(JSON.stringify({ success: true }), { headers: debugHeaders });
            }
        }

        // D. UPLOAD FILE
        if (url.pathname === '/api/upload' && request.method === 'PUT') {
          checkAuth();
          const key = url.searchParams.get('key');
          if (!key) return new Response('Missing key param', { status: 400, headers: corsHeaders });

          // Note: Cloudflare Workers have a 100MB request body limit on standard plans.
          if (!env.SONIC_BUCKET) {
              return new Response(JSON.stringify({ error: "R2 Bucket Not Configured" }), { status: 500, headers: debugHeaders });
          }

          await env.SONIC_BUCKET.put(key, request.body, {
            httpMetadata: { contentType: request.headers.get('content-type') },
          });

          const fileUrl = `/api/file/${key}`; 
          return new Response(JSON.stringify({ url: fileUrl }), { headers: debugHeaders });
        }

        // E. GET FILE
        if (url.pathname.startsWith('/api/file/')) {
          const key = url.pathname.split('/api/file/')[1];
          if (!env.SONIC_BUCKET) return new Response('R2 Not Configured', { status: 500 });
          
          const object = await env.SONIC_BUCKET.get(key);

          if (!object) {
            return new Response('Object Not Found', { status: 404, headers: corsHeaders });
          }

          const headers = new Headers(object.httpMetadata);
          object.writeHttpMetadata(headers);
          headers.set('etag', object.httpEtag);
          headers.set('Access-Control-Allow-Origin', '*');
          headers.set('Accept-Ranges', 'bytes'); 
          headers.set('Cache-Control', 'public, max-age=31536000');

          return new Response(object.body, { headers });
        }
        
        // F. DELETE FILE
         if (url.pathname.startsWith('/api/delete-file/') && request.method === 'DELETE') {
             checkAuth();
             if (!env.SONIC_BUCKET) return new Response('R2 Not Configured', { status: 500 });
             const key = url.pathname.split('/api/delete-file/')[1];
             await env.SONIC_BUCKET.delete(key);
             return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
         }
         
         // G. VERIFY AUTH
         if (url.pathname === '/api/verify-auth' && request.method === 'POST') {
             checkAuth();
             return new Response(JSON.stringify({ success: true }), { headers: debugHeaders });
         }

         return new Response(JSON.stringify({ error: "API Route Not Found" }), { status: 404, headers: corsHeaders });

      } catch (e) {
        const status = e.message.includes('Unauthorized') ? 401 : 500;
        return new Response(JSON.stringify({ error: e.message }), { status, headers: corsHeaders });
      }
    }

    // 3. Static Assets
    try {
        let response = await env.ASSETS.fetch(request);
        if (response.status === 404) {
            return await env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
        }
        return response;
    } catch (e) {
        return new Response("Internal Server Error: " + e.message, { status: 500 });
    }
  },
};
