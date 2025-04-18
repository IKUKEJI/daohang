import { verifyToken } from './api/auth';

interface Env {
  NAVIGATION_KV: KVNamespace;
  JWT_SECRET: string;
  ENVIRONMENT?: string;
}

// 错误处理函数
function handleError(error: Error, status: number = 500): Response {
  console.error(`Error: ${error.message}`);
  return new Response(JSON.stringify({
    error: error.message,
    status
  }), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

// 日志记录函数
function logRequest(request: Request, env: Env): void {
  const url = new URL(request.url);
  console.log(`[${new Date().toISOString()}] ${request.method} ${url.pathname}`);
  console.log(`Environment: ${env.ENVIRONMENT}`);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      logRequest(request, env);
      
      const url = new URL(request.url);
      const path = url.pathname;

      // 处理管理后台路由
      if (path.startsWith('/admin')) {
        // 静态文件请求
        const content = await env.NAVIGATION_KV.get(path.slice(1), 'text');
        if (content === null) {
          return handleError(new Error('Not Found'), 404);
        }
        return new Response(content, {
          headers: { 'Content-Type': getContentType(path) }
        });
      }

      // API 路由
      if (path.startsWith('/api')) {
        const apiPath = path.slice(4);
        
        // 认证相关 API 不需要验证 token
        if (apiPath === '/auth') {
          return handleAuthRequest(request, env);
        }

        // 其他 API 需要验证 token
        try {
          await verifyToken(request, env.JWT_SECRET);
        } catch (error) {
          return handleError(new Error('Unauthorized'), 401);
        }

        // 根据路径分发到不同的处理器
        switch (apiPath) {
          case '/categories':
            return handleCategoriesRequest(request, env);
          case '/sites':
            return handleSitesRequest(request, env);
          case '/bookmarks':
            return handleBookmarksRequest(request, env);
          default:
            return handleError(new Error('Not Found'), 404);
        }
      }

      // 默认返回首页
      const content = await env.NAVIGATION_KV.get('index.html', 'text');
      if (content === null) {
        return handleError(new Error('Not Found'), 404);
      }
      return new Response(content, {
        headers: { 'Content-Type': 'text/html' }
      });
    } catch (error) {
      return handleError(error as Error);
    }
  }
};

// 根据文件扩展名获取 Content-Type
function getContentType(path: string): string {
  if (path.endsWith('.html')) return 'text/html';
  if (path.endsWith('.css')) return 'text/css';
  if (path.endsWith('.js')) return 'application/javascript';
  return 'text/plain';
}

// 导入各个处理器
async function handleAuthRequest(request: Request, env: Env): Promise<Response> {
  try {
    const { default: handler } = await import('./api/auth');
    return handler.fetch(request, env);
  } catch (error) {
    return handleError(error as Error);
  }
}

async function handleCategoriesRequest(request: Request, env: Env): Promise<Response> {
  try {
    const { default: handler } = await import('./api/categories');
    return handler.fetch(request, env);
  } catch (error) {
    return handleError(error as Error);
  }
}

async function handleSitesRequest(request: Request, env: Env): Promise<Response> {
  try {
    const { default: handler } = await import('./api/sites');
    return handler.fetch(request, env);
  } catch (error) {
    return handleError(error as Error);
  }
}

async function handleBookmarksRequest(request: Request, env: Env): Promise<Response> {
  try {
    const { default: handler } = await import('./api/bookmarks');
    return handler.fetch(request, env);
  } catch (error) {
    return handleError(error as Error);
  }
} 