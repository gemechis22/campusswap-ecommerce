/*
 * CAMPUSSWAP JAVASCRIPT - PHASE 2: INTERACTIVITY
 * Mobile-first, modern ES6+ JavaScript for student marketplace
 */

// ============================================
// GLOBAL CONFIGURATION & STATE
// ============================================

const CampusSwap = {
    // Configuration
    config: {
        university: 'York University',
        domain: 'yorku.ca',
        version: '1.0.0',
        debug: true,
        apiBaseUrl: 'http://localhost:3001/api', // Backend API endpoint
        tokenKey: 'campusswap_token' // TEACHING: we store JWT under this key
    },

    // Application state
    state: {
        currentCategory: 'all',
        searchTerm: '',
        cart: [],
        products: [], // Will be populated from API
        categories: [], // TEACHING: Store categories with {id, name, slug}
        user: null,
        isMobile: window.innerWidth <= 768,
        isLoading: false,
        error: null
    },

    // Initialize the application
    init() {
        console.log('🚀 CampusSwap initializing...');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize components
        this.setupMobileNavigation();
        this.setupSearch();
        this.setupCategoryFilters();
        this.setupShoppingCart();
        this.setupAuthUI(); // TEACHING: set up auth buttons depending on login state
        this.setupSortControls(); // TEACHING: set up sorting dropdown
        
        // Load user cart from API if authenticated
        if (this.state.isAuthenticated) {
            this.loadCartFromAPI();
        }
        
        // Load categories and products from API (async)
        this.loadCategoriesFromAPI(); // TEACHING: Load categories first (returns Promise)
        this.loadProductsFromAPI();
        
        console.log('✅ CampusSwap ready!');
    }
};

// ============================================
// API COMMUNICATION
// ============================================

CampusSwap.loadProductsFromAPI = async function(sortBy = '', sortOrder = '') {
    try {
        // Show loading state
        this.state.isLoading = true;
        this.showLoadingState();
        
        console.log('📡 Fetching products from API...');
        
        // Build query params
        let url = `${this.config.apiBaseUrl}/products`;
        const params = new URLSearchParams();
        
        if (sortBy) params.append('sortBy', sortBy);
        if (sortOrder) params.append('sortOrder', sortOrder);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        // Fetch products from backend
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Store products in state
        this.state.products = data.data || [];
        this.state.isLoading = false;
        this.state.error = null;
        
        console.log(`✅ Loaded ${this.state.products.length} products from API`);
        
        // Render products
        this.filterAndDisplayProducts();
        
    } catch (error) {
        console.error('❌ Error loading products:', error);
        this.state.isLoading = false;
        this.state.error = error.message;
        this.showErrorState(error.message);
    }
};

// ============================================
// AUTH + API HELPERS (TEACHING SECTION)
// ============================================

