import { ImageResponse } from "next/og";
import { siteConfig } from "@/data/site";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const roles = [
  "Cybersecurity Researcher",
  "AI Developer",
  "Automation Engineer",
  "Clinical Engineering",
];

/**
 * Social card. `ImageResponse` only supports flexbox and a CSS subset, so this
 * intentionally avoids grid and custom fonts to stay fast and dependency-free.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background:
            "linear-gradient(135deg, #010101 0%, #0c0404 45%, #170808 100%)",
          position: "relative",
        }}
      >
        {/* Accent light pool */}
        <div
          style={{
            position: "absolute",
            top: -240,
            left: 320,
            width: 760,
            height: 620,
            borderRadius: 9999,
            background: "rgba(230,0,0,0.32)",
            filter: "blur(140px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -220,
            right: -120,
            width: 560,
            height: 520,
            borderRadius: 9999,
            background: "rgba(139,0,0,0.20)",
            filter: "blur(140px)",
          }}
        />

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 18,
              border: "2px solid rgba(255,45,45,0.5)",
              background: "rgba(230,0,0,0.16)",
              color: "#ff6b6b",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            K
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#98a4b8",
            }}
          >
            {siteConfig.location}
          </div>
        </div>

        {/* Name + description */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 168,
              lineHeight: 1,
              fontWeight: 700,
              letterSpacing: "-0.055em",
              color: "#f5f8fc",
            }}
          >
            {siteConfig.name}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 26,
              maxWidth: 900,
              fontSize: 27,
              lineHeight: 1.45,
              color: "#98a4b8",
            }}
          >
            Building intelligent software, security automation and AI systems
            that bridge healthcare and modern technology.
          </div>
        </div>

        {/* Role chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {roles.map((role) => (
            <div
              key={role}
              style={{
                display: "flex",
                padding: "12px 22px",
                borderRadius: 9999,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.04)",
                fontSize: 22,
                color: "#ffd6d6",
              }}
            >
              {role}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
