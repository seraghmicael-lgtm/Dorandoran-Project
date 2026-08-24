"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";
import CreateStepHeader from "@/components/CreateStepHeader";
import MemoryBubbles from "@/components/MemoryBubbles";
import SmartInput from "@/components/SmartInput";
import { loadDraft, updateDraft } from "@/lib/draft";

// 와이어프레임_v02 01_뭐 하실래요 (활동)
const OPTIONS = ["산책", "등산", "바둑", "맛집탐방", "장보기", "커피"];
const FULL_WIDTH_OPTION = "병원";

// sessionStorage 는 브라우저에만 있다 — 서버 렌더에선 null, 마운트 뒤 실제 값.
// (렌더 중에 읽으면 SSR 이 터지고, 이펙트로 setState 하면 렌더가 한 번 더 돈다)
const noSubscribe = () => () => {};
const readChosenActivity = () => loadDraft()?.activity ?? null;
const noChosenOnServer = () => null;

export default function CreateActivityPage() {
  const router = useRouter();
  // 이미 고른 활동이 있으면(이전으로 돌아온 경우) 다시 고르지 않고도 다음으로 갈 수 있다
  const chosen = useSyncExternalStore(noSubscribe, readChosenActivity, noChosenOnServer);

  const choose = (activity: string) => {
    updateDraft({ activity });
    router.push("/create/time");
  };

  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      <CreateStepHeader step={1} backHref="/home" />

      <div className="px-[18px] py-[22px] flex flex-col">
        <MemoryBubbles />
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
          placeholder="예) 함께 장 보기"
          hint="“커피”처럼 쓰거나 말하셔도 돼요"
          suggestions={[...OPTIONS, FULL_WIDTH_OPTION]}
          onConfirm={choose}
        />

        {/* Figma 938:639 — 이전 / 다음. 흰 배경 · 회색 테두리 · 모서리 각짐 · 60px */}
        <div className="h-4" />
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => router.push("/home")}
            className="flex-1 h-[60px] border border-gray-300 bg-white flex items-center justify-center text-[19px] font-bold text-black cursor-pointer hover:bg-gray-50 active:bg-gray-100"
          >
            이전
          </button>
          <button
            type="button"
            onClick={() => chosen && router.push("/create/time")}
            disabled={!chosen}
            // 아직 아무것도 안 고르셨으면 다음으로 못 간다 — 빈 채로 넘어가면
            // 뒤 화면이 "오일장 구경" 같은 기본값을 지어내 보여준다.
            className="flex-1 h-[60px] border border-gray-300 bg-white flex items-center justify-center text-[19px] font-bold text-black cursor-pointer hover:bg-gray-50 active:bg-gray-100 disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
        <div className="h-4" />
      </div>
    </WireframeLayout>
  );
}
