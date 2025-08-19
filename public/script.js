// WaizVault - Interactive JavaScript Functions
// =============================================

// Global Variables and Configuration
const config = {
    // TODO: Add API endpoints when backend is implemented
    apiBase: '/api',
    // TODO: Add authentication endpoints
    authEndpoints: {
        login: '/auth/login',
        signup: '/auth/signup',
        verify: '/auth/verify'
    },
    // TODO: Add database configuration
    database: {
        users: 'users',
        resources: 'resources',
        progress: 'progress'
    },
    // Temporary passwords (TODO: Move to secure backend)
    classPasswords: {
        class10: 'waiz2025',
        class11: 'jee2025', 
        class12: 'boards2025'
    }
};

// Application State Management
class AppState {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'home';
        this.isAuthenticated = false;
        this.unlockedSections = [];
        
        // TODO: Implement localStorage when supported
        // this.loadState();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.animateStatCounters();
        this.setupMobileMenu();
        
        // TODO: Check authentication status
        // this.checkAuthStatus();
    }
    
    // TODO: Implement state persistence
    // loadState() {
    //     const saved = localStorage.getItem('waizVaultState');
    //     if (saved) {
    //         const state = JSON.parse(saved);
    //         this.currentUser = state.currentUser;
    //         this.isAuthenticated = state.isAuthenticated;
    //         this.unlockedSections = state.unlockedSections;
    //     }
    // }
    
    // saveState() {
    //     const state = {
    //         currentUser: this.currentUser,
    //         isAuthenticated: this.isAuthenticated,
    //         unlockedSections: this.unlockedSections
    //     };
    //     localStorage.setItem('waizVaultState', JSON.stringify(state));
    // }
}

// Initialize Application
const app = new AppState();

// Navigation Functions
// ===================

function setupNavigation() {
    // Handle navigation clicks
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            showPage(page);
        });
    });
    
    // Handle feature card clicks
    document.querySelectorAll('.feature-card[data-page]').forEach(card => {
        card.addEventListener('click', () => {
            const page = card.getAttribute('data-page');
            showPage(page);
        });
    });
}

function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        app.currentPage = pageId;
        
        // Update navigation active state
        updateNavigation(pageId);
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Close mobile menu if open
        closeMobileMenu();
        
        // Page-specific logic
        handlePageSpecificLogic(pageId);
    }
}

function updateNavigation(activePageId) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current page link
    const activeLink = document.querySelector(`[data-page="${activePageId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

function handlePageSpecificLogic(pageId) {
    switch(pageId) {
        case 'home':
            // Restart animations on home page
            restartHomeAnimations();
            break;
        case 'class10':
        case 'class11':
        case 'class12':
            // Check if section is unlocked
            checkSectionAccess(pageId);
            break;
        case 'admin':
            // Reset admin form
            resetAdminForm();
            break;
        case 'login':
            // Focus on first input
            focusFirstInput();
            break;
    }
}

// Mobile Menu Functions
// ====================

function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

function closeMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
}

// Animation Functions
// ==================

function animateStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    
    const animateCounter = (element, target) => {
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toString();
            }
        }, 20);
    };
    
    // Intersection Observer for triggering animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => observer.observe(stat));
}

function restartHomeAnimations() {
    // Restart floating elements animation
    const elements = document.querySelectorAll('.element');
    elements.forEach(element => {
        element.style.animation = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.animation = null;
    });
    
    // Restart ticker animation
    const ticker = document.querySelector('.ticker-content');
    if (ticker) {
        ticker.style.animation = 'none';
        ticker.offsetHeight;
        ticker.style.animation = null;
    }
}

// Section Access and Password Functions
// ===================================

function checkSectionAccess(sectionId) {
    if (app.unlockedSections.includes(sectionId)) {
        showSectionContent(sectionId);
    } else {
        showPasswordNotice(sectionId);
    }
}

function showSectionContent(sectionId) {
    const passwordNotice = document.querySelector(`#${sectionId} .password-notice`);
    const content = document.querySelector(`#${sectionId}-content`);
    
    if (passwordNotice) passwordNotice.style.display = 'none';
    if (content) content.style.display = 'block';
}

function showPasswordNotice(sectionId) {
    const passwordNotice = document.querySelector(`#${sectionId} .password-notice`);
    const content = document.querySelector(`#${sectionId}-content`);
    
    if (passwordNotice) passwordNotice.style.display = 'block';
    if (content) content.style.display = 'none';
}

function showPasswordDialog(sectionId) {
    const modal = document.getElementById('password-modal');
    const passwordInput = document.getElementById('section-password');
    
    if (modal) {
        modal.classList.add('active');
        modal.setAttribute('data-section', sectionId);
        
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
        }
    }
}

function verifyPassword() {
    const modal = document.getElementById('password-modal');
    const passwordInput = document.getElementById('section-password');
    const sectionId = modal.getAttribute('data-section');
    
    const enteredPassword = passwordInput.value.trim();
    const correctPassword = config.classPasswords[sectionId];
    
    if (enteredPassword === correctPassword) {
        // Unlock section
        app.unlockedSections.push(sectionId);
        // TODO: Save to backend/localStorage
        // app.saveState();
        
        showSectionContent(sectionId);
        closeModal('password-modal');
        
        // Success message
        showNotification('Section unlocked successfully!', 'success');
    } else {
        // Error handling
        passwordInput.classList.add('error');
        showNotification('Incorrect password. Please try again.', 'error');
        
        setTimeout(() => {
            passwordInput.classList.remove('error');
        }, 3000);
    }
}

