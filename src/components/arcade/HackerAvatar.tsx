"use client";

import { m, useReducedMotion } from "framer-motion";
import Image from "next/image";
import styles from "./Arcade.module.css";

type HackerAvatarProps = {
  level: number;
  rank: string;
  progress: number;
};

const RING_RADIUS = 63;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

/** Animated local profile identity using Kalipto's supplied red eye artwork. */
export function HackerAvatar({ level, rank, progress }: HackerAvatarProps) {
  const reduceMotion = useReducedMotion();
  const safeProgress = Math.max(0, Math.min(1, progress));

  return (
    <figure className="relative isolate w-40 shrink-0 sm:w-48">
      <m.div
        className="relative aspect-square [perspective:900px]"
        animate={
          reduceMotion
            ? undefined
            : { y: [0, -5, 0], rotateZ: [-0.4, 0.4, -0.4] }
        }
        transition={{ duration: 5.5, ease: "easeInOut", repeat: Infinity }}
      >
        <div aria-hidden="true" className={styles.avatarHood} />
        <div aria-hidden="true" className={styles.avatarGlow} />

        <div className={styles.avatarLens}>
          <Image
            src="/images/kalipto-hacker-4k.webp"
            alt="Kalipto red eye hacker avatar"
            width={3840}
            height={3840}
            sizes="(max-width: 639px) 10rem, 12rem"
            className="size-full object-cover"
          />
          <span aria-hidden="true" className={styles.avatarVignette} />
          <span aria-hidden="true" className={styles.avatarScan} />
          <span aria-hidden="true" className={styles.avatarGlitch} />
        </div>

        <svg
          aria-hidden="true"
          viewBox="0 0 160 160"
          className={styles.avatarRing}
        >
          <circle
            cx="80"
            cy="80"
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2"
          />
          <circle
            cx="80"
            cy="80"
            r={RING_RADIUS}
            fill="none"
            stroke="url(#avatar-ring-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={RING_LENGTH}
            strokeDashoffset={RING_LENGTH * (1 - safeProgress)}
            transform="rotate(-90 80 80)"
          />
          <defs>
            <linearGradient id="avatar-ring-gradient" x1="20" y1="20" x2="140" y2="140">
              <stop stopColor="#761321" />
              <stop offset="0.55" stopColor="#e52d43" />
              <stop offset="1" stopColor="#ff7b88" />
            </linearGradient>
          </defs>
        </svg>

        <span
          aria-hidden="true"
          className="absolute top-[17%] left-[6%] size-2 rounded-full bg-electric-400 shadow-[0_0_12px_rgba(249,79,97,1)]"
        />
        <span
          aria-hidden="true"
          className="absolute top-[28%] right-[4%] h-px w-7 bg-electric-400/70 shadow-[0_0_8px_rgba(249,79,97,0.8)]"
        />

        <div className={`${styles.cyberFont} absolute right-0 bottom-2 z-20 min-w-14 rounded-xl border border-electric-500/40 bg-void-950/95 px-2.5 py-2 text-center shadow-[0_10px_28px_-12px_rgba(201,31,54,0.9)] backdrop-blur-md`}>
          <p className="text-[0.5rem] font-semibold tracking-[0.16em] text-ink-faint uppercase">
            Level
          </p>
          <p className="text-lg leading-none font-bold text-electric-100">{level}</p>
        </div>

        <div className={`${styles.cyberFont} absolute bottom-0 left-0 z-20 inline-flex items-center gap-1.5 rounded-lg border border-hairline-strong bg-void-950/95 px-2.5 py-1.5 text-[0.5625rem] font-semibold tracking-[0.1em] text-ink-muted uppercase backdrop-blur-md`}>
          <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
          Online
        </div>
      </m.div>

      <figcaption className="sr-only">
        Kalipto profile avatar, level {level}, rank {rank}
      </figcaption>
    </figure>
  );
}
