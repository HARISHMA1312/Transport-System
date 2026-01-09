function adminLogin() {
  const user = document.getElementById("adminUser").value;
  const pass = document.getElementById("adminPass").value;

  if (user === "admin" && pass === "admin123") {
    window.location.href = "admin-dashboard.html";

  } else {
    document.getElementById("error").innerText = "Invalid admin credentials";
  }
}

// --- Buses and Routes Management (localStorage-backed) ---

// Buses: { busNo, driverName, driverPhone, status }
function loadBuses() {
  try {
    return JSON.parse(localStorage.getItem('buses') || '[]');
  } catch (e) { return []; }
}

function saveBuses(buses) {
  localStorage.setItem('buses', JSON.stringify(buses));
}

function renderAdminStats(tries = 5) {
  const busCountEl = document.getElementById('busCount');
  const activeEl = document.getElementById('activeBusCount');
  const userEl = document.getElementById('userCount');
  const routeEl = document.getElementById('routeCount');
  const buses = loadBuses() || [];
  const routes = loadRoutes() || [];
  // compute users count by merging users, userProfile, and profiles (same logic as renderUsers)
  let users = [];
  try { users = JSON.parse(localStorage.getItem('users') || '[]') || []; } catch(e) { users = []; }
  const mergedUsers = {};
  function normalizePhone(p) { if (!p) return ''; const d = String(p).replace(/[^0-9]/g,''); return d.length>=10?'+91 '+d.slice(-10):p; }
  (users || []).forEach(u => { const k = normalizePhone(u.phone); mergedUsers[k] = Object.assign({}, u); mergedUsers[k].phone = k; });
  try { const single = JSON.parse(localStorage.getItem('userProfile') || 'null'); if (single && single.phone) { const k = normalizePhone(single.phone); mergedUsers[k] = Object.assign({}, mergedUsers[k] || {}, single); mergedUsers[k].phone = k; } } catch(e) {}
  try { const profiles = JSON.parse(localStorage.getItem('profiles') || '[]'); (profiles||[]).forEach(p => { const k = normalizePhone(p.phone); mergedUsers[k] = Object.assign({}, mergedUsers[k] || {}, p); mergedUsers[k].phone = k; }); } catch(e) {}
  const userCount = Object.keys(mergedUsers).length;
  // If dashboard elements are not present yet, retry a few times
  if (!busCountEl && !activeEl && !userEl && !routeEl && tries > 0) {
    console.log('renderAdminStats: dashboard elements not found, retrying...', tries);
    setTimeout(() => renderAdminStats(tries - 1), 200);
    return;
  }
  if (!busCountEl && !activeEl && !userEl && !routeEl) {
    console.log('renderAdminStats: dashboard elements not found, giving up');
    return;
  }
  if (busCountEl) busCountEl.textContent = buses.length;
  const active = buses.filter(b => (b.status || '').toLowerCase() === 'active').length;
  if (activeEl) activeEl.textContent = active;
  if (userEl) userEl.textContent = userCount;
  if (routeEl) routeEl.textContent = routes.length;
}

function renderBuses() {
  const tbody = document.getElementById('busesTbody');
  if (!tbody) return;
  const buses = loadBuses();
  tbody.innerHTML = '';
  buses.forEach((b, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${escapeHtml(b.busNo)}</td>
      <td>${escapeHtml(b.driverName)}<br><small>${escapeHtml(b.driverPhone)}</small></td>
      <td>${escapeHtml(b.status)}</td>
      <td>
        <button type="button" data-action="edit" data-index="${idx}">Edit</button>
        <button type="button" data-action="delete" data-index="${idx}" style="margin-left:8px;">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  });
    // refresh routes page dropdown if present
    try { renderRouteBusesDropdown(); } catch (e) {}
}

