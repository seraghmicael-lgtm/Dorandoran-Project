"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

// 만든 동행 카드의 취소 버튼 — 서버 컴포넌트 목록 안에서 쓰는 작은 클라이언트 조각.
// Figma MY-03("만든 동행을 취소할까요?") → MY-04("취소되었어요") 두 장을 순서대로 띄운다.
// 취소는 되돌릴 수 없으니 참여자 목록을 다시 보여주고 한 번 묻는다.
type Stage = "closed" | "confirm" | "working" | "done" | "error";

const AVATARS = ["/illust/avatar-1.svg", "/illust/avatar-2.svg", "/illust/avatar-3.svg"];

export default function CancelCreatedButton({
  meetupId,
  participants,
}: {
  meetupId: string;
  participants: { nickname: string; isCreator: boolean }[];
}) {
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

  return (
    <>
      <button
        type="button"
        onClick={() => setStage("confirm")}
        className="w-full h-[54px] rounded-lg border border-gray-300 bg-white text-black flex items-center justify-center text-[17px] font-medium cursor-pointer"
      >
        만든 동행 취소하기
      </button>

      {stage !== "closed" && (
        <div
          className="absolute inset-0 z-50 flex flex-col bg-white"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-created-title"
        >
          {stage === "done" ? (
            // Figma MY-04 — 취소 완료
            <>
              <div className="flex-1 px-5 flex flex-col items-center justify-center text-center gap-4">
                <Image src="/illust/cancelled.png" alt="" width={140} height={140} aria-hidden="true" />
                <h2 id="cancel-created-title" className="text-[24px] font-bold text-black leading-[1.3] whitespace-pre-line">
                  {"내가 만든 동행이\n취소되었어요"}
                </h2>
                <p className="text-[16px] text-muted">다른 동행도 찾아보세요</p>
              </div>
              <div className="px-4 pb-10 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/home")}
                  className="w-full h-12 rounded-xl bg-brand text-white text-[16px] font-medium cursor-pointer"
                >
                  다른 동행 보기
                </button>
                <button
                  type="button"
                  // 이 상세 화면은 취소된 모임 기준으로 안 바뀐다(상태 필터 없음) — refresh 로 남으면
                  // 방금 취소한 걸 또 취소할 수 있는 것처럼 보인다. 목록으로 보낸다.
                  onClick={() => router.push("/my-meetups/created")}
                  className="w-full h-12 rounded-xl border border-gray-200 bg-white text-[#5b5b5b] text-[16px] font-bold cursor-pointer"
                >
                  확인
                </button>
              </div>
            </>
          ) : (
            // Figma MY-03 — 취소 확인
            <div className="flex-1 flex flex-col justify-center px-4 gap-5">
              <h2 id="cancel-created-title" className="text-[24px] font-bold text-black text-center leading-[1.3] tracking-[-0.28px]">
                만든 동행을 취소할까요?
              </h2>

              <div className="rounded-xl bg-surface px-4 py-4 flex flex-col gap-4 shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
                <p className="text-[18px] text-black">
                  참여자 <span className="font-bold text-brand">{participants.length}</span>
                </p>
                <ul className="flex flex-col gap-3">
                  {participants.map((p, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Image
                        src={AVATARS[i % AVATARS.length]}
                        alt=""
                        width={24}
                        height={24}
                        className="shrink-0 rounded-full"
                      />
                      <span className="text-[16px] text-muted">{p.nickname}</span>
                      {p.isCreator && (
                        <span className="px-1.5 py-1 rounded bg-accent-soft text-accent text-[12px] font-medium leading-none">
                          개설자
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-[18px] text-muted text-center leading-[1.5]">
                {"참여 신청한 분께도 알려드릴게요.\n정말로 만든 동행을 취소하시겠어요?"}
              </p>

              {stage === "error" && (
                <p className="text-[15px] text-black text-center">
                  취소하지 못했어요. 잠시 뒤에 다시 눌러주세요.
                </p>
              )}

              <div className="pb-10 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={cancel}
                  disabled={stage === "working"}
                  className="w-full h-12 rounded-xl bg-brand text-white text-[16px] font-medium cursor-pointer disabled:opacity-60"
                >
                  {stage === "working" ? "취소하는 중이에요..." : "취소할게요"}
                </button>
                <button
                  type="button"
                  onClick={() => setStage("closed")}
                  disabled={stage === "working"}
                  className="w-full h-12 rounded-xl border border-gray-200 bg-white text-[#5b5b5b] text-[16px] font-bold cursor-pointer disabled:opacity-60"
                >
                  이전
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
