"use client";

import { useSyncExternalStore } from "react";
import CreateStep from "@/components/ds/CreateStep";
import PrevNext from "@/components/ds/PrevNext";
import OptionButton from "@/components/ds/OptionButton";
import {
  MeetupDraft,
  draftSnapshot,
  noDraftOnServer,
  subscribeDraft,
  updateDraft,
} from "@/lib/draft";

// UI디자인 cr-05 (1089:7637) — 몇 명이 함께할까요?
const OPTIONS = [3, 4, 5, 6, 7, 8];

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
  const need = draft.maxPeople ?? 0;

  return (
    <CreateStep
      step={5}
      title={"몇 명이 함께할까요?"}
      backHref="/create/place"
      footer={<PrevNext backHref="/create/place" nextHref="/create/message" requires="maxPeople" />}
    >
      <p className="mt-8 text-[15px] text-muted text-center">나를 포함한 숫자예요</p>

      <div className="mt-4 flex flex-col gap-3">
        {[0, 2, 4].map((i) => (
          <div key={i} className="flex gap-3">
            {[OPTIONS[i], OPTIONS[i + 1]].map((n) => (
              <OptionButton
                key={n}
                label={`${n}명`}
                selected={draft.maxPeople === n}
                onClick={() => choose(n)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* cr-05 의 토글 — 최소 인원이 모여야 성사되는지 */}
      <div className="mt-6 rounded-xl border border-gray-200 px-4 py-4 flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[17px] font-bold text-black">
            {need ? `${need}명 ` : ""}
            {goAnyway ? "안 모여도 갈게요" : "모여야 갈게요"}
          </span>
          <span className="text-[14px] text-muted">최소 인원이 모여야 동행이 성사돼요</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={goAnyway}
          aria-label="최소 인원이 안 모여도 갈지"
          onClick={() => updateDraft({ goAnyway: !goAnyway })}
          className={`w-[52px] h-[30px] shrink-0 rounded-full p-[3px] flex cursor-pointer transition-colors ${
            goAnyway ? "bg-accent justify-end" : "bg-gray-300 justify-start"
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-white" />
        </button>
      </div>
    </CreateStep>
  );
}
