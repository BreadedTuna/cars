(function () {
  let adminButton, adminPanel;
  let isDragging = false, moved = false, offsetX = 0, offsetY = 0;

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

  /* ---------- Panel ---------- */
  function createAdminPanel() {
    adminPanel = document.createElement("div");
    Object.assign(adminPanel.style, {
      position: "fixed",
      right: "80px",
      bottom: "20px",
      width: "340px",
      background: "rgba(0,0,0,0.85)",
      color: "#fff",
      borderRadius: "12px",
      fontFamily: "monospace",
      fontSize: "13px",
      boxShadow: "0 0 10px rgba(0,0,0,0.5)",
      display: "none",
      zIndex: "99999",
      touchAction: "none",
    });

    adminPanel.innerHTML = `
      <div id="admin-header" style="cursor:move;font-weight:bold;font-size:15px;padding:8px;background:rgba(255,255,255,0.1);border-radius:12px 12px 0 0;">Admin Panel</div>
      <div id="admin-content" style="padding:10px 14px;max-height:70vh;overflow-y:auto;">
        <div id="admin-email">Email: (loading…)</div>
        <div id="admin-claim">Admin Claim: (checking…)</div>
        <div id="admin-db">DB Status: (unknown)</div>
        <button id="refresh-games" style="margin-top:8px;width:100%;cursor:pointer;">🔄 Refresh Games</button>
        <div id="admin-game-list" style="margin-top:10px;"></div>
      </div>
    `;
    document.body.appendChild(adminPanel);
    const header = adminPanel.querySelector("#admin-header");
    header.addEventListener("mousedown", startPanelDrag);
    header.addEventListener("touchstart", startPanelDrag, { passive: false });
    document
      .getElementById("refresh-games")
      .addEventListener("click", loadActiveGames);
  }

  let panelDragging = false,
    panelOffsetX = 0,
    panelOffsetY = 0;
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

  /* ---------- Info ---------- */
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

  /* ---------- Load active games ---------- */
  function loadActiveGames() {
    const list = document.getElementById("admin-game-list");
    list.innerHTML = "<div>Loading games…</div>";
    const rootRef = firebase.database().ref("/");
    const threeMinutesAgo = Date.now() - 30 * 60 * 1000;
    rootRef.once("value").then((snapshot) => {
      const data = snapshot.val() || {};
      const games = [];
      Object.keys(data).forEach((code) => {
        const g = data[code];
        if (!g || typeof g !== "object") return;
        const ts = g.timestamp || 0;
        if (ts >= threeMinutesAgo) games.push({ code, status: g.status });
      });
      renderActiveGames(games);
    });
  }

  /* ---------- Render active games ---------- */
  function renderActiveGames(games) {
    const list = document.getElementById("admin-game-list");
    list.innerHTML = "<div style='font-weight:bold;margin-bottom:4px;'>Active / Recent Games</div>";
    if (!games.length) {
      list.innerHTML += "<div>No active or recent games.</div>";
      return;
    }

    games.forEach((g) => {
      const wrap = document.createElement("div");
      wrap.style.marginBottom = "6px";
      wrap.style.borderBottom = "1px solid rgba(255,255,255,0.15)";
      wrap.style.paddingBottom = "3px";
      const row = document.createElement("div");
      row.innerHTML = `
        <b>${g.code}</b> (status: ${g.status})
        <button class="players-btn" style="margin-left:6px;">👁️</button>
        <button class="join-btn" style="margin-left:4px;">🚪</button>
      `;
      const [viewBtn, joinBtn] = row.querySelectorAll("button");
      viewBtn.onclick = () => toggleGamePlayers(g.code, wrap);
      joinBtn.onclick = () => joinGameAsAdmin(g.code);
      wrap.appendChild(row);
      list.appendChild(wrap);
    });
  }

  /* ---------- Player list ---------- */
  const livePlayerListeners = {};
  function toggleGamePlayers(code, container) {
    const old = container.querySelector(".player-list");
    if (old) {
      old.remove();
      if (livePlayerListeners[code]) {
        livePlayerListeners[code].off();
        delete livePlayerListeners[code];
      }
      return;
    }
    const sub = document.createElement("div");
    sub.className = "player-list";
    sub.style.marginLeft = "8px";
    sub.style.borderLeft = "2px solid rgba(255,255,255,0.2)";
    sub.style.paddingLeft = "6px";
    sub.textContent = "Loading players…";
    container.appendChild(sub);

    const playersRef = firebase.database().ref(code + "/players");
    const renderPlayers = (snapshot) => {
      const players = snapshot.val() || {};
      sub.innerHTML = `<div style="font-weight:bold;margin:4px 0;">Players in ${code}</div>`;
      if (!Object.keys(players).length) {
        sub.innerHTML += "<div>No players currently.</div>";
        return;
      }

      Object.entries(players).forEach(([id, p]) => {
        const div = document.createElement("div");
        div.style.margin = "3px 0";

        const colorPreview = colorToHex(p.color);
        div.innerHTML = `
          <div>ID: ${id}</div>
          <div>Name: <input type="text" value="${p.name || ""}" data-field="name" data-id="${id}" style="width:120px;"></div>
          <div>Lap: <input type="number" value="${p.lap || 0}" data-field="lap" data-id="${id}" style="width:60px;"></div>
          <div>Checkpoint: <input type="number" value="${p.checkpoint || 0}" data-field="checkpoint" data-id="${id}" style="width:60px;"></div>
          <div>Color: <input type="color" value="${colorPreview}" data-field="color" data-id="${id}" style="width:60px;"></div>
          <hr style="border:none;border-bottom:1px solid rgba(255,255,255,0.2);margin:4px 0;">
        `;
        sub.appendChild(div);
      });

      sub.querySelectorAll("input").forEach((inp) => {
        inp.addEventListener("input", (e) => handleEdit(e, code));
      });
    };

    playersRef.on("value", renderPlayers);
    livePlayerListeners[code] = playersRef;
  }

  function handleEdit(e, code) {
    const field = e.target.dataset.field;
    const id = e.target.dataset.id;
    const ref = firebase.database().ref(`${code}/players/${id}/${field}`);
    let val = e.target.value;

    if (field === "lap" || field === "checkpoint") val = Number(val);
    if (field === "color") val = colorToIndex(val);
    ref.set(val);
  }

  /* ---------- Color helpers ---------- */
  function colorToHex(colorVal) {
    // Accept number or [r,g,b]
    if (Array.isArray(colorVal)) {
      return (
        "#" +
        colorVal
          .map((v) => parseInt(v).toString(16).padStart(2, "0"))
          .join("")
      );
    }
    if (typeof colorVal === "number") {
      // map index (0–100) to hue
      const hue = (colorVal * 3.6) % 360;
      const rgb = hslToRgb(hue / 360, 1, 0.5);
      return rgbToHex(rgb);
    }
    return "#cccccc";
  }

  function colorToIndex(hex) {
    const rgb = hexToRgbArray(hex);
    // rough inverse: convert hue back to 0–100 index
    const [r, g, b] = rgb.map((v) => v / 255);
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h;
    if (max === min) h = 0;
    else if (max === r) h = (60 * ((g - b) / (max - min)) + 360) % 360;
    else if (max === g) h = (60 * ((b - r) / (max - min)) + 120) % 360;
    else h = (60 * ((r - g) / (max - min)) + 240) % 360;
    return Math.round(h / 3.6);
  }

  function rgbToHex(rgb) {
    return (
      "#" +
      rgb
        .map((v) => Math.round(v).toString(16).padStart(2, "0"))
        .join("")
    );
  }

  function hexToRgbArray(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  }

  function hslToRgb(h, s, l) {
    let r, g, b;
    if (s == 0) {
      r = g = b = l;
    } else {
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
    }
    return [r * 255, g * 255, b * 255];
  }

  /* ---------- Join Game ---------- */
  function joinGameAsAdmin(code) {
    const statusRef = firebase.database().ref(code + "/status");
    const playersRef = firebase.database().ref(code + "/players");
    playersRef.once("value").then((snap) => {
      const beforeCount = snap.numChildren();
      statusRef.set(0);
      let timedOut = false;
      const watcher = playersRef.on("value", (s) => {
        if (timedOut) return;
        if (s.numChildren() > beforeCount) {
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

  /* ---------- Auth watcher ---------- */
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) return;
    user.getIdTokenResult().then((token) => {
      if (token.claims.admin) {
        if (!adminButton) createAdminButton();
        if (!adminPanel) createAdminPanel();
        updateAdminUI(user, token);
      }
    });
  });
})();
