const SUPABASE_URL =
  "https://tkhykusvmsceleflynok.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_PufAjZIn-i94mT5If1htBw_IKKLuz4B";

const PLAYER_CODE = "GARY";

const playerName =
  document.getElementById("playerName");

const roundNumber =
  document.getElementById("roundNumber");

const heroStatus =
  document.querySelector(".hero-status");

const selectionTitle =
  document.getElementById("selectionTitle");

const selectionHint =
  document.getElementById("selectionHint");

const fixtures =
  document.getElementById("fixtures");

const lockPill =
  document.getElementById("lockPill");

const countdown =
  document.getElementById("countdown");

const confirmButton =
  document.getElementById("confirmBtn");


/*
  First prove that this version
  of app.js has loaded.
*/

playerName.textContent =
  "CONNECTING...";

roundNumber.textContent =
  "TEST";

heroStatus.textContent =
  "JavaScript is running";

selectionTitle.textContent =
  "Connecting to Supabase...";

selectionHint.textContent =
  "Testing the database connection.";

fixtures.innerHTML =
  '<div class="empty-state">Connecting...</div>';


async function testConnection() {

  try {

    const response =
      await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/get_lms_player_data`,
        {
          method: "POST",

          headers: {
            apikey: SUPABASE_KEY,
            Authorization:
              `Bearer ${SUPABASE_KEY}`,
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              p_player_code:
                PLAYER_CODE
            })
        }
      );


    const responseText =
      await response.text();


    if (!response.ok) {

      throw new Error(
        `HTTP ${response.status}: ${responseText}`
      );

    }


    let data;

    try {

      data =
        JSON.parse(
          responseText
        );

    } catch (error) {

      throw new Error(
        "Supabase returned something that was not valid JSON: " +
        responseText
      );

    }


    console.log(
      "SUPABASE RESPONSE:",
      data
    );


    /*
      Database connection worked.
    */

    playerName.textContent =
      data?.player?.name ||
      "GARY NOT FOUND";

    roundNumber.textContent =
      data?.current_round?.round_number
        ? `Round ${data.current_round.round_number}`
        : "NO ROUND";

    heroStatus.textContent =
      data?.current_round?.status ||
      "NO ROUND STATUS";

    selectionTitle.textContent =
      "DATABASE CONNECTED";

    selectionHint.textContent =
      "Supabase responded successfully.";

    lockPill.textContent =
      "CONNECTED";


    const fixtureData =
      data?.fixtures || [];


    if (!fixtureData.length) {

      fixtures.innerHTML =
        '<div class="empty-state">Database connected, but no fixtures were returned.</div>';

    } else {

      fixtures.innerHTML =
        fixtureData
          .map(
            (fixture) => {

              const home =
                fixture.home_name ||
                fixture.home_team ||
                "Home";

              const away =
                fixture.away_name ||
                fixture.away_team ||
                "Away";

              return `
                <div class="fixture">

                  <div class="fixture-main">

                    <div class="fixture-teams">
                      ${home} v ${away}
                    </div>

                    <div class="fixture-time">
                      ${fixture.kickoff_time || ""}
                    </div>

                  </div>

                </div>
              `;

            }
          )
          .join("");

    }


    confirmButton.disabled =
      true;


  } catch (error) {

    console.error(
      "LAST MAN STANDING ERROR:",
      error
    );


    /*
      Put the EXACT error
      onto the phone screen.
    */

    playerName.textContent =
      "ERROR";

    roundNumber.textContent =
      "CONNECTION FAILED";

    heroStatus.textContent =
      "JavaScript is running";

    selectionTitle.textContent =
      "Supabase error";

    lockPill.textContent =
      "ERROR";

    fixtures.innerHTML =
      `
        <div
          class="empty-state"
          style="
            color:#ff8b8b;
            text-align:left;
            word-break:break-word;
          "
        >
          ${String(
            error.message ||
            error
          )}
        </div>
      `;

    selectionHint.textContent =
      "Send me a screenshot of the red error above.";

    confirmButton.disabled =
      true;

  }

}


testConnection();
