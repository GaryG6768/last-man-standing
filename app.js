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
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/${name}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  );

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(
      (data &&
        (data.message ||
          data.error ||
          data.hint)) ||
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
  const n = Number(value);

  return Number.isFinite(n)
    ? `£${n}`
    : "£5";
}

function formatDate(value) {
  if (!value) return "";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) {
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
  const data = first(raw) || {};

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
      data.selection || null,

    used_teams:
      data.used_teams || [],

    fixtures:
      data.fixtures || []
  };
}

/*
  Used teams can come back from Supabase
  in different formats.

  This function supports:

  { team_id: "...", team_name: "Arsenal" }

  or

  { id: "...", name: "Arsenal" }

  or simply:

  "Arsenal"
*/

function getUsedTeams() {
  const ids = new Set();
  const names = new Set();

  const used =
    state.data?.used_teams || [];

  used.forEach((team) => {
    if (!team) return;

    if (typeof team === "string") {
      names.add(
        team.trim().toLowerCase()
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
      ids.add(String(id));
    }

    if (name) {
      names.add(
        String(name)
          .trim()
          .toLowerCase()
      );
    }
  });

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
    used.ids.has(String(teamId))
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

function getFixtureHomeId(fixture) {
  return (
    fixture.home_team_id ||
    fixture.home_id ||
    fixture.homeTeamId ||
    null
  );
}

function getFixtureAwayId(fixture) {
  return (
    fixture.away_team_id ||
    fixture.away_id ||
    fixture.awayTeamId ||
    null
  );
}

function getFixtureHomeName(fixture) {
  return (
    fixture.home_name ||
    fixture.home_team ||
    fixture.home ||
    fixture.homeTeam ||
    "Home"
  );
}

function getFixtureAwayName(fixture) {
  return (
    fixture.away_name ||
    fixture.away_team ||
    fixture.away ||
    fixture.awayTeam ||
    "Away"
  );
}

function renderDashboard() {
  const d = state.data;

  if (!d) return;

  const player =
    d.player || {};

  const competition =
    d.competition || {};

  const round =
    d.current_round || {};

  $("playerName").textContent =
    player.name ||
    PLAYER_CODE;

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
    const s =
      String(
        player.status ||
          "alive"
      ).toUpperCase();

    badge.textContent = s;

    badge.className =
      "badge " +
      (s === "ALIVE"
        ? "alive"
        : "");
  }

  const stats =
    document.querySelectorAll(
      ".stat-grid strong"
    );

  if (stats.length >= 3) {
    stats[0].textContent =
      (
        d.used_teams || []
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

  /*
    Work out the selected team's
    name from the fixtures.
  */

  let selectedTeamName =
    d.selection?.team_name ||
    null;

  if (
    !selectedTeamName &&
    state.selectionTeamId
  ) {
    const selectedFixture =
      (
        d.fixtures || []
      ).find((fixture) => {
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
      });

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

  $("selectionTitle").textContent =
    selectedTeamName ||
    "Choose your team";

  $("lockPill").textContent =
    round.status === "open"
      ? "OPEN"
      : String(
          round.status ||
            "WAITING"
        ).toUpperCase();

  renderFixtures();

  const hint =
    $("selectionHint");

  if (hint) {
    if (selectedTeamName) {
     
