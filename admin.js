/* =====================================================
   LAST MAN STANDING — ADMIN
   ===================================================== */

const ADMIN_SUPABASE_URL =
  "https://tkhykusvmsceleflynok.supabase.co";

const ADMIN_SUPABASE_KEY =
  "sb_publishable_PufAjZIn-i94mT5If1htBw_IKKLuz4B";


/* =====================================================
   SUPABASE RPC
   ===================================================== */

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

  let data;

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
   CREATE ADMIN VIEW
   ===================================================== */

function createAdminView() {

  if (document.getElementById("adminView")) {
    return;
  }

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


    <!-- LOGIN -->

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
          color:#fff;
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

      <p
        class="hint"
        id="adminMessage"
      >
        Admin access is protected.
      </p>

    </div>


    <!-- DASHBOARD -->

    <div
      id="adminDashboard"
      style="display:none;"
    >


      <!-- ADMIN HEADER -->

      <div class="admin-panel">

        <div class="muted">
          ADMINISTRATOR
        </div>

        <h2>
          Admin Dashboard
        </h2>

        <p class="hint">
          Competition management area.
        </p>

      </div>


      <!-- COMPETITION CONTROL -->

      <div class="admin-panel">

        <div class="muted">
          COMPETITION CONTROL
        </div>

        <h2>
          Current Competition
        </h2>

        <div
          id="competitionControlMessage"
          class="hint"
        >
          Loading competition...
        </div>


        <div
          id="competitionControl"
          style="display:none;"
        >

          <div class="control-grid">

            <div class="control-item">
              <div class="control-label">
                COMPETITION
              </div>

              <div
                id="controlCompetitionName"
                class="control-value"
              >
                —
              </div>
            </div>


            <div class="control-item">
              <div class="control-label">
                STATUS
              </div>

              <div
                id="controlCompetitionStatus"
                class="control-value"
              >
                —
              </div>
            </div>


            <div class="control-item">
              <div class="control-label">
                CURRENT ROUND
              </div>

              <div
                id="controlRound"
                class="control-value"
              >
                —
              </div>
            </div>


            <div class="control-item">
              <div class="control-label">
                ROUND STATUS
              </div>

              <div
                id="controlRoundStatus"
                class="control-value"
              >
                —
              </div>
            </div>


            <div class="control-item">
              <div class="control-label">
                SELECTION DEADLINE
              </div>

              <div
                id="controlDeadline"
                class="control-value"
              >
                —
              </div>
            </div>


            <div class="control-item">
              <div class="control-label">
                PLAYERS
              </div>

              <div
                id="controlPlayers"
                class="control-value"
              >
                —
              </div>
            </div>


            <div class="control-item">
              <div class="control-label">
                ALIVE
              </div>

              <div
                id="controlAlive"
                class="control-value"
              >
                —
              </div>
            </div>


            <div class="control-item">
              <div class="control-label">
                PAID
              </div>

              <div
                id="controlPaid"
                class="control-value"
              >
                —
              </div>
            </div>


            <div class="control-item">
              <div class="control-label">
                PRIZE POT
              </div>

              <div
                id="controlPrizePot"
                class="control-value"
              >
                £0.00
              </div>
            </div>


            <div class="control-item">
              <div class="control-label">
                ROLLOVER
              </div>

              <div
                id="controlRollover"
                class="control-value"
              >
                0
              </div>
            </div>

          </div>


          <button
            id="refreshCompetitionButton"
            class="primary-btn"
          >
            Refresh Competition
          </button>


          <button
            id="lockRoundButton"
            class="primary-btn"
            style="margin-top:12px;"
          >
            🔒 Lock Round Now
          </button>


          <p
            id="lockRoundMessage"
            class="hint"
          >
            The round will also lock automatically after the deadline.
          </p>

        </div>

      </div>


      <!-- ADD PLAYER -->

      <div class="admin-panel">

        <div class="muted">
          PLAYER MANAGEMENT
        </div>

        <h2>
          Add Player
        </h2>

        <p class="hint">
          Add a player to this competition.
          New players start as PAYMENT DUE.
        </p>


        <input
          id="newPlayerName"
          type="text"
          autocomplete="off"
          placeholder="Player name"
          class="admin-input"
        >


        <input
          id="newPlayerCode"
          type="text"
          autocomplete="off"
          autocapitalize="characters"
          placeholder="Player code e.g. JOHN"
          class="admin-input"
        >


        <button
          id="addPlayerButton"
          class="primary-btn"
        >
          Add Player
        </button>


        <p
          id="addPlayerMessage"
          class="hint"
        >
          Enter the player's name and code.
        </p>

      </div>


      <!-- PLAYERS -->

      <div class="admin-panel">

        <div class="admin-panel-heading">

          <div>

            <div class="muted">
              COMPETITION
            </div>

            <h2>
              Players
            </h2>

          </div>

          <strong
            id="playerCount"
            style="font-size:24px;"
          >
            —
          </strong>

        </div>


        <p
          id="playersMessage"
          class="hint"
        >
          Loading players...
        </p>


        <div
          id="playersList"
        ></div>


        <button
          id="refreshPlayersButton"
          class="primary-btn"
        >
          Refresh Players
        </button>

      </div>


      <!-- LOGOUT -->

      <button
        id="adminLogoutButton"
        class="primary-btn"
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


  addAdminStyles();

  setupAdminControls();
}


