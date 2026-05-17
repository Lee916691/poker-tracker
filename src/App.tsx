import { useEffect, useState } from "react";
import type {
  MahjongSession,
  Page,
  PokerHand,
  PokerNote,
  PokerSession,
} from "./types";
import {
  loadHands,
  loadMahjongSessions,
  loadNotes,
  loadSessions,
  saveHands,
  saveMahjongSessions,
  saveNotes,
  saveSessions,
} from "./storage";
import { MahjongPage } from "./pages/MahjongPage";
import { NotesPage } from "./pages/NotesPage";
import { HomePage } from "./pages/HomePage";
import { SessionsPage } from "./pages/SessionsPage";
import { HandsPage } from "./pages/HandsPage";



export default function App() {
const [page, setPage] = useState<Page>("home");
const [isSessionFormOpen, setIsSessionFormOpen] = useState(false);
const [isHandFormOpen, setIsHandFormOpen] = useState(false);
const [isNoteFormOpen, setIsNoteFormOpen] = useState(false);

const [sessions, setSessions] = useState<PokerSession[]>(loadSessions);
const [hands, setHands] = useState<PokerHand[]>(loadHands);
const [notes, setNotes] = useState<PokerNote[]>(loadNotes);
const [mahjongSessions, setMahjongSessions] =
  useState<MahjongSession[]>(loadMahjongSessions);
  

 useEffect(() => {
  saveSessions(sessions);
}, [sessions]);

useEffect(() => {
  saveHands(hands);
}, [hands]);

useEffect(() => {
  saveNotes(notes);
}, [notes]);

useEffect(() => {
  saveMahjongSessions(mahjongSessions);
}, [mahjongSessions]);

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

  function addNote(note: PokerNote) {
  setNotes((current) => [note, ...current]);
}

function openSessionsList() {
  setPage("sessions");
  setIsSessionFormOpen(false);
}

function openAddSession() {
  setPage("sessions");
  setIsSessionFormOpen(true);
}

function openHandsList() {
  setPage("hands");
  setIsHandFormOpen(false);
}

function openAddHand() {
  setPage("hands");
  setIsHandFormOpen(true);
}

function openNotesList() {
  setPage("notes");
  setIsNoteFormOpen(false);
}

function openAddNote() {
  setPage("notes");
  setIsNoteFormOpen(true);
}

function deleteNote(id: string) {
  const confirmed = confirm("确定要删除这条学习笔记吗？");
  if (!confirmed) return;

  setNotes((current) => current.filter((note) => note.id !== id));
}

function addMahjongSession(session: MahjongSession) {
  setMahjongSessions((current) => [session, ...current]);
}

function deleteMahjongSession(id: string) {
  const confirmed = confirm("确定要删除这条麻将记录吗？");
  if (!confirmed) return;

  setMahjongSessions((current) =>
    current.filter((session) => session.id !== id)
  );
}

function exportData() {
  const backup = {
  version: 2,
  exportedAt: new Date().toISOString(),
  sessions,
  hands,
  notes,
  mahjongSessions,
};

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `poker-tracker-backup-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  link.click();
  URL.revokeObjectURL(url);
}

function importData(file: File) {
  const confirmed = confirm(
    "导入备份会覆盖当前所有战绩、牌谱和笔记。确定继续吗？"
  );

  if (!confirmed) return;

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));

      if (
        !Array.isArray(data.sessions) ||
        !Array.isArray(data.hands) ||
        !Array.isArray(data.notes)
      ) {
        alert("备份文件格式不正确。");
        return;
      }

      setSessions(data.sessions);
setHands(data.hands);
setNotes(data.notes);
setMahjongSessions(
  Array.isArray(data.mahjongSessions) ? data.mahjongSessions : []
);

      alert("导入成功。");
    } catch {
      alert("导入失败，请确认选择的是正确的 JSON 备份文件。");
    }
  };

  reader.readAsText(file);
}

  return (
    <div className="app-shell">
      {page === "home" && (
  <HomePage
  sessions={sessions}
  hands={hands}
  notes={notes}
  goToAddSession={openAddSession}
  goToAddHand={openAddHand}
  goToAddNote={openAddNote}
  onExportData={exportData}
  onImportData={importData}
/>
)}

      {page === "sessions" && (
        <SessionsPage
  sessions={sessions}
  isFormOpen={isSessionFormOpen}
  onToggleForm={() => setIsSessionFormOpen((current) => !current)}
  onCloseForm={() => setIsSessionFormOpen(false)}
  onAddSession={addSession}
  onDeleteSession={deleteSession}
/>
      )}

      {page === "hands" && (
        <HandsPage
  sessions={sessions}
  hands={hands}
  isFormOpen={isHandFormOpen}
  onToggleForm={() => setIsHandFormOpen((current) => !current)}
  onCloseForm={() => setIsHandFormOpen(false)}
  onAddHand={addHand}
  onDeleteHand={deleteHand}
/>
      )}

      {page === "notes" && (
  <NotesPage
  notes={notes}
  hands={hands}
  isFormOpen={isNoteFormOpen}
  onToggleForm={() => setIsNoteFormOpen((current) => !current)}
  onCloseForm={() => setIsNoteFormOpen(false)}
  onAddNote={addNote}
  onDeleteNote={deleteNote}
/>
)}

      {page === "dashboard" && (
  <MahjongPage
    mahjongSessions={mahjongSessions}
    onAddMahjongSession={addMahjongSession}
    onDeleteMahjongSession={deleteMahjongSession}
  />
)}

      <nav className="bottom-nav">
        <button className={page === "home" ? "active" : ""} onClick={() => setPage("home")}>
          <span>🏠</span>
          首页
        </button>

        <button className={page === "sessions" ? "active" : ""} onClick={openSessionsList}>
         <span>🏆</span>
           战绩
        </button>

        <button className={page === "hands" ? "active" : ""} onClick={openHandsList}>
          <span>🃏</span>
          牌谱
        </button>

        <button className={page === "notes" ? "active" : ""} onClick={openNotesList}>
          <span>📘</span>
          笔记
        </button>

        <button className={page === "dashboard" ? "active" : ""} onClick={() => setPage("dashboard")}>
  <span>🀄</span>
  麻将
</button>
      </nav>
    </div>
  );
}