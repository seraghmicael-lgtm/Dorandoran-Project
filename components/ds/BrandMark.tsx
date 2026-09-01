// UI디자인 캔버스의 로고 — 초록 원 안에 발자국. 원본은 이미지 에셋이라
// 같은 색·같은 자리에 오도록 SVG 로 옮겼다(에셋을 받으면 이걸 교체하면 된다).
export default function BrandMark({ size = 100 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="오늘마실"
    >
      <circle cx="50" cy="50" r="50" fill="#5BC236" />
      <ellipse cx="38" cy="42" rx="9" ry="15" fill="#fff" />
      <ellipse cx="62" cy="42" rx="9" ry="15" fill="#fff" />
      <path
        d="M32 66c4 7 11 11 18 11s14-4 18-11"
        stroke="#fff"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
