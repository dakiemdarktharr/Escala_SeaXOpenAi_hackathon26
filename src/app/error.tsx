"use client";

import { EscalaMark } from "@/components/ui/escala-mark";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="page-error" role="alert">
      <EscalaMark className="brand-mark" />
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
