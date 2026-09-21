const SUPABASE_URL="https://tkhykusvmsceleflynok.supabase.co";
const SUPABASE_KEY="sb_publishable_PufAjZIn-i94mT5If1htBw_IKKLuz4B";
let PLAYER_CODE=localStorage.getItem("lms_player_code")||"";

const state={
  data:null,
  history:[],
  selectionTeamId:null,
  deadline:null,
  activeView:"home",
  isLoading:false,
  hasLoadedOnce:false,
  pendingSelection:false,
  lastLoadError:null
};

const $=id=>document.getElementById(id);

window.lmsSwitchPlayer=async code=>{
  PLAYER_CODE=String(code||"").trim().toUpperCase();
  localStorage.setItem("lms_player_code",PLAYER_CODE);
  state.data=null;
  state.history=[];
  state.selectionTeamId=null;
  state.deadline=null;
  state.hasLoadedOnce=false;
  state.lastLoadError=null;
  state.pendingSelection=false;
  await loadPlayer(false);
};

async function callRpc(name,body){
  let token=SUPABASE_KEY;

  try{
    if(window.lmsSupabase){
      const {data}=await window.lmsSupabase.auth.getSession();

      if(data?.session?.access_token){
        token=data.session.access_token;
      }
    }
  }catch(e){
    console.warn("Session error",e);
  }

  const r=await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/${name}`,
    {
      method:"POST",
      headers:{
        apikey:SUPABASE_KEY,
        Authorization:`Bearer ${token}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify(body)
    }
  );

  const text=await r.text();

  let data=null;

  try{
    data=text?JSON.parse(text):null;
  }catch{
    data=text;
  }

  if(!r.ok){
    throw new Error(
      data?.message||
      data?.error||
      data?.hint||
      `Supabase RPC error ${r.status}`
    );
  }

  return data;
}

const first=v=>Array.isArray(v)?v[0]:v;

const money=v=>
  Number.isFinite(Number(v))
    ? `£${Number(v).toFixed(2)}`
    : "£5.00";

