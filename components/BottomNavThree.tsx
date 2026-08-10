import React from "react";
import Link from "next/link";

interface BottomNavThreeProps {
  active?: "home" | "my-meetups" | "more";
}

export default function BottomNavThree({ active }: BottomNavThreeProps) {
  const items = [
    { label: "홈", href: "/feed", key: "home" },
    { label: "내 동행", href: "/my-meetups", key: "my-meetups" },
    { label: "더보기", href: null, key: "more" },
  ];

  return (
    <nav className="h-[53px] border-t border-gray-200 bg-white flex items-center justify-around px-2">
      {items.map((item) =>
        item.href ? (
          <Link
            key={item.key}
            href={item.href}
            className={`flex-1 text-center py-2 text-sm ${
              active === item.key ? "font-bold text-black" : "text-gray-600"
            }`}
          >
            {item.label}
          </Link>
        ) : (
          // ponytail: 더보기 화면은 와이어프레임에 없음 — 없는 라우트를 지어내는 대신 비활성 표시
          <span
            key={item.key}
            className="flex-1 text-center py-2 text-sm text-gray-300 cursor-not-allowed"
          >
            {item.label}
          </span>
        )
      )}
    </nav>
  );
}
