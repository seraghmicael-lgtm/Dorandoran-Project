Dorandoran Project 피그마 업데이트 체크 작업이다. 매번 새 세션으로 실행되므로 아래 컨텍스트만으로 판단해라.

## 컨텍스트
- 로컬 저장소: ~/dorandoran-project (Next.js 15 App Router + TS + Tailwind, git repo, GitHub origin에 push하면 Railway가 자동 배포함)
- Figma: fileKey=6pNCoKTw7aIRe8wEm2efgx, nodeId=575:2 (페이지명 "와이어프레임")
- 기존 라우트/컴포넌트 구조와 지켜야 할 규칙은 docs/figma-wireframe-spec-v2/MIGRATION_PLAN.md 와
  프로젝트 메모리(project_dorandoran.md)에 있다 — 먼저 읽어라.
- 이전에 저장해둔 Figma 스냅샷: docs/figma-wireframe-spec-v2/.figma-baseline.xml

## 1단계 — 변경 감지 (네가 직접, agy 위임 아님 — Figma MCP 도구가 필요함)
1. mcp__figma__get_metadata 로 nodeId=575:2 전체를 다시 가져온다.
2. `.figma-baseline.xml`과 diff 떠서 실제로 달라진 게 있는지 확인한다.
3. **변경이 전혀 없으면 여기서 끝낸다.** 아무것도 커밋하지 말고 조용히 종료해라 (매 2시간마다 도는 크론이라 변화 없는 게 정상이다).
4. 변경이 있으면: 새로 생긴 프레임, 삭제된 프레임, 텍스트/좌표가 바뀐 프레임을 목록으로 정리한다.
   바뀐 프레임들에 대해서만 mcp__figma__get_screenshot 으로 스크린샷을 받고,
   docs/figma-wireframe-spec-v2/ 안의 대응하는 .txt/screenshots/*.png 를 갱신하거나 새로 만든다
   (이전 세션에서 쓰던 방식과 동일 — get_metadata 결과를 python으로 파싱해 화면별 텍스트+박스+선 트리로 저장).

## 2단계 — 반영 범위 판단
- 문구만 바뀐 경우(오타 수정, 카피 변경 등): 해당 라우트의 텍스트만 정확히 교체.
- 완전히 새 화면이 추가된 경우: MIGRATION_PLAN.md의 기존 라우트 명명 규칙을 따라 새 라우트를 만들고,
  어디서 연결될지 애매하면(진입점이 불명확하면) 지어내지 말고 `/routes` 인덱스에만 추가한 뒤
  아래 로그 파일에 "연결 위치 불명확 — 확인 필요"라고 명시해라.
- 화면이 삭제된 경우: 대응하는 v2 스펙 파일과 앱 라우트를 지운다. 단, 다른 화면에서 그 라우트로
  가는 링크가 남아있으면 링크도 같이 정리해라(끊어진 링크를 만들지 마라).
- **구조적으로 애매한 변경**(예: 새로운 분기 플로우, 로그인 순서 변경처럼 사용자 판단이 필요해 보이는 것)은
  스펙 파일만 갱신하고 라우트 rewiring은 가장 보수적/문자 그대로의 해석으로 하되,
  로그 파일에 어떤 판단을 왜 내렸는지 반드시 남겨라. 나중에 사람이 다시 볼 수 있게.
- 절대 규칙(변하지 않음): 스펙에 없는 문구·기능·아이콘·색 창작 금지. 순수 와이어프레임 스타일
  (흰배경/검정·회색 텍스트/얇은 회색 라인/검정or테두리 버튼) 유지. `lib/safePath.ts`의
  `safeInternalPath`와 `WireframeLayout`의 `justify`/`items` prop 패턴 재사용(className에 직접
  justify-center/items-center 넣지 말 것).

## 3단계 — 실제 코드 작업은 agy에게 위임해라
아래 형태로 실행해라(이미 이 계정에 설정된 셸 alias):

```
QQ_OK=1 agy --model gemini-3.6-flash-high --add-dir ~/dorandoran-project -p "<위에서 정리한 변경사항과 반영 지시를 구체적으로 적은 프롬프트>"
```

agy에게 줄 프롬프트에는 반드시: 바뀐 화면 목록, 각 화면이 어느 라우트에 대응하는지, 참고할 스펙
파일 경로, 위 "절대 규칙", 그리고 "끝나면 npm run build 통과 확인 후 git commit까지만(push는 하지 마라)"를
명시해라.

## 4단계 — 검수 (가볍게, 99/1 분담 원칙)
agy 작업이 끝나면:
- git diff --stat 로 변경 파일 확인
- npm run build 재실행해서 통과 확인 (agy가 이미 했더라도 직접 한번 더 확인)
- 바뀐 라우트 1~2개만 골라 실제 파일 내용이 스펙 텍스트와 맞는지 눈으로 확인 (전량 정독 아님)
- 문제 없으면 `.figma-baseline.xml`을 최신 metadata로 갱신하고 같이 커밋
- `git push origin main` (Railway 자동 배포됨)
- 문제 있으면(빌드 실패 등) push하지 말고 원인을 로그에 남기고 종료

## 5단계 — 로그 남기기
docs/figma-wireframe-spec-v2/UPDATE_LOG.md 맨 위에 다음 형식으로 한 항목 추가하고 같이 커밋해라:

```
## <오늘 날짜 시각>
- 감지된 변경: <요약>
- 반영한 라우트: <목록>
- 판단이 필요했던 부분: <있으면 적고, 없으면 "없음">
- 빌드/배포: <성공/실패>
```

작업 끝나면 위 로그 내용을 그대로 최종 응답으로 남겨라(사람이 나중에 알림/기록에서 확인한다).
