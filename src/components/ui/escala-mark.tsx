export function EscalaMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M6 10h11v2.6H9v3.2h7.2v2.5H9v3.3h8.4v2.6H6V10Z"
      />
      <path
        d="M31.8 7.1a7.1 7.1 0 0 0-8.8 8.8l-8.1 8.2a3 3 0 0 0 4.2 4.2l8.2-8.1a7.1 7.1 0 0 0 8.8-8.8l-4.4 4.4-4.7-4.7 4.8-4Z"
        fill="currentColor"
      />
      <circle cx="17" cy="26.2" r="1.1" fill="#D94A25" />
    </svg>
  );
}