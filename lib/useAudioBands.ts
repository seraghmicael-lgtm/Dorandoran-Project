"use client";

import { useEffect, useState } from "react";

// 실제 오디오 스트림의 주파수 밴드(0~1) — LiveKit useMultibandTrackVolume의 경량 등가물.
// 마이크 입력·도우미 음성 어느 쪽이든 MediaStream을 주면 말소리에 맞춰 출렁인다.
export function useAudioBands(stream: MediaStream | null, bandCount = 6): number[] {
  const [bands, setBands] = useState<number[]>(() => new Array(bandCount).fill(0));

  useEffect(() => {
    if (!stream) {
      setBands(new Array(bandCount).fill(0));
      return;
    }
    let raf = 0;
    let ctx: AudioContext | null = null;
    let src: MediaStreamAudioSourceNode | null = null;
    let analyser: AnalyserNode | null = null;
    try {
      ctx = new AudioContext();
      ctx.resume().catch(() => {});
      src = ctx.createMediaStreamSource(stream);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);

      const loop = () => {
        analyser!.getByteFrequencyData(data);
        // 말소리 대역(저·중역) 위주로 밴드를 나눈다
        const useful = data.subarray(1, 41);
        const per = Math.max(1, Math.floor(useful.length / bandCount));
        const next: number[] = [];
        for (let i = 0; i < bandCount; i++) {
          let sum = 0;
          for (let j = i * per; j < (i + 1) * per; j++) sum += useful[j] ?? 0;
          next.push(Math.min(1, sum / per / 160));
        }
        setBands(next);
        raf = requestAnimationFrame(loop);
      };
      loop();
    } catch {
      // 분석 불가 — 0 유지(시각화만 잠잠할 뿐 기능엔 영향 없음)
    }
    return () => {
      cancelAnimationFrame(raf);
      try {
        src?.disconnect();
        analyser?.disconnect();
      } catch {}
      ctx?.close().catch(() => {});
    };
  }, [stream, bandCount]);

  return bands;
}
