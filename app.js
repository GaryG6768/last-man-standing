const SUPABASE_URL =
  "https://tkhykusvmsceleflynok.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_PufAjZIn-i94mT5If1htBw_IKKLuz4B";

const PLAYER_CODE = "GARY";

const state = {
  data: null,
  selectionTeamId: null,
  deadline: null
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

    throw new Error(
      (
        data &&
        (
          data.message ||
          data.error ||
          data.hint
        )
      ) ||
      `Supabase RPC error ${response.status}`
    );

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


  const used =
    state.data?.used_teams ||
    [];


  used.forEach(
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


    if (selectedFixture) {

      if (
        String(
          getFixtureHomeId(
            selectedFixture
          )
        ) ===
        String(
          state.selectionTeamId
        )
      ) {

        selectedTeamName =
          getFixtureHomeName(
            selectedFixture
          );

      } else {

        selectedTeamName =
          getFixtureAwayName(
            selectedFixture
          );

      }

    }

  }


  $("selectionTitle")
    .textContent =
    selectedTeamName ||
    "Choose your team";


  $("lockPill")
    .textContent =
    round.status ===
    "open"
      ? "OPEN"
      : String(
          round.status ||
          "WAITING"
        ).toUpperCase();


  renderFixtures();


  const hint =
    $("selectionHint");


  if (hint) {

    if (
      selectedTeamName
    ) {

      hint.textContent =
        `Your current selection is ${selectedTeamName}. You can change it until the deadline.`;

    } else {

      hint.textContent =
        "Choose one Premier League team to win its game.";

    }

  }

}


function renderFixtures() {

  const el =
    $("fixtures");


  const fixtures =
    state.data?.fixtures ||
    [];


  const used =
    getUsedTeams();


  const round =
    state.data?.current_round ||
    {};


  const deadlinePassed =
    state.deadline &&
    new Date(
      state.deadline
    ).getTime() <=
      Date.now();


  const roundIsOpen =
    round.status ===
      "open" &&
    !deadlinePassed;


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

            const usedAlready =
              isTeamUsed(
                id,
                name,
                used
              ) &&
              String(id) !==
                String(
                  state.selectionTeamId
                );


            const selected =
              String(
                state.selectionTeamId
              ) ===
              String(id);


            const unavailable =
              fixtureStatus !==
              "scheduled";


            const disabled =
              usedAlready ||
              unavailable ||
              !roundIsOpen;


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
              !roundIsOpen
            ) {

              label =
                "LOCKED";

            }


            const usedStyle =
              usedAlready
                ? `
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


            let teamName =
              "Team selected";


            if (
              selectedFixture
            ) {

              if (
                String(
                  getFixtureHomeId(
                    selectedFixture
                  )
                ) ===
                String(
                  state.selectionTeamId
                )
              ) {

                teamName =
                  getFixtureHomeName(
                    selectedFixture
                  );

              } else {

                teamName =
                  getFixtureAwayName(
                    selectedFixture
                  );

              }

            }


            $("selectionTitle")
              .textContent =
              teamName;


            $("selectionHint")
              .textContent =
              `Your current selection is ${teamName}. You can change it until the deadline.`;


            $("confirmBtn")
              .disabled =
              false;


            renderFixtures();

          }
        );

      }
    );


  $("confirmBtn")
    .disabled =
    !state.selectionTeamId ||
    !roundIsOpen;

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

    alert(
      "There is no open round."
    );

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


    $("selectionHint")
      .textContent =
      result?.message ||
      "Selection saved successfully.";


    await loadPlayer();


  } catch (error) {

    console.error(
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

  try
