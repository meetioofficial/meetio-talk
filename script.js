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

// DOM Elements
const guestForm = document.getElementById('guestForm');
const guestMajorSelect = document.getElementById('guestMajor');
const otherMajorContainer = document.getElementById('otherMajorContainer');
const otherMajorInput = document.getElementById('otherMajor');
const previewModal = document.getElementById('previewModal');
const previewContent = document.getElementById('previewContent');
const modalClose = document.querySelector('.modal-close');
const editApplicationBtn = document.getElementById('editApplication');
const confirmApplicationBtn = document.getElementById('confirmApplication');
const formProgress = document.getElementById('formProgress');
const progressPercent = document.getElementById('progressPercent');
const guestLoading = document.getElementById('guestLoading');
const guestSuccessMessage = document.getElementById('guestSuccessMessage');
const guestSubmitBtn = document.getElementById('guestSubmitBtn');
const applyAgainBtn = document.getElementById('applyAgain');
const shareApplicationBtn = document.getElementById('shareApplication');
const sponsorForm = document.getElementById('sponsorForm');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

// Application state
let currentStep = 1;
const totalSteps = 3;
let applicationData = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎙️ MEETIO Talk website loaded!');
    
    // Initialize animations and effects
    initAnimations();
    initParticles();
    initFormSteps();
    initEventListeners();
    initCarousel();
    
    // Initialize Firebase if available
    if (!db) {
        showFirebaseWarning();
    }
});

// Initialize animations
function initAnimations() {
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeInUp');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all cards and timeline items
    document.querySelectorAll('.card, .timeline-item').forEach(el => {
        observer.observe(el);
    });

    // Title word animation
    const titleWords = document.querySelectorAll('.title-word');
    titleWords.forEach((word, index) => {
        word.style.animationDelay = `${index * 0.3}s`;
    });
}

// Initialize floating particles
function initParticles() {
    const container = document.querySelector('.particles-container');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random properties
        const size = Math.random() * 4 + 2;
        const posX = Math.random() * 100;
        const delay = Math.random() * 15;
        const duration = Math.random() * 20 + 10;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        
        // Random color
        const colors = ['#B026FF', '#00F7FF', '#FF00FF', '#A855F7'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = color;
        particle.style.boxShadow = `0 0 10px ${color}`;
        
        container.appendChild(particle);
    }
}

// Initialize form step system
function initFormSteps() {
    showStep(1);
    updateProgress();
    
    // Major selection handler for "Other" option
    guestMajorSelect.addEventListener('change', function() {
        if (this.value === 'Other') {
            otherMajorContainer.style.display = 'block';
            otherMajorInput.required = true;
            setTimeout(() => {
                otherMajorContainer.classList.add('show');
            }, 10);
        } else {
            otherMajorContainer.style.display = 'none';
            otherMajorInput.required = false;
            otherMajorContainer.classList.remove('show');
        }
        updateProgress();
    });
    
    // Next step buttons
    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', function() {
            const nextStep = parseInt(this.dataset.next);
            if (validateCurrentStep()) {
                showStep(nextStep);
                updateProgress();
            }
        });
    });
    
    // Previous step buttons
    document.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', function() {
            const prevStep = parseInt(this.dataset.prev);
            showStep(prevStep);
            updateProgress();
        });
    });
    
    // Preview application button
    document.getElementById('previewApplication').addEventListener('click', function() {
        if (validateCurrentStep()) {
            collectFormData();
            showPreviewModal();
        }
    });
}

// Show specific step
function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(stepEl => {
        stepEl.classList.remove('active');
    });
    
    // Show current step
    const currentStepEl = document.querySelector(`.form-step[data-step="${step}"]`);
    if (currentStepEl) {
        currentStepEl.classList.add('active');
        currentStep = step;
        
        // Add animation
        currentStepEl.style.animation = 'slideIn 0.5s ease';
    }
}

// Validate current step
function validateCurrentStep() {
    const currentStepEl = document.querySelector('.form-step.active');
    const inputs = currentStepEl.querySelectorAll('input, select, textarea');
    let isValid = true;
    
    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            markAsInvalid(input);
            isValid = false;
        } else {
            markAsValid(input);
        }
    });
    
    if (!isValid) {
        // Shake animation for error
        currentStepEl.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            currentStepEl.style.animation = '';
        }, 500);
        
        // Scroll to first error
        const firstError = currentStepEl.querySelector('.invalid');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    return isValid;
}

