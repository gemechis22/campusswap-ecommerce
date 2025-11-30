/**
 * API Service
 * Handles all HTTP communication with the backend
 * Centralizes API calls following Single Responsibility Principle
 */

import { config } from '../config.js';

class APIService {
    constructor() {
        this.baseUrl = config.apiBaseUrl;
        this.tokenKey = config.tokenKey;
    }

    /**
     * Generic fetch wrapper with authentication
     */
    async fetch(path, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        const token = localStorage.getItem(this.tokenKey);
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseUrl}${path}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`API ${response.status}: ${text}`);
        }

        return response.json();
    }

    // Product APIs
    async getProducts(sortBy = '', sortOrder = '') {
        let url = '/products';
        const params = new URLSearchParams();
        
        if (sortBy) params.append('sortBy', sortBy);
        if (sortOrder) params.append('sortOrder', sortOrder);
        
        if (params.toString()) url += `?${params.toString()}`;
        
        return this.fetch(url);
    }

    async createProduct(productData) {
        return this.fetch('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    async updateProduct(productId, productData) {
        return this.fetch(`/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    }

    async deleteProduct(productId) {
        return this.fetch(`/products/${productId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Upload product image
     */
    async uploadProductImage(file) {
        const formData = new FormData();
        formData.append('image', file);

        const token = localStorage.getItem(this.tokenKey);
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseUrl}/products/upload`, {
            method: 'POST',
            headers: headers,
            body: formData
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`API ${response.status}: ${text}`);
        }

        return response.json();
    }

    // Cart APIs
    async getCart() {
        return this.fetch('/cart');
    }

    async addToCart(productId, quantity = 1) {
        return this.fetch('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
        });
    }

    async updateCartItem(productId, quantity) {
        return this.fetch('/cart/update', {
            method: 'PUT',
            body: JSON.stringify({ productId, quantity })
        });
    }

    async removeFromCart(productId) {
        return this.fetch('/cart/remove', {
            method: 'DELETE',
            body: JSON.stringify({ productId })
        });
    }

    async clearCart() {
        return this.fetch('/cart/clear', {
            method: 'DELETE'
        });
    }

    // Order APIs
    async createOrder(orderData) {
        return this.fetch('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async getOrders() {
        return this.fetch('/orders');
    }

    // Auth APIs
    async login(email, password) {
        return this.fetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async register(userData) {
        return this.fetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async getCurrentUser() {
        return this.fetch('/auth/me');
    }

    // Admin APIs
    async getAdminDashboard() {
        return this.fetch('/admin/dashboard');
    }

    async getSalesReport(startDate, endDate) {
        let url = '/admin/sales';
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (params.toString()) url += `?${params.toString()}`;
        
        return this.fetch(url);
    }

    async getInventory() {
        return this.fetch('/admin/inventory');
    }

    async updateProductQuantity(productId, quantity) {
        return this.fetch(`/admin/products/${productId}/quantity`, {
            method: 'PUT',
            body: JSON.stringify({ quantity })
        });
    }

    async getUsers() {
        return this.fetch('/admin/users');
    }

    async toggleAdminStatus(userId) {
        return this.fetch(`/admin/users/${userId}/toggle-admin`, {
            method: 'PUT'
        });
    }
}

export default new APIService();
