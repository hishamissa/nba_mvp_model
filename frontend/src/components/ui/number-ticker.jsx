import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

export function NumberTicker({ value, direction = 'up', className, delay = 0 }) {
  const [displayValue, setDisplayValue] = useState(direction === 'up' ? 0 : value);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const startAnimation = () => {
      setIsAnimating(true);
      const startValue = direction === 'up' ? 0 : value;
      const endValue = value;
      const duration = 2000; // 2 seconds
      const steps = 60;
      const stepValue = (endValue - startValue) / steps;
      const stepDuration = duration / steps;

      let currentStep = 0;
      intervalRef.current = setInterval(() => {
        currentStep++;
        const currentValue = startValue + stepValue * currentStep;
        
        if (direction === 'up') {
          setDisplayValue(Math.min(currentValue, endValue));
        } else {
          setDisplayValue(Math.max(currentValue, endValue));
        }

        if (currentStep >= steps) {
          setDisplayValue(endValue);
          clearInterval(intervalRef.current);
          setIsAnimating(false);
        }
      }, stepDuration);
    };

    timeoutRef.current = setTimeout(startAnimation, delay);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, direction, delay]);

  const formatValue = (val) => {
    if (typeof val !== 'number') return val;
    // If value is an integer or close to it, show as integer
    if (Math.abs(val - Math.round(val)) < 0.01) {
      return Math.round(val).toString();
    }
    // Otherwise show one decimal place
    return val.toFixed(1);
  };

  return (
    <span className={cn('tabular-nums', className)}>
      {formatValue(displayValue)}
    </span>
  );
}

