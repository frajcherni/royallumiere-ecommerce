import React, { useEffect, useState } from 'react';
import { fetchAnnouncements, Announcement, FALLBACK_ANNOUNCEMENTS } from '../api';

/**
 * The scrolling announcement bar above the header.
 *
 * Messages are managed from the ERP (Site Web → Gestion Annonces). Each one
 * carries a `marker` — a small glyph drawn purely in CSS rather than an icon
 * component — and an `accent` colour, so the bar keeps one visual rhythm no
 * matter what the copy says.
 */
const TopBar: React.FC = () => {
  const [items, setItems] = useState<Announcement[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchAnnouncements();
        if (cancelled) return;
        // An empty table still deserves a populated bar.
        setItems(data.length > 0 ? data : FALLBACK_ANNOUNCEMENTS);
      } catch (e) {
        console.error('Announcements error:', e);
        if (!cancelled) setItems(FALLBACK_ANNOUNCEMENTS);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // The marquee translates by -50%, so the list has to be rendered twice for
  // the loop to be seamless.
  const loop = [...items, ...items];

  // Longer copy needs a longer cycle, otherwise it whips past unreadably.
  const duration = Math.max(18, items.length * 4.5);

  return (
    <div className={`mqbar${ready ? ' is-ready' : ''}`}>
      <div className="mqwrap" style={{ animationDuration: `${duration}s` }}>
        {loop.map((item, i) => (
          <span className="mqi" key={`${item.id}-${i}`}>
            <i className={`mqm mqm-${item.marker} acc-${item.accent}`} aria-hidden="true" />
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TopBar;
