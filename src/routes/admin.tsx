import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Portfolio" },
      { name: "description", content: "Manage your portfolio artworks." },
    ],
  }),
  beforeLoad: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw redirect({ to: "/" });
    }
  },
  component: AdminPage,
});

function AdminPage() {
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        window.location.href = "/";
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-[1680px] items-center justify-between gap-6 px-5 pb-7 pt-10 sm:px-8 sm:pb-9 sm:pt-14 lg:px-12">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Admin
          </p>
          <h1 className="font-serif text-4xl font-normal leading-tight sm:text-5xl">
            Manage work
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/">View gallery</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      </header>

      <section
        aria-label="Artwork management"
        className="mx-auto max-w-[1680px] px-5 pb-16 sm:px-8 lg:px-12"
      >
        <div className="flex min-h-[48vh] items-center justify-center border-t border-border">
          <p className="font-serif text-2xl text-muted-foreground">
            Artwork management tools coming soon.
          </p>
        </div>
      </section>
    </main>
  );
}
