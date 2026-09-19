const SUPABASE_URL = "https://tkhykusvmsceleflynok.supabase.co";
const SUPABASE_KEY = "sb_publishable_PufAjZIn-i94mT5If1htBw_IKKLuz4B";
const PLAYER_CODE = "GARY";

const state = {
  data: null,
  selectionTeamId: null,
  deadline: null
};

const $ = (id) => document.getElementById(id);

async function callRpc(name, body) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(
      (data && (data.message || data.error || data.hint)) ||
      `Supabase RPC error ${response.status}`
    );
  }

  return data;
}

function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

function money(value) {
  const n = Number(value);
  return Number.isFinite(n) ? `£${n}` : "£5";
}

function formatDate(value) {
  if (!value) return "";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return "";

  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function normaliseDashboard(raw) {
  const data = first(raw) || {};

  return {
    success: data.success !== false,
    player: data.player || {},
    competition: data.competition || {},
    current_round: data.current_round || data.round || {},
    selection: data.selection || null,
    used_teams: data.used_teams || [],
    fixtures: data.fixtures || []
  };
}

function usedTeamIds() {
  return new Set(
    (state.data?.used_teams || []).map(
      t => t.team_id || t.id
    )
  );
}

function renderDashboard() {
  const d = state.data;

  if (!d) return;

  const player = d.player || {};
  const competition = d.competition || {};
  const round = d.current_round || {};

  $("playerName").textContent =
    player.name || PLAYER_CODE;

  $("roundNumber").textContent =
    round.round_number
      ? `Round ${round.round_number}`
      : "Waiting";

  const statusText =
    round.status === "open"
      ? "Choose your team"
      : round.status === "locked"
      ? "Selections locked"
      : round.status === "in_progress"
      ? "Round in progress"
      : round.status === "completed"
      ? "Round completed"
      : "Waiting to start";

  const heroStatus =
    document.querySelector(".hero-status");

  if (heroStatus) {
    heroStatus.textContent = statusText;
  }

  const badge =
    document.querySelector(".badge");

  if (badge) {
    const s =
      String(player.status || "alive").toUpperCase();

    badge.textContent = s;

    badge.className =
      "badge " +
      (s === "ALIVE" ? "alive" : "");
  }

  const stats =
    document.querySelectorAll(
      ".stat-grid strong"
    );

  if (stats.length >= 3) {
    stats[0].textContent =
      (d.used_teams || []).length;

    stats[1].textContent =
      player.missed_selection_count ?? 0;

    stats[2].textContent =
      money(competition.entry_fee);
  }

  state.deadline =
    round.selection_deadline || null;

  state.selectionTeamId =
    d.selection?.team_id || null;

  $("selectionTitle").textContent =
    d.selection?.team_name
      ? d.selection.team_name
      : "Choose your team";

  $("lockPill").textContent =
    round.status === "open"
      ? "OPEN"
      : String(
          round.status || "WAITING"
        ).toUpperCase();

  renderFixtures();

  const hint =
    $("selectionHint");

  if (hint) {
    if (d.selection?.team_name) {
      hint.textContent =
        `Your current selection is ${d.selection.team_name}. You can change it until the deadline.`;
    } else {
      hint.textContent =
        "Choose one Premier League team to win its game.";
    }
  }
}

function renderFixtures() {
  const el = $("fixtures");

  const fixtures =
    state.data?.fixtures || [];

  const used =
    usedTeamIds();

  if (!fixtures.length) {
    el.innerHTML =
      '<div class="empty-state">No fixtures are available for the current round yet.</div>';

    $("confirmBtn").disabled = true;

    return;
  }

  el.innerHTML =
    fixtures.map((f) => {

      const homeId =
        f.home_team_id ||
        f.home_id;

      const awayId =
        f.away_team_id ||
        f.away_id;

      const home =
        f.home ||
        f.home_name ||
        "Home";

      const away =
        f.away ||
        f.away_name ||
        "Away";

      const kickoff =
        formatDate(
          f.kickoff_time
        );

      const fixtureStatus =
        f.status || "scheduled";

      const teamButton =
        (id, name) => {

          const usedAlready =
            used.has(id) &&
            id !== state.selectionTeamId;

          const selected =
            state.selectionTeamId === id;

          const disabled =
            usedAlready ||
            fixtureStatus !== "scheduled";

          return `
            <button
              class="pick-btn ${selected ? "selected" : ""}"
              data-team-id="${id || ""}"
              ${disabled ? "disabled" : ""}
            >
              ${
                selected
                  ? "SELECTED"
                  : usedAlready
                  ? "USED"
                  : "PICK"
              } ${name}
            </button>
          `;
        };

      return `
        <div class="fixture">

          <div class="fixture-main">

            <div class="fixture-teams">
              ${home} v ${away}
            </div>

            <div class="fixture-time">
              ${kickoff}
            </div>

          </div>

          <div
            style="
              display:flex;
              gap:8px;
              flex-wrap:wrap;
              margin-top:10px
            "
          >

            ${teamButton(homeId, home)}

            ${teamButton(awayId, away)}

          </div>

        </div>
      `;

    }).join("");

  document
    .querySelectorAll(
      ".pick-btn[data-team-id]"
    )
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          state.selectionTeamId =
            btn.dataset.teamId;

          const selectedFixture =
            fixtures.find(f =>
              String(
                f.home_team_id ||
                f.home_id
              ) ===
                String(
                  state.selectionTeamId
                ) ||

              String(
                f.away_team_id ||
                f.away_id
              ) ===
                String(
                  state.selectionTeamId
                )
            );

          const teamName =
            selectedFixture &&

            (
              String(
                selectedFixture.home_team_id ||
                selectedFixture.home_id
              ) ===
                String(
                  state.selectionTeamId
                )

                ?

              selectedFixture.home ||
              selectedFixture.home_name

                :

              selectedFixture.away ||
              selectedFixture.away_name
            );

          $("selectionTitle").textContent =
            teamName ||
            "Team selected";

          $("confirmBtn").disabled =
            false;

          renderFixtures();

        }
      );

    });

  $("confirmBtn").disabled =
    !state.selectionTeamId;
}

