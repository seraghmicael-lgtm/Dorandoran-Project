import CreateStep from "@/components/ds/CreateStep";
import { earliestToday, seoulNow } from "@/lib/koreanTime";
import TimePicker from "./TimePicker";

// UI디자인 cr-02 (1089:6474) — 동행과 몇 시에 만날까요?
// 고를 수 있는 범위는 지금부터 오늘 자정까지 — 기준은 한국 시각이고
// 요청마다 새로 계산해야 하므로 정적 프리렌더를 끈다.
export const dynamic = "force-dynamic";

export default function CreateTimePage() {
  const floor = earliestToday(seoulNow());

  return (
    <CreateStep step={2} title={"동행과 몇 시에\n만날까요?"} backHref="/create/activity" footer={null}>
      <TimePicker floor={floor} />
    </CreateStep>
  );
}
