type Props = { size?: number; tile?: string; stroke?: string; dot?: string };

export default function Logo({ size = 30, tile = "#F5F5F2", stroke = "#0C0C0E", dot = "#C6F432" }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <rect width="120" height="120" rx="30" fill={tile} />
      <path
        d="M22 85 V50 a15 15 0 0 1 30 0 V85 M52 50 a15 15 0 0 1 30 0 V85"
        fill="none"
        stroke={stroke}
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="99" cy="83" r="9" fill={dot} />
    </svg>
  );
}
