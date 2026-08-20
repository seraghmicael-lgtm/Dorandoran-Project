"use client";

import React from "react";
import { usePathname } from "next/navigation";
import BottomNavFive from "./BottomNavFive";
import BottomNavThree from "./BottomNavThree";

interface WireframeLayoutProps {
  children: React.ReactNode;
  className?: string;
  justify?: "between" | "center" | "start";
  items?: "start" | "center";
  bottomNav?: "five" | "three" | "none";
}

const JUSTIFY = { between: "justify-between", center: "justify-center", start: "justify-start" };
const ITEMS = { start: "", center: "items-center" };

function activeTabFiveFor(pathname: string): "home" | "my-meetups" | "my-info" | "create" | undefined {
  if (pathname.startsWith("/home") || pathname.startsWith("/meetup")) return "home";
  if (pathname.startsWith("/my-meetups")) return "my-meetups";
  if (pathname.startsWith("/create")) return "create";
  return undefined;
}

function activeTabThreeFor(pathname: string): "home" | "my-meetups" | "more" | undefined {
  if (pathname.startsWith("/home")) return "home";
  if (pathname.startsWith("/my-meetups")) return "my-meetups";
  return undefined;
}

export default function WireframeLayout({
  children,
  className = "",
  justify = "between",
  items = "start",
  bottomNav,
}: WireframeLayoutProps) {
  const pathname = usePathname();

  const effectiveNav = bottomNav ?? "five";

  return (
    <div className="min-h-screen bg-gray-100 text-black flex justify-center items-start">
      <div className="w-full max-w-[375px] min-h-screen bg-white border-x border-gray-200 flex flex-col relative shadow-none font-sans text-sm">
        <div className={`flex-1 flex flex-col ${JUSTIFY[justify]} ${ITEMS[items]} ${className}`}>
          {children}
        </div>
        {effectiveNav === "three" && <BottomNavThree active={activeTabThreeFor(pathname)} />}
        {effectiveNav === "five" && <BottomNavFive active={activeTabFiveFor(pathname)} />}
      </div>
    </div>
  );
}
