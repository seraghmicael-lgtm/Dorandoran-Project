"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// 만든 동행 카드의 취소 버튼 — 서버 컴포넌트 목록 안에서 쓰는 작은 클라이언트 조각.
// 누르면 곧장 취소하지 않고 Figma 의 "참여 취소"(732:517) → "처리 완료"(732:525)
// 두 장을 팝업으로 띄운다. 취소는 되돌릴 수 없으니 한 번 묻고 간다.
type Stage = "closed" | "confirm" | "working" | "done" | "error";

export default function CancelCreatedButton({ meetupId }: { meetupId: string }) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("closed");

  const cancel = async () => {
    setStage("working");
    try {
      const res = await fetch(`/api/meetups/${meetupId}/cancel`, { method: "POST" });
      setStage(res.ok ? "done" : "error");
    } catch (e) {
      console.error("취소 실패:", e);
      setStage("error");
    }
  };

  const close = () => {
    setStage("closed");
    router.refresh(); // 취소된 카드가 완료 칸으로 옮겨 가도록 목록을 다시 읽는다
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setStage("confirm")}
        className="text-[14px] text-muted underline-offset-2 hover:underline cursor-pointer"
      >
        만든 동행 취소하기
      </button>

      {stage !== "closed" && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-created-title"
        >
          <div className="w-full max-w-[320px] my-auto bg-white rounded-2xl p-5 flex flex-col gap-4 text-left">
            {stage === "done" ? (
              /* Figma 732:525 "처리 완료" */
              <>
                <div className="flex flex-col gap-1.5">
                  <h2 id="cancel-created-title" className="text-[19px] font-bold text-black">
                    동행이 취소되었어요
                  </h2>
                  <p className="text-[15px] text-muted">다른 동행도 찾아보세요.</p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="w-full h-[54px] rounded-lg bg-ink text-white flex items-center justify-center text-[17px] font-bold cursor-pointer"
                >
                  확인
                </button>
              </>
            ) : (
              /* Figma 732:517 "참여 취소" */
              <>
                <div className="flex flex-col gap-1.5">
                  <h2 id="cancel-created-title" className="text-[19px] font-bold text-black">
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
                    onClick={cancel}
                    disabled={stage === "working"}
                    className="w-full h-[54px] rounded-lg bg-ink text-white flex items-center justify-center text-[17px] font-bold cursor-pointer disabled:bg-gray-300 disabled:cursor-default"
                  >
                    {stage === "working" ? "알리는 중이에요..." : "못 간다고 알리기"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage("closed")}
                    disabled={stage === "working"}
                    className="w-full h-[54px] rounded-lg bg-white text-black border border-gray-300 flex items-center justify-center text-[17px] font-medium cursor-pointer disabled:text-gray-400 disabled:cursor-default"
                  >
                    그냥 갈게요
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
