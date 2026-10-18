import React, { useEffect, useState } from 'react';

export const GrainOverlay: React.FC = () => {
  const [grainUrl, setGrainUrl] = useState<string>('');

  useEffect(() => {
    // Generate a subtle 64x64 tiling noise canvas to data URL
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const imgData = ctx.createImageData(64, 64);
      const buffer = new Uint32Array(imgData.data.buffer);
      for (let i = 0; i < buffer.length; i++) {
        const noise = Math.random() * 255;
        // Subtle monochrome grain pixel
        buffer[i] = (24 << 24) | (noise << 16) | (noise << 8) | noise;
      }
      ctx.putImageData(imgData, 0, 0);
      setGrainUrl(canvas.toDataURL('image/png'));
    }
  }, []);

  if (!grainUrl) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 select-none mix-blend-overlay transition-opacity duration-150"
      style={{
        backgroundImage: `url(${grainUrl})`,
        backgroundRepeat: 'repeat',
        opacity: 'calc(0.38 + var(--level, 0) * 0.28)',
      }}
    />
  );
};
