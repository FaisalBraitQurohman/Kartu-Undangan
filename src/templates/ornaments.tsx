export function Botanical({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 180 260"
      className={`botanical ${className}`}
      fill="none"
    >
      <path
        d="M32 248C55 175 104 118 125 20"
        stroke="currentColor"
        strokeWidth="1"
      />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i} transform={`translate(${i * 13},${-i * 32})`}>
          <path
            d="M44 223C12 225 5 202 8 187C38 184 45 207 44 223Z"
            fill="currentColor"
            opacity=".5"
          />
          <path
            d="M49 218C74 218 89 195 80 178C55 182 50 203 49 218Z"
            fill="currentColor"
            opacity=".4"
          />
        </g>
      ))}
    </svg>
  );
}
export function Flower() {
  return (
    <svg className="flower" aria-hidden="true" viewBox="0 0 300 350">
      <g transform="translate(150 145)" fill="#cb9696">
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse
            key={i}
            cx="0"
            cy="-55"
            rx="37"
            ry="68"
            transform={`rotate(${i * 45})`}
            opacity=".55"
          />
        ))}
        <circle r="30" fill="#d9bda0" />
      </g>
      <path
        d="M150 170Q145 250 100 350"
        fill="none"
        stroke="#87977b"
        strokeWidth="3"
      />
      <path
        d="M145 245Q200 195 224 226Q210 268 145 245M127 283Q60 235 47 272Q72 305 127 283"
        fill="#87977b"
        opacity=".7"
      />
    </svg>
  );
}
