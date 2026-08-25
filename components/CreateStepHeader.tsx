"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearDraft } from "@/lib/draft";

// 와이어프레임_v02 만들기 플로우 공통 navbar: ← / 동행 만들기 / N / 6
// `right`가 있으면 우측 표시를 "{step} / {total}" 대신 그 문자열로 보여준다.
export default function CreateStepHeader({
  step,
  backHref,
  title = "동행 만들기",
  total = 6,
  right,
  confirmLeave = false,
}: {
  step: number;
  backHref: string;
  title?: string;
  total?: number;
  right?: string;
  /**
   * ← 를 누르면 바로 나가지 않고 한 번 묻는다.
   * 만들기 1~6단계처럼 여기서 나가면 적어둔 게 통째로 사라지는 화면에서만 켠다.
   */
  confirmLeave?: boolean;
}) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);

  const leave = () => {
    clearDraft(); // 나가면 적어둔 건 버린다 — 팝업에 그렇게 적어뒀다
    router.push(backHref);
  };

  return (
    <>
      <header className="h-[75px] px-5 flex items-center justify-between border-b border-gray-200 bg-white">
        {confirmLeave ? (
          <button
            type="button"
            onClick={() => setAsking(true)}
            aria-label="동행 만들기 그만두기"
            className="text-2xl font-bold text-black w-[60px] text-left cursor-pointer"
          >
            ←
          </button>
        ) : (
          <Link href={backHref} className="text-2xl font-bold text-black w-[60px]">
            ←
          </Link>
        )}
        <span className="text-xl font-bold text-black text-center">{title}</span>
        <span className="text-[15px] text-gray-500 w-[60px] text-right">
          {right ?? `${step} / ${total}`}
        </span>
      </header>

      {asking && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-create-title"
        >
          <div className="w-full max-w-[330px] my-auto bg-white border border-black rounded-lg p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <h2 id="leave-create-title" className="text-[19px] font-bold text-black leading-snug">
                동행 만들기를 취소하시겠어요?
              </h2>
              <p className="text-[15px] text-gray-600">작성한 내용은 사라집니다</p>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={leave}
                className="w-full h-[54px] bg-white text-black border border-gray-400 flex items-center justify-center rounded text-[17px] font-medium cursor-pointer"
              >
                홈으로
              </button>
              {/* 실수로 눌렀을 때 되돌아오는 쪽을 더 눈에 띄게 둔다 */}
              <button
                type="button"
                onClick={() => setAsking(false)}
                className="w-full h-[54px] bg-black text-white flex items-center justify-center rounded text-[17px] font-bold cursor-pointer"
              >
                계속 모임 만들기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
