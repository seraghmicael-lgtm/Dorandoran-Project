import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import PlaceholderBox from "@/components/PlaceholderBox";

export default function WelcomePage() {
  return (
    <WireframeLayout className="p-6 flex flex-col justify-between">
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-12">
        <PlaceholderBox width="w-[130px]" height="h-[130px]" className="rounded-full">
          <span className="text-xs text-gray-500">캐릭터 이미지</span>
        </PlaceholderBox>
        <h1 className="text-xl font-bold text-black text-center">
          즐거운다람쥐님 환영합니다
        </h1>
      </div>

      <div className="pb-8">
        <Link
          href="/start/choose"
          className="w-full h-[50px] bg-black text-white flex items-center justify-center rounded text-base font-medium"
        >
          확인
        </Link>
      </div>
    </WireframeLayout>
  );
}
