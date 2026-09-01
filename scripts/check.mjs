// 회귀 검증: 유닛(koreanTime·meetupDialog) + 파서 계약(/api/parse-meetup).
// 사용법: 서버 켠 상태에서 `npm run check` (BASE_URL 환경변수로 대상 변경 가능)
// LLM 응답은 비결정적이므로 계약 검사는 "포함/비어있음" 수준의 느슨한 단언만 쓴다.
import {
  computeEndTime,
  computeEndClock,
  formatKoreanClock,
  formatKoreanClockParts,
  parseKoreanClock,
  meetupTimeOptions,
  seoulNow,
  earliestToday,
  availableMeridiems,
  availableHours,
  availableMinutes,
  clampToday,
  remainingTodayOptions,
  toHour24,
} from "../lib/koreanTime.ts";
import { ACTIVITY_SUGGESTIONS } from "../lib/activitySuggestions.ts";
import { FIELD_QUESTIONS, OPENING_LINE, firstMissing, applyParse } from "../lib/meetupDialog.ts";
import { directionsUrl } from "../lib/places.ts";
import {
  memoryChips,
  saveDraft,
  clearDraft,
  draftSnapshot,
  subscribeDraft,
} from "../lib/draft.ts";

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

// 만날 시각 선택지 — 지금 시각 기준(02_몇 시에 만날까요)
ok(formatKoreanClock(12, 0) === "오후 12시", "정오는 오후 12시");
ok(formatKoreanClock(0, 0) === "오전 12시", "자정은 오전 12시");
ok(formatKoreanClock(13, 30) === "오후 1시 30분", "13:30 → 오후 1시 30분");
{
  // 8시 55분에 열면 지금+1시간(9:55)을 정각으로 올려 10시부터 30분 간격
  const at855 = meetupTimeOptions(new Date(2026, 7, 24, 8, 55));
  const expected = [
    "오전 10시",
    "오전 10시 30분",
    "오전 11시",
    "오전 11시 30분",
    "오후 12시",
    "오후 12시 30분",
    "오후 1시",
    "오후 1시 30분",
  ];
  ok(at855.length === 8, "선택지 8개");
  ok(at855.join("|") === expected.join("|"), "8시 55분 → 10시부터 30분 간격", at855.join(", "));
  ok(at855.filter((s) => !s.includes("분")).length === 4, "정각 4개");
  ok(at855.filter((s) => s.includes("30분")).length === 4, "30분 4개");
  // 지금보다 이른 시각이 섞이면 안 된다
  ok(computeEndClock(at855[0], 0) === "오전 10시", "첫 선택지가 파싱 가능한 형식", at855[0]);

  // 정각에 열면 바로 1시간 뒤부터
  ok(meetupTimeOptions(new Date(2026, 7, 24, 9, 0))[0] === "오전 10시", "9시 정각 → 10시부터");
  // 자정을 넘어가도 오전/오후가 올바르게 뒤집힌다
  ok(meetupTimeOptions(new Date(2026, 7, 24, 23, 10))[0] === "오전 1시", "23시 10분 → 오전 1시부터");
  // 10시 5분 → +1h=11:05 → 정각 올림 12시 시작. 다섯째(=+2h)는 오후 2시
  const at1005 = meetupTimeOptions(new Date(2026, 7, 24, 10, 5));
  ok(at1005[0] === "오후 12시" && at1005[4] === "오후 2시", "정오 경계도 정각 올림", at1005.join(", "));

  // seoulNow(): 지역 getter 가 서울 벽시계를 가리켜야 한다(서버는 UTC로 돈다)
  const seoulHour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Seoul",
      hour: "numeric",
      hour12: false,
    }).format(new Date())
  );
  ok(seoulNow().getHours() === seoulHour % 24, "seoulNow 가 한국 시각을 가리킴", `${seoulNow().getHours()} vs ${seoulHour}`);
}

// 길찾기 링크 — 폰에서 누르면 지도 앱이 걷기 안내로 열려야 한다
{
  const u = directionsUrl({ lat: 37.5446148, lng: 127.0580149, name: "도란공원" });
  ok(u.includes("destination=37.5446148%2C127.0580149"), "길찾기: 좌표가 있으면 좌표로", u);
  ok(u.includes("travelmode=walking"), "길찾기: 걷기 안내가 기본");
  const u2 = directionsUrl({ lat: null, lng: null, name: "도란마트 정문 앞" });
  ok(
    u2.includes("destination=") && u2.includes(encodeURIComponent("도란마트 정문 앞")),
    "길찾기: 좌표가 없으면 이름으로",
    u2
  );
  ok(directionsUrl({ lat: 37.5, lng: 127 }, "transit").includes("travelmode=transit"), "길찾기: 이동수단 지정 가능");
}

