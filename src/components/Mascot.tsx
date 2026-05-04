type Props = {
  src: string;
  alt?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

export function Mascot({ src, alt = '', size, className, style }: Props) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      style={size ? { width: size, height: size, ...style } : style}
    />
  );
}
