import type { MDXComponents } from "mdx/types";
import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

/**
 * Global MDX element mapping.
 *
 * Required by `@next/mdx` in the App Router — without this file MDX will not
 * compile. Styles live here rather than in a `prose` wrapper so each element is
 * tuned to the site's own type scale instead of a plugin's defaults, and so no
 * extra Tailwind plugin is needed.
 */

type AnchorProps = ComponentPropsWithoutRef<"a">;

const components: MDXComponents = {
  h2: ({ children, ...props }) => (
    <h2
      {...props}
      className="mt-14 scroll-mt-28 text-[1.5rem] font-semibold tracking-[-0.02em] text-ink sm:text-[1.75rem]"
    >
      {children}
    </h2>
  ),

  h3: ({ children, ...props }) => (
    <h3
      {...props}
      className="mt-10 scroll-mt-28 text-[1.1875rem] font-semibold tracking-[-0.015em] text-ink sm:text-[1.3125rem]"
    >
      {children}
    </h3>
  ),

  h4: ({ children, ...props }) => (
    <h4
      {...props}
      className="mt-8 scroll-mt-28 text-[1.0625rem] font-semibold text-ink"
    >
      {children}
    </h4>
  ),

  p: ({ children, ...props }) => (
    <p {...props} className="mt-5 text-[1rem] leading-[1.8] text-ink-muted">
      {children}
    </p>
  ),

  a: ({ href = "", children, ...props }: AnchorProps) => {
    const isExternal = /^https?:\/\//.test(href);
    const className =
      "font-medium text-electric-300 underline decoration-electric-400/40 underline-offset-[3px] transition-colors duration-200 hover:text-electric-200 hover:decoration-electric-300";

    // Heading anchors added by rehype-autolink-headings wrap the heading text;
    // they must not inherit link styling or they underline the whole heading.
    if (href.startsWith("#")) {
      return (
        <a href={href} className="no-underline hover:text-electric-300" {...props}>
          {children}
        </a>
      );
    }

    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          {...props}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  },

  ul: ({ children, ...props }) => (
    <ul
      {...props}
      className="mt-5 flex flex-col gap-2.5 text-[1rem] leading-[1.75] text-ink-muted"
    >
      {children}
    </ul>
  ),

  ol: ({ children, ...props }) => (
    <ol
      {...props}
      className="mt-5 flex list-decimal flex-col gap-2.5 pl-5 text-[1rem] leading-[1.75] text-ink-muted"
    >
      {children}
    </ol>
  ),

  li: ({ children, ...props }) => (
    <li {...props} className="marker:text-electric-400/70">
      {children}
    </li>
  ),

  strong: ({ children, ...props }) => (
    <strong {...props} className="font-semibold text-ink">
      {children}
    </strong>
  ),

  blockquote: ({ children, ...props }) => (
    <blockquote
      {...props}
      className="mt-6 rounded-r-2xl border-l-2 border-electric-400/60 bg-white/[0.03] py-1 pr-5 pl-5 text-ink-muted italic"
    >
      {children}
    </blockquote>
  ),

  /*
   * Inline code only. Code inside a fenced block is rendered by Shiki, which
   * emits its own `<pre><code>` with inline colour styles — those must not be
   * restyled here or the highlighting is lost, so `pre` is left to CSS
   * (see `globals.css`).
   */
  code: ({ children, ...props }) => (
    <code
      {...props}
      className="rounded-md border border-hairline bg-white/[0.05] px-[0.4em] py-[0.15em] font-mono text-[0.875em] text-electric-200 [pre_&]:border-0 [pre_&]:bg-transparent [pre_&]:p-0 [pre_&]:text-inherit"
    >
      {children}
    </code>
  ),

  hr: (props) => <hr {...props} className="my-12 border-hairline" />,

  table: ({ children, ...props }) => (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-hairline">
      <table {...props} className="w-full border-collapse text-left text-[0.9375rem]">
        {children}
      </table>
    </div>
  ),

  th: ({ children, ...props }) => (
    <th
      {...props}
      className="border-b border-hairline bg-white/[0.03] px-4 py-3 text-[0.8125rem] font-semibold tracking-wide text-ink uppercase"
    >
      {children}
    </th>
  ),

  td: ({ children, ...props }) => (
    <td {...props} className="border-b border-hairline px-4 py-3 text-ink-muted">
      {children}
    </td>
  ),

  /*
   * Markdown's `![alt](src)` always supplies an alt attribute, but it can be an
   * empty string. Defaulting to `""` is the correct accessible outcome for a
   * decorative image and guarantees the attribute is always present.
   */
  img: ({ alt = "", ...props }) => (
    <Image
      {...(props as ImageProps)}
      alt={alt}
      sizes="(min-width: 768px) 42rem, 100vw"
      className="mt-8 h-auto w-full rounded-2xl border border-hairline"
    />
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
