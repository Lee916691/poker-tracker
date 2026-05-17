import { useMemo, useState, type FormEvent } from "react";
import type { MahjongForm, MahjongSession } from "../types";

type MahjongPageProps = {
  mahjongSessions: MahjongSession[];
  onAddMahjongSession: (session: MahjongSession) => void;
  onDeleteMahjongSession: (id: string) => void;
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function createId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return String(Date.now() + Math.random());
}

function emptyMahjongForm(): MahjongForm {
  return {
    date: getToday(),
    mahjongType: "",
    winLoss: "",
    durationHours: "",
    tableFee: "",
  };
}

function formatMoney(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}¥${value.toFixed(2)}`;
}

export function MahjongPage({
  mahjongSessions,
  onAddMahjongSession,
  onDeleteMahjongSession,
}: MahjongPageProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<MahjongForm>(emptyMahjongForm());

  function updateForm(field: keyof MahjongForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const currentMonth = today.slice(0, 7);

    const monthSessions = mahjongSessions.filter((session) =>
      session.date.startsWith(currentMonth)
    );

    const monthProfit = monthSessions.reduce(
      (sum, session) => sum + session.profit,
      0
    );

    const monthHours = monthSessions.reduce(
      (sum, session) => sum + session.durationHours,
      0
    );

    const monthHourlyRate = monthHours > 0 ? monthProfit / monthHours : 0;

    const totalProfit = mahjongSessions.reduce(
      (sum, session) => sum + session.profit,
      0
    );

    const totalHours = mahjongSessions.reduce(
      (sum, session) => sum + session.durationHours,
      0
    );

    return {
      monthProfit,
      monthHours,
      monthHourlyRate,
      totalProfit,
      totalHours,
      totalCount: mahjongSessions.length,
    };
  }, [mahjongSessions]);

  const monthlyStats = useMemo(() => {
    const monthlyMap = new Map<
      string,
      {
        month: string;
        profit: number;
        hours: number;
        count: number;
        tableFee: number;
      }
    >();

    mahjongSessions.forEach((session) => {
      const month = session.date.slice(0, 7);
      const current = monthlyMap.get(month) || {
        month,
        profit: 0,
        hours: 0,
        count: 0,
        tableFee: 0,
      };

      monthlyMap.set(month, {
        month,
        profit: current.profit + session.profit,
        hours: current.hours + session.durationHours,
        count: current.count + 1,
        tableFee: current.tableFee + session.tableFee,
      });
    });

    return Array.from(monthlyMap.values()).sort((a, b) =>
      b.month.localeCompare(a.month)
    );
  }, [mahjongSessions]);

  const maxAbsMonthlyProfit = Math.max(
    1,
    ...monthlyStats.map((item) => Math.abs(item.profit))
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const winLoss = Number(form.winLoss);
    const durationHours = Number(form.durationHours);
    const tableFee = form.tableFee ? Number(form.tableFee) : 0;

    if (!form.date || !form.winLoss || !form.durationHours) {
      alert("请至少填写日期、输赢和时长。");
      return;
    }

    if (durationHours <= 0) {
      alert("时长必须大于 0。");
      return;
    }

    if (tableFee < 0) {
      alert("台费不能小于 0。");
      return;
    }

    const profit = winLoss - tableFee;
    const hourlyRate = profit / durationHours;

    const newSession: MahjongSession = {
      id: createId(),
      date: form.date,
      mahjongType: form.mahjongType,
      winLoss,
      durationHours,
      tableFee,
      profit,
      hourlyRate,
      createdAt: new Date().toISOString(),
    };

    onAddMahjongSession(newSession);
    setForm(emptyMahjongForm());
    setIsFormOpen(false);
  }

  return (
    <main className="page">
      <h1>麻将</h1>
      <p className="subtitle">简单记录麻将场次、输赢、时长和台费。</p>

      <section className="card">
        <div className="mahjong-mini-stats">
          <div>
            <span>本月总盈亏</span>
            <strong className={stats.monthProfit >= 0 ? "profit-plus" : "profit-minus"}>
              {formatMoney(stats.monthProfit)}
            </strong>
          </div>

          <div>
            <span>本月小时盈亏</span>
            <strong
              className={
                stats.monthHourlyRate >= 0 ? "profit-plus" : "profit-minus"
              }
            >
              ¥{stats.monthHourlyRate.toFixed(2)}/h
            </strong>
          </div>

          <div>
            <span>总场次</span>
            <strong>{stats.totalCount}</strong>
          </div>

          <div>
            <span>总盈亏</span>
            <strong className={stats.totalProfit >= 0 ? "profit-plus" : "profit-minus"}>
              {formatMoney(stats.totalProfit)}
            </strong>
          </div>
        </div>
      </section>

      <section className="card">
        <button
          className="collapse-button"
          type="button"
          onClick={() => setIsFormOpen((current) => !current)}
        >
          <span>新增麻将场次</span>
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
              麻将类型
              <input
                placeholder="例如 广东麻将 / 国标 / 血战 / 朋友局"
                value={form.mahjongType}
                onChange={(e) => updateForm("mahjongType", e.target.value)}
              />
            </label>

            <div className="form-grid">
              <label className="field">
                输赢
                <input
                  type="number"
                  step="0.01"
                  placeholder="例如 200 或 -100"
                  value={form.winLoss}
                  onChange={(e) => updateForm("winLoss", e.target.value)}
                />
              </label>

              <label className="field">
                台费
                <input
                  type="number"
                  step="0.01"
                  placeholder="例如 50"
                  value={form.tableFee}
                  onChange={(e) => updateForm("tableFee", e.target.value)}
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

            <button className="primary-button" type="submit">
              保存麻将场次
            </button>
          </form>
        )}
      </section>

      <section className="card">
        <h2>麻将记录</h2>

        {mahjongSessions.length === 0 ? (
          <p className="empty">暂无麻将记录。</p>
        ) : (
          <div className="session-list">
            {mahjongSessions.map((session) => (
              <div className="session-card" key={session.id}>
                <div className="session-header">
                  <div>
                    <strong>{session.date}</strong>
                    <p>{session.mahjongType || "未填写类型"}</p>
                  </div>

                  <strong
                    className={session.profit >= 0 ? "profit-plus" : "profit-minus"}
                  >
                    {formatMoney(session.profit)}
                  </strong>
                </div>

                <div className="session-meta">
                  <span>输赢：{formatMoney(session.winLoss)}</span>
                  <span>台费：¥{session.tableFee.toFixed(2)}</span>
                  <span>实际盈亏：{formatMoney(session.profit)}</span>
                  <span>时长：{session.durationHours.toFixed(1)}h</span>
                  <span>小时盈亏：¥{session.hourlyRate.toFixed(2)}/h</span>
                </div>

                <button
                  className="danger-button"
                  onClick={() => onDeleteMahjongSession(session.id)}
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2>月度盈亏</h2>

        {monthlyStats.length === 0 ? (
          <p className="empty">有麻将记录后，这里会显示每月盈亏。</p>
        ) : (
          <div className="monthly-list">
            {monthlyStats.map((item) => {
              const barWidth = `${(Math.abs(item.profit) / maxAbsMonthlyProfit) * 100}%`;
              const hourlyRate = item.hours > 0 ? item.profit / item.hours : 0;

              return (
                <div className="monthly-item" key={item.month}>
                  <div className="monthly-row">
                    <strong>{item.month}</strong>
                    <span className={item.profit >= 0 ? "profit-plus" : "profit-minus"}>
                      {formatMoney(item.profit)} · {item.count} 场
                    </span>
                  </div>

                  <div className="bar-track">
                    <div
                      className={
                        item.profit >= 0 ? "bar-fill plus" : "bar-fill minus"
                      }
                      style={{ width: barWidth }}
                    />
                  </div>

                  <p className="mahjong-month-detail">
                    时长 {item.hours.toFixed(1)}h · 小时盈亏 ¥
                    {hourlyRate.toFixed(2)}/h · 台费 ¥{item.tableFee.toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}