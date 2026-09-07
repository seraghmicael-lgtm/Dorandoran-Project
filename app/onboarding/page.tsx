import WireframeLayout from "@/components/WireframeLayout";
import StepFooter from "@/components/ds/StepFooter";
import BrandMark, { BrandWordmark } from "@/components/ds/BrandMark";

// UI디자인 on-01 (1083:3746) — 스플래시 다음 화면.
// 새 스플래시(1235:8623)가 순수 브랜드 화면으로 바뀌면서, 문구+시작 버튼은 이 화면으로 옮겨왔다.
export default function OnboardingPage() {
  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      <div className="flex-1 px-5 flex flex-col items-center justify-center text-center gap-6">
        <BrandWordmark width={140} />
        <BrandMark size={100} />
        <div className="flex flex-col gap-3">
          <h1 className="text-[24px] font-bold text-black">오늘 같이할 사람 찾기</h1>
          <p className="text-[15px] text-[#999999] leading-[1.6] whitespace-pre-line">
            {"장 보러, 산책하러, 커피 한 잔\n우리 동네에서 한두 시간"}
          </p>
        </div>
      </div>

      <StepFooter primary={{ label: "동네 인증하고 시작하기", href: "/location-permission" }} />
    </WireframeLayout>
  );
}
