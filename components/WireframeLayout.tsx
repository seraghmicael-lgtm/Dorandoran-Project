import React from "react";

interface WireframeLayoutProps {
  children: React.ReactNode;
  className?: string;
  justify?: "between" | "center";
  items?: "start" | "center";
}

// ponytail: justify-between/items-center를 className으로 그냥 덮어쓰려 하면
// Tailwind가 생성한 CSS 순서에 따라 이기는 쪽이 달라져 신뢰할 수 없다.
// "start"는 원래 이 div에 items-* 클래스가 전혀 없던 상태(브라우저 기본값 stretch,
// 자식이 375px 폭을 꽉 채움)를 그대로 보존해야 한다 — 여기서 "items-start"를
// 실제로 내보내면 오히려 회귀가 된다(직접 검증: 안 그러면 헤더/하단바처럼
// w-full이 없는 자식들이 375px를 못 채우고 쪼그라듦). "center"를 요청할 때만
// items-center 하나만 내보낸다.
const JUSTIFY = { between: "justify-between", center: "justify-center" };
const ITEMS = { start: "", center: "items-center" };

export default function WireframeLayout({
  children,
  className = "",
  justify = "between",
  items = "start",
}: WireframeLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100 text-black flex justify-center items-start">
      <div
        className={`w-full max-w-[375px] min-h-screen bg-white border-x border-gray-200 flex flex-col ${JUSTIFY[justify]} ${ITEMS[items]} relative shadow-none font-sans text-sm ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
