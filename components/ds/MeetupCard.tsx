import Link from "next/link";

// UI디자인 ds_card — 홈·내 동행에서 같이 쓰는 동행 카드.
// 시각 + 자리(N/M) · 제목 · 예상 시간 · 만나는 곳 순서.
export default function MeetupCard({
  id,
  startTime,
  activity,
  locationName,
  duration,
  joined,
  maxPeople,
  footer,
}: {
  id?: string;
  startTime: string;
  activity: string;
  locationName?: string | null;
  /** "1시간" 처럼 소요 시간만 */
  duration?: string | null;
  joined: number;
  maxPeople: number;
  /** 카드 아래에 붙는 것(취소하기 등) */
  footer?: React.ReactNode;
}) {
  const clock = startTime.replace(/^오늘\s*/, "").split(" ~ ")[0];

  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[15px] font-bold text-black">{clock}</span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-faint text-accent text-[13px] font-bold">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="2.4" />
            <path d="M5 19c.8-3.5 3.5-5.4 7-5.4s6.2 1.9 7 5.4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          {joined}/{maxPeople}
        </span>
      </div>
      <p className="mt-1 text-[19px] font-bold text-black">{activity}</p>
      <div className="mt-2.5 flex flex-col gap-1 text-[14px] text-muted">
        {duration && (
          <span className="flex items-center gap-1.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            예상 시간 {duration}
          </span>
        )}
        {locationName && (
          <span className="flex items-center gap-1.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
            </svg>
            {locationName}
          </span>
        )}
      </div>
    </>
  );

  const shell = "rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-[0_1px_6px_rgba(0,0,0,0.06)]";

  if (footer) {
    return (
      <div className={`${shell} flex flex-col`}>
        {id ? <Link href={`/meetup/${id}`}>{body}</Link> : body}
        <div className="mt-3 flex justify-end">{footer}</div>
      </div>
    );
  }
  return id ? (
    <Link href={`/meetup/${id}`} className={`${shell} block`}>
      {body}
    </Link>
  ) : (
    <div className={shell}>{body}</div>
  );
}
