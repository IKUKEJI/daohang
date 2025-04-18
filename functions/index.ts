import { verifyToken } from './api/auth';

interface Env {
  NAVIGATION_KV: KVNamespace;
  JWT_SECRET: string;
  ENVIRONMENT?: string;
}

// 静态文件内容
const staticFiles: Record<string, string> = {
  'index.html': `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>导航网站</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <header>
        <nav>
            <div class="logo">导航网站</div>
            <div class="nav-links">
                <a href="/admin" class="admin-link">管理后台</a>
            </div>
        </nav>
    </header>
    
    <main>
        <div class="categories">
            <!-- 分类将通过 JavaScript 动态加载 -->
        </div>
        
        <div class="sites">
            <!-- 网站列表将通过 JavaScript 动态加载 -->
        </div>
    </main>

    <footer>
        <p>&copy; 2024 导航网站. All rights reserved.</p>
    </footer>

    <script src="/app.js"></script>
</body>
</html>`,
  'styles.css': `:root {
    --primary-color: #4a90e2;
    --secondary-color: #2c3e50;
    --background-color: #f5f6fa;
    --text-color: #2c3e50;
    --border-color: #dcdde1;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--background-color);
}

header {
    background-color: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

nav {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary-color);
}

.nav-links a {
    color: var(--secondary-color);
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.nav-links a:hover {
    background-color: var(--background-color);
}

main {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1rem;
}

.categories {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
}

.category {
    padding: 0.5rem 1rem;
    background-color: white;
    border-radius: 4px;
    cursor: pointer;
    border: 1px solid var(--border-color);
    transition: all 0.3s;
}

.category:hover,
.category.active {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
}

.sites {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
}

.site-card {
    background-color: white;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    transition: transform 0.3s;
}

.site-card:hover {
    transform: translateY(-2px);
}

.site-card h3 {
    color: var(--primary-color);
    margin-bottom: 0.5rem;
}

.site-card p {
    color: var(--text-color);
    font-size: 0.9rem;
    margin-bottom: 1rem;
}

.site-card a {
    color: var(--primary-color);
    text-decoration: none;
}

.site-card a:hover {
    text-decoration: underline;
}

footer {
    text-align: center;
    padding: 2rem;
    background-color: white;
    border-top: 1px solid var(--border-color);
}`,
  'app.js': `// 全局状态
let currentCategory = null;
let categories = [];
let sites = [];

// DOM 元素
const categoriesContainer = document.querySelector('.categories');
const sitesContainer = document.querySelector('.sites');

// 初始化
async function init() {
    try {
        await loadCategories();
        await loadSites();
        renderCategories();
        renderSites();
    } catch (error) {
        console.error('初始化失败:', error);
    }
}

// 加载分类
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('加载分类失败');
        categories = await response.json();
    } catch (error) {
        console.error('加载分类错误:', error);
        categories = [];
    }
}

// 加载网站
async function loadSites() {
    try {
        const url = currentCategory 
            ? \`/api/sites?category=\${currentCategory}\` 
            : '/api/sites';
        const response = await fetch(url);
        if (!response.ok) throw new Error('加载网站失败');
        sites = await response.json();
    } catch (error) {
        console.error('加载网站错误:', error);
        sites = [];
    }
}

// 渲染分类
function renderCategories() {
    categoriesContainer.innerHTML = categories.map(category => \`
        <div class="category \${currentCategory === category.id ? 'active' : ''}"
             onclick="selectCategory('\${category.id}')">
            \${category.name}
        </div>
    \`).join('');
}

// 渲染网站
function renderSites() {
    sitesContainer.innerHTML = sites.map(site => \`
        <div class="site-card">
            <h3>\${site.name}</h3>
            <p>\${site.description || ''}</p>
            <a href="\${site.url}" target="_blank" rel="noopener noreferrer">访问网站</a>
        </div>
    \`).join('');
}

// 选择分类
async function selectCategory(categoryId) {
    if (currentCategory === categoryId) {
        currentCategory = null;
    } else {
        currentCategory = categoryId;
    }
    await loadSites();
    renderCategories();
    renderSites();
}

// 启动应用
init();`
};

// 错误处理函数
function handleError(error: Error, status: number = 500): Response {
  console.error(`Error: ${error.message}`);
  return new Response(JSON.stringify({
    error: error.message,
    status
  }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
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
      // 处理 OPTIONS 请求
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
          }
        });
      }

      logRequest(request, env);
      
      const url = new URL(request.url);
      const path = url.pathname;

      // 默认返回首页
      if (path === '/') {
        return new Response(staticFiles['index.html'], {
          headers: {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // 处理管理后台路由
      if (path.startsWith('/admin')) {
        // 静态文件请求
        const content = await env.NAVIGATION_KV.get(path.slice(1), 'text');
        if (content === null) {
          return handleError(new Error('Not Found'), 404);
        }
        return new Response(content, {
          headers: {
            'Content-Type': getContentType(path),
            'Access-Control-Allow-Origin': '*'
          }
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

      // 尝试获取静态文件
      const fileName = path.slice(1);
      if (fileName in staticFiles) {
        return new Response(staticFiles[fileName], {
          headers: {
            'Content-Type': getContentType(path),
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // 如果找不到文件，返回 404
      return handleError(new Error('Not Found'), 404);
    } catch (error) {
      console.error('Unhandled error:', error);
      return handleError(error as Error);
    }
  }
};

// 根据文件扩展名获取 Content-Type
function getContentType(path: string): string {
  if (path.endsWith('.html')) return 'text/html';
  if (path.endsWith('.css')) return 'text/css';
  if (path.endsWith('.js')) return 'application/javascript';
  if (path.endsWith('.json')) return 'application/json';
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
  if (path.endsWith('.gif')) return 'image/gif';
  if (path.endsWith('.svg')) return 'image/svg+xml';
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