/**
 * TEYRAA HOROLOGY - NARRATIVE ENGINE
 * Handles: Scroll Animations, Parallax, Cart UX, and Page Transitions
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. INITIALIZE HERO ANIMATION
    const hero = document.querySelector('.hero');
    setTimeout(() => {
        hero.classList.add('active');
    }, 100);

    // 2. SCROLL REVEAL ENGINE
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: stop observing once revealed for performance
                // revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => revealObserver.observe(el));

    // 3. SMOOTH NAVIGATION ANCHORS
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 4. PARALLAX EFFECTS (Subtle)
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroVideo = document.querySelector('.hero-video-bg');
        if (heroVideo) {
            heroVideo.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
    });

    // 5. CART STATE MANAGEMENT (Minimalist Implementation)
    let cart = JSON.parse(localStorage.getItem('teyraa_cart')) || [];
    updateCartUI();

    window.addToCart = (id, name, price, image) => {
        const item = { id, name, price: Number(price), image };
        cart.push(item);
        localStorage.setItem('teyraa_cart', JSON.stringify(cart));
        updateCartUI();
        showNotification(`${name} secured in your collection.`, 'success');
    };

    function updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) cartCount.innerText = cart.length;
    }

    // 6. DYNAMIC UI FEEDBACK
    function showNotification(message, type = 'success') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: ${type === 'success' ? '#0f0f0f' : '#7f1d1d'};
            color: white;
            padding: 1rem 2rem;
            border: 1px solid var(--color-accent);
            border-radius: 4px;
            font-size: 0.8rem;
            letter-spacing: 1px;
            text-transform: uppercase;
            z-index: 10000;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.5s var(--ease-out-expo);
        `;
        toast.innerText = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        }, 100);

        setTimeout(() => {
            toast.style.transform = 'translateY(100px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    }
});