/* =====================================================
   ADMIN STYLES
   ===================================================== */

function addAdminStyles() {

  if (
    document.getElementById(
      "adminExtraStyles"
    )
  ) {
    return;
  }


  const style =
    document.createElement("style");

  style.id =
    "adminExtraStyles";


  style.textContent = `

    .admin-panel {
      margin-top:18px;
      background:rgba(255,255,255,0.04);
      border:1px solid rgba(255,255,255,0.08);
      border-radius:18px;
      padding:20px;
    }

    .admin-panel-heading {
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:12px;
    }

    .admin-input {
      width:100%;
      box-sizing:border-box;
      padding:16px;
      margin-top:10px;
      border-radius:14px;
      border:1px solid rgba(255,255,255,0.12);
      background:#0b1220;
      color:#fff;
      font-size:17px;
      outline:none;
    }

    .admin-panel > .primary-btn {
      margin-top:12px;
    }

    .admin-player {
      padding:16px;
      margin-bottom:12px;
      border-radius:16px;
      background:rgba(255,255,255,0.035);
      border:1px solid rgba(255,255,255,0.07);
    }

    .admin-player-top {
      display:flex;
      justify-content:space-between;
      align-items:flex-start;
      gap:12px;
    }

    .admin-player-name {
      font-size:18px;
      font-weight:700;
    }

    .admin-player-code {
      margin-top:4px;
      font-size:13px;
      opacity:.6;
    }

    .admin-status {
      padding:7px 10px;
      border-radius:999px;
      background:rgba(255,255,255,0.07);
      font-size:12px;
      font-weight:700;
      white-space:nowrap;
    }

    .admin-stats {
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:12px;
      margin-top:15px;
    }

    .admin-stat-label {
      font-size:11px;
      text-transform:uppercase;
      opacity:.5;
    }

    .admin-stat-value {
      margin-top:3px;
      font-weight:600;
    }

    .mark-paid-btn {
      width:100%;
      margin-top:15px;
    }

    .control-grid {
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:10px;
      margin-top:16px;
    }

    .control-item {
      padding:13px;
      border-radius:14px;
      background:rgba(255,255,255,0.035);
      border:1px solid rgba(255,255,255,0.06);
    }

    .control-label {
      font-size:10px;
      text-transform:uppercase;
      letter-spacing:.05em;
      opacity:.5;
    }

    .control-value {
      margin-top:5px;
      font-size:15px;
      font-weight:700;
    }

    @media (max-width:380px) {
      .control-grid {
        grid-template-columns:1fr;
      }
    }

  `;


  document.head.appendChild(style);
}


/* =====================================================
   ADMIN NAVIGATION
   ===================================================== */

