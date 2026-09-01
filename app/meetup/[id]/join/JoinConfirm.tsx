"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";

// UI디자인 jn-03 — 가운데 "참여할까요?" + 요약 카드 + 참여할게요 / 이전
export default function JoinConfirm({
  id,
  activity,
  startTime,
  locationName,
}: {
  id: string;
  activity: string;
  startTime: string;
  locationName: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [message, setMessage] = useState("");

  const join = async () => {
    if (state === "sending") return;
    setState("sending");
    try {
      const res = await fetch(`/api/meetups/${id}/join`, { method: "POST" });
      if (res.ok) {
        router.push(`/meetup/${id}/complete`);
        return;
      }
      const { error } = await res.json().catch(() => ({ error: "" }));
      setMessage(
        error === "full"
          ? "그 사이에 자리가 다 찼어요."
          : error === "cancelled"
          ? "취소된 동행이에요."
          : "참여하지 못했어요. 잠시 뒤에 다시 눌러주세요."
      );
      setState("error");
    } catch {
      setMessage("참여하지 못했어요. 잠시 뒤에 다시 눌러주세요.");
      setState("error");
    }
  };

  const startClock = startTime.replace(/^오늘\s*/, "").split(" ~ ")[0];

  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      <div className="flex-1 px-5 flex flex-col items-center justify-center">
        <h1 className="text-[24px] font-bold text-black">참여할까요?</h1>

        <div className="mt-7 w-full rounded-2xl border border-gray-200 px-4 py-4 flex flex-col gap-1">
          <span className="text-[15px] text-black">{startClock}</span>
          <span className="text-[20px] font-bold text-black">{activity}</span>
          <span className="mt-2 text-[14px] text-muted">{startTime}</span>
          <span className="text-[14px] text-muted">{locationName}</span>
        </div>

        {state === "error" && <p className="mt-4 text-[15px] text-black">{message}</p>}
      </div>

      <div className="px-5 pt-5 pb-6 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={join}
          disabled={state === "sending"}
          className="w-full h-[54px] rounded-lg bg-brand text-white flex items-center justify-center text-[17px] font-bold cursor-pointer disabled:opacity-60"
        >
          {state === "sending" ? "참여하고 있어요..." : "참여할게요"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/meetup/${id}`)}
          className="w-full h-[54px] rounded-lg border border-gray-300 bg-white text-black flex items-center justify-center text-[17px] font-medium cursor-pointer"
        >
          이전
        </button>
      </div>
    </WireframeLayout>
  );
}
