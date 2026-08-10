import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import HeaderBack from "@/components/HeaderBack";
import PlaceholderBox from "@/components/PlaceholderBox";

export default function LocationDeniedPage() {
  return (
    <WireframeLayout>
      <HeaderBack backHref="/location" />

      <div className="p-4 flex-1 flex flex-col justify-between gap-4 overflow-y-auto">
        <div className="flex flex-col gap-3">
          <h1 className="text-base font-bold text-black">
            내가 위치한 곳을 선택해주세요
          </h1>

          <div className="flex items-center gap-2 border border-gray-300 rounded px-3 py-2 text-sm bg-white">
            <span className="text-gray-400">○</span>
            <span className="text-gray-700">직접 입력</span>
          </div>

          <PlaceholderBox height="h-[350px]" className="rounded">
            지도 위치 선택 영역 (333x508)
          </PlaceholderBox>
        </div>

        <div className="pb-4 flex justify-center">
          <Link
            href="/home"
            className="w-[296px] h-[62px] bg-black text-white flex items-center justify-center rounded text-base font-medium"
          >
            선택
          </Link>
        </div>
      </div>
    </WireframeLayout>
  );
}