// 시각 고르기(TimePicker) — 굴려서 고른 값이 앱 표준 표기로 되돌아와야 한다
{
  const rt = (s) => {
    const c = parseKoreanClock(s);
    return c ? formatKoreanClockParts(c) : null;
  };
  for (const s of ["오후 3시", "오전 10시 30분", "오후 12시", "오전 12시", "오후 12시 55분"]) {
    ok(rt(s) === s, `시각 왕복: ${s}`, String(rt(s)));
  }
  ok(parseKoreanClock("네 시") === null, "시각 파싱: 한글 숫자는 null");
  ok(parseKoreanClock("3시 30분") === null, "시각 파싱: 오전/오후 없으면 null");
  ok(parseKoreanClock("오후 13시") === null, "시각 파싱: 13시는 null");
  ok(parseKoreanClock("오후 3시 60분") === null, "시각 파싱: 60분은 null");
  // 고른 값이 뒤 화면(끝시각 계산)에서 그대로 쓰인다
  const picked = formatKoreanClockParts({ meridiem: "오전", hour12: 11, minute: 45 });
  ok(picked === "오전 11시 45분", "고른 값 표기", picked);
  ok(computeEndClock(picked, 90) === "오후 1시 15분", "고른 값으로 끝시각 계산", String(computeEndClock(picked, 90)));
}

// draft 저장소가 변화를 알리는지 — 안 알리면 메모리풍선이 지운 뒤에도 계속 떠 있다
{
  const store = {};
  globalThis.sessionStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => {
      store[k] = String(v);
    },
    removeItem: (k) => {
      delete store[k];
    },
  };
  globalThis.window = new EventTarget();

  let fired = 0;
  const unsubscribe = subscribeDraft(() => fired++);

  ok(draftSnapshot() === null, "draft: 비어있으면 null");
  saveDraft({ activity: "산책" });
  ok(fired === 1, "draft: 저장하면 알린다");
  ok(memoryChips(JSON.parse(draftSnapshot())).join("|") === "산책", "draft: 저장한 값이 칩으로");

  clearDraft();
  ok(fired === 2, "draft: 비우면 알린다 (만들기 탭 → 풍선이 사라진다)");
  ok(draftSnapshot() === null, "draft: 비운 뒤 스냅샷 null");

  unsubscribe();
  saveDraft({ activity: "등산" });
  ok(fired === 2, "draft: 구독 해제하면 더 안 온다");
  clearDraft();
}

// 시각 고르기는 오늘 남은 시간만 — 지난 시각·내일은 칸에 아예 없어야 한다
{
  const at1440 = earliestToday(new Date(2026, 7, 25, 14, 37)); // 오후 2시 37분
  ok(
    at1440.meridiem === "오후" && at1440.hour12 === 2 && at1440.minute === 40,
    "오늘 기준: 2시 37분 → 오후 2시 40분으로 올림",
    JSON.stringify(at1440)
  );

  ok(availableMeridiems(at1440).join("|") === "오후", "오후엔 오전이 사라진다");
  ok(availableMeridiems(earliestToday(new Date(2026, 7, 25, 9, 0))).join("|") === "오전|오후",
    "오전엔 둘 다 남아있다");

  // 오후 2시 40분 기준: 오후 2,3,...,11시만 (12시·1시는 지났다)
  const hrs = availableHours(at1440, "오후");
  ok(!hrs.includes(12) && !hrs.includes(1) && hrs[0] === 2 && hrs[hrs.length - 1] === 11,
    "지난 시는 빠진다", hrs.join(","));
  ok(hrs.every((h) => toHour24("오후", h) >= 14), "남은 시는 전부 기준 이후");

  // 기준 시각과 같은 시엔 분도 잘린다
  ok(availableMinutes(at1440, "오후", 2)[0] === 40, "같은 시: 기준 분부터");
  ok(availableMinutes(at1440, "오후", 3)[0] === 0, "다음 시: 0분부터");
  ok(availableMinutes(at1440, "오후", 3).length === 12, "분은 5분 단위 12칸");

  // 지난 값을 넣어도 오늘 범위 안으로 당겨진다
  const pulled = clampToday(at1440, { meridiem: "오전", hour12: 9, minute: 0 });
  ok(toHour24(pulled.meridiem, pulled.hour12) * 60 + pulled.minute >= 14 * 60 + 40,
    "지난 시각을 넣으면 기준 이후로 당긴다", JSON.stringify(pulled));

  // 자정 직전엔 마지막 눈금으로 버틴다(빈 화면 방지)
  const late = earliestToday(new Date(2026, 7, 25, 23, 58));
  ok(late.meridiem === "오후" && late.hour12 === 11 && late.minute === 55,
    "자정 직전 → 오후 11시 55분", JSON.stringify(late));
  ok(availableHours(late, "오후").length === 1 && availableMinutes(late, "오후", 11).length === 1,
    "자정 직전엔 고를 게 하나만 남는다");

  // 타이핑 후보도 오늘 남은 것만, 자정을 안 넘는다
  const opts = remainingTodayOptions(at1440);
  ok(opts[0] === "오후 3시", "후보 첫 항목", opts[0]);
  ok(opts[opts.length - 1] === "오후 11시 30분", "후보 마지막 항목", opts[opts.length - 1]);
  ok(opts.every((o) => parseKoreanClock(o)), "후보가 전부 표준 표기");
}

