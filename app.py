#!/usr/bin/env python3
"""
X聚合信息 - 信息聚合与开源项目展示平台
Flask后端主程序
"""

import json
import os
import re
from datetime import datetime
from pathlib import Path

import markdown
from dateutil import parser as date_parser
from flask import Flask, jsonify, render_template, request, send_from_directory

app = Flask(__name__)

# 加载配置
CONFIG_PATH = os.path.join(os.path.dirname(__file__), 'config.json')
with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
    config = json.load(f)

# Markdown转换器
md = markdown.Markdown(extensions=['extra', 'codehilite', 'toc'])


def load_comments():
    """加载评论数据"""
    comments_path = config['comments']['data_file']
    if os.path.exists(comments_path):
        with open(comments_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"comments": []}


def save_comments(data):
    """保存评论数据"""
    comments_path = config['comments']['data_file']
    os.makedirs(os.path.dirname(comments_path), exist_ok=True)
    with open(comments_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_md_files(directory):
    """获取目录下所有MD文件，返回文件信息列表"""
    files = []
    base_path = Path(directory)
    if not base_path.exists():
        return files
    
    for md_file in base_path.rglob('*.md'):
        try:
            stat = md_file.stat()
            # 读取文件内容获取标题
            content = md_file.read_text(encoding='utf-8')
            title = md_file.stem
            # 尝试从第一行获取标题
            first_line = content.strip().split('\n')[0]
            if first_line.startswith('# '):
                title = first_line[2:].strip()
            
            # 获取相对路径
            rel_path = str(md_file.relative_to(base_path))
            
            files.append({
                'title': title,
                'path': rel_path,
                'date': datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d %H:%M:%S'),
                'size': stat.st_size
            })
        except Exception as e:
            print(f"Error reading {md_file}: {e}")
    
    # 按日期倒序排列
    files.sort(key=lambda x: x['date'], reverse=True)
    return files


def get_news_by_date():
    """获取按日期组织的咨询文档"""
    news_path = Path(config['content']['news_path'])
    if not news_path.exists():
        return {}
    
    news_by_date = {}
    for md_file in news_path.rglob('*.md'):
        try:
            # 从路径中提取日期: content/news/YYYY/MM/DD/file.md
            parts = md_file.relative_to(news_path).parts
            if len(parts) >= 4:
                date_key = f"{parts[0]}-{parts[1]}-{parts[2]}"
            else:
                date_key = "其他"
            
            content = md_file.read_text(encoding='utf-8')
            title = md_file.stem
            first_line = content.strip().split('\n')[0]
            if first_line.startswith('# '):
                title = first_line[2:].strip()
            
            if date_key not in news_by_date:
                news_by_date[date_key] = []
            
            news_by_date[date_key].append({
                'title': title,
                'path': str(md_file.relative_to(news_path)),
                'content': content
            })
        except Exception as e:
            print(f"Error reading {md_file}: {e}")
    
    # 按日期倒序
    return dict(sorted(news_by_date.items(), reverse=True))


def render_markdown(content):
    """渲染Markdown为HTML"""
    md.reset()
    return md.convert(content)


# ==================== 路由 ====================

@app.route('/')
def index():
    """主页"""
    return render_template('index.html', config=config)


@app.route('/api/config')
def api_config():
    """获取配置信息"""
    # 返回公开的配置，过滤掉敏感信息
    public_config = {
        'site': config['site'],
        'author': config['author'],
        'links': config['links'],
        'theme': config['theme']
    }
    return jsonify(public_config)


@app.route('/api/projects')
def api_projects():
    """获取开源项目列表"""
    projects_path = config['content']['projects_path']
    files = get_md_files(projects_path)
    return jsonify({'projects': files})


@app.route('/api/projects/<path:filename>')
def api_project_content(filename):
    """获取项目文档内容"""
    filepath = os.path.join(config['content']['projects_path'], filename)
    if not os.path.exists(filepath):
        return jsonify({'error': 'File not found'}), 404
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        return jsonify({
            'title': filename,
            'content': content,
            'html': render_markdown(content)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/news')
def api_news():
    """获取咨询列表（按日期分组）"""
    news = get_news_by_date()
    return jsonify({'news': news})


@app.route('/api/news/<path:filename>')
def api_news_content(filename):
    """获取咨询文档内容"""
    filepath = os.path.join(config['content']['news_path'], filename)
    if not os.path.exists(filepath):
        return jsonify({'error': 'File not found'}), 404
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        return jsonify({
            'title': filename,
            'content': content,
            'html': render_markdown(content)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==================== 评论系统 API ====================

@app.route('/api/comments', methods=['GET'])
def api_get_comments():
    """获取评论列表"""
    data = load_comments()
    comments = data.get('comments', [])
    # 只返回已审核的评论
    if config['comments'].get('require_approval', False):
        comments = [c for c in comments if c.get('approved', True)]
    return jsonify({'comments': comments})


@app.route('/api/comments', methods=['POST'])
def api_add_comment():
    """添加评论"""
    if not config['comments'].get('enabled', True):
        return jsonify({'error': 'Comments are disabled'}), 403
    
    data = request.get_json()
    if not data or 'content' not in data:
        return jsonify({'error': 'Content is required'}), 400
    
    content = data.get('content', '').strip()
    author = data.get('author', '匿名用户').strip()
    reply_to = data.get('reply_to')
    
    if len(content) < 1 or len(content) > 1000:
        return jsonify({'error': 'Content length must be between 1 and 1000'}), 400
    
    if len(author) < 1 or len(author) > 50:
        return jsonify({'error': 'Author name length must be between 1 and 50'}), 400
    
    comments_data = load_comments()
    comments = comments_data.get('comments', [])
    
    new_comment = {
        'id': len(comments) + 1,
        'author': author,
        'content': content,
        'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'approved': not config['comments'].get('require_approval', False),
        'reply_to': reply_to
    }
    
    comments.append(new_comment)
    comments_data['comments'] = comments
    save_comments(comments_data)
    
    return jsonify({'success': True, 'comment': new_comment})


# ==================== 静态文件 ====================

@app.route('/static/<path:filename>')
def serve_static(filename):
    """提供静态文件"""
    return send_from_directory('static', filename)


# ==================== 错误处理 ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


# ==================== 启动 ====================

if __name__ == '__main__':
    # 确保必要的目录存在
    os.makedirs(config['content']['projects_path'], exist_ok=True)
    os.makedirs(config['content']['news_path'], exist_ok=True)
    os.makedirs('data', exist_ok=True)
    
    app.run(
        host=config['site'].get('host', '0.0.0.0'),
        port=config['site'].get('port', 8081),
        debug=config['site'].get('debug', False)
    )
