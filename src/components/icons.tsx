import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
});

/*
 * Padlock geometry traced from scripts/icons/padlock.svg (also the favicon), scaled to 24px:
 * a rounded body with the keyhole cut out, so the tile colour shows through it.
 */
const PADLOCK_BODY =
  'M6.65 10.66h10.71a2 2 0 0 1 2 2v7.34a2 2 0 0 1-2 2H6.65a2 2 0 0 1-2-2v-7.34a2 2 0 0 1 2-2z' +
  'M12 14.26a1.3 1.3 0 1 0 0 2.6a1.3 1.3 0 1 0 0-2.6z' +
  'M11.31 16.02h1.38v2.37a.69.69 0 0 1-1.38 0z';

export const LockIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M7.41 11.4V7.9a4.6 4.6 0 0 1 9.19 0v3.5" strokeWidth={2.6} />
    <path d={PADLOCK_BODY} fill="currentColor" fillRule="evenodd" stroke="none" />
  </svg>
);

export const HelpIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" />
  </svg>
);

export const StatsIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
  </svg>
);

export const SettingsIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);

export const NewGameIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5" />
  </svg>
);

export const BackspaceIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M21 5H8l-6 7 6 7h13a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1zM17 9l-6 6M11 9l6 6" />
  </svg>
);

export const CloseIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

/** The app-icon padlock with its shackle lifted out of the body on the left. */
export const LockOpenIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M7.41 7.2V5.4a4.6 4.6 0 0 1 9.19 0v6" strokeWidth={2.6} />
    <path d={PADLOCK_BODY} fill="currentColor" fillRule="evenodd" stroke="none" />
  </svg>
);

/** A solid key in the same chunky style as the padlock: round bow with a hole, shaft and two teeth. */
export const KeyIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path
      d="M7 7a5 5 0 1 1 0 10A5 5 0 1 1 7 7zM7 10.3a1.7 1.7 0 1 0 0 3.4a1.7 1.7 0 1 0 0-3.4z"
      fill="currentColor"
      fillRule="evenodd"
      stroke="none"
    />
    <path d="M11.5 10.8h9a1.2 1.2 0 0 1 0 2.4h-9z" fill="currentColor" stroke="none" />
    <path d="M15.6 13h2.2v3.2a1.1 1.1 0 0 1-2.2 0zM19.2 13h2.2v2.4a1.1 1.1 0 0 1-2.2 0z" fill="currentColor" stroke="none" />
  </svg>
);
