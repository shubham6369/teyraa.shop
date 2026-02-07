// Razorpay Configuration for teyraa.shop
// Replace with your actual Razorpay credentials after setup

const razorpayConfig = {
    // Test Mode Keys (for development)
    test: {
        keyId: "YOUR_TEST_KEY_ID",
        keySecret: "YOUR_TEST_KEY_SECRET"
    },

    // Live Mode Keys (for production)
    live: {
        keyId: "YOUR_LIVE_KEY_ID",
        keySecret: "YOUR_LIVE_KEY_SECRET"
    },

    // Current mode: 'test' or 'live'
    mode: 'test',

    // Store details
    businessName: "teyraa.shop",
    logo: "https://your-logo-url.com/logo.png", // Update with your logo
    theme: {
        color: "#667eea" // Your brand color
    }
};

// Get active keys based on mode
function getRazorpayKey() {
    return razorpayConfig.mode === 'live'
        ? razorpayConfig.live.keyId
        : razorpayConfig.test.keyId;
}

console.log('💳 Razorpay config loaded - Mode:', razorpayConfig.mode);
