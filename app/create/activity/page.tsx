"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import CreateStep from "@/components/ds/CreateStep";
import PrevNext from "@/components/ds/PrevNext";
import OptionButton from "@/components/ds/OptionButton";
import SmartInput from "@/components/SmartInput";
import VoiceSheet from "@/components/ds/VoiceSheet";
import {
  clearDraft,
  draftSnapshot,
  loadDraft,
  noDraftOnServer,
  subscribeDraft,
  updateDraft,
  MeetupDraft,
} from "@/lib/draft";
import { ACTIVITY_SUGGESTIONS } from "@/lib/activitySuggestions";

// UI디자인 cr-01 (1089:5107) — 어떤 활동을 하고 싶으세요?
const OPTIONS = ["산책", "등산", "여행", "맛집탐방", "장보기", "커피", "병원"];

export default function CreateActivityPage() {
  const raw = useSyncExternalStore(subscribeDraft, draftSnapshot, noDraftOnServer);
  // 목록에서 고를 때마다 아래 입력칸을 새로 그려 비운다
  const [inputRound, setInputRound] = useState(0);
  const [voiceOpen, setVoiceOpen] = useState(false);
  let chosen: string | undefined;
  try {
    chosen = raw ? (JSON.parse(raw) as MeetupDraft).activity ?? undefined : undefined;
  } catch {
    chosen = undefined;
  }

  // 만들기로 새로 들어온 경우(?new=1)에만 앞 회차 기록을 비운다.
  // 2단계에서 "이전"으로 돌아온 경우엔 표시가 없으니 고른 값이 그대로 남는다.
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("new")) return;
    clearDraft();
    window.history.replaceState(null, "", "/create/activity");
  }, []);

  // 목록에서 고르거나 아래 칸에 적은 것을 "골라둔 값"으로만 저장한다 —
  // 화면을 넘기는 건 오직 하단 [다음]이다(고르자마자 넘어가면 되돌릴 틈이 없다).
  const chooseOption = (activity: string) => {
    updateDraft({ activity });
    // 목록에서 골랐으면 아래 칸에 적어둔 글자는 지운다 — 둘이 서로 다른 값을 가리키면 헷갈린다
    setInputRound((n) => n + 1);
  };

  // 적는 도중에도 그대로 반영한다 — 다 지우면 아무것도 안 고른 상태로 되돌린다
  const typeActivity = (text: string) => {
    updateDraft({ activity: text.trim() || null });
  };

  // 말하기로 들은 문장은 /create/listening 이 하던 것과 똑같이 다룬다 —
  // 한 번에 다 말씀하셔도 되고 활동만 말씀하셔도 된다. 알아들은 것만 채운다.
  const applySpoken = async (transcript: string) => {
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
      updateDraft({
        ...(parsed.activity ? { activity: parsed.activity } : {}),
        ...(parsed.time ? { time: parsed.time } : {}),
        ...(parsed.location ? { location: parsed.location } : {}),
        transcript,
      });
      // 말한 값이 골라둔 값이 되므로 아래 칸에 적어둔 글자는 지운다
      if (parsed.activity) setInputRound((n) => n + 1);
    } catch {
      // 못 알아들으면 고른 것 없이 그대로 둔다 — 목록이나 입력칸으로 이어서 하시면 된다
    }
  };

  return (
    <CreateStep
      step={1}
      title={"어떤 활동을\n하고 싶으세요?"}
      backHref="/home"
      body="bare"
      // cr-01 은 이 흐름의 첫 단계라 "이전"이 없다 — 위 ‹ 를 누르면 backHref(/home)로 간다
      footer={<PrevNext backHref="/home" nextHref="/create/time" requires="activity" showPrev={false} />}
    >
      {/* card-list(1089:5113) — 좌우 16 · 위아래 16 · 간격 12 에 154 짜리 칸을 흘려 담는다.
          ⚠️ Figma 실측: 칸 두 개(154+12+154=320)가 좌우 16 여백 안(328)에서 왼쪽으로 붙어
          오른쪽에 8px 이 남는다. 이 화면의 다른 줄(막대·입력칸)은 전부 320 을 좌우 20 에
          맞춰 두므로 디자인 쪽 실수로 보이지만, 값 그대로 옮겼다. 가운데로 맞추려면
          이 줄의 px-4 를 px-5 로 바꾸면 된다. */}
      <div className="px-4 py-4 flex flex-wrap gap-3">
        {OPTIONS.map((option) => (
          <OptionButton
            key={option}
            label={option}
            width={154}
            selected={chosen === option}
            onClick={() => chooseOption(option)}
          />
        ))}
      </div>

      {/* field(1122:1751) — 좌우 20 · 위아래 16 */}
      <div className="px-5 py-4">
        <SmartInput
          key={inputRound}
          label="목록에 없으면"
          placeholder="예) 장보러 가실 분 있나요"
          suggestions={ACTIVITY_SUGGESTIONS}
          // 확인 버튼 없이 적는 그대로 담아둔다 — 넘어가는 건 하단 [다음] 하나뿐
          showConfirmButton={false}
          onConfirm={typeActivity}
          onChange={typeActivity}
          // 화면을 떠나지 않는다 — 이 자리에서 시트를 올려 듣는다
          onVoice={() => setVoiceOpen(true)}
        />
      </div>

      <VoiceSheet
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onResult={applySpoken}
        hint="하고 싶은 활동을 말해보세요"
      />
    </CreateStep>
  );
}