function createAdminNav() {

  const nav =
    document.querySelector(
      ".bottom-nav"
    );

  if (!nav) {
    return;
  }


  if (
    document.getElementById(
      "adminNavButton"
    )
  ) {
    return;
  }


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

      if (!adminView) {
        return;
      }


      const main =
        document.querySelector(
          "main"
        );


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


      if (
        sessionStorage.getItem(
          "lms_admin_token"
        )
      ) {

        loadPlayers();

        loadCompetitionControl();

      }

    }
  );


  nav.appendChild(button);


  nav
    .querySelectorAll(
      ".nav-item"
    )
    .forEach(
      item => {

        if (item === button) {
          return;
        }


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

  const login =
    document.getElementById(
      "adminLoginButton"
    );

  const pin =
    document.getElementById(
      "adminPin"
    );

  const logout =
    document.getElementById(
      "adminLogoutButton"
    );

  const refresh =
    document.getElementById(
      "refreshPlayersButton"
    );

  const refreshCompetition =
    document.getElementById(
      "refreshCompetitionButton"
    );

  const addPlayer =
    document.getElementById(
      "addPlayerButton"
    );

  const lockRound =
    document.getElementById(
      "lockRoundButton"
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


  if (refreshCompetition) {
    refreshCompetition.addEventListener(
      "click",
      loadCompetitionControl
    );
  }


  if (addPlayer) {
    addPlayer.addEventListener(
      "click",
      addNewPlayer
    );
  }


  if (lockRound) {
    lockRound.addEventListener(
      "click",
      adminLockCurrentRound
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


  const value =
    pin?.value.trim() || "";


  if (
    !/^[0-9]{6}$/.test(value)
  ) {

    message.textContent =
      "Please enter your 6-digit Admin PIN.";

    return;
  }


  button.disabled = true;
  button.textContent = "Checking...";


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


    pin.value = "";


    showAdminDashboard();

    await loadPlayers();

    await loadCompetitionControl();


  } catch (error) {

    console.error(
      error
    );

    message.textContent =
      error?.message ||
      "Admin login failed.";


  } finally {

    button.disabled = false;
    button.textContent = "Login";

  }

}


/* =====================================================
   SHOW DASHBOARD
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
      loggedIn ? "none" : "";
  }


  if (dashboard) {
    dashboard.style.display =
      loggedIn ? "" : "none";
  }


  if (title) {
    title.textContent =
      loggedIn
        ? "Admin Dashboard"
        : "Admin Login";
  }

}


/* =====================================================
   LOGOUT
   ===================================================== */

function adminLogout() {

  sessionStorage.removeItem(
    "lms_admin_token"
  );


  const dashboard =
    document.getElementById(
      "adminDashboard"
    );

  const loginPanel =
    document.getElementById(
      "adminLoginPanel"
    );

  const adminView =
    document.getElementById(
      "adminView"
    );


  if (dashboard) {
    dashboard.style.display = "none";
  }


  if (loginPanel) {
    loginPanel.style.display = "";
  }


  if (adminView) {
    adminView.style.display = "none";
  }

}


/* =====================================================
   COMPETITION CONTROL
   ===================================================== */

async function loadCompetitionControl() {

  const token =
    sessionStorage.getItem(
      "lms_admin_token"
    );


  if (!token) {
    return;
  }


  const message =
    document.getElementById(
      "competitionControlMessage"
    );

  const panel =
    document.getElementById(
      "competitionControl"
    );

  const refresh =
    document.getElementById(
      "refreshCompetitionButton"
    );


  if (message) {
    message.textContent =
      "Loading competition...";
  }


  if (panel) {
    panel.style.display = "none";
  }


  if (refresh) {
    refresh.disabled = true;
    refresh.textContent =
      "Loading...";
  }


  try {

    const raw =
      await adminCallRpc(
        "admin_get_competition_control",
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
        "Unable to load competition."
      );

    }


    const competition =
      result.competition || {};

    const round =
      result.round;

    const players =
      result.players || {};


    document.getElementById(
      "controlCompetitionName"
    ).textContent =
      competition.name || "—";


    document.getElementById(
      "controlCompetitionStatus"
    ).textContent =
      formatCompetitionStatus(
        competition.status
      );


    document.getElementById(
      "controlRound"
    ).textContent =
      round
        ? `Round ${round.round_number}`
        : "No active round";


    document.getElementById(
      "controlRoundStatus"
    ).textContent =
      round
        ? formatRoundStatus(
            round.status
          )
        : "—";


    const lockButton =
      document.getElementById(
        "lockRoundButton"
      );


    if (lockButton) {

      lockButton.dataset.roundId =
        round?.id || "";

      lockButton.style.display =
        round?.status === "open"
          ? ""
          : "none";

    }


    document.getElementById(
      "controlDeadline"
    ).textContent =
      round
        ? formatAdminDateTime(
            round.selection_deadline
          )
        : "—";


    document.getElementById(
      "controlPlayers"
    ).textContent =
      Number(
        players.total || 0
      );


    document.getElementById(
      "controlAlive"
    ).textContent =
      Number(
        players.alive || 0
      );


    document.getElementById(
      "controlPaid"
    ).textContent =
      Number(
        players.paid || 0
      );


    document.getElementById(
      "controlPrizePot"
    ).textContent =
      `£${Number(
        competition.prize_pot || 0
      ).toFixed(2)}`;


    document.getElementById(
      "controlRollover"
    ).textContent =
      Number(
        competition.rollover_number || 0
      );


    if (panel) {
      panel.style.display = "";
    }


    if (message) {

      message.textContent =
        round
          ? "Current competition information."
          : "There is currently no active round.";

    }


  } catch (error) {

    console.error(
      "Competition control:",
      error
    );


    if (message) {

      message.textContent =
        error?.message ||
        "Unable to load competition.";

    }

  } finally {

    if (refresh) {

      refresh.disabled = false;

      refresh.textContent =
        "Refresh Competition";

    }

  }

}


/* =====================================================
   MANUAL ROUND LOCK
   ===================================================== */

async function adminLockCurrentRound() {

  const token =
    sessionStorage.getItem(
      "lms_admin_token"
    );

  const button =
    document.getElementById(
      "lockRoundButton"
    );

  const message =
    document.getElementById(
      "lockRoundMessage"
    );

  const roundId =
    button?.dataset.roundId || "";


  if (!token) {

    if (message) {
      message.textContent =
        "Admin session expired. Please log in again.";
    }

    return;
  }


  if (!roundId) {

    if (message) {
      message.textContent =
        "There is no open round available to lock.";
    }

    return;
  }


  const confirmed =
    window.confirm(
      "Lock the current round now? All player selections will be finalised."
    );


  if (!confirmed) {
    return;
  }


  button.disabled = true;

  button.textContent =
    "Locking...";


  if (message) {

    message.textContent =
      "Locking round and finalising selections...";

  }


  try {

    const raw =
      await adminCallRpc(
        "admin_lock_round",
        {
          p_session_token:
            token,

          p_round_id:
            roundId
        }
      );


    const result =
      Array.isArray(raw)
        ? raw[0]
        : raw;


    if (!result?.success) {

      throw new Error(
        result?.message ||
        "Round could not be locked."
      );

    }


    if (message) {

      message.textContent =
        result.message ||
        "Round locked successfully.";

    }


    await loadCompetitionControl();


    await loadPlayers();


  } catch (error) {

    console.error(
      "Manual round lock:",
      error
    );


    if (message) {

      message.textContent =
        error?.message ||
        "Round could not be locked.";

    }


    button.disabled = false;

    button.textContent =
      "🔒 Lock Round Now";

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


  const name =
    nameInput?.value.trim() || "";


  const code =
    codeInput?.value
      .trim()
      .toUpperCase() || "";


  if (!name) {

    message.textContent =
      "Please enter the player's name.";

    return;
  }


  if (!code) {

    message.textContent =
      "Please enter a player code.";

    return;
  }


  button.disabled = true;

  button.textContent =
    "Adding...";


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


    nameInput.value = "";
    codeInput.value = "";


    message.textContent =
      "Player added successfully. Payment is now due.";


    await loadPlayers();

    await loadCompetitionControl();


  } catch (error) {

    console.error(
      error
    );


    message.textContent =
      error?.message ||
      "Player could not be added.";


  } finally {

    button.disabled = false;

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


  if (!token) {
    return;
  }


  const message =
    document.getElementById(
      "playersMessage"
    );

  const count =
    document.getElementById(
      "playerCount"
    );

  const list =
    document.getElementById(
      "playersList"
    );

  const refresh =
    document.getElementById(
      "refreshPlayersButton"
    );


  if (refresh) {

    refresh.disabled = true;

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
      result.players || [];


    count.textContent =
      players.length;


    message.textContent =
      `${players.length} players in this competition.`;


    renderPlayers(players);


  } catch (error) {

    console.error(
      error
    );


    message.textContent =
      error?.message ||
      "Unable to load players.";


  } finally {

    if (refresh) {

      refresh.disabled = false;

      refresh.textContent =
        "Refresh Players";

    }

  }

}


/* =====================================================
   RENDER PLAYERS
   ===================================================== */

function renderPlayers(players) {

  const list =
    document.getElementById(
      "playersList"
    );


  if (!list) {
    return;
  }


  list.innerHTML =
    players.map(
      player => {

        const status =
          String(
            player.status ||
            "unknown"
          ).toLowerCase();


        const payment =
          `£${Number(
            player.paid_amount || 0
          ).toFixed(2)}`;


        const missed =
          Number(
            player.missed_selection_count || 0
          );


        const rollover =
          Number(
            player.rollover_number || 0
          );


        /*
         * The backend now supplies the correct
         * entry fee for this player.
         *
         * Normal game:
         *   £5
         *
         * Rollover:
         *   Existing player = £5
         *   New player = rollover new-player fee
         *
         * Use 5 as a safe fallback for older
         * player records.
         */

        const entryFee =
          Number(
            player.rollover_entry_fee ??
            5
          );


        const statusLabel =
          formatPlayerStatus(
            status
          );


        const markPaid =
          status === "payment_due"
            ? `
              <button
                class="primary-btn mark-paid-btn"
                data-player-id="${player.id}"
                data-payment-amount="${entryFee.toFixed(2)}"
              >
                MARK PAID £${entryFee.toFixed(2)}
              </button>
            `
            : "";


        return `

          <div class="admin-player">

            <div class="admin-player-top">

              <div>

                <div class="admin-player-name">
                  ${escapeAdminHtml(
                    player.name
                  )}
                </div>

                <div class="admin-player-code">
                  Code:
                  ${escapeAdminHtml(
                    player.player_code
                  )}
                </div>

              </div>


              <div class="admin-status">
                ${statusLabel}
              </div>

            </div>


            <div class="admin-stats">

              <div>

                <div class="admin-stat-label">
                  Payment
                </div>

                <div class="admin-stat-value">
                  ${payment}
                </div>

              </div>


              <div>

                <div class="admin-stat-label">
                  Missed
                </div>

                <div class="admin-stat-value">
                  ${missed}
                </div>

              </div>


              <div>

                <div class="admin-stat-label">
                  Rollover
                </div>

                <div class="admin-stat-value">
                  ${rollover}
                </div>

              </div>


              <div>

                <div class="admin-stat-label">
                  Joined
                </div>

                <div class="admin-stat-value">
                  ${formatAdminDate(
                    player.joined_at
                  )}
                </div>

              </div>

            </div>


            ${markPaid}

          </div>

        `;

      }
    )
    .join("");


  list
    .querySelectorAll(
      ".mark-paid-btn"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            markPlayerPaid(
              button.dataset.playerId,
              button
            );

          }
        );

      }
    );

}


