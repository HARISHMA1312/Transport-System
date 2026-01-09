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
                        // Populate busRoute select from admin-managed routes (localStorage 'routes')
                        if (busRouteSelect) {
                            try {
                                const routes = JSON.parse(localStorage.getItem('routes') || '[]');
                                // clear existing dynamic options (keep placeholder)
                                const placeholder = busRouteSelect.querySelector('option[value=""]');
                                busRouteSelect.innerHTML = '';
                                if (placeholder) busRouteSelect.appendChild(placeholder);
                                routes.forEach((r, i) => {
                                    const opt = document.createElement('option');
                                    opt.value = r.name || `route_${i}`;
                                    opt.textContent = r.name + (r.stops && r.stops.length ? ' (' + r.stops.join(' / ') + ')' : '');
                                    busRouteSelect.appendChild(opt);
                                });
                            } catch (e) {
                                // ignore parse errors
                            }
                            busRouteSelect.value = userData.busRoute || '';
                        }

                        // Render dashboard cards from admin-managed routes
                        try {
                            renderDashboardRoutes();
                        } catch (e) {
                            // ignore
                        }

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

            // Persist profile updates back into registered users list so admin view shows updated route/department
            try {
                const normalizePhone = (p) => { if (!p) return ''; const d = String(p).replace(/[^0-9]/g,''); return d.length>=10?'+91 '+d.slice(-10):p; };
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const idx = users.findIndex(u => normalizePhone(u.phone) === normalizePhone(userData.phone));
                if (idx !== -1) {
                    users[idx].name = name;
                    users[idx].busRoute = busRoute;
                    users[idx].department = department;
                    localStorage.setItem('users', JSON.stringify(users));
                } else {
                    // fallback: update or create profiles array
                    const profiles = JSON.parse(localStorage.getItem('profiles') || '[]');
                    const pidx = profiles.findIndex(p => normalizePhone(p.phone) === normalizePhone(userData.phone));
                    if (pidx !== -1) {
                        profiles[pidx].name = name;
                        profiles[pidx].busRoute = busRoute;
                        profiles[pidx].department = department;
                        localStorage.setItem('profiles', JSON.stringify(profiles));
                    } else {
                        profiles.push({ name, phone: normalizePhone(userData.phone), busRoute, department });
                        localStorage.setItem('profiles', JSON.stringify(profiles));
                    }
                }
            } catch (e) {
                // ignore persistence errors
            }

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

