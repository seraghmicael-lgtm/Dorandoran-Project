import Image from "next/image";

// UI디자인 ds_card_banner(1083:3741) — 목록 사이에 통째로 끼는 동네광고 자리.
// 카드와 달리 좌우 여백 없이 화면 끝까지 가고, 모서리도 둥글지 않다.
// 지금은 붙일 광고 데이터가 없어 디자인의 예시 그대로 한 장만 보여준다.
export default function AdBanner() {
  return (
    <div className="relative w-full overflow-hidden bg-chip p-6">
      <div className="flex w-[224px] flex-col gap-2">
        <span className="text-[12px] font-medium leading-none text-ad-label">광고 • 동네광고</span>
        <span className="text-[20px] font-bold leading-[1.3] text-ink">아픈 허리 잘 낫는 병원</span>
        <span className="text-[14px] font-medium leading-none text-faint">우리동네병원 정형외과</span>
      </div>
      <Image
        src="/illust/ad-banner.png"
        alt=""
        aria-hidden="true"
        width={84}
        height={76}
        className="absolute right-5 top-1/2 h-[76px] w-[84px] -translate-y-1/2 rounded-lg object-cover"
      />
    </div>
  );
}
