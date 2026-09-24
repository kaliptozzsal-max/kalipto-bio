"use client";

/**
 * BloodTitle
 *
 * Large display text with thick, slow blood oozing out of the letters.
 *
 * The text itself stays real, selectable and accessible — the drips are
 * decorative absolutely-positioned spans, so assistive tech and crawlers still
 * see plain text. `id` is forwarded to the text node so an outer
 * `aria-labelledby` keeps working.
 *
 * Motion is height/transform/opacity only. Viscosity is sold by *timing* rather
 * than size: each drip creeps, then hangs at full length for a long beat before
 * the bead finally releases. Drip geometry is deterministic so server and client
 * markup match.
 */
export function BloodTitle({
  text,
  className = "",
  id,
}: {
  text: string;
  className?: string;
  id?: string;
}) {
  return (
    <span className={`bt-wrap ${className}`}>
      <style>{BT_STYLES}</style>

      {/* A wet pool sitting along the baseline, so drips appear to come from mass */}
      <span className="bt-pool" aria-hidden="true" />

      <span id={id} className="bt-text">
        {text}
      </span>

      <span className="bt-drips" aria-hidden="true">
        {DRIPS.map((d, i) => (
          <span
            key={i}
            className="bt-drip"
            style={{
              left: `${d.left}%`,
              width: `${d.width}px`,
              animationDuration: `${d.dur}s`,
              animationDelay: `${d.delay}s`,
              ["--bt-run" as string]: `${d.height}px`,
            }}
          >
            <span className="bt-bead" />
          </span>
        ))}
      </span>
    </span>
  );
}

/*
 * Fewer, fatter, slower drips. Nine thin fast streaks read as rain; six wide
 * slow ones read as blood.
 */
const DRIPS = Array.from({ length: 6 }, (_, i) => ({
  left: 10 + i * 15.5,
  dur: 10 + ((i * 31) % 70) / 10,
  delay: ((i * 47) % 90) / 10,
  height: 40 + ((i * 19) % 60),
  width: 8 + ((i * 3) % 6),
}));

const BT_STYLES = `
.bt-wrap {
  position: relative;
  display: inline-block;
  isolation: isolate;
}

/* The word: white-hot core bleeding down into clotted red. */
.bt-text {
  position: relative;
  z-index: 1;
  display: inline-block;
  background-image: linear-gradient(
    180deg,
    #fff6f6 0%,
    #ff8a8a 38%,
    #e60000 66%,
    #8b0000 88%,
    #4a0000 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(230,0,0,0.6);
  filter: drop-shadow(0 4px 12px rgba(139,0,0,0.65));
}

/* Wet pool hugging the baseline — gives the drips somewhere to come from. */
.bt-pool {
  position: absolute;
  left: -2%;
  right: -2%;
  bottom: 0.04em;
  height: 0.12em;
  z-index: 0;
  background: linear-gradient(to bottom, rgba(230,0,0,0), #8b0000 55%, #c40000);
  border-radius: 0 0 40% 40% / 0 0 100% 100%;
  filter: blur(1px);
  opacity: 0.85;
}

.bt-drips {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0.05em;
  height: 0;
  z-index: 0;
  pointer-events: none;
}
.bt-drip {
  position: absolute;
  top: 0;
  height: 0;
  background: linear-gradient(to bottom, #4a0000, #8b0000 32%, #c40000 70%, #ff2d2d);
  border-radius: 0 0 7px 7px;
  box-shadow: 0 0 12px rgba(230,0,0,0.7), inset 1px 0 0 rgba(255,120,120,0.35);
  animation-name: bt-ooze;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
.bt-bead {
  position: absolute;
  left: 50%;
  bottom: -12px;
  width: 18px;
  height: 22px;
  margin-left: -9px;
  background: radial-gradient(circle at 42% 30%, #ff6b6b, #c40000 55%, #6e0000);
  border-radius: 50% 50% 50% 50% / 36% 36% 66% 66%;
  box-shadow: 0 0 18px rgba(230,0,0,0.85);
}

/*
 * Creep, then hang. The 58% -> 82% plateau is where it reads as sticky: the
 * column has stopped growing but the bead has not let go yet.
 */
@keyframes bt-ooze {
  0%   { height: 0; opacity: 0; }
  8%   { opacity: 1; }
  58%  { height: var(--bt-run); }
  82%  { height: var(--bt-run); transform: translateY(0); opacity: 1; }
  100% { height: var(--bt-run); transform: translateY(42%); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .bt-drip {
    animation: none !important;
    height: calc(var(--bt-run) * 0.55);
    opacity: 0.9;
  }
}
`;
