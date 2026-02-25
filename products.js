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
    allProductsGlobal = products;
    const categories = ['Heritage', 'Chronograph', 'Complication', 'Minimalist'];
    const containerIds = {
        'Heritage': 'heritageGrid',
        'Chronograph': 'chronographGrid',
        'Complication': 'complicationGrid',
        'Minimalist': 'minimalistGrid'
    };

    categories.forEach(category => {
        const container = document.getElementById(containerIds[category]);
        if (!container) return;

        const categoryProducts = products.filter(p => (p.category || '').toLowerCase().trim() === category.toLowerCase().trim());
        if (categoryProducts.length === 0) return;

        container.innerHTML = categoryProducts.map(createProductCard).join('');
    });

    renderAllProducts(products); // Also render the master collection

    if (typeof window.attachCartListeners === 'function') {
        window.attachCartListeners();
    }
}

function renderAllProducts(products) {
    const container = document.getElementById('allProductsGrid');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 5rem 0;">No luxury pieces match your current filters.</p>';
        return;
    }

    container.innerHTML = products.map(createProductCard).join('');
}

// Filter Logic
function applyFilters() {
    const priceRange = document.getElementById('priceFilter').value;
    const category = document.getElementById('categoryFilter').value;
    const rating = document.getElementById('ratingFilter').value;

    let filtered = [...allProductsGlobal];

    // Filter by Price
    if (priceRange !== 'all') {
        const [min, max] = priceRange.split('-').map(v => v === 'above' ? Infinity : Number(v));
        filtered = filtered.filter(p => {
            const price = Number(p.salePrice);
            return price >= min && price <= max;
        });
    }

    // Filter by Category
    if (category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
    }

    // Filter by Rating
    if (rating !== 'all') {
        filtered = filtered.filter(p => (p.rating || 5) >= Number(rating));
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

// Initial Load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('TEYRAA HOROLOGY - Initializing Collections...');

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
    }

    setupProductsListener();
});

