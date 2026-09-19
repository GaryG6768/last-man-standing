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
  activeView: "home",
  isLoading: false,
  hasLoadedOnce: false,
  pendingSelection: false,
  lastLoadError: null,
  refreshing: false
};

const $ = (id) =>
  document.getElementById(id);


/* =====================================================
   PROFESSIONAL MOBILE REFRESH
   ===================================================== */

function setupRefreshStyle() {

  if (
    document.getElementById(
      "professionalRefreshStyle"
    )
  ) {
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "professionalRefreshStyle";

  style.textContent = `
    html,
    body {
      overscroll-behavior-y: contain;
    }

    #refreshIndicator {
      position: fixed;
      top: -54px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #18243a;
      border: 1px solid rgba(255,255,255,.10);
      box-shadow: 0 8px 24px rgba(0,0,0,.30);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition:
        top .22s ease,
        opacity .22s ease;
      pointer-events: none;
    }

    #refreshIndicator.show {
      top: 12px;
      opacity: 1;
    }

    #refreshIndicator.spinning span {
      animation:
        refreshSpin .8s linear infinite;
    }

    #refreshIndicator span {
      display: block;
      width: 19px;
      height: 19px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,.25);
      border-top-color: #60a5fa;
    }

    @keyframes refreshSpin {
      to {
        transform: rotate(360deg);
      }
    }

    #refreshMessage {
      position: fixed;
      top: 64px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9998;
      padding: 7px 14px;
      border-radius: 20px;
      background: rgba(11,18,32,.94);
      border: 1px solid rgba(255,255,255,.08);
      color: #aebbd0;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: .03em;
      opacity: 0;
      pointer-events: none;
      transition: opacity .2s ease;
    }

    #refreshMessage.show {
      opacity: 1;
    }
  `;

  document.head.appendChild(style);

  const indicator =
    document.createElement("div");

  indicator.id =
    "refreshIndicator";

  indicator.innerHTML =
    "<span></span>";

  document.body.appendChild(
    indicator
  );

  const message =
    document.createElement("div");

  message.id =
    "refreshMessage";

  message.textContent =
    "Refreshing…";

  document.body.appendChild(
    message
  );
}

function showRefreshIndicator() {

  setupRefreshStyle();

  const indicator =
    $("refreshIndicator");

  const message =
    $("refreshMessage");

  if (indicator) {
    indicator.classList.add(
      "show",
      "spinning"
    );
  }

  if (message) {
    message.classList.add(
      "show"
    );
  }
}

function hideRefreshIndicator() {

  const indicator =
    $("refreshIndicator");

  const message =
    $("refreshMessage");

  if (indicator) {
    indicator.classList.remove(
      "spinning"
    );

    setTimeout(() => {
      indicator.classList.remove(
        "show"
      );
    }, 180);
  }

  if (message) {
    message.classList.remove(
      "show"
    );
  }
}


/* =====================================================
   SUPABASE
   ===================================================== */

async function callRpc(
  name,
  body
) {

  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/${name}`,
      {
        method: "POST",

        headers: {
          apikey:
            SUPABASE_KEY,

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


/* =====================================================
   DATA
   ===================================================== */

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
      data.selection || null,

    used_teams:
      data.used_teams || [],

    fixtures:
      data.fixtures || []
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
    round.status ===
      "open" &&
    !deadlinePassed()
  );
}


/* =====================================================
   DASHBOARD
   ===================================================== */

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
      "badge
