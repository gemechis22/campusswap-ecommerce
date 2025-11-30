/**
 * Cart Component
 * Handles cart display and interactions
 */

import { getCategoryEmoji, formatCurrency } from '../utils/helpers.js';

export class CartComponent {
    constructor() {
        this.modal = null;
    }

    /**
     * Show cart modal
     */
    showModal(cart, onUpdateQuantity, onCheckout) {
        this.closeModal();

        this.modal = document.createElement('div');
        this.modal.className = 'cart-modal';
        this.modal.innerHTML = this.generateModalHTML(cart);

        document.body.appendChild(this.modal);

        this.attachEventListeners(cart, onUpdateQuantity, onCheckout);
    }

    /**
     * Generate cart modal HTML
     */
    generateModalHTML(cart) {
        if (cart.length === 0) {
            return this.generateEmptyCartHTML();
        }

        const total = this.calculateTotal(cart);
        const items = cart.map(item => this.generateCartItemHTML(item)).join('');

        return `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Your Cart (${cart.length} items)</h2>
                    <button class="modal-close">✕</button>
                </div>
                <div class="cart-items">
                    ${items}
                </div>
                <div class="cart-footer">
                    <div class="cart-total">
                        <strong>Total: ${formatCurrency(total)}</strong>
                    </div>
                    <button class="btn-primary btn-checkout">
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Generate cart item HTML
     */
    generateCartItemHTML(item) {
        const product = item.product;
        if (!product) return '';

        const emoji = getCategoryEmoji(product.category);
        const price = formatCurrency(product.price);
        const total = formatCurrency(product.price * item.quantity);

        return `
            <div class="cart-item">
                <div class="cart-item-image">${product.imageUrl || emoji}</div>
                <div class="cart-item-info">
                    <h4>${product.title}</h4>
                    <p>${product.courseCode || 'General'}</p>
                    <span class="cart-item-price">${price}</span>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" data-action="decrease" data-product-id="${item.productId}">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" data-action="increase" data-product-id="${item.productId}">+</button>
                </div>
                <div class="cart-item-total">${total}</div>
            </div>
        `;
    }

    /**
     * Generate empty cart HTML
     */
    generateEmptyCartHTML() {
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

    /**
     * Calculate cart total
     */
    calculateTotal(cart) {
        return cart.reduce((total, item) => {
            const price = parseFloat(item.product?.price || 0);
            return total + (price * item.quantity);
        }, 0);
    }

    /**
     * Attach event listeners
     */
    attachEventListeners(cart, onUpdateQuantity, onCheckout) {
        const closeBtn = this.modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });

        this.modal.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                const action = e.target.dataset.action;
                const item = cart.find(i => i.productId === productId);
                
                if (item) {
                    const newQuantity = action === 'increase' 
                        ? item.quantity + 1 
                        : item.quantity - 1;
                    
                    onUpdateQuantity(productId, newQuantity);
                }
            });
        });

        const checkoutBtn = this.modal.querySelector('.btn-checkout');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', onCheckout);
        }
    }

    /**
     * Close modal
     */
    closeModal() {
        if (this.modal && this.modal.parentElement) {
            this.modal.remove();
            this.modal = null;
        }
    }

    /**
     * Update cart badge
     */
    updateBadge(count) {
        const badge = document.querySelector('.cart-count');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }
}
