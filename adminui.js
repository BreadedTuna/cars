// adminui.js  –  Base Admin UI Framework (mobile-friendly)
(function() {
  let adminButton, adminPanel;
  let isDragging = false, moved = false, offsetX = 0, offsetY = 0;

  /* -------- create draggable button -------- */
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
      touchAction: "none" // helps on mobile
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
    const point = e.touches ? e.touches[0] : e;
    offsetX = point.clientX - rect.left;
    offsetY = point.clientY - rect.top;
    e.preventDefault();
  }

  function drag(e) {
    if (!isDragging) return;
    const point = e.touches ? e.touches[0] : e;
    const x = point.clientX - offsetX;
    const y = point.clientY - offsetY;
    adminButton.style.left = x + "px";
    adminButton.style.top = y + "px";
    adminButton.style.right = "auto";
    adminButton.style.bottom = "auto";
    moved = true;
    e.preventDefault();
  }

  function stopDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    // Treat as tap if barely moved
    if (!moved) togglePanel();
  }

  /* -------- create expandable panel -------- */
  function createAdminPanel() {
    adminPanel = document.createElement("div");
    Object.assign(adminPanel.style, {
      position: "fixed",
      right: "80px",
      bottom: "20px",
      width: "250px",
      background: "rgba(0,0,0,0.85)",
      color: "#fff",
      borderRadius: "12px",
      padding: "10px 14px",
      fontFamily: "monospace",
      fontSize: "13px",
      boxShadow: "0 0 10px rgba(0,0,0,0.5)",
      display: "none",
      zIndex: "99999",
    });
    adminPanel.innerHTML = `
      <div style="font-weight:bold; font-size:15px; margin-bottom:6px;">Admin Panel</div>
      <div id="admin-email">Email: (loading…)</div>
      <div id="admin-claim">Admin Claim: (checking…)</div>
      <div id="admin-db">DB Status: (unknown)</div>
    `;
    document.body.appendChild(adminPanel);
  }

  function togglePanel() {
    if (!adminPanel) return;
    adminPanel.style.display =
      adminPanel.style.display === "none" ? "block" : "none";
  }

  /* -------- update info -------- */
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
  }

  /* -------- watch auth state -------- */
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
