import React from "react";
import Link from "next/link";

interface BottomNavFiveProps {
  active?: "home" | "my-meetups" | "community" | "create";
}

export default function BottomNavFive({ active }: BottomNavFiveProps) {
  const items = [
    { label: "홈", href: "/home", key: "home" },
    { label: "내 동행", href: "/my-meetups", key: "my-meetups" },
    { label: "동네소식", href: "/community", key: "community" },
    { label: "만들기", href: "/start/choose", key: "create" },
  ];

  return (
    <nav className="h-[67px] border-t border-gray-200 bg-white flex items-center justify-around px-2">
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
