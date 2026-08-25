import WireframeLayout from "@/components/WireframeLayout";
import CreateStepHeader from "@/components/CreateStepHeader";
import MemoryBubbles from "@/components/MemoryBubbles";
import { meetupTimeOptions, seoulNow } from "@/lib/koreanTime";
import TimePicker from "./TimePicker";

// 와이어프레임_v02 02_몇 시에 만날까요
// 정해진 카드 몇 개가 아니라 아무 시각이나 고를 수 있게 시·분을 굴려서 고른다.
// 처음 놓일 자리는 지금 시각 기준으로 잡는다(meetupTimeOptions 주석 참조) —
// 요청마다 새로 계산해야 하므로 정적 프리렌더를 끈다.
export const dynamic = "force-dynamic";

export default function CreateTimePage() {
  const options = meetupTimeOptions(seoulNow());

  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      <CreateStepHeader step={2} backHref="/home" />

      <div className="px-[18px] py-[22px] flex flex-col">
        <MemoryBubbles />
        <h1 className="text-[22px] font-bold text-black">몇 시에 만날까요?</h1>
        <div className="h-5" />

        <TimePicker defaultTime={options[0]} suggestions={options} />
      </div>
    </WireframeLayout>
  );
}
