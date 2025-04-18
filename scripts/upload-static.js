const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const publicDir = path.join(__dirname, '..', 'public');

// 递归读取目录中的所有文件
function getAllFiles(dir) {
    const files = [];
    
    function traverse(currentDir) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);
            if (entry.isDirectory()) {
                traverse(fullPath);
            } else {
                const relativePath = path.relative(publicDir, fullPath);
                files.push({
                    path: relativePath.replace(/\\/g, '/'),
                    fullPath
                });
            }
        }
    }
    
    traverse(dir);
    return files;
}

// 上传文件到 KV 存储
async function uploadFiles() {
    try {
        const files = getAllFiles(publicDir);
        
        for (const file of files) {
            const content = fs.readFileSync(file.fullPath, 'utf-8');
            const command = `wrangler kv:key put --binding=NAVIGATION_KV "${file.path}" "${content}"`;
            
            console.log(`上传文件: ${file.path}`);
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`上传失败 ${file.path}:`, error);
                    return;
                }
                if (stderr) {
                    console.error(`警告 ${file.path}:`, stderr);
                    return;
                }
                console.log(`成功上传: ${file.path}`);
            });
        }
    } catch (error) {
        console.error('上传过程中出错:', error);
    }
}

uploadFiles(); 