// TEACHING: A single helper to call our backend.
// It automatically adds JSON headers and Authorization if logged in.
CampusSwap.apiFetch = async function(path, options = {}) {
    const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
    const token = localStorage.getItem(this.config.tokenKey);
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${this.config.apiBaseUrl}${path}`, { ...options, headers });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`API ${res.status}: ${text}`);
    }
    return res.json();
};

// TEACHING: Setup navbar Sign In / Sign Up / Logout behaviors.
CampusSwap.setupAuthUI = async function() {
    const actions = document.querySelector('.navbar-actions');
    if (!actions) return;

    // TEACHING: Check if logged in first
    const token = localStorage.getItem(this.config.tokenKey);
    if (token) {
        // TEACHING: Fetch user info from backend to display their name
        // This shows how to use the /api/auth/me endpoint to get current user
        try {
            const userData = await this.apiFetch('/auth/me');
            this.state.user = userData.data; // Store user info in state
            
            // TEACHING: Build navbar with user's name and actions
            // Shows personalized welcome message
            const adminButton = this.state.user.isAdmin 
                ? '<button class="btn-secondary btn-admin" data-action="admin">Admin Dashboard</button>' 
                : '';
            
            actions.innerHTML = `
                <span class="user-welcome">Welcome, <strong>${this.state.user.firstName}</strong>!</span>
                ${adminButton}
                <button class="btn-secondary" data-action="my-listings">My Listings</button>
                <button class="btn-secondary" data-action="purchases">My Purchases</button>
                <button class="btn-secondary" data-action="sell">Sell Item</button>
                <button class="btn-secondary" data-action="logout">Logout</button>
            `;
            
            // TEACHING: Attach event listeners to new buttons
            const adminBtn = actions.querySelector('[data-action="admin"]');
            const myListingsBtn = actions.querySelector('[data-action="my-listings"]');
            const purchasesBtn = actions.querySelector('[data-action="purchases"]');
            const sellBtn = actions.querySelector('[data-action="sell"]');
            const logoutBtn = actions.querySelector('[data-action="logout"]');
            
            if (adminBtn) adminBtn.addEventListener('click', () => this.showAdminDashboard());
            if (myListingsBtn) myListingsBtn.addEventListener('click', () => this.showMyListings());
            if (purchasesBtn) purchasesBtn.addEventListener('click', () => this.showPurchaseHistory());
            if (sellBtn) sellBtn.addEventListener('click', () => this.showSellItemModal());
            if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());
            
        } catch (err) {
            // TEACHING: If token is invalid/expired, log out automatically
            console.warn('Failed to fetch user info, logging out:', err);
            this.logout();
        }
    } else {
        // User is NOT logged in - attach listeners to existing buttons
        // TEACHING: Find buttons by their text content to avoid confusion
        const buttons = Array.from(actions.querySelectorAll('button'));
        const signInBtn = buttons.find(b => b.textContent.trim() === 'Sign In');
        const signUpBtn = buttons.find(b => b.textContent.trim() === 'Sign Up');
        
        if (signInBtn) signInBtn.addEventListener('click', () => this.showLoginModal());
        if (signUpBtn) signUpBtn.addEventListener('click', () => this.showRegisterModal());
    }
};

CampusSwap.login = async function(email, password) {
    // TEACHING: POST credentials and store JWT on success
    const data = await this.apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    // TEACHING: Backend returns {success:true, data:{token, user}}
    // So we need data.data.token (nested data property), not just data.token
    if (data.data && data.data.token) {
        localStorage.setItem(this.config.tokenKey, data.data.token);
    }
    this.setupAuthUI();
    // Load cart after login
    await this.loadCartFromAPI();
    return data;
};

CampusSwap.register = async function(payload) {
    // payload: { firstName, lastName, email, password }
    const data = await this.apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
    // TEACHING: Backend returns {success:true, data:{token, user}}
    // So we need data.data.token (nested data property), not just data.token
    if (data.data && data.data.token) {
        localStorage.setItem(this.config.tokenKey, data.data.token);
    }
    this.setupAuthUI();
    // Load cart after registration
    await this.loadCartFromAPI();
    return data;
};

CampusSwap.logout = function() {
    localStorage.removeItem(this.config.tokenKey);
    this.state.cart = []; // Clear cart on logout
    this.updateCartDisplay();
    // Reload UI state
    window.location.reload();
};

// ============================================
// SIMPLE MODAL BUILDERS (TEACHING)
// ============================================

CampusSwap.closeAnyModal = function() {
    document.querySelectorAll('.form-modal').forEach(m => m.remove());
};

CampusSwap.showLoginModal = function() {
    this.closeAnyModal();
    const modal = document.createElement('div');
    modal.className = 'form-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header"><h3>Sign In</h3><button class="modal-close">✕</button></div>
            <div class="modal-body">
                <!-- TEACHING: We collect credentials and call /auth/login -->
                <label>Email</label>
                <input type="email" id="login-email" placeholder="you@yorku.ca" />
                <label>Password</label>
                <input type="password" id="login-password" placeholder="••••••••" />
                <small style="color: var(--medium-gray); margin-top: -8px; display: block;">Min 8 characters</small>
                <button class="btn-primary" id="login-submit">Sign In</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    modal.querySelector('#login-submit').addEventListener('click', async () => {
        const email = modal.querySelector('#login-email').value.trim();
        const password = modal.querySelector('#login-password').value;
        try {
            await this.login(email, password);
            modal.remove();
            alert('Signed in successfully!');
            // TEACHING: Reload page so navbar updates to Sell/Logout
            window.location.reload();
        } catch (err) {
            alert('Login failed: ' + err.message);
        }
    });
};

CampusSwap.showRegisterModal = function() {
    this.closeAnyModal();
    const modal = document.createElement('div');
    modal.className = 'form-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header"><h3>Sign Up</h3><button class="modal-close">✕</button></div>
            <div class="modal-body">
                <!-- TEACHING: We map fields to backend register DTO -->
                <label>First Name</label>
                <input type="text" id="reg-first" />
                <label>Last Name</label>
                <input type="text" id="reg-last" />
                <label>Email</label>
                <input type="email" id="reg-email" placeholder="you@yorku.ca" />
                <label>Password</label>
                <input type="password" id="reg-password" />
                <small style="color: var(--medium-gray); margin-top: -8px; display: block;">Min 8 characters required</small>
                <button class="btn-primary" id="reg-submit">Create Account</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    modal.querySelector('#reg-submit').addEventListener('click', async () => {
        const payload = {
            firstName: modal.querySelector('#reg-first').value.trim(),
            lastName: modal.querySelector('#reg-last').value.trim(),
            email: modal.querySelector('#reg-email').value.trim(),
            password: modal.querySelector('#reg-password').value,
            program: 'General' // TEACHING: backend requires program field
        };
        try {
            await this.register(payload);
            modal.remove();
            alert('Account created! You are now signed in.');
            // TEACHING: Force UI refresh so navbar updates
            window.location.reload();
        } catch (err) {
            alert('Registration failed: ' + err.message);
        }
    });
};

CampusSwap.showSellItemModal = function() {
    // TEACHING: Minimal form that posts to /products using JWT
    const token = localStorage.getItem(this.config.tokenKey);
    if (!token) return this.showLoginModal();
    this.closeAnyModal();
    const modal = document.createElement('div');
    modal.className = 'form-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header"><h3>Post an Item for Sale</h3><button class="modal-close">✕</button></div>
            <div class="modal-body">
                <label>Title</label>
                <input type="text" id="sell-title" placeholder="e.g., Calculus Textbook" />
                <label>Price (CAD)</label>
                <input type="number" id="sell-price" min="0" step="0.01" />
                <label>Quantity Available</label>
                <input type="number" id="sell-quantity" min="1" value="1" />
                <label>Category</label>
                <select id="sell-category">
                    <option value="textbooks">Textbooks</option>
                    <option value="electronics">Electronics</option>
                    <option value="lab-equipment">Lab Equipment</option>
                    <option value="stationery">Stationery</option>
                </select>
                <label>Course Code</label>
                <input type="text" id="sell-course" placeholder="MATH 1013" />
                <label>Condition</label>
                <select id="sell-condition">
                    <option value="LIKE_NEW">LIKE_NEW</option>
                    <option value="EXCELLENT">EXCELLENT</option>
                    <option value="GOOD">GOOD</option>
                    <option value="FAIR">FAIR</option>
                </select>
                <label>Description</label>
                <textarea id="sell-desc" rows="3" placeholder="Details buyers should know..."></textarea>
                <label>Emoji/Image</label>
                <input type="text" id="sell-image" placeholder="📖 or image URL" />
                <button class="btn-primary" id="sell-submit">Post Item</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    modal.querySelector('#sell-submit').addEventListener('click', async () => {
        const categorySlug = modal.querySelector('#sell-category').value;
        // TEACHING: Map slug to categoryId using loaded categories
        const category = this.state.categories.find(c => c.slug === categorySlug);
        if (!category) {
            alert('Category not found. Please refresh and try again.');
            return;
        }
        const payload = {
            title: modal.querySelector('#sell-title').value.trim(),
            price: parseFloat(modal.querySelector('#sell-price').value || '0'),
            quantity: parseInt(modal.querySelector('#sell-quantity').value || '1'),
            description: modal.querySelector('#sell-desc').value.trim(),
            courseCode: modal.querySelector('#sell-course').value.trim(),
            condition: modal.querySelector('#sell-condition').value,
            imageUrl: modal.querySelector('#sell-image').value.trim() || '📦',
            categoryId: category.id // TEACHING: Backend expects categoryId, not slug
        };
        try {
            const result = await this.apiFetch('/products', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            alert('Item posted!');
            modal.remove();
            // Refresh list to include new product
            await this.loadProductsFromAPI();
        } catch (err) {
            alert('Failed to post item: ' + err.message);
        }
    });
};

// TEACHING: Load categories so we can map slug→ID when posting products
CampusSwap.loadCategoriesFromAPI = async function() {
    try {
        // Backend doesn't have /categories endpoint yet, so extract from products
        const response = await fetch(`${this.config.apiBaseUrl}/products`);
        if (!response.ok) return;
        const data = await response.json();
        // Extract unique categories
        const catMap = new Map();
        data.data.forEach(p => {
            if (p.category && !catMap.has(p.category.slug)) {
                catMap.set(p.category.slug, { id: p.categoryId, ...p.category });
            }
        });
        this.state.categories = Array.from(catMap.values());
        console.log('📂 Loaded categories:', this.state.categories);
    } catch (err) {
        console.warn('Could not load categories:', err);
    }
};

CampusSwap.showLoadingState = function() {
    const productGrid = document.querySelector('.product-grid');
    productGrid.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner">⏳</div>
            <h3>Loading products...</h3>
            <p>Fetching the latest items from CampusSwap</p>
        </div>
    `;
};

CampusSwap.showErrorState = function(errorMessage) {
    const productGrid = document.querySelector('.product-grid');
    productGrid.innerHTML = `
        <div class="error-state">
            <div class="error-icon">⚠️</div>
            <h3>Unable to load products</h3>
            <p>${errorMessage}</p>
            <button onclick="CampusSwap.loadProductsFromAPI()" class="btn-primary">
                🔄 Try Again
            </button>
        </div>
    `;
};

// ============================================
// SAMPLE DATA (Legacy - kept for reference)
// ============================================

