const SUPABASE_URL =
  "https://tkhykusvmsceleflynok.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_PufAjZIn-i94mT5If1htBw_IKKLuz4B";

const PLAYER_CODE = "GARY";

const state = {
  data: null,
  selectionTeamId: null,
  deadline: null,
  history: [],
  activeView: "home"
};

const $ = (id) =>
  document.getElementById(id);


async function callRpc(name, body) {

  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/${name}`,
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
          JSON.stringify(body)
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

    const message =
      (
        data &&
        (
          data.message ||
          data.error ||
          data.hint
        )
      ) ||
      `Supabase RPC error ${response.status}`;

    throw new Error(message);

  }


  return data;

}


function first(value) {

  return Array.isArray(value)
    ? value[0]
    : value;

}


function money(value) {

  const n =
    Number(value);

  return Number.isFinite(n)
    ? `£${n}`
    : "£5";

}


function formatDate(value) {

  if (!value) {
    return "";
  }

  const d =
    new Date(value);

  if (
    Number.isNaN(
      d.getTime()
    )
  ) {
    return "";
  }

  return d.toLocaleString(
    "en-GB",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    }
  );

}


function normaliseDashboard(raw) {

  const data =
    first(raw) || {};

  return {

    success:
      data.success !== false,

    player:
      data.player || {},

    competition:
      data.competition || {},

    current_round:
      data.current_round ||
      data.round ||
      {},

    selection:
      data.selection ||
      null,

    used_teams:
      data.used_teams ||
      [],

    fixtures:
      data.fixtures ||
      []

  };

}


function getUsedTeams() {

  const ids =
    new Set();

  const names =
    new Set();

  (
    state.data?.used_teams ||
    []
  ).forEach(
    (team) => {

      if (!team) {
        return;
      }

      if (
        typeof team ===
        "string"
      ) {

        names.add(
          team
            .trim()
            .toLowerCase()
        );

        return;

      }

      const id =
        team.team_id ||
        team.id;

      const name =
        team.team_name ||
        team.name ||
        team.short_name;

      if (id) {

        ids.add(
          String(id)
        );

      }

      if (name) {

        names.add(
          String(name)
            .trim()
            .toLowerCase()
        );

      }

    }
  );

  return {
    ids,
    names
  };

}


function isTeamUsed(
  teamId,
  teamName,
  used
) {

  if (
    teamId &&
    used.ids.has(
      String(teamId)
    )
  ) {

    return true;

  }

  if (
    teamName &&
    used.names.has(
      String(teamName)
        .trim()
        .toLowerCase()
    )
  ) {

    return true;

  }

  return false;

}


function getFixtureHomeId(
  fixture
) {

  return (
    fixture.home_team_id ||
    fixture.home_id ||
    fixture.homeTeamId ||
    null
  );

}


function getFixtureAwayId(
  fixture
) {

  return (
    fixture.away_team_id ||
    fixture.away_id ||
    fixture.awayTeamId ||
    null
  );

}


function getFixtureHomeName(
  fixture
) {

  return (
    fixture.home_name ||
    fixture.home_team ||
    fixture.home ||
    fixture.homeTeam ||
    "Home"
  );

}


function getFixtureAwayName(
  fixture
) {

  return (
    fixture.away_name ||
    fixture.away_team ||
    fixture.away ||
    fixture.awayTeam ||
    "Away"
  );

}


function getTeamNameFromFixture(
  fixture,
  teamId
) {

  if (!fixture) {
    return "Team selected";
  }

  if (
    String(
      getFixtureHomeId(
        fixture
      )
    ) ===
    String(teamId)
  ) {

    return getFixtureHomeName(
      fixture
    );

  }

  if (
    String(
      getFixtureAwayId(
        fixture
      )
    ) ===
    String(teamId)
  ) {

    return getFixtureAwayName(
      fixture
    );

  }

  return "Team selected";

}


function deadlinePassed() {

  if (!state.deadline) {
    return false;
  }

  const time =
    new Date(
      state.deadline
    ).getTime();

  return (
    Number.isFinite(time) &&
    time <= Date.now()
  );

}


function roundIsOpen() {

  const round =
    state.data?.current_round ||
    {};

  return (
    round.status === "open" &&
    !deadlinePassed()
  );

}


function renderDashboard() {

  const d =
    state.data;

  if (!d) {
    return;
  }

  const player =
    d.player || {};

  const competition =
    d.competition || {};

  const round =
    d.current_round || {};


  $("playerName")
    .textContent =
    player.name ||
    PLAYER_CODE;


  $("roundNumber")
    .textContent =
    round.round_number
      ? `Round ${round.round_number}`
      : "Waiting";


  let statusText =
    "Waiting to start";


  if (
    round.status ===
    "open"
  ) {

    statusText =
      "Choose your team";

  } else if (
    round.status ===
    "locked"
  ) {

    statusText =
      "Selections locked";

  } else if (
    round.status ===
    "in_progress"
  ) {

    statusText =
      "Round in progress";

  } else if (
    round.status ===
    "completed"
  ) {

    statusText =
      "Round completed";

  } else if (
    round.status ===
    "upcoming"
  ) {

    statusText =
      "Waiting to start";

  }


  const heroStatus =
    document.querySelector(
      ".hero-status"
    );


  if (heroStatus) {

    heroStatus.textContent =
      statusText;

  }


  const badge =
    document.querySelector(
      ".badge"
    );


  if (badge) {

    const status =
      String(
        player.status ||
        "alive"
      ).toUpperCase();

    badge.textContent =
      status;

    badge.className =
      "badge " +
      (
        status ===
        "ALIVE"
          ? "alive"
          : ""
      );

  }


  const stats =
    document.querySelectorAll(
      ".stat-grid strong"
    );


  if (
    stats.length >= 3
  ) {

    stats[0].textContent =
      (
        d.used_teams ||
        []
      ).length;

    stats[1].textContent =
      player.missed_selection_count ??
      0;

    stats[2].textContent =
      money(
        competition.entry_fee
      );

  }


  state.deadline =
    round.selection_deadline ||
    null;


  state.selectionTeamId =
    d.selection?.team_id ||
    null;


  let selectedTeamName =
    d.selection?.team_name ||
    null;


  if (
    !selectedTeamName &&
    state.selectionTeamId
  ) {

    const selectedFixture =
      (
        d.fixtures ||
        []
      ).find(
        (fixture) => {

          return (
            String(
              getFixtureHomeId(
                fixture
              )
            ) ===
            String(
              state.selectionTeamId
            ) ||

            String(
              getFixtureAwayId(
                fixture
              )
            ) ===
            String(
              state.selectionTeamId
            )
          );

        }
      );


    selectedTeamName =
      getTeamNameFromFixture(
        selectedFixture,
        state.selectionTeamId
      );

  }


  $("selectionTitle")
    .textContent =
    selectedTeamName ||
    "Choose your team";


  $("lockPill")
    .textContent =
    roundIsOpen()
      ? "OPEN"
      : String(
          round.status ||
          "WAITING"
        ).toUpperCase();


  renderFixtures();


  const hint =
    $("selectionHint");


  if (hint) {

    hint.textContent =
      selectedTeamName

        ? `Your current selection is ${selectedTeamName}. You can change it until the deadline.`

        : "Choose one Premier League team to win its game.";

  }


  updateCountdown();

}


function renderFixtures() {

  const el =
    $("fixtures");

  const fixtures =
    state.data?.fixtures ||
    [];

  const used =
    getUsedTeams();

  const open =
    roundIsOpen();


  if (
    !fixtures.length
  ) {

    el.innerHTML =
      `
        <div class="empty-state">
          No fixtures are available for this round.
        </div>
      `;

    $("confirmBtn")
      .disabled = true;

    return;

  }


  el.innerHTML =
    fixtures
      .map(
        (fixture) => {

          const homeId =
            getFixtureHomeId(
              fixture
            );

          const awayId =
            getFixtureAwayId(
              fixture
            );

          const home =
            getFixtureHomeName(
              fixture
            );

          const away =
            getFixtureAwayName(
              fixture
            );

          const kickoff =
            formatDate(
              fixture.kickoff_time
            );

          const fixtureStatus =
            fixture.status ||
            "scheduled";


          function teamButton(
            id,
            name
          ) {

            const selected =
              state.selectionTeamId &&
              String(
                state.selectionTeamId
              ) ===
              String(id);


            const usedAlready =
              !selected &&
              isTeamUsed(
                id,
                name,
                used
              );


            const unavailable =
              fixtureStatus !==
              "scheduled";


            const disabled =
              usedAlready ||
              unavailable ||
              !open;


            let label =
              "PICK";


            if (selected) {

              label =
                "SELECTED";

            } else if (
              usedAlready
            ) {

              label =
                "USED";

            } else if (
              unavailable
            ) {

              label =
                String(
                  fixtureStatus
                ).toUpperCase();

            } else if (
              !open
            ) {

              label =
                "LOCKED";

            }


            const usedStyle =
              usedAlready

                ?
                `
                  style="
                    background:#3a3f48;
                    border-color:#555b65;
                    color:#8f959e;
                    opacity:1;
                    cursor:not-allowed;
                  "
                `

                : "";


            return `
              <button
                class="pick-btn ${
                  selected
                    ? "selected"
                    : usedAlready
                    ? "used"
                    : ""
                }"
                data-team-id="${
                  id || ""
                }"
                ${
                  disabled
                    ? "disabled"
                    : ""
                }
                ${usedStyle}
              >
                ${label} ${name}
              </button>
            `;

          }


          return `
            <div class="fixture">

              <div
                class="fixture-main"
                style="
                  width:100%;
                "
              >

                <div
                  class="fixture-teams"
                >
                  ${home} v ${away}
                </div>

                <div
                  class="fixture-time"
                >
                  ${kickoff}
                </div>

                <div
                  style="
                    display:flex;
                    gap:8px;
                    flex-wrap:wrap;
                    margin-top:10px;
                  "
                >

                  ${teamButton(
                    homeId,
                    home
                  )}

                  ${teamButton(
                    awayId,
                    away
                  )}

                </div>

              </div>

            </div>
          `;

        }
      )
      .join("");


  document
    .querySelectorAll(
      ".pick-btn[data-team-id]"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            if (
              button.disabled
            ) {
              return;
            }


            state.selectionTeamId =
              button.dataset.teamId;


            const selectedFixture =
              fixtures.find(
                (fixture) => {

                  return (
                    String(
                      getFixtureHomeId(
                        fixture
                      )
                    ) ===
                    String(
                      state.selectionTeamId
                    ) ||

                    String(
                      getFixtureAwayId(
                        fixture
                      )
                    ) ===
                    String(
                      state.selectionTeamId
                    )
                  );

                }
              );


            const teamName =
              getTeamNameFromFixture(
                selectedFixture,
                state.selectionTeamId
              );


            $("selectionTitle")
              .textContent =
              teamName;


            $("selectionHint")
              .textContent =
              `Your current selection is ${teamName}. You can change it until the deadline.`;


            $("confirmBtn")
              .disabled = false;


            $("confirmBtn")
              .textContent =
              "Confirm selection";


            renderFixtures();

          }
        );

      }
    );


  $("confirmBtn")
    .disabled =
    !state.selectionTeamId ||
    !open;

}


async function saveSelection() {

  if (
    !state.selectionTeamId
  ) {

    return;

  }


  const round =
    state.data?.current_round;


  if (!round?.id) {

    $("selectionHint")
      .textContent =
      "There is no open round.";

    return;

  }


  const button =
    $("confirmBtn");


  button.disabled =
    true;


  button.textContent =
    "Saving...";


  try {

    const result =
      await callRpc(
        "make_selection",
        {
          p_player_code:
            PLAYER_CODE,

          p_round_id:
            round.id,

          p_team_id:
            state.selectionTeamId
        }
      );


    if (
      result?.success ===
      false
    ) {

      throw new Error(
        result.message ||
        "Selection was not saved."
      );

    }


    button.textContent =
      "Selection saved";


    button.disabled =
      true;


    $("selectionHint")
      .textContent =
      "Selection saved successfully. You can change it until the deadline.";


  } catch (error) {

    console.error(
      "Selection error:",
      error
    );


    button.disabled =
      false;


    button.textContent =
      "Confirm selection";


    $("selectionHint")
      .textContent =
      error?.message ||
      "Selection could not be saved.";

  }

}


async function loadPlayer() {

  try {

    const raw =
      await callRpc(
        "get_lms_player_data",
        {
          p_player_code:
            PLAYER_CODE
        }
      );


    const data =
      normaliseDashboard(
        raw
      );


    if (
      !data.success
    ) {

      throw new Error(
        "Player data could not be loaded."
      );

    }


    state.data =
      data;


    renderDashboard();


  } catch (error) {

    console.error(
      "Load player error:",
      error
    );


    $("playerName")
      .textContent =
      "Connection error";


    $("roundNumber")
      .textContent =
      "Unable to load";


    const heroStatus =
      document.querySelector(
        ".hero-status"
      );


    if (heroStatus) {

      heroStatus.textContent =
        "Please refresh the app";

    }


    $("selectionTitle")
      .textContent =
      "Unable to load competition";


    $("fixtures")
      .innerHTML =
      `
        <div class="empty-state">
          ${
            error?.message ||
            "Could not connect to the competition."
          }
        </div>
      `;


    $("confirmBtn")
      .disabled =
      true;

  }

}


function updateCountdown() {

  const el =
    $("countdown");


  if (!el) {
    return;
  }


  if (!state.deadline) {

    el.textContent =
      "--:--:--";

    return;

  }


  const end =
    new Date(
      state.deadline
    ).getTime();


  if (
    !Number.isFinite(end)
  ) {

    el.textContent =
      "--:--:--";

    return;

  }


  const remaining =
    Math.max(
      0,
      end - Date.now()
    );


  if (
    remaining === 0
  ) {

    el.textContent =
      "00:00:00";

    return;

  }


  const totalSeconds =
    Math.floor(
      remaining / 1000
    );


  const days =
    Math.floor(
      totalSeconds /
      86400
    );


  const hours =
    Math.floor(
      (
        totalSeconds %
        86400
      ) / 3600
    );


  const minutes =
    Math.floor(
      (
        totalSeconds %
        3600
      ) / 60
    );


  const seconds =
    totalSeconds %
    60;


  if (
    days > 0
  ) {

    el.textContent =
      `${days}d ` +
      `${String(hours).padStart(2, "0")}:` +
      `${String(minutes).padStart(2, "0")}:` +
      `${String(seconds).padStart(2, "0")}`;

  } else {

    el.textContent =
      `${String(hours).padStart(2, "0")}:` +
      `${String(minutes).padStart(2, "0")}:` +
      `${String(seconds).padStart(2, "0")}`;

  }

}


/* =====================================================
   HISTORY
   ===================================================== */

function ensureHistoryView() {

  let historyView =
    document.getElementById(
      "historyView"
    );

  if (historyView) {
    return historyView;
  }


  historyView =
    document.createElement(
      "section"
    );

  historyView.id =
    "historyView";

  historyView.className =
    "rules-card";

  historyView.style.display =
    "none";


  historyView.innerHTML = `
    <div class="section-title">

      <div>

        <span class="muted">
          YOUR JOURNEY
        </span>

        <h2>
          Selection History
        </h2>

      </div>

    </div>

    <div id="historyContent">

      <div class="empty-state">
        Loading your history...
      </div>

    </div>
  `;


  const main =
    document.querySelector(
      "main"
    );


  if (main) {
    main.appendChild(
      historyView
    );
  }


  return historyView;

}


function resultLabel(result) {

  const value =
    String(
      result ||
      "pending"
    ).toLowerCase();


  if (value === "win") {
    return "WIN";
  }

  if (value === "draw") {
    return "DRAW";
  }

  if (value === "loss") {
    return "LOSS";
  }

  if (value === "through") {
    return "THROUGH";
  }

  if (value === "abandoned") {
    return "ABANDONED";
  }

  if (value === "postponed") {
    return "POSTPONED";
  }

  return "PENDING";

}


function resultStyle(result) {

  const value =
    String(
      result ||
      "pending"
    ).toLowerCase();


  if (
    value === "win" ||
    value === "through"
  ) {

    return "color:#86efac;";

  }


  if (
    value === "loss"
  ) {

    return "color:#fca5a5;";

  }


  if (
    value === "draw"
  ) {

    return "color:#fcd34a;";

  }


  return "color:#cbd5e1;";

}


function renderHistory() {

  const view =
    ensureHistoryView();


  const content =
    view.querySelector(
      "#historyContent"
    );


  if (!content) {
    return;
  }


  const history =
    Array.isArray(
      state.history
    )
      ? state.history
      : [];


  if (!history.length) {

    content.innerHTML = `
      <div class="empty-state">
        No completed rounds yet.
      </div>
    `;

    return;

  }


  content.innerHTML =
    history
      .map(
        (item) => {

          const roundNumber =
            item.round_number ||
            "?";

          const teamName =
            item.team_name ||
            "Team";

          const fixture =
            item.fixture ||
            "Fixture";

          const result =
            resultLabel(
              item.result
            );

          const kickoff =
            formatDate(
              item.kickoff_time
            );


          let score = "";


          if (
            item.home_score !== null &&
            item.home_score !== undefined &&
            item.away_score !== null &&
            item.away_score !== undefined
          ) {

            score = `
              <div
                style="
                  font-size:20px;
                  font-weight:800;
                  margin-top:6px;
                "
              >
                ${item.home_score}
                -
                ${item.away_score}
              </div>
            `;

          }


          return `
            <div
              style="
                background:rgba(255,255,255,0.04);
                border:1px solid rgba(255,255,255,0.08);
                border-radius:16px;
                padding:16px;
                margin-bottom:12px;
              "
            >

              <div
                style="
                  display:flex;
                  justify-content:space-between;
                  align-items:center;
                  gap:12px;
                "
              >

                <div>

                  <div
                    style="
                      font-size:12px;
                      text-transform:uppercase;
                      letter-spacing:0.08em;
                      opacity:0.65;
                    "
                  >
                    ROUND ${roundNumber}
                  </div>

                  <div
                    style="
                      font-size:18px;
                      font-weight:800;
                      margin-top:4px;
                    "
                  >
                    ${teamName}
                  </div>

                </div>


                <div
                  style="
                    font-weight:800;
                    font-size:13px;
                    ${resultStyle(
                      item.result
                    )}
                  "
                >
                  ${result}
                </div>

              </div>


              <div
                style="
                  margin-top:12px;
                  font-weight:600;
                "
              >
                ${fixture}
              </div>


              ${score}


              <div
                style="
                  margin-top:8px;
                  font-size:13px;
                  opacity:0.6;
                "
              >
                ${kickoff}
              </div>

            </div>
          `;

        }
      )
      .join("");

}


async function loadHistory() {

  const view =
    ensureHistoryView();


  const content =
    view.querySelector(
      "#historyContent"
    );


  if (content) {

    content.innerHTML = `
      <div class="empty-state">
        Loading your history...
      </div>
    `;

  }


  try {

    const raw =
      await callRpc(
        "get_lms_history",
        {
          p_player_code:
            PLAYER_CODE
        }
      );


    state.history =
      Array.isArray(raw)
        ? raw
        : (
            first(raw) ||
            []
          );


    renderHistory();


  } catch (error) {

    console.error(
      "Load history error:",
      error
    );


    if (content) {

      content.innerHTML = `
        <div class="empty-state">

          Could not load your history.

          <br><br>

          ${
            error?.message ||
            "Please try again."
          }

        </div>
      `;

    }

  }

}


/* =====================================================
   NAVIGATION
   ===================================================== */

function setMainView(view) {

  const main =
    document.querySelector(
      "main"
    );


  if (!main) {
    return;
  }


  const historyView =
    ensureHistoryView();


  const children =
    Array.from(
      main.children
    );


  children.forEach(
    (child) => {

      if (
        child ===
        historyView
      ) {

        return;

      }


      if (
        view ===
        "home"
      ) {

        child.style.display =
          "";

      } else if (
        view ===
        "rules" &&
        child.classList.contains(
          "rules-card"
        )
      ) {

        child.style.display =
          "";

      } else {

        child.style.display =
          "none";

      }

    }
  );


  historyView.style.display =
    view === "history"
      ? ""
      : "none";


  state.activeView =
    view;


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


function setupNavigation() {

  const buttons =
    document.querySelectorAll(
      ".nav-item"
    );


  buttons.forEach(
    (button, index) => {

      button.addEventListener(
        "click",
        async () => {

          buttons.forEach(
            (b) =>
              b.classList.remove(
                "active"
              )
          );


          button.classList.add(
            "active"
          );


          if (
            index === 0
          ) {

            setMainView(
              "home"
            );

          } else if (
            index === 1
          ) {

            setMainView(
              "history"
            );

            await loadHistory();

          } else if (
            index === 2
          ) {

            setMainView(
              "rules"
            );

          }

        }
      );

    }
  );

}


/* =====================================================
   START APP
   ===================================================== */

function startApp() {

  const confirmBtn =
    $("confirmBtn");


  if (confirmBtn) {

    confirmBtn.addEventListener(
      "click",
      saveSelection
    );

  }


  setupNavigation();


  loadPlayer();


  setInterval(
    updateCountdown,
    1000
  );


  setInterval(
    loadPlayer,
    30000
  );

}


if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    startApp
  );

} else {

  startApp();

}
