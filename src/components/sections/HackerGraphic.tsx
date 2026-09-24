"use client";

import { useEffect, useRef } from "react";

/**
 * HackerGraphic
 *
 * A large, deliberately menacing animated hacker motif for the dark-web prank
 * theme. Pure SVG + CSS, so it costs no image bytes and no extra dependency.
 *
 * Depth is built by stacking real layers rather than faking one flat shape:
 *   backdrop glow -> code rain -> cloak (with folds) -> hood shell -> rim light
 *   -> hood inner shadow -> face void -> brow shadow -> tracking eyes
 *   -> tech mask -> circuit tracery -> blood -> scanlines -> vignette
 *
 * Eyes track the pointer. The offset is written to CSS custom properties on a
 * ref instead of React state, so pointer movement never triggers a re-render —
 * the browser just retargets a compositor transform.
 *
 * Pass `imageSrc` to swap the drawn figure for a real image (e.g. a PNG you
 * generated elsewhere and dropped in `public/`). Every atmospheric layer —
 * glow, rain, blood, glitch, scanlines — still renders around it.
 */
export function HackerGraphic({
  className = "",
  imageSrc,
  imageAlt = "",
}: {
  className?: string;
  /** Optional real image (e.g. "/hacker.png") to use instead of the drawn figure. */
  imageSrc?: string;
  imageAlt?: string;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);

  /*
   * Pointer-tracking eyes.
   *
   * Skipped entirely on coarse pointers (no hover to track) and for users who
   * asked for reduced motion. Updates are coalesced into one rAF per frame and
   * written as CSS variables, so this never re-renders React or touches layout.
   */
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || calm.matches) return;

    let frame = 0;
    let pending: { x: number; y: number } | null = null;

    const apply = () => {
      frame = 0;
      if (!pending) return;
      const rect = scene.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      // Normalised -1..1 offset from the centre of the graphic.
      const nx = (pending.x - (rect.left + rect.width / 2)) / (rect.width / 2);
      const ny = (pending.y - (rect.top + rect.height / 2)) / (rect.height / 2);

      // Clamped so the pupils stay inside the eye shape.
      const cx = Math.max(-1, Math.min(1, nx));
      const cy = Math.max(-1, Math.min(1, ny));

      scene.style.setProperty("--hx-eye-x", `${cx * 7}px`);
      scene.style.setProperty("--hx-eye-y", `${cy * 4}px`);
      // The head leans very slightly toward the cursor for a "watching" feel.
      scene.style.setProperty("--hx-tilt-y", `${cx * 8}deg`);
      scene.style.setProperty("--hx-tilt-x", `${-cy * 5}deg`);
      pending = null;
    };

    const onMove = (event: PointerEvent) => {
      pending = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      scene.style.setProperty("--hx-eye-x", "0px");
      scene.style.setProperty("--hx-eye-y", "0px");
      scene.style.setProperty("--hx-tilt-y", "0deg");
      scene.style.setProperty("--hx-tilt-x", "0deg");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={sceneRef}
      aria-hidden={imageSrc ? undefined : "true"}
      className={`hx-scene pointer-events-none select-none ${className}`}
    >
      <style>{HX_STYLES}</style>

      {/* Ambient glow pools */}
      <div className="hx-glow hx-glow-a" />
      <div className="hx-glow hx-glow-b" />

      {/* Dense matrix code rain */}
      <div className="hx-rain">
        {RAIN_COLUMNS.map((col, i) => (
          <span
            key={i}
            className="hx-rain-col"
            style={{
              left: `${col.left}%`,
              animationDuration: `${col.dur}s`,
              animationDelay: `${col.delay}s`,
              opacity: col.opacity,
              fontSize: `${col.size}px`,
            }}
          >
            {col.chars}
          </span>
        ))}
      </div>

      {/* 3D stage */}
      <div className="hx-stage">
        <div className="hx-float">
          <div className="hx-lean">
            <div className="hx-glitch">
              {imageSrc ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={imageSrc} alt={imageAlt} className="hx-photo" />
              ) : (
                <HackerFigure />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Thick, slow, viscous blood */}
      <div className="hx-blood">
        {BLOOD_DRIPS.map((d, i) => (
          <span
            key={i}
            className="hx-drip"
            style={{
              left: `${d.left}%`,
              width: `${d.width}px`,
              animationDuration: `${d.dur}s`,
              animationDelay: `${d.delay}s`,
              ["--hx-run" as string]: `${d.height}px`,
            }}
          >
            <span className="hx-drop" />
          </span>
        ))}
      </div>

      <div className="hx-scan" />
      <div className="hx-vignette" />
    </div>
  );
}

