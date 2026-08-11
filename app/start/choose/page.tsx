import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";

export default function ChoosePage() {
  return (
    <WireframeLayout className="p-6 flex flex-col justify-center">
      <div className="flex flex-col gap-4 w-full">
        <Link
          href="/create/step-1"
          className="w-full h-[60px] bg-black text-white flex items-center justify-center rounded text-lg font-bold"
        >
          동행 만들기
        </Link>
        <Link
          href="/location-permission"
          className="w-full h-[60px] bg-white text-black border border-black flex items-center justify-center rounded text-lg font-bold"
        >
          동행 참여하기
        </Link>
      </div>
    </WireframeLayout>
  );
}
