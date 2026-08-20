import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import GoogleMap from "@/components/GoogleMap";

export default async function MeetupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <WireframeLayout justify="between" className="p-6 flex flex-col justify-between">
      <div className="flex flex-col gap-6">
        {/* Title / Time */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-black">오후 3시 30분</span>
          <h1 className="text-xl font-bold text-black">도란마트 장보러 가요</h1>
        </div>

        {/* Info Grid */}
        <div className="flex flex-col border-y border-gray-200 py-3 text-sm gap-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">만드신 분</span>
            <span className="font-medium text-black">봄날의햇살 님</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">걸리는 시간</span>
            <span className="font-medium text-black">1시간 이상</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">모임인원</span>
            <span className="font-medium text-black">2 / 3명</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">거리</span>
            <span className="font-medium text-black">걸어서 8분</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">만나는 곳</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-black">도란마트 정문 앞</span>
              <span className="text-xs text-gray-500 flex items-center">
                길찾기 &gt;
              </span>
            </div>
          </div>
        </div>

        {/* Map placeholder */}
        {/* ponytail: 나중에 Geocoding API로 교체 */}
        <GoogleMap lat={37.38} lng={127.12} height="h-[149px]" className="rounded" />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-4 pb-4">
        <Link
          href={`/meetup/${id}/complete`}
          className="w-full h-[60px] bg-black text-white flex items-center justify-center rounded text-base font-medium"
        >
          참여하기
        </Link>
        <Link
          href="/home"
          className="w-full h-[60px] bg-white text-black border border-black flex items-center justify-center rounded text-base font-medium"
        >
          다른 동행 보기
        </Link>
      </div>
    </WireframeLayout>
  );
}
