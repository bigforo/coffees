# images/

Put your source photos here (`.heic` / `.HEIC` / `.heif`, or `.jpg/.png/.webp/.tiff`),
then generate the web-ready set:

```
npm run manifest
```

That command:
1. Converts each source image into `images/jpg/<name>.jpg`, **downscaled so the
   long edge is at most 2560px** (macOS `sips -Z 2560`). HEIC is converted to JPEG
   so it displays in every browser. Your originals in `images/` are left untouched.
2. Writes `manifest.json` — the sorted list of files in `images/jpg/` that the
   slideshow loads, in name order.

Layout:
- `images/` — your original photos (HEIC etc.)
- `images/jpg/` — generated, downscaled JPEGs actually shown in the slideshow
- `images/manifest.json` — the ordered file list the page fetches at startup

Re-run `npm run manifest` whenever you add or remove originals, then reload the
page. Conversion is skipped for any original that already has a matching JPEG.
