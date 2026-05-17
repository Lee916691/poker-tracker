import { useMemo } from "react";
import type { PokerHand, PokerNote, PokerSession } from "../types";

type HomePageProps = {
  sessions: PokerSession[];
  hands: PokerHand[];
  notes: PokerNote[];
  goToAddSession: () => void;
  goToAddHand: () => void;
  goToAddNote: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
};

function formatMoney(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}¥${value.toFixed(2)}`;
}

export function HomePage({
  sessions,
  hands,
  notes,
  goToAddSession,
  goToAddHand,
  goToAddNote,
  onExportData,
  onImportData,
}: HomePageProps) {
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

  const today = new Date().toISOString().slice(0, 10);

  const dueNotes = notes
    .filter(
      (note) =>
        note.nextReviewDate &&
        note.nextReviewDate <= today &&
        note.mastery !== "known"
    )
    .slice(0, 5);

  const topMistakeTags = useMemo(() => {
    const mistakeTagCounts = new Map<string, number>();

    hands.forEach((hand) => {
      hand.mistakeTags.forEach((tag) => {
        mistakeTagCounts.set(tag, (mistakeTagCounts.get(tag) || 0) + 1);
      });
    });

    return Array.from(mistakeTagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [hands]);

  const monthlyStats = useMemo(() => {
    const monthlyMap = new Map<
      string,
      {
        month: string;
        profit: number;
        count: number;
      }
    >();

    sessions.forEach((session) => {
      const month = session.date.slice(0, 7);
      const current = monthlyMap.get(month) || {
        month,
        profit: 0,
        count: 0,
      };

      monthlyMap.set(month, {
        month,
        profit: current.profit + session.profit,
        count: current.count + 1,
      });
    });

    return Array.from(monthlyMap.values())
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 6);
  }, [sessions]);

  const maxAbsMonthlyProfit = Math.max(
    1,
    ...monthlyStats.map((item) => Math.abs(item.profit))
  );

  return (
    <main className="page">
      <h1>扑克成长系统</h1>
      <p className="subtitle">记录战绩、复盘牌谱、管理学习笔记。</p>

      <section className="stats-grid">
        <div className="stat-card">
          <span>总盈利</span>
          <strong className={stats.totalProfit >= 0 ? "profit-plus" : "profit-minus"}>
            {formatMoney(stats.totalProfit)}
          </strong>
        </div>

        <div className="stat-card">
          <span>本月盈利</span>
          <strong className={stats.monthProfit >= 0 ? "profit-plus" : "profit-minus"}>
            {formatMoney(stats.monthProfit)}
          </strong>
        </div>

        <div className="stat-card">
          <span>总时长</span>
          <strong>{stats.totalHours.toFixed(1)}h</strong>
        </div>

        <div className="stat-card">
          <span>小时收益</span>
          <strong className={stats.hourlyRate >= 0 ? "profit-plus" : "profit-minus"}>
            ¥{stats.hourlyRate.toFixed(2)}/h
          </strong>
        </div>

        <div className="stat-card">
          <span>牌谱复盘</span>
          <strong>
            {reviewedHands}/{hands.length}
          </strong>
        </div>

        <div className="stat-card">
          <span>学习笔记</span>
          <strong>{notes.length}</strong>
        </div>
      </section>

      <section className="card">
        <h2>快速新增</h2>

        <div className="quick-actions">
          <button onClick={goToAddSession}>＋ 新增场次</button>
          <button onClick={goToAddHand}>＋ 新增牌谱</button>
          <button onClick={goToAddNote}>＋ 新增笔记</button>
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
                    {session.stake || "未填写盲注"} ·{" "}
                    {session.playMode === "online" ? "线上" : "线下"}
                  </p>
                </div>

                <strong className={session.profit >= 0 ? "profit-plus" : "profit-minus"}>
                  {formatMoney(session.profit)}
                </strong>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2>最近月度盈利</h2>

        {monthlyStats.length === 0 ? (
          <p className="empty">有战绩记录后，这里会显示月度盈亏。</p>
        ) : (
          <div className="monthly-list">
            {monthlyStats.map((item) => {
              const barWidth = `${(Math.abs(item.profit) / maxAbsMonthlyProfit) * 100}%`;

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
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="card">
        <h2>高频错误标签</h2>

        {topMistakeTags.length === 0 ? (
          <p className="empty">牌谱里添加错误标签后，这里会自动统计。</p>
        ) : (
          <div className="mistake-rank-list">
            {topMistakeTags.map((item, index) => (
              <div className="mistake-rank-item" key={item.tag}>
                <span>#{index + 1}</span>
                <strong>{item.tag}</strong>
                <em>{item.count} 次</em>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2>待复习笔记</h2>

        {dueNotes.length === 0 ? (
          <p className="empty">暂时没有到期需要复习的笔记。</p>
        ) : (
          <div className="note-review-list">
            {dueNotes.map((note) => (
              <div className="note-review-item" key={note.id}>
                <strong>{note.title}</strong>
                <p>
                  {note.category || "未分类"} · 复习日期：{note.nextReviewDate}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2>数据备份</h2>
        <p className="empty backup-tip">
          建议定期导出备份，防止浏览器缓存清理后数据丢失。
        </p>

        <div className="backup-actions">
          <button className="primary-button" onClick={onExportData}>
            导出备份
          </button>

          <label className="import-button">
            导入备份
            <input
              type="file"
              accept="application/json"
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (file) {
                  onImportData(file);
                  e.target.value = "";
                }
              }}
            />
          </label>
        </div>
      </section>

    </main>
  );
}