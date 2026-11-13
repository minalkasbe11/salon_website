import { useEffect, useRef, useState } from 'react';

export default function useScrollReveal(options = { threshold: 0.15 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect(); // reveal once, don't re-animate on scroll back up
      }
    }, options);

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
}
