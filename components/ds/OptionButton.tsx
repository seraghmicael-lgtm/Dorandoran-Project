"use client";

// UI디자인 ds_radio(1089:5509) — 고르는 칸. 기본은 흰 바탕 + 회색 테두리,
// 고른 것은 연초록 배경 + 초록 테두리 + 초록 글씨.
export default function OptionButton({
  label,
  sub,
  selected = false,
  full = false,
  align = "center",
  width,
  onClick,
}: {
  label: string;
  /** 우측에 붙는 회색 보조 문구 (cr-03 의 "오후 4시에 끝나요") */
  sub?: string;
  selected?: boolean;
  /** 한 줄을 다 쓰는 넓은 칸 */
  full?: boolean;
  /** sub 없는 칸의 글씨 위치 — cr-03(세로 목록, sub 있는 형제와 줄맞춤)은 "start", cr-01(격자)은 기본값 "center" */
  align?: "start" | "center";
  /** 칸 너비를 px 로 못 박을 때 — cr-01 의 격자(154). 주면 full/flex-1 대신 이 값을 쓴다 */
  width?: number;
  onClick: () => void;
}) {
  const tone = selected
    ? "bg-accent-soft border-accent text-accent"
    : "bg-white border-[#E5E5E5] text-[#3F3F3F]";
  const sizing = width ? "shrink-0" : full ? "w-full" : "flex-1";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={width ? { width } : undefined}
      className={`${sizing} min-h-[56px] px-4 rounded-lg border ${tone} flex items-center ${
        sub ? "justify-between gap-3" : align === "start" ? "justify-start gap-3" : "justify-center gap-3"
      } text-[18px] font-medium cursor-pointer`}
    >
      <span>{label}</span>
      {sub && (
        <span className={`text-[14px] font-medium ${selected ? "text-accent" : "text-muted"}`}>
          {sub}
        </span>
      )}
    </button>
  );
}
