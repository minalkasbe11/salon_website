import useScrollReveal from '../hooks/useScrollReveal';

// Fades + slides a section up into place the first time it scrolls into view.
// Respects prefers-reduced-motion via the duration-0 fallback in index.css.
export default function Reveal({ children, className = '', delay = 0 }) {
  const [ref, isVisible] = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  );
}
