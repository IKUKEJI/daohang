const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 要上传的文件列表
const files = [
    'public/index.html',
    'public/style.css',
    'public/script.js',
    'admin/index.html',
    'admin/style.css',
    'admin/script.js'
];

// 上传文件到KV存储
async function uploadFiles() {
    for (const file of files) {
        if (!fs.existsSync(file)) {
            console.error(`文件不存在: ${file}`);
            continue;
        }

        const content = fs.readFileSync(file, 'utf8');
        const key = file.replace('public/', '').replace('admin/', 'admin/');

        try {
            // 使用wrangler命令上传文件
            const command = `wrangler kv:key put "${key}" "${content.replace(/"/g, '\\"')}"`;
            execSync(command, { stdio: 'inherit' });
            console.log(`成功上传: ${key}`);
        } catch (error) {
            console.error(`上传失败 ${key}:`, error.message);
        }
    }
}

// 执行上传
uploadFiles().catch(console.error); 