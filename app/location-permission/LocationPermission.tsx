"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import StepScreen from "@/components/ds/StepScreen";
import StepFooter, { footerButtonClass } from "@/components/ds/StepFooter";
import { Illust } from "@/components/ds/BrandMark";
import { safeInternalPath } from "@/lib/safePath";

// UI디자인 on-02 (1083:4055) — 위치 권한
function LocationPermissionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const nextParam = searchParams.get("next") ?? searchParams.get("from");
  const nextHref = safeInternalPath(nextParam ?? undefined, "/signup");
  const goNext = () => router.push(nextHref);

  const allow = () => {
    if (loading) return;
    setLoading(true);

    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await fetch("/api/user/location", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              }),
            });
          } catch {
            // 저장에 실패해도 다음으로 넘어간다 — 위치는 부가 기능이다
          } finally {
            goNext();
          }
        },
        // 브라우저 단계에서 거부하거나 실패해도 막지 않는다
        () => goNext(),
        { timeout: 10000 }
      );
    } else {
      goNext();
    }
  };

  return (
    <StepScreen
      title={"지금 현재\n위치를 확인해요"}
      subtitle={"걸어서 갈 수 있는 곳만 보여줘요\n위치는 오늘마실에 저장되지 않아요"}
      footer={
        <StepFooter>
          <button
            type="button"
            onClick={allow}
            disabled={loading}
            className={`${footerButtonClass("brand")} disabled:opacity-60`}
          >
            {loading ? "위치를 확인하고 있어요..." : "위치 허용"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/splash")}
            disabled={loading}
            className={`${footerButtonClass("ghost")} disabled:opacity-60`}
          >
            이전
          </button>
        </StepFooter>
      }
    >
      {/* illust(1187:3139) — 프레임 위에서 382px, 가로 가운데. 제목 블록(137+142)
          바로 아래 103px 을 띄우면 그 자리가 된다. */}
      <div className="mt-[103px] flex justify-center">
        <Illust name="map" box={160} />
      </div>
    </StepScreen>
  );
}

export default function LocationPermission() {
  return (
    <Suspense fallback={null}>
      <LocationPermissionContent />
    </Suspense>
  );
}
