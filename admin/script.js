// API 基础 URL
const API_BASE_URL = '/api';

// 全局状态
let currentUser = null;
let token = localStorage.getItem('token');

// DOM 元素
const loginForm = document.getElementById('loginForm');
const adminPanel = document.getElementById('adminPanel');
const categoryForm = document.getElementById('categoryForm');
const siteForm = document.getElementById('siteForm');
const importForm = document.getElementById('importForm');
const accountForm = document.getElementById('accountForm');
const categoryList = document.getElementById('categoryList');
const siteList = document.getElementById('siteList');

// 检查登录状态
function checkAuth() {
    if (token) {
        showAdminPanel();
        loadData();
    } else {
        showLoginForm();
    }
}

// 显示登录表单
function showLoginForm() {
    loginForm.style.display = 'block';
    adminPanel.style.display = 'none';
}

// 显示管理面板
function showAdminPanel() {
    loginForm.style.display = 'none';
    adminPanel.style.display = 'block';
}

// 加载数据
async function loadData() {
    await Promise.all([
        loadCategories(),
        loadSites()
    ]);
}

// 加载分类列表
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const { success, data } = await response.json();
        
        if (success) {
            renderCategories(data);
        }
    } catch (error) {
        console.error('加载分类失败:', error);
        showError('加载分类失败');
    }
}

// 加载网站列表
async function loadSites() {
    try {
        const response = await fetch(`${API_BASE_URL}/sites`);
        const { success, data } = await response.json();
        
        if (success) {
            renderSites(data);
        }
    } catch (error) {
        console.error('加载网站失败:', error);
        showError('加载网站失败');
    }
}

// 渲染分类列表
function renderCategories(categories) {
    categoryList.innerHTML = categories.map(category => `
        <div class="list-item">
            <div class="list-item-content">
                <h3>${category.name}</h3>
                <p>${category.description || '无描述'}</p>
            </div>
            <div class="list-item-actions">
                <button onclick="editCategory('${category.id}')" class="btn btn-primary">编辑</button>
                <button onclick="deleteCategory('${category.id}')" class="btn btn-danger">删除</button>
            </div>
        </div>
    `).join('');
}

// 渲染网站列表
function renderSites(sites) {
    siteList.innerHTML = sites.map(site => `
        <div class="list-item">
            <div class="list-item-content">
                <h3>${site.name}</h3>
                <p>${site.description || '无描述'}</p>
                <a href="${site.url}" target="_blank">${site.url}</a>
            </div>
            <div class="list-item-actions">
                <button onclick="editSite('${site.id}')" class="btn btn-primary">编辑</button>
                <button onclick="deleteSite('${site.id}')" class="btn btn-danger">删除</button>
            </div>
        </div>
    `).join('');
}

// 显示错误信息
function showError(message) {
    alert(message);
}

// 显示成功信息
function showSuccess(message) {
    alert(message);
}

// 登录表单提交
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const { success, data, message } = await response.json();
        
        if (success) {
            token = data.token;
            currentUser = data.user;
            localStorage.setItem('token', token);
            showAdminPanel();
            loadData();
        } else {
            showError(message);
        }
    } catch (error) {
        console.error('登录失败:', error);
        showError('登录失败');
    }
});

// 分类表单提交
categoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(categoryForm);
    const data = {
        name: formData.get('name'),
        description: formData.get('description')
    };

    try {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const { success, message } = await response.json();
        
        if (success) {
            showSuccess('分类添加成功');
            categoryForm.reset();
            loadCategories();
        } else {
            showError(message);
        }
    } catch (error) {
        console.error('添加分类失败:', error);
        showError('添加分类失败');
    }
});

// 网站表单提交
siteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(siteForm);
    const data = {
        name: formData.get('name'),
        url: formData.get('url'),
        description: formData.get('description'),
        categoryId: formData.get('categoryId'),
        icon: formData.get('icon')
    };

    try {
        const response = await fetch(`${API_BASE_URL}/sites`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const { success, message } = await response.json();
        
        if (success) {
            showSuccess('网站添加成功');
            siteForm.reset();
            loadSites();
        } else {
            showError(message);
        }
    } catch (error) {
        console.error('添加网站失败:', error);
        showError('添加网站失败');
    }
});