function clearBusForm() {
  document.getElementById('busNo').value = '';
  document.getElementById('driverName').value = '';
  document.getElementById('driverPhone').value = '';
  document.getElementById('busStatus').value = 'Active';
  document.getElementById('addBusBtn').innerText = 'Add Bus';
  document.getElementById('addBusBtn').removeAttribute('data-edit-index');
  document.getElementById('cancelEditBusBtn').style.display = 'none';
}

function addOrSaveBus() {
  const busNo = document.getElementById('busNo').value.trim();
  const driverName = document.getElementById('driverName').value.trim();
  const driverPhone = document.getElementById('driverPhone').value.trim();
  const status = document.getElementById('busStatus').value;
  if (!busNo) { alert('Bus Number is required'); return; }
  const buses = loadBuses();
  const editIndex = document.getElementById('addBusBtn').getAttribute('data-edit-index');
  if (editIndex !== null && editIndex !== undefined) {
    buses[editIndex] = { busNo, driverName, driverPhone, status };
  } else {
    buses.push({ busNo, driverName, driverPhone, status });
  }
  saveBuses(buses);
  renderBuses();
  clearBusForm();
  renderAdminStats();
}

function editBus(index) {
  const buses = loadBuses();
  const b = buses[index];
  if (!b) return;
  document.getElementById('busNo').value = b.busNo;
  document.getElementById('driverName').value = b.driverName;
  document.getElementById('driverPhone').value = b.driverPhone;
  document.getElementById('busStatus').value = b.status;
  const btn = document.getElementById('addBusBtn');
  btn.innerText = 'Save Bus';
  btn.setAttribute('data-edit-index', index);
  document.getElementById('cancelEditBusBtn').style.display = 'inline-block';
}

function deleteBus(index) {
  if (!confirm('Delete this bus?')) return;
  const buses = loadBuses();
  buses.splice(index,1);
  saveBuses(buses);
  renderBuses();
  renderAdminStats();
}

// Routes: { name, stops: [] }
function loadRoutes() {
  try { return JSON.parse(localStorage.getItem('routes') || '[]'); } catch(e){return [];}
}

function saveRoutes(routes) { localStorage.setItem('routes', JSON.stringify(routes)); }

function parseStops(input) {
  if (!input) return [];
  return input.split(/→|->|,|\|/).map(s=>s.trim()).filter(Boolean);
}

function formatStops(stops) {
  return stops.join(' → ');
}

// Route buses helpers: populate dropdown and read selections
function renderRouteBusesDropdown() {
  const sel = document.getElementById('routeBuses');
  if (!sel) return;
  const buses = loadBuses() || [];
  // remember previous selections to preserve when updating list
  const prev = Array.from(sel.options).filter(o=>o.selected).map(o=>o.value);
  sel.innerHTML = '';
  // default placeholder option
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.disabled = true;
  placeholder.selected = prev.length === 0;
  placeholder.text = buses.length ? 'Select a bus' : 'No buses available';
  sel.appendChild(placeholder);
  // populate actual buses
  buses.forEach((b, idx) => {
    const opt = document.createElement('option');
    opt.value = b.busNo || ('bus-' + idx);
    opt.text = (b.busNo || '') + (b.driverName ? (' — ' + b.driverName) : '');
    if (prev.includes(opt.value)) opt.selected = true;
    sel.appendChild(opt);
  });
  // debug: log loaded buses count
  try { console.debug('renderRouteBusesDropdown: loaded buses', buses.length, buses); } catch(e) {}
  // also show debug info on the page for easier inspection
  try {
    const dbg = document.getElementById('routeBusesDebug');
    if (dbg) {
      dbg.textContent = 'Loaded buses: ' + (buses.length || 0) + '\n' + (buses.length ? JSON.stringify(buses, null, 2) : '[]');
    }
  } catch(e) {}
}

function getSelectedRouteBuses() {
  const sel = document.getElementById('routeBuses');
  if (!sel) return [];
  return Array.from(sel.options).filter(o=>o.selected).map(o=>o.value);
}

