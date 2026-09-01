import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { UID_COOKIE } from "@/lib/session";
import LocationPermission from "./LocationPermission";

// UI디자인 on-02 (1083:4055) — 위치 권한
// 지도 중심: 예전에 허용해서 저장된 위치가 있으면 그곳, 없으면 기본 좌표(서울 시청).
// 아직 허용 전이라 "지금 여기"를 알 수 없으니 이 지도는 안내용 그림이다.
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

export default async function LocationPermissionPage() {
  const uid = (await cookies()).get(UID_COOKIE)?.value;
  let center = DEFAULT_CENTER;
  try {
    if (uid) {
      const me = await prisma.user.findUnique({
        where: { id: uid },
        select: { lat: true, lng: true },
      });
      if (typeof me?.lat === "number" && typeof me?.lng === "number") {
        center = { lat: me.lat, lng: me.lng };
      }
    }
  } catch (e) {
    console.error("저장된 위치 조회 실패:", e);
  }

  return <LocationPermission center={center} />;
}
