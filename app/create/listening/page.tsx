"use client";

import { useState } from "react";
import CreateStep from "@/components/ds/CreateStep";
import PrevNext from "@/components/ds/PrevNext";
import VoiceSheet from "@/components/ds/VoiceSheet";
import { loadDraft, updateDraft } from "@/lib/draft";

// UI디자인 cr-01 의 말하기 갈래 — 화면에서 움직이는 것은 마이크 하나뿐이다.
// 말씀하시면 /api/parse-meetup 이 시간·장소·활동을 뽑아 칸을 채운다.
export default function CreateListeningPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [heard, setHeard] = useState("");
  const [parsing, setParsing] = useState(false);
  const [failed, setFailed] = useState(false);

  const apply = async (transcript: string) => {
    setHeard(transcript);
    setParsing(true);
    setFailed(false);
    try {
      const d = loadDraft() ?? {};
      const res = await fetch("/api/parse-meetup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          time: d.time ?? null,
          location: d.location ?? null,
          activity: d.activity ?? null,
        }),
      });
      if (!res.ok) throw new Error("parse failed");
      const parsed = await res.json();
      // 한 번에 다 말씀하셔도 되고, 활동만 말씀하셔도 된다 — 알아들은 것만 채운다
      updateDraft({
        ...(parsed.activity ? { activity: parsed.activity } : {}),
        ...(parsed.time ? { time: parsed.time } : {}),
        ...(parsed.location ? { location: parsed.location } : {}),
        transcript,
      });
      if (!parsed.activity && !parsed.time && !parsed.location) setFailed(true);
    } catch {
      setFailed(true);
    } finally {
      setParsing(false);
    }
  };

  return (
    <CreateStep
      step={1}
      title={"어떤 활동을\n하고 싶으세요?"}
      footer={<PrevNext backHref="/create/activity" nextHref="/create/time" requires="activity" />}
    >
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-10">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          disabled={parsing}
          aria-label="누르고 말하기"
          className="w-[132px] h-[132px] rounded-full bg-accent-soft flex flex-col items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="9" y="2" width="6" height="12" rx="3" fill="#45B83C" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v4" stroke="#45B83C" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="text-[15px] font-bold text-accent">누르고 말하기</span>
        </button>

        <p className="text-[15px] text-muted text-center leading-[1.6] whitespace-pre-line">
          {parsing
            ? "말씀을 확인하고 있어요..."
            : failed
            ? "잘 못 알아들었어요.\n한 번만 더 말씀해주세요."
            : "“산책하러 같이 가요” 처럼\n편하게 말씀하세요"}
        </p>

        {heard && (
          <p className="w-full rounded-xl bg-surface px-4 py-3 text-[15px] text-black text-center">
            “{heard}”
          </p>
        )}
      </div>

      <VoiceSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onResult={apply}
        hint="무엇을 하고 싶은지 말씀하세요"
      />
    </CreateStep>
  );
}
