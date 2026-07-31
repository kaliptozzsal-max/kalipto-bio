import { ImageResponse } from "next/og";
import { siteConfig } from "@/data/site";
import { formatNoteDate, getAllNoteSlugs, getNote } from "@/lib/notes";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllNoteSlugs().map((slug) => ({ slug }));
}

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = getNote(slug);

  return [
    {
      id: "note",
      size,
      contentType,
      alt: note ? `${note.title} — ${siteConfig.name}` : siteConfig.name,
    },
  ];
}

/**
 * Per-note social card. `ImageResponse` supports only flexbox and a subset of
 * CSS, so this deliberately avoids grid and web fonts.
 */
export default async function NoteOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = getNote(slug);

  const title = note?.title ?? "Notes";
  // Long titles need a smaller size to stay on the card.
  const titleSize = title.length > 72 ? 62 : title.length > 44 ? 76 : 92;

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
            "linear-gradient(135deg, #04060b 0%, #070d1a 45%, #04101f 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -240,
            left: 280,
            width: 760,
            height: 620,
            borderRadius: 9999,
            background: "rgba(10,132,255,0.28)",
            filter: "blur(140px)",
          }}
        />

        {/* Eyebrow */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: 16,
              border: "2px solid rgba(61,148,255,0.5)",
              background: "rgba(10,132,255,0.16)",
              color: "#a8d0ff",
              fontSize: 28,
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
            Notes
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            lineHeight: 1.1,
            fontWeight: 700,
            letterSpacing: "-0.035em",
            color: "#f5f8fc",
            maxWidth: 1000,
          }}
        >
          {title}
        </div>

        {/* Footer row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontSize: 24,
            color: "#98a4b8",
          }}
        >
          <div style={{ display: "flex" }}>{siteConfig.name}</div>
          {note ? (
            <>
              <div style={{ display: "flex", color: "#67738a" }}>·</div>
              <div style={{ display: "flex" }}>{formatNoteDate(note.date)}</div>
              <div style={{ display: "flex", color: "#67738a" }}>·</div>
              <div style={{ display: "flex" }}>
                {note.readingMinutes} min read
              </div>
            </>
          ) : null}
        </div>
      </div>
    ),
    size,
  );
}
