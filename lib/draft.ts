// 모임 만들기 draft의 단일 계약 — 4개 화면(listening→duration→people→posted)이
// sessionStorage로 주고받는 데이터의 타입과 접근 헬퍼.
"use client";

export interface MeetupDraft {
  transcript?: string;
  time?: string | null;
  location?: string | null;
  activity?: string | null;
  /** 04_얼마나 걸릴까요에서 선택 (예: "2시간") */
  duration?: string;
  /** 04에서 계산된 전체 시간 문자열 (예: "오늘 오후 3시 ~ 5시") */
  startTime?: string;
  /** 05_몇 분이 함께할까요에서 선택 */
  maxPeople?: number;
  /** 06_하실 말씀 — 게시판에 그대로 보이는 한마디 */
  message?: string;
  /** 말한 장소를 반경 5km 안에서 찾은 좌표 — 상세 화면의 지도·길찾기가 쓴다 */
  lat?: number;
  lng?: number;
}

const KEY = "dorandoran_meetup_draft";

/** 없거나 깨졌으면 null */
export function loadDraft(): MeetupDraft | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MeetupDraft) : null;
  } catch {
    return null;
  }
}

export function saveDraft(d: MeetupDraft) {
  sessionStorage.setItem(KEY, JSON.stringify(d));
}

export function updateDraft(patch: Partial<MeetupDraft>): MeetupDraft {
  const next = { ...(loadDraft() ?? {}), ...patch };
  saveDraft(next);
  return next;
}

export function clearDraft() {
  sessionStorage.removeItem(KEY);
}
