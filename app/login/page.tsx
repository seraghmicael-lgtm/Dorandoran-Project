import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";

export default function LoginPage() {
  return (
    <WireframeLayout className="p-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-[285px] flex flex-col gap-4">
        <Link
          href="/feed"
          className="w-full h-[57px] bg-white text-black border border-black flex items-center justify-center rounded text-base font-medium"
        >
          그냥 둘러보기
        </Link>
        <Link
          href="/login/kakao"
          className="w-full h-[57px] bg-black text-white flex items-center justify-center rounded text-base font-medium"
        >
          카톡 로그인
        </Link>
        <Link
          href="/create/welcome"
          className="w-full h-[57px] bg-white text-black border border-gray-300 flex items-center justify-center rounded text-base font-medium"
        >
          휴대폰 번호로 시작하기
        </Link>
      </div>
    </WireframeLayout>
  );
}
