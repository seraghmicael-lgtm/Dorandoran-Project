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
