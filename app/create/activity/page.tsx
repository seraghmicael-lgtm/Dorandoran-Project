"use client";

import { useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";
import CreateStepHeader from "@/components/CreateStepHeader";
import SmartInput from "@/components/SmartInput";
import { updateDraft } from "@/lib/draft";

// 와이어프레임_v02 01_뭐 하실래요 (활동)
const OPTIONS = ["산책", "등산", "바둑", "맛집탐방", "장보기", "커피"];
const FULL_WIDTH_OPTION = "병원";

export default function CreateActivityPage() {
  const router = useRouter();

  const choose = (activity: string) => {
    updateDraft({ activity });
    router.push("/create/time");
  };

  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      <CreateStepHeader step={1} backHref="/home" />

      <div className="px-[18px] py-[22px] flex flex-col">
        <h1 className="text-[22px] font-bold text-black">뭐 하실래요?</h1>
        <div className="h-5" />

        <div className="flex flex-col gap-2.5">
          {[0, 2, 4].map((i) => (
            <div key={i} className="flex gap-2.5">
              {[OPTIONS[i], OPTIONS[i + 1]].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => choose(opt)}
                  className="flex-1 border border-gray-300 py-[22px] flex justify-center text-[19px] font-bold text-black cursor-pointer hover:bg-gray-50 active:bg-gray-100"
                >
                  {opt}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="h-2.5" />
        <button
          type="button"
          onClick={() => choose(FULL_WIDTH_OPTION)}
          className="w-full border border-gray-300 py-[22px] flex justify-center text-[19px] font-bold text-black cursor-pointer hover:bg-gray-50 active:bg-gray-100"
        >
          {FULL_WIDTH_OPTION}
        </button>

        <div className="h-5" />
        <SmartInput
          hint="“커피”처럼 쓰거나 말하셔도 돼요"
          suggestions={[...OPTIONS, FULL_WIDTH_OPTION]}
          onConfirm={choose}
        />
      </div>
    </WireframeLayout>
  );
}
