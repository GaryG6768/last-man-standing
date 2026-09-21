/* =====================================================
   LAST MAN STANDING — ROUND BOARD
   ===================================================== */

const ROUND_BOARD_URL =
  "https://tkhykusvmsceleflynok.supabase.co";

const ROUND_BOARD_KEY =
  "sb_publishable_PufAjZIn-i94mT5If1htBw_IKKLuz4B";

let roundBoardState = {
  roundId: null,
  data: null,
  loading: false
};


/* =====================================================
   SUPABASE RPC
   ===================================================== */

async function roundBoardRpc(name, body) {

  let token = ROUND_BOARD_KEY;

  try {

    if (window.lmsSupabase) {

      const { data } =
        await window.lmsSupabase.auth.getSession();

      if (data?.session?.access_token) {
        token = data.session.access_token;
      }

    }

  } catch (error) {

    console.warn(
      "Round board session error",
      error
    );

  }

  const response = await fetch(
    `${ROUND_BOARD_URL}/rest/v1/rpc/${name}`,
    {
      method: "POST",

      headers: {
        apikey: ROUND_BOARD_KEY,
        Authorization: `Bearer ${token}`,
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
   HTML SAFETY
   ===================================================== */

function roundBoardEsc(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =====================================================
   CREATE BOARD
   ===================================================== */

function createRoundBoard() {

  if (document.getElementById("roundBoard")) {
    return true;
  }

  const main =
    document.querySelector("main");

  const selection =
    document.querySelector(".selection-card");

  if (!main || !selection) {
    return false;
  }

  const board =
    document.createElement("section");

  board.id = "roundBoard";

  board.className =
    "round-board-card";

  board.style.display = "none";

  board.innerHTML = `

    <div class="round-board-header">

      <div>

        <span class="muted">
          ROUND SELECTIONS
        </span>

        <h2 id="roundBoardTitle">
          Current Round
        </h2>

      </div>

    </div>

    <div
      id="roundBoardMessage"
      class="round-board-message"
    >
      Waiting for selections...
    </div>

    <div id="roundBoardContent"></div>

    <div id="eliminatedBoard"></div>

  `;

  const rules =
    Array.from(main.children).find(
      child =>
        child.classList.contains("rules-card")
    );

  if (rules) {

    main.insertBefore(
      board,
      rules
    );

  } else {

    main.appendChild(board);

  }

  addRoundBoardStyles();

  return true;
}


/* =====================================================
   KEEP TRYING UNTIL HOME CONTENT EXISTS
   ===================================================== */

function ensureRoundBoard() {

  if (document.getElementById("roundBoard")) {
    return true;
  }

  return createRoundBoard();

}


/* =====================================================
   STYLES
   ===================================================== */

function addRoundBoardStyles() {

  if (
    document.getElementById(
      "roundBoardStyles"
    )
  ) {
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "roundBoardStyles";

  style.textContent = `

    .round-board-card {
      border:1px solid rgba(255,255,255,.08);
      background:rgba(18,28,44,.9);
      border-radius:20px;
      margin-bottom:14px;
      padding:18px;
      box-shadow:0 12px 35px rgba(0,0,0,.18);
    }

    .round-board-header {
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:12px;
    }

    .round-board-message {
      margin-top:12px;
      padding:13px 14px;
      border-radius:14px;
      background:rgba(255,255,255,.035);
      color:#9aa7ba;
      font-size:12px;
      line-height:1.5;
    }

    .round-board-list {
      margin-top:14px;
      display:grid;
      gap:8px;
    }

    .round-board-player {
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:12px;
      padding:12px 13px;
      border-radius:14px;
      background:#0c1422;
      border:1px solid rgba(255,255,255,.06);
    }

    .round-board-player-name {
      font-weight:750;
      font-size:14px;
    }

    .round-board-team {
      text-align:right;
      font-weight:800;
      font-size:14px;
    }

    .round-board-fixture {
      margin-top:3px;
      color:#7f8ca0;
      font-size:10px;
      text-align:right;
    }

    .round-board-status {
      margin-top:3px;
      font-size:10px;
      font-weight:800;
      text-transform:uppercase;
    }

    .round-board-section-title {
      margin-top:20px;
      margin-bottom:9px;
      font-size:11px;
      font-weight:900;
      letter-spacing:.12em;
      color:#8e9aad;
    }

    .round-board-eliminated {
      display:flex;
      flex-wrap:wrap;
      gap:7px;
    }

    .round-board-eliminated-player {
      padding:8px 10px;
      border-radius:999px;
      background:rgba(239,68,68,.09);
      border:1px solid rgba(239,68,68,.18);
      color:#fca5a5;
      font-size:11px;
      font-weight:750;
    }

    .round-board-count {
      margin-top:10px;
      font-size:12px;
      color:#8e9aad;
    }

    .round-board-auto {
      color:#fcd34d;
    }

    .round-board-alive {
      color:#86efac;
    }

    .round-board-eliminated-status {
      color:#fca5a5;
    }

  `;

  document.head.appendChild(style);

}


/* =====================================================
   LOAD CURRENT ROUND
   ===================================================== */

async function loadRoundBoard() {

  if (roundBoardState.loading) {
    return;
  }

  if (!window.lmsAuthReady) {
    return;
  }

  const ready =
    await window.lmsAuthReady;

  if (!ready) {
    return;
  }

  if (!ensureRoundBoard()) {
    return;
  }

  roundBoardState.loading = true;

  try {

    const playerCode =
      (
        localStorage.getItem(
          "lms_player_code"
        ) || ""
      )
        .trim()
        .toUpperCase();

    if (!playerCode) {
      return;
    }

    const playerData =
      await roundBoardRpc(
        "get_lms_player_data",
        {
          p_player_code:
            playerCode
        }
      );

    if (!playerData?.success) {
      return;
    }

    const round =
      playerData.current_round;

    if (!round?.id) {
      hideRoundBoard();
      return;
    }

    const boardData =
      await roundBoardRpc(
        "get_lms_round_board",
        {
          p_round_id:
            round.id
        }
      );

    if (!boardData?.success) {
      return;
    }

    roundBoardState.roundId =
      round.id;

    roundBoardState.data =
      boardData;

    renderRoundBoard();

  } catch (error) {

    console.warn(
      "Round board error",
      error
    );

  } finally {

    roundBoardState.loading = false;

  }

}


/* =====================================================
   HIDE BOARD
   ===================================================== */

function hideRoundBoard() {

  const board =
    document.getElementById(
      "roundBoard"
    );

  if (board) {
    board.style.display = "none";
  }

}


/* =====================================================
   RENDER BOARD
   ===================================================== */

function renderRoundBoard() {

  if (!ensureRoundBoard()) {
    return;
  }

  const board =
    document.getElementById(
      "roundBoard"
    );

  const data =
    roundBoardState.data;

  if (!board || !data) {
    return;
  }

  board.style.display = "";

  const round =
    data.round || {};

  const counts =
    data.counts || {};

  const title =
    document.getElementById(
      "roundBoardTitle"
    );

  const message =
    document.getElementById(
      "roundBoardMessage"
    );

  const content =
    document.getElementById(
      "roundBoardContent"
    );

  const eliminated =
    document.getElementById(
      "eliminatedBoard"
    );

  if (title) {

    title.textContent =
      `Round ${
        round.game_round_number ||
        round.round_number ||
        ""
      }`;

  }


  /* ===================================================
     SELECTIONS HIDDEN
     =================================================== */

  if (!data.revealed) {

    if (message) {

      message.innerHTML = `

        <strong>
          Selections are still hidden
        </strong>

        <br>

        ${Number(
          counts.selected || 0
        )}
        of
        ${Number(
          counts.players || 0
        )}
        players have selected.

        <br>

        Everyone's selections will appear
        when all predictions are in or the
        deadline passes.

      `;

    }

    if (content) {
      content.innerHTML = "";
    }

  }


  /* ===================================================
     SELECTIONS REVEALED
     =================================================== */

  else {

    if (message) {

      let reason =
        "The selections are now visible.";

      if (
        data.reveal_reason ===
        "all_predictions_in"
      ) {

        reason =
          "Everyone has made their selection.";

      } else if (
        data.reveal_reason ===
        "deadline_passed"
      ) {

        reason =
          "The selection deadline has passed.";

      } else if (
        data.reveal_reason ===
        "round_locked"
      ) {

        reason =
          "The round has been locked.";

      }

      message.innerHTML = `

        <strong>
          Selections revealed
        </strong>

        <br>

        ${roundBoardEsc(reason)}

      `;

    }


    const selections =
      Array.isArray(
        data.selections
      )
        ? data.selections
        : [];


    if (!selections.length) {

      content.innerHTML = `

        <div class="empty-state">
          No selections have been recorded.
        </div>

      `;

    } else {

      content.innerHTML = `

        <div class="round-board-count">

          ${selections.length}
          selections recorded

        </div>

        <div class="round-board-list">

          ${selections
            .map(selection => {

              const status =
                String(
                  selection.player_status || ""
                ).toLowerCase();

              const selectionType =
                String(
                  selection.selection_type ||
                  "normal"
                ).toLowerCase();

              let statusText = "";

              if (
                selectionType ===
                "automatic"
              ) {

                statusText =
                  "AUTOMATIC";

              } else if (
                status ===
                "eliminated"
              ) {

                statusText =
                  "ELIMINATED";

              }

              const statusClass =
                selectionType ===
                  "automatic"
                  ? "round-board-auto"
                  : status ===
                      "eliminated"
                    ? "round-board-eliminated-status"
                    : "round-board-alive";

              return `

                <div
                  class="round-board-player"
                >

                  <div>

                    <div
                      class="round-board-player-name"
                    >
                      ${roundBoardEsc(
                        selection.player_name
                      )}
                    </div>

                    ${
                      statusText
                        ? `
                          <div
                            class="round-board-status ${statusClass}"
                          >
                            ${statusText}
                          </div>
                        `
                        : ""
                    }

                  </div>

                  <div>

                    <div
                      class="round-board-team"
                    >
                      ${roundBoardEsc(
                        selection.team_name ||
                        "No team"
                      )}
                    </div>

                    <div
                      class="round-board-fixture"
                    >
                      ${roundBoardEsc(
                        selection.fixture ||
                        ""
                      )}
                    </div>

                  </div>

                </div>

              `;

            })
            .join("")}

        </div>

      `;

    }

  }


  /* ===================================================
     ELIMINATED PLAYERS
     =================================================== */

  const eliminatedPlayers =
    Array.isArray(
      data.eliminated
    )
      ? data.eliminated
      : [];

  if (!eliminated) {
    return;
  }

  if (!eliminatedPlayers.length) {

    eliminated.innerHTML = `

      <div
        class="round-board-section-title"
      >
        ELIMINATED PLAYERS
      </div>

      <div class="round-board-message">
        No players have been eliminated.
      </div>

    `;

  } else {

    eliminated.innerHTML = `

      <div
        class="round-board-section-title"
      >
        ELIMINATED PLAYERS
        (${eliminatedPlayers.length})
      </div>

      <div
        class="round-board-eliminated"
      >

        ${eliminatedPlayers
          .map(
            player => `

              <span
                class="round-board-eliminated-player"
              >
                ${roundBoardEsc(
                  player.player_name
                )}
              </span>

            `
          )
          .join("")}

      </div>

    `;

  }

}


/* =====================================================
   NAVIGATION
   ===================================================== */

function setupRoundBoardNavigation() {

  const buttons =
    document.querySelectorAll(
      ".bottom-nav .nav-item"
    );

  buttons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        setTimeout(() => {

          const board =
            document.getElementById(
              "roundBoard"
            );

          if (!board) {
            return;
          }

          const label =
            button
              .querySelector("small")
              ?.textContent
              ?.trim()
              ?.toLowerCase();

          if (label === "home") {

            board.style.display = "";

          } else {

            board.style.display = "none";

          }

        }, 50);

      }
    );

  });

}


/* =====================================================
   START
   ===================================================== */

async function startRoundBoard() {

  setupRoundBoardNavigation();

  /*
   * The main app may still be loading when this
   * script starts. Try several times so the board
   * is created as soon as the Home content exists.
   */

  let attempts = 0;

  const tryCreate = () => {

    attempts++;

    if (ensureRoundBoard()) {
      loadRoundBoard();
      return;
    }

    if (attempts < 30) {

      setTimeout(
        tryCreate,
        500
      );

    }

  };

  tryCreate();


  setInterval(
    () => {

      ensureRoundBoard();

      loadRoundBoard();

    },
    30000
  );

}


if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    startRoundBoard
  );

} else {

  startRoundBoard();

}
