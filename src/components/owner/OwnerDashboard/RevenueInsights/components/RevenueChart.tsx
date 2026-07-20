/**
 * RevenueChart component for displaying the interactive SVG chart
 */

import { ChartPoint } from '../types';

interface RevenueChartProps {
  data: ChartPoint[];
  activePoint: number;
  setActivePoint: (i: number) => void;
  isThai: boolean;
}

export function RevenueChart({ data, activePoint, setActivePoint, isThai }: RevenueChartProps) {
  return (
    <div className="w-full h-[150px] relative mt-4 z-10 select-none">
      <svg viewBox="0 0 310 150" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Dotted Grid Lines */}
        <line x1="30" y1="140" x2="280" y2="140" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <line x1="30" y1="100" x2="280" y2="100" stroke="rgba(255,255,255,0.08)" strokeDasharray="3,3" />
        <line x1="30" y1="60" x2="280" y2="60" stroke="rgba(255,255,255,0.08)" strokeDasharray="3,3" />

        {/* Fill Area Gradient */}
        <path
          d="M 30,120 L 80,105 L 130,90 L 180,75 L 230,68 L 280,60 L 280,140 L 30,140 Z"
          fill="url(#chartGrad)"
          className="transition-all duration-300"
        />

        {/* Main Curve Stroke */}
        <path
          d="M 30,120 L 80,105 L 130,90 L 180,75 L 230,68 L 280,60"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Active Month Column Indicator Highlight */}
        {activePoint !== null && (
          <line
            x1={data[activePoint].x}
            y1="40"
            x2={data[activePoint].x}
            y2="140"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1.5"
            strokeDasharray="2,2"
            className="transition-all duration-300"
          />
        )}

        {/* Point Nodes */}
        {data.map((pt, i) => {
          const isActive = activePoint === i;
          return (
            <g key={i} className="cursor-pointer">
              {/* Node Outer Halo on hover/active */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isActive ? 9 : 6}
                fill={isActive ? '#3b82f6' : 'rgba(255,255,255,0.1)'}
                stroke="#ffffff"
                strokeWidth={isActive ? 2.5 : 1.5}
                className="transition-all duration-200"
                filter={isActive ? 'url(#glow)' : undefined}
              />
              {/* Inner dot */}
              {isActive && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={3}
                  fill="#ffffff"
                />
              )}
            </g>
          );
        })}

        {/* Month Labels under chart */}
        {data.map((pt, i) => (
          <text
            key={i}
            x={pt.x}
            y="148"
            fill={activePoint === i ? '#ffffff' : 'rgba(255,255,255,0.5)'}
            fontSize="9"
            fontWeight={activePoint === i ? 'bold' : 'normal'}
            textAnchor="middle"
            className="transition-all duration-200"
          >
            {isThai ? pt.monthTh : pt.monthEn}
          </text>
        ))}

        {/* Transparent Hover Columns for interactivity */}
        {data.map((pt, i) => (
          <rect
            key={i}
            x={pt.x - 25}
            y="20"
            width="50"
            height="125"
            fill="transparent"
            className="cursor-pointer"
            onMouseEnter={() => setActivePoint(i)}
          />
        ))}
      </svg>
    </div>
  );
}
