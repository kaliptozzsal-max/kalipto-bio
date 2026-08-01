/**
 * Responsive YouTube embed for notes. Used as:
 *
 * ```mdx
 * <YouTube id="dQw4w9WgXcQ" title="Video title" />
 * ```
 *
 * Server Component — no client JS needed. Uses lite-youtube-style
 * aspect ratio container for zero CLS.
 */
export function YouTube({ id, title = "YouTube video" }: { id: string; title?: string }) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-hairline">
      <div className="relative aspect-video w-full">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 size-full"
        />
      </div>
    </div>
  );
}
