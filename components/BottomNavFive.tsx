"use client";

import Link from "next/link";

// UI디자인 ds_navigation_bottom — 홈 · 내 동행 · 내 정보 · 만들기.
// 만들기만 초록 ⊕ 로 도드라진다(이 앱에서 하는 유일한 "만드는" 일이라서).
interface BottomNavFiveProps {
  active?: "home" | "my-meetups" | "my-info" | "create";
}

function Icon({ name, active }: { name: string; active: boolean }) {
  const c = active ? "#171717" : "#9E9E9E";
  const common = { stroke: c, strokeWidth: 1.8, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "home")
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5H9v5H5a1 1 0 0 1-1-1v-8.5Z" {...common} />
      </svg>
    );
  if (name === "my-meetups")
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="8" r="3" {...common} />
        <circle cx="16.5" cy="9.5" r="2.2" {...common} />
        <path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5M16 14.5c2 .4 3.4 2 3.8 4.5" {...common} />
      </svg>
    );
  if (name === "my-info")
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3.4" {...common} />
        <path d="M4.8 20c.8-3.9 3.6-6 7.2-6s6.4 2.1 7.2 6" {...common} />
      </svg>
    );
  // 만들기 — 늘 초록
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="#45B83C" />
      <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function BottomNavFive({ active }: BottomNavFiveProps) {
  const items = [
    { label: "홈", href: "/home", key: "home" },
    { label: "내 동행", href: "/my-meetups", key: "my-meetups" },
    { label: "내 정보", href: null, key: "my-info" },
    { label: "만들기", href: "/create/activity?new=1", key: "create" },
  ];

  return (
    <nav className="h-[55px] border-t border-gray-100 bg-white flex items-center justify-around px-1">
      {items.map((item) => {
        const on = active === item.key;
        const body = (
          <>
            <Icon name={item.key} active={on} />
            <span className={`text-[11px] ${on ? "text-black font-bold" : "text-[#9E9E9E]"}`}>
              {item.label}
            </span>
          </>
        );
        const cls = "flex-1 flex flex-col items-center gap-0.5 pt-1";
        return item.href ? (
          <Link key={item.key} href={item.href} className={cls}>
            {body}
          </Link>
        ) : (
          <span key={item.key} className={`${cls} opacity-60 cursor-not-allowed`}>
            {body}
          </span>
        );
      })}
    </nav>
  );
}