/* ---- the drawn figure ---------------------------------------------------- */

function HackerFigure() {
  return (
    <svg viewBox="0 0 360 440" className="hx-figure" role="presentation">
      <defs>
        {/* Cloth: lit from top-left, falling into pure black */}
        <linearGradient id="hxCloth" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#4a0a0a" />
          <stop offset="35%" stopColor="#1e0303" />
          <stop offset="75%" stopColor="#0a0101" />
          <stop offset="100%" stopColor="#020000" />
        </linearGradient>
        {/* Rim light along the hood edge */}
        <linearGradient id="hxRim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff6b6b" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#e60000" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#450000" stopOpacity="0.15" />
        </linearGradient>
        {/* The void inside the hood */}
        <radialGradient id="hxVoid" cx="50%" cy="34%" r="70%">
          <stop offset="0%" stopColor="#2a0505" />
          <stop offset="45%" stopColor="#0c0101" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <radialGradient id="hxIris" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="28%" stopColor="#ffd0d0" />
          <stop offset="58%" stopColor="#ff2d2d" />
          <stop offset="100%" stopColor="#7a0000" />
        </radialGradient>
        <filter id="hxEyeGlow" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="hxSoftShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>

      {/* ---- Cloak ---- */}
      <path
        d="M22 438 C34 344 84 292 180 292 C276 292 326 344 338 438 Z"
        fill="url(#hxCloth)"
      />
      {/* Cloak folds: alternating light catch and deep crease */}
      <g fill="none" strokeLinecap="round">
        <path d="M96 318 C88 356 92 400 82 436" stroke="#5c0d0d" strokeOpacity="0.55" strokeWidth="3" />
        <path d="M264 318 C272 356 268 400 278 436" stroke="#5c0d0d" strokeOpacity="0.55" strokeWidth="3" />
        <path d="M132 302 C124 348 128 396 120 436" stroke="#000000" strokeOpacity="0.6" strokeWidth="5" />
        <path d="M228 302 C236 348 232 396 240 436" stroke="#000000" strokeOpacity="0.6" strokeWidth="5" />
        <path d="M180 296 V436" stroke="#000000" strokeOpacity="0.5" strokeWidth="6" />
      </g>
      {/* Shoulder rim light */}
      <path
        d="M22 438 C34 344 84 292 180 292"
        fill="none"
        stroke="url(#hxRim)"
        strokeWidth="2.4"
        strokeOpacity="0.7"
      />

      {/* ---- Hood outer shell ---- */}
      <path
        d="M180 26 C116 26 76 78 70 152 C66 206 82 254 106 284 C130 312 154 320 180 320 C206 320 230 312 254 284 C278 254 294 206 290 152 C284 78 244 26 180 26 Z"
        fill="url(#hxCloth)"
      />
      {/* Hood cloth folds */}
      <g fill="none" strokeLinecap="round">
        <path d="M104 92 C88 132 86 186 100 232" stroke="#000000" strokeOpacity="0.55" strokeWidth="6" />
        <path d="M256 92 C272 132 274 186 260 232" stroke="#000000" strokeOpacity="0.55" strokeWidth="6" />
        <path d="M180 30 C150 44 132 74 126 110" stroke="#5c0d0d" strokeOpacity="0.5" strokeWidth="3" />
      </g>
      {/* Hood rim light — the single strongest cue that this is 3D */}
      <path
        d="M180 26 C116 26 76 78 70 152 C66 206 82 254 106 284"
        fill="none"
        stroke="url(#hxRim)"
        strokeWidth="3"
      />
      <path
        d="M180 26 C244 26 284 78 290 152 C294 206 278 254 254 284"
        fill="none"
        stroke="url(#hxRim)"
        strokeWidth="2"
        strokeOpacity="0.45"
      />

      {/* ---- Hood opening: soft shadow ring then the void ---- */}
      <path
        d="M180 70 C128 70 102 130 108 192 C112 244 142 282 180 282 C218 282 248 244 252 192 C258 130 232 70 180 70 Z"
        fill="#000000"
        opacity="0.85"
        filter="url(#hxSoftShadow)"
      />
      <path
        d="M180 76 C132 76 108 132 113 190 C117 238 144 274 180 274 C216 274 243 238 247 190 C252 132 228 76 180 76 Z"
        fill="url(#hxVoid)"
      />

      {/* Brow shadow — makes the stare read as a scowl */}
      <path
        d="M120 146 C140 132 220 132 240 146 C232 138 208 130 180 130 C152 130 128 138 120 146 Z"
        fill="#000000"
        opacity="0.9"
      />

      {/* ---- Eyes (tracking group) ---- */}
      <g className="hx-eyes">
        {/* eye sockets, angled inward for menace */}
        <g filter="url(#hxEyeGlow)">
          <path className="hx-lid" d="M132 168 L172 156 L166 180 L130 186 Z" fill="url(#hxIris)" />
          <path className="hx-lid" d="M228 168 L188 156 L194 180 L230 186 Z" fill="url(#hxIris)" />
        </g>
        {/* hot cores */}
        <g className="hx-core">
          <ellipse cx="150" cy="171" rx="8" ry="4.4" fill="#fff6f6" />
          <ellipse cx="210" cy="171" rx="8" ry="4.4" fill="#fff6f6" />
        </g>
      </g>

      {/* ---- Tech mask over the lower face ---- */}
      <g className="hx-mask">
        <path
          d="M140 214 H220 L211 246 C202 258 158 258 149 246 Z"
          fill="#080000"
          stroke="#ff2d2d"
          strokeOpacity="0.55"
          strokeWidth="1.6"
        />
        <g stroke="#ff2d2d" strokeOpacity="0.75" strokeWidth="1.6" strokeLinecap="round">
          <path d="M149 224 H211" />
          <path d="M152 234 H208" />
          <path d="M157 244 H203" />
        </g>
        {/* vent glow */}
        <circle cx="180" cy="234" r="3" fill="#ff6b6b" />
      </g>

      {/* ---- Circuit tracery on the hood ---- */}
      <g
        className="hx-circuit"
        stroke="#ff2d2d"
        strokeOpacity="0.5"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      >
        <path d="M88 118 H116 V152" />
        <path d="M272 118 H244 V152" />
        <path d="M94 196 H122" />
        <path d="M266 196 H238" />
        <path d="M180 34 V56" />
        <circle cx="116" cy="152" r="3" fill="#ff2d2d" stroke="none" />
        <circle cx="244" cy="152" r="3" fill="#ff2d2d" stroke="none" />
        <circle cx="180" cy="34" r="3" fill="#ff2d2d" stroke="none" />
      </g>
    </svg>
  );
}

