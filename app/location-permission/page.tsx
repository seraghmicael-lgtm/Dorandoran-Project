"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";
import { safeInternalPath } from "@/lib/safePath";

function LocationPermissionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const nextParam = searchParams.get("next") ?? searchParams.get("from");
  const nextHref = safeInternalPath(nextParam ?? undefined, "/home");

  const handleRequestLocation = () => {
    if (loading) return;
    setLoading(true);

    const navigateNext = () => {
      router.push(nextHref);
    };

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
            // ignore error
          } finally {
            navigateNext();
          }
        },
        () => {
          // error / denied
          navigateNext();
        },
        { timeout: 10000 }
      );
    } else {
      navigateNext();
    }
  };

  return (
    <WireframeLayout justify="between" bottomNav="none" className="p-6">
      <div className="flex-1 flex flex-col justify-center gap-4 py-12">
        <h1 className="text-xl font-bold text-black leading-tight">
          가까운 것만 보여드릴게요
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          걸어서 갈 수 있는 곳만 보여드리려고 위치를 확인해요. 위치는 저장하지 않아요.
        </p>
      </div>

      <div className="flex flex-col gap-3 pb-8 items-center">
        <button
          type="button"
          onClick={handleRequestLocation}
          className="w-full h-[60px] bg-black text-white flex items-center justify-center rounded text-base font-medium cursor-pointer"
        >
          위치 허용하기
        </button>
      </div>
    </WireframeLayout>
  );
}

export default function LocationPermissionPage() {
  return (
    <Suspense fallback={null}>
      <LocationPermissionContent />
    </Suspense>
  );
}
