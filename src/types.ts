export type Page = "home" | "sessions" | "hands" | "notes" | "dashboard";

export type PokerSession = {
  id: string;
  date: string;
  stake: string;
  playMode: string;
  location: string;
  buyIn: number;
  cashOut: number;
  durationHours: number;

  grossProfit: number;
  profit: number;
  hourlyRate: number;

  shareholders: Shareholder[];

  mentalState: string;
  tableQuality: string;
  notes: string;
  createdAt: string;
};

export type Shareholder = {
  id: string;
  name: string;
  percent: number;
  amount: number;
};

export type ShareholderForm = {
  id: string;
  name: string;
  percent: string;
};

export type PokerHand = {
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

export type SessionForm = {
  date: string;
  stake: string;
  playMode: string;
  buyIn: string;
  cashOut: string;
  durationHours: string;
  hasShares: boolean;
  shareholders: ShareholderForm[];
  notes: string;
};

export type HandForm = {
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

export type PokerNote = {
  id: string;
  title: string;
  category: string;
  tags: string[];
  content: string;
  source: string;
  importance: string;
  mastery: string;
  nextReviewDate: string;
  relatedHandIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type NoteForm = {
  title: string;
  category: string;
  tags: string;
  content: string;
  source: string;
  importance: string;
  mastery: string;
  nextReviewDate: string;
  relatedHandIds: string[];
};

export type MahjongSession = {
  id: string;
  date: string;
  mahjongType: string;
  winLoss: number;
  durationHours: number;
  tableFee: number;
  profit: number;
  hourlyRate: number;
  createdAt: string;
};

export type MahjongForm = {
  date: string;
  mahjongType: string;
  winLoss: string;
  durationHours: string;
  tableFee: string;
};