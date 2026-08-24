"use client";

import { useRouter } from "next/navigation";
import SmartInput from "@/components/SmartInput";
import { updateDraft } from "@/lib/draft";

/** 선택지는 서버가 지금 시각으로 계산해 내려준다 — 여기서는 고르기만 한다. */
export default function TimeOptions({ options }: { options: string[] }) {
  const router = useRouter();

  const choose = (time: string) => {
    updateDraft({ time });
    router.push("/create/duration");
  };

  return (
    <>
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: Math.ceil(options.length / 2) }, (_, row) => (
          <div key={row} className="flex gap-2.5">
            {options.slice(row * 2, row * 2 + 2).map((opt) => (
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
        suggestions={options}
        onConfirm={choose}
      />
    </>
  );
}
