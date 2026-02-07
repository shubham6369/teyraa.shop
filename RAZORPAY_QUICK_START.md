# ⚡ Razorpay Quick Start - patel.store

## ✅ Integration Complete!

Razorpay payment gateway has been integrated into your website!

---

## 🎯 What You Need to Do Now (5 minutes):

### Step 1: Sign Up for Razorpay
👉 **Open this link**: https://dashboard.razorpay.com/signup

1. Enter your email and mobile number
2. Create a password
3. Verify OTP
4. Fill business details (patel.store, Fashion & Lifestyle)

---

### Step 2: Get Test API Keys
1. After signup, go to: https://dashboard.razorpay.com/app/keys
2. You'll see **"Test Mode"** section
3. Click **"Generate Test Keys"** (if not already there)
4. **Copy**:
   - Key ID (starts with `rzp_test_...`)
   - Key Secret (click 🔑 to reveal)

**Example:**
```
Key ID: rzp_test_ABC123XYZ456
Key Secret: your_secret_key_here
```

---

### Step 3: Update razorpay-config.js

**Open file:** `razorpay-config.js`

**Find this:**
```javascript
test: {
    keyId: "YOUR_TEST_KEY_ID",
    keySecret: "YOUR_TEST_KEY_SECRET"
}
```

**Replace with your actual keys:**
```javascript
test: {
    keyId: "rzp_test_ABC123XYZ456",  // Your actual test key
    keySecret: "your_secret_key_here"  // Your actual secret
}
```

**Save the file!**

---

## 🧪 Test Your Payment Gateway

### Step 1: Open Your Website
Open `index.html` in browser

### Step 2: Make a Test Order
1. Add products to cart
2. Click "Proceed to Checkout"
3. Fill customer details
4. **Payment Method:** Select "Online Payment"
5. Click "Place Order"

### Step 3: Razorpay Popup Opens!
You'll see Razorpay payment popup with options:
- UPI
- Cards
- Net Banking
- Wallets

### Step 4: Use Test Card
**For Testing, Use:**
- **Card Number:** 4111 1111 1111 1111
- **CVV:** 123
- **Expiry:** 12/25 (any future date)
- **Name:** Your Name

or

**UPI ID:** success@razorpay

### Step 5: Complete Payment
- Click Pay
- Payment will succeed!
- Order confirmed!

### Step 6: Verify Order
1. Check admin panel - Order should show "Paid" status
2. Check Razorpay Dashboard - Payment should appear

---

## 📊 Current Integration Features:

✅ **Payment Methods:**
- UPI (Google Pay, PhonePe, Paytm, etc.)
- Credit/Debit Cards
- Net Banking
- Wallets
- COD (Cash on Delivery)

✅ **Features:**
- Automatic payment popup
- Payment success handling
- Payment failure handling
- Order tracking with payment ID
- Test & Live mode support
- Indian Rupee (INR) currency

✅ **Security:**
- Razorpay handles all payment data
- PCI DSS compliant
- Secure payment popup
- No card data touches your server

---

## 🔄 Payment Flow:

1. **Customer** fills checkout form
2. **Customer** selects "Online Payment"
3. **Customer** clicks "Place Order"
4. **Razorpay popup** opens
5. **Customer** completes payment
6. **If Successful:**
   - Order saved with "Paid" status
   - Payment ID saved
   - Success message shown
7. **If Failed:**
   - Error message shown  
   - Order not created
   - Customer can retry

---

## 💰 Razorpay Fees (India):

- **Domestic Payments:** 2% per transaction
- **Example:** ₹1,000 order = ₹20 fee, you get ₹980
- **Settlement:** 2-4 business days to your bank

---

## ⚙️ Configuration:

**File:** `razorpay-config.js`

```javascript
mode: 'test'  // Change to 'live' when ready for production
```

**Test Mode:**
- Uses test API keys
- No real money charged
- For development/testing

**Live Mode:**  
- Uses live API keys
- Real money charged
- For production

---

## 🆘 Troubleshooting:

### "Razorpay is not defined" error?
✅ Make sure Razorpay script is loaded in `index.html`

### Payment popup not opening?
✅ Check browser console for errors
✅ Verify razorpay-config.js has your actual keys
✅ Make sure you selected "Online Payment"

### "Invalid key" error?
✅ Check Key ID is copied correctly
✅ No extra spaces
✅ Mode matches keys (test keys in test mode)

### Payment succeeds but order not showing?
✅ Check browser console
✅ Check localStorage for 'patelOrders'
✅ Refresh admin panel

---

## 🚀 Ready to Go Live?

**When you're ready for production:**

1. **Complete KYC** in Razorpay (24-48 hours)
2. **Get Live API Keys** from dashboard
3. **Update razorpay-config.js:**
   ```javascript
   live: {
       keyId: "rzp_live_YOUR_KEY",
       keySecret: "your_live_secret"
   },
   mode: 'live'  // Switch to live
   ```
4. **Test with small amount**
5. **Go live!** 🎉

---

## 📋 Quick Checklist:

- [ ] Signed up for Razorpay
- [ ] Got Test API Keys
- [ ] Updated razorpay-config.js
- [ ] Tested with test card
- [ ] Payment popup opens correctly
- [ ] Payment succeeds
- [ ] Order shows in admin panel
- [ ] Payment ID is saved

---

## 🔗 Important Links:

- **Razorpay Dashboard:** https://dashboard.razorpay.com/
- **Test Cards:** https://razorpay.com/docs/payments/payments/test-card-details/
- **Documentation:** https://razorpay.com/docs/
- **Support:** support@razorpay.com

---

## ✅ What's Already Done:

✅ Razorpay SDK loaded
✅ Payment integration code added
✅ COD and Online payment supported
✅ Test mode configuration ready
✅ Payment success/failure handlers
✅ Order tracking with payment ID
✅ Admin panel shows payment status

**You just need to add your API keys and test!** 🎯

---

**Having issues? Check RAZORPAY_SETUP_GUIDE.md for detailed instructions!**
