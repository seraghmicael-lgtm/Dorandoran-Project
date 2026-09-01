import StepScreen from "@/components/ds/StepScreen";
import StepFooter from "@/components/ds/StepFooter";
import BrandMark from "@/components/ds/BrandMark";
import { getCurrentUser } from "@/lib/session";

// UI디자인 on-05 (1084:971) — 환영
export default async function WelcomePage() {
  const user = await getCurrentUser();
  const nickname = user?.nickname ?? "즐거운다람쥐";

  return (
    <StepScreen
      align="center"
      title={`${nickname}님\n환영합니다`}
      subtitle={"이름은 내 정보에서\n변경이 가능해요."}
      footer={<StepFooter primary={{ label: "확인", href: "/home" }} />}
    >
      {/* 로고 마스코트 + 축하 장식 (on-05 일러스트) */}
      <div className="relative mb-8">
        <BrandMark size={120} />
        <svg
          className="pointer-events-none absolute -inset-8"
          viewBox="0 0 184 184"
          aria-hidden="true"
        >
          <path d="M92 14l14-14 8 16-16 6z" fill="#F5C93B" />
          <rect x="16" y="52" width="18" height="6" rx="3" fill="#F5C93B" transform="rotate(-20 16 52)" />
          <rect x="150" y="60" width="18" height="6" rx="3" fill="#7ED957" transform="rotate(20 150 60)" />
          <rect x="26" y="40" width="16" height="6" rx="3" fill="#5AA9F5" transform="rotate(35 26 40)" />
          <rect x="146" y="36" width="16" height="6" rx="3" fill="#F26B5B" transform="rotate(-35 146 36)" />
          <rect x="20" y="118" width="18" height="6" rx="3" fill="#F26B5B" transform="rotate(25 20 118)" />
          <rect x="150" y="122" width="18" height="6" rx="3" fill="#5AA9F5" transform="rotate(-25 150 122)" />
        </svg>
      </div>
    </StepScreen>
  );
}
