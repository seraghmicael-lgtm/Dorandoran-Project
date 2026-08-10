import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";

export default async function KakaoLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const continueHref = next
    ? `/location-permission?next=${encodeURIComponent(next)}`
    : "/location-permission";

  return (
    <WireframeLayout className="p-6 flex flex-col justify-between">
      <div className="flex-1 flex flex-col justify-center gap-4 py-12">
        <h1 className="text-xl font-bold text-black leading-tight">
          이웃과 함께하려면 간단한 본인 확인이 필요해요
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          이름과 연락처만 확인해요. 다른 정보는 받지 않아요.
        </p>
      </div>

      <div className="flex flex-col gap-3 pb-8">
        <Link
          href={continueHref}
          className="w-full h-[60px] bg-black text-white flex items-center justify-center rounded text-base font-medium"
        >
          카카오로 3초 만에 시작하기
        </Link>
        <Link
          href="/login"
          className="w-full h-[60px] bg-white text-black border border-black flex items-center justify-center rounded text-base font-medium"
        >
          뒤로
        </Link>
      </div>
    </WireframeLayout>
  );
}
