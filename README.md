# 도란도란 (Dorandoran)

어르신이 **오늘, 우리 동네에서, 한두 시간짜리 작은 동행**을 말로 만들고 참여하는 앱입니다.

타자 대신 목소리로 만듭니다. 마이크 버튼을 누르고 "오늘 세 시에 송정 오일장에서 구경 좀 같이 해요"라고
말하면, 화면이 알아듣고 `시간 / 장소 / 활동` 세 칸을 채워 게시판에 올려줍니다.

- 배포: <https://dorandoran-project-production.up.railway.app>
- 기능 명세: [`docs/기능명세.md`](docs/기능명세.md)
- 와이어프레임 원본: [Figma](https://www.figma.com/file/6pNCoKTw7aIRe8wEm2efgx?node-id=575:2)

---

## 1. 빠르게 실행하기

### 준비물

| 항목 | 비고 |
|---|---|
| Node.js 20 이상 | `node -v` 로 확인 |
| OpenAI API 키 | 음성 기능 전부가 이 키를 씁니다 (Realtime · Whisper · TTS · GPT) |
| Google Maps JS API 키 | 지도 표시용. 없어도 나머지는 동작합니다 |

### 설치와 실행

```bash
git clone https://github.com/seraghmicael-lgtm/Dorandoran-Project.git
cd Dorandoran-Project
npm install                 # postinstall 에서 prisma generate 가 함께 돕니다
cp .env.example .env.local   # 아래 표를 보고 값을 채우세요
npx prisma migrate dev       # 로컬 SQLite 파일과 테이블을 만듭니다
npm run dev                  # http://localhost:3000
```

브라우저에서 <http://localhost:3000> 을 열면 스플래시로 이동합니다.

> **마이크는 HTTPS 또는 localhost 에서만 열립니다.** `192.168.x.x` 같은 주소로 접속하면 브라우저가
> 마이크를 막아 음성 기능이 전부 조용히 실패합니다. 폰에서 시험하려면 배포 주소를 쓰거나
> `ngrok`/`cloudflared` 로 HTTPS 터널을 만드세요.

### 환경 변수

`.env.local` (개발) 또는 배포 환경 변수에 넣습니다.

| 이름 | 필수 | 설명 |
|---|:---:|---|
| `OPENAI_API_KEY` | ✅ | Realtime 세션 발급, Whisper 전사, TTS, 문장 파싱에 모두 사용 |
| `DATABASE_URL` | ✅ | Prisma 접속 문자열. 로컬은 `file:./dev.db` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | | 지도 표시 + 장소 검색. 없으면 지도와 핀이 안 나옵니다 |
| `GOOGLE_MAPS_SERVER_KEY` | | 장소 검색용 서버 키. 안 넣으면 위 공개 키를 씁니다 |
| `LLM_MODEL` | | 문장 파싱·요약에 쓸 모델. 기본 `gpt-4o` |

키가 없어도 앱은 뜹니다. 다만 음성·파싱 경로가 조용히 폴백으로 빠집니다 —
[6. 문제가 생겼을 때](#6-문제가-생겼을-때) 를 보세요.

---

## 2. 명령어

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 개발 서버 (http://localhost:3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | `prisma migrate deploy` 후 프로덕션 서버 — 배포에서 쓰는 명령 |
| `npm run lint` | ESLint |
| `npm run check` | **회귀 검증 스위트** — 아래 참조 |

### `npm run check` — 무엇을 검사하나

이 프로젝트의 핵심 로직은 "어르신이 흘려 말한 한국어"를 다루는 곳에 몰려 있고, 그 부분은
타입 검사로 잡히지 않습니다. `scripts/check.mjs` 가 그 계약을 지킵니다.

```bash
npm run dev            # 다른 터미널에서 서버를 먼저 켜고
npm run check          # BASE_URL 환경변수로 대상 변경 가능
```

- **유닛** (서버 불필요): 시간 계산(`lib/koreanTime.ts`), 질문 순서와 필드 병합(`lib/meetupDialog.ts`)
- **계약** (서버 필요, 실제 LLM 호출): `/api/parse-meetup`, `/api/summarize-message`

LLM 응답은 비결정적이라 계약 검사는 "포함한다 / 비어있지 않다 / 길이 이내다" 수준의 느슨한 단언만
씁니다. **음성 기능을 건드렸다면 반드시 이걸 통과시키고 커밋하세요.**

---

## 3. 코드가 어디에 있나

```
app/
  splash · welcome · signup                진입과 로그인
  location-permission · notification-permission
  home                                     동행 게시판(피드)
  create/                                  동행 만들기 — 아래 4번 참조
  meetup/[id] · meetup/[id]/complete       동행 자세히 보기 · 참여 완료
  my-meetups/                              내 동행 (만든 것 · 취소 · 지난 것)
  api/                                     아래 표 참조
lib/
  voice.ts            녹음 · 무음 감지(VAD) · Whisper 전사 · TTS 재생
  realtimeMeetup.ts   OpenAI Realtime 음성 에이전트 (WebRTC)
  meetupDialog.ts     질문 문구 · 순서 · 필드 병합 규칙 — 단일 소스
  koreanTime.ts       "오후 3시" + 2시간 → "오후 5시"
  draft.ts            만들기 화면들이 sessionStorage 로 주고받는 데이터
  safePath.ts         ?from=/?next= 오픈 리다이렉트 방어
  session.ts          uid 쿠키 · 현재 사용자
  prisma.ts           Prisma 클라이언트 싱글턴
components/
  WireframeLayout.tsx 360×800 모바일 프레임 · 하단 탭
  CreateStepHeader.tsx 만들기 플로우 공통 헤더 (N / 6)
  ui/bar-visualizer.tsx 말소리 크기 막대
prisma/schema.prisma  User · Meetup · Participant
scripts/check.mjs     회귀 검증
docs/기능명세.md       화면·플로우·규칙 상세
```

### API 한눈에

| 경로 | 메서드 | 하는 일 |
|---|---|---|
| `/api/realtime/session` | POST | Realtime 단수명 키 발급. 본 API 키는 서버 밖으로 안 나감 |
| `/api/transcribe` | POST | 녹음 파일 → 한국어 전사 (`whisper-1`) |
| `/api/tts` | POST | 문장 → mp3 음성 (`tts-1`, alloy) |
| `/api/parse-meetup` | POST | 발화 → `시간/장소/활동` 추출·정정·요약 |
| `/api/summarize-message` | POST | 긴 한마디 → 2문장·문장당 20자 이내 요약 |
| `/api/places/search` | POST | 말한 장소 → 반경 5km 안의 실제 좌표 |
| `/api/meetups` | POST | 동행 등록 |
| `/api/meetups/[id]/cancel` | POST | 만든 동행 취소 (작성자 본인만) |
| `/api/auth/demo` | POST | 데모 로그인 — 랜덤 별명 사용자 생성 + `uid` 쿠키 |
| `/api/user/location` | POST | 현재 위치 저장 |

---

## 4. 동행 만들기 플로우

두 갈래가 있고, 둘 다 같은 `sessionStorage` 초안(`lib/draft.ts`)을 채웁니다.

**① 한 화면에서 말로 (`/create/listening`)**
음성 도우미와 대화하며 `시간 → 장소 → 활동` 을 채웁니다. 다 차면 `올리기`.

**② 단계별로 (`/create/activity` 부터)**

```
1 뭐 하실래요      /create/activity
2 몇 시에 만날까요  /create/time
3 얼마나 걸릴까요   /create/duration
4 어디서 만날까요   /create/place     (3에서 장소를 이미 알면 건너뜀)
5 몇 분이 함께할까요 /create/people
6 하실 말씀 있으세요 /create/message   ← 여기도 말로 입력 가능
  이대로 올릴까요   /create/review
  올렸어요         /create/posted     → 여기서 실제 DB 저장
```

`/create/review` 까지는 전부 브라우저 안에만 있습니다. **`/create/posted` 에 도착해야
`POST /api/meetups` 가 나가고 DB에 남습니다.** 중간에 나가면 아무것도 저장되지 않습니다.

---

## 5. 배포

Railway 에 붙어 있고 **`main` 브랜치에 push 하면 자동 배포**됩니다.

```bash
git push origin main
```

- 시작 명령이 `prisma migrate deploy && next start` 라 마이그레이션이 배포 때 자동 적용됩니다.
- 스키마를 바꿨다면 `npx prisma migrate dev --name <설명>` 으로 만든 마이그레이션 파일을
  **반드시 함께 커밋**하세요. 안 그러면 배포 서버에서 컬럼이 없어 500이 납니다.
- 환경 변수는 Railway 대시보드에서 관리합니다. `.env.local` 은 커밋되지 않습니다.

### push 가 403 으로 막힐 때

이 저장소 소유 계정은 `seraghmicael-lgtm` 입니다. 같은 머신에서 다른 GitHub 계정을 쓴 뒤에는
자격증명이 어긋나 `Permission denied` 가 납니다.

```bash
gh auth switch --user seraghmicael-lgtm
gh auth setup-git      # 그래도 안 되면 (macOS 키체인 캐시가 오래된 경우)
git push origin main
```

---

## 6. 문제가 생겼을 때

**소리가 안 나요 / 도우미가 말을 안 해요**
브라우저는 사용자가 화면을 한 번 누르기 전에는 소리를 막습니다. 마이크 버튼을 한 번 누르면
`unlockAudio()` 가 잠금을 풉니다. 그래도 안 되면 탭이 음소거됐는지 확인하세요.

**마이크가 안 잡혀요**
`http://` 로 접속했는지 보세요 (localhost 제외). `/create/listening` 화면 마이크 버튼 아래
작은 회색 글씨가 진단 표시줄입니다 — `마이크 송신 0`, `입력장치: ...` 같은 실제 원인이 찍힙니다.

**필드가 안 채워지거나 같은 걸 계속 물어요**
`OPENAI_API_KEY` 를 확인하세요. 키가 없으면 `/api/parse-meetup` 이 조용히 폴백으로 빠져
입력을 그대로 되돌려주기만 합니다(빈 필드 유지 → 계속 재질문). 서버 로그에
`OPENAI_API_KEY missing` 이 찍힙니다.

**`npm run check` 가 "서버가 켜져 있나요?" 로 끝나요**
계약 검사는 실제 서버에 요청합니다. 다른 터미널에서 `npm run dev` 를 먼저 켜세요.

**말한 장소가 지도에 안 찍혀요**
먼저 위치 동의를 했는지 보세요 — 동의를 안 했으면 검색할 반경이 없어 아예 검색하지 않습니다.
그 다음은 API 활성화입니다. Google Cloud Console 에서 **Places API (New)** 가 프로젝트에
켜져 있어야 합니다. 키의 "API 제한사항" 목록에 넣는 것만으로는 안 되고, `API 및 서비스 >
라이브러리` 에서 서비스를 켜야 합니다(꺼져 있으면 `403 SERVICE_DISABLED`). 꺼져 있으면
Geocoding 폴백으로 도는데, 주소 위주라 가게·시설 이름은 잘 못 찾습니다.

**빌드는 되는데 배포에서 500**
대부분 마이그레이션 누락입니다. `prisma/migrations/` 에 새 폴더가 커밋됐는지 확인하세요.

---

## 7. 이 코드를 고칠 때 지킬 것

1. **와이어프레임이 기준입니다.** 화면 문구·레이아웃은 Figma 에 있는 그대로 옮깁니다.
   임의로 문구를 각색하거나 없는 기능을 더하지 않습니다.
2. **질문 문구와 순서는 `lib/meetupDialog.ts` 한 곳에서만 정의합니다.** 서버 파서 프롬프트,
   음성 에이전트 지침, 화면 폴백이 전부 이 파일을 참조합니다. 한 곳만 바꾸면 셋이 함께 바뀝니다.
3. **음성 쪽을 고쳤으면 `npm run check` 를 통과시키세요.** 이 영역은 타입 검사가 못 잡습니다.
4. **`?from=` / `?next=` 같은 쿼리를 링크에 쓸 땐 `safeInternalPath()` 를 통과시키세요.**
   문자열 접두사 검사는 우회됩니다(실제로 뚫린 적 있음).
5. **`WireframeLayout` 에 `justify-*` / `items-*` 클래스를 직접 넣지 마세요.** `justify` / `items`
   prop 을 쓰세요. 직접 넣으면 레이아웃이 깨집니다(실제로 깨진 적 있음).
