type Props = { items: string[] };

export function Marquee({ items }: Props) {
  // Duplicate the list so the loop is seamless
  const doubled = [...items, ...items];
  return (
    <div className="ib-marquee" aria-hidden>
      <div className="ib-marquee-track">
        {doubled.map((it, i) => (
          <span key={`${it}-${i}`}>{it}</span>
        ))}
      </div>
    </div>
  );
}
