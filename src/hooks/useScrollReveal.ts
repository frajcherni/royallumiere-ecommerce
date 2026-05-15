import { useEffect } from 'react';

export const useScrollReveal = () => {
  useEffect(() => {
    const rv = () => {
      document.querySelectorAll('.rv:not(.vis)').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 50) {
          el.classList.add('vis');
        }
      });
    };

    window.addEventListener('scroll', rv, { passive: true });
    rv(); // Initial check

    return () => window.removeEventListener('scroll', rv);
  }, []);
};
