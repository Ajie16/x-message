# AGENTS.md - X-Message 开发指南

本文档为在此代码库中工作的 AI 代理提供开发规范。

## 1. 项目概述

- **项目类型**: Flask Python Web 应用
- **主入口**: `app.py`
- **前端**: 原生 JavaScript (`static/js/main.js`) + Jinja2 模板
- **Python 版本**: 3.8+
- **依赖管理**: `requirements.txt`

## 2. 运行命令

### 启动服务
```bash
./start.sh          # 推荐
python app.py       # 直接运行
source venv/bin/activate && python app.py  # 手动激活虚拟环境
```
访问: http://localhost:8081

### 安装依赖
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 代码检查 (Python)
```bash
pip install flake8
flake8 .                           # 检查整个项目
flake8 app.py --show-source       # 详细模式
```

### 测试运行
当前项目没有单元测试。如需添加测试:
```bash
pip install pytest
pytest                 # 运行所有测试
pytest tests/test_app.py::test_api_config -v  # 单个测试函数
```

## 3. 代码风格指南

### 3.1 Python 风格 (app.py)

#### 导入顺序 (PEP 8)
```python
# 1. 标准库
import json, os, re
from datetime import datetime
from pathlib import Path

# 2. 第三方库
import markdown
from flask import Flask, jsonify, render_template

# 3. 本地模块
# from . import utils
```

#### 命名约定
- **函数/变量**: `snake_case` (如 `load_comments`)
- **类名**: `PascalCase` (如 `CustomError`)
- **常量**: `UPPER_SNAKE_CASE`
- **私有函数**: 前缀 `_` (如 `_internal_helper`)

#### 类型注解
```python
def load_comments() -> dict:
    """加载评论数据"""
    ...

def get_md_files(directory: str) -> list[dict]:
    ...
```

#### 错误处理
- 使用具体异常类型，避免 bare `except`:
```python
# ❌ 不好
try: ...
except: pass

# ✅ 好
try: ...
except FileNotFoundError as e:
    print(f"File not found: {e}")
except Exception as e:
    print(f"Error reading {md_file}: {e}")
```

#### Flask 路由组织
```python
# ==================== 路由 ====================
@app.route('/')
def index():
    return render_template('index.html', config=config)

# ==================== API ====================
@app.route('/api/config')
def api_config():
    ...
```

### 3.2 JavaScript 风格 (static/js/main.js)

#### 基本规范
- 使用 `'use strict'`
- 使用 IIFE: `(function() { ... })();`
- ES6+ 语法 (const/let, 箭头函数, 模板字符串)

#### 命名约定
- **变量/函数**: `camelCase` (如 `loadConfig`)
- **常量**: `UPPER_SNAKE_CASE` (如 `CONFIG`)
- **DOM 元素**: 前缀 `elements` (如 `elements.navbar`)

#### 代码组织顺序
```javascript
// 1. Configuration → 2. State → 3. DOM Elements
// 4. Utils → 5. API → 6. Feature Modules → 7. Initialize
```

#### 错误处理
```javascript
async function loadConfig() {
    try {
        const data = await apiGet('/api/config');
    } catch (error) {
        console.error('加载配置失败:', error);
    }
}
```

### 3.3 HTML/模板
- Jinja2: `{{ variable }}`, `{% if %}`, `{% for %}`, `|`
- HTML 属性顺序: `id`, `class`, `name`, `data-*`, `src`/`href`, `alt`/`title`

## 4. 配置管理

所有配置通过 `config.json` 管理:
- `site`: 站点信息 (端口、调试模式)
- `author`: 作者信息
- `links`: 社交链接
- `content`: 内容路径配置
- `comments`: 评论系统配置
- `theme`: 主题颜色

**注意**: 修改配置后需重启服务生效。

## 5. 常见开发任务

### 添加新 API 端点
```python
@app.route('/api/new_endpoint', methods=['GET'])
def api_new_endpoint():
    """新接口说明"""
    return jsonify({'data': ...})
```

### 添加前端功能
1. 在 `elements` 添加 DOM 引用
2. 创建 `initXxx()` 初始化函数
3. 在 `init()` 中调用

### 添加 Markdown 内容
- 项目: `content/projects/`
- 资讯: `content/news/YYYY/MM/DD/`

## 6. 调试技巧

### Python
```python
app.run(debug=True)  # 临时启用调试
# 或在 config.json 设置 "debug": true
```

### JavaScript
- 浏览器 Console 查看日志
- `console.error()` 输出错误

## 7. Git 提交规范

```
<类型>: <简短描述>

<详细描述 (可选)>

Fixes #<issue编号>
```

类型: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

**更新时间**: 2026-02-23
