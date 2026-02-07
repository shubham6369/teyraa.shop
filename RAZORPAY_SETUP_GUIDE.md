# 💳 Razorpay Payment Gateway Setup Guide

## Overview
This guide will help you integrate Razorpay payment gateway into teyraa.shop to accept real payments from customers.

---

## Step 1: Create Razorpay Account (5 minutes)

### 1.1 Sign Up
👉 Go to: https://dashboard.razorpay.com/signup

Fill in:
- **Email:** Your email address
- **Mobile Number:** Your phone number (will receive OTP)
- **Password:** Create a strong password

Click **"Sign Up"**

### 1.2 Verify Email & Mobile
- Check email for verification link
- Enter OTP sent to mobile
- Complete verification

### 1.3 Business Details
Fill in your business information:
- **Business Name:** teyraa.shop
- **Business Type:** Proprietorship / Partnership / Company
- **Category:** Fashion & Lifestyle
- **Sub-category:** Clothing & Accessories

---

## Step 2: Complete KYC (Required for Live Mode)

⚠️ **For Test Mode:** Skip this, proceed to Step 3  
⚠️ **For Live Mode:** Complete KYC to accept real payments

### Documents Needed:
- PAN Card
- Business proof (if applicable)
- Bank account details

**KYC Review Time:** 24-48 hours

---

## Step 3: Get API Keys (2 minutes)

### 3.1 Access Test Mode Keys
1. Login to Razorpay Dashboard: https://dashboard.razorpay.com/
2. Click on **"Settings"** (gear icon, left sidebar)
3. Click on **"API Keys"** under "Website and app settings"
4. You'll see **"Test Mode"** section at the top
5. Click **"Generate Test Keys"** (if not already generated)

### 3.2 Copy Test Keys
You'll get:
- **Key ID:** Starts with `rzp_test_...`
- **Key Secret:** Click "🔑 Show" to reveal, then copy

**⚠️ IMPORTANT:** Keep Key Secret confidential!

### Example:
```
Key ID: rzp_test_1234567890abcd
Key Secret: abcdefgh1234567890ABCDEF
```

### 3.3 Update razorpay-config.js
Open `razorpay-config.js` and replace:

```javascript
test: {
    keyId: "YOUR_TEST_KEY_ID",        // Replace with your actual test key
    keySecret: "YOUR_TEST_KEY_SECRET"  // Replace with your actual test secret
}
```

With your actual keys:

```javascript
test: {
    keyId: "rzp_test_1234567890abcd",
    keySecret: "abcdefgh1234567890ABCDEF"
}
```

---

## Step 4: Test Payment Integration (3 minutes)

### 4.1 Test Cards (For Testing)
Razorpay provides test cards that always succeed:

**Successful Payment:**
- **Card Number:** 4111 1111 1111 1111
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **Name:** Any name

**Failed Payment (to test failure):**
- **Card Number:** 4000 0000 0000 0002

**UPI Testing:**
- **UPI ID:** success@razorpay
- **UPI ID (failure):** failure@razorpay

### 4.2 Test on Your Website
1. Open `index.html`
2. Add items to cart
3. Proceed to checkout
4. Click "Pay with Razorpay"
5. Use test card details above
6. Payment should succeed!

---

## Step 5: Enable Live Mode (When Ready for Production)

⚠️ **Do this only when:**
- You've tested thoroughly
- KYC is approved
- You're ready to accept real payments

### 5.1 Generate Live Keys
1. Toggle to **"Live Mode"** in Razorpay Dashboard (top-right)
2. Go to Settings → API Keys
3. Click **"Generate Live Keys"**
4. Copy Key ID and Key Secret

### 5.2 Update razorpay-config.js
```javascript
live: {
    keyId: "rzp_live_YOUR_ACTUAL_KEY",
    keySecret: "YOUR_ACTUAL_SECRET"
},
mode: 'live'  // Change from 'test' to 'live'
```

---

## Step 6: Configure Webhooks (Optional but Recommended)

Webhooks notify you when payments succeed/fail.

### 6.1 Setup Webhook
1. Go to Settings → Webhooks
2. Click **"Add New Webhook"**
3. **Webhook URL:** Your server URL (if you have one)
   - Example: `https://yourwebsite.com/webhook`
