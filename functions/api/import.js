import { verifyToken } from './auth';

// 导入书签
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

    const { bookmarks, categoryId } = await request.json();
    if (!bookmarks || !Array.isArray(bookmarks) || !categoryId) {
        return new Response(JSON.stringify({
            success: false,
            message: '书签数据和分类 ID 不能为空'
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
    const existingNames = new Set(sites.map(s => s.name));
    const existingUrls = new Set(sites.map(s => s.url));

    // 处理书签数据
    const newSites = [];
    const errors = [];

    for (const bookmark of bookmarks) {
        const { name, url, description = '' } = bookmark;

        // 验证必填字段
        if (!name || !url) {
            errors.push(`书签缺少名称或 URL: ${JSON.stringify(bookmark)}`);
            continue;
        }

        // 验证 URL 格式
        try {
            new URL(url);
        } catch (error) {
            errors.push(`无效的 URL 格式: ${url}`);
            continue;
        }

        // 检查名称和 URL 是否已存在
        if (existingNames.has(name)) {
            errors.push(`网站名称已存在: ${name}`);
            continue;
        }

        if (existingUrls.has(url)) {
            errors.push(`网站 URL 已存在: ${url}`);
            continue;
        }

        // 创建新网站
        const newSite = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name,
            url,
            description,
            categoryId,
            icon: '',
            createdAt: new Date().toISOString(),
            createdBy: payload.userId
        };

        newSites.push(newSite);
        existingNames.add(name);
        existingUrls.add(url);
    }

    // 保存新网站
    if (newSites.length > 0) {
        sites.push(...newSites);
        await env.NAVIGATION_KV.put('sites', JSON.stringify(sites));
    }

    return new Response(JSON.stringify({
        success: true,
        data: {
            imported: newSites.length,
            errors: errors.length > 0 ? errors : null
        }
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
} 