/**
 * App Controller
 * Main application controller following MVC pattern
 * Coordinates between services and UI components
 */

import authService from './services/auth.service.js';
import cartService from './services/cart.service.js';
import apiService from './services/api.service.js';
import { ProductComponent } from './components/ProductComponent.js';
import { CartComponent } from './components/CartComponent.js';
import { AuthComponent } from './components/AuthComponent.js';
import { AdminComponent } from './components/AdminComponent.js';
import { PaymentComponent } from './components/PaymentComponent.js';
import { showNotification, debounce, getCategoryEmoji, formatCurrency } from './utils/helpers.js';

class AppController {
    constructor() {
        // State
        this.products = [];
        this.currentCategory = 'all';
        this.searchTerm = '';
        this.sortBy = '';
        this.sortOrder = '';

        // Components
        this.productComponent = null;
        this.cartComponent = new CartComponent();
        this.authComponent = new AuthComponent();
        this.adminComponent = new AdminComponent();
        this.paymentComponent = new PaymentComponent();
    }

    /**
     * Initialize application
     */
    async init() {
        console.log('🚀 CampusSwap initializing...');

        // Initialize components
        this.initializeComponents();

        // Setup event listeners
        this.setupEventListeners();

        // Load user if authenticated
        await this.loadUser();

        // Load products
        await this.loadProducts();

        // Load cart if authenticated
        if (authService.isAuthenticated()) {
            await this.loadCart();
        }

        console.log('✅ CampusSwap ready!');
    }

    /**
     * Initialize UI components
     */
    initializeComponents() {
        const productGrid = document.querySelector('.product-grid');
        if (productGrid) {
            this.productComponent = new ProductComponent(productGrid);
        }
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        this.setupSearchListeners();
        this.setupCategoryListeners();
        this.setupSortListeners();
        this.setupCartListeners();
        this.setupAuthListeners();
        this.setupMobileMenu();
    }

    /**
     * Setup mobile menu toggle
     */
    setupMobileMenu() {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const navbarMenu = document.querySelector('.navbar-menu');
        
        if (menuToggle && navbarMenu) {
            menuToggle.addEventListener('click', () => {
                navbarMenu.classList.toggle('active');
                menuToggle.classList.toggle('active');
            });
        }
    }

    /**
     * Setup search listeners
     */
    setupSearchListeners() {
        const searchInput = document.querySelector('.search-input');
        const searchButton = document.querySelector('.search-button');

        if (searchInput) {
            const debouncedSearch = debounce(() => {
                this.searchTerm = searchInput.value.toLowerCase();
                this.filterAndDisplayProducts();
            }, 300);

            searchInput.addEventListener('input', debouncedSearch);
        }

        if (searchButton) {
            searchButton.addEventListener('click', () => {
                this.searchTerm = searchInput.value.toLowerCase();
                this.filterAndDisplayProducts();
            });
        }
    }

