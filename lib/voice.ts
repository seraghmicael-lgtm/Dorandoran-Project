// 시리형 음성대화의 공용 빌딩블록.
// - playTts(text): 서버 TTS(mp3)를 재생하고 끝날 때까지 기다린다. 자동재생 차단 등으로
//   못 틀면 false — 호출부는 텍스트가 이미 보이므로 조용히 넘어가면 된다.
// - listenOnce(): 말을 실시간 텍스트로 받아적고(onPartial), 말이 끝나면(침묵 지속)
//   자동으로 최종 전사를 돌려준다. 브라우저 내장 SpeechRecognition(실시간 자막)을
//   우선 쓰고, 미지원이면 MediaRecorder+Whisper로 폴백한다(자막 없이 최종 전사만).

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

// 자동재생 정책 대응: 브라우저는 사용자 제스처 없이 시작된 오디오 재생과 AudioContext를
// 차단한다. 버튼 클릭 등 제스처 핸들러 안에서 unlockAudio()를 한 번 불러 공유 오디오
// 엘리먼트와 AudioContext를 "해금"해두면, 이후 제스처 없는 시점(질문 자동 낭독,
// 침묵감지)에도 동작한다. SPA 소프트 내비게이션이라 모듈 스코프가 화면 간 유지된다.
let sharedAudio: HTMLAudioElement | null = null;
let sharedCtx: AudioContext | null = null;
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";

export function unlockAudio() {
  try {
    if (!sharedAudio) sharedAudio = new Audio();
    sharedAudio.src = SILENT_WAV;
    const p = sharedAudio.play();
    if (p) p.then(() => sharedAudio?.pause()).catch(() => {});
  } catch {}
  try {
    if (!sharedCtx) sharedCtx = new AudioContext();
    if (sharedCtx.state === "suspended") sharedCtx.resume().catch(() => {});
  } catch {}
}

export function getSharedCtx(): AudioContext | null {
  return sharedCtx;
}

