import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import PlaceholderBox from "@/components/PlaceholderBox";

export default function LocationPage() {
  return (
    <WireframeLayout>
      <div className="flex-1 flex flex-col justify-between p-4">
        <div className="flex flex-col gap-4">
          <PlaceholderBox height="h-[300px]" className="rounded">
            위치 정보 확인 이미지/지도
          </PlaceholderBox>

          <p className="text-center text-sm font-medium text-black py-4">
            서비스를 이용하려면 위치 정보 권한이 필요해요
          </p>
        </div>

        <div className="flex flex-col gap-3 pb-6 items-center">
          <Link
            href="/location-permission"
            className="w-[285px] h-[57px] bg-black text-white flex items-center justify-center rounded text-base font-medium"
          >
            허용
          </Link>
          <Link
            href="/location/denied"
            className="w-[285px] h-[57px] bg-white text-black border border-black flex items-center justify-center rounded text-base font-medium"
          >
            허용안함
          </Link>
        </div>
      </div>
    </WireframeLayout>
  );
}
