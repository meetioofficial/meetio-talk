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

// DOM Elements
const guestForm = document.getElementById('guestForm');
const guestSuccessMessage = document.getElementById('guestSuccessMessage');
const guestLoading = document.getElementById('guestLoading');
const guestSubmitBtn = document.getElementById('guestSubmitBtn');
const sponsorForm = document.getElementById('sponsorForm');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('MÉETIO Talk website loaded!');
    
    // Initialize form event listeners
    initializeForms();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
    // Initialize timeline effects
    initializeTimelineEffects();
    
    // Initialize button animations
    initializeButtonEffects();
    
    // Check if Firebase is initialized
    if (!db) {
        console.warn("Firebase not initialized. Forms will not submit data.");
        showFirebaseWarning();
    }
});

// Show warning if Firebase fails to initialize
function showFirebaseWarning() {
    const warning = document.createElement('div');
    warning.style.cssText = `
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid #EF4444;
        color: #FCA5A5;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 20px;
        font-size: 0.9rem;
    `;
    warning.innerHTML = `
        <strong><i class="fas fa-exclamation-triangle"></i> Database Connection Issue</strong>
        <p style="margin-top: 5px;">Form submissions are currently in demo mode. Please check Firebase configuration for full functionality.</p>
    `;
    
    const formsContainer = document.querySelector('.main-grid');
    if (formsContainer) {
        formsContainer.insertBefore(warning, formsContainer.firstChild);
    }
}

// Initialize form event listeners
function initializeForms() {
    // Guest Form Submission
    if (guestForm) {
        guestForm.addEventListener('submit', handleGuestFormSubmit);
        
        // Add validation styling
        const guestInputs = guestForm.querySelectorAll('input, select, textarea');
        guestInputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
    }
    
    // Sponsor Form Submission
    if (sponsorForm) {
        sponsorForm.addEventListener('submit', handleSponsorFormSubmit);
    }
}

// Handle Guest Form Submission
async function handleGuestFormSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm(guestForm)) {
        return;
    }
    
    // Get form values
    const formData = {
        name: document.getElementById('guestName').value.trim(),
        email: document.getElementById('guestEmail').value.trim(),
        whatsapp: document.getElementById('guestWhatsApp').value.trim(),
        major: document.getElementById('guestMajor').value,
        year: document.getElementById('guestYear').value,
        topic: document.getElementById('guestTopic').value.trim(),
        timestamp: new Date().toISOString(),
        status: 'pending',
        type: 'guest'
    };
    
    // Show loading state
    if (guestLoading && guestSubmitBtn) {
        guestLoading.classList.add('show');
        guestSubmitBtn.style.display = 'none';
    }
    
    try {
        // If Firebase is available, save to database
        if (db) {
            await db.collection('guestApplications').add({
                ...formData,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('Guest application saved to Firestore');
        } else {
            // Demo mode - simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('Guest application (demo):', formData);
        }
        
        // Show success message
        if (guestSuccessMessage) {
            guestSuccessMessage.classList.add('show');
        }
        
        // Reset form
        guestForm.reset();
        
        // Hide loading and show button again
        setTimeout(() => {
            if (guestLoading && guestSubmitBtn) {
                guestLoading.classList.remove('show');
                guestSubmitBtn.style.display = 'flex';
            }
            
            // Hide success message after 5 seconds
            if (guestSuccessMessage) {
                setTimeout(() => {
                    guestSuccessMessage.classList.remove('show');
                }, 5000);
            }
        }, 2000);
        
        // Update activity feed (simulated)
        updateActivityFeed(formData.name);
        
    } catch (error) {
        console.error('Error submitting guest application:', error);
        
        // Show error message
        alert('There was an error submitting your application. Please try again.');
        
        // Reset loading state
        if (guestLoading && guestSubmitBtn) {
            guestLoading.classList.remove('show');
            guestSubmitBtn.style.display = 'flex';
        }
    }
}

// Handle Sponsor Form Submission
async function handleSponsorFormSubmit(e) {
    e.preventDefault();
    
    // Get form values
    const formData = {
        company: document.getElementById('sponsorName').value.trim(),
        email: document.getElementById('sponsorEmail').value.trim(),
        interest: document.getElementById('sponsorInterest').value,
        timestamp: new Date().toISOString(),
        status: 'new',
        type: 'sponsor'
    };
    
    // Basic validation
    if (!formData.company || !formData.email || !formData.interest) {
        alert('Please fill in all fields before submitting.');
        return;
    }
    
    // Get submit button
    const submitBtn = sponsorForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    try {
        // If Firebase is available, save to database
        if (db) {
            await db.collection('sponsorInquiries').add({
                ...formData,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('Sponsor inquiry saved to Firestore');
        } else {
            // Demo mode - simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('Sponsor inquiry (demo):', formData);
        }
        
        // Show success message
        alert('Thank you for your interest! We\'ll contact you within 2-3 business days.');
        
        // Reset form
        sponsorForm.reset();
        
    } catch (error) {
        console.error('Error submitting sponsor inquiry:', error);
        alert('There was an error submitting your inquiry. Please try again.');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Form validation functions
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            markFieldAsError(field);
            isValid = false;
        }
    });
    
    if (!isValid) {
        alert('Please fill in all required fields marked with *');
    }
    
    return isValid;
}

function validateField(field) {
    if (field.hasAttribute('required') && !field.value.trim()) {
        markFieldAsError(field);
    } else {
        clearFieldError(field);
    }
}

function markFieldAsError(field) {
    field.style.borderColor = '#EF4444';
    field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.2)';
}

