"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { unlockAudio } from "@/lib/voice";
import { unlockAgentAudio } from "@/lib/realtimeMeetup";

// UI디자인 CR 그룹의 입력 줄 — 둥근 입력칸 + 오른쪽에 떨어진 마이크 버튼.
// placeholder 는 화면마다 그 칸에 맞는 예시를 넣는다("예) 장보러 가실 분 있나요").
export default function SmartInput({
  label = "",
  placeholder,
  hint,
  suggestions = [],
  confirmLabel = "이걸로 할게요",
  divider = false,
  onConfirm,
  onVoice,
}: {
  /** 빈 문자열이면 머리말을 아예 안 보여준다(디자인 기본) */
  label?: string;
  placeholder: string;
  hint?: string;
  suggestions?: string[];
  /** 확인 버튼 문구. 바로 다음으로 가는 화면이 아니면 바꿔 쓴다(예: "이 장소 찾기") */
  confirmLabel?: string;
  divider?: boolean;
  onConfirm: (value: string) => void;
  /** 주면 말하기를 이 화면에서 처리한다(드롭업). 없으면 말하기 화면으로 넘어간다. */
  onVoice?: () => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const typing = value.trim().length > 0;

  // 후보가 수십~수백 개라 그냥 자르면 엉뚱한 게 먼저 나온다.
  // 앞글자부터 맞는 것 → 그 다음 어디든 들어간 것, 같은 조건이면 짧은 것 순.
  const matched = (() => {
    if (!typing) return [];
    const q = value.trim();
    return suggestions
      .filter((s) => s !== q && s.includes(q))
      .sort((a, b) => {
        const byPrefix = Number(b.startsWith(q)) - Number(a.startsWith(q));
        if (byPrefix) return byPrefix;
        return a.length - b.length;
      })
      .slice(0, 6);
  })();

  const handleVoice = () => {
    unlockAudio();
    if (onVoice) {
      // 화면을 떠나지 않는다 — 이 자리에서 듣고 이 칸을 채운다
      onVoice();
      return;
    }
    unlockAgentAudio();
    router.push("/create/listening");
  };

  return (
    <div
      className={`w-full flex flex-col gap-2.5 ${
        divider ? "border-t border-gray-200 pt-[18px]" : ""
      }`}
    >
      {label && <p className="text-[15px] text-muted">{label}</p>}

      <div className="flex items-stretch gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 h-[56px] px-4 rounded-xl border border-gray-200 bg-white text-[16px] text-black placeholder:text-muted focus:outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={handleVoice}
          aria-label="말하기"
          className="w-[56px] h-[56px] shrink-0 rounded-xl bg-surface flex items-center justify-center cursor-pointer"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="9" y="2" width="6" height="12" rx="3" fill="#555" />
            <path
              d="M5 11a7 7 0 0 0 14 0M12 18v4"
              stroke="#555"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {typing && (
        <>
          {matched.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {matched.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setValue(s)}
                  className="px-3 h-[36px] rounded-full bg-surface text-[15px] text-black cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => onConfirm(value.trim())}
            className="w-full h-[50px] rounded-lg bg-ink text-white text-[16px] font-bold cursor-pointer"
          >
            {confirmLabel}
          </button>
        </>
      )}

      {hint && <p className="text-[15px] text-muted leading-relaxed whitespace-pre-line">{hint}</p>}
    </div>
  );
}
