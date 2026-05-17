import type { MahjongSession, PokerHand, PokerNote, PokerSession } from "./types";

const SESSIONS_KEY = "poker-tracker-sessions-v1";
const HANDS_KEY = "poker-tracker-hands-v1";
const NOTES_KEY = "poker-tracker-notes-v1";
const MAHJONG_KEY = "poker-tracker-mahjong-v1";

export function loadSessions(): PokerSession[] {
  try {
    const saved = localStorage.getItem(SESSIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: PokerSession[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function loadHands(): PokerHand[] {
  try {
    const saved = localStorage.getItem(HANDS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveHands(hands: PokerHand[]) {
  localStorage.setItem(HANDS_KEY, JSON.stringify(hands));
}

export function loadNotes(): PokerNote[] {
  try {
    const saved = localStorage.getItem(NOTES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveNotes(notes: PokerNote[]) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export function loadMahjongSessions(): MahjongSession[] {
  try {
    const saved = localStorage.getItem(MAHJONG_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveMahjongSessions(sessions: MahjongSession[]) {
  localStorage.setItem(MAHJONG_KEY, JSON.stringify(sessions));
}