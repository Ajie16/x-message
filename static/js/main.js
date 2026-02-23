/**
 * X聚合信息 - 前端主程序
 */

// ==================== 全局状态 ====================
const state = {
    config: null,
    currentSection: 'home',
    projects: [],
    news: {},
    currentProject: null,
    currentNews: null,
    comments: []
};

// ==================== DOM 元素 ====================
const elements = {
    // 导航
    navLinks: document.querySelectorAll('.nav-link'),
    mobileNavLinks: document.querySelectorAll('.mobile-nav-link'),
    menuToggle: document.getElementById('menuToggle'),
    mobileMenu: document.getElementById('mobileMenu'),
    
    // 首页
    authorName: document.getElementById('authorName'),
    authorBio: document.getElementById('authorBio'),
    csdnFollowers: document.getElementById('csdnFollowers'),
    wechatFollowers: document.getElementById('wechatFollowers'),
    githubFollowers: document.getElementById('githubFollowers'),
    socialLinks: document.getElementById('socialLinks'),
    
    // 项目
    projectsList: document.getElementById('projectsList'),
    projectContent: document.getElementById('projectContent'),
    
    // 咨询
    newsList: document.getElementById('newsList'),
    newsContent: document.getElementById('newsContent'),
    
    // 评论
    commentForm: document.getElementById('commentForm'),
    commentAuthor: document.getElementById('commentAuthor'),
    commentContent: document.getElementById('commentContent'),
    charCount: document.getElementById('charCount'),
    commentsList: document.getElementById('commentsList'),
    
    // 弹窗
    qrcodeModal: document.getElementById('qrcodeModal'),
    modalClose: document.querySelector('.modal-close')
};

// ==================== 工具函数 ====================

/**
 * 格式化数字（添加千分位）
 */
function formatNumber(num) {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
    }
    return num.toLocaleString();
}

/**
 * 格式化日期
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

/**
 * 渲染 Markdown
 */
function renderMarkdown(content) {
    if (typeof marked !== 'undefined') {
        return marked.parse(content);
    }
    return content;
}

/**
 * 高亮代码块
 */
function highlightCode() {
    if (typeof hljs !== 'undefined') {
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    }
}

/**
 * 显示提示信息
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 3000;
        animation: fadeIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ==================== API 请求 ====================

/**
 * GET 请求
 */
async function apiGet(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
}

/**
 * POST 请求
 */
async function apiPost(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
}

// ==================== 页面功能 ====================

/**
 * 切换页面区域
 */
function switchSection(sectionName) {
    // 隐藏所有区域
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // 显示目标区域
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // 更新导航状态
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === sectionName) {
            link.classList.add('active');
        }
    });
    
    state.currentSection = sectionName;
    
    // 关闭移动端菜单
    elements.mobileMenu.classList.remove('active');
    
    // 更新URL hash
    window.location.hash = sectionName;
}

/**
 * 加载配置信息
 */
async function loadConfig() {
    try {
        const data = await apiGet('/api/config');
        state.config = data;
        
        // 更新页面信息
        document.title = `${data.site.name} - ${data.site.description}`;
        elements.authorName.textContent = data.author.name;
        elements.authorBio.textContent = data.author.bio;
        elements.csdnFollowers.textContent = formatNumber(data.author.followers.csdn);
        elements.wechatFollowers.textContent = formatNumber(data.author.followers.wechat);
        elements.githubFollowers.textContent = formatNumber(data.author.followers.github);
        
        // 生成社交链接
        renderSocialLinks(data.links);
        
    } catch (error) {
        console.error('加载配置失败:', error);
        showToast('加载配置失败', 'error');
    }
}

/**
 * 渲染社交链接
 */
