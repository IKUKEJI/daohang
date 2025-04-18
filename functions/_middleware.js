import { verify } from 'jsonwebtoken';

// API路由中间件
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  
  // 跳过登录API的认证
  if (path === '/api/login') {
    return context.next();
  }
  
  // 验证JWT令牌
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({
      success: false,
      message: '未授权访问'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verify(token, env.JWT_SECRET);
    // 将用户信息添加到请求上下文
    context.user = decoded;
    return context.next();
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '无效的令牌'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 