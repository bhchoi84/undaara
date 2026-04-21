interface Props {
  type: string;
  className?: string;
}

export default function CardSymbolIcon({ type, className = "card-sym-img" }: Props) {
  switch (type) {
    case "pentacle":
      return <img src="/img/pentacle.svg" className={className} alt="동전" />;
    case "wand":
      return <img src="/img/wand.svg" className={className} alt="지팡이" />;
    case "world":
      return <img src="/img/world.svg" className={className} alt="세계" />;
    default:
      return <span>{type}</span>;
  }
}
