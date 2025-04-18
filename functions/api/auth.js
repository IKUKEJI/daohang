import { sign, verify } from 'jsonwebtoken';
import { compare, hash } from 'bcryptjs';

const JWT_SECRET = 'your-jwt-secret-key'; // 在生产环境中应该使用环境变量

// 验证 token
export async function verifyToken(request, env) {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
        return null;
    }

    try {
        const payload = verify(token, JWT_SECRET);
        return payload;
    } catch (error) {
        return null;
    }
}

// 登录
export async function onRequestPost(context) {
    const { request, env } = context;
    const { username, password } = await request.json();

    // 获取用户信息
    const users = await env.NAVIGATION_KV.get('users', 'json') || [];
    const defaultUser = {
        id: '1',
        username: 'admin',
        password: 'admin', // 在生产环境中应该使用加密密码
        createdAt: new Date().toISOString()
    };

    // 如果没有用户，创建默认用户
    if (users.length === 0) {
        users.push(defaultUser);
        await env.NAVIGATION_KV.put('users', JSON.stringify(users));
    }

    // 验证用户名和密码
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return new Response(JSON.stringify({
            success: false,
            message: '用户名或密码错误'
        }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 生成 token
    const token = sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    return new Response(JSON.stringify({
        success: true,
        data: {
            token,
            user: {
                id: user.id,
                username: user.username
            }
        }
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

// 更新用户信息
export async function onRequestPut(context) {
    const { request, env } = context;
    
    // 验证 token
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

    const { username, oldPassword, newPassword } = await request.json();
    if (!username || !oldPassword || !newPassword) {
        return new Response(JSON.stringify({
            success: false,
            message: '用户名、旧密码和新密码不能为空'
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 获取用户信息
    const users = await env.NAVIGATION_KV.get('users', 'json') || [];
    const userIndex = users.findIndex(u => u.id === payload.userId);
    
    if (userIndex === -1) {
        return new Response(JSON.stringify({
            success: false,
            message: '用户不存在'
        }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 验证旧密码
    if (users[userIndex].password !== oldPassword) {
        return new Response(JSON.stringify({
            success: false,
            message: '旧密码错误'
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 检查新用户名是否与其他用户重复
    if (users.some(u => u.username === username && u.id !== payload.userId)) {
        return new Response(JSON.stringify({
            success: false,
            message: '用户名已存在'
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 更新用户信息
    users[userIndex] = {
        ...users[userIndex],
        username,
        password: newPassword,
        updatedAt: new Date().toISOString()
    };

    await env.NAVIGATION_KV.put('users', JSON.stringify(users));

    return new Response(JSON.stringify({
        success: true,
        data: {
            id: users[userIndex].id,
            username: users[userIndex].username
        }
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

// 获取当前用户信息
export async function onRequestGet(context) {
    const { request, env } = context;
    
    // 验证 token
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

    // 获取用户信息
    const user = await env.NAVIGATION_KV.get('admin_user', 'json');
    if (!user) {
        return new Response(JSON.stringify({
            success: false,
            message: '用户不存在'
        }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({
        success: true,
        data: {
            username: user.username
        }
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
} 