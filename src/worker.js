import { verifyToken } from './api/auth';
import * as auth from './api/auth';
import * as categories from './api/categories';
import * as sites from './api/sites';
import * as importBookmarks from './api/import';

// 路由处理
async function handleRequest(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 静态文件处理
    if (path.startsWith('/admin/')) {
        return handleStaticFile(request, env);
    }

    // API 路由处理
    if (path.startsWith('/api/')) {
        return handleApiRequest(request, env);
    }

    // 默认返回首页
    return handleStaticFile(request, env);
}

// 处理静态文件
async function handleStaticFile(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 获取文件内容
    let file;
    if (path === '/' || path === '/index.html') {
        file = await env.NAVIGATION_KV.get('index.html');
    } else if (path === '/admin' || path === '/admin/index.html') {
        file = await env.NAVIGATION_KV.get('admin/index.html');
    } else if (path === '/admin/style.css') {
        file = await env.NAVIGATION_KV.get('admin/style.css');
    } else if (path === '/admin/script.js') {
        file = await env.NAVIGATION_KV.get('admin/script.js');
    } else if (path === '/style.css') {
        file = await env.NAVIGATION_KV.get('style.css');
    } else if (path === '/script.js') {
        file = await env.NAVIGATION_KV.get('script.js');
    }

    if (!file) {
        return new Response('Not Found', { status: 404 });
    }

    // 设置正确的 Content-Type
    let contentType = 'text/html';
    if (path.endsWith('.css')) {
        contentType = 'text/css';
    } else if (path.endsWith('.js')) {
        contentType = 'application/javascript';
    }

    return new Response(file, {
        headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600'
        }
    });
}

// 处理 API 请求
async function handleApiRequest(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/', '');
    const method = request.method;

    // 不需要验证 token 的路由
    if (path === 'auth' && method === 'POST') {
        return auth.onRequestPost({ request, env });
    }

    // 需要验证 token 的路由
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

    // 根据路径和方法调用相应的处理函数
    switch (path) {
        case 'auth':
            if (method === 'PUT') {
                return auth.onRequestPut({ request, env });
            }
            break;

        case 'categories':
            switch (method) {
                case 'GET':
                    return categories.onRequestGet({ request, env });
                case 'POST':
                    return categories.onRequestPost({ request, env });
                case 'PUT':
                    return categories.onRequestPut({ request, env });
                case 'DELETE':
                    return categories.onRequestDelete({ request, env });
            }
            break;

        case 'sites':
            switch (method) {
                case 'GET':
                    return sites.onRequestGet({ request, env });
                case 'POST':
                    return sites.onRequestPost({ request, env });
                case 'PUT':
                    return sites.onRequestPut({ request, env });
                case 'DELETE':
                    return sites.onRequestDelete({ request, env });
            }
            break;

        case 'import':
            if (method === 'POST') {
                return importBookmarks.onRequestPost({ request, env });
            }
            break;
    }

    return new Response(JSON.stringify({
        success: false,
        message: '无效的请求'
    }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
    });
}

// 导出事件处理函数
export default {
    async fetch(request, env, ctx) {
        try {
            return await handleRequest(request, env);
        } catch (error) {
            console.error('请求处理错误:', error);
            return new Response(JSON.stringify({
                success: false,
                message: '服务器内部错误'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
}; 