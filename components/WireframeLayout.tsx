import React from "react";

interface WireframeLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function WireframeLayout({ children, className = "" }: WireframeLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100 text-black flex justify-center items-start">
      <div className={`w-full max-w-[375px] min-h-screen bg-white border-x border-gray-200 flex flex-col justify-between relative shadow-none font-sans text-sm ${className}`}>
        {children}
      </div>
    </div>
  );
}