function renderSocialLinks(links) {
    const linkIcons = {
        'csdn': '📝',
        'wechat': '💬',
        'github': '🐙',
        'email': '📧'
    };
    
    const html = Object.entries(links)
        .filter(([key, link]) => link.show)
        .map(([key, link]) => {
            const icon = linkIcons[key] || '🔗';
            const isWechat = key === 'wechat';
            const href = isWechat ? '#' : link.url;
            const onclick = isWechat ? 'onclick="showQRCode()"' : '';
            
            return `
                <a href="${href}" class="social-link" ${onclick} target="${isWechat ? '' : '_blank'}" rel="noopener">
                    <span class="icon">${icon}</span>
                    <span>${link.name}</span>
                </a>
            `;
        }).join('');
    
    elements.socialLinks.innerHTML = html;
}

/**
 * 显示二维码弹窗
 */
function showQRCode() {
    elements.qrcodeModal.classList.add('active');
}

/**
 * 隐藏二维码弹窗
 */
function hideQRCode() {
    elements.qrcodeModal.classList.remove('active');
}

// ==================== 项目功能 ====================

/**
 * 加载项目列表
 */
async function loadProjects() {
    try {
        const data = await apiGet('/api/projects');
        state.projects = data.projects || [];
        renderProjectsList();
    } catch (error) {
        console.error('加载项目失败:', error);
        elements.projectsList.innerHTML = '<div class="loading">加载失败</div>';
    }
}

/**
 * 渲染项目列表
 */