function renderRoutes() {
  const ul = document.getElementById('routeList');
  if (!ul) return;
  const routes = loadRoutes();
  ul.innerHTML = '';
  routes.forEach((r, idx) => {
    const li = document.createElement('li');
    const busesHtml = (r.buses && r.buses.length) ? ('<div style="margin-top:6px;"><small style="color:#444">Buses: ' + escapeHtml((r.buses||[]).join(', ')) + '</small></div>') : '';
    li.innerHTML = `<strong>${escapeHtml(r.name)}</strong> <span style="margin-left:8px; color:#666">${escapeHtml(formatStops(r.stops))}</span>` + busesHtml + `
      <div style="display:inline-block; margin-left:12px">
        <button type="button" data-action="edit-route" data-index="${idx}">Edit</button>
        <button type="button" data-action="delete-route" data-index="${idx}" style="margin-left:8px;">Delete</button>
      </div>`;
    ul.appendChild(li);
  });
}

function clearRouteForm() {
  document.getElementById('routeName').value = '';
  document.getElementById('stopsInput').value = '';
  document.getElementById('addRouteBtn').innerText = 'Add Route';
  document.getElementById('addRouteBtn').removeAttribute('data-edit-index');
  document.getElementById('cancelEditRouteBtn').style.display = 'none';
  const stopsEditor = document.getElementById('stopsEditor');
  if (stopsEditor) stopsEditor.innerHTML = '';
  const sel = document.getElementById('routeBuses');
  if (sel) Array.from(sel.options).forEach(o=>o.selected = false);
}

function addOrSaveRoute() {
  const name = document.getElementById('routeName').value.trim();
  if (!name) { alert('Route name required'); return; }
  const stops = getStopsFromEditor();
  const routes = loadRoutes();
  const buses = getSelectedRouteBuses();
  const editIndex = document.getElementById('addRouteBtn').getAttribute('data-edit-index');
  if (editIndex !== null && editIndex !== undefined) {
    routes[editIndex] = { name, stops, buses };
  } else {
    routes.push({ name, stops, buses });
  }
  saveRoutes(routes);
  renderRoutes();
  clearRouteForm();
  renderAdminStats();
}

function editRoute(index) {
  const routes = loadRoutes();
  const r = routes[index];
  if (!r) return;
  document.getElementById('routeName').value = r.name;
  document.getElementById('stopsInput').value = formatStops(r.stops);
  const btn = document.getElementById('addRouteBtn');
  btn.innerText = 'Save Route';
  btn.setAttribute('data-edit-index', index);
  document.getElementById('cancelEditRouteBtn').style.display = 'inline-block';
  // render stops into stopsEditor
  const stopsEditor = document.getElementById('stopsEditor');
  if (stopsEditor) {
    stopsEditor.innerHTML = '';
    (r.stops || []).forEach((s, si) => {
      const chip = document.createElement('div');
      chip.className = 'stop-chip';
      chip.style.padding = '6px 8px';
      chip.style.background = '#f1f1f1';
      chip.style.borderRadius = '14px';
      chip.style.display = 'flex';
      chip.style.alignItems = 'center';
      chip.style.gap = '8px';
      chip.innerHTML = `<span>${escapeHtml(s)}</span><button type="button" data-stop-index="${si}" data-action="remove-stop">✕</button>`;
      stopsEditor.appendChild(chip);
    });
  }
    // pre-select assigned buses if any
    try {
      const sel = document.getElementById('routeBuses');
      if (sel && r.buses && r.buses.length) {
        Array.from(sel.options).forEach(o => { o.selected = r.buses.includes(o.value); });
      }
    } catch(e) {}
}

function deleteRoute(index) {
  if (!confirm('Delete this route?')) return;
  const routes = loadRoutes();
  routes.splice(index,1);
  saveRoutes(routes);
  renderRoutes();
  renderAdminStats();
}

