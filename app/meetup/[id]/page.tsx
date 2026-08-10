import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import HeaderBack from "@/components/HeaderBack";
import PlaceholderBox from "@/components/PlaceholderBox";

export default async function MeetupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <WireframeLayout>
      <HeaderBack backHref="/feed" />

      <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
        <h1 className="text-xl font-bold text-black">{`오일장 구경 ${id ? '' : ''}`}</h1>

        <div className="border-t border-b border-gray-200 divide-y divide-gray-200">
          <div className="py-3 flex justify-between items-center text-sm">
            <span className="text-gray-500">만드신 분</span>
            <span className="font-medium text-black">봄날의햇살 님</span>
          </div>
          <div className="py-3 flex justify-between items-center text-sm">
            <span className="text-gray-500">시간</span>
            <span className="font-medium text-black">오늘 오후 3시</span>
          </div>
          <div className="py-3 flex justify-between items-center text-sm">
            <span className="text-gray-500">걸리는 시간</span>
            <span className="font-medium text-black">1시간 이내</span>
          </div>
          <div className="py-3 flex justify-between items-center text-sm">
            <span className="text-gray-500">거리</span>
            <span className="font-medium text-black">걸어서 8분</span>
          </div>
          <div className="py-3 flex justify-between items-center text-sm">
            <span className="text-gray-500">모임인원</span>
            <span className="font-medium text-black">2 / 3명</span>
          </div>
          <div className="py-3 flex justify-between items-center text-sm">
            <span className="text-gray-500">만나는 곳</span>
            <span className="font-medium text-black">신사시장 정문</span>
          </div>
        </div>

        <PlaceholderBox height="h-[183px]" className="rounded">
          지도 / 위치 이미지
        </PlaceholderBox>
      </div>

      <div className="p-4 border-t border-gray-200">
        <Link
          href={`/meetup/${id}/complete`}
          className="w-full h-[60px] bg-black text-white flex items-center justify-center rounded text-base font-medium"
        >
          참여하기
        </Link>
      </div>
    </WireframeLayout>
  );
}
