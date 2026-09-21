/* =====================================================
   LAST MAN STANDING — ROUND BOARD
   ===================================================== */

"use strict";


/* =====================================================
   SUPABASE
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
   ESCAPE HTML
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
   CREATE ROUND BOARD PAGE
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
    document.querySelector(
      "main"
    );


  if (!main) {

    return;

  }


  const page =
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


  main.appendChild(
    page
  );


  addRoundBoardStyles();

}


/* =====================================================
   ROUND BOARD NAVIGATION
   IMPORTANT:
   The button already exists in index.html.
   We must attach the click handler to it.
   ===================================================== */

function createRoundBoardNav() {

  const nav =
    document.querySelector(
      ".bottom-nav"
    );


  if (!nav) {

    return;

  }


  const existingButton =
    document.getElementById(
      "roundBoardNavButton"
    );


  /*
   * THE BUTTON ALREADY EXISTS
   */

  if (existingButton) {

    if (
      !existingButton.dataset
        .roundBoardReady
    ) {

      existingButton.addEventListener(
        "click",
        showRoundBoardPage
      );


      existingButton.dataset
        .roundBoardReady =
          "true";

    }


    return;

  }


  /*
   * FALLBACK:
   * Create the button if it
   * doesn't exist.
   */

  const button =
    document.createElement(
      "button"
    );


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


  button.dataset
    .roundBoardReady =
      "true";


  const adminButton =
    document.getElementById(
      "adminNavButton"
    );


  nav.insertBefore(
    button,
    adminButton || null
  );

}


/* =====================================================
   SHOW ROUND BOARD
   ===================================================== */

async function showRoundBoardPage() {

  const main =
    document.querySelector(
      "main"
    );


  const page =
    document.getElementById(
      "roundBoard"
    );


  if (!main || !page) {

    return;

  }


  /*
   * Hide every main section.
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
    "";


  /*
   * Scroll back to top.
   */

  main.scrollTop =
    0;


  /*
   * Highlight Round Board.
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
   HIDE ROUND BOARD WHEN OTHER NAV IS USED
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


      /*
       * Prevent duplicate listeners.
       */

      if (
        button.dataset
          .roundBoardHideReady
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


      button.dataset
        .roundBoardHideReady =
          "true";

    }
 
