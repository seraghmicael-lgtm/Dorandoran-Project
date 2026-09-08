import Image from "next/image";

// UI디자인의 로고 심볼(1083:3926) — Figma 에서 내보낸 SVG 를 그대로 쓴다.
export default function BrandMark({ size = 100 }: { size?: number }) {
  return (
    <Image
      src="/illust/symbol.svg"
      alt="오늘마실"
      width={size}
      height={size}
      priority={size >= 100}
    />
  );
}

/** 워드마크(1100:8556). 심볼과 나란히 쓰거나 단독으로 */
export function BrandWordmark({ width = 124 }: { width?: number }) {
  return (
    <Image
      src="/illust/logo.svg"
      alt="오늘마실"
      width={width}
      height={Math.round((width * 43) / 124)}
      priority
    />
  );
}

/** 화면마다 다른 큰 일러스트 — Figma 내보내기 그대로 */
export function Illust({
  name,
  size = 160,
  className,
}: {
  name: "welcome" | "shield" | "bell" | "joined" | "empty" | "map";
  size?: number;
  className?: string;
}) {
  // 원본 SVG 가 preserveAspectRatio="none" 로 내보내져 있어 비율을 안 맞추면 눌려 보인다
  const ratio =
    name === "shield" ? 159 / 137 : name === "bell" ? 159 / 188 : name === "map" ? 139.84 / 116.533 : 1;
  return (
    <Image
      src={`/illust/${name}.svg`}
      alt=""
      aria-hidden="true"
      width={size}
      height={Math.round(size * ratio)}
      className={className}
    />
  );
}
