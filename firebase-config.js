// Firebase Configuration for teyraa.shop
// ✅ Connected to teyraa-bc405 Firebase project

const firebaseConfig = {
    apiKey: "AIzaSyBniCoBnusKo6LnT4iDR3Kk-XVi3s0_sOQ",
    authDomain: "teyraa-bc405.firebaseapp.com",
    projectId: "teyraa-bc405",
    storageBucket: "teyraa-bc405.firebasestorage.app",
    messagingSenderId: "401973315142",
    appId: "1:401973315142:web:07b9e4b39601759ac1ac47",
    measurementId: "G-HMRMXHMYRD"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Initialize Auth
const auth = firebase.auth();

// Collections references
const productsCollection = db.collection('products');
const ordersCollection = db.collection('orders');
const settingsCollection = db.collection('settings');

console.log('🔥 Firebase initialized successfully for teyraa.shop!');
