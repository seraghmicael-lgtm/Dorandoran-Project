/** 24시 시/분 → "오전 10시" · "오후 12시 30분" (앱 전체가 쓰는 시각 표기) */
export function formatKoreanClock(h24: number, min: number): string {
  const meridiem = h24 < 12 ? "오전" : "오후";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return min === 0 ? `${meridiem} ${h12}시` : `${meridiem} ${h12}시 ${min}분`;
}

export interface KoreanClock {
  meridiem: "오전" | "오후";
  hour12: number;
  minute: number;
}

/** "오후 3시 30분" → { 오후, 3, 30 }. 오전/오후가 없거나 못 읽으면 null. */
export function parseKoreanClock(time: string): KoreanClock | null {
  const m = time.match(/(오전|오후)\s*(\d{1,2})시(?:\s*(\d{1,2})분)?/);
  if (!m) return null;
  const hour12 = parseInt(m[2], 10);
  const minute = m[3] ? parseInt(m[3], 10) : 0;
  if (hour12 < 1 || hour12 > 12 || minute > 59) return null;
  return { meridiem: m[1] as "오전" | "오후", hour12, minute };
}

/** { 오후, 3, 30 } → "오후 3시 30분" (formatKoreanClock 과 같은 표기) */
export function formatKoreanClockParts(c: KoreanClock): string {
  const h24 = (c.hour12 % 12) + (c.meridiem === "오후" ? 12 : 0);
  return formatKoreanClock(h24, c.minute);
}

// ---- 오늘 남은 시각 (02_몇 시에 만날까요) ----
// 이 앱은 오늘만 다룬다. 지난 시각이나 내일은 고를 수 없어야 한다.
export const MINUTE_STEP = 5;
const LAST_MINUTE = 60 - MINUTE_STEP; // 오후 11시 55분

/** 오전/오후 + 12시제 시각 → 24시제 */
export function toHour24(meridiem: "오전" | "오후", hour12: number): number {
  return (hour12 % 12) + (meridiem === "오후" ? 12 : 0);
}

/**
 * 고를 수 있는 가장 이른 시각 — 지금을 MINUTE_STEP 눈금으로 올림한 값.
 * 자정에 너무 붙어 남는 눈금이 없으면 마지막 눈금(오후 11시 55분)으로 둔다.
 */
export function earliestToday(now: Date): KoreanClock {
  const total = now.getHours() * 60 + now.getMinutes();
  const snapped = Math.ceil(total / MINUTE_STEP) * MINUTE_STEP;
  const capped = Math.min(snapped, 23 * 60 + LAST_MINUTE);
  const h24 = Math.floor(capped / 60);
  const minute = capped % 60;
  return { meridiem: h24 < 12 ? "오전" : "오후", hour12: h24 % 12 === 0 ? 12 : h24 % 12, minute };
}

const floorH24 = (f: KoreanClock) => toHour24(f.meridiem, f.hour12);

/** 오늘 아직 남은 오전/오후 */
export function availableMeridiems(floor: KoreanClock): ("오전" | "오후")[] {
  return floorH24(floor) <= 11 ? ["오전", "오후"] : ["오후"];
}

/** 그 오전/오후에서 아직 남은 시(12시제). 12시가 먼저 오는 시계 순서 */
export function availableHours(floor: KoreanClock, meridiem: "오전" | "오후"): number[] {
  const min = floorH24(floor);
  return [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].filter(
    (h12) => toHour24(meridiem, h12) >= min
  );
}

/** 그 시각에서 아직 남은 분 */
export function availableMinutes(
  floor: KoreanClock,
  meridiem: "오전" | "오후",
  hour12: number
): number[] {
  const h24 = toHour24(meridiem, hour12);
  const all = Array.from({ length: 60 / MINUTE_STEP }, (_, i) => i * MINUTE_STEP);
  if (h24 > floorH24(floor)) return all;
  if (h24 === floorH24(floor)) return all.filter((m) => m >= floor.minute);
  return [];
}

/** 고르려는 값이 오늘 남은 범위를 벗어나면 가장 가까운 유효한 값으로 당긴다 */
export function clampToday(floor: KoreanClock, want: KoreanClock): KoreanClock {
  const meridiems = availableMeridiems(floor);
  const meridiem = meridiems.includes(want.meridiem) ? want.meridiem : meridiems[0];
  const hours = availableHours(floor, meridiem);
  const hour12 = hours.includes(want.hour12) ? want.hour12 : hours[0];
  const minutes = availableMinutes(floor, meridiem, hour12);
  const minute = minutes.includes(want.minute) ? want.minute : minutes[0];
  return { meridiem, hour12, minute };
}

