// ============= ADMIN DASHBOARD JAVASCRIPT =============

// Global variables
let sidebar = null;
let sidebarOverlay = null;
let cursor = null;
let particlesCanvas = null;
let particlesCtx = null;
let particles = [];
let notificationsMenu = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeCursor();
    initializeParticles();
    initializeTheme();
    initializeCounters();
    initializeAOS();
    initializeEventListeners();
    
    console.log('🎨 कला Admin Dashboard initialized successfully');
});

// ============= ELEMENT INITIALIZATION =============
function initializeElements() {
    sidebar = document.getElementById('sidebar');
    sidebarOverlay = document.getElementById('sidebar-overlay');
    cursor = document.querySelector('.cursor');
    particlesCanvas = document.getElementById('particles-canvas');
    notificationsMenu = document.getElementById('notifications-menu');
    
    if (particlesCanvas) {
        particlesCtx = particlesCanvas.getContext('2d');
        resizeCanvas();
    }
}

// ============= CUSTOM CURSOR =============
function initializeCursor() {
    if (!cursor) return;
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    
    // Smooth cursor movement
    function updateCursor() {
        cursorX += (mouseX - cursorX) * 0.1;
        cursorY += (mouseY - cursorY) * 0.1;
        
        cursor.style.left = cursorX - 10 + 'px';
        cursor.style.top = cursorY - 10 + 'px';
        
        requestAnimationFrame(updateCursor);
    }
    
    updateCursor();
    
    // Mouse move event
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.classList.add('visible');
    });
    
    // Mouse leave event
    document.addEventListener('mouseleave', () => {
        cursor.classList.remove('visible');
    });
    
    // Hover effects for interactive elements
    const interactiveElements = document.querySelectorAll('button, a, input, textarea, select, [onclick], [data-toggle]');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
        });
        
        element.addEventListener('mousedown', () => {
            cursor.classList.add('click');
        });
        
        element.addEventListener('mouseup', () => {
            cursor.classList.remove('click');
        });
    });
}

// ============= BACKGROUND PARTICLES =============
function initializeParticles() {
    if (!particlesCanvas || !particlesCtx) return;
    
    const particleCount = window.innerWidth < 768 ? 30 : 50;
    
    // Particle class
    class Particle {
        constructor() {
            this.reset();
            this.y = Math.random() * particlesCanvas.height;
            this.vy = Math.random() * 0.5 + 0.1;
        }
        
        reset() {
            this.x = Math.random() * particlesCanvas.width;
            this.y = -10;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = Math.random() * 0.5 + 0.1;
            this.size = Math.random() * 2 + 1;
            this.opacity = Math.random() * 0.3 + 0.1;
            this.hue = Math.random() * 60 + 200; // Blue-purple range
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            // Wrap around edges
            if (this.x < -10) this.x = particlesCanvas.width + 10;
            if (this.x > particlesCanvas.width + 10) this.x = -10;
            if (this.y > particlesCanvas.height + 10) this.reset();
            
            // Subtle floating animation
            this.x += Math.sin(Date.now() * 0.0005 + this.x * 0.01) * 0.1;
        }
        
        draw() {
            particlesCtx.save();
            particlesCtx.globalAlpha = this.opacity;
            particlesCtx.beginPath();
            particlesCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            particlesCtx.fillStyle = `hsl(${this.hue}, 70%, 60%)`;
            particlesCtx.fill();
            
            // Add subtle glow
            particlesCtx.shadowBlur = 10;
            particlesCtx.shadowColor = `hsl(${this.hue}, 70%, 60%)`;
            particlesCtx.fill();
            
            particlesCtx.restore();
        }
    }
    
    // Initialize particles
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Animation loop
    function animateParticles() {
        particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Draw connections between nearby particles
        drawConnections();
        
        requestAnimationFrame(animateParticles);
    }
    
    // Draw connections between particles
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const opacity = (100 - distance) / 100 * 0.1;
                    
                    particlesCtx.save();
                    particlesCtx.globalAlpha = opacity;
                    particlesCtx.beginPath();
                    particlesCtx.moveTo(particles[i].x, particles[i].y);
                    particlesCtx.lineTo(particles[j].x, particles[j].y);
                    particlesCtx.strokeStyle = 'hsl(220, 70%, 60%)';
                    particlesCtx.lineWidth = 1;
                    particlesCtx.stroke();
                    particlesCtx.restore();
                }
            }
        }
    }
    
    animateParticles();
}

function resizeCanvas() {
    if (!particlesCanvas) return;
    
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
}

// ============= THEME MANAGEMENT =============
function initializeTheme() {
    const savedTheme = localStorage.getItem('admin-theme') || 'dark';
    const themeIcon = document.getElementById('theme-icon');
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    if (themeIcon) {
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const themeIcon = document.getElementById('theme-icon');
    const currentTheme = html.getAttribute('data-theme');
    
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('admin-theme', newTheme);
    
    if (themeIcon) {
        themeIcon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    showToast(`Switched to ${newTheme} theme`, 'info');
}

// ============= SIDEBAR MANAGEMENT =============
function toggleSidebar() {
    if (!sidebar || !sidebarOverlay) return;
    
    const isOpen = sidebar.classList.contains('show');
    
    if (isOpen) {
        sidebar.classList.remove('show');
        sidebarOverlay.classList.remove('show');
        document.body.style.overflow = '';
    } else {
        sidebar.classList.add('show');
        sidebarOverlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// ============= STATISTICS COUNTERS =============
function initializeCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        element.textContent = Math.floor(current).toLocaleString();
    }, 16);
}

// ============= AOS ANIMATION =============
function initializeAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 600,
            easing: 'ease-out-cubic',
            once: true,
            offset: 100
        });
    }
}

