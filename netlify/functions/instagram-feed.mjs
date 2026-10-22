/**
 * Zeta Gym - feed de Instagram.
 * Configurar en Netlify:
 *   INSTAGRAM_ACCESS_TOKEN = token de usuario profesional con permiso instagram_business_basic
 *   (opcional) INSTAGRAM_API_VERSION = versión Graph API habilitada para la app (por defecto v23.0)
 * El token se guarda en variables de entorno, nunca en HTML/JS público.
 */
export default async (request, context) => {
  const token = Netlify.env.get('INSTAGRAM_ACCESS_TOKEN');
  const version = Netlify.env.get('INSTAGRAM_API_VERSION') || 'v23.0';

  if (!token) {
    return new Response(JSON.stringify({ error: 'Falta configurar INSTAGRAM_ACCESS_TOKEN en Netlify.' }), {
      status: 503,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
    });
  }

  const url = new URL(`https://graph.instagram.com/${version}/me/media`);
  url.searchParams.set('fields', 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp');
  url.searchParams.set('limit', '12');
  url.searchParams.set('access_token', token);

  try {
    const upstream = await fetch(url, { headers: { accept: 'application/json' } });
    const payload = await upstream.json();
    if (!upstream.ok || payload.error) {
      console.error('Instagram Graph API error:', payload.error?.message || upstream.status);
      return new Response(JSON.stringify({ error: 'Instagram no pudo devolver las publicaciones. Revisá la cuenta, los permisos y el token en Netlify.' }), {
        status: 502,
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
      });
    }

    const data = Array.isArray(payload.data) ? payload.data.map(item => ({
      id: item.id,
      caption: item.caption || '',
      media_type: item.media_type || 'IMAGE',
      media_url: item.media_url || null,
      thumbnail_url: item.thumbnail_url || null,
      permalink: item.permalink || 'https://www.instagram.com/zetagym.arg/',
      timestamp: item.timestamp || null
    })) : [];

    return new Response(JSON.stringify({ data, fetched_at: new Date().toISOString() }), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=60, s-maxage=60',
        'access-control-allow-origin': '*'
      }
    });
  } catch (error) {
    console.error('Instagram feed function failed:', error);
    return new Response(JSON.stringify({ error: 'No se pudo conectar con Instagram.' }), {
      status: 502,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
    });
  }
};
