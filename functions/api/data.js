import { authenticate, jsonResponse } from '../middleware/auth';

// 使用Cloudflare KV存储数据
const CATEGORIES_KEY = 'categories';
const SITES_KEY = 'sites';

// 获取所有数据
export async function onRequestGet(context) {
    try {
        if (!await authenticate(context.request)) {
            return jsonResponse({ success: false, message: '未授权访问' }, 401);
        }

        // 获取分类和网站数据
        const categories = JSON.parse(await context.env.KV.get(CATEGORIES_KEY) || '[]');
        const sites = JSON.parse(await context.env.KV.get(SITES_KEY) || '[]');

        return jsonResponse({
            success: true,
            data: {
                categories,
                sites
            }
        });
    } catch (error) {
        return jsonResponse({ success: false, message: '获取数据失败' }, 500);
    }
} 