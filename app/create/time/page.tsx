import WireframeLayout from "@/components/WireframeLayout";
import CreateStepHeader from "@/components/CreateStepHeader";
import MemoryBubbles from "@/components/MemoryBubbles";
import { earliestToday, remainingTodayOptions, seoulNow } from "@/lib/koreanTime";
import TimePicker from "./TimePicker";

// 와이어프레임_v02 02_몇 시에 만날까요
// 시·분을 굴려서 고른다. 이 앱은 오늘만 다루므로 고를 수 있는 범위는 지금부터 자정까지 —
// 기준은 한국 시각이고 요청마다 새로 계산해야 하므로 정적 프리렌더를 끈다.
export const dynamic = "force-dynamic";

export default function CreateTimePage() {
  const floor = earliestToday(seoulNow());

  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      <CreateStepHeader step={2} backHref="/home" confirmLeave />

      <div className="px-[18px] py-[22px] flex flex-col">
        <MemoryBubbles />
        <h1 className="text-[22px] font-bold text-black">몇 시에 만날까요?</h1>
        <div className="h-5" />

        <TimePicker floor={floor} suggestions={remainingTodayOptions(floor)} />
      </div>
    </WireframeLayout>
  );
}
