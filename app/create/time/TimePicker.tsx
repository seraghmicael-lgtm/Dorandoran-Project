"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SmartInput from "@/components/SmartInput";
import CreateNavButtons from "@/components/CreateNavButtons";
import { updateDraft } from "@/lib/draft";
import { KoreanClock, formatKoreanClockParts, parseKoreanClock } from "@/lib/koreanTime";

// 정해진 몇 개가 아니라 아무 시각이나 고를 수 있게 — 시·분은 위아래로 굴려서 고른다.
// 분은 5분 단위: 어르신이 60칸을 굴리게 하지 않으면서 실제로 쓰는 시각은 다 나온다.
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const ITEM_H = 52; // 한 칸 높이(px) — 스크롤 위치를 칸 수로 환산하는 기준
const VISIBLE = 3; // 가운데 한 칸 + 위아래 한 칸씩

/** 위아래로 굴려 하나를 고르는 칸. 브라우저 scroll-snap 이 가운데로 붙여준다. */
function Wheel({
  values,
  value,
  format,
  onChange,
  ariaLabel,
}: {
  values: number[];
  value: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const settleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 첫 렌더에서만 위치를 맞춘다. 그 뒤로는 손이 굴리는 대로 두고 값만 읽는다
  // (스크롤할 때마다 되돌려 감으면 서로 밀치며 튄다).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const i = values.indexOf(value);
    if (i >= 0) el.scrollTop = i * ITEM_H;
    return () => {
      if (settleRef.current) clearTimeout(settleRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    const el = ref.current;
    if (!el) return;
    if (settleRef.current) clearTimeout(settleRef.current);
    // 손을 뗀 뒤(스크롤이 멎은 뒤) 한 번만 읽는다
    settleRef.current = setTimeout(() => {
      const i = Math.min(values.length - 1, Math.max(0, Math.round(el.scrollTop / ITEM_H)));
      if (values[i] !== value) onChange(values[i]);
    }, 120);
  };

  return (
    <div className="relative flex-1">
      {/* 가운데 칸 표시 — 여기 있는 값이 고른 값이다 */}
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 border-y-2 border-black"
        style={{ height: ITEM_H }}
      />
      <div
        ref={ref}
        onScroll={handleScroll}
        role="listbox"
        aria-label={ariaLabel}
        className="overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        style={{ height: ITEM_H * VISIBLE }}
      >
        {/* 첫·마지막 값도 가운데로 올 수 있게 위아래를 비워둔다 */}
        <div style={{ height: ITEM_H }} />
        {values.map((v) => (
          <button
            key={v}
            type="button"
            role="option"
            aria-selected={v === value}
            onClick={() => {
              ref.current?.scrollTo({ top: values.indexOf(v) * ITEM_H, behavior: "smooth" });
            }}
            className={`w-full snap-center flex items-center justify-center text-[24px] tabular-nums cursor-pointer ${
              v === value ? "font-bold text-black" : "text-gray-400"
            }`}
            style={{ height: ITEM_H }}
          >
            {format(v)}
          </button>
        ))}
        <div style={{ height: ITEM_H }} />
      </div>
    </div>
  );
}

export default function TimePicker({
  defaultTime,
  suggestions,
}: {
  defaultTime: string;
  suggestions: string[];
}) {
  const router = useRouter();
  const [clock, setClock] = useState<KoreanClock>(() => {
    const c = parseKoreanClock(defaultTime) ?? { meridiem: "오후", hour12: 3, minute: 0 };
    // 칸에 없는 분으로 들어오면 어느 칸도 안 잡힌다 — 가장 가까운 5분 칸으로 맞춘다
    const snapped = Math.min(55, Math.round(c.minute / 5) * 5);
    return { ...c, minute: snapped };
  });

  const choose = (time: string) => {
    updateDraft({ time });
    router.push("/create/duration");
  };

  const label = formatKoreanClockParts(clock);

  return (
    <>
      {/* 고른 시각 — 굴릴 때마다 여기 글씨가 같이 바뀐다 */}
      <p className="text-[22px] font-bold text-black text-center">{label}</p>
      <div className="h-3" />

      <div className="flex items-stretch gap-2.5 border border-gray-300 px-2 py-1">
        <Wheel
          values={HOURS}
          value={clock.hour12}
          format={(v) => `${v}시`}
          onChange={(hour12) => setClock((c) => ({ ...c, hour12 }))}
          ariaLabel="시"
        />
        <Wheel
          values={MINUTES}
          value={clock.minute}
          format={(v) => `${String(v).padStart(2, "0")}분`}
          onChange={(minute) => setClock((c) => ({ ...c, minute }))}
          ariaLabel="분"
        />
        {/* 오전/오후는 두 개뿐이라 굴리지 않고 눌러서 고른다 */}
        <div className="flex-1 flex flex-col gap-1 py-1">
          {(["오전", "오후"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={clock.meridiem === m}
              onClick={() => setClock((c) => ({ ...c, meridiem: m }))}
              className={`flex-1 flex items-center justify-center text-[19px] font-bold cursor-pointer border ${
                clock.meridiem === m
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="h-3" />
      <button
        type="button"
        onClick={() => choose(label)}
        className="w-full h-[60px] bg-black text-white flex items-center justify-center text-[19px] font-bold cursor-pointer"
      >
        이 시간으로 할게요
      </button>

      <div className="h-[18px]" />
      <SmartInput
        placeholder="예) 오후 네 시 반"
        hint="“내일 네 시”처럼 쓰거나 말하셔도 돼요"
        suggestions={suggestions}
        onConfirm={choose}
      />

      {/* 휠에 떠 있는 시각은 아직 저장 전이라, 다음이 그걸 확정하고 넘어간다 */}
      <CreateNavButtons backHref="/create/activity" onNext={() => choose(label)} />
    </>
  );
}
