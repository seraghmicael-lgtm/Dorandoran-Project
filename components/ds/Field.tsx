// UI디자인 갱신분(CR-07·JN-02 새 레이어) — 라벨-값 한 줄 표 대신 필드마다
// "작은 라벨(+보조 정보) → 굵은 값" 두 줄로 보여준다. 상세보기·검토 화면이 같이 쓴다.
export default function Field({
  icon,
  label,
  meta,
  value,
  children,
}: {
  /** 상세보기에서만 라벨 앞에 붙는 아이콘 */
  icon?: React.ReactNode;
  label: string;
  /** 라벨 뒤 "|"로 이어지는 보조 정보 — 시간 범위, 도보 시간, 안내문 등 */
  meta?: string;
  value: string;
  /** 값 아래에 더 붙는 것(길찾기 버튼 등) */
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1 text-[13px] text-accent">
        {icon}
        <span className="font-medium">{label}</span>
        {meta && (
          <>
            <span className="text-gray-300">|</span>
            <span className="text-muted">{meta}</span>
          </>
        )}
      </div>
      <p className="text-[17px] font-bold text-black whitespace-pre-line">{value}</p>
      {children}
    </div>
  );
}
