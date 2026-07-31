import { ImageResponse } from "next/og";

/**
 * Generated favicon.
 *
 * Kept small and flat on purpose: this is fetched during the initial page load,
 * so a gradient-heavy 512px PNG would spend tens of kilobytes of critical-path
 * bandwidth on a 16px glyph.
 */
export const size = { width: 48, height: 48 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#04060b",
          color: "#3d94ff",
          fontSize: 38,
          fontWeight: 700,
          letterSpacing: "-0.06em",
        }}
      >
        K
      </div>
    ),
    size,
  );
}
