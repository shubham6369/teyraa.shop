// ===== ADMIN PANEL JAVASCRIPT WITH FIREBASE =====

// Initialize default products if localStorage is empty
function initializeDefaultProducts() {
    if (!localStorage.getItem('teyraaProducts')) {
        const defaultProducts = [
            {
                id: 1,
                name: 'Heritage Chronograph',
                category: 'Heritage',
                salePrice: 125000,
                originalPrice: 150000,
                image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=800'
            },
            {
                id: 2,
                name: 'Skyline Moonphase',
                category: 'Complication',
                salePrice: 245000,
                originalPrice: 310000,
                image: 'https://images.unsplash.com/photo-1619134778706-7015533a6150?q=80&w=800'
            },
            {
                id: 3,
                name: 'Precision Master-II',
                category: 'Chronograph',
                salePrice: 185000,
                originalPrice: 220000,
                image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800'
            },
            {
                id: 4,
                name: 'Pure Minimalism Silk',
                category: 'Minimalist',
                salePrice: 75000,
                originalPrice: 95000,
                image: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ad5?q=80&w=800'
            }
        ];

        localStorage.setItem('teyraaProducts', JSON.stringify(defaultProducts));
    }
}

// Initialize on page load
initializeDefaultProducts();

// ===== LOGIN FUNCTIONALITY WITH FIREBASE AUTH =====
const loginForm = document.getElementById('loginForm');
const loginScreen = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');

// Security Check: Verify admin against Firestore 'admins' collection
async function isAuthorizedAdmin(email) {
    try {
        const adminDoc = await db.collection('admins').doc(email).get();
        if (adminDoc.exists) return true;

        // Fallback for first-time setup: If collection is empty, allow primary admin and seed the DB
        const allowedAdmins = ['admin@teyraa.shop', 'shubham67257@gmail.com', 'shubham6369@gmail.com'];

        if (allowedAdmins.includes(email)) {
            try {
                const snapshot = await db.collection('admins').get();
                if (snapshot.empty) {
                    await db.collection('admins').doc(email).set({
                        role: 'super-admin',
                        addedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    return true;
                }
            } catch (seedError) {
                // If we get a permission denied here, it means the Firestore rules are blocking
                // even the first time setup.
                console.error("Could not seed initial admin due to Firestore Rules.", seedError);
                if (seedError.code === 'permission-denied') {
                    showLoginError('Firestore Rules Error: You need to update your Firestore security rules to allow the first admin. Check FIREBASE_SETUP_GUIDE.md.');
                    return false;
                }
            }
        }
        return false;
    } catch (error) {
        console.error("Authorization check failed:", error);
        if (error.code === 'permission-denied') {
            const allowedAdmins = ['admin@teyraa.shop', 'shubham67257@gmail.com', 'shubham6369@gmail.com'];
            if (allowedAdmins.includes(email)) {
                showLoginError('First-time setup blocked by Firestore rules. Please update rules to allow initial admin login.');
            } else {
                showLoginError('Unauthorized! Access restricted to verified administrators.');
            }
        }
        return false;
    }
}

// Check if user is already logged in
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const authorized = await isAuthorizedAdmin(user.email);
        if (authorized) {
            console.log('Admin authorized:', user.email);
            loginScreen.style.display = 'none';
            adminDashboard.style.display = 'flex';
            loadProducts();
            setupOrdersListener();
            updateStats();
        } else {
            console.warn('Unauthorized access attempt:', user.email);
            auth.signOut();
            showLoginError('Unauthorized! Access restricted to verified administrators.');
        }
    } else {
        loginScreen.style.display = 'flex';
        adminDashboard.style.display = 'none';
    }
});

function showLoginError(message) {
    let errorMessage = document.getElementById('errorMessage');
    if (!errorMessage) {
        errorMessage = document.createElement('div');
        errorMessage.id = 'errorMessage';
        errorMessage.style.cssText = 'color: #f44336; background: #ffebee; padding: 0.75rem; border-radius: 4px; margin-top: 1rem; text-align: center; font-weight: 600;';
        loginForm.appendChild(errorMessage);
        setTimeout(() => errorMessage.remove(), 7000);
    }
    errorMessage.textContent = message;
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // Sign in with Firebase Authentication
        await auth.signInWithEmailAndPassword(email, password);
        // The onAuthStateChanged listener will handle the authorization check
    } catch (error) {
        console.error('Login error:', error);
        let message = 'Login failed. Please try again.';

        if (error.code === 'auth/user-not-found') {
            message = 'No user found with this email.';
        } else if (error.code === 'auth/wrong-password') {
            message = 'Incorrect password.';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Invalid email address.';
        } else if (error.code === 'auth/too-many-requests') {
            message = 'Too many failed attempts. Try again later.';
        }

        showLoginError(message);
    }
});

