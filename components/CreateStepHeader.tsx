import Link from "next/link";

// 와이어프레임_v02 만들기 플로우 공통 navbar: ← / 동행 만들기 / N / 6
// `right`가 있으면 우측 표시를 "{step} / {total}" 대신 그 문자열로 보여준다.
export default function CreateStepHeader({
  step,
  backHref,
  title = "동행 만들기",
  total = 6,
  right,
}: {
  step: number;
  backHref: string;
  title?: string;
  total?: number;
  right?: string;
}) {
  return (
    <header className="h-[75px] px-5 flex items-center justify-between border-b border-gray-200 bg-white">
      <Link href={backHref} className="text-2xl font-bold text-black w-[60px]">
        ←
      </Link>
      <span className="text-xl font-bold text-black text-center">{title}</span>
      <span className="text-[15px] text-gray-500 w-[60px] text-right">
        {right ?? `${step} / ${total}`}
      </span>
    </header>
  );
}
