/**
 * Helper Utilities
 * Reusable utility functions
 */

import { categoryEmojis } from '../config.js';

/**
 * Format currency
 */
export function formatCurrency(amount) {
    return `$${parseFloat(amount).toFixed(2)}`;
}

/**
 * Format date
 */
export function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

/**
 * Get category emoji
 */
export function getCategoryEmoji(category) {
    const slug = category?.slug || (typeof category === 'string' ? category.toLowerCase() : null);
    return categoryEmojis[slug] || categoryEmojis.default;
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Show notification
 */
export function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">✕</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

/**
 * Validate email
 */
export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate password
 */
export function isValidPassword(password) {
    return password.length >= 8;
}
