import Link from "next/link";

// UI디자인 MY-01/MY-02 "지난 동행" — 끝난 동행이라 회색 판에 조용히 둔다.
export default function PastCard({
  id,
  activity,
  note,
}: {
  id: string;
  activity: string;
  /** "다녀오셨어요" / "2026년 8월 16일 취소하셨어요" */
  note: string;
}) {
  return (
    <Link href={`/meetup/${id}`} className="rounded-2xl bg-surface px-4 py-4 flex flex-col gap-1">
      <span className="text-[14px] text-muted">{note}</span>
      <span className="text-[19px] font-bold text-black">{activity}</span>
    </Link>
  );
}
