// 말로 들은 장소 이름 → 지금 계신 곳 반경 5km 안의 실제 좌표.
// 검색 자체는 서버(/api/places/search)가 한다 — 지도 키를 브라우저 검색에 쓰지 않기 위함.
// "use client" 를 붙이지 않는다 — directionsUrl 은 서버 컴포넌트(동행 자세히 보기)도 쓴다.

export interface PlaceHit {
  name: string;
  address: string;
  lat: number;
  lng: number;
  /** 사용자 위치로부터의 직선거리(m) */
  distanceM: number;
}

export type PlaceLookup =
  | { place: PlaceHit; reason?: undefined }
  | { place: null; reason: "no-query" | "no-origin" | "no-key" | "out-of-range" | "error" };

export async function findNearbyPlace(
  query: string,
  origin: { lat: number; lng: number }
): Promise<PlaceLookup> {
  try {
    const res = await fetch("/api/places/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, lat: origin.lat, lng: origin.lng }),
    });
    if (!res.ok) return { place: null, reason: "error" };
    const data = await res.json();
    return data.place ? { place: data.place } : { place: null, reason: data.reason ?? "error" };
  } catch {
    return { place: null, reason: "error" };
  }
}

/** 지금 계신 곳. 권한이 없거나 실패하면 null — 장소 검색만 못 할 뿐 나머지는 그대로 동작한다. */
export function getCurrentOrigin(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(null),
      // 진입 때 이미 한 번 받아둔 값을 재사용해도 충분하다(5분)
      { timeout: 8000, maximumAge: 5 * 60 * 1000 }
    );
  });
}

/** 카카오맵·구글지도 어디서든 열리는 길찾기 주소. 좌표가 없으면 이름으로라도 연다. */
export function directionsUrl(p: { lat?: number | null; lng?: number | null; name?: string | null }): string {
  const base = "https://www.google.com/maps/dir/?api=1&destination=";
  if (typeof p.lat === "number" && typeof p.lng === "number") {
    const q = `${p.lat},${p.lng}`;
    return base + encodeURIComponent(q);
  }
  return base + encodeURIComponent(p.name ?? "");
}
