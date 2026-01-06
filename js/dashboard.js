/**
 * Combined JavaScript for Transport System
 * Includes logic for: Loading, Login, Live Track, and Dashboard pages.
 */

document.addEventListener('DOMContentLoaded', () => {
    const pageTitle = document.title;

    // ==========================================
    // LOADING PAGE LOGIC
    // ==========================================
    if (pageTitle.includes("Loading")) {
        // Simulate loading messages
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
                window.location.href = 'login.html';
            }, 5000);
        }
    }

    // ==========================================
    // LOGIN PAGE LOGIC
    // ==========================================
    if (pageTitle.includes("Login")) {
        const DEFAULT_OTP = "123456";
        const userName = document.getElementById('userName');
        const userPhone = document.getElementById('userPhone');
        const sendOtpBtn = document.getElementById('sendOtpBtn');
        const loginForm = document.getElementById('loginForm');
        const otpSection = document.getElementById('otpSection');
        const displayPhone = document.getElementById('displayPhone');
        const otpInputs = document.querySelectorAll('.otp-input');
        const verifyOtpBtn = document.getElementById('verifyOtpBtn');
        const resendBtn = document.getElementById('resendBtn');
        const editNumber = document.getElementById('editNumber');
        const timerDisplay = document.getElementById('timer');

        let timerInterval;
        let timeLeft = 30;

        // Send OTP
        if (sendOtpBtn) {
            sendOtpBtn.addEventListener('click', (e) => {
                e.preventDefault();

                const nameError = document.getElementById('nameError');
                const phoneError = document.getElementById('phoneError');

                nameError.classList.remove('show');
                phoneError.classList.remove('show');

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

                if (isValid) {
                    // Simulate OTP sending
                    displayPhone.textContent = '+91 ' + userPhone.value;
                    loginForm.style.display = 'none';
                    otpSection.classList.add('active');
                    otpInputs[0].focus();
                    startTimer();

                    console.log('OTP sent to:', userPhone.value);
                    console.log('User name:', userName.value);
                }
            });
        }

        // OTP Input Navigation with auto-masking
        if (otpInputs.length > 0) {
            otpInputs.forEach((input, index) => {
                let maskTimer;

                // Make sure input starts as text type
                input.type = 'text';

                input.addEventListener('input', (e) => {
                    const value = e.target.value;

                    if (value.length === 1) {
                        // Clear any existing timer
                        clearTimeout(maskTimer);

                        // Keep it as text initially so user can see
                        input.type = 'text';

                        // Mask it after 800ms (you can adjust this)
                        maskTimer = setTimeout(() => {
                            input.type = 'password';
                        }, 800);

                        // Move to next input
                        if (index < otpInputs.length - 1) {
                            otpInputs[index + 1].focus();
                        }
                    } else if (value.length === 0) {
                        // If cleared, reset to text
                        clearTimeout(maskTimer);
                        input.type = 'text';
                    }
                });

                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace') {
                        clearTimeout(maskTimer);
                        input.type = 'text';

                        if (!e.target.value && index > 0) {
                            otpInputs[index - 1].focus();
                            otpInputs[index - 1].type = 'text';
                        }
                    }
                });

                input.addEventListener('focus', (e) => {
                    // Show the number when focused
                    if (e.target.value) {
                        clearTimeout(maskTimer);
                        e.target.type = 'text';

                        // Re-mask after focus
                        maskTimer = setTimeout(() => {
                            e.target.type = 'password';
                        }, 800);
                    }
                });

                input.addEventListener('paste', (e) => {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData('text').slice(0, 6);
                    pastedData.split('').forEach((char, i) => {
                        if (otpInputs[i]) {
                            otpInputs[i].value = char;
                            otpInputs[i].type = 'text';

                            // Mask each digit after 800ms
                            setTimeout(() => {
                                otpInputs[i].type = 'password';
                            }, 800);
                        }
                    });

                    // Focus on the next empty input or last input
                    const lastFilledIndex = Math.min(pastedData.length, otpInputs.length - 1);
                    if (lastFilledIndex < otpInputs.length) {
                        otpInputs[lastFilledIndex].focus();
                    }
                });
            });
        }

        // Verify OTP
        if (verifyOtpBtn) {
            verifyOtpBtn.addEventListener('click', (e) => {
                e.preventDefault();

                const otp = Array.from(otpInputs).map(input => input.value).join('');
                const otpError = document.getElementById('otpError');

                if (otp.length === 6) {
                    // Save user data to localStorage
                    /*const userData = {
                        name: userName.value,
                        phone: '+91 ' + userPhone.value,
                        busRoute: '',
                        department: ''
                    };*/
                    localStorage.setItem("userLogin", JSON.stringify({
                        name: userName.value,
                        phone: "+91 " + userPhone.value
                    }));
                    // Also saving as userProfile for dashboard compatibility if needed?
                    // Dashboard uses 'userProfile' with structure {name, phone, busRoute, department}
                    // Login code saves 'userLogin'
                    // Dashboard code: const savedProfile = localStorage.getItem('userProfile');
                    // It seems Dashboard expects 'userProfile'. 
                    // Let's ensure compatibility.

                    const initialProfile = {
                        name: userName.value,
                        phone: '+91 ' + userPhone.value,
                        busRoute: '',
                        department: ''
                    };
                    localStorage.setItem('userProfile', JSON.stringify(initialProfile));


                    console.log('Verifying OTP:', otp);
                    alert(`Welcome ${userName.value}! Login successful.`);

                    // Redirect to main page
                    window.location.href = 'live-track.html';
                } else {
                    otpError.classList.add('show');
                }
            });
        }

        // Timer for resend OTP
        function startTimer() {
            timeLeft = 30;
            resendBtn.classList.add('disabled');
            timerDisplay.textContent = timeLeft;

            timerInterval = setInterval(() => {
                timeLeft--;
                timerDisplay.textContent = timeLeft;

                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    resendBtn.classList.remove('disabled');
                    resendBtn.innerHTML = 'Resend OTP';
                }
            }, 1000);
        }

        // Resend OTP
        if (resendBtn) {
            resendBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!resendBtn.classList.contains('disabled')) {
                    console.log('Resending OTP to:', userPhone.value);
                    otpInputs.forEach(input => input.value = '');
                    otpInputs[0].focus();
                    startTimer();
                }
            });
        }

        // Edit Number
        if (editNumber) {
            editNumber.addEventListener('click', (e) => {
                e.preventDefault();
                otpSection.classList.remove('active');
                loginForm.style.display = 'block';
                clearInterval(timerInterval);
                otpInputs.forEach(input => input.value = '');
            });
        }

        // Only allow numbers in phone input
        if (userPhone) {
            userPhone.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        }
    }

    // ==========================================
    // DASHBOARD PAGE LOGIC
    // ==========================================
    if (pageTitle.includes("Dashboard")) {
        // User data will be loaded from localStorage (saved during login)
        let userData = {};

        // Initialize page function
        const initDashboard = function () {
            // Load user data from localStorage
            const savedProfile = localStorage.getItem('userProfile');

            if (savedProfile) {
                userData = JSON.parse(savedProfile);

                // Display user data
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
                // If no user data found, redirect to login
                alert('Please login first');
                // window.location.href = 'login.html';
            }
        };

        // Run Init
        initDashboard();

        // Making functions global for onclick events
        window.showProfile = function () {
            document.getElementById('mainContent').style.display = 'none';
            document.getElementById('profilePage').classList.add('active');
        }

        window.showMain = function () {
            document.getElementById('profilePage').classList.remove('active');
            document.getElementById('mainContent').style.display = 'block';
        }

        window.saveProfile = function (event) {
            event.preventDefault();

            // Get form values
            const name = document.getElementById('profileName').value;
            const busRoute = document.getElementById('busRoute').value;
            const department = document.getElementById('department').value;

            // Update user data
            userData.name = name;
            userData.busRoute = busRoute;
            userData.department = department;

            // Save to localStorage
            localStorage.setItem('userProfile', JSON.stringify(userData));

            // Update welcome message
            document.getElementById('userName').textContent = name;

            // Show success message
            alert('Profile updated successfully!');

            // Go back to main page
            window.showMain();
        }
    }
});

// ==========================================
// LIVE TRACK PAGE LOGIC (Global Helper)
// ==========================================
// Required globally for onclick="handleGetStarted()"
window.handleGetStarted = function () {
    window.location.href = 'dashboard.html';
}
