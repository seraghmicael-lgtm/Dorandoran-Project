"use client";

import Link from "next/link";
import { useState } from "react";
import PushNotification from "./PushNotification";

// 프로토타입 전용 — 실제 발송 로직 없이 UI디자인의 PUSH-01/02/03 을 그 자리에서 띄워 본다.
// 화면 오른쪽 밖에 트리거 버튼 3개를 두고, 누르면 지금 화면 위로 알림이 드롭다운된다.
const VARIANTS = {
  all: {
    label: "모두 모임",
    headline: "3시 산책동행, 정원이 모두 모였어요!",
    sub: "즐거운 시간 보내세요.",
  },
  some: {
    label: "일부 모임",
    headline: "3시 산책동행에 도란도란님 외 3명이 참여했어요",
    sub: "30분 전에 다시 알려드릴게요.",
  },
  cancelled: {
    label: "취소",
    headline: "오후 3시 산책동행은 열리지 않았어요",
    sub: "같은 내용으로 다시 열어보실래요?",
  },
} as const;

type VariantKey = keyof typeof VARIANTS;

export default function PushDemo() {
  const [open, setOpen] = useState<VariantKey | null>(null);

  return (
    <>
      {/* 화면 오른쪽 위 바깥의 프로토타입 조작판 — 실제 UI가 아니다 */}
      <div className="fixed right-2 top-16 z-40 flex flex-col gap-2">
        <Link
          href="/home"
          className="px-2.5 py-1.5 rounded-full bg-black/70 text-white text-[11px] font-bold whitespace-nowrap text-center"
        >
          홈으로
        </Link>
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
        <div
          className="absolute inset-0 z-30 bg-[rgba(123,123,123,0.7)] backdrop-blur-[1.5px] cursor-pointer"
          onClick={() => setOpen(null)}
        >
          <PushNotification headline={VARIANTS[open].headline} sub={VARIANTS[open].sub} />
        </div>
      )}
    </>
  );
}
