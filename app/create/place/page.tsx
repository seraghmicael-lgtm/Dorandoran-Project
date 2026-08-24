"use client";

import { useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";
import CreateStepHeader from "@/components/CreateStepHeader";
import SmartInput from "@/components/SmartInput";
import { updateDraft } from "@/lib/draft";

// 와이어프레임_v02 04_어디서 만날까요
const PLACES = [
  { name: "송정마을 어귀", sub: "지금 계신 곳" },
  { name: "도토리마을 공원", sub: "지난번에 만난 곳 · 걸어서 4분" },
  { name: "한마음 경로당", sub: "자주 모이는 곳 · 걸어서 7분" },
];

export default function CreatePlacePage() {
  const router = useRouter();

  const choose = (location: string) => {
    updateDraft({ location });
    router.push("/create/people");
  };

  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      <CreateStepHeader step={4} backHref="/create/duration" />

      <div className="px-[18px] py-[22px] flex flex-col">
        <h1 className="text-[22px] font-bold text-black">어디서 만날까요?</h1>
        <div className="h-5" />

        <div className="flex flex-col gap-2.5">
          {PLACES.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => choose(p.name)}
              className="w-full border border-gray-300 px-[18px] py-[15px] flex flex-col items-start gap-0.5 cursor-pointer hover:bg-gray-50 active:bg-gray-100 text-left"
            >
              <span className="text-[19px] font-bold text-black">{p.name}</span>
              <span className="text-[15px] text-gray-500">{p.sub}</span>
            </button>
          ))}
        </div>

        <div className="h-2.5" />
        <SmartInput
          placeholder="여기에 쓰세요 예) 도란공원 정문"
          hint="“우리 동네”처럼 쓰거나 말하셔도 돼요"
          suggestions={PLACES.map((p) => p.name)}
          onConfirm={choose}
        />
      </div>
    </WireframeLayout>
  );
}
