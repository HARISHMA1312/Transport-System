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

// Socket.io initialization
let socket;
try {
  socket = io();
} catch (e) {
  console.error("Socket.io not found. Are you running on port 3000?", e);
  // Default dummy socket to prevent crash if on wrong port
  socket = { on: () => { }, emit: () => { } };
  alert(`Live tracking requires the Node.js server (Port 3000).\nYou are currently on: ${window.location.href}\nPlease use: http://localhost:3000/dashboard.html`);
}

let routeMaps = {}; // Stores map instances
let activeWatchId = null;
let activeTrackingRoute = null;
let userMarker = null;
let busMarker = null;
let routePolyline = null;


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

function createRouteMap(containerId, route) {
  // Small delay to ensure container is in DOM
  setTimeout(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    // specific map instance
    const map = L.map(containerId, {
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const stops = route.stops || [];

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

    // Draw Route Path
    if (route.geometry && route.geometry.length > 0) {
      // Use the saved detailed geometry
      const polyline = L.polyline(route.geometry, {
        color: '#667eea',
        weight: 4,
        opacity: 0.8,
        lineJoin: 'round'
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
    } else if (stops.length > 1) {
      // Fallback: Straight lines between stops
      const latlngs = stops.map(s => [s.lat, s.lng]);
      const polyline = L.polyline(latlngs, {
        color: '#667eea',
        weight: 3,
        opacity: 0.7,
        dashArray: '5, 5' // Dotted to indicate straight line approximation
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
    } else if (stops.length === 1) {
      map.setView([stops[0].lat, stops[0].lng], 13);
    }

    routeMaps[containerId] = map;
  }, 100);
}

// Haversine formula to calculate distance
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat1)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}

let activeRouteData = null; // Stores current route object for geometry calculations

// ... (existing variables)

// Helper: Get point on segment closest to P
function getNearestPointOnSegment(P, A, B) {
  const x = P.lat, y = P.lng;
  const x1 = A[0], y1 = A[1];
  const x2 = B[0], y2 = B[1];

  const A_kw = x - x1;
  const B_kw = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A_kw * C + B_kw * D;
  const len_sq = C * C + D * D;
  let param = -1;

  if (len_sq !== 0) param = dot / len_sq;

  let xx, yy;

  if (param < 0) {
    xx = x1; yy = y1;
  } else if (param > 1) {
    xx = x2; yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  return L.latLng(xx, yy);
}

// Helper: Find nearest point on route geometry and its index
function findNearestPointOnRoute(latLng, geometry) {
  let minDist = Infinity;
  let nearestPoint = null;
  let nearestIndex = -1;

  for (let i = 0; i < geometry.length - 1; i++) {
    const P = getNearestPointOnSegment(latLng, geometry[i], geometry[i + 1]);
    const dist = latLng.distanceTo(P); // Leaflet distanceTo (meters)

    if (dist < minDist) {
      minDist = dist;
      nearestPoint = P;
      nearestIndex = i;
    }
  }
  return { point: nearestPoint, index: nearestIndex, distance: minDist };
}

// Helper: Calculate distance along route geometry points
function getRouteDistance(geometry, startIndex, endIndex) {
  let dist = 0;
  // Ensure we go forward (if cyclic, this simple logic might just take short path or fail, assuming linear-ish routes for now)
  // If endIndex < startIndex, it implies user is 'behind' bus? Handle simple case: swapping? 
  // For bus tracking, we want Bus -> User. 

  if (startIndex > endIndex) {
    // Swap to calculate the segment length, but logic should handle direction
    let temp = startIndex; startIndex = endIndex; endIndex = temp;
  }

  for (let i = startIndex; i < endIndex; i++) {
    const p1 = L.latLng(geometry[i][0], geometry[i][1]);
    const p2 = L.latLng(geometry[i + 1][0], geometry[i + 1][1]);
    dist += p1.distanceTo(p2);
  }
  return dist;
}

function startLiveTracking(map, routeName, cardId) {
  if (activeTrackingRoute === routeName) return;

  // Find and store route data
  const routes = loadRoutes();
  const foundRoute = routes.find(r => r.name === routeName);
  activeRouteData = foundRoute || null;

  // Leave previous room if any
  if (activeTrackingRoute) {
    console.log(`[Dashboard] Leaving room: ${activeTrackingRoute}`);
    socket.emit('leave-bus-room', activeTrackingRoute);
  }

  // Clear previous tracking if any
  if (activeWatchId) navigator.geolocation.clearWatch(activeWatchId);
  userMarker = null;
  busMarker = null;
  activeWatchId = null; // Ensure ID is reset

  if (routePolyline) {
    if (map.hasLayer(routePolyline)) map.removeLayer(routePolyline);
    routePolyline = null;
  }

  activeTrackingRoute = routeName;
  const card = document.getElementById(cardId);
  const liveIndicator = card.querySelector('.live-indicator');
  const infoSection = card.querySelector('.bus-info-section'); // Where we'll show stats

  // Add stats container if not exists
  let statsContainer = infoSection.querySelector('.live-stats');
  if (!statsContainer) {
    statsContainer = document.createElement('div');
    statsContainer.className = 'live-stats';
    statsContainer.style.background = '#f0f9ff';
    statsContainer.style.padding = '10px';
    statsContainer.style.borderRadius = '8px';
    statsContainer.style.marginTop = '10px';
    statsContainer.style.border = '1px solid #bae6fd';
    statsContainer.innerHTML = '<div id="stats-dist">Waiting for GPS...</div><div id="stats-eta"></div>';
    infoSection.insertBefore(statsContainer, infoSection.firstChild);
  }

  liveIndicator.innerHTML = '<span style="color:red; font-weight:bold; animation: blink 1s infinite;">● LIVE</span>';

  // 2. Listen for Bus Location (Register before joining)
  socket.off('bus-location-update');

  socket.on('bus-location-update', (data) => {
    // console.log(`[Dashboard] Received location update for ${data.routeId}`, data);

    // Strict filtering: Normalize both ID and Name to string and trim
    const updateId = String(data.routeId).trim().toLowerCase();
    const currentRoute = String(routeName).trim().toLowerCase();

    if (updateId !== currentRoute) {
      return;
    }

    const busLat = data.lat;
    const busLng = data.lng;

    // Update Bus Marker
    if (!busMarker) {
      console.log("[Dashboard] Creating Bus Marker");
      const busIcon = L.divIcon({
        className: 'bus-marker-icon',
        html: '<div style="font-size:24px;">🚌</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
      busMarker = L.marker([busLat, busLng], { icon: busIcon, zIndexOffset: 1000 }).addTo(map).bindPopup("Bus: " + (data.speed ? Math.round(data.speed * 3.6) + " km/h" : ""));
    } else {
      busMarker.setLatLng([busLat, busLng]);
    }

    // If we have user location, update lines and stats
    if (userMarker) {
      const userPos = userMarker.getLatLng();
      updateRouteLines(map, userPos.lat, userPos.lng);

      // We handle stats updates inside updateRouteLines now (for OSRM / Hybrid)
      // BUT for fallback or direct calc, we might touch them. 
      // Let's leave the old logic as immediate backup? 
      // Actually updateRouteLines is async, so it will overwrite.
    }
  });

  // 1. Get User Location (Starts immediately)
  if (navigator.geolocation) {
    console.log("[Dashboard] Requesting Geolocation permission...");
    activeWatchId = navigator.geolocation.watchPosition((position) => {
      // console.log("[Dashboard] Geolocation received:", position.coords);
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      // Update User Marker
      if (!userMarker) {
        // console.log("[Dashboard] Creating User Marker at", userLat, userLng);
        const userIcon = L.divIcon({
          className: 'custom-user-icon',
          html: '<div class="user-marker-pulse"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map)
          .bindTooltip("You", { permanent: true, direction: 'top', offset: [0, -10] });
      } else {
        userMarker.setLatLng([userLat, userLng]);
      }
      updateRouteLines(map, userLat, userLng);
    }, (err) => {
      console.error("[Dashboard] Geolocation error:", err);
      // alert(`GPS Error: ${err.message}`); // Uncomment for debugging
      if (err.code === 1) {
        // PERMISSION_DENIED
        console.warn("User denied Geolocation or insecure origin.");
        alert("Location Access Denied. Please enable GPS permissions. \n\nNote: Chrome mobile blocks GPS on 'http'.");
      } else if (err.message && err.message.toLowerCase().includes("secure")) {
        alert("Security Error: Mobile browsers block GPS on 'http://'. \n\nTry using Firefox or enable 'Insecure origins treated as secure' in Chrome flags.");
      }
    }, { enableHighAccuracy: true });
  }

  // 3. Listen for Bus Offline
  socket.on('bus-offline', (routeId) => {
    const offlineId = String(routeId).trim().toLowerCase();
    const currentRoute = String(routeName).trim().toLowerCase();

    if (offlineId === currentRoute) {
      console.log(`[Dashboard] Bus ${routeName} went offline.`);
      if (busMarker) {
        map.removeLayer(busMarker);
        busMarker = null;
      }
      if (routePolyline) {
        map.removeLayer(routePolyline);
        routePolyline = null;
      }
      alert(`Bus ${routeName} has stopped tracking.`);
    }
  });

  // Join Room (Now that listener is ready)
  console.log(`[Dashboard] Joining room: ${routeName}`);
  socket.emit('join-bus-room', routeName);
}

// OSRM Routing Helper
async function fetchRoutePath(start, end) {
  // start/end: {lat, lng}
  try {
    const coords = `${start.lng},${start.lat};${end.lng},${end.lat}`;
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
    );

    if (!response.ok) return null;
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        path: route.geometry.coordinates.map(c => [c[1], c[0]]), // to LatLng
        distance: route.distance, // in meters
        duration: route.duration // in seconds
      };
    }
    return null;
  } catch (e) {
    console.error("Routing Error:", e);
    return null;
  }
}

async function updateRouteLines(map, userLat, userLng) {
  if (!userMarker || !busMarker) return;

  const userPos = userMarker.getLatLng();
  const busPos = busMarker.getLatLng();

  // Default values
  let latlngs = [userPos, busPos];
  let dist = 0;
  let duration = 0;
  let usedHybrid = false;

  // HYBRID LOGIC: Check if on route
  if (activeRouteData && activeRouteData.geometry && activeRouteData.geometry.length > 1) {
    const routeGeom = activeRouteData.geometry; // Array of [lat, lng]

    // Check proximity (Threshold: 200 meters)
    const busSnap = findNearestPointOnRoute(busPos, routeGeom);
    const userSnap = findNearestPointOnRoute(userPos, routeGeom);

    // If both are close to the route
    if (busSnap.distance < 200 && userSnap.distance < 200) {
      usedHybrid = true;

      // Extract Geometry Slice
      let idx1 = busSnap.index;
      let idx2 = userSnap.index;

      // Handle directions? Assuming Bus -> User direction for now
      // If User is 'upstream' (lower index), we might just show path backward or forward?
      // Let's just grab slice between min and max and reverse if needed?
      // Actually for ETA we assume Bus moves towards Destination. 
      // If user is BEHIND bus, ETA shouldn't be valid? 
      // For simplicity: Just show path between them along route.

      const startIndex = Math.min(idx1, idx2);
      const endIndex = Math.max(idx1, idx2);

      const pathPoints = [];
      pathPoints.push(busPos); // Start at bus
      // Add middle points
      for (let i = startIndex + 1; i <= endIndex; i++) {
        pathPoints.push(L.latLng(routeGeom[i][0], routeGeom[i][1]));
      }
      pathPoints.push(userPos); // End at user

      latlngs = pathPoints;

      // Calculate Distance along route
      dist = getRouteDistance(routeGeom, startIndex, endIndex) / 1000; // km
      // Approx time
      duration = (dist / 40) * 60; // default 40km/h
    }
  }

  // Fallback to OSRM if not on route
  if (!usedHybrid) {
    // Try to get road path
    const routeData = await fetchRoutePath(userPos, busPos);

    if (routeData) {
      latlngs = routeData.path;
      dist = routeData.distance / 1000; // km
      duration = routeData.duration / 60; // mins
    } else {
      // Straight line fallback
      dist = getDistanceFromLatLonInKm(userPos.lat, userPos.lng, busPos.lat, busPos.lng);
      duration = (dist / 40) * 60;
    }
  }

  // Update Polyline
  if (routePolyline) {
    routePolyline.setLatLngs(latlngs);
  } else {
    routePolyline = L.polyline(latlngs, {
      color: usedHybrid ? '#10b981' : '#3b82f6', // Green if on-route, Blue if off-route
      weight: 5,
      opacity: 0.8,
      lineJoin: 'round'
    }).addTo(map);
  }

  // Update Color if changed mode
  routePolyline.setStyle({ color: usedHybrid ? '#10b981' : '#3b82f6' });

  // Update Stats UI
  const distEl = document.getElementById('stats-dist');
  if (distEl) distEl.innerHTML = `<strong>Distance:</strong> ${dist.toFixed(2)} km ${usedHybrid ? '(On Route)' : ''}`;

  const etaEl = document.getElementById('stats-eta');
  if (etaEl) etaEl.innerHTML = `<strong>Est. Time:</strong> ${Math.ceil(duration)} mins`;

  // Fit bounds nicely
  const bounds = L.latLngBounds(latlngs);
  map.fitBounds(bounds, { padding: [50, 50] });
}

async function renderDashboardRoutes(filterText = '') {
  const container = document.getElementById('busCardsContainer');
  if (!container) return;

  container.innerHTML = '';

  // Fetch from Server (Centralized Data)
  let routes = [];
  let buses = [];

  try {
    const res = await fetch('/api/data');
    const data = await res.json();
    routes = data.routes || [];
    buses = data.buses || [];
  } catch (e) {
    console.error("Failed to load data from server", e);
    // Fallback to local if server fails (optional)
    // routes = loadRoutes(); 
  }

  console.log('Loaded routes from Server:', routes.length);
  console.log('Loaded buses from Server:', buses.length);

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
    createRouteMap(mapId, route);

    // Card interactions
    let isExpanded = false;

    const toggleExpand = () => {
      isExpanded = !isExpanded;
      if (isExpanded) {
        card.classList.add('expanded');

        // Start Live Tracking when expanded
        console.log(`[Dashboard] Card expanded for ${route.name}. Checking map...`);
        const map = routeMaps[mapId];
        if (map) {
          console.log("[Dashboard] Map found. Starting tracking...");
          startLiveTracking(map, route.name, card.id);

          // Force map resize fix
          setTimeout(() => {
            map.invalidateSize();
          }, 200);
        } else {
          console.error("[Dashboard] Map object NOT found for " + mapId);
          alert("Map Error: Please refresh the page.");
        }

      } else {
        card.classList.remove('expanded');
        // Optional: Stop tracking to save battery/data? 
        // For now, we keep it running or logic can be added to stop.
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