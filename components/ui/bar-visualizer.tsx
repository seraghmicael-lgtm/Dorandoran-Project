"use client";

import React, { useEffect, useState } from "react";

// LiveKit components-js(shadcn 패키지)의 BarVisualizer를 이 앱에 맞게 이식한 것.
// 원본은 LiveKit Room/Track에 결합돼 있어 컴포넌트 패턴(막대 그리드 + 상태별
// 애니메이션)만 가져오고, 밴드 값은 useAudioBands(실제 오디오 FFT)로 공급받는다.
export type VisualizerState = "connecting" | "listening" | "speaking" | "idle";

interface BarVisualizerProps {
  state: VisualizerState;
  /** 0~1 밴드 값 (실제 소리). connecting/idle에서는 무시된다 */
  bands: number[];
  className?: string;
}

const MIN_PCT = 18;

export default function BarVisualizer({ state, bands, className = "" }: BarVisualizerProps) {
  const count = bands.length || 6;
  const [seq, setSeq] = useState(0);

  // connecting: LiveKit의 순차 하이라이트 애니메이션
  useEffect(() => {
    if (state !== "connecting") return;
    const t = setInterval(() => setSeq((s) => (s + 1) % count), 140);
    return () => clearInterval(t);
  }, [state, count]);

  return (
    <div className={`flex items-center justify-center gap-1.5 h-full ${className}`}>
      {Array.from({ length: count }, (_, i) => {
        let pct = MIN_PCT;
        let color = "bg-gray-400";
        if (state === "connecting") {
          pct = i === seq ? 70 : MIN_PCT;
          color = i === seq ? "bg-black" : "bg-gray-300";
        } else if (state === "listening" || state === "speaking") {
          pct = MIN_PCT + (bands[i] ?? 0) * (100 - MIN_PCT);
          color = state === "speaking" ? "bg-amber-500" : "bg-black";
        }
        return (
          <div
            key={i}
            className={`w-1.5 rounded-full transition-[height] duration-75 ${color}`}
            style={{ height: `${pct}%` }}
          />
        );
      })}
    </div>
  );
}
