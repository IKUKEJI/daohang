import { verifyToken } from './auth';

interface Env {
  NAVIGATION_KV: KVNamespace;
  JWT_SECRET: string;
}

interface CategoryRequest {
  name: string;
  id?: string;
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
  const categories = await env.NAVIGATION_KV.get('categories', 'json') as Category[] || [];
  return new Response(JSON.stringify(categories), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handlePost(request: Request, env: Env): Promise<Response> {
  const { name } = await request.json() as CategoryRequest;
  if (!name) {
    return new Response('Name is required', { status: 400 });
  }

  const categories = await env.NAVIGATION_KV.get('categories', 'json') as Category[] || [];
  
  // 检查分类名是否已存在
  if (categories.some(category => category.name === name)) {
    return new Response('Category already exists', { status: 400 });
  }

  const newCategory: Category = {
    id: crypto.randomUUID(),
    name
  };

  categories.push(newCategory);
  await env.NAVIGATION_KV.put('categories', JSON.stringify(categories));

  return new Response(JSON.stringify(newCategory), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handlePut(request: Request, env: Env): Promise<Response> {
  const { id, name } = await request.json() as CategoryRequest;
  if (!id || !name) {
    return new Response('ID and name are required', { status: 400 });
  }

  const categories = await env.NAVIGATION_KV.get('categories', 'json') as Category[] || [];
  const categoryIndex = categories.findIndex(category => category.id === id);

  if (categoryIndex === -1) {
    return new Response('Category not found', { status: 404 });
  }

  // 检查新名称是否与其他分类重复
  if (categories.some(category => category.name === name && category.id !== id)) {
    return new Response('Category name already exists', { status: 400 });
  }

  categories[categoryIndex].name = name;
  await env.NAVIGATION_KV.put('categories', JSON.stringify(categories));

  return new Response(JSON.stringify(categories[categoryIndex]), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleDelete(request: Request, env: Env): Promise<Response> {
  const { id } = await request.json() as CategoryRequest;
  if (!id) {
    return new Response('ID is required', { status: 400 });
  }

  const categories = await env.NAVIGATION_KV.get('categories', 'json') as Category[] || [];
  const sites = await env.NAVIGATION_KV.get('sites', 'json') as Site[] || [];

  // 检查是否有网站使用此分类
  if (sites.some(site => site.categoryId === id)) {
    return new Response('Cannot delete category with associated sites', { status: 400 });
  }

  const categoryIndex = categories.findIndex(category => category.id === id);
  if (categoryIndex === -1) {
    return new Response('Category not found', { status: 404 });
  }

  categories.splice(categoryIndex, 1);
  await env.NAVIGATION_KV.put('categories', JSON.stringify(categories));

  return new Response(null, { status: 204 });
} 