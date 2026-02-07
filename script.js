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

    const total = cartItems.reduce((sum, item) => {
        const price = parseInt(item.price.replace(/[₹,]/g, ''));
        return sum + price;
    }, 0);

    const customerData = {
        name: document.getElementById('customerName').value,
        mobile: document.getElementById('customerMobile').value,
        email: document.getElementById('customerEmail').value,
        address: document.getElementById('customerAddress').value,
        city: document.getElementById('customerCity').value,
        state: document.getElementById('customerState').value,
        pincode: document.getElementById('customerPincode').value
    };

    const paymentMethod = document.getElementById('paymentMethod').value;

    // If COD, process normally
    if (paymentMethod === 'COD') {
        processOrder({
            orderId: 'ORD' + Date.now(),
            orderDate: new Date().toISOString(),
            customer: customerData,
            items: cartItems,
            paymentMethod: 'COD',
            paymentStatus: 'Pending',
            paymentId: null,
            totalAmount: total,
            status: 'Pending'
        });
        return;
    }

    // If Online Payment, use Razorpay
    const options = {
        key: getRazorpayKey(), // Get from razorpay-config.js
        amount: total * 100, // Razorpay expects amount in paise (₹1 = 100 paise)
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
            // Payment successful
            console.log('Payment successful:', response);

            processOrder({
                orderId: 'ORD' + Date.now(),
                orderDate: new Date().toISOString(),
                customer: customerData,
                items: cartItems,
                paymentMethod: 'Online Payment',
                paymentStatus: 'Paid',
                paymentId: response.razorpay_payment_id,
                totalAmount: total,
                status: 'Pending'
            });
        },
        modal: {
            ondismiss: function () {
                // Payment cancelled
                alert('Payment cancelled. Your order was not placed.');
            }
        }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function (response) {
        // Payment failed
        console.error('Payment failed:', response.error);
        alert('Payment failed! Please try again.\nReason: ' + response.error.description);
    });

    rzp.open();
}

// Process order (common for COD and Online Payment)
async function processOrder(order) {
    try {
        console.log('Processing order in Firebase...');

        // Save to Firebase Firestore
        const docRef = await ordersCollection.add(order);
        console.log('Order saved to Firestore with ID:', docRef.id);

        // Clear cart
        cartItems = [];
        cartCount.textContent = '0';

        // Close modal
        closeCheckout();

        // Show success message
        showOrderSuccess(docRef.id);

    } catch (error) {
        console.error("Error processing order in Firebase:", error);
        alert("Something went wrong while placing your order. Please try again or contact support.");
    }
}

// Show order success message
function showOrderSuccess(orderId) {
    const successModal = document.createElement('div');
    successModal.className = 'modal order-success-modal active';
    successModal.innerHTML = `
        <div class="modal-content success-content">
            <div class="success-icon">✓</div>
            <h2>Order Placed Successfully!</h2>
            <p>Your order ID: <strong>${orderId}</strong></p>
            <p>We'll send you order updates on your email and mobile number.</p>
            <button class="btn-primary" onclick="closeSuccessModal()">Continue Shopping</button>
        </div>
    `;
    document.body.appendChild(successModal);

    setTimeout(() => {
        successModal.remove();
    }, 5000);
}

// Close success modal
function closeSuccessModal() {
    const modal = document.querySelector('.order-success-modal');
    if (modal) {
        modal.remove();
    }
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

console.log('🛍️ patel.store E-commerce Website Loaded Successfully!');
