"use client";

import React from "react";
import { usePathname } from "next/navigation";
import BottomNavFive from "./BottomNavFive";

interface WireframeLayoutProps {
  children: React.ReactNode;
  className?: string;
  justify?: "between" | "center" | "start";
  items?: "start" | "center";
  bottomNav?: "five" | "none";
}

const JUSTIFY = { between: "justify-between", center: "justify-center", start: "justify-start" };
const ITEMS = { start: "", center: "items-center" };

function activeTabFiveFor(pathname: string): "home" | "my-meetups" | "my-info" | "create" | undefined {
  if (pathname.startsWith("/home") || pathname.startsWith("/meetup")) return "home";
  if (pathname.startsWith("/my-meetups")) return "my-meetups";
  if (pathname.startsWith("/create")) return "create";
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

  // 하단 탭은 Figma 에서 탭바가 있는 화면에만 둔다 — 03_홈, 01/02_내 동행 확인.
  // 상세 보기·동행 만들기처럼 한 가지 일을 끝내러 들어온 화면에서는 빼서
  // 하던 일을 놓치지 않게 한다. (bottomNav 를 직접 주면 그 값이 이긴다)
  const effectiveNav =
    bottomNav ??
    (pathname === "/home" || pathname.startsWith("/my-meetups") ? "five" : "none");

  return (
    <div className="min-h-screen bg-gray-100 text-black flex justify-center items-start">
      {/* 기준 프레임 360×800. 높이는 800을 하한으로만 쓰고 실제 화면이 더 길면 따라간다 —
          800px 로 못 박으면 긴 폰에서 아래가 비고 짧은 폰에서 잘린다.
          100svh 는 주소창이 접혔다 펴질 때 프레임이 튀지 않게 한다. */}
      <div className="w-full max-w-[360px] min-h-[max(800px,100svh)] bg-white border-x border-gray-200 flex flex-col relative shadow-none font-sans text-sm">
        <div className={`flex-1 flex flex-col ${JUSTIFY[justify]} ${ITEMS[items]} ${className}`}>
          {children}
        </div>
        {effectiveNav === "five" && <BottomNavFive active={activeTabFiveFor(pathname)} />}
      </div>
    </div>
  );
}
