// ===== DYNAMIC PRODUCT LOADER FOR MAIN WEBSITE WITH FIREBASE =====

// Function to render products by category
function renderProducts(products) {
    const categories = ['Patel Special', 'Jeans', 'Jacket', 'COMBOES'];
    const containerIds = {
        'Patel Special': 'patelSpecialGrid',
        'Jeans': 'jeansGrid',
        'Jacket': 'jacketGrid',
        'COMBOES': 'comboesGrid'
    };

    categories.forEach(category => {
        const container = document.getElementById(containerIds[category]);
        if (!container) return;

        const categoryProducts = products.filter(p => p.category === category);

        if (categoryProducts.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No products available in this category</p>';
            return;
        }

        container.innerHTML = categoryProducts.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-price">
                        <span class="price-sale">₹${product.salePrice.toLocaleString()}</span>
                        <span class="price-original">₹${product.originalPrice.toLocaleString()}</span>
                    </div>
                    <button class="btn-add-to-cart">Add to Cart</button>
                </div>
            </div>
        `).join('');
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
    console.log('patel.store - Initializing Firebase Products...');

    // Check if we need to migrate from localStorage (only once)
    const localProducts = JSON.parse(localStorage.getItem('patelProducts') || '[]');
    if (localProducts.length > 0) {
        const snapshot = await productsCollection.get();
        if (snapshot.empty) {
            console.log("Migrating localStorage products to Firestore...");
            for (const product of localProducts) {
                const { id, ...rest } = product;
                await productsCollection.add(rest);
            }
            // Clear localStorage migration flag
            localStorage.removeItem('patelProducts');
        }
    }

    // Start real-time listener
    setupProductsListener();
});

