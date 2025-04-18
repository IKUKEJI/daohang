// API路由中间件
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;
  
  // 处理API路由
  if (path.startsWith('/api/')) {
    const apiPath = path.substring(4); // 移除'/api/'前缀
    
    // 登录API不需要验证
    if (apiPath === 'login') {
      return context.next();
    }
    
    // 其他API需要验证
    try {
      const authHeader = context.request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({
          success: false,
          message: '未授权访问'
        }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      
      // 继续处理请求
      return context.next();
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        message: '认证失败'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }
  
  // 非API请求直接通过
  return context.next();
} 