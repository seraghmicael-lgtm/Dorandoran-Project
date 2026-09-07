"use client";

import PushNotification from "./PushNotification";

// 프로토타입 — 알림이 오는 순간을 "폰이 잠겨 있는 대기 화면"으로 통째로 재현한다.
// UI디자인 PUSH-01/02/03 갱신분 — 실제 폰 잠금화면처럼 그라데이션 배경 + 손전등·카메라
// 바로가기 + 홈 인디케이터까지 갖췄다. 배경의 오로라 무늬는 CSS 그라데이션으로 근사한다
// (Figma 원본은 마스킹된 타원 20여 개를 겹친 것 — 자산 그대로 쓰면 무거워서 값만 맞춘다).
function useNow() {
  const now = new Date();
  const time = now.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
  const date = now.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" });
  return { time, date };
}

export default function PushLockScreen({
  headline,
  sub,
  onClose,
}: {
  headline: string;
  sub: string;
  onClose: () => void;
}) {
  const { time, date } = useNow();

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col items-center overflow-hidden cursor-pointer"
      style={{
        background:
          "radial-gradient(130% 90% at 100% 100%, rgba(168,85,247,0.55) 0%, transparent 55%), " +
          "radial-gradient(150% 110% at 95% 65%, rgba(37,99,235,0.75) 0%, transparent 55%), " +
          "#16235b",
      }}
      onClick={onClose}
    >
      <div className="mt-14 flex flex-col items-center text-white">
        <span className="text-[56px] font-bold leading-none tracking-tight tabular-nums">{time}</span>
        <span className="mt-2 text-[15px] font-medium">{date}</span>
      </div>

      <div className="mt-8 w-full px-3" onClick={(e) => e.stopPropagation()}>
        <PushNotification headline={headline} sub={sub} />
      </div>

      {/* 손전등·카메라 — 눌러도 아무 일 없다(장식). 진짜 잠금화면 느낌만 낸다 */}
      <div className="mt-auto mb-16 w-full px-7 flex items-center justify-between">
        <span className="w-[50px] h-[50px] rounded-full bg-white/15 flex items-center justify-center" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 2h6v4l-2 2v10a1 1 0 0 1-1 1h-0a1 1 0 0 1-1-1V8L9 6V2Z"
              stroke="white"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="w-[50px] h-[50px] rounded-full bg-white/15 flex items-center justify-center" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="7" width="18" height="13" rx="2.5" stroke="white" strokeWidth="1.6" />
            <circle cx="12" cy="13.5" r="3.4" stroke="white" strokeWidth="1.6" />
            <path d="M8.5 7 9.7 4.8h4.6L15.5 7" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
      </div>

      <span className="absolute bottom-2 w-[134px] h-[5px] rounded-full bg-white" aria-hidden="true" />
    </div>
  );
}
