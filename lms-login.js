(function () {
  const SUPABASE_URL = "https://tkhykusvmsceleflynok.supabase.co";
  const SUPABASE_KEY = "sb_publishable_PufAjZIn-i94mT5If1htBw_IKKLuz4B";

  function getSavedCode() {
    return localStorage.getItem("lms_player_code") || "";
  }

  function saveCode(code) {
    localStorage.setItem("lms_player_code", code);
  }

  function clearCode() {
    localStorage.removeItem("lms_player_code");
  }

  function showLogin(message = "") {
    let overlay = document.getElementById("lms-login-overlay");

    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "lms-login-overlay";

      overlay.style.cssText = `
        position:fixed;
        inset:0;
        z-index:99999;
        background:#f4f7fb;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:20px;
        box-sizing:border-box;
        font-family:Arial,sans-serif;
      `;

      overlay.innerHTML = `
        <div style="
          width:100%;
          max-width:420px;
          background:white;
          border-radius:18px;
          padding:30px 24px;
          box-shadow:0 10px 35px rgba(0,0,0,.15);
          text-align:center;
          box-sizing:border-box;
        ">

          <div style="
            font-size:28px;
            font-weight:800;
            color:#111827;
            margin-bottom:8px;
          ">
            LAST MAN STANDING
          </div>

          <div style="
            font-size:18px;
            font-weight:600;
            color:#374151;
            margin-bottom:25px;
          ">
            Player Login
          </div>

          <input
            id="lms-login-code"
            type="text"
            maxlength="6"
            placeholder="LMS001"
            autocomplete="off"
            style="
              width:100%;
              box-sizing:border-box;
              padding:16px;
              border:2px solid #d1d5db;
              border-radius:10px;
              font-size:20px;
              text-align:center;
              text-transform:uppercase;
              outline:none;
              margin-bottom:14px;
            "
          >

          <button
            id="lms-login-button"
            style="
              width:100%;
              padding:16px;
              border:0;
              border-radius:10px;
              background:#166534;
              color:white;
              font-size:18px;
              font-weight:700;
              cursor:pointer;
            "
          >
            ENTER THE GAME
          </button>

          <div
            id="lms-login-error"
            style="
              color:#b91c1c;
              font-size:15px;
              font-weight:600;
              margin-top:15px;
              min-height:20px;
            "
          ></div>

          <div style="
            margin-top:18px;
            color:#6b7280;
            font-size:13px;
          ">
            Enter the player code given to you.
          </div>

        </div>
      `;

      document.body.appendChild(overlay);

      document
        .getElementById("lms-login-button")
        .addEventListener("click", login);

      document
        .getElementById("lms-login-code")
        .addEventListener("keydown", function (event) {
          if (event.key === "Enter") {
            login();
          }
        });
    }

    overlay.style.display = "flex";

    const error = document.getElementById("lms-login-error");
    if (error) {
      error.textContent = message;
    }

    const input = document.getElementById("lms-login-code");
    if (input) {
      input.value = getSavedCode();
      setTimeout(() => input.focus(), 100);
    }
  }

  function hideLogin() {
    const overlay = document.getElementById("lms-login-overlay");

    if (overlay) {
      overlay.style.display = "none";
    }
  }

  async function checkCode(code) {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/get_lms_player_data`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          p_player_code: code
        })
      }
    );

    if (!response.ok) {
      throw new Error("Unable to check player code");
    }

    const data = await response.json();

    return data && data.success && data.player;
  }

  async function login() {
    const input = document.getElementById("lms-login-code");
    const button = document.getElementById("lms-login-button");
    const error = document.getElementById("lms-login-error");

    if (!input) return;

    const code = input.value.trim().toUpperCase();

    if (!/^LMS\d{3}$/.test(code)) {
      error.textContent = "Please enter a valid player code, for example LMS001.";
      return;
    }

    button.disabled = true;
    button.textContent = "CHECKING...";
    error.textContent = "";

    try {
      const player = await checkCode(code);

      if (!player) {
        throw new Error("Player not found");
      }

      window.PLAYER_CODE = code;
      saveCode(code);

      hideLogin();

      if (typeof window.loadPlayer === "function") {
        await window.loadPlayer(false);
      }

    } catch (err) {
      console.error(err);
      error.textContent = "Player code not found. Please check your code.";
    }

    button.disabled = false;
    button.textContent = "ENTER THE GAME";
  }

  function addLogoutButton() {
    const card = document.querySelector(".player-card");

    if (!card) return;

    if (document.getElementById("lms-change-player")) return;

    const button = document.createElement("button");

    button.id = "lms-change-player";
    button.textContent = "Change player";

    button.style.cssText = `
      margin-top:12px;
      padding:9px 14px;
      border:1px solid #d1d5db;
      border-radius:8px;
      background:white;
      color:#374151;
      font-size:13px;
      cursor:pointer;
    `;

    button.addEventListener("click", function () {
      clearCode();
      showLogin();
    });

    card.appendChild(button);
  }

  async function startLoginSystem() {
    const savedCode = getSavedCode();

    if (!savedCode) {
      showLogin();
      return;
    }

    try {
      const player = await checkCode(savedCode);

      if (!player) {
        clearCode();
        showLogin();
        return;
      }

      window.PLAYER_CODE = savedCode;
      hideLogin();

      setTimeout(addLogoutButton, 1000);

    } catch (err) {
      console.error(err);

      clearCode();
      showLogin("Please enter your player code.");
    }
  }

  window.lmsShowLogin = showLogin;
  window.lmsLogoutPlayer = function () {
    clearCode();
    showLogin();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(startLoginSystem, 100);
    });
  } else {
    setTimeout(startLoginSystem, 100);
  }
})();
