import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";

export default function StartPage() {
  return (
    <WireframeLayout className="p-6 flex flex-col justify-between">
      <div className="flex-1 flex flex-col justify-center gap-4 py-12">
        <h1 className="text-xl font-bold text-black leading-tight">
          이웃을 만나려면 로그인이 필요해요
        </h1>
      </div>

      <div className="pb-8">
        <Link
          href="/login/kakao?next=/start/welcome"
          className="w-full h-[51px] bg-black text-white flex items-center justify-center rounded text-base font-medium"
        >
          카톡 로그인
        </Link>
      </div>
    </WireframeLayout>
  );
}
