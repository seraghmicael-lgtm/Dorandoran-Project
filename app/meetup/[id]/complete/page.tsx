import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import { Illust } from "@/components/ds/BrandMark";

// UI디자인 jn-04 (1084:5213) — 참여가 완료됐어요!
export default async function MeetupCompletePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      <div className="flex-1 px-5 flex flex-col items-center justify-center text-center">
        <Illust name="joined" size={160} />

        <h1 className="mt-8 text-[24px] font-bold text-black">참여가 완료됐어요!</h1>
        <p className="mt-3 text-[15px] text-muted leading-[1.6] whitespace-pre-line">
          {"참여 내역은\n내 정보에서 볼 수 있어요"}
        </p>
      </div>

      <div className="px-5 pt-5 pb-6 flex flex-col gap-2.5">
        <Link
          href="/home"
          className="w-full h-[54px] rounded-lg bg-brand text-white flex items-center justify-center text-[17px] font-bold"
        >
          다른 동행 보기
        </Link>
        <Link
          href={`/meetup/${id}`}
          className="w-full h-[54px] rounded-lg border border-gray-300 bg-white text-black flex items-center justify-center text-[17px] font-medium"
        >
          이전
        </Link>
      </div>
    </WireframeLayout>
  );
}
