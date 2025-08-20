// WaizVault - Node.js Express Server
// =================================
// This server handles static file serving and API endpoints for the educational platform

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const config = {
    // JWT Secret (should be in environment variables in production)
    jwtSecret: process.env.JWT_SECRET || 'waizVault_secret_key_2025',
    
    // File upload configuration
    uploadPath: path.join(__dirname, 'public', 'uploads'),
    maxFileSize: 50 * 1024 * 1024, // 50MB
    
    // Database file path
    dbPath: path.join(__dirname, 'data', 'db.json'),
    
    // Allowed file types for uploads
    allowedFileTypes: {
        pdf: ['.pdf'],
        image: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
        video: ['.mp4', '.avi', '.mkv', '.mov'],
        document: ['.doc', '.docx', '.txt', '.rtf']
    }
};

// Middleware Setup
// ===============

// Enable CORS for cross-origin requests
app.use(cors());

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api/', limiter);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Database Helper Functions
// ========================

class Database {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.data = {
            users: [],
            resources: [],
            progress: [],
            announcements: [],
            analytics: []
        };
        this.init();
    }
    
    async init() {
        try {
            // Ensure data directory exists
            await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
            
            // Load existing data or create empty database
            await this.load();
        } catch (error) {
            console.error('Database initialization error:', error);
            await this.save(); // Create empty database file
        }
    }
    
    async load() {
        try {
            const data = await fs.readFile(this.dbPath, 'utf8');
            this.data = JSON.parse(data);
        } catch (error) {
            // File doesn't exist or is invalid, use default empty data
            console.log('Creating new database file...');
            this.data = {
                users: [],
                resources: [],
                progress: [],
                announcements: [],
                analytics: []
            };
        }
    }
    
    async save() {
        try {
            await fs.writeFile(this.dbPath, JSON.stringify(this.data, null, 2));
        } catch (error) {
            console.error('Database save error:', error);
        }
    }
    
    // User operations
    async createUser(user) {
        const newUser = {
            id: Date.now().toString(),
            ...user,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isActive: true
        };
        
        this.data.users.push(newUser);
        await this.save();
        return newUser;
    }
    
    async getUserByEmail(email) {
        return this.data.users.find(user => user.email === email);
    }
    
    async getUserById(id) {
        return this.data.users.find(user => user.id === id);
    }
    
    async updateUser(id, updates) {
        const userIndex = this.data.users.findIndex(user => user.id === id);
        if (userIndex !== -1) {
            this.data.users[userIndex] = { ...this.data.users[userIndex], ...updates };
            await this.save();
            return this.data.users[userIndex];
        }
        return null;
    }
    
    // Resource operations
    async createResource(resource) {
        const newResource = {
            id: Date.now().toString(),
            ...resource,
            createdAt: new Date().toISOString(),
            downloadCount: 0,
            isActive: true
        };
        
        this.data.resources.push(newResource);
        await this.save();
        return newResource;
    }
    
    async getResources(filters = {}) {
        let resources = this.data.resources.filter(r => r.isActive);
        
        // Apply filters
        if (filters.class) {
            resources = resources.filter(r => r.class === filters.class);
        }
        if (filters.subject) {
            resources = resources.filter(r => r.subject === filters.subject);
        }
        if (filters.type) {
            resources = resources.filter(r => r.type === filters.type);
        }
        
        return resources;
    }
    
    // Progress operations
    async updateProgress(userId, progressData) {
        const existingIndex = this.data.progress.findIndex(
            p => p.userId === userId && p.subject === progressData.subject
        );
        
        const progress = {
            userId,
            ...progressData,
            updatedAt: new Date().toISOString()
        };
        
        if (existingIndex !== -1) {
            this.data.progress[existingIndex] = progress;
        } else {
            this.data.progress.push(progress);
        }
        
        await this.save();
        return progress;
    }
    
    async getUserProgress(userId) {
        return this.data.progress.filter(p => p.userId === userId);
    }
}

// Initialize database
const db = new Database(config.dbPath);

