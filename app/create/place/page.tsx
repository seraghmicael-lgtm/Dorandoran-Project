"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CreateStep from "@/components/ds/CreateStep";
import PrevNext from "@/components/ds/PrevNext";
import SmartInput from "@/components/SmartInput";
import GoogleMap from "@/components/GoogleMap";
import VoiceSheet from "@/components/ds/VoiceSheet";
import { updateDraft } from "@/lib/draft";
import {
  directionsUrl,
  findNearbyPlace,
  getCurrentOrigin,
  matchNearbyName,
  PlaceHit,
} from "@/lib/places";

// UI디자인 cr-04 (1089:7455) — 어디서 만날까요?
// 미리 박아둔 목록이 아니라 지도 + 검색이다. 어느 동네에서 열든 실제로 만날 수 있는
// 곳을 고르게 하려면 고정 목록으로는 안 된다.
export default function CreatePlacePage() {
  const router = useRouter();

  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null | undefined>(undefined);
  const [result, setResult] = useState<{
    query: string;
    place: PlaceHit | null;
    reason?: string;
  } | null>(null);
  const [searching, setSearching] = useState(false);
  // 타이핑할 때 뜨는 후보 — 지금 계신 곳 둘레의 진짜 지명을 받아둔다
  const [nearby, setNearby] = useState<string[]>([]);
  // 말하기는 이 화면 안에서 — 아래에서 올라오는 시트로 듣는다(cr-04)
  const [voiceOpen, setVoiceOpen] = useState(false);

  useEffect(() => {
    getCurrentOrigin().then(setOrigin);
  }, []);

  useEffect(() => {
    if (!origin) return;
    let cancelled = false;
    fetch("/api/places/nearby", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(origin),
    })
      .then((r) => (r.ok ? r.json() : { names: [] }))
      .then((d) => {
        if (!cancelled) setNearby(Array.isArray(d.names) ? d.names : []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [origin]);

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
      // 찾았으면 바로 확정한다 — 확인 버튼 없이 하단 [다음]이 곧장 켜진다
      if (r.place) updateDraft({ location: r.place.name, lat: r.place.lat, lng: r.place.lng });
    } finally {
      setSearching(false);
    }
  };

  // 음성은 동네 이름을 자주 놓친다. 둘레의 진짜 지명 중 가까운 것이 있으면 그걸로 찾는다.
  const searchSpoken = (spoken: string) => search(matchNearbyName(spoken, nearby) ?? spoken);

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
    <CreateStep
      step={4}
      title="어디서 만날까요?"
      backHref="/create/duration"
      footer={<PrevNext backHref="/create/duration" nextHref="/create/people" requires="location" />}
    >
      <div className="mt-5 flex flex-col">
        {/* 검색칸을 제목 바로 밑에 둔다 — 이 화면의 첫 할 일이 "어디를 찾을지 말하기"다 */}
        <SmartInput
          placeholder="예) 도란공원"
          hint={
            origin === null
              ? "‘도란공원 정문’처럼 만날 곳을 적어주세요"
              : "‘도란공원’처럼 쓰거나 말하면\n지도에서 찾아드릴게요"
          }
          // 위치를 모르면 검색이 아니라 적은 그대로 쓰는 것이므로 문구도 그렇게 말한다
          confirmLabel={searching ? "찾고 있어요..." : origin === null ? "이걸로 할게요" : "이 장소 찾기"}
          suggestions={nearby}
          onConfirm={search}
          onVoice={() => setVoiceOpen(true)}
        />

        <div className="h-4" />

        {pin ? (
          <GoogleMap
            lat={pin.lat}
            lng={pin.lng}
            origin={origin ?? undefined}
            height="h-[300px]"
            className="rounded-xl"
          />
        ) : (
          <div className="h-[300px] rounded-xl bg-surface flex items-center justify-center text-[15px] text-muted text-center px-6">
            {origin === undefined
              ? "지도를 준비하고 있어요..."
              : "위치를 몰라서 지도는 못 보여드려요. 위 칸에 만날 곳을 적어주세요."}
          </div>
        )}

        {/* 찾은 장소 — 이미 확정됐다. 하단 [다음]을 누르면 그대로 넘어간다 */}
        {result?.place && (
          <>
            <div className="h-2.5" />
            <div className="rounded-xl bg-surface px-4 py-4 flex flex-col gap-0.5">
              <span className="text-[19px] font-bold text-black">{result.place.name}</span>
              {result.place.address && (
                <span className="text-[15px] text-muted">{result.place.address}</span>
              )}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[15px] text-muted">
                  {result.place.distanceM < 1000
                    ? `여기서 ${result.place.distanceM}m`
                    : `여기서 ${(result.place.distanceM / 1000).toFixed(1)}km`}
                </span>
                {/* 고르기 전에 얼마나 걸리는지 지도로 확인할 수 있게 */}
                <a
                  href={directionsUrl(result.place)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[15px] font-bold text-accent underline-offset-2 hover:underline shrink-0"
                >
                  길찾기 &gt;
                </a>
              </div>
            </div>
          </>
        )}

        {/* 못 찾았을 때 — 막다른 길을 만들지 않는다 */}
        {result && !result.place && (
          <>
            <div className="h-2.5" />
            <div className="rounded-xl bg-surface px-4 py-4 flex flex-col gap-2">
              <p className="text-[15px] text-black">
                <span className="font-bold">{result.query}</span> 은(는) 걸어서 갈 만한 곳(5km 안)에서
                못 찾았어요.
              </p>
              <button
                type="button"
                onClick={() => choose(result.query, null)}
                className="w-full h-[50px] rounded-lg border border-gray-300 bg-white text-[16px] font-bold text-black cursor-pointer"
              >
                적은 그대로 쓸게요
              </button>
            </div>
          </>
        )}

      </div>

      <VoiceSheet
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onResult={searchSpoken}
        hint="만날 곳을 말씀하세요"
      />
    </CreateStep>
  );
}
