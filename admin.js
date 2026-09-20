/* =====================================================
   LAST MAN STANDING — ADMIN LOGIN
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
        Authorization:
          `Bearer ${ADMIN_SUPABASE_KEY}`,
        "Content-Type":
          "application/json"
      },

      body: JSON.stringify(body)
    }
  );

  const text =
    await response.text();

  let data = null;

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
   ADMIN VIEW
   ===================================================== */

function createAdminView() {

  if (
    document.getElementById(
      "adminView"
    )
  ) {
    return;
  }


  const view =
    document.createElement(
      "section"
    );

  view.id =
    "adminView";

  view.className =
    "rules-card";

  view.style.display =
    "none";


  view.innerHTML = `

    <div class="section-title">

      <div>

        <span class="muted">
          ADMINISTRATION
        </span>

        <h2 id="adminTitle">
          Admin Login
        </h2>

      </div>

    </div>


    <div id="adminLoginPanel">

      <p class="hint">

        Enter your 6-digit Admin PIN
        to access the management area.

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


      <p
        class="hint"
        id="adminMessage"
      >
        Admin access is protected.
      </p>

    </div>


    <div
      id="adminDashboard"
      style="display:none;"
    >

      <div
        style="
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:18px;
          padding:20px;
        "
      >

        <div
          style="
            font-size:12px;
            text-transform:uppercase;
            letter-spacing:.08em;
            opacity:.65;
          "
        >
          ADMINISTRATOR
        </div>


        <h2
          style="
            margin:6px 0 0;
          "
        >
          Admin Dashboard
        </h2>


        <p class="hint">

          Admin access confirmed.

          <br><br>

          This is the secure starting point
          for the competition management area.

        </p>

      </div>


      <button
        id="adminLogoutButton"
        class="primary-btn"
        style="margin-top:14px;"
      >
        Log out
      </button>

    </div>

  `;


  const shell =
    document.querySelector(
      ".app-shell"
    );

  const nav =
    document.querySelector(
      ".bottom-nav"
    );


  if (
    shell &&
    nav
  ) {

    shell.insertBefore(
      view,
      nav
    );

  }


  setupAdminLogin();
}


/* =====================================================
   LOGIN
   ===================================================== */

function setupAdminLogin() {

  const pin =
    document.getElementById(
      "adminPin"
    );

  const login =
    document.getElementById(
      "adminLoginButton"
    );

  const message =
    document.getElementById(
      "adminMessage"
    );

  const logout =
    document.getElementById(
      "adminLogoutButton"
    );


  if (
    !pin ||
    !login
  ) {
    return;
  }


  login.addEventListener(
    "click",
    adminLogin
  );


  pin.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Enter"
      ) {

        adminLogin();

      }

    }
  );


  if (logout) {

    logout.addEventListener(
      "click",
      adminLogout
    );

  }
}


/* =====================================================
   LOGIN FUNCTION
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
          p_pin:
            value
        }
      );


    const result =
      Array.isArray(raw)
        ? raw[0]
        : raw;


    if (
      !result ||
      !result.success ||
      !result.session_token
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


  } catch (
    error
  ) {

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
   ADMIN DASHBOARD
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


  if (
    loginPanel
  ) {

    loginPanel.style.display =
      loggedIn
        ? "none"
        : "";

  }


  if (
    dashboard
  ) {

    dashboard.style.display =
      loggedIn
        ? ""
        : "none";

  }


  if (
    title
  ) {

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


  showAdminDashboard();

}


/* =====================================================
   ADMIN NAVIGATION
   ===================================================== */

function setupAdminNavigation() {

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
    document.createElement(
      "button"
    );


  button.id =
    "adminNavButton";

  button.className =
    "nav-item";


  button.innerHTML = `

    <span>
      ⚙
    </span>

    <small>
      Admin
    </small>

  `;


  nav.appendChild(
    button
  );


  button.addEventListener(
    "click",
    () => {

      document
        .querySelectorAll(
          ".nav-item"
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


      const main =
        document.querySelector(
          "main"
        );


      if (main) {

        Array.from(
          main.children
        )
        .forEach(
          child => {

            child.style.display =
              "none";

          }
        );

      }


      const history =
        document.getElementById(
          "historyView"
        );


      if (history) {

        history.style.display =
          "none";

      }


      const adminView =
        document.getElementById(
          "adminView"
        );


      if (adminView) {

        adminView.style.display =
          "";

      }


      showAdminDashboard();


      window.scrollTo({
        top:0,
        behavior:"smooth"
      });

    }
  );


  /* Return to normal app views
     when Home, History or Rules
     is selected. */

  document
    .querySelectorAll(
      ".nav-item"
    )
    .forEach(
      item => {

        if (
          item ===
          button
        ) {
          return;
        }


        item.addEventListener(
          "click",
          () => {

            const adminView =
              document.getElementById(
                "adminView"
              );


            if (
              adminView
            ) {

              adminView.style.display =
                "none";

            }

          }
        );

      }
    );

}


/* =====================================================
   START ADMIN
   ===================================================== */

function startAdmin() {

  createAdminView();

  setupAdminNavigation();

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