// File Upload Configuration
// ========================

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(config.uploadPath, req.body.category || 'general');
        
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const timestamp = Date.now();
        const originalName = file.originalname.replace(/\s+/g, '_');
        cb(null, `${timestamp}_${originalName}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: config.maxFileSize
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const category = req.body.category || 'document';
        
        const allowedExtensions = config.allowedFileTypes[category] || 
                                 Object.values(config.allowedFileTypes).flat();
        
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(`File type ${ext} not allowed for category ${category}`));
        }
    }
});

// Authentication Middleware
// ========================

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        const user = await db.getUserById(decoded.userId);
        
        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

// Admin middleware
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// API Routes
// ==========

// Authentication Routes
// --------------------

// User registration
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, className } = req.body;
        
        // Validate required fields
        if (!name || !email || !password || !className) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        // Check if user already exists
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Create user
        const user = await db.createUser({
            name,
            email,
            password: hashedPassword,
            className,
            role: 'student'
        });
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            config.jwtSecret,
            { expiresIn: '7d' }
        );
        
        // Return user info (without password)
        const { password: _, ...userInfo } = user;
        res.status(201).json({
            message: 'User created successfully',
            user: userInfo,
            token
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Find user
        const user = await db.getUserByEmail(email);
        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Update last login
        await db.updateUser(user.id, { lastLogin: new Date().toISOString() });
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            config.jwtSecret,
            { expiresIn: '7d' }
        );
        
        // Return user info (without password)
        const { password: _, ...userInfo } = user;
        res.json({
            message: 'Login successful',
            user: userInfo,
            token
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Token verification
app.get('/api/auth/verify', authenticateToken, (req, res) => {
    const { password: _, ...userInfo } = req.user;
    res.json({ user: userInfo });
});

// Resource Routes
// --------------

// Get resources with filtering
app.get('/api/resources', authenticateToken, async (req, res) => {
    try {
        const { class: className, subject, type } = req.query;
        const filters = {};
        
        if (className) filters.class = className;
        if (subject) filters.subject = subject;
        if (type) filters.type = type;
        
        const resources = await db.getResources(filters);
        res.json(resources);
        
    } catch (error) {
        console.error('Get resources error:', error);
        res.status(500).json({ error: 'Failed to fetch resources' });
    }
});

// Upload resource (Admin only)
app.post('/api/resources/upload', authenticateToken, requireAdmin, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const { title, description, subject, className, type, isPublic, isPremium } = req.body;
        
        const resource = await db.createResource({
            title,
            description,
            subject,
            class: className,
            type,
            filename: req.file.filename,
            originalName: req.file.originalname,
            filePath: req.file.path,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            isPublic: isPublic === 'true',
            isPremium: isPremium === 'true',
            uploadedBy: req.user.id
        });
        
        res.status(201).json({
            message: 'Resource uploaded successfully',
            resource
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload resource' });
    }
});

// Download resource
app.get('/api/resources/:id/download', authenticateToken, async (req, res) => {
    try {
        const resourceId = req.params.id;
        const resources = await db.getResources();
        const resource = resources.find(r => r.id === resourceId);
        
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        
        // Check access permissions
        if (resource.isPremium && req.user.role !== 'premium' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Premium access required' });
        }
        
        // Check if file exists
        try {
            await fs.access(resource.filePath);
        } catch {
            return res.status(404).json({ error: 'File not found on server' });
        }
        
        // Update download count
        resource.downloadCount = (resource.downloadCount || 0) + 1;
        await db.updateResource(resourceId, { downloadCount: resource.downloadCount });
        
        // Send file
        res.download(resource.filePath, resource.originalName);
        
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Failed to download resource' });
    }
});

// Progress Routes
// --------------

// Update user progress
app.post('/api/progress', authenticateToken, async (req, res) => {
    try {
        const { subject, topic, percentage, timeSpent } = req.body;
        
        if (!subject || !topic || percentage === undefined) {
            return res.status(400).json({ error: 'Subject, topic, and percentage are required' });
        }
        
        const progress = await db.updateProgress(req.user.id, {
            subject,
            topic,
            percentage: Math.min(100, Math.max(0, percentage)),
            timeSpent: timeSpent || 0
        });
        
        res.json({
            message: 'Progress updated successfully',
            progress
        });
        
    } catch (error) {
        console.error('Progress update error:', error);
        res.status(500).json({ error: 'Failed to update progress' });
    }
});

// Get user progress
app.get('/api/progress', authenticateToken, async (req, res) => {
    try {
        const progress = await db.getUserProgress(req.user.id);
        res.json(progress);
        
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

// Admin Routes
// -----------

// Get all users (Admin only)
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const users = db.data.users.map(user => {
            const { password, ...userInfo } = user;
            return userInfo;
        });
        
        res.json(users);
        
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get platform statistics (Admin only)
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const stats = {
            totalUsers: db.data.users.length,
            activeUsers: db.data.users.filter(u => u.isActive).length,
            totalResources: db.data.resources.length,
            totalDownloads: db.data.resources.reduce((sum, r) => sum + (r.downloadCount || 0), 0),
            usersByClass: {},
            resourcesBySubject: {}
        };
        
        // Group users by class
        db.data.users.forEach(user => {
            if (user.className) {
                stats.usersByClass[user.className] = (stats.usersByClass[user.className] || 0) + 1;
            }
        });
        
        // Group resources by subject
        db.data.resources.forEach(resource => {
            if (resource.subject) {
                stats.resourcesBySubject[resource.subject] = (stats.resourcesBySubject[resource.subject] || 0) + 1;
            }
        });
        
        res.json(stats);
        
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Create announcement (Admin only)
app.post('/api/admin/announcements', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { title, message, type, targetClass } = req.body;
        
        const announcement = {
            id: Date.now().toString(),
            title,
            message,
            type: type || 'info',
            targetClass,
            createdBy: req.user.id,
            createdAt: new Date().toISOString(),
            isActive: true
        };
        
        db.data.announcements.push(announcement);
        await db.save();
        
        res.status(201).json({
            message: 'Announcement created successfully',
            announcement
        });
        
    } catch (error) {
        console.error('Create announcement error:', error);
        res.status(500).json({ error: 'Failed to create announcement' });
    }
});

// Get announcements
app.get('/api/announcements', async (req, res) => {
    try {
        const { className } = req.query;
        let announcements = db.data.announcements.filter(a => a.isActive);
        
        if (className) {
            announcements = announcements.filter(a => !a.targetClass || a.targetClass === className);
        }
        
        res.json(announcements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        
    } catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({ error: 'Failed to fetch announcements' });
    }
});

// Search Routes
// ------------

// Search resources
app.get('/api/search', authenticateToken, async (req, res) => {
    try {
        const { q: query, class: className, subject, type } = req.query;
        
        if (!query || query.trim().length < 2) {
            return res.status(400).json({ error: 'Query must be at least 2 characters' });
        }
        
        let resources = await db.getResources();
        
        // Apply text search
        const searchTerm = query.toLowerCase();
        resources = resources.filter(resource => 
            resource.title.toLowerCase().includes(searchTerm) ||
            resource.description?.toLowerCase().includes(searchTerm) ||
            resource.subject.toLowerCase().includes(searchTerm)
        );
        
        // Apply filters
        if (className) {
            resources = resources.filter(r => r.class === className);
        }
        if (subject) {
            resources = resources.filter(r => r.subject === subject);
        }
        if (type) {
            resources = resources.filter(r => r.type === type);
        }
        
        res.json(resources);
        
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Analytics Routes
// ---------------

// Track event
app.post('/api/analytics/event', authenticateToken, async (req, res) => {
    try {
        const { category, action, label, value } = req.body;
        
        const event = {
            id: Date.now().toString(),
            userId: req.user.id,
            category,
            action,
            label,
            value: value || 0,
            timestamp: new Date().toISOString(),
            userAgent: req.headers['user-agent'],
            ip: req.ip
        };
        
        db.data.analytics.push(event);
        await db.save();
        
        res.json({ message: 'Event tracked successfully' });
        
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to track event' });
    }
});

// Health Check Route
// -----------------

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Error Handling Middleware
// =========================

// Handle file upload errors
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
        }
        return res.status(400).json({ error: `Upload error: ${error.message}` });
    }
    
    if (error.message.includes('File type')) {
        return res.status(400).json({ error: error.message });
    }
    
    next(error);
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Serve React app for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Utility Functions
// ================

// Create admin user if it doesn't exist
async function createDefaultAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@waizvault.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'waizadmin2025';
    
    const existingAdmin = await db.getUserByEmail(adminEmail);
    
    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        
        await db.createUser({
            name: 'Admin User',
            email: adminEmail,
            password: hashedPassword,
            className: 'admin',
            role: 'admin'
        });
        
        console.log('Default admin user created:');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log('Please change the password after first login!');
    }
}

// Initialize server
async function startServer() {
    try {
        // Wait for database to initialize
        await db.init();
        
        // Create default admin user
        await createDefaultAdmin();
        
        // Ensure upload directories exist
        await fs.mkdir(path.join(__dirname, 'public', 'uploads'), { recursive: true });
        await fs.mkdir(path.join(__dirname, 'public', 'pdfs'), { recursive: true });
        await fs.mkdir(path.join(__dirname, 'public', 'images'), { recursive: true });
        
        // Start the server
        app.listen(PORT, () => {
            console.log('🚀 WaizVault Server Started Successfully!');
            console.log(`📡 Server running on port ${PORT}`);
            console.log(`🌐 Access the app at: http://localhost:${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📁 Database: ${config.dbPath}`);
            console.log('========================================');
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    await db.save();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    await db.save();
    process.exit(0);
});

// Start the server
startServer();

// Export for testing purposes
module.exports = app;