// 활동 후보 — 화면 버튼 7개가 전부 후보에도 들어 있어야 한다
{
  ok(ACTIVITY_SUGGESTIONS.length >= 60, "활동 후보 충분히 많다", String(ACTIVITY_SUGGESTIONS.length));
  const buttons = ["산책", "등산", "바둑", "맛집탐방", "장보기", "커피", "병원"];
  const missing = buttons.filter((b) => !ACTIVITY_SUGGESTIONS.includes(b));
  ok(missing.length === 0, "화면 버튼이 후보에도 있다", missing.join(","));
  ok(new Set(ACTIVITY_SUGGESTIONS).size === ACTIVITY_SUGGESTIONS.length, "활동 후보에 중복 없음");
}

// 메모리풍선 — 단계를 지날수록 칩이 하나씩 늘어난다
{
  ok(memoryChips(null).length === 0, "메모리풍선: 아무것도 없으면 빈 배열");
  ok(memoryChips({}).length === 0, "메모리풍선: 빈 draft 도 빈 배열");
  ok(
    memoryChips({ activity: "산책" }).join("|") === "산책",
    "메모리풍선: 활동만 정했을 때"
  );
  const full = memoryChips({
    activity: "산책",
    time: "오후 3시",
    duration: "1시간",
    location: "도토리마을 공원 입구",
    maxPeople: 4,
  });
  ok(
    full.join("|") === "산책|오후 3시|1시간 동안|도토리마을 공원 입구|4명",
    "메모리풍선: Figma 순서·문구 그대로",
    full.join(" / ")
  );
  // 중간이 비어도 순서가 밀리지 않는다
  ok(
    memoryChips({ activity: "산책", location: "공원" }).join("|") === "산책|공원",
    "메모리풍선: 빈 항목은 건너뛴다"
  );
  ok(memoryChips({ maxPeople: 0 }).join("|") === "0명", "메모리풍선: 0명도 표시(0을 빈 값으로 안 본다)");
  ok(memoryChips({ activity: "   " }).length === 0, "메모리풍선: 공백만 있으면 안 건다");
}

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

  // 06_하실 말씀: 길게 말해도 문장당 20자 이내 · 최대 2문장으로 줄인다
  const summarize = async (transcript) => {
    const res = await fetch(`${BASE}/api/summarize-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()).message;
  };
  const m1 = await summarize(
    "제가 무릎이 좀 안 좋아서 빨리는 못 걸어요. 그냥 천천히 둘러보기만 할 거고 무거운 건 살 생각이 없어요 정말로"
  );
  const lines = String(m1).split("\n").filter(Boolean);
  ok(lines.length >= 1 && lines.length <= 2, "하실 말씀: 최대 2문장", JSON.stringify(m1));
  ok(lines.every((l) => l.length <= 20), "하실 말씀: 문장당 20자 이내", JSON.stringify(lines));
  ok(String(m1).includes("천천히"), "하실 말씀: 핵심 남김", JSON.stringify(m1));
  ok((await summarize("음 그냥 뭐 별거 없어요")) === "", "알맹이 없으면 빈 문자열");

  // 장소 검색: 반드시 반경 5km 안에서만 찾는다
  const searchPlace = async (query, lat, lng) => {
    const res = await fetch(`${BASE}/api/places/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, lat, lng }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };
  const SEOUL = [37.5445, 127.0557]; // 성수동 근처
  const p1 = await searchPlace("경로당", ...SEOUL);
  ok(p1.place && p1.place.distanceM <= 5000, "장소 검색: 5km 안에서 찾음", JSON.stringify(p1.place));

  // 핵심 불변식: 돌려주는 모든 결과가 준 위치에서 5km 안이어야 한다.
  // (Places 는 검색엔진이라 "성수동 카페"를 제주에서 물으면 제주 카페를 준다 — 그래도
  //  그 결과들은 제주 기준 5km 안이어야 한다. 사각형 모서리 초과분이 새면 여기서 걸린다.)
  for (const [label, q, la, ln] of [
    ["서울/카페", "카페", ...SEOUL],
    ["서울/먼 지명", "부산역", ...SEOUL],
    ["제주/서울 지명", "성수동 카페", 33.4996, 126.5312],
  ]) {
    const r = await searchPlace(q, la, ln);
    const all = [r.place, ...(r.others ?? [])].filter(Boolean);
    ok(
      all.every((p) => p.distanceM <= 5000),
      `장소 검색(${label}): 모든 결과가 5km 안`,
      JSON.stringify(all.map((p) => `${p.name}:${p.distanceM}m`))
    );
    ok(
      all.length < 2 || all.every((p, i) => i === 0 || all[i - 1].distanceM <= p.distanceM),
      `장소 검색(${label}): 가까운 순 정렬`
    );
  }
  const p3 = await searchPlace("", ...SEOUL);
  ok(!p3.place && p3.reason === "no-query", "장소 검색: 빈 질의는 no-query");
  const p4 = await searchPlace("공원", NaN, NaN);
  ok(!p4.place && p4.reason === "no-origin", "장소 검색: 위치 없으면 no-origin");

  // 04_어디서 만날까요는 지도+검색으로 바뀌었다. 나머지 화면은 목록형 그대로여야 한다.
  const html = async (path) => {
    const res = await fetch(`${BASE}${path}`, { headers: { cookie: "dn_entered=1" } });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${path}`);
    return res.text();
  };
  const placeHtml = await html("/create/place");
  ok(
    !["송정마을 어귀", "도토리마을 공원", "한마음 경로당"].some((n) => placeHtml.includes(n)),
    "장소 화면: 고정 카드 3개 제거됨"
  );
  // 새 UI디자인에는 "목록에 없으면" 머리말이 없다 — 어느 화면에도 남아 있으면 안 된다
  const stepPages = [
    ["/create/activity", 1, "어떤 활동을"],
    ["/create/time", 2, "동행과 몇 시에"],
    ["/create/duration", 3, "얼마나 걸릴까요"],
    ["/create/place", 4, "어디서 만날까요"],
    ["/create/people", 5, "몇 명이 함께할까요"],
    ["/create/message", 6, "추가로 남길"],
  ];
  for (const [path, step, heading] of stepPages) {
    const h = await html(path);
    ok(!h.includes("목록에 없으면"), `${path}: 옛 머리말 없음`);
    ok(h.includes(heading), `${path}: 새 제목`, heading);
    ok(h.includes(`>${step}<!-- --> / 6</span>`), `${path}: 단계 배지 ${step}/6`);
  }

  // JN 그룹: 상세 → 참여 확인 → 참여. 참여가 실제로 기록돼야 참여자 목록이 의미를 갖는다
  {
    const made = await fetch(`${BASE}/api/meetups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activity: "회귀검사 동행", startTime: "오늘 오후 3시", maxPeople: 3 }),
    });
    const meetup = await made.json();
    ok(!!meetup.id, "동행 생성");

    const detail = await html(`/meetup/${meetup.id}`);
    ok(detail.includes("자세히 보기"), "상세: 새 제목줄");
    ok(detail.includes("회귀검사 동행"), "상세: 활동 이름");
    ok(detail.includes("참여자"), "상세: 참여자 목록");
    ok(/참여 가능|한 자리 남았어요|다 찼어요|나 포함/.test(detail), "상세: 상태 배지");

    ok((await html(`/meetup/${meetup.id}/join`)).includes("참여할까요?"), "참여 확인 화면");

    // 같은 사람이 두 번 눌러도 한 번만 들어간다.
    // uid 쿠키를 직접 이어줘야 "같은 사람"이 된다(fetch 는 쿠키를 안 물고 다닌다).
    const j1 = await fetch(`${BASE}/api/meetups/${meetup.id}/join`, { method: "POST" });
    const uid = (j1.headers.get("set-cookie") ?? "").match(/uid=([^;]+)/)?.[1];
    ok(j1.ok && !!uid, "참여 1회차: uid 발급", String(uid));
    const j2 = await fetch(`${BASE}/api/meetups/${meetup.id}/join`, {
      method: "POST",
      headers: { cookie: `uid=${uid}` },
    });
    ok(j2.ok && (await j2.json()).already === true, "같은 사람 두 번째는 already");

    // 참여자 목록이 한 명만 늘어난다(개설자 + 참여자 1)
    const after = await html(`/meetup/${meetup.id}`);
    ok(/참여자 <span[^>]*>2</.test(after), "참여자 수가 2 (중복 안 쌓임)");

    ok((await html(`/meetup/${meetup.id}/complete`)).includes("참여가 완료됐어요"), "참여 완료 화면");
  }

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
