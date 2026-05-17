import { useState, type FormEvent } from "react";
import type { PokerSession, SessionForm, ShareholderForm } from "../types";

type SessionsPageProps = {
  sessions: PokerSession[];
  isFormOpen: boolean;
  onToggleForm: () => void;
  onCloseForm: () => void;
  onAddSession: (session: PokerSession) => void;
  onDeleteSession: (id: string) => void;
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function createId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return String(Date.now() + Math.random());
}

function createEmptyShareholder(): ShareholderForm {
  return {
    id: createId(),
    name: "",
    percent: "",
  };
}

function emptySessionForm(): SessionForm {
  return {
    date: getToday(),
    stake: "",
    playMode: "offline",
    buyIn: "",
    cashOut: "",
    durationHours: "",
    hasShares: false,
    shareholders: [createEmptyShareholder()],
    notes: "",
  };
}

function getPlayModeLabel(playMode: string) {
  return playMode === "online" ? "线上" : "线下";
}

export function SessionsPage({
  sessions,
  isFormOpen,
  onToggleForm,
  onCloseForm,
  onAddSession,
  onDeleteSession,
}: SessionsPageProps) {
  const [form, setForm] = useState<SessionForm>(emptySessionForm());

  function updateForm(field: keyof SessionForm, value: string | boolean) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateShareholder(
    shareholderId: string,
    field: keyof ShareholderForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      shareholders: current.shareholders.map((shareholder) =>
        shareholder.id === shareholderId
          ? {
              ...shareholder,
              [field]: value,
            }
          : shareholder
      ),
    }));
  }

  function addShareholder() {
    setForm((current) => ({
      ...current,
      shareholders: [...current.shareholders, createEmptyShareholder()],
    }));
  }

  function removeShareholder(shareholderId: string) {
    setForm((current) => ({
      ...current,
      shareholders:
        current.shareholders.length <= 1
          ? [createEmptyShareholder()]
          : current.shareholders.filter(
              (shareholder) => shareholder.id !== shareholderId
            ),
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

    const grossProfit = cashOut - buyIn;

    const shareholders = form.hasShares
      ? form.shareholders
          .map((shareholder) => ({
            id: shareholder.id,
            name: shareholder.name.trim(),
            percent: Number(shareholder.percent),
          }))
          .filter((shareholder) => shareholder.name && shareholder.percent > 0)
      : [];

    const totalSharePercent = shareholders.reduce(
      (sum, shareholder) => sum + shareholder.percent,
      0
    );

    if (form.hasShares && shareholders.length === 0) {
      alert("你已开启股份，请至少填写一个股东和占股比例。");
      return;
    }

    if (totalSharePercent >= 100) {
      alert("股东总占股不能大于或等于 100%。");
      return;
    }

    const shareholdersWithAmount = shareholders.map((shareholder) => ({
      ...shareholder,
      amount: grossProfit * (shareholder.percent / 100),
    }));

    const shareholderAmount = shareholdersWithAmount.reduce(
      (sum, shareholder) => sum + shareholder.amount,
      0
    );

    const profit = grossProfit - shareholderAmount;
    const hourlyRate = profit / durationHours;

    const newSession: PokerSession = {
      id: createId(),
      date: form.date,
      stake: form.stake,
      playMode: form.playMode,
      location: "",
      buyIn,
      cashOut,
      durationHours,
      grossProfit,
      profit,
      hourlyRate,
      shareholders: shareholdersWithAmount,
      mentalState: "",
      tableQuality: "",
      notes: form.notes,
      createdAt: new Date().toISOString(),
    };

    onAddSession(newSession);
    setForm(emptySessionForm());
    onCloseForm();
  }

  return (
    <main className="page">
      <h1>战绩</h1>
      <p className="subtitle">记录每一场 session 的盈亏、时长和状态。</p>

      <section className="card">
        <button className="collapse-button" type="button" onClick={onToggleForm}>
          <span>新增场次</span>
          <em>{isFormOpen ? "收起" : "展开"}</em>
        </button>

        {isFormOpen && (
          <form className="session-form collapsible-form" onSubmit={handleSubmit}>
            <label className="field">
              日期
              <input
                type="date"
                value={form.date}
                onChange={(e) => updateForm("date", e.target.value)}
              />
            </label>

            <label className="field">
              盲注级别
              <input
                placeholder="例如 0.25/0.5"
                value={form.stake}
                onChange={(e) => updateForm("stake", e.target.value)}
              />
            </label>

            <label className="field">
              类型
              <select
                value={form.playMode}
                onChange={(e) => updateForm("playMode", e.target.value)}
              >
                <option value="offline">线下</option>
                <option value="online">线上</option>
              </select>
            </label>

            <div className="form-grid">
              <label className="field">
                Buy in
                <input
                  type="number"
                  step="0.01"
                  value={form.buyIn}
                  onChange={(e) => updateForm("buyIn", e.target.value)}
                />
              </label>

              <label className="field">
                Cash out
                <input
                  type="number"
                  step="0.01"
                  value={form.cashOut}
                  onChange={(e) => updateForm("cashOut", e.target.value)}
                />
              </label>
            </div>

            <label className="field">
              时长，小时
              <input
                type="number"
                step="0.1"
                placeholder="例如 3.5"
                value={form.durationHours}
                onChange={(e) => updateForm("durationHours", e.target.value)}
              />
            </label>

            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={form.hasShares}
                onChange={(e) => updateForm("hasShares", e.target.checked)}
              />
              这场有股份
            </label>

            {form.hasShares && (
              <section className="shareholder-box">
                <div className="shareholder-title-row">
                  <strong>股份信息</strong>
                  <button type="button" onClick={addShareholder}>
                    ＋ 加股东
                  </button>
                </div>

                {form.shareholders.map((shareholder) => (
                  <div className="shareholder-row" key={shareholder.id}>
                    <label className="field">
                      股东
                      <input
                        placeholder="例如 小明"
                        value={shareholder.name}
                        onChange={(e) =>
                          updateShareholder(
                            shareholder.id,
                            "name",
                            e.target.value
                          )
                        }
                      />
                    </label>

                    <label className="field">
                      占股 %
                      <input
                        type="number"
                        step="0.1"
                        placeholder="例如 30"
                        value={shareholder.percent}
                        onChange={(e) =>
                          updateShareholder(
                            shareholder.id,
                            "percent",
                            e.target.value
                          )
                        }
                      />
                    </label>

                    <button
                      className="remove-shareholder-button"
                      type="button"
                      onClick={() => removeShareholder(shareholder.id)}
                    >
                      删除股东
                    </button>
                  </div>
                ))}

                <p className="shareholder-tip">
                  系统会按原始盈亏计算股东分成，然后显示你的实际盈亏。
                </p>
              </section>
            )}

            <label className="field">
              备注
              <textarea
                placeholder="例如：今天有点乱打，river call 太多"
                value={form.notes}
                onChange={(e) => updateForm("notes", e.target.value)}
              />
            </label>

            <button className="primary-button" type="submit">
              保存场次
            </button>
          </form>
        )}
      </section>

      <section className="card">
        <h2>场次列表</h2>

        {sessions.length === 0 ? (
          <p className="empty">暂无场次记录。</p>
        ) : (
          <div className="session-list">
            {sessions.map((session) => {
              const grossProfit = session.grossProfit ?? session.profit;
              const shareholders = session.shareholders ?? [];

              return (
                <div className="session-card" key={session.id}>
                  <div className="session-header">
                    <div>
                      <strong>{session.date}</strong>
                      <p>
                        {session.stake || "未填写盲注"} ·{" "}
                        {getPlayModeLabel(session.playMode)}
                      </p>
                    </div>

                    <strong
                      className={
                        session.profit >= 0 ? "profit-plus" : "profit-minus"
                      }
                    >
                      {session.profit >= 0 ? "+" : ""}¥
                      {session.profit.toFixed(2)}
                    </strong>
                  </div>

                  <div className="session-meta">
                    <span>Buy in：¥{session.buyIn.toFixed(2)}</span>
                    <span>Cash out：¥{session.cashOut.toFixed(2)}</span>
                    <span>原始盈亏：¥{grossProfit.toFixed(2)}</span>
                    <span>我的盈亏：¥{session.profit.toFixed(2)}</span>
                    <span>时长：{session.durationHours.toFixed(1)}h</span>
                    <span>小时收益：¥{session.hourlyRate.toFixed(2)}/h</span>
                    <span>{getPlayModeLabel(session.playMode)}</span>
                  </div>

                  {shareholders.length > 0 && (
                    <div className="shareholder-summary">
                      <strong>股份：</strong>
                      {shareholders.map((shareholder) => (
                        <span key={shareholder.id}>
                          {shareholder.name} {shareholder.percent}%：
                          {shareholder.amount >= 0 ? "+" : ""}¥
                          {shareholder.amount.toFixed(2)}
                        </span>
                      ))}
                    </div>
                  )}

                  {session.notes && (
                    <p className="session-notes">{session.notes}</p>
                  )}

                  <button
                    className="danger-button"
                    onClick={() => onDeleteSession(session.id)}
                  >
                    删除
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}