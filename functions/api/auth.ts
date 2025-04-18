import jwt from 'jsonwebtoken';

interface Env {
  NAVIGATION_KV: KVNamespace;
  JWT_SECRET: string;
}

interface AuthRequest {
  username: string;
  password: string;
}

// 验证 token 的函数
async function verifyToken(request: Request, secret: string): Promise<void> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export { verifyToken };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      const { username, password } = await request.json() as AuthRequest;

      // 验证用户名和密码
      if (username === 'admin' && password === 'admin') {
        // 生成 JWT token
        const token = jwt.sign({ username }, env.JWT_SECRET, { expiresIn: '24h' });
        return new Response(JSON.stringify({ token }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response('Invalid credentials', { status: 401 });
    } catch (error) {
      return new Response('Internal Server Error', { status: 500 });
    }
  }
}; 