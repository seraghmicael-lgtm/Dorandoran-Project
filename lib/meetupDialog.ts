// 모임 만들기 대화의 단일 소스 — 질문 문구·순서·오프닝 멘트는 여기서만 정의한다.
// (서버 파서 프롬프트, 실시간 에이전트 지침, 화면 폴백이 전부 이 파일을 참조한다.
//  한 곳만 바꾸면 셋이 함께 바뀐다.)

export const FIELD_ORDER = ["time", "location", "activity"] as const;
export type MeetupFieldName = (typeof FIELD_ORDER)[number];

export const FIELD_QUESTIONS: Record<MeetupFieldName, string> = {
  time: "언제 만나고 싶으세요?",
  location: "어디서 만나고 싶으세요?",
  activity: "무엇을 하고 싶으세요?",
};

export const INTRO_LINE = "저는 모임 만들기를 도와줄 거예요.";
export const OPENING_LINE = `${INTRO_LINE} ${FIELD_QUESTIONS.time}`;

export interface MeetupFieldValues {
  time?: string | null;
  location?: string | null;
  activity?: string | null;
}

/** 시간 → 장소 → 활동 순서로 첫 번째 빈 필드. 앞이 차기 전엔 다음으로 안 넘어간다. */
export function firstMissing(f: MeetupFieldValues): MeetupFieldName | null {
  for (const k of FIELD_ORDER) {
    if (!f[k]) return k;
  }
  return null;
}

export function firstMissingQuestion(f: MeetupFieldValues): string | null {
  const k = firstMissing(f);
  return k ? FIELD_QUESTIONS[k] : null;
}

const norm = (v?: string | null): string | null => (v == null || v === "" ? null : v);

/**
 * 파서 응답을 화면 값에 반영한다.
 *
 * 실시간 모드에선 음성 에이전트와 보조 인식 루프가 같은 세 필드를 동시에 쓴다.
 * 파싱 요청을 보낸 뒤 응답이 오기까지 1~3초 사이에 에이전트가 필드를 채우면,
 * 응답(요청 당시 스냅샷 기준으로 계산됨)을 통째로 덮어쓸 때 그 값이 지워진다.
 * 지워진 필드 때문에 다시 그 항목을 묻는 것이 "다 채웠는데 계속 묻는" 현상이다.
 *
 * 그래서 응답 전체가 아니라 "이번 파싱이 실제로 바꾼 필드만" 반영한다.
 * 스냅샷과 응답이 같은 필드는 이번 발화가 건드리지 않은 것이므로 현재 값을 지킨다.
 */
export function applyParse(
  snapshot: MeetupFieldValues,
  parsed: MeetupFieldValues,
  current: MeetupFieldValues
): Record<MeetupFieldName, string | null> {
  const pick = (k: MeetupFieldName) => {
    const next = norm(parsed[k]);
    return next !== norm(snapshot[k]) ? next : norm(current[k]);
  };
  return { time: pick("time"), location: pick("location"), activity: pick("activity") };
}
