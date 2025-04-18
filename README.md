# 导航网站

一个基于 Cloudflare Workers 的导航网站，包含管理后台功能。

## 功能特点

- 分类管理：添加、编辑、删除分类
- 网站管理：添加、编辑、删除网站
- 书签导入：支持从浏览器导出文件导入书签
- 用户认证：基于 JWT 的安全认证
- 响应式设计：支持移动端访问

## 技术栈

- Cloudflare Workers
- TypeScript
- Webpack
- JWT 认证
- KV 存储

## 开发环境设置

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 构建项目：
```bash
npm run build
```

4. 部署到 Cloudflare：
```bash
npm run deploy
```

## 环境变量

在 `wrangler.toml` 中配置以下环境变量：

- `JWT_SECRET`：JWT 签名密钥
- `NAVIGATION_KV`：KV 存储命名空间

## 目录结构

```
.
├── functions/           # Cloudflare Workers 函数
│   ├── api/            # API 处理器
│   ├── index.ts        # 入口文件
│   └── types.d.ts      # 类型定义
├── public/             # 静态文件
│   ├── admin/          # 管理后台
│   └── index.html      # 首页
├── package.json        # 项目配置
├── tsconfig.json       # TypeScript 配置
├── webpack.config.js   # Webpack 配置
└── wrangler.toml       # Cloudflare Workers 配置
```

## 许可证

MIT 