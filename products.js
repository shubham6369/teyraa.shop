// ===== DYNAMIC PRODUCT LOADER FOR MAIN WEBSITE WITH FIREBASE =====

// Function to render products by category
function renderProducts(products) {
    const categories = ['Heritage', 'Chronograph', 'Complication', 'Minimalist'];
    const containerIds = {
        'Heritage': 'heritageGrid',
        'Chronograph': 'chronographGrid',
        'Complication': 'complicationGrid',
        'Minimalist': 'minimalistGrid'
    };

    console.log('Total products from Firestore:', products.length);

    categories.forEach(category => {
        const container = document.getElementById(containerIds[category]);
        if (!container) return;

        // Case-insensitive filtering
        const categoryProducts = products.filter(p => {
            const prodCat = (p.category || '').toLowerCase().trim();
            const targetCat = category.toLowerCase().trim();

            // Heritage can include legacy 'teyraa special' if needed, 
            // but for a clean state we prefer direct matching.
            return prodCat === targetCat;
        });

        console.log(`[${category}] Matching products:`, categoryProducts.length);

        if (categoryProducts.length === 0) {
            return;
        }

        // Overwrite the loading/placeholder state
        container.innerHTML = categoryProducts.map(product => {
            const salePrice = Number(product.salePrice) || 0;
            const originalPrice = Number(product.originalPrice) || 0;

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
        }).join('');
    });

    // Re-attach add to cart event listeners
    if (typeof window.attachCartListeners === 'function') {
        window.attachCartListeners();
    }
}

// Global listener for Real-time Updates from Firestore
let productsListener = null;

function setupProductsListener() {
    console.log('Setting up real-time product listener...');

    if (productsListener) productsListener();

    productsListener = productsCollection.onSnapshot((snapshot) => {
        const products = [];
        snapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });

        console.log('Products updated from Firestore:', products.length);
        renderProducts(products);
    }, (error) => {
        console.error("Error listening to products:", error);
    });
}

// Initial Load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('TEYRAA HOROLOGY - Initializing Products...');

    // Migration logic (keeping it safe but cleaning up keys)
    const localProducts = JSON.parse(localStorage.getItem('teyraaProducts') || '[]');
    if (localProducts.length > 0) {
        const snapshot = await productsCollection.get();
        if (snapshot.empty) {
            console.log("Migrating products to Firestore...");
            for (const product of localProducts) {
                const { id, ...rest } = product;
                await productsCollection.add(rest);
            }
            localStorage.removeItem('teyraaProducts');
            localStorage.removeItem('patelProducts'); // Cleanup dead keys
        }
    }

    setupProductsListener();
});