CampusSwap.loadSampleProducts = function() {
    // Sample products - in Phase 4, this will come from database
    this.state.products = [
        {
            id: 'p001',
            title: 'Calculus Early Transcendentals (8th Ed)',
            price: 85,
            category: 'textbooks',
            course: 'MATH 1013',
            condition: 'Like New',
            seller: 'sarah_chen',
            rating: 4.8,
            image: '📖',
            description: 'Perfect condition calculus textbook. All chapters intact, no highlighting.',
            datePosted: '2025-11-08'
        },
        {
            id: 'p002',
            title: 'TI-84 Plus CE Graphing Calculator',
            price: 120,
            category: 'electronics',
            course: 'MATH/PHYS',
            condition: 'Excellent',
            seller: 'mike_torres',
            rating: 4.9,
            image: '💻',
            description: 'Barely used calculator. Includes all original accessories and manual.',
            datePosted: '2025-11-07'
        },
        {
            id: 'p003',
            title: 'Chemistry Lab Safety Kit',
            price: 35,
            category: 'lab-equipment',
            course: 'CHEM 1000/1001',
            condition: 'Good',
            seller: 'alex_park',
            rating: 4.7,
            image: '⚗️',
            description: 'Complete safety kit with goggles, gloves, and lab coat. Size Medium.',
            datePosted: '2025-11-06'
        },
        {
            id: 'p004',
            title: 'Engineering Drawing Set',
            price: 25,
            category: 'stationery',
            course: 'ESSE 1012',
            condition: 'Fair',
            seller: 'jenny_kim',
            rating: 4.6,
            image: '📐',
            description: 'Complete drawing set with compass, rulers, and technical pens.',
            datePosted: '2025-11-05'
        },
        {
            id: 'p005',
            title: 'Organic Chemistry (3rd Edition)',
            price: 95,
            category: 'textbooks',
            course: 'CHEM 2020',
            condition: 'Like New',
            seller: 'david_wong',
            rating: 4.9,
            image: '📚',
            description: 'Excellent condition. Used for one semester only.',
            datePosted: '2025-11-04'
        },
        {
            id: 'p006',
            title: 'iPad Air (64GB) with Apple Pencil',
            price: 450,
            category: 'electronics',
            course: 'General Use',
            condition: 'Excellent',
            seller: 'emma_garcia',
            rating: 4.8,
            image: '📱',
            description: 'Perfect for note-taking and digital textbooks. Includes case.',
            datePosted: '2025-11-03'
        }
    ];
    
    console.log(`📦 Loaded ${this.state.products.length} sample products`);
};

// ============================================
// EVENT LISTENERS SETUP
// ============================================

CampusSwap.setupEventListeners = function() {
    // Window resize handler for responsive behavior
    window.addEventListener('resize', () => {
        const wasMobile = this.state.isMobile;
        this.state.isMobile = window.innerWidth <= 768;
        
        // Refresh mobile navigation if screen size changed
        if (wasMobile !== this.state.isMobile) {
            this.setupMobileNavigation();
        }
    });

    // Prevent form submissions for now (Phase 3 will handle this)
    document.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Form submission prevented - Phase 3 will handle this');
    });
};

// ============================================
// MOBILE NAVIGATION
// ============================================

CampusSwap.setupMobileNavigation = function() {
    const navbar = document.querySelector('.navbar');
    const navMenu = document.querySelector('.navbar-menu');
    
    // Remove existing mobile menu button if it exists
    const existingButton = navbar.querySelector('.mobile-menu-toggle');
    if (existingButton) {
        existingButton.remove();
    }
    
    // Add mobile menu toggle for small screens
    if (this.state.isMobile && !existingButton) {
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-menu-toggle';
        mobileToggle.innerHTML = '☰';
        mobileToggle.setAttribute('aria-label', 'Toggle navigation menu');
        
        // Insert after brand, before actions
        const navActions = document.querySelector('.navbar-actions');
        navbar.insertBefore(mobileToggle, navActions);
        
        // Toggle menu visibility
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('mobile-menu-open');
            mobileToggle.innerHTML = navMenu.classList.contains('mobile-menu-open') ? '✕' : '☰';
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target) && navMenu.classList.contains('mobile-menu-open')) {
                navMenu.classList.remove('mobile-menu-open');
                mobileToggle.innerHTML = '☰';
            }
        });
    }
    
    console.log(`📱 Mobile navigation ${this.state.isMobile ? 'enabled' : 'disabled'}`);
};

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

CampusSwap.setupSearch = function() {
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    
    if (!searchInput) return;
    
    // Real-time search as user types
    searchInput.addEventListener('input', (e) => {
        this.state.searchTerm = e.target.value.toLowerCase();
        this.filterAndDisplayProducts();
    });
    
    // Search button click
    searchButton.addEventListener('click', () => {
        this.performSearch();
    });
    
    // Enter key in search
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            this.performSearch();
        }
    });
    
    console.log('🔍 Search functionality initialized');
};

CampusSwap.performSearch = function() {
    const searchTerm = document.querySelector('.search-input').value;
    console.log(`🔍 Searching for: "${searchTerm}"`);
    
    // Visual feedback
    this.showSearchResults(searchTerm);
};

CampusSwap.showSearchResults = function(term) {
    const resultsCount = this.getFilteredProducts().length;
    
    // Update section title to show search results
    const sectionTitle = document.querySelector('.featured-products .section-title');
    if (term.trim()) {
        sectionTitle.textContent = `Search Results for "${term}" (${resultsCount} found)`;
    } else {
        sectionTitle.textContent = 'Recently Listed';
    }
};

// ============================================
// CATEGORY FILTERING
// ============================================

CampusSwap.setupCategoryFilters = function() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const categoryText = card.querySelector('h3').textContent.toLowerCase();
            
            // Map display names to internal category names
            const categoryMap = {
                'textbooks': 'textbooks',
                'electronics': 'electronics',
                'lab equipment': 'lab-equipment',
                'stationery': 'stationery'
            };
            
            this.state.currentCategory = categoryMap[categoryText] || 'all';

            // Clear any active search when picking a category
            this.state.searchTerm = '';
            const searchInput = document.querySelector('.search-input');
            if (searchInput) searchInput.value = '';
            
            // Visual feedback
            this.highlightActiveCategory(card);
            
            // Filter products
            this.filterAndDisplayProducts();
            
            console.log(`📂 Category filter: ${this.state.currentCategory}`);
        });
    });
    
    console.log('📂 Category filtering initialized');
};

CampusSwap.highlightActiveCategory = function(activeCard) {
    // Remove active class from all cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('category-active');
    });
    
    // Add active class to clicked card
    activeCard.classList.add('category-active');
    
    // Scroll to products section on mobile
    if (this.state.isMobile) {
        document.querySelector('.featured-products').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
};

// ============================================
// SORTING
// ============================================

CampusSwap.setupSortControls = function() {
    const sortDropdown = document.getElementById('sortBy');
    
    if (!sortDropdown) {
        console.warn('⚠️ Sort dropdown not found');
        return;
    }
    
    sortDropdown.addEventListener('change', async (e) => {
        const value = e.target.value;
        console.log(`🔄 Sorting by: ${value}`);
        
        // Parse the value (format: "field-order")
        const [sortBy, sortOrder] = value.split('-');
        
        // Reload products with sorting
        await this.loadProductsFromAPI(sortBy, sortOrder);
    });
    
    console.log('🔄 Sort controls initialized');
};

// ============================================
// PRODUCT FILTERING & DISPLAY
// ============================================

