import React, { useEffect, useRef, useState } from 'react';

/**
 * Thin progress bar pinned under the header.
 *
 * It eases towards ~90% while `active` is true, then snaps to 100% and fades
 * out — the familiar "something is happening" cue, so navigation never feels
 * like a dead click.
 */
const RouteProgress: React.FC<{ active: boolean }> = ({ active }) => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    if (active) {
      setVisible(true);
      setProgress(8);
      const step = (value: number, delay: number) => {
        timers.current.push(setTimeout(() => setProgress(value), delay));
      };
      step(38, 90);
      step(64, 260);
      step(80, 520);
      step(90, 900);
      return () => { timers.current.forEach(clearTimeout); timers.current = []; };
    }

    if (visible) {
      setProgress(100);
      timers.current.push(setTimeout(() => setVisible(false), 320));
      timers.current.push(setTimeout(() => setProgress(0), 520));
    }
    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
    // `visible` is intentionally read but not tracked — it only gates the exit
    // animation and adding it here would restart the bar on every fade-out.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  return (
    <div className={`rprog${visible ? ' on' : ''}`} role="progressbar" aria-hidden={!visible}>
      <div className="rprog-bar" style={{ width: `${progress}%` }} />
    </div>
  );
};

export default RouteProgress;
