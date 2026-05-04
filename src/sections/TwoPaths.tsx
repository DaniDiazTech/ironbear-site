type Props = { onPickRole: (role: 'coach' | 'individual') => void };

export function TwoPaths({ onPickRole }: Props) {
  return (
    <section id="two-paths" className="ib-section">
      <div className="ib-page">
        <div className="ib-section-head">
          <span className="ib-eyebrow">Two ways in</span>
          <h2 className="ib-section-title">Pick your path.</h2>
          <p className="ib-section-sub">Iron Bear is built for two kinds of people. Same gym. Different jobs.</p>
        </div>
        <div className="ib-twopaths">
          <a
            href="#waitlist"
            className="ib-path-card coach"
            data-ib-theme="dark"
            data-track="cta:path-coach"
            onClick={() => onPickRole('coach')}
            style={{ background: '#14161A', color: '#F2F4F7', borderColor: '#262A31' }}
          >
            <img className="mascot" src="/mascots/ironbear_pointing_up.png" alt="" />
            <div className="body">
              <span className="ib-eyebrow" style={{ color: 'var(--ib-primary)', background: 'rgba(245,146,33,0.12)', borderColor: 'rgba(245,146,33,0.28)' }}>For coaches</span>
              <h3>Stop juggling spreadsheets.</h3>
              <ul>
                <li style={{ color: '#A6ADB8' }}>AI-built first drafts you actually edit</li>
                <li style={{ color: '#A6ADB8' }}>Personalized client links — no app install required</li>
                <li style={{ color: '#A6ADB8' }}>Track adherence at a glance</li>
              </ul>
              <span className="ib-btn ib-btn-primary ib-btn-sm" style={{ alignSelf: 'flex-start' }}>
                Coach early access →
              </span>
            </div>
          </a>
          <a
            href="#waitlist"
            className="ib-path-card individual"
            data-track="cta:path-individual"
            onClick={() => onPickRole('individual')}
          >
            <img className="mascot" src="/mascots/ironbear_barbell_overhead.png" alt="" />
            <div className="body">
              <span className="ib-eyebrow">For lifters</span>
              <h3>Stop guessing in the gym.</h3>
              <ul>
                <li>A program built around your goals</li>
                <li>Talk to your coach in-app</li>
                <li>Watch your strength climb every week</li>
              </ul>
              <span className="ib-btn ib-btn-primary ib-btn-sm" style={{ alignSelf: 'flex-start' }}>
                Get my plan →
              </span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
