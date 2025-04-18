import { verifyToken } from './auth';

// 获取所有网站
export async function onRequestGet(context) {
    const { env } = context;
    const sites = await env.NAVIGATION_KV.get('sites', 'json') || [];
    
    return new Response(JSON.stringify({
        success: true,
        data: sites
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

// 添加新网站
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

    const { name, url, description, categoryId, icon } = await request.json();
    if (!name || !url || !categoryId) {
        return new Response(JSON.stringify({
            success: false,
            message: '网站名称、URL 和分类不能为空'
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 验证 URL 格式
    try {
        new URL(url);
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            message: '无效的 URL 格式'
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 检查分类是否存在
    const categories = await env.NAVIGATION_KV.get('categories', 'json') || [];
    if (!categories.some(c => c.id === categoryId)) {
        return new Response(JSON.stringify({
            success: false,
            message: '分类不存在'
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 获取现有网站
    const sites = await env.NAVIGATION_KV.get('sites', 'json') || [];
    
    // 检查网站名称是否已存在
    if (sites.some(s => s.name === name)) {
        return new Response(JSON.stringify({
            success: false,
            message: '网站名称已存在'
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 创建新网站
    const newSite = {
        id: Date.now().toString(),
        name,
        url,
        description: description || '',
        categoryId,
        icon: icon || '',
        createdAt: new Date().toISOString(),
        createdBy: payload.userId
    };

    sites.push(newSite);
    await env.NAVIGATION_KV.put('sites', JSON.stringify(sites));

    return new Response(JSON.stringify({
        success: true,
        data: newSite
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

// 更新网站
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

    const { id, name, url, description, categoryId, icon } = await request.json();
    if (!id || !name || !url || !categoryId) {
        return new Response(JSON.stringify({
            success: false,
            message: '网站 ID、名称、URL 和分类不能为空'
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 验证 URL 格式
    try {
        new URL(url);
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            message: '无效的 URL 格式'
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 检查分类是否存在
    const categories = await env.NAVIGATION_KV.get('categories', 'json') || [];
    if (!categories.some(c => c.id === categoryId)) {
        return new Response(JSON.stringify({
            success: false,
            message: '分类不存在'
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 获取现有网站
    const sites = await env.NAVIGATION_KV.get('sites', 'json') || [];
    const siteIndex = sites.findIndex(s => s.id === id);
    
    if (siteIndex === -1) {
        return new Response(JSON.stringify({
            success: false,
            message: '网站不存在'
        }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 检查新名称是否与其他网站重复
    if (sites.some(s => s.name === name && s.id !== id)) {
        return new Response(JSON.stringify({
            success: false,
            message: '网站名称已存在'
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 更新网站
    sites[siteIndex] = {
        ...sites[siteIndex],
        name,
        url,
        description: description || '',
        categoryId,
        icon: icon || '',
        updatedAt: new Date().toISOString(),
        updatedBy: payload.userId
    };

    await env.NAVIGATION_KV.put('sites', JSON.stringify(sites));

    return new Response(JSON.stringify({
        success: true,
        data: sites[siteIndex]
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

// 删除网站
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
            message: '网站 ID 不能为空'
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 获取现有网站
    const sites = await env.NAVIGATION_KV.get('sites', 'json') || [];
    const siteIndex = sites.findIndex(s => s.id === id);
    
    if (siteIndex === -1) {
        return new Response(JSON.stringify({
            success: false,
            message: '网站不存在'
        }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 删除网站
    sites.splice(siteIndex, 1);
    await env.NAVIGATION_KV.put('sites', JSON.stringify(sites));

    return new Response(JSON.stringify({
        success: true,
        message: '网站已删除'
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
} 