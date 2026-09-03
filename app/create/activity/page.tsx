"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import CreateStep from "@/components/ds/CreateStep";
import PrevNext from "@/components/ds/PrevNext";
import OptionButton from "@/components/ds/OptionButton";
import SmartInput from "@/components/SmartInput";
import {
  clearDraft,
  draftSnapshot,
  noDraftOnServer,
  subscribeDraft,
  updateDraft,
  MeetupDraft,
} from "@/lib/draft";
import { ACTIVITY_SUGGESTIONS } from "@/lib/activitySuggestions";

// UI디자인 cr-01 (1089:5107) — 어떤 활동을 하고 싶으세요?
const OPTIONS = ["산책", "등산", "여행", "맛집탐방", "장보기", "커피", "병원"];

export default function CreateActivityPage() {
  const router = useRouter();
  const raw = useSyncExternalStore(subscribeDraft, draftSnapshot, noDraftOnServer);
  let chosen: string | undefined;
  try {
    chosen = raw ? (JSON.parse(raw) as MeetupDraft).activity ?? undefined : undefined;
  } catch {
    chosen = undefined;
  }

  // 만들기로 새로 들어온 경우(?new=1)에만 앞 회차 기록을 비운다.
  // 2단계에서 "이전"으로 돌아온 경우엔 표시가 없으니 고른 값이 그대로 남는다.
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("new")) return;
    clearDraft();
    window.history.replaceState(null, "", "/create/activity");
  }, []);

  const choose = (activity: string) => {
    updateDraft({ activity });
    router.push("/create/time");
  };

  return (
    <CreateStep
      step={1}
      title={"어떤 활동을\n하고 싶으세요?"}
      footer={<PrevNext backHref="/home" nextHref="/create/time" requires="activity" />}
    >
      <div className="mt-5">
        <SmartInput
          placeholder="예) 장보러 가실 분 있나요"
          suggestions={ACTIVITY_SUGGESTIONS}
          onConfirm={choose}
        />
      </div>

      {/* 두 칸 격자 — 홀수라 혼자 남는 마지막 칸(병원)도 나머지와 같은 너비다.
          줄마다 flex 로 나누면 짝이 없는 칸이 padding 만큼 넓어진다. */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {OPTIONS.map((option) => (
          <OptionButton
            key={option}
            label={option}
            full
            selected={chosen === option}
            onClick={() => choose(option)}
          />
        ))}
      </div>
    </CreateStep>
  );
}