/* ---- deterministic decorative data (stable server/client) --------------- */

const RAIN_GLYPHS = "01<>{}[]/\\#$%&*+=!?アカサタナ日ハミ";
function rainString(seed: number, len: number) {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += RAIN_GLYPHS[(seed * 7 + i * 13) % RAIN_GLYPHS.length];
  }
  return out;
}

const RAIN_COLUMNS = Array.from({ length: 24 }, (_, i) => ({
  left: 0.5 + i * 4.15,
  dur: 4 + ((i * 37) % 45) / 10,
  delay: ((i * 53) % 45) / 10,
  opacity: 0.12 + ((i * 17) % 22) / 100,
  size: 11 + ((i * 5) % 5),
  chars: rainString(i + 1, 24),
}));

/*
 * Blood: few, wide and slow. Viscous fluid moves far slower than the eye
 * expects, so long durations (9-15s) plus a long dwell in the keyframe are what
 * actually sell "sticky" — thickness alone reads as plastic.
 */
const BLOOD_DRIPS = Array.from({ length: 7 }, (_, i) => ({
  left: 9 + i * 13,
  dur: 9 + ((i * 29) % 60) / 10,
  delay: ((i * 41) % 70) / 10,
  height: 52 + ((i * 23) % 70),
  width: 7 + ((i * 3) % 5),
}));

