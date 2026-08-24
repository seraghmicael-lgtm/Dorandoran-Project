// 회귀 검증: 유닛(koreanTime·meetupDialog) + 파서 계약(/api/parse-meetup).
// 사용법: 서버 켠 상태에서 `npm run check` (BASE_URL 환경변수로 대상 변경 가능)
// LLM 응답은 비결정적이므로 계약 검사는 "포함/비어있음" 수준의 느슨한 단언만 쓴다.
import { computeEndTime, computeEndClock } from "../lib/koreanTime.ts";
import { FIELD_QUESTIONS, OPENING_LINE, firstMissing, applyParse } from "../lib/meetupDialog.ts";

const BASE = process.env.BASE_URL || "http://localhost:3000";
let pass = 0;
let fail = 0;
const ok = (cond, name, detail = "") => {
  if (cond) {
    pass++;
    console.log(`  ✓ ${name}`);
  } else {
    fail++;
    console.error(`  ✗ ${name}${detail ? " — " + detail : ""}`);
  }
};

// ---------- 유닛: koreanTime ----------
console.log("[koreanTime]");
ok(computeEndTime("오후 3시", 120) === "5시", "3시+2h → 5시");
ok(computeEndTime("오후 3시", 30) === "3시 30분", "3시+30m");
ok(computeEndTime("오후 3시 30분", 60) === "4시 30분", "3:30+1h");
ok(computeEndTime("오전 11시", 120) === "1시", "11시+2h 랩어라운드");
ok(computeEndTime("세 시", 60) === null, "한글 숫자 → null");
ok(computeEndClock("오후 3시", 60) === "오후 4시", "끝시각(오전/오후): 3시+1h");
ok(computeEndClock("오전 11시", 120) === "오후 1시", "끝시각: 정오 경계 뒤집힘");
ok(computeEndClock("오후 11시 30분", 60) === "오전 12시 30분", "끝시각: 자정 경계");
ok(computeEndClock("3시", 60) === null, "오전/오후 없으면 null");

// ---------- 유닛: meetupDialog ----------
console.log("[meetupDialog]");
ok(firstMissing({}) === "time", "전부 빈 경우 → time 우선");
ok(firstMissing({ time: "오후 3시" }) === "location", "time 차면 → location");
ok(firstMissing({ time: "3시", location: "공원" }) === "activity", "다음 → activity");
ok(firstMissing({ time: "3시", location: "공원", activity: "산책" }) === null, "완성 → null");
ok(OPENING_LINE.includes(FIELD_QUESTIONS.time), "오프닝에 첫 질문 포함");

// applyParse: 파싱 응답을 화면에 반영할 때 "바뀐 필드만" 건드린다
{
  const eq = (a, b) => a.time === b.time && a.location === b.location && a.activity === b.activity;
  // 파싱 도중 에이전트가 시간·장소를 채웠다 → 파서가 모르는 그 값들이 지워지면 안 된다
  ok(
    eq(
      applyParse(
        { time: null, location: null, activity: null },
        { time: null, location: null, activity: "산책" },
        { time: "오후 3시", location: "도란공원", activity: null }
      ),
      { time: "오후 3시", location: "도란공원", activity: "산책" }
    ),
    "동시 기록: 에이전트가 채운 값 보존 + 파싱 결과 반영"
  );
  // 의도적 비우기(스냅샷엔 값, 응답은 null)는 그대로 지워야 한다
  ok(
    applyParse({ time: "오후 3시" }, { time: null }, { time: "오후 3시" }).time === null,
    "비우기 요청은 반영"
  );
  // 값 변경은 반영
  ok(
    applyParse({ time: "오후 3시" }, { time: "오후 4시" }, { time: "오후 3시" }).time === "오후 4시",
    "정정 반영"
  );
  // 파싱이 안 건드린 필드는 그 사이 바뀐 현재 값을 지킨다
  ok(
    applyParse({ time: "오후 3시" }, { time: "오후 3시" }, { time: "오후 5시" }).time === "오후 5시",
    "미변경 필드는 현재 값 유지"
  );
  ok(applyParse({}, { location: "" }, { location: "공원" }).location === "공원", "빈 문자열은 null 취급");
}

