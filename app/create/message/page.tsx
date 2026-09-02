"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CreateStep from "@/components/ds/CreateStep";
import PrevNext from "@/components/ds/PrevNext";
import VoiceSheet from "@/components/ds/VoiceSheet";
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
      footer={<PrevNext backHref="/create/people" onNext={goNext} stack />}
    >
      <p className="mt-2 text-[15px] text-muted">안 하셔도 괜찮아요</p>

      <div className="mt-5 flex flex-col">
        <div className="rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="예) 초보 환영합니다. 편하게 오세요"
            rows={4}
            className="w-full p-4 text-[16px] text-black placeholder:text-muted focus:outline-none resize-none"
          />
          <div className="border-t border-gray-200 bg-surface flex justify-center">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="flex items-center gap-2 py-[14px] cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="9" y="2" width="6" height="12" rx="3" fill="#555" />
                <path d="M5 11a7 7 0 0 0 14 0M12 18v4" stroke="#555" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-[15px] font-bold text-black">누르고 말하기</span>
            </button>
          </div>
        </div>

        <p className="mt-3 text-[15px] text-muted">
          여기에 남기신 한마디가 게시판에 그대로 보여요.
        </p>
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
