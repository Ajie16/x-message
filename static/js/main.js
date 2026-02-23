/**
 * X-Message - Modern UI JavaScript
 * Version: 2.0.0
 */

(function() {
    'use strict';

    // ==================== Configuration ====================
    const CONFIG = {
        animationDuration: 400,
        scrollOffset: 80,
        particleCount: 25
    };

    // ==================== State ====================
    const state = {
        config: null,
        projects: [],
        news: {},
        comments: [],
        currentProject: null,
        currentNews: null,
        theme: localStorage.getItem('theme') || 'light'
    };

    // ==================== DOM Elements ====================
    const elements = {
        pageLoader: document.getElementById('pageLoader'),
        navbar: document.getElementById('navbar'),
        mobileToggle: document.getElementById('mobileToggle'),
        mobileMenu: document.getElementById('mobileMenu'),
        themeToggle: document.getElementById('themeToggle'),
        heroParticles: document.getElementById('heroParticles'),
        animatedElements: document.querySelectorAll('[data-animate]'),
        qrcodeModal: document.getElementById('qrcodeModal'),
        modalClose: document.querySelector('.modal-close'),
        modalOverlay: document.querySelector('.modal-overlay'),
        
        // Content
        authorName: document.getElementById('authorName'),
        authorBio: document.getElementById('authorBio'),
        csdnFollowers: document.getElementById('csdnFollowers'),
        wechatFollowers: document.getElementById('wechatFollowers'),
        githubFollowers: document.getElementById('githubFollowers'),
        socialLinks: document.getElementById('socialLinks'),
        projectsList: document.getElementById('projectsList'),
        projectContent: document.getElementById('projectContent'),
        newsList: document.getElementById('newsList'),
        newsContent: document.getElementById('newsContent'),
        commentForm: document.getElementById('commentForm'),
        commentAuthor: document.getElementById('commentAuthor'),
        commentContent: document.getElementById('commentContent'),
        charCount: document.getElementById('charCount'),
        commentsList: document.getElementById('commentsList'),
        
        // Stats
        projectCount: document.getElementById('projectCount'),
        newsCount: document.getElementById('newsCount'),
        commentCount: document.getElementById('commentCount')
    };

    // ==================== Utils ====================
    function formatNumber(num) {
        if (num >= 10000) return (num / 10000).toFixed(1) + '万';
        return num.toLocaleString();
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }

    function renderMarkdown(content) {
        if (typeof marked !== 'undefined') return marked.parse(content);
        return content;
    }

    function highlightCode() {
        if (typeof hljs !== 'undefined') {
            document.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ==================== API ====================
    async function apiGet(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }

    async function apiPost(url, data) {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }

    // ==================== Page Loader ====================
    function initPageLoader() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (elements.pageLoader) {
                    elements.pageLoader.classList.add('hidden');
                    setTimeout(() => {
                        checkScrollAnimations();
                        animateCounters();
                    }, 300);
                }
            }, 500);
        });
    }

    // ==================== Navigation ====================
    function initNavigation() {
        // Scroll effect
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 50) {
                elements.navbar.classList.add('scrolled');
            } else {
                elements.navbar.classList.remove('scrolled');
            }
        }, { passive: true });

        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - CONFIG.scrollOffset,
                        behavior: 'smooth'
                    });
                    closeMobileMenu();
                }
            });
        });

        // Mobile menu
        if (elements.mobileToggle) {
            elements.mobileToggle.addEventListener('click', toggleMobileMenu);
        }

        document.addEventListener('click', (e) => {
            if (!elements.navbar.contains(e.target)) closeMobileMenu();
        });
    }

    function toggleMobileMenu() {
        elements.mobileToggle.classList.toggle('active');
        elements.mobileMenu.classList.toggle('active');
    }

    function closeMobileMenu() {
        elements.mobileToggle.classList.remove('active');
        elements.mobileMenu.classList.remove('active');
    }

    // ==================== Theme Toggle ====================
    function initThemeToggle() {
        if (!elements.themeToggle) return;

        // Apply saved theme
        if (state.theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            updateThemeIcon(true);
        }

        elements.themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                state.theme = 'light';
                updateThemeIcon(false);
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                state.theme = 'dark';
                updateThemeIcon(true);
            }
        });
    }

    function updateThemeIcon(isDark) {
        const icon = elements.themeToggle.querySelector('.theme-icon');
        if (icon) icon.textContent = isDark ? '☀️' : '🌙';
    }

    // ==================== Particle System ====================
    function initParticles() {
        if (!elements.heroParticles) return;

        const canvas = elements.heroParticles;
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId = null;
        let isActive = true;

        const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
        const particleCount = isTouchDevice ? 10 : CONFIG.particleCount;

        function resize() {
            const hero = canvas.parentElement;
            canvas.width = hero.offsetWidth;
            canvas.height = hero.offsetHeight;
        }

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 1;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5 + 0.1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.fill();
            }
        }

        function init() {
            resize();
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            if (!isActive) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            // Draw connections
            particles.forEach((a, index) => {
                particles.slice(index + 1).forEach(b => {
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                });
            });

            animationId = requestAnimationFrame(animate);
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                isActive = false;
                if (animationId) cancelAnimationFrame(animationId);
            } else {
                isActive = true;
                animate();
            }
        });

        window.addEventListener('resize', () => {
            resize();
            init();
        });

        init();
        animate();
    }

    // ==================== Scroll Animations ====================
    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, { rootMargin: '0px 0px -50px 0px', threshold: 0.1 });

        elements.animatedElements.forEach(el => observer.observe(el));
    }

    function checkScrollAnimations() {
        elements.animatedElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.classList.add('animated');
            }
        });
    }

    // ==================== Counter Animation ====================
    function animateCounters() {
        const statValues = document.querySelectorAll('.stat-value[data-count]');
        statValues.forEach(counter => {
            const target = parseInt(counter.dataset.count);
            if (target === 0) return;
            
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += step;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            updateCounter();
        });
    }

    // ==================== Data Loading ====================
    async function loadConfig() {
        try {
            const data = await apiGet('/api/config');
            state.config = data;

            document.title = `${data.site.name} - ${data.site.description}`;
            
            if (elements.authorName) elements.authorName.textContent = data.author.name;
            if (elements.authorBio) elements.authorBio.textContent = data.author.bio;
            if (elements.csdnFollowers) elements.csdnFollowers.textContent = formatNumber(data.author.followers.csdn);
            if (elements.wechatFollowers) elements.wechatFollowers.textContent = formatNumber(data.author.followers.wechat);
            if (elements.githubFollowers) elements.githubFollowers.textContent = formatNumber(data.author.followers.github);

            renderSocialLinks(data.links);
        } catch (error) {
            console.error('加载配置失败:', error);
        }
    }

    function renderSocialLinks(links) {
        if (!elements.socialLinks) return;
        
        const icons = {
            'csdn': '📝',
            'wechat': '💬',
            'github': '🐙',
            'email': '📧'
        };

        const html = Object.entries(links)
            .filter(([key, link]) => link.show)
            .map(([key, link]) => {
                const icon = icons[key] || '🔗';
                const isWechat = key === 'wechat';
                const href = isWechat ? '#' : link.url;
                const onclick = isWechat ? 'onclick="showQRCode()"' : '';
                
                return `<a href="${href}" class="social-link" ${onclick} target="${isWechat ? '' : '_blank'}" rel="noopener">
                    <span>${icon}</span>
                    <span>${link.name}</span>
                </a>`;
            }).join('');
        
        elements.socialLinks.innerHTML = html;
    }

    async function loadProjects() {
        try {
            const data = await apiGet('/api/projects');
            state.projects = data.projects || [];
            
            // Update stats
            if (elements.projectCount) {
                elements.projectCount.dataset.count = state.projects.length;
                elements.projectCount.textContent = state.projects.length;
            }
            
            renderProjectsList();
        } catch (error) {
            console.error('加载项目失败:', error);
            if (elements.projectsList) elements.projectsList.innerHTML = '<div class="loading">加载失败</div>';
        }
    }

    function renderProjectsList() {
        if (!elements.projectsList) return;
        
        if (state.projects.length === 0) {
            elements.projectsList.innerHTML = '<div class="loading">暂无项目</div>';
            return;
        }

        // Sort projects by date (newest first)
        const sortedProjects = [...state.projects].sort((a, b) => new Date(b.date) - new Date(a.date));

        // Use improved sidebar list items
        const html = sortedProjects.map(project => `
            <div class="project-card-item ${state.currentProject === project.path ? 'active' : ''}" data-path="${project.path}">
                <div class="project-card-item-title">${project.title}</div>
                <div class="project-card-item-meta">📅 ${formatDate(project.date)}</div>
            </div>
        `).join('');

        elements.projectsList.innerHTML = html;

        elements.projectsList.querySelectorAll('.project-card-item').forEach(item => {
            item.addEventListener('click', () => {
                const path = item.dataset.path;
                loadProjectContent(path);
                elements.projectsList.querySelectorAll('.project-card-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Auto-load the latest project
        if (sortedProjects.length > 0 && !state.currentProject) {
            const firstItem = elements.projectsList.querySelector('.project-card-item');
            if (firstItem) {
                firstItem.classList.add('active');
                loadProjectContent(sortedProjects[0].path);
            }
        }
    }

    async function loadProjectContent(path) {
        try {
            state.currentProject = path;
            if (elements.projectContent) elements.projectContent.innerHTML = '<div class="loading">加载中...</div>';
            
            const data = await apiGet(`/api/projects/${encodeURIComponent(path)}`);
            
            if (elements.projectContent) {
                elements.projectContent.innerHTML = `<div class="markdown-content">${data.html || renderMarkdown(data.content)}</div>`;
                highlightCode();
            }
        } catch (error) {
            console.error('加载项目内容失败:', error);
            if (elements.projectContent) elements.projectContent.innerHTML = '<div class="loading">加载失败</div>';
        }
    }

    async function loadNews() {
        try {
            const data = await apiGet('/api/news');
            state.news = data.news || {};
            
            // Count total news
            let totalNews = 0;
            Object.values(state.news).forEach(group => totalNews += group.length);
            if (elements.newsCount) {
                elements.newsCount.dataset.count = totalNews;
                elements.newsCount.textContent = totalNews;
            }
            
            renderNewsList();
        } catch (error) {
            console.error('加载咨询失败:', error);
            if (elements.newsList) elements.newsList.innerHTML = '<div class="loading">加载失败</div>';
        }
    }

    function renderNewsList() {
        if (!elements.newsList) return;
        
        const dates = Object.keys(state.news);
        if (dates.length === 0) {
            elements.newsList.innerHTML = '<div class="loading">暂无咨询</div>';
            return;
        }

        // Sort dates and get all items
        const sortedDates = dates.sort().reverse();
        
        const html = sortedDates.map(date => {
            const items = state.news[date];
            const itemsHtml = items.map(item => `
                <div class="article-item ${state.currentNews === item.path ? 'active' : ''}" data-path="${item.path}">
                    <div class="article-accent"></div>
                    <div class="article-content">
                        <div class="article-title">${item.title}</div>
                        <div class="article-date">📅 ${formatDate(item.date || new Date().toISOString())}</div>
                    </div>
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

        elements.newsList.querySelectorAll('.article-item').forEach(item => {
            item.addEventListener('click', () => {
                const path = item.dataset.path;
                loadNewsContent(path);
                elements.newsList.querySelectorAll('.article-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Auto-load the first (latest) news
        if (!state.currentNews && sortedDates.length > 0) {
            const firstItem = elements.newsList.querySelector('.article-item');
            if (firstItem) {
                firstItem.classList.add('active');
                loadNewsContent(firstItem.dataset.path);
            }
        }
    }

    async function loadNewsContent(path) {
        try {
            state.currentNews = path;
            if (elements.newsContent) elements.newsContent.innerHTML = '<div class="loading">加载中...</div>';
            
            const data = await apiGet(`/api/news/${encodeURIComponent(path)}`);
            
            if (elements.newsContent) {
                elements.newsContent.innerHTML = `<div class="markdown-content">${data.html || renderMarkdown(data.content)}</div>`;
                highlightCode();
            }
        } catch (error) {
            console.error('加载咨询内容失败:', error);
            if (elements.newsContent) elements.newsContent.innerHTML = '<div class="loading">加载失败</div>';
        }
    }

    async function loadComments() {
        try {
            const data = await apiGet('/api/comments');
            state.comments = data.comments || [];
            
            if (elements.commentCount) {
                elements.commentCount.dataset.count = state.comments.length;
                elements.commentCount.textContent = state.comments.length;
            }
            
            renderComments();
        } catch (error) {
            console.error('加载评论失败:', error);
            if (elements.commentsList) elements.commentsList.innerHTML = '<div class="loading">加载失败</div>';
        }
    }

    function renderComments() {
        if (!elements.commentsList) return;
        
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

    async function submitComment(e) {
        e.preventDefault();
        
        const author = elements.commentAuthor.value.trim();
        const content = elements.commentContent.value.trim();
        
        if (!author || !content) {
            alert('请填写完整信息');
            return;
        }
        
        try {
            await apiPost('/api/comments', { author, content });
            
            elements.commentContent.value = '';
            if (elements.charCount) elements.charCount.textContent = '0';
            
            await loadComments();
            alert('评论提交成功！');
        } catch (error) {
            console.error('提交评论失败:', error);
            alert('提交失败，请重试');
        }
    }

    // ==================== Modal ====================
    function initModal() {
        if (!elements.qrcodeModal) return;

        window.showQRCode = function() {
            elements.qrcodeModal.classList.add('active');
        };

        elements.modalClose.addEventListener('click', closeModal);
        elements.modalOverlay.addEventListener('click', closeModal);
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    }

    function closeModal() {
        if (elements.qrcodeModal) elements.qrcodeModal.classList.remove('active');
    }

    // ==================== Form ====================
    function initForm() {
        if (elements.commentForm) {
            elements.commentForm.addEventListener('submit', submitComment);
        }

        if (elements.commentContent) {
            elements.commentContent.addEventListener('input', () => {
                if (elements.charCount) {
                    elements.charCount.textContent = elements.commentContent.value.length;
                }
            });
        }
    }

    // ==================== Active Nav Link ====================
    function initActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

        window.addEventListener('scroll', () => {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop - CONFIG.scrollOffset - 100;
                if (pageYOffset >= sectionTop) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }, { passive: true });
    }

    // ==================== Initialize ====================
    function init() {
        initPageLoader();
        initNavigation();
        initThemeToggle();
        initParticles();
        initScrollAnimations();
        initModal();
        initForm();
        initActiveNavLink();

        // Load data
        loadConfig();
        loadProjects();
        loadNews();
        loadComments();

        console.log('%c X-Message ', 'background: #165DFF; color: white; padding: 4px 8px; border-radius: 4px;', 'initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
