"use client";

const ZODIACS = [
  { emoji: "🐏", name: "양자리", short: "양" },
  { emoji: "🐂", name: "황소자리", short: "황소" },
  { emoji: "👯", name: "쌍둥이자리", short: "쌍둥이" },
  { emoji: "🦀", name: "게자리", short: "게" },
  { emoji: "🦁", name: "사자자리", short: "사자" },
  { emoji: "🧚", name: "처녀자리", short: "처녀" },
  { emoji: "⚖️", name: "천칭자리", short: "천칭" },
  { emoji: "🦂", name: "전갈자리", short: "전갈" },
  { emoji: "🏹", name: "사수자리", short: "사수" },
  { emoji: "🐐", name: "염소자리", short: "염소" },
  { emoji: "🌊", name: "물병자리", short: "물병" },
  { emoji: "🐠", name: "물고기자리", short: "물고기" },
] as const;

interface Props {
  selected: string | null;
  onSelect: (name: string) => void;
  showFull?: boolean;
}

export default function ZodiacGrid({ selected, onSelect, showFull = false }: Props) {
  return (
    <div className="zodiac-grid">
      {ZODIACS.map((z) => (
        <button
          key={z.name}
          className={`zodiac-btn ${selected === z.name ? "sel-a" : ""}`}
          onClick={() => onSelect(z.name)}
        >
          {z.emoji} {showFull ? z.name : z.short}
        </button>
      ))}
    </div>
  );
}
