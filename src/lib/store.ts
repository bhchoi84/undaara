/* ── Zustand 글로벌 상태 ── */

import { create } from 'zustand';
import type { TarotCard } from './cards';
import type { User } from '@supabase/supabase-js';

/* ── 메시지 타입 ── */
export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  type: 'text' | 'card-reveal' | 'ad' | 'palm-result';
  cardIndex?: number;
  showShare?: boolean;
  timestamp: number;
}

/* ── 위치 정보 ── */
export interface UserLocation {
  city: string;
  region: string;
  country: string;
}

/* ── 별자리 선택 상태 ── */
export interface ZodiacSelection {
  a: string | null;
  m1: string | null;
  m2: string | null;
  mo: string | null;
  today: string | null;
  monthly: string | null;
}

/* ── 메인 스토어 ── */
interface AppState {
  // 현재 메뉴
  activeMenu: string;
  setActiveMenu: (menu: string) => void;

  // 사이드바
  sidebarCollapsed: boolean;
  toggleSidebar: (collapse?: boolean) => void;

  // 타로 카드
  drawnCards: TarotCard[] | null;
  flippedCards: [boolean, boolean, boolean];
  moneyCard: TarotCard | null;
  setDrawnCards: (cards: TarotCard[] | null) => void;
  flipCard: (index: number) => void;
  resetCards: () => void;
  setMoneyCard: (card: TarotCard | null) => void;

  // 채팅 메시지 (메뉴별)
  messages: Record<string, ChatMessage[]>;
  addMessage: (menu: string, msg: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  updateMessage: (menu: string, id: string, content: string) => void;
  removeMessage: (menu: string, id: string) => void;

  // 채팅 히스토리 (AI 컨텍스트용)
  chatHistory: { role: string; content: string }[];
  addToHistory: (msg: { role: string; content: string }) => void;

  // 별자리 선택
  zodiacSel: ZodiacSelection;
  setZodiacSel: (group: keyof ZodiacSelection, value: string | null) => void;

  // 성별/역법 선택
  selectedGender: string | null;
  selectedCalendar: string;
  setSelectedGender: (g: string | null) => void;
  setSelectedCalendar: (c: string) => void;

  // 위치 정보
  userLocation: UserLocation | null;
  setUserLocation: (loc: UserLocation | null) => void;

  // 손금/관상
  palmImageData: string | null;
  palmPreviewSrc: string | null;
  setPalmData: (data: string | null, preview: string | null) => void;

  // 모달
  showUserModal: boolean;
  showLoginModal: boolean;
  showLimitModal: boolean;
  pendingAction: (() => void) | null;
  setShowUserModal: (v: boolean) => void;
  setShowLoginModal: (v: boolean) => void;
  setShowLimitModal: (v: boolean) => void;
  setPendingAction: (fn: (() => void) | null) => void;

  // UI 로딩 상태
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;

  // Auth
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

let msgCounter = 0;

export const useAppStore = create<AppState>((set) => ({
  activeMenu: 'today',
  setActiveMenu: (menu) => set({ activeMenu: menu }),

  sidebarCollapsed: false,
  toggleSidebar: (collapse) => set((s) => ({
    sidebarCollapsed: collapse !== undefined ? collapse : !s.sidebarCollapsed,
  })),

  drawnCards: null,
  flippedCards: [false, false, false],
  moneyCard: null,
  setDrawnCards: (cards) => set({ drawnCards: cards }),
  flipCard: (index) => set((s) => {
    const next = [...s.flippedCards] as [boolean, boolean, boolean];
    next[index] = true;
    return { flippedCards: next };
  }),
  resetCards: () => set({ drawnCards: null, flippedCards: [false, false, false] }),
  setMoneyCard: (card) => set({ moneyCard: card }),

  messages: {},
  addMessage: (menu, msg) => {
    const id = `msg-${++msgCounter}-${Date.now()}`;
    set((s) => ({
      messages: {
        ...s.messages,
        [menu]: [...(s.messages[menu] || []), { ...msg, id, timestamp: Date.now() }],
      },
    }));
    return id;
  },
  updateMessage: (menu, id, content) => set((s) => ({
    messages: {
      ...s.messages,
      [menu]: (s.messages[menu] || []).map((m) =>
        m.id === id ? { ...m, content } : m
      ),
    },
  })),
  removeMessage: (menu, id) => set((s) => ({
    messages: {
      ...s.messages,
      [menu]: (s.messages[menu] || []).filter((m) => m.id !== id),
    },
  })),

  chatHistory: [],
  addToHistory: (msg) => set((s) => {
    const next = [...s.chatHistory, msg];
    return { chatHistory: next.length > 12 ? next.slice(-12) : next };
  }),

  zodiacSel: { a: null, m1: null, m2: null, mo: null, today: null, monthly: null },
  setZodiacSel: (group, value) => set((s) => ({
    zodiacSel: { ...s.zodiacSel, [group]: value },
  })),

  selectedGender: null,
  selectedCalendar: '양력',
  setSelectedGender: (g) => set({ selectedGender: g }),
  setSelectedCalendar: (c) => set({ selectedCalendar: c }),

  userLocation: null,
  setUserLocation: (loc) => set({ userLocation: loc }),

  palmImageData: null,
  palmPreviewSrc: null,
  setPalmData: (data, preview) => set({ palmImageData: data, palmPreviewSrc: preview }),

  showUserModal: false,
  showLoginModal: false,
  showLimitModal: false,
  pendingAction: null,
  setShowUserModal: (v) => set({ showUserModal: v }),
  setShowLoginModal: (v) => set({ showLoginModal: v }),
  setShowLimitModal: (v) => set({ showLimitModal: v }),
  setPendingAction: (fn) => set({ pendingAction: fn }),

  isLoading: false,
  setIsLoading: (v) => set({ isLoading: v }),

  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
}));