    /**
     * Setup category listeners
     */
    setupCategoryListeners() {
        const categoryCards = document.querySelectorAll('.category-card');

        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const categoryText = card.querySelector('h3').textContent.toLowerCase();

                const categoryMap = {
                    'textbooks': 'textbooks',
                    'electronics': 'electronics',
                    'lab equipment': 'lab-equipment',
                    'stationery': 'stationery'
                };

                this.currentCategory = categoryMap[categoryText] || 'all';
                this.searchTerm = '';

                const searchInput = document.querySelector('.search-input');
                if (searchInput) searchInput.value = '';

                this.highlightCategory(card);
                this.filterAndDisplayProducts();
            });
        });
    }

    /**
     * Setup sort listeners
     */
    setupSortListeners() {
        const sortDropdown = document.querySelector('.sort-dropdown');
        const categoryFilter = document.querySelector('.category-filter');

        if (sortDropdown) {
            sortDropdown.addEventListener('change', async (e) => {
                const value = e.target.value;
                if (value) {
                    const [sortBy, sortOrder] = value.split('-');
                    this.sortBy = sortBy;
                    this.sortOrder = sortOrder;
                    await this.loadProducts();
                }
            });
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', async (e) => {
                this.currentCategory = e.target.value;
                await this.loadProducts();
            });
        }
    }

    /**
     * Setup cart listeners
     */
    setupCartListeners() {
        const cartButton = document.querySelector('.cart-button');

        if (cartButton) {
            cartButton.addEventListener('click', () => this.showCart());
        }
    }

    /**
     * Setup auth listeners
     */
    async setupAuthListeners() {
        // Get all auth buttons
        const loginButton = document.querySelector('.login-button');
        const registerButton = document.querySelector('.register-button');
        const logoutButton = document.querySelector('.logout-button');
        const adminButton = document.querySelector('.admin-button');
        
        // Attach click handlers
        if (loginButton) {
            loginButton.addEventListener('click', () => {
                this.authComponent.showLoginModal(async (email, password) => {
                    await authService.login(email, password);
                    await this.updateAuthenticatedUI();
                    await this.loadProducts();
                });
            });
        }
        
        if (registerButton) {
            registerButton.addEventListener('click', () => {
                this.authComponent.showRegisterModal(async (userData) => {
                    await authService.register(userData);
                    await this.updateAuthenticatedUI();
                    await this.loadProducts();
                });
            });
        }
        
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                this.logout();
            });
        }
        
        if (adminButton) {
            adminButton.addEventListener('click', () => {
                this.showAdminDashboard();
            });
        }
        
        // Update UI based on auth state
        if (authService.isAuthenticated()) {
            await this.updateAuthenticatedUI();
        }
    }

    /**
     * Update UI for authenticated users
     */
    async updateAuthenticatedUI() {
        const user = await authService.getCurrentUser();
        if (!user) return;

        // Hide auth buttons, show user menu
        const authButtons = document.querySelector('.auth-buttons');
        const userMenu = document.querySelector('.user-menu');
        const userName = document.querySelector('.user-name');
        const cartButton = document.querySelector('.cart-button');
        const adminButton = document.querySelector('.admin-button');

        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'flex';
            if (userName) userName.textContent = user.firstName;
        }
        if (cartButton) cartButton.style.display = 'flex';
        
        // Show admin button if user is admin
        if (adminButton && user.isAdmin) {
            adminButton.style.display = 'block';
        }
    }

    /**
     * Logout user
     */
    async logout() {
        authService.logout();
        
        // Reset UI
        const authButtons = document.querySelector('.auth-buttons');
        const userMenu = document.querySelector('.user-menu');
        const cartButton = document.querySelector('.cart-button');
        const adminButton = document.querySelector('.admin-button');
        
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
        if (cartButton) cartButton.style.display = 'none';
        if (adminButton) adminButton.style.display = 'none';
        
        showNotification('Logged out successfully', 'success');
        await this.loadProducts();
    }

    /**
     * Load user data
     */
    async loadUser() {
        if (authService.isAuthenticated()) {
            try {
                await authService.getCurrentUser();
            } catch (error) {
                console.error('Failed to load user:', error);
                authService.logout();
            }
        }
    }

    /**
     * Load products from API
     */
    async loadProducts() {
        try {
            const response = await apiService.getProducts(this.sortBy, this.sortOrder);
            this.products = response.data || [];
            this.filterAndDisplayProducts();
        } catch (error) {
            console.error('Error loading products:', error);
            showNotification('Failed to load products', 'error');
        }
    }

    /**
     * Filter and display products
     */
    filterAndDisplayProducts() {
        const filtered = this.getFilteredProducts();
        
        if (this.productComponent) {
            this.productComponent.renderProducts(filtered, (productId) => this.addToCart(productId));
            this.productComponent.attachEventListeners(
                (productId) => this.addToCart(productId),
                (productId) => this.viewProductDetails(productId)
            );
        }

        this.updateSearchResultsTitle(filtered.length);
    }

    /**
     * Get filtered products
     */
    getFilteredProducts() {
        return this.products.filter(product => {
            const productCategory = product.category?.slug || 
                (typeof product.category === 'string' ? product.category : null);
            
            const categoryMatch = this.currentCategory === 'all' || 
                productCategory === this.currentCategory;

            const searchMatch = !this.searchTerm ||
                product.title.toLowerCase().includes(this.searchTerm) ||
                (product.courseCode && product.courseCode.toLowerCase().includes(this.searchTerm)) ||
                (product.courseName && product.courseName.toLowerCase().includes(this.searchTerm));

            return categoryMatch && searchMatch;
        });
    }

    /**
     * Highlight active category
     */
    highlightCategory(activeCard) {
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('category-active');
        });
        activeCard.classList.add('category-active');
    }

    /**
     * Update search results title
     */
    updateSearchResultsTitle(count) {
        const sectionTitle = document.querySelector('.featured-products .section-title');
        if (!sectionTitle) return;

        if (this.searchTerm.trim()) {
            sectionTitle.textContent = `Search Results for "${this.searchTerm}" (${count} found)`;
        } else {
            sectionTitle.textContent = 'Recently Listed';
        }
    }

    /**
     * Load cart
     */
    async loadCart() {
        try {
            await cartService.loadCart();
            this.updateCartDisplay();
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    }

    /**
     * Add item to cart
     */
    async addToCart(productId) {
        if (!authService.isAuthenticated()) {
            showNotification('Please login to add items to cart', 'error');
            return;
        }

        try {
            await cartService.addItem(productId, 1);
            this.updateCartDisplay();
            
            const product = this.products.find(p => p.id === productId);
            showNotification(`Added "${product?.title}" to cart`, 'success');
        } catch (error) {
            console.error('Error adding to cart:', error);
            showNotification('Failed to add item to cart', 'error');
        }
    }

    /**
     * View product details
     */
    viewProductDetails(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const sellerName = product.seller?.firstName && product.seller?.lastName 
            ? `${product.seller.firstName} ${product.seller.lastName}`
            : 'User';

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content product-details-modal">
                <div class="modal-header">
                    <h2>${product.title}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="product-details-grid">
                        <div class="product-image-large">
                            ${product.imageUrl 
                                ? `<img src="${product.imageUrl}\" alt="${product.title}\" />` 
                                : `<div class="image-placeholder-large">${getCategoryEmoji(product.category)}</div>`
                            }
                        </div>
                        <div class="product-info-detailed">
                            <p class="product-description-full">${product.description || 'No description available'}</p>
                            <div class="product-specs">
                                <div class="spec-item">
                                    <strong>Price:</strong>
                                    <span class="price-large">${formatCurrency(product.price)}</span>
                                </div>
                                <div class="spec-item">
                                    <strong>Condition:</strong>
                                    <span>${product.condition || 'Good'}</span>
                                </div>
                                <div class="spec-item">
                                    <strong>Available:</strong>
                                    <span>${product.quantity} units</span>
                                </div>
                                <div class="spec-item">
                                    <strong>Category:</strong>
                                    <span>${product.category || 'General'}</span>
                                </div>
                                ${product.courseCode ? `
                                <div class="spec-item">
                                    <strong>Course:</strong>
                                    <span>${product.courseCode}</span>
                                </div>
                                ` : ''}
                                <div class="spec-item">
                                    <strong>Seller:</strong>
                                    <span>👤 ${sellerName}</span>
                                </div>
                            </div>
                            <button class="btn-primary btn-large" onclick="app.addToCart('${product.id}')" ${product.quantity === 0 ? 'disabled' : ''}>
                                🛒 Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal handlers
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        // Make app accessible for inline onclick
        window.app = this;
    }

    /**
     * Show cart
     */
    async showCart() {
        const cart = cartService.getCart();
        
        this.cartComponent.showModal(
            cart,
            (productId, quantity) => this.updateCartQuantity(productId, quantity),
            () => this.checkout()
        );
    }

    /**
     * Update cart quantity
     */
    async updateCartQuantity(productId, quantity) {
        try {
            await cartService.updateQuantity(productId, quantity);
            this.updateCartDisplay();
            this.showCart(); // Refresh cart modal
        } catch (error) {
            console.error('Error updating cart:', error);
            showNotification('Failed to update quantity', 'error');
        }
    }

    /**
     * Update cart display
     */
    updateCartDisplay() {
        const count = cartService.getItemCount();
        this.cartComponent.updateBadge(count);
    }

    /**
     * Checkout - Show payment modal
     */
    async checkout() {
        const cart = cartService.getCart();
        const total = cartService.getTotal();

        if (cart.length === 0) {
            showNotification('Your cart is empty', 'error');
            return;
        }

        // Show payment modal
        this.paymentComponent.showPaymentModal(total, async (paymentData) => {
            await this.processOrder(paymentData);
        });
    }

    /**
     * Process order after successful payment
     */
    async processOrder(paymentData) {
        try {
            const cart = cartService.getCart();

            // Prepare order data
            const orderData = {
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.product.price
                })),
                totalAmount: cartService.getTotal(),
                paymentMethod: 'CREDIT_CARD',
                paymentDetails: {
                    cardType: paymentData.cardType,
                    lastFourDigits: paymentData.lastFourDigits,
                    cardholderName: paymentData.cardholderName
                }
            };

            // Create order via API
            const response = await apiService.createOrder(orderData);

            if (response.success) {
                // Clear cart after successful order
                await cartService.clearCart();
                this.updateCartDisplay();

                // Close cart modal if open
                this.cartComponent.closeModal();

                showNotification(`Order #${response.data.orderNumber} placed successfully!`, 'success');
            }
        } catch (error) {
            console.error('Error processing order:', error);
            showNotification('Failed to process order. Please try again.', 'error');
        }
    }

    /**
     * Logout
     */
    logout() {
        authService.logout();
        cartService.clearCart();
        window.location.reload();
    }

    /**
     * Show admin dashboard
     */
    async showAdminDashboard() {
        try {
            const dashboardData = await apiService.getAdminDashboard();
            
            if (dashboardData.success) {
                await this.adminComponent.showDashboard(
                    dashboardData.data,
                    () => this.loadAdminSales(),
                    () => this.loadAdminInventory(),
                    () => this.loadAdminUsers()
                );
            }
        } catch (error) {
            console.error('Error loading admin dashboard:', error);
            showNotification('Failed to load admin dashboard', 'error');
        }
    }

    /**
     * Load admin sales report
     */
    async loadAdminSales() {
        try {
            const startDate = document.getElementById('startDate')?.value;
            const endDate = document.getElementById('endDate')?.value;

            const salesData = await apiService.getSalesReport(startDate, endDate);
            
            if (salesData.success) {
                this.adminComponent.renderSalesChart(salesData.data);
            }
        } catch (error) {
            console.error('Error loading sales report:', error);
            showNotification('Failed to load sales report', 'error');
        }
    }

    /**
     * Load admin inventory
     */
    async loadAdminInventory() {
        try {
            const inventoryData = await apiService.getInventory();
            
            if (inventoryData.success) {
                this.adminComponent.renderInventory(inventoryData.data);
                
                // Attach update inventory listeners
                setTimeout(() => this.attachInventoryListeners(), 100);
            }
        } catch (error) {
            console.error('Error loading inventory:', error);
            showNotification('Failed to load inventory', 'error');
        }
    }

    /**
     * Load admin users
     */
    async loadAdminUsers() {
        try {
            const usersData = await apiService.getUsers();
            
            if (usersData.success) {
                this.adminComponent.renderUsers(usersData.data);
                
                // Attach toggle admin listeners
                setTimeout(() => this.attachUserListeners(), 100);
            }
        } catch (error) {
            console.error('Error loading users:', error);
            showNotification('Failed to load users', 'error');
        }
    }

    /**
     * Attach inventory update listeners
     */
    attachInventoryListeners() {
        const updateButtons = document.querySelectorAll('.update-inventory-btn');
        
        updateButtons.forEach(btn => {
            btn.addEventListener('click', async () => {
                const productId = btn.dataset.productId;
                const input = document.querySelector(`input[data-product-id="${productId}"]`);
                const quantity = parseInt(input.value);

                try {
                    await apiService.updateProductQuantity(productId, quantity);
                    showNotification('Inventory updated successfully', 'success');
                    await this.loadAdminInventory();
                } catch (error) {
                    console.error('Error updating inventory:', error);
                    showNotification('Failed to update inventory', 'error');
                }
            });
        });
    }

    /**
     * Attach user management listeners
     */
    attachUserListeners() {
        const toggleButtons = document.querySelectorAll('.toggle-admin-btn');
        
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', async () => {
                const userId = btn.dataset.userId;

                try {
                    await apiService.toggleAdminStatus(userId);
                    showNotification('User role updated successfully', 'success');
                    await this.loadAdminUsers();
                } catch (error) {
                    console.error('Error toggling admin status:', error);
                    showNotification('Failed to update user role', 'error');
                }
            });
        });
    }

    /**
     * Show my listings
     */
    showMyListings() {
        // TODO: Implement my listings
        console.log('My listings');
    }

    /**
     * Show purchases
     */
    showPurchases() {
        // TODO: Implement purchases
        console.log('My purchases');
    }

    /**
     * Show sell modal
     */
    showSellModal() {
        // TODO: Implement sell modal
        console.log('Sell item');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new AppController();
    app.init();
});
