"use client";

import { useState } from "react";
import PushLockScreen from "./PushLockScreen";

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

  return (
    <>
      {/* 화면 오른쪽 위 바깥의 프로토타입 조작판 — 실제 UI가 아니다 */}
      <div className="fixed right-2 top-16 z-40 flex flex-col gap-2">
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
