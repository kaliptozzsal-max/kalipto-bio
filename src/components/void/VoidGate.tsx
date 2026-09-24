"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { contactChannels } from "@/data/site";
import styles from "./Void.module.css";

const STORAGE_KEY = "kalipto:void:v1";
const UNLOCK_TOKEN = "879580cb60e31be1e838eec046cdcf8f";

type Gate = "checking" | "locked" | "open";

const bootLines = [
  "> establishing tunnel ................ ok",
  "> peer fingerprint verified ......... ok",
  "> decrypting shadow layer ........... ok",
  "> identity: OPERATOR // clearance MAX",
  "> welcome to the void.",
] as const;

export function VoidGate() {
  const [gate, setGate] = useState<Gate>("checking");
  const [flag, setFlag] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bootIndex, setBootIndex] = useState(0);
  const bootTimer = useRef<number | null>(null);

  // Decide gate state on mount (client-only; server always renders "checking").
  useEffect(() => {
    // One-time sync of a browser storage value into state after hydration.
    let unlocked = false;
    try {
      unlocked = window.localStorage.getItem(STORAGE_KEY) === UNLOCK_TOKEN;
    } catch {
      unlocked = false;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGate(unlocked ? "open" : "locked");
  }, []);

  // Boot sequence typewriter once the void opens. The interval is the external
  // system this effect subscribes to; it only updates state from its callback.
  useEffect(() => {
    if (gate !== "open") return;
    bootTimer.current = window.setInterval(() => {
      setBootIndex((i) => {
        if (i >= bootLines.length) {
          if (bootTimer.current) window.clearInterval(bootTimer.current);
          return i;
        }
        return i + 1;
      });
    }, 550);
    return () => {
      if (bootTimer.current) window.clearInterval(bootTimer.current);
    };
  }, [gate]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !flag.trim()) return;
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/void/enter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flag: flag.trim() }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        token?: string;
        message?: string;
      };

      if (!response.ok || !result.ok || !result.token) {
        setError(result.message ?? "The void rejects you.");
        return;
      }

      try {
        window.localStorage.setItem(STORAGE_KEY, result.token);
      } catch {
        // If storage is blocked, still open for this session.
      }
      setFlag("");
      setGate("open");
    } catch {
      setError("Connection to the void failed.");
    } finally {
      setPending(false);
    }
  }

  function seal() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setGate("locked");
  }

  if (gate === "checking") {
    return (
      <div className={styles.shell}>
        <p className={styles.checking}>· · ·</p>
      </div>
    );
  }

  if (gate === "locked") {
    return (
      <div className={styles.shell}>
        <div className={styles.lockCard}>
          <p className={styles.glyph} aria-hidden="true">
            ⿻
          </p>
          <h1 className={styles.lockTitle}>ACCESS SEALED</h1>
          <p className={styles.lockText}>
            This layer does not exist for most. Present the master flag earned by
            clearing every level of the breach challenge.
          </p>
          <form onSubmit={submit} className={styles.lockForm}>
            <label htmlFor="void-flag" className={styles.srOnly}>
              Master flag
            </label>
            <input
              id="void-flag"
              value={flag}
              onChange={(e) => setFlag(e.target.value)}
              maxLength={96}
              autoComplete="off"
              spellCheck={false}
              placeholder="KALIPTO{...}"
              className={styles.lockInput}
            />
            <button type="submit" disabled={pending || !flag.trim()} className={styles.lockButton}>
              {pending ? "verifying…" : "enter"}
            </button>
          </form>
          {error ? (
            <p role="alert" className={styles.lockError}>
              {error}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.shell} ${styles.voidOpen}`}>
      <div className={styles.scanline} aria-hidden="true" />
      <div className={styles.terminal}>
        <div className={styles.boot} aria-live="polite">
          {bootLines.slice(0, bootIndex).map((line) => (
            <p key={line} className={styles.bootLine}>
              {line}
            </p>
          ))}
        </div>

        {bootIndex >= bootLines.length ? (
          <div className={styles.reveal}>
            <h1 className={styles.voidTitle}>YOU FOUND THE VOID</h1>
            <p className={styles.voidText}>
              Few reach this layer. You did not guess your way here — you earned
              it. There is a direct line to the operator below. Use it wisely.
            </p>

            <ul className={styles.channels}>
              {contactChannels.map((channel) => (
                <li key={channel.label}>
                  <a
                    href={channel.href}
                    {...(channel.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className={styles.channel}
                  >
                    <span className={styles.channelLabel}>{channel.label}</span>
                    <span className={styles.channelHandle}>{channel.handle}</span>
                  </a>
                </li>
              ))}
            </ul>

            <button type="button" onClick={seal} className={styles.sealButton}>
              seal the void
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
