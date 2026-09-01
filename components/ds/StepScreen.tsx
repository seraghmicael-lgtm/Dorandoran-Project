import WireframeLayout from "@/components/WireframeLayout";

// UI디자인 캔버스 ON 그룹의 공통 뼈대: 좌측 정렬 큰 제목 → 회색 부제 → 그림 → 하단 버튼.
// 제목과 부제는 디자인에 줄바꿈이 박혀 있어 문자열의 \n 을 그대로 살린다.
export default function StepScreen({
  title,
  subtitle,
  align = "start",
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  /** 환영 화면처럼 가운데 정렬인 경우 */
  align?: "start" | "center";
  /** 그림·지도 등 제목 아래 들어가는 것 */
  children?: React.ReactNode;
  footer: React.ReactNode;
}) {
  const centered = align === "center";
  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      <div
        className={`flex-1 px-5 pt-12 flex flex-col ${
          centered ? "items-center justify-center text-center" : "items-stretch"
        }`}
      >
        {centered && children}
        <h1 className="text-[26px] font-bold text-black leading-[1.35] whitespace-pre-line">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-[15px] text-[#999999] leading-[1.6] whitespace-pre-line">
            {subtitle}
          </p>
        )}
        {!centered && children}
      </div>
      {footer}
    </WireframeLayout>
  );
}