// 导入表单提交
importForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(importForm);
    const categoryId = formData.get('categoryId');
    const file = formData.get('bookmarks');

    if (!file) {
        showError('请选择书签文件');
        return;
    }

    try {
        const text = await file.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const bookmarks = Array.from(doc.querySelectorAll('a')).map(a => ({
            name: a.textContent.trim(),
            url: a.href,
            description: a.title || ''
        }));

        const response = await fetch(`${API_BASE_URL}/import`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ bookmarks, categoryId })
        });

        const { success, data, message } = await response.json();
        
        if (success) {
            showSuccess(`成功导入 ${data.imported} 个书签${data.errors ? `，${data.errors.length} 个错误` : ''}`);
            importForm.reset();
            loadSites();
        } else {
            showError(message);
        }
    } catch (error) {
        console.error('导入书签失败:', error);
        showError('导入书签失败');
    }
});

// 账户表单提交
accountForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(accountForm);
    const data = {
        username: formData.get('username'),
        oldPassword: formData.get('oldPassword'),
        newPassword: formData.get('newPassword')
    };

    try {
        const response = await fetch(`${API_BASE_URL}/auth`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const { success, message } = await response.json();
        
        if (success) {
            showSuccess('账户信息更新成功');
            accountForm.reset();
        } else {
            showError(message);
        }
    } catch (error) {
        console.error('更新账户信息失败:', error);
        showError('更新账户信息失败');
    }
});

// 编辑分类
async function editCategory(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const { success, data } = await response.json();
        
        if (success) {
            const category = data.find(c => c.id === id);
            if (category) {
                const name = prompt('请输入新的分类名称:', category.name);
                const description = prompt('请输入新的分类描述:', category.description);
                
                if (name) {
                    const updateResponse = await fetch(`${API_BASE_URL}/categories`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            id,
                            name,
                            description
                        })
                    });

                    const { success, message } = await updateResponse.json();
                    
                    if (success) {
                        showSuccess('分类更新成功');
                        loadCategories();
                    } else {
                        showError(message);
                    }
                }
            }
        }
    } catch (error) {
        console.error('编辑分类失败:', error);
        showError('编辑分类失败');
    }
}

// 删除分类
async function deleteCategory(id) {
    if (confirm('确定要删除这个分类吗？')) {
        try {
            const response = await fetch(`${API_BASE_URL}/categories`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id })
            });

            const { success, message } = await response.json();
            
            if (success) {
                showSuccess('分类删除成功');
                loadCategories();
            } else {
                showError(message);
            }
        } catch (error) {
            console.error('删除分类失败:', error);
            showError('删除分类失败');
        }
    }
}

// 编辑网站
async function editSite(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/sites`);
        const { success, data } = await response.json();
        
        if (success) {
            const site = data.find(s => s.id === id);
            if (site) {
                const name = prompt('请输入新的网站名称:', site.name);
                const url = prompt('请输入新的网站 URL:', site.url);
                const description = prompt('请输入新的网站描述:', site.description);
                
                if (name && url) {
                    const updateResponse = await fetch(`${API_BASE_URL}/sites`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            id,
                            name,
                            url,
                            description,
                            categoryId: site.categoryId
                        })
                    });

                    const { success, message } = await updateResponse.json();
                    
                    if (success) {
                        showSuccess('网站更新成功');
                        loadSites();
                    } else {
                        showError(message);
                    }
                }
            }
        }
    } catch (error) {
        console.error('编辑网站失败:', error);
        showError('编辑网站失败');
    }
}

// 删除网站
async function deleteSite(id) {
    if (confirm('确定要删除这个网站吗？')) {
        try {
            const response = await fetch(`${API_BASE_URL}/sites`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id })
            });

            const { success, message } = await response.json();
            
            if (success) {
                showSuccess('网站删除成功');
                loadSites();
            } else {
                showError(message);
            }
        } catch (error) {
            console.error('删除网站失败:', error);
            showError('删除网站失败');
        }
    }
}

// 退出登录
function logout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    showLoginForm();
}

// 初始化
checkAuth(); 