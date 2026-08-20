import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";

export default function RouteIndexPage() {
  const routes = [
    { href: "/splash", label: "/splash (스플래시 & 진입)" },
    { href: "/location-permission", label: "/location-permission (위치 권한)" },
    { href: "/home", label: "/home (04_홈)" },
    { href: "/meetup/1", label: "/meetup/[id] (상세 확인)" },
    { href: "/meetup/1/complete", label: "/meetup/[id]/complete (신청 완료)" },
    { href: "/my-meetups", label: "/my-meetups (내 동행)" },
    { href: "/my-meetups/cancel", label: "/my-meetups/cancel (참여 취소)" },
    { href: "/my-meetups/cancel/complete", label: "/my-meetups/cancel/complete (처리 완료)" },
    { href: "/my-meetups/expired", label: "/my-meetups/expired (07_불발 알림)" },
    { href: "/signup", label: "/signup (회원가입)" },
    { href: "/notification-permission", label: "/notification-permission (알림허용)" },
    { href: "/welcome", label: "/welcome (06_활동명 부여 환영)" },
    { href: "/create/speak", label: "/create/speak (01_말하기)" },
    { href: "/create/listening", label: "/create/listening (02_듣는 중)" },
    { href: "/create/confirm", label: "/create/confirm (03_이렇게 들었어요)" },
    { href: "/create/posted", label: "/create/posted (05_올렸어요)" },
    { href: "/create/write", label: "/create/write (06_손으로 쓰기 폴백)" },
  ];

  return (
    <WireframeLayout className="p-4" bottomNav="none">
      <div className="flex-1 flex flex-col gap-4 py-4 overflow-y-auto">
        <h1 className="text-lg font-bold text-black border-b border-gray-200 pb-2">
          도란도란 v3 와이어프레임 라우트 목록 (17개)
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
