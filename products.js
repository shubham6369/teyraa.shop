// ===== DYNAMIC PRODUCT LOADER FOR MAIN WEBSITE WITH FIREBASE =====

// Function to render products by category
function renderProducts(products) {
    const categories = ['Teyraa Special', 'Jeans', 'Jacket', 'COMBOES'];
    const containerIds = {
        'Teyraa Special': 'teyraaSpecialGrid',
        'Jeans': 'jeansGrid',
        'Jacket': 'jacketGrid',
        'COMBOES': 'comboesGrid'
    };

    console.log('Total products from Firestore:', products.length);

    categories.forEach(category => {
        const container = document.getElementById(containerIds[category]);
        if (!container) return;

        // Case-insensitive filtering
        const categoryProducts = products.filter(p => {
            const prodCat = (p.category || '').toLowerCase().trim();
            const targetCat = category.toLowerCase().trim();

            if (targetCat === 'teyraa special') {
                return prodCat === 'teyraa special' || prodCat === 'patel special';
            }
            return prodCat === targetCat;
        });

        console.log(`[${category}] Matching products:`, categoryProducts.length);

        if (categoryProducts.length === 0) {
            // Keep hardcoded products if none in Firestore for this category
            // container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No products available in this category</p>';
            return;
        }

        // If we have Firestore products, overwrite the hardcoded ones
        container.innerHTML = categoryProducts.map(product => {
            const salePrice = Number(product.salePrice) || 0;
            const originalPrice = Number(product.originalPrice) || 0;

            return `
                <div class="product-card">
                    <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy" onerror="this.src='https://via.placeholder.com/400x500?text=Image+Not+Found'">
                    <div class="product-info">
                        <h3>${product.name}</h3>
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

    // Unsubscribe if exists
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
    console.log('teyraa.shop - Initializing Firebase Products...');

    // Check if we need to migrate from localStorage (only once)
    const localProducts = JSON.parse(localStorage.getItem('teyraaProducts') || localStorage.getItem('patelProducts') || '[]');
    if (localProducts.length > 0) {
        const snapshot = await productsCollection.get();
        if (snapshot.empty) {
            console.log("Migrating localStorage products to Firestore...");
            for (const product of localProducts) {
                const { id, ...rest } = product;
                await productsCollection.add(rest);
            }
            // Clear localStorage migration flags
            localStorage.removeItem('teyraaProducts');
            localStorage.removeItem('patelProducts');
        }
    }

    // Start real-time listener
    setupProductsListener();
});

