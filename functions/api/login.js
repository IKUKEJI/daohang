import { sign } from 'jsonwebtoken';

// 从环境变量获取管理员凭据
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin';

// 生成JWT token
function generateToken(username, jwtSecret) {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
        username,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24小时过期
    }));
    const signature = btoa(
        hmacSHA256(`${header}.${payload}`, jwtSecret)
    );
    return `${header}.${payload}.${signature}`;
}

// HMAC-SHA256签名
function hmacSHA256(message, secret) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(message);
    return crypto.subtle.sign(
        'HMAC',
        keyData,
        messageData
    );
}

export async function onRequestPost(context) {
    const { request, env } = context;
    const { username, password } = await request.json();

    // 验证用户名和密码
    if (username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
        // 生成 JWT token
        const token = sign(
            { username },
            env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return new Response(JSON.stringify({
            success: true,
            token
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({
        success: false,
        message: '用户名或密码错误'
    }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
    });
} 