// ============= EVENT LISTENERS =============
function initializeEventListeners() {
    // Window resize handler
    window.addEventListener('resize', () => {
        resizeCanvas();
        
        // Adjust particles count based on screen size
        if (particles.length > 0) {
            const newCount = window.innerWidth < 768 ? 30 : 50;
            if (particles.length !== newCount) {
                initializeParticles();
            }
        }
    });
    
    // Close sidebar when clicking on main content (mobile)
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.addEventListener('click', () => {
            if (window.innerWidth < 992 && sidebar?.classList.contains('show')) {
                toggleSidebar();
            }
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Alt + T for theme toggle
        if (e.altKey && e.key.toLowerCase() === 't') {
            e.preventDefault();
            toggleTheme();
        }
        
        // Alt + S for sidebar toggle (mobile)
        if (e.altKey && e.key.toLowerCase() === 's' && window.innerWidth < 992) {
            e.preventDefault();
            toggleSidebar();
        }
        
        // Escape to close sidebar/notifications
        if (e.key === 'Escape') {
            if (sidebar?.classList.contains('show')) {
                toggleSidebar();
            }
            if (notificationsMenu?.classList.contains('show')) {
                toggleNotifications();
            }
        }
    });
}

// ============= NOTIFICATIONS =============
function toggleNotifications() {
    if (!notificationsMenu) return;
    
    const isOpen = notificationsMenu.classList.contains('show');
    
    if (isOpen) {
        notificationsMenu.classList.remove('show');
    } else {
        notificationsMenu.classList.add('show');
        
        // Close when clicking outside
        setTimeout(() => {
            document.addEventListener('click', closeNotificationsOutside);
        }, 100);
    }
}

function closeNotificationsOutside(e) {
    if (!notificationsMenu?.contains(e.target) && !e.target.closest('.notifications-dropdown')) {
        notificationsMenu.classList.remove('show');
        document.removeEventListener('click', closeNotificationsOutside);
    }
}

function markAllRead() {
    const unreadItems = document.querySelectorAll('.notification-item.unread');
    unreadItems.forEach(item => {
        item.classList.remove('unread');
    });
    
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        badge.style.display = 'none';
    }
    
    showToast('All notifications marked as read', 'success');
}

// ============= TOAST NOTIFICATIONS =============
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = getToastIcon(type);
    
    toast.innerHTML = `
        <i class="${icon}"></i>
        <div class="toast-content">
            <p>${message}</p>
        </div>
        <button class="toast-close" onclick="closeToast(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto close
    setTimeout(() => {
        closeToast(toast.querySelector('.toast-close'));
    }, duration);
}

function getToastIcon(type) {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    return icons[type] || icons.info;
}

function closeToast(button) {
    const toast = button.closest('.toast');
    if (toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }
}

// ============= API FUNCTIONS =============
async function refreshStats() {
    const refreshIcon = document.getElementById('refresh-icon');
    if (refreshIcon) {
        refreshIcon.classList.add('animate-spin');
    }
    
    try {
        const response = await fetch('/admin/api/stats');
        const result = await response.json();
        
        if (result.success) {
            updateDashboardStats(result.data);
            showToast('Dashboard stats refreshed', 'success');
        } else {
            throw new Error(result.message || 'Failed to refresh stats');
        }
    } catch (error) {
        console.error('Error refreshing stats:', error);
        showToast('Failed to refresh stats', 'error');
    } finally {
        if (refreshIcon) {
            refreshIcon.classList.remove('animate-spin');
        }
    }
}

function updateDashboardStats(stats) {
    // Update counter values
    const counters = {
        'totalViews': stats.totalViews,
        'sellableArts': stats.sellableArts,
        'soldArts': stats.soldArts,
        'activeArtists': stats.activeArtists,
        'contactMessages': stats.contactMessages,
        'activeBuyingRequests': stats.activeBuyingRequests,
        'artistApplications': stats.artistApplications
    };
    
    Object.keys(counters).forEach(key => {
        const element = document.querySelector(`[data-count="${counters[key]}"]`);
        if (element) {
            element.setAttribute('data-count', counters[key]);
            animateCounter(element);
        }
    });
}

// ============= LOGOUT FUNCTION =============
async function logout() {
    try {
        const response = await fetch('/admin/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Logging out...', 'info');
            setTimeout(() => {
                window.location.href = result.redirect;
            }, 1000);
        } else {
            throw new Error(result.message || 'Logout failed');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Failed to logout', 'error');
    }
}

// ============= UTILITY FUNCTIONS =============
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============= GLOBAL EXPOSURE =============
// Expose functions to global scope for inline event handlers
window.toggleTheme = toggleTheme;
window.toggleSidebar = toggleSidebar;
window.toggleNotifications = toggleNotifications;
window.markAllRead = markAllRead;
window.refreshStats = refreshStats;
window.logout = logout;
window.closeToast = closeToast;
window.showToast = showToast;
