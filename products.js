/**
 * TEYRAA HOROLOGY - DATA ARCHIVE
 * Handles: Real-time Firestore Syncing, Story Seeding, and Advanced Filtering
 */

let allProductsArchive = [];

// --- CLOUD ARCHIVE CONNECTORS ---

/**
 * Renders a single timepiece card in a clean, Titan-inspired layout
 */
function createMasterpieceCard(product) {
    const salePrice = Number(product.salePrice) || 0;
    const originalPrice = Number(product.originalPrice) || (salePrice * 1.2);
    const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);

    return `
        <div class="product-card" onclick="window.location.href='#'" style="animation: fadeInUp 0.6s ease-out forwards;">
            <div class="badge">BEST SELLER</div>
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/400?text=The+Legacy+Piece'">
                <div class="quick-view">Quick View</div>
            </div>
            <div class="product-info">
                <div class="product-brand">TEYRAA | ${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="price-container">
                    <span class="sale-price">₹${salePrice.toLocaleString('en-IN')}</span>
                    <span class="original-price">₹${Math.round(originalPrice).toLocaleString('en-IN')}</span>
                    <span class="discount">${discount}% OFF</span>
                </div>
                <div class="rating">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star-half-alt"></i>
                    <span class="count">(4.5)</span>
                </div>
                <div class="card-actions">
                    <button onclick="event.stopPropagation(); addToCart('${product.id}', '${product.name}', ${salePrice}, '${product.image}', '${product.category}')" class="buy-now-btn">
                        Add to Cart
                    </button>
                    <button class="wishlist-btn-icon"><i class="far fa-heart"></i></button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Handles the distribution of masterpieces into the grid
 */
function distributeMasterpieces(products) {
    const container = document.getElementById('allProductsGrid');
    const countEl = document.getElementById('displayedCount');

    if (!container) return;

    if (countEl) countEl.textContent = products.length;

    if (products.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--titan-gray-text); padding: 4rem;">No pieces found in this collection. Try another filter.</p>`;
        return;
    }

    container.innerHTML = products.map(createMasterpieceCard).join('');
}

/**
 * Utility: Filter by category dots or links
 */
/**
 * Utility: Filter by category dots or links
 */
let activeFilters = new Set();
window.filterByDot = function (category, element) {
    if (element && element.type === 'checkbox') {
        if (element.checked) {
            activeFilters.add(category);
        } else {
            activeFilters.delete(category);
        }
    } else {
        // Legacy support for single links
        activeFilters.clear();
        if (category !== 'all') activeFilters.add(category);
    }

    let filtered;
    if (activeFilters.size === 0) {
        filtered = allProductsArchive;
    } else {
        filtered = allProductsArchive.filter(p => activeFilters.has(p.category || ''));
    }

    distributeMasterpieces(filtered);

    // Smooth scroll to display findings
    const grid = document.getElementById('allProductsGrid');
    if (grid && window.scrollY > grid.offsetTop) {
        grid.scrollIntoView({ behavior: 'smooth' });
    }
};

/**
 * Real-time Listener for Firestore Collections
 */
function initializeArchiveSync() {
    productsCollection.orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
        const products = [];
        snapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });

        allProductsArchive = products;
        distributeMasterpieces(products);
    }, (error) => {
        console.error("Archive Sync Error:", error);
    });
}

/**
 * Story Seeding Utility: Initializes the boutique if Firestore is empty
 */
async function seedBoutique() {
    const snapshot = await productsCollection.limit(1).get();
    if (snapshot.empty) {
        console.log('🏛️ TEYRAA HOROLOGY - Initializing Boutique Inventory...');

        const masterpieceSchema = [
            {
                name: "Grand Royal Chronogram",
                category: "Chronograph",
                salePrice: 145000,
                originalPrice: 185000,
                image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa",
                story: "The absolute silence of mechanical perfection."
            },
            {
                name: "Stellar Galaxy Silver",
                category: "Heritage",
                salePrice: 85000,
                originalPrice: 115000,
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
                story: "A tribute to the monarchs of old."
            },
            {
                name: "Midnight Complication X",
                category: "Complication",
                salePrice: 225000,
                originalPrice: 280000,
                image: "https://images.unsplash.com/photo-1509048191080-d2984bad6ad5",
                story: "Navigation by the stars, on your wrist."
            },
            {
                name: "Minimalist Slate Pro",
                category: "Minimalist",
                salePrice: 42000,
                originalPrice: 58000,
                image: "https://images.unsplash.com/photo-1619134778706-7015533a6150",
                story: "Transparency is the ultimate form of complexity."
            },
            {
                name: "Majestic Gold Complication",
                category: "Complication",
                salePrice: 540000,
                originalPrice: 650000,
                image: "https://images.unsplash.com/photo-1548171916-042bdc6b5ad7",
                story: "Tracking time across the horizons of progress."
            },
            {
                name: "Aero Precision Pro",
                category: "Chronograph",
                salePrice: 125000,
                originalPrice: 150000,
                image: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7",
                story: "Built for those who navigate the skies."
            }
        ];

        for (const item of masterpieceSchema) {
            await productsCollection.add({
                ...item,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    }
}

// --- INITIALIZATION ---

document.addEventListener('DOMContentLoaded', async () => {
    // Check if firebase is initialized
    if (typeof productsCollection !== 'undefined') {
        await seedBoutique();
        initializeArchiveSync();
    } else {
        console.warn("Firestore not found. boutique in offline mode.");
    }
});
