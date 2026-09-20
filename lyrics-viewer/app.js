const STORAGE_KEYS = {
  artists: "lyricsViewer.favoriteArtists",
  theme: "lyricsViewer.theme",
};

const DEFAULT_ARTISTS = ["Taylor Swift", "Coldplay", "Adele"];

const state = {
  artists: loadArtists(),
  activeArtist: null,
  songs: [],
  activeSong: null,
};

const els = {
  themeToggle: document.getElementById("themeToggle"),
  addArtistForm: document.getElementById("addArtistForm"),
  artistInput: document.getElementById("artistInput"),
  artistList: document.getElementById("artistList"),
  songsHeading: document.getElementById("songsHeading"),
  songsStatus: document.getElementById("songsStatus"),
  songList: document.getElementById("songList"),
  lyricsHeader: document.getElementById("lyricsHeader"),
  lyricsStatus: document.getElementById("lyricsStatus"),
  lyricsBody: document.getElementById("lyricsBody"),
};

initTheme();
renderArtists();
els.addArtistForm.addEventListener("submit", onAddArtist);
els.themeToggle.addEventListener("click", toggleTheme);

if (state.artists.length) {
  selectArtist(state.artists[0]);
}

function loadArtists() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.artists);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch (e) {
    /* ignore malformed storage */
  }
  return [...DEFAULT_ARTISTS];
}

function saveArtists() {
  try {
    localStorage.setItem(STORAGE_KEYS.artists, JSON.stringify(state.artists));
  } catch (e) {
    /* storage unavailable, ignore */
  }
}

function initTheme() {
  let theme = "dark";
  try {
    theme = localStorage.getItem(STORAGE_KEYS.theme) || "dark";
  } catch (e) {
    /* ignore */
  }
  applyTheme(theme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  els.themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
  try {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  } catch (e) {
    /* ignore */
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
}

function onAddArtist(event) {
  event.preventDefault();
  const name = els.artistInput.value.trim();
  if (!name) return;
  const exists = state.artists.some(
    (a) => a.toLowerCase() === name.toLowerCase()
  );
  if (!exists) {
    state.artists.push(name);
    saveArtists();
    renderArtists();
  }
  els.artistInput.value = "";
  selectArtist(name);
}

function removeArtist(name) {
  state.artists = state.artists.filter((a) => a !== name);
  saveArtists();
  if (state.activeArtist === name) {
    state.activeArtist = null;
    state.songs = [];
    state.activeSong = null;
    renderSongs();
    renderLyricsPlaceholder();
  }
  renderArtists();
}

function renderArtists() {
  els.artistList.innerHTML = "";
  state.artists.forEach((name) => {
    const li = document.createElement("li");
    li.className = "artist-row" + (name === state.activeArtist ? " active" : "");

    const label = document.createElement("span");
    label.textContent = name;
    label.style.overflow = "hidden";
    label.style.textOverflow = "ellipsis";
    label.style.whiteSpace = "nowrap";

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "✕";
    removeBtn.title = `Remove ${name}`;
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeArtist(name);
    });

    li.appendChild(label);
    li.appendChild(removeBtn);
    li.addEventListener("click", () => selectArtist(name));
    els.artistList.appendChild(li);
  });
}

async function selectArtist(name) {
  state.activeArtist = name;
  state.activeSong = null;
  renderArtists();
  renderLyricsPlaceholder();
  els.songsHeading.textContent = `Songs — ${name}`;
  els.songList.innerHTML = "";
  setStatus(els.songsStatus, "Loading songs…");

  try {
    const songs = await fetchTopSongs(name);
    state.songs = songs;
    if (!songs.length) {
      setStatus(els.songsStatus, "No songs found for this artist.", true);
    } else {
      setStatus(els.songsStatus, "");
    }
    renderSongs();
  } catch (err) {
    setStatus(els.songsStatus, "Couldn't load songs. Try again later.", true);
  }
}

async function fetchTopSongs(artist) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
    artist
  )}&entity=song&attribute=artistTerm&limit=25`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("iTunes lookup failed");
  const data = await res.json();
  const seen = new Set();
  const songs = [];
  for (const item of data.results || []) {
    const key = `${item.trackName}::${item.artistName}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    songs.push({
      title: item.trackName,
      artist: item.artistName,
      album: item.collectionName,
    });
  }
  return songs;
}

function renderSongs() {
  els.songList.innerHTML = "";
  state.songs.forEach((song) => {
    const li = document.createElement("li");
    li.className =
      "song-row" +
      (state.activeSong &&
      state.activeSong.title === song.title &&
      state.activeSong.artist === song.artist
        ? " active"
        : "");

    const title = document.createElement("span");
    title.textContent = song.title;

    const album = document.createElement("span");
    album.className = "track-album";
    album.textContent = song.album || "";

    li.appendChild(title);
    li.appendChild(album);
    li.addEventListener("click", () => selectSong(song));
    els.songList.appendChild(li);
  });
}

async function selectSong(song) {
  state.activeSong = song;
  renderSongs();

  els.lyricsHeader.innerHTML = "";
  const titleEl = document.createElement("div");
  titleEl.className = "title";
  titleEl.textContent = song.title;
  const artistEl = document.createElement("div");
  artistEl.className = "artist";
  artistEl.textContent = song.artist;
  els.lyricsHeader.appendChild(titleEl);
  els.lyricsHeader.appendChild(artistEl);

  els.lyricsBody.textContent = "";
  setStatus(els.lyricsStatus, "Loading lyrics…");

  try {
    const lyrics =
      (await fetchLyricsOvh(song.artist, song.title)) ||
      (await fetchLyricsLrclib(song.artist, song.title));
    if (!lyrics) {
      setStatus(els.lyricsStatus, "Lyrics not found for this track.", true);
    } else {
      setStatus(els.lyricsStatus, "");
      els.lyricsBody.textContent = lyrics;
    }
  } catch (err) {
    setStatus(els.lyricsStatus, "Couldn't load lyrics. Try again later.", true);
  }
}

async function fetchLyricsOvh(artist, title) {
  try {
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(
      artist
    )}/${encodeURIComponent(title)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.lyrics ? data.lyrics.trim() : null;
  } catch (err) {
    return null;
  }
}

// lyrics.ovh has thin coverage for Mandopop/Cantopop; lrclib.net's
// crowd-sourced catalog (built for karaoke/LRC apps) fills that gap.
async function fetchLyricsLrclib(artist, title) {
  try {
    const url = `https://lrclib.net/api/search?track_name=${encodeURIComponent(
      title
    )}&artist_name=${encodeURIComponent(artist)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const results = await res.json();
    if (!Array.isArray(results) || !results.length) return null;
    const match =
      results.find((r) => r.plainLyrics) || results.find((r) => r.syncedLyrics);
    if (!match) return null;
    if (match.plainLyrics) return match.plainLyrics.trim();
    return match.syncedLyrics
      .replace(/^\[[\d:.]+\]\s*/gm, "")
      .trim();
  } catch (err) {
    return null;
  }
}

function renderLyricsPlaceholder() {
  els.lyricsHeader.innerHTML = "";
  els.lyricsBody.textContent = "";
  setStatus(els.lyricsStatus, "Pick a song to see its lyrics.");
}

function setStatus(el, message, isError) {
  el.textContent = message || "";
  el.classList.toggle("error", Boolean(isError));
}
