/* =====================================================
   LAST MAN STANDING — ROUND BOARD PAGE
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

  const response =
    await fetch(
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

  const text =
    await response.text();

  let data;

  try {

    data =
      text
        ? JSON.parse(text)
        : null;

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
   CREATE PAGE
   ===================================================== */

function createRoundBoardPage() {

  if (
    document.getElementById(
      "roundBoard"
    )
  ) {
    return;
  }

  const main =
    document.querySelector("main");

  if (!main) {
    return;
  }

  const page =
    document.createElement("section");

  page.id =
    "roundBoard";

  page.className =
    "round-board-page";

  page.style.display =
    "none";

  page.innerHTML = `

    <div class="round-board-card">

      <div class="section-title">

        <div>

          <span class="muted">
            ROUND BOARD
          </span>

          <h2 id="roundBoardTitle">
            Round
          </h2>

        </div>

      </div>


      <div
        id="roundBoardMessage"
        class="round-board-message"
      >
        Loading round...
      </div>


      <div
        id="roundBoardContent"
      ></div>


      <div
        id="eliminatedBoard"
      ></div>

    </div>

  `;

  main.appendChild(page);

  addRoundBoardStyles();
}


/* =====================================================
   CREATE ROUND BOARD NAV BUTTON
   ===================================================== */

function createRoundBoardNav() {

  const nav =
    document.querySelector(
      ".bottom-nav"
    );

  if (!nav) {
    return;
  }

  if (
    document.getElementById(
      "roundBoardNavButton"
    )
  ) {
    return;
  }

  const button =
    document.createElement("button");

  button.id =
    "roundBoardNavButton";

  button.className =
    "nav-item";

  button.innerHTML = `

    <span>
      📋
    </span>

    <small>
      Round Board
    </small>

  `;

  button.addEventListener(
    "click",
    showRoundBoardPage
  );

  nav.insertBefore(
    button,
    document.getElementById(
      "adminNavButton"
    ) || null
  );
}


/* =====================================================
   SHOW ROUND BOARD
   ===================================================== */

function showRoundBoardPage() {

  const main =
    document.querySelector("main");

  const page =
    document.getElementById(
      "roundBoard"
    );

  if (!main || !page) {
    return;
  }

  Array.from(
    main.children
  ).forEach(
    child => {

      child.style.display =
        "none";

    }
  );

  page.style.display =
    "";

  main.scrollTop = 0;

  document
    .querySelectorAll(
      ".bottom-nav .nav-item"
    )
    .forEach(
      item => {

        item.classList.remove(
          "active"
        );

      }
    );

  const button =
    document.getElementById(
      "roundBoardNavButton"
    );

  if (button) {

    button.classList.add(
      "active"
    );

  }

  loadRoundBoard();
}


/* =====================================================
   HIDE ROUND BOARD WHEN ANOTHER PAGE IS SELECTED
   ===================================================== */

