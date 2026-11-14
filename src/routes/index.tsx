import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

const artworksQueryOptions = queryOptions({
  queryKey: ["public-artworks"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("artworks")
      .select("id, title, description, tags, image_path, width, height")
      .eq("is_public", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Selected Work — Portfolio" },
      {
        name: "description",
        content: "A gallery of selected artwork and creative projects.",
      },
      { property: "og:title", content: "Selected Work — Portfolio" },
      {
        property: "og:description",
        content: "A gallery of selected artwork and creative projects.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(artworksQueryOptions),
  pendingComponent: GallerySkeleton,
  errorComponent: GalleryError,
  component: GalleryPage,
});

function GalleryPage() {
  const { data: artworks } = useSuspenseQuery(artworksQueryOptions);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const selectedArtwork = selectedIndex === null ? null : artworks[selectedIndex] ?? null;

  useEffect(() => {
    let isCurrent = true;
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setIsSignedIn(Boolean(session?.user));
      }
    });

    void supabase.auth.getUser().then(({ data }) => {
      if (isCurrent) setIsSignedIn(Boolean(data.user));
    });

    return () => {
      isCurrent = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (selectedIndex === null || artworks.length < 2) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setSelectedIndex((index) =>
          index === null ? null : (index + 1) % artworks.length,
        );
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setSelectedIndex((index) =>
          index === null ? null : (index - 1 + artworks.length) % artworks.length,
        );
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [artworks.length, selectedIndex]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-[1680px] items-end justify-between gap-6 px-5 pb-7 pt-10 sm:px-8 sm:pb-9 sm:pt-14 lg:px-12">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Portfolio
          </p>
          <h1 className="font-serif text-4xl font-normal leading-tight sm:text-5xl">
            Selected work
          </h1>
        </div>
        {artworks.length > 0 && (
          <p className="pb-1 text-sm tabular-nums text-muted-foreground">
            {artworks.length.toString().padStart(2, "0")} works
          </p>
        )}
        <Button asChild variant="ghost" size="sm" className="ml-auto">
          <Link to={isSignedIn ? "/admin" : "/login"}>
            {isSignedIn ? "Admin" : "Sign in"}
          </Link>
        </Button>
      </header>

      <section
        aria-label="Artwork gallery"
        className="mx-auto max-w-[1680px] px-5 pb-16 sm:px-8 lg:px-12"
      >
        {artworks.length === 0 ? (
          <div className="flex min-h-[48vh] items-center justify-center border-t border-border">
            <p className="font-serif text-2xl text-muted-foreground">No work added yet</p>
          </div>
        ) : (
          <div className="columns-1 gap-4 border-t border-border pt-5 sm:columns-2 sm:gap-5 lg:columns-3 2xl:columns-4">
            {artworks.map((artwork, index) => (
              <div key={artwork.id} className="mb-4 break-inside-avoid sm:mb-5">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedIndex(index)}
                  aria-label={`View ${artwork.title}`}
                  className="group block h-auto w-full overflow-hidden rounded-none p-0 text-left focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div
                    className="w-full overflow-hidden bg-muted"
                    style={{
                      aspectRatio:
                        artwork.width && artwork.height
                          ? `${artwork.width} / ${artwork.height}`
                          : "4 / 5",
                    }}
                  >
                    <img
                      src={getArtworkImageUrl(artwork.image_path)}
                      alt={artwork.title}
                      loading="lazy"
                      decoding="async"
                      width={artwork.width ?? undefined}
                      height={artwork.height ?? undefined}
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.015]"
                    />
                  </div>
                  <span className="block py-2 text-sm font-medium text-foreground">
                    {artwork.title}
                  </span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <Dialog
        open={selectedIndex !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedIndex(null);
        }}
      >
        {selectedArtwork && selectedIndex !== null && (
          <DialogContent className="max-h-[94svh] w-[min(96vw,84rem)] max-w-none overflow-hidden border-border bg-background p-0">
            <div className="flex max-h-[94svh] flex-col md:flex-row">
              <div className="relative flex min-h-0 flex-1 items-center justify-center bg-muted/40 p-3 sm:p-6">
                <img
                  src={getArtworkImageUrl(selectedArtwork.image_path)}
                  alt={selectedArtwork.title}
                  className="max-h-[58svh] w-full object-contain md:max-h-[84svh]"
                  width={selectedArtwork.width ?? undefined}
                  height={selectedArtwork.height ?? undefined}
                />
                {artworks.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      aria-label="Previous artwork"
                      title="Previous artwork (←)"
                      onClick={() =>
                        setSelectedIndex((selectedIndex - 1 + artworks.length) % artworks.length)
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 shadow-sm"
                    >
                      <ChevronLeft aria-hidden="true" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      aria-label="Next artwork"
                      title="Next artwork (→)"
                      onClick={() => setSelectedIndex((selectedIndex + 1) % artworks.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 shadow-sm"
                    >
                      <ChevronRight aria-hidden="true" />
                    </Button>
                  </>
                )}
              </div>
              <aside className="max-h-[34svh] shrink-0 overflow-y-auto border-t border-border px-6 py-6 md:max-h-[94svh] md:w-80 md:border-l md:border-t-0 md:px-7 md:py-10 lg:w-96">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {String(selectedIndex + 1).padStart(2, "0")} / {String(artworks.length).padStart(2, "0")}
                </p>
                <DialogTitle className="font-serif text-3xl font-normal leading-tight">
                  {selectedArtwork.title}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  {selectedArtwork.description || `Viewing ${selectedArtwork.title}`}
                </DialogDescription>
                {selectedArtwork.description && (
                  <p className="mt-5 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                    {selectedArtwork.description}
                  </p>
                )}
                {selectedArtwork.tags && selectedArtwork.tags.length > 0 && (
                  <ul aria-label="Tags" className="mt-7 flex flex-wrap gap-2">
                    {selectedArtwork.tags.map((tag) => (
                      <li
                        key={tag}
                        className="border border-border px-2.5 py-1 text-xs text-muted-foreground"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
              </aside>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </main>
  );
}

function GallerySkeleton() {
  return (
    <main className="mx-auto min-h-screen max-w-[1680px] px-5 pb-16 pt-10 sm:px-8 sm:pt-14 lg:px-12">
      <div className="mb-8">
        <Skeleton className="mb-4 h-3 w-20 rounded-none" />
        <Skeleton className="h-11 w-56 rounded-none" />
      </div>
      <div className="columns-1 gap-4 sm:columns-2 sm:gap-5 lg:columns-3 2xl:columns-4">
        {["4/5", "5/4", "3/4", "1/1", "4/5", "3/4", "5/4", "4/5"].map((ratio, index) => (
          <Skeleton
            key={`${ratio}-${index}`}
            className="mb-4 block w-full break-inside-avoid rounded-none sm:mb-5"
            style={{ aspectRatio: ratio }}
          />
        ))}
      </div>
    </main>
  );
}

function GalleryError() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-5 text-center">
      <p className="font-serif text-2xl">The gallery couldn’t load.</p>
      <Button variant="outline" onClick={() => router.invalidate()}>
        Try again
      </Button>
    </main>
  );
}

function getArtworkImageUrl(imagePath: string) {
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  return supabase.storage.from("portfolio").getPublicUrl(imagePath).data.publicUrl;
}