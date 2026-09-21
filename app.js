const SUPABASE_URL = "https://tkhykusvmsceleflynok.supabase.co";
const SUPABASE_KEY = "sb_publishable_PufAjZIn-i94mT5If1htBw_IKKLuz4B";
let PLAYER_CODE = localStorage.getItem("lms_player_code") || "";

window.lmsSwitchPlayer = async function (code) {
  PLAYER_CODE = String(code || "").trim().toUpperCase();

  localStorage.setItem(
    "lms_player_code",
    PLAYER_CODE
  );

  state.data = null;
  state.history = [];
  state.selectionTeamId = null;
  state.deadline = null;
  state.hasLoadedOnce = false;
  state.lastLoadError = null;

  await loadPlayer(false);
};

const state = {
  data: null,
  selectionTeamId: null,
  deadline: null,
  history: [],
  activeView: "home",
  isLoading: false,
  hasLoadedOnce: false,
  pendingSelection: false,
  lastLoadError: null
};

const $ = (id) => document.getElementById(id);


/* =====================================================
   SUPABASE
   ===================================================== */

async function callRpc(name, body) {

  let accessToken = SUPABASE_KEY;

  try {

    if (window.lmsSupabase) {

      const {
        data
      } =
        await window.lmsSupabase.auth.getSession();

      if (
        data?.session?.access_token
      ) {

        accessToken =
          data.session.access_token;
      }
    }

  } catch (error) {

    console.warn(
      "Could not get authenticated session:",
      error
    );
  }


  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/${name}`,
      {
        method: "POST",

        headers: {

          apikey:
            SUPABASE_KEY,

          Authorization:
            `Bearer ${accessToken}`,

          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify(
            body
          )
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

    data =
      text;
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


    throw new Error(
      message
    );
  }


  return data;
}
  


function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

function money(value) {
  const n = Number(value);

  return Number.isFinite(n)
    ? `£${n.toFixed(2)}`
    : "£5.00";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =====================================================
   DATES
   ===================================================== */

function formatDate(value) {
  if (!value) return "";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) {
    return "";
  }

  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function deadlinePassed() {
  if (!state.deadline) {
    return false;
  }

  const time =
    new Date(state.deadline).getTime();

  return (
    Number.isFinite(time) &&
    time <= Date.now()
  );
}


/* =====================================================
   PLAYER DATA
   ===================================================== */

function normaliseDashboard(raw) {
  const data = first(raw) || {};

  return {
    success: data.success !== false,
    player: data.player || {},
    competition: data.competition || {},
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

function isPaymentDue() {
  return (
    String(
      state.data?.player?.status || ""
    ).toLowerCase() === "payment_due"
  );
}

function isRolloverGame() {
  const player =
    state.data?.player || {};

  const competition =
    state.data?.competition || {};

  return (
    Number(
      player.rollover_number || 0
    ) > 0 ||
    Number(
      competition.rollover_number || 0
    ) > 0
  );
}

function roundIsOpen() {
  const round =
    state.data?.current_round || {};

  const status =
    String(
      state.data?.player?.status || ""
    ).toLowerCase();

  return (
    round.status === "open" &&
    !deadlinePassed() &&
    status !== "payment_due" &&
    status !== "eliminated" &&
    status !== "removed"
  );
}


/* =====================================================
   TEAM / FIXTURE HELPERS
   ===================================================== */

function getUsedTeams() {
  const ids = new Set();
  const names = new Set();

  (
    state.data?.used_teams ||
    []
  ).forEach((team) => {

    if (!team) {
      return;
    }

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
      getFixtureHomeId(fixture)
    ) === String(teamId)
  ) {
    return getFixtureHomeName(
      fixture
    );
  }

  if (
    String(
      getFixtureAwayId(fixture)
    ) === String(teamId)
  ) {
    return getFixtureAwayName(
      fixture
    );
  }

  return "Team selected";
}


/* =====================================================
   ROLLOVER NOTICE
   ===================================================== */

function ensureRolloverNotice() {

  let notice =
    document.getElementById(
      "rolloverNotice"
    );

  if (notice) {
    return notice;
  }

  notice =
    document.createElement(
      "section"
    );

  notice.id =
    "rolloverNotice";

  notice.style.display =
    "none";

  const main =
    document.querySelector(
      "main"
    );

  if (main) {

    main.insertBefore(
      notice,
      main.firstChild
    );
  }

  return notice;
}

function renderRolloverNotice() {

  const notice =
    ensureRolloverNotice();

  if (!notice) {
    return;
  }

  const player =
    state.data?.player || {};

  const competition =
    state.data?.competition || {};

  if (!isRolloverGame()) {

    notice.style.display =
      "none";

    notice.innerHTML =
      "";

    return;
  }

  const rolloverNumber =
    Number(
      player.rollover_number ??
      competition.rollover_number ??
      0
    );

  const entryFee =
    player.entry_fee ??
    player.rollover_entry_fee ??
    competition.entry_fee ??
    5;

  const prizePot =
    competition.prize_pot ??
    0;

  const paymentDue =
    isPaymentDue();

  const rejoined =
    player.rejoined === true;

  if (paymentDue) {

    notice.style.display =
      "";

    notice.innerHTML = `
      <div
        style="
          background:linear-gradient(
            135deg,
            rgba(245,158,11,.15),
            rgba(255,255,255,.04)
          );
          border:1px solid rgba(245,158,11,.30);
          border-radius:18px;
          padding:18px;
          margin-bottom:16px;
        "
      >

        <div
          style="
            font-size:12px;
            font-weight:900;
            letter-spacing:.10em;
            text-transform:uppercase;
            color:#fcd34d;
          "
        >
          NEW GAME
        </div>

        <div
          style="
            font-size:22px;
            font-weight:900;
            margin-top:5px;
          "
        >
          Rollover Game ${rolloverNumber}
        </div>

        <div
          style="
            margin-top:9px;
            line-height:1.5;
            opacity:.82;
          "
        >
          The previous game has ended and
          a new game has started.
          Your place is reserved, but payment
          is required before you can make a selection.
        </div>

        <div
          style="
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:10px;
            margin-top:15px;
          "
        >

          <div
            style="
              background:rgba(255,255,255,.05);
              border-radius:12px;
              padding:11px;
            "
          >

            <div
              style="
                font-size:11px;
                opacity:.6;
                text-transform:uppercase;
              "
            >
              Your entry
            </div>

            <div
              style="
                font-size:20px;
                font-weight:900;
                margin-top:3px;
              "
            >
              ${money(entryFee)}
            </div>

          </div>

          <div
            style="
              background:rgba(255,255,255,.05);
              border-radius:12px;
              padding:11px;
            "
          >

            <div
              style="
                font-size:11px;
                opacity:.6;
                text-transform:uppercase;
              "
            >
              Prize pot
            </div>

            <div
              style="
                font-size:20px;
                font-weight:900;
                margin-top:3px;
              "
            >
              ${money(prizePot)}
            </div>

          </div>

        </div>

        <div
          style="
            margin-top:14px;
            padding:10px 12px;
            border-radius:12px;
            background:rgba(245,158,11,.10);
            color:#fcd34d;
            font-weight:800;
            font-size:13px;
          "
        >
          PAYMENT REQUIRED
        </div>

        <div
          style="
            margin-top:6px;
            font-size:12px;
            opacity:.65;
          "
        >
          Please contact the administrator
          to arrange payment.
        </div>

      </div>
    `;

    return;
  }

  if (rejoined) {

    notice.style.display =
      "";

    notice.innerHTML = `
      <div
        style="
          background:rgba(34,197,94,.08);
          border:1px solid rgba(34,197,94,.22);
          border-radius:18px;
          padding:16px 18px;
          margin-bottom:16px;
        "
      >

        <div
          style="
            color:#86efac;
            font-size:12px;
            font-weight:900;
            letter-spacing:.10em;
            text-transform:uppercase;
          "
        >
          NEW GAME
        </div>

        <div
          style="
            font-size:20px;
            font-weight:900;
            margin-top:4px;
          "
        >
          You're back in!
        </div>

        <div
          style="
            margin-top:7px;
            opacity:.75;
            line-height:1.45;
          "
        >
          Rollover Game ${rolloverNumber}
          is underway.
          Your entry has been paid and all
          Premier League teams are available again.
        </div>

        <div
          style="
            margin-top:10px;
            font-weight:800;
            color:#86efac;
          "
        >
          Entry paid: ${money(entryFee)}
        </div>

      </div>
    `;

    return;
  }

  notice.style.display =
    "";

  notice.innerHTML = `
    <div
      style="
        background:rgba(255,255,255,.04);
        border:1px solid rgba(255,255,255,.10);
        border-radius:18px;
        padding:16px 18px;
        margin-bottom:16px;
      "
    >

      <div
        style="
          font-size:12px;
          font-weight:900;
          letter-spacing:.10em;
          text-transform:uppercase;
          opacity:.65;
        "
      >
        NEW GAME
      </div>

      <div
        style="
          font-size:20px;
          font-weight:900;
          margin-top:4px;
        "
      >
        Rollover Game ${rolloverNumber}
      </div>

      <div
        style="
          margin-top:7px;
          opacity:.75;
        "
      >
        All Premier League teams are
        available again.
      </div>

    </div>
  `;
}


/* =====================================================
   NEXT ROUND / FIXTURE BREAK NOTICE
   ===================================================== */

function ensureNextRoundNotice() {

  let notice =
    document.getElementById(
      "nextRoundNotice"
    );

  if (notice) {
    return notice;
  }

  notice =
    document.createElement(
      "section"
    );

  notice.id =
    "nextRoundNotice";

  notice.style.display =
    "none";

  const main =
    document.querySelector(
      "main"
    );

  if (main) {

    const rollover =
      document.getElementById(
        "rolloverNotice"
      );

    if (rollover) {

      main.insertBefore(
        notice,
        rollover.nextSibling
      );

    } else {

      main.insertBefore(
        notice,
        main.firstChild
      );
    }
  }

  return notice;
}

function renderNextRoundNotice() {

  const notice =
    ensureNextRoundNotice();

  if (!notice) {
    return;
  }

  const round =
    state.data?.current_round || {};

  const start =
    new Date(
      round.start_time || ""
    ).getTime();

  if (
    !Number.isFinite(start)
  ) {

    notice.style.display =
      "none";

    notice.innerHTML =
      "";

    return;
  }

  const hoursUntil =
    (start - Date.now()) /
    3600000;

  /*
    Only show this for a genuine
    long fixture break.
  */

  if (
    hoursUntil <= 48
  ) {

    notice.style.display =
      "none";

    notice.innerHTML =
      "";

    return;
  }

  const fixtures =
    Array.isArray(
      state.data?.fixtures
    )
      ? state.data.fixtures
          .slice()
          .sort(
            (a, b) =>
              new Date(
                a.kickoff_time
              ).getTime() -
              new Date(
                b.kickoff_time
              ).getTime()
          )
      : [];

  const firstKickoff =
    fixtures[0]?.kickoff_time ||
    round.start_time;

  notice.style.display =
    "";

  notice.innerHTML = `
    <div
      style="
        background:linear-gradient(
          135deg,
          rgba(59,130,246,.12),
          rgba(255,255,255,.04)
        );
        border:1px solid rgba(96,165,250,.22);
        border-radius:18px;
        padding:18px;
        margin-bottom:16px;
      "
    >

      <div
        style="
          font-size:12px;
          font-weight:900;
          letter-spacing:.10em;
          text-transform:uppercase;
          color:#93c5fd;
        "
      >
        NEXT ROUND
      </div>

      <div
        style="
          font-size:23px;
          font-weight:900;
          margin-top:5px;
        "
      >
        Round ${escapeHtml(
          round.round_number || ""
        )}
      </div>

      <div
        style="
          margin-top:8px;
          font-size:16px;
          font-weight:700;
        "
      >
        Premier League fixtures return
      </div>

      <div
        style="
          margin-top:7px;
          opacity:.72;
          line-height:1.45;
        "
      >
        There is a break before the next
        round of fixtures.
      </div>

      <div
        style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:10px;
          margin-top:15px;
        "
      >

        <div
          style="
            background:rgba(255,255,255,.05);
            border-radius:12px;
            padding:11px;
          "
        >

          <div
            style="
              font-size:10px;
              opacity:.6;
              text-transform:uppercase;
            "
          >
            First fixture
          </div>

          <div
            style="
              font-size:14px;
              font-weight:800;
              margin-top:4px;
            "
          >
            ${escapeHtml(
              formatDate(firstKickoff)
            )}
          </div>

        </div>

        <div
          style="
            background:rgba(255,255,255,.05);
            border-radius:12px;
            padding:11px;
          "
        >

          <div
            style="
              font-size:10px;
              opacity:.6;
              text-transform:uppercase;
            "
          >
            Selection deadline
          </div>

          <div
            style="
              font-size:14px;
              font-weight:800;
              margin-top:4px;
            "
          >
            ${escapeHtml(
              formatDate(
                round.selection_deadline
              )
            )}
          </div>

        </div>

      </div>

      <div
        style="
          margin-top:14px;
          color:#93c5fd;
          font-size:13px;
          font-weight:800;
        "
      >
        You don't need to do anything yet.
        The next round will open automatically.
      </div>

    </div>
  `;
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

  $("playerName").textContent =
    player.name ||
    PLAYER_CODE;

  $("roundNumber").textContent =
    round.round_number
      ? `Round ${round.round_number}`
      : "Waiting";

  let statusText =
    "Waiting to start";

  const playerStatus =
    String(
      player.status ||
      ""
    ).toLowerCase();

  if (
    playerStatus ===
    "payment_due"
  ) {

    statusText =
      "Payment required";

  } else if (
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
        player.entry_fee ??
        competition.entry_fee
      );
  }

  state.deadline =
    round.selection_deadline ||
    null;

  if (
    !state.pendingSelection
  ) {

    state.selectionTeamId =
      d.selection?.team_id ||
      null;
  }

  let selectedTeamName =
    null;

  if (
    state.pendingSelection &&
    state.selectionTeamId
  ) {

    const pendingFixture =
      (
        d.fixtures ||
        []
      ).find(
        (fixture) =>
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

    selectedTeamName =
      getTeamNameFromFixture(
        pendingFixture,
        state.selectionTeamId
      );

  } else {

    selectedTeamName =
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
          (fixture) =>
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

      selectedTeamName =
        getTeamNameFromFixture(
          selectedFixture,
          state.selectionTeamId
        );
    }
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

  renderRolloverNotice();

  renderNextRoundNotice();

  renderFixtures();

  const hint =
    $("selectionHint");

  if (hint) {

    if (isPaymentDue()) {

      hint.textContent =
        "Payment is required before you can make a selection.";

    } else {

      hint.textContent =
        selectedTeamName
          ? `Your current selection is ${selectedTeamName}. You can change it until the deadline.`
          : "Choose one Premier League team to win its game.";
    }
  }

  updateCountdown();
}


/* =====================================================
   FIXTURES
   ===================================================== */

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

    el.innerHTML = `
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

            state.pendingSelection =
              true;

            const selectedFixture =
              fixtures.find(
                (fixture) =>
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


/* =====================================================
   SAVE SELECTION
   ===================================================== */

async function saveSelection() {

  if (
    !state.selectionTeamId
  ) {
    return;
  }

  if (isPaymentDue()) {

    $("selectionHint")
      .textContent =
      "Payment is required before you can make a selection.";

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

    state.pendingSelection =
  false;

while (state.isLoading) {
  await new Promise(
    (resolve) => setTimeout(resolve, 100)
  );
}

await loadPlayer(false);

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


/* =====================================================
   LOAD PLAYER
   ===================================================== */

async function loadPlayer(
  silent = false
) {

  if (
    state.isLoading
  ) {
    return;
  }

  state.isLoading =
    true;

  try {

    let raw =
      null;

    let lastError =
      null;

    for (
      let attempt = 0;
      attempt < 3;
      attempt++
    ) {

      try {

        raw =
          await callRpc(
            "get_lms_player_data",
            {
              p_player_code:
                PLAYER_CODE
            }
          );

        lastError =
          null;

        break;

      } catch (error) {

        lastError =
          error;

        if (
          attempt < 2
        ) {

          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                700 *
                (attempt + 1)
              )
          );
        }
      }
    }

    if (
      lastError
    ) {
      throw lastError;
    }

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

    state.hasLoadedOnce =
      true;

    state.lastLoadError =
      null;

    renderDashboard();

  } catch (error) {

    console.error(
      "Load player error:",
      error
    );

    state.lastLoadError =
      error;

    if (
      state.hasLoadedOnce &&
      state.data
    ) {

      return;
    }

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
      .innerHTML = `
        <div class="empty-state">
          ${
            error?.message ||
            "Could not connect to the competition."
          }
        </div>
      `;

    $("confirmBtn")
      .disabled = true;

  } finally {

    state.isLoading =
      false;
  }
}


/* =====================================================
   COUNTDOWN
   ===================================================== */

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

  if (
    historyView
  ) {
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

    <div id="historySummary"></div>

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

  if (
    value === "win"
  ) {
    return "WIN";
  }

  if (
    value === "draw"
  ) {
    return "DRAW";
  }

  if (
    value === "loss"
  ) {
    return "LOSS";
  }

  if (
    value === "through"
  ) {
    return "THROUGH";
  }

  if (
    value === "abandoned"
  ) {
    return "ABANDONED";
  }

  if (
    value === "postponed"
  ) {
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

  if (
    value === "abandoned"
  ) {
    return "color:#c4b5fd;";
  }

  return "color:#cbd5e1;";
}

function resultIcon(result) {

  const value =
    String(
      result ||
      ""
    ).toLowerCase();

  if (
    value === "win" ||
    value === "through"
  ) {
    return "✓";
  }

  if (
    value === "loss"
  ) {
    return "✕";
  }

  if (
    value === "draw"
  ) {
    return "—";
  }

  if (
    value === "abandoned"
  ) {
    return "↻";
  }

  return "•";
}

function renderHistorySummary() {

  const summary =
    document.getElementById(
      "historySummary"
    );

  if (!summary) {
    return;
  }

  const history =
    Array.isArray(
      state.history
    )
      ? state.history
      : [];

  if (
    !history.length
  ) {

    summary.innerHTML =
      "";

    return;
  }

  const wins =
    history.filter(
      (item) =>
        ["win", "through"].includes(
          String(
            item.result ||
            ""
          ).toLowerCase()
        )
    ).length;

  const losses =
    history.filter(
      (item) =>
        String(
          item.result ||
          ""
        ).toLowerCase() ===
        "loss"
    ).length;

  const automatic =
    history.filter(
      (item) =>
        String(
          item.selection_type ||
          ""
        ).toLowerCase() ===
        "automatic"
    ).length;

  summary.innerHTML = `
    <div
      style="
        display:grid;
        grid-template-columns:repeat(3,1fr);
        gap:10px;
        margin:14px 0 18px;
      "
    >

      <div
        style="
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:14px;
          padding:12px;
          text-align:center;
        "
      >

        <div
          style="
            font-size:22px;
            font-weight:800;
          "
        >
          ${wins}
        </div>

        <div
          style="
            font-size:11px;
            opacity:.65;
            text-transform:uppercase;
            margin-top:3px;
          "
        >
          Through
        </div>

      </div>

      <div
        style="
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:14px;
          padding:12px;
          text-align:center;
        "
      >

        <div
          style="
            font-size:22px;
            font-weight:800;
          "
        >
          ${losses}
        </div>

        <div
          style="
            font-size:11px;
            opacity:.65;
            text-transform:uppercase;
            margin-top:3px;
          "
        >
          Losses
        </div>

      </div>

      <div
        style="
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:14px;
          padding:12px;
          text-align:center;
        "
      >

        <div
          style="
            font-size:22px;
            font-weight:800;
          "
        >
          ${automatic}
        </div>

        <div
          style="
            font-size:11px;
            opacity:.65;
            text-transform:uppercase;
            margin-top:3px;
          "
        >
          Automatic
        </div>

      </div>

    </div>
  `;
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

  renderHistorySummary();

  if (
    !history.length
  ) {

    content.innerHTML = `
      <div
        class="empty-state"
        style="
          padding:30px 10px;
          text-align:center;
        "
      >

        <div
          style="
            font-size:34px;
            margin-bottom:10px;
          "
        >
          🏆
        </div>

        <div
          style="
            font-weight:800;
            font-size:17px;
          "
        >
          Your journey starts here
        </div>

        <div
          style="
            opacity:.65;
            margin-top:7px;
          "
        >
          Your completed rounds will appear here.
        </div>

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

          const automatic =
            String(
              item.selection_type ||
              "manual"
            ).toLowerCase() ===
            "automatic";

          let score =
            "";

          if (
            item.home_score !==
              null &&
            item.home_score !==
              undefined &&
            item.away_score !==
              null &&
            item.away_score !==
              undefined
          ) {

            score = `
              <div
                style="
                  font-size:26px;
                  font-weight:900;
                  margin-top:10px;
                  letter-spacing:.04em;
                "
              >
                ${escapeHtml(
                  item.home_score
                )}
                -
                ${escapeHtml(
                  item.away_score
                )}
              </div>
            `;
          }

          const selectionBadge =
            automatic
              ? `
                <div
                  style="
                    display:inline-flex;
                    align-items:center;
                    gap:6px;
                    margin-top:10px;
                    padding:6px 10px;
                    border-radius:999px;
                    background:rgba(251,191,36,.12);
                    border:1px solid rgba(251,191,36,.25);
                    color:#fcd34d;
                    font-size:11px;
                    font-weight:800;
                    text-transform:uppercase;
                  "
                >
                  ⚠ Automatic selection
                </div>
              `
              : `
                <div
                  style="
                    display:inline-flex;
                    align-items:center;
                    margin-top:10px;
                    padding:6px 10px;
                    border-radius:999px;
                    background:rgba(255,255,255,.05);
                    border:1px solid rgba(255,255,255,.08);
                    color:#cbd5e1;
                    font-size:11px;
                    font-weight:700;
                    text-transform:uppercase;
                  "
                >
                  Your selection
                </div>
              `;

          return `
            <div
              style="
                background:rgba(255,255,255,0.04);
                border:1px solid rgba(255,255,255,0.08);
                border-radius:18px;
                padding:17px;
                margin-bottom:12px;
              "
            >

              <div
                style="
                  display:flex;
                  justify-content:space-between;
                  align-items:flex-start;
                  gap:12px;
                "
              >

                <div>

                  <div
                    style="
                      font-size:11px;
                      text-transform:uppercase;
                      letter-spacing:.1em;
                      opacity:.6;
                      font-weight:700;
                    "
                  >
                    ROUND ${escapeHtml(
                      roundNumber
                    )}
                  </div>

                  <div
                    style="
                      font-size:19px;
                      font-weight:900;
                      margin-top:5px;
                    "
                  >
                    ${escapeHtml(
                      teamName
                    )}
                  </div>

                </div>

                <div
                  style="
                    display:flex;
                    align-items:center;
                    gap:5px;
                    font-weight:900;
                    font-size:14px;
                    ${resultStyle(
                      item.result
                    )}
                    white-space:nowrap;
                  "
                >

                  <span>
                    ${resultIcon(
                      item.result
                    )}
                  </span>

                  <span>
                    ${result}
                  </span>

                </div>

              </div>

              <div
                style="
                  margin-top:14px;
                  font-weight:700;
                  font-size:15px;
                "
              >
                ${escapeHtml(
                  fixture
                )}
              </div>

              ${score}

              ${selectionBadge}

              <div
                style="
                  margin-top:10px;
                  font-size:12px;
                  opacity:.55;
                "
              >
                ${escapeHtml(
                  kickoff
                )}
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

          ${escapeHtml(
            error?.message ||
            "Please try again."
          )}

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

  const rolloverNotice =
    ensureRolloverNotice();

  const nextRoundNotice =
    ensureNextRoundNotice();

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
        child ===
        rolloverNotice
      ) {

        child.style.display =
          view === "home" &&
          isRolloverGame()
            ? ""
            : "none";

        return;
      }

      if (
        child ===
        nextRoundNotice
      ) {

        const round =
          state.data?.current_round || {};

        const start =
          new Date(
            round.start_time || ""
          ).getTime();

        child.style.display =
          view === "home" &&
          Number.isFinite(start) &&
          ((start - Date.now()) / 3600000) > 48
            ? ""
            : "none";

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

async function startApp() {
  if (window.lmsAuthReady) {
    await window.lmsAuthReady;
  }
  const confirmBtn =
    $("confirmBtn");

  if (
    confirmBtn
  ) {

    confirmBtn.addEventListener(
      "click",
      saveSelection
    );
  }

  setupNavigation();

  ensureRolloverNotice();

  ensureNextRoundNotice();

  loadPlayer(false);

  setInterval(
    updateCountdown,
    1000
  );

  setInterval(
    () => loadPlayer(true),
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
