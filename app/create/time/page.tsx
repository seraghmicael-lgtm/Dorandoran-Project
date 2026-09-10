import CreateStep from "@/components/ds/CreateStep";
import MemoryChips from "@/components/ds/MemoryChips";
import { earliestToday, seoulNow } from "@/lib/koreanTime";
import TimePicker from "./TimePicker";

// UI디자인 cr-02 (1208:9190) — 동행과 몇 시에 만날까요?
// 고를 수 있는 범위는 지금부터 오늘 자정까지 — 기준은 한국 시각이고
// 요청마다 새로 계산해야 하므로 정적 프리렌더를 끈다.
export const dynamic = "force-dynamic";

export default function CreateTimePage() {
  const floor = earliestToday(seoulNow());

  return (
    <CreateStep
      step={2}
      title={"동행과 몇 시에\n만날까요?"}
      backHref="/create/activity"
      // 줄마다 좌우 여백이 다르다 — 칩·카드는 16, 안내문은 20 이라 직접 준다
      body="bare"
      chips={false}
      footer={null}
    >
      {/* tag-list(1208:9204) — 좌우 16 · 위아래 16 */}
      <MemoryChips step={2} className="px-4 py-4 flex flex-wrap gap-1" />
      <TimePicker floor={floor} />
    </CreateStep>
  );
}
