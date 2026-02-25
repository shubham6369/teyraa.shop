/**
 * TEYRAA HOROLOGY — NARRATIVE ENGINE v3
 *
 * Animations:
 *  ✦ Cinematic loader with count-up progress
 *  ✦ Hero headline split-line entrance
 *  ✦ Scroll-triggered reveal (IntersectionObserver)
 *  ✦ Parallax hero video
 *  ✦ Stat counter animation
 *  ✦ Magnetic button tracking
 *  ✦ Precision dual cursor (dot + ring)
 *  ✦ Nav background on scroll
 *  ✦ Cart sidebar (open/close/render)
 *  ✦ Toast notification
 */

document.addEventListener('DOMContentLoaded', () => {


    // ╔══════════════════════════════════════╗
    // ║  1. CINEMATIC LOADER                 ║
    // ╚══════════════════════════════════════╝
    const loader = document.getElementById('loader');
    const loaderBar = document.getElementById('loader-bar');
    const loaderPct = document.getElementById('loader-pct');
    const loaderLogo = document.getElementById('loader-logo');

    if (loader && loaderLogo) {
        // Fade in logo
        setTimeout(() => {
            loaderLogo.style.opacity = '1';
            loaderLogo.style.transform = 'translateY(0)';
        }, 100);

        // Count progress bar 0 → 100
        let pct = 0;
        const interval = setInterval(() => {
            pct += Math.random() * 4 + 1;
            if (pct >= 100) {
                pct = 100;
                clearInterval(interval);
                if (loaderBar) loaderBar.style.width = '100%';
                if (loaderPct) loaderPct.textContent = '100%';

                // Collapse loader after short pause
                setTimeout(() => {
                    loader.classList.add('done');
                    document.body.style.overflow = 'auto';
                    // Trigger hero
                    const hero = document.querySelector('.hero');
                    if (hero) hero.classList.add('active');
                    // Show scroll indicator
                    const si = document.getElementById('scroll-indicator');
                    if (si) si.style.opacity = '1';
                }, 600);
            }
            if (loaderBar) loaderBar.style.width = `${Math.min(pct, 100)}%`;
            if (loaderPct) loaderPct.textContent = `${Math.floor(pct)}%`;
        }, 40);
    } else {
        // No loader — animate hero immediately
        const hero = document.querySelector('.hero');
        if (hero) setTimeout(() => hero.classList.add('active'), 100);
    }

    // Lock scroll during load
    document.body.style.overflow = 'hidden';


    // ╔══════════════════════════════════════╗
    // ║  2. SCROLL REVEAL ENGINE             ║
    // ╚══════════════════════════════════════╝
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


    // ╔══════════════════════════════════════╗
    // ║  3. STAT COUNTER ANIMATION           ║
    // ╚══════════════════════════════════════╝
    function animateCounter(el, target, duration = 2000) {
        let start = 0;
        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            // Ease out
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target).toLocaleString();
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target.toLocaleString();
        };
        requestAnimationFrame(step);
    }

    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-target'));
                animateCounter(el, target);
                statObserver.unobserve(el); // fire once only
            }
        });
    }, { threshold: 0.4 });

    document.querySelectorAll('.stat-num').forEach(el => statObserver.observe(el));


    // ╔══════════════════════════════════════╗
    // ║  4. SMOOTH ANCHOR SCROLLING          ║
    // ╚══════════════════════════════════════╝
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


    // ╔══════════════════════════════════════╗
    // ║  5. PARALLAX HERO VIDEO              ║
    // ╚══════════════════════════════════════╝
    const heroVideo = document.querySelector('.hero-video-bg');
    window.addEventListener('scroll', () => {
        if (heroVideo) {
            heroVideo.style.transform = `translateY(${window.pageYOffset * 0.25}px)`;
        }
    }, { passive: true });


    // ╔══════════════════════════════════════╗
    // ║  6. NAV SCROLL BACKGROUND            ║
    // ╚══════════════════════════════════════╝
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (!nav) return;
        if (window.scrollY > 80) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }, { passive: true });


    // ╔══════════════════════════════════════╗
    // ║  7. PRECISION DUAL CURSOR            ║
    // ╚══════════════════════════════════════╝
    const cursorDot = document.getElementById('cursor-glow');
    const cursorRing = document.getElementById('cursor-glow-outer');
    const cursorBg = document.getElementById('cursor-bg-glow');

    if (cursorDot && window.matchMedia('(pointer:fine)').matches) {
        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;

        document.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            // Dot follows instantly
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
            // Background glow follows with lag
            if (cursorBg) {
                cursorBg.style.left = mouseX + 'px';
                cursorBg.style.top = mouseY + 'px';
            }
        });

        // Ring lags behind — smooth follow
        function animateRing() {
            ringX += (mouseX - ringX) * 0.12;
            ringY += (mouseY - ringY) * 0.12;
            if (cursorRing) {
                cursorRing.style.left = ringX + 'px';
                cursorRing.style.top = ringY + 'px';
            }
            requestAnimationFrame(animateRing);
        }
        animateRing();

        // Hover state on interactive elements
        document.querySelectorAll('a, button, .chapter-card').forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (cursorRing) {
                    cursorRing.style.width = '70px';
                    cursorRing.style.height = '70px';
                    cursorRing.style.borderColor = 'rgba(59,114,168,0.9)';
                }
                if (cursorDot) cursorDot.style.transform = 'translate(-50%,-50%) scale(0.5)';
            });
            el.addEventListener('mouseleave', () => {
                if (cursorRing) {
                    cursorRing.style.width = '40px';
                    cursorRing.style.height = '40px';
                    cursorRing.style.borderColor = 'rgba(59,114,168,0.6)';
                }
                if (cursorDot) cursorDot.style.transform = 'translate(-50%,-50%) scale(1)';
            });
        });
    }


    // ╔══════════════════════════════════════╗
    // ║  8. MAGNETIC BUTTONS                 ║
    // ╚══════════════════════════════════════╝
    document.querySelectorAll('.magnetic').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
            btn.style.transition = 'transform 0.6s cubic-bezier(0.19,1,0.22,1)';
        });
    });


    // ╔══════════════════════════════════════╗
    // ║  9. CART SYSTEM                      ║
    // ╚══════════════════════════════════════╝
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
        if (countEl) countEl.textContent = cart.length;

        if (cart.length === 0) {
            itemsWrap.innerHTML = `
                <div style="text-align:center;padding:5rem 0;color:var(--color-text-muted);">
                    <div style="font-size:3rem;margin-bottom:1rem;opacity:0.2;">◷</div>
                    <p style="font-family:var(--font-heading);font-size:1.4rem;margin-bottom:1rem;">The archive is empty.</p>
                    <a href="#collections" style="font-size:0.7rem;letter-spacing:2px;color:var(--color-accent);text-transform:uppercase;text-decoration:none;">Discover a Timepiece</a>
                </div>`;
            if (totalEl) totalEl.textContent = '₹0';
            return;
        }

        let total = 0;
        itemsWrap.innerHTML = cart.map((item, idx) => {
            total += Number(item.price);
            return `
            <div style="display:flex;gap:1.2rem;margin-bottom:2rem;padding-bottom:2rem;border-bottom:1px solid var(--color-border);align-items:center;animation:fadeUp 0.5s ${idx * 0.08}s var(--ease-out-expo) both;">
                <img src="${item.image}?q=60&w=150&auto=format" style="width:65px;height:65px;object-fit:cover;flex-shrink:0;filter:brightness(0.8);" onerror="this.style.display='none'">
                <div style="flex:1;min-width:0;">
                    <p style="font-size:0.85rem;margin-bottom:0.4rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</p>
                    <span style="font-size:0.7rem;color:var(--color-accent);">₹${Number(item.price).toLocaleString('en-IN')}</span>
                </div>
                <button onclick="window.removeFromCart(${idx})" style="background:none;border:none;color:var(--color-text-muted);cursor:none;font-size:1rem;flex-shrink:0;transition:color 0.3s;padding:0.5rem;" onmouseover="this.style.color='white'" onmouseout="this.style.color='var(--color-text-muted)'">✕</button>
            </div>`;
        }).join('');

        if (totalEl) totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
    }

    window.addToCart = (id, name, price, image, category) => {
        cart.push({ id, name, price: Number(price), image, category: category || '' });
        saveCart();
        renderCart();
        openCart();
        showToast(`${name} secured.`);
    };

    window.removeFromCart = (idx) => {
        const removed = cart[idx];
        cart.splice(idx, 1);
        saveCart();
        renderCart();
        if (removed) showToast(`${removed.name} removed.`);
    };

    renderCart();


    // ╔══════════════════════════════════════╗
    // ║  10. TOAST NOTIFICATION              ║
    // ╚══════════════════════════════════════╝
    function showToast(msg) {
        // Remove existing toasts
        document.querySelectorAll('.teyraa-toast').forEach(t => t.remove());

        const t = document.createElement('div');
        t.className = 'teyraa-toast';
        t.style.cssText = `
            position:fixed; bottom:2.5rem; left:50%; transform:translateX(-50%) translateY(30px);
            background:rgba(15,15,15,0.95); color:#fff;
            border:1px solid var(--color-accent);
            padding:1rem 2.5rem; border-radius:2px;
            font-size:0.7rem; letter-spacing:2px;
            text-transform:uppercase; z-index:99999;
            opacity:0; white-space:nowrap;
            backdrop-filter:blur(16px);
            transition:all 0.5s cubic-bezier(0.19,1,0.22,1);
        `;
        t.textContent = msg;
        document.body.appendChild(t);

        requestAnimationFrame(() => {
            t.style.opacity = '1';
            t.style.transform = 'translateX(-50%) translateY(0)';
        });
        setTimeout(() => {
            t.style.opacity = '0';
            t.style.transform = 'translateX(-50%) translateY(30px)';
            setTimeout(() => t.remove(), 500);
        }, 3200);
    }

    window.showToast = showToast;

});
