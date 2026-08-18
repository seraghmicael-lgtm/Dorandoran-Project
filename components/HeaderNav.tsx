import React from "react";
import Link from "next/link";

export default function HeaderNav() {
  return (
    <header className="h-[67px] px-4 flex items-center justify-between border-b border-gray-200 bg-white">
      <Link href="/home" className="flex items-center gap-1.5 text-base font-medium text-black">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9" />
        </svg>
        로고
      </Link>
      <div className="flex items-center gap-3 text-sm text-gray-700">
        <span>알림</span>
        <span>내 정보</span>
      </div>
    </header>
  );
}
