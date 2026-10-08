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


        <div id="playersList"></div>


        <button
          id="refreshPlayersButton"
          class="primary-btn"
        >
          Refresh Players
        </button>

      </div>


            <!-- ADMIN ENTER PREDICTION -->

      <div class="admin-panel">

        <div class="muted">
          PLAYER PREDICTION
        </div>

        <h2>
          Enter Prediction For Player
        </h2>

        <p class="hint">
          Enter a selection on a player's behalf.
        </p>

        <select
          id="adminPredictionPlayer"
          class="admin-input"
        >
          <option value="">
            Select player
          </option>
        </select>

        <div
          id="adminPredictionCurrent"
          class="hint"
          style="margin-top:10px;"
        >
          Select a player to see the current round.
        </div>

        <div
          id="adminPredictionFixtures"
          style="margin-top:12px;"
        ></div>

        <p
          id="adminPredictionMessage"
          class="hint"
        >
          No prediction has been entered yet.
        </p>

      </div>

      <!-- ADD THIS PHONE -->

      <div class="admin-panel">

        <div class="muted">
          DEVICE ENROLMENT
        </div>

        <h2>
          Add Player To This Phone
        </h2>

        <p class="hint">
          Generate a one-time code to add a player's existing secure login to another phone.
          The code expires after 10 minutes.
        </p>

        <select
          id="adminDevicePlayer"
          class="admin-input"
        >
          <option value="">
            Select player
          </option>
        </select>

        <button
          id="adminDeviceGenerate"
          class="primary-btn"
        >
          GENERATE DEVICE CODE
        </button>

        <div
          id="adminDeviceResult"
          class="hint"
          style="
            margin-top:12px;
            font-size:18px;
            font-weight:800;
            text-align:center;
          "
        >
          No code generated.
        </div>

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


  /*
   * IMPORTANT:
   *
   * Admin now lives INSIDE the existing main
   * scrolling area.
   *
   * This means it uses exactly the same vertical
   * space as Home / History / Rules.
   *
   * No absolute positioning.
   * No calculated top offset.
   * No calculated bottom offset.
   */

  const main =
    document.querySelector("main");

  if (main) {

    main.appendChild(view);

  } else {

    const shell =
      document.querySelector(".app-shell");

    const nav =
      document.querySelector(".bottom-nav");

    if (shell && nav) {
      shell.insertBefore(view, nav);
    }

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

    #adminView {
      width:100%;
      margin:0 0 14px 0;
    }

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


      if (main) {
        main.scrollTop = 0;
      }

      adminView.scrollTop = 0;


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
  const predictionPlayer =
    document.getElementById(
      "adminPredictionPlayer"
    );

  if (predictionPlayer) {

    predictionPlayer.addEventListener(
      "change",
      loadAdminPredictionPlayer
    );

  }

  const deviceGenerate =
    document.getElementById(
      "adminDeviceGenerate"
    );

  if (deviceGenerate) {

    deviceGenerate.addEventListener(
      "click",
      generateAdminDeviceCode
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

    dashboard.style.display =
      "none";

  }


  if (loginPanel) {

    loginPanel.style.display =
      "";

  }


  if (adminView) {

    adminView.style.display =
      "none";

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

    panel.style.display =
      "none";

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
    window.lmsAdminPlayers =
      players;

    populateAdminPredictionPlayers(
      players
    );

    populateAdminDevicePlayers(
      players
    );

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
   ADMIN DEVICE ENROLMENT
   ===================================================== */

function populateAdminDevicePlayers(players) {

  const select =
    document.getElementById(
      "adminDevicePlayer"
    );

  if (!select) {
    return;
  }

  const current =
    select.value;

  select.innerHTML =
    '<option value="">Select player</option>' +
    (players || [])
      .filter(function(player) {
        return ![
          "eliminated",
          "removed"
        ].includes(
          String(
            player.status || ""
          ).toLowerCase()
        );
      })
      .map(function(player) {
        return (
          '<option value="' +
          escapeAdminHtml(player.id) +
          '">' +
          escapeAdminHtml(player.name) +
          " (" +
          escapeAdminHtml(player.player_code) +
          ")</option>"
        );
      })
      .join("");

  if (current) {
    select.value = current;
  }

}


async function generateAdminDeviceCode() {

  const select =
    document.getElementById(
      "adminDevicePlayer"
    );

  const button =
    document.getElementById(
      "adminDeviceGenerate"
    );

  const result =
    document.getElementById(
      "adminDeviceResult"
    );

  const playerId =
    select?.value || "";

  if (!playerId) {

    if (result) {
      result.textContent =
        "Select a player first.";
    }

    return;
  }

  const token =
    sessionStorage.getItem(
      "lms_admin_token"
    );

  if (!token) {

    if (result) {
      result.textContent =
        "Admin session expired. Please log in again.";
    }

    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent =
      "GENERATING...";
  }

  if (result) {
    result.textContent =
      "Generating code...";
  }

  try {

    const raw =
      await adminCallRpc(
        "create_lms_device_enrolment",
        {
          p_session_token:
            token,

          p_player_id:
            playerId
        }
      );

    const data =
      Array.isArray(raw)
        ? raw[0]
        : raw;

    if (
      !data ||
      data.success === false
    ) {
      throw new Error(
        data?.message ||
        "Could not generate device code."
      );
    }

    if (result) {

      result.innerHTML =
        "DEVICE CODE<br><br>" +
        "<span style=\"font-size:30px;letter-spacing:4px;\">" +
        escapeAdminHtml(
          data.enrolment_code
        ) +
        "</span><br><br>" +
        "<span style=\"font-size:13px;font-weight:400;\">" +
        escapeAdminHtml(
          data.player_name
        ) +
        " — expires in 10 minutes</span>";

    }

  } catch (error) {

    console.error(
      "DEVICE ENROLMENT ERROR:",
      error
    );

    if (result) {
      result.textContent =
        "ERROR: " +
        (
          error?.message ||
          "Could not generate device code."
        );
    }

  } finally {

    if (button) {
      button.disabled = false;
      button.textContent =
        "GENERATE DEVICE CODE";
    }

  }

}
/* =====================================================
   ADMIN ENTER PREDICTION
   ===================================================== */

function populateAdminPredictionPlayers(players) {

  const select =
    document.getElementById(
      "adminPredictionPlayer"
    );

  if (!select) return;

  const current =
    select.value;

  select.innerHTML =
    '<option value="">Select player</option>' +
    (players || [])
      .filter(function(player) {
        return !["eliminated", "removed"].includes(
          String(player.status || "").toLowerCase()
        );
      })
      .map(function(player) {
        return '<option value="' +
          escapeAdminHtml(player.id) +
          '">' +
          escapeAdminHtml(player.name) +
          ' (' +
          escapeAdminHtml(player.player_code) +
          ')</option>';
      })
      .join("");

  if (current) {
    select.value = current;
  }

}


async function loadAdminPredictionPlayer() {

  const select =
    document.getElementById(
      "adminPredictionPlayer"
    );

  const current =
    document.getElementById(
      "adminPredictionCurrent"
    );

  const fixtures =
    document.getElementById(
      "adminPredictionFixtures"
    );

  const message =
    document.getElementById(
      "adminPredictionMessage"
    );

  const playerId =
    select?.value || "";

  if (!playerId) {

    if (current) {
      current.textContent =
        "Select a player to see the current round.";
    }

    if (fixtures) {
      fixtures.innerHTML = "";
    }

    if (message) {
      message.textContent =
        "No prediction has been entered yet.";
    }

    return;
  }

  const player =
    (window.lmsAdminPlayers || [])
      .find(function(item) {
        return String(item.id) === String(playerId);
      });

  if (!player) return;

  if (current) {
    current.textContent =
      "Loading current round...";
  }

  if (fixtures) {
    fixtures.innerHTML = "";
  }

  if (message) {
    message.textContent = "Loading...";
  }

  try {

    
    const token =
      sessionStorage.getItem(
        "lms_admin_token"
      );

    const raw =
      await adminCallRpc(
        "admin_get_player_prediction_data",
        {
          p_session_token:
            token,

          p_player_id:
            player.id
        }
      );
    const data =
      Array.isArray(raw)
        ? raw[0]
        : raw;

    if (!data || data.success === false) {
      throw new Error(
        data?.message ||
        "Player data could not be loaded."
      );
    }

    const round =
      data.current_round ||
      data.round ||
      {};

    const selection =
      data.selection ||
      null;

    if (current) {
      current.innerHTML =
        "<strong>Round " +
        escapeAdminHtml(
          round.game_round_number ||
          round.round_number ||
          "?"
        ) +
        "</strong> — Current selection: <strong>" +
        escapeAdminHtml(
          selection?.team_name ||
          "No selection"
        ) +
        "</strong>";
    }

    if (!round.id) {
      throw new Error(
        "There is no current round."
      );
    }

    if (
      String(round.status || "").toLowerCase() !==
      "open"
    ) {
      throw new Error(
        "The current round is not open for selections."
      );
    }

    renderAdminPredictionFixtures(
      player,
      round,
      data.fixtures || [],
      data.used_teams || [],
      selection
    );

    if (message) {
      message.textContent =
        "Choose the team you want to enter for this player.";
    }

  } catch (error) {

    if (fixtures) {
      fixtures.innerHTML = "";
    }

    if (message) {
      message.textContent =
        error?.message ||
        "Prediction could not be loaded.";
    }

  }

}


function renderAdminPredictionFixtures(
  player,
  round,
  fixtureList,
  usedTeams,
  currentSelection
) {

  const container =
    document.getElementById(
      "adminPredictionFixtures"
    );

  if (!container) return;

  const usedIds = new Set();
  const usedNames = new Set();

  (Array.isArray(usedTeams) ? usedTeams : [])
    .forEach(function(item) {

      const id =
        item?.team_id ||
        item?.id ||
        "";

      const name =
        item?.team_name ||
        item?.name ||
        (typeof item === "string" ? item : "");

      if (id) {
        usedIds.add(String(id));
      }

      if (name) {
        usedNames.add(
          String(name)
            .trim()
            .toLowerCase()
        );
      }

    });

  const currentId =
    currentSelection?.team_id ||
    "";

  const fixtures =
    Array.isArray(fixtureList)
      ? fixtureList
      : [];

  if (!fixtures.length) {

    container.innerHTML =
      '<div class="hint">No fixtures are available.</div>';

    return;
  }

  container.innerHTML =
    fixtures
      .map(function(fixture) {

        const homeId =
          fixture.home_team_id ||
          fixture.home_id ||
          "";

        const awayId =
          fixture.away_team_id ||
          fixture.away_id ||
          "";

        const homeName =
          fixture.home_name ||
          fixture.home_team ||
          fixture.home ||
          "Home";

        const awayName =
          fixture.away_name ||
          fixture.away_team ||
          fixture.away ||
          "Away";

        const kickoff =
          formatAdminDateTime(
            fixture.kickoff_time
          );

        function teamButton(
          teamId,
          teamName
        ) {

          const isCurrent =
            currentId &&
            String(currentId) ===
            String(teamId);

          const alreadyUsed =
            !isCurrent &&
            (
              usedIds.has(
                String(teamId)
              ) ||
              usedNames.has(
                String(teamName)
                  .trim()
                  .toLowerCase()
              )
            );

          return (
            '<button type="button" ' +
            'class="primary-btn admin-prediction-team" ' +
            'data-player-id="' +
            escapeAdminHtml(player.id) +
            '" ' +
            'data-round-id="' +
            escapeAdminHtml(round.id) +
            '" ' +
            'data-team-id="' +
            escapeAdminHtml(teamId) +
            '" ' +
            'data-team-name="' +
            escapeAdminHtml(teamName) +
            '"' +
            (alreadyUsed ? " disabled" : "") +
            ' style="margin-top:8px;">' +
            (
              isCurrent
                ? "CURRENT "
                : alreadyUsed
                  ? "USED "
                  : "ENTER "
            ) +
            escapeAdminHtml(teamName) +
            "</button>"
          );

        }

        return (
          '<div class="admin-player" style="margin-top:10px;">' +

            '<div style="font-weight:800;">' +
              escapeAdminHtml(homeName) +
              " v " +
              escapeAdminHtml(awayName) +
            "</div>" +

            '<div class="hint" style="margin-top:4px;">' +
              escapeAdminHtml(kickoff) +
            "</div>" +

            teamButton(
              homeId,
              homeName
            ) +

            teamButton(
              awayId,
              awayName
            ) +

          "</div>"
        );

      })
      .join("");

  container
    .querySelectorAll(
      ".admin-prediction-team"
    )
    .forEach(function(button) {

      button.addEventListener(
        "click",
        function() {

          const teamName =
            button.dataset.teamName;

          if (!window.confirm(
            "Enter " +
            teamName +
            " for this player?"
          )) {
            return;
          }

          saveAdminPrediction(
            button.dataset.playerId,
            button.dataset.roundId,
            button.dataset.teamId,
            teamName,
            button
          );

        }
      );

    });

}


async function saveAdminPrediction(
  playerId,
  roundId,
  teamId,
  teamName,
  button
) {

  const message =
    document.getElementById(
      "adminPredictionMessage"
    );

  if (button) {
    button.disabled = true;
    button.textContent =
      "SAVING...";
  }

  if (message) {
    message.textContent =
      "Entering " +
      teamName +
      "...";
  }

    try {

    const result =
      await adminCallRpc(
        "admin_make_selection",
        {
          p_player_id:
            playerId,

          p_round_id:
            roundId,

          p_team_id:
            teamId
        }
      );

    console.log(
      "ADMIN MAKE SELECTION RESULT:",
      result
    );

    if (message) {
      message.textContent =
        teamName +
        " entered successfully. Refreshing...";
    }

    await loadAdminPredictionPlayer();

    await loadPlayers();

  } catch (error) {

    console.error(
      "ADMIN MAKE SELECTION ERROR:",
      error
    );

    if (message) {
      message.textContent =
        "ERROR: " +
        (
          error?.message ||
          "Prediction could not be saved."
        );
    }

    if (button) {
      button.disabled = false;
      button.textContent =
        "ENTER " +
        teamName;
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
