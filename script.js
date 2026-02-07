// ===== SCROLL REVEAL ANIMATION =====
const observeElements = () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Once revealed, stop observing
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Elements to observe
    const revealElements = document.querySelectorAll('.reveal, .product-card, .category-card, .review-card, .section-header');
    revealElements.forEach(el => {
        el.classList.add('reveal-initial');
        observer.observe(el);
    });
};

// Initialize after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    observeElements();
});

// ===== MOBILE MENU TOGGLE =====
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const mobileMenuClose = document.getElementById('mobileMenuClose');
const navMobile = document.getElementById('navMobile');
const body = document.body;

// Create overlay
const overlay = document.createElement('div');
overlay.className = 'overlay';
body.appendChild(overlay);

// Open mobile menu
mobileMenuToggle.addEventListener('click', () => {
    navMobile.classList.add('active');
    overlay.classList.add('active');
    body.style.overflow = 'hidden';
});

// Close mobile menu
mobileMenuClose.addEventListener('click', closeMobileMenu);
overlay.addEventListener('click', closeMobileMenu);

function closeMobileMenu() {
    navMobile.classList.remove('active');
    overlay.classList.remove('active');
    body.style.overflow = '';
}

// Mobile dropdown toggle
const mobileDropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');
mobileDropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function () {
        const submenu = this.nextElementSibling;
        submenu.classList.toggle('active');
    });
});

// ===== FAQ ACCORDION =====
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const isActive = faqItem.classList.contains('active');

        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });

        // Open clicked item if it wasn't active
        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

// ===== CART FUNCTIONALITY =====
let cartItems = [];

const cartSidebar = document.getElementById('cartSidebar');
const cartClose = document.getElementById('cartClose');
const cartToggle = document.querySelector('.cart-toggle');
const cartCount = document.querySelector('.cart-count');

// Open cart sidebar
cartToggle.addEventListener('click', () => {
    cartSidebar.classList.add('active');
    overlay.classList.add('active');
    body.style.overflow = 'hidden';
    updateCartDisplay();
});

// Close cart sidebar
cartClose.addEventListener('click', () => {
    cartSidebar.classList.remove('active');
    if (!navMobile.classList.contains('active')) {
        overlay.classList.remove('active');
        body.style.overflow = '';
    }
});

// Close cart when clicking outside
cartSidebar.addEventListener('click', (e) => {
    if (e.target === cartSidebar) {
        cartSidebar.classList.remove('active');
        if (!navMobile.classList.contains('active')) {
            overlay.classList.remove('active');
            body.style.overflow = '';
        }
    }
});

// Add to cart buttons - we'll reattach these after dynamic loading
function attachCartListeners() {
    const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
    addToCartButtons.forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        newButton.addEventListener('click', function (e) {
            e.preventDefault();

            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = productCard.querySelector('.price-sale').textContent;
            const productImage = productCard.querySelector('.product-image').src;

            // Add to cart
            cartItems.push({
                id: Date.now(),
                name: productName,
                price: productPrice,
                image: productImage
            });

            // Update cart count
            cartCount.textContent = cartItems.length;
            cartCount.style.transform = 'scale(1.3)';
            setTimeout(() => {
                cartCount.style.transform = 'scale(1)';
            }, 200);

            // Show feedback
            const originalText = this.textContent;
            this.textContent = 'Added! ✓';
            this.style.background = '#4CAF50';

            setTimeout(() => {
                this.textContent = originalText;
                this.style.background = '';
            }, 1500);

            updateCartDisplay();
        });
    });
}

// Initial attachment once DOM loads
document.addEventListener('DOMContentLoaded', () => {
    attachCartListeners();
});

