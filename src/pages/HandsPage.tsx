import { useState, type FormEvent } from "react";
import type { HandForm, PokerHand, PokerSession } from "../types";

type HandsPageProps = {
  sessions: PokerSession[];
  hands: PokerHand[];
  isFormOpen: boolean;
  onToggleForm: () => void;
  onCloseForm: () => void;
  onAddHand: (hand: PokerHand) => void;
  onDeleteHand: (id: string) => void;
};

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

export function HandsPage({
  sessions,
  hands,
  isFormOpen,
  onToggleForm,
  onCloseForm,
  onAddHand,
  onDeleteHand,
}: HandsPageProps) {
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
    onCloseForm();
  }

  function getSessionLabel(sessionId: string) {
    const session = sessions.find((item) => item.id === sessionId);
    if (!session) return "未关联场次";
    return `${session.date} · ${session.stake || "未填写盲注"} · ${
      session.location || "未填写地点"
    }`;
  }

  return (
    <main className="page">
      <h1>牌谱</h1>
      <p className="subtitle">记录关键手牌，方便复盘自己的决策。</p>

      <section className="card">
    <button className="collapse-button" type="button" onClick={onToggleForm}>
    <span>新增牌谱</span>
    <em>{isFormOpen ? "收起" : "展开"}</em>
  </button>

  {isFormOpen && (
    <form className="session-form collapsible-form" onSubmit={handleSubmit}>
          <label className="field">
            关联场次
            <select
              value={form.sessionId}
              onChange={(e) => handleSessionChange(e.target.value)}
            >
              <option value="">不关联场次</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.date} · {session.stake || "未填写盲注"} ·{" "}
                  {session.location || "未填写地点"}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            标题
            <input
              placeholder="例如 AKo 4bet pot turn 决策"
              value={form.title}
              onChange={(e) => updateForm("title", e.target.value)}
            />
          </label>

          <div className="form-grid">
            <label className="field">
              日期
              <input
                type="date"
                value={form.date}
                onChange={(e) => updateForm("date", e.target.value)}
              />
            </label>

            <label className="field">
              盲注
              <input
                placeholder="例如 0.25/0.5"
                value={form.stake}
                onChange={(e) => updateForm("stake", e.target.value)}
              />
            </label>
          </div>

          <div className="form-grid">
            <label className="field">
              位置
              <input
                placeholder="例如 BTN / BB"
                value={form.position}
                onChange={(e) => updateForm("position", e.target.value)}
              />
            </label>

            <label className="field">
              手牌
              <input
                placeholder="例如 AhKs"
                value={form.heroCards}
                onChange={(e) => updateForm("heroCards", e.target.value)}
              />
            </label>
          </div>

          <label className="field">
            公共牌
            <input
              placeholder="例如 K♠ 7♦ 2♣ / 5♠ / J♥"
              value={form.board}
              onChange={(e) => updateForm("board", e.target.value)}
            />
          </label>

          <div className="form-grid">
            <label className="field">
              有效筹码
              <input
                placeholder="例如 120bb"
                value={form.effectiveStack}
                onChange={(e) => updateForm("effectiveStack", e.target.value)}
              />
            </label>

            <label className="field">
              结果
              <input
                type="number"
                step="0.01"
                placeholder="例如 -35"
                value={form.result}
                onChange={(e) => updateForm("result", e.target.value)}
              />
            </label>
          </div>

          <label className="field">
            Preflop
            <textarea
              placeholder="例如 HJ open 2.5bb, Hero BTN 3bet 8bb, HJ call"
              value={form.preflopAction}
              onChange={(e) => updateForm("preflopAction", e.target.value)}
            />
          </label>

          <label className="field">
            Flop
            <textarea
              value={form.flopAction}
              onChange={(e) => updateForm("flopAction", e.target.value)}
            />
          </label>

          <label className="field">
            Turn
            <textarea
              value={form.turnAction}
              onChange={(e) => updateForm("turnAction", e.target.value)}
            />
          </label>

          <label className="field">
            River
            <textarea
              value={form.riverAction}
              onChange={(e) => updateForm("riverAction", e.target.value)}
            />
          </label>

          <label className="field">
            当时想法
            <textarea
              value={form.thoughtProcess}
              onChange={(e) => updateForm("thoughtProcess", e.target.value)}
            />
          </label>

          <label className="field">
            事后复盘
            <textarea
              value={form.review}
              onChange={(e) => updateForm("review", e.target.value)}
            />
          </label>

          <label className="field">
            错误标签
            <input
              placeholder="例如 过度诈唬, 河牌跟注太宽"
              value={form.mistakeTags}
              onChange={(e) => updateForm("mistakeTags", e.target.value)}
            />
          </label>

          <label className="field">
            手牌标签
            <input
              placeholder="例如 3bet pot, bluff catch, multiway"
              value={form.handTags}
              onChange={(e) => updateForm("handTags", e.target.value)}
            />
          </label>

          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={form.isReviewed}
              onChange={(e) => updateForm("isReviewed", e.target.checked)}
            />
            已完成复盘
          </label>

          <button className="primary-button" type="submit">
            保存牌谱
          </button>
        </form>
       )}
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

                  <strong
                    className={hand.result >= 0 ? "profit-plus" : "profit-minus"}
                  >
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

                <button
                  className="danger-button"
                  onClick={() => onDeleteHand(hand.id)}
                >
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