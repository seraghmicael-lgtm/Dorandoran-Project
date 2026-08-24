"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { unlockAudio } from "@/lib/voice";
import { unlockAgentAudio } from "@/lib/realtimeMeetup";

// 와이어프레임_v02 <입력칸 3가지 상태>의 공통 입력칸.
// ① 기본: placeholder + 우측 "말하기"(음성녹음v2 → 02_듣는 중으로 이동, 사용자 지시)
// ② 눌러서 쓰는 중: 굵은 입력값 + 바로 아래 후보 칩(키보드에 안 가리게) + "이걸로 할게요"
// ③ 말한 뒤(칸 안에 인식 결과 + "다시")는 음성이 별도 페이지로 가는 현 라우팅에선
//    발생하지 않아 배선하지 않는다 — 타이핑 상태가 정정 역할을 겸한다.
// placeholder 는 화면마다 그 칸에 맞는 예시를 넣는다("여기에 쓰세요 예) 함께 장 보기").
// 기본값은 예시 없는 형태 — 예시를 안 주면 어르신이 무엇을 쓰라는 건지 알기 어려우니
// 새 화면에 붙일 땐 반드시 그 칸에 맞는 예시를 넘길 것.
export default function SmartInput({
  label = "목록에 없으면",
  placeholder = "여기에 쓰세요",
  hint,
  suggestions = [],
  confirmLabel = "이걸로 할게요",
  onConfirm,
}: {
  /** 빈 문자열이면 머리말을 아예 안 보여준다(고를 목록이 없는 화면) */
  label?: string;
  placeholder?: string;
  hint: string;
  suggestions?: string[];
  /** 확인 버튼 문구. 바로 다음으로 가는 화면이 아니면 바꿔 쓴다(예: "이 장소 찾기") */
  confirmLabel?: string;
  onConfirm: (value: string) => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const typing = value.trim().length > 0;

  const matched = typing
    ? suggestions.filter((s) => s.includes(value.trim()) && s !== value.trim()).slice(0, 3)
    : [];

  const handleVoice = () => {
    unlockAudio();
    unlockAgentAudio();
    router.push("/create/listening");
  };

  return (
    <div className="w-full border-t border-gray-200 pt-[18px] flex flex-col gap-[9px]">
      {label && <p className="text-[15px] text-gray-500">{label}</p>}

      <div
        className={`w-full flex items-stretch border-black ${typing ? "border-2" : "border"}`}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 pl-4 pr-3 py-[18px] text-base font-bold text-black placeholder:font-normal placeholder:text-gray-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleVoice}
          className="flex items-center gap-[7px] pl-[15px] pr-4 border-l border-black cursor-pointer shrink-0"
        >
          <span className="w-[18px] h-[18px] rounded-full border-2 border-black" />
          <span className="text-[15px] font-bold text-black">말하기</span>
        </button>
      </div>

      {typing && (
        <>
          {matched.length > 0 && (
            <div className="flex flex-wrap gap-[7px]">
              {matched.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setValue(s)}
                  className="px-3 py-[9px] border border-gray-400 rounded-2xl text-sm text-black bg-white cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => onConfirm(value.trim())}
            className="w-full py-[14px] bg-black text-white text-[15px] font-bold cursor-pointer"
          >
            {confirmLabel}
          </button>
        </>
      )}

      <p className="text-[15px] text-gray-500 leading-relaxed">{hint}</p>
    </div>
  );
}
