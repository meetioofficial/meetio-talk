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
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization error:", error);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('MEETIO Talk website initialized');
    
    // Initialize all components
    initNavigation();
    initModal();
    initForm();
    initAnimations();
    
    // Initialize Firebase listener if available
    if (db) {
        initFirebaseListeners();
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
function initModal() {
    const modal = document.getElementById('applicationModal');
    const modalBackdrop = modal.querySelector('.modal-backdrop');
    const modalClose = modal.querySelector('.modal-close');
    const openModalButtons = document.querySelectorAll('.open-modal');
    
    // Open modal
    openModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            openModal(modal);
        });
    });
    
    // Close modal
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closeModal);
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // Close on Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
}

function openModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Add animation
    const container = modal.querySelector('.modal-container');
    container.style.animation = 'none';
    setTimeout(() => {
        container.style.animation = 'modalSlide 0.4s ease-out';
    }, 10);
}

// Form Handling
function initForm() {
    const form = document.getElementById('guestForm');
    const majorSelect = document.getElementById('major');
    const otherMajorGroup = document.getElementById('otherMajorGroup');
    const otherMajorInput = document.getElementById('otherMajor');
    
    if (!form) return;
    
    // Handle "Other" major selection
    if (majorSelect) {
        majorSelect.addEventListener('change', function() {
            if (this.value === 'Other') {
                otherMajorGroup.style.display = 'block';
                otherMajorInput.required = true;
                
                // Animate in
                setTimeout(() => {
                    otherMajorGroup.style.opacity = '1';
                    otherMajorGroup.style.transform = 'translateY(0)';
                }, 10);
            } else {
                otherMajorGroup.style.display = 'none';
                otherMajorInput.required = false;
                otherMajorInput.value = '';
            }
        });
    }
    
    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = getFormData();
        
        // Validate
        if (!validateForm(formData)) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Submit form
        await submitApplication(formData);
    });
    
    // Add floating label effect
    const formInputs = form.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        // Add focus effect
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // Initialize focus state
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });
}

function getFormData() {
    const major = document.getElementById('major').value;
    const otherMajor = document.getElementById('otherMajor').value;
    
    return {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        whatsapp: document.getElementById('whatsapp').value.trim(),
        university: document.getElementById('university').value.trim(),
        major: major === 'Other' ? otherMajor : major,
        year: document.getElementById('year').value,
        topic: document.getElementById('topic').value.trim(),
        bio: document.getElementById('bio').value.trim(),
        timestamp: new Date().toISOString(),
        status: 'pending',
        type: 'guest'
    };
}

function validateForm(data) {
    const required = ['name', 'email', 'whatsapp', 'university', 'major', 'year', 'topic'];
    
    for (const field of required) {
        if (!data[field] || data[field].trim() === '') {
            // Highlight the field
            const input = document.getElementById(field === 'major' ? 'major' : field);
            if (input) {
                input.style.borderColor = '#EF4444';
                input.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                
                // Reset after 2 seconds
                setTimeout(() => {
                    input.style.borderColor = '';
                    input.style.boxShadow = '';
                }, 2000);
            }
            return false;
        }
    }
    
    return true;
}

async function submitApplication(data) {
    const form = document.getElementById('guestForm');
    const submitBtn = form.querySelector('.btn-submit');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;
    
    try {
        // If Firebase is available, save to database
        if (db) {
            await db.collection('guestApplications').add({
                ...data,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Demo mode - simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('Application data:', data);
        }
        
        // Show success
        showNotification('Application submitted successfully!', 'success');
        
        // Close modal
        const modal = document.getElementById('applicationModal');
        const modalClose = modal.querySelector('.modal-close');
        if (modalClose) modalClose.click();
        
        // Reset form
        form.reset();
        
        // Reset "Other" major field
        const otherMajorGroup = document.getElementById('otherMajorGroup');
        if (otherMajorGroup) {
            otherMajorGroup.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error submitting application:', error);
        showNotification('Error submitting application. Please try again.', 'error');
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Animations
function initAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements
    const animatedElements = document.querySelectorAll('.card, .video-card, .timeline-item');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
    
    // Add CSS for animation
    const style = document.createElement('style');
    style.textContent = `
        .card, .video-card, .timeline-item {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .card.animate-in,
        .video-card.animate-in,
        .timeline-item.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .card.animate-in { transition-delay: 0.1s; }
        .video-card.animate-in { transition-delay: 0.2s; }
        .timeline-item.animate-in { transition-delay: 0.3s; }
        
        .form-group.focused label {
            color: var(--neon-purple);
            transform: translateY(-5px);
            font-size: 0.8rem;
        }
        
        .form-group {
            position: relative;
        }
        
        .form-group label {
            transition: all 0.3s ease;
        }
        
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            background: var(--dark-surface);
            border: 1px solid;
            box-shadow: var(--shadow-lg);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            z-index: 3000;
            transform: translateX(150%);
            transition: transform 0.3s ease;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification.success {
            border-color: var(--neon-purple);
            color: var(--neon-purple);
        }
        
        .notification.error {
            border-color: #EF4444;
            color: #EF4444;
        }
        
        .notification i {
            font-size: 1.2rem;
        }
    `;
    document.head.appendChild(style);
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Firebase Listeners
function initFirebaseListeners() {
    if (!db) return;
    
    // Listen for new applications (admin feature)
    db.collection('guestApplications')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .onSnapshot((snapshot) => {
            const count = snapshot.size;
            console.log(`Total applications: ${count}`);
            
            // Update UI if needed
            const applicationCount = document.getElementById('applicationCount');
            if (applicationCount) {
                applicationCount.textContent = count;
            }
        }, (error) => {
            console.error("Error listening to applications:", error);
        });
}

// Sponsor Contact
document.addEventListener('DOMContentLoaded', function() {
    const sponsorContact = document.querySelector('.sponsor-contact');
    if (sponsorContact) {
        const emailLink = sponsorContact.querySelector('a[href^="mailto:"]');
        if (emailLink) {
            emailLink.addEventListener('click', function(e) {
                e.preventDefault();
                const email = this.querySelector('span').textContent;
                navigator.clipboard.writeText(email).then(() => {
                    showNotification('Email copied to clipboard', 'success');
                });
            });
        }
    }
});

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

// Video placeholder hover effect
document.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        const playIcon = this.querySelector('.fa-play');
        if (playIcon) {
            playIcon.style.transform = 'scale(1.2)';
            playIcon.style.opacity = '0.8';
        }
    });
    
    card.addEventListener('mouseleave', function() {
        const playIcon = this.querySelector('.fa-play');
        if (playIcon) {
            playIcon.style.transform = 'scale(1)';
            playIcon.style.opacity = '0.5';
        }
    });
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initForm,
        validateForm,
        submitApplication,
        showNotification
    };
}
