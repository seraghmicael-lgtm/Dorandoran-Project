import React from "react";
import Link from "next/link";

interface BottomNavThreeProps {
  active?: "home" | "my-meetups" | "more";
}

export default function BottomNavThree({ active }: BottomNavThreeProps) {
  const items = [
    { label: "홈", href: "/feed", key: "home" },
    { label: "내 동행", href: "/my-meetups", key: "my-meetups" },
    { label: "더보기", href: "#", key: "more" },
  ];

  return (
    <nav className="h-[53px] border-t border-gray-200 bg-white flex items-center justify-around px-2">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`flex-1 text-center py-2 text-sm ${
            active === item.key ? "font-bold text-black" : "text-gray-600"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
