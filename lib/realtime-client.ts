export type RealtimeStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

export interface RealtimeClientOptions {
  onTranscript?: (transcript: string) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: RealtimeStatus) => void;
}

function extractTranscriptFromEvent(data: any): string | null {
  if (!data || typeof data !== "object") return null;

  if (typeof data.transcript === "string" && data.transcript.trim()) {
    return data.transcript.trim();
  }

  if (typeof data.text === "string" && data.text.trim()) {
    return data.text.trim();
  }

  if (data.item && Array.isArray(data.item.content)) {
    const parts: string[] = [];
    for (const part of data.item.content) {
      if (part && typeof part.transcript === "string" && part.transcript.trim()) {
        parts.push(part.transcript.trim());
      } else if (part && typeof part.text === "string" && part.text.trim()) {
        parts.push(part.text.trim());
      }
    }
    if (parts.length > 0) {
      return parts.join(" ");
    }
  }

  if (data.part && typeof data.part.text === "string" && data.part.text.trim()) {
    return data.part.text.trim();
  }

  return null;
}

export class RealtimeClient {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private mediaStream: MediaStream | null = null;
  private transcript: string = "";
  private options: RealtimeClientOptions;

  constructor(options: RealtimeClientOptions = {}) {
    this.options = options;
  }

  public getTranscript(): string {
    return this.transcript;
  }

  public async connect(): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      this.options.onStatusChange?.("connecting");

      // 1. Fetch ephemeral key from server API
      const sessionRes = await fetch("/api/realtime/session", {
        method: "POST",
      });

      if (!sessionRes.ok) {
        const errJson = await sessionRes.json().catch(() => ({}));
        throw new Error(errJson.error || `Session API error ${sessionRes.status}`);
      }

      const sessionData = await sessionRes.json();
      const ephemeralKey =
        sessionData.client_secret?.value ||
        sessionData.client_secret ||
        sessionData.value ||
        sessionData.token;

      if (!ephemeralKey || typeof ephemeralKey !== "string") {
        throw new Error("No client_secret received from /api/realtime/session");
      }

      // 2. Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 3. Create WebRTC PeerConnection
      this.pc = new RTCPeerConnection();

      // Add audio track to peer connection
      const audioTrack = this.mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        this.pc.addTrack(audioTrack, this.mediaStream);
      }

      // Audio playback element if remote track sent
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      this.pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          audioEl.srcObject = event.streams[0];
        }
      };

      // 4. Create Data Channel for events
      this.dc = this.pc.createDataChannel("oai-events");
      this.dc.onopen = () => {
        // Send session.update to enable input audio transcription
        const sessionUpdate = {
          type: "session.update",
          session: {
            input_audio_transcription: {
              model: "whisper-1",
            },
          },
        };
        try {
          this.dc?.send(JSON.stringify(sessionUpdate));
        } catch (e) {
          console.warn("Failed to send session.update on DataChannel open:", e);
        }
      };

      this.dc.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      // 5. Create local SDP offer
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      // 6. Send offer to OpenAI WebRTC endpoint
      let response = await fetch("https://api.openai.com/v1/realtime/calls?model=gpt-realtime", {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!response.ok) {
        // Fallback endpoint URL
        response = await fetch("https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17", {
          method: "POST",
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${ephemeralKey}`,
            "Content-Type": "application/sdp",
          },
        });
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`WebRTC SDP handshake failed (${response.status}): ${errorText}`);
      }

      const answerSdp = await response.text();
      await this.pc.setRemoteDescription({
        type: "answer",
        sdp: answerSdp,
      });

      this.options.onStatusChange?.("connected");
    } catch (err: any) {
      this.disconnect();
      this.options.onStatusChange?.("error");
      const errorObj = err instanceof Error ? err : new Error(String(err));
      this.options.onError?.(errorObj);
      throw errorObj;
    }
  }

  private handleMessage(rawMessage: string) {
    try {
      const data = JSON.parse(rawMessage);
      const eventType = data.type || "";

      if (
        eventType === "conversation.item.input_audio_transcription.completed" ||
        eventType.includes("transcription.completed")
      ) {
        if (data.transcript) {
          this.appendOrSetTranscript(data.transcript);
        }
      } else if (eventType.endsWith(".delta")) {
        if (typeof data.delta === "string") {
          this.transcript += data.delta;
          this.options.onTranscript?.(this.transcript);
        }
      } else if (eventType.endsWith(".done") || eventType === "conversation.item.created") {
        const extracted = extractTranscriptFromEvent(data);
        if (extracted) {
          this.appendOrSetTranscript(extracted);
        }
      } else {
        const genericExtracted = extractTranscriptFromEvent(data);
        if (genericExtracted) {
          this.appendOrSetTranscript(genericExtracted);
        }
      }
    } catch (e) {
      // Ignore parse errors from non-json messages
    }
  }

  private appendOrSetTranscript(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (!this.transcript) {
      this.transcript = trimmed;
    } else if (!this.transcript.includes(trimmed)) {
      this.transcript = `${this.transcript} ${trimmed}`;
    }
    this.options.onTranscript?.(this.transcript);
  }

  public disconnect(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.dc) {
      try {
        this.dc.close();
      } catch {}
      this.dc = null;
    }
    if (this.pc) {
      try {
        this.pc.close();
      } catch {}
      this.pc = null;
    }
    this.options.onStatusChange?.("disconnected");
  }
}
