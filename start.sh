#!/bin/sh

# OpenAgent / X-Message - 统一启动脚本
# 支持启动主项目或OpenAgent官网

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# 显示菜单
echo "======================================"
echo "      请选择要启动的项目"
echo "======================================"
echo ""
echo "1) X-Message 主项目 (Flask后端，端口8081)"
echo "2) OpenAgent 官网 (静态网站，端口8082)"
echo ""
printf "请输入选项 (1-2，默认为1): "
read -r choice

# 默认选项
if [ -z "$choice" ]; then
    choice=1
fi

case $choice in
    1)
        echo ""
        echo "======================================"
        echo "    启动 X-Message 主项目"
        echo "======================================"
        echo ""
        
        # 检查虚拟环境
        if [ ! -d "venv" ]; then
            echo "虚拟环境不存在，正在创建..."
            python3 -m venv venv
            echo "虚拟环境创建成功！"
        fi
        
        # 激活虚拟环境
        echo "正在激活虚拟环境..."
        . venv/bin/activate
        
        # 检查依赖
        echo "检查依赖..."
        if ! pip show flask > /dev/null 2>&1; then
            echo "Flask 未安装，正在安装依赖..."
            pip install -r requirements.txt
            echo "依赖安装完成！"
        else
            echo "依赖已安装"
        fi
        
        echo ""
        echo "======================================"
        echo "  服务即将启动..."
        echo "  访问地址: http://localhost:8081"
        echo "  按 Ctrl+C 停止服务"
        echo "======================================"
        echo ""
        
        # 启动服务
        python app.py
        
        echo ""
        echo "服务已停止"
        ;;
        
    2)
        echo ""
        echo "======================================"
        echo "    启动 OpenAgent 官网"
        echo "======================================"
        echo ""
        
        cd openagent-website
        PORT=8082
        
        # 查找可用的HTTP服务器
        if command -v python3 > /dev/null 2>&1; then
            echo "使用 Python HTTP 服务器..."
            echo ""
            echo "======================================"
            echo "  服务即将启动..."
            echo "  访问地址: http://localhost:$PORT"
            echo "  按 Ctrl+C 停止服务"
            echo "======================================"
            echo ""
            python3 -m http.server $PORT
            
        elif command -v python > /dev/null 2>&1; then
            echo "使用 Python HTTP 服务器..."
            echo ""
            echo "======================================"
            echo "  服务即将启动..."
            echo "  访问地址: http://localhost:$PORT"
            echo "  按 Ctrl+C 停止服务"
            echo "======================================"
            echo ""
            python -m http.server $PORT
            
        elif command -v npx > /dev/null 2>&1; then
            echo "使用 npx serve 启动..."
            echo ""
            echo "======================================"
            echo "  服务即将启动..."
            echo "  访问地址: http://localhost:$PORT"
            echo "  按 Ctrl+C 停止服务"
            echo "======================================"
            echo ""
            npx serve . -l $PORT
            
        elif command -v node > /dev/null 2>&1; then
            echo "使用 Node.js 启动..."
            echo ""
            echo "======================================"
            echo "  服务即将启动..."
            echo "  访问地址: http://localhost:$PORT"
            echo "  按 Ctrl+C 停止服务"
            echo "======================================"
            echo ""
            node -e "
                const http = require('http');
                const fs = require('fs');
                const path = require('path');
                
                const server = http.createServer((req, res) => {
                    let filePath = '.' + req.url;
                    if (filePath === './') filePath = './index.html';
                    
                    const extname = String(path.extname(filePath)).toLowerCase();
                    const mimeTypes = {
                        '.html': 'text/html',
                        '.js': 'text/javascript',
                        '.css': 'text/css',
                        '.json': 'application/json',
                        '.png': 'image/png',
                        '.jpg': 'image/jpg',
                        '.gif': 'image/gif',
                        '.svg': 'image/svg+xml',
                        '.wav': 'audio/wav',
                        '.mp4': 'video/mp4',
                        '.woff': 'application/font-woff',
                        '.ttf': 'application/font-ttf',
                        '.eot': 'application/vnd.ms-fontobject',
                        '.otf': 'application/font-otf',
                        '.wasm': 'application/wasm'
                    };
                    
                    const contentType = mimeTypes[extname] || 'application/octet-stream';
                    
                    fs.readFile(filePath, (error, content) => {
                        if (error) {
                            if(error.code == 'ENOENT') {
                                res.writeHead(404, { 'Content-Type': 'text/html' });
                                res.end('<h1>404 Not Found</h1>', 'utf-8');
                            } else {
                                res.writeHead(500);
                                res.end('Server Error: ' + error.code + ' ..\n');
                            }
                        } else {
                            res.writeHead(200, { 'Content-Type': contentType });
                            res.end(content, 'utf-8');
                        }
                    });
                });
                
                server.listen($PORT);
                console.log('Server running at http://localhost:$PORT/');
            "
        else
            echo "错误: 未找到可用的HTTP服务器"
            echo "请安装 Python3 或 Node.js"
            exit 1
        fi
        
        echo ""
        echo "服务已停止"
        ;;
        
    *)
        echo "无效选项，请重新运行脚本"
        exit 1
        ;;
esac