/* =====================================================
   MARK PLAYER PAID
   ===================================================== */

async function markPlayerPaid(
  playerId,
  button
) {

  const paymentAmount =
    Number(
      button?.dataset.paymentAmount ||
      5
    );


  const confirmed =
    window.confirm(
      `Mark this player as PAID and record the £${paymentAmount.toFixed(2)} entry payment?`
    );


  if (!confirmed) {
    return;
  }


  button.disabled = true;

  button.textContent =
    "MARKING PAID...";


  try {

    const raw =
      await adminCallRpc(
        "admin_mark_paid",
        {
          p_player_id:
            playerId
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
        "Payment could not be recorded."
      );

    }


    await loadPlayers();

    await loadCompetitionControl();


  } catch (error) {

    console.error(
      error
    );


    alert(
      error?.message ||
      "Payment could not be recorded."
    );


    button.disabled = false;

    button.textContent =
      `MARK PAID £${paymentAmount.toFixed(2)}`;

  }

}


/* =====================================================
   STATUS HELPERS
   ===================================================== */

function formatPlayerStatus(status) {

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
    labels[status] ||
    status.toUpperCase()
  );

}


function formatCompetitionStatus(status) {

  const labels = {

    setup:
      "SETUP",

    active:
      "ACTIVE",

    paused:
      "PAUSED",

    rollover:
      "ROLLOVER",

    complete:
      "COMPLETE"

  };


  const value =
    String(
      status ||
      "unknown"
    ).toLowerCase();


  return (
    labels[value] ||
    value.toUpperCase()
  );

}


function formatRoundStatus(status) {

  const labels = {

    upcoming:
      "UPCOMING",

    open:
      "OPEN",

    locked:
      "LOCKED",

    in_progress:
      "IN PROGRESS",

    completed:
      "COMPLETED",

    abandoned:
      "ABANDONED"

  };


  const value =
    String(
      status ||
      "unknown"
    ).toLowerCase();


  return (
    labels[value] ||
    value.toUpperCase()
  );

}


/* =====================================================
   DATE HELPERS
   ===================================================== */

function formatAdminDate(value) {

  if (!value) {
    return "—";
  }


  const date =
    new Date(value);


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


function formatAdminDateTime(value) {

  if (!value) {
    return "—";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }


  return date.toLocaleString(
    "en-GB",
    {
      day:"2-digit",
      month:"short",
      year:"numeric",
      hour:"2-digit",
      minute:"2-digit"
    }
  );

}


/* =====================================================
   HTML SAFETY
   ===================================================== */

function escapeAdminHtml(value) {

  return String(
    value ?? ""
  )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =====================================================
   START
   ===================================================== */

function startAdmin() {

  createAdminView();

  createAdminNav();

  showAdminDashboard();

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
