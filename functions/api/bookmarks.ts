import { verifyToken } from './auth';

interface Env {
  NAVIGATION_KV: KVNamespace;
  JWT_SECRET: string;
}

interface BookmarkImportRequest {
  bookmarks: Bookmark[];
  categoryId: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // 验证 token
    await verifyToken(request, env.JWT_SECRET);

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      const { bookmarks, categoryId } = await request.json() as BookmarkImportRequest;
      
      if (!Array.isArray(bookmarks) || !categoryId) {
        return new Response('Invalid request data', { status: 400 });
      }

      const categories = await env.NAVIGATION_KV.get('categories', 'json') as Category[] || [];
      if (!categories.some(category => category.id === categoryId)) {
        return new Response('Category not found', { status: 404 });
      }

      const sites = await env.NAVIGATION_KV.get('sites', 'json') as Site[] || [];
      const existingUrls = new Set(sites.map(site => site.url));
      const newSites: Site[] = [];

      for (const bookmark of bookmarks) {
        if (!bookmark.name || !bookmark.url) {
          continue;
        }

        // 跳过已存在的 URL
        if (existingUrls.has(bookmark.url)) {
          continue;
        }

        newSites.push({
          id: crypto.randomUUID(),
          name: bookmark.name,
          url: bookmark.url,
          description: bookmark.description,
          categoryId
        });

        existingUrls.add(bookmark.url);
      }

      if (newSites.length > 0) {
        sites.push(...newSites);
        await env.NAVIGATION_KV.put('sites', JSON.stringify(sites));
      }

      return new Response(JSON.stringify({
        imported: newSites.length,
        total: bookmarks.length
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response('Internal Server Error', { status: 500 });
    }
  }
}; 