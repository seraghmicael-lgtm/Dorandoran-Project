import WireframeLayout from "@/components/WireframeLayout";

// UI디자인 캔버스 ON 그룹의 공통 뼈대: 좌측 정렬 큰 제목 → 회색 부제 → 그림 → 하단 버튼.
// title 프레임은 x=20 · w=320 에, 세로는 좌측 정렬 화면이면 y=137,
// 가운데 정렬(on-05)이면 그림이 먼저 와서 y=233 부터 시작한다.
// 글자는 app/title-lg-700(28·1.3·-1%)과 app/body-m-500(18·1.5).
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
        className={`flex-1 px-5 flex flex-col ${
          centered ? "pt-[233px] items-center text-center" : "pt-[137px] items-stretch"
        }`}
      >
        {centered && children}
        <h1
          className={`text-[28px] font-bold leading-[1.3] tracking-[-0.28px] whitespace-pre-line ${
            centered ? "text-[#171717]" : "text-black"
          }`}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-[18px] font-medium text-[#777777] leading-[1.5] whitespace-pre-line">
            {subtitle}
          </p>
        )}
        {!centered && children}
      </div>
      {footer}
    </WireframeLayout>
  );
}
