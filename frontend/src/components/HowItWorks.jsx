import React, { useRef } from 'react';
import { AnimatedBeam } from './ui/animated-beam';
import { cn } from '../lib/utils';

const Circle = ({ className, children, style }) => {
  return (
    <div
      className={cn('how-it-works-circle', className)}
      style={{
        zIndex: 10,
        display: 'flex',
        width: '48px',
        height: '48px',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        border: '2px solid',
        backgroundColor: 'var(--bg-card)',
        padding: 'var(--space-sm)',
        boxShadow: '0 0 20px -12px rgba(0, 0, 0, 0.8)',
        ...style
      }}
    >
      {children}
    </div>
  );
};

const HowItWorks = () => {
  const containerRef = useRef(null);
  const div1Ref = useRef(null);
  const div2Ref = useRef(null);
  const div3Ref = useRef(null);
  const div4Ref = useRef(null);

  return (
    <section className="how-it-works-section" style={{ marginTop: '40px', marginBottom: '40px' }}>
      <div className="glass-card">
        <h2 className="section-title" style={{ marginBottom: '30px', textAlign: 'center' }}>
          How It Works
        </h2>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            height: '300px',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            padding: 'var(--space-xl)',
          }}
          ref={containerRef}
        >
          <div style={{
            display: 'flex',
            width: '100%',
            maxHeight: '250px',
            maxWidth: '900px',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'space-between',
            gap: 'var(--space-xl)',
          }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-md)' }}>
                <Circle ref={div1Ref} style={{ borderColor: 'var(--accent-primary)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Circle>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Player Stats</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>PTS, REB, AST, PER</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-md)' }}>
                <Circle ref={div2Ref} style={{ borderColor: 'var(--accent-secondary)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Circle>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Feature Engineering</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Z-scores, Interactions</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-md)' }}>
                <Circle ref={div3Ref} style={{ width: '64px', height: '64px', borderColor: 'var(--accent-success)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Circle>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>ML Models</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Random Forest, XGBoost, Ridge</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-md)' }}>
                <Circle ref={div4Ref} style={{ borderColor: 'var(--accent-warning)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Circle>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>MVP Predictions</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Award Share %</div>
                </div>
              </div>
            </div>
          </div>

          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div1Ref}
            toRef={div2Ref}
            curvature={-50}
            duration={3}
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div2Ref}
            toRef={div3Ref}
            curvature={0}
            duration={3}
            delay={0.5}
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div3Ref}
            toRef={div4Ref}
            curvature={0}
            duration={3}
            delay={1}
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

