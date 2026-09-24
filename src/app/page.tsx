import { InboxWorkspace } from "@/components/inbox/inbox-workspace";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string; thread?: string }>;
}) {
  const query = await searchParams;
  return (
    <InboxWorkspace
      initialMode={query.preview === "1" ? "sample" : "api"}
      initialThreadId={typeof query.thread === "string" ? query.thread : null}
    />
  );
}
