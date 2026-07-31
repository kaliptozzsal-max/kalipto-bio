import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/**
 * Hand-rolled stroke icons for UI chrome. Keeping these inline avoids pulling a
 * second icon library into the bundle for a handful of glyphs.
 * All are decorative by default (`aria-hidden`); callers supply the label.
 */
function Base({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const ShieldIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M12 3.2 19 6v5.6c0 4.2-2.9 7.4-7 8.8-4.1-1.4-7-4.6-7-8.8V6l7-2.8Z" />
    <path d="m9.2 12.1 1.9 1.9 3.7-3.9" />
  </Base>
);

export const BrainIcon = (props: IconProps) => (
  <Base {...props}>
    <rect x="7" y="7" width="10" height="10" rx="2.5" />
    <path d="M10.5 10.5h3v3h-3z" />
    <path d="M12 3.5V7M12 17v3.5M3.5 12H7M17 12h3.5M8.4 3.9v1.8M15.6 3.9v1.8M8.4 18.3v1.8M15.6 18.3v1.8M3.9 8.4h1.8M3.9 15.6h1.8M18.3 8.4h1.8M18.3 15.6h1.8" />
  </Base>
);

export const CodeIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M8.5 6.5 3.5 12l5 5.5" />
    <path d="M15.5 6.5 20.5 12l-5 5.5" />
    <path d="M13.6 4.6 10.4 19.4" />
  </Base>
);

export const CloudIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M6.8 18.5h10a4.2 4.2 0 0 0 .4-8.4 6.1 6.1 0 0 0-11.7 1.6 3.6 3.6 0 0 0 1.3 6.8Z" />
    <path d="M12 15.5v-4M12 11.5l-1.8 1.8M12 11.5l1.8 1.8" />
  </Base>
);

export const PulseIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M2.5 12h4l2.2-6 3.4 12.5 2.4-6.5H21.5" />
  </Base>
);

export const StarIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M12 3.6l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9L12 3.6Z" />
  </Base>
);

export const ForkIcon = (props: IconProps) => (
  <Base {...props}>
    <circle cx="6.5" cy="5" r="2.1" />
    <circle cx="17.5" cy="5" r="2.1" />
    <circle cx="12" cy="19" r="2.1" />
    <path d="M6.5 7.1v2a2.4 2.4 0 0 0 2.4 2.4h6.2a2.4 2.4 0 0 0 2.4-2.4v-2" />
    <path d="M12 11.5v5.4" />
  </Base>
);

export const RssIcon = (props: IconProps) => (
  <Base {...props}>
    <circle cx="6.2" cy="17.8" r="1.4" />
    <path d="M4.8 11.2a8 8 0 0 1 8 8" />
    <path d="M4.8 5.6a13.6 13.6 0 0 1 13.6 13.6" />
  </Base>
);

export const ArrowLeftIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M19.5 12h-15" />
    <path d="m10.5 6-6 6 6 6" />
  </Base>
);

export const ClockIcon = (props: IconProps) => (
  <Base {...props}>
    <circle cx="12" cy="12" r="8.75" />
    <path d="M12 7.4V12l3.2 2" />
  </Base>
);

export const PhoneIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M8.2 3.6h-2A2.2 2.2 0 0 0 4 6q0 7.2 5.4 12.6T22 24v-2.2a2.2 2.2 0 0 0-1.9-2.2l-2.4-.3a2.2 2.2 0 0 0-2 .8l-.7.9a15 15 0 0 1-5.8-5.8l.9-.7a2.2 2.2 0 0 0 .8-2l-.3-2.4a2.2 2.2 0 0 0-2.2-1.9Z" />
  </Base>
);

export const BroadcastIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M4.5 10.5v3a1.5 1.5 0 0 0 1.5 1.5h1.8l5.7 3.6V6.9L7.8 10.5H6a1.5 1.5 0 0 0-1.5 1.5Z" />
    <path d="M16.8 9.4a4 4 0 0 1 0 5.2" />
    <path d="M19.2 7.2a7.2 7.2 0 0 1 0 9.6" />
  </Base>
);

export const MailIcon = (props: IconProps) => (
  <Base {...props}>
    <rect x="2.75" y="5" width="18.5" height="14" rx="2.5" />
    <path d="m3.4 7.2 7.4 5.4a2 2 0 0 0 2.4 0l7.4-5.4" />
  </Base>
);

export const MapPinIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M12 21.5s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx="12" cy="10.2" r="2.6" />
  </Base>
);

export const ArrowRightIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M4.5 12h15" />
    <path d="m13.5 6 6 6-6 6" />
  </Base>
);

export const ArrowDownIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M12 4.5v15" />
    <path d="m6 13.5 6 6 6-6" />
  </Base>
);

export const ExternalLinkIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M14 4.5h5.5V10" />
    <path d="M19.5 4.5 11 13" />
    <path d="M18 14.5v3.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.5" />
  </Base>
);

export const MenuIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M4 7.5h16M4 12h16M4 16.5h16" />
  </Base>
);

export const CloseIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
);

export const CheckCircleIcon = (props: IconProps) => (
  <Base {...props}>
    <circle cx="12" cy="12" r="8.75" />
    <path d="m8.2 12.3 2.5 2.5 5.1-5.4" />
  </Base>
);

export const AlertIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M12 4.2 21 19.5H3L12 4.2Z" />
    <path d="M12 10v4.2" />
    <path d="M12 17.2h.01" />
  </Base>
);

export const SpinnerIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5" />
  </Base>
);

export const SparkIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M12 3.5l1.7 4.8 4.8 1.7-4.8 1.7L12 16.5l-1.7-4.8L5.5 10l4.8-1.7L12 3.5Z" />
    <path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />
  </Base>
);

export const TerminalIcon = (props: IconProps) => (
  <Base {...props}>
    <rect x="2.75" y="4.25" width="18.5" height="15.5" rx="2.5" />
    <path d="m7 10 2.5 2.5L7 15" />
    <path d="M12.5 15.2h4.5" />
  </Base>
);