function setupOtherNavigation() {

  const buttons =
    document.querySelectorAll(
      ".bottom-nav .nav-item"
    );

  buttons.forEach(
    button => {

      if (
        button.id ===
        "roundBoardNavButton"
      ) {
        return;
      }

      button.addEventListener(
        "click",
        () => {

          const page =
            document.getElementById(
              "roundBoard"
            );

          if (page) {

            page.style.display =
              "none";

          }

        }
      );

    }
  );
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

    .round-board-page {
      width:100%;
      box-sizing:border-box;
    }

    .round-board-card {
      border:1px solid rgba(255,255,255,.08);
      background:rgba(18,28,44,.9);
      border-radius:20px;
      padding:18px;
      margin-bottom:20px;
      box-shadow:0 12px 35px rgba(0,0,0,.18);
    }

    .round-board-message {
      margin-top:14px;
      padding:14px;
      border-radius:14px;
      background:rgba(255,255,255,.035);
      color:#9aa7ba;
      font-size:13px;
      line-height:1.55;
    }

    .round-board-count {
      margin-top:16px;
      margin-bottom:10px;
      color:#8e9aad;
      font-size:12px;
      font-weight:700;
    }

    .round-board-list {
      display:grid;
      gap:9px;
    }

    .round-board-player {
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:12px;
      padding:13px;
      border-radius:15px;
      background:#0c1422;
      border:1px solid rgba(255,255,255,.06);
    }

    .round-board-player-name {
      font-size:14px;
      font-weight:800;
    }

    .round-board-status {
      margin-top:4px;
      font-size:10px;
      font-weight:900;
      text-transform:uppercase;
    }

    .round-board-team {
      text-align:right;
      font-size:14px;
      font-weight:900;
    }

    .round-board-fixture {
      margin-top:3px;
      text-align:right;
      color:#7f8ca0;
      font-size:10px;
    }

    .round-board-section-title {
      margin-top:22px;
      margin-bottom:10px;
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
      padding:8px 11px;
      border-radius:999px;
      background:rgba(239,68,68,.09);
      border:1px solid rgba(239,68,68,.18);
      color:#fca5a5;
      font-size:11px;
      font-weight:800;
    }

    .round-board-auto {
      color:#fcd34d;
    }

    .round-board-eliminated-status {
      color:#fca5a5;
    }

    .round-board-alive {
      color:#86efac;
    }

    @media (max-width:600px) {

      .round-board-player {
        align-items:flex-start;
      }

      .round-board-team {
        max-width:150px;
      }

    }

  `;

  document.head.appendChild(style);
}


/* =====================================================
   LOAD ROUND BOARD DATA
   ===================================================== */

async function loadRoundBoard() {

  if (
    roundBoardState.loading
  ) {
    return;
  }

  if (
    !window.lmsAuthReady
  ) {
    return;
  }

  const ready =
    await window.lmsAuthReady;

  if (!ready) {
    return;
  }

  roundBoardState.loading =
    true;

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

    if (
      !playerData?.success
    ) {
      return;
    }


    const round =
      playerData.current_round;

    if (
      !round?.id
    ) {
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

    if (
      !boardData?.success
    ) {
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

    const message =
      document.getElementById(
        "roundBoardMessage"
      );

    if (message) {

      message.textContent =
        "The round board could not be loaded.";

    }

  } finally {

    roundBoardState.loading =
      false;

  }
}


/* =====================================================
   RENDER
   ===================================================== */

function renderRoundBoard() {

  const page =
    document.getElementById(
      "roundBoard"
    );

  const data =
    roundBoardState.data;

  if (!page || !data) {
    return;
  }

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
     HIDDEN
     =================================================== */

  if (!data.revealed) {

    if (message) {

      message.innerHTML = `

        <strong>
          Selections are still hidden
        </strong>

        <br><br>

        ${Number(
          counts.selected || 0
        )}
        of
        ${Number(
          counts.players || 0
        )}
        players have selected.

        <br><br>

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
     REVEALED
     =================================================== */

  else {

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


    if (message) {

      message.innerHTML = `

        <strong>
          Selections revealed
        </strong>

        <br><br>

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
                  selection.player_status ||
                  ""
                ).toLowerCase();

              const type =
                String(
                  selection.selection_type ||
                  "normal"
                ).toLowerCase();

              let statusText = "";

              let statusClass =
                "round-board-alive";


              if (
                type ===
                "automatic"
              ) {

                statusText =
                  "AUTOMATIC";

                statusClass =
                  "round-board-auto";

              } else if (
                status ===
                "eliminated"
              ) {

                statusText =
                  "ELIMINATED";

                statusClass =
                  "round-board-eliminated-status";

              }


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


  if (
    !eliminatedPlayers.length
  ) {

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
   START
   ===================================================== */

function startRoundBoard() {

  createRoundBoardPage();

  createRoundBoardNav();

  setupOtherNavigation();

  /*
   * Give the existing app a moment to finish
   * its normal startup before loading the board.
   */

  setTimeout(
    loadRoundBoard,
    1000
  );

  /*
   * Refresh the board every 30 seconds.
   */

  setInterval(
    loadRoundBoard,
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
