# 现代风格导航网站

一个可以免费部署在 Cloudflare Pages 上的现代风格导航网站。

## 功能特点

- 现代设计风格
- 实时搜索功能
- 响应式布局
- 快速加载
- 清晰的分类
- 平滑的动画效果
- 后台管理系统
  - 用户认证
  - 分类管理
  - 网站管理
  - 书签导入
  - 账户设置

## 技术栈

- HTML5
- CSS3 (CSS 变量、Grid 布局)
- JavaScript (原生 JS)
- RemixIcon 图标库
- Cloudflare Workers
- Cloudflare KV 存储

## 部署说明

### 准备工作

1. 创建 Cloudflare 账户
2. 安装 Wrangler CLI: `npm install -g wrangler`
3. 登录 Wrangler: `wrangler login`

### 创建 KV 命名空间

```bash
# 创建生产环境 KV 命名空间
wrangler kv:namespace create "NAVIGATION_KV"

# 创建预览环境 KV 命名空间
wrangler kv:namespace create "NAVIGATION_KV" --preview
```

### 配置项目

1. 克隆项目到本地
2. 修改 `wrangler.toml` 文件：
   - 替换 `your-kv-namespace-id` 为实际的 KV 命名空间 ID
   - 替换 `your-preview-kv-namespace-id` 为实际的预览 KV 命名空间 ID
   - 设置 `JWT_SECRET` 环境变量

### 部署步骤

1. 将代码推送到 GitHub 仓库
2. 登录 Cloudflare Dashboard
3. 进入 Pages 页面
4. 点击 "Create a project"
5. 选择 "Connect to Git"
6. 选择你的 GitHub 仓库
7. 配置构建设置：
   - 构建命令：`npm run build`
   - 构建输出目录：`dist`
8. 点击 "Save and Deploy"

## 后台管理

### 访问后台

访问 `/admin` 路径进入后台管理界面。

### 默认账户

- 用户名：admin
- 密码：admin

### 功能说明

1. 用户认证
   - 登录/退出
   - 修改账户信息

2. 分类管理
   - 添加分类
   - 编辑分类
   - 删除分类

3. 网站管理
   - 添加网站
   - 编辑网站
   - 删除网站

4. 书签导入
   - 支持导入浏览器书签
   - 自动分类
   - 错误处理

## 自定义

### 修改主题颜色

在 `style.css` 文件中修改 CSS 变量：

```css
:root {
    --primary-color: #你的颜色;
    --secondary-color: #你的颜色;
    --background-color: #你的颜色;
    --text-color: #你的颜色;
    --card-background: #你的颜色;
    --hover-color: #你的颜色;
}
```

### 添加新网站

在 `index.html` 文件中添加新的网站卡片：

```html
<div class="site-card">
    <div class="site-icon">
        <i class="ri-你的图标"></i>
    </div>
    <h3>网站名称</h3>
    <p>网站描述</p>
    <a href="网站链接" target="_blank">访问网站</a>
</div>
```

## 许可证

MIT License 