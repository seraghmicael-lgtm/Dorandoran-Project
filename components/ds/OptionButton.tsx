"use client";

// UI디자인 ds_radio — 고르는 칸. 고른 것은 연초록 배경 + 초록 테두리 + 초록 글씨.
export default function OptionButton({
  label,
  sub,
  selected = false,
  full = false,
  onClick,
}: {
  label: string;
  /** 우측에 붙는 회색 보조 문구 (cr-03 의 "오후 4시에 끝나요") */
  sub?: string;
  selected?: boolean;
  /** 한 줄을 다 쓰는 넓은 칸 */
  full?: boolean;
  onClick: () => void;
}) {
  const tone = selected
    ? "bg-accent-soft border-accent text-accent"
    : "bg-surface border-transparent text-black";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`${full ? "w-full" : "flex-1"} min-h-[56px] px-4 rounded-xl border ${tone} flex items-center ${
        sub ? "justify-between gap-3" : "justify-center"
      } text-[17px] font-bold cursor-pointer`}
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
