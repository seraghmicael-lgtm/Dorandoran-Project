import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import PlaceholderBox from "@/components/PlaceholderBox";

export default function CreateWelcomePage() {
  return (
    <WireframeLayout className="p-6 flex flex-col text-center" items="center">
      <div className="flex-1 flex flex-col justify-center items-center gap-6 py-12">
        <h1 className="text-xl font-bold text-black">다람쥐님 환영합니다</h1>
        <PlaceholderBox width="w-[166px]" height="h-[166px]" className="rounded">
          환영 이미지
        </PlaceholderBox>
      </div>

      <div className="w-full pb-8">
        <Link
          href="/create/step-1"
          className="w-full h-[57px] bg-black text-white flex items-center justify-center rounded text-base font-medium"
        >
          확인
        </Link>
      </div>
    </WireframeLayout>
  );
}
