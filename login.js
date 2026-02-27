/**
 * TEYRAA - Auth Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('emailLoginForm');
    const toggleBtn = document.getElementById('toggleAuth');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const nameGroup = document.getElementById('nameGroup');
    const authBtn = document.getElementById('authBtn');
    const switchText = document.getElementById('switchText');

    let isLogin = true;

    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isLogin = !isLogin;

        if (isLogin) {
            authTitle.textContent = 'Welcome Back';
            authSubtitle.textContent = 'Please enter your details to sign in.';
            authBtn.textContent = 'Sign In';
            switchText.textContent = "Don't have an account?";
            toggleBtn.textContent = 'Create One';
            nameGroup.style.display = 'none';
        } else {
            authTitle.textContent = 'Join the Legacy';
            authSubtitle.textContent = 'Create an account to start your collection.';
            authBtn.textContent = 'Create Account';
            switchText.textContent = "Already have an account?";
            toggleBtn.textContent = 'Sign In';
            nameGroup.style.display = 'block';
        }
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            if (isLogin) {
                await firebase.auth().signInWithEmailAndPassword(email, password);
                window.location.href = 'index.html';
            } else {
                const name = document.getElementById('signupName').value;
                const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                await userCredential.user.updateProfile({ displayName: name });
                window.location.href = 'index.html';
            }
        } catch (error) {
            alert(error.message);
        }
    });
});
