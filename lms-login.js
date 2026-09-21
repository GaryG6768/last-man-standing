(function () {
  "use strict";

  const SUPABASE_URL =
    "https://tkhykusvmsceleflynok.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_PufAjZIn-i94mT5If1htBw_IKKLuz4B";

  const CODE_KEY = "lms_player_code";

  let supabaseClient = null;


  function getSavedCode() {
    return (
      localStorage.getItem(CODE_KEY) || ""
    )
      .trim()
      .toUpperCase();
  }


  function saveCode(code) {
    localStorage.setItem(
      CODE_KEY,
      String(code)
        .trim()
        .toUpperCase()
    );
  }


  function clearCode() {
    localStorage.removeItem(CODE_KEY);
  }


  function showLogin() {

    const overlay =
      document.getElementById(
        "lms-login-overlay"
      );

    if (overlay) {
      overlay.style.display = "flex";
    }
  }


  function hideLogin() {

    const overlay =
      document.getElementById(
        "lms-login-overlay"
      );

    if (overlay) {
      overlay.style.display = "none";
    }
  }


  function setLoginMessage(
    message,
    isError = false
  ) {

    const el =
      document.getElementById(
        "lms-login-error"
      );

    if (!el) {
      return;
    }

    el.textContent =
      message || "";

    el.style.color =
      isError
        ? "#dc2626"
        : "#374151";
  }


  function createLoginScreen() {

    if (
      document.getElementById(
        "lms-login-overlay"
      )
    ) {
      return;
    }

    const overlay =
      document.createElement(
        "div"
      );

    overlay.id =
      "lms-login-overlay";

    overlay.style.cssText =
      `
      position:fixed;
      inset:0;
      z-index:999999;
      background:#f4f7fb;
      display:none;
      align-items:center;
      justify-content:center;
      padding:20px;
      box-sizing:border-box;
      `;

    overlay.innerHTML = `

      <div
        style="
          width:100%;
          max-width:420px;
          background:white;
          border-radius:20px;
          padding:30px 24px;
          box-sizing:border-box;
          box-shadow:0 10px 35px rgba(0,0,0,.15);
          text-align:center;
        "
      >

        <div
          style="
            font-size:30px;
            font-weight:800;
            margin-bottom:8px;
            color:#111827;
          "
        >
          LAST MAN STANDING
        </div>

        <div
          style="
            font-size:16px;
            color:#6b7280;
            margin-bottom:22px;
          "
        >
          Secure player login
        </div>

        <button
          id="lms-passkey-button"
          style="
            width:100%;
            padding:16px;
            border:0;
            border-radius:12px;
            background:#111827;
            color:white;
            font-size:17px;
            font-weight:800;
            cursor:pointer;
          "
        >
          USE FACE ID / FINGERPRINT
        </button>

        <div
          style="
            margin:18px 0;
            color:#9ca3af;
            font-size:13px;
            font-weight:700;
          "
        >
          FIRST-TIME SETUP
        </div>

        <input
          id="lms-login-code"
          type="text"
          inputmode="text"
          autocomplete="off"
          autocapitalize="characters"
          maxlength="6"
          placeholder="LMS001"
          style="
            width:100%;
            box-sizing:border-box;
            padding:16px;
            font-size:24px;
            font-weight:700;
            text-align:center;
            letter-spacing:3px;
            border:2px solid #d1d5db;
            border-radius:12px;
            outline:none;
            text-transform:uppercase;
          "
        />

        <button
          id="lms-login-button"
          style="
            width:100%;
            margin-top:12px;
            padding:16px;
            border:0;
            border-radius:12px;
            background:#16a34a;
            color:white;
            font-size:17px;
            font-weight:800;
            cursor:pointer;
          "
        >
          SET UP SECURE LOGIN
        </button>

        <div
          id="lms-login-error"
          style="
            min-height:24px;
            margin-top:14px;
            color:#dc2626;
            font-size:14px;
            font-weight:600;
          "
        ></div>

      </div>
    `;

    document.body.appendChild(
      overlay
    );


    document
      .getElementById(
        "lms-login-button"
      )
      .addEventListener(
        "click",
        firstTimeSetup
      );


    document
      .getElementById(
        "lms-passkey-button"
      )
      .addEventListener(
        "click",
        signInWithPasskey
      );


    document
      .getElementById(
        "lms-login-code"
      )
      .addEventListener(
        "keydown",
        function (event) {

          if (
            event.key === "Enter"
          ) {
            firstTimeSetup();
          }

        }
      );
  }


  async function callRpc(
    name,
    body
  ) {

    const {
      data,
      error
    } =
      await supabaseClient.rpc(
        name,
        body || {}
      );

    if (error) {
      throw error;
    }

    return data;
  }


  async function getIdentity() {

    const result =
      await callRpc(
        "get_lms_my_identity"
      );

    if (
      !result ||
      result.success !== true
    ) {
      return null;
    }

    return result;
  }


  async function establishBridgeSession(
    code
  ) {

    const response =
      await fetch(
        SUPABASE_URL +
        "/functions/v1/lms-auth-bridge",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            apikey:
              SUPABASE_KEY
          },

          body: JSON.stringify({
            player_code: code
          })
        }
      );


    const data =
      await response
        .json()
        .catch(
          () => ({})
        );


    if (
      !response.ok ||
      !data.success
    ) {

      const error =
        new Error(
          data.message ||
          "Secure login setup failed."
        );

      error.code =
        data.code || "";

      throw error;
    }


    const {
      error
    } =
      await supabaseClient.auth.setSession(
        {
          access_token:
            data.access_token,

          refresh_token:
            data.refresh_token
        }
      );


    if (error) {
      throw error;
    }


    return data;
  }


  async function registerPasskey() {

    if (
      !supabaseClient?.auth
        ?.registerPasskey
    ) {

      throw new Error(
        "Passkey support is not available in this browser."
      );
    }


    const {
      data,
      error
    } =
      await supabaseClient.auth
        .registerPasskey();


    if (error) {
      throw error;
    }


    return data;
  }


  async function firstTimeSetup() {

    const input =
      document.getElementById(
        "lms-login-code"
      );

    const button =
      document.getElementById(
        "lms-login-button"
      );


    const code =
      (
        input?.value || ""
      )
        .trim()
        .toUpperCase();


    if (
      !/^LMS\d{3}$/.test(
        code
      )
    ) {

      setLoginMessage(
        "Please enter your player code, for example LMS001.",
        true
      );

      return;
    }


    button.disabled =
      true;

    button.textContent =
      "VERIFYING...";

    setLoginMessage(
      "Checking your player code..."
    );


    try {

      await establishBridgeSession(
        code
      );


      button.textContent =
        "SETTING UP...";


      setLoginMessage(
        "Now create your secure Face ID / fingerprint login."
      );


      await registerPasskey();


      const {
        error
      } =
      await supabaseClient.rpc(
        "mark_lms_passkey_enrolled"
      );


      if (error) {
        throw error;
      }


      saveCode(code);


      button.textContent =
        "READY";


      setLoginMessage(
        "Secure login created. Opening your game..."
      );


      hideLogin();


      if (
        window.lmsSwitchPlayer
      ) {

        await window.lmsSwitchPlayer(
          code
        );

      } else {

        window.location.reload();

      }


    } catch (err) {

      console.error(
        "LMS secure setup error:",
        err
      );


      button.disabled =
        false;

      button.textContent =
        "SET UP SECURE LOGIN";


      if (
        err?.code ===
        "PASSKEY_REQUIRED"
      ) {

        setLoginMessage(
          "This player is already secured. Use the Face ID / fingerprint button above.",
          true
        );

      } else {

        setLoginMessage(
          err?.message ||
          "Secure login setup failed.",
          true
        );
      }
    }
  }


  async function signInWithPasskey() {

    const button =
      document.getElementById(
        "lms-passkey-button"
      );


    if (button) {

      button.disabled =
        true;

      button.textContent =
        "VERIFYING...";
    }


    setLoginMessage(
      "Use Face ID, fingerprint or your device passkey..."
    );


    try {

      const {
        error
      } =
      await supabaseClient.auth
        .signInWithPasskey();


      if (error) {
        throw error;
      }


      const identity =
        await getIdentity();


      if (!identity) {

        throw new Error(
          "Your passkey is not linked to a Last Man Standing player."
        );
      }


      saveCode(
        identity.player_code
      );


      setLoginMessage(
        "Login successful. Opening your game..."
      );


      /*
       * IMPORTANT:
       *
       * Do NOT reload the page here.
       *
       * The authenticated Supabase session is
       * already active. Tell the existing app
       * to load this player immediately.
       */

      hideLogin();


      if (
        window.lmsSwitchPlayer
      ) {

        await window.lmsSwitchPlayer(
          identity.player_code
        );

      } else {

        window.location.reload();

      }


    } catch (err) {

      console.error(
        "LMS passkey sign-in error:",
        err
      );


      if (button) {

        button.disabled =
          false;

        button.textContent =
          "USE FACE ID / FINGERPRINT";
      }


      setLoginMessage(
        err?.message ||
        "Passkey login failed. Please try again.",
        true
      );
    }
  }


  async function restoreExistingSession() {

    const {
      data
    } =
      await supabaseClient.auth
        .getSession();


    if (
      !data?.session
    ) {
      return null;
    }


    const identity =
      await getIdentity();


    if (!identity) {

      await supabaseClient.auth
        .signOut({
          scope: "local"
        });

      return null;
    }


    saveCode(
      identity.player_code
    );


    return identity;
  }


  function addSecurityButton() {

    if (
      document.getElementById(
        "lms-security-button"
      )
    ) {
      return;
    }


    const playerCard =
      document.querySelector(
        ".player-card"
      ) ||
      document.querySelector(
        ".player-info"
      ) ||
      document.querySelector(
        "#app"
      );


    if (!playerCard) {
      return;
    }


    const button =
      document.createElement(
        "button"
      );


    button.id =
      "lms-security-button";


    button.textContent =
      "SECURITY & LOGIN";


    button.style.cssText =
      `
      display:block;
      width:100%;
      margin-top:12px;
      padding:12px;
      border:1px solid #d1d5db;
      border-radius:10px;
      background:white;
      color:#374151;
      font-size:14px;
      font-weight:700;
      cursor:pointer;
      `;


    button.addEventListener(
      "click",
      openSecuritySettings
    );


    playerCard.appendChild(
      button
    );
  }


  function openSecuritySettings() {

    if (
      document.getElementById(
        "lms-security-overlay"
      )
    ) {
      return;
    }


    const currentCode =
      getSavedCode();


    const overlay =
      document.createElement(
        "div"
      );


    overlay.id =
      "lms-security-overlay";


    overlay.style.cssText =
      `
      position:fixed;
      inset:0;
      z-index:999998;
      background:rgba(15,23,42,.55);
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
      box-sizing:border-box;
      `;


    overlay.innerHTML = `

      <div
        style="
          width:100%;
          max-width:420px;
          background:white;
          border-radius:20px;
          padding:24px;
          box-sizing:border-box;
          box-shadow:0 10px 35px rgba(0,0,0,.25);
        "
      >

        <div
          style="
            font-size:24px;
            font-weight:900;
            color:#111827;
          "
        >
          Security & Login
        </div>


        <div
          style="
            margin-top:8px;
            color:#6b7280;
            font-size:14px;
            line-height:1.45;
          "
        >
          Your account is protected by your device passkey.
          You can change your personal player code after
          verifying your passkey.
        </div>


        <div
          style="
            margin-top:18px;
            padding:12px;
            border-radius:12px;
            background:#f3f4f6;
            font-weight:800;
            text-align:center;
          "
        >
          Current code:
          ${currentCode || "Unknown"}
        </div>


        <button
          id="lms-verify-security"
          style="
            width:100%;
            margin-top:14px;
            padding:14px;
            border:0;
            border-radius:12px;
            background:#111827;
            color:white;
            font-weight:800;
          "
        >
          VERIFY WITH FACE ID / FINGERPRINT
        </button>


        <div
          id="lms-new-code-area"
          style="
            display:none;
            margin-top:16px;
          "
        >

          <input
            id="lms-new-code"
            maxlength="6"
            inputmode="text"
            autocomplete="off"
            autocapitalize="characters"
            placeholder="New code e.g. LMS051"
            style="
              width:100%;
              box-sizing:border-box;
              padding:14px;
              font-size:20px;
              font-weight:800;
              text-align:center;
              letter-spacing:2px;
              border:2px solid #d1d5db;
              border-radius:12px;
              text-transform:uppercase;
            "
          />


          <button
            id="lms-change-code"
            style="
              width:100%;
              margin-top:10px;
              padding:14px;
              border:0;
              border-radius:12px;
              background:#16a34a;
              color:white;
              font-weight:800;
            "
          >
            CHANGE MY LOGIN CODE
          </button>

        </div>


        <div
          id="lms-security-message"
          style="
            min-height:22px;
            margin-top:12px;
            font-size:13px;
            font-weight:700;
          "
        ></div>


        <button
          id="lms-logout-player"
          style="
            width:100%;
            margin-top:12px;
            padding:14px;
            border:0;
            border-radius:10px;
            background:#dc2626;
            color:white;
            font-weight:800;
          "
        >
          LOG OUT
        </button>


        <button
          id="lms-security-close"
          style="
            width:100%;
            margin-top:8px;
            padding:12px;
            border:1px solid #d1d5db;
            border-radius:10px;
            background:white;
            font-weight:700;
          "
        >
          CLOSE
        </button>

      </div>
    `;


    document.body.appendChild(
      overlay
    );


    document
      .getElementById(
        "lms-security-close"
      )
      .onclick =
      () => overlay.remove();


    document
      .getElementById(
        "lms-logout-player"
      )
      .onclick =
      async function () {

        const confirmed =
          confirm(
            "Are you sure you want to log out?"
          );

        if (!confirmed) {
          return;
        }

        await window.lmsLogoutPlayer();
      };


    document
      .getElementById(
        "lms-verify-security"
      )
      .onclick =
      async function () {

        const verify =
          document.getElementById(
            "lms-verify-security"
          );

        const message =
          document.getElementById(
            "lms-security-message"
          );


        verify.disabled =
          true;

        verify.textContent =
          "VERIFYING...";

        message.textContent =
          "Use your device passkey...";


        try {

          const {
            error
          } =
          await supabaseClient.auth
            .signInWithPasskey();


          if (error) {
            throw error;
          }


          const identity =
            await getIdentity();


          if (!identity) {

            throw new Error(
              "Player account could not be verified."
            );
          }


          saveCode(
            identity.player_code
          );


          verify.textContent =
            "VERIFIED";


          verify.style.background =
            "#16a34a";


          message.textContent =
            "Verified. Loading your game...";

          message.style.color =
            "#166534";


          /*
           * IMPORTANT:
           * Do not reload the page.
           * The authenticated session is already
           * available to app.js.
           */

          if (
            window.lmsSwitchPlayer
          ) {

            await window.lmsSwitchPlayer(
              identity.player_code
            );

          } else {

            window.location.reload();

          }


          setTimeout(
            function () {

              overlay.remove();

            },
            300
          );


        } catch (err) {

          verify.disabled =
            false;

          verify.textContent =
            "VERIFY WITH FACE ID / FINGERPRINT";


          message.textContent =
            err?.message ||
            "Verification failed.";


          message.style.color =
            "#dc2626";
        }
      };


    document
      .getElementById(
        "lms-change-code"
      )
      .onclick =
      async function () {

        const input =
          document.getElementById(
            "lms-new-code"
          );

        const button =
          document.getElementById(
            "lms-change-code"
          );

        const message =
          document.getElementById(
            "lms-security-message"
          );


        const newCode =
          (
            input?.value || ""
          )
            .trim()
            .toUpperCase();


        if (
          !/^LMS\d{3}$/.test(
            newCode
          )
        ) {

          message.textContent =
            "Use a code in the format LMS001.";

          message.style.color =
            "#dc2626";

          return;
        }


        button.disabled =
          true;

        button.textContent =
          "CHANGING...";


        try {

          const {
            data,
            error
          } =
          await supabaseClient.rpc(
            "change_lms_player_code",
            {
              p_new_code:
                newCode
            }
          );


          if (error) {
            throw error;
          }


          if (
            !data?.success
          ) {

            throw new Error(
              data?.message ||
              "Code could not be changed."
            );
          }


          saveCode(
            newCode
          );


          message.textContent =
            "Your login code has been changed.";

          message.style.color =
            "#166534";


          setTimeout(
            async function () {

              overlay.remove();

              if (
                window.lmsSwitchPlayer
              ) {

                await window.lmsSwitchPlayer(
                  newCode
                );

              } else {

                window.location.reload();

              }

            },
            600
          );


        } catch (err) {

          button.disabled =
            false;

          button.textContent =
            "CHANGE MY LOGIN CODE";


          message.textContent =
            err?.message ||
            "Code could not be changed.";


          message.style.color =
            "#dc2626";
        }
      };
  }


  async function initialise() {

    createLoginScreen();


    try {

      const {
        createClient
      } =
      await import(
        "https://esm.sh/@supabase/supabase-js@2.105.4"
      );


      supabaseClient =
        createClient(
          SUPABASE_URL,
          SUPABASE_KEY,
          {
            auth: {

              experimental: {
                passkey: true
              },

              persistSession:
                true,

              autoRefreshToken:
                true,

              detectSessionInUrl:
                false
            }
          }
        );


      window.lmsSupabase =
        supabaseClient;


      const identity =
        await restoreExistingSession();


      const savedCode =
        getSavedCode();


      if (
        identity &&
        identity.passkey_enrolled === true
      ) {

        hideLogin();

        return true;
      }


      if (identity) {

        await supabaseClient.auth.signOut({
          scope: "local"
        });
      }


      showLogin();


      setLoginMessage(
        savedCode
          ? "Use Face ID / fingerprint. If this is your first secure login, enter your player code below."
          : "First, enter your player code to set up secure login."
      );


      return false;


    } catch (err) {

      console.error(
        "LMS authentication startup error:",
        err
      );


      showLogin();


      setLoginMessage(
        "Secure login could not start. Please refresh the app.",
        true
      );


      return false;
    }
  }


  window.lmsAuthReady =
    initialise();


  window.lmsShowLogin =
    function () {

      clearCode();

      if (supabaseClient) {

        supabaseClient.auth
          .signOut({
            scope: "local"
          });
      }

      showLogin();
    };


  window.lmsLogoutPlayer =
    async function () {

      clearCode();

      if (supabaseClient) {

        await supabaseClient.auth
          .signOut({
            scope: "local"
          });
      }


      window.location.href =
        window.location.pathname +
        "?login=" +
        Date.now();
    };


  document.addEventListener(
    "DOMContentLoaded",
    function () {

      setTimeout(
        addSecurityButton,
        1800
      );

    }
  );

})();
