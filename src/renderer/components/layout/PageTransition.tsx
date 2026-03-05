// src/renderer/components/layout/PageTransition.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

/**
 * Smooth page transition wrapper.
 * Cross-fades between old and new content without blank frames.
 */
export function PageTransition({ children }: Props) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitioning, setTransitioning] = useState(false);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevPath.current) {
      prevPath.current = location.pathname;
      setTransitioning(true);

      // Quick fade then swap
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setTransitioning(false);
      }, 120);

      return () => clearTimeout(timer);
    } else {
      setDisplayChildren(children);
    }
  }, [location.pathname, children]);

  return (
    <div
      className="page-transition"
      style={{
        opacity: transitioning ? 0 : 1,
        transform: transitioning ? 'translateY(6px)' : 'translateY(0)',
        transition: 'opacity 120ms ease, transform 120ms ease',
      }}
    >
      {displayChildren}
    </div>
  );
}
