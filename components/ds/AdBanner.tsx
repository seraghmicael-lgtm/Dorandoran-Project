import Image from "next/image";

// UI디자인 ds_card_banner — 홈·내 동행 목록 사이에 끼는 동네광고 자리.
// 지금은 붙일 광고 데이터가 없어 디자인의 예시 그대로 한 장만 보여준다.
export default function AdBanner() {
  return (
    <div className="rounded-2xl bg-chip px-4 py-4 flex items-center justify-between gap-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-[12px] font-bold text-[#B08D2F]">광고 · 동네광고</span>
        <span className="text-[19px] font-bold text-black">아픈 허리 잘 낫는 병원</span>
        <span className="text-[13px] text-muted">우리동네병원 정형외과</span>
      </div>
      <Image
        src="/illust/ad-hospital.png"
        alt=""
        aria-hidden="true"
        width={72}
        height={65}
        className="shrink-0"
      />
    </div>
  );
}
