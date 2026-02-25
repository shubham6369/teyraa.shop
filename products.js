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

// Function to render products by category
function renderProducts(products) {
    const watchCategories = ['Heritage', 'Chronograph', 'Complication', 'Minimalist'];
    // Globally filter all products to ONLY include watches
    const onlyWatches = products.filter(p => watchCategories.includes((p.category || '').trim()));

    allProductsGlobal = onlyWatches;

    const containerIds = {
        'Heritage': 'heritageGrid',
        'Chronograph': 'chronographGrid',
        'Complication': 'complicationGrid',
        'Minimalist': 'minimalistGrid'
    };

    watchCategories.forEach(category => {
        const container = document.getElementById(containerIds[category]);
        if (!container) return;

        // Strict category filtering
        const categoryProducts = onlyWatches.filter(p => (p.category || '').trim() === category);

        if (categoryProducts.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; background: rgba(255,255,255,0.02); border: 1px dashed var(--glass-border); border-radius: var(--radius-lg); margin-top: 1rem;">
                    <p style="color: var(--accent-light); font-family: var(--font-heading); font-size: 1.25rem; margin-bottom: 0.5rem;">Collection Coming Soon</p>
                    <p style="color: var(--text-muted); font-size: 0.9rem;">Our master watchmakers are currently curating this specific range.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = categoryProducts.map(createProductCard).join('');
    });

    renderAllProducts(onlyWatches); // Render only watches in the master collection

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

// Attach filter listeners
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('filter-select')) {
        applyFilters();
    }
});

// Global listener for Real-time Updates from Firestore
let productsListener = null;

function setupProductsListener() {
    if (productsListener) productsListener();

    productsListener = productsCollection.onSnapshot((snapshot) => {
        const products = [];
        snapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });
        renderProducts(products);
    }, (error) => {
        console.error("Error listening to products:", error);
    });
}

// Function to seed sample watches if Firestore is empty
async function seedSampleWatches() {
    const snapshot = await productsCollection.get();
    if (snapshot.empty) {
        console.log('🏛️ TEYRAA HOROLOGY - Initializing Master Inventory (100 Pieces)...');

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

        for (let i = 0; i < 100; i++) {
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
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        console.log('✅ Master Inventory Seeded.');
    }
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

