// adminui.js — Admin UI with time-ago, variable interval, improved color handling
(function () {
  let adminButton, adminPanel;
  let isDragging = false, moved = false, offsetX = 0, offsetY = 0;

  // Default lookback interval (minutes)
  let intervalMinutes = 3;

  /* ---------- Draggable "A" button ---------- */
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
          <button class="interval" data-min="1" style="cursor:pointer">1m</button>
          <button class="interval" data-min="3" style="cursor:pointer;background:#333;color:#fff;">3m</button>
          <button class="interval" data-min="10" style="cursor:pointer">10m</button>
          <button class="interval" data-min="30" style="cursor:pointer">30m</button>
          <input id="interval-custom" placeholder="min" style="width:48px;margin-left:6px;padding:2px;font-size:12px;">
          <button id="interval-apply" style="cursor:pointer;margin-left:4px">Apply</button>
        </div>

        <button id="refresh-games" style="margin-top:8px;width:100%;cursor:pointer;">🔄 Refresh Games</button>
        <div id="admin-game-list" style="margin-top:10px;"></div>
      </div>
    `;
    document.body.appendChild(adminPanel);

    // events
    const header = adminPanel.querySelector("#admin-header");
    header.addEventListener("mousedown", startPanelDrag);
    header.addEventListener("touchstart", startPanelDrag, { passive: false });
    document.getElementById("refresh-games").addEventListener("click", loadActiveGames);
    adminPanel.querySelectorAll(".interval").forEach(btn => {
      btn.addEventListener("click", () => {
        intervalMinutes = Number(btn.dataset.min);
        // highlight clicked
        adminPanel.querySelectorAll(".interval").forEach(b => b.style.background = "");
        btn.style.background = "#333";
        btn.style.color = "#fff";
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

  /* ---------- Panel drag ---------- */
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

  /* ---------- Admin info + DB test ---------- */
  function updateAdminUI(user, token) {
    document.getElementById("admin-email").textContent = "Email: " + (user?.email || "none");
    document.getElementById("admin-claim").textContent = "Admin Claim: " + (token?.claims?.admin ? "true" : "false");

    firebase.database().ref("/testServer").once("value").then(() => {
      document.getElementById("admin-db").textContent = "DB Status: ✅ Connected";
    }).catch(() => {
      document.getElementById("admin-db").textContent = "DB Status: ❌ Error";
    });

    // mark default interval button (3m)
    adminPanel.querySelectorAll(".interval").forEach(b => {
      if (Number(b.dataset.min) === intervalMinutes) {
        b.style.background = "#333"; b.style.color = "#fff";
      } else { b.style.background = ""; b.style.color = ""; }
    });

    loadActiveGames();
  }

  /* ---------- Load active games (uses intervalMinutes) ---------- */
  function loadActiveGames() {
    const list = document.getElementById("admin-game-list");
    list.innerHTML = "<div>Loading games…</div>";
    const rootRef = firebase.database().ref("/");
    const lookback = Date.now() - intervalMinutes * 60 * 1000;

    rootRef.once("value").then(snapshot => {
      const data = snapshot.val() || {};
      const recent = [];
      Object.keys(data).forEach(code => {
        const g = data[code];
        if (!g || typeof g !== "object") return;
        const ts = g.timestamp || 0;
        if (ts >= lookback) recent.push({ code, status: g.status, timestamp: ts });
      });
      renderActiveGames(recent);
    }).catch(err => {
      console.error("Error loading games:", err);
      list.innerHTML = "<div>Error loading games.</div>";
    });
  }

  /* ---------- Render games + time-ago ---------- */
  function timeAgo(ms) {
    const diff = Date.now() - ms;
    if (diff < 5000) return "just now";
    if (diff < 60000) return Math.round(diff / 1000) + "s ago";
    if (diff < 3600000) return Math.round(diff / 60000) + "m ago";
    if (diff < 86400000) return Math.round(diff / 3600000) + "h ago";
    const d = new Date(ms);
    return d.toLocaleString();
  }

  function renderActiveGames(games) {
    const list = document.getElementById("admin-game-list");
    list.innerHTML = "<div style='font-weight:bold;margin-bottom:6px;'>Active / Recent Games</div>";
    if (!games.length) {
      list.innerHTML += "<div>No active or recent games.</div>";
      return;
    }

    games.forEach(g => {
      const wrap = document.createElement("div");
      wrap.style.marginBottom = "8px";
      wrap.style.borderBottom = "1px solid rgba(255,255,255,0.12)";
      wrap.style.paddingBottom = "6px";

      const headerRow = document.createElement("div");
      headerRow.style.display = "flex";
      headerRow.style.alignItems = "center";
      headerRow.style.justifyContent = "space-between";
      headerRow.innerHTML = `
        <div style="font-weight:bold;">${g.code} <span style="font-weight:normal;color:#ccc;font-size:12px">(${timeAgo(g.timestamp)})</span></div>
      `;
      const controls = document.createElement("div");
      controls.innerHTML = `<button class="players-btn" style="margin-left:6px;cursor:pointer">👁️</button> <button class="join-btn" style="margin-left:6px;cursor:pointer">🚪 Join</button>`;
      headerRow.appendChild(controls);
      wrap.appendChild(headerRow);

      const [viewBtn, joinBtn] = controls.querySelectorAll("button");
      viewBtn.addEventListener("click", () => toggleGamePlayers(g.code, wrap));
      joinBtn.addEventListener("click", () => joinGameAsAdmin(g.code));
      list.appendChild(wrap);
    });
  }

  /* ---------- Live players viewer & editor ---------- */
  const livePlayerListeners = {};
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
      if (!keys.length) {
        sub.innerHTML += "<div>No players currently.</div>";
        return;
      }

      keys.forEach(id => {
        const p = players[id] || {};
        const div = document.createElement("div");
        div.style.margin = "6px 0";
        const colorHex = colorToHex(p.color);
        // build inputs (mobile friendly)
        div.innerHTML = `
          <div style="font-size:12px;color:#aaa">ID: ${id}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:4px;">
            <label style="font-size:12px">Name</label>
            <input data-field="name" data-id="${id}" value="${escapeInput(p.name||"")}" style="flex:1;min-width:90px;padding:4px;font-size:13px">
            <label style="font-size:12px">Lap</label>
            <input type="number" data-field="lap" data-id="${id}" value="${p.lap||0}" style="width:60px;padding:4px;font-size:13px">
            <label style="font-size:12px">CP</label>
            <input type="number" data-field="checkpoint" data-id="${id}" value="${p.checkpoint||0}" style="width:60px;padding:4px;font-size:13px">
          </div>
          <div style="display:flex;gap:8px;align-items:center;margin-top:6px;">
            <label style="font-size:12px">Color</label>
            <input type="color" data-field="color" data-id="${id}" value="${colorHex}" style="width:44px;height:30px;padding:2px;">
            <div style="width:24px;height:24px;border-radius:4px;background:${colorHex};border:1px solid rgba(0,0,0,0.2)"></div>
          </div>
          <hr style="border:none;border-bottom:1px solid rgba(255,255,255,0.08);margin:8px 0;">
        `;
        sub.appendChild(div);
      });

      // attach handlers
      sub.querySelectorAll("input").forEach(inp => {
        inp.addEventListener("input", (e) => handleEdit(e, code));
        // mobile-friendly: also blur on enter for text fields
        inp.addEventListener("keydown", (ev) => {
          if (ev.key === "Enter") ev.target.blur();
        });
      });
    };

    // live update
    playersRef.on("value", render);
    livePlayerListeners[code] = playersRef;
  }

  function escapeInput(s) {
    return String(s).replace(/"/g, '&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function handleEdit(e, code) {
    const field = e.target.dataset.field;
    const id = e.target.dataset.id;
    const raw = e.target.value;
    const ref = firebase.database().ref(`${code}/players/${id}/${field}`);

    if (field === "color") {
      // convert hex to hue index (0-360) to preserve richer colors
      const rgb = hexToRgbArray(raw);
      const hue = rgbToHue(rgb);
      // store hue as number (your DB example used numbers like 57,248,316)
      ref.set(Math.round(hue));
      // update preview box if present
      const preview = e.target.parentElement.querySelector('div');
      if (preview) preview.style.background = raw;
    } else if (field === "lap" || field === "checkpoint") {
      const n = Number(raw) || 0;
      ref.set(n);
    } else {
      ref.set(raw);
    }
  }

  /* ---------- Color mapping helpers ----------
     - Accept both [r,g,b] arrays (legacy) and numeric color indices/hues.
     - If numeric <= 100: treat as 0-100 index and map to hue = index * 3.6
     - If numeric > 100: treat as hue 0-360 (mod 360)
  ------------------------------------------------*/
  function colorToHex(colorVal) {
    if (Array.isArray(colorVal) && colorVal.length >= 3) {
      const [r,g,b] = colorVal.map(v => Math.max(0, Math.min(255, Number(v)||0)));
      return rgbToHex([r,g,b]);
    }
    if (typeof colorVal === "number") {
      let hue;
      if (colorVal <= 100) hue = (colorVal * 3.6) % 360; // index 0-100 → hue
      else hue = colorVal % 360; // treat as hue directly
      const rgb = hslToRgb(hue/360, 1, 0.5).map(v => Math.round(v));
      return rgbToHex(rgb);
    }
    // unknown type
    return "#999999";
  }

  function hexToRgbArray(hex) {
    const h = hex.replace('#','');
    const bigint = parseInt(h,16);
    return [ (bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255 ];
  }

  function rgbToHex(rgb) {
    return "#" + rgb.map(v => Math.round(v).toString(16).padStart(2,'0')).join('');
  }

  function hslToRgb(h,s,l) {
    let r,g,b;
    if (s===0) { r=g=b=l; }
    else {
      const hue2rgb = (p,q,t) => {
        if (t<0) t+=1;
        if (t>1) t-=1;
        if (t<1/6) return p + (q-p)*6*t;
        if (t<1/2) return q;
        if (t<2/3) return p + (q-p)*(2/3 - t)*6;
        return p;
      };
      const q = l<0.5 ? l*(1+s) : l + s - l*s;
      const p = 2*l - q;
      r = hue2rgb(p,q,h + 1/3);
      g = hue2rgb(p,q,h);
      b = hue2rgb(p,q,h - 1/3);
    }
    return [ r*255, g*255, b*255 ];
  }

  // Convert rgb (array [r,g,b]) to hue 0-360
  function rgbToHue(rgb) {
    const [r,g,b] = rgb.map(v => v/255);
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h;
    if (max === min) h = 0;
    else if (max === r) h = (60 * ((g - b) / (max - min)) + 360) % 360;
    else if (max === g) h = (60 * ((b - r) / (max - min)) + 120) % 360;
    else h = (60 * ((r - g) / (max - min)) + 240) % 360;
    return h;
  }

  /* ---------- Join as admin (watch players, timeout) ---------- */
  function joinGameAsAdmin(code) {
    const statusRef = firebase.database().ref(code + "/status");
    const playersRef = firebase.database().ref(code + "/players");

    playersRef.once("value").then(snap => {
      const before = snap.numChildren();
      statusRef.set(0).catch(()=>{});
      let timedOut = false;
      const watcher = playersRef.on("value", (s) => {
        if (timedOut) return;
        if (s.numChildren() > before) {
          playersRef.off("value", watcher);
          statusRef.set(1).catch(()=>{});
        }
      });
      setTimeout(() => {
        timedOut = true;
        playersRef.off("value", watcher);
        statusRef.set(1).catch(()=>{});
      }, 60000);
    }).catch(err => console.error("join error",err));
  }

  /* ---------- Auth watcher ---------- */
  firebase.auth().onAuthStateChanged(user => {
    if (!user) return;
    user.getIdTokenResult().then(token => {
      if (token.claims && token.claims.admin) {
        if (!adminButton) createAdminButton();
        if (!adminPanel) createAdminPanel();
        updateAdminUI(user, token);
      }
    });
  });
})();
