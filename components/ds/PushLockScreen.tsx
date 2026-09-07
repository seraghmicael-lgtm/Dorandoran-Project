"use client";

import PushNotification from "./PushNotification";

// 프로토타입 — 알림이 오는 순간을 "폰이 잠겨 있는 대기 화면"으로 통째로 재현한다(가상 배경).
// 지금 화면 위에 살짝 겹치던 드롭다운 대신, 화면 전체를 대기 화면으로 바꾼다.
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
      className="absolute inset-0 z-30 flex flex-col items-center bg-gradient-to-b from-[#2b3a4a] via-[#1c2733] to-[#0c1218] cursor-pointer"
      onClick={onClose}
    >
      <div className="mt-16 flex flex-col items-center text-white">
        <span className="text-[17px] font-medium">{date}</span>
        <span className="mt-1 text-[72px] font-bold leading-none tracking-tight">{time}</span>
      </div>

      <div className="mt-10 w-full px-2.5" onClick={(e) => e.stopPropagation()}>
        <PushNotification headline={headline} sub={sub} />
      </div>

      <span className="mt-auto mb-8 text-[13px] text-white/70">화면을 눌러 잠금 해제</span>
    </div>
  );
}
