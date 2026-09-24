const dataColumns = [
  "01001011 01000001 01001100 01001001 01010000 01010100 01001111",
  "AUTH::7F2A ACCESS::GRANTED NODE::01 TRACE::NULL CIPHER::AES256",
  "10110100 00101101 11100010 01010110 00110011 11001010 01110101",
  "PORT::443 TLS::1.3 HASH::SHA256 STATUS::SECURE UPLINK::ACTIVE",
  "00110101 11010010 01001001 10101100 01110010 00011101 10100111",
  "ZERO::TRUST ID::KALIPTO FIREWALL::ARMED PACKET::VERIFIED",
  "11100101 00111010 10010110 01101001 11000100 01010011 10111000",
] as const;

/**
 * Fixed dark-web backdrop shared by every route. All motion is CSS-only,
 * non-interactive, and covered by the global reduced-motion/mobile rules.
 */
export function SiteBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-mesh" />

      {/*
        Two radial-gradient glows instead of three huge blurred elements.
        A `blur-[150px]` element forces a full-screen offscreen buffer every
        frame; a baked radial gradient is drawn once and costs almost nothing.
      */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(46rem 34rem at 50% -10%, rgb(196 0 0 / 0.14), transparent 60%), radial-gradient(38rem 32rem at 92% 96%, rgb(153 0 0 / 0.12), transparent 62%)",
        }}
      />

      <div className="absolute inset-0 bg-grid mask-radial-fade opacity-55" />

      <div className="absolute inset-0 overflow-hidden opacity-[0.11] mask-radial-fade">
        <div className="flex min-w-[64rem] justify-around gap-12 px-8 font-mono text-[0.5625rem] leading-[1.75] tracking-[0.14em] text-electric-400">
          {dataColumns.map((column, index) => (
            <span
              key={column}
              className="darkweb-data-column block h-[145vh] max-w-4 [writing-mode:vertical-rl]"
              style={{ animationDelay: `${index * -1.7}s` }}
            >
              {column} {column}
            </span>
          ))}
        </div>
      </div>

      <div className="darkweb-scanlines absolute inset-0" />
      <div className="darkweb-sweep absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric-400/60 to-transparent shadow-[0_0_22px_rgba(229,45,67,0.45)]" />

      <div className="absolute top-24 left-5 hidden items-center gap-2 font-mono text-[0.5625rem] tracking-[0.18em] text-electric-400/30 uppercase xl:flex">
        <span className="size-1 rounded-full bg-electric-400/70" />
        Node 01 // secure session
      </div>
      <div className="absolute right-5 bottom-5 hidden font-mono text-[0.5625rem] tracking-[0.16em] text-electric-400/25 uppercase xl:block">
        11.5564° N // 104.9282° E
      </div>

      <span className="absolute top-20 left-4 hidden size-10 border-t border-l border-electric-500/20 lg:block" />
      <span className="absolute top-20 right-4 hidden size-10 border-t border-r border-electric-500/20 lg:block" />
      <span className="absolute bottom-4 left-4 hidden size-10 border-b border-l border-electric-500/20 lg:block" />
      <span className="absolute right-4 bottom-4 hidden size-10 border-r border-b border-electric-500/20 lg:block" />

      <div className="absolute inset-0 bg-noise opacity-[0.035] mix-blend-soft-light" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_88%_68%_at_50%_32%,transparent_28%,rgba(3,2,3,0.84)_100%)]" />
    </div>
  );
}
