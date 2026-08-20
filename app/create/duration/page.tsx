"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";
import HeaderBack from "@/components/HeaderBack";
import { computeEndTime } from "@/lib/koreanTime";

const OPTIONS: { label: string; minutes: number }[] = [
  { label: "30분", minutes: 30 },
  { label: "1시간", minutes: 60 },
  { label: "2시간", minutes: 120 },
  { label: "2시간 넘게", minutes: 120 },
];

interface Draft {
  transcript?: string;
  time?: string;
  location?: string;
  activity?: string;
}

export default function CreateDurationPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>({});
  const [selected, setSelected] = useState("2시간");

  useEffect(() => {
    const raw = sessionStorage.getItem("dorandoran_meetup_draft");
    if (raw) {
      try {
        setDraft(JSON.parse(raw));
      } catch {
        // ignore broken draft; fall back to Figma example values below
      }
    }
  }, []);

  const time = draft.time || "오후 3시";
  const location = draft.location || "송정 오일장";
  const activity = draft.activity || "오일장 구경";

  const minutes = OPTIONS.find((o) => o.label === selected)?.minutes ?? 120;
  const endTime = computeEndTime(time, minutes);
  const rangeText = endTime ? `${time} ~ ${endTime}` : time;

  const handleNext = () => {
    const dayPrefix = time.includes("오늘") || time.includes("내일") ? "" : "오늘 ";
    const nextDraft = {
      ...draft,
      time,
      location,
      activity,
      duration: selected,
      startTime: `${dayPrefix}${rangeText}`,
    };
    sessionStorage.setItem("dorandoran_meetup_draft", JSON.stringify(nextDraft));
    router.push("/create/people");
  };

  return (
    <WireframeLayout justify="start" className="flex flex-col">
      <HeaderBack title="얼마나 걸릴까요?" backHref="/create/confirm" />

      <div className="p-4 flex flex-col gap-5">
        {/* Recap box */}
        <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col gap-1.5 text-left">
          <span className="text-xs text-gray-500 font-medium">지금까지 정하신 내용</span>
          <p className="text-sm font-bold text-black leading-relaxed">
            오늘 {time}에 {location}에서 {activity} 같이 하실 분
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold text-black">얼마나 걸릴까요?</h1>
          <p className="text-sm text-gray-600">대충 정하셔도 돼요. 나중에 바꾸실 수 있어요.</p>
        </div>

        {/* 2x2 duration options */}
        <div className="grid grid-cols-2 gap-2.5">
          {OPTIONS.map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={() => setSelected(o.label)}
              className={`h-[59px] flex items-center justify-center rounded text-base border cursor-pointer ${
                selected === o.label
                  ? "border-black border-2 bg-gray-100 font-bold text-black"
                  : "border-gray-300 bg-white text-black"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Result preview row */}
        <div className="w-full px-4 py-3.5 border border-gray-200 rounded-lg bg-white flex items-center justify-between">
          <span className="text-sm text-gray-600">그러면 이렇게 올라가요</span>
          <span className="text-sm font-bold text-black">{rangeText}</span>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="w-full h-[55px] bg-black text-white flex items-center justify-center rounded text-sm font-medium cursor-pointer"
        >
          다음
        </button>
      </div>
    </WireframeLayout>
  );
}
