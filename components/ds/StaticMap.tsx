// UI디자인 ds_map — 위치 권한 화면의 지도.
// 움직이지 않는 그림이라 Maps JS 를 통째로 불러오지 않고 Static Maps 이미지 한 장을 쓴다.
// 스타일은 디자인 톤(연회색 블록 + 흰 도로, 라벨 없음)에 맞춰 깎았다.
const MAP_STYLE = [
  "feature:poi|visibility:off",
  "feature:transit|visibility:off",
  "feature:administrative|element:labels|visibility:off",
  "feature:road|element:labels|visibility:off",
  "feature:landscape|element:geometry|color:0xf2f2f0",
  "feature:road|element:geometry|color:0xffffff",
  "feature:road.arterial|element:geometry|color:0xfafafa",
  "feature:water|element:geometry|color:0xd9e8f5",
  "feature:poi.park|element:geometry|color:0xdff0d6",
];

export default function StaticMap({
  lat,
  lng,
  zoom = 16,
  className = "",
}: {
  lat: number;
  lng: number;
  zoom?: number;
  className?: string;
}) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // 키가 없으면 회색 판만 — 지도 자리가 무너지지 않게
  if (!key) {
    return <div className={`bg-surface ${className}`} aria-hidden="true" />;
  }

  const url =
    "https://maps.googleapis.com/maps/api/staticmap" +
    `?center=${lat},${lng}&zoom=${zoom}&size=320x170&scale=2&maptype=roadmap` +
    MAP_STYLE.map((s) => `&style=${encodeURIComponent(s)}`).join("") +
    `&key=${key}`;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* 지도는 배경 그림이라 alt 를 비운다 — 읽어줄 내용이 없다 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" aria-hidden="true" className="w-full h-full object-cover" />
      {/* 지금 계신 곳 표시 — 반투명 반경 + 파란 점 (디자인 그대로) */}
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="w-[84px] h-[84px] rounded-full bg-[#4A90E2]/15 flex items-center justify-center">
          <span className="w-[18px] h-[18px] rounded-full bg-[#4A90E2] border-[3px] border-white shadow-sm" />
        </span>
      </span>
    </div>
  );
}
