# Lyrics Viewer

A small dark-mode-first web page for browsing songs by your favorite artists
and reading their lyrics. No build step, no backend — just static
HTML/CSS/JS.

## Running it

Open `index.html` directly in a browser, or serve the folder locally:

```bash
cd lyrics-viewer
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## How it works

- **Favorite Artists** (left panel): add any artist name; it's saved in your
  browser's `localStorage` so it persists between visits. Click an artist to
  load their songs.
- **Songs**: fetched live from the [iTunes Search API](https://performance-partners.apple.com/search-api)
  (no API key required).
- **Lyrics**: fetched live from the free [lyrics.ovh](https://lyrics.ovh) API
  when you click a song.
- **Theme toggle** (top-right button): switches between dark mode (default)
  and light mode; your choice is remembered.

Since lyrics are fetched on demand from a public API rather than stored in
this repo, availability depends on that API having lyrics for a given track.
