import { authenticate, jsonResponse } from '../middleware/auth';

// 使用Cloudflare KV存储分类数据
const CATEGORIES_KEY = 'categories';

// 获取所有分类
export async function onRequestGet(context) {
    try {
        if (!await authenticate(context.request)) {
            return jsonResponse({ success: false, message: '未授权访问' }, 401);
        }

        const categories = await context.env.KV.get(CATEGORIES_KEY) || '[]';
        return jsonResponse({ success: true, data: JSON.parse(categories) });
    } catch (error) {
        return jsonResponse({ success: false, message: '获取分类失败' }, 500);
    }
}

// 添加新分类
export async function onRequestPost(context) {
    try {
        if (!await authenticate(context.request)) {
            return jsonResponse({ success: false, message: '未授权访问' }, 401);
        }

        const { name } = await context.request.json();
        if (!name) {
            return jsonResponse({ success: false, message: '分类名称不能为空' }, 400);
        }

        const categories = JSON.parse(await context.env.KV.get(CATEGORIES_KEY) || '[]');
        const newCategory = {
            id: crypto.randomUUID(),
            name,
            createdAt: new Date().toISOString()
        };

        categories.push(newCategory);
        await context.env.KV.put(CATEGORIES_KEY, JSON.stringify(categories));

        return jsonResponse({ success: true, data: newCategory });
    } catch (error) {
        return jsonResponse({ success: false, message: '添加分类失败' }, 500);
    }
}

// 更新分类
export async function onRequestPut(context) {
    try {
        if (!await authenticate(context.request)) {
            return jsonResponse({ success: false, message: '未授权访问' }, 401);
        }

        const url = new URL(context.request.url);
        const id = url.pathname.split('/').pop();
        const { name } = await context.request.json();

        if (!name) {
            return jsonResponse({ success: false, message: '分类名称不能为空' }, 400);
        }

        const categories = JSON.parse(await context.env.KV.get(CATEGORIES_KEY) || '[]');
        const index = categories.findIndex(c => c.id === id);

        if (index === -1) {
            return jsonResponse({ success: false, message: '分类不存在' }, 404);
        }

        categories[index].name = name;
        categories[index].updatedAt = new Date().toISOString();

        await context.env.KV.put(CATEGORIES_KEY, JSON.stringify(categories));
        return jsonResponse({ success: true, data: categories[index] });
    } catch (error) {
        return jsonResponse({ success: false, message: '更新分类失败' }, 500);
    }
}

// 删除分类
export async function onRequestDelete(context) {
    try {
        if (!await authenticate(context.request)) {
            return jsonResponse({ success: false, message: '未授权访问' }, 401);
        }

        const url = new URL(context.request.url);
        const id = url.pathname.split('/').pop();

        const categories = JSON.parse(await context.env.KV.get(CATEGORIES_KEY) || '[]');
        const index = categories.findIndex(c => c.id === id);

        if (index === -1) {
            return jsonResponse({ success: false, message: '分类不存在' }, 404);
        }

        categories.splice(index, 1);
        await context.env.KV.put(CATEGORIES_KEY, JSON.stringify(categories));

        return jsonResponse({ success: true });
    } catch (error) {
        return jsonResponse({ success: false, message: '删除分类失败' }, 500);
    }
} 