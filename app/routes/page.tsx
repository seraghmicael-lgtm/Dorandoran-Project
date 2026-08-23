import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";

export default function RouteIndexPage() {
  const routes = [
    { href: "/splash", label: "/splash (01_스플래시 & 진입)" },
    { href: "/location-permission", label: "/location-permission (02_위치 권한)" },
    { href: "/home", label: "/home (03_홈)" },
    { href: "/signup", label: "/signup (04_회원가입)" },
    { href: "/notification-permission", label: "/notification-permission (05_알림허용)" },
    { href: "/welcome", label: "/welcome (06_활동명 부여 환영)" },
    { href: "/meetup/1", label: "/meetup/[id] (01_상세 확인)" },
    { href: "/meetup/1/complete", label: "/meetup/[id]/complete (참여 완료)" },
    { href: "/my-meetups", label: "/my-meetups (01_내 동행 확인(참여))" },
    { href: "/my-meetups/created", label: "/my-meetups/created (02_내 동행 확인(개설))" },
    { href: "/my-meetups/cancel", label: "/my-meetups/cancel (참여 취소)" },
    { href: "/my-meetups/cancel/complete", label: "/my-meetups/cancel/complete (처리 완료)" },
    { href: "/my-meetups/expired", label: "/my-meetups/expired (07_불발 알림)" },
    { href: "/create/activity", label: "/create/activity (v02 01_뭐 하실래요)" },
    { href: "/create/time", label: "/create/time (v02 02_몇 시에 만날까요)" },
    
    { href: "/create/listening", label: "/create/listening (음성녹음v2 · GPT 대화)" },
    { href: "/create/duration", label: "/create/duration (v02 03_얼마나 걸릴까요)" },
    { href: "/create/place", label: "/create/place (v02 04_어디서 만날까요)" },
    { href: "/create/people", label: "/create/people (05_몇 분이 함께할까요)" },
    { href: "/create/posted", label: "/create/posted (06_올렸어요)" },
    { href: "/create/write", label: "/create/write (01_타이핑 · 손으로 쓰기)" },
  ];

  return (
    <WireframeLayout className="p-4" bottomNav="none">
      <div className="flex-1 flex flex-col gap-4 py-4 overflow-y-auto">
        <h1 className="text-lg font-bold text-black border-b border-gray-200 pb-2">
          도란도란 와이어프레임_v01 라우트 목록
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