// Forgot Password Logic
const forgotPasswordLink = document.getElementById('forgotPassword');
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = document.getElementById('username').value;

        if (!email) {
            showLoginError('Please enter your email address first to reset your password.');
            return;
        }

        try {
            await auth.sendPasswordResetEmail(email);
            showNotification(`Password reset email sent to ${email}. Please check your inbox.`, "success");
        } catch (error) {
            console.error('Password reset error:', error);
            showLoginError('Failed to send reset email. Verify your email address is correct.');
        }
    });
}

// Logout functionality
function logout() {
    auth.signOut().then(() => {
        console.log('User logged out');
        loginScreen.style.display = 'flex';
        adminDashboard.style.display = 'none';
    }).catch((error) => {
        console.error('Logout error:', error);
    });
}

// Logout button
document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        logout();
    }
});

// ===== NAVIGATION =====
const navItems = document.querySelectorAll('.nav-item');
const sections = {
    'products': document.getElementById('productsSection'),
    'orders': document.getElementById('ordersSection'),
    'categories': document.getElementById('categoriesSection'),
    'stats': document.getElementById('statsSection'),
    'security': document.getElementById('securitySection')
};

const pageTitles = {
    'products': 'Product Management',
    'orders': 'Order Management',
    'categories': 'Category Management',
    'stats': 'Statistics Overview',
    'security': 'Security Management'
};

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = item.getAttribute('data-section');

        // Update active nav
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        // Update page title
        const titles = {
            'products': 'Product Management',
            'orders': 'Order Management',
            'categories': 'Category Management',
            'stats': 'Store Statistics',
            'security': 'Security Management'
        };
        document.getElementById('pageTitle').textContent = titles[sectionId];

        // Show selected section
        Object.values(sections).forEach(sec => sec.style.display = 'none');
        sections[sectionId].style.display = 'block';

        // Hide add buttons for irrelevant sections
        const addBtn = document.getElementById('addProductBtn');
        const addCatBtn = document.getElementById('addCategoryBtn');
        addBtn.style.display = sectionId === 'products' ? 'flex' : 'none';
        addCatBtn.style.display = sectionId === 'categories' ? 'flex' : 'none';

        // Update stats or categories or security if needed
        if (sectionId === 'stats') {
            updateDetailedStats();
        }

        if (sectionId === 'categories') {
            loadCategories();
        }

        if (sectionId === 'security') {
            loadAdmins();
        }
    });
});

// ===== PRODUCT MANAGEMENT =====
let currentEditId = null;

