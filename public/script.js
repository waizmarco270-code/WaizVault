// WaizVault - Complete Working JavaScript with Full Features
// =========================================================

// Global Configuration
const config = {
    apiBase: '/api',
    authEndpoints: {
        login: '/api/auth/login',
        signup: '/api/auth/register',
        verify: '/api/auth/verify'
    },
    classPasswords: {
        class10: 'waiz2025',
        class11: 'jee2025', 
        class12: 'boards2025'
    },
    adminCredentials: {
        username: 'admin',
        password: 'waizadmin2025'
    }
};

// Application State Management
class AppState {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'home';
        this.isAuthenticated = false;
        this.isAdmin = false;
        this.unlockedSections = [];
        this.announcements = [];
        this.uploadedFiles = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.setupMobileMenu();
        this.setupModals();
        this.setupForms();
        this.animateStatCounters();
        this.loadAnnouncements();
        
        console.log('WaizVault Application Initialized Successfully!');
    }
    
    // Save state to localStorage simulation (in memory for now)
    saveState() {
        // In a real app, this would save to localStorage or send to server
        console.log('State saved:', {
            currentUser: this.currentUser,
            unlockedSections: this.unlockedSections,
            isAuthenticated: this.isAuthenticated
        });
    }
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
    
    // Handle button clicks
    const exploreBtn = document.querySelector('button[onclick*="scrollToSection"]');
    if (exploreBtn) {
        exploreBtn.onclick = function() { scrollToSection('features'); };
    }
    
    const getStartedBtn = document.querySelector('button[onclick*="showPage"]');
    if (getStartedBtn) {
        getStartedBtn.onclick = function() { showPage('login'); };
    }
}

