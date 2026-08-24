"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";
import CreateStepHeader from "@/components/CreateStepHeader";
import MemoryBubbles from "@/components/MemoryBubbles";
import { computeEndClock, computeEndTime } from "@/lib/koreanTime";
import { MeetupDraft, loadDraft, updateDraft } from "@/lib/draft";

// 와이어프레임_v02 03_얼마나 걸릴까요 — 선택한 시간 기준으로 끝나는 시각을 보여준다
const OPTIONS: { label: string; minutes: number | null }[] = [
  { label: "30분", minutes: 30 },
  { label: "1시간", minutes: 60 },
  { label: "2시간", minutes: 120 },
  { label: "2시간 이상", minutes: null }, // 끝나는 시각을 안 정해요
];

export default function CreateDurationPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<MeetupDraft>({});

  useEffect(() => {
    const d = loadDraft();
    if (d) setDraft(d);
  }, []);

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
    const d = loadDraft();
    router.push(d?.location ? "/create/people" : "/create/place");
  };

  const endLabel = (minutes: number | null): string => {
    if (minutes == null) return "끝나는 시각을 안 정해요";
    const end = computeEndClock(time, minutes);
    return end ? `${end}에 끝나요` : "";
  };

  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      <CreateStepHeader step={3} backHref="/create/time" />

      <div className="px-[18px] py-[22px] flex flex-col">
        <MemoryBubbles />
        <h1 className="text-[22px] font-bold text-black">얼마나 걸릴까요?</h1>
        <div className="h-5" />

        <div className="flex flex-col gap-2.5">
          {OPTIONS.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => choose(opt)}
              className="w-full border border-gray-300 px-[18px] py-[19px] flex items-center justify-between cursor-pointer hover:bg-gray-50 active:bg-gray-100"
            >
              <span className="text-[20px] font-bold text-black">{opt.label}</span>
              <span className="text-[15px] text-gray-500">{endLabel(opt.minutes)}</span>
            </button>
          ))}
        </div>
      </div>
    </WireframeLayout>
  );
}
