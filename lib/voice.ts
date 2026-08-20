// 시리형 음성대화의 공용 빌딩블록.
// - playTts(text): 서버 TTS(mp3)를 재생하고 끝날 때까지 기다린다. 자동재생 차단 등으로
//   못 틀면 false — 호출부는 텍스트가 이미 보이므로 조용히 넘어가면 된다.
// - listenOnce(): 마이크를 열고 말이 끝나는 순간(침묵 지속)을 감지해 자동으로 녹음을
//   끝낸 뒤 Whisper 전사 결과를 돌려준다. finish()로 수동 종료, cancel()로 폐기.

export async function playTts(text: string): Promise<boolean> {
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return false;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    return await new Promise<boolean>((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve(true);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(false);
      };
      audio.play().catch(() => {
        URL.revokeObjectURL(url);
        resolve(false);
      });
    });
  } catch {
    return false;
  }
}

export interface ListenResult {
  transcript: string;
  /** 이 기기에서 침묵 감지가 불가능했다(자동 대화 모드 비권장 신호) */
  noVad?: boolean;
  /** 마이크 자체를 못 열었다(권한 거부 등) */
  micDenied?: boolean;
}

export interface ListenHandle {
  /** 지금까지 녹음분을 전사해서 promise를 끝낸다 (수동 "다 말했어요") */
  finish: () => void;
  /** 전사 없이 폐기한다 (페이지 이탈 등) */
  cancel: () => void;
  promise: Promise<ListenResult>;
  /** 말이 실제로 감지되기 시작했는지 등 상태 표시용 */
  onSpeech?: () => void;
}

interface ListenOptions {
  /** 말이 끝났다고 판정할 침묵 길이(ms) */
  silenceMs?: number;
  /** 안전 상한(ms) — 이 시간이 지나면 무조건 종료 */
  maxMs?: number;
  onSpeechStart?: () => void;
  onTranscribing?: () => void;
}

// ponytail: RMS 고정 임계값 — 환경소음이 큰 곳에선 오탐할 수 있다. 문제 되면 첫 0.5초
// 평균소음 기반 적응 임계값으로 올린다.
const SPEECH_RMS = 6;

export function listenOnce(opts: ListenOptions = {}): ListenHandle {
  const silenceMs = opts.silenceMs ?? 1800;
  const maxMs = opts.maxMs ?? 30000;

  let recorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  let audioCtx: AudioContext | null = null;
  let vadTimer: ReturnType<typeof setInterval> | null = null;
  let maxTimer: ReturnType<typeof setTimeout> | null = null;
  let cancelled = false;
  let finishRequested = false;
  let noVad = false;

  let resolvePromise!: (r: ListenResult) => void;
  const promise = new Promise<ListenResult>((resolve) => {
    resolvePromise = resolve;
  });

  const cleanup = () => {
    if (vadTimer) clearInterval(vadTimer);
    if (maxTimer) clearTimeout(maxTimer);
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    if (audioCtx) {
      audioCtx.close().catch(() => {});
      audioCtx = null;
    }
  };

  const stopRecorder = () => {
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  };

  (async () => {
    try {
      const chunks: Blob[] = [];
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (cancelled) {
        cleanup();
        resolvePromise({ transcript: "" });
        return;
      }

      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const mime = recorder?.mimeType || "audio/webm";
        cleanup();
        if (cancelled) {
          resolvePromise({ transcript: "", noVad });
          return;
        }
        const blob = new Blob(chunks, { type: mime });
        if (blob.size === 0) {
          resolvePromise({ transcript: "", noVad });
          return;
        }
        opts.onTranscribing?.();
        try {
          const formData = new FormData();
          formData.append("file", blob, "recording");
          const res = await fetch("/api/transcribe", { method: "POST", body: formData });
          if (!res.ok) throw new Error("transcribe failed");
          const data = await res.json();
          resolvePromise({ transcript: (data.transcript || "").trim(), noVad });
        } catch {
          resolvePromise({ transcript: "", noVad });
        }
      };

      // 침묵 감지(VAD): WebAudio로 입력 볼륨을 관찰한다.
      let sawSpeech = false;
      let lastVoiceAt = Date.now();
      try {
        audioCtx = new AudioContext();
        if (audioCtx.state === "suspended") {
          await audioCtx.resume().catch(() => {});
        }
        if (audioCtx.state !== "running") {
          noVad = true;
        } else {
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 2048;
          source.connect(analyser);
          const buf = new Uint8Array(analyser.fftSize);

          vadTimer = setInterval(() => {
            analyser.getByteTimeDomainData(buf);
            let sum = 0;
            for (let i = 0; i < buf.length; i++) {
              const d = buf[i] - 128;
              sum += d * d;
            }
            const rms = Math.sqrt(sum / buf.length);
            if (rms > SPEECH_RMS) {
              if (!sawSpeech) {
                sawSpeech = true;
                opts.onSpeechStart?.();
              }
              lastVoiceAt = Date.now();
            } else if (sawSpeech && Date.now() - lastVoiceAt > silenceMs) {
              finishRequested = true;
              stopRecorder();
            }
          }, 100);
        }
      } catch {
        noVad = true;
      }

      maxTimer = setTimeout(() => {
        finishRequested = true;
        stopRecorder();
      }, maxMs);

      recorder.start();
      if (finishRequested || cancelled) stopRecorder();
    } catch {
      cleanup();
      resolvePromise({ transcript: "", noVad: true, micDenied: true });
    }
  })();

  return {
    finish: () => {
      finishRequested = true;
      stopRecorder();
    },
    cancel: () => {
      cancelled = true;
      stopRecorder();
      cleanup();
    },
    promise,
  };
}