// ---------- 계약: /api/parse-meetup ----------
console.log(`[parse-meetup 계약 @ ${BASE}]`);
const parse = async (body) => {
  const res = await fetch(`${BASE}/api/parse-meetup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};
const CTX = { time: "오후 3시", location: "송정 오일장", activity: "오일장 구경" };

try {
  // 빈 발화 → 결정적 폴백 (LLM 미사용 경로)
  const r0 = await parse({ transcript: "" , ...CTX, time: null });
  ok(r0.missingField === "time" && r0.followUpQuestion === FIELD_QUESTIONS.time,
    "빈 발화 폴백: time 질문", JSON.stringify(r0));

  const r1 = await parse({ transcript: "오후 세 시에 송정 오일장에서 오일장 구경 같이 해요" });
  ok(r1.time && r1.location && r1.activity && r1.missingField === null,
    "완전 발화 → 3필드 추출·missing 없음", JSON.stringify(r1));
  ok(String(r1.time).includes("3"), "시간에 3 포함", r1.time);

  const r2 = await parse({ transcript: "3시 말고 4시로 해줘", ...CTX });
  ok(String(r2.time).includes("4"), "대체 표현(말고) → 4시", r2.time);
  ok(r2.location === CTX.location, "다른 필드 유지", r2.location);

  const r3 = await parse({ transcript: "한 시간 미뤄줘", ...CTX });
  ok(String(r3.time).includes("4"), "상대 시간(+1h) 계산", r3.time);

  const r4 = await parse({ transcript: "그거 말고 뜨개질로 하자", ...CTX });
  ok(String(r4.activity).includes("뜨개질"), "필드 미지칭 → activity 교체", r4.activity);
  ok(String(r4.time).includes("3"), "time 유지", r4.time);

  const r5 = await parse({ transcript: "장소는 다시 정할래", ...CTX });
  ok(r5.location === null && r5.missingField === "location",
    "비우기 → location null + 재질문", JSON.stringify(r5));

  // 길게 말해도 화면 칸에 들어갈 짧은 말로 요약해서 넣는다
  const LONG =
    "요즘 무릎이 안 좋아서 멀리는 못 가고요, 그냥 우리 동네 한 바퀴 천천히 걸으면서 " +
    "이런저런 이야기나 나눴으면 좋겠어요. 사람이 많은 데는 좀 부담스럽고 조용한 게 좋아요.";
  const r6 = await parse({ transcript: LONG, time: "오후 3시", location: "도란공원", activity: null });
  ok(typeof r6.activity === "string" && r6.activity.length > 0 && r6.activity.length <= 15,
    "긴 발화 → 짧게 요약된 activity", JSON.stringify(r6.activity));
  ok(r6.time === "오후 3시" && r6.location === "도란공원", "긴 발화가 다른 필드를 흔들지 않음",
    JSON.stringify(r6));

  // 시각은 항상 오전/오후 + 아라비아 숫자 — 뒤 화면의 끝시각 계산이 이 형식에 의존한다
  const r7 = await parse({ transcript: "네 시쯤에 봐요", time: null, location: null, activity: null });
  ok(/^(오전|오후) \d/.test(String(r7.time)) && computeEndClock(r7.time, 60) !== null,
    "한글 숫자 시각 → 오전/오후+숫자로 정규화", JSON.stringify(r7.time));
} catch (e) {
  fail++;
  console.error("  ✗ 계약 검사 실행 실패:", e.message, "(서버가 켜져 있나요?)");
}

console.log(`\n결과: ${pass} 통과 / ${fail} 실패`);
process.exit(fail ? 1 : 0);
