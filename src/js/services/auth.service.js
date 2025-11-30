/**
 * Authentication Service
 * Manages user authentication state and token storage
 */

import { config } from '../config.js';
import apiService from './api.service.js';

class AuthService {
    constructor() {
        this.tokenKey = config.tokenKey;
        this.currentUser = null;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!localStorage.getItem(this.tokenKey);
    }

    /**
     * Get stored auth token
     */
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * Store auth token
     */
    setToken(token) {
        localStorage.setItem(this.tokenKey, token);
    }

    /**
     * Remove auth token
     */
    removeToken() {
        localStorage.removeItem(this.tokenKey);
    }

    /**
     * Login user
     */
    async login(email, password) {
        const response = await apiService.login(email, password);
        
        if (response.data && response.data.token) {
            this.setToken(response.data.token);
            this.currentUser = response.data.user;
        }
        
        return response;
    }

    /**
     * Register new user
     */
    async register(userData) {
        const response = await apiService.register(userData);
        
        if (response.data && response.data.token) {
            this.setToken(response.data.token);
            this.currentUser = response.data.user;
        }
        
        return response;
    }

    /**
     * Logout user
     */
    logout() {
        this.removeToken();
        this.currentUser = null;
    }

    /**
     * Get current user info
     */
    async getCurrentUser() {
        if (!this.isAuthenticated()) {
            return null;
        }

        try {
            const response = await apiService.getCurrentUser();
            this.currentUser = response.data;
            return this.currentUser;
        } catch (error) {
            // Token invalid or expired
            this.logout();
            return null;
        }
    }

    /**
     * Check if current user is admin
     */
    isAdmin() {
        return this.currentUser?.isAdmin || false;
    }
}

export default new AuthService();
