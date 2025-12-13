import React from 'react';
import { cn } from '../../lib/utils';

export function BentoGrid({ className, children }) {
  return (
    <div className={cn('bento-grid', className)}>
      {children}
    </div>
  );
}

export function BentoCard({
  className,
  title,
  description,
  header,
  icon,
  background,
}) {
  return (
    <div className={cn('bento-card', className)}>
      {header}
      <div style={{ marginTop: 'var(--space-lg)' }}>
        {icon}
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {background}
    </div>
  );
}

