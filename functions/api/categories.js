import { verifyToken } from './auth';

// 获取所有分类
export async function onRequestGet(context) {
    const { env } = context;
    const categories = await env.NAVIGATION_KV.get('categories', 'json') || [];
    
    return new Response(JSON.stringify({
        success: true,
        data: categories
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

// 添加新分类
export async function onRequestPost(context) {
    const { request, env } = context;
    
    // 验证 token
    const payload = await verifyToken(request, env);
    if (!payload) {
        return new Response(JSON.stringify({
            success: false,
            message: '未授权访问'
        }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const { name, description } = await request.json();
    if (!name) {
        return new Response(JSON.stringify({
            success: false,
            message: '分类名称不能为空'
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 获取现有分类
    const categories = await env.NAVIGATION_KV.get('categories', 'json') || [];
    
    // 检查分类名称是否已存在
    if (categories.some(c => c.name === name)) {
        return new Response(JSON.stringify({
            success: false,
            message: '分类名称已存在'
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 创建新分类
    const newCategory = {
        id: Date.now().toString(),
        name,
        description: description || '',
        createdAt: new Date().toISOString(),
        createdBy: payload.userId
    };

    categories.push(newCategory);
    await env.NAVIGATION_KV.put('categories', JSON.stringify(categories));

    return new Response(JSON.stringify({
        success: true,
        data: newCategory
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

// 更新分类
export async function onRequestPut(context) {
    const { request, env } = context;
    
    // 验证 token
    const payload = await verifyToken(request, env);
    if (!payload) {
        return new Response(JSON.stringify({
            success: false,
            message: '未授权访问'
        }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const { id, name, description } = await request.json();
    if (!id || !name) {
        return new Response(JSON.stringify({
            success: false,
            message: '分类 ID 和名称不能为空'
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 获取现有分类
    const categories = await env.NAVIGATION_KV.get('categories', 'json') || [];
    const categoryIndex = categories.findIndex(c => c.id === id);
    
    if (categoryIndex === -1) {
        return new Response(JSON.stringify({
            success: false,
            message: '分类不存在'
        }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 检查新名称是否与其他分类重复
    if (categories.some(c => c.name === name && c.id !== id)) {
        return new Response(JSON.stringify({
            success: false,
            message: '分类名称已存在'
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 更新分类
    categories[categoryIndex] = {
        ...categories[categoryIndex],
        name,
        description: description || '',
        updatedAt: new Date().toISOString(),
        updatedBy: payload.userId
    };

    await env.NAVIGATION_KV.put('categories', JSON.stringify(categories));

    return new Response(JSON.stringify({
        success: true,
        data: categories[categoryIndex]
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

// 删除分类
export async function onRequestDelete(context) {
    const { request, env } = context;
    
    // 验证 token
    const payload = await verifyToken(request, env);
    if (!payload) {
        return new Response(JSON.stringify({
            success: false,
            message: '未授权访问'
        }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const { id } = await request.json();
    if (!id) {
        return new Response(JSON.stringify({
            success: false,
            message: '分类 ID 不能为空'
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 获取现有分类
    const categories = await env.NAVIGATION_KV.get('categories', 'json') || [];
    const categoryIndex = categories.findIndex(c => c.id === id);
    
    if (categoryIndex === -1) {
        return new Response(JSON.stringify({
            success: false,
            message: '分类不存在'
        }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 检查是否有网站使用此分类
    const sites = await env.NAVIGATION_KV.get('sites', 'json') || [];
    if (sites.some(s => s.categoryId === id)) {
        return new Response(JSON.stringify({
            success: false,
            message: '无法删除正在使用的分类'
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 删除分类
    categories.splice(categoryIndex, 1);
    await env.NAVIGATION_KV.put('categories', JSON.stringify(categories));

    return new Response(JSON.stringify({
        success: true,
        message: '分类已删除'
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
} 