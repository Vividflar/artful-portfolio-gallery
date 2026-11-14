ALTER TABLE public.artworks
  ADD COLUMN owner_id UUID DEFAULT auth.uid(),
  ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT true;

DROP POLICY IF EXISTS "Anyone can view artworks" ON public.artworks;
DROP POLICY IF EXISTS "Authenticated users can add artworks" ON public.artworks;
DROP POLICY IF EXISTS "Authenticated users can edit artworks" ON public.artworks;
DROP POLICY IF EXISTS "Authenticated users can remove artworks" ON public.artworks;

CREATE POLICY "Anyone can view public artworks" ON public.artworks
  FOR SELECT TO anon USING (is_public = true);
CREATE POLICY "Signed-in users can view public or owned artworks" ON public.artworks
  FOR SELECT TO authenticated USING (is_public = true OR owner_id = (SELECT auth.uid()));
CREATE POLICY "Users can add owned artworks" ON public.artworks
  FOR INSERT TO authenticated WITH CHECK (owner_id = (SELECT auth.uid()));
CREATE POLICY "Owners can edit artworks" ON public.artworks
  FOR UPDATE TO authenticated USING (owner_id = (SELECT auth.uid())) WITH CHECK (owner_id = (SELECT auth.uid()));
CREATE POLICY "Owners can remove artworks" ON public.artworks
  FOR DELETE TO authenticated USING (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Anyone can read portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update portfolio images" ON storage.objects;

CREATE POLICY "Owners can read portfolio image records" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'portfolio' AND owner_id = (SELECT auth.uid()::text));
CREATE POLICY "Users can upload owned portfolio images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio' AND owner_id = (SELECT auth.uid()::text));
CREATE POLICY "Owners can update portfolio images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'portfolio' AND owner_id = (SELECT auth.uid()::text)) WITH CHECK (bucket_id = 'portfolio' AND owner_id = (SELECT auth.uid()::text));
CREATE POLICY "Owners can delete portfolio images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'portfolio' AND owner_id = (SELECT auth.uid()::text));