// Update cart display
function updateCartDisplay() {
    const cartContent = document.querySelector('.cart-content');

    if (cartItems.length === 0) {
        cartContent.innerHTML = `
            <div class="cart-empty">
                <h3>Your cart is empty</h3>
                <p>Add some items to get started!</p>
                <a href="#MainContent" class="btn-primary">Continue shopping</a>
            </div>
        `;
    } else {
        const total = cartItems.reduce((sum, item) => {
            const price = parseInt(item.price.replace(/[₹,]/g, ''));
            return sum + price;
        }, 0);

        cartContent.innerHTML = `
            <div class="cart-items">
                ${cartItems.map(item => `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <p class="cart-item-price">${item.price}</p>
                        </div>
                        <button class="cart-item-remove" onclick="removeFromCart(${item.id})">×</button>
                    </div>
                `).join('')}
            </div>
            <div class="cart-summary">
                <div class="cart-total">
                    <span>Total:</span>
                    <span class="total-price">₹${total.toLocaleString()}</span>
                </div>
                <button class="btn-checkout" onclick="openCheckout()">Proceed to Checkout</button>
            </div>
        `;
    }
}

// Remove from cart
function removeFromCart(id) {
    cartItems = cartItems.filter(item => item.id !== id);
    cartCount.textContent = cartItems.length;
    updateCartDisplay();
}

