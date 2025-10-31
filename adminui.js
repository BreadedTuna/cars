// adminui.js  – Admin UI Framework + Active Game List + Player Viewer
(function () {
  let adminButton, adminPanel;
  let isDragging = false,
    moved = false,
    offsetX = 0,
    offsetY = 0;

  /* ---------- Draggable blue "A" button ---------- */
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
    if (!moved) togglePanel(); // treat as tap
  }

  /* ---------- Draggable / scrollable admin panel ---------- */
  function createAdminPanel() {
    adminPanel = document.createElement("div");
    Object.assign(adminPanel.style, {
      position: "fixed",
      right: "80px",
      bottom: "20px",
      width: "310px",
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
    document
      .getElementById("refresh-games")
      .addEventListener("click", loadActiveGames);

    // make header draggable
    const header = adminPanel.querySelector("#admin-header");
    header.addEventListener("mousedown", startPanelDrag);
    header.addEventListener("touchstart", startPanelDrag, { passive: false });
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
    if (!adminPanel) return;
    adminPanel.style.display =
      adminPanel.style.display === "none" ? "block" : "none";
  }

  /* ---------- Info + DB check ---------- */
  function updateAdminUI(user, idTokenResult) {
    if (!adminPanel) return;
    document.getElementById("admin-email").textContent =
      "Email: " + (user?.email || "none");
    document.getElementById("admin-claim").textContent =
      "Admin Claim: " + (idTokenResult?.claims?.admin ? "true" : "false");

    firebase
      .database()
      .ref("/testServer")
      .once("value")
      .then(() => {
        document.getElementById("admin-db").textContent =
          "DB Status: ✅ Connected";
      })
      .catch(() => {
        document.getElementById("admin-db").textContent =
          "DB Status: ❌ Error";
      });

    loadActiveGames();
  }

  /* ---------- Load recent/active games ---------- */
  function loadActiveGames() {
    const list = document.getElementById("admin-game-list");
    list.innerHTML = "<div>Loading games…</div>";

    const rootRef = firebase.database().ref("/");
    const threeMinutesAgo = Date.now() - 3 * 60 * 1000;

    rootRef
      .once("value")
      .then((snapshot) => {
        const data = snapshot.val() || {};
        const recentGames = [];

        Object.keys(data).forEach((code) => {
          const g = data[code];
          if (!g || typeof g !== "object") return;
          const ts = g.timestamp || 0;
          if (ts >= threeMinutesAgo) {
            recentGames.push({ code, status: g.status });
          }
        });

        renderActiveGames(recentGames);
      })
      .catch((err) => {
        console.error("Error loading active games:", err);
        list.innerHTML = "<div>Error loading games.</div>";
      });
  }

  /* ---------- Render game list ---------- */
  function renderActiveGames(games) {
    const list = document.getElementById("admin-game-list");
    list.innerHTML = "<div style='font-weight:bold;margin-bottom:4px;'>Active / Recent Games</div>";

    if (games.length === 0) {
      list.innerHTML += "<div>No active or recent games.</div>";
      return;
    }

    games.forEach((g) => {
      const wrap = document.createElement("div");
      Object.assign(wrap.style, {
        marginBottom: "4px",
        borderBottom: "1px solid rgba(255,255,255,0.15)",
        paddingBottom: "3px",
      });

      const btn = document.createElement("button");
      btn.textContent = `${g.code} (status: ${g.status})`;
      Object.assign(btn.style, {
        display: "block",
        width: "100%",
        margin: "3px 0",
        cursor: "pointer",
      });
      btn.onclick = () => toggleGamePlayers(g.code, wrap);
      wrap.appendChild(btn);

      list.appendChild(wrap);
    });
  }

  /* ---------- Toggle game -> show players ---------- */
  function toggleGamePlayers(code, container) {
    // remove old list if already open
    const old = container.querySelector(".player-list");
    if (old) {
      old.remove();
      return;
    }

    const playersRef = firebase.database().ref(code + "/players");
    const sub = document.createElement("div");
    sub.className = "player-list";
    sub.style.marginLeft = "8px";
    sub.textContent = "Loading players…";
    container.appendChild(sub);

    playersRef.once("value").then((snap) => {
      const players = snap.val() || {};
      sub.innerHTML = `<div style="font-weight:bold;margin:4px 0;">Players in ${code}</div>`;

      if (Object.keys(players).length === 0) {
        sub.innerHTML += "<div>No players currently.</div>";
      } else {
        Object.entries(players).forEach(([id, p]) => {
          const colorBox = `<span style="display:inline-block;width:12px;height:12px;background:${p.color || "#ccc"};margin-right:6px;border-radius:3px;"></span>`;
          const div = document.createElement("div");
          div.style.margin = "2px 0";
          div.innerHTML = `${colorBox}${p.name || "(no name)"} — Lap ${p.lap ?? "?"} — Checkpoint ${p.checkpoint ?? "?"}`;
          sub.appendChild(div);
        });
      }
    });
  }

  /* ---------- Join game as admin ---------- */
  function joinGameAsAdmin(code) {
    const statusRef = firebase.database().ref(code + "/status");
    const playersRef = firebase.database().ref(code + "/players");

    playersRef.once("value").then((snapshot) => {
      const beforeCount = snapshot.numChildren();
      console.log("Joining game:", code, "| current players:", beforeCount);

      return statusRef.set(0).then(() => {
        let timeoutTriggered = false;

        const watcher = playersRef.on("value", (snap) => {
          if (timeoutTriggered) return;
          const nowCount = snap.numChildren();
          if (nowCount > beforeCount) {
            console.log("New player joined! Resuming game:", code);
            playersRef.off("value", watcher);
            statusRef.set(1);
          }
        });

        setTimeout(() => {
          timeoutTriggered = true;
          playersRef.off("value", watcher);
          console.warn("No player change in 60s, resuming game:", code);
          statusRef.set(1);
        }, 60000);
      });
    });
  }

  /* ---------- Auth watcher ---------- */
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      if (adminButton) adminButton.remove();
      if (adminPanel) adminPanel.remove();
      adminButton = adminPanel = null;
      return;
    }

    user.getIdTokenResult().then((token) => {
      if (token.claims.admin) {
        console.log("🛠 Admin UI activated for:", user.email);
        if (!adminButton) createAdminButton();
        if (!adminPanel) createAdminPanel();
        updateAdminUI(user, token);
      } else {
        if (adminButton) adminButton.remove();
        if (adminPanel) adminPanel.remove();
        adminButton = adminPanel = null;
      }
    });
  });
})();
