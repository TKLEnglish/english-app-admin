'use client';
import { useState, useRef, useEffect } from 'react';
import React from 'react';

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: string;
  placement?: TooltipPlacement;
  delay?: number;
  children: React.ReactNode;
}

export function Tooltip({ content, placement = 'top', delay = 300, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show() {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  }

  function hide() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return (
    <span
      className="tooltip-host"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <div className={`tooltip-bubble placement-${placement}`} role="tooltip">
          {content}
          <span className={`tooltip-arrow arrow-${placement}`} />
        </div>
      )}
    </span>
  );
}
