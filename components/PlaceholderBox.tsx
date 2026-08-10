import React from "react";

interface PlaceholderBoxProps {
  width?: string;
  height?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function PlaceholderBox({
  width = "w-full",
  height = "h-40",
  className = "",
  children,
}: PlaceholderBoxProps) {
  return (
    <div
      className={`bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-500 text-xs ${width} ${height} ${className}`}
    >
      {children}
    </div>
  );
}
