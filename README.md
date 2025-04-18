# 现代风格导航网站

这是一个简洁现代的网址导航网站,可以免费部署在Cloudflare Pages上。

## 特点

- 🎨 现代简约的设计风格
- 🔍 实时搜索功能
- 📱 响应式布局,适配各种设备
- ⚡ 快速加载
- 🎯 清晰的分类展示
- ↗️ 平滑的动画效果

## 技术栈

- HTML5
- CSS3 (使用CSS变量和Grid布局)
- JavaScript (原生JS)
- RemixIcon 图标库

## 部署到Cloudflare Pages

1. 首先确保你有一个Cloudflare账号,如果没有请先在 [Cloudflare](https://dash.cloudflare.com/sign-up) 注册

2. 将代码推送到GitHub仓库:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repository-url
   git push -u origin main
   ```

3. 登录Cloudflare Dashboard,进入Pages页面

4. 点击"Create a project"按钮

5. 选择"Connect to Git"

6. 选择你的GitHub仓库

7. 在构建设置中:
   - 构建命令留空
   - 构建输出目录留空
   - 环境变量不需要设置

8. 点击"Save and Deploy"

9. 等待部署完成,Cloudflare会自动生成一个域名供访问

## 自定义

### 修改颜色主题

在`style.css`文件中修改CSS变量:

```css
:root {
    --primary-color: #4a90e2;
    --secondary-color: #2c3e50;
    --background-color: #f5f6fa;
    --text-color: #2c3e50;
    --card-background: #ffffff;
    --hover-color: #3498db;
}
```

### 添加新的网站卡片

在`index.html`文件中的`site-grid`类下添加新的卡片:

```html
<div class="site-card">
    <i class="ri-icon-name"></i>
    <h3>网站名称</h3>
    <p>网站描述</p>
    <a href="网站链接" target="_blank">访问</a>
</div>
```

## 许可

MIT License 