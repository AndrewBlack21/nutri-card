import { useEffect } from "react";
import "./IntroAnimation.css";

export default function IntroAnimation({ onComplete, name, slogan }) {
  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Respeita usuários que preferem movimento reduzido.
    const duration = reducedMotion ? 100 : 5000;

    const timeoutId = window.setTimeout(() => {
      onComplete();
    }, duration);

    return () => window.clearTimeout(timeoutId);
  }, [onComplete]);

  return (
    <div
      className="intro-screen"
      role="status"
      aria-label={`Apresentação de ${name}`}
    >
      <div className="intro-content">
        <div className="intro-symbol" aria-hidden="true">
          <svg
            className="intro-leaf intro-leaf--left"
            viewBox="0 0 100 120"
            fill="none"
          >
            <path
              d="M79 12C37 14 13 37 17 69C20 91 39 102 55 91C75 77 80 43 79 12Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M24 82C37 62 53 43 74 22"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M43 60L40 39M55 47L73 49M34 72L18 62"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>

          <svg
            className="intro-leaf intro-leaf--right"
            viewBox="0 0 100 120"
            fill="none"
          >
            <path
              d="M19 14C59 18 82 40 78 68C75 88 59 99 43 88C24 75 19 44 19 14Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M72 80C59 61 43 43 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>

          <span className="intro-symbol__dot" />
        </div>

        <p className="intro-eyebrow">NUTRIÇÃO COM PROPÓSITO</p>

        <h1 className="intro-name">{name}</h1>

        <span className="intro-divider" aria-hidden="true" />

        <p className="intro-slogan">{slogan}</p>
      </div>

      <span className="intro-corner intro-corner--top" aria-hidden="true" />
      <span className="intro-corner intro-corner--bottom" aria-hidden="true" />
    </div>
  );
}
