// Enhanced star rating interaction
document.addEventListener('DOMContentLoaded', function() {
    // Star rating enhancement
    const ratingLabels = document.querySelectorAll('.rating-input label');
    const ratingContainer = document.querySelector('.rating-input');
    
    if (ratingContainer) {
        ratingLabels.forEach((label, index) => {
            label.addEventListener('mouseenter', function() {
                // Add hover effect with sound visualization
                this.style.transform = 'scale(1.3) rotate(15deg)';
                this.style.filter = 'drop-shadow(0 0 15px #ffd700)';
            });
            
            label.addEventListener('mouseleave', function() {
                if (!this.previousElementSibling || !this.previousElementSibling.checked) {
                    this.style.transform = '';
                    this.style.filter = '';
                }
            });
            
            label.addEventListener('click', function() {
                // Add click animation
                this.style.animation = 'starPulse 0.6s ease';
                setTimeout(() => {
                    this.style.animation = '';
                }, 600);
            });
        });
    }
    
    // Review form enhancements
    const reviewForm = document.querySelector('.review-form');
    if (reviewForm) {
        const inputs = reviewForm.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.style.transform = 'scale(1.02)';
                this.parentElement.style.transition = 'transform 0.3s ease';
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.style.transform = '';
            });
        });
    }
    
    // Add loading animation to buttons
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-review');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.type === 'submit' || this.href) {
                // Add loading state
                const originalText = this.textContent;
                this.style.pointerEvents = 'none';
                
                if (this.type === 'submit') {
                    this.textContent = '✨ Submitting...';
                    // Re-enable after form submission
                    setTimeout(() => {
                        this.textContent = originalText;
                        this.style.pointerEvents = '';
                    }, 2000);
                }
            }
        });
    });
    
    // Review item animations
    const reviewItems = document.querySelectorAll('.review-item');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    reviewItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(item);
    });
    
    // Character counter for textarea
    const textarea = document.querySelector('textarea[name="review_text"]');
    if (textarea) {
        const maxLength = textarea.getAttribute('maxlength') || 1000;
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.style.cssText = `
            text-align: right;
            font-size: 14px;
            color: #6c757d;
            margin-top: 5px;
            transition: color 0.3s ease;
        `;
        textarea.parentElement.appendChild(counter);
        
        function updateCounter() {
            const remaining = maxLength - textarea.value.length;
            counter.textContent = `${textarea.value.length}/${maxLength} characters`;
            
            if (remaining < 100) {
                counter.style.color = '#dc3545';
            } else if (remaining < 200) {
                counter.style.color = '#ffc107';
            } else {
                counter.style.color = '#6c757d';
            }
        }
        
        textarea.addEventListener('input', updateCounter);
        updateCounter();
    }
    
    // Add smooth scroll to reviews section
    const reviewLinks = document.querySelectorAll('a[href*="#reviews"]');
    reviewLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const reviewsSection = document.querySelector('.reviews-section');
            if (reviewsSection) {
                reviewsSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Add CSS animations via JavaScript for better browser compatibility
const style = document.createElement('style');
style.textContent = `
    .character-counter {
        animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .review-item:hover .action-icon {
        animation: bounce 0.6s ease;
    }
    
    @keyframes bounce {
        0%, 20%, 60%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        80% { transform: translateY(-5px); }
    }
`;
document.head.appendChild(style);