type Props = { current: number; total: number };
export function StepDots({ current, total }: Props) {
  return (
    <div className="ib-step-dots" aria-label={`Step ${current} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => {
        const idx = i + 1;
        const cls = idx === current ? 'ib-step-dot active' : idx < current ? 'ib-step-dot done' : 'ib-step-dot';
        return <span key={idx} className={cls} />;
      })}
    </div>
  );
}
