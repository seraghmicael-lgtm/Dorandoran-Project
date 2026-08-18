import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function HeaderNav() {
  return (
    <header className="h-[67px] px-4 flex items-center justify-between border-b border-gray-200 bg-white">
      <Link href="/home" className="flex items-center gap-1.5 text-base font-medium text-black">
        <Image src="/logo1.svg" alt="" width={28} height={28} className="rounded-md" />
        로고
      </Link>
      <div className="flex items-center gap-3 text-sm text-gray-700">
        <span>알림</span>
        <span>내 정보</span>
      </div>
    </header>
  );
}