async function getProducts() {
    try {
        const snapshot = await productsCollection.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}

async function saveProducts(productData, id = null) {
    try {
        if (id) {
            await productsCollection.doc(id).set(productData);
        } else {
            await productsCollection.add(productData);
        }
        updateStats();
    } catch (error) {
        console.error("Error saving product:", error);
        let errorMsg = "Failed to save product";
        if (error.code === 'permission-denied') {
            errorMsg = "Unauthorized! Please login again or check Firebase rules.";
        }
        showNotification(errorMsg, "error");
    }
}

async function loadProducts(filter = 'all', search = '') {
    const products = await getProducts();
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';

    const filteredProducts = products.filter(product => {
        const matchesCategory = filter === 'all' || product.category === filter;
        const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filteredProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 3rem; color: #666;">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 1rem;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <p style="font-size: 1.1rem; font-weight: 600;">No products found</p>
                    <p style="color: #999; margin-top: 0.5rem;">Try adjusting your filters or add a new product</p>
                </td>
            </tr>
        `;
        return;
    }

    filteredProducts.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${product.image}" alt="${product.name}" class="product-image-cell"></td>
            <td class="product-name">${product.name}</td>
            <td><span class="category-badge">${product.category}</span></td>
            <td class="price">₹${product.salePrice.toLocaleString()}</td>
            <td class="original-price">₹${product.originalPrice.toLocaleString()}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editProduct('${product.id}')">Edit</button>
                    <button class="btn-delete" onclick="deleteProduct('${product.id}')">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Add Product Button
document.getElementById('addProductBtn').addEventListener('click', () => {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('previewImg').style.display = 'none';
    document.getElementById('previewPlaceholder').style.display = 'block';
    openModal();
});

// Modal Controls
const modal = document.getElementById('productModal');
const modalClose = document.querySelector('.modal-close');
const cancelBtn = document.querySelector('.btn-cancel');

function openModal() {
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

modalClose.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Image Preview
document.getElementById('productImage').addEventListener('input', (e) => {
    const url = e.target.value;
    const previewImg = document.getElementById('previewImg');
    const placeholder = document.getElementById('previewPlaceholder');

    if (url) {
        previewImg.src = url;
        previewImg.style.display = 'block';
        placeholder.style.display = 'none';

        previewImg.onerror = () => {
            previewImg.style.display = 'none';
            placeholder.style.display = 'block';
            placeholder.textContent = 'Invalid image URL';
        };
    } else {
        previewImg.style.display = 'none';
        placeholder.style.display = 'block';
        placeholder.textContent = 'Enter image URL to see preview';
    }
});

// Save Product
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const productData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        salePrice: parseInt(document.getElementById('productSalePrice').value),
        originalPrice: parseInt(document.getElementById('productOriginalPrice').value),
        image: document.getElementById('productImage').value,
        rating: parseInt(document.getElementById('productRating').value) || 5,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await saveProducts(productData, currentEditId);
    loadProducts();
    closeModal();

    // Show success message
    showNotification(currentEditId ? 'Product updated successfully!' : 'Product added successfully!', 'success');
});

// Edit Product
async function editProduct(id) {
    const doc = await productsCollection.doc(id.toString()).get();
    if (doc.exists) {
        const product = doc.data();
        currentEditId = id;
        document.getElementById('modalTitle').textContent = 'Edit Product';
        document.getElementById('productId').value = id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productSalePrice').value = product.salePrice;
        document.getElementById('productOriginalPrice').value = product.originalPrice;
        document.getElementById('productImage').value = product.image;
        document.getElementById('productRating').value = product.rating || 5;

        // Show preview
        const previewImg = document.getElementById('previewImg');
        previewImg.src = product.image;
        previewImg.style.display = 'block';
        document.getElementById('previewPlaceholder').style.display = 'none';

        openModal();
    }
}

// Delete Product
async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            await productsCollection.doc(id.toString()).delete();
            loadProducts();
            showNotification('Product deleted successfully!', 'error');
        } catch (error) {
            console.error("Error deleting product:", error);
            let errorMsg = "Failed to delete product";
            if (error.code === 'permission-denied') {
                errorMsg = "Unauthorized! Please login again or check Firebase rules.";
            }
            showNotification(errorMsg, "error");
        }
    }
}

// Make functions global
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;

// Search and Filter
document.getElementById('searchProducts').addEventListener('input', (e) => {
    const search = e.target.value;
    const filter = document.getElementById('filterCategory').value;
    loadProducts(filter, search);
});

document.getElementById('filterCategory').addEventListener('change', (e) => {
    const filter = e.target.value;
    const search = document.getElementById('searchProducts').value;
    loadProducts(filter, search);
});

// ===== STATISTICS =====
async function updateStats() {
    const products = await getProducts();

    // Update total products
    document.getElementById('totalProducts').textContent = products.length;

    // Update last updated
    const now = new Date();
    document.getElementById('lastUpdated').textContent = now.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric'
    });
}

async function updateCategoryCounts() {
    const products = await getProducts();
    const categoriesSnapshot = await categoriesCollection.get();
    const categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const counts = {};
    products.forEach(product => {
        counts[product.category] = (counts[product.category] || 0) + 1;
    });

    // If categories grid is visible, it will be updated by renderCategories
    // This function can also update a general stats overview
    if (document.getElementById('totalCategories')) {
        document.getElementById('totalCategories').textContent = categories.length;
    }
}

async function updateDetailedStats() {
    const products = await getProducts();
    if (products.length === 0) return;

    // Category breakdown
    const categoryStats = {};
    products.forEach(product => {
        categoryStats[product.category] = (categoryStats[product.category] || 0) + 1;
    });

    const categoryStatsDiv = document.getElementById('categoryStats');
    if (categoryStatsDiv) {
        categoryStatsDiv.innerHTML = '';
        Object.entries(categoryStats).forEach(([category, count]) => {
            const item = document.createElement('div');
            item.className = 'stat-item';
            item.innerHTML = `
                <span class="stat-label">${category || 'Uncategorized'}</span>
                <span class="stat-value">${count}</span>
            `;
            categoryStatsDiv.appendChild(item);
        });
    }

    // Price statistics (filtering out invalid prices)
    const prices = products.map(p => Number(p.salePrice)).filter(p => !isNaN(p));
    if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

        const priceStatsDiv = document.getElementById('priceStats');
        if (priceStatsDiv) {
            priceStatsDiv.innerHTML = `
                <div class="stat-item">
                    <span class="stat-label">Minimum Price</span>
                    <span class="stat-value">₹${minPrice.toLocaleString()}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Maximum Price</span>
                    <span class="stat-value">₹${maxPrice.toLocaleString()}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Average Price</span>
                    <span class="stat-value">₹${avgPrice.toLocaleString()}</span>
                </div>
            `;
        }
    }
}

// ===== CATEGORY MANAGEMENT =====
const categoryModal = document.getElementById('categoryModal');
const categoryForm = document.getElementById('categoryForm');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const categoriesGrid = document.getElementById('categoriesGrid');

addCategoryBtn.addEventListener('click', () => {
    document.getElementById('categoryModalTitle').textContent = 'Add New Category';
    document.getElementById('editCategoryId').value = '';
    categoryForm.reset();
    categoryModal.classList.add('active');
});

function closeCategoryModal() {
    categoryModal.classList.remove('active');
}

categoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editCategoryId').value;
    const categoryData = {
        name: document.getElementById('categoryName').value,
        image: document.getElementById('categoryImage').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        if (id) {
            await categoriesCollection.doc(id).update(categoryData);
        } else {
            await categoriesCollection.add(categoryData);
        }
        showNotification(id ? 'Category updated!' : 'Category added!', 'success');
        closeCategoryModal();
        loadCategories();
    } catch (error) {
        console.error("Error saving category:", error);
        showNotification("Failed to save category", "error");
    }
});

async function loadCategories() {
    try {
        const snapshot = await categoriesCollection.orderBy('createdAt', 'desc').get();
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderCategories(categories);
        populateCategoryDropdowns(categories);
        updateCategoryStatus(categories);
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

async function renderCategories(categories) {
    if (!categoriesGrid) return;
    categoriesGrid.innerHTML = '';

    const products = await getProducts();

    categories.forEach(category => {
        const count = products.filter(p => p.category === category.name).length;
        const card = document.createElement('div');
        card.className = 'category-manage-card';
        card.innerHTML = `
            <img src="${category.image}" alt="${category.name}" onerror="this.src='https://via.placeholder.com/400x300?text=Category'">
            <h3>${category.name}</h3>
            <p class="category-count">${count} products</p>
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                <button class="btn-edit-category" onclick="editCategory('${category.id}', '${category.name}', '${category.image}')" style="flex: 1;">Edit</button>
                <button class="btn-delete-category" onclick="deleteCategory('${category.id}')" style="background: #fee2e2; color: #ef4444; border: none; padding: 0.5rem; border-radius: 6px; cursor: pointer;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;
        categoriesGrid.appendChild(card);
    });
}

function editCategory(id, name, image) {
    document.getElementById('categoryModalTitle').textContent = 'Edit Category';
    document.getElementById('editCategoryId').value = id;
    document.getElementById('categoryName').value = name;
    document.getElementById('categoryImage').value = image;
    categoryModal.classList.add('active');
}

async function deleteCategory(id) {
    if (confirm('Are you sure you want to delete this category? Products in this category will not be deleted but will have no category.')) {
        try {
            await categoriesCollection.doc(id).delete();
            showNotification('Category deleted!', 'success');
            loadCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
            showNotification("Failed to delete category", "error");
        }
    }
}

function populateCategoryDropdowns(categories) {
    const filterSelect = document.getElementById('filterCategory');
    const productSelect = document.getElementById('productCategory');

    if (filterSelect) {
        const currentFilter = filterSelect.value;
        filterSelect.innerHTML = '<option value="all">All Categories</option>';
        categories.forEach(cat => {
            filterSelect.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
        });
        filterSelect.value = currentFilter;
    }

    if (productSelect) {
        const currentVal = productSelect.value;
        productSelect.innerHTML = '<option value="">Select Category</option>';
        categories.forEach(cat => {
            productSelect.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
        });
        productSelect.value = currentVal;
    }
}

function updateCategoryStatus(categories) {
    if (document.getElementById('totalCategories')) {
        document.getElementById('totalCategories').textContent = categories.length;
    }
}

window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.closeCategoryModal = closeCategoryModal;

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#4caf50' : '#f44336'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add animations to document
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Real-time Orders Listener
let ordersListener = null;
let currentOrders = [];

function setupOrdersListener() {
    console.log('Setting up real-time orders listener...');

    if (ordersListener) ordersListener();

    ordersListener = ordersCollection.orderBy('orderDate', 'desc').onSnapshot((snapshot) => {
        currentOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Orders updated:', currentOrders.length);

        // Refresh the current view
        const search = document.getElementById('searchOrders')?.value || '';
        const filter = document.getElementById('filterOrders')?.value || 'all';
        renderOrders(currentOrders, filter, search);
        updateOrderStats(currentOrders);
    }, (error) => {
        console.error("Order listener error:", error);
    });
}

function loadOrders(filter = 'all', search = '') {
    renderOrders(currentOrders, filter, search);
}

function renderOrders(orders, filter = 'all', search = '') {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const filteredOrders = orders.filter(order => {
        const matchesStatus = filter === 'all' || order.status === filter;
        const matchesSearch =
            (order.orderId && order.orderId.toLowerCase().includes(search.toLowerCase())) ||
            (order.customer && order.customer.name.toLowerCase().includes(search.toLowerCase())) ||
            (order.customer && order.customer.email.toLowerCase().includes(search.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    if (filteredOrders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align: center; padding: 3rem; color: #666;">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 1rem;">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                    <p style="font-size: 1.1rem; font-weight: 600;">No orders found</p>
                    <p style="color: #999; margin-top: 0.5rem;">Orders will appear here when customers place them</p>
                </td>
            </tr>
        `;
        return;
    }

    // Sort orders by date (newest first)
    filteredOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    filteredOrders.forEach(order => {
        const orderDate = new Date(order.orderDate);
        const formattedDate = orderDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        const productList = order.items.map(item => item.name).join(', ');
        const productCount = order.items.length;
        const location = `${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}`;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${order.orderId}</strong></td>
            <td>${formattedDate}</td>
            <td>${order.customer.name}</td>
            <td>${order.customer.mobile}</td>
            <td><small>${order.customer.email}</small></td>
            <td><small>${location}</small></td>
            <td><small style="max-width: 200px; display: inline-block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${productList}">${productCount} item(s)</small></td>
            <td class="price">₹${order.totalAmount.toLocaleString()}</td>
            <td>
                <span class="category-badge" style="background: ${order.paymentStatus === 'Paid' ? '#4CAF50' : '#FF9800'};">
                    ${order.paymentMethod} - ${order.paymentStatus}
                </span>
            </td>
            <td>
                <select class="order-status-select" data-order-id="${order.id}" style="padding: 0.4rem; border-radius: 4px; border: 1px solid #ddd;">
                    <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                    <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td>
                <button class="btn-edit" onclick="viewOrderDetails('${order.id}')">View</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Attach status change listeners
    document.querySelectorAll('.order-status-select').forEach(select => {
        select.addEventListener('change', (e) => {
            updateOrderStatus(e.target.dataset.orderId, e.target.value);
        });
    });
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        await ordersCollection.doc(orderId).update({ status: newStatus });
        showNotification(`Order ${orderId} status updated to ${newStatus}`, 'success');
        updateOrderStats();
    } catch (error) {
        console.error("Error updating order status:", error);
        showNotification("Failed to update status", "error");
    }
}

async function viewOrderDetails(orderId) {
    const doc = await ordersCollection.doc(orderId).get();
    if (!doc.exists) return;
    const order = doc.data();
    order.orderId = doc.id; // Ensure orderId is present

    const orderDate = new Date(order.orderDate).toLocaleString('en-IN');
    const productsHtml = order.items.map(item => `
        <div style="display: flex; gap: 1rem; align-items: center; padding: 0.5rem; background: #f5f5f5; border-radius: 4px; margin-bottom: 0.5rem;">
            <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
            <div style="flex: 1;">
                <strong>${item.name}</strong>
                <p style="margin: 0; color: #666;">${item.price}</p>
            </div>
        </div>
    `).join('');

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>Order Details</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div style="padding: 1.5rem;">
                <div style="margin-bottom: 1.5rem;">
                    <h3 style="margin-bottom: 0.5rem; color: #667eea;">Order Information</h3>
                    <p><strong>Order ID:</strong> ${order.orderId}</p>
                    <p><strong>Date:</strong> ${orderDate}</p>
                    <p><strong>Status:</strong> <span class="category-badge">${order.status}</span></p>
                    <p><strong>Payment:</strong> ${order.paymentMethod} - ${order.paymentStatus}</p>
                    <p><strong>Total Amount:</strong> ₹${order.totalAmount.toLocaleString()}</p>
                </div>

                <div style="margin-bottom: 1.5rem;">
                    <h3 style="margin-bottom: 0.5rem; color: #667eea;">Customer Information</h3>
                    <p><strong>Name:</strong> ${order.customer.name}</p>
                    <p><strong>Mobile:</strong> ${order.customer.mobile}</p>
                    <p><strong>Email:</strong> ${order.customer.email}</p>
                    <p><strong>Address:</strong> ${order.customer.address}</p>
                    <p><strong>City:</strong> ${order.customer.city}</p>
                    <p><strong>State:</strong> ${order.customer.state}</p>
                    <p><strong>Pincode:</strong> ${order.customer.pincode}</p>
                </div>

                <div>
                    <h3 style="margin-bottom: 0.5rem; color: #667eea;">Products Ordered</h3>
                    ${productsHtml}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

async function updateOrderStats(ordersInput = null) {
    const orders = ordersInput || currentOrders || [];

    if (document.getElementById('totalOrders')) document.getElementById('totalOrders').textContent = orders.length;
    if (document.getElementById('pendingOrders')) document.getElementById('pendingOrders').textContent = orders.filter(o => o.status === 'Pending').length;

    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    if (document.getElementById('totalRevenue')) document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toLocaleString()}`;
}

// Make functions global
window.viewOrderDetails = viewOrderDetails;

// Navigation handler for orders section
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        const section = item.dataset.section;
        if (section === 'orders') {
            loadOrders();
            updateOrderStats();
        }
    });
});

// Search and Filter for Orders
const searchOrdersInput = document.getElementById('searchOrders');
const filterOrderStatus = document.getElementById('filterOrderStatus');

if (searchOrdersInput) {
    searchOrdersInput.addEventListener('input', (e) => {
        const search = e.target.value;
        const filter = filterOrderStatus.value;
        loadOrders(filter, search);
    });
}

if (filterOrderStatus) {
    filterOrderStatus.addEventListener('change', (e) => {
        const filter = e.target.value;
        const search = searchOrdersInput.value;
        loadOrders(filter, search);
    });
}

// Cleanup legacy clothing products
async function cleanupLegacyProducts() {
    console.log('🏛️ TEYRAA HOROLOGY - Checking for legacy inventory...');
    const watchCategories = ['Heritage', 'Chronograph', 'Complication', 'Minimalist'];
    const products = await getProducts();

    const legacyProducts = products.filter(p => !watchCategories.includes(p.category));

    if (legacyProducts.length > 0) {
        console.warn(`🧹 Purging ${legacyProducts.length} legacy items...`);
        for (const product of legacyProducts) {
            await productsCollection.doc(product.id).delete();
            console.log(`- Removed: ${product.name} (${product.category})`);
        }
        showNotification(`Purged ${legacyProducts.length} legacy clothing items.`, "warning");
        loadProducts();
    }
}

// ===== SEEDING 100 LUXURY WATCHES =====
async function seed100Watches() {
    if (!confirm('Are you sure you want to add 100 luxury watches to the database? This will significantly expand your inventory.')) return;

    showNotification("Initializing Master Inventory...", "warning");

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

    let count = 0;
    for (let i = 0; i < 100; i++) {
        const prefix = watchPrefixes[Math.floor(Math.random() * watchPrefixes.length)];
        const suffix = watchSuffixes[Math.floor(Math.random() * watchSuffixes.length)];
        const category = watchCategories[Math.floor(Math.random() * watchCategories.length)];
        const image = `${watchImages[Math.floor(Math.random() * watchImages.length)]}?q=80&w=800&auto=format&fit=crop`;

        const salePrice = Math.floor(Math.random() * (1200000 - 45000 + 1)) + 45000;
        const orgPrice = salePrice + Math.floor(Math.random() * 50000) + 10000;
        const rating = Math.random() > 0.3 ? 5 : 4;

        const productData = {
            name: `${prefix} ${suffix} ${i + 1}`,
            category: category,
            salePrice: salePrice,
            originalPrice: orgPrice,
            image: image,
            rating: rating,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await productsCollection.add(productData);
        count++;
        if (count % 20 === 0) console.log(`Seeded ${count} watches...`);
    }

    showNotification(`Successfully seeded 100 luxury timepieces!`, "success");
    loadProducts();
}

// Attach to window for the hidden action
window.seed100Watches = seed100Watches;

// Initialize on load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Admin Panel Loaded');

    // Migration check: If Firestore is empty but localStorage has products, sync them
    const firestoreProducts = await getProducts();
    if (firestoreProducts.length === 0) {
        const localProducts = JSON.parse(localStorage.getItem('teyraaProducts') || '[]');
        if (localProducts.length > 0) {
            console.log("Syncing localStorage products to Firestore...");
            for (const product of localProducts) {
                // Remove the local ID and let Firestore generate one
                const { id, ...rest } = product;
                await productsCollection.add(rest);
            }
            loadProducts();
        }
    }

    // Always check for legacy products on admin load to keep DB clean
    cleanupLegacyProducts();

    loadCategories();
    updateOrderStats();
});

// ===== SECURITY & ADMIN MANAGEMENT =====
async function loadAdmins() {
    const adminList = document.getElementById('adminList');
    const adminCount = document.getElementById('adminCount');
    if (!adminList) return;

    adminList.innerHTML = '<p style="color: var(--text-dim);">Loading operators...</p>';

    try {
        const snapshot = await db.collection('admins').orderBy('addedAt', 'desc').get();
        adminList.innerHTML = '';
        adminCount.textContent = snapshot.size;

        snapshot.forEach(doc => {
            const data = doc.data();
            const email = doc.id;
            const isSelf = auth.currentUser.email === email;

            const div = document.createElement('div');
            div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid var(--glass-border); background: rgba(255,255,255,0.02); margin-bottom: 0.5rem; border-radius: var(--radius-sm);';
            div.innerHTML = `
                <div>
                    <p style="color: white; font-weight: 500; font-size: 0.9rem;">${email} ${isSelf ? '<span style="color: var(--accent-gold); font-size: 0.7rem; margin-left: 0.5rem; border: 1px solid var(--accent-gold); padding: 2px 6px; border-radius: 4px;">YOU</span>' : ''}</p>
                    <small style="color: var(--text-dim); text-transform: uppercase; font-size: 0.65rem; letter-spacing: 1px;">Added: ${data.addedAt ? new Date(data.addedAt.seconds * 1000).toLocaleDateString() : 'Original'}</small>
                </div>
                ${!isSelf ? `<button onclick="removeAdmin('${email}')" class="btn-delete" style="padding: 0.5rem 1rem; font-size: 0.7rem;">Revoke Access</button>` : ''}
            `;
            adminList.appendChild(div);
        });
    } catch (error) {
        console.error("Error loading admins:", error);
        adminList.innerHTML = '<p style="color: #ff4d4d; padding: 1rem;">Failed to load administrators. Check permissions.</p>';
    }
}

const addAdminForm = document.getElementById('addAdminForm');
if (addAdminForm) {
    addAdminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('newAdminEmail').value.trim().toLowerCase();

        if (!email) return;

        try {
            await db.collection('admins').doc(email).set({
                role: 'admin',
                addedBy: auth.currentUser.email,
                addedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            showNotification(`${email} successfully authorized!`, "success");
            document.getElementById('newAdminEmail').value = '';
            loadAdmins();
        } catch (error) {
            console.error("Error adding admin:", error);
            showNotification("Optimization failed. Only super-admins can authorize new staff.", "error");
        }
    });
}

async function removeAdmin(email) {
    if (!confirm(`Are you sure you want to revoke access for ${email}? This action is immediate.`)) return;

    try {
        await db.collection('admins').doc(email).delete();
        showNotification(`Access revoked for ${email}`, "warning");
        loadAdmins();
    } catch (error) {
        console.error("Error removing admin:", error);
        showNotification("Failed to revoke access.", "error");
    }
}

window.removeAdmin = removeAdmin;
window.loadAdmins = loadAdmins;
