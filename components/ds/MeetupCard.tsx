import Image from "next/image";
import Link from "next/link";

// UI디자인 ds_card(1089:4589) — 홈·내 동행에서 같이 쓰는 동행 카드.
// 흰 바탕 · 12 라운드 · #f2f2f2 테두리 · 0 2px 6px 그림자, 안쪽 여백 16.
// 자리수 배지(ds_count)는 카드 오른쪽 위에 겹쳐 놓는다.

// fill_person(1237:3358) — 배지 색을 따라가야 해서 export 한 path 를 currentColor 로 쓴다
function FillPerson() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M8.45192 7.5305C10.8716 7.53055 12.8332 9.4324 12.8333 11.7787C12.8333 12.361 12.3465 12.8333 11.746 12.8333H2.25401C1.65354 12.8333 1.16667 12.361 1.16667 11.7787C1.16683 9.4324 3.12838 7.53055 5.54808 7.5305H8.45192Z"
        fill="currentColor"
      />
      <path
        d="M7 1.16667C8.61083 1.16667 9.91667 2.43302 9.91667 3.99504C9.91662 5.55701 8.6108 6.82341 7 6.82341L6.84975 6.81984C5.30877 6.74403 4.08338 5.50815 4.08333 3.99504C4.08333 2.43302 5.38917 1.16667 7 1.16667Z"
        fill="currentColor"
      />
    </svg>
  );
}

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
  /** "1시간" 처럼 소요 시간만 ("1시간 소요"로 들어와도 된다) */
  duration?: string | null;
  joined: number;
  maxPeople: number;
  /** 카드 아래에 붙는 것(취소하기 등) */
  footer?: React.ReactNode;
}) {
  const clock = startTime.replace(/^오늘\s*/, "").split(" ~ ")[0];
  const spent = duration?.replace(/\s*소요$/, "");
  // "도란공원 정문 · 걸어서 8분" — 만나는 곳과 도보 시간을 가운뎃점으로 잇는다
  const [place, walk] = (locationName ?? "").split(" · ");

  // ds_count — 여유 있으면 연두, 한 자리만 남았으면(임박) 분홍, 다 찼으면 회색
  const countTone =
    joined >= maxPeople
      ? "bg-count-full-bg text-count-full-ink"
      : joined === maxPeople - 1
      ? "bg-count-soon-bg text-count-soon-ink"
      : "bg-count-ok-bg text-count-ok-ink";

  const body = (
    <div className="flex flex-col gap-3">
      {/* content(1083:499) 오른쪽 위에 겹치는 자리수 배지 */}
      <span
        className={`absolute right-4 top-4 flex flex-col items-center gap-1 rounded-2xl px-3 py-2 ${countTone}`}
      >
        <FillPerson />
        <span className="flex items-center leading-none font-medium">
          <span className="text-[14px]">{joined}</span>
          <span className="text-[12px]">/</span>
          <span className="text-[14px]">{maxPeople}</span>
        </span>
      </span>

      {/* 시각 + 제목 — 배지에 가리지 않게 오른쪽을 비워 둔다 */}
      <div className="flex flex-col justify-center gap-0.5 pr-[64px]">
        <p className="text-[16px] font-bold leading-[1.5] text-black">{clock}</p>
        <p className="text-[20px] font-bold leading-[1.3] text-black">{activity}</p>
      </div>

      {/* 예상 시간 · 만나는 곳 */}
      <div className="flex flex-col gap-0.5 text-[12px] font-medium leading-[1.5] text-sub">
        {spent && (
          <div className="flex items-center gap-[7px]">
            <span className="flex items-center gap-1">
              <Image src="/illust/fill-time.svg" alt="" width={14} height={14} className="shrink-0" />
              예상 시간
            </span>
            <span>{spent}</span>
          </div>
        )}
        {place && (
          <div className="flex items-center gap-1">
            <Image src="/illust/fill-gps.svg" alt="" width={14} height={14} className="shrink-0" />
            <span>{place}</span>
            {walk && (
              <>
                <span>∙</span>
                <span>{walk}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const shell =
    "relative rounded-xl border border-card-line bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.08)]";

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
