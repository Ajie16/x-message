/**
 * OpenAgent - Main JavaScript
 * Version: 1.0.0
 * Author: OpenAgent Team
 */

(function() {
    'use strict';

    // ==================== Configuration ====================
    const CONFIG = {
        animationDuration: 400,
        scrollOffset: 80,
        particleCount: 25,
        typingSpeed: 50,
        counterDuration: 2000
    };

    // ==================== DOM Elements ====================
    const elements = {
        pageLoader: document.getElementById('pageLoader'),
        navbar: document.getElementById('navbar'),
        navMenu: document.getElementById('navMenu'),
        mobileToggle: document.getElementById('mobileToggle'),
        mobileMenu: document.getElementById('mobileMenu'),
        themeToggle: document.getElementById('themeToggle'),
        heroParticles: document.getElementById('heroParticles'),
        caseModal: document.getElementById('caseModal'),
        animatedElements: document.querySelectorAll('[data-animate]'),
        statValues: document.querySelectorAll('.stat-value[data-count]'),
        filterBtns: document.querySelectorAll('.filter-btn'),
        caseCards: document.querySelectorAll('.case-card'),
        caseViewBtns: document.querySelectorAll('.case-view'),
        modalClose: document.querySelector('.modal-close'),
        modalOverlay: document.querySelector('.modal-overlay')
    };

    // ==================== Page Loader ====================
    function initPageLoader() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (elements.pageLoader) {
                    elements.pageLoader.classList.add('hidden');
                    // Trigger initial animations after loader
                    setTimeout(() => {
                        animateCounters();
                        checkScrollAnimations();
                    }, 300);
                }
            }, 500);
        });
    }

    // ==================== Navigation ====================
    function initNavigation() {
        // Scroll effect for navbar
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 50) {
                elements.navbar.classList.add('scrolled');
            } else {
                elements.navbar.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        }, { passive: true });

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const offsetTop = target.offsetTop - CONFIG.scrollOffset;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    closeMobileMenu();
                }
            });
        });

        // Mobile menu toggle
        if (elements.mobileToggle && elements.mobileMenu) {
            elements.mobileToggle.addEventListener('click', toggleMobileMenu);
        }

        // Close mobile menu on outside click
        document.addEventListener('click', (e) => {
            if (!elements.navbar.contains(e.target)) {
                closeMobileMenu();
            }
        });
    }

    function toggleMobileMenu() {
        elements.mobileToggle.classList.toggle('active');
        elements.mobileMenu.classList.toggle('active');
        document.body.style.overflow = elements.mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    function closeMobileMenu() {
        elements.mobileToggle.classList.remove('active');
        elements.mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ==================== Theme Toggle ====================
    function initThemeToggle() {
        if (!elements.themeToggle) return;

        // Check for saved theme preference or prefer-color-scheme
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.setAttribute('data-theme', 'dark');
            updateThemeIcon(true);
        }

        elements.themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                updateThemeIcon(false);
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                updateThemeIcon(true);
            }
        });
    }

    function updateThemeIcon(isDark) {
        const icon = elements.themeToggle.querySelector('.theme-icon');
        if (icon) {
            icon.textContent = isDark ? '☀️' : '🌙';
        }
    }

    // ==================== Particle System ====================
    function initParticles() {
        if (!elements.heroParticles) return;

        const canvas = elements.heroParticles;
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId = null;
        let isActive = true;

        // Check for touch device - reduce particles on mobile
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

        // Visibility API - pause when tab is hidden
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
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    // Optionally unobserve after animation
                    // observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        elements.animatedElements.forEach(el => observer.observe(el));
    }

    function checkScrollAnimations() {
        // Check if elements are already in viewport on load
        elements.animatedElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.classList.add('animated');
            }
        });
    }

    // ==================== Counter Animation ====================
    function animateCounters() {
        elements.statValues.forEach(counter => {
            const target = parseInt(counter.dataset.count);
            const duration = CONFIG.counterDuration;
            const step = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += step;
                if (current < target) {
                    counter.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            };

            updateCounter();
        });
    }

    // ==================== Case Filter ====================
    function initCaseFilter() {
        if (!elements.filterBtns.length) return;

        elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                elements.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.dataset.filter;

                // Filter cards
                elements.caseCards.forEach(card => {
                    if (filter === 'all' || card.dataset.category === filter) {
                        card.style.display = 'block';
                        // Trigger reflow for animation
                        card.offsetHeight;
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    // ==================== Modal ====================
    function initModal() {
        if (!elements.caseModal) return;

        // Open modal
        elements.caseViewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openModal();
            });
        });

        // Close modal
        elements.modalClose.addEventListener('click', closeModal);
        elements.modalOverlay.addEventListener('click', closeModal);

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    }

    function openModal() {
        elements.caseModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        elements.caseModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ==================== Active Nav Link ====================
    function initActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

        window.addEventListener('scroll', () => {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop - CONFIG.scrollOffset - 100;
                const sectionHeight = section.offsetHeight;
                
                if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
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

    // ==================== Performance Optimizations ====================
    function initPerformanceOptimizations() {
        // Lazy load images
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        }

        // Disable complex animations on reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--transition-base', '0s');
        }
    }

    // ==================== Utilities ====================
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ==================== Initialize ====================
    function init() {
        initPageLoader();
        initNavigation();
        initThemeToggle();
        initParticles();
        initScrollAnimations();
        initCaseFilter();
        initModal();
        initActiveNavLink();
        initPerformanceOptimizations();

        console.log('%c OpenAgent ', 'background: #165DFF; color: white; padding: 4px 8px; border-radius: 4px;', 'initialized successfully');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
