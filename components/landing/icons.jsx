// ===== 듀오톤 SVG 아이콘 컴포넌트 =====

export const PaletteIcon = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" fill="none">
    <circle cx="12" cy="12" r="10" fill="var(--icon-secondary)" opacity="0.3"/>
    <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67-.08-.1-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="var(--icon-primary)"/>
  </svg>
);

export const DeviceIcon = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" fill="none">
    <rect x="5" y="2" width="14" height="20" rx="2" fill="var(--icon-secondary)" opacity="0.3"/>
    <path d="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14zm-5 2c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" fill="var(--icon-primary)"/>
  </svg>
);

export const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" fill="none">
    <circle cx="10.5" cy="10.5" r="7" fill="var(--icon-secondary)" opacity="0.3"/>
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="var(--icon-primary)"/>
  </svg>
);

export const DocumentIcon = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" fill="none">
    <path d="M6 2h8l6 6v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2z" fill="var(--icon-secondary)" opacity="0.3"/>
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15h8v2H8v-2zm0-4h8v2H8v-2z" fill="var(--icon-primary)"/>
  </svg>
);

export const WrenchIcon = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" fill="none">
    <circle cx="12" cy="12" r="10" fill="var(--icon-secondary)" opacity="0.3"/>
    <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" fill="var(--icon-primary)"/>
  </svg>
);

export const RocketIcon = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" fill="none">
    <ellipse cx="12" cy="12" rx="8" ry="10" fill="var(--icon-secondary)" opacity="0.3"/>
    <path d="M12 2.5c-3.9 3.9-5.5 9.3-4.3 14.3l2.6-2.6c-.3-1.3-.3-2.7.1-4.1.9-2.5 2.8-4.4 4.6-5.8-1.1-.7-2.1-1.3-3-1.8zM4.4 18.2l1.4 1.4 3.2-3.2-1.4-1.4-3.2 3.2zm14.2-12.6c-2.2 2.2-5.2 5.8-5.8 9.5l2.6 2.6c5-1.2 10.4-2.8 14.3-6.7-1.2-.1-2.5-.5-3.7-1.1-1.9 1.5-3.6 2.7-5.1 3.5.4-1.5 1.2-3.2 2.5-4.9-.6-1.2-1-2.5-1.1-3.7l-3.7.8z" fill="var(--icon-primary)"/>
    <circle cx="12" cy="6" r="1.5" fill="var(--icon-primary)"/>
    <path d="M5 21l2-2m4 0l2 2" stroke="var(--icon-primary)" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const ProjectIcon = ({ size = 32 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
    <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" opacity="0.2"/>
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z" fill="currentColor"/>
  </svg>
);

export const StarIcon = ({ size = 32 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
    <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" fill="currentColor" opacity="0.2"/>
    <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2zm0 3.77l1.84 4.35 4.72.4-3.58 3.11 1.08 4.62L12 15.4l-4.06 2.85 1.08-4.62-3.58-3.11 4.72-.4L12 5.77z" fill="currentColor"/>
  </svg>
);

export const ClockIcon = ({ size = 32 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
    <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.2"/>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" fill="currentColor"/>
  </svg>
);

export const CheckCircleIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
    <circle cx="12" cy="12" r="10" fill="var(--icon-secondary)" opacity="0.4"/>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="var(--icon-primary)"/>
  </svg>
);

export const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="currentColor"/>
  </svg>
);

export const EmailIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
  </svg>
);

export const MenuIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="currentColor"/>
  </svg>
);

export const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
  </svg>
);

export const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

export const KakaoIcon = ({ size = 24 }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
    <path d="M12 3C6.48 3 2 6.58 2 11c0 2.76 1.74 5.18 4.36 6.56-.14.53-.51 1.93-.59 2.23-.1.37.14.36.29.27.12-.08 1.84-1.22 2.58-1.71.44.06.89.1 1.36.1 5.52 0 10-3.58 10-8S17.52 3 12 3z"/>
  </svg>
);
