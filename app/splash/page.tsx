import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";

export default function SplashPage() {
  return (
    <WireframeLayout className="p-6 flex flex-col justify-between">
      <div className="flex-1 flex flex-col justify-center gap-4 py-12">
        <h1 className="text-2xl font-bold text-black leading-tight">
          오늘 같이할 사람 찾기
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          장 보러, 산책하러, 커피 한 잔 우리 동네에서 한두 시간
        </p>
      </div>

      <div className="flex flex-col gap-3 pb-8">
        <Link
          href="/location-permission"
          className="w-full h-[60px] bg-black text-white flex items-center justify-center rounded text-base font-medium"
        >
          동네 인증하고 시작하기
        </Link>
      </div>
    </WireframeLayout>
  );
}
