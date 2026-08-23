// 회귀 검증: 유닛(koreanTime·meetupDialog) + 파서 계약(/api/parse-meetup).
// 사용법: 서버 켠 상태에서 `npm run check` (BASE_URL 환경변수로 대상 변경 가능)
// LLM 응답은 비결정적이므로 계약 검사는 "포함/비어있음" 수준의 느슨한 단언만 쓴다.
import { computeEndTime } from "../lib/koreanTime.ts";
import { FIELD_QUESTIONS, OPENING_LINE, firstMissing } from "../lib/meetupDialog.ts";

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

// ---------- 유닛: meetupDialog ----------
console.log("[meetupDialog]");
ok(firstMissing({}) === "time", "전부 빈 경우 → time 우선");
ok(firstMissing({ time: "오후 3시" }) === "location", "time 차면 → location");
ok(firstMissing({ time: "3시", location: "공원" }) === "activity", "다음 → activity");
ok(firstMissing({ time: "3시", location: "공원", activity: "산책" }) === null, "완성 → null");
ok(OPENING_LINE.includes(FIELD_QUESTIONS.time), "오프닝에 첫 질문 포함");

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
} catch (e) {
  fail++;
  console.error("  ✗ 계약 검사 실행 실패:", e.message, "(서버가 켜져 있나요?)");
}

console.log(`\n결과: ${pass} 통과 / ${fail} 실패`);
process.exit(fail ? 1 : 0);
