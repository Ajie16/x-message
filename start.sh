#!/bin/bash

# X聚合信息 - 启动脚本
# 自动激活虚拟环境并启动 Flask 服务

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}      X聚合信息 - 启动脚本${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}虚拟环境不存在，正在创建...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}虚拟环境创建成功！${NC}"
fi

# 激活虚拟环境
echo -e "${BLUE}正在激活虚拟环境...${NC}"
source venv/bin/activate

# 检查依赖
echo -e "${BLUE}检查依赖...${NC}"
if ! pip show flask > /dev/null 2>&1; then
    echo -e "${YELLOW}Flask 未安装，正在安装依赖...${NC}"
    pip install -r requirements.txt
    echo -e "${GREEN}依赖安装完成！${NC}"
else
    echo -e "${GREEN}依赖已安装${NC}"
fi

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  服务即将启动...${NC}"
echo -e "${GREEN}  访问地址: http://localhost:8081${NC}"
echo -e "${GREEN}  按 Ctrl+C 停止服务${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

# 启动服务
python app.py

# 如果服务异常退出
echo ""
echo -e "${RED}服务已停止${NC}"

# 退出虚拟环境
deactivate
