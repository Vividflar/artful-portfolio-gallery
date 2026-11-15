import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

function ownedArtworksQueryOptions(userId: string) {
  return queryOptions({
    queryKey: ["admin-artworks", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artworks")
        .select("id, title, image_path, is_public, created_at")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Gallery admin — Portfolio" },
      { name: "description", content: "Manage your portfolio gallery." },
      { property: "og:title", content: "Gallery admin — Portfolio" },
      { property: "og:description", content: "Manage your portfolio gallery." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/" });
    return { userId: data.user.id, email: data.user.email ?? "" };
  },
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(ownedArtworksQueryOptions(context.userId)),
  pendingComponent: AdminLoading,
  errorComponent: AdminError,
  component: AdminPage,
});

function AdminPage() {
  const { userId, email } = Route.useRouteContext();
  const { data: artworks } = useSuspenseQuery(ownedArtworksQueryOptions(userId));
  const queryClient = useQueryClient();
  const navigate = useNavigate({ from: "/admin" });
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  async function handleSignOut() {
    setIsSigningOut(true);
    setSignOutError(null);
    await queryClient.cancelQueries();
    queryClient.clear();
    const { error } = await supabase.auth.signOut();
    if (error) {
      setIsSigningOut(false);
      setSignOutError("Couldn’t sign out. Please try again.");
      return;
    }
    await navigate({ to: "/", replace: true });
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-[1680px] items-center justify-between gap-5 border-b border-border px-5 py-6 sm:px-8 lg:px-12">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Portfolio
          </p>
          <h1 className="mt-1 font-serif text-3xl font-normal">Gallery admin</h1>
        </div>
        <Button variant="outline" onClick={handleSignOut} disabled={isSigningOut}>
          {isSigningOut ? "Signing out…" : "Log out"}
        </Button>
      </header>
      <section className="mx-auto max-w-[1680px] px-5 py-10 sm:px-8 lg:px-12">
        <p className="text-sm text-muted-foreground">Signed in as {email}</p>
        <div className="mt-8 flex items-center justify-between border-b border-border pb-4">
          <h2 className="font-serif text-2xl font-normal">Your work</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/">View gallery</Link>
          </Button>
        </div>
        {artworks.length === 0 ? (
          <p className="py-16 text-center font-serif text-xl text-muted-foreground">
            No work added yet
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {artworks.map((artwork) => (
              <li key={artwork.id} className="flex items-center justify-between gap-5 py-4">
                <span className="font-medium">{artwork.title}</span>
                <span className="text-sm text-muted-foreground">
                  {artwork.is_public ? "Public" : "Private"}
                </span>
              </li>
            ))}
          </ul>
        )}
        {signOutError && (
          <p role="alert" className="mt-5 text-sm text-destructive">
            {signOutError}
          </p>
        )}
      </section>
    </main>
  );
}

function AdminLoading() {
  return <main className="min-h-screen bg-background" aria-label="Loading admin area" />;
}

function AdminError() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-5 text-center">
      <p className="font-serif text-2xl">The admin area couldn’t load.</p>
      <Button asChild variant="outline">
        <Link to="/">Return to gallery</Link>
      </Button>
    </main>
  );
}