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

// draft 가 바뀌면 알린다 — 메모리풍선처럼 draft 를 보고 있는 화면이 바로 따라오게.
// storage 이벤트는 "다른 탭"에서만 오므로 같은 탭용으로 직접 쏜다.
const DRAFT_EVENT = "dorandoran:draft";
function emitDraftChange() {
  try {
    window.dispatchEvent(new Event(DRAFT_EVENT));
  } catch {}
}

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
  emitDraftChange();
}

export function updateDraft(patch: Partial<MeetupDraft>): MeetupDraft {
  const next = { ...(loadDraft() ?? {}), ...patch };
  saveDraft(next);
  return next;
}

export function clearDraft() {
  sessionStorage.removeItem(KEY);
  emitDraftChange();
}

/**
 * useSyncExternalStore 용 스냅샷 — 원문 문자열 그대로 돌려준다.
 * 파싱한 객체를 돌려주면 호출마다 참조가 달라져 렌더가 무한히 돈다.
 */
export function draftSnapshot(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/**
 * 메모리풍선에 걸 칩 목록 (Figma 941:980 순서: 할일 → 시간 → 모임시간 → 장소 → 인원).
 * 아직 안 정한 항목은 빼고, 하나도 없으면 빈 배열 — 화면은 아무것도 안 그린다.
 */
export function memoryChips(d: MeetupDraft | null | undefined): string[] {
  return [
    d?.activity,
    d?.time,
    d?.duration ? `${d.duration} 동안` : null,
    d?.location,
    typeof d?.maxPeople === "number" ? `${d.maxPeople}명` : null,
  ].filter((v): v is string => typeof v === "string" && v.trim().length > 0);
}

/** draft 변화를 구독한다(useSyncExternalStore 용) */
export const subscribeDraft = (onChange: () => void) => {
  window.addEventListener(DRAFT_EVENT, onChange);
  return () => window.removeEventListener(DRAFT_EVENT, onChange);
};
export const noDraftOnServer = () => null;
