import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import PlaceholderBox from "@/components/PlaceholderBox";
import { getCurrentUser } from "@/lib/session";

export default async function WelcomePage() {
  const user = await getCurrentUser();
  const nickname = user?.nickname ?? "즐거운다람쥐";

  return (
    <WireframeLayout bottomNav="none" className="p-6 flex flex-col justify-between items-center">
      <div className="flex-1 flex flex-col justify-center items-center gap-6 py-12 text-center w-full">
        <PlaceholderBox
          width="w-[117px]"
          height="h-[117px]"
          className="rounded-full"
        />
        <h1 className="text-xl font-bold text-black">
          {nickname}님 환영합니다
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
