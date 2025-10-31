// googleauth.js – Firebase 7.22.1
// assumes firebase.initializeApp(...) ran already in your main script

(function() {
  /* -------- Status text -------- */
  var statusText = document.createElement("div");
  Object.assign(statusText.style, {
    position: "fixed",
    left: "50%",
    bottom: "10px",
    transform: "translateX(-50%)",
    background: "rgba(0,0,0,0.6)",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: "8px",
    fontFamily: "sans-serif",
    fontSize: "14px",
    zIndex: "9999",
  });
  statusText.textContent = "Not signed in (anonymous)";
  document.body.appendChild(statusText);

  var allowedEmail = "breadedtuna@gmail.com";

  /* -------- Google sign-in -------- */
  function googleLogin() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then(function(result) {
        var user = result.user;
        console.log("Google sign-in attempt:", user.email);
        // we'll check permission after auth state update
      })
      .catch(function(error) {
        console.error("❌ Google sign-in error:", error);
        statusText.textContent = "Sign-in failed: " + (error.message || error.code);
      });
  }

  /* -------- Desktop keybind -------- */
  window.addEventListener("keydown", function(e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "g") {
      e.preventDefault();
      googleLogin();
    }
  });

  /* -------- Mobile tap zone -------- */
  var tapZone = document.createElement("div");
  Object.assign(tapZone.style, {
    position: "fixed",
    top: "0",
    right: "0",
    width: "80px",
    height: "80px",
    background: "transparent",
    zIndex: "9999",
  });
  document.body.appendChild(tapZone);

  var tapCount = 0;
  var tapTimer;
  tapZone.addEventListener("touchstart", function() {
    tapCount++;
    clearTimeout(tapTimer);
    if (tapCount >= 5) {
      tapCount = 0;
      console.log("📱 Secret mobile tap detected – launching Google sign-in");
      googleLogin();
      return;
    }
    tapTimer = setTimeout(function() {
      tapCount = 0;
    }, 2000);
  });

  /* -------- Auth state watcher -------- */
  firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
      statusText.textContent = "Not signed in";
      return;
    }

    // If anonymous
    if (!user.email) {
      statusText.textContent = "Signed in anonymously";
      return;
    }

    // Check ID token for admin claim
    user.getIdTokenResult().then(function(idTokenResult) {
      const isAdmin = !!idTokenResult.claims.admin;
      if (user.email.toLowerCase() === allowedEmail && isAdmin) {
        console.log("✅ Authorized admin:", user.email);
        statusText.textContent = "Signed in as admin: " + user.email;
        // you can reveal admin UI here
      } else {
        console.warn("❌ Unauthorized email or no admin claim:", user.email);
        statusText.textContent = "Permission denied (" + user.email + ")";
        alert("Permission denied: this Google account is not authorized.");
        firebase.auth().signOut();
      }
    }).catch(function(err) {
      console.error("Error reading token:", err);
      statusText.textContent = "Permission check failed";
    });
  });
})();
