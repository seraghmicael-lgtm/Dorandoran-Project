import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import PlaceholderBox from "@/components/PlaceholderBox";

export default function WelcomePage() {
  return (
    <WireframeLayout className="p-6 flex flex-col justify-between items-center">
      <div className="flex-1 flex flex-col justify-center items-center gap-6 py-12 text-center w-full">
        <PlaceholderBox
          width="w-[117px]"
          height="h-[117px]"
          className="rounded-full"
        >
          캐릭터
        </PlaceholderBox>
        <h1 className="text-xl font-bold text-black">
          즐거운다람쥐님 환영합니다
        </h1>
      </div>

      <div className="w-full pb-8">
        <Link
          href="/create/speak"
          className="w-full h-[50px] bg-black text-white flex items-center justify-center rounded text-base font-medium"
        >
          확인
        </Link>
      </div>
    </WireframeLayout>
  );
}
