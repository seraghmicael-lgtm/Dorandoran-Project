"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";
import { safeInternalPath } from "@/lib/safePath";

function LocationPermissionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  // 들어오자마자 동의를 묻는다 — 이 화면의 목적이 그것이다
  const [asking, setAsking] = useState(true);

  const nextParam = searchParams.get("next") ?? searchParams.get("from");
  const nextHref = safeInternalPath(nextParam ?? undefined, "/home");

  const goNext = () => router.push(nextHref);

  const handleAgree = () => {
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

  const handleDecline = () => {
    if (loading) return;
    // 동의하지 않아도 앱은 계속 쓸 수 있다. 위치가 필요한 기능만 못 쓴다.
    setAsking(false);
    goNext();
  };

  return (
    <WireframeLayout justify="between" bottomNav="none" className="p-6">
      <div className="flex-1 flex flex-col justify-center gap-4 py-12">
        <h1 className="text-xl font-bold text-black leading-tight">
          가까운 것만 보여드릴게요
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          걸어서 갈 수 있는 곳만 보여드리려고 위치를 확인해요.
        </p>
      </div>

      <div className="flex flex-col gap-3 pb-8 items-center">
        <button
          type="button"
          onClick={() => setAsking(true)}
          className="w-full h-[60px] bg-black text-white flex items-center justify-center rounded text-base font-medium cursor-pointer"
        >
          위치 허용하기
        </button>
      </div>

      {/* 위치 이용 동의 — 동의함 / 동의하지 않음 */}
      {asking && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="loc-consent-title"
        >
          <div className="w-full max-w-[330px] my-auto bg-white border border-black rounded-lg p-5 flex flex-col gap-4">
            <h2 id="loc-consent-title" className="text-lg font-bold text-black leading-snug">
              위치를 써도 될까요?
            </h2>

            <div className="flex flex-col gap-3 text-[14px] leading-relaxed text-gray-700">
              <p>
                지금 계신 곳을 알아야 <span className="font-bold text-black">걸어서 갈 수 있는
                가까운 동행</span>만 골라 보여드릴 수 있어요.
              </p>
              <p>
                이렇게 씁니다.
                <br />· 가까운 동행 찾기
                <br />· 말씀하신 장소를 반경 5km 안에서 찾아 지도에 표시하기
                <br />· 만나는 곳까지 길찾기
              </p>
              <p className="text-gray-500">
                위치는 이 앱 안에서만 쓰고 다른 곳에 넘기지 않아요. 언제든 휴대폰 설정에서
                다시 끄실 수 있어요.
              </p>

              {/* 동의하지 않으면 어떻게 되는지 — 같은 상자 안에 명시 */}
              <div className="border border-gray-300 bg-gray-50 p-3 text-[13px] leading-relaxed text-gray-700">
                <p className="font-bold text-black">동의하지 않으시면</p>
                <p className="mt-1">
                  가까운 동행을 찾아드리기 어려워요. 지도와 길찾기도 안 나오고, 만나는 곳은
                  손으로 적으셔야 해요. 그 밖의 기능은 그대로 쓰실 수 있어요.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleAgree}
                disabled={loading}
                className="w-full h-[54px] bg-black text-white flex items-center justify-center rounded text-base font-bold cursor-pointer disabled:bg-gray-400 disabled:cursor-default"
              >
                {loading ? "위치를 확인하고 있어요..." : "동의함"}
              </button>
              <button
                type="button"
                onClick={handleDecline}
                disabled={loading}
                className="w-full h-[54px] bg-white text-black border border-gray-400 flex items-center justify-center rounded text-base font-medium cursor-pointer disabled:text-gray-400 disabled:cursor-default"
              >
                동의하지 않음
              </button>
            </div>
          </div>
        </div>
      )}
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
