"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CreateStep from "@/components/ds/CreateStep";
import MemoryChips from "@/components/ds/MemoryChips";
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

// UI디자인 cr-04 (1187:4440) — 어디서 만날까요?
// 미리 박아둔 목록이 아니라 지도 + 검색이다. 어느 동네에서 열든 실제로 만날 수 있는
// 곳을 고르게 하려면 고정 목록으로는 안 된다.
//
// 줄 순서와 자리(field 1187:4450, 좌우 16 기준):
//   칩(200) → 검색칸 58(262) → 9 → [이 장소 찾기] 48 → 13 → 지도 265 → 찾은 곳 카드(655)
// 줄마다 좌우 여백이 다르지 않고 전부 16 이므로 body="bare" 로 두고 블록마다 px-4 를 준다.
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
  // [이 장소 찾기]가 검색칸 밖에 따로 있는 버튼이라 입력값을 여기서도 들고 있는다
  const [query, setQuery] = useState("");
  // 말하기는 이 화면 안에서 — 아래에서 올라오는 시트로 듣는다(cr-04)
  const [voiceOpen, setVoiceOpen] = useState(false);
  // 빈 채로 [이 장소 찾기]를 누르면 커서를 검색칸으로 보낸다 — 눌러도 아무 일 없는 버튼은 안 된다
  const fieldRef = useRef<HTMLDivElement>(null);
  const focusInput = () => fieldRef.current?.querySelector("input")?.focus();

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
      title={"어디서\n만날까요?"}
      // title(1187:4449) — 제목과 한 묶음이라 16px/#777 로 제목 바로 밑에 붙는다
      desc={
        origin === null
          ? "’도란공원 정문’처럼\n만날 곳을 적어주세요"
          : "’도란공원’처럼 쓰거나 말하면\n지도에서 찾아드릴게요"
      }
      backHref="/create/duration"
      body="bare"
      chips={false}
      footer={<PrevNext backHref="/create/duration" nextHref="/create/people" requires="location" />}
    >
      {/* tag-list(1187:4460) — 좌우 16 · 위아래 16 */}
      <MemoryChips step={4} className="px-4 py-4 flex flex-wrap gap-1" />

      {/* field(1187:4450) — 세 줄의 자리가 못 박혀 있다: 검색칸 0(58) · 버튼 67(48) · 지도 128(265).
          고른 간격이 아니라 9 · 13 이라 gap 대신 그 값을 그대로 준다. */}
      <div ref={fieldRef} className="px-4 flex flex-col">
        <SmartInput
          placeholder="예) 도란공원"
          pending={searching}
          suggestions={nearby}
          showConfirmButton={false}
          onConfirm={search}
          onChange={setQuery}
          onVoice={() => setVoiceOpen(true)}
        />

        {/* ds_button(1187:4459) — 328×48 · radius 12 · #171717.
            디자인에 흐린 상태가 없다. 적은 게 없을 때도 검정 그대로 두고,
            누르면 아무 일도 안 하는 대신 검색칸으로 커서를 보낸다. */}
        <button
          type="button"
          onClick={() => (query.trim() ? search(query) : focusInput())}
          disabled={searching}
          className="mt-[9px] w-full h-12 rounded-xl bg-ink text-white text-[16px] font-bold leading-[1.4] cursor-pointer disabled:opacity-60 disabled:cursor-default"
        >
          {searching ? "찾고 있어요..." : origin === null ? "이걸로 할게요" : "이 장소 찾기"}
        </button>

        {/* card-list(1187:4457) — ds_map 320×265 · radius 12.
            ⚠️ Figma 실측: 지도만 320 이라 위 두 줄(328)보다 오른쪽이 8 짧다. 값 그대로 옮겼다. */}
        {pin ? (
          <GoogleMap
            lat={pin.lat}
            lng={pin.lng}
            origin={origin ?? undefined}
            width="w-[320px]"
            height="h-[265px]"
            className="mt-[13px] rounded-xl"
          />
        ) : (
          <div className="mt-[13px] w-[320px] h-[265px] rounded-xl bg-surface flex items-center justify-center text-[16px] font-medium text-[#777777] text-center px-6 leading-[1.5] whitespace-pre-line">
            {origin === undefined
              ? "지도를 준비하고 있어요..."
              : "위치를 몰라서 지도는 못 보여드려요.\n위 칸에 만날 곳을 적어주세요."}
          </div>
        )}
      </div>

      {/* 찾은 장소(1187:4511 ds_radio) — 좌우 16 · 위아래 16 자리에 흰 카드 하나.
          이미 확정된 상태라 하단 [다음]을 누르면 그대로 넘어간다. */}
      {result?.place && (
        <div className="px-4 py-4">
          <div className="rounded-lg border border-[#E5E5E5] bg-white px-4 py-4 flex flex-col gap-1">
            <span className="text-[18px] font-bold leading-[1.5] text-[#171717]">
              {result.place.name}
            </span>
            {/* 주소와 거리는 Figma 에서 한 덩어리(1187:4513)라 두 줄 사이가 벌어지지 않는다 */}
            <div className="flex flex-col text-[14px] font-medium leading-[1.5] text-[#777777]">
              {result.place.address && <span>{result.place.address}</span>}
              <div className="flex items-center justify-between gap-2">
                <span>
                  {result.place.distanceM < 1000
                    ? `여기서 ${result.place.distanceM}m`
                    : `여기서 ${(result.place.distanceM / 1000).toFixed(1)}km`}
                </span>
                {/* 고르기 전에 얼마나 걸리는지 지도로 확인할 수 있게 */}
                <a
                  href={directionsUrl(result.place)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-accent underline-offset-2 hover:underline shrink-0"
                >
                  길찾기 &gt;
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 못 찾았을 때 — 막다른 길을 만들지 않는다. 자리와 생김새는 위 카드와 같다. */}
      {result && !result.place && (
        <div className="px-4 py-4">
          <div className="rounded-lg border border-[#E5E5E5] bg-white px-4 py-4 flex flex-col gap-3">
            <p className="text-[14px] font-medium leading-[1.5] text-[#777777]">
              <span className="font-bold text-[#171717]">{result.query}</span> 은(는) 걸어서 갈 만한
              곳(5km 안)에서 못 찾았어요.
            </p>
            <button
              type="button"
              onClick={() => choose(result.query, null)}
              className="w-full h-12 rounded-xl border border-[#E5E5E5] bg-white text-[16px] font-bold leading-[1.4] text-[#5B5B5B] cursor-pointer"
            >
              적은 그대로 쓸게요
            </button>
          </div>
        </div>
      )}

      <VoiceSheet
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onResult={searchSpoken}
        hint="만날 곳을 말씀하세요"
      />
    </CreateStep>
  );
}