const esc=v=>
  String(v??"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

function formatDate(v){
  if(!v)return"";

  const d=new Date(v);

  if(Number.isNaN(d.getTime()))return"";

  return d.toLocaleString(
    "en-GB",
    {
      weekday:"short",
      day:"numeric",
      month:"short",
      hour:"2-digit",
      minute:"2-digit"
    }
  );
}

function deadlinePassed(){
  if(!state.deadline)return false;

  const t=new Date(state.deadline).getTime();

  return Number.isFinite(t)&&t<=Date.now();
}

function normalise(raw){
  const d=first(raw)||{};

  return{
    success:d.success!==false,
    player:d.player||{},
    competition:d.competition||{},
    current_round:d.current_round||d.round||{},
    selection:d.selection||null,
    used_teams:d.used_teams||[],
    fixtures:d.fixtures||[]
  };
}

function paymentDue(){
  return String(
    state.data?.player?.status||""
  ).toLowerCase()==="payment_due";
}

function rolloverGame(){
  return Number(
    state.data?.competition?.rollover_number||0
  )>0;
}

function roundOpen(){
  const r=state.data?.current_round||{};

  const s=String(
    state.data?.player?.status||""
  ).toLowerCase();

  return(
    r.status==="open"&&
    !deadlinePassed()&&
    !["payment_due","eliminated","removed"].includes(s)
  );
}

function homeId(f){
  return f.home_team_id||f.home_id||f.homeTeamId||null;
}

function awayId(f){
  return f.away_team_id||f.away_id||f.awayTeamId||null;
}

function homeName(f){
  return(
    f.home_name||
    f.home_team||
    f.home||
    f.homeTeam||
    "Home"
  );
}

function awayName(f){
  return(
    f.away_name||
    f.away_team||
    f.away||
    f.awayTeam||
    "Away"
  );
}

function teamName(f,id){
  if(!f)return"Team selected";

  if(String(homeId(f))===String(id)){
    return homeName(f);
  }

  if(String(awayId(f))===String(id)){
    return awayName(f);
  }

  return"Team selected";
}

function usedTeams(){
  const ids=new Set();
  const names=new Set();

  (state.data?.used_teams||[])
    .forEach(t=>{
      if(!t)return;

      if(typeof t==="string"){
        names.add(
          t.trim().toLowerCase()
        );
        return;
      }

      const id=t.team_id||t.id;
      const n=t.team_name||t.name||t.short_name;

      if(id){
        ids.add(String(id));
      }

      if(n){
        names.add(
          String(n)
            .trim()
            .toLowerCase()
        );
      }
    });

  return{ids,names};
}

function isUsed(id,name,u){
  return(
    (id&&u.ids.has(String(id)))||
    (
      name&&
      u.names.has(
        String(name)
          .trim()
          .toLowerCase()
      )
    )
  );
}

function ensureNotice(id,afterId){
  let n=document.getElementById(id);

  if(n)return n;

  n=document.createElement("section");
  n.id=id;
  n.style.display="none";

  const main=document.querySelector("main");

  if(main){
    const after=
      afterId&&
      document.getElementById(afterId);

    if(after){
      main.insertBefore(
        n,
        after.nextSibling
      );
    }else{
      main.insertBefore(
        n,
        main.firstChild
      );
    }
  }

  return n;
}

function renderNotices(){
  const roll=
    ensureNotice("rolloverNotice");

  if(!rolloverGame()){
    roll.style.display="none";
    roll.innerHTML="";
  }else{
    const p=state.data?.player||{};
    const c=state.data?.competition||{};

    const n=Number(
      p.rollover_number??
      c.rollover_number??
      0
    );

    const fee=
      p.entry_fee??
      p.rollover_entry_fee??
      c.entry_fee??
      5;

    roll.style.display="";

    roll.innerHTML=`
      <div style="
        background:rgba(255,255,255,.04);
        border:1px solid rgba(255,255,255,.1);
        border-radius:18px;
        padding:16px 18px;
        margin-bottom:16px
      ">
        <div class="muted">
          NEW GAME
        </div>

        <div style="
          font-size:20px;
          font-weight:900;
          margin-top:4px
        ">
          Rollover Game ${n}
        </div>

        <div style="
          margin-top:7px;
          opacity:.75
        ">
          ${
            paymentDue()
              ? "Payment is required before you can make a selection."
              : "All Premier League teams are available again."
          }
        </div>

        <div style="
          margin-top:10px;
          font-weight:800
        ">
          ${
            paymentDue()
              ? "PAYMENT REQUIRED"
              : "Entry: "+money(fee)
          }
        </div>
      </div>
    `;
  }

  const next=
    ensureNotice(
      "nextRoundNotice",
      "rolloverNotice"
    );

  const r=
    state.data?.current_round||{};

  const start=
    new Date(
      r.start_time||""
    ).getTime();

  if(
    !Number.isFinite(start)||
    r.status!=="upcoming"||
    ((start-Date.now())/3600000)<=48
  ){
    next.style.display="none";
    next.innerHTML="";
  }else{
    const f=
      (state.data?.fixtures||[])
        .slice()
        .sort(
          (a,b)=>
            new Date(a.kickoff_time)-
            new Date(b.kickoff_time)
        );

    next.style.display="";

    next.innerHTML=`
      <div style="
        background:rgba(59,130,246,.1);
        border:1px solid rgba(96,165,250,.22);
        border-radius:18px;
        padding:16px 18px;
        margin-bottom:16px
      ">
        <div class="muted">
          NEXT ROUND
        </div>

        <div style="
          font-size:21px;
          font-weight:900;
          margin-top:4px
        ">
          Round ${
            esc(
              r.game_round_number||
              r.round_number||
              ""
            )
          }
        </div>

        <div style="
          margin-top:7px;
          opacity:.75
        ">
          Premier League fixtures return.
        </div>

        <div style="
          margin-top:9px;
          color:#93c5fd;
          font-weight:800
        ">
          First fixture:
          ${esc(
            formatDate(
              f[0]?.kickoff_time||
              r.start_time
            )
          )}
        </div>
      </div>
    `;
  }
}

function renderDashboard(){
  const d=state.data;

  if(!d)return;

  const p=d.player||{};
  const c=d.competition||{};
  const r=d.current_round||{};

  $("playerName").textContent=
    p.name||
    PLAYER_CODE||
    "Player";

  const gameRound=
    r.game_round_number||
    (
      Number(r.round_number)>=5
        ? Number(r.round_number)-4
        : Number(r.round_number)
    );

  $("roundNumber").textContent=
    gameRound
      ? `Round ${gameRound}`
      : "Waiting";

  let status=
    "Waiting to start";

  const ps=
    String(
      p.status||""
    ).toLowerCase();

  if(ps==="payment_due"){
    status="Payment required";
  }else if(r.status==="open"){
    status="Choose your team";
  }else if(r.status==="locked"){
    status="Selections locked";
  }else if(r.status==="in_progress"){
    status="Round in progress";
  }else if(r.status==="completed"){
    status="Round completed";
  }

  const heroStatus=
    document.querySelector(
      ".hero-status"
    );

  if(heroStatus){
    heroStatus.textContent=status;
  }

  const badge=
    document.querySelector(
      ".badge"
    );

  if(badge){
    const s=
      String(
        p.status||"alive"
      ).toUpperCase();

    badge.textContent=s;

    badge.className=
      "badge "+
      (
        s==="ALIVE"
          ? "alive"
          : ""
      );
  }

  const stats=
    document.querySelectorAll(
      ".stat-grid strong"
    );

  if(stats.length>=3){
    stats[0].textContent=
      (d.used_teams||[]).length;

    stats[1].textContent=
      p.missed_selection_count??0;

    stats[2].textContent=
      money(
        p.entry_fee??
        c.entry_fee
      );
  }

  state.deadline=
    r.selection_deadline||null;

  if(!state.pendingSelection){
    state.selectionTeamId=
      d.selection?.team_id||
      null;
  }

  let selected=
    d.selection?.team_name||
    null;

  if(
    !selected&&
    state.selectionTeamId
  ){
    const f=
      (d.fixtures||[])
        .find(
          x=>
            String(homeId(x))===
              String(state.selectionTeamId)||
            String(awayId(x))===
              String(state.selectionTeamId)
        );

    selected=
      teamName(
        f,
        state.selectionTeamId
      );
  }

  $("selectionTitle").textContent=
    selected||
    "Choose your team";

  $("lockPill")
    .textContent=
      ps==="eliminated"
        ? "ELIMINATED"
        : roundOpen()
          ? "OPEN"
          : String(
              r.status||
              "WAITING"
            ).toUpperCase();

  renderNotices();
  renderFixtures();

  $("selectionHint").textContent=
    paymentDue()
      ? "Payment is required before you can make a selection."
      : selected
        ? `Your current selection is ${selected}. You can change it until the deadline.`
        : "Choose one Premier League team to win its game.";

  updateCountdown();
}

function renderFixtures(){
  const el=$("fixtures");

  const fixtures=
    state.data?.fixtures||[];

  const u=usedTeams();
  const open=roundOpen();

  if(!fixtures.length){
    el.innerHTML=`
      <div class="empty-state">
        No fixtures are available for this round.
      </div>
    `;

    $("confirmBtn").disabled=true;

    return;
  }

  el.innerHTML=
    fixtures
      .map(f=>{
        const hId=homeId(f);
        const aId=awayId(f);
        const h=homeName(f);
        const a=awayName(f);
        const time=formatDate(
          f.kickoff_time
        );

        const fs=
          f.status||
          "scheduled";

        const btn=(id,name)=>{
          const selected=
            state.selectionTeamId&&
            String(
              state.selectionTeamId
            )===
            String(id);

          const used=
            !selected&&
            isUsed(
              id,
              name,
              u
            );

          const unavailable=
            fs!=="scheduled";

          const disabled=
            used||
            unavailable||
            !open;

          let label=
            selected
              ? "SELECTED"
              : used
                ? "USED"
                : unavailable
                  ? String(fs).toUpperCase()
                  : !open
                    ? "LOCKED"
                    : "PICK";

          return`
            <button
              class="pick-btn ${
                selected
                  ? "selected"
                  : used
                    ? "used"
                    : ""
              }"
              data-team-id="${id||""}"
              ${disabled?"disabled":""}
            >
              ${label} ${esc(name)}
            </button>
          `;
        };

        return`
          <div class="fixture">
            <div
              class="fixture-main"
              style="width:100%"
            >
              <div class="fixture-teams">
                ${esc(h)}
                v
                ${esc(a)}
              </div>

              <div class="fixture-time">
                ${esc(time)}
              </div>

              <div style="
                display:flex;
                gap:8px;
                flex-wrap:wrap;
                margin-top:10px
              ">
                ${btn(hId,h)}
                ${btn(aId,a)}
              </div>
            </div>
          </div>
        `;
      })
      .join("");

  document
    .querySelectorAll(
      ".pick-btn[data-team-id]"
    )
    .forEach(b=>{
      b.addEventListener(
        "click",
        ()=>{
          if(b.disabled)return;

          state.selectionTeamId=
            b.dataset.teamId;

          state.pendingSelection=
            true;

          const f=
            fixtures.find(
              x=>
                String(homeId(x))===
                  String(state.selectionTeamId)||
                String(awayId(x))===
                  String(state.selectionTeamId)
            );

          const n=
            teamName(
              f,
              state.selectionTeamId
            );

          $("selectionTitle")
            .textContent=n;

          $("selectionHint")
            .textContent=
              `Your current selection is ${n}. You can change it until the deadline.`;

          $("confirmBtn").disabled=false;

          $("confirmBtn").textContent=
            "Confirm selection";

          renderFixtures();
        }
      );
    });

  $("confirmBtn").disabled=
    !state.selectionTeamId||
    !open;
}

async function saveSelection(){
  if(!state.selectionTeamId)return;

  if(paymentDue()){
    $("selectionHint")
      .textContent=
        "Payment is required before you can make a selection.";

    return;
  }

  const r=
    state.data?.current_round;

  if(!r?.id){
    $("selectionHint")
      .textContent=
        "There is no open round.";

    return;
  }

  const b=$("confirmBtn");

  b.disabled=true;
  b.textContent="Saving...";

  try{
    const result=
      await callRpc(
        "make_selection",
        {
          p_player_code:
            PLAYER_CODE,
          p_round_id:
            r.id,
          p_team_id:
            state.selectionTeamId
        }
      );

    if(result?.success===false){
      throw new Error(
        result.message||
        "Selection was not saved."
      );
    }

    state.pendingSelection=false;

    await loadPlayer();

    b.textContent=
      "Selection saved";

    b.disabled=true;

    $("selectionHint")
      .textContent=
        "Selection saved successfully. You can change it until the deadline.";

  }catch(e){
    console.error(
      "Selection error",
      e
    );

    b.disabled=false;

    b.textContent=
      "Confirm selection";

    $("selectionHint")
      .textContent=
        e?.message||
        "Selection could not be saved.";
  }
}

async function loadPlayer(){
  if(state.isLoading){
    return;
  }

  /*
   * CRITICAL FIX:
   * Get the player code AFTER lms-login.js
   * has finished restoring the secure session.
   */
  PLAYER_CODE=
    (
      localStorage.getItem(
        "lms_player_code"
      )||
      PLAYER_CODE||
      ""
    )
      .trim()
      .toUpperCase();

  if(!PLAYER_CODE){
    return;
  }

  state.isLoading=true;

  try{
    let raw=null;
    let last=null;

    for(
      let i=0;
      i<3;
      i++
    ){
      try{
        raw=
          await callRpc(
            "get_lms_player_data",
            {
              p_player_code:
                PLAYER_CODE
            }
          );

        last=null;
        break;

      }catch(e){
        last=e;

        if(i<2){
          await new Promise(
            x=>
              setTimeout(
                x,
                700*(i+1)
              )
          );
        }
      }
    }

    if(last)throw last;

    const d=
      normalise(raw);

    if(!d.success){
      throw new Error(
        d.message||
        "Player data could not be loaded."
      );
    }

    state.data=d;
    state.hasLoadedOnce=true;
    state.lastLoadError=null;

    renderDashboard();

  }catch(e){
    console.error(
      "Load player error",
      e
    );

    state.lastLoadError=e;

    if(
      state.hasLoadedOnce&&
      state.data
    ){
      return;
    }

    if($("playerName")){
      $("playerName")
        .textContent=
          "Unable to load";
    }

    if($("roundNumber")){
      $("roundNumber")
        .textContent=
          "Please refresh";
    }

    const hs=
      document.querySelector(
        ".hero-status"
      );

    if(hs){
      hs.textContent=
        e?.message||
        "Please refresh the app";
    }

    if($("selectionTitle")){
      $("selectionTitle")
        .textContent=
          "Unable to load competition";
    }

    if($("fixtures")){
      $("fixtures").innerHTML=`
        <div class="empty-state">
          ${esc(
            e?.message||
            "Could not connect to the competition."
          )}
        </div>
      `;
    }

    if($("confirmBtn")){
      $("confirmBtn").disabled=true;
    }

  }finally{
    state.isLoading=false;
  }
}

function updateCountdown(){
  const el=$("countdown");

  if(!el)return;

  if(!state.deadline){
    el.textContent="--:--:--";
    return;
  }

  const end=
    new Date(
      state.deadline
    ).getTime();

  if(!Number.isFinite(end)){
    el.textContent="--:--:--";
    return;
  }

  const left=
    Math.max(
      0,
      end-Date.now()
    );

  const s=
    Math.floor(
      left/1000
    );

  if(!left){
    el.textContent=
      "00:00:00";

    return;
  }

  const d=
    Math.floor(
      s/86400
    );

  const h=
    Math.floor(
      (s%86400)/3600
    );

  const m=
    Math.floor(
      (s%3600)/60
    );

  const sec=
    s%60;

  el.textContent=
    d
      ? `${d}d ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`
      : `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

function ensureHistoryView(){
  let v=
    document.getElementById(
      "historyView"
    );

  if(v)return v;

  v=
    document.createElement(
      "section"
    );

  v.id="historyView";
  v.className="rules-card";
  v.style.display="none";

  v.innerHTML=`
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

  document
    .querySelector("main")
    ?.appendChild(v);

  return v;
}

function resultLabel(v){
  v=
    String(
      v||
      "pending"
    ).toLowerCase();

  return(
    v==="win"
      ? "WIN"
      : v==="draw"
        ? "DRAW"
        : v==="loss"
          ? "LOSS"
          : v==="through"
            ? "THROUGH"
            : v==="abandoned"
              ? "ABANDONED"
              : v==="postponed"
                ? "POSTPONED"
                : "PENDING"
  );
}

function resultColor(v){
  v=
    String(
      v||""
    ).toLowerCase();

  return(
    v==="win"||
    v==="through"
      ? "#86efac"
      : v==="loss"
        ? "#fca5a5"
        : v==="draw"
          ? "#fcd34d"
          : "#cbd5e1"
  );
}

function renderHistory(){
  const v=
    ensureHistoryView();

  const c=
    v.querySelector(
      "#historyContent"
    );

  const h=
    Array.isArray(
      state.history
    )
      ? state.history
      : [];

  if(!h.length){
    c.innerHTML=`
      <div
        class="empty-state"
        style="
          padding:30px;
          text-align:center
        "
      >
        🏆
        <br><br>

        <strong>
          Your journey starts here
        </strong>

        <br><br>

        Your completed rounds
        will appear here.
      </div>
    `;

    return;
  }

  const wins=
    h.filter(
      x=>
        ["win","through"]
          .includes(
            String(
              x.result||""
            ).toLowerCase()
          )
    ).length;

  const losses=
    h.filter(
      x=>
        String(
          x.result||""
        ).toLowerCase()==="loss"
    ).length;

  const automatic=
    h.filter(
      x=>
        String(
          x.selection_type||""
        ).toLowerCase()==="automatic"
    ).length;

  document.getElementById(
    "historySummary"
  ).innerHTML=`
    <div style="
      display:grid;
      grid-template-columns:repeat(3,1fr);
      gap:10px;
      margin:14px 0 18px
    ">
      <div class="stat-grid">
        <strong>${wins}</strong>
        <span>Through</span>
      </div>

      <div class="stat-grid">
        <strong>${losses}</strong>
        <span>Losses</span>
      </div>

      <div class="stat-grid">
        <strong>${automatic}</strong>
        <span>Automatic</span>
      </div>
    </div>
  `;

  c.innerHTML=
    h.map(
      x=>`
        <div style="
          background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.08);
          border-radius:18px;
          padding:17px;
          margin-bottom:12px
        ">
          <div style="
            display:flex;
            justify-content:space-between;
            gap:12px
          ">
            <div>
              <div class="muted">
                ROUND ${esc(
                  x.round_number||"?"
                )}
              </div>

              <div style="
                font-size:19px;
                font-weight:900;
                margin-top:5px
              ">
                ${esc(
                  x.team_name||
                  "Team"
                )}
              </div>
            </div>

            <div style="
              font-weight:900;
              color:${resultColor(
                x.result
              )}
            ">
              ${resultLabel(
                x.result
              )}
            </div>
          </div>

          <div style="
            margin-top:14px;
            font-weight:700
          ">
            ${esc(
              x.fixture||
              "Fixture"
            )}
          </div>

          ${
            x.home_score!=null&&
            x.away_score!=null
              ? `
                <div style="
                  font-size:26px;
                  font-weight:900;
                  margin-top:10px
                ">
                  ${esc(x.home_score)}
                  -
                  ${esc(x.away_score)}
                </div>
              `
              : ""
          }

          <div style="
            margin-top:10px;
            font-size:12px;
            opacity:.55
          ">
            ${esc(
              formatDate(
                x.kickoff_time
              )
            )}
          </div>
        </div>
      `
    ).join("");
}

async function loadHistory(){
  const c=
    ensureHistoryView()
      .querySelector(
        "#historyContent"
      );

  c.innerHTML=`
    <div class="empty-state">
      Loading your history...
    </div>
  `;

  try{
    const raw=
      await callRpc(
        "get_lms_history",
        {
          p_player_code:
            PLAYER_CODE
        }
      );

    state.history=
      Array.isArray(raw)
        ? raw
        : first(raw)||[];

    renderHistory();

  }catch(e){
    c.innerHTML=`
      <div class="empty-state">
        Could not load your history.

        <br><br>

        ${esc(
          e?.message||
          "Please try again."
        )}
      </div>
    `;
  }
}

function setMainView(view){
  const main=
    document.querySelector(
      "main"
    );

  if(!main)return;

  const history=
    ensureHistoryView();

  const roll=
    ensureNotice(
      "rolloverNotice"
    );

  const next=
    ensureNotice(
      "nextRoundNotice",
      "rolloverNotice"
    );

  Array.from(
    main.children
  ).forEach(
    child=>{
      if(child===history){
        child.style.display=
          view==="history"
            ? ""
            : "none";

        return;
      }

      if(
        child===roll||
        child===next
      ){
        child.style.display=
          "none";

        return;
      }

      const rules=
        child.classList.contains(
          "rules-card"
        );

      if(view==="home"){
        child.style.display=
          rules
            ? "none"
            : "";

      }else if(
        view==="rules"
      ){
        child.style.display=
          rules
            ? ""
            : "none";

      }else{
        child.style.display=
          "none";
      }
    }
  );

  if(view==="home"){
    renderNotices();
  }

  state.activeView=view;

  main.scrollTop=0;
}

function setupNavigation(){
  const buttons=
    document.querySelectorAll(
      ".bottom-nav .nav-item"
    );

  buttons.forEach(
    (b,i)=>{
      b.addEventListener(
        "click",
        async()=>{
          buttons.forEach(
            x=>
              x.classList.remove(
                "active"
              )
          );

          b.classList.add(
            "active"
          );

          if(i===0){
            setMainView("home");

          }else if(i===1){
            setMainView("history");
            await loadHistory();

          }else if(i===2){
            setMainView("rules");
          }
        }
      );
    }
  );
}

async function startApp(){

  let ready=false;

  if(window.lmsAuthReady){
    ready=
      await window.lmsAuthReady;
  }

  if(!ready)return;

  /*
   * CRITICAL FIX:
   * The login script may only have written
   * LMS001 to localStorage moments ago.
   * Read it again now.
   */
  PLAYER_CODE=
    (
      localStorage.getItem(
        "lms_player_code"
      )||
      ""
    )
      .trim()
      .toUpperCase();

  if(!PLAYER_CODE){
    console.warn(
      "No LMS player code available after secure login."
    );
    return;
  }

  const confirm=
    $("confirmBtn");

  if(confirm){
    confirm.addEventListener(
      "click",
      saveSelection
    );
  }

  setupNavigation();

  ensureHistoryView();

  ensureNotice(
    "rolloverNotice"
  );

  ensureNotice(
    "nextRoundNotice",
    "rolloverNotice"
  );

  setMainView("home");

  await loadPlayer();

  setInterval(
    updateCountdown,
    1000
  );

  setInterval(
    ()=>loadPlayer(),
    30000
  );
}

if(
  document.readyState===
  "loading"
){
  document.addEventListener(
    "DOMContentLoaded",
    startApp
  );
}else{
  startApp();
}
