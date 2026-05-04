const STEPS = [
  {
    n: '01',
    mascot: '/mascots/ironbear_drinkingwater.png',
    title: 'Get on the list',
    body: 'Tell us if you coach or lift. Email is enough.',
  },
  {
    n: '02',
    mascot: '/mascots/ironbear_stopwatch.png',
    title: 'We open the gates',
    body: 'When the beta cohort opens, you’ll be first in.',
  },
  {
    n: '03',
    mascot: '/mascots/ironbear_running.png',
    title: 'You start training',
    body: 'Coach builds the plan. You crush the work.',
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="ib-section" style={{ background: 'var(--ib-surface-2)' }}>
      <div className="ib-page">
        <div className="ib-section-head">
          <span className="ib-eyebrow">How it works</span>
          <h2 className="ib-section-title">Three steps. No noise.</h2>
        </div>
        <div className="ib-steps">
          {STEPS.map((s) => (
            <div className="ib-step-card" key={s.n}>
              <div className="ib-step-num">STEP {s.n}</div>
              <h4>{s.title}</h4>
              <p>{s.body}</p>
              <img className="mascot" src={s.mascot} alt="" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
