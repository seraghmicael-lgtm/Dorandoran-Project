import StepScreen from "@/components/ds/StepScreen";
import StepFooter from "@/components/ds/StepFooter";
import { Illust } from "@/components/ds/BrandMark";
import { safeInternalPath } from "@/lib/safePath";

// UI디자인 on-04 (1083:4166) — 알림 허용
export default async function NotificationPermissionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const nextHref = safeInternalPath(next, "/welcome");

  return (
    <StepScreen
      title={"나가실 때\n알려드릴게요"}
      subtitle={"만나기 30분 전에 알려드려요\n알림은 언제든 끄실 수 있어요"}
      footer={
        <StepFooter
          primary={{ label: "알림 허용", href: nextHref }}
          secondary={{ label: "이전", href: "/signup" }}
        />
      }
    >
      {/* illust(1183:2197) — 프레임 위에서 382px, 가로 가운데. on-02 와 제목·부제
          줄 수가 같아 띄우는 값도 103px 로 같다. */}
      <div className="mt-[103px] flex justify-center">
        <Illust name="bell" box={160} />
      </div>
    </StepScreen>
  );
}
