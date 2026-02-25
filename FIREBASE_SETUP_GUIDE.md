# 🔥 Firebase Setup Guide for teyraa.shop

## Prerequisites
- Google account
- Internet connection
- 15 minutes of time

---

## Step 1: Create Firebase Project (5 minutes)

### 1.1 Go to Firebase Console
👉 Open: https://console.firebase.google.com/

### 1.2 Create New Project
1. Click **"Add project"** or **"Create a project"**
2. Enter project name: **teyraa-shop** (or any name you like)
3. Click **Continue**
4. **Google Analytics**: You can disable it for now (toggle OFF)
5. Click **Create project**
6. Wait for project creation (~30 seconds)
7. Click **Continue** when done

---

## Step 2: Enable Firestore Database (3 minutes)

### 2.1 Create Firestore Database
1. In Firebase Console, click **"Firestore Database"** in left sidebar
2. Click **"Create database"**
3. Select **"Start in test mode"** (we'll secure it later)
4. Click **Next**
5. Choose location: **asia-south1 (Mumbai)** or closest to you
6. Click **Enable**
7. Wait for database creation

### 2.2 Firestore is Ready!
You should see an empty database with "Start collection" button.

---

## Step 3: Enable Authentication (2 minutes)

### 3.1 Enable Email/Password Auth
1. Click **"Authentication"** in left sidebar
2. Click **"Get started"**
3. Click **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. Toggle **Enable** switch ON
6. Click **Save**

### 3.2 Create Admin User
1. Click **"Users"** tab
2. Click **"Add user"**
3. Enter your admin email: `admin@teyraa.shop` (or your own email)
4. Enter password: `Admin@123` (or create your own strong password)
5. Click **"Add user"**

### ⚠️ **IMPORTANT**: Remember this email and password - you'll use it to login to admin panel!

---

## Step 4: Get Firebase Configuration (3 minutes)

### 4.1 Go to Project Settings
1. Click the **⚙️ gear icon** next to "Project Overview" (top left)
2. Click **"Project settings"**

### 4.2 Add Web App
1. Scroll down to **"Your apps"** section
2. Click the **</>** (Web) icon
3. Enter app nickname: **teyraa-shop-web**
4. ✅ Check **"Also set up Firebase Hosting"**
5. Click **"Register app"**

### 4.3 Copy Configuration
You'll see a code snippet like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "patel-store-xxxxx.firebaseapp.com",
  projectId: "patel-store-xxxxx",
  storageBucket: "patel-store-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

### 4.4 Update firebase-config.js
1. **COPY** the entire firebaseConfig object above
2. Open `firebase-config.js` in your project
3. **REPLACE** the placeholder values with your actual values
4. **SAVE** the file

### Example:
```javascript
// Before (placeholder):
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    ...
};

// After (your actual values):
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "patel-store-12345.firebaseapp.com",
    projectId: "patel-store-12345",
    ...
};
```

4. Click **"Continue to console"**

---

## Step 5: Set Up Security Rules (2 minutes)

### 5.1 Update Firestore Rules
1. Go to **Firestore Database**
2. Click **"Rules"** tab
3. Replace the existing rules with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products - anyone can read, only authenticated users can write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Orders - only authenticated users can read/write
    match /orders/{orderId} {
      allow read, write: if exists(/databases/$(database)/documents/admins/$(request.auth.token.email));
    }
    
    // Admins - only existing admins can read/write
    match /admins/{adminId} {
      allow read, write: if exists(/databases/$(database)/documents/admins/$(request.auth.token.email));
    }

    // Settings - only authenticated users can read/write
    match /settings/{settingId} {
      allow read, write: if exists(/databases/$(database)/documents/admins/$(request.auth.token.email));
    }
  }
}
```

4. Click **"Publish"**

---

## Step 6: Test Your Setup

### 6.1 Open Admin Panel
1. Open `admin.html` in your browser
2. You should see the login screen

### 6.2 Login with Admin Credentials
1. Enter the email you created: `admin@teyraa.shop`
2. Enter the password you set: `Admin@123`
3. Click **Login**

### 6.3 If Login Works ✅
- You'll see the admin dashboard
- Products will load from Firebase (empty initially)
- You can add products!

### 6.4 If Login Fails ❌
Check:
- Is `firebase-config.js` updated with your actual Firebase config?
- Did you enable Email/Password authentication?
- Did you create an admin user?
- Check browser console (F12) for errors

---

## Step 7: Import Initial Products (Optional)

### 7.1 The system will automatically create default products when you:
1. Login to admin panel for the first time
2. Products will be saved to Firebase Firestore
3. Check Firestore Database console to see them!

### 7.2 View in Firestore:
1. Go to Firebase Console
2. Click **Firestore Database**
3. You should see a `products` collection
4. Click to expand and see your products!

---

## Step 8: Deploy to Firebase Hosting (Optional)

### 8.1 Install Firebase CLI
Open terminal and run:
```bash
npm install -g firebase-tools
```

### 8.2 Login to Firebase
```bash
firebase login
```

### 8.3 Initialize Firebase in Your Project
Navigate to your project folder:
```bash
cd "c:\Users\hp\online store"
firebase init
```

Select:
- ✅ Firestore
- ✅ Hosting

Follow the prompts:
- Use existing project: Select your **teyraa-shop** project
- Firestore rules: Press Enter (use default)
- Firestore indexes: Press Enter (use default)
- Public directory: Type `.` (current directory)
- Configure as single-page app: **No**
- Set up automatic builds: **No**
- Overwrite files: **No**

### 8.4 Deploy
```bash
firebase deploy
```

### 8.5 Access Your Live Website
After deployment, you'll get URLs like:
- **Main Site**: https://patel-store-xxxxx.web.app
- **Admin Panel**: https://patel-store-xxxxx.web.app/admin.html

🎉 Your website is now live!

---

## 📋 Summary Checklist

Before proceeding, make sure you've completed:

- [ ] Created Firebase project
- [ ] Enabled Firestore Database (test mode)
- [ ] Enabled Email/Password Authentication
- [ ] Created admin user account
- [ ] Copied Firebase config to `firebase-config.js`
- [ ] Updated Firestore security rules
- [ ] Tested admin login
- [ ] Can add/edit products

---

## 🆘 Troubleshooting

### Error: "Firebase App named '[DEFAULT]' already exists"
**Solution**: Refresh the page

### Error: "Missing or insufficient permissions"
**Solution**: Check Firestore security rules are published

### Error: "auth/user-not-found"
**Solution**: Create admin user in Firebase Authentication

### Error: "auth/wrong-password"
**Solution**: Check password or reset it in Firebase Console

### Products not showing on main website
**Solution**: 
1. Make sure you're logged in to admin
2. Add at least one product
3. Refresh main website (index.html)

---

## 📞 Need Help?

If you encounter any issues:
1. Check browser console (F12 → Console tab)
2. Check Firebase Console for errors
3. Verify all steps above are completed
4. Make sure firebase-config.js has your actual credentials

---

## 🎯 Next Steps

After successful setup:
1. ✅ Login to admin panel
2. ✅ Add your products
3. ✅ Test ordering system
4. ✅ Customize as needed
5. 🚀 Deploy to Firebase Hosting (optional)

---

**Your teyraa.shop is now powered by Firebase! 🔥**
