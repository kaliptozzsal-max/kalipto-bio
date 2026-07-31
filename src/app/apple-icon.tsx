import { ImageResponse } from "next/og";

/**
 * Apple touch icon — opaque, square, no transparency. Flat fill rather than a
 * gradient so the PNG stays a couple of kilobytes.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 132,
            height: 132,
            borderRadius: 40,
            border: "6px solid #1c4f96",
            color: "#a8d0ff",
            fontSize: 86,
            fontWeight: 700,
            letterSpacing: "-0.06em",
          }}
        >
          K
        </div>
      </div>
    ),
    size,
  );
}
