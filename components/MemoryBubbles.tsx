"use client";

import { useSyncExternalStore } from "react";
import {
  MeetupDraft,
  draftSnapshot,
  noDraftOnServer,
  memoryChips,
  subscribeDraft,
} from "@/lib/draft";

// Figma 941:980 "메모리풍선" — 동행 만들기 각 화면 맨 위에 지금까지 기록한 것을 회색 칩으로 건다.
// 단계를 지날수록 칩이 하나씩 늘어나서, 어르신이 "내가 뭘 말했더라"를 되짚으러
// 뒤로 가지 않아도 된다. 기록이 하나도 없으면(첫 화면) 아무것도 안 보여준다.
export default function MemoryBubbles() {
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
    <div className="flex flex-wrap gap-2 pb-1" aria-label="지금까지 정하신 것">
      {chips.map((c) => (
        <span
          key={c}
          className="h-[30px] px-2 inline-flex items-center rounded-md bg-gray-100 text-[15px] text-black"
        >
          {c}
        </span>
      ))}
    </div>
  );
}
