import StepScreen from "@/components/ds/StepScreen";
import StepFooter from "@/components/ds/StepFooter";
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
      {/* 종 + 확인 표시 (on-04 일러스트) */}
      <div className="mt-10 flex items-center justify-center">
        <svg width="188" height="159" viewBox="0 0 188 159" role="img" aria-label="알림">
          <path
            d="M84 22c0-9 7-16 16-16s16 7 16 16c22 7 33 24 33 46v27l12 18H39l12-18V68c0-22 11-39 33-46Z"
            fill="#F5C93B"
          />
          <path d="M86 122h28c0 8-6 14-14 14s-14-6-14-14Z" fill="#E8B71F" />
          <circle cx="150" cy="118" r="30" fill="#3EA832" />
          <path
            d="M137 118l9 9 17-17"
            stroke="#fff"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    </StepScreen>
  );
}
