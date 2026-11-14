# Artful Portfolio Gallery

Connect to Supabase and set up the backend for a portfolio gallery.

Create an `artworks` table with: id (uuid, primary key), title (text, required),

description (text), tags (text array), image_path (text, required),

width (int), height (int), sort_order (int, default 0), created_at (timestamptz, default now()).

Create a PUBLIC Storage bucket called `portfolio` for the image files.

Row-level security:

- Anyone (including logged-out visitors) can SELECT from `artworks` and read from the `portfolio` bucket.

- Only authenticated users can INSERT, UPDATE or DELETE on `artworks`, and upload to or delete from the `portfolio` bucket.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3c60a8fc-adc1-4dce-9ff4-8144d1032bda).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
