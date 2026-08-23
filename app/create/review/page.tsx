"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";
import CreateStepHeader from "@/components/CreateStepHeader";
import { MeetupDraft, loadDraft } from "@/lib/draft";

// 와이어프레임_v02 07_이대로 올릴까요
export default function CreateReviewPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<MeetupDraft | null>(null);

  useEffect(() => {
    const d = loadDraft();
    if (d) setDraft(d);
  }, []);

  const time = draft?.time ?? null;
  const location = draft?.location ?? null;
  const duration = draft?.duration ?? null;
  const maxPeople = draft?.maxPeople ?? null;
  const rawActivity = draft?.activity ?? null;
  const message = draft?.message ?? null;

  const activity = rawActivity
    ? rawActivity.includes("같이 하실 분")
      ? rawActivity
      : `${rawActivity} 같이 하실 분`
    : null;

  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      <CreateStepHeader step={0} backHref="/create/message" title="이렇게 올릴게요" right="마지막" />

      <div className="px-[18px] py-[22px] flex flex-col">
        <h1 className="text-[22px] font-bold text-black">이대로 올릴까요?</h1>
        <div className="h-5" />

        {/* 미리보기 카드 — 회색 테두리, 좌측 정렬 */}
        <div className="border border-gray-300 px-[18px] py-[15px] flex flex-col gap-2 text-left">
          {time && location && (
            <p className="text-[15px] text-gray-500">{time} · {location}</p>
          )}
          {(duration || maxPeople != null) && (
            <p className="text-[15px] text-gray-500">
              {duration && `${duration} 걸려요`}
              {duration && maxPeople != null && " · "}
              {maxPeople != null && `${maxPeople}명 모집`}
            </p>
          )}
          {activity && (
            <p className="text-[20px] font-bold text-black">{activity}</p>
          )}
          {message && (
            <p className="text-[15px] text-gray-500">“{message}”</p>
          )}
        </div>

        <div className="h-5" />
        <button
          type="button"
          onClick={() => router.push("/create/posted")}
          className="w-full py-[14px] bg-black text-white text-[15px] font-bold cursor-pointer"
        >
          이대로 올릴게요
        </button>

        <div className="h-2.5" />
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full border border-gray-300 py-[14px] flex justify-center text-[15px] font-bold text-black cursor-pointer hover:bg-gray-50 active:bg-gray-100"
        >
          고칠래요
        </button>
      </div>
    </WireframeLayout>
  );
}
