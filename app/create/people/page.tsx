"use client";

import { useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";
import CreateStepHeader from "@/components/CreateStepHeader";
import SmartInput from "@/components/SmartInput";
import { updateDraft } from "@/lib/draft";

// 와이어프레임_v02 05_몇 분이 함께할까요
const OPTIONS = [2, 3, 4, 5];

export default function CreatePeoplePage() {
  const router = useRouter();

  const choose = (n: number) => {
    updateDraft({ maxPeople: n });
    router.push("/create/message");
  };

  const handleCustom = (value: string) => {
    // 입력 문자열에서 첫 정수(2~10)를 추출해 maxPeople로 저장 후 이동.
    // 정수를 못 찾으면 maxPeople을 저장하지 않고 그냥 이동.
    const m = value.match(/\d+/);
    if (m) {
      const n = parseInt(m[0], 10);
      if (n >= 2 && n <= 10) {
        updateDraft({ maxPeople: n });
      }
    }
    router.push("/create/message");
  };

  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      <CreateStepHeader step={5} backHref="/create/place" />

      <div className="px-[18px] py-[22px] flex flex-col">
        <h1 className="text-[22px] font-bold text-black">몇 분이 함께할까요?</h1>
        <p className="text-[15px] text-gray-500 mt-1">나를 포함한 숫자예요.</p>
        <div className="h-5" />

        <div className="flex flex-col gap-2.5">
          {[0, 2].map((i) => (
            <div key={i} className="flex gap-2.5">
              {[OPTIONS[i], OPTIONS[i + 1]].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => choose(n)}
                  className="flex-1 border border-gray-300 py-[22px] flex justify-center text-[19px] font-bold text-black cursor-pointer hover:bg-gray-50 active:bg-gray-100"
                >
                  {n}명
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="h-2.5" />
        <SmartInput
          label="목록에 없으면"
          placeholder="몇 분이 모였으면 좋을 지"
          hint="“우리 동네”처럼 쓰거나 말하셔도 돼요"
          onConfirm={handleCustom}
        />

        <div className="h-5" />
        <div className="border border-gray-300 px-[18px] py-[15px] flex flex-col gap-1 text-left">
          <p className="text-[15px] font-bold text-black">나 말고 두 분을 기다려요</p>
          <p className="text-[15px] text-gray-500">적게 잡을수록 빨리 만들어져요.</p>
        </div>
      </div>
    </WireframeLayout>
  );
}
