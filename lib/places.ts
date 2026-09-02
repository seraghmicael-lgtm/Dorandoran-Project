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

/**
 * 길찾기 주소. 폰에서 누르면 구글 지도 앱이 열리고(없으면 웹), 출발지는 지금 계신 곳이 된다.
 *
 * 걷기 안내를 기본으로 한다 — 이 앱은 걸어서 갈 수 있는 거리의 동행만 다룬다.
 * 좌표가 있으면 좌표로(정확), 없으면 장소 이름으로 연다.
 */
export function directionsUrl(
  p: { lat?: number | null; lng?: number | null; name?: string | null },
  travelmode: "walking" | "transit" | "driving" = "walking"
): string {
  const destination =
    typeof p.lat === "number" && typeof p.lng === "number"
      ? `${p.lat},${p.lng}`
      : (p.name ?? "");
  return (
    "https://www.google.com/maps/dir/?api=1" +
    `&destination=${encodeURIComponent(destination)}` +
    `&travelmode=${travelmode}`
  );
}

/**
 * 말씀하신 것을 둘레의 진짜 지명에 맞춰준다.
 *
 * 음성 인식은 동네 이름을 자주 놓친다("도란공원" → "도란 공원", "도란 콩원").
 * 지금 계신 곳 둘레에서 받아둔 이름 목록(/api/places/nearby)에 가까운 것이 있으면
 * 그것으로 바꿔 검색한다. 비슷한 게 없으면 말씀하신 그대로 둔다 — 마음대로 고쳐
 * 엉뚱한 곳을 찾아주는 것이 못 찾는 것보다 나쁘다.
 */
export function matchNearbyName(spoken: string, names: string[]): string | null {
  const norm = (s: string) => s.replace(/[\s.,·()]/g, "");
  const q = norm(spoken);
  if (q.length < 2 || names.length === 0) return null;

  let best: { name: string; score: number } | null = null;
  for (const name of names) {
    const n = norm(name);
    if (!n) continue;
    let score: number;
    if (n === q) score = 1;
    else if (n.includes(q) || q.includes(n)) score = Math.min(n.length, q.length) / Math.max(n.length, q.length);
    else {
      // 글자가 얼마나 겹치는지 — 한두 글자 잘못 들은 것을 건진다
      const rest = [...n];
      let hit = 0;
      for (const ch of q) {
        const i = rest.indexOf(ch);
        if (i >= 0) {
          rest.splice(i, 1);
          hit += 1;
        }
      }
      score = hit / Math.max(n.length, q.length);
    }
    if (!best || score > best.score) best = { name, score };
  }

  // 절반도 안 겹치면 다른 곳을 말씀하신 것이다
  return best && best.score >= 0.6 ? best.name : null;
}
