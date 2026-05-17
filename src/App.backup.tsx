import { useEffect, useMemo, useState, type FormEvent } from "react";

type Page = "home" | "sessions" | "hands" | "notes" | "dashboard";

type PokerSession = {
  id: string;
  date: string;
  stake: string;
  location: string;
  buyIn: number;
  cashOut: number;
  durationHours: number;
  profit: number;
  hourlyRate: number;
  mentalState: string;
  tableQuality: string;
  notes: string;
  createdAt: string;
};

type PokerHand = {
  id: string;
  sessionId: string;
  title: string;
  date: string;
  stake: string;
  position: string;
  heroCards: string;
  board: string;
  effectiveStack: string;
  result: number;
  preflopAction: string;
  flopAction: string;
  turnAction: string;
  riverAction: string;
  thoughtProcess: string;
  review: string;
  mistakeTags: string[];
  handTags: string[];
  isReviewed: boolean;
  createdAt: string;
};

type SessionForm = {
  date: string;
  stake: string;
  location: string;
  buyIn: string;
  cashOut: string;
  durationHours: string;
  mentalState: string;
  tableQuality: string;
  notes: string;
};

type HandForm = {
  sessionId: string;
  title: string;
  date: string;
  stake: string;
  position: string;
  heroCards: string;
  board: string;
  effectiveStack: string;
  result: string;
  preflopAction: string;
  flopAction: string;
  turnAction: string;
  riverAction: string;
  thoughtProcess: string;
  review: string;
  mistakeTags: string;
  handTags: string;
  isReviewed: boolean;
};

const SESSIONS_KEY = "poker-tracker-sessions-v1";
const HANDS_KEY = "poker-tracker-hands-v1";

