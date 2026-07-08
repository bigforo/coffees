# Reel — Film-Strip Slideshow

An Angular single-page slideshow styled like a film strip. Images are loaded
from a generated manifest and cross-cut on a timer, with on-screen controls for
scrubbing, speed, play/pause, fullscreen, and per-image details.

## Structure

```
slideshow-site/
├── src/
│   ├── index.html                 # app host page
│   ├── main.ts                    # bootstrap
│   ├── styles.css                 # global styles + shared range-input styling
│   └── app/
│       ├── app.ts / app.html      # root: manifest loading, timer, navigation, keyboard/click
│       ├── app.css
│       ├── scrubber/              # bottom-center position slider (one step per image)
│       ├── speed-control/         # right-side vertical slider (seconds per slide)
│       ├── corner-controls/       # play/pause + fullscreen buttons (owns fullscreen state)
│       └── image-details/         # top-right info button + details panel
├── images/                        # source photos + generated JPEGs + manifest (see images/README.md)
├── public/                        # static assets copied as-is
├── angular.json                   # Angular CLI / build + serve config
└── package.json                   # scripts and dependencies
```

Each control is a standalone component. The root `App` owns the slideshow state
(image list, current index, play state, hold time) and passes it down via signal
`input()`s; components emit events back up (e.g. the scrubber's `scrubbed`, the
speed control's `changed`, the corner controls' `playToggled`).

## Running it

```bash
npm start          # ng serve — dev server with live reload
```

Then open the URL printed in the terminal (default `http://localhost:4200/`).
Useful `ng serve` flags:

- `--port <n>` — serve on a different port (e.g. `ng serve --port 4201`)
- `--open` / `-o` — open the app in your default browser automatically

## Images

Photos are not hard-coded. Drop originals into `images/`, then generate the
web-ready set and manifest:

```bash
npm run manifest
```

This converts/downscales sources into `images/jpg/` and writes
`images/manifest.json` — the ordered list the app fetches at startup. Re-run it
whenever you add or remove photos. See [images/README.md](images/README.md) for
the full workflow.

## Controls

- **Scrubber** (bottom center) — drag to jump to any image; one tick per photo.
- **Speed slider** (right edge) — seconds each image is held before advancing
  (0.1s–2s); larger values sit toward the top.
- **Play/pause & fullscreen** (bottom right).
- **Info button** (top right) — toggles a panel with the current image's index,
  filename, dimensions, megapixels, and aspect ratio.

Keyboard & pointer shortcuts:

- **← / →** — previous / next image
- **Space** — play / pause
- **F** — toggle fullscreen
- **Esc** — close the info panel
- **Click** anywhere (outside a control) — play / pause
- **Double-click** anywhere — toggle fullscreen

## Building

```bash
npm run build      # production build into dist/
```
