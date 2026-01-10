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

                const searchBar = document.getElementById('searchBar');
                const searchCriteria = document.getElementById('searchCriteria');

                if (searchBar) {
                    searchBar.addEventListener('input', (e) => {
                        renderDashboardRoutes(e.target.value);
                    });
                }

                if (searchCriteria) {
                    searchCriteria.addEventListener('change', () => {
                        const searchText = searchBar ? searchBar.value : '';
                        renderDashboardRoutes(searchText);
                    });
                }
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
                const normalizePhone = (p) => { if (!p) return ''; const d = String(p).replace(/[^0-9]/g, ''); return d.length >= 10 ? '+91 ' + d.slice(-10) : p; };
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

// Helper to prevent XSS
function escapeHtml(text) {
    if (!text) return text;
    return String(text).replace(/[&<>"']/g, function (m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}

// Render admin-managed routes as dashboard cards
function renderDashboardRoutes(filterText = '') {
    const container = document.getElementById('busCardsContainer') || document.querySelector('.bus-cards-container');
    if (!container) return;
    container.innerHTML = '';

    let routes = [];
    try { routes = JSON.parse(localStorage.getItem('routes') || '[]'); } catch (e) { routes = []; }
    let allBuses = [];
    try { allBuses = JSON.parse(localStorage.getItem('buses') || '[]'); } catch (e) { allBuses = []; }

    console.log('renderDashboardRoutes: found routes count =', (routes && routes.length) || 0);

    if (!routes || routes.length === 0) {
        container.innerHTML = '<div style="color:#666; padding:20px; text-align:center;">No routes available at the moment.</div>';
        return;
    }

    // Get current criteria
    const criteriaSelect = document.getElementById('searchCriteria');
    const criteria = criteriaSelect ? criteriaSelect.value : 'all';

    // Filter routes based on search text and criteria
    const searchText = filterText.toLowerCase().trim();
    const filteredRoutes = routes.filter(r => {
        if (!searchText) return true;

        const matchRoute = (r.name || '').toLowerCase().includes(searchText);

        const assignedBuses = allBuses.filter(b => (r.buses || []).includes(b.busNo));
        const matchBus = assignedBuses.some(b => (b.busNo || '').toLowerCase().includes(searchText));

        const stopsStr = Array.isArray(r.stops) ? r.stops.join(' ') : String(r.stops || '');
        const matchStop = stopsStr.toLowerCase().includes(searchText);

        if (criteria === 'route') return matchRoute;
        if (criteria === 'bus') return matchBus;
        if (criteria === 'stop') return matchStop;

        // Default 'all'
        return matchRoute || matchBus || matchStop;
    });

    if (filteredRoutes.length === 0) {
        container.innerHTML = `<div style="color:#666; padding:20px; text-align:center;">No routes found matching "${escapeHtml(filterText)}" (${criteria})</div>`;
        return;
    }

    filteredRoutes.forEach((r, idx) => {
        const card = document.createElement('div');
        card.className = 'bus-card';

        // --- Find assigned buses ---
        // r.buses is an array of busNo strings
        const assignedBuses = allBuses.filter(b => (r.buses || []).includes(b.busNo));

        let busDetailsHtml = '';
        if (assignedBuses.length > 0) {
            busDetailsHtml = assignedBuses.map(b =>
                `<div><strong>${escapeHtml(b.busNo)}</strong> <span style="font-size:0.9em; color:#666">(${escapeHtml(b.driverName || 'No Driver')})</span></div>`
            ).join('');
        } else {
            busDetailsHtml = '<div>No bus assigned</div>';
        }

        const header = document.createElement('div'); header.className = 'bus-header';
        // Bus Number in header? or Route Name? User asked for "bus number and respective phone number" in the full view.
        // Let's put Route Name in header.
        const h3 = document.createElement('h3');
        h3.innerHTML = `<span>🚌</span> ${escapeHtml(r.name || ('Route ' + (idx + 1)))}`;
        const live = document.createElement('div'); live.className = 'live-indicator';
        header.appendChild(h3); header.appendChild(live);

        const mapWrap = document.createElement('div'); mapWrap.className = 'bus-map';

        // --- Prepare Stops (moved up for map query) ---
        const parseStopsLocal = (input) => { if (!input) return []; return String(input).split(/→|->|,|\|/).map(s => s.trim()).filter(Boolean); };
        const stops = Array.isArray(r.stops) ? r.stops : parseStopsLocal(r.stops || '');

        // Google Map Component (Iframe)
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = '0';
        iframe.loading = 'lazy';
        iframe.allowFullscreen = true;

        // Use the first stop as the query location, or fallback to 'Madurai, Tamil Nadu'
        const locationQuery = (stops.length > 0) ? stops[0] : 'Madurai, Tamil Nadu';
        iframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(locationQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

        mapWrap.appendChild(iframe);

        // Note: SVG/Image placeholder removed in favor of GMap iframe.

        // Note: SVG visualization removed in favor of static Google Map image as requested.


        // --- Info Section ---
        const info = document.createElement('div'); info.className = 'bus-info';

        // Summary View (Always Visible)
        // "then source and destination stop and then 2 intermediate stops"
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'route-summary';

        if (stops.length > 0) {
            const start = stops[0];
            const end = stops[stops.length - 1];
            // Pick up to 2 intermediate stops
            let intermediates = [];
            if (stops.length > 2) {
                // If we have just 1 intermediate (len=3), take it.
                // If we have many, pick 2 reasonably spaced? or just next 2?
                // "then 2 intermediate stops"
                if (stops.length === 3) intermediates.push(stops[1]);
                else if (stops.length >= 4) {
                    intermediates.push(stops[1]);
                    intermediates.push(stops[2]);
                    // or maybe middle ones? Let's stick to first 2 after start for consistency
                }
            }

            let summaryHtml = `<div style="margin-bottom:4px"><strong>Start:</strong> ${escapeHtml(start)}</div>`;
            if (intermediates.length > 0) {
                intermediates.forEach(s => {
                    summaryHtml += `<div style="margin-bottom:4px; color:#666; font-size:0.9em; padding-left:8px;">↓ ${escapeHtml(s)}</div>`;
                });
            }
            if (stops.length > 4) {
                summaryHtml += `<div style="margin-bottom:4px; color:#999; font-size:0.8em; padding-left:12px;">... (+${stops.length - 4} more) ...</div>`;
            }
            summaryHtml += `<div><strong>End:</strong> ${escapeHtml(end)}</div>`;
            summaryDiv.innerHTML = summaryHtml;
        } else {
            summaryDiv.innerHTML = '<em>No stops defined</em>';
        }
        info.appendChild(summaryDiv);

        // --- Details Section (Hidden by default, shown on hover/click) ---
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'route-details-full';
        detailsDiv.style.display = 'none';
        detailsDiv.style.marginTop = '15px';
        detailsDiv.style.paddingTop = '10px';
        detailsDiv.style.borderTop = '1px solid #eee';

        // Bus Info
        const busInfoDiv = document.createElement('div');
        busInfoDiv.style.marginBottom = '10px';
        busInfoDiv.style.background = '#f9f9f9';
        busInfoDiv.style.padding = '8px';
        busInfoDiv.style.borderRadius = '8px';
        busInfoDiv.innerHTML = `<h4 style="margin:0 0 5px 0; font-size:0.95rem; color:#444;">Bus Details</h4>` + busDetailsHtml;
        detailsDiv.appendChild(busInfoDiv);

        // Full Route List
        const fullRouteDiv = document.createElement('div');
        fullRouteDiv.innerHTML = `<h4 style="margin:0 0 10px 0; font-size:0.95rem; color:#444;">Full Route</h4>`;
        const list = document.createElement('div');
        list.style.display = 'flex';
        list.style.flexDirection = 'column';
        list.style.marginLeft = '10px';
        list.style.borderLeft = '2px dotted #aaa'; // Dotted line effect
        list.style.paddingLeft = '15px';

        stops.forEach((s, i) => {
            const item = document.createElement('div');
            item.style.position = 'relative';
            item.style.marginBottom = '8px';
            item.style.fontSize = '0.9rem';
            item.style.color = (i === 0 || i === stops.length - 1) ? '#000' : '#555';
            item.style.fontWeight = (i === 0 || i === stops.length - 1) ? 'bold' : 'normal';

            // Bullet point
            const dot = document.createElement('div');
            dot.style.position = 'absolute';
            dot.style.left = '-21px'; // adjust based on padding and border width
            dot.style.top = '6px';
            dot.style.width = '10px';
            dot.style.height = '10px';
            dot.style.borderRadius = '50%';
            dot.style.background = (i === 0 || i === stops.length - 1) ? '#667eea' : '#fff';
            dot.style.border = '2px solid #667eea';

            item.appendChild(dot);
            item.appendChild(document.createTextNode(s));
            list.appendChild(item);
        });
        fullRouteDiv.appendChild(list);
        detailsDiv.appendChild(fullRouteDiv);

        info.appendChild(detailsDiv);

        card.appendChild(header); card.appendChild(mapWrap); card.appendChild(info);
        container.appendChild(card);

        // Interaction Logic
        // "pop up on hovering and can also be clicked"
        // "only when the user hover and click on the specific card the full route will be displayed"

        // This likely means:
        // Hover -> Show details
        // Click -> Toggle details (persistent) or maybe link to track page?
        // User said "click on the specific card the full route will be displayed", usually means expanding the card.

        let isExpanded = false;

        const expand = () => {
            detailsDiv.style.display = 'block';
            mapWrap.style.height = '100px'; // shrink map slightly or keep same?
            // animate height?
        };
        const collapse = () => {
            if (!isExpanded) {
                detailsDiv.style.display = 'none';
                mapWrap.style.height = '200px';
            }
        };

        card.addEventListener('mouseenter', expand);
        card.addEventListener('mouseleave', collapse);

        card.addEventListener('click', (e) => {
            // Don't trigger if clicked on interactives if we had any
            isExpanded = !isExpanded;
            if (isExpanded) {
                expand();
                card.style.transform = 'scale(1.02)';
                card.style.zIndex = '10';
            } else {
                card.style.transform = '';
                card.style.zIndex = '1';
                // If mouse is still over, remain expanded?
                // Standard behavior: click toggles "locked open" state
            }
        });
    });
}

// Auto-update dashboard when admin makes changes in another tab
window.addEventListener('storage', function (e) {
    if (e.key === 'routes' || e.key === 'buses') {
        console.log('Data changed, refreshing dashboard routes...');
        renderDashboardRoutes();
    }
});