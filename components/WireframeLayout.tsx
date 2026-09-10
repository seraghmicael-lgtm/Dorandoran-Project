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
      {/* 기준 프레임 360×800 고정 — 폰 화면 크기와 무관하게 항상 같은 캔버스를 쓴다.
          프레임 높이가 못 박혀 있으므로 넘치는 내용은 안쪽에서만 스크롤한다
          (ds_navigation_bottom 은 프레임 바닥에 붙은 채로 남는다).
          가장자리 선은 border 가 아니라 ring 으로 긋는다 — border 는 폭을 1px 씩
          갉아먹어서 화면 안의 여백이 Figma 좌표와 어긋난다. */}
      <div
        className="w-[360px] h-[800px] shrink-0 bg-white ring-1 ring-gray-200 flex flex-col relative shadow-none font-sans text-sm"
      >
        <div
          className={`flex-1 flex flex-col overflow-y-auto ${JUSTIFY[justify]} ${ITEMS[items]} ${className}`}
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
