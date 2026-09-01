"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PrevNext from "@/components/ds/PrevNext";
import { updateDraft } from "@/lib/draft";
import {
  KoreanClock,
  availableHours,
  availableMeridiems,
  availableMinutes,
  clampToday,
  formatKoreanClockParts,
} from "@/lib/koreanTime";

// 이 앱은 오늘만 다룬다 — 지난 시각이나 내일은 아예 칸에 넣지 않는다.
// 그래서 굴려도 기준 시각 앞으로는 넘어가지 않는다.
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
  // 방금 "내가 굴려서" 보고한 값. 그게 되돌아오면 위치를 건드리지 않는다
  // (굴리는 중에 되감으면 서로 밀치며 튄다).
  // 목록 자체가 바뀌면(오전↔오후 등) 키가 달라져 다시 맞춘다.
  const selfRef = useRef<string | null>(null);
  const key = values.join(",");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (selfRef.current === `${key}|${value}`) return;
    const i = values.indexOf(value);
    if (i >= 0) el.scrollTop = i * ITEM_H;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, key]);

  useEffect(
    () => () => {
      if (settleRef.current) clearTimeout(settleRef.current);
    },
    []
  );

  const handleScroll = () => {
    const el = ref.current;
    if (!el) return;
    if (settleRef.current) clearTimeout(settleRef.current);
    // 손을 뗀 뒤(스크롤이 멎은 뒤) 한 번만 읽는다
    settleRef.current = setTimeout(() => {
      const i = Math.min(values.length - 1, Math.max(0, Math.round(el.scrollTop / ITEM_H)));
      const v = values[i];
      if (v !== undefined && v !== value) {
        selfRef.current = `${key}|${v}`;
        onChange(v);
      }
    }, 120);
  };

  return (
    <div className="relative flex-1">
      {/* 가운데 칸 표시 — 여기 있는 값이 고른 값이다 */}
      <div
        className="pointer-events-none absolute inset-x-1 top-1/2 -translate-y-1/2 rounded-lg bg-accent-soft"
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
            className={`relative w-full snap-center flex items-center justify-center text-[20px] tabular-nums cursor-pointer ${
              v === value ? "font-bold text-accent" : "text-gray-400"
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
  floor,
}: {
  /** 오늘 고를 수 있는 가장 이른 시각 — 서버가 한국 시각으로 계산해 내려준다 */
  floor: KoreanClock;
}) {
  const router = useRouter();
  const [clock, setClock] = useState<KoreanClock>(() => clampToday(floor, floor));

  // 어느 칸을 돌리든 오늘 남은 범위 밖으로는 못 나간다
  const set = (patch: Partial<KoreanClock>) =>
    setClock((c) => clampToday(floor, { ...c, ...patch }));

  const meridiems = availableMeridiems(floor);
  const hours = availableHours(floor, clock.meridiem);
  const minutes = availableMinutes(floor, clock.meridiem, clock.hour12);

  const choose = (time: string) => {
    updateDraft({ time });
    router.push("/create/duration");
  };

  const label = formatKoreanClockParts(clock);

  return (
    <>
      {/* 고른 시각 — 굴릴 때마다 여기 글씨가 같이 바뀐다 */}
      <p className="mt-8 text-[26px] font-bold text-black text-center">{label}</p>

      <div className="mt-5 flex items-stretch gap-1 rounded-2xl border border-gray-200 px-3 py-2">
        {/* 오전/오후는 두 개뿐이라 굴리지 않고 눌러서 고른다. 이미 지난 쪽은 아예 안 나온다 */}
        <div className="flex-1 flex flex-col justify-center gap-1 py-1">
          {meridiems.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={clock.meridiem === m}
              onClick={() => set({ meridiem: m })}
              className={`h-[48px] rounded-lg flex items-center justify-center text-[20px] cursor-pointer ${
                clock.meridiem === m
                  ? "bg-accent-soft text-accent font-bold"
                  : "text-gray-400"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <Wheel
          values={hours}
          value={clock.hour12}
          format={(v) => `${v}`}
          onChange={(hour12) => set({ hour12 })}
          ariaLabel="시"
        />
        <Wheel
          values={minutes}
          value={clock.minute}
          format={(v) => String(v).padStart(2, "0")}
          onChange={(minute) => set({ minute })}
          ariaLabel="분"
        />
      </div>

      <p className="mt-4 text-[15px] text-muted text-center">
        오늘 남은 시간 중에서만 고를 수 있어요
      </p>

      {/* 휠에 떠 있는 시각은 아직 저장 전이라, 다음이 그걸 확정하고 넘어간다 */}
      <div className="-mx-5 mt-auto">
        <PrevNext backHref="/create/activity" onNext={() => choose(label)} />
      </div>
    </>
  );
}
