"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CreateStep from "@/components/ds/CreateStep";
import PrevNext from "@/components/ds/PrevNext";
import VoiceSheet from "@/components/ds/VoiceSheet";
import MicIcon from "@/components/ds/MicIcon";
import { updateDraft } from "@/lib/draft";

// UI디자인 cr-06 (1089:7757) — 추가로 남길 얘기가 있나요?
// 말하기는 화면을 떠나지 않고 아래에서 올라오는 시트로 받는다.
export default function CreateMessagePage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  // 이 단계는 안 하셔도 되는 곳이라 다음은 늘 열려 있다.
  // 적어두신 게 있으면 담아가고, 없으면 비운 채로 넘어간다.
  const goNext = () => {
    const trimmed = text.trim();
    updateDraft({ message: trimmed || undefined });
    router.push("/create/review");
  };

  return (
    <CreateStep
      step={6}
      title={"추가로 남길\n얘기가 있나요?"}
      backHref="/create/people"
      footer={<PrevNext backHref="/create/people" onNext={goNext} />}
    >
      <div className="mt-5 flex flex-col gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="예) 초보 환영합니다. 편하게 오세요"
          rows={4}
          className="w-full p-4 rounded-xl border border-gray-200 text-[16px] text-black placeholder:text-muted focus:outline-none focus:border-accent resize-none"
        />
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="w-full h-12 rounded-xl bg-brand flex items-center justify-center gap-2 cursor-pointer"
        >
          <MicIcon size={18} color="#fff" />
          <span className="text-[16px] font-bold text-white">말하기</span>
        </button>
      </div>

      <VoiceSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onResult={setText}
        summarize
        hint="한마디만 짧게 말씀하세요"
      />
    </CreateStep>
  );
}
