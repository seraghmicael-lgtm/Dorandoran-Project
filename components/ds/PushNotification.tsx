import Image from "next/image";

// UI디자인 push(1237:5916) — 드롭다운 알림. 화면은 그대로 두고 위에서 살짝 겹쳐 보여준다.
export default function PushNotification({
  headline,
  sub,
}: {
  headline: string;
  sub: string;
}) {
  return (
    <div
      className="absolute left-[10.5px] top-5 w-[340px] rounded-[20px] bg-white/80 backdrop-blur-[2px] shadow-[0_1px_6px_rgba(0,0,0,0.28)] px-3.5 py-4 flex gap-3 items-start"
      role="status"
    >
      <Image src="/illust/symbol.svg" alt="" width={42} height={42} className="shrink-0" />
      <div className="flex flex-col gap-0.5 w-[215px]">
        <p className="text-[10px] font-medium tracking-[-0.1px] text-black">오늘 마실</p>
        <p className="text-[14px] font-bold text-black leading-[1.4]">{headline}</p>
        <p className="text-[12px] text-black leading-[1.25]">{sub}</p>
      </div>
      <Image
        src="/illust/chevron-up.svg"
        alt=""
        width={24}
        height={24}
        className="absolute right-3.5 top-[11px]"
      />
    </div>
  );
}
