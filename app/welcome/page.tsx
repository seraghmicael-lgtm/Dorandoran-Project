import StepScreen from "@/components/ds/StepScreen";
import StepFooter from "@/components/ds/StepFooter";
import { Illust } from "@/components/ds/BrandMark";
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
      <div className="mb-8">
        <Illust name="welcome" size={160} />
      </div>
    </StepScreen>
  );
}
