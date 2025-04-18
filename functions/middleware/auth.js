const JWT_SECRET = 'your-jwt-secret';

// 验证JWT token
export async function verifyToken(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('未提供有效的认证token');
    }

    const token = authHeader.split(' ')[1];
    const [header, payload, signature] = token.split('.');

    try {
        // 验证签名
        const expectedSignature = await hmacSHA256(
            `${header}.${payload}`,
            JWT_SECRET
        );
        const actualSignature = atob(signature);

        if (expectedSignature !== actualSignature) {
            throw new Error('无效的token签名');
        }

        // 验证过期时间
        const decodedPayload = JSON.parse(atob(payload));
        if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
            throw new Error('token已过期');
        }

        return decodedPayload;
    } catch (error) {
        throw new Error('token验证失败');
    }
}

// HMAC-SHA256签名
async function hmacSHA256(message, secret) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(message);
    return crypto.subtle.sign(
        'HMAC',
        keyData,
        messageData
    );
}

// 认证中间件
export async function authenticate(request) {
    try {
        await verifyToken(request);
        return true;
    } catch (error) {
        return false;
    }
}

// 响应工具函数
export function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json'
        }
    });
} 