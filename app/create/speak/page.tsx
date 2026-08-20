"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";
import HeaderBack from "@/components/HeaderBack";
import { unlockAudio } from "@/lib/voice";

export default function CreateSpeakPage() {
  const router = useRouter();

  return (
    <WireframeLayout justify="start" className="flex flex-col">
      <HeaderBack title="동행 만들기" backHref="/home" />

      <div className="p-4 flex flex-col items-center gap-6 text-center">
        <h1 className="text-xl font-bold text-black pt-2">
          무엇을 같이 하고 싶으세요?
        </h1>

        {/* Guide box */}
        <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col gap-1 text-center">
          <span className="text-xs text-gray-500 font-medium">
            이렇게 말씀하시면 돼요
          </span>
          <p className="text-sm font-bold text-black">
            “오후 세 시에 오일장 구경같이 해요”
          </p>
        </div>

        {/* Big mic / speak button — 클릭 제스처 순간에 오디오를 해금해두면
            다음 화면들의 자동 질문 낭독·침묵 감지가 차단되지 않는다 */}
        <div className="py-4 flex justify-center">
          <button
            type="button"
            onClick={() => {
              unlockAudio();
              router.push("/create/listening");
            }}
            className="w-[150px] h-[150px] rounded-full border-2 border-black bg-white flex flex-col items-center justify-center gap-2 hover:bg-gray-50 shadow-sm cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gray-300 border border-gray-400" />
            <span className="text-sm font-bold text-black">누르고 말하기</span>
          </button>
        </div>

        {/* Write fallback button */}
        <Link
          href="/create/write"
          className="w-full h-[50px] border border-gray-300 bg-white text-black flex items-center justify-center rounded text-sm font-medium"
        >
          손으로 쓸래요
        </Link>

        {/* Notice text */}
        <div className="pt-4 text-xs text-gray-500 flex flex-col gap-1">
          <p>사람이 안 모이면 조용히 사라져요.</p>
          <p>아무도 모르니 편하게 올려보세요.</p>
        </div>
      </div>
    </WireframeLayout>
  );
}