function showPage(pageId) {
    console.log('Navigating to:', pageId);
    
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
        
        // Track page view
        trackEvent('Navigation', 'Page View', pageId);
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
            restartHomeAnimations();
            break;
        case 'class10':
        case 'class11':
        case 'class12':
            checkSectionAccess(pageId);
            break;
        case 'admin':
            if (app.isAdmin) {
                showAdminDashboard();
            } else {
                resetAdminForm();
            }
            break;
        case 'login':
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
        app.saveState();
        
        showSectionContent(sectionId);
        closeModal('password-modal');
        
        // Success message
        showNotification('Section unlocked successfully!', 'success');
        trackEvent('Access', 'Section Unlocked', sectionId);
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

function setupModals() {
    // Close modal when clicking outside
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
    trackEvent('Content', 'Info Modal', 'Waiz Top 30');
}

function showUpgradeDialog() {
    showModal('upgrade-modal');
    trackEvent('Monetization', 'Upgrade Modal', 'Premium');
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
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;
    
    try {
        showNotification('Logging in...', 'info');
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // For demo purposes, accept any email/password
        if (email && password) {
            app.currentUser = { email, name: 'Demo User' };
            app.isAuthenticated = true;
            app.saveState();
            
            showNotification('Login successful!', 'success');
            showPage('home');
            trackEvent('Authentication', 'Login Success', email);
        } else {
            throw new Error('Invalid credentials');
        }
        
    } catch (error) {
        showNotification('Login failed. Please try again.', 'error');
        console.error('Login error:', error);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const name = e.target.querySelector('input[placeholder="Full Name"]').value;
    const email = e.target.querySelector('input[type="email"]').value;
    const className = e.target.querySelector('select').value;
    const password = e.target.querySelector('input[placeholder="Password"]').value;
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
    
    try {
        showNotification('Creating account...', 'info');
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // For demo purposes, create account successfully
        showNotification('Account created successfully! Please login.', 'success');
        showLoginForm();
        trackEvent('Authentication', 'Signup Success', email);
        
    } catch (error) {
        showNotification('Signup failed. Please try again.', 'error');
        console.error('Signup error:', error);
    }
}

async function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = e.target.querySelector('input[placeholder*="Username"]').value;
    const password = e.target.querySelector('input[placeholder*="Password"]').value;
    
    if (username === config.adminCredentials.username && password === config.adminCredentials.password) {
        app.isAdmin = true;
        showNotification('Admin access granted!', 'success');
        showAdminDashboard();
        initializeAdminFeatures();
        trackEvent('Admin', 'Login Success', username);
    } else {
        showNotification('Invalid admin credentials!', 'error');
        trackEvent('Admin', 'Login Failed', username);
    }
}

// Admin Dashboard Functions
// =========================

function showAdminDashboard() {
    const loginForm = document.querySelector('.admin-login-form');
    const dashboard = document.getElementById('admin-dashboard');
    
    if (loginForm) loginForm.style.display = 'none';
    if (dashboard) {
        dashboard.style.display = 'block';
        loadAdminData();
    }
}

function resetAdminForm() {
    const loginForm = document.querySelector('.admin-login-form');
    const dashboard = document.getElementById('admin-dashboard');
    
    if (loginForm) loginForm.style.display = 'block';
    if (dashboard) dashboard.style.display = 'none';
    app.isAdmin = false;
}

function initializeAdminFeatures() {
    // Create admin dashboard with working features
    const dashboard = document.getElementById('admin-dashboard');
    if (!dashboard) return;
    
    // Update dashboard with working buttons
    dashboard.innerHTML = `
        <div class="container">
            <div class="admin-header">
                <h2><i class="fas fa-tachometer-alt"></i> Admin Dashboard</h2>
                <button class="btn btn-secondary" onclick="logoutAdmin()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
            
            <div class="admin-tabs">
                <button class="admin-tab active" onclick="showAdminTab('upload')">
                    <i class="fas fa-upload"></i> Upload Content
                </button>
                <button class="admin-tab" onclick="showAdminTab('announcements')">
                    <i class="fas fa-bullhorn"></i> Announcements
                </button>
                <button class="admin-tab" onclick="showAdminTab('users')">
                    <i class="fas fa-users"></i> Users
                </button>
                <button class="admin-tab" onclick="showAdminTab('analytics')">
                    <i class="fas fa-chart-bar"></i> Analytics
                </button>
            </div>
            
            <div class="admin-content">
                <!-- Upload Content Tab -->
                <div id="admin-upload" class="admin-tab-content active">
                    <div class="upload-section">
                        <h3><i class="fas fa-file-upload"></i> Upload Study Materials</h3>
                        <form id="file-upload-form" class="upload-form">
                            <div class="form-row">
                                <div class="input-group">
                                    <label>Title</label>
                                    <input type="text" name="title" placeholder="Enter resource title" required>
                                </div>
                                <div class="input-group">
                                    <label>Class</label>
                                    <select name="class" required>
                                        <option value="">Select Class</option>
                                        <option value="10">Class 10</option>
                                        <option value="11">Class 11</option>
                                        <option value="12">Class 12</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="input-group">
                                    <label>Subject</label>
                                    <select name="subject" required>
                                        <option value="">Select Subject</option>
                                        <option value="physics">Physics</option>
                                        <option value="chemistry">Chemistry</option>
                                        <option value="mathematics">Mathematics</option>
                                        <option value="biology">Biology</option>
                                        <option value="history">History</option>
                                        <option value="civics">Civics</option>
                                        <option value="geography">Geography</option>
                                        <option value="economics">Economics</option>
                                    </select>
                                </div>
                                <div class="input-group">
                                    <label>Type</label>
                                    <select name="type" required>
                                        <option value="">Select Type</option>
                                        <option value="notes">Notes</option>
                                        <option value="pyq">Previous Year Questions</option>
                                        <option value="sample">Sample Papers</option>
                                        <option value="book">Book</option>
                                        <option value="video">Video Lecture</option>
                                    </select>
                                </div>
                            </div>
                            <div class="input-group">
                                <label>Description</label>
                                <textarea name="description" placeholder="Enter description" rows="3"></textarea>
                            </div>
                            <div class="input-group">
                                <label>File</label>
                                <div class="file-upload-area" o        // this.loadState();
        
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
            return true;
        }
        return false;
    }
    
    deleteResource(id) {
        const index = this.resources.findIndex(r => r.id === id);
        if (index !== -1) {
            this.resources.splice(index, 1);
            // TODO: Delete from database and file system
            return true;
        }
        return false;
    }
}

// Initialize content manager for admin users
const contentManager = new ContentManager();

// Progress Tracking Functions
// ===========================

class ProgressTracker {
    constructor() {
        this.userProgress = {};
        // TODO: Load from database
        // this.loadProgress();
    }
    
    updateProgress(userId, subject, topic, percentage) {
        if (!this.userProgress[userId]) {
            this.userProgress[userId] = {};
        }
        
        if (!this.userProgress[userId][subject]) {
            this.userProgress[userId][subject] = {};
        }
        
        this.userProgress[userId][subject][topic] = {
            percentage,
            lastUpdated: new Date().toISOString()
        };
        
        // TODO: Save to database
        // this.saveProgress(userId);
        
        this.updateProgressUI(subject, this.calculateSubjectProgress(userId, subject));
    }
    
    calculateSubjectProgress(userId, subject) {
        if (!this.userProgress[userId] || !this.userProgress[userId][subject]) {
            return 0;
        }
        
        const topics = Object.values(this.userProgress[userId][subject]);
        if (topics.length === 0) return 0;
        
        const totalProgress = topics.reduce((sum, topic) => sum + topic.percentage, 0);
        return Math.round(totalProgress / topics.length);
    }
    
    updateProgressUI(subject, percentage) {
        const progressBars = document.querySelectorAll(`[data-subject="${subject}"] .progress-fill`);
        progressBars.forEach(bar => {
            bar.style.width = `${percentage}%`;
        });
    }
}

const progressTracker = new ProgressTracker();

// Search and Filter Functions
// ===========================

class SearchManager {
    constructor() {
        this.searchIndex = {};
        this.filters = {
            class: '',
            subject: '',
            type: '',
            difficulty: ''
        };
        // TODO: Build search index from database
        // this.buildSearchIndex();
    }
    
    search(query) {
        if (!query.trim()) return [];
        
        // TODO: Implement full-text search
        // For now, simple contains search
        const results = [];
        const lowercaseQuery = query.toLowerCase();
        
        // Search through resources (mock data for now)
        const mockResources = [
            { id: 1, title: 'Physics Chapter 1 Notes', subject: 'physics', class: '11' },
            { id: 2, title: 'Chemistry Organic Compounds', subject: 'chemistry', class: '12' },
            { id: 3, title: 'Mathematics Trigonometry', subject: 'math', class: '10' }
        ];
        
        mockResources.forEach(resource => {
            if (resource.title.toLowerCase().includes(lowercaseQuery) ||
                resource.subject.toLowerCase().includes(lowercaseQuery)) {
                results.push(resource);
            }
        });
        
        return results;
    }
    
    applyFilters(resources) {
        return resources.filter(resource => {
            return (!this.filters.class || resource.class === this.filters.class) &&
                   (!this.filters.subject || resource.subject === this.filters.subject) &&
                   (!this.filters.type || resource.type === this.filters.type) &&
                   (!this.filters.difficulty || resource.difficulty === this.filters.difficulty);
        });
    }
    
    updateFilter(filterType, value) {
        this.filters[filterType] = value;
        // TODO: Trigger search results update
        // this.updateSearchResults();
    }
}

const searchManager = new SearchManager();

// Offline Support Functions
// =========================

class OfflineManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.queuedActions = [];
        
        // TODO: Implement service worker for offline caching
        // this.registerServiceWorker();
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processPendingActions();
            showNotification('Back online! Syncing data...', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            showNotification('You are offline. Some features may be limited.', 'warning');
        });
    }
    
    queueAction(action) {
        if (!this.isOnline) {
            this.queuedActions.push({
                ...action,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    async processPendingActions() {
        while (this.queuedActions.length > 0) {
            const action = this.queuedActions.shift();
            try {
                await this.executeAction(action);
            } catch (error) {
                console.error('Failed to process queued action:', error);
                // Re-queue failed action
                this.queuedActions.unshift(action);
                break;
            }
        }
    }
    
    async executeAction(action) {
        // TODO: Implement action execution based on type
        switch (action.type) {
            case 'upload':
                // Handle file upload
                break;
            case 'progress':
                // Sync progress data
                break;
            case 'user_data':
                // Sync user data
                break;
        }
    }
}

const offlineManager = new OfflineManager();

// Performance Optimization Functions
// =================================

class PerformanceManager {
    constructor() {
        this.lazyLoadObserver = null;
        this.setupLazyLoading();
        this.setupImageOptimization();
    }
    
    setupLazyLoading() {
        // TODO: Implement lazy loading for images and content
        this.lazyLoadObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        this.lazyLoadObserver.unobserve(img);
                    }
                }
            });
        });
        
        // Observe all images with data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.lazyLoadObserver.observe(img);
        });
    }
    
    setupImageOptimization() {
        // TODO: Implement WebP support detection and fallback
        const supportsWebP = this.detectWebPSupport();
        if (supportsWebP) {
            document.body.classList.add('webp-supported');
        }
    }
    
    detectWebPSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    
    preloadCriticalResources() {
        // TODO: Preload critical CSS, JS, and images
        const criticalResources = [
            '/images/logo.webp',
            '/pdfs/waiz-top-30-preview.pdf'
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = resource;
            document.head.appendChild(link);
        });
    }
}

const performanceManager = new PerformanceManager();

// Analytics and Tracking Functions
// ================================

class AnalyticsManager {
    constructor() {
        this.events = [];
        this.sessionStart = new Date().toISOString();
        // TODO: Initialize with analytics service (Google Analytics, etc.)
        // this.initAnalytics();
    }
    
    trackEvent(category, action, label = '', value = 0) {
        const event = {
            category,
            action,
            label,
            value,
            timestamp: new Date().toISOString(),
            sessionId: this.getSessionId(),
            userId: app.currentUser?.id || 'anonymous'
        };
        
        this.events.push(event);
        
        // TODO: Send to analytics service
        // this.sendToAnalytics(event);
        
        console.log('Analytics Event:', event);
    }
    
    trackPageView(page) {
        this.trackEvent('Navigation', 'Page View', page);
    }
    
    trackResourceAccess(resourceId, resourceType) {
        this.trackEvent('Content', 'Resource Access', resourceType, 1);
    }
    
    trackUserProgress(subject, progressPercentage) {
        this.trackEvent('Progress', 'Subject Progress', subject, progressPercentage);
    }
    
    getSessionId() {
        // TODO: Implement proper session ID generation
        return 'session-' + this.sessionStart;
    }
}

const analytics = new AnalyticsManager();

// Error Handling and Logging
// ==========================

class ErrorManager {
    constructor() {
        this.setupGlobalErrorHandlers();
    }
    
    setupGlobalErrorHandlers() {
        // Handle JavaScript errors
        window.addEventListener('error', (event) => {
            this.logError({
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error?.stack
            });
        });
        
        // Handle Promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                message: 'Unhandled Promise Rejection',
                error: event.reason
            });
        });
    }
    
    logError(errorInfo) {
        console.error('Application Error:', errorInfo);
        
        // TODO: Send error to logging service
        // this.sendErrorToService(errorInfo);
        
        // Show user-friendly error message
        if (errorInfo.message && !errorInfo.message.includes('Script error')) {
            showNotification('Something went wrong. Please try again.', 'error');
        }
    }
    
    async sendErrorToService(errorInfo) {
        try {
            // TODO: Implement error reporting service
            // await fetch('/api/errors', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         ...errorInfo,
            //         timestamp: new Date().toISOString(),
            //         userAgent: navigator.userAgent,
            //         url: window.location.href,
            //         userId: app.currentUser?.id
            //     })
            // });
        } catch (err) {
            console.error('Failed to send error to service:', err);
        }
    }
}

const errorManager = new ErrorManager();

// Initialize Application Features
// ==============================

document.addEventListener('DOMContentLoaded', () => {
    // Track initial page load
    analytics.trackPageView('home');
    
    // Setup all interactive features
    setupNavigation();
    
    // Add CSS for notifications (inject styles)
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                border-radius: 12px;
                padding: 1rem 1.5rem;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                display: flex;
                align-items: center;
                gap: 1rem;
                z-index: 3000;
                transform: translateX(400px);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                max-width: 400px;
                min-width: 300px;
            }
            
            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .notification-success {
                border-left: 4px solid #27ae60;
                color: #27ae60;
            }
            
            .notification-error {
                border-left: 4px solid #e74c3c;
                color: #e74c3c;
            }
            
            .notification-warning {
                border-left: 4px solid #f39c12;
                color: #f39c12;
            }
            
            .notification-info {
                border-left: 4px solid #3498db;
                color: #3498db;
            }
            
            .notification-close {
                background: none;
                border: none;
                font-size: 1.2rem;
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.2s;
                margin-left: auto;
            }
            
            .notification-close:hover {
                opacity: 1;
            }
            
            .input-group input.error {
                border-color: #e74c3c !important;
                box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1) !important;
                animation: shake 0.5s ease-in-out;
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log('WaizVault Application Initialized Successfully!');
    console.log('Current State:', app);
});

// Export for potential module use
// TODO: Convert to ES6 modules when supported
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AppState,
        ContentManager,
        ProgressTracker,
        SearchManager,
        OfflineManager,
        PerformanceManager,
        AnalyticsManager,
        ErrorManager
    };
}
