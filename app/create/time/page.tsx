import WireframeLayout from "@/components/WireframeLayout";
import CreateStepHeader from "@/components/CreateStepHeader";
import MemoryBubbles from "@/components/MemoryBubbles";
import { meetupTimeOptions, seoulNow } from "@/lib/koreanTime";
import TimeOptions from "./TimeOptions";

// 와이어프레임_v02 02_몇 시에 만날까요
// 선택지는 고정 목록이 아니라 **지금 시각 기준**으로 만든다(meetupTimeOptions 주석 참조).
// 요청마다 새로 계산해야 하므로 정적 프리렌더를 끈다.
export const dynamic = "force-dynamic";

export default function CreateTimePage() {
  const options = meetupTimeOptions(seoulNow());

  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      <CreateStepHeader step={2} backHref="/create/activity" />

      <div className="px-[18px] py-[22px] flex flex-col">
        <MemoryBubbles />
        <h1 className="text-[22px] font-bold text-black">몇 시에 만날까요?</h1>
        <div className="h-5" />

        <TimeOptions options={options} />
      </div>
    </WireframeLayout>
  );
}
