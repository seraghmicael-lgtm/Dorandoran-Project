"use client";

import React from "react";
import { usePathname } from "next/navigation";
import BottomNavFive from "./BottomNavFive";
import PushDemo from "./ds/PushDemo";

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
      {/* 기준 프레임 360×800. 하단 탭이 있는 화면은 프레임 자체를 화면 높이에 고정하고
          안쪽 콘텐츠만 스크롤한다 — ds_navigation_bottom 이 항상 바닥에 붙어 있어야 해서다.
          탭이 없는 화면은 기존처럼 프레임이 내용 길이를 따라 늘어난다(높이는 800을
          하한으로만 쓴다 — 못 박으면 긴 폰에서 아래가 비고 짧은 폰에서 잘린다).
          100svh 는 주소창이 접혔다 펴질 때 프레임이 튀지 않게 한다. */}
      <div
        className={`w-full max-w-[360px] bg-white border-x border-gray-200 flex flex-col relative shadow-none font-sans text-sm ${
          effectiveNav === "five" ? "h-[100svh]" : "min-h-[max(800px,100svh)]"
        }`}
      >
        <div
          className={`flex-1 flex flex-col pt-10 ${JUSTIFY[justify]} ${ITEMS[items]} ${className} ${
            effectiveNav === "five" ? "overflow-y-auto" : ""
          }`}
        >
          {children}
        </div>
        {effectiveNav === "five" && <BottomNavFive active={activeTabFiveFor(pathname)} />}
        {/* 프로토타입 알림 팝업 조작판 — 모든 화면이 이 레이아웃을 거치므로 여기 한 곳에 둔다 */}
        <PushDemo />
      </div>
    </div>
  );
}
