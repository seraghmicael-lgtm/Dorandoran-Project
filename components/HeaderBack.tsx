import React from "react";
import Link from "next/link";

interface HeaderBackProps {
  title?: string;
  backHref?: string;
}

export default function HeaderBack({ title, backHref }: HeaderBackProps) {
  const content = (
    <header className="h-[65px] px-4 flex items-center gap-2 border-b border-gray-200 bg-white">
      <span className={`text-lg text-black ${backHref ? "cursor-pointer" : ""}`}>←</span>
      {title && <span className="text-base font-medium text-black">{title}</span>}
    </header>
  );

  if (backHref) {
    return <Link href={backHref}>{content}</Link>;
  }

  return content;
}
