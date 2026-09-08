"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  MeetupDraft,
  draftSnapshot,
  noDraftOnServer,
  subscribeDraft,
} from "@/lib/draft";

// UI디자인 CR 그룹 하단 — [이전] 흰 바탕 / [다음] 검정, 좌우 반반(ds_step_footer).
// stack 은 세로로 쌓아야 하는 예외 화면을 위한 옵션 — 지금은 쓰는 화면 없음.
export default function PrevNext({
  backHref,
  nextHref,
  requires,
  onNext,
  stack = false,
  showPrev = true,
}: {
  backHref: string;
  nextHref?: string | ((draft: MeetupDraft) => string);
  /** 이 항목을 아직 안 정했으면 다음으로 못 간다 — 빈 채로 넘기면 뒤 화면이 기본값을 지어낸다 */
  requires?: keyof MeetupDraft;
  /** 화면에 아직 저장 안 된 선택이 떠 있는 경우(시각 고르기) — 다음이 그걸 확정하고 넘어간다 */
  onNext?: () => void;
  stack?: boolean;
  /** cr-01(활동)처럼 "이전" 없이 [다음]만 보여줄 때 false — 상단 ‹ 는 그대로 backHref 로 간다 */
  showPrev?: boolean;
}) {
  const router = useRouter();
  const raw = useSyncExternalStore(subscribeDraft, draftSnapshot, noDraftOnServer);

  let draft: MeetupDraft = {};
  try {
    if (raw) draft = JSON.parse(raw) as MeetupDraft;
  } catch {
    draft = {};
  }

  const value = requires ? draft[requires] : undefined;
  const canGoNext =
    onNext || !requires
      ? true
      : typeof value === "number"
      ? true
      : typeof value === "string" && value.trim().length > 0;

  // 세로로 쌓을 땐 flex-1 이 세로 축에 걸려 버튼이 납작해진다 — 그때는 가로만 채운다
  // 이전이 없으면 다음이 폭 전체를 채운다
  const shape = stack || !showPrev ? "w-full" : "flex-1";

  const prev = (
    <button
      type="button"
      onClick={() => router.push(backHref)}
      className={`${shape} h-[54px] rounded-lg border border-gray-300 bg-white text-black flex items-center justify-center text-[17px] font-medium cursor-pointer`}
    >
      이전
    </button>
  );
  // [이전]에 테두리가 있어 그만큼 넓다 — [다음]에도 투명 테두리를 줘 폭을 맞춘다
  const next = (
    <button
      type="button"
      onClick={() => {
        if (!canGoNext) return;
        if (onNext) return onNext();
        if (nextHref) router.push(typeof nextHref === "function" ? nextHref(draft) : nextHref);
      }}
      disabled={!canGoNext}
      className={`${shape} h-[54px] rounded-lg border border-transparent bg-ink text-white flex items-center justify-center text-[17px] font-bold cursor-pointer disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed`}
    >
      다음
    </button>
  );

  return (
    <div className={`px-5 pt-4 pb-6 flex gap-2.5 ${stack ? "flex-col-reverse" : ""}`}>
      {showPrev && prev}
      {next}
    </div>
  );
}