// Render admin-managed routes as dashboard cards
function renderDashboardRoutes() {
    const container = document.getElementById('busCardsContainer') || document.querySelector('.bus-cards-container');
    if (!container) return;
    container.innerHTML = '';
    let routes = [];
    try { routes = JSON.parse(localStorage.getItem('routes') || '[]'); } catch(e) { routes = []; }
    console.log('renderDashboardRoutes: found routes count =', (routes && routes.length) || 0, routes);
    if (!routes || routes.length === 0) {
        // If no routes are present, auto-populate from a default set (provided by user)
        const sample = [
            { name: 'r1', stops: ['college','palanganatham','vasantha nagar','madura college','periyar','simmakal','goripalayam','vadamalayan','district court','maatuthavani'] },
            { name: 'r2', stops: ['college','palanganatham','natraj theatre','by-pass road','duraisami nagar','guru theatre','arappalayam'] }
        ];
        try {
            localStorage.setItem('routes', JSON.stringify(sample));
            routes = sample;
        } catch (e) {
            container.innerHTML = '<div style="color:#666; padding:20px">No routes available and could not write sample routes to localStorage.</div>';
            return;
        }
    }

    routes.forEach((r, idx) => {
        const card = document.createElement('div');
        card.className = 'bus-card';

        const header = document.createElement('div'); header.className = 'bus-header';
        const h3 = document.createElement('h3'); h3.innerHTML = `<span>🚌</span> ${escapeHtml(r.name || ('Route ' + (idx+1)))}`;
        const live = document.createElement('div'); live.className = 'live-indicator';
        header.appendChild(h3); header.appendChild(live);

        const mapWrap = document.createElement('div'); mapWrap.className = 'bus-map';
        const mapPlaceholder = document.createElement('div'); mapPlaceholder.className = 'map-placeholder';

        // create simple SVG route visualization: nodes + connecting line
        const parseStopsLocal = (input) => { if (!input) return []; return String(input).split(/→|->|,|\|/).map(s=>s.trim()).filter(Boolean); };
        const stops = Array.isArray(r.stops) ? r.stops : (typeof parseStops === 'function' ? parseStops(r.stops || '') : parseStopsLocal(r.stops || ''));
        try {
            const svgNS = 'http://www.w3.org/2000/svg';
            const svg = document.createElementNS(svgNS, 'svg');
            // Use a tall viewBox for vertical route rendering so circles at y~95 are visible
            svg.setAttribute('viewBox', '0 0 20 100');
            svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            // Make svg narrow and tall so it looks like a vertical route line inside the map placeholder
            svg.style.width = '44px';
            svg.style.height = '90%';

            if (stops.length > 0) {
                // vertical line view: viewBox width small, height 100
                const line = document.createElementNS(svgNS, 'line');
                line.setAttribute('x1', 10);
                line.setAttribute('y1', 5);
                line.setAttribute('x2', 10);
                line.setAttribute('y2', 95);
                line.setAttribute('stroke', '#007acc');
                line.setAttribute('stroke-width', '1.2');
                svg.appendChild(line);

                stops.forEach((s, i) => {
                    const cy = (stops.length === 1) ? 50 : (5 + (i * (90 / (stops.length - 1))));
                    const circle = document.createElementNS(svgNS, 'circle');
                    circle.setAttribute('cx', 10);
                    circle.setAttribute('cy', cy);
                    // larger filled circles for start/end, hollow for intermediates
                    if (i === 0) {
                        circle.setAttribute('r', 3.8);
                        circle.setAttribute('fill', '#0052cc');
                    } else if (i === stops.length - 1) {
                        circle.setAttribute('r', 3.8);
                        circle.setAttribute('fill', '#5a2a8a');
                    } else {
                        circle.setAttribute('r', 2.8);
                        circle.setAttribute('fill', '#ffffff');
                        circle.setAttribute('stroke', '#007acc');
                        circle.setAttribute('stroke-width', '1');
                    }
                    const title = document.createElementNS(svgNS, 'title');
                    title.textContent = s;
                    circle.appendChild(title);
                    svg.appendChild(circle);
                });
            } else {
                const text = document.createElement('div');
                text.textContent = '📍 Map View';
                mapPlaceholder.appendChild(text);
            }

            mapPlaceholder.appendChild(svg);
        } catch (e) {
            mapPlaceholder.textContent = '📍 Map View';
        }

        mapWrap.appendChild(mapPlaceholder);

        const info = document.createElement('div'); info.className = 'bus-info';
        const infoRow = document.createElement('div'); infoRow.className = 'info-row';
        const label = document.createElement('span'); label.className = 'info-label'; label.textContent = 'Route:';
        const busNumber = document.createElement('span'); busNumber.className = 'bus-number'; busNumber.textContent = r.name || ('Route ' + (idx+1));
        infoRow.appendChild(label); infoRow.appendChild(busNumber);

        const routeDetails = document.createElement('div'); routeDetails.className = 'route-details';
        const routeHeader = document.createElement('div'); routeHeader.className = 'route-header'; routeHeader.textContent = '🗺️ Route';
        const routeList = document.createElement('div'); routeList.className = 'route-list';

        // reuse `stops` declared earlier for SVG rendering
        const start = stops[0] || '';
        const end = stops.length ? stops[stops.length-1] : '';

        const startDiv = document.createElement('div'); startDiv.className = 'route-point start'; startDiv.innerHTML = `<strong>Start:</strong> ${escapeHtml(start)}`;
        routeList.appendChild(startDiv);

        // intermediate stops (hidden by default)
        const intermediateContainer = document.createElement('div'); intermediateContainer.style.display = 'none';
        intermediateContainer.style.flexDirection = 'column';
        intermediateContainer.style.marginTop = '6px';
        for (let i = 1; i < stops.length-1; i++) {
            const sdiv = document.createElement('div'); sdiv.className = 'route-point'; sdiv.textContent = stops[i];
            intermediateContainer.appendChild(sdiv);
        }
        routeList.appendChild(intermediateContainer);

        const endDiv = document.createElement('div'); endDiv.className = 'route-point end'; endDiv.innerHTML = `<strong>End:</strong> ${escapeHtml(end)}`;
        routeList.appendChild(endDiv);

        routeDetails.appendChild(routeHeader); routeDetails.appendChild(routeList);
        info.appendChild(infoRow); info.appendChild(routeDetails);

        card.appendChild(header); card.appendChild(mapWrap); card.appendChild(info);
        container.appendChild(card);

        // hover to show intermediate stops; click to toggle persistent expand
        let expanded = false;
        card.addEventListener('mouseenter', () => { if (!expanded) intermediateContainer.style.display = (intermediateContainer.children.length? 'block':'none'); });
        card.addEventListener('mouseleave', () => { if (!expanded) intermediateContainer.style.display = 'none'; });
        card.addEventListener('click', (e) => {
            // ignore clicks on buttons/inputs if any
            if (e.target && e.target.tagName.toLowerCase() === 'button') return;
            expanded = !expanded;
            intermediateContainer.style.display = expanded ? (intermediateContainer.children.length? 'block':'none') : 'none';
        });
    });
}