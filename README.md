# LMC Life After Chitown

A browser-based streamer simulation game. Built with Vite + TypeScript + Preact, runs entirely offline as a static site.

**Play online:** https://feilithekat.github.io/lmc_life_after_chitown/

---

## Local Development

**Requirements:** Node.js 20+, npm

```bash
# Clone
git clone https://github.com/FeiliTheKat/lmc_life_after_chitown.git
cd lmc_life_after_chitown

# Install dependencies
npm install

# Start dev server (hot reload)
npm run dev
```

Open http://localhost:5173 in your browser.

## Build

```bash
npm run build
```

Output goes to `dist/`. Any static file host works (GitHub Pages, Netlify, Vercel, or just open `dist/index.html` locally).

## Tests

```bash
npm test
```

## Tech Stack

- [Vite](https://vitejs.dev/) — build tool
- [Preact](https://preactjs.com/) — UI
- [TypeScript](https://www.typescriptlang.org/) — types
- [Vitest](https://vitest.dev/) — unit tests
