"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { unlockAudio } from "@/lib/voice";
import { unlockAgentAudio } from "@/lib/realtimeMeetup";
import MicIcon from "@/components/ds/MicIcon";

// UI디자인 CR 그룹의 입력 줄 — 둥근 입력칸 + 오른쪽에 떨어진 마이크 버튼.
// placeholder 는 화면마다 그 칸에 맞는 예시를 넣는다("예) 장보러 가실 분 있나요").
export default function SmartInput({
  label = "",
  placeholder,
  hint,
  suggestions = [],
  confirmLabel = "이걸로 할게요",
  divider = false,
  pending = false,
  showConfirmButton = true,
  onConfirm,
  onVoice,
  onChange,
}: {
  /** 빈 문자열이면 머리말을 아예 안 보여준다(디자인 기본) */
  label?: string;
  placeholder: string;
  hint?: string;
  suggestions?: string[];
  /** 확인 버튼 문구. 바로 다음으로 가는 화면이 아니면 바꿔 쓴다(예: "이 장소 찾기") */
  confirmLabel?: string;
  divider?: boolean;
  /** 확인 처리 중 — 버튼을 눌러도 반응 없는 것처럼 보이지 않게 막아둔다 */
  pending?: boolean;
  /** 확인 버튼을 보여줄지 여부. false면 typing 상태에서도 버튼을 안 보여준다 */
  showConfirmButton?: boolean;
  onConfirm: (value: string) => void;
  /** 주면 말하기를 이 화면에서 처리한다(드롭업). 없으면 말하기 화면으로 넘어간다. */
  onVoice?: () => void;
  /** 입력 값이 변경되었을 때 호출 */
  onChange?: (value: string) => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const typing = value.trim().length > 0;

  const handleSetValue = (newValue: string) => {
    setValue(newValue);
    onChange?.(newValue);
  };

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
      className={`w-full flex flex-col gap-4 ${
        divider ? "border-t border-gray-200 pt-[18px]" : ""
      }`}
    >
      {label && (
        <p className="text-[16px] font-medium leading-[1.5] text-[#777777]">{label}</p>
      )}

      {/* ds_input(1122:1733) — 테두리 1px 을 포함해 58, 안쪽 줄이 56.
          마이크는 따로 떨어진 버튼이 아니라 칸 안 오른쪽에 놓인 24 아이콘이다.
          (Figma 가 내보낸 코드에는 border 와 p-px 가 같이 있지만 실제 노드는 58 이라 테두리만 둔다) */}
      <div className="flex items-center rounded-xl border border-[#F2F2F2] bg-white">
        <input
          type="text"
          value={value}
          onChange={(e) => handleSetValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 h-[56px] pl-4 pr-1 bg-transparent text-[18px] font-medium text-black placeholder:text-[#AFAFAF] placeholder:font-medium focus:outline-none"
        />
        <button
          type="button"
          onClick={handleVoice}
          aria-label="말하기"
          className="mr-3 shrink-0 size-6 flex items-center justify-center cursor-pointer"
        >
          <MicIcon size={24} color="#5B5B5B" />
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
                  onClick={() => handleSetValue(s)}
                  className="px-3 h-[36px] rounded-full bg-surface text-[15px] text-black cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          {showConfirmButton && (
            <button
              type="button"
              onClick={() => onConfirm(value.trim())}
              disabled={pending}
              className="w-full h-[50px] rounded-lg bg-ink text-white text-[16px] font-bold cursor-pointer disabled:opacity-60 disabled:cursor-default"
            >
              {confirmLabel}
            </button>
          )}
        </>
      )}

      {hint && <p className="text-[15px] text-muted leading-relaxed whitespace-pre-line">{hint}</p>}
    </div>
  );
}