// Mark field as invalid
function markAsInvalid(field) {
    field.classList.add('invalid');
    field.style.borderColor = 'var(--accent-red)';
    field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.2)';
    
    // Add error message if not exists
    if (!field.nextElementSibling || !field.nextElementSibling.classList.contains('error-message')) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'This field is required';
        errorMsg.style.color = 'var(--accent-red)';
        errorMsg.style.fontSize = '0.85rem';
        errorMsg.style.marginTop = '5px';
        errorMsg.style.paddingLeft = '45px';
        field.parentNode.insertBefore(errorMsg, field.nextElementSibling);
    }
}

// Mark field as valid
function markAsValid(field) {
    field.classList.remove('invalid');
    field.style.borderColor = '';
    field.style.boxShadow = '';
    
    // Remove error message
    const errorMsg = field.nextElementSibling;
    if (errorMsg && errorMsg.classList.contains('error-message')) {
        errorMsg.remove();
    }
}

// Update progress bar
function updateProgress() {
    // Calculate filled fields percentage
    const allInputs = guestForm.querySelectorAll('input, select, textarea');
    const filledInputs = Array.from(allInputs).filter(input => 
        input.value.trim() !== '' && 
        (!input.hasAttribute('required') || input.value.trim() !== '')
    ).length;
    
    const totalRequired = allInputs.length;
    const percentage = Math.min(100, Math.round((filledInputs / totalRequired) * 100));
    
    // Update progress bar
    formProgress.style.width = `${percentage}%`;
    progressPercent.textContent = `${percentage}%`;
    
    // Color based on percentage
    if (percentage < 30) {
        formProgress.style.background = 'var(--accent-red)';
    } else if (percentage < 70) {
        formProgress.style.background = 'var(--accent-yellow)';
    } else {
        formProgress.style.background = 'linear-gradient(90deg, var(--neon-purple), var(--neon-blue))';
    }
}

// Collect all form data
function collectFormData() {
    applicationData = {
        // Step 1
        name: document.getElementById('guestName').value.trim(),
        email: document.getElementById('guestEmail').value.trim(),
        whatsapp: document.getElementById('guestWhatsApp').value.trim(),
        university: document.getElementById('guestUniversity').value.trim(),
        
        // Step 2
        major: guestMajorSelect.value === 'Other' ? 
               otherMajorInput.value.trim() : 
               guestMajorSelect.value,
        year: document.getElementById('guestYear').value,
        experience: document.getElementById('guestExperience').value,
        
        // Step 3
        topic: document.getElementById('guestTopic').value.trim(),
        bio: document.getElementById('guestBio').value.trim(),
        availability: document.getElementById('guestAvailability').value,
        timezone: document.getElementById('guestTimezone').value,
        
        // Metadata
        timestamp: new Date().toISOString(),
        status: 'pending',
        type: 'guest'
    };
}

