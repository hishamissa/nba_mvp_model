import React from 'react';
import { cn } from '../../lib/utils';

export function RainbowButton({ className, children, ...props }) {
  return (
    <button
      className={cn(
        'group relative inline-flex h-11 animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-[length:200%] px-8 py-2 font-medium text-primary-foreground transition-colors [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        'bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,#6366f1,#8b5cf6,#d946ef,#ec4899,#f43f5e)]',
        'hover:bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,#818cf8,#a78bfa,#e879f9,#f472b6,#fb7185)]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

