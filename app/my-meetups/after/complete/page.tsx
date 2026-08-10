import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";

export default function AfterCompletePage() {
  return (
    <WireframeLayout className="p-6 flex flex-col justify-between">
      <div className="flex-1 flex flex-col justify-center items-center text-center gap-4 py-12">
        <h1 className="text-xl font-bold text-black">전해드렸어요</h1>
        <p className="text-sm text-gray-600 leading-relaxed max-w-[280px]">
          고양고양 님도 오늘 인사를 받으셨어요.
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
