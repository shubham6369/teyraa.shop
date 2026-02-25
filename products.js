// ===== DYNAMIC PRODUCT LOADER FOR MAIN WEBSITE WITH FIREBASE =====

let allProductsGlobal = [];

// Helper to render a single product card
function createProductCard(product) {
    const salePrice = Number(product.salePrice) || 0;
    const originalPrice = Number(product.originalPrice) || 0;
    const rating = product.rating || 5; // Default to 5 stars if not set

    return `
        <div class="product-card">
            <div class="product-image-container" style="position: relative; overflow: hidden;">
                <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy" onerror="this.src='https://via.placeholder.com/400x500?text=Image+Not+Found'">
                <div class="quick-view-overlay" onclick="openQuickView('${product.id}')" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.3s; cursor: pointer;">
                    <span style="background: white; padding: 0.8rem 1.2rem; border-radius: 50px; font-weight: 700; font-size: 0.8rem; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">Quick View</span>
                </div>
            </div>
            <div class="product-info">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.3rem;">
                    <h3 style="margin: 0;">${product.name}</h3>
                    <button onclick="toggleWishlist('${product.id}', '${product.name}', '₹${salePrice.toLocaleString('en-IN')}', '${product.image}')" style="background: none; border: none; cursor: pointer; color: #cbd5e1; padding: 2px; transition: 0.3s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#cbd5e1'">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                </div>
                <div class="product-rating" style="color: var(--accent-color); font-size: 0.75rem; margin-bottom: 0.5rem;">
                    ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}
                </div>
                <div class="product-price">
                    <span class="price-sale">₹${salePrice.toLocaleString('en-IN')}</span>
                    <span class="price-original">₹${originalPrice.toLocaleString('en-IN')}</span>
                </div>
                <button class="btn-add-to-cart" data-id="${product.id}" 
                        data-name="${product.name}" 
                        data-price="₹${salePrice.toLocaleString('en-IN')}" 
                        data-image="${product.image}">Add to Cart</button>
            </div>
        </div>
    `;
}

// Function to render products (Consolidated for storytelling focus)
function renderProducts(products) {
    const watchCategories = ['Heritage', 'Chronograph', 'Complication', 'Minimalist'];
    // Globally filter all products to ONLY include watches
    const onlyWatches = products.filter(p => watchCategories.includes((p.category || '').trim()));

    allProductsGlobal = onlyWatches;

    // We no longer render separate grids for categories in the simplified storytelling layout
    renderAllProducts(onlyWatches); // Render all watches in the master collection

    if (typeof window.attachCartListeners === 'function') {
        window.attachCartListeners();
    }
}

function renderAllProducts(products) {
    const container = document.getElementById('allProductsGrid');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 6rem 2rem; background: rgba(255,255,255,0.02); border: 1px dashed var(--glass-border); border-radius: var(--radius-lg);">
                <p style="color: var(--accent-light); font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 0.5rem;">Inventory Under Review</p>
                <p style="color: var(--text-muted); font-size: 1rem;">No luxury pieces match your current filters. Please adjust your selection.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(createProductCard).join('');
}

// Filter Logic
function applyFilters() {
    const priceRange = document.getElementById('priceFilter').value;
    const categoryFilterValue = document.getElementById('categoryFilter').value;
    const ratingFilterValue = document.getElementById('ratingFilter').value;

    const allowedCategories = ['Heritage', 'Chronograph', 'Complication', 'Minimalist'];

    let filtered = allProductsGlobal.filter(p => {
        const cat = (p.category || '').trim();
        return allowedCategories.includes(cat);
    });

    // Filter by Price
    if (priceRange !== 'all') {
        const [min, max] = priceRange.split('-').map(v => v === 'above' ? Infinity : Number(v));
        filtered = filtered.filter(p => {
            const price = Number(p.salePrice);
            return price >= min && price <= max;
        });
    }

    // Filter by Category
    if (categoryFilterValue !== 'all') {
        filtered = filtered.filter(p => p.category === categoryFilterValue);
    }

    // Filter by Rating
    if (ratingFilterValue !== 'all') {
        filtered = filtered.filter(p => (p.rating || 5) >= Number(ratingFilterValue));
    }

    renderAllProducts(filtered);

    // Re-attach listeners after update
    if (typeof window.attachCartListeners === 'function') {
        window.attachCartListeners();
    }
}

