# Image delivery

Pexels photos are referenced by their original `images.pexels.com` URLs in `src/lib/data.ts` and the homepage. The workspace network policy does not allow downloading from Pexels, so photo binaries are served directly from Pexels rather than copied into this directory. Attribution and license notes are in the root `image-credits.md` file.
