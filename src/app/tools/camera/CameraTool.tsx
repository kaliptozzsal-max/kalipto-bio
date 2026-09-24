"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  FiCamera,
  FiCrosshair,
  FiDownload,
  FiEye,
  FiShield,
  FiSquare,
  FiTrash2,
  FiVideo,
} from "react-icons/fi";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type CaptureMode = "photo" | "video";
type FacingMode = "user" | "environment";
type CameraStatus = "idle" | "requesting" | "live" | "error";
type VisualFilter = "original" | "red" | "mono";

type PhotoCapture = {
  kind: "photo";
  url: string;
  fileName: string;
  size: number;
  width: number;
  height: number;
  effect: VisualFilter;
};

type VideoCapture = {
  kind: "video";
  url: string;
  fileName: string;
  size: number;
  mimeType: string;
};

type Capture = PhotoCapture | VideoCapture;

const MAX_RECORDING_SECONDS = 60;

const visualFilters: ReadonlyArray<{
  value: VisualFilter;
  label: string;
}> = [
  { value: "original", label: "Original" },
  { value: "red", label: "Red vision" },
  { value: "mono", label: "Monochrome" },
];

const canvasFilters: Record<VisualFilter, string> = {
  original: "none",
  red: "grayscale(1) sepia(1) saturate(6) hue-rotate(315deg) contrast(1.18) brightness(0.76)",
  mono: "grayscale(1) contrast(1.18) brightness(0.82)",
};

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileStamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function localClock() {
  return new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function preferredVideoType() {
  if (typeof MediaRecorder === "undefined") return "";

  return (
    [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4",
    ].find((type) => MediaRecorder.isTypeSupported(type)) ?? ""
  );
}

function cameraErrorMessage(error: unknown) {
  if (!(error instanceof DOMException)) {
    return "The camera could not start. Close other camera apps and try again.";
  }

  switch (error.name) {
    case "NotAllowedError":
    case "SecurityError":
      return "Camera access was blocked. Allow camera permission in your browser settings, then try again.";
    case "NotFoundError":
      return "No camera was found on this device.";
    case "NotReadableError":
    case "AbortError":
      return "The camera is busy or unavailable. Close other apps using it and try again.";
    case "OverconstrainedError":
      return "This camera does not support the requested settings. Try the other camera.";
    default:
      return "The camera could not start. Check browser permission and try again.";
  }
}

export function CameraTool() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const previewUrlRef = useRef<string | null>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const clockTimerRef = useRef<number | null>(null);
  const recordingStartedRef = useRef(0);

  const [mode, setMode] = useState<CaptureMode>("photo");
  const [facingMode, setFacingMode] = useState<FacingMode>("user");
  const [visualFilter, setVisualFilter] = useState<VisualFilter>("red");
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [hudTime, setHudTime] = useState("--:--:--");
  const [capture, setCapture] = useState<Capture | null>(null);
  // getUserMedia only works on HTTPS or localhost. Detect the common phone
  // case of visiting the LAN site over plain http:// so we can explain it.
  // Resolved after mount to keep server and client markup identical.
  const [insecureContext, setInsecureContext] = useState(false);

  useEffect(() => {
    const secure =
      window.isSecureContext ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    // One-time sync of a browser platform value into state after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!secure) setInsecureContext(true);
  }, []);

  const stopRecordingTimer = useCallback(() => {
    if (recordingTimerRef.current !== null) {
      window.clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }, []);

  const stopClock = useCallback(() => {
    if (clockTimerRef.current !== null) {
      window.clearInterval(clockTimerRef.current);
      clockTimerRef.current = null;
    }
  }, []);

  const startClock = useCallback(() => {
    stopClock();
    setHudTime(localClock());
    clockTimerRef.current = window.setInterval(() => {
      setHudTime(localClock());
    }, 1000);
  }, [stopClock]);

  const releaseStream = useCallback(() => {
    const stream = streamRef.current;
    if (stream) {
      for (const track of stream.getTracks()) track.stop();
      streamRef.current = null;
    }

    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const replacePreviewUrl = useCallback((blob: Blob) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const nextUrl = URL.createObjectURL(blob);
    previewUrlRef.current = nextUrl;
    return nextUrl;
  }, []);

  const clearCapture = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setCapture(null);
  }, []);

  useEffect(() => {
    return () => {
      stopRecordingTimer();
      stopClock();

      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.ondataavailable = null;
        recorder.onstop = null;
        recorder.onerror = null;
        recorder.stop();
      }

      const stream = streamRef.current;
      if (stream) {
        for (const track of stream.getTracks()) track.stop();
      }

      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, [stopClock, stopRecordingTimer]);

  async function startCamera(requestedFacing: FacingMode = facingMode) {
    setError(null);

    if (
      !window.isSecureContext &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      setStatus("error");
      setError(
        "Phones block the camera on plain http://. Open this page over HTTPS (run npm run dev:https) or on the computer at localhost.",
      );
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setError("This browser does not support camera access.");
      return;
    }

    setStatus("requesting");
    stopClock();
    releaseStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: requestedFacing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }

      setFacingMode(requestedFacing);
      setStatus("live");
      startClock();
    } catch (caught) {
      releaseStream();
      setStatus("error");
      setError(cameraErrorMessage(caught));
    }
  }

  function stopCamera() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    recorderRef.current = null;
    stopRecordingTimer();
    stopClock();
    setRecording(false);
    setElapsed(0);
    setHudTime("--:--:--");
    releaseStream();
    setStatus("idle");
    setError(null);
  }

  async function changeFacing(next: FacingMode) {
    setFacingMode(next);
    if (status === "live") await startCamera(next);
  }

  async function capturePhoto() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setError("The camera is still loading. Wait a moment and try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");

    if (!context) {
      setError("Your browser could not prepare the photo.");
      return;
    }

    context.filter = canvasFilters[visualFilter];
    if (facingMode === "user") {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.92);
    });

    if (!blob) {
      setError("Your browser could not create the photo.");
      return;
    }

    setError(null);
    setCapture({
      kind: "photo",
      url: replacePreviewUrl(blob),
      fileName: `kalipto-${visualFilter}-photo-${fileStamp()}.jpg`,
      size: blob.size,
      width: canvas.width,
      height: canvas.height,
      effect: visualFilter,
    });
  }

  function startRecording() {
    const stream = streamRef.current;
    if (!stream) {
      setError("Start the camera before recording.");
      return;
    }

    if (typeof MediaRecorder === "undefined") {
      setError("Video recording is not supported in this browser.");
      return;
    }

    try {
      const requestedType = preferredVideoType();
      const recorder = requestedType
        ? new MediaRecorder(stream, { mimeType: requestedType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onerror = () => {
        stopRecordingTimer();
        setRecording(false);
        setError("Recording failed. Stop the camera and try again.");
      };

      recorder.onstop = () => {
        stopRecordingTimer();
        setRecording(false);
        recorderRef.current = null;

        const mimeType = recorder.mimeType || requestedType || "video/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];

        if (blob.size === 0) {
          setError("No video data was captured. Try recording again.");
          return;
        }

        const extension = mimeType.includes("mp4") ? "mp4" : "webm";
        setError(null);
        setCapture({
          kind: "video",
          url: replacePreviewUrl(blob),
          fileName: `kalipto-video-${fileStamp()}.${extension}`,
          size: blob.size,
          mimeType,
        });
      };

      recorder.start(250);
      recordingStartedRef.current = performance.now();
      setError(null);
      setElapsed(0);
      setRecording(true);

      recordingTimerRef.current = window.setInterval(() => {
        const seconds = Math.min(
          MAX_RECORDING_SECONDS,
          Math.floor((performance.now() - recordingStartedRef.current) / 1000),
        );
        setElapsed(seconds);

        if (
          seconds >= MAX_RECORDING_SECONDS &&
          recorderRef.current?.state === "recording"
        ) {
          recorderRef.current.stop();
        }
      }, 250);
    } catch (caught) {
      setRecording(false);
      setError(
        caught instanceof DOMException && caught.name === "NotSupportedError"
          ? "This browser cannot record the camera's video format. Try another browser."
          : "Video recording could not start.",
      );
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current;
    if (recorder?.state === "recording") recorder.stop();
  }

  const cameraLive = status === "live";
  const statusMessage =
    status === "requesting"
      ? "Waiting for camera permission…"
      : recording
        ? "Recording video locally…"
        : cameraLive
          ? "Camera is live. Nothing is being uploaded."
          : status === "error"
            ? "Camera is unavailable."
            : "Camera is off. Permission has not been requested.";

  return (
    <ToolLayout
      title="Camera Lab"
      description="Capture photos with cyber effects or record a short silent video. Every frame stays on your device."
    >
      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-electric-500/20 bg-electric-500/[0.055] p-4 text-[0.8125rem] leading-relaxed text-ink-muted shadow-[inset_0_0_30px_rgba(201,31,54,0.04)]">
        <FiShield aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-electric-300" />
        <p>
          <strong className="font-semibold text-ink">Private by design.</strong>{" "}
          Access starts only after you press a button. Captures remain in browser
          memory until cleared or the page closes. Nothing uploads, and the
          microphone is never requested.
        </p>
      </div>

      {insecureContext ? (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-amber-400/30 bg-amber-400/[0.08] p-4 text-[0.8125rem] leading-relaxed text-amber-100"
        >
          <p className="font-semibold text-amber-200">Camera blocked on this connection.</p>
          <p className="mt-1 text-amber-100/85">
            Browsers only allow the camera over HTTPS or on the computer at
            localhost. You are viewing this over plain http://, so phones will
            refuse access. To use the camera on your phone, run{" "}
            <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-xs text-amber-200">
              npm run dev:https
            </code>{" "}
            and reopen the HTTPS address, or open the page on the computer.
          </p>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,0.65fr)]">
        <section
          aria-label="Camera preview"
          aria-busy={status === "requesting"}
          data-filter={visualFilter}
          data-recording={recording}
          className="camera-monitor relative overflow-hidden rounded-2xl border border-electric-500/25 bg-black shadow-[0_32px_90px_-38px_rgba(201,31,54,0.82)]"
        >
          <div className="relative aspect-video min-h-[15rem] sm:min-h-0">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              aria-label="Live camera preview"
              className={cn(
                "size-full object-cover transition-[opacity,filter] duration-300",
                facingMode === "user" && "-scale-x-100",
                cameraLive ? "opacity-100" : "opacity-0",
              )}
            />

            {!cameraLive ? (
              <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_42%,rgba(201,31,54,0.18),transparent_52%)] p-8 text-center">
                <div>
                  <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-electric-500/30 bg-electric-500/[0.09] text-electric-300 shadow-[0_0_40px_-12px_rgba(201,31,54,0.9)]">
                    <FiEye aria-hidden="true" className="size-7" />
                  </span>
                  <p className="mt-5 font-mono text-xs font-semibold tracking-[0.12em] text-ink uppercase">
                    {status === "requesting"
                      ? "Negotiating camera access…"
                      : "Optical feed offline"}
                  </p>
                  <p className="mt-2 text-xs text-ink-faint">
                    Start the camera to request browser permission.
                  </p>
                </div>
              </div>
            ) : null}

            {cameraLive ? (
              <>
                <div className="camera-scan pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric-300 to-transparent shadow-[0_0_14px_rgba(249,79,97,0.9)]" />
                <span className="pointer-events-none absolute top-4 left-4 size-8 border-t border-l border-electric-300/80" />
                <span className="pointer-events-none absolute top-4 right-4 size-8 border-t border-r border-electric-300/80" />
                <span className="pointer-events-none absolute bottom-4 left-4 size-8 border-b border-l border-electric-300/80" />
                <span className="pointer-events-none absolute right-4 bottom-4 size-8 border-r border-b border-electric-300/80" />

                <div className="camera-target pointer-events-none absolute top-1/2 left-1/2 size-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-electric-300/50 shadow-[0_0_20px_rgba(229,45,67,0.18)]">
                  <span className="absolute top-1/2 -left-4 h-px w-8 -translate-y-1/2 bg-electric-300/60" />
                  <span className="absolute top-1/2 -right-4 h-px w-8 -translate-y-1/2 bg-electric-300/60" />
                  <span className="absolute -top-4 left-1/2 h-8 w-px -translate-x-1/2 bg-electric-300/60" />
                  <span className="absolute -bottom-4 left-1/2 h-8 w-px -translate-x-1/2 bg-electric-300/60" />
                  <FiCrosshair className="absolute top-1/2 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-electric-200/75" />
                </div>
              </>
            ) : null}

            <div className="camera-hud-flicker absolute top-3 left-3 flex items-center gap-2 rounded-lg border border-white/10 bg-black/70 px-2.5 py-1.5 font-mono text-[0.625rem] tracking-[0.1em] text-white/80 uppercase backdrop-blur-md">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  recording
                    ? "animate-pulse bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]"
                    : cameraLive
                      ? "bg-electric-400"
                      : "bg-white/30",
                )}
              />
              {recording ? `REC ${formatDuration(elapsed)}` : "Local feed"}
            </div>

            <div
              aria-hidden="true"
              className="absolute top-3 right-3 rounded-lg border border-white/10 bg-black/70 px-2.5 py-1.5 font-mono text-[0.625rem] tracking-[0.1em] text-electric-100/80 uppercase backdrop-blur-md"
            >
              LOC {hudTime}
            </div>

            <div className="absolute right-3 bottom-3 rounded-lg border border-white/10 bg-black/70 px-2.5 py-1.5 font-mono text-[0.625rem] tracking-[0.08em] text-white/65 uppercase backdrop-blur-md">
              {`${visualFilter} // no upload // silent`}
            </div>
          </div>
        </section>

        <aside className="cyber-card relative overflow-hidden rounded-2xl border border-hairline bg-void-900/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl sm:p-6">
          <div>
            <p className="font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-ink-faint uppercase">
              Capture mode
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2" role="group" aria-label="Capture mode">
              {(["photo", "video"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={mode === option}
                  disabled={recording}
                  onClick={() => setMode(option)}
                  className={cn(
                    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors disabled:opacity-45",
                    mode === option
                      ? "border-electric-500/45 bg-electric-500/13 text-electric-100 shadow-[inset_0_0_18px_rgba(201,31,54,0.08)]"
                      : "border-hairline bg-white/[0.025] text-ink-muted hover:bg-white/[0.055] hover:text-ink",
                  )}
                >
                  {option === "photo" ? (
                    <FiCamera aria-hidden="true" className="size-4" />
                  ) : (
                    <FiVideo aria-hidden="true" className="size-4" />
                  )}
                  {option === "photo" ? "Photo" : "Video"}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-ink-faint uppercase">
              Visual channel
            </p>
            <div className="mt-3 grid grid-cols-3 gap-1.5" role="group" aria-label="Visual filter">
              {visualFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={visualFilter === filter.value}
                  onClick={() => setVisualFilter(filter.value)}
                  className={cn(
                    "min-h-11 rounded-lg border px-2 text-[0.6875rem] font-semibold transition-colors",
                    visualFilter === filter.value
                      ? "border-electric-500/45 bg-electric-500/12 text-electric-100"
                      : "border-hairline bg-black/20 text-ink-faint hover:text-ink",
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            {mode === "video" ? (
              <p className="mt-2 text-[0.6875rem] leading-relaxed text-ink-faint">
                Filter affects the live HUD. Video files preserve the camera source.
              </p>
            ) : (
              <p className="mt-2 text-[0.6875rem] leading-relaxed text-ink-faint">
                Selected effect is baked into downloaded photos.
              </p>
            )}
          </div>

          <div className="mt-6">
            <p className="font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-ink-faint uppercase">
              Optical source
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2" role="group" aria-label="Camera direction">
              {(["user", "environment"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={facingMode === option}
                  disabled={recording || status === "requesting"}
                  onClick={() => void changeFacing(option)}
                  className={cn(
                    "min-h-11 rounded-xl border px-3 text-sm font-medium transition-colors disabled:opacity-45",
                    facingMode === option
                      ? "border-hairline-strong bg-white/[0.07] text-ink"
                      : "border-hairline bg-white/[0.025] text-ink-muted hover:text-ink",
                  )}
                >
                  {option === "user" ? "Front" : "Back"}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-2.5 border-t border-hairline pt-6">
            {!cameraLive ? (
              <Button
                onClick={() => void startCamera()}
                disabled={status === "requesting"}
                iconLeft={<FiEye />}
                className="w-full"
              >
                {status === "requesting" ? "Waiting for permission…" : "Activate optical feed"}
              </Button>
            ) : (
              <>
                {mode === "photo" ? (
                  <Button
                    onClick={() => void capturePhoto()}
                    iconLeft={<FiCamera />}
                    className="w-full"
                  >
                    Capture frame
                  </Button>
                ) : recording ? (
                  <Button
                    onClick={stopRecording}
                    iconLeft={<FiSquare />}
                    className="w-full"
                  >
                    Stop · {formatDuration(elapsed)}
                  </Button>
                ) : (
                  <Button
                    onClick={startRecording}
                    iconLeft={<FiVideo />}
                    className="w-full"
                  >
                    Record channel
                  </Button>
                )}

                <Button
                  onClick={stopCamera}
                  variant="secondary"
                  iconLeft={<FiSquare />}
                  disabled={recording}
                  className="w-full"
                >
                  Terminate feed
                </Button>
              </>
            )}
          </div>

          <div className="mt-5 border-t border-hairline pt-5">
            <p role="status" aria-live="polite" className="text-xs leading-relaxed text-ink-faint">
              {statusMessage}
            </p>
            {mode === "video" ? (
              <p className="mt-2 text-xs leading-relaxed text-ink-faint">
                Silent recording · maximum {MAX_RECORDING_SECONDS} seconds
              </p>
            ) : null}
            {error ? (
              <p role="alert" className="mt-3 rounded-xl border border-red-500/25 bg-red-500/[0.08] p-3 text-xs leading-relaxed text-red-200">
                {error}
              </p>
            ) : null}
          </div>
        </aside>
      </div>

      {capture ? (
        <section
          aria-labelledby="capture-heading"
          className="cyber-card relative mt-6 overflow-hidden rounded-2xl border border-hairline bg-void-900/75 p-5 sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-electric-300 uppercase">
                Local capture ready
              </p>
              <h2 id="capture-heading" className="mt-1.5 text-lg font-semibold text-ink">
                {capture.kind === "photo" ? "Captured frame" : "Recorded channel"}
              </h2>
              <p className="mt-1 text-xs text-ink-faint">
                {capture.kind === "photo"
                  ? `${capture.width} × ${capture.height} · ${capture.effect} effect`
                  : capture.mimeType.split(";")[0]}{" "}
                · {formatBytes(capture.size)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href={capture.url}
                download={capture.fileName}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-electric-500/50 bg-electric-600 px-4 text-sm font-semibold text-white shadow-[0_12px_30px_-16px_rgba(201,31,54,0.9)] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-electric-500 active:translate-y-0"
              >
                <FiDownload aria-hidden="true" className="size-4" />
                Download
              </a>
              <button
                type="button"
                onClick={clearCapture}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-hairline-strong bg-white/[0.04] px-4 text-sm font-semibold text-ink-muted transition-colors hover:bg-white/[0.07] hover:text-ink"
              >
                <FiTrash2 aria-hidden="true" className="size-4" />
                Clear
              </button>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-electric-500/20 bg-black shadow-[inset_0_0_40px_rgba(201,31,54,0.08)]">
            {capture.kind === "photo" ? (
              <Image
                src={capture.url}
                alt={`Photo captured locally with the ${capture.effect} Camera Lab effect`}
                width={capture.width}
                height={capture.height}
                unoptimized
                className="max-h-[32rem] w-full object-contain"
              />
            ) : (
              <video
                src={capture.url}
                controls
                playsInline
                preload="metadata"
                aria-label="Recorded video preview"
                className="max-h-[32rem] w-full bg-black"
              />
            )}
          </div>
        </section>
      ) : null}
    </ToolLayout>
  );
}
