CREATE TABLE public.artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  image_path TEXT NOT NULL,
  width INT,
  height INT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.artworks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.artworks TO authenticated;
GRANT ALL ON public.artworks TO service_role;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view artworks" ON public.artworks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated users can add artworks" ON public.artworks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can edit artworks" ON public.artworks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can remove artworks" ON public.artworks FOR DELETE TO authenticated USING (true);
CREATE POLICY "Service role can manage artworks" ON public.artworks FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can read portfolio images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'portfolio');
CREATE POLICY "Authenticated users can upload portfolio images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio');
CREATE POLICY "Authenticated users can delete portfolio images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'portfolio');