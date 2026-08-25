import { NextResponse } from "next/server";

// 장소 칸에서 타이핑할 때 뜨는 후보 — 지금 계신 곳 둘레의 진짜 지명을 쓴다.
// 미리 박아둔 목록은 어느 동네에서 열든 똑같아서 쓸모가 없다.
const RADIUS_M = 3000;

// 어르신이 "거기서 봐요" 할 만한 곳으로 좁힌다. 거리순으로 뽑으면 등록만 돼 있는
// 사무실·법인이 잔뜩 올라와서, 사람들이 실제로 아는 곳(인기순)으로 받는다.
const TYPE_GROUPS: string[][] = [
  ["park", "subway_station", "train_station", "tourist_attraction", "library"],
  ["supermarket", "department_store", "shopping_mall", "hospital"],
];

interface NearbyPlace {
  displayName?: { text?: string };
  primaryType?: string;
}

const STATION_TYPES = new Set(["subway_station", "train_station", "transit_station", "bus_station"]);

/** 역 이름은 "성수"처럼 맨몸으로 오는 게 많다 — 만날 곳으로 읽히게 "역"을 붙인다 */
function readableName(p: NearbyPlace): string | null {
  const name = p.displayName?.text?.trim();
  if (!name) return null;
  // 후보는 칩 한 칸에 들어가야 한다 — 가게 소개까지 붙은 긴 이름은 버린다
  if (name.length > 20) return null;
  if (p.primaryType && STATION_TYPES.has(p.primaryType) && !name.endsWith("역")) {
    return `${name}역`;
  }
  return name;
}

async function fetchGroup(
  includedTypes: string[],
  lat: number,
  lng: number,
  key: string
): Promise<string[]> {
  const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "places.displayName,places.primaryType",
    },
    body: JSON.stringify({
      includedTypes,
      maxResultCount: 10,
      rankPreference: "POPULARITY",
      locationRestriction: {
        circle: { center: { latitude: lat, longitude: lng }, radius: RADIUS_M },
      },
      languageCode: "ko",
      regionCode: "KR",
    }),
  });
  if (!res.ok) {
    console.warn("places:searchNearby 실패:", res.status, (await res.text()).slice(0, 160));
    return [];
  }
  const data = (await res.json()) as { places?: NearbyPlace[] };
  return (data.places ?? []).map(readableName).filter((n): n is string => !!n);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const num = (v: unknown): number =>
      typeof v === "number" ? v : typeof v === "string" && v.trim() ? Number(v) : Number.NaN;
    const lat = num(body?.lat);
    const lng = num(body?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ names: [] });
    }

    const key = process.env.GOOGLE_MAPS_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) return NextResponse.json({ names: [] });

    const groups = await Promise.all(TYPE_GROUPS.map((t) => fetchGroup(t, lat, lng, key)));
    // 한 갈래가 목록을 다 차지하지 않게 번갈아 섞는다
    const names: string[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < 10; i++) {
      for (const g of groups) {
        const n = g[i];
        if (n && !seen.has(n)) {
          seen.add(n);
          names.push(n);
        }
      }
    }
    return NextResponse.json({ names });
  } catch (error) {
    console.error("Error in /api/places/nearby:", error);
    return NextResponse.json({ names: [] });
  }
}
