import React from "react";

interface IconProps {
  size?: number;
  stroke?: number;
  className?: string;
  style?: React.CSSProperties;
}

const Icon: React.FC<IconProps & { children: React.ReactNode }> = ({
  children,
  size = 16,
  stroke = 1.6,
  className = "",
  style = {},
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    {children}
  </svg>
);

export const Search = (p: IconProps) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Icon>;
export const Home = (p: IconProps) => <Icon {...p}><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/></Icon>;
export const Book = (p: IconProps) => <Icon {...p}><path d="M4 4h11a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4Z"/><path d="M4 16a4 4 0 0 1 4-4h11"/></Icon>;
export const Leaf = (p: IconProps) => <Icon {...p}><path d="M11 20A7 7 0 0 1 4 13c0-6 7-9 16-9 0 9-3 16-9 16Z"/><path d="M4 20c4-3 8-6 12-9"/></Icon>;
export const Folder = (p: IconProps) => <Icon {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></Icon>;
export const Bell = (p: IconProps) => <Icon {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 21a2 2 0 0 0 4 0"/></Icon>;
export const Settings = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></Icon>;
export const User = (p: IconProps) => <Icon {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></Icon>;
export const Plus = (p: IconProps) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>;
export const ArrowRight = (p: IconProps) => <Icon {...p}><path d="M5 12h14M13 5l7 7-7 7"/></Icon>;
export const ArrowUpRight = (p: IconProps) => <Icon {...p}><path d="M7 17 17 7M8 7h9v9"/></Icon>;
export const Check = (p: IconProps) => <Icon {...p}><path d="m5 12 5 5L20 7"/></Icon>;
export const X = (p: IconProps) => <Icon {...p}><path d="M6 6l12 12M18 6 6 18"/></Icon>;
export const Filter = (p: IconProps) => <Icon {...p}><path d="M3 5h18l-7 9v6l-4-2v-4Z"/></Icon>;
export const Bookmark = (p: IconProps) => <Icon {...p}><path d="M6 4h12v17l-6-4-6 4Z"/></Icon>;
export const Globe = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18"/></Icon>;
export const Map = (p: IconProps) => <Icon {...p}><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2Z"/><path d="M9 4v14M15 6v14"/></Icon>;
export const Sparkles = (p: IconProps) => <Icon {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.5 2.5M16 16l2.5 2.5M5.5 18.5 8 16M16 8l2.5-2.5"/></Icon>;
export const Quote = (p: IconProps) => <Icon {...p}><path d="M7 7H4v6h3l-2 4M17 7h-3v6h3l-2 4"/></Icon>;
export const Calendar = (p: IconProps) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/></Icon>;
export const Clock = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>;
export const Download = (p: IconProps) => <Icon {...p}><path d="M12 4v12M6 12l6 6 6-6M5 20h14"/></Icon>;
export const Upload = (p: IconProps) => <Icon {...p}><path d="M12 20V8M6 14l6-6 6 6M5 4h14"/></Icon>;
export const Link = (p: IconProps) => <Icon {...p}><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 1 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 1 0 7 7l1-1"/></Icon>;
export const Logout = (p: IconProps) => <Icon {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></Icon>;
export const ChevronDown = (p: IconProps) => <Icon {...p}><path d="m6 9 6 6 6-6"/></Icon>;
export const ChevronRight = (p: IconProps) => <Icon {...p}><path d="m9 6 6 6-6 6"/></Icon>;
export const Star = (p: IconProps) => <Icon {...p}><path d="m12 3 2.7 6 6.3.6-4.8 4.3 1.5 6.1L12 17l-5.7 3 1.5-6.1L3 9.6 9.3 9Z"/></Icon>;
export const Mail = (p: IconProps) => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></Icon>;
export const Lock = (p: IconProps) => <Icon {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></Icon>;
export const Eye = (p: IconProps) => <Icon {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></Icon>;
export const Trending = (p: IconProps) => <Icon {...p}><path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/></Icon>;
export const Database = (p: IconProps) => <Icon {...p}><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></Icon>;
export const Zap = (p: IconProps) => <Icon {...p}><path d="M13 2 3 14h7l-1 8 10-12h-7Z"/></Icon>;
export const Layers = (p: IconProps) => <Icon {...p}><path d="m12 2 10 6-10 6L2 8Z"/><path d="m2 14 10 6 10-6"/></Icon>;
export const Compass = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6Z"/></Icon>;
export const FileText = (p: IconProps) => <Icon {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M9 13h6M9 17h6M9 9h2"/></Icon>;
export const CreditCard = (p: IconProps) => <Icon {...p}><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 11h18"/></Icon>;
export const Shield = (p: IconProps) => <Icon {...p}><path d="M12 3 4 6v6c0 5 4 8 8 9 4-1 8-4 8-9V6Z"/></Icon>;
export const Activity = (p: IconProps) => <Icon {...p}><path d="M3 12h4l2-7 4 14 2-7h6"/></Icon>;
export const PieChart = (p: IconProps) => <Icon {...p}><path d="M21 12A9 9 0 1 1 12 3v9Z"/><path d="M21 12A9 9 0 0 0 12 3"/></Icon>;
export const BarChart = (p: IconProps) => <Icon {...p}><path d="M5 21V10M12 21V4M19 21v-7"/></Icon>;
export const GitBranch = (p: IconProps) => <Icon {...p}><circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 8v8M18 10c0 4-6 4-6 8"/></Icon>;
export const Tree = (p: IconProps) => <Icon {...p}><path d="M12 3 6 11h3l-3 5h4v5h4v-5h4l-3-5h3Z"/></Icon>;
