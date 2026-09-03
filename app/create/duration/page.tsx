"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import CreateStep from "@/components/ds/CreateStep";
import PrevNext from "@/components/ds/PrevNext";
import OptionButton from "@/components/ds/OptionButton";
import { computeEndClock, computeEndTime } from "@/lib/koreanTime";
import {
  MeetupDraft,
  draftSnapshot,
  noDraftOnServer,
  subscribeDraft,
  updateDraft,
} from "@/lib/draft";

// UI디자인 cr-03 (1089:5933) — 활동은 얼마나 걸릴까요?
const OPTIONS: { label: string; minutes: number | null }[] = [
  { label: "30분 소요", minutes: 30 },
  { label: "1시간 소요", minutes: 60 },
  { label: "2시간 소요", minutes: 120 },
  { label: "2시간 이상", minutes: null }, // 끝나는 시각을 안 정해요
];

export default function CreateDurationPage() {
  const router = useRouter();
  const raw = useSyncExternalStore(subscribeDraft, draftSnapshot, noDraftOnServer);
  let draft: MeetupDraft = {};
  try {
    if (raw) draft = JSON.parse(raw) as MeetupDraft;
  } catch {
    draft = {};
  }

  const time = draft.time || "오후 3시";
  const dayPrefix = time.includes("오늘") || time.includes("내일") ? "" : "오늘 ";

  const choose = (opt: { label: string; minutes: number | null }) => {
    let startTime: string;
    if (opt.minutes == null) {
      startTime = `${dayPrefix}${time}`; // 끝 시각 미정
    } else {
      const end = computeEndTime(time, opt.minutes);
      startTime = end ? `${dayPrefix}${time} ~ ${end}` : `${dayPrefix}${time}`;
    }
    updateDraft({ duration: opt.label, startTime });
    // 음성 대화로 이미 장소가 정해졌으면 장소 화면은 건너뛴다
    router.push(draft.location ? "/create/people" : "/create/place");
  };

  return (
    <CreateStep
      step={3}
      title={"활동은\n얼마나 걸릴까요?"}
      backHref="/create/time"
      footer={
        <PrevNext
          backHref="/create/time"
          nextHref={(d) => (d.location ? "/create/people" : "/create/place")}
          requires="duration"
        />
      }
    >
      <div className="mt-6 flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <OptionButton
            key={opt.label}
            full
            label={opt.label}
            sub={
              opt.minutes == null
                ? undefined
                : computeEndClock(time, opt.minutes)
                ? `${computeEndClock(time, opt.minutes)}에 끝나요`
                : undefined
            }
            selected={draft.duration === opt.label}
            onClick={() => choose(opt)}
          />
        ))}
      </div>
    </CreateStep>
  );
}
