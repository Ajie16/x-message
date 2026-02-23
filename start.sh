#!/bin/sh

# X聚合信息 - 启动脚本
# 自动激活虚拟环境并启动 Flask 服务

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "======================================"
echo "      X聚合信息 - 启动脚本"
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
# 使用 . 替代 source，兼容 sh
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

# 如果服务异常退出
echo ""
echo "服务已停止"
