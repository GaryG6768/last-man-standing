/* =====================================================
   LAST MAN STANDING — ADMIN
   ===================================================== */

const ADMIN_SUPABASE_URL =
  "https://tkhykusvmsceleflynok.supabase.co";

const ADMIN_SUPABASE_KEY =
  "sb_publishable_PufAjZIn-i94mT5If1htBw_IKKLuz4B";


async function adminCallRpc(name, body) {
  const response = await fetch(
    `${ADMIN_SUPABASE_URL}/rest/v1/rpc/${name}`,
    {
      method: "POST",
      headers: {
        apikey: ADMIN_SUPABASE_KEY,
        Authorization: `Bearer ${ADMIN_SUPABASE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  );

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `Supabase error ${response.status}`
    );
  }

  return data;
}


/* =====================================================
   ADMIN VIEW
   ===================================================== */

function createAdminView() {
  if (document.getElementById("adminView")) return;

  const view = document.createElement("section");
  view.id = "adminView";
  view.className = "rules-card";
  view.style.display = "none";

  view.innerHTML = `
    <div class="section-title">
      <div>
        <span class="muted">ADMINISTRATION</span>
        <h2 id="adminTitle">Admin Login</h2>
      </div>
    </div>

    <div id="adminLoginPanel">
      <p class="hint">
        Enter your 6-digit Admin PIN to access the management area.
      </p>

      <input
        id="adminPin"
        type="password"
        inputmode="numeric"
        maxlength="6"
        autocomplete="off"
        placeholder="••••••"
        style="
          width:100%;
          box-sizing:border-box;
          padding:18px;
          margin-top:12px;
          border-radius:16px;
          border:1px solid rgba(255,255,255,0.12);
          background:#0b1220;
          color:#ffffff;
          font-size:26px;
          letter-spacing:8px;
          text-align:center;
          outline:none;
        "
      >

      <button
        id="adminLoginButton"
        class="primary-btn"
        style="margin-top:14px;"
      >
        Login
      </button>

      <p class="hint" id="adminMessage">
        Admin access is protected.
      </p>
    </div>

    <div id="adminDashboard" style="display:none;">

      <div style="
        background:rgba(255,255,255,0.04);
        border:1px solid rgba(255,255,255,0.08);
        border-radius:18px;
        padding:20px;
      ">
        <div style="
          font-size:12px;
          text-transform:uppercase;
          letter-spacing:.08em;
          opacity:.65;
        ">
          ADMINISTRATOR
        </div>

        <h2 style="margin:6px 0 0;">
          Admin Dashboard
        </h2>

        <p class="hint">
          Competition management area.
        </p>
      </div>


      <!-- =================================================
           ADD PLAYER
           ================================================= -->

      <div style="
        margin-top:18px;
        background:rgba(255,255,255,0.04);
        border:1px solid rgba(255,255,255,0.08);
        border-radius:18px;
        padding:20px;
      ">

        <div>
          <div style="
            font-size:12px;
            text-transform:uppercase;
            letter-spacing:.08em;
            opacity:.65;
          ">
            PLAYER MANAGEMENT
          </div>

          <h2 style="margin:6px 0 0;">
            Add Player
          </h2>

          <p class="hint" style="margin-top:8px;">
            Add a player to this competition.
            New players start as PAYMENT DUE.
          </p>
        </div>

        <input
          id="newPlayerName"
          type="text"
          autocomplete="off"
          placeholder="Player name"
          style="
            width:100%;
            box-sizing:border-box;
            padding:16px;
            margin-top:14px;
            border-radius:14px;
            border:1px solid rgba(255,255,255,0.12);
            background:#0b1220;
            color:#ffffff;
            font-size:17px;
            outline:none;
          "
        >

        <input
          id="newPlayerCode"
          type="text"
          autocomplete="off"
          autocapitalize="characters"
          placeholder="Player code e.g. JOHN"
          style="
            width:100%;
            box-sizing:border-box;
            padding:16px;
            margin-top:10px;
            border-radius:14px;
            border:1px solid rgba(255,255,255,0.12);
            background:#0b1220;
            color:#ffffff;
            font-size:17px;
            outline:none;
          "
        >

        <button
          id="addPlayerButton"
          class="primary-btn"
          style="margin-top:12px;"
        >
          Add Player
        </button>

        <p
          id="addPlayerMessage"
          class="hint"
          style="margin-top:10px;"
        >
          Enter the player's name and code.
        </p>

      </div>


      <!-- =================================================
           PLAYERS
           ================================================= -->

      <div style="
        margin-top:18px;
        background:rgba(255,255,255,0.04);
        border:1px solid rgba(255,255,255,0.08);
        border-radius:18px;
        padding:20px;
      ">

        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
        ">

          <div>
            <div style="
              font-size:12px;
              text-transform:uppercase;
              letter-spacing:.08em;
              opacity:.65;
            ">
              COMPETITION
            </div>

            <h2 style="margin:6px 0 0;">
              Players
            </h2>
          </div>

          <div id="playerCount" style="
            font-size:22px;
            font-weight:700;
          ">
            —
          </div>

        </div>

        <p
          id="playersMessage"
          class="hint"
          style="margin-top:10px;"
        >
          Loading players...
        </p>

        <div
          id="playersList"
          style="margin-top:16px;"
        ></div>

        <button
          id="refreshPlayersButton"
          class="primary-btn"
          style="margin-top:16px;"
        >
          Refresh Players
        </button>

      </div>


      <!-- =================================================
           LOGOUT
           ================================================= -->

      <button
        id="adminLogoutButton"
        class="primary-btn"
        style="margin-top:18px;"
      >
        Log out
      </button>

    </div>
  `;

  const shell =
    document.querySelector(".app-shell");

  const nav =
    document.querySelector(".bottom-nav");

  if (shell && nav) {
    shell.insertBefore(view, nav);
  }

  setupAdminControls();
}


/* =====================================================
   ADMIN NAVIGATION
   ===================================================== */

function createAdminNav() {

  const nav =
    document.querySelector(".bottom-nav");

  if (!nav) return;

  if (
    document.getElementById("adminNavButton")
  ) return;

  const button =
    document.createElement("button");

  button.id =
    "adminNavButton";

  button.className =
    "nav-item";

  button.innerHTML = `
    <span>⚙</span>
    <small>Admin</small>
  `;

  button.addEventListener(
    "click",
    () => {

      const adminView =
        document.getElementById(
          "adminView"
        );

      if (!adminView) return;

      const main =
        document.querySelector("main");

      if (main) {

        Array.from(
          main.children
        ).forEach(
          child => {
            child.style.display =
              "none";
          }
        );

      }

      adminView.style.display = "";

      adminView.scrollIntoView({
        behavior:"smooth",
        block:"start"
      });

      document
        .querySelectorAll(
          ".bottom-nav .nav-item"
        )
        .forEach(
          item =>
            item.classList.remove(
              "active"
            )
        );

      button.classList.add(
        "active"
      );

      showAdminDashboard();

    }
  );

  nav.appendChild(
    button
  );

  const normalButtons =
    nav.querySelectorAll(
      ".nav-item"
    );

  normalButtons.forEach(
    item => {

      if (
        item === button
      ) return;

      item.addEventListener(
        "click",
        () => {

          const adminView =
            document.getElementById(
              "adminView"
            );

          if (adminView) {
            adminView.style.display =
              "none";
          }

          button.classList.remove(
            "active"
          );

        }
      );

    }
  );
}


/* =====================================================
   CONTROLS
   ===================================================== */

function setupAdminControls() {

  const pin =
    document.getElementById(
      "adminPin"
    );

  const login =
    document.getElementById(
      "adminLoginButton"
    );

  const logout =
    document.getElementById(
      "adminLogoutButton"
    );

  const refresh =
    document.getElementById(
      "refreshPlayersButton"
    );

  const addPlayer =
    document.getElementById(
      "addPlayerButton"
    );

  if (login) {
    login.addEventListener(
      "click",
      adminLogin
    );
  }

  if (pin) {

    pin.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Enter"
        ) {
          adminLogin();
        }

      }
    );

  }

  if (logout) {
    logout.addEventListener(
      "click",
      adminLogout
    );
  }

  if (refresh) {
    refresh.addEventListener(
      "click",
      loadPlayers
    );
  }

  if (addPlayer) {
    addPlayer.addEventListener(
      "click",
      addNewPlayer
    );
  }

}


/* =====================================================
   LOGIN
   ===================================================== */

async function adminLogin() {

  const pin =
    document.getElementById(
      "adminPin"
    );

  const button =
    document.getElementById(
      "adminLoginButton"
    );

  const message =
    document.getElementById(
      "adminMessage"
    );

  if (
    !pin ||
    !button ||
    !message
  ) return;

  const value =
    pin.value.trim();

  if (
    !/^[0-9]{6}$/.test(
      value
    )
  ) {

    message.textContent =
      "Please enter your 6-digit Admin PIN.";

    return;

  }

  button.disabled =
    true;

  button.textContent =
    "Checking...";

  try {

    const raw =
      await adminCallRpc(
        "admin_login",
        {
          p_pin:value
        }
      );

    const result =
      Array.isArray(raw)
        ? raw[0]
        : raw;

    if (
      !result?.success ||
      !result?.session_token
    ) {

      throw new Error(
        result?.message ||
        "Incorrect PIN."
      );

    }

    sessionStorage.setItem(
      "lms_admin_token",
      result.session_token
    );

    pin.value =
      "";

    message.textContent =
      "Admin login successful.";

    showAdminDashboard();

    await loadPlayers();

  } catch (error) {

    console.error(
      "Admin login:",
      error
    );

    message.textContent =
      error?.message ||
      "Admin login failed.";

  } finally {

    button.disabled =
      false;

    button.textContent =
      "Login";

  }

}


/* =====================================================
   LOGOUT
   ===================================================== */

function adminLogout() {

  sessionStorage.removeItem(
    "lms_admin_token"
  );

  const adminView =
    document.getElementById(
      "adminView"
    );

  if (adminView) {
    adminView.style.display =
      "none";
  }

  const loginPanel =
    document.getElementById(
      "adminLoginPanel"
    );

  const dashboard =
    document.getElementById(
      "adminDashboard"
    );

  const title =
    document.getElementById(
      "adminTitle"
    );

  const message =
    document.getElementById(
      "adminMessage"
    );

  if (loginPanel) {
    loginPanel.style.display =
      "";
  }

  if (dashboard) {
    dashboard.style.display =
      "none";
  }

  if (title) {
    title.textContent =
      "Admin Login";
  }

  if (message) {
    message.textContent =
      "Admin access is protected.";
  }

  const adminButton =
    document.getElementById(
      "adminNavButton"
    );

  if (adminButton) {
    adminButton.classList.remove(
      "active"
    );
  }

}


/* =====================================================
   SHOW ADMIN DASHBOARD
   ===================================================== */

function showAdminDashboard() {

  const loggedIn =
    !!sessionStorage.getItem(
      "lms_admin_token"
    );

  const loginPanel =
    document.getElementById(
      "adminLoginPanel"
    );

  const dashboard =
    document.getElementById(
      "adminDashboard"
    );

  const title =
    document.getElementById(
      "adminTitle"
    );

  if (loginPanel) {

    loginPanel.style.display =
      loggedIn
        ? "none"
        : "";

  }

  if (dashboard) {

    dashboard.style.display =
      loggedIn
        ? ""
        : "none";

  }

  if (title) {

    title.textContent =
      loggedIn
        ? "Admin Dashboard"
        : "Admin Login";

  }

}


/* =====================================================
   ADD PLAYER
   ===================================================== */

async function addNewPlayer() {

  const nameInput =
    document.getElementById(
      "newPlayerName"
    );

  const codeInput =
    document.getElementById(
      "newPlayerCode"
    );

  const button =
    document.getElementById(
      "addPlayerButton"
    );

  const message =
    document.getElementById(
      "addPlayerMessage"
    );

  const token =
    sessionStorage.getItem(
      "lms_admin_token"
    );

  if (!token) {

    if (message) {
      message.textContent =
        "Please log in again.";
    }

    return;

  }

  const name =
    nameInput?.value.trim() ||
    "";

  const code =
    codeInput?.value
      .trim()
      .toUpperCase() ||
    "";

  if (!name) {

    message.textContent =
      "Please enter the player's name.";

    nameInput?.focus();

    return;

  }

  if (!code) {

    message.textContent =
      "Please enter a player code.";

    codeInput?.focus();

    return;

  }

  if (
    !/^[A-Z0-9_-]{2,20}$/.test(
      code
    )
  ) {

    message.textContent =
      "Player code must be 2-20 characters using letters, numbers, - or _.";

    codeInput?.focus();

    return;

  }

  button.disabled =
    true;

  button.textContent =
    "Adding...";

  message.textContent =
    "Adding player...";

  try {

    const adminInfo =
      await adminCallRpc(
        "admin_get_players",
        {
          p_session_token:
            token
        }
      );

    const competitionId =
      adminInfo?.competition_id;

    if (!competitionId) {

      throw new Error(
        "Could not determine the competition."
      );

    }

    const raw =
      await adminCallRpc(
        "admin_add_player",
        {
          p_competition_id:
            competitionId,

          p_name:
            name,

          p_player_code:
            code
        }
      );

    const result =
      Array.isArray(raw)
        ? raw[0]
        : raw;

    if (
      result &&
      result.success === false
    ) {

      throw new Error(
        result.message ||
        "Player could not be added."
      );

    }

    nameInput.value =
      "";

    codeInput.value =
      "";

    message.textContent =
      "Player added successfully. Payment is now due.";

    await loadPlayers();

  } catch (error) {

    console.error(
      "Add player:",
      error
    );

    message.textContent =
      error?.message ||
      "Player could not be added.";

  } finally {

    button.disabled =
      false;

    button.textContent =
      "Add Player";

  }

}


/* =====================================================
   LOAD PLAYERS
   ===================================================== */

async function loadPlayers() {

  const token =
    sessionStorage.getItem(
      "lms_admin_token"
    );

  const message =
    document.getElementById(
      "playersMessage"
    );

  const list =
    document.getElementById(
      "playersList"
    );

  const count =
    document.getElementById(
      "playerCount"
    );

  const refresh =
    document.getElementById(
      "refreshPlayersButton"
    );

  if (!token) return;

  if (message) {
    message.textContent =
      "Loading players...";
  }

  if (refresh) {

    refresh.disabled =
      true;

    refresh.textContent =
      "Loading...";

  }

  try {

    const raw =
      await adminCallRpc(
        "admin_get_players",
        {
          p_session_token:
            token
        }
      );

    const result =
      Array.isArray(raw)
        ? raw[0]
        : raw;

    if (!result?.success) {

      throw new Error(
        result?.message ||
        "Unable to load players."
      );

    }

    const players =
      result.players ||
      [];

    if (count) {

      count.textContent =
        players.length;

    }

    if (message) {

      message.textContent =
        players.length === 1
          ? "1 player in this competition."
          : `${players.length} players in this competition.`;

    }

    renderPlayers(
      players
    );

  } catch (error) {

    console.error(
      "Load players:",
      error
    );

    if (message) {

      message.textContent =
        error?.message ||
        "Unable to load players.";

    }

    if (list) {
      list.innerHTML =
        "";
    }

  } finally {

    if (refresh) {

      refresh.disabled =
        false;

      refresh.textContent =
        "Refresh Players";

    }

  }

}


/* =====================================================
   RENDER PLAYERS
   ===================================================== */

function renderPlayers(
  players
) {

  const list =
    document.getElementById(
      "playersList"
    );

  if (!list) return;

  if (!players.length) {

    list.innerHTML = `
      <div style="
        padding:20px;
        text-align:center;
        border-radius:14px;
        background:rgba(255,255,255,0.03);
        color:rgba(255,255,255,0.55);
      ">
        No players found.
      </div>
    `;

    return;

  }

  list.innerHTML =
    players
      .map(
        player => {

          const status =
            player.status ||
            "unknown";

          const payment =
            player.paid_amount != null
              ? `£${Number(
                  player.paid_amount
                ).toFixed(2)}`
              : "—";

          const missed =
            Number(
              player.missed_selection_count ||
              0
            );

          const rollover =
            Number(
              player.rollover_number ||
              0
            );

          return `
            <div style="
              padding:16px;
              margin-bottom:10px;
              border-radius:16px;
              background:rgba(255,255,255,0.035);
              border:1px solid rgba(255,255,255,0.07);
            ">

              <div style="
                display:flex;
                justify-content:space-between;
                align-items:flex-start;
                gap:12px;
              ">

                <div>

                  <div style="
                    font-size:18px;
                    font-weight:700;
                  ">
                    ${escapeAdminHtml(
                      player.name
                    )}
                  </div>

                  <div style="
                    margin-top:4px;
                    font-size:13px;
                    opacity:.6;
                  ">
                    Code:
                    ${escapeAdminHtml(
                      player.player_code ||
                      "—"
                    )}
                  </div>

                </div>

                <div style="
                  padding:6px 10px;
                  border-radius:999px;
                  background:rgba(255,255,255,0.07);
                  font-size:12px;
                  font-weight:700;
                  white-space:nowrap;
                ">
                  ${formatPlayerStatus(
                    status
                  )}
                </div>

              </div>

              <div style="
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:10px;
                margin-top:14px;
              ">

                <div>
                  <div style="
                    font-size:11px;
                    text-transform:uppercase;
                    opacity:.5;
                  ">
                    Payment
                  </div>

                  <div style="
                    margin-top:3px;
                    font-weight:600;
                  ">
                    ${payment}
                  </div>
                </div>

                <div>
                  <div style="
                    font-size:11px;
                    text-transform:uppercase;
                    opacity:.5;
                  ">
                    Missed
                  </div>

                  <div style="
                    margin-top:3px;
                    font-weight:600;
                  ">
                    ${missed}
                  </div>
                </div>

                <div>
                  <div style="
                    font-size:11px;
                    text-transform:uppercase;
                    opacity:.5;
                  ">
                    Rollover
                  </div>

                  <div style="
                    margin-top:3px;
                    font-weight:600;
                  ">
                    ${rollover}
                  </div>
                </div>

                <div>
                  <div style="
                    font-size:11px;
                    text-transform:uppercase;
                    opacity:.5;
                  ">
                    Joined
                  </div>

                  <div style="
                    margin-top:3px;
                    font-weight:600;
                  ">
                    ${formatAdminDate(
                      player.joined_at
                    )}
                  </div>
                </div>

              </div>

            </div>
          `;

        }
      )
      .join("");

}


/* =====================================================
   STATUS
   ===================================================== */

function formatPlayerStatus(
  status
) {

  const value =
    String(
      status ||
      "unknown"
    ).toLowerCase();

  const labels = {

    paid:
      "PAID",

    alive:
      "ALIVE",

    eliminated:
      "ELIMINATED",

    winner:
      "WINNER",

    payment_due:
      "PAYMENT DUE",

    paused:
      "PAUSED",

    removed:
      "REMOVED"

  };

  return (
    labels[value] ||
    value.toUpperCase()
  );

}


/* =====================================================
   DATE
   ===================================================== */

function formatAdminDate(
  value
) {

  if (!value) return "—";

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day:"2-digit",
      month:"short",
      year:"numeric"
    }
  );

}


/* =====================================================
   ESCAPE HTML
   ===================================================== */

function escapeAdminHtml(
  value
) {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* =====================================================
   START
   ===================================================== */

function startAdmin() {

  createAdminView();

  createAdminNav();

  if (
    sessionStorage.getItem(
      "lms_admin_token"
    )
  ) {

    showAdminDashboard();

  }

}


if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    startAdmin
  );

} else {

  startAdmin();

}
