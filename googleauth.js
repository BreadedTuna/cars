// googleauth.js – Firebase 7.22.1
// Assumes firebase.initializeApp(...) ran already in your main script

(function () {
  const allowedEmail = "breadedtuna@gmail.com";
  const provider = new firebase.auth.GoogleAuthProvider();

  /* -------- Status text -------- */
  const statusText = document.createElement("div");
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
  statusText.textContent = "Not signed in";
  document.body.appendChild(statusText);

  /* -------- Utilities -------- */
  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  function log(...args) {
    console.log.apply(console, args);
  }

  /* -------- Email link action settings --------
     Use current origin + pathname so the sign-in returns to this same page.
     Make sure this URL is allowed in your Firebase console Authentication -> Authorized domains.
  */
  const actionCodeSettings = {
    url: window.location.href.split("#")[0], // return to same page
    handleCodeInApp: true,
  };

  /* -------- MAIN: Try Google login with robust fallback -------- */
  function googleLoginWithFallback() {
    statusText.textContent = "Starting sign-in...";
    // On iOS always use redirect (less fragile than popup)
    if (isIOS()) {
      log("iOS detected — using signInWithRedirect()");
      statusText.textContent = "Redirecting to Google sign-in...";
      // We'll attempt redirect and rely on getRedirectResult on load to complete.
      firebase.auth().signInWithRedirect(provider).catch(function (err) {
        log("Redirect failed:", err);
        // If redirect fails (rare), fall back to email link
        startEmailLinkFallback("Redirect failed: " + (err.message || err.code));
      });
      return;
    }

    // Non-iOS: try popup first, but watch for popup-block or timeout
    let popupTimedOut = false;
    const popupTimeoutMs = 6000; // give popup a few seconds to complete navigation
    let popupTimer = setTimeout(function () {
      popupTimedOut = true;
      log("Popup timed out — falling back to redirect then email fallback.");
      statusText.textContent = "Popup timed out — trying redirect...";
      // try redirect as next attempt
      tryRedirectOrEmailFallback("popup-timeout");
    }, popupTimeoutMs);

    try {
      firebase
        .auth()
        .signInWithPopup(provider)
        .then(function (result) {
          clearTimeout(popupTimer);
          if (popupTimedOut) {
            // Popup completed after timeout — but treat success normally
            log("Popup completed after timeout:", result.user && result.user.email);
          } else {
            log("Popup sign-in success:", result.user && result.user.email);
          }
        })
        .catch(function (error) {
          clearTimeout(popupTimer);
          log("Popup sign-in error:", error);
          // If popup blocked or other error, try redirect; if that fails, fallback to email link.
          tryRedirectOrEmailFallback(error);
        });
    } catch (err) {
      clearTimeout(popupTimer);
      log("Popup threw sync error:", err);
      tryRedirectOrEmailFallback(err);
    }
  }

  /* Attempt redirect, and if redirect also appears blocked or times out, fall back to email link */
  function tryRedirectOrEmailFallback(prevError) {
    statusText.textContent = "Attempting redirect sign-in...";
    const redirectAttemptTimeout = 4000; // if redirect flow fails quickly, fallback
    let redirectTimer = setTimeout(function () {
      log("Redirect attempt timed out. Falling back to Email Link signin. Previous error:", prevError);
      startEmailLinkFallback("Redirect timed out after popup error.");
    }, redirectAttemptTimeout);

    try {
      firebase
        .auth()
        .signInWithRedirect(provider)
        .catch(function (err) {
          clearTimeout(redirectTimer);
          log("Redirect error (caught):", err);
          startEmailLinkFallback("Redirect error: " + (err.message || err.code));
        });
    } catch (err) {
      clearTimeout(redirectTimer);
      log("Redirect threw sync error:", err);
      startEmailLinkFallback("Redirect failed: " + err.toString());
    }
  }

  /* -------- Email link fallback -------- */
  function startEmailLinkFallback(note) {
    log("Starting Email Link fallback. Note:", note);
    statusText.textContent = "Popup blocked — sending email sign-in link to admin...";
    // store email in localStorage so we can complete sign-in when the link returns
    try {
      localStorage.setItem("emailForSignIn", allowedEmail);
    } catch (e) {
      log("localStorage not available:", e);
    }

    firebase
      .auth()
      .sendSignInLinkToEmail(allowedEmail, actionCodeSettings)
      .then(function () {
        statusText.textContent = "Sign-in link sent to " + allowedEmail + ". Open email to continue.";
        alert("Sign-in link sent to " + allowedEmail + ". Open the email on this device or another device to complete sign-in.");
      })
      .catch(function (error) {
        log("sendSignInLinkToEmail error:", error);
        statusText.textContent = "Email link failed: " + (error.message || error.code);
        alert("Email link sign-in failed: " + (error.message || error.code) + "\nCheck network / allowed domains in Firebase console.");
      });
  }

  /* -------- Handle sign-in with email link if user returned via email -------- */
  if (firebase.auth().isSignInWithEmailLink && firebase.auth().isSignInWithEmailLink(window.location.href)) {
    // We are on the page after the email link was clicked
    let email = null;
    try {
      email = localStorage.getItem("emailForSignIn");
    } catch (e) {
      log("localStorage read error:", e);
    }

    if (!email) {
      // If we don't have the email stored, prompt user to enter it
      email = window.prompt("Please confirm your email for sign-in:");
    }

    if (email) {
      firebase.auth().signInWithEmailLink(email, window.location.href)
        .then(function (result) {
          log("Email link sign-in success:", result.user && result.user.email);
          statusText.textContent = "Signed in via email link: " + (result.user && result.user.email);
          try { localStorage.removeItem("emailForSignIn"); } catch (e) {}
        })
        .catch(function (error) {
          log("Email link sign-in error:", error);
          statusText.textContent = "Email link sign-in failed: " + (error.message || error.code);
          alert("Email sign-in failed: " + (error.message || error.code));
        });
    } else {
      statusText.textContent = "Email required to complete sign-in.";
    }
  }

  /* -------- Desktop hotkey (Ctrl/Cmd + Shift + G) -------- */
  window.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "g") {
      e.preventDefault();
      googleLoginWithFallback();
    }
  });

  /* -------- Secret mobile tap zone (5 taps) — triggers same flow */
  (function createTapZone() {
    let tapCount = 0;
    let tapTimer;
    const btn = document.createElement("button");
    btn.setAttribute("aria-label", "hidden-login-zone");
    Object.assign(btn.style, {
      position: "fixed",
      top: "0",
      right: "0",
      width: "80px",
      height: "80px",
      opacity: "0",
      border: "none",
      background: "transparent",
      zIndex: "9999",
    });
    document.body.appendChild(btn);

    btn.addEventListener("click", function () {
      tapCount++;
      clearTimeout(tapTimer);
      if (tapCount >= 5) {
        tapCount = 0;
        log("Secret mobile tap detected — initiating login with fallback");
        googleLoginWithFallback();
        return;
      }
      tapTimer = setTimeout(function () {
        tapCount = 0;
      }, 2000);
    });
  })();

  /* -------- Redirect result handler (if redirect used, finish flow) -------- */
  firebase.auth().getRedirectResult()
    .then(function (result) {
      if (result.user) {
        log("Redirect sign-in success:", result.user.email);
        statusText.textContent = "Signed in: " + result.user.email;
      } else {
        // no redirect result — nothing to do
      }
    })
    .catch(function (error) {
      log("getRedirectResult error:", error);
      // If redirect fails (e.g. blocked by policy), start email fallback so user can still sign in
      startEmailLinkFallback("getRedirectResult error: " + (error.message || error.code));
    });

  /* -------- Auth state watcher & admin check -------- */
  firebase.auth().onAuthStateChanged(function (user) {
    if (!user) {
      statusText.textContent = "Not signed in";
      return;
    }

    if (!user.email) {
      statusText.textContent = "Signed in anonymously";
      return;
    }

    user.getIdTokenResult()
      .then(function (idTokenResult) {
        const isAdmin = !!idTokenResult.claims.admin;
        if (user.email.toLowerCase() === allowedEmail && isAdmin) {
          log("Authorized admin:", user.email);
          statusText.textContent = "Signed in as admin: " + user.email;
        } else {
          log("Unauthorized or missing admin claim:", user.email);
          statusText.textContent = "Permission denied (" + user.email + ")";
          alert("Permission denied: this Google account is not authorized.");
          firebase.auth().signOut();
        }
      })
      .catch(function (err) {
        log("Token read error:", err);
        statusText.textContent = "Permission check failed";
      });
  });
})();
