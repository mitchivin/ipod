# iPod Classic

A fully interactive iPod Classic 5th Generation built for the web. Scroll the click wheel, browse your music library, and play tracks — all rendered in the browser with zero dependencies.

**[▶ Try it live](https://mitchivin.github.io/ipod/)**

## How It Works

The iPod shell — the aluminium body, click wheel, screen bezel, and button icons — was designed in **[DoodleDev](https://doodledev.app)**, a visual compiler that turns vector designs into production-ready HTML/CSS. This project is available as **Preset 2** inside DoodleDev if you want to explore or remix the shell yourself.

### Design to Logic
DoodleDev bridges the gap between high-fidelity design and production engineering. Instead of using AI to guess at a layout or fighting with "vibecoded" slop, developers start with a pixel-perfect, zero-dependency foundation that is clean enough to be adjusted manually or extended with complex logic. 

In this repository, the menu system, audio playback, and click wheel interaction were built directly onto the DoodleDev export. The resulting codebase is a precision instrument where visual intent and modular logic are perfectly aligned.

| Module | Responsibility |
|---|---|
| `config.js` | Application state, menu structure, element cache |
| `ui.js` | Menu rendering, slide transitions, dynamic lists |
| `controls.js` | Click wheel input, button binding, boot sequence |
| `player.js` | Queue management, playback, shuffle, progress bar |

## Features

- **Click Wheel Navigation** — Pointer-driven rotational input with dead zone detection and momentum
- **Full Menu Hierarchy** — Artists → Albums → Songs with smooth slide transitions
- **Now Playing Screen** — 3D album art, marquee scrolling for long titles, live progress bar
- **Shuffle & Repeat** — Fisher-Yates shuffle, repeat one/all modes
- **Lazy Artwork Loading** — Placeholder shown while album art loads
- **Responsive** — Scales to any viewport while maintaining aspect ratio

## Project Structure

```
├── index.html              # Single page entry point
├── css/
│   ├── global.css          # Reset, background, header/footer
│   ├── ipod.css            # Shell, wheel, button styles
│   ├── screen.css          # Status bar, battery, screen layout
│   ├── menu.css            # Menu items, selection highlight
│   └── now-playing.css     # Artwork, metadata, progress bar
├── js/
│   ├── config.js           # State + menu definitions
│   ├── ui.js               # Rendering + transitions
│   ├── controls.js         # Input handling + boot
│   ├── player.js           # Audio engine
│   └── library.json        # Song library data
└── public/
    ├── icons/              # SVG button icons
    ├── covers/             # Album artwork
    └── music/              # Audio files
```

## Running Locally

No build step. Just serve the files:

```bash
# Python
python -m http.server 8000

# Node
npx serve .
```

Then open `http://localhost:8000`.

> A local server is required because the app uses ES modules and `fetch()` for the music library, which don't work from `file://`.

## Tech Stack

- **HTML/CSS/JS** — Zero frameworks, zero dependencies, zero build tools
- **ES Modules** — Native browser module system
- **Web Audio** — Standard `<audio>` element for playback
- **DoodleDev** — Visual shell design ([doodledev.app](https://doodledev.app))

## Credits

Designed and built by **[Mitch Ivin](https://mitchivin.com/)**.

iPod shell designed in **[DoodleDev](https://doodledev.app)**.

## License

MIT
