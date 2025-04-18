import { authenticate, jsonResponse } from '../middleware/auth';

// 使用Cloudflare KV存储账号数据
const ACCOUNT_KEY = 'account';

// 更新账号信息
export async function onRequestPut(context) {
    try {
        if (!await authenticate(context.request)) {
            return jsonResponse({ success: false, message: '未授权访问' }, 401);
        }

        const { username, password } = await context.request.json();
        
        // 验证必填字段
        if (!username || !password) {
            return jsonResponse({ 
                success: false, 
                message: '用户名和密码为必填项' 
            }, 400);
        }

        // 更新账号信息
        const account = {
            username,
            password,
            updatedAt: new Date().toISOString()
        };

        await context.env.KV.put(ACCOUNT_KEY, JSON.stringify(account));
        return jsonResponse({ success: true });
    } catch (error) {
        return jsonResponse({ success: false, message: '更新账号信息失败' }, 500);
    }
} 