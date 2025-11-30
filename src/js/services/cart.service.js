/**
 * Cart Service
 * Manages shopping cart state and operations
 */

import apiService from './api.service.js';
import authService from './auth.service.js';

class CartService {
    constructor() {
        this.cart = [];
    }

    /**
     * Load cart from API
     */
    async loadCart() {
        if (!authService.isAuthenticated()) {
            this.cart = [];
            return [];
        }

        try {
            const response = await apiService.getCart();
            
            if (response.success) {
                this.cart = response.data.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    dateAdded: item.createdAt,
                    product: item.product
                }));
            }
            
            return this.cart;
        } catch (error) {
            console.error('Error loading cart:', error);
            this.cart = [];
            return [];
        }
    }

    /**
     * Add item to cart
     */
    async addItem(productId, quantity = 1) {
        if (!authService.isAuthenticated()) {
            throw new Error('Please login to add items to cart');
        }

        const response = await apiService.addToCart(productId, quantity);
        await this.loadCart();
        return response;
    }

    /**
     * Update cart item quantity
     */
    async updateQuantity(productId, quantity) {
        if (quantity <= 0) {
            return this.removeItem(productId);
        }

        const response = await apiService.updateCartItem(productId, quantity);
        await this.loadCart();
        return response;
    }

    /**
     * Remove item from cart
     */
    async removeItem(productId) {
        const response = await apiService.removeFromCart(productId);
        await this.loadCart();
        return response;
    }

    /**
     * Clear entire cart
     */
    async clearCart() {
        const response = await apiService.clearCart();
        this.cart = [];
        return response;
    }

    /**
     * Get cart total
     */
    getTotal() {
        return this.cart.reduce((total, item) => {
            const price = parseFloat(item.product?.price || 0);
            return total + (price * item.quantity);
        }, 0);
    }

    /**
     * Get cart item count
     */
    getItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    /**
     * Get current cart
     */
    getCart() {
        return this.cart;
    }
}

export default new CartService();
