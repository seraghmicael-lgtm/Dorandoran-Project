import Link from "next/link";

// UI디자인 캔버스의 ds_step_footer — 진입 화면들의 하단 고정 버튼 영역.
// 버튼 하나면 96px, 둘이면 164px (좌우 여백 20 · 버튼 320×54 · 사이 12).
export type FooterTone = "brand" | "kakao" | "ghost";

export interface FooterAction {
  label: string;
  href?: string;
  tone?: FooterTone;
}

const TONE: Record<FooterTone, string> = {
  // 브랜드 초록 — 이 흐름의 기본 행동
  brand: "bg-[#32952D] text-white",
  // 카카오 노랑 — 카카오 로그인에만
  kakao: "bg-[#F3D74F] text-black",
  // 흰 바탕 + 얇은 테두리 — 되돌아가기·건너뛰기
  ghost: "bg-white text-black border border-gray-300",
};

const BASE =
  "w-full h-[54px] rounded-lg flex items-center justify-center text-[17px] font-bold";

/** 버튼 하나를 링크 또는 버튼으로 — href 가 없으면 children 쪽에서 직접 다룬다 */
export function FooterButton({
  label,
  href,
  tone = "brand",
}: FooterAction) {
  const cls = `${BASE} ${TONE[tone]}`;
  return href ? (
    <Link href={href} className={cls}>
      {label}
    </Link>
  ) : (
    <span className={cls}>{label}</span>
  );
}

export default function StepFooter({
  primary,
  secondary,
  children,
}: {
  primary?: FooterAction;
  secondary?: FooterAction;
  /** 상태가 필요한 화면(클라이언트 컴포넌트)은 버튼을 직접 넣는다 */
  children?: React.ReactNode;
}) {
  return (
    <div className="px-5 pt-5 pb-6 flex flex-col gap-3">
      {children}
      {primary && <FooterButton {...primary} tone={primary.tone ?? "brand"} />}
      {secondary && <FooterButton {...secondary} tone={secondary.tone ?? "ghost"} />}
    </div>
  );
}
