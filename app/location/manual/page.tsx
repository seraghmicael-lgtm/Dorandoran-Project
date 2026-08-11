import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import PlaceholderBox from "@/components/PlaceholderBox";
import { safeInternalPath } from "@/lib/safePath";

export default async function LocationManualPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const nextHref = safeInternalPath(next, "/home");

  return (
    <WireframeLayout justify="between" className="p-4">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-2 py-2 border-b border-gray-200">
          <Link href="/location-permission" className="text-lg font-bold text-black px-1">
            ←
          </Link>
        </div>

        <h1 className="text-xl font-bold text-black pt-2">
          내가 위치한 동네를 선택해주세요
        </h1>

        {/* Input field */}
        <div className="border border-gray-300 rounded p-3 text-sm text-gray-500">
          직접 입력
        </div>

        {/* Map Area Placeholder */}
        <PlaceholderBox height="h-[380px]" className="rounded flex flex-col items-center justify-between p-4 relative">
          <div className="flex justify-between w-full">
            <span className="text-xs bg-white px-2 py-1 border border-gray-300 rounded">
              현재 위치 핀
            </span>
            <div className="w-8 h-8 rounded-full border border-gray-400 bg-white flex items-center justify-center text-xs">
              내 위치로
            </div>
          </div>
          <span className="text-xs text-gray-400">지도 영역</span>
        </PlaceholderBox>
      </div>

      {/* Select Button */}
      <div className="py-4">
        <Link
          href={`/notification-permission?next=${encodeURIComponent(nextHref)}`}
          className="w-full h-[48px] bg-black text-white flex items-center justify-center rounded text-base font-medium"
        >
          선택
        </Link>
      </div>
    </WireframeLayout>
  );
}
