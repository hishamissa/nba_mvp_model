import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 3,
  delay = 0,
  className,
}) {
  const pathRef = useRef(null);

  useEffect(() => {
    const updatePath = () => {
      if (!containerRef?.current || !fromRef?.current || !toRef?.current || !pathRef?.current) {
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const fromRect = fromRef.current.getBoundingClientRect();
      const toRect = toRef.current.getBoundingClientRect();

      const fromX = fromRect.left - containerRect.left + fromRect.width / 2;
      const fromY = fromRect.top - containerRect.top + fromRect.height / 2;
      const toX = toRect.left - containerRect.left + toRect.width / 2;
      const toY = toRect.top - containerRect.top + toRect.height / 2;

      const midX = (fromX + toX) / 2;
      const midY = (fromY + toY) / 2;

      const dx = toX - fromX;
      const dy = toY - fromY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const controlPointX = midX + (curvature * dy) / distance;
      const controlPointY = midY - (curvature * dx) / distance;

      const path = `M ${fromX},${fromY} Q ${controlPointX},${controlPointY} ${toX},${toY}`;

      pathRef.current.setAttribute('d', path);
    };

    updatePath();
    window.addEventListener('resize', updatePath);
    return () => window.removeEventListener('resize', updatePath);
  }, [containerRef, fromRef, toRef, curvature]);

  return (
    <svg
      className={cn(
        'pointer-events-none absolute left-0 top-0 transform-gpu stroke-2',
        className
      )}
      width="100%"
      height="100%"
    >
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
          <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        ref={pathRef}
        d=""
        fill="none"
        stroke="url(#gradient)"
        strokeWidth="2"
        strokeDasharray="8 4"
        style={{
          animation: `dash ${duration}s linear ${delay}s infinite`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      />
    </svg>
  );
}

