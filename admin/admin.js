// 检查登录状态
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        showLoginForm();
    } else {
        showAdminPanel();
        loadData();
    }
}

// 显示登录表单
function showLoginForm() {
    document.getElementById('loginForm').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
}

// 显示管理面板
function showAdminPanel() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'flex';
}

// 加载数据
async function loadData() {
    try {
        const response = await fetch('/api/data', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        const data = await response.json();
        
        if (data.categories) {
            updateCategoryList(data.categories);
            updateCategorySelect(data.categories);
        }
        if (data.sites) {
            updateSiteList(data.sites);
        }
    } catch (error) {
        console.error('加载数据失败:', error);
    }
}

// 更新分类列表
function updateCategoryList(categories) {
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = categories.map(category => `
        <div class="list-item">
            <div class="list-item-content">
                <h3>${category.name}</h3>
            </div>
            <div class="list-item-actions">
                <button class="edit-btn" onclick="editCategory('${category.id}')">编辑</button>
                <button class="delete-btn" onclick="deleteCategory('${category.id}')">删除</button>
            </div>
        </div>
    `).join('');
}

// 更新分类选择框
function updateCategorySelect(categories) {
    const select = document.getElementById('siteCategory');
    select.innerHTML = '<option value="">选择分类</option>' + 
        categories.map(category => `
            <option value="${category.id}">${category.name}</option>
        `).join('');
}

// 更新网站列表
function updateSiteList(sites) {
    const siteList = document.getElementById('siteList');
    siteList.innerHTML = sites.map(site => `
        <div class="list-item">
            <div class="list-item-content">
                <h3>${site.name}</h3>
                <p>${site.description}</p>
                <small>${site.url}</small>
            </div>
            <div class="list-item-actions">
                <button class="edit-btn" onclick="editSite('${site.id}')">编辑</button>
                <button class="delete-btn" onclick="deleteSite('${site.id}')">删除</button>
            </div>
        </div>
    `).join('');
}

// 处理登录表单提交
document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (data.token) {
            localStorage.setItem('adminToken', data.token);
            showAdminPanel();
            loadData();
        } else {
            alert('登录失败: ' + data.message);
        }
    } catch (error) {
        console.error('登录失败:', error);
        alert('登录失败,请重试');
    }
});

// 处理分类表单提交
document.getElementById('categoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const categoryName = document.getElementById('categoryName').value;

    try {
        const response = await fetch('/api/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({ name: categoryName })
        });

        const data = await response.json();
        if (data.success) {
            document.getElementById('categoryName').value = '';
            loadData();
        } else {
            alert('添加分类失败: ' + data.message);
        }
    } catch (error) {
        console.error('添加分类失败:', error);
        alert('添加分类失败,请重试');
    }
});

// 处理网站表单提交
document.getElementById('siteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
        categoryId: document.getElementById('siteCategory').value,
        name: document.getElementById('siteName').value,
        url: document.getElementById('siteUrl').value,
        description: document.getElementById('siteDesc').value,
        icon: document.getElementById('siteIcon').value
    };

    try {
        const response = await fetch('/api/sites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (data.success) {
            document.getElementById('siteForm').reset();
            loadData();
        } else {
            alert('添加网站失败: ' + data.message);
        }
    } catch (error) {
        console.error('添加网站失败:', error);
        alert('添加网站失败,请重试');
    }
});

// 处理账号设置表单提交
document.getElementById('accountForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        alert('两次输入的密码不一致');
        return;
    }

    try {
        const response = await fetch('/api/account', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({ username: newUsername, password: newPassword })
        });

        const data = await response.json();
        if (data.success) {
            alert('账号信息更新成功');
            document.getElementById('accountForm').reset();
        } else {
            alert('更新失败: ' + data.message);
        }
    } catch (error) {
        console.error('更新失败:', error);
        alert('更新失败,请重试');
    }
});