/**
 * 오늘 남은 시각을 정각·30분 눈금으로 — 타이핑 후보용.
 * 분 단위까지는 굴리는 칸이 맡고, 여기엔 사람이 실제로 쳐 넣는 눈금만 담는다.
 */
export function remainingTodayOptions(floor: KoreanClock): string[] {
  const start = floorH24(floor) * 60 + floor.minute;
  const out: string[] = [];
  for (let t = Math.ceil(start / 30) * 30; t <= 23 * 60 + 30; t += 30) {
    out.push(formatKoreanClock(Math.floor(t / 60), t % 60));
  }
  return out;
}

/**
 * 지금의 한국 시각. 반환된 Date 의 **지역 getter**(getHours 등)가 서울 벽시계를 가리킨다.
 * 서버(Railway=UTC)에서 선택지를 만들어도 어르신이 보는 시각과 맞추기 위한 것 —
 * 동네 모임은 한국에서 열리므로 기기 시간대가 아니라 한국 시간이 기준이다.
 */
export function seoulNow(from: Date = new Date()): Date {
  return new Date(from.getTime() + (from.getTimezoneOffset() + 9 * 60) * 60_000);
}

/**
 * 02_몇 시에 만날까요의 선택지 — 지금 시각 기준으로 만든다.
 *
 * 고정 목록("오후 3시~5시 30분")은 아침에 열면 이미 지난 시각을 고르게 되고, 저녁에 열면
 * 쓸모가 없다. 그래서 **지금+1시간을 정각으로 올린 시각**부터 30분 간격으로 뽑는다.
 * 기본 8개 = 정각 4개 + 30분 4개.
 *
 * 예) 8시 55분에 열면 → 오전 10시 / 10시 30분 / 11시 / 11시 30분 / 오후 12시 / 12시 30분 / 1시 / 1시 30분
 *
 * 1시간을 앞에 두는 이유: 당일 즉흥 모임이라도 보고 준비해서 나갈 시간은 있어야 한다.
 */
export function meetupTimeOptions(now: Date, count = 8): string[] {
  const start = new Date(now.getTime() + 60 * 60 * 1000);
  // 정각이 아니면 다음 정각으로 올린다 (9시 55분 → 10시)
  if (start.getMinutes() !== 0 || start.getSeconds() !== 0 || start.getMilliseconds() !== 0) {
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
  }
  return Array.from({ length: count }, (_, i) => {
    const t = new Date(start.getTime() + i * 30 * 60 * 1000);
    return formatKoreanClock(t.getHours(), t.getMinutes());
  });
}

// "오후 3시"에 분을 더해 "오후 5시"처럼 오전/오후까지 붙은 종료 시각을 만든다
// (v02 03_얼마나 걸릴까요의 "오후 4시에 끝나요" 라벨용). 정오/자정 경계에서 오전↔오후가
// 올바르게 뒤집힌다. 입력에 오전/오후가 없거나 파싱 불가면 null.
export function computeEndClock(time: string, addMinutes: number): string | null {
  const m = time.match(/(오전|오후)\s*(\d{1,2})시(?:\s*(\d{1,2})분)?/);
  if (!m) return null;
  const meridiem = m[1];
  const h = parseInt(m[2], 10);
  const min = m[3] ? parseInt(m[3], 10) : 0;
  if (h < 1 || h > 12 || min > 59) return null;

  let total = ((h % 12) + (meridiem === "오후" ? 12 : 0)) * 60 + min + addMinutes;
  total = ((total % 1440) + 1440) % 1440;
  const h24 = Math.floor(total / 60);
  const endMin = total % 60;
  const endMeridiem = h24 < 12 ? "오전" : "오후";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return endMin === 0 ? `${endMeridiem} ${h12}시` : `${endMeridiem} ${h12}시 ${endMin}분`;
}

// "오후 3시"/"오후 3시 30분" 같은 한국어 시각 문자열에 분을 더해 "5시"/"3시 30분" 형태의
// 종료 시각을 만든다. Figma 예시("오후 3시 ~ 5시")처럼 종료 시각엔 오전/오후를 붙이지 않는다.
// 파싱 불가한 문자열이면 null — 호출부는 범위 표기를 생략한다.
export function computeEndTime(time: string, addMinutes: number): string | null {
  const m = time.match(/(\d{1,2})시(?:\s*(\d{1,2})분)?/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  if (h < 1 || h > 12 || min > 59) return null;

  const total = ((h % 12) * 60 + min + addMinutes) % (12 * 60);
  const endH = Math.floor(total / 60) === 0 ? 12 : Math.floor(total / 60);
  const endMin = total % 60;
  return endMin === 0 ? `${endH}시` : `${endH}시 ${endMin}분`;
}
