import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";

export default function CancelMeetupPage() {
  return (
    <WireframeLayout bottomNav="none" className="p-6 flex flex-col justify-between">
      <div className="flex-1 flex flex-col justify-center gap-4 py-12">
        <h1 className="text-xl font-bold text-black leading-tight">
          못 가시는군요
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          다른 분들께는 &quot;한 분이 못 오시게 됐어요&quot;만 전해요.
        </p>
      </div>

      <div className="flex flex-col gap-3 pb-8">
        <Link
          href="/my-meetups/cancel/complete"
          className="w-full h-[60px] bg-black text-white flex items-center justify-center rounded text-base font-medium"
        >
          못 간다고 알리기
        </Link>
        <Link
          href="/my-meetups"
          className="w-full h-[60px] bg-white text-black border border-black flex items-center justify-center rounded text-base font-medium"
        >
          그냥 갈게요
        </Link>
      </div>
    </WireframeLayout>
  );
}