// 导入书签功能
document.getElementById('importBookmarks').addEventListener('click', async () => {
    try {
        const bookmarks = await chrome.bookmarks.getTree();
        const bookmarksList = document.getElementById('bookmarksList');
        
        function processBookmarks(nodes) {
            let html = '';
            for (const node of nodes) {
                if (node.url) {
                    html += `
                        <div class="list-item">
                            <div class="list-item-content">
                                <h3>${node.title}</h3>
                                <small>${node.url}</small>
                            </div>
                            <div class="list-item-actions">
                                <button onclick="importBookmark('${node.title}', '${node.url}')">导入</button>
                            </div>
                        </div>
                    `;
                }
                if (node.children) {
                    html += processBookmarks(node.children);
                }
            }
            return html;
        }

        bookmarksList.innerHTML = processBookmarks(bookmarks);
    } catch (error) {
        console.error('获取书签失败:', error);
        alert('获取书签失败,请确保允许访问书签权限');
    }
});

// 导入单个书签
async function importBookmark(title, url) {
    const categoryId = document.getElementById('siteCategory').value;
    if (!categoryId) {
        alert('请先选择一个分类');
        return;
    }

    try {
        const response = await fetch('/api/sites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({
                categoryId,
                name: title,
                url: url,
                description: title,
                icon: 'ri-link'
            })
        });

        const data = await response.json();
        if (data.success) {
            alert('书签导入成功');
            loadData();
        } else {
            alert('导入失败: ' + data.message);
        }
    } catch (error) {
        console.error('导入失败:', error);
        alert('导入失败,请重试');
    }
}

// 编辑分类
async function editCategory(id) {
    const newName = prompt('请输入新的分类名称:');
    if (!newName) return;

    try {
        const response = await fetch(`/api/categories/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({ name: newName })
        });

        const data = await response.json();
        if (data.success) {
            loadData();
        } else {
            alert('更新失败: ' + data.message);
        }
    } catch (error) {
        console.error('更新失败:', error);
        alert('更新失败,请重试');
    }
}

// 删除分类
async function deleteCategory(id) {
    if (!confirm('确定要删除这个分类吗?')) return;

    try {
        const response = await fetch(`/api/categories/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        const data = await response.json();
        if (data.success) {
            loadData();
        } else {
            alert('删除失败: ' + data.message);
        }
    } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败,请重试');
    }
}

// 编辑网站
async function editSite(id) {
    // 获取网站信息
    try {
        const response = await fetch(`/api/sites/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        const site = await response.json();

        // 填充表单
        document.getElementById('siteCategory').value = site.categoryId;
        document.getElementById('siteName').value = site.name;
        document.getElementById('siteUrl').value = site.url;
        document.getElementById('siteDesc').value = site.description;
        document.getElementById('siteIcon').value = site.icon;

        // 修改表单提交按钮
        const submitBtn = document.querySelector('#siteForm button[type="submit"]');
        submitBtn.textContent = '更新网站';
        submitBtn.dataset.editId = id;
    } catch (error) {
        console.error('获取网站信息失败:', error);
        alert('获取网站信息失败,请重试');
    }
}

// 删除网站
async function deleteSite(id) {
    if (!confirm('确定要删除这个网站吗?')) return;

    try {
        const response = await fetch(`/api/sites/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        const data = await response.json();
        if (data.success) {
            loadData();
        } else {
            alert('删除失败: ' + data.message);
        }
    } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败,请重试');
    }
}

// 处理导航面板切换
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // 移除所有活动状态
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        // 隐藏所有面板
        document.querySelectorAll('.admin-panel').forEach(p => p.style.display = 'none');
        
        // 添加活动状态并显示对应面板
        btn.classList.add('active');
        const panelId = btn.dataset.panel + 'Panel';
        document.getElementById(panelId).style.display = 'block';
    });
});

// 处理退出登录
document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('确定要退出登录吗?')) {
        localStorage.removeItem('adminToken');
        showLoginForm();
    }
});

// 初始化
checkAuth(); 