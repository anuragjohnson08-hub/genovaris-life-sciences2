interface BrandMarkProps {
  tone?: 'dark' | 'light';
}

export function BrandMark({ tone = 'dark' }: BrandMarkProps) {
  const fill = tone === 'light' ? '#FFFFFF' : '#153226';
  const accentFill = tone === 'light' ? 'rgba(255,255,255,0.72)' : '#4D7260';

  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
      <svg
        width="24"
        height="24"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Left botanical leaf */}
        <path
          d="M14 23C14 23 5.5 19.2 4.5 11.2C4.2 8.7 5.2 6.8 6.8 5.8C10.9 7.1 13.7 11.3 14 17.5V23Z"
          fill={fill}
        />
        {/* Right botanical leaf */}
        <path
          d="M14 23C14 23 22.5 19.2 23.5 11.2C23.8 8.7 22.8 6.8 21.2 5.8C17.1 7.1 14.3 11.3 14 17.5V23Z"
          fill={accentFill}
        />
        {/* Central delicate stem vein */}
        <path
          d="M14 23.5V12.5"
          stroke={tone === 'light' ? '#133126' : '#F7F8F1'}
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </svg>
      <span
        className={`font-display text-[1.28rem] font-semibold tracking-[-0.02em] leading-none ${
          tone === 'light' ? 'text-white' : 'text-[#153226]'
        }`}
      >
        genovaris
      </span>
    </span>
  );
}
