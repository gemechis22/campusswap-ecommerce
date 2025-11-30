/**
 * Payment Component
 * Handles payment form UI with Luhn algorithm validation
 */

import { validatePaymentInfo, formatCardNumber, identifyCardType } from '../utils/payment.js';
import { showNotification } from '../utils/helpers.js';

export class PaymentComponent {
    constructor() {
        this.modal = null;
    }

    /**
     * Show payment modal
     */
    showPaymentModal(totalAmount, onPaymentSuccess) {
        this.closeModal();

        this.modal = document.createElement('div');
        this.modal.className = 'form-modal';
        this.modal.innerHTML = this.generatePaymentModalHTML(totalAmount);

        document.body.appendChild(this.modal);

        this.attachEventListeners(totalAmount, onPaymentSuccess);
    }

    /**
     * Generate payment modal HTML
     */
    generatePaymentModalHTML(totalAmount) {
        return `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>💳 Payment Information</h3>
                    <button class="modal-close">✕</button>
                </div>
                <div class="modal-body">
                    <div class="payment-summary">
                        <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
                    </div>
                    
                    <form id="payment-form">
                        <label>Card Number</label>
                        <div class="card-number-container">
                            <input 
                                type="text" 
                                id="card-number" 
                                placeholder="1234 5678 9012 3456" 
                                maxlength="19"
                                autocomplete="cc-number"
                            />
                            <span id="card-type" class="card-type-indicator"></span>
                        </div>
                        <small class="form-help">Enter your 13-19 digit card number</small>
                        
                        <div class="form-row">
                            <div class="form-col">
                                <label>Expiration Month</label>
                                <select id="exp-month" autocomplete="cc-exp-month">
                                    <option value="">MM</option>
                                    ${Array.from({length: 12}, (_, i) => i + 1).map(m => 
                                        `<option value="${m.toString().padStart(2, '0')}">${m.toString().padStart(2, '0')}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            
                            <div class="form-col">
                                <label>Expiration Year</label>
                                <select id="exp-year" autocomplete="cc-exp-year">
                                    <option value="">YY</option>
                                    ${Array.from({length: 15}, (_, i) => new Date().getFullYear() + i).map(y => 
                                        `<option value="${y}">${y}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            
                            <div class="form-col">
                                <label>CVV</label>
                                <input 
                                    type="text" 
                                    id="cvv" 
                                    placeholder="123" 
                                    maxlength="4"
                                    autocomplete="cc-csc"
                                />
                                <small class="form-help">3-4 digits on back</small>
                            </div>
                        </div>
                        
                        <label>Cardholder Name</label>
                        <input 
                            type="text" 
                            id="card-name" 
                            placeholder="John Doe"
                            autocomplete="cc-name"
                        />
                        
                        <div class="payment-test-cards">
                            <small style="color: var(--medium-gray);">
                                <strong>Test Cards:</strong><br>
                                Visa: 4532015112830366<br>
                                Mastercard: 5425233430109903<br>
                                Amex: 374245455400126
                            </small>
                        </div>
                        
                        <button type="submit" class="btn-primary" id="pay-button">
                            Pay $${totalAmount.toFixed(2)}
                        </button>
                    </form>
                </div>
            </div>
        `;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners(totalAmount, onPaymentSuccess) {
        // Close button
        const closeBtn = this.modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => this.closeModal());

        // Click outside to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });

        // Card number formatting and type detection
        const cardNumberInput = this.modal.querySelector('#card-number');
        const cardTypeIndicator = this.modal.querySelector('#card-type');

        cardNumberInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            e.target.value = formatCardNumber(value);
            
            const cardType = identifyCardType(value);
            if (cardType !== 'Unknown' && value.length >= 4) {
                cardTypeIndicator.textContent = cardType;
                cardTypeIndicator.style.display = 'inline';
            } else {
                cardTypeIndicator.style.display = 'none';
            }
        });

        // CVV - only allow numbers
        const cvvInput = this.modal.querySelector('#cvv');
        cvvInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });

        // Form submission
        const form = this.modal.querySelector('#payment-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handlePaymentSubmit(totalAmount, onPaymentSuccess);
        });
    }

    /**
     * Handle payment form submission
     */
    async handlePaymentSubmit(totalAmount, onPaymentSuccess) {
        const cardNumber = this.modal.querySelector('#card-number').value;
        const expMonth = this.modal.querySelector('#exp-month').value;
        const expYear = this.modal.querySelector('#exp-year').value;
        const cvv = this.modal.querySelector('#cvv').value;
        const cardName = this.modal.querySelector('#card-name').value.trim();

        // Validate all fields are filled
        if (!cardNumber || !expMonth || !expYear || !cvv || !cardName) {
            showNotification('Please fill in all payment fields', 'error');
            return;
        }

        // Validate using Luhn algorithm and other checks
        const validation = validatePaymentInfo(cardNumber, cvv, expMonth, expYear);

        if (!validation.isValid) {
            const errorMessage = validation.errors.join(' ');
            showNotification(errorMessage, 'error');
            return;
        }

        // Show processing state
        const submitBtn = this.modal.querySelector('#pay-button');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading"></span> Processing...';

        try {
            // Prepare payment data (masked for security)
            const paymentData = {
                cardType: validation.cardType,
                lastFourDigits: cardNumber.slice(-4),
                cardholderName: cardName,
                amount: totalAmount,
                maskedNumber: validation.maskedNumber
            };

            // Simulate payment processing delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Call success callback
            await onPaymentSuccess(paymentData);

            // Close modal
            this.closeModal();

            showNotification(`Payment successful! ${validation.cardType} ending in ${cardNumber.slice(-4)}`, 'success');
        } catch (error) {
            console.error('Payment error:', error);
            showNotification('Payment processing failed. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
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
}
