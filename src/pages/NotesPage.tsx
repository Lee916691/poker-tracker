import { useState, type FormEvent } from "react";
import type { NoteForm, PokerHand, PokerNote } from "../types";

type NotesPageProps = {
  notes: PokerNote[];
  hands: PokerHand[];
  isFormOpen: boolean;
  onToggleForm: () => void;
  onCloseForm: () => void;
  onAddNote: (note: PokerNote) => void;
  onDeleteNote: (id: string) => void;
};

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

function emptyNoteForm(): NoteForm {
  return {
    title: "",
    category: "",
    tags: "",
    content: "",
    source: "",
    importance: "medium",
    mastery: "learning",
    nextReviewDate: "",
    relatedHandIds: [],
  };
}

export function NotesPage({
  notes,
  hands,
  isFormOpen,
  onToggleForm,
  onCloseForm,
  onAddNote,
  onDeleteNote,
}: NotesPageProps) {
  const [form, setForm] = useState<NoteForm>(emptyNoteForm());

  function updateForm(field: keyof NoteForm, value: string | string[]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function toggleRelatedHand(handId: string) {
    setForm((current) => {
      const alreadySelected = current.relatedHandIds.includes(handId);

      return {
        ...current,
        relatedHandIds: alreadySelected
          ? current.relatedHandIds.filter((id) => id !== handId)
          : [...current.relatedHandIds, handId],
      };
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!form.title.trim()) {
      alert("请填写笔记标题。");
      return;
    }

    if (!form.content.trim()) {
      alert("请填写笔记内容。");
      return;
    }

    const now = new Date().toISOString();

    const newNote: PokerNote = {
      id: createId(),
      title: form.title,
      category: form.category,
      tags: splitTags(form.tags),
      content: form.content,
      source: form.source,
      importance: form.importance,
      mastery: form.mastery,
      nextReviewDate: form.nextReviewDate,
      relatedHandIds: form.relatedHandIds,
      createdAt: now,
      updatedAt: now,
    };

    onAddNote(newNote);
    setForm(emptyNoteForm());
    onCloseForm();
  }

  function getHandTitle(handId: string) {
    const hand = hands.find((item) => item.id === handId);
    if (!hand) return "已删除的牌谱";
    return hand.title;
  }

  return (
    <main className="page">
      <h1>学习笔记</h1>
      <p className="subtitle">整理策略、漏洞、复习内容和知识点。</p>

<section className="card">
  <button className="collapse-button" type="button" onClick={onToggleForm}>
    <span>新增笔记</span>
    <em>{isFormOpen ? "收起" : "展开"}</em>
  </button>

  {isFormOpen && (
    <form className="session-form collapsible-form" onSubmit={handleSubmit}>
          <label className="field">
            标题
            <input
              placeholder="例如 河牌 bluff catch 逻辑"
              value={form.title}
              onChange={(e) => updateForm("title", e.target.value)}
            />
          </label>

          <label className="field">
            分类
            <input
              placeholder="例如 河牌决策 / 3bet pot / Tilt 管理"
              value={form.category}
              onChange={(e) => updateForm("category", e.target.value)}
            />
          </label>

          <label className="field">
            标签
            <input
              placeholder="例如 bluff catch, MDF, thin value"
              value={form.tags}
              onChange={(e) => updateForm("tags", e.target.value)}
            />
          </label>

          <label className="field">
            内容
            <textarea
              placeholder="写下你的学习笔记、策略总结、常见错误或复盘结论"
              value={form.content}
              onChange={(e) => updateForm("content", e.target.value)}
            />
          </label>

          <label className="field">
            来源
            <input
              placeholder="例如 视频 / 书 / 教练课 / 自己总结"
              value={form.source}
              onChange={(e) => updateForm("source", e.target.value)}
            />
          </label>

          <div className="form-grid">
            <label className="field">
              重要程度
              <select
                value={form.importance}
                onChange={(e) => updateForm("importance", e.target.value)}
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </label>

            <label className="field">
              掌握程度
              <select
                value={form.mastery}
                onChange={(e) => updateForm("mastery", e.target.value)}
              >
                <option value="new">未掌握</option>
                <option value="learning">理解中</option>
                <option value="known">已掌握</option>
              </select>
            </label>
          </div>

          <label className="field">
            下次复习日期
            <input
              type="date"
              value={form.nextReviewDate}
              onChange={(e) => updateForm("nextReviewDate", e.target.value)}
            />
          </label>

          <div className="field">
            关联牌谱
            {hands.length === 0 ? (
              <p className="empty">暂无牌谱可关联。</p>
            ) : (
              <div className="related-hand-list">
                {hands.map((hand) => (
                  <label className="related-hand-option" key={hand.id}>
                    <input
                      type="checkbox"
                      checked={form.relatedHandIds.includes(hand.id)}
                      onChange={() => toggleRelatedHand(hand.id)}
                    />
                    <span>{hand.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button className="primary-button" type="submit">
            保存笔记
          </button>
        </form>
  )}
      </section>

      <section className="card">
        <h2>笔记列表</h2>

        {notes.length === 0 ? (
          <p className="empty">暂无学习笔记。</p>
        ) : (
          <div className="note-list">
            {notes.map((note) => (
              <div className="note-card" key={note.id}>
                <div className="note-header">
                  <div>
                    <strong>{note.title}</strong>
                    <p>{note.category || "未分类"}</p>
                  </div>

                  <span className="note-badge">
                    {note.importance === "high"
                      ? "高重要"
                      : note.importance === "low"
                      ? "低重要"
                      : "中重要"}
                  </span>
                </div>

                <p className="note-content">{note.content}</p>

                <div className="session-meta">
                  <span>
                    掌握：
                    {note.mastery === "new"
                      ? "未掌握"
                      : note.mastery === "known"
                      ? "已掌握"
                      : "理解中"}
                  </span>

                  {note.source && <span>来源：{note.source}</span>}

                  {note.nextReviewDate && (
                    <span>下次复习：{note.nextReviewDate}</span>
                  )}
                </div>

                {note.tags.length > 0 && (
                  <div className="tag-row">
                    {note.tags.map((tag) => (
                      <span className="normal-tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {note.relatedHandIds.length > 0 && (
                  <div className="related-note-hands">
                    <strong>关联牌谱：</strong>
                    {note.relatedHandIds.map((handId) => (
                      <span key={handId}>{getHandTitle(handId)}</span>
                    ))}
                  </div>
                )}

                <button
                  className="danger-button"
                  onClick={() => onDeleteNote(note.id)}
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