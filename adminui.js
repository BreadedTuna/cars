// adminui.js  –  Admin UI Framework + Active Game List
(function() {
  let adminButton, adminPanel;
  let isDragging = false, moved = false, offsetX = 0, offsetY = 0;

  /* ---------------- Draggable "A" button ---------------- */
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
      touchAction: "none"
    });
    adminButton.textContent = "A";

    // Drag start
    adminButton.addEventListener("mousedown", startDrag);
    adminButton.addEventListener("touchstart", startDrag, { passive: false });
    // Drag move
    window.addEventListener("mousemove", drag);
    window.addEventListener("touchmove", drag, { passive: false });
    // Drag end
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

  /* ---------------- Expandable admin panel ---------------- */
  function createAdminPanel() {
    adminPanel = document.createElement("div");
    Object.assign(adminPanel.style, {
      position: "fixed",
      right: "80px",
      bottom: "20px",
      width: "270px",
      background: "rgba(0,0,0,0.85)",
      color: "#fff",
      borderRadius: "12px",
      padding: "10px 14px",
      fontFamily: "monospace",
      fontSize: "13px",
      boxShadow: "0 0 10px rgba(0,0,0,0.5)",
      display: "none",
      zIndex: "99999"
    });
    adminPanel.innerHTML = `
      <div style="font-weight:bold;font-size:15px;margin-bottom:6px;">Admin Panel</div>
      <div id="admin-email">Email: (loading…)</div>
      <div id="admin-claim">Admin Claim: (checking…)</div>
      <div id="admin-db">DB Status: (unknown)</div>
      <button id="refresh-games" style="margin-top:8px;width:100%;cursor:pointer;">🔄 Refresh Games</button>
    `;
    document.body.appendChild(adminPanel);

    document.getElementById("refresh-games").onclick = loadActiveGames;
  }

  function togglePanel() {
    if (!adminPanel) return;
    adminPanel.style.display =
      adminPanel.style.display === "none" ? "block" : "none";
  }

  /* ---------------- Admin info + DB check ---------------- */
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
        document.getElementById("admin-db").textContent = "DB Status: ✅ Connected";
      })
      .catch(() => {
        document.getElementById("admin-db").textContent = "DB Status: ❌ Error";
      });

    // load games after info shown
    loadActiveGames();
  }

  /* ---------------- Load recent / active games ---------------- */
  function loadActiveGames() {
    const rootRef = firebase.database().ref("/");
    const threeMinutesAgo = Date.now() - 3 * 60 * 1000;

    rootRef.once("value").then(snapshot => {
      const data = snapshot.val() || {};
      const recentGames = [];

      Object.keys(data).forEach(code => {
        const game = data[code];
        if (!game || typeof game !== "object") return;
        const status = game.status;
        const ts = game.timestamp || 0;
        if (ts >= threeMinutesAgo) {
          recentGames.push({ code, status, ts });
        }
      });

      renderActiveGames(recentGames);
    }).catch(err => {
      console.error("Error loading active games:", err);
    });
  }

  /* ---------------- Render game list in panel ---------------- */
  function renderActiveGames(games) {
    const old = document.getElementById("admin-game-list");
    if (old) old.remove();

    const container = document.createElement("div");
    container.id = "admin-game-list";
    container.style.marginTop = "10px";
    container.innerHTML = `<div style='font-weight:bold;margin-bottom:4px;'>Active / Recent Games</div>`;

    if (games.length === 0) {
      container.innerHTML += "<div>No active or recent games.</div>";
    } else {
      games.forEach(g => {
        const btn = document.createElement("button");
        btn.textContent = `${g.code}  (status: ${g.status})`;
        Object.assign(btn.style, {
          display: "block",
          margin: "4px 0",
          width: "100%",
          cursor: "pointer"
        });
        btn.onclick = () => joinGameAsAdmin(g.code);
        container.appendChild(btn);
      });
    }

    adminPanel.appendChild(container);
  }

  /* ---------------- Join game as admin ---------------- */
  function joinGameAsAdmin(code) {
  const statusRef = firebase.database().ref(code + "/status");
  const playersRef = firebase.database().ref(code + "/players");

  console.log("Attempting to join game:", code);

  // Step 1: get initial player count
  playersRef.once("value").then(snapshot => {
    const beforeCount = snapshot.numChildren();
    console.log("Initial player count:", beforeCount);

    // Step 2: reopen game (status = 0)
    return statusRef.set(0).then(() => {
      console.log("Temporarily reopened game:", code);

      // Step 3: set up listener for player changes
      let timeoutTriggered = false;

      const watcher = playersRef.on("value", snap => {
        if (timeoutTriggered) return; // ignore if already timed out
        const nowCount = snap.numChildren();

        // Detect new player joined
        if (nowCount > beforeCount) {
          console.log("New player joined! Resuming game:", code);
          playersRef.off("value", watcher);
          statusRef.set(1);
        }
      });

      // Step 4: timeout after 60s
      setTimeout(() => {
        timeoutTriggered = true;
        playersRef.off("value", watcher);
        console.warn("No player change detected after 60s. Resuming game anyway:", code);
        statusRef.set(1);
      }, 60000);
    });
  }).catch(err => {
    console.error("Error joining game as admin:", err);
  });
}

  /* ---------------- Auth watcher ---------------- */
  firebase.auth().onAuthStateChanged(user => {
    if (!user) {
      if (adminButton) adminButton.remove();
      if (adminPanel) adminPanel.remove();
      adminButton = adminPanel = null;
      return;
    }

    user.getIdTokenResult().then(tokenResult => {
      const isAdmin = tokenResult.claims.admin === true;
      if (isAdmin) {
        console.log("🛠 Admin UI activated for:", user.email);
        if (!adminButton) createAdminButton();
        if (!adminPanel) createAdminPanel();
        updateAdminUI(user, tokenResult);
      } else {
        if (adminButton) adminButton.remove();
        if (adminPanel) adminPanel.remove();
        adminButton = adminPanel = null;
      }
    });
  });
})();
