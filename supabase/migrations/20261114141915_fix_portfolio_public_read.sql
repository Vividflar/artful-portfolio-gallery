/*
# Restore public read access to portfolio storage bucket

## Problem
The third migration replaced the original "Anyone can read portfolio images" policy
(TO anon, authenticated) with an owner-only read policy. This broke image loading
for logged-out visitors on the public gallery — the public URL endpoint still works,
but any Supabase client call that goes through RLS (e.g. createSignedUrl) would fail
for anon. More importantly, the original requirement was that anyone can read from
the portfolio bucket.

## Changes
1. Drops the owner-only SELECT policy on storage.objects for the portfolio bucket.
2. Recreates the public SELECT policy so anon + authenticated can read portfolio images.
3. Keeps the owner-only INSERT, UPDATE, DELETE policies for write operations.

## Security
- SELECT: public (anon + authenticated) — intentional, the portfolio is a public gallery.
- INSERT/UPDATE/DELETE: owner-only (authenticated, owner_id = auth.uid()).
*/

DROP POLICY IF EXISTS "Owners can read portfolio image records" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read portfolio images" ON storage.objects;

CREATE POLICY "Anyone can read portfolio images" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'portfolio');
