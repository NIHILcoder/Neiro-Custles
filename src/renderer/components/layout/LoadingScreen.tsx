// src/renderer/components/layout/LoadingScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import './loading.css';

interface Props {
  onDone: () => void;
}

const TITLE = 'Neiro Castles';

const STATUS_MESSAGES = [
  'Initializing neural core...',
  'Loading intelligence modules...',
  'Calibrating response engine...',
  'Almost ready...',
];

const VERSION = 'v6.9.1-beta';

export function LoadingScreen({ onDone }: Props) {
  const [exiting, setExiting] = useState(false);
  const [statusIdx, setStatusIdx] = useState(0);
  // Remount key to re-trigger status slide animation on each change
  const [statusKey, setStatusKey] = useState(0);

  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const cycleInterval = setInterval(() => {
      setStatusIdx(i => (i + 1) % STATUS_MESSAGES.length);
      setStatusKey(k => k + 1);
    }, 540);

    const exitTimer = setTimeout(() => setExiting(true), 2200);
    const doneTimer = setTimeout(() => onDoneRef.current(), 2820);

    return () => {
      clearInterval(cycleInterval);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <div className={`loader${exiting ? ' loader--exit' : ''}`}>
      {/* Multi-layer ambient background */}
      <div className="loader__bg-orb-main" />
      <div className="loader__bg-orb-secondary" />
      <div className="loader__bg-orb-tertiary" />

      {/* One-shot scan line sweep */}
      <div className="loader__scan" />

      {/* Corner brackets */}
      <div className="loader__corner loader__corner--tl" />
      <div className="loader__corner loader__corner--tr" />
      <div className="loader__corner loader__corner--bl" />
      <div className="loader__corner loader__corner--br" />

      {/* Center */}
      <div className="loader__center">

        {/* Logo */}
        <div className="loader__logo-wrap">
          <div className="loader__logo-ripple" />
          <div className="loader__logo-ripple loader__logo-ripple--2" />
          <div className="loader__logo-ripple loader__logo-ripple--3" />
          <div className="loader__logo-ring" />
          <div className="loader__logo-mark">N</div>
        </div>

        {/* Title + status */}
        <div className="loader__text-group">
          <h1 className="loader__title" aria-label={TITLE}>
            {TITLE.split('').map((char, i) => (
              <span
                key={i}
                className="loader__char"
                style={{ animationDelay: `${380 + i * 42}ms` }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>
          <div className="loader__status-wrap">
            <p key={statusKey} className="loader__status">
              {STATUS_MESSAGES[statusIdx]}
            </p>
          </div>
        </div>

        {/* Progress + version */}
        <div className="loader__progress-wrap">
          <div className="loader__progress-track">
            <div className="loader__progress-fill" />
          </div>
          <span className="loader__version">{VERSION}</span>
        </div>

      </div>
    </div>
  );
}
