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
