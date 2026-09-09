// 프로토타입 리뷰용 화면 순서 — /routes 목록과 PushDemo 이전/다음 버튼이 같이 쓴다.
// 동적 id 화면(/meetup/[id] 등)은 고정 경로가 없어 순환 목록에서 뺐다.
export const SCREEN_FLOW = [
  { href: "/splash", label: "/splash (진입 스플래시 + on-01 시작 레이어 통합)" },
  { href: "/location-permission", label: "/location-permission (02_위치 권한)" },
  { href: "/home", label: "/home (03_홈)" },
  { href: "/signup", label: "/signup (04_회원가입)" },
  { href: "/notification-permission", label: "/notification-permission (05_알림허용)" },
  { href: "/welcome", label: "/welcome (06_활동명 부여 환영)" },
  { href: "/create/activity", label: "/create/activity (01_뭐 하실래요)" },
  { href: "/create/listening", label: "/create/listening (음성으로 말하기)" },
  { href: "/create/time", label: "/create/time (02_몇 시에 만날까요)" },
  { href: "/create/duration", label: "/create/duration (03_얼마나 걸릴까요)" },
  { href: "/create/place", label: "/create/place (04_어디서 만날까요)" },
  { href: "/create/people", label: "/create/people (05_몇 분이 함께할까요)" },
  { href: "/create/message", label: "/create/message (06_하실 말씀)" },
  { href: "/create/review", label: "/create/review (07_이렇게 올릴까요)" },
  { href: "/create/posted", label: "/create/posted (08_올렸어요)" },
  { href: "/my-meetups", label: "/my-meetups (01_내 동행 확인(참여))" },
  { href: "/my-meetups/created", label: "/my-meetups/created (02_내 동행 확인(개설))" },
  { href: "/my-meetups/cancel", label: "/my-meetups/cancel (참여 취소)" },
  { href: "/my-meetups/cancel/complete", label: "/my-meetups/cancel/complete (처리 완료)" },
  { href: "/my-meetups/expired", label: "/my-meetups/expired (07_불발 알림)" },
] as const;
