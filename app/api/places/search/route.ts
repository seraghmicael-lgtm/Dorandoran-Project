import { NextResponse } from "next/server";

// 어르신이 말한 장소("송정 오일장", "도란마트 정문 앞")를 실제 좌표로 바꾼다.
// 반드시 지금 계신 곳에서 반경 5km 안에서만 찾는다 — 걸어서 갈 수 있는 곳만 다루는 앱이라
// 같은 이름의 먼 동네 가게가 잡히면 안 된다.
const RADIUS_M = 5000;

export interface PlaceHit {
  name: string;
  address: string;
  lat: number;
  lng: number;
  /** 사용자 위치로부터의 직선거리(m) */
  distanceM: number;
}

function haversineM(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** 반경 RADIUS_M 를 감싸는 사각형. Places searchText 의 locationRestriction 은
 *  원(circle)을 받지 않고 사각형만 받는다 — 원으로 보내면 400 INVALID_ARGUMENT.
 *  사각형은 원의 외접이라 모서리가 반경을 넘치므로, 결과는 실제 거리로 다시 자른다. */
function boundingBox(lat: number, lng: number) {
  const dLat = RADIUS_M / 111_320;
  const dLng = RADIUS_M / (111_320 * Math.max(0.1, Math.cos((lat * Math.PI) / 180)));
  return { low: { lat: lat - dLat, lng: lng - dLng }, high: { lat: lat + dLat, lng: lng + dLng } };
}

/** 좌표가 온전한 것만 남기고 거리를 붙인다 */
function toHits(
  raw: { name: string; address: string; lat?: number; lng?: number }[],
  lat: number,
  lng: number
): PlaceHit[] {
  return raw
    .filter((p): p is PlaceHit & { lat: number; lng: number } =>
      typeof p.lat === "number" && typeof p.lng === "number"
    )
    .map((p) => ({
      name: p.name,
      address: p.address,
      lat: p.lat,
      lng: p.lng,
      distanceM: Math.round(haversineM(lat, lng, p.lat, p.lng)),
    }));
}

/** 1순위: Places API (New) — 가게·시장 같은 장소 이름을 제대로 찾는다 */
async function searchPlaces(
  query: string,
  lat: number,
  lng: number,
  key: string
): Promise<PlaceHit[] | null> {
  const box = boundingBox(lat, lng);
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location",
    },
    body: JSON.stringify({
      textQuery: query,
      // 사각형으로 후보를 좁히고(원은 안 받는다), 넘치는 모서리는 호출부가 거리로 자른다
      locationRestriction: {
        rectangle: {
          low: { latitude: box.low.lat, longitude: box.low.lng },
          high: { latitude: box.high.lat, longitude: box.high.lng },
        },
      },
      languageCode: "ko",
      regionCode: "KR",
      maxResultCount: 5,
    }),
  });
  if (!res.ok) {
    // 프로젝트에서 Places API가 꺼져 있으면 403 — 폴백으로 넘긴다
    console.warn("places:searchText 사용 불가:", res.status, (await res.text()).slice(0, 160));
    return null;
  }
  const data = (await res.json()) as {
    places?: {
      displayName?: { text?: string };
      formattedAddress?: string;
      location?: { latitude?: number; longitude?: number };
    }[];
  };
  return toHits(
    (data.places ?? []).map((p) => ({
      name: p.displayName?.text ?? query,
      address: p.formattedAddress ?? "",
      lat: p.location?.latitude,
      lng: p.location?.longitude,
    })),
    lat,
    lng
  );
}

/** 2순위: Geocoding — 주소·동네 이름 위주라 정확도는 떨어지지만 Places 없이도 동작한다 */
async function geocode(
  query: string,
  lat: number,
  lng: number,
  key: string
): Promise<PlaceHit[]> {
  // 반경 5km를 감싸는 사각형으로 후보를 좁힌 뒤, 실제 거리로 다시 거른다
  const box = boundingBox(lat, lng);
  const bounds = `${box.low.lat},${box.low.lng}|${box.high.lat},${box.high.lng}`;
  const url =
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}` +
    `&bounds=${encodeURIComponent(bounds)}&language=ko&region=kr&key=${key}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = (await res.json()) as {
    results?: { formatted_address?: string; geometry?: { location?: { lat?: number; lng?: number } } }[];
  };
  return toHits(
    (data.results ?? []).map((r) => ({
      name: query,
      address: r.formatted_address ?? "",
      lat: r.geometry?.location?.lat,
      lng: r.geometry?.location?.lng,
    })),
    lat,
    lng
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const query = typeof body?.query === "string" ? body.query.trim() : "";
    // Number(null)·Number("")·Number(undefined) 이 0 또는 NaN 으로 뭉개진다.
    // 위치를 모르는 요청이 적도(0,0)로 검색되면 안 되므로 실제 숫자만 받는다.
    const num = (v: unknown): number =>
      typeof v === "number" ? v : typeof v === "string" && v.trim() ? Number(v) : Number.NaN;
    const lat = num(body?.lat);
    const lng = num(body?.lng);

    if (!query) return NextResponse.json({ place: null, reason: "no-query" });
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ place: null, reason: "no-origin" });
    }

    const key = process.env.GOOGLE_MAPS_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) return NextResponse.json({ place: null, reason: "no-key" });

    let hits = await searchPlaces(query, lat, lng, key);
    let source: "places" | "geocoding" = "places";
    if (hits === null) {
      hits = await geocode(query, lat, lng, key);
      source = "geocoding";
    }

    // 두 경로 모두 사각형으로만 좁혀졌다 — 5km 보장은 여기서 실제 거리로 자르는 이 줄이 한다
    const within = hits
      .filter((p) => p.distanceM <= RADIUS_M)
      .sort((a, b) => a.distanceM - b.distanceM);

    if (within.length === 0) {
      return NextResponse.json({ place: null, reason: "out-of-range", source, radiusM: RADIUS_M });
    }
    return NextResponse.json({ place: within[0], others: within.slice(1, 3), source });
  } catch (error) {
    console.error("Error in /api/places/search:", error);
    return NextResponse.json({ place: null, reason: "error" });
  }
}
