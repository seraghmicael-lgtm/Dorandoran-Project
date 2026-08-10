import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import HeaderBack from "@/components/HeaderBack";
import PlaceholderBox from "@/components/PlaceholderBox";

export default function CreateStep4Page() {
  return (
    <WireframeLayout>
      <HeaderBack backHref="/create/step-2" />

      <div className="p-4 flex-1 flex flex-col justify-between gap-4 overflow-y-auto">
        <div className="flex flex-col gap-3">
          <h1 className="text-base font-bold text-black">
            만나고 싶은 장소를 선택해주세요
          </h1>

          {/* Current location pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-full w-fit bg-white text-xs">
            <span className="w-2 h-2 rounded-full border border-black inline-block" />
            <span className="text-black font-medium">현재 내 위치: 은평동</span>
          </div>

          {/* Search box */}
          <div className="p-2 border border-gray-300 rounded bg-white text-xs text-gray-400">
            검색할 위치를 입력하세요
          </div>

          {/* Map placeholder */}
          <PlaceholderBox height="h-[380px]" className="rounded">
            지도 영역 (333x562)
          </PlaceholderBox>
        </div>

        <div className="pb-4 flex justify-center">
          <Link
            href="/create/step-2"
            className="w-[296px] h-[62px] bg-black text-white flex items-center justify-center rounded text-base font-medium"
          >
            선택
          </Link>
        </div>
      </div>
    </WireframeLayout>
  );
}
