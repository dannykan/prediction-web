"use client";

import { useState } from "react";

interface ImageWithFallbackProps {
  src?: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  fallback?: React.ReactNode;
  style?: React.CSSProperties;
}

export function ImageWithFallback({
  src,
  alt,
  fill = false,
  width,
  height,
  className = "",
  fallback,
  style,
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!src || error) {
    return (
      <div
        className={className}
        style={{
          ...style,
          width: fill ? "100%" : width,
          height: fill ? "100%" : height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1A1F3A",
        }}
      >
        {fallback || <span style={{ fontSize: "32px" }}>📊</span>}
      </div>
    );
  }

  if (fill) {
    return (
      <div className="relative w-full h-full" style={style}>
        <img
          src={src}
          alt={alt}
          className={`${className} object-cover`}
          style={{ width: "100%", height: "100%" }}
          onError={() => setError(true)}
          onLoad={() => setLoading(false)}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1A1F3A]">
            <span style={{ fontSize: "32px" }}>📊</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      onError={() => setError(true)}
      onLoad={() => setLoading(false)}
    />
  );
}



