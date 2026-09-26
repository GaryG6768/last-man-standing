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


    .round-board-elimination-reason {
      margin-top:3px;

      color:#fca5a5;

      font-size:10px;

      line-height:1.35;
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
   * The main LMS app has already
   * authenticated the player.
   *
   * Do NOT wait for lmsAuthReady.
   */

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

      message.innerHTML = `

        <div
          class="round-board-error"
        >

          Player login could not be found.

          <br><br>

          Please return to Home and
          reopen Round Board.

        </div>

      `;

    }

    return;

  }


  roundBoardState.loading =
    true;


  if (message) {

    message.textContent =
      "Loading round...";

  }


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

/*
 * SAFE LOCAL TEST MODE
 *
 * This does NOT change Supabase or the live competition.
 * It only changes what this page displays when the URL contains:
 * ?roundboardtest=eliminated
 */


  if (!data) {

    return;

  }


  const round =
    data.round || {};


  const counts =
    data.counts || {};

  const selectedCount =
    Number(
      counts.selected_players ??
      counts.players_selected ??
      counts.selected ??
      counts.submitted_players ??
      counts.players_with_selection ??
      0
    ) || 0;

  const playerCount =
    Number(
      counts.players ??
      counts.total_players ??
      data.total_players ??
      data.player_count ??
      0
    ) || 0;


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

        ${selectedCount}
        of
        ${playerCount}
        players have selected.

        <br><br>

        Everyone's selections will
        appear after the deadline.

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
                    "alive"
                  )
                    .toLowerCase();


                const type =
                  String(
                    selection.selection_type ||
                    "normal"
                  )
                    .toLowerCase();


                const isEliminated =
                  status ===
                  "eliminated";


                let statusText =
                  isEliminated
                    ? "ELIMINATED"
                    : "ALIVE";


                let statusClass =
                  isEliminated
                    ? "round-board-eliminated-status"
                    : "round-board-alive";


                const automatic =
                  type ===
                  "automatic";


                const eliminationReason =
                  selection.elimination_reason ||
                  selection.eliminated_reason ||
                  selection.reason ||
                  selection.status_reason ||
                  "";


                const reasonText =
                  String(
                    eliminationReason
                  )
                    .trim();


                if (
                  automatic &&
                  !isEliminated
                ) {

                  statusText =
                    "ALIVE • AUTOMATIC";

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


                      <div
                        class="round-board-status ${statusClass}"
                      >

                        ${statusText}

                      </div>


                      ${
                        isEliminated &&
                        reasonText
                          ? `

                            <div
                              class="round-board-elimination-reason"
                            >

                              ${roundBoardEsc(
                                reasonText
                              )}

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
            player => {

              const reason =
                player.elimination_reason ||
                player.eliminated_reason ||
                player.reason ||
                player.status_reason ||
                "";


              return `

                <span
                  class="round-board-eliminated-player"
                  title="${roundBoardEsc(
                    reason
                  )}"
                >

                  ${roundBoardEsc(
                    player.player_name ||
                    "Unknown player"
                  )}

                </span>

              `;

            }
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
   * Attach navigation.
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


/* =====================================================
   PUBLIC ELIMINATION HISTORY
   ===================================================== */

(function(){

  function eliminationEsc(value){
    return String(value ?? "")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }


  function eliminationDate(value){

    if(!value){
      return "";
    }

    const d = new Date(value);

    if(Number.isNaN(d.getTime())){
      return "";
    }

    return d.toLocaleDateString(
      "en-GB",
      {
        day:"numeric",
        month:"short",
        year:"numeric"
      }
    );
  }


  function createEliminationsPage(){

    let page =
      document.getElementById(
        "publicEliminationsPage"
      );

    if(page){
      return page;
    }


    page =
      document.createElement("div");

    page.id =
      "publicEliminationsPage";


    page.style.display =
      "none";

    page.style.position =
      "fixed";

    page.style.left =
      "0";

    page.style.right =
      "0";

    page.style.top =
      "0";

    page.style.bottom =
      "78px";

    page.style.zIndex =
      "9998";

    page.style.overflowY =
      "auto";

    page.style.background =
      "#0b1220";

    page.style.padding =
      "18px";

    page.style.boxSizing =
      "border-box";


    page.innerHTML = `

      <div style="
        max-width:700px;
        margin:0 auto;
      ">

        <div style="
          margin-bottom:18px;
        ">

          <div style="
            font-size:12px;
            letter-spacing:1.5px;
            opacity:.55;
            font-weight:800;
          ">
            COMPETITION HISTORY
          </div>

          <div style="
            font-size:28px;
            font-weight:900;
            margin-top:4px;
          ">
            Eliminated Players
          </div>

          <div style="
            margin-top:7px;
            opacity:.65;
            line-height:1.5;
          ">
            See who was eliminated in each round
            and when it happened.
          </div>

        </div>


        <div id="publicEliminationsContent">

          <div class="empty-state">
            Loading elimination history...
          </div>

        </div>

      </div>

    `;


    document.body.appendChild(page);

    return page;

  }


  function hideEliminations(){

    const page =
      document.getElementById(
        "publicEliminationsPage"
      );

    if(page){
      page.style.display =
        "none";
    }

  }


  function showEliminations(){

    const page =
      createEliminationsPage();


    page.style.display =
      "block";


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


    const button =
      document.getElementById(
        "eliminationsNavButton"
      );

    if(button){
      button.classList.add(
        "active"
      );
    }


    loadPublicEliminations();

  }


  async function loadPublicEliminations(){

    const page =
      createEliminationsPage();


    const content =
      document.getElementById(
        "publicEliminationsContent"
      );


    content.innerHTML = `

      <div class="empty-state">
        Loading elimination history...
      </div>

    `;


    const playerCode =
      (
        localStorage.getItem(
          "lms_player_code"
        ) || ""
      )
        .trim()
        .toUpperCase();


    if(!playerCode){

      content.innerHTML = `

        <div class="empty-state">

          Please return to Home
          and log in again.

        </div>

      `;

      return;

    }


    try{

      const raw =
        await roundBoardRpc(
          "get_lms_elimination_history",
          {
            p_player_code:
              playerCode
          }
        );


      const rows =
        Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
            ? raw.data
            : [];


      if(!rows.length){

        content.innerHTML = `

          <div style="
            padding:25px;
            text-align:center;
            opacity:.7;
          ">

            <div style="
              font-size:36px;
              margin-bottom:12px;
            ">
              🏆
            </div>

            No players have been
            eliminated yet.

          </div>

        `;

        return;

      }


      /* -----------------------------------------
         GROUP BY GAME ROUND
         ----------------------------------------- */

      const groups = {};


      rows.forEach(row => {

        const round =
          Number(
            row.game_round_number ??
            row.round_number ??
            0
          );


        if(!groups[round]){
          groups[round] = [];
        }


        groups[round].push(row);

      });


      const roundNumbers =
        Object.keys(groups)
          .map(Number)
          .sort(
            (a,b) => b-a
          );


      let html = "";


      roundNumbers.forEach(roundNumber => {

        const players =
          groups[roundNumber];


        html += `

          <section style="
            margin-bottom:18px;
            border:1px solid
              rgba(255,255,255,.08);
            border-radius:20px;
            overflow:hidden;
            background:
              rgba(255,255,255,.035);
          ">

            <div style="
              padding:17px 18px;
              background:
                rgba(255,255,255,.045);
              border-bottom:1px solid
                rgba(255,255,255,.07);
            ">

              <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:10px;
              ">

                <div style="
                  font-size:21px;
                  font-weight:900;
                ">
                  Round ${roundNumber}
                </div>

                <div style="
                  font-size:13px;
                  font-weight:800;
                  opacity:.65;
                ">
                  ${players.length}
                  eliminated
                </div>

              </div>

            </div>


            <div style="
              padding:8px 14px;
            ">

        `;


        players.forEach(row => {

          const playerName =
            row.player_name ||
            row.name ||
            "Unknown player";


          const team =
            row.team_name ||
            row.automatic_team ||
            row.selected_team ||
            "";


          const fixture =
            row.fixture ||
            "";


          const reason =
            row.reason ||
            row.elimination_reason ||
            row.eliminated_reason ||
            "";


          const eventDate =
            eliminationDate(
              row.event_time ||
              row.eliminated_at ||
              row.created_at
            );


          let reasonText =
            reason;


          if(!reasonText){

            const result =
              String(
                row.result || ""
              ).toLowerCase();


            if(result === "loss"){
              reasonText =
                "Selected team lost";
            }
            else if(result === "draw"){
              reasonText =
                "Selected team drew";
            }
            else{
              reasonText =
                "Eliminated";
            }

          }


          html += `

            <div style="
              padding:15px 4px;
              border-bottom:1px solid
                rgba(255,255,255,.06);
            ">

              <div style="
                display:flex;
                justify-content:space-between;
                gap:12px;
                align-items:flex-start;
              ">

                <div style="
                  font-size:17px;
                  font-weight:900;
                ">
                  ${eliminationEsc(
                    playerName
                  )}
                </div>

                <div style="
                  color:#fca5a5;
                  font-size:11px;
                  font-weight:900;
                  white-space:nowrap;
                ">
                  ELIMINATED
                </div>

              </div>


              ${
                team
                  ? `
                    <div style="
                      margin-top:7px;
                      font-weight:700;
                    ">
                      Team:
                      ${eliminationEsc(team)}
                    </div>
                  `
                  : ""
              }


              ${
                fixture
                  ? `
                    <div style="
                      margin-top:5px;
                      font-size:13px;
                      opacity:.65;
                    ">
                      ${eliminationEsc(
                        fixture
                      )}
                    </div>
                  `
                  : ""
              }


              ${
                reasonText
                  ? `
                    <div style="
                      margin-top:7px;
                      font-size:13px;
                      opacity:.75;
                    ">
                      ${eliminationEsc(
                        reasonText
                      )}
                    </div>
                  `
                  : ""
              }


              ${
                eventDate
                  ? `
                    <div style="
                      margin-top:7px;
                      font-size:12px;
                      opacity:.5;
                    ">
                      Eliminated:
                      ${eliminationEsc(
                        eventDate
                      )}
                    </div>
                  `
                  : ""
              }

            </div>

          `;

        });


        html += `

            </div>

          </section>

        `;

      });


      content.innerHTML =
        html;


    }catch(error){

      console.error(
        "Elimination history error",
        error
      );


      content.innerHTML = `

        <div class="empty-state">

          Could not load the
          elimination history.

          <br><br>

          ${eliminationEsc(
            error?.message ||
            "Please try again."
          )}

        </div>

      `;

    }

  }


  function createEliminationsButton(){

    const nav =
      document.querySelector(
        ".bottom-nav"
      );


    if(!nav){
      return;
    }


    if(
      document.getElementById(
        "eliminationsNavButton"
      )
    ){
      return;
    }


    const button =
      document.createElement(
        "button"
      );


    button.id =
      "eliminationsNavButton";

    button.className =
      "nav-item";


    button.innerHTML = `

      <span>
        ☠
      </span>

      <small>
        Eliminated
      </small>

    `;


    nav.appendChild(button);


    button.addEventListener(
      "click",
      function(event){

        event.preventDefault();
        event.stopPropagation();

        showEliminations();

      },
      true
    );

  }


  function setupEliminationNavigation(){

    createEliminationsPage();

    createEliminationsButton();


    /*
     * Hide the elimination page whenever
     * another navigation button is pressed.
     */

    document.addEventListener(
      "click",
      function(event){

        const button =
          event.target.closest(
            ".bottom-nav .nav-item"
          );


        if(!button){
          return;
        }


        if(
          button.id ===
          "eliminationsNavButton"
        ){
          return;
        }


        hideEliminations();

      },
      false
    );

  }


  function startPublicEliminations(){

    setupEliminationNavigation();

  }


  if(
    document.readyState ===
    "loading"
  ){

    document.addEventListener(
      "DOMContentLoaded",
      startPublicEliminations
    );

  }else{

    startPublicEliminations();

  }

})();


/* =====================================================
   COLLAPSIBLE PUBLIC ELIMINATION ROUNDS
   ===================================================== */

(function(){

  function setupCollapsibleEliminations(){

    const content =
      document.getElementById(
        "publicEliminationsContent"
      );

    if(!content){
      return;
    }


    const sections =
      content.querySelectorAll(
        "section"
      );

    if(!sections.length){
      return;
    }


    sections.forEach(
      function(section, index){

        const header =
          section.children[0];

        const body =
          section.children[1];

        if(!header || !body){
          return;
        }


        if(
          header.dataset
            .collapsibleReady === "1"
        ){
          return;
        }


        header.dataset
          .collapsibleReady = "1";


        header.style.cursor =
          "pointer";

        header.style.userSelect =
          "none";


        const row =
          header.querySelector(
            "div"
          );

        if(!row){
          return;
        }


        const title =
          row.children[0];

        const count =
          row.children[1];


        const arrow =
          document.createElement(
            "span"
          );

        arrow.style.marginLeft =
          "8px";

        arrow.style.fontSize =
          "12px";

        arrow.style.opacity =
          ".65";


        if(title){

          title.appendChild(
            arrow
          );

        }


        /*
         * Latest round stays open.
         * Older rounds start closed.
         */
        const open = false
          index === 0;


        body.style.display =
          open
            ? "block"
            : "none";


        arrow.textContent =
          open
            ? "▼"
            : "▶";


        header.addEventListener(
          "click",
          function(){

            const isOpen =
              body.style.display !==
              "none";


            body.style.display =
              isOpen
                ? "none"
                : "block";


            arrow.textContent =
              isOpen
                ? "▶"
                : "▼";

          }
        );

      }
    );

  }


  /*
   * The elimination page is loaded
   * dynamically, so watch for its
   * contents being created.
   */
  function startCollapsibleWatcher(){

    const observer =
      new MutationObserver(
        function(){

          setupCollapsibleEliminations();

        }
      );


    observer.observe(
      document.body,
      {
        childList:true,
        subtree:true
      }
    );


    setupCollapsibleEliminations();

  }


  if(
    document.readyState ===
    "loading"
  ){

    document.addEventListener(
      "DOMContentLoaded",
      startCollapsibleWatcher
    );

  }
  else{

    startCollapsibleWatcher();

  }

})();
