type Props = { size?: 'sm' | 'md'; showWordmark?: boolean };

export function Logo({ size = 'md', showWordmark = true }: Props) {
  const dim = size === 'sm' ? 28 : 38;
  const inner = size === 'sm' ? 38 : 50;
  return (
    <a className="ib-logo" href="/" aria-label="Iron Bear">
      <span className="ib-logo-badge" style={{ width: dim, height: dim }}>
        <img src="/mascots/ironbear_logo.png" alt="" style={{ width: inner, height: inner }} />
      </span>
      {showWordmark && (
        <span className="ib-logo-wordmark">
          Iron&nbsp;<span className="accent">B</span>ear
        </span>
      )}
    </a>
  );
}
