"use client";

import { useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";
import CreateStepHeader from "@/components/CreateStepHeader";
import SmartInput from "@/components/SmartInput";
import { updateDraft } from "@/lib/draft";

// 와이어프레임_v02 02_몇 시에 만날까요
const OPTIONS = ["오후 3시", "오후 3시 30분", "오후 4시", "오후 4시 30분", "오후 5시", "오후 5시 30분"];

export default function CreateTimePage() {
  const router = useRouter();

  const choose = (time: string) => {
    updateDraft({ time });
    router.push("/create/duration");
  };

  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      <CreateStepHeader step={2} backHref="/create/activity" />

      <div className="px-[18px] py-[22px] flex flex-col">
        <h1 className="text-[22px] font-bold text-black">몇 시에 만날까요?</h1>
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

        <div className="h-[18px]" />
        <SmartInput
          hint="“내일 네 시”처럼 쓰거나 말하셔도 돼요"
          suggestions={OPTIONS}
          onConfirm={choose}
        />
      </div>
    </WireframeLayout>
  );
}
