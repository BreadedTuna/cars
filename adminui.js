(function () {
  let adminButton, adminPanel;
  let isDragging = false, moved = false, offsetX = 0, offsetY = 0;

  /* ───────────── Draggable Blue Button ───────────── */
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

  /* ───────────── Admin Panel ───────────── */
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
    });

    adminPanel.innerHTML = `
      <div id="admin-header" style="cursor:move;font-weight:bold;font-size:15px;padding:8px;background:rgba(255,255,255,0.1);border-radius:12px 12px 0 0;">
        Admin Panel
      </div>
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

  /* ───────────── Make Panel Draggable ───────────── */
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

  /* ───────────── Admin Info + DB Test ───────────── */
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

  /* ───────────── Load Games ───────────── */
  function loadActiveGames() {
    const list = document.getElementById("admin-game-list");
    list.innerHTML = "<div>Loading games…</div>";

    const rootRef = firebase.database().ref("/");
    const threeMinutesAgo = Date.now() - 3 * 60 * 1000;

    rootRef.once("value").then((snapshot) => {
      const data = snapshot.val() || {};
      const recentGames = [];

      Object.keys(data).forEach((code) => {
        const g = data[code];
        if (!g || typeof g !== "object") return;
        const ts = g.timestamp || 0;
        if (ts >= threeMinutesAgo) recentGames.push({ code, status: g.status });
      });

      renderActiveGames(recentGames);
    });
  }

  /* ───────────── Render Game List ───────────── */
  function renderActiveGames(games) {
    const list = document.getElementById("admin-game-list");
    list.innerHTML = "<div style='font-weight:bold;margin-bottom:4px;'>Active / Recent Games</div>";

    if (games.length === 0) {
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
        <button style="margin-left:8px;">👁️ Players</button>
        <button style="margin-left:4px;">🚪 Join</button>
      `;
      const [viewBtn, joinBtn] = row.querySelectorAll("button");
      viewBtn.onclick = () => toggleGamePlayers(g.code, wrap);
      joinBtn.onclick = () => joinGameAsAdmin(g.code);
      wrap.appendChild(row);

      list.appendChild(wrap);
    });
  }

  /* ───────────── Toggle Game Players ───────────── */
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

      if (Object.keys(players).length === 0) {
        sub.innerHTML += "<div>No players currently.</div>";
        return;
      }

      Object.entries(players).forEach(([id, p]) => {
        const div = document.createElement("div");
        div.style.margin = "3px 0";
        const color = Array.isArray(p.color) ? `rgb(${p.color.join(",")})` : "#ccc";

        div.innerHTML = `
          <div>ID: ${id}</div>
          <div>Name: <input type="text" value="${p.name || ""}" data-field="name" data-id="${id}" style="width:120px;"></div>
          <div>Lap: <input type="number" value="${p.lap || 0}" data-field="lap" data-id="${id}" style="width:60px;"></div>
          <div>Checkpoint: <input type="number" value="${p.checkpoint || 0}" data-field="checkpoint" data-id="${id}" style="width:60px;"></div>
          <div>Color: <input type="color" value="${rgbToHex(p.color)}" data-field="color" data-id="${id}"></div>
          <hr style="border:none;border-bottom:1px solid rgba(255,255,255,0.2);margin:4px 0;">
        `;
        sub.appendChild(div);
      });

      // Handle edit events
      sub.querySelectorAll("input").forEach((input) => {
        input.addEventListener("input", (e) => handleEdit(e, code));
      });
    };

    playersRef.on("value", renderPlayers);
    livePlayerListeners[code] = playersRef;
  }

  function handleEdit(e, code) {
    const field = e.target.dataset.field;
    const id = e.target.dataset.id;
    const val = e.target.value;

    const ref = firebase.database().ref(`${code}/players/${id}/${field}`);

    if (field === "color") {
      const rgb = hexToRgbArray(val);
      ref.set(rgb);
    } else if (field === "lap" || field === "checkpoint") {
      ref.set(Number(val));
    } else {
      ref.set(val);
    }
  }

  /* ───────────── Color Helpers ───────────── */
  function rgbToHex(arr) {
    if (!Array.isArray(arr)) return "#cccccc";
    return (
      "#" +
      arr
        .map((v) => {
          const hex = parseInt(v).toString(16).padStart(2, "0");
          return hex;
        })
        .join("")
    );
  }

  function hexToRgbArray(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  }

  /* ───────────── Join Game Logic ───────────── */
  function joinGameAsAdmin(code) {
    const statusRef = firebase.database().ref(code + "/status");
    const playersRef = firebase.database().ref(code + "/players");

    playersRef.once("value").then((snapshot) => {
      const beforeCount = snapshot.numChildren();
      statusRef.set(0);

      let timeoutTriggered = false;

      const watcher = playersRef.on("value", (snap) => {
        if (timeoutTriggered) return;
        const nowCount = snap.numChildren();
        if (nowCount > beforeCount) {
          playersRef.off("value", watcher);
          statusRef.set(1);
        }
      });

      setTimeout(() => {
        timeoutTriggered = true;
        playersRef.off("value", watcher);
        statusRef.set(1);
      }, 60000);
    });
  }

  /* ───────────── Auth Watcher ───────────── */
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