function renderProjectsList() {
    if (state.projects.length === 0) {
        elements.projectsList.innerHTML = '<div class="loading">暂无项目</div>';
        return;
    }
    
    const html = state.projects.map(project => `
        <div class="list-item ${state.currentProject === project.path ? 'active' : ''}" 
             data-path="${project.path}">
            <div class="list-item-title">${project.title}</div>
            <div class="list-item-date">${formatDate(project.date)}</div>
        </div>
    `).join('');
    
    elements.projectsList.innerHTML = html;
    
    // 绑定点击事件
    elements.projectsList.querySelectorAll('.list-item').forEach(item => {
        item.addEventListener('click', () => {
            const path = item.dataset.path;
            loadProjectContent(path);
            
            // 更新激活状态
            elements.projectsList.querySelectorAll('.list-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

/**
 * 加载项目内容
 */
async function loadProjectContent(path) {
    try {
        state.currentProject = path;
        elements.projectContent.innerHTML = '<div class="loading">加载中...</div>';
        
        const data = await apiGet(`/api/projects/${encodeURIComponent(path)}`);
        
        elements.projectContent.innerHTML = `
            <div class="markdown-content">
                ${data.html || renderMarkdown(data.content)}
            </div>
        `;
        
        highlightCode();
        
    } catch (error) {
        console.error('加载项目内容失败:', error);
        elements.projectContent.innerHTML = '<div class="loading">加载失败</div>';
    }
}

// ==================== 咨询功能 ====================

/**
 * 加载咨询列表
 */
async function loadNews() {
    try {
        const data = await apiGet('/api/news');
        state.news = data.news || {};
        renderNewsList();
    } catch (error) {
        console.error('加载咨询失败:', error);
        elements.newsList.innerHTML = '<div class="loading">加载失败</div>';
    }
}

/**
 * 渲染咨询列表（按日期分组）
 */
function renderNewsList() {
    const dates = Object.keys(state.news);
    
    if (dates.length === 0) {
        elements.newsList.innerHTML = '<div class="loading">暂无咨询</div>';
        return;
    }
    
    const html = dates.map(date => {
        const items = state.news[date];
        const itemsHtml = items.map(item => `
            <div class="list-item ${state.currentNews === item.path ? 'active' : ''}" 
                 data-path="${item.path}">
                <div class="list-item-title">${item.title}</div>
            </div>
        `).join('');
        
        return `
            <div class="date-group">
                <div class="date-group-title">${date}</div>
                ${itemsHtml}
            </div>
        `;
    }).join('');
    
    elements.newsList.innerHTML = html;
    
    // 绑定点击事件
    elements.newsList.querySelectorAll('.list-item').forEach(item => {
        item.addEventListener('click', () => {
            const path = item.dataset.path;
            loadNewsContent(path);
            
            // 更新激活状态
            elements.newsList.querySelectorAll('.list-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

/**
 * 加载咨询内容
 */
async function loadNewsContent(path) {
    try {
        state.currentNews = path;
        elements.newsContent.innerHTML = '<div class="loading">加载中...</div>';
        
        const data = await apiGet(`/api/news/${encodeURIComponent(path)}`);
        
        elements.newsContent.innerHTML = `
            <div class="markdown-content">
                ${data.html || renderMarkdown(data.content)}
            </div>
        `;
        
        highlightCode();
        
    } catch (error) {
        console.error('加载咨询内容失败:', error);
        elements.newsContent.innerHTML = '<div class="loading">加载失败</div>';
    }
}

// ==================== 评论功能 ====================

/**
 * 加载评论列表
 */
async function loadComments() {
    try {
        const data = await apiGet('/api/comments');
        state.comments = data.comments || [];
        renderComments();
    } catch (error) {
        console.error('加载评论失败:', error);
        elements.commentsList.innerHTML = '<div class="loading">加载失败</div>';
    }
}

/**
 * 渲染评论列表
 */
function renderComments() {
    if (state.comments.length === 0) {
        elements.commentsList.innerHTML = '<div class="no-comments">暂无留言，来发表第一条评论吧！</div>';
        return;
    }
    
    const html = state.comments.map(comment => `
        <div class="comment-item">
            <div class="comment-header">
                <span class="comment-author">${escapeHtml(comment.author)}</span>
                <span class="comment-date">${comment.date}</span>
            </div>
            <div class="comment-content">${escapeHtml(comment.content)}</div>
        </div>
    `).join('');
    
    elements.commentsList.innerHTML = html;
}

/**
 * HTML转义
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 提交评论
 */
async function submitComment(e) {
    e.preventDefault();
    
    const author = elements.commentAuthor.value.trim();
    const content = elements.commentContent.value.trim();
    
    if (!author || !content) {
        showToast('请填写完整信息', 'error');
        return;
    }
    
    try {
        await apiPost('/api/comments', {
            author: author,
            content: content
        });
        
        showToast('评论提交成功！', 'success');
        
        // 清空表单
        elements.commentContent.value = '';
        elements.charCount.textContent = '0';
        
        // 重新加载评论
        await loadComments();
        
    } catch (error) {
        console.error('提交评论失败:', error);
        showToast('提交失败，请重试', 'error');
    }
}

// ==================== 事件绑定 ====================

function bindEvents() {
    // 导航点击
    document.querySelectorAll('.nav-link, .mobile-nav-link, .access-card').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            if (section) {
                switchSection(section);
            }
        });
    });
    
    // 移动端菜单切换
    elements.menuToggle.addEventListener('click', () => {
        elements.mobileMenu.classList.toggle('active');
    });
    
    // 弹窗关闭
    elements.modalClose.addEventListener('click', hideQRCode);
    elements.qrcodeModal.addEventListener('click', (e) => {
        if (e.target === elements.qrcodeModal) {
            hideQRCode();
        }
    });
    
    // 评论表单
    elements.commentForm.addEventListener('submit', submitComment);
    
    // 字符计数
    elements.commentContent.addEventListener('input', () => {
        const length = elements.commentContent.value.length;
        elements.charCount.textContent = length;
    });
    
    // 监听 hash 变化
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.slice(1) || 'home';
        switchSection(hash);
    });
}

// ==================== 初始化 ====================

async function init() {
    // 绑定事件
    bindEvents();
    
    // 加载配置
    await loadConfig();
    
    // 加载项目
    await loadProjects();
    
    // 加载咨询
    await loadNews();
    
    // 加载评论
    await loadComments();
    
    // 根据 hash 切换页面
    const hash = window.location.hash.slice(1);
    if (hash) {
        switchSection(hash);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
