import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";

export default function RouteIndexPage() {
  const routes = [
    { href: "/splash", label: "/splash (스플래시 & 진입)" },
    { href: "/location-permission", label: "/location-permission (위치 권한)" },
    { href: "/location/manual", label: "/location/manual (03_내 위치 직접 선택)" },
    { href: "/home", label: "/home (04_홈 둘러보기)" },
    { href: "/start", label: "/start (05_로그인 유도)" },
    { href: "/login/kakao", label: "/login/kakao (카톡 3초 로그인)" },
    { href: "/start/welcome", label: "/start/welcome (06_활동명 부여 환영)" },
    { href: "/start/choose", label: "/start/choose (선택: 만들기 / 참여하기)" },
    { href: "/create/step-1", label: "/create/step-1 (07_동행 만들기 1/2)" },
    { href: "/create/step-2", label: "/create/step-2 (08_동행 만들기 2/2)" },
    { href: "/create/step-4", label: "/create/step-4 (09_모임 장소 선택)" },
    { href: "/meetup/1", label: "/meetup/[id] (동행 상세 참여하기)" },
    { href: "/meetup/1/complete", label: "/meetup/[id]/complete (신청 완료)" },
    { href: "/my-meetups", label: "/my-meetups (내 동행)" },
    { href: "/my-meetups/cancel", label: "/my-meetups/cancel (참여 취소)" },
    { href: "/my-meetups/cancel/complete", label: "/my-meetups/cancel/complete (처리 완료)" },
    { href: "/my-meetups/after", label: "/my-meetups/after (참여 후)" },
    { href: "/my-meetups/after/complete", label: "/my-meetups/after/complete (전달 완료)" },
    { href: "/community", label: "/community (동네소식)" },
    { href: "/meetup/1/map", label: "/meetup/[id]/map (지도 전체화면)" },
  ];

  return (
    <WireframeLayout className="p-4">
      <div className="flex-1 flex flex-col gap-4 py-4 overflow-y-auto">
        <h1 className="text-lg font-bold text-black border-b border-gray-200 pb-2">
          도란도란 v2 와이어프레임 라우트 목록
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