/* ---- scoped styles ------------------------------------------------------- */

const HX_STYLES = `
.hx-scene {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  margin-inline: auto;
  overflow: hidden;
  border-radius: 28px;
  isolation: isolate;
  /* Defaults so the figure is centred before the first pointer event. */
  --hx-eye-x: 0px;
  --hx-eye-y: 0px;
  --hx-tilt-y: 0deg;
  --hx-tilt-x: 0deg;
  background:
    radial-gradient(circle at 50% 38%, rgba(48,0,0,0.55), transparent 70%),
    #010101;
  box-shadow:
    inset 0 0 70px rgba(0,0,0,0.95),
    0 0 48px -12px rgba(230,0,0,0.45);
}

.hx-glow { position: absolute; border-radius: 9999px; filter: blur(72px); z-index: 0; }
.hx-glow-a {
  inset: 2% 12% auto 8%;
  width: 70%; height: 62%;
  background: radial-gradient(circle, rgba(230,0,0,0.6), transparent 70%);
  animation: hx-pulse 3.6s ease-in-out infinite;
}
.hx-glow-b {
  inset: auto 6% 0% 18%;
  width: 62%; height: 52%;
  background: radial-gradient(circle, rgba(139,0,0,0.55), transparent 70%);
  animation: hx-pulse 4.4s ease-in-out infinite reverse;
}

.hx-rain { position: absolute; inset: 0; z-index: 1; overflow: hidden; }
.hx-rain-col {
  position: absolute;
  top: -48%;
  font-family: ui-monospace, monospace;
  line-height: 1.1;
  letter-spacing: 1px;
  color: #ff2d2d;
  writing-mode: vertical-rl;
  text-orientation: upright;
  white-space: nowrap;
  text-shadow: 0 0 7px rgba(230,0,0,0.9);
  animation-name: hx-fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.hx-stage { position: absolute; inset: 0; z-index: 2; display: grid; place-items: center; perspective: 1200px; }
.hx-float { transform-style: preserve-3d; animation: hx-float 7s ease-in-out infinite; }
/* Lean follows the cursor; kept separate from the float so they compose. */
.hx-lean {
  transform-style: preserve-3d;
  transform: rotateY(var(--hx-tilt-y)) rotateX(var(--hx-tilt-x));
  transition: transform 420ms cubic-bezier(0.16, 1, 0.3, 1);
}
.hx-figure, .hx-photo {
  width: 88%;
  height: auto;
  display: block;
  margin-inline: auto;
  filter: drop-shadow(0 0 38px rgba(230,0,0,0.6));
}
.hx-photo { width: 92%; border-radius: 18px; }
.hx-glitch { animation: hx-glitch 6s steps(1) infinite; }

/* Eye tracking + life */
.hx-eyes {
  transform: translate(var(--hx-eye-x), var(--hx-eye-y));
  transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
  animation: hx-eyeglow 2.8s ease-in-out infinite;
}
.hx-lid { transform-box: fill-box; transform-origin: center; animation: hx-squint 7s ease-in-out infinite; }
.hx-core { animation: hx-corepulse 2.2s ease-in-out infinite; }
.hx-mask { animation: hx-pulse 3s ease-in-out infinite; }
.hx-circuit { animation: hx-pulse 2.2s ease-in-out infinite; }

/* Thick viscous blood */
.hx-blood { position: absolute; inset: 0; z-index: 3; overflow: hidden; }
.hx-drip {
  position: absolute;
  top: 38%;
  height: 0;
  background: linear-gradient(to bottom, #4a0000, #8b0000 35%, #c40000 72%, #ff2d2d);
  border-radius: 0 0 6px 6px;
  box-shadow: 0 0 14px rgba(230,0,0,0.7), inset 1px 0 0 rgba(255,120,120,0.35);
  animation-name: hx-ooze;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
.hx-drop {
  position: absolute;
  left: 50%;
  bottom: -11px;
  width: 16px;
  height: 20px;
  margin-left: -8px;
  background: radial-gradient(circle at 42% 30%, #ff6b6b, #c40000 55%, #6e0000);
  border-radius: 50% 50% 50% 50% / 38% 38% 64% 64%;
  box-shadow: 0 0 16px rgba(230,0,0,0.85);
}

.hx-scan {
  position: absolute; inset: 0; z-index: 4; pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255,0,0,0.06) 0px, rgba(255,0,0,0.06) 1px,
    transparent 1px, transparent 3px
  );
  mix-blend-mode: screen;
  opacity: 0.55;
}
.hx-vignette {
  position: absolute; inset: 0; z-index: 5; pointer-events: none;
  background: radial-gradient(ellipse 78% 72% at 50% 44%, transparent 42%, rgba(0,0,0,0.9) 100%);
}

@keyframes hx-float {
  0%, 100% { transform: translateY(0) rotateZ(-0.6deg); }
  50%      { transform: translateY(-18px) rotateZ(0.6deg); }
}
@keyframes hx-pulse {
  0%, 100% { opacity: 0.45; }
  50%      { opacity: 1; }
}
@keyframes hx-eyeglow {
  0%, 86%, 100% { opacity: 1; }
  88%           { opacity: 0.15; }
  90%           { opacity: 1; }
}
@keyframes hx-corepulse {
  0%, 100% { opacity: 0.75; }
  50%      { opacity: 1; }
}
@keyframes hx-squint {
  0%, 72%, 100% { transform: scaleY(1); }
  82%           { transform: scaleY(0.4); }
  88%           { transform: scaleY(1); }
}
@keyframes hx-fall {
  0%   { transform: translateY(0); }
  100% { transform: translateY(152%); }
}
/*
 * Viscous ooze: creeps for most of the cycle, hangs at full length, then the
 * bead finally lets go. The long 55% -> 80% plateau is the "sticky" beat.
 */
@keyframes hx-ooze {
  0%   { height: 0; opacity: 0; }
  8%   { opacity: 1; }
  55%  { height: var(--hx-run); }
  80%  { height: var(--hx-run); transform: translateY(0); opacity: 1; }
  100% { height: var(--hx-run); transform: translateY(46%); opacity: 0; }
}
@keyframes hx-glitch {
  0%, 90%, 100% { transform: translate(0,0) skewX(0deg); }
  91%  { transform: translate(-5px, 2px) skewX(8deg); }
  93%  { transform: translate(5px, -2px) skewX(-7deg); }
  95%  { transform: translate(-2px, 1px) skewX(4deg); }
  97%  { transform: translate(0,0) skewX(0deg); }
}

@media (prefers-reduced-motion: reduce) {
  .hx-glow-a, .hx-glow-b, .hx-rain-col, .hx-float, .hx-glitch,
  .hx-eyes, .hx-lid, .hx-core, .hx-mask, .hx-circuit, .hx-drip {
    animation: none !important;
  }
  .hx-lean, .hx-eyes { transition: none !important; transform: none !important; }
  .hx-drip { height: calc(var(--hx-run) * 0.6); opacity: 0.9; }
}
`;
