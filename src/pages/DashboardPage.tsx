import type { PokerHand, PokerNote, PokerSession } from "../types";

type DashboardPageProps = {
  sessions: PokerSession[];
  hands: PokerHand[];
  notes: PokerNote[];
  onExportData: () => void;
  onImportData: (file: File) => void;
};

function formatMoney(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}¥${value.toFixed(2)}`;
}

export function DashboardPage({
  sessions,
  hands,
  notes,
  onExportData,
  onImportData,
}: DashboardPageProps) {
  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = today.slice(0, 7);

  const totalProfit = sessions.reduce((sum, session) => sum + session.profit, 0);
  const totalHours = sessions.reduce(
    (sum, session) => sum + session.durationHours,
    0
  );
  const hourlyRate = totalHours > 0 ? totalProfit / totalHours : 0;

  const monthProfit = sessions
    .filter((session) => session.date.startsWith(currentMonth))
    .reduce((sum, session) => sum + session.profit, 0);

  const unreviewedHands = hands.filter((hand) => !hand.isReviewed).length;

  const dueNotes = notes
    .filter(
      (note) =>
        note.nextReviewDate &&
        note.nextReviewDate <= today &&
        note.mastery !== "known"
    )
    .slice(0, 5);

  const mistakeTagCounts = new Map<string, number>();

  hands.forEach((hand) => {
    hand.mistakeTags.forEach((tag) => {
      mistakeTagCounts.set(tag, (mistakeTagCounts.get(tag) || 0) + 1);
    });
  });

  const topMistakeTags = Array.from(mistakeTagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const monthlyMap = new Map<string, { month: string; profit: number; count: number }>();

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

  const monthlyStats = Array.from(monthlyMap.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6);

  const maxAbsMonthlyProfit = Math.max(
    1,
    ...monthlyStats.map((item) => Math.abs(item.profit))
  );

  return (
    <main className="page">
      <h1>看板</h1>
      <p className="subtitle">查看盈利趋势、错误标签和学习进度。</p>

      <section className="stats-grid">
        <div className="stat-card">
          <span>总盈利</span>
          <strong className={totalProfit >= 0 ? "profit-plus" : "profit-minus"}>
            {formatMoney(totalProfit)}
          </strong>
        </div>

        <div className="stat-card">
          <span>本月盈利</span>
          <strong className={monthProfit >= 0 ? "profit-plus" : "profit-minus"}>
            {formatMoney(monthProfit)}
          </strong>
        </div>

        <div className="stat-card">
          <span>总时长</span>
          <strong>{totalHours.toFixed(1)}h</strong>
        </div>

        <div className="stat-card">
          <span>小时收益</span>
          <strong className={hourlyRate >= 0 ? "profit-plus" : "profit-minus"}>
            ¥{hourlyRate.toFixed(2)}/h
          </strong>
        </div>

        <div className="stat-card">
          <span>场次数</span>
          <strong>{sessions.length}</strong>
        </div>

        <div className="stat-card">
          <span>牌谱数</span>
          <strong>{hands.length}</strong>
        </div>

        <div className="stat-card">
          <span>待复盘牌谱</span>
          <strong>{unreviewedHands}</strong>
        </div>

        <div className="stat-card">
          <span>学习笔记</span>
          <strong>{notes.length}</strong>
        </div>
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
                    <span
                      className={
                        item.profit >= 0 ? "profit-plus" : "profit-minus"
                      }
                    >
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
    </main>
  );
}