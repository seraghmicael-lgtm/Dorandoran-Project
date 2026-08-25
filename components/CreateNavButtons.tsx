"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  MeetupDraft,
  draftSnapshot,
  noDraftOnServer,
  subscribeDraft,
} from "@/lib/draft";

// Figma 938:639 — 흰 배경 · 회색 테두리 · 모서리 각짐 · 60px · 좌우 반반 · 간격 10px.
// 단계 사이를 앞뒤로 오갈 때 쓴다. 화면 위 ← 는 이 흐름에서 아예 빠져나가는(홈) 길이다.
export default function CreateNavButtons({
  backHref,
  nextHref,
  requires,
  onNext,
}: {
  backHref: string;
  /** 문자열이거나, 지금까지 정한 것에 따라 갈 곳이 달라지면 함수. onNext 를 주면 안 쓴다 */
  nextHref?: string | ((draft: MeetupDraft) => string);
  /** 이 항목을 아직 안 정했으면 다음으로 못 간다. 빈 채로 넘기면 뒤 화면이 기본값을 지어낸다. */
  requires?: keyof MeetupDraft;
  /** 화면에 아직 저장 안 된 선택이 떠 있는 경우(시각 고르기) — 다음이 그걸 확정하고 넘어간다 */
  onNext?: () => void;
}) {
  const router = useRouter();
  const raw = useSyncExternalStore(subscribeDraft, draftSnapshot, noDraftOnServer);

  let draft: MeetupDraft = {};
  try {
    if (raw) draft = JSON.parse(raw) as MeetupDraft;
  } catch {
    draft = {};
  }

  const value = requires ? draft[requires] : undefined;
  const canGoNext =
    onNext || !requires
      ? true
      : typeof value === "number"
      ? true
      : typeof value === "string" && value.trim().length > 0;

  return (
    <>
      <div className="h-4" />
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={() => router.push(backHref)}
          className="flex-1 h-[60px] border border-gray-300 bg-white flex items-center justify-center text-[19px] font-bold text-black cursor-pointer hover:bg-gray-50 active:bg-gray-100"
        >
          이전
        </button>
        <button
          type="button"
          onClick={() => {
            if (!canGoNext) return;
            if (onNext) return onNext();
            if (nextHref) router.push(typeof nextHref === "function" ? nextHref(draft) : nextHref);
          }}
          disabled={!canGoNext}
          className="flex-1 h-[60px] border border-gray-300 bg-white flex items-center justify-center text-[19px] font-bold text-black cursor-pointer hover:bg-gray-50 active:bg-gray-100 disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
        >
          다음
        </button>
      </div>
      <div className="h-4" />
    </>
  );
}
