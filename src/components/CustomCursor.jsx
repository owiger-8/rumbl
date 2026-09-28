import React, { useEffect, useState } from 'react';

export default function CustomCursor({ cursorMode }) {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [dotPos, setDotPos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setDotPos({ x: e.clientX, y: e.clientY });
    };

    let frameId;
    const updateRing = () => {
      setPos((prev) => ({
        x: prev.x + (dotPos.x - prev.x) * 0.22,
        y: prev.y + (dotPos.y - prev.y) * 0.22,
      }));
      frameId = requestAnimationFrame(updateRing);
    };

    window.addEventListener('mousemove', handleMouseMove);
    frameId = requestAnimationFrame(updateRing);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, [dotPos.x, dotPos.y]);

  let label = '';
  let ringClass = '';

  if (cursorMode === 'product') {
    label = 'ROTATE';
    ringClass = 'hover-product';
  } else if (cursorMode === 'cta') {
    label = 'ENTER →';
    ringClass = 'hover-cta';
  } else if (cursorMode === 'activate') {
    label = 'HOLD';
    ringClass = 'hover-activate';
  }

  return (
    <>
      <div
        className="custom-cursor-dot"
        style={{ transform: `translate(${dotPos.x}px, ${dotPos.y}px)` }}
      />
      <div
        className={`custom-cursor-ring ${ringClass}`}
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      >
        {label}
      </div>
    </>
  );
}
