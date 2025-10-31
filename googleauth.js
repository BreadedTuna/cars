// googleauth.js  – for Firebase 7.22.1
// assumes firebase.initializeApp(...) already ran in your main script
(function() {
  /* ------------------  Small status text  ------------------ */
  var statusText = document.createElement("div");
  statusText.id = "google-login-status";
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
    zIndex: "9999"
  });
  statusText.textContent = "Not signed in (anonymous)";
  document.body.appendChild(statusText);

  /* ------------------  Google sign-in logic  ------------------ */
  function googleLogin() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .then(function(result) {
        var user = result.user;
        console.log("✅ Google sign-in success:", user.email);
        statusText.textContent = "Signed in as " + user.email;
      })
      .catch(function(error) {
        console.error("❌ Google sign-in error:", error);
        statusText.textContent = "Sign-in failed: " + (error.message || error.code);
      });
  }

  /* ------------------  Desktop shortcut  ------------------ */
  window.addEventListener("keydown", function(e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "g") {
      e.preventDefault();
      googleLogin();
    }
  });

  /* ------------------  Mobile secret tap zone  ------------------ */
  var tapZone = document.createElement("div");
  Object.assign(tapZone.style, {
    position: "fixed",
    top: "0",
    right: "0",
    width: "80px",
    height: "80px",
    background: "transparent",
    zIndex: "9999"
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
    // reset counter if more than 2 s between taps
    tapTimer = setTimeout(function() { tapCount = 0; }, 2000);
  });

  /* ------------------  Auth state watcher  ------------------ */
  firebase.auth().onAuthStateChanged(function(user) {
    if (user && user.email) {
      statusText.textContent = "Signed in as " + user.email;
      console.log("Currently signed in as:", user.email);
    } else if (user) {
      statusText.textContent = "Signed in anonymously";
    } else {
      statusText.textContent = "Not signed in";
    }
  });
})();