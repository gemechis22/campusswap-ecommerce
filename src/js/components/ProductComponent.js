/**
 * Product Component
 * Handles product display and interaction
 */

import { getCategoryEmoji, formatCurrency } from '../utils/helpers.js';

export class ProductComponent {
    constructor(container) {
        this.container = container;
    }

    /**
     * Render products grid
     */
    renderProducts(products, onAddToCart) {
        if (!this.container) return;

        if (products.length === 0) {
            this.renderEmpty();
            return;
        }

        this.container.innerHTML = products.map(product => 
            this.createProductCard(product, onAddToCart)
        ).join('');
    }

    /**
     * Create single product card HTML
     */
    createProductCard(product, onAddToCart) {
        const emoji = getCategoryEmoji(product.category);
        const price = formatCurrency(product.price);
        const sellerName = product.seller?.firstName && product.seller?.lastName 
            ? `${product.seller.firstName} ${product.seller.lastName}`
            : 'User';

        return `
            <article class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    ${product.imageUrl 
                        ? `<img src="${product.imageUrl}" alt="${product.title}" />` 
                        : `<div class="image-placeholder">${emoji}</div>`
                    }
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-description">${product.description || product.courseCode || 'No description'}</p>
                    <div class="product-price">${price}</div>
                    <div class="product-meta">
                        <span class="product-condition">${product.condition || 'Good'}</span>
                        <span class="product-stock">${product.quantity > 0 ? `${product.quantity} available` : 'Out of stock'}</span>
                    </div>
                    <div class="product-seller">
                        <span>👤 ${sellerName}</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn-primary add-to-cart-btn" data-product-id="${product.id}" ${product.quantity === 0 ? 'disabled' : ''}>
                            🛒 Add to Cart
                        </button>
                        <button class="btn-secondary view-details-btn" data-product-id="${product.id}">
                            👁️ Details
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    /**
     * Render empty state
     */
    renderEmpty() {
        this.container.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your search or browse different categories.</p>
            </div>
        `;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners(onAddToCart, onViewDetails) {
        this.container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = btn.dataset.productId;
                onAddToCart(productId);
            });
        });
        
        this.container.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = btn.dataset.productId;
                if (onViewDetails) onViewDetails(productId);
            });
        });
    }
}
