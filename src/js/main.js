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
        debug: true
    },

    // Application state
    state: {
        currentCategory: 'all',
        searchTerm: '',
        cart: [],
        products: [], // Will be populated with sample data
        user: null,
        isMobile: window.innerWidth <= 768
    },

    // Initialize the application
    init() {
        console.log('🚀 CampusSwap initializing...');
        
        // Load initial data
        this.loadSampleProducts();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize components
        this.setupMobileNavigation();
        this.setupSearch();
        this.setupCategoryFilters();
        this.setupShoppingCart();
        
        // Load user cart from localStorage
        this.loadCartFromStorage();
        
        console.log('✅ CampusSwap ready!');
    }
};

// ============================================
// SAMPLE DATA (Later: API calls)
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
// PRODUCT FILTERING & DISPLAY
// ============================================

CampusSwap.getFilteredProducts = function() {
    return this.state.products.filter(product => {
        // Category filter
        const categoryMatch = this.state.currentCategory === 'all' || 
                            product.category === this.state.currentCategory;
        
        // Search filter
        const searchMatch = !this.state.searchTerm || 
                          product.title.toLowerCase().includes(this.state.searchTerm) ||
                          product.course.toLowerCase().includes(this.state.searchTerm) ||
                          product.category.toLowerCase().includes(this.state.searchTerm);
        
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
        
        return `
            <article class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <div class="image-placeholder">${product.image}</div>
                    <button class="quick-add-btn" onclick="CampusSwap.addToCart('${product.id}')">
                        + Add to Cart
                    </button>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-course">${product.course} • ${product.condition} Condition</p>
                    <div class="product-price">$${product.price}</div>
                    <div class="product-seller">
                        <span class="seller-name">@${product.seller}</span>
                        <span class="seller-rating">⭐ ${product.rating}</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn-secondary btn-sm" onclick="CampusSwap.viewProduct('${product.id}')">
                            View Details
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

CampusSwap.addToCart = function(productId) {
    const product = this.state.products.find(p => p.id === productId);
    if (!product) return;
    
    // Check if item already in cart
    const existingItem = this.state.cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        this.state.cart.push({
            productId: productId,
            quantity: 1,
            dateAdded: new Date().toISOString()
        });
    }
    
    this.updateCartDisplay();
    this.saveCartToStorage();
    this.showCartNotification(product.title);
    
    console.log(`🛒 Added ${product.title} to cart`);
};

CampusSwap.removeFromCart = function(productId) {
    this.state.cart = this.state.cart.filter(item => item.productId !== productId);
    this.updateCartDisplay();
    this.saveCartToStorage();
};

CampusSwap.updateCartQuantity = function(productId, newQuantity) {
    if (newQuantity <= 0) {
        this.removeFromCart(productId);
        return;
    }
    
    const item = this.state.cart.find(item => item.productId === productId);
    if (item) {
        item.quantity = newQuantity;
        this.updateCartDisplay();
        this.saveCartToStorage();
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
        const product = this.state.products.find(p => p.id === item.productId);
        return total + (product ? product.price * item.quantity : 0);
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
        const product = this.state.products.find(p => p.id === item.productId);
        if (!product) return '';
        
        return `
            <div class="cart-item">
                <div class="cart-item-image">${product.image}</div>
                <div class="cart-item-info">
                    <h4>${product.title}</h4>
                    <p>${product.course}</p>
                    <span class="cart-item-price">$${product.price}</span>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" data-action="decrease" data-product-id="${item.productId}">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" data-action="increase" data-product-id="${item.productId}">+</button>
                </div>
                <div class="cart-item-total">$${(product.price * item.quantity).toFixed(2)}</div>
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
// LOCAL STORAGE FUNCTIONALITY
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
    
    // For now, show alert - in Phase 3 this will be a proper modal
    alert(`${product.title}\n\nCourse: ${product.course}\nCondition: ${product.condition}\nPrice: $${product.price}\n\nDescription: ${product.description}\n\nSeller: @${product.seller} (⭐ ${product.rating})`);
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

CampusSwap.checkout = function() {
    console.log('🛒 Starting checkout process...');
    alert(`Checkout functionality will be implemented in Phase 3!\n\nYour cart total: $${this.getCartTotal().toFixed(2)}\nItems: ${this.state.cart.length}`);
};

// ============================================
// INITIALIZATION
// ============================================

CampusSwap.init = function() {
    console.log('🚀 CampusSwap initializing...');
    
    // Load saved data from localStorage
    this.loadCartFromStorage();
    
    // Initialize features
    this.setupMobileNavigation();
    this.setupSearch();
    this.setupCategoryFilters();
    this.setupShoppingCart();
    
    // Initial render
    this.renderProducts(this.state.products);
    
    console.log('✅ CampusSwap ready!');
};