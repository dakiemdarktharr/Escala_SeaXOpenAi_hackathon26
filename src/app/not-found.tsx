import Link from "next/link";
import { EscalaMark } from "@/components/ui/escala-mark";

export default function NotFound() {
  return (
    <main className="page-error">
      <EscalaMark className="brand-mark" />
      <h1>This page isn’t in your inbox.</h1>
      <p>Return to your conversations to pick up where you left off.</p>
      <Link className="button primary" href="/">
        Open inbox
      </Link>
    </main>
  );
}
