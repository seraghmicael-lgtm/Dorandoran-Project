import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";

export default function CreatePage() {
  return (
    <WireframeLayout className="p-6 flex flex-col" justify="center" items="center">
      <div className="w-full max-w-[285px] flex flex-col gap-6 items-center">
        <p className="text-center text-sm font-medium text-black">
          이웃을 만나려면 로그인이 필요해요
        </p>

        <div className="w-full flex flex-col gap-3">
          <Link
            href="/login/kakao?next=/create/welcome"
            className="w-full h-[57px] bg-black text-white flex items-center justify-center rounded text-base font-medium"
          >
            카톡 로그인
          </Link>
          <Link
            href="/create/step-1"
            className="w-full h-[57px] bg-white text-black border border-black flex items-center justify-center rounded text-base font-medium"
          >
            휴대폰 번호로 시작하기
          </Link>
        </div>
      </div>
    </WireframeLayout>
  );
}
