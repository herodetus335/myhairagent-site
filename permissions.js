/**
 * Microphone Permission Handler for ElevenLabs Widget
 * Handles iOS Safari + mobile permission issues gracefully
 */

const MicPermissions = (function() {
    // Detect iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOSSafari = isIOS && isSafari;

    // DOM Elements
    let permissionModal = null;
    let fallbackContainer = null;
    let helpLink = null;

    /**
     * Initialize the permission handler
     */
    function init() {
        permissionModal = document.getElementById('permission-modal');
        fallbackContainer = document.getElementById('fallback-container');
        helpLink = document.getElementById('mic-help-link');

        if (helpLink) {
            helpLink.addEventListener('click', (e) => {
                e.preventDefault();
                showPermissionModal('help');
            });
        }

        // Setup modal close buttons
        document.querySelectorAll('[data-action="refresh"]').forEach(btn => {
            btn.addEventListener('click', () => window.location.reload());
        });

        document.querySelectorAll('[data-action="use-text"]').forEach(btn => {
            btn.addEventListener('click', showFallbackInput);
        });

        document.querySelectorAll('[data-action="close-modal"]').forEach(btn => {
            btn.addEventListener('click', hidePermissionModal);
        });

        // Setup fallback form
        const fallbackForm = document.getElementById('fallback-form');
        if (fallbackForm) {
            fallbackForm.addEventListener('submit', handleFallbackSubmit);
        }

        // Close modal on backdrop click
        if (permissionModal) {
            permissionModal.addEventListener('click', (e) => {
                if (e.target === permissionModal) {
                    hidePermissionModal();
                }
            });
        }

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && permissionModal?.classList.contains('active')) {
                hidePermissionModal();
            }
        });
    }

    /**
     * Show the permission modal with appropriate content
     */
    function showPermissionModal(type) {
        if (!permissionModal) return;

        // Hide all content sections first
        permissionModal.querySelectorAll('.modal-content-section').forEach(section => {
            section.style.display = 'none';
        });

        // Show the appropriate section
        const section = permissionModal.querySelector(`[data-error-type="${type}"]`);
        if (section) {
            section.style.display = 'block';
        }

        // Show platform-specific instructions
        const iosInstructions = permissionModal.querySelectorAll('.ios-instructions');
        const desktopInstructions = permissionModal.querySelectorAll('.desktop-instructions');

        iosInstructions.forEach(el => {
            el.style.display = isIOSSafari ? 'block' : 'none';
        });

        desktopInstructions.forEach(el => {
            el.style.display = isIOSSafari ? 'none' : 'block';
        });

        permissionModal.classList.add('active');
        permissionModal.setAttribute('aria-hidden', 'false');

        // Focus first button for accessibility
        const firstButton = permissionModal.querySelector('button');
        if (firstButton) firstButton.focus();
    }

    /**
     * Hide the permission modal
     */
    function hidePermissionModal() {
        if (!permissionModal) return;
        permissionModal.classList.remove('active');
        permissionModal.setAttribute('aria-hidden', 'true');
    }

    /**
     * Show fallback text input
     */
    function showFallbackInput() {
        hidePermissionModal();

        // Hide the widget wrapper
        const widgetWrapper = document.querySelector('.widget-wrapper');
        if (widgetWrapper) widgetWrapper.style.display = 'none';

        if (fallbackContainer) {
            fallbackContainer.style.display = 'block';
            const textarea = fallbackContainer.querySelector('textarea');
            if (textarea) textarea.focus();
        }
    }

    /**
     * Handle fallback form submission
     */
    function handleFallbackSubmit(e) {
        e.preventDefault();

        const textarea = document.getElementById('fallback-message');
        const message = textarea ? textarea.value.trim() : '';

        if (!message) return;

        // Show success state
        const formContent = fallbackContainer.querySelector('.fallback-form-content');
        const successContent = fallbackContainer.querySelector('.fallback-success');

        if (formContent) formContent.style.display = 'none';
        if (successContent) successContent.style.display = 'block';

        console.log('Fallback message:', message);
    }

    // Public API
    return {
        init,
        showPermissionModal,
        hidePermissionModal,
        isIOSSafari
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', MicPermissions.init);
