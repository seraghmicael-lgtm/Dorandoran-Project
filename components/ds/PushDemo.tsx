"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import PushLockScreen from "./PushLockScreen";
import { SCREEN_FLOW } from "@/lib/screenFlow";

// 프로토타입 전용 — 실제 발송 로직 없이 UI디자인의 PUSH-01/02/03 을 그 자리에서 띄워 본다.
// 화면 오른쪽 밖에 트리거 버튼 3개를 두고, 누르면 폰이 잠긴 대기 화면 전체가 뜬다
// (지금 화면 위 드롭다운이 아니다 — 알림이 오는 순간을 통째로 재현한다).
const VARIANTS = {
  all: {
    label: "모두 모임",
    headline: "오후 3시 산책, 네 명이 다 모였어요",
    sub: "30분 전에 다시 알려드릴게요.",
  },
  some: {
    label: "일부 모임",
    headline: "오후 3시 산책, 한 시간 남았어요",
    sub: "도란도란님 외 1명이 함께 가세요.\n도란공원 정문에서 만나요.",
  },
  cancelled: {
    label: "취소",
    headline: "오후 3시 산책, 아쉽게도\n열리지 않았어요",
    sub: "조용히 내렸어요. 기록도 안 남았고요.\n같은 내용으로 다시 열어보실래요?",
  },
} as const;

type VariantKey = keyof typeof VARIANTS;

export default function PushDemo() {
  const [open, setOpen] = useState<VariantKey | null>(null);
  const pathname = usePathname();

  // 현재 화면이 순환 목록 어디쯤인지 — 동적 id 화면(/meetup/1 등)처럼 목록에 없으면 -1
  const currentIndex = SCREEN_FLOW.findIndex((r) => r.href === pathname);
  const prevHref = currentIndex > 0 ? SCREEN_FLOW[currentIndex - 1].href : null;
  const nextHref =
    currentIndex >= 0 && currentIndex < SCREEN_FLOW.length - 1
      ? SCREEN_FLOW[currentIndex + 1].href
      : null;

  return (
    <>
      {/* 화면 오른쪽 위 바깥의 프로토타입 조작판 — 실제 UI가 아니다.
          창이 좁아지면(md 미만) 360 프레임 위로 겹쳐 앉으므로 아예 감춘다 */}
      <div className="fixed right-2 top-16 z-40 hidden md:flex flex-col gap-2">
        <div className="flex gap-1">
          <button
            type="button"
            disabled={!prevHref}
            onClick={() => prevHref && (window.location.href = prevHref)}
            className="flex-1 px-2 py-1.5 rounded-full bg-black/70 text-white text-[11px] font-bold cursor-pointer whitespace-nowrap disabled:opacity-30 disabled:cursor-default"
          >
            ‹ 이전
          </button>
          <button
            type="button"
            disabled={!nextHref}
            onClick={() => nextHref && (window.location.href = nextHref)}
            className="flex-1 px-2 py-1.5 rounded-full bg-black/70 text-white text-[11px] font-bold cursor-pointer whitespace-nowrap disabled:opacity-30 disabled:cursor-default"
          >
            다음 ›
          </button>
        </div>
        <button
          type="button"
          // Link 의 클라이언트 전환이 씹히는 경우가 있어(재현 안 됨) — 아예 하드 이동으로 확실히 보낸다
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          onClick={() => (window.location.href = "/splash")}
          className="px-2.5 py-1.5 rounded-full bg-black/70 text-white text-[11px] font-bold cursor-pointer whitespace-nowrap"
        >
          첫화면
        </button>
        <button
          type="button"
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          onClick={() => (window.location.href = "/home")}
          className="px-2.5 py-1.5 rounded-full bg-black/70 text-white text-[11px] font-bold cursor-pointer whitespace-nowrap"
        >
          홈으로
        </button>
        {(Object.keys(VARIANTS) as VariantKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setOpen(key)}
            className="px-2.5 py-1.5 rounded-full bg-black/70 text-white text-[11px] font-bold cursor-pointer whitespace-nowrap"
          >
            {VARIANTS[key].label}
          </button>
        ))}
      </div>

      {open && (
        <PushLockScreen
          headline={VARIANTS[open].headline}
          sub={VARIANTS[open].sub}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}
