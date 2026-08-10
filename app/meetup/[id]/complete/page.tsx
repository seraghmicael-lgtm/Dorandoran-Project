import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";

export default async function MeetupApplyCompletePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;

  return (
    <WireframeLayout className="p-6 flex flex-col justify-between">
      <div className="flex-1 flex flex-col justify-center items-center text-center gap-4 py-12">
        <h1 className="text-xl font-bold text-black">신청되었습니다</h1>
        <p className="text-sm text-gray-600 leading-relaxed max-w-[280px]">
          오늘 오후 3시 신사시장 정문에서 만나요 30분 전에 알려드릴게요
        </p>
      </div>

      <div className="pb-8">
        <Link
          href="/my-meetups"
          className="w-full h-[60px] bg-black text-white flex items-center justify-center rounded text-base font-medium"
        >
          확인
        </Link>
      </div>
    </WireframeLayout>
  );
}
