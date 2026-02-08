// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAMminfEEddBjL-I1ms9zqtUuoNE_eeXx8",
    authDomain: "meetio-dashboard.firebaseapp.com",
    projectId: "meetio-dashboard",
    storageBucket: "meetio-dashboard.firebasestorage.app",
    messagingSenderId: "845443659530",
    appId: "1:845443659530:web:5aa5ad2a59d377b9d96cf3",
    measurementId: "G-9VQR8QPJKH"
};

// Initialize Firebase
let db;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log("✅ Firebase initialized successfully");
} catch (error) {
    console.error("❌ Firebase initialization error:", error);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎙️ MEETIO Talk website loaded');
    
    // Initialize all components
    initNavigation();
    initModals();
    initForms();
    initAnimations();
    
    // Check if Firebase is available
    if (!db) {
        console.log("⚠️ Running in demo mode (Firebase not connected)");
    }
});

// Navigation
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
        
        // Close menu when clicking a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
}

// Modal System
function initModals() {
    const modals = document.querySelectorAll('.modal');
    const openModalButtons = document.querySelectorAll('.open-modal');
    
    // Open modal buttons
    openModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            openModal(modalId);
        });
    });
    
    // Close modals
    modals.forEach(modal => {
        const overlay = modal.querySelector('.modal-overlay');
        const closeBtn = modal.querySelector('.modal-close');
        
        if (overlay) {
            overlay.addEventListener('click', () => closeModal(modal));
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModal(modal));
        }
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                closeModal(modal);
            }
        });
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Focus first input
    setTimeout(() => {
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) firstInput.focus();
    }, 100);
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Form Handling
function initForms() {
    // Guest Form
    const guestForm = document.getElementById('guestForm');
    const guestMajorSelect = document.getElementById('guestMajor');
    const otherMajorContainer = document.getElementById('otherMajorContainer');
    
    if (guestForm) {
        // Show/hide "Other" major field
        if (guestMajorSelect) {
            guestMajorSelect.addEventListener('change', function() {
                if (this.value === 'Other') {
                    otherMajorContainer.style.display = 'block';
                    setTimeout(() => {
                        otherMajorContainer.style.opacity = '1';
                        otherMajorContainer.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    otherMajorContainer.style.display = 'none';
                }
            });
        }
        
        // Form submission
        guestForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await submitGuestForm();
        });
    }
    
    // Sponsor Form
    const sponsorForm = document.getElementById('sponsorForm');
    if (sponsorForm) {
        sponsorForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await submitSponsorForm();
        });
    }
    
    // Add focus effects to form inputs
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });
}

