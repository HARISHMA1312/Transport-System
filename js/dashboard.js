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


// Auto-update dashboard when admin makes changes in another tab
window.addEventListener('storage', function (e) {
  if (e.key === 'routes' || e.key === 'buses') {
    console.log('Data changed, refreshing dashboard routes...');
    renderDashboardRoutes();
  }
});


// User Dashboard with Interactive Maps - JavaScript
// NO HARDCODED DATA - All from localStorage

let routeMaps = {};

// Load data from localStorage
function loadRoutes() {
  try {
    return JSON.parse(localStorage.getItem('routes') || '[]');
  } catch (e) {
    return [];
  }
}

function loadBuses() {
  try {
    return JSON.parse(localStorage.getItem('buses') || '[]');
  } catch (e) {
    return [];
  }
}

function loadUserProfile() {
  try {
    const profile = JSON.parse(localStorage.getItem('userProfile') || 'null');
    if (profile) return profile;

    // Fallback to userLogin session
    const session = JSON.parse(localStorage.getItem('userLogin') || 'null');
    if (session) {
      return {
        name: session.name || 'User',
        phone: session.phone || '',
        busRoute: '',
        department: ''
      };
    }

    return {
      name: 'User',
      phone: '',
      busRoute: '',
      department: ''
    };
  } catch (e) {
    return {
      name: 'User',
      phone: '',
      busRoute: '',
      department: ''
    };
  }
}