CampusSwap.getFilteredProducts = function() {
    return this.state.products.filter(product => {
        // Category filter - handle category object from database
        const productCategory = product.category?.slug || (typeof product.category === 'string' ? product.category : null);
        const categoryMatch = this.state.currentCategory === 'all' || 
                            productCategory === this.state.currentCategory;
        
        // Search filter - search across multiple fields
        const searchMatch = !this.state.searchTerm || 
                          product.title.toLowerCase().includes(this.state.searchTerm) ||
                          (product.courseCode && product.courseCode.toLowerCase().includes(this.state.searchTerm)) ||
                          (product.courseName && product.courseName.toLowerCase().includes(this.state.searchTerm)) ||
                          (product.category?.name && product.category.name.toLowerCase().includes(this.state.searchTerm)) ||
                          (product.category?.slug && product.category.slug.toLowerCase().includes(this.state.searchTerm)) ||
                          (product.description && product.description.toLowerCase().includes(this.state.searchTerm));
        
        return categoryMatch && searchMatch;
    });
};

CampusSwap.filterAndDisplayProducts = function() {
    const filteredProducts = this.getFilteredProducts();
    this.renderProducts(filteredProducts);
    this.showSearchResults(this.state.searchTerm);
};

CampusSwap.renderProducts = function(products) {
    const productGrid = document.querySelector('.product-grid');
    
    if (products.length === 0) {
        productGrid.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your search or browse different categories.</p>
                <button onclick="CampusSwap.clearFilters()" class="btn-primary">Clear Filters</button>
            </div>
        `;
        return;
    }
    
    // Store reference to this for use inside map
    const self = this;
    
    productGrid.innerHTML = products.map(product => {
        const isLiked = self.isProductLiked(product.id);
        
        // Get emoji for category (fallback if no image)
        const categoryEmojis = {
            'textbooks': '📖',
            'electronics': '💻',
            'lab-equipment': '⚗️',
            'stationery': '📐'
        };
        // Handle category as object or string
        const categorySlug = product.category?.slug || (typeof product.category === 'string' ? product.category.toLowerCase() : null);
        const emoji = categoryEmojis[categorySlug] || '📦';
        
        return `
            <article class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <div class="image-placeholder">${product.imageUrl || emoji}</div>
                    <button class="quick-add-btn" onclick="CampusSwap.addToCart('${product.id}')">
                        + Add to Cart
                    </button>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-course">${product.courseName || 'General'} • ${product.condition} Condition</p>
                    <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
                    <div class="product-inventory">
                        <span class="inventory-badge ${(product.quantity || 0) < 5 ? 'low-stock' : ''}">
                            ${(product.quantity || 0) < 5 ? '⚠️ Only ' : ''}${product.quantity || 0} in stock
                        </span>
                    </div>
                    <div class="product-seller">
                        <span class="seller-name">@${product.seller?.username || 'anonymous'}</span>
                        <span class="seller-rating">⭐ ${product.seller?.rating || '4.5'}</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn-secondary btn-sm" onclick="CampusSwap.viewProduct('${product.id}')">
                            View Details
                        </button>
                        <button class="btn-primary btn-sm" onclick="CampusSwap.addToCart('${product.id}')">
                            Add to Cart
                        </button>
                        <button class="btn-like ${isLiked ? 'liked' : ''}" 
                                onclick="CampusSwap.toggleLike('${product.id}')">
                            ${isLiked ? '❤️' : '🤍'}
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join('');
    
    console.log(`📦 Rendered ${products.length} products`);
};

CampusSwap.clearFilters = function() {
    this.state.currentCategory = 'all';
    this.state.searchTerm = '';
    
    // Clear search input
    const searchInput = document.querySelector('.search-input');
    if (searchInput) searchInput.value = '';
    
    // Remove category highlighting
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('category-active');
    });
    
    // Show all products
    this.filterAndDisplayProducts();
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CampusSwap.init());
} else {
    CampusSwap.init();
}

// ============================================
// SHOPPING CART FUNCTIONALITY
// ============================================

CampusSwap.setupShoppingCart = function() {
    // Create cart counter in navigation
    this.createCartCounter();
    
    console.log('🛒 Shopping cart initialized');
};

CampusSwap.createCartCounter = function() {
    const navActions = document.querySelector('.navbar-actions');
    
    // Remove existing cart button if present
    const existingCart = navActions.querySelector('.cart-button');
    if (existingCart) existingCart.remove();
    
    // Create cart button
    const cartButton = document.createElement('button');
    cartButton.className = 'btn-secondary cart-button';
    cartButton.innerHTML = '🛒 Cart (<span class="cart-count">0</span>)';
    
    // Insert before sign-in button
    const signInButton = navActions.querySelector('.btn-secondary');
    navActions.insertBefore(cartButton, signInButton);
    
    // Cart click handler
    cartButton.addEventListener('click', () => {
        this.showCartModal();
    });
};

CampusSwap.addToCart = async function(productId) {
    const product = this.state.products.find(p => p.id === productId);
    if (!product) return;
    
    // Check if user is logged in
    if (!this.state.isAuthenticated) {
        alert('Please sign in to add items to cart');
        return;
    }
    
    try {
        const response = await fetch(`${this.config.apiBaseUrl}/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: JSON.stringify({
                productId: productId,
                quantity: 1
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            await this.loadCartFromAPI();
            this.showCartNotification(product.title);
            console.log(`🛒 Added ${product.title} to cart`);
        } else {
            alert(data.message || 'Failed to add item to cart');
        }
    } catch (error) {
        console.error('❌ Error adding to cart:', error);
        alert('Failed to add item to cart');
    }
};

CampusSwap.removeFromCart = async function(productId) {
    if (!this.state.isAuthenticated) return;
    
    try {
        const response = await fetch(`${this.config.apiBaseUrl}/cart/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            await this.loadCartFromAPI();
            console.log('🛒 Item removed from cart');
        } else {
            alert(data.message || 'Failed to remove item');
        }
    } catch (error) {
        console.error('❌ Error removing from cart:', error);
        alert('Failed to remove item from cart');
    }
};