// Users listing for admin
function loadRegisteredUsers() {
  try { return JSON.parse(localStorage.getItem('users') || '[]'); } catch(e){ return []; }
}

function saveRegisteredUsers(users) { localStorage.setItem('users', JSON.stringify(users)); }

function renderUsers() {
  const tbody = document.getElementById('usersTbody');
  if (!tbody) return;
  let users = loadRegisteredUsers();
  // fallback: single userProfile or profiles array if present
  if ((!users || users.length === 0)) {
    try {
      const single = JSON.parse(localStorage.getItem('userProfile') || 'null');
      if (single && single.phone) users = [single];
    } catch (e) {}
  }
  if ((!users || users.length === 0)) {
    try {
      const profiles = JSON.parse(localStorage.getItem('profiles') || '[]');
      if (profiles && profiles.length) users = profiles;
    } catch (e) {}
  }

  // build merged view by normalizing phone numbers and overlaying profiles/userProfile
  function normalizePhone(p) {
    if (!p) return '';
    const digits = String(p).replace(/[^0-9]/g, '');
    if (digits.length >= 10) return '+91 ' + digits.slice(-10);
    return p;
  }

  const merged = {};
  (users || []).forEach(u => {
    const key = normalizePhone(u.phone);
    merged[key] = Object.assign({}, u);
    merged[key].phone = key;
  });

  try {
    const single = JSON.parse(localStorage.getItem('userProfile') || 'null');
    if (single && single.phone) {
      const k = normalizePhone(single.phone);
      merged[k] = Object.assign({}, merged[k] || {}, single);
      merged[k].phone = k;
    }
  } catch (e) {}

  try {
    const profiles = JSON.parse(localStorage.getItem('profiles') || '[]');
    (profiles || []).forEach(p => {
      const k = normalizePhone(p.phone);
      merged[k] = Object.assign({}, merged[k] || {}, p);
      merged[k].phone = k;
    });
  } catch (e) {}

  const rows = Object.keys(merged).map(k => merged[k]);
  tbody.innerHTML = '';
  if (!rows.length) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="5" style="text-align:center; color:#666">No registered users found</td>`;
    tbody.appendChild(tr);
    return;
  }

  rows.forEach((u, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${escapeHtml(u.name || '')}</td>
      <td>${escapeHtml(u.phone || '')}</td>
      <td>${escapeHtml(u.busRoute || '')}</td>
      <td>${escapeHtml(u.department || '')}</td>
      <td><button type="button" data-action="delete-user" data-index="${idx}">Delete</button></td>`;
    tbody.appendChild(tr);
  });
}

function addStopToEditor(stopText) {
  const stopsEditor = document.getElementById('stopsEditor');
  if (!stopsEditor) return;
  const idx = stopsEditor.children.length;
  const chip = document.createElement('div');
  chip.className = 'stop-chip';
  chip.style.padding = '6px 8px';
  chip.style.background = '#f1f1f1';
  chip.style.borderRadius = '14px';
  chip.style.display = 'flex';
  chip.style.alignItems = 'center';
  chip.style.gap = '8px';
  chip.innerHTML = `<span>${escapeHtml(stopText)}</span><button type="button" data-stop-index="${idx}" data-action="remove-stop">✕</button>`;
  stopsEditor.appendChild(chip);
}

function getStopsFromEditor() {
  const stopsEditor = document.getElementById('stopsEditor');
  if (!stopsEditor) return parseStops(document.getElementById('stopsInput').value);
  const stops = [];
  for (const ch of Array.from(stopsEditor.children)) {
    const span = ch.querySelector('span');
    if (span) stops.push(span.innerText.trim());
  }
  if (stops.length) return stops;
  return parseStops(document.getElementById('stopsInput').value);
}

// small helper to avoid XSS when injecting text
function escapeHtml(s){
  if (s === undefined || s === null) return '';
  return String(s).replace(/[&<>\"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c];
  });
}