function loadSessions(): PokerSession[] {
  try {
    const saved = localStorage.getItem(SESSIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function loadHands(): PokerHand[] {
  try {
    const saved = localStorage.getItem(HANDS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function createId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return String(Date.now());
}

function splitTags(value: string) {
  return value
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function emptySessionForm(): SessionForm {
  return {
    date: getToday(),
    stake: "",
    location: "",
    buyIn: "",
    cashOut: "",
    durationHours: "",
    mentalState: "",
    tableQuality: "",
    notes: "",
  };
}

function emptyHandForm(): HandForm {
  return {
    sessionId: "",
    title: "",
    date: getToday(),
    stake: "",
    position: "",
    heroCards: "",
    board: "",
    effectiveStack: "",
    result: "",
    preflopAction: "",
    flopAction: "",
    turnAction: "",
    riverAction: "",
    thoughtProcess: "",
    review: "",
    mistakeTags: "",
    handTags: "",
    isReviewed: false,
  };
}

function HomePage({
  sessions,
  hands,
  goToSessions,
  goToHands,
}: {
  sessions: PokerSession[];
  hands: PokerHand[];
  goToSessions: () => void;
  goToHands: () => void;
}) {
  const stats = useMemo(() => {
    const totalProfit = sessions.reduce((sum, s) => sum + s.profit, 0);
    const totalHours = sessions.reduce((sum, s) => sum + s.durationHours, 0);
    const hourlyRate = totalHours > 0 ? totalProfit / totalHours : 0;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthProfit = sessions
      .filter((s) => s.date.startsWith(currentMonth))
      .reduce((sum, s) => sum + s.profit, 0);

    return {
      totalProfit,
      totalHours,
      hourlyRate,
      monthProfit,
    };
  }, [sessions]);

  const recentSessions = sessions.slice(0, 3);
  const reviewedHands = hands.filter((hand) => hand.isReviewed).length;

  return (
    <main className="page">
      <h1>扑克成长系统</h1>
      <p className="subtitle">记录战绩、复盘牌谱、管理学习笔记。</p>

      <section className="stats-grid">
        <div className="stat-card">
          <span>总盈利</span>
          <strong className={stats.totalProfit >= 0 ? "profit-plus" : "profit-minus"}>
            ¥{stats.totalProfit.toFixed(2)}
          </strong>
        </div>
        <div className="stat-card">
          <span>本月盈利</span>
          <strong className={stats.monthProfit >= 0 ? "profit-plus" : "profit-minus"}>
            ¥{stats.monthProfit.toFixed(2)}
          </strong>
        </div>
        <div className="stat-card">
          <span>总时长</span>
          <strong>{stats.totalHours.toFixed(1)}h</strong>
        </div>
        <div className="stat-card">
          <span>牌谱复盘</span>
          <strong>
            {reviewedHands}/{hands.length}
          </strong>
        </div>
      </section>

      <section className="card">
        <h2>快捷操作</h2>
        <div className="quick-actions">
          <button onClick={goToSessions}>＋ 新增场次</button>
          <button onClick={goToHands}>＋ 新增牌谱</button>
          <button>＋ 新增笔记</button>
        </div>
      </section>

      <section className="card">
        <h2>最近场次</h2>
        {recentSessions.length === 0 ? (
          <p className="empty">还没有记录，先新增一场战绩吧。</p>
        ) : (
          <div className="session-list">
            {recentSessions.map((session) => (
              <div className="session-item" key={session.id}>
                <div>
                  <strong>{session.date}</strong>
                  <p>
                    {session.stake || "未填写盲注"} · {session.location || "未填写地点"}
                  </p>
                </div>
                <strong className={session.profit >= 0 ? "profit-plus" : "profit-minus"}>
                  {session.profit >= 0 ? "+" : ""}¥{session.profit.toFixed(2)}
                </strong>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function SessionsPage({
  sessions,
  onAddSession,
  onDeleteSession,
}: {
  sessions: PokerSession[];
  onAddSession: (session: PokerSession) => void;
  onDeleteSession: (id: string) => void;
}) {
  const [form, setForm] = useState<SessionForm>(emptySessionForm());

  function updateForm(field: keyof SessionForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const buyIn = Number(form.buyIn);
    const cashOut = Number(form.cashOut);
    const durationHours = Number(form.durationHours);

    if (!form.date || !form.buyIn || !form.cashOut || !form.durationHours) {
      alert("请至少填写日期、Buy in、Cash out 和时长。");
      return;
    }

    if (durationHours <= 0) {
      alert("时长必须大于 0。");
      return;
    }

    const profit = cashOut - buyIn;
    const hourlyRate = profit / durationHours;

    const newSession: PokerSession = {
      id: createId(),
      date: form.date,
      stake: form.stake,
      location: form.location,
      buyIn,
      cashOut,
      durationHours,
      profit,
      hourlyRate,
      mentalState: form.mentalState,
      tableQuality: form.tableQuality,
      notes: form.notes,
      createdAt: new Date().toISOString(),
    };

    onAddSession(newSession);
    setForm(emptySessionForm());
  }

  return (
    <main className="page">
      <h1>战绩</h1>
      <p className="subtitle">记录每一场 session 的盈亏、时长和状态。</p>

      <section className="card">
        <h2>新增场次</h2>

        <form className="session-form" onSubmit={handleSubmit}>
          <label className="field">
            日期
            <input type="date" value={form.date} onChange={(e) => updateForm("date", e.target.value)} />
          </label>

          <label className="field">
            盲注级别
            <input placeholder="例如 0.25/0.5" value={form.stake} onChange={(e) => updateForm("stake", e.target.value)} />
          </label>

          <label className="field">
            地点 / 平台
            <input placeholder="例如 home game / Pokernow" value={form.location} onChange={(e) => updateForm("location", e.target.value)} />
          </label>

          <div className="form-grid">
            <label className="field">
              Buy in
              <input type="number" step="0.01" value={form.buyIn} onChange={(e) => updateForm("buyIn", e.target.value)} />
            </label>

            <label className="field">
              Cash out
              <input type="number" step="0.01" value={form.cashOut} onChange={(e) => updateForm("cashOut", e.target.value)} />
            </label>
          </div>

          <label className="field">
            时长，小时
            <input type="number" step="0.1" placeholder="例如 3.5" value={form.durationHours} onChange={(e) => updateForm("durationHours", e.target.value)} />
          </label>

          <div className="form-grid">
            <label className="field">
              状态
              <select value={form.mentalState} onChange={(e) => updateForm("mentalState", e.target.value)}>
                <option value="">未选择</option>
                <option value="A-game">A-game</option>
                <option value="B-game">B-game</option>
                <option value="C-game">C-game</option>
                <option value="tilt">tilt</option>
              </select>
            </label>

            <label className="field">
              桌况
              <select value={form.tableQuality} onChange={(e) => updateForm("tableQuality", e.target.value)}>
                <option value="">未选择</option>
                <option value="soft">偏软</option>
                <option value="normal">普通</option>
                <option value="hard">偏硬</option>
              </select>
            </label>
          </div>

          <label className="field">
            备注
            <textarea placeholder="例如：今天有点乱打，river call 太多" value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} />
          </label>

          <button className="primary-button" type="submit">
            保存场次
          </button>
        </form>
      </section>

      <section className="card">
        <h2>场次列表</h2>

        {sessions.length === 0 ? (
          <p className="empty">暂无场次记录。</p>
        ) : (
          <div className="session-list">
            {sessions.map((session) => (
              <div className="session-card" key={session.id}>
                <div className="session-header">
                  <div>
                    <strong>{session.date}</strong>
                    <p>
                      {session.stake || "未填写盲注"} · {session.location || "未填写地点"}
                    </p>
                  </div>

                  <strong className={session.profit >= 0 ? "profit-plus" : "profit-minus"}>
                    {session.profit >= 0 ? "+" : ""}¥{session.profit.toFixed(2)}
                  </strong>
                </div>

                <div className="session-meta">
                  <span>Buy in：¥{session.buyIn.toFixed(2)}</span>
                  <span>Cash out：¥{session.cashOut.toFixed(2)}</span>
                  <span>时长：{session.durationHours.toFixed(1)}h</span>
                  <span>小时收益：¥{session.hourlyRate.toFixed(2)}/h</span>
                  {session.mentalState && <span>状态：{session.mentalState}</span>}
                  {session.tableQuality && <span>桌况：{session.tableQuality}</span>}
                </div>

                {session.notes && <p className="session-notes">{session.notes}</p>}

                <button className="danger-button" onClick={() => onDeleteSession(session.id)}>
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function HandsPage({
  sessions,
  hands,
  onAddHand,
  onDeleteHand,
}: {
  sessions: PokerSession[];
  hands: PokerHand[];
  onAddHand: (hand: PokerHand) => void;
  onDeleteHand: (id: string) => void;
}) {
  const [form, setForm] = useState<HandForm>(emptyHandForm());

  function updateForm(field: keyof HandForm, value: string | boolean) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSessionChange(sessionId: string) {
    const session = sessions.find((item) => item.id === sessionId);

    setForm((current) => ({
      ...current,
      sessionId,
      date: session?.date || current.date,
      stake: session?.stake || current.stake,
    }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!form.title.trim()) {
      alert("请填写牌谱标题。");
      return;
    }

    const result = form.result ? Number(form.result) : 0;

    const newHand: PokerHand = {
      id: createId(),
      sessionId: form.sessionId,
      title: form.title,
      date: form.date,
      stake: form.stake,
      position: form.position,
      heroCards: form.heroCards,
      board: form.board,
      effectiveStack: form.effectiveStack,
      result,
      preflopAction: form.preflopAction,
      flopAction: form.flopAction,
      turnAction: form.turnAction,
      riverAction: form.riverAction,
      thoughtProcess: form.thoughtProcess,
      review: form.review,
      mistakeTags: splitTags(form.mistakeTags),
      handTags: splitTags(form.handTags),
      isReviewed: form.isReviewed,
      createdAt: new Date().toISOString(),
    };

    onAddHand(newHand);
    setForm(emptyHandForm());
  }

  function getSessionLabel(sessionId: string) {
    const session = sessions.find((item) => item.id === sessionId);
    if (!session) return "未关联场次";
    return `${session.date} · ${session.stake || "未填写盲注"} · ${session.location || "未填写地点"}`;
  }

  return (
    <main className="page">
      <h1>牌谱</h1>
      <p className="subtitle">记录关键手牌，方便复盘自己的决策。</p>

      <section className="card">
        <h2>新增牌谱</h2>

        <form className="session-form" onSubmit={handleSubmit}>
          <label className="field">
            关联场次
            <select value={form.sessionId} onChange={(e) => handleSessionChange(e.target.value)}>
              <option value="">不关联场次</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.date} · {session.stake || "未填写盲注"} · {session.location || "未填写地点"}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            标题
            <input placeholder="例如 AKo 4bet pot turn 决策" value={form.title} onChange={(e) => updateForm("title", e.target.value)} />
          </label>

          <div className="form-grid">
            <label className="field">
              日期
              <input type="date" value={form.date} onChange={(e) => updateForm("date", e.target.value)} />
            </label>

            <label className="field">
              盲注
              <input placeholder="例如 0.25/0.5" value={form.stake} onChange={(e) => updateForm("stake", e.target.value)} />
            </label>
          </div>

          <div className="form-grid">
            <label className="field">
              位置
              <input placeholder="例如 BTN / BB" value={form.position} onChange={(e) => updateForm("position", e.target.value)} />
            </label>

            <label className="field">
              手牌
              <input placeholder="例如 AhKs" value={form.heroCards} onChange={(e) => updateForm("heroCards", e.target.value)} />
            </label>
          </div>

          <label className="field">
            公共牌
            <input placeholder="例如 K♠ 7♦ 2♣ / 5♠ / J♥" value={form.board} onChange={(e) => updateForm("board", e.target.value)} />
          </label>

          <div className="form-grid">
            <label className="field">
              有效筹码
              <input placeholder="例如 120bb" value={form.effectiveStack} onChange={(e) => updateForm("effectiveStack", e.target.value)} />
            </label>

            <label className="field">
              结果
              <input type="number" step="0.01" placeholder="例如 -35" value={form.result} onChange={(e) => updateForm("result", e.target.value)} />
            </label>
          </div>

          <label className="field">
            Preflop
            <textarea placeholder="例如 HJ open 2.5bb, Hero BTN 3bet 8bb, HJ call" value={form.preflopAction} onChange={(e) => updateForm("preflopAction", e.target.value)} />
          </label>

          <label className="field">
            Flop
            <textarea value={form.flopAction} onChange={(e) => updateForm("flopAction", e.target.value)} />
          </label>

          <label className="field">
            Turn
            <textarea value={form.turnAction} onChange={(e) => updateForm("turnAction", e.target.value)} />
          </label>

          <label className="field">
            River
            <textarea value={form.riverAction} onChange={(e) => updateForm("riverAction", e.target.value)} />
          </label>

          <label className="field">
            当时想法
            <textarea value={form.thoughtProcess} onChange={(e) => updateForm("thoughtProcess", e.target.value)} />
          </label>

          <label className="field">
            事后复盘
            <textarea value={form.review} onChange={(e) => updateForm("review", e.target.value)} />
          </label>

          <label className="field">
            错误标签
            <input placeholder="例如 过度诈唬, 河牌跟注太宽" value={form.mistakeTags} onChange={(e) => updateForm("mistakeTags", e.target.value)} />
          </label>

          <label className="field">
            手牌标签
            <input placeholder="例如 3bet pot, bluff catch, multiway" value={form.handTags} onChange={(e) => updateForm("handTags", e.target.value)} />
          </label>

          <label className="checkbox-field">
            <input type="checkbox" checked={form.isReviewed} onChange={(e) => updateForm("isReviewed", e.target.checked)} />
            已完成复盘
          </label>

          <button className="primary-button" type="submit">
            保存牌谱
          </button>
        </form>
      </section>

      <section className="card">
        <h2>牌谱列表</h2>

        {hands.length === 0 ? (
          <p className="empty">暂无牌谱记录。</p>
        ) : (
          <div className="hand-list">
            {hands.map((hand) => (
              <div className="hand-card" key={hand.id}>
                <div className="hand-header">
                  <div>
                    <strong>{hand.title}</strong>
                    <p>{getSessionLabel(hand.sessionId)}</p>
                  </div>

                  <strong className={hand.result >= 0 ? "profit-plus" : "profit-minus"}>
                    {hand.result >= 0 ? "+" : ""}¥{hand.result.toFixed(2)}
                  </strong>
                </div>

                <div className="session-meta">
                  {hand.position && <span>位置：{hand.position}</span>}
                  {hand.heroCards && <span>手牌：{hand.heroCards}</span>}
                  {hand.board && <span>公共牌：{hand.board}</span>}
                  {hand.effectiveStack && <span>有效筹码：{hand.effectiveStack}</span>}
                  <span>{hand.isReviewed ? "已复盘" : "未复盘"}</span>
                </div>

                {hand.mistakeTags.length > 0 && (
                  <div className="tag-row">
                    {hand.mistakeTags.map((tag) => (
                      <span className="mistake-tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {hand.handTags.length > 0 && (
                  <div className="tag-row">
                    {hand.handTags.map((tag) => (
                      <span className="normal-tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {hand.review && <p className="session-notes">复盘：{hand.review}</p>}

                <button className="danger-button" onClick={() => onDeleteHand(hand.id)}>
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function NotesPage() {
  return (
    <main className="page">
      <h1>学习笔记</h1>
      <p className="subtitle">整理策略、漏洞、复习内容和知识点。</p>

      <section className="card">
        <h2>笔记列表</h2>
        <p className="empty">暂无学习笔记。</p>
      </section>
    </main>
  );
}

function DashboardPage({
  sessions,
  hands,
}: {
  sessions: PokerSession[];
  hands: PokerHand[];
}) {
  const unreviewedHands = hands.filter((hand) => !hand.isReviewed).length;

  return (
    <main className="page">
      <h1>看板</h1>
      <p className="subtitle">查看盈利趋势、错误标签和学习进度。</p>

      <section className="stats-grid">
        <div className="stat-card">
          <span>场次数</span>
          <strong>{sessions.length}</strong>
        </div>
        <div className="stat-card">
          <span>牌谱数</span>
          <strong>{hands.length}</strong>
        </div>
        <div className="stat-card">
          <span>待复盘</span>
          <strong>{unreviewedHands}</strong>
        </div>
        <div className="stat-card">
          <span>已复盘</span>
          <strong>{hands.length - unreviewedHands}</strong>
        </div>
      </section>

      <section className="card">
        <h2>数据分析</h2>
        <p className="empty">下一步会在这里加入盈利曲线和错误标签统计。</p>
      </section>
    </main>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
const [sessions, setSessions] = useState<PokerSession[]>(loadSessions);
const [hands, setHands] = useState<PokerHand[]>(loadHands);

  

  useEffect(() => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(HANDS_KEY, JSON.stringify(hands));
  }, [hands]);

  function addSession(session: PokerSession) {
    setSessions((current) => [session, ...current]);
  }

  function deleteSession(id: string) {
    const confirmed = confirm("确定要删除这条场次记录吗？关联的牌谱不会被删除。");
    if (!confirmed) return;

    setSessions((current) => current.filter((session) => session.id !== id));
  }

  function addHand(hand: PokerHand) {
    setHands((current) => [hand, ...current]);
  }

  function deleteHand(id: string) {
    const confirmed = confirm("确定要删除这条牌谱记录吗？");
    if (!confirmed) return;

    setHands((current) => current.filter((hand) => hand.id !== id));
  }

  return (
    <div className="app-shell">
      {page === "home" && (
        <HomePage
          sessions={sessions}
          hands={hands}
          goToSessions={() => setPage("sessions")}
          goToHands={() => setPage("hands")}
        />
      )}

      {page === "sessions" && (
        <SessionsPage
          sessions={sessions}
          onAddSession={addSession}
          onDeleteSession={deleteSession}
        />
      )}

      {page === "hands" && (
        <HandsPage
          sessions={sessions}
          hands={hands}
          onAddHand={addHand}
          onDeleteHand={deleteHand}
        />
      )}

      {page === "notes" && <NotesPage />}

      {page === "dashboard" && <DashboardPage sessions={sessions} hands={hands} />}

      <nav className="bottom-nav">
        <button className={page === "home" ? "active" : ""} onClick={() => setPage("home")}>
          <span>🏠</span>
          首页
        </button>

        <button className={page === "sessions" ? "active" : ""} onClick={() => setPage("sessions")}>
          <span>🏆</span>
          战绩
        </button>

        <button className={page === "hands" ? "active" : ""} onClick={() => setPage("hands")}>
          <span>🃏</span>
          牌谱
        </button>

        <button className={page === "notes" ? "active" : ""} onClick={() => setPage("notes")}>
          <span>📘</span>
          笔记
        </button>

        <button className={page === "dashboard" ? "active" : ""} onClick={() => setPage("dashboard")}>
          <span>📊</span>
          看板
        </button>
      </nav>
    </div>
  );
}