function clearFieldError(field) {
    field.style.borderColor = '';
    field.style.boxShadow = '';
}

// Update activity feed (simulated)
function updateActivityFeed(guestName) {
    const activityItem = document.createElement('div');
    activityItem.className = 'timeline-item';
    activityItem.innerHTML = `
        <div class="timeline-year">Now</div>
        <div class="timeline-content">${guestName} joined the guest waitlist</div>
    `;
    
    const timeline = document.querySelector('.timeline');
    if (timeline) {
        // Add after the timeline title
        const timelineItems = timeline.querySelector('.timeline-item:first-child');
        if (timelineItems) {
            timeline.insertBefore(activityItem, timelineItems.nextSibling);
            
            // Add animation
            activityItem.style.opacity = '0';
            activityItem.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                activityItem.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                activityItem.style.opacity = '1';
                activityItem.style.transform = 'translateX(0)';
            }, 100);
        }
    }
}

// Initialize smooth scrolling
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize timeline effects
function initializeTimelineEffects() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    // Add hover effects
    timelineItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.borderLeftColor = 'var(--accent-neon)';
            const yearElement = this.querySelector('.timeline-year');
            if (yearElement) {
                yearElement.style.color = 'var(--accent-neon)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.borderLeftColor = '';
            const yearElement = this.querySelector('.timeline-year');
            if (yearElement) {
                yearElement.style.color = '';
            }
        });
    });
    
    // Animate timeline items on load
    timelineItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, 300 + (index * 100));
    });
}

// Initialize button effects
function initializeButtonEffects() {
    const buttons = document.querySelectorAll('.btn');
    
    // Add pulsing effect to CTA buttons
    buttons.forEach(btn => {
        setInterval(() => {
            btn.style.boxShadow = '0 0 20px rgba(176, 38, 255, 0.5)';
            setTimeout(() => {
                btn.style.boxShadow = '';
            }, 1000);
        }, 3000);
    });
}

// Add neon glow to logo periodically
setInterval(() => {
    const logo = document.querySelector('.logo i');
    if (logo) {
        logo.style.filter = 'drop-shadow(0 0 12px var(--neon-purple))';
        setTimeout(() => {
            logo.style.filter = 'drop-shadow(0 0 8px var(--neon-purple))';
        }, 500);
    }
}, 4000);

// Initialize Firebase data listener (optional)
function initializeFirebaseListener() {
    if (!db) return;
    
    // Listen for new guest applications (optional - for real-time updates)
    db.collection('guestApplications')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .onSnapshot((snapshot) => {
            console.log(`Total guest applications: ${snapshot.size}`);
        }, (error) => {
            console.error("Error listening to guest applications:", error);
        });
}

// Export functions for testing if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateForm,
        validateField,
        handleGuestFormSubmit,
        handleSponsorFormSubmit
    };
}
