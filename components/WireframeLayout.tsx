import React from "react";

interface WireframeLayoutProps {
  children: React.ReactNode;
  className?: string;
  justify?: "between" | "center";
  items?: "start" | "center";
}

// ponytail: justify-between/items-start를 className으로 그냥 덮어쓰려 하면
// Tailwind가 생성한 CSS 순서에 따라 이기는 쪽이 달라진다(확인됨: items-start가
// items-center를 실제로 이겨서 /login, /create가 좌측 정렬로 깨졌었음).
// 두 클래스가 동시에 나오지 않도록 하나만 골라 렌더링해 순서 의존을 없앤다.
const JUSTIFY = { between: "justify-between", center: "justify-center" };
const ITEMS = { start: "items-start", center: "items-center" };

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
