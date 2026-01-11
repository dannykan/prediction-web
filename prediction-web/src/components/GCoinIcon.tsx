interface GCoinIconProps {
  size?: number;
  className?: string;
}

export function GCoinIcon({ size = 16, className = "" }: GCoinIconProps) {
  return (
    <span
      className={`inline-block ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundImage: "url('/images/G_coin_icon.png')",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
      aria-label="G Coin"
    />
  );
}



