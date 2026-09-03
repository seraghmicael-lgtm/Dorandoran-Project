"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";
import Field from "@/components/ds/Field";
import {
  MeetupDraft,
  draftSnapshot,
  noDraftOnServer,
  subscribeDraft,
} from "@/lib/draft";

// UI디자인 CR-07 갱신분(1219:3583) — 이렇게 올릴까요?
// 필드마다 연회색 둥근 박스 하나 — 상세보기(JN-02)와 같은 값 표시 방식.
function FieldBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface px-4 py-3">
      <Field label={label} value={value} />
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

  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      <header className="h-[60px] px-5 flex items-center border-b border-gray-100 bg-white relative">
        <Link href="/create/message" aria-label="뒤로" className="text-2xl text-black leading-none">
          ‹
        </Link>
        <span className="absolute inset-x-0 text-center text-[17px] font-bold text-black pointer-events-none">
          이렇게 올릴까요?
        </span>
      </header>

      <div className="flex-1 px-5 pt-7 flex flex-col">
        <div className="flex flex-col gap-1">
          {startClock && <span className="text-[17px] font-bold text-black">{startClock}</span>}
          <h1 className="text-[24px] font-bold text-black">{activity}</h1>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {draft.startTime && <FieldBox label="걸리는 시간" value={draft.duration ?? draft.startTime} />}
          {draft.location && <FieldBox label="만나는 곳" value={draft.location} />}
          {draft.maxPeople != null && <FieldBox label="모임인원" value={`${draft.maxPeople}명`} />}
          {draft.message && <FieldBox label="한마디" value={draft.message} />}
        </div>
      </div>

      <div className="px-5 pt-5 pb-6 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => router.push("/create/posted")}
          className="w-full h-[54px] rounded-lg bg-ink text-white flex items-center justify-center text-[17px] font-bold cursor-pointer"
        >
          다음
        </button>
        <Link
          href="/create/activity"
          className="w-full h-[54px] rounded-lg border border-gray-300 bg-white text-black flex items-center justify-center text-[17px] font-medium"
        >
          고칠래요
        </Link>
      </div>
    </WireframeLayout>
  );
}
