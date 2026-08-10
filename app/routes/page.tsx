import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";

export default function RouteIndexPage() {
  const routes = [
    { href: "/splash", label: "/splash (스플래시_진입)" },
    { href: "/location-permission", label: "/location-permission (위치_권한)" },
    { href: "/feed", label: "/feed (홈_피드_A)" },
    { href: "/feed-alt", label: "/feed-alt (홈_피드_B)" },
    { href: "/login", label: "/login (로그인)" },
    { href: "/login/kakao", label: "/login/kakao (카톡_3초_로그인)" },
    { href: "/meetup/1", label: "/meetup/[id] (상세_확인)" },
    { href: "/meetup/1/complete", label: "/meetup/[id]/complete (신청_완료)" },
    { href: "/my-meetups", label: "/my-meetups (내_동행)" },
    { href: "/my-meetups/cancel", label: "/my-meetups/cancel (참여_취소)" },
    { href: "/my-meetups/cancel/complete", label: "/my-meetups/cancel/complete (처리_완료)" },
    { href: "/my-meetups/after", label: "/my-meetups/after (참여_후)" },
    { href: "/my-meetups/after/complete", label: "/my-meetups/after/complete (전달_완료)" },
    { href: "/location", label: "/location (위치정보)" },
    { href: "/location/denied", label: "/location/denied (위치정보_허용안함)" },
    { href: "/home", label: "/home (홈_A)" },
    { href: "/home-alt", label: "/home-alt (홈_B)" },
    { href: "/home/notifications", label: "/home/notifications (홈_알림)" },
    { href: "/create", label: "/create (홈_만들기)" },
    { href: "/create/welcome", label: "/create/welcome (홈_만들기_로그인_웰컴)" },
    { href: "/create/step-1", label: "/create/step-1 (만들기_1)" },
    { href: "/create/step-2", label: "/create/step-2 (만들기_2)" },
    { href: "/create/step-3", label: "/create/step-3 (만들기_3)" },
    { href: "/create/step-4", label: "/create/step-4 (만들기_4)" },
  ];

  return (
    <WireframeLayout className="p-4">
      <div className="flex-1 flex flex-col gap-4 py-4 overflow-y-auto">
        <h1 className="text-lg font-bold text-black border-b border-gray-200 pb-2">
          도란도란 와이어프레임 라우트 목록
        </h1>
        <div className="flex flex-col gap-1.5">
          {routes.map((r, i) => (
            <Link
              key={r.href}
              href={r.href}
              className="p-2 border border-gray-200 rounded text-xs hover:border-black font-medium text-black bg-white flex items-center justify-between"
            >
              <span>{`${i + 1}. ${r.label}`}</span>
              <span className="text-gray-400">→</span>
            </Link>
          ))}
        </div>
      </div>
    </WireframeLayout>
  );
}
