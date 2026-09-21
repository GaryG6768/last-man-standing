/* =====================================================
   LAST MAN STANDING — ROUND BOARD
   ===================================================== */

"use strict";


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

async function roundBoardRpc(
  name,
  body
) {

  let token =
    ROUND_BOARD_KEY;

  try {

    if (window.lmsSupabase) {

      const {
        data
      } =
        await window.lmsSupabase
          .auth
          .getSession();

      if (
        data?.session?.access_token
      ) {

        token =
          data.session.access_token;

      }

    }

  } catch (error) {

    console.warn(
      "Round Board session error",
      error
    );

  }


  const response =
    await fetch(
      `${ROUND_BOARD_URL}/rest/v1/rpc/${name}`,
      {
        method: "POST",

        headers: {
          apikey:
            ROUND_BOARD_KEY,

          Authorization:
            `Bearer ${token}`,

          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify(
            body || {}
          )
      }
    );


  const responseText =
    await response.text();


  let data;

  try {

    data =
      responseText
        ? JSON.parse(
            responseText
          )
        : null;

  } catch {

    data =
      responseText;

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
   HTML ESCAPE
   ===================================================== */

function roundBoardEsc(
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
   CREATE ROUND BOARD
   ===================================================== */

function createRoundBoardPage() {

  let page =
    document.getElementById(
      "roundBoard"
    );


  if (page) {

    return page;

  }


  const main =
    document.querySelector(
      "main"
    );


  if (!main) {

    console.error(
      "Round Board: main element not found"
    );

    return null;

  }


  page =
    document.createElement(
      "section"
    );


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
            Round Board
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


  main.appendChild(
    page
  );


  addRoundBoardStyles();


  return page;

}


/* =====================================================
   SHOW ROUND BOARD
   ===================================================== */

async function showRoundBoardPage() {

  console.log(
    "ROUND BOARD BUTTON PRESSED"
  );


  /*
   * IMPORTANT:
   * Always create/check the page here.
   */

  const page =
    createRoundBoardPage();


  const main =
    document.querySelector(
      "main"
    );


  if (!page || !main) {

    console.error(
      "Round Board page could not be created"
    );

    return;

  }


  /*
   * Hide every other page.
   */

  Array.from(
    main.children
  ).forEach(
    child => {

      child.style.display =
        "none";

    }
  );


  /*
   * Show Round Board.
   */

  page.style.display =
    "block";


  /*
   * Scroll to top.
   */

  main.scrollTop =
    0;


  /*
   * Highlight correct button.
   */

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


  /*
   * Load the board.
   */

  await loadRoundBoard();

}


/* =====================================================
   NAVIGATION
   ===================================================== */

function setupRoundBoardNavigation() {

  /*
   * Use event delegation.
   *
   * This means it doesn't matter whether
   * the button was already in index.html or
   * created later by another script.
   */

  if (
    window.roundBoardNavigationReady
  ) {

    return;

  }


  window.roundBoardNavigationReady =
    true;


  document.addEventListener(
    "click",
    function(event) {

      const button =
        event.target.closest(
          "#roundBoardNavButton"
        );


      if (!button) {

        return;

      }


      event.preventDefault();

      event.stopPropagation();


      showRoundBoardPage();

    },
    true
  );

}


/* =====================================================
   OTHER NAVIGATION
   ===================================================== */

function setupRoundBoardOtherNavigation() {

  document.addEventListener(
    "click",
    function(event) {

      const button =
        event.target.closest(
          ".bottom-nav .nav-item"
        );


      if (!button) {

        return;

      }


      if (
        button.id ===
        "roundBoardNavButton"
      ) {

        return;

      }


      const page =
        document.getElementById(
          "roundBoard"
        );


      if (page) {

        page.style.display =
          "none";

      }

    },
    false
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
    document.createElement(
      "style"
    );


  style.id =
    "roundBoardStyles";


  style.textContent = `

    .round-board-page {
      width:100%;
      box-sizing:border-box;
    }


    .round-board-card {
      border:1px solid
        rgba(255,255,255,.08);

      background:
        rgba(18,28,44,.9);

      border-radius:20px;

      padding:18px;

      margin-bottom:20px;

      box-shadow:
        0 12px 35px
        rgba(0,0,0,.18);
    }


    .round-board-message {
      margin-top:14px;

      padding:14px;

      border-radius:14px;

      background:
        rgba(255,255,255,.035);

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

      justify-content:
        space-between;

      align-items:center;

      gap:12px;

      padding:13px;

      border-radius:15px;

      background:#0c1422;

      border:
        1px solid
        rgba(255,255,255,.06);
    }


    .round-board-player-name {
      font-size:14px;

      font-weight:800;
    }


    .round-board-status {
      margin-top:4px;

      font-size:10px;

      font-weight:900;

      text-transform:
        uppercase;
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

      background:
        rgba(239,68,68,.09);

      border:
        1px solid
        rgba(239,68,68,.18);

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


    .round-board-error {
      color:#fca5a5;

      text-align:center;

      line-height:1.5;
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


  document.head.appendChild(
    style
  );

}


/* =====================================================
   LOAD DATA
   ===================================================== */

async function loadRoundBoard() {

  if (
    roundBoardState.loading
  ) {

    return;

  }


  const message =
    document.getElementById(
      "roundBoardMessage"
    );


  /*
   * Wait for secure authentication.
   */

  if (
    !window.lmsAuthReady
  ) {

    if (message) {

      message.textContent =
        "Waiting for secure login...";

    }

    return;

  }


  const ready =
    await window.lmsAuthReady;


  if (!ready) {

    return;

  }


  const playerCode =
    (
      localStorage.getItem(
        "lms_player_code"
      ) || ""
    )
      .trim()
      .toUpperCase();


  if (!playerCode) {

    if (message) {

      message.textContent =
        "Player login could not be found.";

    }

    return;

  }


  roundBoardState.loading =
    true;


  try {

    /*
     * Get current player.
     */

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

      throw new Error(
        playerData?.message ||
        "Player data could not be loaded."
      );

    }


    const round =
      playerData.current_round;


    if (!round?.id) {

      if (message) {

        message.innerHTML = `

          <strong>
            No active round
          </strong>

          <br><br>

          There is currently no
          active Last Man Standing
          round.

        `;

      }

      return;

    }


    /*
     * Get Round Board data.
     */

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

      throw new Error(
        boardData?.message ||
        "Round board could not be loaded."
      );

    }


    roundBoardState.roundId =
      round.id;


    roundBoardState.data =
      boardData;


    renderRoundBoard();

  }

  catch (error) {

    console.error(
      "Round Board error:",
      error
    );


    if (message) {

      message.innerHTML = `

        <div
          class="round-board-error"
        >

          <strong>
            Round Board could not be loaded
          </strong>

          <br><br>

          ${roundBoardEsc(
            error?.message ||
            "Please try again."
          )}

        </div>

      `;

    }

  }

  finally {

    roundBoardState.loading =
      false;

  }

}


/* =====================================================
   RENDER
   ===================================================== */

function renderRoundBoard() {

  const data =
    roundBoardState.data;


  if (!data) {

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


  /*
   * TITLE
   */

  if (title) {

    const number =
      round.game_round_number ||
      round.round_number ||
      round.round ||
      "";


    title.textContent =
      number
        ? `Round ${number}`
        : "Round Board";

  }


  /*
   * HIDDEN
   */

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

        Everyone's selections will
        appear when all predictions
        are in or the deadline passes.

      `;

    }


    if (content) {

      content.innerHTML =
        "";

    }


    if (eliminated) {

      eliminated.innerHTML =
        "";

    }


    return;

  }


  /*
   * REVEALED
   */

  let reason =
    "The selections are now visible.";


  if (
    data.reveal_reason ===
    "all_predictions_in"
  ) {

    reason =
      "Everyone has made their selection.";

  }


  if (
    data.reveal_reason ===
    "deadline_passed"
  ) {

    reason =
      "The selection deadline has passed.";

  }


  if (
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

      ${roundBoardEsc(
        reason
      )}

    `;

  }


  const selections =
    Array.isArray(
      data.selections
    )
      ? data.selections
      : [];


  if (!selections.length) {

    if (content) {

      content.innerHTML = `

        <div class="empty-state">

          No selections have
          been recorded.

        </div>

      `;

    }

  }

  else {

    if (content) {

      content.innerHTML = `

        <div class="round-board-count">

          ${selections.length}
          selections recorded

        </div>


        <div class="round-board-list">

          ${selections
            .map(
              selection => {

                const status =
                  String(
                    selection.player_status ||
                    ""
                  )
                    .toLowerCase();


                const type =
                  String(
                    selection.selection_type ||
                    "normal"
                  )
                    .toLowerCase();


                let statusText =
                  "";


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

                }


                if (
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
                          selection.player_name ||
                          "Unknown player"
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


                      ${
                        selection.fixture
                          ? `

                            <div
                              class="round-board-fixture"
                            >

                              ${roundBoardEsc(
                                selection.fixture
                              )}

                            </div>

                          `
                          : ""
                      }

                    </div>

                  </div>

                `;

              }
            )
            .join("")}

        </div>

      `;

    }

  }


  /*
   * ELIMINATED PLAYERS
   */

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


      <div
        class="round-board-message"
      >

        No players have been
        eliminated.

      </div>

    `;

  }

  else {

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
                  player.player_name ||
                  "Unknown player"
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

  console.log(
    "Round Board script started"
  );


  /*
   * Create the page immediately.
   */

  createRoundBoardPage();


  /*
   * Attach navigation using event
   * delegation.
   */

  setupRoundBoardNavigation();


  setupRoundBoardOtherNavigation();


  /*
   * Initial load.
   */

  setTimeout(
    function() {

      loadRoundBoard();

    },
    1500
  );


  /*
   * Refresh every 30 seconds.
   */

  setInterval(
    function() {

      loadRoundBoard();

    },
    30000
  );

}


/* =====================================================
   START SCRIPT
   ===================================================== */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    startRoundBoard
  );

}

else {

  startRoundBoard();

}