// Open checkout modal
function openCheckout() {
    if (cartItems.length === 0) return;

    // Close cart sidebar
    cartSidebar.classList.remove('active');
    overlay.classList.remove('active');
    body.style.overflow = '';

    // Create checkout modal if it doesn't exist
    let checkoutModal = document.getElementById('checkoutModal');
    if (!checkoutModal) {
        checkoutModal = document.createElement('div');
        checkoutModal.id = 'checkoutModal';
        checkoutModal.className = 'modal checkout-modal';
        checkoutModal.innerHTML = `
            <div class="modal-content checkout-content">
                <div class="modal-header">
                    <h2>Checkout</h2>
                    <button class="modal-close" onclick="closeCheckout()">&times;</button>
                </div>
                <div class="checkout-body">
                    <div class="checkout-section">
                        <h3>Order Summary</h3>
                        <div class="checkout-items" id="checkoutItems"></div>
                        <div class="checkout-total">
                            <span>Total Amount:</span>
                            <span class="total-amount" id="checkoutTotal"></span>
                        </div>
                    </div>
                    
                    <div class="checkout-section">
                        <h3>Customer Information</h3>
                        <form id="checkoutForm" class="checkout-form">
                            <div class="form-group">
                                <label for="customerName">Full Name *</label>
                                <input type="text" id="customerName" placeholder="Enter your full name" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="customerMobile">Mobile Number *</label>
                                <input type="tel" id="customerMobile" placeholder="Enter 10-digit mobile number" pattern="[0-9]{10}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="customerEmail">Email Address *</label>
                                <input type="email" id="customerEmail" placeholder="Enter your email" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="customerAddress">Delivery Address *</label>
                                <textarea id="customerAddress" rows="3" placeholder="Enter complete delivery address" required></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="customerCity">City *</label>
                                <input type="text" id="customerCity" placeholder="Enter city" required>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="customerState">State *</label>
                                    <input type="text" id="customerState" placeholder="Enter state" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="customerPincode">Pincode *</label>
                                    <input type="text" id="customerPincode" placeholder="6-digit pincode" pattern="[0-9]{6}" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="paymentMethod">Payment Method *</label>
                                <select id="paymentMethod" required>
                                    <option value="">Select Payment Method</option>
                                    <option value="COD">Cash on Delivery (COD)</option>
                                    <option value="Online">Online Payment (UPI/Card)</option>
                                </select>
                            </div>
                            
                            <div class="form-group" style="margin-top: 1.5rem;">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="termsAgree" required>
                                    I agree to the Terms & Conditions and Privacy Policy
                                </label>
                            </div>
                            
                            <button type="submit" class="btn-place-order">Place Order</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(checkoutModal);

        // Add form submit handler
        document.getElementById('checkoutForm').addEventListener('submit', placeOrder);
    }

    // Update checkout items and total
    const checkoutItemsDiv = document.getElementById('checkoutItems');
    const total = cartItems.reduce((sum, item) => {
        const price = parseInt(item.price.replace(/[₹,]/g, ''));
        return sum + price;
    }, 0);

    checkoutItemsDiv.innerHTML = cartItems.map(item => `
        <div class="checkout-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="checkout-item-info">
                <h4>${item.name}</h4>
                <p>${item.price}</p>
            </div>
        </div>
    `).join('');

    document.getElementById('checkoutTotal').textContent = `₹${total.toLocaleString()}`;

    // Show modal
    checkoutModal.classList.add('active');
}

// Close checkout modal
function closeCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.classList.remove('active');
    }
}

// Place order
function placeOrder(e) {
    e.preventDefault();
    console.log('🛍️ Attempting to place order...');

    try {
        const totalAmountText = document.getElementById('checkoutTotal').textContent;
        const total = parseInt(totalAmountText.replace(/[₹,]/g, '')) || 0;

        const customerData = {
            name: document.getElementById('customerName').value,
            mobile: document.getElementById('customerMobile').value,
            email: document.getElementById('customerEmail').value,
            address: document.getElementById('customerAddress').value,
            city: document.getElementById('customerCity').value,
            state: document.getElementById('customerState').value,
            pincode: document.getElementById('customerPincode').value
        };

        // Safety check for empty fields (redundant with HTML required but good practice)
        for (const [key, value] of Object.entries(customerData)) {
            if (!value || value.trim() === "") {
                throw new Error(`Please fill in the ${key} field.`);
            }
        }

        const paymentMethod = document.getElementById('paymentMethod').value;
        if (!paymentMethod) {
            alert("Please select a payment method.");
            return;
        }

        const orderData = {
            orderId: 'ORD' + Date.now(),
            orderDate: new Date().toISOString(),
            customer: customerData,
            items: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image
            })),
            paymentMethod: paymentMethod,
            paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
            paymentId: null,
            totalAmount: total,
            status: 'Pending'
        };

        // If COD, process normally
        if (paymentMethod === 'COD') {
            processOrder(orderData);
            return;
        }

        // If Online Payment, use Razorpay
        if (typeof Razorpay === 'undefined') {
            alert("Payment system is currently unavailable. Please use Cash on Delivery.");
            return;
        }

        const options = {
            key: getRazorpayKey(),
            amount: total * 100,
            currency: 'INR',
            name: razorpayConfig.businessName,
            description: `Order for ${cartItems.length} item(s)`,
            image: razorpayConfig.logo,
            prefill: {
                name: customerData.name,
                email: customerData.email,
                contact: customerData.mobile
            },
            theme: {
                color: razorpayConfig.theme.color
            },
            handler: function (response) {
                orderData.paymentId = response.razorpay_payment_id;
                orderData.paymentStatus = 'Paid';
                orderData.paymentMethod = 'Online';
                processOrder(orderData);
            },
            modal: {
                ondismiss: function () {
                    alert('Payment cancelled. Your order was not placed.');
                }
            }
        };

        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function (response) {
            console.error('Payment failed:', response.error);
            alert('Payment failed! Reason: ' + response.error.description);
        });

        rzp.open();
    } catch (error) {
        console.error("Order Preparation Error:", error);
        alert(error.message || "An unexpected error occurred. Please check the form and try again.");
    }
}

// Process order (common for COD and Online Payment)
async function processOrder(order) {
    try {
        console.log('🔥 Sending order to Firebase...', order);

        if (typeof ordersCollection === 'undefined') {
            throw new Error("Order system not initialized properly. Please refresh and try again.");
        }

        // Save to Firebase Firestore
        const docRef = await ordersCollection.add(order);
        console.log('✅ Order saved to Firestore with ID:', docRef.id);

        // Clear cart
        cartItems = [];
        if (typeof cartCount !== 'undefined') cartCount.textContent = '0';
        localStorage.removeItem('teyraaCart'); // Cleanup if exists

        // Close modal
        closeCheckout();

        // Show success message
        showOrderSuccess(order.orderId);

    } catch (error) {
        console.error("Firebase Order Error:", error);
        let msg = "Could not place order. ";
        if (error.code === 'permission-denied') {
            msg += "Permission denied. Please contact support.";
        } else {
            msg += "Error: " + error.message;
        }
        alert(msg);
    }
}

// Show order success message
function showOrderSuccess(orderId) {
    const successModal = document.createElement('div');
    successModal.className = 'modal order-success-modal active';
    successModal.style.zIndex = "10001";
    successModal.innerHTML = `
        <div class="modal-content success-content" style="text-align: center; padding: 3rem;">
            <div class="success-icon" style="width: 80px; height: 80px; background: #4CAF50; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3rem; margin: 0 auto 1.5rem;">✓</div>
            <h2 style="margin-bottom: 1rem;">Order Confirmed!</h2>
            <p style="font-size: 1.1rem; color: #444; margin-bottom: 0.5rem;">Your Order ID is: <strong>${orderId}</strong></p>
            <p style="color: #666; margin-bottom: 2rem;">Thank you for shopping with teyraa.shop! You can track your order in your profile.</p>
            <button class="btn-primary" onclick="closeSuccessModal()" style="width: 100%; padding: 1rem;">Continue Shopping</button>
        </div>
    `;
    document.body.appendChild(successModal);
    overlay.classList.add('active'); // Ensure overlay is active
}

// Close success modal
function closeSuccessModal() {
    const modal = document.querySelector('.order-success-modal');
    if (modal) {
        modal.remove();
    }
    if (typeof overlay !== 'undefined') overlay.classList.remove('active');
    window.location.hash = 'home'; // Go back to top
}

// Make functions global
window.removeFromCart = removeFromCart;
window.openCheckout = openCheckout;
window.closeCheckout = closeCheckout;
window.closeSuccessModal = closeSuccessModal;
window.attachCartListeners = attachCartListeners;

// ===== SMOOTH SCROLL FOR NAVIGATION LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();

            const target = document.querySelector(href);
            const headerOffset = 100;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            closeMobileMenu();
        }
    });
});

// ===== HEADER SCROLL EFFECT =====
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    }
});

// ===== CUSTOMER AUTHENTICATION LOGIC =====
const userBtn = document.getElementById('userBtn');
const userModal = document.getElementById('userModal');
const userModalClose = document.getElementById('userModalClose');
const toSignup = document.getElementById('toSignup');
const toLogin = document.getElementById('toLogin');
const loginSection = document.getElementById('loginSection');
const signupSection = document.getElementById('signupSection');
const profileSection = document.getElementById('profileSection');
const phoneSection = document.getElementById('phoneSection');
const authTabs = document.getElementById('authTabs');
const userModalTitle = document.getElementById('userModalTitle');

const tabEmail = document.getElementById('tabEmail');
const tabPhone = document.getElementById('tabPhone');

// Phone Auth Step Divs
const phoneInputStep = document.getElementById('phoneInputStep');
const otpInputStep = document.getElementById('otpInputStep');

let confirmationResult = null;

// Initialize Recaptcha
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    'size': 'normal',
    'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        console.log('reCAPTCHA solved');
    },
    'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
        console.warn('reCAPTCHA expired');
    }
});

// Toggle Login or Profile
if (userBtn) {
    userBtn.addEventListener('click', () => {
        if (!auth.currentUser) {
            // Not logged in -> Go to Landing Page
            window.location.href = 'login.html';
        } else {
            // Logged in -> Show Profile Modal
            userModal.classList.add('active');
            overlay.classList.add('active');
        }
    });
}

if (userModalClose) {
    userModalClose.addEventListener('click', () => {
        userModal.classList.remove('active');
        overlay.classList.remove('active');
    });
}

// Tab Switching
tabEmail.addEventListener('click', () => {
    loginSection.style.display = 'block';
    phoneSection.style.display = 'none';
    signupSection.style.display = 'none';
    tabEmail.style.color = 'var(--accent-color)';
    tabEmail.style.borderBottom = '2px solid var(--accent-color)';
    tabPhone.style.color = 'var(--text-muted)';
    tabPhone.style.borderBottom = 'none';
    userModalTitle.textContent = 'Customer Login';
});

tabPhone.addEventListener('click', () => {
    loginSection.style.display = 'none';
    phoneSection.style.display = 'block';
    signupSection.style.display = 'none';
    tabPhone.style.color = 'var(--accent-color)';
    tabPhone.style.borderBottom = '2px solid var(--accent-color)';
    tabEmail.style.color = 'var(--text-muted)';
    tabEmail.style.borderBottom = 'none';
    userModalTitle.textContent = 'Phone login';
});

// Switch between Login and Signup
toSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginSection.style.display = 'none';
    phoneSection.style.display = 'none';
    signupSection.style.display = 'block';
    authTabs.style.display = 'none';
    userModalTitle.textContent = 'Create Account';
});

toLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupSection.style.display = 'none';
    loginSection.style.display = 'block';
    authTabs.style.display = 'flex';
    userModalTitle.textContent = 'Customer Login';
    tabEmail.click();
});

// Auth State Listener
auth.onAuthStateChanged((user) => {
    if (user) {
        // Customer is logged in
        if (loginSection) loginSection.style.display = 'none';
        if (signupSection) signupSection.style.display = 'none';
        if (phoneSection) phoneSection.style.display = 'none';
        if (authTabs) authTabs.style.display = 'none';
        if (profileSection) profileSection.style.display = 'block';
        if (userModalTitle) userModalTitle.textContent = 'My Account';

        document.getElementById('displayUserName').textContent = user.displayName || 'Customer';
        document.getElementById('displayUserEmail').textContent = user.email || user.phoneNumber;
        document.getElementById('userAvatar').textContent = (user.displayName || user.email || user.phoneNumber || 'U').charAt(0).toUpperCase();

        if (userBtn) userBtn.style.color = 'var(--accent-color)';
        if (document.getElementById('logoutHeader')) document.getElementById('logoutHeader').style.display = 'block';
    } else {
        // Logged out
        if (profileSection) profileSection.style.display = 'none';
        if (userBtn) userBtn.style.color = '';
        if (document.getElementById('logoutHeader')) document.getElementById('logoutHeader').style.display = 'none';
    }
});

// Handle Login (Email)
document.getElementById('customerLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        console.log('Customer logged in');
    } catch (error) {
        alert(error.message);
    }
});

// Handle Signup (Email)
document.getElementById('customerSignupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ displayName: name });
    } catch (error) {
        alert(error.message);
    }
});

// Handle Send OTP
document.getElementById('sendOTP').addEventListener('click', async () => {
    const number = document.getElementById('phoneNumber').value;
    if (number.length !== 10) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
    }

    const fullNumber = "+91" + number;
    const appVerifier = window.recaptchaVerifier;

    try {
        confirmationResult = await auth.signInWithPhoneNumber(fullNumber, appVerifier);
        phoneInputStep.style.display = 'none';
        otpInputStep.style.display = 'block';
        console.log("OTP Sent to", fullNumber);
    } catch (error) {
        console.error("Phone Auth Error:", error);
        alert("Error: " + error.message);
        // Reset recaptcha if error
        if (window.grecaptcha) window.grecaptcha.reset();
    }
});

// Handle Verify OTP
document.getElementById('verifyOTP').addEventListener('click', async () => {
    const code = document.getElementById('otpCode').value;
    if (code.length !== 6) {
        alert("Please enter the 6-digit code sent to your phone.");
        return;
    }

    try {
        await confirmationResult.confirm(code);
        console.log("Code verified. Logged in.");
    } catch (error) {
        alert("Invalid OTP code. Please try again.");
    }
});

// Resend OTP
document.getElementById('resendOTP').addEventListener('click', () => {
    otpInputStep.style.display = 'none';
    phoneInputStep.style.display = 'block';
    if (window.grecaptcha) window.grecaptcha.reset();
});

// Handle Logout
const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
        auth.signOut();
    }
};

if (document.getElementById('customerLogout')) {
    document.getElementById('customerLogout').addEventListener('click', handleLogout);
}

if (document.getElementById('logoutHeader')) {
    document.getElementById('logoutHeader').addEventListener('click', handleLogout);
}

console.log('🛍️ teyraa.shop Loaded Successfully!');