4. **Events:** Select:
   - ✅ payment.authorized
   - ✅ payment.captured
   - ✅ payment.failed
5. **Secret:** Generate and save (use in backend)

⚠️ **Note:** Webhooks require a backend server. For Firebase, you can use Cloud Functions.

---

## Payment Flow Explanation

### Customer Side:
1. Customer adds products to cart
2. Fills checkout form (name, email, address)
3. Clicks "Place Order & Pay"
4. Razorpay popup opens
5. Customer selects payment method:
   - UPI (Google Pay, PhonePe, Paytm)
   - Cards (Debit/Credit)
   - Net Banking
   - Wallets
6. Completes payment
7. Order confirmed!

### Admin Side:
1. Order appears in admin panel
2. Payment status shows "Success" or "Failed"
3. Payment ID recorded
4. Customer details captured
5. You can fulfill the order!

---

## Payment Methods Supported

### ✅ UPI
- Google Pay
- PhonePe
- Paytm
- BHIM
- Any UPI app

### ✅ Cards
- Visa
- Mastercard
- Rupay
- Maestro
- American Express

### ✅ Net Banking
- All major banks
- 50+ banks supported

### ✅ Wallets
- Paytm
- PhonePe
- Mobikwik
- Freecharge
- Airtel Money

### ✅ EMI
- Credit card EMI
- Debit card EMI
- Cardless EMI

---

## Pricing

### Razorpay Fees:
- **Domestic Cards:** 2% per transaction
- **UPI, Net Banking, Wallets:** 2% per transaction
- **International Cards:** 3% per transaction
- **No setup fee**
- **No annual fee**

### Example:
- Order Amount: ₹1,000
- Razorpay Fee: ₹20 (2%)
- **You Receive:** ₹980

Settlement: T+2 to T+4 days (2-4 business days)

---

## Testing Checklist

Before going live, test:
- [ ] Successful payment flow
- [ ] Failed payment handling
- [ ] Order creation in Firebase
- [ ] Payment details saved
- [ ] Customer receives confirmation
- [ ] Admin can see payment status
- [ ] Different payment methods (UPI, Card)
- [ ] Mobile responsiveness
- [ ] Error handling

---

## Security Best Practices

### ✅ DO:
- Keep Key Secret confidential
- Use HTTPS in production
- Validate payments on backend
- Store payment IDs
- Enable 2FA on Razorpay account

### ❌ DON'T:
- Share Key Secret publicly
- Commit keys to GitHub
- Skip payment verification
- Trust client-side payment status alone

---

## Troubleshooting

### Payment popup not opening?
- Check if Razorpay script is loaded
- Check browser console for errors
- Verify Key ID is correct

### Payment succeeds but order not created?
- Check Firebase write permissions
- Check browser console
- Verify Firebase authentication

### "Invalid key" error?
- Check you're using correct mode (test/live)
- Verify Key ID is copied correctly
- Ensure no extra spaces

### Payments not visible in dashboard?
- Check you're in correct mode (test/live)
- Wait a few seconds and refresh
- Check "Payments" section in dashboard

---

## Support & Resources

### Razorpay Resources:
- **Dashboard:** https://dashboard.razorpay.com/
- **Documentation:** https://razorpay.com/docs/
- **API Reference:** https://razorpay.com/docs/api/
- **Support:** support@razorpay.com

### Integration Code:
- All code is in `script.js`
- Configuration in `razorpay-config.js`
- Checkout updated in `index.html`

---

## Quick Start Summary

1. **Sign up** at Razorpay
2. **Get test keys** from dashboard
3. **Update** `razorpay-config.js`
4. **Test** with test cards
5. **Complete KYC** (for live mode)
6. **Switch to live** when ready

---

## 🎯 Next Steps After This Guide

1. Complete Razorpay signup
2. Get your Test API keys
3. Update `razorpay-config.js` with your keys
4. Test a payment on your website
5. Verify order appears in admin panel
6. When ready: Complete KYC → Go live!

---

**Your payment gateway is ready to integrate! Follow the steps above to start accepting payments.** 💳
