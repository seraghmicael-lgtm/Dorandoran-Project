// UI디자인 갱신분(JN-02 1235:3022 · CR-07) — 라벨(+보조정보) → 굵은 값 두 줄.
// 상세보기·검토 화면이 같이 쓴다. 최신 디자인엔 라벨 앞 아이콘이 없다.
export default function Field({
  label,
  meta,
  value,
  /** 값과 같은 줄, 오른쪽 끝에 붙는 것("길찾기" 버튼 등) */
  trailing,
}: {
  label: string;
  /** 라벨 뒤 세로선으로 이어지는 보조 정보 — 시간 범위, 도보 시간, 안내문 등 */
  meta?: string;
  value: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-[14px] text-muted">
        <span>{label}</span>
        {meta && (
          <>
            <span className="w-px h-3 bg-gray-300" aria-hidden="true" />
            <span>{meta}</span>
          </>
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[20px] font-medium text-black whitespace-pre-line">{value}</p>
        {trailing}
      </div>
    </div>
  );
}
