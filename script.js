/**
 * TEYRAA HOROLOGY — NARRATIVE ENGINE v2
 *
 * Responsibilities:
 *  - Cinematic hero entrance animation
 *  - Scroll-reveal via IntersectionObserver
 *  - Smooth anchor scrolling
 *  - Parallax hero background
 *  - Cart sidebar (slide-in/out, live item list)
 *  - Gold cursor glow (desktop)
 *  - Toast notification system
 */

document.addEventListener('DOMContentLoaded', () => {

    // ╔════════════════════════════════════╗
    // ║  1. HERO ENTRANCE                  ║
    // ╚════════════════════════════════════╝
    const hero = document.querySelector('.hero');
    if (hero) setTimeout(() => hero.classList.add('active'), 120);


    // ╔════════════════════════════════════╗
    // ║  2. SCROLL REVEAL ENGINE           ║
    // ╚════════════════════════════════════╝
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


    // ╔════════════════════════════════════╗
    // ║  3. SMOOTH ANCHOR SCROLLING        ║
    // ╚════════════════════════════════════╝
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });


    // ╔════════════════════════════════════╗
    // ║  4. PARALLAX HERO                  ║
    // ╚════════════════════════════════════╝
    const heroVideo = document.querySelector('.hero-video-bg');
    if (heroVideo) {
        window.addEventListener('scroll', () => {
            heroVideo.style.transform = `translateY(${window.pageYOffset * 0.28}px)`;
        }, { passive: true });
    }


    // ╔════════════════════════════════════╗
    // ║  5. GOLD CURSOR GLOW              ║
    // ╚════════════════════════════════════╝
    const glow = document.getElementById('cursor-glow');
    if (glow && window.matchMedia('(pointer:fine)').matches) {
        document.addEventListener('mousemove', e => {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
        });
    }


    // ╔════════════════════════════════════╗
    // ║  6. CART SYSTEM                    ║
    // ╚════════════════════════════════════╝
    let cart = JSON.parse(localStorage.getItem('teyraa_cart')) || [];

    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    const toggle = document.getElementById('cartToggle');
    const closeBtn = document.getElementById('cartClose');
    const itemsWrap = document.getElementById('cartItemsContainer');
    const countEl = document.getElementById('cartCount');
    const totalEl = document.getElementById('cartTotal');

    function openCart() {
        if (!sidebar) return;
        sidebar.style.right = '0';
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'all';
    }
    function closeCart() {
        if (!sidebar) return;
        sidebar.style.right = '-500px';
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
    }

    if (toggle) toggle.addEventListener('click', e => { e.preventDefault(); openCart(); });
    if (closeBtn) closeBtn.addEventListener('click', closeCart);
    if (overlay) overlay.addEventListener('click', closeCart);

    function saveCart() { localStorage.setItem('teyraa_cart', JSON.stringify(cart)); }

    function renderCart() {
        if (!itemsWrap) return;

        const count = cart.length;
        if (countEl) countEl.textContent = count;

        if (count === 0) {
            itemsWrap.innerHTML = `
                <div style="text-align:center; padding:4rem 0; color:var(--color-text-muted);">
                    <p style="font-family:var(--font-heading); font-size:1.4rem; margin-bottom:1rem;">The archive is empty.</p>
                    <a href="#collections" onclick="closeCart()" style="font-size:0.75rem; letter-spacing:2px; color:var(--color-accent); text-transform:uppercase;">Discover a Timepiece</a>
                </div>`;
            if (totalEl) totalEl.textContent = '₹0';
            return;
        }

        let total = 0;
        itemsWrap.innerHTML = cart.map((item, idx) => {
            total += Number(item.price);
            return `
            <div style="display:flex; gap:1.2rem; margin-bottom:2rem; padding-bottom:2rem; border-bottom:1px solid var(--color-border); align-items:center;">
                <img src="${item.image}?q=60&w=150&auto=format" style="width:65px; height:65px; object-fit:cover; flex-shrink:0; filter:brightness(0.8);" onerror="this.style.display='none'">
                <div style="flex:1; min-width:0;">
                    <p style="font-size:0.85rem; margin-bottom:0.3rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</p>
                    <span style="font-size:0.7rem; color:var(--color-accent);">₹${Number(item.price).toLocaleString('en-IN')}</span>
                </div>
                <button onclick="window.removeFromCart(${idx})" style="background:none; border:none; color:var(--color-text-muted); cursor:pointer; font-size:1rem; flex-shrink:0; transition:0.3s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='var(--color-text-muted)'">✕</button>
            </div>`;
        }).join('');

        if (totalEl) totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
    }

    // Global add / remove exposed to products.js
    window.addToCart = (id, name, price, image, category) => {
        cart.push({ id, name, price: Number(price), image, category: category || '' });
        saveCart();
        renderCart();
        openCart();
        showToast(`${name} added to your collection.`);
    };

    window.removeFromCart = (idx) => {
        cart.splice(idx, 1);
        saveCart();
        renderCart();
    };

    renderCart(); // on load


    // ╔════════════════════════════════════╗
    // ║  7. TOAST NOTIFICATION             ║
    // ╚════════════════════════════════════╝
    function showToast(msg) {
        const t = document.createElement('div');
        t.style.cssText = `
            position:fixed; bottom:2.5rem; left:50%; transform:translateX(-50%) translateY(20px);
            background:#0f0f0f; color:#fff; border:1px solid var(--color-accent);
            padding:1rem 2.5rem; border-radius:2px; font-size:0.75rem; letter-spacing:1.5px;
            text-transform:uppercase; z-index:99999; opacity:0;
            transition:all 0.5s cubic-bezier(0.19,1,0.22,1); white-space:nowrap;
        `;
        t.textContent = msg;
        document.body.appendChild(t);
        requestAnimationFrame(() => {
            t.style.opacity = '1';
            t.style.transform = 'translateX(-50%) translateY(0)';
        });
        setTimeout(() => {
            t.style.opacity = '0';
            t.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(() => t.remove(), 500);
        }, 3500);
    }

    window.showToast = showToast; // expose for other modules

});
