// 시리형 음성대화의 공용 빌딩블록.
// - playTts(text): 서버 TTS(mp3)를 재생하고 끝날 때까지 기다린다.
// - listenOnce(): 하이브리드 듣기 — 마이크를 열면 녹음(Whisper용)과 브라우저 내장
//   음성인식(실시간 자막용)을 "동시에" 돌린다. 내장인식이 글자를 주면 그걸 쓰고(빠름),
//   못 주면(Arc/Brave 등 백엔드 없는 크로미움, iOS 받아쓰기 꺼짐) 침묵 감지가 끝을
//   잡아 녹음본을 Whisper로 변환한다. 어느 한쪽이 죽어도 인식은 동작한다.

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

// 자동재생 정책 대응: 버튼 클릭 등 제스처 핸들러 안에서 unlockAudio()를 한 번 불러
// 공유 오디오 엘리먼트와 AudioContext를 해금해두면, 이후 제스처 없는 시점(질문 자동
// 낭독, 침묵감지)에도 동작한다. SPA 소프트 내비게이션이라 모듈 스코프가 유지된다.
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
      // 일부 브라우저는 자연 종료 때 pause를 ended보다 먼저 쏘므로 한 틱 미룬다.
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
  /** 이 기기에서 침묵 감지가 불가능했다(자동 종료 안 됨 — 버튼 종료 필요) */
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
  /** 진단용 — 엔진 이벤트·오류 코드를 짧은 문자열로 알려준다 */
  onDebug?: (msg: string) => void;
}

// ponytail: RMS 고정 임계값 — 환경소음이 큰 곳에선 오탐할 수 있다. 문제 되면 첫 0.5초
// 평균소음 기반 적응 임계값으로 올린다.
const SPEECH_RMS = 6;

