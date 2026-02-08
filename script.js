// Firebase Configuration
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
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM Elements
const waitlistForm = document.getElementById('waitlistForm');
const successMessage = document.getElementById('successMessage');

// Form Submission Handler
waitlistForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form values
    const companyName = document.getElementById('companyName').value;
    const contactPerson = document.getElementById('contactPerson').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const companyType = document.getElementById('companyType').value;
    const partnershipInterest = document.getElementById('partnershipInterest').value;
    const message = document.getElementById('message').value;
    
    // Create submission data
    const submissionData = {
        companyName,
        contactPerson,
        email,
        phone: phone || 'Not provided',
        companyType,
        partnershipInterest,
        message: message || 'No additional message',
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'pending'
    };
    
    try {
        // Show loading state on button
        const submitBtn = waitlistForm.querySelector('.btn-primary');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;
        
        // Save to Firestore
        await db.collection('partnerWaitlist').add(submissionData);
        
        // Show success message
        successMessage.style.display = 'flex';
        
        // Reset form
        waitlistForm.reset();
        
        // Reset button
        setTimeout(() => {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }, 2000);
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
        
        // Update recent activity in the UI
        updateRecentActivity(companyName);
        
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('There was an error submitting your request. Please try again.');
        
        // Reset button in case of error
        const submitBtn = waitlistForm.querySelector('.btn-primary');
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Join Waitlist';
        submitBtn.disabled = false;
    }
});

// Update recent activity in the UI
function updateRecentActivity(companyName) {
    const activityList = document.querySelector('.activity-list');
    const now = new Date();
    const timeString = getTimeAgo(now);
    
    const newActivity = document.createElement('div');
    newActivity.className = 'activity-item';
    newActivity.innerHTML = `
        <div class="activity-icon">
            <i class="fas fa-user-plus"></i>
        </div>
        <div class="activity-content">
            <p><strong>${companyName}</strong> joined the waitlist</p>
            <span class="activity-time">${timeString}</span>
        </div>
    `;
    
    // Add to the top of the activity list
    activityList.insertBefore(newActivity, activityList.firstChild);
    
    // Update waitlist count in stats
    updateWaitlistCount();
}

// Get time ago string
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

// Update waitlist count in stats
function updateWaitlistCount() {
    const waitlistNumber = document.querySelector('.stat-card:nth-child(2) .stat-number');
    const currentCount = parseInt(waitlistNumber.textContent);
    waitlistNumber.textContent = currentCount + 1;
}

// Load existing waitlist count from Firestore
async function loadWaitlistCount() {
    try {
        const snapshot = await db.collection('partnerWaitlist').where('status', '==', 'pending').get();
        const count = snapshot.size;
        
        // Update the waitlist count in the UI
        const waitlistNumber = document.querySelector('.stat-card:nth-child(2) .stat-number');
        if (waitlistNumber) {
            waitlistNumber.textContent = count;
        }
        
        // Update total partners count (pending + approved)
        const totalSnapshot = await db.collection('partnerWaitlist').get();
        const totalPartners = document.querySelector('.stat-card:first-child .stat-number');
        if (totalPartners) {
            totalPartners.textContent = totalSnapshot.size;
        }
        
    } catch (error) {
        console.error('Error loading waitlist count:', error);
    }
}

// Load recent activities from Firestore
async function loadRecentActivities() {
    try {
        const snapshot = await db.collection('partnerWaitlist')
            .orderBy('timestamp', 'desc')
            .limit(4)
            .get();
        
        const activityList = document.querySelector('.activity-list');
        
        // Clear existing activities (except the first one which is a placeholder)
        while (activityList.children.length > 0) {
            activityList.removeChild(activityList.firstChild);
        }
        
        // Add activities from Firestore
        snapshot.forEach(doc => {
            const data = doc.data();
            const timeAgo = data.timestamp ? getTimeAgo(data.timestamp.toDate()) : 'Recently';
            
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-user-plus"></i>
                </div>
                <div class="activity-content">
                    <p><strong>${data.companyName}</strong> joined the waitlist</p>
                    <span class="activity-time">${timeAgo}</span>
                </div>
            `;
            
            activityList.appendChild(activityItem);
        });
        
    } catch (error) {
        console.error('Error loading recent activities:', error);
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('MEETIO Partner Dashboard loaded');
    
    // Load initial data
    loadWaitlistCount();
    loadRecentActivities();
    
    // Add click handlers to navigation items
    const navItems = document.querySelectorAll('.nav-menu li');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            navItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
            
            // Simulate navigation (in a real app, this would load different content)
            const itemText = this.textContent.trim();
            console.log(`Navigating to: ${itemText}`);
        });
    });
    
    // Initialize form validation
    const formInputs = document.querySelectorAll('#waitlistForm input, #waitlistForm select');
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.style.borderColor = '#dc2626';
            } else {
                this.style.borderColor = '#d1d5db';
            }
        });
        
        input.addEventListener('input', function() {
            this.style.borderColor = '#d1d5db';
        });
    });
});

// Add animation to stat cards on load
window.addEventListener('load', function() {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});