function saveUserProfile(profile) {
  localStorage.setItem('userProfile', JSON.stringify(profile));
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function initDashboard() {
  const profile = loadUserProfile();

  const userName = document.getElementById('userName');
  if (userName) userName.textContent = profile.name || 'User';

  const profileName = document.getElementById('profileName');
  if (profileName) profileName.value = profile.name || '';

  const profilePhone = document.getElementById('profilePhone');
  if (profilePhone) profilePhone.value = profile.phone || '';

  // Populate route select in profile from localStorage routes
  const busRouteSelect = document.getElementById('busRoute');
  if (busRouteSelect) {
    busRouteSelect.innerHTML = '<option value="">-- Select Bus Route --</option>';
    const routes = loadRoutes();
    routes.forEach(r => {
      const option = document.createElement('option');
      option.value = r.name;
      option.textContent = r.name;
      busRouteSelect.appendChild(option);
    });
    busRouteSelect.value = profile.busRoute || '';
  }

  const department = document.getElementById('department');
  if (department) department.value = profile.department || '';

  renderDashboardRoutes();
}

function createRouteMap(containerId, stops) {
  // Small delay to ensure container is in DOM
  setTimeout(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const map = L.map(containerId, {
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    if (!stops || stops.length === 0) {
      map.setView([9.9252, 78.1198], 13);
      return;
    }

    // Add markers
    stops.forEach((stop, idx) => {
      let color = 'blue';
      if (stop.type === 'source') color = 'green';
      if (stop.type === 'destination') color = 'red';

      const icon = L.divIcon({
        className: 'custom-card-marker', // Updated for css
        html: `<div style="background: ${color}; width: 25px; height: 25px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">${idx + 1}</div>`,
        iconSize: [25, 25],
        iconAnchor: [12, 12]
      });

      L.marker([stop.lat, stop.lng], { icon })
        .addTo(map)
        .bindPopup(`<strong>${stop.name}</strong><br>${stop.type}`);
    });

    // Draw polyline
    if (stops.length > 1) {
      const latlngs = stops.map(s => [s.lat, s.lng]);
      const polyline = L.polyline(latlngs, {
        color: '#667eea',
        weight: 3,
        opacity: 0.7
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
    } else if (stops.length === 1) {
      map.setView([stops[0].lat, stops[0].lng], 13);
    }

    routeMaps[containerId] = map;
  }, 100);
}

function renderDashboardRoutes(filterText = '') {
  const container = document.getElementById('busCardsContainer');
  if (!container) return;

  container.innerHTML = '';

  // Load from localStorage - this is what admin adds!
  const routes = loadRoutes();
  const buses = loadBuses();

  console.log('Loading routes from localStorage:', routes.length);
  console.log('Loading buses from localStorage:', buses.length);

  if (routes.length === 0) {
    container.innerHTML = `
      <div class="no-data-message">
        <h3>No Routes Available</h3>
        <p>Please contact admin to add bus routes</p>
      </div>
    `;
    return;
  }

  const searchText = filterText.toLowerCase().trim();
  const criteria = document.getElementById('searchCriteria')?.value || 'all';

  const filteredRoutes = routes.filter(r => {
    if (!searchText) return true;

    const matchRoute = (r.name || '').toLowerCase().includes(searchText);
    const assignedBuses = buses.filter(b => (r.buses || []).includes(b.busNo));
    const matchBus = assignedBuses.some(b => (b.busNo || '').toLowerCase().includes(searchText));
    const matchStop = (r.stops || []).some(s => (s.name || '').toLowerCase().includes(searchText));

    if (criteria === 'route') return matchRoute;
    if (criteria === 'bus') return matchBus;
    if (criteria === 'stop') return matchStop;
    return matchRoute || matchBus || matchStop;
  });

  if (filteredRoutes.length === 0) {
    container.innerHTML = `
      <div class="no-data-message">
        <h3>No Routes Found</h3>
        <p>No routes matching "${escapeHtml(filterText)}"</p>
      </div>
    `;
    return;
  }

  filteredRoutes.forEach((route, idx) => {
    const card = document.createElement('div');
    card.className = 'bus-card';
    card.id = `card-${idx}`;

    const mapId = `map-${idx}`;

    // Get assigned buses from localStorage
    const assignedBuses = buses.filter(b => (route.buses || []).includes(b.busNo));
    let busDetailsHtml = '';
    if (assignedBuses.length > 0) {
      busDetailsHtml = assignedBuses.map(b =>
        `<div class="bus-detail"><strong>${escapeHtml(b.busNo)}</strong> - ${escapeHtml(b.driverName || 'No Driver')}<br><small>${escapeHtml(b.driverPhone || '')}</small></div>`
      ).join('');
    } else {
      busDetailsHtml = '<div class="bus-detail">No bus assigned</div>';
    }

    // Get stops
    const stops = route.stops || [];
    const source = stops.find(s => s.type === 'source');
    const dest = stops.find(s => s.type === 'destination');
    const intermediates = stops.filter(s => s.type === 'intermediate');

    // Summary
    let summaryHtml = '';
    if (stops.length === 0) {
      summaryHtml = '<div style="color:#999;">No stops defined</div>';
    } else {
      if (source) {
        summaryHtml += `<div><strong>Start:</strong> ${escapeHtml(source.name)}</div>`;
      }
      if (intermediates.length > 0) {
        intermediates.slice(0, 2).forEach(s => {
          summaryHtml += `<div style="color:#666; font-size:0.9em; padding-left:8px;">↓ ${escapeHtml(s.name)}</div>`;
        });
        if (intermediates.length > 2) {
          summaryHtml += `<div style="color:#999; font-size:0.8em; padding-left:12px;">... (+${intermediates.length - 2} more) ...</div>`;
        }
      }
      if (dest) {
        summaryHtml += `<div><strong>End:</strong> ${escapeHtml(dest.name)}</div>`;
      }
    }

    // Full route list
    let fullRouteHtml = '';
    if (stops.length > 0) {
      stops.forEach((s, i) => {
        const isFirst = i === 0;
        const isLast = i === stops.length - 1;
        const className = isFirst ? 'start' : (isLast ? 'end' : '');
        fullRouteHtml += `<div class="route-point ${className}"><strong>${escapeHtml(s.name)}</strong></div>`;
      });
    } else {
      fullRouteHtml = '<div style="color:#999;">No stops available</div>';
    }

    card.innerHTML = `
      <div class="bus-header">
        <h3><span>🚌</span> ${escapeHtml(route.name)}</h3>
        <div class="live-indicator"></div>
      </div>
      <div class="bus-map">
        <div id="${mapId}" style="width:100%; height:100%; min-height: 200px;"></div>
      </div>
      <div class="bus-info">
        <div class="route-summary">${summaryHtml}</div>
        <div class="route-details-full">
          <div class="bus-info-section">
            <h4>Bus Details</h4>
            ${busDetailsHtml}
          </div>
          <div class="full-route-list">
            <h4>Full Route</h4>
            <div class="route-list">
              ${fullRouteHtml}
            </div>
          </div>
        </div>
      </div>
    `;

    container.appendChild(card);

    // Create map with stops from localStorage
    createRouteMap(mapId, stops);

    // Card interactions
    let isExpanded = false;

    const toggleExpand = () => {
      isExpanded = !isExpanded;
      if (isExpanded) {
        card.classList.add('expanded');
      } else {
        card.classList.remove('expanded');
      }

      // Invalidate map size after expansion
      setTimeout(() => {
        const map = routeMaps[mapId];
        if (map) {
          map.invalidateSize();
          if (stops.length > 1) {
            const latlngs = stops.map(s => [s.lat, s.lng]);
            const bounds = L.latLngBounds(latlngs);
            map.fitBounds(bounds, { padding: [20, 20] });
          }
        }
      }, 300);
    };

    card.addEventListener('click', toggleExpand);

    card.addEventListener('mouseenter', () => {
      if (!isExpanded) {
        card.querySelector('.route-details-full').style.display = 'block';
      }
    });

    card.addEventListener('mouseleave', () => {
      if (!isExpanded) {
        card.querySelector('.route-details-full').style.display = 'none';
      }
    });
  });
}

// Search functionality
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

// Profile functions
window.showProfile = function () {
  document.getElementById('mainContent').style.display = 'none';
  document.getElementById('profilePage').classList.add('active');
};

window.showMain = function () {
  document.getElementById('profilePage').classList.remove('active');
  document.getElementById('mainContent').style.display = 'block';
};

window.saveProfile = function (event) {
  event.preventDefault();

  const name = document.getElementById('profileName').value;
  const busRoute = document.getElementById('busRoute').value;
  const department = document.getElementById('department').value;
  const phone = document.getElementById('profilePhone').value;

  const profile = {
    name: name,
    phone: phone,
    busRoute: busRoute,
    department: department
  };

  saveUserProfile(profile);

  // Also update in users array for admin view
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const normalizePhone = (p) => {
      if (!p) return '';
      const d = String(p).replace(/[^0-9]/g, '');
      return d.length >= 10 ? '+91 ' + d.slice(-10) : p;
    };
    const userIndex = users.findIndex(u => normalizePhone(u.phone) === normalizePhone(phone));
    if (userIndex !== -1) {
      users[userIndex].name = name;
      users[userIndex].busRoute = busRoute;
      users[userIndex].department = department;
      localStorage.setItem('users', JSON.stringify(users));
    }
  } catch (e) {
    console.error('Error updating users array:', e);
  }

  document.getElementById('userName').textContent = name;

  alert('Profile updated successfully!');
  window.showMain();
};

// Listen for localStorage changes from admin panel
window.addEventListener('storage', function (e) {
  if (e.key === 'routes' || e.key === 'buses') {
    console.log('Data changed by admin, refreshing dashboard...');
    renderDashboardRoutes();
  }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
});