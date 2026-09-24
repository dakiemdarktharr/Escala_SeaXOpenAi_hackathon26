import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-error">
      <span className="brand-mark" aria-hidden="true">
        e
      </span>
      <h1>This page isn’t in your inbox.</h1>
      <p>Return to your conversations to pick up where you left off.</p>
      <Link className="button primary" href="/">
        Open inbox
      </Link>
    </main>
  );
}
