import React from "react";
import Link from "next/link";

export default function HeaderNav() {
  return (
    <header className="h-[57px] px-5 flex items-center justify-between border-b border-gray-200 bg-white">
      <Link href="/home" className="text-base font-bold text-black">
        로고
      </Link>
      <span className="text-sm text-gray-700">알림</span>
    </header>
  );
}
