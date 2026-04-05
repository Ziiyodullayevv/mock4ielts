'use client';

import * as React from 'react';
import { cn } from '@/src/lib/utils';
import { Slider } from '@/src/components/ui/slider';

interface CircularProgressProps {
  value: number;
  renderLabel?: (progress: number) => number | string;
  size?: number;
  strokeWidth?: number;
  circleStrokeWidth?: number;
  progressStrokeWidth?: number;
  shape?: 'square' | 'round';
  className?: string;
  progressClassName?: string;
  labelClassName?: string;
  circleStyle?: React.CSSProperties;
  progressStyle?: React.CSSProperties;
  showLabel?: boolean;
}

export function CircularProgress({
  value,
  renderLabel,
  className,
  progressClassName,
  labelClassName,
  circleStyle,
  progressStyle,
  showLabel,
  shape = 'round',
  size = 100,
  strokeWidth,
  circleStrokeWidth = 10,
  progressStrokeWidth = 10,
}: CircularProgressProps) {
  const resolvedCircleStrokeWidth = strokeWidth ?? circleStrokeWidth;
  const resolvedProgressStrokeWidth = strokeWidth ?? progressStrokeWidth;
  const maxStrokeWidth = Math.max(resolvedCircleStrokeWidth, resolvedProgressStrokeWidth);
  const radius = Math.max(0, size / 2 - maxStrokeWidth / 2 - 1);
  const circumference = 2 * Math.PI * radius;
  const percentage = circumference * ((100 - value) / 100);
  const viewBox = `0 0 ${size} ${size}`;

  return (
    <div className="relative">
      <svg
        className="relative"
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
        version="1.1"
        viewBox={viewBox}
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Base Circle */}
        <circle
          className={cn('stroke-primary/25', className)}
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          r={radius}
          style={circleStyle}
          strokeDasharray={circumference}
          strokeDashoffset="0"
          strokeWidth={resolvedCircleStrokeWidth}
        />

        {/* Progress */}
        <circle
          className={cn('stroke-primary', progressClassName)}
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          r={radius}
          style={progressStyle}
          strokeDasharray={circumference}
          strokeDashoffset={percentage}
          strokeLinecap={shape}
          strokeWidth={resolvedProgressStrokeWidth}
        />
      </svg>
      {showLabel && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center text-md',
            labelClassName
          )}
        >
          {renderLabel ? renderLabel(value) : value}
        </div>
      )}
    </div>
  );
}

export default function CircularProgressStrokeWidthDemo() {
  const [progress, setProgress] = React.useState([13]);

  return (
    <div className="mx-auto flex w-full max-w-xs flex-col items-center">
      <div className="flex items-center gap-1">
        <CircularProgress
          labelClassName="text-xl font-bold"
          // eslint-disable-next-line @typescript-eslint/no-shadow
          renderLabel={(progress) => `${progress}%`}
          showLabel
          size={120}
          strokeWidth={10}
          value={progress[0]}
        />
        <CircularProgress
          circleStrokeWidth={12}
          labelClassName="text-xl font-bold"
          progressStrokeWidth={6}
          // eslint-disable-next-line @typescript-eslint/no-shadow
          renderLabel={(progress) => `${progress}%`}
          showLabel
          size={120}
          value={progress[0]}
        />
        <CircularProgress
          circleStrokeWidth={6}
          labelClassName="text-xl font-bold"
          progressStrokeWidth={10}
          // eslint-disable-next-line @typescript-eslint/no-shadow
          renderLabel={(progress) => `${progress}%`}
          showLabel
          size={120}
          value={progress[0]}
        />
      </div>
      <Slider
        className="mt-6"
        defaultValue={progress}
        max={100}
        onValueChange={setProgress}
        step={1}
      />
    </div>
  );
}
