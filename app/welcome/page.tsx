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
      subtitle={"이름은 내 정보에서\n바꿀 수 있어요"}
      footer={<StepFooter primary={{ label: "확인", href: "/home" }} />}
    >
      {/* illust(1084:1940) — 프레임 위에서 233px, 167 정사각. 그림 아래 13px 을
          띄우면 글자 블록이 Figma 대로 413px 에 온다.
          ⚠️ Figma 는 이 그림만 x=100·w=167 이라 중심이 183.5 다 — 글자 블록(x=20·w=320,
          중심 180)보다 3.5px 오른쪽. 디자인 그대로 옮긴 값이니 가운데로 맞추려면 이 줄을 지운다. */}
      <div className="mb-[13px] translate-x-[3.5px]">
        <Illust name="welcome" box={167} />
      </div>
    </StepScreen>
  );
}
