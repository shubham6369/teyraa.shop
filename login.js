// ===== LOGIN PAGE LOGIC =====

const loginTitle = document.getElementById('loginTitle');
const loginSubtitle = document.getElementById('loginSubtitle');
const tabEmail = document.getElementById('tabEmail');
const tabPhone = document.getElementById('tabPhone');
const emailSection = document.getElementById('emailSection');
const phoneSection = document.getElementById('phoneSection');
const emailLoginForm = document.getElementById('emailLoginForm');
const signupForm = document.getElementById('signupForm');
const toSignup = document.getElementById('toSignup');
const toLogin = document.getElementById('toLogin');

const phoneInputStep = document.getElementById('phoneInputStep');
const otpInputStep = document.getElementById('otpInputStep');

let confirmationResult = null;

// Initialize Recaptcha
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    'size': 'normal',
    'callback': (response) => {
        console.log('reCAPTCHA solved');
    }
});

// Tab Switching
tabEmail.addEventListener('click', () => {
    tabEmail.classList.add('active');
    tabPhone.classList.remove('active');
    emailSection.style.display = 'block';
    phoneSection.style.display = 'none';
    loginTitle.textContent = 'Welcome Back';
    loginSubtitle.textContent = 'Login to your account';
});

tabPhone.addEventListener('click', () => {
    tabPhone.classList.add('active');
    tabEmail.classList.remove('active');
    phoneSection.style.display = 'block';
    emailSection.style.display = 'none';
    loginTitle.textContent = 'Mobile Login';
    loginSubtitle.textContent = 'Instant OTP verification';
});

// Switch between Email Login and Signup
toSignup.addEventListener('click', (e) => {
    e.preventDefault();
    emailLoginForm.style.display = 'none';
    signupForm.style.display = 'flex';
    loginTitle.textContent = 'Create Account';
    loginSubtitle.textContent = 'Join teyraa.shop family';
});

toLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.style.display = 'none';
    emailLoginForm.style.display = 'flex';
    loginTitle.textContent = 'Welcome Back';
    loginSubtitle.textContent = 'Login to your account';
});

// Handle Email Login
emailLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        window.location.href = 'index.html';
    } catch (error) {
        alert(error.message);
    }
});

// Handle Signup
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ displayName: name });
        window.location.href = 'index.html';
    } catch (error) {
        alert(error.message);
    }
});

// Handle Send OTP
document.getElementById('sendOTP').addEventListener('click', async () => {
    const number = document.getElementById('phoneNumber').value;
    if (number.length !== 10) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
    }

    const fullNumber = "+91" + number;
    const appVerifier = window.recaptchaVerifier;

    try {
        confirmationResult = await auth.signInWithPhoneNumber(fullNumber, appVerifier);
        phoneInputStep.style.display = 'none';
        otpInputStep.style.display = 'flex';
    } catch (error) {
        alert("Error: " + error.message);
        if (window.grecaptcha) window.grecaptcha.reset();
    }
});

// Handle Verify OTP
document.getElementById('verifyOTP').addEventListener('click', async () => {
    const code = document.getElementById('otpCode').value;
    if (code.length !== 6) {
        alert("Please enter the 6-digit code.");
        return;
    }

    try {
        await confirmationResult.confirm(code);
        window.location.href = 'index.html';
    } catch (error) {
        alert("Invalid OTP code.");
    }
});

// Resend OTP
document.getElementById('resendOTP').addEventListener('click', () => {
    otpInputStep.style.display = 'none';
    phoneInputStep.style.display = 'flex';
    if (window.grecaptcha) window.grecaptcha.reset();
});

// Check if already logged in
auth.onAuthStateChanged((user) => {
    if (user) {
        window.location.href = 'index.html';
    }
});
