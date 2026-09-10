"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { footerButtonClass } from "@/components/ds/StepFooter";

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
        className={`${footerButtonClass("ghost")} cursor-pointer`}
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
            // Figma MY-04(1248:2843) — 취소 완료.
            // 캔버스에 좌표로 박혀 있는 화면이다(오토레이아웃 아님) — 프레임이 360×800 로
            // 고정돼 있으니 그림 위 205 · 그림과 글 사이 30 을 그대로 옮긴다.
            <>
              <div className="flex-1 min-h-0 flex flex-col items-center pt-[205px]">
                {/* 1248:2846 — 156 상자 안에 그림. cancelled.png 가 그 상자를 3배로 뽑은 것 */}
                <Image
                  src="/illust/cancelled.png"
                  alt=""
                  width={156}
                  height={156}
                  className="shrink-0 size-[156px]"
                  aria-hidden="true"
                />
                {/* 1248:2847 — 제목과 부제를 16 간격으로 */}
                <div className="mt-[30px] w-full px-4 flex flex-col gap-4 text-center">
                  <h2
                    id="cancel-created-title"
                    className="text-[28px] font-bold leading-[1.3] tracking-[-0.28px] text-ink whitespace-pre-line"
                  >
                    {"내가 만든 동행이\n취소되었어요"}
                  </h2>
                  <p className="text-[18px] font-medium leading-[1.5] text-sub">
                    다른 동행도 찾아보세요
                  </p>
                </div>
              </div>

              {/* ds_step_footer(1248:2851) — 좌우 16 · 아래 40 · 버튼 48, 사이 12 */}
              <div className="shrink-0 px-4 pb-10 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/home")}
                  className={`${footerButtonClass("brand")} cursor-pointer`}
                >
                  다른 동행 보기
                </button>
                <button
                  type="button"
                  // 이 상세 화면은 취소된 모임 기준으로 안 바뀐다(상태 필터 없음) — refresh 로 남으면
                  // 방금 취소한 걸 또 취소할 수 있는 것처럼 보인다. 목록으로 보낸다.
                  onClick={() => router.push("/my-meetups/created")}
                  className={`${footerButtonClass("ghost")} cursor-pointer`}
                >
                  확인
                </button>
              </div>
            </>
          ) : (
            // Figma MY-03(1248:2886) — 취소 확인.
            // container 위 28 · content 는 남는 높이 안에서 가운데 · footer 는 바닥에 붙는다.
            <>
              <div className="flex-1 min-h-0 px-4 pt-7 flex flex-col items-center justify-center">
                {/* 1248:2926 — 제목 · 참여자 카드 · 안내문을 16 간격으로 */}
                <div className="w-full flex flex-col gap-4">
                  <h2
                    id="cancel-created-title"
                    className="text-[28px] font-bold leading-[1.3] tracking-[-0.28px] text-ink text-center"
                  >
                    만든 동행을 취소할까요?
                  </h2>

                  {/* 1248:2954 — ds_card 지만 바탕은 surface/body-neutral */}
                  <div className="rounded-xl bg-surface p-4 shadow-[0_2px_6px_rgba(0,0,0,0.08)] flex flex-col gap-4">
                    <p className="flex items-baseline gap-1 text-[18px] leading-[1.5]">
                      <span className="font-medium text-ink">참여자</span>
                      <span className="font-bold text-brand">{participants.length}</span>
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
                          <span className="text-[16px] font-medium leading-[1.5] text-sub">
                            {p.nickname}
                          </span>
                          {p.isCreator && (
                            <span className="px-1.5 py-1 rounded bg-brand-alpha-15 text-brand text-[12px] font-medium leading-none">
                              개설자
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-[18px] font-medium leading-[1.5] text-sub text-center whitespace-pre-line">
                    {"참여 신청한 분께도 알려드릴게요.\n정말로 만든 동행을 취소하시겠어요?"}
                  </p>

                  {stage === "error" && (
                    <p className="text-[16px] leading-[1.5] text-count-soon-ink text-center">
                      취소하지 못했어요. 잠시 뒤에 다시 눌러주세요.
                    </p>
                  )}
                </div>
              </div>

              {/* ds_step_footer(1248:2891) — 좌우 16 · 아래 40 · 버튼 48, 사이 12 */}
              <div className="shrink-0 px-4 pb-10 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={cancel}
                  disabled={stage === "working"}
                  className={`${footerButtonClass("brand")} cursor-pointer disabled:opacity-60`}
                >
                  {stage === "working" ? "취소하는 중이에요..." : "취소할게요"}
                </button>
                <button
                  type="button"
                  onClick={() => setStage("closed")}
                  disabled={stage === "working"}
                  className={`${footerButtonClass("ghost")} cursor-pointer disabled:opacity-60`}
                >
                  이전
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
