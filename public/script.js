// API基础URL
const API_BASE_URL = '/api';

// 全局变量
let categories = [];
let sites = [];
let currentCategory = null;

// DOM元素
const categoryNav = document.getElementById('category-nav');
const sitesContainer = document.getElementById('sites-container');

// 初始化
async function init() {
    try {
        await Promise.all([
            loadCategories(),
            loadSites()
        ]);
        renderCategories();
        renderSites();
    } catch (error) {
        console.error('初始化失败:', error);
        showError('加载数据失败，请刷新页面重试');
    }
}

// 加载分类
async function loadCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) {
        throw new Error('加载分类失败');
    }
    categories = await response.json();
}

// 加载网站
async function loadSites() {
    const response = await fetch(`${API_BASE_URL}/sites`);
    if (!response.ok) {
        throw new Error('加载网站失败');
    }
    sites = await response.json();
}

// 渲染分类
function renderCategories() {
    categoryNav.innerHTML = `
        <button class="category-btn ${!currentCategory ? 'active' : ''}" 
                onclick="filterSites(null)">
            全部
        </button>
        ${categories.map(category => `
            <button class="category-btn ${currentCategory === category.id ? 'active' : ''}"
                    onclick="filterSites('${category.id}')">
                ${category.name}
            </button>
        `).join('')}
    `;
}

// 渲染网站
function renderSites(filteredSites = sites) {
    sitesContainer.innerHTML = filteredSites.map(site => `
        <div class="site-card">
            <h3>${site.name}</h3>
            <p>${site.description || ''}</p>
            <a href="${site.url}" target="_blank">访问</a>
        </div>
    `).join('');
}

// 过滤网站
function filterSites(categoryId) {
    currentCategory = categoryId;
    const filteredSites = categoryId
        ? sites.filter(site => site.categoryId === categoryId)
        : sites;
    renderCategories();
    renderSites(filteredSites);
}

// 显示错误信息
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--danger-color);
        color: white;
        padding: 1rem;
        border-radius: 4px;
        z-index: 1000;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

document.addEventListener('DOMContentLoaded', function() {
    // 获取返回顶部按钮
    const backToTopButton = document.getElementById('back-to-top');
    
    // 搜索功能
    const searchInput = document.getElementById('search');
    const siteCards = document.querySelectorAll('.site-card');
    
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        
        siteCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
    
    // 返回顶部按钮显示/隐藏逻辑
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.style.display = 'flex';
        } else {
            backToTopButton.style.display = 'none';
        }
    });
    
    // 返回顶部功能
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // 添加网站卡片的动画效果
    siteCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}); 