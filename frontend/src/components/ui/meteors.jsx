import React from 'react';
import { cn } from '../../lib/utils';

export function Meteors({ number = 20, className }) {
  const meteors = new Array(number || 20).fill(true);
  
  return (
    <>
      {meteors.map((el, idx) => {
        const randomLeft = Math.floor(Math.random() * (400 - -400) + -400);
        const randomDelay = Math.random() * (0.8 - 0.2) + 0.2;
        const randomDuration = Math.floor(Math.random() * (10 - 2) + 2);
        
        return (
          <span
            key={'meteor' + idx}
            className={cn('meteor', className)}
            style={{
              position: 'absolute',
              top: '50%',
              left: `${50 + randomLeft}%`,
              width: '2px',
              height: '2px',
              borderRadius: '50%',
              backgroundColor: '#64748b',
              boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.1)',
              transform: 'rotate(215deg)',
              animationDelay: `${randomDelay}s`,
              animationDuration: `${randomDuration}s`,
            }}
          >
            <span 
              className="meteor-tail"
              style={{
                content: '""',
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '50px',
                height: '1px',
                background: 'linear-gradient(to right, #64748b, transparent)',
              }}
            />
          </span>
        );
      })}
    </>
  );
}

