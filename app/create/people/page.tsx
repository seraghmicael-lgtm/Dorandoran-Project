"use client";

import { useSyncExternalStore } from "react";
import CreateStep from "@/components/ds/CreateStep";
import MemoryChips from "@/components/ds/MemoryChips";
import PrevNext from "@/components/ds/PrevNext";
import OptionButton from "@/components/ds/OptionButton";
import {
  MeetupDraft,
  draftSnapshot,
  noDraftOnServer,
  subscribeDraft,
  updateDraft,
} from "@/lib/draft";

// UI디자인 cr-05 (1187:4536) — 몇 명이 함께할까요?
//
// 줄 순서와 자리(좌우 16 기준):
//   칩(176) → 2열 격자 158×56, 사이 12 (272) → 흰 카드 토글(464)
// 줄마다 좌우 여백이 같아 body="bare" 로 두고 블록마다 px-4 를 준다.
const OPTIONS = [3, 4, 5, 6, 7, 8];

// 토글 문구는 디자인이 "네명"처럼 우리말 수로 적는다(1187:4634).
const KOREAN_COUNT: Record<number, string> = {
  3: "세",
  4: "네",
  5: "다섯",
  6: "여섯",
  7: "일곱",
  8: "여덟",
};

export default function CreatePeoplePage() {
  const raw = useSyncExternalStore(subscribeDraft, draftSnapshot, noDraftOnServer);
  let draft: MeetupDraft = {};
  try {
    if (raw) draft = JSON.parse(raw) as MeetupDraft;
  } catch {
    draft = {};
  }

  // 인원만 고르고 바로 넘기지 않는다 — 토글을 만질 시간을 준다. 다음은 하단 버튼으로.
  const choose = (n: number) => updateDraft({ maxPeople: n });

  // 최소 인원이 안 모여도 그냥 나갈지 — 켜두면 인원과 상관없이 성사된다
  const goAnyway = draft.goAnyway ?? true;
  const need = draft.maxPeople;

  return (
    <CreateStep
      step={5}
      title={"몇 명이\n함께할까요?"}
      // title(1187:4541) — 제목과 한 묶음이라 16px/#777 로 제목 바로 밑에 붙는다
      desc="나를 포함한 숫자예요"
      backHref="/create/place"
      body="bare"
      chips={false}
      footer={<PrevNext backHref="/create/place" nextHref="/create/message" requires="maxPeople" />}
    >
      {/* tag-list(1187:4557) — 좌우 16 · 위아래 16 */}
      <MemoryChips step={5} className="px-4 py-4 flex flex-wrap gap-1" />

      {/* card-list(1187:4618) — 2열 격자. 칸 158×56, 사이 12 (360 기준 좌우 16) */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {OPTIONS.map((n) => (
          <OptionButton
            key={n}
            variant="pair"
            label={`${n}명`}
            selected={draft.maxPeople === n}
            onClick={() => choose(n)}
          />
        ))}
      </div>

      {/* 1187:4561 — 좌우 16 · 위아래 16 자리에 ds_card 하나(테두리 없이 그림자, radius 12) */}
      <div className="px-4 py-4">
        <div className="rounded-xl bg-white p-4 flex flex-col gap-2 shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[16px] font-medium leading-[1.5] text-black">
              {need ? `${KOREAN_COUNT[need] ?? need}명 ` : ""}
              {goAnyway ? "안 모여도 갈게요" : "모여야 갈게요"}
            </span>
            {/* ds_switch(1100:8319) — 40×22. 켜면 accent, 손잡이는 18 짜리 흰 원 */}
            <button
              type="button"
              role="switch"
              aria-checked={goAnyway}
              aria-label="최소 인원이 안 모여도 갈지"
              onClick={() => updateDraft({ goAnyway: !goAnyway })}
              className={`w-10 h-[22px] shrink-0 rounded-full p-0.5 flex cursor-pointer transition-colors ${
                goAnyway ? "bg-accent justify-end" : "bg-[#E5E5E5] justify-start"
              }`}
            >
              <span className="size-[18px] rounded-full bg-white" />
            </button>
          </div>
          <p className="text-[14px] leading-[1.5] text-[#777777]">
            최소 인원이 모여야 동행이 성사돼요
          </p>
        </div>
      </div>
    </CreateStep>
  );
}