// Modal Functions
// ==============

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
    }
}

function showWaizTop30Info() {
    showModal('waiz-modal');
}

function showUpgradeDialog() {
    showModal('upgrade-modal');
}

// Authentication Functions
// ========================

function setupEventListeners() {
    // Form submissions
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const adminForm = document.getElementById('admin-login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    if (adminForm) {
        adminForm.addEventListener('submit', handleAdminLogin);
    }
    
    // Modal close handlers
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        if (e.target.classList.contains('modal-close')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close any open modal
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
            document.body.style.overflow = '';
        }
    });
}

async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email') || e.target.querySelector('input[type="email"]').value;
    const password = formData.get('password') || e.target.querySelector('input[type="password"]').value;
    
    // TODO: Implement actual authentication
    // For now, simulate login
    try {
        showNotification('Logging in...', 'info');
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // TODO: Replace with actual API call
        // const response = await fetch(config.apiBase + config.authEndpoints.login, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ email, password })
        // });
        
        // Simulate successful login
        app.currentUser = { email, name: 'Student User' };
        app.isAuthenticated = true;
        
        showNotification('Login successful!', 'success');
        showPage('home');
        
        // TODO: Save auth state
        // app.saveState();
        
    } catch (error) {
        showNotification('Login failed. Please try again.', 'error');
        console.error('Login error:', error);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('name') || e.target.querySelector('input[placeholder="Full Name"]').value;
    const email = formData.get('email') || e.target.querySelector('input[type="email"]').value;
    const className = formData.get('class') || e.target.querySelector('select').value;
    const password = formData.get('password') || e.target.querySelector('input[placeholder="Password"]').value;
    const confirmPassword = e.target.querySelector('input[placeholder="Confirm Password"]').value;
    
    // Basic validation
    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long!', 'error');
        return;
    }
    
    // TODO: Implement actual signup
    try {
        showNotification('Creating account...', 'info');
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // TODO: Replace with actual API call
        // const response = await fetch(config.apiBase + config.authEndpoints.signup, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ name, email, className, password })
        // });
        
        showNotification('Account created successfully! Please login.', 'success');
        showLoginForm();
        
    } catch (error) {
        showNotification('Signup failed. Please try again.', 'error');
        console.error('Signup error:', error);
    }
}

async function handleAdminLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const username = e.target.querySelector('input[placeholder="Admin Username"]').value;
    const password = e.target.querySelector('input[placeholder="Admin Password"]').value;
    
    // TODO: Implement secure admin authentication
    // Temporary check (should be replaced with secure backend)
    if (username === 'admin' && password === 'waizadmin2025') {
        showNotification('Admin access granted!', 'success');
        showAdminDashboard();
    } else {
        showNotification('Invalid admin credentials!', 'error');
    }
}

function showAdminDashboard() {
    const loginForm = document.querySelector('.admin-login-form');
    const dashboard = document.getElementById('admin-dashboard');
    
    if (loginForm) loginForm.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';
}

function resetAdminForm() {
    const loginForm = document.querySelector('.admin-login-form');
    const dashboard = document.getElementById('admin-dashboard');
    
    if (loginForm) loginForm.style.display = 'block';
    if (dashboard) dashboard.style.display = 'none';
}

// Auth Form Toggle Functions
// ==========================

function showLoginForm() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    
    if (loginForm) loginForm.style.display = 'block';
    if (signupForm) signupForm.style.display = 'none';
    
    toggleButtons.forEach(btn => btn.classList.remove('active'));
    toggleButtons[0]?.classList.add('active');
}

function showSignupForm() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    
    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'block';
    
    toggleButtons.forEach(btn => btn.classList.remove('active'));
    toggleButtons[1]?.classList.add('active');
}

function focusFirstInput() {
    const firstInput = document.querySelector('#login-form input');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
}

// Utility Functions
// ================

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => removeNotification(notification), 5000);
    
    // Close button handler
    notification.querySelector('.notification-close').addEventListener('click', () => {
        removeNotification(notification);
    });
}

function removeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Content Management Functions (Admin)
// ===================================

class ContentManager {
    constructor() {
        this.resources = [];
        this.users = [];
        // TODO: Initialize with database connection
        // this.initDatabase();
    }
    
    // TODO: Implement file upload functionality
    async uploadFile(file, category, subject) {
        try {
            // Simulate file upload
            showNotification('Uploading file...', 'info');
            
            // TODO: Implement actual file upload to server/cloud storage
            // const formData = new FormData();
            // formData.append('file', file);
            // formData.append('category', category);
            // formData.append('subject', subject);
            // 
            // const response = await fetch('/api/upload', {
            //     method: 'POST',
            //     body: formData
            // });
            
            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            showNotification('File uploaded successfully!', 'success');
            return { success: true, fileId: Date.now() };
            
        } catch (error) {
            showNotification('Upload failed. Please try again.', 'error');
            console.error('Upload error:', error);
            return { success: false, error };
        }
    }
    
    // TODO: Implement resource management
    addResource(resource) {
        this.resources.push({
            id: Date.now(),
            ...resource,
            createdAt: new Date().toISOString()
        });
        // TODO: Save to database
    }
    
    updateResource(id, updates) {
        const index = this.resources.findIndex(r => r.id === id);
        if (index !== -1) {
            this.resources[index] = { ...this.resources[index], ...updates };
            // TODO: Update in database
            