export function listenOnce(opts: ListenOptions = {}): ListenHandle {
  const silenceMs = opts.silenceMs ?? 1800;
  const maxMs = opts.maxMs ?? 30000;
  const debug = (m: string) => opts.onDebug?.(m);

  let resolvePromise!: (r: ListenResult) => void;
  const promise = new Promise<ListenResult>((resolve) => {
    resolvePromise = resolve;
  });

  // ---- 공통 상태 ----
  let cancelled = false;
  let finishing = false;
  let settled = false;
  let sawSpeech = false; // SR 결과 또는 VAD 중 아무거나
  let lastVoiceAt = Date.now();
  let micDenied = false;
  let noVad = false;

  // ---- SR(내장인식) 상태 ----
  let srFinal = "";
  let srInterim = "";
  let rec: any = null;
  let srActive = false;

  // ---- 녹음 상태 ----
  let recorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  let chunks: Blob[] = [];
  let recordedBlob: Blob | null = null;
  let audioCtx: AudioContext | null = null;
  let usingSharedCtx = false;
  let vadSource: MediaStreamAudioSourceNode | null = null;
  let vadAnalyser: AnalyserNode | null = null;

  let vadTimer: ReturnType<typeof setInterval> | null = null;
  let maxTimer: ReturnType<typeof setTimeout> | null = null;

  const markSpeech = () => {
    lastVoiceAt = Date.now();
    if (!sawSpeech) {
      sawSpeech = true;
      opts.onSpeechStart?.();
    }
  };

  const cleanup = () => {
    if (vadTimer) clearInterval(vadTimer);
    if (maxTimer) clearTimeout(maxTimer);
    vadTimer = null;
    maxTimer = null;
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
      if (!usingSharedCtx) audioCtx.close().catch(() => {});
      audioCtx = null;
    }
  };

  /** 최종 판정: 내장인식 텍스트 우선, 없으면 녹음본을 Whisper로 */
  const settle = async () => {
    if (settled) return;
    settled = true;
    cleanup();
    if (cancelled) {
      resolvePromise({ transcript: "" });
      return;
    }
    const srText = (srFinal + " " + srInterim).trim();
    if (srText) {
      debug("내장인식 결과 사용");
      resolvePromise({ transcript: srText, noVad, micDenied });
      return;
    }
    if (recordedBlob && recordedBlob.size > 0) {
      opts.onTranscribing?.();
      debug(`녹음 완료(${Math.round(recordedBlob.size / 1024)}KB) → 변환 중`);
      try {
        const formData = new FormData();
        formData.append("file", recordedBlob, "recording");
        const res = await fetch("/api/transcribe", { method: "POST", body: formData });
        if (!res.ok) throw new Error("transcribe failed");
        const data = await res.json();
        const text = (data.transcript || "").trim();
        debug(text ? "변환 성공" : "변환 결과 비어있음");
        resolvePromise({ transcript: text, noVad, micDenied });
      } catch {
        debug("변환 요청 실패");
        resolvePromise({ transcript: "", noVad, micDenied });
      }
      return;
    }
    resolvePromise({ transcript: "", noVad, micDenied });
  };

  /** 듣기 종료 절차 — 녹음이 돌고 있으면 blob을 모은 뒤 판정한다 */
  const finishAll = () => {
    if (finishing || settled) return;
    finishing = true;
    if (vadTimer) clearInterval(vadTimer);
    if (maxTimer) clearTimeout(maxTimer);
    if (srActive) {
      try {
        rec.stop();
      } catch {}
    }
    if (recorder && recorder.state !== "inactive") {
      recorder.stop(); // onstop → recordedBlob 조립 → settle()
    } else {
      settle();
    }
  };

  // ---- 1) 내장인식(있으면) — 실시간 자막 담당 ----
  const SR =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : undefined;
  if (SR) {
    try {
      rec = new SR();
      rec.lang = "ko-KR";
      rec.continuous = true;
      rec.interimResults = true;

      let firstResult = true;
      rec.onresult = (event: any) => {
        srInterim = "";
        srFinal = "";
        for (let i = 0; i < event.results.length; i++) {
          const r = event.results[i];
          if (r.isFinal) srFinal += r[0].transcript;
          else srInterim += r[0].transcript;
        }
        const combined = (srFinal + " " + srInterim).trim();
        if (combined) {
          if (firstResult) {
            firstResult = false;
            debug("내장인식: 음성 감지됨");
          }
          markSpeech();
          opts.onPartial?.(combined);
        }
      };
      rec.onerror = (event: any) => {
        const err = event?.error;
        if (err && err !== "no-speech" && err !== "aborted") {
          debug("내장인식 오류: " + err + " (녹음으로 계속)");
        }
        // 녹음이 병행 중이므로 여기서 세션을 끝내지 않는다
        srActive = false;
      };
      rec.onend = () => {
        srActive = false;
        // 내장인식이 스스로 침묵을 감지하고 글자를 확보한 채 끝났으면 그걸로 종료
        if (!finishing && !settled && (srFinal + srInterim).trim()) {
          finishAll();
        }
        // 글자 없이 끝났으면(no-speech/백엔드 없음) 녹음+VAD가 계속 담당
      };
      rec.start();
      srActive = true;
      debug("내장인식 시작");
    } catch {
      srActive = false;
      debug("내장인식 시작 실패 (녹음으로 계속)");
    }
  }

  // ---- 2) 녹음 + 침묵감지 — 항상 병행 (Whisper 폴백의 원본) ----
  (async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (cancelled || settled) {
        cleanup();
        return;
      }

      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        recordedBlob = new Blob(chunks, { type: recorder?.mimeType || "audio/webm" });
        if (finishing) settle();
      };
      recorder.start();
      debug("녹음 시작");

      // 침묵 감지(VAD)
      try {
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
          debug("침묵감지 불가 — 버튼으로 끝내주세요");
        } else {
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 2048;
          source.connect(analyser);
          vadSource = source;
          vadAnalyser = analyser;
          const buf = new Uint8Array(analyser.fftSize);
          let vadSaw = false;

          vadTimer = setInterval(() => {
            analyser.getByteTimeDomainData(buf);
            let sum = 0;
            for (let i = 0; i < buf.length; i++) {
              const d = buf[i] - 128;
              sum += d * d;
            }
            const rms = Math.sqrt(sum / buf.length);
            if (rms > SPEECH_RMS) {
              if (!vadSaw) {
                vadSaw = true;
                debug("마이크: 음성 감지됨");
              }
              markSpeech();
            } else if (sawSpeech && Date.now() - lastVoiceAt > silenceMs) {
              finishAll();
            }
          }, 100);
        }
      } catch {
        noVad = true;
        debug("침묵감지 불가 — 버튼으로 끝내주세요");
      }

      if (finishing) recorder.stop();
    } catch {
      // 마이크를 못 열었다 — 내장인식이 살아있으면 그쪽 단독으로 계속
      if (srActive) {
        debug("녹음 불가 — 내장인식만 사용");
        // 내장인식 단독 모드: onend가 세션 종료를 담당하도록 승격
        const prevOnEnd = rec.onend;
        rec.onend = () => {
          prevOnEnd?.();
          if (!finishing && !settled) finishAll();
        };
      } else {
        micDenied = true;
        debug("마이크 열기 실패(권한 확인)");
        finishAll();
      }
    }
  })();

  maxTimer = setTimeout(() => finishAll(), maxMs);

  return {
    finish: () => finishAll(),
    cancel: () => {
      cancelled = true;
      if (srActive) {
        try {
          rec.abort();
        } catch {}
        srActive = false;
      }
      if (recorder && recorder.state !== "inactive") {
        try {
          recorder.stop();
        } catch {}
      }
      cleanup();
      if (!settled) {
        settled = true;
        resolvePromise({ transcript: "" });
      }
    },
    promise,
  };
}
