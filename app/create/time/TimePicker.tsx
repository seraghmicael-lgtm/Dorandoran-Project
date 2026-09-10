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
//
// ds_wheelPicker(easy) (1211:9499) 실측 — 카드 안쪽 324×228 에 76 짜리 줄이 세 개.
// 한 칸 42 · 칸 사이 20 이므로 줄 간격은 62 이고, 세 줄(186)이 228 안에 가운데로 선다.
// 가운데 줄에 있는 값이 고른 값이다 — 초록 굵은 글씨로만 알리고 깔개는 두지 않는다.
const ITEM_H = 62; // 한 줄 높이(px) — 스크롤 위치를 칸 수로 환산하는 기준
const VISIBLE = 3; // 가운데 한 칸 + 위아래 한 칸씩
const COL_W = 76; // 오전/오후 · 시 · 분 모두 같은 폭

/** 위아래로 굴려 하나를 고르는 칸. 브라우저 scroll-snap 이 가운데로 붙여준다. */
function Wheel<T extends string | number>({
  values,
  value,
  format,
  onChange,
  ariaLabel,
  labelClass,
  restingWeight = "font-medium",
}: {
  values: T[];
  value: T;
  format: (v: T) => string;
  onChange: (v: T) => void;
  ariaLabel: string;
  /** 글자 크기·자간 — 시/분은 32, 오전/오후는 26 */
  labelClass: string;
  /** 고르지 않은 값의 굵기 — 시/분은 medium, 오전/오후는 둘 다 bold */
  restingWeight?: string;
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
    <div
      ref={ref}
      onScroll={handleScroll}
      role="listbox"
      aria-label={ariaLabel}
      className="shrink-0 overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      style={{ width: COL_W, height: ITEM_H * VISIBLE }}
    >
      {/* 첫·마지막 값도 가운데로 올 수 있게 위아래를 비워둔다 */}
      <div style={{ height: ITEM_H }} />
      {values.map((v) => (
        <button
          key={String(v)}
          type="button"
          role="option"
          aria-selected={v === value}
          onClick={() => {
            ref.current?.scrollTo({ top: values.indexOf(v) * ITEM_H, behavior: "smooth" });
          }}
          className={`w-full snap-center flex items-center justify-center leading-[1.3] cursor-pointer ${labelClass} ${
            v === value ? "font-bold text-brand" : `${restingWeight} text-[#D1D1D1]`
          }`}
          style={{ height: ITEM_H }}
        >
          {format(v)}
        </button>
      ))}
      <div style={{ height: ITEM_H }} />
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
      {/* list(1208:9199) — 좌우 16 · 위아래 16.
          wrap(1208:9200) 은 326×230 짜리 테두리 카드다(안쪽이 딱 324×228).
          좌우 여백 안(328)을 다 쓰지 않고 2px 을 남기는 것도 Figma 값 그대로다. */}
      <div className="px-4 py-4">
        <div className="w-[326px] h-[230px] rounded-xl border border-[#E3E3E3] flex items-center justify-center">
          {/* 오전/오후 — 시:분 사이가 24, 시·:·분 사이가 8 */}
          <div className="flex items-center gap-6">
            {/* 오전/오후는 두 개뿐이라 굴릴 것도 별로 없지만, 고른 값이 늘 가운데 줄에
                오도록 시·분과 같은 칸으로 둔다. 이미 지난 쪽은 아예 안 나온다. */}
            <Wheel
              values={meridiems}
              value={clock.meridiem}
              format={(v) => v}
              onChange={(meridiem) => set({ meridiem })}
              ariaLabel="오전 오후"
              labelClass="text-[26px] tracking-[-0.26px]"
              restingWeight="font-bold"
            />
            <div className="flex items-center gap-2">
              <Wheel
                values={hours}
                value={clock.hour12}
                format={(v) => `${v}`}
                onChange={(hour12) => set({ hour12 })}
                ariaLabel="시"
                labelClass="text-[32px] tracking-[-0.32px] tabular-nums"
              />
              {/* 시:분 사이 구분선 — 어느 쪽이 골라졌든 늘 옅은 회색이다 */}
              <span
                className="shrink-0 text-[20px] font-medium leading-[1.3] text-[#D1D1D1]"
                aria-hidden="true"
              >
                :
              </span>
              <Wheel
                values={minutes}
                value={clock.minute}
                format={(v) => String(v).padStart(2, "0")}
                onChange={(minute) => set({ minute })}
                ariaLabel="분"
                labelClass="text-[32px] tracking-[-0.32px] tabular-nums"
              />
            </div>
          </div>
        </div>
      </div>

      {/* guide(1208:9202) — 좌우 20 · 위아래 16 */}
      <p className="px-5 py-4 text-[16px] font-medium leading-[1.5] text-[#777777] text-center">
        오늘 남은 시간 중에서만 고를 수 있어요
      </p>

      {/* 휠에 떠 있는 시각은 아직 저장 전이라, 다음이 그걸 확정하고 넘어간다 */}
      <div className="mt-auto">
        <PrevNext backHref="/create/activity" onNext={() => choose(label)} />
      </div>
    </>
  );
}
