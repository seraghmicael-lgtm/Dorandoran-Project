"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";
import StepFooter, { footerButtonClass } from "@/components/ds/StepFooter";
import {
  MeetupDraft,
  draftSnapshot,
  noDraftOnServer,
  subscribeDraft,
} from "@/lib/draft";

// UI디자인 CR-07 (1122:6341) — 이렇게 올릴까요?
// 값 한 줄이 ds_radio 한 칸(320×79): 연회색 바탕에 초록 라벨(14) → 값(20).
// 보조 문구는 값과 같은 줄 오른쪽에 회색 14로 붙는다. ds/Field 는 보조 문구를
// 라벨 옆 세로선으로 붙이는 JN-02 모양이라 이 화면에서는 쓰지 않는다.
function ReviewCard({
  label,
  value,
  meta,
}: {
  label: string;
  value: string;
  /** 값 옆에 붙는 회색 보조 문구 — 도보 시간, 모임 조건 */
  meta?: string;
}) {
  const valueText = (
    <p className="text-[20px] font-medium leading-[1.5] text-[#171717] whitespace-pre-line">
      {value}
    </p>
  );

  return (
    <div className="w-[320px] rounded-lg bg-surface px-4 py-3 flex flex-col justify-center gap-1">
      <p className="text-[14px] font-medium leading-[1.5] text-[#32952D]">{label}</p>
      {meta ? (
        <div className="flex items-center gap-2">
          {valueText}
          <p className="shrink-0 text-[14px] font-normal leading-[1.5] text-[#777777]">{meta}</p>
        </div>
      ) : (
        valueText
      )}
    </div>
  );
}

export default function CreateReviewPage() {
  const router = useRouter();
  const raw = useSyncExternalStore(subscribeDraft, draftSnapshot, noDraftOnServer);
  let draft: MeetupDraft = {};
  try {
    if (raw) draft = JSON.parse(raw) as MeetupDraft;
  } catch {
    draft = {};
  }

  const rawActivity = draft.activity ?? null;
  const activity = rawActivity
    ? rawActivity.includes("같이 하실 분")
      ? rawActivity
      : `${rawActivity} 같이 하실 분`
    : "동행";
  const startClock = (draft.startTime ?? draft.time ?? "").replace(/^오늘\s*/, "").split(" ~ ")[0];

  // 만나는 곳 장소명과 도보시간 분리 (상세보기 화면과 동일한 패턴)
  const [placeName, walkTime] = (draft.location ?? "").split(" · ") as [string, string | undefined];

  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      {/* ds_navigation_top(1122:6342) — 60px. 좌우 8 안에 48 짜리 아이콘 버튼. */}
      <header className="h-[60px] shrink-0 px-2 flex items-center border-b border-[#E5E5E5] bg-white relative">
        <Link
          href="/create/message"
          aria-label="뒤로"
          className="size-12 flex items-center justify-center"
        >
          <Image src="/illust/arrow-back-ios-new.svg" alt="" width={24} height={24} />
        </Link>
        <span className="absolute inset-x-0 text-center text-[18px] font-medium leading-[1.5] text-[#171717] pointer-events-none">
          이렇게 올릴까요?
        </span>
      </header>

      <div className="flex-1 flex flex-col pt-7">
        {/* top(1122:6344) — 좌우 16 · 위아래 16, 두 줄 사이 4 */}
        <h1 className="px-4 py-4 flex flex-col gap-1 text-[28px] font-bold text-black leading-[1.3] tracking-[-0.28px]">
          {startClock && <span>{startClock}</span>}
          <span>{activity}</span>
        </h1>

        {/* card-list(1122:6349) — 좌우 16 · 간격 12.
            ⚠️ cr-01 과 같은 어긋남: 칸이 320 고정인데 여백이 좌우 16(=328)이라
            오른쪽에 8px 이 남는다. 값 그대로 옮겼고, 가운데로 맞추려면 px-4 를 px-5 로. */}
        <div className="mt-4 px-4 flex flex-col gap-3">
          {draft.startTime && (
            <ReviewCard
              label="걸리는 시간(소요시간)"
              value={draft.duration ?? draft.startTime}
            />
          )}
          {draft.location && (
            <ReviewCard label="만나는 곳" value={placeName} meta={walkTime} />
          )}
          {draft.maxPeople != null && (
            <ReviewCard
              label="모임인원"
              value={`${draft.maxPeople}명`}
              meta={draft.goAnyway ? "모두 안 모여도 갈게요" : "다 모여야 갈게요"}
            />
          )}
          {draft.message && <ReviewCard label="한마디" value={draft.message} />}
        </div>
      </div>

      {/* ds_step_footer(1122:6371) */}
      <StepFooter>
        <button
          type="button"
          onClick={() => router.push("/create/posted")}
          className={`${footerButtonClass("ink")} cursor-pointer`}
        >
          다음
        </button>
        <Link href="/create/activity" className={footerButtonClass("ghost")}>
          고칠래요
        </Link>
      </StepFooter>
    </WireframeLayout>
  );
}
