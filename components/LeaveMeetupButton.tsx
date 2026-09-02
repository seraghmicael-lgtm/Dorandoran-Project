"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// JN-02 의 "참여 취소하기" — 상세 화면 하단. 되돌릴 수 없으니 한 번 묻는다.
export default function LeaveMeetupButton({ meetupId }: { meetupId: string }) {
  const router = useRouter();
  const [stage, setStage] = useState<"idle" | "confirm" | "working" | "error">("idle");

  const leave = async () => {
    setStage("working");
    try {
      const res = await fetch(`/api/meetups/${meetupId}/leave`, { method: "POST" });
      if (res.ok) {
        setStage("idle");
        router.refresh();
        return;
      }
      setStage("error");
    } catch {
      setStage("error");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setStage("confirm")}
        className="w-full h-[54px] rounded-lg border border-gray-300 bg-white text-black flex items-center justify-center text-[17px] font-medium cursor-pointer"
      >
        참여 취소하기
      </button>

      {stage !== "idle" && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-meetup-title"
        >
          <div className="w-full max-w-[320px] my-auto bg-white rounded-2xl p-5 flex flex-col gap-4 text-left">
            <div className="flex flex-col gap-1.5">
              <h2 id="leave-meetup-title" className="text-[19px] font-bold text-black">
                못 가시는군요
              </h2>
              <p className="text-[15px] text-muted leading-relaxed">
                다른 분들께는 &quot;한 분이 못 오시게 됐어요&quot;만 전해요.
              </p>
              {stage === "error" && (
                <p className="text-[15px] text-black pt-1">
                  취소하지 못했어요. 잠시 뒤에 다시 눌러주세요.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={leave}
                disabled={stage === "working"}
                className="w-full h-[54px] rounded-lg bg-ink text-white flex items-center justify-center text-[17px] font-bold cursor-pointer disabled:bg-gray-300"
              >
                {stage === "working" ? "알리는 중이에요..." : "못 간다고 알리기"}
              </button>
              <button
                type="button"
                onClick={() => setStage("idle")}
                disabled={stage === "working"}
                className="w-full h-[54px] rounded-lg bg-white text-black border border-gray-300 flex items-center justify-center text-[17px] font-medium cursor-pointer"
              >
                그냥 갈게요
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
