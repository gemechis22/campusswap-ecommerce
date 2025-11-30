/**
 * Auth Component
 * Handles authentication UI (login/register modals)
 */

import { isValidEmail, isValidPassword, showNotification } from '../utils/helpers.js';

export class AuthComponent {
    constructor() {
        this.modal = null;
    }

    /**
     * Show login modal
     */
    showLoginModal(onLogin) {
        this.closeModal();

        this.modal = document.createElement('div');
        this.modal.className = 'form-modal';
        this.modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Sign In</h3>
                    <button class="modal-close">✕</button>
                </div>
                <div class="modal-body">
                    <label>Email</label>
                    <input type="email" id="login-email" placeholder="you@yorku.ca" />
                    <label>Password</label>
                    <input type="password" id="login-password" placeholder="••••••••" />
                    <small style="color: var(--medium-gray); margin-top: -8px; display: block;">
                        Min 8 characters
                    </small>
                    <button class="btn-primary" id="login-submit">Sign In</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);
        this.attachLoginListeners(onLogin);
    }

    /**
     * Show register modal
     */
    showRegisterModal(onRegister) {
        this.closeModal();

        this.modal = document.createElement('div');
        this.modal.className = 'form-modal';
        this.modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Sign Up</h3>
                    <button class="modal-close">✕</button>
                </div>
                <div class="modal-body">
                    <label>First Name</label>
                    <input type="text" id="reg-first" />
                    <label>Last Name</label>
                    <input type="text" id="reg-last" />
                    <label>Email</label>
                    <input type="email" id="reg-email" placeholder="you@yorku.ca" />
                    <label>Password</label>
                    <input type="password" id="reg-password" />
                    <small style="color: var(--medium-gray); margin-top: -8px; display: block;">
                        Min 8 characters required
                    </small>
                    <button class="btn-primary" id="reg-submit">Create Account</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);
        this.attachRegisterListeners(onRegister);
    }

    /**
     * Attach login event listeners
     */
    attachLoginListeners(onLogin) {
        const closeBtn = this.modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => this.closeModal());

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });

        const submitBtn = this.modal.querySelector('#login-submit');
        submitBtn.addEventListener('click', async () => {
            const email = this.modal.querySelector('#login-email').value.trim();
            const password = this.modal.querySelector('#login-password').value;

            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email', 'error');
                return;
            }

            if (!isValidPassword(password)) {
                showNotification('Password must be at least 8 characters', 'error');
                return;
            }

            try {
                await onLogin(email, password);
                this.closeModal();
                showNotification('Signed in successfully!', 'success');
                window.location.reload();
            } catch (error) {
                showNotification('Login failed: ' + error.message, 'error');
            }
        });
    }

    /**
     * Attach register event listeners
     */
    attachRegisterListeners(onRegister) {
        const closeBtn = this.modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => this.closeModal());

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });

        const submitBtn = this.modal.querySelector('#reg-submit');
        submitBtn.addEventListener('click', async () => {
            const firstName = this.modal.querySelector('#reg-first').value.trim();
            const lastName = this.modal.querySelector('#reg-last').value.trim();
            const email = this.modal.querySelector('#reg-email').value.trim();
            const password = this.modal.querySelector('#reg-password').value;

            if (!firstName || !lastName) {
                showNotification('Please enter your full name', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email', 'error');
                return;
            }

            if (!isValidPassword(password)) {
                showNotification('Password must be at least 8 characters', 'error');
                return;
            }

            try {
                await onRegister({ firstName, lastName, email, password });
                this.closeModal();
                showNotification('Account created successfully!', 'success');
                window.location.reload();
            } catch (error) {
                showNotification('Registration failed: ' + error.message, 'error');
            }
        });
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
