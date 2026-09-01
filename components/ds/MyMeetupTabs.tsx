import Link from "next/link";

// UI디자인 MY-01/MY-02 상단 탭 — 활성 탭만 검정 굵게 + 밑줄
export default function MyMeetupTabs({ active }: { active: "joined" | "created" }) {
  const tabs = [
    { key: "joined", label: "참여한 동행", href: "/my-meetups" },
    { key: "created", label: "만든 동행", href: "/my-meetups/created" },
  ] as const;

  return (
    <div className="flex items-stretch border-b border-gray-200 bg-white">
      {tabs.map((t) =>
        t.key === active ? (
          <div
            key={t.key}
            className="flex-1 flex items-center justify-center py-3.5 border-b-2 border-black"
          >
            <span className="text-[17px] font-bold text-black">{t.label}</span>
          </div>
        ) : (
          <Link
            key={t.key}
            href={t.href}
            className="flex-1 flex items-center justify-center py-3.5"
          >
            <span className="text-[17px] text-muted">{t.label}</span>
          </Link>
        )
      )}
    </div>
  );
}
