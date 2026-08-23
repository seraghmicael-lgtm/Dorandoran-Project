"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";
import HeaderBack from "@/components/HeaderBack";
import { MeetupDraft, loadDraft, updateDraft } from "@/lib/draft";

const OPTIONS = [2, 3, 4, 5];
const KOREAN_COUNT = ["", "한", "두", "세", "네"];


export default function CreatePeoplePage() {
  const router = useRouter();
  const [draft, setDraft] = useState<MeetupDraft>({});
  const [selected, setSelected] = useState(3);

  useEffect(() => {
    const d = loadDraft();
    if (d) setDraft(d);
  }, []);

  const startTime = draft.startTime || "오늘 오후 3시 ~ 5시";
  const location = draft.location || "송정 오일장";
  const activity = draft.activity || "오일장 구경";
  const waiting = KOREAN_COUNT[selected - 1] || `${selected - 1}`;

  const handlePost = () => {
    updateDraft({ maxPeople: selected });
    router.push("/create/posted");
  };

  return (
    <WireframeLayout justify="start" className="flex flex-col">
      <HeaderBack title="몇 분이 함께할까요?" backHref="/create/place" />

      <div className="p-4 flex flex-col gap-5">
        {/* Recap box */}
        <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col gap-1.5 text-left">
          <span className="text-xs text-gray-500 font-medium">지금까지 정하신 내용</span>
          <p className="text-sm font-bold text-black leading-relaxed">
            {startTime} · {location} {activity} 같이 하실 분
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold text-black">몇 분이 함께할까요?</h1>
          <p className="text-sm text-gray-600">어르신을 포함한 숫자예요.</p>
        </div>

        {/* 2x2 people options */}
        <div className="grid grid-cols-2 gap-2.5">
          {OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSelected(n)}
              className={`h-[59px] flex items-center justify-center rounded text-base border cursor-pointer ${
                selected === n
                  ? "border-black border-2 bg-gray-100 font-bold text-black"
                  : "border-gray-300 bg-white text-black"
              }`}
            >
              {n}명
            </button>
          ))}
        </div>

        {/* Info box */}
        <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col gap-1 text-left">
          <p className="text-sm font-bold text-black">어르신 말고 {waiting} 분을 기다려요</p>
          <p className="text-xs text-gray-600">적게 잡을수록 빨리 만들어져요.</p>
        </div>

        <button
          type="button"
          onClick={handlePost}
          className="w-full h-[55px] bg-black text-white flex items-center justify-center rounded text-sm font-medium cursor-pointer"
        >
          이대로 올리기
        </button>
      </div>
    </WireframeLayout>
  );
}
