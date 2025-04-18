// API 基础URL
const API_BASE_URL = '/api';

// 全局变量
let token = localStorage.getItem('token');

// DOM 元素
const loginPage = document.getElementById('loginPage');
const adminPage = document.getElementById('adminPage');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const menuItems = document.querySelectorAll('.menu-item');
const pages = document.querySelectorAll('.page');

// 登录表单处理
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            token = data.token;
            localStorage.setItem('token', token);
            showAdminPage();
        } else {
            alert('登录失败：' + await response.text());
        }
    } catch (error) {
        alert('登录失败：' + error.message);
    }
});

// 退出登录
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    token = null;
    showLoginPage();
});

// 显示登录页面
function showLoginPage() {
    loginPage.style.display = 'flex';
    adminPage.style.display = 'none';
}

// 显示管理页面
function showAdminPage() {
    loginPage.style.display = 'none';
    adminPage.style.display = 'flex';
    loadCategories();
    loadSites();
}

// 菜单切换
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        const targetPage = item.dataset.page;
        menuItems.forEach(i => i.classList.remove('active'));
        pages.forEach(p => p.classList.remove('active'));
        item.classList.add('active');
        document.getElementById(`${targetPage}Page`).classList.add('active');
    });
});

// 分类管理
const categoryForm = document.getElementById('categoryForm');
const categoriesList = document.getElementById('categoriesList');

categoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('categoryName').value;
    const description = document.getElementById('categoryDescription').value;

    try {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, description })
        });

        if (response.ok) {
            categoryForm.reset();
            loadCategories();
        } else {
            alert('添加分类失败：' + await response.text());
        }
    } catch (error) {
        alert('添加分类失败：' + error.message);
    }
});

// 加载分类列表
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const categories = await response.json();
            renderCategories(categories);
            updateCategorySelects(categories);
        } else {
            alert('加载分类失败：' + await response.text());
        }
    } catch (error) {
        alert('加载分类失败：' + error.message);
    }
}

// 渲染分类列表
function renderCategories(categories) {
    categoriesList.innerHTML = categories.map(category => `
        <div class="list-item">
            <div>
                <h4>${category.name}</h4>
                <p>${category.description || ''}</p>
            </div>
            <div class="list-item-actions">
                <button class="btn-edit" onclick="editCategory('${category.id}')">
                    <i class="ri-edit-line"></i>
                </button>
                <button class="btn-delete" onclick="deleteCategory('${category.id}')">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// 更新分类选择框
function updateCategorySelects(categories) {
    const categorySelects = document.querySelectorAll('#siteCategory, #bookmarksCategory');
    categorySelects.forEach(select => {
        select.innerHTML = categories.map(category => 
            `<option value="${category.id}">${category.name}</option>`
        ).join('');
    });
}

// 编辑分类
async function editCategory(id) {
    const name = prompt('请输入新的分类名称：');
    if (!name) return;

    const description = prompt('请输入新的分类描述：');

    try {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id, name, description })
        });

        if (response.ok) {
            loadCategories();
        } else {
            alert('更新分类失败：' + await response.text());
        }
    } catch (error) {
        alert('更新分类失败：' + error.message);
    }
}

// 删除分类
async function deleteCategory(id) {
    if (!confirm('确定要删除这个分类吗？')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id })
        });

        if (response.ok) {
            loadCategories();
        } else {
            alert('删除分类失败：' + await response.text());
        }
    } catch (error) {
        alert('删除分类失败：' + error.message);
    }
}

// 网站管理
const siteForm = document.getElementById('siteForm');
const sitesList = document.getElementById('sitesList');

siteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('siteName').value;
    const url = document.getElementById('siteUrl').value;
    const description = document.getElementById('siteDescription').value;
    const categoryId = document.getElementById('siteCategory').value;
    const icon = document.getElementById('siteIcon').value;

    try {
        const response = await fetch(`${API_BASE_URL}/sites`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, url, description, categoryId, icon })
        });

        if (response.ok) {
            siteForm.reset();
            loadSites();
        } else {
            alert('添加网站失败：' + await response.text());
        }
    } catch (error) {
        alert('添加网站失败：' + error.message);
    }
});

// 加载网站列表
async function loadSites() {
    try {
        const response = await fetch(`${API_BASE_URL}/sites`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const sites = await response.json();
            renderSites(sites);
        } else {
            alert('加载网站失败：' + await response.text());
        }
    } catch (error) {
        alert('加载网站失败：' + error.message);
    }
}

// 渲染网站列表
function renderSites(sites) {
    sitesList.innerHTML = sites.map(site => `
        <div class="list-item">
            <div>
                <h4>${site.name}</h4>
                <p>${site.description || ''}</p>
                <a href="${site.url}" target="_blank">${site.url}</a>
            </div>
            <div class="list-item-actions">
                <button class="btn-edit" onclick="editSite('${site.id}')">
                    <i class="ri-edit-line"></i>
                </button>
                <button class="btn-delete" onclick="deleteSite('${site.id}')">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// 编辑网站
async function editSite(id) {
    const name = prompt('请输入新的网站名称：');
    if (!name) return;

    const url = prompt('请输入新的网站地址：');
    if (!url) return;

    const description = prompt('请输入新的网站描述：');
    const categoryId = document.getElementById('siteCategory').value;
    const icon = prompt('请输入新的图标URL或类名：');

    try {
        const response = await fetch(`${API_BASE_URL}/sites`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id, name, url, description, categoryId, icon })
        });

        if (response.ok) {
            loadSites();
        } else {
            alert('更新网站失败：' + await response.text());
        }
    } catch (error) {
        alert('更新网站失败：' + error.message);
    }
}

// 删除网站
async function deleteSite(id) {
    if (!confirm('确定要删除这个网站吗？')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/sites`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id })
        });

        if (response.ok) {
            loadSites();
        } else {
            alert('删除网站失败：' + await response.text());
        }
    } catch (error) {
        alert('删除网站失败：' + error.message);
    }
}

// 书签导入
const bookmarksForm = document.getElementById('bookmarksForm');

bookmarksForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('bookmarksFile').files[0];
    const categoryId = document.getElementById('bookmarksCategory').value;

    if (!file) {
        alert('请选择书签文件');
        return;
    }

    try {
        const text = await file.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const bookmarks = Array.from(doc.querySelectorAll('a')).map(a => ({
            name: a.textContent,
            url: a.href,
            description: a.title || ''
        }));

        const response = await fetch(`${API_BASE_URL}/bookmarks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ bookmarks, categoryId })
        });

        if (response.ok) {
            bookmarksForm.reset();
            alert('书签导入成功');
            loadSites();
        } else {
            alert('导入书签失败：' + await response.text());
        }
    } catch (error) {
        alert('导入书签失败：' + error.message);
    }
});

// 账号设置
const accountForm = document.getElementById('accountForm');

accountForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('newUsername').value;
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ username, oldPassword, newPassword })
        });

        if (response.ok) {
            accountForm.reset();
            alert('账号更新成功，请重新登录');
            logoutBtn.click();
        } else {
            alert('更新账号失败：' + await response.text());
        }
    } catch (error) {
        alert('更新账号失败：' + error.message);
    }
});

// 检查登录状态
if (token) {
    showAdminPage();
} else {
    showLoginPage();
} 