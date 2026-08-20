import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import HeaderBack from "@/components/HeaderBack";

export default function CreateListeningPage() {
  return (
    <WireframeLayout justify="start" className="flex flex-col">
      <HeaderBack title="듣고 있어요" backHref="/create/speak" />

      <div className="p-4 flex flex-col items-center gap-6 text-center">
        {/* Waveform graphic placeholder */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="w-[126px] h-[126px] rounded-full border border-gray-300 bg-gray-50 flex items-center justify-center gap-1.5">
            <div className="w-1.5 h-6 bg-black rounded" />
            <div className="w-1.5 h-10 bg-black rounded" />
            <div className="w-1.5 h-14 bg-black rounded" />
            <div className="w-1.5 h-8 bg-black rounded" />
            <div className="w-1.5 h-12 bg-black rounded" />
            <div className="w-1.5 h-5 bg-black rounded" />
          </div>
          <span className="text-base font-bold text-black">듣고 있어요</span>
        </div>

        {/* Realtime voice transcription box */}
        <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col gap-2 text-left">
          <span className="text-xs text-gray-500 font-medium">
            말씀하신 대로 적고 있어요
          </span>
          <p className="text-sm font-bold text-black">
            세 시에 오일장 구경 같이
          </p>
          <p className="text-sm text-gray-400">…</p>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3 pt-2">
          <Link
            href="/create/confirm"
            className="w-full h-[53px] bg-black text-white flex items-center justify-center rounded text-sm font-medium"
          >
            다 말했어요
          </Link>

          <Link
            href="/create/write"
            className="w-full h-[50px] border border-gray-300 bg-white text-black flex items-center justify-center rounded text-sm font-medium"
          >
            손으로 쓸래요
          </Link>
        </div>

        <p className="text-xs text-gray-500 pt-1">
          소리 내기 어려운 곳이면 손으로 쓰셔도 돼요
        </p>
      </div>
    </WireframeLayout>
  );
}
