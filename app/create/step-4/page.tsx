import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import PlaceholderBox from "@/components/PlaceholderBox";
import { safeInternalPath } from "@/lib/safePath";

export default async function CreateStep4Page({
  searchParams,
}: {
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const { from } = await searchParams;
  const backHref = safeInternalPath(from, "/create/step-2");

  return (
    <WireframeLayout className="p-4 flex flex-col justify-between">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center pb-2 border-b border-gray-200">
          <Link href={backHref} className="text-lg font-bold text-black px-1">
            ←
          </Link>
        </div>

        <h1 className="text-xl font-bold text-black pt-2">
          만나고 싶은 장소를 선택해주세요
        </h1>

        {/* Current location */}
        <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-full w-fit bg-white text-xs">
          <div className="w-3 h-3 rounded-full border border-gray-400 bg-gray-200" />
          <span className="text-black font-medium">현재 내 위치: 은평동</span>
        </div>

        {/* Search input field */}
        <div className="p-3 border border-gray-300 rounded text-sm text-gray-400 bg-white">
          검색할 위치를 입력하세요
        </div>

        {/* Map placeholder with pin and my-location reset */}
        <PlaceholderBox height="h-[340px]" className="rounded flex flex-col justify-between p-4 relative">
          <div className="flex justify-between w-full">
            <span className="text-xs bg-white px-2 py-1 border border-gray-300 rounded">
              선택 위치 핀
            </span>
            <div className="w-8 h-8 rounded-full border border-gray-400 bg-white flex items-center justify-center text-xs">
              내 위치로
            </div>
          </div>
          <span className="text-xs text-gray-400 self-center">지도 영역</span>
        </PlaceholderBox>
      </div>

      <div className="py-4">
        <Link
          href={backHref}
          className="w-full h-[50px] bg-black text-white flex items-center justify-center rounded text-base font-medium"
        >
          선택
        </Link>
      </div>
    </WireframeLayout>
  );
}
