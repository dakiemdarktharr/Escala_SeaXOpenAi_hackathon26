"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="page-error" role="alert">
      <span className="brand-mark" aria-hidden="true">
        e
      </span>
      <h1>The workspace couldn’t load.</h1>
      <p>
        Your saved decisions are kept on the server. Try opening the workspace
        again.
      </p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
