/** 24시 시/분 → "오전 10시" · "오후 12시 30분" (앱 전체가 쓰는 시각 표기) */
export function formatKoreanClock(h24: number, min: number): string {
  const meridiem = h24 < 12 ? "오전" : "오후";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return min === 0 ? `${meridiem} ${h12}시` : `${meridiem} ${h12}시 ${min}분`;
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
