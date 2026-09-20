(function () {
  "use strict";

  const SUPABASE_URL =
    "https://tkhykusvmsceleflynok.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_PufAjZIn-i94mT5If1htBw_IKKLuz4B";

  const CODE_KEY = "lms_player_code";

  function getSavedCode() {
    return localStorage.getItem(CODE_KEY) || "";
  }

  function saveCode(code) {
    localStorage.setItem(CODE_KEY, code);
  }

  function clearCode() {
    localStorage.removeItem(CODE_KEY);
  }

  function showLogin() {
    const overlay = document.getElementById("lms-login-overlay");

    if (overlay) {
      overlay.style.display = "flex";
    }
  }

  function hideLogin() {
    const overlay = document.getElementById("lms-login-overlay");

    if (overlay) {
      overlay.style.display = "none";
    }
  }

  function createLoginScreen() {
    if (document.getElementById("lms-login-overlay")) {
      return;
    }

    const overlay = document.createElement("div");

    overlay.id = "lms-login-overlay";

    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: #f4f7fb;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
    `;

    overlay.innerHTML = `
      <div style="
        width:100%;
        max-width:420px;
        background:white;
        border-radius:20px;
        padding:30px 24px;
        box-sizing:border-box;
        box-shadow:0 10px 35px rgba(0,0,0,.15);
        text-align:center;
      ">

        <div style="
          font-size:32px;
          font-weight:800;
          margin-bottom:8px;
          color:#111827;
        ">
          LAST MAN STANDING
        </div>

        <div style="
          font-size:16px;
          color:#6b7280;
          margin-bottom:28px;
        ">
          Enter your player code to enter the game
        </div>

        <input
          id="lms-login-code"
          type="text"
          inputmode="text"
          autocomplete="off"
          autocapitalize="characters"
          maxlength="6"
          placeholder="LMS001"
          style="
            width:100%;
            box-sizing:border-box;
            padding:16px;
            font-size:24px;
            font-weight:700;
            text-align:center;
            letter-spacing:3px;
            border:2px solid #d1d5db;
            border-radius:12px;
            outline:none;
            text-transform:uppercase;
          "
        />

        <button
          id="lms-login-button"
          style="
            width:100%;
            margin-top:16px;
            padding:16px;
            border:0;
            border-radius:12px;
            background:#16a34a;
            color:white;
            font-size:17px;
            font-weight:800;
            cursor:pointer;
          "
        >
          ENTER THE GAME
        </button>

        <div
          id="lms-login-error"
          style="
            min-height:24px;
            margin-top:14px;
            color:#dc2626;
            font-size:14px;
            font-weight:600;
          "
        ></div>

      </div>
    `;

    document.body.appendChild(overlay);

    const input = document.getElementById("lms-login-code");
    const button = document.getElementById("lms-login-button");

    button.addEventListener("click", login);

    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        login();
      }
    });
  }

  async function checkCode(code) {
    const response = await fetch(
      SUPABASE_URL + "/rest/v1/rpc/get_lms_player_data",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
          Authorization: "Bearer " + SUPABASE_KEY
        },
        body: JSON.stringify({
          p_player_code: code
        })
      }
    );

    if (!response.ok) {
      throw new Error("Unable to check player code.");
    }

    const data = await response.json();

    if (!data || data.success !== true || !data.player) {
      return false;
    }

    return true;
  }

  async function login() {
    const input = document.getElementById("lms-login-code");
    const button = document.getElementById("lms-login-button");
    const error = document.getElementById("lms-login-error");

    if (!input) {
      return;
    }

    const code = input.value.trim().toUpperCase();

    if (!/^LMS\d{3}$/.test(code)) {
      error.textContent =
        "Please enter a valid player code, for example LMS001.";
      return;
    }

    button.disabled = true;
    button.textContent = "CHECKING...";
    error.textContent = "";

    try {
      const valid = await checkCode(code);

      if (!valid) {
        throw new Error(
          "Player code not recognised. Please check your code."
        );
      }

      /*
       * Save the new player's code.
       *
       * We then perform a REAL page navigation.
       * This completely restarts app.js so there is no
       * old PLAYER_CODE left in memory.
       */
      saveCode(code);

      button.textContent = "ENTERING...";

      const basePath = window.location.pathname;

      window.location.href =
        basePath +
        "?player=" +
        encodeURIComponent(code) +
        "&refresh=" +
        Date.now();

    } catch (err) {
      console.error("LMS login error:", err);

      button.disabled = false;
      button.textContent = "ENTER THE GAME";

      error.textContent =
        err && err.message
          ? err.message
          : "Unable to enter the game. Please try again.";
    }
  }

  function addLogoutButton() {
    if (document.getElementById("lms-change-player")) {
      return;
    }

    const playerCard =
      document.querySelector(".player-card") ||
      document.querySelector(".player-info") ||
      document.querySelector("#app");

    if (!playerCard) {
      return;
    }

    const button = document.createElement("button");

    button.id = "lms-change-player";

    button.textContent = "CHANGE PLAYER";

    button.style.cssText = `
      display:block;
      width:100%;
      margin-top:12px;
      padding:12px;
      border:1px solid #d1d5db;
      border-radius:10px;
      background:white;
      color:#374151;
      font-size:14px;
      font-weight:700;
      cursor:pointer;
    `;

    button.addEventListener("click", function () {
      if (
        !confirm(
          "Are you sure you want to change player?"
        )
      ) {
        return;
      }

      clearCode();

      window.location.href =
        window.location.pathname +
        "?login=" +
        Date.now();
    });

    playerCard.appendChild(button);
  }

  function startLoginSystem() {
    createLoginScreen();

    const savedCode = getSavedCode();

    /*
     * If there is no saved player code,
     * show the login screen.
     */
    if (!savedCode) {
      showLogin();
      return;
    }

    /*
     * A saved code means the player has already logged in.
     * Do not show the login screen.
     */
    hideLogin();

    /*
     * Give app.js time to render the player card.
     */
    setTimeout(function () {
      addLogoutButton();
    }, 1500);
  }

  /*
   * Make these available to the rest of the app if needed.
   */
  window.lmsShowLogin = function () {
    clearCode();
    showLogin();
  };

  window.lmsLogoutPlayer = function () {
    clearCode();

    window.location.href =
      window.location.pathname +
      "?login=" +
      Date.now();
  };

  /*
   * Start after the page has loaded.
   */
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      startLoginSystem
    );
  } else {
    startLoginSystem();
  }
})();
