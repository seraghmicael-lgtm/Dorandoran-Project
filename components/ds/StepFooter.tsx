import Link from "next/link";

// UI디자인 캔버스의 ds_step_footer(1100:8473) — 진입 화면들의 하단 고정 버튼 영역.
// 좌우 16 · 위 40 · 아래 20 · 버튼 높이 48 · 사이 12 → 버튼 둘이면 프레임 높이 168.
export type FooterTone = "brand" | "kakao" | "ghost";

export interface FooterAction {
  label: string;
  href?: string;
  tone?: FooterTone;
}

// 글자 크기·굵기도 ds_button 변형마다 다르다 — primary 는 body-m-500(18),
// tertiary 는 button-m-700(16).
const TONE: Record<FooterTone, string> = {
  // 브랜드 초록 — 이 흐름의 기본 행동
  brand: "bg-[#32952D] text-white text-[18px] font-medium leading-[1.5]",
  // 카카오 노랑 — 카카오 로그인에만
  kakao: "bg-[#F3D74F] text-[#171717] text-[18px] font-medium leading-[1.5]",
  // 흰 바탕 + 얇은 테두리 — 되돌아가기·건너뛰기
  ghost:
    "bg-white text-[#5B5B5B] border border-[#E5E5E5] text-[16px] font-bold leading-[1.4]",
};

const BASE = "w-full h-12 rounded-xl flex items-center justify-center";

/** 상태가 필요해 버튼을 직접 그리는 화면도 같은 ds_button 모양을 쓰도록 */
export function footerButtonClass(tone: FooterTone = "brand") {
  return `${BASE} ${TONE[tone]}`;
}

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
    <div className="px-4 pt-10 pb-5 flex flex-col gap-3">
      {children}
      {primary && <FooterButton {...primary} tone={primary.tone ?? "brand"} />}
      {secondary && <FooterButton {...secondary} tone={secondary.tone ?? "ghost"} />}
    </div>
  );
}
