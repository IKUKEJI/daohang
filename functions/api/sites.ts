import { verifyToken } from './auth';

interface Env {
  NAVIGATION_KV: KVNamespace;
  JWT_SECRET: string;
}

interface SiteRequest {
  id?: string;
  name: string;
  url: string;
  description?: string;
  categoryId: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // 验证 token
    await verifyToken(request, env.JWT_SECRET);

    switch (request.method) {
      case 'GET':
        return handleGet(env);
      case 'POST':
        return handlePost(request, env);
      case 'PUT':
        return handlePut(request, env);
      case 'DELETE':
        return handleDelete(request, env);
      default:
        return new Response('Method Not Allowed', { status: 405 });
    }
  }
};

async function handleGet(env: Env): Promise<Response> {
  const sites = await env.NAVIGATION_KV.get('sites', 'json') as Site[] || [];
  return new Response(JSON.stringify(sites), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handlePost(request: Request, env: Env): Promise<Response> {
  const { name, url, description, categoryId } = await request.json() as SiteRequest;
  if (!name || !url || !categoryId) {
    return new Response('Name, URL and category ID are required', { status: 400 });
  }

  const categories = await env.NAVIGATION_KV.get('categories', 'json') as Category[] || [];
  if (!categories.some(category => category.id === categoryId)) {
    return new Response('Category not found', { status: 404 });
  }

  const sites = await env.NAVIGATION_KV.get('sites', 'json') as Site[] || [];
  if (sites.some(site => site.name === name)) {
    return new Response('Site name already exists', { status: 400 });
  }

  const newSite: Site = {
    id: crypto.randomUUID(),
    name,
    url,
    description,
    categoryId
  };

  sites.push(newSite);
  await env.NAVIGATION_KV.put('sites', JSON.stringify(sites));

  return new Response(JSON.stringify(newSite), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handlePut(request: Request, env: Env): Promise<Response> {
  const { id, name, url, description, categoryId } = await request.json() as SiteRequest;
  if (!id || !name || !url || !categoryId) {
    return new Response('ID, name, URL and category ID are required', { status: 400 });
  }

  const categories = await env.NAVIGATION_KV.get('categories', 'json') as Category[] || [];
  if (!categories.some(category => category.id === categoryId)) {
    return new Response('Category not found', { status: 404 });
  }

  const sites = await env.NAVIGATION_KV.get('sites', 'json') as Site[] || [];
  const siteIndex = sites.findIndex(site => site.id === id);

  if (siteIndex === -1) {
    return new Response('Site not found', { status: 404 });
  }

  // 检查新名称是否与其他网站重复
  if (sites.some(site => site.name === name && site.id !== id)) {
    return new Response('Site name already exists', { status: 400 });
  }

  sites[siteIndex] = {
    ...sites[siteIndex],
    name,
    url,
    description,
    categoryId
  };

  await env.NAVIGATION_KV.put('sites', JSON.stringify(sites));

  return new Response(JSON.stringify(sites[siteIndex]), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleDelete(request: Request, env: Env): Promise<Response> {
  const { id } = await request.json() as SiteRequest;
  if (!id) {
    return new Response('ID is required', { status: 400 });
  }

  const sites = await env.NAVIGATION_KV.get('sites', 'json') as Site[] || [];
  const siteIndex = sites.findIndex(site => site.id === id);

  if (siteIndex === -1) {
    return new Response('Site not found', { status: 404 });
  }

  sites.splice(siteIndex, 1);
  await env.NAVIGATION_KV.put('sites', JSON.stringify(sites));

  return new Response(null, { status: 204 });
} 