export function stopTts() {
  try {
    sharedAudio?.pause();
  } catch {}
}

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
    if (!sharedAudio) sharedAudio = new Audio();
    const audio = sharedAudio;
    audio.src = url;
    return await new Promise<boolean>((resolve) => {
      const done = (ok: boolean) => {
        audio.onended = null;
        audio.onerror = null;
        audio.onpause = null;
        URL.revokeObjectURL(url);
        resolve(ok);
      };
      audio.onended = () => done(true);
      audio.onerror = () => done(false);
      // stopTts()로 중단됐을 때도 promise가 매달리지 않게 한다.
      // 일부 브라우저는 자연 종료 때 pause를 ended보다 먼저 쏘므로 한 틱 미룬 뒤 판정한다.
      audio.onpause = () => {
        setTimeout(() => done(audio.ended), 0);
      };
      audio.play().catch(() => done(false));
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
  /** 지금까지 들은 내용으로 promise를 끝낸다 (수동 "다 말했어요") */
  finish: () => void;
  /** 폐기한다 (페이지 이탈 등) */
  cancel: () => void;
  promise: Promise<ListenResult>;
}

interface ListenOptions {
  /** 말이 끝났다고 판정할 침묵 길이(ms) */
  silenceMs?: number;
  /** 안전 상한(ms) — 이 시간이 지나면 무조건 종료 */
  maxMs?: number;
  /** 실시간 자막 — 말하는 도중 지금까지 인식된 문장을 계속 준다 */
  onPartial?: (text: string) => void;
  onSpeechStart?: () => void;
  onTranscribing?: () => void;
  /** 진단용 — 엔진 선택·이벤트·오류 코드를 짧은 문자열로 알려준다 */
  onDebug?: (msg: string) => void;
}

export function listenOnce(opts: ListenOptions = {}): ListenHandle {
  const SR =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : undefined;
  if (SR) return listenViaSpeechRecognition(SR, opts);
  return listenViaRecorder(opts);
}

/** 브라우저 내장 실시간 음성인식 — 말하는 즉시 텍스트가 나온다 */
function listenViaSpeechRecognition(SR: any, opts: ListenOptions): ListenHandle {
  const silenceMs = opts.silenceMs ?? 1800;
  const maxMs = opts.maxMs ?? 30000;

  let resolvePromise!: (r: ListenResult) => void;
  const promise = new Promise<ListenResult>((resolve) => {
    resolvePromise = resolve;
  });

  let finalText = "";
  let interimText = "";
  let sawSpeech = false;
  let lastResultAt = Date.now();
  let cancelled = false;
  let settled = false;
  let micDenied = false;
  let fallback: ListenHandle | null = null;

  const rec = new SR();
  rec.lang = "ko-KR";
  rec.continuous = true;
  rec.interimResults = true;

  let silenceTimer: ReturnType<typeof setInterval> | null = null;
  let maxTimer: ReturnType<typeof setTimeout> | null = null;

  const settle = () => {
    if (settled) return;
    settled = true;
    if (silenceTimer) clearInterval(silenceTimer);
    if (maxTimer) clearTimeout(maxTimer);
    const transcript = cancelled ? "" : (finalText + " " + interimText).trim();
    resolvePromise({ transcript, micDenied });
  };

  /** 내장 인식이 서비스 문제로 못 쓰이면(iOS 받아쓰기 꺼짐, 네트워크 등)
   *  같은 handle 그대로 녹음+Whisper 경로로 갈아탄다 */
  const fallbackToRecorder = () => {
    if (settled || fallback || cancelled) return;
    settled = true;
    if (silenceTimer) clearInterval(silenceTimer);
    if (maxTimer) clearTimeout(maxTimer);
    try {
      rec.abort();
    } catch {}
    opts.onDebug?.("녹음+변환 방식으로 전환");
    fallback = listenViaRecorder(opts);
    fallback.promise.then(resolvePromise);
  };

  let resultCount = 0;
  rec.onresult = (event: any) => {
    interimText = "";
    finalText = "";
    for (let i = 0; i < event.results.length; i++) {
      const r = event.results[i];
      if (r.isFinal) finalText += r[0].transcript;
      else interimText += r[0].transcript;
    }
    const combined = (finalText + " " + interimText).trim();
    if (combined) {
      if (!sawSpeech) {
        sawSpeech = true;
        opts.onSpeechStart?.();
      }
      lastResultAt = Date.now();
      resultCount++;
      if (resultCount === 1) opts.onDebug?.("내장인식: 음성 감지됨");
      opts.onPartial?.(combined);
    }
  };

  rec.onerror = (event: any) => {
    const err = event?.error;
    opts.onDebug?.("내장인식 오류: " + err);
    if (
      err === "not-allowed" ||
      err === "audio-capture" ||
      err === "service-not-allowed" ||
      err === "network" ||
      err === "language-not-supported"
    ) {
      // 일부 사파리는 제스처 없이 start()하면 not-allowed를 던진다(실제 권한 거부 아님).
      // 녹음 경로로 갈아타서 진짜 마이크 거부인지 그쪽에서 판별하게 한다.
      fallbackToRecorder();
    }
    // "no-speech" 등은 onend 가 이어서 처리한다
  };

  rec.onend = () => {
    // 브라우저가 스스로 끝냈든(자체 침묵 감지) 우리가 stop() 했든 여기로 온다
    if (!settled) opts.onDebug?.("내장인식 종료" + (sawSpeech ? "" : " (음성 감지 없음)"));
    settle();
  };

  silenceTimer = setInterval(() => {
    if (sawSpeech && Date.now() - lastResultAt > silenceMs) {
      try {
        rec.stop();
      } catch {
        settle();
      }
    }
  }, 200);

  maxTimer = setTimeout(() => {
    try {
      rec.stop();
    } catch {
      settle();
    }
  }, maxMs);

  opts.onDebug?.("내장인식 시작");
  try {
    rec.start();
  } catch {
    opts.onDebug?.("내장인식 시작 실패");
    fallbackToRecorder();
  }

  return {
    finish: () => {
      if (fallback) {
        fallback.finish();
        return;
      }
      try {
        rec.stop();
      } catch {
        settle();
      }
    },
    cancel: () => {
      cancelled = true;
      if (fallback) {
        fallback.cancel();
        return;
      }
      try {
        rec.abort();
      } catch {
        settle();
      }
      settle();
    },
    promise,
  };
}

// ponytail: RMS 고정 임계값 — 환경소음이 큰 곳에선 오탐할 수 있다. 문제 되면 첫 0.5초
// 평균소음 기반 적응 임계값으로 올린다.
const SPEECH_RMS = 6;

/** 폴백: 녹음 후 Whisper 일괄 전사 (실시간 자막 없음) */
function listenViaRecorder(opts: ListenOptions): ListenHandle {
  const silenceMs = opts.silenceMs ?? 1800;
  const maxMs = opts.maxMs ?? 30000;

  let recorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  let audioCtx: AudioContext | null = null;
  let usingSharedCtx = false;
  let vadSource: MediaStreamAudioSourceNode | null = null;
  let vadAnalyser: AnalyserNode | null = null;
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
    try {
      vadSource?.disconnect();
      vadAnalyser?.disconnect();
    } catch {}
    vadSource = null;
    vadAnalyser = null;
    if (audioCtx) {
      // 공유 컨텍스트는 다음 듣기에서 재사용하므로 닫지 않는다
      if (!usingSharedCtx) audioCtx.close().catch(() => {});
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
        opts.onDebug?.(`녹음 완료(${Math.round(blob.size / 1024)}KB) → 변환 중`);
        try {
          const formData = new FormData();
          formData.append("file", blob, "recording");
          const res = await fetch("/api/transcribe", { method: "POST", body: formData });
          if (!res.ok) throw new Error("transcribe failed");
          const data = await res.json();
          const text = (data.transcript || "").trim();
          opts.onDebug?.(text ? "변환 성공" : "변환 결과 비어있음");
          resolvePromise({ transcript: text, noVad });
        } catch {
          opts.onDebug?.("변환 요청 실패");
          resolvePromise({ transcript: "", noVad });
        }
      };

      // 침묵 감지(VAD): WebAudio로 입력 볼륨을 관찰한다.
      // unlockAudio()로 해금된 공유 컨텍스트가 있으면 그걸 쓴다(자동재생 정책 회피).
      let sawSpeech = false;
      let lastVoiceAt = Date.now();
      try {
        // 공유 컨텍스트가 있으면 suspended여도 그걸 쓴다 — 제스처 직후라면
        // resume이 이 안에서 성공한다(상태 검사를 resume보다 먼저 하면 레이스로 죽음)
        const shared = getSharedCtx();
        if (shared) {
          audioCtx = shared;
          usingSharedCtx = true;
        } else {
          audioCtx = new AudioContext();
        }
        if (audioCtx.state === "suspended") {
          await audioCtx.resume().catch(() => {});
        }
        if (audioCtx.state !== "running") {
          noVad = true;
          opts.onDebug?.("녹음: 침묵감지 불가(버튼으로 종료)");
        } else {
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 2048;
          source.connect(analyser);
          vadSource = source;
          vadAnalyser = analyser;
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
                opts.onDebug?.("녹음: 음성 감지됨");
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
      opts.onDebug?.("녹음 시작");
      if (finishRequested || cancelled) stopRecorder();
    } catch {
      opts.onDebug?.("마이크 열기 실패(권한 확인)");
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
