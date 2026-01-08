/**
 * Combined JavaScript for Transport System
 * Includes logic for: Loading, Role Selection, User & Admin Register/Login, Live Track, and Dashboard pages.
 */

document.addEventListener('DOMContentLoaded', () => {
    const pageTitle = document.title;

    // ==========================================
    // LOADING PAGE LOGIC
    // ==========================================
    if (pageTitle.includes("Loading")) {
        const messages = [
            'Initializing GPS tracking...',
            'Loading bus routes...',
            'Fetching real-time data...',
            'Preparing map display...',
            'Almost ready...'
        ];

        let messageIndex = 0;
        const messageElement = document.getElementById('loadingMessage');

        if (messageElement) {
            setInterval(() => {
                messageIndex = (messageIndex + 1) % messages.length;
                messageElement.textContent = messages[messageIndex];
            }, 2000);

            setTimeout(() => {
                window.location.href = 'role-selection.html';
            }, 5000);
        }
    }

    // ==========================================
    // USER REGISTER PAGE LOGIC
    // ==========================================
    if (pageTitle.includes("User Register")) {
        const DEFAULT_OTP = "123456";

        const userName = document.getElementById('userName');
        const userPhone = document.getElementById('userPhone');
        const userPassword = document.getElementById('userPassword');
        const userRegisterBtn = document.getElementById('userRegisterBtn');
        const userOtpSection = document.getElementById('userOtpSection');
        const userOtpInputs = document.querySelectorAll('.otp-input');
        const userVerifyOtpBtn = document.getElementById('userVerifyOtpBtn');
        const userResendBtn = document.getElementById('userResendBtn');
        const userEditNumber = document.getElementById('userEditNumber');
        const userTimerDisplay = document.getElementById('userTimer');

        let userTimerInterval;
        let userTimeLeft = 30;

        // Phone input restriction
        if (userPhone) {
            userPhone.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        }

        // User Register Button
        if (userRegisterBtn) {
            userRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();

                const nameError = document.getElementById('userNameError');
                const phoneError = document.getElementById('userPhoneError');
                const passwordError = document.getElementById('userPasswordError');

                nameError.classList.remove('show');
                phoneError.classList.remove('show');
                passwordError.classList.remove('show');

                let isValid = true;

                if (!userName.value.trim()) {
                    nameError.classList.add('show');
                    isValid = false;
                }

                const phoneRegex = /^[6-9]\d{9}$/;
                if (!phoneRegex.test(userPhone.value)) {
                    phoneError.classList.add('show');
                    isValid = false;
                }

                if (!userPassword.value.trim()) {
                    passwordError.classList.add('show');
                    isValid = false;
                }

                if (isValid) {
                    const users = JSON.parse(localStorage.getItem('users')) || [];
                    const existingUser = users.find(u => u.phone === '+91 ' + userPhone.value);

                    if (existingUser) {
                        alert('User already exists. Redirecting to login...');
                        window.location.href = 'user-login.html';
                        return;
                    }

                    document.getElementById('userDisplayPhone').textContent = '+91 ' + userPhone.value;
                    document.querySelector('.form-section').style.display = 'none';
                    userOtpSection.classList.add('active');
                    userOtpInputs[0].focus();
                    startUserTimer();

                    console.log('OTP sent to:', userPhone.value);
                    console.log('Default OTP for testing:', DEFAULT_OTP);
                }
            });
        }

        // OTP Input Navigation
        if (userOtpInputs.length > 0) {
            userOtpInputs.forEach((input, index) => {
                let maskTimer;

                input.addEventListener('input', (e) => {
                    const value = e.target.value;

                    if (value.length === 1) {
                        clearTimeout(maskTimer);
                        input.type = 'text';
                        maskTimer = setTimeout(() => {
                            input.type = 'password';
                        }, 800);

                        if (index < userOtpInputs.length - 1) {
                            userOtpInputs[index + 1].focus();
                        }
                    } else if (value.length === 0) {
                        clearTimeout(maskTimer);
                        input.type = 'text';
                    }
                });

                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace') {
                        clearTimeout(maskTimer);
                        input.type = 'text';

                        if (!e.target.value && index > 0) {
                            userOtpInputs[index - 1].focus();
                        }
                    }
                });

                input.addEventListener('paste', (e) => {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData('text').slice(0, 6);
                    pastedData.split('').forEach((char, i) => {
                        if (userOtpInputs[i]) {
                            userOtpInputs[i].value = char;
                            userOtpInputs[i].type = 'text';
                            setTimeout(() => {
                                userOtpInputs[i].type = 'password';
                            }, 800);
                        }
                    });
                });
            });
        }

        // Verify OTP
        if (userVerifyOtpBtn) {
            userVerifyOtpBtn.addEventListener('click', (e) => {
                e.preventDefault();

                const otp = Array.from(userOtpInputs).map(input => input.value).join('');
                const otpError = document.getElementById('userOtpError');

                if (otp === DEFAULT_OTP) {
                    const users = JSON.parse(localStorage.getItem('users')) || [];
                    users.push({
                        name: userName.value.trim(),
                        phone: '+91 ' + userPhone.value,
                        password: userPassword.value
                    });
                    localStorage.setItem('users', JSON.stringify(users));

                    alert('Registration successful! Redirecting to login...');
                    clearInterval(userTimerInterval);
                    window.location.href = 'user-login.html';
                } else {
                    otpError.classList.add('show');
                    setTimeout(() => {
                        otpError.classList.remove('show');
                    }, 3000);
                }
            });
        }

        // Timer function
        function startUserTimer() {
            userTimeLeft = 30;
            if (userResendBtn) userResendBtn.classList.add('disabled');
            if (userTimerDisplay) userTimerDisplay.textContent = userTimeLeft;

            userTimerInterval = setInterval(() => {
                userTimeLeft--;
                if (userTimerDisplay) userTimerDisplay.textContent = userTimeLeft;

                if (userTimeLeft <= 0) {
                    clearInterval(userTimerInterval);
                    if (userResendBtn) {
                        userResendBtn.classList.remove('disabled');
                        userResendBtn.innerHTML = 'Resend OTP';
                    }
                }
            }, 1000);
        }

        // Resend OTP
        if (userResendBtn) {
            userResendBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!userResendBtn.classList.contains('disabled')) {
                    userOtpInputs.forEach(input => {
                        input.value = '';
                        input.type = 'text';
                    });
                    userOtpInputs[0].focus();
                    startUserTimer();
                }
            });
        }

        // Edit Number
        if (userEditNumber) {
            userEditNumber.addEventListener('click', (e) => {
                e.preventDefault();
                userOtpSection.classList.remove('active');
                document.querySelector('.form-section').style.display = 'block';
                clearInterval(userTimerInterval);
            });
        }
    }

    // ==========================================
    // USER LOGIN PAGE LOGIC
    // ==========================================
    if (pageTitle.includes("User Login")) {
        const userLoginPhone = document.getElementById('userLoginPhone');
        const userLoginPassword = document.getElementById('userLoginPassword');
        const userLoginBtn = document.getElementById('userLoginBtn');

        // Phone input restriction
        if (userLoginPhone) {
            userLoginPhone.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        }

        if (userLoginBtn) {
            userLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();

                const phoneError = document.getElementById('userLoginPhoneError');
                const passwordError = document.getElementById('userLoginPasswordError');

                phoneError.classList.remove('show');
                passwordError.classList.remove('show');

                const phoneRegex = /^[6-9]\d{9}$/;
                if (!phoneRegex.test(userLoginPhone.value)) {
                    phoneError.classList.add('show');
                    return;
                }

                const users = JSON.parse(localStorage.getItem('users')) || [];
                const user = users.find(u => u.phone === '+91 ' + userLoginPhone.value && u.password === userLoginPassword.value);

                if (user) {
                    const userSession = {
                        name: user.name,
                        phone: user.phone,
                        loginTime: new Date().toISOString()
                    };
                    localStorage.setItem('userLogin', JSON.stringify(userSession));

                    if (!localStorage.getItem('userProfile')) {
                        const initialProfile = {
                            name: user.name,
                            phone: user.phone,
                            busRoute: '',
                            department: ''
                        };
                        localStorage.setItem('userProfile', JSON.stringify(initialProfile));
                    }

                    alert(`Welcome ${user.name}! Login successful.`);
                    window.location.href = 'live-track.html';
                } else {
                    passwordError.classList.add('show');
                }
            });
        }
    }

    // ==========================================
    // ADMIN REGISTER PAGE LOGIC
    // ==========================================
    if (pageTitle.includes("Admin Register")) {
        const adminName = document.getElementById('adminName');
        const adminEmail = document.getElementById('adminEmail');
        const adminPhone = document.getElementById('adminPhone');
        const adminPassword = document.getElementById('adminPassword');
        const adminRegisterBtn = document.getElementById('adminRegisterBtn');

        // Phone input restriction
        if (adminPhone) {
            adminPhone.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        }

        if (adminRegisterBtn) {
            adminRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();

                const nameError = document.getElementById('adminNameError');
                const emailError = document.getElementById('adminEmailError');
                const phoneError = document.getElementById('adminPhoneError');
                const passwordError = document.getElementById('adminPasswordError');

                nameError.classList.remove('show');
                emailError.classList.remove('show');
                phoneError.classList.remove('show');
                passwordError.classList.remove('show');

                let isValid = true;

                if (!adminName.value.trim()) {
                    nameError.classList.add('show');
                    isValid = false;
                }

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(adminEmail.value)) {
                    emailError.classList.add('show');
                    isValid = false;
                }

                const phoneRegex = /^[6-9]\d{9}$/;
                if (!phoneRegex.test(adminPhone.value)) {
                    phoneError.classList.add('show');
                    isValid = false;
                }

                if (!adminPassword.value.trim()) {
                    passwordError.classList.add('show');
                    isValid = false;
                }

                if (isValid) {
                    const admins = JSON.parse(localStorage.getItem('admins')) || [];
                    const existingAdmin = admins.find(a => a.phone === '+91 ' + adminPhone.value);

                    if (existingAdmin) {
                        alert('Admin already exists. Redirecting to login...');
                        window.location.href = 'admin-login.html';
                        return;
                    }

                    admins.push({
                        name: adminName.value.trim(),
                        email: adminEmail.value.trim(),
                        phone: '+91 ' + adminPhone.value,
                        password: adminPassword.value
                    });
                    localStorage.setItem('admins', JSON.stringify(admins));

                    alert('Admin registration successful! Redirecting to login...');
                    window.location.href = 'admin-login.html';
                }
            });
        }
    }

    // ==========================================
    // ADMIN LOGIN PAGE LOGIC
    // ==========================================
    if (pageTitle.includes("Admin Login")) {
        const adminLoginPhone = document.getElementById('adminLoginPhone');
        const adminLoginPassword = document.getElementById('adminLoginPassword');
        const adminLoginBtn = document.getElementById('adminLoginBtn');

        // Phone input restriction
        if (adminLoginPhone) {
            adminLoginPhone.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        }

        if (adminLoginBtn) {
            adminLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();

                const phoneError = document.getElementById('adminLoginPhoneError');
                const passwordError = document.getElementById('adminLoginPasswordError');

                phoneError.classList.remove('show');
                passwordError.classList.remove('show');

                const phoneRegex = /^[6-9]\d{9}$/;
                if (!phoneRegex.test(adminLoginPhone.value)) {
                    phoneError.classList.add('show');
                    return;
                }

                const admins = JSON.parse(localStorage.getItem('admins')) || [];
                const admin = admins.find(a => a.phone === '+91 ' + adminLoginPhone.value && a.password === adminLoginPassword.value);

                if (admin) {
                    const adminSession = {
                        name: admin.name,
                        phone: admin.phone,
                        email: admin.email,
                        loginTime: new Date().toISOString()
                    };
                    localStorage.setItem('adminLogin', JSON.stringify(adminSession));

                    alert(`Welcome ${admin.name}! Admin login successful.`);
                    window.location.href = 'admin/admin-dashboard.html';
                } else {
                    passwordError.classList.add('show');
                }
            });
        }
    }

    // ==========================================
    // DASHBOARD PAGE LOGIC
    // ==========================================
    if (pageTitle.includes("Dashboard")) {
        let userData = {};

        const initDashboard = function () {
            const savedProfile = localStorage.getItem('userProfile');

            if (savedProfile) {
                userData = JSON.parse(savedProfile);

                const userNameDisplay = document.getElementById('userName');
                if (userNameDisplay) userNameDisplay.textContent = userData.name || 'User';

                const profileNameInput = document.getElementById('profileName');
                if (profileNameInput) profileNameInput.value = userData.name || '';

                const profilePhoneInput = document.getElementById('profilePhone');
                if (profilePhoneInput) profilePhoneInput.value = userData.phone || '';

                const busRouteSelect = document.getElementById('busRoute');
                if (busRouteSelect) busRouteSelect.value = userData.busRoute || '';

                const departmentSelect = document.getElementById('department');
                if (departmentSelect) departmentSelect.value = userData.department || '';
            } else {
                alert('Please login first');
            }
        };

        initDashboard();

        window.showProfile = function () {
            const mainContent = document.getElementById('mainContent');
            const profilePage = document.getElementById('profilePage');
            if (mainContent) mainContent.style.display = 'none';
            if (profilePage) profilePage.classList.add('active');
        }

        window.showMain = function () {
            const mainContent = document.getElementById('mainContent');
            const profilePage = document.getElementById('profilePage');
            if (profilePage) profilePage.classList.remove('active');
            if (mainContent) mainContent.style.display = 'block';
        }

        window.saveProfile = function (event) {
            event.preventDefault();

            const name = document.getElementById('profileName').value;
            const busRoute = document.getElementById('busRoute').value;
            const department = document.getElementById('department').value;

            userData.name = name;
            userData.busRoute = busRoute;
            userData.department = department;

            localStorage.setItem('userProfile', JSON.stringify(userData));

            const userNameDisplay = document.getElementById('userName');
            if (userNameDisplay) userNameDisplay.textContent = name;

            alert('Profile updated successfully!');
            window.showMain();
        }
    }
});

// ==========================================
// GLOBAL HELPER FUNCTIONS
// ==========================================
window.handleGetStarted = function () {
    window.location.href = 'dashboard.html';
}

window.goToAdmin = function () {
    window.location.href = "admin/admin-login.html";
}