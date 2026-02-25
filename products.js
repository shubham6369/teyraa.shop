/**
 * TEYRAA HOROLOGY - DATA ARCHIVE
 * Handles: Real-time Firestore Syncing, Story Seeding, and Advanced Filtering
 */

let allProductsArchive = [];

// --- CLOUD ARCHIVE CONNECTORS ---

/**
 * Renders a single masterpiece card with storytelling focus
 */
function createMasterpieceCard(product) {
    const salePrice = Number(product.salePrice) || 0;

    return `
        <div class="chapter-card reveal">
            <div class="chapter-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x500?text=The+Lost+Reference'">
                <div style="position: absolute; bottom: 1rem; left: 1rem; z-index: 10;">
                    <button onclick="addToCart('${product.id}', '${product.name}', ${salePrice}, '${product.image}')" 
                            style="background: white; color: black; border: none; padding: 0.6rem 1rem; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; border-radius: 2px;">
                        Secure
                    </button>
                </div>
            </div>
            <div class="chapter-info">
                <h3>${product.name}</h3>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.65rem; opacity: 0.6;">${product.category}</span>
                    <span style="font-weight: 600; font-variant-numeric: tabular-nums;">₹${salePrice.toLocaleString('en-IN')}</span>
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
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted); padding: 4rem;">The archive is currently silent. Re-aligning chronometers...</p>`;
        return;
    }

    container.innerHTML = products.map(createMasterpieceCard).join('');

    // Trigger reveals for newly added cards
    setTimeout(() => {
        const newReveals = container.querySelectorAll('.reveal');
        newReveals.forEach(el => el.classList.add('active'));
    }, 100);
}

/**
 * Utility: Filter by category dots or links
 */
window.filterByDot = function (category, element) {
    let filtered;
    if (category === 'all') {
        filtered = allProductsArchive;
    } else {
        filtered = allProductsArchive.filter(p => (p.category || '').trim() === category);
    }
    distributeMasterpieces(filtered);

    // Smooth scroll to display findings
    const grid = document.getElementById('collection-grid');
    if (grid) grid.scrollIntoView({ behavior: 'smooth' });
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
                name: "Elysian Chronograph Zero",
                category: "Chronograph",
                salePrice: 1250000,
                originalPrice: 1500000,
                image: "https://images.unsplash.com/photo-1619134778706-7015533a6150",
                story: "The absolute silence of mechanical perfection."
            },
            {
                name: "Heritage Sovereign Rose",
                category: "Heritage",
                salePrice: 850000,
                originalPrice: 950000,
                image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa",
                story: "A tribute to the monarchs of old."
            },
            {
                name: "Zenith Moonphase Nocturne",
                category: "Complication",
                salePrice: 650000,
                originalPrice: 720000,
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
                story: "Navigation by the stars, on your wrist."
            },
            {
                name: "Obsidian Skeleton X",
                category: "Minimalist",
                salePrice: 420000,
                originalPrice: 480000,
                image: "https://images.unsplash.com/photo-1509048191080-d2984bad6ad5",
                story: "Transparency is the ultimate form of complexity."
            },
            {
                name: "Imperial GMT Master",
                category: "Heritage",
                salePrice: 320000,
                originalPrice: 380000,
                image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3",
                story: "Tracking time across the horizons of progress."
            },
            {
                name: "Aero Precision Pilot",
                category: "Chronograph",
                salePrice: 285000,
                originalPrice: 310000,
                image: "https://images.unsplash.com/photo-1548171916-042bdc6b5ad7",
                story: "Built for those who navigate the skies."
            },
            {
                name: "Stellar Tourbillon",
                category: "Complication",
                salePrice: 1850000,
                originalPrice: 2100000,
                image: "https://images.unsplash.com/photo-1622434641406-a15812345ad1",
                story: "Defying gravity with every oscillation."
            },
            {
                name: "Vantage Ultra-Thin",
                category: "Minimalist",
                salePrice: 185000,
                originalPrice: 210000,
                image: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7",
                story: "The elegance of absolute reduction."
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
