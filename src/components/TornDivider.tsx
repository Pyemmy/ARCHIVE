import React from 'react';

interface TornDividerProps {
  color: string;
  position?: 'top' | 'bottom';
  height?: number;
  className?: string;
  flip?: boolean;
}

export const TornDivider: React.FC<TornDividerProps> = ({
  color,
  position = 'top',
  height = 64,
  className = '',
  flip = false,
}) => {
  return (
    <div
      aria-hidden="true"
      className={`absolute left-0 right-0 w-full z-20 pointer-events-none overflow-hidden select-none ${
        position === 'top' ? '-top-[1px]' : '-bottom-[1px]'
      } ${className}`}
      style={{ height: `${height}px` }}
    >
      <svg
        viewBox="0 0 1200 64"
        preserveAspectRatio="none"
        className={`w-full h-full ${flip ? 'scale-x-[-1]' : ''}`}
        style={{
          transform: position === 'bottom' ? 'rotate(180deg)' : undefined,
        }}
      >
        <path
          d="M0,0 L0,42 Q25,24 50,38 T100,16 T150,44 T200,22 T250,46 T300,18 T350,40 T400,14 T450,42 T500,20 T550,44 T600,12 T650,38 T700,16 T750,42 T800,22 T850,46 T900,14 T950,40 T1000,18 T1050,44 T1100,20 T1150,38 T1200,16 L1200,0 Z"
          fill={color}
        />
      </svg>
    </div>
  );
};
