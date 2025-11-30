/**
 * Image Upload Component
 * Handles product image upload with preview
 */

export class ImageUploadComponent {
    constructor(container) {
        this.container = container;
        this.file = null;
        this.preview = null;
    }

    /**
     * Render image upload UI
     */
    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="image-upload-container">
                <label for="image-upload" class="image-upload-label">
                    <div class="upload-placeholder" id="upload-placeholder">
                        <div class="upload-icon">📸</div>
                        <p>Click to upload image</p>
                        <small>JPEG, PNG, GIF, WebP (Max 5MB)</small>
                    </div>
                    <img id="image-preview" class="image-preview" style="display: none;" alt="Preview" />
                </label>
                <input 
                    type="file" 
                    id="image-upload" 
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    style="display: none;"
                />
                <button 
                    type="button" 
                    class="btn-secondary btn-sm remove-image-btn" 
                    id="remove-image-btn"
                    style="display: none; margin-top: 10px;"
                >
                    Remove Image
                </button>
            </div>
        `;

        this.attachEventListeners();
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const fileInput = document.getElementById('image-upload');
        const preview = document.getElementById('image-preview');
        const placeholder = document.getElementById('upload-placeholder');
        const removeBtn = document.getElementById('remove-image-btn');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleFileSelect(file, preview, placeholder, removeBtn);
                }
            });
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                this.clearImage(fileInput, preview, placeholder, removeBtn);
            });
        }
    }

    /**
     * Handle file selection
     */
    handleFileSelect(file, preview, placeholder, removeBtn) {
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Only JPEG, PNG, GIF, and WebP images are allowed');
            return;
        }

        this.file = file;

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
            removeBtn.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    /**
     * Clear selected image
     */
    clearImage(fileInput, preview, placeholder, removeBtn) {
        this.file = null;
        fileInput.value = '';
        preview.src = '';
        preview.style.display = 'none';
        placeholder.style.display = 'flex';
        removeBtn.style.display = 'none';
    }

    /**
     * Get selected file
     */
    getFile() {
        return this.file;
    }

    /**
     * Reset component
     */
    reset() {
        this.file = null;
        const fileInput = document.getElementById('image-upload');
        const preview = document.getElementById('image-preview');
        const placeholder = document.getElementById('upload-placeholder');
        const removeBtn = document.getElementById('remove-image-btn');

        if (fileInput) this.clearImage(fileInput, preview, placeholder, removeBtn);
    }
}
