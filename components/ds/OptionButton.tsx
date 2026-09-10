"use client";

// UI디자인 ds_radio(1089:5509) — 고르는 칸. 기본은 흰 바탕 + 회색 테두리,
// 고른 것은 연초록 배경 + 초록 테두리 + 초록 글씨(comp-radio/*-select = #32952D).
//
// 두 가지 모양이 있다.
//   grid  — cr-01(격자). 한 줄짜리 18px 글씨를 가운데 둔다. 56 높이.
//   pair  — cr-05(1187:4619). 2열 격자 한 칸. 굵은 16px 글씨를 가운데 둔다. 56 높이.
//   stack — cr-03(1187:4138). 굵은 16px 제목 아래 14px 보조 문구를 4 띄워 쌓는다. 72 높이.
export default function OptionButton({
  label,
  sub,
  selected = false,
  variant = "grid",
  width,
  onClick,
}: {
  label: string;
  /** 제목 아래에 깔리는 회색 보조 문구 (cr-03 의 "오후 4시에 끝나요") — stack 에서만 쓴다 */
  sub?: string;
  selected?: boolean;
  variant?: "grid" | "pair" | "stack";
  /** 칸 너비를 px 로 못 박을 때 — cr-01 의 격자(154). 주면 flex-1 대신 이 값을 쓴다 */
  width?: number;
  onClick: () => void;
}) {
  const stack = variant === "stack";
  const pair = variant === "pair";
  const tone = selected
    ? "bg-accent-soft border-brand text-brand"
    : "bg-white border-[#E5E5E5] text-[#3F3F3F]";
  const sizing = width ? "shrink-0" : stack || pair ? "w-full" : "flex-1";
  const shape = stack
    ? "min-h-[72px] py-3 flex-col items-start justify-center gap-1"
    : pair
    ? "min-h-[56px] items-center justify-center text-[16px] font-bold leading-[1.4]"
    : "min-h-[56px] items-center justify-center gap-3 text-[18px] font-medium";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={width ? { width } : undefined}
      className={`${sizing} ${shape} px-4 rounded-lg border ${tone} flex cursor-pointer`}
    >
      <span className={stack ? "text-[16px] font-bold leading-[1.4]" : undefined}>{label}</span>
      {stack && sub && (
        // 고른 칸은 위 글씨와 같은 초록(comp-radio/text-primary)을 그대로 물려받는다
        <span className={`text-[14px] font-medium leading-none ${selected ? "" : "text-[#777777]"}`}>
          {sub}
        </span>
      )}
    </button>
  );
}
