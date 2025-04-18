import { authenticate, jsonResponse } from '../middleware/auth';

// 使用Cloudflare KV存储网站数据
const SITES_KEY = 'sites';

// 获取所有网站
export async function onRequestGet(context) {
    try {
        if (!await authenticate(context.request)) {
            return jsonResponse({ success: false, message: '未授权访问' }, 401);
        }

        const url = new URL(context.request.url);
        const id = url.pathname.split('/').pop();
        
        // 如果提供了ID，则获取单个网站
        if (id && id !== 'sites') {
            const sites = JSON.parse(await context.env.KV.get(SITES_KEY) || '[]');
            const site = sites.find(s => s.id === id);

            if (!site) {
                return jsonResponse({ success: false, message: '网站不存在' }, 404);
            }

            return jsonResponse({ success: true, data: site });
        }
        
        // 否则获取所有网站
        const sites = await context.env.KV.get(SITES_KEY) || '[]';
        return jsonResponse({ success: true, data: JSON.parse(sites) });
    } catch (error) {
        return jsonResponse({ success: false, message: '获取网站列表失败' }, 500);
    }
}

// 添加新网站
export async function onRequestPost(context) {
    try {
        if (!await authenticate(context.request)) {
            return jsonResponse({ success: false, message: '未授权访问' }, 401);
        }

        const { categoryId, name, url, description, icon } = await context.request.json();
        
        // 验证必填字段
        if (!categoryId || !name || !url) {
            return jsonResponse({ 
                success: false, 
                message: '分类ID、网站名称和URL为必填项' 
            }, 400);
        }

        const sites = JSON.parse(await context.env.KV.get(SITES_KEY) || '[]');
        const newSite = {
            id: crypto.randomUUID(),
            categoryId,
            name,
            url,
            description: description || '',
            icon: icon || 'ri-link',
            createdAt: new Date().toISOString()
        };

        sites.push(newSite);
        await context.env.KV.put(SITES_KEY, JSON.stringify(sites));

        return jsonResponse({ success: true, data: newSite });
    } catch (error) {
        return jsonResponse({ success: false, message: '添加网站失败' }, 500);
    }
}

// 更新网站
export async function onRequestPut(context) {
    try {
        if (!await authenticate(context.request)) {
            return jsonResponse({ success: false, message: '未授权访问' }, 401);
        }

        const url = new URL(context.request.url);
        const id = url.pathname.split('/').pop();
        const updates = await context.request.json();

        // 验证必填字段
        if (!updates.categoryId || !updates.name || !updates.url) {
            return jsonResponse({ 
                success: false, 
                message: '分类ID、网站名称和URL为必填项' 
            }, 400);
        }

        const sites = JSON.parse(await context.env.KV.get(SITES_KEY) || '[]');
        const index = sites.findIndex(s => s.id === id);

        if (index === -1) {
            return jsonResponse({ success: false, message: '网站不存在' }, 404);
        }

        // 更新网站信息
        sites[index] = {
            ...sites[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        await context.env.KV.put(SITES_KEY, JSON.stringify(sites));
        return jsonResponse({ success: true, data: sites[index] });
    } catch (error) {
        return jsonResponse({ success: false, message: '更新网站失败' }, 500);
    }
}

// 删除网站
export async function onRequestDelete(context) {
    try {
        if (!await authenticate(context.request)) {
            return jsonResponse({ success: false, message: '未授权访问' }, 401);
        }

        const url = new URL(context.request.url);
        const id = url.pathname.split('/').pop();

        const sites = JSON.parse(await context.env.KV.get(SITES_KEY) || '[]');
        const index = sites.findIndex(s => s.id === id);

        if (index === -1) {
            return jsonResponse({ success: false, message: '网站不存在' }, 404);
        }

        sites.splice(index, 1);
        await context.env.KV.put(SITES_KEY, JSON.stringify(sites));

        return jsonResponse({ success: true });
    } catch (error) {
        return jsonResponse({ success: false, message: '删除网站失败' }, 500);
    }
} 