CampusSwap.updateCartQuantity = async function(productId, newQuantity) {
    if (newQuantity <= 0) {
        await this.removeFromCart(productId);
        return;
    }
    
    if (!this.state.isAuthenticated) return;
    
    try {
        const response = await fetch(`${this.config.apiBaseUrl}/cart/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: JSON.stringify({ quantity: newQuantity })
        });
        
        const data = await response.json();
        
        if (data.success) {
            await this.loadCartFromAPI();
        } else {
            alert(data.message || 'Failed to update quantity');
        }
    } catch (error) {
        console.error('❌ Error updating cart:', error);
        alert('Failed to update cart');
    }
};

CampusSwap.updateCartDisplay = function() {
    const cartCount = document.querySelector('.cart-count');
    const totalItems = this.state.cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
};

CampusSwap.getCartTotal = function() {
    return this.state.cart.reduce((total, item) => {
        // Check if product details are included in cart item (from API)
        const product = item.product || this.state.products.find(p => p.id === item.productId);
        return total + (product ? parseFloat(product.price) * item.quantity : 0);
    }, 0);
};

CampusSwap.showCartModal = function() {
    // Remove existing modal
    const existingModal = document.querySelector('.cart-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'cart-modal';
    modal.innerHTML = this.generateCartModalHTML();
    
    document.body.appendChild(modal);
    
    // Close modal handlers
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    // Quantity change handlers
    modal.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.dataset.productId;
            const action = e.target.dataset.action;
            const currentQuantity = parseInt(e.target.parentNode.querySelector('.quantity-display').textContent);
            
            if (action === 'increase') {
                this.updateCartQuantity(productId, currentQuantity + 1);
            } else if (action === 'decrease') {
                this.updateCartQuantity(productId, currentQuantity - 1);
            }
            
            // Refresh modal
            modal.innerHTML = this.generateCartModalHTML();
        });
    });
};

CampusSwap.generateCartModalHTML = function() {
    if (this.state.cart.length === 0) {
        return `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Your Cart</h2>
                    <button class="modal-close">✕</button>
                </div>
                <div class="empty-cart">
                    <div class="empty-cart-icon">🛒</div>
                    <h3>Your cart is empty</h3>
                    <p>Add some items to get started!</p>
                </div>
            </div>
        `;
    }
    
    const cartItems = this.state.cart.map(item => {
        // Use product from cart item (API) or find in products array
        const product = item.product || this.state.products.find(p => p.id === item.productId);
        if (!product) return '';
        
        // Get emoji for category
        const categoryEmojis = {
            'textbooks': '📖',
            'electronics': '💻',
            'lab-equipment': '⚗️',
            'stationery': '📐'
        };
        const categorySlug = product.category?.slug || (typeof product.category === 'string' ? product.category.toLowerCase() : null);
        const emoji = categoryEmojis[categorySlug] || '📦';
        
        return `
            <div class="cart-item">
                <div class="cart-item-image">${product.imageUrl || emoji}</div>
                <div class="cart-item-info">
                    <h4>${product.title}</h4>
                    <p>${product.courseCode || 'General'}</p>
                    <span class="cart-item-price">$${parseFloat(product.price).toFixed(2)}</span>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" data-action="decrease" data-product-id="${item.productId}">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" data-action="increase" data-product-id="${item.productId}">+</button>
                </div>
                <div class="cart-item-total">$${(parseFloat(product.price) * item.quantity).toFixed(2)}</div>
            </div>
        `;
    }).join('');
    
    const total = this.getCartTotal();
    
    return `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Your Cart (${this.state.cart.length} items)</h2>
                <button class="modal-close">✕</button>
            </div>
            <div class="cart-items">
                ${cartItems}
            </div>
            <div class="cart-footer">
                <div class="cart-total">
                    <strong>Total: $${total.toFixed(2)}</strong>
                </div>
                <button class="btn-primary btn-checkout" onclick="CampusSwap.checkout()">
                    Proceed to Checkout
                </button>
            </div>
        </div>
    `;
};

CampusSwap.showCartNotification = function(productTitle) {
    // Remove existing notification
    const existing = document.querySelector('.cart-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <span>✅ Added "${productTitle}" to cart</span>
        <button onclick="this.parentElement.remove()">✕</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
};

// ============================================
// CART API FUNCTIONALITY
// ============================================

CampusSwap.loadCartFromAPI = async function() {
    if (!this.state.isAuthenticated) {
        this.state.cart = [];
        this.updateCartDisplay();
        return;
    }
    
    try {
        const response = await fetch(`${this.config.apiBaseUrl}/cart`, {
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            // Convert API format to local state format
            this.state.cart = data.data.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                dateAdded: item.createdAt,
                product: item.product // Include full product details
            }));
            
            this.updateCartDisplay();
            console.log(`🛒 Loaded ${this.state.cart.length} items from cart API`);
        }
    } catch (error) {
        console.error('❌ Error loading cart:', error);
        this.state.cart = [];
        this.updateCartDisplay();
    }
};

// ============================================
// LOCAL STORAGE FUNCTIONALITY (DEPRECATED - Using API now)
// ============================================

CampusSwap.loadCartFromStorage = function() {
    try {
        const savedCart = localStorage.getItem('campusswap_cart');
        if (savedCart) {
            this.state.cart = JSON.parse(savedCart);
            this.updateCartDisplay();
            console.log(`💾 Loaded ${this.state.cart.length} items from storage`);
        }
    } catch (error) {
        console.warn('Failed to load cart from storage:', error);
        this.state.cart = [];
    }
};

CampusSwap.saveCartToStorage = function() {
    try {
        localStorage.setItem('campusswap_cart', JSON.stringify(this.state.cart));
        console.log('� Cart saved to storage');
    } catch (error) {
        console.warn('Failed to save cart to storage:', error);
    }
};

// ============================================
// PRODUCT INTERACTION FEATURES
// ============================================

CampusSwap.viewProduct = function(productId) {
    const product = this.state.products.find(p => p.id === productId);
    if (!product) return;
    
    console.log(`👁️ Viewing product: ${product.title}`);
    
    // Extract seller information
    const sellerName = product.seller 
        ? `${product.seller.firstName} ${product.seller.lastName}` 
        : 'Unknown';
    
    const sellerProgram = product.seller?.program || 'Student';
    
    // For now, show alert - in Phase 3 this will be a proper modal
    alert(`${product.title}\n\nCourse: ${product.courseCode || product.course || 'General'}\nCondition: ${product.condition}\nPrice: $${parseFloat(product.price).toFixed(2)}\n\nDescription: ${product.description}\n\nSeller: ${sellerName} (${sellerProgram})\nMeetup Location: ${product.meetupLocation || 'TBD'}`);
};

CampusSwap.toggleLike = function(productId) {
    const likedProducts = JSON.parse(localStorage.getItem('campusswap_likes') || '[]');
    const isLiked = likedProducts.includes(productId);
    
    if (isLiked) {
        const index = likedProducts.indexOf(productId);
        likedProducts.splice(index, 1);
    } else {
        likedProducts.push(productId);
    }
    
    localStorage.setItem('campusswap_likes', JSON.stringify(likedProducts));
    
    // Update heart icon
    const heartButton = document.querySelector(`[onclick="CampusSwap.toggleLike('${productId}')"]`);
    if (heartButton) {
        heartButton.innerHTML = isLiked ? '🤍' : '❤️';
        heartButton.classList.toggle('liked', !isLiked);
    }
    
    console.log(`❤️ ${isLiked ? 'Unliked' : 'Liked'} product: ${productId}`);
};

CampusSwap.isProductLiked = function(productId) {
    const likedProducts = JSON.parse(localStorage.getItem('campusswap_likes') || '[]');
    return likedProducts.includes(productId);
};

CampusSwap.checkout = async function() {
    console.log('🛒 Starting checkout process...');
    
    if (!this.state.isAuthenticated) {
        alert('Please sign in to checkout');
        return;
    }
    
    if (this.state.cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    // Show checkout modal
    this.showCheckoutModal();
};

CampusSwap.showCheckoutModal = function() {
    const modal = document.createElement('div');
    modal.className = 'cart-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Checkout</h2>
                <button class="modal-close">✕</button>
            </div>
            <div class="checkout-form">
                <h3>Order Summary</h3>
                <div class="order-summary">
                    ${this.state.cart.map(item => {
                        const product = item.product || this.state.products.find(p => p.id === item.productId);
                        if (!product) return '';
                        return `
                            <div class="summary-item">
                                <span>${product.title} x${item.quantity}</span>
                                <span>$${(product.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `;
                    }).join('')}
                    <div class="summary-total">
                        <strong>Total:</strong>
                        <strong>$${this.getCartTotal().toFixed(2)}</strong>
                    </div>
                </div>
                
                <h3>Payment Method</h3>
                <select id="paymentMethod" class="form-input">
                    <option value="CASH">Cash on Pickup</option>
                    <option value="E_TRANSFER">E-Transfer</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                </select>
                
                <h3>Meetup Location</h3>
                <input type="text" id="meetupLocation" class="form-input" 
                       placeholder="e.g., York University Library" />
                
                <h3>Notes (Optional)</h3>
                <textarea id="buyerNotes" class="form-input" rows="3" 
                          placeholder="Any special instructions for the seller..."></textarea>
                
                <button class="btn-primary" onclick="CampusSwap.processCheckout()">
                    Place Order - $${this.getCartTotal().toFixed(2)}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close button handler
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.remove();
    });
};

CampusSwap.processCheckout = async function() {
    const paymentMethod = document.getElementById('paymentMethod').value;
    const meetupLocation = document.getElementById('meetupLocation').value;
    const buyerNotes = document.getElementById('buyerNotes').value;
    
    if (!meetupLocation) {
        alert('Please enter a meetup location');
        return;
    }
    
    try {
        const response = await fetch(`${this.config.apiBaseUrl}/orders/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: JSON.stringify({
                paymentMethod,
                meetupLocation,
                buyerNotes
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Close checkout modal
            document.querySelector('.cart-modal')?.remove();
            
            // Show success message
            alert(`✅ Order placed successfully!\n\nOrder Total: $${data.data.totalAmount.toFixed(2)}\nCheck your purchase history for details.`);
            
            // Reload cart and products
            await this.loadCartFromAPI();
            await this.loadProductsFromAPI();
            
            console.log('✅ Checkout completed successfully');
        } else {
            alert(data.message || 'Checkout failed');
        }
    } catch (error) {
        console.error('❌ Error during checkout:', error);
        alert('Checkout failed. Please try again.');
    }
};

// ============================================
// MY LISTINGS - User's Posted Products
// ============================================

/**
 * TEACHING: Show "My Listings" modal
 * Displays all products posted by the current user
 * Allows editing and deleting own products
 */
CampusSwap.showMyListings = async function() {
    // TEACHING: Check authentication first
    const token = localStorage.getItem(this.config.tokenKey);
    if (!token) {
        alert('Please log in to view your listings');
        return this.showLoginModal();
    }
    
    // TEACHING: Filter products to only show user's listings
    // We'll fetch from API endpoint /api/products/my-listings
    try {
        const response = await this.apiFetch('/products/my-listings');
        const myProducts = response.data || [];
        
        // Create modal
        this.closeAnyModal();
        const modal = document.createElement('div');
        modal.className = 'form-modal';
        modal.innerHTML = this.generateMyListingsHTML(myProducts);
        document.body.appendChild(modal);
        
        // Close handlers
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        
    } catch (err) {
        console.error('Failed to load listings:', err);
        alert('Could not load your listings. Please try again.');
    }
};

/**
 * TEACHING: Generate HTML for My Listings modal
 */
CampusSwap.generateMyListingsHTML = function(products) {
    if (products.length === 0) {
        return `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>My Listings</h2>
                    <button class="modal-close">✕</button>
                </div>
                <div class="empty-state">
                    <div class="empty-icon">📦</div>
                    <h3>No listings yet</h3>
                    <p>You haven't posted any items for sale.</p>
                    <button class="btn-primary" onclick="CampusSwap.closeAnyModal(); CampusSwap.showSellItemModal();">
                        Post Your First Item
                    </button>
                </div>
            </div>
        `;
    }
    
    const productCards = products.map(p => {
        const categoryEmojis = {
            'textbooks': '📖',
            'electronics': '💻',
            'lab-equipment': '⚗️',
            'stationery': '📐'
        };
        const categorySlug = p.category?.slug || (typeof p.category === 'string' ? p.category.toLowerCase() : null);
        const emoji = categoryEmojis[categorySlug] || '📦';
        
        return `
            <div class="my-listing-card">
                <div class="listing-image">${p.imageUrl || emoji}</div>
                <div class="listing-info">
                    <h4>${p.title}</h4>
                    <p>${p.courseCode || 'General'} • ${p.condition}</p>
                    <strong>$${parseFloat(p.price).toFixed(2)}</strong>
                </div>
                <div class="listing-actions">
                    <button class="btn-secondary btn-sm" onclick="CampusSwap.editProduct('${p.id}')">
                        ✏️ Edit
                    </button>
                    <button class="btn-danger btn-sm" onclick="CampusSwap.deleteProduct('${p.id}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    return `
        <div class="modal-content">
            <div class="modal-header">
                <h2>My Listings (${products.length})</h2>
                <button class="modal-close">✕</button>
            </div>
            <div class="my-listings-container">
                ${productCards}
            </div>
            <div class="modal-footer">
                <button class="btn-primary" onclick="CampusSwap.closeAnyModal(); CampusSwap.showSellItemModal();">
                    + Post New Item
                </button>
            </div>
        </div>
    `;
};

/**
 * TEACHING: Edit product
 * Shows a modal pre-filled with product data, allows user to update it
 */
CampusSwap.editProduct = async function(productId) {
    console.log('✏️ Edit product:', productId);
    
    try {
        // TEACHING: Fetch the product details from backend
        const response = await this.apiFetch(`/products/${productId}`);
        const product = response.data;
        
        // Close any existing modals
        this.closeAnyModal();
        
        // TEACHING: Create edit modal with pre-filled data
        const modal = document.createElement('div');
        modal.className = 'form-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Item</h3>
                    <button class="modal-close">✕</button>
                </div>
                <div class="modal-body">
                    <label>Title</label>
                    <input type="text" id="edit-title" value="${product.title}" />
                    
                    <label>Price (CAD)</label>
                    <input type="number" id="edit-price" min="0" step="0.01" value="${product.price}" />
                    
                    <label>Category</label>
                    <select id="edit-category">
                        <option value="textbooks" ${product.category?.slug === 'textbooks' ? 'selected' : ''}>Textbooks</option>
                        <option value="electronics" ${product.category?.slug === 'electronics' ? 'selected' : ''}>Electronics</option>
                        <option value="lab-equipment" ${product.category?.slug === 'lab-equipment' ? 'selected' : ''}>Lab Equipment</option>
                        <option value="stationery" ${product.category?.slug === 'stationery' ? 'selected' : ''}>Stationery</option>
                    </select>
                    
                    <label>Course Code</label>
                    <input type="text" id="edit-course" value="${product.courseCode || ''}" placeholder="MATH 1013" />
                    
                    <label>Condition</label>
                    <select id="edit-condition">
                        <option value="LIKE_NEW" ${product.condition === 'LIKE_NEW' ? 'selected' : ''}>LIKE_NEW</option>
                        <option value="EXCELLENT" ${product.condition === 'EXCELLENT' ? 'selected' : ''}>EXCELLENT</option>
                        <option value="GOOD" ${product.condition === 'GOOD' ? 'selected' : ''}>GOOD</option>
                        <option value="FAIR" ${product.condition === 'FAIR' ? 'selected' : ''}>FAIR</option>
                    </select>
                    
                    <label>Description</label>
                    <textarea id="edit-desc" rows="3">${product.description}</textarea>
                    
                    <label>Emoji/Image</label>
                    <input type="text" id="edit-image" value="${product.imageUrl || ''}" placeholder="📖 or image URL" />
                    
                    <button class="btn-primary" id="edit-submit">Save Changes</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close handlers
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        
        // TEACHING: Submit handler - sends PUT request to update product
        modal.querySelector('#edit-submit').addEventListener('click', async () => {
            const categorySlug = modal.querySelector('#edit-category').value;
            
            // Map slug to categoryId
            const category = this.state.categories.find(c => c.slug === categorySlug);
            if (!category) {
                alert('Category not found. Please refresh and try again.');
                return;
            }
            
            const updatedData = {
                title: modal.querySelector('#edit-title').value.trim(),
                price: parseFloat(modal.querySelector('#edit-price').value || '0'),
                description: modal.querySelector('#edit-desc').value.trim(),
                courseCode: modal.querySelector('#edit-course').value.trim(),
                condition: modal.querySelector('#edit-condition').value,
                imageUrl: modal.querySelector('#edit-image').value.trim() || product.imageUrl,
                categoryId: category.id
            };
            
            try {
                // TEACHING: PUT request to /api/products/:id
                await this.apiFetch(`/products/${productId}`, {
                    method: 'PUT',
                    body: JSON.stringify(updatedData)
                });
                
                alert('Product updated successfully!');
                modal.remove();
                
                // TEACHING: Refresh product list and My Listings modal
                await this.loadProductsFromAPI();
                await this.showMyListings(); // Reload My Listings
                
            } catch (err) {
                alert('Failed to update product: ' + err.message);
            }
        });
        
    } catch (err) {
        console.error('Failed to fetch product for editing:', err);
        alert('Could not load product details. Please try again.');
    }
};

/**
 * TEACHING: Delete product
 * Confirms with user, then sends DELETE request to backend
 */
CampusSwap.deleteProduct = async function(productId) {
    console.log('🗑️ Delete product:', productId);
    
    // TEACHING: Always confirm destructive actions
    const confirmed = confirm('Are you sure you want to delete this listing? This action cannot be undone.');
    if (!confirmed) return;
    
    try {
        // TEACHING: DELETE request to /api/products/:id
        await this.apiFetch(`/products/${productId}`, {
            method: 'DELETE'
        });
        
        alert('Product deleted successfully!');
        
        // TEACHING: Refresh product list and My Listings modal
        await this.loadProductsFromAPI();
        await this.showMyListings(); // Reload My Listings
        
    } catch (err) {
        console.error('Failed to delete product:', err);
        alert('Could not delete product: ' + err.message);
    }
};

// ============================================
// PURCHASE HISTORY - User's Past Orders
// ============================================

CampusSwap.showPurchaseHistory = async function() {
    const token = localStorage.getItem(this.config.tokenKey);
    if (!token) {
        alert('Please log in to view your purchase history');
        return this.showLoginModal();
    }
    
    try {
        const response = await fetch(`${this.config.apiBaseUrl}/orders/purchases`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch purchase history');
        }
        
        const orders = data.data || [];
        
        // Create modal
        this.closeAnyModal();
        const modal = document.createElement('div');
        modal.className = 'form-modal';
        modal.innerHTML = this.generatePurchaseHistoryHTML(orders);
        document.body.appendChild(modal);
        
        // Close handlers
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
    } catch (err) {
        console.error('Failed to load purchase history:', err);
        alert('Could not load purchase history: ' + err.message);
    }
};

CampusSwap.generatePurchaseHistoryHTML = function(orders) {
    if (orders.length === 0) {
        return `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>My Purchase History</h3>
                    <button class="modal-close">✕</button>
                </div>
                <div class="modal-body">
                    <div class="empty-state">
                        <div class="empty-icon">📦</div>
                        <h3>No purchases yet</h3>
                        <p>Start shopping to see your order history here!</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    const ordersHTML = orders.map(order => {
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const statusColors = {
            'PENDING': 'orange',
            'PROCESSING': 'blue',
            'COMPLETED': 'green',
            'CANCELLED': 'red'
        };
        
        const statusColor = statusColors[order.status] || 'gray';
        
        const itemsHTML = order.orderItems.map(item => `
            <div class="order-item">
                <span class="item-name">${item.product.title}</span>
                <span class="item-quantity">x${item.quantity}</span>
                <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');
        
        return `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <strong>Order #${order.orderNumber}</strong>
                        <span class="order-date">${orderDate}</span>
                    </div>
                    <span class="order-status" style="background-color: ${statusColor};">
                        ${order.status}
                    </span>
                </div>
                <div class="order-items">
                    ${itemsHTML}
                </div>
                <div class="order-footer">
                    <div class="order-seller">
                        <strong>Seller:</strong> ${order.seller.firstName} ${order.seller.lastName}
                    </div>
                    ${order.meetupLocation ? `
                        <div class="order-meetup">
                            <strong>Meetup:</strong> ${order.meetupLocation}
                        </div>
                    ` : ''}
                    <div class="order-total">
                        <strong>Total:</strong> $${order.totalAmount.toFixed(2)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    return `
        <div class="modal-content">
            <div class="modal-header">
                <h3>My Purchase History</h3>
                <button class="modal-close">✕</button>
            </div>
            <div class="modal-body">
                <div class="orders-list">
                    ${ordersHTML}
                </div>
            </div>
        </div>
    `;
};

// ============================================
// ADMIN DASHBOARD
// ============================================

CampusSwap.showAdminDashboard = async function() {
    if (!this.state.user?.isAdmin) {
        alert('Admin access required');
        return;
    }
    
    try {
        // Fetch dashboard data
        const response = await fetch(`${this.config.apiBaseUrl}/admin/dashboard`, {
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to load dashboard');
        }
        
        // Create modal
        this.closeAnyModal();
        const modal = document.createElement('div');
        modal.className = 'admin-modal';
        modal.innerHTML = this.generateAdminDashboardHTML(data.data);
        document.body.appendChild(modal);
        
        // Close handlers
        modal.querySelector('.modal-close')?.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        // Initialize charts
        this.initAdminCharts();
        
        // Tab switching
        const tabs = modal.querySelectorAll('.admin-tab');
        const panels = modal.querySelectorAll('.admin-panel');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                
                tab.classList.add('active');
                modal.querySelector(`#${target}`)?.classList.add('active');
                
                // Load tab-specific data
                if (target === 'sales') this.loadSalesReport();
                if (target === 'inventory') this.loadInventory();
                if (target === 'users') this.loadUsers();
            });
        });
        
    } catch (error) {
        console.error('❌ Admin dashboard error:', error);
        alert('Failed to load admin dashboard');
    }
};

CampusSwap.generateAdminDashboardHTML = function(data) {
    const { stats, recentOrders, topProducts } = data;
    
    return `
        <div class="modal-content admin-content">
            <div class="modal-header">
                <h2>🛡️ Admin Dashboard</h2>
                <button class="modal-close">✕</button>
            </div>
            
            <div class="admin-tabs">
                <button class="admin-tab active" data-tab="overview">Overview</button>
                <button class="admin-tab" data-tab="sales">Sales Reports</button>
                <button class="admin-tab" data-tab="inventory">Inventory</button>
                <button class="admin-tab" data-tab="users">Users</button>
            </div>
            
            <div class="admin-body">
                <!-- Overview Panel -->
                <div id="overview" class="admin-panel active">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon">👥</div>
                            <div class="stat-value">${stats.totalUsers}</div>
                            <div class="stat-label">Total Users</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">📦</div>
                            <div class="stat-value">${stats.totalProducts}</div>
                            <div class="stat-label">Products Listed</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">🛒</div>
                            <div class="stat-value">${stats.totalOrders}</div>
                            <div class="stat-label">Total Orders</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">💰</div>
                            <div class="stat-value">$${stats.totalRevenue.toFixed(2)}</div>
                            <div class="stat-label">Total Revenue</div>
                        </div>
                    </div>
                    
                    <div class="admin-section">
                        <h3>Recent Orders</h3>
                        <div class="orders-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Order #</th>
                                        <th>Buyer</th>
                                        <th>Seller</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${recentOrders.map(order => `
                                        <tr>
                                            <td>${order.orderNumber}</td>
                                            <td>${order.buyer.firstName} ${order.buyer.lastName}</td>
                                            <td>${order.seller.firstName} ${order.seller.lastName}</td>
                                            <td>$${order.totalAmount.toFixed(2)}</td>
                                            <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
                                            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <!-- Sales Panel -->
                <div id="sales" class="admin-panel">
                    <div class="admin-section">
                        <div class="section-header">
                            <h3>Sales Report</h3>
                            <div class="date-filters">
                                <input type="date" id="startDate" />
                                <input type="date" id="endDate" />
                                <button class="btn-primary btn-sm" onclick="CampusSwap.loadSalesReport()">Generate</button>
                                <button class="btn-secondary btn-sm" onclick="CampusSwap.exportSalesReport()">Export PDF</button>
                            </div>
                        </div>
                        <canvas id="salesChart" width="400" height="200"></canvas>
                        <div id="salesData"></div>
                    </div>
                </div>
                
                <!-- Inventory Panel -->
                <div id="inventory" class="admin-panel">
                    <div class="admin-section">
                        <h3>Inventory Management</h3>
                        <div id="inventoryData">Loading...</div>
                    </div>
                </div>
                
                <!-- Users Panel -->
                <div id="users" class="admin-panel">
                    <div class="admin-section">
                        <h3>User Management</h3>
                        <div id="usersData">Loading...</div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

CampusSwap.initAdminCharts = function() {
    // Charts will be initialized when Chart.js is loaded
    console.log('📊 Admin charts ready');
};

CampusSwap.loadSalesReport = async function() {
    const startDate = document.getElementById('startDate')?.value;
    const endDate = document.getElementById('endDate')?.value;
    
    try {
        let url = `${this.config.apiBaseUrl}/admin/sales`;
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (params.toString()) url += `?${params.toString()}`;
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${this.getAuthToken()}` }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const salesData = document.getElementById('salesData');
            salesData.innerHTML = `
                <div class="sales-summary">
                    <p><strong>Total Orders:</strong> ${data.data.summary.totalOrders}</p>
                    <p><strong>Total Revenue:</strong> $${data.data.summary.totalRevenue.toFixed(2)}</p>
                    <p><strong>Average Order:</strong> $${data.data.summary.averageOrderValue.toFixed(2)}</p>
                </div>
            `;
            
            // TODO: Draw chart with Chart.js
        }
    } catch (error) {
        console.error('❌ Sales report error:', error);
    }
};

CampusSwap.loadInventory = async function() {
    try {
        const response = await fetch(`${this.config.apiBaseUrl}/admin/inventory`, {
            headers: { 'Authorization': `Bearer ${this.getAuthToken()}` }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const inventoryData = document.getElementById('inventoryData');
            inventoryData.innerHTML = `
                <div class="inventory-stats">
                    <p><strong>Low Stock Items:</strong> ${data.data.stats.lowStockCount}</p>
                    <p><strong>Out of Stock:</strong> ${data.data.stats.outOfStockCount}</p>
                    <p><strong>Total Inventory Value:</strong> $${data.data.stats.totalValue.toFixed(2)}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Seller</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.data.products.map(product => `
                            <tr class="${product.quantity < 5 ? 'low-stock' : ''}">
                                <td>${product.title}</td>
                                <td>${product.seller.firstName} ${product.seller.lastName}</td>
                                <td>${product.quantity}</td>
                                <td>$${product.price.toFixed(2)}</td>
                                <td><span class="status-badge">${product.status}</span></td>
                                <td>
                                    <button class="btn-sm" onclick="CampusSwap.updateInventory('${product.id}', ${product.quantity})">
                                        Update
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    } catch (error) {
        console.error('❌ Inventory error:', error);
    }
};

CampusSwap.loadUsers = async function() {
    try {
        const response = await fetch(`${this.config.apiBaseUrl}/admin/users`, {
            headers: { 'Authorization': `Bearer ${this.getAuthToken()}` }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const usersData = document.getElementById('usersData');
            usersData.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Program</th>
                            <th>Products</th>
                            <th>Purchases</th>
                            <th>Admin</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.data.map(user => `
                            <tr>
                                <td>${user.firstName} ${user.lastName}</td>
                                <td>${user.email}</td>
                                <td>${user.program || 'N/A'}</td>
                                <td>${user._count.products}</td>
                                <td>${user._count.purchases}</td>
                                <td>${user.isAdmin ? '✅' : '❌'}</td>
                                <td>
                                    <button class="btn-sm" onclick="CampusSwap.toggleAdmin('${user.id}', ${user.isAdmin})">
                                        ${user.isAdmin ? 'Revoke' : 'Grant'} Admin
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    } catch (error) {
        console.error('❌ Users error:', error);
    }
};

CampusSwap.updateInventory = async function(productId, currentQty) {
    const newQty = prompt(`Enter new quantity (current: ${currentQty}):`, currentQty);
    if (newQty === null) return;
    
    try {
        const response = await fetch(`${this.config.apiBaseUrl}/admin/products/${productId}/quantity`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: JSON.stringify({ quantity: parseInt(newQty) })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Inventory updated successfully');
            this.loadInventory();
        } else {
            alert(data.message || 'Failed to update inventory');
        }
    } catch (error) {
        console.error('❌ Update inventory error:', error);
        alert('Failed to update inventory');
    }
};

CampusSwap.toggleAdmin = async function(userId, isCurrentlyAdmin) {
    if (!confirm(`${isCurrentlyAdmin ? 'Revoke' : 'Grant'} admin privileges for this user?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${this.config.apiBaseUrl}/admin/users/${userId}/toggle-admin`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(data.message);
            this.loadUsers();
        } else {
            alert(data.message || 'Failed to update admin status');
        }
    } catch (error) {
        console.error('❌ Toggle admin error:', error);
        alert('Failed to update admin status');
    }
};

CampusSwap.exportSalesReport = function() {
    alert('PDF export will be implemented next! For now, use browser Print to PDF (Ctrl+P)');
    window.print();
};

// ============================================
// INITIALIZATION (Moved to top of file)
// ============================================
// Note: The main init() function is now defined at the top near the
// CampusSwap object declaration to ensure proper loading order