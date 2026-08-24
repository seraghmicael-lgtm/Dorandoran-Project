"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";
import CreateStepHeader from "@/components/CreateStepHeader";
import SmartInput from "@/components/SmartInput";
import GoogleMap from "@/components/GoogleMap";
import { updateDraft } from "@/lib/draft";
import { directionsUrl, findNearbyPlace, getCurrentOrigin, PlaceHit } from "@/lib/places";

// 와이어프레임_v02 04_어디서 만날까요
// 고정 카드 3개(송정마을 어귀 등) 대신 지도 + 검색으로 바꿨다 — 어느 동네에서 열든
// 실제로 만날 수 있는 곳을 고르게 하려면 미리 박아둔 목록으로는 안 된다.
export default function CreatePlacePage() {
  const router = useRouter();

  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null | undefined>(undefined);
  const [result, setResult] = useState<{
    query: string;
    place: PlaceHit | null;
    reason?: string;
  } | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    getCurrentOrigin().then(setOrigin);
  }, []);

  const search = async (query: string) => {
    const q = query.trim();
    if (!q || searching) return;
    if (!origin) {
      // 위치를 모르면 검색할 반경이 없다 — 적어주신 그대로 쓴다
      choose(q, null);
      return;
    }
    setSearching(true);
    try {
      const r = await findNearbyPlace(q, origin);
      setResult({ query: q, place: r.place, reason: r.reason });
    } finally {
      setSearching(false);
    }
  };

  const choose = (location: string, place: PlaceHit | null) => {
    updateDraft({
      location,
      ...(place ? { lat: place.lat, lng: place.lng } : {}),
    });
    router.push("/create/people");
  };

  // 검색 결과가 있으면 그 자리에, 없으면 지금 계신 곳에 핀
  const pin = result?.place ?? (origin ?? null);

  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      <CreateStepHeader step={4} backHref="/create/duration" />

      <div className="px-[18px] py-[22px] flex flex-col">
        <h1 className="text-[22px] font-bold text-black">어디서 만날까요?</h1>
        <div className="h-5" />

        {pin ? (
          <GoogleMap lat={pin.lat} lng={pin.lng} height="h-[210px]" className="border border-gray-300" />
        ) : (
          <div className="h-[210px] border border-gray-300 flex items-center justify-center text-[15px] text-gray-500 text-center px-6">
            {origin === undefined
              ? "지도를 준비하고 있어요..."
              : "위치를 몰라서 지도는 못 보여드려요. 아래에 만날 곳을 적어주세요."}
          </div>
        )}

        {/* 찾은 장소 확인 — 어르신이 눈으로 보고 결정한다 */}
        {result?.place && (
          <>
            <div className="h-2.5" />
            <div className="border border-black px-[18px] py-[15px] flex flex-col gap-0.5">
              <span className="text-[19px] font-bold text-black">{result.place.name}</span>
              {result.place.address && (
                <span className="text-[15px] text-gray-500">{result.place.address}</span>
              )}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[15px] text-gray-500">
                  {result.place.distanceM < 1000
                    ? `여기서 ${result.place.distanceM}m`
                    : `여기서 ${(result.place.distanceM / 1000).toFixed(1)}km`}
                </span>
                {/* 고르기 전에 얼마나 걸리는지 지도로 확인할 수 있게 */}
                <a
                  href={directionsUrl(result.place)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[15px] font-bold text-[#3D6B5A] underline-offset-2 hover:underline shrink-0"
                >
                  길찾기 &gt;
                </a>
              </div>
            </div>
            <div className="h-2.5" />
            <button
              type="button"
              onClick={() => choose(result.place!.name, result.place)}
              className="w-full py-[18px] bg-black text-white text-[17px] font-bold cursor-pointer"
            >
              여기서 만날게요
            </button>
          </>
        )}

        {/* 못 찾았을 때 — 막다른 길을 만들지 않는다 */}
        {result && !result.place && (
          <>
            <div className="h-2.5" />
            <div className="border border-gray-300 bg-gray-50 px-[18px] py-[15px] flex flex-col gap-2">
              <p className="text-[15px] text-black">
                <span className="font-bold">{result.query}</span> 은(는) 걸어서 갈 만한 곳(5km 안)에서
                못 찾았어요.
              </p>
              <button
                type="button"
                onClick={() => choose(result.query, null)}
                className="w-full py-[14px] border border-black bg-white text-[15px] font-bold text-black cursor-pointer"
              >
                적은 그대로 쓸게요
              </button>
            </div>
          </>
        )}

        <div className="h-[18px]" />
        {/* 이 화면엔 고를 목록이 없으니 "목록에 없으면" 머리말을 빼고 검색칸만 둔다 */}
        <SmartInput
          label=""
          placeholder="여기에 쓰세요 예) 도란공원 정문"
          hint={
            origin === null
              ? "“도란공원 정문”처럼 만날 곳을 적어주세요"
              : "“도란공원”처럼 쓰거나 말하시면 지도에서 찾아드려요"
          }
          // 위치를 모르면 검색이 아니라 적은 그대로 쓰는 것이므로 문구도 그렇게 말한다
          confirmLabel={searching ? "찾고 있어요..." : origin === null ? "이걸로 할게요" : "이 장소 찾기"}
          onConfirm={search}
        />
      </div>
    </WireframeLayout>
  );
}
