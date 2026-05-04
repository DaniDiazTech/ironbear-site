const ITEMS = [
  {
    q: 'When does the beta open?',
    a: 'Soon. We are letting people in cohort by cohort. Get on the waitlist and we’ll email you when your seat is ready.',
  },
  {
    q: 'How much will Iron Bear cost?',
    a: 'Pricing is still being figured out. Waitlist members get founder pricing — and we’ll never spring it on you.',
  },
  {
    q: 'Do I need an app store install?',
    a: 'Coaches use the app. Clients can train from a personalized browser link too — no install required.',
  },
  {
    q: 'Can I bring my own clients?',
    a: 'Yes. Coaches invite clients with one tap and a link. Clients keep their data, even if they leave you.',
  },
  {
    q: 'Where is my data stored?',
    a: 'On our managed database, encrypted at rest. We never sell data and we never use it to train models.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="ib-section">
      <div className="ib-page">
        <div className="ib-section-head">
          <span className="ib-eyebrow">FAQ</span>
          <h2 className="ib-section-title">Quick answers.</h2>
        </div>
        <div className="ib-faq">
          {ITEMS.map((it) => (
            <details key={it.q}>
              <summary>{it.q}</summary>
              <p>{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
