import Image from "next/image";

// UI디자인의 로고 심볼(1083:3926) — Figma 에서 내보낸 SVG 를 그대로 쓴다.
// ⚠️ next/image 를 쓰면(둘 다 <Image>) 이 심볼과 아래 워드마크를 나란히 놓았을 때
// 브라우저에 아이콘이 겹쳐 찍히는 렌더링 버그가 있다(정적 <img> 로는 재현 안 됨,
// Next 15.5.4/Turbopack 확인) — 그래서 이 둘만 next/image 대신 순수 <img> 를 쓴다.
export default function BrandMark({ size = 100 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/illust/symbol.svg" alt="오늘마실" width={size} height={size} />
  );
}

/** 워드마크(1100:8556). 심볼과 나란히 쓰거나 단독으로 */
export function BrandWordmark({ width = 124 }: { width?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/illust/logo.svg"
      alt="오늘마실"
      width={width}
      height={Math.round((width * 43) / 124)}
    />
  );
}

/** 상단 바 로고(심볼+워드마크 한 벌). Figma 내보내기 그대로 95x24 */
export function BrandHeaderLogo({ width = 95 }: { width?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/illust/header-logo.svg"
      alt="오늘마실"
      width={width}
      height={Math.round((width * 24) / 95)}
    />
  );
}

// ds 의 illust 인스턴스는 정사각 박스이고, 그림은 그 안에 원본 크기 그대로 놓인다.
// box 를 준 화면만 이 방식을 쓴다 — 아래 표에 없는 그림은 박스를 꽉 채운다.
const LEAF: Partial<Record<IllustName, [number, number]>> = {
  map: [117.04, 139.84], // illust(1187:3139) 안쪽 Frame 78
  shield: [160, 160], // illust(1237:4700) — 내보내기가 이미 160 정사각이다
  bell: [162, 160], // illust(1183:2197) — 진동선이 박스 밖으로 좌우 1px 씩 나간다
  welcome: [167, 167], // illust(1084:1940) — 이 화면만 박스가 167 이다
  empty: [156, 156], // illust(1084:1588) — 홈 빈 상태, 박스가 156 이다
};

type IllustName = "welcome" | "shield" | "bell" | "joined" | "empty" | "map";

/** 화면마다 다른 큰 일러스트 — Figma 내보내기 그대로 */
export function Illust({
  name,
  size = 160,
  box,
  className,
}: {
  name: IllustName;
  size?: number;
  /** ds illust 의 바깥 정사각 박스 한 변(px) */
  box?: number;
  className?: string;
}) {
  // 원본 SVG 가 preserveAspectRatio="none" 로 내보내져 있어 비율을 안 맞추면 눌려 보인다
  const ratio = name === "map" ? 139.84 / 116.533 : 1;

  if (box) {
    const [w, h] = LEAF[name] ?? [size, size * ratio];
    return (
      <div
        style={{ width: box, height: box }}
        className={`flex items-center justify-center shrink-0 ${className ?? ""}`}
      >
        <Image
          src={`/illust/${name}.svg`}
          alt=""
          aria-hidden="true"
          width={Math.round(w)}
          height={Math.round(h)}
          // 박스보다 넓은 그림(bell)이 flex 로 눌리지 않게 한다
          className="shrink-0 max-w-none"
          style={{ width: w, height: h }}
        />
      </div>
    );
  }

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