window.filterByDot = function (category, element) {
    // Update UI
    const pills = document.querySelectorAll('.cat-pill');
    pills.forEach(p => {
        p.style.opacity = '0.4';
        p.classList.remove('active');
        const dot = p.querySelector('.cat-dot');
        const span = p.querySelector('span');
        if (dot) dot.style.background = 'white';
        if (dot) dot.style.boxShadow = 'none';
        if (span) span.style.color = 'white';
    });

    element.style.opacity = '1';
    element.classList.add('active');
    const activeDot = element.querySelector('.cat-dot');
    const activeSpan = element.querySelector('span');
    if (activeDot) activeDot.style.background = 'var(--accent-color)';
    if (activeDot) activeDot.style.boxShadow = '0 0 10px var(--accent-color)';
    if (activeSpan) activeSpan.style.color = 'var(--accent-color)';

    // Update Filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.value = category;
        applyFilters();
    }
};

// Attach filter listeners
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('filter-select')) {
        applyFilters();
    }
});

// Function to seed sample watches if Firestore is empty
async function seedSampleWatches() {
    const snapshot = await productsCollection.get();
    if (snapshot.empty) {
        console.log('🏛️ TEYRAA HOROLOGY - Initializing Master Inventory (100 Pieces)...');

        // 1. THE 10 LEGENDARY PILLARS (Storytelling watches)
        const legendaryPillars = [
            {
                name: "Elysian Tourbillon Zero",
                category: "Complication",
                salePrice: 1250000,
                originalPrice: 1500000,
                rating: 5,
                image: "https://images.unsplash.com/photo-1619134778706-7015533a6150",
                story: "The Elysian Zero is not merely a timepiece; it is a defiance of gravity. Our master horologists spent three years perfecting the rotating carriage, ensuring that every second is a dance of light and mechanical grace. Born in the quiet valleys of the Swiss Alps, it represents the absolute pinnacle of our heritage."
            },
            {
                name: "Heritage Sovereign Gold",
                category: "Heritage",
                salePrice: 850000,
                originalPrice: 950000,
                rating: 5,
                image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa",
                story: "Crafted from a single block of 18k rose gold, the Sovereign is a tribute to the monarchs of old. Its dial features a hand-guilloché pattern that takes 40 hours to complete. Wearing the Sovereign is a statement of quiet power and an embrace of legacy that transcends generations."
            },
            {
                name: "Zenith Moonphase Nocturne",
                category: "Complication",
                salePrice: 650000,
                originalPrice: 720000,
                rating: 5,
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
                story: "The Nocturne tracks the lunar cycle with an accuracy of one day every 122 years. Its deep aventurine dial mimics the star-studded midnight sky, making every glance at your wrist a journey through the cosmos. It's designed for those who find inspiration in the silence of the night."
            },
            {
                name: "Obsidian Skeleton X",
                category: "Minimalist",
                salePrice: 420000,
                originalPrice: 480000,
                rating: 5,
                image: "https://images.unsplash.com/photo-1509048191080-d2984bad6ad5",
                story: "Transparency is the ultimate form of complexity. The Obsidian Skeleton X strips away the non-essential, revealing the beating heart of the movement. Its DLC-coated case provides a stealthy, modern aesthetic while honoring the centuries-old tradition of open-worked movements."
            },
            {
                name: "Aero Chrono Pilot Edition",
                category: "Chronograph",
                salePrice: 285000,
                originalPrice: 310000,
                rating: 5,
                image: "https://images.unsplash.com/photo-1548171916-042bdc6b5ad7",
                story: "Inspired by the pioneers of aviation, the Aero Chrono is built for precision under pressure. Its anti-magnetic movement and high-contrast dial ensure readability in the most demanding environments. It is a companion for the adventurous soul navigating the horizons of possibility."
            },
            {
                name: "Imperial Majesty Platinum",
                category: "Heritage",
                salePrice: 1850000,
                originalPrice: 2100000,
                rating: 5,
                image: "https://images.unsplash.com/photo-1508685096489-7as5c7f139a1",
                story: "Platinum is the rarest of all metals, and the Imperial Majesty is the rarest of all watches. With a bespoke movement developed exclusively for this reference, it is the ultimate expression of horological exclusivity. Each piece is individually numbered and hand-finished by a single master watchmaker."
            },
            {
                name: "Majestic Pulse Chrono",
                category: "Chronograph",
                salePrice: 550000,
                originalPrice: 600000,
                rating: 5,
                image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d",
                story: "The Majestic Pulse captures the very rhythm of life. Featuring a high-frequency escapement, it measures intervals with surgical precision. The bold design and tactile pushers make it as much a tool of performance as it is a work of art."
            },
            {
                name: "Regal Heritage 1920",
                category: "Heritage",
                salePrice: 320000,
                originalPrice: 350000,
                rating: 5,
                image: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7",
                story: "A direct descendant of our very first archive sketches, the 1920 Edition bridges the gap between history and the present. Its vintage-inspired aesthetics—including heat-blued hands and a cream porcelain dial—evoke an era of unmatched elegance and discovery."
            },
            {
                name: "Stellar Complication Nebula",
                category: "Complication",
                salePrice: 980000,
                originalPrice: 1100000,
                rating: 5,
                image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3",
                story: "The Nebula features a world-time complication that allows you to track 24 time zones simultaneously. The center dial is a hand-painted enamel map of the stars, reminding the wearer that time is constant, no matter where on Earth you stand."
            },
            {
                name: "Vantage Master Minimalist",
                category: "Minimalist",
                salePrice: 185000,
                originalPrice: 210000,
                rating: 5,
                image: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7",
                story: "True luxury is found in the absence of clutter. The Vantage Master features an ultra-thin profile that disappears under a shirt cuff, yet commands attention with its flawless finish and perfectly proportioned indices. It is the purest expression of TEYRAA's design philosophy."
            }
        ];

        for (const watch of legendaryPillars) {
            await productsCollection.add({
                ...watch,
                isLegendary: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        // 2. FILL THE REST (90 more pieces)
        const watchPrefixes = ['Elysian', 'Zenith', 'Regal', 'Obsidian', 'Aurora', 'Majestic', 'Stellar', 'Imperial', 'Sovereign', 'Noble', 'Classic', 'Heritage', 'Eternal', 'Timeless', 'Summit', 'Peak', 'Ocean', 'Aero', 'Chrono', 'Luxe', 'Elite', 'Titan', 'Atlas', 'Nova'];
        const watchSuffixes = ['Chronograph', 'Moonphase', 'Tourbillon', 'Skeleton', 'Automatic', 'Master', 'Edition', 'Series', 'Legacy', 'Vantage', 'Spectra', 'Phantom', 'Gale', 'Tide', 'Precision', 'Unity', 'Essence', 'Nova', 'Pulse'];
        const watchCategories = ['Heritage', 'Chronograph', 'Complication', 'Minimalist'];
        const watchImages = [
            'https://images.unsplash.com/photo-1547996160-81dfa63595aa',
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
            'https://images.unsplash.com/photo-1509048191080-d2984bad6ad5',
            'https://images.unsplash.com/photo-1619134778706-7015533a6150',
            'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7',
            'https://images.unsplash.com/photo-1524805444758-089113d48a6d',
            'https://images.unsplash.com/photo-1539533018447-63fcce2678e3',
            'https://images.unsplash.com/photo-1548171916-042bdc6b5ad7',
            'https://images.unsplash.com/photo-1508685096489-7as5c7f139a1',
            'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7'
        ];

        for (let i = 0; i < 90; i++) {
            const prefix = watchPrefixes[Math.floor(Math.random() * watchPrefixes.length)];
            const suffix = watchSuffixes[Math.floor(Math.random() * watchSuffixes.length)];
            const category = watchCategories[Math.floor(Math.random() * watchCategories.length)];
            const image = `${watchImages[Math.floor(Math.random() * watchImages.length)]}?q=80&w=800&auto=format&fit=crop`;

            const salePrice = Math.floor(Math.random() * (1200000 - 45000 + 1)) + 45000;
            const orgPrice = salePrice + Math.floor(Math.random() * 50000) + 10000;
            const rating = Math.random() > 0.3 ? 5 : 4;

            await productsCollection.add({
                name: `${prefix} ${suffix} ${i + 1}`,
                category: category,
                salePrice: salePrice,
                originalPrice: orgPrice,
                image: image,
                rating: rating,
                isLegendary: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        console.log('✅ Master Inventory Seeded.');
    }
}

// Function to render storytelling section
function renderLegendaryStories(products) {
    const container = document.getElementById('legendaryChronicles');
    const dotsContainer = document.getElementById('storyDots');
    if (!container) return;

    const legendaries = products.filter(p => p.isLegendary).slice(0, 10);

    if (legendaries.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.innerHTML = legendaries.map((watch, index) => `
        <div class="story-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
            <div class="story-image-container">
                <img src="${watch.image}?q=80&w=1200&auto=format&fit=crop" alt="${watch.name}" class="story-image">
                <div class="story-overlay"></div>
            </div>
            <div class="story-content-container">
                <span class="story-category">${watch.category}</span>
                <h2 class="story-title">${watch.name}</h2>
                <div class="story-divider"></div>
                <p class="story-text">${watch.story || "A masterpiece of horological engineering, blending centuries of tradition with the uncompromising precision of modernity."}</p>
                <div class="story-footer">
                    <div class="story-price">₹${watch.salePrice.toLocaleString()}</div>
                    <button class="btn-primary" onclick="addToCart('${watch.id}', '${watch.name}', ${watch.salePrice}, '${watch.image}')">
                        Secure This Reference
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    if (dotsContainer) {
        dotsContainer.innerHTML = legendaries.map((_, i) => `
            <div class="story-dot ${i === 0 ? 'active' : ''}" onclick="goToStory(${i})"></div>
        `).join('');
    }
}

let currentStoryIndex = 0;
window.goToStory = function (index) {
    const slides = document.querySelectorAll('.story-slide');
    const dots = document.querySelectorAll('.story-dot');

    if (!slides.length) return;

    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));

    slides[index].classList.add('active');
    dots[index].classList.add('active');
    currentStoryIndex = index;
};

// Global listener for Real-time Updates from Firestore
let productsListener = null;

function setupProductsListener() {
    if (productsListener) productsListener();

    productsListener = productsCollection.onSnapshot((snapshot) => {
        const products = [];
        snapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });
        allProductsGlobal = products;
        renderProducts(products);
        renderLegendaryStories(products);
    }, (error) => {
        console.error("Error listening to products:", error);
    });
}

// Initial Load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('TEYRAA HOROLOGY - Initializing Collections...');

    // Migration and Seed
    const localProducts = JSON.parse(localStorage.getItem('teyraaProducts') || '[]');
    if (localProducts.length > 0) {
        const snapshot = await productsCollection.get();
        if (snapshot.empty) {
            for (const product of localProducts) {
                const { id, ...rest } = product;
                await productsCollection.add(rest);
            }
            localStorage.removeItem('teyraaProducts');
            localStorage.removeItem('patelProducts');
        }
    } else {
        // Only seed if no local migration happened
        await seedSampleWatches();
    }

    setupProductsListener();
});
