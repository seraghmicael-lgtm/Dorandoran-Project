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
export default function MemoryChips() {
  const raw = useSyncExternalStore(subscribeDraft, draftSnapshot, noDraftOnServer);

  let draft: MeetupDraft | null = null;
  try {
    draft = raw ? (JSON.parse(raw) as MeetupDraft) : null;
  } catch {
    draft = null; // 깨진 값이면 없는 셈 친다
  }

  const chips = memoryChips(draft);
  if (chips.length === 0) return null;

  return (
    <div className="mt-5 flex flex-wrap gap-2" aria-label="지금까지 정하신 것">
      {chips.map((c) => (
        <span
          key={c}
          className="h-[30px] px-2.5 inline-flex items-center rounded-md bg-chip text-[14px] text-black"
        >
          {c}
        </span>
      ))}
    </div>
  );
}
