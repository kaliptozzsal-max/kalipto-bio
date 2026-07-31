/**
 * Slow-drifting blurred shapes behind the aurora wash.
 *
 * These are driven by CSS keyframes rather than Framer Motion, on purpose.
 * A JS animation loop that never ends occupies the main thread for the entire
 * life of the page; measured under Lighthouse's 4x CPU throttling, animating
 * these three shapes in JS added over two seconds of Total Blocking Time on its
 * own. CSS transform animations are handed to the compositor instead, so they
 * cost the main thread essentially nothing and cannot delay interaction.
 *
 * Framer Motion is still what drives everything the user triggers — entrances,
 * hovers, the nav, the form. Ambient motion that runs forever belongs in CSS.
 *
 * Amplitudes stay under ~40px over 20-30s so the movement reads as depth rather
 * than something demanding attention. The global `prefers-reduced-motion` rule
 * in `globals.css` stops them outright.
 */
const shapes = [
  {
    className:
      "left-[8%] top-[14%] size-[22rem] bg-electric-500/12 animate-drift-a sm:size-[26rem]",
  },
  {
    className:
      "right-[6%] top-[42%] size-[18rem] bg-cyber-violet/10 animate-drift-b sm:size-[22rem]",
  },
  {
    className:
      "left-[38%] bottom-[10%] size-[20rem] bg-cyber-cyan/10 animate-drift-c sm:size-[24rem]",
  },
] as const;

export function FloatingShapes() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {shapes.map((shape, index) => (
        <span
          key={index}
          className={`absolute rounded-full blur-[110px] will-change-transform ${shape.className}`}
        />
      ))}
    </div>
  );
}