async function submitGuestForm() {
    const form = document.getElementById('guestForm');
    const submitBtn = form.querySelector('.btn-submit');
    const originalText = submitBtn.innerHTML;
    
    // Get form data
    const major = document.getElementById('guestMajor').value;
    const otherMajor = document.getElementById('otherMajor').value;
    
    const formData = {
        name: document.getElementById('guestName').value.trim(),
        email: document.getElementById('guestEmail').value.trim(),
        whatsapp: document.getElementById('guestWhatsapp').value.trim(),
        major: major === 'Other' ? otherMajor : major,
        topic: document.getElementById('guestTopic').value.trim(),
        bio: document.getElementById('guestBio').value.trim(),
        timestamp: new Date().toISOString(),
        status: 'pending',
        type: 'guest'
    };
    
    // Validate
    if (!validateForm(formData, ['name', 'email', 'whatsapp', 'major', 'topic'])) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Show loading
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;
    
    try {
        // Save to Firebase if available
        if (db) {
            await db.collection('guestApplications').add({
                ...formData,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Demo mode
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('Guest Application Data:', formData);
        }
        
        // Success
        showToast('Application submitted successfully!', 'success');
        
        // Close modal
        closeModal(document.getElementById('guestModal'));
        
        // Reset form
        form.reset();
        otherMajorContainer.style.display = 'none';
        
    } catch (error) {
        console.error('Error submitting guest application:', error);
        showToast('Error submitting application. Please try again.', 'error');
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function submitSponsorForm() {
    const form = document.getElementById('sponsorForm');
    const submitBtn = form.querySelector('.btn-submit');
    const originalText = submitBtn.innerHTML;
    
    // Get form data
    const formData = {
        company: document.getElementById('sponsorName').value.trim(),
        email: document.getElementById('sponsorEmail').value.trim(),
        phone: document.getElementById('sponsorPhone').value.trim(),
        type: document.getElementById('sponsorType').value,
        budget: document.getElementById('sponsorBudget').value,
        message: document.getElementById('sponsorMessage').value.trim(),
        timestamp: new Date().toISOString(),
        status: 'new',
        type: 'sponsor'
    };
    
    // Validate
    if (!validateForm(formData, ['company', 'email', 'type', 'budget'])) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Show loading
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    try {
        // Save to Firebase if available
        if (db) {
            await db.collection('sponsorInquiries').add({
                ...formData,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Demo mode
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('Sponsor Inquiry Data:', formData);
        }
        
        // Success
        showToast('Inquiry sent successfully! We\'ll contact you within 24 hours.', 'success');
        
        // Close modal
        closeModal(document.getElementById('sponsorModal'));
        
        // Reset form
        form.reset();
        
    } catch (error) {
        console.error('Error submitting sponsor inquiry:', error);
        showToast('Error sending inquiry. Please try again.', 'error');
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function validateForm(data, requiredFields) {
    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            // Highlight the field
            const input = document.getElementById(field === 'major' ? 'guestMajor' : 
                                field === 'company' ? 'sponsorName' : 
                                field === 'type' ? 'sponsorType' :
                                field === 'budget' ? 'sponsorBudget' : 
                                field);
            if (input) {
                input.style.borderColor = '#EF4444';
                input.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                
                setTimeout(() => {
                    input.style.borderColor = '';
                    input.style.boxShadow = '';
                }, 2000);
                
                // Scroll to error
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return false;
        }
    }
    return true;
}

// Animations
function initAnimations() {
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .card, .video-card, .feature {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .card.animated,
        .video-card.animated,
        .feature.animated {
            opacity: 1;
            transform: translateY(0);
        }
        
        .form-group.focused label {
            color: var(--primary-color);
            transform: translateY(-5px);
            font-size: 0.8rem;
        }
        
        .form-group {
            position: relative;
        }
        
        .form-group label {
            transition: all 0.3s ease;
        }
        
        .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: var(--bg-surface);
            border: 1px solid;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            z-index: 3000;
            transform: translateX(150%);
            transition: transform 0.3s ease;
        }
        
        .toast.show {
            transform: translateX(0);
        }
        
        .toast.success {
            border-color: var(--primary-color);
            color: var(--primary-color);
        }
        
        .toast.error {
            border-color: #EF4444;
            color: #EF4444;
        }
        
        .toast i {
            font-size: 1.2rem;
        }
    `;
    document.head.appendChild(style);
    
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);

    // Observe elements
    document.querySelectorAll('.card, .video-card, .feature').forEach(el => {
        observer.observe(el);
    });
}

// Toast Notification System
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Show
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Hide and remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerHeight = document.querySelector('.nav').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Video hover effects
document.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        const playIcon = this.querySelector('.fa-play');
        if (playIcon) {
            playIcon.style.transform = 'scale(1.2)';
        }
    });
    
    card.addEventListener('mouseleave', function() {
        const playIcon = this.querySelector('.fa-play');
        if (playIcon) {
            playIcon.style.transform = 'scale(1)';
        }
    });
});

// Initialize form fields for "Other" major
document.addEventListener('DOMContentLoaded', function() {
    const otherMajorContainer = document.getElementById('otherMajorContainer');
    if (otherMajorContainer) {
        // Add transition for smooth appearance
        otherMajorContainer.style.transition = 'all 0.3s ease';
        otherMajorContainer.style.opacity = '0';
        otherMajorContainer.style.transform = 'translateY(-10px)';
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateForm,
        submitGuestForm,
        submitSponsorForm,
        showToast
    };
}
