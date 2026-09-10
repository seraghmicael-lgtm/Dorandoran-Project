// UI디자인 갱신분(JN-02 1235:3022 · CR-07) — 라벨(+보조정보) → 굵은 값 두 줄.
// 상세보기·검토 화면이 같이 쓴다. 최신 디자인엔 라벨 앞 아이콘이 없다.
// 라벨/보조정보 app/body-xs-500(14 · text/tertiary), 값 app/body-lg-500(20 · #171717),
// 두 줄 사이 4, 라벨과 보조정보를 잇는 세로선은 1×12 · text/subtle.
export default function Field({
  label,
  labelColor,
  meta,
  value,
  /** 값과 같은 줄, 오른쪽 끝에 붙는 것("길찾기" 버튼 등) */
  trailing,
}: {
  label: string;
  /** 라벨 색상 — 기본값 "text-sub" (text/tertiary #777) */
  labelColor?: string;
  /** 라벨 뒤 세로선으로 이어지는 보조 정보 — 시간 범위, 도보 시간, 안내문 등 */
  meta?: string;
  value: string;
  trailing?: React.ReactNode;
}) {
  const labelClass = labelColor ?? "text-sub";

  return (
    <div className="flex flex-col gap-1">
      <div className={`flex items-center gap-2 text-[14px] font-medium leading-[1.5] ${labelClass}`}>
        <span>{label}</span>
        {meta && (
          <>
            <span className="w-px h-3 bg-faint" aria-hidden="true" />
            <span>{meta}</span>
          </>
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[20px] font-medium leading-[1.5] text-ink whitespace-pre-line">{value}</p>
        {trailing}
      </div>
    </div>
  );
}
