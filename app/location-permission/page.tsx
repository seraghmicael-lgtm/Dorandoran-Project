"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import StepScreen from "@/components/ds/StepScreen";
import StepFooter from "@/components/ds/StepFooter";
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
      subtitle={"걸어서 갈 수 있는 곳만\n보여드릴게요"}
      footer={
        <StepFooter>
          <button
            type="button"
            onClick={allow}
            disabled={loading}
            className="w-full h-[54px] rounded-lg bg-[#32952D] text-white flex items-center justify-center text-[17px] font-bold disabled:opacity-60"
          >
            {loading ? "위치를 확인하고 있어요..." : "위치 허용"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/splash")}
            disabled={loading}
            className="w-full h-[54px] rounded-lg bg-white text-black border border-gray-300 flex items-center justify-center text-[17px] font-bold disabled:opacity-60"
          >
            이전
          </button>
        </StepFooter>
      }
    >
      <div className="mt-9 flex flex-col items-center gap-7">
        {/* ds_map — 아직 위치를 모르니 실제 지도 대신 자리 그림을 둔다 */}
        <div className="w-full h-[170px] rounded-xl bg-[#EDEDED] overflow-hidden relative">
          <svg viewBox="0 0 320 170" className="w-full h-full" aria-hidden="true">
            <path d="M0 40h320M0 118h320M96 0v170M232 0v170" stroke="#E0E0E0" strokeWidth="10" />
            <path d="M0 96 L320 20" stroke="#E4E4E4" strokeWidth="14" />
            <circle cx="160" cy="85" r="42" fill="#4A90E2" opacity="0.14" />
            <circle cx="160" cy="85" r="10" fill="#4A90E2" />
            <circle cx="160" cy="85" r="4" fill="#fff" />
          </svg>
        </div>
        <p className="text-[14px] text-[#999999]">위치는 오늘마실에 저장되지 않아요</p>
      </div>
    </StepScreen>
  );
}

export default function LocationPermissionPage() {
  return (
    <Suspense fallback={null}>
      <LocationPermissionContent />
    </Suspense>
  );
}
