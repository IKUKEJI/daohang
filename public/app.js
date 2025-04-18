// 全局状态
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
            ? `/api/sites?category=${currentCategory}` 
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
    categoriesContainer.innerHTML = categories.map(category => `
        <div class="category ${currentCategory === category.id ? 'active' : ''}"
             onclick="selectCategory('${category.id}')">
            ${category.name}
        </div>
    `).join('');
}

// 渲染网站
function renderSites() {
    sitesContainer.innerHTML = sites.map(site => `
        <div class="site-card">
            <h3>${site.name}</h3>
            <p>${site.description || ''}</p>
            <a href="${site.url}" target="_blank" rel="noopener noreferrer">访问网站</a>
        </div>
    `).join('');
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
init(); 