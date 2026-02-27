/**
 * TEYRAA HOROLOGY - CORE UI ENGINE
 * Rebuilt for Titan-inspired minimalism
 */

document.addEventListener('DOMContentLoaded', () => {

    // Header Scroll Effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.padding = '5px 0';
        } else {
            header.style.padding = '0';
        }
    });

    // --- CART SYSTEM ---
    let cart = JSON.parse(localStorage.getItem('teyraa_cart')) || [];
    const countEl = document.getElementById('cartCount');

    function updateCartCount() {
        if (countEl) countEl.textContent = cart.length;
    }

    function saveCart() {
        localStorage.setItem('teyraa_cart', JSON.stringify(cart));
        updateCartCount();
    }

    window.addToCart = (id, name, price, image, category) => {
        const item = { id, name, price, image, category };
        cart.push(item);
        saveCart();
        showToast(`${name} added to cart`);
    };

    updateCartCount();

    // --- TOAST NOTIFICATION ---
    function showToast(msg) {
        let toast = document.querySelector('.titan-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'titan-toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                background: #212121;
                color: white;
                padding: 12px 30px;
                border-radius: 4px;
                font-size: 14px;
                z-index: 10000;
                transition: all 0.5s ease;
                opacity: 0;
            `;
            document.body.appendChild(toast);
        }

        toast.textContent = msg;
        toast.style.opacity = '1';
        toast.style.bottom = '40px';

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.bottom = '30px';
        }, 3000);
    }
});
