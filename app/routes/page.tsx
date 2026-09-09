import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import { SCREEN_FLOW } from "@/lib/screenFlow";

export default function RouteIndexPage() {
  const routes = SCREEN_FLOW;

  return (
    <WireframeLayout className="p-4" bottomNav="none">
      <div className="flex-1 flex flex-col gap-4 py-4 overflow-y-auto">
        <h1 className="text-lg font-bold text-black border-b border-gray-200 pb-2">
          도란도란 와이어프레임_v01 라우트 목록
        </h1>
        <div className="flex flex-col gap-1.5">
          {routes.map((r, i) => (
            <Link
              key={r.href}
              href={r.href}
              className="p-2 border border-gray-200 rounded text-xs hover:border-black font-medium text-black bg-white flex items-center justify-between"
            >
              <span>{`${i + 1}. ${r.label}`}</span>
              <span className="text-gray-400">→</span>
            </Link>
          ))}
        </div>
      </div>
    </WireframeLayout>
  );
}