async function saveSelection() {

  if (!state.selectionTeamId) {
    return;
  }

  const round =
    state.data?.current_round;

  if (!round?.id) {

    alert(
      "There is no open round yet."
    );

    return;
  }

  const btn =
    $("confirmBtn");

  btn.disabled = true;
  btn.textContent = "Saving...";

  try {

    const result =
      await callRpc(
        "make_selection",
        {
          p_round_id: round.id,
          p_team_id:
            state.selectionTeamId
        }
      );

    if (result?.success === false) {
      throw new Error(
        result.message ||
        "Selection was not saved."
      );
    }

    $("selectionHint").textContent =
      result?.message ||
      "Selection saved successfully.";

    btn.textContent =
      "Selection saved";

    await loadPlayer();

  } catch (error) {

    console.error(error);

    btn.disabled = false;

    btn.textContent =
      "Confirm selection";

    $("selectionHint").textContent =
      "The database connection is working, but player selection security still needs to be connected. No selection was changed.";
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
      normaliseDashboard(raw);

    if (!data.player?.id) {

      $("playerName").textContent =
        PLAYER_CODE;

      $("selectionTitle").textContent =
        "Player not registered";

      $("selectionHint").textContent =
        `The app connected to Supabase successfully, but player code ${PLAYER_CODE} is not registered yet.`;

      $("fixtures").innerHTML =
        '<div class="empty-state">Add the GARY test player in the Supabase admin area, then refresh this page.</div>';

      $("confirmBtn").disabled =
        true;

      return;
    }

    state.data =
      data;

    renderDashboard();

  } catch (error) {

    console.error(error);

    $("selectionTitle").textContent =
      "Database connection error";

    $("selectionHint").textContent =
      "The app could not load the Last Man Standing player data. Check the Supabase RPC and player code.";

    $("fixtures").innerHTML =
      '<div class="empty-state">Unable to load competition data.</div>';

    $("confirmBtn").disabled =
      true;
  }
}

function updateCountdown() {

  const el =
    $("countdown");

  if (!state.deadline) {

    el.textContent =
      "--:--:--";

    return;
  }

  const diff =
    new Date(
      state.deadline
    ).getTime() -
    Date.now();

  if (diff <= 0) {

    el.textContent =
      "LOCKED";

    $("lockPill").textContent =
      "LOCKED";

    $("confirmBtn").disabled =
      true;

    return;
  }

  const h =
    Math.floor(
      diff / 3600000
    );

  const m =
    Math.floor(
      diff / 60000
    ) % 60;

  const s =
    Math.floor(
      diff / 1000
    ) % 60;

  el.textContent =
    [
      h,
      m,
      s
    ]
      .map(
        v =>
          String(v)
            .padStart(2, "0")
      )
      .join(":");
}

$("confirmBtn")
  .addEventListener(
    "click",
    saveSelection
  );

loadPlayer();

setInterval(
  updateCountdown,
  1000
);