document.addEventListener('DOMContentLoaded', function(){
  // Buses
  renderBuses();
  const addBusBtn = document.getElementById('addBusBtn');
  if (addBusBtn) addBusBtn.addEventListener('click', addOrSaveBus);
  const cancelBus = document.getElementById('cancelEditBusBtn');
  if (cancelBus) cancelBus.addEventListener('click', clearBusForm);
  const busesTbody = document.getElementById('busesTbody');
  if (busesTbody) {
    busesTbody.addEventListener('click', function(e){
      const btn = e.target.closest('button');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      const index = parseInt(btn.getAttribute('data-index'));
      if (action === 'edit') editBus(index);
      if (action === 'delete') deleteBus(index);
    });
  }

  // Routes
  renderRoutes();
  try { renderRouteBusesDropdown(); } catch(e) {}
  const addRouteBtn = document.getElementById('addRouteBtn');
  if (addRouteBtn) addRouteBtn.addEventListener('click', addOrSaveRoute);
  const cancelRoute = document.getElementById('cancelEditRouteBtn');
  if (cancelRoute) cancelRoute.addEventListener('click', clearRouteForm);
  const routeList = document.getElementById('routeList');
  if (routeList) {
    routeList.addEventListener('click', function(e){
      const btn = e.target.closest('button');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      const index = parseInt(btn.getAttribute('data-index'));
      if (action === 'edit-route') editRoute(index);
      if (action === 'delete-route') deleteRoute(index);
    });
  }
  // stops editor: remove-only (no add input)
  const stopsEditor = document.getElementById('stopsEditor');
  if (stopsEditor) {
    stopsEditor.addEventListener('click', function(e){
      const btn = e.target.closest('button');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      if (action === 'remove-stop') {
        btn.parentElement.remove();
      }
    });
  }
  // Users (admin view)
  renderUsers();
  // render admin stats if present on page
  try { renderAdminStats(); } catch(e) {}
  // Update buses dropdown if localStorage changes in another tab/window
  try {
    window.addEventListener('storage', function(ev){ if (ev.key === 'buses') { try { renderRouteBusesDropdown(); } catch(e){} } });
  } catch(e) {}
  const usersTbody = document.getElementById('usersTbody');
  if (usersTbody) {
    usersTbody.addEventListener('click', function(e){
      const btn = e.target.closest('button');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      if (action === 'delete-user') {
        if (!confirm('Delete this user?')) return;
        const tr = btn.closest('tr');
        const phoneCell = tr && tr.children && tr.children[1] ? tr.children[1].innerText.trim() : '';
  // route page: wire refresh button if present
  try {
    const refreshBtn = document.getElementById('refreshBusesBtn');
    if (refreshBtn) refreshBtn.addEventListener('click', function(){ try { renderRouteBusesDropdown(); } catch(e){} });
    // also try a delayed populate to avoid timing issues
    setTimeout(function(){ try { renderRouteBusesDropdown(); } catch(e){} }, 250);
  } catch(e) {}
        const normalizePhone = (p) => { if (!p) return ''; const d = String(p).replace(/[^0-9]/g,''); return d.length>=10?'+91 '+d.slice(-10):p; };
        const key = normalizePhone(phoneCell);
        // remove from users
        let users = loadRegisteredUsers();
        users = users.filter(u => normalizePhone(u.phone) !== key);
        saveRegisteredUsers(users);
        // remove from profiles as fallback
        try {
          let profiles = JSON.parse(localStorage.getItem('profiles') || '[]');
          profiles = profiles.filter(p => normalizePhone(p.phone) !== key);
          localStorage.setItem('profiles', JSON.stringify(profiles));
        } catch (e) {}
        renderUsers();
        renderAdminStats();
      }
    });
  }
});

// Ensure stats update immediately on pages where the counters exist.
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  try { renderAdminStats(); } catch (e) {}
} else {
  document.addEventListener('DOMContentLoaded', function() { try { renderAdminStats(); } catch(e) {} });
}
