// adminui.js — Admin UI with confirm-to-save editing
(function () {
  let adminButton, adminPanel;
  let isDragging = false, moved = false, offsetX = 0, offsetY = 0;
  let intervalMinutes = 3;
  const livePlayerListeners = {};

  /* ---------- Draggable "A" Button ---------- */
  function createAdminButton() {
    adminButton = document.createElement("div");
    Object.assign(adminButton.style, {
      position: "fixed",
      right: "20px",
      bottom: "20px",
      width: "50px",
      height: "50px",
      background: "#2196f3",
      color: "#fff",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "sans-serif",
      fontWeight: "bold",
      fontSize: "22px",
      cursor: "pointer",
      boxShadow: "0 0 8px rgba(0,0,0,0.4)",
      zIndex: "99999",
      userSelect: "none",
      touchAction: "none",
    });
    adminButton.textContent = "A";
    adminButton.addEventListener("mousedown", startDrag);
    adminButton.addEventListener("touchstart", startDrag, { passive: false });
    window.addEventListener("mousemove", drag);
    window.addEventListener("touchmove", drag, { passive: false });
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchend", stopDrag);
    document.body.appendChild(adminButton);
  }

  function startDrag(e) {
    isDragging = true;
    moved = false;
    const rect = adminButton.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    offsetX = p.clientX - rect.left;
    offsetY = p.clientY - rect.top;
    e.preventDefault();
  }

  function drag(e) {
    if (!isDragging) return;
    const p = e.touches ? e.touches[0] : e;
    const x = p.clientX - offsetX;
    const y = p.clientY - offsetY;
    adminButton.style.left = x + "px";
    adminButton.style.top = y + "px";
    adminButton.style.right = "auto";
    adminButton.style.bottom = "auto";
    moved = true;
    e.preventDefault();
  }

  function stopDrag() {
    if (!isDragging) return;
    isDragging = false;
    if (!moved) togglePanel();
  }

  /* ---------- Admin Panel ---------- */
  function createAdminPanel() {
    adminPanel = document.createElement("div");
    Object.assign(adminPanel.style, {
      position: "fixed",
      right: "80px",
      bottom: "20px",
      width: "380px",
      background: "rgba(0,0,0,0.88)",
      color: "#fff",
      borderRadius: "12px",
      fontFamily: "monospace",
      fontSize: "13px",
      boxShadow: "0 0 12px rgba(0,0,0,0.6)",
      display: "none",
      zIndex: "99999",
      touchAction: "none",
    });

    adminPanel.innerHTML = `
      <div id="admin-header" style="cursor:move;font-weight:bold;font-size:15px;padding:8px;background:rgba(255,255,255,0.06);border-radius:12px 12px 0 0;">
        Admin Panel
      </div>
      <div id="admin-content" style="padding:10px 14px;max-height:72vh;overflow-y:auto;">
        <div id="admin-email">Email: (loading…)</div>
        <div id="admin-claim">Admin Claim: (checking…)</div>
        <div id="admin-db">DB Status: (unknown)</div>

        <div style="margin-top:8px;display:flex;gap:6px;align-items:center;">
          <div style="font-size:12px;">Lookback:</div>
          <button class="interval" data-min="1">1m</button>
          <button class="interval" data-min="3" style="background:#333;color:#fff;">3m</button>
          <button class="interval" data-min="10">10m</button>
          <button class="interval" data-min="30">30m</button>
          <input id="interval-custom" placeholder="min" style="width:48px;margin-left:6px;padding:2px;font-size:12px;">
          <button id="interval-apply">Apply</button>
        </div>

        <button id="refresh-games" style="margin-top:8px;width:100%;">🔄 Refresh Games</button>
        <div id="admin-game-list" style="margin-top:10px;"></div>
      </div>
    `;
    document.body.appendChild(adminPanel);

    // Dragging
    const header = adminPanel.querySelector("#admin-header");
    header.addEventListener("mousedown", startPanelDrag);
    header.addEventListener("touchstart", startPanelDrag, { passive: false });

    // Interval controls
    document.getElementById("refresh-games").addEventListener("click", loadActiveGames);
    adminPanel.querySelectorAll(".interval").forEach(btn => {
      btn.addEventListener("click", () => {
        intervalMinutes = Number(btn.dataset.min);
        adminPanel.querySelectorAll(".interval").forEach(b => b.style.background = "");
        btn.style.background = "#333"; btn.style.color = "#fff";
        loadActiveGames();
      });
    });
    document.getElementById("interval-apply").addEventListener("click", () => {
      const v = Number(document.getElementById("interval-custom").value);
      if (!isNaN(v) && v > 0) {
        intervalMinutes = v;
        adminPanel.querySelectorAll(".interval").forEach(b => { b.style.background = ""; b.style.color = ""; });
        loadActiveGames();
      }
    });
  }

  /* ---------- Panel Drag ---------- */
  let panelDragging = false, panelOffsetX = 0, panelOffsetY = 0;
  function startPanelDrag(e) {
    panelDragging = true;
    const rect = adminPanel.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    panelOffsetX = p.clientX - rect.left;
    panelOffsetY = p.clientY - rect.top;
    window.addEventListener("mousemove", dragPanel);
    window.addEventListener("touchmove", dragPanel, { passive: false });
    window.addEventListener("mouseup", stopPanelDrag);
    window.addEventListener("touchend", stopPanelDrag);
    e.preventDefault();
  }
  function dragPanel(e) {
    if (!panelDragging) return;
    const p = e.touches ? e.touches[0] : e;
    const x = p.clientX - panelOffsetX;
    const y = p.clientY - panelOffsetY;
    Object.assign(adminPanel.style, { left: x + "px", top: y + "px", right: "auto", bottom: "auto" });
    e.preventDefault();
  }
  function stopPanelDrag() {
    panelDragging = false;
    window.removeEventListener("mousemove", dragPanel);
    window.removeEventListener("touchmove", dragPanel);
  }

  function togglePanel() {
    adminPanel.style.display = adminPanel.style.display === "none" ? "block" : "none";
  }

  /* ---------- DB Info ---------- */
  function updateAdminUI(user, token) {
    document.getElementById("admin-email").textContent = "Email: " + (user?.email || "none");
    document.getElementById("admin-claim").textContent = "Admin Claim: " + (token?.claims?.admin ? "true" : "false");
    firebase.database().ref("/testServer").once("value").then(() => {
      document.getElementById("admin-db").textContent = "DB Status: ✅ Connected";
    }).catch(() => {
      document.getElementById("admin-db").textContent = "DB Status: ❌ Error";
    });
    loadActiveGames();
  }

  /* ---------- Load Games ---------- */
  function loadActiveGames() {
    const list = document.getElementById("admin-game-list");
    list.innerHTML = "<div>Loading games…</div>";
    const lookback = Date.now() - intervalMinutes * 60 * 1000;

    firebase.database().ref("/").once("value").then(snapshot => {
      const data = snapshot.val() || {};
      const games = [];
      Object.keys(data).forEach(code => {
        const g = data[code];
        if (g?.timestamp >= lookback)
          games.push({ code, status: g.status, timestamp: g.timestamp });
      });
      renderActiveGames(games);
    }).catch(() => list.innerHTML = "<div>Error loading games.</div>");
  }

  function timeAgo(ms) {
    const diff = Date.now() - ms;
    if (diff < 5000) return "just now";
    if (diff < 60000) return Math.round(diff / 1000) + "s ago";
    if (diff < 3600000) return Math.round(diff / 60000) + "m ago";
    if (diff < 86400000) return Math.round(diff / 3600000) + "h ago";
    return new Date(ms).toLocaleString();
  }

  function renderActiveGames(games) {
    const list = document.getElementById("admin-game-list");
    list.innerHTML = "<div style='font-weight:bold;margin-bottom:6px;'>Active / Recent Games</div>";
    if (!games.length) return list.innerHTML += "<div>No active games.</div>";

    games.forEach(g => {
      const wrap = document.createElement("div");
      wrap.style.marginBottom = "8px";
      wrap.style.borderBottom = "1px solid rgba(255,255,255,0.12)";
      wrap.style.paddingBottom = "6px";
      wrap.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div><b>${g.code}</b> <span style="color:#ccc;font-size:12px;">(${timeAgo(g.timestamp)})</span></div>
          <div><button class="players-btn">👁️</button><button class="join-btn">🚪</button></div>
        </div>
      `;
      list.appendChild(wrap);
      wrap.querySelector(".players-btn").onclick = () => toggleGamePlayers(g.code, wrap);
      wrap.querySelector(".join-btn").onclick = () => joinGameAsAdmin(g.code);
    });
  }

  /* ---------- Players ---------- */
  function toggleGamePlayers(code, container) {
    const existing = container.querySelector(".player-list");
    if (existing) {
      existing.remove();
      if (livePlayerListeners[code]) {
        livePlayerListeners[code].off();
        delete livePlayerListeners[code];
      }
      return;
    }

    const sub = document.createElement("div");
    sub.className = "player-list";
    sub.style.marginLeft = "8px";
    sub.style.borderLeft = "2px solid rgba(255,255,255,0.12)";
    sub.style.paddingLeft = "8px";
    sub.style.marginTop = "6px";
    sub.textContent = "Loading players…";
    container.appendChild(sub);

    const playersRef = firebase.database().ref(code + "/players");
    const render = (snap) => {
      const players = snap.val() || {};
      sub.innerHTML = `<div style="font-weight:bold;margin:4px 0;">Players in ${code}</div>`;
      const keys = Object.keys(players);
      if (!keys.length) return sub.innerHTML += "<div>No players.</div>";

      keys.forEach(id => {
        const p = players[id] || {};
        const div = document.createElement("div");
        div.style.margin = "6px 0";
        const colorHex = colorToHex(p.color);
        div.innerHTML = `
          <div style="font-size:12px;color:#aaa">ID: ${id}</div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:4px;flex-wrap:wrap;">
            <label style="font-size:12px;">Name</label>
            <input data-field="name" data-id="${id}" value="${escapeInput(p.name||"")}" style="flex:1;min-width:80px;padding:4px;font-size:13px;">
            <button class="save-btn" data-field="name" data-id="${id}">✅</button>
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
            <label style="font-size:12px;">Lap</label>
            <input type="number" data-field="lap" data-id="${id}" value="${p.lap||0}" style="width:60px;padding:4px;font-size:13px;">
            <button class="save-btn" data-field="lap" data-id="${id}">✅</button>
            <label style="font-size:12px;">CP</label>
            <input type="number" data-field="checkpoint" data-id="${id}" value="${p.checkpoint||0}" style="width:60px;padding:4px;font-size:13px;">
            <button class="save-btn" data-field="checkpoint" data-id="${id}">✅</button>
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
            <label style="font-size:12px;">Color</label>
            <input type="color" data-field="color" data-id="${id}" value="${colorHex}" style="width:44px;height:30px;padding:2px;">
            <button class="save-btn" data-field="color" data-id="${id}">✅</button>
            <div style="width:24px;height:24px;border-radius:4px;background:${colorHex};border:1px solid rgba(0,0,0,0.2)"></div>
          </div>
          <hr style="border:none;border-bottom:1px solid rgba(255,255,255,0.08);margin:8px 0;">
        `;
        sub.appendChild(div);
      });

      sub.querySelectorAll(".save-btn").forEach(btn => {
        btn.onclick = (ev) => {
          const field = btn.dataset.field;
          const id = btn.dataset.id;
          const input = sub.querySelector(`input[data-id="${id}"][data-field="${field}"]`);
          handleEdit({ target: input }, code, btn);
        };
      });
      sub.querySelectorAll("input").forEach(inp => {
        inp.addEventListener("keydown", ev => {
          if (ev.key === "Enter") {
            const btn = inp.parentElement.querySelector(`.save-btn[data-field="${inp.dataset.field}"]`);
            if (btn) btn.click();
          }
        });
      });
    };

    playersRef.on("value", render);
    livePlayerListeners[code] = playersRef;
  }

  function handleEdit(e, code, btnEl) {
    const field = e.target.dataset.field;
    const id = e.target.dataset.id;
    const raw = e.target.value;
    const ref = firebase.database().ref(`${code}/players/${id}/${field}`);

    let valToSet = raw;
    if (field === "color") {
      const rgb = hexToRgbArray(raw);
      const hue = rgbToHue(rgb);
      valToSet = Math.round(hue);
      const preview = e.target.parentElement.querySelector("div");
      if (preview) preview.style.background = raw;
    } else if (field === "lap" || field === "checkpoint") {
      valToSet = Number(raw) || 0;
    }

    ref.set(valToSet).then(() => {
      if (btnEl) {
        btnEl.textContent = "💾";
        setTimeout(() => (btnEl.textContent = "✅"), 700);
      }
    }).catch(err => {
      console.error("Admin update failed:", err);
      if (btnEl) btnEl.textContent = "⚠️";
    });
  }

  function escapeInput(s) {
    return String(s).replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function colorToHex(colorVal) {
    if (Array.isArray(colorVal)) {
      const [r, g, b] = colorVal;
      return rgbToHex([r, g, b]);
    }
    if (typeof colorVal === "number") {
      const hue = colorVal % 360;
      const rgb = hslToRgb(hue / 360, 1, 0.5);
      return rgbToHex(rgb);
    }
    return "#999";
  }

  function hexToRgbArray(hex) {
    const h = hex.replace("#", "");
    const bigint = parseInt(h, 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  }

  function rgbToHex(rgb) {
    return "#" + rgb.map(v => Math.round(v).toString(16).padStart(2, "0")).join("");
  }

  function hslToRgb(h, s, l) {
    let r, g, b;
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
    return [r * 255, g * 255, b * 255];
  }

  function rgbToHue(rgb) {
    const [r, g, b] = rgb.map(v => v / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max === min) return 0;
    if (max === r) return (60 * ((g - b) / (max - min)) + 360) % 360;
    if (max === g) return (60 * ((b - r) / (max - min)) + 120) % 360;
    return (60 * ((r - g) / (max - min)) + 240) % 360;
  }

  function joinGameAsAdmin(code) {
    const statusRef = firebase.database().ref(code + "/status");
    const playersRef = firebase.database().ref(code + "/players");

    playersRef.once("value").then(snap => {
      const before = snap.numChildren();
      statusRef.set(0);
      let timedOut = false;
      const watcher = playersRef.on("value", (s) => {
        if (timedOut) return;
        if (s.numChildren() > before) {
          playersRef.off("value", watcher);
          statusRef.set(1);
        }
      });
      setTimeout(() => {
        timedOut = true;
        playersRef.off("value", watcher);
        statusRef.set(1);
      }, 60000);
    });
  }

  /* ---------- Auth ---------- */
  firebase.auth().onAuthStateChanged(user => {
    if (!user) return;
    user.getIdTokenResult().then(token => {
      if (token.claims?.admin) {
        if (!adminButton) createAdminButton();
        if (!adminPanel) createAdminPanel();
        updateAdminUI(user, token);
      }
    });
  });
})();
