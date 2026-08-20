import React from "react";
import Link from "next/link";

interface BottomNavThreeProps {
  active?: "home" | "my-meetups" | "more";
}

export default function BottomNavThree({ active }: BottomNavThreeProps) {
  const items = [
    { label: "홈", href: "/home", key: "home" },
    { label: "내 동행", href: "/my-meetups", key: "my-meetups" },
    { label: "더보기", href: null, key: "more" },
  ];

  return (
    <nav className="h-[67px] border-t border-gray-200 bg-white flex items-center justify-around px-2">
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