// Show preview modal with collected data
function showPreviewModal() {
    // Build preview HTML
    const previewHTML = `
        <div class="preview-section">
            <h3><i class="fas fa-user-circle"></i> Personal Information</h3>
            <div class="preview-grid">
                <div class="preview-item">
                    <span class="preview-label">Full Name</span>
                    <div class="preview-value">${applicationData.name}</div>
                </div>
                <div class="preview-item">
                    <span class="preview-label">Email</span>
                    <div class="preview-value">${applicationData.email}</div>
                </div>
                <div class="preview-item">
                    <span class="preview-label">WhatsApp</span>
                    <div class="preview-value">${applicationData.whatsapp}</div>
                </div>
                <div class="preview-item">
                    <span class="preview-label">University</span>
                    <div class="preview-value">${applicationData.university}</div>
                </div>
            </div>
        </div>
        
        <div class="preview-section">
            <h3><i class="fas fa-graduation-cap"></i> Academic Background</h3>
            <div class="preview-grid">
                <div class="preview-item">
                    <span class="preview-label">Major</span>
                    <div class="preview-value">${applicationData.major}</div>
                </div>
                <div class="preview-item">
                    <span class="preview-label">Current Year</span>
                    <div class="preview-value">${applicationData.year}</div>
                </div>
                <div class="preview-item">
                    <span class="preview-label">Experience Level</span>
                    <div class="preview-value">${applicationData.experience || 'Not specified'}</div>
                </div>
            </div>
        </div>
        
        <div class="preview-section">
            <h3><i class="fas fa-lightbulb"></i> Podcast Details</h3>
            <div class="preview-grid">
                <div class="preview-item">
                    <span class="preview-label">Proposed Topic</span>
                    <div class="preview-value">${applicationData.topic}</div>
                </div>
                <div class="preview-item">
                    <span class="preview-label">Short Bio</span>
                    <div class="preview-value">${applicationData.bio || 'Not provided'}</div>
                </div>
                <div class="preview-item">
                    <span class="preview-label">Preferred Date</span>
                    <div class="preview-value">${applicationData.availability ? new Date(applicationData.availability).toLocaleDateString() : 'Flexible'}</div>
                </div>
                <div class="preview-item">
                    <span class="preview-label">Timezone</span>
                    <div class="preview-value">${applicationData.timezone || 'Flexible'}</div>
                </div>
            </div>
        </div>
        
        <div class="preview-note">
            <i class="fas fa-info-circle"></i>
            <p>Please review your application before submitting. We'll contact you within 5-7 business days.</p>
        </div>
    `;
    
    previewContent.innerHTML = previewHTML;
    previewModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Initialize event listeners
function initEventListeners() {
    // Modal close
    modalClose.addEventListener('click', closeModal);
    previewModal.addEventListener('click', function(e) {
        if (e.target === previewModal) {
            closeModal();
        }
    });
    
    // Edit application button
    editApplicationBtn.addEventListener('click', function() {
        closeModal();
        showStep(1);
    });
    
    // Confirm application button
    confirmApplicationBtn.addEventListener('click', submitGuestApplication);
    
    // Apply again button
    if (applyAgainBtn) {
        applyAgainBtn.addEventListener('click', resetApplication);
    }
    
    // Share application button
    if (shareApplicationBtn) {
        shareApplicationBtn.addEventListener('click', shareApplication);
    }
    
    // Sponsor form submission
    sponsorForm.addEventListener('submit', handleSponsorFormSubmit);
    
    // Menu toggle
    menuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        this.innerHTML = navLinks.classList.contains('active') ? 
            '<i class="fas fa-times"></i>' : 
            '<i class="fas fa-bars"></i>';
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
    
    // Real-time form validation
    guestForm.addEventListener('input', function() {
        updateProgress();
    });
}

// Initialize sponsors carousel
function initCarousel() {
    const track = document.querySelector('.carousel-track');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    let position = 0;
    const itemWidth = 270; // Width + gap
    
    if (track && prevBtn && nextBtn) {
        // Clone items for infinite scroll
        const items = track.querySelectorAll('.sponsor-card.featured');
        items.forEach(item => {
            const clone = item.cloneNode(true);
            track.appendChild(clone);
        });
        
        prevBtn.addEventListener('click', () => {
            position += itemWidth;
            if (position > 0) position = -(items.length * itemWidth);
            track.style.transform = `translateX(${position}px)`;
        });
        
        nextBtn.addEventListener('click', () => {
            position -= itemWidth;
            if (position < -(items.length * itemWidth)) position = 0;
            track.style.transform = `translateX(${position}px)`;
        });
        
        // Auto-scroll
        setInterval(() => {
            position -= itemWidth;
            if (position < -(items.length * itemWidth)) position = 0;
            track.style.transform = `translateX(${position}px)`;
        }, 3000);
    }
}

// Submit guest application
async function submitGuestApplication() {
    // Show loading state
    guestLoading.classList.add('show');
    confirmApplicationBtn.disabled = true;
    editApplicationBtn.disabled = true;
    
    try {
        // If Firebase is available, save to database
        if (db) {
            await db.collection('guestApplications').add({
                ...applicationData,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ Guest application saved to Firestore');
            
            // Send notification (simulated)
            await simulateNotification(applicationData.email);
        } else {
            // Demo mode - simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('📝 Guest application (demo):', applicationData);
        }
        
        // Close modal
        closeModal();
        
        // Show success message
        guestSuccessMessage.classList.add('show');
        guestForm.style.display = 'none';
        
        // Scroll to success message
        setTimeout(() => {
            guestSuccessMessage.scrollIntoView({ behavior: 'smooth' });
        }, 300);
        
        // Add to timeline
        addToTimeline(applicationData.name);
        
        // Send confirmation email (simulated)
        sendConfirmationEmail(applicationData);
        
    } catch (error) {
        console.error('❌ Error submitting guest application:', error);
        
        // Show error message
        alert('There was an error submitting your application. Please try again.');
        
        // Reset loading state
        guestLoading.classList.remove('show');
        confirmApplicationBtn.disabled = false;
        editApplicationBtn.disabled = false;
    }
}

// Handle sponsor form submission
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
    
    // Validation
    if (!formData.company || !formData.email || !formData.interest) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    const submitBtn = sponsorForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Show loading
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    try {
        // If Firebase is available, save to database
        if (db) {
            await db.collection('sponsorInquiries').add({
                ...formData,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ Sponsor inquiry saved to Firestore');
        } else {
            // Demo mode
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('📝 Sponsor inquiry (demo):', formData);
        }
        
        // Show success
        showToast('Thank you for your interest! We\'ll contact you within 24 hours.', 'success');
        
        // Reset form
        sponsorForm.reset();
        
        // Send notification
        simulateSponsorNotification(formData.email);
        
    } catch (error) {
        console.error('❌ Error submitting sponsor inquiry:', error);
        showToast('There was an error. Please try again.', 'error');
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)'};
        color: white;
        padding: 15px 20px;
        border-radius: var(--border-radius-sm);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1000;
        animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
        box-shadow: var(--shadow);
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

// Close modal
function closeModal() {
    previewModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    confirmApplicationBtn.disabled = false;
    editApplicationBtn.disabled = false;
}

// Reset application form
function resetApplication() {
    guestForm.reset();
    guestForm.style.display = 'block';
    guestSuccessMessage.classList.remove('show');
    showStep(1);
    updateProgress();
    
    // Scroll to form
    setTimeout(() => {
        guestForm.scrollIntoView({ behavior: 'smooth' });
    }, 300);
}

// Share application
function shareApplication() {
    const shareText = `I just applied to be a guest on MÉETIO Talk! 🎙️\n\nCheck it out: ${window.location.href}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'MÉETIO Talk Guest Application',
            text: shareText,
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            showToast('Link copied to clipboard!', 'success');
        });
    }
}

// Add to timeline
function addToTimeline(name) {
    const timeline = document.querySelector('.timeline');
    const newItem = document.createElement('div');
    newItem.className = 'timeline-item';
    newItem.innerHTML = `
        <div class="timeline-marker">
            <div class="marker-dot"></div>
            <div class="marker-line"></div>
        </div>
        <div class="timeline-content">
            <div class="timeline-year">Now</div>
            <div class="timeline-title">New Guest Application</div>
            <div class="timeline-desc">${name} applied to be a guest</div>
        </div>
    `;
    
    timeline.insertBefore(newItem, timeline.firstChild);
    
    // Animate in
    setTimeout(() => {
        newItem.style.animation = 'slideIn 0.6s forwards';
    }, 100);
}

// Simulate notification
async function simulateNotification(email) {
    console.log(`📧 Notification sent to: ${email}`);
    // In a real app, this would call your backend or Firebase Cloud Functions
}

// Simulate sponsor notification
async function simulateSponsorNotification(email) {
    console.log(`📧 Sponsor notification sent to: ${email}`);
}

// Send confirmation email (simulated)
function sendConfirmationEmail(data) {
    console.log(`📧 Confirmation email sent to: ${data.email}`);
    console.log('Email content:', {
        to: data.email,
        subject: 'MÉETIO Talk Guest Application Received',
        body: `Hi ${data.name},\n\nThank you for applying to be a guest on MÉETIO Talk!\n\nWe'll review your application and get back to you within 5-7 business days.\n\nBest,\nThe MÉETIO Team`
    });
}

// Show Firebase warning
function showFirebaseWarning() {
    console.warn('Firebase not initialized. Running in demo mode.');
    // You could show a subtle warning to admins
}

// Add CSS for shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
    }
    
    .show {
        display: block !important;
        animation: slideIn 0.5s ease !important;
    }
    
    .invalid {
        border-color: var(--accent-red) !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2) !important;
    }
    
    .preview-section {
        margin-bottom: 30px;
    }
    
    .preview-section h3 {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.2rem;
        margin-bottom: 20px;
        color: var(--text-light);
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .preview-section h3 i {
        color: var(--neon-purple);
    }
    
    .preview-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
    }
    
    @media (max-width: 768px) {
        .preview-grid {
            grid-template-columns: 1fr;
        }
    }
    
    .preview-note {
        background: rgba(176, 38, 255, 0.1);
        border: 1px solid var(--neon-purple);
        border-radius: var(--border-radius-sm);
        padding: 20px;
        margin-top: 30px;
        display: flex;
        align-items: flex-start;
        gap: 15px;
    }
    
    .preview-note i {
        color: var(--neon-blue);
        font-size: 1.5rem;
        margin-top: 2px;
    }
    
    .preview-note p {
        color: var(--text-gray);
        line-height: 1.6;
    }
`;
document.head.appendChild(style);

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateCurrentStep,
        collectFormData,
        submitGuestApplication,
        handleSponsorFormSubmit
    };
}
