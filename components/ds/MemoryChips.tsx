"use client";

import { useSyncExternalStore } from "react";
import {
  MeetupDraft,
  draftSnapshot,
  memoryChips,
  noDraftOnServer,
  subscribeDraft,
} from "@/lib/draft";

// UI디자인의 ds_tag — 지금까지 정한 것을 연노랑 칩으로 제목 아래에 건다.
// 단계를 지날수록 하나씩 늘어나고, 아무것도 없으면(첫 화면) 그리지 않는다.
// step 을 주면 이 화면에서 고르는 중인 값은 빼고 "앞 단계에서 정한 것"만 건다.
export default function MemoryChips({
  step,
  className = "mt-5 flex flex-wrap gap-1",
}: {
  step?: number;
  /** 줄 자리(여백·간격) — 화면마다 tag-list 줄의 좌우 여백이 다르다 */
  className?: string;
}) {
  const raw = useSyncExternalStore(subscribeDraft, draftSnapshot, noDraftOnServer);

  let draft: MeetupDraft | null = null;
  try {
    draft = raw ? (JSON.parse(raw) as MeetupDraft) : null;
  } catch {
    draft = null; // 깨진 값이면 없는 셈 친다
  }

  const chips = memoryChips(draft, step);
  if (chips.length === 0) return null;

  return (
    <div className={className} aria-label="지금까지 정하신 것">
      {chips.map((c) => (
        <span
          key={c}
          className="h-[30px] px-2 inline-flex items-center rounded bg-chip text-[14px] font-medium leading-none text-[#684A06]"
        >
          {c}
        </span>
      ))}
    </div>
  );
}
